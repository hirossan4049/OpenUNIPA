import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'getting-started',
    'installation',
    'configuration',
    {
      type: 'category',
      label: 'API リファレンス',
      items: [
        'api/overview',
        'api/account-controller',
        'api/timetable-controller',
        'api/grades-controller',
        'api/attendance-controller',
        'api/notice-controller',
      ],
    },
    'examples',
    {
      type: 'category',
      label: '高度な使用方法',
      items: [
        'advanced/debugging',
        'advanced/stub-mode',
        'advanced/error-handling',
      ],
    },
  ],
};

export default sidebars;