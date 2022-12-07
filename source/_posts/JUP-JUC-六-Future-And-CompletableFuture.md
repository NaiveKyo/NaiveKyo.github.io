---
title: JUP JUC (六) Future And CompletableFuture
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211208174838.jpg'
coverImg: /img/20211208174838.jpg
cover: false
toc: true
mathjax: true
date: 2022-02-19 22:07:30
summary: "Java 并发编程：JUC 之 Future 接口及其实现类 CompletableFuture"
categories: "Java Concurrent"
keywords: "Java Concurrent"
tags: "Java Concurrent"
---



# 异步编程

# 一、并发和并行

先了解两个概念：

（1）并行：多个事件在同一时间点上发生，只有在多 CPU 的环境下才可以实现并行；

（2）并发：多个事件在同一时间段内同时发生，其本质是 CPU 资源在极短的时间内为多个任务轮流分配系统资源，常用在单核处理器。

两者的区别如下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220219112513.png)



> 并行

在多核处理器上，提升应用程序处理速度最有效的方式是编写能够成分发挥多核能力的软件：

- 通过切分大型任务，让每个子任务并行运行（以多线程并发执行的方式可以做到）；
- 相对于使用线程的方式，使用 **分支/合并** 框架（Java 7）和 **并行流** （Java 8）更简单高效；



> 并发

如果我们想实现并发，而非并行，或者主要目标是在同一个 CPU 上执行几个 **松耦合** 的任务，充分利用 CPU 的核，从而最大化程序的吞吐量，那么我们要做的就是避免因为等待远程服务的返回，或者对数据库的查询，而阻塞线程的执行，浪费宝贵的计算资源，因为这种等待的时间可能会相当长。

此种情况，我们就需要使用从 JDK 1.5 时期引入的 `Future` 接口以及其在 Java 8 引入的新版实现 `CompletableFutrue`。

# 二、Future 接口

## 1、接口方法

```java
public interface Future<V> {

    boolean cancel(boolean mayInterruptIfRunning);

    boolean isCancelled();

    boolean isDone();

    V get() throws InterruptedException, ExecutionException;

    V get(long timeout, TimeUnit unit)
        throws InterruptedException, ExecutionException, TimeoutException;
}
```

简单分析一下：

- `cancel`：尝试取消计算任务，如果任务还没启动，则永远不会启动，如果任务正在计算，则该方法的布尔值参数决定了是否要中断线程，返回值表示操作结果；
- `isCancelled`：`cancel` 方法返回 true，则该方法也返回 true；
- `isDone`：任务是否结束，以下情况会返回 true：正常完成任务、抛出异常、被取消；
- `get()`：阻塞调用线程，直到计算任务完成并返回结果；
- `get(long, TimeUnit)`：重载方法，最多阻塞调用线程指定时间，此期间内如果得到了返回值就继续向下执行，如果超时，就会抛出异常。



## 2、使用 Future

`Future` 接口在 Java 5 中被引入，设计初衷是对将来某个时刻会发生的结果进行建模。它建模了一种异步计算，返回一个执行结果的引用，当运算结束后，这个引用被返回给调用方。

- 在 `Future` 的一个优点是，调用线程可以将那些耗时的任务交给它处理，调用线程就能够继续执行其他有价值的工作；
- 另一个优点是它比底层的 `Thread` 更易用。要使用 `Future`，只需要将耗时的操作封装在一个 `Callable` 对象，再将它交给 `ExecutorService` 就可以了。

可以这样去使用它（）：

```java
public class FutureDemo01 {

    public static void main(String[] args) {
        // 为了方便演示，这里直接使用 Executors 工厂构建线程池
        ExecutorService pool = Executors.newCachedThreadPool();
        
        // 异步计算任务
        Future<Double> future = pool.submit(() -> {
            // do something compute tasks...
            // case: return computedTask();
            return 12.00;
        });
        
        try {
            // 获取异步任务结果，推荐使用超时 get() 获取结果
            // 程序执行到此处，如果计算任务还未完成，则最多等待 1s，1s 内无法完成任务就抛出异常
            future.get(1L, TimeUnit.SECONDS);
        } catch (ExecutionException e) {
            // 处理计算异常
        } catch (InterruptedException e) {
            // 处理线程中断异常
        } catch (TimeoutException e) {
            // 处理超时异常
        } finally {
            pool.shutdown();
        }
    }
}
```

上面这种编程方式可以让线程在 `ExecutorService` 中以并发的方式调用另一个线程执行耗时的操作，然后再去执行其他任务。

关于结果的获取：

- 调用无参 `get()` 方法获取操作的结果，如果操作已经完成，该方法会立即返回操作的结果，否则它会阻塞调用线程，直到操作完成，返回相应的结果；
- 考虑这种情况，一旦异步任务执行出现了问题，长时间无法返回结果，会造成线程一直阻塞，为了处理这种可能性，我们应该使用重载的 `get` 方法，它接受一个超时的参数，通过它，可以定义线程等待 `Future` 结果的最长时间，这样就不会永远等下去。

## 3、Future 接口的局限性

`Future` 接口提供方法并不足以让我们编写出简洁的并发代码，比如说，我们很难描述 `Future` 结果之间的依赖性。

像下面这些需求：

