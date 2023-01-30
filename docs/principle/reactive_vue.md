---
title: 深入了解 vue2 响应式原理
tags:
---

# 深入了解 vue2 响应式原理

## 概述

vue 的响应式原理主要从三个角度来理解：数据劫持、依赖收集和异步更新。通过对象劫持来做 依赖的收集 和 数据变化的侦测，维持一个队列来异步更新视图。

### 什么是对象劫持？

在 JavaScript 中，对象作为一种 key/value 键值对的形式存在，而对对象的基本会有 增、删、改、查 的基本操作：

```js
const dog = {
  name: 'dog',
  single: false,
  girlFriend: 'charm',
  house: 'villa'
};
delete dog.house;
dog.single = true;
dog.character = 'easy';
delete dog.girlFriend;
console.log(dog.name);
```

上面的操作是低效的，当删除 dog 的 house 属性，single 属性应该自动被设置为 true。通过数据劫持，可以通过拦截某个属性的修改操作，进而去处理这个改变应该触发的其他值、状态的更新。

那么先来看看

### 怎么劫持？

主要是通过 `Object.defineProperty` 方法来实现。举个小例子：“如果一个穷小子，有房子就有女朋友，房子没了，那么女朋友也就没了”

```js
const dog = {
  name: 'dog',
  single: true,
  girlFriend: null
};
_house = null;
Object.defineProperty(dog, 'house', {
  configurable: true,
  get: () => _house,
  set: house => {
    if (house) {
      _house = house;
      dog.girlFriend = 'charm';
      dog.single = false;
    } else {
      _house = '';
      dog.girlFriend = null;
      dog.single = true;
    }
  }
});
dog.house = 'villa';
// {
//   name: 'dog',
//   single: false,
//   girlFriend: 'charm'
// }
dog.house = null;
// {
//   name: 'dog',
//   single: true,
//   girlFriend: null
// }
```

看起数据劫持很好用，但是其中也有许多需要注意的问题

## 深入

### Object.defineProperty 的局限

#### 1. 不能检测新增、删除属性操作

Object.defineProperty 无法做到新增属性的拦截：

```js
const dog = {};
dog.name = 'dog';
```

vue 官网中也提到:

> Vue 无法检测 property 的添加或移除。由于 Vue 会在初始化实例时对 property 执行 getter/setter 转化，所以 property 必须在 `data` 对象上存在才能让 Vue 将它转换为响应式的。例如：
>
> ```js
> var vm = new Vue({
>   data: {
>     a: 1
>   }
> });
> // `vm.a` 是响应式的
> vm.b = 2;
> // `vm.b` 是非响应式的
> ```

因为无法劫持到 b 这个新增属性，所以即使视图中已经引用了 b ，视图也不会进行响应式的修改。 Vue 组件实例中提供了 `Vue.set` 方法来解决新增属性的问题。

Object.defineProperty 无法感知到已有属性的删除：

```js
const dog = {};
Object.defineProperty(dog, 'name', {
  configurable: true,
  get() {
    return 'dog';
  },
  set(value) {
    console.log(value);
  }
});
console.log(dog.name); // 'dog'
delete dog.name;
console.log(dog.name); // undefined
```

defineProperty 的 set 描述符并不能劫持到 delete 操作。所以在 vue 中提供一个 `Vue.delete` 方法来删除一个属性。

#### 2. 不能检测数组

```js
const dogs = [];
Object.defineProperty(dogs, 0, {
  configurable: true,
  get: () => 'easy',
  set: console.log
});
Object.defineProperty(dogs, 1, {
  configurable: true,
  get: () => 'poor',
  set: console.log
});
dogs.length; // 2
dogs[0]; // 'easy'
dogs[1]; // 'poor'
```

看起来通过 Object.defineProperty 配置的数组元素表现正常，那么试一试操作数据的方法：

```
dogs.push('newdog') // ['easy', 'poor', 'newdogs']
dogs.unshift('newdog2')
// easy
// newdog2
// 4
// ['easy', 'poor', 'poor', 'newdogs']
```

