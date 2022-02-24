---
title: JUP (一) JUC Of Lock And Collection
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211208174650.jpg'
coverImg: /img/20211208174650.jpg
cover: false
toc: true
mathjax: false
date: 2022-02-15 15:39:28
summary: "Java 并发编程: JUC 中的 Lock 和线程安全的集合"
categories: "Java Concurrent"
keywords: "Java Concurrent"
tags: "Java Concurrent"
---



# 初识 JUC ：Sync、Lock、集合

## 1、什么是 JUC

JUC 指的是 `java.util.concurrent` 包，主要和并发编程有关：

- `java.util.concurrent`
- `java.util.concurrent.atomic`
- `java.util.concurrent.locks`



## 2、线程和进程

有以下几点需要注意：

- 程序指的是指令和数据的有序集合，它是静态的；

- 进程则是程序的一次执行过程，是动态的，进程是<mark>系统资源分配的单位</mark>；

- 一个进程至少包含一个线程，线程是<mark>CPU 调度和执行的单位</mark>；
- 如果在进程内开辟了多个线程，线程的运行是操作系统的调度器决定的；
- 操作系统为一个进程分配了内存资源后，该进程内的所有线程共用该内存资源，同时每个线程又有自己的工作内存，在自己的工作内存中交互。

对于一个 Java 程序而言，当该程序运行时，会创建一个进程，该进程内至少包含两个线程，即 用户主线程（main）和 GC 守护线程。

在 Java 中通常有三种方式取创建线程：继承 Tread、实现 Runnable、实现 Callable。

**注意：Java 程序是运行在 JVM 中的，无法直接和操作系统交互，Java 可以创建线程对象，但是无法为其分配系统资源，只能通过本地方法（C++方法）来为子线程分配资源。**



> 并发

真正的多线程其实指的是有多个 CPU，即多核，比如说服务器就是多核的，而笔记本电脑一般是单个 CPU 的；

当然在只有一个 CPU 的情况下，可以通过时间片轮转的方式让多个线程轮换着使用 CPU 资源，这样看起来是并行的。

可以通过如下代码查看当前运行环境的相关信息：

```java
public class Test {

    public static void main(String[] args) {

        // 查看当前系统的 CPU 核数
        // Tip: CPU 密集型和 IO 密集型
        System.out.println(Runtime.getRuntime().availableProcessors());
    }
}
```

Windows 系统在 cmd 中使用 systeminfo 命令也可以查看系统信息。

<mark>并发编程的本质就是：充分利用 CPU 的资源。</mark>

## 3、线程状态

先看两幅图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210719191947.png)

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210719192743.png)



在 `Tread` 类中有一个枚举类展示了线程的所有状态：

```java
// java.lang.Thread.$State
public enum State {
    
    NEW,

    RUNNABLE,

    BLOCKED,

    WAITING,

    TIMED_WAITING,

    TERMINATED;
}
```

分别是：

| 状态          | 含义     | Tip                                |
| ------------- | -------- | ---------------------------------- |
| NEW           | 新生     | 尚未启动的线程                     |
| RUNNABLE      | 运行     | JVM 中运行的线程                   |
| BLOCKED       | 阻塞     | 被阻塞等待监视器锁定的线程         |
| WAITING       | 等待     | 等待其他线程执行特定工作           |
| TIMED_WAITING | 超时等待 | 等待其他线程执行特定时长的特定工作 |
| TERMINATED    | 终止     | 已退出的线程                       |

> wait/sleep 区别

**1、来自不同的类**

`wait() => Object`

`sleep() => Thread`

实际开发一般不会直接使用 wait 方法，而是通过 `java.util.concurrent.TimeUnit` 枚举类去操作。

**2、锁的释放**

wait 会释放锁、sleep 不会释放锁。

**3、使用的范围不同**

- `wait()` 方法只能在 <strong style="color:red">同步方法或者同步代码块</strong> 中使用
- `sleep()` 方法可以在任何地方使用

**4、是否需要捕获异常**

两者都可能抛出线程中断异常（`InterruptedException`）都需要捕获。

## 4、Lock 锁

### （1）传统的 Synchronized

举个例子：买票问题：

```java
/**
 * 注意共享资源应该就是一个单独的资源类，没有任何附属的操作
 * 资源类中应只包含属性和方法
 */
public class SaleTicketDemo01 {

    public static void main(String[] args) {
        // 并发: 多线程操作同一个资源类，把资源类丢入线程
        Ticket ticket = new Ticket();

        new Thread(() -> {
            for (int i = 0; i < 60; i++) {
                ticket.sale();
            }
        }, "A").start();

        new Thread(() -> {
            for (int i = 0; i < 60; i++) {
                ticket.sale();
            }
        }, "B").start();

        new Thread(() -> {
            for (int i = 0; i < 60; i++) {
                ticket.sale();
            }
        }, "C").start();
    }
}

// 资源类
class Ticket {
    // 共享资源
    private int number = 50;
    
    // 买票（同步方法以 this 为锁）
    public synchronized void sale() {
        if (this.number > 0) {
            System.out.println(Thread.currentThread().getName() + "买到了一张票, 剩余票数: " + --this.number);
        } else {
            System.out.println("票已经卖完了");
        }
    }
}
```

这里我们使用了 `synchronized` 同步方法来决解线程同步问题，它的实现原理是<mark>队列和锁</mark>；

由于同步方法以当前共享资源对象为锁，所以共享资源一次只能被一个线程访问，当想要访问共享资源的线程数量非常多的时候，它们就会在操作系统调度器的操作下形成一个线程队列，按照次序来访问共享资源，从而保证了数据的准确性。

