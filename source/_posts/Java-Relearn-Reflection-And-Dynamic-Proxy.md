---
title: Java Relearn Reflection And Dynamic Proxy
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425110606.jpg'
coverImg: /img/20220425110606.jpg
cover: false
toc: true
mathjax: false
date: 2022-12-07 23:55:40
summary: "重新学习 Java 反射 API 及动态代理"
categories: "Java"
keywords: "Java"
tags: "Java"
---

# 一、简介

参考：

- https://docs.oracle.com/javase/tutorial/java/index.html
- https://docs.oracle.com/javase/tutorial/java/annotations/index.html

在 Java 中，注解（Annotation）是元数据的一种，主要用来给编译器提供一些信息，使用注解可以让编程更加高效。

注解主要有以下几个用途：

- 为编译器提供一些信息：编译器利用注解信息可以检测错误和抑制编译警告；
- 在编译时期或部署时期进行某些操作：编写某些工具软件可以利用注解中的信息生成代码、xml 文件等等；
- 运行时处理：在运行时可以根据注解上的信息做一些操作。

# 二、注解基础知识

## 1、Annotation's Format

先看一个简单的例子：

```java
@Documented
@Target(value = ElementType.TYPE)
@Retention(value = RetentionPolicy.RUNTIME)
public @interface TestAnnotation1 {
    
    String value();

    String name() default "";
    
    String desc() default "";
    
}
```

这是一个自定义注解，可以看到它由以下几部分组成：

- 使用 `@interface` 声明这是一个注解；
- 注解上面可以标注其他注解，此类注解被称为元注解；
  - 元注解描述了当前注解的某些特征，比如例子中的元注解告诉程序，TestAnnotation1 注解可以用来生成 java-doc，能够标注在类上面，作用范围为运行时。
- 注解可以拥有属性，比如 `String value()`，表示该注解有一个 String 类型的名为 value 的属性，而且 value 这个命名非常特殊；
- 属性可以有默认值，使用 `default` 设置默认值；

通常来讲每个注解都必须有一个属性叫做 `value()`；

下面看看如何使用该注解：

```java
// 不指定其他属性, 默认赋值给 value 属性, 可以看出 value 这个名称是有特殊含义的
@TestAnnotation1("test value")
public class TestClass1 {
}

// 也可以显式指定 value 的值
@TestAnnotation1(value = "test value")
public class TestClass1 {
}

// 显式指定多个属性的值时, 必须编写完整
@TestAnnotation1(value = "test value", name = "test")
public class TestClass1 {
}

@TestAnnotation1(value = "test value", name = "test", desc = "xxx")
public class TestClass1 {
}
```

除了上面的信息外，还可以看出，拥有默认值的属性是可以省略的。

再看看两个特殊的注解：

```java
// 该注解没有任何属性
@Documented
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface TestAnnotation2 {
}

// 类上可以标注多个注解, 且没有属性的注解可以简写
@TestAnnotation2
@TestAnnotation1("test value")
public class TestClass1 {
}
```

下面看看从 JDK 8 新增的可重复注解：

```java
@Documented
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(TestAnnotation3s.class)
public @interface TestAnnotation3 {
    
    String value();
}

// 此种注解被称为 Container Annotation Type, 它的 value 值为注解数组
@Documented
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@interface TestAnnotation3s {
    TestAnnotation3[] value();
}

// 现在就可以在一个类上标注多个相同的注解, 但是它们的 value 不一样
@TestAnnotation3("v1")
@TestAnnotation3("v2")
public class TestClass2 {
}
```

Java SE 自定义的注解在 `java.lang` 和 `java.lang.annotation` 包下面，比如常见的 `@Override`、`SuppressWarnings`，它们都是预先定义好的注解，当然我们也可以像上面例子一样自定义自己的注解。



## 2、Where Annotations Can Be used

Annotation 可以在声明上使用：类声明、方法声明、字段声明以及其他编程元素上。

截止到 Java 8，注解也可以作用于下列类型，下面是一些例子：

- 创建类实例时：`new @Interned MyObject();`
- 类型转换：`myString = (@NonNull String) str;`
- implement 关键字：`class UnmodifiableList<T> implements @Readonly List<@Readonly T> { ... }`
- throws 关键字：`void monitorTemperature() throws @Critical TemperatureException { ... }`

这种类型的注解叫做 `type annotation`，可以参考 [Type Annotations and Pluggable Type Systems](https://docs.oracle.com/javase/tutorial/java/annotations/type_annotations.html)

type annotation 是为了增强 Java 程序的分析能力，以确保更强的类型检测，虽然说 Java 8 没有提供任何的类型检测框架，但是它允许开发者自己编写或者下载任何实现了一个或多个可拔插模块的类型检测框架，结合 Java 编译器实现更强大功能。

比如说你项让程序中的某个引用不能赋为 null 值，从而避免 NullPointerException，我们就可以编写一个插件来实现这个功能，可以使用注解，比如这样：`@NonNull String str;`。这样在编译代码时，编译器如果发现 str 为 null，就会打印警告信息。

当然大部分情况下，我们不会自己编写检测模块，而是使用第三方的检测框架，可以参考这个：[Checker Framework](https://checkerframework.org/)。



## 3、Predefined Annotations Type

Java SE 提供了一些预先定义好的注解，其中有的适用于编译器，有的适用于其他注解。

比如说在 `java.long` 包下定义的 `@Deprecated`、`@Override` 和 `@SuppressWarnings` 在 Java 中经常使用。

> Java Language 中经常使用的注解

（1）@Deprecated

该注解标注的元素不推荐使用，甚至在后续版本中会废弃，在程序中使用此类元素时，编译器会提示警告信息。同时 Javadoc 中也会添加 @deprecated 标签。

值得一提的是注解和 Javadoc 的 tag 标签都是以 @ 符号开头，这并非巧合，它们在概念上是相关的，注意注解 @ 后面跟的第一个字母是大写的，注释 @ 后面跟的都是小写字母。

```java
// Javadoc comment follows
/**
 * @deprecated
 * explanation of why it was deprecated
 */
@Deprecated
static void deprecatedMethod() { }
```

（2）@Override

被该注解标注的方法会通知编译器此方法在父类中声明，在子类中被重写

（3）@SuppressWarnings

该注解用来阻止编译器生成警告信息，比如下面的例子，调用一个标注了 @Deprecated 的方法，同时在调用者上标注 @SuppressWarnings 注解，本来编译器应该警告开发者该元素不推荐使用，但是 @SuppressWarnings 又阻止了编译器这么做：

```java
// use a deprecated method and tell 
// compiler not to generate a warning
@SuppressWarnings("deprecation")
void useDeprecatedMethod() {
    // deprecation warning
    // - suppressed
    objectOne.deprecatedMethod();
}
```

Java 中不同的警告信息都会归属于一种警告类别，Java 语言规范列出了两个类别：deprecation 和 unchecked。当于泛型出现之前的遗留代码进行交互时，可能会出现 unchecked 警告，我们可以使用下面的方式去抑制多种警告：

`@SuppressWarnings({ "unchecked", "deprecation" })`

（4）@SafeVarargs

在构造器或方法上标注该注解，就可以断言代码不会对可变参数执行潜在的不安全的操作，同时对可变参数的 unchecked 警告也会被抑制。

（5）@FuncationalInterface

该注解在 JDK 1.8 版本引入，标注某个接口为函数式接口；

> 为注解服务的注解

可以作用与注解的注解叫做元注解（meta-annotations），此类注解一般在 `java.lang.annotation` 包下：

（1）@Retention

此注解表明注解保留的作用域

- RetentionPolicy.SOURCE：表明注解可以在源代码级别保留，编译器会忽略它们；（.java 文件）
- RetentionPolicy.CLASS：表明注解可以在编译时期保留，JVM 会忽略它们；（.class 文件）
- RetentionPolicy.RUNTIME：表明注解可以被 JVM 保留，意味着此类注解能够在运行时使用；

（2）@Document

此注解用于提醒 Java doc 工具再生成文档的时候将注解信息也一并带上，默认情况下一个注解是不会生成 Java doc 的。

（3）@Target

此注解用于声明目标注解可以作用的 Java 元素范围，具体作用范围如下：

- ElementType#TYPE：可以标注在类上
- ElementType#FIELD：可以标注在字段或属性上
- ElementType#METHOD：可以标注在方法上
- ElementType#PARAMETER：可以标注在方法参数上
- ElementType#CONSTRUCTOR：可以标注在构造器上
- ElementType#LOCAL_VARIABLE：可以标注在 local variable 上
- ElementType#ANNOTATION_TYPE：可以标注在注解上面
- ElementType#PACKAGE：可以标注在包上
- ElementType#TYPE_PARAMETER
- ElementType#TYPE_USE

（4）@Inherited

此注解用于声明子类可以继承父类上标注的注解（父类的注解被 @Inherited 修饰）。

通常情况下在继承关系中，父类上标注的注解和子类上标注的注解是分开的。

（5）@Repeatable

此注解从 Java SE 8 引入，此注解修饰的注解可以在同一个 Java 元素上多次修饰。在前面也提到过，更多信息参考：https://docs.oracle.com/javase/tutorial/java/annotations/repeating.html

## 4、Retrieving Annotations

在 Java 的 Reflection API 中定义了很多方法用于检索注解的，比如说这个方法：`java.lang.reflect.AnnotatedElement#getAnnotation` 利用这个方法我们可以从特定的元素上获取想要的的注解，比如这样：

```java
@TestAnnotation1(value = "测试 1")
public class RetrievingAnnotations {
    
    @Test
    public void test1() {
        RetrievingAnnotations target = new RetrievingAnnotations();

        TestAnnotation1 a1 = target.getClass().getAnnotation(TestAnnotation1.class);

        System.out.println(a1.value()); // Expect output: 测试 1
    }
}
```

为什么需要先获取 Class 呢，可以看下面的继承图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20221120205221.png)

如果存在前面所说的 Container Annotation（Java SE 8），比如一个类上标注了多个相同的注解，此时可以利用其他方法获取，比如：`java.lang.reflect.AnnotatedElement#getAnnotationsByType` 此方法。

```java
@Documented
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(Annotation3Container.class)
public @interface TestAnnotation3 {
    String value();
}

@Documented
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Annotation3Container {
    TestAnnotation3[] value();
}
```

```java
@Test
public void test2() {
    TestAnnotation3[] annoArray = TestContainerAnnotation.class.getAnnotationsByType(TestAnnotation3.class);

    for (TestAnnotation3 anno : annoArray) {
        System.out.println(anno.value());
        // Expect output:
        // t1
        // t2
        // t3
    }
}

@TestAnnotation3(value = "t1")
@TestAnnotation3(value = "t2")
@TestAnnotation3(value = "t3")
static class TestContainerAnnotation {
    
}
```

更多信息可以参考：[java.lang.reflect.AnnotatedElement](https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/AnnotatedElement.html)，该接口定义了一些方法用于读取注解信息。

## 5、Design Considerations

当我们设计一个注解的时候，一定要考虑到此种注解的 `cardinality of annotations`（注解的基数）。

- 在实际环境中使用这个注解，可能不会用它标注元素，或者只标注一次，甚至重复标注；
- 通过 `@Target` 来限制该注解保留的范围，是源码级别、还是 class 级别，甚至是运行时；

比如说像创建一个只能用在方法和字段上的可以重复标注的注解。

合理的设计注解，我们在程序中编码获取该注解及其定义的属性时也会更加灵活和高效。



# 三、反射

参考：

https://docs.oracle.com/javase/8/docs/technotes/guides/reflection/index.html

## 1、概念

Java 的 Reflection API 允许在代码中获取被加载类的字段、方法、构造器的信息，在安全范围内操作这些信息，甚至获得完全控制权。

反射包：`java.lang.reflect`

- 描述：此包提供了一些类和接口，用于获取类和对象的反射信息。

其中有几个特殊的类和接口：

> ReflectPermission 和 AccessibleObject

在 `ReflectPermission` 可用的前提下， `AccessibleObject`  可以控制对目标对象的访问权限，比如默认只能获取目标对象的共有的属性或方法，通过访问控制就可以抑制这些限制，从而获取所有的信息。

注：这里涉及到 Java Security 相关知识，且 ReflectPermission 在 AccessibleObject 有使用：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20221126103439.png)

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20221126104611.png)

