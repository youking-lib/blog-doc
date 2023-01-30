/**
 * @file: description
 * @author: yongzhen
 * @Date: 2020-10-23 11:28:31
 * @LastEditors: yongzhen
 * @LastEditTime: 2021-01-30 14:14:23
 */
import { defineConfig } from 'dumi';

const scripts: string[] = [];

if (process.env.NODE_ENV !== 'development') {
  scripts.push('https://hm.baidu.com/hm.js?56fbe606b14d07f8ad321f2c766e4d29');
}

const footer = `Open-source MIT Licensed | Copyright © 2023-present | <a style="color: inherit" href="https://beian.miit.gov.cn/" target="_blank">京ICP备2023000605号</a>`;

export default defineConfig({
  exportStatic: {},
  hash: true,
  favicons: ['/logo.jpg'],
  themeConfig: {
    logo: '/logo.jpg',
    name: 'youking',
    footer,
    nav: [
      { title: '总结', link: '/summary/extend_between_es6_and_es5' },
      { title: '原理', link: '/principle/reactive_vue' },
      { title: '练习', link: '/practice/algorithm/calculator' },
      { title: 'GitHub', link: 'https://github.com/youking-lib' }
    ],
    sidebar: {
      '/summary': [
        {
          title: '总结',
          children: [
            { title: 'ES6与ES5的类继承机制', link: 'summary/extend_between_es6_and_es5' },
            { title: '小程序单元测试环境搭建', link: 'summary/unit_test_miniapp' },
            { title: '前端项目 MVP 分层设计', link: 'summary/mvp' },
            { title: 'nodejs压力测试', link: 'summary/bench_nodejs' },
            { title: '动态表单/表格', link: 'summary/dynamic_form' },
            { title: 'Subresource Integrity', link: 'summary/SRI' }
          ]
        }
      ],
      '/principle': [
        {
          title: 'Front',
          children: [
            { title: '深入了解 vue2 响应式原理', link: 'principle/reactive_vue' },
            { title: '实现一个前端状态管理器', link: 'principle/state_manager' },
            { title: 'Vue computed 与记忆函数', link: 'principle/vue_computed' }
          ]
        },
        {
          title: 'ECMAScript',
          children: [
            {
              title: 'Promise 规范与实现',
              link: 'principle/promise'
            }
          ]
        }
      ],
      '/practice': [
        {
          title: 'Algorithm',
          children: [
            { title: '节点序列的问题', link: 'practice/algorithm/README' },
            { title: '如何实现一个计算器', link: 'practice/algorithm/calculator/README' },
            { title: '数组相关', link: 'practice/algorithm/array' }
          ]
        },
        {
          title: 'DOM',
          children: [{ title: 'DOM 练习', link: 'practice/dom' }]
        },
        {
          title: 'Editor',
          children: [{ title: '富文本编辑器', link: 'practice/editor' }]
        }
      ]
    }
  },
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
