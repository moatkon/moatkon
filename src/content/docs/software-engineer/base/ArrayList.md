---
title: ArrayList
description: ArrayList
template: doc
lastUpdated: 2024-04-06 21:36:58
---
ArrayList是业务开发中最常用集合之一了,底层实现原理是**数组**,而数组是一块**连续**的内存空间,所以在查询时速度非常快。但是在新增和修改时速度慢一点。

![](/software-engineer/drawio/Moatkon-ArrayList.drawio.svg)

#### 为什么会在新增和修改的时候慢?
当元素数量超过当前数组的容量时，需要创建一个新的数组并将原有元素复制到新数组中。这个过程涉及到内存分配、数据复制等操作，因此新增元素时的效率较低。类似地，删除元素后，可能需要收缩数组，同样涉及到元素的复制和内存释放。
> 在极小的数据量下,查询、新增、修改之间的效率差别几乎可以忽略,只有在数据量大时才会有明显的感知


如果涉及到新增和修改,可以使用LinkedList,这个是基于链表实现的,新增和修改只需要调整相邻元素的指针指向即可,而不需要想数组一样移动大量的元素。


#### ArrayList初始化
在JDK1.7的版本中进行初始化时,会直接默认初始化容量为10。在JDK1.7之后呢,就默认走了空数组,只有在第一次添加元素时,才会初始化容量为10。

#### ArrayList扩容
以数组原长度的0.5倍进行扩容
```java
  int oldCapacity = elementData.length;
  int newCapacity = oldCapacity + (oldCapacity >> 1); // 注释: 10 >> 1 = 5
```

#### 扩容方式
copy,复制
```java
elementData = Arrays.copyOf(elementData, newCapacity);
```

#### ArrayList是非线程安全的
ArrayList不是线程安全的。如果想使用线程安全的数组容器,可以使用Vector或者使用Collections.synchronizedList包一下

Vector为什么是线程安全的?因为Vector的所有操作都加了`synchronized`了,所以使用Vector的效率非常低


#### ArrayList和LinkedList
- ArrayList 查询速度快,新增和删除效率低
- LinkedList 查询效率低,但是新增和删除效率高。

**LinkedList原理**
LinkedList的底层是一个一个的节点,节点之间通过next和prev节点连接🔗起来。(`LinkedList`需要存储额外的指针信息，这会导致在一定程度上占用更多的内存空间。)

```java
    private static class Node<E> {
        E item;
        Node<E> next;
        Node<E> prev;

        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }
```

所以从底层的实现来讲,相较于ArrayList,查找会慢一点。但是LinkedList的新增和删除会很快,因为只需要改变next和prev的指向就可以了。

:::note[总结]
ArrayList遍历最大的优势在于内存的连续性，CPU的内部缓存结构会缓存连续的内存片段，可以大幅降低读取内存的性能开销。
:::

#### 最后
不存在一个集合工具是查询效率又高，增删效率也高的，还线程安全的。因为数据结构的特性就是优劣共存的，想找个平衡点很难，牺牲了性能，那就安全，牺牲了安全那就快速。