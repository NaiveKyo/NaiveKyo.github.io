---
title: MySQL The ranks of conversion
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225220814.jpg'
coverImg: /img/20220225220814.jpg
cover: false
toc: true
mathjax: false
date: 2022-03-25 11:41:54
summary: "MySQL 行列转换浅析"
categories: "MySQL"
keywords: "MySQL"
tags: "MySQL"
---

## 前言

本文参考自 : https://www.cnblogs.com/xiaoxi/p/7151433.html

## 一、行转列

### 1、应用场景

应用场景：将同一列下的多行的不同内容作为多个字段，输出对应内容。

比如说查询学生与各科成绩这个经典的需求：

- 学生与课程之间应该是多对多的关系，一个学生可以选多门课，一门课可以被多个学生选取；
- 共三张表：学生表、课程表、学生课程关系表

下面看看建表 sql；

### 2、DDL SQL

> 学生表 student

```sql
CREATE TABLE `student`  (
  `stu_no` varchar(30) NOT NULL COMMENT '学生学号',
  `stu_name` varchar(30) NULL COMMENT '学生姓名',
  `stu_gender` tinyint(1) NULL COMMENT '性别: 0表示男，1表示女',
  PRIMARY KEY (`stu_no`)
);
```



> 课程表

```sql
CREATE TABLE `course`  (
  `course_no` varchar(30) NOT NULL COMMENT '课程编号',
  `course_name` varchar(30) NULL COMMENT '课程名',
  PRIMARY KEY (`course_no`)
);
```



> 学生-课程-分数表

```sql
CREATE TABLE `stu_course_relation`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `stu_no` varchar(30) NULL COMMENT '学生学号',
  `course_no` varchar(30) NULL COMMENT '课程编号',
  `score` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '分数',
  PRIMARY KEY (`id`)
);
```



> 初始化数据

学生表：

```sql
INSERT INTO student (stu_no, stu_name, stu_gender)
VALUES ('stu_001', '小明', 0);

INSERT INTO student (stu_no, stu_name, stu_gender)
VALUES ('stu_002', '小李', 0);

INSERT INTO student (stu_no, stu_name, stu_gender)
VALUES ('stu_003', '小赵', 0);

INSERT INTO student (stu_no, stu_name, stu_gender)
VALUES ('stu_004', '小芳', 1);

INSERT INTO student (stu_no, stu_name, stu_gender)
VALUES ('stu_005', '小刘', 1);

INSERT INTO student (stu_no, stu_name, stu_gender)
VALUES ('stu_006', '小双', 1);
```

课程表：

```sql
INSERT INTO course (course_no, course_name)
VALUES ('course_001', '语文');

INSERT INTO course (course_no, course_name)
VALUES ('course_002', '数学');

INSERT INTO course (course_no, course_name)
VALUES ('course_003', '英语');

INSERT INTO course (course_no, course_name)
VALUES ('course_004', '物理');

INSERT INTO course (course_no, course_name)
VALUES ('course_005', '化学');

INSERT INTO course (course_no, course_name)
VALUES ('course_006', '生物');
```

学生-课程-分数表：

```sql
INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_001', 'course_001', 81.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_001', 'course_002', 82.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_001', 'course_003', 83.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_001', 'course_004', 84.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_001', 'course_005', 85.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_001', 'course_006', 86.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_002', 'course_001', 81.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_002', 'course_002', 82.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_002', 'course_003', 83.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_002', 'course_004', 84.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_002', 'course_005', 85.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_002', 'course_006', 86.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_003', 'course_001', 81.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_003', 'course_002', 82.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_003', 'course_003', 83.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_003', 'course_004', 84.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_003', 'course_005', 85.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_003', 'course_006', 86.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_004', 'course_001', 81.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_004', 'course_002', 82.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_004', 'course_003', 83.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_004', 'course_004', 84.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_004', 'course_005', 85.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_004', 'course_006', 86.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_005', 'course_001', 81.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_005', 'course_002', 82.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_005', 'course_003', 83.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_005', 'course_004', 84.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_005', 'course_005', 85.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_005', 'course_006', 86.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_006', 'course_001', 81.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_006', 'course_002', 82.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_006', 'course_003', 83.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_006', 'course_004', 84.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_006', 'course_005', 85.00);

INSERT INTO stu_course_relation (stu_no, course_no, score)
VALUE ('stu_006', 'course_006', 86.00);
```



### 3、行转列

现在想要查询每个学生的学科成绩：

