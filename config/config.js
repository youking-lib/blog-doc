import { defineConfig } from 'dumi';

export default defineConfig({
  ssr: {},
  exportStatic: {},
  hash: true,
  mode: 'site',
  logo: '/logo.jpg',
  favicon: '/logo.jpg',
  // exportStatic: { htmlSuffix: true },
  // menus: {
  //   '/principle': [
  //     {
  //       title: 'vue原理',
  //       children: ['principle/index.md', 'principle/reactive_vue']
  //     },
  //     {
  //       title: '状态管理',
  //       children: ['principle/state_manager']
  //     }
  //   ],

  //   '/summary': [
  //     {
  //       title: '总结',
  //       children: [
  //         'summary/extend_between_es6_and_es5',
  //         'summary/unit_test_miniapp'
  //       ]
  //     }
  //   ]
  // },
  // navs: [
  //   null,
  //   { title: 'GitHub', path: 'https://github.com/whistleyz' }
  // ]
})
