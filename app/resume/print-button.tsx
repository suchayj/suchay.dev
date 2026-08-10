"use client";

import { useState } from "react";

export function PrintButton() {
  const [preparing, setPreparing] = useState(false);

  async function printResume() {
    setPreparing(true);
    await document.fonts?.ready;
    window.requestAnimationFrame(() => {
      setPreparing(false);
      window.print();
    });
  }

  return (
    <button className="btn btn-primary resume-print-button" type="button" onClick={printResume} disabled={preparing}>
      {preparing ? "Preparing…" : "Print / Save as PDF"} <span aria-hidden="true">↗</span>
    </button>
  );
}