```sql
SELECT scr.stu_no, s.stu_name, c.course_name, scr.score
FROM stu_course_relation AS scr
LEFT JOIN student AS s ON scr.stu_no = s.stu_no
LEFT JOIN course AS c ON scr.course_no = c.course_no
```

效果如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220325155306.png)

效果是有了，但是学号和名字重复太多，我们想要的是一条学生信息中包含了各科的成绩，这就需要进行行转列操作（本质是分组 + 组合聚集函数）：

（1）首先为了方便查询，可以将此查询结果用一个视图表示：

```sql
CREATE VIEW row_to_col_view AS
SELECT scr.stu_no, s.stu_name, c.course_name, scr.score
FROM stu_course_relation AS scr
LEFT JOIN student AS s ON scr.stu_no = s.stu_no
LEFT JOIN course AS c ON scr.course_no = c.course_no;
```

（2）接着进行行转列操作：

```sql
SELECT stu_no AS '学号', stu_name AS '姓名',
MAX(IF(course_name = '语文', score, 0.00)) AS '语文',
MAX(IF(course_name = '数学', score, 0.00)) AS '数学',
MAX(IF(course_name = '英语', score, 0.00)) AS '英语',
MAX(IF(course_name = '物理', score, 0.00)) AS '物理',
MAX(IF(course_name = '化学', score, 0.00)) AS '化学',
MAX(IF(course_name = '生物', score, 0.00)) AS '生物'
FROM row_to_col_view
GROUP BY stu_no
```

效果如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220325161354.png)

这里可以使用 `IF` 也可以使用 `CASE...THEN...`，可以使用 `SUM()` 也可以使用 `MAX()` 聚集函数。

### 4、SUM(IF()) + WITH ROLLUP 汇总行和列

有时候需要统计总成绩，可以这样做（子查询 + `WITH ROLLUP`）：

```sql
SELECT IFNULL(tmp.stu_no, 'total') AS stu_no, 
SUM(IF(tmp.`course_name`='语文', tmp.score, 0.00)) AS '语文',
SUM(IF(tmp.`course_name`='数学', tmp.score, 0.00)) AS '数学',
SUM(IF(tmp.`course_name`='英语', tmp.score, 0.00)) AS '英语',
SUM(IF(tmp.`course_name`='物理', tmp.score, 0.00)) AS '物理',
SUM(IF(tmp.`course_name`='化学', tmp.score, 0.00)) AS '化学',
SUM(IF(tmp.`course_name`='生物', tmp.score, 0.00)) AS '生物',
SUM(IF(tmp.`course_name`='total', tmp.score, 0.00)) AS 'total'
FROM (
	SELECT stu_no, IFNULL(course_name, 'total') AS `course_name`, SUM(score) AS score 
	FROM row_to_col_view
	GROUP BY stu_no, course_name
	WITH ROLLUP
	HAVING stu_no IS NOT NULL
) AS tmp
GROUP BY stu_no
WITH ROLLUP;
```

效果如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220325181003.png)

这里的子查询使用分组 + `WITH ROLLUP`，后者可以得到针对每个分组的汇总值，主要目的是为了生成上图中最后一列的数据。

外部的查询和 `WITH ROLLUP` 则是为了生成上图中最后一行的数据。





### 5、SUM(IF()) + UNION 汇总行和列

```sql
SELECT stu_no,
SUM(IF(course_name = '语文', score, 0)) AS '语文',
SUM(IF(course_name = '数学', score, 0)) AS '数学',
SUM(IF(course_name = '英语', score, 0)) AS '英语',
SUM(IF(course_name = '物理', score, 0)) AS '物理',
SUM(IF(course_name = '化学', score, 0)) AS '化学',
SUM(IF(course_name = '生物', score, 0)) AS '生物',
SUM(score) AS total
FROM row_to_col_view
GROUP BY stu_no
UNION
SELECT 'total', SUM(IF(course_name = '语文', score, 0)) AS '语文',
SUM(IF(course_name = '数学', score, 0)) AS '数学',
SUM(IF(course_name = '英语', score, 0)) AS '英语',
SUM(IF(course_name = '物理', score, 0)) AS '物理',
SUM(IF(course_name = '化学', score, 0)) AS '化学',
SUM(IF(course_name = '生物', score, 0)) AS '生物',
SUM(score)
FROM row_to_col_view
```

上半部分的查询语句是为了查询每个学生的各科成绩以及总成绩，下半部分的查询则是为了查询各个学科的汇总成绩，最终将两者合并，效果和前面一样。

### 6、使用 SUM(IF()) 汇总行和列

