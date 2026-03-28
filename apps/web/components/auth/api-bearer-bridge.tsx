"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { setApiBearerTokenGetter } from "@/lib/api";

/** Stellt das Entra-Access-Token für {@link fetchJson} / postJson bereit (nur Client). */
export function ApiBearerBridge() {
  const { data: session, status } = useSession();

  useEffect(() => {
    setApiBearerTokenGetter(() =>
      status === "authenticated" && session?.accessToken ? session.accessToken : null,
    );
  }, [session?.accessToken, status]);

  return null;
}