- 将两个异步计算合并为一个 —— 这两个异步计算之间相互独立，同时第二个又依赖于第一个的结果；
- 等待 `Futrue` 集合中的所有任务都完成；
- 仅等待 `Futrue` 集合中最快结束的任务完成（比如说我们想测试哪种方式可以最快的完成同一种计算任务），并返回它的结果；
- 通过编程方式完成一个 `Future` 任务的执行（即以手工方式设定异步操作结果的方式）；
- 应对 `Futrue` 的完成事件（即当 `Future` 的完成事件发生时会收到通知，并能使用 `Future` 计算的结果进行下一步操作，不只是简单地阻塞线程等待操作的结果）。

而这些特性可以通过 Java 8 引入的 `CompletableFutrure` 类实现这些需求。

`Stream` 和 `CompletableFutrure`  的设计都遵循了类似的模式：都使用了 **Lambda** 表达式以及流水线的思想。

`CompletableFutrure`  和 `Future` 从某种角度上看，类似于 `Stream` 和 `Collection`。



# 三、CompletableFuture 类

## 1、同步 API 和 异步 API

先了解两个概念：

- **同步 API**：就是传统的调用方式，调用了某个方法，调用方在被调用方运行的过程中会等待，被调用方运行结束返回，调用方取得被调用方的返回值并继续运行。即使调用方和被调用方在不同的线程中运行，调用方还是需要等待被调用方运行结束，这就是 <mark>阻塞式调用</mark> 这个名词的由来；
- **异步 API**：于此相反，异步 API 会直接返回，或者至少在被调用方计算完成之前，将它剩余的计算任务交给另一个线程去做，该线程和调用方是异步的 —— 这就是 <mark>非阻塞式调用</mark> 的由来。执行剩余计算任务的线程会将它的计算结果返回给调用方。返回的方式要么是通过回调函数，要么是由调用方再次执行一个 "等待，直到计算完成" 的方法调用。这种方式的计算在 I/O 系统程序设计中非常常见：你发起了一次磁盘访问，这次访问和你的其他计算操作是异步的，你完成其他任务时，磁盘块的数据可能还没有载入内存，你只需要等待数据的载入完成。



## 2、实现异步 API

举个例子，假如说我们需要一个 "最佳价格查询器" 的应用，它会查询多个在线商店，依据给定的产品或者服务找出最低的价格。

为了实现它，我们应该要求每个商店都提供一个 API。

首先商店应该声明指定产品名称返回价格的方法：

```java
public class Shop {
    public double getPrice(String product) {
        // TODO
        return 0.00;
    }
}
```

该方法内部实现会查询商店的数据库，但也有可能执行一些其他耗时的任务，比如联系其他外部服务（比如，商店的供应商，或者跟制造商的推广折扣），这部分的性能消耗可以通过一个 `delay` 方法来模拟执行任务：

```java
public static void delay() {
    try {
        // 假设耗费 1s
        TimeUnit.SECONDS.sleep(1L);
    } catch (InterruptedException e) {
        throw new RuntimeException();
    }
}
```

重构 `getPrice` 方法：

```java
public double getPrice(String product) {
    return calculatePrice(product);
}

private double calculatePrice(String product) {
    delay();
    return ThreadLocalRandom.current().nextDouble() * product.charAt(0) + product.charAt(1);
}
```

当调用者调用这个同步 API 时，会被阻塞 1 秒钟，在实际中这是无法接受的，我们要学会以异步的方式使用同步 API。

### （1）将同步方法转换为异步方法

为了实现目标，我们需要将 `getPrice` 方法转换为 `getPriceAsync` 方法，并修改它的返回值：

```java
public Future<Double> getPriceAsync(String produce) {}
```

`Future` 意味着一个暂时还不可知值的处理器，这个值在计算完成之后，可以通过调用它的 `get` 方法取得。因此 `getPriceAsync` 才可以立即返回，给调用线程一个机会，能在同一时间去执行其他有价值的计算任务。

而新的 `CompletableFuture` 类提供了大量的方法，让我们有机会以多种可能的方式轻松实现这个方法：

```java
public Future<Double> getPriceAsync(String product) {
    // 创建 CompletableFuture 对象，它会包含计算的结果
    CompletableFuture<Double> futurePrice = new CompletableFuture<>();

    // 在另一个线程中以异步方式执行计算
    // 实际我们会创建 Callable 丢给线程池处理，这里为了演示，直接开启线程
    new Thread(() -> {
        // 需要长时间计算的任务
        double price = calculatePrice(product);
        // 计算结束后，设置 Future 的返回值
        futurePrice.complete(price);
    }).start();

    // 无需等待还未结束的计算，直接返回
    return futurePrice;
}
```

这段代码中：

- 我们创建一个 `CompletableFuture` 实例，它在计算完成时会包含计算的结果；
- 接着 fork 了另一个线程去执行实际的价格计算工作，不等该耗时计算任务结束，直接返回一个 `Future` 实例；
- 当请求的产品价格最终计算得出时，可以使用它的 `complete` 方法，结束 `CompletableFuture` 实例对象的运行，并设置变量的值。

显然，这个新版 `Future` 的名称就解释了它所具有的特性。可以通过如下代码调用该异步 API：

```java
public class Test {

    public static void main(String[] args) {
        Shop shop = new Shop("BestShop");

        long start = System.nanoTime();

        Future<Double> futurePrice = shop.getPriceAsync("my favorite product");
        
        long invocationTime = ((System.nanoTime() - start) / 1_000_000);

        System.out.println("Invocation returned after " + invocationTime +  " msecs");
        
        // 执行更多任务，比如查询其他商店
        // doSomethingElse();
        
        // 在计算商品价格的同时
        try {
            double price = futurePrice.get();
            System.out.printf("Price is %.2f%n", price);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
       
        
        long retrievalTime = ((System.nanoTime() - start) / 1_000_000);
        System.out.println("Price returned after " + retrievalTime + " msecs");
    }
}
```

