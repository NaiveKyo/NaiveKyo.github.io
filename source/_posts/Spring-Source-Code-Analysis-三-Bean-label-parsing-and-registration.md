---
title: Spring Source Code Analysis (三) Bean label parsing and registration
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220206175646.jpg'
coverImg: /img/20220206175646.jpg
cover: false
toc: true
mathjax: false
date: 2022-03-16 20:43:50
summary: "Spring 源码分析: XML 配置 Bean 标签的解析与注册"
categories: "Spring"
keywords: "Spring"
tags: "Spring"
---

# 默认标签的解析

之前提到过 Spring XML 配置文件中标签包括默认标签和自定义标签两种，而两种标签的用法以及解析方式存在着很大的不同，下面看看默认标签的解析过程。

默认标签的解析是在 `parseDefaultElement` 方法中进行的，方法中分别对 4 种不同的标签（import、alias、bean 和 beans）做了不同的处理。

```java
// org.springframework.beans.factory.xml.DefaultBeanDefinitionDocumentReader

private void parseDefaultElement(Element ele, BeanDefinitionParserDelegate delegate) {
    // 对 import 标签的处理
    if (delegate.nodeNameEquals(ele, IMPORT_ELEMENT)) {
        importBeanDefinitionResource(ele);
    }
    // 对 alias 标签的处理
    else if (delegate.nodeNameEquals(ele, ALIAS_ELEMENT)) {
        processAliasRegistration(ele);
    }
    // 对 bean 标签的处理
    else if (delegate.nodeNameEquals(ele, BEAN_ELEMENT)) {
        processBeanDefinition(ele, delegate);
    }
    // 对 beans 标签的处理
    else if (delegate.nodeNameEquals(ele, NESTED_BEANS_ELEMENT)) {
        // recurse
        doRegisterBeanDefinitions(ele);
    }
}
```

# bean 标签的解析及注册

这 4 种标签的解析中，bean 标签的解析最为复杂也最为重要，首先看相关的方法源码：

```java
// org.springframework.beans.factory.xml.DefaultBeanDefinitionDocumentReader

protected void processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate) {
    BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele);
    if (bdHolder != null) {
        bdHolder = delegate.decorateBeanDefinitionIfRequired(ele, bdHolder);
        try {
            // Register the final decorated instance.
            BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry());
        }
        catch (BeanDefinitionStoreException ex) {
            getReaderContext().error("Failed to register bean definition with name '" +
                                     bdHolder.getBeanName() + "'", ele, ex);
        }
        // Send registration event.
        getReaderContext().fireComponentRegistered(new BeanComponentDefinition(bdHolder));
    }
}
```

大致流程如下：

（1）首先委托 `BeanDefinitionDelegate` 类的 `parseBeanDefinitionElement` 方法进行元素解析，返回 `BeanDefinitionHolder` 类型的 bdHolder，经过这个方法后，bdHolder 示例已经包含我们配置文件中配置的各种属性了，例如 class、name、id、alias 等等属性；

（2）当返回的 bdHolder 不为空的情况下若存在默认标签的子节点下再有此定义属性，还需要再次对自定义标签进行解析；

（3）解析完成后，需要对解析后的 bdHolder 进行注册，同样，注册操作委托给了 `BeanDefinitionReaderUtils` 的 `registerBeanDefinition` 方法；

（4）最后发出响应事件，通知相关的监听器，这个 bean 已经加载完成了。

## 1、解析 BeanDefinition

下面对各个操作进行分析，首先从元素解析以及信息提取开始，也就是 `BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele)`，源码如下：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

@Nullable
public BeanDefinitionHolder parseBeanDefinitionElement(Element ele) {
    return parseBeanDefinitionElement(ele, null);
}

@Nullable
public BeanDefinitionHolder parseBeanDefinitionElement(Element ele, @Nullable BeanDefinition containingBean) {
    // 解析 id 属性
    String id = ele.getAttribute(ID_ATTRIBUTE);
    // 解析 name 属性
    String nameAttr = ele.getAttribute(NAME_ATTRIBUTE);

    // 分割 name 属性
    List<String> aliases = new ArrayList<>();
    if (StringUtils.hasLength(nameAttr)) {
        String[] nameArr = StringUtils.tokenizeToStringArray(nameAttr, MULTI_VALUE_ATTRIBUTE_DELIMITERS);
        aliases.addAll(Arrays.asList(nameArr));
    }

    String beanName = id;
    if (!StringUtils.hasText(beanName) && !aliases.isEmpty()) {
        beanName = aliases.remove(0);
        if (logger.isTraceEnabled()) {
            logger.trace("No XML 'id' specified - using '" + beanName +
                         "' as bean name and " + aliases + " as aliases");
        }
    }

    if (containingBean == null) {
        checkNameUniqueness(beanName, aliases, ele);
    }

    // 解析出 BeanDefinition，这里的 AbstractBeanDefinition 的实例是 GenericBeanDefinition
    AbstractBeanDefinition beanDefinition = parseBeanDefinitionElement(ele, beanName, containingBean);
    if (beanDefinition != null) {
        if (!StringUtils.hasText(beanName)) {
            try {
                // 如果不存在 beanName 那么根据 Spring 中提供的命名规则为当前 bean 生成对应的 beanName
                if (containingBean != null) {
                    beanName = BeanDefinitionReaderUtils.generateBeanName(
                        beanDefinition, this.readerContext.getRegistry(), true);
                }
                else {
                    beanName = this.readerContext.generateBeanName(beanDefinition);
                    // Register an alias for the plain bean class name, if still possible,
                    // if the generator returned the class name plus a suffix.
                    // This is expected for Spring 1.2/2.0 backwards compatibility.
                    String beanClassName = beanDefinition.getBeanClassName();
                    if (beanClassName != null &&
                        beanName.startsWith(beanClassName) && beanName.length() > beanClassName.length() &&
                        !this.readerContext.getRegistry().isBeanNameInUse(beanClassName)) {
                        aliases.add(beanClassName);
                    }
                }
                if (logger.isTraceEnabled()) {
                    logger.trace("Neither XML 'id' nor 'name' specified - " +
                                 "using generated bean name [" + beanName + "]");
                }
            }
            catch (Exception ex) {
                error(ex.getMessage(), ele);
                return null;
            }
        }
        String[] aliasesArray = StringUtils.toStringArray(aliases);
        return new BeanDefinitionHolder(beanDefinition, beanName, aliasesArray);
    }

    return null;
}
```

以上就是对默认标签解析的全过程，当然对 Spring 解析是逐步深入的，现在只能看到对属性 id 以及 name 的解析，当开始在对属性展开全面解析前，Spring 在外层又做了一个当前层的功能架构，在当前层完成的主要工作包括 如下内容：

（1）提取元素中的 id 以及 name 属性；

（2）进一步解析其他所有属性并统一封装到 `GenericBeanDefinition` 类型的实例中；

（3）如果检测到 bean 没有设置 beanName，那么使用默认规则为此 Bean 生成 beanName；

（4）将获取到的信息封装到 `BeanDefinitionHolder` 中。

进一步看看第二步中对其他属性的解析过程：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate
    
@Nullable
public AbstractBeanDefinition parseBeanDefinitionElement(
    Element ele, String beanName, @Nullable BeanDefinition containingBean) {

    this.parseState.push(new BeanEntry(beanName));

    // 解析 class 属性
    String className = null;
    if (ele.hasAttribute(CLASS_ATTRIBUTE)) {
        className = ele.getAttribute(CLASS_ATTRIBUTE).trim();
    }
    // 解析 parent 属性
    String parent = null;
    if (ele.hasAttribute(PARENT_ATTRIBUTE)) {
        parent = ele.getAttribute(PARENT_ATTRIBUTE);
    }

    try {
        // 创建用于承载属性的 AbstractBeanDefinition 类型的 GenericBeanDefinition 实例
        AbstractBeanDefinition bd = createBeanDefinition(className, parent);

        // 硬编码解析默认 bean 的各种属性
        parseBeanDefinitionAttributes(ele, beanName, containingBean, bd);
        bd.setDescription(DomUtils.getChildElementValueByTagName(ele, DESCRIPTION_ELEMENT));

        // 解析元数据
        parseMetaElements(ele, bd);
        // 解析 lookup-method 属性
        parseLookupOverrideSubElements(ele, bd.getMethodOverrides());
        // 解析 replaced-method 属性
        parseReplacedMethodSubElements(ele, bd.getMethodOverrides());

        // 解析构造函数参数
        parseConstructorArgElements(ele, bd);
        // 解析 property 子元素
        parsePropertyElements(ele, bd);
        // 解析 qualifier 属性
        parseQualifierElements(ele, bd);

        bd.setResource(this.readerContext.getResource());
        bd.setSource(extractSource(ele));

        return bd;
    }
    catch (ClassNotFoundException ex) {
        error("Bean class [" + className + "] not found", ele, ex);
    }
    catch (NoClassDefFoundError err) {
        error("Class that bean class [" + className + "] depends on not found", ele, err);
    }
    catch (Throwable ex) {
        error("Unexpected failure during bean definition parsing", ele, ex);
    }
    finally {
        this.parseState.pop();
    }

    return null;
}
```

