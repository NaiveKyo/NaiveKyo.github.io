---
title: Spring Source Code Analysis (二) The basic implementation of containers
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211227220104.jpg'
coverImg: /img/20211227220104.jpg
cover: false
toc: true
mathjax: false
date: 2022-03-15 19:42:58
summary: "Spring"
categories: "Spring"
keywords: "Spring"
tags: "Spring"
---

# 容器的基本实现

## 1、容器基本用法

bean 是 Spring 中最核心的东西，因为 Spring 就像一个水桶，bean 就像是容器中的水，水离开了水桶就没什么用处了。

Spring 希望我们定义的 bean 是一个纯粹的 POJO，看一下一个简单的 bean 定义：

```java
public class MyBean {
    
    private String testStr = "testStr";

    public String getTestStr() {
        return testStr;
    }

    public void setTestStr(String testStr) {
        this.testStr = testStr;
    }
    
}
```

可以看到这个 Bean 中有：私有属性、一个默认无参构造器、setter/getter 方法，看起来没有任何特别之处，然后看看 xml 配置文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:p="http://www.springframework.org/schema/p"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
       http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="myBean" class="io.github.naivekyo.bean.MyBean"/>
    
</beans>
```

Spring 中 bean 的声明方式有很多种，涵盖了各种业务场景，但是我们只要声明成上面这样，就可以满足大部分应用了。

测试代码：

```java
@Test
public void test1() {
    ApplicationContext ac = new ClassPathXmlApplicationContext("spring-beans.xml");

    MyBean bean = ac.getBean(MyBean.class);

    System.out.println(bean.getTestStr());
}

