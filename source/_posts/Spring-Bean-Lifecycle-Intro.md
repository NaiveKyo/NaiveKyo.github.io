---
title: Spring_Bean_Lifecycle_Intro
author: NaiveKyo
hide: false
img: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/9.jpg
coverImg: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/9.jpg
toc: true
date: 2021-07-08 09:11:44
top: true
cover: false
summary: 了解 Spring Bean 的生命周期回调
categories: Spring
keywords:
  - Spring
  - Bean
  - Lifecycle
tags:
  - Spring
  - Lifecycle
---



# Spring 的 Bean 生命周期回调



## 一、IoC 容器简介



<img src="https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/images/spring/IoC.png" style="zoom:67%;" />



从上图可以看出容器是 Spring 框架的核心。Spring 将元数据（xml 文件或 Java Config 配置）注入 POJO 最终产生 Bean 放入容器中供应用使用。



Spring 通过一个配置文件描述 Bean 及 Bena 之间的依赖关系，利用 Java 语言的反射功能实例化 Bean 并建立 Bean 之间的依赖关系。

Spring 的 IoC 容器在完成这些底层工作的基础上，还提供了 Bean 实例缓存、生命周期管理、Bean 实例代理、事件发布、资源装载等高级服务。

可见容器是 Spring 框架的核心。

spring 中容器实现大致有两种：

- BeanFactory（`org.springframework.beans.factory.BeanFactory` 接口）
  - 它提供高级 IoC 的配置机制，通常称为 **IOC 容器**。
- 应用上下文（`org.springframework.context.ApplicationContext` 接口， 基于 BeanFactory 之上构建）
  - 提供更多面向应用的功能，包括国际化支持和框架事件事件体系。



两者的主要用途：

- BeanFactory 是 Spring 框架的基础设施，面向 Spring 本省；
- ApplicationContext 面向使用 Spring 框架的开发者







## 二、Bean 的生命周期

和 Web 容器中的 Servlet 类似，Spring 容器管理的 Bean 也拥有类似的生命周期。

Bean 生命周期由多个阶段组成，每个生命阶段都提供了特定的接口对其进行操作。



Spring 中，通过两个层面定义 Bean 的生命周期：

- Bean 的作用范围
- 实例化 Bean 时所经历的一系列阶段



现在主要探讨 BeanFactory 实例化 Bean 的各个生命周期阶段。



### 1、BeanFactory 的类继承体系

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/images/spring/BeanFactoryInherit.png)

`BeanFactory` 位于类结构树的顶端，它最主要的方法就是 `getBean(String beanName)`，该方法从容器中返回特定名称的 Bean。BeanFactory 的功能通过其他接口得到不断扩展。

- `ListableBeanFactory`：该接口定义了访问容器中 Bean 的基本信息的若干方法，如查看 Bean 的个数、获取某一类型 Bean 的配置名、查看容器中是否包括某一 Bean 等
- `HierarchicalBeanFactory`：父子级联 IoC 容器的接口，子容器可以通过接口方法访问父容器。
- `ConfigurableBeanFactory`：这是一个重要的接口，增强了 IoC 容器的可定制性，它定义了设置类装载器、属性编辑器、容器初始化后置处理器等方法
- `AutoWireCapableBeanFactory`：定义了将容器中的 Bean 按照某种规则（如按名字匹配、按类型匹配等）进行自动装配的方法
- `SingletonBeanRegistry`：定义了允许在运行期向容器注册单实例 Bean 的方法。
- `BeanDefinitionRegistry`：Spring 配置文件中每一个 `<bean>` 节点元素在 Spring 容器里都通过一个 `BeanDefinition` 对象表示，它描述了 Bean 的配置信息。而 `BeanDefinitionRegistry` 接口提供了向容器手工注册 BeanDefinition 对象的方法。



> 注意

在初始化 `BeanFactory` 时，必须为其提供一种日志框架，我们使用 **Log4J**，即在类路径下提供 Log4J 配置文件，这样启动 Spring 容器才不会报错。