到此，已经看到了 bean 的所有常用的和不常用的属性解析，接下来看看其中一些比较复杂标签的解析。

### （1） 属性承载的 BeanDefinition

`BeanDefinition` 是一个接口，在 Spring 中存在三种实现：`RootBeanDefinition`、`ChildBeanDefinition` 以及 `GenericBeanDefinition`。三种实现均继承自 `AbstractBeanDefinition`，其中`BeanDefinition` 是配置文件 `<bean>` 元素标签在容器中的内部表示形式。`<bean>` 元素标签拥有 class、scope、lazy-init 等配置属性，`BeanDefinition` 则提供了相应的 beanClass、scope、lazyInit 属性，`BeanDefinition` 和 `<bean>` 中的属性是一一对应的。

其中 `RootBeanDefinition` 是最常用的实现类，它对应一般性的 `<bean>` 元素标签，`GenericBeanDefinition` 是自 2.5 版本以后新加入的 bean 文件配置属性定义类，是一站式服务类。

在配置文件中可以定义父 `<bean>` 和子 `<bean>`，父 `<bean>` 用 `RootBeanDefinition` 表示，而子 `<bean>` 用 `ChildBeanDefinition` 表示，如果没有父 `<bean>` 和 子 `<bean>` 就使用 `RootBeanDefinition` 表示，`AbstractBeanDefinition` 对两者共同的类信息进行抽象。

Spring 通过 `BeanDefinition` 将配置文件中的 `<bean>` 配置信息转换为容器的内部表示，并将这些`BeanDefinition` 注册到 `BeanDefinitionRegistry` 中。Spring 容器的 `BeanDefinitionRegistry` 就像是 Spring 配置信息的内存数据库，主要是以 map 的形式保存，后续操作直接从 `BeanDefinitionRegistry` 中读取配置信息，它们的关系图如下所示：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220316094400.png)

由此可知，要解析属性首先需要创建承载属性的 `BeanDefinition` 实例，对于普通的 `<bean` 标签，则需要创建 `GenericBeanDefinition`，这也是前面的 `createBeanDefinition` 方法所做的事情：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

protected AbstractBeanDefinition createBeanDefinition(@Nullable String className, @Nullable String parentName)
    throws ClassNotFoundException {

    return BeanDefinitionReaderUtils.createBeanDefinition(
        parentName, className, this.readerContext.getBeanClassLoader());
}

// org.springframework.beans.factory.support.BeanDefinitionReaderUtils

public static AbstractBeanDefinition createBeanDefinition(
    @Nullable String parentName, @Nullable String className, @Nullable ClassLoader classLoader) throws ClassNotFoundException {

    GenericBeanDefinition bd = new GenericBeanDefinition();
    // parentName 可能为空
    bd.setParentName(parentName);
    if (className != null) {
        if (classLoader != null) {
            // 如果 classLoader 不为空，则使用该类加载器获取 bean Class 对象
            bd.setBeanClass(ClassUtils.forName(className, classLoader));
        }
        else {
            // 否则仅仅记录 className
            bd.setBeanClassName(className);
        }
    }
    return bd;
}
```



### （2） 解析各种属性

创建了 bean 信息的承载实例后，便可以进行 bean 信息的各种属性解析了，首先看 `parseBeanDefinitionAttributes` 方法，该方法是对 element 所有元素属性进行解析：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

public AbstractBeanDefinition parseBeanDefinitionAttributes(Element ele, String beanName,
                                                            @Nullable BeanDefinition containingBean, AbstractBeanDefinition bd) {

    if (ele.hasAttribute(SINGLETON_ATTRIBUTE)) {
        // 注意 singleton 属性现在已经不用了，替代方案是在 scope 中声明，且默认就是 singleton
        error("Old 1.x 'singleton' attribute in use - upgrade to 'scope' declaration", ele);
    }
    // 解析 scope 属性
    else if (ele.hasAttribute(SCOPE_ATTRIBUTE)) {
        bd.setScope(ele.getAttribute(SCOPE_ATTRIBUTE));
    }
    else if (containingBean != null) {
        // Take default from containing bean in case of an inner bean definition.
        // 在嵌入 beanDifinition 且没有单独指定 scope 属性的情况下，使用父类默认的属性
        bd.setScope(containingBean.getScope());
    }
	
  	// 解析 abstract 属性
    if (ele.hasAttribute(ABSTRACT_ATTRIBUTE)) {
        bd.setAbstract(TRUE_VALUE.equals(ele.getAttribute(ABSTRACT_ATTRIBUTE)));
    }

    // 解析 lazy-init 属性
    String lazyInit = ele.getAttribute(LAZY_INIT_ATTRIBUTE);
    if (isDefaultValue(lazyInit)) {
        lazyInit = this.defaults.getLazyInit();
    }
    // 如果没有设置 lazy-init 属性或者设置为其他字符，都会置为 false
    bd.setLazyInit(TRUE_VALUE.equals(lazyInit));

    // 解析 autowire 属性
    String autowire = ele.getAttribute(AUTOWIRE_ATTRIBUTE);
    bd.setAutowireMode(getAutowireMode(autowire));

    // 解析 depend-on 属性
    if (ele.hasAttribute(DEPENDS_ON_ATTRIBUTE)) {
        String dependsOn = ele.getAttribute(DEPENDS_ON_ATTRIBUTE);
        bd.setDependsOn(StringUtils.tokenizeToStringArray(dependsOn, MULTI_VALUE_ATTRIBUTE_DELIMITERS));
    }
	
    // 解析 autowire-candidate 属性
    String autowireCandidate = ele.getAttribute(AUTOWIRE_CANDIDATE_ATTRIBUTE);
    if (isDefaultValue(autowireCandidate)) {
        String candidatePattern = this.defaults.getAutowireCandidates();
        if (candidatePattern != null) {
            String[] patterns = StringUtils.commaDelimitedListToStringArray(candidatePattern);
            bd.setAutowireCandidate(PatternMatchUtils.simpleMatch(patterns, beanName));
        }
    }
    else {
        bd.setAutowireCandidate(TRUE_VALUE.equals(autowireCandidate));
    }

    // 解析 primary 属性
    if (ele.hasAttribute(PRIMARY_ATTRIBUTE)) {
        bd.setPrimary(TRUE_VALUE.equals(ele.getAttribute(PRIMARY_ATTRIBUTE)));
    }

    if (ele.hasAttribute(INIT_METHOD_ATTRIBUTE)) {
        String initMethodName = ele.getAttribute(INIT_METHOD_ATTRIBUTE);
        bd.setInitMethodName(initMethodName);
    }
    // 解析 init-method 属性
    else if (this.defaults.getInitMethod() != null) {
        bd.setInitMethodName(this.defaults.getInitMethod());
        bd.setEnforceInitMethod(false);
    }
	
    // 解析 destroy-method 属性 
    if (ele.hasAttribute(DESTROY_METHOD_ATTRIBUTE)) {
        String destroyMethodName = ele.getAttribute(DESTROY_METHOD_ATTRIBUTE);
        bd.setDestroyMethodName(destroyMethodName);
    }
    else if (this.defaults.getDestroyMethod() != null) {
        bd.setDestroyMethodName(this.defaults.getDestroyMethod());
        bd.setEnforceDestroyMethod(false);
    }
	
    // 解析 factory-method 方法
    if (ele.hasAttribute(FACTORY_METHOD_ATTRIBUTE)) {
        bd.setFactoryMethodName(ele.getAttribute(FACTORY_METHOD_ATTRIBUTE));
    }
    // 解析 factory-bean 属性
    if (ele.hasAttribute(FACTORY_BEAN_ATTRIBUTE)) {
        bd.setFactoryBeanName(ele.getAttribute(FACTORY_BEAN_ATTRIBUTE));
    }

    return bd;
}
```

