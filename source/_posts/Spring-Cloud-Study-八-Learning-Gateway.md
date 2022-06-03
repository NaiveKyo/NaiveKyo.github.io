---
title: Spring Cloud Study (八) Learning Gateway
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221741.jpg'
coverImg: /img/20220225221741.jpg
cover: false
toc: true
mathjax: false
date: 2022-05-06 18:15:10
summary: "Spring Cloud 学习(八) API 网关 Gateway"
categories: "Spring Cloud"
keywords: "Spring Cloud"
tags: "Spring Cloud"
---

# Gateway

# 一、概述

Github：https://github.com/spring-cloud/spring-cloud-gateway

Spring 官网：https://spring.io/projects/spring-cloud-gateway#learn

2.2.9 RELEASE：https://docs.spring.io/spring-cloud-gateway/docs/2.2.9.RELEASE/reference/html/

## 1、Gateway 是什么

Spring Cloud 家族中有个很重要的组件就是网关，在 1.x 版本中都是采用的 Zuul 网关；

但是在 2.x 版本中，Zuul 的升级一直跳票，Spring Cloud 最后自己研发了一个网关替代 Zuul。

Gateway 是在 Spring 生态系统之上构建的 API 网关服务，基于 Spring 5、Spring Boot 2 和 Project Reactor 等技术。

Gateway 旨在提供一种简单而有效的方式来对 API 进行路由，以及提供一些强大的过滤器功能，例如：熔断、限流、重试等等。

Spring Cloud Gateway 作为 Spring Cloud 生态系统中的网关，目标是替代 Zuul，在 Spring Cloud 2.0 以前的版本中，使用的是 Zuul 1.x 非 Reactor 模式的老版本，为了提升网关的性能，Spring Cloud Gateway 是基于 WebFlux 框架实现的，而 WebFlux 框架底层则使用了高性能的 Reactor 模式的通信框架 Netty。（Webflux 的 reactor-netty 响应式编程组件，底层使用 Netty）

Spring Cloud Gateway 的目标是提供统一的路由方式且基于 Filter 链的方式提供了网关基本的功能，例如：安全、监控/指标 和限流。

## 2、Gateway 能做什么

- 反向代理
- 鉴权
- 流量控制
- 熔断
- 日志监控
- 等等

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220506101314.png)

## 3、为什么选择 Gateway

一方面因为 Zuul1.0 进入了维护阶段，而且 Gateway 是 Spring 团队研发的，与 Spring 框架的结合天生就有优势，值得信赖，而且很多功能比 Zuul 要更加强大便捷。

Gateway 是基于 <font style="color:red">异步非阻塞模型</font> 上进行研发的，性能方面不需要担心。虽然 Netflix 早就发布了 Zuul 2.x，但 Spring Cloud 现在也没有整合的意思。

多方面考虑 Gateway 是很理想的网关选择。

> Spring Cloud Gateway 特性

- <font style="color:red">基于 Spring Framework 5，Project Reactor 和 Spring Boot 2.0 进行构建</font>；
- 动态路由：能够匹配任何请求属性；
- 可以对路由指定 Predicate（断言）和 Filter（过滤器）；
- 集成 Hystrix 的断路器功能；
- 集成 Spring Cloud 服务发现功能；
- 易于编写的 Predicate（断言）和 Filter（过滤器）；
- 请求限流功能；
- 支持路径重写；

> Gateway 和 Zuul 的区别

在 Spring Cloud Finchley 版本出现之前，Spring Cloud 推荐的网关是 Netflix 提供的 Zuul：

- Zuul 1.x 是一个基于阻塞 I/O 的 API Gateway；
- Zuul 1.x 基于 <font style="color:red">Servlet 2.5 使用阻塞架构</font> 它不支持任何长连接（如 WebSocket），Zuul 的设计模式和 Nginx 很像，每次 I/O 操作都是从工作线程中选择一个来执行，请求线程被阻塞到工作线程完成，但是差别是 Nginx 使用 C++ 实现，Zuul 使用 Java 实现，而 JVM 本身会有第一次加载较慢的情况，使得 Zuul 的性能相对较差；
- Zuul 2.x 理念更加先进，想基于 Netty 非阻塞和支持长连接，但 Spring Cloud 目前还没有整合。Zuul 2.x 的性能较 Zuul 1.x 有较大提升。在性能方面，根据官方提供的基准测试，Spring Cloud Gateway 的 RPS（每秒请求数）是 Zuul 的 1.6 倍；
- Spring Cloud Gateway 建立在 Spring Framework 5、Project Reactor 和 Spring Boot 2 之上，使用非阻塞 API；
- Spring Cloud Gateway 还支持 WebSocket，并且与 Spring 紧密集成拥有更好的开发体验。

