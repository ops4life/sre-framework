import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['intro'],
      collapsed: false,
    },
    {
      type: 'category',
      label: 'Reference',
      items: ['configuration', 'architecture'],
      collapsed: false,
    },
    {
      type: 'doc',
      id: 'contributing',
      label: 'Contributing',
    },
  ],
  concepts: [
    {
      type: 'category',
      label: 'SRE Concepts',
      items: [
        'concepts/index',
        'concepts/golden-signals',
        'concepts/slo-error-budget',
        'concepts/capacity',
      ],
      collapsed: false,
    },
  ],
};

export default sidebars;
