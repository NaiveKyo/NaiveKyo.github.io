---
title: Java Stream And Method Reference
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210806205459.jpg'
coverImg: /img/20210806205459.jpg
toc: true
date: 2021-08-18 22:58:01
top: false
cover: false
summary: Java8 新特性：流和方法引用
categories: Java
keywords: [Java, Stream, 'Method Reference']
tags: Java
---

## 一、Stream 流

提到 Stream 就容易想起来 Java I/O 中的流，实际上，流不仅仅可以是 IO。在 Java 8 中，得益于 Lambda 所带来的函数式编程，引入了一个 **全新的 Stream 概念**，用于解决已有集合类既有的弊端。



### 1、引言

#### 传统集合遍历

几乎所有的集合（如 `Collection` 接口或 `Map` 接口等等）都支持直接或间接的遍历操作。当我们需要对集合中的元素进行操作的时候，除了必须的添加、删除、获取外，最典型的就是集合遍历。



例如：

```java
public class Demo01_traverseList {

    public static void main(String[] args) {
        
        // 演示传统的集合遍历
        ArrayList<Integer> list = new ArrayList<>();

        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        list.add(9);

        for (Integer integer : list) {
            System.out.println(integer);
        }
    }
}
```

这里是一个非常简单的集合遍历输出例子。



#### 循环遍历的弊端

Java 8 的 Lambda 让我们可以更专注于 **做什么（What）**、而不是 **怎么做（How）**。

看上边的代码，我们可以发现：

- for 循环的语法就是 **"怎么做"**
- for 循环的循环体就是 **"做什么"**

为什么要使用循环？因为要进行遍历。但是循环就是遍历的唯一方式吗？遍历是指每一个元素逐一进行处理，**而并不是第一个到最后一个顺序处理的循环**。前者是目的，后者是方式。



假如我有这样的需求，对一个集合的元素进行筛选，将筛选出的元素再进行处理，这样使用传统的方式来处理是这样的：

```java
public class Demo02_Stream {

    public static void main(String[] args) {

        ArrayList<String> list = new ArrayList<>();

        list.add("张三");
        list.add("李四");
        list.add("王五");
        list.add("赵六");
        list.add("张七");
        list.add("张八");
        list.add("张九");
        
        // 对 list 中集合进行过滤，只要以 张 开头的元素就存储到一个新的集合中
        ArrayList<String> filterList = new ArrayList<>();

        for (String str : list) {
            if (str.startsWith("张")) {
                filterList.add(str);
            }
        }
        
        // 对过滤后元素再进行处理，循环输出
        for (String str : filterList) {
            System.out.println(str);
        }
    }
}
```



#### Stream 流的处理

下面使用 Java 8 的 Stram API：

```java
/**
 * 使用 Stream 流的方式，遍历集合，对集合中的数据进行过滤
 * Stream 流是 JDK 1.8 后出现的
 * 它关注的是做什么，而不是怎么做
 */
public class Demo02_Stream {

    public static void main(String[] args) {

        ArrayList<String> list = new ArrayList<>();

        list.add("张三");
        list.add("李四");
        list.add("王五");
        list.add("赵六");
        list.add("张七");
        list.add("张八");
        list.add("张九");
        
        // 使用 Stream 对集合进行加工
        list.stream()
                .filter((e) -> e.startsWith("张"))
                .forEach(e -> System.out.println(e));
    }
}
```



### 2、流式思想概述

整体来看，流式思想类似于工厂车间的 **生产流水线**。



当需要对多个元素进行操作（特别是多步操作）的时候，考虑到性能及便利性，我们应该首先拼好一个 "模型" 步骤方案，然后按照这个方案去执行它。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210817220310.png)



上面这个流程展示了 过滤、映射、跳过、计数等多步操作，这是一种集合元素的处理方案，而方案就是一种 "函数模型"。图中每一个方框都是一个 "流"，调用指定的方法，可以从一个流模型转换到另一个流模型。而最右侧的数字 3 就是最终结果。



