---
title: Java General API
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210730105249.jpg'
coverImg: /img/20210730105249.jpg
toc: true
date: 2021-07-30 10:51:58
top: false
cover: false
summary: Java 常用的一些工具类、API
categories: Java
keywords: Java
tags: Java
---

# 常用 API

## 一、Object 类的方法

### 1、equals 方法

Object 类的 `equals()` 方法，默认比较的是两个对象的地址值，没有意义

我们要重写 equals 方法，实现比较对象的属性



### 2、Objects 工具类

在 **JDK7** 中添加了一个 `Objects` 工具类，它提供了一些方法来操作对象，它由一些静态的实用方法组成，这些方法是 `null-save` （空指针安全）或 `null-tolerant`（容忍空指针的），用于计算对象的 `hashcode`、返回对象的字符串表示形式、比较两个对象。



在比较两个对象的时候，Object 的 equals 方法容易抛出空指针异常，而 Objects 类中的 equals 方法就优化了这个问题。

- `public static boolean equals(Object a, Object b);` 判断两个对象是否相等

```java
public static boolean equals(Object a, Object b) {
  	return (a == b) || (a != null && a.equals(b));
}
```



```java
public class API_Object {

    public static void main(String[] args) {
        
        // 防止空指针异常
        System.out.println(Objects.equals("111", new String(new char[]{'1', '2', '3'})));
    }
}

class Person {
    
    // 默认实现是比较地址值
    @Override
    public boolean equals(Object obj) {
        return super.equals(obj);
    }
}
```



## 二、日期时间类

### 1、Date 类

`java.util.Date` 类，表示特定的瞬间，精确到毫秒。

- 常用：
  - 两种构造方法
  - 一种方法

```java
/**
 * java.util.Date ：表示日期和时间的类
 * 类 Date 表示特定的瞬间，精确到毫秒
 * 
 * 毫秒值的作用：可以对时间和日期进行计算
 * 
 * 日期转换为毫秒：
 *  当前日期
 *  时间原点：0 毫秒 1970 年 1 月 1 日 00:00:00 (英国格林威治)
 *  
 * 毫秒转换为日期：
 *  1 天 = 24 x 60 x 60 = 86400 秒 x 1000 = 86400000 毫秒
 *  
 * 注意：中国属于东八区，会把时间增加 8 个小时
 */
public class API_Date {

    public static void main(String[] args) {

        System.out.println(System.currentTimeMillis()); // 获取当前系统时间，从 1970 年 1 月 1 日 00:00:00 到现在的毫秒数
        
        // 测试构造方法
        demo01();
        
        // 带参构造方法
        demo02(0L); // 0L 表示 1970年1月1日 00:00:00
        demo02(1627550637150L);
        
        // getTime() 方法
        demo03();
    }

    /**
     * 空参构造函数，获取当前系统的日期和时间
     */
    private static void demo01() {
        System.out.println(new Date());
    }

    /**
     * Date 的带参构造方法，传递毫秒值，把它转换为 Date 日期
     * @param date
     */
    private static void demo02(long date) {
        System.out.println(new Date(date));
    }

    /**
     * long getTime() 把日期转换为毫秒数
     *  返回 1970年1月1日 00:00:00 到当前的毫秒数
     */
    private static void demo03() {
        System.out.println(new Date().getTime());
    }
}
```

### 2、DateFormat 类

`java.text.DateFormat` 是 日期/时间 格式化子类的抽象类，我们通过这个类完成日期和文本之间的转换，也就是可以在 `Date` 对象和 `String` 对象之间进行来回转换。



- **格式化**：按照指定的格式，从 Date 对象转换为 String 对象
- **解析**：按照指定的格式，从 String 对象转换为 Date 对象



我们一般使用 `DateFormat` 的子类 `SimpleDateFormat` 来格式化日期。

- `public SimpleDateFormat(String pattern)`：用给定的模式和默认语言环境的日期格式符号构造 SimpleDateFormat



> 格式规则

常用的格式规则为：

| 标识字母（区分大小写） | 含义 |
| :--------------------: | :--: |
|           y            |  年  |
|           M            |  月  |
|           d            |  日  |
|           H            |  时  |
|           m            |  分  |
|           s            |  秒  |



