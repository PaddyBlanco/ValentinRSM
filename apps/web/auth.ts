import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

const authDisabled = process.env.AUTH_DISABLED === "true";

/** Entra liefert den Issuer oft ohne trailing slash; Abweichung löst OIDC-Fehler „issuer does not match“. */
function normalizedEntraIssuer(): string | undefined {
  const raw = process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER?.trim();
  if (!raw) return undefined;
  return raw.replace(/\/+$/, "");
}

function buildScopes(): string {
  const parts = ["openid", "profile", "email", "offline_access"];
  const apiScope = process.env.AUTH_API_SCOPE?.trim();
  if (apiScope) parts.push(apiScope);
  return parts.join(" ");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID ?? "",
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET ?? "",
      ...((): Record<string, never> | { issuer: string } => {
        const issuer = normalizedEntraIssuer();
        return issuer ? { issuer } : {};
      })(),
      authorization: {
        params: { scope: buildScopes() },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) token.accessToken = account.access_token;
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) session.accessToken = token.accessToken as string;
      return session;
    },
    /** Wer sich anmelden darf, steuern Sie im Microsoft Entra Admin Center (Unternehmens-App / Zuweisungen, Gruppen, Conditional Access). Die App vertraut einem erfolgreichen OAuth-Login. */
    async signIn() {
      return true;
    },
    authorized({ auth, request }) {
      if (authDisabled) return true;
      const path = request.nextUrl.pathname;
      if (path.startsWith("/login")) return true;
      return !!auth?.user;
    },
  },
});