这个方法中包含了 Spring 对所有 bean 属性的解析。

### （3） 解析子元素 meta

先回顾一下元数据 meta 属性的使用：

```xml
<bean id="myBean" class="bean.MyBean">
	<meta key="testStr" value="test...test" />
</bean>
```

这段代码并不会体现在 `MyBean` 类的属性中，而是一个额外的声明，当需要使用里面的信息的时候可以通过 `BeanDefinition` 的 `getAttribute(key)` 方法进行获取。

对 meta 属性的解析代码如下：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

public void parseMetaElements(Element ele, BeanMetadataAttributeAccessor attributeAccessor) {
    // 获取当前节点的所有子元素
    NodeList nl = ele.getChildNodes();
    for (int i = 0; i < nl.getLength(); i++) {
        Node node = nl.item(i);
        // 提取 meta
        if (isCandidateElement(node) && nodeNameEquals(node, META_ELEMENT)) {
            Element metaElement = (Element) node;
            String key = metaElement.getAttribute(KEY_ATTRIBUTE);
            String value = metaElement.getAttribute(VALUE_ATTRIBUTE);
            // 使用 key、value 构造 BeanMetadataAttribute
            BeanMetadataAttribute attribute = new BeanMetadataAttribute(key, value);
            attribute.setSource(extractSource(metaElement));
            // 记录信息
            attributeAccessor.addMetadataAttribute(attribute);
        }
    }
}
```

### （4） 解析子元素 lookup-method

同样，子元素 lookup-method 似乎并不是很常用，但是在某些时候它的确是非常有用的属性，通常我们称它为获取器注入。引用 《Spring in Action》 中的一句话：获取器注入是一种特殊的方法注入，它是把一个方法声明为返回类型的 bean，但实际要返回的 bean 是在配置文件里面配置的，此方法可用在设计有些可插拔的功能上，接触程序依赖。

下面看看具体的应用：

定义父类：

```java
public class User {
    
    public void showMe() {
        System.out.println("I'm user.");
    }
}
```

定义子类：

```java
public class Teacher extends User {

    @Override
    public void showMe() {
        System.out.println("I'm teacher.");
    }
}
```

定义抽象类并设置特殊的获取方法：

```java
public abstract class GetBeanTest {
    
    public void showMe() {
        this.getBean().showMe();
    }
    
    public abstract User getBean();
}
```

测试：

```java
public class Main {
    public static void main(String[] args) {

        ApplicationContext context = new ClassPathXmlApplicationContext("spring-lookup.xml");
        
        GetBeanTest test = (GetBeanTest) context.getBean("getBeanTest");
        
        test.showMe();
    }
}
```

到这里，除了配置文件外，整个测试方法就完成了，注意测试方法调用的是抽象类的方法，但其内部又调用了抽象方法，而且该抽象类还没有子类，那么为什么还可以成功调用呢？重点就在于 xml 文件的配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
       http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="getBeanTest" class="io.github.naivekyo.bean.lookup.GetBeanTest">
        <lookup-method name="getBean" bean="teacher" />
    </bean>
    
    <bean id="teacher" class="io.github.naivekyo.bean.lookup.Teacher" />
    
</beans>
```

在配置文件中，我们看到源码解析中提到的 lookup-method 子元素，这个配置完成的功能是动态地将 teacher 所代表的 bean 作为 getBean 方法的返回值。

如果出现了业务变更或者在其他情况下，teacher 里面的业务逻辑已经不再符合我们的业务要求，需要进行替换该怎么办？这时就需要增加新的逻辑类：

```java
public class Student extends User {

    @Override
    public void showMe() {
        System.out.println("I'm student.");
    }
}
```

同时修改配置文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
       http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="getBeanTest" class="io.github.naivekyo.bean.lookup.GetBeanTest">
        <lookup-method name="getBean" bean="student" />
    </bean>

    <bean id="teacher" class="io.github.naivekyo.bean.lookup.Teacher" />
    <bean id="student" class="io.github.naivekyo.bean.lookup.Student" />
    
</beans>
```

再次运行测试类，就会看到不同的结果。

初步了解了 `lookup-method` 的大致功能后，再去看它的解析方法：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

public void parseLookupOverrideSubElements(Element beanEle, MethodOverrides overrides) {
    // 获取所有子元素
    NodeList nl = beanEle.getChildNodes();
    for (int i = 0; i < nl.getLength(); i++) {
        // 遍历所有子元素，找到默认 bean 配置下的 lookup-method 元素节点
        Node node = nl.item(i);
        if (isCandidateElement(node) && nodeNameEquals(node, LOOKUP_METHOD_ELEMENT)) {
            Element ele = (Element) node;
            // 获取要修饰的方法
            String methodName = ele.getAttribute(NAME_ATTRIBUTE);
            // 获取配置返回的 bean
            String beanRef = ele.getAttribute(BEAN_ELEMENT);
            LookupOverride override = new LookupOverride(methodName, beanRef);
            override.setSource(extractSource(ele));
            overrides.addOverride(override);
        }
    }
}
```

可以看到解析 lookup-method 和解析 meta 元素的过程都差不多。

### （5） 解析子元素 replaced-method

首先看看 replaced-method 的用法。

方法替换：可以在运行时用新的方法替换现有的方法。与之前的 lookup-method 不同的是，replaced-method 不但可以动态地替换返回实体 bean，而且还能动态地更改原有方法的逻辑。

（1）在 changMe 中完成某个业务

```java
public class TestChangeMethod {
    
    public void changeMe() {
        System.out.println("changeMe!");
    }
}
```

（2）运营一段时间后需要改变原有的业务逻辑

```java
public class TestMethodReplacer implements MethodReplacer {
    
    @Override
    public Object reimplement(Object obj, Method method, Object[] args) throws Throwable {
        System.out.println("替换了原有的方法!");
        return null;
    }
    
}
```

注意这里实现的是 Spring 提供的接口：`org.springframework.beans.factory.support.MethodReplacer`

（3）使替换后的类生效

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
       http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="testChangeMethod" class="io.github.naivekyo.bean.replace.TestChangeMethod">
        <replaced-method name="changeMe" replacer="replacer" />
    </bean>
    
    <bean id="replacer" class="io.github.naivekyo.bean.replace.TestMethodReplacer" />
        
