---
title: Spring Source Code Analysis (五) User-defined tag resolution
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220215170101.jpg'
coverImg: /img/20220215170101.jpg
cover: false
toc: true
mathjax: false
date: 2022-03-18 11:01:17
summary: "Spring 源码分析: 自定义标签的解析"
categories: "Spring"
keywords: "Spring"
tags: "Spring"
---

# 自定义标签的解析

在 Spring 的 XML 配置文件中存在两种标签：

- 默认标签；
- 自定义标签。

前面分析过默认标签的解析过程，下面分析 Spring 中自定义标签的加载过程。

先回顾之前的流程：从配置文件到 Document 的转换并提取对应的 root 之后，将开始所有元素的解析，在这一过程中分为两种类型：默认标签元素和自定义标签元素：

```java
// org.springframework.beans.factory.xml.DefaultBeanDefinitionDocumentReader

protected void parseBeanDefinitions(Element root, BeanDefinitionParserDelegate delegate) {
    if (delegate.isDefaultNamespace(root)) {
        // 默认标签元素解析
        NodeList nl = root.getChildNodes();
        for (int i = 0; i < nl.getLength(); i++) {
            Node node = nl.item(i);
            if (node instanceof Element) {
                Element ele = (Element) node;
                if (delegate.isDefaultNamespace(ele)) {
                    parseDefaultElement(ele, delegate);
                }
                else {
                    delegate.parseCustomElement(ele);
                }
            }
        }
    }
    else {
        // 自定义标签元素解析
        delegate.parseCustomElement(root);
    }
}
```

重点在于 `delegate.parseCustomElement(root)` 这句代码，当 Spring 拿到一个元素时首先要做的是根据命名空间进行解析，如果是默认的命名空间，则使用 parseDefaultElement 方法进行元素解析，否则使用 parseCustomElement 方法进行解析。



## 一、自定义标签的使用

很多情况下，我们需要为系统提供可配置化的支持，简单的做法可以直接基于 Spring 的标准 bean 来配置，但配置较为复杂或者需要更多丰富控制的时候，会显得非常笨拙。

一般的做法是会用原生态的方式去解析定义好的 XML 文件，然后转化为配置对象。这种方式当然可以解决所有的问题，但实现起来比较繁琐，特别是在配置非常复杂的时候，解析工作是一个不得不考虑的负担。

Spring 提供了可扩展 Schema 的支持，这是一个不错的折中方案，扩展 Spring 自定义标签配置大致需要以下几个步骤（前提是导入 Spring 的 Core 包）：

- 创建一个需要扩展的组件；
- 定义一个 XSD 文件描述组件内容；
- 创建一个文件，实现 `BeanDefinitionParser` 接口，用来解析 XSD 文件中的定义和组件定义；
- 创建一个 `Handler` 文件，扩展自 `NamespaceHandlerSupport`，目的是将组件注册到 Spring 容器；
- 编写 `Spring.handlers` 和 `Spring.schemas` 文件。

### 1、创建组件

定义一个普通的 POJO，用来接收配置文件：

```java
public class User {
    
    private String userName;
    
    private String email;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
```



### 2、定义一个 XSD 文件描述组件信息

```xml
<?xml version="1.0" encoding="utf-8" ?>
<schema xmlns="http://www.w3.org/2001/XMLSchema"
        targetNamespace="https://naivekyo.github.io/schema/user"
        elementFormDefault="qualified">
    
    <element name="user">
        <complexType>
            <attribute name="id" type="string" />
            <attribute name="userName" type="string" />
            <attribute name="email" type="string" />
        </complexType>
    </element>
</schema>
```

上面的 XSD 文件中描述了一个新的 `targetNamespace` 并在这个空间中定义了一个 name 为 user 的 element，user 有三个属性 id、userName 和 email，其中 email 类型为 string，这三个属性主要用于验证 Spring 配置文件中自定义格式。XSD 文件是 XML DTD 的替代者，使用 XML Schema 语言进行编写。

### 3、BeanDefinitionParser 接口

创建一个`BeanDefinitionParser`  类型的类，用来解析 XSD 文件中的定义和组件定义：