@Test
public void test2() {
    BeanFactory bf = new XmlBeanFactory(new ClassPathResource("spring-beans.xml"));

    MyBean bean = bf.getBean(MyBean.class);

    System.out.println(bean.getTestStr());
}
```

通过两种方式拿到容器中的 Bean：

- `BeanFactory`

- `ApplicationContext`

直接使用 `BeanFactory` 作为容器对 Spring 的使用来说其实并不常见，甚至是很少使用，在企业级应用中使用更多的是 `ApplicationContext`。



## 2、流程分析

上述测试代码主要完成了以下几点：

- 读取配置文件 `spring-beans.xml`（自己创建的）;
- 根据 `spring-beans.xml` 中的配置找到对应的类的配置，并实例化；
- 调用实例化后的实例。

以 `BeanFactory` 为例，如果想要完成相应的功能，至少需要三个类：

- `ConfigReader`：（这个类是虚拟出的，实际没有这里实际用到是 `XmlBeanDefinitionReader`）：用于读取和验证配置文件。我们要用到配置文件，那么首先就需要读取文件到内存；
- `ReflectionUtils`（Spring 的工具类）：根据配置文件中的配置进行反射实例化；
- `App`（虚拟的，代表整个应用）：用于完成整个逻辑的串联。

按照原始的思想，整个过程无非就是上面我们认为的，但是真的有那么简单吗？



## 3、Spring 的结构组成

先看一下 Spring 框架的结构，从全局的角度了解 Spring 的结构组成。

### 3.1 Beans 包的层级结构

beans 包中的各个源码包的功能如下：

- `src/main/java`：用于展现 Spring 的主要逻辑；
- `src/main/resources`：用于存放系统的配置文件；
- `src/test/java`：用于对主要逻辑进行单元测试；
- `src/test/resources`：用于存放测试用的配置文件。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220314170053.png)

### 3.2 核心类介绍

#### (1) DefaultListableBeanFactory

`XmlBeanFactory` 集成自 `DefaultListableBeanFactory`，而 `DefaultListableBeanFactory` 是整个 bean 加载的核心部分，是 Spring 注册及加载 bean 的默认实现，而对于 `XmlBeanFactory` 与 `DefaultListableBeanFactory` 不同的地方其实是前者中使用了自定义的 XML 读取器 `XmlBeanDefinitionReader`，实现了个性化的 `BeanDefinitionReader` 读取。

`DefaultListableBeanFactory` 继承了 `AbstractAutowireCapableBeanFactory` 并实现了 `ConfigurableListableBeanFactory` 以及 `BeanDefinitionRegistry` 接口。

容器加载相关类图如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220314160640.png)

简单介绍一下上图各个类的作用：

- `AliasRegistry` 接口：定义对 alias（别名） 的注册、移除和查询等操作；
- `SimpleAliasRegistry` 类：是 AliasRegistry 的常规实现，使用 `ConcurrentHashMap` 作为缓存存储 alias；
- `SingletonBeanRegistry` 接口：定义了对单例的注册及获取；
- `BeanFactory` 接口：定义了获取 bean 以及 bean 的各种属性；
- `DefaultSingleBeanRegistry` 类：对接口 SingletonBeanRegistry 定义的各个函数的实现；
- `HierarchicalBeanFactory` 接口：继承了 BeanFactory 接口，在其基础上进行了扩展，为 BeanFactory 添加了父子级联 IoC 容器的功能，可以访问 parentFactory；
- `BeanDefinitionRegistry` 接口：定义了对 `BeanDefinition` 的各种增删改操作；（Spring 每个配置文件中每一个 `<bean>` 节点元素在 Spring 容器中都通过 BeanDefinition 表示）
- `FactoryBeanRegistrySupport` 抽象类：在 DefaultSingletonBeanRegistry 基础上添加了对 FactoryBean 的特殊处理功能；
- `ConfigurableBeanFactory` 接口：提供配置 Factory 的各种方法，大大提高了 BeanFactory 的可定制性；（<mark>包括设置类加载器、属性编辑器、后置处理器等方法</mark>）（<strong style="color:red">注意这个接口非常重要，是 BeanFactory 体系预留的 SPI</strong>）；
- `ListableBeanFactory` 接口：对 BeanFactory 进行扩展，定义了通过各种条件访问容器中 bean 信息的方法；
- `AbstractBeanFactory` 抽象类：综合 FactoryBeanRegistrySupport 和 CinfigurableBeanFactory 的功能；
- `AutowireCapableBeanFactory` 接口：提供创建 bean、自动注入、初始化以及应用 bean 的后处理器；（重点在于扩展了 BeanFactory，为其添加将容器中的 Bean 按照某种规则进行自动装配的方法）
- `AbstractAutowireCapableBeanFactory` 抽象类：综合 AbstractBeanFactory 并对接口 AutowireCapableBeanFactory 进行实现；
- `ConfigurableListableBeanFactory` 接口：BeanFactory 配置清单，指定忽略类型及接口等；
- `DefaultListableBeanFactory` 类：综合上面所有的功能，主要是对 bean 注册后的处理。

`XmlBeanFactory` 对 `DefaultListableBeanFactory` 类进行了扩展，主要用于从 XML 文档中读取 `BeanDefinition`，对于注册及获取 bean 都是使用从父类 `DefaultListableBeanFactory` 继承的方法去实现，而唯独与父类不同的个性化实现就是增加了 `XmlBeanDefinitionReader` 类型的 reader 属性。在 `XmlBeanFactory` 中主要使用 reader 属性对资源文件进行读取和注册。



#### (2) XmlBeanDefinitionReader

XML 配置文件的读取是 Spring 中重要的功能（现在都是基于注解但是某些旧项目还是采用 XML 文件配置 Bean），因为 Spring 的大部分功能都是以配置作为切入点的，我们可以从 `XmlBeanDefinitionReader` 中梳理一下资源文件的读取、解析及注册的大致流程，首先看看各个类的功能：

- `ResourceLoader`：定义资源加载器，主要用于根据给定的资源文件地址返回对应的 `Resource`；
- `BeanDefinitionReader`：主要定义资源文件读取并转换为 `BeanDefinition` 的各个功能；
- `EnvironmentCaptable`：定义获取 `Environment` 方法；
- `DocumentLoader`：策略接口，定义从资源文件加载转换到 `Document` 的功能；
- `AbstractBeanDefinitionReader`：对 `EnvironmentCapable`、`BeanDefinitionReader` 类定义的功能进行实现；
- `BeanDefinitionDocumentReader`：定义读取 `Document` 并注册 `BeanDefinition` 的功能；
- `BeanDefinitionParserDelegate`：定义解析 `Element` 的各种方法。

经过上面的分析，我们可以大致梳理出整个 XML 配置文件读取的大致流程，如下图所示，在 `XmlBeanDefinitionReader` 中主要包含以下几步的处理：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220314195912.png)

上图中灰色虚线是依赖关系，实心棱形单箭头线代表组合关系（注意这里是 1 对 1）：

（1）`XmlBeanDefinitionReader` 通过使用继承自 `AbstractBeanDefintionReader` 中的方法，使用`ResourceLoader` 将资源文件路径转换为对应的 `Resource` 文件；

（2）通过 `DocumentLoader` 对 `ResourceLoader` 文件进行转换，将 `Resource` 文件转换为 `Document` 文件；

（3）通过 `BeanDefinitionDocumentReader` 的实现类 `DefaultBeanDefinitionDocumentReader` 对 `Document` 进行解析，并使用 `BeanDefinitionParserDelegate` 对 `Element` 进行解析。



## 4、容器的基础 XmlBeanFactory

到这里，我们已经对 Spring 容器功能有了大致的了解，接下来详细探索每个步骤的实现。

测试类的代码如下：

```java
BeanFactory bf = new XmlBeanFactory(new ClassPathResource("spring-beans.xml"));
```

`XmlBeanFactory` 的初始化时序图如下，根据该图看一下上述代码的执行逻辑。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220314202543.png)

在测试类中首先调用 `ClassPathResource` 的构造函数来构造 `Resource` 资源文件的实例对象，这样后续的资源处理就可以用 `Resource` 提供的各种服务来操作了，当我们有了 `Resource` 后就可以进行 `XmlBeanFactory` 的初始化了，那么 `Resource` 资源是如何封装的呢？

### 4.1 配置文件封装

Spring 的配置文件读取是通过 `ClassPathResource` 进行封装的，那么它完成了哪些功能呢？

在 Java 中，将不同来源的资源抽象成 `URL`，通过注册不同的 `handler(URLStreamHanlder)` 来处理不同来源的资源的读取逻辑，一般 handler 的类型使用不同前缀（协议、Protocol）来识别，如 "file:"、"http:"、"jar:" 等，然而 URL 没有默认定义相对 `Classpath` 或 `ServletContext` 等资源的 handler，虽然可以注册自己的 `URLStreamHandler` 来解析特定的 URL 前缀（协议），比如 "classpath:"，然而这需要了解 URL 的实现机制，而且 URL 也没有提供基本的方法，如检查当前资源是否存在、检查当前资源是否可读等方法。因而 Spring 对其内部使用到的资源实现了自己的抽象结构：`Resource` 接口封装底层资源。 

源码如下：

```java
// org.springframework.core.io.InputStreamSource
public interface InputStreamSource {

	InputStream getInputStream() throws IOException;
}

// org.springframework.core.io.Resource
public interface Resource extends InputStreamSource {

	boolean exists();

	default boolean isReadable() {
		return exists();
	}

	default boolean isOpen() {
		return false;
	}

	default boolean isFile() {
		return false;
	}

