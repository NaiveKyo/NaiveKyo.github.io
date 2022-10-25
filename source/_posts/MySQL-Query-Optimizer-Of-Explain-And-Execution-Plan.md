---
title: MySQL Query Optimizer Of Explain And Execution Plan
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425110519.jpg'
coverImg: /img/20220425110519.jpg
cover: false
toc: true
mathjax: false
date: 2022-10-25 21:46:04
summary: "MySQL 查询优化之 Explain 及执行计划"
categories: "MySQL"
keywords: "MySQL"
tags: "MySQL"
---

# 一、简介

MySQL 提供了 `Explain` 关键字用于查看一条 sql 语句在经过了优化器的各种处理后，最终生成的执行计划。

先来看看官方对它的介绍：https://dev.mysql.com/doc/refman/8.0/en/using-explain.html

- EXPLAIN 适用于 select、delete、insert、replace 和 update 语句；
- 当 EXPLAIN 作用于可解析的 SQL 语句时，它会显示出经过优化器处理后得到的执行计划信息，该执行计划解释了 MySQL 是如何执行该语句的，包括表是按照什么样的顺序进行连接的；
- 当 EXPLAIN 用于 `FOR CONNECTION connection_id` 而不是其他可解释的语句时，它会展示在该命名连接（`named connection`） 中执行语句的执行计划信息；
- 对于 select 语句，EXPLAIN 提供了 `SHOW WARNINGS` 语法用于展示更详细的信息；
- 对于涉及到分区表的查询时，EXPLAIN 非常有用；
- EXPLAIN 可以使用 `FORMAT` 选项决定输出信息的格式，该选项的默认值为 `TRADITIONAL` 参数表示输出表格形式，还有 `JSON` 和 `TREE` 两种；

通过 EXPLAIN 语法提供的信息，我们可以对数据库或者 SQL 语句进行优化，比如添加合适的索引让数据查询的速度更快，也可以检查优化器是不是按照合理的顺序连接表。

除了 EXPLAIN 外，还可以使用 `optimizer trace` 查询更多的信息作为补充，但是它捕捉的信息和输出的结果和 MySQL 的版本相关。

```
{EXPLAIN | DESCRIBE | DESC}
    tbl_name [col_name | wild]

{EXPLAIN | DESCRIBE | DESC}
    [explain_type]
    {explainable_stmt | FOR CONNECTION connection_id}

{EXPLAIN | DESCRIBE | DESC} ANALYZE [FORMAT = TREE] select_statement

explain_type: {
    FORMAT = format_name
}

format_name: {
    TRADITIONAL
  | JSON
  | TREE
}

explainable_stmt: {
    SELECT statement
  | TABLE statement
  | DELETE statement
  | INSERT statement
  | REPLACE statement
  | UPDATE statement
}
```

演示用的数据库：

- https://dev.mysql.com/doc/index-other.html

- https://dev.mysql.com/doc/sakila/en/

  sakila 数据库是 MySQL 官方提供的一个模拟电影出租厅信息管理系统的数据库。



# 二、EXPLAIN 输出

默认的表格格式下，EXPLAIN 会为在 select 语句中出现的每一个表输出一行信息，它们按照一定的顺序排列，而 MySQL 会在处理语句时读取这些信息。**这就意味着 MySQL 在第一个表中读取一条数据后，就会去第二个表找到一条匹配的行，然后到第三张表中继续寻找，以此类推。**

（PS：MySQL 官方推荐使用配套的 MySQL Workbench 管理工具，里面有执行计划的可视化图示）；



EXPLAIN 输出的表中每一行都是一张表的相关信息，下面我们用一张表来说明各列的含义，这张表第一列是 FORMAT 为 TRADITIONAL 时的列名，第二列是 FORMAT 为 JSON 时对应的属性：

