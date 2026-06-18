import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { config } from './lib/config';
import App from './App';
import * as Sentry from '@sentry/react';
import './styles/globals.css';

if (config.sentry_dsn) {
  Sentry.init({
    dsn: config.sentry_dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

document.title = config.title;
document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach(el => {
  el.href = config.favicon;
});

if (config.accent && /^#[0-9a-fA-F]{6}$/.test(config.accent)) {
  const r = parseInt(config.accent.slice(1, 3), 16);
  const g = parseInt(config.accent.slice(3, 5), 16);
  const b = parseInt(config.accent.slice(5, 7), 16);
  const darken = (v: number) => Math.max(0, Math.round(v * 0.88)).toString(16).padStart(2, '0');
  const root = document.documentElement;
  root.style.setProperty('--accent', config.accent);
  root.style.setProperty('--accent-hover', `#${darken(r)}${darken(g)}${darken(b)}`);
  root.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
}

const container = document.getElementById('root')!;
const rootOptions: Parameters<typeof createRoot>[1] = {};

if (config.sentry_dsn) {
  rootOptions.onUncaughtError = Sentry.reactErrorHandler();
  rootOptions.onCaughtError = Sentry.reactErrorHandler();
  rootOptions.onRecoverableError = Sentry.reactErrorHandler();
}

createRoot(container, rootOptions).render(
  <StrictMode>
    <App />
  </StrictMode>
);