	URL getURL() throws IOException;

	URI getURI() throws IOException;

	File getFile() throws IOException;

	default ReadableByteChannel readableChannel() throws IOException {
		return Channels.newChannel(getInputStream());
	}

	long contentLength() throws IOException;

	long lastModified() throws IOException;

	Resource createRelative(String relativePath) throws IOException;

	@Nullable
	String getFilename();

	String getDescription();

}
```

`InputStreamSource` 封装任何能够返回 `InputStream` 的类，比如 File、Classpath 下的资源和 ByteArray 等。它只有一个方法定义：`getInputStream()`，该方法返回一个新的 `InputStream` 对象。

`Resource` 接口抽象了所有 Spring 内部使用到的底层资源：`File`、`URL`、`Classpath` 等。首先，它定义了 3 个判断当前资源状态状态的方法：存在性（exists）、可读性（isReadable）、是否处于打开状态（isOpen）。另外，`Resource` 接口还提供了不同资源到 URL、URI、File 类型的转换，以及获取 lastModified 属性、文件名（不带路径信息的文件名）为了方便操作，`Resource` 还提供了基于当前资源创建一个相对资源的方法：`createRelative()`。在错误处理中需要详细地打印出错的资源文件，因而`Resource` 还提供了 `getDescription()` 用来在错误处理中打印信息，最后还提供了对 NIO 的支持（`readableChannel()`）。

对不同来源的资源文件都有相应的 Resource 实现：文件（`FileSystemResource`）、Classpath 资源（`ClassPathResource`）、URL 资源（`UrlResource`）、InputStream 资源（`InputStreamResource`）、Byte 数组（`ByteArrayResource`）等。相关类图如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220315092724.png)

在日常开发中，资源的加载也是经常使用的，可以利用 Spring 提供的相关类来完成。

比如在加载文件时可以这样做：

```java
Resource resource = new ClassPathResource("xxx.xml");
InputStream is = resource.getInputStream();
```

得到了输入流，就可以做很多事了，当然也可以利用 Resource 及其子类为我们提供的诸多特性。

有了 `Resource` 接口便可以对所有资源文件进行统一处理。至于实现，其实是非常简单的，以 `getInputStream` 为例，`ClassPathResource` 中的实现方式便是通过 class 或者 classLoader 提供的底层方法进行调用，而对于 `FileSystemResource` 的实现则是采用了 Java 的 nio 对文件进行读取：

```java
// org.springframework.core.io.ClassPathResource
@Override
public InputStream getInputStream() throws IOException {
    InputStream is;
    if (this.clazz != null) {
        is = this.clazz.getResourceAsStream(this.path);
    }
    else if (this.classLoader != null) {
        is = this.classLoader.getResourceAsStream(this.path);
    }
    else {
        is = ClassLoader.getSystemResourceAsStream(this.path);
    }
    if (is == null) {
        throw new FileNotFoundException(getDescription() + " cannot be opened because it does not exist");
    }
    return is;
}
```

```java
// org.springframework.core.io.FileSystemResource
@Override
public InputStream getInputStream() throws IOException {
    try {
        // 最里面是 new sun.nio.ch.ChannelInputStream(ch);
        return Files.newInputStream(this.filePath);
    }
    catch (NoSuchFileException ex) {
        throw new FileNotFoundException(ex.getMessage());
    }
}
```

当通过 Resource 相关类完成了对配置文件进行封装后配置文件的读取工作就全权交给 `XmlBeanDefinitionReader` 来处理了。

了解了 Spring 中将相关配置文件封装为 Resource 类型的实例方法后，就可以继续探索 XmlBeanFactory 的初始化过程，XmlBeanFactory 的初始化有若干方法，Spring 中提供了很多构造函数，这里分析的是使用 Resource 实例作为构造函数参数的方法，代码如下：

```java
// org.springframework.beans.factory.xml.XmlBeanFactory

public XmlBeanFactory(Resource resource) throws BeansException {
    // 调用下方的构造函数
    this(resource, null);
}

public XmlBeanFactory(Resource resource, BeanFactory parentBeanFactory) throws BeansException {
    // 调用父类的构造函数
    super(parentBeanFactory);
    this.reader.loadBeanDefinitions(resource);
}
```

`this.reader.loadBeanDefinitions(resource)` 这一行代码才是真正加载资源的地方，也是我们分析的重点之一，但是在其加载资源之前还有一个调用父类构造函数的初始化过程：

```java
// org.springframework.beans.factory.support.DefaultListableBeanFactory

public DefaultListableBeanFactory(@Nullable BeanFactory parentBeanFactory) {
    super(parentBeanFactory);
}

// 继续向上跟踪
// org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory

public AbstractAutowireCapableBeanFactory(@Nullable BeanFactory parentBeanFactory) {
    this();
    setParentBeanFactory(parentBeanFactory);
}

