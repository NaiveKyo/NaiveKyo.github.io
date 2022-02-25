---
title: JUP JMM (五) Final Memory Semantics And Happens-Before
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211208175035.jpg'
coverImg: /img/20211208175035.jpg
cover: false
toc: true
mathjax: false
date: 2022-02-25 22:00:30
summary: "Java 内存模型: final 内存语义及 happens-before 规则详解"
categories: "Java Concurrent"
keywords: "Java Concurrent"
tags: "Java Concurrent"
---



# 一、final 域的内存语义

与之前分析的 volatile 和锁相比，对 final 域的读和写更像是普通的变量访问。

## 1、final 域的重排序规则

对于 final 域，编译器和处理器要遵守两个重排序规则：

（1）在构造函数内对一个 final 域的写入，与随后把这个构造对象的引用赋值给一个引用变量，这两个操作之间不能重排序；

（2）初次读一个包含 final 域的对象的引用，与随后初次读这个 final 域，这两个操作之间不能重排序。

例如如下代码：

```java
public class FinalExample {
    
    int i;  // 普通变量
    
    final int j;    // final 变量
    
    static FinalExample obj;   

    public FinalExample() {     // 构造函数
        this.i = 1;             // 写普通域
        this.j = 2;             // 写 final 域
    }
    
    public static void writer() {       // 写线程 A 执行
        obj = new FinalExample();
    }
    
    public static void reader() {       // 读线程 B 执行
        FinalExample object = obj;      // 读对象引用
        int a = object.i;               // 读普通域
        int b = object.j;               // 读 final 域
    }
}
```

这里假设线程 A 执行 `writer()` 方法，随后另一个线程 B 执行 `reader()` 方法。



## 2、写 final 域的重排序规则

写 final 域的重排序规则禁止把 final 域的写重排序到构造函数之外。这个规则的实现包含下面两个方面：

（1）JMM 禁止编译器把 final 域的写重排序到构造函数之外；

（2）编译器会在 final 域的写之后，构造函数 return 之前，插入一个 StoreStore 屏障。这个屏障禁止处理器把 final 域的写重排序到构造函数之外。

现在分析 `writer()` 方法。该方法只包含一行代码：`obj = new FinalExample()`。这行代码包含两个步骤：

（1）构造一个 `FinalExample` 类型的对象；

（2）把这个对象的引用赋值给引用变量 `obj`。

假设线程 B 读对象引用与读对象的成员域之间没有重排序，下午是一种可能的时序：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225174542.png)

上图中，写普通域的操作被编译器重排序到了构造函数之外，读线程 B 错误地读取了普通变量 i 初始化之前的值。而写 final 域的操作，被写 final 域的重排序规则 "限定"在了构造函数之内，读线程 B 正确地读取了 final 变量初始化之后的值。

写 final 域的重排序规则可以确保：在对象引用为任意线程可见之前，对象的 final 域已经被正确初始化了，而普通域不具有这个保障。

以上图为例，在读线程 B "看到" 对象引用 obj 时，很可能 obj 对象还没有构造完成（对普通域 i 的写操作被重排序到构造函数之外，此时初始值 1 还没有写入普通域 i）。



## 3、读 final 域的重排序规则

读 final 域的重排序规则是，在一个线程中，初次读对象引用与初次读该对象包含的 final 域，JMM 禁止处理器重排序这两个操作（注意：这个规则仅针对处理器）。编译器会在读 final 域操作的前面插入一个 LoadLoad 屏障。

初次读对象引用与初次读该对象包含的 final 域，这两个操作之间存在间接依赖关系。由于编译器遵守间接依赖关系，因此编译器不会重排序这两个操作。大多数处理器也会遵守间接依赖，也不会重排序这两个操作。但有少数处理器允许对存在间接依赖关系的操作做重排序（比如 alpha 处理器），这个规则就是专门用来针对这种处理器的。

`reader()` 方法包含三个操作：

- 初次读引用变量 obj；
- 初次读引用变量 obj 指向对象的普通域 j；
- 初次读引用变量 obj 指向对象的 final 域 i。

现在假设线程 A 没有发生任何重排序，同时程序在不遵守间接依赖的处理器上执行，下图展示了一种可能的时序：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225175523.png)

上图中，该对象的普通域的操作被处理器重排序到读对象引用之前。读普通域时，该域还没有被写线程 A 写入，这是一个错误的读取操作。而读 final 域的重排序规则会把读对象 final 域的操作 "限定" 在读对象引用之后，此时该 final 域已经被 A 线程初始化过了，这是一个正确的读取操作。

读 final 域的重排序规则可以保证：在读一个对象的 final 域前，一定会先读包含这个 final 域的对象的引用。

在上面的程序中，如果该引用不为 null，那么引用对象的 final 域一定已经被线程 A 初始化过了。



