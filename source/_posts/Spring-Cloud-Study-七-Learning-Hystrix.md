---
title: Spring Cloud Study (七) Learning Hystrix
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221724.jpg'
coverImg: /img/20220225221724.jpg
cover: false
toc: true
mathjax: false
date: 2022-05-05 21:07:22
summary: "Spring Cloud 学习(七): 服务熔断 Hystrix"
categories: "Spring Cloud"
keywords: "Spring Cloud"
tags: "Spring Cloud"
---

# Hystrix

github：https://github.com/Netflix/Hystrix

wiki：https://github.com/Netflix/Hystrix/wiki

# 一、简介

## 1、分布式系统面临的问题

> 分布式系统面临的问题

复杂分布式体系结构中的应用程序有数十个依赖关系，每个依赖关系在某些时候将不可避免地出现问题甚至失败。

一旦某个节点出现问题，可能会导致整个服务链路出现问题。

> 服务雪崩

多个微服务之间调用的时候，假设微服务 A 调用微服务 B 和微服务 C，微服务 B 和微服务 C 又调用其他的微服务，这就是所谓的 <font style="color:red">"扇出"</font>（像一把折扇慢慢打开）。如果扇出的链路上某个微服务的调用响应时间过长或者不可用，对微服务 A 的调用就会占用越来越多的系统资源，进而引起系统崩溃，这就是所谓的 "雪崩效应"。

对于高流量的应用来说，单一的后端依赖可能会导致所有服务器上的所有资源都在几秒内饱和。比失败更糟糕的是，这些应用程序还可能导致服务之间的延迟增加，备份队列，线程和其他系统资源紧张，导致整个系统发生更多的级联故障。这些都表示需要对故障和延迟进行隔离和管理，以便单个依赖关系的失败，不能取消整个应用程序或系统。

所以，通常当你发现一个模块下的某个实例失败后，这时候这个模块以来还会接受流量，然后这个有问题的模块还调用了其他的模块，这样就会发生级联故障，或者叫雪崩。

## 2、Hystrix 是什么？

Hystrix 是一个用于分布式系统的 <font style="color:red">延迟</font> 和 <font style="color:red">容错</font> 的开源库，在分布式系统里，许多依赖不可避免的会调用失败，比如超时、异常等等，Hystrix 能够保证在一个依赖出问题的情况下，<font style="color:red">不会导致整体服务失败，避免级联故障，以提高分布式系统的弹性。</font>

"断路器" 本身是一种开关装置，当某个服务单元发生故障之后，通过断路器的故障监控（类似熔断保险丝），<font style="color:red">向调用方返回一个符合预期的、可处理的备选响应（FallBack），而不是长时间的等待或者抛出调用方无法处理的异常</font>，这样就保证了服务调用方的线程不会被长时间、不必要地占用，从而避免了故障在分布式系统中的蔓延，乃至雪崩。

## 3、Hystrix 的主要作用

- 服务降级
- 服务熔断
- 接近实时的监控
- 等等

<mark>注意 Hystrix 现在已经进入维护阶段，不在更新了。</mark>