> Array

`Array` final 类提供了一些静态方法用于创建和访问数组。

## 2、说明

### 使用反射

当程序在 JVM 中运行时，如果需要改变或者检测运行时行为，就可以使用反射。反射是一种高级的特性，如果想要使用它，最好对 Java 这门的基础掌握的很牢固。

要记住：反射是一种强大的技术，它可以使应用程序执行原本不可能执行的操作。

### 可扩展

程序可能会使用一些外部的、用户自定义的类，此时可以通过使用它们的全限定名结合反射创建实例；

### Class Browsers 和 Visual Development Environment

查看类的信息需要枚举类中的所有成员；

可视化开发中使用反射获取的信息能够帮助开发者编写正确的代码。

### Debuggers 和 Test Tools

Debug 需要检测类的私有成员；

测试工具可以使用反射调用定义在类上的方法，确保测试代码的高覆盖率。

### 反射的缺点

反射非常高效，但是也要注意不能随意使用，如果某些操作不需要使用反射就能够完成，那就尽量不使用它。

通过反射访问代码时，需要注意以下事项：

（1）Performance 和 Overhead（性能和开销）

因为反射涉及到动态解析类型，所以不能够适配某些 JVM 的优化策略（比如说 JIT）；

因此反射操作的性能要比不使用它的操作更慢，在对性能敏感的应用当中经常调用的代码应该避免使用反射操作。

（2）Security Restrictions（安全限制）

反射需要运行时的权限，但是在安全管理器（Java Security Manager）下程序运行时可能没有这些权限。对于必须运行在 Restricted Security Context 中的程序，此时是否使用反射就需要认真考虑一下了。 

（2）Exposure of Internals（暴露内部信息）

因为反射允许执行某些在非反射环境下的非法操作，比如说访问 private 属性或者方法，反射就可能导致一些意想不到的副作用：可能破坏代码的可移植性，反射打破了抽象，因此可能会随着平台的升级而改变行为。

`Since reflection allows code to perform operations that would be illegal in non-reflective code, such as accessing `private` fields and methods, the use of reflection can result in unexpected side-effects, which may render code dysfunctional and may destroy portability. Reflective code breaks abstractions and therefore may change behavior with upgrades of the platform.`



## 3、Classes

任何类型要么是引用类型、要么是基础数据类型。

引用类型：Classes、enums、arrays（它们都继承自 `java.lang.Object`）和接口，以及 `java.lnag.String`，基础数据类型的包装类比如 `java.lang.Double`，接口 `java.io.Serializable`，枚举 `javax.swing.SortOrder`；

基础数据类型：`boolean`, `byte`, `short`, `int`, `long`, `char`, `float`, 和`double`。

对于各种类型的实例对象，JVM 都会实例化一个不可变的 `java.lang.Class` 类型的对象，这个对象提供了一系列方法用于在运行时获取目标对象的各种成员属性及类型信息，Class 还提供了创建新类和新对象的功能 ，更重要的是：它是所有反射 API 的入口。下面就来了解一下常用的关于 Class 的反射 API。

### 获取 Class 对象

`java.lang.Class` 是调用所有反射 API 的入口，首先我们要做的就是获取 Class 的实例；

此外还需注意的是在 `java.lang.reflect` 包下面，除了 `java.lang.reflect.ReflectPermission` 有公开的构造器外，其他所有类都没有 public 类型的构造器，只能通过 Class 对象的方法去获取这些类的 Class 对象。

根据代码拥有的对象的访问权限，有几种方式可以获取 Class 对象，包括类的全限定名、类型、已存在的 Class。

#### （1）Object.getClass()

当我们拥有一个对象的实例，调用实例的 `getClass()` 方法就可以很容易的获得其对应的 Class 对象，当然此种方式只适用于继承自 Object 类的子类的实例的引用。比如说：

获取 String 类的 Class 对象：

```java
@Test
public void test1() {
    String txt = "abc";
    Class<? extends String> StrClazz = txt.getClass();
}
```

通过 `System.console()` 方法和 JVM 关联的唯一的 console，`getClass()` 方法返回的值是 `java.io.Console` 对应的 Class 对象：

```java
@Test
public void test2() {
    Class<? extends Console> clz = System.console().getClass();
}

public static Console console() {
    if (cons == null) {
        synchronized (System.class) {
            cons = sun.misc.SharedSecrets.getJavaIOAccess().console();
        }
    }
    return cons;
}
```

下面的例子中 A 是枚举 E 的一个实例，调用它的 `getClass()` 方法返回的 Class 对象对应的是枚举 E：

```java
enum E {
    A, B;
}

@Test
public void test3() {
    Class<? extends E> clz = E.A.getClass();
}
```

数组是一系列元素的集合，数组实例也可以调用 `getClass()` 方法，下面的例子返回的 Class 对象就是 `int[]` 对应的 Class 实例：

```java
@Test
public void test4() {
    int[] arr = { 1, 2, 3, 4, 5, 6, 7 };
    Class<? extends int[]> arrClz = arr.getClass();
}
```

下面的例子展示了类型为 `java.util.Set` 的 `java.util.HashSet` 实例调用 `getClass()` 方法获得的 Class 对象，这个对象对应 `java.util.HashSet`：

```java
@Test
public void test5() {
    Set<String> set = new HashSet<>();
    Class<? extends Set> setClz = set.getClass();
}
```

#### （2）.class Syntax

如果我们知道具体的类型但是没有可用的实例，此时可以利用 `类型.class` 这种语法直接获取对应的 Class 对象，对于原始数据类型也是一样的：

```java
@Test
public void test6() {
    Class<TestGetClassInstance> testClz = TestGetClassInstance.class;
    boolean b = true;
    // compile-time error
    // b.getClass();
    
    // correct
    Class<Boolean> booleanClass = boolean.class;
}
```

注意直接使用 `b.getClass()` 时，编译器会生成 error 信息，因为 `boolean` 是原始数据类型不能够 `dereferenced`。

上面的例子中 `boolean.class` 返回的是 `boolean` 原始类型的 Class 对象；

再看下面两个例子：

```java
@Test
public void test7() {
    // 可以使用全限定名获取 Class 对象
    Class<PrintStream> printStreamClass = java.io.PrintStream.class;
    
    // 下面获取的是多维数组的 Class 对象
    Class<int[][][]> multiDimensional = int[][][].class;
}
```

#### （3）Class.forName()

如果知道目标类的全限定名，就可以通过 `Class.forName()` 这个 Class 类的静态方法获取相应的 Class 实例，但是这种方式无法获取原始数据类型的 Class 实例。