从这个打印输出来看 push 方法没有问题，但是 unshift 方法却不符合预期；unshift 方法的内部应该是首先将第一个元素赋值给第二，第二个赋值给第三个，以此类推，然后将 newdog2 复制给第一个元素。不过这从原理上说得通的，毕竟我们只是对 index 为 0 和 1 的属性做拦截。

#### 3. 使用 Object.assign 需要注意

MDN 官网上提到 Object.assign 方法在执行的时候，并不会拷贝属性描述符到新对象，所以在执行过程中，属性描述符会丢失：

```js
const dog = {};
Object.defineProperty(dog, 'name', {
  configurable: true,
  enumerable: true,
  get() {
    return 'dog';
  },
  set(value) {
    console.log(value);
  }
});
const dogBackup = Object.assign({}, dog); // { name: 'dog' }
dogBackup.name = 'dogBackup'; // { name: 'dogBackup' }
```

### Proxy

Proxy 对象用于定义基本操作的自定义行为（如属性查找、赋值、枚举、函数调用等）；上述 Object.defineProperty 的局限都可以通过 Proxy 来解决：

#### 1. 拦截对象的基本操作

```js
const dog = {
  name: 'dog',
  single: true,
  girlFriend: null,
  house: null
};
const proxyDog = new Proxy(dog, {
  get(target, prop, receiver) {
    // 拦截查找操作
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    // 拦截新增属性
    if (!Reflect.has(target, prop)) {
      throw TypeError('Unknown type ' + prop);
    }
    // 拦截复制操作
    if (prop === 'house') {
      if (value) {
        Reflect.set(target, 'girlFriend', 'charm', receiver);
        Reflect.set(target, 'single', false, receiver);
      } else {
        Reflect.set(target, 'girlFriend', null, receiver);
        Reflect.set(target, 'single', true, receiver);
      }
    }
    return Reflect.set(target, prop, value, receiver);
  },
  deleteProperty(target, prop) {
    // 拦截删除
    if (prop === 'house') {
      Reflect.set(target, 'girlFriend', null);
      Reflect.set(target, 'single', true);
    }
    return Reflect.deleteProperty(target, prop);
  }
});
```

#### 2. 拦截数组原型上的方法

```js
const dogs = [];
var proxyDog = new Proxy(dogs, {
  apply(targetFun, ctx, args) {
    // 拦截方法调用
    return Reflect.apply(targetFun, ctx, args);
  }
});
proxyDog.push('easy');
```

#### 3. 为什么 Vue2 中不使用 Proxy 呢？

原因其实很简单，Proxy 的兼容性太差，很多浏览器不支持，比如 IE11。

熟悉了数据劫持，可以再来深入了解下 vue 是怎么做到数据驱动视图更新的。

## Vue 原理

### Vue2 响应式原理

我们可以从三个角度：变化侦测机制、收集依赖、异步更新来理解 Vue2 的响应式原理。

#### 1. 变化侦测机制 - 数据劫持

在实例化 vue 组件的时候，就会对组件的 props、data 进行 `defineReactive` ，这个方法是对 Object.defineProperty 的封装，主要做很核心的几件事情：

1. 实例化一个依赖管理类 Dep

这是很重要的一点，对象的每个属性都会实例化一个 Dep 类，通过这个类来收集依赖，以及通知更新

2. 通过 Object.defineProperty 劫持 getter ，收集依赖

```js
Object.defineProperty(obj, key, {
  enumerable: true,
  configurable: true,
  get: function reactiveGetter() {
    const value = getter ? getter.call(obj) : val;
    if (Dep.target) {
      dep.depend();
      if (childOb) {
        childOb.dep.depend();
        if (Array.isArray(value)) {
          dependArray(value);
        }
      }
    }
    return value;
  }
});
```

这里问题就来了，我们正常取值 `data.name` 或者 `this.name` ，会触发 `reactiveGetter` ，但是这时候 `Dep.target` 肯定是不存在的，只有当 `Dep.target` 存在的时候才进行依赖收集：`dep.depend()` 。那么什么时候 `Dep.target` 才存在呢？`dep.depend()` 方法又做了些什么事情呢？

