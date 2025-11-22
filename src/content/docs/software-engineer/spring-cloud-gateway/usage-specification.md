---
title: Spring Cloud Gateway网关使用规范
description: Spring Cloud Gateway网关使用规范
template: doc
lastUpdated: 2025-11-22 15:43:09
sidebar:
  badge:
    text: 网关使用规范
    variant: tip
---
### 1. 引言

本文档旨在为公司内部所有基于Spring Cloud Gateway 3.0.3版本进行微服务网关开发与运维的团队和个人，提供一套统一、专业的技术与业务规范。本规范主要侧重于通过**配置文件 (YAML/Properties)** 进行网关的路由、过滤器及其他高级功能的配置。

遵循本规范有助于确保网关系统在微服务架构中作为流量入口的核心地位，实现其高可用性、高性能、可维护性、可扩展性及高安全性，有效承载和分发请求。

### 2. 网关概述

Spring Cloud Gateway 是 Spring 生态系统中的一个现代化、响应式、非阻塞式的 API 网关解决方案。

它构建于 Spring Framework 5、Project Reactor 和 Spring Boot 2 之上，旨在为微服务架构提供灵活的路由配置、强大的过滤器链以及出色的性能表现。其核心设计理念是：通过谓词（Predicates）匹配请求，通过过滤器（Filters）对请求进行预处理或后处理，最终将请求路由到目标服务。

### 3. 技术栈与版本要求

为确保网关服务的兼容性、稳定性以及与配置文件优先策略的良好配合，请严格遵循以下技术栈与版本要求：

- **Spring Cloud Gateway Version:** `3.0.3`
- **Spring Boot Version:** `2.4.6`
- **Spring Cloud Version:** `2020.0.x` (与 Spring Boot 2.4.x 兼容的最新稳定版本，如 `2020.0.6`)
- **JDK Version:** `1.8+`
- **构建工具:** Maven (`3.6+`) 或 Gradle (`6.x+`)

### 4. Spring Cloud Gateway 核心使用规范

#### 4.1. 路由定义 (Routes)

路由是网关的核心组成部分，定义了如何将客户端请求匹配并转发到后端的微服务实例。

##### 4.1.1. 路由配置方式 (优先使用 YAML)

根据公司要求，我们优先采用 YAML 文件进行路由定义。这种方式配置直观、易于部署，但也需注意配置的复杂性和可读性。Java DSL 可作为复杂业务逻辑或动态路由的补充，但在此规范中不作为主要推荐方式。

**a) YAML 配置 (推荐)**

在 `application.yml`文件中定义路由。

```yml
# application.yml
spring:
  cloud:
    gateway:
      routes:
        # ========================= 示例路由一：路径匹配路由 =========================
        # id: 定义路由的唯一标识符，应具有业务含义，遵循命名规范。
        # uri: 目标URI，lb:// 表示通过服务发现（如Eureka）进行负载均衡到 USER-SERVICE 服务。
        # predicates: 谓词列表，匹配所有以 /user-api/ 开头的请求。
        # filters: 应用于此路由的局部过滤器，这里移除了路径中的 /user-api/ 前缀。
        - id: user_service_api_route
          uri: lb://USER-SERVICE
          predicates:
            - Path=/user-api/**
          filters:
            - StripPrefix=1 # 移除第一个路径段 '/user-api'
 
        # ========================= 示例路由二：组合谓词路由 =========================
        # host: Predicate 谓词，匹配请求的 Host 头为 api.company.com。
        # Method: 组合谓词，要求请求方法为 GET。
        # uri: 目标服务为 HTTPBIN (一个常用的测试API服务)。
        - id: httpbin_get_route
          uri: http://httpbin.org:80
          predicates:
            - Host=api.company.com
            - Method=GET
 
        # ========================= 示例路由三：带断路器和降级的路由 =========================
        # path: 匹配所有以 /slow-service/ 开头的请求。
        # filters: 应用断路器过滤器。
        #   - name: CircuitBreaker (过滤器工厂名称)
        #   - args: 断路器配置参数
        #     name: slowServiceBreaker (断路器名称，用于监控和配置 Resilience4J)
        #     fallbackUri: forward:/fallback/slow-service (当断路器打开或发生错误时，请求转发到的降级URI)
        # uri: 目标URI，负载均衡到 SLOW-SERVICE 服务。
        - id: slow_service_circuitbreaker_route
          uri: lb://SLOW-SERVICE
          predicates:
            - Path=/slow-service/**
          filters:
            - name: CircuitBreaker
              args:
                name: slowServiceBreaker
                fallbackUri: forward:/fallback/slow-service # 转发到网关内部的 /fallback/slow-service 路径
 
        # ========================= 示例路由四：限流路由 (结合 Java Bean) =========================
        # path: 匹配所有以 /rate-limit-example/ 开头的请求。
        # filters: 应用请求限流器。
        #   - name: RequestRateLimiter (过滤器工厂名称)
        #   - args: 限流配置参数
        #     redis-rate-limiter.replenishRate: 10 (每秒允许的令牌数)
        #     redis-rate-limiter.burstCapacity: 20 (令牌桶的容量)
        #     key-resolver: '#{@ipKeyResolver}' (限流的维度，引用 Spring Context 中的 @ipKeyResolver Bean)
        - id: rate_limit_route
          uri: lb://ANOTHER-SERVICE
          predicates:
            - Path=/rate-limit-example/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
                key-resolver: '#{@ipKeyResolver}' # 引用 Java 中定义的 KeyResolver Bean
```



**配套 Java Bean (针对 `KeyResolver` 和 `FallbackController`)**

尽管路由主要使用 YAML，但某些高级过滤器（如 `RequestRateLimiter`）的参数可能需要引用 Spring Context 中的 Java Bean。此外，`fallbackUri` 通常会转发到网关内部的 Spring Controller。

