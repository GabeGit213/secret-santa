import { useEffect, useRef, useState } from "react";
import { ro } from "../i18n/ro";
import { subjects } from "../subjects";
import type { Assignment, Participant } from "../lib/api";

export function Reveal({ assignment, participants }: { assignment: Assignment; participants: Participant[] }) {
  const receiver = participants.find((participant) => participant.id === assignment.receiver_id);
  const [revealed, setRevealed] = useState(false);
  const [charging, setCharging] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const completed = useRef(false);

  useEffect(() => {
    return () => window.clearTimeout(timer.current);
  }, []);

  if (!receiver) return null;
  const labels = receiver.subjects.map((key) => subjects.find((subject) => subject.key === key)?.label).filter(Boolean);

  function startCharge() {
    if (revealed) return;
    completed.current = false;
    setCharging(true);
    if ("vibrate" in navigator) navigator.vibrate([30, 45, 30, 45, 30]);
    timer.current = window.setTimeout(() => {
      setCharging(false);
      completed.current = true;
      setRevealed(true);
      if ("vibrate" in navigator) navigator.vibrate([80]);
    }, 900);
  }

  function cancelCharge() {
    if (completed.current) return;
    window.clearTimeout(timer.current);
    setCharging(false);
  }

  return (
    <section className="card reveal-card" style={{ textAlign: "center" }}>
      <p>{ro.revealIntro}</p>
      {revealed ? (
        <h2 style={{ fontSize: 28, margin: "12px 0" }}>{receiver.name}</h2>
      ) : (
        <button
          className={`button button-secondary reveal-button${charging ? " reveal-charging" : ""}`}
          type="button"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            startCharge();
          }}
          onPointerUp={cancelCharge}
          onPointerCancel={cancelCharge}
          onLostPointerCapture={cancelCharge}
          onKeyDown={(event) => {
            if ((event.key === " " || event.key === "Enter") && !event.repeat) startCharge();
          }}
          onKeyUp={cancelCharge}
          onContextMenu={(event) => event.preventDefault()}
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
