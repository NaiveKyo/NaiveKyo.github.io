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

在 MySQL 中查询表，有一张表的字段名为 `no`，为数据库关键字，编写 SQL 语句时，如何查询该字段

> A

SQL 语句将该字段用单引号括起来，如果不行，可以使用反引号

<mark>对比 Sql Server，在 Sql Server 数据库中遇到关键字使用中括号括起来，`[]`</mark>

<mark>对比 Oracle，在 Oracle 数据库中遇到关键字使用双引号括起来，`""`</mark>

## 4、匹配某个字段的字符

> Q

匹配这样的记录，某个字段共 8 位，前四位为 0000，匹配后四位：



> A

```sql
-- 方法一：使用正则表达式
SELECT * FROM categories WHERE path_code REGEXP '^0000.{4}$';

-- 方法二：使用模糊匹配
SELECT * FROM `categories` where path_code like '0000____' AND flag = 0;
```



## 5、检测是否存在符合条件的记录

> Q

某个场景需要先查询是否有符合条件的数据，在进行后面的操作。

一般使用的是：

```sql
select count(*) from table_name where id = 条件;

-- 可以使用 explain 测试一下
explain select count(*) from table_name where id = 条件;
```

> A

在少量的数据中使用上面的语句是没有问题，但是一旦数据量变大，该语句执行就会变慢，而使用如下语句性能更高

```sql
select 1 from table_name where id = 条件 limit 1;
```



总结：

- 少量数据 **count(*)** 和 **limit 1** 没有什么区别
- 但是大量数据下最好使用 **limit 1**，效率更高



## 6、from 多个表 join 

将多个表和其他表进行联接，需要用括号括起来：

```sql
select a.*, b.*, c.xxx
from (a, b)
left join c on a.id = c.id;
```



## 7、查询表时模拟序号

可以使用临时变量：

```sql
SELECT @rownum:=@rownum+1 AS '序号', 
c.course_no AS '课程编号', c.course_name AS '课程名称', c.course_period AS '总学时',
c.course_credit AS '学分', a.academy_name AS '所属院系', 
(CASE c.course_type WHEN 0 THEN '必修' WHEN 1 THEN '公选课' WHEN 2 THEN '限选课' END) AS '课程类别',
(IF(c.course_exam = 0, '考试', '考察')) AS '考试方式'
FROM (course AS c, (SELECT @rownum:=0) AS t)
INNER JOIN academy AS a ON a.academy_code = c.course_academy_code AND a.delete_flag = 0
WHERE c.delete_flag = 0;
```

<mark>注：在 DQL 和 DML 语句中 = 的意思就是判断相等，而在用户变量的赋值操作时使用 :=，例如 set @tmp:=1、@tmp:=@tmp+1</mark>



## 8、where 和 having

- where 是对数据库指定表的字段进行条件筛选；
- having 是对 select 中选中的字段的数据进行条件筛选。

