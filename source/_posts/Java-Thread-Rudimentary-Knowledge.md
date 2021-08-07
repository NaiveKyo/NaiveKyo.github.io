---
title: Java Thread Rudimentary Knowledge
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210725214655.jpg'
coverImg: /img/20210725214655.jpg
toc: true
date: 2021-07-25 21:19:45
top: false
cover: false
summary: Java 多线程基础知识
categories: Java
keywords: [Java, Thread]
tags: [Java, Thread]
---

# Java 多线程

## 一、线程简介

通常的任务都是单线程的，任务多了就排队进行，一个一个来执行。

而多线程就是多个任务同时进行（并发），效率高（一般情况下是时间片轮转）



### 1、程序进程和线程

- 说进程，就不得不说程序。**程序是指令和数据的有序集合**，其本身没有任何运行的含义，是一个静态的概念。
- 而 **进程** 则是执行程序的一次执行过程，它是一个动态的概念。是**系统资源分配的单位**
- 通常在一个进程中可以包含 **若干线程**，当然一个进程中至少有一个线程，不然就没有存在的意义了。线程是 **CPU 调度和执行的单位。**

注意：很多多线程是模拟出来的，真正的多线程是指有多个 CPU，即多核，如服务器。如果是模拟出来的多线程，即在一个 cpu 的情况下，在同一个时间点，cpu 只能执行一个代码，因为切换的很快，看起来是并行的。





### 2、总结

- 线程就是独立的执行路径；例如 main 线程只执行自己的和其他线程是并行的
- 在程序运行时，即使没有自己没有创建线程，后台也会有多个线程，如 主线程、gc 线程
- 在一个进程中，如果开辟了多个线程，线程的运行由调度器安排调度，调度器是与操作系统紧密相关的，先后顺序不能被人为干扰
- 对同一份资源操作时，会存在资源抢夺的问题，需要加入并发控制
- 线程会带来额外的开销，如 cpu 调度时间、并发控制开销
- **每个线程在自己的工作内存交互，内存控制不当会造成数据不一致**



## 二、线程实现（重点）

**Thread、Runnable、Callable**

线程也是分类的，例如 Java 中主线程是**用户线程**（自己创建的），gc 线程属于**守护线程**（JVM 提供）



### 1、三种线程创建方式

- 继承 `Thread` 类（重点）
- 实现 `Runnable` 接口（重点）
- 实现 `Callable` 接口（了解）现阶段做了解，以后会很重要



### 2、Thread

- 自定义线程类继承 `Thread` 类
- 重写 `run()` 方法，执行业务
- 创建线程对象，调用 `start()` 方法启动线程
  - 线程开启之后 ，会自动调用其中的 `run()` 方法（依据 cpu 自己的调度规则）



最终的效果就是主线程和其他线程并行

```java
/**
 * @author naivekyo
 * @date 2021/7/15
 * 
 * 通过继承 Thread 创建线程类
 */
public class TestThread1 extends Thread {

    @Override
    public void run() {
        // run 线程方法体
        for (int i = 0; i < 10; i++) {
            System.out.println("线程执行进度: " + i);
        }
    }

    public static void main(String[] args) {
        
        // 创建子线程
        TestThread1 testThread1 = new TestThread1();
        testThread1.start();   // 开启线程
        
        // main 线程，主线程
        for (int i = 0; i < 10; i++) {
            System.out.println("主线程执行: " + i);
        }
        
    }
}
```



### 3、实现 Runnable 接口

- 定义类实现 `Runnable` 接口
- 实现 `run()` 方法，编写线程执行体
- 创建线程对象，调用 `start()` 方法启动线程

```java
/**
 * @author naivekyo
 * @date 2021/7/15
 * 
 * 通过实现 Runnable2 创建线程类
 *  执行线程需要丢入 Runnable 接口实现类，调用 start() 
 */
public class TestThread2 implements Runnable {

    @Override
    public void run() {
        for (int i = 0; i < 100; i++) {
            System.out.println("子线程执行进度: " + i);
        }
    }

    public static void main(String[] args) {
        // 创建 runnable 接口的实现类对象
        TestThread2 testThread2 = new TestThread2();
        
        // 创建线程对象，通过线程对象来开启线程，通过 代理
        new Thread(testThread2).start();

        for (int i = 0; i < 70; i++) {

            System.out.println("主线程执行进度: " + i);
        }
  
    }
}
```



### 小结

- 继承 Thread 类
  - 子类继承 Thread 类具备多线程能力
  - 启动线程：子类对象.start()
  - **不建议使用：避免 OOP 单继承局限性**



- 实现 Runnable 接口
  - 实现接口 Runnable 后具有多线程能力
  - 启动线程：传入目标对象构建 Thread 对象然后.start()
  - **推荐使用：避免单继承局限性，灵活方便，方便同一个对象被多个线程使用**



