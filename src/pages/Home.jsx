import React, { useRef, useState } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import { getConfig } from '../config/theme.js';
import useHealth from '../hooks/useHealth.js';

export default function Home({ onSubmit }) {
  const config = getConfig() || {};
  const appName = config.app_name || 'ORACLE';
  const userName = config.user_name || 'RESEARCHER';
  const { message: healthMsg } = useHealth();

  return (
    <main className="home" aria-label="Research home">
      <div className="home__brand" aria-live="polite">
        <h1 className="home__appname">{appName}</h1>
        <p className="home__username">{userName}</p>
      </div>

      <SearchBar
        autoFocus
        onSubmit={onSubmit}
        placeholder="What do you want to research?"
      />

      {healthMsg && (
        <div className="status-line" role="alert" aria-live="assertive">
          {healthMsg}
        </div>
      )}
    </main>
  );
}
