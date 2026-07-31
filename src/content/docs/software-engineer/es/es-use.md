---
title: 正确的使用ES
description: 正确的使用ES
template: doc
lastUpdated: 2026-07-31 10:55:38
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

### 调整ES窗口大小
```sh 
PUT /索引名/_settings
{
  "index": {
    "max_result_window": 500000
  }
}
```

### 索引添加字段
```
PUT /索引名/_mapping
{
    "properties": {
        "moatkonField": {
            "type": "keyword"
        }
    }
}
```

`"type": "keyword"` 是字段类型,按照实际场景来