</beans>
```

（4）测试

```java
public class TestMain {

    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("spring-replace.xml");
        
        TestChangeMethod test = (TestChangeMethod) context.getBean("testChangeMethod");
        
        test.changeMe();
    }
}
```

这样就做到了动态替换原有方法的效果，知道了它的用法，接下来看看它的解析过程：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

public void parseReplacedMethodSubElements(Element beanEle, MethodOverrides overrides) {
    NodeList nl = beanEle.getChildNodes();
    for (int i = 0; i < nl.getLength(); i++) {
        Node node = nl.item(i);
        // 仅当在 Spring 默认 bean 的子元素下且为 replaced-method 时有效
        if (isCandidateElement(node) && nodeNameEquals(node, REPLACED_METHOD_ELEMENT)) {
            Element replacedMethodEle = (Element) node;
            // 提取要替换的旧方法
            String name = replacedMethodEle.getAttribute(NAME_ATTRIBUTE);
            // 提取对应的新的替换方法
            String callback = replacedMethodEle.getAttribute(REPLACER_ATTRIBUTE);
            ReplaceOverride replaceOverride = new ReplaceOverride(name, callback);
            // Look for arg-type match elements.
            List<Element> argTypeEles = DomUtils.getChildElementsByTagName(replacedMethodEle, ARG_TYPE_ELEMENT);
            for (Element argTypeEle : argTypeEles) {
                // 记录参数
                String match = argTypeEle.getAttribute(ARG_TYPE_MATCH_ATTRIBUTE);
                match = (StringUtils.hasText(match) ? match : DomUtils.getTextValue(argTypeEle));
                if (StringUtils.hasText(match)) {
                    replaceOverride.addTypeIdentifier(match);
                }
            }
            replaceOverride.setSource(extractSource(replacedMethodEle));
            overrides.addOverride(replaceOverride);
        }
    }
}
```

可以看到无论是 lookup-method 还是 replaced-method 都是构造了一个 `MethodOverride`，并最终记录在了 `AbstractBeanDefinition` 中的 `methodOverrides` 属性中。之后再介绍这个属性的用法。

### （6） 解析子元素 constructor-arg

对构造函数的解析是非常有用的，同时也是非常复杂的，举个例子：

```xml
......
<beans>
	<!-- 默认的情况下是按照参数的顺序注入，当指定 index 索引后及可以改变注入参数的顺序 -->
    <bean id="helloBean" class="io.github.naivekyo.HelloBean">
    	<constructor-arg index="0">
        	<value>Naivekyo</value>
        </constructor-arg>
        <constructor-arg index="1">
        	<value>Hello</value>
        </constructor-arg>
    </bean>
    ......
</beans>
```

上面的配置非常简单，首先为 HelloBean 自动寻找对应的构造函数，并在初始化的时候将设置的参数传入进去，下面看看具体的解析过程：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

public void parseConstructorArgElements(Element beanEle, BeanDefinition bd) {
    NodeList nl = beanEle.getChildNodes();
    for (int i = 0; i < nl.getLength(); i++) {
        Node node = nl.item(i);
        if (isCandidateElement(node) && nodeNameEquals(node, CONSTRUCTOR_ARG_ELEMENT)) {
            // 解析 constructor-arg
            parseConstructorArgElement((Element) node, bd);
        }
    }
}
```

结构很简单，遍历所有子元素并提取 constructor-arg 元素，然后进行解析，只不过具体的解析工作交给了另一个函数 `parseConstructorArgElement` 具体代码如下：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

public void parseConstructorArgElement(Element ele, BeanDefinition bd) {
    // 提取 index 属性
    String indexAttr = ele.getAttribute(INDEX_ATTRIBUTE);
    // 提取 type 属性
    String typeAttr = ele.getAttribute(TYPE_ATTRIBUTE);
    // 提取 name 属性
    String nameAttr = ele.getAttribute(NAME_ATTRIBUTE);
    if (StringUtils.hasLength(indexAttr)) {
        try {
            int index = Integer.parseInt(indexAttr);
            if (index < 0) {
                error("'index' cannot be lower than 0", ele);
            }
            else {
                try {
                    this.parseState.push(new ConstructorArgumentEntry(index));
                    // 解析 ele 对应的属性元素
                    Object value = parsePropertyValue(ele, bd, null);
                    ConstructorArgumentValues.ValueHolder valueHolder = new ConstructorArgumentValues.ValueHolder(value);
                    if (StringUtils.hasLength(typeAttr)) {
                        valueHolder.setType(typeAttr);
                    }
                    if (StringUtils.hasLength(nameAttr)) {
                        valueHolder.setName(nameAttr);
                    }
                    valueHolder.setSource(extractSource(ele));
                    // 不允许重复指定相同参数
                    if (bd.getConstructorArgumentValues().hasIndexedArgumentValue(index)) {
                        error("Ambiguous constructor-arg entries for index " + index, ele);
                    }
                    else {
                        bd.getConstructorArgumentValues().addIndexedArgumentValue(index, valueHolder);
                    }
                }
                finally {
                    this.parseState.pop();
                }
            }
        }
        catch (NumberFormatException ex) {
            error("Attribute 'index' of tag 'constructor-arg' must be an integer", ele);
        }
    }
    else {
        // 没有 index 属性则忽略该属性，自动寻找
        try {
            this.parseState.push(new ConstructorArgumentEntry());
            Object value = parsePropertyValue(ele, bd, null);
            ConstructorArgumentValues.ValueHolder valueHolder = new ConstructorArgumentValues.ValueHolder(value);
            if (StringUtils.hasLength(typeAttr)) {
                valueHolder.setType(typeAttr);
            }
            if (StringUtils.hasLength(nameAttr)) {
                valueHolder.setName(nameAttr);
            }
            valueHolder.setSource(extractSource(ele));
            bd.getConstructorArgumentValues().addGenericArgumentValue(valueHolder);
        }
        finally {
            this.parseState.pop();
        }
    }
}
```

上面的代码很多但是逻辑并不复杂，先提取 constructor-arg 的三个必要的属性（index、type、name）：

- 如果配置中指定了 index 属性，那么操作步骤如下：
  1. 解析 `constructor-arg` 的子元素；
  2. 使用 `ConstructorArgumentValues.ValueHolder` 类型来封装解析出来的元素；
  3. 将 type、name 和 index 属性一并封装在 `ConstructorArgumentValues.ValueHolder` 类型中并添加至当前 `BeanDefinition` 的 `constructorArgumentValues` 的 `indexedArgumentValues` 属性中。
- 如果没有指定 index 属性，那么操作步骤如下：
  1. 解析 `constructor-arg` 的子元素；
  2. 使用 `ConstructorArgumentValues.ValueHolder` 类型来封装解析出来的元素；
  3. 将 type、name 和 index 属性一并封装在 `ConstructorArgumentValues.ValueHolder` 类型中并添加至当前 `BeanDefinition` 的 `constructorArgumentValues` 的 `genericArgumentValues` 属性中。

可以看到，对于是否指定 index 属性的情况，Spring 的处理也不相同，主要在于属性信息保存的位置。

了解了整个流程后，再看看解析构造函数配置中子元素的过程，进入 `parsePropertyValue` 方法：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

