"use client";

import { useEffect, useMemo, useRef } from "react";

type Vec3 = { x: number; y: number; z: number };
type RiskNode = Vec3 & { phase: number };

function rotateY(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: v.x * c - v.z * s, y: v.y, z: v.x * s + v.z * c };
}

function rotateX(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
}

function project(v: Vec3, radius: number, cx: number, cy: number) {
  const perspective = 1 / (1.85 - v.z);
  return {
    x: cx + v.x * radius * perspective,
    y: cy + v.y * radius * perspective,
    scale: perspective,
    depth: v.z,
  };
}

function createRiskNodes(count: number): RiskNode[] {
  const nodes: RiskNode[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const phi = Math.acos(1 - 2 * t);
    const theta = Math.PI * (3 - Math.sqrt(5)) * i;
    nodes.push({
      x: Math.sin(phi) * Math.cos(theta),
      y: Math.cos(phi),
      z: Math.sin(phi) * Math.sin(theta),
      phase: i * 0.7,
    });
  }
  return nodes;
}

export default function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const nodes = useMemo(() => createRiskNodes(14), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const drawWire = (
      timeSec: number,
      width: number,
      height: number,
      radius: number
    ) => {
      const cx = width / 2;
      const cy = height / 2;

      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;

      const lines = 6;
      const steps = 80;
      for (let li = 0; li < lines; li++) {
        const long = (li / lines) * Math.PI * 2;
        ctx.beginPath();
        for (let si = 0; si <= steps; si++) {
          const t = (si / steps) * Math.PI * 2;
          const base: Vec3 = {
            x: Math.cos(t) * Math.cos(long),
            y: Math.sin(t),
            z: Math.cos(t) * Math.sin(long),
          };
          const spun = rotateY(base, timeSec * 0.16);
          const tilted = rotateX(spun, -0.32);
          const p = project(tilted, radius, cx, cy);
          if (si === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      const rings = 5;
      for (let ri = 1; ri <= rings; ri++) {
        const lat = (ri / (rings + 1) - 0.5) * Math.PI;
        ctx.beginPath();
        for (let si = 0; si <= steps; si++) {
          const t = (si / steps) * Math.PI * 2;
          const base: Vec3 = {
            x: Math.cos(lat) * Math.cos(t),
            y: Math.sin(lat),
            z: Math.cos(lat) * Math.sin(t),
          };
          const spun = rotateY(base, timeSec * 0.16);
          const tilted = rotateX(spun, -0.32);
          const p = project(tilted, radius, cx, cy);
          if (si === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
    };

    const loop = (timeMs: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const radius = Math.min(width, height) * 0.34;
      const timeSec = timeMs * 0.001;

      ctx.clearRect(0, 0, width, height);
      drawWire(timeSec, width, height, radius);

      const cx = width / 2;
      const cy = height / 2;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const spun = rotateY(node, timeSec * 0.16);
        const tilted = rotateX(spun, -0.32);
        const p = project(tilted, radius, cx, cy);
        if (p.depth < -0.26) continue;

        const pulse = 0.72 + Math.sin(timeSec * 2 + node.phase) * 0.28;
        const r = Math.max(1.1, 2.1 * p.scale * pulse);
        const alpha = 0.35 + p.scale * 0.45;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.shadowColor = "rgba(255,255,255,0.65)";
        ctx.shadowBlur = 12 * p.scale;
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      frameRef.current = window.requestAnimationFrame(loop);
    };

    frameRef.current = window.requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [nodes]);

  return (
    <div className="h-[320px] w-full md:h-[500px]">
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
    </div>
  );
}

