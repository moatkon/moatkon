---
title: 安装PVE及相关问题解决
description: 安装PVE及相关问题解决
template: doc
lastUpdated: 2025-12-13 16:58:17
sidebar:
  order: 3
---

#### 部署架构

刚玩,简单画一下部署架构

![](/homelab/Moatkon-HomeLab-install.svg)

#### 遇到的问题
##### 在笔记本电脑上无法访问PVE的Web界面
原因分析: PVE的网段和笔记本电脑的网段不是同一个。

之前的配置(cat /etc/network/interfaces):
> 没有记录真实的配置，这里凭借印象简单写了一下以体现问题。不影响阐述问题
```sh
auto lo
iface lo inet loopback

iface nic0 inet manual

auto vmbr0
iface vmbr0 inet static
        address 192.168.100.2/24
        gateway 255.255.255.0
        bridge-ports nic0
        bridge-stp off
        bridge-fd 0

iface nic1 inet manual


source /etc/network/interfaces.d/*
```


正确的网络配置,编辑文件 `cat /etc/network/interfaces`:
```sh
root@pve:~# cat /etc/network/interfacesca
auto lo
iface lo inet loopback

iface nic0 inet manual

auto vmbr0
iface vmbr0 inet static
        address 192.168.3.100/24
        gateway 192.168.3.1
        bridge-ports nic0
        bridge-stp off
        bridge-fd 0

iface nic1 inet manual


source /etc/network/interfaces.d/*
```

- gateway配置为路由器 LAN IP：192.168.3.1
- address 自己配置,选择自己喜欢的即可


设置完之后,重启网络设备:
```sh
systemctl restart networking
```

之后,再在笔记本电脑上即可以正常访问PVE Web界面。 `https://192.168.3.100:8006`

##### 上传系统镜像太慢
原因: 根据部署架构,问题瓶颈在无线路由器。因为都是通过它来传输内容的。

解决方案: 按照目前的玩法没有必要解决,多等一会就是了。把时间留给有意义的事情