| Column        | JSON          | 含义                                                         |
| ------------- | ------------- | ------------------------------------------------------------ |
| id            | select_id     | SELECT 的标识符（复杂查询中可能有多个子查询，每个查询应当可以区分） |
| select_type   | None          | SELECT 的类型（查询类型）                                    |
| table         | table_name    | 当前行对应的表的名称                                         |
| partitions    | partitions    | 匹配到的分区信息 partitions                                  |
| type          | access_type   | 连接的类型（针对单表的访问方式）                             |
| possible_keys | possible_keys | 可能选择的索引 indexes                                       |
| key           | key           | 实际使用的索引                                               |
| key_len       | key_length    | 使用的 key 的长度（索引字段的长度）                          |
| ref           | ref           | 和索引匹配的列（使用索引等值查询时，和索引列等值匹配的行的信息） |
| rows          | rows          | 预计要检查的行数（索引匹配到的行）                           |
| filtered      | filtered      | 根据条件过滤掉的行占总行数的百分比                           |
| Extra         | None          | 附加的信息                                                   |

注意：在 JSON 模式下，为 NULL 的属性不会出现在结果信息中。

下面对每一列做详细介绍：

## （1）id（select_id）

 在一次查询中 SELECT 的序列号，该值为 NULL 时表示当前行引用的是其他行的结果的联合，此种情况下，table 列显示的格式类似 `<unionM,N>`，表示该行引用的是 id 为 M 和 N 的行的结果的并集。

查询语句中每出现一个 SELECT，MySQL 就会为其分配一个唯一的 id 号，这个 id 就对应着 EXPLAIN 输出信息中的第一列，需要注意的是一个 id 号可以出现在多行中。

------

<font style='color:red'>两行 id 号相同：</font>

- 此种情况一般出现在表连接中，比如下列情况：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20221009230254.png)

以 sakila 数据库中的 customer 和 payment 表为例，注意前者比后者数据量小，EXPLAIN 输出结果中 customer 表对应的记录在第一行，payment 是第二行，两行的 id 号都是 1，但是先后顺序不同，这是因为优化器决定了 customer 表是 **驱动表**，payment 表表示 **被驱动表**。

---

<font style='color:red'>子查询及子查询重写：</font>

对于包含子查询的的查询语句来说，由于使用了多个 SELECT 关键字，所以 EXPLAIN 输出信息中可能包含至少一种 id 号：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20221009234240.png)

这里可以看到，外层 SELECT 的 id 是 1，子查询 SELECT 的 id 是 2；

需要注意的是，**查询优化器可能对涉及子查询的查询语句进行重写，从而转换为连接查询**，比如下面的情况：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20221009234432.png)

这里做了优化，子查询重写为连接查询，并使用小表驱动大表；

---

<font style='color:red'>特殊的 UNION：</font>

对于包含 UNION 的查询语句比较特殊：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20221009234620.png)

这里出现了前面说的 id 为 NULL 的情况，这里的 table 显示的是 `<union1,2>` 表示该行引用 id 为 1 和 2 的查询结果的并集。

UNION 子句将多个查询的结果合并并进行去重，如何去重则是利用内部的临时表（Extra 中也提到了相关信息），如上图所示，创建了一个名为 `<union1,2>` 的临时表，它的 id 是 NULL；

如果是 UNION ALL，则不需要：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20221009235043.png)

使用的 sql：

```sql
-- JSON 格式输出
EXPLAIN FORMAT = JSON SELECT SUM(b.amount)
FROM customer a
INNER JOIN payment b ON a.customer_id = b.customer_id
WHERE a.email = 'JANE.BENNETT@sakilacustomer.org';

-- 默认格式输出
EXPLAIN SELECT SUM(b.amount)
FROM customer a
LEFT JOIN payment b ON a.customer_id = b.customer_id
WHERE a.email = 'JANE.BENNETT@sakilacustomer.org';

-- 使用子查询
EXPLAIN SELECT c.amount FROM customer a
INNER JOIN (SELECT customer_id, SUM(amount) AS amount FROM payment GROUP BY customer_id) AS c
WHERE a.customer_id = c.customer_id
AND a.email = 'JANE.BENNETT@sakilacustomer.org';

-- 子查询
EXPLAIN SELECT *
FROM payment
WHERE customer_id IN (SELECT customer_id FROM customer WHERE customer_id > 500) OR amount > 6.00;

-- 重写子查询
EXPLAIN SELECT *
FROM payment
WHERE customer_id IN (SELECT customer_id FROM customer WHERE customer_id > 500);

-- UNION
EXPLAIN SELECT customer_id FROM customer
UNION
SELECT customer_id FROM payment;

-- UNION ALL
EXPLAIN SELECT customer_id FROM customer
UNION ALL
SELECT customer_id FROM payment;


SELECT COUNT(*) AS a FROM customer
UNION ALL
SELECT COUNT(*) AS b FROM payment;
```

