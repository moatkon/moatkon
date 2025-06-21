---
title: Spring Cloud
description: Spring Cloud
template: doc
lastUpdated: 2023-12-19 15:23:36
---
### Spring Cloud 实际用过哪些组件?
- **服务注册中心 Euraka**
- **声明式Http客户端 Feign**
- **服务网关 Zuul**
- 负载均衡 Ribbon
- 熔断器 Hystrix

### Spring Cloud和Dubbo的区别
#### 主要区别
Dubbo底层是使用Netty这样的NIO框架，是基于TCP协议传输的，配合以Hession序列化完成RPC通信;

而SpringCloud是基于Http协议+rest接口调用远程过程的通信，相对来说，Http请求会有更大的报文，占的带宽也会更多。但是REST相比RPC更为灵活，服务提供方和调用方的依赖只依靠一纸契约，不存在代码级别的强依赖，这在强调快速演化的微服务环境下，显得更为合适，至于注重通信速度还是方便灵活性，具体情况具体考虑。

#### 定位区别
Dubbo 是 SOA 时代的产物，它的关注点主要在于服务的调用，流量分发、流量监控和熔断;而Spring Cloud 诞生于微服务架构时代，考虑的是微服务治理的方方面面，另外由于依托Spirng、Spirng Boot 的优势之上，两个框架在开始目标就不一致，Dubbo 定位服务治理、Spirng Cloud 是一个生态。因此可以大胆地判断，Dubbo 未来会在服务治理方面更为出色，而 SpringCloud 在微服务治理上面无人能敌。

#### 模块区别
1、Dubbo主要分为服务注册中心，服务提供者，服务消费者，还有管控中心；

2、相比起Dubbo简单的四个模块，SpringCloud则是一个完整的分布式一站式框架，他有着一样的服务注册中心，服务提供者，服务消费者，管控台，断路器，分布式配置服务，消息总线，以及服务追踪等；

### 常见有哪些注册中心
![](/software-engineer/framework/spring/spring_cloud_register_centers.webp)

### 负载均衡怎么做?
Ribbon @LoadBalanced

![](/software-engineer/framework/spring/ribbon_balance.png)
> 该图片来自互联网


### Hystrix原理
Hystrix 是 Netflix 的一款开源的容错框架，通过服务隔离来避免由于依赖延迟、异常，引起资源耗尽导致系统不可用的解决方案

通过维护一个自己的线程池，当线程池达到阈值的时候，就启动服务降级，返回fallback默认值

**为什么需要hystrix熔断?** 防止雪崩，及时释放资源，防止系统发生更多的级联故障，需要对故障和延迟进行隔离，防止单个依赖关系的失败影响整个应用程序；

### Zuul与Gateway区别
- zuul则是netflix公司的项目集成在spring-cloud中使用而已， Gateway是spring-cloud的 一个子项目；
- zuul不提供异步支持，流控等均由hystrix支持。 gateway提供了异步支持，提供了抽象负载均衡，提供了抽象流控； 理论上gateway则更适合于提高系统吞吐量(但不一定能有更好的性能)，最终性能还需要通过严密的压测来决定
- 两者底层实现都是servlet，但是gateway多嵌套了一层webflux框架

#### Zuul原理分析
- 请求给zuulServlet处理(HttpServlet子类) zuulservlet中有一个zuulRunner对象，该对象中初始化了RequestContext(存储请求的数据)，RequestContext被所有的zuulfilter共享；
- zuulRunner中有 FilterProcessor(zuulfilter的管理器)，其从filterloader 中获取zuulfilter；
- 有了这些filter之后， zuulServelet执行的Pre-> route-> post 类型的过滤器，如果在执行这些过滤器有错误的时候则会执行error类型的过滤器，执行完后把结果返回给客户端.

> 其实就是把请求拿到自己的处理器处理，不走默认的，这样可以新增很多功能

#### Gateway原理分析
请求到达DispatcherHandler， DispatchHandler在IOC容器初始化时会在容器中实例化HandlerMapping接口

用HandlerMapping根据请求URL匹配到对应的Route，然后有对应的filter做对应的请求转发最终response返回去

### 微服务优缺点
- 每个服务高内聚，松耦合，面向接口编程
- 服务间通信成本，数据一致性，多服务运维难度增加，http传输效率不如rpc