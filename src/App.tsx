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
  const [adminOpen, setAdminOpen] = useState(location.hash === "#admin");

  if (state.loading || !state.sessionReady) {
    return <Layout onAdmin={() => setAdminOpen((open) => !open)} adminOpen={adminOpen}><Message />{adminOpen && <div className="admin-panel"><AdminPanel onReset={() => void state.refetch()} /></div>}</Layout>;
  }
  if (state.error) {
    return <Layout onAdmin={() => setAdminOpen((open) => !open)} adminOpen={adminOpen}><Message type="error" onReload={() => void state.refetch()} />{adminOpen && <div className="admin-panel"><AdminPanel onReset={() => void state.refetch()} /></div>}</Layout>;
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
        targetCount={state.drawState?.target_count ?? 25}
        onEdit={() => setEditing(true)}
        onChanged={() => void state.refetch()}
      />
    );
  }

  return (
    <Layout
      onAdmin={() => setAdminOpen((open) => !open)}
      adminOpen={adminOpen}
    >
      {screen}
      {adminOpen && (
        <div className="admin-panel">
          <AdminPanel onReset={() => void state.refetch()} />
        </div>
      )}
    </Layout>
  );
}

export default App;
