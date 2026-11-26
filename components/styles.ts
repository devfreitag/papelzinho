const page = "mx-auto flex w-full flex-1 flex-col gap-6 px-5 pb-12 pt-8 md:px-10 md:pt-12";
/** Formulários e telas do participante. */
export const screen = `${page} max-w-[640px]`;
/** Painel e admin, que usam grid no desktop. */
export const screenWide = `${page} max-w-[1120px] lg:px-16`;

// Space Grotesk vai até o peso 700.
export const title =
  "text-[clamp(40px,6vw,72px)] font-bold uppercase leading-[0.95] tracking-[-0.03em] [overflow-wrap:anywhere]";
export const heading = "text-[clamp(20px,2.5vw,28px)] font-bold leading-tight tracking-[-0.02em] [overflow-wrap:anywhere]";
export const lead = "text-body";
export const label = "text-[13px] font-bold uppercase tracking-[0.08em]";
export const meta = "text-[13px] font-bold uppercase tracking-[0.08em] text-meta";

const edge = "rounded-[4px] border-[3px] border-ink";

const input = `${edge} w-full min-w-0 bg-white px-4 text-base font-medium text-ink outline-none transition-shadow duration-100 placeholder:text-meta focus:shadow-[4px_4px_0_#0a0a0a] aria-invalid:border-red aria-invalid:shadow-[4px_4px_0_#e4262c]`;
export const field = `${input} h-[52px]`;
export const textarea = `${input} resize-none py-3 leading-[1.4]`;

const btn = `${edge} press block w-full px-6 py-3 text-center text-base font-bold tracking-[0.02em] disabled:opacity-60`;
export const btnPrimary = `${btn} bg-yellow text-ink`;
export const btnDark = `${btn} bg-ink text-white`;
export const btnDanger = `${btn} bg-red text-white`;
export const btnAdd = `${edge} press-sm h-[52px] shrink-0 bg-ink px-5 font-bold text-white disabled:opacity-60`;
export const btnSmall = `${edge} press-sm inline-flex min-h-11 items-center bg-white px-3 text-sm font-bold text-ink disabled:opacity-60`;
/** Botão só com ícone (remover). */
export const btnIcon =
  "flex size-11 shrink-0 items-center justify-center rounded-[4px] border-[3px] border-transparent hover:border-ink hover:bg-yellow";
/** Botão ou link de texto (Voltar, Cancelar, Sair). */
export const btnText =
  "inline-flex min-h-11 w-fit items-center px-1 text-sm font-bold underline decoration-2 underline-offset-4 hover:bg-yellow";

export const box = `${edge} bg-white shadow-hard`;
export const boxDark = `${edge} bg-ink text-white shadow-hard`;
/** Card que é um link inteiro. O fundo vem de quem usa. */
export const boxLink = `${edge} lift block h-full p-4`;
export const row = "flex items-center gap-3 border-b-[3px] border-ink px-3 py-2 last:border-b-0";
export const chip =
  "inline-flex items-center gap-1 rounded-[4px] border-2 border-ink px-2 py-1 text-[13px] font-bold leading-tight";

/** Nome grande, mas que não estoura a largura do cartão. */
export function nameSize(name: string) {
  if (name.length <= 8) return "text-[clamp(48px,12vw,96px)]";
  if (name.length <= 12) return "text-[clamp(36px,9vw,72px)]";
  return "text-[clamp(28px,6vw,48px)]";
}
