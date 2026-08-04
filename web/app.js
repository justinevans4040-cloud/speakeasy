// SpeakEasy Application Logic — On-Device Whisper & AudioWorklet

import { env as transformersEnv, pipeline } from "./vendor/transformers/transformers.min.js";

const DRAFT_KEY = "speakeasy_draft_v1";
const SETTINGS_KEY = "speakeasy_settings_v1";

const DEFAULT_SETTINGS = {
  language: "en-US", quality: "balanced", livePreview: true,
  autoPunctuation: true, smartCapitalization: true, removeFillers: false,
  profanityFilter: false, defaultMode: "raw", customVocabulary: "",
  replacements: "", applyReplacements: true, microphone: "default",
  noiseSuppression: true, echoCancellation: true, silenceSensitivity: "4",
  autoSave: true, retainAudio: false, exportFormat: "txt", includeDate: true,
  textSize: "standard", highContrast: false, reducedMotion: false, audioCues: false,
};

// UI Element Handles
const ui = {
  statusBadge: document.getElementById("statusBadge"),
  statusText: document.getElementById("statusText"),
  progressWrap: document.getElementById("progressWrap"),
  progressLabel: document.getElementById("progressLabel"),
  progressPct: document.getElementById("progressPct"),
  progressBarFill: document.getElementById("progressBarFill"),
  restoreBanner: document.getElementById("restoreBanner"),
  btnRestore: document.getElementById("btnRestore"),
  btnDismissRestore: document.getElementById("btnDismissRestore"),
  btnMic: document.getElementById("btnMic"),
  btnMicLabel: document.getElementById("btnMicLabel"),
  recordTimer: document.getElementById("recordTimer"),
  btnCopy: document.getElementById("btnCopy"),
  btnSave: document.getElementById("btnSave"),
  btnClear: document.getElementById("btnClear"),
  btnNewSession: document.getElementById("btnNewSession"),
  btnDeleteLocalData: document.getElementById("btnDeleteLocalData"),
  transcriptEditor: document.getElementById("transcriptEditor"),
  wordCount: document.getElementById("wordCount"),
  charCount: document.getElementById("charCount"),
  confirmModal: document.getElementById("confirmModal"),
  confirmModalText: document.getElementById("confirmModalText"),
  btnConfirmCancel: document.getElementById("btnConfirmCancel"),
  btnConfirmOk: document.getElementById("btnConfirmOk"),
  dictationView: document.getElementById("dictationView"),
  settingsView: document.getElementById("settingsView"),
  btnOpenSettings: document.getElementById("btnOpenSettings"),
  btnBackToDictation: document.getElementById("btnBackToDictation"),
  settingsForm: document.getElementById("settingsForm"),
  btnRestoreDefaults: document.getElementById("btnRestoreDefaults"),
  btnTestMicrophone: document.getElementById("btnTestMicrophone"),
  micMeterFill: document.getElementById("micMeterFill"),
  micTestStatus: document.getElementById("micTestStatus"),
  settingMicrophone: document.getElementById("settingMicrophone"),
};

// Application State
let transcriber = null;
let wantListen = false;
let mediaStream = null;
let audioCtx = null;
let workletNode = null;
let sourceNode = null;
let pcmChunks = [];
let sampleRate = 16000;
let queue = Promise.resolve();
let timerInterval = null;
let recordSeconds = 0;
let pendingConfirmAction = null;
let previouslyFocusedElement = null;
let settings = loadSettings();
let micTestStream = null;

const TARGET_SR = 16000;
const MAX_BUFFER_SECONDS = 4;
const SILENCE_RMS = 0.01;

function setStatus(text, mode = "ready") {
  ui.statusText.textContent = text;
  ui.statusBadge.dataset.mode = mode;
}

function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function applySettings() {
  document.body.dataset.textSize = settings.textSize;
  document.body.dataset.highContrast = String(Boolean(settings.highContrast));
  document.body.dataset.reducedMotion = String(Boolean(settings.reducedMotion));
  ui.btnSave.textContent = `Save ${settings.exportFormat.toUpperCase()}`;
}

function populateSettingsForm() {
  for (const [key, value] of Object.entries(settings)) {
    const fields = ui.settingsForm.elements.namedItem(key);
    if (!fields) continue;
    if (typeof value === "boolean") fields.checked = value;
    else if (fields instanceof RadioNodeList) fields.value = value;
    else fields.value = value;
  }
}

