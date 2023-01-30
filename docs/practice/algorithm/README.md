## 节点序列的问题

```
有这样的场景，有序节点序列，对于路径 A -> C, 如果 A -> B && B -> C，那么 A -> C 可被优化掉
（同理反向也可以裁剪），否则路径应该保留（去长留短）.
再举一例，如果有 A->C、C->F、A->F, 那么A->F可被裁剪（去长留短）
现假设有如下示例节点数据（注意下面四行是一组数据）：
1 -> 2，1-> 3，1 -> 4，
2 -> 3，
3 -> 4，3 -> 5，3->1，3->2，
4 -> 5，
1. 找出上面示例数据中可被裁剪的路径
2. 给出一种JS数据结构来表征上面的示例数据
3. 以步骤2中的数据作为输入，实现一个算法，输出可被裁剪的路径
```

```ts
// 1. 被裁剪的路径：[1,3],[1,4],[3,2],[3,5]
// 2. 数据结构
var arr = [
  [
    [1, 2],
    [1, 3],
    [1, 4]
  ],
  [[2, 3]],
  [
    [3, 4],
    [3, 5],
    [3, 1],
    [3, 2]
  ],
  [[4, 5]]
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
