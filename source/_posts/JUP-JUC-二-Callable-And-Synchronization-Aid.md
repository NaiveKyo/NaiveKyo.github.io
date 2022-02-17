---
title: JUP JUC (二) Callable And Synchronization Aid
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211208174708.jpg'
coverImg: /img/20211208174708.jpg
cover: false
toc: true
mathjax: false
date: 2022-02-16 19:26:11
summary: "Java 并发编程: JUC 中的 Callable 和常用计数工具"
categories: "Java Concurrent"
keywords: "Java Concurrent"
tags: "Java Concurrent"
---



# 1、Callable

## （1）Callable

先看源码：

```java
@FunctionalInterface
public interface Callable<V> {
    /**
     * Computes a result, or throws an exception if unable to do so.
     *
     * @return computed result
     * @throws Exception if unable to compute a result
     */
    V call() throws Exception;
}
```

这是一个函数式接口，只有一个方法需要实现，且该方法返回线程执行的结果，它和 `Runnable` 接口的不同之处在于：

- `Callable` 可以返回结果；
- `Callable` 可以抛出编译器异常。

之前了解过线程的启动是通过 `new Thread(() -> {}).start()`  实现的，要给 Thread 传一个 `Runnable` 的实现类，那么现在该如何启动 `Callable` 线程呢？



## （2）FutureTask

先看一个继承关系：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220215215410.png)

`FutureTask` 继承的接口中有 `Runnable` 和 `Future<V>` 而 `Future<V>` 正是 JDK 1.5 时为 Java 并发体系提供的相关接口之一，这里要提一下，从 JDK 1.5 时期开始 JDK 的开发者们为 Java 的并发体系提供了许多接口和类，比如 `Callable`、`Future`、`Executor`、`Executors`、`ExecutorService`。其中 `Future` 是用来保存 `Callable` 线程返回的异步结果，`Executorxxx` 和线程池有关。

现在有了 `FutureTask`，我们就可以利用它去包装 `Runnable` 或者 `Callable` ，最终通过 Thread 去启动线程：

```java
public class Callable_Demo01 {
    public static void main(String[] args) {
        MyThread myThread = new MyThread();

        FutureTask<String> futureTask = new FutureTask<>(myThread);
        
        new Thread(futureTask).start();

        try {
            // 通过 get 方法获取子线程计算结果
            System.out.println(futureTask.get());
            // 打印 process success
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
    }
}

class MyThread implements Callable<String> {

    @Override
    public String call() throws Exception {
        System.out.println("running ... process success");
        return "process success";
    }
}
```

需要注意的是，由于子线程处理的任务可能比较复杂，获取到结果需要一定的时间，此时使用 `get()` 方法会阻塞当前主线程，直到得到子线程计算结果，而且这个过程中也可能会抛出相关异常。

一般这样做：

- 将 `get()` 方法放到最后；
- 或者使用异步通信处理。

> 注意：使用 FutureTask 后，一旦完成了计算，计算将不会重新开始或者取消，除非调用 runAndReset 方法；

例如将上面的例子部分代码重构为如下代码：

```java
new Thread(futureTask, "A").start();
new Thread(futureTask, "B").start();
```

最终只会打印一次结果，因为第二个线程没有执行实际的计算过程，而是直接从缓存中拿到结果；



# 2、常用辅助类（重要）

## （1）CountDownLatch

`CountDownLatch` 是一种同步辅助工具，主要目的是让一个或多个线程处于等待状态，直到其他线程完成一组操作后才会释放所有等待的线程。

可以给定一个初始值 `count` 用于初始化 `CountDownLatch`，这个初始值指的是计数器实例必须调用 `countDown()` 方法的次数，每调用一次 `countDown` 方法就会导致 `count` 减一，直到归零。

`CountDownLatch` 是一种通用的线程同步工具，使用它可以做到很多事情，`count` 属性作为一个阀门，当其他子线程调用计数器的 `await()` 方法后，这些线程会被阀门阻塞，直到某些线程调用了 `count` 次计数器实例的 `countDown()` 方法，阀门才会放行正在阻塞的线程。

举一些使用例子：

### 例 1：Driver Workers 问题

该例子中准备了两个计数器：

- start 计数器阻塞了所有 worker 线程，直到 driver 完成了一些前置操作，才会放行所有 worker 线程；
- end 计数器让 driver 完成一些后置操作后等待其他所有 worker 线程执行完毕，然后再放行 driver。