### 2、ApplicationContext 类体系结构

如果说 **BeanFactory** 是 Spring 的 “心脏”，那么 **ApplicationContext** 就是完整的 “身躯“ 了。`ApplicationContext` 由 `BeanFactory` 派生而来，提供了更多面向实际应用的功能，在 BeanFactory 中，很多功能需要以编程的方式实现，而在 ApplicationContext 中则可以通过配置的方式实现。



ApplicationContext 的主要实现类是 `ClassPathXmlApplicationContext` 和 `FileSystemXmlApplicationContext` ，前者默认从类路径加载配置文件，后者默认从文件系统中装载配置文件。



![](/images/spring/ApplicationContextInherit.png)

`ConfigurableApplicationContext` 扩展于 `ApplicationContext`，它新增了两个主要的方法：**`refresh()`**  和 **`close()`**，让 ApplicationContext 具有启动、刷新和关闭应用上下文的能力。在应用上下文关闭的情况下调用 refresh() 即可启动应用上下文，在已经启动的状态下调用 refresh() 则可清除缓存并重新装载配置信息，但作为开发者，我们并不需要过多关心这些方法。



> 使用 ClassPathXmlApplicationContext

和 `BeanFactory` 初始化相似，`ApplicationContext` 的初始化也很简单。如果配置文件防止在类路径下，则可以优先考虑使用 `ClassPathXmlApplicationContext` 实现类。



```java
public static void main(String[] args) {
  ApplicationContext ctx = new ClassPathXmlApplicationContext("com/smart/context/beans.xml");
  // 这就相当于：classpath:com/smart/context/beans.xml
}
```



> 使用 FileSystemXmlApplicationContext

如果配置文件放在文件系统的路径下，则可以优先考虑使用 `FileSystemXmlApplicationContext` 实现类

```java
public static void main(String[] args) {
  ApplicationContext ctx = new FileSystemXmlApplicationContext("com/smart/context/beans.xml");
  // 这就相当于：file:com/smart/context/beans.xml
}
```



> 使用 AnnotationConfigApplicationContext

现在，Spring 为基于注解类的配置提供了专门的 ApplicationContext 实现类：`AnnotationConfigApplicationContext`

例子：

```java
@Configuration
public class Beans {
  
  @Bean(name = "car")
  public Car car() {
    Car car = new Car();
    
    return car;
  }
}
```



```java
public class AnnotationApplicationContextTest {
  
  @Test
  public void getBean() {
    ApplicationContext ctx = new AnnotationConfigApplicationContext(Beans.class);
    Car car = ctx.getBean("car", Car.class);
    assertNotNull(car);
  }
}
```



### 3、WebApplicationContext 类体系结构

`WebApplicationContext` 是专门为 Web 应用准备的，它允许从相对于 Web 根目录的路径中装载配置文件完成初始化工作。从 `WebApplicationContext` 中可以获得 `ServletContext` 的引用，整个 Web 应用上下嗯对象将作为属性放置到 `ServletContext` 中，以便 Web 应用环境可以访问 Spring 应用上下文。Spring 专门为此提供了一个抽象工具类 **`WebApplicationContextUtils`**，通过该类的 `getWebApplicationContext(ServletContext sc)` 方法，可以从 ServletContext 中获取 WebApplicationContext 实例。



在非 Web 应用的环境下，Bean 只有 **singleton** 和 **prototype** 两种作用域。

WebApplicationContext 为 Bean 添加了三个新的作用域：**request**、**session** 和 **global session**。



下面是它的继承体系：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/images/spring/WebApplicationContextInherit.png)

由于 Web 应用比一般的应用拥有更多的特性，因此 `WebApplicationContext` 扩展了 `ApplicationContext`。 WebApplicationContext 定义了一个常量 **ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE**，在上下文启动时，WebApplicationContext 实例即以此为键放置在 ServletContext 的属性列表中，可以通过以下语句从 Web 容器中获取 WebApplicationContext：

