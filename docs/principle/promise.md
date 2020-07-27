# Promise 规范与实现

## 规范

> 规范地址：https://promisesaplus.com/

### 1 Terminology

1. 'promise' is an object or function with a `then` method whose behavior conforms to this specification.

2. 'thenabale' is an object or function that defines a `then` method.
3. 'value' is any legal Javascript value (including undefined, a thenable, or a promise).
4. 'exception' is a value that is thrown using the throw statement.
5. 'reason' is a value that indicates why a promise was rejected.

### 2 Requirements

#### 2.1 Promise state

A promise must be in one of three states: pending, fulfilled, or rejected.

#### 2.2 then

2.2.4 `onFulFilled` or `onRejected` must not be called until the execution context stack contains only platform code.

> 这里指的是当 Promise state 发生改变， then 方法接收的 `onFulFilled` 和 `onRejected` 回调方法会在下一轮事件循环中被调用。
>
> 示例：即使 Promise 的状态立即被 resolve ，then 中的回调函数也不会立即执行
>
> ```js
> Promise.resolve(123).then(val => console.log(val)) // 2. 后输出
> console.log(456) // 1. 先输出
> ```

2.2.6 `then` may be called multiple times on the same promise

> 同一个 promise 的 then 方法可以调用多次
>
> ```js
> const asyncVal = Promise.resolve('123')
> asyncVal.then(console.log) // 123
> asyncVal.then(console.log) // 123
> asyncVal.then(console.log) // 123
> ```

2.2.7 `then` must return a promise.

> then 方法调用会返回一个新的 Promise
> ```js
> const promise1 = Promise.resolve(1)
> const promise2 = promise1.then(val => val + 1)
> console.log(promise2 === promise1) // false
> promise2.then(console.log) // 2
> ```

2.2.7.3 If `onFulfilled` is not a function and `promise1` is fulfilled, `promise2` must be fufilled with the same value as `promise1`

> ```js
> Promise.resolve(1)
> 	.then()
>   .then(console.log) // 1
> ```
>

2.2.7.4 If `onRejected` is not a function and `promise1` is rejected, `promise2` must be rejected with `e` as the reason

>```js
>Promise.reject(new Error('error'))
>	.then()
>	.catch(console.error) // Error: error
>```

#### 2.3 The Promise Resolution Procedure

## 实现

### 基本框架

```js
const PENDING_STATE = 'pending'
const FULFILLED_STATE = 'resolved'
const REJECTED_STATE = 'rejected'
class Promise {
  constructor (resolver) {
    if (!isFunction(resolver)) {
      throwUnexpectResolver(resolver)
    }
    if (this instanceof Promise) {
      throwUnexpectContrust()
    }
    
    this.promiseState = PENDING_STATE
    this.promiseValue = null
    this._subscribePromises = []
    
    try {
      function promiseResolve (value) {
        resolve(this, value)
      }
      function promiseReject (error) {
        reject(this, error)
      }
      resolver(promiseResolve, promiseReject)
    } catch (error) {
      reject(this, error)
    }
  }
  
  then (onFulfillment, onRejction) {
    const thenPromise = new Promise(noop)
    
    thenPromise._onFulfillment = onFulfillment
    thenPromise._onRejction = onRejction
    
    if (this.promiseState === PENDING_STATE) {
      subscribe(this, thenPromise)
    } else {
      nextTick(() => invokePromise(thenPromise, this.promiseValue))
    }
    return thenPromise
  }
}

Promise.all = function all () {}
Promise.race = function race () {}
Promise.resolve = function resolve () {}
Promise.reject = function reject () {}

function throwUnexpectResolver (resolver) {
  throw new TypeError(`Promise resolver ${resolver} is not a function.`)
}
function throwUnexpectContrust () {
  throw new TypeError(`Failed to construct 'Promise', please use new operator`)
}
```

### 模拟任务队列

```js
const microTimeFunc = fn => process.nextTick(fn)

const jobs = []
let pending = false

function flush () {
  const jobsCopied = jobs.slice(0)
  jobs.length = 0
  pending = false
  for (let i = 0; i < jobs.length; i++) {
    jobs[i]()
  }
}

export default function nextTick (fn) {
  jobs.push(fn)
  
  if (!pending) {
    pending = true
    microTimeFunc(() => flush())
  }
}
```

###发布订阅处理异步回调