function readSettingsForm() {
  const form = new FormData(ui.settingsForm);
  const next = { ...settings };
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (typeof DEFAULT_SETTINGS[key] === "boolean") {
      next[key] = Boolean(ui.settingsForm.elements.namedItem(key)?.checked);
    } else {
      next[key] = String(form.get(key) ?? DEFAULT_SETTINGS[key]);
    }
  }
  return next;
}

function showView(name) {
  const inSettings = name === "settings";
  ui.dictationView.hidden = inSettings;
  ui.settingsView.hidden = !inSettings;
  if (inSettings) {
    populateSettingsForm();
    enumerateMicrophones();
  }
  window.scrollTo({ top: 0, behavior: settings.reducedMotion ? "auto" : "smooth" });
}

function postProcessTranscript(input) {
  let text = input.trim();
  if (settings.removeFillers || settings.defaultMode === "polished") {
    text = text.replace(/\b(?:um+|uh+|erm|like,?|you know)\b[ ,]*/gi, "").replace(/\s{2,}/g, " ");
  }
  if (settings.applyReplacements && settings.replacements.trim()) {
    for (const line of settings.replacements.split("\n")) {
      const [spoken, ...replacement] = line.split("=");
      if (!spoken?.trim() || !replacement.length) continue;
      text = text.replace(new RegExp(spoken.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), replacement.join("=").trim());
    }
  }
  if (settings.smartCapitalization && text) text = text[0].toUpperCase() + text.slice(1);
  if (settings.profanityFilter) text = text.replace(/\b(fuck(?:ing|ed|er|s)?|shit(?:ty)?|damn)\b/gi, (word) => "•".repeat(word.length));
  return text;
}

function updateWordAndCharCounts(text) {
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).length : 0;
  const chars = clean.length;
  ui.wordCount.textContent = `${words} word${words === 1 ? "" : "s"}`;
  ui.charCount.textContent = `${chars} char${chars === 1 ? "" : "s"}`;
}

function saveDraft() {
  if (!settings.autoSave) return;
  const current = ui.transcriptEditor.innerText;
  if (current.trim()) {
    localStorage.setItem(DRAFT_KEY, current);
  } else {
    localStorage.removeItem(DRAFT_KEY);
  }
}

function checkSavedDraft() {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (saved && saved.trim()) {
    ui.restoreBanner.hidden = false;
  }
}