但是它的很多设计理念指的我们学习，官网推荐我们使用 [resilience4j](https://github.com/resilience4j/resilience4j)，不过该框架在国外使用较多，国内倒是不常用，替换方案就是 Alibaba 的 [Sentinel](https://github.com/alibaba/Sentinel)。

# 二、Hystrix 重要概念

## 1、服务降级

例如，当服务出现问题，向调用方返回一个友好提示，fallback。

哪些情况会出现服务降级：

- 程序运行异常；
- 超时；
- 服务熔断触发服务降级；
- 线程池/信号量打满也会导致服务降级。



## 2、服务熔断

类比保险丝达到最大服务访问后，直接拒绝访问，拉闸限电，然后调用服务降级的方法并返回友好提示

就是保险丝：服务的降级 -> 进而熔断 -> 恢复调用链路。



## 3、服务限流

秒杀高并发等操作，严禁一窝蜂的过来拥挤，大家排队，一秒钟 N 个，有序进行。



# 三、案例

## 1、创建 Hystrix 服务提供模块

为了方便演示可以将 Eureka 设置为单机模式；

然后新建 cloud-provider-hystrix-paryment8001 模块（为了方便，去除数据库相关依赖）；

在 pom 中加上 hystrix 依赖：

```xml
<!-- hystrix -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
</dependency>
```

配置文件向 Eureka 注册中心进行注册；

主启动类；

service：

```java
@Service
public class PaymentService {

    /**
     * 正常访问的方法
     * @param id
     * @return
     */
    public String paymentInfo_OK(Integer id) {
        return "线程池: " + Thread.currentThread().getName() + " paymentInfo_OK, id: " + id + "\t OvO";
    }

    /**
     * 触发服务熔断的方法
     * 
     * @param id
     * @return
     */
    public String paymentInfo_TIME_OUT(Integer id) {
        int time = 3;
        try {
            TimeUnit.SECONDS.sleep(time);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return "线程池: " + Thread.currentThread().getName() + " paymentInfo_TIMEOUT, id: " + id + "\t OvO";
    }
}
```

controller：

```java
@RestController
@Slf4j
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @Value("${server.port}")
    private String serverPort;

    @GetMapping("/payment/hystrix/ok/{id}")
    public String paymentInfo_OK(@PathVariable("id") Integer id) {
        String res = this.paymentService.paymentInfo_OK(id);
        log.info("********** result: " + res);
        return res;
    }
    @GetMapping("/payment/hystrix/timeout/{id}")
    public String paymentInfo_TIME_OUT(@PathVariable("id") Integer id) {
        String res = this.paymentService.paymentInfo_TIME_OUT(id);
        log.info("********** result: " + res);
        return res;
    }
}
```

## 2、使用 JMeter 进行压力测试

> 下载并安装 JMeter

官网：https://jmeter.apache.org/download_jmeter.cgi

归档：https://archive.apache.org/dist/jmeter/

这里以 JMeter 5.4.3 为例，环境为 Windows，所以下载 zip 包，解压到指定目录（注意路径不要带中文）

下载解压后，配置环境变量：

- `JMETER_HOM=E:\tools\apache-jmeter-5.4.3`（即 JMeter 解压后的位置）
- `CLASSPATH=%JMETER_HOM%\lib\ext\ApacheJMeter_core.jar;%JMETER_HOM%\lib\jorphan.jar`
- 在系统变量 Path 中追加：`%JMETER_HOME%\bin`

启动 JMeter：

- 方式一：在 JMeter 的 bin 目录下点击 `jmeter.bat` 启动；
- 方式二：由于我们配置了环境变量，所以可以在任何地方打开 cmd 然后输入 jmeter 即可。

配置：

- JMeter 对国际化支持比较好， 可以在 option 中选择语言为简体中文；
- 可以在 option 中选择外观；
- 可以在 option 中放大或缩写界面。

测试计划：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220505101820.png)

开启 20000 个线程进行压测，接下来可以为我们的线程组添加 HTTP 请求取样器。

结果：

- 我们对延时接口进行压测的时候，如果在浏览器访问正常接口和延时接口，会发现两者都会出现延迟，这就是在高并发下的情况，延迟接口占据了大量服务器资源。
- 特殊的情况：接口卡死，这是因为 Tomcat 默认的工作线程被打满了，没有多余的线程来分担压力和处理请求。

## 3、创建消费者服务

新建模块： cloud-consumer-feign-hystrix-order80；

maven 依赖，引入 open-feign 和 hystrix

```xml
<!-- open feign -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>

<!-- hystrix -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
</dependency>

<!-- Eureka client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

配置文件：

```yaml
server:
  port: 80
  
eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka
      
ribbon:
  ReadTimeout: 5000
  ConnectionTimeout: 5000
```

主启动类：

```java
@EnableFeignClients
@EnableEurekaClient
@SpringBootApplication
public class ConsumerFeignHystrixOrder80 {
    public static void main(String[] args) {
        SpringApplication.run(ConsumerFeignHystrixOrder80.class, args);
    }
}
```

服务消费者：

```java
@FeignClient(value = "CLOUD-PROVIDER-HYSTRIX-PAYMENT")
@Component
public interface PaymentHystrixService {

    @GetMapping("/payment/hystrix/ok/{id}")
    String paymentInfo_OK(@PathVariable("id") Integer id);

