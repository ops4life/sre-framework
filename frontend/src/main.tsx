import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { config } from './lib/config';
import App from './App';
import './styles/globals.css';

document.title = config.title;
document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach(el => {
  el.href = config.favicon;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
