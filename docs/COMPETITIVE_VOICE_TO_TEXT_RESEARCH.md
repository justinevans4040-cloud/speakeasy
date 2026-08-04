# SpeakEasy Competitive Voice-to-Text Research

Research date: 2026-08-03

## Product position

SpeakEasy should compete as a private, local-first Windows dictation room: no account, no subscription, no cloud transcript, and a distinctive interface that feels like a product rather than a utility panel.

## What leading products offer

| Product | Competitive strengths | Source |
| --- | --- | --- |
| Dragon Professional | High-accuracy professional dictation, custom vocabulary, voice commands, document workflows | https://dragon.nuance.com/en-us/dragon-professional |
| Otter | Live transcription, speaker identification, summaries, collaboration, meeting integrations | https://otter.ai/ and https://otter.ai/pricing |
| Descript | Transcript-based editing, filler-word removal, audio cleanup, captions | https://www.descript.com/ |
| Windows Voice Access | On-device dictation and control, automatic punctuation, profanity filtering, vocabulary, microphone and language settings | https://support.microsoft.com/en-us/accessibility/windows/voice-access/fluid-dictation and https://support.microsoft.com/en-us/accessibility/windows/voice-access/voice-access-command-list |
| Apple Dictation | Multilingual dictation, punctuation, formatting, capitalization and symbol commands | https://support.apple.com/guide/mac-help/use-dictation-mh40584/mac and https://support.apple.com/guide/mac-help/commands-for-dictating-text-on-mac-mh40695/mac |
| Google Docs Voice Typing | Voice punctuation, editing and document-formatting commands | https://support.google.com/docs/answer/4492226?hl=en |
| Notta | Live/file transcription, speaker ID, custom vocabulary, bilingual transcription, summaries and translation | https://www.notta.ai/en/pricing |
| Wispr Flow | Any-app dictation, personal dictionary, learned corrections, snippets and writing styles | https://wisprflow.ai/features and https://wisprflow.ai/data-controls |
| Superwhisper | Any-app dictation, offline/cloud models, 100+ languages, custom modes and prompts | https://superwhisper.com/ and https://superwhisper.com/docs/modes/custom |
| MacWhisper | Local transcription, multiple models, 100 languages, file transcription, SRT/VTT and automation | https://www.macwhisper.com/ |

## Minimum credible feature set

### Implemented in this build

- Local on-device Whisper transcription with cached model files.
- Editable transcript with local draft autosave.
- Four-second rolling transcription segments for faster visible results.
- Fast, Balanced and Best Accuracy local model choices.
- Raw and Polished post-processing modes.
- Optional filler-word cleanup, smart capitalization and profanity masking.
- Custom spoken-text replacements.
- Microphone selection, permission test and live input meter.
- Noise suppression and echo cancellation controls.
- TXT, Markdown and JSON export.
- Text-size, contrast and reduced-motion controls.
- Explicit local-data deletion.

### Next engine-level work

1. True streaming partial words instead of chunk-by-chunk results.
2. Multilingual Whisper models and automatic language detection.
3. Windows-wide hotkey and dictation into any application.
4. Correction learning and a durable personal dictionary.
5. Spoken editing commands: select, replace, undo, new paragraph and punctuation.
6. File transcription plus SRT/VTT export.
7. Optional speaker separation for meetings and interviews.

### Deliberately deferred

- Meeting bots, cloud collaboration and AI summaries.
- Cloud transcript storage.
- Subscription-gated core dictation.

Those additions would increase scope and weaken the local-first promise before accuracy, latency and system-wide dictation are competitive.
