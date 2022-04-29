---
title: Spring Cloud Study (五) Learning Ribbon
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221704.jpg'
coverImg: /img/20220225221704.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-29 23:22:17
summary: "Spring Cloud 学习(五): 负载均衡 Ribbon"
categories: "Spring Cloud"
keywords: ["Spring Cloud", "Ribbon"]
tags: "Spring Cloud"
---

# Ribbon 负载均衡

# 一、测试环境

开启 Eureka 注册集群（注意修改配置文件，开启自我保护机制）：

- EurekaServer7001

```yaml
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
      #defaultZone: http://eureka7001.com:7001/eureka # 单机
      defaultZone: http://eureka7002.com:7002/eureka # 集群
#  server:
#    enable-self-preservation: false # 关闭自我保护, 保证失联的服务实例被及时注销
#    eviction-interval-timer-in-ms: 2000
```

- EurekaServer7002

```yaml
server:
  port: 7002
  
eureka:
  instance:
    hostname: eureka7002.com
  client:
    register-with-eureka: false
    fetch-registry: false
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka
```

开启两个服务提供者（注意集群注册）：

- payment8001
- payment8002

```yaml
eureka:
  client:
    # 表示是否将自己注册到 EurekaSever, 默认为 true
    register-with-eureka: true
    # 是否从 EurekaServer 中抓取已有的注册信息, 默认为 true。单节点无所谓, 集群必须设置为 true 才能配置 ribbon 使用负载均衡
    fetch-registry: true
    # 下面配置的就是 EurekaServer 的地址
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka,http://eureka7002.com:7002/eureka
```

开启服务消费者（注意集群配置）：

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
    instance-id: consumer-order
    prefer-ip-address: true
```



# 二、Ribbon 

## 1、Ribbon 简介

Spring Cloud Ribbon 是基于 Netflix Ribbon 实现的一套客户端负载均衡的工具。

简单来说，Ribbon 是 Netflix 发布的开源项目，主要功能是提供客户端的软件负载均衡算法和服务调用。Ribbon 客户端组件提供一系列完善的配置项如连接超时，重试等等，就是在配置文件中列出 Load Balancer（简称 LB）后面所有的机器，Ribbon 会自动的帮助你基于某种规则（如简单轮询、随机连接等等）去连接这些机器。我们很容易使用 Ribbon 实现自定义的负载均衡算法。

<mark>注意：Ribbon 目前也进入了维护阶段。</mark>

Github：https://github.com/Netflix/ribbon

WIKI：https://github.com/Netflix/ribbon/wiki

## 2、负载均衡

### （1）概念

> LB 负载均衡是什么？

简单来说就是将用户的请求平摊的分配到多台服务上，从而达到系统的 HA（高可用）。

常见的负载均衡有：Nginx，LVS，硬件 F5 等。

> Ribbon 本地复杂均衡客户端 VS Nginx 服务器负载均衡区别

Nginx 是服务器负载均衡，客户端所有请求都会交给 Nginx，然后由 Nginx 实现转发请求。即负载均衡是由服务端实现的。

Ribbing 本地负载均衡，在调用微服务接口的时候，会在注册中心上获取注册信息服务列表之后缓存到 JVM 本地，从而在本地实现 RPC 远程服务调用技术。



### （2）LB 分类

> 集中式 LB

即在服务的消费方和提供方之间使用独立的 LB 设施（可以是硬件，比如 F5，也可以是软件，如 Nginx），由该设施负责把访问请求通过某种策略转发至服务的提供方；

> 进程内 LB

将 LB 逻辑集成到消费方，消费方从服务注册中心获知有哪些地址可用，然后自己再从这些地中选择出一个合适的服务器。

Ribbon 就属于进程内 LB，它只是一个类库，集成于消费方进程，消费方通过它来获取到服务提供方的地址。

### （3）总结

之前我们利用 `@LoadBalanced` 注解结合 `RestTemplate` 实现了轮询复杂均衡。

## 3、测试负载均衡

### （1）架构说明

Ribbon 是一个软负载均衡的客户端软件，它可以和其他服务进行结合使用，比如 Eureka。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220428235843.png)

Ribbon 在工作时分为两步：

- 第一步先选择 EurekaServer，它优先选择在同一区域内负载较少的 server；
- 第二部再根据用户指定的策略，在从 server 获取到的服务注册列表中选择一个地址。

其中 Ribbon 提供了多种策略：比如轮询、随机和根据响应时间加权。

### （2）jar 包

```xml
<!-- Eureka client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

新版的 Eureka client 已经集成了 Netflix-Ribbon。

### （3）RestTemplate 的使用

常用请求：

- Get 请求：
  - 方法：`getForObject` 和 `getForEntity`
