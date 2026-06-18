import { useCallback, useEffect, useState } from 'react';
import { config } from '../lib/config';

const STORAGE_KEY = 'sre.accent';

function applyAccent(hex: string) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const darken = (v: number) => Math.max(0, Math.round(v * 0.88)).toString(16).padStart(2, '0');
  const root = document.documentElement;
  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-hover', `#${darken(r)}${darken(g)}${darken(b)}`);
  root.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
}

const defaultAccent = config.accent && /^#[0-9a-fA-F]{6}$/.test(config.accent)
  ? config.accent
  : '#caff04';

function readStored(): string {
  return localStorage.getItem(STORAGE_KEY) ?? defaultAccent;
}

export function useAccent(): [string, (hex: string) => void] {
  const [accent, setAccentState] = useState<string>(readStored);

  useEffect(() => {
    applyAccent(accent);
  }, [accent]);

  const setAccent = useCallback((hex: string) => {
    localStorage.setItem(STORAGE_KEY, hex);
    setAccentState(hex);
  }, []);

  return [accent, setAccent];
}