最终要实现的功能是所有线程都顺利完成动作才会结束程序。

```java
public class CDL_Demo02 {
    public static void main(String[] args) throws InterruptedException {
        new Driver(10).main();
    }
}

class Driver {
    
    private final int N;

    public Driver(int n) {
        N = n;
    }

    void main() throws InterruptedException {
        
        CountDownLatch startSignal = new CountDownLatch(1);
        
        CountDownLatch doneSignal = new CountDownLatch(N);

        for (int i = 0; i < N; i++) {
            new Thread(new Worker(startSignal, doneSignal), String.valueOf(i)).start();
        }
        
        // do something
        System.out.println("driver thread do something (before) ......");
        
        startSignal.countDown();    // start 计数器归零，允许所有和 startSignal 关联的等待线程运行
        
        // do something
        System.out.println("driver thread do something (after) ......");

        doneSignal.await(); // 等待其他子线程运行完毕
    }
}

class Worker implements Runnable {

    private final CountDownLatch startSignal;
    
    private final CountDownLatch doneSignal;

    public Worker(CountDownLatch startSignal, CountDownLatch doneSignal) {
        this.startSignal = startSignal;
        this.doneSignal = doneSignal;
    }

    @Override
    public void run() {
        try {
            startSignal.await();
            // do work
            System.out.println(Thread.currentThread().getName() + " do work ...");
            doneSignal.countDown();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 例 2：切分任务

另一种常用的操作是将一个大的任务切分成 N 部分，等所有子任务完成后，协调线程就会允许所有子线程结束。

（ps：如果需要重复计数，就需要使用 `CyclicBarrier`）

```java
public class CDL_Demo03 {
    public static void main(String[] args) throws InterruptedException {
        new Driver2(10).main();
    }
}

class Driver2 {
    
    private final int N;

    public Driver2(int n) {
        N = n;
    }
    
    void main() throws InterruptedException {
        CountDownLatch doneSignal = new CountDownLatch(N);
        // 准备一个线程池
        ExecutorService executor = Executors.newFixedThreadPool(N);

        for (int i = 0; i < N; i++) {
            executor.execute(new WorkerRunnable(doneSignal, i));
        }
        
        // 协调线程阻塞，等待所有子任务执行完毕后继续
        doneSignal.await();
        System.out.println("done ...");
        executor.shutdown();   
    }
}

class WorkerRunnable implements Runnable {
    
    private final CountDownLatch doneSignal;
    
    private final int i;
    
    public WorkerRunnable(CountDownLatch doneSignal, int i) {
        this.doneSignal = doneSignal;
        this.i = i;
    }