## （2）select_type（none）

SELECT 的类型，可取的值如下表所示（需要注意的是在 JSON 输出格式中，当该类型是 SIMPLE 或者 PRIMARY 时不会在结果中显示，其他情况下 JSON 的 `query_block` 的属性表示 select_type 的值）：

| select_type          | JSON Name                  | 含义                                                         |
| -------------------- | -------------------------- | ------------------------------------------------------------ |
| SIMPLE               | None                       | 最简单直接的查询，不包含 UNION 或者子查询，查询单表或者连接查询都属于这个； |
| PRIMARY              | None                       | 最外层的查询（驱动表），对于包含 UNION、UNION ALL 或者子查询的大查询来说，它是由几个小查询组成的，其中最左边的那个查询的 select_type 值就是 PRIMARY |
| UNION                | None                       | 对于包含 UNION、UNION ALL 的大查询来说，它是由几个小查询组成的，其中除了最左边的那个小查询以外，第二个及后面的小查询的 select_type 值是 UNION |
| DEPENDENT UNION      | dependent(true)            | 在包含 UNION、UNION ALL 的大查询中，它是由几个小查询组成，除了最左边那个小查询外，第二个及后面的查询如果是 UNION 且是相关子查询，则其 select_type 的值是 DEPENDENT_UNION |
| UNION RESULT         | union_result               | MySQL 选择使用临时表来完成 UNION 合并结果的去重工作，针对该临时表的查询的 select_type 是 UNION RESULT |
| SUBQUERY             | None                       | 在一个复杂查询中，除了最左边的，后面的如果包含子查询，则子查询的第一个查询的 select_type 值是 SUBQUERY |
| DEPENDENT SUBQUERY   | dependent(true)            | 在一个复杂查询中，除了最左边的，后面的如果包含子查询，且该子查询无法被从写为连接查询，同时又是相关子查询，则该子查询的第一个查询的 select_type 值是 DEPENDENT SUBQUERY |
| DERIVED              | None                       | 派生表，其实就是将一个查询作为临时表，然后从该临时表中进行查询，则该临时表的 select_type 的值是 DERIVED |
| DEPENDENT DERIVED    | dependent(true)            | 派生表依赖于其他表，在一个复杂查询中，构成临时表的子查询是相关子查询 |
| MATERIALIZED         | materialized_from_subquery | 物化子查询，将其转换为物化表                                 |
| UNCACHEABLE SUBQUERY | cacheable(false)           | 一个子查询的结果无法被缓存，其外部查询每次调用该子查询都要重新计算一次 |
| UNCACHEABLE UNION    | cacheable(false)           | 在一个复杂查询中，除了第一个查询，后面的查询中如果有 UNION，则 UNION 的第二个及以后的查询属于不能缓存的子查询 |

补充：

