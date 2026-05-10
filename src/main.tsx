import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { API_BASE_URL } from './config';

// Render app immediately — don't block on backend sync
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Sync with backend in the background after app is rendered
async function syncWithBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/sync.php`);
    if (!response.ok) return;
    const data = await response.json();

    // Preserve auth keys so login session is not wiped
    const authKeys = ['studio_auth_current_user', 'studio_auth_users'];
    for (const [key, value] of Object.entries(data)) {
      if (!authKeys.includes(key)) {
        // Use the native setItem directly to avoid triggering the monkey-patch loop
        Object.getPrototypeOf(localStorage).setItem.call(
          localStorage,
          key,
          typeof value === 'string' ? value : JSON.stringify(value)
        );
      }
    }
  } catch (err) {
    console.warn('Backend sync failed — running in offline/local mode.', err);
  }
}

syncWithBackend();

