---
title: Java Functional Programming
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210804161135.jpg'
coverImg: /img/20210804161135.jpg
toc: true
date: 2021-08-17 21:19:57
top: false
cover: false
summary: Java8 新特性：函数式编程
categories: Java
keywords: [Java, Functional]
tags: Java
---



# 函数式编程

## 一、函数式接口

### 1、概念

函数式接口在 Java 中指：**有且仅有一个抽象方法的接口。**



函数式接口，即适用于函数式编程场景的接口。而 Java 中的函数式编程体现就是 Lambda，所以函数式接口就是可以适用于 Lambda 使用的接口。只有确保接口中有且仅有一个抽象方法，Java 的 Lambda 才能顺序的进行推导。



格式：

```java
修饰符 interface 接口名称 {
  public abstract 返回值类型 方法名称(可选参数信息);
  // 其他非抽象方法内容
}
```



在接口中 `public abstract` 是默认的，可以不用显式声明



### 2、@FunctionalInterface 注解

与 `@Override` 注解的作用类似，Java 8 专门为函数式接口引入了一个新的注解：`@FunctionalInterface` 。该注解可用于一个接口的定义上：



```java
/**
 * 函数式接口：有且仅有一个抽象方法的接口
 *      当然接口中可以包含其他的方法（默认的、私有的、静态的）
 *      
 *  @FunctionalInterface
 *     可以检测一个接口是否为函数式接口
 *          是: 编译成功
 *          否: 编译失败（接口中没有抽象方法或者抽象方法大于 1 个）
 */
@FunctionalInterface
public interface MyFunctionalInterface {
    
    void method();
}
```



测试：

```java
public class Test {

    public static void show(MyFunctionalInterface myFunInterface) {
        myFunInterface.method();
    }
    
    public static void main(String[] args) {
        
        show(() -> System.out.println("This is FunctionalInterface!"));
    }
}
```



## 二、函数式编程

### 1、Lambda 的延迟执行

有些场景的代码执行后，结果不一定会被使用，从而造成性能浪费。而 Lambda 表达式是延迟执行的，这正好可以作为解决方案，提升性能。



#### 性能浪费的日志案例

注：日志可以帮助我们快速定位问题，记录程序运行过程中的情况，以便项目的监控和优化。

一种典型的场景就是对参数进行有条件的使用，例如对日志消息进行拼接后，在满足条件的情况下进行打印输出。



存在问题的代码：

```java
/**
 * 该代码存在问题，不管 showLog 方法是否输出信息，第二个参数 msg 字符串都会先拼接，造成性能浪费
 */
public class Demo01Logger {

    public static void showLog(int level, String msg) {
        
        if (level == 1) {
            System.out.println(msg);
        }
    }
    
    public static void main(String[] args) {
        
        String msg1 = "Log ";
        String msg2 = "info: ";
        String msg3 = "Hello World";
        
        showLog(1, msg1 + msg2 + msg3);
    }
}
```



使用 Lambda 优化：

```java
/**
 *  Lambda 特点：延迟加载
 */
public class Demo02Lambda {
    
    public static void showLog(int level, MessageBuilder mb) {
        
        if (level == 1) {
            System.out.println(mb.builderMsg());
        }
    }

    public static void main(String[] args) {
        
        String msg1 = "Hello";
        String msg2 = "World";
        
        showLog(1, () -> msg1 + msg2);
    }
    
    /*
        使用 Lambda 表达式传递参数，仅仅到参数传递到 Log 方法中，
            只有满足条件时，才会调用 MessageBuilder 的 builderMsg，
            才会进行字符串的拼接
        如果条件不满足，MessageBuilder 的 builderMsg 方法不会执行，
            字符串不会拼接，性能就不会浪费
     */
}

@FunctionalInterface
interface MessageBuilder {
    
    String builderMsg();
}
```

> 扩展：其实通过内部类也可以达到相同的效果，只是将代码操作延迟到了另外一个对象中通过调用方法来完成。而是否调用其方法是在条件判断后才执行的。



### 2、使用 Lambda 作为参数和返回值

抛开实现原理不说，Java 的 Lambda 其实就是匿名内部类的语法糖。如果方法的参数是一个函数式接口，那么就可以使用 Lambda 表达式进行替换。通过 Lambda 表达式作为方法参数，其实就是使用函数式接口作为参数。



> 方法参数为 Lambda

例如 `java.lang.Runnable` 接口就是一个函数式接口：

```java
public class Demo03Runnable {

    public static void startThread(Runnable runnable) {
        new Thread(runnable).start();
    }
    
    public static void main(String[] args) {
        
        startThread(() -> System.out.println("使用 Lambda 替换."));
    }
}
```



> 方法返回值为 Lambda

