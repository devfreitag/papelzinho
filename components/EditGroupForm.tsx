"use client";

import { useActionState } from "react";
import { updateGroup } from "@/app/admin/actions";
import { SubmitButton } from "./SubmitButton";
import { ErrorNote } from "./ui";
import { box, field, heading, label, textarea } from "./styles";

export function EditGroupForm({
  id,
  name,
  budget,
  exchangeDate,
  message,
}: {
  id: string;
  name: string;
  budget: string | null;
  exchangeDate: string | null;
  message: string | null;
}) {
  const [state, action] = useActionState(updateGroup.bind(null, id), undefined);

  return (
    <form action={action} className={`${box} flex flex-col gap-4 p-5`}>
      <h2 className={heading}>Editar grupo</h2>
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={label}>Nome do grupo</label>
        <input id="name" name="name" required maxLength={80} defaultValue={name} className={field} />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label htmlFor="budget" className={label}>Valor sugerido</label>
          <input id="budget" name="budget" maxLength={40} defaultValue={budget ?? ""} className={field} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label htmlFor="exchange_date" className={label}>Data da troca</label>
          <input id="exchange_date" name="exchange_date" type="date" defaultValue={exchangeDate ?? ""} className={field} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={label}>Recado</label>
        <textarea id="message" name="message" rows={3} maxLength={500} defaultValue={message ?? ""} className={textarea} />
      </div>
      <div className="flex items-center gap-4">
        <div className="w-40 shrink-0">
          <SubmitButton>Salvar</SubmitButton>
        </div>
        {state?.ok && <span role="status" className="text-sm font-bold">✓ Salvo!</span>}
      </div>
      {state?.error && <ErrorNote>{state.error}</ErrorNote>}
    </form>
  );
}
