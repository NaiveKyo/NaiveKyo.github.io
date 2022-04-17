---
title: Design Patterns Of Adapter And Bridge
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221227.jpg'
coverImg: /img/20220225221227.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-15 14:59:13
summary: "设计模式之适配器模式、桥接模式"
categories: "Design Patterns"
keywords: "Design Patterns"
tags: "Design Patterns"
---

# 一、适配器模式

> 案例

不同国家采取的插座规格是不一样的，但是我们可以买一个 多功能转接插口（适配器），这样就可以使用了

## 1、基本介绍

- 适配器模式（Adapter Pattern）将某个类的接口转换成客户端期望的另一个接口，主要目的是为了兼容性，让原本因接口不匹配而不能一起工作的两个类可以协同工作，其别名为包装器（Wrapper）
- 适配器模式属于 **结构型模式**
- 主要分为三类：类适配器模式、对象适配器模式、接口适配器模式



## 2、工作原理

- 适配器模式：将一个类的接口转换成另一种接口，让 **原本接口不兼容的类可以兼容**
- 从用户的角度看不到被适配者，是解耦的
- 用户调用适配器转化出来的目标接口方法，适配器再调用被适配者的相关接口方法
- 用户收到反馈结果，感觉只是和目标接口交互

结构：

适配器模式（Adapter）包含以下主要角色。

1. 目标（Target）接口：当前系统业务所期待的接口，它可以是抽象类或接口。
2. 适配者（Adaptee）类：它是被访问和适配的现存组件库中的组件接口。
3. 适配器（Adapter）类：它是一个转换器，通过继承或引用适配者的对象，把适配者接口转换成目标接口，让客户按目标接口的格式访问适配者。



## 3、类适配器

**类适配器模式**：会增强耦合，用的较少

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220417145631.png)



> 案例 —— 电压问题

**类适配器介绍：**

基本介绍：Adapter 类、通过继承 src 类，实现 dst 类接口，完成 src -> dst 的适配



生活中，充电器就是 Adapter，220V 交流电相当于 src（被适配者），我们的目的 dst（目标）是 5V 直流电

相关代码看 idea



> 类适配器注意事项

- Java 是单根继承机制，所以类适配器需要继承 src 这一点算是一个缺点，因为这要求 dst 必须是接口，**有一定局限性**	
- src 类的方法在 Adapter 中会暴露出来，也增加了使用成本
- 由于其继承了 src 类，所以它可以根据需求重写 src 类的方法，使得 Adapter 的**灵活性增强了**

## 4、对象适配器

- 基本思路和类的适配器相同，只是将 Adapter 类做修改，不是继承 src 类，而是聚合 src 类，以解决兼容性问题。即：持有 src 类，实现 dst 类接口，完成 src -> dst 的适配
- 根据 **合成复用原则**，在系统中应该尽量使用关联关系来替代继承关系
- 对象适配器模式是适配器模式常用的一种

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220417145703.png)

> 对象适配器注意事项

- 对象适配器和类适配器其实算是一种思想，只不过实现的方式不同

  根据 **合成复用原则**，使用聚合代替继承，所以它解决了类适配器必须继承 src 的局限性问题，也不再要求 dst 必须是接口。

- 使用成本更低，更灵活。

## 5、接口适配器模式

介绍：

- 一些书籍称为：适配器模式（Default Adapter Pattern）或缺省适配器模式
- 当不需要全部实现接口提供的方法时，可以先设计一个抽象类实现接口，并为该接口中每个方法提供一个默认实现（空方法），那么该抽象类的子类可有选择地覆盖父类的某些方法来实现需求
- 适用于使用一个接口时不想使用其所有方法的情况

相当典型的案例就是 Android 中添加监听器，一般使用匿名内部类实现某个抽象类，而这个抽象类继承了一个接口，将接口中不需要的方法全部覆盖成空方法。



## 6、适配器模式在 SpringMVC 框架应用中源码分析

