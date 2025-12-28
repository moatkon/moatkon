---
title: 应用
description: 应用
template: doc
lastUpdated: 2025-12-29 00:33:43
sidebar:
  order: 9
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
```sh title="portainer-compose.yml"
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

```sh title="docker-compose.yml"
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
```

```sh
docker compose -f portainer-compose.yaml up -d
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

#### drawio
- https://hub.docker.com/r/jgraph/drawio
- https://github.com/jgraph/docker-drawio
- https://github.com/jgraph/drawio

```
# 临时使用
docker run -it --rm --name="draw" -p 8080:8080 -p 8443:8443 jgraph/drawio

# --rm: 容器停止后自动删除容器
#
# -it:
# -i（interactive）
#      保持 STDIN 打开，允许你与容器交互
# -t（tty）
#      分配一个伪终端，方便在终端里看到输出

# 后台运行
docker run -d --name="draw" -p 5232:8080 jgraph/drawio
```
