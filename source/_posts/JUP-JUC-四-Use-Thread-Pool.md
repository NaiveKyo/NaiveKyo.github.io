---
title: JUP JUC (四) Use Thread Pool
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211208174745.jpg'
coverImg: /img/20211208174745.jpg
cover: false
toc: true
mathjax: false
date: 2022-02-17 22:24:59
summary: "Java 并发编程: 使用线程池处理并发任务"
categories: "Java Concurrent"
keywords: "Java Concurrent"
tags: "Java Concurrent"
---



# 线程池

## 1、简介

关于池化技术，之前或多或少都了解过一些，池化技术的出现是为了解决两方面的问题：

- 程序向操作系统申请资源所带来的性能消耗；
- 程序对系统资源的管理。

比如说 JDBC 连接池、Java 对象池、内存池、线程池，使用它们可以带来如下好处：

- 降低资源的消耗；
- 提高程序响应的速度；
- 方便管理；

比如说线程池：可以复用线程、控制最大并发数、管理线程资源。

<mark>线程池重要的知识点：三大方法、七大参数、四种拒绝策略</mark>

## 2、分析

从 JDK 1.5 开始 JDK 的开发团队为 Java 引入了和线程池相关的一些接口和类：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220217195023.png)

- `Executor` 定义了线程池可以执行 `Runnable` 类型的任务；
- `ExecutorService` 定义了线程池的一些管理操作；
- `AbstractExecutorService` 提供了 `ExecutorService` 的默认实现；

`Executors` 工厂工具类则提供了各种方法用于构建不同类型的 `Executor`，其本质就是初始参数不同的 `ThreadPoolExecutor`，一般建议开发者直接创建 `ThreadPoolExecutor` 对象，这样可以更好的理解各种线程池的运行规则。



## 3、Executors

`Executors` 中有三个方法最常用：

- `newSingleThreadExecutor`：创建单线程池, 即只有一个线程的线程池, 可以为其传递一个 `ThreadFactory` 类型的工厂实例用于创建线程；
- `newFixedThreadPool`：固定大小的线程池, 即固定线程数的线程池, 注意必须指定线程的总数量, 同时也有一个可选的 `ThreadFactory` 参数；
- `newCachedThreadPool`：可伸缩的线程池, 本质上是将最大线程数设置为 `Integer.MAX_VALUE`, 也有一个可选的 `ThreadFactory` 参数。

测试代码如下：

```java
public class EDemo01 {
    public static void main(String[] args) {
        ExecutorService singlePool = Executors.newSingleThreadExecutor();
        ExecutorService fixPool = Executors.newFixedThreadPool(5);
        ExecutorService cachedPool = Executors.newCachedThreadPool();

        run(singlePool);	// 一条线程运行 10 次
        // run(fixPool);	// 最多只有 5 条线程
        // run(cachedPool); // 线程数量不限 <= Integer.MAX_VALUE
    }

    public static void run(ExecutorService pool) {
        try {
            for (int i = 0; i < 10; i++) {
                pool.execute(() -> {
                    System.out.println(Thread.currentThread().getName() + " finish task");
                });
            }
        } finally {
            pool.shutdown();
        }
    }
}
```

## 4、ThreadPoolExecutor

### （1）Executors 分析

上面介绍的 `Executors` 的三个方法本质上其实是创建了不同的 `ThreadPoolExecutor` 对象：

源码如下：

```java
public static ExecutorService newSingleThreadExecutor() {
    return new FinalizableDelegatedExecutorService
        (new ThreadPoolExecutor(1, 1,
                                0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue<Runnable>()));
}

public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(nThreads, nThreads,
                                  0L, TimeUnit.MILLISECONDS,
                                  new LinkedBlockingQueue<Runnable>());
}

public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                  60L, TimeUnit.SECONDS,
                                  new SynchronousQueue<Runnable>());
}
```

可以看到它们的本质其实是创建 `ThreadPoolExecutor` 对象。



### （2）构造参数分析

重点看 `ThreadPoolExecutor` 类。

```java
public class ThreadPoolExecutor extends AbstractExecutorService {}
public abstract class AbstractExecutorService implements ExecutorService {}
public interface ExecutorService extends Executor {}
```

结合前面的继承图，我们知道，`ExecutorService` 定义了线程池使用池中的线程处理任务的能力以及一些管理方法，`AbstractExecutorService` 则为其提供了默认实现，而 `ThreadPoolExecutor` 在前者的基础上维护了一些统计信息。

