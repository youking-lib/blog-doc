# 如何实现一个计算器

有这样一道面试题：请计算 `'1+2+3-4'` 的值；请不要使用 eval 等字符串转代码的方式。

```tsx
import React, { useState } from "react";
import { Input } from "antd";

const OPERATOR = {
  "+": (pre, next) => Number(pre) + Number(next),
  "-": (pre, next) => Number(pre) - Number(next),
};

function solution(str) {
  const arr = str.split("");
  let operatorFun = null;

  return arr.reduce((pre, cur) => {
    if (operatorFun) {
      const result = operatorFun(pre, cur);
      operatorFun = null;
      return result;
    }

    if (OPERATOR[cur]) {
      operatorFun = OPERATOR[cur];
      return pre;
    }

    return cur;
  }, 0);
}

export default function () {
  const [exp, setExp] = useState("1+2+3-4");

  return (
    <div>
      <Input
        defaultValue={exp}
        onPressEnter={(e) => setExp(e.currentTarget.value)}
      />
      {exp && solution(exp)}
    </div>
  );
}
```

## 后缀表达式

```tsx
import React, { useState } from "react";
import { Input } from "antd";

const isBracketStart = (token) => token === "(";
const isBracketEnd = (token) => token === ")";

function getPriority(token) {
  if (["-", "+"].includes(token)) {
    return 1;
  }
  if (["*", "/"].includes(token)) {
    return 2;
  }
}

function suffixTransit(exp: string) {
  const stack: string[] = [];
  const result = [];
  const expLen = exp.length;

  for (let i = 0; i < expLen; i++) {
    const token = exp[i];
    console.log(stack);
    console.log(result);

    if (token >= 0 && token <= 9) {
      result.push(Number(token));
    } else if (isBracketStart(token)) {
      stack.push(token);
    } else if (isBracketEnd(token)) {
      while (stack.length && !isBracketStart(getStackTop())) {
        result.push(stack.pop());
      }
      // 括号内处理完成，移除 (
      stack.pop();
    } else {
      while (
        stack.length && // 栈不为空
        !isBracketStart(getStackTop()) && // 遇到 ( 就不继续处理了
        getPriority(token) <= getPriority(getStackTop())
      ) {
        result.push(stack.pop());
      }
      stack.push(token);
    }
  }

  while (stack.length) {
    result.push(stack.pop());
  }

  return result;

  function getStackTop() {
    return stack[stack.length - 1];
  }
}

function renderResult(exp) {
  return (
    <div>
      <div>中缀表达式: {exp}</div>
      <div>后缀表达式: {suffixTransit(exp)}</div>
    </div>
  );
}

export default function () {
  const [exp, setExp] = useState("1+2*3-4");

  return (
    <div>
      <Input
        defaultValue={exp}
        onPressEnter={(e) => setExp(e.currentTarget.value)}
      />
      <div>{exp && renderResult(exp)}</div>
    </div>
  );
}
```
