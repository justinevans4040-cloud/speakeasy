import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

env.allowLocalModels = false;
env.useBrowserCache = true;

const STATUS = {
  statusEl: document.getElementById("status"),
  hintEl: document.getElementById("hint"),
  engineLabel: document.getElementById("engineLabel"),
  engineMeta: document.getElementById("engineLabelMeta"),
  loadBar: document.getElementById("loadBar"),
  loadWrap: document.getElementById("loadWrap"),
};

const ui = {
  transcriptEl: document.getElementById("transcript"),
  wordCountEl: document.getElementById("wordCount"),
  langEl: document.getElementById("lang"),
  btnMic: document.getElementById("btnMic"),
  btnStop: document.getElementById("btnStop"),
  btnCopy: document.getElementById("btnCopy"),
  btnClear: document.getElementById("btnClear"),
  btnSave: document.getElementById("btnSave"),
  modeEl: document.getElementById("mode"),
};

let transcriber = null;
let wantListen = false;
let finalText = "";
let mediaStream = null;
let audioCtx = null;
let processor = null;
let sourceNode = null;
let pcmChunks = [];
let sampleRate = 16000;
let transcribing = false;
let queue = Promise.resolve();
let speechMs = 0;
let silenceMs = 0;
let lastHadSpeech = false;

const TARGET_SR = 16000;
const CHUNK_MS = 2800;
const SILENCE_RMS = 0.012;
const MIN_SPEECH_MS = 450;

function setStatus(text, mode) {
  STATUS.statusEl.textContent = text;
  STATUS.statusEl.classList.toggle("live", mode === "live");
  STATUS.statusEl.classList.toggle("err", mode === "err");
}

function countWords(text) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render(interim) {
  const plain =
    finalText +
    (interim ? (finalText && !/\s$/.test(finalText) ? " " : "") + interim : "");
  ui.transcriptEl.innerHTML =
    escapeHtml(finalText) +
    (interim
      ? (finalText ? " " : "") +
        '<span class="interim">' +
        escapeHtml(interim) +
        "</span>"
      : "");
  ui.wordCountEl.textContent = countWords(plain) + " words";
  ui.transcriptEl.scrollTop = ui.transcriptEl.scrollHeight;
}

function syncFinalFromEditor() {
  finalText = ui.transcriptEl.innerText.replace(/\u00a0/g, " ");
}

