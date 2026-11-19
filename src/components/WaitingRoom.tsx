import { ro } from "../i18n/ro";
import { markReady, type Participant } from "../lib/api";

type Props = {
  participants: Participant[];
  userId: string;
  targetCount: number;
  onEdit: () => void;
  onChanged: () => void;
};

export function WaitingRoom({ participants, userId, targetCount, onEdit, onChanged }: Props) {
  const me = participants.find((participant) => participant.id === userId);
  const readyCount = participants.filter((participant) => participant.ready).length;

  async function ready() {
    if (!me) return;
    await markReady(me.id);
    onChanged();
  }

  return (
    <section className="card waiting-card">
      <p><strong>{ro.readyCount(readyCount, participants.length)}</strong></p>
      {participants.length < targetCount && <p>{ro.needThree(targetCount)}</p>}
      <ul aria-live="polite" style={{ listStyle: "none", padding: 0, margin: "16px 0", display: "grid", gap: 8 }}>
        {participants.map((participant) => (
          <li key={participant.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 12 }}>
            <span><strong>{participant.name}</strong>{participant.id === userId ? ` ${ro.you}` : ""}</span>
            <span>{participant.ready ? ro.badgeReady : ro.badgeFilling}</span>
          </li>
        ))}
      </ul>
      <p>{ro.drawAutomatic}</p>
      {me && (
        me.ready ? (
          <p style={{ textAlign: "center", fontWeight: 800, color: "var(--success)" }}>{ro.youAreReady}</p>
        ) : (
          <div className="actions">
            <button className="button button-primary" type="button" onClick={() => void ready()}>{ro.imReady}</button>
            <button className="button button-secondary" type="button" onClick={onEdit}>{ro.edit}</button>
          </div>
        )
      )}
    </section>
  );
}