```js
function subscribe (promise, thenPromise) {
  const subscribePromises = promise._subscribePromises
  subscribePromises.push(thenPromise)
  
  if (promise.state !== PENDING_STATE && !subscribePromises.length) {
    nextTick(() => publish(promise))
  }
}
function publish (promise) {
  const subscribePromises = promise._subscribePromises
  const length = subscribePromises.length
  
  for (let i = 0; i < length; i++) {
    const thenPromise = subscribePromises[i]
    invokePromise(thenPromise, promise.promiseState, promise.value)
  }
  subscribePromises.length = 0
}
```

### Promise 状态更新

#### Promise onFulfillment

1. Promise 的状态更新为 FULFILLED_STATE

```js
new Promise(resolve => {
  resolve(123) // inernal: resolve(this, value)
})
```

```js
function cannotResolveSelf () {
  return new TypeError('You cannot resovle a promise with itself')
}
function resolve (promise, value) {
  if (promise === value) {
    return reject(promise, cannotResolveSelf()) // 2.3.1
  }
  
  fulfill(promise, value)
}
function fulfill (promise, value) {
  if (promise.promiseState !== PENDING_STATE) return
  
  promise.promiseValue = value
  promise.promiseState = FULFILLED_STATE
  
  if (promise._subscribePromises.length) {
    nextTick(() => publish(promise))
  }
}
```

2. 处理 resolve 一个 promise 的情况

```js
var p = new Promise(resolve => {
  resolve(Promise.resolve(Promise.resolve(1)))
})
p.then(x => console.log(x)) // 1
```

```js
function resolve (promise, value) {
  if (promise === value) {
    return reject(promise, cannotResolveSelf()) // 2.3.1
  }
  if (isThenable(value)) {
    handleForeignThenable(promise, value)
  } else {
    fulfill(promise, value)
  }
}
function handleForeignThenable (promise, thenValue) {
  nextTick(() => {
    let sealed = false
    let error = null
    
    try {
      thenValue.then(onThenFulfillment, onThenRejection)
    } catch (err) {
      error = err
    }
    function onThenFulfillment (value) {
      if (sealed) return
      
      sealed = true
      
      if (isThenable(value)) {
        resolve(promise, value)
      } else {
				fulfill(promise, value)
      }
    }
    function onThenRejection (error) {
      if (sealed) return
      
      sealed = false
      
      reject(promise, error)
    }
  })
}
```

#### Promise onRejection

1. Promise 的状态更新为 REJECTED_STATE

```js
function reject (promise, error) {
	if (promise.promiseState !== PENDING_STATE) return
  
  nextTick(() => {
    promise.promiseState = REJECTED_STATE
    promise.promiseValue = error
    
    publish(promise)
  })
}
```

### 调用 Promise.then callback

```js
function invokePromise (promise, state, value) {
	let callback, thenResult, success
  
  if (state === FULFILLED_STATE) {
    callback = promise._onFulfillment
  } else if (state === REJECTED_STATE) {
    callback = promise._onRejction
  }
  
  if (isFunction(callback)) {
    try {
      thenResult = callback(value)
      success = true
    } catch (error) {
      thenResult = error
      success = false
    }
    if (promise === thenResult) {
      return reject(promise, canotReturnOwn())
    }
  } else {
    thenResult = value
  }
  
  if (promise.promiseState !== PENDING_STATE) {
    return
  }
  
  if (success === true) {
    resolve(promise, thenResult)
    return
  }
  if (success === false) {
    reject(promise, thenResult)
    return
  }
  if (state === FULFILLED_STATE) {
    fulfill(promise, thenResult)
    return
  }
  if (state === REJECTED_STATE) {
    reject(promise, thenResult)
    return
  }
}
```

### 静态方法

#### Promise.all

```js
Promise.all = function (promises) {
  const result = []
  let count = 0
  return new Promise((resolve, reject) => {
		for (let index = 0, len = promises.length; index < len; index++) {
      Promise
        .resolve(promises[index])
        .then(value => {
          result[index] = value
          if (++count === len - 1) {
            resolve(result)
          }
        })
        .catch(err => {
        	reject(err)
        })
    }    
  })
}
```

#### Promise.race

```js
Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
    for (let i = 0, len = promise.length; i < len; i++) {
      Promise.resolve(promise[i]).then(resolve, reject)
    }
  })
}
```

#### Promise.resolve

```js
Promise.resolve = function (value) {
  if (isPromise(value)) return value
  
  const promise = new Promise(noop)
  
  resolve(promise, value)
  
  return promise
}
```

#### Promise.reject

```js
Promise.reject = function (error) {
  const promise = new Promise(noop)
  
  reject(promise, error)
  
  return promise
}
```
