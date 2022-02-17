---
title: JUP JUC (三) ReadWriteLock And BlockingQueue
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211208174730.jpg'
coverImg: /img/20211208174730.jpg
cover: false
toc: true
mathjax: false
date: 2022-02-17 17:14:36
summary: "Java 并发编程: JUC 中的读写锁和阻塞队列"
categories: "Java Concurrent"
keywords: "Java Concurrent"
tags: "Java Concurrent"
---



# 一、读写锁

## 1、简介

`java.util.concurrent.locks.ReadWriteLock`，称为读写锁，该接口定义了一对相关联的锁，一个用于读操作，另一个用于写操作。

- 对于读锁（共享锁）：多个线程可以在没有写操作的时候，同时持有读锁；
- 对于写锁（独占锁）：一旦某个线程持有写锁，就会独占资源，其他线程无法持有资源的读锁或者写锁。

`ReadWriteLock` 的实现类必须确保内存一致性，意味着当某个线程持有读锁时，它可以看到之前其他线程持有写锁后对资源所做的所有更新操作。

## 2、读写锁和互斥锁的比对

在访问共享资源时，读写锁的并发性要比互斥锁高，这是因为在同一时间它只允许一个写线程对共享资源进行修改，当没有线程要修改资源时，它允许多个线程同时读取共享资源；

当然在实际中我们要考虑到数据读取或被修改的频率，操作持续的时间以及对数据的争用，即同一时间尝试读取或者写入的线程数；

- 比如说，某个集合在创建的时候填充了数据，此后大部分时间都是读取该集合，很少去修改，此时使用读写锁是很合适的；
- 但是当写操作变多，数据大部分时间将被锁定，此时并发性能会降低；
- 如果读操作的时间很短，此时使用读写锁付出的成本就不值得了；
- 所以说必须结合实际情况看看能否使用读写锁。



## 3、读写锁执行策略

`ReadWriteLock` 接口只定义了两个方法：

```java
public interface ReadWriteLock {
    /**
     * Returns the lock used for reading.
     *
     * @return the lock used for reading
     */
    Lock readLock();

    /**
     * Returns the lock used for writing.
     *
     * @return the lock used for writing
     */
    Lock writeLock();
}
```

但是它的实现类需要做出许多策略决策，这些策略会影响到读写锁的性能，比如下面这些：

- 某个线程此时持有写锁，同时又很多读取线程和写入线程在等待，当该线程释放写锁时，通常会授予某个等待写入的线程，因为读取线程耗费的时间一般大于写入线程；
- 某个线程此时持有读锁，同时另一个写入线程正在等待，还有其他读取线程想要申请读锁，这就要考虑是否要授予读锁了：
  - 如果授予读锁可能会延迟很久写入线程才可以拿到锁；
  - 如果授予写锁，有可能影响并发性能。
- 考虑锁是否是可重入的：
  - 写入线程是否可以重新获得写锁？
  - 持有写锁的线程是否可以获得读锁？
  - 读锁本身是可重入的吗？
- 写锁是否可以不管其他的等待写入的线程直接降级为读锁？读锁是否可以优先于其他正在等待的读写线程，直接升级为写锁？

这些问题都需要考虑。



## 4、ReentrantReadWriteLock

`java.util.concurrent.locks.ReentrantReadWriteLock` 是 `ReadWriteLock` 接口的实现类，它具有以下几个特性：

