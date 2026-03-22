"use client";

import { faGear, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SettingsContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings muss innerhalb von SettingsProvider verwendet werden.");
  }
  return ctx;
}

type CategoryId = "general";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "general", label: "Allgemein" },
];

function AppearanceSelect() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 max-w-sm rounded-lg border border-[var(--hairline)] bg-[var(--hover)]/30" aria-hidden />
    );
  }

  return (
    <div className="flex max-w-sm flex-col gap-2">
      <label htmlFor="settings-appearance" className="text-sm font-medium text-[var(--fg)]">
        Aussehen
      </label>
      <select
        id="settings-appearance"
        className="rounded-lg border border-[var(--hairline)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--fg)] shadow-sm outline-none transition focus:border-[var(--fg-muted)] focus:ring-2 focus:ring-[var(--fg-muted)]/25"
        value={theme ?? "system"}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="light">Hell</option>
        <option value="dark">Dunkel</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}

function SettingsPanelGeneral() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-1 text-lg font-semibold tracking-tight text-[var(--fg)]">Allgemein</h3>
        <p className="text-sm text-[var(--fg-muted)]">Grundlegende Darstellung der Anwendung.</p>
      </div>
      <section aria-labelledby="settings-appearance-heading">
        <h4
          id="settings-appearance-heading"
          className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]"
        >
          Aussehen
        </h4>
        <AppearanceSelect />
      </section>
    </div>
  );
}

function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("general");

  const handleClose = useCallback(() => {
    setActiveCategory("general");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity"
        onClick={handleClose}
        aria-label="Einstellungen schließen"
      />
      <div
        className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl border border-[var(--hairline)] bg-[var(--bg-elevated)] shadow-xl sm:rounded-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[var(--hairline)] px-4 py-3">
          <h2 id="settings-dialog-title" className="text-base font-semibold tracking-tight">
            Einstellungen
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[var(--fg-muted)] transition hover:border-[var(--hairline)] hover:bg-[var(--hover)] hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg-muted)]"
            aria-label="Schließen"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <nav
            className="flex shrink-0 flex-row gap-0.5 overflow-x-auto border-b border-[var(--hairline)] p-2 sm:w-48 sm:flex-col sm:overflow-y-auto sm:border-b-0 sm:border-r sm:p-2"
            aria-label="Einstellungskategorien"
          >
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm transition sm:w-full ${
                    active
                      ? "bg-[var(--hover)] font-medium text-[var(--fg)]"
                      : "text-[var(--fg-muted)] hover:bg-[var(--hover)]/70 hover:text-[var(--fg)]"
                  }`}
                  aria-current={active ? "true" : undefined}
                >
                  {cat.label}
                </button>
              );
            })}
          </nav>

          <div className="min-h-[min(60vh,480px)] flex-1 overflow-y-auto overscroll-contain p-4 sm:min-h-0">
            {activeCategory === "general" && <SettingsPanelGeneral />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const onClose = useCallback(() => setOpen(false), []);

  const value = useMemo<SettingsContextValue>(
    () => ({ open, setOpen }),
    [open, setOpen],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
      <SettingsModal open={open} onClose={onClose} />
    </SettingsContext.Provider>
  );
}

/** Unten links (Sidebar) oder kompakt (Mobile-Header): öffnet das Einstellungsfenster. */
export function SettingsTrigger({
  variant = "sidebar",
  className = "",
}: {
  variant?: "sidebar" | "compact";
  className?: string;
}) {
  const { setOpen } = useSettings();

  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--hairline)] text-[var(--fg-muted)] transition hover:bg-[var(--hover)] hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg-muted)]";

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${base} h-10 w-10 shrink-0 p-0 ${className}`}
        aria-label="Einstellungen öffnen"
      >
        <FontAwesomeIcon icon={faGear} className="h-[1.125rem] w-[1.125rem]" aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`${base} w-full justify-start px-3 py-2.5 text-left text-xs ${className}`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--hover)] text-[var(--fg)]">
        <FontAwesomeIcon icon={faGear} className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span className="font-medium">Einstellungen</span>
    </button>
  );
}
