---
title: Kafka
description: Kafka
template: doc
lastUpdated: 2024-05-19 00:27:14
---
- **主题(Topic)**: 主题是消息的逻辑容器，用于将消息进行分组。每个主题可以有一个或多个分区(Partitions)。
- **分区(Partition)**: 分区是主题的物理存储单元，每个分区都是一个有序的消息日志。消息在分区内按照添加顺序进行存储，并且每个消息都有一个唯一的偏移量(Offset)来标识其在分区内的位置。分区可以分布在不同的服务器上，以实现水平扩展和负载均衡。
  > Kafka 中 Partition(分区)是真正保存消息的地方，我们发送的消息都被放在了这里。而我们的 Partition(分区) 又存在于 Topic(主题) 这个概念中，并且我们可以给特定 Topic 指定多个 Partition
- **偏移量(Offset)**: 偏移量是消息在分区内的唯一标识符，用于确定消息在分区内的位置。消费者可以通过指定偏移量来读取分区内的消息。
- **复制(Replication)**: Kafka支持分区的复制，每个分区可以有多个副本(Replica)。这些副本可以分布在不同的服务器上，以提供冗余和高可用性。
- **日志文件(LogSegment)**: 每个分区内的消息都被存储在一个或多个日志文件中，每个日志文件称为日志段。当一个日志段达到一定大小或时间限制时，Kafka会创建一个新的日志段。这些日志段组成了-分区的持久化消息存储。
- **索引文件(IndexFile)**: 为了支持快速查找消息，Kafka还维护了索引文件，用于存储消息偏移量和物理偏移量之间的映射关系。
- **日志段刷写和清理(LogSegmentFlushAndCompaction)**: Kafka定期将消息写入磁盘，并在需要时清理过期的日志段，以释放磁盘空间。


### Kafka怎么做到基于磁盘却比内存还快？
1. 顺序写入
    > Kafka的写入模型非常简单，它通过**追加方式**将消息写入磁盘，这导致了顺序写入(Sequential Writes)。顺序写入比随机写入(Random Writes)更加高效，因为磁盘通常能够更快地处理顺序写入操作
   
1. 消息压缩
2. 分批发送
3. 零拷贝 —— 解放CPU


#### 零拷贝
<span style="color:red">主要是通过splice的方式实现两个普通文件的数据零拷贝。**splice 系统调用可以在内核缓冲区和 socket 缓冲区之间建立管道来传输数据**，避免了两者之间的 CPU 拷贝操作</span>
> splice 系统调用是 Linux 在 2.6 版本引入的
<!-- 零拷贝(Zero-Copy)是一种 I/O 操作优化技术，**可以快速高效地将数据从文件系统移动到网络接口**，而不需要将其从内核空间复制到用户空间。

Kafka使用零拷贝(Zero Copy)技术，这意味着数据可以在不涉及额外数据复制的情况下从内存传输到磁盘。这**降低了CPU和内存的使用**，并提高了写入性能

所谓的零拷贝,都是为了减少CPU copy和减少上下文的切换 -->

