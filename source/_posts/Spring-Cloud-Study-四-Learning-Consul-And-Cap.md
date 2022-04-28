---
title: Spring Cloud Study (四) Learning Consul And Cap
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221624.jpg'
coverImg: /img/20220225221624.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-28 23:10:44
summary: "Spring Cloud 学习(四): Consul 注册中心以及 CAP 原则"
categories: "Spring Cloud"
keywords: ["Spring Cloud", "consul"]
tags: "Spring Cloud"
---

# Consul

# 一、Consul 简介

## 1、What is Consul？

官网：https://www.consul.io/

官方文档：https://www.consul.io/docs/intro

中文翻译：

- https://book-consul-guide.vnzmi.com/
- https://www.springcloud.cc/spring-cloud-consul.html

Consul 是一套开源的分布式服务发现和配置管理系统，由 HashiCorp 公司使用 GO 语言开发。

提供了微服务系统中的服务治理、配置中心、控制总线等等功能。这些功能中的每一个都可以根据需要单独使用，也可以在一起使用以构建全方位的服务网格，总之 Consul 提供了一种完整的服务网格解决方案。

它具有很多优点，包括：基于 raft 协议，比较简介；支持健康检查，同时支持 HTTP 和 DNS 协议；支持跨数据中心的 WAN 集群；提供图形界面；跨平台，支持 Linux、Mac、Windows。



## 2、Features

- 服务发现；
  - 支持 HTTP 和 DNS 两种发现方式
- 健康检查；
  - 支持多种方式：HTTP、TCP、Docker、Shell 脚本定制化
- KV 键值对存储；
  - Key、Value 的存储方式
- 安全服务通信；
- 多数据中心；
- 可视化 Web 界面。



# 二、下载并安装 Consul

下载地址：https://www.consul.io/downloads

根据系统环境按需下载对应版本的 Consul，页面下方可以看到历史版本。

为了方便演示，这里下载 Windows 版本的 `consul_1.12.0_windows_amd64.zip`，注意 386 指定是 32 位的。

解压到指定目录（建议不要存在中文路径）后，可以看到里面只有一个 `consul.exe` 可执行文件 

打开 cmd，输入命令查看版本：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220428220248.png)

输入 `consul agent -dev` 启动 consul，然后浏览器 `localhost:8500` 访问页面：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220428220731.png)



# 三、注册服务到 Consul

## 1、provider 服务

创建新模块 `cloud-providerconsul-payment8006`；

pom 文件和前面 zookeeper 类似，只是把 zookeeper 的依赖换成 consul：

```xml
<!-- spring consul server -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-consul-discovery</artifactId>
</dependency>
```

配置文件：

```yaml
server:
  port: 8006

spring:
  application:
    name: consul-provider-payment
  cloud:
    consul:
      host: localhost
      port: 8500
      discovery:
        service-name: ${spring.application.name}
```

主启动类：

```java
@EnableDiscoveryClient
@SpringBootApplication
public class PaymentConsulService8006 {
    public static void main(String[] args) {
        SpringApplication.run(PaymentConsulService8006.class, args);
    }
}
```

控制器：

```java
@RestController
public class PaymentController {

    @Value("${server.port}")
    private String serverPort;

    @RequestMapping(value = "/payment/consul")
    public String paymentZK() {
        return "springcloud with consul: " + serverPort + "\t" + UUID.randomUUID();
    }
}
```

## 2、consumer 服务

创建模块 `cloud-consumerconsul-order80`步骤和 provider 服务一样，只不过需要改个服务名和端口。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220428222858.png)



# 四、三个注册中心异同点

## 1、异同点

仅列举部分：

| 组件名    | 语言 | CAP  | 服务健康检查 | 对外暴露接口 | Spring Cloud 集成 |
| --------- | ---- | ---- | ------------ | ------------ | ----------------- |
| Eureka    | Java | AP   | 可以配置     | HTTP         | 已集成            |
| Consul    | Go   | CP   | 支持         | HTTP/DNS     | 已集成            |
| Zookeeper | Java | CP   | 支持         | 客户端       | 已集成            |

## 2、CAP 原则

CAP 原则又被称为 CAP 定理，指的是一个分布式系统中，一致性（Consistency）、可用性（Availablility）、分区容错性（Partition tolerance）。CAP 理论关注粒度是数据，而不是整体系统设计的策略。

CAP 原则指的是，这三个要素最多只能同时实现两点，不可能三者兼顾（由于是分布式系统要求 P 是必须保证的，所以分布式系统一般是 AP 或者 CP）。

因此，根据 CAP 原理将 NoSQL 数据库分成了满足 CA 原则、满足 CP 原则和满足 AP 原则三大类：

- CA  ：单点集群，满足一致性，可用性的系统，通常在可扩展性上不太强大；
- CP  ：满足一致性、分区容错性的系统，通常性能不是太高；
- AP  ：满足可用性、分区容错性的系统，通常可能对一致性要求低一些。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220428223713.png)

> 网络分区的概念

WIKI 给出的定义：网络分区是指由于网络设备的 failure，造成网络分裂为多个独立的组。

分区容错性：网络允许丢失一个节点发给另一个节点的任意多的消息。

分区原因：

- 网络设备 failure：比如网线断了，交换机故障了；
- 节点 failure：节点的软件或者硬件坏了，节点称为故障节点。当故障的节点非常多，故障节点和正常节点就不在同一个分区，如果正常的节点数量达不到 quorum，分布式系统无法正常运作。

> AP 架构 （Eureka）

当网络分区出现后，为了保证可用性，系统可以返回错误的数据，保证系统的可用性。

结论：违背了一致性 C 的要求，只满足可用性和分区容错，即 AP；

比如淘宝采用 AP 架构，双十一时必须保证整个网站的可用性，同时仅保证支付业务的一致性，且允许某些数据出现错误。

> CP 架构（Zookeeper/Consul）

当网络分区出现后，为了保证一致性，就必须拒接请求，否则无法保证一致性。

结论：违背了可用性 A 的要求，只满足一致性和分区容错，即 CP。