在这段代码中，客户在进行商品价格查询的同时，还能执行一些其他任务，比如查询其他商店中商品的价格，不会呆呆地阻塞在那里等待第一家商店返回结果。

最后，所有有意义的工作都已经完成，客户所有要执行的工作依赖于商品价格的时候，在调用 `Future` 的 `get` 方法，执行该操作后，客户要么获得 `Future` 中封装的值（前提是异步任务顺利完成），要么发生阻塞，直到该异步任务完成，期望的值能够访问。



### （2）错误处理

上面的例子存在一个问题，就是如果价格计算过程出现了错误该怎么办？

事实就是一旦出现了错误，用于提示错误的异常会被限制在试图计算商品价格的当前线程的范围内，最终会杀死该线程，而这会导致等待 `get` 方法返回结果的客户端永久地被阻塞。

客户端可以使用重载的 `get` 方法，它使用一个超时参数来避免发生这样的状况。

我们应该尽量在代码中添加超时判断的逻辑，避免发生类似的问题。使用这种方法至少能防止程序永久地等待下去，超时发生时，程序会得到通知发生了 `TimeoutException`，不过，也正因为如此，我们无法知道计算商品价格线程内到底发生了什么问题才引发了这样的失效。

为了让客户端能够知道商店无法提供请求商品价格的原因，我们需要使用 `CompletableFuture` 的 `completeExceptionally` 方法将导致 `CompletableFuture` 内发生问题的异常抛出。

优化代码如下：

```java
public Future<Double> getPriceAsync(String product) {
    CompletableFuture<Double> futurePrice = new CompletableFuture<>();
    new Thread(() -> {
        try {
            // 如果计算任务正常执行，就直接设置值
            double price = calculatePrice(product);
            futurePrice.complete(price);
        } catch (Exception ex) {
            // 如果出现问题，就将异常信息抛出
            futurePrice.completeExceptionally(ex);
        }
    }).start();

    return futurePrice;
}
```

现在一旦出现了异常，客户端就会收到一个 `ExecutionException` 异常，该异常接收了一个包含失败原因的 `Exception` 参数，即价格计算方法最初抛出的异常。

### （3）使用工厂方法 supplyAsync 创建 CompleteFuture

现在我们已经知道了如何通过编程创建 `CompletableFuture` 对象以及如何获取返回值，现在可以更进一步，`CompletableFuture` 类自身提供了大量精巧的工厂方法，使用这些方法可以更容易的完成整个流程，而不必担心实现的细节。

比如，采用 `supplyAsync` 方法后，可以使用一行代码重写 `getPriceAsync` 方法：

```java
public Future<Double> getPriceAsync(String product) {
    return CompletableFuture.supplyAsync(() -> calculatePrice(product));
}
```

`supplyAsync` 方法接收一个生产者（`Supplier`）作为参数，返回一个 `CompletableFuture` 对象，该对象完成异步执行后会读取调用生产者方法的返回值。生产者方法会交由 `ForkJoinPool` 池中的某个执行线程 `Executor` 去运行，但是我们也可以通过 `supplyAsync` 的重载版本，传递第二个参数指定不同的执行线程去执行生产者方法。

一般而言，向 `CompletableFuture` 的工厂方法传递可选参数，指定生产者方法的执行线程是可行的，适当的时候使用可以提高性能。

此外 `supplyAsync` 也提供了同样的错误管理机制。

完整代码如下：

```java
public class Shop {
    
    private String name;

    public Shop(String name) {
        this.name = name;
    }

    // 模拟延迟
    public static void delay() {
        try {
            TimeUnit.SECONDS.sleep(1L);
        } catch (InterruptedException e) {
            throw new RuntimeException();
        }
    }

    // 计算任务
    private double calculatePrice(String product) {
        delay();
        return ThreadLocalRandom.current().nextDouble() * product.charAt(0) + product.charAt(1);
    }
    
	// 异步 API
    public Future<Double> getPriceAsync(String product) {
        return CompletableFuture.supplyAsync(() -> calculatePrice(product));
    }
}
```

测试：

```java
public class Test {

    public static void main(String[] args) {
        Shop shop = new Shop("BestShop");

        long start = System.nanoTime();

        Future<Double> futurePrice = shop.getPriceAsync("my favorite product");
        
        long invocationTime = ((System.nanoTime() - start) / 1_000_000);

        System.out.println("Invocation returned after " + invocationTime +  " msecs");
        
        // 执行更多任务，比如查询其他商店
        // doSomethingElse();
        
        // 在计算商品价格的同时
        try {
            double price = futurePrice.get();
            System.out.printf("Price is %.2f%n", price);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        
        long retrievalTime = ((System.nanoTime() - start) / 1_000_000);
        System.out.println("Price returned after " + retrievalTime + " msecs");
    }
}
```



## 3、避免阻塞

假如说所有的商店只提供了同步 API，我们现在有一个商店的列表：

```java
List<Shop> shops = Arrays.asList(new Shop("BestPrice"),
                new Shop("ShopOne"),
                new Shop("ShopTwo"),
                new Shop("ShopThree"),
                new Shop("ShopFour"));
```

我们需要使用下面的方法，接收一个产品名作为参数，返回一个字符串列表，字符串包含商店的名称、该商店中指定商品的价格：

```java
public List<String> findPrices(String product);
```



### （1）使用并行流进行并行操作

> 方案一：使用顺序流

