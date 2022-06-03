---
title: Java Core Technology Review (一)
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221751.jpg'
coverImg: /img/20220225221751.jpg
cover: false
toc: true
mathjax: false
date: 2022-06-03 09:40:12
summary: "Java 核心技术回顾（一）Java 平台、异常、引用"
categories: "Java"
keywords: "Java"
tags: "Java"
---

# 前言

从五个方面来分析 Java：

- Java 基础：基本特性和机制；
- Java 并发：并发编程、Java 虚拟机；
- Java 框架：数据库框架、Spring 生态、分布式框架等等；
- Java 安全：常见的安全问题和处理方法；
- Java 性能：掌握工具、方法论。

# Java 基础

# 1、谈谈对 Java 平台的理解

## Java 语言的显著特性

Java 本身是一种面向对象的语言，最显著的特性表现在两个方面：

- "Write once, run anywhere"：也就是强大的跨平台能力；
- GC（Garbage Collection）垃圾回收：Java 通过垃圾回收器（Garbage Collector）回收内存，大部分情况下，程序员不需要自己操心内存的分配和回收。

> JDK 和 JRE

JRE 就是 Java 运行环境，包含了 JVM 和 Java 类库，以及一些模块等等；

JDK 是 Java 开发工具集，可以看作是 JRE 的一个超集，提供了更多工具，比如编译器、各种诊断工具等等。

> Java 是解释和编译共存的语言

- Java 代码被编译器 javac 编译成字节码，在运行时，通过 JVM 内嵌的解释器将字节码转换成为最终的机器码；
- 我们大多数情况下使用的 JVM 是 Oracle JDK 提供的 Hotspot JVM，常见的 JVM 都提供了 JIT（Just-In-Time）编译器，也就是通常说的动态编译器，JIT 能够在运行时将热点代码编译成机器码，这种情况部分热点代码就属于编译执行，而不是解释执行。

下面是一个相对宽泛的蓝图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220601155258.png)

## Java 解释执行和编译执行

从所周知，我们通常将 Java 分为编译器和运行时。

这里的 Java 编译和 C/C++ 有着不同的含义，Javac 的编译，指将 .java 源代码文件进行编译生成 .class 文件（字节码文件），而不是可以直接执行的机器码。Java 通过字节码和 Java 虚拟机这种抽象，屏蔽了操作系统和硬件的细节，这也是实现 "一次编译，到处执行" 的基础。

在运行时，JVM 会通过类加载器（Class-Loader）加载字节码，解释或者编译执行。

- 主流 Java 版本中，如 JDK 8 实际是解释和编译混合的一种模式，即所谓的混合模式（-Xmixed）。通常运行在 server 模式的 JVM，会进行上万次调用和收集足够的信息进行高效的编译，client 模式这个门限是 1500 次。
- Oracle Hotspot JVM 内置了两种不同的 JIT compiler，C1 对应 client 模式，适用于对于启动速度敏感的应用，比如普通的 Java 桌面应用；C2 对应 server 模式，它的优化是为了长时间运行的服务器端应用设计的。默认采用所谓的分层编译（TieredCompilation）。

Java 在启动时，可以指定不同的参数对运行模式进行选择。比如指定 `-Xint`，告诉 JVM 只进行解释执行，不对代码进行编译，这种模式抛弃了 JIT 可能带来的性能优势。毕竟解释器（Interpreter）是逐条读入，逐条解释的。与其对应的，还有一个 `-Xcomp` 参数，告诉 JVM 关闭解释器，不要进行解释执行，或者叫做最大优化级别。（注意并不意味着 -Xcomp 模式比前者要高效，它会导致 JVM 启动变慢，同时对有些 JIT 编译器优化方式造成影响。）

除了我们日常常见的 Java 编译模式，还有一种新的编译方式，就是所谓的 AOT（Ahead-of-Time Compilation）（提前编译），直接将字节码编码为机器码，这样就避免了 JIT 预热等各方面的开销。

Oracle JDK 支持分层编译和 AOT 协作使用，可以参考 http://openjdk.java.net/jeps/295， AOT 也不仅仅是只有这一种方式，业界早就有第三方工具（如 GCJ、Excelsior JET）提供了相关功能。



# 2、Exception 和 Error 的区别

