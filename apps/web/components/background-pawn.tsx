import { PawnMark } from "./pawn-mark";

/** Großes, fast transparentes Pawn – nur Struktur im Hintergrund. */
export function BackgroundPawn() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 flex items-center justify-center text-[var(--fg)] opacity-[0.018] dark:opacity-[0.032]">
        <PawnMark className="h-auto w-[min(95vw,900px)] max-w-none shrink-0 origin-center scale-[3] rotate-[33deg] select-none" />
      </div>
    </div>
  );
}
