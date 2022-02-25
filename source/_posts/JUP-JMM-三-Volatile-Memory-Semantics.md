---
title: JUP JMM (三) Volatile Memory Semantics
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211208174935.jpg'
coverImg: /img/20211208174935.jpg
cover: false
toc: true
mathjax: false
date: 2022-02-25 11:34:29
summary: "Java 内存模型: Volatile 内存语义"
categories: "Java Concurrent"
keywords: "Java Concurrent"
tags: "Java Concurrent"
---



# volatile 的内存语义

当声明共享变量为 volatile 后，对这个变量的读/写会很特别。

## 1、volatile 的特性

理解 volatile 特性的一个好办法是把对 volatile 变量的单个读/写，看成是使用同一个锁对这些单个读/写操作做了同步。

代码如下：

```java
public class VolatileFeatureExample {
    
    volatile long v1 = 0L;          // 使用 volatile 声明 64 位的 long 型变量

    public void set(long v1) {      // 单个 volatile 变量的写
        this.v1 = v1;
    }
    
    public long get() {             // 单个 volatile 变量的读 
        return v1;
    }

    public void getAndIncrement() { // 复合(多个) volatile 变量的读/写
        v1++;
    }
}
```

假设有多个线程分别调用上面程序的 3 个方法，这个程序在语义上和下面的程序等价：

```java
public class VolatileFeatureExample {
    
    long v1 = 0L;          					// 声明 64 位的 long 型普通变量

    public synchronized void set(long v1) { // 对单个的普通变量的写用同一个锁同步
        this.v1 = v1;
    }
    
    public synchronized long get() {         // 对单个的普通变量的读用同一个锁同步
        return v1;
    }

    public void getAndIncrement() {    	// 普通方法调用
        long temp = get();				// 调用已同步的读方法
        temp += 1L;						// 普通写操作
        set(temp);						// 调用已同步的写方法
    }
}
```

如上所示，一个 volatile 变量的单个读/写操作，与一个普通变量的读/写操作都是使用同一个锁来同步，它们之间的执行效果相同。

锁的 happens-before 规则保证释放锁和获取锁的两个线程之间的内存可见性，这意味着对一个 volatile 变量的读，总是能看到（任意线程）对这个 volatile 变量的最后的写入。

锁的语义决定了临界区代码的执行具有原子性。这意味着，即使是 64 位的 long 型和 double 型变量，只要它是 volatile 变量，对该变量的读/写就具有原子性。如果是多个 volatile 操作或类似于 volatile++ 这种复合操作，这些操作整体上不具有原子性。

简而言之，volatile 变量自身具有以下特性：

（1）可见性：对一个 volatile 变量的读，总是能看到（任意线程）对这个 volatile 变量最后的写入；

（2）原子性：对任意单个 volatile 变量的读/写具有原子性，但类似于 volatile++ 这种复合操作不具有原子性。



## 2、volatile 写-读建立的 happens-before 关系

前面说的是 volatile 变量自身的特性，对程序员来说，volatile 对线程的内存可见性的影响比 volatile 自身的特性更为重要。

从 JSR-133 开始，volatile 变量的 写-读 操作可以实现线程之间的通信。

从内存语义的角度来说，volatile 的 写-读 与 锁的释放-获取 有相同的内存效果：volatile 写和锁的释放有相同的内存语义；volatile 读与锁的获取有相同的内存语义。

```java
class VolatileExample {
    int a = 0;
    
    volatile boolean flag = false;
    
    public void writer() {
        a = 1;                  // 1
        flag = true;            // 2
    }
    
    public void reader() {
        if (flag) {             // 3
            int i = a;          // 4
            // ...
        }
    }
}
```

假设线程 A 执行 `writer()` 方法之后，线程 B 执行 `reader()` 方法。根据 happens-before 规则，这个过程建立的 happens-before 关系可以分为 3 类：

（1）根据程序次序规则：1 happens-before 2；3 happens-before 4

（2）根据 volatile 规则：2 happens-before 3

（3）根据 happens-before 的传递性规则：1 happens-before 4

图形化表示：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225102937.png)

上图中，每一个箭头链接的两个节点，代表了一个 happens-before 关系。

黑色箭头表示程序顺序规则；橙色箭头表示 volatile 规则；蓝色箭头表示组合了这些规则后提供的 happens-before 保证。

这里 A 线程写了一个 volatile 变量后，B 线程读取同一个 volatile 变量。A 线程在写 volatile 变量之前所有可见的共享变量，在 B 线程读同一个 volatile 变量后，将立即变得对 B 线程可见。



## 3、volatile 写-读的内存语义

### （1）volatile 写的内存语义

当写一个 volatile 变量后，JMM 会把该线程对应的本地内存中的共享变量刷新到主内存。