- **Acquisition order**：获得顺序
  - 该实现类同时支持公平锁和不公平锁
  - 默认是不公平模式，这就意味着多条线程在竞争锁时，它们的获取锁的顺序会受到可重入性约束（`reentrancy constraints`），可能会无限期的延迟某些读写线程，但是在性能上要优于公平锁；
  - 采取公平模式时，线程获得锁的顺序遵循 `approximately arrival-order policy` ，当锁被释放时，要么某个等待时间最长的写入线程获得写锁，要么一组读取线程获得读锁，前提是这组读取线程的等待时间大于所有写入线程的等待时间。
    - 当写锁被持有，或者等待队列中存在一个正在等待写入的线程，此时如果一条线程尝试获取不可重入的公平读锁，它就会被阻塞，直到等待时间最长的写入线程获取写锁最后释放写锁，它才可以获得读锁；当然，如果一个正在等待写入的线程放弃了等待，就从剩下的线程中选取一组等待读取的线程作为等待时间最长的，在写锁释放后，授予这一组线程读锁。
    - 当某个线程尝试获取不可重入的公平写锁时就会阻塞，除非读锁和写锁都被释放了（意味着没有等待线程）
  - 最后注意两个方法：`ReentrantReadWriteLock.ReadLock.tryLock()` 和 `ReentrantReadWriteLock.WriteLock.tryLock()` 不遵循公平模式，只要调用这两个方法，且锁是可以获取的，就立即授予相应的锁。
- `Reentrancy`：可重入性
  - 和 `ReentrantLock` 一样，读写锁允许读取线程和写入线程重新获取读写锁。但是对于某些不可重入的读取线程，只有所有的写入线程获取锁并释放锁之后，它们才可以获取读锁。
  - 此外，写锁可以获得读锁，但是读锁不可以获得写锁。
- `Lock downgrading`：锁降级
  - 可重入性允许写锁降级为读锁，某个线程获取写锁后，再获取读锁，最后释放写锁，但是不可以从读锁升级为写锁。
- `Interruption of lock acquisition`
  - 读锁和写锁都允许线程在获取锁之后中断。
- `Condition support`
  - 写锁提供了和 `Condition` 类似的行为，类似 `ReentrantLock.newCondition()` 方法；
  - 但是读锁就没有，如果读锁调用 `newCondition` 方法就会抛出异常 `UnsupportedOperationException`
- `Instrumentation`
  - `ReentrantReadWriteLock` 类提供了方法用于判断锁是否被持有或者竞争，设计这些方法的目的是为了检测系统状态，而不是用于线程同步。

### 例 1：写锁降级

下面使用一个简单的例子用于展示更新缓存后从写锁降级为读锁：

```java
class CachedData {
    
    // 模拟缓存数据
    Map<String, String> data;
    
    volatile boolean cacheValid;
    
    final ReentrantReadWriteLock rwl = new ReentrantReadWriteLock();
    
    void processCachedData() {
        rwl.readLock().lock();
        if (!cacheValid) {
            // 在获取写锁之前必须释放读锁，因为无法从读锁升级为写锁
            rwl.readLock().unlock();
            rwl.writeLock().lock();
            try {
                // 这里必须要再次检测锁的状态，为了防止在释放读锁和获取写锁期间有其他线程已经获取了写锁
                if (!cacheValid) {
                    // 模拟处理缓存数据
                    data.put(Thread.currentThread().getName(), "test");
                    // 操作完成，设置缓存状态为可用
                    cacheValid = true;
                }
                // 在释放写锁之前降级为读锁
            } finally {
                // 最终释放写锁
                rwl.writeLock().unlock();
            }
        }
        
        // 执行读取操作
        try {
            System.out.println(data);
        } finally {
            rwl.readLock().unlock();
        }
    }
}
```



### 例 2：使用场景

`ReentrantReadWriteLock` 在某些场景中可以提高使用集合的并发性能。

这种情形一般指的是集合数据量比较大，大部分操作是读取操作，且读操作耗费的性能要超过同步数据耗费的性能。

例如下面这个例子中使用 `TreeMap` 作为集合且允许并发访问：

```java
class RWDictionary {
    
    private final Map<String, Object> m = new TreeMap<>();
    
    private final ReentrantReadWriteLock rwl = new ReentrantReadWriteLock();
    
    private final Lock r = rwl.readLock();
    
    private final Lock w = rwl.writeLock();
    
    public Object get(String key) {
        r.lock();
        try {
            return m.get(key);
        } finally {
            r.unlock();
        }
    }
    
    public String[] allKeys() {
        r.lock();
        try {
            return m.keySet().toArray(new String[0]);
        } finally {
            r.unlock();
        }
    }
    
    public Object put(String key, Object value) {
        w.lock();
        try {
            return m.put(key, value);
        } finally {
            w.unlock();
        }
    }
    
    public void clear() {
        w.lock();
        try {
            m.clear();
        } finally {
            w.unlock();
        }
    }
}
```



