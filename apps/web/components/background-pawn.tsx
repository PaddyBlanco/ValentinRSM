/** Großes, fast transparentes Pawn – nur Struktur im Hintergrund. */
export function BackgroundPawn() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] dark:opacity-[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pawn.svg"
          alt=""
          className="h-auto w-[min(95vw,900px)] max-w-none select-none"
        />
      </div>
    </div>
  );
}
