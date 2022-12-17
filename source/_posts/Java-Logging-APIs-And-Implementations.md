---
title: Java Logging APIs And Implementations
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425110534.jpg'
coverImg: /img/20220425110534.jpg
cover: false
toc: true
mathjax: false
date: 2022-10-30 23:24:38
summary: "Java 日志框架的发展和使用"
categories: Logging
keywords: [java, Logging]
tags: 
 - Java
 - Logging
---

# 一、前言

本文旨在了解 Java 日志框架的发展历史，以及日志框架中一些通用的概念。

参考：

- https://stackify.com/compare-java-logging-frameworks/
- https://www.baeldung.com/java-logging-intro
- https://www.alibabacloud.com/blog/java-logging-frameworks-summary-and-best-practices_598223
- https://logback.qos.ch/manual/index.html

在应用系统中，一个好的日志处理方案是开发者分析程序运行时行为的好帮手，日志系统记录并持久化重要的信息，这样我们便可以更容易的分析它们，而日志系统主要涉及三个方面：

- 在程序运行时，可以打印出我们需要的信息；
- 输出日志信息效率较高，不会对程序性能造成太大的影响；
- 在不同的部署环境中，可以对日志信息进行调整；

使用这些日志框架仅需要三个步骤：

（1）导入依赖；

（2）配置信息；

（3）编写日志输出语句；

# 二、Java 日志框架发展简史

在 Java 日志框架里，Log4j 是最早被广泛使用的，而现在比较流行的是 SLF4J（Simple Logging Facade for Java）结合 Logback。

在一个应用程序中，不仅仅包含开发者自行封装的二方库，还引入了一些第三方包，它们也有自带的日志体系，当一个应用程序中存在多套日志框架，这个时候输出的日志信息就会变得很复杂，不利于开发者分析。

下面简单的看一下 Java 日志体系的发展；

## Common Java Logging Tools

### JUL

- 参考文章（写的不错）：https://www.digitalocean.com/community/tutorials/logger-in-java-logging-example
- JAVA 8 API 文档：https://docs.oracle.com/javase/8/docs/api/index.html

`java.util.logging(JUL)` 是 JDK 从 1.4 开始提供的一个日志工具包，可惜的是，由于 Log4j 的出现，JUL 并没有被广泛使用，事实上，JUL 在某些测试代码上的表现要比 Log4j 更加好，和 Log4j、Logback 类似，JUL 也有自己的日志实现逻辑，而 JCL 和 SLF4J 是没有的。

```java
import java.util.logging.Logger;

public class JULoggingTest {
    
    private static final Logger LOGGER = Logger.getLogger(JULoggingTest.class.getName());

    public static void main(String[] args) {
        showLog();
    }
    
    public static void showLog() {
        LOGGER.info("hello jul...");
    }
}
```

（1）概念：Loggers

`Loggers` （日志记录器）拥有全局唯一的名称，通常类似这种 `io.naivekyo.JULoggingTest` 以句号分隔的层级命名空间，而且往往包含包名和类名，只能是字符串。

JUL 的默认配置文件在 `jre/lib/logging.properties` 文件中，默认的日志记录级别是 INFO。

```proper
############################################################
#  	Default Logging Configuration File
#
# You can use a different file by specifying a filename
# with the java.util.logging.config.file system property.  
# For example java -Djava.util.logging.config.file=myfile
############################################################

############################################################
#  	Global properties
############################################################

# "handlers" specifies a comma separated list of log Handler 
# classes.  These handlers will be installed during VM startup.
# Note that these classes must be on the system classpath.
# By default we only configure a ConsoleHandler, which will only
# show messages at the INFO and above levels.
handlers= java.util.logging.ConsoleHandler

# To also add the FileHandler, use the following line instead.
#handlers= java.util.logging.FileHandler, java.util.logging.ConsoleHandler

# Default global logging level.
# This specifies which kinds of events are logged across
# all loggers.  For any given facility this global level
# can be overriden by a facility specific level
# Note that the ConsoleHandler also has a separate level
# setting to limit messages printed to the console.
.level= INFO

############################################################
# Handler specific properties.
# Describes specific configuration info for Handlers.
############################################################

# default file output is in user's home directory.
java.util.logging.FileHandler.pattern = %h/java%u.log
java.util.logging.FileHandler.limit = 50000
java.util.logging.FileHandler.count = 1
java.util.logging.FileHandler.formatter = java.util.logging.XMLFormatter

# Limit the message that are printed on the console to INFO and above.
java.util.logging.ConsoleHandler.level = INFO
java.util.logging.ConsoleHandler.formatter = java.util.logging.SimpleFormatter

# Example to customize the SimpleFormatter output format 
# to print one-line log message like this:
#     <level>: <log message> [<date/time>]
#
# java.util.logging.SimpleFormatter.format=%4$s: %5$s [%1$tc]%n

############################################################
# Facility specific properties.
# Provides extra control for each logger.
############################################################

# For example, set the com.xyz.foo logger to only log SEVERE
# messages:
com.xyz.foo.level = SEVERE
```

