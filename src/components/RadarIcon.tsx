type RadarIconProps = {
  size?: number | string;
  className?: string;
  monochrome?: boolean;
  rotationSeconds?: number;
};

export default function RadarIcon({
  size = 64,
  className = "",
  monochrome = false,
  rotationSeconds = 3.6,
}: RadarIconProps) {
  const outerBorderClass = monochrome
    ? "border-white/60 shadow-[0_0_24px_rgba(255,255,255,0.35)]"
    : "border-cyan-400/50 shadow-[0_0_24px_rgba(6,182,212,0.45)]";
  const ringClass = monochrome ? "border-white/35" : "border-cyan-300/35";
  const innerRingClass = monochrome ? "border-white/30" : "border-cyan-300/30";
  const shellRingClass = monochrome ? "border-white/20" : "border-cyan-400/20";
  const dotClass = monochrome
    ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]"
    : "bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)]";

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div
        className={`absolute inset-0 rounded-full border ${outerBorderClass}`}
        style={{
          backgroundImage: monochrome
            ? "radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.84) 62%), conic-gradient(from 0deg, rgba(255,255,255,0.52), rgba(255,255,255,0.08) 35%, transparent 65%, transparent 100%)"
            : "radial-gradient(circle at center, rgba(59,130,246,0.24) 0%, rgba(8,8,8,0.8) 62%), conic-gradient(from 0deg, rgba(6,182,212,0.55), rgba(6,182,212,0.04) 35%, transparent 65%, transparent 100%)",
        }}
      />
      <div className={`absolute inset-[18%] rounded-full border ${ringClass}`} />
      <div className={`absolute inset-[36%] rounded-full border ${innerRingClass}`} />
      <div
        className={`absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full ${dotClass}`}
      />
      <div className={`absolute inset-[6%] rounded-full border ${shellRingClass}`} />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: monochrome
            ? "conic-gradient(from -90deg, rgba(255,255,255,0.96) 0deg, rgba(255,255,255,0.12) 24deg, transparent 56deg)"
            : "conic-gradient(from -90deg, rgba(34,211,238,0.95) 0deg, rgba(34,211,238,0.08) 24deg, transparent 56deg)",
          maskImage: "radial-gradient(circle at center, transparent 0 24%, black 25%)",
          WebkitMaskImage: "radial-gradient(circle at center, transparent 0 24%, black 25%)",
          filter: monochrome
            ? "drop-shadow(0 0 8px rgba(255,255,255,0.5))"
            : "drop-shadow(0 0 8px rgba(6,182,212,0.65))",
          animation: `spin ${rotationSeconds}s linear infinite`,
        }}
      />
    </div>
  );
}