- SpringMVC 中的 HandlerAdapter，就使用了适配器模式
  - 回顾 springmvc 的三个步骤：HandlerMapping、HandlerAdapter、ViewResolever
  - 核心：**DispatcherServlet**，当它捕获到请求的时候，会调用其内部方法 `doDispatch`
- 使用 HandlerAdapter 的原因分析：
  - 可以看到处理器的类型不同，有多重实现方式，那么调用方式就不是确定的，如果需要直接调用 Controller 方法，需要调用的时候就得不断使用 if else 判断是哪一种子类然后执行，那么，如果后面要扩展 Controller，就需要修改原来的代码，违背了 OCP 原则。



> 自己动手简单实现 DispatcherServlet 适配器模式

说明：

- Spring 定义了一个适配接口，使得每一种 Controller 有一种对应的适配器实现类
- 适配器代替 Controller 执行相应的方法
- 扩展 Controller 时，只需要增加一个适配器就完成了 SpringMVC 的扩展

代码看 idea ，这里只上 DispatcherSerlvet 简易版本：

```java
public class DispatcherServlet {

    public static List<HandlerAdapter> handlerAdapters = new ArrayList<>();

    public DispatcherServlet() {
        handlerAdapters.add(new SimpleHandlerAdapter());
        handlerAdapters.add(new HttpHandlerAdapter());
        handlerAdapters.add(new AnnotationHandlerAdapter());
    }

    public void doDispatch() {
        // 此处模拟 SpringMVC 从 request 获取 handler 的情形
        // 适配器可以获取希望的 Controller
        // 这一步在 SpringMVC 中由 HandlerMapping 获取到对应的 Handler（即 Controller）
        // HttpController controller = new HttpController();
        AnnotationController controller = new AnnotationController();
        // SimpleController controller = new SimpleController();

        // 得到对应的适配器
        HandlerAdapter adapter = getHandler(controller);

        // 通过适配器执行对应的 controller 中的方法
        adapter.handle(controller);
    }

    private HandlerAdapter getHandler(Controller controller) {
        
        for (HandlerAdapter adapter : handlerAdapters) {
            if (adapter.supports(controller)) {
                return adapter;
            }
        }
        return null;
    }
}
```

## 7、适配器模式注意事项

- 三种命名方式，是根据 adaptee 是以怎样的形式给 adapter 来命名的
  - 类适配器：Adapter 将 Adaptee 类继承
  - 对象适配器：Adapter 将 Adaptee 聚合
  - 接口适配器：Adapter 将 Adaptee 实现
- Adapter 模式最大的作用还是将原来不兼容的接口融合到一起工作
- 实际开发中，实现起来不拘泥于这三种经典的适配器模式

## 8、模式应用场景及扩展

> 应用场景

适配器模式（Adapter）通常适用于以下场景。

- 以前开发的系统存在满足新系统功能需求的类，但其接口同新系统的接口不一致。
- 使用第三方提供的组件，但组件接口定义和自己要求的接口定义不同。



> 模式的扩展

适配器模式（Adapter）可扩展为双向适配器模式，双向适配器类既可以把适配者接口转换成目标接口，也可以把目标接口转换成适配者接扣

http://c.biancheng.net/view/1361.html



# 二、桥接模式

## 1、介绍和类图

在现实生活中，某些类具有两个或多个维度的变化，如图形既可按形状分，又可按颜色分。如何设计类似于 Photoshop 这样的软件，能画不同形状和不同颜色的图形呢？如果用继承方式，m 种形状和 n 种颜色的图形就有 m×n 种，不但对应的子类很多，而且扩展困难。

当然，这样的例子还有很多，如不同颜色和字体的文字、不同品牌和功率的汽车、不同性别和职业的男女、支持不同平台和不同文件格式的媒体播放器等。如果用桥接模式就能很好地解决这些问题。



> 定义和特点

基本介绍：

- 桥接模式（Bridge 模式）是指：**将实现与抽象放在两个不同的类层次中，使两个层次可以独立改变**
- 是一种**结构型设计模式**
- Bridge 模式基于**类的最小设计原则**，通过使用封装、聚合及继承等行为让不同的类承担不同的职责。它的主要特点是把抽象（Abstraction）与行为实现（Implementation）分离开来，从而可以保持各部分的独立性以及应对它们的功能扩展

