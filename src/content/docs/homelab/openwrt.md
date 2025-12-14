---
title: OpenWrt
description: OpenWrt
template: doc
lastUpdated: 2025-12-14 22:55:15
draft: true
sidebar:
  order: 6
---

官网: https://openwrt.org/

https://openclash.org/#google_vignette

选择最新的下载:
https://downloads.openwrt.org/releases/24.10.4/targets/x86/64/openwrt-24.10.4-x86-64-generic-ext4-combined-efi.img.gz

#### 在PVE中创建虚拟机
创建虚拟机，选择不使用任何介质，需要移除磁盘,创建好之后不要重启


#### 创建硬盘并写入openWrt镜像

```sh
# 102 为vm-id
qm disk import 102 /var/lib/vz/template/iso/openwrt-24.10.4-x86-64-generic-ext4-combined-efi.img local-lvm --format raw
```

将硬盘给虚拟机并修改引导顺序，让硬盘优先

#### 安装中文语言
https://pkgs.org/download/luci-i18n-base-zh-cn


#### 安装主题
https://github.com/jerrykuku/luci-theme-argon/blob/master/README_ZH.md

#### 安装OpenClash
https://openclash.org
https://github.com/vernesong/OpenClash

```sh
# 更新
opkg update
# 安装依赖
opkg install bash iptables dnsmasq-full curl ca-bundle ipset ip-full iptables-mod-tproxy iptables-mod-extra ruby ruby-yaml kmod-tun kmod-inet-diag unzip luci-compat luci luci-base

opkg install /tmp/openclash.ipk
```

如果有以下报错:
```sh 
Installing luci-app-openclash (0.47.028) to root...
Installing dnsmasq-full (2.90-r4) to root...
Downloading https://downloads.openwrt.org/releases/24.10.4/packages/x86_64/base/dnsmasq-full_2.90-r4_x86_64.ipk
Collected errors:
* check_data_file_clashes: Package dnsmasq-full wants to install file /etc/hotplug.d/ntp/25-dnsmasqsec
    But that file is already provided by package  * dnsmasq
* check_data_file_clashes: Package dnsmasq-full wants to install file /etc/init.d/dnsmasq
    But that file is already provided by package  * dnsmasq
* check_data_file_clashes: Package dnsmasq-full wants to install file /usr/lib/dnsmasq/dhcp-script.sh
    But that file is already provided by package  * dnsmasq
* check_data_file_clashes: Package dnsmasq-full wants to install file /usr/sbin/dnsmasq
    But that file is already provided by package  * dnsmasq
* check_data_file_clashes: Package dnsmasq-full wants to install file /usr/share/acl.d/dnsmasq_acl.json
    But that file is already provided by package  * dnsmasq
* check_data_file_clashes: Package dnsmasq-full wants to install file /usr/share/dnsmasq/dhcpbogushostname.conf
    But that file is already provided by package  * dnsmasq
* check_data_file_clashes: Package dnsmasq-full wants to install file /usr/share/dnsmasq/rfc6761.conf
    But that file is already provided by package  * dnsmasq
* opkg_install_cmd: Cannot install package luci-app-openclash.
```

解决方法:
```sh
# 先移除 dnsmasq,立即安装 dnsmasq-full(推荐)
opkg remove dnsmasq && opkg install dnsmasq-full

# 安装完之后,再执行
opkg install /tmp/openclash.ipk
```


#### 安装clash内核
- 可以在openwrt内核中使用可视化界面安装(推荐，失败了多试几次)
- 也可以上传https://github.com/MetaCubeX/mihomo/releases clash内核。如果不使用命令行上传，可以借用openwrt上传pkg的按钮来，上传后使用shell将内核copy到clash目录即可，并修改一个名字即可。
