"use client";
import { useState } from "react";
export function EnquiryAudio({ id, state, consent }: { id: string; state: string; consent: boolean }) {
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  if (!consent) return null;
  // The adjacent provider transcript supplies the text alternative for this audio-only recording.
  /* eslint-disable jsx-a11y/media-has-caption */
  return <section className="enquiry-audio"><h3>Conversation recording</h3><p>{state === "PARTIAL" ? "Partial recording · the visitor left or the connection ended before saving finished." : state === "READY" ? "Visitor and assistant audio · private recording." : state === "UPLOADING" ? "Audio is being saved. If the conversation was interrupted, the saved portion can be recovered shortly." : "No audio was captured."}</p>{state !== "NONE" && <><button type="button" className="btn btn-secondary" onClick={() => { setError(""); setSource(`/api/career/enquiries/${id}/audio?request=${Date.now()}`); }}>{source ? "Refresh recording" : "Load recording"}</button>{source && <audio key={source} controls preload="metadata" src={source} onError={() => setError("Audio isn’t ready yet, or the playback link expired. Refresh the recording to try again.")} aria-label="Visitor and assistant conversation" />}<p role="status">{error}</p></>}</section>;
}
