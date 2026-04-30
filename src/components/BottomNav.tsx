import { NavLink } from "react-router-dom";
import { Film, Camera as CameraIcon, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const items = [
    { to: "/", label: "Rolls", icon: Film },
    { to: "/cameras", label: "Cameras", icon: CameraIcon },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <nav
      className="fixed inset-x-0 z-40 flex justify-center pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      aria-label="Primary"
    >
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/80 dark:bg-muted/70 backdrop-blur-xl px-3 py-2.5 shadow-lg shadow-black/20">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Icon className="size-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