但是这样也造成了一些问题：

- 一个线程持有锁会导致其他所有需要此锁的线程挂起；
- 在多线程竞争共享资源的情形下，加锁、释放锁会导致比较多的 **上下文切换** 和 **调度延时**，引起性能问题；
- 有时候也会造成优先级高的线程等待一个优先级低的线程释放锁，导致 **优先级倒置问题**，从而引起性能问题。



### （2）Lock 锁

在 `java.util.locks` 包下面有三个接口：

- `Condition`
- `Lock`
- `ReadWriteLock`

先提一点 synchronized 关键字修饰的同步方法或者同步代码块都是为每个线程提供了与共享资源相关联的**隐式监视器锁（出了块级作用域就自动释放）**的访问，使用该关键字可以让并发编程更加容易，并有助于避免许多涉及锁的常见编程错误，但是这种方式也有一些缺点：

- 加锁、释放锁的上下文切换、调度延时导致的性能问题；
- 所有锁的获取与释放必须以块结构的方式发生，当一个块内需要获取多个锁时，必须以相反的顺序被释放；
- 上面两点，性能和范围导致了 synchronized 不够灵活。

所以现在更推荐使用自定义**显式锁（Lock）**来进行并发编程：

- Lock 是显式锁，开发者需要手动开启和关闭；
- Lock 只有代码块锁，但是它允许开发者获取锁后在不同的块范围释放锁，比如说，在一些链式结构中，首先获取锁 A，然后获取锁 B，接着释放锁 A 并获取锁 C，范围和顺序都较为灵活；
- 使用 Lock 锁，JVM 将花费较少的时间来调度线程，性能更好，并具有较好的扩展性（不同的实现类）。

推荐以下面这种方式使用 Lock 锁：

```java
Lock l = ...;
l.lock();
try {
    // access the resource protected by this lock
} finally {
    l.unlock();
}
```

<mark>注意先定义锁对象（由于锁本身就是普通的对象，其内部也可以使用 synchronized），然后通过 try-finally 或者 try-catch 加锁和释放锁，注意当锁定和解锁在不同的作用域中发生时，最后一定要确保释放锁</mark>

> 主要实现类

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220213170700.png)

- `ReentrantLock`：可重入锁，最为常用
- `ReadLock`：读锁
- `WriteLock`：写锁

简单看一下可重入锁的两个构造器：

```java
public ReentrantLock() {
    sync = new NonfairSync();
}

public ReentrantLock(boolean fair) {
    sync = fair ? new FairSync() : new NonfairSync();
}
```

创建可重入锁对象的时候，默认会构建一个非公平锁（`new NonfairSync()`），如果给构造器传入一个布尔值，则可以选择是生成公平锁还是非公平锁。

- 公平锁：要求线程排队，先到先得锁从而先访问共享资源；

- 非公平锁：允许线程插队（默认非公平锁）。

使用显式锁重写卖票案例：

```java
public class SaleTicketDemo02 {

    public static void main(String[] args) {
        Ticket ticket = new Ticket();

        new Thread(() -> {
            for (int i = 0; i < 51; i++) {
                ticket.sale();
            }
        }, "A").start();

        new Thread(() -> {
            for (int i = 0; i < 51; i++) {
                ticket.sale();
            }
        }, "B").start();

        new Thread(() -> {
            for (int i = 0; i < 51; i++) {
                ticket.sale();
            }
        }, "C").start();
    }
}

// 资源类
class Ticket {
    // 共享资源
    private int number = 50;
    
    // 定义可重入锁
    Lock lock = new ReentrantLock();
    
    // 买票（定义显式锁）
    public void sale() {
        // 枷锁
        lock.lock();
        try {
            // 业务代码
            if (this.number > 0) {
                System.out.println(Thread.currentThread().getName() + "买到了一张票, 剩余票数: " + --this.number);
            } else {
                System.out.println("票已经卖完了");
            }
        } catch (Exception e) {
          e.printStackTrace();  
        } finally {
            // 最后确保一定会释放锁
            lock.unlock();
        }
    }
}
```

> 总结 Lock 和 Synchronized 的区别

1、Synchronized 是内置的 Java 关键字，Lock 是一个 Java 类；

2、Synchronized 无法判断获取锁的状态，Lock 可以判断是否获取到了锁；

3、Synchronized 会按顺序自动释放锁，Lock 必须要手动释放锁，如果不能确保释放锁，就会造成死锁问题；

4、Synchronized 某个线程获取到锁之后，其他线程阻塞，Lock 某个线程获取锁后，其他线程不一定会阻塞，它们可以尝试获取锁（通过 `lock.tryLock()`）；

5、Synchronized 是可重入锁，不可以中断，是非公平的；Lock 也是可重入锁，但是可以判断是否可以获取锁，并且允许设置是否是公平的；

<mark>补充可重入的概念：强调对单一线程执行时重新进入同一个子程序任然是安全的</mark>

判断能否获取锁的使用方式：

```java
Lock lock = ...;
if (lock.tryLock()) {
    try {
        // manipulate protected state
    } finally {
        lock.unlock();
    }
} else {
    // perform alternative actions
}
```

6、Synchronized 适合锁的数量较少时的线程同步问题，Lock 适合锁的数量较多时线程同步问题。



### （3）生产者消费者问题

提一点， `synchronized` 其实解决的是线程同步的问题，而生产者消费者问题是线程通信问题，Java 中在 `Object` 类中定义了一些方法用于解决线程通信问题，即：`wait()、notify()` 等方法，注意它们只能作用于同步方法或者同步代码块；

生产者消费者问题的经典解决方法有两种：