## 4、final 域为引用类型

前面的 final 是基础数据类型，如果 final 域是引用类型，将会有什么效果？

```java
public class FinalReferenceExample {
    
    final int[] intArray;                   // final 是引用类型
    
    static FinalReferenceExample obj;       
                
    public FinalReferenceExample() {        // 构造函数
        intArray = new int[1];              // 1
        intArray[0] = 1;                    // 2
    }
    
    public static void writerOne() {        // 写线程 A 执行
        obj = new FinalReferenceExample();  // 3
    }
    
    public static void writerTwo() {        // 写线程 B 执行
        obj.intArray[0] = 2;                // 4
    }
    
    public static void reader() {           // 读线程 C 执行
        if (obj != null) {                  // 5
            int temp1 = obj.intArray[0];    // 6
        }
    }
}

```

本例中 final 为一个引用类型，它引用一个 int 型的数组对象。对于引用类型，写 final 域的重排序规则对编译器和处理器增加了如下约束：在构造函数内对一个 final 引用的对象的成员域的写入，与随后在构造函数外把这个被构造对象的引用赋值给一个引用变量，这两个操作之间不能重排序。

对上面的例子程序，假设首先线程 A 执行 `writerOne()` 方法，执行完后线程 B 执行 `writerTwo()` 方法，执行完后线程 C 执行 `reader()` 方法。下图是一种可能的线程执行时序：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225205813.png)

1 是对 final 域的写入，2 是对这个 final 域引用的对象的成员域的写入，3 是把被构造的对象的引用赋值给某个引用变量。这里除了前面提到的 1 和 3 不能重排序外， 2 和 3 也不能重排序。

JMM 可以确保线程 C 至少可以看到线程 A 在构造函数中对 final 引用对象的成员域的吸入。即 C 至少能看到数组下标 0 的值为 1。而写线程 B 对数组元素的写入，读线程 C 可能看得到，也可能看不到。JMM 不保证线程 B 的写入对读线程 C 可见，因为写线程 B 和读线程 C 之间存在数据竞争，此时的执行结果不可预知。

如果想要确保线程 C 可以看到写线程 B 对数组元素的写入，写线程 B 和读线程 C 之间需要使用同步原语（lock 或 volatile）来确保内存可见性。

## 5、为什么 final 引用不能从构造函数内 "逸出"

之前提到，写 final 域的重排序规则可以确保：在引用变量为任意线程可见之前，该引用变量指向的对象的 final 域已经在构造函数中正确初始化过了。

其实，要得到这个效果，还需要一个保证：在构造函数内部，不能让这个被构造对象的引用为其他线程所见，也就是对应用不能再构造函数中 "逸出"。

代码：

```java
public class FinalReferenceEscapeExample {
    
    final int i;
    
    static FinalReferenceEscapeExample obj;

    public FinalReferenceEscapeExample() {
        i = 1;             // 1 写 final 域
        obj = this;		   // 2 this 引用在此 "逸出"
    }
    
    public static void writer() {
        new FinalReferenceEscapeExample();
    }
    
    public static void reader() {
        if (obj != null) {          // 3
            int temp = obj.i;       // 4
        }
    }
}
```

假设一个线程 A 执行 `writer()` 方法，另一个线程 B 执行 `reader()` 方法。这里的操作 2 使得对象还未完成构造之前就为线程 B 可见。即使这里的操作 2 是构造函数的最后一步，且在程序中操作 2 排在操作 1 后面，执行 `read()` 方法的线程任然可能无法看到 final 域被初始化后的值，因为这里的操作 1 和操作 2 之间可能被重排序。实际的执行时序可能如下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225210904.png)

从上图可知：在构造函数返回之前，被构造对象的引用不能为其他线程所见，因为此时的 final 域可能还没有被初始化。在构造函数返回后，任意线程都将保证能看到 final 域正确初始化后的值。



## 6、final 语义在处理器中的实现

以 X86 处理器为例，说明 final 语义在处理器中的具体实现。

之前提到，写 final 域的重排序规则会要求编译器在 final 域的写之后，构造函数 return 之前插入一个 StoreStore 屏障。读 final 域的重排序规则要求编译器在读 final 域的操作前面插入一个 LoadLoad 屏障。

由于 X86 处理器不会对 写-写操作做重排序，所以在 X86 处理器中，写 final 域需要的 StoreStore 屏障会被省略掉。同样，由于 X86 处理器不会对存在间接依赖关系的操作做重排序，所以在 X86 处理器中，读 final 域需要的 LoadLoad 屏障也会被省略掉。也就是说，在 X86 处理器中，final 域的读/写不会插入任何内存屏障！



## 7、JSR-133 为什么要增强 final 的语义

