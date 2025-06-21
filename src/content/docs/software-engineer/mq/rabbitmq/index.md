---
title: RabbitMQ
description: RabbitMQ
template: doc
lastUpdated: 2023-12-25 11:26:46
---
**Channel(信道)**: 多路复用连接中的一条独立的双向数据流通道。**信道是建立在真实的TCP连接内的虚拟连接，复用TCP连接的通道**。

**Producer(消息的生产者)**: 向消息队列发布消息的客户端应用程序。

**Consumer(消息的消费者)**: 从消息队列取得消息的客户端应用程序。

**Message(消息)**: 消息由消息头和消息体组成。消息体是不透明的，而消息头则由一系列的可选属性组成，这些属性包括routing-key(路由键)、priority(消息优先权)、delivery-mode(是否持久性存储)等。

**Routing Key(路由键)**: 消息头的一个属性，用于标记消息的路由规则，决定了交换机的转发路径。最大长度255 字节。

**Queue(消息队列)**: 存储消息的一种数据结构，用来保存消息，直到消息发送给消费者。它是消息的容器，也是消息的终点。一个消息可投入一个或多个队列。消息一直在队列里面，等待消费者连接到这个队列将消息取走。**需要注意，当多个消费者订阅同一个Queue，这时Queue中的消息会被平均分摊给多个消费者进行处理，而不是每个消费者都收到所有的消息并处理，每一条消息只能被一个订阅者接收**。

**Exchange(交换器|路由器)**: **提供Producer到Queue之间的匹配**，接收生产者发送的消息并将这些消息按照路由规则转发到消息队列。交换器用于转发消息，它不会存储消息 ，如果没有 Queue绑定到 Exchange 的话，它会直接丢弃掉 Producer 发送过来的消息。交换器有四种消息调度策略，分别是fanout, direct, topic, headers。

**Binding(绑定)**: 用于建立Exchange和Queue之间的关联。一个绑定就是基于Binding Key将Exchange和Queue连接起来的路由规则，所以可以将交换器理解成一个由Binding构成的路由表。

**Binding Key(绑定键)**: Exchange与Queue的绑定关系，用于匹配Routing Key。最大长度255 字节。

**Broker**：RabbitMQ Server，服务器实体。


### RabbitMQ工作机制
**生产者**、**消费者**、**代理**

生产者：消息的创建者，负责创建和推送数据到消息服务器；

消费者：消息的接收方，用于处理数据和确认消息；

代理：就是RabbitMQ本身，用于扮演“快递”的角色，本身不生产消息，只是扮演“快递”的角色。



### RabbitMQ消息发送原理
**AMQP信道即Channel**

应用程序和Rabbit Server之间会创建一个TCP连接，一旦TCP打开，并通过了认证(即用户名和密码)，应用程序和Rabbit就创建了一条AMQP信道(Channel)。

**信道(Channel)是创建在“真实”TCP上的虚拟连接**，AMQP命令都是通过信道发送出去的，每个信道都会有一个唯一的ID，不论是发布消息，订阅队列或者消费消息都是通过信道完成的。

###### 为什么不通过TCP直接发送命令？
因为对于操作系统来说创建和销毁TCP会话是非常昂贵的开销，假设高峰期每秒有成千上万条连接，每个连接都要创建一条TCP会话，这就造成了TCP连接的巨大浪费，而且操作系统每秒能创建的TCP也是有限的，因此很快就会遇到系统瓶颈。

使用一条TCP连接,再通过信道Channel处理消息，既满足了性能的需要，又能确保每个连接的私密性，这就是引入信道概念的原因。



### RabbitMQ的交货模式 DeliveryMode
1. delivery-mode = 1 表示**非持久化**
2. delivery-mode = 2 表示持久化

##### 非持久化
非持久化的消息在服务宕机的时候会丢失数据，但是由于不需要磁盘IO，尽可能地降低消息投递的延迟性，性能较高

##### 持久化
> Rabbit队列和交换器在默认情况下重启服务器会导致消息丢失。所以为了保证在重启时不丢失,就需要持久化

持久化的消息安全性较高，尽管服务宕机，数据也不会丢失，但是在投递消息的过程中需要发生磁盘IO，性能相对纯内存投递的方式低。**但是尽管是产生了磁盘IO，由于日志的记录方式是直接追加到消息日志文件的末尾，属于顺序IO，没有随机IO，所以性能还是可以接受的**。

**原理:**