- 管程法：利用一个缓冲区
- 信号灯法：利用信号量机制

之前的博客中实现这两种方法的原理是 [synchronized + wait + notify](https://naivekyo.github.io/2021/07/25/java-thread-rudimentary-knowledge/#toc-heading-32)，要点在于这些方法只能作用于同步方法或者同步代码块，获得隐式监视器锁，某个线程执行 `wait` 方法后释放锁并进入阻塞状态，然后进入和该隐式锁关联的等待唤醒队列中，其他线程获取了隐式锁后执行了 `notify` 或者 `notifyAll` 方法，就会去唤醒队列中唤醒一个或所有的等待线程（具体参加源码 `Object.wait()` 方法的注释）；

一旦线程数量大于 2，使用该方法就可能会出现问题，例如下面这样：

```java
public class P_C_Demo03 {
    public static void main(String[] args) {
        Data data = new Data();
        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                data.increment();
            }
        }, "A").start();
        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                data.decrement();
            }
        }, "B").start();
        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                data.increment();
            }
        }, "C").start();
        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                data.decrement();
            }
        }, "D").start();
    }
}

class Data {
    
    private int number = 0;
    
    public synchronized void increment() {
        if (number != 0) {
            try {
                this.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        number++;
        System.out.println(Thread.currentThread().getName() + " => " + number);
        this.notifyAll();
    }
    
    public synchronized void decrement() {
        if (number == 0) {
            try {
                this.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        number--;
        System.out.println(Thread.currentThread().getName() + " => " + number);
        this.notifyAll();
    }
}
```

### （4）线程虚假唤醒

运行程序会发现 number 会出现大于 1 的情况，这是因为出现了虚假唤醒，在 `wait()` 方法的源码中点出了 <strong style="color:red">虚假唤醒</strong> 的问题（虚假唤醒也可以称为提前唤醒）：

```java
线程也可以在不被通知、中断或者超时的情况下被唤醒，这就是所谓的虚假唤醒。虽然这种情况很少发生，但应用程序必须通过测试导致线程被唤醒的条件来防范这种情况，并在条件不满足时继续等待。 换句话说，等待应该总是发生在循环中，就像下面这个:  

synchronized (obj) {
    while (<condition does not hold>)
    	obj.wait(timeout);
    ... // Perform action appropriate to condition
}
```

为什么使用循环就可以解决问题呢，而使用 if 就会产生虚假唤醒问题？

先理解 `wait()` 方法的执行过程：

- 线程 X 拿到隐式监视器锁后，调用其 `wait()` 方法，此线程阻塞；
- 其他线程得到该锁执行业务后使用 `notifyAll()` 方法唤醒所有处于待唤醒队列中的线程；
- 线程 X 刚好又拿到了锁，此时回到最开始调用 `wait()` 方法的位置，继续执行；（**重点**）

以上个例子中的四个线程为例，A、C 为生产者，B、D 为消费者，假设出现了如下情况：

- 最开始 A 拿到锁，执行 ++
- A 执行 `notifyAll()`，发现待唤醒队列中没有线程，A 继续拿着锁执行，但是判断条件成立，调用 `wait()` 方法释放锁并进入待唤醒队列；
- C 抢到锁，C 判断通过，C 调用 `wait()` 方法释放锁并进入待唤醒队列；
- B 抢到锁，判断不通过，执行 -- 操作，然后调用 `notifyAll()` ；
- B 刚好唤醒了 A，A 回到执行 `wait()` 方法的地方向下继续执行 ++ 操作，然后调用 `notifyAll()` ；
- A 刚好唤醒了 C，C 回到执行 `wait()` 方法的地方向下继续执行 ++ 操作，然后调用 `notifyAll()`；
- …………

问题就出现了，我们的理想状态下是生产者和消费者线程交替被唤醒，但是在非常巧合的情况下一个消费者线程唤醒了一个生产者线程，然后这个生产者线程又唤醒了另一个生产者线程，同时我们的判断逻辑是这样的：

```java
if(condition) {
    this.wait();	// 阻塞的位置
    // 当前线程被其他线程唤醒后会从当初阻塞的地方开始向下执行
    // 由于是 if 判断，向下继续执行就会直接跳出 if 代码块
}
```

而换做 while 循环判断时是这样的：

```java
while(condition) {
    this.wait();
    // 当前线程被唤醒后从此处开始执行
    // 由于是 while 代码块，所以需要继续判断条件是否成立
}
```

解决代码如下：

```java
class Data {
    
    private int number = 0;
    
    public synchronized void increment() {
        while (number != 0) {
            try {
                this.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        number++;
        System.out.println(Thread.currentThread().getName() + " => " + number);
        this.notifyAll();
    }
    
    public synchronized void decrement() {
        while (number == 0) {
            try {
                this.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        number--;
        System.out.println(Thread.currentThread().getName() + " => " + number);
        this.notifyAll();
    }
}
```

### （5）JUC 版生产者消费者

前面通过 `synchronized + await + notify` 的方式让线程等待，然后执行业务，最后唤醒其他线程，这一套流程如果换做 Lock 来实现的话，该如何去做呢？

首先应该分析 `synchronized` 为什么可以使用这一套流程，这里面有两个非常重要的地方：

- 隐式监视器锁
- Object 监视方法（wait、notify、notifyAll）

以同步方法为例，锁就是当前对象，通过 Object 监视方法将持有隐式锁的线程和该隐式锁的唤醒集合进行关联。

而在 JUC 中我们是定义了显示锁 `Lock`，还缺少监视方法，在 `Lock` 的源码中，可以找到这样一个方法：

```java
/**
* Returns a new {@link Condition} instance that is bound to this
* {@code Lock} instance.
*
* <p>Before waiting on the condition the lock must be held by the
* current thread.
* A call to {@link Condition#await()} will atomically release the lock
* before waiting and re-acquire the lock before the wait returns.
*
* <p><b>Implementation Considerations</b>
*
* <p>The exact operation of the {@link Condition} instance depends on
* the {@code Lock} implementation and must be documented by that
* implementation.
*/
Condition newCondition();
```

该方法返回一个 `Condition` 实例，而 `Condition` 其实是 `java.util.concurrent.locks` 下的一个接口，阅读注释可以发现：

<mark>Condition 将 Object 监视方法(wait、notify 和 notifyAll)分解为不同的对象，通过使用任意的 Lock 实现将它们组合起来，从而实现每个对象拥有多个等待集的效果。 在 Lock 替换 synchronized 方法和语句的地方，Condition替换 Object 监视方法的使用。</mark>

原来可以利用 `Condition` 将监视方法分解为监视对象，而`Condition` 实例本质上是绑定在锁上的，要获取特定锁实例的 `Condition` 实例，只需调用其 `newConditon()` 方法。

注释中给出了 `Condition` 的一个例子：

```java
class BoundedBuffer {
    final Lock lock = new ReentrantLock();
    final Condition notFull  = lock.newCondition(); 
    final Condition notEmpty = lock.newCondition(); 

    final Object[] items = new Object[100];
    int putptr, takeptr, count;

    public void put(Object x) throws InterruptedException {
        lock.lock();
        try {
            while (count == items.length)
                notFull.await();
            items[putptr] = x;
            if (++putptr == items.length) putptr = 0;
            ++count;
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    public Object take() throws InterruptedException {
        lock.lock();
        try {
            while (count == 0)
                notEmpty.await();
            Object x = items[takeptr];
            if (++takeptr == items.length) takeptr = 0;
            --count;
            notFull.signal();
            return x;
        } finally {
            lock.unlock();
        }
    }
}
```

到此处，我们就明白了如何利用 `Lock` 和 `Condition` 去解决线程通信问题了，这里有一点需要注意的是，`Obejct` 中有 `notify()` 和 `notifyAll()`，而 `Condition` 中则有 `signal()` 和 `signalAll()`。

使用 `Lock-Condition await-signal` 可以精准通知和唤醒线程模式；

使用 `Lock-Condition await-signalAll` 可以通知所有线程来重新竞争获取资源访问权。

下面以生产者消费者的两种解决方法来演示精准通知和全部通知：

#### 管程法（精准唤醒和通知）

代码如下：

```java
public class Producer_Consumer_Demo02 {

    public static void main(String[] args) {
        BufferArea bufferArea = new BufferArea();
        
        new Thread(new Producer(bufferArea)).start();
        new Thread(new Customer(bufferArea)).start();
    }
}

// 生产者
class Producer implements Runnable {

    private BufferArea bufferArea;

    public Producer(BufferArea bufferArea) {
        this.bufferArea = bufferArea;
    }

    @Override
    public void run() {
        for (int i = 0; i < 12; i++) {
            System.out.println("生产 id 为 " + i + " 的产品");
           this.bufferArea.push(new Product(i));
        }
    }
}

// 消费者
class Customer implements Runnable {
    
    private BufferArea bufferArea;

    public Customer(BufferArea bufferArea) {
        this.bufferArea = bufferArea;
    }

    @Override
    public void run() {
        for (int i = 0; i < 12; i++) {
            Product pop = this.bufferArea.pop();
            if (pop != null) {
                System.out.println("消费者消费了 id 为 " + pop.id + " 的产品");
            }
        }
    }
}

// 缓冲区
class BufferArea {

    private final Lock lock = new ReentrantLock();
    
    // 生产者线程的 Condition
    private final Condition notFull = lock.newCondition();
    
    // 消费者线程的 Condition
    private final Condition notEmpty = lock.newCondition();
    
    private int counter = 0;
    
    // 最多 10 个产品
    private Product[] products = new Product[10];
    
    // 生产者生产产品
    public void push(Product product) {
        lock.lock();
        try {
            // 防止虚假唤醒
            while (counter == products.length) {
                // 通知消费者消费，生产者等待
                notFull.await();
            }
            products[counter++] = product;
            notEmpty.signal();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
    
    // 消费者消费产品
    public Product pop() {
        lock.lock();
        try {
            while (counter == 0) {
                notEmpty.await();
            }
            notFull.signal();
            return this.products[--counter];
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
        return null;
    }
}

// 产品
class Product {
    
    int id;

    public Product(int id) {
        this.id = id;
    }
}
```

上面的代码中共享资源和锁（显式锁）都只有一个，但是和该锁关联的监视对象有两个，即两个 `Condition`，这两个监视对象分别和两条线程绑定，从而实现了精准通知和唤醒。



#### 信号灯法（通知所有）

代码如下：

```java
public class P_C_Signal {
    public static void main(String[] args) {
        Resource resource = new Resource();
        new Thread(new Num_Producer(resource), "A").start();
        new Thread(new Num_Customer(resource), "B").start();
        new Thread(new Num_Producer(resource), "C").start();
        new Thread(new Num_Customer(resource), "D").start();
    }
}

class Num_Producer implements Runnable {

    private final Resource resource;

    public Num_Producer(Resource resource) {
        this.resource = resource;
    }

    @Override
    public void run() {
        for (int i = 0; i < 30; i++) {
            this.resource.increment();
        }
    }
}

class Num_Customer implements Runnable {

    private final Resource resource;

    public Num_Customer(Resource resource) {
        this.resource = resource;
    }

    @Override
    public void run() {
        for (int i = 0; i < 30; i++) {
            this.resource.decrement();
        }
    }
}

class Resource {
    
    private final Lock lock = new ReentrantLock();
    
    private final Condition condition = lock.newCondition();
    
    // 共享资源
    private int number = 0;
    
    // 信号量
    private boolean flag = true;
    
    public void increment() {
        lock.lock();
        try {
            while (!flag) {
                condition.await();
            }
            System.out.println(Thread.currentThread().getName() + " number++ => " + ++number);
            this.flag = false;
            condition.signalAll();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
    
    public void decrement() {
        lock.lock();
        try {
            while (flag) {
                condition.await();
            }
            System.out.println(Thread.currentThread().getName() + " number-- => " + --number);
            this.flag = true;
            condition.signalAll();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
}
```

上面的代码中，共享资源和锁只有一个，和该锁关联的监视器也只有一个，但是该监视器和所有线程绑定，从而实现通过 `signalAll()` 方法唤醒所有线程，所有线程再去竞争锁。



## 5、几个例子

锁是什么？如何判断锁的是谁？



### Case 1：延时 + 单个对象 + 同步方法

```java
public class Test1 {
    public static void main(String[] args) {
        Phone phone = new Phone();
        
        new Thread(phone::sendSms, "A").start();

        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        new Thread(phone::call, "B").start();

    }
}

class Phone {
    
    public synchronized void sendSms() {
        System.out.println(Thread.currentThread().getName() + " sendSms");
    }
    
    public synchronized void call() {
        System.out.println(Thread.currentThread().getName() + " call");
    }
}
```

这种情况下首先进入运行状态的线程是 A，控制台打印 `sendSms`；

修改一下 `Phone` 类的代码，其他不变：

```java
class Phone {
    
    public synchronized void sendSms() {
        try {
            TimeUnit.SECONDS.sleep(4);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(Thread.currentThread().getName() + " sendSms");
    }
    
    public synchronized void call() {
        System.out.println(Thread.currentThread().getName() + " call");
    }
}
```

结果就是线程 A 依旧是比 B 先进入运行状态。

为什么呢？一种错误的理解是 <font color="red">线程 A、B 之间休眠了 1 s，所以 A 比 B 先被调度器调用，A 率先获得 CPU 资源</font>；

然而并非如此，究其本质，这是 `synchronized` 锁导致的：

> synchronized 锁的对象是 this, 即方法的调用者, 在这里就是 Phone 对象，谁先拿到锁, 谁就先调用

Case 1 中锁只有一个，A 线程第一个拿到锁，所以 A 第一个执行。

<mark>补充一点：普通方法（没有 synchronized 或者 Lock）不受锁影响。</mark>



### Case 2：延时 + 多个对象 + 同步方法

代码如下：

```java
public class Test2 {
    public static void main(String[] args) {
        // 两个对象
        Phone2 phone1 = new Phone2();
        Phone2 phone2 = new Phone2();

        new Thread(phone1::sendSms, "A").start();

        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        new Thread(phone2::call, "B").start();

    }
}

class Phone2 {
    
    public synchronized void sendSms() {
        try {
            TimeUnit.SECONDS.sleep(2);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(Thread.currentThread().getName() + " sendSms");
    }

    public synchronized void call() {
        System.out.println(Thread.currentThread().getName() + " call");
    }
}
```

这种情况下准备了两个 `Phone` 对象，线程 A 和 B 个持有一把锁，如果没有延时的话，线程 A 和 B 的调度是不确定，只和操作系统的线程调度器有关；

但是由于存在延时，所以此种情况下控制台一定是先打印 `B call`，因为 A 调用同步方法时，同步方法内部延时了 2 s。



### Case 3：延时  + 静态同步方法

将 `synchronized` 方法变为静态方法：

```java
public class Test3 {
    public static void main(String[] args) {
        
        new Thread(Phone3::sendSms, "A").start();

        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        new Thread(Phone3::call, "B").start();

    }
}

class Phone3 {

    public static synchronized void sendSms() {
        try {
            TimeUnit.SECONDS.sleep(2);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(Thread.currentThread().getName() + " sendSms");
    }

    public static synchronized void call() {
        System.out.println(Thread.currentThread().getName() + " call");
    }
}
```

运行程序会发现，此时依旧是线程 A 先运行，控制台打印 `A sendSms`，因为 A 首先持有锁：

> synchronized 修饰静态方法, 此时锁是 Class 对象（全局唯一）



### Case 4：延时 + 多个对象 + 静态同步方法

多对象静态方法：

```java
public class Test3 {
    public static void main(String[] args) {

        Phone3 phone1 = new Phone3();
        Phone3 phone2 = new Phone3();
        
        new Thread(() -> {
            phone1.sendSms();
        }, "A").start();

        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        new Thread(() -> {
            phone2.call();
        }, "B").start();

    }
}

class Phone3 {

    // synchronized 修饰静态方法, 此时锁是 Class 对象
    public static synchronized void sendSms() {
        try {
            TimeUnit.SECONDS.sleep(2);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(Thread.currentThread().getName() + " sendSms");
    }

    public static synchronized void call() {
        System.out.println(Thread.currentThread().getName() + " call");
    }
}
```

创建多个对象，`synchronized` 修饰静态方法，通过实例调用静态方法，此时锁仍然是 `Class` 对象，不管对象有多少，模板 Class 只有一个，所以 A 线程依旧第一个运行。



### Case 5：无延时 + 普通同步 + 静态不同

如果将一个方法改为普通同步方法，另一个依旧为静态同步方法：（去掉延时）

```java
public class Test3 {
    public static void main(String[] args) {

        Phone3 phone1 = new Phone3();
        Phone3 phone2 = new Phone3();
        
        new Thread(() -> {
            phone1.sendSms();
        }, "A").start();

        new Thread(() -> {
            phone2.call();
        }, "B").start();

    }
}

class Phone3 {

    // synchronized 修饰静态方法, 此时锁是 Class 对象
    public static synchronized void sendSms() {
        System.out.println(Thread.currentThread().getName() + " sendSms");
    }

    public synchronized void call() {
        System.out.println(Thread.currentThread().getName() + " call");
    }
}
```

此时会发现，这两个同步方法的锁是不同的，一个是 Class 对象，一个是实例对象，因此两个线程的调用是不确定的，这只和操作系统有关。



### 小结

- 实例同步方法的锁是实例对象；
- 静态同步方法的锁是 Class 对象



## 6、线程不安全集合

Java 的 Colection 接口衍生出来的常用的集合接口有：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220214160928.png)



