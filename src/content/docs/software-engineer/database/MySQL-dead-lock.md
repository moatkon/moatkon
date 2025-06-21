---
title: MySQL死锁
description: MySQL死锁
template: doc
lastUpdated: 2023-12-20 00:08:41
---
### MySQL死锁是什么?
死锁是指两个或两个以上的进程在执行过程中,因争夺资源而造成的一种**互相等待**的现象,若无外力作用,它们都将无法推进下去.此时称系统处于死锁状态或系统产生了死锁,这些永远在互相等的进程称为死锁进程。

### 什么情况下会出现MySQL死锁?
> 场景设置: 基于 InnoDB存储引擎并且隔离级别为REPEATABLE-READ(可重复读)

##### 场景 AB BA
```sql
# session A
select * from deadlock where id = 1 for update; 

# session B
select * from deadlock where id = 2 for update; 

# session A
select * from deadlock where id = 2 for update;

# session B
select * from deadlock where id = 1 for update;
##  Deadlock found when trying to get lock; try restarting transaction
```


### 怎么查有哪些MySQL死锁?
1. 查看当前的事务
    ```sql
    SELECT * FROM INFORMATION_SCHEMA.INNODB_TRX;
    ```

    获取 `trx_mysql_thread_id`
2. 查看当前锁定的事务
    ```sql ins="INNODB_LOCKS"
    SELECT * FROM INFORMATION_SCHEMA.INNODB_LOCKS;
    ```

3. 查看当前等锁的事务
    ```sql ins="INNODB_LOCK_WAITS"
    SELECT * FROM INFORMATION_SCHEMA.INNODB_LOCK_WAITS;
    ```

4. 查看是否锁表
   ```
   SHOW OPEN TABLES where In_use > 0;
   ```
   在发生死锁时，这几种方式都可以查询到和当前死锁相关的信息。

5. 查看最近死锁的日志
    ```
    show engine innodb status
    ```


### 怎么解决MySQL死锁?
1. 设置事务等待锁的超时时间
2. 开启主动死锁检测。当系统检测到死锁时，通常会选择其中一个事务作为死锁牺牲者，并回滚该事务，释放资源以解除死锁。
3. 使用kill命令

### 如何在业务开发中尽量去避免死锁

- ✅ 合理的设计索引，区分度高的列放到组合索引前面，**使业务 SQL 尽可能通过索引定位更少的行，减少锁竞争**。
- ✅ 优化 SQL 和表设计，减少同时占用太多资源的情况。比如说，减少连接的表，**将复杂 SQL 分解为多个简单的 SQL**。
- ✅ 避免大事务，**尽量将大事务拆成多个小事务来处理**，小事务发生锁冲突的几率也更小。
- 调整业务逻辑 SQL 执行顺序， 避免 update/delete 长时间持有锁的 SQL 在事务前面。
- 以固定的顺序访问表和行。比如两个更新数据的事务，事务 A 更新数据的顺序为 1，2;事务 B 更新数据的顺序为 2，1。这样更可能会造成死锁。
- 在并发比较高的系统中，不要显式加锁，特别是是在事务里显式加锁。如 select … for update 语句，如果是在事务里(运行了 start transaction 或设置了autocommit 等于0),那么就会锁定所查找到的记录。
- 尽量按主键/索引去查找记录，范围查找增加了锁冲突的可能性，也不要利用数据库做一些额外额度计算工作。比如有的程序会用到 “select … where … order by rand();”这样的语句，由于类似这样的语句用不到索引，因此将导致整个表的数据都被锁住。

<!-- https://github.com/WilburXu/blog/blob/master/MySQL/MySQL%20%E4%BD%A0%E5%A5%BD%EF%BC%8C%E6%AD%BB%E9%94%81.md -->