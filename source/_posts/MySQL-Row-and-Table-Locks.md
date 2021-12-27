---
title: MySQL Row and Table Locks
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210728174103.jpg'
coverImg: /img/20210728174103.jpg
toc: true
date: 2021-07-28 17:40:17
top: false
cover: false
summary: MySQL 数据库的行锁和表锁简介
categories: MySQL
keywords: [MySQL, Locks]
tags: MySQL
---

# MySQL 行锁和表锁概述

## 一、前言

MySQL 常用引擎有 **MyISAM** 和 **InnoDB**，而 InnoDB 是 MySQL 默认的引擎。MyISAM 仅支持表锁，不支持行锁，而 InnoDB 支持行锁和表锁。



### 1、如何加锁

MyISAM 在执行查询语句（SELECT）前，会自动给涉及的所有表加 **读锁**，在执行更新操作（UPDATE、DELETE、INSERT 等）前，会自动给涉及的表加 **写锁**，这个过程并不需要用户干预，因此用户一般不需要直接用 `LOCK TABLE` 命令给 MyISAM 表显式加锁。



### 2、显式加锁

上共享锁（读锁）的写法：`lock in share mode`，例如：

```sql
select name from `user` where age > 20 lock in share mode;
```



对于 insert、update、delete 会默认加排它锁，对于 select，我们可以这样显式加写锁（排它锁）

上排它锁（写锁）的写法：`for update`，例如：

```sql
select name from `user` where age < 18 for update;
```



## 二、表锁

优缺点：

- 不会出现死锁，但是发生锁冲突的几率高，适合并发量低的场景



> MyISAM 引擎

MyISAM在执行查询语句（select）前，会自动给涉及的所有表加读锁，在执行增删改操作前，会自动给涉及的表加写锁。



MySQL 的表级锁有两种模式：

- 表共享读锁
- 表独占写锁



**读锁会阻塞写，写锁会阻塞读和写**

- 对 MyISAM 表的读操作，不会阻塞其他进程对同一表的读请求，但是会阻塞对同一表的写请求。只有当读锁释放后，才会执行其他进程的操作
- 对 MyISAM 表的写操作，会阻塞其他进程对同一表的读和写操作，只有当写锁释放后，才会执行其他进程的读写操作



MyISAM 不适合做写为主表的引擎，因为写锁后，其它线程不能做任何操作，大量的更新会使查询很难得到锁，从而造成永远阻塞



## 三、行锁

优缺点：

- 会出现死锁，但是发生锁冲突的几率低，适合并发高的场景

在 MySQL 的 `InnoDB` 引擎支持行锁，与 Oracle 不同，MySQL 的行锁是通过 **索引** 加载的，也就是说，行锁是加在索引响应的行上的，要是对应的 SQL 语句没有走索引，则会全表扫描，行锁则无法实现，取而代之的是表锁，此时其它事务无法对当前表进行更新或插入操作。



### 1、for update （排它锁）

insert、delete、update 在事务中都会默认加上排它锁。

如果在一条 `select` 语句后加上 `for update`，则查询到的数据会被加上一条排它锁，其它事务可以读取，但不能进行更新和插入操作。

```sql
-- A 用户对 id = 1 的记录进行加锁
select * from user where id = 1 for update;

-- B 用户无法对该记录进行操作
update user set count = 10 where id = 1;

-- A 用户 commit 以后则 B 用户可以对该记录进行操作
```



### 2、行锁实现

> 注意点



- 行锁必须有 <font style="color:red;">索引</font> 才能实现，否则会自动锁全表，升级为表锁
- 两个事务不能锁同一个索引
- insert、delete、update 在事务中都会默认加上排它锁



> 使用场景



比如客户购物的情形：

A 用户消费，service 层先查询该用户的账户余额，若余额足够，则进行后续的扣款操作；这种情况查询的时候应该对该记录进行加锁。

否则，B 用户在 A 用户 **查询后消费前** 先一步将 A 用户账号上的钱转走，而此时 A 用户已经进行了用户余额是否足够的判断，则可能会出现余额已经不足但却扣款成功的情况。

为了避免此情况，需要在 A 用户操作该记录的时候进行 `for update` 加锁。



## 四、间隙锁

当我们用 <font style="color:red;">范围条件</font> 而不是相等条件检索数据，并请求共享或排他锁时，InnoDB 会给符合条件的已有数据记录的索引项加锁；对于键值在条件范围内并不存在的记录，叫做间隙。

InnoDB 也会对这个"间隙"加锁，这种锁机制就是所谓的间隙锁：

```sql
-- 用户 A
update user set count = 8 where id > 2 and id < 6;

-- 用户 B
update user set count = 10 where id = 5;
```

如果用户 A 在进行了上述操作后，事务还未提交，则 B 无法对 2~6 之间的记录进行更新或插入记录，会阻塞，当 A 将事务提交后，B 的更新操作会执行。



## 五、建议

- 尽可能让所有数据检索都通过索引来完成，避免无索引导致行锁升级为表锁
- 合理设计索引，尽量缩小锁的范围
- 尽可能减少索引条件，避免间隙锁
- 尽量控制事务大小，减少锁定资源量和时间长度
