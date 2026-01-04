---
title: DDD分层规范文档
description: DDD分层规范文档
template: doc
lastUpdated: 2026-01-04 21:42:27
tableOfContents:
   minHeadingLevel: 1
   maxHeadingLevel: 6
---



## **1. 引言**

本文档旨在提供一套一心堂研发内部标准的领域驱动设计（DDD）分层架构规范。其核心目标是：

- **统一架构认知**：在所有团队中建立一致的架构语言和设计准则。
- **明确职责边界**：通过更精细化的分层，清晰定义各模块的职责，防止业务逻辑泄露和代码腐化。
- **提升协作效率**：通过标准化的sdk契约模块，实现安全、高效的跨域（Bounded Context）交互。
- **保障系统演进**：使每个业务域能够独立、安全地进行开发、部署和扩展。

## **2. 核心原则**

- **业务域独立 (Bounded Context First)**：每个业务域都是一个独立的Maven项目，拥有自己的代码仓库（Git Repo），代码仓库本身即定义了团队所有权。
- **精细化分层 (Fine-grained Layering)**：严格遵循表现层、应用层、领域层、基础设施层的四层架构思想。
- **依赖倒置 (Dependency Inversion Principle)**：高层模块不依赖于低层模块的具体实现。领域层是整个架构的核心，不依赖于任何其他层。
- **面向接口编程 (Programming to an Interface)**：所有跨层或需要灵活替换的服务，都应通过接口进行通信。

## **3. 通用项目结构规范**

为了实现规范的通用性，我们使用占位符 {business-domain}。在实际创建项目时，请替换为具体的业务名称（例如：order, product, user）。

### **3.1 标准化多模块结构树**

一个独立的业务域项目 project-root 的标准结构如下：

```rust
{business-domain}-{具体业务} (业务域根项目 - Git Repository Root)
├── pom.xml                           (Parent POM, 管理所有子模块和依赖)
│
├── {business-domain}-bootstrap/      (1. 启动与装配模块)
│   ├── pom.xml
│   └── src/main/java/com/moatkon/{business-domain}/bootstrap/
│       └── Bootstrap.java            (Spring Boot启动类)
│
├── {business-domain}-interface/      (2. 表现层/适配器模块)
│   ├── pom.xml
│   └── src/main/java/com/moatkon/{business-domain}/interfaces/
│       ├── controller/                     (RESTful Controllers)
│       └── mq/                         (MQ Listeners)
│
├── {business-domain}-application/     (3. 应用层模块)
│   ├── pom.xml
│   └── src/main/java/com/moatkon/{business-domain}/application/
│       └── impl/                    (应用服务实现)
│
├── {business-domain}-sdk/           (4. 对外接口/契约模块)
│   ├── pom.xml
│   └── src/main/java/com/moatkon/{business-domain}/sdk/
│       ├── api/                        (供其他域调用的Feign/Dubbo接口)
│       ├── dto/                        (数据传输对象 DTO)
│       └── event/                       (领域事件定义)
│
├── {business-domain}-domain/        (5. 领域层模块)
│   ├── pom.xml
│   └── src/main/java/com/moatkon/{business-domain}/domain/
│       ├── aggregate/                 (聚合)
│       ├── service/                   (领域服务)
│       └── repository/                 (仓储接口)
│
└── {business-domain}-infrastructure/    (6. 基础设施层模块)
    ├── pom.xml
    └── src/main/java/com/moatkon/{business-domain}/infrastructure/
        ├── repository/               (持久化实现, 如JPA/MyBatis)
        └── external/                 (三方服务实现)

```

### **3.2 模块职责详解**