类似的，如果要给方法返回值类型是一个函数式接口，那么就可以直接返回一个 Lambda 表达式。当需要通过一个方法来获取 `java.util.Comparator` 接口类型的对象作为排序器时，就可以调用该方法。



```java
public class Demo04Comparator {

    public static Comparator<String> getComparator() {
        
        // 按照字符串长度降序排列
        return (str1, str2) -> str1.length() - str2.length();
    }
    
    public static void main(String[] args) {
        
        // 对一个字符串数组进行排序并输出结果
        String[] strArr = {"This", "is", "Power"};

        Arrays.sort(strArr, getComparator());

        System.out.println(Arrays.toString(strArr));
    }
}
```



## 三、常用的函数式接口

JDK 提供了大量常用的函数式接口以丰富 Lambda 的典型使用场景，它们主要在 `java.util.function` 包中。



下面展示几个简单的例子：



### 1、Supplier 接口

> 介绍

`java.util.function.Supplier<T>` 接口仅包含一个无参的方法：`T get()`。用来获取一个泛型参数指定类型的对象数据，由于这是一个函数式接口，这也就意味着对外的 Lambda 表达式需要 **"对外提供"** 一个符合泛型类型的对象数据：

```java
/**
 * Supplier 被称之为生产型接口
 *      抽象方法指定什么类型，就返回什么类型的对象数据
 */
public class Demo01Supplier {

    public static String getString(Supplier<String> supplier) {
        
        return supplier.get();
    }
    
    public static void main(String[] args) {

        System.out.println(getString(() -> "Functional Interface: Supplier"));
    }
}
```



> 案例

例子：求数组元素最大值：

```java
public class Demo02Test {
    
    public static int getMax(Supplier<Integer> supplier) {
        
        return supplier.get();
    }

    public static void main(String[] args) {
        
        // 提示匿名内部类访问外部变量，默认将其声明为 final
        int[] arr = {100, 0, -20, 30, 90, 20, 999};

        int arrMax = getMax(() -> {

            int max = arr[0];

            for (int i : arr) {
                if (i > max)
                    max = i;
            }

            return max;
        });

        System.out.println("The maximum integer of this array is: " + arrMax);
    }
}
```



### 2、Consumer 接口

> 简介

`java.util.function.Consumer<T>` 接口正好与 Supplier 接口相反，它不是产生一个数据，而是消费一个数据，该数据类型由泛型决定。



#### 抽象方法 accept

`Consumer` 接口中包含的抽象方法 `void accept(T t)`，消费一个指定类型的数据：

```java
public class Demo03Consumer {

    public static void consumerString(String str, Consumer<String> consumer) {
        
        consumer.accept(str);
    }
    
    public static void main(String[] args) {
        
        consumerString("Hello", (str) -> {

            // 反转字符串处理
            System.out.println(new StringBuilder(str).reverse());
        });
    }
}
```



#### 默认方法 andThen

如果一个方法的参数和返回值全部都是 `Consumer` 类型，那么就可以实现效果：消费数据的时候，首先做一个操作，然后再做一个操作，实现组合。而这个方法就是 `Consumer` 接口中的 default 方法 `andThen`。

```java
@FunctionalInterface
public interface Consumer<T> {

    /**
     * Performs this operation on the given argument.
     *
     * @param t the input argument
     */
    void accept(T t);

    /**
     * Returns a composed {@code Consumer} that performs, in sequence, this
     * operation followed by the {@code after} operation. If performing either
     * operation throws an exception, it is relayed to the caller of the
     * composed operation.  If performing this operation throws an exception,
     * the {@code after} operation will not be performed.
     *
     * @param after the operation to perform after this operation
     * @return a composed {@code Consumer} that performs in sequence this
     * operation followed by the {@code after} operation
     * @throws NullPointerException if {@code after} is null
     */
    default Consumer<T> andThen(Consumer<? super T> after) {
        Objects.requireNonNull(after);
        return (T t) -> { accept(t); after.accept(t); };
    }
}
```

> 备注：`java.util.Objects` 的 `requireNonNull` 静态方法将在参数为 null 时主动抛出 `NullPointException` 异常。省去了重复编写 if 语句和抛出空指针异常的麻烦。



想要实现组合，需要两个或多个 Lambda 表达式即可，而 `andThen` 的语义正是 "一步接一步" 操作。



例如两个步骤组合的情况：

```java
public class Demo04ConsumerConpose {
    
    public static void method(String str, Consumer<String> con1, Consumer<String> con2) {
        
        // 组合两个步骤对 str 进行消费
        con1.andThen(con2).accept(str);
    }

    public static void main(String[] args) {
        
        method("Hello", 
                (str1) -> {
                    // 大写输出
                    System.out.println(str1.toUpperCase());
                },
                (str2) -> {
                    // 全小写输出
                    System.out.println(str2.toLowerCase());
                });
    }
}
```



