import type { ReactNode } from "react";
import { ro } from "../i18n/ro";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>{ro.appTitle} 🎁</h1>
        <p>{ro.subtitle}</p>
      </header>
      {children}
    </main>
  );
}
