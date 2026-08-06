"use client";

import Image from "next/image";
import { useState } from "react";

type PhotoFrameProps = {
  src: string;
  alt: string;
  label: string;
  sizes: string;
  priority?: boolean;
  objectPosition?: string;
  className?: string;
};

export function PhotoFrame({ src, alt, label, sizes, priority = false, objectPosition = "50% 30%", className = "" }: PhotoFrameProps) {
  const [missing, setMissing] = useState(false);
  return (
    <figure className={`about-photo ${missing ? "is-missing" : ""} ${className}`.trim()}>
      {!missing && <Image src={src} alt={alt} fill sizes={sizes} priority={priority} style={{ objectPosition }} onError={() => setMissing(true)} />}
      <div className="photo-placeholder" aria-hidden={!missing}>
        <span>Original photograph</span>
        <strong>{label}</strong>
        <small>Place image in public/images/about</small>
      </div>
      <figcaption><span>{label}</span><i>Authentic image · no generative edits</i></figcaption>
    </figure>
  );
}
