---
title: ReentrantLock
description: ReentrantLock
template: doc
lastUpdated: 2024-03-22 22:20:17
---
### ReentrantLock原理(CAS+AQS)
![](/software-engineer/drawio/Moatkon-ReentrantLock.drawio.svg)

```java
public ReentrantLock() {
   sync = new NonfairSync(); // 默认是非公平锁
}
```

#### CAS+AQS队列来实现
1. 先通过CAS尝试获取锁， 如果此时已经有线程占据了锁，那就加入AQS队列并且被挂起
2. 当锁被释放之后， 排在**队首**的线程会被唤醒,通过CAS再次尝试获取锁
   - 如果是非公平锁， 同时还有另一个线程进来尝试获取,那么很有可能会让这个线程抢到锁
   - 如果是公平锁， 会排到**队尾**，由队首的线程获取到锁
3. AQS使用一个volatile的int类型的成员变量来表示同步状态，通过内置的FIFO队列来完成资源获取的排队工作，通过CAS完成对state值的修改。
   > ![](/software-engineer/drawio/Moatkon-CLH_variant_queue.drawio.svg)

#### CAS
##### 原理
内存值V，旧的预期值A，要修改的新值B，当A=V时，将内存值修改为B，否则什么都不做；
##### 缺点
1. ABA问题。加一个版本号即可解决ABA问题
2. 如果CAS失败，自旋会给CPU带来压力
3. 只能保证对一个变量的原子性操作，i++这种是不能保证的

### CAS在java中的应用
Atomic系列

### ReentrantLock如何实现可重入性?
内部自定义了同步器 Sync，加锁的时候通过CAS 算法 ，将线程对象放到一个双向链表中，每次获取锁的时候 ，看下**当前维护的那个线程ID和当前请求的线程ID是否一样**，一样就可重入了；

### ReentrantLock如何避免死锁?
- 响应中断lockInterruptibly()
- 可轮询锁tryLock()
- 定时锁tryLock(long time),超时会自动释放

### ReentrantLock与synchronized区别
- 都是可重入锁； ReentrantLock是显示获取和释放锁，synchronized是隐式；
- ReentrantLock更灵活可以知道有没有成功获取锁，可以定义读写锁，是api级别，synchronized是JVM级别；
- ReentrantLock可以定义公平锁；Lock是接口，synchronized是java中的关键字

| 特性 | ReentrantLock | synchronized |
|---|---|---|
| **锁实现机制** | 依赖AQS | 监视器模式 |
| **灵活性** | 支持响应中断、超时、尝试获取锁 | 不灵活 |
| **释放形式** | 必须显示调用unlock()释放锁 | 自动释放监视器 |
| **锁类型** | 公平锁&非公平锁 | 非公平锁 |
| **条件队列** | 可关联多个条件队列 | 关联一个条件队列 |
| **可重入性** | 可重入 | 可重入 |