以之前的 `VolatileExample` 为例，假设线程 A 首先执行 `writer()` 方法，随后线程 B 执行 `reader()` 方法，初始时两个线程的本地内存中的 flag 和 a 都是初始状态。下图为线程 A 执行 volatile 写后，共享变量的状态示意图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225103638.png)

线程 A 在写 flag 变量后，本地内存 A 中被线程 A 更新过的两个共享变量的值被刷新到主内存中。此时，本地内存 A 和主内存中的共享变量的值是一致的。

### （2）volatile 读的内存语义

当读一个 volatile 变量时，JMM 会把该线程对应的本地内存置为无效。线程接下来将从主内存中读取共享变量。

下图为线程 B 读同一个 volatile 变量后，共享内存的状态示意图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225104007.png)

如图所示，在读 flag 变量后，本地内存 B 包含的值已经被置为无效。此时，线程 B 必须从主内存中读取共享变量。线程 B 的读取操作将导致本地内存 B 与主内存中的共享变量的值变成一致。



### （3）总结

如果把 volatile 写和 volatile 读两个步骤综合起来看的话，线程 B 读一个 volatile 变量后，写线程 A 在写这个 volatile 变量之前所有可见的共享变量的值都将立即变得对线程 B 可见。

下面对 volatile 写和读做个总结：

- 线程 A 写一个 volatile 变量，实质上是线程 A 向接下来要读这个 volatile 变量的某个线程发出了（其对共享变量所作的修改）消息；
- 线程 B 读一个 volatile 变量，实质上是线程 B 接收了之前某个线程发出的（在写这个 volatile 变量之前对共享变量所作修改）的消息；
- 线程 A 写一个 volatile 变量，随后线程 B 读这个 volatile 变量，这个过程实质上是线程 A 通过主内存向线程 B 发送消息。



## 4、volatile 内存语义的实现

### （1）JMM 针对编译器的 volatile 重排序规则

下面看看 JMM 如何实现 volatile 写/读的内存语义。

前面提到重排序分为编译器重排序和处理器重排序。为了实现 volatile 内存语义，JMM 会分别限制这两种类型的重排序类型。

下表为 JMM 针对编译器制定的 volatile 重排序规则表：

<table>
    <thead>
    	<tr><th>是否能重排序</th><th colspan="3">第二个操作</th></tr>
    </thead>
    <tbody>
    	<tr>
            <td>第一个操作</td>
            <td>普通读/写</td>
            <td>volatile 读</td>
            <td>volatile 写</td>
        </tr>
        <tr>
            <td>普通读/写</td>
            <td></td>
            <td></td>
            <td>NO</td>
        </tr>
        <tr>
            <td>volatile 读</td>
            <td>NO</td>
            <td>NO</td>
            <td>NO</td>
        </tr>
        <tr>
            <td>volatile 写</td>
            <td></td>
            <td>NO</td>
            <td>NO</td>
        </tr>
    </tbody>
</table>

举例来说：第三行最后一个单元格的意思是，在程序中，当一个操作为普通变量的读或写时，如果第二个操作为 volatile 写，则编译器不能重排序这两个操作。

从上表可以看出：

- 当第二个操作是 volatile 写时，不管第一个操作是什么，都不能重排序。这个规则确保 volatile 写之前的操作不会被编译器重排序到 volatile 写之后；
- 当第一个操作是 volatile 读时，不管第二个操作是什么，都不能重排序。这个规则确保了 volatile 读之后的操作不会被编译器重排序到 volatile 读之前；
- 当第一个操作是 volatile 写，第二个操作是 volatile 读时，不能重排序。

为了实现 volatile 的内存语义，编译器在生成字节码时，会在指定序列中插入内存屏障来禁止特定类型的处理器重排序。对于编译器来说，发现一个最优布置来最小化插入屏障的总数几乎不可能。为此，JMM 采取保守策略。

下面是 JMM 基于保守策略的内存屏障插入策略：

- 在每个 volatile 写操作的前面插入一个 StoreStore 屏障；
- 在每个 volatile 写操作的后面插入一个 StoreLoad 屏障；
- 在每个 volatile 读操作的后面插入一个 LoadLoad 屏障；
- 在每个 volatile 读操作的后面插入一个 LoadStore 屏障。

上面内存屏障插入策略非常保守，但它可以保证在任何处理器平台，任意的程序中都能得到正确的 volatile 内存语义。

### （2）volatile 写指令序列

下面是保守策略下，volatile 写插入内存屏障后生成的指令序列示意图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225110207.png)

上图中的 StoreStore 屏障可以保证在 volatile 写之前，其前面的所有普通写操作已经对任意处理器可见了。这是因为 StoreStore 屏障将保障上面的所有普通写在 volatile 写之前刷新到主内存。

