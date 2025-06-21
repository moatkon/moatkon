---
title: AQS
description: AQS
template: doc
lastUpdated: 2024-03-22 22:20:17
---
Java中的大部分同步类(Lock、Semaphore、ReentrantLock等)都是基于AbstractQueuedSynchronizer(简称为AQS)实现的。

AQS是一种提供了原子式管理同步状态、阻塞和唤醒线程功能以及队列模型的简单框架。

### AQS原理
##### 总结: `volatile int state` + CLH + CAS

AQS核心思想是，**如果被请求的共享资源空闲，那么就将当前请求资源的线程设置为有效的工作线程，将共享资源设置为锁定状态**；如果共享资源被占用，就需要一定的**阻塞等待唤醒机制**来保证锁分配。这个机制主要用的是CLH队列的变体，即**虚拟双向队列**来实现的，**将暂时获取不到锁的线程加入到队列中**。


AQS内部维护了一个同步队列,即CLH队列，用于管理同步状态。
- 当线程获取同步状态失败时，就会将当前线程以及等待状态等信息构造成一个 Node 节点，将其加入到同步队列中**尾部**，阻塞该线程；
- 当同步状态被释放时，会唤醒同步队列中**首节点**的线程获取同步状态。

AQS使用一个volatile的int类型的成员变量state来表示同步状态(锁竞争状态)，将每条要去抢占资源的线程封装成一个 Node 节点放入到内置的 CLH 同步队列(FIFO 双向队列)来维护排队工作，通过 CAS 对 state 值进行修改。

在 CLH 队列锁中，一个节点表示一个线程，它保存着线程的引用(thread)、 当前节点在队列中的状态(waitStatus)、前驱节点(prev)、后继节点(next)。

Node内部类构成的一个双向链表结构的同步队列，通过控制(volatile的int类型)state状态来判断锁的状态，对于非可重入锁状态,state不是0则去阻塞；
对于可重入锁如果state是0则执行，state非0时则判断当前线程是否是获取到这个锁的线程，是的话把state状态＋1，比如重入5次，那么state=5。 而在释放锁的时候，同样需要释放5次直到state=0其他线程才有资格获得锁
> 有次面试被问到,什么情况下state会暴涨,其实就是一直在重入就会暴涨,例如递归了

> CLH：Craig、Landin and Hagersten队列，是单向链表，AQS中的队列是CLH变体的虚拟双向队列(FIFO)，AQS是通过将每条请求共享资源的线程封装成一个节点来实现锁的分配。虚拟的双向队列即不存在队列实例，仅存在结点之间的关联关系

<!-- AQS使用一个volatile的int类型的成员变量来表示同步状态，通过内置的FIFO队列来完成资源获取的排队工作，通过CAS完成对State值的修改。 -->


<!-- ![](/software-engineer/drawio/Moatkon-AQS_state.drawio.svg) -->
<!-- AQS 有一个 state 标记位，值为1时表示有线程占用，其他线程需要进入到同步队列等待，同步队列是一个双向链表。 -->

### 原理图
![](/software-engineer/drawio/Moatkon-CLH_variant_queue.drawio.svg)

队列同步器，这是实现 ReentrantLock 的基础


### AQS两种资源共享方式
##### Exclusive：独占，只有一个线程能执行，如ReentrantLock
![](/software-engineer/drawio/Moatkon-AQS-Exclusive.svg)


##### Share：共享，多个线程可以同时执行，如Semaphore、CountDownLatch、ReadWriteLock，CyclicBarrier
![](/software-engineer/drawio/Moatkon-AQS-Share.svg)

### AQS使用的设计模式
模板方法模式
```java
//独占方式。尝试获取资源，成功则返回true，失败则返回false。
protected boolean tryAcquire(int)
//独占方式。尝试释放资源，成功则返回true，失败则返回false。
protected boolean tryRelease(int)
//共享方式。尝试获取资源。负数表示失败；0表示成功，但没有剩余可用资源；正数表示成功，且有剩余资源。
protected int tryAcquireShared(int)
//共享方式。尝试释放资源，成功则返回true，失败则返回false。
protected boolean tryReleaseShared(int)
//该线程是否正在独占资源。只有用到condition才需要去实现它。
protected boolean isHeldExclusively()

```