    @GetMapping("/payment/hystrix/timeout/{id}")
    String paymentInfo_TIME_OUT(@PathVariable("id") Integer id);
    
}
```

此时如果再次进行压力测试，同时消费者服务又去访问服务提供者，就会出现超时错误，客户端访问响应缓慢。

正因为有了上述这些情况，才有我们的降级/容错/限流等技术的诞生。

## 4、问题分析

- 超时导致服务器变慢；
- 出错（当即或程序运行出错）；
- 解决思路：
  - 超时不再等待；—— 服务降级
  - 出错要有兜底；—— 服务降级
  - 服务提供者没问题，但是服务消费者自身出现问题或有自我要求（自己的等待时间小于服务提供者）；—— 自己处理降级

# 四、服务降级

## 1、服务提供者服务降级

官方样例（非注解）：https://github.com/Netflix/Hystrix/wiki/Getting-Started

注解：`@HystrixCommand`

- 服务提供者 8001：
  - 设置自身调用超时时间的峰值，峰值内可以正常运行，超过了就需要有兜底的方法处理，做服务降级 callback；
  - 使用  `@HystrixCommand` 注解指定 fallback 方法，当服务方法失败并抛出异常后会自动调用 fallback 方法，同时指定峰值时间

主启动类：添加 `@EnableCircuitBreaker` 开启断路器

```java
@EnableCircuitBreaker
@EnableEurekaClient
@SpringBootApplication
public class PaymentHystrixService8001 {
    public static void main(String[] args) {
        SpringApplication.run(PaymentHystrixService8001.class, args);
    }
}
```

业务类：

```java
// 指定 fallback 方法以及调用处理峰值时间
@HystrixCommand(fallbackMethod = "paymentInfo_TIME_OUTHandler", commandProperties = {
    @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "3000")
})
public String paymentInfo_TIME_OUT(Integer id) {
    int time = 5;
    // int age = 10 / 0;
    try {
        TimeUnit.SECONDS.sleep(time);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return "线程池: " + Thread.currentThread().getName() + " paymentInfo_TIMEOUT, id: " + id + "\t OvO";
}

public String paymentInfo_TIME_OUTHandler(Integer id) {
    return "线程池: " + Thread.currentThread().getName() + " paymentInfo_TIME_OUTHandler, id: " + id + "\t QaQ";
}
```

如果此时通过消费者访问该接口，如果超过了峰值时间或者抛出了异常就会触发超时方法



## 2、服务消费者服务降级

配置类：

```yaml
ribbon:
  ReadTimeout: 5000
  ConnectionTimeout: 5000
  
feign:
  hystrix:
    enabled: true
```

超时时间配置参考：Open Feign

主启动类：使用 `@EnableHystrix` 注解开启 Hystrix

```java
@EnableFeignClients
@EnableEurekaClient
@SpringBootApplication
@EnableHystrix
public class ConsumerFeignHystrixOrder80 {
    public static void main(String[] args) {
        SpringApplication.run(ConsumerFeignHystrixOrder80.class, args);
    }
}
```

业务类：

```java
@RestController
@Slf4j
public class OrderHystrixController {
    
    @Autowired
    private PaymentHystrixService paymentHystrixService;

    @GetMapping("/consumer/payment/hystrix/ok/{id}")
    public String paymentInfo_OK(@PathVariable("id") Integer id) {
        String res = this.paymentHystrixService.paymentInfo_OK(id);
        return res;
    }

    @GetMapping("/consumer/payment/hystrix/timeout/{id}")
    @HystrixCommand(fallbackMethod = "paymentInfoTimeoutFallbackMethod", commandProperties = {
            @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "1500")
    })
    public String paymentInfo_TIME_OUT(@PathVariable("id") Integer id) {
        String res = this.paymentHystrixService.paymentInfo_TIME_OUT(id);
        return res;
    }
    
    public String paymentInfoTimeoutFallbackMethod(Integer id) {
        return "我是消费者 80，对方支付系统繁忙请 10 秒钟后再试或者自身出现了问题，请及时排查。id :" + id;
    }
}
```

此时注意我们将消费者峰值时间设置为 1.5 s，为了方便测试，可以将提供者服务的峰值时间设置为 5 s，然后休眠 3 s，最终出问题的就在消费者服务。

浏览器访问接口 `http://localhost/consumer/payment/hystrix/timeout/11` 进行测试。

