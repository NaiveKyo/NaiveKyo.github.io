---
title: Spring Boot Serialization Support For Java8 Datetype
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425110504.jpg'
coverImg: /img/20220425110504.jpg
cover: false
toc: true
mathjax: false
date: 2022-10-06 00:35:26
summary: "Java8 新旧时间 API、Spring MVC、Spring Boot 中对新时间的支持"
categories: "Spring Boot"
keywords: ["Spring Boot", "Date API"]
tags: "Spring Boot"
---



# 一、简介

在 Java 中对时间的抽象：

- Java 1.0 引入了 `java.util.Date` 类；
- Java 1.1 引入了 `java.util.Calendar` 类，此时 Date 中大部分方法被废弃；
- Calendar 也存在一些问题，所以 Java 8 中引入了 `java.time` API，它修正了过去的缺陷，可以使用相当长一段时间；

# 二、Java 8 新时间 API

## 1、Instant 和 Duration

基本的时间单位 "秒" 是从地球自转中推导出来的。地球自转需要 24 个小时，即 24x24x60=86400 秒，但是由于地球存在轻微的自颤，所以需要更加精确的定义。1976 年，人们根据铯 133 原子内在的特性推导出与其历史定义相匹配的秒的新的精确定义。从此之后，原子钟网络就一直被当作官方时间。

官方时间的维护者需要时常将绝对时间与地球自转进行同步。首先，官方的秒需要稍作调整，从 1972 年开始，偶尔需要插入 "闰秒"，这就涉及到修改系统时间了，所以对于计算机而言，本机时间可能不是那么准确，需要时常将自身的时间与外部的时间服务进行同步。

Java 的 Date 和 Time API 规范要求 Java 使用的时间尺度为：

- 每天 86400 秒；
- 每天正午与官方时间精确匹配；
- 在其他时间点上，以精确定义的方式与官方时间接近匹配。

从某个原点开始可以认为时间是一条线，这个时间线原点一般被设置为穿过伦敦格林威治皇家天文台的本初子午线所处时区的 1970 年 1 月 1 日的午夜。从该原点开始，时间按照每天 86400 秒向前或向后度量，精确到纳秒。

在 Java 中，`java.time.Instant` 表示时间线上的某个点，它的值向后可追溯 10 亿年（Instant.MIN），向前可达公元 1 000 000 000 年的 12 月 31 日（Instant.MAX），对于现在而言已经够用了。而 `java.time.Duration` 代表的是两个 Instant 之间的时间差：

```java
@Test
public void test1() throws InterruptedException {
    // 比较两个 Instant 可以使用 compare 或者 equals
    Instant begin = Instant.now();
    TimeUnit.SECONDS.sleep(1);
    Instant end = Instant.now();

    Duration timeElapsed = Duration.between(begin, end);
    long millis = timeElapsed.toMillis();

    System.out.println(millis);
}
```

`Duration` 是两个时刻之间的时间量，可以通过 `toNanos`、`toMillis`、`getSeconds`、`toMinutes`、`toHours`、和 `toDays` 来获得 Duration 按照传统单位度量的时间长度。

补充：

- Instant 和 Duration 可以通过诸如 plus、minus 开头的诸多方法进行算术运算；
- 两者都是不可变的，调用很多方法会返回一个新的实例。

下面的例子展示如何对某个算法进行计时：

```java
@Test
public void test2() {
    Instant start = Instant.now();
    algorithm1();
    Instant end = Instant.now();
    Duration timeElapsed = Duration.between(start, end);
    long millis = timeElapsed.toMillis();
    System.out.printf("%d milliseconds\n", millis);

    Instant start2 = Instant.now();
    algorithm2();
    Instant end2 = Instant.now();
    Duration timeElapsed2 = Duration.between(start2, end2);
    System.out.printf("%d milliseconds\n", timeElapsed2.toMillis());

    boolean overTenTimesFaster = timeElapsed.multipliedBy(10).minus(timeElapsed2).isNegative();

    System.out.printf("The first algorithm is %smore than ten times faster", overTenTimesFaster ? "" : "not ");
}

private static void algorithm1() {
    int size = 10;
    List<Integer> list = new Random().ints().map(i -> i % 100).limit(size).boxed().collect(Collectors.toList());
    Collections.sort(list);
    System.out.println(list);
}

private static void algorithm2() {
    int size = 10;
    List<Integer> list = new Random().ints().map(i -> i % 100).limit(size).boxed().collect(Collectors.toList());
    while (!IntStream.range(1, list.size()).allMatch(i -> list.get(i - 1).compareTo(list.get(i)) <= 0)) {
        Collections.shuffle(list);
    }
    System.out.println(list);
}
```