```java
WebApplicationContext wac = (WebApplicationContext)servletContext.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
```

这就是刚刚那个工具类方法的实现原理：（`WebApplicationContextUtils`）

```java
	@Nullable
	public static WebApplicationContext getWebApplicationContext(ServletContext sc) {
		return getWebApplicationContext(sc, WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
	}
```

这样 **Spring 的 Web 应用上下文就可以和 Web 容器的上下文应用实现互访**，二者实现了融合：



`ConfigurableWebApplicationContext` 扩展了 `WebApplicationContext` 和 `ConfigurableApplicationContext`。它允许通过配置的方式实例化 `WebApplicationContext`，同时定义了两个重要的方法：

- `setServletContext(ServletContext servletContext)`：为 Spring 设置 Web 应用上下文，以便二者整合
- `setConfigLocations(String... configLocations)`：设置 Spring 配置文件地址，一般情况下，配置文件地址是相对于 Web 根目录的地址，如 /WEB-INF/xx.xml 等等。但用户也可以使用带资源类型前缀的地址，如：classpath:com/smart/beans.xml 等等





## 三、BeanFactory 中的 Bean 生命周期

<img src="https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/images/spring/BeanFactoryLifecycle.png" style="zoom:80%;" />

### 1、具体流程

具体流程如下：

1. 调用者通过 `getBean(beanName)` 向容器请求一个 Bean 时，如果容器注册了 `org.springframework.beans.factory.config.InstantiationAwareBeanPostProcessor` 接口，则在实例化 Bean 之前，将调用接口的 `postProcessBeforeInstantiation()` 方法
2. 根据配置情况调用 Bean 构造函数或工厂方法实例化 Bean
3. 如果容器注册了 `InstantiationAwareBeanPostProcessor` 接口，那么在实例化 Bean 之后，调用该接口的 `postProcessAfterInstantiation()` 方法，可在这里对已经实例化的对象进行一些 “梳妆打扮”
4. 如果 Bean 配置了属性信息，那么容器在这一步着手将配置值设置到 Bean 对应的属性中，不过在设置每个属性之前将先调用 `InstantiationAwareBeanPostProcessor` 接口的 `postProcessPropertyValues()` 方法
5. 调用 Bean 的属性设置方法设置属性值
6. 如果 Bean 实现了 `org.springframework.beans.factory.BeanNameAware` 接口，则将调用 `setBeanName()` 接口方法，将配置文件中该 Bean 对应的名称设置到 Bean 中
7. 如果 Bean 实现了 `org.springframework.beans.factory.BeanFactoryAware` 接口，则将调用 `setBeanFactory()` 接口方法，将 Bean Factory 容器实例设置到 Bean 中
8. 如果 BeanFactory 装配了 `org.springframework.beans.factory.config.BeanPostProcessor` 后处理器，则将调用 `BeanPostProcessor` 的 `Object postProcessBeforeInitialization(Object bean, String beanName)` 接口方法对 Bean 进行加工操作。其中，入参 bean 是当前正在处理的 Bean，而 beanName 是当前 Bean 的配置名，返回的对象为加工处理后的 Bean。用户可以使用该方法对某些 Bean 进行特殊的处理，甚至改变 Bean 的行为。**BeanPostProcessor** 在 Spring 框架中占用重要的地位，为容器提供对 Bean 进行后续加工处理的切入点，Spring 容器所提供的各种 “神奇功能”（如 AOP、动态代理等等）都通过 **BeanPostProcessor** 实施
9. 如果 Bean 实现了 `InitializingBean` 接口，则将调用接口的 `afterPropertiesSet()` 方法。
10. 如果在 `<bean>` 中通过 init-method 属性定义了初始化方法，则将执行这个方法。
11. `BeanPostProcessor` 后处理器定义了两个方法：
    - 其一：`postProcessBeforeInitialization()` ，在第八步中被调用
    - 其二：`Object postProcessAfterInitialization(Object bean, String beanName)` ，这个方法在此时调用，容器再次获得对 Bean 进行加工处理的机会
