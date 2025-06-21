---
title: Kafka安装及使用
description: Kafka安装及使用
template: doc
lastUpdated: 2024-10-13 21:36:13
---

#### 使用Docker安装kafka
```yml title="docker-compose.yml"
version: '3.5'
services:
  zookeeper:
    image: wurstmeister/zookeeper   ## 镜像
    container_name: zookeeper
    ports:
      - "2181:2181"                 ## 对外暴露的端口号
  kafka:
    image: wurstmeister/kafka       ## 镜像
    container_name: kafka
    volumes: 
        - /etc/localtime:/etc/localtime ## 挂载位置（kafka镜像和宿主机器之间时间保持一直）
    ports:
      - "9092:9092"
    environment:
      KAFKA_ADVERTISED_HOST_NAME: 192.168.3.21         ## 修改:宿主机IP
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181       ## kafka运行是基于zookeeper的
      KAFKA_ADVERTISED_PORT: 9092
      KAFKA_LOG_RETENTION_HOURS: 120
      KAFKA_MESSAGE_MAX_BYTES: 10000000
      KAFKA_REPLICA_FETCH_MAX_BYTES: 10000000
      KAFKA_GROUP_MAX_SESSION_TIMEOUT_MS: 60000
      KAFKA_NUM_PARTITIONS: 3
      KAFKA_DELETE_RETENTION_MS: 1000
  kafka-manager:
    image: sheepkiller/kafka-manager                ## 镜像：开源的web管理kafka集群的界面
    container_name: kafka-manager
    environment:
        ZK_HOSTS: 192.168.3.21                        ## 修改:宿主机IP
    ports:  
      - "9009:9000"                                 ## 暴露端口9000这个端口冲突太多
```


#### 启动
```
docker-compose up -d --build
```

#### 访问 kafka-manager
http://localhost:9009


#### kafka-mangager 如果觉得不好用可以使用
```sh
docker run -p 8080:8080 -e KAFKA_BROKERS=192.168.3.21:9092 docker.redpanda.com/redpandadata/console:latest
```


#### 使用
##### 创建一个名称为 moatkon 的 topic
```sh
kafka-topics.sh --create --topic moatkon \
--zookeeper zookeeper:2181 --replication-factor 1 \
--partitions 3
```

##### 查看刚刚创建的 topic 信息
```sh
kafka-topics.sh --zookeeper zookeeper:2181 --describe --topic moatkon
```


##### 打开生产者发送消息
```sh
kafka-console-producer.sh --topic=netsurfingzone-topic-1 --broker-list kafka:9092
```

##### 消费者接收消息
```sh
kafka-console-consumer.sh \
--bootstrap-server kafka:9092 \
--from-beginning --topic moatkon
```

### Java程序
```java title="发送到指定分区"


  /**
  * p: 指定分区
  * d: 消息
  */
  @GetMapping("/message/{p}/{d}")
  public String sendMessage(@PathVariable("p")Integer p,@PathVariable("d")String d) {

    try {
      kafkaTemplate.send(ApplicationConstant.TOPIC_NAME, p, UUID.randomUUID().toString(),d);

    } catch (Exception e) {
      e.printStackTrace();
      return e.getMessage();
    }
    return "message send succuessfully";
  }


```


```java title="监听指定分区"

    // 监听全部
//  @KafkaListener(groupId = ApplicationConstant.GROUP_ID_JSON, topics = ApplicationConstant.TOPIC_NAME, containerFactory = ApplicationConstant.KAFKA_LISTENER_CONTAINER_FACTORY)
//  public void receivedMessage(String message)  {
//    logger.info("message received using Kafka listener:" + message);
//  }

    @KafkaListener(groupId = ApplicationConstant.GROUP_ID_JSON, containerFactory = ApplicationConstant.KAFKA_LISTENER_CONTAINER_FACTORY, topicPartitions = {@TopicPartition(topic = ApplicationConstant.TOPIC_NAME, partitions = {"0"})})
    public void partition0(String message) {
        logger.info("message received using Kafka listener p0: " + message);
    }


    @KafkaListener(groupId = ApplicationConstant.GROUP_ID_JSON, containerFactory = ApplicationConstant.KAFKA_LISTENER_CONTAINER_FACTORY, topicPartitions = {@TopicPartition(topic = ApplicationConstant.TOPIC_NAME, partitions = {"1"})})
    public void partition1(String message) {
        logger.info("message received using Kafka listener p1: " + message);
    }
```