3. 通过 Object.defineProperty 劫持 setter ，通知依赖更新

```js
Object.defineProperty({
  set: function reactiveSetter(newVal) {
    const value = getter ? getter.call(obj) : val;
    // 判断是否需要更新
    if (newVal === value || (newVal !== newVal && value !== value)) {
      return;
    }
    /* eslint-enable no-self-compare */
    if (process.env.NODE_ENV !== 'production' && customSetter) {
      customSetter();
    }
    // #7981: for accessor properties without setter
    if (getter && !setter) return;
    if (setter) {
      setter.call(obj, newVal);
    } else {
      val = newVal;
    }
    childOb = !shallow && observe(newVal);
    // 通知更新
    dep.notify();
  }
});
```

reactiveSetter 所做的事情就比较简单，主要做了两件事：1. 判断值是否发生变化；2. 通知依赖更新

#### 2. 收集依赖

在收集依赖的过程中，提出了两个问题：

**问题 1：Dep.target 什么时候存在？**

首先 target 的类型是一个 `Watcher` 实例，在一个 vue 组件实例化的时候，会创建一个渲染 watcher ，渲染 watcher 是一个非惰性 watcher，实例化的的时候会立即将 Dep.target 设置成自己；

而在模版编译的时候，即 `vm._render` 函数执行，通过 `with` 的方式定义作用域为当前的组件：

```js
with(this){return ${code}}
```

with 语法通常在模版引擎使用，这样在模版编译的时候访问变量时的作用域，都是 with 指定的作用域，这样就可以触发对象属性的 `getter` 方法了。

> Dep.target 存在的条件可以认为是：需要数据来驱动更新；这在 Vue 中体现在：
>
> 1.  视图渲染
> 2.  计算属性
> 3.  $watch 方法

**问题 2：`dep.depend` 方法做了什么事情？**

在对象属性的 getter 触发时，调用 `dep.depend()` 方法：

```js
class Dep {
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }
}
```

#### 3. 异步更新

记得我刚开始接触 Vue 的时候，有人问我：vue 数据驱动视图更新是同步的还是异步的？如果是异步，怎么实现的？

很显然应该是异步的，在一个事件循环中多次执行数据更新操作，最终 dom 应该只需要渲染一次即可

```html
<template>
  <div>index</div>
</template>
<script>
  export default {
    data() {
      return { index: 0 };
    },
    mounted() {
      for (let i = 0; i < 100; i++) {
        this.index = i;
      }
    }
  };
</script>
```

在数据更新时会触发 `dep.notify` ，这会将 watcher 放入队列等待下一次事件循环

```js
// observer/index.js
function defineReactive() {
  // ...
  Object.defineProperty({
    set() {
      // ...
      dep.notify();
    }
  });
}
// dep.js
class Dep {
  notify() {
    // stabilize the subscriber list first
    const subs = this.subs.slice();
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id);
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}
// watcher.js
class Watcher {
  // ...
  update() {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  }
}
```

queueWatcher 会将当前 watcher push 到更新队列中，然后开始异步更新，以及更新后调触发响应的生命周期事件

```js
function queueWatcher(watcher) {
  nextTick(flushSchedulerQueue);
}
function flushSchedulerQueue() {
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    watcher.run();
    // ...
    const vm = watcher.vm;
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated');
    }
  }
}
```

### 细节处理

### 对数组的处理

如果监听的 一个对象是一个数组，那么：

```js
const hasProto = '__proto__' in {};
class Observer {
  constructor(value: any) {
    this.value = value;

    if (isArray(value)) {
      if (hasProto) {
        value.__proto__ = arrayMethods;
      }
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
  observeArray(value) {
    for (let i = 0, l = value.length; i < l; i++) {
      observe(value[i]);
    }
  }
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }
}
```

### Proxy 在 Vue3 中的运用

// TODO