该文件中也说得很清楚，如果想要覆盖默认的配置，只需要提供一个配置文件，然后启动项目的时候添加参数：`java -Djava.util.logging.config.file=MyCustomConfigurationFile`，填上文件的地址就可以了。

- JUL 的日志级别从高到低为：SEVERE、WARNING、INFO、CONFIG、FINE、FINER 和 FINEST，只要设置为某个等级，就会输出 >= 该级别的日志信息；

- 还有两个全局的日志级别，OFF 表示关闭所有日志输出，ALL 表示记录所有日志信息（不区分严重等级）

在 `logging.properties` 配置文件中，默认的日志级别可以通过 `.level=ALL` 也可以通过层级命名空间配置。Loggers 基于日志记录器名称前缀在配置文件中匹配到属于自己的规则，匹配度最高的规则优先被当前 logger 使用，注意日志级别必须是全大写英文字母。

（2）概念：Handlers

JUL 通过 Handlers 来生成日志。开发者可以通过配置文件配置一个或者多个 Handlers（多个用逗号分隔）。每个 handler 有对应的日志级别，并且只会生成指定级别及更高级的日志信息。Handlers 也可以和 formatters 绑定。比如说，JUL 默认提供的 ConsoleHanler 使用的是 String.format。

下面看一个简单的例子：

```properties
handlers= java.util.logging.ConsoleHandler

.level= ALL
com.suian.logger.jul.xxx.level = CONFIG
com.suian.logger.jul.xxx.demo2.level = FINE
com.suian.logger.jul.xxx.demo3.level = FINER

java.util.logging.ConsoleHandler.level = ALL
java.util.logging.ConsoleHandler.formatter = java.util.logging.SimpleFormatter
java.util.logging.SimpleFormatter.format=%1$tF %1$tT [%4$s] %3$s -  %5$s %n
```

> 总结及扩展

（1）Java Logger

`java.util.logging.Logger` 提供  logging API 用于记录日志信息；

（2）Java Logging Levels

`java.util.logging.Level` 定义日志的不同级别；

SEVERE（highest） > WARNING > INFO > CONFIG > FINE > FINER > FINEST

（3）Java Logging Handlers

用于生成日志的处理器，我们可以向 Java Logger 中添加多个 Handler，每个 Handler 都可以处理符合它们规则的日志信息，JUL 默认提供两个 Handler：

- ConsoleHandler：将日志信息输出到控制台；
- FileHandler：将日志信息按照 XML 格式输出到文件；

此外还可以自定义 Handler，只需继承 `java.util.logging.Handler` 抽象类或者其子类，然后根据需求自定义即可。

（4）Java Logging Formatters

用于格式化日志信息。JUL 提供了两种格式化器：

- SimpleFormatter：按照特定格式输出字符串信息；
- XMLFormatter：将日志信息格式化为 XML 格式；

我们也可以定制格式化器，只需实现 `java.util.logging.Formatter` 抽象类，并将自制的格式化器绑定到 Handler 即可；

（5）Java Log Manager

`java.util.logging.LogManager` 用于读取日志配置信息、创建并维护 Logger 实例，这个类还是很重要的，是 JUL 的核心；



### JCL

参考文档：

- 官方文档：https://commons.apache.org/proper/commons-logging/

补充：JCL 目前已经不再维护了，并且存在漏洞，谨慎使用。

Apache Commons Logging（JCL），是早期 Apache 提供的一个公共日志 API 库，之前叫做 Jakarta Commons Logging，使用 JCL 可以让我们的应用程序不在依赖特定的日志实现，这是因为 JCL 已经对其他日志工具进行了打包，包括：Log4j、Avalon LogKit、JUL 等等，在程序运行时，JCL 可以自动适配对应的日志实现框架生成日志信息。

JCL 和 SLF4J 的不同之处在于，JCL 在程序运行时通过动态服务发现机制找到程序使用的日志框架实现，而 SLF4J 则是在编译期静态绑定指定的日志实现库。

下面展示了 JCL 中包装的其他日志实现库：

