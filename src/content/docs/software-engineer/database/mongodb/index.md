---
title: MongoDB
description: MongoDB
template: doc
draft: false
lastUpdated: 2025-04-02 23:17:00
---

### 背景
公司有慢SQL,筛选出来后发现是MongoDB的。因为之前从来没有接触过MongoDB,所以正好可以趁着这次机会来学习下MongoDB

### 安装MongoDB
我这边使用docker来安装
[官网教程](https://www.mongodb.com/compatibility/docker)


```sh
docker run --name mongodb -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=123456 mongodb/mongodb-community-server:6.0-ubi8
```

### MongoDB 官方GUI工具
https://www.mongodb.com/products/tools/compass



### 使用MongoDB
[快速入门教程](https://www.runoob.com/mongodb/mongodb-create-database.html)

```sh title="MongoDB初见"
# 创建数据库
# 当你使用 use 命令来指定一个数据库时，如果该数据库不存在，MongoDB将自动创建它。
# 如果此时执行show dbs 看不到数据库,需要添加数据才能看到
use db_moatkon

# 创建集合,集合类似于关系数据库中的表
db.createCollection("moatkon_collection") # 此时执行show dbs就能看到了
> 注意: 在 MongoDB 中，集合只有在内容插入后才会创建，就是说，创建集合(数据表)后要再插入一个文档(记录)，集合才会真正创建。


# 查看当前数据库
db

# 删除数据库
use db_moatkon
db.dropDatabase()

# 删除集合
db.moatkon_collection.drop()

# 展示集合
show collections # 或者 show tables

# 在 MongoDB 中，你不需要手动创建集合，当你插入文档时，MongoDB会自动创建集合。
db.moatkon_auto_createCollection.insertOne({"url" : "moatkon.com"})
```

```sh title="创建索引,根据TTL过期; 索引关键字段必须是 Date 类型"
db.moatkon_auto_createCollection.insertOne({"url" : "moatkon.com","createTime":new Date()})

db.moatkon_auto_createCollection.createIndex(
  { "createTime": 1 }, 
  { expireAfterSeconds: 10 } ); // 这里演示的是10s过期
```
> https://www.runoob.com/mongodb/mongodb-indexing.html
