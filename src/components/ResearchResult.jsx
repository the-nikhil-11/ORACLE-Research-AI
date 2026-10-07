import React, { useRef } from 'react';
import ResearchSection from './ResearchSection.jsx';
import SourceList from './SourceList.jsx';
import { getConfig } from '../config/theme.js';

// Render inline citations as clickable spans
function renderWithCitations(text, citations, onCitationClick) {
  if (!text) return null;
  const parts = text.split(/(\[Source\s+\d+[^\]]*\])/g);
  return parts.map((part, i) => {
    const match = part.match(/\[Source\s+(\d+)([^\]]*)\]/);
    if (match) {
      const num = parseInt(match[1], 10);
      return (
        <span
          key={i}
          className="citation-ref"
          role="link"
          tabIndex={0}
          aria-label={`Source ${num}`}
          onClick={() => onCitationClick(num)}
          onKeyDown={e => e.key === 'Enter' && onCitationClick(num)}
        >
          {part}
        </span>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export default function ResearchResult({ streamText, citations, isStreaming, debug }) {
  const config = getConfig() || {};
  const sourceRefs = useRef({});

  function handleCitationClick(num) {
    const el = sourceRefs.current[num];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    el.classList.add('source-item--highlighted');
    el.classList.add('citation-ref--highlight');
    setTimeout(() => {
      el.classList.remove('source-item--highlighted');
      el.classList.remove('citation-ref--highlight');
    }, 1200);
  }

  function copyText() {
    navigator.clipboard?.writeText(streamText).catch(() => {});
  }

  const hasCitations = citations && citations.length > 0;

  return (
    <div>
      <div className="result-section" aria-live="polite">
        <div className="result-section__header">RESEARCH SUMMARY</div>
        <div className="result-section__body stream-text">
          {renderWithCitations(streamText, citations, handleCitationClick)}
          {isStreaming && <span className="thinking__cursor" aria-hidden="true" />}
        </div>
      </div>

      {hasCitations && !isStreaming && (
        <SourceList
          citations={citations}
          sourceRefs={sourceRefs}
          debug={debug}
        />
      )}

      {!isStreaming && (
        <div className="answer-actions" role="toolbar" aria-label="Answer actions">
          <button className="action-btn" onClick={copyText} aria-label="Copy answer">
            COPY
          </button>
          {config.tts_enabled && (
            <button
              className="action-btn"
              aria-label="Speak answer"
              onClick={() => {
                const utt = new SpeechSynthesisUtterance(streamText);
                window.speechSynthesis.speak(utt);
              }}
            >
              SPEAK
            </button>
          )}
        </div>
      )}
    </div>
  );
}
