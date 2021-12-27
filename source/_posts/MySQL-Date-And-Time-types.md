---
title: MySQL Date And Time types
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211005110027.jpg'
coverImg: /img/20211005110027.jpg
toc: true
date: 2021-10-24 11:19:44
top: false
cover: false
summary: "MySQL 建表时，日期时间类型的选择"
categories: "MySQL"
keywords: [MySQL, "Date Types"]
tags: "MySQL"
---

## MySQL8.0 日期类型

### 1、简介

MySQL（8.0）所支持的日期时间类型有 **DATETIME、TIMESTAMP、DATE、TIME、YEAR**。



几种类型比较如下：

| 日期时间格式 | 占用空间 | 日期格式            | 最小值              | 最大值              | 零值表示            |
| ------------ | -------- | ------------------- | ------------------- | ------------------- | ------------------- |
| DATETIME     | 8 bytes  | YYYY-MM-DD HH:MM:SS | 1000-01-01 00:00:00 | 9999-12-31 23:59:59 | 0000-00-00 00:00:00 |
| TIMESTAMP    | 4 bytes  | YYYY-MM-DD HH:MM:SS | 1970-01-01 00:00:01 | 2038-01-19 03:14:07 | 0000-00-00 00:00:00 |
| DATE         | 4 bytes  | YYYY-MM-DD          | 1000-01-01          | 9999-12-31          | 0000-00-00          |
| TIME         | 3 bytes  | HH:MM:SS            | -838:59:59          | 838:59:59           | 00:00:00            |
| YEAR         | 1 bytes  | YYYY                | 1901                | 2155                | 0000                |



### 2、使用

- DATETIME
  - DATETIME 用于表示 年月日 时分秒，是 DATE 和 TIME 的组合，并且记录的年份（见上表）比较长久。如果实际应用中有这样的需求，就可以使用 DATETIME 类型。
- TIMESTAMP
  - TIMESTAMP 用于表示 年月日 时分秒，但是记录的年份（见上表）比较短暂。
  - TIMESTAMP 和时区相关，更能反映当前时间。当插入日期时，会先转换为本地时区后再存放；当查询日期时，会将日期转换为本地时区后再显示。所以不同时区的人看到的同一时间是不一样的。
  - 表中的第一个 TIMESTAMP 列自动设置为系统时间（CURRENT_TIMESTAMP）。当插入或更新一行，但没有明确给 TIMESTAMP 列赋值，也会自动设置为当前系统时间。如果表中有第二个 TIMESTAMP 列，则默认值设置为0000-00-00 00:00:00。
  - TIMESTAMP 的属性受 Mysql 版本和服务器 SQLMode 的影响较大。
  - 如果记录的日期需要让不同时区的人使用，最好使用 TIMESTAMP。
- DATE
  - DATE 用于表示 年月日，如果实际应用值需要保存 年月日 就可以使用 DATE。
- TIME
  - TIME 用于表示 时分秒，如果实际应用值需要保存 时分秒 就可以使用 TIME。
- YEAR
  - YEAR 用于表示 年份，YEAR 有 2 位（最好使用4位）和 4 位格式的年。 默认是4位。如果实际应用只保存年份，那么用 1 bytes 保存 YEAR 类型完全可以。不但能够节约存储空间，还能提高表的操作效率。



### 3、日期函数

下面介绍常用日期函数：

| 函数          | 说明                            |
| ------------- | ------------------------------- |
| AddDate()     | 增加一个日期（天、周等等）      |
| AddTime()     | 增加一个时间（时、分等等）      |
| CurDate()     | 返回当前日期（格式：yyy-MM-dd） |
| CurTime()     | 返回当前时间                    |
| Date()        | 返回日期时间的日期部分          |
| DateDiff()    | 计算两个日期之差，指相差的天数  |
| Date_Add()    | 高度灵活的日期函数              |
| Date_Format() | 返回一个格式化的日期或时间串    |
| Day()         | 返回一个日期的天数部分          |
| DayOfWeek()   | 对于一个日期，返回对应的星期几  |
| Hour()        | 返回一个时间的小时部分          |
| Minute()      | 返回一个时间的分钟部分          |
| Month()       | 返回一个日期的月份部分          |
| Now()         | 返回当前日期和时间              |
| Second()      | 返回一个时间的秒部分            |
| Time()        | 返回一个日期时间的时间部分      |
| Year()        | 返回一个日期的年份部分          |



