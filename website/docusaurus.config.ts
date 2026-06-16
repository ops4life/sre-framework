import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'SRE Framework',
  tagline: 'Config-driven SRE dashboard. Prometheus-native. Zero-infra demo.',
  favicon: 'img/favicon.svg',

  url: 'https://ops4life.github.io',
  baseUrl: '/sre-framework/',

  organizationName: 'ops4life',
  projectName: 'sre-framework',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/ops4life/sre-framework/edit/main/website/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/banner.svg',
    navbar: {
      title: 'SRE Framework',
      logo: {
        alt: 'SRE Framework Logo',
        src: 'img/favicon-light.svg',
        srcDark: 'img/favicon-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'docSidebar',
          sidebarId: 'concepts',
          position: 'left',
          label: 'SRE Concepts',
        },
        {
          href: 'https://github.com/ops4life/sre-framework',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Quickstart', to: '/docs/intro' },
            { label: 'Configuration', to: '/docs/configuration' },
            { label: 'Architecture', to: '/docs/architecture' },
          ],
        },
        {
          title: 'SRE Concepts',
          items: [
            { label: 'Golden Signals', to: '/docs/concepts/golden-signals' },
            { label: 'SLO & Error Budget', to: '/docs/concepts/slo-error-budget' },
            { label: 'Capacity Planning', to: '/docs/concepts/capacity' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub', href: 'https://github.com/ops4life/sre-framework' },
            { label: 'DockerHub', href: 'https://hub.docker.com/r/ops4life/sre-framework' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ops4life. MIT License.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'docker'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
