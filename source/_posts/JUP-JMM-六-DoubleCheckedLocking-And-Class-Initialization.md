---
title: JUP JMM (六) DoubleCheckedLocking And Class Initialization
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211227210841.jpg'
coverImg: /img/20211227210841.jpg
cover: false
toc: true
mathjax: false
date: 2022-03-03 22:32:50
summary: "Java 内存模型: 双重检查锁定和类初始化实现延迟初始化"
categories: "Java Concurrent"
keywords: "Java Concurrent"
tags: "Java Concurrent"
---



# 双重检查锁定与延迟初始化

Java 多线程中，有时候需要采用延迟初始化来降低初始化类和创建对象的开销。

**双重检查锁定** 是常见的延迟初始化技术，但它是一个错误的用法。

## 1、双重检查锁定的由来

Java 程序中，有些对象的创建开销比较大，这时需要推迟这些高开销对象的初始化操作，并且只有在使用该对象时才进行初始化。

比如下面的非线程安全的初始化代码：

```java
public class UnsafeLazyInitialization {
    
    private static Instance instance;
    
    public static Instance getInstance() {
        if (instance == null) {         // 1. A线程执行
            instance = new Instance();  // 2. B线程执行
        }
        return instance;    
    }
}
```

假设线程 A 执行 1，同时线程 B 执行 2，此时线程 A 可能会看到 instance 引用的对象还没有完成初始化（因为存在重排序）。

下面对 `getInstance` 方法做同步处理：

```java
public class UnsafeLazyInitialization {
    
    private static Instance instance;
    
    public static synchronized Instance getInstance() {
        if (instance == null) {      
            instance = new Instance();
        }
        return instance;    
    }
}
```

但是这也会带来性能开销的问题。如果 `getInstance` 方法被多个线程频繁的调用，将会导致程序执行性能的下降。反之，如果 `getInstance` 不被多个线程频繁调用，那么这个延迟初始化的方案将能提供令人满意的性能。

在早期的 JVM 中，`synchronized` （甚至是无竞争的 `synchronized`）存在巨大的性能开销。因此，人们想出了另一种方式：**双重检查锁定（Double-Checked Locking）**，利用它来降低同步的开销，代码如下：

```java
public class DoubleCheckedLocking {
 
    private static Instance instance;
    
    private static Instance instance() {                    // 1
        if (instance == null) {                             // 2 第一次检查
            synchronized (DoubleCheckedLocking.class) {     // 3 加锁
                if (instance == null)                       // 4 第二次检查
                    instance = new Instance();              // 5 问题的根源出现在这里
            }                                               // 6
        }                                                   // 7
        return instance;                                    // 8
    }
}
```

如果第一次检查 instance 不为 null，就可以不需要执行下面的加锁和初始化操作，因此，可以大幅度降低 `synchronized` 带来的性能开销。

从表明上看起来，似乎两全其美：

- 多个线程试图在同一时间创建对象时，会通过加锁来保证只有一个线程能创建对象；
- 在对象创建好之后，执行 `getInstance()` 方法将不需要获取锁，直接返回已经创建好的对象。

双重检查锁定看起来很完美，但这是一个错误的优化，在线程执行到第 4 步时，代码读取到 instance 不为 null 时，instance 引用的对象有可能还没有完成初始化。



## 2、双重检查锁定的问题

在前面代码的第 5 步做了这样的处理：`instance = new Instance()`，创建了一个对象，这行代码可以分解为如下的 3 行伪代码：

```c++
memory = allocate();			// 1. 分配对象的内存空间
ctorInstance(memory);			// 2. 初始化对象
instance = memory;				// 3. 设置 instance 指向刚分配的内存地址
```

上面伪代码的 2 和 3 之间可能存在重排序（在某些 JIT 编译器上，这种重排序是真实存在的）。

2 和 3 之间重排序之后的执行时序如下：

```c
memory = allocate();			// 1. 分配对象的内存空间
instance = memory;				// 3. 设置 instance 指向刚分配的内存地址
								// 注意：此时对象还没有完成初始化
ctorInstance(memory);			// 2. 初始化对象
```

在 Java 语言规范中，所有线程在执行 Java 程序时必须要遵守 `intra-thread semantics`。`intra-thread semantics` 保证重排序不会改变单线程内的程序执行结果。

换句话说，`intra-thread semantics` 允许那些在单线程内，不会改变单线程程序执行结果的重排序。

上面 3 行伪代码的 2 和 3 之间虽然被重排序了，但这个重排序并不会违反 `intra-thread semantics`。这个重排序在没有改变单线程程序执行结果的前提下，可以提高程序的执行性能。

> 单线程执行时序

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220303112825.png)

只要 2 排在 4 之前，即使 2 和 3 发生了重排序，也不会违反 `intra-thread semantics`。

> 多线程执行时序

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220303113110.png)