// this() 构造函数
public AbstractAutowireCapableBeanFactory() {
    super();
    ignoreDependencyInterface(BeanNameAware.class);
    ignoreDependencyInterface(BeanFactoryAware.class);
    ignoreDependencyInterface(BeanClassLoaderAware.class);
}
```

> ignoreDependencyInterface

这里需要提一下 `ignoreDependencyInterface` 方法。该方法的主要功能是忽略给定接口的自动装配功能，那么，这样做的目的是什么呢？会产生什么样的效果？

举个例子，当 A 中有属性 B，那么当 Spring 在获取 A 的 Bean 的时候如果其属性 B 还没有初始化，那么 Spring 会自动初始化 B，这也是 Spring 提供的一个重要特性。但是，某些情况下，B 不会初始化，其中的一种情况就是 B 实现了 `BeanNameAware` 接口。

Spring 中是这样介绍的：自动装配时忽略给定的依赖接口，典型应用是通过其他方式解析 Application 上下文注册依赖，类似于 BeanFactory 通过 BeanFactoryAware 进行注入或者 ApplicationContext 通过 ApplicationContextAware 进行注入。



### 4.2 加载 Bean

之前提到的在 `XmlBeanFactory` 构造函数中调用了 `XmlBeanDefinitionReader` 类型的 reader 属性提供的方法 `this.reader.loadBeanDefinitions(resource)`，这行代码就是整个资源加载的切入点，先看看这个方法的时序图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220315105657.png)

上述操作在 1.3.7 之前都是在读取 XML 文件将其封装为 `Resource` 然后获取其 `InputSource`，1.3.7 操作通过 inputSource 和 resource 将资源转换为 `Document`，最后的 1.3.8 则是将从 XML 中解析的 `BeanDefinition` 注册到 `BeanDefinitionRegistry`（这里是 `DefaultListableBeanFactory` 实例）中，该操作返回的结果是一个 int 型的整数，表示注册的 BeanDefinition 的数量。

上面的时序图的处理过程如下：

（1）封装资源文件：当进入 `XmlBeanDefinitionReader` 后首先对参数 `Resource` 使用 `EncodedResource` 类进行封装；

（2）获取输入流：从 `Resource` 中获取对应的 `InputStream` 并构造 `InputSource`；

通过构造的 `InputSource` 实例和 `Resource` 实例继续调用参数 `doLoadBeanDefinitions`；

代码如下：

```java
// org.springframework.beans.factory.xml.XmlBeanDefinitionReader

public int loadBeanDefinitions(Resource resource) throws BeanDefinitionStoreException {
    return loadBeanDefinitions(new EncodedResource(resource));
}
```

`EncodedResource` 这个类的主要作用是对资源文件进行编码，可以看它的 `getReader()` 方法：

```java
// org.springframework.core.io.support.EncodedResource#getReader()

public Reader getReader() throws IOException {
    if (this.charset != null) {
        return new InputStreamReader(this.resource.getInputStream(), this.charset);
    }
    else if (this.encoding != null) {
        return new InputStreamReader(this.resource.getInputStream(), this.encoding);
    }
    else {
        return new InputStreamReader(this.resource.getInputStream());
    }
}
```

（3）构造了 `EncodedResource` 后，进入 `loadBeanDefinitions` 的重载方法进行数据处理：

```java
public int loadBeanDefinitions(EncodedResource encodedResource) throws BeanDefinitionStoreException {
    
    // 通过 ThreadLocal 拿到资源集合
    Set<EncodedResource> currentResources = this.resourcesCurrentlyBeingLoaded.get();

    // 确保资源只被加载一次
    if (!currentResources.add(encodedResource)) {
        throw new BeanDefinitionStoreException(
            "Detected cyclic loading of " + encodedResource + " - check your import definitions!");
    }

    // 从 encodedResource 中获取资源并再次从 Resource 中获取其中的 inputStream
    // 注意这里的 try 使用的是 JDK9 的新特性，可以自动关闭流
    try (InputStream inputStream = encodedResource.getResource().getInputStream()) {
        InputSource inputSource = new InputSource(inputStream);
        if (encodedResource.getEncoding() != null) {
            inputSource.setEncoding(encodedResource.getEncoding());
        }
        // 这里就是真正的核心逻辑部分
        return doLoadBeanDefinitions(inputSource, encodedResource.getResource());
    }
    catch (IOException ex) {
        throw new BeanDefinitionStoreException(
            "IOException parsing XML document from " + encodedResource.getResource(), ex);
    }
    finally {
        // 使用资源后及时关闭 ThreadLocal 防止内存逸出
        currentResources.remove(encodedResource);
        if (currentResources.isEmpty()) {
            this.resourcesCurrentlyBeingLoaded.remove();
        }
    }
}
```

再次整理一下处理逻辑：首先对传入的 resource 参数做封装，目的是考虑到 Resource 可能存在编码要求的情况，其次，通过 SAX 读取 XML 文件的方式来准备 InputSource 对象，最后将准备的数据通过参数传入真正的核心处理部分 `doLoadBeanDefinitions(inputSource, encodedResource.getResource())`：

```java
protected int doLoadBeanDefinitions(InputSource inputSource, Resource resource)
    throws BeanDefinitionStoreException {

    // 省略 try...catch
    Document doc = doLoadDocument(inputSource, resource);
    int count = registerBeanDefinitions(doc, resource);
  
    return count;
}

protected Document doLoadDocument(InputSource inputSource, Resource resource) throws Exception {
    return this.documentLoader.loadDocument(inputSource, getEntityResolver(), this.errorHandler,
                                            getValidationModeForResource(resource), isNamespaceAware());
}
```

 上面代码做了三件事：

- 获取对 XML 文件的验证模式；
- 加载 XML 文件，并得到对应的 Document；
- 根据返回的 Document 注册 Bean 信息。

这三个步骤支撑整个 Spring 容器部分的实现，尤其是第三步对配置文件的解析，逻辑非常复杂，先看看获取 XML 文件的验证模式讲起。



## 5、获取 XML 的验证模式

XML 文件的验证模式保证了 XML 文件的正确性，而比较常用的验证模式有两种：DTD 和 XSD。

### 5.1 DTD 与 XSD 的区别

> DTD

DTD（Document Type Definition）即文档类型定义，是一种 XML 约束模式语言，是 XML 文件的验证机制，属于 XML 文件组成的一部分。DTD 是一种保证 XML 文档格式正确的有效方法，可以通过比较 XML 文档和 DTD 文件来看文档是否符合规范，元素和标签使用是否正确。

一个 DTD 文档包含：元素的定义规则，元素间关系的定义规则，元素可使用的属性，可使用的实体或符号规则。

要使用 DTD 验证模式的时候需要在 XML 文件的头部声明，以下是 Spring 中使用 DTD 声明方式的代码（这种属于从线上获取 DTD 文件）：

```xml-dtd
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE beans PUBLIC "-//Spring//DTD BEAN 2.0//EN"
"http://www.Springframework.org/dtd/ Spring-beans-2.0.dtd">

