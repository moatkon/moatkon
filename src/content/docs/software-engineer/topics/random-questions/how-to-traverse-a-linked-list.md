---
title: 如何遍历链表
description: 如何遍历链表
template: doc
lastUpdated: 2023-12-13 21:59:41
---
使用迭代器或者递归

简单的代码:

```java
Iterator<String> iter = linkedKist.iterator();
while(iter.hasNext()) {
    String element = iter.next();
    System.out.println(element);
}
```

```java
public void traverseLinkedList(Node node) {
    if (node != null) {
        // do something
        traverseLinkedList(node.next);
    }
}
```