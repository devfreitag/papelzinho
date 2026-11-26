"use client";

import { useActionState, useState } from "react";
import { redrawGroup } from "@/app/admin/actions";
import { SubmitButton } from "./SubmitButton";
import { ErrorNote } from "./ui";
import { box, btnDark, btnSmall, btnText, heading } from "./styles";

export function RedrawGroup({ id }: { id: string }) {
  const [state, action] = useActionState(redrawGroup.bind(null, id), undefined);
  // A confirmação vale só para o resultado em que foi aberta: quando a action termina, `state` muda e ela fecha sozinha.
  const [armedFor, setArmedFor] = useState<{ s: typeof state } | null>(null);
  const confirming = armedFor !== null && armedFor.s === state;

  return (
    <div className={`${box} flex flex-col gap-3 p-5`}>
      <h2 className={heading}>Refazer sorteio</h2>
      {!confirming ? (
        <>
          <p className="text-sm text-body">
            Sorteia de novo e marca todo mundo como “não abriu”. As listas de desejos e os links continuam os mesmos.
          </p>
          {state?.ok && (
            <p role="status" className="rounded-[4px] border-[3px] border-ink bg-green p-3 text-sm font-bold">
              ✓ Sorteio refeito! Todo mundo voltou para “não abriu”.
            </p>
          )}
          {state?.error && <ErrorNote>{state.error}</ErrorNote>}
          <button type="button" onClick={() => setArmedFor({ s: state })} className={`${btnSmall} w-fit`}>
            Refazer sorteio ↓
          </button>
        </>
      ) : (
        <>
          <p role="alert" className="text-sm font-bold">
            Refazer o sorteio? Quem já revelou perde o resultado e precisa revelar de novo.
          </p>
          <form action={action} className="flex flex-col gap-3">
            <SubmitButton className={btnDark}>Sim, refazer</SubmitButton>
            <button type="button" onClick={() => setArmedFor(null)} className={btnText}>
              Cancelar
            </button>
          </form>
        </>
      )}
    </div>
  );
}
