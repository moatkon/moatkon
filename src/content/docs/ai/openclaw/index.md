---
title:  使用Docker安装OpenClaw
description: 使用Docker安装OpenClaw
template: doc
draft: true
lastUpdated: 2026-02-10 13:44:20
---

采用以下镜像来安装: https://hub.docker.com/r/alpine/openclaw


```sh
git clone https://github.com/openclaw/openclaw.git
cd openclaw
export OPENCLAW_IMAGE="alpine/openclaw"

# 验证环境变量
echo $OPENCLAW_IMAGE
```



```sh title="编辑 docker-setup.sh, 注释以下行"
# echo "==> Building Docker image: $IMAGE_NAME"
# docker build \
#   --build-arg "OPENCLAW_DOCKER_APT_PACKAGES=${OPENCLAW_DOCKER_APT_PACKAGES}" \
#   -t "$IMAGE_NAME" \
#   -f "$ROOT_DIR/Dockerfile" \
#  "$ROOT_DIR"
```

```sh
./docker-setup.sh

按照实际情况配置
```

退出 docker-setup后 容器消失.



打开自己机器上家目录里面的.openclaw

```sh
cd ~/.openclaw
vim openclaw.json

# gateway.bind 值改为lan 
```

编辑 docker-setup.sh, 注释
#docker compose "${COMPOSE_ARGS[@]}" run --rm openclaw-cli onboard --no-install-daemon

再次执行 ./docker-setup.sh


进入容器 docker exec -it openclaw-gateway bash
在容器里面 printenv | grep OPENCLAW 获取到真实token，配置到配置文件


node dist/index.js devices list




----------------
----------------
----------------
----------------
----------------





上面docker-setup.sh的核心职责是拼装docker-compose.yml,可以找到直接操作或者编辑

```yml title="您也可以基于这个直接启动"
services:
  openclaw-gateway:
    image: ${OPENCLAW_IMAGE:-openclaw:local}
    container_name: openclaw-gateway
    environment:
      HOME: /home/node
      TERM: xterm-256color
      OPENCLAW_GATEWAY_TOKEN: ${OPENCLAW_GATEWAY_TOKEN}
      CLAUDE_AI_SESSION_KEY: ${CLAUDE_AI_SESSION_KEY}
      CLAUDE_WEB_SESSION_KEY: ${CLAUDE_WEB_SESSION_KEY}
      CLAUDE_WEB_COOKIE: ${CLAUDE_WEB_COOKIE}
    volumes:
      - ${OPENCLAW_CONFIG_DIR}:/home/node/.openclaw
      - ${OPENCLAW_WORKSPACE_DIR}:/home/node/.openclaw/workspace
    ports:
      - "${OPENCLAW_GATEWAY_PORT:-18789}:18789"
      - "${OPENCLAW_BRIDGE_PORT:-18790}:18790"
    init: true
    restart: unless-stopped
    command:
      [
        "node",
        "dist/index.js",
        "gateway",
        "--bind",
        "${OPENCLAW_GATEWAY_BIND:-lan}",
        "--port",
        "18789",
      ]

#   openclaw-cli:
#     image: ${OPENCLAW_IMAGE:-openclaw:local}
#     environment:
#       HOME: /home/node
#       TERM: xterm-256color
#       OPENCLAW_GATEWAY_TOKEN: ${OPENCLAW_GATEWAY_TOKEN}
#       BROWSER: echo
#       CLAUDE_AI_SESSION_KEY: ${CLAUDE_AI_SESSION_KEY}
#       CLAUDE_WEB_SESSION_KEY: ${CLAUDE_WEB_SESSION_KEY}
#       CLAUDE_WEB_COOKIE: ${CLAUDE_WEB_COOKIE}
#     volumes:
#       - ${OPENCLAW_CONFIG_DIR}:/home/node/.openclaw
#       - ${OPENCLAW_WORKSPACE_DIR}:/home/node/.openclaw/workspace
#     stdin_open: true
#     tty: true
#     init: true
#     entrypoint: ["node", "dist/index.js"]
```

一些基于docker-compose.yml操作的指令

```sh
docker compose -f /home/moatkon/docker_app/openclaw/docker-compose.yml up -d

WhatsApp (QR):
docker compose -f /home/moatkon/docker_app/openclaw/docker-compose.yml run --rm openclaw-cli channels login

Telegram (bot token):
docker compose -f /home/moatkon/docker_app/openclaw/docker-compose.yml run --rm openclaw-cli channels add --channel telegram --token <token>

Discord (bot token):
docker compose -f /home/moatkon/docker_app/openclaw/docker-compose.yml run --rm openclaw-cli channels add --channel discord --token <token>

docker compose -f /home/moatkon/docker_app/openclaw/docker-compose.yml exec openclaw-gateway node dist/index.js health --token "f4cd538bc9f7128e93077604dfc29e5a01094ea24cbbfd107f27d5648fd37378"
```

不过我不喜欢这么操作。我喜欢

docker exec -it 容器名 node dist/index.js 指令

docker exec -it openclaw-gateway node dist/index.js devices list