~~注意第一个案例中只有服务提供者触发了服务降级，而当前案例是服务提供者和消费者都会触发服务降级。~~

## 3、重构

> 问题一：每个方法都需要配置一个 Fallback，会造成代码膨胀

前面的写法将降级方法和接口写在一起，耦合度过高

解决思路：配置全局通用的服务降级 fallback 方法。

通过注解：`@DefaultProperties(defaultFallback="")` 指定默认的同一处理方法，如果有特殊的接口则可以使用前面的注解单独指定 fallback 方法。

```java
@RestController
@Slf4j
@DefaultProperties(defaultFallback = "payment_Global_FallbackMethod")
public class OrderHystrixController {
    
    @Autowired
    private PaymentHystrixService paymentHystrixService;

    @GetMapping("/consumer/payment/hystrix/ok/{id}")
    public String paymentInfo_OK(@PathVariable("id") Integer id) {
        String res = this.paymentHystrixService.paymentInfo_OK(id);
        return res;
    }

    @HystrixCommand
    @GetMapping("/consumer/payment/hystrix/timeout/{id}")
    public String paymentInfo_TIME_OUT(@PathVariable("id") Integer id) {
        String res = this.paymentHystrixService.paymentInfo_TIME_OUT(id);
        return res;
    }
    
    // 全局 fallback
    public String payment_Global_FallbackMethod() {
        return "Global 异常处理信息，请稍后再试。。。";
    }
}
```

> 问题二：Fallback 方法和业务方法写在一起，耦合度较高

使用 Feign 会定义多个 `@FeignClient` 注解标注的接口，里面定义了其他服务的接口，可以为其添加一个服务降级处理的实现类即可实现解耦。

使用 `@FeignClient` 的 `fallback` 属性指定实现类。

```java
@FeignClient(value = "CLOUD-PROVIDER-HYSTRIX-PAYMENT", fallback = PaymentHystrixServiceImpl.class)
@Component
public interface PaymentHystrixService {

    @GetMapping("/payment/hystrix/ok/{id}")
    String paymentInfo_OK(@PathVariable("id") Integer id);

    @GetMapping("/payment/hystrix/timeout/{id}")
    String paymentInfo_TIME_OUT(@PathVariable("id") Integer id);
}
```

```java
@Component
public class PaymentHystrixServiceImpl implements PaymentHystrixService {
    
    @Override
    public String paymentInfo_OK(Integer id) {
        return "--- PaymentHystrixService [paymentInfo_OK] fall back, QaQ";
    }

    @Override
    public String paymentInfo_TIME_OUT(Integer id) {
        return "--- PaymentHystrixService [paymentInfo_TIME_OUT] fall back, QaQ";
    }
}
```

启动服务提供者和消费者，然后关闭提供者服务，再次调用消费者接口，就会触发服务降级回调。

注意此时 `@HystrixCommand` 失效。

> 问题处理

常见的造成服务降级的情况：

- 运行时异常；
- 服务超时；
- 服务器宕机。



# 五、服务熔断

断路器：类似于保险丝

熔断是什么：

熔断机制是应对雪崩效应的一种微服务链路保护机制。当扇出链路的某个微服务出错不可用或者响应时间太长时，会进行服务的降级，进而熔断该节点微服务的调用，快速返回错误的响应信息。

<mark>当检测到该节点微服务调用响应正常后，恢复调用链路。</mark>

在 Spring Cloud 框架里，熔断机制通过 Hystrix 实现。Hystrix 会监控微服务间调用的情况，当失败的调用达到一定的阈值，缺省是 5 秒内 20 次调用失败，就会启动熔断机制。熔断机制的注解是 `@HystrixCommand`。

参考论文：https://martinfowler.com/bliki/CircuitBreaker.html

**里面介绍了断路器的状态切换图**（Open、Half Open、Closed）。

## 1、案例

提示：`com.netflix.hystrix.HystrixCommandProperties` 包含 `@HystrixCommand` 可以配置的所有属性

服务提供者 8001：

业务类 Service：