这里的 `filter`、`map`、`skip` 都是对函数模型进行操作，集合元素并没有真正被处理。只有当终结方法 `count` 执行的时候，整个模型才会按照指定策略执行操作。而这得益于 Lambda 的延迟执行特性。



> 备注："Stream" 流其实是一个集合元素的函数模型，它并不是集合，也不是数据结构，其本身并不存储任何元素（或其地址值）



Stream（流）是一个来自数据源的元素队列

- 元素是特定类型的对象，形成一个队列。Java 中的 Stream 并不会存储元素，而是按需计算
- **数据源** ：流的来源。可以是集合、数组等等



和以前的 Collection 操作不同，Stream 操作还有两个基础的特征：

- **Pipelining**：中间操作都会返回流对象本身。这样多个操作可以串联成一个管道，如同流式风格（fluent style）。这样可以对操作进行优化，比如延迟执行（laziness）和 短路（short-circuiting）
- **内部迭代**：以前对集合遍历都是通过 Iterator 或者增强 for 的方式，显式的在集合外部进行迭代，这叫做外部迭代。Stream 提供了内部迭代的方式，流可以直接调用遍历方法。



当使用一个流的时候，通常需要三个步骤：

1. 获取一个数据源（source）
2. 数据转换
3. 执行操作获取想要的结果

每次转换原有的 Stream 流对象不改变，返回一个新的 Stream 流对象（可以有多次转换），这就允许对其操作可以像链条一样排列，变成一个管道。



### 3、获取流

`java.util.stream.Stream<T>` 是 Java 8 新加入的最常用的流接口。（注意它不是函数式接口）

获取一个流非常简单，可以有以下几种方式：

- 所有的 `Collection` 集合都可以通过 `stream` 默认方法获取流；
- `Stream` 接口的静态方法 `of` 可以获取数组对应的流



`java.util.Collection` 接口中加入了 default 方法 `stream` 来获取流，所以其所有实现类均可获得流



```java
/**
 * 两种方式获取流：
 * Collection : default Stream<E> stream()
 * static <T> Stream<T> of(T... values)
 * static <T> Stream<T> of(T t)
 */
public class Demo03_get_stream {

    public static void main(String[] args) {

        // 集合转化为流
        List<String> list = new ArrayList<>();

        Stream<String> stream1 = list.stream();

        Set<String> set = new HashSet<>();

        Stream<String> stream2 = set.stream();

        Map<String, String> map = new HashMap<>();
        // 获取键
        Set<String> keySet = map.keySet();
        Stream<String> stream3 = keySet.stream();

        // 获取值
        Collection<String> values = map.values();
        Stream<String> stream4 = values.stream();

        // 获取键值对
        Set<Map.Entry<String, String>> entries = map.entrySet();
        Stream<Map.Entry<String, String>> stream5 = entries.stream();

        System.out.println("=========================================");

        // 数组转换为流
        Stream<Integer> stream6 = Stream.of(1, 2, 3, 4, 5);

        int[] arr = new int[]{1, 2, 3, 4, 5};
        Stream stream7 = Stream.of(arr);

        // 单个元素
        Stream<Integer> stream8 = Stream.of(1);
    }
}
```



### 4、常用方法

流模型的操作很丰富，这里介绍一些常用的 API。这些方法可以分为两种：

- **延迟方法**：返回值类型仍是 `Stream` 接口自身类型的方法，支持链式调用（除了终结方法，其余方法均为延迟方法）
- **终结方法**：返回值类型不再是 `Stream` 接口自身类型的方法，因此不再支持链式调用，例如：`count()` 、`forEach()`



更多方法参见 API 文档。



#### 逐一处理：forEach

这里与 for 循环 for-each 不同

```java
void forEach(Consumer<? super T> action);
```

