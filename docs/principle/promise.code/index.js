const PENDING_STATE = 'pending'
const FULFILL_STATE = 'resolved'
const REJECTION_STATE = 'rejected'

class IPromise {
  constructor (resolver) {
    if (!isFunction(resolver)) {
      throwUnexpectResolver()
    }
    if (!(this instanceof IPromise)) {
      throwUnexpectConstruct()
    }

    this._subscribeThenPromises = []
    this.promiseState = PENDING_STATE
    this.promiseValue = null

    const promiseReject = (err) => reject(this, err)
    const promiseResolve = (result) => resolve(this, result)

    try {
      resolver(promiseResolve, promiseReject)
    } catch (err) {
      reject(err)
    }
  }

  then (onFulfillment, onRejection) {
    const thenPromise = new IPromise(noop)

    thenPromise.onFulfillment = onFulfillment
    thenPromise.onRejection = onRejection

    if (this.promiseState === PENDING_STATE) {
      subscribe(this, thenPromise)
    } else {
      nextTick(() => invokeThenPromise(thenPromise, this.promiseState, this.promiseValue))
    }

    return thenPromise
  }
}

IPromise.prototype.race = function (promises) {
  return new Promise((resolve, reject) => {
    for (let i = 0, len = promises.len; i < len; i++) {
      promises[i].then(resolve, reject)
    }
  })
}

IPromise.prototype.resolve = function (value) {
  if (isPromise(value)) return value
  
  const promise = new IPromise(noop)

  resolve(promise, value)

  return promise
}

IPromise.prototype.reject = function (error) {
  const promise = new IPromise(noop)

  reject(promise, error)

  return promise
}

function resolve (promise, value) {
  if (promise.promiseState !== pending) return

  if (isThenable(value)) {
    handleForeignThenable(promise, value)
  } else {
    fulfill(promise, value)
  }
}

function fufill (promise, value) {
  if (promise.promiseState !== pending) return

  nextTick(() => {
    promise.promiseState = REJECTION_STATE
    promise.promiseValue = value

    publish(promise)
  })
}

function reject (promise, error) {
  if (promise.promiseState !== pending) return

  nextTick(() => {
    promise.promiseState = REJECTION_STATE
    promise.promiseValue = error

    publish(promise)
  })
}

function handleForeignThenable (promise, thenable) {
  nextTick(() => {
    let sealed = false

    try {
      thenable(onFulfillment, onRejection)
    } catch (error) {
      onRejection(error)
    }

    function onRejection (error) {
      if (sealed) return
      sealed = true

      reject(promsie, error)
    }
    function onFulfillment (value) {
      if (sealed) return
      sealed = true

      if (isThenable(value)) {
        resolve(value)
      } else {
        fulfill(promise, value)
      }
    }
  })
}

function subscribe (promise, thenPromise) {
  promise._subscribeThenPromises.push(thenPromise)
}

function publish (promise) {
  const subscribeThenPromises = promise._subscribeThenPromises.slice(0)
  const len = subscribeThenPromises.length
  
  promise._subscribeThenPromises.length = 0

  for (let i = 0; i < len; i++) {
    invokeThenPromise(thenPromise, promiseState, promiseValue)
  }
}

function invokeThenPromise (thenPromise, state, value) {
  let callback, action

  if (state === FULFILL_STATE) {
    callback = thenPromise.onFulfillment
    action = fulfill
  } else if (state === REJECTION_STATE) {
    callback = thenPromise.onRejection
    action = reject
  }

  if (isFunction(callback)) {
    try {
      const result = callback(value)
      resolve(thenPromise, result)
    } catch (error) {
      reject(thenPromise, error)
    }
  } else {
    action(thenPromise, value)
  }
}


const jobs = []
const microTimeFun = fun => process.nextTick(fun)
let pending = false

function flush () {
  const jobCopied = jobs.slice(0)
  const length = jobCopied.length
  jobs.length = 0
  pending = false

  for (let i = 0; i < length; i++) {
    jobs[i]()
  }
}
function nextTick (fun) {
  jobs.push(fun)

  if (!pending) {
    pending = true
    microTimeFun(() => flush())
  }
}

function isFunction (func) {
  return typeof func === 'function'
}
function noop () {}

function cannotResolveSelf () {
  return new TypeError('You cannot resovle a promise with itself')
}

function throwUnexpectResolver (resolver) {
  throw new TypeError(`Promise resolver ${resolver} is not a function.`)
}
function throwUnexpectContrust () {
  throw new TypeError(`Failed to construct 'Promise', please use new operator`)
}
