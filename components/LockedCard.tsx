import { ProgressBar } from "./ui";
import { box, heading, label } from "./styles";

function LockIcon() {
  return (
    <svg width="44" height="48" viewBox="0 0 44 48" aria-hidden="true" stroke="#0a0a0a" strokeWidth="3" strokeLinejoin="round">
      <path d="M11 22V15a11 11 0 0 1 22 0v7" fill="none" strokeLinecap="round" />
      <rect x="4" y="21" width="36" height="25" rx="3" fill="#ffe600" />
      <circle cx="22" cy="31.5" r="3.5" fill="#0a0a0a" />
      <path d="M22 33v6" strokeLinecap="round" />
    </svg>
  );
}

/** Aviso de que ainda não dá para revelar: faltam listas de desejos no grupo. */
export function LockedCard({ done, total }: { done: number; total: number }) {
  const missing = total - done;
  return (
    <div className={`${box} flex flex-col gap-4 p-5 md:p-8`}>
      <div className="flex items-center gap-4">
        <div className="flex size-[72px] shrink-0 items-center justify-center rounded-[4px] border-[3px] border-dashed border-ink bg-paper">
          <LockIcon />
        </div>
        <div className="min-w-0">
          <div className={`${label} text-meta`}>Ainda bloqueado</div>
          <h2 className={`${heading} mt-1`}>Ainda não dá para revelar</h2>
        </div>
      </div>
      <p className="text-body">
        O nome só aparece quando todo mundo terminar a lista de desejos.{" "}
        <strong className="text-ink">
          {missing === 1 ? "Falta 1 pessoa." : `Faltam ${missing} pessoas.`}
        </strong>
      </p>
      <div className="flex flex-col gap-2">
        <ProgressBar value={done} max={total} label="Pessoas que terminaram a lista" />
        <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-meta">
          {done}/{total} listas prontas
        </div>
      </div>
    </div>
  );
}