- 一般带 `DEPENDENT` 的是相关子查询，参考：[Section 13.2.11.7, "Correlated Subqueries"](https://dev.mysql.com/doc/refman/8.0/en/correlated-subqueries.html) ；
- `DEPENDENT SUBQUERY` 的评估方式不同于 `UNCACHEABLE SUBQUERY`，前者相关子查询依赖外部表，对外部表而言，相关子查询只会重新评估一次，而后者不能缓存的子查询，每次外部表每一行和该子查询比对时，该子查询都会重新评估一次；
- 当 EXPLAIN 后面跟的不是 SELECT 类型的语句时，select_type 的值受到语句类型的影响，比如 DELETE 语句经过 EXPLAIN 解释后输出的 select_type 的值是 DELETE；

## （3）table（table_name）

对于一个复杂的查询，EXPLAIN 会将其进行解析，拆分为对多个小表的查询，输出结果中，每一行就对应对某个单表的访问方法，这条记录的 table 代表这张表的名称；

它还可以是下列值中的某一个：

- `<union<M,N>`：id 为 M 和 N 的结果的并集；
- `<derivedN>`： id 为 N 的行表示派生表，比如说在 from 关键字后面跟的一个子查询可以作为一个派生表；
- `<subqueryN>`：id 为 N 的行表示物化表，参考 [8.2.2.2 Optimizing Subqueries with Materialization](https://dev.mysql.com/doc/refman/8.0/en/subquery-materialization.html) ；

## （4）partitions（partitions）

表示查询匹配到的记录的分区，没有分区的表，该值为 NULL。参考 [24.3.5 Obtaining Information About Partitions](https://dev.mysql.com/doc/refman/8.0/en/partitioning-info.html)



## （5）type（access_type）

连接的类型（the join type）

type 描述了 table 是如何连接的，在 JSON 输出格式中，type 叫做 access_type。下面列举出 type 的取值范围以及代表的含义，按照**最好到最坏的顺序排列**：

`system > const > eq_ref > ref > fulltext > ref_or_null > index_merge > unique_subquery > index_subquery > range > index > ALL`

### system

只有一行的表（= system table），它是 const 类型的一种特例。

tip：表中只有一行，**且该表使用的存储引擎的统计数据是精确的，比如 MyISAM、Memory**，那么对该表的访问方法就是 system。

### const

最多只匹配到表中的一行记录，在查询开始时读取该行。因为只有一行数据，所以查询优化器的其他部分将其视为一个常量，const 表非常块，因为只会读取一次。

当我们使用主键索引或者唯一索引和常量值进行等值匹配（如果是组合索引比如匹配所有部分），此时该表将会被视为 const：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20221011231740.png)

该例子中，actor_id 为主键，actor_id = 1 为和常量进行等值匹配。

官网例子：

```sql
SELECT * FROM tbl_name WHERE primary_key=1;

SELECT * FROM tbl_name
  WHERE primary_key_part1=1 AND primary_key_part2=2;
```

### eq_ref

对于前面的所有表的所有组合，从当前表读取一行进行匹配。（原文：One row is read from this table for each combination of rows from the previous tables. ）

除了 system 和 const 类型，eq_ref 就是最好的连接类型了，当使用索引的所有部分并且索引是主键索引或者唯一非空索引（UNION NOT NULL）进行连接时使用该类型。

eq_ref 可用于索引列使用等值匹配 = 的情况，比对的值可以是常量也可以是从前面的表中读取的列数据，比如下面的官方例子：

```sql
SELECT * FROM ref_table,other_table
  WHERE ref_table.key_column=other_table.column;

SELECT * FROM ref_table,other_table
  WHERE ref_table.key_column_part1=other_table.column
  AND ref_table.key_column_part2=1;
```

也可以看到前面查询某个演员参演的所有作品的例子，其中电影表的访问方式就是 eq_ref。

简而言之，在连接时，如果被驱动表通过主键或者唯一非空索引（包括组合索引，但条件中必须包含索引的所有部分）以等值匹配的方式进行访问的，则对该被驱动表的访问方式就是 eq_ref。

### ref

对于前面所有的表行的组合，从当前表中读取所有匹配上的索引的值。

如果连接当前表时，使用的是组合索引的最左前缀，或者键不是主键或唯一索引，则连接类型是 ref（也可以这样说，连接无法根据相应的键值选择一行记录）。

如果通过键只匹配到几行记录，则它也是一个不错的连接类型。

ref 类型可以用于 = 或者 <=> （排除 NULL 的等值匹配）

官方例子：

```sql
SELECT * FROM ref_table WHERE key_column=expr;

SELECT * FROM ref_table,other_table
  WHERE ref_table.key_column=other_table.column;

SELECT * FROM ref_table,other_table
  WHERE ref_table.key_column_part1=other_table.column
  AND ref_table.key_column_part2=1;
```

这里提一下组合索引，[参考这个 8.3.6 Multiple-Column Indexes](https://dev.mysql.com/doc/refman/8.0/en/multiple-column-indexes.html)，索引的数量和长度受到存储引擎的限制，而所有之所以很快，是因为建立索引的列的值会被存储到其他的数据结构中，比如常用的 B Tree，在 B Tree 中找到指定的值，就可以找到表中对应的行。

最常见的索引是单列索引，当然也有组合索引，组合索引最多包含 16 列，它们可以视为一个有序数组，一定要注意 **在使用组合索引时要按照定义索引时的顺序去使用它们**，这样查询优化器才可以做一些处理，对于组合索引而言有一个最左前缀的概念（leftmost prefix），比如有一个组合索引（col1，col2，col3），则它的最左前缀包括（col1）、（col1，col2）、（col1，col2，col3），注意顺序一定不能乱，使用任一最左前缀进行匹配就会被优化器采用。

有效例子：

```sql
SELECT * FROM test WHERE last_name='Jones';

SELECT * FROM test
  WHERE last_name='Jones' AND first_name='John';

SELECT * FROM test
  WHERE last_name='Jones'
  AND (first_name='John' OR first_name='Jon');

SELECT * FROM test
  WHERE last_name='Jones'
  AND first_name >='M' AND first_name < 'N';
```



官方给出一个失效的例子：

```sql
CREATE TABLE test (
    id         INT NOT NULL,
    last_name  CHAR(30) NOT NULL,
    first_name CHAR(30) NOT NULL,
    PRIMARY KEY (id),
    INDEX name (last_name,first_name)
);

SELECT * FROM test WHERE first_name='John';

SELECT * FROM test
  WHERE last_name='Jones' OR first_name='John';
```

第一个查询没有按照顺序使用最左前缀，第二个查询是最左前缀中使用 OR 连接，不确定谁在前谁在后，不具备顺序性，注意它和上面的用括号括起来的 OR 连接不一样，前面的按照优先级看，是按照最左前缀的顺序的。



### fulltext

连接使用了全文检索。



### ref_or_null

这种连接方式有点类似 `ref` ，但是 MySQL 会额外搜索包含 NULL 值的行，这种连接优化方式常用于解析子查询的时候。参考 [8.2.1.15 IS NULL Optimization](https://dev.mysql.com/doc/refman/8.0/en/is-null-optimization.html)

例如：

```sql
SELECT * FROM ref_table
  WHERE key_column=expr OR key_column IS NULL;
```



### index_merge

当出现了该连接类型就表示优化器使用了索引合并优化（Index Merge optimization）参考 [8.2.1.3 Index Merge Optimization](https://dev.mysql.com/doc/refman/8.0/en/index-merge-optimization.html)

一般情况下对某个表的查询只能使用到一个索引，但是在某些场景下可以使用 Intersection、Union、Sort-Union 这三种索引合并方式来执行查询，看看官方给出的例子：

```sql
SELECT * FROM tbl_name WHERE key1 = 10 OR key2 = 20;

SELECT * FROM tbl_name
  WHERE (key1 = 10 OR key2 = 20) AND non_key = 30;

SELECT * FROM t1, t2
  WHERE (t1.key1 IN (1,2) OR t1.key2 LIKE 'value%')
  AND t2.key1 = t1.some_col;

SELECT * FROM t1, t2
  WHERE t1.key1 = 1
  AND (t2.key1 = t1.some_col OR t2.key2 = t1.some_col2);
```

从中可以看出 Index Merge 优化是将多个范围查询的结果合并到一个，且要求必须为单表。

这种方式也有限制：

- 如果查询中使用了复杂的 where 查询，比如 deep AND/OR nesting，MySQL 就不会使用该优化方式，而是将其转换为下面的方式进行分发：

```sql
(x AND y) OR z => (x OR z) AND (y OR z)
(x OR y) AND z => (x AND z) OR (y AND z)
```

- index_merge 方式不适合全文搜索。

更多信息参考官方；

### unique_subquery

在某些 IN 子查询中，这种方式其实是 eq_ref 方式的替代，比如：

```sql
value IN (SELECT primary_key FROM single_table WHERE some_expr)
```

如果查询优化器决定将 IN 子查询转换为 EXISTS 子查询，而且子查询可以使用到主键进行等值匹配的话，那么该子查询执行计划的 type 列就是 unique_subquery。



### index_subquery

有点类似上面的 unique_subquery 只是访问子查询中的表时使用的是普通的索引：

```sql
value IN (SELECT key_column FROM single_table WHERE some_expr)
```



### range

使用索引并且仅检索指定范围内的行，此时输出的执行计划中，key 列显示的是使用的索引，key_len 显示使用索引最长的，ref 列为 NULL。

range 使用的场景：普通索引列和一些常量通过一下运算符拼接

=、<>、>、>=、<、<=、IS NULL、<=>，BETWEEN、LIKE、IN

```sql
SELECT * FROM tbl_name
  WHERE key_column = 10;

SELECT * FROM tbl_name
  WHERE key_column BETWEEN 10 and 20;

SELECT * FROM tbl_name
  WHERE key_column IN (10,20,30);

SELECT * FROM tbl_name
  WHERE key_part1 = 10 AND key_part2 IN (10,20,30);
```



### index

index 访问方式类似于 ALL，要求索引记录被全部扫描，同时还伴随着以下两种情况：

- 如果查询中使用的索引是覆盖索引并且适合从表中查询到的所有数据，索引记录全部扫描，在这种情况下，执行计划中的 Extra 列会显示 `Using index`，通常情况下 index 方式比 ALL 快，这是因为索引记录数据要小于全表数据量。
- 索引记录全部被扫描并且按照这个扫描顺序去表中查询数据，Extra 列不会显示 Using index。

当查询仅使用单个索引列时，MySQL 可以使用此连接类型。



### ALL

为前面的表的所有行组合进行当前连接表的全表扫描。应该尽量避免全表扫描。



### 总结

上述这些访问方法按照性能从好到坏列出，其中除了 ALL 不使用索引外，其他方式均可以使用索引，除了 index_merge 方法外，其他方法最多只能使用一个索引。



## （6）possible_keys（possible_keys）

possible_keys 列表示 MySQL 在检索特定的表时可以使用的所有索引，注意在 Explain 输出的按照特定顺序排列的表中，该列是完全独立的 （Note that this column is totally independent of the order of the tables as displayed in the output from [`EXPLAIN`](https://dev.mysql.com/doc/refman/8.0/en/explain.html)），这就意味着在 possiable_keys 中出现的索引并不一定实际使用。

如果在输出信息中该列为 NULL（JSON 中为 undefined），就表示查询没有使用到相关索引，在这种情况下，我们就应该检测 where 子句中有没有使用到合适的索引来优化查询。如有必要可以创建索引 [参考 DML 语句](https://dev.mysql.com/doc/refman/8.0/en/alter-table.html)。

如果要查看 table 中有什么索引，可以使用 `show index from tbl_name`。

提示：possible_keys 中出现的索引并不是越多越好，因为查询优化器计算索引也是需要成本的，尽可能的剔除没有使用到的索引。

## （7）key（key）

key 这一列的值表示 MySQL 实际使用的索引是什么，它们可以是出现在 possible_keys 中的某个索引或者是未出现的其他索引。

当 key 使用的索引没有出现在 possible_keys 列中时，这意味着，possible_keys 中的索引不适合该查询，但是其他某些索引可能覆盖到了要查询的列，使用这些索引进行检索要优于直接扫描行。（That is, the named index covers the selected columns, so although it is not used to determine which rows to retrieve, an index scan is more efficient than a data row scan.）

对于 InnoDB 引擎而言，有时候即使查询扫到了主键，但第二索引也覆盖了要查询的行，这是因为 InnoDB 将主键值存在了每个二级索引中。

如果 key 的值是 NULL，说明优化器没有找到能够使查询更高效的索引。

有时候我们可能会强制优化器使用或者忽略某些索引，可以使用 `FORCE INDEX、INDEX USE 或者 IGNORE INDEX` 这些关键字，参考：[13.7.3.1 ANALYZE TABLE Statement](https://dev.mysql.com/doc/refman/8.0/en/analyze-table.html)



## （8）key_len（key_length）

key_len 这一列的值表示优化器使用索引的长度。由三部分组成：

- 对于使用固定长度类型的索引列来说，它实际存储占用的存储空间的最大长度就是该固定值，对于指定字符集的变长类型的索引列来说，比如某个索引的类型是 VARCHAR(100)，使用的字符集是 utf8，那么该列实际占用的最大存储空间就是 100 X 3 = 300 个字节；
- 如果该索引列可以存储 NULL 值，则 key_len 比不可以存储 NULL 值时多 1 个字节；
- 对于变长字段来说，都会有 2 个字节的空间来存储该变长列的实际长度。

tip：也就意味着如果某个索引是变长的，也可以存储 NULL，则它占据的存储空间要在原有基础上多 3 个字节；



## （9）ref（ref）

ref 表示使用了哪些列或者常量去和索引进行匹配。

特别是在索引等值查询的时候，也就是在访问方法为 const、eq_ref、ref、ref_or_null、unique_subquery、index_subquery 其中之一的时候，ref 展示的就是与索引列做等值匹配的究竟是什么。比如常数或者某个列。

如果 ref 列显示的是 func，表示的是和索引进行匹配的是某个函数的返回值，这个函数还可以是某个运算符，使用 SHOW WARNNINGS 可以查看更多信息。



## （10）rows（rows）

rows 列的值表示的是 MySQL 在执行查询时认为需要进行评估的行的总数量。

对于 InnoDB 引擎的表而言，这个值只是一个估算值，并不准确。

如果是全表查询，rows 展示的就是预计需要扫描的行的数量，如果使用索引，rows 展示的就是预计扫描到的索引行数。



## （11）filtered（filtered）

filtered 表示的是预计大概被查询条件过滤掉的行占总行的百分比，最大值就是 100，这就意味着没有任何行被查询条件匹配到。

rows 表示的预计被扫描到的行的数量；

filtered 表示被查询条件匹配到的行占总行数的百分比，当然也是一个估算值；

rows X filtered 就是要和前面的表进行连接的行的数量；

tip：对于单表查询来说这个 filtered 意义不大，但是对于连接查询就很有意义了，一般我们会看驱动表的 rows X filtered，该值表示的就是 MySQL 要对被驱动表执行查询的大概次数。



## （12）Extra（none）

### 补充几个概念：

#### 回表：

如果说一次查询，只需要根据索引就可以查询到所需要的完整数据，就不需要回表，比较经典的是使用主键索引。而在 InnoDB 引擎中，常规索引（非主键）结点存储的是主键索引的值，如果使用了普通索引，首先需要扫描普通索引树，找到主键索引，然后根据主键索引定位所需数据，这样走了两次查询，第二次就叫回表，比如 `select * from t1 where idx_key = 1`。

#### 索引覆盖：

只需要在一棵索引树上就可以获取 SQL 所需的所有列数据，无需回表，Explain 输出的 Extra 列为 Using index 时，可以触发索引覆盖；

常见的实现方式是将要查询的数据建立到联合索引中。

常见场景：（1）全表 count 查询优化；（2）列查询回表优化；（3）分页查询；

#### 索引下推（index condition pushdown 简称 ICP 技术）：

ICP 在 MySQL 5.6 开始推出，用于优化查询；

在不使用 ICP 的情况下，使用非主键索引（又称普通索引或者二级索引）进行查询时，存储引擎通过普通索引定位主键索引，然后回表查询数据，最后返回给 MySQL 服务器，服务器判断数据是否符合条件；

在使用 ICP 的情况下，如果判断条件中包含索引列，那么 MySQL 服务器将这一部分判断交给存储引擎，由存储引擎判断索引是否符合 MySQL 服务器传递的条件，在第一次根据索引查询时会进行过滤，这样可以大大减少回表次数。

总结：索引下推可以减少存储引擎回表的次数，也可以减少 MySQL 服务器从存储引擎接受数据的次数。

- 组合索引最左前缀：

前面也了解过组合索引的知识，构建组合索引要按照一定的顺序，访问量大的放在前面，比如 （a，b，c），最左前缀包括：（a）、（a，b）、（a，b，c）遇到范围查询会导致索引失效，如 >、<、!=、is null、null，这种组合索引也可以看作一个有序的数组，首先按 a 排序，每个 a 对应的 b 又可以排序，b 对应的 c 又会排序。

比如一张学生表：

```sql
CREATE TABLE `student` (
	id int(11) auto_increment,
	`name` varchar(30) not null,
	age int(11) not null,
	gender varchar(20) not null,
	create_time datetime,
	update_time datetime,
	primary key(id),
	index using btree(`name`, age, gender)
) engine=innodb comment='学生表';
```

姓名、年龄、性别构建了组合索引，查询 sql 如下：

```sql
-- 全表查询
explain select * from student where `name` like '张%' and age > 14;

-- 最左前缀 name, 索引覆盖
explain select id from student where `name` = '张三';

-- 全表查询
explain select id, `name`, update_time from student where `name` like '张%' and age > 14;

-- 最左前缀 name, 索引下推: 得到索引值后判断后续的 where 条件
explain select id, `name`, create_time from student where `name` = '张四' and age > 10 and gender = '男';
```



### Extra 常用信息

Extra 列记录了 MySQL 分析某个查询时附带的一些信息，参考 [EXPLAIN Extra Information](https://dev.mysql.com/doc/refman/8.0/en/explain-output.html#explain-extra-information)

我们可以通过这些额外的信息更准确的理解 MySQL 到底如何执行给定的查询。

如果我们想让查询更加快速，可以留心 Extra 中包含的 `Using filesort` 和 `Using temporary` 属性。

官方给出了很多，下面展示了 Extra 中常用的信息：

#### No tables used

当查询的语句没有 from 子句时会提示这个；

#### Impossible WHERE

查询语句的 where 子句永远为 FALSE 时会提示该信息；

#### No matching min/max row

当查询语句中包含 min、max 聚集函数，但是并没有符合 where 子句中的搜索条件时会提示该信息；

#### Using index

当查询列表以及搜索条件中只包含属于某个索引的列，也就是可以使用**索引覆盖**的情况下，在 Extra 列会提示该信息；

比如这样：`select * from s1 where filed1 = 'a';`

#### Using index condition

索引下推；

#### Using where

全表扫描，并且 where 子句后面有条件

#### Using join buffer（Block Nested Loop）

连接查询的时候，当被驱动表不能有效的利用索引加快访问速度，MySQL 一般会为其分配一块名叫 `join buffer` 的内存块来加快查询速度，也就是 **基于块的嵌套循环算法**。

#### Not exists

当我们使用左（外）连接时，如果 where 子句中包含被驱动表的某个列等于 NULL 值的搜索条件，而且那个列又是不允许存储 NULL 值的，那么该表的执行计划的 Extra 就会提示 Not exists 额外信息。

#### Using intersect（...）、Using union（...）、Using sort_union（...）

如果执行计划的 Extra 列中出现了 Using intersect（...）提示，说明准备使用 intersect 索引合并的方式执行查询，括号中的 ... 表示需要进行索引合并的所有名称；

如果出现了 Using union（...）提示，说明准备使用 Union 索引合并方式执行查询；

如果出现了 Using sort_union（...）提示，说明准备使用 Sort-Union 索引合并方式进行查询。

#### Zero limit

当 limit 参数为 0 时，表示不准备查询任何数据，就会提示该信息；

#### Using filesort

有一些情况下会对结果集中的记录进行排序是可以使用到索引的。

比如：`select * from s1 order by key1 limit 10;`，这个查询语句可以利用 idx_key1 直接取出 key1 列的 10 条记录，然后再进行回表操作（前提 key1 是索引列），但是大部分时候排序操作无法使用到索引，只能在内存（记录较少）或磁盘中（记录较多）的时候进行排序，这两种方式在 MySQL 中统称 **文件排序（filesort）**。

如果某个查询要使用文件排序的方式，执行计划 Extra 中就会显示 Using filesort。

注意：如果查询使用了 filesort 进行排序的列非常多，这个过程是很耗费性能的，最好想办法将文件排序转换为索引排序。

#### Using temporary

在许多查询中，MySQL 会借助临时表完成某些功能，比如去重、排序之类的，比如执行 distinct、group by、union 等子句的时候，如果不能有效利用索引来完成查询，MySQL 很有可能寻求通过内部建立临时表来执行查询。

如果查询中使用到了临时表，那么执行计划的 Extra 中会显示 Using temporary。

需要注意：

对于 distinct 查询，一般会使用临时表；对于 group by，MySQL 使用临时表的同时还会文件排序，如果不想可以显式声明 order by null；

如果执行计划中出现了 Using temporary，应当考虑使用索引替换掉临时表，因为维护临时表需要耗费很多资源。

#### Start temporary，End temporary

在子查询中，优化器会优先尝试将 IN 子查询转换为 semi-join（半查询），而 semi-join 又有很多种执行策略，当执行策略为 DuplicateWeedout 时，也就是通过建立临时表来实现为外除查询中的记录进行去重操作，驱动表查询执行计划的 Extra 列将显示 Start temporary，被驱动表执行计划的 Extra 显示 End temporary。

#### LooseScan

将 In 子查询转换为 semi-join 时，如果采用的是 LooseScan 执行策略，则在驱动表的执行计划的 Extra 中显示 LooseScan。

#### FirstMatch（tbl_name）

将 IN 转换为 semi-join 时，执行策略选中 FirstMatch，则在被驱动表执行计划的 Extra 列显示 FirstMatch(tbl_name)。


