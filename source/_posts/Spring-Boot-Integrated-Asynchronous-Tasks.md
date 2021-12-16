---
title: Spring Boot Integrated Asynchronous Tasks
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031150448.jpg'
coverImg: /img/20211031150448.jpg
cover: false
toc: true
mathjax: false
date: 2021-12-14 22:20:32
summary: "Spring Boot 核心特性:异步任务和定时任务"
categories: "Spring Boot"
keywords: ["Spring Boot", "Async", "Scheduling"]
tags: "Spring Boot"
---



# Spring Boot 异步任务及定时任务

# 一、异步线程池

## 1、简介

平时我们开发的应用一般都是同步应用，也就是一个请求都是在同一个线程中运行，但是有时候可能需要异步，也就是一个请求可能存在两个或者两个以上的线程。

在实际的场景中，如后台管理系统，有些任务需要操作比较多的数据进行统计分析，典型的如报表，需要去生成。而报表可能需要访问的是亿级数据量并且进行比较复杂的运行，这样报表的生成就需要比较多的时间了。这种情况就很适合使用异步任务。



Spring Boot 在官方文档的核心特性中介绍过: [Task Execution and Scheduling](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.task-execution-and-scheduling)



## 2、分析

根据官方文档所示，想要使用异步任务需要为应用开启异步功能，最简单的方法是使用两个注解， `@EnableAsync`  和 `@Async`：

- `@EnableAsync` 可以放在主启动类上或者需要调用异步方法的类上
- `@Async` 放在想要让其异步执行的方法上

当应用检测到开启了异步功能，但是没有提供 `Executor`，那么 Spring Boot 会自动为我们装配异步任务执行器（一个名为 taskExecutor，类型为 `ThreadPoolTaskExecutor` 的线程池）。



如果想要在上下文中注入开发者定制的 `Executor`，同时应用使用了 `@EnableAsync`，那么执行异步任务时会使用我们提供的线程池，但是此种情况下 Spring MVC 的异步执行线程池不会使用它，如果想让 Spring MVC 也使用定制的执行器，就另外需要提供一个 `AsyncConfigurer` 类型的用 `@Configuration` 修饰的配置类，在这个类中提供类型为 `AsyncTaskExecutor`，名称为 applicationTaskExecutor 的 Executor。



为了统一异步任务执行器，推荐开发者这样配置，在实现了 `AsyncConfigurer`  的配置类中通过覆盖方法，提供类型为 `ThreadPoolTaskExecutor` 的执行器，这样整个应用在执行异步任务时都会使用这个 Executor。

```java
@Configuration
@EnableAsync
public class AppConfig implements AsyncConfigurer {

    // 自定义线程池
    @Override
    public Executor getAsyncExecutor() {
        
        // Custom thread pool
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        // 核心线程数(最小线程存活数量)
        executor.setCorePoolSize(10);
        // 最大线程数
        executor.setMaxPoolSize(30);
        // 阻塞队列大小
        executor.setQueueCapacity(2000);
        // 最大空闲时间
        executor.setKeepAliveSeconds(300);  
        // 创建新线程时线程的名称前缀
        executor.setThreadNamePrefix("---NaiveKyo-Executor");
        // 拒绝策略
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        // 初始化
        executor.initialize();
        
        return executor;
    }

    // 异常处理机制，可以自定义，这里就使用父类的方法，返回 null，表示使用默认的
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return AsyncConfigurer.super.getAsyncUncaughtExceptionHandler();
    }
}
```



有一点需要注意：`AsyncConfigurer` 配置类会在应用程序上下文启动之前初始化，这意味着如果在这种类型的配置类中提供 Bean，这些 Bean 将不会被某些后处理器（`BeanPostProcessor`）所处理。

如果非要提供 Bean，可以这样做：

- 使用 `@Lazy` 修饰 `@Bean` 方法

当然，非必要还是另外创建一个单独的配置类去提供这些 Bean 比较好。



## 3、实践

前面已经提供了异步任务所需要的线程池，下面提供两个测试服务类：

需要注意的是 <strong style="color:red">异步任务一般不需要返回值，如果想要返回值可以返回 Future<?></strong>

业务类：

```java
public interface ReportService {
    
    void generateReport();
}


@Service
public class ReportServiceImpl implements ReportService {
    
    @Autowired
    private AsyncService asyncService;
    
    @Override
    public void generateReport() {

        System.out.println("=== 请求线程: 【 " + Thread.currentThread().getName() + " 】");
        
        asyncService.generateReport();
    }
}
```

异步任务类：

```java
public interface AsyncService {
    
    void generateReport();
}

@Service
public class AsyncServiceImpl implements AsyncService {

    @Autowired
    private UserMapper userMapper;

    @Async
    @Override
    public void generateReport() {

        System.out.println("报表线程名称: " + "【 " + Thread.currentThread().getName() + " 】");
    }
}
```

测试类：

```java
@RestController
public class HelloController {
    
    @Autowired
    private ReportService reportService;
    
    @RequestMapping(value = "/report", method = RequestMethod.GET)
    public String report() {
        
        this.reportService.generateReport();
        
        return "ok";
    }
}
```

测试效果：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211215224810.png)



## 4、异步任务结合事务

如果需要在一个事务中开启另一个异步事务，个人觉得还是将异步事务的传播机制设置为 `REQUIRES_NEW` 比较好，这样异步事务可以有自己的隔离级别和锁，如果出了错也不会影响父事务。

用户实体：

```java
@Setter
@Getter
@ToString
public class User {
    
    private String username;
    
    private String note;

    public User(String username, String note) {
        this.username = username;
        this.note = note;
    }
}
```

业务类：

```java
public interface OtherService {
    
    // 批量插入用户的业务
    int insertUsers(List<User> userList) throws Exception;
}

@Service
public class OtherServiceImpl implements OtherService {
    
    @Autowired
    private AsyncService asyncService;
    
    @Autowired
    private UserMapper userMapper;
    
    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED, propagation = Propagation.REQUIRED)
    public int insertUsers(List<User> userList) {
        
        this.userMapper.insertUser(new User("user_batch", "note_batch"));
        
        for (int i = 0; i < userList.size(); i++) {
            this.asyncService.insertUser(userList.get(i), i);
        }
        
        return 1;
    }
}
```

异步任务：

```java
public interface AsyncService {
    
    // 插入用户数据
    void insertUser(User user, int i);
}

@Service
public class AsyncServiceImpl implements AsyncService {
    
    @Async
    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED, propagation = Propagation.REQUIRES_NEW)
    public void insertUser(User user, int i) {
        
        if (i == 0)
            this.userMapper.insertUser(user);
    
        if (i == 1) {
            
			this.userMapper.insertUser(user);
            
            throw new RuntimeException("============= 出错 =============");
        }
        
        this.userMapper.insertUser(new User("user_3", "note_3"));

        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

    }
}
```

测试 Controller：

```java
@Controller
public class AsyncController {

    @Autowired
    private OtherService otherService;
    
    @GetMapping("/insert")
    @ResponseBody
    public String batchInsertUser() throws Exception {

        ArrayList<User> users = new ArrayList<>();

        users.add(new User("user_1", "note_1"));
        users.add(new User("user_2", "note_2"));

        this.otherService.insertUsers(users);

        return "ok!";
    }
    
}
```



这里我们在第二次执行异步任务时抛出异常，最终结果就是只会向数据库插入父事务和第一次异步事务的数据：



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211215230826.png)



# 二、定时任务 TODO