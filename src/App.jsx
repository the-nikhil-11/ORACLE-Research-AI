import React, { useState } from 'react';
import Home from './pages/Home.jsx';
import Research from './pages/Research.jsx';

export default function App() {
  const [session, setSession] = useState(null); // null = home screen

  function startResearch(query, files) {
    setSession({ query, files, exchanges: [] });
  }

  function resetSession() {
    setSession(null);
  }

  return session === null
    ? <Home onSubmit={startResearch} />
    : <Research session={session} onNew={resetSession} />;
}
