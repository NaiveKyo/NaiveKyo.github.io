---
title: 'Spring Source Code Analysis (四) The parsing of alias, import and beans label'
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220215170017.jpg'
coverImg: /img/20220215170017.jpg
cover: false
toc: true
mathjax: false
date: 2022-03-17 10:55:00
summary: "Spring 源码分析: alias, import 和 beans 标签的解析"
categories: "Spring"
keywords: "Spring"
tags: "Spring"
---

# 默认标签的解析

之前提到过读配置文件的解析包括对 import 标签、alias 标签、bean 标签、beans 标签的处理，上一篇博客主要围绕着 bean 标签做了详细的分析，下面再看看 alias 标签。

# 1、alias 标签的解析

在对 bean 进行定义时，除了使用 id 属性来指定名称之外，为了提供多个名称，可以使用 alias 标签来指定。而所有的这些名称都指向同一个 bean，在某些情况下提供别名非常有用，比如为了让应用的每一个组件能更容易地对公共组件进行引用。

然而，在定义 bean 时就指定所有的别名并不总是恰当的。有时我们期望能在当前位置为那些在别处定义的 bean引入别名。在 XML 配置文件中，可用单独的 `<alias/>` 元素来完成 bean 别名的定义，如配置文件中定义了一个 JavaBean：

```xml
<bean id="testBean" class="com.test" />
<!-- 可以使用 name 属性定义别名 -->
<bean id="testBean" name="testBean1,testBean2" class="com.test" />

<!-- Spring 还有另外一种声明别名的方式 -->
<bean id="testBean" class="com.test" />
<alias name="testBean" alias="testBean1,testBean2" />
```

举个例子，组件 A 在 XML 配置文件中定义了一个名为 `componentA` 的 `DataSource` 类型的 bean，但组件 B 却想在其 XML 文件中以 `componentB` 命名引入此 bean。而且在主程序 MyApp 的 XML 配置文件中，希望以 `myApp` 的名字来引用此 bean，最后容器加载 3 个 XML 文件来完成最终的 `ApplicationContext`。在此情形下，可通过在配置文件中添加下列 alias 元素实现：

```xml
<alias name="componentA" alias="componentB" />
<alias name="componentA" alias="myApp" />
```

下面深入分析 alias 标签的解析过程：

```java
// org.springframework.beans.factory.xml.DefaultBeanDefinitionDocumentReader

private void parseDefaultElement(Element ele, BeanDefinitionParserDelegate delegate) {
    if (delegate.nodeNameEquals(ele, IMPORT_ELEMENT)) {
        importBeanDefinitionResource(ele);
    }
    else if (delegate.nodeNameEquals(ele, ALIAS_ELEMENT)) {
        processAliasRegistration(ele);
    }
    else if (delegate.nodeNameEquals(ele, BEAN_ELEMENT)) {
        processBeanDefinition(ele, delegate);
    }
    else if (delegate.nodeNameEquals(ele, NESTED_BEANS_ELEMENT)) {
        // recurse
        doRegisterBeanDefinitions(ele);
    }
}
```

解析方法如下：

```java
// org.springframework.beans.factory.xml.DefaultBeanDefinitionDocumentReader

protected void processAliasRegistration(Element ele) {
    // 获取 beanName
    String name = ele.getAttribute(NAME_ATTRIBUTE);
    // 获取别名
    String alias = ele.getAttribute(ALIAS_ATTRIBUTE);
    boolean valid = true;
    if (!StringUtils.hasText(name)) {
        getReaderContext().error("Name must not be empty", ele);
        valid = false;
    }
    if (!StringUtils.hasText(alias)) {
        getReaderContext().error("Alias must not be empty", ele);
        valid = false;
    }
    if (valid) {
        try {
            // 注册 alias 
            getReaderContext().getRegistry().registerAlias(name, alias);
        }
        catch (Exception ex) {
            getReaderContext().error("Failed to register alias '" + alias +
                                     "' for bean with name '" + name + "'", ele, ex);
        }
        // 别名注册后通知监听器做相应的处理
        getReaderContext().fireAliasRegistered(name, alias, extractSource(ele));
    }
}
```

可以看到和之前注册 BeanDefinitinon 很相似，这里也是通过注册工厂 `AliasRegistry` 的实例 `XmlBeanFactory` 进行注册（方法的实现在 `SimpleAliasRegistry` 中），具体不再赘述。

# 2、import 标签的解析