```java
// === 服务熔断
@HystrixCommand(fallbackMethod = "paymentCircuitBreaker_fallback", commandProperties = {
    @HystrixProperty(name = "circuitBreaker.enabled", value = "true"),  // 是否开启断路器
    @HystrixProperty(name = "circuitBreaker.requestVolumeThreshold", value = "20"), // 请求次数
    @HystrixProperty(name = "circuitBreaker.sleepWindowInMilliseconds", value = "10000"), // 时间窗口期
    @HystrixProperty(name = "circuitBreaker.errorThresholdPercentage", value = "60") // 失败率达到多少后跳闸
})
public String paymentCircuitBreaker(Integer id) {
    if (id < 0)
        throw new RuntimeException("***** id 不能为负数");

    // Hutool 工具类库
    String serialNumber = IdUtil.simpleUUID();

    return Thread.currentThread().getName() + "\t" + "调用成功，流水号: " + serialNumber;
}

public String paymentCircuitBreaker_fallback(Integer id) {
    return "id 不能为负数，请稍后再试，QaQ —— id : " + id;
}
```

控制器 Controller：

```java
// 服务熔断
@GetMapping("/payment/circuit/{id}")
public String paymentCircuitBreaker(@PathVariable("id") Integer id) {
    String result = this.paymentService.paymentCircuitBreaker(id);
    log.info("**** result: " + result);
    return result;
}
```

测试：

接口很简单，传递整数可以运行，传递负数就熔断，当在一次滑动窗口期时间范围内，错误率超过了 60% 断路器就进入断路状态，此时即使传递正确的参数还是会熔断，只有正确率慢慢回升（错误率下降）后，才会恢复正常。

## 2、总结

状态图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220505171104.png)

熔断类型：

- 熔断打开：请求不再进行调用当前服务，内部设置时钟一般为 MTTR（平均故障处理时间），当打开时常达到所设时钟则进入半熔断状态；
- 熔断关闭：熔断关闭不会对服务进行熔断；
- 熔断半开：部分请求根据规则调用当前服务，如果请求成功且符合规则则认为当前服务恢复正常，关闭熔断。

> 使用步骤

参考官网：https://github.com/Netflix/Hystrix/wiki/Configuration#circuit-breaker

> 断路器在什么情况下起作用？

涉及到断路器的三个重要参数：<mark>快照时间窗、请求总数阈值、错误百分比阈值</mark>

（1）快照时间窗：断路器确定是否打开需要统计一些请求和错误数据，而统计的时间范围就是快照时间窗，默认为最近的 10 秒；

（2）请求总数阈值：在快照时间窗内，必须满足请求的总数阈值才有资格熔断。默认为 20，意味着在 10 秒内，如果该 Hystrix 命令的调用次数不足 20 次，即使所有的请求都超时或其他原因失败，断路器都不会打开；

（3）错误百分比阈值：当请求总数在快照时间窗内超过了阈值，比如发生了 30 次调用，如果在这 30 次调用中，有 15 次发生了超时异常，也就是超过了 50% 的错误百分比，在默认设定 50% 阈值的情况下，这时候就会将断路器打开。

> 断路器开启或关闭的条件

1. 当满足了一定的阈值（默认 10 秒内超过 20 个请求次数）；
2. 当失败率达到了一定程度（默认 10 秒内超过 50% 的请求失败）；
3. 到达以上阈值，断路器将会开启。
4. 当开启的时候，所有请求都不会进行转发；
5. 一段时间后（默认是 5 秒），这个时候断路器是半开状态，会让其中一个请求进行转发，如果成功，断路器会关闭，若失败，继续开启。重复 4 和 5

> 断路器打开之后

（1）再有请求调用的时候，不会调用主逻辑，而是直接调用降级 fallback。通过断路器，实现了自动地发现错误并将降级逻辑切换为主逻辑，减少响应延迟的效果；

（2）原来的主逻辑要如何恢复？

Hystrix 也提供了自动恢复的机制：当断路器打开后，对主逻辑进行熔断，Hystrix 会启动一个休眠时间窗，在这个时间窗内，降级逻辑是临时的替换了主逻辑，当休眠时间窗到期，断路器将进入半开状态，释放一次请求到原来的主逻辑上，如果此次请求正常返回，那么断路器将会闭合，主逻辑恢复，如果这次请求依然有问题，断路器继续进入打开状态，休眠时间窗重新计时。

