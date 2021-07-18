---
title: SpringAop-AspectJ-Intro
date: 2021-07-07 15:23:03
author: NaiveKyo
top: false
img: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/1.jpg
coverImg: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/1.jpg
hide: flase
cover: false
toc: true
summary: 学习 Spring 中的 AOP 使用方法，以及了解 AspectJ
categories: Spring
keywords: [Spring, Aop, AspectJ]
tags:
  - Spring
  - Aop
  - AspectJ
---

# AspectJ 在 Spring Aop 中的体现



## 一、简介

Aop 即面向切面编程，项目中，例如 日志、权限等穿插整个项目但并不是核心逻辑的，我们可以把它单独提出来作为一个单独的模块管理。



## 二、AspectJ-AOP

AOP在 Java 中的 Spring 中已经有了，可以直接在 idea 中新建一个 Aspect，注意关键字为 aspect(MyAspectJDemo.aj,其中aj为AspectJ的后缀)，含义与 class 相同，即定义一个 AspectJ 的类。AspectJ 是一个 java 实现的 AOP 框架，它能够对 java代码进行 AOP 编译（一般在编译期进行），让 java 代码具有AspectJ 的 AOP 功能（当然需要特殊的编译器），可以这样说 AspectJ 是目前实现 AOP 框架中最成熟，功能最丰富的语言，更幸运的是，AspectJ 与 java 程序完全兼容，几乎是无缝关联。



创建 AspectJ 文件

```java
//定义main文件
public class HelloWord{
  public void sayHello{
    System.out.println("hello");
  }
  public static void main(String args[]){
    HelloWord hello=new HelloWord();
    hello.sayHello();
  }
}
```

```java
//定义切面
public aspect MyAspectJDemo {
    /**
     * 定义切点,日志记录切点
     */
    pointcut recordLog():call(* HelloWord.sayHello(..));

    /**
     * 定义切点,权限验证(实际开发中日志和权限一般会放在不同的切面中,这里仅为方便演示)
     */
    pointcut authCheck():call(* HelloWord.sayHello(..));

    /**
     * 定义前置通知!
     */
    before():authCheck(){
        System.out.println("sayHello方法执行前验证权限");
    }

    /**
     * 定义后置通知
     */
    after():recordLog(){
        System.out.println("sayHello方法执行后记录日志");
    }
}
```



我们使用aspect关键字定义了一个类，这个类就是一个切面，它可以是单独的日志切面(功能)，也可以是权限切面或者其他，在切面内部使用了pointcut定义了两个切点，一个用于权限验证，一个用于日志记录，而所谓的切点就是那些需要应用切面的方法，如需要在sayHello方法执行前后进行权限验证和日志记录，那么就需要捕捉该方法，而pointcut就是定义这些需要捕捉的方法（常常是不止一个方法的），这些方法也称为目标方法，最后还定义了两个通知，通知就是那些需要在目标方法前后执行的函数，如before()即前置通知在目标方法之前执行，即在sayHello()方法执行前进行权限验证，另一个是after()即后置通知，在sayHello()之后执行，如进行日志记录。到这里也就可以确定，切面就是切点和通知的组合体，组成一个单独的结构供后续使用。这里一般日志和权限都是要单独定义切面的，这里示例不规范。 对于结构表达式

`pointcut authCheck():call(* HelloWord.sayHello(..))`

关键字为pointcut，定义切点，后面跟着函数名称，最后编写匹配表达式，此时函数一般使用 call() 或者execution() 进行匹配，这里我们统一使用call()

`pointcut 函数名 : 匹配表达式`

recordLog()是函数名称，自定义的，*表示任意返回值，接着就是需要拦截的目标函数，sayHello(..)的..，表示任意参数类型。这里理解即可，后面Spring AOP会有关于切点表达式的分析，整行代码的意思是使用pointcut定义一个名为recordLog的切点函数，其需要拦截的(切入)的目标方法是HelloWord类下的sayHello方法，参数不限

`before():authCheck(){ System.out.println("something"); }`



- before这个处于函数名之前的方法成为通知方法，共有5种通知方法

- before 目标方法执行前执行，前置通知

- after 目标方法执行后执行，后置通知

- after returning 目标方法返回时执行 ，后置返回通知

- after throwing 目标方法抛出异常时执行 异常通知

- around 在目标函数执行中执行，可控制目标函数是否执行，甚至可以拿到方法执行后的返回值，环绕通知



## 三、Spring 中的 Aop