## 2、本地时间

### LocalDate 和 LocalDateTime

如果说 Instant 和 Duration 是绝对时间（格林威治 1970-01-01 00:00:00 为时间原点），那么对于人类而言，Java 提供了两种人类时间：

- 本地日期/时间；
  - 包含日期和当天的时间，但是与时区没有任何关联；
- 时区时间；
  - 和时区相关联，表示的是时间线上的精确的时刻；

在很多计算场景中并不需要时区，因为时区可能会导致问题变得更加复杂，比如说夏令时的影响，因此 API 设计者推荐程序员不要使用时区时间，除非确实要表示绝对时间，否则建议使用本地日期/时间。

本地日期：`java.time.LocalDate`；（带有年月日）

本地时间：`java.time.LocalDateTime`；（带有年月日时分秒）

两者都是不可变的，可以通过 `now()` 或 `of()`  方法生成实例，，也提供时间的数学运算

### Period

类比 Duration 和 Instant 的关系，不同 LocalDate、LocalDateTime 之间的间隔用 `java.time.Period` 表示，Period 可以代表年、月或日的数量。 

```java
@Test
public void test5() {
    LocalDate today = LocalDate.now();
    LocalDate yesterday = today.minusDays(1);

    Period until = yesterday.until(today);
    
    System.out.println(until.getDays());    // 1
    System.out.println(until.getMonths());  // 0
    System.out.println(until.getYears());   // 0
}
```

### LocalTime

`java.time.LocalTime` 表示当前时刻，例如："12:00:00"。可以使用 `now()` 或 `of()` 方法创建实例。

注意：LocalTime 对 am、pm 没有做处理，可以使用格式化来处理。

```java
@Test
public void test6() {
    LocalTime now = LocalTime.now();
    System.out.println(now);    // 18:29:36.360646500

    DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm:ss a");
    System.out.println(now.format(dtf));    // 18:31:42 下午
}
```



## 3、日期调整器  

`java.time.temporal.TemporalAdjuster` 是一个函数式接口，提供调整时间的一种策略。

```java
// 可以通过两种方式使用它
temporal = specifyAdjuster.adjustInto(temporal);
temporal = temporal.with(specifyAdjuster);
```

推荐使用第二种，调用 `with()` 方法来使用日期调整器。

`java.time.temporal.TemporalAdjusters` 则提供了一组日期调整策略：

- 找到月初和月末；
- 找到下个月的月初；
- 找到当年的年初和年末；
- 找到下一年的年初；
- 找到当月最初或最后的指定星期，比如当月第一个星期一，或当月最后一个星期一；
- 找到下一个或前一个星期，比如下一个星期二；

```java
@Test
public void test1() {
    DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    LocalDate today = LocalDate.now();

    // 月末
    LocalDate lastDayOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());
    System.out.println(lastDayOfMonth.format(dtf));
    
    // 年初
    LocalDate firstDayOfYear = today.with(TemporalAdjusters.firstDayOfYear());
    System.out.println(firstDayOfYear.format(dtf));
    
    // 下一年的年初
    LocalDate firstDayOfNextYear = today.with(TemporalAdjusters.firstDayOfNextYear());
    System.out.println(firstDayOfNextYear.format(dtf));
    
    // 当月第一个星期一
    LocalDate firstMondayInMonth = today.with(TemporalAdjusters.firstInMonth(DayOfWeek.MONDAY));
    System.out.println(firstMondayInMonth.format(dtf));
    
    // 当月最后一个星期一
    LocalDate lastMondayInMonth = today.with(TemporalAdjusters.lastInMonth(DayOfWeek.MONDAY));
    System.out.println(lastMondayInMonth.format(dtf));
    
    // 下周二
    LocalDate nextTuesday = today.with(TemporalAdjusters.next(DayOfWeek.TUESDAY));
    System.out.println(nextTuesday.format(dtf));
    
    // 上周三
    LocalDate previousWednesday = today.with(TemporalAdjusters.previous(DayOfWeek.WEDNESDAY));
    System.out.println(previousWednesday.format(dtf));
}
```

