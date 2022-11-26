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

## 9、多表联合更新

参考：https://stackoverflow.com/questions/4361774/mysql-update-multiple-tables-with-one-query

使用 inner join：

```sql
UPDATE t1
INNER JOIN t2 ON t2.t1_id = t1.id
INNER JOIN t3 ON t2.t3_id = t3.id
SET t1.a = 'something',
    t2.b = 42,
    t3.c = t2.c
WHERE t1.a = 'blah';
```



## 10、MySQL 的 CHAR 和 VARCHAR

char 和 varchar 非常相似，但是在存储和检索上有很大的差异，在最大长度和是否保留尾随空间也有所不同；

创建表时给 char 或者 varchar 指定的长度表示的是希望存储的最大字符数，比如 CHAR(30) 可以存储 30 个字符；

CHAR 类型字段的长度在创建表的时候已经指定了，取值范围在 0 - 255。当存储了一个 char 字段，实际长度没有达到最大的长度，此时不足的字符用空格右填充。而在检索的时候又会去掉这些填充的字符（除非指定 SQL Mode 为 `PAD CHAR TO FULL LENGTH`：https://dev.mysql.com/doc/refman/8.0/en/sql-mode.html#sqlmode_pad_char_to_full_length）；

VARCHAR 类型的字段表示变长字符串，可以声明的长度取值范围为 0 - 65535，VARCHAR 的最大有效长度受制于 maximum row size（所有列共享 65545 个字节）以及字符集，参考：https://dev.mysql.com/doc/refman/8.0/en/column-count-limit.html

和 CHAR 相反，VARCHAR 存储 1 字节或者 2 字节的前缀和实际数据，前缀存储的值表明该字符串的字节数。如果值的字符数不超过 255 个字节，则前缀只需使用一个字节，否则使用两个字节。

如果没有启用严格 SQL 模式，并且为 CHAR 或 VARCHAR 列分配的值超过了该列的最大长度，则就生成警告信息并截断该值。如果对于此种情况想要生成错误而非警告则可以参考 [Server SQL Mode](https://dev.mysql.com/doc/refman/8.0/en/sql-mode.html)。

例子：

比如 char(4) 和 varchar(4)，要存储的字符串值不足 4 字符，则 char 在实际值后面补空白字符（有后缀），检索的时候去掉后缀；

varchar 则判断要存储的字符占用字节是否在 0 - 255 之内，在范围内则取一字节前缀 + 实际字符串占用空间作为最终存储空间，在检索的时候也不会去掉前缀。（注：大于 255 字节则使用两字节前缀）

更多信息参考：

- https://dev.mysql.com/doc/refman/8.0/en/char.html

注意：字符串长度和字符串实际存储占用字节数，前者有开发者创建表时声明，后者由数据库存储引擎以及字符集决定。