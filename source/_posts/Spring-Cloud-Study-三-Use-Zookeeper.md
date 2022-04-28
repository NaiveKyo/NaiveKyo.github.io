---
title: Spring Cloud Study (三) Use Zookeeper
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221552.jpg'
coverImg: /img/20220225221552.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-28 23:06:06
summary: "Spring Cloud 学习(三): Zookeeper 注册中心"
categories: "Spring Cloud"
keywords: ["Spring Cloud", "Zookeeper"]
tags: "Spring Cloud"
---

# Zookeeper 作为注册中心

zookeeper 是一个分布式的协调工具，可以实现注册中心功能。



# 一、支付服务注册 ZK

## 1、新建服务模块

新建支付服务模块 `cloud-provider-payment8004`。

修改 pom 文件：

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

    <!-- zookeeper client -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
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

只需要将 Eureka 的依赖换成 Zookeeper 就可以了。

配置文件：

```yaml
# 端口号
server:
  port: 8004

# 服务名  
spring:
  application:
    name: cloud-provider-service
  cloud:
    zookeeper:
      # zk 地址
      connect-string: 192.168.154.129:2181  # 虚拟机
```

主启动类 ：

```java
@EnableDiscoveryClient
@SpringBootApplication
public class PaymentService8004 {
    public static void main(String[] args) {
        SpringApplication.run(PaymentService8004.class, args);
    }
}
```

`@EnableDiscoveryClient` 这个注解是 Spring 提供的，以后会经常用到，主要作用就是向注册中心注册服务。

## 2、启动 Zookeeper 服务端

打开虚拟机，进入 Zookeeper 的 bin 目录，启动服务：`./zkServer.sh start`（注意主机要和虚拟机网络连通）

默认 zk 服务端根下面中有一个 `zookeeper` 节点：

```bash
[zk: localhost:2181(CONNECTED) 0] ls /
[zookeeper]
[zk: localhost:2181(CONNECTED) 1] ls /zookeeper
[config, quota]
[zk: localhost:2181(CONNECTED) 2] get /zookeeper

[zk: localhost:2181(CONNECTED) 3]
```

启动 payment8004 服务。

这个过程可能会出现版本冲突问题，当服务端安装的 zookeeper 版本和 spring cloud 集成的 zk 版本不一致的时候就会启动失败，可以看到

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220428181124.png)

本文使用的 cloud 环境集成的 zk 是 3.5.3-beta 版本，而服务端配置的 zk 是 3.5.7，所以不会出现错误，如果出现了版本冲突，可以排除 cloud 环境自带的 zk，重新导入匹配的 zk：

```xml
<!-- zookeeper client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.apache.zookeeper</groupId>
            <artifactId>zookeeper</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- specify the zookeeper version -->
<dependency>
    <groupId>org.apache.zookeeper</groupId>
    <artifactId>zookeeper</artifactId>
    <version>x.x.x</version>
</dependency>
```

服务启动成功后，我们在看看服务器上 zookeeper 的状态：

```bash
[zk: localhost:2181(CONNECTED) 3] ls /
[services, zookeeper]
[zk: localhost:2181(CONNECTED) 4] ls /services
[cloud-payment-service]
[zk: localhost:2181(CONNECTED) 5] ls /services/cloud-payment-service
[c0366eae-aa2e-4175-963d-51c139d008d0]
[zk: localhost:2181(CONNECTED) 6] ls /services/cloud-payment-service/c0366eae-aa2e-4175-963d-51c139d008d0
[]
[zk: localhost:2181(CONNECTED) 7] get /services/cloud-payment-service/c0366eae-aa2e-4175-963d-51c139d008d0
{"name":"cloud-payment-service","id":"c0366eae-aa2e-4175-963d-51c139d008d0","address":"localhost","port":8004,"sslPort":null,"payload":{"@class":"org.springframework.cloud.zookeeper.discovery.ZookeeperInstance","id":"application-1","name":"cloud-payment-service","metadata":{"instance_status":"UP"}},"registrationTimeUTC":1651140425239,"serviceType":"DYNAMIC","uriSpec":{"parts":[{"value":"scheme","variable":true},{"value":"://","variable":false},{"value":"address","variable":true},{"value":":","variable":false},{"value":"port","variable":true}]}}
```

到此说明服务注册成功。

```json
{
	"name": "cloud-payment-service",
	"id": "c0366eae-aa2e-4175-963d-51c139d008d0",
	"address": "localhost",
	"port": 8004,
	"sslPort": null,
	"payload": {
		"@class": "org.springframework.cloud.zookeeper.discovery.ZookeeperInstance",
		"id": "application-1",
		"name": "cloud-payment-service",
		"metadata": {
			"instance_status": "UP"
		}
	},
	"registrationTimeUTC": 1651140425239,
	"serviceType": "DYNAMIC",
	"uriSpec": {
		"parts": [{
			"value": "scheme",
			"variable": true
		}, {
			"value": "://",
			"variable": false
		}, {
			"value": "address",
			"variable": true
		}, {
			"value": ":",
			"variable": false
		}, {
			"value": "port",
			"variable": true
		}]
	}
}
```

# 二、Zookeeper 临时节点

之前简单了解过，Zookeeper 中存储接口的形式和 Unix 文件结构类似都是树形层级结构，它的每个节点又叫做 ZNode，那么我们的服务注册到 Zookeeper 后，存储使用的究竟是临时节点还是持久节点？

当我们关闭掉 payment8004 服务后，过了一段时间（心跳限时）该服务信息就在 zk 的 services 节点下消失了，可以看出注册的服务使用的是临时节点，再次启动服务，zk 上又出现了对应服务名的服务实例，但是其流水号发生了变化。



# 三、服务消费者注册 ZK

新建模块：`cloud-consumerzk-order80`

pom 和 配置文件和支付模块一样，只不过需要修改服务名为 `cloud-consumer-service`

现在 zookeeper 服务端注册的 services：

```bash
[zk: localhost:2181(CONNECTED) 18] ls /services
[cloud-consumer-order, cloud-provider-service]
```

```java
@Configuration
public class ApplicationContextConfig {
    
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@RestController
public class OrderZKController {
    
    public static final String INVOKE_URL = "http://cloud-provider-service";
    
    @Autowired
    private RestTemplate restTemplate;
    
    @GetMapping(value = "/consumer/payment/zk")
    public String paymentInfo() {

        return this.restTemplate.getForObject(INVOKE_URL + "/payment/zk", String.class);
    }
}
```

浏览器访问：`http://localhost/consumer/payment/zk`，可以成功返回字符串。

# 四、补充

Zookeeper 集群配置，只需要在配置文件 `spring.cloud.zookeeper.connect-string` 中使用逗号分割就可以了，和 Eureka 类似。