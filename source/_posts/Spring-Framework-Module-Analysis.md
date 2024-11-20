---
title: Spring Framework Module Analysis
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425111600.jpg'
coverImg: /img/20220425111600.jpg
cover: false
toc: true
mathjax: false
date: 2024-11-21 00:04:42
summary: Spring framework module analysis
categories: Spring
keywords: Spring
tags: Spring
---



# Spring Framework

## Preface

官方网站：https://spring.io/

源码版本：[spring 5.3.39](https://github.com/spring-projects/spring-framework/tree/v5.3.39)

* 使用 Gradle 作为构建工具，版本 7.5.1；
* 兼容支持 JDK 8 - 21；
* 5.3.39 的构建环境：Gradle 7.5.1、JDK 17

官方文档：https://docs.spring.io/spring-framework/docs/5.3.39/reference/html/



## Spring Beans 模块

Spring Beans 模块内部包含 Spring-Core 模块：

* spring-core 模块包含 asm 和 cglib 依赖，同时鉴于 cglib 本身也是依赖 asm 实现的，因此借助 ShardJar task（Gradle Task） 将 asm 的完整依赖转移到 org.springframework.asm 包下，避免最终打包的 jar 包中包含重复的 asm 源码；
* spring-core 也提供日志功能，日志门面使用 slf4j、默认日志实现使用 jcl（i.e. apache common logging）；
* 此外，core 模块也提供 spring 框架的诸多基础能力，比如 IO 抽象、消息转换器、日志、环境容器、编解码、反射及注解、并发工具以及各类常用工具类，等等



Spring Beans 模块则是在 core 模块提供的各类基础能力上构建 Spring 的 Bean 体系，主要包括：

* Spring 的轻量级 Inversion Of Control（IoC）container 实现；

BeanFactory 借助各类 parser 从 configuration source（e.g. xml、Java Config 等等）解析得到 BeanDefinition，然后根据配置生成 instance，同时提供 Dependency Injection 能力来加工 instance，最后根据 bean 的 lifecycle hook 对 instance 进行处理，从而生成一个完整的 bean 实例。

这里面有几个关键点：BeanDefinition 体系、BeanFactory 体系、bean 的 parser、依赖注入以及 lifecycle hook。

补充：除了 BeanFactory 的抽象体系外，spring-context 模块也提供了 application context 抽象，它是对 BeanFactory 的扩展，当程序位于特定的 content 时，可以使用 ApplicationContext 抽象。

* 操作 Bean 的工具：BeanWrapper；



## Spring Context 模块

Spring Context 模块包含 Spring Aop、Spring Expression、Spring Instrument、Spring beans、Spring core 几个模块，其中：

1、Spring 的 Aop 模块是实现了 Aop Alliance 接口的一种 aop 变种实现；

2、Spring Expression 则提供了 Spring 特有的表达式语言；

3、Spring Instrument 主要与 Java Agent 和 ClassLoader 交互，主要用于运行时对类字节码进行修改，可以实现很多增强功能，比如 Aop 代理、性能监控、集成 AspectJ 等等；



Spring Context 模块主要包含以下功能：

* Spring 通用缓存抽象体系；
* 对 EJB（Enterprise JavaBeans）的支持，EJB 是 Java EE（现在叫 Jakarta EE）规范的一部分，主要定义了一系列企业级应用程序组件，比如事务管理、远程方法调用等等，Spring 提供多种方式集成 EJB，比如 JNDI 引用、代理工厂、依赖注入等等；

注意 Spring 的许多模块起始也具备集成功能组件的能力，比如 Spring AOP、声明式事务，各类 xxxTemplate 实例，大多数情况下可以直接使用 Spring 提供的工具，尽量减少直接依赖 EJB。

* 格式化功能，比如数字、日期格式化；
* 基于 class loaders 的 LTW （Load-time weaving）机制；
* Spring JMX 功能；
* JNDI 功能支持；
* 远程方法调用支持；
* 任务调度功能；
* Spring 对 Script 的支持；
* Spring 的 stereotype（可以通过注解标注某个类的角色）
* 对 ui layer 的支持；
* data binding 和 validation 功能
* 对 BeanFactory 的扩展，提供 Application Context；



TODO