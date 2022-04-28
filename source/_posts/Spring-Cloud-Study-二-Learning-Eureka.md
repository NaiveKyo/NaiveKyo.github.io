---
title: Spring Cloud Study (二) Learning Eureka
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221537.jpg'
coverImg: /img/20220225221537.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-26 23:30:16
summary: "Spring Cloud 学习(二): Eureka 服务注册与发现"
categories: "Spring Cloud"
keywords: ["Spring Cloud", "Eureka"]
tags: "Spring Cloud"
---

# Eureka

# 一、什么是服务治理

Spring Cloud 封装了 Netflix 公司开发的 Eureka 模块来实现 **服务治理**。

在传统的 RPC 远程调用框架汇总，管理每个服务与服务之间依赖关系比较复杂，管理比较复杂，所以需要使用服务治理，管理服务与服务之间的依赖关系，可以实现服务调用、负载均衡、容错等等，实现服务发现与注册。

Eureka 采用了 CS 的设计架构，Eureka Server 作为服务注册功能的服务器，它是服务注册中心。而系统中的其他服务，使用 Eureka 的客户端连接到 Eureka Server 并维持 **心跳连接**。这样系统的维护人员就可以通过 Eureka Server 来监控系统中各个微服务是否正常运行。

在服务注册与发现中，有一个注册中心。当服务器启动的时候，会把当前自己的服务器的信息，比如服务地址、通讯地址等等以别名的方式注册到注册中心上。另一方（消费者|服务提供者），以该别名的方式去注册中心上获取到实际的服务通讯地址，然后再实现本地 RPC 调用。

RPC 远程调用框架的核心设计思想：在于注册中心，因为使用注册中心管理每个服务于服务之间的一个依赖关系（服务治理概念）。在任何 RPC 远程框架中，都会有一个注册中心（存放服务地址相关信息）。

下图分别是 Eureka（左） 和 Dubbo（右） 的架构：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220426160624.png)

# 二、Eureka 简介

## 1、Eureka 服务端和客户端

Eureka 包括两个组件：`Eureka Server` 和 `Eureka Client`：

> Eureka Server

`Eureka Server` 提供服务注册服务。

各个微服务节点通过配置启动后，会在 EurekaServer 中进行注册，这样 EurekaServer 中的服务注册表中将会存储所有可用服务节点的信息，服务节点的信息可以在界面中直观的看到。



> Eureka Client

`Eureka Client` 通过注册中心进行访问。

它是一个 Java 客户端，用于简化 Eureka Server 的交互，客户端同时也具备一个内置的、使用轮询（round-robin）负载算法的负载均衡器。

在应用启动后，将会向 Eureka Server 发送心跳（默认周期为 30秒）。如果 Eureka Server 在多个心跳周期内没有接收到某个节点的心跳，EurekaServer 将会从服务注册表中把这个服务节点移除（默认 90秒）。

## 2、版本说明

### Eureka Server

在 2018 年之前使用的是 1.x 版本：

```xml
<dependency>
	<groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-eureka</artifactId>
</dependency>
```

现在的新版本 2.x：

```xml
<dependency>
	<groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

### Eureka Client

```xml
<dependency>
	<groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-eureka</artifactId>
</dependency>
```

新版本：

```xml
<dependency>
	<groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```



# 三、Eureka 单机构建

## 1、创建 Eureka Server 模块

新建模块：`cloud-eureka-server`

导入依赖：

```xml
<!-- 自定义公共模块 -->
<dependency>
    <groupId>io.github.naivekyo</groupId>
    <artifactId>cloud-api-commons</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>

<!-- eureka server -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
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

<!-- devtools -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>

<!-- test -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

配置类：

```yml
server:
  port: 7001
eureka:
  instance:
    hostname: localhost  # Eureka 服务端的实例名称
  client:
    register-with-eureka: false  # false 表示不向注册中心注册自己
    fetch-registry: false  # false 表示当前服务就是注册中心, 主要职责是维护服务实例, 不需要去检索服务
    service-url: # 该属性是一个 map, 设置与 Eureka Server 交互的地址查询服务和注册服务都需要依赖这个地址
     defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka
```

