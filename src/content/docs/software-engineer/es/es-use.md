---
title: 正确的使用ES
description: 正确的使用ES
template: doc
lastUpdated: 2024-11-04 00:36:40
---

我遇见过的使用ES大部分的姿势是【数据】+【条件】揉在一起。其实这样做有这样做的好处，即不用回表。

正确的使用姿势是 【主数据唯一标识字段】+【条件】，主数据通过回表获取。


### 索引迁移
```bash
curl -X POST "localhost:9200/_reindex" \
-u username:password \
-H 'Content-Type: application/json' \
-d '{
  "source": {
    "index": "source_index"
  },
  "dest": {
    "index": "target_index"
  }
}'
```