Spring 项目早期最复杂的一点就在配置文件的撰写，此时分模块是一个很好的办法，此时可以使用 import 标签，例如我们可以构造这样的 Spring 配置文件 `applicationContext.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
       http://www.springframework.org/schema/beans/spring-beans.xsd">

    <import resource="customerContext.xml" />
    <import resource="systemContext.xml" />
    
</beans>
```

`applicationContext.xml` 文件中使用 import 的方式导入各个模块配置文件，以后若有新模块的加入，那么就可以简单修改这个文件了。这样可以大大简化配置后期维护的复杂度，并使配置模块化、易于管理。

下面看看 Spring 如何解析 import 配置文件：

```java
// org.springframework.beans.factory.xml.DefaultBeanDefinitionDocumentReader

protected void importBeanDefinitionResource(Element ele) {
    // 获取 resource 属性
    String location = ele.getAttribute(RESOURCE_ATTRIBUTE);
    // 如果不存在 resource 属性则不做任何处理
    if (!StringUtils.hasText(location)) {
        getReaderContext().error("Resource location must not be empty", ele);
        return;
    }

    // 解析系统属性，格式如 "${user.dir}"
    // Resolve system properties: e.g. "${user.dir}"
    location = getReaderContext().getEnvironment().resolveRequiredPlaceholders(location);

    Set<Resource> actualResources = new LinkedHashSet<>(4);

    // 判断 location 是绝对 URI 还是相对 URI
    // Discover whether the location is an absolute or relative URI
    boolean absoluteLocation = false;
    try {
        absoluteLocation = ResourcePatternUtils.isUrl(location) || ResourceUtils.toURI(location).isAbsolute();
    }
    catch (URISyntaxException ex) {
        // cannot convert to an URI, considering the location relative
        // unless it is the well-known Spring prefix "classpath*:"
    }

    // Absolute or relative?
    // 如果是绝对 URI 则直接根据地址加载对应的配置文件
    if (absoluteLocation) {
        try {
            int importCount = getReaderContext().getReader().loadBeanDefinitions(location, actualResources);
            if (logger.isTraceEnabled()) {
                logger.trace("Imported " + importCount + " bean definitions from URL location [" + location + "]");
            }
        }
        catch (BeanDefinitionStoreException ex) {
            getReaderContext().error(
                "Failed to import bean definitions from URL location [" + location + "]", ele, ex);
        }
    }
    else {
        // 如果是相对地址则根据相对地址计算出绝对地址
        // No URL -> considering resource location as relative to the current file.
        try {
            int importCount;
            // Resource 存在多个实现子类，如 VfsResource、FileSystemResource 等等
            // 而每个 resource 的 createRelative 方法实现方式都不一样，所以这里先使用子类的方法尝试解析
            Resource relativeResource = getReaderContext().getResource().createRelative(location);
            if (relativeResource.exists()) {
                importCount = getReaderContext().getReader().loadBeanDefinitions(relativeResource);
                actualResources.add(relativeResource);
            }
            else {
                // 如果解析不成功，则使用默认的解析器 ResourcePatternResolver 来解析
                String baseLocation = getReaderContext().getResource().getURL().toString();
                importCount = getReaderContext().getReader().loadBeanDefinitions(
                    StringUtils.applyRelativePath(baseLocation, location), actualResources);
            }
            if (logger.isTraceEnabled()) {
                logger.trace("Imported " + importCount + " bean definitions from relative location [" + location + "]");
            }
        }
        catch (IOException ex) {
            getReaderContext().error("Failed to resolve current resource location", ele, ex);
        }
        catch (BeanDefinitionStoreException ex) {
            getReaderContext().error(
                "Failed to import bean definitions from relative location [" + location + "]", ele, ex);
        }
    }
    // 解析后进行监听器激活处理
    Resource[] actResArray = actualResources.toArray(new Resource[0]);
    getReaderContext().fireImportProcessed(location, actResArray, extractSource(ele));
}
```

流程如下：

（1）获取 resource 属性所代表的路径；

（2）解析路径中的系统属性，格式如 `"${user.dir}"`；

（3）判定 location 是绝对路径还是相对路径；

（4）如果是绝对路径则递归调用 bean 的解析过程，进行另一次解析；

（5）如果是相对路径则计算出绝对路径并进行解析；

（6）通知监听器，解析完成。（注意此版本为空实现）

# 3、嵌入式 beans 标签的解析

对于嵌入式的 beans 标签，它非常类似于 import 标签所提供的功能：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
       http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="aa" class="test.aa" />
    
    <beans>
    	...
    </beans>
   
</beans>
```

嵌入式 beans 标签的解析与单独的配置文件差不多，无非就是递归调用 beans 的解析过程。