```java
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
 
@Configuration
public class GatewayBeansConfig {
 
    /**
     * 定义限流Key的解析器，这里基于客户端IP地址进行限流。
     * 该 Bean 将通过 SpEL 表达式 '#{@ipKeyResolver}' 在 YAML 中引用。
     * 实际应用中可以根据用户ID、API路径等定义 KeyResolver。
     *
     * @return KeyResolver 实例。
     */
    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> Mono.just(
            exchange.getRequest().getRemoteAddress() != null ?
                exchange.getRequest().getRemoteAddress().getAddress().getHostAddress() : "unknown");
    }
 
    /**
     * 网关内部的降级控制器，用于处理来自断路器或错误路由的转发请求。
     */
    @RestController
    public static class GatewayFallbackController {
        @RequestMapping("/fallback/slow-service")
        public Mono<String> slowServiceFallback() {
            return Mono.just("{\"code\": 50001, \"message\": \"服务繁忙，请稍后再试。\"}");
        }
 
        @RequestMapping("/fallback/payment-service")
        public Mono<String> paymentServiceFallback() {
            return Mono.just("{\"code\": 50002, \"message\": \"支付服务暂时不可用，请联系客服。\"}");
        }
 
        @RequestMapping("/fallback/default")
        public Mono<String> defaultFallback() {
            return Mono.just("{\"code\": 50000, \"message\": \"系统暂时不可用。\"}");
        }
    }
}
```

##### 4.1.2. 路由ID命名规范

- **唯一性:** 每个路由 `id` 必须在网关应用中唯一。
- **可读性与业务含义:** 使用小写字母、数字和中划线 (`-`) 组成，清晰表达路由所代理的业务域或服务。
- **格式:** 推荐 `[业务域/服务名]_[功能/API前缀]_route`
  - **正例:** `user_service_profile_api_route`, `order_management_query_route`, `admin_dashboard_summary_route`
  - **反例:** `route1`, `my_api`, `test_route`

##### 4.1.3. URI 规范

- **服务发现 (推荐):** `lb://{SERVICE_ID}`
  - 示例: lb://USER-SERVICE
  - 这是微服务架构中的标准做法，利用 Spring Cloud LoadBalancer 进行客户端负载均衡。

- **直连 HTTP/HTTPS (特殊场景):** http://host:port 或 https://host:port
  - 示例: http://external-api.company.com:8080
  - 仅用于代理非注册到服务发现的服务或外部API。

- **内部转发 (Internal Forward):** forward:/path
  - 示例: forward:/fallback/default
  - 用于将请求转发到网关内部的另一个 Controller 或处理器，不进行外部 HTTP 调用。常用于统一错误处理或降级逻辑。

- **WebSocket (WebSocket):** ws://host:port 或 wss://host:port
  - 示例: ws://websocket-service.company.com
  - 用于代理 WebSocket 连接。

#### 4.2. 谓词 (Predicates)

谓词是路由规则的一部分，用于判断一个请求是否应该被当前的路由处理。多个谓词可以通过在 YAML 中列出进行逻辑与 (AND) 组合。

##### 4.2.1. 常用内置谓词详解 (YAML 配置)

- **`Path` 谓词:**
  - 用途: 根据请求路径匹配。
  - 语法:
    ```yml
    - Path=/users/{id} 或 - Path=/files/**
    ```
  - 支持 Ant 风格路径匹配 (`*`, `**`, `?`) 和 URI 模板 (`{segment}`)。
  - **注意事项:** 路径匹配的顺序很重要，更精确的路径规则（例如 `/users/detail/{id}`）应在更宽泛的规则（例如 `/users/**`）之前定义，以避免路由混淆。

- **`Method` 谓词:**
  - 用途: 根据 HTTP 请求方法 (GET, POST, PUT, DELETE, etc.) 匹配。
  - 语法: 
    ```yml
    - Method=GET,POST (匹配 GET 或 POST 请求)
    ```
- **`Host` 谓词:**
  - 用途: 根据请求头中的 `Host` 字段匹配域名。
  - 语法: 
    ```yml
    - Host=**.company.com 或 - Host=api.my-domain.com
    ```
  - 支持 Ant 风格模式匹配。

- **`Header` 谓词:**
  - 用途: 根据请求头中的特定字段及其值匹配。
  - 语法: 
    ```yml
    - Header=X-Requested-With, XMLHttpRequest (匹配 X-Requested-With 头且值为 XMLHttpRequest)
    ```
  - 支持正则表达式 (`- Header=X-Custom-Header, .+` 匹配非空 `X-Custom-Header` 头)。
- **`Query` 谓词:**
  - 用途: 根据请求参数 (Query Parameters) 匹配。
  - 语法: 
    ```yml
    - Query=param1 (匹配存在 param1 参数), - Query=param2, value2 (匹配 param2 且值为 value2)
    ```
  - 支持正则表达式。
- **`Cookie` 谓词:**
  - 用途: 根据请求中的 Cookie 匹配。
  - 语法: 
    ```yml
    - Cookie=name, value (匹配名为 name 且值为 value 的 Cookie)
    ```
  - 支持正则表达式。
- **`After`/`Before`/`Between` 谓词:**
  - 用途: 基于时间戳的谓词，限制请求只能在特定时间段内被路由。
  - 语法: 
    ```yml
    - After=2025-06-01T12:00:00+08:00[Asia/Shanghai] (ISO-8601 格式)。
    ```
  - 常用于灰度发布或特定时间段的活动。
- **`RemoteAddr` 谓词:**
  - 用途: 根据客户端的 IP 地址匹配。
  - 语法: 
    ```yml
    - RemoteAddr=192.168.1.1/24 (支持 CIDR 表示法)
    ```
  - 用于 IP 白名单/黑名单。
##### 4.2.2. 谓词组合逻辑

在 YAML 中，多个 `predicates` 项之间默认是逻辑与 (AND) 关系。这意味着所有列出的谓词都必须满足才能匹配路由。

