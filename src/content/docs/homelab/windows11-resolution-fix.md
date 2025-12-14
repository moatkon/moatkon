---
title: PVE中Windows11分辨率设置
description: PVE中Windows11分辨率设置
template: doc
lastUpdated: 2025-12-14 10:49:00
draft: false
sidebar:
  order: 5
---

> 如果需要激活Windows或者Office,可以基于这个网站来破解: https://massgrave.dev/

### 安装 VirtIO 驱动程序
Windows 11 需要安装 Proxmox 的 VirtIO 驱动才能正常使用显示适配器。

#### 1.下载virtio-win.iso  
下载地址: https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso

#### 2.在 VM 配置中添加 CD/DVD 驱动器，挂载 virtio-win.iso

- 在 Windows 11 中：
- 打开"设备管理器"
- 找到带黄色感叹号的"显示适配器"或"其他设备"
- 右键点击 → 更新驱动程序 → 浏览我的电脑 → 选择 CD 驱动器中的 virtio-win ISO
- 安装完成后重启

#### 3.在 PVE 的 VM 配置中选择合适的显示类型：

- 选择 VM → Hardware → Display

#### 4.尝试以下选项（按推荐顺序）：
- VirtIO-GPU（推荐，需要安装 VirtIO 驱动）
- SPICE (qxl)
- VMware compatible
- std VGA

> 如果使用 VirtIO-GPU，可以设置显存大小（建议 16MB 或更高）

### 特殊情况: 如果没有带黄色感叹号的"显示适配器"或"其他设备":

#### 1. 检查当前显示适配器

打开设备管理器,展开"显示适配器",看到的是什么设备?

- 如果是 "Microsoft Basic Display Adapter" - 说明缺少正确的驱动
- 如果是 "Red Hat QXL" 或 "VirtIO GPU" - 驱动已安装

#### 2. 手动安装 VirtIO 显示驱动
即使没有黄色感叹号,也可以手动安装:

- 挂载 virtio-win.iso 到 Windows 11
- 打开文件资源管理器,进入 CD 驱动器
- 找到路径: viogpudo\w11\amd64\
- 右键点击 viogpudo.inf → 安装
- 重启 Windows

#### 3. 在 PVE 中更改显示配置
在 Proxmox 界面操作:

- 关闭 Windows 11 虚拟机
- 选择 VM → Hardware → Display
- 点击 Edit
- 尝试更改为:
        - VirtIO-GPU (推荐)
        - VMware compatible (兼容性好)
- 启动虚拟机
