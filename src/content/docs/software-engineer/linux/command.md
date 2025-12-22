---
title: Linux命令
description: Linux命令
template: doc
draft: false
lastUpdated: 2025-12-13 16:10:07
---

:::note
自己平时为了解决一些问题,花了时间和精力特地去网上查找的会在这里记录,以期望后续节省时间
:::

#### 希望把所有权改成当前用户
```sh
sudo chown -R $(whoami) /path/to/dir
```

#### 权限处理

```sh title="将指定目录的rwx权限赋值给当前用户"
chmod u=rwx /path/to/directory
```

#### Crontab
```sh
*/1 * * * * /home/moatkon/demo_bash.sh >> /home/moatkon/demo_bash.log 2>&1
```