12. 如果 `<bean>` 中指定 Bean 的作用范围为 `scope="prototype"` ,则将 Bean 返回给调用者，调用者负责 Bean 后续生命的管理，Spring 不再管理这个 Bean 的生命周期。如果将范围设置为 `scope="singleton"`，则将 Bean 放入 Spring IoC 容器的缓存池中，并将 Bean 的引用返回给调用者，Spring 继续对这些 Bean 进行后续的生命管理。
13. 对于 `scope="singleton"` 的 Bean（默认情况），当容器关闭时，将触发 Spring 对 Bean 后续生命周期的管理工作。如果 Bean 实现了 `DisposableBean` 接口，则将调用接口的 destory（） 方法，可以在此编写释放资源、记录日志的操作。
14. 对于 `scope="singleton"` 的 Bean（默认情况），如果通过 `<bean>` 的 destroy-method 属性指定了 Bean 的销毁方法，那么 Spring 将执行 Bean 的这个方法，完成 Bean 资源的释放等操作



### 2、分类

Bean 的完整生命周期从 Spring 容器着手实例化 Bean 开始，直到最终销毁 Bean。其中经过了很多关键点，每个关键点涉及到特定方法的调用，可以将这些方法大致划分为 4 类：

- Bean 自身的方法：如调用 Bean 构造函数实例化 Bean、调用 Setter 设置 Bean 的属性值及通过 、`<bean>` 的 `init-method` 和 `destroy-method` 所指定的方法
- Bean 级生命周期接口方法：如 `BeanNameAware`、`BeanFactoryAware`、`InitializingBean` 和 `DisposableBean`，这些接口方法由 Bean 类直接实现
- 容器级生命周期接口方法：一般是两个接口：`InstantiationAwareBeanPostProcessor` 和 `BeanPostProcessor` 这两个接口实现的，一般称它们的实现类为 **“后处理器”**。后处理器接口一般不由 Bean 本身实现，它们独立于 Bean，实现类以容器附加装置的形式注册到 Spring 容器中，并通过接口反射为 Spring 容器扫描识别。当 Spring 容器创建任何 Bean 的时候，这些后处理器都会发生作用，所以这些后处理器的影响是全局性的。当然，用户可以合理的编写后处理器，让其仅对感兴趣的 Bean 进行加工处理。
- 工厂后处理器接口方法：包括 `AspectJWeavingEnabler`、`CustomAutowireConfigurer`、`ConfigurationClassPostProcessor` 等方法。工厂后处理器（`BeanFactoryPostProcessor`）也是容器级的，在应用上下文装配配置文件后立即调用。



**Bean 级生命周期接口** 和 **容器级生命周期接口** 是个性和共性辩证统一思想的体现，前者解决 Bean 个性化处理的问题，后者解决容器中某些 Bean 共性化处理的问题。



Spring 容器允许注册多个后处理器。只要它们同时实现了 `org.springframework.core.Ordered` 接口，容器将按照特定顺序一次调用这些后处理器。



`InstantiationAwareBeanPostProcessor` 其实是 `BeanPostPorcessor` 接口的子接口，Spring 为其提供了一个适配器类 `InstantiationAwareBeanPostProcessorAdatper`，一般情况下，可以方便地扩展该适配器覆盖感兴趣的方法以定义实现类。



> 版本区别

从 5.3 之后 不推荐使用 `InstantiationAwareBeanPostProcessorAdatper` 接口

你可以实现 `InstantiationAwareBeanPostProcessor `  接口

或者直接使用 `SmartInstantiationAwareBeanPostProcessor` 接口



注意原来 adapter 中继承的方法现在分散到 instantiation 和 smart 中去了



### 3、组合生命周期机制

自 spring 2.5 后，有三种方式去控制生命周期行为：

