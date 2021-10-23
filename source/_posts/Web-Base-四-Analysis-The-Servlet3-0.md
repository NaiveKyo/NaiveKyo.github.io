---
title: Web Base (四) Analysis The Servlet3.0
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/banner/7.jpg'
coverImg: /medias/banner/7.jpg
toc: true
date: 2021-09-28 16:09:02
top: false
cover: false
summary: 详解 Servlet3.0 体系。
categories: "Website Basics"
keywords: ["Website Basics", "Servlet3.0"]
tags: "Website Basics"
---



## 详解 Servlet 3.0

所需依赖：

```xml
<!-- tomcat servlet 容器 -->
<dependency>
    <groupId>org.apache.tomcat</groupId>
    <artifactId>tomcat-catalina</artifactId>
    <version>8.5.71</version>
</dependency>
```



Servlet 是 Server + Applet 缩写，表示一个服务器应用。

之前也说过，Servlet 其实是一套规范，我们按照这套规范写的代码就可以直接在配置有 Java 的运行环境的服务器上面运行。

### 1、Servlet3.0 结构

servlet 3.0 结构如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210928160632.png)



### 2、Servlet 接口

源码：

```java
public interface Servlet {

  // Servlet 容器声明一个 Servlet 并放入 service 中，在实例化 servlet 之前调用 init() 初始化配置
  public void init(ServletConfig config) throws ServletException;
  
  // 获取一开始传递给 init() 方法的 servlet 的配置对象
  public ServletConfig getServletConfig();
  
  // servlet 初始化并实例化后，收到请求，调用 service 处理请求，注意 servlet 容器一般都是多线程的，所以服务内部处理 request 也是多条线程
  public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException;
  
  // 返回 servlet 相关信息
  public String getServletInfo();
  
  // servlet 容器调用此方法将相应的 servlet 移除容器，注意，service 方法中所有线程此时都应该结束或者超时
  public void destroy();
}
```

- 容器启动调用 `init()`（当  load-on-startup 设置为负数或者不设置时会在 Servlet 第一次用到时才被调用）
- `getServletConfig()` 方法用于获取 `ServletConfig`，下面会详解 `ServletConfig`
- `service()` 方法用于具体处理一个请求；
- `getServletInfo()` 方法可以获取一些 Servlet 相关的信息，如作者、版权等等，这个方法需要自己实现，默认返回空字符串
- `destroy()` 方法主要用于 Servlet 销毁（一般指关闭服务器）时释放一些资源，也只会调用一次



#### 1.1、init（）

init 方法接收的 ServletConfig 类型参数，是容器传进去的。这是 Servlet 的配置，我们在 web.xml 中定义 Servlet 时通过 `init-param` 标签配置的参数是通过 `ServletConfig` 来保存的，比如 Spring MVC 的 DispatchServlet：

```xml
<servlet>
	<servlet-name>dispatcherServlet</servlet-name>
	<servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  <init-param>
  	<param-name>contextConfigLocation</param-name>
    <param-value>demo-servlet.xml</param-value>
  </init-param>
	<load-on-startup>1</load-on-startup>
</servlet>
```

那么在具体的执行的时候，是谁将 ServletConfig 传递给 init() 方法呢？

答案是在 `org.apacha.catalina.core.StandardWrapper` 的 `initServlet` 方法中调用的，ServletConfig 作为参数传给 `StandardWrapper`（里面封装着 Servlet）的门面类 `StandardWrapperFacade`。

<mark>注：Wrapper 其实是一个容器，包含了 web.xml 中定义的 Servlet 信息，Wrapper 接口的实现负责管理底层 Servlet 类的生命周期</mark>



**StandardWrapper.java**

