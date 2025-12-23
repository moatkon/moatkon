---
title: 模块解耦和依赖管理
description: 模块解耦和依赖管理
template: doc
lastUpdated: 20254-12-23 14:52:00
---

# 实际场景

开发时,会涉及多个项目,现在遇到了一个问题，就是A项目里面自己的common模块,在common模块里面有Spring的配置类Bean、切面类Bean等,同时还有一些枚举。现在我有一个项目B,需要用到项目A里面common模块中的枚举类,但是因为里面有一些Bean,会破坏项目B。虽然可以通过包扫描限制或者包排除排点，但是因为项目B无法感知项目A的变动，不知道哪天就又被破坏了。


# 解决方案

所以，我的想法是，将common模块拆开，与Spring有关的拆为common-bean,与Spring无关的拆为common-types,这样项目B就可以引用common-types了，而不会被common-bean所影响，项目B也彻底摆脱了项目A的变动带来的影响。

---


# 上面的内容,使用Claude润色一下

你的想法非常好！这是一个典型的**模块解耦和依赖管理**问题，你提出的拆分方案是合理的最佳实践。让我帮你梳理一下：

## 你的方案优势

**1. 职责分离明确**
- `common-types`: 纯POJO、枚举、常量等基础类型，无框架依赖
- `common-bean`: Spring配置类、切面、Bean定义等框架相关代码

**2. 依赖关系清晰**
```
项目A → common-bean → common-types
项目B → common-types (轻量级依赖)
```

**3. 避免依赖污染**
- 项目B不会意外引入Spring Bean导致配置冲突
- 减少传递依赖，降低jar包体积
- 解决你提到的"被动破坏"问题

## 实施建议

### 1. 模块划分参考
```
common/
├── common-types/          # 基础类型模块
│   ├── enums/            # 枚举类
│   ├── constants/        # 常量类
│   ├── dto/              # 数据传输对象
│   └── exception/        # 自定义异常(可选)
│
├── common-bean/          # Spring相关模块
│   ├── config/           # 配置类
│   ├── aspect/           # 切面类
│   └── autoconfigure/    # 自动配置
│
└── common-util/          # 工具类模块(可选)
    └── utils/            # 纯工具方法,无框架依赖
```

### 2. Maven依赖配置示例

**common-types/pom.xml** - 零依赖或最小依赖
```xml
<dependencies>
    <!-- 仅保留必要的基础依赖,如lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <scope>provided</scope>
    </dependency>
</dependencies>
```

**common-bean/pom.xml** - 依赖common-types
```xml
<dependencies>
    <dependency>
        <groupId>your.group</groupId>
        <artifactId>common-types</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-aop</artifactId>
    </dependency>
</dependencies>
```

### 3. 进一步优化建议

**使用Spring Boot自动配置机制**
```java
// common-bean中提供自动配置
@Configuration
@ConditionalOnClass(name = "org.springframework.context.ApplicationContext")
public class CommonAutoConfiguration {
    // 配置Bean
}
```

**提供可选依赖标记**
```xml
<!-- 在common-bean的pom.xml中 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
    <optional>true</optional>  <!-- 标记为可选 -->
</dependency>
```

### 4. 版本管理策略

使用父POM统一管理版本：
```xml
<parent>
    <groupId>your.group</groupId>
    <artifactId>common-parent</artifactId>
    <version>1.0.0</version>
</parent>
```

## 潜在注意事项

1. **循环依赖风险**: 确保common-types不反向依赖common-bean
2. **版本同步**: 建议common-types和common-bean使用相同版本号发布
3. **文档说明**: 为每个模块编写清晰的README，说明使用场景
4. **迁移成本**: 需要评估现有代码的改造工作量

## 总结

你的拆分思路完全正确，这是**微服务和模块化开发的标准做法**。这种设计：
- ✅ 符合单一职责原则
- ✅ 降低耦合度
- ✅ 提高代码复用性
- ✅ 便于独立演进

建议尽快实施，长远来看会大大降低维护成本。如果团队规模较大，还可以考虑建立**内部依赖管理规范**，统一管理这类common模块。