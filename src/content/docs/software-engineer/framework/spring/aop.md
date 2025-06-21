---
title: AOP
description: AOP
template: doc
lastUpdated: 2024-02-03 20:09:27
---
### AOP实现的原理
Spring AOP 的实现原理是基于动态代理和字节码操作的。

在编译时， Spring 会使用 AspectJ 编译器将切面代码编译成字节码文件。在运行时， Spring 会使用 Java 动态代理或 CGLIB 代理生成代理类，这些代理类会在目标对象方法执行前后插入切面代码，从而实现AOP的功能。

### JDK动态代理、CGLIB代理
当bean的实现中存在接口或者是Proxy的子类，使用jdk动态代理；不存在接口，spring会采用CGLIB来生成代理对象

**JDK 动态代理主要涉及到 java.lang.reflect 包中的两个类：Proxy 和 InvocationHandler**
- 通过bind方法建立代理与真实对象关系，通过Proxy.newProxyInstance(target)生成代理对象
- 代理对象通过反射invoke方法实现调用真实对象的方法

**Proxy 利用 InvocationHandler(定义横切逻辑) 接口动态创建 目标类的代理对象**
:::note
##### 动态代理与静态代理区别
静态代理，程序运行前代理类的.class文件就存在了；
动态代理：在程序运行时利用反射动态创建代理对象

##### CGLIB与JDK动态代理区别
Jdk动态代理必须提供接口才能使用;
CGLIB不需要，只要一个非抽象类就能实现动态代理

故CGLIB的适用范围更广
:::


### AOP源码分析
- `@EnableAspectJAutoProxy`给容器(beanFactory)中注册一个AnnotationAwareAspectJAutoProxyCreator对象；
- AnnotationAwareAspectJAutoProxyCreator对目标对象进行代理对象的创建，对象内部，是封装JDK和CGlib两个技术，实现动态代理对象创建的(创建代理对象过程中，会先创建一个代理工厂，获取到所有的增强器(通知方法)，将这些增强器和目标类注入代理工厂，再用代理工厂创建对象)；
- 代理对象执行目标方法，得到目标方法的拦截器链，利用拦截器的链式机制，依次进入每一个拦截器进行执行

### AOP核心概念
- 切面(aspect): 类是对物体特征的抽象，切面就是对横切关注点的抽象
- 横切关注点：对哪些方法进行拦截，拦截后怎么处理，这些关注点称之为横切关注点
- 连接点(joinpoint): 被拦截到的点，因为 Spring 只支持方法类型的连接点，所以在Spring 中连接点指的就是被拦截到的方法，实际上连接点还可以是字段或者构造器
- 切入点(pointcut): 对连接点进行拦截的定义
- 通知(advice): 所谓通知指的就是指拦截到连接点之后要执行的代码，通知分为前置、后置、异常、最终、环绕通知五类。
- 目标对象：代理的目标对象
- 织入(weave): 将切面应用到目标对象并导致代理对象创建的过程
- 引入(introduction): 在不修改代码的前提下，引入可以在运行期为类动态地添加方法或字段



### AOP应用场景
- 记录日志
- 监控性能
- 权限控制
- 事务管理
- 线程池关闭等

### 注意事项
从Spring5.2.x开始，Spring AOP不再严格按照AspectJ定义的规则来执行advice，而是根据其类型按照从高到低的优先级进行执行：@Around，@Before ，@After，@AfterReturning，@AfterThrowing

因为未指定顺序,所以比较切面类的字符串`str1.compareTo(str2)`。

所以在实际开发中,建议显式的指定好顺序

### 最佳实践
[自定义注解实现限流](/software-engineer/best-practices/custom-annotations-to-limit-and-downgrade/)
