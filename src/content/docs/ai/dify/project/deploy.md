---
title: 发布moatkon网站及其子域
description: 基于Dify发布moatkon网站
template: doc
draft: false
lastUpdated: 2026-03-20 14:39:07
---

#### 说明
代码是在Github上维护的,云服务商是Cloudflare(后面简称CF)。功能是CF实现的,使用Dify就是触发了CF的一个Webhook而已

#### 流程
![](/ai/dify/project/发布moatkon.png)

#### 20250730 迭代支持
![](/ai/dify/project/deploy2.png)

#### 20260219
已经让OpenClaw来接管了。我只需要和OpenClaw说
- 部署moatkon
- 部署blog
- 部署subs
- 部署resume
- 部署links

就能完成对应的部署