```java
/**
 * @author naivekyo
 * @date 2021/7/15
 * 
 * 多个线程同时操作同一个对象
 * 
 * 买火车票的例子
 */
// 发现问题，多个线程操作同一个资源的情况下，线程不安全
public class TestThread3 implements Runnable {
    
    // 票数
    private int ticketNums = 10;
    
    @Override
    public void run() {
        while (true) {
            if (ticketNums <= 0) {
                break;
            }
            try {
                // 模拟延时
                Thread.sleep(200);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println(Thread.currentThread().getName() + "拿到了第 " + ticketNums-- + " 张票");
        }
    }


    public static void main(String[] args) {
        TestThread3 testThread3 = new TestThread3();

        new Thread(testThread3, "小明").start();
        new Thread(testThread3, "老师").start();
        new Thread(testThread3, "黄牛").start();
    }
}
```



> 出现了问题

多个线程访问同一个资源的时候，极有可能会出现问题，资源紊乱。



### 4、实现 Callable 接口  TODO

前面创建线程的2种方式，一种是直接继承 Thread，另外一种就是实现 Runnable 接口。

这 2 种方式都有一个缺陷就是：**在执行完任务之后无法获取执行结果**。

如果**需要获取执行结果**，就必须通过共享变量或者使用线程通信的方式来达到效果，这样使用起来就比较麻烦。

而自从 Java 1.5 开始，就提供了 `Callable` 和 `Future`，通过它们可以在任务执行完毕之后得到任务执行结果。



1. 实现 `Callable` 接口，需要返回值类型
2. 重写 call 方法，需要抛出异常
3. 创建目标对象
4. 创建执行服务：`ExecutorService ser = Executors.newFixedThreadPoll(1);`
5. 提交执行：`Future<Boolean> result1 = ser.submit(1);`
6. 获取结果：`boolean r1 = result1.get()`
7. 关闭服务：`ser.shutdownNow();`



> 使用 Callable 的好处

- 可以定义返回值
- 可以抛出异常



```java
/**
 * @author naivekyo
 * @date 2021/7/15
 * 
 * 线程创建方式三：实现 Callable 接口
 * Callable<V>，call() 方法返回的就是泛型 V
 * 
 * Callable 的优点：
 *  1. 可以定义返回值
 *  2. 可以抛出异常
 */
public class TestCallable implements Callable<Boolean> {
    

    @Override
    public Boolean call() throws Exception {

        System.out.println("线程开启");
        
        return true;
    }

    public static void main(String[] args) {

        TestCallable t1 = new TestCallable();
        TestCallable t2 = new TestCallable();
        TestCallable t3 = new TestCallable();
        
        // 创建线程服务，管理线程生命周期
        ExecutorService executorService = Executors.newFixedThreadPool(3);
        
        // 提交执行
        Future<Boolean> result1 = executorService.submit(t1);
        Future<Boolean> result2 = executorService.submit(t2);
        Future<Boolean> result3 = executorService.submit(t3);

        try {
            // 获取结果
            Boolean aBoolean = result1.get();
            Boolean bBoolean = result2.get();
            Boolean cBoolean = result3.get();
            
            // 打印结果
            System.out.println(aBoolean);
            System.out.println(bBoolean);
            System.out.println(cBoolean);
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        // 关闭服务
        executorService.shutdown();
    }
}
```



### 5、静态代理模式

```java
/**
 * 静态代理总结：
 *  1. 真实对象和代理对象都要实现同一个接口
 *  2. 代理对象要代理真实角色
 */
public class StaticProxy {

    public static void main(String[] args) {
        WddingCompany wddingCompany = new WddingCompany(new You());
        
        wddingCompany.marriage();
    }
}

interface Marriage {
    
    void marriage();
}

/**
 * 真实角色
 */
class You implements Marriage {

    @Override
    public void marriage() {
        System.out.println("happy marriage.");       
    }
}

/**
 * 代理角色
 */
class WddingCompany implements Marriage {

    /**
     * 要结婚的对象
     */
    private Marriage target;

    public WddingCompany(Marriage target) {
        this.target = target;
    }

    @Override
    public void marriage() {
        
        before();
        
        this.target.marriage();
        
        after();
    }

    private void before() {
        System.out.println("before marriage.");
    }

    private void after() {
        System.out.println("after marriage.");
    }
}
```

静态代理总结：

- 真实对象和代理对象都要实现同一个接口
- 代理对象要代理真实角色



好处：

- 代理对象可以做很多真实对象做不了的事物
- 真实对象只关注自己的业务



### 6、Lambda 表达式

- 避免匿名内部类定义过多
- 实质就是属于函数式编程



- 理解 **Functional Interface（函数式接口）**是学习 Java8 lambda 表达式的关键
- 函数式接口的定义：
  - 任何接口，如果只包含唯一一个抽象方法，那么它就是一个函数式接口

```java
public interface Runnable {
  public abstract void methodName(...);
}
```

- 对于函数式接口，我们可以通过 lambda 表达式来创建该接口的对象

```java
public class Test01 {

    public static void main(String[] args) {
        
        Thread thread = new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                System.out.println(i);
            }
        });
        
        thread.start();

        for (int i = 0; i < 10; i++) {
            System.out.println("主线程:" + i);
        }
    }
}
```



### 小结