和单线程不一样，多线程环境下，当线程 A 和 线程 B 以上图所示的时序执行时，B 线程将看到一个还没有被初始化的对象。

分析一下，可以看到在线程 B 执行第一次检查时判断通过了，这是因为 instance 已经指向了内存地址，但是当线程 B 初次访问对象时却发生了问题，这是因为此时这个对象还没有被线程 A 完成初始化。

这种情况下 2 和 3 发生了重排序，但是 JMM 的 `intra-thread semantics` 保证了 2 一定会排在 4 前面执行。

找到了问题发生的根源后，我们可以想出两个办法来实现线程安全的延迟初始化：

（1）不允许 2 和 3 重排序；

（2）允许 2 和 3 重排序，但不允许其他线程 "看到" 这个重排序。

下面分别介绍两种解决方法。



## 3、基于 volatile 的解决方案

对前面的代码做一些小小的修改（用 volatile 修饰），代码如下：

```java
public class SafeDoubleCheckedLocking {
    
    private volatile static Instance instance;
    
    public static Instance getInstance() {
        if (instance == null) {
            synchronized (SafeDoubleCheckedLocking.class) {
                if (instance == null)
                    instance = new Instance();
            }
        }
        return instance;
    }
}
```

这个解决方案需要 JDK 5 或更高版本的支持（因为从 JDK 5 开始使用 JSR-133 提出的内存模型规范，这个规范增强了 volatile 的语义）。

当声明对象的引用为 `volatile` 后，前面的 3 行伪代码的 2 和 3 的重排序，在多线程环境中将会被禁止。具体的执行时序如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220303115558.png)

现在上图存在两个规则：

- `intra-thread semantics` 规则使 2 `happens-before` 4；
- `volatile` 内存语义规定 2 `happens-before` 3。

最终禁止了 2 和 3 的重排序，从而保证了线程安全的延迟初始化。



## 4、基于类初始化的解决方案

### （1）解决方案

JVM 在类的初始化阶段（即 Class 被加载后，且被线程使用之前），会执行类的初始化。在执行类的初始化期间，JVM 会去获取一个锁。这个锁可以同步多个线程对同一个类的初始化。

基于这个特性，可以实现另一种线程安全的延迟初始化方案（`Initialization On Demand Holder idiom`）。

代码如下：

```java
public class InstanceFactory {
    
    private static class InstanceHolder {
        public static Instance instance = new Instance();
    }
    
    public static Instance getInstance() {
        return InstanceHolder.instance; // 这里将导致 InstanceHolder 类被初始化。 
    }
}
```

假设两个线程并发执行 `getInstance` 方法，下面是执行的示意图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220303140753.png)

这个方案的实质是：允许 2 和 3 的重排序，但不允许非构造线程（这里指线程 B） "看到" 这个重排序。

### （2）类的初始化

初始化一个类，包括执行这个类的静态初始化和初始化在这个类中声明的静态字段。根据 Java 语言规范，在首次发生下列任意一种情况时，一个类或接口类型 T 将被立即初始化：

（1）T 是一个类，而且一个 T 类型的实例被创建；

（2）T 是一个类，且 T 中声明的一个静态方法被调用；

（3）T 中声明的一个静态字段被赋值；

（4）T 中声明的一个静态字段被使用，而且这个字段不是一个常量字段；

（5）T 是一个顶级类（Top Level Class），而且一个断言语句嵌套在 T 内部被执行；

<mark>顶级类其实就是和文件名一致的类，比如 Foo.java 中声明了一个 Foo 类，那么 Foo 就是 Top Level Class。</mark>

顶级类参见：

https://stackoverflow.com/questions/41714579/what-is-a-top-level-class-in-java

https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html

在 `InstanceFactory` 实例代码中，首次执行 `getInstance()` 方法的线程将会导致 `InstanceHolder` 被初始化，这符合之前提到的条件 4，类的一个静态字段被使用，而且这个字段不是一个常量字段，此时该类将被初始化。

由于 Java 语言是多线程的，多个线程可能在同一时间尝试去初始化同一个类或接口（比如这里多个线程可能会在同一时间调用 `getInstance()` 方法来初始化 `InstanceHolder` 类）。因此，在 Java 中如果涉及到初始化一个类或接口时，必须做细致的同步处理。

Java 语言规范规定，对于每一个类或接口 C，都有一个唯一的初始化锁 `LC` 与之对应。从 `C` 到 `LC` 的映射，由 JVM 的具体实现去自由实现。JVM 会在类初始化期间会获取这个初始化锁，并且每个线程至少获取一次锁来确保这个类已经被初始化过了（事实上，Java 语言规范允许 JVM 的具体实现在这里做一些优化）。

对于类或接口的初始化，Java 语言规范制定了精巧而复杂的类初始化处理过程。Java 初始化一个类或接口的处理过程如下（这里对类初始化处理过程的说明，省略了和本文无关的部分；同时为了更好的说明类初始化过程中的同步处理机制，这里将其分为 5 个阶段。

