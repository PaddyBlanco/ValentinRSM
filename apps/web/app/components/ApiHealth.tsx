"use client";

import { useEffect, useState } from "react";

export function ApiHealth() {
  const [text, setText] = useState<string>("…");

  useEffect(() => {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(
      /\/$/,
      ""
    );
    fetch(`${base}/health`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setText(JSON.stringify(j)))
      .catch(() => setText("nicht erreichbar"));
  }, []);

  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      <span className="font-medium text-zinc-800 dark:text-zinc-200">API /health:</span>{" "}
      {text}
    </p>
  );
}
