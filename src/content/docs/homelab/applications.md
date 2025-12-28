---
title: 应用
description: 应用
template: doc
lastUpdated: 2025-12-28 20:01:32
sidebar:
  order: 10
---

#### Slash 短链跳转
``` sh
docker run -d --name slash --publish 5231:5231 --volume /home/moatkon/codes/slash/:/var/opt/slash yourselfhosted/slash:latest
```

#### MySQL 
```sh
docker run --name mysql -v /home/moatkonbase/data/mysql/data:/var/lib/mysql -v /home/moatkonbase/data/mysql/conf:/etc/mysql/conf.d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=mysqlrootpwd -d mysql:lts
```

#### Memos
```
docker run -d --name memos  --publish 5230:5230  --volume /home/moatkon/codes/memos-self-hosted:/var/opt/memos --env MEMOS_MODE=prod  neosmemo/memos:0.25.2
```

#### Cloudflare Tunnel

```sh
docker run -d --name memos_tunnel cloudflare/cloudflared:latest tunnel --no-autoupdate run --token [your token]
```