在旧的 Java 内存模型中，一个最严重的缺陷就是线程可能看到 final 域的值会改变。比如，一个线程当前看到一个整型 final 域的值为 0（还未初始化之前的默认值），过一段时间之后这个线程再去读这个 final 域的值，却发现值变为 1（被某个线程初始化之后的值）。最常见的例子就是在旧的 Java 内存模型中，String 的值可能会被改变。

为了修补这个漏洞，JSR-133 专家组增强了 final 的语义。通过为 final 域增加写和读重排序规则，可以为 Java 程序员提供初始化安全保证：只要对象是正确构造的（被构造对象的引用在构造函数中没有 "逸出"），那么不需要使用同步（指 lock 和 volatile）就可以保证任意线程都能看到这个 final 域在构造函数中被初始化之后的指。



# 二、happens-before

happens-before 是 JMM 最核心的概念。对于 Java 程序员来说哦，理解 happens-before 是理解 JMM 的关键。

## 1、JMM 的设计

从 JMM 设计者的角度，在设计 JMM 时，需要考虑两个关键因素。

（1）程序员对内存模型的使用。程序员希望内存模型易于理解、易于编程。程序员希望基于一个强内存模型来编写代码；

（2）编译器和处理器对内存模型的实现。编译器和处理器希望内存模型对它们的束缚越少越好，这样它们可以做尽可能多的优化来提高性能。编译器和处理器希望实现一个弱内存模型。

由于这两个因素互相矛盾，所以 JSR-133 专家组在设计 JMM 时的核心目标就是找到一个好的平衡点：一方面，要为程序员提供足够强的内存可见性保证；另一方面，对编译器和处理器的限制要尽可能地放松。

下面看看 JSR-133 如何实现这一目标的：

```java
double pi = 3.14;			// A
double r = 1.0;				// B
double area = pi * r * r;	// C
```

计算圆的面积代码存在 3 个 happens-before 关系：

（1）A happens-before B

（2）B happens-before C

（3）A happens-before C

2 和 3 是必须的，1 是不必要的。因此，JMM 把 happens-before 要求禁止的重排序分为了下面两类：

（1）会改变程序执行结果的重排序；

（2）不会改变程序执行结果的重排序。

JMM 对这两种不同性质的重排序，采取了不同的策略：

（1）对于会改变程序执行结果的重排序，JMM 要求编译器和处理器必须禁止这种重排序；

（2）对于不会改变程序执行结果的重排序，JMM 对编译器和处理器不做要求（JMM 允许这种重排序）。

下面是 JMM 的设计示意图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225212642.png)

从上图可以看出两点：

（1）JMM 向程序员提供的 happens-before 规则能满足程序员的需求。JMM 的 happens-before 规则不但简单易懂，而且也向程序员提供了足够强的内存可见性保证（有些内存可见性保证其实并不一定真实存在，比如上面的 A happens-before B）；

（2）JMM 对编译器和处理器的束缚尽可能的少。从上面的分析可以看出，JMM 其实是在遵循一个基本原则：只要不改变程序的执行结果（指的是单线程程序和正确同步的多线程程序），编译器和处理器怎么优化都可以。

例如，如果编译器经过细致的分析后，认定一个锁只会被单个线程访问，那么这个锁可以被消除。再如，如果编译器经过细致的分析后，认定一个 volatile 变量只会被单个线程访问，那么编译器可以把这个 volatile 变量当作一个普通变量来对待。这些优化既不会改变程序的执行结果，又能提高程序的执行效率。



## 2、happens-before 的定义

happens-before 的概念最初由 Leslie Lamport 在其一篇影响深远的论文 `《Time, Clocks and the Ordering of Events in a Distributed System》` 中提出。Leslie Lamport 使用 happens-before 来定义分布式系统中事件之间的偏序关系（partial ordering）。Leslie Lamport 在这篇论文中给出了一个分布式算法，该算法可以将该偏序关系扩展为某种全序关系。

JSR-133 使用 happens-before 的概念来指定两个操作之间的执行顺序。由于这两个操作可以在同一个线程内，也可以在不同线程之间。因此，JMM 可以通过 happens-before 关系向程序员提供跨线程的内存可见性保证（如果 A 线程的写操作 a 与 B 线程的读操作 b 直接存在 happens-before 关系，尽管 a 操作和 b 操作在不同的线程中执行，但 JMM 向程序员保证 a 操作将对 b 操作可见）。

`《JSR-133: Java Memory Model and Thread Specification》` 中对 happens-before 关系的定义如下：

（1）如果一个操作 happens-before 另一个操作，那么第一个操作的执行结果将对第二个操作可见，而且第一个操作的执行顺序排在第二个操作之前；