function formatTimer(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function startTimer() {
  stopTimer();
  recordSeconds = 0;
  ui.recordTimer.textContent = "00:00";
  timerInterval = setInterval(() => {
    recordSeconds++;
    ui.recordTimer.textContent = formatTimer(recordSeconds);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// 9 Failure Modes Error Handler
function handleFailure(mode, details = "") {
  let title = "Error";
  let msg = details;

  switch (mode) {
    case "mic_denied":
      title = "Microphone Denied";
      msg = "Microphone access was denied. Please allow microphone permissions in your browser/OS settings.";
      break;
    case "no_mic":
      title = "No Microphone Found";
      msg = "No audio input device detected. Please connect a microphone and retry.";
      break;
    case "download_fail":
      title = "Model Download Failed";
      msg = "Could not download the Whisper AI model. Please check your internet connection and retry.";
      break;
    case "init_fail":
      title = "Initialization Error";
      msg = "Failed to initialize the local speech recognition engine.";
      break;
    case "unsupported_hardware":
      title = "Hardware Unsupported";
      msg = "Your browser does not support WebAssembly or AudioWorklet required for local AI processing.";
      break;
    case "insufficient_ram":
      title = "Memory Exhausted";
      msg = "Insufficient RAM available to process the audio chunk safely.";
      break;
    case "offline_first_launch":
      title = "First Launch Offline";
      msg = "The initial run requires internet connectivity once to download the 40MB Whisper model. Subsequent runs work 100% offline.";
      break;
    case "transcribe_fail":
      title = "Transcription Error";
      msg = "An error occurred while transcribing the audio chunk.";
      break;
    case "export_fail":
      title = "Export Failed";
      msg = "Could not generate or download the TXT file.";
      break;
  }

  setStatus(title, "err");
  console.error(`[SpeakEasy Error] ${mode}: ${msg}`, details);
}

// Model Loading & Caching
async function ensureEngine() {
  if (transcriber) return transcriber;

  if (!navigator.onLine && !localStorage.getItem("speakeasy_model_cached")) {
    handleFailure("offline_first_launch");
    throw new Error("First launch requires internet connectivity.");
  }

  ui.progressWrap.hidden = false;
  ui.progressLabel.textContent = "Downloading the private speech model (~40MB)…";
  setStatus("Downloading Model", "live");

  try {
    transformersEnv.allowLocalModels = false;
    transformersEnv.useBrowserCache = true;

    const modelByQuality = {
      fast: "Xenova/whisper-tiny.en",
      balanced: "Xenova/whisper-base.en",
      best: "Xenova/whisper-small.en",
    };
    transcriber = await pipeline(
      "automatic-speech-recognition",
      modelByQuality[settings.quality] || modelByQuality.balanced,
      {
        progress_callback: (p) => {
          if (!p) return;
          if (p.status === "progress" && p.progress != null) {
            const pct = Math.max(0, Math.min(100, Math.round(p.progress)));
            ui.progressBarFill.style.width = `${pct}%`;
            ui.progressPct.textContent = `${pct}%`;
            ui.progressBarFill.parentElement.setAttribute("aria-valuenow", String(pct));
          } else if (p.status === "ready") {
            ui.progressBarFill.style.width = "100%";
            ui.progressPct.textContent = "100%";
            ui.progressBarFill.parentElement.setAttribute("aria-valuenow", "100");
          }
        },
      }
    );

    localStorage.setItem("speakeasy_model_cached", "true");
    ui.progressWrap.hidden = true;
    setStatus("Engine Ready");
    return transcriber;
  } catch (err) {
    ui.progressWrap.hidden = true;
    handleFailure("download_fail", err.message);
    throw err;
  }
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

function flushPcm(force = false) {
  if (!pcmChunks.length) return;
  const totalSamples = pcmChunks.reduce((n, c) => n + c.length, 0);
  const merged = new Float32Array(totalSamples);
  let offset = 0;
  for (const c of pcmChunks) {
    merged.set(c, offset);
    offset += c.length;
  }
  pcmChunks = [];

  const level = rms(merged);
  if (!force && level < SILENCE_RMS) return;

  const audio16k = downsampleTo16k(merged, sampleRate);
  enqueueTranscribe(audio16k);
}

function enqueueTranscribe(audio) {
  queue = queue.then(async () => {
    if (!audio || audio.length < TARGET_SR * 0.3) return;
    try {
      setStatus("Transcribing…", "live");
      const engine = await ensureEngine();
      const result = await engine(audio, {
        chunk_length_s: 15,
        stride_length_s: 3,
        return_timestamps: false,
      });

      const text = postProcessTranscript((result && result.text ? result.text : "")
        .replace(/\[BLANK_AUDIO\]/gi, "")
        .trim());

      if (text) {
        const current = ui.transcriptEditor.innerText.trim();
        const space = current && !/\s$/.test(current) ? " " : "";
        ui.transcriptEditor.innerText = (current ? current + space : "") + text;
        updateWordAndCharCounts(ui.transcriptEditor.innerText);
        saveDraft();
      }
    } catch (err) {
      handleFailure("transcribe_fail", err.message);
    } finally {
      if (wantListen) {
        setStatus("Listening", "live");
      } else {
        setStatus("Ready");
      }
    }
  });
}

// AudioWorklet Dictation Logic
async function startListening() {
  if (!window.AudioContext && !window.webkitAudioContext) {
    handleFailure("unsupported_hardware");
    return;
  }

  try {
    await ensureEngine();
  } catch (err) {
    return;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: settings.microphone !== "default" ? { exact: settings.microphone } : undefined,
        channelCount: 1,
        echoCancellation: settings.echoCancellation,
        noiseSuppression: settings.noiseSuppression,
        autoGainControl: true,
      },
      video: false,
    });
  } catch (err) {
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      handleFailure("mic_denied");
    } else {
      handleFailure("no_mic", err.message);
    }
    return;
  }

  wantListen = true;
  ui.btnMic.classList.add("listening");
  ui.btnMic.setAttribute("aria-pressed", "true");
  ui.btnMicLabel.textContent = "Stop dictating";
  ui.btnMic.setAttribute("aria-label", "Stop dictating");
  setStatus("Listening", "live");
  startTimer();

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  sampleRate = audioCtx.sampleRate;
  sourceNode = audioCtx.createMediaStreamSource(mediaStream);

  try {
    await audioCtx.audioWorklet.addModule("./audio-processor.js");
    workletNode = new AudioWorkletNode(audioCtx, "speakeasy-audio-processor");

    workletNode.port.onmessage = (event) => {
      if (!wantListen) return;
      if (event.data && event.data.type === "audio_data") {
        const chunk = event.data.buffer;
        pcmChunks.push(chunk);

        // Cap buffer memory bounds to prevent uncontrolled growth
        const bufferedSec = (pcmChunks.reduce((n, c) => n + c.length, 0) / sampleRate);
        if (bufferedSec >= MAX_BUFFER_SECONDS) {
          flushPcm(true);
        }
      }
    };

    sourceNode.connect(workletNode);
    workletNode.connect(audioCtx.destination);
  } catch (err) {
    console.warn("AudioWorklet failed, using fallback:", err);
    // Graceful fallback if AudioWorklet module fails
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (e) => {
      if (!wantListen) return;
      const input = e.inputBuffer.getChannelData(0);
      pcmChunks.push(new Float32Array(input));
      const bufferedSec = (pcmChunks.reduce((n, c) => n + c.length, 0) / sampleRate);
      if (bufferedSec >= 3) flushPcm(true);
    };
    sourceNode.connect(processor);
    processor.connect(audioCtx.destination);
  }
}

async function stopListening() {
  wantListen = false;
  ui.btnMic.classList.remove("listening");
  ui.btnMic.setAttribute("aria-pressed", "false");
  ui.btnMicLabel.textContent = "Start dictating";
  ui.btnMic.setAttribute("aria-label", "Start dictating");
  stopTimer();

  flushPcm(true);
  await queue;

  if (workletNode) {
    try { workletNode.disconnect(); } catch (_) {}
    workletNode = null;
  }
  if (sourceNode) {
    try { sourceNode.disconnect(); } catch (_) {}
    sourceNode = null;
  }
  if (audioCtx) {
    try { await audioCtx.close(); } catch (_) {}
    audioCtx = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }

  setStatus("Ready");
}

// Confirmation Modal Helper
function showConfirmation(text, onOk) {
  ui.confirmModalText.textContent = text;
  pendingConfirmAction = onOk;
  previouslyFocusedElement = document.activeElement;
  ui.confirmModal.hidden = false;
  ui.btnConfirmCancel.focus();
}

function hideConfirmation() {
  ui.confirmModal.hidden = true;
  pendingConfirmAction = null;
  if (previouslyFocusedElement instanceof HTMLElement) previouslyFocusedElement.focus();
  previouslyFocusedElement = null;
}

async function enumerateMicrophones() {
  if (!navigator.mediaDevices?.enumerateDevices) return;
  try {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
    const current = settings.microphone;
    ui.settingMicrophone.innerHTML = '<option value="default">System default</option>';
    devices.forEach((device, index) => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.textContent = device.label || `Microphone ${index + 1}`;
      ui.settingMicrophone.append(option);
    });
    ui.settingMicrophone.value = [...ui.settingMicrophone.options].some((option) => option.value === current) ? current : "default";
  } catch {
    ui.micTestStatus.textContent = "Device list unavailable";
  }
}