    @Override
    public void run() {
        try {
            // do work...
            System.out.println("Sub-thread " + i + " do work ......");
            doneSignal.countDown();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

## （2）CyclicBarrier

- `CyclicBarrier` 也是一种线程同步辅助工具，它可以让一组线程互相等待，直到到达某一个 **common barrier point**，此时就会自动放行所有线程；

- `CyclicBarrier` 适用于线程数量固定，且偶尔需要线程相互等待，直到完成某个任务的情形；

`CyclicBarrier` 直译过来就是 **循环屏障**，屏障很好理解，就是一个阀门用于阻塞相关的线程，直到达成某个条件，这个屏障才会释放所有等待线程，为什么说它是 **cyclic**，是因为它不同于 `CountDownLatch` 只能使用一次，`CyclicBarrier` 在等待线程都被放行后，还可以重复使用。

既然它可以循环使用，那么在每一次到达 `barrier point` 的时候就可以做一些操作，在构建 `CyclicBarrier` 时可以提供一个 `Runnable` 命令，它生效的时间是最后一条子线程到达屏障之后，释放所有等待线程之前，我们可以借助这个命令去更新一些线程共享的资源，这对于后续重复使用屏障是非常有用的。

和 `CountDownLatch` 操作类似，`CyclicBarrier` 内部也持有 `count` 变量，但它另外准备了一个变量 `parties` 备份 `count`，线程调用计数器的 `await` 方法就会使 `count` 减 1，归零就表示到达屏障点，此时调用可选的 `Runnable` 命令，同时重置 `count`，从而达到循环使用的目的。

### 例子：并行分解计算

举个例子：计算一个矩阵所有元素的和，利用 `CyclicBarrier` 将任务分解为多个子线程，每个子线程计算矩阵的某一行元素的和，最后在到达 **barrier point** 的时候将计算结果合并：

```java
public class CB_Demo04 {
    public static void main(String[] args) throws InterruptedException {
        int[][] matrix = MatrixUtils.buildMatrix(10000, 10000, 10000);
        new Solver(matrix);
    }
}

class Solver {
    
    final int N;
    
    final int[][] data;
    
    final CyclicBarrier barrier;
    
    int[] tmp;
    
    public Solver(int[][] matrix) throws InterruptedException {
        this.data = matrix;
        this.N = matrix.length;
        this.tmp = new int[N];
        Runnable barrierAction = () -> {
            // do something, such as MergeRow()
            int res = 0;
            for (int i = 0; i < N; i++) {
                res += tmp[i];
            }
            System.out.println("Sum(matrix) = " + res);
            // reset
            Arrays.fill(tmp, 0);
            // done
        };

        this.barrier = new CyclicBarrier(N, barrierAction);

        for (int i = 0; i < N; i++) {
            new Thread(new Worker(i)).start();
        }
    }
    
    class Worker implements Runnable {
    
        // 要处理的行号
        int myRow;

        public Worker(int myRow) {
            this.myRow = myRow;
        }

        @Override
        public void run() {
            int len = data[myRow].length;
            int sum = 0;
            for (int i = 0; i < len; i++) {
                sum += data[myRow][i];
            }
            tmp[myRow] = sum;
            try {
                barrier.await();
            } catch (Exception e) {
                return;
            }
        }
    }
}
```

有几点需要注意：

- `CyclicBarrier` 的 `await()` 方法会返回一个 int 值，表示当前子线程到达 `barrier` 的索引；
- `CyclicBarrier` 采取了一种 `all-or-none` 的 **breakage model**，意思是只要一个线程在达到 `barrier` 之前出现了中断、失败、超时，其他所有正在等待的线程都会通过抛出异常而离开屏障。

如果说 `barrier action`（我们提供的 `Runnable` 实例）不依赖于正在挂起子线程的执行结果，意味着不一定要执行完所有的子线程达到屏障点后再执行某些操作，此时我们就可以借助 `await()` 方法的返回值（子线程到达屏障的位置索引），在指定的地方做一些操作：

```java
public class CB_Demo05 {

    public static void main(String[] args) {
        CyclicBarrier barrier = new CyclicBarrier(7, () -> {
            System.out.println("execute barrier action, done !!!");
        });

        for (int i = 0; i < 7; i++) {
            final int tmp = i;
            new Thread(() -> {
                System.out.println("Thread = " + tmp);
                
                try {
                    if (barrier.await() == 1) {
                        System.out.println(tmp + " Before the barrier action");
                    }
                } catch (BrokenBarrierException | InterruptedException e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }
}
```

## （3）Semaphore

`Semaphore` 是信号量的意思，在 JUC 中，它主要用作计数。

- 从概念上讲，一个 `Semaphtore` 维持一套许可证，调用 `acquire` 方法，就会从可用的许可证中获取一个作为许可，当所有许可证颁发完毕，一旦有线程再次请求获取许可证，就会将该线程阻塞。直到某个已经获取许可证的线程调用 `release` 方法，将自己获得的许可证交出去给其他线程使用；
- 从实现的原理上讲，`Semaphore` 并没有使用许可证对象，而是使用一个整型变量记录许可证的数量，对其进行操作。

`Semapthore` 通常用于限制线程的数量，而不是控制某些资源（物理资源或者逻辑资源）的访问权（资源的同步访问不归 `Semaphore` 管）。

举个例子，下面的类用于控制对项目池中对象的获取：

```java
public class Semaphore_Demo06 {
    public static void main(String[] args) {
        Pool pool = new Pool();

        for (int i = 0; i < 100; i++) {
            new Thread(new WorkerItem(pool), String.valueOf(i)).start();
        }
    }
}

class WorkerItem implements Runnable {
    
    private Pool pool;

    public WorkerItem(Pool pool) {
        this.pool = pool;
    }

    @Override
    public void run() {
        Object item = null;
        try {
            item = pool.getItem();
            System.out.println(Thread.currentThread().getName() + " get Item...");
            // do something ...
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            // 如果将下面这一行注释掉，控制台就只会打印 30 条信息
            pool.putItem(item);
        }
    }
}

class Pool {
    
    private static final int MAX_AVAILABLE = 30;
    
    // 为方便演示，这里直接使用 Object 作为数据结构
    protected Object[] items = new Object[MAX_AVAILABLE];
    
    protected boolean[] used = new boolean[MAX_AVAILABLE];
    
    // 第二个布尔值参数决定是采用公平锁(FIFO)还是不公平锁
    // 此处使用公平锁
    private final Semaphore available = new Semaphore(MAX_AVAILABLE, true);
    
    public Object getItem() throws InterruptedException {
        available.acquire();
        return getNextAvailableItem();
    }

    public void putItem(Object x) {
        if (markAsUnused(x)) {
            available.release();
        }
    }

    // 从项目池中获取可用的 item
    protected synchronized Object getNextAvailableItem() {
        for (int i = 0; i < MAX_AVAILABLE; i++) {
            // 如果当前 item 没有被使用，就可以返回该 item 并设置状态为 used
            if (!used[i]) {
                used[i] = true;
                return items[i];
            }
        }
        return null;    // 全部被使用了
    }
    
    // 将指定 item 的状态置为未使用
    protected synchronized boolean markAsUnused(Object item) {
        for (int i = 0; i < MAX_AVAILABLE; i++) {
            if (item == items[i]) {
                if (used[i]) {
                    used[i] = false;
                    return true;
                }
            } else {
                return false;
            }
        }
        return false;
    }
}
```

每一个线程想要获取 item 就必须先从 `Semaphore` 中获取一个许可证，而许可证的数量和 item 的总数量一致，这就意味能够获得许可证的线程数量是固定的。

这里有几点需要注意：

- `Semaphore` 颁发许可和释放许可是同步的，这在 `Semaphore` 内部做了处理，而外部资源的访问是同步还是不同步就需要自行解决，拿上面的例子来说，对于项目池，相关方法是使用 `synchronized` 修饰的，这也是信号量和之前两个同步辅助工具的不同之处；
- 如果这样创建信号量 `new Semaphore(1)`，只有一个许可，此时它就可以当作互斥锁来使用，通常这也被称为 **二进制信号量**（`binary semaphore`），因为它只有两种状态：持有一个许可证和持有零个许可证：
  - 二进制信号量和 JUC 的 Lock 锁的功能有些相似（使用方式和公平/不公平锁），但是它们的实现原理是不同的，Lock 锁允许锁的持有者以外的线程释放锁，而信号量不同，它没有持有权的概念；
  - 二进制信号量在某些特定的上下文很有效，比如说死锁的恢复。

- `Semaphore` 在构建时允许传入一个布尔值用于选择是公平锁还是不公平锁：
  - 使用不公平锁时，它允许某些线程优先于其他位于等待许可队列中的线程；
  - 使用公平锁时遵循 FIFO 的规则，谁先申请，当有可用的许可时就先颁发给谁，同时需要注意 `tryAcquire` 方法并不严格的遵循 FIFO 规则，调用该方法时，只要有可用的许可就会直接获取，从逻辑上表现为使用该方法的线程排到等待队列的最前方；
  - 通常来说用来控制资源的使用的信号量应该使用公平锁，以确保没有线程在访问资源时被耗尽；
  - 当采用其他同步访问控制方式时，不公平锁的吞吐量常常超过公平锁。



## 补充：haapens-before

在  `CountDownLatch`  、`CyclicBarrier`  和 `Semaphore` 中都提到了一点：内存一致性。

同时也提到了一种 <mark>happens-before</mark> 规则，这种规则其实是 Java 内存模型（**JMM**）相关的知识；

官方文档描述：https://docs.oracle.com/javase/specs/jls/se7/html/jls-17.html#jls-17.4.5

参考博客：https://zhuanlan.zhihu.com/p/126275344

简单来说，就是对于某些会影响程序执行结果的操作，开发人员希望这些操作能够按照一定的顺序，前一个操作的结果对于后一个操作是可见的，而 `happens-before` 规则正是 JMM 为我们提供的工具，利用这个规则来编写安全的并发程序。

> 以 CyclicBarrier 为例

举 `CyclicBarrier` 为例，影响执行结果的就是 `await()` 操作，例如在某一个子线程中，调用 `barrier.await()` 之前的操作对于 `barrier` 相关的操作是可见的。

同时其他线程依次执行 `await()` 操作并成功返回执行结果，这个过程也是按照 `happens-before` 的规则，前一个操作对后一个操作可见。