除此之外还可以自定义日期调整器：

```java
@Test
public void test2() {
    // 自定义 TemporalAdjuster
    // 获取自今日起的下一个工作日(包括今天)
    TemporalAdjuster nextOrSameWordDay = day -> {
        LocalDate from = LocalDate.from(day);
        while (from.getDayOfWeek().getValue() < 6) {
            from = from.plusDays(1);
        }
        return from;
    };

    LocalDate nextOrSameWorkDay = LocalDate.now().with(nextOrSameWordDay);
    System.out.println(nextOrSameWorkDay.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
}
```



## 4、时区时间

互联网编码分配管理机构（Internet Assigned Numbers Authority，IANA）保存着一个数据库，里面存储着世界上所有已知的时区（www.iana.org/time-zoned），它每年会更新数次，Java 使用了 IANA 数据库。

每个时区都有一个 ID，例如 America/New_Yord 和 Europe/Berlin。要想找出所有的时区，可以使用：

```java
@Test
public void test1() {
    Set<String> availableZoneIds = ZoneId.getAvailableZoneIds();
    availableZoneIds.forEach(System.out::println);
}
```

- `java.time.ZoneId`：时区代表的 id；
- `java.time.ZonedDateTime`：带时区的时间

```java
@Test
public void test2() {
    // 获得系统默认时区, 中国就是 Asia/Shanghai
    ZoneId zoneId = ZoneId.systemDefault();

    // 手动指定时区
    ZoneId zone = ZoneId.of("Europe/Berlin");
    LocalDateTime now = LocalDateTime.now();
    
    // 调用 atZone 方法将本地时间转换为带时区的时间
    ZonedDateTime zonedDateTime = now.atZone(zone);

    // 根据时区时间获得具体的时刻
    Instant instant = zonedDateTime.toInstant();
    
    // 反之如果有一个具体的时刻, 则可以将其转换为时区时间, 然后在转换为本地时间
    //ZonedDateTime utc = instant.atZone(ZoneId.of("UTC"));
    ZonedDateTime utc = instant.atZone(ZoneId.systemDefault());
    LocalDateTime localDateTime = utc.toLocalDateTime();
}
```

当我们获取一个时区 id 后，就可以将本地时间转换为指定时区的时间，带时区的时间可以表示一个具体的时刻，进而获取 Instant，当我们有一个时刻后，赋予指定的时区 id 就可以将其转换为时区时间，进而转换为本地时间。

注意：UTC 代表 "协调世界时"，这是英文 "Coordinated Universal Time" 和法文 "Temps Universal Time" 首字母缩写的折中，它与这两种语言中的缩写都不一致。UTC 是不考虑夏令时的格林威治皇家天文台时间。

ZonedDateTime 中许多方法都和 LocalDateTime 相同，都是不可变的，且提供时间的算术运算，但是需要注意的是，一旦引入了时区，就可能会遇到类似夏令时这种问题，此时就需要格外注意。

在调整跨越夏令时边界的时期时应该使用 `Period` 而不是 `Duration`。

> 补充

`java.time.OffsetDateTime` 类，表示与 UTC 具有偏移量的时间，但是没有时区的束缚。

这个类被专门设计用于专用应用，这些应用需要剔除这些规则的约束，例如某些网络协议。对于人类时间，应该使用 `ZonedDateTime`。



## 5、格式化和解析

`java.time.format.DateTimeFormatter` 类是专门用于新时间 API 的格式化和解析操作的，它提供三种用于打印日期/时间值的格式化工具：

- 预定义的格式化工具；
  - 参考该类上的注释，需要注意的是标准格式化工具主要是为了机器刻度的时间戳而设计的，对于人类时间可以使用第二种带 Locale 的格式化器。
- Locale 相关的格式化工具（`java.util.Locale` 涉及到国际化）；

对于日期和时间来说，有四种与 Locale 相关的格式化风格，在 `java.time.format.FormatStyle` 枚举类中定义：

FULL、LONG、MEDIUM、SHORT；

```java
@Test
public void test3() {
    
    // 下列方法使用默认的 Locale
    // DateTimeFormatter.ofLocalizedDateTime();
    // DateTimeFormatter.ofLocalizedTime();
    
    DateTimeFormatter dtf = DateTimeFormatter.ofLocalizedDate(FormatStyle.FULL);

    LocalDateTime now = LocalDateTime.now();
    System.out.println(now.format(dtf));    // 2022年9月13日星期二
    
    // 指定 Locale 可以这样
    System.out.println(dtf.withLocale(Locale.JAPAN).format(now));   // 2022年9月13日火曜日
}
```

