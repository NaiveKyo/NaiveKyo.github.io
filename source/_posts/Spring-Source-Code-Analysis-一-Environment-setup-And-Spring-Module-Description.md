---
title: >-
  Spring Source Code Analysis (一) Environment setup And Spring Module
  Description
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211227215819.jpg'
coverImg: /img/20211227215819.jpg
cover: false
toc: true
mathjax: false
date: 2022-03-14 11:46:56
summary: "Spring 源码分析: 环境搭建和 Spring 模块说明"
categories: "Spring"
keywords: "Spring"
tags: "Spring"
---

# 前言

## 1、版本说明

创建 maven 项目，导入依赖：

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>5.2.19.RELEASE</version>
</dependency>
```

webmvc 集成了 Spring 所需的各大模块，所以直接使用该版本进行源码分析。

最好去 GitHub 上 clone 对应版本的 Spring 源代码。

## 2、Spring 整体架构

Spring 模块图:

https://docs.spring.io/spring-framework/docs/4.3.x/spring-framework-reference/html/overview.html

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220314095143.png)

Spring 框架是一个分层架构，它包含一系列的功能要素，并大约分为 20 个模块，这些模块可以总结为以下几个部分：

### （1）Core Container

`Core Container` 核心容器中包含 `Core`、`Beans`、`Context` 和 `Experssion Language` 模块。

Core 和 Beans 模块是框架的基础部分，提供 IoC（控制反转）和依赖注入特性。这里的基础概念是 `BeanFactory`，它提供对 Factory 模式的经典实现来消除对程序性单例模式的需要，并真正地允许你从程序逻辑中分离出依赖关系和配置。

- `Core` 模块主要包含 Spring 框架基本的核心工具类，Spring 的其他组件都要用到这个包里的类，Core 模块是其它组件的基本核心；
- `Beans` 模块是所有应用都要用到的，它包含访问配置文件、创建和管理 bean 以及进行 `Inversion Of Control/Dependency Injection (IoC/DI)` 操作相关的所有类；
- `Context` 模块构建于 Core 和 Beans 模块基础之上，提供了一种类似于 `JNDI` 注册器的框架式的对象访问方法。Context 模块继承了 Beans 的特性，为 Spring 核心提供了大量扩展，添加了对国际化（例如资源绑定）、事件传播、资源加载和对 Context 的透明创建的支持。Context 模块同时也支持一些 J2EE 的一些特性，例如 EJB、JMX 和基础的远程处理。`ApplicationContext` 接口是 Context 模块的关键；
- `Experssion Lanaguage (SpEL)` 模块提供了强大的表达式语言，用于在运行时查询和操纵对象。它是 JSP 2.1 规范中定义的 `unifed experssion lanaguage` 的扩展。该语言支持设置/获取属性的值、属性的分配、方法的调用、访问数组上下文（accessing the context of arrays）、容器和索引器、逻辑和算术运算符、命名变量以及从 Spring 的 IoC 容器中根据名称检索对象。它也支持 list 投影、选择和一般的 lis 聚合。

### （2）Data Access / Integration

`Data Access / Integration` 层包含 JDBC、ORM、OXM、JMS 和 Transaction 模块。

- `JDBC` 模块提供了一个 JDBC 抽象层，它可以消除冗长的 JDBC 编码和解析数据库厂商特有的错误代码。这个模块包含了 Spring 对 JDBC 数据访问进行封装的所有类；
- `ORM` 模块为流行的对象-关系映射 API，如 JPA、JDO、Hibernate、iBatis 等等，提供了一个交互层。利用 ORM 封装包，可以混合使用所有 Spring 提供的特性进行 O/R 映射，如一些简单的声明性事务管理。

<mark>Spring 框架插入了若干个 ORM 框架，从而提供了 ORM 的对象关系工具，其中包括 JDO、Hibernate 和 iBatisSQL Map。这些都遵循 Spring 的通用事务和 DAO 异常层次结构。</mark>

- `OXM` 模块提供了一个对 `Object/XML` 映射实现的抽象层，Object/XML 映射实现包括 JAXB、Castor、XMLBeans、JiBX 和 XStream；
- `JMS (Java Messaging Service)` 模块主要包含了一些制造和消费消息的特性；
- `Transaction` 模块支持编程和声明性的事务管理，这些事务必须实现特定的接口，并且对所有的 POJO 都使用。

### （3）Web

Web 上下文模块建立在应用程序上下文模块之上，为基于 Web 的应用程序提供了上下文。所以，Spring 框架支持于 Jakarta Struts 的集成。Web 模块还简化了处理大部分请求以及将请求参数绑定到域对象的工作。Web 层包含了 Web、Web-Servlet（webmvc）、WebSocket、WebMVC-Portlet 模块。

- `Web`：提供了基础的面向 Web 的集成特性，比如说类型为 `Multipart` 类型的文件的上传（多文件上传）、使用 Servlet 监听器初始化应用程序 IoC 容器 以及提供面向 Web 的上下文。它还包含 HTTP 客户端并提供 Spring 远程支持所需要的 Web 相关部分；
- `Web-Servlet (webmvc)`：包含 Spring 的 `model-view-controller(MVC)` 以及 Web 应用程序的 REST Web 服务实现。Spring 的 MVC 框架使得模型范围内的代码和 web forms 之间能够清楚地分离开来，并与 Spring 框架的其他特性集成在一起；
- `Web-Portlet(webmvc-portlet)`：提供了用于 Portlet 环境和 Web-Servlet 模块的 MVC 的实现。

### （4）AOP

AOP 模块提供了一个符合 AOP 联盟标准的面向切片编程的实现，它让你可以定义例如方法拦截器和切点，从而将逻辑代码分开，降低它们之间的耦合性。利用 source-level 的元数据功能，还可以将各种行为信息合并到代码中，这点类似于 .Net 的 attribute 属性。

通过配置管理属性，Spring AOP 模块直接将面向切面的编程功能集成到了 Spring 框架中，所以可以很容易地使 Spring 框架管理的任何对象支持 AOP。Spring AOP 模块为基于 Spring 的应用程序中的对象提供了事务管理服务。通过使用 Spring AOP，不用依赖于 EJB 组件，就可以将声明性事务管理集成到应用程序中。

- `Aspects` 模块提供了对 AspectJ 的集成支持；
- `Instrumentation` 模块提供了 class instrumentation 支持和 classloader 实现，使得可以在特定的应用服务器上使用。

### （5）Test

Test 模块提供了单元测试（Junit）和集成测试（TestNG）对 Spring 组件进行测试。还提供对 Spring 上下文的一致性加载和缓存上下文，甚至提供了 mock objects 来模拟数据进行测试。