- `org.apache.commons.logging.impl.Jdk14Logger`：适配 JDK 1.4 日志实现（JUL）；
- `org.apache.commons.logging.impl.Log4JLogger`：适配 Log4j；
- `org.apache.commons.logging.impl.LogKitLogger`：适配 Avalon LogKit；
- `org.apache.commons.logging.impl.SimpleLog`：JCL 的简单日志实现，将日志信息输出到 `System.err`；
- `org.apache.commons.logging.impl.NoOpLog`：JCL 的日志实现，不做任何日志输出；

如果只引入了 JCL 的依赖，没有在配置文件 `commons-logging.properties` 中指出使用哪个适配器，同时在 `LogFactory ` 的默认实现类中通过系统属性或者 SPI 都没有发现用户指定的日志实现，这个时候就会使用 JUL 去输出日志。

补充一下：

- `org.apache.commons.logging.LogFactory` 及其实现 LogFactoryImpl 很重要，主要用于加载配置和创建 Log 实例，在创建 Log 实例时动态加载相应的日志实现框架的 Log 实例；
- 如果仅仅引入 JCL 依赖，没有指定特定的日志实现及引入相应依赖，则默认使用 JUL 生成日志；

测试：

```java
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class JCLTest {

    private static final Log log = LogFactory.getLog(JCLTest.class);
    
    public static void main(String[] args) {
        // 测试 JCL 使用 JUL 打印日志
        log.info("test jcl ...");
    }
}
```

更多信息请参考官方文档。



### Avalon LogKit

参考：

- 官方文档：https://archive.apache.org/dist/avalon/logkit/v1.2/
- Avalon 系列已经不再维护；

Avalon LogKit 是一个速度很快的日志工具集，主要在 Avalon 系列的组件中使用，包括：Framework、Excalibur、Cornerstone，and Phoenix。它和 JDK 1.4 日志包采用类似的模型，但是，它兼容 JDK 1.2 以及之后的版本。LogKit 是基于上下文和日志对象的。

如果使用的是 Log4j，那么日志内容只能通过一条语句输出，但是在 LogKit 中，我们可以记录更多的内容，甚至将其输出到特定的数据库字段上，而在 Log4j 中，如果我们想把日志输出到多种存储载体上，比如数据库，就需要使用 `Appenders`，LogKit 默认就支持多种存储格式。

### Log4j

参考：

- 维基百科：https://en.wikipedia.org/wiki/Log4j
- 官方文档：https://logging.apache.org/log4j/1.2/
- 说明：Log4j 已 EOF（End of Life），现在被 Log4j 2 替代；

Log4j 是 Apache 的一个开源项目，使用 Log4j 我们可以控制日志输出的目的地，比如 conle、file 或者 database，也可以控制每条日志的输出格式和等级。

Log4j 中定义了 7 中日志等级：严重程度从低到高依次是，TRACE、DEBUG、INFO、WARN、ERROR、FATAL ，and OFF ，如果将日志等级设置为 OFF，就表示禁用日志功能，Log4j 的配置文件支持 properties 和 xml 两种格式。

它由三部分组成：

- Logger
- Appender
- Layout

### SLF4J

参考：

- 官方文档：https://www.slf4j.org

SLF4J 并不是特定的日志解决方案，它通过 facade pattern（门面模式）提供一个统一的 Java 日志 API，有点类似 JCL。SLF4J 的出现最早是为了取代 JCL。

SLF4J 提供的一套核心 API 是一些接口和 LoggerFactory 类。通过 SLF4J，我们不需要在代码中或者配置文件中声明要使用的日志实现框架，只需要引入相关依赖然后在程序编译期间，SLF4J 就可以自动绑定对应的日志实现。 

当我们要使用特定的日志实现库来结合 SLF4J 时，只需引入正确的和 SLF4J 相关的 Jar 包集合（包括各种桥接库）就可以了。SLF4J 提供统一的日志 API，开发者只需通过特定方法来输出日志信息，日志的格式、等级和输出方法可以在特定日志实现库的配置文件中定义，这样开发者就可以灵活切换项目使用的日志系统。

Logback 日志库天然就实现了 slf4j-api ，SLF4J 结合 Logback 无需任何桥接库。当然如果要使用其他日志库，SLF4J 也封装了一系列的的 bridge packages。比如说，slf4j-log4j12 允许我们使用 Log4j 输出日志，slf4j-jdk14 可以使用 JUL 进行日志输出。

### Logback

参考：

- 官方文档：https://logback.qos.ch

Logback 是一个可信赖的、通用的、快速并且灵活的一个 Java 日志实现框架。它由三个模块构成：