- 定制的格式化工具；

```java
@Test
public void test4() {
    LocalDateTime now = LocalDateTime.now(ZoneId.of("America/New_York"));
    
    // 2022-09-13T11:12:22.6319274
    System.out.println(DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(now.atZone(ZoneId.of("America/New_York"))));
    
    // 2022/9/13 上午11:12
    System.out.println(DateTimeFormatter.ofLocalizedDateTime(FormatStyle.SHORT).format(now));
    
    // 2022-09-13
    DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    System.out.println(dtf.format(now));
    
    // 2022-08-08
    String text = "2022-08-08";
    System.out.println(LocalDate.parse(text, dtf));
}
```

上面演示了三种格式化方式，最后补充了如何利用自定义格式化器解析时间字符串。

常用的日期/时间格式化符号在 DateTimeFormatter 类上的注释中都标出来了。

> 补充

`java.time.format.DateTimeFormatter` 类被设计用来替代 `java.text.DateFormat` 的。如果想要向后兼容，可以使用 `formatter.toFormat()` 方法：

```java
@Test
public void test5() {
    DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    Format format = dtf.toFormat();
}
```

## 6、简单总结

前面了解了：`LocalDate、LocalTime、LocalDateTime、Instant、Duration、Period`

- LocalDate 表示简单的日、月、年时间，不关联时区；
- LocalTime 表示简单的时、分、秒时间，不关联时区；
- LocalDateTime 是前两者的结合体，同时表示了日期和时间，但不带有时间信息；
- Instant：对时间进行建模，以 Unix 元年时间为起点，表示一个具体的时刻：
  - 可以通过 `now()` 或 `ofEpochMilli()` 方法构建；
- Temporal：接口定义了如何读取和操作为时间建模的对象的值；
- Duration：表示两个 Temporal 之间的间隔，通常用于 Instance；
- Period：表示时间范围，常用于 LocalDate、LocalDateTime；



## 7、新旧时间 API 转换

Java Date 和 Time API 必须能够与已有的类进行相互转换，旧的时间 API 如：

- `java.util.Date`；
- `java.util.GregorianCalendar`；
- `java.sql.Date/Time/Timestamp`；

`Instant` 类似于 `java.util.Date`，在 Java SE 8 中，这个类有两个额外的方法：

- 将 Date 转换为 Instant 的 toInstant 方法，以及反方向转换的静态的 from 方法；

```java
@Test
public void test6() {
    // java.util.Date 和 Instant 转换 
    Date date = new Date();
    Instant instant = date.toInstant();
    
    // instant 到 LocalDate
    LocalDate localDate = instant.atZone(ZoneId.systemDefault()).toLocalDate();
    System.out.println(DateTimeFormatter.ofPattern("yyyy-MM-dd").format(localDate));
}
```

```java
@Test
public void test7() {
    // Instant 到 java.util.Date
    Instant now = Instant.now();
    Date from = Date.from(now);

    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

    System.out.println(sdf.format(from));
}
```

另一个可用于日期和时间的转换集位于 `java.sql` 包中。

下表描述了 `java.time` 包下的日期和时间与旧的时间 API 相互转换使用的方法：

| 类                                             | 转换到旧的时间 API                      | 转换为新的时间 APi            |
| ---------------------------------------------- | --------------------------------------- | ----------------------------- |
| `Instant -- Java.util.Date`                    | `Date.from(instant)`                    | `date.toInstant()`            |
| `ZonedDateTime -- java.util.GregorianCalendar` | `GregorianCalendar.from(zonedDateTime)` | `cal.toZonedDateTime()`       |
| `Instant -- java.sql.Timestamp`                | `TimeStamp.from(instant)`               | `timestamp.toInstant()`       |
| `LocalDateTime -- java.sql.Timestamp`          | `TimeStamp.valueOf(localDateTime)`      | `timestamp.toLocalDateTime()` |
| `LocalDate -- java.sql.Date`                   | `Date.valueOf(localDate)`               | `date.toLocalDate()`          |
| `LocalTime -- java.sql.Time`                   | `Time.valueOf(localTime)`               | `time.toLocalTime()`          |
| `DateTimeFormatter -- java.text.DateFormat`    | `formatter.toFormat()`                  | 无                            |
| `java.util.TimeZone -- ZoneId`                 | `TimeZone.getTimeZone(id)`              | `timeZone.toZoneId()`         |
| `Java.nio.file.attribute.FileTime -- Instant`  | `FileTime.from(instant)`                | `fileTime.toInstant()`        |





