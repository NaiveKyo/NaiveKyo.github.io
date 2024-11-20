---
title: Gradle Quick Start
author: NaiveKyo
top: false
hide: false
img: "https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425111542.jpg"
coverImg: /img/20220425111542.jpg
cover: false
toc: true
mathjax: false
date: 2024-11-20 22:55:41
summary: Gradle Getting Started
categories:
  - "Build Tools"
  - Gradle
keywords: ["Build Tools", "Gradle"]
tags: Gradle
---

## Gradle Quick Start

## 简介

官网：https://gradle.org/

Gradle is the open source build system of choice for Java, Android, and Kotlin developers. From mobile apps to microservices, from small startups to big enterprises, it helps teams deliver better software, faster.

一些重要的特性：

- 高性能
- 基于 JVM
- 借鉴了 Maven 的特点，也是基于 Convention 去构建项目 （i.e. convention-over-configuration）
- 可扩展
- 主流的 IDE 都支持集成 Gradle
- Insight：在构建项目的时候会输出很多有用的信息，有助于排查问题

### 五个特点

有五个关于 Gradle 的事情：

Gradle is a flexible and powerful build tool that can easily feel intimidating when you first start. However, understanding the following core principles will make Gradle much more approachable and you will become adept with the tool before you know it.

1、Gradle 是一个通用的构建工具

这意味着使用 Gradle 可以构建很多软件，即使它们由不同的语言开发。但是有一点很重要，就是 Gradle 目前仅支持 Maven、lvy-compatible repositories and the filesystem 的依赖管理机制

2、Gradle 的核心模块是基于 Tasks 的

Gradle 使用 Directed Acyclic Graphs（DAGs，有向无环图）来描述由 tasks （units of work）组成的 model；

它本质上是把相关配置作为一个个 task 组合编排 —— 基于它们的依赖关系 —— 最后构造成一个 DAG；

一旦建立了 task graph，Gradle 就可以知道该以怎样的顺序去执行这些 task 以及后续的处理流程。