（1）logback-core：其他两个模块的基础；

（2）logback-classic：基于 SLF4J API 的增强版本的 Log4j；

（3）logback-access：集成了 Servlet 容器以便于输出 HTTP-access 日志。

Logback 依赖于名为 logback.xml 的配置文件，并且支持 groovy 格式。

和 Log4j 相比，Logback 有很多优点，可以参考官网文档或者网上一些介绍的文章。

### Log4j 2

参考：

- 官方文档：https://logging.apache.org/log4j/2.x

Log4j 2 是 Logback 和 Log4j 1.x 的增强版本。它使用了一些新的技术，比如 lock-free 和 asynchronous，和 Log4j 1.x 相比，日志吞吐量和性能提升了 10 倍，同时也解决了一些死锁 bug，让配置变得更加简单灵活。

主要分为两个模块：

（1）log4j-api：提供日志 API；

（2）log4j-core：提供具体的日志实现；

Log4j 2 提供了一种可拔插的架构，可以让开发者更加灵活的制定或扩展 appenders、loggers 和 filters。要提一点 Log4j 2 修改配置后不会丢失以前的日志文件，这也是和其他日志框架不一样的地方。

下面展示了 Log4j 2 的架构：

图片地址：https://yqintl.alicdn.com/97a6da07af7069bbce57944270a5a8b87ab29986.png

