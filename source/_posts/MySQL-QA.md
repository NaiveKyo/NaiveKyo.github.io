---
title: MySQL QA
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210720094140.jpg'
coverImg: /img/20210720094140.jpg
toc: true
date: 2021-07-20 09:40:48
top: false
cover: false
summary: 记录使用 MySQL 过程中遇到的问题及解决方法
categories: MySQL
keywords: MySQL
tags: MySQL
---



# MySQL Question & Answer

## 1、MySQL 主键 id 不连续

> Q

创建 MySQL 表，主键设为自增，测试时添加了数据，但是最后删除了，此后插入数据，主键从删除的测试记录主键开始自增，最终导致主键 id 不连续。

> A

- 删除完测试数据，还没有新增数据，即还没有出现不连续的数据 ID 时，可以这样

重置主键自增的出发点

```sql
ALTER TABLE 表名 AUTO_INCREMENT = 1;
```

可以指定从哪一个值开始自增



- 表中已经出现不连续的主键 ID 时，可以这样

```sql
SET @auto_id = 0;
UPDATE 表名 SET 自增字段名 = (@auto_id := @auto_id + 1);
ALTER TABLE 表名 AUTO_INCREMENT = 1;
```



## 2、MySQL 关键字和保留字

>Q

数据库字段设置为 MySQL 保留字或者关键字，造成执行 sql 语句时提示语法错误。



> A

将对应字段修改即可

附：https://dev.mysql.com/doc/mysqld-version-reference/en/keywords.html



## 3、表中字段为数据库关键字

> Q

在 SQL Server 中查询表，有一张表的字段名为 `no`，为数据库关键字，编写 SQL 语句时，如何查询该字段

> A

SQL 语句将该字段用单引号括起来，如果不行，可以使用反引号
