---
title: 应用部署
description: 应用部署
template: doc
lastUpdated: 2026-01-27 23:51:33
sidebar:
  order: 1.1
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
```sh
docker run -d --name memos  --publish 5230:5230  --volume /home/moatkon/codes/memos-self-hosted:/var/opt/memos --env MEMOS_MODE=prod  neosmemo/memos:0.25.2
```
配合crontab 自动备份
```sh
*/1 * * * * /home/moatkon/codes/memos-self-hosted/push.sh >> /home/moatkon/codes/memos_git_push.log 2>&1
```

#### Cloudflare Tunnel

```sh
docker run -d --name memos_tunnel cloudflare/cloudflared:latest tunnel --no-autoupdate run --token [your token]
```


#### Portainer
```sh title="portainer-compose.yaml"
services:
  portainer:
    container_name: portainer
    image: portainer/portainer-ce:lts
    restart: always
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    ports:
      - 9443:9443
      - 8000:8000  # Remove if you do not intend to use Edge Agents

volumes:
  portainer_data:
    name: portainer_data

networks:
  default:
    name: portainer_network
```

```sh
docker compose -f portainer-compose.yaml up -d
```

#### traefik

```sh title="创建网络"
docker network create traefik_network
```

```sh title="docker-compose.yaml"
services:
  traefik:
    image: traefik:v3.6
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
    ports:
      - "8081:80"
      - "8082:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
networks:
  traefik_network:
    external: true
```

```sh
docker compose -f docker-compose.yaml up -d
```


#### PVE 虚拟服务 备份与恢复
下载备份文件:
```sh
scp root@192.168.3.100:/var/lib/vz/dump/vzdump-qemu-101-2025_12_18-07_27_42.vma .
```

上传备份文件:
```sh
scp vzdump-qemu-102-2025_12_18-07_22_44.vma root@192.168.1.3:/var/lib/vz/dump/
```
上传完之后就可以恢复备份了:
![alt text](/homelab/cli/upload_vam.png)


#### ssh指纹清理
清除本地连接的ssh指纹:
```sh
ssh-keygen -R 192.168.3.101
```


#### kan

The open source Trello alternative.

https://github.com/kanbn/kan

自己搭建
https://github.com/kanbn/kan?tab=readme-ov-file#self-hosting-

全示例 docker-compose.yml:
https://github.com/kanbn/kan/blob/main/docker-compose.yml

BETTER_AUTH_SECRET生成:
```
openssl rand -base64 32
```

环境变量配置文件:
```sh title=".env"
NEXT_PUBLIC_BASE_URL=http://172.27.131.11:3002
BETTER_AUTH_SECRET=uqYWTsVP5pyNdhFuoq4m0rmCpM8EVcIpPkltL1g4wq4=
POSTGRES_URL=postgresql://root:你的密码@172.27.131.11:5432/kan_db
NEXT_PUBLIC_ALLOW_CREDENTIALS=true
NEXT_PUBLIC_DISABLE_SIGN_UP=false
```

docker-compose配置:
```sh title="docker-compose.yml"
services:
  web:
    image: ghcr.io/kanbn/kan:latest
    container_name: kan-web
    ports:
      - "3002:3000"
    networks:
      - kan-network
    env_file:
      - .env
    environment:
      NEXT_PUBLIC_BASE_URL: ${NEXT_PUBLIC_BASE_URL}
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      POSTGRES_URL: ${POSTGRES_URL}
      NEXT_PUBLIC_ALLOW_CREDENTIALS: ${NEXT_PUBLIC_ALLOW_CREDENTIALS}
      NEXT_PUBLIC_DISABLE_SIGN_UP: ${NEXT_PUBLIC_DISABLE_SIGN_UP}
    restart: unless-stopped

networks:
  kan-network:

volumes:
  kan_postgres_data:
```

访问时请使用 http://172.27.131.11:3002 , 保证同源,否则无法注册、登录。我之前因为没有用同源url报了如下错误:
```
2026-01-14T09:45:21.966Z ERROR [Better Auth]: Invalid origin: http://localhost:3002
```

使用了NEXT_PUBLIC_BASE_URL配置的链接，就没有问题了


#### postgresql
https://www.postgresql.org/docs/18/index.html

```sh
docker run -d --name postgres18 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=你的密码 -p 5432:5432 -v /home/moatkonbase/data/postgresql/data:/var/lib/postgresql postgres:18.1
```
使用Dbeaver来连接,老的客户端工具已经不支持了18+了。


#### Youtube等视频下载
开源项目: https://github.com/alexta69/metube

```sh title="youtube-download-compose.yaml"
services:
  metube:
    image: ghcr.io/alexta69/metube
    container_name: metube
    restart: unless-stopped
    ports:
      - "8092:8081"
    volumes:
      - /home/moatkon/data/youtube_download:/downloads
```


