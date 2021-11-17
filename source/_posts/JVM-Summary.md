---
title: JVM Summary
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211006224512.jpg'
coverImg: /img/20211006224512.jpg
toc: true
date: 2021-11-17 21:24:22
top: false
cover: false
summary: JVM 概述(重要知识点)
categories: JVM
keywords: JVM
tags: JVM
---

# 概览

> 重点

- 类的加载过程
- 运行时数据区的各个结构
- String
- 垃圾标记与清除阶段的算法
- 各垃圾回收器的吞吐量优先和低延迟
- 字节码指令



> 概览

- 类加载
- 内存结构
- 执行引擎
- 垃圾回收
- 字节码指令
- JVM 监控及诊断工具
- 性能调优

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211117212626.png)

> 问题

- 什么是 Java 虚拟机，为什么要使用？
  - 虚拟机：指以软件的方式模拟具有完整硬件系统功能、运行在一个完全隔离环境中的完整计算机系统，是物理机的软件实现。
- Java 虚拟机的生命周期及体系结构
  - Java 虚拟机的启动是通过引导类加载器（bootstrap class loader）创建一个初始类（initial class）来完成，**这个类是由虚拟机的具体实现指定的。**

- 虚拟机的退出
  - 有如下几种情况：
  - 某线程调用 Runtime 类或 System 类的 exit 方法，或 Runtime 类的 halt 方法，并且 Java 安全管理器也允许这次 exit 或 halt 操作；
  - 程序正常执行到结束；
  - 程序在执行过程中遇到了异常或错误而异常终止；
  - 由于操作系统出现错误而导致 Java 虚拟机进程终止。



# 整体结构



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211117212952.png)



## 一、类加载器子系统

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211117213015.png)

- 类加载器子系统作用
- 类的加载过程
- 类的加载器
  - 分类
  - 为什么需要用户自定义类加载器
- 双亲委派机制
- 破坏双亲委派机制
- 沙箱安全机制

### 1、类的加载过程

加载（Loading） --\> 验证（Verification） --\> 准备（Preparation） --\> 解析（Resolution）--\> 初始化（Initialization）

验证、准备、解析统称为链接（Linking）

> 一、加载

- 通过一个类的全限定名获取定义此类的二进制字节流
- 将这个字节流所代表的静态存储结构转化为方法区的运行时数据结构
- **在内存中生成一个代表这个类的 java.lang.Class 对象**，作为方法区这个类的各种数据的访问入口

注意：数组类是如何创建加载的呢？



> 二、链接

验证（Verify）：

- 目的在于确保 Class 文件的字节流中包含信息符合当前虚拟机要求，保证被加载类的正确性，不会危害迅即自身安全
- 主要包括四种验证：文件格式验证、元数据验证、字节码验证、符号引用验证



准备（Prepare）：

- 为类变量分配内存并且设置该类变量的默认初始值，即零值
- **这里不包含用 final 修饰的 static，因为 final 在编译的时候就会分配了，准备阶段会显式初始化；**
- **这里不会为实例变量分配初始化**，类变量会分配在方法区中，而实例变量是会随着对象一起分配到 Java 堆中



解析（Resolve）：

- **将常量池内的符号引用转换为直接引用的过程**
- 事实上，解析操作往往会伴随 JVM 在执行完初始化之后再执行

符号引用就是一组符号来描述所引用的目标。符号引用的字面量形式明确定义再《java虚拟机规范》的 Class 文件格式中。

在解析阶段，jvm 根据字符串的内容找到内存区域中相应的地址，然后把符号应用替换为直接指向目标的指针、句柄、偏移量等等，这些直接指向目标的指针、句柄、偏移量就被称为 **直接引用**。

- 解析动作主要针对类或接口、字段、类方法、接口方法、方法类型等等。对应常量池中的 CONSTANT_Class_info、CONSTANT_Fieldref_info、CONSTANT_Methodref_info 等等



> 三、初始化

