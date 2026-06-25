import type { CSSProperties, ReactNode } from "react";

type Shape = "pill" | "square" | "circle" | "burst";

// Decoratieve sticker-badge in puur CSS, met "die-cut" witte rand en schaduw.
// Altijd aria-hidden + pointer-events-none zodat het niets in de weg zit.
export default function Sticker({
  children,
  color = "#84cc16",
  text = "#111110",
  rotate = -6,
  shape = "pill",
  size = 1,
  className = "",
}: {
  children: ReactNode;
  color?: string;
  text?: string;
  rotate?: number;
  shape?: Shape;
  size?: number; // basis-fontgrootte in rem
  className?: string;
}) {
  const base: CSSProperties = {
    transform: `rotate(${rotate}deg)`,
    fontSize: `${size}rem`,
  };

  if (shape === "burst") {
    return (
      <span aria-hidden className={`pointer-events-none select-none inline-block ${className}`} style={base}>
        <span
          className="font-display flex items-center justify-center text-center font-black uppercase leading-[0.95] tracking-tight"
          style={{
            background: color,
            color: text,
            clipPath: STAR,
            width: "6.5em",
            height: "6.5em",
            padding: "1.6em",
            filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.18))",
          }}
        >
          {children}
        </span>
      </span>
    );
  }

  const radius = shape === "square" ? "0.7em" : "999em";
  const circle = shape === "circle";

  return (
    <span aria-hidden className={`pointer-events-none select-none inline-block ${className}`} style={base}>
      <span
        className="inline-flex bg-white"
        style={{ borderRadius: radius, padding: "0.28em", boxShadow: "0 12px 24px rgba(0,0,0,0.16)" }}
      >
        <span
          className="font-display inline-flex items-center justify-center text-center font-black uppercase leading-[0.95] tracking-tight"
          style={{
            background: color,
            color: text,
            borderRadius: `calc(${radius} - 0.2em)`,
            padding: circle ? 0 : "0.5em 0.85em",
            width: circle ? "4.8em" : undefined,
            height: circle ? "4.8em" : undefined,
          }}
        >
          {children}
        </span>
      </span>
    </span>
  );
}

// Spikey sunburst (24 punten)
const STAR =
  "polygon(50% 0%, 56% 9%, 65% 3%, 68% 14%, 79% 11%, 78% 22%, 90% 23%, 84% 33%, 95% 38%, 86% 46%, 100% 50%, 86% 54%, 95% 62%, 84% 67%, 90% 77%, 78% 78%, 79% 89%, 68% 86%, 65% 97%, 56% 91%, 50% 100%, 44% 91%, 35% 97%, 32% 86%, 21% 89%, 22% 78%, 10% 77%, 16% 67%, 5% 62%, 14% 54%, 0% 50%, 14% 46%, 5% 38%, 16% 33%, 10% 23%, 22% 22%, 21% 11%, 32% 14%, 35% 3%, 44% 9%)";
