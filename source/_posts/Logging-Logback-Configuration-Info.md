---
title: Logging Logback Configuration Info
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/banner/6.jpg'
coverImg: /medias/banner/6.jpg
toc: true
date: 2021-09-25 17:29:08
top: false
cover: false
summary: 记录 Logback 的配置文件相关信息
categories: Logging
keywords: [Logging, Logback]
tags: Logging
---



## 一、Example

### 1、引入依赖

```xml
<!-- Log Facade: slf4j -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.7.32</version>
</dependency>

<!-- Log framework: logback module -->
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.2.3</version>
</dependency>
```



### 2、编写配置文件

<mark style="font-weight:bold;color:red;">推荐先看看后面的注意点中的配置文件命名</mark>

常规的配置文件：logback-text.xml 或者 logback.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!-- scan="true"    当此属性设置为true时，配置文件如果发生改变，将会被重新加载，默认值为true。 -->
<!-- scanPeriod="30 seconds"   设置每30秒自动扫描,若没有指定具体单位则以milliseconds为标准(单位:milliseconds, seconds, minutes or hours)  -->
<!-- debug="false"当此属性设置为true时，将打印出logback内部日志信息，实时查看logback运行状态。默认值为false。-->
<configuration scan="true" scanPeriod="30 seconds">
    <!-- 上下文名称  -->
    <contextName>logback</contextName>

    <!-- 存放日志文件路径 -->
    <property name="Log_Home" value="./logs"/>

    <!-- INFO级别 -->
    <appender name="FILE_INFO" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <File>${Log_Home}/info.log</File>
        <!-- 根据时间来制定滚动策略 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <FileNamePattern>
                ${Log_Home}/info.%d{yyyy-MM-dd}.%i.log.gz
            </FileNamePattern>
            <!-- 多久后自动清除旧的日志文件,单位:月 -->
            <MaxHistory>12</MaxHistory>
            <TimeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <!-- 默认值是 10MB,文档最大值 -->
                <MaxFileSize>100MB</MaxFileSize>
            </TimeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>

        <encoder>
            <Pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{50} - %msg%n</Pattern>
        </encoder>
    </appender>

    <!-- ch.qos.logback.core.ConsoleAppender 控制台输出 -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <!--格式化输出：%d表示日期，%thread表示线程名，%-5level：级别从左显示5个字符宽度%msg：日志消息，%n是换行符 -->
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{50} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 当前日志总级别为TRACE、DEBUG、INFO、 WARN、ERROR、ALL和 OF -->
    <!-- the level of the root level is set to DEBUG by default.  -->
    <root level="ERROR">
        <appender-ref ref="STDOUT"/>
        <appender-ref ref="FILE_INFO"/>
    </root>
</configuration>
```

说明：

```
根节点<configuration>
scan: 当此属性设置为true时，配置文件如果发生改变，将会被重新加载。默认值为true。
scanPeriod: 设置监测配置文件是否有修改的时间间隔，如果没有给出时间单位，默认单位是毫秒。当scan为true时，此属性生效。默认的时间间隔为1分钟。
debug: 当此属性设置为true时，将打印出logback内部日志信息，实时查看logback运行状态。默认值为false。
 
<contextName>: 每个logger都关联到logger上下文，默认上下文名称为“default”。但可以使用设置成其他名字，用于区分不同应用程序的记录。一旦设置，不能修改,可以通过%contextName来引用日志上下文名称
<property>: 用来定义变量值的标签,通过定义的值会被插入到logger上下文中。定义变量后，可以使 ${} 来使用变量。
<appender>: 用来格式化日志输出节点，
 
有两个属性 name 和 class，class 用来指定哪种输出策略，常用就是：
控制台输出策略(class = ch.qos.logback.core.ConsoleAppender)
<layout>
class = ch.qos.logback.classic.PatternLayout: 控制台日志输出模式
<pattern>: 设置日志记录行格式
 
文件输出策略(class = ch.qos.logback.core.rolling.RollingFileAppender)
常见的日志输出到文件，随着应用的运行时间越来越长，日志也会增长的越来越多，将他们输出到同一个文件并非一个好办法，ch.qos.logback.core.rolling.RollingFileAppender 用于切分文件日志
<filter>
class = ch.qos.logback.classic.filter.LevelFilter: 匹配过滤，对匹配到的日志执行匹配策略
<level>: 匹配级别
<onMatch>: 匹配到的执行策略
<onMisMatch>: 不匹配的执行策略
class = ch.qos.logback.classic.filter.ThresholdFilter: 门槛过滤，只记录级别以上的日志
<level>: 匹配级别
 
