import { supabase } from "./supabase";

export type Participant = {
  id: string;
  name: string;
  subjects: string[];
  ready: boolean;
  created_at: string;
};

export type DrawState = {
  id: number;
  status: "open" | "drawn";
  drawn_at: string | null;
};

export type Assignment = {
  giver_id: string;
  receiver_id: string;
};

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

export async function loadApp(userId: string) {
  const [participants, draw, assignment] = await Promise.all([
    supabase.from("participants").select("*").order("created_at"),
    supabase.from("draw_state").select("*").eq("id", 1).maybeSingle(),
    supabase.from("assignments").select("giver_id, receiver_id").eq("giver_id", userId).maybeSingle(),
  ]);
  if (participants.error) throw participants.error;
  if (draw.error) throw draw.error;
  if (assignment.error) throw assignment.error;
  if (!draw.data) throw new Error("draw_state missing");
  return {
    participants: participants.data as Participant[],
    drawState: draw.data as DrawState,
    assignment: assignment.data as Assignment | null,
  };
}

export async function upsertParticipant(participant: { id: string; name: string; subjects: string[]; ready: false }) {
  const { error } = await supabase
    .from("participants")
    .upsert(participant, { onConflict: "id" });
  if (error) throw error;
}

export async function updateParticipant(id: string, values: { name: string; subjects: string[] }) {
  const { error } = await supabase.from("participants").update(values).eq("id", id);
  if (error) throw error;
}

export async function markReady(id: string) {
  const { error } = await supabase
    .from("participants")
    .update({ ready: true })
    .eq("id", id);
  if (error) throw error;
}

export async function adminReset(pin: string) {
  const { error } = await supabase.rpc("admin_reset", { pin });
  if (error) throw error;
}
