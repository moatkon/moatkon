---
title: Dubbo
description: Dubbo
template: doc
lastUpdated: 2023-12-20 11:28:47
---
### Dubbo工作流程(&原理)
![](/software-engineer/drawio/Moatkon-DubboDesign.drawio.svg)

**第一步**：provider 向注册中心去注册   
**第二步**：consumer 从注册中心订阅服务，注册中心会通知 consumer 注册好的服务   
**第三步**：consumer 调用 provider   
**第四步**：consumer 和 provider 都异步通知监控中心   

### Dubbo的10层架构

**第一层**：service 层，接口层，给服务提供者和消费者来实现的   
**第二层**：config 层，配置层，主要是对 Dubbo 进行各种配置的   
**第三层**：proxy 层，服务代理层，无论是 consumer 还是 provider，Dubbo 都会给你生成代理，代理之间进行网络通信   
**第四层**：registry 层，服务注册层，负责服务的注册与发现   
**第五层**：cluster 层，集群层，封装多个服务提供者的路由以及负载均衡，将多个实例组合成一个服务   
**第六层**：monitor 层，监控层，对 rpc 接口的调用次数和调用时间进行监控   
**第七层**：protocal 层，远程调用层，封装 rpc 调用   
**第八层**：exchange 层，信息交换层，封装请求响应模式，同步转异步   
**第九层**：transport 层，网络传输层，抽象 mina 和 netty 为统一接口   
**第十层**：serialize 层，数据序列化层   

### 注册中心挂了可以继续通信吗？
可以，因为刚开始初始化的时候，消费者会将提供者的地址等信息拉取到本地缓存，所以注册中心挂了可以继续通信。

### SpringCloud和Dubbo的区别
1. Dubbo 采用的是传输层 tcp 协议，是二进制传输的，占用带宽较少，序列化采用的是 jdk 自带的序列化协议。
2. SpringCloud 是应用层 http 协议，占用带宽比较多，同时 springcloud 采用的是 json 报文传输，消耗会比较大。
3. Dubbo 调用使用的是长链接，适合传输数据量小的包，而对于 springcloud 是短连接，适合传输大数据量的信息，比如图片、文本之类的。
4. Dubbo 开发需要依赖 jar 包，对依赖的管理比较复杂。springcloud 的接口协议比较松散，约束性不强。

##### 从其他角度的区别
- 初始定位不同：SpringCloud定位为微服务架构下的一站式解决方案；Dubbo 是 SOA 时代的产物，它的关注点主要在于服务的调用和治理
- 生态环境不同：SpringCloud依托于Spring平台，具备更加完善的生态体系；而Dubbo一开始只是做RPC远程调用，生态相对匮乏，现在逐渐丰富起来。
- 调用方式：SpringCloud是采用Http协议做远程调用，接口一般是Rest风格，比较灵活；Dubbo是采用Dubbo协议，接口一般是Java的Service接口，格式固定。但调用时采用Netty的NIO方式，性能较好。
- 组件差异比较多，例如SpringCloud注册中心一般用Eureka，而Dubbo用的是Zookeeper

> 开源社区里有许多优秀的 RPC 框架，还有其他的,例如Thrift、gRPC 等

### Dubbo支持哪些通信协议?
- Dubbo协议：默认的通信协议，采用单一长连接和NIO异步通信，适合于小数据量大并发的服务调用，以及服务消费者机器数远大于服务提供者机器数的情况。
- REST协议：基于标准的Java REST API实现REST调用。
- Hessian协议：用于集成Hessian的服务，底层采用HTTP通讯，采用Servlet暴露服务。
- HTTP协议：用于应用程序和浏览器JS使用的服务。
- jsonrpc WebService协议：用于系统集成，跨语言调用。
- RMI协议：采用JDK标准的java.rmi.*实现，采用阻塞式短连接和JDK标准序列化方式。

### Dubbo支持哪些序列化协议?
- Hessian协议：默认的序列化协议，基于Hessian进行序列化。
- Java二进制序列化：RMI协议使用的序列化方式。
- json序列化：HTTP协议使用的序列化方式。
- SOAP文本序列化：WebServices协议使用的序列化方式。

### 为什么你们不使用Spring Cloud来做微服务
- 直接原因是公司的技术架构是基于Dubbo来做的一整套微服务
- 另外的原因,是公司的业务特点决定的,使用Dubbo比较快[->](#springcloud和dubbo的区别)
- 像我之前的一家公司,是做的电商ERP系统,这家公司是基于SpringCloud来做的