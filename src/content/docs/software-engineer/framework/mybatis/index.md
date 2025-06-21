---
title: MyBatis
description: MyBatis
template: doc
lastUpdated: 2023-12-16 11:16:13
---
### MyBatis 的核心组件
> 有次面试被问到了<!-- 。真的,准备的再细致,只要拐一个方向就是盲区,因为压根不知道对方会从什么方面问起。 -->

- SqlSession: 表示与数据库交互的会话,完成对数据库的CURD功能。
- Executor: MyBatis执行器,调度核心,负责Mybatis的SQL语句生成和查询缓存的维护。
- StatementHandler: 封装了JDBC statement操作,负责对JDBC statement操作,如设置参数,将结果映射成集合。
- ParameterHandler: 负责将用户传递的参数转换成JDBC statement所需的参数。
- TypeHandler: 负责将Java类型和JDBC类型之间的映射和转换。
- MappedStatement: MappedStatement对象对应Mapper.xml配置文件中的一个select/update/insert/delete节点，描述的就是一条SQL语句。
- SqlSource: 负责根据用户传递的parametreObject动态生成SQL,将信息封装到BoundSQL对象并返回。
- BoundSql: 标识动态生成的SQL语句以及相应的参数信息。
- Configuration: Mybatis中所有的配置信息都存储在此处。

### MyBatis 原理
MyBatis 使用 JDK 的动态代理

![](/software-engineer/framework/mybatis/mybatis_life.png)
> 该图片来自互联网


1. sqlsessionFactoryBuilder生成sqlsessionFactory(单例)
2. 工厂模式生成sqlsession执行sql以及控制事务
3. Mybatis通过动态代理使Mapper(sql映射器)接口能运行起来,即为接口生成代理对象,将sql查询到结果映射成pojo


**sqlSessionFactory构建过程**:   
- 解析并读取配置中的xml创建Configuration对象 (单例)
- 使用Configruation类去创建sqlSessionFactory(builder模式)


### Mybatis一级缓存与二级缓存
#### 一级缓存
是指 SqlSession 级别的缓存

原理：使用的数据结构是一个 map，如果两次中间出现 commit 操作 (修改、添加、删除)，本 sqlsession 中的一级缓存区域全部清空

> 默认情况下一级缓存是开启的，而且是不能关闭的
<!-- 什么时候会失效?有修改、新增、删除操作后,会重新查库，不会使用Sqlssion中缓存的值 -->

最多缓存1024条SQL

>> STATEMENT: 只对当前执行的这一个Statement有效
>> 
>> 缺点: MyBatis的一级缓存最大范围是SqlSession内部，有多个SqlSession或者分布式的环境下，数据库写操作会引起脏数据，建议设定缓存级别为Statement。

#### 二级缓存(范围更广)
如果多个SqlSession之间需要共享缓存，则需要使用到二级缓存

二级缓存开启后，同一个namespace下的所有操作语句，都影响着同一个Cache，即二级缓存被多个SqlSession共享，是一个全局的变量。
当开启缓存后，数据的查询执行的流程就是 二级缓存 -> 一级缓存 -> 数据库。
> 有一个面试官说这个就是Mapper级别的缓存，也没有问题

二级缓存开启后速度快的原因是: 因为是Mapper级别的,A线程访问过会缓存下结果,如果B线程再次以同样的条件访问,就会使用缓存,就不会再去查库了

> 个人建议MyBatis缓存特性在生产环境中进行关闭，单纯作为一个ORM框架使用可能更为合适

Mapper 级别的缓存； 原理： 是通过 CacheExecutor 实现的。CacheExecutor其实是 Executor 的代理对象

<!-- ### Mybatis缓存
#### 一级缓存
SESSION(MyBatis默认是这个): SqlSession级别的缓存 -->




### MyBatis的设计模式
1. **建造者模式: SqlSessionFactoryBuilder**
2. **工厂模式: SqlSessionFactory**
3. **代理模式: MapperProxyFactory: MapperProxyFactory 的 newInstance() 方法就是生成一个具体的代理来实现某个功能**
5. **适配器模式: Mybatis的日志模块,可以支持slf4j、log4j等**
6. 单例模式: ErrorContext: ErrorContext是线程级别的的单例，每个线程中有一个此对象的单例，用于记录该线程的执行环境的错误信息。
7. 模板方法模式: BaseExecutor，在 MyBatis 中 BaseExecutor 实现了大部分SQL 执行的逻辑。
8. 装饰器(我理解的就是锦上添花)模式: Cache: Cache 除了有数据存储和缓存的基本功能外(由 PerpetualCache 永久缓存实现)，还有其他附加的 Cache 类，比如先进先出的 FifoCache、最近最少使用的 LruCache、防止多线程并发访问的 SynchronizedCache 等众多附加功能的缓存类