这里接收一个 `Consumer` 接口，会将每一个流元素交给该函数进行处理



基本使用：快速打印集合：

```java
public class Demo04_teste {

    public static void main(String[] args) {

        ArrayList<String> list = new ArrayList<>();
        list.add("张三");
        list.add("李四");
        list.add("王五");
        
        list.stream().forEach((elem) -> System.out.println(elem));
    }
}
```



#### 过滤：filter

可以通过 `filter` 方法将一个流转换为另一个子集流：

```java
Stream<T> filter(Predicate<? super T> predicate);
```

该接口接收一个 `Predicate` 函数式接口参数作为筛选条件。



基本使用：筛选出大于 5 的元素并打印个数

```java
public class Demo04_teste {

    public static void main(String[] args) {

        ArrayList<Integer> list = new ArrayList<>();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        list.add(6);
        list.add(7);
        list.add(8);
        list.add(9);

        long count = list.stream().filter((elem) -> elem > 5).count();
        System.out.println("大于 5 的元素个数: " + count);
    }
}
```



> 注意：Stream 流的特点

Stream 流属于管道流，它只能消费一次：

- 第一个 Stream 流调用完方法，数据会流向下一个 Stream 流
- 此时第一个 Stream 流已经使用完毕，就关闭了





#### 映射：map

如果需要将流中的元素映射到另一个流中，可以使用 `map` 方法：

```java
<R> Stream<R> map(Function<? super T, ? extends R> mapper);
```

该方法需要一个 `Function` 函数式接口参数，可以将当前流的 T 数据转换为另一种 R 类型的流。



基本使用：将字符串集合转换为字符串数组集合：

```java
public class Demo04_teste {

    public static void main(String[] args) {

        ArrayList<String> list = new ArrayList<>();

        list.add("a,b,c");
        list.add("d,e");
        list.add("f");
        
        list.stream()
                .map((elem) -> elem.split(","))
                .forEach(elem -> System.out.println(Arrays.toString(elem)));
    }
}
```



#### 统计个数：count

正如旧集合 `Collection` 中的 `size` 方法一样，流提供 `count` 方法用来统计其中的元素个数：

```java
long count();
```

该方法返回一个 long 值代表元素个数（和 Collection 的 size 不同，size 返回的是 int）



注意：count 方法是一个终结方法，使用该方法后不能使用其他流方法了。



#### 取前几个值：limit

`limit` 方法可以对流进行截取，只取前 n 个	

```java
Stream<T> limit(long maxSize);
```

参数是一个 long 类型，如果集合当前长度大于该参数则可以截取，反之则不进行操作。



基本使用：打印集合前两个元素

```java
public class Demo04_teste {

    public static void main(String[] args) {

        ArrayList<String> list = new ArrayList<>();

        list.add("1");
        list.add("2");
        list.add("3");
        
        list.stream().limit(2).forEach((e) -> System.out.println(e));
    }
}
```



注意：limit 方法不是终结方法



#### 跳过前几个：skip

如果希望跳过前几个元素，可以使用 `skip` 方法获取一个截取后的新流：

```java
Stream<T> skip(long n);
```

如果流当前元素长度大于 n，则跳过前 n 个，否则会得到一个长度为 0 的流。



基本使用：跳过第一个

```java
public class Demo04_teste {

    public static void main(String[] args) {

        ArrayList<String> list = new ArrayList<>();

        list.add("1");
        list.add("2");
        list.add("3");
        
        list.stream().skip(1).forEach((e) -> System.out.println(e));
    }
}
```



#### 组合：concat

如果有两个流，希望合并为一个流，那么可以使用 `Stream` 接口的静态方法 `concat`:

```java
static <T> Stream<T> concat(Stream<? extends T> a, Stream<? extends T> b);
```

注意：这个静态方法和  `java.long.String` 中的 `concat` 方法是不一样的



基本使用：

