---
title: 升级OpenClaw
description: 升级OpenClaw
template: doc
draft: false
lastUpdated: 2026-03-12 20:29:54
sidebar:
  order: 20
---

从2026.2.15升级到2026.3.8

升级之前,我把openclaw数据目录【openclaw】复制了一份【openclaw_20260306】,新的容器全部挂载【openclaw_20260306】目录。防止升级失败还影响了原目录

```sh
docker pull alpine/openclaw:latest

docker run -d \
--name openclaw_20260306 \
--restart unless-stopped \
-e NPM_CONFIG_REGISTRY=https://registry.npmmirror.com \
-u root \
-v /home/moatkon/codes/memos-self-hosted/openclaw_20260306:/root/.openclaw \
-v /home/moatkon/codes/memos-self-hosted/openclaw_20260306/workspace:/root/.openclaw/workspace \
-p 18790:18789 \
alpine/openclaw:latest \
node openclaw.mjs gateway --allow-unconfigured --bind lan
```

升级的时候我是将之前的OpenClaw停止了,所以换了一个端口 18790。

如果通过 http://192.168.3.101:18790/overview 访问,会报错

```
control ui requires device identity (use HTTPS or localhost secure context)
此页面为 HTTP，因此浏览器阻止设备标识。请使用 HTTPS (Tailscale Serve) 或在网关主机上打开 http://127.0.0.1:18789。
如果您必须保持 HTTP，请设置 gateway.controlUi.allowInsecureAuth: true (仅限令牌)。
Docs: Tailscale Serve · Docs: Insecure HTTP
```

解决方法: 将远程的机器地址映射通过ssh映射到本地
```sh
ssh -L 18790:127.0.0.1:18790 moatkon@192.168.3.101
```

再在本地机器访问 http://127.0.0.1:18790/overview ,然后填入token就可以了

![](/ai/openclaw/upgrade_20260308.png)


20260312 升级到2026.3.11之后发现可以直接收取邮件了。不用在初始化环境了。

```sh title="以前在容器中做的brew等初始化"
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo >> /root/.bashrc
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv bash)"' >> /root/.bashrc
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv bash)"
apt-get install build-essential
brew install gcc
```
