---
title: IOC
description: IOC
template: doc
lastUpdated: 2023-12-20 09:54:44
---
**IoC 是 Spring 框架的基石，是 Spring 框架众多特性的基础**

在 IoC(Inversion of Control)模式中，对象之间的依赖关系被反转了，即由开发人员手动控制对象之间的依赖关系变为由容器自动注入依赖。这种反转的控制使得应用程序的各个模块之间解耦，提高了代码的灵活性、可维护性和可测试性。

IoC 的实现依赖于一个称为 IoC 容器的组件。IoC 容器负责创建和管理对象，以及解决对象之间的依赖关系。开发人员只需在配置文件(如 XML 配置文件)或使用注解方式中指定对象的依赖关系和其他配置细节，容器就会根据这些配置信息动态地实例化对象、注入依赖并管理对象的生命周期。

### IoC容器实现控制反转的方式
1. 依赖注入(Dependency Injection，DI)：依赖注入是 IoC 的一种具体实现方式，通过将依赖关系注入到对象中，实现了对象之间的解耦。**容器负责查找依赖对象，并将其自动注入到相应的对象中**。依赖注入可以通过构造函数、Setter 方法或接口注入来完成。在 Spring 框架中，依赖注入通过注解或 XML 配置文件来实现。
2. 依赖查找(Dependency Lookup)：依赖查找是另一种 IoC 的实现方式，它通过容器提供的 API，开发人员手动查找和获取所需的依赖对象。开发人员在代码中通过容器提供的接口来获取所需的对象实例，从而实现了对象之间的解耦。在 Spring 框架中，依赖查找通过 ApplicationContext 接口的 getBean() 方法来实现。


### DI实现的原理
DI 的实现原理是通过**反射机制**实现的。在 Spring 框架中，当容器创建一个对象时，它会检查该对象的依赖关系，并使用反射机制查找依赖对象。然后，容器将依赖对象注入到该对象中。

具体来说，当使用 @Autowired 注释时，Spring 容器会自动查找与该类型匹配的 bean，并将其注入到该字段中。如果有多个匹配的 bean，则可以使用 @Qualifier 注释来指定要注入的 bean 的名称。


### Spring IOC初始化流程
- resource**定位**: 即寻找用户定义的bean资源，由 ResourceLoader通过统一的接口Resource接口来完成
- beanDefinition**载入**: BeanDefinitionReader读取、解析Resource定位的资源成BeanDefinition 载入到ioc中(通过HashMap进行维护BD)
- BeanDefinition**注册**: 即向IOC容器注册这些BeanDefinition， 通过BeanDefinitionRegistery实现

![](/software-engineer/framework/spring/spring_ioc_init.png)
> 该图片来自互联网


### Spring DI依赖注入流程(实例化，处理Bean之间的依赖关系)
#### 时机
过程在Ioc初始化后，依赖注入的过程是用户第一次向IoC容器索要Bean时触发

#### 流程
- 如果设置lazy-init=true，会在第一次getBean的时候才初始化bean， lazy-init=false，会容器启动的时候直接初始化(singleton bean)
- 调用BeanFactory.getBean() 生成bean的
- 生成bean过程运用装饰器模式产生的bean都是beanWrapper(bean的增强)

#### 依赖注入怎么处理bean之间的依赖关系?
其实就是通过在beanDefinition载入时，如果bean有依赖关系，通过**占位符**来代替，在调用getBean时候，如果遇到占位符，从ioc里获取bean注入到本实例来

### @Autowired 和 @Resource 的区别
- @Autowired 是 Spring 定义的注解，而 @Resource 是 Java 定义的注解，它来自于 JSR-250(Java 250 规范提案)。
- @Autowired 是先根据类型(byType)查找，如果存在多个 Bean 再根据名称(byName)进行查找;@Resource 是先根据名称查找，如果(根据名称)查找不到，再根据类型进行查找
- 参数差异大。@Autowired 只支持设置一个 required 的参数，而 @Resource 支持 7 个参数(name,lookup,type,description等)
- @Autowired 支持属性注入、 Setter 注入和**构造方法注入**，而 @Resource 只支持属性注入和 Setter 注入