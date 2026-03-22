import { BackgroundPawn } from "../branding/background-pawn";
import { NavRefreshProvider } from "@/components/layout/nav-refresh-context";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileHeader } from "./mobile-header";
import { NavSidebar } from "./nav-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <NavRefreshProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        <MobileHeader />
        <NavSidebar />
        <div className="relative flex min-h-0 min-h-screen flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:min-h-screen md:pb-0">
          <BackgroundPawn />
          <div className="relative z-0 flex-1">{children}</div>
        </div>
        <MobileBottomNav />
      </div>
    </NavRefreshProvider>
  );
}
