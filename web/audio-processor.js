class SpeakEasyAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bytesWritten = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input.length) return true;

    const channelData = input[0];
    if (!channelData) return true;

    let i = 0;
    while (i < channelData.length) {
      const remaining = this.bufferSize - this.bytesWritten;
      const copyCount = Math.min(remaining, channelData.length - i);
      this.buffer.set(channelData.subarray(i, i + copyCount), this.bytesWritten);
      this.bytesWritten += copyCount;
      i += copyCount;

      if (this.bytesWritten >= this.bufferSize) {
        this.port.postMessage({
          type: "audio_data",
          buffer: this.buffer.slice(0)
        });
        this.bytesWritten = 0;
      }
    }

    return true;
  }
}

registerProcessor("speakeasy-audio-processor", SpeakEasyAudioProcessor);
