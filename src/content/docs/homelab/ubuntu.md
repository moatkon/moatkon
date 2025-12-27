---
title: Ubuntu
description: Ubuntu
template: doc
lastUpdated: 2025-12-27 21:28:34
draft: false
sidebar:
  order: 7
---

#### 1. 开启SSH
1. **更新系统包列表**：  
    首先确保你的 Ubuntu 系统是最新的。打开终端并输入以下命令：
    
    ```bash
    sudo apt update
    sudo apt upgrade
    ```
    
2. **安装 OpenSSH 服务器**：  
    接下来安装 `openssh-server`，这是 Ubuntu 上常用的 SSH 服务程序。在终端中输入：
    
    ```bash
    sudo apt install openssh-server
    ```
    
3. **检查 SSH 服务状态**：  
    安装完成后，可以检查 SSH 服务是否正在运行：
    
    ```bash
    sudo service ssh status
    ```
    
    或者使用 `systemctl` 命令：
    
    ```bash
    sudo systemctl status ssh
    ```
    
    如果服务已经启动，你会看到类似 `active (running)` 的输出。
    
4. **启动 SSH 服务**：  
    如果 SSH 服务没有自动启动，可以手动启动它：
    
    ```bash
    sudo service ssh start
    ```
    
    或者使用 `systemctl`：
    
    ```bash
    sudo systemctl start ssh
    ```
    
5. **设置开机自启**：  
    为了确保每次重启后 SSH 自动启动，可以设置其为开机启动：
    
    ```bash
    sudo systemctl enable ssh
    ```
    
6. **配置防火墙（如果有的话）**：  
    如果你在使用 UFW（Uncomplicated Firewall），需要允许 SSH 访问：
    
    ```bash
    sudo ufw allow ssh
    ```
    
7. **测试 SSH 连接**：  
    最后，从另一台机器尝试连接到你刚设置的 SSH 服务器来验证配置是否正确：
    
    ```bash
    ssh your_username@your_server_ip
    ```
    
    输入密码后，你应该能够成功登录到远程服务器。
    

完成以上步骤后，SSH 服务应该已经在你的 Ubuntu 系统上正常工作了。如果遇到任何问题，请检查 `/var/log/auth.log` 文件以获取有关 SSH 服务的错误信息。

#### 2. 安装Docker
https://docs.docker.com/engine/install/ubuntu/

```sh
sudo systemctl status docker

sudo systemctl start docker

sudo systemctl enable docker
```

#### 2. Ubuntu系统启动时,设定启动的服务

##### 方法一:使用systemd

1. **创建 systemd 服务文件**:
```bash
sudo nano /etc/systemd/system/docker-mycontainer.service
```

内容如下:
```ini
[Unit]
Description=My Docker Container
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/bin/docker start my-container-name
ExecStop=/usr/bin/docker stop my-container-name

[Install]
WantedBy=multi-user.target
```

2. **启用服务**:
```bash
sudo systemctl enable docker-mycontainer.service
```

##### 方法二:使用 Docker 的重启策略

创建容器时就设置自动重启:

```bash
docker run -d --restart=always --name my-container-name image-name
```

或者修改现有容器:
```bash
docker update --restart=always my-container-name
```

这样 Docker 服务启动后会自动启动该容器。


#### 3. cloudflare/cloudflared
docker run -d --name memos_tunnel cloudflare/cloudflared:latest tunnel --no-autoupdate run --token <token>