```yml
- id: complex_predicate_route
  uri: lb://ITEM-SERVICE
  predicates:
    - Path=/v1/items/** # 路径匹配
    - Method=GET,POST           # 方法为 GET 或 POST
    - Header=X-Auth-Token, .+   # 必须存在 X-Auth-Token 头 (正则表达式匹配非空)
    - Query=status, active      # 查询参数 status=active
```

#### 4.3. 过滤器 (Filters)

过滤器是网关对请求和响应进行修改的机制。它们可以应用于单个路由（局部过滤器）或所有路由（全局过滤器）。

##### 4.3.1. 常用内置 GatewayFilterFactories (YAML 配置)

Spring Cloud Gateway 提供了大量开箱即用的 `GatewayFilterFactory`，通过它们可以轻松实现请求/响应的修改。在 YAML 中，过滤器通过 `name` 字段指定工厂名称，`args` 字段提供参数。

- **`AddRequestHeader`/`AddResponseHeader`**: 添加请求/响应头。
  - 语法: 
    ```yml
    - AddRequestHeader=X-Tenant-Id, my_tenant (添加请求头)
    ```
  - 语法: 
    ```yml
    - AddResponseHeader=X-Gateway-Processed, true (添加响应头)
    ```

- **`RemoveRequestHeader`/`RemoveResponseHeader`**: 移除请求/响应头。
  - 语法: 
    ```yml
    - RemoveRequestHeader=Authorization (移除请求头)
    ```

- **`RewritePath`**: 重写请求路径。
  - 语法: 
    ```yml
    - RewritePath=/api/(?<segment>.*), /${segment} (使用正则表达式重写路径)
    ```
- **`PrefixPath`**: 给请求路径添加前缀。
  - 语法: 
    ```yml
    - PrefixPath=/internal (/api/users 变为 /internal/api/users)
    ```
- **`StripPrefix`**: 剥离请求路径的前缀。
  - 语法: 
    ```yml
    - StripPrefix=1 (剥离第一段路径，如 /api/users 变为 /users)
    ```

- **`Retry`**: 重试机制。

  - 语法:
    ```yml
      - name: Retry
        args:
          retries: 3 # 最大重试次数
          statuses: INTERNAL_SERVER_ERROR # 触发重试的 HTTP 状态码
          methods: GET # 触发重试的 HTTP 方法
    ```
  - **注意事项:** 仅对幂等操作（GET, PUT, DELETE）使用，POST 通常不幂等，需谨慎。

- **`CircuitBreaker`**: 断路器。

  - 语法:
    ```yml
     - name: CircuitBreaker
       args:
         name: myBreaker # 断路器名称
         fallbackUri: forward:/fallback # 降级 URI
         addStatusCode: 500, 502 # 额外触发熔断的状态码

    ```

- **`RequestRateLimiter`**: 请求限流器。
  - 语法:
    ```yml
     - name: RequestRateLimiter
       args:
         redis-rate-limiter.replenishRate: 10 # 每秒补充令牌数
         redis-rate-limiter.burstCapacity: 20 # 桶容量
         key-resolver: '#{@ipKeyResolver}' # 限流维度，引用 Java Bean
    ```

- **`RequestSize`**: 限制请求体大小。
  - 语法: 
    ```yml
    - RequestSize=10485760 (限制为 10MB，单位字节)
    ```

##### 4.3.2. 局部过滤器 (GatewayFilter)

在路由定义中 `filters` 下方直接列出，仅作用于当前定义的路由。

```yml
- id: specific_route
  uri: lb://PRIVATE-SERVICE
  predicates:
    - Path=/private/**
  filters:
    - StripPrefix=1
    - AddRequestHeader=X-Correlation-ID, my-correlation-id # 硬编码值，也可以通过 SpEL 动态生成
    - AddResponseHeader=X-Gateway-Processed, true

```

##### 4.3.3. 全局过滤器 (GlobalFilter)

全局过滤器应用于所有路由，通过实现 `GlobalFilter` 接口和 `@Order` 注解或实现 `Ordered` 接口来定义。这部分需要通过 Java 代码实现。

```java
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
 
@Component
public class GlobalRequestLoggingFilter implements GlobalFilter, Ordered {
 
    private static final Logger log = LoggerFactory.getLogger(GlobalRequestLoggingFilter.class);
 
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 请求进入网关时的前置处理逻辑
        String requestPath = exchange.getRequest().getPath().value();
        String method = exchange.getRequest().getMethodValue();
        log.info("Incoming Request: {} {}", method, requestPath);
 
        long startTime = System.currentTimeMillis();
 
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            // 请求经过下游服务处理后，响应返回客户端时的后置处理逻辑
            long duration = System.currentTimeMillis() - startTime;
            int statusCode = exchange.getResponse().getStatusCode() != null ?
                             exchange.getResponse().getStatusCode().value() : 0;
            log.info("Outgoing Response: {} {} - Status: {} - Duration: {}ms",
                     method, requestPath, statusCode, duration);
        }));
    }
 
    @Override
    public int getOrder() {
        // 优先级设置，数字越小优先级越高。
        // 这里设置为最高优先级，确保日志在所有其他过滤器之前和之后执行。
        return Ordered.HIGHEST_PRECEDENCE; // -2147483648
    }
}

```

##### 4.3.4. 过滤器执行顺序

过滤器按照 `Ordered` 接口定义的 `order` 值（数字越小，优先级越高）进行执行。Spring Cloud Gateway 内部的过滤器也有其默认顺序，例如 `LoadBalancerClientFilter` 通常在路由之前执行，`NettyRoutingFilter` 通常在最后执行以进行实际的HTTP转发。

- 自定义全局过滤器应谨慎设置 `order` 值，以确保其在期望的阶段执行。
- 局部过滤器在全局过滤器之后执行。

#### 4.4. 负载均衡 (Load Balancing)

Spring Cloud Gateway 通过集成 `Spring Cloud LoadBalancer` 实现客户端负载均衡。

