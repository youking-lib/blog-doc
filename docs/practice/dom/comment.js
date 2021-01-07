const utils = {
  dom: {
    matchSelector (node, selector) {
      return node.id === selector.replace('#', '') || node.classlist.contains(selector.replace('.', ''));
    }
  }
}

// 模版引擎
function template () {}

class BaseViewController {
  constructor ({ el }) {
    this.el = el;

    this._events = [];
  }

  addEvent (selector, action, cb) {
    // 事件代理
    const handler = e => {
      if (utils.dom.matchSelector(e.target, selector)) {
        cb(e);
      }
    }
    const removeEvent = () => {
      this.el.removeEventListener(action, handler);
      this._events = this._events.filter(item => item !== removeEvent);
    }
    
    this.el.addEventListener(action, handler);
    _events.push(removeEvent);

    return removeEvent;
  }

  distroyEvents () {
    this._events.forEach(removeEvent => removeEvent());
  }

  render () {
    throw Error('missing render method')
  }
}

export default class CommentApi extends BaseViewController {
  constructor (options) {
    this.options = options;

    this.el = options.el;

    this.viewState = {
      tabs: [{
        actived: true,
        title: '评论列表'
      }, {
        actived: false,
        title: '发布评论'
      }]
    }
    
    this.init();
  }

  init () {
    this.mount();

    this.tabNavEl = this.el.querySelector('#comment-tab-nav');
    
    this.addEvent('.nav-item', 'click', this.handleTabNavItemClick.bind(this));
  }

  handleTabNavItemClick (e) {
    const selectedTitle = e.target.dataset.title;
    
    this.viewState.tabs.forEach(item => {
      item.actived = item.title === selectedTitle;
    })

    this.forceRenderTabs();
  }

  forceRenderTabs () {
    template(this.tabNavEl, this.viewState, this.tabsTemplate);
  }

  mount () {
    this.tabsTemplate = `
      <% tabs.forEach(tab => { %>
        <li class="nav-item" data-title="<%- tab.name %>">
          <a class="nav-link <%- tab.active ? 'active' : '' %>" aria-current="page" href="#">
            <%- tab.name %>
          </a>
        </li>
      <% }) %>
    `
    
    template(this.el, this.viewState, `
      <div class="comment-container">
        <ul class="nav" id="comment-tab-nav">
          ${this.tabsTemplate}
        </ul>

        <div class="tab-content" id="comment-tab-content">
          <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">...</div>
          <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">...</div>
          <div class="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">...</div>
        </div>
      </div>
    `)
  }
  
  static create (options) {
    return new CommentApi(options);
  }
}
