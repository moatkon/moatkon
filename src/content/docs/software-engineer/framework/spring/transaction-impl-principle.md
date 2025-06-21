---
title: Spring事务的实现原理
description: Spring事务的实现原理
template: doc
lastUpdated: 2023-12-19 14:45:10
---
### 事务的基本原理
Spring事务的本质就是数据库对事务的支持，如果数据库没有事务,那Spring的事务就无从说起

对于纯JDBC操作数据库，如果要用到事务，可以按照以下步骤进行:
```txt ins="2. 开启事务con.setAutoCommit(true/false);" ins="4. 提交事务/回滚事务 con.commit() / con.rollback();"
1. 获取连接 Connection con = DriverManager.getConnection()
2. 开启事务con.setAutoCommit(true/false);
3. 执行CRUD
4. 提交事务/回滚事务 con.commit() / con.rollback();
5. 关闭连接 conn.close();
```

使用Spring的事务管理功能后，我们可以不再写步骤 `2` 和 `4` 的代码，而是由Spring来完成。

### Spring事务原理
@Transactional基于Spring AOP实现

### Spring事务管理方式
- 编码式事务管理：将事务控制代码编写在业务代码之中。
- 声明式事务管理：基于AOP(面向切面编程)，事务管理与业务逻辑解耦。声明式事务管理的两种实现：
  - 在配置文件(xml)中配置
  - 基于@Transactional注解

### Spring的事务传播机制
Spring事务的传播机制说的是，当多个事务同时存在的时候，Spring如何处理这些事务的行为。事务传播机制实际上是使用简单的ThreadLocal实现的，所以，如果调用的方法是在新线程调用的，事务传播实际上是会失效的。

1. **PROPAGATION_REQUIRED**：（默认传播行为）如果当前没有事务，就创建一个新事务；如果当前存在事务，就加入该事务
2. **PROPAGATION_REQUIRES_NEW**：无论当前存不存在事务，都创建新事务进行执行
3. PROPAGATION_SUPPORTS：如果当前存在事务，就加入该事务；如果当前不存在事务，就以非事务执行
4. PROPAGATION_NOT_SUPPORTED：以非事务方式执行操作，如果当前存在事务，就把当前事务挂起
5. PROPAGATION_NESTED：如果当前存在事务，则在嵌套事务内执行；如果当前没有事务，则按REQUIRED属性执行
6. PROPAGATION_MANDATORY：如果当前存在事务，就加入该事务；如果当前不存在事务，就抛出异常
7. PROPAGATION_NEVER：以非事务方式执行，如果当前存在事务，则抛出异常

### Spring中的隔离级别
1. ISOLATION_DEFAULT：这是个 PlatfromTransactionManager 默认的隔离级别，使用数据库默认的事务隔离级别
2. ISOLATION_READ_UNCOMMITTED：读未提交，允许事务在执行过程中，读取其他事务未提交的数据
3. ISOLATION_READ_COMMITTED：读已提交，允许事务在执行过程中，读取其他事务已经提交的数据
4. ISOLATION_REPEATABLE_READ：可重复读，在同一个事务内，任意时刻的查询结果都是一致的
5. ISOLATION_SERIALIZABLE：所有事务逐个依次执行


### 在Spring中设置
```java
@Transactional(propagation = Propagation.REQUIRES_NEW, 
isolation = Isolation.READ_UNCOMMITTED)
```