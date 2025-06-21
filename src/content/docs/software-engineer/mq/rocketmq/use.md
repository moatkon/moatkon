---
title: RocketMQ安装及使用
description: RocketMQ安装及使用
template: doc
lastUpdated: 2024-10-15 23:31:15
---
#### docker-compose.yml
```yml
version: '3.5'

services:
  rmqnamesrv:
    image: apache/rocketmq:4.9.6
    container_name: rmqnamesrv
    ports:
      - 9876:9876
    volumes:
      - ./rmqs/logs:/home/rocketmq/logs
      - ./rmqs/store:/home/rocketmq/store
    environment:
      JAVA_OPT_EXT: "-Duser.home=/home/rocketmq -Xms512M -Xmx512M -Xmn128m"
    command: ["sh","mqnamesrv"]
    networks:
        rmq:
          aliases:
            - rmqnamesrv
  rmqbroker:
    image: apache/rocketmq:4.9.6
    container_name: rmqbroker
    ports:
      - 10909:10909
      - 10911:10911
    volumes:
      - ./rmq/logs:/home/rocketmq/logs
      - ./rmq/store:/home/rocketmq/store
      - ./rmq/brokerconf/broker.conf:/etc/rocketmq/broker.conf
    environment:
        JAVA_OPT_EXT: "-Duser.home=/home/rocketmq -Xms512M -Xmx512M -Xmn128m -Drocketmq.broker.diskSpaceWarningLevelRatio=0.99"
    command: ["sh","mqbroker","-c","/etc/rocketmq/broker.conf","-n","rmqnamesrv:9876","autoCreateTopicEnable=true"]
    depends_on:
      - rmqnamesrv
    networks:
      rmq:
        aliases:
          - rmqbroker

  rmqconsole:
    image: apacherocketmq/rocketmq-dashboard
    container_name: rmqconsole
    ports:
      - 8180:8080
    environment:
        JAVA_OPTS: "-Drocketmq.namesrv.addr=rmqnamesrv:9876 -Xms128M -Xmx128M -Xmn128m  -Dcom.rocketmq.sendMessageWithVIPChannel=false"
    depends_on:
      - rmqnamesrv
    networks:
      rmq:
        aliases:
          - rmqconsole

networks:
  rmq:
    name: rmq
    driver: bridge
```


#### 新建文件夹
```sh
#!/usr/bin/env bash

# 创建目录
mkdir -p ./rmqs/logs
mkdir -p ./rmqs/store
mkdir -p ./rmq/logs
mkdir -p ./rmq/store

# 设置目录权限
chmod -R 777 ./rmqs/logs
chmod -R 777 ./rmqs/store
chmod -R 777 ./rmq/logs
chmod -R 777 ./rmq/store
```

#### ./rmq/brokerconf/broker.conf

```sh
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.


#所属集群名字
brokerClusterName=DefaultCluster

#broker名字，注意此处不同的配置文件填写的不一样，如果在broker-a.properties使用:broker-a,
#在broker-b.properties使用:broker-b
brokerName=broker-a

#0 表示Master，>0 表示Slave
brokerId=0

#nameServer地址，分号分割
#namesrvAddr=rocketmq-nameserver1:9876;rocketmq-nameserver2:9876
namesrvAddr=rmqnamesrv:9876

#启动IP,如果 docker 报 com.alibaba.rocketmq.remoting.exception.RemotingConnectException: connect to <192.168.0.120:10909> failed
# 解决方式1 加上一句producer.setVipChannelEnabled(false);，解决方式2 brokerIP1 设置宿主机IP，不要使用docker 内部IP
brokerIP1=192.168.3.21

#在发送消息时，自动创建服务器不存在的topic，默认创建的队列数
defaultTopicQueueNums=4

#是否允许 Broker 自动创建Topic，建议线下开启，线上关闭 ！！！这里仔细看是false，false，false
#原因下篇博客见~ 哈哈哈哈
autoCreateTopicEnable=true

#是否允许 Broker 自动创建订阅组，建议线下开启，线上关闭
autoCreateSubscriptionGroup=true

#Broker 对外服务的监听端口
listenPort=10911

#删除文件时间点，默认凌晨4点
deleteWhen=04

#文件保留时间，默认48小时
fileReservedTime=120

#commitLog每个文件的大小默认1G
mapedFileSizeCommitLog=1073741824

#ConsumeQueue每个文件默认存30W条，根据业务情况调整
mapedFileSizeConsumeQueue=300

#destroyMapedFileIntervalForcibly=120000
#redeleteHangedFileInterval=120000
#检测物理文件磁盘空间
diskMaxUsedSpaceRatio=99
#存储路径
#storePathRootDir=/home/ztztdata/rocketmq-all-4.1.0-incubating/store
#commitLog 存储路径
#storePathCommitLog=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/commitlog
#消费队列存储
#storePathConsumeQueue=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/consumequeue
#消息索引存储路径
#storePathIndex=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/index
#checkpoint 文件存储路径
#storeCheckpoint=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/checkpoint
#abort 文件存储路径
#abortFile=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/abort
#限制的消息大小
maxMessageSize=65536

#flushCommitLogLeastPages=4
#flushConsumeQueueLeastPages=2
#flushCommitLogThoroughInterval=10000
#flushConsumeQueueThoroughInterval=60000

#Broker 的角色
#- ASYNC_MASTER 异步复制Master
#- SYNC_MASTER 同步双写Master
#- SLAVE
brokerRole=ASYNC_MASTER

#刷盘方式
#- ASYNC_FLUSH 异步刷盘
#- SYNC_FLUSH 同步刷盘
flushDiskType=ASYNC_FLUSH

#发消息线程池数量
#sendMessageThreadPoolNums=128
#拉消息线程池数量
#pullMessageThreadPoolNums=128
```



#### 下载并启动容器，且为 后台 自动启动
```sh
docker-compose up -d
```


#### 清除已创建的docker
```sh
docker-compose down
```

#### 删除产生的日志及临时文件
```sh
rm -rf ./rmqs/logs/*
rm -rf  ./rmqs/store/*
rm -rf  ./rmq/logs/*
rm -rf  ./rmq/store/*
```