### 不安全的 List

普通开发情形下，我们使用的 `List`、`Map` 其实是单线程安全的，但是一旦涉及到多个线程对某个集合进行操作，此时就是线程不安全的，举个例子：

```java
public class UnsafeCollection {

    private List<Integer> list = new ArrayList<>();
    
    public static void main(String[] args) throws InterruptedException {
        List<String> list = new ArrayList<>();

        for (int i = 0; i < 10; i++) {
            new Thread(() -> {
                list.add(UUID.randomUUID().toString().substring(0, 3));
                System.out.println(Thread.currentThread().getName() + " " + list);
            }, String.valueOf(i)).start();
        }
        
        TimeUnit.SECONDS.sleep(3);
        System.out.println(list);
    }
}
```

打印出来，会发现有时候很多位置上的元素是 null：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220214144651.png)

如果将延时时间调大，还会出现：`java.util.ConcurrentModificationException` 的异常，即并发修改异常。

出现了并发问题，我们首先应该想到的是使用 `synchronized` 解决，这一点 JDK 官方其实早就做了，有一种数据结构叫做 `Vector<E>`，这是早期 Java 为了致敬 C++ 所引入的一种数据结构，在 JDK 1.0 时代就出现了，现在已经不使用它了，看一下 `Vector<E>` 的 `add()`

