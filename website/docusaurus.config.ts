import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'OpenUNIPA',
  tagline: 'Open source library for Kindai University UNIPA system',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'hirossan4049', // Usually your GitHub org/user name.
  projectName: 'OpenUNIPA', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/hirossan4049/OpenUNIPA/tree/main/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/hirossan4049/OpenUNIPA/tree/main/website/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'OpenUNIPA',
      logo: {
        alt: 'OpenUNIPA Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'ドキュメント',
        },
        {to: '/blog', label: 'ブログ', position: 'left'},
        {
          href: 'https://github.com/hirossan4049/OpenUNIPA',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'ドキュメント',
          items: [
            {
              label: 'はじめに',
              to: '/docs/getting-started',
            },
            {
              label: 'インストール',
              to: '/docs/installation',
            },
            {
              label: 'API リファレンス',
              to: '/docs/api/overview',
            },
          ],
        },
        {
          title: 'コミュニティ',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/hirossan4049/OpenUNIPA',
            },
            {
              label: 'Issues',
              href: 'https://github.com/hirossan4049/OpenUNIPA/issues',
            },
          ],
        },
        {
          title: 'その他',
          items: [
            {
              label: 'ブログ',
              to: '/blog',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/open-unipa',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} OpenUNIPA. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;