主启动类：

```java
@EnableEurekaServer
@SpringBootApplication
public class EurekaServer7001 {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServer7001.class, args);
    }
}
```

我们创建的是 Eureka Server 组件，所以需要使用注解 `@EnableEurekaServer` 来标明。

浏览器访问：`localhost:7001`

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220426163215.png)

说明 Eureka 服务注册中心构建成功。

由于我们还没有在注册中心上注册服务，所以 Instances 下面是空的。

## 2、服务注册

> 支付模块

在支付模块需要增加新的依赖：

```xml
<!-- Eureka client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

在配置文件中也需要为当前服务模块配置一个名称，同时也需要增加一些 Eureka 客户端的配置信息：

```yml
server:
  port: 8001
  
spring:
  application:
    name: cloud-payment-service # 服务名称
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
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    
eureka:
  client:
    # 表示是否将自己注册到 EurekaSever, 默认为 true
    register-with-eureka: true 
    # 是否从 EurekaServer 中抓取已有的注册信息, 默认为 true。单节点无所谓, 集群必须设置为 true 才能配置 ribbon 使用负载均衡
    fetch-registry: true
    # 下面配置的就是 EurekaServer 的地址
    service-url: 
      defaultZone: http://localhost:7001/eureka
```

主启动类上添加 `@EnableEurekaClient` 注解表明自己是 Eureka Client：

```java
@EnableEurekaClient
@SpringBootApplication
public class PaymentService8001 {

    public static void main(String[] args) {
        SpringApplication.run(PaymentService8001.class, args);
    }
}
```

在 Eureka Server 模块已启动的前提下启动订单模块，浏览器访问 Eureka Server 的 web 端：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220426164706.png)

可以看到实例列表中出现了支付模块，名称是前面设置的服务名的大写。

上面出现了红色的警告文字，这是 Eureka 的自我保护机制，后面再介绍。

> 客户消费模块注册

以同样的方式将客户消费服务模块注册到 Eureka Server。

导入依赖；

配置文件：

```yml
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
      defaultZone: http://localhost:7001/eureka
```

主启动类上添加注解。



# 四、Eureka 集群构建

## 1、Eureka 集群原理说明

前面已经了解了 Eureka 的架构，主要分为三部分：Eureka Server、Service Provider、Service Consumer

Eureka Server 的作用：

- 服务注册：将服务信息注册到注册中心；
- 服务发现：从注册中心上获取服务信息
  - 实质：以 key  value 的方式保存服务信息：key 服务名 -> value 调用地址

而 Service Provider 和 Service Consumer，我们以前面的客户订单和订单支付两个模块为例：

（1）先启动 Eureka 注册中心；

（2）启动服务提供者 payment 支付服务；

（3）支付服务启动后会把自身信息（比如服务地址以别名方式注册到 Eureka Server；

（4）消费者 order 服务再需要调用接口时，使用服务别名去注册中心获取实际的 RPC 远程调用地址；

（5）消费者获得调用地址后，底层实际利用了 `HttpClient` 技术实现远程调用；

（6）消费者获得服务地址后会缓存再本地 JVM 内存中，默认每间隔 30 秒更新一次服务调用地址。



提个问题：微服务 RPC 远程服务调用最核心的是什么？

A：高可用，试想如果我们只有一个注册中心，如果该服务器宕机了或者其他原因导致服务停止，此时就会导致整个服务环境不可用。

解决方法：搭建 Eureka 注册中心集群，实现负载均衡 + 故障容错

那么如何去搭建注册中心集群呢，关键就在于让注册中心两两相互注册，最后统一向外界暴露一个注册中心地址。

## 2、Eureka Server 集群构建

在前面已有的一个注册中心的基础上再新增一个注册中心模块：`cloud-eureka-server7002`

- 导入依赖：和 7001 模块的完全一致；
- 主启动类：

```java
@EnableEurekaServer
@SpringBootApplication
public class EurekaServer7002 {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServer7002.class, args);
    }
}
```

- 前置准备：修改域名解析文件

当前是在 windows 环境，所以去修改 hosts 文件（路径：`C:\Windows\System32\drivers\etc`）：

在最后面添加两行：

```
127.0.0.1 eureka7001.com
127.0.0.1 eureka7002.com
```

<mark>如果没有权限保存，可先右键属性，然后为当前账户添加权限，之后修改文件后保存到其他目录，然后将文件复制到 etc 下直接覆盖</mark>

- 最后修改两个 Eureka Server 模块的配置文件

eureka7001 server:

```yml
server:
  port: 7001
  