@Nullable
public Object parsePropertyValue(Element ele, BeanDefinition bd, @Nullable String propertyName) {
    String elementName = (propertyName != null ?
                          "<property> element for property '" + propertyName + "'" :
                          "<constructor-arg> element");
	
    // 一个属性只能对应一种类型: ref、value、list 等等
    // Should only have one child element: ref, value, list, etc.
    NodeList nl = ele.getChildNodes();
    Element subElement = null;
    for (int i = 0; i < nl.getLength(); i++) {
        Node node = nl.item(i);
        // 不处理 description 和 meta
        if (node instanceof Element && !nodeNameEquals(node, DESCRIPTION_ELEMENT) &&
            !nodeNameEquals(node, META_ELEMENT)) {
            // Child element is what we're looking for.
            if (subElement != null) {
                error(elementName + " must not contain more than one sub-element", ele);
            }
            else {
                subElement = (Element) node;
            }
        }
    }

    // 解析 constructor-arg 的 ref 属性
    boolean hasRefAttribute = ele.hasAttribute(REF_ATTRIBUTE);
    // 解析 constructor-arg 的 value 属性
    boolean hasValueAttribute = ele.hasAttribute(VALUE_ATTRIBUTE);
    if ((hasRefAttribute && hasValueAttribute) ||
        ((hasRefAttribute || hasValueAttribute) && subElement != null)) {
        /*
         * 在 constructor-arg 上不存在:
         *	1. 同时既有 ref 又有 value 属性
         * 	2. 存在 ref 属性或者 value 属性且又有子元素
         */
        error(elementName +
              " is only allowed to contain either 'ref' attribute OR 'value' attribute OR sub-element", ele);
    }

    if (hasRefAttribute) {
        // ref 属性的处理，使用 RuntimeBeanReference 封装对应的 ref 名称
        String refName = ele.getAttribute(REF_ATTRIBUTE);
        if (!StringUtils.hasText(refName)) {
            error(elementName + " contains empty 'ref' attribute", ele);
        }
        RuntimeBeanReference ref = new RuntimeBeanReference(refName);
        ref.setSource(extractSource(ele));
        return ref;
    }
    else if (hasValueAttribute) {
        // value 属性的处理，使用 TypedStringValue 封装
        TypedStringValue valueHolder = new TypedStringValue(ele.getAttribute(VALUE_ATTRIBUTE));
        valueHolder.setSource(extractSource(ele));
        return valueHolder;
    }
    else if (subElement != null) {
        // 解析子元素
        return parsePropertySubElement(subElement, bd);
    }
    else {
        // 如果既没有子元素也没有 ref 或 value 属性，Spring 无法处理
        // Neither child element nor "ref" or "value" attribute found.
        error(elementName + " must specify a ref or value", ele);
        return null;
    }
}
```

从代码上看，对构造函数中属性元素的解析，经历了以下几个过程：

（1）略过 description 或者 meta；

（2）提取 constructor-arg 上的 ref 和 value 属性，以便于根据规则验证正确性，其规则为在 constructor-arg 上不存在以下情况：

- 同时既有 ref 属性又有 value 属性；
- 存在 ref 属性或者 value 属性且又有子元素。

（3）ref 属性的处理：使用 RuntimeBeanReference 封装对应的 ref 名称，如 `<constructor-arg ref="a" >`；

（4）value 属性的处理：使用 TypedStringValue 封装，如 `<constructor-arg value="a" >`；

（5）子元素的处理，如：

```xml
<constructor-arg>
	<map>
    	<entry key="key" value="value" />
    </map>
</constructor-arg>
```

而对于子元素的处理，例如这里提到的在构造函数中又嵌入了子元素 map，Spring 通过 `parsePropertySubElement` 方法中实现了对各种子元素的分类处理：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

@Nullable
public Object parsePropertySubElement(Element ele, @Nullable BeanDefinition bd) {
    return parsePropertySubElement(ele, bd, null);
}

@Nullable
public Object parsePropertySubElement(Element ele, @Nullable BeanDefinition bd, @Nullable String defaultValueType) {
    if (!isDefaultNamespace(ele)) {
        return parseNestedCustomElement(ele, bd);
    }
    else if (nodeNameEquals(ele, BEAN_ELEMENT)) {
        BeanDefinitionHolder nestedBd = parseBeanDefinitionElement(ele, bd);
        if (nestedBd != null) {
            nestedBd = decorateBeanDefinitionIfRequired(ele, nestedBd, bd);
        }
        return nestedBd;
    }
    else if (nodeNameEquals(ele, REF_ELEMENT)) {
        // A generic reference to any name of any bean.
        String refName = ele.getAttribute(BEAN_REF_ATTRIBUTE);
        boolean toParent = false;
        if (!StringUtils.hasLength(refName)) {
            // A reference to the id of another bean in a parent context.
            // 解析 parent
            refName = ele.getAttribute(PARENT_REF_ATTRIBUTE);
            toParent = true;
            if (!StringUtils.hasLength(refName)) {
                error("'bean' or 'parent' is required for <ref> element", ele);
                return null;
            }
        }
        if (!StringUtils.hasText(refName)) {
            error("<ref> element contains empty target attribute", ele);
            return null;
        }
        RuntimeBeanReference ref = new RuntimeBeanReference(refName, toParent);
        ref.setSource(extractSource(ele));
        return ref;
    }
    // 解析 idref 属性
    else if (nodeNameEquals(ele, IDREF_ELEMENT)) {
        return parseIdRefElement(ele);
    }
    // 解析 value 子元素
    else if (nodeNameEquals(ele, VALUE_ELEMENT)) {
        return parseValueElement(ele, defaultValueType);
    }
    // 解析 null 子元素
    else if (nodeNameEquals(ele, NULL_ELEMENT)) {
        // It's a distinguished null value. Let's wrap it in a TypedStringValue
        // object in order to preserve the source location.
        TypedStringValue nullHolder = new TypedStringValue(null);
        nullHolder.setSource(extractSource(ele));
        return nullHolder;
    }
    // 解析 array 子元素
    else if (nodeNameEquals(ele, ARRAY_ELEMENT)) {
        return parseArrayElement(ele, bd);
    }
    // 解析 list 子元素
    else if (nodeNameEquals(ele, LIST_ELEMENT)) {
        return parseListElement(ele, bd);
    }
    // 解析 set 子元素
    else if (nodeNameEquals(ele, SET_ELEMENT)) {
        return parseSetElement(ele, bd);
    }
   	// 解析 map 子元素
    else if (nodeNameEquals(ele, MAP_ELEMENT)) {
        return parseMapElement(ele, bd);
    }
    // 解析 props 子元素
    else if (nodeNameEquals(ele, PROPS_ELEMENT)) {
        return parsePropsElement(ele);
    }
    else {
        error("Unknown property sub-element: [" + ele.getNodeName() + "]", ele);
        return null;
    }
}
```

可以看到，上面的函数中实现了所有可支持的子元素的分类处理，到这里，我们已经大致理清了构造函数的解析流程。

### （7） 解析子元素 property

`parsePropertyElements` 函数完成了对 `property` 属性的提取，使用方法如下：

```xml
<bean id="test" class="io.github.naivekyo.TestClass">
	<property name="testStr" value="aaa" />
</bean>

<!-- 或者这样 -->
<bean id="a">
	<property name="p">
    	<list>
        	<value>aa</value>
        	<value>bb</value>
        </list>
    </property>
</bean>
```

具体的解析流程如下：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

public void parsePropertyElements(Element beanEle, BeanDefinition bd) {
    NodeList nl = beanEle.getChildNodes();
    for (int i = 0; i < nl.getLength(); i++) {
        Node node = nl.item(i);
        if (isCandidateElement(node) && nodeNameEquals(node, PROPERTY_ELEMENT)) {
            parsePropertyElement((Element) node, bd);
        }
    }
}
```

和之前的类似，先找到 String 默认 bean 的所有 property 子元素，然后交给另一个函数解析：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

public void parsePropertyElement(Element ele, BeanDefinition bd) {
    // 获取 property 元素的 name 属性的值
    String propertyName = ele.getAttribute(NAME_ATTRIBUTE);
    if (!StringUtils.hasLength(propertyName)) {
        error("Tag 'property' must have a 'name' attribute", ele);
        return;
    }
    this.parseState.push(new PropertyEntry(propertyName));
    try {
        // 不允许多次对同一属性进行配置
        if (bd.getPropertyValues().contains(propertyName)) {
            error("Multiple 'property' definitions for property '" + propertyName + "'", ele);
            return;
        }
        // 解析 property 的 value 的值，并使用 PropertyValue 封装
        Object val = parsePropertyValue(ele, bd, propertyName);
        PropertyValue pv = new PropertyValue(propertyName, val);
        parseMetaElements(ele, pv);
        pv.setSource(extractSource(ele));
        // 存放在 BeanDefinition 的 propertyValues 属性中
        bd.getPropertyValues().addPropertyValue(pv);
    }
    finally {
        this.parseState.pop();
    }
}
```

