---
title: Java Exception Review
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210807154056.jpg'
coverImg: /img/20210807154056.jpg
toc: true
date: 2021-08-07 15:40:38
top: true
cover: false
summary: 复习 Java 的异常相关知识
categories: Java
keywords:
 - Java
 - Exception
tags: Java
---

# 异常

- **异常**：指的是在程序执行过程中，出现的非正常的情况，最终会导致 JVM 的非正常停止

在 Java 等面向对象的编程语言中，异常本身就是一个类，产生异常就是创建异常对象并抛出了一个异常对象，Java 处理异常的方式是中断处理。

> 异常指的并不是语法错误，语法错了，编译不通过，不会产生字节码文件，程序也不会运行。



## 1、异常体系

异常机制可以帮助我们找到程序中的问题：

- 异常的根类是：`java.lang.Throwable`
- 其下有两个子类：
  - `java.lang.Error`
  - `java.lang.Exception`：就是我们平时说的异常
    - 一个特殊的子类：`java.lang.RuntimeException` 运行器异常



**Throwable 体系：**

- **Error**：严重错误异常 Error，无法通过处理的错误，只能事先避免
- **Exception**：表示异常，异常产生后程序员可以通过修正代码来避免，使程序继续运行，是必须要处理的



**Throwable 中常用的方法：**

- `public void printStackTrace()`：打印异常的详细信息
  - 包含了异常的类型，异常的原因，出现的位置，在开发和调试阶段需要使用此方法
- `public String getMessage()`：获取异常发生的原因
  - 提示给用户的时候，就提示错误原因
- `public String toString()`：获取异常的类型和描述信息（不用）



## 2、异常分类

我们平时说的异常就是 `Exception`，因为这类异常一旦出现，我们就需要对代码进行更正、纠错。



**异常（Exception）的分类**：根据在编译时期还是运行时期：

- **编译时期异常**：`checked` 异常。在编译时期，就会检查，如果没有处理异常，编译就不会通过
- **运行时期异常**：`runtime` 异常。在运行时期，检查异常，这类异常在编译时期检测不到



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210807104935.png)



## 3、异常产生过程分析

看下面一段示例代码：

 ```java
public class Demo01Exception {

    public static void main(String[] args) {
        
        int[] arr = {1, 2, 3, 4, 5};
        
        // 数组下标越界异常 ArrayIndexOutOfBoundsException
        int e = getElement(arr, 5);

        System.out.println(e);
    }
    
    /*
        定义一个方法，获取数组指定索引处的元素
     */
    public static int getElement(int[] arr, int index) {

        return arr[index];
    }
}
 ```

过程分析：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210807110507.png)



## 4、异常的处理

Java 异常处理的五个关键字：

- **try、catch、finally、throw、throws**



### （1）抛出异常

在编写程序的时候，我们必须考虑到程序出现问题的情况。比如，在定义方法时，方法接收参数，首先要对参数的格式进行合法的判断，数据若不合法，应该及时告诉调用者，传递合法的数据过来。这时候可以使用抛出异常的方式来通知调用者。



Java 中提供了一个关键字 `throw` ，它用来抛出一个指定的异常对象

1. 创建一个异常对象，封装一些信息
2. 在方法内通过 `throw` 抛出该异常，将这个异常对象传递给调用者处，并结束当前方法的执行



使用格式：

> throw new 异常类名（参数）

```java
/**
 * throw 关键字：
 *  作用：
 *      可以使用该关键字在指定的方法中抛出异常
 *  格式：
 *      throw new xxxException("异常产生的原因");
 *  注意：
 *      1. throw 关键字必须写在方法的内部
 *      2. throw 关键字后边 new 的对象必须是 Exception 或者 Exception 的子类对象
 *      3. throw 关键字抛出指定的异常对象，我们就必须处理这个异常对象
 *          throw 关键字后边创建的是 RuntimeException 或者是它的子类，我们也可以不处理，交给 JVM 处理（打印异常，中断程序）
 *          throw 关键字后边如果创建的是编译异常，我们就必须处理这个异常，要么 throws 要么 try-catch
 */
public class Demo02Throw {

    public static void main(String[] args) {

        int[] arr = {1, 2, 3, 4, 5};

        int e1 = getElement(arr, 0);

        int e2 = getElement(arr, 5);
    }

    /*
        定义一个方法，获取数组指定索引处的元素
     */
    public static int getElement(int[] arr, int index) {
        
        if (arr == null) {
            // 运行时异常，可以交给 JVM 处理
            throw new NullPointerException("传入的数组参数不能为空!");
        }

        /**
         * 对传递的参数 index 进行校验
         */
        if (index >= arr.length || index < 0) {
            // 运行时异常，可以交给 JVM 处理
            throw new ArrayIndexOutOfBoundsException("数组下标越界!");
        }

        return arr[index];
    }
}
```

### （2）Objects 非空判断

一个类 `Objects`，它里面拥有一些静态的实用方法，这些方法都是 `null-save` （空指针安全）或 `null-tolerant`（容忍空指针的），在它的源码中，对对象为 null 的值进行了抛出异常操作。

比如：

- `public static <T> T requireNonNull(T obj)`：查看指定引用对象不是 null

源码：

```java
public static <T> T requireNonNull(T obj) {
  	if (obj == null)
   	 	throw new NullPointerException();
  	return obj;
}
```



### （3）声明异常 throws

**声明异常：**将问题标出来，报告给调用者，如果方法内通过 throws 抛出了编译时异常，而没有捕获异常，就必须通过 throws 进行声明，让调用者去处理。



关键字 `throws` 用于方法的声明上，表示当前方法不处理异常，而是提醒该方法的调用者去处理异常（抛出异常）