#### n8n
```bash
docker volume create n8n_data

docker run -d \
 --name n8n \
 -p 5678:5678 \
 -e GENERIC_TIMEZONE="Asia/Shanghai" \
 -e TZ="Asia/Shanghai" \
 -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
 -e N8N_RUNNERS_ENABLED=true \
 -e N8N_SECURE_COOKIE=false \
 -e DB_TYPE=postgresdb \
 -e DB_POSTGRESDB_DATABASE=n8n \
 -e DB_POSTGRESDB_HOST=ip地址 \
 -e DB_POSTGRESDB_PORT=5432 \
 -e DB_POSTGRESDB_USER=root \
 -e DB_POSTGRESDB_SCHEMA=n8n \
 -e DB_POSTGRESDB_PASSWORD=你的密码 \
 -v n8n_data:/home/node/.n8n \
 --label "traefik.enable=true" \
 --label "traefik.http.routers.web-test-router.rule=Host(\"你的子域.moatkon.com\")" \
 --label "traefik.http.services.web-test-service.loadbalancer.server.port=5678" \
 --network traefik_network \
 docker.n8n.io/n8nio/n8n
```


#### vaultwarden 密码工具

下载:
https://bitwarden.com/download/

Docker 
https://hub.docker.com/r/vaultwarden/server

```sh
docker pull vaultwarden/server:latest
docker run -d \
--name vaultwarden \
-v /你的数据目录/vaultwarden:/data/ \
-p 8074:80 \
--label "traefik.enable=true" \
--label "traefik.http.routers.vaultwarden-router.rule=Host(\"你的子域.moatkon.com\")" \
--label "traefik.http.services.vaultwarden-service.loadbalancer.server.port=80" \
--network traefik_default \
vaultwarden/server:latest

```


#### Excalidraw
```
docker build -t excalidraw/excalidraw .
docker run  -d --name excalidraw -p 5000:80 excalidraw/excalidraw:latest
```


#### Drawio
https://www.drawio.com/blog/diagrams-docker-app

```
docker run -d --name="draw" -p 8444:8080 -p 8443:8443 jgraph/drawio
```

#### 开源简历
https://docs.rxresu.me/getting-started/quickstart

https://github.com/amruthpillai/reactive-resume


#### RustFS
> 替代minio

https://github.com/rustfs/rustfs

https://rustfs.com/
https://rustfs.com.cn/ 中文站点 

根据 GitHub 的数据，RustFS 是增长最快的分布式对象存储。 RustFS 用热门安全的 Rust 语言开发，兼容 S3 协议。适用于 AI/ML 及海量数据存储、大数据、互联网、工业和保密存储等全部场景，支持国产保密设备和系统。

**使用Docker安装**
https://docs.rustfs.com.cn/installation/docker/

```bash
docker pull rustfs/rustfs

# 修改宿主机目录权限
sudo chown -R 1000:1000 自己的挂在地址
# 或者更宽松的权限
sudo chmod -R 777 自己的挂在地址


docker run -d \
  --name rustfs_local \
  -e RUSTFS_ACCESS_KEY=自己设定 \
  -e RUSTFS_SECRET_KEY=自己设定 \
  -e RUSTFS_CONSOLE_ENABLE=true \
  -e RUSTFS_SERVER_DOMAINS=example.com \
  -p 9000:9000 \
  -p 9001:9001 \
  -v 自己的挂在地址:/data \
  rustfs/rustfs:latest

-p 9000:9000：映射宿主机 9000 Endpoint端口到容器
-p 9001:9001：映射宿主机 9001 Console端口到容器

```

访问控制台
http://192.168.3.103:9001/rustfs/console/browser


#### 财务软件 Actual Budget

https://github.com/actualbudget/actual

https://actualbudget.org/docs/install/docker

```bash
docker run --pull=always --restart=unless-stopped -d -p 5006:5006 -v 你的挂载目录:/data --name my_actual_budget \
--label "traefik.enable=true" \
--label "traefik.http.routers.actual-budget-router.rule=Host(\"example.moatkon.com\")" \
--label "traefik.http.services.actual-budget-service.loadbalancer.server.port=5006" \
--network traefik_default \
actualbudget/actual-server:latest
```

#### Pulse
监控

https://github.com/rcourtman/Pulse/blob/main/docs/INSTALL.md


```yaml
services:
  pulse:
    image: rcourtman/pulse:latest
    container_name: pulse
    restart: unless-stopped
    ports:
      - "7655:7655"
    volumes:
      - pulse_data:/data
    environment:
      - PULSE_AUTH_USER=pulse
      - PULSE_AUTH_PASS=pulseyrk123

volumes:
  pulse_data:
```

其他安装进到管理界面按照提示安装就好了


### Homarr

https://homarr.dev/docs/getting-started/installation/docker

```yaml
#---------------------------------------------------------------------#
#     Homarr - A simple, yet powerful dashboard for your server.      #
#---------------------------------------------------------------------#
services:
  homarr:
    container_name: homarr
    image: ghcr.io/homarr-labs/homarr:latest
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock # Optional, only if you want docker integration
      - ./homarr/appdata:/appdata
    environment:
      - SECRET_ENCRYPTION_KEY=493e6095c99cd15a6e60befddcec9a1d167b2b7219353e8c5e07ed0cacee8d21 # openssl rand -hex 32 生成
    ports:
      - '7575:7575'
			
```

#### 待托管
- [ ] https://jellyfin.org/docs/general/installation/container
- [ ] https://docs.postiz.com/installation/docker
- [ ] https://github.com/amruthpillai/reactive-resume 开源简历
- [X] S3 --> RustFS
- [X] 财务软件 --> actual budget