错误是程序无法避免的，作为一个程序员，我们能做到的就是正确处理好意外的情况，才可以保证程序的可靠性。

Java 在设计之初就提供了相对完善的异常处理机制。

## 对比 Exception 和 Error

Exception 和 Error 都继承自 Throwable 类，在 Java 中只有 Throwable 类型的实例可以被抛出（throw）或者捕获（catch），它是异常处理机制的基本组成类型。

- Exception：程序正常运行中，可以预料的意外情况，可能并且应该被捕获，进行相应处理；
  - Exception 又分为可检查（checked）异常和不可检查（unchecked）异常：
    - 可检查：编译期异常，在编码时就应该显式地做捕获处理；
    - 不可检查：运行时异常，通常是程序的逻辑错误导致的异常，可以根据需要在编码时显式地捕获处理。
- Error：在正常情况下，不大可能出现的情况（系统错误），绝大部分的 Error 都会导致程序（比如 JVM 自身）处于非正常的、不可恢复的状态。常见如 `OutOfMemoryError`。

在日常编程中，可以从两个方面来掌握：

（1）理解 Throwable、Exception、Error 的设计和分类。掌握那些应用最为广泛的子类，以及如何自定义异常等等

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220601193351.png)

有些子类型，可以了解一下，比如 `NoClassDefFoundError` 和 `ClassNotFoundException` 的区别：

- 前者是 Error 错误，是 JVM 或者类加载器尝试加载（可以是正常的方法调用，也可以是 new 对象）类的时候找不到类的定义。要查找的类在编译时期是存在的，但是运行的时候却找不到了，可能是在打包时漏掉了部分类，或者 jar 包出现损坏或者被篡改；
- 后者是 Exception 运行时异常，在使用反射动态加载指定类的时候在类路径中找不到该类，此时会在运行时抛出异常，常见原因就是类名写错了；
- Java 在处理错误和异常是两种方式，我们可以从异常中恢复程序，但是不应该尝试从错误中恢复程序。

（2）理解 Java 语言中操作 Throwable 的元素和实践。基本语法是必须的，如 `try-catch-finally` 块、throw、throws 关键字等等。同时，也要懂得如何处理典型场景。

异常处理代码比较繁琐，我们需要写很多千篇一律的捕获代码，或者在 finally 块中做一些回收资源的工作。随着 Java 语言的发展，也出现了一些比较便利的特性，比如 `try-with-resources` 和 `multiple catch`，如下面的代码，在编译时期，会自动生成相应的处理逻辑，比如，自动 close 那些扩展了 `AutoCloseable` 或者 `Closeable` 的对象：

```java
try (BufferedReader br = new BufferedReader(...);
    BufferedWriter writer = new BufferedWriter(...)) { // try-with-resources
    // do something
} catch (IOException | XException e) { // Multiple catch
    // Handle it
}
```

## 扩展

> （1）尽量不要捕获类似 `Exception` 这样的通用异常，而是应该捕获特定异常。

在日常开发中，我们可以通过异常获取信息，进而判断程序中那个地方出现了问题，但是应该确保程序不会捕获到我们不希望捕获的异常，捕获到的异常可以通过 RuntimeException 被扩散出来，而不是被捕获。

> （2）不要生吞（swallow）异常。这是异常处理中要特别注意的事情，因为很可能会导致非常难以诊断的诡异情况。

生吞异常，往往是基于假设这段代码可能不会发生，或者感觉忽略异常是无所谓的，要注意在产品中千万不要做这种假设。

> （3）e.printStackTrace()

调用打印异常堆栈信息时会默认输出到标准错误流，这其实是个不太合适的输出选项，在复杂的系统中，我们不能确定到底输出到哪里了。

我们应该做到是将异常抛出去，或者输出到日志（Logger）。

> （4）Throw early, catch late 原则

所谓 "throw early" 其实就是将可能出现的异常信息判断（比如参数校验）放到方法的开头，之后再进行业务处理，在发现问题的时候，第一时间抛出。

至于 "catch late" 就涉及到捕获异常后，如何处理了？

最差的方式就是 "生吞异常"，本质上是掩盖问题。如果实在不知道在何处处理，可以选择保留原有的 cause 信息，直接再次抛出去或者构建新的异常抛出去。在更高层面上，因为有了清晰的（业务）逻辑，往往会更清楚合适的处理方式。