![](https://yqintl.alicdn.com/97a6da07af7069bbce57944270a5a8b87ab29986.png) 

# 三、示例代码

JUL 和 JCL 前面已经有例子了，下面看看其他的日志组合。

## JCL & Log4j

需要引入 Apache Commons Logging 和 Log4j 包，依赖如下：

```xml
<!-- apache commons logging -->
<dependency>
    <groupId>commons-logging</groupId>
    <artifactId>commons-logging</artifactId>
    <version>1.2</version>
</dependency>

<!-- log4j 1.x -->
<dependency>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
    <version>1.2.17</version>
</dependency>
```

在该环境下，我们可以使用两种日志 API：

- `org.apache.commons.logging.Log`；
- `org.apache.log4j.Logger`；

推荐使用第一种，尽管两种方式使用的其实都是 Log4j 做日志输出，但是第一种更能体现我们使用的环境是 JCL + Log4j，如果使用第二种其实就代表仅仅使用 Log4j，无需 JCL 了；

配置文件：`log4j.properties`

```properties
# 全局 logger 日志级别配置
# log4j.rootLogger = error,console 

# 针对特定 logger 配置日志级别
log4j.logger.io.naivekyo.JCL_Log4jTest = trace,console

# Export to the console.
log4j.appender.console = org.apache.log4j.ConsoleAppender
log4j.appender.console.Target = System.out
log4j.appender.console.layout = org.apache.log4j.PatternLayout
log4j.appender.console.layout.ConversionPattern = %d{yyyy-MM-dd HH:mm:ss,SSS} [%t] %-5p %c - [log4j]%m%n
```

测试类：

```java
package io.naivekyo;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

public class JCL_Log4jTest {

    // API in the commons-logging package
    private static final Log log = LogFactory.getLog(JCL_Log4jTest.class);
    
    //private static final Logger logger = LogManager.getLogger(JCL_Log4jTest.class);
    
    public static void main(String[] args) {
        // 测试使用 JCL 日志 API 及其实现库 Log4j
        log.info("hello jcl and log4j...");
    }
}
```

在过去很长一段时间里，使用 Log4j 做日志系统是很流行的，但是随着诸多新日志框架的出现以及 Log4j 本身存在的一些问题，现在的项目往往都不会使用 Log4j 了，更多关于 Log4j 的信息可以参见网络上的文章以及官方文档。

## Log4j 2

Log4j 2 其实可以认为是 Logback 和 Slf4J 的结合体。log4j-api 就相当于 SLF4J，log4j-core 就相当于 Logback；

依赖：

```xml
<!-- log4j 2 api -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.19.0</version>
</dependency>

<!-- log4j 2 impl -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-api</artifactId>
    <version>2.19.0</version>
</dependency>
```

Log4j 2 支持的配置文件格式有：XML、JSON、YAML、properties，也可以在代码中通过创建 `org.apache.logging.log4j.core.config.ConfigurationFactory` 及 `org.apache.logging.log4j.core.config.Configuration` 实例来配置日志。

更多关于配置的信息可以参考官方文档：https://logging.apache.org/log4j/2.x/manual/configuration.html

补充一下 Log4j 2 的日志级别（和 Log4j 一样）：FATAL > ERROR > WARN >  INFO > DEBUG > TRACE

引入依赖后创建配置文件（关于配置文件的命名规则和加载顺序官方也有说明，下面仅以比较简单的方式演示）：

文件名：log4j2.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </Console>
    </Appenders>
    <Loggers>
        <Root level="INFO">
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>
</Configuration>
```

这里简单提一下，Configuration 标签的 status 属性表示 log4j 2 内部运行日志的输出级别，下面的配置则是程序中的 Loggers 要使用的日志级别，这里的 Appenders 表示日志输出的目的地，打印到控制台即可，Loggers 标签管理所有 Logger 实例的相关配置，此处我们使用 Root 标签设置所有的 Logger 的日志输出级别为 INFO，输出目的地为控制台。

```java
package io.naivekyo;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Log4j2Test {

    private static final Logger log = LogManager.getLogger(Log4j2Test.class);
    
    public static void main(String[] args) {
        log.info("test log4j2 log output...");
    }
}
```



## 冲突处理

理论上来说，Log4j、Log4j 2、Logback 的日志输出方法是可以同时共存的，毕竟项目中使用的日志库或者第三方依赖的日志库可能都不太一样，这个时候我们就必须维护多个配置文件，且需要明白各个组件使用的日志框架及其依赖的配置信息。

为了提出一个通用的日志解决方案，我们必须采用特殊的方案来处理兼容性问题，当前，只有 SLF4J 和 Log4j 2 提供了集成的日志输出机制，而其他的日志框架不太好处理冲突。

下面这个列表展示了不同日志框架使用的 API：

- `java.util.logging.Logger`：JDK 使用的 JUL；
- `org.apache.commons.logging.Log`：apache 的 commons logging；
- `org.apache.log4j.Logger`：Log4j 使用的日志 API；
- `org.apache.logging.log4j.Logger`：由 Log4j 2 提供的位于 log4j-api 包中使用的日志 API；
- `org.slf4j.Logger`：由 SLF4J 提供的位于 slf4j-api 包中使用的日志 API。

上述日志 API 可能同时存在于同一个应用中，有时候，即便我们能够确保项目中使用的都是统一的日志 API，但是项目依赖的第三方库中使用的也可能不一样。

正如前面所说的，SFL4J 和 Log4j 2 能够处理冲突问题，通过它们提供的一系列 binders 和 bridges：

（1）Binders 也就是适配器类或者包装器类，它们将特定日志框架生成的日志绑定到日志实现库从而实现日志的输出。比如说，JCL 就可以将 Log4j 或者 JUL 生成的日志信息绑定到 JCL 的日志实现库上；SLF4J 可以将 Logback、Log4j、Log4j 2、JUL 生成的日志绑定到自己的日志实现库中；

（2）Bridges 其实是伪造了日志实现工具；比如说，我们在类路径下引入了 `jcl-over-slf4j.jar`，此时 JCL 绑定的日志输出组件输出的日志将会被重定向到 SLF4J。SLF4J 根据绑定器将日志提供给具体的日志实现工具。

## SLF4J 集成的日志输出组件

参考：

- 官方文档：https://www.slf4j.org/legacy.html

### JUL 桥接器

依赖：

```xml
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>jul-to-slf4j</artifactId>
    <version>2.0.3</version>
</dependency>
```

这个包主要用途的将 JUL 生成的日志交给 SLF4J，然后 SLF4J 再实现统一输出格式。

如果仅仅是导入该依赖，是无法对 JUL 生成的日志信息进行再次包装的，因为它只提供一个 JUL handler（这个 jar 包里面只有一个类 SLF4JBridgeHandler），我们还需要对 JUL 进行配置，将 JUL 定义的日志级别通过 handler 转换为 SLF4J 同等的日志级别，此时 JUL 还是依赖于它自身的配置文件，只不过需要添加一个 handlers 配置，将它和 SLF4J 绑定的日志输出工具联系起来。

创建 JUL 配置文件：logger.properties

```properties
handlers= org.slf4j.bridge.SLF4JBridgeHandler
.level= ALL
```

项目启动时通过 JVM 参数：`Djava.util.logging.config.file=/path/logger.properties` 将配置信息注入程序中，也可以在方法中配置，比如说程序使用某个主方法启动或者容器的扩展监听方法中。但是在方法中配置有个缺陷，它不适用某些场景，比如代理 tomcat 的日志输出。

### JCL 桥接器

引入依赖：

```xml
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>jcl-over-slf4j</artifactId>
    <version>2.0.3</version>
</dependency>
```

如果要将 JCL 输出的日志交给 SLF4J 去做统一处理，就需要引入上述依赖。

项目中使用的是 apache commons logging，它拥有自己的 Log 和 LogFactory

，为了桥接 JCL 的日志，commons-logging 包将会被重写，Log 仍旧使用 commons-logging 下的，但是 LogFactory 类的实现使用 `org.apache.commons.logging.impl.SLF4JLogFactory`，而这个类就是 jcl-over-slf4j 提供的。

通常 JCL 使用的默认日志工厂是 LogFactoryImpl，当我们使用了 jcl-over-slf4j 时，可以无缝衔接并且无需像 JUL 那样引入额外的配置文件，但是此时却会发生依赖冲突，意味着 apache-commons-logging 包无法和 jcl-over-slf4j 同时存在。我们必须从类路径下移除 JCL 的依赖。

之前提到过 JCL 会在运行时动态搜索日志实现，可以在配置文件 commons-logging.properties 手动指定也可以自动适配，具体实现原理是通过提供适配器做的，比如 JCL 包下面的 `org.apache.commons.logging.impl.Log4JLogger` 类就是适配 Log4j 的，所以此处引入桥接器后，SLF4J 也会使用 JCL 自带的这种动态服务发现机制。

### 桥接器命名规则

Bridge 的命名是按照一定的规则来的：

- 如果是通过 overriding 方式桥接的话，就叫做：`xxx-over-slf4j`，此时会重写原有日志工具的相关类；
- 如果是单纯的桥接就叫做：`xxx-to-sfl4j`，此时会引入新的类；

### Log4j 桥接器

如果要将 Log4j 的日志交给 SLF4J 统一实现输出，则需要引入如下依赖：

```xml
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>log4j-over-slf4j</artifactId>
    <version>2.0.3</version>
</dependency>
```

从名字上就可以看出，这种桥接方式是通过重写 Log4j 中的某些类实现的，但是和前面类似，引入了依赖后就需要处理冲突，将原有的 Log4j 依赖移除。

### Log4j 2 桥接器

如果要将 Log4j 2 的日志交给 SLF4J 统一输出，就需要引入下面的依赖，比较有趣的是，SLF4J 并未提供 Log4j 2 的桥接器，反而是 Log4j 2 官方提供了。

```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-to-slf4j</artifactId>
    <version>2.19.0</version>
</dependency>
```

Log4j 2 提供了 log4j-api 和 log4j-core 两个模块，前者提供日志 api，后者提供前者具体实现，而 log4j-to-slf4j 也实现了 log4j-api

log4j-to-slf4j 用于将 Log4j 2 的输出日志桥接到 SLF4J，理论上将，log4j-core 和 log4j-to-slf4j 是不能共存的，因为它们都是 log4j-api 的实现。

但是经过实际测试，它俩是可以同时存在于类路径下，这是因为 Log4j 2 采用优先级方式加载日志 Provider，在 Provider 类中有个优先级属性，Log4j 2 的实现在构建自己的 Provider 时设置一个优先级值，通常 log4j-to-slf4j 的优先级要高于 log4j-core。

当然为了防止可能存在的某些问题，我们推荐引入了 log4j-to-slf4j 依赖了，要移除 log4j-core 依赖。

## Log4j 2 集成的日志输出组件

和 SLF4J 类似，Log4j 2 也是可以和以前的日志实现相适配的。

### JUL 适配器

参考：

- 官方文档：https://logging.apache.org/log4j/2.x/log4j-jul/index.html

为了将 JUL 输出的日志交给 Log4j 2 统一处理，我们需要引入下面的依赖：

```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-jul</artifactId>
    <version>2.19.0</version>
</dependency>
```

可以看出 Log4j 2 集成 JUL 的方式和 SLF4J 是不一样的。SLF4J 只是定义了一个 Handler，具体的配置还是依赖 JUL 自身，而 Log4j 2 则是直接重写了 `java.util.logging.LogManager`，然后使用系统属性 `java.util.logging.manager=org.apache.logging.log4j.jul.LogManager`，或者 JVM 参数：-`Djava.util.logging.manager=org.apache.logging.log4j.jul.LogManager`，或者在 LogMagger 或 Logger 实例化之前调用 `System.setProperty()` 方法进行设置。这比 SLF4J 提供的方法要简单一些。

提示：log4j-jul 和 log4j-core 是可选的依赖关系。（Optional）

### JCL 桥接器

Log4j 2 集成 apache commons logging 需要引入如下依赖：

```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-jcl</artifactId>
    <version>2.19.0</version>
</dependency>
```

使用这种 log4j-jcl 桥接方式还是非常简单的，只需引入桥接包，原有的 JCL 依赖无需额外处理，这看起来比 SLF4J 提供的重写形式的桥接要优雅一些。

具体原理如下：在 JCL LogFactory 实例化时找到其相关实现，具体处理流程如下：

（1）首先，基于 `org.apache.commons.logging.LogFactory` 的属性和方法 `getFactory()` 去查找 LogFactory 的实现类；

（2）如果没有找到 LogFactory 的实现类，就使用 SPI 方法从 `META-INF/services/org.apache.commons.logging.LogFactory` 文件中加载指定的服务实例，log4j-jcl 就是利用了这一点。但是也是有要求的，程序中自己使用的或者引入的第三方库必须只能包含一个名为 `org.apache.commons.logging.LogFactory` 的文件，如果存在多个，则第一个加载的优先使用，一旦出现冲突则很难处理；

（3）如果基于 SPI 服务发现仍然没有找到，系统就会从配置文件 commons-logging.properties 读取配置信息并且使用 LogFactory 中定义的属性创建相关实例；

（4）如果还是没有找到 LogFactory 的实现类，最总就会使用默认的 `org.apache.commons.logging.impl.LogFactoryImpl`。



### Log4j 1.x 桥接器

为了将 Log4j 1.x 版本的日志交给 2.x 处理，需要引入下列依赖：

```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-1.2-api</artifactId>
    <version>2.19.0</version>
</dependency>
```

这种桥接方式是重写了 log4j 1.x 的 api，和 SLF4J 的处理方式类似，此时会发生依赖冲突，需要移除原有的 Log4j 1.x 的所有相关依赖。

### SLF4J Binding

Log4J 2 要集成 SLF4J 的日志，就需要引入下列依赖：

```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j-impl</artifactId>
    <version>2.19.0</version>
</dependency>
```

log4j-slf4j-impl 基础 log4j 2 实现了 SLF4J 的 API，用于桥接 slf4j-api 和 log4j2-core。当然 log4j-slf4j-impl 和 log4j-to-slf4j 是不能同时存在的，否则的话日志请求事件将会在 SLF4J 和 Log4j 2 之间来回转发，谁都无法处理请求。

 

## 将 Logging API 和日志实现绑定

slf4j-api 还是 log4j2-api 都属于 API，都不提供具体的实现，理论上讲，通过这两个 API 生成的日志可以绑定到很多日志实现库上，SLF4J 和 Log4j 2 也提供了很多 binders，下面的列表展示了可能的几种组合方式：

- SLF4J -- Logback
- SLF4J -- slf4j-log4j12 -- Log4j
- SLF4J -- log4j-slf4j-impl -- Log4j 2
- SLF4J -- slf4j-jdk14 -- JUL
- SLF4J -- slf4j-jcl -- JCL
- JCL -- JUL
- JCL -- Log4j
- log4j2-api -- log4j2-core
- log4j2-api -- log4j-to-slf4j -- SLF4J



# 四、实践补充

## 1、项目业务处理方案

据统计项目中处理日志的代码量可以占到总代码数的 4%（OvO），可见日志处理的重要性。

经过前面日志相关知识的学习和扩展，笔者在项目中也做了一些尝试，借鉴了阿里的开发手册中关于[日志相关的知识](https://developer.aliyun.com/special/tech-java)，以及 Stackoverflow 上的一些问答，可以得出以下几个总结：

（1）对于传统的业务，比如常规单表处理，从 Controller 到 Service 最后到 DAO，这种业务处理流程中，一般在 Controller 层做参数校验，Service 结合 DAO 做具体的数据操作，需要结合异常和事务控制来保障数据一致性，抛出的异常则交给 ControllerAdvice，在此处返回用户操作结果以及日志记录；

（2）对于复杂的业务处理，比如涉及到上下游系统协同、多线程处理、RPC 调用，此时业务流水线将会很复杂，开发者要考虑的东西也会更多，特别是异常对业务的影响，编译期异常可以在 coding 期间解决，但是运行时异常就需要我们自己注意了，调用某些方法时一定要查看其方法声明上有没有可能抛出的异常，仔细考虑在某个环节是否要捕捉异常，记录有用的日志信息。如果某个环节出现了问题，它是否会影响后续的处理，如果整条业务流水线崩了，是否有补偿机制或者重试机制。



## 2、项目日志记录

编译期异常必须捕获，运行时异常则需要开发者结合业务判断是否需要捕获，捕获后是否需要打印日志，是吞下异常还是继续抛出，对于日志的打印我们期望打印出有用的信息以及调用堆栈，常见的日志 API 都会提供类似方法：

以 Log4j2 为例：

```java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class LogExceptionTest {

    private static final Logger log = LogManager.getLogger(LogExceptionTest.class);
    
    public static void main(String[] args) {
        // 测试日志输出异常信息    
        try {
            test1();
        } catch (Exception e) {
            // do something
            // 注意此处, 方法的最后一个参数是异常本身, 前面的参数都是通过 {} 占位符填充的信息
            log.error("异常: {}", e.getMessage(), e);
        }
    }
    
    private static void test1() {
        try {
            throw new IllegalArgumentException("非法参数");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

打印信息：

```
11:46:26.781 [main] ERROR io.naivekyo.LogExceptionTest - 异常: java.lang.IllegalArgumentException: 非法参数
java.lang.RuntimeException: java.lang.IllegalArgumentException: 非法参数
	at io.naivekyo.LogExceptionTest.test1(LogExceptionTest.java:30) ~[classes/:?]
	at io.naivekyo.LogExceptionTest.main(LogExceptionTest.java:20) ~[classes/:?]
Caused by: java.lang.IllegalArgumentException: 非法参数
	at io.naivekyo.LogExceptionTest.test1(LogExceptionTest.java:28) ~[classes/:?]
	... 1 more
```

<font style='color:green'>要注意以下情况：</font>

当程序在某个地方大量抛出同种异常时，日志 API 无法打印出异常调用堆栈信息。

参考：

- https://stackoverflow.com/questions/2411487/nullpointerexception-in-java-with-no-stacktrace
- https://stackoverflow.com/questions/4659151/recurring-exception-without-a-stack-trace-how-to-reset

（注：Oracle 文档确实不好找到这一段描述，可能是版本太久远了，1.5 相关的信息没有搜到，还好上面第二篇文章中有人给了出处：）

- https://www.oracle.com/java/technologies/javase/release-notes-introduction.html#vm
- https://bugs.openjdk.org/browse/JDK-8046503
- https://bugs.java.com/bugdatabase/view_bug.do?bug_id=5098422

这是从 JDK 1.5 加入的特性，我们知道在发生异常时 JVM 会对线程做一次快照处理，记录异常调用堆栈（这也是相对耗费性能的一点），在 Server 模式下，当程序中某段代码运行时大量抛出同种异常，比如 NPE，此时 JIT 则会对其进行重新编译并进行优化，采用一种预先分配的异常信息并不做堆栈信息记录（至于 JVM 是如何知道异常抛出的地方，可能是它会记录这种堆栈信息或者异常抛出的代码地点）。

这种策略的初衷是好的，在 production 环境下能够优化性能，但是对于 debug 环境就不太友好了，到目前为止解决方法只有重启项目然后添加 JVM 高级启动参数：`-XX:-OmitStackTraceInFastThrow` 来关闭这个功能。

## 3、补充 JVM 启动参数

参考 Oracle 官方文档中关于 Java 8 JVM 启动参数的配置：https://docs.oracle.com/javase/8/docs/technotes/tools/windows/java.html#BGBCIEFC

简单描述一下，在 Java 中对于项目启动参数大致分为以下几类：

（1）[标准选项（Standard Optionas）](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/java.html#BABDJJFI)；

所有 JVM 实现都应该支持标准选项中的所有参数，因为这里面定义的都是一些常规的操作，比如 JRE 版本的检查，设置 class path、开启详细的输出等等；

（2）[非标准选项（No-Standard Options）](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/java.html#BABHDABI)；

非标准选项主要适用于 Java HotSpot Virtual Machine，并非所有 JVM 都会支持非标准参数，不同的 JVM 实现可能支持的程度不一样，这类参数往往以 `-X` 开头；

（3）[高级运行时选项（Advanced Runtime Options）](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/java.html#BABCBGHF)；

（4）[高级 JIT 编译选项（Advanced JIT Compiler Options）](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/java.html#BABDDFII)；

（5）[高级服务选项（Advanced Serviceability Options）](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/java.html#BABFJDIC)；

（6）[高级垃圾回收选项（Advanced Garbage Collection Options）](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/java.html#BABFAFAE)；

Oracle 不建议部署项目时随意修改高级选项，因为这些参数涉及到 Java HotSpot 虚拟机在运行时进行的某些操作，往往涉及到 JVM 调优的时候，开发人员可以根据项目实际情况来进行配置。每个参数会涉及到 JVM 不同的领域。

要注意不同的 JVM 实现对于高级参数的支持也不同，支持的参数范围和具体的实现都可能会变化。此类参数往往以 `-XX` 开头。