- `InitializingBean`  和 `DisposableBean` 回调接口
- 自定义 `init()` 和 `destroy()`
- `@PostConstruce` 和 `@PreDestroy` 注解

为同一个 Bean 配置的多种生命周期机制具有不同的初始化方法，调用顺序如下：

1. 方法注解 `@PostConstruce`
2. 通过实现 `InitializingBean` 接口重写 `afterPropertiesSet()` 方法
3. 自定义 `init()` 方法

销毁方法的调用顺序相同



### 4、启动和关闭回调

`Lifecycle` 接口定义了一些必要的方法，要求 bean 的生命周期必须具备(例如：启动和停止一些后台处理)

```java
public interface Lifecycle {
  
  void start();
  
  void stop();
  
  boolean isRunning();
}
```

任何 Spring 管理的对象可能实现 Lifecycle 接口。然而，当 ApplicationContext 接收到启动和停止信号(例如：在运行时停止和重启场景)，它将这些调用级联到在该上下文中定义的所有生命周期实现。通过代理到 `LifecycleProcessor` 处理，在下面清单显示：

```java
public interface LifecycleProcessor extends Lifecycle {
  
  void onRefresh();
  
  void onClose();
}
```

LifecycleProcessor 是 Lifecycle 的扩展，它增加了两个额外的方法去接收上下文的刷新和关闭。



启动和关闭顺序调用是非常重要的。如果依赖关系存在任何对象之间，依赖侧的开始是在被依赖之后的，并且它的停止是在它的依赖之前。然而，在运行时，这个直接依赖是未知的。只知道某种类型的对象应该先于另一种类型的对象开始。在这种情况下，`SmartLifecycle` 接口定义其他可选，即 `getPhase()` 方法在它的父接口被定义，`Phased`。下面的清单显示Phased接口的定义。

```java
// 用于可能参与阶段性流程(如生命周期管理)的对象的接口。  
public interface Phased {
  
	int getPhase();
}
```

```java
// SmartLifecycle 参与了 Bean 的生命周期管理
public interface SmartLifecycle extends Lifecycle, Phased {
  boolean isAutoStartup();
  
  void stop(Runnable callback);
}
```

启动时，阶段值最低的对象首先启动。停止时，顺序相反。因此，实现 `SmartLifecycle` 接口并且`getPhase()` 方法返回 `Integer.MIN_VALUE` 的对象将在第一个启动和最后一个停止。另一种类型，`Integer.MAX_VALUE` 阶段值指示这个对象最后一个被启动并且第一个被销毁 (可能因为它依赖其他处理运行)。当考虑这个阶段值的时候，重要的是要知道，任何未实现 `SmartLifecycle` 的“正常”生命周期对象的默认阶段为 0。因此，任何负的阶段值表示对象应该启动在这些标准的组件之前(停止在它们之后)。对于任何正阶段值，情况正好相反。停止方法通过 `SmartLifecycle` 接受一个回调被定义。任何实现必须在实现的关闭处理完成后调用回掉的 `run()` 方法。这将在必要时启用异步关闭，因为 `LifecycleProcessor` 接口的默认实现 `DefaultLifecycleProcessor` 会等待其超时值，以等待每个阶段内的对象组调用该回调。每个阶段默认超时时间 30 秒。你可以通过定义一个 bean 命名为 `lifecycleProcessor` 在上下文中覆盖这个默认生命周期处理实例。如果你想仅仅修改超时时间，定义以下内容就足够了：

```xml
<bean id="lifecycleProcessor" class="org.springframework.context.support.DefaultLifecycleProcessor">
  <!-- timeout value in milliseconds -->	      
  <property name="timeoutPerShutdownPhase" value="10000"/>
</bean>
```