<beans>
......
</beans>
```

如果使用本地 DTD 文件，Spring-beans-2.0.dtd 中是这样的：

```xml-dtd
<!ELEMENT beans(
	description?,
    (import | alias | bean)*
    )>
<!ATTLIST beans default-lazy-init (true | false) "false">
<!ATTLIST beans default-merge (true | false) "false">
<!ATTLIST beans default-autowire (no | byName | byType | constructor|autodetect)"no">
<!ATTLIST beans default-dependency-check (none | objecs | simple | all) "none">
<!ATTLIST beans default-init-method CDATA #IMPLIED>
<!ATTLIST beans default-destroy-method CDATA #IMPLIED>
... ...
```

> XSD

XML Schema 语言就是 XSD（XML Schemas Definition）。XML Schema 描述了 XML 文档的结构。可以用一个指定的 XML Schema 来验证某一个 XML 文档，以检查该 XML 文档是否符合其要求。文档设计者可以通过 XML Schema 指定 XML 文档所允许的结构和内容，并可据此检查 XML 文档是否是有效的。XML Schema 本身就是 XML 文档，它符合 XML 语法结构。可以用通用的 XML 解析器解析它。

在使用 XML Schema 文档对 XML 实例文档进行校验，除了要声明名称空间外（`xmlns="http://www.springframework.org/schema/beans"`），还必须指定该名称空间所对应的 XML Schema 文档的存储位置。通过 schemaLocation 属性来指定名称空间所对应的 XML Schema 文档的存储位置，它包含两个部分，一部分是名称空间的 URI，另一部分就是该名称空间所标识的 XML Schema 文件位置或 URL 地址（`xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd"`）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
       http://www.springframework.org/schema/beans/spring-beans.xsd">
    
</beans>
```

Spring-beans-3.0.xsd 代码部分如下：

```]xml
<xsd:schema xmlns="http://www.springframework.org/schema/beans"
		xmlns:xsd="http://www.w3.org/2001/XMLSchema"
		targetNamespace="http://www.springframework.org/schema/beans">

	<xsd:import namespace="http://www.w3.org/XML/1998/namespace"/>

	<xsd:annotation>
		<xsd:documentation><![CDATA][
            ......
            ]]></xsd:documentation>
            
    <!-- base types -->
	<xsd:complexType name="identifiedType" abstract="true">
		<xsd:annotation>
			<xsd:documentation><![CDATA[
			......
			]]></xsd:documentation>
	<xsd:attribute name="id" type="xsd:string">
			<xsd:annotation>
				<xsd:documentation><![CDATA[
			......
			]]></xsd:documentation>
			</xsd:annotation>
		</xsd:attribute>
	</xsd:complexType>
	
	... ...
</xsd:schema>
```

这里只是简单的了解 DTD 和 XSD 的知识。



### 5.2 验证模式的读取

了解了 DTD 和 XSD 的区别后再去分析 Spring 中对于验证模式的提取就更容易理解了，代码如下：

```java
// org.springframework.beans.factory.xml.XmlBeanDefinitionReader

protected Document doLoadDocument(InputSource inputSource, Resource resource) throws Exception {
    return this.documentLoader.loadDocument(inputSource, getEntityResolver(), this.errorHandler,
                                            getValidationModeForResource(resource), isNamespaceAware());
}

// 获取验证模式的方法
protected int getValidationModeForResource(Resource resource) {
    
    // 如果手动指定了验证模式就使用指定的模式
    int validationModeToUse = getValidationMode();
    if (validationModeToUse != VALIDATION_AUTO) {
        return validationModeToUse;
    }
    
    // 如果未指定则自动检测
    int detectedMode = detectValidationMode(resource);
    if (detectedMode != VALIDATION_AUTO) {
        return detectedMode;
    }
    // Hmm, we didn't get a clear indication... Let's assume XSD,
    // since apparently no DTD declaration has been found up until
    // detection stopped (before finding the document's root tag).
    // 如果实在找不到就使用 XSD 的检测模式
    return VALIDATION_XSD;
}
```

可以看到实现还是挺简单的，如果手动设置了检测模式（通过 `XmlBeanDefinitionReader` 的 `setValidationMode` 方法）就使用设置的模式，如果未设置则自动检测，具体检测的处理逻辑是委托给了 `XmlValidationModeDetector` 的 `detectValidationMode` 方法，具体代码如下：

```java
// org.springframework.util.xml.XmlValidationModeDetector

