---
title: ThreadLocal
description: ThreadLocal
template: doc
lastUpdated: 2024-04-04 00:24:40
---
**主要作用:**   
数据隔离,填充的数据只属于当前线程,对别的线程而言是相对隔离的

**业务中使用场景:**   
- 用来解决数据库连接，存放connection对象，不同线程存放各自session；
- 事务隔离: Spring采用ThreadLocal的方式，来保证单个线程中的数据库操作使用的是同一个数据库连接
- 解决SimpleDateFormat线程安全问题；
    > 为什么SimpleDateFormat会存在线程安全问题?
    >
    > 主要是因为它内部使用了一个共享的Calendar对象来进行日期格式化和解析操作。由于Calendar对象不是线程安全的，多个线程同时访问同一个SimpleDateFormat实例可能会导致不一致的结果或者抛出异常
- 根据模板组装信息,和责任链模式配合起来,特别好用。例如我之前做过邮件模板的信息拼装

**总结**:   
ThreadLocal 适用于每个线程需要自己独立的实例且该实例需要在多个方法中被使用，即变量在线程间隔离而在方法或类间共享的场景。

## 原理
线程中创建副本，访问自己内部的副本变量，内部的实现是其内部静态类ThreadLocalMap的成员变量threadLocals，key为本身(固定是ThreadLocal类型的)，value为实际存值的变量副本

每个线程都维护了自己的threadLocals变量，所以在每个线程创建ThreadLocal的时候，实际上数据是存在自己线程Thread的threadLocals变量里面的，别人没办法拿到，从而实现了隔离

### ThreadLocalMap
ThreadLocalMap虽然类的名字上带着Map但却没有实现Map接口，只是结构和Map类似而已。

ThreadLocalMap 是一个定制化的HashMap，为什么？很好理解，**一个线程中是可以创建多个ThreadLocal对象的，多个ThreadLocal对象就会存放多个数据，那么在ThreadLocalMap中就会以数组的形式存放这些数据**。

![](/software-engineer/drawio/Moatkon-ThreadLocalMap.drawio.svg)

ThreadLocalMap 初始化时会创建一个大小为16的**Entry数组**，Entry对象也是用来保存 key- value 键值对(这个Key固定是ThreadLocal类型)。值得注意的是，这个Entry 继承了 WeakReference(这个设计是为了防止内存泄漏)。**但是，Entry中的value是强引用，不易被回收**

源码层面的理解:

下面代码中的main方法——在主线程里声明多个ThreadLocal对象。我们再看一下ThreadLocal的set方法:
```java ins="主线程"
public void set(T value) {
    Thread t = Thread.currentThread(); // 当前线程,主线程
    ThreadLocalMap map = getMap(t);
    if (map != null)
        map.set(this, value);
    else
        createMap(t, value);
}
```

一个线程中是可以创建多个ThreadLocal对象的:
```java
public static void main(String[] args) {
    // main方法主线程里会有多个ThreadLocal,所以使用ThreadLocalMap的Entry数组来承载数据
    ThreadLocal<String> t = new ThreadLocal<>();
    ThreadLocal<String> t2 = new ThreadLocal<>();
    t.set("moatkon");
    t2.set("moatkon.com");
}
```




**为什么Entry中的value不是弱引用?**   
如果是弱引用的话,容易被jvm垃圾回收器回收,这样值就丢失了
> WeakReference表示的是弱引用，当JVM进行GC时，一旦发现了只具有弱引用的对象，不管当前内存空间是否足够，都会回收它的内存。

##### ThreadLocalMap set()方法步骤:
1. 先根据Threadlocal对象的hashcode和数组长度做与运算获取数据应该放在当前数组中的位置。
2. 就是判断当前位置是否为空，为空的话就直接初始化一个Entry对象，放到当前位置。
3. 如果当前位置不为空，而当前位置的Entry中的key和传过来的key一样，那么直接覆盖掉当前位置的数据。
4. 如果当前位置不为空，并且当前位置的Entry中的key和传过来的key
也不一样，那么就会去找下一个空位置，然后将数据存放到空位置(数组超过长度后，会执行扩容的)；


## ThreadLocal使用不当会带来哪些副作用?
1. 会出现内存泄漏，所以要显式remove()。不要与线程池配合，因为worker往往是不会退出的；
2. 脏数据。如果在线程池中的线程使用了ThreadLocal对象,因为线程池会复用线程，所以自然而然会产生脏数据

### ThreadLocal内存泄漏的原因
![](/software-engineer/drawio/Moatkon-ThreadLocal.drawio.svg)

当JVM发生GC后，虚线会断开应用，也就是key会变为null，value是强引用不会为null，整个Entry也不为null，它依然在ThreadLocalMap中，并占据着内存，
我们获取数据时，**使用ThreadLocal的get()方法，ThreadLocal并不为null，所以我们无法通过一个key为null去访问到该entry的value。这就造成了内存泄漏。**

