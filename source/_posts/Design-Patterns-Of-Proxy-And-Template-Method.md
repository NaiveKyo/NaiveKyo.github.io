---
title: Design Patterns Of Proxy And Template Method
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221341.jpg'
coverImg: /img/20220225221341.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-21 10:34:09
summary: "设计模式之代理模式、模板方法模式"
categories: "Design Patterns"
keywords: "Design Patterns"
tags: "Design Patterns"
---

# 一、代理模式

在有些情况下，一个客户不能或者不想直接访问另一个对象，这时需要找一个中介帮忙完成某项任务，这个中介就是代理对象。例如，购买火车票不一定要去火车站买，可以通过 12306 网站或者去火车票代售点买。



在软件设计中，使用代理模式的例子也很多，例如，要访问的远程对象比较大（如视频或大图像等），其下载要花很多时间。还有因为安全原因需要屏蔽客户端直接访问真实对象，如某单位的内部数据库等。



## 1、代理模式定义与特点

代理模式的定义：由于某些原因需要给某对象提供一个代理以控制对该对象的访问。这时，访问对象不适合或者不能直接引用目标对象，代理对象作为访问对象和目标对象之间的中介。



代理模式的主要优点有：

- 代理模式在客户端与目标对象之间起到一个中介作用和保护目标对象的作用；
- 代理对象可以扩展目标对象的功能；
- 代理模式能将客户端与目标对象分离，在一定程度上降低了系统的耦合度，增加了程序的可扩展性



主要缺点：

- 代理模式会造成系统设计中类的数量增加
- 在客户端和目标对象之间增加一个代理对象，会造成请求处理速度变慢；
- 增加了系统的复杂度；



**如何解决以上缺点：使用`动态代理`**



## 2、代理模式（Proxy）

基本介绍：

- 代理模式：为一个对象 **提供一个替身** ，以控制这个对象的访问，即通过代理对象访问目标对象，这样做的好处：可以在目标对象实现的基础上，增强额外的功能操作，即扩展目标对象的功能
- 被代理的对象可以是 `远程对象`、**创建开销大的对象**或者 **需要安全控制的对象**
- 代理模式有不同的形式：主要有三种：静态代理、动态代理（JDK 代理、接口代理） 和 Cglib代理（可以在内存中动态的创建对象，而不是实现接口，它属于动态代理的范畴）



## 3、静态代理

基本介绍：

静态在使用时，需要定义接口或者父类，被代理对象（即目标对象）与代理对象一起实现相同的接口或者是继承相同父类

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425103538.png)

应用实例：

- 定义接口 ITeacherDao
- 目标对象 TeacherDao 实现接口 ITeacherDao
- 使用静态代理方式，就需要在代理对象 TeacherDAOProxy 中也实现 ITeacherDao
- 调用的时候通过调用代理对象的方法来调用目标对象
- **Tip：**代理对象与目标对象要实现相同的接口，然后通过调用相同的方法来调用目标对象的方法



> 优缺点分析

- 优点：在不修改目标对象的功能前提下，能通过代理对象扩展目标对象的功能
- 缺点：因为代理对象需要与目标对象实现一样的接口，所以会有很多代理类
- 一旦增加接口方法，目标对象与代理对象都要维护



## 4、动态代理

基本介绍：

- 代理对象，不需要实现接口，但是目标对象要实现接口，否则不能使用动态代理
- 代理对象的生成，是利用 **JDK 的 API**，动态的在内存中构建代理对象
- 动态代理也叫做：JDK 代理、接口代理



> JDK 中生成代理对象的 API

- 代理类所在的包：`java.lang.reflect.Proxy`