> 参考: [零拷贝原理](https://juejin.cn/post/6995519558475841550) 、[彻底搞懂零拷贝（Zero-Copy）技术](https://juejin.cn/post/7083793623594041375)

> DMA: 直接内存访问（Direct Memory Access），是一种硬件设备绕开CPU,独立直接访问内存的机制。所以 DMA 在一定程度上解放了 CPU，把之前 CPU 的杂活让硬件直接自己做了，提高了 CPU 效率。
### Kafka消息确认机制
##### 生产者确认机制
消息从生产者客户端发送至broker服务端topic，需要ack确认。`acks`与`min.insync.replicas`是两个配置参数.其中`acks`是producer的配置参数，`min.insync.replicas`是Broker端的配置参数，这两个参数对于生产者不丢失数据起到了很大的作用


###### No Reply(acks = 0)
生产者不等待来自broker的任何确认,直接返回成功。这是最快的方式,但消息可靠性最低。

```java
ProducerConfig config = new ProducerConfig(props);
config.setAcks(0);
Producer<String, String> producer = new KafkaProducer<>(config);
```

###### Leader Only(acks = 1)<span style="color:red">(默认)</span>
生产者仅等待leader分区已经接收成功后返回。不等待其他副本也接受成功。这提供了更高的吞吐量和较低的延迟。
```java
config.setAcks(1); 
```

###### All ISR(同步副本)(acks = -1)
生产者等待所有在ISR列表中的节点接受成功后才返回。这提供了最高的可靠性。
```
config.setAcks(-1);
```

##### 消费者确认机制
在Kafka中，**消费者确认是通过消费者位移的提交实现的**。类似RabbitMQ的ACK机制。

每个 consumer 实例都会为它消费的分区维护属于自己的位置信息来记录当前消费了多少条消息。这在 Kafka 中有一个特有的术语：位移(offset)。

默认情况下，consumer是自动提交位移的，自动提交间隔是5秒。这就是说若不做特定的设置，consumer程序在后台自动提交位移。通过设置`auto.commit.interval.ms`参数可以控制自动提交的间隔。

手动位移提交就是用户自行确定消息何时被真正处理完并可以提交位移。在一个典型的 consumer 应用场景中，用户需要对 poll 方法返回的消息集合中的消息执行业务级的处理。用户想要确保只有消息被真正处理完成后再提交位移。如果使用自动位移提交则无法保证这种时序性，因此在这种情况下必须使用手动提交位移。设置使用手动提交位移非常简单，仅仅需要在构建 KafkaConsumer 时设置`enable.auto.commit=false`，然后调用 `commitSync`或`commitAsync`方法即可。
- commitSync 异步确认机制
- commitAsync 同步确认机制

### Kafka 的多副本机制了解吗？带来了什么好处？
副本机制就是备份机制，指的是**在分布式集群机器中保存着相同的数据备份**。
![](/software-engineer/kafka/kafka_multi_replica.webp)

副本机制的好处:

- **提供数据冗余**
- 提供高伸缩性
- 改善数据局部性


1. Kafka 为分区(Partition)引入了多副本(Replica)机制。分区(Partition)中的多个副本之间会有一个叫做 leader 的家伙，其他副本称为 follower。我们发送的消息会被发送到 leader 副本，然后 follower 副本才能从 leader 副本中**拉取消息**进行同步。
2. Kafka 通过给特定 Topic 指定多个 Partition, 而各个 Partition 可以分布在不同的 Broker 上, 这样便能提供比较好的并发能力(负载均衡)。
3. Partition 可以指定对应的 Replica 数, 这也极大地提高了消息存储的安全性, 提高了容灾能力，不过也相应的增加了所需要的存储空间。

配置 `acks = all` 代表则所有副本都要接收到该消息之后该消息才算真正成功被发送

我们不能默认在调用send方法发送消息之后消息消息发送成功了。为了确定消息是发送成功，我们要判断消息发送的结果。但是要注意的是  Kafka 生产者(Producer) 使用  send 方法发送消息实际上是异步的操作，我们可以通过 get()方法获取调用结果

### Kafka是如何保证副本当中的数据都是一致的呢？
**领导者副本机制**
![](/software-engineer/kafka/leader_replica.webp)

在kafka中，副本分成两类：领导者副本和追随者副本。

每个分区在创建时都要选举一个副本，成为领导者副本，其余的副本自动称为追随者副本。

kafka中，追随者副本是不会对外提供服务的，所有的请求都必须由领导者副本来处理。<small>**(这也是kafka没能提供读操作横向扩展的根本原因，而且它也不像mysql副本一样有”抗读“的作用，帮助领导者减轻压力)**</small> 它唯一的任务就是从领导者副本异步拉去消息，并写入到自己提交日志中，从而实现与领导者副本的同步。

当领导者副本挂掉了，或者说所在Broker宕机了，kafka可以通过Zookeeper提供的监控功能能够实时感知到，并开启新一轮领导者选举，从追随者副本中选一个作为新的领导者。老Leader副本重启回来后，只能作为追随者副本加入到集群中。


**那么这种副本机制设计究竟有什么好处呢？**
1. **方便实现“Read-your-writes”**。顾名思义，就是当你使用生产者api向kafka成功写入消息后，就马上使用消费者api去读取刚才的消息。
   
   如果追随者副本对外提供服务的话，由于副本同步是异步的，因此有可能发生追随者副本还没有及时从领导者副本中拉取最新消息，从而使客户端看不到最新的消息。

2. **方便实现单调读**。单调读就是消费者在多次读消息时候，不会看到一条消息一会儿存在一会儿不存在。

   如果允许追随者副本提供读服务，那么假设当前有两个追随者副本F1,F2。生产者往领导者中发送了消息后，F1，F2开始异步拉取消息。若F1拉取成功了，而F2还未拉取成功。此时消费者第一次消费F1副本获取最新消息，第二次消费的时候消费到了F2副本。就获取不到该条消息了。这就不是单调读一致性。所以都由Leader副本来处理请求的话，就能实现单调读。

### 追随者副本到底在什么条件之下才算与Leader同步?

追随者副本不对外提供服务，只是定期的异步拉取消息。既然是异步的，那么就存在着不可能与Leader实时同步的风险。

基于此，kafka引入了**In-sync Replicas(ISR)同步副本**集合(集合代表多个副本,包含追随者副本和领导者副本)，即它实际上不是依靠与消息条数来进行判断的。而是根据Broker端参数`replica.lag.time.max.ms`参数值来的,这个参数的含义是Follower副本能够落后Leader副本的最长时间间隔，当前默认值是10秒。

这就是说，只要一个 Follower 副本落后 Leader 副本的时间不超过10秒，那么 Kafka 就认为该 Follower 副本与 Leader 是同步的，即使此时 Follower 副本中保存的消息明显少于 Leader 副本中的消息。若是同步过程的速度持续慢于Leadr副本的写入速度，那么在`replica.lag.time.max.ms`时间后，kafka就会自动收缩ISR集合，将该副本踢出集合。

若该副本后面慢慢追上了Leader的进度。那么它是可以被重新放入ISR集合中的。这也表明ISR是一个动态调整的集合，而非静态不变的。

> 单词: lag 落后 、In-sync Replicas  同步副本

**Unclean 领导者选举**

既然ISR可以动态调整，那么就会出现ISR为空的情况。ISR为空的情况就代表Leader副本也挂掉了(落后太多,不是宕机)。那么kafka就需要重新选举新的Leader。

kafka把所有不在ISR的存活副本都称之为非同步副本。

- 通常来说，非同步副本落后Leader太多，因此，如果选择这些副本为新的Leader，就可能出现数据的丢失。在kafka，选举Leader这种过程被成为Unclean。由Broker端参数`unclean.leader.election.enable`控制是否允许Unclean领导者选举。
- **开启 Unclean 领导者选举**可能会造成数据丢失，但**好处是**，它使得分区 Leader 副本一直存在，**不至于停止对外提供服务，因此提升了高可用性**。反之，禁止 Unclean 领导者选举的好处在于维护了数据的一致性，避免了消息丢失，但牺牲了高可用性。

> 一般不建议开启Unclean 领导者选举,因为如果为了这点高可用性的改善，牺牲了数据一致性，是很严重的


<!-- https://segmentfault.com/a/1190000022814735 -->

### 基于Zookeeper搭建Kafka高可用集群
##### Zookeeper集群搭建
为保证集群高可用，Zookeeper 集群的节点数最好是奇数，最少有三个节点，所以这里搭建一个三个节点的集群。

拷贝配置样本 zoo_sample.cfg  为 zoo.cfg 并进行修改内容,核心是
```sh
# server.1 这个1是服务器的标识，可以是任意有效数字，标识这是第几个服务器节点，这个标识要写到dataDir目录下面myid文件里
# 指名集群间通讯端口和选举端口
server.1=127.0.0.1:2287:3387
server.2=127.0.0.1:2288:3388
server.3=127.0.0.1:2289:3389
```
分别在三个节点的数据存储目录下新建 myid 文件,并写入对应的节点标识,类似:
```sh
#server1
echo "1" > /usr/local/zookeeper-cluster/data/01/myid
#server2
echo "2" > /usr/local/zookeeper-cluster/data/02/myid
#server3
echo "3" > /usr/local/zookeeper-cluster/data/03/myid
```

zk集群验证: `zkServer.sh status`

##### Kafka集群搭建
下载并按照3个节点的kafka

3个kafka节点的配置文件主要是:
```sh
# The id of the broker. 集群中每个节点的唯一标识
broker.id=0 // 另外2个就是broker.id=1、broker.id=2
# 监听地址
listeners=PLAINTEXT://hadoop001:9092 // 另外2个就是9093、9094
# 数据的存储位置
log.dirs=/usr/local/kafka-logs/00 // 另外2个就是01,02
# Zookeeper连接地址
zookeeper.connect=hadoop001:2181,hadoop001:2182,hadoop001:2183
```

顺序启动即可,创建一个主题,然后可以验证下集群:
```sh
bin/kafka-topics.sh --create --bootstrap-server hadoop001:9092 \
					--replication-factor 3 \
					--partitions 1 --topic my-replicated-topic
```
验证:
```sh
bin/kafka-topics.sh --describe --bootstrap-server hadoop001:9092 --topic my-replicated-topic
```
会输出刚创建的主题信息,里面就包含领导者，同步副本等信息。里面的标识是broke.id的值

### 我之前做过广告流量系统,为什么选用Kafka而没有选择RabbitMQ
- 直接原因是大数据的架构设计只支持Kafka
- 另一个原因是,业务时间要求,要求在20分钟内更新一次广告效果数据,即要求快。而Kafka的一些特性恰好可以满足[→](#kafka怎么做到基于磁盘却比内存还快)