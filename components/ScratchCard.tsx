"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { box, btnPrimary, btnText, meta, nameSize } from "./styles";

const BRUSH = 44; // diâmetro do "dedo", em px
const DONE_AT = 0.5; // fração raspada que revela tudo

type Status = "idle" | "scratching" | "done";

const INK = "#0a0a0a";
const RED = "#e4262c";

/** Papel de presente amarelo com fita vermelha em cruz e um laço no meio. */
function paintGift(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.globalCompositeOperation = "source-over";

  // Papel: amarelo com bolinhas discretas.
  ctx.fillStyle = "#ffe600";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(10,10,10,0.09)";
  for (let y = 8, row = 0; y < h; y += 14, row++) {
    for (let x = row % 2 ? 15 : 8; x < w; x += 14) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const cx = w / 2;
  const cy = h / 2;
  const s = Math.min(h * 0.3, 54); // tamanho do laço
  const band = s * 0.55; // largura da fita

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;

  // Fita em cruz.
  ctx.fillStyle = RED;
  ctx.fillRect(cx - band / 2, 0, band, h);
  ctx.fillRect(0, cy - band / 2, w, band);
  const line = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };
  line(cx - band / 2, 0, cx - band / 2, cy - band / 2);
  line(cx + band / 2, 0, cx + band / 2, cy - band / 2);
  line(cx - band / 2, cy + band / 2, cx - band / 2, h);
  line(cx + band / 2, cy + band / 2, cx + band / 2, h);
  line(0, cy - band / 2, cx - band / 2, cy - band / 2);
  line(0, cy + band / 2, cx - band / 2, cy + band / 2);
  line(cx + band / 2, cy - band / 2, w, cy - band / 2);
  line(cx + band / 2, cy + band / 2, w, cy + band / 2);

  const shape = (draw: () => void) => {
    ctx.beginPath();
    draw();
    ctx.closePath();
    ctx.fillStyle = RED;
    ctx.fill();
    ctx.stroke();
  };

  // Pontas do laço, com o corte em V.
  for (const d of [-1, 1]) {
    shape(() => {
      ctx.moveTo(cx + d * s * 0.05, cy);
      ctx.lineTo(cx + d * s * 0.75, cy + s * 1.05);
      ctx.lineTo(cx + d * s * 0.52, cy + s * 0.88);
      ctx.lineTo(cx + d * s * 0.4, cy + s * 1.12);
      ctx.lineTo(cx - d * s * 0.2, cy + s * 0.1);
    });
  }

  // Alças do laço, com a dobra marcada por dentro.
  for (const d of [-1, 1]) {
    shape(() => {
      ctx.moveTo(cx, cy);
      ctx.bezierCurveTo(cx + d * s * 0.5, cy - s * 1.25, cx + d * s * 1.75, cy - s * 0.85, cx + d * s * 1.45, cy - s * 0.05);
      ctx.bezierCurveTo(cx + d * s * 1.25, cy + s * 0.45, cx + d * s * 0.55, cy + s * 0.35, cx, cy);
    });
    ctx.save();
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(cx + d * s * 0.2, cy - s * 0.05);
    ctx.quadraticCurveTo(cx + d * s * 0.75, cy - s * 0.55, cx + d * s * 1.15, cy - s * 0.3);
    ctx.stroke();
    ctx.restore();
  }

  // Nó.
  const k = s * 0.42;
  ctx.beginPath();
  ctx.roundRect(cx - k / 2, cy - k / 2 - s * 0.05, k, k, 4);
  ctx.fillStyle = RED;
  ctx.fill();
  ctx.stroke();
}

/** Raspadinha em forma de presente: o embrulho sai com o dedo e o nome aparece embaixo. */
export function ScratchCard({ reveal }: { reveal: () => Promise<{ name: string } | null> }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const asked = useRef(false);
  const [name, setName] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [failed, setFailed] = useState(false);
  const [refreshing, startRefresh] = useTransition();

  // Pinta o embrulho. Repinta ao redimensionar enquanto ninguém começou a raspar.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => {
      if (status !== "idle") return;
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintGift(ctx, width, height);
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [status]);

  async function ask() {
    if (asked.current) return;
    asked.current = true;
    try {
      const res = await reveal();
      if (res) setName(res.name);
      else setFailed(true);
    } catch {
      setFailed(true);
    }
  }

  // Se o servidor recusou (lista de alguém foi apagada, por ex.), volta para a tela certa.
  useEffect(() => {
    if (failed) router.refresh();
  }, [failed, router]);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function scratch(from: { x: number; y: number }, to: { x: number; y: number }) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  function scratchedFraction() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || canvas.width === 0) return 0;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 16) {
      total++;
      if (data[i] === 0) clear++;
    }
    return clear / total;
  }

  function finish() {
    drawing.current = false;
    last.current = null;
    setStatus("done");
    void ask();
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (status === "done") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = point(e);
    last.current = p;
    scratch(p, p);
    if (status === "idle") setStatus("scratching");
    void ask(); // busca o nome já no primeiro toque, para estar embaixo quando a camada sair
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !last.current) return;
    const p = point(e);
    scratch(last.current, p);
    last.current = p;
  }

  function onUp() {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    if (scratchedFraction() >= DONE_AT) finish();
  }

  const done = status === "done";

  return (
    <div className="flex flex-col gap-4">
      <div className={`${box} flex flex-col items-center gap-4 p-5 text-center md:p-8`}>
        <div className={meta}>Você tirou</div>

        <div className="relative flex min-h-[160px] w-full items-center justify-center overflow-hidden rounded-[4px] border-[3px] border-ink bg-paper">
          <span
            aria-live="polite"
            className={`px-3 font-bold uppercase leading-[0.95] tracking-[-0.03em] [overflow-wrap:anywhere] ${
              name ? nameSize(name) : "text-5xl"
            } ${done && name ? "motion-safe:animate-[pop_450ms_cubic-bezier(.2,1.6,.4,1)]" : ""}`}
          >
            {name ?? (status === "idle" ? "" : "…")}
          </span>
          <canvas
            ref={canvasRef}
            aria-label="Presente: raspe o papel para revelar quem você tirou"
            role="img"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className={`absolute inset-0 size-full cursor-grab touch-none select-none transition-opacity duration-500 active:cursor-grabbing ${
              done ? "pointer-events-none opacity-0" : ""
            }`}
          />
        </div>

        <p className="text-sm text-body">
          {done
            ? "Só você vê. O nome fica salvo neste link."
            : "Raspe o papel de presente com o dedo ou o mouse. Só você vê."}
        </p>
      </div>

      {done && name ? (
        <button
          type="button"
          disabled={refreshing}
          onClick={() => startRefresh(() => router.refresh())}
          className={btnPrimary}
        >
          {refreshing ? "Aguarde…" : `Ver o que ${name} quer ganhar →`}
        </button>
      ) : (
        !done && (
          <button type="button" onClick={finish} className={btnText}>
            Revelar sem raspar
          </button>
        )
      )}
    </div>
  );
}
