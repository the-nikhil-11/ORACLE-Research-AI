import React from 'react';
import ReactDOM from 'react-dom/client';
import { loadConfig } from './config/theme.js';
import App from './App.jsx';
import './styles.css';

loadConfig().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