```sql
SELECT IFNULL(stu_no, 'total') AS stu_no,
SUM(IF(course_name = '语文', score, 0)) AS '语文',
SUM(IF(course_name = '语文', score, 0)) AS '数学',
SUM(IF(course_name = '语文', score, 0)) AS '英语',
SUM(IF(course_name = '语文', score, 0)) AS '物理',
SUM(IF(course_name = '语文', score, 0)) AS '化学',
SUM(IF(course_name = '语文', score, 0)) AS '生物',
SUM(score) AS 'total'
FROM row_to_col_view
GROUP BY stu_no 
WITH ROLLUP
```

效果和前面一样。

### 7、动态汇总

前面汇总数据时，我们的课程信息是确定的，如果课程的数量是不确定的（即列是动态的），此时可以利用 MySQL 的预处理语句。

预处理 SQL 语法如下（官网：https://dev.mysql.com/doc/refman/8.0/en/sql-prepared-statements.html）：

（1）PREPARE 名称 FROM SQL语句；

（2）EXECUTE 名称 USING 参数；

（3）{DEALLOCATE | DROP} PREPARE 名称；

```sql
SET @EE='';
SELECT @EE := CONCAT(@EE, 'sum(if(course_name=\'',tmp.course_name,'\',score,0)) as ', course_name, ',') AS aa FROM
(SELECT DISTINCT course_name FROM row_to_col_view) AS tmp;

SET @QQ = CONCAT('select ifnull(stu_no, \'total\') as stu_no,', @EE, ' sum(score) as total from row_to_col_view group by stu_no with rollup');

PREPARE stmt FROM @QQ;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

效果如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220327223818.png)

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220327223853.png)

这里需要注意的是 `'sum(if(course_name=\'',tmp.course_name,'\',score,0)) as '` 这里使用了转义符，因为我们要拿到从 tmp 表中的课程名。



### 8、group_concat() 行转列

```sql
SELECT stu_no, GROUP_CONCAT(course_name, ':', score) AS '成绩' 
FROM row_to_col_view
GROUP BY stu_no
```

效果如下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220327224138.png)

`group_concat()` 函数可以将属于同一组的不同列拼接成一个字符串，而要拼接的字段需要在参数中指明，注意需要结合分组字段。



## 二、列转行

这里为了方便直接利用之前行转列的结果来生成视图：

```sql
CREATE VIEW col_to_row_view AS
SELECT stu_no AS '学号', stu_name AS '姓名',
MAX(IF(course_name = '语文', score, 0.00)) AS '语文',
MAX(IF(course_name = '数学', score, 0.00)) AS '数学',
MAX(IF(course_name = '英语', score, 0.00)) AS '英语',
MAX(IF(course_name = '物理', score, 0.00)) AS '物理',
MAX(IF(course_name = '化学', score, 0.00)) AS '化学',
MAX(IF(course_name = '生物', score, 0.00)) AS '生物'
FROM row_to_col_view
GROUP BY stu_no;
```

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220327224717.png)

如果想要将上图中数据进行行转列操作，只需要将每个科目分散为一条数据显示即可：

```sql
SELECT 学号 AS stu_no, 姓名 AS stu_name,
'语文' AS course, 语文 AS score FROM col_to_row_view
UNION ALL
SELECT 学号 AS stu_no, 姓名 AS stu_name,
'数学' AS course, 数学 AS score FROM col_to_row_view
UNION ALL
SELECT 学号 AS stu_no, 姓名 AS stu_name,
'英语' AS course, 英语 AS score FROM col_to_row_view
UNION ALL
SELECT 学号 AS stu_no, 姓名 AS stu_name,
'物理' AS course, 物理 AS score FROM col_to_row_view
UNION ALL
SELECT 学号 AS stu_no, 姓名 AS stu_name,
'化学' AS course, 化学 AS score FROM col_to_row_view
UNION ALL
SELECT 学号 AS stu_no, 姓名 AS stu_name,
'生物' AS course, 生物 AS score FROM col_to_row_view
GROUP BY 学号
ORDER BY stu_no
```

这里不加单引号的中文单词其实是字段，刚刚创建视图的时候忘了改成英文，最终效果如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220327225509.png)

注：`UNION` 和 `UNION ALL` 的区别：

（1）对重复结果的处理：`UNION` 会去掉重复记录，`UNION ALL` 不会；

（2）对排序的处理：`UNION` 会排序，`UNION ALL` 只是简单地将两个结果集合并；

（3）效率方面的区别：因为 `UNION` 会做去重和排序处理，因此效率比 `UNION ALL` 慢很多。