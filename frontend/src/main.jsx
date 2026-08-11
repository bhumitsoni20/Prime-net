import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { validateEnv } from './config/env.js';

validateEnv();

// Handle dynamic module import failures globally (e.g. user has old deployment loaded in browser)
window.addEventListener('unhandledrejection', (event) => {
  const isChunkError =
    event?.reason?.name === 'TypeError' ||
    event?.reason?.message?.includes('Failed to fetch dynamically imported module') ||
    event?.reason?.message?.includes('Importing a module script failed');

  if (isChunkError) {
    const reloadKey = 'streamkart_chunk_rejection_reload';
    if (!sessionStorage.getItem(reloadKey)) {
      sessionStorage.setItem(reloadKey, 'true');
      window.location.reload();
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

