/**
 * @file: description
 * @author: yongzhen
 * @Date: 2020-10-23 11:28:31
 * @LastEditors: yongzhen
 * @LastEditTime: 2021-01-30 14:14:23
 */
import { defineConfig } from 'dumi';

const scripts = [];

if (process.env.NODE_ENV !== 'development') {
  scripts.push('https://hm.baidu.com/hm.js?56fbe606b14d07f8ad321f2c766e4d29');
}

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
          'summary/unit_test_miniapp',
          'summary/mvp',
          'summary/bench_nodejs',
          'summary/dynamic_form',
          'summary/SRI'
        ]
      }
    ],
    '/principle': [
      {
        title: 'Front',
        children: ['principle/reactive_vue', 'principle/state_manager', 'principle/vue_computed']
      },
      {
        title: 'ECMAScript',
        children: ['principle/promise']
      }
    ],
    '/practice': [
      {
        title: 'Algorithm',
        children: ['practice/algorithm/calculator/README', 'practice/algorithm/array']
      },
      {
        title: 'DOM',
        children: ['practice/dom']
      },
      {
        title: 'Editor',
        children: ['practice/editor']
      }
    ]
  },
  navs: [null, { title: 'GitHub', path: 'https://github.com/whistleyz' }],
  scripts: scripts,
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: 'css'
      }
    ]
  ]
});