- JDK 实现代理只需要使用 `newProxyInstance` 方法，但是该方法需要接收三个参数，完整的写法

  ```java
  public class TeacherProxyFactory {
  
      // 维护要代理目标的接口
      private Object target;
  
      // 构造器，初始化 target
      public TeacherProxyFactory(Object target) {
          this.target = target;
      }
  
      // 动态代理
      public Object getProxyInstance() {
          /**
           * 参数说明
           * ClassLoader 指定目标对象使用的类加载器，获取加载器的方法固定
           * Class<?>[] interfaces 目标对象实现的接口类型，使用泛型确认类型
           * InvocationHandler 事件处理，执行目标对象的方法
           */
          return Proxy.newProxyInstance(
                  target.getClass().getClassLoader(),
                  target.getClass().getInterfaces(),
                  (proxy, method, args) -> {
                      // JDK 代理
                      System.out.println("JDK 开始代理");
                      // 反射机制调用目标对象的方法
                      Object invoke = method.invoke(target, args);
  
                      return invoke;
                  });
      }
  }
  ```

  或者

  ```java
  public class ProxyInvocationHandler implements InvocationHandler {
  
      // 维护要代理的接口
      private Object targetInterface;
  
      public ProxyInvocationHandler(Object targetInterface) {
          this.targetInterface = targetInterface;
      }
  
      // 使用 JDK 的 API
      public Object newProxyInstance() {
  
          return Proxy.newProxyInstance(
                  this.getClass().getClassLoader(),
                  this.targetInterface.getClass().getInterfaces(),
                  this
                  );
      }
  
      @Override
      public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
          // 可以做一些其他的操作
          System.out.println("代理的方法: " + method.getName());
  
          // 代理方法
          return method.invoke(this.targetInterface, args);
      }
  }
  ```

  

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425103614.png)



**两种使用方法：**

- 使用工厂方法：例如 ProxyFactory
- 直接实现 InvocationHandler 接口，不是以工厂方法的形式



## 5、Cglib 代理

基本介绍：

- 静态代理和 JDK 代理模式都要求目标对象是实现一个接口，但是有时候目标对象只是一个单独的对象，并没有实现任何的接口，这个时候可使用对象子类来实现代理，这就是 Cglib 代理
- Cglib 代理也叫做子类代理，它是在内存中构建一个子类对象从而实现对目标对象功能扩展，有些书也将 Cglib 代理归属到动态代理
- Cglib 是一个强大的高性能的代码生成包，它可以在运行期间扩展 Java 类与实现 Java 接口，它广泛的被许多 AOP 的框架使用，例如 Spring AOP，实现方法拦截
- 在 AOP 编程中如何选择代理模式：
  1. 目标对象需要实现接口，用 JDK 代理
  2. 目标对象不需要实现接口，用 Cglib 代理
- Cglib 包的底层是通过使用字节码处理框架 ASM 来转换字节码并生成新的类



> 使用 Cglib

- 导入包

  ```xml
  <dependency>
      <groupId>org.ow2.asm</groupId>
      <artifactId>asm</artifactId>
      <version>9.1</version>
  </dependency>
  
  <dependency>
      <groupId>org.ow2.asm</groupId>
      <artifactId>asm-commons</artifactId>
      <version>9.1</version>
  </dependency>
  
  <dependency>
      <groupId>org.ow2.asm</groupId>
      <artifactId>asm-tree</artifactId>
      <version>9.1</version>
  </dependency>
  
  <dependency>
      <groupId>cglib</groupId>
      <artifactId>cglib</artifactId>
      <version>3.3.0</version>
  </dependency>
  ```

- 在内存中动态构建子类，注意代理的类不能为 final，否则会报错

  ```java
  java.lang.IllegalArgumentException
  ```

- 目标对象的方法如果为 final/static，那么就不会被拦截，即不会执行目标对象额外的业务方法

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425103636.png)

## 6、代理模式（Proxy）的变体

几种常见的代理模式介绍：

- 防火墙代理

  内网通过代理穿透防火墙，实现对公网的访问

- 缓存代理

  比如：当请求图片文件时，先到缓存代理取，如果取到资源就返回，如果取不到资源，再到公网或数据库取，然后缓存

- 远程代理

  **远程对象的本地代理**，通过它可以把 远程对象当作本地对象 来调用。远程代理通过网络和真正的远程对象沟通信息

- 同步代理

  主要使用在多线程中，完成多线程间同步工作

