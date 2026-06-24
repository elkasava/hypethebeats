const words = [
  "hip-hop", "beatmaking", "songwriting", "rap", "r&b", "afrobeats", "drill",
  "recording", "zang", "performance", "branding", "mixing", "dancehall",
  "talent", "podium", "studio", "mental health", "flow",
];

export default function Ticker() {
  const loop = [...words, ...words];

  return (
    <div aria-hidden="true" className="relative w-full overflow-hidden border-y border-border bg-surface/60 py-4">
      <div className="flex w-max animate-marquee items-center gap-6 whitespace-nowrap">
        {loop.map((w, i) => (
          <span key={`${w}-${i}`} className="flex items-center gap-6">
            <span className="font-display text-lg font-bold uppercase tracking-tight text-foreground/90 sm:text-xl">
              {w}
            </span>
            <span className="text-accent-2">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
