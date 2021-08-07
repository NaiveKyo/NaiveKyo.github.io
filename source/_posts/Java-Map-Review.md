---
title: Java Map Review
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210807102750.jpg'
coverImg: /img/20210807102750.jpg
toc: true
date: 2021-08-07 10:27:07
top: false
cover: false
summary: Java Map 集合基础知识复习
categories: Java
keywords:
 - Java
 - Map
tags: Java
---

# Map

- Map 中的集合称为双列集合
- Map 中的集合，元素是成对存在的，每个元素由键和值两部分组成，通过键可以找到对应的值



## 1、Map 集合常用子类

常用的 `HashMap` 集合 和 `LinkedHashMap` 集合

- **HashMap<K, V>**：存储数据采用的是哈希表结构，元素的存取顺序不能保证一致。由于要保证键的唯一、不重复，需要重写键的 `hashCode()` 方法、`equals()` 方法
- **LinkedHashMap<K, V>**：HashMap 下有个子类 LInkedHashMap，存储数据采用的是哈希表结构 + 链表结构。通过链表结构可以保证元素的存取顺序一致；通过哈希表结构可以保证键的唯一、不重复，需要重写键的 `hashCode()` 方法和 `equals()` 方法



## 2、常用方法

- `public V put(K key, V value)`：把指定的键与指定的值添加到 Map 集合中
- `public V remove(Object key)`：把指定的键所对应的键值对元素从 Map 集合中删除，并返回被删除键的值
- `public V get(Object key)`：根据给定的键，获取对应的值
- `boolean containsKey(Object key)`：判断集合中是否包含指定的键
- `public Set<K> keySet()`：获取 Map 集合中所有的键，存储到 Set 集合中
- `public Set<Map.Entry<K, V>> entrySet()`：获取 Map 集合中所有的键值对对象的集合（Set 集合）



```java
public class Map_HashMap {

    public static void main(String[] args) {

        HashMap<String, String> hashMap = new HashMap<>();
        
        hashMap.put("one", "one");
        // 如果存在 put 两个相同的键，后插入的那个会覆盖之前的
        // hashMap.put("two", "three");
        hashMap.put("two", "two");
        hashMap.put("three", "three");
        hashMap.put("four", "four");

        System.out.println(hashMap.remove("four"));     // four

        System.out.println(hashMap.containsKey("five"));    // false

        // 获取所有 键 的 Set 集合
        Set<String> keySet = hashMap.keySet();

        for (String key : keySet) {
            System.out.format("%s\t", key);
        }

        System.out.println();

        // 获取所有条目（k-v 键值对）
        Set<Map.Entry<String, String>> entrySet = hashMap.entrySet();

        for (Map.Entry<String, String> entry : entrySet) {
            System.out.format("key: %s ---- value: %s\n", entry.getKey(), entry.getValue());
        }
        
        System.out.println();

        System.out.println(hashMap);
    }
}
```



> 补充：Entry 键值对对象

Map 中存放的是两种对象，一种称为 **key（键）**，一种称为 **value（值）**，它们在 Map 中是一一对应的关系，这一对对象又称作 Map 中的一个 **Entry（项）**。`Entry` 将键值对的对应关系封装成了对象。即键值对对象。



> 补充：HashMap 存储自定义对象

要求：**作为 key 的元素，必须重写 hashCode 和 equals 方法。**



## 3、LinkedHashMap

HashMap 可以保证元素成对唯一，并且查询速度很快，但是成对的元素放进去没有顺序，如果既要保证有序，又要保证速度，就可以使用 HashMap 的一个子类 LinkedHashMap，它是链表和哈希表组合的一个数据结构。



```java
public class Map_LinkedHashMap {

    public static void main(String[] args) {

        LinkedHashMap<Integer, String> linkedHashMap = new LinkedHashMap<>();
        
        linkedHashMap.put(1, "one");
        linkedHashMap.put(2, "two");
        linkedHashMap.put(3, "three");

        Set<Map.Entry<Integer, String>> entries = linkedHashMap.entrySet();

        Iterator<Map.Entry<Integer, String>> iterator = entries.iterator();
        
        while (iterator.hasNext()) {
            Map.Entry<Integer, String> next = iterator.next();
            System.out.println(next.getKey() + " --- " + next.getValue());
        }
    }
}
```



## 4、Hashtable

- Hashtable 实现了 Map 接口，也是一个双列集合
- 底层也是哈希表
- 和 HashMap 的不同之处：
  - `Hashtable` **不允许 null 值作为键或者值，而 HashMap 允许 null 值为键或者值**
  - 线程同步的，单线程集合，安全但是效率慢

> Hashtable 和 Vector 集合一样，在 JDK1.2 版本之后被更好的集合（HashMap，ArrayList）取代了，但是 Hashtable 的子类 Properties 依然在使用。

`Properties` 集合是唯一一个和 IO 流相结合的集合。



## 补充：

> JDK9 对集合添加的优化

- `List、Set、Map` 增加了一个静态方法 `of()` ，可以给集合一次性添加多个元素
- 使用前提：当集合中存储的元素个数已经确定了，不在改变时可以使用
- `static <E> List<E> of(E... elements)`：返回一个包含任意数量元素的 **不可变** 列表

