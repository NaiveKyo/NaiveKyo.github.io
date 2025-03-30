---
title: Java Concurrent Programming overview
published: 2024-12-02
description: "Java concurrent programming overview."
image: './20220425111615.jpg'
tags: ["Java Concurrency"]
category: "Java Concurrency"
draft: false
lang: 'zh'
---

## JDK 并发模块概览

### Object monitor methods And Lock\&Condition

synchronized、wait、notify 等等是基于 implicit monitor lock object 的，对使用场合有限制，所有在 monitor 上加解锁的操作都有顺序要求（排队处理）；

Lock 相对于 synchronized 要更加灵活，虽然取消了自动释放锁的机制，但是允许在不同的 scope 中操作锁，所有 Lock 的实现必须遵循和 monitor lock 相同的内存一致性，这个在 JLS （Java Language Specification）的 Memory Model 中有声明。不同的 Lock 实现可用于不同的场景，比如可重入锁、读写锁等等；

Condition 抽象体系是将 monitor lock object 的 wait、notify、notifyAll 方法剥离出来，放到一个 Condition 对象中，同时结合 Lock 体系，使每个 Lock 实现对象可以创建多个 Condition 对象，从而拥有多个 wait-sets；

总结：使用 Lock 体系替代原来 synchronized 块或语句，使用 Condition 替代 object 的 monitor 方法，而且 Condition 和 Lock 是解耦的，而 implicit monitor lock object 和 monitor method 是强耦合的。

Condition（也可以叫做 condition queues 或者 condition variables）提供了一套机制可以让特定的线程挂起，并且允许其他线程在某种条件成立（通常是程序里某个状态发生变化）时通知这个线程从挂起状态恢复。由于对共享状态的访问是多线程并发访问的，因此需要使用某种形式的锁把对状态的操作保护起来，这意味着每个 Condition 都与一个锁绑定。Condition 和 Lock 绑定提供了一个关键功能就是当一个线程调用 Condition.await()，此时会自动释放当前持有的关联锁，然后挂起当前线程，进入等待状态，这种操作是原子性的，在释放锁和挂起线程之间，没有其他线程能抢占锁并修改共享状态，功能和 Object.wait 相似。

本质上一个 Condition 对象是绑在一个 Lock 内部的，可以通过调用 Lock.newCondition 方法获取特定锁的一个 Condition 对象。

Condition 的实现和 Object 的 monitor methods 在行为和语义上还是有些不同的，比如没法保证通知的顺序、在执行通知时也不需要持有锁。

注意：当某个线程在某个 Condition 对象上等待时，是允许出现 "spurious wakeup"（虚假唤醒）的，一般需要将 Condition 的 await 行为放在循环条件判断代码块中来应对线程虚假唤醒，这是对 JVM 内存语义的一种让步，对于大多数应用程序也会产生一些影响，虽然说 Condition 的实现可以提供处理虚假唤醒的功能，但是开发者应该总是考虑到可能会出现虚假唤醒的情况，总是把 Condition 方法放在循环代码块中，且循环终止条件是某个状态的改变。



### AbstractOwnableSynchronizer And AbstractQueuedSynchronizer

这个抽象类定义了一套框架用于实现依赖 first-in-first-out（FIFO）等待队列的 blocking locks 和 synchronizers（e.g. semaphores、events etc）。

如果要实现的 synchronizers 是基于单个 atomic int 状态变量的，那么以 AbstractQueuedSynchronizer 为基础是非常有用的，因为 AQS 内部就提供一个 int 型的状态变量，而子类应当为这个 int 型的 state 变量定义不同值代表的含义，比如锁的获取和释放状态，且提供一系列 protected 方法用于改变状态。除此之外当前类的其他方法主要涉及队列操作和阻塞操作。

AQS 抽象类并没有实现任何的同步接口，而是定义了一些方法比如 acquireInterruptibly，特定的 Lock 实现可以在内部的方法中调用 AQS 的方法，以此实现自己的功能。

AQS 支持 exclusive 和 shared 两种模式：

* exclusive 模式

独占模式，同一时间只能有一个线程成功获取锁（比如 ReentrantLock）；

* shared 模式

共享模式，多个线程同一时间都可能获取锁（比如 Semaphore 或 CountDownLatch），同一时间可能成功也可能失败；



子类可以选择实现其中一种模式，也可以都实现，比如 ReadWriteLock 同时支持读（共享模式）和写（独占模式）；

AQS 本身并不理解这两种模式的语义差异，它只提供通用的机制：

* FIFO 等待队列（即 CLH 队列）用于管理线程的排队；
* 通用的 acquire 和 release 方法，具体行为由子类通过实现 tryAcquire 和 tryRelease 等方法来提供；

在**共享模式**下，当某个线程成功获取锁时，需要检查队列中的下一个线程是否也可以成功获取。

无论是**独占模式**还是**共享模式**，AQS 中的所有等待线程都会加入**同一个 FIFO 等待队列**。



如果子类只实现了一种模式，可以不实现另一种模式，比如：

只实现独占模式的子类（如 ReentrantLock）：

* 只需实现 tryAcquire 和 tryRelease 方法，无需实现 tryAcquireShared 和 tryReleaseShared；



总结 AQS 的工作机制：

* **FIFO 等待队列**：
  * AQS 使用一个 FIFO 队列来管理等待线程。
  * 队列中的每个节点包含线程的状态信息（如独占或共享模式）。
* **模板方法设计**：
  * AQS 提供了通用的同步模板方法，如`acquire`、`release`、`acquireShared`、`releaseShared`。
  * 子类通过实现`tryAcquire`、`tryRelease`等方法定义具体行为。
* **灵活性**：
  * AQS 的设计支持多种同步器实现，允许子类根据需要定制独占或共享模式。



