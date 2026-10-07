import { useEffect, useState } from 'react';
import { getApiBase } from '../config/theme.js';

export default function useHealth() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/health`);
        if (!res.ok) {
          if (mounted) setMessage('AI engine unavailable. Please start Ollama.');
          return;
        }
        const data = await res.json();
        if (mounted) {
          if (!data.ollama_available) {
            setMessage('AI engine unavailable. Please start Ollama.');
          } else if (data.missing_models && data.missing_models.length > 0) {
            setMessage(`Missing models: ${data.missing_models.join(', ')}`);
          } else {
            setMessage('');
          }
        }
      } catch {
        if (mounted) setMessage('AI engine unavailable. Please start Ollama.');
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return { message };
}
