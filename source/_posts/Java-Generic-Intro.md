---
title: Java Generic Intro
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210731221513.jpg'
coverImg: /img/20210731221513.jpg
toc: true
date: 2021-07-31 22:14:43
top: false
cover: false
summary: Java 泛型简介
categories: Java
keywords: Java
tags: Java
---

# 泛型

泛型：是一种未知的数据类型，当我们不知道使用什么数据类型的时候，可以使用泛型。

泛型也可以看成是一种变量，用来接收数据类型。



集合类型默认使用的就是泛型，如果不使用泛型：

- 好处：集合不使用泛型，默认就是 Object，可以存储任何类型的数据
- 弊端：不安全（向下转型），会引发异常



如果使用泛型：

- 好处：避免了类型转换的麻烦，存储的是什么类型，取出就是什么类型
- 把运行期异常，提升到了编译期



## 1、泛型类

```java
public class Generic_Class {

    public static void main(String[] args) {

        One<String> alice = new One<>("Alice");

        System.out.println(alice.getName());
    }
}

class One<E> {
    
    private E name;
    
    public One(E name) {
        this.name = name;
    }

    public void setName(E name) {
        this.name = name;
    }

    public E getName() {
        return name;
    }
}
```



## 2、泛型方法

定义格式：

> 修饰符 <代表泛型的变量> 返回值类型 方法名（参数）{ }



```java
public class Generic_Method {
    
    public static <T> void show1(T t) {
        System.out.println(t.getClass());
    }
    
    public static <T> T show2(T t) {
        return t;
    }

    public static void main(String[] args) {
        
        show1("111");

        Integer integer = show2(1);
        
        System.out.println(integer);
    }
}
```



## 3、泛型接口

定义格式：

> 修饰符 interface 接口名<代表泛型的变量> {}



```java
public class Generic_Interface {

    public static void main(String[] args) {
        
        GenericInterface<String> generic = new MyClass<>();
        
        generic.add("张三");
        generic.add("李四");
        generic.add("王五");

        System.out.println(generic.get(0));
        System.out.println(generic.get(1));
        System.out.println(generic.get(2));

        System.out.println("====================");
        
        Iterator<String> iterator = generic.iterator();
        
        while (iterator.hasNext()) {
            System.out.print(iterator.next() + ", ");
        }
    }
}

interface GenericInterface<E> {
    
    void add(E e);
    
    E get(int i);
    
    Iterator<E> iterator();
}

class MyClass<E> implements GenericInterface<E> {
    
    List<E> list = new ArrayList<>(); 
    
    @Override
    public void add(E e) {
        list.add(e);
    }

    @Override
    public E get(int i) {
        return list.get(i);
    }

    @Override
    public Iterator<E> iterator() {
        return list.iterator();
    }

}
```



第一种使用方式：

- 定义接口的实现类，实现接口，指定接口的泛型

第二种使用方式：

- 接口使用什么泛型，实现类就使用什么泛型，类跟着接口走，就相当于定义了一个含有泛型的类，创建对象的时候确定泛型的类型



## 4、泛型通配符

当使用泛型类或者接口时，传递的数据中，泛型类型不确定，可以通过通配符 `<?>` 表示，但是一旦使用泛型的通配符后，只能使用 `Object` 类中的共性方法，集合中元素自身的方法无法使用。



> 通配符的基本使用

泛型的通配符：不知道使用什么泛型来接收的时候，此时可以使用 ？，？ 表示未知通配符。

此时只能接收数据，不能向集合中存储数据



**泛型是没有继承的概念的。**



```java
public class API_Wildcard {
    
    public static void getElement(Collection<?> coll) {
        // ? 表示可以接收任何类型
        // 但是只能用 Object 来表示，不能使用泛型类型的特有方法
        for (Object o : coll) {
            System.out.println(o);
        }
    }

    public static void main(String[] args) {
     
        Collection<Integer> list1 = new ArrayList<>();
        list1.add(1);
        list1.add(2);
        list1.add(3);

        getElement(list1);
        
        Collection<String> list2 = new ArrayList<>();
        list2.add("one");
        list2.add("two");
        list2.add("three");

        getElement(list2);
    }
}
```



## 5、泛型通配符高级使用

> 受限泛型

在 Java 中我们可以为泛型指定一个泛型的 **上限** 和 **下限**。



**泛型的上限：**

- 格式：<font style="color:red;">类型名称 <? extends 类> 对象名称</font> 
- 意义：<font style="color:red;">只能接收该类型及其子类</font>

**泛型的下限：**

- 格式：<font style="color:red;">类型名称 <? super 类> 对象名称</font>
- 意义：<font style="color:red;">只能接收该类型及其父类型</font>

