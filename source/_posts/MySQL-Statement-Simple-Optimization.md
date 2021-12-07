---
title: MySQL Statement Simple Optimization
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031150350.jpg'
coverImg: /img/20211031150350.jpg
cover: false
toc: true
mathjax: false
date: 2021-12-07 15:48:02
summary: 简单记录一些常见语句的优化。
categories: MySQL
keywords: MySQL
tags: MySQL
---

## 常用 SQL 语句优化

### 1、批量插入

提到批量插入，Java 最简单的方法的方法就是写个循环，每一次向数据库插入一条记录，这种方式每次都要和数据库建立一次连接，最后释放，非常麻烦。



MySQL 提供了一种非标准 sql 的语法格式：

```sql
INSERT INTO `user` (username, `password`, amount) 
VALUES ('赵六', '111111', 2), ('张三', '222222', 3);
```

用逗号隔开多条记录就可以实现批量插入。



> 优化一

使用递增的主键去有序插入：

```sql
INSERT INTO `user` (id, username, `password`, amount) 
VALUES (1, '赵六', '111111', 2), (2, '张三', '222222', 3);
```



> 优化二

在事务中插入：

```sql
START TRANSACTION;

INSERT INTO `user` (username, `password`, amount) 
VALUES ('赵六', '111111', 2), ('张三', '222222', 3);

COMMIT;
```



### 2、判断是否存在

常规方式是使用聚集函数统计：

```sql
SELECT COUNT(*) FROM `user`;
```

这种方式在大量数据时效率会变低，可以使用 limit 优化，注意这也是 MySQL 特有的：

```sql
SELECT 1 FROM `user` WHERE amount = 2 LIMIT 1;
```

但是需要注意的是在 Java 中要用 `Integer` 去接收结果，因为查询不到就会返回 N/A，Java 解析为 null。
