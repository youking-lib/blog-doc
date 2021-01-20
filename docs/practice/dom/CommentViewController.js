/**
 * @file: description
 * @author: yongzhen
 * @Date: 2021-01-08 14:36:40
 * @LastEditors: yongzhen
 * @LastEditTime: 2021-01-20 17:25:58
 */
import * as utils from './utils';
import BaseViewController from './BaseViewController';
import ListViewController from './ListViewController';
import FormViewControler from './FormViewController';

export default class CommentViewController extends BaseViewController {
  static defaultOptions = {
    className: 'comment-container d-none'
  };
  constructor(options) {
    super({ ...options, ...CommentViewController.defaultOptions });

    this.viewState = {
      tabs: [
        {
          key: 'comment-list',
          defaultActive: true,
          title: '评论列表'
        },
        {
          key: 'comment-form',
          defaultActive: false,
          title: '发布评论'
        }
      ]
    };

    this.init();
  }

  init() {
    this.mount();

    this.tabNavEl = this.el.querySelector('#comment-tab-nav');
    this.tabNavContentEl = this.el.querySelector('#comment-tab-content');
    this.listEl = this.tabNavContentEl.querySelector('[data-key="comment-list"]');
    this.formEl = this.tabNavContentEl.querySelector('[data-key="comment-form"]');

    this.listViewController = new ListViewController({ el: this.listEl });
    this.formViewController = new FormViewControler({ el: this.formEl });

    this.delegateEvent('.nav-link', 'click', this._handleTabNavLinkClick.bind(this));
  }

  show() {
    this.el.classList.remove('d-none');
    this.el.classList.add('d-block');
  }

  hide() {
    this.el.classList.remove('d-block');
    this.el.classList.add('d-none');
  }

  _handleTabNavLinkClick(e) {
    const selectedKey = e.delegateNode.dataset.key;
    this.selectNavItem(selectedKey);
  }

  selectNavItem(selectedKey) {
    const tabItems = Array.from(this.tabNavEl.querySelectorAll('.nav-link'));
    const tabContentItems = Array.from(this.tabNavContentEl.querySelectorAll('.tab-pane'));

    tabItems.forEach(tabItem => {
      if (tabItem.dataset.key === selectedKey) {
        tabItem.classList.add('active');
      } else {
        tabItem.classList.remove('active');
      }
    });

    tabContentItems.forEach(tabContentItem => {
      if (tabContentItem.dataset.key === selectedKey) {
        tabContentItem.classList.add('active');
        tabContentItem.classList.add('show');
      } else {
        tabContentItem.classList.remove('active');
        tabContentItem.classList.remove('show');
      }
    });
  }

  mount() {
    utils.dom.template(
      this.el,
      `
        <ul class="nav nav-tabs" id="comment-tab-nav">
          ${this.viewState.tabs
            .map(tabItem => {
              const activeClassName = tabItem.defaultActive ? 'active' : '';
              return `
                <li class="nav-item">
                  <a
                    class="nav-link ${activeClassName}"
                    data-key="${tabItem.key}"
                  >
                    ${tabItem.title}
                  </a>
                </li>
              `;
            })
            .join('')}
        </ul>

        <div class="tab-content" id="comment-tab-content">
          <div class="tab-pane fade show active" data-key="comment-list"></div>
          <div class="tab-pane fade" data-key="comment-form">profile</div>
        </div>
      `
    );
  }

  distory() {
    this.distroyEvents.forEach(remove => remove());
  }
}