像前面提到的，`LifecycleProcessor` 接口定义回调方法为上下文更好的刷新和关闭。后者驱动关闭过程，就好像已经显式调用了 `stop()` 一样，但是它在上下文关闭时发生。另一方面，“refresh” 回调启用了`SmartLifecyclebean` 的另一个特性。当这个上下文被刷新(所有的 `bean` 被初始化和实例化)，即回调被调用。在那个阶段，默认的生命周期处理器通过每个 `SmartLifecycle` 对象的 `isAutoStartup()` 方法检测返回 `boolean` 值。如果 true，对象在那个阶段被启动而不是等待上下文或者自身的 `start()` 方法显示调用(与上下文刷新不同，对于标准上下文实现，上下文启动不会自动发生)。像前面所描述的，`phase` 值和任何依赖关系确定了启动顺序。



### 5、重要的 Aware 接口

Spring 提供了广泛的 Aware 回调接口，这些接口使 Bean 向容器指示它们需要一些基础结构依赖性。作为基本规则，这个名字指示依赖类型。下面的表格总结最重要的 Aware 接口：



|              Name              |            Injected Dependency             | Explained        |
| :----------------------------: | :----------------------------------------: | ---------------- |
|    ApplicationContextAware     |         注入 `ApplicationContext`          |                  |
| ApplicationEventPublisherAware |      注入 `ApplicationEventPublisher`      |                  |
|      BeanClassLoaderAware      | Class loader used to load the bean classes | 初始化 Bean 有关 |
|        BeanFactoryAware        |             注入 `BeanFactory`             |                  |
|         BeanNameAware          |              注入 `BeanName`               |                  |
|     BootstrapContextAware      |          注入 `BootstrapContext`           | JCA CCI          |
|      LoadTimeWeaverAware       |           注入 `LoadTimeWeaver`            | 和 AspectJ 有关  |
|       MessageSourceAware       |            注入 `MessageSource`            |                  |
|   NotificationPublisherAware   |        注入 `NotificationPublisher`        |                  |
|      ResourceLoaderAware       |           注入 `ResoureceLoader`           | 和资源有关       |
|       ServletConfigAware       |            注入 `ServletConfig`            | Spring MVC       |
|      ServletContextAware       |           注入 `ServletContext`            | Spring MVC       |



## 四、容器扩展点

### 1、BeanPostProcessor 自定义 bean

`BeanPostProcessor` 接口定义回调方法，你可以实现这个接口提供你自己的(或者覆盖容器的默认设置)初始化逻辑、依赖解析逻辑等等。如果你想实现一些自定义逻辑，在 Spring 容器完成实例化、配置、初始化 bean 之后，你可以插入一个或多个自定义 `BeanPostProcessor` 实现。你可以配置多个 BeanPostProcessor 实例并且你可以通过设置`order` 属性来控制这些 BeanPostProcessor 实例的执行顺序。仅仅 BeanPostProcessor 实现 `Ordered` 接口是可以设置这个属性。如果自己实现 BeanPostProcessor，你应该考虑实现 Ordered 接口。



也就是说 `Spring IoC` 容器实例化一个 Bean，然后 `BeanPostProcessor` 会处理这个实例（在 Spring 容器初始化 bean 的过程中执行相关的回调操作）。

并且 `BeanPostProcessor` 实例是按照容器划分作用域的。仅仅在它所属的那个容器范围内生效。





如果想改变 bean 的定义，就需要使用 `BeanFactoryPostProcessor`。



`org.springframework.beans.factory.config.BeanPostProcessor` 接口恰好地由两个回调方法组成。当一个类作为后置处理起被注册到容器中时，对于每个被容器创建的 bean 实例，后置处理器从容器初始化方法(例如：`InitializingBean.afterPropertiesSet()` 或者任何被声明 `init方法`) 被调用之前，并且任何 bean 初始化回调之后获得回调。后置处理器能够处理 bean 实例任何操作，包括忽略所有的回调。Bean 后处理器通常检查回调接口，或者可以用代理包装 Bean。Spring AOP 基础设施类中实现 bean 的后置处理去提供一个代理包装逻辑。ApplicationContext 自动的检查所有 bean，只要 bean在配置元数据中实现了`BeanPostProcessor` 接口。`ApplicationContext` 就坏注册这些 bean 作为后置处理器，以便以后在创建bean 时可以调用它们。Bean 后处理器可以与其他 bean 以相同的方式部署在容器中。



