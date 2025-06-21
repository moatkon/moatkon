---
title: Spring
description: Spring
template: doc
lastUpdated: 2023-12-20 23:08:20
---
### Spring 有哪些模块
- Spring Core: 框架的最基础部分，提供 IoC 容器，对 bean 进行管理。
- Spring Context: 继承BeanFactory，提供上下文信息，扩展出JNDI、EJB、电子邮件、国际化等功能。
- Spring DAO: 提供了JDBC的抽象层，还提供了声明性事务管理方法
- Spring ORM: 提供了JPA、JDO、Hibernate、MyBatis 等ORM映射层.
- Spring AOP: 集成了所有AOP功能
- Spring Web: 提供了基础的 Web 开发的上下文信息，现有的Web框架，如JSF、Tapestry、Structs等，提供了集成
- Spring Web MVC: 提供了 Web 应用的 Model-View-Controller 全功能实现。

### Spring Bean定义了哪5中作用域
- singleton(单例): singleton 是 Spring 中默认的 Bean 作用域，它表示在整个应用程序中只存在一个 Bean 实例。每次请求该 Bean 时，都会返回同一个实例。
- prototype: 表示每次请求该 Bean 时都会创建一个新的实例。每个实例都有自己的属性值和状态，因此它们之间是相互独立的。
- request: 表示在一次 HTTP 请求中只存在一个 Bean 实例。在同一个请求中，多次请求该 Bean 时都会返回同一个实例。不同的请求之间，该 Bean 的实例是相互独立的。
- session: 表示在一个 HTTP Session 中只存在一个 Bean 实例。在同一个 Session 中，多次请求该 Bean 时都会返回同一个实例。不同的 Session 之间，该 Bean 的实例是相互独立的。
- application: 表示在一个 ServletContext 中只存在一个 Bean 实例。该作用域只在 Spring ApplicationContext 上下文中有效。
- websocket: 表示在一个 WebSocket 中只存在一个 Bean 实例。该作用域只在 Spring ApplicationContext 上下文中有效。

##### 关于Spring默认的singleton单例作用域
- 大部分时候我们并没有在项目中使用多线程，所以很少有人会关注这个问题。单例 bean 存在线程问题，主要是因为当多个线程操作同一个对象的时候是存在资源竞争的。
- Spring的Controller默认是单例的，不要使用非静态的成员变量，否则会发生数据逻辑混乱。是因为单例所以不是线程安全的。
    > **解决方案:**
    > 1. 不要在controller中定义成员变量。
    > 2. 万一必须要定义一个非静态成员变量时候，则通过注解@Scope(“prototype”)，将其设置为多例模式。
    > 3. 在Controller中使用ThreadLocal变量

##### 单例的bean是线程安全的吗?
无状态的单例 Bean 是线程安全的，而有状态的单例 Bean 是非线程安全的，所以总的来说单例 Bean 还是非线程安全的。

有状态的 Bean 是指 Bean 中包含了状态，比如成员变量，而无状态的 Bean 是指 Bean 中不包含状态，比如没有成员变量，或者成员变量都是 final 的。


**如何保证单例bean的线程安全?**
- 变为原型 Bean：在 Bean 上添加 @Scope("prototype") 注解，将其变为多例 Bean。这样每次注入时返回一个新的实例，避免竞争。
- 加锁：在 Bean 中对需要同步的方法或代码块添加同步锁 @Synchronized 或使用 Java 中的线程同步工具 ReentrantLock 等。
- 使用线程安全的集合：如 Vector、Hashtable 代替 ArrayList、HashMap 等非线程安全集合。
- 变为无状态 Bean：不在 Bean 中保存状态，让 Bean 成为无状态 Bean。无状态的 Bean 没有共享变量，自然也无须考虑线程安全问题。使用线程局部变量 ThreadLocal：在方法内部使用线程局部变量 ThreadLocal，因为 ThreadLocal 是线程独享的，所以也不存在线程安全问题。

### Spring如解决Bean循环依赖问题?
#### 怎么检测是否存在循环依赖?
Bean在创建的时候可以给该Bean打标，如果递归调用回来发现正在创建中的话，即说明了循环依赖了

#### Spring中循环依赖场景有
- 构造器的循环依赖
- 属性的循环依赖

#### Spring Bean 缓存
- singletonObjects: 第一级缓存，里面放置的是实例化好的单例对象；
- earlySingletonObjects: 第二级缓存，里面存放的是提前曝光的单例对象；
- singletonFactories: 第三级缓存，里面存放的是要被实例化的对象的对象工厂

#### 解决过程
创建bean的时候Spring首先从一级缓存singletonObjects中获取。如果获取不到，并且对象正在创建中，就再从二级缓存earlySingletonObjects中获取，如果还是获取不到就从三级缓存singletonFactories中取(Bean调用构造函数进行实例化后，即使属性还未填充，就可以通过三级缓存向外提前暴露依赖的引用值(提前曝光)，根据对象引用能定位到堆中的对象，其原理是基于Java的引用传递)，取到后从三级缓存移动到了二级缓存完全初始化之后将自己放入到一级缓存中供其他使用.

