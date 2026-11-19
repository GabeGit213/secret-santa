import { useState } from "react";
import { Layout } from "./components/Layout";
import { Message } from "./components/Message";
import { JoinForm } from "./components/JoinForm";
import { WaitingRoom } from "./components/WaitingRoom";
import { Reveal } from "./components/Reveal";
import { AdminPanel } from "./components/AdminPanel";
import { useSantaState } from "./hooks/useSantaState";

function App() {
  const state = useSantaState();
  const [editing, setEditing] = useState(false);

  if (location.hash === "#admin") {
    return <Layout><AdminPanel onReset={() => void state.refetch()} /></Layout>;
  }

  if (state.loading || !state.sessionReady) {
    return <Layout><Message /></Layout>;
  }
  if (state.error) {
    return <Layout><Message type="error" onReload={() => void state.refetch()} /></Layout>;
  }

  const me = state.participants.find((participant) => participant.id === state.userId);

  let screen;
  if (state.drawState?.status === "drawn" && state.assignment) {
    screen = <Reveal assignment={state.assignment} participants={state.participants} />;
  } else if (state.drawState?.status === "drawn") {
    screen = <Message type="info" />;
  } else if (!me || editing) {
    screen = (
      <JoinForm
        userId={state.userId}
        participant={me}
        isEditing={Boolean(me && editing)}
        onCancel={() => setEditing(false)}
        onSaved={() => { setEditing(false); void state.refetch(); }}
      />
    );
  } else {
    screen = (
      <WaitingRoom
        participants={state.participants}
        userId={state.userId}
        onEdit={() => setEditing(true)}
        onChanged={() => void state.refetch()}
      />
    );
  }

  return <Layout>{screen}</Layout>;
}

export default App;
