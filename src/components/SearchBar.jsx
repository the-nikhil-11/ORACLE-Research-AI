import React, { useEffect, useRef, useState } from 'react';
import FileAttachment from './FileAttachment.jsx';
import VoiceButton from './VoiceButton.jsx';

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function AttachIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8.5l-6.5 6.5a4.5 4.5 0 01-6.364-6.364l7-7a3 3 0 114.243 4.243l-7.07 7.07a1.5 1.5 0 01-2.122-2.121l6.5-6.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h12M9 3l6 6-6 6" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="3" y="3" width="10" height="10" rx="1" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SearchBar({
  onSubmit,
  onStop,
  autoFocus = false,
  compact = false,
  disabled = false,
  placeholder = 'What do you want to research?',
}) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, parseFloat(getComputedStyle(ta).fontSize) * 1.6 * 6)}px`;
  }, [text]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === 'Escape') {
      textareaRef.current?.blur();
    }
  }

  function submit() {
    if (!text.trim() && files.length === 0) return;
    if (disabled) return;
    onSubmit(text.trim(), files);
    setText('');
    setFiles([]);
  }

  function handleFilePick(e) {
    const picked = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...picked]);
    e.target.value = '';
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  function handleDrop(e) {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    setFiles(prev => [...prev, ...dropped]);
  }

  const canSubmit = (text.trim().length > 0 || files.length > 0) && !disabled;

  return (
    <div
      className="searchbar"
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      role="search"
    >
      {files.length > 0 && (
        <div className="searchbar__chips" aria-label="Attached files">
          {files.map((f, i) => (
            <FileAttachment key={i} file={f} onRemove={() => removeFile(i)} />
          ))}
        </div>
      )}

      <div className="searchbar__row">
        <textarea
          ref={textareaRef}
          className="searchbar__textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          aria-label="Research query input"
          aria-multiline="true"
        />
        <div className="searchbar__actions">
          <button
            type="button"
            className="icon-btn"
            aria-label="Attach file"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <AttachIcon />
          </button>
          <VoiceButton
            onTranscript={t => setText(prev => prev + (prev ? ' ' : '') + t)}
            disabled={disabled}
          />
          {disabled ? (
            <button
              type="button"
              className="icon-btn"
              aria-label="Stop research"
              onClick={onStop}
            >
              <StopIcon />
            </button>
          ) : (
            <button
              type="button"
              className="icon-btn"
              aria-label="Submit research query"
              onClick={submit}
              disabled={!canSubmit}
            >
              <ArrowIcon />
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.md,.docx,image/*"
        style={{ display: 'none' }}
        onChange={handleFilePick}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