```java
public synchronized boolean add(E e) {
    modCount++;
    ensureCapacityHelper(elementCount + 1);
    elementData[elementCount++] = e;
    return true;
}
```

在看看 JDK 1.2 时期出现的 `ArrayList` 的 `add()` 源码：

```java
public boolean add(E e) {
    // 下面的方法是判断是否需要扩容
    ensureCapacityInternal(size + 1);  // Increments modCount!!
    elementData[size++] = e;
    return true;
}
```

常规的 `ArrayList` 中并没有做任何同步操作。

### JUC 解决思路 COW + Lock

官方不推荐使用 `Vector<E>` 也不建议在多线程环境下使用 `ArrayList<E>`，那么该如何解决并发问题呢？

一种方法是使用 `Collections` 集合工具类中提供的相关方法获取线程安全的集合：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220214150439.png)

现在学习了 `java.util.concurrent` 包后，我们也可以使用该包下面提供的用于并发的集合类，比如说线程同步的 ArrayList：

```java
// java.util.concurrent.CopyOnWriteArrayList#add(E e)

// 显式可重入锁
final transient ReentrantLock lock = new ReentrantLock();

// 集合元素(多线程之间可见)
private transient volatile Object[] array;

final Object[] getArray() {
    return array;
}

final void setArray(Object[] a) {
    array = a;
}

public boolean add(E e) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        Object[] elements = getArray();
        int len = elements.length;
        Object[] newElements = Arrays.copyOf(elements, len + 1);
        newElements[len] = e;
        setArray(newElements);
        return true;
    } finally {
        lock.unlock();
    }
}
```

