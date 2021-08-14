---
title: Java Static Keyword Intro
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210730105640.jpg'
coverImg: /img/20210730105640.jpg
toc: true
date: 2021-07-30 10:56:20
top: false
cover: false
summary: Java static 关键字简介
categories: Java
keywords: Java
tags: Java
---

# Java static 关键字



## 1、内存图

静态 static 的内存：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210729085740.png)

 

## 2、静态代码块

```java
/**
 * 静态代码块
 * 
 * 特点：当第一次调用到本类时，静态代码块执行唯一的一次
 * 静态内容总是优先于非静态 
 * 
 * 静态代码块的典型用途：
 *  用来一次性地对静态成员变量进行赋值
 */
public class Person {
    
    static {
        System.out.println("静态代码块执行!");
    }
    
    public Person() {
        System.out.println("构造方法执行!");
    }

    public static void main(String[] args) {
        new Person();
    }
}
```

