---
title: Gemini Cli安装
description: Gemini Cli
template: doc
draft: false
tableOfContents: false
lastUpdated: 2025-06-27 10:57:45
---

### 开源
https://github.com/google-gemini/gemini-cli

##### blog
https://blog.google/technology/developers/introducing-gemini-cli-open-source-ai-agent/

### Windows上安装

在Windows PowerShell命令行中安装

##### 安装
```bash
npm install -g @google/gemini-cli
```

##### 启动
```bash
gemini
```


##### 设置环境变量
```bash
$env:GOOGLE_CLOUD_PROJECT = "<GOOGLE_CLOUD_PROJECT>"
$env:GEMINI_API_KEY = "<GEMINI_API_KEY>"

# 代理
$env:HTTPS_PROXY = "http://<ip>:<port>"
$env:HTTP_PROXY = "http://<ip>:<port>"
```

#### 安装完成后
![](/ai/gemini/cli/index.png)

使用:
![](/ai/gemini/cli/i2.png)
