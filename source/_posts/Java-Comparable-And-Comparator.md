---
title: Java Comparable And Comparator
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210729153444.jpg'
coverImg: /img/20210729153444.jpg
toc: true
date: 2021-07-29 15:33:49
top: true
cover: false
summary: Java 的比较器接口使用简介。
categories: Java
keywords: Java
tags: Java
---

# Comparable 和 Comparator

## 前言

关于比较器，基础类型的包装类都已经默认实现了 `Comparable` 接口并定义了比较规则，我们可以直接使用，例如： `Integer`:

```java
public static int compare(int x, int y) {
  	return (x < y) ? -1 : ((x == y) ? 0 : 1);
}

public int compareTo(Integer anotherInteger) {
  	return compare(this.value, anotherInteger.value);
}
```



## 1、两个接口的区别

- `Comparable` 在 `java.lang` 下

- `Comparator` 在 `java.util` 下



> 使用区别：

如果在定义类时，就实现了 `Comparable` 接口，直接在里面重写 `compareTo()` 方法，如果没实现，后面在业务开发中需要有比较排序的功能，就再单独写一个类实现 `Comparator` 接口，在里面重写 `compare()` 方法，然后这个类需要作为参数传入到工具类 `Collections.sort` 和 `Arrays.sort` 方法中。



> 使用场景：

主要用于集合排序 `Collections.sort` 和 `Arrays.sort` 。



## 2、Comparable 接口

- 在定义类的时候，就实现这个接口，将排序规则定义好。
- 我们需要实现该接口中的抽象方法 `compareTo()` 并且需要指定其泛型（也就是要比较的引用数据的类型）



```java
/**
 * Comparable 接口适合在定义类的时候实现
 */
public class Demo01Comparable {

    public static void main(String[] args) {
        
        Person[] personArr = {
                new Person("张三", 21, 300),
                new Person("李四", 20, 250),
                new Person("王五", 22, 100)
        };

        System.out.println("原数组: " + Arrays.toString(personArr));
        
        // 排序
        Arrays.sort(personArr);

        System.out.println("排序后: " + Arrays.toString(personArr));


        System.out.println("==================================================");
        
        List<Person> list = new LinkedList<>();
        list.add(new Person("赵六", 21, 400));
        list.add(new Person("孙七", 24, 300));
        list.add(new Person("吴八", 20, 350));

        System.out.println("排序前： ");
        for (int i = 0; i < list.size(); i++) {
            System.out.println("index : " + i + " " + list.get(i).toString());
        }
        
        // 排序
        Collections.sort(list);

        System.out.println("排序后： ");
        for (int i = 0; i < list.size(); i++) {
            System.out.println("index : " + i + " " + list.get(i).toString());
        }
    }
}

class Person implements Comparable<Person> {

    private String name;
    
    private int age;
    
    private int salary;
    
    public Person(String name, int age, int salary) {
        this.name = name;
        this.age = age;
        this.salary = salary;
    }
    
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public int getSalary() {
        return salary;
    }

    public void setSalary(int salary) {
        this.salary = salary;
    }

    @Override
    public String toString() {
        return "Person{" +
                "name='" + name + '\'' +
                ", age=" + age +
                ", salary=" + salary +
                '}';
    }

    /**
     * 重写 Comparable 接口的方法，自定义比较规则
     * @param o 比较对象
     * @return
     */
    @Override
    public int compareTo(Person o) {
        
        // 定义规则，当前对象比 o 的 salary 大就返回 1，即升序排列
        if (this.salary > o.getSalary())
            return 1;
        else if (this.salary == o.getSalary())
            return 0;
        else 
            return -1;
    }
}
```



## 3、Comparator 接口

这个接口主要用于定义类的时候没有实现 `Comparable` 接口，但是以后需要比较的情况；



- 这个接口需要我们重写定义一个类来实现它，我们可以称这个类为：**比较器**
- 比如我们定义了一个类（也就是比较器）来实现 `Comparator` 接口，并且需要指定比较类型（泛型，在实现接口的时候指定）