```java
/**
 * java.util.DateFormat
 *  作用：格式化、解析
 *   String format(Date date);
 *   Date parse(String source);
 *   
 *  使用子类：
 *      java.text.SimpleDateFormat
 *  构造方法：
 *      SimpleDateFormat(String pattern);
 */
public class API_DateFormat {

    public static void main(String[] args) {

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy年MM月dd日 HH:mm:ss");
        // 格式化日期
        Date date = new Date();
        String str1 = sdf.format(date);

        System.out.println(date);
        System.out.println(str1);
        
        // 解析
        try {
            Date parse = sdf.parse("2020年11月3日 20:30:32");
            System.out.println(parse);
        } catch (ParseException e) {
            e.printStackTrace();
        }
    }
}
```

### 3、Calendar 类

`java.util.Calendar` 是日历类，在 Date 后出现，替换掉了许多 Date 的方法，该类将所有可能用到的时间信息封装为静态成员变量，方便获取。日历类就是方便获取各个时间属性的。



> 获取方式

Calendar 为抽象类，由于语言敏感性，Calendar 类在创建对象时并非直接创建，而是通过静态方法创建，返回子类对象，如下：

Calendar 静态方法：

- `public static Calendar getInstance()`：使用默认时区和语言环境获得一个日历



```java
/**
 * java.util.Calendar ：日历类
 *  Calendar 是一个抽象类，里面提供了许多操作日历字段的方法（YEAR、MONTH、DAY_OF_MONTH、HOUR等等）
 *  
 *  单例模式
 */
public class API_Calendar {

    public static void main(String[] args) {

        Calendar instance = Calendar.getInstance();

        System.out.println(instance);
    }
}
```



> 常用方法

- `public int get(int field)`：返回给定日历字段的值
- `public void set(int field, int value)`：将给定的日历字段设置为给定值
- `public abstract void add(int field, int amount)`：根据日历的规则，为给定的日历字段添加或者减去指定的时间量
- `public Date getTime()`：返回一个标识此 Calendar 时间值（从历元到现在的毫秒偏移量）的 Date 对象

Calendar 类中提供了许多成员变量，代表给定的日历字段：

|    字段值    |              含义              |
| :----------: | :----------------------------: |
|     YEAR     |               年               |
|    MONTH     | 月（从 0 开始，可以 + 1 使用） |
| DAY_OF_MONTH |        月中的天（几号）        |
|     DATE     |          月中的某一天          |
|     HOUR     |               时               |
|    MINUTE    |               分               |
|    SECOND    |               秒               |



