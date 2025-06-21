---
title: 线程池
description: 线程池
template: doc
lastUpdated: 2024-04-04 00:24:40
---
简单说就是管理线程的池子
- 帮我们**管理**线程，提高线程的可管理性(统一的分分配、调优、监控)
- **重复利用**,降低资源消耗
- 提高响应速度 <sub>因为不用费劲去创建新的线程了,创建线程需要申请虚拟机栈、本地方法栈、程序计数器等该线程所需的内存空间</sub>

## 创建线程池
通过ThreadPoolExecutor创建

- corePoolSize： 线程池核心线程数
- maximumPoolSize： 线程池最大线程数大小
- keepAliveTime： 线程池中非核心线程空闲的存活时间大小
- unit： 线程空闲存活时间单位
- workQueue： 存放任务的阻塞队列
- threadFactory： 用于设置创建线程的工厂，可以给创建的线程设置有意义的名字，可方便排查问题。
- handler： 线程池的饱和策略事件，主要有四种类型:
  - AbortPolicy (默认) 直接抛出异常阻止线程运行
  - DiscardPolicy 直接丢弃任务，不做处理
  - DiscardOldestPolicy 丢弃队列里最老的任务，将当前这个任务继续提交给线程池
  - CallerRunsPolicy 交给线程池调用所在的线程进行处理

> 默认情况下，线程池在初始的时候，线程数为0。当接收到一个任务时，如果线程池中存活的线程数小于corePoolSize核心线程，则新建一个线程。
另外，如果想在线程初始化时候就有核心线程，可以调用prestartCoreThread()或prestartAllCoreThread()，前者是初始一个，后者是初始全部。

![](/software-engineer/drawio/Moatkon-ThreadPoolExecutorRunStep.drawio.svg)

任务缓冲模块是线程池能够管理任务的核心部分。线程池的本质是对任务和线程的管理，而做到这一点最关键的思想就是将任务和线程两者解耦，不让两者直接关联，才可以做后续的分配工作。线程池中是以生产-消费模式，通过一个阻塞队列来实现的。阻塞队列缓存任务，工作线程从阻塞队列中获取任务。

### 合理配置线程池的线程数量
一般核心线程数设置为最大线程数的20%

#### CPU密集型(计算密集型)
CPU密集型也就是计算密集型，常常指算法复杂的程序，需要进行大量的逻辑处理与计算，CPU在此期间是一直在工作的。

在《Java Concurrency in Practice》中，推荐将CPU密集型最大线程数设置为**最大线程数 = CPU核心数 + 1**，这样能发挥最高效率。

核心线程数一般会设置为 **核心线程数 = 最大线程数 * 20%**

#### IO密集型
IO密集型是指我们程序更多的工作是在通过磁盘、内存或者是网络读取数据，在IO期间我们线程是阻塞的，这期间CPU其实也是空闲的，这样我们的操作系统就可以切换其他线程来使用CPU资源。

**最大线程数 = CPU核心数 / （1 - 阻塞占百分比）**

我们很好理解比如在某个请求中，请求时长为10秒，调用IO时间为8秒，这时我们阻塞占百分比就是80%，有效利用CPU占比就是20%，假设是8核CPU，我们线程数就是8 / (1 - 80%) = 8 / 0.2 = 40个。

也就是说 我们八核CPU在上述情况中，可满负荷运行40个线程。这时我们可将最大线程数调整为40，在系统进行IO操作时会去处理其他线程。

上面是精细的调法,通常我们会设置为**最大线程数 = CPU核心数 * 2**。

核心线程数一般会设置为 **核心线程数 = 最大线程数 * 20%**。

:::tip
上面的调法只是参考,在实际业务开发中,是需要根据实际情况来处理的。

