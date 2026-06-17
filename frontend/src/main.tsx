import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { config } from './lib/config';
import App from './App';
import './styles/globals.css';

document.title = config.title;
const faviconEl = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/png"]');
if (faviconEl) faviconEl.href = config.favicon;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
