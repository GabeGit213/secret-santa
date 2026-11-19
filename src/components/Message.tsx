import { ro } from "../i18n/ro";

export function Message({ type = "loading", onReload }: { type?: "loading" | "error" | "info"; onReload?: () => void }) {
  return (
    <section className="card message" aria-live="polite">
      {type === "error" ? (
        <>
          <p className="error">{ro.errLoadFailed}</p>
          <button className="button button-primary" type="button" onClick={onReload}>{ro.reload}</button>
        </>
      ) : (
        <p>{type === "info" ? ro.drawnWithoutYou : ro.loading}</p>
      )}
    </section>
  );
}