<table class="wrapped confluenceTable"><tbody><tr><td class="confluenceTd"><p><strong>模块名</strong></p></td><td class="confluenceTd"><p><strong>核心职责</strong></p></td><td class="confluenceTd"><p><strong>依赖关系</strong></p></td></tr><tr><td class="confluenceTd"><p><span>{business-domain}-bootstrap</span></p></td><td class="confluenceTd"><p><strong>应用启动入口 (Composition Root)</strong><span>。负责应用的启动、配置的组装和Bean的装配。这是应用的“main”函数所在。</span></p></td><td class="confluenceTd"><p><span>依赖所有其他模块（interface, application, infrastructure）</span></p></td></tr><tr><td class="confluenceTd"><p><span>{business-domain}-interface</span></p></td><td class="confluenceTd"><p><strong>表现层 (Presentation Layer)</strong><span>。处理外部输入，如RESTful API请求、MQ消息订阅等。它将外部请求适配到应用层。</span></p></td><td class="confluenceTd"><p><span>依赖 application</span></p></td></tr><tr><td class="confluenceTd"><p><span>{business-domain}-application</span></p></td><td class="confluenceTd"><p><strong>应用层 (Application Layer)</strong><span>。编排领域服务完成业务用例，管理事务、安全等横切关注点。</span><strong>不包含业务规则</strong><span>。</span></p></td><td class="confluenceTd"><p><span>依赖 domain 和 sdk (用于调用其他域)</span></p></td></tr><tr><td class="confluenceTd"><p><span>{business-domain}-sdk</span></p></td><td class="confluenceTd"><p><strong>跨域通信契约 (Anti-Corruption Layer)</strong><span>。定义对外暴露的能力，供其他业务域调用。</span><strong>这是团队间协作的边界</strong><span>。</span></p></td><td class="confluenceTd"><p><strong>不依赖任何其他内部模块</strong></p></td></tr><tr><td class="confluenceTd"><p><span>{business-domain}-domain</span></p></td><td class="confluenceTd"><p><strong>核心领域层 (Domain Layer)</strong><span>。包含所有业务逻辑、规则和状态。</span><strong>与技术框架完全解耦</strong><span>。</span></p></td><td class="confluenceTd"><p><strong>不依赖任何其他层</strong></p></td></tr><tr><td class="confluenceTd"><p><span>{business-domain}-infrastructure</span></p></td><td class="confluenceTd"><p><strong>基础设施层 (Infrastructure Layer)</strong><span>。提供技术实现，如数据库访问、消息发送等。</span></p></td><td class="confluenceTd"><p><span>依赖 domain (实现其接口) 和 sdk (契约)</span></p></td></tr></tbody></table>

## **4. 分层架构定义与依赖关系**

### **4.1 依赖规则**

1.  **单向依赖**：依赖关系严格单向。例如 interface 模块依赖 application 模块。
2.  **依赖倒置**：domain 层定义接口，infrastructure 层实现接口。应用层和表现层仅依赖于 domain 层的**抽象**。
3.  **启动模块 (bootstrap)**：作为应用的“粘合剂”，它依赖所有实现模块，以完成整个应用的组装和启动。
4.  **跨域依赖 (sdk)**：任何外部业务域 **必须且只能** 依赖本域的 sdk 模块来进行通信。

## **5. 命名与协作规范**

### **5.1 包名 (Package Name)**

com.moatkon.{business-domain}.{module-name-short}

**示例**:

- Controller: com.moatkon.archetype.interfaces
- 应用服务: com.moatkon.archetype.application
- 聚合根: com.moatkon.archetype.domain
- 对外API: com.moatkon.archetype.sdk

### **5.2 团队协作与集成**

- **契约(SDK)先行**: 在进行跨域功能开发前，提供方团队应先在 sdk 模块中定义好接口和DTO，并发布一个版本。
- **通信方式**:
    1. **同步调用**: 通过 sdk 模块定义的 Feign。
    2. **异步事件**: 在 sdk 模块中定义事件DTO，通过 infrastructure 层的MQ生产者发送。消费方在 interface 模块中创建MQ监听器。

## **6. 共享内核 (Shared Kernel)**

- 对于多域共享的核心模型（如UserId, Money），应建立独立的shared-kernel项目。
- shared-kernel 需严格评审。

例如: 订单侧的共享内核是order-framework项目,专注于订单内部共享。order-framework项目内部包含order-common、order-types等子module


## 感悟
- DDD的魅力在于代码纠错。前提是基于moudle构建的DDD服务,每个Module的代码都要物理隔离。发现一个功能实现不下去的时候，大概率是你写错module了