实际开发可以接入动态线程池来做,[DynamicTp](https://dynamictp.cn/)
:::


## 其他创建线程池的方法
- 使用 Executors 类提供的工厂方法创建。Executors 类提供的一些静态工厂方法创建线程池，例如可以创建newFixedThreadPool、newSingleThreadExecutor、newCachedThreadPool等。
- 使用 Spring 框架提供的 ThreadPoolTaskExecutor 类：在 Spring 框架中可以通过 ThreadPoolTaskExecutor 类来创建线程池

## 线程池是如何实现的
线程池中线程被抽象为静态内部类Worker，是基于AQS实现的,这些Workers是存放在HashSet中的。
```java
private final class Worker extends AbstractQueuedSynchronizer 
												   implements Runnable {
	//...
}
```

基本思想就是从workQueue中取出要执行的任务，放在worker中处理。

要被执行的线程存放在BlockingQueue中

#### 静态内部类Worker
​Worker是通过继承AQS，使用AQS来实现独占锁(也称之为互斥锁)这个功能。为什么? 因为在线程池中，每个工作线程通常需要保证自己在执行任务时是独占某些资源或状态的。AQS是一个常见的工具，用于实现这种独占锁的机制。工作线程需要在执行任务时获取一个锁，以防止其他工作线程同时修改或访问相同的资源或状态。这可以有效避免竞争条件和数据不一致性问题。<!-- 没有使用可重入锁ReentrantLock，而是使用AQS，为的就是实现不可重入的特性去反应线程现在的执行状态。 -->

**不使用 可重入锁ReentrantLock，而是使用AQS的原因：** ReentrantLock是Java中的一种可重入锁，意味着同一个线程可以多次获取同一把锁，而不会发生死锁。但是，**在某些情况下，线程池的设计可能需要线程处于不可重入的状态，即一个线程只能获取一次锁，以确保线程的执行状态和资源占用不会被其他线程影响。这就是为什么作者选择使用AQS而不是ReentrantLock的原因**。

总结，为了实现工作线程的互斥执行和不可重入性，使用AQS来管理工作线程的锁状态，以确保线程池的正常运行和资源安全。


> AQS(AbstractQueuedSynchronizer)是Java中的一个抽象类，它提供了一种用于实现同步机制的框架。AQS的一个重要特性是它可以用来实现独占锁(也叫互斥锁)，这意味着在任何给定时刻只有一个线程能够获取锁，其他线程必须等待。

<!-- **Worker使用AQS来实现独占锁的功能**：在线程池中，每个工作线程通常需要保证自己在执行任务时是独占某些资源或状态的。AQS是一个常见的工具，用于实现这种独占锁的机制。工作线程需要在执行任务时获取一个锁，以防止其他工作线程同时修改或访问相同的资源或状态。这可以有效避免竞争条件和数据不一致性问题。 -->

#### Worker线程管理

线程池为了掌握线程的状态并维护线程的生命周期，设计了线程池内的工作线程Worker

![](/software-engineer/base/threadPoolWorker.png)
> 该图片来自互联网

Worker这个工作线程，实现了Runnable接口，并持有一个线程`thread`和一个初始化的任务`firstTask`。
```java
private final class Worker extends AbstractQueuedSynchronizer 
												   implements Runnable {
	// 执行任务的线程类
	final Thread thread;
	// 初始化执行的任务，第一次执行的任务
	Runnable firstTask;
	// ...
}
```
`thread`是在调用构造方法时通过ThreadFactory来创建的线程，可以用来执行任务；

`firstTask`是用它来保存传入的第一个任务，这个任务可以有也可以为null。
- 如果这个值是不为null的，那么线程就会在启动初期**立即**执行这个任务，**也就对应核心线程创建时的情况**;
- 如果这个值是null，那么就需要创建一个线程去执行任务列表(workQueue)中的任务，**也就是非核心线程的创建**。

## 提交任务到线程池
1. 提交一个任务，线程池里存活的核心线程数小于`corePoolSize`时，线程池会创建一个核心线程去处理提交的任务
2. 如果线程池核心线程数已满，即线程数已经等于`corePoolSize`，一个新提交的任务，会被放进任务队列`workQueue`排队等待执行。
3. 当线程池里面存活的线程数已经等于`corePoolSize`了，并且任务队列workQueue也满，判断线程数是否达到`maximumPoolSize`，即最大线程数是否已满，如果没满，创建非核心线程执行提交的任务;如果当前的线程数达到了`maximumPoolSize`，还有新的任务过来的话，直接采用拒绝策略处理。

![](/software-engineer/drawio/Moatkon-ThreadPoolExecuteTask.drawio.svg)


## 线程池线程回收过程♻️
#### 基本原理
线程池需要管理线程的生命周期，需要在线程长时间不运行的时候进行回收。
线程池使用一张Hash表去持有线程的引用，这样可以通过添加引用、移除引用这样的操作来控制线程的生命周期。

**如何判断线程池任务执行完？**
1. 使用 getCompletedTaskCount() 统计已经执行完的任务，和 getTaskCount() 线程池的总任务进行对比，如果相等则说明线程池的任务执行完了，否则既未执行完。
   
   缺点: 此判断方法的缺点是 getTaskCount() 和 getCompletedTaskCount() 返回的是一个近似值，因为线程池中的任务和线程的状态可能在计算过程中动态变化，所以它们两个返回的都是一个近似值。
2. 使用 FutureTask 等待所有任务执行完，线程池的任务就执行完了。任务判断精准，可以调用每个 FutrueTask 的 get 方法就是等待该任务执行完。
3. 使用 CountDownLatch 或 CyclicBarrier 等待所有线程都执行完之后，再执行后续流程。CyclicBarrier 从设计的复杂度到使用的复杂度都高于 CountDownLatch，相比于 CountDownLatch 来说它的优点是可以重复使用(只需调用 reset 就能恢复到初始状态)，缺点是使用难度较高。


#### 详细回收过程
![](/software-engineer/drawio/Moatkon-ThreadPoolThreadRecycle.drawio.svg)

1. `lock()`方法一旦获取了独占锁，表示当前线程正在执行任务中。 
2. 如果正在执行任务，则不应该中断线程。 
3. 如果该线程现在不是独占锁的状态，也就是空闲的状态，说明它没有在处理任务，这时可以对该线程进行中断。 
4. 线程池在执行`shutdown()`方法或`tryTerminate()`方法时会调用`interruptIdleWorkers()`方法来中断空闲的线程，`interruptIdleWorkers()`方法**会使用`tryLock()`方法来判断线程池中的线程是否是空闲状态**；如果线程是空闲状态则可以安全回收。

**Worker线程回收**:   
线程池中**线程的销毁依赖JVM自动的回收**，线程池做的工作是根据当前线程池的状态维护一定数量的线程引用，防止这部分线程被JVM回收，当线程池决定哪些线程需要回收时，只需要将其引用消除即可。

Worker被创建出来后，就会不断地进行轮询，然后获取任务去执行，核心线程可以**无限等待**获取任务，非核心线程要**限时**获取任务。当Worker无法获取到任务，也就是获取的任务为空时，循环会结束，Worker会**主动消除**自身在线程池内的引用

## 有哪些线程池？
#### newFixedThreadPool (固定数目线程的线程池)
阻塞队列为无界队列LinkedBlockingQueue: 阻塞队列是无界的，这样就提交任务高峰期有可能会造成任务一直堆积在队列里，超出内存容量最终导致内存溢出(OOM)。所以要配合上合适的策略

适用于处理CPU密集型的任务，适用执行长期的任务

#### newSingleThreadExecutor(单线程的线程池)
阻塞队列是LinkedBlockingQueue: 任务队列是无界的LinkedBlockingQueue，存在任务队列无限添加造成OOM的风险。

适用于串行执行任务的场景，一个任务一个任务地执行

#### newCachedThreadPool(可缓存线程的线程池)
阻塞队列是SynchronousQueue

适用于并发执行大量短期的小任务

:::note[工作机制]
- 提交任务
- 因为没有核心线程，所以任务直接加到SynchronousQueue队列。
- 判断是否有空闲线程，如果有，就去取出任务执行。
- 如果没有空闲线程，就新建一个线程执行。
- 执行完任务的线程，还可以存活60秒，如果在这期间，接到任务，可以继续活下去；否则，被销毁。
  > 这一步会存在一个风险点: 阻塞队列采用的SynchronousQueue，所以是不存储等待任务的，并且最大线程数的值是Integer.MAX_VALUE。所以当任务提交量高峰时，相当于无限制的创建线程。并且空闲时间是60秒，QPS高峰期最终会将服务器资源耗尽，所以真正实际应用中不建议使用。所以要配合上合适的策略
:::

#### newScheduledThreadPool(定时及周期执行的线程池)
阻塞队列是DelayedWorkQueue

周期性执行任务的场景，需要限制线程数量的场景

线程池的最大线程数也是Integer.MAX_VALUE，可以理解为会无限创建线程。存在将资源耗尽的风险，所以一般场景下不建议使用。所以要配合上合适的策略

#### newWorkStealingPool(一个具有抢占式操作的线程池)
参数中传入的是一个线程并发的数量，这里和之前就有很明显的区别，前面4种线程池都有核心线程数、最大线程数等等，而这就使用了一个并发线程数解决问题。这个线程池不会保证任务的顺序执行，也就是 WorkStealing 的意思，抢占式的工作，哪个线程抢到任务就执行。

## 有哪几种工作队列
#### ArrayBlockingQueue
(有界队列)是一个用数组实现的有界阻塞队列，按FIFO排序量

#### LinkedBlockingQueue
(可设置容量队列)基于链表结构的阻塞队列，按FIFO排序任务，容量可以选择进行设置，不设置的话，将是一个无边界的阻塞队列，最大长度为Integer.MAX_VALUE，吞吐量通常要高于ArrayBlockingQuene。newFixedThreadPool线程池使用了这个队列

###### 使用无界队列的线程池会导致内存飙升吗？
会的，newFixedThreadPool使用了无界的阻塞队列LinkedBlockingQueue，如果线程获取一个任务后，任务的执行时间比较长(比如10秒)，会导致队列的任务越积越多，导致机器内存使用不停飙升， 最终导致OOM。

#### DelayQueue
(延迟队列)是一个任务定时周期的延迟执行的队列。根据指定的执行时间从小到大排序，否则根据插入到队列的先后排序。newScheduledThreadPool线程池使用了这个队列。

#### PriorityBlockingQueue
(优先级队列)是具有优先级的无界阻塞队列；

#### SynchronousQueue
- 使用SynchronousQueue的目的就是保证“对于提交的任务，如果有空闲线程，则使用空闲线程来处理；否则新建一个线程来处理任务”
- SynchronousQueue 没有容量，不存储元素，目的是保证对于提交的任务，如果有空闲线程，则使用空闲线程来处理；否则新建一个线程来处理任务。也就是说，CachedThreadPool 的最大线程数是 Integer.MAX_VALUE ，可以理解为线程数是可以无限扩展的，可能会创建大量线程，从而导致 OOM。
- (同步队列)一个不存储元素的阻塞队列，每个插入操作必须等到另一个线程调用移除操作，否则插入操作一直处于阻塞状态，吞吐量通常要高于LinkedBlockingQuene，newCachedThreadPool线程池使用了这个队列。每一个put操作必须要等待一个take操作，否则不能继续添加元素，反之亦然

##### SynchronousQueue吞吐量通常要高于LinkedBlockingQuene的原因:
SynchronousQueue 的设计目标是高吞吐量，它的主要用途是在线程之间直接传递数据，而不是存储任务，因此它几乎没有队列的容量限制。这意味着当一个线程尝试将数据传递给另一个线程时，它不会等待队列中有空间或元素，因此通常不会引入排队延迟。

相比之下，LinkedBlockingQueue 具有容量限制，当队列已满或为空时，插入或移除操作会导致线程等待，这会降低吞吐量。

## 如果线程池中的一个线程运行时出现了异常，会发生什么？
如果提交任务的时候使用了submit，则返回的feature里会存有异常信息，但是如果是execute则会打印出异常栈。但是不会给其他线程造成影响。之后线程池会删除该线程，会新增加一个worker。
#### 线程池的异常处理
- try-catch捕获异常
- submit执行, Future.get()接收异常
- 重写ThreadPoolExecutor.afterExecute方法,处理传递的异常引用
- 实例化时，传入自己的ThreadFactory，设置Thread UncaughtExceptionHandler处理未检测的异堂

## 线程池的状态
- RUNNING: 能接受新提交的任务，并且也能处理阻塞队列中的任务。
- SHUTDOWN: 关闭状态，不再接受新提交的任务，但却可以继续处理阻塞队列中已保存的任务。
- STOP: 不能接受新任务，也不处理队列中的任务，会中断正在处理任务的线程。
- TIDYING: 所有的任务都已终止了，workerCount(有效线程数)为0。
- TERMINATED: 在terminated()方法执行完后进入该状态。

![](/software-engineer/drawio/Moatkon-ThreadPoolState.drawio.svg)

#### 维护线程池的生命周期方法
线程池运行的状态，并不是用户显式设置的，而是伴随着线程池的运行，由内部来维护。**线程池内部使用一个变量维护两个值：运行状态(runState)和线程数量 (workerCount)**。在具体实现中，线程池将运行状态(runState)、线程数量 (workerCount)两个关键参数的维护放在了一起。
```java
private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));
```
ctl这个AtomicInteger类型，是对线程池的运行状态和线程池中有效线程的数量进行控制的一个字段， 它同时包含两部分的信息：线程池的运行状态 (runState) 和线程池内有效线程的数量 (workerCount)，高3位保存runState，低29位保存workerCount，两个变量之间互不干扰。

用一个变量去存储两个值，可避免在做相关决策时，出现不一致的情况，不必为了维护两者的一致，而占用锁资源。

通过阅读线程池源代码也可以发现，经常出现要同时判断线程池运行状态和线程数量的情况。线程池也提供了若干方法去供用户获得线程池当前的运行状态、线程个数。这里都使用的是位运算的方式，相比于基本运算，速度也会快很多。

## 如何停止线程池?
- `shutdown()`: 该方法会停止线程池的新任务的接受，并尝试将所有未完成的任务完成执行
- `shutdownNow()`: 该方法会停止线程池的接受新任务，并尝试停止所有正在执行的任务。该方法会返回一个未完成任务的列表，这些任务将被取消


`awaitTermination()`: 在关闭线程池后，通过调用 awaitTermination() 方法来等待所有任务完成执行。该方法会阻塞当前线程，直到所有任务完成执行或者等待超时
```java
ExecutorService executor = Executors.newFixedThreadPool(10);
// ...

executor.shutdown(); // 关闭线程池

if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {// 等待所有任务完成执行
	// 如果等待超时，强制关闭线程池
	executor.shutdownNow();
}
```

**线程池统计任务完成数**: getCompletedTaskCount() 
**线程池总任务数**: getTaskCount()

## ForkJoinPool
ForkJoinPool 是 JDK1.7 开始提供的线程池。为了解决 CPU 负载不均衡的问题，如某个较大的任务，被一个线程去执行，而其他线程处于空闲状态。


ForkJoinPool的一个重要特性是它能够实现**工作窃取(Work Stealing)**，在该线程池的每个线程中会维护一个队列来存放需要被执行的任务。当线程自身队列中的任务都执行完毕后，它会从别的线程中拿到未被执行的任务并帮助它执行。

每个工作线程在处理自己的工作队列同时，会尝试窃取一个任务（或是来自于刚刚提交到 pool 的任务，或是来自于其他工作线程的工作队列），窃取的任务位于其他线程的工作队列的队首，也就是说工作线程在窃取其他工作线程的任务时，使用的是 FIFO 方式。

## 如何将信息传给线程池的里的线程
使用装饰器。例如我在[upupor](https://github.com/yangrunkang/upupor)项目中使用到了装饰器:
```java
public class UpuporAsyncContextDecorator implements TaskDecorator {
    @Override
    @Nonnull
    public Runnable decorate(@Nonnull Runnable runnable) {
        // 获取主线程中的请求信息
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        return () -> {
            try {
                // 将主线程的请求信息,设置到子线程中
                RequestContextHolder.setRequestAttributes(attributes);
                // 执行子线程
                runnable.run();
            } finally {
                // 线程结束，清空这些信息,否则可能造成内存泄漏
                RequestContextHolder.resetRequestAttributes();
            }
        };
    }
}
```