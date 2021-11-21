---
title: Java Random Function Intro
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211008143850.jpg'
coverImg: /img/20211008143850.jpg
toc: true
date: 2021-11-21 21:01:37
top: false
cover: false
summary: Java 与生成随机数相关的函数简介
categories: Java
keywords: Java
tags: Java
---

# 随机数生成

## 1、Math.random

Math 类是 Java 中与数学相关的类，可以使用其中的静态方法 `random()` 来生成伪随机数。



```java
// java.lang.Math#random()

public static double random() {
    return RandomNumberGeneratorHolder.randomNumberGenerator.nextDouble();
}

private static final class RandomNumberGeneratorHolder {
    static final Random randomNumberGenerator = new Random();
}
```

其底层使用的是 `java.util.Random` 类作为伪随机数生成器。

返回一个 double 值，取值范围 `[0.0, 1.0)`，近似一个均匀分布。



`Math.random()` 方法是线程安全的，第一次调用会生成一个伪随机数生成器实例，此后调用此方法都是共用这个实例，当线程少的时候还好，如果线程数非常多且生成随机数的速率较高，那么性能就会下降。可以考虑使用 `java.util.Random` 在为每个线程生成伪随机数生成器。





## 2、java.util.Random

`java.util.Random` 的实例用于生成伪随机数，是线程安全的。

它的核心在于种子和生成算法。

不过一般情况下，我们会使用 `Math.random()` 方法来生成伪随机数。



Random 的实例是线程安全的，但是在高并发的情况下使用它可能会遇到线程争用导致的效率下降问题，这是因为 Random 生成随机数的时候使用的是 CAS。



<mark>比较并交换(compare and swap, CAS)，是原子操作的一种，可用于在多线程编程中实现不被打断的数据交换操作，从而避免多线程同时改写某一数据时由于执行顺序不确定性以及中断的不可预知性产生的数据不一致问题。 该操作通过将内存中的值与指定数据进行比较，当数值一样时将内存中的数据替换为新的值。</mark>

考虑在多线程设计中使用 `java.util.concurrent.ThreadLocalRandom`。



同时 Random 的实例在加密上不安全。 考虑使用 `java.security.SecureRandom` 来获得一个加密安全的伪随机数生成器，供安全敏感的应用程序使用。  



例子：

```java
@Test
public void testRandom() {

    Random random = new Random();

    // 返回 [0, bound) 之间的整数
    random.nextInt(100);

    for (int i = 0; i < 20; i++) {
        System.out.print((random.nextInt(10) + 1) + " ");
    }
}
```



## 3、java.util.concurrent.ThreadLocalRandom

ThreadLocalRandom 直接继承自 java.util.Random。

```java
/** The common ThreadLocalRandom */
static final ThreadLocalRandom instance = new ThreadLocalRandom();

/** Constructor used only for static singleton */
private ThreadLocalRandom() {
    initialized = true; // false during super() call
}
```



例子：获取一个随机整数

```java
int randomInt = ThreadLocalRandom.current().nextInt(begin, end + 1);
```

看一下核心代码：

```java
// java.util.concurrent.ThreadLocalRandom#current()

// 返回当前线程的 ThreadLocalRandom 随机数生成器
public static ThreadLocalRandom current() {
    if (UNSAFE.getInt(Thread.currentThread(), PROBE) == 0)
        localInit();
    return instance;
}
```

这里有一个 `UNSAFE` 全局对象，它是 `sun.misc.Unsafe` 类的实例。

```java
// java.util.concurrent.ThreadLocalRandom#localInit()

static final void localInit() {
    int p = probeGenerator.addAndGet(PROBE_INCREMENT);
    int probe = (p == 0) ? 1 : p; // skip 0
    long seed = mix64(seeder.getAndAdd(SEEDER_INCREMENT));
    Thread t = Thread.currentThread();
    UNSAFE.putLong(t, SEED, seed);
    UNSAFE.putInt(t, PROBE, probe);
}
```

这里是为了为当前线程初始化一个随机种子，<strong style="color:red">核心代码就在于 UNSAFE </strong>的两个方法。

查看源码发现都是 native 方法：

```java
public native int getInt(Object var1, long var2);

public native void putInt(Object var1, long var2, int var4);

public native long getLong(Object var1, long var2);

public native void putLong(Object var1, long var2, long var4);
```

Unsafe 类在 rt.jar 中，而且私有化构造方法，我们只能看到字节码文件，而且无法实例化它，但是可以找到这些方法的说明：

- `putLong(object, offset, value)` 可以将 object 对象内存地址偏移 offset 后的位置后四个字节设置为 value。
- `getLong(object, offset)` 会从 object 对象内存地址偏移 offset 后的位置读取四个字节作为 long 型返回。

这方法可以直接操作内存，而且不做任何安全校验，确实符合类名。

在我们的常识里，get 方法是最容易抛异常的地方，比如空指针、类型转换等，但 `Unsafe.getLong()` 方法是个非常安全的方法，它从某个内存位置开始读取四个字节，而不管这四个字节是什么内容，总能成功转成 long 型，至于这个 long 型结果是不是跟业务匹配就是另一回事了。而 set 方法也是比较安全的，它把某个内存位置之后的四个字节覆盖成一个 long 型的值，也几乎不会出错。

<mark>那么这些方法不安全在哪里呢？</mark>

它们的不安全并不是在这两个方法执行期间报错，而是未经保护地改变内存，会引起别的方法在使用这一段内存时报错。



> ThreadLocalRandom 的实现

ThreadLocalRandom 的实现需要 Thread 对象的配合，在 Thread 对象内存在着一个属性 `threadLocalRandomSeed`，它保存着这个线程专属的随机种子，而这个属性在 Thread 对象的 offset，是在 ThreadLocalRandom 类加载时就确定了的，具体方法是 



`SEED = UNSAFE.objectFieldOffset(Thread.class.getDeclaredField("threadLocalRandomSeed"));`



我们知道一个对象所占用的内存大小在类被加载后就确定了的，所以使用 `Unsafe.objectFieldOffset(class, fieldName)` 可以获取到某个属性在类中偏移量，而在找对了偏移量，又能确定数据类型时，使用 ThreadLocalRandom 就是很安全的。



## 4、java.security.SecureRandom

`java.security.SecureRandom` 也继承自 `java.util.Random`，是它的增强版本，可以提供强加密随机数生成器。

SecureRandom 选取种子的方式有很多种，当它和 Random 的处于一下条件时：

- 种子一样
- 相同条件下
- 两者会生成一样的随机数



例子：

```java
@Test
public void testSecureRandom() {

    // 默认的种子
    SecureRandom secureRandom = new SecureRandom();

    // 以字节数组为种子
    SecureRandom secureRandom1 = new SecureRandom("abcd".getBytes());
    SecureRandom secureRandom2 = new SecureRandom("abcd".getBytes());

    // 如果种子相同，生成的随机序列也一样
    for (int i = 0; i < 10; i++) {
        System.out.print(secureRandom1.nextInt(100) + " ");
        // 34 44 40 30 1 73 49 4 37 56
    }
    System.out.println();
    for (int i = 0; i < 10; i++) {
        // 34 44 40 30 1 73 49 4 37 56
        System.out.print(secureRandom2.nextInt(100) + " ");
    }
}
```