```java
public class Test02 {

    // 3. 静态内部类
    static class Like2 implements ILike {
        @Override
        public void lambda() {
            System.out.println("I like lambda2.");
        }
    }
    
    public static void main(String[] args) {
        ILike like1 = new Like1();
        like1.lambda();
        
        ILike like2 = new Like2();
        like2.lambda();
        
        // 4. 局部内部类
        class Like3 implements ILike {
            @Override
            public void lambda() {
                System.out.println("I like lambda3.");
            }
        }
        
        ILike like3 = new Like3();
        like3.lambda();
        
        // 5. 匿名内部类
        ILike like4 = new ILike() {
            @Override
            public void lambda() {
                System.out.println("I like lambda4.");
            }
        };
        like4.lambda();
        
        // 6. lambda 表达式
        ILike like5 = () -> {
            System.out.println("I like lambda5.");
        };
        like5.lambda();
      
      	// 7. 继续简化，没有复杂的逻辑可以这样写
        ILike like6 = () -> System.out.println("I like lambda6.");
        like6.lambda();
    }
}

// 1. 定义一个函数式接口
interface ILike {
    void lambda();
}

// 2. 定义接口的实现类
class Like1 implements ILike {
    @Override
    public void lambda() {
        System.out.println("I like lambda1.");
    }
}
```



- 为什么要使用 lambda 表达式
  - 避免匿名内部类定义过多
  - 可以简化代码
  - 去掉了没有意义的代码，只留下核心的逻辑



## 三、线程状态

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210719191947.png)







![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210719192743.png)



### 1、线程方法

|               方法               |                    说明                    |
| :------------------------------: | :----------------------------------------: |
|  `setPriority(int newPriority)`  |              更改线程的优先级              |
| `static void sleep(long millis)` |  在指定的毫秒数内让当前正在执行的线程休眠  |
|          `void join()`           |               等待该线程终止               |
|      `static void yield()`       | 暂停当前正在执行的线程对象，并执行其他线程 |
|        `void interrupt()`        |          中断线程，不要用这种方式          |
|       `boolean isAlive()`        |          测试线程是否处于活动状态          |

### 2、停止线程

- 不推荐使用 JDK 提供的 `stop()`、`destroy()` 方法（已废弃）
- 推荐让线程自己停下来
- **建议使用一个标志位作为终止变量**，当 flag = false 时，线程停止运行



```java
/**
 * 测试终止线程
 * 1. 建议让线程正常停止 --> 例如使用 for 循环限制次数，不建议使用死循环
 * 2. 建议使用标志位  ---> 设置标志位
 * 3. 不要使用 stop、destroy 等过时的方法
 */
public class TestThread implements Runnable {
    
    // 1. 设置一个标志位
    private boolean flag = true;
    
    @Override
    public void run() {
        int i = 0;
        while (flag) {
            System.out.println("run...... Thread " + i++);
        }
    }
    
    // 设置一个公开的方法停止线程
    public void stop() {
        this.flag = false;
    }

    public static void main(String[] args) {
        
        TestThread testThread = new TestThread();
        
        new Thread(testThread).start();

        for (int i = 0; i < 100; i++) {
            System.out.println("main " + i);
            if (i == 70) {
                testThread.stop();
                System.out.println("停止线程.");
            }
        }
    }
    
}
```

### 3、线程休眠

`sleep(long millis)`

1000 毫秒 = 1 秒

- sleep（时间）指定当前线程阻塞的毫秒数
- sleep 存在异常 `InterruptedException`
- sleep 时间打倒后，线程进行就绪状态
- sleep 可以模拟网络延时、倒计时等等
- **每一个对象都有一个锁，sleep 不会释放锁**



>  sleep 作用

- 模拟网络延时，比如抢票的时候，一旦出现延时，可能就会出问题，系统资源紊乱

```java
public class NetworkDelay implements Runnable {
    
    private int ticket = 12;
    
    @Override
    public void run() {
        
        while (true) {
            if (ticket <= 0) 
                break;

            try {
                Thread.sleep(20);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            System.out.println(Thread.currentThread().getName() + " 获得第 " + ticket-- + " 张票.");
        }
    }

    public static void main(String[] args) {
        NetworkDelay networkDelay = new NetworkDelay();
        
        new Thread(networkDelay, "小明").start();
        new Thread(networkDelay, "xxx").start();
        new Thread(networkDelay, "老师").start();
    }
}
```

- 模拟计时器

```java
public class Timer implements Runnable {
    
    private int num = 10;
    
    @Override
    public void run() {
        while (num >= 0) {
            System.out.println(num--);
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) {
        new Thread(new Timer()).start();
    }
}
```

- 模拟时间

```java
public class ShowDate implements Runnable {
    
    private boolean flag = true;
    
    @Override
    public void run() {
        Date date = new Date(System.currentTimeMillis());
        
        int i = 0;
        
        while (flag) {
            
            try {
                System.out.println(new SimpleDateFormat("HH:mm:ss").format(date));
                Thread.sleep(1000);
                date = new Date(System.currentTimeMillis());

            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            if (i <= 10) i++;
            else stop();
        }
    }
    
    public void stop() {
        this.flag = false;
    }

    public static void main(String[] args) {
        new Thread(new ShowDate()).start();
    }
}
```



### 4、线程礼让

- 礼让线程，让当前正在执行的线程暂停，但是不阻塞
- 将线程从运行状态转换为就绪状态
- **让 CPU 重新调度，礼让不一定成功**
  - 比如 A 正在运行，B 已经就绪，A 礼让后就会从运行转为就绪，A 和 B 都处于就绪状态，CPU 在就绪队列中重新调度，A 和 B 都有机会被调度





