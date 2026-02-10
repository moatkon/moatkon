---
title: OpenClaw安装
description: OpenClaw安装
template: doc
draft: doc
lastUpdated: 2026-02-10 13:44:20
---

设置NPM代理,临时:
```sh
sudo apt -o Acquire::http::Proxy="http://127.0.0.1:7890" \
         -o Acquire::https::Proxy="http://127.0.0.1:7890" \
         update
```

安装OpenClaw:

参考官网: https://docs.openclaw.ai/start/getting-started#quick-setup-cli

```
curl -fsSL https://openclaw.ai/install.sh | bash

或者

curl -fsSL https://openclaw.ai/install.sh | sudo bash

> 多个bash

```

遇到错误 "npm install failed; cleaning up and retrying..."
解决方案参考: https://github.com/openclaw/openclaw/discussions/5462
```sh
sudo apt install -y make cmake build-essential python3
```
