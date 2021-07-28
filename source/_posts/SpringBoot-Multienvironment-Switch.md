---
title: SpringBoot Multienvironment Switch
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210728174304.jpg'
coverImg: /img/20210728174304.jpg
toc: true
date: 2021-07-17 09:13:35
top: false
cover: false
summary: Spring Boot 多环境开发
categories: 'Spring Boot'
keywords: 'Spring Boot'
tags: 'Spring Boot'
---



# SpringBoot 多环境切换及配置文件

## 一、配置文件的位置

在 SpringBoot 中 [官网推荐配置文件](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.files) 可以放在这些目录下：

```bash
/config/application.yaml

/application.yaml

classpath:config/application.yaml

classpath:application.yaml
```



生效的优先级：

1. `/config/application.yaml`
2. `/application.yaml`
3. `classpath:config/application.yaml`
4. `classpath:application.yaml`

**结果就是，系统自动配置的文件优先级是最低的**



## 二、多环境切换配置文件

在实际开发中，我们有多套环境，例如 测试环境、生产环境 等等，可以迅速切换。

切换方式如下：

1、自动覆盖

2、自己手动选择

**这些环境配置文件的前缀都是 `application`**



例如：

```properties
测试环境 : application-test.properties
开发环境 : application-dev.properties
默认环境 : application.properties

默认启动是默认环境

可以在默认的 application.properties 中设置激活哪一个环境

# springboot 的多环境配置，可以选择激活哪一个配置文件
spring.profiles.active=dev	// 开发
spring.profiles.active=test	// 测试
```



使用 yaml 要比 properties 更方便，只需要一个文件就好了（也可以设置多个文件：`application.yml、application-dev.yml、application-prod.yml、application-test.yml`）:

```yaml
# 多文档模块
server:
  port: 8080
spring:
  profiles:
    active: test

---
server:
  port: 8081
spring:
  profiles: dev
---
server:
  port: 8082
spring:
  profiles: test
```

**注意：如果 yml 和 properties 同时都配置了端口，并且没有激活其他环境 ， 默认会使用 properties 配置文件的！**