<encoder>
<pattern>: 设置日志记录行格式
 
<rollingPolicy>
class = ch.qos.logback.core.rolling.TimeBasedRollingPolicy: 根据时间来分割日志文件，每天生成一个，这样可能每天的日志文件的大小不固定
class = ch.qos.logback.core.rolling.SizeBasedTriggeringPolicy: 根据文件大小来分割，每达到maxFileSize就分割出来一个文件
class = ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy: 同时按照每天和大小来分割日志文件, 这种方式pattern中必须包含 %d 和%i。
<fileNamePattern>: 定义分隔的日志文件的名称规则
<maxHistory>: 表示只保留最近N天的日志，以防止日志填满整个磁盘空间
<totalSizeCap>: 指定日志文件的上限大小，例如设置为1GB的话，那么到了这个值，就会删除旧的日志
 
<root>: 用来指定最基础的日志输出级别，可以包含零个或多个 <appender-ref>，标识这个appender将会添加到这个logger。
level: 用来设置打印级别，大小写无关：TRACE， DEBUG， INFO， WARN，ERROR， ALL 和 OFF
<appender-ref>
ref: 指向 <appender> 的 name 属性
 
<logger>: 用来设置某一个包或者具体的某一个类的日志打印级别，以及指定appender
name: 用来指定受此logger约束的某一个包或者具体的某一个类。
level: 用来设置打印级别，大小写无关：TRACE， DEBUG， INFO， WARN，ERROR， ALL 和 OFF，如果未设置此属性，那么当前logger将会继承上级的级别，所谓向上级传递就是是否使用root的配置
addtivity: 是否向上级logger传递打印信息。默认是true
 
<appender-ref>
ref: 指向 <appender> 的 name 属性
```

### 3、编写测试代码

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
 
public class ApplicationMain {
 
    static Logger log = LoggerFactory.getLogger(ApplicationMain.class);
 
    public static void main(String[] args) {
        log.info("hello world.");
    }
}
```



## 二、Attention

### 1、Java 多环境日志

概述：项目基于 SpringBoot，要实现日志的多环境配置，比如：test、dev、prod，这个时候需要把 logback 配置文件的名称改为 `logback-spring.xml`，否则无法使用基于 `spring.profiles.active=dev` 等方式来配置环境。

原因：

> SpringBoot 集成 Logback 日志配置文件加载顺序

SpringBoot 加载日志配置文件有两种，一种是加载 logback 自身的配置文件，另一种是加载具有 spring 特性的 logback 配置文件：

- 首先尝试在 classpath 下查找 logback 自身的配置文件:
  - 先找 `logback-text.groovy`
  - 如果文件不存在，则查找文件 `logback-text.xml`
  - 如果文件不存在，则查找文件 `logback.groovy`
  - 如果文件不存在，则查找文件 `logback.xml`
- 如果上述文件都不存在，则加载 SpringBoot 自身具有 Spring 特性的 logback 配置文件，加载顺序和 logback 自身配置文件一致，只不过在配置文件的命名规范中加了一条：**末尾加上** `-spring`



