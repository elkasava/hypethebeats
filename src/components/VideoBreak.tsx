export default function VideoBreak() {
  return (
    <section
      aria-labelledby="gastmentoren-titel"
      className="relative h-[55vh] min-h-[360px] w-full overflow-hidden md:h-[70vh]"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/mentors-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      />
      {/* Overlay in achtergrondkleur — alleen aan de onderkant zodat het naadloos overgaat in de mentors-sectie */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background" />

      {/* Zachte naadloze overgang — sluit exact aan op de kleur van de vorige sectie en vervaagt in de video */}
      <div className="absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-surface-2 to-transparent md:h-28" />

      {/* Titel vlak boven de kaarten, in een creatief font */}
      <div className="absolute inset-x-0 top-[70%] flex justify-center px-6 text-center md:top-[74%]">
        <h2
          id="gastmentoren-titel"
          className="font-creative text-4xl text-foreground drop-shadow-lg sm:text-5xl lg:text-6xl"
        >
          Gastmentoren
        </h2>
      </div>
    </section>
  );
}
