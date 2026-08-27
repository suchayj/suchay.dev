"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

const emailSubject = "Hello Suchay — reaching out from suchay.dev";
const emailBody = `Hi Suchay,

I came across your website and wanted to get in touch.

[Write your message here]

Regards,
[Your name]`;
const emailHref = `mailto:suchayjanbandhu@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

type ContactContextValue = { openContact: (trigger: HTMLElement) => void };
const ContactContext = createContext<ContactContextValue | null>(null);

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const continueRef = useRef<HTMLAnchorElement>(null);

  const closeContact = () => {
    setOpen(false);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => continueRef.current?.focus());
    } else if (!open && dialog.open) {
      dialog.close();
      triggerRef.current?.focus();
    }
  }, [open]);

  return <ContactContext.Provider value={{ openContact: (trigger) => { triggerRef.current = trigger; setOpen(true); } }}>
    {children}
    <dialog
      className="contact-dialog"
      ref={dialogRef}
      aria-labelledby="contact-dialog-title"
      aria-describedby="contact-dialog-description"
      onCancel={(event) => { event.preventDefault(); closeContact(); }}
      onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); closeContact(); } }}
    >
      <div className="contact-dialog-inner">
        <p className="eyebrow"><span /> Contact Suchay</p>
        <h2 id="contact-dialog-title">Open your email app?</h2>
        <p id="contact-dialog-description">A ready-to-edit message will open in your default email application.</p>
        <div className="contact-dialog-actions">
          <button className="btn btn-secondary" type="button" onClick={closeContact}>Cancel</button>
          <a className="btn btn-primary" ref={continueRef} href={emailHref} onClick={() => setOpen(false)}>Continue to email <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </dialog>
  </ContactContext.Provider>;
}

export function ContactTrigger({ className, children }: { className?: string; children: React.ReactNode }) {
  const context = useContext(ContactContext);
  if (!context) throw new Error("ContactTrigger must be used inside ContactProvider");

  return <button className={`contact-trigger${className ? ` ${className}` : ""}`} type="button" onClick={(event) => context.openContact(event.currentTarget)}>{children}</button>;
}