public int detectValidationMode(InputStream inputStream) throws IOException {
    // Peek into the file to look for DOCTYPE.
    BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
    try {
        boolean isDtdValidated = false;
        String content;
        while ((content = reader.readLine()) != null) {
            content = consumeCommentTokens(content);
            // 如果读取到的行是空行或者是注释就自动略过
            if (this.inComment || !StringUtils.hasText(content)) {
                continue;
            }
            if (hasDoctype(content)) {
                isDtdValidated = true;
                break;
            }
            // 如果读取到 < 开始符号，验证模式一定会在开始符号之前
            if (hasOpeningTag(content)) {
                // End of meaningful data...
                break;
            }
        }
        return (isDtdValidated ? VALIDATION_DTD : VALIDATION_XSD);
    }
    catch (CharConversionException ex) {
        // Choked on some character encoding...
        // Leave the decision up to the caller.
        return VALIDATION_AUTO;
    }
    finally {
        reader.close();
    }
}
```

Spring 通过检测验证模式的方法就是判断是否包含 `DOCTYPE`，如果包含就是 DTD，否则就是 XSD。



## 6、获取 Document

获取到验证模式后，就可以进行 `Document` 的加载了，同样 `XmlBeanDefinitionReader` 对于将文档读取也是委托给了 `DocumentLoader` 去执行，它是一个接口，具体执行业务的是其子类 `DefaultDocumentLoader` 的实例，解析代码如下：

```java
// org.springframework.beans.factory.xml.DefaultDocumentLoader

@Override
public Document loadDocument(InputSource inputSource, EntityResolver entityResolver,
                             ErrorHandler errorHandler, int validationMode, boolean namespaceAware) throws Exception {

    DocumentBuilderFactory factory = createDocumentBuilderFactory(validationMode, namespaceAware);
    
    DocumentBuilder builder = createDocumentBuilder(factory, entityResolver, errorHandler);
    return builder.parse(inputSource);
}
```

首先创建 `DocumentBuilderFactory`， 再通过它创建 `DocumentBuilder`，进而解析 inputSource 生成 Document，具体原理就是通过 SAX 解析 XML 文档。

这里需要提一下参数 `entityResolver`，它是在 `XmlBeanDefinitionReader` 的方法 `getEntityResolver()` 中返回的：

```java
// org.springframework.beans.factory.xml.XmlBeanDefinitionReader

protected EntityResolver getEntityResolver() {
    if (this.entityResolver == null) {
        // Determine default EntityResolver to use.
        ResourceLoader resourceLoader = getResourceLoader();
        if (resourceLoader != null) {
            this.entityResolver = new ResourceEntityResolver(resourceLoader);
        }
        else {
            this.entityResolver = new DelegatingEntityResolver(getBeanClassLoader());
        }
    }
    return this.entityResolver;
}
```

### EntityResolver 用法

在 `loadDocument` 方法中涉及一个参数 `EntityResolver`，什么是 EntityResolver 呢（是 sax 包下的一个接口）？官方解释如下：如果 SAX 应用程序需要实现自定义处理外部实体，则必须实现此接口并使用 `setEntityResolver` 方法向 SAX 驱动器注册一个实例。

也就是说，对于解析一个 XML，SAX 首先读取该 XML 文档上的声明，根据声明去寻找相应的 DTD 定义，以便对一个文档进行验证。默认的寻找规则，即通过网络（实现上就是声明的 DTD 的 URI 地址）来下载相应的 DTD 声明，并进行认证。下载的过程是一个漫长的过程，而且当网络中断或不可用时，这里会报错，就是因为相应的 DTD 声明没有被找到的原因。

`EntityResolver` 的作用是项目本身就可以提供一个如何寻找 DTD 声明的方法，即由程序来实现寻找 DTD 声明的过程，比如我们将 DTD 文件放到项目中某处，在实现时直接将此文档读取并返回给 SAX 即可。这样就避免了通过网络来寻找相应的声明。

首先看 EntityResolver 接口声明如下：

```java
// org.xml.sax.EntityResolver
public interface EntityResolver {

    public abstract InputSource resolveEntity (String publicId,
                                               String systemId)
        throws SAXException, IOException;
}
```

这里接收两个参数 publicId 和 systemId 并返回一个 InputSource 对象。

这里以特定的配置文件来说明：

（1）解析验证模式为 XSD 的配置文件，代码如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
       http://www.springframework.org/schema/beans/spring-beans.xsd">
    
</beans>
```

读取到下面两个参数：

- **publicId**：null
- **systemId**：`"http://www.springframework.org/schema/beans/spring-beans.xsd"`

（2）如果我们解析验证模式为 DTD 的配置文件，代码如下：

```xml-dtd
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE beans PUBLIC "-//Spring//DTD BEAN 2.0//EN"
"http://www.Springframework.org/dtd/ Spring-beans-2.0.dtd">

<beans>
......
</beans>
```

读取到下面两个参数：

- **publicId**：`-//Spring//DTD BEAN 2.0//EN`
- **systemId**：`"http://www.Springframework.org/dtd/ Spring-beans-2.0.dtd"`

之前也提到过，验证文件默认的加载方式是通过 URL 进行网络下载获取，这样会造成延迟，用户体验也不好，一般的做法都是将验证文件放置在自己的工厂里，那么怎么做才可以将这个 URL 转化为自己工程里对应的地址文件呢？下面以加载 DTD 文件的方式看看 Spring 中是如何实现的。

根据之前 Spring 中通过 `getEntityResolver()` 方法对 `EntityResolver` 的获取，我们知道，Spring 中使用 `DelegatingEntityResovler` 类作为`EntityResolver` 的实现类，`resolveEntity` 实现方法如下：

```java
// org.springframework.beans.factory.xml.DelegatingEntityResolver

@Override
@Nullable
public InputSource resolveEntity(@Nullable String publicId, @Nullable String systemId)
    throws SAXException, IOException {

    if (systemId != null) {
        if (systemId.endsWith(DTD_SUFFIX)) {
            // 如果是 dtd 就从这里解析
            // 具体的执行实例是: BeansDtdResolver
            return this.dtdResolver.resolveEntity(publicId, systemId);
        }
        else if (systemId.endsWith(XSD_SUFFIX)) {
            // 如果是 xsd 就从这里解析
            // 具体的执行实例是: PluggableSchemaResolver
            // 通过调用 META-INF/spring.schemas 解析
            return this.schemaResolver.resolveEntity(publicId, systemId);
        }
    }

    // Fall back to the parser's default behavior.
    return null;
}
```