- **初始化阶段就是执行类构造器方法 \<clinit\>（）的过程**
- \<clinit\> 方法不需定义，是 javac 编译器自动收集类中的所有类变量的赋值动作和静态代码块中的语句合并而来
- 构造器方法中指令按语句在源文件中出现的顺序执行
- **\<clinit\>（）叫做类的构造器方法，它不同于类的构造器**。（关联：类的构造器是虚拟机视角下的 \<init\>（）方法）
- 若该类具有父类，JVM 会保证子类的 \<clinit\>（）执行前，父类的 \<clinit\>（）已经执行完毕
- 虚拟机必须保证一个类的 \<clinit\>（）方法在多线程下被同步枷锁



### 2、类的加载器

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211117213034.png)



- JVM 支持两种类型的类加载器，分别为 <strong style="color:red">引导类加载器 （Bootstrap ClassLoader）</strong> 和 <strong style="color:red">自定义类加载器（UserDefined ClassLoader）</strong>
  - 引导类加载器 使用 C/C++ 编写，属于 JVM 的一部分
  - 自定义类加载器 是用 Java 编写的，它们都直接或间接的继承于 `java.lang.ClassLoader` 这个抽象类
- 怎么算自定义呢？
- 有些地方说是三类、四类，JVM 规范中是两类，上图中的四者之间的关系是包含关系。不是上下层，也不是父子类的继承关系。

> 为什么需要用户自定义类加载器？

- 再 Java 的日常开发中，类的加载几乎是由上述三种类加载器相互配合执行的，再必要时，我们还可以自定义类加载器，来定制类的加载方式。
- **为什么要自定义类加载器？**
  - 隔离加载类，避免类冲突
  - 修改类加载的方式，根据实际情况在某个时间点按需动态加载
  - 扩展加载源：网络、数据库、机顶盒
  - 防止源码泄露



### 3、双亲委派机制	

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211117213054.png)



> 工作原理

（1）如果一个类加载器接收到了类加载请求，它并不会自己先去加载，而是把这个请求委托给父类的加载器去执行；

（2）如果父类的加载器不加载又会向下委托给子加载器去执行。



> 优势

- 避免类的重复加载
- 保护程序安全，防止核心 API 被随意篡改



### 4、破坏双亲委派机制

（1）第一次

发生在双亲委派模型出现之前 —— 即 JDK 1.2 面世以前的时代。

类加载器的概念和抽象类 `java.lang.ClassLoader` 在 Java 的第一个版本中就已经存在，面对已经存在的用户自定义类加载器的代码，Java 设计者们引入双亲委派模型时不得不做出一些妥协，为了兼容这些已有代码，**无法再以技术手段编码 loadClass() 被子类覆盖的可能性，只能在 JDK 1.2 之后的 java.lang.ClassLoader 中添加了一个新的 protected 方法 findClass()，并引导用户编写的类加载逻辑时尽可能去重写这个方法，而不是在 loadClass() 中编写代码。**



（2）第二次

双亲委派机制的第二次 "被破坏" 是由于这个模型自身的缺陷导致的，双亲委派很好地解决了各个类加载器协作时基础类型的一致性问题（**越基础的类由越上层的加载器进行加载**），基础类型之所以被称为 "基础"，是因为它们总是作为被用户代码继承、调用的 API 存在，但 **如果有基础类型又要调用回用户的代码，那么该怎么办呢？**



一个典型的例子就是 JNDI 服务，JNDI 现在已经是 Java 的标准服务，在 JDK 1.3 时加入到 rt.jar。

JNDI 存在的目的就是对资源进行查找和集中管理，它需要调用由其他厂商实现并部署在应用程序的 ClassPath 下的 JNDI 服务提供者接口 （Service  Provider Interface，SPI）的代码。



（3）第三次

双亲委派模型的第三次 "被破坏" 是由于用户对程序动态性的追求导致的。（如：代码热替换 Hot Swap、模块热部署 Host Deployment 等等）。

