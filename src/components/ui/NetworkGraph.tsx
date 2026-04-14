"use client";

import { useEffect, useRef } from "react";

type NodePoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type Pulse = {
  a: number;
  b: number;
  t: number;
  speed: number;
};

type Edge = {
  a: number;
  b: number;
  alpha: number;
};

const NODE_COUNT = 62;
const MAX_DISTANCE = 138;
const CURSOR_CONNECT_DISTANCE = 170;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const nodesRef = useRef<NodePoint[]>([]);
  const pulsesRef = useRef<Pulse[]>([]);
  const pulseCooldownRef = useRef(0);
  const mouseTargetRef = useRef({ x: 0, y: 0, active: false });
  const mouseSmoothRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initNodes = (width: number, height: number) => {
      nodesRef.current = Array.from({ length: NODE_COUNT }, () => ({
        x: randomBetween(20, Math.max(24, width - 20)),
        y: randomBetween(20, Math.max(24, height - 20)),
        vx: randomBetween(-0.1, 0.1),
        vy: randomBetween(-0.1, 0.1),
      }));
      pulsesRef.current = [];
      pulseCooldownRef.current = randomBetween(0.2, 1.2);
    };

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
      initNodes(width, height);
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseTargetRef.current = {
        x: clamp(nx, -1, 1),
        y: clamp(ny, -1, 1),
        active: true,
      };
    };

    const onMouseLeave = () => {
      mouseTargetRef.current.active = false;
      mouseTargetRef.current.x = 0;
      mouseTargetRef.current.y = 0;
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    let lastTs = performance.now();
    const loop = (ts: number) => {
      const deltaMs = ts - lastTs;
      const dt = Math.min(deltaMs / 16.6, 2);
      lastTs = ts;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const mouseTarget = mouseTargetRef.current;
      const mouseSmooth = mouseSmoothRef.current;

      const lerpFactor = mouseTarget.active ? 0.09 : 0.04;
      mouseSmooth.x += (mouseTarget.x - mouseSmooth.x) * lerpFactor;
      mouseSmooth.y += (mouseTarget.y - mouseSmooth.y) * lerpFactor;

      const parallaxX = -mouseSmooth.x * 12;
      const parallaxY = -mouseSmooth.y * 8;
      const cursorX = width * (0.5 + mouseSmooth.x * 0.5);
      const cursorY = height * (0.5 + mouseSmooth.y * 0.5);

      const nodes = nodesRef.current;
      const edges: Edge[] = [];

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx * dt;
        n.y += n.vy * dt;

        if (n.x < 8 || n.x > width - 8) n.vx *= -1;
        if (n.y < 8 || n.y > height - 8) n.vy *= -1;

        n.x = Math.max(8, Math.min(width - 8, n.x));
        n.y = Math.max(8, Math.min(height - 8, n.y));
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const ax = a.x + parallaxX;
          const ay = a.y + parallaxY;
          const bx = b.x + parallaxX;
          const by = b.y + parallaxY;
          const dx = ax - bx;
          const dy = ay - by;
          const dist = Math.hypot(dx, dy);
          if (dist > MAX_DISTANCE) continue;

          const alpha = 0.12 + (1 - dist / MAX_DISTANCE) * 0.18;
          edges.push({ a: i, b: j, alpha });

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      if (mouseTarget.active) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const nx = n.x + parallaxX;
          const ny = n.y + parallaxY;
          const dist = Math.hypot(cursorX - nx, cursorY - ny);
          if (dist > CURSOR_CONNECT_DISTANCE) continue;
          const alpha = (1 - dist / CURSOR_CONNECT_DISTANCE) * 0.24;
          ctx.beginPath();
          ctx.moveTo(cursorX, cursorY);
          ctx.lineTo(nx, ny);
          ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      pulseCooldownRef.current -= deltaMs / 1000;
      if (pulseCooldownRef.current <= 0 && edges.length > 0 && pulsesRef.current.length < 4) {
        const edge = edges[Math.floor(Math.random() * edges.length)];
        pulsesRef.current.push({
          a: edge.a,
          b: edge.b,
          t: 0,
          speed: randomBetween(0.007, 0.014),
        });
        pulseCooldownRef.current = randomBetween(0.6, 1.6);
      }

      pulsesRef.current = pulsesRef.current.filter((p) => p.t < 1);
      for (let i = 0; i < pulsesRef.current.length; i++) {
        const pulse = pulsesRef.current[i];
        const a = nodes[pulse.a];
        const b = nodes[pulse.b];
        if (!a || !b) continue;
        pulse.t += pulse.speed * dt;

        const x = a.x + parallaxX + (b.x - a.x) * pulse.t;
        const y = a.y + parallaxY + (b.y - a.y) * pulse.t;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.shadowColor = "rgba(255,255,255,0.75)";
        ctx.shadowBlur = 10;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x + parallaxX, n.y + parallaxY, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.shadowColor = "rgba(255,255,255,0.45)";
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      animationRef.current = window.requestAnimationFrame(loop);
    };

    animationRef.current = window.requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      if (animationRef.current != null) window.cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}