有的时候，需要自定义异常，这时除了保证提供足够的信息，还有两点需要考虑：

- 是否需要定义为 Checked Exception，因为这种类型设计的初衷就是为了从异常情况恢复，作为异常设计者，我们往往有充足的信息进行分类。
- 在保证诊断信息足够的同时，也要考虑避免包含敏感信息，因为那样可能会导致潜在的安全问题。比如，用户数据一般不可以输出到日志。

需要注意的是 Checked Exception 一直饱受争议：

- 大多数情况下，Checked Exception 出现后根本不可能恢复程序。

- Checked Exception 不兼容 functional 编程。

> （5）性能角度看 Java 异常处理机制

两个地方：

- try-catch 代码段会产生额外的性能开销，换个角度说，它往往会影响 JVM 对代码进行优化，所以建议仅捕获必要的代码块，尽量不要一个大的 try 保住整段的代码；此外，不要利用异常来控制代码流程，比如出现了某个异常后走一条处理逻辑，它远比我们通常意义上的条件语句（if/else、switch）要低效；
- Java 每实例化一个 Exception，都会对当前的栈进行快照，这时一个相对比较重的操作，如果发生的非常频繁，这个开销就不能被忽略。

## 思考

现在接触比较多的是同步程序，它的异常堆栈是垂直的结构，出现了问题可以一步步分析，找到原因。

如果是异步、基于事件机制的，此时出现了异常，就决不能简单的抛出去，这里的异常处理和日志就需要更加小心，我们看到的往往是特定的 Executor 的堆栈，而不是业务方法调用关系。



# 3、浅谈 final、finally、finalize 的异同

## 常规理解

- final 可以修饰类、方法、变量：
  -  final 类不可继承；final 方法不可以重写；final 变量不可以更改（它的初始化具有特殊的写-读内存语义）
- finally 则是 Java 保证重点代码一定要被执行的一种机制。一般在这里做资源的回收处理，现在更推荐使用 Java 7 提供的 try-with-resources 语句；
- finalize 是基础类 `java.lang.Object` 的一个方法，它的设计目的是保证对象在被垃圾回收之前完成特定资源的回收。finalize 机制现在已经不推荐使用，并且在 JDK 9 开始被标记为 deprecated；

## final 不等同于 immutable

比如说 final 修饰的引用类型的变量，final 只能约束这个引用不可以指向其他内存地址，但是该引用指向的对象的行为不受影响。

如果我们想要创建出不可变的 List 集合，Java 的工具包中也有相关的工具：http://openjdk.java.net/jeps/269

```java
List<String> list = Collections.unmodifiableList(Arrays.asList("a", "b", "c"));
// 等价于 JDK 9 提供的新特性 List.of("a", "b", "c")

// 具体原理是该 List 的 add 方法被重写为抛出异常
public void add(int index, E element) {
    throw new UnsupportedOperationException();
}
```

Immutable 在很多场景下是非常有用的，但是从某种意义上讲，Java 目前没有原生的支持不可变，如果要实现 immutable 的类，我们需要做到：

- 将 class 自身声明为 final，这样别人就不可以通过扩展来绕过限制了；
- 将所有成员变量定义为 private 和 final，并且不要实现 setter 方法；
- 通常构造对象时，成员变量使用深度拷贝来初始化，而不是直接赋值，这是一种防御措施，因为你无法确定输入对象不会被其他人修改；
- 如果确实需要实现 getter 方法，或者其他可能会返回内部状态的方法，使用 `copy-on-write`（写入时复制策略），创建私有的 copy 暴露出去。

## finalize 的劣势

finalize 的执行是和垃圾回收绑定在一起的，一旦实现了非空的 finalize 方法，就会导致相应对象回收呈现数量级的变慢（资源是有限的，如果在回收上耗费大量时间和资源，很容易造成 OOM），

而且 finalize 还会掩盖资源回收时的出错信息，在 JDK 的 `java.lang.ref.Finalizer` 中：

```java
private void runFinalizer(JavaLangAccess jla) {
    synchronized (this) {
        if (hasBeenFinalized()) return;
        remove();
    }
    try {
        Object finalizee = this.get();
        if (finalizee != null && !(finalizee instanceof java.lang.Enum)) {
            jla.invokeFinalize(finalizee);

            /* Clear stack slot containing this variable, to decrease
               the chances of false retention with a conservative GC */
            finalizee = null;
        }
    } catch (Throwable x) { } // 这里的异常被生吞了
    super.clear();
}
```

