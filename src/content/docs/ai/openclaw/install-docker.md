---
title:  使用Docker安装OpenClaw
description: 使用Docker安装OpenClaw
template: doc
draft:true
lastUpdated: 2026-02-10 13:44:20
---

```sh
git clone https://github.com/openclaw/openclaw.git
cd openclaw/
sudo ./docker-setup.sh
```

#### 遇到的问题

问题1:

```sh
 => ERROR [internal] load metadata for docker.io/library/node:22-bookworm                             31.9s
------
 > [internal] load metadata for docker.io/library/node:22-bookworm:
------
Dockerfile:1
--------------------
   1 | >>> FROM node:22-bookworm
   2 |
   3 |     # Install Bun (required for build scripts)
--------------------
ERROR: failed to build: failed to solve: DeadlineExceeded: failed to fetch anonymous token: Get "https://auth.docker.io/token?scope=repository%3Alibrary%2Fnode%3Apull&service=registry.docker.io": dial tcp 31.13.95.33:443: i/o timeout
```

解决方案:

```sh
docker pull node:22-bookworm
```


问题2:

卡住
```
[14/14] RUN chown -R node:node /app
```

原因是: 文件过多，递归赋权限慢。

解决方案:
找到 Dockerfile,注释掉 `RUN chown -R node:node /app` , 添加一行: `COPY --chown=node:node . /app`