```java
public class StandardWrapper extends ContainerBase
    implements ServletConfig, Wrapper, NotificationEmitter {
  
  	protected final StandardWrapperFacade facade = new StandardWrapperFacade(this);

		private synchronized void initServlet(Servlet servlet)
            throws ServletException {

        if (instanceInitialized && !singleThreadModel) {
            return;
        }

        // Call the initialization method of this servlet
        try {
            if( Globals.IS_SECURITY_ENABLED) {
                boolean success = false;
                try {
                    Object[] args = new Object[] { facade };
                    SecurityUtil.doAsPrivilege("init",
                                               servlet,
                                               classType,
                                               args);
                    success = true;
                } finally {
                    if (!success) {
                        // destroy() will not be called, thus clear the reference now
                        SecurityUtil.remove(servlet);
                    }
                }
            } else {
                servlet.init(facade);
            }

            instanceInitialized = true;
        } catch (UnavailableException f) {
            unavailable(f);
            throw f;
        } catch (ServletException f) {
            // If the servlet wanted to be unavailable it would have
            // said so, so do not call unavailable(null).
            throw f;
        } catch (Throwable f) {
            ExceptionUtils.handleThrowable(f);
            getServletContext().log(sm.getString("standardWrapper.initException", getName()), f);
            // If the servlet wanted to be unavailable it would have
            // said so, so do not call unavailable(null).
            throw new ServletException
                (sm.getString("standardWrapper.initException", getName()), f);
        }
    }
}
```

**StandardWrapperFacade.java**

```java
public final class StandardWrapperFacade
    implements ServletConfig {
  
  	private final ServletConfig config;
  
    public StandardWrapperFacade(StandardWrapper config) {
        super();
        this.config = config;
    }
}
```



这是外观模式（Facade Pattern）的一种应用，因为 `StandardWrapper` 中并不是所有的信息都和 ServletConfig 相关，所以我们可以提供一个门面 Facade 类。

`StandardWrapper` 和 `StandardWrapperFacade` 都实现了 `ServletConfig` 接口，Servlet 是通过 web.xml 配置的。

在解析 xml 后把配置参数读取到 ServletConfig 然后传递给 `StandardWrapperFacade` ，而 Facde 类聚合了一个 `StandardWrapper` 对象，这样配置参数就可以传递到 `StandardWrapper`。

所以我们是直接访问 StandardWrapperFacade 而不是 StandardWrapper 。（外观模式的作用）



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210928160652.png)



#### 1.2、getServletConfig（）

**ServletConfig.java**

```java
public interface ServletConfig {

    public String getServletName();

    /**
     * Returns a reference to the {@link ServletContext} in which the caller
     * is executing.
     *
     * @return	a {@link ServletContext} object, used
     * by the caller to interact with its servlet container
     * 
     * @see ServletContext
     */
    public ServletContext getServletContext();

    public String getInitParameter(String name);

    public Enumeration<String> getInitParameterNames();

}
```



- `getServletName()`

该方法用户获得 Servlet 的名字，也就是我们在 web.xml 中定义的 servlet-name；

- `getInitParameter()` 

该方法用于获取 init-param 配置的参数；

- `getInitParameterNames()`

该方法用于获取配置的所有 init-param 的名字集合；

- <code style="font-weight:bold;color:red;">getServletContext()</code>

这个方法非常重要，它的返回值 <strong style="color:red">ServletContext</strong> 其实就是 Tomcat 中 `Context` 的门面类`ApplicationContextFacade`。（下面我们会看到具体的情况）

<br />

这里我们来看看 ServletContext、ApplicationContext、ApplicationContextFacade、Context、StandardContext

- Context：在 Catalina servlet 引擎中，它代表 servlet 上下文的容器，就相当于一个 web 应用程序，一般将 Host 或者其他实现附加到 Context 父容器上，一般将 Wrapper 的实现（代表一个 servlet 定义）附加到 Context 子容器上，层级如下
  1. Host
  2. Context
  3. Wrapper
- StandardContext：Context 接口的标准实现，每一个子容器必须是 Wrapper 的实现用于处理特定的 Servlet 请求
- ServletContext：
  - 定义了一组方法为 servlet 和  servlet 容器通信服务：比如获取文件的媒体类型、分派请求、写入日志等等
  - 每个 web 应用程序对应一个 JVM 对应一个上下文
  - 对于分布式应用程序，每台虚拟机都有一个上下文实例，这时，上下文不能共享全局信息，这时应该使用外部资源比如数据库
  - 每个 ServletConfig 对象都包含一个 ServletContext 对象
- ApplicationContext：ServletContext 的标准实现，表示 web 应用程序的执行环境，它的实例关联所有 StandardContext
- ApplicationContextFacade：Facade 对象屏蔽了 web 应用程序内部的 ApplicationContext（外观模式的应用）



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210928160706.png)

上面的图展示了目前我们了解的东西：