async function testMicrophone() {
  if (micTestStream) {
    micTestStream.getTracks().forEach((track) => track.stop());
    micTestStream = null;
  }
  ui.micTestStatus.textContent = "Listening…";
  try {
    micTestStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    await enumerateMicrophones();
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    context.createMediaStreamSource(micTestStream).connect(analyser);
    const levels = new Uint8Array(analyser.frequencyBinCount);
    const started = performance.now();
    const draw = () => {
      analyser.getByteFrequencyData(levels);
      const average = levels.reduce((sum, value) => sum + value, 0) / levels.length;
      ui.micMeterFill.style.width = `${Math.min(100, average * 1.7)}%`;
      if (performance.now() - started < 5000) requestAnimationFrame(draw);
      else {
        micTestStream?.getTracks().forEach((track) => track.stop());
        micTestStream = null;
        context.close();
        ui.micTestStatus.textContent = average > 2 ? "Microphone working" : "No input detected";
      }
    };
    draw();
  } catch (error) {
    ui.micTestStatus.textContent = "Microphone permission required";
  }
}

// Event Listeners
ui.btnOpenSettings.addEventListener("click", () => showView("settings"));
ui.btnBackToDictation.addEventListener("click", () => showView("dictation"));

document.querySelectorAll("[data-settings-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("[data-settings-tab]").forEach((item) => item.classList.toggle("active", item === tab));
    document.querySelectorAll("[data-settings-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.settingsPanel === tab.dataset.settingsTab));
  });
});

ui.settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const previousQuality = settings.quality;
  settings = readSettingsForm();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  if (previousQuality !== settings.quality) transcriber = null;
  applySettings();
  showView("dictation");
  setStatus("Settings Saved");
  setTimeout(() => setStatus("Ready"), 1500);
});