```java
/**
 * java.util.Calendar ：日历类
 *  Calendar 是一个抽象类，里面提供了许多操作日历字段的方法（YEAR、MONTH、DAY_OF_MONTH、HOUR等等）
 *  
 *  单例模式
 *  
 *  成员方法的参数：
 *      int field: 日历类的字段，可以使用 Calendar 类的静态成员变量获取
 */
public class API_Calendar {

    public static void main(String[] args) {

        // 设置时区
        Calendar instance = Calendar.getInstance();
        TimeZone.setDefault(TimeZone.getTimeZone("GMT+8"));
        instance.setTimeZone(TimeZone.getTimeZone("GMT+8"));

        System.out.println(instance.getTime());

        demo02(instance);
        demo03(instance);
        demo01(instance);

        System.out.println("========================");
        
        test01();
        test02();
    }

    /**
     * public int get(int field) ：返回给定日历字段的值
     */
    private static void demo01(Calendar calendar) {
        int year = calendar.get(Calendar.YEAR);
        System.out.println(year);

        int month = calendar.get(Calendar.MONTH);
        System.out.println(month);  // 西方的月份 0 - 11，东方 1 - 12

        int dayMonth = calendar.get(Calendar.DAY_OF_MONTH); // 或者 Calendar.DATE
        System.out.println(dayMonth);
    }

    /**
     * public void set(int field, int value)：将给定的日历字段设置为给定值
     *  参数：
     *      int field: 传递指定的日历字段（YEAR、MONTH。。。）
     *      int value: 给指定字段设置的值
     */
    private static void demo02(Calendar calendar) {
        
        calendar.set(Calendar.YEAR, 9999);
        calendar.set(Calendar.MONTH, 12);
        calendar.set(Calendar.DATE, 9);
        
        // 同时设置年月日，可以使用 set 的
        calendar.set(8888, 8, 8);
    }

    /**
     * public abstract void add(int field, int amount)：根据日历的规则，为给定的日历字段添加或者减去指定的时间量
     * 指定字段增加/减少指定的值
     *  int field: 指定日历字段值
     *  int value: 增加/减少指定的量 
     *      正数：增加
     *      负数：减少
     */
    private static void demo03(Calendar calendar) {
        
        // 年增加两年
        calendar.add(Calendar.YEAR, 2);
    }

    /**
     * 测试将 Calenar 设置为当前时区
     */
    private static void test01() {
        Calendar instance = Calendar.getInstance();
        
        Date date = new Date();
        
        instance.setTime(date);
        
        instance.set(2088, 11, 12);

        System.out.println("Year: " + instance.get(Calendar.YEAR));
        System.out.println("Month: " + (instance.get(Calendar.MONTH) + 1));
        System.out.println("Day: " + instance.get(Calendar.DAY_OF_MONTH));
    }

    /**
     * 测试 DateTimeFormatter 进行日期本地化
     */
    private static void test02() {
        // String date = new Date().toString();
        String date = "Fri Jul 30 10:04:48 2021";
        System.out.println(date);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE MMM dd HH:mm:ss yyyy", Locale.US);
        LocalDateTime parse = LocalDateTime.parse(date, formatter);

        System.out.println(parse);
    }
}
```

### 4、Java8 新时间

从Java 8开始，`java.time`包提供了新的日期和时间API，主要涉及的类型有：



- 本地日期和时间：`LocalDateTime`，`LocalDate`，`LocalTime`；
- 带时区的日期和时间：`ZonedDateTime`；
- 时刻：`Instant`；
- 时区：`ZoneId`，`ZoneOffset`；
- 时间间隔：`Duration`。

以及一套新的用于取代`SimpleDateFormat`的格式化类型`DateTimeFormatter`。



和旧的API相比，新API严格区分了时刻、本地日期、本地时间和带时区的日期时间，并且，对日期和时间进行运算更加方便。



此外，新API修正了旧API不合理的常量设计：

- Month的范围用1~12表示1月到12月；
- Week的范围用1~7表示周一到周日。



#### （1）LocalDateTime

我们首先来看最常用的`LocalDateTime`，它表示一个本地日期和时间：

```java
@Test
public void test_localDateTime() {

    LocalDate ld = LocalDate.now();
    System.out.println(ld); // 2021-11-05

    LocalTime lt = LocalTime.now();
    System.out.println(lt); // 11:03:40.955

    LocalDateTime ldt = LocalDateTime.now();
    System.out.println(ldt); // 2021-11-05T11:05:49.179


    // 或者这样
    LocalDateTime ldt1 = LocalDateTime.now();
    LocalDate localDate = ldt1.toLocalDate();
    LocalTime localTime = ldt1.toLocalTime();

    System.out.println(ldt1);   // 2021-11-05T11:07:10.014
    System.out.println(localDate); // 2021-11-05
    System.out.println(localTime); // 11:07:10.014
}
```

反过来，通过指定的日期和时间创建`LocalDateTime`可以通过`of()`方法：

```java
@Test
public void test_ldt() {

    // 指定日期和时间
    LocalDate ld = LocalDate.of(2021, 11, 4);   // 2021-11-04
    LocalTime lt = LocalTime.of(15, 16, 17);        // 15.16.17
    LocalDateTime ldt = LocalDateTime.of(ld, lt);

    System.out.println(ld); // 2021-11-04
    System.out.println(lt); // 15:16:17
    System.out.println(ldt); // 2021-11-04T15:16:17

    LocalDateTime ldt1 = LocalDateTime.of(2021, 11, 5, 10, 30, 21);
    System.out.println(ldt1);   // 2021-11-05T10:30:21
}
```

