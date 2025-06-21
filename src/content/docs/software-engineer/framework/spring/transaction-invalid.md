---
title: Spring事务什么场景下会失效
description: Spring事务什么场景下会失效
template: doc
lastUpdated: 2023-12-23 10:26:40
---
1. 访问权限问题。访问权限是private、default或protected的话，spring则不会提供事务功能。只有public方法才会提供事务
2. 方法用final修饰。
    1. 如果你看过spring事务的源码，可能会知道spring事务底层使用了aop，也就是通过jdk动态代理或者cglib，帮我们生成了代理类，在代理类中实现的事务功能。但如果某个方法用final修饰了，那么在它的代理类中，就无法重写该方法，而添加事务功能。
	2. 如果某个方法是static的，同样无法通过动态代理，变成事务方法
3. 方法内部调用。<span style="color:red">在普通方法A中，调用事务方法B，因为**这种方法直接调用了this对象的方法**(面试有被问到过*2)，没有走spring代理</span> [分析及解决](#针对第3点的分析及解决)
4. 未被spring管理
5. 多线程调用
	- 不在同一个线程中，获取到的数据库连接不一样，从而是两个不同的事务
	- spring的事务是通过数据库连接来实现的。当前线程中保存了一个map，key是数据源，value是数据库连接
	- 我们说的同一个事务，其实是指同一个数据库连接，只有拥有同一个数据库连接才能同时提交和回滚。如果在不同的线程，拿到的数据库连接肯定是不一样的，所以是不同的事务。
6. 表不支持事务
7. 未开启事务
8. 错误的传播特性
9.  自己吞了异常
10. 手动抛了别的异常
11. 自定义了回滚异常
12. 嵌套事务回滚多了
13. 大事务问题。解决方案可以使用TransactionTemplate编程式事务

#### 针对第3点的分析及解决
Spring默认的是PROPAGATION_REQUIRED机制,如果方法A标注了注解@Transactional 是完全没问题的,执行的时候传播给方法B,因为方法A开启了事务,线程内的connection的属性autoCommit=false,并且执行到方法B时,事务传播依然是生效的,得到的还是方法A的connection,autoCommit还是为false,所以事务生效;反之,如果方法A没有注解@Transactional 时,是不受事务管理的,autoCommit=true,那么传播给方法B的也为true,执行完自动提交,即使B标注了@Transactional。

Spring在扫描bean的时候会扫描方法上是否包含@Transactional注解，如果包含，spring会为这个bean动态地生成一个子类（即代理类，proxy），代理类是继承原来那个bean的。此时，当这个有注解的方法被调用的时候，实际上是由代理类来调用的，代理类在调用之前就会启动transaction。然而，如果这个有注解的方法是被同一个类中的其他方法调用的，那么该方法的调用并没有通过代理类，而是直接通过原来的那个bean，所以就不会启动transaction，我们看到的现象就是@Transactional注解无效。

##### 具体解决
就是根据分析的原因来具体解决
1. 把方法B抽离到另外一个ServiceC中去,并且在这个Service中注入ServiceC,使用ServiceC调用方法B
2. 通过在方法内部获得当前类代理对象的方式,通过代理对象调用方法B
   1. 使用 ApplicationContext 上下文对象获取该对象
   2. 使用 AopContext.currentProxy() 获取代理对象,但是需要配置exposeProxy=true。
      ```sh
	  @EnableAspectJAutoProxy(exposeProxy = true)
	  ```