ui.btnRestoreDefaults.addEventListener("click", () => {
  settings = { ...DEFAULT_SETTINGS };
  populateSettingsForm();
  applySettings();
});

ui.btnTestMicrophone.addEventListener("click", testMicrophone);

document.getElementById("btnClearPrivacyData").addEventListener("click", () => {
  showConfirmation("Delete the local transcript and all saved SpeakEasy settings from this device?", () => {
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    settings = { ...DEFAULT_SETTINGS };
    ui.transcriptEditor.innerText = "";
    updateWordAndCharCounts("");
    populateSettingsForm();
    applySettings();
  });
});

ui.btnMic.addEventListener("click", () => {
  if (wantListen) stopListening();
  else startListening();
});

ui.btnCopy.addEventListener("click", async () => {
  const text = ui.transcriptEditor.innerText.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    setStatus("Copied to Clipboard");
    setTimeout(() => setStatus("Ready"), 1500);
  } catch (err) {
    setStatus("Copy Failed", "err");
  }
});

ui.btnSave.addEventListener("click", () => {
  const text = ui.transcriptEditor.innerText.trim();
  if (!text) return;
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const format = settings.exportFormat;
    const payload = format === "json"
      ? JSON.stringify({ transcript: text, createdAt: new Date().toISOString() }, null, 2)
      : format === "md"
        ? `# SpeakEasy transcript\n\n${text}\n`
        : text + "\n";
    const mime = format === "json" ? "application/json" : "text/plain;charset=utf-8";
    const blob = new Blob([payload], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const datePart = settings.includeDate ? `-${timestamp}` : "";
    a.download = `speakeasy-transcript${datePart}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus(`Saved ${format.toUpperCase()}`);
    setTimeout(() => setStatus("Ready"), 1500);
  } catch (err) {
    handleFailure("export_fail", err.message);
  }
});

ui.btnClear.addEventListener("click", () => {
  const current = ui.transcriptEditor.innerText.trim();
  if (!current) return;
  showConfirmation("Are you sure you want to clear the current transcript?", () => {
    ui.transcriptEditor.innerText = "";
    updateWordAndCharCounts("");
    saveDraft();
    setStatus("Transcript Cleared");
    setTimeout(() => setStatus("Ready"), 1500);
  });
});

ui.btnNewSession.addEventListener("click", () => {
  const current = ui.transcriptEditor.innerText.trim();
  if (current) {
    showConfirmation("Start a new session? Unsaved text will be cleared.", () => {
      if (wantListen) stopListening();
      ui.transcriptEditor.innerText = "";
      updateWordAndCharCounts("");
      saveDraft();
      setStatus("New Session Started");
      setTimeout(() => setStatus("Ready"), 1500);
    });
  } else {
    ui.transcriptEditor.innerText = "";
    updateWordAndCharCounts("");
    setStatus("New Session Started");
    setTimeout(() => setStatus("Ready"), 1500);
  }
});

ui.btnRestore.addEventListener("click", () => {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (saved) {
    ui.transcriptEditor.innerText = saved;
    updateWordAndCharCounts(saved);
    ui.restoreBanner.hidden = true;
    setStatus("Draft Restored");
    setTimeout(() => setStatus("Ready"), 1500);
  }
});

ui.btnDismissRestore.addEventListener("click", () => {
  ui.restoreBanner.hidden = true;
});

ui.btnDeleteLocalData.addEventListener("click", () => {
  showConfirmation("Delete all locally stored drafts and model cache keys?", () => {
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem("speakeasy_model_cached");
    ui.transcriptEditor.innerText = "";
    updateWordAndCharCounts("");
    setStatus("Local Data Deleted");
    setTimeout(() => setStatus("Ready"), 1500);
  });
});

ui.btnConfirmCancel.addEventListener("click", hideConfirmation);
ui.btnConfirmOk.addEventListener("click", () => {
  if (pendingConfirmAction) pendingConfirmAction();
  hideConfirmation();
});

ui.transcriptEditor.addEventListener("input", () => {
  updateWordAndCharCounts(ui.transcriptEditor.innerText);
  saveDraft();
});

// Keyboard Shortcuts
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !ui.confirmModal.hidden) {
    e.preventDefault();
    hideConfirmation();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    ui.btnMic.click();
  }
});

// Clean up audio tracks on window unload
window.addEventListener("beforeunload", () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
  }
});

// Initial Setup
applySettings();
populateSettingsForm();
checkSavedDraft();
updateWordAndCharCounts(ui.transcriptEditor.innerText);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {});
  });
}
