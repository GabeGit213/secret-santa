import { useEffect, useState } from "react";
import { ro } from "../i18n/ro";
import { subjects } from "../subjects";
import type { Assignment, Participant } from "../lib/api";

export function Reveal({ assignment, participants }: { assignment: Assignment; participants: Participant[] }) {
  const receiver = participants.find((participant) => participant.id === assignment.receiver_id);
  const [revealed, setRevealed] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!pressed) return;
    const release = () => setRevealed(false);
    window.addEventListener("pointerup", release, { once: true });
    window.addEventListener("pointercancel", release, { once: true });
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [pressed]);

  if (!receiver) return null;
  const labels = receiver.subjects.map((key) => subjects.find((subject) => subject.key === key)?.label).filter(Boolean);

  function press() {
    setPressed(true);
    setRevealed(true);
  }
  function release() {
    setPressed(false);
    setRevealed(false);
  }

  return (
    <section className="card" style={{ textAlign: "center" }}>
      <p>{ro.revealIntro}</p>
      {revealed ? (
        <h2 style={{ fontSize: 28, margin: "12px 0" }}>{receiver.name}</h2>
      ) : (
        <button
          className="button button-secondary"
          type="button"
          onPointerDown={press}
          onPointerUp={release}
          onPointerLeave={release}
          onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") press(); }}
          onKeyUp={release}
          onClick={(event) => {
            if (event.detail === 0) setRevealed((value) => !value);
          }}
        >
          {ro.holdToReveal}
        </button>
      )}
      <p><strong>{ro.revealLikes}</strong></p>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
        {labels.map((label) => <span key={label} style={{ background: "var(--chip)", borderRadius: 999, padding: "8px 12px" }}>{label}</span>)}
      </div>
      <p style={{ marginTop: 20, fontWeight: 800 }}>{ro.keepSecret}</p>
    </section>
  );
}