- 安全代理

  这种方式通常用于控制不同种类客户对真实对象的访问权限。

- 智能指引

  主要用于调用目标对象时，代理附加一些额外的处理功能。例如，增加计算真实对象的引用次数的功能，这样当该对象没有被引用时，就可以自动释放它。

- 延迟加载

  指为了提高系统的性能，延迟对目标的加载





# 二、模板方法模式

在面向对象程序设计过程中，程序员常常会遇到这种情况：设计一个系统时知道了算法所需的关键步骤，而且确定了这些步骤的执行顺序，但某些步骤的具体实现还未知，或者说某些步骤的实现与具体的环境相关。





## 1、模板的定义与特点

模板方法（Template Method）模式的定义如下：定义一个操作中的算法骨架，而将算法的一些步骤延迟到子类中，使得子类可以不改变该算法结构的情况下重定义该算法的某些特定步骤。它是一种**类行为型模式**。



主要优点：

- 它封装了不变部分，扩展可变部分。它把认为是不变部分的算法封装到父类中实现，而把可变部分算法由子类继承实现，便于子类继续扩展。
- 它在父类中提取了公共的部分代码，便于代码复用。
- 部分方法是由子类实现的，因此子类可以通过扩展方式增加相应的功能，符合开闭原则。



主要缺点：

- 对每个不同的实现都需要定义一个子类，这会导致类的个数增加，系统更加庞大，设计也更加抽象，间接地增加了系统实现的复杂度。
- 父类中的抽象方法由子类实现，子类执行的结果会影响父类的结果，这导致一种反向的控制结构，它提高了代码阅读的难度。
- 由于继承关系自身的缺点，如果父类添加新的抽象方法，则所有子类都要改一遍。



## 2、模式的结构和实现

主要角色：

- **抽象类/抽象模板（Abstract Class）**
- 抽象模板类，负责给出一个算法的轮廓和骨架。它由一个模板方法和若干个基本方法构成。这些方法的定义如下。
  - 模板方法：定义了算法的骨架，按某种顺序调用其包含的基本方法。
  - 基本方法：是整个算法中的一个步骤，包含以下几种类型。
    - 抽象方法：在抽象类中声明，由具体子类实现。
    - 具体方法：在抽象类中已经实现，在具体子类中可以继承或重写它。
    - 钩子方法：在抽象类中已经实现，包括用于判断的逻辑方法和需要子类重写的空方法两种。
- **具体子类/具体实现（Concrete Class）**
- 具体实现类，实现抽象类中所定义的抽象方法和钩子方法，它们是一个顶级逻辑的一个组成步骤。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425103709.png)



## 3、案例分析

豆浆制作过程：

- 制作豆浆的流程：选材 -- 添加配料 -- 浸泡 -- 放到豆浆机打碎
- 通过添加不同的配料，可以制作出口味不同的豆浆
- 选材、浸泡和放到豆浆机打碎这几个步骤对于制作每种口味的豆浆都是一样的
- 使用 **模板方法模式** 完成



## 4、模板方法模式中的钩子方法

- 在模板方法模式的父类中，我们可以定义一个方法，它默认不做任何事，子类可以视情况要不要覆盖它，该方法称为 **钩子方法**





## 5、源码分析：spring IOC

- Spring IOC 容器初始化时运用到的 模板方法模式





## 6、应用场景和扩展

应用场景：

- 算法的整体步骤很固定，但其中个别部分易变时，这时候可以使用模板方法模式，将容易变的部分抽象出来，供子类实现。
- 当多个子类存在公共的行为时，可以将其提取出来并集中到一个公共父类中以避免代码重复。首先，要识别现有代码中的不同之处，并且将不同之处分离为新的操作。最后，用一个调用这些新的操作的模板方法来替换这些不同的代码。
- 当需要控制子类的扩展时，模板方法只在特定点调用钩子操作，这样就只允许在这些点进行扩展。



扩展：

- 在模板方法模式中，基本方法包含：抽象方法、具体方法和钩子方法，正确使用“钩子方法”可以使得子类控制父类的行为。