- Post 请求：
  - 方法：`postForObject` 和 `postForEntity`

> 方法区别：

返回对象为响应体中数据转化的对象，基本上可以理解为 JSON，此时使用 Object。

返回对象为 `ResponseEntity` 对象，包含了响应的一些重要信息，比如响应头、响应状态码、响应体等，使用 Entity。

```java
@GetMapping("/consumer/payment/get/{id}")
public CommonResult<Payment> getPaymentById(@PathVariable("id") Long id) {

    return this.restTemplate.getForObject(PAYMENT_URL + "/payment/get/" + id, CommonResult.class);
}

@GetMapping("/consumer/payment/get-entity/{id}")
public CommonResult<Payment> getEntityById(@PathVariable("id") Long id) {

    ResponseEntity<CommonResult> entity = this.restTemplate.getForEntity(PAYMENT_URL + "/payment/get/" + id, CommonResult.class);

    if (entity.getStatusCode().is2xxSuccessful()) {
        return entity.getBody();
    } else {
        return new CommonResult<>(444, "操作失败!");
    }
}
```

## 4、Ribbon 负载均衡算法

### （1）核心组件 IRule 及默认实现

这里涉及到一个接口：`IRule`，根据特定算法从服务列表中选取一个要访问的服务。

```java
// com.netflix.loadbalancer.IRule

public interface IRule{
    /*
     * choose one alive server from lb.allServers or
     * lb.upServers according to key
     * 
     * @return choosen Server object. NULL is returned if none
     *  server is available 
     */

    public Server choose(Object key);
    
    public void setLoadBalancer(ILoadBalancer lb);
    
    public ILoadBalancer getLoadBalancer();    
}
```

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220429143005.png)

- `AbstractLoadBalancerRule`：抽象类，实现了 `IRule` 接口中提供了设置和获取 LB 的方法；
- `RoundRobinRule`：默认的轮询算法实现类；
- `WeightedResponseTimeRule`：加权轮询算法实现类：响应速度越快的实例选择权重越大，越容易被选择；
- `RandomRule`：随机选择算法实现类；
- `RetryRule`：先按照 `RoundRobinRule` 的粗略获取服务，如果获取失败则在指定时间内会重新尝试获取；
- `BestAvailableRule`：会优先过滤掉由于多次访问故障而处于断路器跳闸状态的服务，然后选择并发量最小的服务；
- `AvailablityFilteringRule`：先过滤掉故障实例，然后选择并发较小的实例；
- `ZoneAvoidanceRule`：默认规则，复合判断 server 所在区域的性能和 server 的可用性来选择服务器。

### （2）替换负载均衡策略

在 Spring 官网，Spring Cloud Netflix 的 2.x 版本的文档中可以看到有关 Ribbon 的介绍：https://docs.spring.io/spring-cloud-netflix/docs/2.2.10.RELEASE/reference/html/#spring-cloud-ribbon

我们可以通过 Java Base Config 的方式提供一个 Ribbon 的定制化配置类，例如下面：

```java
@Configuration
public class CustomRibbonRule {
    
    @Bean
    public IRule iRule() {
        return new RandomRule();
    }
}

```

但是有一点需要注意，这个配置类不能放在 `@ComponentScan` 扫描到的目录下面，因为这样会被所有的 RibbonClient 共享，就无法达到定制化的目的。

我们知道在 Spring Boot 中，主启动类上的 `@SpringBootApplication` 整合了 `@ComponentScan` 注解，它会将主启动类所在的目录及其所有子目录都进行扫描，注意 Ribbon 的配置类不要放在主启动类所在的包。

然后在主启动类上添加：

```java
@RibbonClient(name = "CLOUD-PAYMENT-SERVICE", configuration = CustomRibbonRule.class)
@EnableEurekaClient
@SpringBootApplication
public class OrderService80 {
    public static void main(String[] args) {
        SpringApplication.run(OrderService80.class, args);
    }
}
```

通过 `@RibbonClient` 单独引入 Ribbon 的定制化配置类，这样就完成了对 `CLOUD-PAYMENT-SERVICE` 服务的负载均衡定制化配置。

### （3）Ribbon 负载均衡算法

> 轮询算法

负载均衡算法：rest 接口第几次请求数 % 服务器集群总数量 = 实际调用服务器位置下标，每次服务重启后 rest 接口计数从 1 开始；

`List<ServiceInstance> instances = discoveryClient.getInstances("CLOUD-PAYMENT-SERVICE");`

比如：

```java
List[0] instance = 127.0.0.1:8002
List[1] instance = 127.0.0.1:8001
```

8001 和 8002 组成集群，总计 2 台机器，集群总数为 2，按照轮询算法原理：