> Date_Add 函数

方法签名：`Date_Add(date, INTERVAL expr unit)`、`Date_Sub(date, INTERVAL expr unit)`

参数说明：

- date：该参数可以是起始日期（Date），也可以是日期时间变量（DateTime）
- expr：该值表示一个区间，用于日期的加减计算，expr 作为字符串被解析，可以从负数开始
- unit：是关键字，用于声明 expr 表示什么。比如 Day、Year 等等

返回值：

- 返回值依赖 date 参数
  - date 参数为 DATE 类型时，返回 DATE
  - date 参数为 DATETIME （或者 TIMESTAMP）类型时，或者 date 参数为 DATE 类型，同时 unit 参数为 HOURS、MINUTES 或 SECONDS。这几种情况返回 DATETIME 类型的值

如果想要返回值一定是 DATETIME ，就可以用 cast() 函数将 date 参数转换为 DATETIME 类型。



示例：

```sql
mysql> SELECT DATE_ADD('2018-05-01',INTERVAL 1 DAY);
        -> '2018-05-02'
mysql> SELECT DATE_SUB('2018-05-01',INTERVAL 1 YEAR);
        -> '2017-05-01'
mysql> SELECT DATE_ADD('2020-12-31 23:59:59',
    ->                 INTERVAL 1 SECOND);
        -> '2021-01-01 00:00:00'
mysql> SELECT DATE_ADD('2018-12-31 23:59:59',
    ->                 INTERVAL 1 DAY);
        -> '2019-01-01 23:59:59'
mysql> SELECT DATE_ADD('2100-12-31 23:59:59',
    ->                 INTERVAL '1:1' MINUTE_SECOND);
        -> '2101-01-01 00:01:00'
mysql> SELECT DATE_SUB('2025-01-01 00:00:00',
    ->                 INTERVAL '1 1:1:1' DAY_SECOND);
        -> '2024-12-30 22:58:59'
mysql> SELECT DATE_ADD('1900-01-01 00:00:00',
    ->                 INTERVAL '-1 10' DAY_HOUR);
        -> '1899-12-30 14:00:00'
mysql> SELECT DATE_SUB('1998-01-02', INTERVAL 31 DAY);
        -> '1997-12-02'
mysql> SELECT DATE_ADD('1992-12-31 23:59:59.000002',
    ->            INTERVAL '1.999999' SECOND_MICROSECOND);
        -> '1993-01-01 00:00:01.000001'
```



### 4、前后端日期格式

关于日期格式这个问题需要开发人员联合确定，这里列出常用解决方案：

环境：SpringBoot、Jackson

- 后台给前台传递数据：
  - 可以在配置文件中配置好 Jackson 的日期格式
  - 也可以在字段上使用 `@JsonFormat` 注解指定格式和时区
  - 该注解也可以作用于 `@ReqeustBody`  接收的参数对象中的日期属性

```yaml
jackson:
  date-format: yyyy-MM-dd HH:mm:ss
  time-zone: GMT+8
```

- 后台接收前台传递的数据：
  - 在字段上使用 `@DateTimeFormat`  注解格式
  - 需要导入依赖 `joda-time`，DateTimeFormat 注解才可以生效
  - 该注解适用于 `@RequestParam` 接收的参数



> 注意

`@DateTimeFormat` 用于解析前台传过来的时间字符串，如果是 GET 请求且使用了 `@RequestParam` 接收参数，可以正常生效。

如果是在 `@ReqeustBody` 中则 `@JsonFormat` 可以同时适用前后台时间字符串参数解析。

<mark>注意：在 Mybatis 的 mapper.xml 文件中日期只做判空，而不做与空字符串的比较，否则会报错。</mark>



> GET 请求的查询

`@GetMapping` 不能直接使用 `@ReqestBody`，只可以使用 `@ReqeustParam`
