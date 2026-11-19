import { useState } from "react";
import { ro } from "../i18n/ro";
import { subjects } from "../subjects";
import { upsertParticipant, updateParticipant, type Participant } from "../lib/api";

type Props = {
  userId: string;
  participant?: Participant;
  isEditing: boolean;
  onCancel: () => void;
  onSaved: () => void;
};

export function JoinForm({ userId, participant, isEditing, onCancel, onSaved }: Props) {
  const [name, setName] = useState(participant?.name ?? "");
  const [first, setFirst] = useState(participant?.subjects[0] ?? "");
  const [second, setSecond] = useState(participant?.subjects[1] ?? "");
  const [third, setThird] = useState(participant?.subjects[2] ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    const selected = [first, second, third].filter(Boolean);
    if (!trimmed) return setError(ro.errNameRequired);
    if (selected.length < 2) return setError(ro.errMinSubjects);
    if (new Set(selected).size !== selected.length) return setError(ro.errDuplicateSubjects);
    setSaving(true);
    setError("");
    try {
      if (isEditing && participant) {
        await updateParticipant(userId, { name: trimmed, subjects: selected });
      } else {
        await upsertParticipant({ id: userId, name: trimmed, subjects: selected, ready: false });
      }
      onSaved();
    } catch (saveError) {
      const code = (saveError as { code?: string }).code;
      setError(code === "23505" ? ro.errNameTaken : ro.errSaveFailed);
    } finally {
      setSaving(false);
    }
  }

  function options(excluded: string[]) {
    return subjects
      .filter((subject) => !excluded.includes(subject.key))
      .map((subject) => <option key={subject.key} value={subject.key}>{subject.label}</option>);
  }

  return (
    <form className="card" onSubmit={submit}>
      <div className="field">
        <label htmlFor="name">{ro.nameLabel}</label>
        <input id="name" value={name} maxLength={40} placeholder={ro.namePlaceholder} onChange={(event) => setName(event.target.value)} />
      </div>
      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
        <legend className="field"><strong>{ro.subjectsLabel}</strong></legend>
        <div className="field">
          <select aria-label={ro.subjectPlaceholder} value={first} onChange={(event) => setFirst(event.target.value)}>
            <option value="">{ro.subjectPlaceholder}</option>
            {options([second, third])}
          </select>
        </div>
        <div className="field">
          <select aria-label={ro.subjectPlaceholder} value={second} onChange={(event) => setSecond(event.target.value)}>
            <option value="">{ro.subjectPlaceholder}</option>
            {options([first, third])}
          </select>
        </div>
        <div className="field">
          <select aria-label={ro.subjectOptionalPlaceholder} value={third} onChange={(event) => setThird(event.target.value)}>
            <option value="">{ro.subjectOptionalPlaceholder}</option>
            {options([first, second])}
          </select>
        </div>
      </fieldset>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="actions">
        <button className="button button-primary" type="submit" disabled={saving}>{isEditing ? ro.save : ro.join}</button>
        {isEditing && <button className="button button-secondary" type="button" onClick={onCancel}>{ro.cancel}</button>}
      </div>
    </form>
  );
}