```java
public List<String> findPrices(String product) {
    return shops.stream()
        .map(shop -> String.format("%s price is %.2f", shop.getName(), shop.getPrice(product)))
        .collect(Collectors.toList());
}
```

测试一下看看时间，发现大约：`5s81ms`

测试代码：

```java
@org.junit.Test
public void test() {
    long start = System.currentTimeMillis();

    findPrices("iphone13");

    long end = System.currentTimeMillis();
    long duration = end - start;
    System.out.println(duration / 1000  + "s" + duration % 1000 + "ms");
}
```

采用顺序流对五个商店的查询是顺序进行的，并且一个查询会阻塞另一个查询，每一个操作会花费大约 1 s 左右的时间，该如何改进呢？

> 方案二：使用并行流

```java
public static List<String> findPrices(String product) {
    return shops.stream()
        .map(shop -> String.format("%s price is %.2f", shop.getName(), shop.getPrice(product)))
        .parallel()
        .collect(Collectors.toList());
}
```

再次测试，发现大约：`1s52ms`，只有 1 s 多一点。

### （2）使用 CompletableFuture 发起异步请求

> 方案三：使用 CompletableFuture

```java
public static List<String> findPrices(String product) {
    List<CompletableFuture<String>> priceFutures =  
        shops.stream()
        .map(shop -> CompletableFuture.supplyAsync(() -> {
            return String.format("%s price is %.2f", shop.getName(), shop.getPrice(product));
        }))
        .collect(Collectors.toList());

    return priceFutures.stream()
        .map(CompletableFuture::join)
        .collect(Collectors.toList());
}
```

使用这种方式，我们会得到一个 `List<CompletableFuture<String>>`，列表中的每一个 `CompletableFuture` 对象在计算完成之后都包含双电的 String 类型的名称，但是我们的 `findPrices` 方法要求返回一个 `List<String>`，所以需要等待所有的 `Future` 执行完毕后，将其中包含的值抽取出来，填充到列表中才可以返回。

为了实现这个需求，我们可以给 `List<CompletableFuture<String>>` 追加一个 `map` 操作，对 List 中的所有 Future 进行 `join` 操作，一个接一个地等待它们运行结束。

注意 `CompletableFuture` 类的 `join` 方法和 `Future` 接口的 `get` 方法有相等的含义，并且也声明在 `Future` 接口中，它们唯一的不同就在于 `join` 不会抛出任何检测到的异常。我们不需要使用 `tyr...cathch` 包裹它。

> 小结

方案三使用了两种不同的 `Stream` 流水线，而不是在同一个处理流的流水线上一个接一个地放置两个 `map`操作，这是有原因的。

**要考虑流操作之间的延迟特性，它会引起顺序执行**。

如下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220219164810.png)

上半部分展示的是使用单一流水线处理流的过程：

```java
shops.stream()
    .map(shop -> CompletableFuture.supplyAsync(() -> {
        return String.format("%s price is %.2f", shop.getName(), shop.getPrice(product));
    }))
    .map(CompletableFuture::join)
    .collect(Collectors.toList());
```

此时执行的流程（虚线标识）是顺序的。新的 `CompletableFuture` 对象只有在前一个操作完全结束之后，才能创建。

与此相反，图的下半部分展示了如何先将 `CompletableFuture` 对象聚集到一个列表中，让对象们可以在其他对象完成操作之前就能启动。

运行程序测试后发现方案三消耗的时间反而比并行流要多，方案二使用的代码还要更少。



### （3）两者的比对

并行流版本性能高是因为它能并行执行五个任务，所以它几乎能为每个商家分配一个线程。但是，如果商家的数量要比运行程序的机器的 CPU 核数多，多出来的商家的查询价格任务线程就只能等待前面的某些操作完成释放资源后才能继续执行。

比如说，我的电脑是 12 核的：

| 商店数 | CPU 核数 | 并行流消耗时间（大约） | CompletableFuture 消耗时间（大约） |
| ------ | -------- | ---------------------- | ---------------------------------- |
| 12     | 12       | 1s49ms                 | 1s55ms                             |
| 14     | 12       | 2s65ms                 | 2s62ms                             |
| 16     | 12       | 2s72ms                 | 2s70ms                             |

`CompletableFuture` 版本似乎比并行流版本快了一点点，它们看起来不相伯仲，究其原因都一样：它们内部采用的是同样的通用线程池，默认都使用固定数目的线程，具体线程数取绝于 `Runtime.getRuntime().availableProcessors()` 返回值。

然而 `CompletableFuture` 具有一定的优势，因为它允许你对执行器（`Executor`）进行配置，尤其是线程池的大小，让它以更适合应用需求的方式进行配置，满足程序的要求，而这是并行流 API 无法提供的。



### （4）使用定制的执行器

一种更好的做法是创建一个配有线程池的执行其，线程池中线程的数目取决于你预估你的应用需要处理的负荷。

如果线程池中线程的数量过多，最终它们会竞争稀缺的处理器核内存资源，浪费大量的时间在上下文切换上。反之，如果线程的数目过少，处理器的一些核可能就无法充分利用。

线程池大小与处理器的利用率之比可以使用下面的公式进行估算：
$$
N_{threads} = N_{CPU} * U_{CPU} * (1 + W/C)
$$
其中：

- N<sub>CPU</sub> 是处理器的核的数量，可以通过 `Runtime.getRuntime().availableProcessors()` 得到；
- U<sub>CPU</sub> 是期望的 CPU 利用率（该值介于 0 和 1 之间）；
- W/C 是等待时间和计算时间的比率。