### （8） 解析子元素 qualifier

对于 qualifier 元素的获取，我们接触更多的是注解的形式，在使用 Spring 框架中进行自动注入时，Spring 容器中匹配的候选 Bean 数目有且仅有一个。当找不到一个匹配的 Bean 时，Spring 容器将抛出 `BeanCreationException` 异常，并指出必须至少拥有一个匹配的 Bean。

Spring 允许我们通过 Qualifier 指定注入的 Bean 的名称，这样歧义就消失了，配置方式如下：

```xml
<bean id="testBean" class="io.github.naivekyo.TestBean">
	<qualifier type="org.Springframework.beans.factory.annotation.Qualifier" value="qf" />
</bean>
```

解析方法如下：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

public void parseQualifierElements(Element beanEle, AbstractBeanDefinition bd) {
    NodeList nl = beanEle.getChildNodes();
    for (int i = 0; i < nl.getLength(); i++) {
        Node node = nl.item(i);
        if (isCandidateElement(node) && nodeNameEquals(node, QUALIFIER_ELEMENT)) {
            parseQualifierElement((Element) node, bd);
        }
    }
}
```

先找到所有 qualifier 元素，然后交给另一个方法处理：

```java
// // org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

public void parseQualifierElement(Element ele, AbstractBeanDefinition bd) {
    // 获得 qualifier 元素的 type 属性的值
    String typeName = ele.getAttribute(TYPE_ATTRIBUTE);
    if (!StringUtils.hasLength(typeName)) {
        error("Tag 'qualifier' must have a 'type' attribute", ele);
        return;
    }
    this.parseState.push(new QualifierEntry(typeName));
    try {
        // 将 qualifier 封装到 AutowireCandidateQualifier 中
        AutowireCandidateQualifier qualifier = new AutowireCandidateQualifier(typeName);
        qualifier.setSource(extractSource(ele));
        // 获取 qualifier 元素的 value 属性的值
        String value = ele.getAttribute(VALUE_ATTRIBUTE);
        if (StringUtils.hasLength(value)) {
            qualifier.setAttribute(AutowireCandidateQualifier.VALUE_KEY, value);
        }
        NodeList nl = ele.getChildNodes();
        for (int i = 0; i < nl.getLength(); i++) {
            Node node = nl.item(i);
            if (isCandidateElement(node) && nodeNameEquals(node, QUALIFIER_ATTRIBUTE_ELEMENT)) {
                Element attributeEle = (Element) node;
                // 通过 key、value 形式封装 qualifier 的属性
                String attributeName = attributeEle.getAttribute(KEY_ATTRIBUTE);
                String attributeValue = attributeEle.getAttribute(VALUE_ATTRIBUTE);
                if (StringUtils.hasLength(attributeName) && StringUtils.hasLength(attributeValue)) {
                    BeanMetadataAttribute attribute = new BeanMetadataAttribute(attributeName, attributeValue);
                    attribute.setSource(extractSource(attributeEle));
                    qualifier.addMetadataAttribute(attribute);
                }
                else {
                    error("Qualifier 'attribute' tag must have a 'name' and 'value'", attributeEle);
                    return;
                }
            }
        }
        // 将 qualifier 封装到 BeanDefinition 中
        bd.addQualifier(qualifier);
    }
    finally {
        this.parseState.pop();
    }
}
```

## 2、AbstractBeanDefinition 属性

至此我们便完成了 XML 文档到 `GenericBeanDefinition` 的转换，也就是说到这里，XML 中所有的配置都可以在 `GenericBeanDefinition` 的实例类中找到对于的配置。

`GenericBeanDefinition` 只是子类实现，而大部分的通用属性都保存在了 `AbstractBeanDefinition` 中，下面看一看具体的配置：

```java
public abstract class AbstractBeanDefinition extends BeanMetadataAttributeAccessor
		implements BeanDefinition, Cloneable {

	// 省略静态遍历以及 final 常量

    // bean 的 class 对象
	@Nullable
	private volatile Object beanClass;

    // bean 的作用范围，对应 bean 属性 scope
	@Nullable
	private String scope = SCOPE_DEFAULT;

    // 是否是抽象，对应 bean 属性的 abstract
	private boolean abstractFlag = false;

    // 是否延迟加载，对应 bean 属性的 lazy-init
	@Nullable
	private Boolean lazyInit;
	
    // 自动注入模式，对应 bean 属性的 autowire
	private int autowireMode = AUTOWIRE_NO;

    // 依赖检查，Spring3.0 后弃用这个属性
	private int dependencyCheck = DEPENDENCY_CHECK_NONE;

    // 用来表示一个 bean 的实例化依靠另一个 bean 先实例化，对应 bean 属性的 depend-on
	@Nullable
	private String[] dependsOn;
	
    /**
      * autowire-candidate 属性设置为false，这样容器在查找自动装配对象时，将不考虑该 bean，即
      * 它不会被考虑作为其他 bean 自动装配的候选者，但是该 bean 本身还是可以使用自动装配来注入其他
      * bean 的。
      * 对应 bean 属性的 autowire-candidate 
      */
	private boolean autowireCandidate = true;

    // 自动装配时当出现多个 bean 候选者时，将作为首选者，对应 bean 属性的 primary
	private boolean primary = false;

    // 用于记录 Qualifier，对应子元素 qualifier
	private final Map<String, AutowireCandidateQualifier> qualifiers = new LinkedHashMap<>();

	@Nullable
	private Supplier<?> instanceSupplier;

    // 允许访问非公开的构造器和方法，程序设置
	private boolean nonPublicAccessAllowed = true;

    /**
      * 是否以一种宽松的模式解析构造函数，默认为 true
      * 如果为 false，则在如下情况
      * interface ITest {}
      * class ITestImpl implements ITest {}
      * class Main {}
      *		Main(ITest i) {}
      *		Main(ITestImpl i) {}
      * }
      * 抛出异常，因为 Spring 无法准确定位哪个构造函数
      * 由程序设置
      */
	private boolean lenientConstructorResolution = true;

    /**
      * 对应 bean 属性 factory-bean，用法：
      *  <bean id="instanceFactoryBean" class="test.InstanceFactoryBean" />
      *  <bean id="currentTime" factory-bean="instanceFactoryBean" factory-method="createTime" />
      */
	@Nullable
	private String factoryBeanName;

    // 对应 bean 属性的 factory-method
	@Nullable
	private String factoryMethodName;
	
    // 记录构造函数注入属性，对应 bean 属性的 constructor-arg
	@Nullable
	private ConstructorArgumentValues constructorArgumentValues;

    // 普通属性集合
	@Nullable
	private MutablePropertyValues propertyValues;

    // 方法重写的持有者，记录 lookup-method、replaced-method 元素
	private MethodOverrides methodOverrides = new MethodOverrides();

    // 初始化方法，对应 bean 属性 init-method
	@Nullable
	private String initMethodName;

    // 销毁方法，对应 bean 属性的 destroy-method
	@Nullable
	private String destroyMethodName;

    // 是否执行 init-method，程序设置
	private boolean enforceInitMethod = true;

    // 是否执行 destroy-method，程序设置
	private boolean enforceDestroyMethod = true;

    // 是否是用户定义的而不是应用程序本身定义的，创建 AOP 的时候为 true，程序设置
	private boolean synthetic = false;

    /**
      * 定义这个 bean 的应用:
      *  APPLICATION: 用户
      *  INFRASTRUCTURE: 完全内部使用，与用户无关
      *  SUPPORT: 某些复杂配置的一部分
      * 程序设置
      */
	private int role = BeanDefinition.ROLE_APPLICATION;

    // bean 的描述信息
	@Nullable
	private String description;

    // 这里 bean 定义的资源
	@Nullable
	private Resource resource;
    
    // ... 省略 set/get 方法
}
```

## 3、解析默认标签中的自定义标签元素

到这里已经完成了分析默认标签的解析和提取，下面再次回顾默认标签解析函数的起始函数：

```java
// org.springframework.beans.factory.xml.DefaultBeanDefinitionDocumentReader