Spring AOP 与 ApectJ 的目的一致，都是为了统一处理横切业务，但与 AspectJ 不同的是，Spring AOP 并不尝试提供完整的 AOP 功能(即使它完全可以实现)，Spring AOP 更注重的是与 Spring IOC 容器的结合，并结合该优势来解决横切业务的问题，因此在 AOP 的功能完善方面，相对来说 AspectJ 具有更大的优势。

同时，Spring 注意到 AspectJ 在 AOP 的实现方式上依赖于特殊编译器 (ajc编译器)，因此 Spring 很机智回避了这点，转向采用动态代理技术的实现原理来构建 Spring AOP 的内部机制（动态织入），这是与AspectJ（静态织入）最根本的区别。在 AspectJ 1.5 后，引入 @Aspect 形式的注解风格的开发，Spring 也非常快地跟进了这种方式，因此 Spring 2.0 后便使用了与 AspectJ 一样的注解。

请注意，Spring 只是使用了与 AspectJ 5 一样的注解，但仍然没有使用 AspectJ 的编译器，底层依是动态代理技术的实现，因此并不依赖于 AspectJ 的编译器。下面我们先通过一个简单的案例来演示Spring的AOP使用


spring 的 aop 中使用了一些表达式用于处理切点：

https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#expressions



### 1、Aop Concepts

- Aspect：切面一般都是横跨多个类（或多个业务模块），例如项目中企业项目开发中事务管理就是一个应用 aop 的非常好的例子。

  而在 Java 项目中配置切面有两种方式：xml 文件配置或者 使用了 `@Aspect` 注解的类

- Join point：在 spring 中一个连接点就代表一个要被执行的方法

- Advice：通知就是当 切面 中的切点被执行后采取的行动。通知大致分为三种：around、before、after

- Pointcut：切入点和连接点是相匹配的，当某个连接点被切入点表达式匹配到时，就会在这个连接点上执行通知（advice）：在 spring aop 理念中，由切入点表达式匹配连接点是它的核心。Spring 默认使用的是 AspectJ 的切入点表达式

- Introduction：介绍：spring aop 允许你为 advised object 定义一个新的接口（提供对应的实现类），在 AspectJ 社区中这被称为 类型间声明

- Target Object：目标对象相当于 spring aop 在运行时通过代理为切面生成一个代理对象

- Aop Proxy：spring aop 采用 JDK 提供的动态代理或者 CGLIB 代理

- Weaving：编制：将切面和对应的模块联系起来（一般在编译时期）



### 2、Advice 的类型

- before 目标方法执行前执行，前置通知

- after 目标方法执行后执行，后置通知

- after returning 目标方法返回时执行 ，后置返回通知

- after throwing 目标方法抛出异常时执行 异常通知

- around 在目标函数执行中执行，可控制目标函数是否执行，甚至可以拿到方法执行后的返回值，环绕通知



### 3、Proxy 类型

默认使用 JDK 动态代理

建议使用 CGLIB



### 4、使用 @AspectJ

https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-ataspectj



注意：

- 切面类可能不会被 spring 扫描到，因此
  - 要么自定义 config 配置，注册 bean
  - 要么 aspect 类上加上 `@Component`
  - 或者在主启动类上自定义扫描规则
- 切点支持的表达式语法有好几种，用的比较多的是 `execution`



### 5、使用切入点表达式

常规切入点：

```java
/**
 * 如果连接点执行后抛出异常，就执行这个
 * @param e
*/
@AfterThrowing(
  	value = "execution(* com.naivekyo.controller.AopTestController.addUser(..))",
  	throwing = "e"
)
public void afterThrowable(Throwable e) {
 	 System.out.println("出现异常： msg = " + e.getMessage());
}
```



也可以使用和 AspectJ 类似的切入点，而且可以考虑结合多种表达式

连接方式：`&&、||、|`

`

```java
@Pointcut("execution(public * *(..))")
private void anyPublicOperation() {} 

@Pointcut("within(com.xyz.myapp.trading..*)")
private void inTrading() {} 

