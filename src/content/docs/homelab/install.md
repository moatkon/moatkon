---
title: 安装PVE及相关问题解决
description: 安装PVE及相关问题解决
template: doc
lastUpdated: 2025-12-13 23:24:16
sidebar:
  order: 3
---

### 部署架构

刚玩,简单画一下部署架构

![](/homelab/Moatkon-HomeLab-install.svg)

### 遇到的问题

#### 1.登录不上
默认用户名是root,一开始我以为是我安装时的邮箱,所以一直登录不上,使用root就OK了

#### 2.在笔记本电脑上无法访问PVE的Web界面
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

#### 3.上传系统镜像太慢
原因: 根据部署架构,问题瓶颈在无线路由器。因为都是通过它来传输内容的。

解决方案: 按照目前的玩法没有必要解决,多等一会就是了。把时间留给有意义的事情

我想象中的解决方案:
![](/homelab/Moatkon-HomeLab-exchange.svg)

- Mac到PVE直接通过交换机转发
- 路由器只负责上网，内网流量不经过路由器

#### 4. Windows11无法设置分辨率

> 如果需要激活Windows或者Office,可以基于这个网站来破解: https://massgrave.dev/

##### 安装 VirtIO 驱动程序
Windows 11 需要安装 Proxmox 的 VirtIO 驱动才能正常使用显示适配器。

下载virtio-win.iso  下载地址: https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso

在 VM 配置中添加 CD/DVD 驱动器，挂载 virtio-win.iso
- 在 Windows 11 中：
- 打开"设备管理器"
- 找到带黄色感叹号的"显示适配器"或"其他设备"
- 右键点击 → 更新驱动程序 → 浏览我的电脑 → 选择 CD 驱动器中的 virtio-win ISO
- 安装完成后重启

在 PVE 的 VM 配置中选择合适的显示类型：

- 选择 VM → Hardware → Display

尝试以下选项（按推荐顺序）：
- VirtIO-GPU（推荐，需要安装 VirtIO 驱动）
- SPICE (qxl)
- VMware compatible
- std VGA


> 如果使用 VirtIO-GPU，可以设置显存大小（建议 16MB 或更高）

---

如果没有带黄色感叹号的"显示适配器"或"其他设备":

1. 检查当前显示适配器

        打开设备管理器,展开"显示适配器",看到的是什么设备?

        - 如果是 "Microsoft Basic Display Adapter" - 说明缺少正确的驱动
        - 如果是 "Red Hat QXL" 或 "VirtIO GPU" - 驱动已安装

2. 手动安装 VirtIO 显示驱动
        即使没有黄色感叹号,也可以手动安装:

        - 挂载 virtio-win.iso 到 Windows 11
        - 打开文件资源管理器,进入 CD 驱动器
        - 找到路径: viogpudo\w11\amd64\
        - 右键点击 viogpudo.inf → 安装
        - 重启 Windows

3. 在 PVE 中更改显示配置
        在 Proxmox 界面操作:

        - 关闭 Windows 11 虚拟机
        - 选择 VM → Hardware → Display
        - 点击 Edit
        - 尝试更改为:
                - VirtIO-GPU (推荐)
                - VMware compatible (兼容性好)
        - 启动虚拟机
