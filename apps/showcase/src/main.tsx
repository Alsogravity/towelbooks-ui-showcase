import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './lib/zod/configureZod';
import { App } from './app/App';
import './styles/global.css';
import { markStartupPhase } from './lib/startupTelemetry';

markStartupPhase('entry');

const root = document.querySelector<HTMLElement>('#app');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
