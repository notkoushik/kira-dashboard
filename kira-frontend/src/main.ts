/**
 * Application Entry Point
 * Initializes the KIRA Dashboard application
 */

import './index.css';
import { config, validateConfig } from './config/env';

// Validate configuration
try {
  validateConfig();
} catch (error) {
  console.error('Configuration validation failed:', error);
}

/**
 * Initialize application
 */
async function initializeApp(): Promise<void> {
  // DOM Setup
  const appElement = document.getElementById('app');
  if (!appElement) {
    console.error('Root element #app not found');
    return;
  }

  console.log('🚀 KIRA Dashboard initializing...');
  console.log('📍 API Base:', config.api.base);
  console.log('🔧 Environment:', config.isDevelopment ? 'development' : 'production');

  // TODO: Phase 2 - Import and initialize services
  // TODO: Phase 3 - Mount App component
  // TODO: Phase 5 - Load initial data

  // Placeholder: Show that app is starting
  appElement.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #0a0a0a;
      font-family: Inter, sans-serif;
      color: #f0f0f0;
      flex-direction: column;
      gap: 20px;
    ">
      <h1>🚀 KIRA Dashboard</h1>
      <p>Initializing frontend architecture...</p>
      <p style="font-size: 12px; color: #6b7280;">
        Phase 1: Build Setup ✓<br/>
        Phase 2: Services (next)<br/>
        Phase 3: Components<br/>
        Phase 4: Styling<br/>
        Phase 5: App Shell
      </p>
    </div>
  `;
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Hot Module Replacement (Vite)
if (import.meta.hot) {
  import.meta.hot.accept();
}
