## 节点序列的问题

```ts
// 1. 被裁剪的路径：[1,3],[1,4],[3,2],[3,5]
// 2. 数据结构
var arr = [
  [1, 2],
  [1, 3],
  [1, 4],
  [2, 3],
  [3, 4],
  [3, 5],
  [3, 1],
  [3, 2],
  [4, 5]
];
// 3. 算法实现
function filter(arr) {
  const result = [];
  const pathLengthMap = {
    // eg:
    // 3: { length: 2, item: [1, 3] }
  };

  arr.forEach(item => {
    const start = item[0];
    const end = item[1];
    const length = end - start;

    let point = end;

    if (length < 0) {
      point = -start;
    }

    if (pathLengthMap[point] === undefined) {
      pathLengthMap[point] = {
        length,
        item
      };
    } else {
      if (length < pathLengthMap[point].length) {
        result.push(pathLengthMap[point].item);
        pathLengthMap[point] = {
          length,
          item
        };
      } else {
        result.push(item);
      }
    }
  });

  return result;
}

console.log(filter(arr)); // [[1,3],[1,4],[3,2],[3,5]]
```
