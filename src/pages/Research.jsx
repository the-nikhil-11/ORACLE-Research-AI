import React, { useCallback, useEffect, useRef, useState } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import ResearchResult from '../components/ResearchResult.jsx';
import { getConfig, getApiBase } from '../config/theme.js';

const API_BASE = getApiBase ? (getApiBase() || '') : '';

export default function Research({ session, onNew }) {
  const config = getConfig() || {};
  const appName = config.app_name || 'ORACLE';
  const [exchanges, setExchanges] = useState([
    { query: session.query, files: session.files, status: 'thinking', result: null, streamText: '' }
  ]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(null);

  // Run the first query on mount
  useEffect(() => {
    runQuery(0, session.query, session.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcut: Ctrl/Cmd+K → new research
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onNew();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNew]);

  async function runQuery(idx, query, files) {
    setBusy(true);
    abortRef.current = new AbortController();

    // Upload files first (collect document_ids)
    let document_ids = [];
    if (files && files.length > 0) {
      for (const f of files) {
        try {
          const fd = new FormData();
          fd.append('file', f);
          const res = await fetch(`${API_BASE}/api/documents`, {
            method: 'POST',
            body: fd,
            signal: abortRef.current.signal,
          });
          if (res.ok) {
            const data = await res.json();
            if (data.document_id) document_ids.push(data.document_id);
            setExchanges(prev => {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], fileState: 'indexed' };
              return updated;
            });
          }
        } catch {
          // continue
        }
      }
    }

    // Stream
    try {
      const body = JSON.stringify({ query, document_ids });
      const res = await fetch(`${API_BASE}/api/research/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let citations = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('event: citations')) {
            // next data line has JSON
            continue;
          }
          if (line.startsWith('data: ')) {
            const payload = line.slice(6);
            if (payload === '[DONE]') break;
            // Check if it's citation JSON (from event: citations)
            if (payload.startsWith('[')) {
              try { citations = JSON.parse(payload); } catch {}
              continue;
            }
            setExchanges(prev => {
              const updated = [...prev];
              updated[idx] = {
                ...updated[idx],
                status: 'streaming',
                streamText: (updated[idx].streamText || '') + payload,
              };
              return updated;
            });
          }
        }
      }

      setExchanges(prev => {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          status: 'done',
          citations: citations || [],
        };
        return updated;
      });
    } catch (e) {
      if (e.name === 'AbortError') return;
      const msg = e.message?.includes('fetch') || e.message?.includes('Failed')
        ? 'AI engine unavailable. Please start Ollama.'
        : e.message;
      setExchanges(prev => {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], status: 'error', error: msg };
        return updated;
      });
    } finally {
      setBusy(false);
    }
  }

  function handleNewQuery(query, files) {
    const idx = exchanges.length;
    setExchanges(prev => [
      ...prev,
      { query, files, status: 'thinking', result: null, streamText: '' }
    ]);
    runQuery(idx, query, files);
  }

  function handleStop() {
    if (abortRef.current) abortRef.current.abort();
    setBusy(false);
  }

  return (
    <div className="research-page">
      {/* Sticky search bar */}
      <div className="research-bar-wrapper">
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="research-header__appname"
            onClick={onNew}
            aria-label="Start new research session"
            title="New research (Ctrl+K)"
          >
            {appName}
          </button>
          <SearchBar
            compact
            onSubmit={handleNewQuery}
            disabled={busy}
            onStop={handleStop}
            placeholder="Follow-up research..."
          />
        </div>
      </div>

      {/* Exchanges */}
      <div className="research-content" role="main">
        <div className="research-column" aria-live="polite">
          {exchanges.map((ex, i) => (
            <div key={i} className="exchange">
              <div className="exchange__query" aria-label={`Query: ${ex.query}`}>
                {ex.query}
              </div>
              {ex.status === 'thinking' && (
                <div className="thinking" aria-live="polite">
                  THINKING<span className="thinking__cursor" aria-hidden="true" />
                </div>
              )}
              {(ex.status === 'streaming' || ex.status === 'done') && (
                <ResearchResult
                  streamText={ex.streamText || ''}
                  citations={ex.citations || []}
                  isStreaming={ex.status === 'streaming'}
                  debug={config.debug}
                />
              )}
              {ex.status === 'error' && (
                <div className="result-error" role="alert">{ex.error}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
