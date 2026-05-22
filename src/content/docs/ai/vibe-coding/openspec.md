---
title: OpenSpec
description: OpenSpec
template: doc
draft: false
lastUpdated: 2026-05-22 09:52:06
---

https://github.com/Fission-AI/OpenSpec

面向人工智能编码助手的规范驱动开发（SDD）


#### 安装OpenSpec
```sh
npm install -g @fission-ai/openspec@latest
```

#### 初始化
```sh
cd your-project
openspec init
```

初始化后需要重新打开编程Agent,避免OpenSpec未加载上

#### 更新OpenSpec
```sh
npm install -g @fission-ai/openspec@latest
```

刷新Agent指令,在每个项目中运行此命令以重新生成 AI 指导并确保最新的斜杠命令处于活动状态:
```sh
openspec update
```


#### 实际使用
```sh
/prompts:opsx-explore command arguments
/prompts:opsx-propose command arguments
/prompts:opsx-apply command arguments
/prompts:opsx-archive command arguments
```

详细使用文档参考: https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md
