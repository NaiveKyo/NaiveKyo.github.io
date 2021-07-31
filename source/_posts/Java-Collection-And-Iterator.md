---
title: Java Collection And Iterator
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210731222044.jpg'
coverImg: /img/20210731222044.jpg
toc: true
date: 2021-07-31 22:20:23
top: false
cover: false
summary: Java 集合框架之 Collection 概要 & 迭代器简介 
categories: Java
keywords: Java
tags: Java
---

集合按照其存储结构可以分类两大类：

- 单列集合 `java.util.Collection` 
- 双列集合 `java.util.Map`



这里先介绍 `Collection`

## 一、Collection

- **Collection**：单列集合类的根接口，用于存储一系列符合某种规则的元素，它有两个重要的子接口
  - `java.util.List` ：元素有序、元素可重复
  - `java.util.Set` ： 元素无序而且不可重复

- **List 接口**
  - 有序的集合：存储和取出的顺序相同
  - 允许存储重复的元素
  - 有索引，可以使用普通的 for 循环遍历
- **Set 接口**
  - 不允许存储重复元素
  - 没有索引（不能使用普通的 for 循环遍历）



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210731211453.png)

集合框架的学习方式：

1. 学习顶层：学习顶层接口/抽象类中共性的方法，所有的子类都可以使用
2. 使用底层：底层不是接口就是抽象类，无法创建对象直接使用，需要使用底层的子类创建对象使用



## 二、Iterator 迭代器

迭代器用于遍历集合中的所有元素：`java.util.Iterator` 接口。

想要遍历 `Collection` 集合，就要获取该集合的迭代器完成迭代操作，获取迭代器的方法：

- `public Iterator iterator()`：获取集合对应的迭代器，用于遍历集合中的元素





### 1、迭代的概念

- **迭代**：Collection 集合元素的通用获取方式。在取元素之前先判断集合中有没有元素，如果有就取出来，继续判断，直到把所有元素取出来。这种获取方式的术语就是迭代。



`Iterator` 接口常用方法：

- `public E next()`：返回迭代的下一个元素
- `public boolean hasNext()`：如果仍有元素可以迭代，则返回 true



```java
public class API_Iterator {

    public static void main(String[] args) {

        List<String> list = new ArrayList<>();
        
        list.add("Hello");
        list.add("World");
        list.add("Java");
        list.add("C++");
        
        // 迭代
        Iterator<String> iterator = list.iterator();
        
        while (iterator.hasNext()) {
            System.out.println(iterator.next());
        }
    }
}
```



### 2、迭代器的原理

- 获取 Collection 的迭代器对象
- Iterator 对象会把指针（索引）指向集合的 <strong>-1</strong> 索引
- `hasNext()`： 判断下一个索引指向的位置有没有元素
- `next()`：做了两件事，取出当前索引指向的元素，同时将索引向后移动一位



### 3、增强 for 循环

增强 for 循环，底层用的也是迭代器，只不过简化了迭代器的缩写。

是 JDK 1.5 后新出的特性：

```java
public class API_EnhanceFor {

    public static void main(String[] args) {

        String[] arr = {"1", "2", "3", "4", "5", "6", "7"};

        List<String> list = Arrays.asList(arr);

        for (String s : list) {
            System.out.println(s);
        }
    }
}
```

