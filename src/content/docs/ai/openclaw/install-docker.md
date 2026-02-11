---
title:  使用Docker安装OpenClaw
description: 使用Docker安装OpenClaw
template: doc
draft: true
lastUpdated: 2026-02-10 13:44:20
---

```sh
git clone https://github.com/openclaw/openclaw.git
cd openclaw/
# 不要使用sudo来运行脚本
./docker-setup.sh
```


会在终端里面显示启动信息，但是此时不是在后台运行的，终端一关闭，openclaw就关闭了。因为镜像已经构建好了，在本地。可以通过docker images查看。我们可以使用images来启动，命令如下

```
docker run -d \
--name openclaw \
-p 18789:18789 \
-e OPENCLAW_GATEWAY_TOKEN=123456789abcdef \
openclaw:local \
node openclaw.mjs gateway --allow-unconfigured --bind lan 
```

docker基础指令: `docker exec -it openclaw node openclaw.mjs <command>`

![](/ai/openclaw/disconnect_1008.png)

设备:
docker exec -it openclaw node openclaw.mjs devices list



![](/ai/openclaw/pair.png)

设备审核同意
docker exec -it openclaw node openclaw.mjs devices approve <Request>


配置:
docker exec -it openclaw node openclaw.mjs config


宿主机访问:
http://172.27.131.11:18789/#token=123456789abcdef


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


问题3:
Error: EACCES: permission denied, open '/home/node/.openclaw/.env'

造成这个问题的原因是因为我: root 构建阶段 + 非 root 运行 + home 目录未授权。所以一开始就不要使用sudo来运行脚本

解决方案:
在 Dockerfile 里，在切换 USER 之前，显式创建目录并授权：

在 `USER node` 之前加：
```
RUN mkdir -p /home/node/.openclaw
&& chown -R node:node /home/node
```

---
- 教程: https://www.binance.com/zh-CN/square/post/36008200678113
- https://brave2049.com/groups/artificial-intelligence-learning/forum/discussion/clawdbotdocker-bu-shu-yu-yun-wei-shi-zhan-jiao-cheng-2026-ban/




```yml
version: "3.8"
services:
  openclaw-gateway:
    image: node:22-slim
    container_name: openclaw-gateway
    tty: true
    stdin_open: true
    volumes:
      - ./data:/work
      - ./openclaw-config:/root/.openclaw
      - openclaw-modules:/usr/local/lib/node_modules  # 持久化已安装的包，避免重复安装
    working_dir: /work
    environment:
      - TZ=Asia/Shanghai
      - NODE_ENV=production
      - OPENCLAW_GATEWAY_TOKEN=123456789abcdef
    ports:
      - 18789:18789
    entrypoint: ["/bin/bash", "-c"]
    command:
      - |
        # 只在首次运行时安装（避免 ENOTEMPTY 错误）
        if ! command -v openclaw &> /dev/null; then
          apt-get update && apt-get install -y curl git ca-certificates
          npm install -g openclaw@latest
        fi

        # 初始化配置（注意：bind 必须使用关键字，不能用 IP 地址）
        mkdir -p /root/.openclaw
        if [ ! -f /root/.openclaw/openclaw.json ]; then
          echo '{"gateway":{"bind":"lan","port":18789,"controlUi":{"allowInsecureAuth":true}}}' > /root/.openclaw/openclaw.json
        fi

        # 直接启动 gateway 进程（Docker 环境不支持 systemd）
        echo "🦞 Starting OpenClaw Gateway..."
        cd /usr/local/lib/node_modules/openclaw
        exec node dist/index.js gateway --bind lan --port 18789 --allow-unconfigured
    restart: unless-stopped

  filebrowser:
    image: filebrowser/filebrowser:latest
    container_name: filebrowser-openclaw
    user: 0:0
    volumes:
      - ./data:/srv
      - ./openclaw-config:/srv/.openclaw
      - ./filebrowser-config:/database
    command:
      - --database
      - /database/filebrowser.db
      - --root
      - /srv
    ports:
      - 2081:80
    restart: unless-stopped

volumes:
  openclaw-modules:  # 持久化 node_modules，避免每次重启都重新安装

networks: {}
```