# 二、阻塞队列

## 1、概念

`java.util.concurrent.BlockingQueue<E>` 接口定义了阻塞队列必须具备的一些方法，它为队列拓展了一些操作：

- 当某个线程要从队列中获取元素时，如果队列为空则线程阻塞，直到有元素入队；
- 当某个线程要让某个元素入队时，如果队列已满则线程阻塞，直到队列有可用的空间。

```java
public interface BlockingQueue<E> extends Queue<E> {

    boolean add(E e);

    boolean offer(E e);

    void put(E e) throws InterruptedException;

    boolean offer(E e, long timeout, TimeUnit unit)
        throws InterruptedException;

    E take() throws InterruptedException;

    E poll(long timeout, TimeUnit unit)
        throws InterruptedException;

    int remainingCapacity();

    boolean remove(Object o);

    public boolean contains(Object o);

    int drainTo(Collection<? super E> c);

    int drainTo(Collection<? super E> c, int maxElements);
}
```



## 2、四组 API

`BlockingQueue` 中定义的方法有四种形式，可以用于不同的场景中，主要是为了处理那些不能立即执行，但是将来会执行的操作：

- 第一种方法会抛出异常；
- 第二种会返回特定的值（null 或者 false，取绝于不同的操作）；
- 第三种会阻塞当前线程，直到完成操作；
- 第四种会阻塞当前线程一段时间，超时就会放弃。

方法如下表：

| 操作     | 抛异常      | 返回值     | 阻塞     | 超时退出               |
| -------- | ----------- | ---------- | -------- | ---------------------- |
| 插入元素 | `add(e)`    | `offer(e)` | `put(e)` | `offer(e, time, unit)` |
| 移除元素 | `remove()`  | `poll()`   | `take()` | `poll(time, unit)`     |
| 检索元素 | `element()` | `peek()`   | 不支持   | 不支持                 |

此外阻塞队列不支持插入 null 值，当尝试插入 null 时，插入相关的方法会抛出 `NPE`；

一个阻塞队列的容量可能是有限的，其内部会维持一个变量 `remainingCapacity` 记录队列的剩余可用空间大小，如果没有显式指定队列的容量，默认容量大小是 `Integer.MAX_VALUE`；

`BlockingQueue` 的实现主要用于 **生产者-消费者-队列**，但是由于它也实现了 `Collection` 接口，我们就可以通过 `remove(e)` 方法移除队列中的任何一个元素，但是有时候这些操作不一定高效，要根据情况使用，比如说消息队列中有一个消息被取消了，这个时候我们可以从队列中移除该消息；

`BlockingQueue` 是线程安全的，相关的方法内部都使用了内部锁或者其他并发控制手段，但是当涉及到大量元素的操作时就需要注意，比如说：`addAll`、`containsAll`、`retainAll` 和 `removeAll` 不一定是原子性的，除非 `BlockingQueue` 的某些实现类中做了相关声明。在使用 `addAll(e)` 添加一个元素极有可能会失败（抛出异常）；

从本质上讲阻塞队列不支持类似 `close` 或 `shutdown` 等操作来表明队列不可以继续添加元素了，这些需求往往需要结合实际情况。比如说，对于生产者而言，有一种常用的策略就是在队列的末尾插入一种特殊的元素，该元素对于消费者而言具有特殊意义。

## 3、例子

### 例：生产者消费者问题

需要注意的是 `BlockingQueue` 可以被多个生产者和消费者使用，此时是安全的。

