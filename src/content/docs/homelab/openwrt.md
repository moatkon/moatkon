---
title: OpenWrt
description: OpenWrt
template: doc
lastUpdated: 2025-12-14 17:53:15
draft: true
sidebar:
  order: 6
---

官网: https://openwrt.org/

https://openclash.org/#google_vignette

选择最新的下载:
https://downloads.openwrt.org/releases/24.10.4/targets/x86/64/openwrt-24.10.4-x86-64-generic-ext4-combined-efi.img.gz

创建虚拟机，选择不使用任何介质，需要移除磁盘,创建好之后不要重启



### 在pve的shell中导入openwrt镜像
102 为vm-id
qm disk import 102 /var/lib/vz/template/iso/openwrt-24.10.4-x86-64-generic-ext4-combined-efi.img local-lvm --format raw

### 安装中文语言
https://pkgs.org/download/luci-i18n-base-zh-cn


### 安装主题
https://github.com/jerrykuku/luci-theme-argon/blob/master/README_ZH.md

### OpenClash
https://openclash.org
https://github.com/vernesong/OpenClash

luci-app-openclash