## 3、HystrixCommand 配置参数

```java
@HystrixCommand(fallbackMethod="str_fallbackMethod", groupKey="strGroupCommand", commandKey="strCommand", threadPoolKey="strThreadPool",
commandProperties = {
    // 设置隔离策略，THREAD 表示线程池；SEMAPHORE 表示信号量隔离
    @HystrixProperty(name="execution.isolation.strategy", value="THREAD"),
    // 当隔离策略选择信号量隔离的时候，用来设置信号池的大小（最大并发数）
    @HystrixProperty(name="execution.isolation.semaphore.maxConcurrentRequests", value="10"),
    // 配置命令执行的超时时间
	@HystrixProperty(name="execution.isolation.thread.timeoutinMilliseconds", value="10"),
    // 是否启用超时时间
    @HystrixProperty(name="execution.timeout.enable", value="true"),
    // 执行超时的时候是否中断
    @HystrixProperty(name="execution.isolation.thread.interruptOnTimeout", value="true"),
    // 执行被取消的时候是否中断
    @HystrixProperty(name="execution.isolatin.thread.interruptOnCancel", value="true"),
    // 运行回调方法执行的最大并发数
    @HystrixProperty(name="fallback.isolation.semaphore.maxConcurrentRequests", value="10"),
    // 服务降级是否启用，是否执行回调函数
    @HystrixProperty(name="fallback.enabled", value="true"),
    // 是否启用断路器
    @HystrixProperty(name="circuitBreaker.enabled", value="true"),
    // 设置在滚动时间窗中，断路器熔断的最小请求次数。例如，默认该值为 20 的时候，
    // 如果滚动时间窗（默认 10 秒）内仅收到了 19 个请求，即使这 19 个请求都失败了，断路器也不会打开
    @HystrixProperty(name="circuitBreaker.requestVolumeThreshold", value="20"),
    // 该属性用来设置在滚动时间窗中，在请求次数超过 requestVolumeThreshold 的情况下，如果错误请求数的百分比超过 50%，就把断路器设置为 "打开" 状态，否则就设置为 "关闭" 状态
    @HystrixProperty(name = "circuitBreaker.errorThresholdPercentage", value = "50"),
    // 该属性用来设置当断路器打开之后的休眠时间窗。休眠时间窗结束之后，会将断路器置为 "半开" 状态，
    // 尝试处理请求，如果还是失败就将断路器继续设置为 "打开" 状态
    @HystrixProperty(name="circuitBreaker.sleepWindowinMilliseconds", value="5000"),
    // 断路器强制打开
    @HystrixProperty(name="circuitBreaker.forceOpen", value="false"),
    // 断路器强制关闭
    @HystrixProperty(name="circuitBreaker.forceClosed", value="false"),
    // 滚动时间窗设置，该时间用于断路器判断健康度时需要收集信息的持续时间
    @HystrixProperty(name="metrics.rollingStats.timeinMilliseconds", value="10000"),
    // 该属性用来设置滚动时间窗统计指标信息时划分 "桶" 的数量，断路器在收集指标信息的时候会根据
    // 设置的时间窗长度拆分为多个 "桶" 来累计各度量值，每个 "桶" 记录了一段时间内的采集指标。
    // 比如 10 秒内拆分成 10 个 "桶"，所以 timeinMilliseconds 必须能被 numBuckets 整除，否则会抛异常
    @HystrixProperty(name="metrics.rollingStats.numBuckets", value="10"),
    // 该属性用来设置对命令执行的延迟是否使用百分位数来跟踪和计算，如果设置为 false，那么所有的概要统计都将返回 -1
    @HystrixProperty(name="metrics.rollingPercentile.enabled", value="false"),
    // 该属性用来设置百分比统计滚动窗口的持续时间，单位为毫秒
    @HystrixProperty(name="metrics.rollingPercentile.timeInMilliseconds", value="60000"),
    // 该属性用来设置百分比统计滚动窗口中使用 "桶" 的数量
    @HystrixProperty(name="metrics.rollingPercentile.numBuckets", value="6"),
    // 该属性用来设置在执行过程中每个 "桶" 中保留的最大执行次数。如果在滚动时间窗内超过该设定值的执行次数，
    // 就从最初的位置开始重写。例如，将该值设置为 100，滚动窗口为 10 秒，若在 10 秒内一个 "桶" 发生了 500 次执行，
    // 那么该 "桶" 中只保留最后的 100 次执行的统计。另外，增大该值将会增加内存量的消耗，并增加排序百分位数所需的计算时间
    @HystrixProperty(name="metrics.rollingPercentile.bucketSize", value="100"),
    // 该属性用来设置采集影响断路器状态的健康快照（请求的成功、错误百分比）的间隔等待时间
    @HystrixProperty(name="metrics.healthSnapshot.intervalInMilliseconds", value="500"),
    // 是否开启请求缓存
    @HystrixProperty(name="requestCache.enabled", value="true"),
    // HystrixCommand 的执行和事件是否打印日志到 HystrixRequestLog 中
    @HystrixProperty(name="requestLog.enabled", value="true")
}, threadPoolProperties = {
    // 参考：com.netflix.hystrix.HystrixThreadPoolProperties
    // 该参数用来设置执行命令线程池的核心线程数，该值也就是命令执行的最大并发量
    @HystrixProperty(name="coreSize", value="10"),
    // 设置线程池的最大队列大小，默认为 -1，此时，线程池将使用 SynchronousQueue 实现的队列（同步队列），否则将使用 LinkedBlockingQueue 实现的队列（阻塞队列）
    @HystrixProperty(name="maxQueueSize", value="-1"),
    // 该参数用来设置队列的的拒绝阈值。通过该参数，即使队列没有达到最大值也能拒绝请求
    // 该参数主要针对 LinkedBlockingQueue 队列的补充，因为 LinkedBlockingQueue 队列不能动态的修改对象大小，而通过该属性就可以调整拒绝请求的队列大小了
    @HystrixProperty(name="queueSizeRejectionThreshold", value="5"),
})
```

