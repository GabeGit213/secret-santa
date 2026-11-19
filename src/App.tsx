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
  const snowflakes = Array.from({ length: 24 }, (_, index) => (
    <span
      key={index}
      className="snowflake"
      style={{
        left: `${(index * 37) % 100}%`,
        animationDuration: `${9 + (index % 7)}s`,
        animationDelay: `${-(index * 1.31)}s`,
        fontSize: `${10 + (index % 4) * 3}px`,
      }}
      aria-hidden="true"
    >
      *
    </span>
  ));

  if (state.loading || !state.sessionReady) {
    return <><div className="snow" aria-hidden="true">{snowflakes}</div><Layout onAdmin={() => setAdminOpen((open) => !open)} adminOpen={adminOpen}><Message />{adminOpen && <div className="admin-panel"><AdminPanel onReset={() => void state.refetch()} /></div>}</Layout></>;
  }
  if (state.error) {
    return <><div className="snow" aria-hidden="true">{snowflakes}</div><Layout onAdmin={() => setAdminOpen((open) => !open)} adminOpen={adminOpen}><Message type="error" onReload={() => void state.refetch()} />{adminOpen && <div className="admin-panel"><AdminPanel onReset={() => void state.refetch()} /></div>}</Layout></>;
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
    <>
      <div className="snow" aria-hidden="true">{snowflakes}</div>
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
    </>
  );
}

export default App;
