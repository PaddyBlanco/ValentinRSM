"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type NavRefreshContextValue = {
  refreshKey: number;
  /** Nach Änderungen an Firmen/Timeline aufrufen, damit die linke Navigation neu lädt */
  bumpNavRefresh: () => void;
};

const NavRefreshContext = createContext<NavRefreshContextValue | null>(null);

export function NavRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpNavRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const value = useMemo(
    (): NavRefreshContextValue => ({ refreshKey, bumpNavRefresh }),
    [refreshKey, bumpNavRefresh],
  );

  return <NavRefreshContext.Provider value={value}>{children}</NavRefreshContext.Provider>;
}

/** Nur für NavSidebar: `refreshKey` als useEffect-Abhängigkeit */
export function useNavRefreshKey(): number {
  const ctx = useContext(NavRefreshContext);
  return ctx?.refreshKey ?? 0;
}

export function useBumpNavRefresh(): () => void {
  const ctx = useContext(NavRefreshContext);
  return ctx?.bumpNavRefresh ?? (() => {});
}
