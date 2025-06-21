---
title: 数据迁移最佳实践
description: 数据迁移最佳实践
template: doc
tableOfContents: false
lastUpdated: 2025-03-16 12:02:47
banner:
  content: 编写中
---

![](/software-engineer/best-practices/migration/migration.svg)

最近，在忙数据迁移的事情。在数据迁移的过程中，有一些最佳实践。分享一下
1. 一定要基于游标去刷数,在游标的基础下可以过滤条件
2. 游标的获取在数据量比较小的时候可以实时获取,如果数据量比较大,建议在执行脚本前初始化好
3. 刷数过程中,监控资源使用情况。注意告警


刷数逻辑可以基于[flash-data](/software-engineer/best-practices/general-ability/flash-data)来说实现