## 替换 finalize 的机制

Java 平台提供了 `java.lang.ref.Cleaner` 来替换掉原有的 finalize 实现。Cleaner 的实现利用了幻象引用（PhantomReference），这是一种常见的 post-mortem 清理机制。

利用幻象引用和引用队列，我们可以保证对象被彻底销毁之前做一些类似资源回收的工作，比如关闭文件描述符（操纵系统有限的资源），它比 finalize 更加轻量、更加可靠。

此外，每个 Cleaner 的操作都是独立的，它有自己的运行线程，可以避免意外死锁等问题。

实践中，我们可以为自己的模块构建一个 Cleaner，然后实现相应的清理逻辑，下面是 JDK 提供的样例：

```java
public class CleaningExample implements AutoCloseable {
    // A cleaner, preferably one shared within a library
    private static final Cleaner cleaner = <cleaner>;

    static class State implements Runnable {

        State(...) {
            // initialize State needed for cleaning action
        }

        public void run() {
            // cleanup action accessing State, executed at most once
        }
    }

    private final State;
    private final Cleaner.Cleanable cleanable

        public CleaningExample() {
        this.state = new State(...);
        this.cleanable = cleaner.register(this, state);
    }

    public void close() {
        cleanable.clean();
    }
}
```

注意：Cleaner 或者幻象引用改善的程度任然是有限的，如果由于种种原因导致幻象引用堆积，同样会出现问题，所以，Cleaner 适合作为一种最后的保证手段，而不是完全依赖 Cleaner 进行资源回收。

很多第三方库喜欢自己直接利用幻象引用定制资源收集，比如广泛使用的 `MySQL JDBC Driver` 之一的 `mysql-connector-j`，就利用了幻象引用机制。幻象引用也可以进行类似链条式依赖关系的使用，比如，进行总量控制的场景，保证只有连接被关闭，相应资源被回收，连接池才能创建新的连接。

但是也需要注意，如果代码稍有不慎添加了对资源的强引用关系，就会导致循环引用关系，前面提到的 MySQL JDBC 在特定模式下就有这个问题，导致内存泄漏。

上面 JDK （9+）提供的示例代码，将 State 定义为 static，就是为了避免普通的内部类隐含对外部对象的强引用，因为那样会导致外部对象无法进入幻象可达的状态。



# 4、强引用、软引用、弱引用、幻象引用

在 Java 中，除了原始数据类型的变量，其他所有都是所谓的引用类型，指向各种不同的对象，理解引用对于掌握 Java 对象生命周期和 JVM 内部相关机制非常有帮助。

## 常规理解

Q：强引用、软引用、弱引用、幻象引用有什么区别？具体使用场景是什么？

A：不同的引用类型，主要体现的是对象不同的可达性（reachable）状态和对垃圾收集的影响。

- 强引用（"Strong" Reference），就是我们最常见的普通对象引用，只要还有强引用指向一个对象，就能表明对象还 "活着"，垃圾收集器不会碰这类对象。对于一个普通的对象，如果没有其他的引用关系，只要超过了引用的作用域或者显式地将相应（强）引用赋值为 null，就是可以被垃圾收集的，当然具体回收时机还是要看垃圾收集策略；
- 软引用（SoftReference），是一种相对强引用弱化一些的引用，可以让对象豁免一些垃圾回收，只有当 JVM 认为内存不足时，才会去试图回收软引用指向的堆内存。JVM 会确保在抛出 OutOfMemoryError 之前，清理软引用指向的对象。软引用通常用来实现内存敏感的缓存，如果还有空闲内存，就可以暂时保留缓存，当内存不足时清理掉，这样就保证了使用缓存的同时，不会耗尽内存；
- 弱引用（WeakReference）并不能使对象豁免垃圾收集，仅仅是提供一种访问在弱引用状态下对象的途径。这就可以用来构建一种没有特定约束的关系，比如，维护一种非强制性的映射关系，如果试图获取时对象还在，就使用它，否则重新实例化。它同样是很多缓存实现的选择；
- 幻象引用（Phantom Reference），有时候也翻译成虚引用，你不能通过它访问对象。幻象引用仅仅是提供了一种确保对象被 finalize 之后，做某些事情的机制，比如，通常用来做所谓的 Post-Mortem 清理机制，Java 平台的 Cleaner 机制等等，也有人利用幻象引用监控对象的创建和销毁。