因为严格按照ISO 8601的格式，因此，将字符串转换为`LocalDateTime`就可以传入标准格式：

```java
@Test
public void test_ldt2() {

    LocalDateTime ldt = LocalDateTime.parse("2021-01-01T13:14:15");
    LocalDate ld = LocalDate.parse("2021-02-02");
    LocalTime lt = LocalTime.parse("21:21:21");

    System.out.println(ldt);    // 2021-01-01T13:14:15
    System.out.println(ld);     // 2021-02-02
    System.out.println(lt);     // 21:21:21
}
```

注意ISO 8601规定的日期和时间分隔符是`T`。标准格式如下：

- 日期：yyyy-MM-dd
- 时间：HH:mm:ss
- 带毫秒的时间：HH:mm:ss.SSS
- 日期和时间：yyyy-MM-dd'T'HH:mm:ss
- 带毫秒的日期和时间：yyyy-MM-dd'T'HH:mm:ss.SSS

> 对日期和时间的简单加减（链式调用）

```java
@Test
public void test_ldt_calculate() {
    LocalDateTime ldt = LocalDateTime.now();

    System.out.println(ldt);

    // day
    System.out.println(ldt.plusDays(1));    // 加一天
    System.out.println(ldt.minusDays(1));   // 减一天

    // month
    System.out.println(ldt.plusMonths(1));  // 加一月
    System.out.println(ldt.minusMonths(1)); // 减一月

    // year
    System.out.println(ldt.plusYears(1));   // 加一年
    System.out.println(ldt.minusYears(1));  // 减一年

    // 链式调用
    System.out.println(ldt.plusDays(5).minusHours(1)); // 加五天减 1 小时
}
```

简单加减用的是 `plusXxx` 和 `minusXxx` 方法。

如果要直接修改日期可使用 `withXxx` 方法：

- 调整年：withYear()
- 调整月：withMonth()
- 调整日：withDayOfMonth()
- 调整时：withHour()
- 调整分：withMinute()
- 调整秒：withSecond()

> LocalDateTime 的通用 with() 方法

```java
@Test
public void test_with() {

    DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    LocalDateTime firstDay = LocalDate.now().withDayOfMonth(1).atStartOfDay();

    // 本月第一天 0:00 时刻
    // 2021-11-01 00:00:00
    System.out.println(firstDay.withDayOfMonth(1).format(dtf));

    // 本月最后一天
    LocalDate lastDay = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());
    System.out.println(lastDay);

    // 下月第一天
    LocalDate nextMonthFirstDay = LocalDate.now().with(TemporalAdjusters.firstDayOfNextMonth());
    System.out.println(nextMonthFirstDay);

    // 本月第一个周一
    LocalDate firstWeekDay = LocalDate.now().with(TemporalAdjusters.firstInMonth(DayOfWeek.MONDAY));
    System.out.println(firstWeekDay);
}
```

这里面用到了两个工具：

- TemporalAdjusters
- DayOfWeek

> 补充

- 要判断两个 LocalDateTime 的先后（LocalDate 和 LocalTime 也一样）
  - `isBefore()`
  - `isAfter()`
  - 注意到`LocalDateTime`无法与时间戳进行转换，因为`LocalDateTime`没有时区，无法确定某一时刻。



> Duration 和 Period

- `Duration`表示两个时刻之间的时间间隔。另一个类似的`Period`表示两个日期之间的天数：

```java
@Test
public void test_duration_period() {

    LocalDateTime start = LocalDateTime.of(2021, 10, 11, 8, 0, 0);
    LocalDateTime end = LocalDateTime.of(2021, 11, 11, 9, 0, 0);

    Duration d = Duration.between(start, end);
    System.out.println(d);	// PT745H

    Period p = LocalDate.of(2021, 10, 10).until(LocalDate.of(2021, 11, 30));
    System.out.println(p);	// P1M20D
}
```

注意到两个`LocalDateTime`之间的差值使用`Duration`表示，类似`PT1235H10M30S`，表示1235小时10分钟30秒。而两个`LocalDate`之间的差值用`Period`表示，类似`P1M21D`，表示1个月21天。