### 3、Predicate 接口

有时候我们需要对某种类型的数据进行判断，从而得到一个 boolean 值。这时可以使用 `java.util.function.Predicate<T>` 接口。



#### 抽象方法 test

`Predicate` 接口中包含一个抽象方法：`boolean test(T t)`。用于条件判断的场景：

```java
/**
 * Predicate 接口
 *      test 方法用于对指定数据类型的数据进行判断
 *          结果：
 *              true 符合
 *              false 不符合
 */
public class Demo05Predicate {
    
    public static boolean checkString(String str, Predicate<String> predicate) {
        
        return predicate.test(str);
    }

    public static void main(String[] args) {

        boolean flag = checkString("111", (str) -> {
            // 判断字符串长度是否小于 9
            return str.length() < 9;
        });

        System.out.println(flag ? "是" : "否");
    }
}
```



#### 默认方法 and

既然是条件判断，就会存在与、或、非三种常见的逻辑关系。其中将两个 `Predicate` 接口使用 "与" 逻辑连接起来实现 **"并且"** 的效果时，可以使用 default 方法`and`：

```java
default Predicate<T> and(Predicate<? super T> other) {
  	Objects.requireNonNull(other);
  	return (t) -> test(t) && other.test(t);
}
```



如果要判断一个字符串既要包含 "W" 又要包含 "H" ，可以这样写:

```java
public class Demo06Predicate_And {

    public static void method(String str, Predicate<String> one, Predicate<String> two) {

        boolean result = one.and(two).test(str);

        System.out.println(result ? "符合要求" : "不符合要求");
    }
    
    public static void main(String[] args) {
        
        method("Hello World", (str) -> str.contains("H"), (str) -> str.contains("W"));
    }
}
```



#### 默认方法 or

与 `and` 类似，默认方法 `or` 实现逻辑关系中的 "或"。

```java
default Predicate<T> or(Predicate<? super T> other) {
    Objects.requireNonNull(other);
  	return (t) -> test(t) || other.test(t);
}
```



实现逻辑：字符串长度大于 5 或者包含字符 "W"：

```java
public class Demo07Predicate_OR {
    
    public static void method(String str, Predicate<String> one, Predicate<String> two) {
        
        boolean result = one.or(two).test(str);

        System.out.println(result ? "符合要求" : "不符合要求");
    }

    public static void main(String[] args) {
        
        method("OvO", (str) -> str.length() > 5, (str) -> str.contains("H"));
    }
}

```



#### 默认方法 negate

表示 "非" 的默认方法：`negate`

```java
default Predicate<T> negate() {
  	return (t) -> !test(t);
}
```



可以看出逻辑很简单，执行 test 方法后对结果取反即可，但是注意要在 test 方法之前调用它：

```java
public class Demo08Predicate_Negate {
    
    public static void method(String str, Predicate<String> predicate) {
        
        boolean result = predicate.negate().test(str);

        System.out.println("字符串长度大于 5 ? " + (result ? "是" : "否"));
    }

    public static void main(String[] args) {
        
        method("1234567890", (str) -> str.length() > 5);
    }
}
```



### 4、Function 接口

`java.util.function.Function<T, R>` 接口用来根据一个类型的数据得到另一个类型的数据，前者称为前置条件，后者称为后置条件



#### 抽象方法 apply

`Function` 接口中最主要的抽象方法是：`R apply(T t)`，根据类型 T 获取类型 R 的结果。



例如：将 String 类型转换为 Integer 类型。



```java
public class Demo09Function_apply {
    
    public static Integer method(String str, Function<String, Integer> function) {
        
        return function.apply(str);
    }

    public static void main(String[] args) {

        Integer result = method("20", (str) -> Integer.valueOf(str));

        System.out.println("转换结果: " + result);
    }
}
```



#### 默认方法 andThen

`Function` 接口中有一个默认方法 `andThen` 方法，用来进行组合操作：

```java
default <V> Function<T, V> andThen(Function<? super R, ? extends V> after) {
  	Objects.requireNonNull(after);
  	return (T t) -> after.apply(apply(t));
}
```

该方法同样用于 "先做什么，再做什么" 的场景，和 `Consumer` 的 `andThen` 差不多：

```java
public class Demo10Function_andThen {
    
    public static void method(String str, Function<String, Integer> one, Function<Integer, Integer> two) {

        Integer apply = one.andThen(two).apply(str);

        System.out.println("处理后的结果: " + apply);
    }

    public static void main(String[] args) {
        
        // 流程：将字符串转换为整数，然后 +10
        method("10", (str) -> Integer.parseInt(str), (target) -> target += 10);
    }
}
```
