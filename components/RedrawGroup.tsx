"use client";

import { useState } from "react";
import { redrawGroup } from "@/app/admin/actions";
import { SubmitButton } from "./SubmitButton";
import { box, btnDark, btnSmall, btnText, heading } from "./styles";

export function RedrawGroup({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={`${box} flex flex-col gap-3 p-5`}>
      <h2 className={heading}>Refazer sorteio</h2>
      {!confirming ? (
        <>
          <p className="text-sm text-body">
            Sorteia de novo e marca todo mundo como “não abriu”. As listas de desejos e os links continuam os mesmos.
          </p>
          <button type="button" onClick={() => setConfirming(true)} className={`${btnSmall} w-fit`}>
            Refazer sorteio ↓
          </button>
        </>
      ) : (
        <>
          <p role="alert" className="text-sm font-bold">
            Refazer o sorteio? Quem já revelou perde o resultado e precisa revelar de novo.
          </p>
          <form action={redrawGroup.bind(null, id)} className="flex flex-col gap-3">
            <SubmitButton className={btnDark}>Sim, refazer</SubmitButton>
            <button type="button" onClick={() => setConfirming(false)} className={btnText}>
              Cancelar
            </button>
          </form>
        </>
      )}
    </div>
  );
}