# 三、新时间 API 序列化

结合现在流程的 Spring 框架系列：

- SSM 项目基于 xml 增加对 Java 8 时间 API 序列化支持；
- Spring Boot 项目增加对 Java 8 时间 API 序列化支持；

在学习之前应该有关于 Spring 的几个概念：

- Spring 类型转换器：https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#core-convert
- Spring 字段格式化器：https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#format

关于 Spring MVC 的一些知识：

- Spring MVC 的 Type Conversion：https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-config-conversion
- Spring MVC 的消息转换（涉及到序列化和反序列化）：https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-config-message-converters

## 1、SSM

SSM 项目环境搭建参考：https://naivekyo.github.io/2022/04/18/java-web-integration-ssm-with-tomcat/

IDEA 配置 Tomcat 参考：https://naivekyo.github.io/2022/03/02/java-web-build-the-tomcat-application-with-idea/

因为是测试，所以仅需要一些必要的配置即可，顺带补充一下，早期 Spring 基于 xml 配置的时候，如果要引入第三方类库，就需要提供对应的命名空间及其解析器，通过配置文件 spring.handlers、spring.schemas 文件注入，不像后来的 SpringBoot 是以 spring.factories 的形式注入自动装配类。

序列化库，选择 jackson，jackson 有三大核心模块：

- `jackson-core`：提供低层次的流 API，以及 JSON 规范的实现；
- `jackson-annotationx`：包含标准 jackson 注解；
- `jackson-databind`：在流包的基础上实现了对 data-binding、object serialization 的支持，它依赖于上面两个包；

补充：jackson 的官网，https://github.com/FasterXML/jackson

可以参考 GitHub 官方说明以及其 wiki，注意，依赖只需导入 databind 即可，因为它包含了 core 和 annotations。

依赖：

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>5.3.23</version>
    </dependency>

    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-aspects</artifactId>
        <version>5.3.23</version>
    </dependency>

    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <version>4.0.1</version>
        <scope>provided</scope>
    </dependency>

    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.24</version>
        <scope>provided</scope>
    </dependency>

    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter-api</artifactId>
        <version>5.9.0</version>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.13.4</version>
    </dependency>
</dependencies>
```

spring-application.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
            http://www.springframework.org/schema/beans/spring-beans.xsd
            http://www.springframework.org/schema/context
            https://www.springframework.org/schema/context/spring-context.xsd
            http://www.springframework.org/schema/mvc
            https://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <!-- 自动扫描包，让指定包下的注解生效，由 IOC 容器同一管理 -->
    <context:component-scan base-package="io.naivekyo.controller"/>
    <!-- 注解驱动 -->
    <mvc:annotation-driven/>
    <!-- 让 spring MVC 不处理静态资源 -->
    <mvc:default-servlet-handler/>
    
</beans>
```

web.xml

补充：如果要注入其他的过滤器可以考虑一下优先级的问题，filter 在 web.xml 中定义的先后顺序决定其在过滤器链中的位置。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
    
    <display-name>ssm-study</display-name>
    
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>
    
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/spring-application.xml</param-value>
    </context-param>
    
    <servlet>
        <servlet-name>dispatcher</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>/WEB-INF/spring-application.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    
    <servlet-mapping>
        <servlet-name>dispatcher</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
    
    <filter>
        <filter-name>encoding</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
    </filter>
    
    <filter-mapping>
        <filter-name>encoding</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
    