注意，当通过在类上使用 `@Bean` 工厂方法声明 `BeanPostProcessor` 时，工厂方法返回类型应该是实现类本身或只是实现`org.springframework.beans.factory.config.BeanPostProcessor` 接口，清晰地表明该 bean 的后处理器性质。否则，`ApplicationContext` 无法在完全创建之前按类型自动检测它。由于`BeanPostProcessor` 需要及早实例化才能应用于上下文中其他 bean 的初始化，因此这种早期类型检测至关重要。



举个例子，自定义一个 `BeanPostProcessor` 实现并调用通过容器创建的每个 bean 的 `toString()` 方法：

```java
import org.springframework.beans.factory.config.BeanPostProcessor;

public class InstantiationTracingBeanPostProcessor implements BeanPostProcessor {

    // simply return the instantiated bean as-is
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        return bean; // we could potentially return any object reference here...
    }

    public Object postProcessAfterInitialization(Object bean, String beanName) {
        System.out.println("Bean '" + beanName + "' created : " + bean.toString());
        return bean;
    }
}
```



### 2、BeanFactoryPostProcessor 自定义配置元数据

下一个拓展点是 `org.springframework.beans.factory.config.BeanFactoryPostProcessor`。这个接口语义类似 `BeanPostProcessor`，一个重要的不同点：`BeanFactoryPostProcessor` 是操作在 bean 的**配置元数据**上。也就是说，Spring IoC 容器允许除 `BeanFactoryPostProcessor` 实例外其他任何 bean 被`BeanFactoryPostProcessor` 读取配置元数据和改变它。你可以配置多个 `BeanFactoryPostProcessor` 实例，并且你可以通过设置 order 属性在这些 BeanFactoryPostProcessor 实例上来控制顺序。然而，如果 BeanFactoryPostProcessor 实现 `Ordered` 接口才能设置这个属性。如果你写自己的BeanFactoryPostProcessor，你应该考虑实现 Ordered 接口。



```java
@FunctionalInterface
public interface BeanFactoryPostProcessor {

	void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException;

}
```



同样 `BeanFactoryPostProcessor` 实例是按照容器划分的（如果使用分层的容器才有意义）



### 3、FactoryBean 自定义初始化逻辑

可以为本身就是工厂的对象实现 `org.springframework.beans.factory.FactoryBean` 接口（注意它和 **BeanFactory** 区分）。

这个 `FactoryBean` 接口是 Spring IoC 容器的实例化逻辑可插拔点。如果你有一个复杂的初始化代码在 Java 中比冗余XML更好的表达，你可以创建你自己的 FactoryBean，在实现类中写复杂的初始化逻辑，然后将你自定义 FactoryBean 注入到容器中。



FactoryBean 接口提供三个方法：

- `Object getObject()`：返回这个工厂创建的一个实例。这个实例可能被共享，依赖于这个工厂返回的是单例或者原型。
- `boolean isSingleton()`：如果 FactoryBean 返回一个单例就返回 true，否则为 false。
- `Class getObjectType()`：返回由 getObject() 方法返回的对象类型；如果类型未知，则返回 null



FactoryBean 这个接口在 Spring 框架中使用比较多，有超过 50 个 FactoryBean 接口的实现。

当你需要向容器获取一个实际的 FactoryBean 实例本身而不是由它产生的 bean 时请在调用ApplicationContext 的 getBean() 方法时在该 bean 的 ID 前面加上一个 **`＆`** 符号。因此，对于 id 为 myBean 的给定 FactoryBean，在容器上调用 `getBean(“myBean”) `将返回 FactoryBean 的产生的 bean，而调用`getBean(“&myBean”)`将返回 FactoryBean 实例本身