- 当 URI 使用 `lb://{SERVICE_ID}` 形式时，`LoadBalancerClientFilter` 会拦截请求，并通过服务发现机制（如 Eureka, Nacos, Consul）获取 `SERVICE_ID` 对应的服务实例列表。
- 然后，它会使用负载均衡策略（如轮询、随机、响应时间加权等）选择一个健康的实例，并将请求转发到该实例。
- 默认的负载均衡策略是 `RoundRobinLoadBalancer`。可以通过配置或实现 `ReactorServiceInstanceLoadBalancer` 接口来自定义负载均衡策略。

#### 4.5. 服务注册与发现集成

Spring Cloud Gateway 能够无缝集成主流的服务注册与发现组件。只需添加相应的 Starter 依赖并在 `application.yml` 中配置服务注册中心地址：

- **Eureka:** 添加 `spring-cloud-starter-netflix-eureka-client` 依赖并配置 Eureka Server 地址。
- **Nacos:** 添加 `spring-cloud-starter-alibaba-nacos-discovery` 依赖并配置 Nacos Server 地址。
- **Consul:** 添加 `spring-cloud-starter-consul-discovery` 依赖并配置 Consul Server 地址。

```yml
# application.yml 服务注册发现配置 (以 Nacos 为例)
spring:
  cloud:
    nacos:
      discovery:
        server-addr: http://10.4.3.210:8848;
        namespace: 63b6732e-80fc-49c2-ac83-4b09e119d48c
        metadata:
          department: NR
```

确保网关能够正确发现并获取下游服务的实例信息，这是 `lb://`URI 正常工作的基石。

### 5. 业务规范

除了 Spring Cloud Gateway 本身的功能，为了确保网关在业务层面的统一性、可管理性和安全性，需要制定严格的业务规范。

#### 5.1. 路由规则

##### 5.1.1. 统一 API 前缀与服务域绑定 (强制)

为实现 API 的标准化管理和清晰的职责划分，所有业务域的 API 必须通过网关暴露，并遵循统一的前缀规则。网关负责剥离这些外部前缀，将请求转发到后端服务。


###### 通用开放 API:

- **外部访问路径:** `/api/{version}/{业务模块}/{资源}`
- **目的:** 面向内部前端、移动App 或第三方合作伙伴的通用 API。
- **示例:**
- 用户服务: `/api/v1/users/{id}` (网关剥离 `/api/v1/` 后转发至 `/users/{id}` 给 USER-SERVICE)
- 商品服务: `/api/v2/products/{id}` (网关剥离 `/api/v2/` 后转发至 `/products/{id}` 给 PRODUCT-SERVICE)
- **网关配置示例 (YAML):**
    ```yml
    - id: user_api_v1_route
        uri: lb://USER-SERVICE
        predicates:
        - Path=/api/v1/users/**
        filters:
        - StripPrefix=2 # 剥离 /api/v1
    - id: product_api_v2_route
        uri: lb://PRODUCT-SERVICE
        predicates:
        - Path=/api/v2/products/**
        filters:
        - StripPrefix=2 # 剥离 /api/v2
    ```


###### 管理后台 API:

- **外部访问路径:** `/admin/{version}/{业务模块}/{资源}`
- **目的:** 仅供内部运营管理平台访问的 API
- **示例:**
    - 用户管理: `/admin/v1/user-management/list` (网关剥离 `/admin/v1/` 后转发至 `/user-management/list` 给 ADMIN-SERVICE)
- **网关配置示例 (YAML):**
    ```yaml
    - id: admin_user_management_route
        uri: lb://ADMIN-SERVICE
        predicates:
        - Path=/admin/v1/user-management/**
        filters:
        - StripPrefix=2 # 剥离 /admin/v1
    ```

###### 内部服务间 API (特殊情况)

- **外部访问路径:** `/internal/{service-name}/{资源}`
- **目的:** 仅供公司内部其他微服务通过网关代理访问，不对外暴露。需配合 IP 白名单或其他安全机制。
- **示例:** `/internal/inventory-service/deduct-stock`
- **网关配置示例 (YAML):**

```yml
- id: internal_inventory_route
    uri: lb://INVENTORY-SERVICE
    predicates:
    - Path=/internal/inventory-service/**
    - RemoteAddr=10.0.0.0/8,192.168.0.0/16 # 仅允许内网 IP 访问
    filters:
    - StripPrefix=2 # 剥离 /internal/inventory-service
```

###### 特定业务线 API:

- 对于特殊的业务线或合作伙伴集成，可以定义专属前缀，例如 `/crm/{version}/`, `/oms/{version}/`。
- 这需要与业务线负责人协商并明确约定。

##### 5.1.2. API 版本控制

- **路径版本化 (推荐):** 在 API 路径中显式包含版本信息 (`/api/v1/resource`, `/api/v2/resource`)。这是最直观和易于理解的方式。
- **请求头版本化 (可选):** 通过自定义请求头 (`X-API-Version`) 来传递版本信息。
- **网关处理:**
  - 当采用路径版本化时，网关通过 `StripPrefix` 或 `RewritePath` 过滤器将版本信息剥离，转发给后端服务。
  - 当采用请求头版本化时，网关可以根据请求头的值，结合 `Header` 谓词，将请求路由到不同版本的后端服务实例。

##### 5.1.3. 错误路由与降级策略

- 定义统一的全局错误处理路由，当后端服务不可用、熔断触发或发生特定 HTTP 错误时，将请求转发到网关内部的降级服务或统一的错误响应处理器。
- 结合 `CircuitBreaker` 过滤器的 `fallbackUri` 和 `ErrorWebExceptionHandler` 实现。

#### 5.2. 请求与响应处理规范

##### 5.2.1. 统一认证与授权

