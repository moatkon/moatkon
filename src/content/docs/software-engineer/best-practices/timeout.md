---
title: 如何设置超时
description: 如何设置超时
template: doc
lastUpdated: 2024-01-15 22:32:00
tableOfContents: 
    minHeadingLevel: 1
    maxHeadingLevel: 5
---
在平时的项目中,有很多网络之间的调用,我们通常都会设置一些超时时间,那么你有考虑过为什么要设置超时时间吗? 或者我们反过来想,如果不设置超时时间会发生什么? 

如果不设置超时时间会发生:
1. 调用方会因为一直获取不到响应,一直在阻塞等待而不能处理其他请求
2. 长时间占用资源,如果继续有很多的请求过来就会导致内存不够,会发生频繁的GC,最终可能会导致OOM
3. 会达到连接上限,导致机器再也处理不了其他请求。即其他功能也被拖累了

如果设置了超时会有哪些好处:
1. 从无限等待变为有限等待,故可控。可控是软件一个重要的衡量指标。
2. 资源可以及时释放,不至于一直占用而影响软件其他正常的功能。
3. 可以更合理的分配资源,缩小影响范围

#### 有哪些超时可以设置呢?
- 连接超时 connectTimeout
- 读取超时 readTimeout

#### 网络请求的工具有很多,都怎么设置超时呢?
##### Feign
###### Feign全局设置
```yaml title="全局设置"  {4-6}
feign:
  client:
    config:
      default:
        connectTimeout: 60000
        readTimeout: 10000
```

###### 指定特定的FeignClient
```java ins="moatkon-feign-client"
@FeignClient(value = "moatkon",contextId ="moatkon-feign-client")
public interface MoatkonService {
}
```
```yaml title="设置特定的FeignClient超时" {4-6} ins="moatkon-feign-client"
feign:
  client:
    config:
      moatkon-feign-client:
        connectTimeout: 60000
        readTimeout: 10000
```

##### OkHttp
> 这里是以okhttps3为准的

Github: [okhttp](https://github.com/square/okhttp)

OkHttp官网: [square.github.io/okhttp/](square.github.io/okhttp/)

示例代码: [ConfigureTimeouts.java](https://github.com/square/okhttp/blob/master/samples/guide/src/main/java/okhttp3/recipes/ConfigureTimeouts.java)
```java {5-7} title="OkHttp设置超时"
    private final OkHttpClient client;

    public ConfigureTimeouts() throws Exception {
        client = new OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS) // 超时时间
            .writeTimeout(10, TimeUnit.SECONDS) // 写超时时间
            .readTimeout(30, TimeUnit.SECONDS) // 读超时时间
            .build();
    }
```
每一种超时的官方解释(英):
> [OkHttpClient](https://github.com/square/okhttp/blob/00ac57e8c3a7920e7752f213d526a776415bc457/okhttp/src/main/kotlin/okhttp3/OkHttpClient.kt#L589)

- The **write timeout** is applied for individual write IO operations. The default value is 10
- The **read timeout** is applied to both the TCP socket and for individual read IO operations including on [Source] of the [Response]. The default value is 10 seconds.
- The **connect timeout** is applied when connecting a TCP socket to the target host. The default value is 10 seconds.

##### Gateway网关全局超时配置
```yaml {4-6}
spring:
  cloud:
    gateway:     
      httpclient:
        connect-timeout: 45000 #毫秒
        response-timeout: 10000
        pool:
          type: elastic

```

网关中路由的超时配置
```yaml {7-9}
      - id: moatkon_service
        uri: https://moatkon.com
        predicates:
          - name: Path
            args:
              pattern: /delay/{timeout}
        metadata:
          response-timeout: 200
          connect-timeout: 200
```
- connect-timeout是指网关到目标路由的连接超时时间
- response-timeout是指服务给网关返回响应的时间

##### 服务端超时
外部连接与gateway建立连接的超时时间
```yaml {3}
server:
  netty:
    connection-timeout: 60000
```


##### 内嵌Tomcat超时
```yaml {7-8}
server:
  tomcat:   
    accept-count: 100
    threads:
      max: 200
    max-connections: 8192
    connection-timeout: 60000
    keep-alive-timeout: 60000
    max-keep-alive-requests: 100
```

##### URLConnection
> 很原生的写法,实际项目开发中几乎不使用,所以这里只做展示

```java {3-4} title="URLConnection设置超时"
    URL url = new URL(url);
    HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
    urlConnection.setReadTimeout(5000);
    urlConnection.setConnectTimeout(5000);
```

##### alibaba DruidDataSource通用配置
[DruidDataSource配置,属性列表](https://github.com/alibaba/druid/wiki/DruidDataSource%E9%85%8D%E7%BD%AE%E5%B1%9E%E6%80%A7%E5%88%97%E8%A1%A8)

```xml title="通用xml配置" {11}
 <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close"> 
     <property name="url" value="${jdbc_url}" />
     <property name="username" value="${jdbc_user}" />
     <property name="password" value="${jdbc_password}" />

     <property name="filters" value="stat" />

     <property name="maxActive" value="20" />
     <property name="initialSize" value="1" />
     <!--获取连接时最大等待时间，单位毫秒。配置了maxWait之后，缺省启用公平锁，并发效率会有所下降，如果需要可以通过配置useUnfairLock属性为true使用非公平锁。-->
     <property name="maxWait" value="6000" />
     <property name="minIdle" value="1" />

     <property name="timeBetweenEvictionRunsMillis" value="60000" />
     <property name="minEvictableIdleTimeMillis" value="300000" />

     <property name="testWhileIdle" value="true" />
     <property name="testOnBorrow" value="false" />
     <property name="testOnReturn" value="false" />

     <property name="poolPreparedStatements" value="true" />
     <property name="maxOpenPreparedStatements" value="20" />

     <property name="asyncInit" value="true" />
 </bean>
```
SpringBoot可以在yaml中配置,在yaml中配置,更加简洁

#### 最后
可以设置超时的地方太多了,不可能都列完,哈哈

上面只是列出了常用的一些超时。我们只需要知道这个就行,在平时做研发时,要考虑到这些