java8 引入的 java.time API 和开源项目 **Joda Time **类似。因为 JDK 团队邀请了 joda time 作者参于设计 Java.time api。

> 小结



Java 8引入了新的日期和时间API，它们是不变类，默认按ISO 8601标准格式化和解析；

使用`LocalDateTime`可以非常方便地对日期和时间进行加减，或者调整日期和时间，它总是返回新对象；

使用`isBefore()`和`isAfter()`可以判断日期和时间的先后；

使用`Duration`和`Period`可以表示两个日期和时间的“区间间隔”。



#### （2）ZonedDateTime

`LocalDateTime`总是表示本地日期和时间，要表示一个带时区的日期和时间，我们就需要`ZonedDateTime`。

可以简单地把`ZonedDateTime`理解成`LocalDateTime`加`ZoneId`。`ZoneId`是`java.time`引入的新的时区类，注意和旧的`java.util.TimeZone`区别。



```java
@Test
public void test_zonedDateTime() {

    // ------------ 第一种创建方式 -----------------
    // 默认时区
    ZonedDateTime zbj = ZonedDateTime.now();    
    // 用指定时区获得当前时间
    ZonedDateTime zny = ZonedDateTime.now(ZoneId.of("America/New_York"));   

    System.out.println(zbj);
    // 2021-11-05T15:04:44.748+08:00[Asia/Shanghai]
    System.out.println(zny);
    // 2021-11-05T03:04:44.750-04:00[America/New_York]
    
    
    // ------------ 第二种创建方式 -----------------
    LocalDateTime ldt = LocalDateTime.of(2021, 11, 11, 11, 12, 13);
    ZonedDateTime zbj = ldt.atZone(ZoneId.systemDefault());
    ZonedDateTime zny = ldt.atZone(ZoneId.of("America/New_York"));

    System.out.println(zbj);
    System.out.println(zny);
}
```

当然如果有 ZonedDateTime 也可以直接将其转换为 LocalDateTime，调用 `toLocalDateTime()` 方法，舍弃时区就可以了。



#### （3）DateTimeFormatter

使用旧的`Date`对象时，我们用`SimpleDateFormat`进行格式化显示。使用新的`LocalDateTime`或`ZonedLocalDateTime`时，我们要进行格式化显示，就要使用`DateTimeFormatter`。

和`SimpleDateFormat`不同的是，`DateTimeFormatter`不但是不变对象，它还是线程安全的。现在我们只需要记住：因为`SimpleDateFormat`不是线程安全的，使用的时候，只能在方法内部创建新的局部变量。而`DateTimeFormatter`可以只创建一个实例，到处引用。



```java
@Test
public void test_dateTimeFormatter() {

    ZonedDateTime zdt = ZonedDateTime.now();
    LocalDate ld = zdt.toLocalDate();

    // 创建方式一：传入格式化字符串
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    // 创建方式二：传入格式化字符串，同时指定 Locale
    DateTimeFormatter formatter1 = DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.getDefault());

    System.out.println(zdt.format(formatter));
    LocalDateTime parse = LocalDateTime.parse("2021-11-05 15:13:06", formatter);
    System.out.println(parse);

    System.out.println(ld.format(formatter1));
    LocalDate parse1 = LocalDate.parse("2021-11-05", formatter1); 
}
```

#### （4）Instant

计算机存储的当前时间，本质上只是一个不断递增的整数。Java提供的`System.currentTimeMillis()`返回的就是以毫秒表示的当前时间戳。

这个当前时间戳在`java.time`中以`Instant`类型表示，我们用`Instant.now()`获取当前时间戳，效果和`System.currentTimeMillis()`类似：

```java
@Test
public void test_instant() {

    Instant now = Instant.now();

    System.out.println(now.getEpochSecond());   // 秒
    System.out.println(now.toEpochMilli()); // 毫秒

    System.out.println(System.currentTimeMillis());
}
```

既然`Instant`就是时间戳，那么，给它附加上一个时区，就可以创建出`ZonedDateTime`：