</web-app>
```

从两方面考虑：

- 使用 Spring MVC 提供的相关格式化注解时，例如 `@DateTimeFormat`；
- Spring MVC 在将 json 对象转换为 Java Bean 时映射 json 解析规则，例如 string -> LocalDateTime；

### （1）Spring 的 Converter 和 Formatter

说明：

- `org.springframework.core.convert.converter.Converter` 是 Spring 自 3.0 起提供的一个通用的类型转换系统，是一种 SPI，提供了类型转换的具体执行逻辑；
- `org.springframework.core.convert.ConversionService` 则是 Spring 提供的 API 用于在运行时通过 `Converter` 执行类型转换；
- 通过 `ConversionService` 这一个统一的门面 API 接口，调用 `Converter` 这个 SPI 去执行类型转换；
- Spring 中 Bean 的属性绑定、Spring EL、DataBinder 都使用这一套系统去做类型转换；

同时考虑这样的应用场景，在不同的应用环境下需要对特定的类型做一些处理，比如日期的转换，将 timestamp 转换为 String，将 String 转换到特定的格式（此时 Converter 就不足以处理了）；

为了解决相关问题，Spring 提供了 `org.springframework.format.Formatter` 这一 SPI，主要用于特定类型的格式化处理：

```java
public interface Formatter<T> extends Printer<T>, Parser<T> {
}
```

format 包下的其他子包提供了一系列非常方便的转换工具，例如 datatime 包下面的 `org.springframework.format.datetime.DateFormatter` 就提供了使用 `java.text.DateFormat` 格式化 `java.util.Date` 的方法。

> 基于注解的格式化

如果想通过在字段上标注注解来进行格式化，可以实现 `org.springframework.format.AnnotationFormatterFactory`  接口：

```java
package org.springframework.format;

public interface AnnotationFormatterFactory<A extends Annotation> {

    Set<Class<?>> getFieldTypes();

    Printer<?> getPrinter(A annotation, Class<?> fieldType);

    Parser<?> getParser(A annotation, Class<?> fieldType);
}
```

- 泛型 A 就是格式化注解；
- `getFieldTypes()` 返回可以使用该注解的字段类型集；
- `getPrinter()` 提供一个 Printer 输出格式化后的字段值；
- `getParser` 提供一个 Parser 用于解析标注了注解的字段值；

案例可参考 Spring 提供的 `org.springframework.format.datetime.DateTimeFormatAnnotationFormatterFactory` 和注解 `org.springframework.format.annotation.DateTimeFormat`；

> FormatterRegistry SPI

`org.springframework.format.FormatterRegistry` 是一个用于注册 formatter 和 converter 的 SPI，而 `org.springframework.format.support.FormattingConversionService` 则是它的一个通用实现，通过编程式或者声明式的方式将它注入到 Spring 容器中（结合 `org.springframework.format.support.FormattingConversionServiceFactoryBean`），最终我们只需要配置好规则，便可以使用特定的注解对字段进行格式化了。

> FormatterRegistrar SPI

`org.springframework.format.FormatterRegistrar` 在是用于注册 `FormatterRegistry` 进而实现注册 formatter 和 converter 的目的，当某一种类型需要多种类型转换器时，使用它可以很好的解决该问题，比如时间字段，有传统的 java.text.DateFormat，也有 joda 的格式化器，还有 java.time 相关的格式化工具。

### （2）Spring MVC 中的 Type Conversion 和 Message Converters

> Type Conversion

默认情况下，Spring 已经注入了常规的 number、date 的格式化器，也可以使用 `@NumberFormat` 和 `@DateTimeFormat` 注解去自定义解析逻辑。

在 MVC 的环境下，想要自定义 formatter 和 converter 可以通过：

```java
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        // ...
    }
}
```

xml 格式下需要添加：

```xml
<mvc:annotation-driven conversion-service="conversionService"/>
<bean id="conversionService"
      class="org.springframework.format.support.FormattingConversionServiceFactoryBean">
    <property name="converters">
        <set>
            <bean class="org.example.MyConverter"/>
        </set>
    </property>
    <property name="formatters">
        <set>
            <bean class="org.example.MyFormatter"/>
            <bean class="org.example.MyAnnotationFormatterFactory"/>
        </set>
    </property>
    <property name="formatterRegistrars">
        <set>
            <bean class="org.example.MyFormatterRegistrar"/>
        </set>
    </property>
</bean>
```

默认情况下，Spring MVC 在解析和格式化日期相关的值时会考虑到请求中的 Locale，这种情况适用于在表单中以字符串形式传入的日期值。但是对于表单中 "date" 和 "time" 域，浏览器会遵循 HTML 规范使用一种固定的格式，此时可以这样做：

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        DateTimeFormatterRegistrar registrar = new DateTimeFormatterRegistrar();
        registrar.setUseIsoFormat(true);
        registrar.registerFormatters(registry);
    }
}
```