eureka:
  instance:
    hostname: eureka7001.com  # Eureka 服务端的实例名称
  client:
    register-with-eureka: false 
    fetch-registry: false  
    service-url: 
     defaultZone: http://eureka7002.com:7002/eureka
```

eureka7002 server:

```yml
server:
  port: 7002
  
eureka:
  instance:
    hostname: eureka7002.com 
  client:
    register-with-eureka: fals
    fetch-registry: false 
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka
```

可以看到 hostname 和 defaultZone 的变化，这就是相互注册。

那么如果部署的三台 Eureka Server 注册中心又该如何配置的，注意 `defaultZone` 是一个 Map 类型的数据，查看源码可以看到它绑定的属性上面的注释，注释中提示我们该值可以使用一个 URL 或者使用逗号分割的可选位置列表：

```yml
service-url:
 defaultZone: http://xxx1:xxx/eureka, http://xxx1:xxx/eureka, http://xxx1:xxx/eureka
```

最后，关闭所有服务，然后依次启动 Eureka7001、Eureka7002 模块，在浏览器中通过：

- `http://eureka7001.com:7001/`
- `http://eureka7002.com:7002/`

分别访问 Eureka 的页面，可以看到在 General Info 栏下面可以看到其他注册中心的信息，比如在 7001 中：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220426175913.png)

可以看到 `DS Replicas`显示的是 7002 的信息，而且之前的红色警告也消失了。

## 3、注册服务

如果想要将我们的其他服务注册到集群的注册中心，需要对配置文件进行修改，比如之前的订单支付服务模块：

```yml
eureka:
  client:
    # 表示是否将自己注册到 EurekaSever, 默认为 true
    register-with-eureka: true 
    # 是否从 EurekaServer 中抓取已有的注册信息, 默认为 true。单节点无所谓, 集群必须设置为 true 才能配置 ribbon 使用负载均衡
    fetch-registry: true
    # 下面配置的就是 EurekaServer 集群注册中心的地址
    service-url: 
      defaultZone: http://eureka7001.com:7001/eureka,http://eureka7002.com:7002/eureka
```

客户订单模块也是一样的。

## 4、测试

集群（模拟）搭建完成后，先启动注册中心集群，然后启动服务提供者，最后启动服务消费者。

浏览器输入：`http://localhost/consumer/payment/get/1` 查询成功。

## 5、负载均衡

为了演示负载均衡效果，还需要再创建一个支付模块，`cloud-provider-payment8002`，内容和 `cloud-provider-payment8001` 一样，只不过需要修改配置文件中的端口号，注意 **服务名称和 payment8001 一样**：

此时启动所有服务后，我们可以在注册中心的 Instances 中发现名为 `cloud-payment-server` 的服务有两个存活的实例。

此时我们在浏览器访问 `http://localhost/consumer/payment/get/1` api，会发现调用一直是端口号为 8001 的服务，这是因为在客户订单消费者服务的接口是写死的：

```java
public static final String PAYMENT_URL = "http://localhost:8001";
```

现在需要把地址改为服务名（<strong style="color:red">注意服务名必须大写</strong>）：

```java
public static final String PAYMENT_URL = "http://CLOUD-PAYMENT-SERVICE";
```

