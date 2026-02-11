---
title:  使用Docker安装OpenClaw
description: 使用Docker安装OpenClaw
template: doc
draft: false
lastUpdated: 2026-02-10 13:44:20
---

基于 [Clawdbot/OpenClaw Docker 部署与运维实战教程(2026版）](https://brave2049.com/groups/artificial-intelligence-learning/forum/discussion/clawdbotdocker-bu-shu-yu-yun-wei-shi-zhan-jiao-cheng-2026-ban/) 调整后的脚本,可以一次按照成功



```yml title="openclaw compose 配置"
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

##### 启动
docker compose -f c.yml up -d

##### 下线
docker compose -f c.yml down -v


#### 使用

##### 进入容器
docker exec -it openclaw-gateway bash

##### 运行初始化向导
openclaw onboard

##### 完成后退出容器并重启服务：
exit
docker restart openclaw-gateway

##### 重新生成令牌
docker exec -it openclaw-gateway openclaw dashboard --no-open
##### 查看设备列表
docker exec -it openclaw-gateway openclaw devices list
##### 审核通过设备
docker exec -it openclaw-gateway openclaw devices approve <Request>


---

#### 接入国内模型:
参考: https://damodev.csdn.net/697dff7b7c1d88441d90f0e4.html

```sh
docker exec -it openclaw-gateway bash

openclaw config set 'models.providers.deepseek' --json '{
  "baseUrl": "https://api.deepseek.com/v1",
  "apiKey": "sk-62eb36e1d6104543922454dfcfe5d31e",
  "api": "openai-completions",
  "models": [
    { "id": "deepseek-chat", "name": "DeepSeek Chat" },
    { "id": "deepseek-reasoner", "name": "DeepSeek Reasoner" }
  ]
}'
```

设置 models.mode 为 merge

```sh
openclaw config set models.mode merge
```

设置默认模型（以deepseek-chat为例）:
```sh
openclaw models set deepseek/deepseek-chat
```

重启:
docker restart openclaw-gateway


安装成功:
![](/ai/openclaw/success_install.png)