# 六、服务限流

在 Alibaba 的 Sentinel 中说明。

# 七、Hystrix 工作流程

官网：https://github.com/Netflix/Hystrix/wiki/How-it-Works

![](https://raw.githubusercontent.com/wiki/Netflix/Hystrix/images/hystrix-command-flow-chart.png)

解释：

（1）创建 `HystrixCommand`（用在依赖的服务返回单个操作结果的时候）或 `HystrixObserableComman`（用在依赖的服务返回多个操作结果的时候）对象；

（2）命令执行。其中 `HystrixCommand` 实现了下面前两种执行方式；而 `HystrixObserableComman` 是实现了后两种执行方式：

- `execute()`：同步执行，从依赖的服务返回一个单一的结果对象，或是在发生错误时抛出异常；
- `queue()`：异步执行，直接返回一个 `Future` 对象，其中包含了服务执行结束时要返回的单一结果对象；
- `observe()`：返回 `Observable` 对象，它代表了操作的多个结果，它是一个 Hot Observable（不论 "事件源" 是否有 "订阅者"，都会在创建后对事件进行发布，所以对于 Hot Observable 的每一个 "订阅者" 都有可能是从 "事件源" 的中途开始的，并可能只是看到了整个擦欧总的局部过程）；
- `toObservable()`：同一会返回 `Observable` 对象，也代表了操作的多个结果，但它返回的是一个 Cloud Observable（没有 "订阅者" 的时候并不会发布事件，而是进行等待，知道有 "订阅者" 之后才发布事件，所以对于 Cloud Observable 的订阅者，它可以保证从一开始看到整个操作的全部过程）；

（3）若当前命令的请求缓存功能是被开启的，并且该命令命中缓存，那么缓存的结果就会立即以 `Observable` 对象的形式返回；

（4）检查断路器是否为打开状态，如果断路器是打开的，那么 Hystrix 不会执行命令，而是转接到 fallback 处理逻辑（第 8 步）；如果断路器是关闭的，检查是否有可用资源来执行命令（第 5 步）；

（5）线程池/请求队列/信号量是否占满。如果命令依赖服务的专有线程池和请求队列，或者信号量（不使用线程池的时候）已经被占满，那么 Hystrix 也不会执行命令，而是转接到 fallback 处理逻辑（第 8 步）；

（6）Hystrix 会根据我们编写的方法来决定采取什么样的方式去请求依赖服务。`HystrixCommand.run()`：返回一个单一的结果，或者抛出异常。`HystrixObservableCommand.construct()`：返回一个 `Observable` 对象来发射多个结果，或通过 onError 发送错误通知；

（7）Hystrix 会将 "成功"、"失败"、"拒绝"、"超时" 等信息报告给断路器，而断路器会维护一组计数器来统计这些数据，断路器会使用这些统计数据来决定是否要将断路器打开，来对某个依赖服务的请求进行 "熔断/短路"；

（8）当命令执行失败的时候，Hystrix 会进行 fallback 尝试回退处理，我们通常也称该操作为 "服务降级"。而能够引起服务降级处理的情况有下面几种：

- 第 4 步：当前命令处于 "熔断/短路" 状态，断路器是打开的时候；
- 第 5 步：当前命令的线程池、请求队列或者信号量被占满的时候；
- 第 6 步：`HystrixObservableCommand.construct()` 或 `HystrixCommand.run()` 抛出异常的时候。

（9）当 Hystrix 命令执行成功之后，它会将处理结果直接返回或是以 Observable 的形式返回。

<mark>tips：如果我们没有为命令实现降级逻辑或者在处理降级逻辑过程中抛出了异常，Hystrix 依然会返回一个 Observable 对象，但是它不会发射任何结果数据，而是通过 onError 方法通知命令立即中断请求，并通过 onError（） 方法将引起命令失败的异常发送给调用者。</mark>



进度：https://www.bilibili.com/video/BV18E411x7eT?p=63&spm_id_from=pageDriver

# 八、HystrixDashboard

## 1、概述

处理隔离依赖服务的调用之外，Hystrix 还提供了 <mark>准实时的调用监控（Hystrix Dashboard）</mark>，Hystrix 会持续地记录所有通过 Hystrix 发起的请求的执行信息，并以统计图表的形式展示给用户，包括每秒执行多少请求，成功的次数、失败的次数等等。

Netflix 通过`hystrix-metrics-event-stream` 项目实现了对以上指标的监控。Spring Cloud 也提供了 Hystrix Dashboard 的整合，将监控的内容转换为图表形式。



## 2、创建监控服务

创建服务：`cloud-consumer-hystrix-dashboard9001`

pom：

```xml
<!-- hystrix dashboard -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix-dashboard</artifactId>
</dependency>

<!-- 如果想要获取相关数据，必须依赖该 actuator 包 -->
<!-- actuator -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
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
</dependency>
```

配置文件：

```yaml
server:
  port: 9001
```

主启动类：

```java
@EnableHystrixDashboard
@SpringBootApplication
public class HystrixDashboard9001 {
    public static void main(String[] args) {
        SpringApplication.run(HystrixDashboard9001.class, args);
    }
}
```

注意所有的服务都需要依赖：

```xml
<!-- actuator -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

启动该服务，浏览器访问：`localhost:9001/hystrix`

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220505183351.png)

## 3、监控

对 Dashboard 服务模块做以下配置：

```yaml
server:
  port: 9001
hystrix:
  dashboard:
    proxy-stream-allow-list: 
      - localhost
```

对 payment8001 添加以下配置：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: hystrix.stream
```

将监控端口暴露出去。

在监控面版输入监控接口：`http://localhost:8001/actuator/hystrix.stream`

Delay：2000 ；Title：可以随意填写

最后点击 Monitor Stream 按钮，出现监控面板：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220505205729.png)

如果出现这个错误：`Unable to connect to Command Metric Stream`，可以参考：https://stackoverflow.com/questions/49792290/unable-to-connect-to-command-metric-stream-for-hystrix-dashboard-with-spring-clo

通过监控面板，我们可以看到接口的流量变化，以及断路器的状态。

实心圆：共有两种含义。它通过颜色的变化代表了实例的健康程度，健康度：绿色 < 黄色 < 橙色 < 红色 递减。

该实心圆除了颜色的变化之外，它的大小也会根据实例的请求流量发生变化，流量越大该实心圆就越大。

所以通过该实心圆的展示，就可以在大量的实例中快速的发现故障实例和高压力实例。