> 注意：

<mark>下面的五个阶段只是简单的说明，其中类的 state 标记和锁的 condition 都是虚构出来的，Java 语言规范并没有硬性规定一定要使用它们。JVM 的具体实现只需要实现类似功能即可。</mark>

### 4.1、第一阶段

第一阶段：通过在 Class 对象上同步（即获取 Class 对象的初始化锁），来控制类或接口的初始化。这个获取锁的线程会一直等待，直到当前线程能够获取到这个初始化锁。

假设 Class 对象当前还没有被初始化（初始化状态 `state`，此时已经被标记为 `state=noInitialization`，且有两个线程 A 和 B 试图同时初始化这个 Class 对象，如下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220303153258.png)

| 时间 | 线程 A                                                       | 线程 B                                                       |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| t1   | A1：尝试获取 Class  对象的初始化锁。这里假设线程 A 获取到了初始化锁 | B1：尝试获取 Class 对象的初始化锁，由于线程 A 获取到了锁，线程 B 将一直等待获取初始化锁 |
| t2   | A2：线程 A 看到 Class 对象还未被初始化（因为读取到 `state=noInitialization`），线程设置 `state=initializing` |                                                              |
| t3   | A3：线程 A 释放初始化锁                                      |                                                              |



### 4.2、第二阶段

第二阶段：线程 A 执行类的初始化，同时线程 B 在初始化锁对应的 `condition` 上等待。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220303154617.png)

| 时间 | 线程 A                                           | 线程 B                              |
| ---- | ------------------------------------------------ | ----------------------------------- |
| t1   | A1：执行类的静态初始化和初始化类中声明的静态字段 | B1：获取到初始化锁                  |
| t2   |                                                  | B2：读取到 `state = initializing`   |
| t3   |                                                  | B3：释放初始化锁                    |
| t4   |                                                  | B4：在初始化锁的 `condition` 中等待 |

### 4.3、第三阶段

第三阶段：线程 A 设置 `state = initialized`，然后唤醒在 `condition` 中等待的所有线程。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220303155148.png)



### 4.4、第四阶段

第四阶段：线程 B 结束类的初始化处理。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220303174817.png)

| 时间 | 线程 B                            |
| ---- | --------------------------------- |
| t1   | B1：获取初始化锁                  |
| t2   | B2：读取到 `state = initialized`  |
| t3   | B3：释放初始化锁                  |
| t4   | B4：线程 B 的类初始化处理过程完成 |

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220303174951.png)

线程 A 在第二阶段的 A1 执行类的初始化，并在第三阶段的 A4 释放初始化锁；

线程 B 在第四阶段的 B1 获取到同一个初始化锁，并在第四阶段的 B4 之后才开始访问这个类。

根据 Java 内存模型规范的锁规则，这里将存在如下的 `happens-before` 关系：

- 线程 A 执行类的初始化时的写入操作（执行类的静态初始化和初始化中声明的静态字段），线程 B 一定能看到。



### 4.5、第五阶段

第五阶段：线程 C 执行类的初始化处理

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220303221028.png)

| 时间 | 线程 C                            |
| ---- | --------------------------------- |
| t1   | C1：获取到初始化锁                |
| t2   | C2：读取到 `state = initialized`  |
| t3   | C3：释放初始化锁                  |
| t4   | C4：线程 C 的类初始化处理过程完成 |

在第三阶段以后，类已经完成了初始化。因此线程 C 在第五阶段的类初始化处理过程相对简单一些（前面的线程 A 和 B 的类初始化处理过程都经历了两次锁获取-锁释放，而线程 C 的类初始化处理只需要经历一次锁获取-锁释放。

线程 A 在第二阶段的 A1 执行类的初始化，并在第三阶段的 A4 释放锁；

线程 C 在第五阶段的 C1 获取同一个锁，并在第五阶段的 C4 之后才开始访问这个类。根据 JMM 的锁规范，这里存在如下的 `happens-before` 关系：

- 线程 A 执行类的初始化时的写入操作，线程 C 一定能看到。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220303222719.png)



## 5、总结

通过对比基于 `volatile` 的双重检查锁定的方案和基于类初始化的方案，我们会发现基于类初始化的方案的实现代码更加简洁。

但基于 `volatile` 的双重检查锁定的方案有一个额外的优势：除了可以对静态字段实现延迟初始化外，还可以实现对实例字段实现延迟初始化。

字段延迟初始化降低了初始化类或创建实例的开销，但增加了访问被延迟到初始化的字段的开销。在大多数时候，正常的初始化要优于延迟初始化。

- 如果确实需要对实例字段使用线程安全的延迟初始化，可以使用 `volatile` 的延迟初始化方案；
- 如果确实需要对静态字段使用线程安全的延迟初始化，可以使用类初始化方案。