可以看到里面用到了可重入锁，因此线程是安全的；

<mark>提一句：CopyOnWrite 简称 COW，即写入时复制，是计算机程序设计领域的一种优化策略。其核心思想是如果有多个调用者（callers）同时请求相同资源（如内存或者磁盘上的数据存储），他们会共同获取相同的指针指向相同的资源，直到某个调用者视图修改资源的内容时，系统才会真正复制一份专用副本（private copy）给该调用者，而其他调用者所见到的最初的资源任然保持不变。</mark>

`COW` 作法的主要优点是如果调用者没有修改资源，就不会有副本（`private copy`）被创建，因此多个调用者只是读取操作时可以共享同一份资源。

至于为什么不使用 `Vector<E>` 而使用 `CopyOnWriteArrayList<E>`，最重要的一个原因是前者使用的 `synchronized` 耗费的性能比后者使用的 `Lock` 锁要更高。



### 不安全的 Set

和前面的代码类似，不安全的例子如下，会抛出 `ConcurrentModificationException` 异常：

```java
public class UnsafeSet {
    public static void main(String[] args) {
        Set<String> list = new HashSet<>();

        for (int i = 0; i < 10; i++) {
            new Thread(() -> {
                list.add(UUID.randomUUID().toString().substring(0, 5));
                System.out.println(list);
            }, String.valueOf(i)).start();
        }
    }
}
```

解决方式一：使用 `Set<String> list = Collections.synchronizedSet(new HashSet<>());`

解决方法而：JUC 中使用 `Set<String> list = new CopyOnWriteArraySet<>();`

回顾 `HashSet` 源码：