> Zuul 1.x 模型

Spring Cloud 中集成的 Zuul 版本，采用的是 Tomcat 容器，使用的是传统的 Servlet IO 处理模型。

这里提一下 Servlet 的生命周期：

- Servlet 被 Tomcat 的 Container 组件进行生命周期管理；
- Container 启动时构造 Servlet 对象并调用 servlet.init() 方法进行初始化；
- Container 运行时接受请求，并为每个请求分配一个线程（一般从线程池中获取空闲线程）然后调用 service() 方法处理请求；
- Container 关闭时调用 servlet.destory() 销毁 Servlet。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220506103525.png)

<mark>上述模式的缺点：</mark>

Servelt 是一个简单的网络 IO 模型，当请求进入 Servlet Container 时，Servlet Container 就会为其绑定一个线程，在 <font style="color:red">并发不高的场景下</font> 这种模型是适用的。但是一旦高并发，线程数量就会向上涨，而线程资源代价是昂贵的（上下文切换，内存消耗大）严重影响请求的处理时间。

在一些简单的业务场景下，不希望为每个 Request 分配一个线程，只需要 1 个或几个线程就能应对极大并发的请求，这种业务场景下 Servlet 模型没有优势。

所以 Zuul 1.x 是 <font style="color:red">基于 Servlet 之上的一个阻塞式处理模型</font>，即 Spring 实现了处理所有 Request 请求的一个 Servlet（DispatcherServlet）并由该 Servlet 阻塞式处理。所以 Spring Cloud Zuul 无法摆脱 Servlet 模型的弊端。

> Gateway 模型

传统的 Web 框架，比如说：struts2、springmvc 等都是基于 Servlet API 与 Servlet 容器基础之上运行的。但是 <font style="color:red">在 Servlet 3.1 之后有了异步非阻塞的支持</font>。而 WebFlux 是一个典型非阻塞异步的框架，它的核心是基于 Reactor 的相关 API 实现的。相对于传统的 web 框架来说，它可以运行在诸如 Netty，Undertow 及支持 Servlet 3.1 的容器上。非阻塞式 + 函数式编程（Spring 5 要求 JDK 必须在 1.8+）。

Spring WebFlux 是 Spring 5.0 引入的新的响应式框架，区别于 Spring MVC，它不需要依赖 Servlet API，它是完全异步非阻塞的，并且基于 Reactor 来实现响应式流规范。



# 二、三大核心概念

## 1、Route（路由）

路由是构建网关的基本模块，它由 ID，目标 URI，一系列的断言和过滤器组成，如果断言为 true 则匹配该路由。

## 2、Predicate（断言）

参考 Java8 的 `java.util.funcation.Predicate`

开发人员可以匹配 HTTP 请求中的所有内容（例如请求头或请求参数），<font style="color:red">如果请求与断言想匹配则进行路由</font>

## 3、Filter（过滤）

指的是 Spring 框架中 `GatewayFilter` 的实例，使用过滤器，可以在请求被路由之前或者之后对请求进行修改

## 4、总结

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220506113405.png)

Web 请求，通过一些匹配条件，定位到真正的服务节点。并在这个转发过程的前后，进行一些精细化控制。

Predicate 就是我们的匹配条件，而 Filter，就可以理解为一个无所不能的拦截器。有了这两个元素，再加上目标 URI，就可以实现一个具体的路由了。

# 三、Gateway 工作流程

官网介绍：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220506113619.png)

客户端向 Spring Cloud Gateway 发送请求。然后在 `Gateway Hanlder Mapping` 中找到和请求想匹配的路由，将其发送到 `Gateway Web Handler`。

Handler 再通过指定的过滤器链来将请求发送到我们实际的服务执行业务逻辑，然后返回。

