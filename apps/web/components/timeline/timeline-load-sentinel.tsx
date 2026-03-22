"use client";

import { useEffect, useRef } from "react";

/**
 * Ruft onLoadMore auf, wenn der Nutzer zum unteren Bereich scrollt (IntersectionObserver).
 */
export function TimelineLoadSentinel({
  onLoadMore,
  hasMore,
  /** Erster Ladevorgang — kein Beobachter, damit nicht doppelt die erste Seite geladen wird */
  loadingInitial,
}: {
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  loadingInitial: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loadingInitial) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void onLoadMore();
      },
      { root: null, rootMargin: "400px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadingInitial, onLoadMore]);

  return <div ref={ref} className="h-px w-full shrink-0" aria-hidden />;
}