充分理解这些引用，对于我们设计可靠的缓存等框架，或者诊断应用 OOM 等问题，会很有帮助。比如，诊断 MySQL connector-j 驱动在特定模式（useCompression=true）的内存泄露问题，就需要我们理解怎么排查幻象引用堆积的问题。

## 对象可达性状态流转

如下图所示，简单总结对象生命周期和不同可达性状态，以及不同状态可能的改变关系：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220602151102.png)

上图中的具体状态是 Java 定义的不同可达性级别（reachability level），具体如下：

- 强可达（Strongly Reachable），就是当一个对象可以有一个或者多个线程可以不通过各种引用访问到的情况。比如，我们创建了一个对象，那么创建它的线程对它就是强可达的。
- 软可达（Softly Reachable），就是当我们只能通过软引用才能访问到对象的状态。
- 弱可达（Weakly Reachable），类似前面提到的，就是无法通过强引用或者软引用访问，只能通过弱引用访问时的状态。这是十分临近 finalize 状态的时机，当弱引用被清除的时候，就符合 finalize 的条件了。
- 幻象可达（Phantom Reachable），就是没有强、软、弱引用关联，并且 finalize 过了，只有幻象引用指向这个对象的时候。
- 当然，还有最后一个状态，就是不可达（Unreachable），意味着对象可以被清除了。

判断对象可达性，是 JVM 垃圾收集器决定如何处理对象的一部分考虑。

所有引用类型，都是抽象类 `java.lang.ref.Reference` 的子类，它提供了一个 get 方法：

```java
@HotSpotIntrinsicCandidate
public T get() {
    return this.referent;
}
```

除了幻象引用（get 永远返回 null），如果对象还没有被销毁，都可以通过 get 方法获取原有对象。这意味着，利用软引用和弱引用，我们可以访问到的对象，重新指向强引用，也就是人为的改变了对象的可达性！这就是为什么上图中状态转换存在双向箭头。

所以，对于软引用、弱引用之类，垃圾收集器可能会存在二次确认的问题，以保证处于弱引用状态的对象，没有被改变为强引用。

但是，这里可能会存在一些问题：比如我们错误的保持了强引用（比如，赋值给 static 变量），那么对象可能没有机会变回类似弱引用的可达性状态了，就会产生内存泄漏。所以，检查弱引用指向对象是否被垃圾回收，也是诊断是否有特定内存泄漏的一个思路，如果我们的框架使用到弱引用又怀疑有内存泄漏，就可以从这个角度检查。

## 引用队列（ReferenceQueue）使用

谈到各种引用的编程，就必然提到引用队列。我们在创建各种引用并关联到响应对象的时候，可以选择是否需要关联引用队列，JVM 会在特定时机将引用 enqueue 到队列里，我们可以从队列中获取引用（remove 方法这里实际是有获取的意思的）进行相关后续操作。尤其是幻象引用，get 方法只返回 null，如果再不指定引用队列，基本就没有意义了。

比如下面的代码，利用引用队列，我们可以在对象处于相应状态的时候（对于幻象引用，就是前面说的被 finalize 了，处于幻象可达状态），执行后期处理逻辑：

```java
public static void main(String[] args) {
    Object counter = new Object();
    ReferenceQueue<Object> refQueue = new ReferenceQueue<>();
    PhantomReference<Object> pRef = new PhantomReference<>(counter, refQueue);

    counter = null;
    System.gc();

    try {
        Reference<?> ref = refQueue.remove(1000L);
        if (ref != null) {
            // do something
        }
    } catch (InterruptedException e) {
        // Handle it
    }
}
```

## 显式地影响软引用垃圾收集

前面提到引用对垃圾收集的影响，尤其是软引用，到底 JVM 内部是怎么处理它的，其实并不是非常明确。那么我们是否可以用什么方法来影响软引用的垃圾收集呢？

