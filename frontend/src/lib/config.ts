interface SreConfig {
  title: string;
  timezone: string;
  window: string;
  favicon: string;
  accent: string;
  sentry_dsn?: string;
}

const defaults: SreConfig = {
  title: 'SRE Ops — Mission Control',
  timezone: 'UTC',
  window: '28d',
  favicon: '/favicon.png',
  accent: '',
  sentry_dsn: '',
};

export const config: SreConfig = (window as Window & { __SRE_CONFIG__?: SreConfig }).__SRE_CONFIG__ ?? defaults;

