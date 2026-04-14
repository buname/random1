"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function LandingNavbar() {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const isTilted = Math.abs(tilt.rx) + Math.abs(tilt.ry) > 0.45;

  const logoStyle = useMemo(
    () => ({
      textShadow: isTilted
        ? "0 0 14px rgba(255,255,255,0.32)"
        : "0 0 8px rgba(255,255,255,0.16)",
    }),
    [isTilted]
  );

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-8 py-4" style={{ perspective: "1000px" }}>
      <nav
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const nextRx = clamp((event.clientY - centerY) * 0.05, -6, 6);
          const nextRy = clamp((centerX - event.clientX) * 0.05, -6, 6);
          setTilt({ rx: nextRx, ry: nextRy });
        }}
        onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
        className="mx-auto flex w-full max-w-[1400px] items-center justify-between border border-white/10 bg-black/85 px-4 py-3 backdrop-blur-md"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: "transform 0.1s ease",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-[0.24em] text-white"
          style={logoStyle}
        >
          BexData
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm text-zinc-500 transition-colors hover:text-white">
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 transition-colors hover:text-white"
          >
            Dashboard
          </Link>
          <a href="#about" className="text-sm text-zinc-500 transition-colors hover:text-white">
            About
          </a>
        </div>

        <Link
          href="/dashboard"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
        >
          Open Dashboard -&gt;
        </Link>
      </nav>
    </div>
  );
}