你的应用 99% 的时间都在等待商店的响应，所以估算出的 W/C 比率为 100.这意味着如果你期望的 CPU 利用率是 100%，你就需要创建一个拥有 1200 个线程的线程池。

实际操作中，如果你创建的线程数比商店的数目更多，反而是一种浪费，因为这样做之后，线程池中有些线程根本没有机会使用。出于这种考虑，建议将执行器使用的线程数与需要潮汛的商店数目设定为同一个值，这样每个商店都应该对应一个服务线程。

不过，为了避免发生由于商店的数目过多导致服务器超负荷而崩溃，我们应该设置一个上限，比如 100 个线程：

```java
private final Executor executor = 
    new ThreadPoolExecutor(Math.min(shops.size(), 100),
                           100,
                           1L,
                           TimeUnit.SECONDS,
                           new LinkedBlockingQueue<>(100),
                           r -> {
                               Thread thread = new Thread(r);
                               thread.setDaemon(true); // 该线程池创建的线程为守护线程
                               return thread;
                           },
                           new ThreadPoolExecutor.CallerRunsPolicy());
```

注意，上面代码创建的是一个由 **守护线程** 构建的线程池。

- Java 程序无法终止或者退出一个正在运行中的普通线程，所以最后剩下的那个线程会由于一直等待无法发生的事件而引发问题；
- 如果将线程标记为守护线程，意味着程序退出时它也会被回收。
- 二者并没有性能上的差异。

将 executor 传递给 `supplyAsync` 工厂方法：

```java
public List<String> findPrices(String product) {
    List<CompletableFuture<String>> priceFutures =  
        shops.stream()
        .map(shop -> CompletableFuture.supplyAsync(() -> {
            return String.format("%s price is %.2f", shop.getName(), shop.getPrice(product));
        }, executor))
        .collect(Collectors.toList());

    return priceFutures.stream()
        .map(CompletableFuture::join)
        .collect(Collectors.toList());
}

// 测试
@org.junit.Test
    public void test() {
    long start = System.currentTimeMillis();

    findPrices("iphone13");

    long end = System.currentTimeMillis();
    long duration = end - start;
    System.out.println(duration / 1000  + "s" + duration % 1000 + "ms");
}
```

最后我们会发现，该方案处理 16 个商店仅仅耗时大约 1s19ms。一般而言，这种状态会一直持续，直到商店的数目达到我们之前计算的阈值 1200。

<mark>这个例子证明了要创建适合应用特性的执行器，利用 CompletableFurture 向其提交任务执行是个不错的方式，处理需大量使用异步操作的情况时，这几乎是最有效的策略。</mark>

最终代码如下：

```java
public class Test {
    
    private final Executor executor;
            
    public List<Shop> shops;

    public Test(List<Shop> shops) {
        this.shops = shops;
        this.executor = new ThreadPoolExecutor(Math.min(shops.size(), 100),
                1200,
                1L,
                TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(100),
                r -> {
                    Thread thread = new Thread(r);
                    thread.setDaemon(true); // 该线程池创建的线程为守护线程
                    return thread;
                },
                new ThreadPoolExecutor.CallerRunsPolicy());
    }
    
    public List<String> findPrices(String product) {
        List<CompletableFuture<String>> priceFutures =  
                 shops.stream()
                        .map(shop -> CompletableFuture.supplyAsync(() -> {
                            return String.format("%s price is %.2f", shop.getName(), shop.getPrice(product));
                        }, executor))
                        .collect(Collectors.toList());

        return priceFutures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());
    }

    public static void main(String[] args) {
        ArrayList<Shop> shops = new ArrayList<>();
        for (int i = 0; i < 1200; i++) {
            shops.add(new Shop(UUID.randomUUID().toString().substring(0, 7)));
        }

        Test test = new Test(shops);

        long start = System.currentTimeMillis();

        test.findPrices("Iphone13");

        long end = System.currentTimeMillis();
        long duration = end - start;
        System.out.println(duration / 1000  + "s" + duration % 1000 + "ms");
    }
}
```

执行完 1200 次任务大约耗时：`2s56ms`



## 4、总结和建议

到目前为止，我们已经知道对集合进行并行计算有两种方式：

- 要么将其转化为并行流，利用 `map` 这样的操作开展工作；
- 要么枚举出集合中的每一个元素，创建新的线程，在 `CompletableFuture` 内对其进行操作。

后者提供了更多的灵活性，你可以调整线程池的大小，这能够帮助我们确保整体的计算不会因为线程都在等待 I/O 而发生阻塞。

对这些 API 的使用建议如下：

- 如果进行的是计算密集型的操作，并且没有 I/O，那么推荐使用 `Stream` 接口，因为实现简单，同时效率也可能是最高的（如果所有的现场都是计算密集型的，那么就没有必要创建比处理器核数更多的线程）；
- 反之，如果你并行的工作单元还涉及等待 I/O 的操作（包括网络连接等待），那么使用 `CompletableFuture` 灵活性更好，可以像之前那样，根据等待/计算，或者 W/C 的比率设定需要使用的线程数。这种情况不使用并行流的另一个原因是，处理流的流水线中如果发生了 I/O 等待，流的延迟特性会让我们很难判断到底什么时候发生了等待。

<mark>提示：目前，我们每个 Future 中进行的都是单次的操作。</mark>



# 四、对多个异步任务进行流水线操作

假设所有的商店都使用同一个集中式的折扣服务。该折扣服务提供了五个不同的折扣代码，每个折扣代码对应不同的折扣率。可以使用一个枚举类型的变量表示：

