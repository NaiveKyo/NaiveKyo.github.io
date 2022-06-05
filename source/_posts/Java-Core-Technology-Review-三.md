---
title: Java Core Technology Review (三)
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221812.jpg'
coverImg: /img/20220225221812.jpg
cover: false
toc: true
mathjax: false
date: 2022-06-05 18:29:01
summary: "Java 核心技术回顾(三) Java Map 数据结构"
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

# 9、对比 Hashtable、HashMap、TreeMap

Map 是广义 Java 集合框架中的另外一部分，HashMap 作为框架中使用频率最高的类型之一，它本身以及相关类型自然也是面试考察的热点。

Q：对比 Hashtable、HashMap、TreeMap 有什么不同？谈谈对 HashMap 的掌握。

A：Hashtable、HashMap、TreeMap 都是最常见的一些 Map 实现，是以键值对的形式存储和操作数据的容器类型。

Hashtable 是早期 Java 类库提供的一个[哈希表](https://zh.wikipedia.org/wiki/%E5%93%88%E5%B8%8C%E8%A1%A8)实现，本身是同步的，不支持 null 键和值，由于同步导致的性能开销，所以已经很少被推荐使用。

HashMap 是应用更加广泛的哈希表实现，行为上大致上与 HashTable 一致，主要区别在于 HashMap 不是同步的，支持 null 键和值等。通常情况下，HashMap 进行 put 或者 get 操 作，可以达到常数时间的性能，所以它是绝大部分利用键值对存取场景的首选，比如，实现一个用户ID和用户信息对应的运行时存储结构。

TreeMap 则是基于红黑树的一种提供顺序访问的 Map，和 HashMap 不同，它的 get、put、remove 之类操作都是O（log(n)）的时间复杂度，具体顺序可以由指定的 Comparator 来决定，或者根据键的自然顺序来判断。

上面对这个问题做了简单总结，针对 Map 可以扩展的问题有很多，从各种数据结构、典型应用场景，到程序设计实现的技术考量，尤其是在 Java 8 里，HashMap 本身发生了非常大的变化。

可以从以下几个方面分析：

- 理解 Map 相关数据结构，尤其是有序数据结构的一些要点；
- 从源码去分析 HashMap 的设计和实现要点，理解容量、负载因子等，为什么需要这些参数，如何影响Map的性能，实践中如何取舍等；
- 理解树化改造的相关原理和改进原因

除了典型的代码分析，还有一些有意思的并发问题，如 HashMap 在并发环境可能出现的 [无限循环占用 CPU](https://bugs.java.com/bugdatabase/view_bug.do?bug_id=6423457)、size 不准确等诡异的问题。

我认为这是一种典型的使用错误，因为HashMap明确声明不是线程安全的数据结构，如果忽略这一点，简单用在多线程场景里，难免会出现问题。

理解导致这种错误的原因，也是深入理解并发程序运行的好办法。对于具体发生了什么，你可以参考这篇很久以前的[分析](https://mailinator.blogspot.com/2009/06/beautiful-race-condition.html)，里面甚至提供了示意图。

## Map 整体结构

首先，我们先对 Map 相关类型有个整体了解，Map 虽然通常被包括在 Java 集合框架里，但是其本身并不是狭义上的集合类型（Collection），具体你可以参考下面这个简单类图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220605110457.png)

Hashtable 比较特别，作为类似 Vector、Stack 的早期集合相关类型，它是扩展了 Dictionary 类的，类结构上与HashMap 之类明显不同。

HashMap 等其他 Map 实现则是都扩展了 AbstractMap，里面包含了通用方法抽象。不同 Map 的用途，从类图结构就能体现出来，设计目的已经体现在不同接口上。

大部分使用 Map 的场景，通常就是放入、访问或者删除，而对顺序没有特别要求，HashMap 在这种情况下基本是最好的选择。HashMap 的性能表现非常依赖于哈希码的有效性，请务必掌握 hashCode 和 equals 的一些基本约定，比如：

- equals 相等，hashCode 一定要相等。
- 重写了 hashCode 也要重写 equals。
- hashCode 需要保持一致性，状态改变返回的哈希值仍然要一致。
- equals 的对称、反射、传递等特性。

针对有序 Map 的分析内容补充：虽然 LinkedHashMap 和 TreeMap 都可以保证某种顺序，但二者还是非常不同的。

- LinkedHashMap 通常提供的是遍历顺序符合插入顺序，它的实现是通过为条目（键值对）维护一个双向链表。注意，通过特定构造函数，我们可以创建反映访问顺序的实例，所谓的 put、get、compute 等，都算作“访问”。

这种行为适用于一些特定应用场景，例如，我们构建一个空间占用敏感的资源池，希望可以自动将最不常被访问的对象释放掉，这就可以利用 LinkedHashMap 提供的机制来实现， 参考下面的示例：

```java
import java.util.LinkedHashMap;
import java.util.Map;
public class LinkedHashMapSample {
    public satic void main(String[] args) {
        LinkedHashMap<String, String> accessOrderedMap = new LinkedHashMap<>(16, 0.75F, true){
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, String> eldes) { // 实现自定义删除策略，否则行为就和普遍Map没有区别
                return size() > 3;
            }
        };
        accessOrderedMap.put("Project1", "Valhalla");
        accessOrderedMap.put("Project2", "Panama");
        accessOrderedMap.put("Project3", "Loom");
        accessOrderedMap.forEach( (k,v) -> {
            Sysem.out.println(k +":" + v);
        });
        // 模拟访问
        accessOrderedMap.get("Project2");
        accessOrderedMap.get("Project2");
        accessOrderedMap.get("Project3");
        Sysem.out.println("Iterate over should be not afected:");
        accessOrderedMap.forEach( (k,v) -> {
            Sysem.out.println(k +":" + v);
        });
        // 触发删除
        accessOrderedMap.put("Project4", "Mission Control");
        Sysem.out.println("Oldes entry should be removed:");
        accessOrderedMap.forEach( (k,v) -> {// 遍历顺序不变
            Sysem.out.println(k +":" + v);
        });
    }
}
```

- 对于 TreeMap，它的整体顺序是由键的顺序关系决定的，通过 Comparator 或 Comparable（自然顺序）来决定。

之前提到过构建一个具有优先级的调度系统的问题，其本质就是一个典型的优先队列场景，Java 标准库提供了基于二叉堆实现的 `PriorityQueue`，它们都是依赖于同一种排序机制，当然也包括 TreeMap 的马甲 TreeSet。

类似 hashCode 和 equals 的约定，为了避免模棱两可的情况，自然顺序同样需要符合一个约定，就是 compareTo 的返回值需要和 equals 一致，否则就会出现模棱两可的情况。

可以分析 TreeMap 的 put 方法实现：

```java
public V put(K key, V value) {
    Entry<K,V> t = …
        cmp = k.compareTo(t.key);
    if (cmp < 0)
        t = t.left;
    else if (cmp > 0)
        t = t.right;
    else
        return t.setValue(value);
    // ...
}
```

从代码中可以看出，当我们不遵守约定时，两个不符合唯一性（equals）要求的对象被当作是同一个（因为，compareTo 返回 0），这会导致歧义的行为表现。

## HashMap 的源码分析

主要围绕以下几点：

- HashMap 内部实现基本点分析
- 容量（capacity）和负载系数（load factor）
- 树化

首先，看看 HahsMap 内部的结构，它可以看作是数组（`Node[] table`）和链表结合组成的符合结构，数组被分为一个个桶（bucket），通过哈希值决定了键值对在这个数组的寻址；哈希值相同的键值对，则以链表形式存储，参考下面的示意图。这里需要注意的是，如果链表大小超过了阈值（TREEIFY_THRESHOLD, 8），图中的链表就会被改造成树型结构。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220605112750.png)

从非拷贝构造函数的实现来看，这个表格（数组）似乎并没有在最初就初始化好，仅仅设置了一些初始值而已。

```java
public HashMap(int initialCapacity, float loadFactor) {
    // ......
    this.loadFactor = loadFactor;
    this.threshold = tableSizeFor(initialCapacity);
}
```

所以，我们深刻怀疑，HashMap 也许是按照 `lazy-load` 原则，在首次使用时被初始化（拷贝构造函数除外，我这里仅介绍最通用的场景）。既然如此，我们去看看 put 方法实现，似 乎只有一个 putVal 的调用：

```java
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}
```

看来主要的密码似乎藏在 putVal 里面，下面进行分析：

```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
               boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length;
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    else {
        // ...
        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
            treeifyBin(tab, hash);
        // ...
    }
    ++modCount;
    if (++size > threshold)
        resize();
    afterNodeInsertion(evict);
    return null;
}
```

从 putVal 的最初几行，可以看出来：

- 如果表格是 null，resize 方法会负责初始化它，这从 `tab = resize()` 可以看出；
- resize 方法兼顾两个职责，创建初始存储表格，或者在容量不满足需求的时候，进行扩容（resize）；
- 在放置新的键值对的过程中，如果发生下面条件，就会发生扩容：

```java
if (++size > threshold)
    resize();
```

- 具体键值在哈希表中的位置（数组 index）取绝于下面的位运算：

```java
i = (n - 1) & hash
```

仔细观察哈希值的源头，我们会发现，它并不是 key 本身的 hashCode，而是来自于 HashMap 内部的另一个方法 `hash()`。注意，为什么这里需要将高位数据移位到低位进行异或运算呢？因为有些数据计算出的哈希值差异主要在高位，而 HashMap 里的哈希寻址是忽略容量以上的高位的，那么这种处理就可以有效避免类似情况下的哈希碰撞：

```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

- 前面提到的链表结构（这里叫 bin），会在达到一定门限值时，发生树化。

可以看到，putVal 方法本身逻辑非常集中，从初始化、扩容到树化，全部和它有关。

进一步分析身兼多职的 resize 方法：

```java
final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;
    if (oldCap > 0) {
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                 oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // double threshold
    }
    else if (oldThr > 0) // initial capacity was placed in threshold
        newCap = oldThr;
    else {               // zero initial threshold signifies using defaults
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                  (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr;
    @SuppressWarnings({"rawtypes","unchecked"})
    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    // 数据移动到新的数组结构 e 中
    return newTab;
}
```

依据 resize 源码，不考虑极端情况（容量理论最大极限由 MAXIMUM_CAPACITY 指定 ，数值 1 << 30，也就是 2 的 30 次方），我们可以归纳为：

- 门限值等于（负载因子）X （容量），如果构建 HashMap 的时候没有指定它们，那么就是依据相应的默认常量值；
- 门限通常是以倍数调整（`newThr = oldThr << 1`），前面提到，根据 putVal 的逻辑，当元素个数超过门限大小时，则调整 Map 大小；
- 扩容后，需要价格呢老的数组中的元素重新放置到新的数组，这时扩容的一个主要开销来源。

## 容量、负载因子和树化

思考一下，为什么需要考虑容量和负载因子？

这是因为容量和负载系数决定了可用的桶的数量，空桶太多会浪费空间，如果使用的太满则会严重影响操作的性能。极端情况下，假设只有一个桶，那么它就退化成了链表，完全不 能提供所谓常数时间存的性能。

既然容量和负载因子这么重要，我们在实践中应该如何选择呢？

如果能够知道 HashMap 要存取的键值对数量，可以考虑预先设置合适的容量大小。具体数值我们可以根据扩容发生的条件来做简单预估，根据前面的代码分析，我们知道它需要符合 计算条件：

```
负载因子 * 容量 > 元素数量
```

所以，预先设置的容量需要满足，大于 "预估元素数量 / 负载因子"，同时它也是 2 的幂数，结论已经非常清晰了。

而对于负载因子：

- 如果没有特别需求，不要轻易进行更改，因为 JDK 自身的默认负载因子是非常符合通用场景的需求的；
- 如果确实需要调整，建议不要设置超过 0.75 的数值，因为会显著增加冲突，降低 HashMap 的性能；
- 如果使用太小的负载因子，按照上面的公式，预设容量值也进行调整，否则可能会导致更加频繁的扩容，增加无谓的开销，本身访问性能也会受影响。

前面还提到了树化改造，对应逻辑主要在 `putVal` 和 `treeifyBin` 方法中：

```java
final void treeifyBin(Node<K,V>[] tab, int hash) {
    int n, index; Node<K,V> e;
    if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
        resize();
    else if ((e = tab[index = (n - 1) & hash]) != null) {
        // 树化改造逻辑
    }
}
```

综合两个方法，树化改造的逻辑就非常清晰了，可以理解为，当 bin 的数量大于 `TREEIfY_THRESHOLD` 时：

- 如果容量小于 `MIN_TREEIFY_CAPACITY`，只会进行简单的扩容；
- 如果容量大于 `MIN_TREEIFY_CAPACITY`，则会进行树化改造。

那么，为什么 HashMap 要树化呢？

本质上这是个安全问题。因为在元素放置过程中，如果一个对象哈希冲突，都被放置到同一个桶里，则会形成一个链表，我们知道链表查询是线性的，会严重影响存取的性能。

而在现实世界，构造哈希冲突的数据并不是非常复杂的事情，恶意代码就可以利用这些数据大量与服务器端交互，导致服务器端CPU大量占用，这就构成了哈希碰撞拒绝服务攻击， 国内一线互联网公司就发生过类似攻击事件。

## 解决哈希冲突的主要方法

（1）开放定址法

基本思想：当关键字 key 的哈希地址 `p = H(key)` 出现冲突时，产生另一个哈希地址 p1，如果 p1 仍然冲突，再以 p1 为基础，产生另一个哈希地址 p2，...，直到找到一个不冲突的哈希地址 pi，将相应元素存入其中。

（2）再哈希法

这种方法是同时构造多个不同的哈希函数：Hi = RH1(key) i = 1, 2, ... , K

当哈希地址 Hi = RH1(key) 发生冲突时，再计算 Hi=RH2(key) ......，知道冲突不再产生。这种方法不易产生聚集，但增加了计算时间。

（3）链地址法

基本思想：将所有哈希地址为 i 的元素构成一个称为同义词链的单链表，并将单链表的头指针存在哈希表的第 i 个单一，因而查找、插入和删除主要在同义词链中进行。

链地址法适用于经常进行插入和删除的情况。

（4）建立公共溢出区

基本思想：将哈希表分为基本表和溢出表两部分，凡是和基本表发生冲突的元素，一律填入溢出表。

## 总结

`Hashtable`、`HashMap`、`TreeMap`

三者均实现了 Map 接口，存储的内容是基于 key-value 的键值对映射，一个映射不能有重复键，一个键最多只能映射一个值。

（1）元素特性

HashTable 中的 key、value 都不能为 null；HashMap 中的 key、value 可以为 null，很显然只能有一个 key 为 null 的键值对，但是允许有多个值为 null 的键值对；TreeMap 中当未实现 Comparator 接口时，key 不可以为 null；当实现 Comparator 接口时，若未对 null 情况进行判断，则 key 不可以为 null，反之亦然。

（2）顺序特性

HashTable、HashMap 具有无序特性。TreeMap 是利用红黑树来实现的（树中的每个节点的值，都会大于或等于它的左子树中的所有节点的值，并且小于或等于它的右子树中的所有节点的值），实现了 SortMap 接口，能够对保存的记录根据键进行排序。所以一般需要排序的情况下是选择 TreeMap 来存储，默认为升序排序方式（深度优先搜索），可自定义实现 Comparator 接口实现排序方式。

（3）初始化与增长方式

初始化时：HashTable 在不指定容量的情况下的默认容量为 11，且不要求底层数组的容量一定要为 2 的整数次幂；HashMap 默认容量为 16，且要求容量一定为 2 的整数次幂。 扩容时：Hashtable 将容量变为原来的 2 倍加 1；HashMap 扩容将容量变为原来的 2 倍。

（4）线程安全性

HashTable 其方法函数都是同步的（采用 synchronized 修饰），不会出现两个线程同时对数据进行操作的情况，因此保证了线程安全性。也正因为如此，在多线程运行环境下效率表现非常低下。因为当一个线程访问 HashTable 的同步方法时，其他线程也访问同步方法就会进入阻塞状态。比如当一个线程在添加数据时候，另外一个线程即使执行获取其他数据的操作也必须被阻塞， 大大降低了程序的运行效率，在新版本中已被废弃，不推荐使用。 HashMap 不支持线程的同步，即任一时刻可以有多个线程同时写 HashMap; 可能会导致数据的不一致。如果需要同步：

- 可以用 Collections 的 synchronizedMap 方法；
- 使用 ConcurrentHashMap 类，相较于 HashTable 锁住的是对象整体， ConcurrentHashMap 基于 lock 实现锁分段技术。首先将 Map 存放的数据分成一段一段的存储方式，然后给每一段数据分配 一把锁，当一个线程占用锁访问其中一个段的数据时，其他段的数据也能被其他线程访问。ConcurrentHashMap 不仅保证了多线程运行环境下的数据访问安全性，而且性能上有长足的提升。

（5）一段话概括 HashMap

HashMap基于哈希思想，实现对数据的读写。当我们将键值对传递给 `put()` 方法时，它调用键对象的 `hashCode()` 方法来计算 hashcode，然后找到 bucket 位置来储存值对象。当获取对象时， 通过键对象的 `equals()` 方法找到正确的键值对，然后返回值对象。HashMap 使用链表来解决碰撞问题，当发生碰撞了，对象将会储存在链表的下一个节点中。 HashMap 在每个链表节点中储存键值对对象。当两个不同的键对象的 hashcode 相同时，它们会储存在同一个 bucket 位置的链表中，可通过键对象的 `equals()` 方法用来找到键值对。如果链表大小超过阈值 （TREEIFY_THRESHOLD, 8），链表就会被改造为树形结构。

# 10、分析 ConcurrentHashMap

之前了解的 Java 集合，大多数都不是线程安全的，仅有少量的实现了线程安全，比如 Vector、Stack，但是在性能方面也不尽人意。幸好 Java 语言提供了并发包（`java.util.concurrent`），为高度并发需求提供了更加全面的工具支持。

另外，更加普遍的选择是利用并发包提供的线程安全容器类，它提供了：

- 各种并发容器，比如 `ConcurrentHashMap`、`CopyOnWriteArrayList`；
- 各种线程安全队列（Queue/Deque），如 `ArrayBlockingQueue`、`SynchronousQueue`；
- 各种有序容器的线程安全版本等。

具体保证线程安全的方式，包括有从简单的 synchronize 方式，到基于更加精细化的，比如基于读写分离锁实现的 ConcurrentHashMap 等并发实现等。具体选择要看开发的场景需求， 总体来说，并发包内提供的容器通用场景，远优于早期的简单同步实现。

上面只是简单总结，要深入思考这个问题，至少需要：

- 理解基本的线程安全工具；
- 理解传统集合框架并发编程中 Map 存在的问题，清楚简单同步方式的不足；
- 梳理并发包内，尤其是 ConcurrentHashMap 采取了哪些方法来提高并发表现；
- 最好能够掌握 ConcurrentHashMap 自身的演进，目前很多分析资料还是基于其早期版本。

## 为什么需要 ConcurrentHashMap

Hashtable 本身比较低效，因为它的实现基本就是将 put、get、size 等各种方法加上 “synchronized”。简单来说，这就导致了所有并发操作都要竞争同一把锁，一个线程在进行同步操作时，其他线程只能等待，大大降低了并发操作的效率。 前面已经提过 HashMap 不是线程安全的，并发情况会导致类似 CPU 占用 100% 等一些问题，那么能不能利用 Collections 提供的同步包装器来解决问题呢？

我们可以看看 Collections 工具类中对 Map 的同步包装器：

```java
private static class SynchronizedMap<K,V>
    implements Map<K,V>, Serializable {
    private static final long serialVersionUID = 1978198479659022715L;

    private final Map<K,V> m;     // Backing Map
    final Object      mutex;        // Object on which to synchronize

    // ...

    public int size() {
        synchronized (mutex) {return m.size();}
    }
    
    // ...
}
```

不难发现这里的同步包装器中操作虽然不再声明为 synchronized 方法（以 "this" 作为锁），但是却换成利用一个 mutex 对象作为锁，没有任何真正意义上的改进！

所以，Hashtable或者同步包装版本，都只是适合在非高度并发的场景下。

## ConcurrentHashMap 分析

### JDK 7

我们再来看看 ConcurrentHashMap 是如何实现的，为什么它能够大大提高并发效率。

首先，ConcurrentHashMap 的设计实现其实一直在演化，比如在Java 8中就发生了非常大的变化（Java 7 其实也有不少更新），所以，我这里将比较分析结构、实现机制等方面，对比不同版本的主要区别。

早期 ConcurrentHashMap，其实现是基于：

- 分离锁，也就是将内部进行分段（Segment），里面则是 HashEntry 的数组，和 HashMap 类似，哈希相同的条目也是以链表形式存放。
- HashEntry 内部使用 volatile 的 value 字段来保证可见性，也利用了不可变对象的机制以改进利用 Unsafe 提供的底层能力，比如 volatile access，去直接完成部分操作，以最优化性能，毕竟 Unsafe 中的很多操作都是 JVM  intrinsic 优化过的。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220605153706.png)

在构造的时候，Segment 的数量由所谓的 concurrentcyLevel 决定，默认是 16，也可以在相应构造函数中指定，注意，Java 需要它是 2 的幂数值，如果输入是类似 15 这种，会被自动调整到 16 之类的 2 的幂数值。

具体情况，可以参看 Map 基本操作的源码，下面是 JDK 7 中的 get 代码，由于 get 操作只需要保证数据可见性，所以并没有什么同步逻辑：

```java
public V get(Object key) {
    Segment<K,V> s; // manually integrate access methods to reduce overhead
    HashEntry<K,V>[] tab;
    int h = hash(key.hashCode());
    //利用位操作替换普通数学运算
    long u = (((h >>> segmentShift) & segmentMask) << SSHIFT) + SBASE;
    // 以 Segment 为单位，进行定位
    // 利用 Unsafe 直接进行 volatile access
    if ((s = (Segment<K,V>)UNSAFE.getObjectVolatile(segments, u)) != null &&
        (tab = s.table) != null) {
        //省略
    }
    return null;
}
```

而对于 put 操作，首先是通过二次哈希避免哈希冲突，然后以 Unsafe 的调用方式，直接获取对应的 Segment，然后进行线程安全的 put 操作：

```java
public V put(K key, V value) {
    Segment<K,V> s;
    if (value == null)
        throw new NullPointerException();
    // 二次哈希，以保证数据的分散性，避免哈希冲突
    int hash = hash(key.hashCode());
    int j = (hash >>> segmentShift) & segmentMask;
    if ((s = (Segment<K,V>)UNSAFE.getObject // nonvolatile; recheck
         (segments, (j << SSHIFT) + SBASE)) == null) // in ensureSegment
        s = ensureSegment(j);
    return s.put(key, hash, value, false);
}
```

其核心实现逻辑在下面的方法中：

```java
fnal V put(K key, int hash, V value, boolean onlyIfAbsent) {
    // scanAndLockForPut 会去查找是否有 key 相同的 Node
    // 无论如何，确保获取锁
    HashEntry<K,V> node = tryLock() ? null :
    scanAndLockForPut(key, hash, value);
    V oldValue;
    try {
        HashEntry<K,V>[] tab = table;
        int index = (tab.length - 1) & hash;
        HashEntry<K,V> frs = entryAt(tab, index);
        for (HashEntry<K,V> e = frs;;) {
            if (e != null) {
                K k;
                // 更新已有value...
            }
            else {
                // 放置HashEntry到特定位置，如果超过阈值，进行rehash
                // ...
            }
        }
    } fnally {
        unlock();
    }
    return oldValue;
}
```

所以，从上面的源码清晰的看出，在进行并发写操作时：

- ConcurrentHashMap 会获取可重入锁，以保证数据一致性，Segment 本身就是基于 ReentrantLock 的扩展实现，所以，在并发修改期间，相应 Segment 是被锁定的；
- 在最初阶段，进行重复性的扫描，以确定相应 key 值是否已经在数组里面，进而决定是更新还是放置操作，你可以在代码里看到相应的注释。重复扫描、检测冲突是 ConcurrentHashMap 的常见技巧。
- 前面介绍 HashMap 的时候，提到了可能发生的扩容问题，在 ConcurrentHashMap 中同样存在。不过有一个明显区别，就是它进行的不是整体的扩容，而是单独对 Segment 进行扩容，细节就不介绍了。

另外一个就是 Map 的 size 方法同样需要关注，它的实现涉及分离锁的一个副作用。

试想，如果不进行同步，简单的计算所有 Segment 的总值，可能会因为并发 put，导致结果不准确，但是直接锁定所有 Segment 进行计算，代价就会变得非常昂贵。其实，分离锁也限制了Map的初始化等操作。

所以，ConcurrentHashMap 的实现是通过重试机制（RETRIES_BEFORE_LOCK，指定重试次数 2），来试图获得可靠值。如果没有监控到发生变化（通过对比 Segment.modCount），就直接返回，否则获取锁进行操作。

### JDK 8

下面来对比一下，在 Java 8 和之后的版本中，ConcurrentHashMap 发生了哪些变化呢？

- 总体结构上，它的内部存储变得和 HashMap 结构非常相似，同样是大的桶（bucket）数组，然后内部也是一个个所谓的链表结构（bin），同步的粒度要更细致一些；
- 其内部仍然有 Segment 定义，但仅仅是为了保证序列化时的兼容性而已，不再有任何结构上的用处；
- 因为不再使用 Segment，初始化操作大大简化，修改为 lazy-load 形式，这样可以有效避免初始开销，解决了老版本很多人抱怨的这一点；
- 数据存储利用 volatile 来保证可见性；
- 使用 CAS 等操作，在特定场景进行无锁并发操作；
- 使用 Unsafe、LongAdder 之类底层手段，进行极端情况的优化。

先看看现在的数据存储内部实现，我们可以发现 Key 是 final 的，因为在生命周期中，一个条目的 Key 发生变化是不可能的；与此同时 val，则声明为 volatile，以保证可见性。

```java
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    volatile V val;
    volatile Node<K,V> next;
    // ...
}
```

这里就不再介绍 get 方法和构造函数了，相对比较简单，重点看并发的 put 是如何实现的。

```java
final V putVal(K key, V value, boolean onlyIfAbsent) {
    // ...
    int hash = spread(key.hashCode());
    int binCount = 0;
    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f; int n, i, fh; K fk; V fv;
        if (tab == null || (n = tab.length) == 0)
            tab = initTable();
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            // 如果 bin 是空的就利用 CAS 去进行无锁线程安全操纵
            if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value)))
                break;                   // no lock when adding to empty bin
        }
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);
        else if (onlyIfAbsent // 不加锁，进行检查
                 && fh == hash
                 && ((fk = f.key) == key || (fk != null && key.equals(fk)))
                 && (fv = f.val) != null)
            return fv;
        else {
            V oldVal = null;
            synchronized (f) {
                // 细粒度的同步修改操作...
            }
            // Bin 超过阈值, 进行树化
            if (binCount != 0) {
                if (binCount >= TREEIFY_THRESHOLD)
                    treeifyBin(tab, i);
                if (oldVal != null)
                    return oldVal;
                break;
            }
        }
    }
    addCount(1L, binCount);
    return null;
}
```

初始化操作实现在 `initTable` 里面，这是一个典型的 CAS 使用场景，利用 volatile 的 sizeCtl 作为互斥手段：如果发现竞争性的初始化，就 spin 在那里，等待条件恢复；否则利用 CAS 设置排他标志。如果成功则进行初始化；否则重试。

参考以下代码：

```java
private final Node<K,V>[] initTable() {
    Node<K,V>[] tab; int sc;
    while ((tab = table) == null || tab.length == 0) {
        // 如果发现冲突，进行 spin（自旋） 等待
        if ((sc = sizeCtl) < 0)
            Thread.yield(); // lost initialization race; just spin
        // CAS 成果返回 true，则进入真正的初始化逻辑
        else if (U.compareAndSetInt(this, SIZECTL, sc, -1)) {
            try {
                if ((tab = table) == null || tab.length == 0) {
                    int n = (sc > 0) ? sc : DEFAULT_CAPACITY;
                    @SuppressWarnings("unchecked")
                    Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                    table = tab = nt;
                    sc = n - (n >>> 2);
                }
            } finally {
                sizeCtl = sc;
            }
            break;
        }
    }
    return tab;
}
```

当 bin 为空时，同样是没有必要锁定，也是以 CAS 操作去放值。

你有没有注意到，在同步逻辑上，它使用的是 synchronized，而不是通常建议的 ReentrantLock 之类，这是为什么呢？现代 JDK 中，synchronized 已经被不断优化，可以不再过分担心性能差异，另外，相比于 ReentrantLock，它可以减少内存消耗，这是个非常大的优势。

与此同时，更多细节实现通过使用 Unsafe 进行了优化，例如 tabAt 就是直接利用 `getObjectAcquire`，避免间接调用的开销。

```java
static final <K,V> Node<K,V> tabAt(Node<K,V>[] tab, int i) {
    return (Node<K,V>)U.getObjectAcquire(tab, ((long)i << ASHIFT) + ABASE);
}
```

在看看，限制是如何实现 size 操作的，从源码中可以看到真正的逻辑在 `sumCount` 方法中：

```java
public int size() {
    long n = sumCount();
    return ((n < 0L) ? 0 :
            (n > (long)Integer.MAX_VALUE) ? Integer.MAX_VALUE :
            (int)n);
}

