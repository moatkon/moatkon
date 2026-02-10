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

第一步：

安装OpenClaw:

参考官网: https://docs.openclaw.ai/start/getting-started#quick-setup-cli

```
curl -fsSL https://openclaw.ai/install.sh | bash
```

如果安装不了,直接把仓库clone下来,在本地编译,然后将错误给AI,解决后再执行上面的安装指令


第二步：全局安装当前项目

在 ~/openclaw 目录下执行：
```
npm install -g .
```

这会把当前项目注册为全局命令。

然后验证：
```
which openclaw
openclaw --version
```

如果成功，再执行：
```
openclaw onboard --install-daemon
```
--- 
清理命令缓存: `hash -r`
卸载cmake: `sudo apt remove cmake -y`
安装官方新版本（snap 方式最简单）: `sudo snap install cmake --classic`
