import { useCallback, useEffect, useState } from "react";
import { getSession, loadApp, signInAnonymously, type Assignment, type DrawState, type Participant } from "../lib/api";
import { supabase } from "../lib/supabase";

export function useSantaState() {
  const [sessionReady, setSessionReady] = useState(false);
  const [userId, setUserId] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refetch = useCallback(async (id: string = userId) => {
    if (!id) return;
    try {
      setError(false);
      const data = await loadApp(id);
      setParticipants(data.participants);
      setDrawState(data.drawState);
      setAssignment(data.assignment);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let disposed = false;
    async function init() {
      try {
        let session = await getSession();
        if (!session) session = await signInAnonymously();
        if (disposed || !session?.user) return;
        setUserId(session.user.id);
        setSessionReady(true);
        await refetch(session.user.id);
      } catch {
        setError(true);
        setLoading(false);
      }
    }
    void init();
    return () => { disposed = true; };
  }, [refetch]);

  useEffect(() => {
    if (!sessionReady || !userId) return;
    const channel = supabase
      .channel("secret-santa-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, () => void refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "draw_state" }, () => void refetch())
      .subscribe();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refetch();
    };
    document.addEventListener("visibilitychange", onVisible);
    const poll = window.setInterval(() => void refetch(), 10_000);
    return () => {
      void supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(poll);
    };
  }, [refetch, sessionReady, userId]);

  return { sessionReady, userId, participants, drawState, assignment, loading, error, refetch };
}