@Pointcut("anyPublicOperation() && inTrading()")
private void tradingOperation() {} 
```

- anyPublicOperation：匹配所有 public 方法
- inTrading：如果在这个交易模块中执行了匹配的方法，就执行这个切入点
- tradingOperation：前两者的结合，执行了匹配方法且方法为 public

<mark>顺带一提，可见性并没有太大影响，因为是通过动态代理拿到的</mark>



### 6、常用的 expression 表达式

大部分开发者更喜欢用 `execution` 来指定切入点表达式

- 匹配所有公共方法

  ```java
  execution(public * *(..))
  ```

- 执行所有名词以 set 开头的方法

  ```java
  execution(* set*(..))
  ```

- 执行 AccountService 下的所有方法

  ```java
  execution(* com.xyz.service.AccountService.*(..))
  ```

- 执行 service 包下定义的所有方法

  ```java
  execution(* com.xyz.service.*.*(..))
  ```

- 执行 service 包及其子包总定义的所有方法

  ```java
  execution(* com.xyz.service..*.*(..))
  ```

- 只在 Spring AOP 中指定 service 包中定义的所有方法

  ```java
  within(com.xyz.service.*)
  ```

- 只在 Spring AOP 中执行 service 包及其子包总定义的所有方法

  ```java
  within(com.xyz.service..*)
  ```

- 仅在 Spring AOP 中代理执行 AccountService 接口中所有连接点方法

  this 更适合用于绑定形式

  ```java
  this(com.xyz.service.AccountService)
  ```

- 仅在 Spring AOP 中使用目标对象代理执行 AccountService 接口中的所有方法

  target 更适合用于绑定形式

  ```java
  target(com.xyz.service.AccountService)
  ```

- 仅在 Spring AOP 中执行：仅有一个参数，且运行时传递的为 `Serializable` 类型

  args 更适合用于绑定形式

  注意 args 匹配的是运行时参数，它和 `execution(* *(java.io.Serializable))` 是不同的，后者匹配的是方法签名

  ```java
  args(java.io.Serializable)
  ```

- 仅在 Spring AOP 中执行，匹配带有 `@Transactinal` 注解的类

  ```java
  @target(org.springframework.transaction.annotation.Transactional)
  ```

- 任何连接点(仅在Spring AOP中执行方法)，其中目标对象的声明类型具有@Transactional注释:  

  ```java
  @within(org.springframework.transaction.annotation.Transactional)
  ```

- 任何连接点(仅在Spring AOP中执行方法)，其中执行方法具有@Transactional注释:  

  ```java
  @annotation(org.springframework.transaction.annotation.Transactional)
  ```

- 任何接受单个参数的连接点(仅在Spring AOP中执行方法)，其中传递的参数的运行时类型有@Classified注释:  

  ```java
  @args(com.xyz.security.Classified)
  ```

- (仅在Spring AOP中执行方法)指定 bean 的名字为 tradeService

  ```java
  bean(tradeService)
  ```

- Spring bean上的任何连接点(仅在Spring AOP中执行方法)的名称与通配符表达式*Service:  

  ```java
  bean(*Service)
  ```



### 7、写出更好的 Pointcuts

- 类指示符选择一种特定的连接点: `execution`, `get`, `set`, `call`, and `handler`.

- 作用域指示符选择一组感兴趣的连接点(可能是多种) `within` and `withincode`
- 上下文指示符根据上下文匹配(或可选地绑定): `this`, `target`, and `@annotation`



一个编写良好的切入点至少应该包括前两种类型(类型和范围)。您可以包含上下文指示符，以便根据连接点上下文进行匹配，或者绑定该上下文以便在通知中使用。只提供一种指示符或仅仅



只提供 类型 或者只提供上下文 指示符可以工作，但可能会影响编织性能(使用的时间和内存)。

作用域指示符的匹配速度非常快，使用它们意味着AspectJ可以非常快地解散不应该进一步处理的连接点组。一个好的切入点应该尽可能包含一个作用域指示符。



### 8、Advice 介绍

所有的通知方法都可以给它传递一个参数 `JoinPoint`，但是注意 Around advice 第一个参数是 `ProceedingJoinPoint` 它是 JoinPoint 的子类。

`JoinPoint` 接口提供了一些有用的方法：

- `getArgs()`: Returns the method arguments.
- `getThis()`: Returns the proxy object.
- `getTarget()`: Returns the target object.
- `getSignature()`: Returns a description of the method that is being advised.
- `toString()`: Prints a useful description of the method being advised.



```java
@After(value = "execution(* com.naivekyo.controller.AopTestController.addUser(..))")
public void after(JoinPoint point) {
    System.out.println("最终通知...");

    // 获取方法的参数
    Object[] args = point.getArgs();

    for (Object arg : args) {
      System.out.println(arg.toString());
    }
    // 返回代理对象
    System.out.println(point.getThis().getClass().getName());
    // 返回目标对象
    System.out.println(point.getTarget().getClass().getName());
    // 返回方法签名
    System.out.println(point.getSignature());
    // 返回有用的信息
    System.out.println(point.toString());
}
```



> 给 Advice 传递参数

```java
// 方式一
@Before("com.xyz.myapp.CommonPointcuts.dataAccessOperation() && args(account,..)")
public void validateAccount(Account account) {
    // ...
}