```java
public class BQ_Demo01 {
    public static void main(String[] args) {
        BlockingQueue<String> queue = new LinkedBlockingQueue<>(10);

        Producer p1 = new Producer(queue);
        Producer p2 = new Producer(queue);
        Consumer c1 = new Consumer(queue);
        Consumer c2 = new Consumer(queue);

        new Thread(p1, "P1").start();
        new Thread(p2, "P2").start();
        new Thread(c1, "C1").start();
        new Thread(c2, "C2").start();
    }
}

class Producer implements Runnable {
    
    private final BlockingQueue<String> queue;

    public Producer(BlockingQueue<String> queue) {
        this.queue = queue;
    }

    @Override
    public void run() {
        try {
            while (true) {
                System.out.println("Producer " + Thread.currentThread().getName() +" 生产了一件产品 ...");
                queue.put(UUID.randomUUID().toString());
            }
        } catch (InterruptedException e) {
            // handle ...
        }
    }
}

class Consumer implements Runnable {
    
    private final BlockingQueue<String> queue;

    public Consumer(BlockingQueue<String> queue) {
        this.queue = queue;
    }

    @Override
    public void run() {
        try {
            while (true) {
                queue.take();
                System.out.println("Consumer " + Thread.currentThread().getName() + " 消费了一件产品 ...");
            }
        } catch (InterruptedException e) {
            // handle ...
        }
    }
}
```

和其他并发集合一样，`BlockingQueue` 中的操作也是遵循 `happens-before` 规则。



## 4、SynchronousQueue

对于一个阻塞队列而言，一个线程执行插入操作就对应着另一个线程执行移除操作，反之亦然，这是因为普通的阻塞队列是有容量的，我们没有显式指定容量时，默认容量是 `Integer.MAX_VALUE`。

而同步队列（`synchronous queue`）不同，它没有容量限制，还有几个特点：

- 同步队列无法查看其队首元素，而只能在移除队首元素时获得具体的对象；
- 除非其他线程试图删除某个元素，否则无法插入该元素；
- 不能迭代同步队列；
- 用于插入元素的所有线程需要进行排队，第一个插入线程插入的元素就是同步队列的头；如果没有这样的插入线程队列，那么就无法移除同步队列的元素，`poll()` 方法也会返回 null；
- 从集合（`Collection`）的角度上看，同步队列可以看作是一个空的集合，因此不能使用类似 `contains` 之类的方法去检索元素；
- 同步队列不允许 null 值；
- 同步队列支持公平和非公平锁，默认是非公平的。

同步队列看起来有些难以理解，它没有具体的容量，我们也不清楚同步队列中到底有什么元素，从文档中我们只能看出来 <mark>插入线程向同步队列插入的第一个元素和移除线程要移除的第一个元素是一致的，两个线程中的对象是同步的</mark>，因此可以用于在两个线程之间通过某个对象传递信息。

看下面这个例子：

```java
public class BQ_SQ_Demo02 {
    public static void main(String[] args) {
        SynchronousQueue<String> synchronousQueue = new SynchronousQueue<>();

        new Thread(() -> {
            try {
                System.out.println(Thread.currentThread().getName() + " put 1");
                synchronousQueue.put("1");
                System.out.println(Thread.currentThread().getName() + " put 2");
                synchronousQueue.put("2");
                System.out.println(Thread.currentThread().getName() + " put 3");
                synchronousQueue.put("3");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }, "T1").start();
        
        new Thread(() -> {
            try {
                TimeUnit.SECONDS.sleep(1);
                System.out.println(Thread.currentThread().getName() + " get " + synchronousQueue.take());
                TimeUnit.SECONDS.sleep(1);
                System.out.println(Thread.currentThread().getName() + " get " + synchronousQueue.take());
                TimeUnit.SECONDS.sleep(1);
                System.out.println(Thread.currentThread().getName() + " get " + synchronousQueue.take());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }, "T2").start();
    }
}
```

上面的代码中，我们假设有一个插入线程队列和一个移除线程队列，两个队列中线程其实是一一对应的。

> 总结

- `SynchronousQueue` 没有容量，不存储元素；
- 如果向同步队列中插入了一个元素，必须等待另一个线程将该元素移除，之后才可以继续插入元素（注：同步队列没有容量，不能根据这个特性就认为同步队列的容量为 1）；
- 同步队列中的元素可以在两个线程之间传递消息、事件或任务。