答案是有的：软引用通常会在最后一次引用后，还能保持一段时间，默认值是根据堆剩余空间计算的（以 M bytes 为单位）。从 Java 1.3.1 开始，提供了 `-XX:SoftRefLRUPolicyMSPerMB` 参数，我们可以以毫秒（milliseconds）为单位设置。比如，下面这个示例就是设置为 3 秒：

```
-XX:SoftRefLRUPolicyMSPerMB=3000
```

这个剩余空间，其实会受不同 JVM 模式影响，对于 Client 模式，比如通常的 Window 32 bit JDK，剩余空间是计算当前堆里空闲的大小，所以更加倾向于回收；而对于 Server 模式 JVM，则是根据 -Xmx 指定的最大值来计算。

本质上，这个行为还是个黑盒，取绝于 JVM 的实现，即使是上面的参数，在新版的 JDK 也未必有效。

## 诊断 JVM 引用情况

如果怀疑应用存在引用（或 finalize）导致的回收问题，可以有很多工具或者选项可供选择，比如 HotSpot JVM 自身提供了明确的选项（PrintReferenceGC）去获取相关信息，比如在 JDK 8 应用可以在启动参数中加入：

```
-XX:+PrintGCDetails -XX:+PrintGCTimeStamps -XX:+PrintReferenceGC
```

这是 JDK 8 使用的 ParrallelGC 收集的垃圾收集日志，各种引用参数非常清晰：

```
0.403: [GC (Allocation Failure) 0.871: [SoftReference, 0 refs, 0.0000393 secs]0.871: [WeakReference, 8 refs, 0.0000138 secs]0.871: [FinalReference, 4 refs, 0.0000094 secs]0.871:
[PhantomReference, 0 refs, 0 refs, 0.0000085 secs]0.871: [JNI Weak Reference, 0.0000071 secs][PSYoungGen: 76272K->10720K(141824K)] 128286K->128422K(316928K), 0.4683919 secs] [Times:
user=1.17 sys=0.03, real=0.47 secs]
```

注意：JDK 9 对 JVM 和垃圾收集日志进行了广泛的重构，类似 PrintGCTimeStamps 和 PrintReferenceGC 已经不再存在。

## Reacheaility Fence

除了前面介绍的几种基本引用类型，我们也可以通过底层的 API 来达到强引用的效果，这就是所谓的设置 reachability fence。

为什么需要使用这种机制？考虑存在这样一种场景，如果一个对象没有指向强引用，就符合垃圾收集的标准，有些时候，对象本身并没有强引用，但是也许它的部分属性还在被使用，这样就导致诡异的问题，所以我们需要一个方法，在没有强引用的情况下，通知 JVM 该对象是正在被使用的。

具体参见 JDK 9+ 中 `Refenerce.reachabilityFence` 方法上提供的示例程序：

```java
class Resource {
    private static ExternalResource[] externalResourceArray = ...

    int myIndex;
    
    Resource(...) {
        myIndex = ...
            externalResourceArray[myIndex] = ...;
        ...
    }
    protected void finalize() {
        externalResourceArray[myIndex] = null;
        ...
    }
    public void action() {
        try {
            // ...
            int i = myIndex;
            Resource.update(externalResourceArray[i]);
        } finally {
            Reference.reachabilityFence(this);
        }
    }
    private static void update(ExternalResource ext) {
        ext.status = ...;
    }
}
```

方法 action 的执行，依赖于对象的部分属性，所以被特定保护了起来。否则，如果我们在代码中像下面这样调用，那么就可能会出现困扰，因为没有强引用指向我们创建出来的 Resource 对象，JVM 对它进行 finalize 操作是完全合法的：

```java
new Resource().action();
```

类似的书写结构，在异步编程中似乎很是普遍的，因为异步编程中往往不会用传统的 "执行 -> 返回 -> 使用" 的结构。

在 Java 9 之前，实现类似功能相对比较繁琐，有的时候需要采取一些比较隐晦的小技巧。幸好，`java.lang.ref.Reference` 给我们提供了新的方法，它是 JEP 193: Variable Handles 的一部分，将 Java 平台底层的一些能力暴露出来：

```java
@ForceInline
public static void reachabilityFence(Object ref) {
    // Does nothing. This method is annotated with @ForceInline to eliminate
    // most of the overhead that using @DontInline would cause with the
    // HotSpot JVM, when this fence is used in a wide variety of situations.
    // HotSpot JVM retains the ref and does not GC it before a call to
    // this method, because the JIT-compilers do not have GC-only safepoints.
}
```