### 5、线程强制执行

- `Join` 合并线程，待此线程执行完成后，再执行其他线程，其他线程阻塞

可以理解为插队

```java
// 测试 join 方法，相当于强行执行指定线程，其他线程阻塞
public class TestJoin implements Runnable {
    
    @Override
    public void run() {
        for (int i = 0; i < 300; i++) {
            System.out.println("强制执行线程: " + i);
        }
    }

    public static void main(String[] args) {
        TestJoin testJoin = new TestJoin();

        Thread thread = new Thread(testJoin);
        thread.start();

        for (int i = 0; i < 200; i++) {
            System.out.println("主线程: " + i);
            if (i == 100) {
                try {
                    thread.join();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```



### 6、观测线程状态



> Thread.State

线程状态，线程可以处于以下状态之一：

- **NEW**

  尚未启动的线程处于此状态

- **RUNNABLE**

  在 Java 虚拟机中执行的线程处于此状态

- **BLOCKED**

  被阻塞等待监视器锁定的线程处于此状态

- **WAITING**

  正在等待另一个线程执行特定工作的线程处于此状态

- **TIMED_WAITING**

  正在等待另一个线程执行动作达到指定等待时间的线程处于此状态

- **TERMINATED**

  已退出的线程处于此状态

一个线程可以在给定时间点处于一个状态。这些状态是不反映任何操作系统线程状态的虚拟机状态

```java
// 观察测试线程的状态
public class TestState {

    public static void main(String[] args) throws InterruptedException {
        Thread thread = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            System.out.println("..................");
        });
        
        // 观察状态
        Thread.State state = thread.getState();
        System.out.println(state);  // NEW
        
        // 观察启动后状态
        thread.start();
        state = thread.getState();
        System.out.println(state); // RUNNABLE
        
        while (state != Thread.State.TERMINATED) { // 只要线程不终止，就一直输出状态
            Thread.sleep(100);
            state = thread.getState();  // 更新线程状态
            System.out.println(state);  // 输出状态
        }
        
        // 线程死亡后，不能再次启动
    }
}
```

### 7、线程的优先级

- Java 提供一个线程调度器来监控程序中启动后进入就绪状态的所有线程，线程调度器按照**优先级**决定应该调度哪个线程来执行。
- 线程优先级用数字表示，范围从 1 ~ 10
  - `Thread.MIN_PRIORITY = 1`
  - `Thread.MAX_PRIORITY = 10`
  - `Thread.NORM_PRIORITY = 5`
- 使用以下方式改变或者获取优先级
  - `getPriority().setPriority(int xxx)`



> 注意

- 优先级的设定建议在 `start()` 之前
- 优先级低只是意味着获得调度的概率低，并不是优先级低就不会被调用，还是要看 CPU 的调度规则



```java
// 测试线程优先级
public class TestPriority {

    public static void main(String[] args) {
        // 主线程默认优先级
        System.out.println("Main Thread 's Priority: " + Thread.currentThread().getPriority());

        MyPriority myPriority = new MyPriority();
        Thread t1 = new Thread(myPriority);
        Thread t2 = new Thread(myPriority);
        Thread t3 = new Thread(myPriority);
        Thread t4 = new Thread(myPriority);
  
        // 先设置优先级，再启动
        t1.start();
        
        t2.setPriority(1);
        t2.start();
        
        t3.setPriority(4);
        t3.start();

        t4.setPriority(Thread.MAX_PRIORITY);
        t4.start();
        
    }
    
}

class MyPriority implements Runnable {

    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() + " --> " + Thread.currentThread().getPriority());
    }
}
```

### 8、守护(daemon)线程

- 线程分为 <span style="color:red;">用户线程</span> 和 <span style="color:red;">守护线程</span>
- 虚拟机必须确保用户线程执行完毕
- 虚拟机不用等待守护线程执行完毕
- 如：后台记录操作日志，监控内存，垃圾回收等等。。。



```java
// 测试守护线程
public class TestDaemon {

    public static void main(String[] args) {
        
        Earth earth = new Earth();
        
        People people = new People();
        
        Thread thread = new Thread(earth);
        thread.setDaemon(true); // 默认是 false 表示是用户线程，正常的线程都是用户线程
        thread.start(); // 守护线程启动，它会一直运行直到程序结束
        
        new Thread(people).start();
    }
}

// 地球
class Earth implements Runnable {

    @Override
    public void run() {
        while (true) {
            System.out.println("nature is forever.");
        }
    }
}

// 人类
class People implements Runnable {

    @Override
    public void run() {
        for (int i = 0; i < 365; i++) {
            System.out.println("hello world!");
        }

        System.out.println("goodbye world!");
    }
}
```



## 四、线程同步（重点）

多个线程操作一个资源



- **并发**：<span style="color:red;">同一个对象</span> 被 <span style="color:red;">多个线程</span> 同时操作



思考场景：

- 现实生活中，我们会遇到 “同一个资源，多个人都想使用” 的问题，比如说，食堂吃饭的时候，大家都去非常混乱，只有排队才方便管理
- 处理多线程问题时，多个线程访问同一个对象，并且某些线程还想修改这个对象，这时候我们就需要线程同步，线程同步其实就是一个等待机制，多个需要同时访问此对象的线程进入这个 <span style="color:red;">对象的等待池</span> 形成队列，等待前面线程使用完毕，下一个线程再使用。