所有队列中的消息都以append的方式写到一个文件中，当这个文件的大小超过指定的限制大小后，关闭这个文件再创建一个新的文件供消息的写入。文件名(*.rdq)从0开始然后依次累加。

当某个消息被删除时，并不立即从文件中删除相关信息，**而是做一些记录，当垃圾数据达到一定比例时，启动垃圾回收处理**，将逻辑相邻的文件中的数据合并到一个文件中。

### RabbitMQ的交换机
1. **Fanout 广播模式**

    Fanout交换器会把所有发送到该交换器的消息路由到所有与该交换器绑定的消息队列中。订阅模式与Binding Key和Routing Key无关，交换器将接受到的消息分发给有绑定关系的所有消息队列队列(不论Binding Key和Routing Key是什么)。类似于子网广播，子网内的每台主机都获得了一份复制的消息。Fanout交换机转发消息是最快的

2. **Direct 路由模式**

    Direct交换器需要消息的Routing Key与 Exchange和Queue 之间的Binding Key完全匹配，如果匹配成功，将消息分发到该Queue。
    
    只有当Routing Key和Binding Key完全匹配的时候，消息队列才可以获取消息。
    
    **Direct是Exchange的默认模式**。
    
    RabbitMQ默认提供了一个Exchange，名字是空字符串，类型是Direct，绑定到所有的Queue(每一个Queue和这个无名Exchange之间的Binding Key是Queue的名字)。这也是为什么有时候我们感觉不需要交换器也可以发送和接收消息，但是实际上是使用了RabbitMQ默认提供的Exchange。

5. **Topic 通配符模式**

    Topic交换器**按照正则表达式模糊匹配**：用消息的Routing Key与 Exchange和Queue 之间的Binding Key进行模糊匹配，如果匹配成功，将消息分发到该Queue。
    
    Routing Key是一个句点号“. ”分隔的字符串(我们将被句点号“. ”分隔开的每一段独立的字符串称为一个单词)。Binding Key与Routing Key一样也是句点号“. ”分隔的字符串。
    
    Binding Key中可以存在两种特殊字符“ * ”与“#”，用于做模糊匹配，其中“*”用于匹配一个单词，“#”用于匹配多个单词(也可以是零个或一个)。

6. **Headers**

    headers交换器允许你匹配AMQP消息的header而非路由键，除此之外headers交换器和direct交换器完全一致，但性能却很差，几乎用不到

### 高可用队列(HA)
在生产环境下，一般都不会允许RabbitMQ这种消息中间件单点，以免单点故障导致服务不可用，那么RabbitMQ同样可以集群部署来保证服务的可用性，在RabbitMQ集群中，我们可以定义HA队列，可以在web管理平台设置，也可以通过AMQP接口设置，**当我们定义某个HA队列的时候，会在集群的各个节点上都建立该队列，发布消息的时候，直接发送至master服务，当master服务受到消息后，把消息同步至各个从节点**，假如开启事务的情况下，是需要在消息被同步到各个节点之后才算完成事务，所以会带来一定的性能损耗

### RabbitMQ如何搭建高可用?
##### 普通集群模式
在普通集群模式下，集群中各个节点之间**只会相互同步元数据**，也就是说，消息数据不会被同步。那么问题就来了，假如我们连接到 A 节点，但是消息又存储在 B 节点又怎么办呢？

不论是生产者还是消费者，假如连接到的节点上没有存储队列数据，**那么内部会将其转发到存储队列数据的节点上进行存储**。虽然说内部可以实现转发，但是因为消息仅仅只是存储在一个节点，那么假如这节点挂了，消息是不是就没有了？这个问题确实存在，所以这种普通集群模式并没有达到高可用的目的。

##### 镜像队列模式
镜像队列模式下，节点之间不仅仅会同步元数据，消息内容也会在镜像节点间同步，可用性更高。这种方案提升了可用性的同时，因为同步数据之间也会带来网络开销从而在一定程度上会影响到性能。

##### 搭建方法
加入集群方法
```sh ins="join_cluster"
rabbitmqctl -n rabbit2 join_cluster --ram rabbit1@`hostname -s`
// --ram 表示这是一个内存节点
// --disc 表示磁盘节点（默认也是磁盘节点）
```
如果配置成镜像集群,可以:
```sh ins="set_policy ha-all"
rabbitmqctl -n rabbit1 set_policy ha-all "^" '{"ha-mode":"all"}'
```

