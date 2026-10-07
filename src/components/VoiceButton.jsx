import React, { useEffect, useRef, useState } from 'react';
import { getConfig } from '../config/theme.js';

function MicIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="1" width="6" height="10" rx="3" />
      <path d="M3 9a6 6 0 0012 0M9 17v-2" />
    </svg>
  );
}

export default function VoiceButton({ onTranscript, disabled }) {
  const [listening, setListening] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const recogRef = useRef(null);
  const config = getConfig() || {};

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) setUnavailable(true);
  }, []);

  function toggle() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is unavailable in this browser.');
      return;
    }
    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      return;
    }
    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onTranscript(transcript);
      if (config.voice_auto_submit) {
        // caller handles auto-submit if needed
      }
    };
    recog.onend = () => setListening(false);
    recog.onerror = () => setListening(false);
    recog.start();
    recogRef.current = recog;
    setListening(true);
  }

  if (unavailable) return null;

  return (
    <button
      type="button"
      className={`icon-btn${listening ? ' icon-btn--active' : ''}`}
      aria-label={listening ? 'Stop voice input' : 'Start voice input'}
      aria-pressed={listening}
      onClick={toggle}
      disabled={disabled && !listening}
      style={listening ? { border: '1px solid currentColor' } : {}}
    >
      <MicIcon active={listening} />
      {listening && (
        <span style={{ fontSize: 9, marginLeft: 2, letterSpacing: '0.05em' }}>
          LISTENING
        </span>
      )}
    </button>
  );
}