- 网关是进行认证和授权的集中式入口，应在网关层面完成大部分安全校验。
- **认证 (Authentication):**
  - 通过全局过滤器集成 OAuth2、JWT、SSO 等认证机制。
  - 认证成功后，从令牌中解析用户信息（如用户 ID、角色、租户 ID 等）。
  - 将解析后的关键用户信息注入到请求头中（例如 `X-User-Id`, `X-User-Roles`），传递给下游微服务。

- **授权 (Authorization):**
  - 对于简单的权限校验，可以在网关层通过全局过滤器实现基于角色的访问控制 (RBAC) 或基于资源的访问控制 (ABAC)。
  - 对于复杂的业务权限，网关进行初步校验后，将请求转发给下游服务，由下游服务进行更细粒度的业务授权。

- **禁止:** 严禁下游服务再次进行重复认证，下游服务仅需基于网关传递的认证信息进行授权校验。

##### 5.2.2. 链路追踪 (Trace ID)

- 所有进入网关的请求，必须通过全局过滤器生成并注入一个全局唯一的链路追踪 ID (例如 `X-B3-TraceId` 或 `X-Request-ID`)。
- 此 ID 必须在整个微服务调用链中透传，并通过日志系统记录，以便进行分布式链路追踪和故障排查。
- 推荐使用 Spring Cloud Sleuth 与 Zipkin/Jaeger 集成，它会自动处理 Trace ID 的生成与传递。
- **自定义实现示例 (参考 Section 4.3.3 GlobalFilter 示例)。**

##### 5.2.3. 敏感信息处理

- **传输层加密:** 所有外部流量必须强制通过 HTTPS/TLS，确保数据传输的加密性。
- **请求体加密:** 对于包含敏感业务数据（如身份证号、银行卡号、密码等）的请求，建议在客户端进行加密，并在后端服务进行解密。网关在此过程中不应尝试解密或记录这些敏感信息。
- **日志脱敏:** 严禁在网关日志中记录任何敏感信息（如密码、API Key 等），必须进行脱敏处理。

##### 5.2.4. CORS (跨域资源共享) 策略

- CORS 配置应在网关层面统一处理，避免各个微服务重复配置。
- 通过 `CorsWebFilter` 或在 `application.yml` 中配置 `spring.cloud.gateway.globalcors` 属性。
- **严格控制 `allowedOrigins`:** 仅允许已知的、合法的客户端域进行跨域访问。避免使用 `*`。
- **控制 `allowedMethods` 和 `allowedHeaders`:** 仅开放必需的 HTTP 方法和请求头。
```yml
# application.yml CORS配置示例
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]': # 针对所有路径
            allowedOrigins: # 允许的源站列表
              - "https://www.company.com"
              - "http://localhost:3000"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
            allowedHeaders: "*" # 允许所有请求头
            allowCredentials: true # 允许发送Cookie
            maxAge: 3600 # 预检请求的缓存时间 (秒)
```

### 5.3. 网关设计与操作限制 (强制)

为了确保网关的极高性能、稳定性和职责单一性，所有网关的设计与操作必须严格遵守以下强制性限制：

##### 5.3.1. 禁止文件、图片等大文件上传下载代理

- **限制内容:** 网关不允许作为文件、图片、视频等大文件上传和下载的直接代理。所有涉及大文件传输的业务，必须绕过网关，直连独立的文件存储服务（如：MinIO、FastDFS、AWS S3、阿里云 OSS 等对象存储服务）或专用的文件服务器。
- **强制级别:** 强制
- **详细说明:** Spring Cloud Gateway 基于 Netty 和 Project Reactor 构建，是一个非阻塞、响应式架构。其核心优势在于处理高并发的短连接和轻量级请求转发。然而，大文件传输会长时间占用网关的连接和内存资源，即使是非阻塞的，也可能导致以下问题：
  - **资源耗尽:** 长时间的文件传输可能导致网关的连接池、内存或线程池资源被长时间占用，影响其他正常请求的处理，甚至引发 OOM（内存溢出）。
  - **性能下降:** 大文件传输会增加网关的 I/O 负载和 CPU 消耗，降低整体的吞吐量和响应速度。
  - **职责混淆:** 网关的主要职责是路由、认证、授权、限流、熔断等，而不是作为文件存储代理。将文件传输功能置于网关会使其职责变得复杂，不利于维护和扩展。
  - **安全性考虑:** 文件传输链路若经过网关，可能增加额外的安全审计和漏洞暴露面。

- **替代方案:**
  - **上传:** 客户端直接将文件上传到文件存储服务，并将文件存储服务的 URL 或 ID 返回给业务服务，业务服务再将此信息存储到数据库。
  - **下载:** 业务服务返回文件的下载 URL（指向文件存储服务），客户端直接从文件存储服务下载。在需要认证授权的场景下，可以生成带有时效性签名的下载 URL。

##### 5.3.2. 禁止任何同步 IO 阻塞操作

- **限制内容:** 网关内部（包括自定义的 GlobalFilter、GatewayFilter 或任何扩展组件）严禁进行任何形式的同步 IO 阻塞操作（如传统的 `[java.io](http://java.io/)` 操作、JDBC 同步数据库访问、同步的 HTTP 客户端调用等）。
- **强制级别:** 强制
- **详细说明:** Spring Cloud Gateway 的核心设计哲学是基于 Project Reactor 的完全非阻塞和响应式。任何同步阻塞操作都会立即破坏这种非阻塞特性，导致 Netty 的 I/O 线程阻塞，进而影响整个网关的吞吐量和并发处理能力，甚至造成系统假死。
- **实现要求:**
  - 所有对外部服务的调用（如 Redis、数据库、HTTP 外部 API）必须使用响应式客户端（如 `Spring WebClient`、`Spring Data Reactive Redis`、`R2DBC` 等）。
  - 自定义过滤器或任何扩展开发，必须采用 `Mono` 或 `Flux` 返回类型，并遵循响应式编程范式。

- **备注:** 我们强制要求所有相关开发（包括集成 `redis`、`feign` 等）全部采用 `webflux` 异步开发模式。

