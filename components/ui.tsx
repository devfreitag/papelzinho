import Link from "next/link";
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
        <Link href="/" aria-label="papelzinho, página inicial" className="flex shrink-0 items-center gap-2">
          <svg width="28" height="28" viewBox="0 -2 28 28" aria-hidden="true" style={{ overflow: "visible" }}>
            <path d="M5 4h14l5 5v15H5z" fill="#FFE600" stroke="#0A0A0A" strokeWidth="2" />
            <path d="M4 6C6-1 15-2 20 3L22 6Z" fill="#E4262C" stroke="#0A0A0A" strokeWidth="2" />
            <rect x="3" y="5" width="16" height="4" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="2" />
            <circle cx="22.5" cy="6.5" r="2.5" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="2" />
          </svg>
          <span className="text-lg font-bold uppercase tracking-[-0.02em]">papelzinho</span>
        </Link>
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

/** Ícone de copiar (duas folhas) e, quando `done`, um visto. */
export function CopyIcon({ done = false }: { done?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className="shrink-0">
      {done ? (
        <path d="M2.5 8.5 6 12l7.5-8" />
      ) : (
        <>
          <rect x="5.5" y="5.5" width="8" height="8" />
          <path d="M10.5 5.5v-3h-8v8h3" />
        </>
      )}
    </svg>
  );
}

/** Logo do WhatsApp (Simple Icons, CC0), em uma cor só. */
export function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="#0A0A0A" className="shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
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
