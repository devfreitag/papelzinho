"use client";

import { useState } from "react";
import { CopyIcon } from "./ui";
import { btnSmall } from "./styles";

/** Copia o endereço completo de um caminho deste site (ex.: /g/abc). */
export function CopyButton({ path, children }: { path: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={copy} className={`${btnSmall} w-fit gap-2`}>
      {copied ? "Copiado!" : children}
      <CopyIcon done={copied} />
    </button>
  );
}