可以看到，对于不同验证模式，Spring 使用了不同的解析器解析。这里简述一下原理，比如加载 DTD 类型的 `BeansDtdResolver` 的 `resolveEntity` 方法是直接截取 systemId 最后的 xx.dtd 然后去当前路径下寻找，而加载 XSD 类型的 `PluggableSchemaResolver` 类的`resolveEntity` 是默认到 `META-INF/Spring.schemas` 文件中找到 systemid 所对应的 XSD 文件并加载。

```java
// org.springframework.beans.factory.xml.BeansDtdResolver

@Override
@Nullable
public InputSource resolveEntity(@Nullable String publicId, @Nullable String systemId) throws IOException {
    if (logger.isTraceEnabled()) {
        logger.trace("Trying to resolve XML entity with public ID [" + publicId +
                     "] and system ID [" + systemId + "]");
    }

    if (systemId != null && systemId.endsWith(DTD_EXTENSION)) {
        int lastPathSeparator = systemId.lastIndexOf('/');
        int dtdNameStart = systemId.indexOf(DTD_NAME, lastPathSeparator);
        if (dtdNameStart != -1) {
            String dtdFile = DTD_NAME + DTD_EXTENSION;
            if (logger.isTraceEnabled()) {
                logger.trace("Trying to locate [" + dtdFile + "] in Spring jar on classpath");
            }
            try {
                Resource resource = new ClassPathResource(dtdFile, getClass());
                InputSource source = new InputSource(resource.getInputStream());
                source.setPublicId(publicId);
                source.setSystemId(systemId);
                if (logger.isTraceEnabled()) {
                    logger.trace("Found beans DTD [" + systemId + "] in classpath: " + dtdFile);
                }
                return source;
            }
            catch (FileNotFoundException ex) {
                if (logger.isDebugEnabled()) {
                    logger.debug("Could not resolve beans DTD [" + systemId + "]: not found in classpath", ex);
                }
            }
        }
    }

    // Fall back to the parser's default behavior.
    return null;
}
```



## 7、解析及注册 BeanDefinitions

将文件转化为 `Document` 后，接下来的提取及注册 bean 就是我们的重头戏，继续之前的分析，当程序已经拥有 XML 文档文件的 Document 后，就会进入下面的方法：

```java
// org.springframework.beans.factory.xml.XmlBeanDefinitionReader

protected int doLoadBeanDefinitions(InputSource inputSource, Resource resource)
    throws BeanDefinitionStoreException {

    // 省略 try...catch
    Document doc = doLoadDocument(inputSource, resource);
    int count = registerBeanDefinitions(doc, resource);
  
    return count;
}

// 注册 bean 在下面这个方法里
public int registerBeanDefinitions(Document doc, Resource resource) throws BeanDefinitionStoreException {
    // 使用 DefaultBeanDefinitionDocumentReader 实例化 BeanDefinitionDocumentReader
    BeanDefinitionDocumentReader documentReader = createBeanDefinitionDocumentReader();
    // 在构建当前对象，即 BeanDefinitionReader 时，会将 BeanDefinitionRegistry 传入，默认使用继承自 DefaultListableBeanFactory 的子类，这里就是 XmlBeanFactory 的实例
    // 记录统计前 BeanDefinition 的加载个数
    int countBefore = getRegistry().getBeanDefinitionCount();
    // 加载及注册 bean
    documentReader.registerBeanDefinitions(doc, createReaderContext(resource));
    // 记录本次加载的 BeanDefinition 个数
    return getRegistry().getBeanDefinitionCount() - countBefore;
}

// 注意这里用到了 BeanUtils 工具类
protected BeanDefinitionDocumentReader createBeanDefinitionDocumentReader() {
    return BeanUtils.instantiateClass(this.documentReaderClass);
}
```

`documentReader.registerBeanDefinitions(doc, createReaderContext(resource))` 这行代码负责解析并注册 bean，其中的 doc 参数就是之前得到的 `Document` 对象。这个方法很好的地应用了面向对象的单一职责原则，将逻辑处理委托给单一的类进行处理，而这个逻辑处理类就是 `BeanDefinitionDocumentReader`。

`BeanDefinitionDocumentReader` 是一个接口，它的实例化的工作是在 `createBeanDefinitionDocumentReader()` 方法中完成的，通过此方法，`BeanDefinitionDocumentReader` 真正的类型其实是 `DefaultBeanDefinitionDocumentReader` 类型了。

方法代码如下：

```java
// org.springframework.beans.factory.xml.DefaultBeanDefinitionDocumentReader

@Override
public void registerBeanDefinitions(Document doc, XmlReaderContext readerContext) {
    this.readerContext = readerContext;
    // 从 Document 中获取 Element 作为 root
    doRegisterBeanDefinitions(doc.getDocumentElement());
}
```

可以看到这个方法的主要作用之一就是提取 root，以便再次将 root 作为参数继续 `BeanDefinition` 的注册，而 `doRegisterBeanDefinitions` 正是真正核心的注册 bean 的逻辑：