| 同一 REST 接口请求数 | List 下标 | 服务地址       |
| -------------------- | --------- | -------------- |
| 1                    | 1 % 2 = 1 | 127.0.0.1:8002 |
| 2                    | 2 % 2 = 0 | 127.0.0.1:8001 |
| 3                    | 3 % 2 = 1 | 127.0.0.1:8002 |
| 。。。               | 。。。    | 。。。         |

 当某台机器重启后，接口请求数重新置为 1。

> 源码分析

```java
// com.netflix.loadbalancer.IRule
public interface IRule{

    // 根据负载均衡策略得到服务实例
    public Server choose(Object key);
    
    public void setLoadBalancer(ILoadBalancer lb);
    
    public ILoadBalancer getLoadBalancer();    
}
```

```java
// com.netflix.loadbalancer.RoundRobinRule
public class RoundRobinRule extends AbstractLoadBalancerRule {
    
	private AtomicInteger nextServerCyclicCounter;
    
    public RoundRobinRule() {
        // 原子计数器，初始值为 0
        nextServerCyclicCounter = new AtomicInteger(0);
    }
    
    public Server choose(ILoadBalancer lb, Object key) {
        // 如果没有配置负载均衡，就提示警告信息
        if (lb == null) {
            log.warn("no load balancer");
            return null;
        }

        Server server = null;
        int count = 0;
        while (server == null && count++ < 10) {
            // 获取所有状态为 up 的服务实例, 也就是存活的且可访问的服务实例
            List<Server> reachableServers = lb.getReachableServers();
            // 集群实例总数
            List<Server> allServers = lb.getAllServers();
            int upCount = reachableServers.size();
            int serverCount = allServers.size();

            if ((upCount == 0) || (serverCount == 0)) {
                log.warn("No up servers available from load balancer: " + lb);
                return null;
            }

            // 重点在这个方法
            int nextServerIndex = incrementAndGetModulo(serverCount);
            server = allServers.get(nextServerIndex);

            if (server == null) {
                /* Transient. */
                Thread.yield();
                continue;
            }

            if (server.isAlive() && (server.isReadyToServe())) {
                return (server);
            }

            // Next.
            server = null;
        }

        if (count >= 10) {
            log.warn("No available alive servers after 10 tries from load balancer: "
                    + lb);
        }
        return server;
    }
    
    private int incrementAndGetModulo(int modulo) {
        // 自旋锁
        for (;;) {
            int current = nextServerCyclicCounter.get();
            int next = (current + 1) % modulo;
            // CAS
            if (nextServerCyclicCounter.compareAndSet(current, next))
                return next;
        }
    }
}
```

### （4）手写负载均衡算法

原理：自旋锁 + CAS

首先去掉 order80 服务中注入 RestTemplate 时标注的 `@LoadBalanced` 注解，然后提供一个接口：

```java
@Configuration
public class ApplicationContextConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

然后模仿 `IRule` 及 `RoundRobinRule`，我们也自定义一个接口和其实现类：

```java
public interface LoadBalancer {
    ServiceInstance instances(List<ServiceInstance> serviceInstances);
}

@Component
public class MyLB implements LoadBalancer{
    
    private AtomicInteger atomicInteger = new AtomicInteger(0);
    
    public final int getAndIncrement() {
        int current;
        int next;
        
        do {
            current = this.atomicInteger.get();
            next = current >= 2147483647 ? 0 : current + 1;
        } while (!this.atomicInteger.compareAndSet(current, next));

        System.out.println("**** 第几次访问次数 next = " + next);
        
        return next;
    }
    
    @Override
    public ServiceInstance instances(List<ServiceInstance> serviceInstances) {

        int index = getAndIncrement() % serviceInstances.size();
        
        return serviceInstances.get(index);
    }
    
}
```

其实现原理还是 自旋锁 + CAS；

最后在 Controller 中测试：

```java
@RestController
@Slf4j
public class OrderController {
        
    @Autowired
    private RestTemplate restTemplate;
    
    @Resource
    private LoadBalancer loadBalancer;
    
    @Resource
    private DiscoveryClient discoveryClient;
    

    @GetMapping("/consumer/payment/lb/get/{id}")
    public CommonResult<Payment> getPaymentByIdWithLB(@PathVariable("id") Long id) {

        List<ServiceInstance> list = this.discoveryClient.getInstances("CLOUD-PAYMENT-SERVICE");
        if (list == null || list.size() <= 0) {
            return null;
        }

        ServiceInstance instances = this.loadBalancer.instances(list);
        URI uri = instances.getUri();

        return this.restTemplate.getForObject(uri + "/payment/get/" + id, CommonResult.class);
    }
    
}
```

在浏览器测试：`http://localhost/consumer/payment/lb/get/1`

控制台提示：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220429155455.png)

测试成功。