```java
public class Discount {
    
    public enum Code {
        NONE(0), 
        
        SILVER(5), 
        
        GOLD(10), 
        
        PLATINUM(15), 
        
        DIAMOND(20);
        
        private final int percentage;

        Code(int percentage) {
            this.percentage = percentage;
        }
    }
}
```

假设现在 `getPrice` 方法的返回字符串格式为：`ShopName:price:DiscountCode`。

代码如下：

```java
public String getPrice(String product) {
    double price = calculatePrice(product);

    Discount.Code code = Discount.Code
        .values() [ThreadLocalRandom.current().nextInt(Discount.Code.values().length)];

    return String.format("%s:%.2f:%s", name, price, code);
}

private double calculatePrice(String product) {
    delay();
    return ThreadLocalRandom.current().nextDouble() * product.charAt(0) + product.charAt(1);
}
```



## 1、实现折扣服务

现在我们的应用应该能从不同的商店取得商品价格，解析结果字符串，针对每个字符串，查询折扣服务对应的折扣代码。这个流程决定了商品的最终折扣价格（每个代码的实际折扣比率可能会发生变化，所以每次都需要查询折扣服务。

将对字符串的解析操作封装到下面的类中：

```java
public class Quote {
    
    private final String shopName;
    
    private final double price;
    
    private final Discount.Code discountCode;

    public Quote(String shopName, double price, Discount.Code discountCode) {
        this.shopName = shopName;
        this.price = price;
        this.discountCode = discountCode;
    }
    
    public static Quote parse(String s) {
        String[] split = s.split(":");
        String shopName = split[0];
        double price = Double.parseDouble(split[1]);
        Discount.Code discountCount = Discount.Code.valueOf(split[2]);
        
        return new Quote(shopName, price, discountCount);
    }
}
```

通过传递字符串给静态工厂方法 `parse`，我们可以得到一个 `Quote` 类的一个实例，它包含了 shop 的名称、折扣之前的价格、以及折扣代码。

`Discount` 服务还提供了一个 `applyDiscount` 方法，它接收一个 `Quote` 对象，返回一个字符串，表示生成该 `Quote` 的 shop 中的折扣价格：

```java
public class Discount {
    
    public enum Code { ... }
    
    public static String applyDiscount(Quote quote) {
        return quote.getShopName() + " price is " + 
                String.format("%.2f", Discount.apply(quote.getPrice(), quote.getDiscountCode()));
    }
    
    private static double apply(double price, Code code) {
        delay();
        return (price * (100 - code.percentage) / 100);
    }

    public static void delay() {
        try {
            TimeUnit.SECONDS.sleep(1L);
        } catch (InterruptedException e) {
            throw new RuntimeException();
        }
    }
}
```



## 2、使用 Discount 服务

由于 `Discount` 服务是一种远程服务，所以需要增加 1 s 的延迟。

首先尝试以顺序且同步的方式去实现 `findPrices` 方法：

```java
public List<String> findPrices(String product) {
    return shops.stream()
        .map(shop -> shop.getPrice(product))
        .map(Quote::parse)
        .map(Discount::applyDiscount)
        .collect(Collectors.toList());
}
```

通过在 shop 构成的流上采用流水线的方式执行三次 map 操作，得到了期望的结果：

- 第一个操作将每个 shop 对象转换成了一个字符串，该字符串中包含了该 shop 中指定商品的价格和折扣代码；
- 第二个操作对这些字符串进行了解析，在 Quote 对象中对它们进行转换；
- 最终，第三个 map 会操作联系远程的 Discount 服务，计算出最终的折扣价格，并返回该价格及提供该价格商品的 shop。

测试后发现 5 家商店，大约耗时：`10s134ms`

因为顺序查询 5 个商店耗时大约 5s，现在又加上 Discount 服务为 5 家商店返回的价格申请折扣所消耗的 5 秒钟。

如果转换为异步 API，现在有两种思路：

- 方案一：把流转换为并行流，但是需要注意流的延迟性；当商店是数目增加时，扩展性不好，因为 `Stream` 底层依赖的是线程数量固定的通用线程池；
- 方案二：自定义 `CompletableFuture` 使用的执行器 `Executor` 可以更好的利用 CPU 资源。



## 3、构建同步和异步操作

再次使用 `CompletableFuture`，以异步方式重构 `findPrices` 方法：

```java
public List<String> findPrices(String product) {
    List<CompletableFuture<String>> priceFutures = 
        shops.stream()
        .map(shop -> CompletableFuture.supplyAsync(
            () -> shop.getPrice(product), executor
        ))
        .map(future -> future.thenApply(Quote::parse))
        .map(future -> future.thenCompose(quote -> 
                                          CompletableFuture.supplyAsync(
                                              () -> Discount.applyDiscount(quote), executor
                                          )))
        .collect(Collectors.toList());

    return priceFutures.stream()
        .map(CompletableFuture::join)
        .collect(Collectors.toList());
}
```

此时经过测试会发现，即使是 20 家商店，也只是大约耗时：`2s48ms`

上面的代码大致流程如下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220219185731.png)

这三次 map 操作其实和前面的同步方案没有太大的区别，只不过使用了 `CompletableFuture` 类提供的特性，在需要的地方把它们变成了异步操作：

（1）获取价格

第一个操作就是调用 `supplyAsync` 工厂方法以异步方式对 shop 进行查询。第一个转换的结果是一个 `Stream<CompletableFuture<String>>`，一旦运行结束，每个 `CompletableFuture` 对象中都会包含对应 shop 返回的字符串。注意，这里使用了之前定制的 Executor。