> 队列和锁

线程同步需要队列 + 锁，每个对象都有一个锁



- 由于同一进程的多个线程共享同一块存储空间，在带来方便的同时，也带来了访问冲突问题，为了保证数据在方法中被访问时的正确性，在访问时加入 <span style="color:red;">锁机制 synchronized</span> ，当一个线程获得对象的排它锁，独占资源，其他线程必须等待，使用后释放锁即可，但是存在以下问题：
  - 一个线程持有锁会导致其他所有需要此锁的线程挂起；
  - 在多线程的竞争下，加锁，释放锁会导致比较多的**上下文切换** 和 **调度延时**，引起性能问题；
  - 如果一个优先级高的线程等待一个优先级低的线程释放锁，会导致**优先级倒置**，引起性能问题



### 1、不安全案例：买票

```java
// 不安全的买票
public class UnsafeBuyTicket {

    public static void main(String[] args) {

        MyBuyTicket myBuyTicket = new MyBuyTicket();

        new Thread(myBuyTicket, "校长").start();
        new Thread(myBuyTicket, "小明").start();
        new Thread(myBuyTicket, "老师").start();
        new Thread(myBuyTicket, "黄牛").start();
    }
    
}

class MyBuyTicket implements Runnable {
    
    private int tickets = 10;
    
    private boolean flag = true;
    
    @Override
    public void run() {
        while (flag) {
            buy();
        }
    }
    
    private void buy() {
        // 判断是否有票
        if (this.tickets <= 0) {
            this.flag = false;
            return;
        }
        // 模拟延时，放大问题发生的可能性
        try {
            Thread.sleep(300);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // 买票
        System.out.println(Thread.currentThread().getName() + " 拿到第 " + tickets-- + " 张票。");
    }
}
```



最后我们会发现会出现 -1、-2 等等不合理的数字，为什么会这样。

> 因为这四条线程属于同一个进程，它们共用同一块公共内存区域，都对同一个资源进行操作，但是每种线程又有自己的工作内存，在自己的工作内存中交互。

假如剩下 1 张票的时候，第一个人拿到了 1 -> 0 ，第二个人也拿到了 0 -> -1， 第三个人也拿到了 -1 -> -2，最后票数变成负数。



### 2、不安全案例：取钱

```java
// 不安全的取钱
// 两个人去银行从同一个账户取钱，分别为柜台、取款机
public class UnsafeBank {
    public static void main(String[] args) {
        // 账户
        Account account = new Account(100, "银行卡");
        
        Drawing you = new Drawing(account, 50, "你");
        Drawing girl = new Drawing(account, 100, "她");
        
        you.start();
        girl.start();
    }
}

// 账户
class Account {
    int money;  // 余额
    String name;    // 卡号

    public Account(int money, String name) {
        this.money = money;
        this.name = name;
    }
}

// 银行 : 模拟取款
class Drawing extends Thread {
    
    Account account;    // 账户
    // 去了多少钱
    int drawingMoney;   
    // 现在身上的钱
    int nowMoney;
    
    public Drawing(Account account, int drawingMoney, String name) {
        super(name);
        this.account = account;
        this.drawingMoney = drawingMoney;
    }

    @Override
    public void run() {
        // 判断有没有钱
        if (account.money - this.drawingMoney <= 0) {
            System.out.println(Thread.currentThread().getName() + " 无法取款，余额不足!");
            return;
        }
        // 模拟延时
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // 账户余额
        account.money = account.money - drawingMoney;
        
        // 手中的钱
        this.nowMoney += this.drawingMoney;
        
        System.out.println(account.name + " 余额为：" + account.money);
        
        // this.getName() 等价于 Thread.currentThread().getName()
        System.out.println(this.getName() + " 手里的钱：" + this.nowMoney);
    }   
}
```



### 3、不安全的集合

```java
// 线程不安全的集合
public class UnsafeList {

    public static void main(String[] args) {
        List<String> list = new ArrayList<>();

        for (int i = 0; i < 10000; i++) {
            new Thread(() -> {
                list.add(Thread.currentThread().getName());
            }).start();
        }
        System.out.println(list.size());
    }
}
```



我们的理想目标是 List 中存有 10000 条记录，但是实际往往达不到这个数字。

原因是因为多条线程向 List 中的同一个位置插入数据，覆盖了已有数据



### 4、同步方法

- 由于我们可以通过 private 关键字来保证数据对象只能被方法访问，所以我们只需要针对方法提出一套机制，这套机制就是 `synchronized` 关键字，它包括两种用法：
  - **synchronized 方法** 和 **synchronized 块**
  - 例如：同步方法 `public synchronized void method(int args){}`
- `synchronized` 方法控制对 “对象” 的访问，每个对象对应一把锁，每个 **synchronized 方法** 都必须获得调用该方法的对象的锁才能执行，否则线程就会阻塞，方法一旦执行，就独占该锁，直到该方法返回才释放锁，后面被阻塞的线程才能获得这个锁，继续执行。
  - 存在缺陷：**将一个大的方法加上同步(sychronized)机制会降低效率**



