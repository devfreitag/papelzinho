"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import type { FormState } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";
import { Avatar, ErrorNote, Header, SectionTag, XIcon } from "./ui";
import { box, btnAdd, btnIcon, btnPrimary, btnText, field, label, lead, meta, row, screen, textarea, title } from "./styles";

function Steps({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex gap-2" aria-hidden="true">
      <div className="h-4 flex-1 rounded-[4px] border-[3px] border-ink bg-yellow" />
      <div className={`h-4 flex-1 rounded-[4px] border-[3px] border-ink ${step === 2 ? "bg-yellow" : "bg-white"}`} />
    </div>
  );
}

type Props = {
  /** Server Action que cria o grupo (a do admin ou a pública). */
  create: (state: FormState, formData: FormData) => Promise<FormState>;
  headerRight?: React.ReactNode;
  /** Link de voltar, só no admin. */
  backHref?: string;
  /** Frase do passo 1. */
  intro?: string;
};

export function CreateGroupForm({ create, headerRight, backHref, intro = "Isso aparece no link de cada participante." }: Props) {
  const [state, action] = useActionState(create, undefined);
  const [step, setStep] = useState<1 | 2>(1);
  const [names, setNames] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  function goToStep2() {
    if (!nameRef.current?.reportValidity()) return;
    setStep(2);
  }

  function addName() {
    const n = draft.trim();
    if (!n) return;
    if (!names.some((x) => x.toLowerCase() === n.toLowerCase())) setNames([...names, n]);
    setDraft("");
  }

  return (
    <>
      <Header right={headerRight} />
      <main className={screen}>
        {backHref && <Link href={backHref} className={btnText}>← Todos os grupos</Link>}
        <form action={action} className="flex flex-col gap-6">
          <Steps step={step} />

          {/* Campo-isca: fica fora da tela; quem preenche é bot. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="website">Não preencha</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          {/* Passo 1: grupo. Continua no DOM no passo 2 para os campos irem no envio. */}
          <div className={step === 1 ? "flex flex-col gap-6" : "hidden"}>
            <div>
              <SectionTag>Passo 1 de 2</SectionTag>
              <h1 className={title}>Qual é o grupo?</h1>
              <p className={`${lead} mt-4`}>{intro}</p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="name" className={label}>Nome do grupo</label>
              <input ref={nameRef} id="name" name="name" required maxLength={80} placeholder="Natal da família" className={field} />
            </div>
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <label htmlFor="budget" className={label}>Valor sugerido</label>
                <input id="budget" name="budget" maxLength={40} placeholder="R$ 50" className={field} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <label htmlFor="exchange_date" className={label}>Data da troca</label>
                <input id="exchange_date" name="exchange_date" type="date" className={field} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className={label}>
                Recado para o grupo <span className="text-meta">(opcional)</span>
              </label>
              <textarea id="message" name="message" rows={3} maxLength={500} placeholder="Troca na ceia, depois da sobremesa." className={textarea} />
            </div>

            <button type="button" onClick={goToStep2} className={btnPrimary}>Continuar →</button>
          </div>

          {/* Passo 2: participantes */}
          <div className={step === 2 ? "flex flex-col gap-6" : "hidden"}>
            {names.map((n) => (
              <input key={n} type="hidden" name="names" value={n} />
            ))}

            <div>
              <SectionTag>Passo 2 de 2</SectionTag>
              <h1 className={title}>Quem participa?</h1>
              <p className={`${lead} mt-4`}>Só o nome. O WhatsApp você usa na hora de enviar.</p>
            </div>

            <div className="flex gap-3">
              <label htmlFor="novo" className="sr-only">Nome do participante</label>
              <input
                id="novo"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addName();
                  }
                }}
                maxLength={60}
                placeholder="Adicionar nome"
                className={field}
              />
              <button type="button" onClick={addName} className={btnAdd}>Incluir</button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-4">
                <div className={label}>{names.length} {names.length === 1 ? "pessoa" : "pessoas"}</div>
                <div className={meta}>mínimo de 3</div>
              </div>
              {names.length > 0 && (
                <ul className={box}>
                  {names.map((n) => (
                    <li key={n} className={row}>
                      <Avatar name={n} />
                      <div className="min-w-0 flex-1 font-medium [overflow-wrap:anywhere]">{n}</div>
                      <button
                        type="button"
                        onClick={() => setNames(names.filter((x) => x !== n))}
                        aria-label={`Remover ${n}`}
                        className={btnIcon}
                      >
                        <XIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {state?.error && <ErrorNote>{state.error}</ErrorNote>}

            <SubmitButton disabled={names.length < 3}>Criar grupo →</SubmitButton>
            <button type="button" onClick={() => setStep(1)} className={btnText}>← Voltar</button>
          </div>
        </form>
      </main>
    </>
  );
}
