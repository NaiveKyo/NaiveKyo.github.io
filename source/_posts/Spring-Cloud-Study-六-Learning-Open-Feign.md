---
title: Spring Cloud Study (六) Learning Open Feign
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221714.jpg'
coverImg: /img/20220225221714.jpg
cover: false
toc: true
mathjax: false
date: 2022-05-05 21:04:40
summary: "Spring Cloud 学习(六): 服务消费 Open Feign"
categories: "Spring Cloud"
keywords: "Spring Cloud"
tags: "Spring Cloud"
---

# Open Feign

# 一、概述

## 1、OpenFeign 是什么

Github：https://github.com/OpenFeign/feign

WIKI：https://github.com/OpenFeign/feign/wiki

Spring Cloud：https://spring.io/projects/spring-cloud-openfeign

Feign 是一个声明式的 WebService 客户端。使用 Feign 能让编写 Web Service 客户端更加简单。

它的使用方法是定义一个服务接口然后在上面添加注解。Feign 也支持可拔插式的编码器和解码器。Spring Cloud 对 Feign 进行了封装，使其支持 Spring MVC 注解标准和 HttpMessageConverters。Feign 可以与 Eureka 和 Ribbon 组合使用以支持负载均衡。



## 2、Feign 能做什么

Feign 旨在编写 Java Http 客户端变得更加容易。

前面使用 Ribbon + RestTemplate 时，利用 RestTemplate 对 http 请求的封装处理，形成了一套模板化的调用方法。但是在实际开发中，由于对服务依赖的调用可能不止一处，往往一个接口会被多出调用，所以通常都是针对每一个微服务自行封装一些客户端类来包装这些依赖服务的调用。所以，Feign 在此基础上做了进一步封装，由他来帮助我们定义和实现依赖服务接口的定义。在 Feign 的实现下，我们只需创建一个接口并使用注解的方式来配置它（以前是 Dao 接口上面标注 Mapper 注解，现在是在一个微服务接口上面标注一个 Feign 注解即可），即可完成对服务提供方的接口绑定，简化了使用 Spring Cloud Ribbon 时，自动封装服务调用客户端的开发量。

<mark>Feign 集成了 Ribbon</mark>

利用 Ribbon 维护了 Payment 的服务列表信息，并且通过轮询实现了客户端负载均衡。而与 Ribbon 不同的是，通过 Feign 只需要定义服务绑定接口且以声明式的方法，优雅而简单的实现了服务调用。



## 3、Feign 和 Open Feign 的区别

> Feign

Feign 是 Spring Cloud 组件中的一个轻量级 RESTful 的 HTTP 服务客户端；

Feign 内置了 Ribbon，用来做客户端负载均衡，去调用服务注册中心的服务，Feign 的使用方式是：使用 Feign 的注解定义接口，调用这个接口，就可以调用服务注册中心的服务。

```xml
<dependency>
	<groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-feign</artifactId>
</dependency>
```

> OpenFeign

OpenFeign 是 Spring Cloud 在 Feign 的基础上支持了 Spring MVC 注解，如 `@RequestMapping` 等等。OpenFeign 的 `@FeignClient` 可以解析 Spring MVC 的 `@RequestMapping` 注解下的接口，并通过动态代理的方式产生实现类，实现类中做负载均衡并调用其他服务。

```xml
<dependency>
	<groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```



# 二、使用 Feign

微服务调用接口 + `@FeignClient`

新建 `cloud-consumer-feign-order80` 服务模块（注意：Feign 在消费端生效）

pom：

```xml
<dependencies>
    <dependency>
        <groupId>io.github.naivekyo</groupId>
        <artifactId>cloud-api-commons</artifactId>
        <version>1.0-SNAPSHOT</version>
    </dependency>

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

    <!-- open feign -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>

    <!-- eureka client -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-netflix-eureka-client</artifactId>
    </dependency>

    <!-- lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
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
</dependencies>
```

配置文件：

```yaml
server:
  port: 80

spring:
  application:
    name: cloud-order-service
      
eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka,http://eureka7002.com:7002/eureka
  instance:
    instance-id: consumer-feign-order
    prefer-ip-address: true
```

主启动类：

```java
@SpringBootApplication
@EnableFeignClients
@EnableEurekaClient
public class OrderFeignService80 {
    public static void main(String[] args) {
        SpringApplication.run(OrderFeignService80.class, args);
    }
}
```

注意在消费侧服务需要加上 `@EnableFeignClients`。

Feign 接口类：

```java
// io.naivekyo.springcloud.client.PaymentFeignService

@Component
@FeignClient(value = "CLOUD-PAYMENT-SERVICE")
public interface PaymentFeignService {
    
    @GetMapping(value = "/payment/get/{id}")
    CommonResult<Payment> getPaymentById(@PathVariable("id") Long id);
    
}
```

控制器：

