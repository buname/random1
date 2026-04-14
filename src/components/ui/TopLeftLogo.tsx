/** 4-point sparkle, 16×16 viewBox — same geometry as landing `StarField` (outer 8, inner 3.2). */
const SPARKLE_PATH =
  "M 16 8 L 10.262 10.262 L 8 16 L 5.738 10.262 L 0 8 L 5.738 5.738 L 8 0 L 10.262 5.738 Z";

/** Decorative mark only: no link, no navigation; clicks pass through (`pointer-events-none`). */
export default function TopLeftLogo() {
  return (
    <div
      className="pointer-events-none flex h-8 w-8 shrink-0 cursor-default select-none items-center justify-center"
      aria-hidden
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        className="top-left-logo-breathe block shrink-0 overflow-visible"
        aria-hidden
      >
        <path d={SPARKLE_PATH} fill="#ffffff" />
      </svg>
    </div>
  );
}
