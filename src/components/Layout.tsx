import type { ReactNode } from "react";
import { ro } from "../i18n/ro";

export function Layout({ children, onAdmin, adminOpen = false }: { children: ReactNode; onAdmin?: () => void; adminOpen?: boolean }) {
  return (
    <main className="app-shell">
      <header className="app-header" style={{ position: "relative" }}>
        {onAdmin && (
          <button
            type="button"
            className="admin-button"
            aria-expanded={adminOpen}
            onClick={onAdmin}
          >
            {ro.admin}
          </button>
        )}
        <h1>{ro.appTitle} 🎁</h1>
        <p>{ro.subtitle}</p>
      </header>
      {children}
      <footer className="app-footer">{ro.madeBy}</footer>
    </main>
  );
}