```java
public class UserBeanDefinitionParser extends AbstractSingleBeanDefinitionParser {

    // Element 对应的类
    @Override
    protected Class<?> getBeanClass(Element element) {
        return User.class;
    }

    // 从 Element 中解析并提取对应的元素
    @Override
    protected void doParse(Element element, BeanDefinitionBuilder builder) {
        String userName = element.getAttribute("userName");
        String email = element.getAttribute("email");
        
        // 将提出的信息放入 BeanDefinitionBuilder 中, 待完成所有 bean 的解析后统一注册到 beanFactory 中
        if (StringUtils.hasText(userName)) {
            builder.addPropertyReference("userName", userName);
        }
        if (StringUtils.hasText(email)) {
            builder.addPropertyReference("email", email);
        }
    }
}
```

### 4、Handler

创建一个 Handler 文件，扩展自 `NamesapceHandlerSupport`，目的是将组件注册到 Spring 容器：

```java
public class MyNamespaceHandler extends NamespaceHandlerSupport {

    @Override
    public void init() {
        registerBeanDefinitionParser("user", new UserBeanDefinitionParser());
    }
}
```

上面的代码的含义是，遇到类似 `user:aaa` 开头的元素，就会把这个元素扔给对应的 `UserBeanDefinitionParser` 去解析。



### 5、spring.handlers 和 spring.schemas

最后编写 `Spring.handlers` 和 `Spring.schemas` 文件，默认位置是在工程的 `/META-INF/` 文件夹下，当然也可以通过 Spring 预留的扩展方式或者直接修改源码的方式去改变默认的路径（参加 `DefaultNamespaceHandlerResolver` 类）。

> spring.handlers

```
https\://naivekyo.github.io/schema/user=io.github.naivekyo.bean.custom_label.MyNamespaceHandler
```

> spring.schemas

```
https\://naivekyo.github.io/schema/user.xsd=META-INF/spring-test.xsd
```

到这里，自定义的配置就结束了，而 Spring 加载自定义的大致流程是遇到自定义标签然后就去 `spring.handlers` 和 `spring.schemas` 中去找对应的 handler 和 XSD，默认位置是 `/META-INF/` 下，进而找到对应的 handler 以及解析元素的 Parser，从而完成整个自定义元素的解析，也就是说自定义与 Spring 中默认的标准配置不同的地方在于 Spring 将自定义标签解析的工作委托给了用户去实现。



### 6、测试

创建测试配置文件，在配置文件中引入对应的命名空间以及 XSD 后，就可以直接使用自定义标签了：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:myTag="https://naivekyo.github.io/schema/user"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
       http://www.springframework.org/schema/beans/spring-beans.xsd
       https://naivekyo.github.io/schema/user
       https://naivekyo.github.io/schema/user.xsd">
    
    <myTag:user id="testbean" userName="aaa" email="bbb" />
    
</beans>
```

测试类：

```java
@Test
public void test3() {

    ApplicationContext context = new ClassPathXmlApplicationContext("application-context.xml");

    MyUser user = (MyUser) context.getBean("testBean");
    System.out.println(user.getUserName() + " " + user.getEmail());
}
```

上面就是在 Spring 中如何使用自定义的标签，自定义标签在 Spring 中用得很多，比如常见的事务标签 `tx`：`<tx:annotation-driven>`。

## 二、自定义标签解析

了解了使用自定义标签后，下面看看 Spring 是如何解析自定义标签的：

```java
// org.springframework.beans.factory.xmlBeanDefinitionParserDelegate

@Nullable
public BeanDefinition parseCustomElement(Element ele) {
    return parseCustomElement(ele, null);
}

// containingBd 是父类 bean，对顶层元素的解析应设置为 null
@Nullable
public BeanDefinition parseCustomElement(Element ele, @Nullable BeanDefinition containingBd) {
    // 获取对应的命名空间
    String namespaceUri = getNamespaceURI(ele);
    if (namespaceUri == null) {
        return null;
    }
    // 根据命名空间找到对应的 NamspaceHandler
    NamespaceHandler handler = this.readerContext.getNamespaceHandlerResolver().resolve(namespaceUri);
    if (handler == null) {
        error("Unable to locate Spring NamespaceHandler for XML schema namespace [" + namespaceUri + "]", ele);
        return null;
    }
    // 调用自定义的 NamspaceHandler 进行解析
    return handler.parse(ele, new ParserContext(this.readerContext, this, containingBd));
}
```

思路非常简单，首先根据对应的 bean 获取对应的命名空间，根据命名空间解析对应的处理器，然后根据用户自定义的处理器进行解析。

### 1、获取标签的命名空间

标签的解析是从命名空间的解析开始的，无论是区分 Spring 中默认标签和自定义标签还是区分自定义标签中不同标签的处理器都是以标签所提供的命名空间为基础的，而至于如何提取对应元素的命名空间其实并不需要我们亲自去实现，在 `org.w3c.dom.Node` 中已经提供了方法供我们直接调用：

```java
// org.springframework.beans.factory.xmlBeanDefinitionParserDelegate

