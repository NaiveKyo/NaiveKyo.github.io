---
title: Spring Cloud Study (一) Service Provider And Consumer
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221523.jpg'
coverImg: /img/20220225221523.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-26 22:44:27
summary: "Spring Cloud 学习(一): 服务提供者与服务消费者"
categories: "Spring Cloud"
keywords: "Spring Cloud"
tags: "Spring Cloud"
---

# 前言

测试用例：

之前已经搭建好了 Maven 聚合工程环境。

- 订单支付服务模块（模拟）；
- 客户消费支付模块（模拟）。

# 一、订单支付模块

## 1、服务创建

在父工程下创建子模块，并引入相应依赖，创建 Spring Boot 主启动类：

- 端口：8001；

- 依赖：注意，web 和 actuator 两个 starter 是必须的；

```xml
<dependencies>

    <!-- web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- actuator -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <!-- jdbc -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>

    <!-- test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- devtools -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <scope>runtime</scope>
        <optional>true</optional>
    </dependency>

    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
    </dependency>

    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
    </dependency>

    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>

    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>

</dependencies>
```

- 剩下的就是改配置、创建数据库、controller、service、mapper 的创建了，不做过多赘述

```yml
server:
  port: 8001
  
spring:
  application:
    name: cloud-payment-service
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    druid:
      driver-class-name: com.mysql.jdbc.Driver
      url: jdbc:mysql://localhost:3306/cloud_db_1?useUnicode=true&useSSL=false&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
      username: root
      password: 123456
      
mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: io.naivekyo.springcloud.entity
```

## 2、REST API

```java
@RestController
@Slf4j
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @PostMapping(value = "/payment/create")
    public CommonResult create(@RequestBody Payment payment) {
        int result = this.paymentService.create(payment);
        
        log.info("*** 插入结果: " + result);
        
        if (result > 0) 
            return new CommonResult(200, "插入数据成功!", result);
        else 
            return new CommonResult(444, "插入数据库失败!", null);
    }
    
    @GetMapping(value = "/payment/get/{id}")
    public CommonResult<Payment> getPaymentById(@PathVariable("id") Long id) {
        
        Payment payment = this.paymentService.getPaymentById(id);
        
        if (payment != null)
            return new CommonResult<>(200, "查询成功!", payment);
        else
            return new CommonResult<>(444, "无对应记录, 查询 ID " + id, null);
    }
}
```



# 二、客户消费模块

在父工程下创建子模块，并引入相应依赖，创建 Spring Boot 主启动类：

- 端口：80，注意正常情况下 80 端口是默认的访问端口，将此模块设置为 80 端口，主要是为了在网址输入 url 时无需指定端口号；
- 依赖：和订单支付模块一样，不做赘述。

# 三、RestTemplate

当两个服务创建成功后，我们不难想到如果想要在客户消费模块调用订单支付模块的服务，那么它们之间就必须可以进行通信，这个问题该如何解决？

首先了解一下 `RestTemplate`。

## 1、介绍

[RestTemplate](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#webmvc-resttemplate) 是一个用于处理 HTTP 请求的同步客户端，也是 Spring 中原始的 REST 客户端，它为底层的 HTTP 客户端库提供了一个简单的模板 API。

需要注意的是从 Spring 5.0 之后它就进入了维护阶段，Spring 官方更建议我们使用  [WebClient](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html#webflux-client) ，它提供了更现代的 API，同时也支持同步、异步和流场景。

那么我们可以用 `RestTemplate` 做什么呢？

- 可以借助这个模板工具集进行简单的 RESTful 服务访问操作。

> 客户消费模块

首先将 RestTemplate 注入到 Spring 容器中：

```java
@Configuration
public class ApplicationContextConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

然后编写客户模块的 API：

```java
@RestController
@Slf4j
public class OrderController {
    
    public static final String PAYMENT_URL = "http://localhost:8001";
    
    @Autowired
    private RestTemplate restTemplate;
    
    @GetMapping("/consumer/payment/create")
    public CommonResult create(Payment payment) {
         
        return this.restTemplate.postForObject(PAYMENT_URL + "/payment/create", payment, CommonResult.class);
    }
    
    @GetMapping("/consumer/payment/get/{id}")
    public CommonResult<Payment> getPaymentById(@PathVariable("id") Long id) {
        
        return this.restTemplate.getForObject(PAYMENT_URL + "/payment/get/" + id, CommonResult.class);
    }
}
```

需要注意的是第一个方法虽然是用户创建订单的，但是我们客户模块并不执行具体业务，而是远程调用订单支付模块进行处理，所以客户模块相当于客户端，这个方法是 GET 类型的，传参也是使用拼接的方式。

## 2、测试

开启两个服务模块，在客户模块请求 api 执行操作。

需要注意现在客户模块需要在 pom 中注释到有关数据库的依赖，因为现在还没有使用。

浏览器访问：`http://localhost/consumer/payment/get/1`，会成功返回相关数据。



# 四、服务重构

当我们发现前面两个服务中存在相同的一部分时，可以考虑将其抽出来重构为一个单独的公共模块；

新增模块：`cloud-api-common`

```xml
<dependencies>

    <!-- devtools -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <scope>runtime</scope>
        <optional>true</optional>
    </dependency>

    <!-- hutool -->
    <dependency>
        <groupId>cn.hutool</groupId>
        <artifactId>hutool-all</artifactId>
        <version>5.3.4</version>
    </dependency>

    <!-- lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
    
</dependencies>
```

然后再其他模块中导入该模块：

```xml
<dependency>
    <groupId>io.github.naivekyo</groupId>
    <artifactId>cloud-api-commons</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