- Servlet 的初始化涉及到 ServletConfig，而具体执行 Servlet 的 init（）方法的是在 StandardWrapperFacade 中
- Servlet 的 getServletConfig（）方法，获取到的是 ServletConfig
- ServletConfig 接口中定义的 getServletContext（）方法获取到其实是 ApplicationContextFacade，而执行 getServletContext（）方法的其实是 StandardContext



#### UML 补充知识

> UML 补充知识

在画出类图之后，不得不提一句 UML 中对于 依赖、关联、聚合、组合 这四种关系，依赖还比较好区分，表示类与类之间的联接，**在 Java 中表现为局部变量、方法的形参 或者对某个类静态方法的调用。**

但是 关联、聚合、组合就不太好区分了，它们仅仅是在语义上有区别，所谓语义指的是上下文环境、特定情境等等。

- 关联（Association）关系是类与类之间的联接，它使一个类知道另一个类的属性和方法。关联可以是双向的，也可以是单向的。**在 Java 中表现为成员变量**。
- 聚合（Aggregation）关系是关联关系的一种，是强的关联关系。聚合是整体和个体的关系，即 has-a 关系，整体和个体可以具有各自的生命周期，部分可以属于多个整体对象，也可以为多个整体对象共享。程序中聚合和关联关系是一致的，只能从语义级别来区分。**在 Java 中与关联一样，聚合也是通过成员变量实现的**，但是关联关系所涉及到的两个类是处于同一个层次上的，而聚合关系两个类是处于不平等的层次，**一个是整体，一个是部分。聚合关系一般通过 setter 方法注入。**
- 组合（Composition）关系是关联关系的一种，是比聚合关系还强的关系。组合是整体与部分的关系，即 contains-a 的关系。它要求普通的聚合关系中代表整体的对象负责代表部分的对象的生命周期，组合关系是不能共享的。代表整体的对象负责代表部分的对象的存活，在一些情况下将负责代表部分的对象湮灭掉，代表整体的对象可以将代表部分的对象传递给另一个对象，由后者负责此对象的生命周期。换言之，**代表部分的对象在每一个时刻只能与一个对象发生组合关系，由后者排他地负责它的生命周期。部分和整体的生命周期一样。**在 Java 中一般 **用构造函数注入**。





<br />

既然 ServletContext 代表应用本身，那么 ServletContext 里面设置的参数就可以被当前应用的所有 Servlet 共享了。我们做项目的时候都知道参数可以保存在 Session 中，也可以保存在 Application 中，而后者很多时候就是保存在 ServletContext 中。

<br />

我们可以这么理解：ServletConfig 是 Servlet 级的，而 ServletContext 是 Context（也就是 Application）级的。当然 ServletContext 的功能很强大，保存配置参数只是其中一个功能罢了。

<br />

现在 Servlet（wrapper） 级和 Context 级我们都可以操作，那么更高一级的 Host 该如何操作呢？

在 Servlet 的标准里也是有相关规定的，在 `ServletContext` 接口中有这个方法：

- `public ServletContext getContext(String uripath)`

它可以根据路径获取到同一个站点下的别的应用的 ServletContext。当然由于安全原因，一般会返回 null，如果想使用就需要一些设置。



回到正题，`ServletConfig` 和 `ServletContext` 最常见的使用之一是传递初始化参数。我们就以 Spring 配置中用的最多的 `contextConfigLocation` 参数举例：



```xml
<!-- Spring 上下文环境 -->
<context-param>
  <param-name>contextConfigLocation</param-name>
  <param-value>classpath:applicationContext.xml, classpath:application-mvc.xml</param-value>
</context-param>

<!-- 使用特定的 listener 引导加载 spring 上下文 -->
<listener>
  <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
</listener>

<!-- 注册 DispatchServlet -->
<servlet>
  <servlet-name>springmvc</servlet-name>
  <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  <init-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>classpath:applicationContext.xml</param-value>
  </init-param>
  <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
  <servlet-name>springmvc</servlet-name>
  <url-pattern>/</url-pattern>
</servlet-mapping>
```

- 上面通过 context-param 配置的 contextConfigLocation 配置到了 ServletContext，同时利用下面的特定 Listener 引导 spring 容器先于 servlet 容器加载。 
- 下面通过 servlet 下的 init-param 配置的 contextConfigLocation 配置到了 ServletConfig，而该 Servlet 是我们最为熟知的 DispatchServlet（前端控制器模式），该 servlet 用于关联 spring 容器中的 controller 层 bean。