function appendFinal(chunk) {
  const text = String(chunk || "")
    .replace(/\[BLANK_AUDIO\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return;
  if (!finalText) finalText = text;
  else {
    const needsSpace = !/\s$/.test(finalText) && !/^[,.;:!?]/.test(text);
    finalText += (needsSpace ? " " : "") + text;
  }
  render("");
}

function setListeningUi(on) {
  ui.btnMic.classList.toggle("listening", on);
  ui.btnMic.setAttribute("aria-pressed", on ? "true" : "false");
  ui.btnMic.setAttribute("aria-label", on ? "Stop listening" : "Start listening");
  ui.btnStop.disabled = !on;
  if (on) {
    setStatus("Listening", "live");
    STATUS.hintEl.textContent =
      "Whisper is running on-device in chunks. Keep talking — tap Stop when done.";
  } else {
    setStatus("Ready");
    STATUS.hintEl.textContent =
      "Tap the mic to dictate. First run downloads a small on-device model (~40MB), then it stays cached.";
  }
}

async function ensureEngine() {
  if (transcriber) return transcriber;
  STATUS.loadWrap.hidden = false;
  STATUS.engineLabel.textContent = "Loading Whisper…";
  setStatus("Loading engine…", "live");

  transcriber = await pipeline(
    "automatic-speech-recognition",
    "Xenova/whisper-tiny.en",
    {
      progress_callback: (p) => {
        if (!p) return;
        if (p.status === "progress" && p.progress != null) {
          const pct = Math.max(0, Math.min(100, Math.round(p.progress)));
          STATUS.loadBar.style.width = pct + "%";
          STATUS.engineLabel.textContent = "Downloading " + pct + "%";
        } else if (p.status === "ready") {
          STATUS.loadBar.style.width = "100%";
        }
      },
    },
  );

  STATUS.loadWrap.hidden = true;
  STATUS.engineLabel.textContent = "Whisper tiny.en (on-device)";
  if (STATUS.engineMeta) STATUS.engineMeta.textContent = "Whisper tiny.en (on-device)";
  setStatus("Ready");
  return transcriber;
}

function downsampleTo16k(float32, inputRate) {
  if (inputRate === TARGET_SR) return float32;
  const ratio = inputRate / TARGET_SR;
  const newLen = Math.floor(float32.length / ratio);
  const out = new Float32Array(newLen);
  for (let i = 0; i < newLen; i++) {
    out[i] = float32[Math.floor(i * ratio)];
  }
  return out;
}

function rms(buf) {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  return Math.sqrt(sum / Math.max(1, buf.length));
}

function flushPcm(force) {
  if (!pcmChunks.length) return;
  const total = pcmChunks.reduce((n, c) => n + c.length, 0);
  const merged = new Float32Array(total);
  let off = 0;
  for (const c of pcmChunks) {
    merged.set(c, off);
    off += c.length;
  }
  pcmChunks = [];
  speechMs = 0;
  silenceMs = 0;
  lastHadSpeech = false;

  const level = rms(merged);
  if (!force && level < SILENCE_RMS) return;

  const audio = downsampleTo16k(merged, sampleRate);
  enqueueTranscribe(audio);
}

function enqueueTranscribe(audio) {
  queue = queue.then(async () => {
    if (!audio || audio.length < TARGET_SR * 0.25) return;
    transcribing = true;
    try {
      const engine = await ensureEngine();
      const result = await engine(audio, {
        chunk_length_s: 15,
        stride_length_s: 3,
        return_timestamps: false,
      });
      appendFinal(result && result.text ? result.text : "");
    } catch (err) {
      console.error(err);
      setStatus("Transcribe error", "err");
      STATUS.hintEl.textContent = String(err && err.message ? err.message : err);
    } finally {
      transcribing = false;
      if (wantListen) setStatus("Listening", "live");
    }
  });
}

async function startListening() {
  try {
    await ensureEngine();
  } catch (err) {
    setStatus("Engine failed", "err");
    STATUS.hintEl.textContent =
      "Could not load Whisper. Check network once for the model download, then retry.";
    console.error(err);
    return;
  }

  wantListen = true;
  setListeningUi(true);
  syncFinalFromEditor();
  pcmChunks = [];
  speechMs = 0;
  silenceMs = 0;

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
  } catch (err) {
    wantListen = false;
    setListeningUi(false);
    setStatus("Mic blocked", "err");
    STATUS.hintEl.textContent = "Allow microphone access and try again.";
    return;
  }

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  sampleRate = audioCtx.sampleRate;
  sourceNode = audioCtx.createMediaStreamSource(mediaStream);
  processor = audioCtx.createScriptProcessor(4096, 1, 1);
  const mute = audioCtx.createGain();
  mute.gain.value = 0;

  processor.onaudioprocess = (event) => {
    if (!wantListen) return;
    const input = event.inputBuffer.getChannelData(0);
    const copy = new Float32Array(input.length);
    copy.set(input);
    pcmChunks.push(copy);

    const level = rms(copy);
    const frameMs = (input.length / sampleRate) * 1000;
    if (level >= SILENCE_RMS) {
      speechMs += frameMs;
      silenceMs = 0;
      lastHadSpeech = true;
    } else if (lastHadSpeech) {
      silenceMs += frameMs;
    }

    const bufferedMs =
      (pcmChunks.reduce((n, c) => n + c.length, 0) / sampleRate) * 1000;

    // Cut on pause after speech, or hard-cap chunk length for continuous talk
    if (lastHadSpeech && silenceMs >= 420 && speechMs >= MIN_SPEECH_MS) {
      flushPcm(true);
    } else if (bufferedMs >= CHUNK_MS) {
      flushPcm(true);
    }
  };

  sourceNode.connect(processor);
  processor.connect(mute);
  mute.connect(audioCtx.destination);
}

async function stopListening() {
  wantListen = false;
  flushPcm(true);
  await queue;

  if (processor) {
    try {
      processor.disconnect();
    } catch (_) {}
    processor.onaudioprocess = null;
    processor = null;
  }
  if (sourceNode) {
    try {
      sourceNode.disconnect();
    } catch (_) {}
    sourceNode = null;
  }
  if (audioCtx) {
    try {
      await audioCtx.close();
    } catch (_) {}
    audioCtx = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
  setListeningUi(false);
}

ui.btnMic.addEventListener("click", () => {
  if (wantListen) stopListening();
  else startListening();
});
ui.btnStop.addEventListener("click", () => stopListening());

ui.btnCopy.addEventListener("click", async () => {
  syncFinalFromEditor();
  try {
    await navigator.clipboard.writeText(ui.transcriptEl.innerText.trim());
    setStatus("Copied");
    setTimeout(() => {
      if (!wantListen) setStatus("Ready");
    }, 900);
  } catch (_) {
    setStatus("Copy failed", "err");
  }
});

ui.btnClear.addEventListener("click", () => {
  finalText = "";
  ui.transcriptEl.innerHTML = "";
  ui.wordCountEl.textContent = "0 words";
  setStatus("Cleared");
  setTimeout(() => {
    if (!wantListen) setStatus("Ready");
  }, 700);
});

ui.btnSave.addEventListener("click", () => {
  syncFinalFromEditor();
  const text = ui.transcriptEl.innerText.trim();
  const blob = new Blob([text + "\n"], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.href = url;
  a.download = "speakeasy-" + stamp + ".txt";
  a.click();
  URL.revokeObjectURL(url);
});

ui.transcriptEl.addEventListener("input", () => {
  if (!wantListen) {
    finalText = ui.transcriptEl.innerText;
    ui.wordCountEl.textContent = countWords(finalText) + " words";
  }
});

// Warm the engine in background after first paint
ensureEngine().catch(() => {
  STATUS.engineLabel.textContent = "Engine idle — will load on first mic tap";
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {});
  });
}