```java
public class Demo04_teste {

    public static void main(String[] args) {

        // 单个元素流合并
        Stream<String> stream1 = Stream.of("One");
        Stream<String> stream2 = Stream.of("Two");
        
        Stream.concat(stream1, stream2).forEach(e -> System.out.println(e));
        
        // 集合流合并
        ArrayList<Integer> list1 = new ArrayList<>();
        list1.add(1);
        list1.add(2);
        list1.add(3);
        
        ArrayList<Integer> list2 = new ArrayList<>();
        list2.add(4);
        list2.add(5);
        list2.add(6);
        
        Stream.concat(list1.stream(), list2.stream()).forEach(e -> System.out.println(e));
    }
}
```



## 二、方法引用

在使用 Lambda 的时候，我们实际上传递进去的代码就是一种解决方案：拿什么参数做什么操作。那么考虑一种情况：如果我们在 Lambda 中所指定的操作方案，已经有地方存在相同的方案了，那么还有必要再写重复的逻辑了吗？



### 1、冗余的 Lambda 场景

```java
public class Demo01 {
    
    // 定义一个方法对字符串进行打印
    public static void printString(String str, Printable printable) {
        
        printable.print(str);
    }

    public static void main(String[] args) {
        
        printString("Hello World!", str -> System.out.println(str));
        
        /*
            Lambda 目的：打印传递的参数
                把参数 str 传递给 System.out 对象，调用 out 的方法 println 对字符串进行输出
                1. System.out 对象已经存在
                2. println 方法也已经存在
            所以我们可以使用方法引用来优化 Lambda 表达式
            使用 System.out 直接引用 println 方法
        */
        printString("Java", System.out::println);
    }
}

@FunctionalInterface
interface Printable {
    
    // 打印字符串的抽象方法
    void print(String str);
}
```

注意其中的双冒号写法，这被称为 "方法引用"，双冒号是一种新的语法。



### 2、方法引用符

这种双冒号 `::` 就是引用运算符，而它所在的表达式被称为 **方法引用**。

如果 Lambda 要表达的函数方案已经存在于某个方法的实现中，那么就可以通过双冒号来引用该方法作为 Lambda 的替代者。



#### 语义分析

上面例子中，`System.out` 对象中有一个重载的 `println(String s)` 方法恰好是我们所需要的。那么对于 `printString` 方法的函数式接口参数，下面两种写法完全等效：

- Lambda 表达式写法：`s - > System.out.println(s);`
- 方法引用写法：`System.out::println`

第一种语义是指：拿到参数之后经过 Lambda 之手，继而传递给 `System.out.println` 方法去处理

第二种等效写法的语义是：直接让 `System.out` 的 `println` 方法来取代 Lambda 。两种写法的执行效果完全一致，第二种写法复用了已有方案，更加简洁。



注：采用方法引用要注意一点，Lambda 传递的参数一定符合要引用方法的参数类型，否则会抛出异常。	



#### 推导与省略

如果使用 Lambda，那么可以根据 **"可推导就是可省略"** 的原则，无需指定参数类型，也无需指定方法重载形式 —— 它们都将被自动推导，如果使用方法引用，也同样可以根据上下文推导。



函数式接口是 Lambda 的基础，而方法引用是 Lambda 的孪生兄弟。



### 3、通过对象名引用方法成员



这是最常见的一种写法，与上面的例子一样，两个前提：

- 引用方法的对象必须存在
- 对象中有我们需要的方法



```java
public class Demo02ObjectRef {
    
    public static void printString(String str, PrintableRe printableRe) {
        
        printableRe.print(str.toUpperCase());
    }

    public static void main(String[] args) {
        
        // 原先的方式
        printString("Hello", str -> {
            MethodRefObject ref = new MethodRefObject();
            ref.printUpperCase(str);
        });
        
        // 使用方法引用进行优化
        // 对象必须存在, 然后才可以引用其中已经存在的方法
        MethodRefObject methodRefObject = new MethodRefObject();
        printString("World", methodRefObject::printUpperCase);
    }
}

class MethodRefObject {
    
    public void printUpperCase(String str) {
        System.out.println(str.toUpperCase());
    }
}

@FunctionalInterface
interface PrintableRe {
    void print(String str);
}
```



