---
title: 如何翻转一个链表
description: 如何翻转一个链表
template: doc
lastUpdated: 2023-12-19 02:25:29
---
* 1 -> 2 -> 3 -> 4 -> null
* null <- 1 <- 2 <- 3 <- 4

翻转即将所有节点的next指针指向前驱节点

```java
public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;

    while(curr != null) {
        ListNode tmp = curr.next; // 将下一个节点存储在临时变量中
        curr.next = prev;
        prev = curr;
        curr = tmp; // 从这里往上看比较容易理解
    }

    return prev;
}
```

> 如果使用工具类,直接Collections.reverse(链表);