# SpeakEasy — Microsoft Store Materials Draft

## Application Title
**SpeakEasy — Private Voice Dictation**

## Short Description (100 characters)
Fast, private on-device voice-to-text dictation powered by local AI. No cloud required.

## Full Description
SpeakEasy is a premium, Prohibition-era styled desktop voice-to-text dictation application designed for speed, complete privacy, and effortless productivity. Powered by on-device Whisper AI, SpeakEasy converts your speech into editable text in real time directly on your computer.

Unlike conventional dictation software, SpeakEasy processes 100% of your audio locally. Your voice data never leaves your computer, ensuring total security and privacy for confidential notes, writing, and professional dictation.

### Key Features:
- **100% Private & Local:** All speech recognition runs on your machine using WebAssembly and local neural models.
- **On-Device Whisper AI:** High-accuracy AI speech-to-text dictation.
- **Prohibition-Era Art Deco UI:** Elegant black and gold workspace designed for focus.
- **Automatic Draft Safety:** Auto-saves your progress continuously so you never lose a word.
- **AudioWorklet Architecture:** High-efficiency, low-latency audio capture.
- **One-Click Export:** Copy to clipboard or export directly as UTF-8 `.txt` files.
- **Full Offline Capability:** After a one-time initial model download (~40MB), SpeakEasy operates 100% offline.

---

## Disclosures & Technical Details

### Microphone Disclosure
SpeakEasy requires access to your microphone solely to perform real-time speech recognition. Microphone input is processed in memory on your device and is never recorded to disk or transmitted to external servers.

### Local Audio Processing Explanation
All speech processing is executed locally via WebAssembly ONNX inference runtime. Audio buffers are discarded immediately after transcription.

### First-Run Model Download & Internet Disclosure
On first launch, SpeakEasy requires an active internet connection once to download the 40MB Whisper AI model weights from HuggingFace. Once downloaded, model weights are persistently cached locally in your browser storage, allowing all future dictation sessions to run completely offline.

### Privacy Policy
SpeakEasy does not collect, store, track, or transmit any user data, transcripts, telemetry, or analytics. Your transcripts stay strictly on your device.

### Support Information
For assistance or bug reports, visit the official canonical GitHub repository:  
`https://github.com/justinevans4040-cloud/speakeasy`
