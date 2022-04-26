---
title: Spring Cloud Of Microservice Technology
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221510.jpg'
coverImg: /img/20220225221510.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-26 22:41:02
summary: "微服务概述"
categories: "Spring Cloud"
keywords: ["Spring Cloud", "Microservice"]
tags: "Spring Cloud"
---

# 什么是微服务

微服务架构是一种架构模式，它提倡将单一应用程序划分为一组小的服务，服务之间互相协调、互相配合，为用户 提供最终价值。每个服务运行在其独立的进程中，服务与服务之间采用轻量级的通信机制相互协作（通常是基于 HTTP 协议的 RESTful API）。每个服务都围绕着具体业务进行构建，并且能够被独立的部署到生产环境、类生产环境等。另外，应当尽量避免统一的、集中式的服务管理机制，对具体的一个服务而言，应根据业务上下文，选择合适的语言、工具对其进行构建。



微服务架构囊括了多个技术维度，大概从以下这些方面：

# 2020 年以前主流的微服务技术

- 服务注册与发现：EUREKA
- 服务调用：NETFLIX OSS RIBBON
- 服务熔断：HYSTRIX
- 负载均衡：NETFLIX FEIGN
- 服务消息队列
- 配置中心管理：Spring Cloud Config
- 服务网关：NETFLIX OSS Zuul
- 服务监控
- 全链路追踪
- 自动化构建部署
- 服务定时任务调度操作

服务开发：Spring Boot



# Spring Boot 和 Spring Cloud 版本选择

Spring Boot 一般以数字作为版本号，Spring Cloud 在 2020.0.5 GA 版本之前，都是以伦敦地铁站的英文单词，且首字母大写按照字母表升序，2020.0.5 GA 版本之后开始以数字为版本号。

至于 Spring Boot 和 Spring Cloud 版本的对应关系，可以参考官方文档：https://spring.io/projects/spring-cloud#overview 

目前是这样的：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425165011.png)

更详细的版本映射，可以利用 Spring 官方提供的一个 api：https://start.spring.io/actuator/info

该 api 返回一个 JSON 字符串，我们利用 JSON 工具对其进行转化：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425165537.png)

那么如果要和 Spring Cloud Alibaba 进行集成该如何确定版本关系呢？我们可以去 Spring Cloud Alibaba 的 Github 的 wiki 上看到相关信息：https://github.com/alibaba/spring-cloud-alibaba/wike

找到版本说明：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425165941.png)



# 学习环境搭建

到此可以确定我们的技术选型：

- Spring Cloud Hoxton.SR12
- Spring Cloud Alibaba 2.2.7.RELEASE
- Spring Boot 2.3.12.RELEASE
- JDK 1.8 +
- Maven 3.5 +
- MySQL 5.7 +



# Spring Cloud 停更组件

## 1、停更

停更不停用：

- 被动修复 bug
- 不在接收合并请求
- 不在发布新版本

## 2、升级

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425172150.png)

# 项目构建

Maven 聚合工程 pom 文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>io.github.naivekyo</grou
        pId>
    <artifactId>Spring_Cloud_Study</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <mysql.version>5.1.49</mysql.version>
        <druid.version>1.2.8</druid.version>
        <mybatis.version>2.2.0</mybatis.version>
        <lombok.version>1.18.24</lombok.version>
    </properties>
    
    <dependencyManagement>
        <dependencies>
            
            <!-- spring boot 2.3.12.RELEASE -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>2.3.12.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- Spring Cloud Hoxton.SR12-->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>Hoxton.SR12</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- Spring Cloud Alibaba 2.2.7.RELEASE -->
            <dependency>
                <groupId>com.alibaba.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>2.2.7.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- mysql driver -->
            <dependency>
                <groupId>mysql</groupId>
                <artifactId>mysql-connector-java</artifactId>
                <version>${mysql.version}</version>
            </dependency>

            <!-- druid spring boot starter -->
            <dependency>
                <groupId>com.alibaba</groupId>
                <artifactId>druid-spring-boot-starter</artifactId>
                <version>${druid.version}</version>
            </dependency>

            <!-- mybatis spring boot starter -->
            <dependency>
                <groupId>org.mybatis.spring.boot</groupId>
                <artifactId>mybatis-spring-boot-starter</artifactId>
                <version>${mybatis.version}</version>
            </dependency>

            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
                <optional>true</optional>
            </dependency>
            
        </dependencies>
    </dependencyManagement>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <fork>true</fork>
                    <addResources>true</addResources>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

有几个要点：

- 打包方式：`<packaging>pom</packaging>`
- 锁定依赖 ：`dependencyManagement` 
- Spring Boot 的 Maven 插件
- 跳过单元测试：通过 IDEA Maven 插件上的 `Toggle 'Skip Tests' Mode` 按钮，来禁用 Maven 生命周期中的 test

# 热部署（可选）

Spring Boot 提供了一个 DevTools 工具用于热部署。

（1）首先需要将下面的依赖添加到我们的服务模块中：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```

（2）然后添加一段 Maven 的插件配置到父工程的 pom 文件中：

```xml
<build>
    <finalName>工程的名字(可选)</finalName>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <fork>true</fork>
                <addResources>true</addResources>
            </configuration>
        </plugin>
    </plugins>
</build>
```

（3）开启 IDEA 的自动编译功能

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220426144424.png)

（4）热部署快捷键：`ctrl + F9`

其实这个热部署工具的本质还是重启服务，所以就算不使用也可以，更改了后台代码后重启服务即可