过滤器之间使用虚线分开是因为过滤器可能会在发送代理请求之前（"pre"）或之后（"post"）执行业务逻辑。

- Filter 在 "pre" 类型的过滤器可以做参数校验、权限校验、流量控制、日志输出、协议转换等等；
- Filter 在 "post" 类型的过滤器中可以做响应内容、响应头的修改，日志的输出，流量监控等有着非常重要的作用。

<mark>核心逻辑：路由转发 + 执行过滤器链</mark>

# 四、入门案例

## 1、创建网关服务

新建 Module：`cloud-gateway-gateway9527`

pom：

```xml
<!-- gateway -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>

<!-- 不需要 web 依赖因为 Gateway 不使用 Servlet 模型，而是 WebFlux -->
<!--<dependency>-->
<!--    <groupId>org.springframework.boot</groupId>-->
<!--    <artifactId>spring-boot-starter-web</artifactId>-->
<!--</dependency>-->

<!-- Eureka client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

<dependency>
    <groupId>io.github.naivekyo</groupId>
    <artifactId>cloud-api-commons</artifactId>
    <version>${project.version}</version>
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
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

配置文件：

```yaml
server:
  port: 9527
  
spring:
  application:
    name: cloud-gateway

eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka
  instance:
    hostname: cloud-gateway-service
```

主启动类：

```java
@EnableEurekaClient
@SpringBootApplication
public class Gateway9527 {
    public static void main(String[] args) {
        SpringApplication.run(Gateway9527.class, args);
    }
}
```

## 2、配置路由映射

这里为了测试，在之前的任意服务 Provider 模块中添加两个方法：

```java
// 测试网关
@GetMapping("/payment/get")
public String paymentGatewayGet() {
    return "matching: /payment/get/** " + serverPort;
}

@GetMapping("/payment/lb")
public String paymentGatewayLB() {
    return "matching: /payment/lb/** " + serverPort;
}
```

然后在 Gateway 服务模块的配置文件添加配置：

```yaml
server:
  port: 9527
  