@Nullable
public String getNamespaceURI(Node node) {
    return node.getNamespaceURI();
}
```



### 2、提取自定义标签处理器

有了命名空间，就可以进行 `NamespaceHandler` 的提取了，继续之前的 `parseCustomElement` 函数的跟踪，分析 `NamespaceHandler handler = this.readerContext.getNamespaceHandlerResolver().resolve(namespaceUri)`，在 readerContext 初始化的时候其属性 namespaceHanderResolver 已经被初始化为 `DefaultNamespaceHandlerResolver` 类中方法，下面看看该方法：

```java
// org.springframework.beans.factory.xml.DefaultNamespaceHandlerResolver

@Override
@Nullable
public NamespaceHandler resolve(String namespaceUri) {
    // 获取所有已经配置的 handler 映射
    Map<String, Object> handlerMappings = getHandlerMappings();
    // 根据命名空间找到对应的解析器
    Object handlerOrClassName = handlerMappings.get(namespaceUri);
    if (handlerOrClassName == null) {
        return null;
    }
    else if (handlerOrClassName instanceof NamespaceHandler) {
        // 已经做过解析的情况，直接从缓存中读取
        return (NamespaceHandler) handlerOrClassName;
    }
    else {
        // 没有做过解析，则返回的是类路径
        String className = (String) handlerOrClassName;
        try {
            // 使用反射将类路径转化为类
            Class<?> handlerClass = ClassUtils.forName(className, this.classLoader);
            if (!NamespaceHandler.class.isAssignableFrom(handlerClass)) {
                throw new FatalBeanException("Class [" + className + "] for namespace [" + namespaceUri +
                                             "] does not implement the [" + NamespaceHandler.class.getName() + "] interface");
            }
            // 初始化类
            NamespaceHandler namespaceHandler = (NamespaceHandler) BeanUtils.instantiateClass(handlerClass);
            // 调用自定义的 NamespaceHandler 的初始化方法
            namespaceHandler.init();
            // 记录在缓存
            handlerMappings.put(namespaceUri, namespaceHandler);
            return namespaceHandler;
        }
        catch (ClassNotFoundException ex) {
            throw new FatalBeanException("Could not find NamespaceHandler class [" + className +
                                         "] for namespace [" + namespaceUri + "]", ex);
        }
        catch (LinkageError err) {
            throw new FatalBeanException("Unresolvable class definition for NamespaceHandler class [" +
                                         className + "] for namespace [" + namespaceUri + "]", err);
        }
    }
}
```

上面的函数很清晰的阐述了解析自定义 `NamespaceHandler` 的过程，通过前面的示例我们了解到如果要使用自定义标签，那么其中一项必不可少的操作就是在 `spring.handlers` 文件中配置命名空间与命名空间处理器的映射关系。只有这样，Spring 才能够根据映射关系找到匹配的处理器，而寻找匹配的处理器就是在上面的函数中实现的，当获取到自定义的 `NamespaceHandler` 后就可以进行处理器初始化并解析了。

之前是这样写的：

```java
public class MyNamespaceHandler extends NamespaceHandlerSupport {

    @Override
    public void init() {
        registerBeanDefinitionParser("user", new UserBeanDefinitionParser());
    }
}
```

得到命名空间处理后会马上执行 `namespaceHandler.init()` 来进行自定义 `BeanDefinitionParser` 的注册。在这里，可以注册多个标签解析器，当前示例只支持 `<myTag:user>` 的写法，也可以在这里注册多个解析器，如 `<myname:A、<myname:B` 等等，使得命名空间中可以支持多种标签的解析。

注册后，命名空间处理器就可以根据标签的不同来调用不同的解析器进行解析。此时可以推断出 `getHandlerMappings()` 方法的主要功能就是读取 `spring.handlers` 配置文件并将配置文件缓存在 map 中：

```java
// org.springframework.beans.factory.xml.DefaultNamespaceHandlerResolver