（2）解析报价

第二次转换将字符串转变为订单。由于一般情况下解析操作不涉及任何远程服务，也不会进行 I/O 操作，它几乎可以在第一时间进行，所以能够采用同步操作，不会带来太多的延迟。由于这个原因，我们可以对第一步中生成的`CompletableFuture` 对象调用它的 `thenApply`，调用解析方法解析每个字符串。

注意：直到调用 `CompletableFuture` 执行结束，使用的 `thenApply` 方法都不会阻塞代码的运行。这意味着 `CompletableFuture` 最终结束运行时，你希望传递 lambda 表达式给 `thenApply` 方法，将 Stream 中每个 `CompletableFuture<String>` 对象转换为对应的 `CompletableFuture<Quote>` 对象。

可以看作是为处理 `CompletableFuture` 的结果建立了一个菜单，和 Stream 的流水线所做的事情一样。

（3）为计算折扣价格构建 Future

第三个 map 操作涉及远程 Discount 服务，为从商店中得到的原始价格申请折扣率。这一个转换和第二个转换又不大一样，因为这一转换需要远程执行，出于这一原因，我们希望它可以异步执行。

为了实现这一目标，和第一步一样，我们需要传递一个方法给 `applyAsync` 工厂方法用来构建 `CompletableFuture` 对象。

到目前位置，进行了两次异步操作，用来两个不同的 `CompletableFuture` 对象进行建模，现在，我们希望它们能够以级联的方式串联起来工作。

- 从 Shop 对象中获取价格，接着把价格转换为 Quote；
- 拿到返回的 Quote 对象，将其作为参数传递给 Discount 服务，取得最终价格。

Java 8 的 `CompletableFuture` API 提供了 `thenCompose` 方法，它就是专门为了完成这一目的而设计的，`thenCompose` 方法允许对两个异步操作进行流水线，第一个操作完成时，将其作为参数传递给第二个操作。

（4）剩下的步骤就和之前一样了

> 小结

在 `CompletableFuture`  API 提供的方法中：

- 通常名称中不带 **Async** 的方法就和它的前一个任务一样，在同一个线程中运行；
- 而名称以 **Async** 结尾的方法会将后续的任务提交到一个线程池，所以每个任务都是不同的线程处理的。

就这个例子而言，第二个 `CompletableFuture`  对象的结果取绝于第一个 `CompletableFuture`  。无论使用那个版本的 compose 来处理 `CompletableFuture`  对象，对于最终的结果，或者大致的时间而言都没有多少差别。

之所以选择 `thenCompose` 方法，是因为它更高效一些，少了很多线程切换的开销。



## 4、结合两个 CompletableFuture

在上面的例子中，两个 `CompletableFuture` 是有关系的，第二个需要第一个的执行结果作为参数。

但是，另一种比较常见的情况是，需要将两个完全不相干的 `CompletableFuture` 对象的结果整合起来，而且你也不希望等到第一个任务完全结束才开始第二个任务。

这种情况应该使用 `thenCombine` 方法，它接收名为 `BiFunction` 的第二参数，这个参数定义了当两个 `CompletableFuture` 对象完成计算后，结果如何合并。

同 `thenCompose` 方法一样，`thenCombine` 也提供了一个 Async 的版本。这里，如果使用 `thenCombineAsync` 会导致 `BiFunction` 中定义的合并操作被提交到线程池中，由另一个任务以异步的方式执行。

比如说，有一家商店提供的价格是以欧元（EUR）计价的，但是你希望以美元的方式提供给你的客户。你可以使用异步的方式向商店查询指定商品的价格，同时从远程的汇率服务那里查到欧元和美元之间的汇率。当二者都结束的时候，再将这两个结果结合起来，用返回的商品价格乘以当时的汇率，得到以美元计价的商品价格。

用这种方式就需要第三个 `CompletableFuture` 对象，当前两个 `CompletableFuture` 计算出结果，并由 `BiFunction` 方法完成合并之后，由它来终结这一任务：

```java
Future<Double> futurePriceInUSD = 
    CompletableFuture.supplyAsync(() -> shop.getPrice(product))
    .thenCombine(
    	CompletableFuture.supplyAsync(
        	() -> exchangeService.getRate(Money.EUR, Money.USD)),
    		(price, rate) -> price * rate
	);
```

这里整合的操作仅仅是简单的乘法操作，用另一个线程来做有些浪费资源，所以只需要使用 `thenCombine` 就可以了，无需使用 Async 版本。



## 5、总结

Java 8 提供的 Future 的新实现类 `CompletableFuture` 利用 Lambda 表达式以声明式的 API 提供了一种机制，能够用最有效的方式，非常容易地将多个以同步活异步方式执行复杂操作的任务结合到一起。



# 五、响应 CompletableFuture 的 completion 事件

在实际应用中，由于多方面的因素，调用远程服务带来的延时总是不太一样的，在之前演示的商店应用中，有时候，我们希望只要有商店返回商品价格就在第一时间显示返回值，不再等待那些还未返回的商店（有时候还会发生超时）。

下面的方法提供 0.5 - 2.5 秒的随机延迟：

```java
public static void randomDelay() {
    int delay = 500 + ThreadLocalRandom.current().nextInt(2000);

    try {
        TimeUnit.MILLISECONDS.sleep(delay);
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    }
}
```



## 1、优化最佳价格查询器应用

