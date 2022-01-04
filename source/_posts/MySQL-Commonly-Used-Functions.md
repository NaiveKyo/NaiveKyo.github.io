---
title: MySQL Commonly Used Functions
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031161747.jpg'
coverImg: /img/20211031161747.jpg
cover: false
toc: true
mathjax: false
date: 2021-12-24 13:20:13
summary: "记录 MySQL 常用的函数"
categories: MySQL
keywords: MySQL
tags: MySQL
---



# MySQL 常用函数



## 一、流程控制函数

### 1、CASE



CASE 语句的返回结果比较特殊，是所有结果的聚合类型

[官方说明](https://dev.mysql.com/doc/refman/8.0/en/flow-control-functions.html)

```sql
mysql> SELECT CASE 1 WHEN 1 THEN 'one'
    ->     WHEN 2 THEN 'two' ELSE 'more' END;
        -> 'one'
mysql> SELECT CASE WHEN 1>0 THEN 'true' ELSE 'false' END;
        -> 'true'
mysql> SELECT CASE BINARY 'B'
    ->     WHEN 'a' THEN 1 WHEN 'b' THEN 2 END;
        -> NULL
```





### 2、IF

`IF(expr1, expr2, expr3)`

expr1 为真时返回 expr2，否则返回 expr3



```sql
mysql> SELECT IF(1>2,2,3);
        -> 3
mysql> SELECT IF(1<2,'yes','no');
        -> 'yes'
mysql> SELECT IF(STRCMP('test','test1'),'no','yes');
        -> 'no'
```





### 3、IFNULL

`IFNULL(expr1, expr2)`

expr1 为 not null 时，返回 expr1，否则返回 expr2



```sql
mysql> SELECT IFNULL(1,0);
        -> 1
mysql> SELECT IFNULL(NULL,10);
        -> 10
mysql> SELECT IFNULL(1/0,10);
        -> 10
mysql> SELECT IFNULL(1/0,'yes');
        -> 'yes'
```

`IFNULL` 的返回类型是 expr1 和 expr2 两个类型中更通用的，顺序：STRING，REAL 或 INTEGER。



> NULLIF

`NULLIF(expr1, expr2)`

当 expr1 = expr2 时返回 NULL，否则返回 expr1



```sql
mysql> SELECT NULLIF(1,1);
        -> NULL
mysql> SELECT NULLIF(1,2);
        -> 1
```



## 二、时间函数

### 1、DATE_FORMAT

`DATE_FORMAT(date, format)`

```sql
mysql> SELECT DATE_FORMAT('2009-10-04 22:23:00', '%W %M %Y');
        -> 'Sunday October 2009'
mysql> SELECT DATE_FORMAT('2007-10-04 22:23:00', '%H:%i:%s');
        -> '22:23:00'
mysql> SELECT DATE_FORMAT('1900-10-04 22:23:00',
    ->                 '%D %y %a %d %m %b %j');
        -> '4th 00 Thu 04 10 Oct 277'
mysql> SELECT DATE_FORMAT('1997-10-04 22:23:00',
    ->                 '%H %k %I %r %T %S %w');
        -> '22 22 10 10:23:00 PM 22:23:00 00 6'
mysql> SELECT DATE_FORMAT('1999-01-01', '%X %V');
        -> '1998 52'
mysql> SELECT DATE_FORMAT('2006-06-00', '%d');
        -> '00'
```

重点在于模式（`format`）



|    Specifier    |                         Description                          |
| :-------------: | :----------------------------------------------------------: |
|      `%a`       |                星期缩写英文名称（Sum...Sat）                 |
|      `%b`       |                月份英文名称缩写（Jan...Dec）                 |
|      `%c`       |                     月份，格式 (0...12)                      |
|      `%D`       |  带有英语后缀的一个月中的每一天的名称（0th、1st、2nd、3rd）  |
|      `%d`       |          用数字形式表现的每月中的每一天（00...31）           |
|      `%e`       |           用数字形式表现的每月中的每一天（0...31）           |
|      `%f`       |                   毫秒（000000...999999）                    |
|      `%H`       |                 24 时制显示的小时（00...23）                 |
|      `%h`       |                 12 时制显示的小时（01...12）                 |
|      `%I`       |                 12 时制显示的小时（01...12）                 |
|      `%i`       |              以数字形式表现的分钟数（00...59）               |
|      `%j`       |                 一年中的每一天（001...366）                  |
|      `%k`       |            24 时制小时的另一种表现格式（0...23）             |
|      `%l`       |             12时制小时的另一种表现格式（1...12）             |
|      `%M`       |        用完整英文名称表示的月份（January...December）        |
|      `%m`       |                 用数字表现的月份（00...12）                  |
|      `%p`       |                    上午（AM）或下午（PM）                    |
|      `%r`       |          12时制的时间值（hh:mm:ss，后跟 AM 或 PM）           |
|      `%S`       |                        秒（00...59）                         |
|      `%s`       |                        秒（00...59）                         |
|      `%T`       |                  24 时制的小时（hh:mm:ss）                   |
|      `%U`       |         星期（00...53），其中星期天是每星期的开始日          |
|      `%u`       |         星期（00...53），其中星期一是每星期的开始日          |
|      `%V`       | 星期（01...53），其中星期天是每星期的开始日，和 `%X` 一起使用 |
|      `%v`       | 星期（01...53），其中星期一是每星期的开始日，和 `%x` 一起使用 |
|      `%W`       |            一星期中各日名称（Sunday...Saturday）             |
|      `%w`       |    一星期中各日名称（0代表星期日，6代表星期六，以此类推）    |
|      `%X`       | 某星期所处年份。其中，星期天是每星期的开始日，采用4位数字形式表现，和 `%V`一起使用 |
|      `%x`       | 某星期所处年份。其中，星期一是每星期的开始日，采用4位数字形式表现，和 `%V` 一起使用 |
|      `%Y`       |                      4 位数字表示的年份                      |
|      `%y`       |                      2 位数字表示的年份                      |
|      `%%`       |                       符号`%`的字面值                        |
| `%x`（x为斜体） |          字符 x 的字面值，x 指以上未列出的任何字符           |



### 2、WEEK

`week(date[, mode])`

此函数返回日期参数 date 所对应的星期序号，如果同时传入 date 和 mode，则可以指定每星期起始日究竟是星期天还是星期一，以及返回值返回是 0 - 53 还是 1 - 53.

如果忽略 mode 参数，就采用 `default_week_format` 系统变量值：

```sql
mysql> show variables like 'default_week_format';
	-> 0
```



### 3、STR_TO_DATE

`STR_TO_DATE(str, format)`

该函数和 `DATE_FORMAT` 正好相反，将字符串按照特定的模式解析成日期对象，模式表和 `DATE_FORMAT` 一样。

```sql
mysql> SELECT STR_TO_DATE('01,5,2013','%d,%m,%Y');
        -> '2013-05-01'
mysql> SELECT STR_TO_DATE('May 1, 2013','%M %d,%Y');
        -> '2013-05-01'
        
mysql> SELECT STR_TO_DATE('a09:30:17','a%h:%i:%s');
        -> '09:30:17'
mysql> SELECT STR_TO_DATE('a09:30:17','%h:%i:%s');
        -> NULL
mysql> SELECT STR_TO_DATE('09:30:17a','%h:%i:%s');
        -> '09:30:17'
```





## 三、比较函数

### 1、ISNULL

`ISNULL(expr)`

如果 expr 是 NULL 就返回 1，如果不是就返回 0。

```sql
mysql> SELECT ISNULL(1+1);
        -> 0
mysql> SELECT ISNULL(1/0);
        -> 1
```

> NULL 值判断

<mark>出了使用函数来判断某个字段是否为 NULL，还可以这样：</mark>

```sql
select1 is not null;
> 1

select 1 / 0 is null;
> 1
```