private Map<String, Object> getHandlerMappings() {
    Map<String, Object> handlerMappings = this.handlerMappings;
    // 如果没有被缓存则进行缓存
    if (handlerMappings == null) {
        synchronized (this) {
            handlerMappings = this.handlerMappings;
            if (handlerMappings == null) {
                if (logger.isTraceEnabled()) {
                    logger.trace("Loading NamespaceHandler mappings from [" + this.handlerMappingsLocation + "]");
                }
                try {
                    // this.handlerMappingsLocation 在构造函数中被初始化为 META-INF/spring.handlers
                    Properties mappings =
                        PropertiesLoaderUtils.loadAllProperties(this.handlerMappingsLocation, this.classLoader);
                    if (logger.isTraceEnabled()) {
                        logger.trace("Loaded NamespaceHandler mappings: " + mappings);
                    }
                    handlerMappings = new ConcurrentHashMap<>(mappings.size());
                    // 将 Properties 格式文件合并到 Map 格式的 handlerMappings 中
                    CollectionUtils.mergePropertiesIntoMap(mappings, handlerMappings);
                    this.handlerMappings = handlerMappings;
                }
                catch (IOException ex) {
                    throw new IllegalStateException(
                        "Unable to load NamespaceHandler mappings from location [" + this.handlerMappingsLocation + "]", ex);
                }
            }
        }
    }
    return handlerMappings;
}
```

这里借助了 `PropertiesLoaderUtils` 对属性 `handlerMappingsLocation` 进行了配置文件的读取，`handlerMappingsLocation` 被默认初始化为 `"META-INF/spring.handlers"`。

### 3、标签解析

得到了解析器以及要分析的元素后，Spring 就可以将解析工作委托给自定义解析器去解析了，在 Spring 中的代码为：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate#parseCustomElement()

return handler.parse(ele, new ParserContext(this.readerContext, this, containingBd));
```

此时的 handler 已经被实例化成我们自定义的 `MyNamesapceHandler` 了，而 `MyNamesapceHandler` 也已经完成了初始化的工作，但是在我们实现的自定义命名空间处理器中并没有实现 parse 方法，所以推断，这个方法是在父类中的实现，查看父类 `NamespaceHandlerSupport` 中的 parse 方法：

```java
// org.springframework.beans.factory.xml.NamespaceHandlerSupport

@Override
@Nullable
public BeanDefinition parse(Element element, ParserContext parserContext) {
    // 寻找解析器进行解析
    BeanDefinitionParser parser = findParserForElement(element, parserContext);
    return (parser != null ? parser.parse(element, parserContext) : null);
}
```

解析过程中首先是寻找元素对应的解析器，进而调用解析器的 parse 方法，那么结合实例来讲，其实就是首先获取在 `MyNamesapceHandler` 类中的 init 方法中注册相应的 `UserBeanDefinitionParser` 实例，并调用其 parse 方法进行进一步解析：

```java
// org.springframework.beans.factory.xml.NamespaceHandlerSupport

@Nullable
private BeanDefinitionParser findParserForElement(Element element, ParserContext parserContext) {
    // 获取元素名称，也就是 <myTag:user 中的 user，在此例子中 localName 就是 user
    String localName = parserContext.getDelegate().getLocalName(element);
    // 找到 user 对应的解析器，也就是在 registerBeanDefinitionParser("user", new UserBeanDefinitionParser()); 注册的解析器
    BeanDefinitionParser parser = this.parsers.get(localName);
    if (parser == null) {
        parserContext.getReaderContext().fatal(
            "Cannot locate BeanDefinitionParser for element [" + localName + "]", element);
    }
    return parser;
}
```

而对于 parse 方法的处理：