> Message Converters

在 Spring MVC 中，消息转换器主要负责处理 HTTP 请求和响应，比如读写、类型转换等等。

这里我们主要关注序列化相关的，以 Jackson 为例，通过提供定制的 `ObjectMapper` 来替代默认的 JSON Converter。

相关接口和类：

- `org.springframework.http.converter.HttpMessageConverter`
- `org.springframework.http.converter.json.AbstractJackson2HttpMessageConverter`
- `org.springframework.http.converter.json.MappingJackson2HttpMessageConverter`

常规情况下 Spring MVC 是不提供对 Java 8 新时间 API 的序列化支持的，这里通过注册 Jackson 的第三方扩展 datetype module 来实现相关功能：

```xml
<!-- support for using a new JDK8 feature, ability to access names of constructor and method parameters -->
<dependency>
    <groupId>com.fasterxml.jackson.module</groupId>
    <artifactId>jackson-module-parameter-names</artifactId>
    <version>2.13.4</version>
</dependency>

<!-- jackson module jsr310 for new java 8 date/time-->
<dependency>
    <groupId>com.fasterxml.jackson.datatype</groupId>
    <artifactId>jackson-datatype-jsr310</artifactId>
    <version>2.13.4</version>
</dependency>

<!-- jackson module for other new java 8 datatypes outside of date/time, such as Optional, OptionalLong ...-->
<dependency>
    <groupId>com.fasterxml.jackson.datatype</groupId>
    <artifactId>jackson-datatype-jdk8</artifactId>
    <version>2.13.4</version>
</dependency>
```

引入依赖后记得导入 Tomcat 中，不然使用 IDEA 启动会报错，找不到相关类。

引入 jsr310  依赖后，MVC 已经支持对 Java 8 新时间 API 的序列化支持了，遗憾的是默认对 LocalDateTime 的解析器是 ISO_LOCAL_DATE_TIME：

```java
// com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
addDeserializer(LocalDateTime.class, LocalDateTimeDeserializer.INSTANCE);

// com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer
public static final LocalDateTimeDeserializer INSTANCE = new LocalDateTimeDeserializer();

// 。。。
private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
```

如果要将其替换为 "yyyy-MM-dd HH:mm:ss" 格式，则需要自定义序列化和反序列化器注入到 ObjectMapper 中，Jackson 提供了两个接口用于序列化和反序列化：

- `com.fasterxml.jackson.databind.JsonSerializer`
- `com.fasterxml.jackson.databind.JsonDeserializer`

jsr310 则提供了对 LocalDateTime 类型进行解析的两个实现类：

- `com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer`
- `com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer`

为了方便，这里就不实现相关接口了，而是选择继承上面这两个类并加以改造：

```java
public class CustomizeLocalDateTimeSerializer extends LocalDateTimeSerializer {

    public static final CustomizeLocalDateTimeSerializer INSTANCE = new CustomizeLocalDateTimeSerializer();
    
    protected CustomizeLocalDateTimeSerializer() {
        super(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
    
}

public class CustomizeLocalDateTimeDeserializer extends LocalDateTimeDeserializer {

    public static final CustomizeLocalDateTimeDeserializer INSTANCE = new CustomizeLocalDateTimeDeserializer();
    
    protected CustomizeLocalDateTimeDeserializer() {
        super(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}
```

xml：

```xml
<mvc:annotation-driven>
    <mvc:message-converters>
        <bean class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter">
            <property name="objectMapper" ref="objectMapper"/>
        </bean>
    </mvc:message-converters>
</mvc:annotation-driven>

<bean id="objectMapper" class="org.springframework.http.converter.json.Jackson2ObjectMapperFactoryBean">
    <property name="simpleDateFormat" value="yyyy-MM-dd HH:mm:ss"/>
    <property name="serializersByType">
        <map>
            <entry key="java.time.LocalDateTime" value-ref="customizeLocalDateTimeSerializer"/>
        </map>
    </property>
    <property name="deserializersByType">
        <map>
            <entry key="java.time.LocalDateTime" value-ref="customizeLocalDateTimeDeserializer"/>
        </map>
    </property>
    <property name="modulesToInstall">
        <array>
            <value>com.fasterxml.jackson.module.paramnames.ParameterNamesModule</value>
            <value>com.fasterxml.jackson.datatype.jsr310.JavaTimeModule</value>
            <value>com.fasterxml.jackson.datatype.jdk8.Jdk8Module</value>
        </array>
    </property>
</bean>
```

