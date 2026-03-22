import { BackgroundPawn } from "./background-pawn";
import { NavSidebar } from "./nav-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <NavSidebar />
      <div className="relative min-h-screen flex-1">
        <BackgroundPawn />
        <div className="relative z-0">{children}</div>
      </div>
    </div>
  );
}