类图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220417145725.png)

分析：从图中可以看到抽象和实现是两个部分

- 客户类：桥接模式的调用者
- 抽象化角色：维护了 Implementor （及它的具体实现化角色），二者是聚合关系，Abstraction 充当的桥接类，联系抽象和实现
- 扩展抽象化角色：是 Abstraction 的子类
- Implementor：行为实现类的接口
- 具体实现化角色：行为的具体实现类
- 可以看出：这里的抽象类和接口是聚合关系，也是调用和被调用的关系

> 优点

- 抽象与实现分离，扩展能力强
- 符合开闭原则
- 符合合成复用原则
- 其实现细节对客户透明

缺点是：由于聚合关系建立在抽象层，要求开发者针对抽象化进行设计与编程，能正确地识别出系统中两个独立变化的维度，这增加了系统的理解与设计难度。

> 角色

- 抽象化（Abstraction）角色：定义抽象类，并包含一个对实现化对象的引用。
- 扩展抽象化（Refined Abstraction）角色：是抽象化角色的子类，实现父类中的业务方法，并通过聚合关系调用实现化角色中的业务方法。
- 实现化（Implementor）角色：定义实现化角色的接口，供扩展抽象化角色调用。
- 具体实现化（Concrete Implementor）角色：给出实现化角色接口的具体实现。

## 2、JDBC 源码分析（Driver）

- JDBC 的 Driver 接口，如果从桥接模式看，Driver 就是一个接口，下面可以有 MySql 的 Driver、Oracle 的 Driver，这些就可以看作接口的实现类



## 3、桥接模式注意事项

- 实现了抽象和实现部分的分离，从而极大的提供了系统的灵活性，让抽象部分和实现部分独立开来，这有助于系统进行分层设计，从而产生更好的结构化系统。
- 对于系统的高层部分，只需要知道抽象部分和实现部分的接口就可以了，其他的部分由具体业务来完成
- 桥接模式替代多层继承方案，可以减少子类的个数，降低系统的管理和维护成本
- 桥接模式的引入增加了系统的理解和设计难度，由于聚合关联关系建立在抽象层，要求开发者针对抽象层进行设计和编程
- 桥接模式要求正确识别出系统中两个独立变化的维度，因此其使用范围有一定的局限性，即需要有这样的应用场景。

## 4、应用场景

当一个类内部具备两种或多种变化维度时，使用桥接模式可以解耦这些变化的维度，使高层代码架构稳定。



桥接模式通常适用于以下场景。

- 当一个类存在两个独立变化的维度，且这两个维度都需要进行扩展时。
- 当一个系统不希望使用继承或因为多层次继承导致系统类的个数急剧增加时。
- 当一个系统需要在构件的抽象化角色和具体化角色之间增加更多的灵活性时。

桥接模式的一个常见使用场景就是替换继承。我们知道，继承拥有很多优点，比如，抽象、封装、多态等，父类封装共性，子类实现特性。继承可以很好的实现代码复用（封装）的功能，但这也是继承的一大缺点。

因为父类拥有的方法，子类也会继承得到，无论子类需不需要，这说明继承具备强侵入性（父类代码侵入子类），同时会导致子类臃肿。因此，在设计模式中，有一个原则为优先使用组合/聚合，而不是继承。（**合成复用原则**）



很多时候，我们分不清该使用继承还是组合/聚合或其他方式等，其实可以从现实语义进行思考。因为软件最终还是提供给现实生活中的人使用的，是服务于人类社会的，软件是具备现实场景的。当我们从纯代码角度无法看清问题时，现实角度可能会提供更加开阔的思路。

## 5、扩展

在软件开发中，有时桥接（Bridge）模式可与适配器模式联合使用，当桥接（Bridge）模式的实现化角色的接口与现有类的接口不一致时，可以在二者中间定义一个适配器将二者连接起来，其具体结构图如图 5 所示。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220417145758.png)