（2）两个操作之间存在 happens-before 关系，并不意味着 Java 平台的具体实现必须要按照 happens-before 关系指定的顺序来执行。如果重排序之后的执行结果，与按 happens-before 关系来执行的结果一致，那么这种重排序并不非法（也就是说，JMM 允许这种重排序）。

<mark>上面的（1）是 JMM 对程序员的承诺。</mark>从程序员的角度来说，可以这样理解 happens-before 关系：如果 A happens-before B，那么 Java 内存模型将向程序员保证 —— A 操作的结果将对 B 可见，且 A 的执行顺序排在 B 之前。注意，这只是 Java 内存模型向程序员做出的保证！

<mark>上面的（2）是 JMM 对编译器和处理器重排序的约束规则。</mark>正如前面所言，JMM 其实是在遵循一个基本原则：只要不改变程序的执行结果（指的是单线程程序和正确同步的多线程程序），编译器和处理器怎么优化都可以。JMM 这么做的原因是：程序员对于这两个操作是否真的被重排序并不关心，程序员关心的是程序执行时的语义不能被改变（即执行结果不能被改变）。因此，happens-before 关系本质上和 as-if-serial 语义是一回事。

- as-if-serial 语义保证单线程内程序的执行结果不会被改变，happens-before 关系保证正确同步的多线程程序的执行结果不被改变；
- as-if-serial 语义给编写单线程程序的程序员创造了一个幻境：单线程程序是按程序的顺序来执行的。happens-before 关系给编写正确同步的多线程程序的程序员创造了一个幻境：正确同步的多线程程序是按 happens-before 指定的顺序来执行的。

as-if-serial 和 happens-before 这么做的目的，都是为了在不改变程序执行结果的前提下，尽可能地提高程序执行的并行度。



## 3、happens-before 规则

`《JSR-133: Java Memory Model and Thread Specification》` 定义了如下 happens-before 规则：

（1）程序顺序规则：一个线程中的每个操作，happens-before 于该线程中的任意后续操作；

（2）监视器锁规则：对一个锁的释放，happens-before 于随后对这个锁的加锁；

（3）volatile 变量规则：对一个 volatile 域的写，happens-before 于任意后续对这个 volatile 域的读；

（4）传递性：如果 A happens-before B，B happens-before C，那么 A happens-before C；

（5）`start()` 规则：如果线程 A 执行操作 `ThreadB.start()`（启动线程 B），那么 A 线程的 ThreadB.start() 操作 happens-before 于线程 B 中的任意操作；

（6）`join()` 规则：如果线程 A 执行操作 `ThreadB.join()` 并成功返回，那么线程 B 中的任意操作 happens-before 于线程 A 从`ThreadB.join()` 操作成功返回。

### （1）简单总结

这里以 1、3、4 为例说明，下图是由 volatile 写-读建立的 happens-before 关系：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225214815.png)

做以下分析：

（1）1 happens-before 2、3 happens-before 4 由程序顺序规则产生。由于编译器和处理器都要遵守 as-if-serial 语义。也就是说，as-if-serial 语义保证了程序顺序规则。因此，可以把程序顺序规则看作是对 as-if-serial 语义的 "封装"；

（2）2 happens-before 3 是由 volatile 规则产生。对一个 volatile 变量的读，总是能看到（任意线程）之前对这个 volatile 变量最后的写入；

（3）1 happens-before 4 是由传递性规则产生的。这里的传递性是由 volatile 的内存屏障插入策略和 volatile 的编译器重排序规则共同来保证的。



### （2）start（）规则

下面看看 `start()` 规则。假设线程 A 在执行的过程中，通过执行 `ThreadB.start()` 来启动线程 B；同时，假设线程 A 在执行 `ThreadB.start()` 之前修改了一些共享变量，线程 B 在开始执行后会读这些共享变量。

下图是该程序对应的 happens-before 关系：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225215319.png)

从上图可知，1 happens-before 2 和 3 happens-before 4 由程序顺序规则产生。2 happens-before 4 由 `start()` 规则产生。根据传递性，将有 1 happens-before 4。这意味着，线程 A 在执行 `ThreadB.start()` 之前对共享变量所作的修改，接下来在线程 B 开始执行后都将确保对线程 B 可见。



### （3）join（）规则

下面看看 `join()` 规则。假设线程 A 在执行的过程中，通过执行 `ThreadB.join()` 来等待线程 B 终止；同时，假设线程 B 在终止之前修改了一些共享变量，线程 A 从 `ThreadB.join()` 返回后会读这些共享变量。

下图为该程序对应的 happens-before 关系图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225215739.png)

从上图可知，2 happens-before 4 由 `join()` 规则产生；4 happens-before 5 由程序顺序规则产生。根据传递性规则，将有 2 happens-before 5。这意味着，线程 A 执行操作 `ThreadB.join()` 并成功返回后，线程 B 中的任意操作都将对线程 A 可见。