##### 5.3.3. 禁止进行请求 Body 解析处理

- **限制内容:** 网关在过滤器扩展开发等场景下，通常不允许对请求体 (Request Body) 进行解析或修改。
- **强制级别:** 强制
- **详细说明:**
  - **性能影响:** 请求体解析是一个 I/O 密集型和 CPU 密集型操作。在网关层面进行 Body 解析会导致额外的内存拷贝和序列化/反序列化开销，严重影响网关的转发性能，特别是在高并发和请求体较大的场景下。
  - **响应式流中断:** Spring Cloud Gateway 处理的是 `DataBuffer` 的响应式流。一旦读取并解析了 Body，这个流就会被消费。如果需要重新放回 Body 供下游服务使用，通常需要将 Body 缓存起来，这会增加内存压力和复杂度。
  - **职责单一:** 网关的职责是快速路由和转发，以及执行通用的横切关注点（认证、限流等），业务数据的详细解析和处理应是下游微服务的职责。

- **替代方案:**
  - **使用 Header 传递信息:** 如果需要在网关层面获取请求的某些信息用于路由或过滤决策，且这些信息通常存在于 Body 中，应考虑将这些关键信息提取并添加到请求头中进行传递。这要求客户端或上游系统配合，或者在网关前置的代理层（如 Nginx + Lua）进行轻量级处理。
  - **Header 优先级:** 通常，对于路由和过滤决策，优先使用请求头 (Header) 和查询参数 (Query Parameter) 进行处理。
  - **特殊场景处理:** 如果确实存在少量、极端特殊且无法规避的业务场景，需要在网关层面读取请求 Body（例如，进行签名验证），则必须经过严格的架构评审，并采取熔断、限流、请求大小限制等严格的保护措施，确保其不会影响网关的整体性能和稳定性。此时，必须使用 `ServerRequest.bodyToMono()` 或 `ServerRequest.bodyToFlux()` 等响应式方式，且处理完成后确保 Body 可以被下游服务再次读取（例如通过 `CachedBodyOutputMessage` 等方式）。

##### 5.3.4. 禁止处理静态资源

- **限制内容:** 网关不允许直接处理或代理静态资源（如 CSS、JavaScript 文件、图片、字体等）。
- **强制级别:** 强制
- **详细说明:**
  - **职责混淆:** 网关的主要职责是动态请求的路由和流量控制，而不是作为静态文件服务器。
  - **效率低下:** 专门的 Web 服务器（如 Nginx、Apache Httpd）或内容分发网络 (CDN) 在处理静态资源方面具有更高的效率、更好的缓存机制和更优化的网络传输能力。让网关处理静态资源会增加不必要的负载，降低其处理核心业务流量的效率。
  - **缓存与优化:** 静态资源通常需要大量的缓存策略（如 Expires/Cache-Control 头、CDN 缓存），这些都不是网关的核心功能。

- **替代方案:**
  - **独立 Web 服务器:** 将所有静态资源部署到专用的高性能 Web 服务器（如 Nginx）上。
  - **CDN (内容分发网络):** 对于面向全球用户的静态资源，强烈推荐使用 CDN 服务，以提高用户访问速度并分担服务器压力。
  - **对象存储服务:** 对于需要存储大量静态文件的场景，可以使用对象存储服务（如阿里云 OSS、AWS S3），并配合 CDN。

### 6. 性能优化与监控

#### 6.1. 连接池配置

优化 Netty HttpClient 的连接池参数，以提高并发处理能力和资源利用率。

```yaml
# application.yml Netty HttpClient 连接池配置示例
spring:
  cloud:
    gateway:
      httpclient:
        pool:
          type: FIXED # 连接池类型：FIXED (固定大小) 或 ELASTIC (弹性)
          max-connections: 2000 # 最大连接数
          acquire-timeout: 5000ms # 从连接池获取连接的超时时间
          max-idle-time: 30000ms # 连接在连接池中的最大空闲时间
        connect-timeout: 2000 # 与目标服务建立连接的超时时间 (毫秒)
        response-timeout: 10s # 从目标服务接收响应的超时时间 (时间单位：s, ms, m, h, d)
        # wiretap: false # 生产环境禁用，仅用于调试。默认为 false
```

#### 6.2. 限流 (Rate Limiting)

通过 `RequestRateLimiter` 过滤器对流量进行控制，保护下游服务，防止过载。

- **策略:**
  - **全局限流:** 针对所有进入网关的请求。
  - **IP 限流:** 针对客户端 IP 地址。
  - **用户限流:** 针对认证后的用户 ID。
  - **API 限流:** 针对特定 API 路径。

- **算法:** Spring Cloud Gateway 默认集成 Redis 实现了令牌桶 (Token Bucket) 算法。
- **KeyResolver:** 这是限流的关键，定义了限流的维度。虽然在 YAML 中配置，但 `KeyResolver` 本身需要通过 Java Bean 提供。
  - **IP 地址:** 引用 `#{@ipKeyResolver}`
  - **用户 ID:** 引用 `#{@userKeyResolver}` (假设您有解析用户 ID 的 Java Bean)
  - **API 路径 + 方法:** 引用 `#{@pathMethodKeyResolver}`

#### 6.3. 熔断与降级 (Circuit Breaking & Fallback)

使用 `CircuitBreaker` 过滤器集成 Resilience4j (推荐) 或 Hystrix，实现服务熔断机制，防止服务雪崩。

- **配置参数:**
  - `name`: 熔断器实例的唯一名称。
  - `fallbackUri`: 熔断发生时的降级处理 URI。
  - `setFallbackHeaders`: 降级时是否传递请求头到降级 URI。
  - `addStatusCode`: 除了默认异常，额外触发熔断的状态码（如 `500`, `429`）。

- **降级策略:**
  - 返回默认值或友好提示信息。
  - 从缓存中读取数据。
  - 跳转到静态错误页面。