看一下 `ThreadPoolExecutor` 的比较全面的构造函数：

```java
public ThreadPoolExecutor(int corePoolSize,
                          int maximumPoolSize,
                          long keepAliveTime,
                          TimeUnit unit,
                          BlockingQueue<Runnable> workQueue,
                          ThreadFactory threadFactory,
                          RejectedExecutionHandler handler) {
    if (corePoolSize < 0 ||
        maximumPoolSize <= 0 ||
        maximumPoolSize < corePoolSize ||
        keepAliveTime < 0)
        throw new IllegalArgumentException();
    if (workQueue == null || threadFactory == null || handler == null)
        throw new NullPointerException();
    this.acc = System.getSecurityManager() == null ?
        null :
    AccessController.getContext();
    this.corePoolSize = corePoolSize;
    this.maximumPoolSize = maximumPoolSize;
    this.workQueue = workQueue;
    this.keepAliveTime = unit.toNanos(keepAliveTime);
    this.threadFactory = threadFactory;
    this.handler = handler;
}
```

里面主要有这几个参数：

- `corePoolSize`：核心线程池大小（最小数量）；
- `maximumPoolSize`：线程池拥有线程的最大数量；
- `keepAliveTime`：空闲线程的超时时间，以纳秒为单位，当线程池中空闲线程的数量超过 `corePoolSize` 或者 `allowCoreThreadTimeOut` 设置为 true，线程就会使用这个参数，一旦超过了这个时间，相关的线程就会被释放，否则的话线程将会一直处于等待状态，直到新任务到来；
- 补充一个没有在构造函数参数列表的属性：`allowCoreThreadTimeOut`：该属性为布尔值，默认为 false，表示核心线程不受超时时间影响，意味着线程池最低存活的线程数量就是核心线程数量，如果设置为 true，则线程池所有线程都受到超时时间影响；
- `unit`：超时单位，用于将 `keepAliveTime` 参数转换为 nano；
- `workQueue`：阻塞队列，当请求执行的任务数量超过了线程池的最大线程数量，此时就需要阻塞队列来接收这些暂时无法处理的任务；
- `threadFactory`：线程工厂，用于创建线程；
- `handler`：拒绝策略；

了解了这些参数，我们在看之前使用 `Executors` 构建的三种不同的线程池，便会发现一些问题，虽然使用 `Executors` 非常方便，但是它构建的线程池其实是不安全的，这是因为：

（1）`FixedThreadPool` 和 `SingleThreadPool` 使用的阻塞队列是 `LinkedBlockingQueue`  且没有指定队列的最大长度，此时使用的是默认的最大长度 `Integer.MAX_VALUE`，可能会堆积大量的请求，从而导致 **OOM**；

（2）`CachedThreadPool` 虽然使用的是 `SynchronousQueue` 同步队列，但是其线程池的最大线程数量是 `Integer.MAX_VALUE`，可能会创建大量的线程，造成 **OOM**。

<mark>综上：如果要使用线程池，推荐自定义 ThreadPoolExecutor，既能明确线程池的运行规则，也可以避免资源耗尽的风险。</mark>

例如这样：

```java
public class EDemo02 {
    public static void main(String[] args) {
        ExecutorService executor = new ThreadPoolExecutor(
                2, // 核心线程数量
                5, // 最大线程数量
                3, // 存活时间
                TimeUnit.SECONDS, // 存活时间的单位
                new LinkedBlockingQueue<>(3), // 阻塞队列, 设置了最大长度
                Executors.defaultThreadFactory(), // 线程构建工厂
                new ThreadPoolExecutor.AbortPolicy() // 拒绝策略: 此处采用抛出异常处理
        );
        
        try {
            for (int i = 0; i < 100; i++) {
                executor.execute(() -> {
                    System.out.println(Thread.currentThread().getName() + " process work ...");
                });
            }
        } finally {
            executor.shutdown();
        }
    }
}
```

运行结果：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220217221021.png)

可以看到当处理的任务数量超过（**线程池最大线程数量 + 阻塞队列最大长度**）之后，线程池直接拒绝了新的任务（同时抛出了异常）。



### （3）拒绝策略

上面的例子中使用的拒绝策略是 `AbortPolicy`，线程池无法处理新的任务时会抛弃该任务，同时抛出异常。

`ThreadPoolExecutor` 中预定义了四种拒绝策略：

