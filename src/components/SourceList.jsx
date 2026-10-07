import React, { useState } from 'react';

export default function SourceList({ citations, sourceRefs, debug }) {
  const [expanded, setExpanded] = useState({});

  if (!citations || citations.length === 0) return null;

  return (
    <div className="result-section">
      <div className="result-section__header">SOURCES</div>
      <ul className="source-list" aria-label="Source list">
        {citations.map((cite, i) => {
          const num = cite.source_number || i + 1;
          const isExpanded = expanded[num];
          return (
            <li
              key={num}
              className="source-item"
              ref={el => { if (el) sourceRefs.current[num] = el; }}
              id={`source-${num}`}
            >
              <span className="source-item__ref">[{String(num).padStart(2, '0')}]</span>
              <span className="source-item__title">
                {cite.title || cite.filename}
              </span>
              <div className="source-item__meta">
                {cite.filename}
                {cite.page ? `, Page ${cite.page}` : ''}
                {cite.section ? `, Section: ${cite.section}` : ''}
              </div>
              {debug && cite.passage && (
                <div>
                  <button
                    className="action-btn"
                    style={{ marginTop: 4 }}
                    aria-expanded={isExpanded}
                    onClick={() => setExpanded(prev => ({ ...prev, [num]: !prev[num] }))}
                  >
                    {isExpanded ? 'hide passage' : 'show passage'}
                  </button>
                  {isExpanded && (
                    <div className="source-item__passage" aria-live="polite">
                      {cite.passage}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
