import { defineConfig } from 'dumi';

export default defineConfig({
  ssr: {
    devServerRender: false
  },
  exportStatic: {},
  hash: true,
  mode: 'site',
  logo: '/logo.jpg',
  favicon: '/logo.jpg',
  menus: {
    '/summary': [
      {
        title: '总结',
        children: [
          'summary/extend_between_es6_and_es5',
          'summary/unit_test_miniapp'
        ]
      }
    ],
    '/principle': [
      {
        title: 'vue原理',
        children: ['principle/reactive_vue']
      },
      {
        title: '状态管理',
        children: ['principle/state_manager']
      }
    ]
  },
  navs: [
    null,
    { title: 'GitHub', path: 'https://github.com/whistleyz' }
  ]
})
