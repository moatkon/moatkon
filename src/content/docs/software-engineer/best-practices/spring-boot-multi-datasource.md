---
title: SpringBoot集成多数据源
description: SpringBoot集成多数据源
template: doc
lastUpdated: 2024-08-24 19:40:31
tableOfContents: false
---
```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>dynamic-datasource-spring-boot-starter</artifactId>
    <version>4.3.0</version>
</dependency>
```

原来的配置:
```yaml
# spring配置
spring:
  # 数据源配置
  datasource:
    url: jdbc:mysql://localhost:3306/auto_works?useUnicode=true&useSSL=false&characterEncoding=utf8&allowPublicKeyRetrieval=true
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
    # 连接池配置
    druid:
      initial-size: 5
      max-wait: 60000
      max-active: 10
      time-between-eviction-runs-millis: 60000
      min-evictable-idle-time-millis: 300000
      validation-query: SELECT 1
      test-while-idle: true
      test-on-borrow: false
      test-on-return: false
```

多数据源的配置:
```yaml ins="datasource: # 和原来的配置比对可以得出,这个层级的数据源不变" del="# 追加一个dynamic的配置,在这里面配置多数据源"
# spring配置
spring:
  # 数据源配置
  datasource: # 和原来的配置比对可以得出,这个层级的数据源不变
    dynamic: # 追加一个dynamic的配置,在这里面配置多数据源
      primary: master
      strict: false
      datasource:
        master:
          url: jdbc:mysql://localhost:3306/auto_works?useUnicode=true&useSSL=false&characterEncoding=utf8&allowPublicKeyRetrieval=true
          username: root
          password: 123456
          driver-class-name: com.mysql.cj.jdbc.Driver
          # 连接池配置
          druid:
            initial-size: 5
            max-wait: 60000
            max-active: 10
            time-between-eviction-runs-millis: 60000
            min-evictable-idle-time-millis: 300000
            validation-query: SELECT 1
            test-while-idle: true
            test-on-borrow: false
            test-on-return: false
        another:
          url: jdbc:mysql://localhost:3306/auto_works2?useUnicode=true&useSSL=false&characterEncoding=utf8&allowPublicKeyRetrieval=true
          username: root
          password: 123456
          driver-class-name: com.mysql.cj.jdbc.Driver
          # 连接池配置
          druid:
            initial-size: 5
            max-wait: 60000
            max-active: 10
            time-between-eviction-runs-millis: 60000
            min-evictable-idle-time-millis: 300000
            validation-query: SELECT 1
            test-while-idle: true
            test-on-borrow: false
            test-on-return: false
```

使用方法:
```java
@DS("master")
@DS("another")
```