这里比较有意思的是，volatile 写后面的 StoreLoad 屏障，此屏障的作用是避免 volatile 写于后面可能有的 volatile 读/写操作重排序。因为编译器常常无法准确判断在一个 volatile 写的后面是否需要插入一个 StoreLoad 屏障（比如，一个 volatile 写之后方法立即 returen）。为了确保能正确实现 volatile 内存语义，JMM 在采取了保守策略：在每个 volatile 写的后面，或者在每个 volatile 读的前面插入一个 StoreLoad 屏障。

当读线程的数量大大超过写线程时，选择在 volatile 写之后插入一个 StoreLoad 屏障将带来可观的执行效率的提升。这里可以看到 JMM 在实现上的一个特点：首先确保正确性，然后再去追求执行效率。

### （3）volatile 读指令序列

下面是在保守策略下，volatile 读插入内存屏障后生成的指令序列示意图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225110931.png)

上图中的 LoadLoad 屏障用来禁止处理器把上面的 volatile 读与下面的普通读重排序。

LoadStore 屏障用来禁止处理器把上面的 volatile 读与下面的普通写重排序。

### （4）总结

上述 volatile 写和 volatile 读的内存屏障插入策略非常保守。在实际执行时，只要不改变 volatile 写-读的内存语义，编译器可以根据具体情况省略不必要的屏障。

比如下面的代码：

```java
class VolatileBarrierExample {
    int a;
    
    volatile int v1 = 1;
    
    volatile int v2 = 2;
    
    void readAndWrite() {
        int i = v1;         // 第一个 volatile 读
        int j = v2;         // 第二个 volatile 读
        a = i + j;          // 普通写
        v1 = i + 1;         // 第一个 volatile 写
        v2 = j * 2;         // 第二个 volatile 写
    }
}
```

针对 `readAndWrite()` 方法，编译器在生成字节码时可以做如下优化：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225111454.png)

注意最后的 StoreLoad 屏障不能省略。因为第二个 volatile 写之后，方法立即 return。此时编译器可能无法准确判断后面是否会有 volatile 读或写，为了安全起见，编译器通常会在这里插入一个 StoreLoad 屏障。

上面的优化针对任意处理器平台，由于不同平台会有不同的 "松紧度" 的处理器内存模型，内存屏障的插入还可以根据具体的处理器内存模型继续优化。以 X86 处理器为例，上图中除了最后的 StoreLoad 屏障外，其他的屏障都会被省略。

在保守策略下的 volatile 读和写，在 X86 处理器平台可以优化为下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225112137.png)

之前提到过，X86 处理器仅仅会对 写-读操作做重排序。X86 不会对 读-读、读-写和写-写 操作做重排序，因此在 X86 处理器中会省略到这三种类型对应的内存屏障。

在 X86 中，JMM 仅需在 volatile 写后面插入一个 StoreLoad 屏障即可正确实现 volatile 写-读的内存语义。这意味着在 X86 处理器中，volatile 写的开销比 volatile 读的开销会大很多（因为执行 StoreLoad 屏障开销会比较大）



## 5、JSR-133 为什么要增强 volatile 的内存语义

在 JSR-133 之前的旧 Java 内存模型中，虽然不允许 volatile 变量之间重排序，但旧的 Java 内存模型允许 volatile 变量与普通变量重排序。在旧的内存模型中，`VolatileExample` 示例程序可能被重排序为下图所示的时序来执行：

```java
class VolatileExample {
    int a = 0;
    
    volatile boolean flag = false;
    
    public void writer() {
        a = 1;                  // 1
        flag = true;            // 2
    }
    
    public void reader() {
        if (flag) {             // 3
            int i = a;          // 4
            // ...
        }
    }
}
```

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225112616.png)

在旧的内存模型中，当 1 和 2 之间没有数据依赖关系时，1 和 2 就可能被重排序（3 和 4 类似）。其结果就是：读线程 B 执行 4 时，不一定能看到写线程 A 在执行 1 时对共享变量的修改。

因此，在旧的内存模型中，volatile 的写-读没有锁的释放-获取锁具有的内存语义。为了提供一种比锁更轻量级的线程之间通信的机制，JSR-133 专家组决定增强 volatile 的内存语义：严格限制编译器和处理器对 volatile 变量与普通变量之间的重排序，确保 volatile 的写-读和锁的释放-获取具有相同的内存语义。

从编译器重排序规则和处理器内存屏障插入策略来看，只要 volatile 变量与普通变量之间的重排序可能会破坏 volatile 的内存语义，这种重排序就会被编译器重排序规则和处理器内存屏障插入策略禁止。

由于 volatile 仅仅保证对单个 volatile 变量的读/写具有原子性，而锁的互斥执行的特性可以确保对整个临界区代码的执行具有原子性。

在功能上，锁比 volatile 更强大；在可伸缩性和执行性能上，volatile 更有优势。