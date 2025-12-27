---
title: 命令行
description: 命令行
template: doc
lastUpdated: 2025-12-27 20:53:24
sidebar:
  order: 9
---

### 备份与恢复
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


### 
清除本地连接的ssh指纹:
```
ssh-keygen -R 192.168.3.101
```
