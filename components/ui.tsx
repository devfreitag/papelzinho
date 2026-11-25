import { chip } from "./styles";

/** Faixa de bengala doce, o detalhe de Natal. Cores chapadas, sem degradê. */
function CandyStripe() {
  return (
    <svg width="100%" height="12" aria-hidden="true" className="block border-b-[3px] border-ink">
      <defs>
        <pattern id="candy" width="32" height="12" patternUnits="userSpaceOnUse">
          <rect width="32" height="12" fill="#FFFFFF" />
          <path d="M0 12 12 0h16L16 12Z" fill="#E4262C" />
        </pattern>
      </defs>
      <rect width="100%" height="12" fill="url(#candy)" />
    </svg>
  );
}

export function Header({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 bg-white">
      <div className="flex h-[60px] items-center justify-between gap-4 border-b-[3px] border-ink px-5 md:px-10">
        <div className="flex shrink-0 items-center gap-2">
          <svg width="28" height="28" viewBox="0 -2 28 28" aria-hidden="true" style={{ overflow: "visible" }}>
            <path d="M5 4h14l5 5v15H5z" fill="#FFE600" stroke="#0A0A0A" strokeWidth="2" />
            <path d="M4 6C6-1 15-2 20 3L22 6Z" fill="#E4262C" stroke="#0A0A0A" strokeWidth="2" />
            <rect x="3" y="5" width="16" height="4" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="2" />
            <circle cx="22.5" cy="6.5" r="2.5" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="2" />
          </svg>
          <span className="text-lg font-bold uppercase tracking-[-0.02em]">papelzinho</span>
        </div>
        {right && <div className="min-w-0 truncate text-sm font-bold">{right}</div>}
      </div>
      <CandyStripe />
    </header>
  );
}

export function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 w-fit max-w-full rounded-[2px] bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white [overflow-wrap:anywhere]">
      {children}
    </div>
  );
}

const avatarTones = ["bg-yellow", "bg-green", "bg-white"];

export function Avatar({ name }: { name: string }) {
  const hash = [...name].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return (
    <div
      aria-hidden="true"
      className={`flex size-9 shrink-0 items-center justify-center rounded-[4px] border-[3px] border-ink text-sm font-bold ${avatarTones[hash % avatarTones.length]}`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

/** "Abriu" / "Não abriu": cor e ícone, nunca só cor. */
export function OpenedChip({ opened }: { opened: boolean }) {
  return (
    <span className={`${chip} shrink-0 text-ink ${opened ? "bg-green" : "bg-white"}`}>
      <span aria-hidden="true">{opened ? "✓" : "○"}</span>
      {opened ? "Abriu" : "Não abriu"}
    </span>
  );
}

export function DrawnChip({ drawn }: { drawn: boolean }) {
  return (
    <span className={`${chip} bg-white text-ink`}>
      <span aria-hidden="true">{drawn ? "✓" : "○"}</span>
      {drawn ? "Sorteado" : "Aguardando sorteio"}
    </span>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex gap-2 rounded-[4px] border-[3px] border-red bg-white p-3 text-sm font-bold shadow-[4px_4px_0_#e4262c]">
      <span aria-hidden="true">!</span>
      {children}
    </p>
  );
}

export function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M4 4l10 10M14 4L4 14" stroke="#0A0A0A" strokeWidth="3" fill="none" />
    </svg>
  );
}

export function GiftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0" stroke="#0A0A0A" strokeWidth="2">
      <rect x="4" y="10" width="16" height="11" fill="#E4262C" />
      <rect x="2" y="6" width="20" height="5" fill="#E4262C" />
      <rect x="10" y="6" width="4" height="15" fill="#FFE600" />
      <path d="M12 6 7 2 5 5ZM12 6l5-4 2 3Z" fill="#FFE600" />
    </svg>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max === 0 ? 0 : (value / max) * 100;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-5 rounded-[4px] border-[3px] border-ink bg-white"
    >
      <div className="h-full bg-green" style={{ width: `${pct}%` }} />
    </div>
  );
}