- **示例 (YAML):**
  ```yml
    - id: payment_service_breaker_route
      uri: lb://PAYMENT-SERVICE
      predicates:
        - Path=/payment/**
      filters:
        - name: CircuitBreaker
          args:
            name: paymentServiceBreaker # 断路器名称
            fallbackUri: forward:/fallback/payment-service # 降级URI
            allowCircuitBreakerOpenWhenNoWorkers: false # 推荐设置为 false
            addStatusCode: 500,502 # 当下游返回 500 或 502 时也触发熔断
  ```

  **对应的 Java 降级控制器 (见 4.1.1 b) 配套 Java Bean 部分)**

#### 6.4. 监控与告警

- **集成 Spring Boot Actuator:** 暴露 `/actuator/health`, `/actuator/metrics`, `/actuator/threaddump` 等端点，提供应用健康状态和运行时信息。
- **Metrics (指标):**
  - 通过 Micrometer 集成 Prometheus、Grafana 等监控系统，收集网关的关键业务和系统指标。
  - **关键指标:**
    - **网关请求量 (TPS):** `gateway.requests.total`
    - **请求响应时间 (Latency):** `gateway.requests.duration` (平均、P90、P99)
    - **错误率:** `gateway.requests.failed` (HTTP 5xx 错误)
    - **路由匹配成功率:**
    - **过滤器执行耗时:**
    - **限流/熔断触发次数:** `resilience4j.circuitbreaker.calls`, `spring.cloud.gateway.rate-limiter.throttled`
    - JVM 指标 (CPU 使用率、内存使用量、GC 次数/时间、线程数)。

- **分布式链路追踪 (Distributed Tracing):**
  - 集 成 Spring Cloud Sleuth，结合 Zipkin 或 Jaeger 等追踪系统，实现请求在网关和下游微服务之间的完整调用链追踪。
  - 这对于定位跨服务的性能瓶颈和故障非常有帮助。

- **告警:** 基于关键指标设置告警规则，及时发现和响应潜在问题。

### 7. 安全实践

网关作为系统的第一道防线，其安全性至关重要。

#### 7.1. HTTPS/TLS (强制)

- 所有暴露给外部的网关入口必须强制使用 HTTPS，配置有效的 SSL/TLS 证书。
- 建议在网关层面进行 SSL/TLS 卸载，并将请求转发给内部服务（内部服务可以继续使用 HTTPS 或 HTTP，但推荐内部也使用 HTTPS 以实现端到端加密）。

#### 7.2. Web 应用防火墙 (WAF) & DDoS 防护

- 在网关前端部署 WAF (Web Application Firewall) 和 DDoS 防护服务（例如云服务商提供的 WAF 或 CDN），以抵御常见的 Web 攻击（如 SQL 注入、XSS、CSRF）和分布式拒绝服务攻击。
- 网关的限流和熔断机制是对 WAF/DDoS 防护的有效补充。

#### 7.3. 输入验证与净化

- 尽管大部分输入验证应在下游服务进行，但对于可能影响网关性能或安全的基础性验证（如 URL 路径、请求头长度等），网关可以进行初步校验。
- 避免将未经验证的用户输入直接用于重写路径或作为动态参数。

#### 7.4. 日志审计与安全审计

- **日志记录:**
  - 详细记录所有进入网关的请求和响应的关键信息，包括：请求 URL、HTTP 方法、客户端 IP、用户标识 (如果已认证)、请求头 (选择性)、响应状态码、请求耗时、错误信息。
  - 确保日志具有可追溯性，并与链路追踪 ID 关联。

- **日志存储与分析:** 将网关日志集中存储到日志管理平台（如 ELK Stack, Splunk），并进行实时分析和安全审计。
- **敏感信息脱敏:** 严格执行日志脱敏策略，绝不允许在日志中出现明文密码、个人身份信息、银行卡号等敏感数据。

### 8. 错误处理与容错

#### 8.1. 全局异常处理

- 实现 `ErrorWebExceptionHandler` 接口，对网关层面产生的异常进行统一处理，返回友好的、统一的 JSON 格式错误响应。
- 避免将原始的 Java 异常堆栈信息直接暴露给客户端。
- 根据 HTTP 状态码和业务错误码，提供清晰的错误描述。
- **对应的 Java 实现 (见 4.3.3 全局过滤器 部分后的 Java 代码示例)。**

#### 8.2. 重试机制

- 对于下游服务的短暂网络波动或瞬时错误，可以配置 `Retry` 过滤器进行重试。
- **重要原则:** 仅对幂等操作（GET, PUT, DELETE）启用重试。POST 请求通常不幂等，重试可能导致数据重复或业务异常，需特别谨慎或仅在特定业务场景下使用。
- 设置合理的重试次数和重试间隔，避免对下游服务造成过大压力。

### 9. 开发与部署规范

#### 9.1. 配置管理

- **配置中心 (推荐):** 使用 Spring Cloud Config、Nacos Config 或 Apollo 等配置中心来集中管理网关的配置，实现动态刷新和版本控制。
- **环境隔离:** 区分开发、测试、生产环境配置，并通过 Profile 进行管理。
- **敏感信息加密:** 数据库密码、API Key、证书等敏感配置必须加密存储在配置中心，并通过 Jasypt 或配置中心自身的加密功能进行解密。

#### 9.2. 代码规范

- 遵循公司的 Java 代码规范，包括但不限于命名规范、注释规范、代码格式化等。
- 即使主要使用 YAML 配置路由，自定义的全局过滤器、`KeyResolver` 和异常处理器等 Java 代码也应确保清晰、可读、易于维护，并编写详细的 Javadoc 注释。

#### 9.3. 自动化测试策略

