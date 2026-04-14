"use client";

import { useEffect, useRef } from "react";

const STAR_COUNT_MIN = 100;
const STAR_COUNT_MAX = 150;
const BG = "#000000";
const OPACITY_MIN = 0.1;
const OPACITY_MAX = 0.5;
const SIZE_MIN = 0.7;
const SIZE_MAX = 3;

type Star = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phaseOpacity: number;
  periodOpacityMs: number;
  phaseRadius: number;
  periodRadiusMs: number;
  rotationPhase: number;
  rotationSpeed: number;
};

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randRange(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity: number,
  rotation: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;
  ctx.fillStyle = "#ffffff";

  ctx.beginPath();
  const spikes = 4;
  const outerRadius = size;
  const innerRadius = size * 0.4;

  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / spikes) * i;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function createStars(width: number, height: number): Star[] {
  const n = randomInt(STAR_COUNT_MIN, STAR_COUNT_MAX);
  const stars: Star[] = [];
  for (let i = 0; i < n; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: randRange(-7, 7),
      vy: randRange(-7, 7),
      phaseOpacity: Math.random() * Math.PI * 2,
      periodOpacityMs: 2800 + Math.random() * 5200,
      phaseRadius: Math.random() * Math.PI * 2,
      periodRadiusMs: 4500 + Math.random() * 6500,
      rotationPhase: Math.random() * Math.PI * 2,
      rotationSpeed: randRange(-0.1, 0.1),
    });
  }
  return stars;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const lastNowRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      starsRef.current = createStars(w, h);
      lastNowRef.current = 0;
    };

    resize();
    window.addEventListener("resize", resize);

    const tick = (now: number) => {
      if (lastNowRef.current === 0) lastNowRef.current = now;
      const dt = Math.min((now - lastNowRef.current) / 1000, 0.05);
      lastNowRef.current = now;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      const stars = starsRef.current;
      const tSec = now / 1000;

      for (const s of stars) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (s.x < 0) s.x += w;
        else if (s.x > w) s.x -= w;
        if (s.y < 0) s.y += h;
        else if (s.y > h) s.y -= h;

        const angOp = s.phaseOpacity + (2 * Math.PI * now) / s.periodOpacityMs;
        const oscOp = (Math.sin(angOp) + 1) / 2;
        const opacity = OPACITY_MIN + oscOp * (OPACITY_MAX - OPACITY_MIN);

        const angR = s.phaseRadius + (2 * Math.PI * now) / s.periodRadiusMs;
        const oscR = (Math.sin(angR) + 1) / 2;
        const size = SIZE_MIN + oscR * (SIZE_MAX - SIZE_MIN);

        const rotation = s.rotationPhase + tSec * s.rotationSpeed;
        drawStar(ctx, s.x, s.y, size, opacity, rotation);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