方法内部有些是只读的，有些是修改相关的，对于读的部分可以不用加锁，而主要控制修改的部分（也就是同步块`synchronized 块`）

### 5、同步块

同步块：`synchronized(obj){}`

- Obj 称之为 **同步监视器**
  - Obj 可以是任何对象，但是推荐使用共享资源作为同步监视器
  - 同步方法中无需指定同步监视器，因为同步方法的同步监视器就是 `this`，就是这个对象本身，或者是 `class`
- 同步监视器的执行过程
  1. 第一个线程访问，锁定同步监视器，执行其中的代码
  2. 第二个线程访问，发现同步监视器被锁定，无法访问
  3. 第一个线程访问完毕，解锁同步监视器
  4. 第二个线程访问，发现同步监视器没有锁，就会锁定并访问



例如买票的问题：可以使用同步方法，锁就是当前对象 `this`

```java
    // 同步方法，锁就是 this
    private synchronized void buy() {
        // 判断是否有票
        if (this.tickets <= 0) {
            this.flag = false;
            return;
        }
        // 模拟延时，放大问题发生的可能性
        try {
            Thread.sleep(300);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // 买票
        System.out.println(Thread.currentThread().getName() + " 拿到第 " + tickets-- + " 张票。");
    }
```

但是银行取钱问题就不一样了，涉及到的类比较多，适合使用同步代码块，这时候锁是 `class` 对象，这里就是账户的 Class 对象

```java
    @Override
    public void run() {
        
      	// 同步代码块，锁就是 Class 对象
        synchronized (Account.class) {
            // 判断有没有钱
            if (account.money - this.drawingMoney <= 0) {
                System.out.println(Thread.currentThread().getName() + " 无法取款，余额不足!");
                return;
            }
            // 模拟延时
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            // 账户余额
            account.money = account.money - drawingMoney;

            // 手中的钱
            this.nowMoney += this.drawingMoney;

            System.out.println(account.name + " 余额为：" + account.money);

            // this.getName() 等价于 Thread.currentThread().getName()
            System.out.println(this.getName() + " 手里的钱：" + this.nowMoney);
        }
    }  
```



> 总结

- 要上锁的对象应该是会发生变化的量



### 6、补充 Java.util.concurrent 包

JUC 中有一些线程安全的集合：

```java
// 测试 JUC 安全类型的集合
public class TestJUC {

    public static void main(String[] args) {

        CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();

        for (int i = 0; i < 10000; i++) {
            new Thread(() -> {
                list.add(Thread.currentThread().getName());
            }).start();
        }
        System.out.println(list.size());
    }
}
```



### 7、死锁

- 多个线程各占有一些共享资源，并且它们继续运行的前提是需要占用其他线程占有的资源才能运行，从而导致两个或者多个线程都在等待其他线程释放资源，最终都停止执行的情况，某一个同步块同时拥有 <span style="color:red;">“两个以上对象的锁”</span> 时，就可能会发生 “死锁” 的问题。

```java
// 死锁：多个线程互相锁定对方需要的资源，然后形成僵持
public class DeadLock {
    public static void main(String[] args) {
        MakeUp p1 = new MakeUp(0, "小明");
        MakeUp p2 = new MakeUp(1, "小红");
        
        p1.start();
        p2.start();
    }
}

// 资源 A
class ResourceA {
    
}

// 资源 B
class ResourceB {
    
}

// 使用者
class MakeUp extends Thread {

    // 需要的资源，且只有一份
    static ResourceA a = new ResourceA();
    static ResourceB b = new ResourceB();
    
    int choice; // 选择
    String name;    // 使用者
    
    public MakeUp(int choice, String name) {
        this.choice = choice;
        this.name = name;
    }
    
    @Override
    public void run() {
        
        makeup();
    }
    
    // 互相持有对方的锁，需要访问对方的资源
    private void makeup() {
        if (choice == 0) {
            synchronized (a) {
                System.out.println(this.name + " 获得资源 A 的锁.");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                
                synchronized (b) {
                    // 一秒钟后获得资源 B 的锁
                    System.out.println(this.name + " 获得资源 B 的锁.");
                }
            }
        } else {
            synchronized (b) {
                System.out.println(this.name + " 获得资源 B 的锁.");
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }

                synchronized (a) {
                    // 一秒钟后获得资源 A 的锁
                    System.out.println(this.name + " 获得资源 A 的锁.");
                }
            }
        }
    }
}
```



> 死锁避免的方法

- 死锁产生的四个必要条件
  1. 互斥条件：一个资源每次只能被一个进程使用；
  2. 请求与保持条件：一个进程因请求资源而阻塞时，对已获得的资源保持不放；
  3. 不剥夺条件：进程已获得的资源，在未使用完成之前，不能强行剥夺；
  4. 循环等待条件：若干进程之间形成一种头尾衔接的循环等待资源关系；



**上述的四个条件，只要我们能想办法打破其中的任意一个或多个条件，就可以避免死锁的发生。**



### 8、Lock 锁