内存泄露问题，针对的是threadLocal对应的value对象实例。在线程对象被重用且threadLocal为静态变量时，如果没有手动remove()，就可能会造成内存泄露的情况

> 既然用弱引用会造成内存泄漏，直接用强引用可以么？ 
> 
> 答案是不行。如果是强引用的话，看看下面代码:
> ```java
> ThreadLocal threadLocal = new ThreadLocal();
> threadLocal.set(new Object());
> threadLocal = null;
> ```
> 我们在设置完数据后，直接将threadLocal设为null，这时栈中ThreadLocal Ref 到堆中ThreadLocal断开了，但是key到ThreadLocal的引用依然存在，GC依旧没法回收，同样会造成内存泄漏。


**解决办法**:   
在使用结束时，调用ThreadLocal.remove来释放其value的引用；

**为什么要手动remove()?**   
ThreadLocal对象通常作为私有静态变量使用(如果说一个 ThreadLocal 是非静态的，属于某个线程实例类，那就失去了线程内共享的本质属性),**而作为静态变量使用的话， 那么其生命周期至少不会随着线程结束而结束**。

也就是说，绝大多数的静态threadLocal对象都不会被置为null。这样子的话，通过 stale entry(过期条目) 这种机制来清除value对象实例这条路是走不通的。必须要手动remove()才能保证。

**相关知识点**:   
WeakReference:当 JVM 进行垃圾回收时，无论内存是否充足，都会回收只被弱引用关联的对象。

WeakReference 的引入，是为了将ThreadLocal 对象与ThreadLocalMap 设计成一种弱引用的关系，来避免ThreadLocal 实例对象不能被回收而存在的内存泄露问题

:::tip
这两个问题通常是在线程池的线程中使用 ThreadLocal 引发的，因为线程池有线程复用和内存常驻两个特点

为什么说只有线程复用的时候，会出现这个问题呢？因为这些本地变量都是存储在线程的内部变量中的，当线程销毁时，threadLocalMap的对象引用会被置为null，value实例对象随着线程的销毁，在内存中成为了不可达对象，然后被垃圾回收。所以只有在线程复用的时候才会出现
:::

## 如果我们要获取父线程的ThreadLocal值呢
ThreadLocal是不具备继承性的，所以是无法获取到的，但是我们可以用InheritableThreadLocal来实现这个功能。InheritableThreadLocal继承来ThreadLocal，重写了createdMap方法，对应的get和set方法，不再使用threadLocals，而是使用inheritableThreadLocals变量。(应用场景: 用一个统一的ID来追踪记录调用链路)
> 有一种场景，InheritableThreadLocal 无法解决，也就是在使用线程池等会池化复用线程的执行组件情况下，异步执行任务，需要传递上下文的情况。针对这种情况，阿里开源了一个库来解决，可以看一下https://github.com/alibaba/transmittable-thread-local

InheritableThreadLocal的原理很简单：它允许一个线程创建的子线程继承该线程的本地变量。这就意味着，你可以在父线程中设置一个本地变量的值，然后子线程可以访问和继承这个值。这是通过复制父线程的本地变量到子线程来实现的。
如果子线程修改这个变量也不会影响父线程,因为它只会影响子线程自己的变量副本，不会影响父线程或其他线程的变量。每个线程都有自己的InheritableThreadLocal变量副本，更改只在当前线程中可见

---
:::note[stale entry]
"Stale entry"(过期条目)是一种与缓存和缓存管理相关的概念。当在缓存中存储数据时，有时候需要考虑数据的有效期或过期时间。过期时间是指数据在缓存中保持有效的时间段。"Stale entry"机制是用于处理过期缓存条目的一种方法。

具体来说，"Stale entry"机制包括以下几个方面：

- 过期时间设置：在缓存中存储的每个条目通常都有一个相关的过期时间。这个过期时间可以是相对的(例如，从数据放入缓存开始计时一小时)或绝对的(例如，截止到某个具体的日期和时间)。数据的有效性通常与这个过期时间相关。
- 定期检查："Stale entry"机制会定期检查缓存中的条目，判断哪些数据已经过期。这个检查可以由缓存管理系统自动执行，以确保缓存中的数据保持新鲜和有效。
- 清理过期数据：一旦数据被标记为过期，"Stale entry"机制会清除或更新这些数据。清理过期数据的方法可以包括直接删除过期条目或在下次访问时重新加载最新数据。
- 性能优化：为了提高性能，缓存管理系统通常不会在每次访问时都检查所有缓存条目的过期状态，而是采用一些策略，如LRU(Least Recently Used，最近最少使用)、LFU(Least Frequently Used，最不经常使用)等，来决定哪些条目需要检查。

"Stale entry"机制有助于确保缓存中的数据保持更新和有效，同时避免使用过时的数据。这对于高效的缓存管理是至关重要的，尤其是在需要缓存大量数据的应用中，以减轻数据库或外部服务的负担，提高响应速度。
:::

<!-- https://www.cnblogs.com/jimoer/p/13649008.html -->