```java
// 以指定时间戳创建Instant:
Instant ins = Instant.ofEpochSecond(1568568760);
ZonedDateTime zdt = ins.atZone(ZoneId.systemDefault());
System.out.println(zdt); // 2019-09-16T01:32:40+08:00[Asia/Shanghai]
```

可见，对于某一个时间戳，给它关联上指定的`ZoneId`，就得到了`ZonedDateTime`，继而可以获得了对应时区的`LocalDateTime`。

所以，`LocalDateTime`，`ZoneId`，`Instant`，`ZonedDateTime`和`long`都可以互相转换：



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211105152111.png)

转换的时候，只需要留意`long`类型以毫秒还是秒为单位即可。

小结：`Instant`表示高精度时间戳，它可以和`ZonedDateTime`以及`long`互相转换。

### 5、新旧 API 转换

> 旧 API 转 新 API

如果要把旧式的`Date`或`Calendar`转换为新API对象，可以通过`toInstant()`方法转换为`Instant`对象，再继续转换为`ZonedDateTime`：

```java
// Date -> Instant:
Instant ins1 = new Date().toInstant();

// Calendar -> Instant -> ZonedDateTime:
Calendar calendar = Calendar.getInstance();
Instant ins2 = calendar.toInstant();
ZonedDateTime zdt = ins2.atZone(calendar.getTimeZone().toZoneId());
```



从上面的代码还可以看到，旧的`TimeZone`提供了一个`toZoneId()`，可以把自己变成新的`ZoneId`。



> 新 API 转旧 API

如果要把新的`ZonedDateTime`转换为旧的API对象，只能借助`long`型时间戳做一个“中转”：

```java
// ZonedDateTime -> long:
ZonedDateTime zdt = ZonedDateTime.now();
long ts = zdt.toEpochSecond() * 1000;

// long -> Date:
Date date = new Date(ts);

// long -> Calendar:
Calendar calendar = Calendar.getInstance();
calendar.clear();
calendar.setTimeZone(TimeZone.getTimeZone(zdt.getZone().getId()));
calendar.setTimeInMillis(zdt.toEpochSecond() * 1000);
```

从上面的代码还可以看到，新的`ZoneId`转换为旧的`TimeZone`，需要借助`ZoneId.getId()`返回的`String`完成。

> 数据库中存储日期和时间

除了旧式的`java.util.Date`，我们还可以找到另一个`java.sql.Date`，它继承自`java.util.Date`，但会自动忽略所有时间相关信息。



在数据库中，也存在几种日期和时间类型：

- `DATETIME`：表示日期和时间；
- `DATE`：仅表示日期；
- `TIME`：仅表示时间；
- `TIMESTAMP`：和`DATETIME`类似，但是数据库会在创建或者更新记录的时候同时修改`TIMESTAMP`。



在使用Java程序操作数据库时，我们需要把数据库类型与Java类型映射起来。下表是数据库类型与Java新旧API的映射关系：



| 数据库    | 对应Java类（旧）   | 对应Java类（新） |
| :-------- | :----------------- | :--------------- |
| DATETIME  | java.util.Date     | LocalDateTime    |
| DATE      | java.sql.Date      | LocalDate        |
| TIME      | java.sql.Time      | LocalTime        |
| TIMESTAMP | java.sql.Timestamp | LocalDateTime    |

实际上，在数据库中，我们需要存储的最常用的是时刻（`Instant`），因为有了时刻信息，就可以根据用户自己选择的时区，显示出正确的本地时间。所以，最好的方法是直接用长整数`long`表示，在数据库中存储为`BIGINT`类型。

通过存储一个`long`型时间戳，我们可以编写一个`timestampToString()`的方法，非常简单地为不同用户以不同的偏好来显示不同的本地时间：



```java
public class Main {
    public static void main(String[] args) {
        long ts = 1574208900000L;
        System.out.println(timestampToString(ts, Locale.CHINA, "Asia/Shanghai"));
        System.out.println(timestampToString(ts, Locale.US, "America/New_York"));
    }

    static String timestampToString(long epochMilli, Locale lo, String zoneId) {
        Instant ins = Instant.ofEpochMilli(epochMilli);
        DateTimeFormatter f = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM, FormatStyle.SHORT);
        return f.withLocale(lo).format(ZonedDateTime.ofInstant(ins, ZoneId.of(zoneId)));
    }
}
```