- 从 JDK5.0 开始，Java 提供了更强大的线程同步机制 —— 通过显式定义同步锁对象来实现同步。同步锁使用 Lock 对象充当
- `java.util.concurrent.locks.Lock` 接口是控制多个线程对共享资源进行访问的工具。锁提供了对共享资源的独占访问每次只能有一个线程对 Lock 对象加锁，线程开始访问共享资源之前应该先获得 Lock 对象
- `ReentrantLock` （**可重入锁**）类实现了 Lock，它拥有和 synchronized 相同的并发性和内存语义，在实现线程安全的控制中，比较常用的是 `ReentrantLock`，可以显式加锁、释放锁。



```java
// 测试 Lock 锁
public class TestLock {

    public static void main(String[] args) {
        TestLock2 testLock2 = new TestLock2();

        new Thread(testLock2, "小明").start();
        new Thread(testLock2, "小红").start();
        new Thread(testLock2, "校长").start();
        new Thread(testLock2, "老师").start();
    }
}

class TestLock2 implements Runnable {

    private int tickets = 10;
    
    // 定义可重入锁
    private final ReentrantLock lock = new ReentrantLock();
    
    @Override
    public void run() {
        while (true) {
            try {
                // 加锁
                lock.lock();
                
                if (tickets > 0) {
                    try {
                        Thread.sleep(300);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    System.out.println(Thread.currentThread().getName() + " " + tickets--);
                } else {
                    break;
                }
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                // 解锁
                lock.unlock();
            }
        }
    }
}
```



> synchronized 和 Lock 对比

- Lock 是显式锁（手动开启和关闭，不要忘记关闭锁），synchronized 是隐式锁，出了作用域就自动释放
- Lock 只有代码块锁，synchronized 有代码块锁和方法锁
- 使用 Lock 锁，JVM 将花费较少的时间来调度线程，性能更好。并且具有更好的扩展性（提供更多的子类）
- 优先使用顺序：
  - Lock > 同步代码块（已经进入了方法体，分配了相应的资源） > 同步方法（在方法体之外）



## 五、线程通信

> 线程协作



### 1、生产者消费者模式



- 应用场景：生产者和消费者问题
  - 假设仓库中只能存放一件产品，生产者将生产出来的产品放入仓库，消费者将仓库中的产品取走消费
  - 如果仓库中没有产品，则生产者生产产品并放入仓库中，如果仓库中有产品，则生产者停止生产并等待仓库中的产品被取完
  - 如果仓库中放有产品，则消费者可以将产品取走消费，否则停止消费并等待，直到仓库中再次放入产品为止



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210721215846.png)

### 2、分析

这是一个线程同步问题，生产者和消费者共享同一个资源（数据缓冲区），并且生产者和消费者之间相互依赖，互为条件。

- 对于生产者，没有生产产品之前，需要通知消费者等待，而生产了产品之后，又需要马上通知消费者消费
- 对于消费者，在消费之后，要通知生产者已经结束消费，需要生产新的产品以供消费。
- 在生产者消费者问题中，仅有 `synchronized` 是不够的
  - `synchronized` 可阻止并发更新同一个共享资源，实现了同步
  - `synchronized` 不能用来实现不同进程之间的消息传递（通信）





Java 提供了几个方法来解决线程之间的通信问题

|        方法名        |                             作用                             |
| :------------------: | :----------------------------------------------------------: |
|       `wait()`       | 表示线程会一直等待，直到其他线程通知，与 sleep 不同，会释放锁 |
| `wait(long timeout)` |                       指定等待的毫秒数                       |
|      `notify()`      |                  唤醒一个处于等待状态的线程                  |
|    `notifyAll()`     | 唤醒同一个对象上所有调用 wait() 方法的线程，优先级高的线程优先调度 |

**注意：这些都是 Object 类提供的方法，都只能在同步方法或者同步代码块中使用，否则会抛出异常** `IllegalMonitorStateException`



### 3、解决方式一：管程法

> 并发协作模型：”生产者/消费者模式“  --> 管程法

- 生产者：负责生产数据的模块（可能是方法、对象、线程、进程）
- 消费者：负责处理数据的模块（可能是方法、对象、线程、进程）
- 缓冲区：消费者不能直接使用生产者的数据，他们之间有一个”缓冲区“：**生产者将生产好的数据放入缓冲区，消费者从缓冲区拿出数据**