改成这样后重启订单消费者服务，调用接口会发现抛出异常，这是因为同一个服务名下面有多个服务实例，调用 api 时不能确定调用的究竟是哪一个。

解决方法：开启 `RestTemplate` 的负载均衡功能（使用 `@LoaderBalance` 注解，具体原理则是通过调用 `Ribbon` 完成的）。

```java
@Configuration
public class ApplicationContextConfig {
    
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

最后重启服务进行测试，反复发起请求会发现名为 `CLOUD-PAYMENT-SERVICE` 的服务下的所有实例会轮流处理请求。

这是因为默认的负载均衡策略采用的是轮询算法，服务实例轮流处理请求。

## 6、总结

`Ribbon` 和 `Eureka` 整合后消费者服务就可以直接调用服务而不必在关心地址和端口号了，且服务具有负载功能。



# 五、Actuator 信息完善

## 1、主机名:服务名称修改

以 order 服务为例，在 Eureka 注册中心上显示的信息是这样的 `CLOUD-ORDER-SERVICE  localhost:cloud-order-service:80`，我们想要显示具体的主机名称和服务名称，需要进行修改。

前提是导入依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

以 payment8001 为例，在配置文件中添加以下配置：

```yml
eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka,http://eureka7002.com:7002/eureka

  instance:
    instance-id: payment8002
```

`instance-id` 配置。

重启服务，此时 Eureka 注册中心显示的信息为：`CLOUD-PAYMENT-SERVICE   payment8002,payment8001`。

企业中需要更规范的命名。

## 2、IP 信息显示

现在将鼠标悬停到对应的服务实例名称上，不会显示 ip 地址，可以增加以下配置：

```yaml
eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka,http://eureka7002.com:7002/eureka

  instance:
    instance-id: payment8002
	prefer-ip-address: true
```



# 六、服务发现 Discovery

Q：服务发现是什么？

A：对于注册到 Eureka 里面的微服务，可以通过服务发现来获得该服务的信息。

例子：在 `cloud-prodider-payment8001` 模块中写好接口用于提供自身的信息。

修改 payment8001 的 PaymentController：

```java
@RestController
@Slf4j
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @Value("${server.port}")
    private String serverPort;
    
    // 注意这个是 Spring Cloud 包下面的
    @Autowired
    private DiscoveryClient discoveryClient;
    
    // ......
    
    @GetMapping(value = "/payment/discovery")
    public Object discovery() {
        // 对应 Eureka 注册中心的 Application 下的信息
        List<String> services = this.discoveryClient.getServices();
        
        services.forEach(e -> {
            log.info("****** service : " + e);
        });
	
        // 对应 Eureka 注册中心的服务名对应的所有实例
        List<ServiceInstance> instances = this.discoveryClient.getInstances("CLOUD-PAYMENT-SERVICE");
        instances.forEach(i -> {
            log.info(i.getServiceId() + "\t" + i.getHost() + "\t" + i.getPort() + "\t" + i.getUri());
        });
        
        return this.discoveryClient;
    }
}
```

主启动类上加注解 `@EnableDiscoveryClient`（注意它也是 Spring Cloud 包下的）：

```java
@EnableEurekaClient
@EnableDiscoveryClient
@SpringBootApplication
public class PaymentService8001 {