研究该方法的源码时可以看看 JLS（Java Language Specification）中关于类加载的描述：[12.4 Initialization Of Classes and Interfaces](https://docs.oracle.com/javase/specs/jls/se8/html/jls-12.html#jls-12.4)，就可以知道 JVM 是如何确保类只会被初始化一次的（毕竟 Java 运行环境是多线程的）。

下面看例子，这里有特殊的地方，比如 `[D` 表示原始数据类型 `double[]` 的 Class 对象，`[[Ljava.lang.String;` 是 `String[][]` 二维数组的 Class 对象（tip：`;` 不能丢）。

```java
@Test
public void test8() throws ClassNotFoundException {
    // 创建 TestClassForName 的 Class 对象
    Class<?> clz = Class.forName("io.naivekyo.reflection.TestClassForName");

    // 创建 double[] 数组的 Class 对象, 注意是原始数据类型, 等同于 double[].class
    Class<?> doubleArray = Class.forName("[D");

    // 创建 String[][] 的 Class 对象, 等同于 String[][].class
    Class<?> stringArray = Class.forName("[[Ljava.lang.String;");
}
```

至于这些类型、数组或者原始类型的名称是如何获得的，可以使用 Class 的静态方法 `getName()` 获取：

```java
@Test
public void test9() {
    System.out.println(String.class.getName());
    System.out.println(int.class.getName());
    System.out.println(long[].class.getName());
    System.out.println(String[].class.getName());
    System.out.println(Integer.class.getName());
    System.out.println(TestClassForName.class.getName());
}
```

Expect Output：

```
java.lang.String
int
[J
[Ljava.lang.String;
java.lang.Integer
io.naivekyo.reflection.TestClassForName
```

#### （4）原始数据类型包装类的 TYPE 静态字段

使用 `.class` 语法可以很方便的获取原始数据类型的 Class 对象，除了这种方式以外还有一种方式可以做到。

对于每一个原始数据类型和 void 类型，在 `java.lang` 包下都有一个包装类，这些包装类将原始数据类型转换为引用类型，包装类有一个名为 `TYPE` 的静态 final 变量，该变量存储的是对应的原始类型的 Class 对象：

```java
public static final Class<Integer>  TYPE = (Class<Integer>) Class.getPrimitiveClass("int");
```

```java
@Test
public void test10() {
    System.out.println(Integer.TYPE);
    System.out.println(Void.TYPE);
}
```

#### （5）返回 Classes 的 Reflect API

当我们已经获得了 Class 对象时，可以调用几个反射 API，这些方法能够返回 Classes：

（1）`getSuperClass()`

返回指定 Class 对象的父类 Class 对象：

```java
@Test
public void test11() {
    Class<? super JButton> superclass = javax.swing.JButton.class.getSuperclass();
    System.out.println(superclass); // Expect Output: class javax.swing.AbstractButton
}
```

（2）`getClasses()`

返回指定 Class 中定义的 public 类型的 class、interface、enum（也包括继承的）

```java
@Test
public void test12() {
    Class<?>[] classes = Character.class.getClasses();
    for (Class<?> clz : classes) {
        System.out.println(clz);
    }
}
```

```
class java.lang.Character$Subset
class java.lang.Character$UnicodeBlock
class java.lang.Character$UnicodeScript
```

Character 中定义了两个 public 成员类：`java.lang.Character.Subset` 和 `java.lang.Character.UnicodeBlock`，一个 public 枚举 `java.lang.Character.UnicodeScript`

（3）`getDeclaredClasses()`

该方法返回目标 Class 中声明的所有类型的 class、interface、enum 成员：

```java
@Test
public void test13() {
    Class<?>[] allDeclaredClasses = Character.class.getDeclaredClasses();
    for (Class<?> clz : allDeclaredClasses) {
        System.out.println(clz);
    }
}
```

```
class java.lang.Character$CharacterCache
class java.lang.Character$Subset
class java.lang.Character$UnicodeBlock
class java.lang.Character$UnicodeScript
```

出了上面提到的 3 个 public 类型的，还获得了 private 的 `java.lang.Character.CharacterCache`。

（4）e.g：

- `java.lang.Class.getDeclaringClass`；
- `java.lang.reflect.Field.getDeclaredClass()`；
- `java.lang.reflect.Method.getDeclaredClass()`；
- `java.lang.reflect.Constructor.getDeclaredClass()`；

 上面的四个方法都会获得声明该对象的类的 Class 对象实例。

比如下面的测试类：

```
public class TestGetDeclaredMethod {
    
    private int a;

    public TestGetDeclaredMethod() {
    }

    public TestGetDeclaredMethod(int a) {
        this.a = a;
    }

    public int getA() {
        return a;
    }

    public void setA(int a) {
        this.a = a;
    }
}
```

有一个私有属性，getter/setter 方法、两个构造器：

```
@Test
public void test14() {
    Class<TestGetDeclaredMethod> clz = TestGetDeclaredMethod.class;
    
    Class<?> declaringClass = clz.getDeclaringClass();
    System.out.println(declaringClass); // expect output: null

    System.out.println();
    
    for (Field field : clz.getDeclaredFields()) {
        System.out.println(field.getDeclaringClass());
        // expect output: class io.naivekyo.reflection.TestGetDeclaredMethod
    }
    
    System.out.println();
    
    for (Method method : clz.getDeclaredMethods()) {
        System.out.println(method.getDeclaringClass());
        // expect output: 
        // class io.naivekyo.reflection.TestGetDeclaredMethod
        // class io.naivekyo.reflection.TestGetDeclaredMethod
    }

    System.out.println();
    
    for (Constructor<?> constructor : clz.getDeclaredConstructors()) {
        System.out.println(constructor.getDeclaringClass());
        // expect output: 
        // class io.naivekyo.reflection.TestGetDeclaredMethod
        // class io.naivekyo.reflection.TestGetDeclaredMethod
    }
}
```

该测试方法中会打印声明该成员的类的 Class 对象，在这里就是 TestGetDeclaredMethod 对应的 Class 对象，第一次打印为 null 是因为 TestGetDeclaredMethod 没有作为其他类的成员。

此外有一点需要注意的是匿名内部类没有 declaring class，但是有 enclosing class，可以获得声明该 enclosing class 的 Class 对象：

```java
public class AnonymousEnclosingTest {
    
    static Object o = new Object() {
        public void m() {}
    };

    static Class<?> c = o.getClass().getEnclosingClass();

    public static void main(String[] args) {
        System.out.println(c);
        // Expect output: class io.naivekyo.reflection.AnonymousEnclosingTest
        System.out.println(o.getClass().getDeclaringClass());
        // Expect output: null
    }
}
```

（5）`Class.getEnclosingClass()`

该方法返回目标 Class 对象的附着 Class 对象（Enclosing class）

比如：

```java
@Test
public void test15() {
    Class<?> enclosingClass = Thread.State.class.getEnclosingClass();
    System.out.println(enclosingClass);
    // Expect output: class java.lang.Thread

    System.out.println(Thread.class.getEnclosingClass());
    // Expect output: null
}
```

`Thread.State` 枚举是作为 `Thread` 的附着类声明的，因此调用 getEnclosingClass 获得是 Thread 的 Class 对象。

而如果直接调用 `Thread.class.getEnclosingClass()`，Thread 作为 [top level class](https://docs.oracle.com/javase/specs/jls/se7/html/jls-7.html#jls-7.6) 声明，因此返回 null。



### 检查类修饰符和类型

通常会通过一个或多个修饰符声明一个类，这些修饰符将会影响类的运行时行为。

- 访问控制：public、protected、private；
- 需要重写的：abstract；
- 限定只有一个实例：static；
- 禁止修改：final；
- 强制执行严格浮点行为：strictfp；
- 注解

这些修饰符并不一定能作用于所有的类，比如说 interface 就不能被 final 修饰，enum 不能被 abstract 修饰。

`java.lang.reflect.Modifier` 中包含了所有可用的修饰符信息，并提供了一系列方法用于解码 `java.lang.Class#getModifiers` 、`java.lang.reflect.Member#getModifiers` 方法返回的数据。

下面的例子展示了如何获得类声明的各种组件，包括修饰符、泛型参数、实现的接口和继承树，`java.lang.Class` 实现了 `java.lang.reflect.AnnotatedElement` 接口，因此我们也可以在运行时获得注解信息。

```java
public class ClassDeclarationSpy {

    public static void show(String... args) {
        try {
            Class<?> c = Class.forName(args[0]);
            System.out.printf("Class:%n %s%n%n", c.getCanonicalName());
            System.out.printf("Modifiers: %n %s%n%n", Modifier.toString(c.getModifiers()));

            System.out.printf("Type Parameters:%n");
            TypeVariable[] tv = c.getTypeParameters();
            if (tv.length != 0) {
                System.out.printf(" ");
                for (TypeVariable t : tv) {
                    System.out.printf("%s ", t.getName());
                }
                System.out.printf("%n%n");
            } else {
                System.out.printf(" -- No Type Parameters --%n%n");
            }

            System.out.printf("Implemented Interfaces: %n");
            Type[] intfs = c.getGenericInterfaces();
            if (intfs.length != 0) {
                for (Type intf : intfs) {
                    System.out.printf(" %s%n", intf.toString());
                }
                System.out.printf("%n");
            } else {
                System.out.printf(" -- No Implemented Interfaces --%n%n");
            }

            System.out.printf("Inheritance Path:%n");
            List<Class> l = new ArrayList<>();
            printAncestor(c, l);
            if (l.size() != 0) {
                for (Class cl : l) {
                    System.out.printf(" %s%n", cl.getCanonicalName());
                }
                System.out.printf("%n");
            } else {
                System.out.printf(" -- No Super Classes --%n%n");
            }

            System.out.printf("Annotations:%n");
            Annotation[] ann = c.getAnnotations();
            if (ann.length != 0) {
                for (Annotation a : ann) {
                    System.out.printf(" %s%n", a.toString());
                }
                System.out.printf("%n");
            } else {
                System.out.printf(" -- No Annotations --%n%n");
            }

        } catch (ClassNotFoundException e) {
            // production code should handle this exception more gracefully
            e.printStackTrace();
        }
    }
    
    private static void printAncestor(Class<?> c, List<Class> l) {
        Class<?> ancestor = c.getSuperclass();
        if (ancestor != null) {
            l.add(ancestor);
            printAncestor(ancestor, l);
        }
    }
    
    public static void main(String[] args) {
        show("java.util.concurrent.ConcurrentNavigableMap");
    }
}
```

输出：

```
Class:
 java.util.concurrent.ConcurrentNavigableMap

Modifiers: 
 public abstract interface

Type Parameters:
 K V 

Implemented Interfaces: 
 java.util.concurrent.ConcurrentMap<K, V>
 java.util.NavigableMap<K, V>

Inheritance Path:
 -- No Super Classes --

Annotations:
 -- No Annotations --
```

该接口实际声明如下：

```java
public interface ConcurrentNavigableMap<K,V>
    extends ConcurrentMap<K,V>, NavigableMap<K,V> {}
```

注意这是一个接口，它被隐式地声明为 abstract，Java 编译器对所有接口都是这样的处理，上面的 map 包含两个泛型参数 K 和 V，示例代码只是简单打印了它们的名字，通过 `java.lang.reflect.TypeVariable` 接口提供的方法可以查看更多的关于泛型的附加信息。

当然，接口也可以实现其他接口。

下面看看 String 数组的信息：

```java
public static void main(String[] args) {
    show("[Ljava.lang.String;");
}
```

```
Class:
 java.lang.String[]

Modifiers: 
 public abstract final

Type Parameters:
 -- No Type Parameters --

Implemented Interfaces: 
 interface java.lang.Cloneable
 interface java.io.Serializable

Inheritance Path:
 java.lang.Object

Annotations:
 -- No Annotations --
```

因为 arrays 也是运行时对象，JVM 定义了所有的类型信息。注意 arrays 实现了 Cloneable 和 Serializable 接口并且继承自 Object。

下面看一个过失的类：`show("java.security.Identity");`

```
Class:
 java.security.Identity

Modifiers: 
 public abstract

Type Parameters:
 -- No Type Parameters --

Implemented Interfaces: 
 interface java.security.Principal
 interface java.io.Serializable

Inheritance Path:
 java.lang.Object

Annotations:
 @java.lang.Deprecated()
```

获得的注解信息显示该类被 `@Deprecated` 注解标注，是不推荐使用的 API。

### Discover Class Members

Class 类中提供了两种方法用于检索可访问的 fields、methods 和 constructors：

- 枚举所有成员的方法；
- 搜索特定成员的方法；

此外，访问在类上声明的成员的方法和访问父类或者父接口的成员方法是不一样的。

| Class API             | 检索所有成员 | 继承的成员 | 私有成员 |
| --------------------- | ------------ | ---------- | -------- |
| `getDeclaredField()`  | no           | no         | yes      |
| `getField()`          | no           | yes        | no       |
| `getDeclaredFields()` | yes          | no         | yes      |
| `getFields()`         | yes          | yes        | no       |

Method 也和 Field 一样。

| Class API                   | 检索所有成员 | 继承的成员      | 私有成员 |
| --------------------------- | ------------ | --------------- | -------- |
| `getDeclaredConstructor()`  | no           | N/A<sup>1</sup> | yes      |
| `getConstructor()`          | no           | N/A<sup>1</sup> | no       |
| `getDeclaredConstructors()` | yes          | N/A<sup>1</sup> | yes      |
| `getConstructors()`         | yes          | N/A<sup>1</sup> | no       |

<sup>1</sup> ：构造器是不能继承的。

看下面的示例：

```java
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Member;
import static java.lang.System.out;

enum ClassMember { CONSTRUCTOR, FIELD, METHOD, CLASS, ALL }

public class ClassSpy {
    public static void show(String... args) {
        try {
            Class<?> c = Class.forName(args[0]);
            out.format("Class:%n  %s%n%n", c.getCanonicalName());

            Package p = c.getPackage();
            out.format("Package:%n  %s%n%n",
                    (p != null ? p.getName() : "-- No Package --"));

            for (int i = 1; i < args.length; i++) {
                switch (ClassMember.valueOf(args[i])) {
                    case CONSTRUCTOR:
                        printMembers(c.getConstructors(), "Constructor");
                        break;
                    case FIELD:
                        printMembers(c.getFields(), "Fields");
                        break;
                    case METHOD:
                        printMembers(c.getMethods(), "Methods");
                        break;
                    case CLASS:
                        printClasses(c);
                        break;
                    case ALL:
                        printMembers(c.getConstructors(), "Constuctors");
                        printMembers(c.getFields(), "Fields");
                        printMembers(c.getMethods(), "Methods");
                        printClasses(c);
                        break;
                    default:
                        assert false;
                }
            }

            // production code should handle these exceptions more gracefully
        } catch (ClassNotFoundException x) {
            x.printStackTrace();
        }
    }

    private static void printMembers(Member[] mbrs, String s) {
        out.format("%s:%n", s);
        for (Member mbr : mbrs) {
            if (mbr instanceof Field)
                out.format("  %s%n", ((Field)mbr).toGenericString());
            else if (mbr instanceof Constructor)
                out.format("  %s%n", ((Constructor)mbr).toGenericString());
            else if (mbr instanceof Method)
                out.format("  %s%n", ((Method)mbr).toGenericString());
        }
        if (mbrs.length == 0)
            out.format("  -- No %s --%n", s);
        out.format("%n");
    }

    private static void printClasses(Class<?> c) {
        out.format("Classes:%n");
        Class<?>[] clss = c.getClasses();
        for (Class<?> cls : clss)
            out.format("  %s%n", cls.getCanonicalName());
        if (clss.length == 0)
            out.format("  -- No member interfaces, classes, or enums --%n");
        out.format("%n");
    }

    public static void main(String[] args) {
        show("java.lang.ClassCastException", "CONSTRUCTOR");
    }
}
```

此处打印出 `java.lang.ClassCastException` 的基本信息和构造器的信息：

```
Class:
  java.lang.ClassCastException

Package:
  java.lang

Constructor:
  public java.lang.ClassCastException()
  public java.lang.ClassCastException(java.lang.String)
```

因为构造器无法继承，所有这里没有打印出用于构建异常链的构造器（通常这种方法带有 `Throwable` 参数），因为它是在父类 `RuntimeException` 中定义的。

### TroubleShooting

下面展示了使用反射 API 可能出现的异常或者提示信息。

> 编译器警告：... uses unchecked or unsafe operations

调用方法的时候，会检查参数的类型和值，甚至可能发生类型转换。

比如下面的例子：

```java
import java.lang.reflect.Method;
 
public class ClassWarning {
    void m() {
    try {
        Class c = ClassWarning.class;
        Method m = c.getMethod("m");  // warning
 
        // production code should handle this exception more gracefully
    } catch (NoSuchMethodException x) {
            x.printStackTrace();
        }
    }
}
```

很多库提供的方法都使用了泛型进行优化，包括 Class 中的一些方法，例子中 `c` 被声明为原始类型（没有写泛型参数 `Class<?>`），但是它调用 `getMethod()` 方法的参数是泛型，这时就会发生未经检查的类型转换，编译器会生成警告信息。

参考 JSL：

- [Java Language Specification，Java SE 7 Edition](https://docs.oracle.com/javase/specs/jls/se7/html/index.html)
- [Unchecked Conversion](https://docs.oracle.com/javase/specs/jls/se7/html/jls-5.html#jls-5.1.9)
- [Method Invocation Conversion](https://docs.oracle.com/javase/specs/jls/se7/html/jls-5.html#jls-5.3)

有两种解决方案，推荐的做法是为 c 声明一个合适的泛型，比如：

`Class<?> c = warn.getClass();`

或者，使用注解抑制编译器警告行为：

```java
Class c = ClassWarning.class;

@SuppressWarnings("unchecked")
Method m = c.getMethod("m");
```

注意：通常来说，不应该忽略警告信息，因为它可能导致一些 bug。比如上面的例子中使用合适的泛型声明会更好，除非实在没有办法，这时就使用注解抑制编译器。

> 实例化时，没有构造器访问权限

如果使用 `Class.newInstance()` 方法调用无参构造器创建实例，可能会抛出 `InstantiationException`。因为此时无参构造器对调用者是不可访问的（比如 private 修饰，或其他情况）。

`Class.newInstance()` 的行为非常类似直接使用 `new` 关键字，生成失败的原因也是一样的。只不过在反射中可以利用 `java.lang.reflect.AccessibleObject` 类来越过访问限制。

比较遗憾的是 `java.lang.Class` 没有扩展 AccessibleObject，而 `java.lang.reflect.Member` 体系则引入了 AccessibleObject，因此我们可以使用 `Constructor.newInstance()` 因为它继承自 AccessibleObject。

类似这样的操作：

```java
Class<ClassDeclarationSpy> clz = ClassDeclarationSpy.class;

Constructor<ClassDeclarationSpy> noArgsConstructor = clz.getDeclaredConstructor(null);

noArgsConstructor.setAccessible(true);

ClassDeclarationSpy instance = noArgsConstructor.newInstance();
out.println(instance);
```

获取无参构器，然后使用 AccessibleObject 提供的方法获取访问权，最后生成实例。



## 4、Members

Reflection 包中定义了名为 `java.lang.reflect.Member`  的接口，看一下它的继承树：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20221128220640.png)

这一章节要研究的就是它们，包括每种 Member 关联的用于检索声明、类型信息的 API，各自特有的 API（比如设置 Field、调用 Method），以及一些常见的错误。

需要注意的是：自 Java SE 7  Specification 开始，类的成员包括类主体的继承组件，包括字段、方法、嵌套类、接口和枚举类型。由于 Constructor 是不可以继承的，所以它不属于成员（这个成员和 `java.lang.reflect.Member` 的概念不一样）。

### Fields

Fields 包括类型和一个值。`java.lang.reflect.Field` 提供了从一个 Object 中获取类型信息、set/get 值的方法。

#### （1）获取 Field Types

本小节展示如何获取字段的声明类型和泛型类型。

一个字段要么是原始数据类型，要么是引用类型。

- 原始数据类型有八种：boolean、byte、short、int、long、char、float 和 double；
- 引用类型是 `java.lang.Object` 的直接或间接的子类，包括接口、数组和枚举类型。

下面的代码展示了如何获取字段的类和泛型类型：

```java
public class FieldSpy<T> {
    
    public boolean[][] b = { { false, false }, { true, true } };
    
    public String name = "Alice";
    
    public List<Integer> list;
    
    public T val;
    
    public static void retrieveFileTypeInfo(String... args) {
        try {
            Class<?> c = Class.forName(args[0]);
            Field f = c.getField(args[1]);

            System.out.printf("Type: %s%n", f.getType());
            System.out.printf("GenericType: %s%n%n", f.getGenericType());
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        retrieveFileTypeInfo("io.naivekyo.members.FieldSpy", "b");
        retrieveFileTypeInfo("io.naivekyo.members.FieldSpy", "name");
        retrieveFileTypeInfo("io.naivekyo.members.FieldSpy", "list");
        retrieveFileTypeInfo("io.naivekyo.members.FieldSpy", "val");
    }
}
```

预期输出：

```
Type: class [[Z
GenericType: class [[Z

Type: class java.lang.String
GenericType: class java.lang.String

Type: interface java.util.List
GenericType: java.util.List<java.lang.Integer>

Type: class java.lang.Object
GenericType: T
```

字段 b 是一个二维数组，通过 `getType()` 获取的信息等同于对二维数组的 Class 对象调用 `getName()` 方法（`boolean[][].class.getName()`）；

字段 val 是泛型，但是调用 `getType()` 获取到的信息是 `java.lang.Object`，这是因为泛型是通过泛型擦除实现的，这种机制将会在编译器擦除和泛型类型有关的任何信息，因此 T 将会被替换为类型变量的上限，在这个例子中就是 `java.lang.Object`。

（补充：例如 `V extends HashMap`，泛型擦除后 V 就是 HashMap 类型）

`Field.getGenericType()` 在类上存在签名属性的情况下，会去查询相关属性，如果属性不存在（没有泛型），就会回退到 `Field.getType()` ，对于其他的类似 `getGenericXxx()` 的反射 API，相关处理逻辑都是类似的。

#### （2）检索和解析字段修饰符

本小节演示如何获取字段声明的部分，比如 public 或者 transient。

下面展示可以用在字段上的声明修饰符：

- 访问修饰符：public、protected 和 private；
- 涉及字段运行时行为的修饰符：transient、volatile；
- 限制只能拥有一个实例：static；
- 阻止修改字段：final；
- 注解。

`Field.getModifiers()` 方法返回表示该字段修饰符集的一个整数，在 `java.lang.reflect.Modifier` 中定义了这个整数对应的修饰符。

下面的例子展示了如何通过给定的修饰符查找字段、判断字段是否为编译器生成的还是枚举常量。

```java
enum Spy { BLACK, WHITE }

public class FieldModifierSpy {
    
    volatile int share;
    
    int instance;
    
    class Inner {}
    
    private static int modifierFromString(String s) {
        int m = 0x0;
        if ("public".equals(s))
            m |= Modifier.PUBLIC;
        else if ("protected".equals(s))
            m |= Modifier.PROTECTED;
        else if ("private".equals(s))
            m |= Modifier.PRIVATE;
        else if ("static".equals(s))
            m |= Modifier.STATIC;
        else if ("final".equals(s))
            m |= Modifier.FINAL;
        else if ("transient".equals(s))
            m |= Modifier.TRANSIENT;
        else if ("volatile".equals(s))
            m |= Modifier.VOLATILE;
        return m;
    }
    
    public static void retrieveAndParseFieldModifier(String... args) {
        try {
            Class<?> c = Class.forName(args[0]);
            int searchMods = 0x0;
            for (int i = 0; i < args.length; i++) {
                searchMods |= modifierFromString(args[i]);
            }

            Field[] flds = c.getDeclaredFields();
            System.out.printf("Fields in Class '%s' containing modifiers: %s%n", c.getName(), Modifier.toString(searchMods));
            boolean found = false;
            for (Field f : flds) {
                int foundMods = f.getModifiers();
                // Require all of the requested modifiers to be present
                if ((foundMods & searchMods) == searchMods) {
                    System.out.printf("%-8s [ synthetic=%-5b enum_constant=%-5b ]%n", f.getName(), f.isSynthetic(), f.isEnumConstant());
                    found = true;
                }
            }
            
            if (!found) {
                System.out.printf("No matching fields%n");
            }
            System.out.println();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        retrieveAndParseFieldModifier("io.naivekyo.members.FieldModifierSpy", "volatile");
        retrieveAndParseFieldModifier("io.naivekyo.members.Spy", "public");
        retrieveAndParseFieldModifier("io.naivekyo.members.FieldModifierSpy$Inner", "final");
        retrieveAndParseFieldModifier("io.naivekyo.members.Spy", "private", "static", "final");
    }
}
```

预期输出：

```
Fields in Class 'io.naivekyo.members.FieldModifierSpy' containing modifiers: volatile
share    [ synthetic=false enum_constant=false ]

Fields in Class 'io.naivekyo.members.Spy' containing modifiers: public
BLACK    [ synthetic=false enum_constant=true  ]
WHITE    [ synthetic=false enum_constant=true  ]

Fields in Class 'io.naivekyo.members.FieldModifierSpy$Inner' containing modifiers: final
this$0   [ synthetic=true  enum_constant=false ]

Fields in Class 'io.naivekyo.members.Spy' containing modifiers: private static final
$VALUES  [ synthetic=true  enum_constant=false ]
```

从输出的内容中可以看到有些字段没有在源码中显式声明，但是它依旧被打印了出来（比如：`this$0`、`$VALUES`），这是因为编译器要生成一些在运行时使用的合成字段，使用 `Field.isSynthetic()` 方法可以判断该字段是否是编译器合成的。

`this$0` 指内部类（非静态成员类的嵌套类）对外部类的引用。

`$VALUES` 是枚举用于实现隐式定义的静态方法 `values()` 的合成变量；

注意合成的类成员的名称没有显式指定，在所有编译器实现或不同版本中可能不相同。

在 `Class.getDeclaredFields()` 方法返回的数组中包括了这些合成字段，但是 `Class.getField()` 中没有，因为合成的成员通常不是 public 的。

最后因为 Field 实现了 `java.lang.reflect.AnnotatedElement` 接口，所以字段上面也可以标注注解，在运行时可以获取到注解信息，这一点在前面的 Class 章节的 "检测类修饰符和类型" 小节中已经说明了。

#### （3）操控字段值 get/set

在某种情况下不能直接操作某个实例的属性，此时可以通过反射来操作字段的值，但是这种操作违背的类设计的初衷（封装性，对外通过 get/set 操作字段），所以需要谨慎使用。

看下面的例子：

```java
enum Tweedle { DEE, DUM }
public class Book {
    
    public long chapters = 0;
    
    public String[] characters = { "Alice", "White Rabbit" };
    
    public Tweedle twin = Tweedle.DEE;
    
    public static void example(String... args) {
        Book book = new Book();
        String fmt = "%6S: %-12s = %s%n";
        
        try {
            Class<? extends Book> c = book.getClass();
            Field chap = c.getDeclaredField("chapters");

            System.out.printf(fmt, "before", "chapters", chap.getLong(book));
            chap.setLong(book, 12);
            System.out.printf(fmt, "after", "chapters", chap.getLong(book));

            Field chars = c.getDeclaredField("characters");
            System.out.printf(fmt, "before", "characters", Arrays.asList(book.characters));
            
            String[] newChars = { "Queen", "King" };
            chars.set(book, newChars);
            System.out.printf(fmt, "after", "characters", Arrays.asList(book.characters));

            Field t = c.getDeclaredField("twin");
            System.out.printf(fmt, "before", "twin", book.twin);
            t.set(book, Tweedle.DUM);
            System.out.printf(fmt, "after", "twin", t.get(book));

        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        example("io.naivekyo.members.Book");
    }
}
```

注意：通过反射操作字段的值必定会有一定的性能开销，因为要进行各种动态操作，比如验证访问权限。从运行时角度看，通过反射进行的操作和直接在类代码中更改值的效果是一样的。

但是使用反射将导致某些运行时优化策略不生效。

#### （4）可能遇到的问题

> IllegalArgumentException

通常在代码中设置值时，对原始数据类型编译器有时会做自动装/拆箱，但是使用反射就不会，因此会导致一些问题，比如下面的代码：

```java
public class FieldTrouble {
    
    private Integer val;

    public static void main(String[] args) {
        FieldTrouble ft = new FieldTrouble();
        Class<FieldTrouble> c = FieldTrouble.class;
        
        try {
            Field f = c.getDeclaredField("val");
            f.setAccessible(true);
            f.set(ft, 42);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }
}
```

虽然这段代码在我本地跑起来没有问题，但是官方给出的例子说可能会导致产生 `java.lang.IllegalArgumentException` 异常。

因为官方说提示反射获取和设置值编译器不会采用自动装/拆箱机制（毕竟是运行时）。反射只能转换符合 `Class.isAssignableFrom()` 方法规范的两种类型，例子会失败就是因为 `isAssignableFrom()` 方法返回 false。

```java
Integer.class.isAssignableFrom(int.class) == false
int.class.isAssignableFrom(Integer.class) == false
```

> NoSuchFieldException For Non-Public Fields

出现这个问题还得看获取 Field 的方法，是 getFields() 还是 getDecalredFields()，前面已经提到过两者的区别。

> IllegalAccessException when Modifying Final Fields

试图使用反射修改 private 或者 final 变量时可能会出现此种问题。

解决方案也很简单，看异常名可以得出没有权限修改，然后 Field 又扩展了 AccessibleObject，直接强制取得权限即可。



### Method

和字段相比，方法就复杂一些了，毕竟它有返回值、参数，还有可能抛出异常。

反射 API 针对 Method 提供了一些方法用于获取参数类型信息和返回值的信息，还可以调用给定实例上的方法。

#### （1）Obtaining Method Type Information

方法声明包括：方法名、修饰符、参数、返回类型以及抛出的异常，`java.lang.reflection.Method` 类提供了用于获取这些信息的方法。

看下面的例子：

```java
public class MethodSpy {
    
    private static final String fmt = "%24s: %s%n";
    
    <E extends RuntimeException> void genericThrow() throws E {}
    
    public static void retrieveMethods(String... args) {
        try {
            Class<?> c = Class.forName(args[0]);
            Method[] allMethods = c.getDeclaredMethods();
            for (Method m : allMethods) {
                if (!m.getName().equals(args[1])) {
                    continue;
                }
                System.out.printf("%s%n", m.toGenericString());

                System.out.printf(fmt, "ReturnType", m.getReturnType());
                System.out.printf(fmt, "GenericReturnType", m.getGenericReturnType());

                Class<?>[] pType = m.getParameterTypes();
                Type[] gpType = m.getGenericExceptionTypes();
                for (int i = 0; i < pType.length; i++) {
                    System.out.printf(fmt, "ParameterType", pType[i]);
                    System.out.printf(fmt, "GenericParameterType", gpType[i]);
                }

                Class<?>[] xType = m.getExceptionTypes();
                Type[] gxType = m.getGenericExceptionTypes();
                for (int i = 0; i < xType.length; i++) {
                    System.out.printf(fmt, "Exception", xType[i]);
                    System.out.printf(fmt, "GenericExceptionType", gxType[i]);
                }
            }
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        retrieveMethods("java.lang.Class", "getConstructor");
    }
}
```

首先需要注意的是获取泛型的方法，比如 `getGenericReturnType()`，它首先会到类上找相关签名属性，如果没有就会退到调用 `Method.getReturnType()`，也就是说就算没有使用泛型，调用 `getGenericXxx()` 方法也是没有太大影响的，其他的也类似。

其次要注意如果方法参数是可变参数，该参数的类型是 `java.lang.Class`，且实际是一维数组，可以通过调用 `Method.isVarArgs()` 方法来区分。还有就是 `Method.get*Types()` 和 `Class.getName()` 是一样的，这就需要注意泛型擦除了，打印出的泛型的类型实际上是泛型的上界。

最后如果是重载方法，上面的例子会检索打印所有重载的方法，因为它们具有相同的方法名。

TIP：例子中使用了 `Method.getGenericExceptionTypes()` 方法，但是实际环境中很少有方法会返回泛型异常，该 API 的存在仅仅是因为可能存在这种情况。

#### （2）Obtaining Names of Method Parameters

上面我们看了如何获取方法参数的类型，现在看看如何获取参数的名称、方法的其他信息以及构造器的参数。

通过 `java.lang.reflect.Executable.getParameters()` 获取任何方法或构造函数的形参名称。（之前提到，Method 和 Constructor 都继承自 Executable）。

还有一点要注意，`.class` 文件（字节码文件）默认情况下不会存储正式的参数名。原因有以下几点：

- 如果字节码文件包含参数的名称，那么文件就会变大，某些处理 `.class` 文件的工具框架就不得不处理大文件了，JVM 也会使用更多的内存空间；
- 存储参数名将会导致字节码文件占据更多的静态和动态空间；
- 有些特殊的参数名，比如 `secret`、`password` 也会暴露一些安全性较敏感的方法。

如果希望 `.class` 文件能存储方法的形式参数名称，从而可以利用反射 API 获取形参名，可以使用 javac 编译器的参数 `-parameters`。

更多信息可以参考 Oracle 官方给出的 Javac 编译器知识、jls 等等。

#### （3）Retrieving and Parsing Method Modifiers

本小节学习如何访问和解码 Method 的修饰符以及其他信息。

下面展示了可以用在方法声明上的修饰符：

- 访问修饰符：public、protected、private；
- 限制一个实例：static；
- 阻止修改：final；
- 重写：abstract；
- 防止重入：synchronized；
- 其他语言实现的方法：native；
- 强制严格浮点行为：strictfp；
- 注解。

下面的例子展示了如何根据方法名解析相关信息，以及展示该方法的类型：

- 编译器生成：synthetic；
- 可变参数；
- 桥接方法：编译器为泛型接口生成的方法；

```java
public class MethodModifierSpy {
    
    private static int count;
    
    private static synchronized void inc() {
        count++;
    }
    
    private static synchronized int cnt() {
        return count;
    }
    
    public static void example(String... args) {
        try {
            Class<?> c = Class.forName(args[0]);
            Method[] allMethods = c.getDeclaredMethods();
            for (Method m : allMethods) {
                if (!m.getName().equals(args[1]))
                    continue;
                System.out.printf("%s%n", m.toGenericString());
                System.out.printf(" Modifiers: %s%n", Modifier.toString(m.getModifiers()));
                System.out.printf(" [ synthetic=%-5b var_args=%-5b bridge=%-5b ]%n", m.isSynthetic(), m.isVarArgs(), m.isBridge());
                inc();
            }
            System.out.printf("%d matching overload%s found%n", cnt(), (cnt() == 1 ? "" : "s"));
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        //example("java.lang.Object", "wait");
        //example("java.lang.StrictMath", "toRadians");
        //example("io.naivekyo.members.method.MethodModifierSpy", "inc");
        //example("java.lang.Class", "getConstructor");
        example("java.lang.String", "compareTo");
    }
}
```

有两点需要注意：

（1）测试 `Class.getConstrutor()` 方法时，`Method.isVarArgs()` 返回 true ，这意味着此方法是这样的：

```java
public Constructor<T> getConstructor(Class<?>... parameterTypes)
```

而不是：

```java
public Constructor<T> getConstructor(Class<?> [] parameterTypes)
```

（2）测试 String 的 `compareTo()` 方法时，输出是这样的：

```
public int java.lang.String.compareTo(java.lang.String)
 Modifiers: public
 [ synthetic=false var_args=false bridge=false ]
public int java.lang.String.compareTo(java.lang.Object)
 Modifiers: public volatile
 [ synthetic=true  var_args=false bridge=true  ]
2 matching overloads found
```

一个是自身的 `compareTo(String)` 一个用于桥接泛型接口的方法 `compareTo(Object)` 后者是编译器生成的；

在泛型擦除期间，String 继承的 `Comparable.compareTo()` 方法参数从 `java.lang.Object` 变为 `java.lang.String`。由于 Comparable 和 String 中的 compareTo 方法的参数类型在擦除后不再匹配，因此不会发生重写，在其他情况下， 这将产生编译时错误，因为相当于没有实现接口，桥接方法正是为了解决这个问题而出现的。

更详细的解释一下：

```java
public interface Comparable<T> {
 	public int compareTo(T o);   
}
```

泛型擦除后：

```java
public interface Comparable<Object> {
 	public int compareTo(Object o);   
}
```

String ：

```java
public final class String
    implements java.io.Serializable, Comparable<String>, CharSequence {
	...
    compareTo(String anotherString) {...}
}
```

从 OOP 分析，此处不是重写也不是重载，String 应该是没有实现接口的，但是编译器为了不报错，生成了一个方法：`public int java.lang.String.compareTo(java.lang.Object)`，进而实现让 String 实现 Comparable 接口的效果。

#### （4）Invoking Methods

本小节学习利用反射 API 执行方法并获得返回值。

反射 API 提供了一种手段用于调用类上的方法，通常情况下在非反射代码中首先需要将实例转换为目标类型，然后才能调用目标类型的方法。

但是呢，反射中的 Method 可以通过 `java.lang.reflect.Method.invoke()` 方法来实现同样的效果，该方法的第一个参数就是目标实例对象（如果目标方法是 static 的，此参数可以为 null），剩下的参数就是目标方法需要的形参，如果目标方法会抛出异常，反射 API 会将其包装为 `java.lang.reflect.InvocationTargetException`，通过异常链就可以找到原始方法异常（`InvocationTargetException.getCause()`）。

> 通过明确的方法声明去找到并调用目标方法

假设有这样的测试场景：通过反射 API 调用目标类的私有方法：

```java
// 注意这里使用了泛型, 但是方法上没有使用
public class Deet<T> {
    
    private boolean testDeet(Locale l) {
        // 调用 getISO3Language() 方法可能会抛出 MissingResourceException 异常
        System.out.printf("Locale = %s ISO Language Code = %s%n", l.getDisplayName(), l.getISO3Language());
        return true;
    }
    
    private int testFoo(Locale l) {
        return 0;
    }
    
    private boolean testBar() {
        return true;
    }
    
    public static void example(String... args) {
        if (args.length != 4) {
            System.err.format("Usage: java Deet <classname><language><country><variant>%n");
            return;
        }
        
        try {
            Class<?> c = Class.forName(args[0]);
            Object t = c.newInstance();

            Method[] allMethods = c.getDeclaredMethods();
            for (Method m : allMethods) {
                String mName = m.getName();
                if (!mName.startsWith("test") || (m.getGenericReturnType() != boolean.class)) {
                    continue;
                }
                // 这里调用泛型参数也比较巧妙, 如果没有泛型就回退到普通的 getParameterTypes() 方法
                Type[] pType = m.getGenericParameterTypes();
                // 后面的语句可以替换为 Locale.class == pType[0].getClass()
                // 但是现在的处理更加通用一些
                if (pType.length != 1 || Locale.class.isAssignableFrom(pType[0].getClass())) {
                    continue;
                }

                System.out.printf("invoking %s()%n", mName);
                try {
                    m.setAccessible(true);
                    Object o = m.invoke(t, new Locale(args[1], args[2], args[3]));
                    System.out.printf("%s() returned %b%n", mName, (Boolean) o);
                } catch (InvocationTargetException e) {
                    Throwable cause = e.getCause();
                    System.err.format("Invocation of %s failed: %s%n", mName, cause.getMessage());
                }
            }
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        example("io.naivekyo.members.method.Deet", "zh", "ZH", "ZH");
        //example("io.naivekyo.members.method.Deet", "xx", "XX", "XX");
    }
}
```

测试期望输出：

```
invoking testDeet()
Locale = 中文 (ZH,ZH) ISO Language Code = zho
testDeet() returned true

invoking testDeet()
Invocation of testDeet failed: Couldn't find 3-letter language code for xx
```

注意，这个例子中，只有 `testDeet()` 满足匹配条件，如果向 `testDeet()` 传递一个无效参数时，它会抛出一个未检查异常 `java.util.MissingResourceException`，但是在反射中，检查异常和未检查异常的处理没有区别，最终都被包装为 `InvocationTargetException`。

> 调用可变参数方法

`Method.invoke()`  在调用目标方法时可以同时传递多个参数，如果目标方法的参数是可变参数，可以认为接收的是一个数组：

```java
public class InvokeMain {
    
    public static void simulationMain(String... args) {
        for (String arg : args) {
            System.out.println(arg);
        }
    }

    public static void main(String[] args) {
        try {
            Class<?> c = Class.forName("io.naivekyo.members.method.InvokeMain");
            // 可变参数的传递, 可以传递数组
            Class[] argTypes = new Class[] { String[].class };
            // 通过方法名和参数类型确定某个方法
            Method m = c.getDeclaredMethod("simulationMain", argTypes);

            System.out.printf("invoking %s.%s()%n", c.getName(), m.getName());
            
            // static 方法不用指定实例
            String[] methodVarArgs = Arrays.copyOfRange(new String[] { "1", "2", "3", "4"}, 0, 3);
            // 注意这里必须要转型
            m.invoke(null, (Object) methodVarArgs);
        } catch (ClassNotFoundException | NoSuchMethodException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }
}
```

这里有几点需要注意：

通过反射获取形参为 String 类型的可变参数：`Method m = c.getDeclaredMethod("simulationMain", argTypes)`；

利用反射 API 调用静态且形参为可变参数的方法：`m.invoke(null, (Object) methodVarArgs)`；

> invoke() 方法可能需要注意的地方

invoke 方法的声明：

```java
public Object invoke(Object obj, Object... args) {...}
```

它有很多使用方式：

```java
// 假设目标方法是:
 public void ping() { System.out.format("PONG!%n"); }

// 常规调用;
m.invoke(instance);

// 参数为 null, 也可以使用, 但是编译器会警告, 因为 null 参数过于模糊
m.invoke(mtt, null);

// 下面这样就会提示 IllegalArgumentException, 因为无法确定 null 表示空数组参数还是第一个参数是 null
Object arg2 = null;
m.invoke(mtt, arg2);

// 下面这样可以使用, 因为 new Object[0] 创建了一个空数组, 对于拥有可变参数的方法, 这相当于不传递任何参数
m.invoke(mtt, new Object[0]);

// 提示 IllegalArgumentException, 和上面一个例子不一样, 如果空数组用一个对象存储, 它就真的被当作一个对象使用了, 和第二种情况类似
Object arg4 = new Object[0];
m.invoke(mtt, arg4);
```

现在应该可以明白前面的例子为什么要进行转型了：

```java
String[] methodVarArgs = Arrays.copyOfRange(new String[] { "1", "2", "3", "4"}, 0, 3);
m.invoke(null, (Object) methodVarArgs);
```

因为 invoke 需要的是 `Object[]`（再转换一下就等价于 Object，因为数组也继承 Object），而不是 `String[]`；



### Constructor

反射中关于构造函数的 API 定义在类 `java.lang.reflect.Constructor` 中，和 Method 类似，但是有两个主要的不同之处：

- 构造函数没有返回值；
- 调用构造函数为给定类创建一个新的对象实例。

#### （1）Finding Constructors

构造函数的声明包括：名字、修饰符、参数和可能抛出的异常信息，`java.lang.Constructor` 类提供了用于获取这些信息的方法。

下面的例子展示了从指定的类中找到我们想要的构造函数：

```java
public class ConstructorSift {
    
    public static void example(String... args) {
        try {
            Class<?> c = Class.forName(args[0]);
            Class<?> cArg = Class.forName(args[1]);
            Constructor<?>[] allConstructors = c.getDeclaredConstructors();
            for (Constructor<?> ctor : allConstructors) {
                Class<?>[] pType = ctor.getParameterTypes();
                for (int i = 0; i < pType.length; i++) {
                    if (pType[i].equals(cArg)) {
                        System.out.printf("%s%n", ctor.toGenericString());

                        Type[] gpType = ctor.getGenericParameterTypes();
                        for (int j = 0; j < gpType.length; j++) {
                            char ch = (pType[j].equals(cArg) ? '*' : ' ');
                            System.out.printf("%7c%s[%d]: %s%n", ch, "GenericParameterType", j, gpType[j]);
                        }
                        break;
                    }
                }
            }
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        //example("java.util.Formatter", "java.util.Locale");
        example("java.lang.String", "[C");
    }
}
```

如果是可变参数构造函数：

```
example("java.lang.ProcessBuilder", "[Ljava.lang.String;");

// expect output:
public java.lang.ProcessBuilder(java.lang.String...)
      *GenericParameterType[0]: class [Ljava.lang.String;
      
// actual constructor
public ProcessBuilder(String... command)
```

泛型参数的构造函数：

```
example("java.util.HashMap", "java.util.Map");

// expect output:
public java.util.HashMap(java.util.Map<? extends K, ? extends V>)
      *GenericParameterType[0]: java.util.Map<? extends K, ? extends V>
```

最后异常信息的获取和之前 Method 中一样操作，这里就不再赘述了。

#### （2）Creating New Class Instance

有两个反射方法可以构造一个类的实例对象：

- `java.lang.reflect.Constructor.newInstance()`；
- `Class.newInstance()`；

第一个方法是首选方案，因为：

- `Class.newInstance()` 只能调用无参构造器，而 `Constrocutor.newInstance()` 可以调用任意构造函数，不必在乎形参数量；
- `Class.newInstance()` 会抛出任意构造函数可能抛出的异常，不管是 checkd 还是 unchecked。而 `Constructor.newInstance()` 会将这些异常包装为 `InvocationTargetException`；
- `Class.newInstance()` 需要构造函数具有可见性，而 `Constructor.newInstance()` 可以根据需要调用 private 构造器。

考虑这种情况，在构造函数内部实例化对象的某些私有状态，比如说 `java.io.Console` 会在构造函数中设置字符集，下面的例子展示了这是如何实现的：

```java
public class ConsoleCharset {
    public static void example() {
        Constructor<?>[] ctors = Console.class.getDeclaredConstructors();
        Constructor ctor = null;

        for (int i = 0; i < ctors.length; i++) {
            ctor = ctors[i];
            if (ctor.getGenericParameterTypes().length == 0)
                break;
        }
        
        try {
            ctor.setAccessible(true);
            Console c = (Console) ctor.newInstance();
            Field f = c.getClass().getDeclaredField("cs");
            f.setAccessible(true);
            System.out.printf("Console charset         : %s%n", f.get(c));
            System.out.printf("Charset.defaultCharset(): %s%n", Charset.defaultCharset());
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        example();
    }
}
```

Note:

`Class.newInstance()` 只有调用无参构造器且具有访问权限时才会调用成功，否则最好使用 `Constructor.newInstance()` 方法构建实例。

```
Windows system expect output:
Console charset         : x-mswin-936
Charset.defaultCharset(): UTF-8
```



## 5、Arrays and Enumerated Types

从 JVM 的角度看，数组和可枚举的类型都是 classes。在它们身上可以使用很多类中的方法，反射机制也为 arrays 和 enums 提供了特殊的 API，本小节学习如何区分和操作它们，以及常见的错误信息。

### Arrays

Arrays 可以简单分为两部分：类型和长度。对它而言可以直接操作整个数组对象也可以操作数组的每个元素，反射提供了 `java.lang.reflect.Array` 类用于实现操作每个元素的功能。

#### （1）Identifying Array Types

本小节讲述如何利用反射 API 区分类成员是否属于数组类型。

通过 `Class.isArray()` 可以确定某个对象是数组类型。

```java
public class ArrayFind {
    
    public static void find(String... args) {
        boolean found = false;
        try {
            Class<?> cls = Class.forName(args[0]);
            Field[] flds = cls.getDeclaredFields();
            for (Field f : flds) {
                Class<?> c = f.getType();
                if (c.isArray()) {
                    found = true;
                    System.out.printf("%s%n" + "\t\tField: %s%n\t\tType: %s%n\t\tComponent Type: %s%n", f, f.getName(), c, c.getComponentType());
                }
            }
            if (!found) {
                System.out.printf("No array fields%n");
            }
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        find("java.nio.ByteBuffer");
    }
}
```

```
Expect output:
final byte[] java.nio.ByteBuffer.hb
		Field: hb
		Type: class [B
		Component Type: byte
```

`Class.get*Type()` 在 `Class.getName()` 方法注释上有描述， `'['` 字符表示数组类型的维度。

#### （2）Creating New Arrays

和非反射代码中创建数组实例一样，反射 API 也提供了 `java.lang.reflect.Array.newInstance()` 方法用于动态创建指定类型和维度的数组实例。

（回忆前面了解的直接通过 Class 创建实例和通过 Constructor 创建实例的异同。）

看下面的例子：

```java
public class ArrayCreator {
    
    private static String s = "java.math.BigInteger bi[] = { 123, 234, 345 }";
    
    private static Pattern p = Pattern.compile("^\\s*(\\S+)\\s*\\w+\\[\\].*\\{\\s*([^}]+)\\s*\\}");
    
    public static void creator() {
        Matcher m = p.matcher(s);
        
        if (m.find()) {
            String cName = m.group(1);
            String[] cVals = m.group(2).split("[\\s,]+");
            int n = cVals.length;
            
            try {
                Class<?> c = Class.forName(cName);
                Object o = Array.newInstance(c, n);
                for (int i = 0; i < n; i++) {
                    String v = cVals[i];
                    Constructor<?> ctor = c.getConstructor(String.class);
                    Object val = ctor.newInstance(v);
                    Array.set(o, i, val);
                }
                Object[] oo = (Object[]) o;
                System.out.printf("%s[] = %s%n", cName, Arrays.toString(oo));
            } catch (ClassNotFoundException | NoSuchMethodException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            } catch (InstantiationException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) {
        creator();
    }
}
```

```
Expect Output:
java.math.BigInteger[] = [123, 234, 345]
```

上面的例子展示了如何通过反射 API 构建并填充数组实例。如果类型直到运行时才可以直到，那么就可以使用反射，具体步骤如下：

- 使用 `Class.forName()` 获取 Class 对象并实例化一个对象；
- 通过数组的每个元素特定的构造器来实例化数组成员；
- 通过数组反射 API 为数组实例填充元素对象；

#### （3）Getting/Setting Arrays and Their Components

在非反射代码中，我们可以设置和遍历数组元素，而如果使用反射 API，则可以这样：

- 使用 `java.lang.reflect.Field.set(Object obj, Object value)` 设置数组元素实例；
- 通过 `Field.get(Object)` 获取数组元素；
- 在调用 `java.lang.reflect.Array` 提供的 API 中调用上面两个方法就可以了。

这些方法也支持可以自动扩展的数据类型，因此，`Array.getShort()` 可以用来设置 int 数组的值，因为 16 位的 short 可以扩展为 32 位的 int 而不会丢失数据；另一方面，如果在一个 int 类型的数组上调用 `Array.setLong()` 方法则会抛出 IllegalArgumentException，因为 64 位的 long 类型不能在不丢失数据的前提下缩小到 32 位的 int 类型。具体信息可以参考 Java 语言规范中的 [Widening Primitive Conversion](https://docs.oracle.com/javase/specs/jls/se7/html/jls-5.html#jls-5.1.2) 和 [Narrowing Primitive Conversion](https://docs.oracle.com/javase/specs/jls/se7/html/jls-5.html#jls-5.1.3) 章节。

数组的引用类型（包括数组的数组）都可以使用 Array 反射 API 进行相关操作，比如 `Array.set(Object array, int index, int value)` 和 `Array.get(Object array, int index)`。

> Setting a Field of Type Array

```java
public class GrowBufferedReader {
    
    private static final int srcBufSize = 10 * 1024;
    
    private static char[] src = new char[srcBufSize];
    
    static {
        src[srcBufSize - 1] = 'x';
    }
    
    private static CharArrayReader car = new CharArrayReader(src);

    public static void example(String... args) {
        try {
            BufferedReader br = new BufferedReader(car);

            Class<? extends BufferedReader> c = br.getClass();
            Field f = c.getDeclaredField("cb");
            
            f.setAccessible(true);
            char[] cbVal = char[].class.cast(f.get(br));

            char[] newVal = Arrays.copyOf(cbVal, cbVal.length * 2);
            if (args.length > 0 && args[0].equals("grow"))
                f.set(br, newVal);

            for (int i = 0; i < srcBufSize; i++) {
                br.read();
            }
            
            // 查看是否使用的是新的数组
            if (newVal[srcBufSize - 1] == src[srcBufSize - 1])
                System.out.printf("Using new backing array, size = %d%n", newVal.length);
            else
                System.out.printf("Using original backing array, size = %d%n", cbVal.length);
        } catch (NoSuchFieldException | IllegalAccessException | IOException e) {
            e.printStackTrace();
        }
    }
    
    public static void main(String[] args) {
        example("grow");
        example();
    }
}
```

```
Expect output:
Using new backing array, size = 16384
Using original backing array, size = 8192
```

> Accessing Elements of a Multidimensional Array

多维数组其实就是简单的嵌套数组，比如说二维数组就是数组的数组，三维数组是二维数组的数组，以此类推。

下面的例子展示了如何通过反射 API 创建和初始化多维数组：

```java
public class CreateMatrix {

    public static void main(String[] args) {
        Object matrix = Array.newInstance(int.class, 2, 2);
        Object row0 = Array.get(matrix, 0);
        Object row1 = Array.get(matrix, 1);

        Array.setInt(row0, 0, 1);
        Array.setInt(row0, 1, 2);
        Array.setInt(row1, 0, 3);
        Array.setInt(row1, 1, 4);

        for (int i = 0; i < 2; i++) {
            for (int j = 0; j < 2; j++) {
                System.out.printf("matrix[%d][%d] = %d%n", i, j, ((int[][]) matrix)[i][j]);
            }
        }
    }
}
```

```
Expect Output:
matrix[0][0] = 1
matrix[0][1] = 2
matrix[1][0] = 3
matrix[1][1] = 4
```

拥有可变参数的方法 `Array.newInstance(Class<?> componentType, int... dimensions)` 提供了创建多维数组的方式。但是组件仍然需要使用多维数组是嵌套数组的原则进行初始化（注意反射 API 并不提供多维数组的 get/set 方法）。

### Enumerated Types

在反射代码中操作枚举其实和操作普通类一样。`Class.isEnum()` 判断某个 Class 是否是枚举类型。`Class.getEnumConstants()` 则检索定义在 enum 中的常量。`java.lang.reflect.Field.isEnumConstant()` 方法则判断类成员是否是枚举类型。

#### （1）Examining Enums

演示检索枚举类型的常量及其他字段、构造器、方法。

反射提供了以下几个方法：

- `Class.isEnum()`：判断 class 是否是枚举类型；
- `Class.getEnumConstants()`：按照常量在枚举中定义的顺序检索；
- `java.lang.reflect.Field.isEnumConstant()`：判断字段是否是枚举元素类型。

有时候需要去动态检索枚举常量；在非反射代码中可以调用编译器隐式生成的 `values()` 方法获取所有常量。

```java
public class EnumConstants {
    
    enum Eon {
        HADEAN, ARCHAEAN, PROTEROZOIC, PHANEROZOIC
    }
    
    public static void retrieve(String... args) {
        try {
            Class<?> c = args.length == 0 ? Eon.class : Class.forName(args[0]);
            System.out.printf("Enum name: %s%nEnum constants: %s%n", c.getName(), Arrays.asList(c.getEnumConstants()));
            if (c == Eon.class)
                System.out.printf("  Eon.values(): %s%n", Arrays.asList(Eon.values()));
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        retrieve("java.lang.annotation.RetentionPolicy");
        System.out.println();
        retrieve("java.util.concurrent.TimeUnit");
        System.out.println();
        retrieve();
    }
}
```

```
Enum name: java.lang.annotation.RetentionPolicy
Enum constants: [SOURCE, CLASS, RUNTIME]

Enum name: java.util.concurrent.TimeUnit
Enum constants: [NANOSECONDS, MICROSECONDS, MILLISECONDS, SECONDS, MINUTES, HOURS, DAYS]

Enum name: io.naivekyo.array_enum.EnumConstants$Eon
Enum constants: [HADEAN, ARCHAEAN, PROTEROZOIC, PHANEROZOIC]
  Eon.values(): [HADEAN, ARCHAEAN, PROTEROZOIC, PHANEROZOIC]
```

因为枚举也是 Class，所以可以通过其他反射 API 获取相应的信息，比如 Field、Method、Constructor。

```java
public class EnumSpy {
    
    private static final String fmt = "  %11s: %s %s%n";
    
    public static void spy(String... args) {
        try {
            Class<?> c = Class.forName(args[0]);
            if (!c.isEnum()) {
                System.out.printf("%s is not an enum type%n", c);
                return;
            }
            System.out.printf("Class: %s%n", c);

            Field[] flds = c.getDeclaredFields();
            List<Field> cst = new ArrayList<>();    // enum constants
            List<Field> mbr = new ArrayList<>();    // member fields
            for (Field f : flds) {
                if (f.isEnumConstant())
                    cst.add(f);
                else 
                    mbr.add(f);
            }
            if (!cst.isEmpty())
                print(cst, "Constant");
            if (!mbr.isEmpty())
                print(mbr, "Field");

            Constructor<?>[] ctors = c.getDeclaredConstructors();
            for (Constructor<?> ctor : ctors) {
                System.out.printf(fmt, "Constructor", ctor.toGenericString(), synthetic(ctor));
            }

            Method[] mths = c.getDeclaredMethods();
            for (Method m : mths) {
                System.out.printf(fmt, "Method", m.toGenericString(), synthetic(m));
            }
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
    
    private static void print(List<Field> lst, String s) {
        for (Field f : lst) {
            System.out.printf(fmt, s, f.toGenericString(), synthetic(f));
        }
    }
    
    private static String synthetic(Member m) {
        return (m.isSynthetic() ? "[ synthetic ]" : "");
    }

    public static void main(String[] args) {
        spy("java.lang.annotation.RetentionPolicy");
    }
}
```

```
Expect output:
Class: class java.lang.annotation.RetentionPolicy
     Constant: public static final java.lang.annotation.RetentionPolicy java.lang.annotation.RetentionPolicy.SOURCE 
     Constant: public static final java.lang.annotation.RetentionPolicy java.lang.annotation.RetentionPolicy.CLASS 
     Constant: public static final java.lang.annotation.RetentionPolicy java.lang.annotation.RetentionPolicy.RUNTIME 
        Field: private static final java.lang.annotation.RetentionPolicy[] java.lang.annotation.RetentionPolicy.$VALUES [ synthetic ]
  Constructor: private java.lang.annotation.RetentionPolicy() 
       Method: public static java.lang.annotation.RetentionPolicy[] java.lang.annotation.RetentionPolicy.values() 
       Method: public static java.lang.annotation.RetentionPolicy java.lang.annotation.RetentionPolicy.valueOf(java.lang.String) 
```

注意：出于各种原因，包括对枚举类型的支持，枚举常量在枚举中定义的顺序非常重要。`Class.getFields()`、`Class.getDeclaredFields()` 则不保证获取的数据信息和在原有类中定义的顺序一致，如果程序对顺序有要求，则可以使用 `Class.getEnumConstants()`。

#### （2）Getting/Setting Fields with Enum Types

类中存储枚举的成员是引用类型，可以使用 `Field.set()` 和 `Field.get() `方法。

```java
public class SetTrace {
    
    enum TraceLevel { OFF, LOW, MEDIUM, HIGH, DEBUG }
    
    static class MyServer {
        private TraceLevel level = TraceLevel.OFF;
    }
    
    public static void example(String... args) {
        TraceLevel newLevel = TraceLevel.valueOf(args[0]);
        
        try {
            MyServer svr = new MyServer();
            Class<? extends MyServer> c = svr.getClass();
            Field f = c.getDeclaredField("level");
            f.setAccessible(true);
            TraceLevel oldLevel = (TraceLevel) f.get(svr);
            System.out.printf("Original trace level: %s%n", oldLevel);
            
            if (oldLevel != newLevel) {
                f.set(svr, newLevel);
                System.out.printf("  New trace level: %s%n", f.get(svr));
            }
        } catch (NoSuchFieldException | IllegalAccessException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        example("OFF");
        example("DEBUG");
    }
}
```

```
Expect output:
// case1
Original trace level: OFF

// case2
Original trace level: OFF
  New trace level: DEBUG
```



# 四、动态代理类

参考：

- https://docs.oracle.com/javase/8/docs/technotes/guides/reflection/proxy.html

## 1、简介

动态代理类是指在运行时实现指定的接口列表的类，通过调用该类的实例上的某个方法（该方法来自某个接口）将该实例编码并通过统一接口分派给另外一个对象。

因此，可以使用动态代理类为一组接口创建类型安全的代理对象，而不需要像使用编译时工具那样预先生成代理类。

动态代理类实例方法的调用动作将会分派给实例的 invocation handler 的某个方法（该方法使用 `java.lang.reflect.Method` 对象封装并通过一个数组类型的 Object 传递参数列表）。

在应用程序或者类库中如果需要为某个特定的接口 API 使用类型安全的反射调度处理，此时动态代理类将会非常有用。

比如说，在应用程序中可以使用动态代理类去创建一个实现任意事件监听接口的对象（这种接口可以实现 `java.util.EventListener`），这样就可以通过统一的方式去处理不同类型的事件，比如将此类事件记录到同一个文件中。

## 2、Dynamic Proxy Class API

有三个概念：

- 动态代理类（下面简称代理类）是这样的：在运行时被创建的时候实现某个接口；
- 代理接口：被代理类实现的接口；
- 代理对象：代理类的实例。

### Creating a Proxy Class

通过 `java.lang.reflect.Proxy` 类提供的一些静态方法去创建代理类的实例。

`Proxy.getProxyClass()` 方法通过类加载器和指定接口就可以获取代理类的 `java.lang.Class` 对象。代理类将在指定的类加载器中定义并实现所有提供的接口，如果目标代理类已经存在，则返回已存在的代理类，否则将通过类加载器动态生成代理类。

下面是 `Proxy.getProxyClass()` 方法所需参数的一些限制：

- 提供的所有接口的 Class 对象都必须是已经存在的接口，不能是类或者原始类型；
- 接口数组中不能存在两个同时引用一个 Class 对象的引用；
- 提供的类加载器必须可以访问提供的接口列表（访问权限问题）；
- 所有非 public 的接口必须在同一个 package 下，否则代理类就不能实现所有接口；
- 这些接口中的方法需要具有以下特点：
  - 如果有方法返回的是基础数据类型或者 Void，那么所有接口方法必须返回同样的类型；
  - 否则的话，其中一个方法的返回类型必须可以赋给其他方法返回的类型（相当于继承中的父类和子类的关系）。
- 生成的代理类必须符合 JVM 对常规类的限制：比如 JVM 限制类最多能实现 65535 个接口。

如果违反了上述任何一条规则，`Proxy.getProxyClass()` 方法将会抛出 IllegalArgumentException。如果接口 Class 数组中存在 null，就会抛出空指针异常。

需要注意的是：指定的代理接口的顺序非常重要，具有相同的接口组合但是顺序不同，将会产生两个代理类，代理类将会根据其代理接口的顺序进行区分。

这样就不用每次调用 getProxyClass 方法就要重新生成一个代理类，实现代理类的 API 将会维持一个缓存用于存储已经生成的代理类（类似 key-value，只不过 key 是对应的类加载器和接口列表顺序），同时注意实现不能引用类加载器、接口和代理类，以免类加载器及所有类在适当的时候被垃圾回收。

### Proxy Class Properties

一个代理类具有以下属性：

- 代理类的修饰符是 `public final` 的，不能是 `abstract`；
- 代理类的非限定名称没有指明，只是通过 `"$Proxy"` 表示这是一个 JDK 动态生成的代理类；
- 代理类都继承自 `java.lang.reflect.Proxy`；
- 代理类按照接口组合的顺序去实现接口中的方法；
- 如果代理类实现了一个非 public 类型的接口，那么该代理类将被定义在和该接口相同的 package 下。否则的话，代理类的包也是没有指定的，注意 package sealing 不会阻止代理类在运行时在特定的包中成功创建，也不会阻止已经在相同的类加载器和具有特定签名的相同包中定义的类。
- 代理类在被创建的时候就实现了所有相关的接口，调用代理类的 Class 对象的 getInterfaces 方法将会返回一个接口数组（数组元素的顺序和代理类声明时指定的接口顺序一致）。调用 Class 对象的 getMethods 将会返回 Method 对象数组，其中包含实现接口中的所有方法，其他的反射 API 和正常的类效果一样；
- 如果目标 Class 对象是代理类（通过 `Proxy.getProxyClass` 或者 `Proxy.newProxyInstance` 方法生成的实例的 Class 对象），那么调用 `Proxy.isProxyClass()` 方法会返回 true，否则返回 false，在进行某些安全操作时通过此方法去判断是否是代理类是非常重要的，可以防止运行时恶意生成的代理类对象进行某些操作；
- 代理类的 `java.security.ProtectionDomain` 和通过 bootstrap class loader 加载的系统类一样，比如 `java.lang.Object`，因为生成代理类的代码是可以信任的系统代码。拥有这种 ProtectionDomain 的将会被授予 `java.security.AllPermission`（也就是所有权限）。

### Creating a Proxy Instance

所有的代理类都拥有一个 public 类型的只拥有一个参数的构造器，这个参数就是接口 `InvocationHandler` 的实现。

每个代理类实例都关联一个 invocation handler 对象，这个对象将会传递给代理类的构造器。如果不想使用反射 API 获取代理类的 public 构造器，则可以使用 `Proxy.newProxyInstance` 方法去创建代理类实例，这个方法组合了两个操作：将 invocation handler 对象传递给代理类的构造方法，然后调用 `Proxy.getProxyClass` 去调用代理类的构造方法生成实例。

`Proxy.newProxyInstance` 抛出 IllegalArgumentException 的原因和 `Proxy.getProxyClass` 方法一样。

### Proxy Instance Properties

代理实例有下列属性：

- 如果有一个代理类实例 proxy，以及一个代理类实现的接口类型 Foo

该表达式返回 true：`proxy instanceof Foo`；

该转型操作是可行的，并且不会抛出 ClassCastException：`(Foo) proxy`;

- 静态方法 `Proxy.getInvocationHandler` 接收一个代理类实例并返回和该代理类关联的 invocation handler 实例；
- 调用代理类实例实现的某个接口的方法，该方法会被包装为 Method 对象（该 Method 的声明类是所属接口）然后作为参数传递给和该代理类关联的 invocation handler 实例的 `invoke()` 方法，更多信息请参见该方法的声明；
- 调用代理类继承自 `java.lang.Object` 中的 hashCode、equals 或者 toString 方法，具体处理流程和上一步一样，都需要传递给 InvocationHandler 实例的 invoke 方法（Method 对象的声明类是 Object.class）。同时要注意其他继承自 Object 的 public 方法不会被重写。

### 多个代理接口都有的方法

（1）如果代理类实现的接口中，存在两个或更多的相同的方法（名称和参数一致），那么代理类实现接口时声明的顺序就非常重要了，如果调用该重复的方法，则传递给 InvocationHandler 实例的 Method 对象的声明类将是代理类实现接口中的最前面的接口；

（2）如果代理类实现的接口中有和 `java.lang.Object` 中 public、非 final 的方法一样的方法，那么调用该方法时，传递给 invoke 方法的 Method 对象的声明类是 Object.class，它位于所有其他接口之前；

（3）最后需要注意的一点是重复方法传递给 invoke 方法后，invoke 方法抛出的异常只会是所有可以调用该方法的代理接口中的异常类型中的 checked exception。而如果 invoke 方法抛出的异常不属于代理类实现所有接口中的方法声明的异常类型，那么 invoke 会将其包装为 `UndeclaredThrowableException`。

## 3、Serialization

因为 `java.lang.reflect.Proxy` 类实现了 `java.io.Serializabel`，所以代理类的实例也是可以被序列化的。

如果一个代理实例中关联的 InvocationHandler 实例没有实现 `java.io.Serializable` 接口，那么当该代理实例通过 `java.io.ObjectOutputStream` 进行序列化时就会抛出 `java.io.NotSerializableException`。

注意，对于代理类，实现 `java.io.Externalizable` （该接口继承自 Serializable 接口）在序列化方面的效果和实现 `java.io.Serializable` 接口效果是相同的：在序列化的过程中 proxy 实例或者 invocation handler 实例永远不会调用 Externalizable 接口的 writeExternal 和 readExternal 方法。和其他 Class 对象一样，代理类也是可以序列化的。

注意：代理类没有可供序列化的字段，且 serialVersionUID 也是 0L。换句话说，当代理类实例的 Class 对象被传递给 `java.io.ObjectStreamClass` 的静态方法 `lookup` 时，方法返回的 `ObjectStreamClass` 实例会具有以下属性：

- 调用 `getSerialVersionUID` 方法返回 0L；
- 调用 `getFields` 方法返回的数组长度为 0；
- 调用 `getField` 方法并传递字符串参数，最终返回 null。

对象序列化的流协议支持这样的类型代码：TC_PROXYCLASSDESC，这个代码流格式语法中的终止语法，它的类型和值在 `java.io.ObjectStreamConstants` 接口中定义。

更多关于代理实例序列化的信息请参考：https://docs.oracle.com/javase/8/docs/technotes/guides/reflection/proxy.html

## 4、Example

下面展示了如何构造动态代理类实现多个接口，代理接口中的方法并在方法调用前后做一些操作：

目标接口和目标类：

```java
public interface Foo {
    Object bar(Object obj) throws IllegalArgumentException;
}
```

```java
public class FooImpl implements Foo {
    @Override
    public Object bar(Object obj) throws IllegalArgumentException {
        // ...
        return null;
    }
}
```

代理类的 InvocationHandler：

```java
public class DebugProxy implements InvocationHandler {
    
    private Object obj;
    
    public static Object newInstance(Object obj) {
        return Proxy.newProxyInstance(obj.getClass().getClassLoader(), obj.getClass().getInterfaces(), new DebugProxy(obj));
    }

    private DebugProxy(Object obj) {
        this.obj = obj;
    }


    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        Object result;
        try {
            System.out.println("before method " + method.getName());
            result = method.invoke(obj, args);
        } catch (InvocationTargetException e) {
            throw e.getTargetException();
        } catch (Exception e) {
            throw new RuntimeException("unexpected invocation exception: " + e.getMessage());
        } finally {
            System.out.println("after method " + method.getName());
        }
        
        return result;
    }
}
```

下面演示如何通过 InvocationHandler 创建代理类实例，并且调用代理方法：

```java
public class MainTest {
    public static void main(String[] args) {
        Foo foo = (Foo) DebugProxy.newInstance(new FooImpl());
        foo.bar(null);
        System.out.println(foo.getClass());
    }
}
```

```
Expect output:
before method bar
after method bar
class com.sun.proxy.$Proxy0
```

