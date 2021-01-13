# DOM 练习

1. 查找当前页面有多少种标签

```js
[...new Set(Array.from(document.querySelectorAll('*')).map(node => node.tagName))];
```

2. 查找最深 dom 节点路径

```js
function deepNodePath(node, nodePath = [], stack = []) {
  stack.push(node);

  if (stack.length > nodePath.length) {
    nodePath = [...stack];
  }

  const children = Array.from(node.children);

  if (children.length) {
    children.forEach(child => {
      nodePath = deepNodePath(child, nodePath, stack);
    });
  }

  stack.pop();

  return nodePath;
}

deepNodePath(document.documentElement);
```

3. Virtual DOM renderer

```jsx
import React from 'react';

function onLoad() {
  const root = document.querySelector('#virtual-root');
  const list = h(
    'ul',
    {
      style: {
        display: 'flex',
        'list-style-type': 'none'
      }
    },
    ['产品样式', '产品资源', '定向', '矩阵'].map(name =>
      h(
        'li',
        {
          style: {
            width: '100px',
            height: '30px',
            margin: 0,
            padding: 0,
            'margin-right': '10px',
            border: '1px solid #D9D9D9',
            'line-height': '30px',
            'text-align': 'center',
            'background-color': '#FAFAFA',
            color: '#666'
          }
        },
        name
      )
    )
  );
  mount(root, list);
}

const isObject = val => typeof val === 'object';
const api = {
  createElement(tag) {
    return document.createElement(tag);
  },
  createTextNode(text) {
    return document.createTextNode(text);
  },
  appendChild(child, parent) {
    parent.appendChild(child);
  },
  setAttributeMap(node, attrMap) {
    if (isObject(attrMap.style)) {
      api.setStyleMap(node, attrMap.style);
      delete attrMap.style;
    }

    for (let key in attrMap) {
      node.setAttribute(key, attrMap[key]);
    }
  },
  setStyleMap(node, styleMap) {
    for (let key in styleMap) {
      node.style[key] = styleMap[key];
    }
  }
};
function h(tag, props, children) {
  return {
    _type: null, // element | text
    el: null,
    tag,
    props,
    children
  };
}
function createElement(vnode) {
  if (!isObject(vnode)) {
    return {
      _type: 'text',
      el: api.createTextNode(vnode)
    };
  }

  const el = document.createElement(vnode.tag);
  const props = vnode.props;
  const children = vnode.children;

  vnode.el = el;

  if (props) {
    api.setAttributeMap(el, props);
  }

  if (children) {
    vnode.children = [].concat(children).map(vnodeOrText => {
      const childVnode = createElement(vnodeOrText);

      api.appendChild(childVnode.el, el);
      return childVnode;
    });
  }

  return vnode;
}
function mount(node, vnode) {
  const mountedNodeTree = createElement(vnode);

  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }

  node.appendChild(mountedNodeTree.el);
}
export default function () {
  React.useEffect(() => {
    onLoad();
  }, []);
  return <div id="virtual-root">root</div>;
}
```

4. dom

```jsx
import React from 'react';
import comment from './comment';

function onLoad() {
  comment.init(document.querySelector('#comment-root'));
}

export default function () {
  React.useEffect(() => {
    onLoad();
  }, []);
  return <div id="comment-root"></div>;
}
```
