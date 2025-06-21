---
title: Spring Cloud Gateway 网关压测
description: Spring Cloud Gateway 网关压测
template: doc
lastUpdated: 2025-06-13 23:01:18
---
#### 背景
公司的API网关出现了重启

#### 排查经历
1. 确认业务层面有无促销等场景造成的流量暴增 `无`
2. 确认程序上有无疯狂刷接口的行为  `无`
3. 确认流量分配是否均衡 `无`
4. 确认最近有无上线行为 `无`

#### 排查结果
以上排查都无果


#### 尝试复现
压测场景:
1. 写一个超时接口,超时时间40s,大于网关全局超时,模拟连接被hold的场景
2. 压测监控检测接口。因为k8s健康监测功能,会监测这个接口来判定服务是否健康。不健康则会重启pod


使用Jmeter来压测网关。使用6000个的线程来并发压测网关,可以复现



#### 解决方案
修改配置,新增绿色部分
```yml ins={"关闭discoveryComposite的健康检查":4-7} {"网关级别超时时间从30s调整到6s":11} del={12} ins={13} {"网关级别超时时间从30s调整到6s":11} ins={"新增网关HttpClient连接池线程生命周期及定时回收策略":14-17}  ins={"路由级别的超时配置，优先级大于网关的全局超时配置":23-26} ins={"开启监控检测端点":30-34} ins={"网关关闭健康依赖检查":35-38} 
spring:
  cloud:
    discovery:

      client:
        health-indicator:
          enabled: false
    gateway:
      httpclient:
        connect-timeout: 2000

        response-timeout: 30s
        response-timeout: 6s

        pool:
          max-idle-time: PT10S #线程最大空闲时间,超时回收
          eviction-interval: PT30S  #定期回收频率
      routes:
        - id: moatkon
          uri: lb://moatkon-service
          predicates:
            - Path=/moatkon/**

          metadata:
            connect-timeout: 5000
            response-timeout: 30000
       
 
management:

  endpoint:
    health:
      enabled: true
      show-details: always

  health:
    defaults:
      enabled: false
  endpoints:
    web:
      exposure:
        include: ["*"]
```

在启动应用时添加JVM参数:
```sh
-Dreactor.netty.pool.leasingStrategy=lifo
```



#### 压测结果
结果显示,6000并发持续压测3h+无重启现象
