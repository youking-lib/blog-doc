---
title: 实现一个前端状态管理器
date: 2019-03-11 17:41:37
tags:
---

react、vue 将一个应用划分成不同的组件，一个组件的状态可能会影响另一个组件，随着项目日渐复杂，组件间通信就是一个令人头疼的问题...

我：qio tto ma tte！项目日渐复杂导致状态管理困难？

- 引起一个 model 变化的因素可能会有很多种：服务器响应、缓存数据、本地数据、ui 状态、用户事件...我们怎么来处理这些状态？

- 多个组件依赖同一个状态，各组件如何更新、同步状态？

那就是用 redux。

说到 redux，厉害了，她就是来解决这个问题的，所以不知道的同学需要仔细研究研究 [redux](https://www.redux.org.cn/) 。

## 开始了开始了

为了跟风前端新技术，为了提升个人竞争力，必须要去了解一些原理，做一个知其所以然的智慧码农，他日软妹面前炫技，硬核自信不懵逼。

## 我心目中的状态管理

其实处于前端社会底层的搬砖少年，并没有什么心目中的状态，我就觉着 redux 挺好的，我很欣赏

先表面上逢迎：卧槽，这概念，这招式，卧槽，厉害了；实际上心里真心觉着厉害。

我要是自己能实现一个，我是不是一样牛叉？是的！

现在，假设我已经实现了这个状态管理器，我该怎么来用，什么姿势用的爽，值得思考...

**先创建个 module**

```js
const app = {
  namespace: 'app',
  state: {
    num: 0
  },
  actions: {
    change (state, value) {
      this.setState({
        num: value
      })
    }
  }
}
```

**然后创建个 store**

```js
const store = createStore({
  modules: [app]
})
```

这个 store 就是我们全局的状态，你可以把她类比为 redux 的 store，但请别说是抄的。

那么 store 还应该向外暴露出获取数据和修改数据的方法

**store 应该包含的 api**

```js
const actions = store.mapActions({
  change: 'app/change'
})
const states = store.mapStates({
  num: 'app/num'
})
```

到这里，一切都那么理所应当，用法简单明了，一度怀疑自己是个天才。

```js
const app = {
  namespace: 'app',
  state: {
    num: 0
  },
  actions: {
    change (state, value) {
      this.setState({
        num: value
      })
    }
  }
}
const { mapActions, mapStates } = createStore({
  modules: [app]
})
const actions = store.mapActions({
  change: 'app/change'
})
const states = store.mapStates({
  num: 'app/num'
})
actions.change(1)
states.num // 1
```

## 创建逻辑

突然一下，好像没有了方向，面对自己意淫的假代码示例，再也不能使用 cc、cv 的挫败感油然而生，这种感觉就像是失恋了一样。

没办法，生活还要继续，依稀记得老师们说过：面对苦难，化繁为简，逐个击破...

于是你列下了几个实现步骤：

1. store 是一个类
1. 需要安装 app 这个 modules，要注意 modules 可能会有多个
2. module 通过命名空间来划分
3. 实现 mapActions
4. 实现 mapStates
5. 喝杯水，微信问候一下仰慕已久的女神，过精致的生活

### store 的实现

```js
class Store {
  constructor (options) {
    this._state = {}
    this._modules = {}
    this.setModules(options.modules)
  }
  
  setModules (modules) {
    [].concat(modules).forEach(m => {
      let ns = m.namespace
      let _m = new Module(m, this)
      
      this._module[ns] = _m
      this._state[ns] = _m.state
    })
  }
}
function createStore (options) {
  return new Store(options)
}
```

你发现通过简单的组合可以简化 Store 的逻辑，所以你打算实现一个 `Module` 类以方便扩展

### Module 类的实现

```js
class Module {
  constructor (m, _store) {
    this._store = _store
    this.state = m.state
    this.actions = m.actions
    this.namespace = m.namespace
  }

  setState (state) {
    Object.assign(this.state, state)
  }
}
```

现在，store 的结构已经可以整理出来了，但是方法（ actions ）、状态（ state ）还没办法暴露出去，所以现在需要来实现 mapActions、mapState。

### dispatch 的必要性

想到之前 mapActions 的调用：

```js
const actions = store.mapActions({
  change: 'app/change'
})
```

难道，只是把 Module 的对应 actions 找到返回去就行了么，这也太 low 了吧，而 redux 的[中间件](https://github.com/reduxjs/redux/blob/master/src/applyMiddleware.js#L33)都是通过修改 dispath 来实现增强和拓展，这太厉害了，借鉴借鉴。

所以，mapActions 应该都是对 dispatch 的封装实现；

### dispatch 的实现

```js
class Store {
  // ...
  dispatch = (path, ...args) => {
    let { ns, key } = normalizePath(path);
    ns = this._module[ns]

    if (!ns) { return }

    let action = ns.actions[key]

    return action.call(ns, ns.state,...args)
  }
}
function normalizePath (path) {
  const [ns, key] = path.split('/')
  return { ns, key }
}
```

### mapActions、mapStates 的实现

mapActions 返回的所有方法应该都是对 dispatch 的封装，这样所有方法都走的是 dispatch，这样我们以后添加中间件就极其方便。

```js
class {
  // ...
  mapActions = map => {
    let res = {}
    forEachValue(map, (path, fkey) => {
      let fn = (...args) => {
        this.dispatch(path, ...args)
      }
      
      res[fkey] = fn
    })
    return res
  }
  mapStates = map => {
    let res= {}
    
    forEachValue(map, (path, fkey) => {
      const { ns, key } = normalizePath(path);
      const m = this._module[ns]

      res[fkey] = m.state[key]
    })
    return res
  }
}
function forEachValue (obj, fn) {
  Object.keys(obj).forEach(key => fn(obj[key], key))
}
```

顺手实现了 mapStates

到这，你看着清单上的最后一条邪魅一笑，心心念：技术改变世界，改变自己，感觉自己就是个人生赢家。

刚刚的伟大创举给予你十足的勇气，你开心的打开微信，熟练的打开与女神的对话框，小心翼翼的发了一句：在吗？

## 整理回顾

女神可能又在忙，你打算测试一下自己的代码: 

```js
const actions = mapActions({
  change: 'app/change'
})
const states = mapStates({
  num: 'app/num'
})

change(1)
console.log(states.num) // 0
console.log(store._store._state.app.state.num) // 1

const add = val => actions.change(states.num + 1)
const reudce = val => actions.change(states.mum - 1)
```

发现代码有问题：

1. states 并不能响应式的修改
2. mapActions 太局限；上述 actions 应支持如下优化

```js
const actions = store.mapActions({
  change: 'app/change',
  add (dispatch) {
    dispatch('app/change', states.val + 1)
  },
  reduce (dispatch) {
    dispatch('app/change', states.val - 1)
  }
})
```

**将 mapStates 返回的值代理到 module 的 state 上**

```js
class Store {
  // ...
  mapStates = map => {
    let res= {}
    
    forEachValue(map, (path, fkey) => {
      const { ns, key } = normalizePath(path);
      const m = this._module[ns]

      if (!m) { return }
      
      proxyGetter(res, fkey, m.state, key)
    })
    return res
  }
}
function proxyGetter (target, key, source, sourceKey) {
  sharedPropertyDefinition.get = function () {
    return source[sourceKey]
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

**修改 mapActions 以支持拓展**

```js
class Store {
  // ...
  mapActions = map => {
    let res = {}
    forEachValue(map, (path, fkey) => {
      let fn
      
      if (typeof path === 'function') {
        fn = (...args) => {
          path(this.dispatch, ...args)
        }
      } else {
        fn = (...args) => {
          this.dispatch(path, ...args)
        }
      }
      
      res[fkey] = fn
    })
    return res
  }
}
```

到这里，前端状态管理器功能已经基本实现，你可以在

[去这里](https://github.com/whistleyz/easydog) 查看她的简单用法和源代码；
[查看 undo, redo 的简单示例](http://easydog.codingbro.cn/)

她已经可以满足自己的使用，但是她仍存在限制和不足：

- dispath 对 setState 的不可预知

例如：

```js
const app = {
  namespace: 'app',
  state: { num: 0 },
  actions: {
    async getNumer () {
      // waiting...
      this.setState({ num: 'xxx' })
    }
  }
}
```

可以看到如果 action 是一个异步的方法，那么我们就不知道 `setState` 什么时候会被调用。

- 代码中没有错误处理的逻辑

- module 并不支持多级 module，像 [vuex](https://vuex.vuejs.org/zh/guide/modules.html#%E5%91%BD%E5%90%8D%E7%A9%BA%E9%97%B4) 那样；

不过你可以通过命名空间的方式自己来定义：

```js
const app = { namespace: 'app' }
const app = { namespace: 'app:user' }
const app = { namespace: 'app:system' }
```

这样还可以使得数据更加扁平化不是么？


- 在 module 的 action 中调用其他 action

```js
const other = {
  namespace: 'other',
  actions: {
    foo () {
      this.dispatch('app/getNumber')
    }
  }
}
```
