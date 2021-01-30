# 富文本编辑器

## 技术类型

| 类型 | 技术选型                               | 技术特征         | 劣势                     | 代表                                   |
| ---- | -------------------------------------- | ---------------- | ------------------------ | -------------------------------------- |
| L0   | 基于 contentEditable、execCommand      | 门槛低、简单轻量 | 定制空间有限             | 早期轻量编辑器                         |
| L1   | 基于 contentEditable、自主实现指令控制 | 定制化功能、协同 | 无法突破浏览器的排版限制 | Draft.js/Slate/石墨/腾讯 docs          |
| L2   | 一切自主控制                           | office、协同     | 技术门槛高               | GoogleDocs、OfficeOnline、IcloudOnline |

### L0 编辑器示例

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