<br />

在 Servlet 中可以分别通过它们的 getInitParameter 方法进行获取，比如：

```java
String contextLocation = this.getServletConfig().getServletContext().getInitParameter("contextConfigLocation");

String servletLocation = this.getServletConfig().getInitParamter("contextConfigLocation");
```

为了方便操作，`GenericServlet` 定义了 `getInitParameter()` 方法，内部返回 getServletConfig().getInitParameter 的返回值，因此，我们如果需要获取 ServletConfig 中的参数，可以不再调用 getServletConfig()，而是直接调用 getInitParameter。



另外，`ServletContext` 中非常常用的用法就是保存 Application 级的属性，这个可以使用 setAttribute 来完成，比如：

```java
getSerlvetContext().setAttribute("contextConfigLocation", "new path");
```

需要注意的是，这里设置的同名 Attribute 并不会覆盖 initParameter 中的参数值，它们是两套数据，互不干扰。ServletConfig 不可以设置属性。





> 补充知识

在传统的 SSH 或 SSM 项目中，Tomcat 中存在两个容器：servlet 容器和 spring 容器，spring 又分为 spring 上下文容器和 spring-mvc 容器（也可以进一步划分为 3 个容器），mvc 容器主要存储 service 和 dao 层的 bean，spring 容器主要存储 controller 层的容器，同时 spring 容器又是 mvc 容器的父容器。

由于 web 应用本质上是访问 servlet 来处理用户请求，用户访问一个 url，这个 url 被 DispatchServlet 捕获，最终找到处理该请求的 servlet 去处理，servlet 处理逻辑中需要使用 spring 容器中相关的 bean。

这就涉及到一个问题：**如何将 web 容器和 spring 容器关联起来？**

- 这一点 spring 中做了一些特殊的处理：
  - spring 将自己的 `WebApplicationContext` 注册到 Servlet 容器的`ServletContext` 中，以键值对的形式
  - 键：`ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE`
  - 值：`WebApplicationContext` 对象
  - 同时提供了一个工具类 `WebApplicationContextUtils`，只要将一个 `ServletContext` 实例传给工具类中的一个方法，就可以拿到 spring web 应用上下文
- 如果想要在一个 servlet 中拿到 spring 容器的 web 应用上下文，应该这样做
  - 首先拿到该 Servlet 对应的 ServletConfig
  - 然后使用该 ServletConfig 拿到对应的唯一上下文 ServletContext
  - 将该 ServletContext 传给工具类特定方法，就可以拿到 spring 容器的 WebApplicationContext

<br />







#### 1.3、GenericServlet

**GenericServlet** 是 Servlet 的默认实现，主要做了三件事：

1. 实现了 `ServletConfig` 接口，我们可以直接调用 ServletConfig 里的方法；
2. 提供了无参的 `init()` 方法；
3. 提供了 `log` 方法。



由于它实现了 ServletConfig 接口，所以 ServletConfig 的方法我们可以直接调用，而不再需要先获取 ServletConfig 了：

`getServletContext()`：

```java
// javax.servlet.GenericServlet
public ServletContext getServletContext() {
  ServletConfig sc = getServletConfig();
  if (sc == null) {
    throw new IllegalStateException(
      lStrings.getString("err.servlet_config_not_initialized"));
  }

  return sc.getServletContext();
}
```

GenericSerlvet 实现了 Servlet 接口的 `init(ServletConfig config)` 方法，在里面将 config 设置给了内置的 config，然后调用无参的 init() 方法，这个方法就是模板方法（<mark>模板方法模式：超类定义模板方法交给子类去实现</mark>）

```java
// javax.servlet.GenericServlet
public void init(ServletConfig config) throws ServletException {
  this.config = config;
  this.init();
}

public void init() throws ServletException {}
```

这种做法有三个作用：

1. 首先，将参数 config 设置给内部属性 config，这样就可以直接在 ServletConfig 的接口方法中直接调用 config 的相应方法来执行；
2. 其次，这么做之后，我们在写 Servlet 的时候就可以只处理自己的初始化逻辑，而不需要关心 config 了；
3. 还有一个作用就是在重写 init 方法时也不需要再调用 `super.init(config)`。