// 方式二
@Pointcut("com.xyz.myapp.CommonPointcuts.dataAccessOperation() && args(account,..)")
private void accountDataAccessOperation(Account account) {}

@Before("accountDataAccessOperation(account)")
public void validateAccount(Account account) {
    // ...
}
```



See the AspectJ programming guide for more details.





> Advice 绑定注解

```java
// 定义注解
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Auditable {
    AuditCode value();
}

// 绑定注解
@Before("com.xyz.lib.Pointcuts.anyPublicMethod() && @annotation(auditable)")
public void audit(Auditable auditable) {
    AuditCode code = auditable.value();
    // ...
}
```

> Advcie 绑定泛型

https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-ataspectj

比较复杂，看官网



> 指定参数的名称

利用 `argNames` 参数

https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-ataspectj



> Advice 的优先级

在同一个切面中不同切入点调用相同连接点：

- Before：优先级高的先调用
- After：优先级高的后调用





在不同切面的不同切入点调用相同连接点：

- 除非自己指定，否则就不能确定执行顺序

- 指定执行顺序

  - Aspect 类实现 `org.springframework.core.Ordered` 接口，重写 **getOrder 方法**，改方法返回 int 值即优先级，越小越高
  - 或者Aspect 类使用 `@Order` 注解给定优先级，值越小优先级越大

  

本质上在一个切面中定义的所有切入点，它们对应的连接点应该是不同的，如果出现了对应相同连接点的情况，spring 5.2.7 之后，spring 给它们指定的顺序

`@Around`, `@Before`, `@After`, `@AfterReturning`, `@AfterThrowing`.

需要注意的是 `@After` 依旧是最后调用的（优先级高的最后调）



### 9、Introductions

类型间声明一般适用于 父子类继承 或 实现接口这两种情况



```java
@Aspect
public class UsageTracking {

    @DeclareParents(value="com.xzy.myapp.service.*+", defaultImpl=DefaultUsageTracked.class)
    public static UsageTracked mixin;

    @Before("com.xyz.myapp.CommonPointcuts.businessService() && this(usageTracked)")
    public void recordUsage(UsageTracked usageTracked) {
        usageTracked.incrementUseCount();
    }

}


// 甚至可以通过编程方式访问
UsageTracked usageTracked = (UsageTracked) context.getBean("myService");
```



### 10、Aspect Instantiation Models

Aspect 实例化模型是 AOP 中比较高级的概念

https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-ataspectj



### 11、例子

现在使用 aop 做一个例子：演示服务请求遇到死锁的情况，可以使用 aspect 很好的处理，不让客户看到 `PessimisticLockingFailureException `

```java
@Aspect
public class ConcurrentOperationExecutor implements Ordered {

    private static final int DEFAULT_MAX_RETRIES = 2;

    private int maxRetries = DEFAULT_MAX_RETRIES;
    private int order = 1;

    public void setMaxRetries(int maxRetries) {
        this.maxRetries = maxRetries;
    }

    public int getOrder() {
        return this.order;
    }

    public void setOrder(int order) {
        this.order = order;
    }

    @Around("com.xyz.myapp.CommonPointcuts.businessService()")
    public Object doConcurrentOperation(ProceedingJoinPoint pjp) throws Throwable {
        int numAttempts = 0;
        PessimisticLockingFailureException lockFailureException;
        do {
            numAttempts++;
            try {
                return pjp.proceed();
            }
            catch(PessimisticLockingFailureException ex) {
                lockFailureException = ex;
            }
        } while(numAttempts <= this.maxRetries);
        throw lockFailureException;
    }
}
```

这里设置了最高优先级从而实现覆盖事务通知

而且 maxRetries 和 order 都可以使用 spring 注入（xml 或 @Value）

https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-ataspectj

还可以做进一步加强，注重细节：针对特定注解

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface Idempotent {
    // marker annotation
}
```

更改 Advice：

```java
@Around("com.xyz.myapp.CommonPointcuts.businessService() && " +
        "@annotation(com.xyz.myapp.service.Idempotent)")
public Object doConcurrentOperation(ProceedingJoinPoint pjp) throws Throwable {
    // ...
}
```



### 12、Spring AOP APIs

https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-api

分析内部原理需要好好研究
