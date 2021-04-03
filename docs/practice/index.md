## 练习

[DOM 练习](/practice/dom)

[富文本编辑器](/practice/editor/editor)

```tsx
import React, { useState, useEffect } from 'react';
// import useActions from './useActions';

function Header({ code }) {
  const [state, setState] = useState({
    code,
    name: 'whislte'
  });

  console.log(code);

  useEffect(() => {
    console.log(state);
  }, [code]);

  return <div>{state.code}</div>;
}

export default function () {
  const [code, setCode] = useState(0);

  useEffect(() => {
    // setTimeout(() => {
    // setCode(code + 1);
    // }, 1000);
  }, [code]);

  return (
    <div>
      {code}
      <Header code={code} />
    </div>
  );
}
```
