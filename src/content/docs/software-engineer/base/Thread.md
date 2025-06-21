---
title: Thread
description: Thread
template: doc
lastUpdated: 2024-03-22 22:20:17
---
#### 线程和进程
进程是资源分配的最小单位,线程是 CPU 调度的最小单位

#### 线程等待和唤醒
1. Object 类下的 wait()、notify() 和 notifyAll() 方法
   1. wait()：让当前线程处于等待状态，并释放当前拥有的锁；
   2. notify()：随机唤醒等待该锁的**其他线程**，重新获取锁，并执行后续的流程，只能唤醒一个线程；
   3. notifyAll()：唤醒所有等待该锁的线程
2. Condition 类下的 await()、signal() 和 signalAll() 方法。 signal()等同于wait(),signalAll()等同于notifyAll()
3. LockSupport 类下的 park() 和 unpark(线程对象) 方法。
   1. park()：休眠当前线程
   2. unpark(线程对象)：唤醒某一个**指定的线程**。

<span style="color:green">衍生问题: 为什么Object类下面有了等待和唤醒方法,还有那么多的实现?</span>
1. Object的实现过于随机,LockSupport则可以指定唤醒,更符合日常的业务处理
2. Condition可以比Object可以实现更多的功能,因为可以创建多个Condition对象,所以相对于Object更加灵活
   ```java
   Lock lock = new ReentrantLock();
   Condition producerCondition = lock.newCondition();
   Condition consumerCondition = lock.newCondition();
   ```

#### 进程间有哪些通信方式？
每个进程的用户地址空间都是独立的，一般而言是不能互相访问的，但内核空间是每个进程都共享的，所以进程之间要通信必须通过内核。

1. 管道,先进先出。所谓的管道，就是内核里面的一串缓存。从管道的一段写入的数据，实际上是缓存在内核中的，另一端读取，也就是从内核中读取这段数据。另外，管道传输的数据是无格式的流且大小受限。 (我们经常在Linux上使用 `|` 就是管道,把上一个的命令结果作为参数给下一个命令使用)
2. 消息队列
3. 共享内存。拿出一块虚拟地址空间来，映射到相同的物理内存中。这样这个进程写入的东西，另外一个进程马上就能看到了，都不需要拷贝来拷贝去，传来传去，大大提高了进程间通信的速度。
4. 信号量。信号量其实是一个整型的计数器，主要用于实现进程间的互斥与同步，而不是用于缓存进程间通信的数据。
5. 信号。对于异常情况下的工作模式，就需要用「信号」的方式来通知进程。
6. Socket,用于不同主机的进程之间

同个进程下的线程之间都是共享进程的资源，只要是共享变量都可以做到线程间通信，比如全局变量，所以对于线程间关注的不是通信方式，而是关注多线程竞争共享资源的问题，信号量也同样可以在线程间实现互斥与同步：
- 互斥的方式，可保证任意时刻只有一个线程访问共享资源；
- 同步的方式，可保证线程 A 应在线程 B 之前执行；

#### 线程间`通信`有哪些方法?
通信,就是思考怎么让对方知道,主要通过**共享内存**和**消息传递**来实现

1. 等待和通知机制。即 Object 类下的 wait()、notify() 和 notifyAll() 方法
2. 锁机制。锁,即资源竞争,其实就是一种通信
3. 信号量机制。Semaphore: Semaphore 是一个计数器，用来控制同时访问某个资源的线程数。当某个线程需要访问共享资源时，它必须先从 Semaphore 中获取一个许可证，如果已经没有许可证可用，线程就会被阻塞，直到其他线程释放了许可证
4. 栅栏机制。CyclicBarrier: 多个线程在指定的屏障处等待，并在所有线程都达到屏障时继续执行

:::note[这个方便记忆]
1. 使用 volatile 关键字。基于 volatile 关键字来实现线程间相互通信是使用共享内存的思想，大致意思就是多个线程同时监听一个变量，当这个变量发生变化的时候 ，线程能够感知并执行相应的业务。这也是最简单的一种实现方式
2. 等待和通知机制。即 Object 类下的 wait()、notify() 和 notifyAll() 方法
3. 使用JUC工具类 CountDownLatch。简化了我们的并发编程代码的书写，CountDownLatch基于AQS框架，相当于也是维护了一个线程间共享变量state (即第1点的实现,如果让我们自己实现,就很复杂,所以可以使用JUC写好的)
4. 使用 ReentrantLock 结合 Condition。(在上面有介绍过)
5. 基本LockSupport实现线程间的阻塞和唤醒。(在上面有介绍过)
:::

:::note[题外话]
CountDownLatch 和 CyclicBarrier 类似，都是等待所有任务到达某个点之后，再进行后续的操作。他们之间的区别是:
- CountDownLatch 缺点是计数器只能使用一次，CountDownLatch 创建之后不能被重复使用。
- CyclicBarrier可以理解为一个可以重复使用的循环计数器,调用`reset`方法可以重置到初始状态
:::




<!-- #### 正常线程进程`同步`的机制有哪些？
- 互斥：互斥的机制，保证同一时间只有一个线程可以操作共享资源 synchronized，Lock等
- 事件通知：通过事件的通知去保证大家都有序访问共享资源
- 信号量：多个任务同时访问，同时限制数量，比如发令枪CDL，Semaphore等
- 临界值：让多线程串行话去访问资源 -->

#### 线程中包含哪些状态？
- NEW(初始化状态)：线程刚被创建时是初始状态，线程对象被创建，但还未调用 start() 方法启动线程。
- RUNNABLE(可运行状态)：线程正在 Java 虚拟机中执行，调用 start() 方法后，线程开始执行，变为此状态。
- BLOCKED(阻塞状态)：线程被阻塞，等待获取锁资源。当线程执行 synchronized 关键字标识的代码块时，如果无法获取到锁资源，则线程进入阻塞状态。当其他线程释放锁资源后，该阻塞线程进入就绪状态，等待竞争锁资源。
- WAITING(无时限等待状态)：线程通过调用 Object.wait() 方法进入等待状态，直到被其他线程通过 Object.notify() 或 Object.notifyAll() 来唤醒。
- TIMED_WAITING(有时限等待状态)：线程通过调用 Thread.sleep(long millis) 方法或 Object.wait(long timeout) 方法进入计时等待状态。在指定的时间段内，线程会一直保持计时等待状态，直到到达指定时间或被其他线程唤醒。
- TERMINATED(终止状态)：线程执行完成或者异常终止，即线程生命周期结束，线程进入终止状态后不可再次转换为其他状态。

![](/software-engineer/drawio/Thread_state.png)
> 该图片来自互联网

#### 如何停止线程
`Thread.interrupted()` 打断

调用了`Thread.interrupted()`线程并不会立即停止,只是设置了一个中断标志，线程可以通过检查这个标志来自行终止。

> `Thread.currentThread().isInterrupted()` 方法检查当前线程是否被中断