### AbstractQueuedSynchronizer. ConditionObject

AQS 抽象类内部提供了一个 Condition 的实现类：ConditionObject，它主要是为了配合 AQS 的独占模式使用的，帮助线程在需要等待某些条件时挂起，并在条件满足时被唤醒。

Note：如果 Lock 实现要支持独占模式，则必须重写 AQS.isHeldExclusively() 方法，这样 Lock 实现就可以通过调用该方法来判断调用方法的线程是否持有独占锁。而线程调用 await 方法等待条件时，ConditionObject 会释放当前线程持有的锁，这样其他线程就可以尝试获取锁了，而当条件满足时，被挂起的线程就会被唤醒，唤醒后 ConditionObject 会尝试通过 acquire 方法重新获取锁，并恢复等待之前的状态。AQS 本身不会自动生成 ConditionObject 对象，如果同步器的设计无法满足上述条件（如支持独占模式、并正确实现锁的释放和恢复），就不能使用 ConditionObject。

ConditionObject 的行为取决于 AQS 子类对 AQS 方法的具体实现，比如 ReentrantLock 中 ConditionObject 的 await 和 signal 方法负责独占锁的状态管理工作；

AQS 还提供了一些监控方法，可以用来检查内部队列的状态以及条件对象的状态：

* 比如 hasWaiters 检查是否有线程在等待条件；
* getWaitQueueLength 获取等待队列中的线程数量；

这些方法可以在 AQS 的子类实现中通过方法暴露出去。

AQS 只会序列化内部表示同步状态的原子整数 state，所以在反序列化后，AQS 内部的等待队列是空的，如果子类需要支持序列化，可以通过提供 readObject 等 Java 序列化相关的方法，在方法中对需要序列化的属性或对象进行处理。

> Usage

在 AQS 的基础上开发 synchronizer，可以按需重写这些方法：

查看和修改同步状态的方法：

* getState
* setState
* compareAndSetState

和两种模式相关的方法：

* tryAcquire
* tryRelease
* tryAcquireShared
* tryReleaseShared
* isHeldExclusively

在 AQS 中，这些方法默认都会抛出  UnsupportedOperationException 异常，实现类重写这些方法时也需要保证方法内部必须是线程安全的，代码不能过长，也不能阻塞。AQS 除了这些方法外，其他方法都是 final 修饰的，不能被修改。

尽管 AQS 是基于内部的一个 FIFO 的队列的（维护等待线程的顺序），但是这并不意味着会严格按照 FIFO 的顺序去处理线程，默认情况下，一个新的线程可以 "插队"，抢在队列中的其他线程之前获取锁，这种策略称为 "barging" （插队），它强调性能和吞吐量，而非严格公平。

通常独占式同步机制大致的核心处理逻辑是这样的：

```
Acquire:
      while (!tryAcquire(arg)) {
         enqueue thread if it is not already queued;
         possibly block current thread;
      }
 
Release:
    if (tryRelease(arg))         
        unblock the first queued thread;
```

这里用了 while 循环把尝试获取锁的方法包裹是为了防止线程虚假唤醒，调用方法后如果当前线程成功获取锁就返回 true，如果失败了就进入循环体，先判断当前线程如果没有在等待队列中就入队，接着可能会阻塞当前线程，等待被其他线程唤醒（比如 release 唤醒）。

释放锁的时候没用循环，只是用了 if 判断，释放锁时默认当前线程已经获取锁了，在释放成功后会唤醒等待队列中的第一个线程，该线程可以拥有锁。

共享模式的核心处理逻辑和独占式类似，只不过可能涉及级联信号（cascading signals）：

* 当一个线程成功获取共享锁时，可能需要唤醒队列中的下一个线程，使其继续尝试获取锁；
* 例如，Semaphore 和 CountDownLatch 使用的就是这种模式。



在独占式同步机制中，由于是在入队之前检查是否可以获取锁的，因此线程可能会比其他正在队列中阻塞的线程更早获取锁，这种实现更注重吞吐量和性能，而非严格的公平性。如果需要严格的 FIFO 公平性，可以通过重写 tryAcquire 或 tryAcquireShared 方法来实现：

* 可以使用 AQS 提供的检查方法（如 hasQueuedPredecessors 方法，如果当前线程前面有在等待线程，就返回 false），在 tryAcquire 方法阻止新线程插队。



默认的实现策略是允许插队的，因为首先考虑性能和吞吐量，而非严格公平性：

* 插队可以避免线程饥饿队列的 "长尾效应"；
* 线程可以在不严格的 FIFO 顺序中竞争资源，减少上下文切换；
* 每个等待线程在重新竞争锁时，都有公平的机会与新线程竞争；

在获取锁时，线程可能会多次调用 tryAcquire，注意尝试获取锁并不意味会立即阻塞（有点像自旋锁，但是没有无限循环）。

当然，如果需要的话，可以在调用 acquire 方法之前进行一次 "fast-path" check（快速路径检查），涉及下面两个方法：

* hasContended：是否有线程竞争锁；
* hasQueuedThreads：是否有线程在等待锁；



AQS 抽象类提供了一套高效、可伸缩的同步器基础实现，基于：

* int state 表示同步状态；
* 通过 FIFO 队列管理线程顺序；
* 支持独占和共享两种模式的同步器。

如果 AQS 的功能不能满足场景，也可以选择更底层的实现方法，比如：

* 使用各种 atomic 类，比如 AtomicInteger 来管理状态；
* 编写定制的 java.util.Queue 队列实现；
* 使用 LockSupport 类提供的线程阻塞和唤醒机制；



### Executor

TODO 后续分析线程池体系



### 扩展

https://tech.meituan.com/2020/04/02/java-pooling-pratice-in-meituan.html