```java
// 测试生产者消费者模型 --> 利用缓冲区解决问题（管程法）
// 生产者、消费者、产品、缓冲区
public class TestPC {

    public static void main(String[] args) {
        
        BufferArea bufferArea = new BufferArea();

        Prducer prducer = new Prducer(bufferArea);

        Consumer consumer = new Consumer(bufferArea);
        
        prducer.start();
        consumer.start();
    }
}

// 生产者
class Prducer extends Thread {

    private BufferArea bufferArea;
    
    public Prducer(BufferArea bufferArea) {
        this.bufferArea = bufferArea;
    }
    
    // 生产
    @Override
    public void run() {
        for (int i = 0; i < 100; i++) {
            bufferArea.push(new Product(i));
            System.out.println("生产了第 " + i + " 只鸡");
        }
    }
}

// 消费者
class Consumer extends Thread {
    private BufferArea bufferArea;

    public Consumer(BufferArea bufferArea) {
        this.bufferArea = bufferArea;
    }

    // 消费
    @Override
    public void run() {
        for (int i = 0; i < 100; i++) {
            System.out.println("消费了第--- " + bufferArea.pop().id + " 只鸡");
        }
    }
}

// 产品
class Product {
    int id; // 产品编号

    public Product(int id) {
        this.id = id;
    }
}

// 缓冲区
class BufferArea {
    
    // 容器大小
    Product[] products = new Product[10];
    
    // 容器计数器
    int count = 0;
    
    // 生产者放入产品
    public synchronized void push(Product product) {
        // 如果容器满了，就需要等待消费者消费完才可以放入
        if (this.count == this.products.length) {
            // 通知消费者消费，生产者等待
            try {
                this.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        
        this.products[count++] = product;
        // 可以通知消费者消费
        this.notifyAll();
    }
    
    // 消费者消费产品
    public synchronized Product pop() {
        // 判断能否消费
        if (this.count == 0) {
            // 等待生产者生产, 消费者等待
            try {
                this.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        // 可以消费
        count--;
        Product product = this.products[count];
        
        // 通知生产者生产
        this.notifyAll();
        return product;
    }
}
```







### 4、解决方式二：信号灯法

> 并发协作模型：”生产者/消费者模式“  --> 信号灯法

定义一个标志位



```java
// 信号灯法，设置标志位
public class TestPC2 {

    public static void main(String[] args) {
        Tv tv = new Tv();
        new Player(tv).start();
        new Watch(tv).start();
    }
}

// 生产者 --> 演员
class Player extends Thread {
    Tv tv;

    public Player(Tv tv) {
        this.tv = tv;
    }

    @Override
    public void run() {

        for (int i = 0; i < 20; i++) {

            if (i % 2 == 0) {
                this.tv.play("<xxxx> 播放中");
            } else {
                this.tv.play("<yyyy> 播放中");
            }
        }
    }
}

// 消费者 --> 观众
class Watch extends Thread {
    Tv tv;

    public Watch(Tv tv) {
        this.tv = tv;
    }

    @Override
    public void run() {
        for (int i = 0; i < 20; i++) {
            this.tv.watch();
        }
    }
}

// 产品
class Tv {
    // 生成者消费者模式
    // 演员准备好表演时通知观众观看，观众观看时通知演员入场
    String voice;   // 表演的节目

    // 设置标志位
    boolean flag = true;

    // 表演
    public synchronized void play(String voice) {

        if (!flag) {
            try {
                this.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.println("演员表演了 " + voice);
        // 通知观众观看
        this.voice = voice;

        this.notifyAll();

        this.flag = !this.flag;
    }

    // 观看
    public synchronized void watch() {

        if (flag) {
            try {
                this.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        System.out.println("观众观看了 " + this.voice);
        // 通知演员入场
        this.notifyAll();

        this.flag = !this.flag;
    }
}
```







## 六、线程池

### 1、介绍

背景：经常创建和销毁、使用量特别大的资源，比如并发情况下的线程，对性能影响很大

思路：提前创建好多个线程，放入线程池中，使用时直接获取，使用完后放回池中。可以避免频繁的创建、销毁，实现重复利用。



好处：

- 提高响应速度（减少了创建线程的时间）
- 降低资源消耗（重复利用线程池中的线程，不需要每次都创建）
- 便于线程管理
  - `corePoolSize`：核心池的大小
  - `maximumPoolSize`：最大线程数
  - `keepAliveTime`：线程没有任务时最多保持多长时间后会终止





### 2、使用

JDK5.0 起提供了线程池相关的 API：`ExecutorService` 和 `Executors`



- `ExecutorService`：真正的线程池接口。常见的子类有 `ThreadPoolExecutor`
  - `void execute(Runnable command)`：执行任务/指令，没有返回值，一般用来执行 `Runnable`
  - `<T> Future<T> submit(Callable<T> task)`：执行任务，有返回值（线程执行的结果），一般用来执行 `Callable`
  - `void shutdown()`：关闭线程池
- `Executors`：工具类、线程池的工厂类，用于创建并返回不同类型的线程池



```java
/**
 * @author naivekyo
 * @date 2021/7/25
 */
public class TestThreadPool {

    public static void main(String[] args) {
        // 1. 创建线程池服务
        ExecutorService service = Executors.newFixedThreadPool(3);

        service.execute(new MyThread());
        service.execute(new MyThread());
        service.execute(new MyThread());
        
        service.shutdown();
    }
}

class MyThread implements Runnable {

    @Override
    public void run() {
        for (int i = 0; i < 10; i++) {
            System.out.println(Thread.currentThread().getName() + " --------------- 执行结果: " + i);
        }
    }
}
```





## 七、总结



> 补充：Callable 线程的另一种启动方式



```java
/**
 * @author naivekyo
 * @date 2021/7/25
 */
public class Summary {

    public static void main(String[] args) throws ExecutionException, InterruptedException {

        FutureTask<Integer> integerFutureTask = new FutureTask<>(new MyCallableThread());
        
        integerFutureTask.run();

        System.out.println("获取结果: " + integerFutureTask.get());
    }
}


class MyCallableThread implements Callable<Integer> {
    
    @Override
    public Integer call() throws Exception {

        System.out.println("执行线程。。。");
        
        return 3;
    }
}
```