    public static void main(String[] args) {
        SpringApplication.run(PaymentService8001.class, args);
    }
}
```

经过测试后我们发现，通过 DiscoveryClient 这个对象，我们便可以得到注册中心上所有服务的信息，这一点是很有用的。



# 七、Eureka 自我保护机制

## 1、概述

保护模式主要用于一组客户端和 Eureka Server 之间存在网络分区场景下的保护。

一旦进入保护模式，Eureka Server 将会尝试保护其服务注册表中的信息，不再删除服务注册表中的数据，也就是不会注销任何微服务。

当出现我们之前看到的红色警告的时候，就说明 Eureka 进入了保护模式。

简单概括：某时刻某一个微服务不能用了，Eureka 不会立即清理，依旧会对该微服务的信息进行保存，这也是一种高可用的思想应用。

<mark>这属于 CAP 里面的 AP 分支。</mark>

> 为什么会产生 Eureka 自我保护机制

为了放置 EurekaClient 可以正常运行，但是与 EurekaServer 网络不通的情况，此时 EurekaServer 不会立即将 EurekaClient 服务剔除。

> 什么是自我保护模式？

默认情况下，如果 EurekaServer 在一定时间内没有接收到某个微服务实例的心跳，EurekaServer 将会注销该实例（默认 90 秒）。但是当网络分区故障发生（延时、卡顿、拥挤）时，微服务与 EurekaServer 之间无法正常通信，以上行为可能变得非常危险了 —— 因为微服务本身其实是健康的，<font style="color:red">此时本不应该注销这个微服务</font>。Eureka 通过 "自我保护模式" 来解决这个问题 —— 当 EurekaServer 节点再短时间内丢失过多客户端时（可能发生了网络分区故障），那么这个节点就会进入自我保护模式。

<font style="color:red">在自我保护模式中，Eureka Server 会保护服务注册表中的信息，不会注销任何服务实例。</font>

它的设计哲学就是宁可保留错误的服务注册信息，也不盲目注销任何可能健康的服务实例。

综上：自我保护模式是一种应对网络异常的安全保护措施。它的架构哲学是宁可同时保留所有微服务（健康的微服务和不健康的微服务都会保留）也不盲目注销任何健康的微服务。使用自我保护模式，可以让 Eureka 集群更加的健壮、稳定。

## 2、禁用自我保护机制

Eureka 的自我保护机制是默认开启的，可以通过配置 `eureka.server.enable-self-preservation = false` 来关闭，例如我们以 Eureka Server 7001 服务为例，将其改为单机模式：

```yml
server:
  port: 7001
  
eureka:
  instance:
    hostname: eureka7001.com  # Eureka 服务端的实例名称
    instance-id: eureka-server7001
    prefer-ip-address: true
  client:
    register-with-eureka: false 
    fetch-registry: false  
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka # 单机
  server:
    enable-self-preservation: false # 关闭自我保护, 保证失联的服务实例被及时注销
    eviction-interval-timer-in-ms: 2000
#     defaultZone: http://eureka7002.com:7002/eureka # 集群
```

然后修改支付服务 payment8001 配置：

```yml
eureka:
  client:
    # 表示是否将自己注册到 EurekaSever, 默认为 true
    register-with-eureka: true
    # 是否从 EurekaServer 中抓取已有的注册信息, 默认为 true。单节点无所谓, 集群必须设置为 true 才能配置 ribbon 使用负载均衡
    fetch-registry: true
    # 下面配置的就是 EurekaServer 的地址
    service-url:
#      defaultZone: http://eureka7001.com:7001/eureka,http://eureka7002.com:7002/eureka
      defaultZone: http://eureka7001.com:7001/eureka # 切换为单机注册中心模式
      
  instance:
    instance-id: payment8001
    prefer-ip-address: true
    # Eureka 客户端向服务端发送心跳的时间间隔, 单位为秒(默认 30 秒)
    lease-renewal-interval-in-seconds: 1
    # Eureka 服务端在收到最后一次心跳后等待时间上限, 单位为秒(默认 90 秒), 超时则剔除服务
    lease-expiration-duration-in-seconds: 2
```

> 测试

首先启动 7001 注册中心：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220426232102.png)

可以看到红色警告：Eureka 已关闭自动保护机制。

然后启动 payment8001，刷新 Eureka 注册中心页面，可以看到服务实例列表出现 payment8001，之后我们手动关闭 payment8001 服务，刷新注册中心页面，此时服务实例 payment8001 会被立刻从服务列表中剔除。



# 八、Eureka 停更说明

查看 Eureka 官方 wiki：https://github.com/Netflix/eureka/wiki

可以看到 Eureka 2.0 已经停更了，现在已经不推荐使用，那么有什么替代方案吗？

答案是使用 Zookeeper 替换 Eureka。