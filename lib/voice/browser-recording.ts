import { audioType, MAX_AUDIO_BYTES, MAX_AUDIO_PARTS, MAX_PART_BYTES } from "./recording-format";

type Session = { id: string; token: string };
type Part = { blob: Blob; saved: boolean };
export class ConversationRecorder {
  private context: AudioContext;
  private destination: MediaStreamAudioDestinationNode;
  private recorder: MediaRecorder;
  private sources: MediaStreamAudioSourceNode[] = [];
  private parts: Part[] = [];
  private queue: Promise<void> = Promise.resolve();
  private finishing?: Promise<{ saved: boolean; partial: boolean }>;
  private bytes = 0;
  private truncated = false;
  private abandoned = false;
  private mime: string;
  constructor(private session: Session, stream: MediaStream) {
    if (!window.MediaRecorder || !window.AudioContext) throw new Error("This browser can’t record voice. Your written enquiry is saved; please use a current browser or email.");
    const format = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus"].find(type => MediaRecorder.isTypeSupported(type));
    if (!format) throw new Error("This browser’s audio recording format isn’t supported. Your written enquiry is saved.");
    this.context = new AudioContext();
    this.destination = this.context.createMediaStreamDestination();
    this.mime = audioType(format);
    try {
      this.addStream(stream);
      this.recorder = new MediaRecorder(this.destination.stream, { mimeType: format, audioBitsPerSecond: 64000 });
    } catch (error) { this.sources.forEach(source => source.disconnect()); void this.context.close(); throw error; }
    this.recorder.ondataavailable = event => {
      for (let offset = 0; offset < event.data.size; offset += MAX_PART_BYTES) {
        const blob = event.data.slice(offset, offset + MAX_PART_BYTES, this.mime);
        if (this.bytes + blob.size > MAX_AUDIO_BYTES || this.parts.length >= MAX_AUDIO_PARTS) { this.truncated = true; break; }
        this.bytes += blob.size;
        const part = { blob, saved: false }; const index = this.parts.length;
        this.parts.push(part);
        this.queue = this.queue.then(async () => { part.saved = await this.upload(index, part.blob); });
      }
    };
    this.recorder.onerror = () => { this.truncated = true; };
  }
  addStream(stream: MediaStream) {
    const source = this.context.createMediaStreamSource(stream);
    source.connect(this.destination);
    this.sources.push(source);
  }
  async start() { await this.context.resume(); this.recorder.start(5000); }
  private async upload(index: number, blob: Blob) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(`/api/voice/enquiries/${this.session.id}/recording?part=${index}`, {
          method: "POST", headers: { Authorization: `Bearer ${this.session.token}`, "Content-Type": this.mime },
          body: blob, keepalive: this.abandoned, signal: AbortSignal.timeout(8000),
        });
        await response.arrayBuffer();
        if (response.ok) return true;
        if (response.status < 500 && response.status !== 429) return false;
      } catch { /* Retry a transient upload failure. */ }
    }
    return false;
  }
  stop(abandoned = false) {
    if (this.finishing) return this.finishing;
    this.abandoned = abandoned;
    const stopped = this.recorder.state === "inactive" ? Promise.resolve() : new Promise<void>(resolve => {
      const timer = setTimeout(() => { this.truncated = true; resolve(); }, 3000);
      this.recorder.addEventListener("stop", () => { clearTimeout(timer); resolve(); }, { once: true });
      this.recorder.stop();
    });
    this.finishing = (async () => {
      try {
        await stopped;
        await this.queue;
        if (!abandoned) {
          for (const [index, part] of this.parts.entries()) if (!part.saved) part.saved = await this.upload(index, part.blob);
        }
        if (!this.parts.length) return { saved: false, partial: true };
        const response = await fetch(`/api/voice/enquiries/${this.session.id}/recording/complete`, {
          method: "POST", headers: { Authorization: `Bearer ${this.session.token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ parts: this.parts.length, complete: !abandoned && !this.truncated && this.parts.every(part => part.saved) }), keepalive: true,
          signal: AbortSignal.timeout(90000),
        });
        if (!response.ok) return { saved: false, partial: true };
        return await response.json() as { saved: boolean; partial: boolean };
      } catch { return { saved: false, partial: true }; }
      finally { this.sources.forEach(source => source.disconnect()); await this.context.close().catch(() => undefined); }
    })();
    return this.finishing;
  }
}
