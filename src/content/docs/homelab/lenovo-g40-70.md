---
title: "Lenovo G40-70"
description: ""
template: doc
lastUpdated: 2026-01-11 14:31:34
draft: false
sidebar:
  order: 2.2
  badge:
    text: "2015年产品"
    variant: danger
---

因家庭原因把ThinkStation P3 Tiny Gen2退了(实际上我不想退)后,发现自己已经陷入HomeLab了,就把我人生的第一台笔记本电脑搬出来了，装了PVE。 我的折腾之路,怎么这么坎坷。


#### Lenovo G40-70
![](/homelab/lenovo-g40-70.jpg)
![](/homelab/lenovo-g40-70-lid.jpg)


#### Lenovo G40-70 配置
> 自己升级过内存(12GB)和硬盘(SSD)

```sh title="lscpu"
# 简化信息

Architecture:                x86_64
  CPU op-mode(s):            32-bit, 64-bit
CPU(s):                      4
  On-line CPU(s) list:       0-3
Vendor ID:                   GenuineIntel
  Model name:                Intel(R) Core(TM) i5-4258U CPU @ 2.40GHz
```

```sh title="free -h"
               total        used        free      shared  buff/cache   available
Mem:            11Gi       1.8Gi       9.7Gi        32Mi       346Mi       9.8Gi
Swap:          7.6Gi          0B       7.6Gi
```


```sh title="fdisk -l"
# 简化信息

Disk /dev/sda: 232.89 GiB, 250059350016 bytes, 488397168 sectors
Disk model: Samsung SSD 850 

Device       Start       End   Sectors   Size Type
/dev/sda1       34      2047      2014  1007K BIOS boot
/dev/sda2     2048   2099199   2097152     1G EFI System
/dev/sda3  2099200 488397134 486297935 231.9G Linux LVM
```
