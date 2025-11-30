---
title: MySQL死锁排查案例
description: MySQL死锁
template: doc
lastUpdated: 2025-11-30 17:19:23
sidebar:
  badge:
    text: 线上排查
    variant: danger
---
## 业务处理流程示意图
![](/software-engineer/mysql/Moatkon-mysql-deal-lock-of-gap-lock.drawio.png)

![](/software-engineer/mysql/Moatkon-mysql-deal-lock-of-gap-lock2.drawio.png)



## 死锁日志

```sh
2024-10-16 13:51:36 139636894508800
*** (1) TRANSACTION:
TRANSACTION 4718724388, ACTIVE 0 sec inserting
mysql tables in use 1, locked 1
LOCK WAIT 4 lock struct(s), heap size 1136, 2 row lock(s), undo log entries 2
MySQL thread id 82934132, OS thread handle 139633304270592, query id 35509253618 10.100.32.248 dscloud_agent update
INSERT INTO order_detail_model  ( order_no,
commodity_code,
commodity_name,
commodity_count,
total_actual_amount,
bill_price,
goods_type,
is_joint,

is_original,
is_gift,
status )  VALUES  ( 1812845401680613892,
'199965',
'双黄连口服液_林宝_10ml*12支',
1,
15.80,
15.8000,
1,
0,

1,
0,
0 )

*** (1) HOLDS THE LOCK(S):
RECORD LOCKS space id 26174 page no 590 n bits 824 index idx_order_no of table `dscloud`.`order_detail_model` trx id 4718724388 lock_mode X locks gap before rec
Record lock, heap no 377 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 8; hex 992885f6a1323d07; asc  (   2= ;;
 1: len 8; hex 800000000003f03f; asc        ?;;


*** (1) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 26174 page no 590 n bits 824 index idx_order_no of table `dscloud`.`order_detail_model` trx id 4718724388 lock_mode X locks gap before rec insert intention waiting
Record lock, heap no 377 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 8; hex 992885f6a1323d07; asc  (   2= ;;
 1: len 8; hex 800000000003f03f; asc        ?;;


*** (2) TRANSACTION:
TRANSACTION 4718724391, ACTIVE 0 sec inserting
mysql tables in use 1, locked 1
LOCK WAIT 4 lock struct(s), heap size 1136, 2 row lock(s), undo log entries 2
MySQL thread id 82934170, OS thread handle 139634086201088, query id 35509253624 10.100.39.10 dscloud_agent update
INSERT INTO order_detail_model  ( order_no,
commodity_code,
commodity_name,
commodity_count,
total_actual_amount,
bill_price,
goods_type,
is_joint,

is_original,
is_gift,
status )  VALUES  ( 1812845401445735431,
'169913',
'清热解毒口服液_伊龍_10ml*10支',
1,
9.50,
9.5000,
1,
0,

1,
0,
0 )

*** (2) HOLDS THE LOCK(S):
RECORD LOCKS space id 26174 page no 590 n bits 824 index idx_order_no of table `dscloud`.`order_detail_model` trx id 4718724391 lock_mode X locks gap before rec
Record lock, heap no 377 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 8; hex 992885f6a1323d07; asc  (   2= ;;
 1: len 8; hex 800000000003f03f; asc        ?;;


*** (2) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS space id 26174 page no 590 n bits 824 index idx_order_no of table `dscloud`.`order_detail_model` trx id 4718724391 lock_mode X locks gap before rec insert intention waiting
Record lock, heap no 377 PHYSICAL RECORD: n_fields 2; compact format; info bits 0
 0: len 8; hex 992885f6a1323d07; asc  (   2= ;;
 1: len 8; hex 800000000003f03f; asc        ?;;

*** WE ROLL BACK TRANSACTION (2)

```

## 排查原因
这个死锁问题涉及两个事务 (1) 和 (2)，它们都在尝试向同一个表 `order_detail_model` 插入数据，且都在等待锁。

### 死锁原因分析：

1. **事务 (1) 和 (2)** 都在同一索引 `idx_order_no` 上持有了 **"gap" 锁**，也即“间隙锁”（Gap Lock）。间隙锁通常用于阻止其他事务在索引的某个范围内插入新记录，以维持一致性。

2. **事务 (1)**:
   - 持有 `idx_order_no` 的 gap 锁，锁住了索引前的间隙。
   - 但是它仍在等待该索引的一个位置上插入意图锁。

3. **事务 (2)**:
   - 同样持有 `idx_order_no` 的 gap 锁，锁住了索引前的间隙。
   - 但也在等待该索引上的插入意图锁。

4. **死锁形成**:
   - 事务 (1) 和 (2) 都已经持有了 gap 锁，并且都在等待对方释放锁以完成插入操作。然而，由于双方都需要对方的锁，而各自持有锁，形成了死锁。
   
### 解决方案建议：

1. **减少并发插入的冲突**：可以考虑通过优化业务逻辑，减少并发事务同时对同一索引位置插入的情况。

2. **锁定策略调整**：考虑调整表的索引策略，或者在可能的情况下，使用更低隔离级别（如 `READ COMMITTED`）以减少 gap 锁的使用。

3. **批量插入**：如果可能，将多条插入操作批量执行，减少每次单条插入操作时加锁的次数。

4. **间隙锁的避免**：如果应用场景允许，减少唯一性约束，避免间隙锁的发生。

这样可以帮助缓解类似的死锁问题。如果问题频繁出现，建议增加监控和分析锁的使用情况。

## 解决思路
批量插入本身不会直接减少 **gap 锁**，但可以间接减少出现死锁的概率。以下是详细的分析：

#### Gap 锁的作用
Gap 锁通常在 **`REPEATABLE READ`** 隔离级别下，用于防止幻读（Phantom Reads），即防止其他事务在当前事务扫描的索引范围内插入新记录。尤其是在具有唯一性约束（如唯一索引）的情况下，插入操作会触发 gap 锁，来确保当前索引范围内的插入安全。

#### 为什么批量插入可能减少死锁：
1. **减少事务次数**：批量插入将多次插入合并为一次事务，从而减少了每次插入时加锁和释放锁的频率。这降低了事务之间相互等待锁的机会，从而间接减少死锁的发生。
   
2. **减少并发锁冲突**：单次批量插入会一次性获取所需的锁，减少了多个事务同时请求锁的竞争，从而减少了并发场景下发生 gap 锁冲突的可能性。

3. **锁持有时间减少**：批量插入操作可以让事务更快地完成，从而缩短锁的持有时间，降低其他事务等待锁的时间。

#### 注意事项：
- **批量插入并不能完全避免 gap 锁**。如果多个批量插入操作同时执行，且插入的数据范围有重叠，仍然会发生 gap 锁。
  
- **表的设计和索引结构**也对 gap 锁有影响。如果索引结构不合理，即使是批量插入，仍然可能遇到 gap 锁。

#### 总结
批量插入可以通过减少事务频率和锁的持有时间，降低死锁的发生率，但它并不会直接减少 gap 锁的使用。如果 gap 锁是死锁的主要原因，可以考虑其他措施，如调整表结构、索引设计，或选择不同的事务隔离级别（如 `READ COMMITTED`，该级别下不会产生 gap 锁）。


#### 最终执行动作
- 修改为update方式
- 缩小事务范围
- 对于某些场景可以不操作数据库


-------
[参考](https://xiaolincoding.com/mysql/lock/deadlock.html#_1%E3%80%81%E8%AE%B0%E5%BD%95%E4%B9%8B%E9%97%B4%E5%8A%A0%E6%9C%89%E9%97%B4%E9%9A%99%E9%94%81)

