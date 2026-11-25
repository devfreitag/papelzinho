"use client";

import { useState } from "react";
import { btnSmall } from "./styles";

export function ShareButtons({
  name,
  token,
  groupName,
}: {
  name: string;
  token: string;
  groupName: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = () => `${window.location.origin}/p/${token}`;

  async function copy() {
    await navigator.clipboard.writeText(url());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function whatsapp() {
    const text = `Oi ${name}! 🎄 Você está no amigo secreto "${groupName}".\nAbra seu link pessoal para descobrir quem você tirou (não mostre pra ninguém!):\n${url()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={whatsapp} className={btnSmall}>
        Enviar no WhatsApp ↗
      </button>
      <button type="button" onClick={copy} className={btnSmall}>
        {copied ? "Copiado!" : "Copiar link"}
      </button>
    </div>
  );
}