几乎所有的构建流程都可以抽象出由 task 结点构成的 graph，这也使 Gradle 更加灵活。可以使用不同的 plugins 或者自己定义 scripts 来定义 task graph，task 结点的关联关系由 [task dependency mechanism](https://docs.gradle.org/7.5/userguide/tutorial_using_tasks.html#sec:task_dependencies) 生成。

task 由以下几部分构成：

- Actions：task 结点要做的任务，比如复制文件或者编译源代码；
- Inputs：task 结点的输入，可以是值、文件、目录等等；
- Outputs：task 结点的输出，也就是 Inputs 的处理结果，可以是值、文件或目录等等；

当然并不是所有的 task 都有上面这几部分，这取决于任务的功能，比如 Gradle 的一些 [standard lifecycle tasks](https://docs.gradle.org/7.5/userguide/base_plugin.html#sec:base_tasks) 就不具备 actions。它们可以将多个任务按照约定组合在一起。

One last thing: Gradle’s [incremental build](https://docs.gradle.org/7.5/userguide/more_about_tasks.html#sec:up_to_date_checks) support is robust and reliable, so keep your builds running fast by avoiding the `clean` task unless you actually do want to perform a clean.

3、Gradle 有几个固定的 build phases

Gradle 评估和执行 script 主要有三个阶段：

（1）Initialization

为 build 工具配置好 environment，并且确定哪些 project 会参与构建（有点类似 Maven 的 manifest）

（2）Configuration

基于 build 配置构建 task graph，并基于用户配置决定 task 的执行顺序。

（3）Execution

选择 Configuration phase 最后确定的 task 来执行，一旦开始执行就会沿着 DGA 确定好的顺序去触发对应的 task。

上面这几个 phase 的详细信息可以参考 [Gradle Build Lifecycle](https://docs.gradle.org/7.5/userguide/build_lifecycle.html#build_lifecycle)

> Comparison to Apache Maven terminology

Gradle’s build phases are not like Maven’s phases. Maven uses its phases to divide the build execution into multiple stages. They serve a similar role to Gradle’s task graph, although less flexibly.

Maven’s concept of a build lifecycle is loosely similar to Gradle’s [lifecycle tasks](https://docs.gradle.org/7.5/userguide/base_plugin.html#sec:base_tasks).

4、可以通过多种方式扩展 Gradle

通常来讲只使用 Gradle 内置的 build logic 去构建项目的情况很少，很多时候我们有一些特殊的需求，这就意味着需要去定制 build logic。

Gradle 提供多种机制用于扩展，简单提一下，具体看官网文档：

- [Custom task types](https://docs.gradle.org/7.5/userguide/custom_tasks.html#custom_tasks).
- Custom task actions.
- [Extra properties](https://docs.gradle.org/7.5/userguide/writing_build_scripts.html#sec:extra_properties) on projects and tasks.
- Custom conventions.
- [A custom model](https://docs.gradle.org/7.5/userguide/implementing_gradle_plugins.html#modeling_dsl_like_apis).

5、在 Build Scripts 中操作 Gradle API

Gradle 的构建脚本中是可以执行 code 的。

构建脚本的文档：https://docs.gradle.org/7.5/dsl/

更多信息参考官方文档。

## 安装

系统：Windows

如果项目使用 [Gradle Wrapper](https://docs.gradle.org/current/userguide/gradle_wrapper.html#gradle_wrapper_reference) 就可以无需安装 Gradle，直接进行 build；

- 项目的根目录下如果存在 gradlew 或 gradlew.bat 文件就说明项目使用了 Gradle Wrapper；

Wrapper 其实是一份脚本文件，内部声明要使用的 Gradle 的版本，在 build 项目之前按照脚本中的声明自动下载对应的 Gradle，这样开发者就可以快速运行项目。

### Prerequisites

Gradle 可以运行在所有主流的操作系统上，它需要 JDK 8+ 的环境，具体版本对应以及兼容信息可以参考 [Compatibility Materix](https://docs.gradle.org/current/userguide/compatibility.html#compatibility)；

- 注意 JVM 16 及更早的版本无法运行 Gradle 9.0，但是 Gradle Wrapper、Gradle client、Tooling API client and TestKit client 会持续兼容 JVM 8；

Gradle 会查找可能存在的 JDK，包括系统 path、IDE 使用的 JDK、或者 project 声明的 JDK；

- 当系统存在多个版本的 JDK 时，可以通过系统变量 JAVA_HOME 指向正在使用的 JDK 版本目录；

Gradle 支持 Kotlin 和 Groovy 作为主要的 build language，而且安装 Gradle 后，它已经包含了 Kotlin 和 Groovy 相关的 Library，如果系统已经安装了相关依赖，则会被忽略。

### Windows Install

在 [Gradle Release ](https://gradle.org/releases)页面可以看到各版本的资源，这里选择 7.5.1 版本的 Gradle，能兼容 JDK 8 - 18；

之所以选择这个，也是因为 Spring Framework 5 最后一个版本 v5.3.39 也是使用的 Gradle 7.5.1；

下载二进制版本（binary-only）即可；

将 zip 文件解压到特定目录下，最后在系统变量 Path 中追加相关路径：

```shellscript
# 类似这样
D:\development_environment\gradle\gradle-7.5.1\bin

# 或者新增一个系统变量指向解压后的目录, 比如新增一个 GRADLE_HOME 系统变量, 然后在 Path 中追加 %GRADLE_HOME%\bin
# 这样后续切换 Gradle 的版本会更方便一些
```

判断是否成功安装：

```shellscript
> gradle -v

------------------------------------------------------------
Gradle 7.5.1
------------------------------------------------------------
...... (省略系统信息)
```

## Gradle Wrapper

Gradle 官方推荐使用 Gradle Wrapper 来构建项目：

In a nutshell, you gain the following benefits:

- Standardizes a project on a given Gradle version for more reliable and robust builds.
- Provisioning the Gradle version for different users is done with a simple Wrapper definition change.
- Provisioning the Gradle version for different execution environments (e.g., IDEs or Continuous Integration servers) is done with a simple Wrapper definition change.

有三种方式可以使用 Wrapper：

1、直接添加 Gradle Wrapper

需要系统提前安装 Gradle runtime

TODO

2、项目升级 Gradle Wrapper

TODO

如果要升级项目使用的 Gradle 版本，官方推荐使用 Gradle Wrapper 的形式去升级。

3、定制 Gradle Wrapper

TODO

## 核心概念

TODO

## Build Java Application

Gradle 既支持使用命令行初始化、执行和构建项目，也支持各类主流 IDE 创建 Gradle 项目。

### 使用 gradle init

参考官方 example：https://docs.gradle.org/7.5/samples/index.html#java

IDE：IntelliJ IDEA

使用 `gradle init` 命令初始化项目，然后使用 IDEA 打开

```shellscript
# 查看使用说明
> gradle -h
USAGE: gradle [option...] [task...]

# 常用的 help 命令
> gradle help
> gradle help --task <taskname>.

# 在特定工程目录下使用 init task
> gradle init

Select type of project to generate:
  1: basic
  2: application
  3: library
  4: Gradle plugin
Enter selection (default: basic) [1..4] 2

Select implementation language:
  1: C++
  2: Groovy
  3: Java
  4: Kotlin
  5: Scala
  6: Swift
Enter selection (default: Java) [1..6] 3

Split functionality across multiple subprojects?:
  1: no - only one application project
  2: yes - application and library projects
Enter selection (default: no - only one application project) [1..2] 1

Select build script DSL:
  1: Groovy
  2: Kotlin
Enter selection (default: Groovy) [1..2] 1

Generate build using new APIs and behavior (some features may change in the next minor release)? (default: no) [yes, no]
Select test framework:
  1: JUnit 4
  2: TestNG
  3: Spock
  4: JUnit Jupiter
Enter selection (default: JUnit Jupiter) [1..4] 4

Project name (default: demo):
Source package (default: demo):

> Task :init
Get more help with your project: https://docs.gradle.org/7.5.1/samples/sample_building_java_applications.html

BUILD SUCCESSFUL in 1m 17s2 actionable tasks: 2 executed
```

最后生成的项目结构，每个文件的含义：

- /gradle 目录：存放 gradle wrapper 相关的文件；
- /gradlew 和 /gradlew.bat： gradle wrapper 的启动脚本；
- /settings.gradle：配置文件，定义 build name 和 subprojects；
- /app/build.gradle：app 项目的构建脚本；
- /app/src/main/java 目录：默认的 Java 源文件目录；
- /app/src/test/java 目录：默认的 Java 测试文件目录；

### 文件含义

setting.gradle（.kts）文件只有两行：

```groovy
rootProject.name = 'demo' // 为 build 工作分配一个名称，默认情况下这个值是工程所在目录的名称，不过最好还是在这里配置好，因为目录名可能会变化
include('app') // 规定只有叫 app 的子项目才会参与 build，如果有多个子项目，则可以添加多个 include 语句
```

当前 build 只包含一个叫做 app 的子项目，该项目的构建配置在 app/build.gradle（.kts）文件中

```groovy
plugins {
    // Apply the application plugin to add support for building a CLI application in Java.
    // 如果当前 Java 项目是开发 cli 程序的，那 application 插件可以协助完成构建工作
    id 'application'
}

repositories {
    // Use Maven Central for resolving dependencies.
    // 使用 maven 中央仓库解析依赖
    mavenCentral()
}

// 当前子工程使用的依赖
dependencies {
    // Use JUnit Jupiter for testing.
    testImplementation 'org.junit.jupiter:junit-jupiter:5.8.2'

    // This dependency is used by the application.
    implementation 'com.google.guava:guava:31.0.1-jre'
}

application {
    // Define the main class for the application.
    mainClass = 'demo.App'
}

tasks.named('test') {
    // Use JUnit Platform for unit tests.
    useJUnitPlatform()
}
```

### 运行程序

#### 国内镜像配置

得益于 application 插件，我们可以直接在命令行运行程序，gradle 的 run task 可以执行 app project 的 main class；

执行命令会使用 gradle wrapper 去执行程序，在下载指定 version 的 gradle distribution 时可能会由于网络原因超时，因此需要对 wrapper 做一些配置，修改项目根目录下的 /gradle/gradle-wrapper.properties 文件，可以参考：

- https://docs.gradle.org/7.5/userguide/gradle_wrapper.html
- https://docs.gradle.org/7.5/userguide/build_environment.html#sec:accessing_the_web_via_a_proxy
- https://docs.gradle.org/7.5/userguide/plugins.html#sec:binary_plugins

在国内可以配置 gradle-wrapper.properties 文件中的 distructionUrl 属性为阿里云或腾讯云等等分发地址；

```groovy
// 目录: ./gradle/wrapper/gradle-wrapper.properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://mirrors.aliyun.com/macports/distfiles/gradle/gradle-7.5.1-bin.zip
zipStoreBase=GRADLE_USER_HOMEzipStorePath=wrapper/dists
```

build.gradle 文件中 repositories 下配置 maven 仓库地址为国内的代理地址以及 Maven 的本地仓库；

Note：

- gradle 的插件搜索网址：https://plugins.gradle.org/
- 如果不使用 maven 本地仓库，gradle 会将下载的依赖放到 cache 中，如果使用本地仓库，则 Gradle 会先尝试读取 USER_HOME/.m2 下的 maven settings.xml 文件，如果没找到，则尝试查找 M2_HOME/conf 目录下的 settings.xml，开发者需要增加系统变量 M2_HOME，如果都没找到配置文件，则使用 USER_HOME/.m2/repository
- https://docs.gradle.org/7.5.1/userguide/dependency_management_terminology.html
- https://docs.gradle.org/7.5.1/userguide/declaring_repositories.html

Gradle 官方认为使用 MAVEN 本地仓库的好处和坏处：https://docs.gradle.org/7.5.1/userguide/declaring_repositories.html#sec:case-for-maven-local

```groovy
// 目录: ./app/build.gradle

// Gradle 按照声明的先后顺序解析和下载依赖
repositories {
    // 优先从本地仓库中查找依赖
    mavenLocal()

    // 使用国内 maven 镜像仓库
    maven { url 'https://maven.aliyun.com/repository/public/' }
    maven { url 'https://mirrors.cloud.tencent.com/nexus/repository/maven-public/' }
    maven { url 'https://mirrors.huaweicloud.com/repository/maven/' }
    maven { url 'https://mirrors.tuna.tsinghua.edu.cn/maven/' }
    maven { url 'https://mirrors.ustc.edu.cn/maven/' }

    // Use Maven Central for resolving dependencies.
    mavenCentral()
}
```

#### 执行程序

```shellscript
> gradlew.bat run

Starting a Gradle Daemon (subsequent builds will be faster)

> Task :app:run
Hello World!

BUILD SUCCESSFUL in 6s2 actionable tasks: 2 executed
```

### Bundle the application

application 插件也支持将项目及其依赖打包，执行以下命令，会生成 zip 和 tar 两种压缩包：

```shellscript
> gradlew.bat build

BUILD SUCCESSFUL in 2s7 actionable tasks: 6 executed, 1 up-to-date
```

生成文件的位置：`app/build/distributions/app.tar` 和 `app/build/distributions/app.zip`

### Nest steps

To learn more about how you can further customize Java application projects, check out the following user manual chapters:

- [Building Java & JVM projects](https://docs.gradle.org/7.5.1/userguide/building_java_projects.html)
- [Java Application Plugin documentation](https://docs.gradle.org/7.5.1/userguide/application_plugin.html)

## 多模块项目

TODO

## Spring Boot 多模块

TODO
