import { ApiHealth } from "./components/ApiHealth";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <main className="flex max-w-lg flex-col gap-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          ValentinRSM
        </h1>
        <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Internes Relationship-Management – Entwicklungsstand Phase 1 (Docker &amp; Grundgerüst).
        </p>
        <ApiHealth />
      </main>
    </div>
  );
}
