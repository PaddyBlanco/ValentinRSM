import { ApiBearerBridge } from "@/components/auth/api-bearer-bridge";
import { AppShell } from "@/components/layout/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ApiBearerBridge />
      <AppShell>{children}</AppShell>
    </>
  );
}
