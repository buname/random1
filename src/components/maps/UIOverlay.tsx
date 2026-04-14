"use client";

import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import type { GlobalRisk, HoveredRisk } from "@/components/maps/types";

interface UIOverlayProps {
  query: string;
  onQueryChange: (value: string) => void;
  filter: "all" | "conflict" | "tension" | "sanction" | "hub";
  onFilterChange: (value: "all" | "conflict" | "tension" | "sanction" | "hub") => void;
  globalRisk: GlobalRisk;
  hovered: HoveredRisk | null;
  loading: boolean;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onClose?: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default function UIOverlay({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  globalRisk,
  hovered,
  loading,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetView,
  onClose,
}: UIOverlayProps) {
  const tooltipLeft = hovered
    ? clamp(hovered.x + 14, 8, Math.max(8, (typeof window !== "undefined" ? window.innerWidth : 800) - 290))
    : 8;
  const tooltipTop = hovered
    ? clamp(
        hovered.y - 12,
        70,
        Math.max(70, (typeof window !== "undefined" ? window.innerHeight : 680) - 90)
      )
    : 70;

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.62)_100%)]" />

      <div className="pointer-events-none absolute left-6 top-4 z-30 text-xs font-mono uppercase tracking-[0.26em] text-white/70 md:text-sm">
        Geopolitical Risk Map
      </div>

      <div className="terminal-card absolute right-6 top-6 z-50 hidden min-w-[170px] px-3 py-2.5 text-white transition-all duration-200 sm:block">
        <div className="text-[9px] uppercase tracking-[0.18em] text-white/50">Global Risk Index</div>
        <div className="data-value mt-1 text-2xl font-semibold tabular-nums">
          {loading ? "..." : globalRisk.score.toFixed(1)}
        </div>
        <div className="text-[10px] uppercase tracking-wide text-white/65">
          {loading ? "LOADING" : globalRisk.label}
        </div>
      </div>

      <div className="absolute right-6 top-[5.75rem] z-30 flex items-center gap-2 pointer-events-auto">
        <div className="terminal-card hidden items-center gap-1 px-2 py-1.5 md:flex">
          {(["all", "conflict", "tension", "sanction", "hub"] as const).map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => onFilterChange(entry)}
              className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide transition-all duration-200 ${
                filter === entry
                  ? "border-white/30 bg-white/15 text-white"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {entry}
            </button>
          ))}
        </div>
        <select
          value={filter}
          onChange={(e) =>
            onFilterChange(e.target.value as "all" | "conflict" | "tension" | "sanction" | "hub")
          }
          className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-[11px] text-white backdrop-blur-md md:hidden"
          aria-label="Risk filter"
        >
          <option value="all">All</option>
          <option value="conflict">Conflict</option>
          <option value="tension">Tension</option>
          <option value="sanction">Sanction</option>
          <option value="hub">Hub</option>
        </select>
        <div className="terminal-card flex items-center gap-1.5 px-2 py-1.5">
          <Search className="h-3.5 w-3.5 text-white/45" />
          <input
            id="risk-map-search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search..."
            className="w-28 bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 sm:w-40"
          />
        </div>
        <div className="terminal-card flex items-center gap-1.5 px-2 py-1.5">
          <button
            type="button"
            onClick={onZoomOut}
            className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/80 transition-all duration-200 hover:bg-white/10 active:scale-95"
            aria-label="Zoom out"
            title="Zoom out"
          >
            -
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/80 transition-all duration-200 hover:bg-white/10 active:scale-95"
            aria-label="Zoom in"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={onResetView}
            className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
            aria-label="Reset view"
            title="Reset view"
          >
            Reset
          </button>
          <span className="rounded border border-white/10 bg-black/35 px-2 py-1 text-[9px] text-white/70">
            {zoomLevel.toFixed(2)}x
          </span>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-white/20 p-1 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
              aria-label="Close map"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.04 }}
        className="terminal-card absolute bottom-4 left-6 z-30 hidden min-w-[220px] px-4 py-3 sm:block"
      >
        <div className="mb-1 text-[8px] uppercase tracking-[0.18em] text-white/45">Risk Indicators</div>
        <div className="flex items-center gap-2 text-[10px] text-white/75">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-white" />
          <span>Monochrome white glow signals</span>
        </div>
      </motion.div>

      {loading ? (
        <div className="terminal-card absolute inset-x-0 top-16 z-30 mx-auto max-w-[320px] px-4 py-2 text-center text-xs text-white/60">
          Loading risk data...
        </div>
      ) : null}

      {hovered ? (
        <div
          className="pointer-events-none absolute z-30 max-w-[270px] rounded border border-white/20 bg-black/70 px-2.5 py-2 text-[10px] text-white/90 shadow-[0_0_20px_rgba(255,255,255,0.08)] backdrop-blur-sm"
          style={{ left: tooltipLeft, top: tooltipTop }}
        >
          <div className="font-semibold">{hovered.point.label}</div>
          <div className="mt-0.5 text-white/75">{hovered.point.body}</div>
          {hovered.point.sourceName ? (
            <div className="mt-1 text-[9px] text-white/55">
              Source: {hovered.point.sourceName}
              {hovered.point.publishedAt ? ` • ${hovered.point.publishedAt}` : ""}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