小结：

- 处理日期和时间时，尽量使用新的`java.time`包；

- 在数据库中存储时间戳时，尽量使用`long`型时间戳，它具有省空间，效率高，不依赖数据库的优点。



## 三、System 类

`java.lang.System` 类中提供了大量的静态方法，可以获取与系统相关的信息或系统级操作，在 System 类的  API 文档中，常用的方法有：

- `public static long currentTimeMillis()`：返回以毫秒为单位的当前时间
- `public static void arraycopy(Object src, int srcPos, Object dest, int destPos, int length)`：将数组中指定的数据拷贝到另一个数组中



```java
public class API_System {

    public static void main(String[] args) {
        
        timeMillis();

        arrayCopy();
    }
    
    private static void timeMillis() {
        // 获取档期毫秒数
        long timeStamp_1 = System.currentTimeMillis();
        System.out.println("开始时间: " + timeStamp_1);

        int temp;
        for (int i = 0; i < 9999; i++) {
            temp = i;
        }

        long timeStamp_2 = System.currentTimeMillis();
        System.out.println("结束时间: " + timeStamp_2);
        System.out.println("程序共耗时: " + (timeStamp_2 - timeStamp_1) + " 毫秒");
    }

    /**
     * public static void arraycopy(Object src, int srcPos, Object dest, int destPos, int length)
     * 参数：
     *      src: 源数组
     *      srcPos: 源数组中的起始位置
     *      dest: 目标数组
     *      destPost: 目标数组的起始位置
     *      length: 要赋值的数组元素的数量, 注意不要下标越界
     */
    public static void arrayCopy() {
        
        int[] source = {1, 2, 3, 4, 5};
        int[] target = {7, 8, 9, 10, 11, 12, 13};
        
        // 推测结果：target : { 7, 2, 3, 4, 5, 12, 13 }
        System.arraycopy(source, 1, target, 1, 4);
        System.out.println(Arrays.toString(target));
    }
}
```



## 四、StringBuilder 类

String 类：

- 字符串是常量，它们的值在创建之后不能被修改
- 字符串的底层是一个被 final 修饰的数组，不能改变，是一个常量



进行字符串的相加，内存中就会有多个字符串，占用空间多，效率低下



StringBuilder 类

- 字符串缓冲区，可以提高字符串的操作效率
- 底层也是一个数组，但是没有被 final 修饰，可以改变长度

StringBulider 在内存中始终是一个数组，占用空间少，效率高，如果超出了 StringBuilder 的容量，会自动扩容





## 五、包装类

### 1、自动装箱与自动拆箱

```java
/**
 * 装箱：把基本类型的数据，包装到包装类中
 *  构造方法：
 *      Integer(int value)
 *      Integer(String s)
 *  静态方法：
 *      static Integer valueOf(int i)
 *      static Integer valueOf(String s)
 *      
 *  自动装箱与自动拆箱：基本类型的数据和包装类之间可以自动的相互转换
 *  JDK1.5 之后出现的新特性
 */
public class API_PackagingGroup {

    public static void main(String[] args) {

        System.out.println("=========  装箱 =============");
        // 构造方法
        Integer in1 = new Integer(1);

        Integer in2 = new Integer("1");
        
        // 静态方法
        Integer in3 = Integer.valueOf(1);

        Integer in4 = Integer.valueOf("1");

        System.out.println("=========  拆箱 =============");

        int i1 = in1.intValue();
    }
}
```

### 2、基本类型与字符串之间的转换

> 基本类型转字符串

三种方式：

- `toString()` 方法
- `String.valueOf()` 方法
- `+`：运算符

把一个基本数据类型转换为 String，使用 `.toString()`  是最快的方式、`String.valueOf` 和 `toString()` 差不多，`+` 的效率最慢，其实这些执行都是毫秒级，现在处理器的性能都比较强悍，其实影响不大。

> 字符串转基本类型

比如 String 转 int

- `Integer.parseInt(String s)`