```java
public class Demo02Comparator {

    public static void main(String[] args) {

        Student[] students = {
                new Student("张三", 18),
                new Student("李四", 21),
                new Student("王五", 20)
        };

        System.out.println("原来的数组: " + Arrays.toString(students));

        // 使用自定义的比较器进行比较
        Arrays.sort(students, new MyComparator());

        System.out.println("排序后的数组: " + Arrays.toString(students));

        System.out.println("===========================================");

        List<Student> list = new LinkedList<>();

        list.add(new Student("jack", 22));
        list.add(new Student("alice", 22));
        list.add(new Student("kyo", 18));
        list.add(new Student("tom", 30));

        System.out.println("初始列表：");
        for (int i = 0; i < list.size(); i++) {
            System.out.println("index : " + i + " " + list.get(i).toString());
        }

        // 排序 lambda 表达式
        Collections.sort(list, (o1, o2) -> {

            // 自定义规则降序排列
            if (o1.getAge() > o2.getAge())  // o1 比 o2 年龄大时不交换顺序
                return -1;
            else if (o1.getAge() == o2.getAge()) {
                // 年龄相同时比较名字, 字符串类型已经定义好了比较规则
                return o1.getName().compareTo(o2.getName());
            } else
                return 1;
        });

        System.out.println("降序排列后的列表：");
        for (int i = 0; i < list.size(); i++) {
            System.out.println("index : " + i + " " + list.get(i).toString());
        }
    }
}

class Student {

    private String name;

    private int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    @Override
    public String toString() {
        return "Student{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}

class MyComparator implements Comparator<Student> {
    
    @Override
    public int compare(Student o1, Student o2) {

        // 自定义规则降序排列
        if (o1.getAge() > o2.getAge())  // o1 比 o2 年龄大时不交换顺序
            return -1;
        else if (o1.getAge() == o2.getAge()) {
            // 年龄相同时比较名字, 字符串类型已经定义好了比较规则
            return o1.getName().compareTo(o2.getName());
        } else
            return 1;
    }
}
```

## 4、源码简介

### 1、Arrays.sort()

如果不使用自定义的比较器，`Arrays.sort()` 使用的默认的快速排序（三分中值法定主元）

```java
public static void sort(int[] a) {
  	DualPivotQuicksort.sort(a, 0, a.length - 1, null, 0, 0);
}
```

使用了自定义比较器则会变成这样：

```java
public static <T> void sort(T[] a, Comparator<? super T> c) {
  	if (c == null) {
    		sort(a);
  	} else {
    		if (LegacyMergeSort.userRequested)
      			legacyMergeSort(a, c);
    		else
      			TimSort.sort(a, 0, a.length, c, null, 0, 0);
  	}
}
```

注意这里的 `TimSort.sort()`



### 2、TimSort.sort()

查看源码：

```java
    static <T> void sort(T[] a, int lo, int hi, Comparator<? super T> c,
                         T[] work, int workBase, int workLen) {
        assert c != null && a != null && lo >= 0 && lo <= hi && hi <= a.length;

        int nRemaining  = hi - lo;
        if (nRemaining < 2)
            return;  // Arrays of size 0 and 1 are always sorted

        // If array is small, do a "mini-TimSort" with no merges
        if (nRemaining < MIN_MERGE) {
            int initRunLen = countRunAndMakeAscending(a, lo, hi, c);
            binarySort(a, lo, hi, lo + initRunLen, c);
            return;
        }

        /**
         * March over the array once, left to right, finding natural runs,
         * extending short natural runs to minRun elements, and merging runs
         * to maintain stack invariant.
         */
        TimSort<T> ts = new TimSort<>(a, c, work, workBase, workLen);
        int minRun = minRunLength(nRemaining);
        do {
            // Identify next run
            int runLen = countRunAndMakeAscending(a, lo, hi, c);

            // If run is short, extend to min(minRun, nRemaining)
            if (runLen < minRun) {
                int force = nRemaining <= minRun ? nRemaining : minRun;
                binarySort(a, lo, lo + force, lo + runLen, c);
                runLen = force;
            }

            // Push run onto pending-run stack, and maybe merge
            ts.pushRun(lo, runLen);
            ts.mergeCollapse();

            // Advance to find next run
            lo += runLen;
            nRemaining -= runLen;
        } while (nRemaining != 0);

        // Merge all remaining runs to complete sort
        assert lo == hi;
        ts.mergeForceCollapse();
        assert ts.stackSize == 1;
    }
```



它是归并排序进行了各种改进最后实现的算法，具体原理，可以看这一篇博客：

[OpenJDK 源代码阅读之 TimSort](https://blog.csdn.net/on_1y/article/details/30109975)



### 3、Collections.sort()



集合的排序其原理也是调用 `Arrays.sort()`	

```java
Collections.sort(list, (o1, o2) -> {

  	// 自定义规则降序排列
  	if (o1.getAge() > o2.getAge())  // o1 比 o2 年龄大时不交换顺序
    	return -1;
  	else if (o1.getAge() == o2.getAge()) {
    // 年龄相同时比较名字, 字符串类型已经定义好了比较规则
    	return o1.getName().compareTo(o2.getName());
  	} else
    	return 1;
});
```



**Collections.java**

```java
    public static <T> void sort(List<T> list, Comparator<? super T> c) {
        list.sort(c);
    }
```

**List.java**

```java
    default void sort(Comparator<? super E> c) {
        Object[] a = this.toArray();
        Arrays.sort(a, (Comparator) c);
        ListIterator<E> i = this.listIterator();
        for (Object e : a) {
            i.next();
            i.set((E) e);
        }
    }
```

