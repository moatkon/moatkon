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

# 后面去初始化。失败成功与否都没有关系。主要是让其生成配置文件
```

打开自己机器上家目录里面的.openclaw

```sh
cd ~/.openclaw
vim openclaw.json

# gateway.bind 值改为lan   改完之后openclaw会自动加载,不用重启
```

上面docker-setup.sh的核心职责是拼装docker-compose.yml,可以找到直接操作或者编辑

```yml title="您也可以基于这个直接启动"
services:
  openclaw-gateway:
    image: ${OPENCLAW_IMAGE:-openclaw:local}
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


docker compose -f /home/moatkon/docker_app/openclaw/docker-compose.yml up -d

