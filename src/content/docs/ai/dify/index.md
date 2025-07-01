---
title: Docker安装Dify
description: Docker安装Dify
template: doc
draft: false
lastUpdated: 2025-07-01 20:29:43
---

:::note

如果不采用本地安装,可以使用Dify的云服务,方便,快捷

https://cloud.dify.ai/

:::


#### Docker安装
```sh title="安装"
git clone https://github.com/langgenius/dify.git
cd dify/
cd docker
cp .env.example .env
docker compose up -d
```

```sh title="访问"
 http://localhost/install 
```


#### Dify用例
[发布moatkon.com](/ai/dify/project/deploy)
