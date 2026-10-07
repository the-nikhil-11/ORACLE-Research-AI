/**
 * Fetch /api/config, apply CSS variables to :root, and expose config values.
 */
const API_BASE = import.meta.env.VITE_API_BASE || '';

let _config = null;

export async function loadConfig() {
  try {
    const res = await fetch(`${API_BASE}/api/config`);
    if (!res.ok) throw new Error('Config fetch failed');
    _config = await res.json();
  } catch {
    // Use safe defaults
    _config = {
      app_name: 'ORACLE',
      user_name: 'RESEARCHER',
      bg: '#000000',
      fg: '#FFFFFF',
      fg_secondary: '#A0A0A0',
      border: '#2A2A2A',
      input_bg: '#080808',
      font_family: '"Departure Mono", "JetBrains Mono", ui-monospace, monospace',
      font_size: '15px',
      radius: '0px',
      tts_enabled: false,
      voice_auto_submit: false,
      debug: false,
    };
  }

  // Apply CSS variables
  const root = document.documentElement;
  if (_config.bg) root.style.setProperty('--bg', _config.bg);
  if (_config.fg) root.style.setProperty('--fg', _config.fg);
  if (_config.fg_secondary) root.style.setProperty('--fg-secondary', _config.fg_secondary);
  if (_config.border) root.style.setProperty('--border', _config.border);
  if (_config.input_bg) root.style.setProperty('--input-bg', _config.input_bg);
  if (_config.font_family) root.style.setProperty('--font-family', _config.font_family);
  if (_config.font_size) root.style.setProperty('--font-size', _config.font_size);
  if (_config.radius) root.style.setProperty('--radius', _config.radius);

  // Page title
  document.title = _config.app_name || 'ORACLE';

  return _config;
}

export function getConfig() {
  return _config;
}

export function getApiBase() {
  return API_BASE;
}