- **单元测试:** 对自定义的 `GlobalFilter`、`KeyResolver`、`ErrorWebExceptionHandler` 等组件编写单元测试。
- **集成测试:** 编写针对 YAML 配置的路由、谓词和过滤器的集成测试，模拟实际请求流，验证路由是否正确匹配、过滤器是否按预期修改请求/响应。
- **性能测试:** 在部署前进行压力测试和性能基准测试，验证网关在高并发下的性能表现。

#### 9.4. 部署策略

- **容器化部署:** 推荐使用 Docker 镜像化打包网关应用，并通过 Kubernetes (K8s)、Docker Swarm 等容器编排平台进行部署。
- **高可用性:** 部署多个网关实例，通过负载均衡器（如 Nginx, F5, 云厂商的 LB）进行分发，实现高可用。
- **弹性伸缩:** 利用容器编排平台的自动扩缩容能力，根据流量变化弹性调整网关实例数量。
- **灰度发布/蓝绿部署:** 利用网关的路由能力，结合容器编排工具实现灰度发布或蓝绿部署，实现平滑升级和回滚。
- **健康检查:** 配置 Kubernetes 或负载均衡器的健康检查，确保只有健康的网关实例才接收流量。

### 10. 附录

#### 10.1. 常用配置示例

```yml
# application.yml 基础配置示例
server:
  port: 8080 # 网关监听端口
 
spring:
  application:
    name: gateway-service # 应用名称
  profiles:
    active: dev # 默认激活的配置文件
 
  cloud:
    gateway:
      # 全局默认过滤器配置
      default-filters:
        - DedupeResponseHeader=Vary Access-Control-Allow-Origin, RETAIN_FIRST # 去重响应头
        - PreserveHostHeader # 转发时保留原始的 Host 头
      # 全局 CORS 配置 (推荐在单独的 CorsWebFilter Bean 中配置，或见 5.2.4)
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "*, null" # 仅用于开发测试，生产环境需指定具体域名
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
            allowedHeaders: "*"
            allowCredentials: true
            maxAge: 3600
      # Netty HttpClient 配置 (见 6.1)
      httpclient:
        connect-timeout: 2000
        response-timeout: 10s
        pool:
          type: FIXED
          max-connections: 1000
 
# 服务注册发现配置 (以 Eureka 为例)
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/ # Eureka Server 地址
 
# Resilience4J (断路器) 配置示例
resilience4j:
  circuitbreaker:
    instances:
      # 定义名为 slowServiceBreaker 的断路器实例配置 (在路由中 CircuitBreaker 过滤器的 name 参数引用)
      slowServiceBreaker:
        registerHealthIndicator: true # 注册健康指标
        failureRateThreshold: 50 # 失败率阈值 (50%)
        waitDurationInOpenState: 5s # 断路器打开后的等待时间 (5秒)
        slidingWindowType: COUNT_BASED # 滑动窗口类型：基于次数
        slidingWindowSize: 10 # 滑动窗口大小：10次请求
        minimumNumberOfCalls: 5 # 最小请求数：至少5次请求才开始计算失败率
        permittedNumberOfCallsInHalfOpenState: 3 # 半开状态下允许的请求数
      # 定义名为 paymentServiceBreaker 的断路器实例配置
      paymentServiceBreaker:
        registerHealthIndicator: true
        failureRateThreshold: 60 # 支付服务失败率阈值 (60%)
        waitDurationInOpenState: 10s # 断路器打开后的等待时间 (10秒)
        slidingWindowType: TIME_BASED # 滑动窗口类型：基于时间
        slidingWindowSize: 60s # 滑动窗口大小：60秒
        minimumNumberOfCalls: 10 # 最小请求数：至少10次请求才开始计算失败率
        permittedNumberOfCallsInHalfOpenState: 5 # 半开状态下允许的请求数
 
# Redis RateLimiter 配置 (需引入 spring-boot-starter-data-redis-reactive 依赖)
spring:
  redis:
    host: localhost
    port: 6379
```

#### 10.2. 常见问题排查

- **路由不匹配:**
  - 检查谓词 (`Path`, `Method`, `Host` 等) 配置是否正确，是否存在拼写错误。
  - YAML 配置格式是否正确，缩进是否准确。
  - 路径匹配顺序：更具体的路径谓词应定义在更通用的谓词之前。
  - 检查 `StripPrefix` 或 `RewritePath` 是否正确处理了路径。

- **过滤器不生效:**
  - 检查过滤器是否已正确配置到目标路由的 `filters` 列表或全局默认过滤器中。
  - 检查 `GlobalFilter` 的 `@Order` 值，确保其在期望的顺序执行。
  - 检查过滤器逻辑是否有异常抛出，导致链式调用中断。

- **服务无法发现:**
  - 检查服务发现客户端依赖是否正确引入。
  - 检查服务注册中心地址配置是否正确。
  - 确保下游服务已成功注册到服务注册中心。
  - 检查服务 ID (`[lb://SERVICE_ID](lb://SERVICE_ID)`) 是否与下游服务注册的 ID 完全一致。

- **性能瓶颈:**
  - 监控网关的 CPU、内存、网络 I/O 使用情况。
  - 检查 Netty HttpClient 的连接池配置是否合理。
  - 检查是否有长时间运行的自定义过滤器或阻塞操作。
  - 分析 Micrometer 指标，特别是请求响应时间、GC 时间等。

- **内存泄漏:**
  - 使用 Java 内存分析工具 (如 JVisualVM, JProfiler) 检查堆内存使用情况，查找是否有对象无法被垃圾回收。
  - 检查自定义过滤器中是否有资源未释放或 Reactor Stream 未正确订阅/取消。

- **断路器/限流不工作:**
  - 检查 Redis 连接是否正常，Redis 服务是否可用。
  - 检查 `KeyResolver` 是否正确返回了限流 Key，以及在 YAML 中引用 SpEL 表达式 `#{@yourKeyResolverBeanName}` 是否正确。
  - 检查 Resilience4j 的配置是否正确，特别是 `failureRateThreshold`, `slidingWindowSize` 等参数。