protected void processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate) {
    BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele);
    if (bdHolder != null) {
        bdHolder = delegate.decorateBeanDefinitionIfRequired(ele, bdHolder);
        try {
            // Register the final decorated instance.
            BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry());
        }
        catch (BeanDefinitionStoreException ex) {
            getReaderContext().error("Failed to register bean definition with name '" +
                                     bdHolder.getBeanName() + "'", ele, ex);
        }
        // Send registration event.
        getReaderContext().fireComponentRegistered(new BeanComponentDefinition(bdHolder));
    }
}
```

前面重点分析了 `BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele)` 这句代码，接下来要进行 `bdHolder = delegate.decorateBeanDefinitionIfRequired(ele, bdHolder)` 代码的分析，从语义上看，这句代码的意思就是如果需要的话就对 BeanDefinition 进行装饰，在配置文件中类似这样：

```xml
<bean id="test" class="test.MyClass">
	<mybean:user username="aaa" />
</bean>
```

当 Spring 中的 bean 使用的是默认的标签配置，但是其中的子元素却使用了自定义的配置时，这句代码变化起作用。

之前讲过，Spring 对 bean 的解析分为两种类型，一种是默认类型的解析，另一种是自定义类型的解析，但是现在两者在一块出现了，看看代码是如何处理的：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

public BeanDefinitionHolder decorateBeanDefinitionIfRequired(Element ele, BeanDefinitionHolder originalDef) {
    return decorateBeanDefinitionIfRequired(ele, originalDef, null);
}
```

这里第三个参数代表的是父类 bean，在对某个嵌套配置进行解析时，这里需要传递父类的 BeanDefinition，主要是为了在子类没有设置 scope 时默认使用父类的 scope 属性，由于这里分析的顶层配置，所以传递参数为 null。

继续跟进：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

public BeanDefinitionHolder decorateBeanDefinitionIfRequired(
    Element ele, BeanDefinitionHolder originalDef, @Nullable BeanDefinition containingBd) {

    BeanDefinitionHolder finalDefinition = originalDef;

    // Decorate based on custom attributes first.
    NamedNodeMap attributes = ele.getAttributes();
    // 遍历所有的属性，看看是否有适用于修饰的属性
    for (int i = 0; i < attributes.getLength(); i++) {
        Node node = attributes.item(i);
        finalDefinition = decorateIfRequired(node, finalDefinition, containingBd);
    }

    // Decorate based on custom nested elements.
    NodeList children = ele.getChildNodes();
    // 遍历所有子节点，看看有没有适用于修饰的子元素
    for (int i = 0; i < children.getLength(); i++) {
        Node node = children.item(i);
        if (node.getNodeType() == Node.ELEMENT_NODE) {
            finalDefinition = decorateIfRequired(node, finalDefinition, containingBd);
        }
    }
    return finalDefinition;
}
```

可以看到上面的代码中对元素的所有属性和子节点进行了 `decorateIfRequired` 函数的调用：

```java
// org.springframework.beans.factory.xml.BeanDefinitionParserDelegate

public BeanDefinitionHolder decorateIfRequired(
    Node node, BeanDefinitionHolder originalDef, @Nullable BeanDefinition containingBd) {

    // 获取自定义标签的命名空间
    String namespaceUri = getNamespaceURI(node);
    // 对于非默认标签进行修饰
    if (namespaceUri != null && !isDefaultNamespace(namespaceUri)) {
        // 更具命名空间找到对应的处理器
        NamespaceHandler handler = this.readerContext.getNamespaceHandlerResolver().resolve(namespaceUri);
        if (handler != null) {
            BeanDefinitionHolder decorated =
                handler.decorate(node, originalDef, new ParserContext(this.readerContext, this, containingBd));
            if (decorated != null) {
                return decorated;
            }
        }
        else if (namespaceUri.startsWith("http://www.springframework.org/schema/")) {
            error("Unable to locate Spring NamespaceHandler for XML schema namespace [" + namespaceUri + "]", node);
        }
        else {
            // A custom namespace, not to be handled by Spring - maybe "xml:...".
            if (logger.isDebugEnabled()) {
                logger.debug("No Spring NamespaceHandler found for XML schema namespace [" + namespaceUri + "]");
            }
        }
    }
    return originalDef;
}
```

分析以下，首先获取属性或者元素的命名空间，以此来判断该元素或属性是否适用于自定义标签的解析条件，找出自定义类型所对应的 `NamespaceHandler` 并进行进一步的解析，后续在分析自定义标签解析时再做详细分析，这里先略过。

总结一下 `decorateBeanDefinitionIfRequired` 方法的作用，在 `decorateBeanDefinitionIfRequired` 中可以看到对于程序默认的标签的处理其实是直接略过的，因为默认的标签之前已经处理过了，这里只对自定义的标签或者说对 bean 的的自定义属性做处理。在该方法中实现了寻找自定义标签寻找命名空间处理器，并进行进一步的解析。

## 4、注册解析的 BeanDefinition

对于配置文件，经过了解析和装饰后，得到的 BeanDefinition 已经可以满足后续的使用要求了，唯一剩下的工作就是注册，也就是 `processBeanDefinition` 函数中的 `BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry())` 这一行代码：

```java
// org.springframework.beans.factory.support.BeanDefinitionReaderUtils

public static void registerBeanDefinition(
    BeanDefinitionHolder definitionHolder, BeanDefinitionRegistry registry)
    throws BeanDefinitionStoreException {

    // Register bean definition under primary name.
    // 使用 beanName 做唯一标识注册
    String beanName = definitionHolder.getBeanName();
    registry.registerBeanDefinition(beanName, definitionHolder.getBeanDefinition());

    // Register aliases for bean name, if any.
    // 注册所有的别名
    String[] aliases = definitionHolder.getAliases();
    if (aliases != null) {
        for (String alias : aliases) {
            registry.registerAlias(beanName, alias);
        }
    }
}
```

从上面的代码可以看出，解析的 beanDefinition 都会注册到 `BeanDefinitionRegistry` 类型的实例 registry 中，而对于 beanDefinition 的注册分成了两部分：

- 通过 beanName 的注册；
- 通过别名的注册。

### （1）通过 beanName 注册 BeanDefinition

对于 beanDefinition 的注册，Sprng 以 beanName 为 key，将 beanDefinition 放入了 map 中，但是除此之外，它还做了其他的事。

```java
// org.springframework.beans.factory.support.DefaultListableBeanFactory

