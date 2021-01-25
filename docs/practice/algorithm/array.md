# 数组相关

## 多维数组遍历

1. 深度优先

```js
function tranvers(arr, callback) {
  arr.forEach(item => {
    if (Array.isArray(item)) {
      tranvers(item, callback);
    } else {
      callback(item);
    }
  });
}
// test
tranvers([0, [1], [[3], 2], 4], console.log);
```

2. 广度优先

```js
function tranvers(arr, callback) {
  const queue = [...arr];
  while (queue.length) {
    const cur = queue.shift();

    if (Array.isArray(cur)) {
      queue.push(...cur);
    } else {
      callback(cur);
    }
  }
}
// test
tranvers([0, [1], [[3], 2], 4], console.log);
```