```java
// org.springframework.beans.factory.xml.AbstractBeanDefinitionParser

@Override
@Nullable
public final BeanDefinition parse(Element element, ParserContext parserContext) {
    AbstractBeanDefinition definition = parseInternal(element, parserContext);
    if (definition != null && !parserContext.isNested()) {
        try {
            String id = resolveId(element, definition, parserContext);
            if (!StringUtils.hasText(id)) {
                parserContext.getReaderContext().error(
                    "Id is required for element '" + parserContext.getDelegate().getLocalName(element)
                    + "' when used as a top-level tag", element);
            }
            String[] aliases = null;
            if (shouldParseNameAsAliases()) {
                String name = element.getAttribute(NAME_ATTRIBUTE);
                if (StringUtils.hasLength(name)) {
                    aliases = StringUtils.trimArrayElements(StringUtils.commaDelimitedListToStringArray(name));
                }
            }
            // 将 AbstractBeanDefinition 转化为 BeanDefinitionHolder 并注册
            BeanDefinitionHolder holder = new BeanDefinitionHolder(definition, id, aliases);
            registerBeanDefinition(holder, parserContext.getRegistry());
            if (shouldFireEvents()) {
                // 需要通知监听器则通知并进行处理
                BeanComponentDefinition componentDefinition = new BeanComponentDefinition(holder);
                postProcessComponentDefinition(componentDefinition);
                parserContext.registerComponent(componentDefinition);
            }
        }
        catch (BeanDefinitionStoreException ex) {
            String msg = ex.getMessage();
            parserContext.getReaderContext().error((msg != null ? msg : ex.toString()), element);
            return null;
        }
    }
    return definition;
}
```

可以看到，这个函数中大部分的代码是用来处理将解析后的 `AbstractBeanDefinition` 转化为 `BeanDefinitionHolder` 并注册的功能，而真正去做解析的事情委托给了函数 `parseInternal`（模板方法），这是这句代码调用了我们自定义的解析函数。

在 `parseInternal` 中并不是直接调用自定义的 `doParse` 函数，而是进行了一系列的数据准备，包括对 beanClass、scope、lazyInit 等属性的准备：

```java
// org.springframework.beans.factory.xml.AbstractSingleBeanDefinitionParser

@Override
protected final AbstractBeanDefinition parseInternal(Element element, ParserContext parserContext) {
    BeanDefinitionBuilder builder = BeanDefinitionBuilder.genericBeanDefinition();
    String parentName = getParentName(element);
    if (parentName != null) {
        builder.getRawBeanDefinition().setParentName(parentName);
    }
    /// 获取自定义标签的 class，此时会调用自定义解析器如 UserBeanDefinitionParser 中的 getBeanClass 方法
    Class<?> beanClass = getBeanClass(element);
    if (beanClass != null) {
        builder.getRawBeanDefinition().setBeanClass(beanClass);
    }
    else {
        // 若子类没有重写 getBeanClass 方法则会检查子类是否重写了 getBeanClassName 方法
        String beanClassName = getBeanClassName(element);
        if (beanClassName != null) {
            builder.getRawBeanDefinition().setBeanClassName(beanClassName);
        }
    }
    builder.getRawBeanDefinition().setSource(parserContext.extractSource(element));
    BeanDefinition containingBd = parserContext.getContainingBeanDefinition();
    if (containingBd != null) {
        // 如果存在父类则使用父类的 scope 属性
        // Inner bean definition must receive same scope as containing bean.
        builder.setScope(containingBd.getScope());
    }
    if (parserContext.isDefaultLazyInit()) {
        // 配置延迟加载
        // Default-lazy-init applies to custom bean definitions as well.
        builder.setLazyInit(true);
    }
    // 调用子类重写的 doParse 方法进行解析
    doParse(element, parserContext, builder);
    return builder.getBeanDefinition();
}

protected void doParse(Element element, ParserContext parserContext, BeanDefinitionBuilder builder) {
    doParse(element, builder);
}

// 模板方法
protected void doParse(Element element, BeanDefinitionBuilder builder) {
}
```

回顾一下全部的自定义标签处理过程，虽然在实例中我们定义了 `UserBeanDefinitionParser`，但是在其中我们只是做了与自己业务逻辑相关的部分。

但是虽然我们没做但不代表就没有，这种处理过程中同样也是按照 Spring 中默认标签的处理方式进行，包括创建 `BeanDefinition` 以及进行相应默认属性的设置，对于这些工作 Spring 都默默地帮我们实现了，只是暴露出了一些接口来供用户实现个性化的业务。

至此，我们已经了解了 Spring 将 bean 从配置文件到加载到内存的全过程，接下来分析如何使用这些 bean。