```java
// org.springframework.beans.factory.xml.DefaultBeanDefinitionDocumentReader

protected void doRegisterBeanDefinitions(Element root) {
    // Any nested <beans> elements will cause recursion in this method. In
    // order to propagate and preserve <beans> default-* attributes correctly,
    // keep track of the current (parent) delegate, which may be null. Create
    // the new (child) delegate with a reference to the parent for fallback purposes,
    // then ultimately reset this.delegate back to its original (parent) reference.
    // this behavior emulates a stack of delegates without actually necessitating one.
    
    // 将解析任务委托给其他类执行
    BeanDefinitionParserDelegate parent = this.delegate;
    this.delegate = createDelegate(getReaderContext(), root, parent);

    if (this.delegate.isDefaultNamespace(root)) {
        // 处理 profile 属性
        String profileSpec = root.getAttribute(PROFILE_ATTRIBUTE);
        if (StringUtils.hasText(profileSpec)) {
            String[] specifiedProfiles = StringUtils.tokenizeToStringArray(
                profileSpec, BeanDefinitionParserDelegate.MULTI_VALUE_ATTRIBUTE_DELIMITERS);
            // We cannot use Profiles.of(...) since profile expressions are not supported
            // in XML config. See SPR-12458 for details.
            if (!getReaderContext().getEnvironment().acceptsProfiles(specifiedProfiles)) {
                if (logger.isDebugEnabled()) {
                    logger.debug("Skipped XML bean definition file due to specified profiles [" + profileSpec +
                                 "] not matching: " + getReaderContext().getResource());
                }
                return;
            }
        }
    }

    // 模板方法: 解析前处理，交给子类实现
    preProcessXml(root);
    
    // 真正的解析和注册操作
    parseBeanDefinitions(root, this.delegate);
    
    // 模板方法: 解析后处理，交给子类实现
    postProcessXml(root);

    this.delegate = parent;
}
```

通过上面的代码我们可以得到这样的处理流程：

（1）首先将解析任务委托给 `BeanDefinitionParserDelegate` 类，第一次解析此对象为 null，此后就有具体的实例了；

（2）对 `profile` 属性进行处理；

（3）开始具体的解析，可以看到 `preProcessXml(root)` 和 `postProcessXml(root)` 方法都是空实现且使用了 protected 修饰，可见这是交由子类实现的，在设计模式中叫做模板方法模式，如果继承 `DefaultBeanDefinitionDocumentReader` 的子类需要在 Bean 解析前后做一些处理的话，那么只需要重写这两个方法就可以了；



### 7.1 profile 属性的使用

在注册 Bean 的时候有一个步骤是对 `PROFILE_ATTRIBUTE` 属性的解析，可能对于我们来说，profile 属性并不常用。先了解一下这个属性。

分析 profile 之前先了解一下 profile 的用法，官方示例代码片段如下：

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:jdbc="http://www.springframework.org/schema/jdbc"
    xmlns:jee="http://www.springframework.org/schema/jee"
    xsi:schemaLocation="...">

    <!-- other bean definitions -->

    <beans profile="development">
        <jdbc:embedded-database id="dataSource">
            <jdbc:script location="classpath:com/bank/config/sql/schema.sql"/>
            <jdbc:script location="classpath:com/bank/config/sql/test-data.sql"/>
        </jdbc:embedded-database>
    </beans>

    <beans profile="production">
        <jee:jndi-lookup id="dataSource" jndi-name="java:comp/env/jdbc/datasource"/>
    </beans>
</beans>
```

此时，集成到 Web 环境中，就需要这样配置：

```xml
<context-param>
	<param-name>Spring.profiles.active</param-name>
    <param-value>development</param-value>
</context-param>
```

有了这个特性我们就可以同时在配置文件中部署两套配置来适用于生成环境和开发环境，这样可以方便的进行切换开发、部署环境，最常用的就是更换不同的数据库。

了解了 profile 的使用再来分析代码会清晰得多，首先程序会获取 beans 节点是否定义了 profile 属性，如果定义了则会需要到环境变量中去寻找。（注意这是过去使用 XML Config 时用的，现在替代 XML 的是 Java Config 配置，不过为了兼容旧版本的系统所以还保留了 XML 配置）。

### 7.2 解析并注册 BeanDefinition

处理了 profile 后，就可以进行 XML 的读取了，查看 `parseBeanDefinitions` 方法：

```java
// org.springframework.beans.factory.xml.DefaultBeanDefinitionDocumentReader

protected void parseBeanDefinitions(Element root, BeanDefinitionParserDelegate delegate) {
    // 对 beans 标签进行处理
    if (delegate.isDefaultNamespace(root)) {
        NodeList nl = root.getChildNodes();
        for (int i = 0; i < nl.getLength(); i++) {
            Node node = nl.item(i);
            if (node instanceof Element) {
                Element ele = (Element) node;
                if (delegate.isDefaultNamespace(ele)) {
                    // 对 bean 标签进行处理
                    parseDefaultElement(ele, delegate);
                }
                else {
                    // 对 bean 作处理
                    delegate.parseCustomElement(ele);
                }
            }
        }
    }
    else {
        delegate.parseCustomElement(root);
    }
}
```

上面的对 bean 做了两种处理，这是因为在 Spring 的 XML 配置里有两大类的 Bean 声明：

- 一类是默认的，如：`<bean id="test" class="test.TestBean" />`
- 另一类就是自定义的，如：`<tx:annotation-driven />`

这两种方式的读取与解析差别是非常大的，如果采用 Spring 默认的配置，Spring 当然知道该怎么做，但是如果是自定义的，那么就需要用户实现一些接口和配置了。对于根节点或者子节点如果是默认命名空间的话则采用 `parseDefaultElement` 方法进行解析，否则使用 `deletage.parseCustomElement` 方法对自定义命名空间进行解析。而判断是否默认命名空间还是自定义命名空间的办法其实是使用 `node.getNamespaceURI()` 获取命名空间，并于 Spring 中固定的命名空间 `http://www.springframework.org/schema/beans` 进行比对。如果一致则认为是默认，否则就认为是自定义。