这里使用 FactoryBean 实例化 ObjectMapper 并注册相应的模块，针对 `LocalDateTime` 类型提供自制的序列化和反序列化器。

Java Config 版本如下：

```java
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {

        Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder()
                .indentOutput(true)
                .dateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"))
                .serializers(CustomizeLocalDateTimeSerializer.INSTANCE)
                .deserializers(CustomizeLocalDateTimeDeserializer.INSTANCE)
                .modulesToInstall(new ParameterNamesModule(), new JavaTimeModule(), new Jdk8Module());
        
        converters.add(new MappingJackson2HttpMessageConverter(builder.build()));
    }
}
```



## 2、Spring Boot

新建一个 Spring Boot 项目，这里以 2.7.4 版本为例，在 Spring Boot 中配置文件一般以 properties 或者 yaml 形式提供，不同的环境选取不同的名称，第三方类库一般以 starter 的形式同 Spring Boot 结合，Bean 的注入一般以 Java Config 的方式。

依赖：

```xml
<!-- web support: servlet environment -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- json support: jackson and extended module -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-json</artifactId>
</dependency>

<!-- bean validator support -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

引入依赖后，按照 Spring Boot 的规则，我们可以查看 `org.springframework.boot.autoconfigure.jackson.JacksonAutoConfiguration` 类，看看 Spring Boot 做了哪些处理。

阅读源码可知，该自动装配类主要做了下列操作：

- Spring Boot 提供的两个 Jackson Module：JsonComponentModule 和 JsonMixinModule（具体作用参见源码）；
- 如果导入了 jackson-module-parameter-names 类库，就注册 ParameterNamesModule；
- 注册 Jackson2ObjectMapperBuilder，并对其进行定制化操作（Jackson 绑定的配置文件以及开发者提供的 Customizer）；
- <font style='color:green'>核心：StandardJackson2ObjectMapperBuilderCustomizer Bean 的注册</font>
  - 该 Bean 主要用于配置 `Jackson2ObjectMapperBuilder`，从而构建 `ObjectMapper`；
  - Builder 的配置来源：配置类 `JacksonProperties` 中的属性；

在使用 Customizer 配置 Builder 的时候有一个方法值得我们注意：`configureModules()` 方法，该方法从 Spring 上下文中查询类型为 `com.fasterxml.jackson.databind.Module` 的 Bean 注册到 Builder 中，debug 可以发现此时容器中只有三个 Module Bean，虽然我们引入了 jsr310 和 jdk8-datatype 依赖，但是他俩并没注入到容器中，所以可以这样做：

```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnClass(ObjectMapper.class)
@AutoConfigureBefore(JacksonAutoConfiguration.class)
public class JacksonConfiguration {
    
    private static final String NORMAL_DATE_FORMATTER = "yyyy-MM-dd HH:mm:ss";
    
    @Bean
    @ConditionalOnClass(JavaTimeModule.class)
    @ConditionalOnMissingBean
    public JavaTimeModule javaTimeModule() {
        return new JavaTimeModule();
    }

    @Bean
    @ConditionalOnClass(Jdk8Module.class)
    @ConditionalOnMissingBean
    public Jdk8Module jdk8Module() {
        return new Jdk8Module();
    }
    
    @Bean
    Jackson2ObjectMapperBuilderCustomizer jacksonCustomizer() {
        return new JacksonCustomizer();
    }
    
    static class JacksonCustomizer implements Jackson2ObjectMapperBuilderCustomizer {
        @Override
        public void customize(Jackson2ObjectMapperBuilder jacksonObjectMapperBuilder) {
            jacksonObjectMapperBuilder.serializers(new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(NORMAL_DATE_FORMATTER)));
            jacksonObjectMapperBuilder.deserializers(new LocalDateTimeDeserializer(DateTimeFormatter.ofPattern(NORMAL_DATE_FORMATTER)));
        }
    }
}
```

注意该类在 `JacksonAutoConfiguration` 之前装配，因为后者会自动查询 Module 进行注册，我们要在其之前注入自己的 Module，另外提供了一个 Customizer 用于解决 jsr310 中默认以 ISO 作为格式化器不符合我们日常使用的时间字符串格式的问题（此处只针对 LocalDateTime 类型做处理）。