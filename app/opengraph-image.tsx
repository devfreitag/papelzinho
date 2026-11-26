import { ImageResponse } from "next/og";

export const alt = "papelzinho · amigo secreto de Natal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0a0a0a";
const RED = "#e4262c";
const YELLOW = "#ffe600";
const GREEN = "#00c853";

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

/** Teaser da revelação: "Você tirou ?????" num cartão branco sobre fundo verde. */
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
          background: GREEN,
          color: INK,
          fontFamily: font ? "Space Grotesk" : "sans-serif",
          fontWeight: 700,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 940,
            background: "#ffffff",
            border: `8px solid ${INK}`,
            borderRadius: 6,
            boxShadow: `18px 18px 0 ${INK}`,
            padding: "34px 0 30px",
          }}
        >
          <div style={{ display: "flex", fontSize: 34, letterSpacing: 8 }}>VOCÊ TIROU</div>
          <div style={{ display: "flex", fontSize: 220, lineHeight: 1.05, letterSpacing: 26, marginTop: 6 }}>?????</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              width: 820,
              marginTop: 14,
              paddingTop: 22,
              borderTop: `4px solid ${INK}`,
            }}
          >
            <Logo size={64} />
            <div style={{ display: "flex", fontSize: 44, letterSpacing: -1, textTransform: "uppercase" }}>papelzinho</div>
            <div style={{ display: "flex", fontSize: 30, color: "#666666" }}>· amigo secreto de Natal</div>
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
