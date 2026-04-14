"use client";

import { useRef, useState, type MouseEventHandler } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function DashboardMockup() {
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ rx: 0, ry: 0 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const animateToTarget = () => {
    if (frameRef.current != null) return;
    const tick = () => {
      setTilt((current) => {
        const next = {
          rx: current.rx + (targetRef.current.rx - current.rx) * 0.14,
          ry: current.ry + (targetRef.current.ry - current.ry) * 0.14,
        };
        const done =
          Math.abs(next.rx - targetRef.current.rx) < 0.08 &&
          Math.abs(next.ry - targetRef.current.ry) < 0.08;
        if (done) {
          frameRef.current = null;
          return targetRef.current;
        }
        frameRef.current = window.requestAnimationFrame(tick);
        return next;
      });
    };
    frameRef.current = window.requestAnimationFrame(tick);
  };

  const handleMove: MouseEventHandler<HTMLDivElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    targetRef.current = {
      rx: clamp(-py * 18, -12, 12),
      ry: clamp(px * 20, -12, 12),
    };
    animateToTarget();
  };

  const handleLeave = () => {
    targetRef.current = { rx: 0, ry: 0 };
    animateToTarget();
  };

  return (
    <div className="h-[340px] w-full md:h-[520px]" style={{ perspective: "1000px" }}>
      <div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="group relative h-full w-full rounded-xl border border-white/10 bg-[#0a0a0a] p-3 shadow-[0_0_50px_rgba(255,255,255,0.05)]"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 70ms linear",
        }}
      >
        <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_22%_10%,rgba(255,255,255,0.08),transparent_42%)]" />

        <div className="relative flex h-full gap-3">
          <aside className="w-16 shrink-0 rounded-lg border border-white/10 bg-black/40 p-2">
            <div className="mb-2 h-2 w-8 rounded bg-white/20" />
            <div className="space-y-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-1.5 rounded bg-white/10" />
              ))}
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <header className="rounded-lg border border-white/10 bg-black/35 p-2">
              <div className="h-2.5 w-24 rounded bg-white/15" />
              <div className="mt-2 h-1.5 w-full rounded bg-white/10" />
            </header>

            <div className="grid flex-1 grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((card) => (
                <div
                  key={card}
                  className="relative overflow-hidden rounded-lg border border-white/10 bg-[#0d0d0d]"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.07),transparent_45%)]" />
                  <div className="relative p-2">
                    <div className="h-1.5 w-14 rounded bg-white/20" />
                    <div className="mt-3 space-y-1.5">
                      <div className="h-1.5 w-full rounded bg-white/10" />
                      <div className="h-1.5 w-4/5 rounded bg-white/10" />
                      <div className="h-1.5 w-3/5 rounded bg-white/10" />
                    </div>
                  </div>
                  <div className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

