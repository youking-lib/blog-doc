# 编辑器

## 技术类型

| 类型 | 技术选型                               | 技术特征         | 代表                                   | 劣势                     |
| ---- | -------------------------------------- | ---------------- | -------------------------------------- | ------------------------ |
| L0   | 基于 contentEditable、execCommand      | 门槛低、简单轻量 | 早期轻量编辑器                         | 定制空间有限             |
| L1   | 基于 contentEditable、自主实现指令控制 | 定制化功能、协同 | Draft.js/Slate/石墨/腾讯 docs          | 无法突破浏览器的排版限制 |
| L2   | 一切自主控制                           | office、协同     | GoogleDocs、OfficeOnline、IcloudOnline | 技术门槛高               |

### L0 技术原理

```tsx
import React from 'react';
import { Editor } from './editor-l0';

export default function () {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    Editor.create(rootRef.current);
  });

  return <div ref={rootRef}></div>;
}
```