##### 基于 HAProxy + Keepalived 高可用集群
假如一个 RabbitMQ 集群中，有多个内存节点，我们应该连接到哪一个节点呢？这个选择的策略如果放在客户端做，那么会有很大的弊端，最严重的的就是每次扩展集群都要修改客户端代码，所以这种方式并不是很可取，所以我们在部署集群的时候就需要一个中间代理组件，这个组件要能够实现服务监控和转发

在 RabbitMQ 集群中，通过 Keepalived 和 HAProxy 两个组件实现了集群的高可用性和负载均衡功能。

HAProxy 是一个开源的、高性能的负载均衡软件，同样可以作为负载均衡软件的还有 nginx，lvs 等。 HAproxy 支持 7 层负载均衡和 4 层负载均衡。

###### 高可用 HAProxy
HAProxy 虽然实现了负载均衡，但是假如只是部署一个 HAProxy，那么其本身也存在宕机的风险。一旦 HAProxy 宕机，那么就会导致整个集群不可用，所以我们也需要对 HAProxy 也实现集群，那么假如 HAProxy 也实现了集群，客户端应该连接哪一台服务呢？问题似乎又回到了起点，陷入了无限循环中...

为了实现 HAProxy 的高可用，需要再引入一个 Keepalived 组件，Keepalived 组件主要有以下特性:
1. 具有负载功能，可以监控集群中的节点状态，如果集群中某一个节点宕机，可以实现故障转移。
2. 其本身也可以实现集群，但是只能有一个 master 节点。
3. master 节点会对外提供一个**虚拟IP**，应用端只需要连接这一个 IP 就行了。可以理解为集群中的 HAProxy 节点会同时争抢这个虚拟 IP，哪个节点争抢到，就由哪个节点来提供服务。

> **VRRP 协议**即虚拟路由冗余协议（Virtual Router Redundancy Protocol）。Keepalived 中提供的虚拟 IP 机制就属于 VRRP，它是为了避免路由器出现单点故障的一种容错协议。

### RabbitMQ事务 - 保证消息不丢
对事务的支持是AMQP协议的一个重要特性。

假设当生产者将一个持久化消息发送给服务器时，因为consume命令本身没有任何Response返回，所以服务器崩溃，没有持久化该消息，生产者是无法获知该消息已经丢失的。

如果此时使用事务，即通过`txSelect()`开启一个事务，然后发送消息给服务器，然后通过`txCommit()`提交该事务，就可以解决上面的问题。

如果`txCommit()`提交了，则该消息一定会持久化，如果`txCommit()`还未提交,服务器就崩溃了，则该消息不会被服务器接收。当然Rabbit MQ也提供了`txRollback()`命令用于回滚某一个事务。

核心: 
- `txSelect()` 开启一个事务
- `txCommit()` 提交事务
- `txRollback()` 回滚事务

##### RabbitMQ事务的缺点
使用事务机制的话会降低RabbitMQ的性能，那么有没有更好的方法既能保障producer知道消息已经正确送到，又能基本上不带来性能上的损失呢？<span style="color:red">RabbitMQ提供了一个更好的方案，即将channel信道设置成confirm模式(即ack)</span>。

###### 小问题: 假设消费者模式中使用了事务，并且在消息确认之后进行了事务回滚,RabbitMQ会怎么处理消息?
1. 如果`autoAck=false`,即关闭了自动ack,由开发人员处理,那开发人员肯定是收到了消息的才能处理,所以此时回滚,消息是重新放回队列的
2. 如果`autoAck=true`,即自动确认,那么在消费者收到消息后就已经自动ack了,既然ack了,队列就会把消息删除,所以此时回滚是没啥用的

### RabbitMQ消息的可靠性如何保证?
1. Message durability(消息持久化)

    元数据、消息需要持久化到磁盘；

2. **生产者**消息确认机制
- 通过AMQP提供的**事务**机制实现(*上面有说RabbitMQ的事务*)
- 通过生产者消息确认机制(PublisherConfirm)实现

3. **消费者**消息确认机制 --- Confirm模式

    通过ACK。每个Message都要被acknowledged(确认，ACK)。我们可以显示的在程序中去ACK，也可以自动的ACK。如果有数据没有被ACK，那么RabbitMQ Server会把这个信息发送到下一个Consumer

4. 消费者自行定义失败重试机制,例如使用Spring的Retry功能，多次重试失败后将消息投递到异常交换机，交由人工处理

