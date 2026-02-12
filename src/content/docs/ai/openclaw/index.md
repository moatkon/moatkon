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
# 第一处地方
# echo "==> Building Docker image: $IMAGE_NAME"
# docker build \
#   --build-arg "OPENCLAW_DOCKER_APT_PACKAGES=${OPENCLAW_DOCKER_APT_PACKAGES}" \
#   -t "$IMAGE_NAME" \
#   -f "$ROOT_DIR/Dockerfile" \
#  "$ROOT_DIR"

# 第二处地方
#docker compose "${COMPOSE_ARGS[@]}" run --rm openclaw-cli onboard --no-install-daemon
```

```sh
./docker-setup.sh
```