@Override
public void registerBeanDefinition(String beanName, BeanDefinition beanDefinition)
    throws BeanDefinitionStoreException {

    Assert.hasText(beanName, "Bean name must not be empty");
    Assert.notNull(beanDefinition, "BeanDefinition must not be null");

    if (beanDefinition instanceof AbstractBeanDefinition) {
        try {
            /**
              * 注册前的最后一次校验，这里的校验不同于之前的 xml 校验，
              * 主要是对于 AbstractBeanDefinition 属性中的 methodOverrides 校验，
              * 校验 methodOverrides 是否与工厂方法并存或者 methodOverrides 对应的方法根本不存在
              */
            ((AbstractBeanDefinition) beanDefinition).validate();
        }
        catch (BeanDefinitionValidationException ex) {
            throw new BeanDefinitionStoreException(beanDefinition.getResourceDescription(), beanName,
                                                   "Validation of bean definition failed", ex);
        }
    }

    // 注意 beanDefinitionMap 类型是 ConcurrentHashMap 且初始化容量 256，它是线程安全的 map
    // 这里先尝试能否从缓存池中拿到已经注册的 BeanDefifition
    BeanDefinition existingDefinition = this.beanDefinitionMap.get(beanName);
    
    // 如果已经注册过了
    if (existingDefinition != null) {
        // 先检查是否开启了允许覆盖注册
        if (!isAllowBeanDefinitionOverriding()) {
            throw new BeanDefinitionOverrideException(beanName, beanDefinition, existingDefinition);
        }
        else if (existingDefinition.getRole() < beanDefinition.getRole()) {
            // e.g. was ROLE_APPLICATION, now overriding with ROLE_SUPPORT or ROLE_INFRASTRUCTURE
            if (logger.isInfoEnabled()) {
                logger.info("Overriding user-defined bean definition for bean '" + beanName +
                            "' with a framework-generated bean definition: replacing [" +
                            existingDefinition + "] with [" + beanDefinition + "]");
            }
        }
        else if (!beanDefinition.equals(existingDefinition)) {
            if (logger.isDebugEnabled()) {
                logger.debug("Overriding bean definition for bean '" + beanName +
                             "' with a different definition: replacing [" + existingDefinition +
                             "] with [" + beanDefinition + "]");
            }
        }
        else {
            if (logger.isTraceEnabled()) {
                logger.trace("Overriding bean definition for bean '" + beanName +
                             "' with an equivalent definition: replacing [" + existingDefinition +
                             "] with [" + beanDefinition + "]");
            }
        }
        this.beanDefinitionMap.put(beanName, beanDefinition);
    }
    else {
        // 如果缓存池中没有要注册的 beanDefinitino，说明可以注册
        // 开始注册
        if (hasBeanCreationStarted()) {
            // Cannot modify startup-time collection elements anymore (for stable iteration)
            // 这里之所以要进行同步是为了更新 beanDefinitionNames 这个 ArrayList
            synchronized (this.beanDefinitionMap) {
                // 注册 BeanDefinition
                this.beanDefinitionMap.put(beanName, beanDefinition);
                List<String> updatedDefinitions = new ArrayList<>(this.beanDefinitionNames.size() + 1);
                updatedDefinitions.addAll(this.beanDefinitionNames);
                updatedDefinitions.add(beanName);
                this.beanDefinitionNames = updatedDefinitions;
                removeManualSingletonName(beanName);
            }
        }
        else {
            // Still in startup registration phase
            this.beanDefinitionMap.put(beanName, beanDefinition);
            this.beanDefinitionNames.add(beanName);
            removeManualSingletonName(beanName);
        }
        this.frozenBeanDefinitionNames = null;
    }

    if (existingDefinition != null || containsSingleton(beanName)) {
        // 重置 beanName 对应的所有缓存
        resetBeanDefinition(beanName);
    }
    else if (isConfigurationFrozen()) {
        clearByTypeCache();
    }
}
```

从上面的代码可以看出，在对于 bean 的注册处理方式上，主要进行了几个步骤：

（1）对 `AbstractBeanDefinition` 的校验，注意这和之前 XML 的校验不一样，这里是对 AbstractBeanDefinition 的 methodOverrides 属性的；

（2）对 `beanName` 已经注册的情况的处理，如果设置了不允许 bean 的覆盖，则需要抛出异常，否则直接注册；

（3）保存到 map 缓存中；

（4）清除解析之前留下的对应 beanName 的缓存。

### （2）通过别名注册 BeanDefinition

别名设置：

```xml
<bean id="myBean" name="myBean2, myBean3" class="io.github.naivekyo.bean.MyBean"/>
```

这里通过别名注册的操作对象是 `AliasRegistry` 类型的 `XmlBeanFactory` ，但是该方法的实现是在 `SimpleAliasRegistry` 中：

```java
// org.springframework.core.SimpleAliasRegistry

@Override
public void registerAlias(String name, String alias) {
    Assert.hasText(name, "'name' must not be empty");
    Assert.hasText(alias, "'alias' must not be empty");
    // 注意这里的 aliasMap 也是 ConcurrentHashMap 类型的，线程安全的 map
    synchronized (this.aliasMap) {
        // 如果 beanName 与 alias 相同的话不记录 alias 并删除对应的 alias
        if (alias.equals(name)) {
            this.aliasMap.remove(alias);
            if (logger.isDebugEnabled()) {
                logger.debug("Alias definition '" + alias + "' ignored since it points to same name");
            }
        }
        else {
            String registeredName = this.aliasMap.get(alias);
            if (registeredName != null) {
            	// 如果 alias 已经被注册，就不需要重新注册
                if (registeredName.equals(name)) {
                    // An existing alias - no need to re-register
                    return;
                }
                // 如果其他 bean 注册了该别名就需要检查是否开启覆盖设置
                if (!allowAliasOverriding()) {
                    throw new IllegalStateException("Cannot define alias '" + alias + "' for name '" +
                                                    name + "': It is already registered for name '" + registeredName + "'.");
                }
                if (logger.isDebugEnabled()) {
                    logger.debug("Overriding alias '" + alias + "' definition for registered name '" +
                                 registeredName + "' with new target name '" + name + "'");
                }
            }
            // 检查循环别名，即当 A->B 存在时，若再次出现 A->C->B 时候就会抛出异常
            checkForAliasCircle(name, alias);
            // 注册别名
            this.aliasMap.put(alias, name);
            if (logger.isTraceEnabled()) {
                logger.trace("Alias definition '" + alias + "' registered for name '" + name + "'");
            }
        }
    }
}
```

上述代码步骤如下：

（1）alias 与 beanName 相同情况处理：若相同则不需要处理并删除原有 alias；

（2）alias 覆盖处理：若 aliasName 已经使用并已经指向了另一 beanName 则需要用户的设置进行处理；

（3）alias 循环检查：当 A -> B 存在时，若再次出现 A -> C -> B 时会抛出异常；

（4）注册 alias。



## 5、通知监听器发布解析及注册完成的消息

```java
// org.springframework.beans.factory.xml.DefaultBeanDefinitionDocumentReader

protected void processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate) {
    BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele);
    if (bdHolder != null) {
        bdHolder = delegate.decorateBeanDefinitionIfRequired(ele, bdHolder);
        try {
            // Register the final decorated instance.
            BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry());
        }
        catch (BeanDefinitionStoreException ex) {
            getReaderContext().error("Failed to register bean definition with name '" +
                                     bdHolder.getBeanName() + "'", ele, ex);
        }
        // Send registration event.
        getReaderContext().fireComponentRegistered(new BeanComponentDefinition(bdHolder));
    }
}
```

通过代码：`getReaderContext().fireComponentRegistered(new BeanComponentDefinition(bdHolder))` 完成此工作，这里的实现只是方便为了日后的扩展，当程序开发人员需要对注册 `BeanDefinition` 时间进行监听时可以通过注册监听器并将处理逻辑写入监听器的方式进行消息的发布，目前在 Spring 中没有对此事件做任何逻辑处理：

```java
// org.springframework.beans.factory.parsing.EmptyReaderEventListener

@Override
public void componentRegistered(ComponentDefinition componentDefinition) {
    // no-op
}
```

