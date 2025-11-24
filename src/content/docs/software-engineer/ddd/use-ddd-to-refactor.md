---
title: 使用DDD来重构现有系统
description: 使用DDD来重构现有系统
template: doc
lastUpdated: 2025-11-24 14:40:23
draft: false
---
#### 在使用DDD重构现有业务时,适合在在聚合根中调用Service方法来获取值吗?

这是一个很好的问题。在使用领域驱动设计(DDD)重构现有业务时,是否应该在聚合根中调用Service方法来获取值,需要谨慎考虑。

一般来说,不推荐在聚合根中直接调用Service方法。原因如下:

1. 违反职责单一原则:聚合根应该专注于维护自身的一致性和不变性,而不是依赖外部服务。
2. 增加耦合:这样做会使聚合根与特定的服务实现耦合,降低了聚合根的独立性和可测试性。
3. 可能破坏领域模型的完整性:如果聚合根需要频繁调用外部服务获取数据,可能意味着当前的领域模型设计不够完善。

然而,在某些特殊情况下,可能确实需要在聚合根中获取外部数据。这时,可以考虑以下替代方案:

1. 依赖注入:通过构造函数将所需的服务注入聚合根,而不是直接在聚合根中调用服务方法。
2. 领域服务:如果某个操作涉及多个聚合,可以创建一个专门的领域服务来协调这些操作。
3. 事件驱动:使用领域事件来触发需要外部数据的操作,而不是在聚合根中直接获取。
4. 延迟加载:如果可能,考虑使用延迟加载策略,只在真正需要时才获取外部数据。
5. 重新审视边界:如果发现经常需要跨边界获取数据,可能需要重新考虑当前的领域边界划分是否合理。

总的来说,应该尽量保持聚合根的独立性和内聚性。如果确实需要在聚合根中获取外部数据,建议仔细评估替代方案,选择最适合你的特定场景的解决方法。

#### 基于DDD架构的项目提供查询接口时,返回参数适合使用DP对象吗?
不适合,如果DP对象中含有枚举,则在提供方新增枚举值且使用方未升级相关SDK时,则使用方会报错,解析异常。
特别是提供的SDK有多个使用方时,及时有的使用方不需要使用新的枚举,也要被迫升级。除非使用方自己解析,不依赖接口提供方的SDK

如果使用方要依赖提供方的SDK,建议SDK对象使用普通的POJO,更具通用性


#### 在构建聚合根的工厂类中,可以调用Repository方法吗?

结论先说：

> **不建议在 `AfterSaleAggregateFactory.create()` 内直接调用 `AfterSaleRepository` 或其他 Repository 去查数据库。**
> 如果确实需要外部数据来构建聚合根，**应该由 Application Service 查询好数据，组装必要的数据，再交给 Factory 构建聚合根**。

---

##### 🧠 原因（DDD 原则）

| 原则                               | 说明                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------- |
| **领域层不依赖基础设施层**                  | Factory 在 domain 层，Repository 实现一般在 infrastructure，Factory 调 Repository 会导致依赖反转错误 |
| **Factory 负责纯领域构建，不做外部 I/O**     | 一旦 Factory 查 DB，它就变成应用/基础设施逻辑                                                     |
| **Application Service 是业务流程编排者** | 应用层负责查询外部信息、准备上下文数据                                                               |

---

##### 🔧 正确做法：在 Application 层查数据，再交给 Factory

###### Application 层

```java
public void createAfterSale(AfterSaleCreateCommand command) {

    // 查询订单数据（或其它聚合）
    OrderAggregate order = orderRepository.findById(command.getOrderId());

    // Application 层决定要哪些数据用于构建售后聚合
    List<OrderItem> items = order.getItems();

    // 使用 Factory 构建聚合根，传递构建所需完整信息（不是只传 Command）
    AfterSaleAggregate aggregate = AfterSaleAggregateFactory.create(command, items);

    afterSaleRepository.save(aggregate);
}
```

---

###### Factory（纯构建）

```java
public class AfterSaleAggregateFactory {

    public static AfterSaleAggregate create(
        AfterSaleCreateCommand cmd,
        List<OrderItem> orderItems
    ) {
        // 领域不变量校验
        if (orderItems.isEmpty()) {
            throw new DomainException("订单明细不能为空");
        }

        AfterSaleAggregate aggregate = new AfterSaleAggregate(
            cmd.getAfterSaleId(),
            cmd.getOrderId(),
            AfterSaleStatus.APPLIED
        );

        // 根据订单明细构建聚合内部结构
        for (OrderItem item : orderItems) {
            aggregate.addItem(item.getSkuId(), item.getQuantity());
        }

        return aggregate;
    }
}
```

---

##### ❓ 为什么不能让 Factory 查数据库？

###### 如果 Factory 内部写：

```java
orderRepository.findById(orderId)
```

将造成：

| 问题                                   | 结果               |
| ------------------------------------ | ---------------- |
| 违反 DDD 分层依赖（domain → infrastructure） | 项目结构混乱、无法测试、循环依赖 |
| Factory 变成应用逻辑而不是领域逻辑                | 职责污染             |
| 聚合根构造无法单元测试                          | 构造会依赖数据库         |

---

##### 🧱 正确的 DDD 责任边界

```
Controller
    -> Application Service (查数据 + 调用 Factory)
        -> Factory (构建聚合 root)
            -> Aggregate (执行业务)
        -> Repository.save()
```

---

##### 📌 总结
|||
| ------------------------------------ | ---------------- |
| 能不能在 Factory 调 Repository 查数据？ | ❌ 不可以 |
| 应该在哪里查？ | ✔ Application Service |
| Factory 接收哪些参数？ | ✔ 构建聚合所需完整信息，而不是只传 Command |

---

##### ⭐ 推荐扩展实践

有时查询数据比较复杂，可以在 Application 层创建专用的：

* **DomainPreparationService**
* **DomainAssembler**

例如：

```java
OrderContext context = orderContextService.loadOrderContext(command.getOrderId());
AfterSaleAggregate aggregate = AfterSaleAggregateFactory.create(command, context);
```

---

如果你需要，我可以提供：

* 带 `OrderContext` 的完整示例
* 支持领域事件的版本
* CQRS 场景下的构建方案
