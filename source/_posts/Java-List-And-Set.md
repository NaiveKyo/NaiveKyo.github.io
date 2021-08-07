---
title: Java List And Set
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210806224955.jpg'
coverImg: /img/20210806224955.jpg
toc: true
date: 2021-08-06 22:49:18
top: false
cover: false
summary: 复习 Java 的 List 和 Set 集合相关知识
categories: Java
keywords: 
 - Java
 - List
 - Set
tags: Java
---

# 数据结构

和集合相关的数据结构：

- 栈
- 队列
- 数组
- 链表
- 红黑树



## 1、栈

- **栈，Stack**，又称作堆栈，它是运算受限的线性表，其限制是仅允许在表的一端进行插入和删除操作，不允许在其他任何地方进行添加、查找、删除等操作
- 先进后出



## 2、队列

- **队列，Queue**，简称队，它也是一种运算受限的线性表，其限制是只允许在表的一端进行插入，另一端进行删除
- 先进先出



## 3、数组

- **数组，Array**，是有序的元素序列，数组是在内存中开辟的一段连续的空间，并在此空间内存放元素。
- 查找元素时间复杂度 `O(1)`：通过索引，可以快速访问指定位置的元素
- 增删元素慢：不管是执行添加还是删除操作，除非极端情况，否则都会影响到其他所有元素。





## 4、链表

- **链表，Linked List**，由一系列结点 Node（链表中每一个元素都称为结点）组成，结点可以在运行时动态生成，每个结点包括两部分：一个是存储数据元素的数据域，另一个是存储下一个结点的指针域。我们常说的链表结构有 **单向链表** 和 **双向链表**。
- 多个结点之间通过地址进行连接
- 查找元素慢：需要从链表头部开始沿着链向后寻找
- 增删元素块：增加和删除只会影响前后两个结点



## 5、红黑树

- **二叉树，Binary Tree**，是每个结点不超过 2 的有序树

红黑树是一种特殊的二叉树，它是一棵二叉查找树。



我们先看看几种特殊的树：

> 排序树/查找树

在二叉树的基础上，元素是有大小顺序的，左子树小，右子树大



> 平衡树

左孩子的数量和右孩子的数量相等



> 不平衡树

左孩子的数量不等于右孩子的数量



> 红黑树

二叉查找树

特点：

- 趋近于平衡树，查询的速度非常快，查询叶子节点的最大次数和最小次数不能超过 2 倍

约束条件：

- 节点可以是红色或者黑色
- 根节点是黑色
- 叶子节点也是黑色的
- 每个红色节点的子节点都是黑色的
- 任何一个节点到其每一个叶子节点的所有路径上黑色节点的数量是相同的



# List 和 Set

复习了 `Collection` 接口后，看看它的常见的子类：

- `java.util.List` 集合
- `java.util.Set` 集合



## 一、List 集合

### 1、List 接口介绍

 `java.util.List` 接口继承自 `Collection`，是单列集合的一个重要分支。在 List 集合中允许出现重复元素，所有的元素是以一种线性的方式进行存储的，在程序中可以通过索引来访问集合中指定的元素。另外，List 集合还有一个特点就是元素有序，即元素的存入顺序和取出顺序是一致的。



### 2、List 的子类

> ArrayList 集合

`java.util.ArrayList` 集合存储的结构是数组结构。元素增删慢、查询快



> LinkedList 集合

`java.util.LinkedList` 集合存储的数据结构是链表。方便元素添加、删除

**LinkedList 是一个双向链表。**

- 使用 LinkedList 可以实现栈
- 使用 LinkedList 可以实现队列



> Vector 集合

Vector 是同步（单线程）的，现在了解即可，不需要使用它



## 二、Set 集合

`java.util.Set` 接口和 `java.util.List` 接口一样，同样继承自 `Collection` ，在功能上并没有扩充，但是比 Collection 接口更加严格。

`Set` 接口中元素无序，并且都会以某种规则保证存入的元素不重复。



Set 集合有多个子类，我们主要回顾：

- `java.util.HashSet`
- `java.util.LinkedHashSet`

