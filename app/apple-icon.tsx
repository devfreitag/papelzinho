import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Ícone para a tela de início do iPhone: o mesmo logo do cabeçalho, sobre o fundo creme do site. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fffef0" }}>
        <svg width="132" height="132" viewBox="0 0 28 28">
          <rect x="5" y="12" width="18" height="13" fill="#FFE600" stroke="#0A0A0A" strokeWidth="2" />
          <path d="M6 10C6 3 14 1 20 5L22 10Z" fill="#E4262C" stroke="#0A0A0A" strokeWidth="2" strokeLinejoin="round" />
          <rect x="3" y="9" width="22" height="5" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="2" />
          <circle cx="21.5" cy="4.5" r="2.5" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="2" />
        </svg>
      </div>
    ),
    size,
  );
}