```java
// java.util.HashSet

// HashSet 内部持有一个 HashMap, 主要是利用它保证 Set 的不重复性
public HashSet() {
    map = new HashMap<>();
}

// 这个对象只是用来配置元素 E 从而检测是否存在 hash 冲突
private static final Object PRESENT = new Object();

public boolean add(E e) {
    // HashMap 的 put 方法非常特殊，如果 key 已经使用过了，就返回旧值并覆盖新址，否则返回 null
    // 也就意味着，如果不存在 hash 冲突，put 方法会返回 null
    return map.put(e, PRESENT)==null;
    // 不存在 hash 冲突意味着 HashSet 中没有重复的元素，保证了 Set 的不重复性
}
```



### 不安全的 Map

常规开发场景下我们是这样使用 `HashMap` 的：

```java
Map<String, String> map = new HashMap<>();
// 等价于
Map<String, String> map = new HashMap<>(16, 0.75f);
```

看一下 HashMap 的源码：

```java
// java.util.HashMap (JDK 1.8)

// 默认的初始化容量，该值必须是 2 的幂
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16

// 最大容量
static final int MAXIMUM_CAPACITY = 1 << 30;

// 默认加载因子
static final float DEFAULT_LOAD_FACTOR = 0.75f;

// hash 表节点从链表转换为红黑树的阈值（链表节点数量）, 该值范围：[2, 8]
// 当 hash 表中某个节点链表长度大于 8, 就会从链表转换为红黑树
static final int TREEIFY_THRESHOLD = 8;

// hash 表节点从红黑树恢复到链表的阈值（某棵红黑树的总结点数量）
static final int UNTREEIFY_THRESHOLD = 6;

// 整个 hash 表的所有节点拥有的元素总数量大于 64 后，所有节点都向红黑树转换的阈值
// 该值应该为 4 * TREEIFY_THRESHOLD
static final int MIN_TREEIFY_CAPACITY = 64;

// hash 表
transient Node<K,V>[] table;

// 整个 hash 表中存放的所有元素的总数量
transient int size;

// rehash 的阈值, 默认等于 capacity * loadfactor
int threshold;

// 负载因子
final float loadFactor;

// =================== 构造方法 ====================
public HashMap() {
    // 默认加载因子为 0.75
    this.loadFactor = DEFAULT_LOAD_FACTOR; // all other fields defaulted
}

public HashMap(int initialCapacity) {
    
    this(initialCapacity, DEFAULT_LOAD_FACTOR);
}

public HashMap(int initialCapacity, float loadFactor) {
    if (initialCapacity < 0)
        throw new IllegalArgumentException("Illegal initial capacity: " +
                                           initialCapacity);
    if (initialCapacity > MAXIMUM_CAPACITY)
        initialCapacity = MAXIMUM_CAPACITY;
    
    if (loadFactor <= 0 || Float.isNaN(loadFactor))
        throw new IllegalArgumentException("Illegal load factor: " +
                                           loadFactor);
    this.loadFactor = loadFactor;
    this.threshold = tableSizeFor(initialCapacity);
}

// 这个方法的作用是保证 hash 表的长度是 2 的幂
static final int tableSizeFor(int cap) {
    int n = cap - 1;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
}
```

不难看出这里有两个变量非常重要：

- 初始容量：`threshold`，要求大于 0，且必须为 2 的幂；
- 负载因子：`loadFactor`，关系到 hash 表的性能。

它们关系到 hash 表的初始长度，以及扩容（扩容涉及到 rehash、复制数据等操作，非常耗费性能。）

> put 方法

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
               boolean evict) {
   	
    Node<K,V>[] tab;  // 拿到当前 hash 表
    Node<K,V> p;  // p 是新元素所属的桶
    int n, i;	// n 是当前 hash 表长度，i 记录新插入元素应该放入的桶
    
    if ((tab = table) == null || (n = tab.length) == 0) {
        // 如果当前 hash 表刚刚被创建，是空的，就需要进行 resize 扩容，容量为 threshold （capacity * loadfactor）
        n = (tab = resize()).length;
    }
    // 看看 hash 表中当前新元素所属的桶是否存在
    if ((p = tab[i = (n - 1) & hash]) == null) {
        // 不存在旧先创建
        tab[i] = newNode(hash, key, value, null);
    } else {
        // 桶存在就先把新元素转化为 Node
        Node<K,V> e; K k;
        
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k)))) {
            // 如果当前元素的 hash 值重复了且 equals 方法也相同则进行覆盖
            e = p;
        } else if (p instanceof TreeNode) {
            // 如果当前桶已经转化为红黑树，就按照树的插入方式去插入
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        } else {
            // 否则将新元素插入当前桶
            // 首先遍历该桶，如果找到了相同 hash 值就直接 break 退出循环
            // 如果 hash 未重复就插入到当前桶的末尾，然后判断是否需要将当前桶转化为树
            for (int binCount = 0; ; ++binCount) {
                if ((e = p.next) == null) {
                    p.next = newNode(hash, key, value, null);
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        treeifyBin(tab, hash);
                    break;
                }
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                p = e;
            }
        }
        // 如果 e 不为 null，说明出现了 hash 冲突，根据条件选择是否要进行覆盖
        if (e != null) { // existing mapping for key
            V oldValue = e.value;
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;
            afterNodeAccess(e);
            return oldValue;
        }
    }
    ++modCount;
    // 判断当前 hash 表是否需要扩容
    if (++size > threshold)
        resize();
    afterNodeInsertion(evict);
    return null;
}
```

> get 方法

```java
public V get(Object key) {
    Node<K,V> e;
    return (e = getNode(hash(key), key)) == null ? null : e.value;
}

