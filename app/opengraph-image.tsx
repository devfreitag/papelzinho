import { ImageResponse } from "next/og";

export const alt = "papelzinho · amigo secreto de Natal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0a0a0a";
const RED = "#e4262c";
const YELLOW = "#ffe600";
const BG = RED; // fundo da imagem (vermelho do site)

/** Space Grotesk (a fonte do site) vinda do Google Fonts. Se falhar, cai na fonte padrão. */
async function spaceGrotesk(): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700")).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** Ícones de Natal em traço, desenhados numa grade de 24×24. */
const icons = {
  star: <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" />,
  snow: <path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5" />,
  // Bastão de doce: tubo com listras (o traço grosso é "furado" pela cor do fundo).
  candy: (
    <>
      <path d="M16 22V9.5a4.5 4.5 0 0 0-9 0V11" strokeWidth={4.6} />
      <path d="M16 22V9.5a4.5 4.5 0 0 0-9 0V11" stroke={BG} strokeWidth={2.2} />
      <path d="M13.2 20l5.6-2M13.2 15.5l5.6-2M12.6 11l5.6-2" strokeWidth={1.2} />
    </>
  ),
  gift: <path d="M4 10h16v11H4zM3 7h18v3H3zM12 7v14M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0" />,
  tree: <path d="M12 2l5 6h-3l4 5h-3l4 5H5l4-5H6l4-5H7zM12 18v4" />,
  ball: (
    <>
      <path d="M10 3h4v3h-4z" />
      <circle cx="12" cy="14" r="7" />
      <path d="M7.5 14h9" />
    </>
  ),
  bell: <path d="M12 3a1 1 0 0 1 0 2 6 6 0 0 0-6 6v4l-2 3h16l-2-3v-4a6 6 0 0 0-6-6zM10 20a2 2 0 0 0 4 0" />,
  spark: <path d="M12 2c.7 5 2.3 8 8 10-5.7 2-7.3 5-8 10-.7-5-2.3-8-8-10 5.7-2 7.3-5 8-10z" />,
  sock: <path d="M9 3h7v9l4.5 3.5a3 3 0 0 1-2 5.3L11 17.5C9.5 16.7 9 15.5 9 14zM9 6.5h7" />,
};

/** [ícone, x, y, rotação] dentro de um bloco que se repete. */
const layout: [keyof typeof icons, number, number, number][] = [
  ["star", 12, 10, -12], ["snow", 150, 4, 0], ["candy", 290, 12, 14],
  ["gift", 52, 112, 6], ["tree", 190, 104, -6], ["ball", 322, 118, 0],
  ["bell", 8, 222, -10], ["spark", 125, 228, 0], ["sock", 235, 222, 10], ["star", 350, 236, 18],
];

function Pattern() {
  return (
    <svg width={1200} height={630} viewBox="0 0 1200 630">
      <defs>
        <pattern id="natal" width={420} height={330} patternUnits="userSpaceOnUse">
          {layout.map(([name, x, y, rot], i) => (
            <g
              key={i}
              transform={`translate(${x} ${y}) rotate(${rot} 22 22) scale(2.4)`}
              fill="none"
              stroke="rgba(255,255,255,0.34)"
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {icons[name]}
            </g>
          ))}
        </pattern>
      </defs>
      <rect width={1200} height={630} fill={BG} />
      <rect width={1200} height={630} fill="url(#natal)" />
    </svg>
  );
}

/** O mesmo logo do cabeçalho do site. */
function Logo({ size }: { size: number }) {
  const stroke = { stroke: INK, strokeWidth: 2, strokeLinejoin: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <rect x={5} y={12} width={18} height={13} fill={YELLOW} {...stroke} />
      <path d="M6 10C6 3 14 1 20 5L22 10Z" fill={RED} {...stroke} />
      <rect x={3} y={9} width={22} height={5} fill="#ffffff" {...stroke} />
      <circle cx={21.5} cy={4.5} r={2.5} fill="#ffffff" {...stroke} />
    </svg>
  );
}

/** Teaser da revelação: "Você tirou ?????" num cartão branco sobre fundo de ícones de Natal. */
export default async function Image() {
  const font = await spaceGrotesk();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          color: INK,
          fontFamily: font ? "Space Grotesk" : "sans-serif",
          fontWeight: 700,
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, display: "flex" }}>
          <Pattern />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 800,
            background: "#ffffff",
            border: `8px solid ${INK}`,
            borderRadius: 6,
            boxShadow: `18px 18px 0 ${INK}`,
            padding: "28px 0 26px",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 7 }}>VOCÊ TIROU</div>
          <div style={{ display: "flex", fontSize: 184, lineHeight: 1.05, letterSpacing: 20, marginTop: 6 }}>?????</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              width: 700,
              marginTop: 14,
              paddingTop: 22,
              borderTop: `4px solid ${INK}`,
            }}
          >
            <Logo size={56} />
            <div style={{ display: "flex", fontSize: 38, letterSpacing: -1, textTransform: "uppercase" }}>papelzinho</div>
            <div style={{ display: "flex", fontSize: 26, color: "#666666" }}>· amigo secreto de Natal</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Space Grotesk", data: font, style: "normal", weight: 700 }] : undefined,
    },
  );
}