```java
@RestController
public class OrderFeignController {
    
    @Autowired
    private PaymentFeignService paymentFeignService;
    
    @GetMapping(value = "/consumer/payment/feign/get/{id}")
    public CommonResult<Payment> getPaymentServiceUseFeign(
            @PathVariable("id") Long id
    ) {
        return this.paymentFeignService.getPaymentById(id);
    }
}
```

最后注意：OpenFeign 自动集成 Ribbon。



# 三、Feign 超时控制

## 1、测试

在 payment8001 服务提供方编写一个接口：

```java
@GetMapping(value = "/payment/feign/timeout")
public String paymentFeignTimeout() {
    try {
        TimeUnit.SECONDS.sleep(3);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }

    return "payment service: " + serverPort;
}
```

然后 consumer-feign-order80 服务通过 Feign 调用该接口：

```java
@Component
@FeignClient(value = "CLOUD-PAYMENT-SERVICE")
public interface PaymentFeignService {
    
    @GetMapping(value = "/payment/get/{id}")
    CommonResult<Payment> getPaymentById(@PathVariable("id") Long id);

    @GetMapping(value = "/payment/feign/timeout")
    String paymentFeignTimeout();
}
```

测试：`http://localhost/consumer/payment/feign/timeout`

结果就是跳转到错误提示页面。

## 2、修改配置

默认 Feign 客户端只等待 1 秒钟，但是服务端处理需要超过 1 秒钟， 导致 Feign 客户端超时直接返回错误信息。

为了避免这样的情况，有时候我们需要设置 Feign 客户端的超时时间控制以及 Ribbon 的时间。

配置：（结合文档）

```yml
ribbon:
  # 处理请求的时间
  ReadTimeout: 3000
  # 建立连接的时间
  ConnectionTimeout: 3000
  
ribbon:
  ReadTimeout: 5000
  ConnectionTimeout: 5000
  
feign:
  client:
    config: 
      default:
      	# 建立连接后从服务端读取到可用资源所需的最长时间
        connectTimeout: 5000
        # 建立连接允许的最长时间
        readTimeout: 5000
```

这里需要注意如果之后引入了 Hystrix 那么也需要设置 Hystrix 的超时时间。

如果开启 Hystrix，此时 Feign 客户端的调用就分为了两层：Ribbon 的调用和 Hystrix 的调用，且 Hystrix 在外层，接下来就是 Ribbon，最后是 HTTP 请求。

参考：https://www.cnblogs.com/wudimanong/p/11224494.html

- 一般情况下，Hystrix 的熔断时间必须大于 Ribbon 的（ConnectionTimeout + ReadTimeout），如果 Ribbon 开启了重试机制，还需要乘以对应的重试次数，保证在 Ribbon 的请求还没结束，Hystrix 的熔断时间不会超时；
- 由于在 Spring Cloud 中使用 Feign 进行微服务调用分为两层，所以 Feign 的超时时间就是 Ribbon 和 Hystrix 超时时间的总和，而如果不启用 Hystrix 则 Ribbon 的超时时间就是 Feign 的超时时间配置，当两者都配置时，Feign 自身的超时时间将会被覆盖；
- 所以，我们一般会显式配置 Ribbon 和 Hystrix 的超时时间，而无需显式配置 Feign 自身的超时时间。
- 在[官方文档](https://docs.spring.io/spring-cloud-openfeign/docs/2.2.10.RELEASE/reference/html/#timeout-handling)中也提到了，如果显式配置了 Feign 和 Hystrix 的超时时间，且后者大于前者，则 `HystrixTimeoutException` 会包裹 Feign 的异常，这两种异常唯一不同的是 `HystrixTimeoutException` 会将第一个出现的运行时异常进行包裹然后抛出自身的一个实例。

# 四、Feign 日志

Feign 提供了日志打印功能，我们可以通过配置来调整日志级别，从而了解 Feign 中 Http 请求的细节。

简而言之就是对 Feign 接口的调用请情况进行监控和输出。

## 1、日志级别

- NONE：默认的，不显示任何日志；
- BASIC：仅记录请求方法、URL、响应状态码和执行时间；
- HEADERS：除了 BASIC 中定义的信息之外，还有请求和响应的头信息；
- FULL：除了 HEADERS 中定义的信息之外，还有请求和响应的正文及元数据。

通过配置类的方式进行配置（注意这里的 Logger 是属于 Feign 包下的）：

```java
@Configuration
public class FeignConfiguration {
    
    @Bean
    Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
}
```

上述配置会将 Feign 自身的日志级别设置为详细日志。

如果想要针对每个 Feign 客户端做一些定制化日志配置，可以通过配置文件中指定 Feign 的日志配置：

```yaml
logging:
  level:
    # 指定feign 客户端日志级别
    io.naivekyo.springcloud.client.PaymentFeignService: DEBUG
```

注意这里指定的是 Feign 客户端的全类名。

此时测试接口，我们就可以在控制台日志中看到 HTTP 请求的详细情况。

