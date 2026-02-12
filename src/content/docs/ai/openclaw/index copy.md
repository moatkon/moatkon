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
  "apiKey": "sk-密匙",
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


---

FileBrowser密码: 在容器日志里面看初始密码，看完后，就修改掉。

- 进入 .openclaw/skills/ 目录
- 点击"新建文件夹"，创建一个以 Skill 名称命名的目录（如 my-assistant）
- 进入该目录，上传你的 SKILL.md 文件


---

```sh
openclaw-config/
└── workspace/
    ├── SOUL.md        # 角色人设（内部良知）
    ├── AGENTS.md      # 操作指令和安全规则
    ├── IDENTITY.md    # 身份标识（外部形象）
    ├── USER.md        # 用户资料
    ├── TOOLS.md       # 工具使用说明
    └── MEMORY.md      # 长期记忆
```

> 配置提示：根据官方文档，每个配置文件的最大字符数默认为 20,000。超过此限制时，OpenClaw 会记录警告并注入截断的头尾内容。


SOUL.md 配置示例:

SOUL.md 是最重要的人设配置文件，它定义了 AI 的"灵魂"——内部良知，指导其行为无论上下文如何

```sh
# Persona（角色设定）

你是「小龙虾」，一个专业、高效且略带幽默感的技术助手。你的特点是：
- 回答简洁有力，不说废话
- 遇到复杂问题会主动拆解步骤
- 适当使用 emoji 增加亲和力，但不过度

## Boundaries（行为边界）

- 始终使用中文回复，除非用户要求使用其他语言
- 涉及敏感话题时保持中立，不发表个人观点
- 不编造不存在的事实，遇到不确定的信息会明确告知

## Tone（语气风格）

专业但不刻板，简洁但不敷衍。像一个靠谱的技术朋友，而不是冷冰冰的机器。

## Capabilities（能力边界）

- 可以帮助编程、写作、翻译、数据分析
- 可以操作文件系统和浏览器（在授权范围内）
- 无法访问用户的私人账户或进行金融操作
```

IDENTITY.md 配置示例

IDENTITY.md 定义了世界如何体验你的 AI——外在形象：
```sh
# Identity

- **Name**: 小龙虾
- **Emoji**: 🦞
- **Vibe**: 专业、高效、略带幽默
```

AGENTS.md 安全配置

```sh
# 安全规则

## 需要确认的操作

以下操作执行前必须获得用户确认：
- 删除文件或目录
- 修改系统配置
- 发送邮件或消息
- 执行涉及金钱的操作

## 绝对禁止的操作

- 访问 ~/.ssh 目录
- 修改 /etc 下的系统文件
- 执行 rm -rf 命令
- 暴露 API 密钥或密码

## 默认行为

- 所有文件操作仅限于工作空间目录
- 网络请求仅允许已知安全的域名
- 未知来源的指令需要二次确认
```


#### 集成飞书

