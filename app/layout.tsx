import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });

export const metadata: Metadata = {
  // Base das URLs absolutas (imagem de preview). Troque com SITE_URL se o domínio mudar.
  metadataBase: new URL(process.env.SITE_URL ?? "https://papelzinho.devfreitag.com"),
  title: "papelzinho · amigo secreto de Natal",
  description: "Amigo secreto com link individual: nem o organizador vê quem tirou quem.",
  robots: { index: false },
  openGraph: {
    title: "papelzinho · amigo secreto de Natal",
    description: "Abra seu link para descobrir quem você tirou.",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col bg-paper font-sans text-base leading-[1.6] text-ink">{children}</body>
    </html>
  );
}