spring:
  application:
    name: cloud-gateway
  cloud:
    gateway:
      routes: # 是一个 List 类型的对象
        - id: payment_routh1   # 路由的 ID，没有固定规则但是要求必须唯一，建议和服务名一致
          uri: http://localhost:8001 # 匹配后提供服务的路由地址
          predicates: # 也是一个 List 对象
            - Path=/payment/get/**  # 断言，路径相匹配才可以进行路由
        - id: payment_routh2
          uri: http://localhost:8001
          predicates:
            - Path=/payment/lb/**
         
eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka
  instance:
    hostname: cloud-gateway-service
```

启动服务，开始测试：

- Eureka Server；
- Payment8001；
- Gateway9527；

浏览器输入 `http://localhost:9527/payment/lb` 直接访问即可，可以看到隐藏了服务提供者 8001 而是直接访问网关。

## 3、配置路由的两种方式

方式一：在配置文件中配置，比如例子中的

```yaml
spring:
  application:
    name: cloud-gateway
  cloud:
    gateway:
      routes: # 是一个 List 类型的对象
        - id: payment_routh1   # 路由的 ID，没有固定规则但是要求必须唯一，建议和服务名一致
          uri: http://localhost:8001 # 匹配后提供服务的路由地址
          predicates: # 也是一个 List 对象
            - Path=/payment/get/**  # 断言，路径相匹配才可以进行路由
        - id: payment_routh2
          uri: http://localhost:8001
          predicates:
            - Path=/payment/lb/**
```

方式二：硬编码，手动注入 RouteLocator 的 Bean

上面的配置信息等价于下面的代码：

```java
@Configuration
public class GatewayConfiguration {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("payment_routh", r -> r.path("/payment/get/**")
                        .uri("http://localhost:8001"))
                .route("payment_routh2", r -> r.path("/payment/lb/**")
                        .uri("http://localhost:8001"))
                .build();
    }
}
```

当然还有很多其他的配置，可以参见[官方文档](https://docs.spring.io/spring-cloud-gateway/docs/2.2.9.RELEASE/reference/html/#gateway-starter)。

## 4、通过服务名实现动态路由

默认情况下，Gateway 会根据注册中心注册的服务列表，以注册中心上微服务名称为路径创建 <font style="color:red">动态路由进行转发，从而实现动态路由的功能</font>。

现在，启动三个服务实例：

- Eureka Server 7001
- Service Provider 8001
- Service Provider 8002
- 注意：两个服务内均提供 get 和 lb 的测试接口

然后更改 Gateway 的配置文件（开启负载均衡功能）：

```yaml
spring:
  application:
    name: cloud-gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
      routes: # 是一个 List 类型的对象
        - id: payment_routh1   # 路由的 ID，没有固定规则但是要求必须唯一，建议和服务名一致
          uri: lb://cloud-payment-service # 匹配后提供服务的路由地址
          predicates: # 也是一个 List 对象
            - Path=/payment/get/**  # 断言，路径相匹配才可以进行路由
        - id: payment_routh2
          uri: lb://cloud-payment-service
          predicates:
            - Path=/payment/lb/**
```

此时 uri 的协议为 lb，表示启用 Gateway 的负载均衡效果。

浏览器访问：`http://localhost:9527/payment/lb` 此时会发现返回结果在 8001 和 8002 之间轮询。

## 5、Predicate 的使用

重启 Gateway 模块，在控制台启动日志中，我们可以看到这样的信息：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220506174256.png)

官网也有说明：https://docs.spring.io/spring-cloud-gateway/docs/2.2.9.RELEASE/reference/html/#gateway-request-predicates-factories

Spring Cloud Gateway 将路由匹配作为 Spring WebFlux HandlerMapping 基础架构的一部分。

Spring Cloud Gateway 包括许多内置的 Route Predicate 工厂。所有这些 Predicate 都与 HTTP 请求的不同属性匹配。多个 Route Predicate 工厂可以进行组合。

Spring Cloud Gateway 创建 Route 对象时，使用 RoutePredicateFactory 创建 Predicate 对象，Predicate 对象可以赋值给 Route。Spring Cloud Gateway 包含许多内置的 Route Predicate Factories。

所有这些谓词都匹配 HTTP 请求的不同属性。多种谓词工厂可以组合(逻辑 and)。

- `After Route Predicate`
  - 在指定时间之后路由生效
- `Before Route Predicate`
  - 在指定时间之前路由生效
- `Between Route Predicate`
  - 在给定的时间范围内路由生效
- `Cookie Route Predicate`
  - 分两种情况，带 Cookie 和不带 Cookie 访问
- `Header Route Predicate`
- `Host Route Predicate`
- `Method Route Predicate`
- `Path Route Predicate`
- `Query Route Predicate`

> 补充：使用 curl 访问接口

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220506175548.png)

# 五、Filter

## 1、Gateway Filter 是什么？

官网：https://docs.spring.io/spring-cloud-gateway/docs/2.2.9.RELEASE/reference/html/#gatewayfilter-factories

路由过滤器可用于修改进入的 HTTP 请求和返回的 HTTP 响应，路由过滤器只能指定路由进行使用。

Spring Cloud Gateway 内置了多种路由过滤器，他们都通过 GatewayFilter 的工厂类来产生。



## 2、路由过滤器

生命周期：pre 和 post（之前和之后）

种类：

- GatewayFilter
- GlobalFilter

## 3、自定义过滤器

自定义全局 `GlobalFilter`：

两个接口：

- `GlobalFilter`、`Ordered`

作用：

- 全局日志记录
- 统一网关鉴权
- 等等

> 例子：自定义日志过滤器

模拟阻止非法用户访问：

```java
@Component
@Slf4j
public class GlobalLogGatewayFilter implements GlobalFilter, Ordered {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("********* GlobalLogGatewayFilter: " + new Date());
        
        String uname = exchange.getRequest().getQueryParams().getFirst("uname");
        if (uname == null) {
            log.info("****** 用户名为 null, 非法用户, QaQ");
            exchange.getResponse().setStatusCode(HttpStatus.NOT_ACCEPTABLE);
            
            return exchange.getResponse().setComplete();
        }
        // 过滤器链
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        // 值越小优先级越高
        return 0;
    }
}
```

启动服务：

- Eureka Server
- Provider 8001
- Provider 8001
- Gateway 9527

浏览器访问：`http://localhost:9527/payment/lb?uname=fadsf` 可以访问，但是如果不加参数则直接无法访问。