**声明异常格式：**

> 修饰符 返回值类型 方法名（参数）throws 异常类名1，异常类名2 ...{ 方法体 }



### （4）捕获异常 try...catch

如果出现异常，会立刻终止程序，所以我们得处理异常：

1. 该方法不处理，而是声明抛出，由该方法得调用者来处理异常 （throws）
2. 在方法中使用 try-catch 的语句块来处理



**try-catch** 的方式去捕获异常：

- **捕获异常：**Java 中对异常有针对性的语句进行捕获，可以对出现的异常进行指定方式的处理



```java
try {
  // 编写可能会出现异常的代码
} catch {
  // 处理异常的代码
  // 比如：记录日志、打印异常信息、继续抛出异常
}
```



> 如何获取异常信息



`Throwable` 类中定义了一些查看方法：

- `public void printStackTrace()`：打印异常的详细信息
  - 包含了异常的类型，异常的原因，出现的位置，在开发和调试阶段需要使用此方法
- `public String getMessage()`：获取异常发生的原因
  - 提示给用户的时候，就提示错误原因
- `public String toString()`：获取异常的类型和描述信息（不用）



开发中也可以在 catch 中将编译器异常转换成运行期异常。



### （5）finally 代码块

**finally**：有一些特定的代码无论异常是否发生，都需要执行，另外，因为异常会引发程序跳转，导致有些语句执行不到。finally 就是为了解决这个问题的，在 finally 中的代码一定会执行。

> 什么时候的代码必须最终执行？

当我们在 try 语句块中打开了一些物理资源（磁盘文件/网络连接/数据库连接等等），我们都要在使用完成之后，关闭打开的资源。



## 5、异常注意事项



多个异常使用捕获该如何处理：

1. 多个异常分别处理
2. 多个异常一次捕获，多次处理
3. 多个异常一次捕获，一次处理



一般使用一次捕获多次处理的方式，格式如下：

```java
try {
  // 编写可能出现异常的代码
} catch (异常类型A e) {
  // 处理异常的代码
  // 记录日志/打印异常信息/继续抛出异常
} catch (异常类型B e) {
  // 处理异常的代码
  // 记录日志/打印异常信息/继续抛出异常
}
```

> 注意：这种异常处理方式，要求多个 catch 中的异常不能相同，并且若 catch 中的多个异常之间有父子异常关系，那么子类异常通常要求在上面的 catch 块中处理，父类异常在下面的 catch 块中处理。

- 运行时异常被抛出可以不处理，即不捕获也不声明抛出
- 如果父类抛出了多个异常，子类覆盖父类方法时，只能抛出相同的异常或者是他的子集
- 父类方法没有抛出异常，子类覆盖父类方法时也不可以抛出异常。此时子类产生异常，只能捕获处理，不能声明抛出
- 在 try/catch 后可以追加 finally 代码块，其中的代码一定会被执行，通常用于资源回收
- 如果 finally 有 return 语句，方法执行会永远返回 finally 中的结果，**要避免该情况，finally 中不要写 return**



> 补充：父子类异常抛出

为什么子类异常的 catch 块要放在父类异常的 catch 之上呢？

- 因为当在 try 块中可能会抛出多个异常且异常具有父子类关系的时候
- try 块中捕捉到一个异常，该异常会被抛出交给 catch 块处理，而抛出的异常对象会从上到下依次赋值给遇到的 catch 块中定义的异常变量
- 如果第一个 catch 块定义了父类异常的变量，就会出现多态，父类引用指向子类实例，或者父类引用指向父类实例，匹配成功后就不会抛给下方的 catch 块，下面的 catch 就没有了意义
- 如果第一个 catch 块定义了子类异常的变量，抛出的是父类异常对象，不会出现子类引用指向父类实例的问题，该异常对象会继续抛出找到和自己匹配的异常变量

```java
/**
 * 异常的注意事项
 */
public class Demo03MultiException {

    public static void main(String[] args) {
        
        // 1. 多个y分别处理
        try {
            int[] arr = {1, 2, 3};

            System.out.println(arr[3]); // ArrayIndexOutOfBoundsException: 3
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println(e);
        }

        try {
            List<Integer> list = new ArrayList<>();
            list.add(1);
            list.add(2);
            list.add(3);

            System.out.println(list.get(3));    // IndexOutOfBoundsException: 3
        } catch (IndexOutOfBoundsException e) {
            System.out.println(e);
        }

        // 2. 多个异常一次捕获，多次处理
        /*
            一个 try 多个 catch 处理：
                catch 中定义的异常变量，如果有父子类关系，子类异常必须放在上面，父类异常在下面
         */
        try {
            int[] arr = {1, 2, 3};

            System.out.println(arr[3]); // 在这里捕获了异常，不会执行下面的代码了，直接进入 catch

            List<Integer> list = new ArrayList<>();
            list.add(1);
            list.add(2);
            list.add(3);

            System.out.println(list.get(3));
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println(e);
        } catch (IndexOutOfBoundsException e) {
            System.out.println(e);
        }
        
        // 3. 多个异常一次捕获，一次处理
        try {
            int[] arr = {1, 2, 3};

            System.out.println(arr[3]); // 在这里捕获了异常，不会执行下面的代码了，直接进入 catch

            List<Integer> list = new ArrayList<>();
            list.add(1);
            list.add(2);
            list.add(3);

            System.out.println(list.get(3));
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}
```



## 6、自定义异常

自定义异常：

- 开发中根据自己业务的异常情况来定义异常类



**异常类如何定义：**

1. 自定义一个编译期异常：自定义类并继承 `java.lang.Exception`
2. 自定义一个运行期异常：自定义类并继承 `java.lang.RuntimeException`

