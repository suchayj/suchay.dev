"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const countries = [
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+1", name: "US / Canada", flag: "🇺🇸" },
  { code: "+44", name: "UK", flag: "🇬🇧" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "", name: "Another country", flag: "🌐" },
];

export function CountryCodeSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const selected = countries.find(country => country.code === value) ?? countries[0];

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  useEffect(() => { if (open) options.current[active]?.focus(); }, [open, active]);

  function show() {
    setActive(Math.max(0, countries.findIndex(country => country.code === value)));
    setOpen(true);
  }
  function choose(code: string) {
    onChange(code);
    setOpen(false);
    trigger.current?.focus();
  }

  return <div className="voice-country" ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }}>
    <button ref={trigger} type="button" className="voice-country-trigger" aria-label={`Country calling code: ${selected.name}${selected.code ? ` (${selected.code})` : ""}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={id} onClick={() => open ? setOpen(false) : show()} onKeyDown={event => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); show(); }
    }}><span aria-hidden="true">{selected.flag}</span><span>{selected.code || "Other"}</span><ChevronDown size={15} aria-hidden="true" /></button>
    {open && <div id={id} className="voice-country-menu" role="listbox" tabIndex={-1} aria-label="Country calling code" onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); }
      else if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setActive(index => (index + (event.key === "ArrowDown" ? 1 : -1) + countries.length) % countries.length); }
      else if (event.key === "Home" || event.key === "End") { event.preventDefault(); setActive(event.key === "Home" ? 0 : countries.length - 1); }
      else if (event.key.length === 1 && /[a-z]/i.test(event.key)) {
        const next = countries.findIndex(country => country.name.toLowerCase().startsWith(event.key.toLowerCase()));
        if (next >= 0) { event.preventDefault(); setActive(next); }
      }
    }}>{countries.map((country, index) => <button key={country.code} ref={element => { options.current[index] = element; }} type="button" role="option" aria-selected={country.code === value} tabIndex={active === index ? 0 : -1} onFocus={() => setActive(index)} onClick={() => choose(country.code)}><span aria-hidden="true">{country.flag}</span><span>{country.name}</span><small>{country.code}</small>{country.code === value && <Check size={14} aria-hidden="true" />}</button>)}</div>}
  </div>;
}
