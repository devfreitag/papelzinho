import { ImageResponse } from "next/og";

export const alt = "papelzinho · amigo secreto de Natal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0a0a0a";
const RED = "#e4262c";
const YELLOW = "#ffe600";
const PAPER = "#fffef0";

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

/** Faixa de bengala doce do cabeçalho do site. */
function CandyStripe() {
  const w = 1200;
  const step = 48;
  const stripes = [];
  for (let x = -step; x < w + step; x += step) {
    stripes.push(<polygon key={x} points={`${x},24 ${x + 18},0 ${x + 42},0 ${x + 24},24`} fill={RED} />);
  }
  return (
    <svg width={w} height={24} viewBox={`0 0 ${w} 24`}>
      <rect width={w} height={24} fill="#ffffff" />
      {stripes}
      <rect y={21} width={w} height={3} fill={INK} />
    </svg>
  );
}

function Gift() {
  const stroke = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const };
  return (
    <svg width={360} height={360} viewBox="0 0 400 400">
      {/* sombra dura */}
      <rect x={34} y={134} width={340} height={240} fill={INK} />
      {/* caixa e tampa */}
      <rect x={20} y={120} width={340} height={240} fill={YELLOW} {...stroke} />
      <rect x={4} y={86} width={372} height={64} fill={YELLOW} {...stroke} />
      {/* fita vertical */}
      <rect x={156} y={86} width={68} height={274} fill={RED} {...stroke} />
      {/* alças do laço */}
      <path
        d="M190 86 C150 0 40 -6 56 48 C66 84 140 90 190 86Z"
        fill={RED}
        {...stroke}
      />
      <path
        d="M190 86 C230 0 340 -6 324 48 C314 84 240 90 190 86Z"
        fill={RED}
        {...stroke}
      />
      {/* nó */}
      <rect x={168} y={62} width={44} height={44} rx={6} fill={RED} {...stroke} />
    </svg>
  );
}

export default async function Image() {
  const font = await spaceGrotesk();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          color: INK,
          fontFamily: font ? "Space Grotesk" : "sans-serif",
          fontWeight: 700,
        }}
      >
        <CandyStripe />
        <div style={{ display: "flex", flex: 1, alignItems: "center", padding: "0 80px", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: INK,
                color: "#ffffff",
                fontSize: 26,
                letterSpacing: 4,
                padding: "10px 22px",
                borderRadius: 4,
              }}
            >
              AMIGO SECRETO DE NATAL
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 118,
                lineHeight: 1,
                letterSpacing: -6,
                textTransform: "uppercase",
              }}
            >
              papelzinho
            </div>
            <div style={{ display: "flex", marginTop: 32, fontSize: 40, lineHeight: 1.25, color: "#333333" }}>
              Abra seu link para descobrir quem você tirou.
            </div>
          </div>
          <div style={{ display: "flex", flexShrink: 0 }}>
            <Gift />
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
