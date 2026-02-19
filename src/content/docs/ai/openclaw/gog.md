---
title: gog安装
description: gog安装
template: doc
draft: false
lastUpdated: 2026-02-19 20:42:10
sidebar:
  order: 5
---

#### gog可以做什么?
Google Workspace CLI for Gmail, Calendar, Drive, Contacts, Sheets, and Docs.

可以通过OpenClaw管理你的邮件、日志、硬盘、联系人、表格、文档等应用

#### 安装前置要求需要Homebrew
系统需要安装Homebrew才可以

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

安装完之后,再在onboard上下载gog就可以了。

安装完,最好重启一下。

#### 配置Gog
安装好之后,直接在飞书与其对话，OpenClaw会教你怎么配置，一步一步来。在配置过程中,我感受到了OpenClaw的NB之处了

#### 配置好之后，就可以在飞书收发邮件了
![](/ai/openclaw/gog/send_success.png)

#### 解决问题

1. **发送 /new 之后,授权消息失效了**
原因就是没有持久化。直接让openclaw来持久化,帮你操作，不用自己找解决方案
