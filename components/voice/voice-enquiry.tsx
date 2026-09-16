"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { normalisePhoneInput } from "@/lib/voice/phone";
import { Mic, MicOff, PhoneOff, ArrowUpRight } from "lucide-react";

type Saved = { id: string; token: string; voiceAvailable: boolean; maxSeconds: number };
type Stage = "form" | "saving" | "ready" | "connecting" | "active" | "ended";

export function VoiceEnquiry({ available }: { available: boolean }) {
  const [countryCode, setCountryCode] = useState("+91");
  const [stage, setStage] = useState<Stage>("form");
  const [saved, setSaved] = useState<Saved>();
  const [notice, setNotice] = useState("");
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [caption, setCaption] = useState("");
  const media = useRef<MediaStream | null>(null);
  const peer = useRef<RTCPeerConnection | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const session = useRef<Saved | null>(null);
  const abort = useRef<AbortController | null>(null);
  const ended = useRef(false);
  const clock = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function release() {
    abort.current?.abort();
    if (clock.current) clearInterval(clock.current);
    if (timeout.current) clearTimeout(timeout.current);
    media.current?.getTracks().forEach(track => track.stop());
    peer.current?.close();
    if (audio.current) audio.current.srcObject = null;
  }
  async function finish(message = "Thank you. Your enquiry is saved for Suchay to review.", outcome = "COMPLETED") {
    if (ended.current) return;
    ended.current = true;
    release();
    setStage("ended");
    setNotice(message);
    const current = session.current;
    if (current) {
      try {
        const response = await fetch(`/api/voice/enquiries/${current.id}/end`, { method: "POST", headers: { Authorization: `Bearer ${current.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ outcome }), keepalive: true });
        if (!response.ok) setNotice("Your contact details and message are saved. The conversation summary may be delayed.");
      } catch { setNotice("Your contact details and message are saved. The conversation summary may be delayed."); }
    }
  }
  useEffect(() => {
    const close = () => {
      ended.current = true;
      abort.current?.abort();
      if (clock.current) clearInterval(clock.current);
      if (timeout.current) clearTimeout(timeout.current);
      media.current?.getTracks().forEach(track => track.stop());
      peer.current?.close();
      const current = session.current;
      if (current) void fetch(`/api/voice/enquiries/${current.id}/end`, { method: "POST", headers: { Authorization: `Bearer ${current.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ outcome: "INTERRUPTED" }), keepalive: true }).catch(() => undefined);
    };
    window.addEventListener("pagehide", close);
    return () => { window.removeEventListener("pagehide", close); close(); };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStage("saving"); setNotice("");
    const form = new FormData(event.currentTarget);
    const phone = normalisePhoneInput(String(form.get("phone") ?? ""), countryCode);
    if (!/^\+[1-9]\d{7,14}$/.test(phone) || (phone.startsWith("+91") && !/^\+91[6-9]\d{9}$/.test(phone))) {
      setStage("form");
      setNotice(phone.startsWith("+91") ? "Please enter a valid 10-digit Indian mobile number." : "Please check your mobile number and selected country.");
      return;
    }
    const textOnly = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "message";
    try {
      const response = await fetch("/api/voice/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), phone, reason: form.get("reason"), message: form.get("message"), website: form.get("website"), consent: form.get("consent") === "on" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Couldn’t save your enquiry. Please try again.");
      setSaved(result); session.current = result;
      if (textOnly || !result.voiceAvailable) { setStage("ended"); setNotice("Your enquiry is saved for Suchay to review. Thank you for reaching out."); }
      else { setStage("ready"); setNotice("Your contact details and message are saved. You can now start a voice conversation."); }
    } catch (error) { setStage("form"); setNotice(error instanceof Error ? error.message : "Please try again."); }
  }

  async function start() {
    if (!saved) return;
    ended.current = false;
    setStage("connecting"); setNotice("");
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) throw new Error("This browser doesn’t support voice. Your written enquiry is already saved.");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      if (ended.current) { stream.getTracks().forEach(track => track.stop()); return; }
      media.current = stream;
      const pc = new RTCPeerConnection(); peer.current = pc;
      pc.ontrack = event => {
        if (audio.current) { audio.current.srcObject = event.streams[0]; void audio.current.play().catch(() => setNotice("Tap Play audio below to hear the assistant.")); }
      };
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      const channel = pc.createDataChannel("oai-events");
      channel.onopen = () => {
        if (ended.current) return;
        if (timeout.current) clearTimeout(timeout.current);
        setStage("active");
        const started = Date.now();
        clock.current = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
        timeout.current = setTimeout(() => { void finish("Your conversation time is up. Your enquiry and conversation have been saved.", "LIMIT_REACHED"); }, saved.maxSeconds * 1000);
        channel.send(JSON.stringify({ type: "response.create", response: { instructions: "Greet the visitor as Suchay’s AI assistant, say their enquiry has been saved, and ask what they would like to discuss. Do not claim to be Suchay." } }));
      };
      channel.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "response.output_audio_transcript.done") setCaption(data.transcript);
          if (data.type === "error") void finish("The voice conversation was interrupted. Your enquiry is saved.", "INTERRUPTED");
        } catch { /* Ignore non-JSON events. */ }
      };
      pc.onconnectionstatechange = () => {
        if (!ended.current && ["failed", "disconnected", "closed"].includes(pc.connectionState)) void finish("The connection ended. Your enquiry is saved for Suchay.", "INTERRUPTED");
      };
      const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
      abort.current = new AbortController();
      timeout.current = setTimeout(() => { void finish("Voice took too long to connect. Your enquiry is saved.", "INTERRUPTED"); }, 45000);
      const response = await fetch(`/api/voice/enquiries/${saved.id}/session`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${saved.token}` }, body: JSON.stringify({ sdp: offer.sdp }), signal: abort.current.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Voice couldn’t connect. Your enquiry is saved.");
      if (!ended.current) await pc.setRemoteDescription({ type: "answer", sdp: result.sdp });
    } catch (error) {
      if (ended.current) return;
      const message = error instanceof DOMException && error.name === "NotAllowedError" ? "Microphone access wasn’t allowed. Your written enquiry is still saved for Suchay." : error instanceof Error ? error.message : "Voice couldn’t connect. Your written enquiry is saved.";
      void finish(message, "INTERRUPTED");
    }
  }

  return <section className="voice-section" id="voice" aria-labelledby="voice-heading">
    <div className="voice-intro"><p className="eyebrow"><span /> A conversation starts here</p><h2 id="voice-heading">Talk to my<br /><em>AI assistant.</em></h2><p>Ask about my work, discuss an opportunity, or leave a project enquiry. I’ll review your details and the conversation in person.</p><div className="voice-facts"><span>Browser voice · no phone call</span><span>Your enquiry reaches my private inbox</span></div><p className="voice-small">Prefer email? <a href="mailto:suchayjanbandhu@gmail.com">Write to Suchay <ArrowUpRight size={14} aria-hidden="true" /></a></p></div>
    <div className="voice-panel">
      {(stage === "form" || stage === "saving") ? <form onSubmit={save}>
        <p className="eyebrow">Before we talk</p><h3>A quick introduction.</h3><p>Leave your details so Suchay can follow up after your conversation.</p>
        <fieldset disabled={stage === "saving"} className="voice-fields">
          <label>Your name<input name="name" autoComplete="name" placeholder="What should we call you?" required minLength={2} maxLength={100} /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@company.com" required maxLength={254} /></label>
          <div className="voice-phone-field voice-wide"><label htmlFor="voice-phone">Mobile number</label><div className="voice-phone-row"><select aria-label="Country calling code" value={countryCode} onChange={event => setCountryCode(event.target.value)}><option value="+91">India (+91)</option><option value="+1">US / Canada (+1)</option><option value="+44">UK (+44)</option><option value="+971">UAE (+971)</option><option value="+65">Singapore (+65)</option><option value="+61">Australia (+61)</option><option value="">Another country</option></select><input id="voice-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder={countryCode === "+91" ? "98765 43210" : countryCode ? "Mobile number" : "+country code and number"} required minLength={6} maxLength={30} aria-describedby="voice-phone-hint" /></div><small id="voice-phone-hint">{countryCode === "+91" ? "Just your 10-digit mobile number. We’ll add +91." : countryCode ? "Country code is already selected. You can also paste a full international number." : "Enter the full number, including + and your country code."}</small></div>
          <label className="voice-wide">What brings you here?<select name="reason" required defaultValue=""><option value="" disabled>Choose a topic</option><option>Hiring</option><option>Project enquiry</option><option>Collaboration</option><option>Other</option></select></label>
          <label className="voice-wide">What would you like to discuss?<textarea name="message" required minLength={10} maxLength={1500} rows={3} placeholder="Tell me about the role, project, or question you have in mind." /></label>
          <label className="voice-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <label className="voice-consent voice-wide"><input name="consent" type="checkbox" required /><span>I agree to share my contact details and message with Suchay for follow-up. If I start voice, OpenAI processes the audio, and a transcript and AI summary are saved in Suchay’s private inbox. This is an AI assistant, not a live call with Suchay. <a href="/privacy">Privacy details</a></span></label>
        </fieldset>
        {!available && <p className="voice-small">Voice is currently unavailable. You can still send your enquiry below.</p>}
        <div className="voice-actions"><button className="btn btn-primary" disabled={stage === "saving"} value={available ? "voice" : "message"}>{stage === "saving" ? "Saving…" : available ? "Continue to voice" : "Send enquiry"}<ArrowUpRight size={16} aria-hidden="true" /></button>{available && <button className="btn btn-secondary" disabled={stage === "saving"} value="message">Send a message instead</button>}</div>
      </form> : <div className="voice-session">
        <p className="eyebrow">{stage === "ended" ? "Enquiry saved" : "Your conversation"}</p><Mic size={38} strokeWidth={1.3} aria-hidden="true" /><h3>{stage === "ready" ? "Ready when you are." : stage === "connecting" ? "Connecting…" : stage === "active" ? "You’re speaking with AI." : "Thank you for reaching out."}</h3>
        {stage === "ready" && <><p>Your microphone will be requested next. You can speak for up to {Math.ceil((saved?.maxSeconds ?? 180) / 60)} minutes.</p><button className="btn btn-primary" onClick={start}>Start voice conversation <Mic size={16} aria-hidden="true" /></button></>}
        {stage === "active" && <><p className="voice-timer">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} / {Math.ceil((saved?.maxSeconds ?? 180) / 60)} min</p><p className="voice-caption">{caption || "Say hello, or ask a question about Suchay’s work."}</p><button className="btn btn-secondary" aria-pressed={muted} onClick={() => { const next = !muted; media.current?.getAudioTracks().forEach(track => { track.enabled = !next; }); setMuted(next); }}>{muted ? <Mic size={16} /> : <MicOff size={16} />}{muted ? "Unmute" : "Mute"}</button></>}
        {(stage === "active" || stage === "connecting") && <button className="btn btn-primary" onClick={() => void finish()}><PhoneOff size={16} aria-hidden="true" />End conversation</button>}
      </div>}
      {/* Assistant speech is displayed as text immediately above the audio controls. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audio} autoPlay controls={stage === "active"} aria-label="Assistant audio" />
      {notice && <p className="voice-notice" role="status">{notice}</p>}
    </div>
  </section>;
}