如果在自己的 Servlet 中重写了带参数的 init 方法，那么记得一定要调用 `super.init(config)`，否则这里的 config 属性就接收不到值，相应的 ServletConfig 接口方法也就不能执行了。



GenericServlet 提供了两个 log 方法，一个记录日志，一个记录异常。具体实现是通过传给 ServletContext 的日志实现的。

```java
// javax.servlet.GenericServlet
public void log(String msg) {
  getServletContext().log(getServletName() + ": "+ msg);
}

public void log(String message, Throwable t) {
  getServletContext().log(getServletName() + ": " + message, t);
}
```

一般我们都有自己的日记处理方式，所以这个用的不多。

GenericServlet 是与具体协议无关的。



### 3、HttpSerlvet

HttpServlet 是用 HTTP 协议实现的 Servlet 的基类，写 Serlvet 时直接继承它就可以了，不需要再重头实现 Servlet 接口，我们要分析的 SpringMVC 中的 DispatchServlet 就是继承的 HttpServlet。既然 HttpSerlvet 是跟协议相关的，当然主要关心的是如何处理请求了，所以 HttpServlet 主要重写了 service 方法。在 service 方法中首先将 ServletRequest 和 ServletResponse 转换为了 HttpServletRequest 和 HttpServletResponse，然后根据 http 请求的类型不同将请求路由到不同的处理方法：

```java
// package javax.servlet.http.HttpServlet
protected void service(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException, IOException
{
    // 获取请求类型
    String method = req.getMethod();

    // 将不同的请求路由到不同的处理方法
    if (method.equals(METHOD_GET)) {
        long lastModified = getLastModified(req);
        if (lastModified == -1) {
            // servlet doesn't support if-modified-since, no reason
            // to go through further expensive logic
            doGet(req, resp);
        } else {
            long ifModifiedSince = req.getDateHeader(HEADER_IFMODSINCE);
            if (ifModifiedSince < lastModified) {
                // If the servlet mod time is later, call doGet()
                // Round down to the nearest second for a proper compare
                // A ifModifiedSince of -1 will always be less
                maybeSetLastModified(resp, lastModified);
                doGet(req, resp);
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
            }
        }

    } else if (method.equals(METHOD_HEAD)) {
        long lastModified = getLastModified(req);
        maybeSetLastModified(resp, lastModified);
        doHead(req, resp);

    } else if (method.equals(METHOD_POST)) {
        doPost(req, resp);

    } else if (method.equals(METHOD_PUT)) {
        doPut(req, resp);

    } else if (method.equals(METHOD_DELETE)) {
        doDelete(req, resp);

    } else if (method.equals(METHOD_OPTIONS)) {
        doOptions(req,resp);

    } else if (method.equals(METHOD_TRACE)) {
        doTrace(req,resp);

    } else {
        //
        // Note that this means NO servlet supports whatever
        // method was requested, anywhere on this server.
        //

        String errMsg = lStrings.getString("http.method_not_implemented");
        Object[] errArgs = new Object[1];
        errArgs[0] = method;
        errMsg = MessageFormat.format(errMsg, errArgs);

        resp.sendError(HttpServletResponse.SC_NOT_IMPLEMENTED, errMsg);
    }
}
```

具体处理方法都是 doXXX 的结构，如最常用的 doGet、doPost 就是在这里定义的。

doGet、doPut、和 doDelete 方法都是模板方法，而且如果子类没有实现将抛出异常，在调用 doGet 方法之前还对是否过期做了检查，如果没有过期则直接返回 304 状态码使用缓存；

doHead 调用了 doGet 的请求（@see HttpServlet#maybeSetLastModified），然后返回空 body 的 Response；doOptions 和 doTrace 正常不需要使用，主要是用来做一些调试工作，doOptions 返回所有支持处理的类型的集合，正常情况下可以禁用，doTrace 是用来远程诊断服务器的，它会将接收到的 header 原封不动地返回，这种做法很可能会被黑客利用，存在安全漏洞。如果如果不是必须使用，最好禁用。由于 doOptions 和 doTrace 的功能非常固定，所以 HttpServlet 做了默认的实现。

> 总结

HttpServlet 主要将不同的请求方式路由到了不同的处理方法。但是 SpringMVC 中的处理思路不一样，又将所有的请求合并到了统一的一个方法进行处理。