遍历 Set 集合可以使用迭代器、增加 for



### 1、HashSet 集合

> 简介

`HashSet` 存储的元素是不可重复的，并且所有元素都是无序的（存取顺序不一致）。

`java.util.HashSet` 的底层实现是一个 `java.util.HashMap`

- HashSet 根据对象的哈希值来确定元素在集合中存储的位置，因此具有良好的存取和查找性能。
- 保证元素唯一性的方式依赖于：`hashCode` 和 `equals` 方法



```java
/**
 * Set 接口特点：
 *  1. 不允许存储重复元素
 *  2. 没有索引，不能使用 for 循环遍历
 *  
 * HashSet 特点：
 *  1. 哈希表结构
 *  2. 无序集合
 *  3. 底层不是同步的
 */
public class Set_HashSet {

    public static void main(String[] args) {

        Set<Integer> set = new HashSet<>();

        set.add(1);
        set.add(2);
        set.add(3);
        set.add(2);
        set.add(1);
        
        // 使用迭代器
        Iterator<Integer> iterator = set.iterator();
        
        while (iterator.hasNext()) {
            System.out.println(iterator.next()); // 只有 1，2，3
        }
        System.out.println("==========================");
        
        // 增强 for
        for (Integer integer : set) {
            System.out.println(integer);
        }
    }
}
```



> HashSet 的结构：哈希表

在 JDK 1.8 之前，哈希表底层采用数组 + 链表实现，即使用链表处理冲突。

原理：

- 一个数组，数组的每一个元素都是一个链表

- 存储一个元素，首先根据哈希算法计算出它的 hash 值，这个 hash 值就是数组的一个下标索引，将该元素放入数组对应位置的元素（即链表）上
- 如果两个元素经过计算得到相同的 hash 值，将它们都挂在同一个链表上

但是当 hash 值相等的元素过多时，通过 key 值查找的效率会变低（先找数组，然后沿着链表向后找）。

而 JDK 1.8 中，哈希表存储采用 **数组 + 链表 + 红黑树** 实现，当链表长度查过阈值（8）时，将链表转换为红黑树，这样大大减少的查询时间。



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210801225725.png)





### hash 值

哈希值：是一个十进制的整数，由系统随机给出（就是对象的地址值，是一个逻辑地址，是模拟出来得到的地址，不是数据实际存储的物理地址）**PS：见操作系统相关知识**



而在 Object 类中有这样一个方法，可以获得对象的哈希值

`int hashCode()` 返回该对象的哈希值

```java
public class Set_HashCode {

    public static void main(String[] args) {

        Person person = new Person("Alice", 20);

        System.out.println("HashCode : " + person.hashCode());

        System.out.println(person);
        
        /*
            String 类重写了 Object 类的 hashCode 方法
         */
        String str1 = new String(new char[] {'a', 'b', 'c'});
        String str2 = "abc";
        
        System.out.println(str1 == str2); // false == 比较引用类型时比较的是内存地址
        
        // 由于 String 类重写了 hashCode 方法，所以这两个字符串的哈希值相等
        System.out.println(str1.hashCode());
        System.out.println(str2.hashCode());
        
        // 两个比较特殊的汉字
        String str3 = "重地";
        String str4 = "通话";

        System.out.println(str3 == str4); // false
        
        // 它们的 hash 值相等
        System.out.println(str3.hashCode());
        System.out.println(str4.hashCode());
    }
}

class Person {
    
    private String name;
    
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
}

```

源码：

```java
// 这是一个 Java 的本地操作系统方法，和 JVM 相关
public native int hashCode();

public String toString() {
    return getClass().getName() + "@" + Integer.toHexString(hashCode());
}
```





```java
/**
* Returns a hash code for this string. The hash code for a
* {@code String} object is computed as
* <blockquote><pre>
* s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
* </pre></blockquote>
* using {@code int} arithmetic, where {@code s[i]} is the
* <i>i</i>th character of the string, {@code n} is the length of
* the string, and {@code ^} indicates exponentiation.
* (The hash value of the empty string is zero.)
*
* @return  a hash code value for this object.
*/
public int hashCode() {
  	int h = hash;
  	if (h == 0 && value.length > 0) {
    	char val[] = value;

    	for (int i = 0; i < value.length; i++) {
      	h = 31 * h + val[i];
    	}
    	hash = h;
  	}
  	return h;
}
```