> 因为加入singletonFactories三级缓存的前提是执行了构造器，<span style="color:red">所以构造器的循环依赖没法解决</span>。
> 
> 构造器循环依赖解决办法：在构造函数中使用@Lazy注解延迟加载。在注入依赖时，先注入代理对象，当首次使用时再创建对象。

:::tip
局限性: Spring默认的Bean Scope是单例的，而三级缓存中都包含singleton，可见是对于单例Bean之间的循环依赖的解决，Spring是通过三级缓存来实现的

但是这也仅仅是解决了单例Bean的循环依赖，多例情况下，还是会有问题
:::

### Bean的生命周期?(创建Bean的过程)

![](/software-engineer/drawio/Moatkon-CreateBeanProcess.drawio.svg)

1. **实例化Bean： Ioc容器通过获取BeanDefinition对象中的信息进行实例化，实例化对象被包装在BeanWrapper对象中**
2. **设置对象属性(DI)：通过BeanWrapper提供的设置属性的接口完成属性依赖注入**
3. 注入Aware接口：Spring会检测该对象是否实现了xxxAware接口，并将相关的xxxAware实例注入给bean
4. BeanPostProcessor：自定义的处理(分前置处理和后置处理)
5. **InitializingBean和init-method：执行我们自己定义的初始化方法**
6. **使用**
7. **destroy：bean的销毁**

### Spring 中使用了哪些设计模式？
- 工厂模式: spring中的BeanFactory就是简单工厂模式的体现，根据传入唯一的标识来获得bean对象；
- 观察者模式: spring中Observer模式常用的地方是listener的实现。如ApplicationListener。
- 代理模式: AOP功能的原理就使用代理模式。
    1. JDK动态代理
    2. CGLib字节码生成技术代理
- 单例模式: 提供了全局的访问点BeanFactory；
- 装饰器模式: 依赖注入就需要使用BeanWrapper
- 策略模式: Bean的实例化的时候决定采用何种方式初始化bean实例(反射或者CGLIB动态字节码生成)
- 模板方法模式: Spring 中 jdbcTemplate、hibernateTemplate 等以 Template 结尾的对数据库操作的类，它们就使用到了模板模式

### SpringMVC
**处理请求的流程**
1. 用户请求发送给DispatcherServlet，DispatcherServlet调用HandlerMapping处理器映射器；
2. HandlerMapping根据xml或注解找到对应的处理器，生成处理器对象返回给DispatcherServlet；
3. DispatcherServlet会调用相应的HandlerAdapter；
4. HandlerAdapter经过适配调用具体的处理器去处理请求，生成ModelAndView返回给DispatcherServlet
5. DispatcherServlet将ModelAndView传给ViewReslover解析生成View返回给DispatcherServlet；
6. DispatcherServlet根据View进行渲染视图；


### SpringBoot
#### 启动流程
- new SpringApplication对象，利用spi机制加载applicationContextInitializer，applicationListener接口实例(META-INF/spring.factories)；
  > Spring的SPI(Service Provider Interface)机制是一种用于实现扩展点的机制，允许开发者在不修改核心代码的情况下添加自定义实现或插件。SPI机制常用于模块化和扩展化的设计，让应用更加灵活和可扩展。
- 调run方法准备Environment，加载应用上下文(applicationContext)，发布事件 很多通过listener实现
- 创建spring容器， refreshContext() ，实现starter自动化配置，spring.factories文件加载， bean实例化

#### SpringBoot自动配置的原理
- @EnableAutoConfiguration找到META-INF/spring.factories(需要创建的bean在里面)配置文件
- 读取每个starter中的spring.factories文件

#### Spring Boot 的核心注解
@SpringBootApplication,由以下三种组成
- @SpringBootConfiguration：组合了 @Configuration 注解，实现配置文件的功能。
- @EnableAutoConfiguration：打开自动配置的功能。
- @ComponentScan：Spring组件扫描。

#### Spring Boot 的核心配置文件
- application.yml 一般用来定义单个应用级别的，如果搭配 spring-cloud-config 使用
- bootstrap.yml(先加载) 系统级别的一些参数配置，这些参数一般是不变的

#### SpringBoot 自动装配原理
1. 什么是 SpringBoot 自动装配？
    SpringBoot 定义了一套接口规范，这套规范规定：SpringBoot 在启动时会扫描外部引用 jar 包中的META-INF/spring.factories文件，将文件中配置的类型信息加载到 Spring 容器(此处涉及到 JVM 类加载机制与 Spring 的容器知识)，并执行类中定义的各种操作。对于外部 jar 来说，只需要按照 SpringBoot 定义的标准，就能将自己的功能装置进 SpringBoot。

2. SpringBoot 是如何实现自动装配的？

    @EnableAutoConfiguration:实现自动装配的核心注解。

    AutoConfigurationImportSelector:加载自动装配类

    AutoConfigurationImportSelector 类实现了 ImportSelector接口，也就实现了这个接口中的 selectImports方法，该方法主要用于获取所有符合条件的类的全限定类名，这些类需要被加载到 IoC 容器中。