### 4、通过类名称引用静态方法



由于在 `java.lang.Math` 类中已经存在了静态方法 `abs`，所以当我们需要使用 Lambda 来调用该方法时，直接使用方法引用就可以了。



```java
public class Demo03StaticMethodRef {
    
    public static int testAbs(int num, Calcable c) {
        
        return c.calsAbs(num);
    }

    public static void main(String[] args) {
        
        // Lambda 方式
        System.out.println(testAbs(-1, num -> Math.abs(num)));
        
        // 方法引用
        System.out.println(testAbs(-2, Math::abs));
    }
}

@FunctionalInterface
interface Calcable {
    
    int calsAbs(int num);
}
```



### 5、通过 super 引用成员方法



如果存在继承体系，当 Lambda 需要出现 super 调用时，也可以使用方法引用进行替换：



```java
public class Demo04SuperMethodRef {

    public static void main(String[] args) {

        Man man = new Man();

        System.out.println("子类的方法: ");
        man.sayHello();

        System.out.println("子类调用父类方法：");
        man.show();
    }
}

@FunctionalInterface
interface Greetable {
    void greet();
}

class Human {
    
    void sayHello() {
        System.out.println("Hello!");
    }
}

class Man extends Human {

    @Override
    void sayHello() {
        System.out.println("Hello, I'm a man.");
    }
    
    // 定义方法传递函数式接口参数
    void method(Greetable g) {
        g.greet();
    }
    
    // 调用父类方法
    void show() {
        method(super::sayHello);
    } 
}
```



### 6、通过 this 引用成员方法

this 代表当前对象，如果需要引用的方法是当前类的成员方法，那么可以使用 "**this::成员方法**" 的格式来使用方法引用。



```java
public class Demo05ThisMethodRef {

    public static void main(String[] args) {

        Person person = new Person();
        
        person.soHappy();
    }
}

@FunctionalInterface
interface Richable {
    
    void buy();
}

class Person {
    
    private void buyHouse() {
        System.out.println("要买一栋房子。");
    }
    
    // 要结婚了，需要买房子 OvO
    public void marry(Richable r) {
        r.buy();
    }
    
    public void soHappy() {
        
        this.marry(this::buyHouse);
    }
}
```



### 7、类的构造器引用



由于类的构造器和类名一样，并不固定。所以构造器引用使用 `类名称::new` 的格式表示。



```java
public class Demo06ConstructMethodRef {
    
    public static void printName(String name, PeopleBuilder builder) {
        
        System.out.println(builder.builderPeople(name).getName());
    }

    public static void main(String[] args) {
        
        printName("张三", People::new);
    }
}

@FunctionalInterface
interface PeopleBuilder {

    // 定义方法根据传入的姓名，创建一个对象
    People builderPeople(String name);
}

class People {
    
    private String name;

    public People(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```



### 8、数组的构造器引用



数组也是 `Object` 的子类对象，所以同样具有构造器，只是语法稍有不同。



```java
public class Demo07ArrayConstructMethodRef {
    
    public static <T> T[] createArray(int len, ArrayBuilder<T> builder) {
        
        return builder.builderArray(len);
    }

    public static void main(String[] args) {
        
        // 例如创建一个 Integer 型大小为 10 的数组
        Integer[] array = createArray(10, Integer[]::new);

        for (int i = 0; i < 10; i++) {
            array[i] = i;
        }

        Stream.of(array).forEach(System.out::println);
    }
}

@FunctionalInterface
interface ArrayBuilder<T> {
    
    // 创建一个给定长度的数组
    T[] builderArray(int len);
}
```

