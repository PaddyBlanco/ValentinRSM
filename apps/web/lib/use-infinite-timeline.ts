"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TimelineEntry } from "@/lib/api";
import { fetchTimeline } from "@/lib/api";

export const TIMELINE_PAGE_SIZE = 10;

export type InfiniteTimelineFilters = {
  companyId?: string;
  contactId?: string;
};

/**
 * Lädt Timeline-Einträge in Blöcken (Standard 10), mit {@link refresh} von vorn.
 */
export function useInfiniteTimeline(
  filters: InfiniteTimelineFilters,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? true;
  const [items, setItems] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const inFlightRef = useRef(false);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const resetAndLoad = useCallback(async () => {
    const f = filtersRef.current;
    inFlightRef.current = false;
    offsetRef.current = 0;
    setItems([]);
    setHasMore(true);
    setLoading(true);
    setErr(null);
    try {
      const batch = await fetchTimeline({ ...f, take: TIMELINE_PAGE_SIZE, skip: 0 });
      offsetRef.current = batch.length;
      setItems(batch);
      setHasMore(batch.length === TIMELINE_PAGE_SIZE);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Laden fehlgeschlagen.");
      setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (inFlightRef.current || !hasMore) return;
    inFlightRef.current = true;
    setLoadingMore(true);
    setErr(null);
    try {
      const f = filtersRef.current;
      const batch = await fetchTimeline({ ...f, take: TIMELINE_PAGE_SIZE, skip: offsetRef.current });
      offsetRef.current += batch.length;
      setItems((prev) => [...prev, ...batch]);
      setHasMore(batch.length === TIMELINE_PAGE_SIZE);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Laden fehlgeschlagen.");
    } finally {
      inFlightRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setItems([]);
      setHasMore(false);
      return;
    }
    void resetAndLoad();
  }, [enabled, filters.companyId, filters.contactId, resetAndLoad]);

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    err,
    loadMore,
    refresh: resetAndLoad,
  };
}