之前的案例中，我们返回的是一个包含了所有价格的 List。现在应该做的是直接处理 `CompletableFuture` 流，这样每个 `CompletableFuture` 都在为某个商店执行必要的操作。

重构代码如下：

```java
public Stream<CompletableFuture<String>> findPricesStream(String product) {
    return shops.stream()
        .map(shop -> CompletableFuture.supplyAsync(
            () -> shop.getPrice(product), executor
        ))
        .map(future -> future.thenApply(Quote::parse))
        .map(future -> future.thenCompose(quote ->
                                          CompletableFuture.supplyAsync(
                                              () -> Discount.applyDiscount(quote), executor
                                          )));
}
```

现在要为 `findPricesStream` 方法返回的 Stream 添加第四个 map 操作，这个新的操作很简单，只是在每个 `CompletableFuture` 上注册一个操作，该操作会在 `CompletableFuture` 完成执行后使用它的返回值。

Java 8 的 `CompletableFuture` 通过 `thenAccept` 方法提供了这一功能，它接收 `CompletableFuture` 执行完毕后的返回值作为参数。

在这里的例子中，该值是 Discount 服务返回的字符串，它包含了提供请求商品的商店名称和折扣价格，我们想要做的也很简单，只需要将结果打印出来就可以了。

```java
findPricesStream("iPhone13").map(f -> f.thenAccept(System.out::println));    
```

注意，`thenAccept` 也提供一个异步版本，名为 `thenAcceptAsync`。异步版本的方法会对处理结果的消费者进行调度，从线程池中选取一个新的线程继续执行，不再由同一个线程完成 `CompletableFuture` 的所有任务。但是这里我们想要避免不必要的上下文切换，更重要的是希望避免在等待线程上浪费时间，尽快响应 `CompletableFuture` 的 `completion` 事件，所以这里没有采用异步版本。

一旦 `CompletableFuture` 计算得到结果，它就会返回一个 `CompletableFuture<Void>`。所以第四个 map 返回的结果就是 `Stream<CompletableFuture<Void>>`。对于 `CompletableFuture<Void>` 这个对象，我们能做的事情非常有限，只能等待其运行结束，不过这也是我们期望的。

如果希望给慢一些的商店一个机会，让它有机会打印输出返回的价格。为了实现这一目的，可以把构成 Stream 的所有 `CompletableFuture<Void>`对象放到一个数组里，等待所有的任务执行完成，代码如下：

```java
CompletableFuture[] futures = findPricesStream("iPhone13").map(f -> f.thenAccept(System.out::println))
    .toArray(size -> new CompletableFuture[size]);

CompletableFuture.allOf(futures).join();
```

`allOf` 工厂方法接收一个由 `CompletableFuture` 构成的数组，数组中的所有 `CompletableFuture` 对象执行完成之后，它返回一个 `CompletableFuture<Void>` 对象。

这意味着，如果需要等待最初 Stream 中的所有 `CompletableFuture` 对象执行完毕，对 allOf 方法返回的对象执行 `join` 是个不错的主意。

然而在另外一些场景中，你可能希望只要 `CompletableFuture` 对象数组中有任何一个执行完毕就不再等待，比如，正在查询两个汇率服务器，任何一个返回了结果都能满足需求，此时，可以使用另外一个工厂方法 `anyOf`。该方法接收一个 `CompletableFuture` 对象构成的数组，返回由第一个执行完毕的 `CompletableFuture` 对象的返回值构成的 `CompletableFuture<Object>`。

代码如下：

```java
CompletableFuture.anyOf(futures).join();
```



## 2、测试

现在由于我们使用的延时方法会让线程休眠 0.5 s 到 2.5 s，为了让测试效果更明显，可以重构一下代码，在输出中打印每个价格计算所消耗的时间：

```java
long start = System.currentTimeMillis();

CompletableFuture[] futures = test.findPricesStream("iPhone13")
    .map(f -> f.thenAccept(s -> 
                           System.out.println(s + " (done in " + (System.currentTimeMillis() - start) / 1000 + " s " + (System.currentTimeMillis() - start) % 1000 + " ms"))
        ).toArray(size -> new CompletableFuture[size]);
CompletableFuture.allOf(futures).join();

long end = System.currentTimeMillis();
long duration = end - start;
System.out.println("total elapsed time: " + duration / 1000  + "s" + duration % 1000 + "ms");
```

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220219215701.png)

可以看到，首先打印的是执行时间最快的。



# 六、小结

（1）执行比较耗时的操作，尤其是那些依赖一个或者多个远程服务的操作，使用异步任务可以改善程序的性能，加快程序的响应速度；

（2）应该尽可能的为客户提供异步 API。使用 `CompletableFuture` 类提供的特性，能够轻松实现这一目标；

（3）`CompletableFuture` 类还提供了异常管理机制，让开发者有机会抛出/管理异步任务执行中发生的异常；

（4）将同步 API 的调用封装到一个 `CompletableFuture` 中，就能够以异步的方式使用其结果；

（5）如果异步任务之间相互独立，或者它们之间某一些的结果是另一些的输入，可以将这些异步任务构造或者合并成一个；

（6）可以为 `CompletableFuture` 注册一个回调函数，在 `Future` 执行完毕或者它们计算的结果可用时，针对性地执行一些操作；

（7）可以决定在什么时候结束程序的运行，是等待由 `CompletableFuture` 对象构成的列表中所有的对象都执行完毕，还是只要其中任何一个首先完成就中止程序的运行；

（8）`CompletableFuture` 中有很多方法，可以结合 jdk 文档来学习使用。