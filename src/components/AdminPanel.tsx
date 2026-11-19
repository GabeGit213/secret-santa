import { useEffect, useRef, useState } from "react";
import { ro } from "../i18n/ro";
import { adminReset } from "../lib/api";

export function AdminPanel({ onReset }: { onReset: () => void }) {
  const [pin, setPin] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function reset() {
    if (!confirming) {
      setConfirming(true);
      timer.current = window.setTimeout(() => setConfirming(false), 4_000);
      return;
    }
    setError("");
    setMessage("");
    try {
      await adminReset(pin);
      setMessage(ro.resetDone);
      setConfirming(false);
      onReset();
    } catch (resetError) {
      setError((resetError as { message?: string }).message?.includes("wrong_pin") ? ro.wrongPin : ro.errSaveFailed);
    }
  }

  return (
    <section className="card">
      <h2>{ro.adminTitle}</h2>
      <div className="field">
        <label htmlFor="pin">{ro.pinLabel}</label>
        <input id="pin" type="password" value={pin} onChange={(event) => setPin(event.target.value)} />
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <button className="button button-primary" type="button" onClick={() => void reset()}>
        {confirming ? ro.resetConfirm : ro.reset}
      </button>
    </section>
  );
}