###### Confirm发送方确认模式
Confirm的三种实现方式：
- 方式一：`channel.waitForConfirms()` 普通发送方确认模式；

  ``` java ins="channel.confirmSelect()" ins="channel.waitForConfirms()"
  channel.confirmSelect();// 开启发送方确认模式
  String message = "Moatkon";
  channel.basicPublish("", queueName, null, message.getBytes("UTF-8"));
  if (channel.waitForConfirms()) {
    System.out.println("Moatkon消息发送成功" );
  }
  ```

- 方式二：`channel.waitForConfirmsOrDie()` 批量确认模式；
  ```java ins = "channel.waitForConfirmsOrDie()"
  channel.confirmSelect();// 开启发送方确认模式
  for (int i = 0; i < 10; i++) {
    String message = "Moatkon" + i;
    channel.basicPublish("", queueName, null, message.getBytes("UTF-8"));
  }
  channel.waitForConfirmsOrDie(); //直到所有信息都发布，只要有一个未确认就会IOException
  ```
- 方式三：`channel.addConfirmListener()`异步监听发送方确认模式；
  ```java ins="Nack" ins="Ack"
  channel.confirmSelect();// 开启发送方确认模式
  for (int i = 0; i < 10; i++) {
    String message = "Moatkon" + i;
    channel.basicPublish("", queueName, null, message.getBytes("UTF-8"));
  }
  //异步监听确认和未确认的消息
  channel.addConfirmListener(new ConfirmListener() {
    // nack == no ack,哈哈哈
    @Override
    public void handleNack(long deliveryTag, boolean multiple) throws IOException {
      // do something
    }

    @Override
    public void handleAck(long deliveryTag, boolean multiple) throws IOException {
      // do something
    }
  });
  ```
### Rabbit vhost
每个Rabbit都能创建很多vhost，我们称之为虚拟主机，每个虚拟主机其实都是mini版的RabbitMQ，拥有自己的队列，交换器和绑定，拥有自己的权限机制。

###### vhost的特性:
1. RabbitMQ默认的vhost是“/”开箱即用；
2. 多个vhost是隔离的，多个vhost无法通讯，并且不用担心命名冲突(队列和交换器和绑定)，实现了多层分离；
3. 创建用户的时候必须指定vhost；

### 什么样的消息会进入死信队列
死信交换机和死信队列其实都只是普通的交换机和队列，只不过接受、转发的信息是死信，其他操作并没有区别。

#### 死信的条件
- 消息被消费者拒绝（通过basic.reject 或者 back.nack），并且设置 requeue=false。
- 消息过期，因为<span style="color:red">队列</span>设置了TTL（Time To Live）时间。<span style="color:grey">—— 可以基于此做延时队列</span>
- 超过了队列的长度限制,消息被丢弃

#### 死信队列的消息处理
因为和普通的队列和交换机并无差别,启动一个任务重复消费即可。(要避免循环消息哈,所以在消费时要注意适当的处理)

### 延时队列
延时队列，顾名思义就是存放延时消息的队列，也就是说消费者在一定的延时后才会收到消息。典型的应用场景就是如上所述的订单超时未支付自动取消。

#### 使用死信队列实现延时队列
使用消息的TTL 属性，将过期的消息转发到死信队列中，业务监听死信队列的消息就行了。

但是这种实现会有消息阻塞的问题。比如按顺序发送msg1和msg2两条消息，msg1的过期时间为5s，msg2的过期时间为2s。正常理解下，结果肯定是msg2先到死信队列被消费，但是结果却是两条消息都在5s时转发到死信队列被消费。

这是可以借助RabbitMQ插件来实现

#### 延时队列插件
rabbitmq提供了一个插件 `rabbitmq_delayed_message_exchange` 让我们能够实现 延迟队列 的效果，同时能够解决 通过死信队列实现延迟队列 出现的消息阻塞问题。该插件从RabbitMQ的3.6.12开始支持

交换机类型: `x-delayed-message`,在发消息的时候加一个 header ：x-delay=xxx ，表示延时xxx毫秒。

### 同样的功能, Kafka可以实现死信队列、延时队列吗
原生 Kafka 是不支持 Retry Topic 和 DLT （Dead Letter Topic，死信队列）。但是 Spring Kafka 在客户端实现了这两个功能。
```xml
<dependency>
	<groupId>org.springframework.kafka</groupId>
	<artifactId>spring-kafka</artifactId>
	<version>2.8.6</version>
</dependency>
```
- 使用注解的方式启用 Retry Topic，在 @KafkaListener 方法上添加 @RetryableTopic 即可
- @DltHandler 方法自定义死信消费逻辑