IBM 公司主导的 JSR-291（即 OSGi R4.2）实现模块化热部署的关键是它自定义的类加载器机制的实现，每一个程序模块（OSGi 中称为 Bundle）都有一个自己的类加载器，当需要更换一个 Bundle 时，就把 Bundle 连同类加载器一起换掉以实现代码的热替换。在 OSGi 环境下，类加载器不再双亲委派模型推荐的树状结构，而是进一步发展为更加复杂的 <strong style="color:red">网状结构</strong>。



当收到类加载请求时，OSGi 将按照下面的顺序进行类搜索：

1. <strong style="color:red">如果类或资源在 java.* 包中，将请求委派给父类加载器加载</strong>，否则，继续下一步搜索。 如果请求被委托给父类加载器还找不到类或资源，则搜索终止并且失败。
2. <strong style="color:red">如果类或资源来自引导委派列表（系统变量 org.osgi.framework.bootdelegation）中包含的包，将请求委派给父类加载器加载</strong>，如果在那里找不到类或资源，继续下一步搜索。
3. 如果类或资源属于声明在 Import-Package 导入的包中，或者是在先前的加载中动态导入的，那么请求将委托给声明 Export-Package 这个包的 bundle 的类加载器; 否则继续下一步搜索。如果请求被委托给导出类加载器但找不到类或资源，则失败。
4. 如果类或资源位于在多个 Require-Bundle 包中导入的包中，则请求将按照清单中指定的顺序委派给其他包的类加载器。这个过程中使用深度优先策略;如果未找到类或资源，则继续下一步搜索。
5. 搜索 bundle 的内嵌 jar 的类路径 (Bundle Class Path)。如果找不到类或资源，继续下一步。
6. 查找 Bundle 的 Fragment Bundle 中导入的包, 如果没找到继续下一步
7. 如果类或资源位于自己导出的包中，则搜索结束并失败。
8. 否则，如果类或资源位于 DynamicImport-Package 导入的包中，则尝试动态导入包。
9. 如果动态导入包成功，则将请求委托给导出这个包的类加载器。如果请求被委托给导出类加载器并且找不到类或资源，则搜索终止且失败。



但这种模式也会产生许多隐患,比如循环依赖问题,如果BundleA依赖BundleB , BundleB依赖BundleC, BundleC又依赖BundleA, 这可能在加载Bundle的时候导致死锁问题。为了避免这种情况,根据OSGi规范说明,在这种情况下,框架必须在第一次访问Bundle的时候做标记,不去访问已经访问过的Bundle.

   另外,在OSGi中Bundle都有自己独有的`ClassLoader`, Fragment Bundle不同于普通Bundle, 其和其附着的Host Bundle共享一个`ClassLoader.`



### 5、沙箱安全机制



## 二、运行时数据区

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211117213113.png)

​	比较重要的部分：

- 堆
- 虚拟机栈
- 方法区

## 三、执行引擎

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211117213127.png)

Java 被称为半解释型半编译型语言，本质上其实是混合型。

- 早期 Java 是解释型语言
- 第二版 JVM 中引入了即时编译器（对代码进行缓存，再去执行的时候效率会更高，从这个角度上是半解释半编译的）

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211117213141.png)

<mark>这里上面的编译器应该是前端编译器，将 .java 编译成 .class</mark>

<mark>这里下面的 JIT 就是运行期编译器（Just In Time Compiler），将 .class 字节码转换成机器码</mark>

- 前端编译器 javac：负责将 Java 语法糖，转换为正常的字节码：
  - 提高程序员开发效率
- 运行期编译器 JIT：负责代码优化
  - 增进代码运行速度



## 四、各种 JVM

- Sun Classic VM：解释型
- Exact VM ：只应用在 Solaris 系统（引入即时编译器）
- **Sun 公司的 HotSpot VM**
- **BEA 的 JRockit ：不包含解释器，服务器端，JMC**
- **IBM 的 J9**
- ......
- **Craal VM** ： 最近新出来的，前途很光明