final long sumCount() {
    CounterCell[] cs = counterCells;
    long sum = baseCount;
    if (cs != null) {
        for (CounterCell c : cs)
            if (c != null)
                sum += c.value;
    }
    return sum;
}
```

我们发现，虽然思路仍然和以前类似，都是分而治之的进行计数，然后求和处理，但实现却基于一个奇怪的 CounterCell。 难道它的数值，就更加准确吗？数据一致性是怎么保证的？

```java
/**
 * A padded cell for distributing counts.  Adapted from LongAdder
 * and Striped64.  See their internal docs for explanation.
 */
@jdk.internal.vm.annotation.Contended static final class CounterCell {
    volatile long value;
    CounterCell(long x) { value = x; }
}
```

其实，对于 `CounterCell` 的操作，是基于 `java.util.concurrent.atomic.LongAdder` 进行的，是一种 JVM 利用空间换取更高效率的方法，利用了 [Striped64](http://hg.openjdk.java.net/jdk/jdk/file/12fc7bf488ec/src/java.base/share/classes/java/util/concurrent/atomic/Striped64.java) 内部的复杂逻辑。这个东西非常小众，大多数情况下，建议还是使用 `AtomicLong`，足以满足绝大部分应用的性能需求。

## 使用 ConcurrentHashMap 的场景



## 总结

（1）JDK 8 之后的锁的颗粒度，它是加在链表头上的，这是一个思路上的突破；

（2）自旋锁个人理解的是 cas 的一种应用方式。并发包中的原子类是典型的应用；

（3）偏向锁个人理解的是获取锁的优化。在 ReentrantLock 中用于实现已获取完锁的的线程重入问题；

> （4）1.7 和 1.8

Java 1.7 

put 加锁：通过分段加锁 Segment，一个 HashMap 里有若干个 Segment，每个 Segment 里有若干个桶，桶里存放 K-V 形式的链表，put 数据时通过 key 哈希得到该元素要添加到的 Segment，然后对 Segment 进行加锁，然后再次哈希，计算得到给元素要添加到的桶，然后遍历桶中的链表，替换或新增节点到桶中；

 size 分段计算两次，两次结果相同则返回，否则对所有分段加锁重新计算。

Java 1.8 

put CAS 加锁： 1.8中不依赖 Segment 加锁，Segment 数量与桶数量一致； 首先判断容器是否为空，为空则进行初始化利用 volatile 的 sizeCtl 作为互斥手段，如果发现竞争性的初始化，就暂停在那里，等待条件恢复，否则利用CAS设置排他标志 （`U.compareAndSwapInt(this, SIZECTL, sc, -1)`）; 否则重试，对 key hash 计算得到该 key 存放的桶位置，判断该桶是否为空，为空则利用 CAS 设置新节点 否则使用 synchronize 加锁，遍历桶中数据，替换或新增加点到桶中，最后判断是否需要转为红黑树，转换之前判断是否需要扩容； 

size 则是利用 LongAdd 累加计算。

（5）发展史

- JDK 1.5 并发包；
- JDK 1.6 对 synchronized 改进；
- JDK 1.7 的并发 Map 的分段锁；
- JDK 1.8 的 CAS + sychronized；

 