final Node<K,V> getNode(int hash, Object key) {
    Node<K,V>[] tab; // 拿到当前 hash 表
    Node<K,V> first, e; 
    int n; K k; // n 是桶的数量
    // 如果当前 hash 表不是 null 且持有桶的数量大于 0，且要获取的元素所在的桶不是空的
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (first = tab[(n - 1) & hash]) != null) {
		// 如果桶的第一个位置的元素（可能是链表、红黑树）就是我们要找的，直接返回
        if (first.hash == hash && // always check first node
            ((k = first.key) == key || (key != null && key.equals(k))))
            return first;
        
        if ((e = first.next) != null) {
            // 看桶的第二个元素是链表还是红黑树，分别按照不同的方式去查找
            if (first instanceof TreeNode)
                return ((TreeNode<K,V>)first).getTreeNode(hash, key);
            do {
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    return e;
            } while ((e = e.next) != null);
        }
    }
    // 如果没找到就返回 null
    return null;
}
```

> resize 方法

```java
final Node<K,V>[] resize() {
    // 旧的 hash 表
    Node<K,V>[] oldTab = table;
    // 旧 hash 表的容量
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    // 旧的 resize 阈值
    int oldThr = threshold;
    // 新容量、新阈值
    int newCap, newThr = 0;
    if (oldCap > 0) {
        if (oldCap >= MAXIMUM_CAPACITY) {
            // 如果旧容量已经达到最大就将阈值设置为 int 的最大值，并返回旧 hash 表
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        // 扩容机制: 容量和阈值都扩大 2 倍
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                 oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // double threshold
    }
    // 初始容量和阈值一样
    else if (oldThr > 0) // initial capacity was placed in threshold
        newCap = oldThr;
    else {               // zero initial threshold signifies using defaults
        // 第一次生成 hash 表后，初始容量为默认的 16，初始阈值为 capacity * loadFactor
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
   
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                  (int)ft : Integer.MAX_VALUE);
    }
    
    // 阈值扩容完毕
    threshold = newThr;
    // 生成新的 hash 表
    @SuppressWarnings({"rawtypes","unchecked"})
    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    // 进行数据复制
    if (oldTab != null) {
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;
                if (e.next == null)
                    newTab[e.hash & (newCap - 1)] = e;
                else if (e instanceof TreeNode)
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                else { // preserve order
                    Node<K,V> loHead = null, loTail = null;
                    Node<K,V> hiHead = null, hiTail = null;
                    Node<K,V> next;
                    do {
                        next = e.next;
                        if ((e.hash & oldCap) == 0) {
                            if (loTail == null)
                                loHead = e;
                            else
                                loTail.next = e;
                            loTail = e;
                        }
                        else {
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);
                    if (loTail != null) {
                        loTail.next = null;
                        newTab[j] = loHead;
                    }
                    if (hiTail != null) {
                        hiTail.next = null;
                        newTab[j + oldCap] = hiHead;
                    }
                }
            }
        }
    }
    return newTab;
}
```



研究了 HashMap 的 put 、get 以及 resize 操作后，我们发现 JDK 并未做任何同步操作，也就意味着在并发情形下会出问题，当很多条线程同时向一个 HashMap 插入数据的时候，一旦发生 resize，就很容易在某个桶上出现环形链表；这样当执行 `get` 操作时，计算出的 index 正好是环形链表的下标就会出现死循环：

```java
public class UnsafeMap {
    public static void main(String[] args) throws InterruptedException {
        Map<String, String> map = new HashMap<>();
        for (int i = 0; i < 1000; i++) {
            new Thread(() -> {
                map.put(Thread.currentThread().getName(), UUID.randomUUID().toString().substring(0, 5));

                System.out.println(map);
            }).start();
        }
    }
}
```

此时会抛出 `ConcurrentModificationException` 异常。

### 不安全 Map 解决方案

（1）方案一：如果我们通过 `Collections` 工具类：`Map<String, String> map = Collections.synchronizedMap(new HashMap<>());`

这个同步 Map 是定义了一个对象作为锁，然后为 map 的每个操作添加 `synchronized` 处理，但是如果我们在插入数据的时候同时迭代 map，还是会抛出 `ConcurrentModificationException` 异常。



（2）方案二：使用 `HashTable<K, V>`；

该数据结构是在 JDK 1.0 时代就出现了，现在已经弃用，其内部对 put 和 set 方法做了同步处理。

如果我们在多线程中插入数据并迭代 map，也会抛出 `ConcurrentModificationException` 异常。



（3）正确的方式：使用 `ConcurrentHashMap`

JUC 的 `ConcurrentHashMap` 不同于 `HashTable` 的同步方法以及 `Collections.synchronizedMap` 的同步代码块，JDK 1.7 版本的 `ConcurrentHashMap` 采用了分段锁技术（暂不做详细分析）但是和 1.7 的 HashMap 一样存在查询效率问题，而JDK 1.8 的 `ConcurrentHashMap` 则放弃了使用 `Segment` 分段锁，转而使用 `CAS + synchronized` 来保证并发安全性。

JDK 1.8 的`ConcurrentHashMap` 对节点中的 val 和 next 使用 `volatile` 修饰，保证线程间可见性。

其 put 操作大致流程如下：

- 根据特定 hash 函数通过 key 计算 hashcode
- 判断 hash 表是否需要初始化
- 通过 key 定位 Node，如果为空表示当前位置可插入，就利用 CAS（具体执行方式是通过 C++ 方法操作内存） 尝试写入
  - 如果不能插入，且需要扩容，就进行扩容操作
  - 如果不满足情况，就利用 `synchronized` 锁写入数据，写入的时候还要判断是否需要转化为红黑树