String 重写了生成 hashCode 哈希函数。

如果有需要我们在定义类的时候也可以重写该方法。



### 2、HashSet 存储元素不重复的原理

```java
/**
 * Set 能存储不重复元素的原理
 */
public class Set_Principle {

    public static void main(String[] args) {

        HashSet<String> set = new HashSet<>();
        
        // 调用 add() 方法，会自动调用元素的 hashCode() 和 equals() 方法
        // 前提：存储的元素必须重写 hashCode 和 equals 方法
        
        
        set.add(new String("abc"));
        set.add(new String("abc"));
        set.add("重地");
        set.add("通话");
        set.add("abc");

        System.out.println(set);
    }
}
```

说白了就是利用对象的 `hashCode`，但是有一个前提就是目标元素必须重写 `hashCode()` 和 `equals` 方法，我们这里使用的是 String 类型，包括各种基本类型的封装类在内都重写了 hashCode 和 equals 方法。



在看一个自定义的 JavaBean：如果不重写两个方法，set 中就会存储两个内容相同的对象，如果重写了，set 中只会存储一个对象，虽然在内存地址上两者是不同的，但是在内容上它们是重复的，重写 `hashCode()` 和 `equals()` 方法可以更好的将我们自定义的类同 `HashSet` 或 `HashMap` 结合起来使用。

```java
/**
 * Set 能存储不重复元素的原理
 */
public class Set_Principle {

    public static void main(String[] args) {

        HashSet<Father> set = new HashSet<>();

        set.add(new Father("f1", 40));
        set.add(new Father("f1", 40));
        
        System.out.println(set);
    }
}

class Father {

    private String name;

    private int age;

    public Father() {
    }

    public Father(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "Father{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Father)) return false;

        Father father = (Father) o;

        if (age != father.age) return false;
        return name != null ? name.equals(father.name) : father.name == null;
    }

    @Override
    public int hashCode() {
        int result = name != null ? name.hashCode() : 0;
        result = 31 * result + age;
        return result;
    }
}
```



### 3、LinkedHashSet

`HashSet` 可以保证元素唯一，但是却无法保证存取的顺序一致，如果要求元素有序，可以使用 `HashSet` 的一个子类 `java.util.LinkedHashSet`，它是链表和哈希表组合的一个数据结构。

```java
/**
 * LinkedHashSet 继承自 HashSet
 * 特点：
 *  1. 底层是一个哈希表（数组+链表+红黑树）+链表：多了一条链表用来记录元素的存储顺序
 */
public class Set_LinkedHashSet {

    public static void main(String[] args) {

        // 1. HashSet
        HashSet<String> hashSet = new HashSet<>();
        
        hashSet.add("abc");
        hashSet.add("abc");
        hashSet.add("bbb");
        hashSet.add("ccc");
        
        System.out.println(hashSet); // [ccc, abc, bbb]
        
        // 2. LinkedHashSet
        Set<String> linkedHashSet = new LinkedHashSet<>();

        linkedHashSet.add("abc");
        linkedHashSet.add("abc");
        linkedHashSet.add("bbb");
        linkedHashSet.add("ccc");

        System.out.println(linkedHashSet); // [abc, bbb, ccc]
    }
}
```



## 三、Collections

> 简介

- `java.util.Collections` 是集合工具类，用来对集合进行操作，部分方法如下：
- `public static <T> boolean addAll(Collection<T> c, T... elemtents)`：向集合中添加一些元素
- `public static void shuffle(List<?> list)`：打乱集合顺序
- `public static <T> void sort(List<T> list)`：将集合中元素按照默认规则排序
- `public static <T> void sort(List<T> list, Comparator<? super T>)`：将集合中元素按照指定规则排序



> 比较器 Comparator

[见 Comparable 和 Comparator](https://naivekyo.github.io/2021/07/29/java-comparable-and-comparator/)
