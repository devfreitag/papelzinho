"use client";

import { useState } from "react";
import { deleteGroup } from "@/app/admin/actions";
import { SubmitButton } from "./SubmitButton";
import { box, btnDanger, btnSmall, btnText, heading } from "./styles";

export function DeleteGroup({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={`${box} flex flex-col gap-3 p-5`}>
      <h2 className={heading}>Excluir grupo</h2>
      {!confirming ? (
        <>
          <p className="text-sm text-body">Apaga o grupo, os participantes e o sorteio. Não dá para desfazer.</p>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={`${btnSmall} w-fit`}
          >
            Excluir este grupo ↓
          </button>
        </>
      ) : (
        <>
          <p role="alert" className="text-sm font-bold [overflow-wrap:anywhere]">
            Excluir “{name}” de vez? Os links de todos os participantes deixam de funcionar.
          </p>
          <form action={deleteGroup.bind(null, id)} className="flex flex-col gap-3">
            <SubmitButton className={btnDanger}>Sim, excluir</SubmitButton>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className={btnText}
            >
              Cancelar
            </button>
          </form>
        </>
      )}
    </div>
  );
}