### 2、logback-spring.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration  scan="true" scanPeriod="10 seconds">
    <!-- 日志级别从低到高分为TRACE < DEBUG < INFO < WARN < ERROR < FATAL，如果设置为WARN，则低于WARN的信息都不会输出 -->
    <!-- scan:当此属性设置为true时，配置文件如果发生改变，将会被重新加载，默认值为true -->
    <!-- scanPeriod:设置监测配置文件是否有修改的时间间隔，如果没有给出时间单位，默认单位是毫秒。当scan为true时，此属性生效。默认的时间间隔为1分钟。 -->
    <!-- debug:当此属性设置为true时，将打印出logback内部日志信息，实时查看logback运行状态。默认值为false。 -->

    <contextName>logback</contextName>
    <!-- name的值是变量的名称，value的值时变量定义的值。通过定义的值会被插入到logger上下文中。定义变量后，可以使“${}”来使用变量。 -->
    <property name="log.path" value="E:\\IDEA workspace\\OpenSouorceProject\\guli_parent\\guli_log\\edu" />

    <!-- 彩色日志 -->
    <!-- 配置格式变量：CONSOLE_LOG_PATTERN 彩色日志格式 -->
    <!-- magenta:洋红 -->
    <!-- boldMagenta:粗红-->
    <!-- cyan:青色 -->
    <!-- white:白色 -->
    <!-- magenta:洋红 -->
    <property name="CONSOLE_LOG_PATTERN"
              value="%yellow(%date{yyyy-MM-dd HH:mm:ss}) |%highlight(%-5level) |%blue(%thread) |%blue(%file:%line) |%green(%logger) |%cyan(%msg%n)"/>


    <!--输出到控制台-->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <!--此日志appender是为开发使用，只配置最低级别，控制台输出的日志级别是大于或等于此级别的日志信息-->
        <!-- 例如：如果此处配置了INFO级别，则后面其他位置即使配置了DEBUG级别的日志，也不会被输出 -->
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>INFO</level>
        </filter>
        <encoder>
            <Pattern>${CONSOLE_LOG_PATTERN}</Pattern>
            <!-- 设置字符集 -->
            <charset>UTF-8</charset>
        </encoder>
    </appender>


    <!--输出到文件-->

    <!-- 时间滚动输出 level为 INFO 日志 -->
    <appender name="INFO_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>${log.path}/log_info.log</file>
        <!--日志文件输出格式-->
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- 每天日志归档路径以及格式 -->
            <fileNamePattern>${log.path}/info/log-info-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文件保留天数-->
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <!-- 此日志文件只记录info级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>INFO</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <!-- 时间滚动输出 level为 WARN 日志 -->
    <appender name="WARN_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>${log.path}/log_warn.log</file>
        <!--日志文件输出格式-->
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset> <!-- 此处设置字符集 -->
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${log.path}/warn/log-warn-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文件保留天数-->
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <!-- 此日志文件只记录warn级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>warn</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>


    <!-- 时间滚动输出 level为 ERROR 日志 -->
    <appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>${log.path}/log_error.log</file>
        <!--日志文件输出格式-->
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset> <!-- 此处设置字符集 -->
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${log.path}/error/log-error-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文件保留天数-->
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <!-- 此日志文件只记录ERROR级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>ERROR</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <!--
        <logger>用来设置某一个包或者具体的某一个类的日志打印级别、以及指定<appender>。
        <logger>仅有一个name属性，
        一个可选的level和一个可选的addtivity属性。
        name:用来指定受此logger约束的某一个包或者具体的某一个类。
        level:用来设置打印级别，大小写无关：TRACE, DEBUG, INFO, WARN, ERROR, ALL 和 OFF，
              如果未设置此属性，那么当前logger将会继承上级的级别。
    -->
    <!--
        使用mybatis的时候，sql语句是debug下才会打印，而这里我们只配置了info，所以想要查看sql语句的话，有以下两种操作：
        第一种把<root level="INFO">改成<root level="DEBUG">这样就会打印sql，不过这样日志那边会出现很多其他消息
        第二种就是单独给mapper下目录配置DEBUG模式，代码如下，这样配置sql语句会打印，其他还是正常DEBUG级别：
     -->
    <!--开发环境:打印控制台-->
    <springProfile name="dev">
        <!--可以输出项目中的debug日志，包括mybatis的sql日志-->
        <logger name="这里填项目的groupId：com.xxx" level="INFO" />

        <!--
            root节点是必选节点，用来指定最基础的日志输出级别，只有一个level属性
            level:用来设置打印级别，大小写无关：TRACE, DEBUG, INFO, WARN, ERROR, ALL 和 OFF，默认是DEBUG
            可以包含零个或多个appender元素。
        -->
        <root level="INFO">
            <appender-ref ref="CONSOLE" />
            <appender-ref ref="INFO_FILE" />
            <appender-ref ref="WARN_FILE" />
            <appender-ref ref="ERROR_FILE" />
        </root>
    </springProfile>


    <!--生产环境:输出到文件-->
    <springProfile name="pro">

        <root level="INFO">
            <appender-ref ref="CONSOLE" />
            <appender-ref ref="DEBUG_FILE" />
            <appender-ref ref="INFO_FILE" />
            <appender-ref ref="ERROR_FILE" />
            <appender-ref ref="WARN_FILE" />
        </root>
    </springProfile>

</configuration>
```