1、`CallerRunsPolicy`：谁将任务发给线程池处理，这个任务就回到哪里去，在上面的例子中如果采用了该策略，无法处理的任务就交给 main 线程处理；

```java
public static class CallerRunsPolicy implements RejectedExecutionHandler {
    /**
         * Creates a {@code CallerRunsPolicy}.
         */
    public CallerRunsPolicy() { }

    /**
         * Executes task r in the caller's thread, unless the executor
         * has been shut down, in which case the task is discarded.
         *
         * @param r the runnable task requested to be executed
         * @param e the executor attempting to execute this task
         */
    public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
        if (!e.isShutdown()) {
            r.run();
        }
    }
}
```



2、`AbortPolicy`：将无法处理的任务丢弃同时抛出异常；

```java
public static class AbortPolicy implements RejectedExecutionHandler {
    /**
         * Creates an {@code AbortPolicy}.
         */
    public AbortPolicy() { }

    /**
         * Always throws RejectedExecutionException.
         *
         * @param r the runnable task requested to be executed
         * @param e the executor attempting to execute this task
         * @throws RejectedExecutionException always
         */
    public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
        throw new RejectedExecutionException("Task " + r.toString() +
                                             " rejected from " +
                                             e.toString());
    }
}
```



3、`DiscardPolicy`：将无法处理的任务悄悄的丢弃，不做任何处理；

```java
public static class DiscardPolicy implements RejectedExecutionHandler {
    /**
         * Creates a {@code DiscardPolicy}.
         */
    public DiscardPolicy() { }

    /**
         * Does nothing, which has the effect of discarding task r.
         *
         * @param r the runnable task requested to be executed
         * @param e the executor attempting to execute this task
         */
    public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
    }
}
```



4、`DiscardOldestPolicy`：当新任务请求到来时，先判断线程池是否已经关闭，如果未关闭，就将阻塞队列中等待时间最长的任务丢弃（也就是队列的头），然后尝试调用线程池执行新的任务，如果此时线程池已经关闭，则直接丢弃新任务。

```java
public static class DiscardOldestPolicy implements RejectedExecutionHandler {
    /**
         * Creates a {@code DiscardOldestPolicy} for the given executor.
         */
    public DiscardOldestPolicy() { }

    /**
         * Obtains and ignores the next task that the executor
         * would otherwise execute, if one is immediately available,
         * and then retries execution of task r, unless the executor
         * is shut down, in which case task r is instead discarded.
         *
         * @param r the runnable task requested to be executed
         * @param e the executor attempting to execute this task
         */
    public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
        if (!e.isShutdown()) {
            e.getQueue().poll();
            e.execute(r);
        }
    }
}
```

### （4）自定义拒绝策略

上面四种拒绝策略是 `ThreadPoolExecutor` 实现定义好的，如果要自定义拒绝策略，可以通过实现 `RejectedExecutionHandler` 来完成自己想要的功能。

```java
public interface RejectedExecutionHandler {

    /**
     * Method that may be invoked by a {@link ThreadPoolExecutor} when
     * {@link ThreadPoolExecutor#execute execute} cannot accept a
     * task.  This may occur when no more threads or queue slots are
     * available because their bounds would be exceeded, or upon
     * shutdown of the Executor.
     *
     * <p>In the absence of other alternatives, the method may throw
     * an unchecked {@link RejectedExecutionException}, which will be
     * propagated to the caller of {@code execute}.
     *
     * @param r the runnable task requested to be executed
     * @param executor the executor attempting to execute this task
     * @throws RejectedExecutionException if there is no remedy
     */
    void rejectedExecution(Runnable r, ThreadPoolExecutor executor);
}
```



## 5、CPU 密集型和 IO 密集型

学习了线程池相关的知识后，我们知道应该通过自定义 `ThreadPoolExecutor` 去自定义线程池，而定制的依据和硬件及程序有关。

可以分为两类：

（1）`CPU` 密集型

机器有几个处理器，就将线程池的最大线程设置为该数量，这样可以保证 CPU 的效率最高。

可以通过 `Runtime.getRuntime().availableProcessors()` 来获取当前系统的 CPU 核数，将该值设置为线程池的最大线程数。

（2）`IO` 密集型

当我们的应用程序中存在较多的大型任务，且 IO 非常占用资源时，我们可以将这些大型任务的数量设置为线程池的核心线程数，核心线程数 >= 耗费大量资源任务的数量。