在 JDK 源码中，`reachabilityFence` 大多使用在 Executors 或者类似新的 HTTP/2 客户端代码中，大部分都是异步调用的情况。编程中，可以参考上面的例子，将需要 reachability 保证的代码段使用 try-finally 包裹起来，在 finally 中明确声明对象强可达。

## 总结

在 Java 语言中，除了基本的数据类型，其他的都是指向各类对象的对象引用；Java 中根据其生命周期的长短，将引用分为 4 类。

（1）强引用

特点：我们平常编程使用的 `Object obj = new Object()` 中的 obj 就是强引用。通过关键字 new 创建的对象所关联的引用就是强引用。

当 JVM 内存空间不足，JVM 宁愿抛出 `OutOfMemoryError` 错误使程序异常终止，也不会随意回收具有强引用的 "存活" 的对象来解决内存不足的问题。对于一个普通的对象，如果没有其他的引用关系，只要超过了引用的作用域或者显式地将相应（强）引用赋值为 null，就是可以被垃圾收集的了，具体回收时机还是要看垃圾收集策略（gc 线程优先级不高，且需要耗费性能，所以这个时机由相关策略决定）。

此外可能会遇到这样的情况：`new Resource().action()`，创建的对象没有和引用关联，但是调用的方法却依赖对象属性，此时可以在该方法中使用 `try...finally` 语句，在 `finally` 中通过 `Reference.reachabilityFence` （JDK 9+）方法将指定的对象声明为强可达，这样 GC 就不会收集该对象，这种方式在异步编程中常用。

（2）软引用

特点：软引用通过 `SoftReference` 类实现。软引用的生命周期比强引用要短一些。只有当 JVM 认为内存不足时，才会去试图回收软引用指向的对象，即 JVM 会确保在抛出 `OutOfMemoryError` 之前，清理软引用指向的对象。软引用可以和一个引用队列（`ReferenceQueue`）联合使用，如果软引用所引用的对象被垃圾回收器回收，Java 虚拟机就会把这个软引用加入到与之关联的引用队列中，后续，我们可以调用 `ReferenceQueue.poll()` 方法来检查是否有它所关心的对象被回收。如果队列为空，将返回一个 null，否则该方法返回队列中前面的一个 Reference 对象。

应用场景：软引用常用来实现内存敏感的缓存。如果还有空闲内存，就可以暂时保留缓存，当内存不足时清理掉，这样就保证了使用缓存的同时，不会耗尽内存。

（3）弱引用

弱引用通过 `WeakReference` 类实现。弱引用的生命周期比软引用短。在垃圾回收器线程扫描它所管辖的内存区域的过程中，一旦发现了具有弱引用的对象，不管当前内存控制是否充足，都会回收它的内存。由于垃圾回收器是一个优先级很低的线程，因此不一定很快回收弱引用的对象。弱引用可以和一个引用队列（`ReferenceQueue`）联合使用，如果弱引用所引用的对象被垃圾回收，Java 虚拟机就会把这个弱引用加入到与之关联的引用队列中。

应用场景：弱引用同样可以用于内存敏感的缓存。

（4）虚引用

特点：虚引用也叫幻象引用，通过 `PhantomReference` 类来实现。无法通过虚引用访问对象的任何属性或方法。幻象引用仅仅是提供了一种确保对象被 finalize 后，做某些事情的机制。如果一个对象仅持有虚引用，那么它就和没有任何引用一样，在任何时候都可能被垃圾回收器回收。虚引用必须和引用队列（`ReferenceQueue`）联合使用。当垃圾回收器准备回收一个对象时，如果发现它还有虚引用，就会在回收对象的内存之前，把这个虚引用加入到与之关联的引用队列中。

```java
ReferenceQueue queue = new ReferenceQueue();
PhantomReference pr = new PhantomReference(object, queue);
```

程序可以判断引用队列中是否已经加入了虚引用，来了解被引用的对象是否将要被垃圾回收。如果程序发现某个虚引用已经加入到引用队列中，那么就可以在所引用的对象的内存被回收之前采取一些处理措施。

应用场景：可用来跟踪对象被垃圾回收器回收的活动，当一个虚引用关联的对象被垃圾收集器回收之前会收到一条系统通知。