---
title: Tomcat Connector Analysis
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210904170907.jpg'
coverImg: /img/20210904170907.jpg
toc: true
date: 2021-10-07 17:02:30
top: false
cover: false
summary: Tomcat 处理请求的组件 Connector
categories: Tomcat
keywords: Tomcat
tags: Tomcat
---

# Connector 分析

Connector 用于接收请求并将请求封装成 Request 和 Response 来具体处理，最底层使用 Socket 来进行连接的，Request 和 Response 是按照 HTTP 协议来封装的，所以 Connector 同时实现了 TCP/IP 协议和 HTTP 协议，Request 和 Response 封装完之后交给 Container 进行处理，Container 是 Servlet 的容器，Container 处理完之后返回给 Connector，最后 Connector 使用 Sokcet 将处理结果返回给客户端，这样整个请求就处理完了。

## 1、Connector 的结构

Connector 中具体是用 `Protocolhandler` 来处理请求的，不同的 ProtocolHandler 代表不同的连接类型，比如，Http11Protocol 使用的是普通的 Socket 来连接的，Http11NioProtocol 使用的是 NioSocket 来连接的。

ProtocolHandler 里面有 3 个非常重要的组件：

- Endpoint
  - 用于处理底层 Socket 的网络连接
- Processor
  - 用于将 Endpoint 接收到的 Socket 封装成 Request
- Adapter
  - 用于将封装好的 Request 交给 Container 进行具体处理

也就是说 Endpoint 用来实现 TCP/IP 协议，Processor 用来实现 HTTP 协议，Adapter 将请求适配到 Servlet 容器进行具体处理。

> AbstractEndpoint

Endpoint 的抽象实现 `AbstractEndpoint` 里面定义了 `Acceptor` 抽象静态内部类和一个 `Handler` 静态接口。

Acceptor 用于监听请求，Handler 用于处理接收到的 Socket，在内部调用了 Processor 进行处理。



> AbstractProtocol

ProtocolHandler 的抽象实现类 AbstractProtocol 里定义了 `ConnectionHandler` 静态内部类实现了 AbstractEndpoint.Handler 接口用于使用 Processor 处理 Socket。

同时还定义了内部类 `AsyncTimeout` 用于检查异步 request 的超时。



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211007170356.png)

## 2、Connector 自身类

Connector 类本身的作用主要是在其创建时创建 ProtocolHandler，然后在生命周期的相关方法中调用了 ProtocolHandler 的相关声明周期方法。Connector 的使用方法是通过 Connector 标签配置在 conf/server.xml 文件中，所以 Connector 是在 Catalina 的 load 方法中根据 conf/server.xml 配置文件创建 Server 对象时创建的。Connector 的生命周期方法是在 Service 中调用的。



### （1）Connector 的创建

Connector 的创建过程主要是初始化 `ProtocolHandler`。server.xml 配置文件中 Connector 标签的 protocol 属性会设置到 Connector 构造函数的参数中，它用于指定 ProtocolHandler 的类型，Connector 的构造函数代码如下：

```java
// org.apache.catalina.connector.Connector

public Connector() {
    this(null);
}


public Connector(String protocol) {
    // 根据 protocol 参数指定 protocolHandlerClassName
    setProtocol(protocol);
    // Instantiate protocol handler
    ProtocolHandler p = null;
    try {
        Class<?> clazz = Class.forName(protocolHandlerClassName);
        // 初始化代码
        p = (ProtocolHandler) clazz.getConstructor().newInstance();
    } catch (Exception e) {
        log.error(sm.getString(
            "coyoteConnector.protocolHandlerInstantiationFailed"), e);
    } finally {
        // 赋值给 protocolHandler 属性
        this.protocolHandler = p;
    }

    if (Globals.STRICT_SERVLET_COMPLIANCE) {
        uriCharset = StandardCharsets.ISO_8859_1;
    } else {
        uriCharset = StandardCharsets.UTF_8;
    }

    // Default for Connector depends on this (deprecated) system property
    if (Boolean.parseBoolean(System.getProperty("org.apache.tomcat.util.buf.UDecoder.ALLOW_ENCODED_SLASH", "false"))) {
        encodedSolidusHandling = EncodedSolidusHandling.DECODE;
    }
}
```

这里首先根据传入的 protocol 参数调用 setProtocol 方法设置了 prtocolHandlerClassName 属性，接着用 protocolHandlerClassName 所代表的类创建了 ProtocolHandler 并赋值给了 protocolHandler 属性。

设置 prtocolHandlerClassName  属性的 setProtocol 方法代码如下：

```java
// org.apache.catalina.connector.Connector

/*
Deprecated
Will be removed in Tomcat 9. Protocol must be configured via the constructor
*/
@Deprecated
public void setProtocol(String protocol) {

    boolean aprConnector = AprLifecycleListener.isAprAvailable() &&
        AprLifecycleListener.getUseAprConnector();

    if ("HTTP/1.1".equals(protocol) || protocol == null) {
        if (aprConnector) {
            setProtocolHandlerClassName("org.apache.coyote.http11.Http11AprProtocol");
        } else {
            setProtocolHandlerClassName("org.apache.coyote.http11.Http11NioProtocol");
        }
    } else if ("AJP/1.3".equals(protocol)) {
        if (aprConnector) {
            setProtocolHandlerClassName("org.apache.coyote.ajp.AjpAprProtocol");
        } else {
            setProtocolHandlerClassName("org.apache.coyote.ajp.AjpNioProtocol");
        }
    } else {
        setProtocolHandlerClassName(protocol);
    }
}
```

Apr 是 Apache Portable Runtime 的缩写，是 Apache 提供的一个运行时环境，如果要使用 Apr 需要先安装，安装后 Tomcat 可以自己检测出来。如果安装了 Apr，setProtocol 方法会根据配置的 HTTP/1.1 属性对应地将 protocolHandlerClassName 设置为 org.apache.coyote.http11.Http11AprProtocol，如果没有安装 Apr，会根据配置的 HTTP/1.1 属性将 protocolHandlerClassName  设置为 org.apache.coyote.http11.Http11NioProtocol，然后就会根据 protocolHandlerClassName 创建 ProtocolHandler。



### （2）Connector 生命周期处理方法

Connector 的生命周期处理方法中主要调用了 ProtocolHandler 的相应生命周期方法，代码如下：

```java
// org.apache.catalina.connector.Connector

@Override
protected void initInternal() throws LifecycleException {

    // 调用 LifecycleMBeanBase 的 initInternal 初始化通用部分
    super.initInternal();

    // 新建 Adapter，并设置到 protocolHandler
    adapter = new CoyoteAdapter(this);
    protocolHandler.setAdapter(adapter);

	......
	
    try {
        // 初始化 protocolHandler
        protocolHandler.init();
    } catch (Exception e) {
        throw new LifecycleException(
            sm.getString("coyoteConnector.protocolHandlerInitializationFailed"), e);
    }
}

@Override
protected void startInternal() throws LifecycleException {

    // Validate settings before starting
    if (getPort() < 0) {
        throw new LifecycleException(sm.getString(
            "coyoteConnector.invalidPort", Integer.valueOf(getPort())));
    }

    setState(LifecycleState.STARTING);

    try {
        protocolHandler.start();
    } catch (Exception e) {
        throw new LifecycleException(
            sm.getString("coyoteConnector.protocolHandlerStartFailed"), e);
    }
}

@Override
protected void stopInternal() throws LifecycleException {

    setState(LifecycleState.STOPPING);

    try {
        protocolHandler.stop();
    } catch (Exception e) {
        throw new LifecycleException(
            sm.getString("coyoteConnector.protocolHandlerStopFailed"), e);
    }
}


@Override
protected void destroyInternal() throws LifecycleException {
    try {
        protocolHandler.destroy();
    } catch (Exception e) {
        throw new LifecycleException(
            sm.getString("coyoteConnector.protocolHandlerDestroyFailed"), e);
    }

    if (getService() != null) {
        getService().removeConnector(this);
    }

    super.destroyInternal();
}
```

简单说明一下：

- 在 initInternal 方法中首先创建一个 Adatper 并设置到 ProtocolHandler 中，然后对 ProtocolHandler 进行初始化；
- 在 startInternal 方法中首先判断设置的端口是否小于 0，小于 0 就抛出异常，否则就调用 ProtocolHandler 的 start 方法来启动；
- 在 stopInternal 方法中首先设置了生命周期状态，然后调用 ProtocolHandler 的 stop 方法；
- 在 destroyInternal 方法中除了调用 ProtocolHandler 的 destroy 方法，还会将当前的 Connector 从 Service 中删除并调用父类的 destroyInternal 方法。



## 3、ProtocolHandler

Tomcat 8.5 中 ProtocolHandler 继承结构如图：



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211007170457.png)

ProtocolHandler 有一个抽象实现类 `AbstractProtocol`，AbstractProtocol 下面分了两种类型：Ajp、HTTP。

Ajp 是 Apache JServ Protocol 的缩写，Apache 的定向包协议，主要用于与前端服务器（如 Apache）进行通信，它是长连接，不需要每次通信都重新建立连接，这样就节省了开销；

HTTP 协议之前已经介绍过了，就不重复介绍了；

这里的 ProtocolHandler 以默认配置中的 org.apache.coyote.http11.Http11NioProtocol 为例来分析，它使用 HTTP1.1 协议，TCP 层使用 NioScoket 来传输数据。

Http11NioProtocol 的构造函数中创建了 `NioEndpoint` 类型的 Endpoint，并新建了 ConnectionHandler 类型的 Handler 然后设置到了 Endpoint，代码如下：

```java
// org.apache.coyote.http11.Http11NioProtocol

// Http11NioProtocol extends AbstractHttp11JsseProtocol extends AbstractHttp11Protocol
public Http11NioProtocol() {
    super(new NioEndpoint());
}

// org.apache.coyote.http11.AbstractHttp11Protocol
public AbstractHttp11Protocol(AbstractEndpoint<S> endpoint) {
    super(endpoint);
    setConnectionTimeout(Constants.DEFAULT_CONNECTION_TIMEOUT);
    ConnectionHandler<S> cHandler = new ConnectionHandler<>(this);
    setHandler(cHandler);
    getEndpoint().setHandler(cHandler);
}
```

四个生命周期方法是在父类 AbstractProtocol 中实现的，其中主要调用了 Endpoint 的生命周期方法



## 4、处理 TCP/IP 协议的 Endpoint

Endpoint 用于处理具体连接和传输数据，NioEndpoint 继承自 org.apache.tomcat.util.net.AbstractJsseEndpoint，AbstractJsseEndpoint 有继承自 org.apache.tomcat.util.net.AbstractEndpoint，在 NioEndpoint 中新增了内部类 `Poller` 和 `SocketProcessor`，NioEndpoint 中处理请求的具体流程如图所示：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211007170538.png)

NioEndpoint 的 init 和 start 方法在父类 AbstractEndpoint 中：

```java
// org.apache.tomcat.util.net.AbstractEndpoint

public void init() throws Exception {
    if (bindOnInit) {
        bind();
        bindState = BindState.BOUND_ON_INIT;
    }
	// JMX 相关操作 ......
}

public final void start() throws Exception {
    if (bindState == BindState.UNBOUND) {
        bind();
        bindState = BindState.BOUND_ON_START;
    }
    startInternal();
}
```

这两个方法主要调用 bind() 和 startInternal() 方法，它们是模板方法，在 NioEndpoint 中实现，bind 代码如下：

```java
// org.apache.tomcat.util.net.NioEndpoint

@Override
public void bind() throws Exception {

    if (!getUseInheritedChannel()) {
        // NioSocket 相关操作
        serverSock = ServerSocketChannel.open();
        socketProperties.setProperties(serverSock.socket());
        InetSocketAddress addr = (getAddress()!=null?new InetSocketAddress(getAddress(),getPort()):new InetSocketAddress(getPort()));
        serverSock.socket().bind(addr,getAcceptCount());
    } else {
        // Retrieve the channel provided by the OS
        Channel ic = System.inheritedChannel();
        if (ic instanceof ServerSocketChannel) {
            serverSock = (ServerSocketChannel) ic;
        }
        if (serverSock == null) {
            throw new IllegalArgumentException(sm.getString("endpoint.init.bind.inherited"));
        }
    }
    serverSock.configureBlocking(true); //mimic APR behavior

    // 初始化需要启动 acceptor 线程的个数，如果为 0 则改为 1，否则将不能工作
    if (acceptorThreadCount == 0) {
        acceptorThreadCount = 1;
    }
    // 初始化需要启动 poller 线程的个数，如果小于等于 0 则改为 1
    if (pollerThreadCount <= 0) {
        //minimum one poller thread
        pollerThreadCount = 1;
    }
    setStopLatch(new CountDownLatch(pollerThreadCount));

    // 如果需要则初始化 SSL
    initialiseSsl();

    selectorPool.open();
}
```

这里的 bind 方法中首先初始化了 ServerSocketChannel，然后检查了代表 Acceptor 和 Poller 初始化的线程数量的 acceptorThreadCount 属性和 pollerThreadCount 属性，它们至少为 1，`Acceptor` 用于接收请求，接收到请求后交给 `Poller` 处理，它们都是启动线程来处理的。另外如果需要还处理了初始化 SSL 等内容。



NioEndpoint 的 startInternal 方法代码如下：

```java
// org.apache.tomcat.util.net.NioEndpoint

@Override
public void startInternal() throws Exception {

    if (!running) {
        running = true;
        paused = false;

        processorCache = new SynchronizedStack<>(SynchronizedStack.DEFAULT_SIZE,
                                                 socketProperties.getProcessorCache());
        eventCache = new SynchronizedStack<>(SynchronizedStack.DEFAULT_SIZE,
                                             socketProperties.getEventCache());
        nioChannels = new SynchronizedStack<>(SynchronizedStack.DEFAULT_SIZE,
                                              socketProperties.getBufferPool());

        // 创建 Executor
        if (getExecutor() == null) {
            createExecutor();
        }

        initializeConnectionLatch();

        // 启动 poller 线程
        pollers = new Poller[getPollerThreadCount()];
        for (int i=0; i<pollers.length; i++) {
            pollers[i] = new Poller();
            Thread pollerThread = new Thread(pollers[i], getName() + "-ClientPoller-"+i);
            pollerThread.setPriority(threadPriority);
            pollerThread.setDaemon(true);
            pollerThread.start();
        }

        startAcceptorThreads();
    }
}
```

这里首先初始化了一些属性，然后启动了 Poller 和 Acceptor 来处理请求，初始化的属性中的 processorCache 属性是 `SynchronizedStack<SocketProcessorBase>` 类型，SocketProcessorBase 是一个抽象类实现了 Runnable 接口，NioEndpoint 中定义它的一个子类 `SocketProcessor`  作为内部类，SocketProcessor 并不是前面介绍的 Processor，Poller 接收到请求后就会交给它处理，SocketProcessor 又会将请求传递到 Handler。启动 Acceptor 的 startAcceptorThreads 方法在 AbstractEndpoint 中，代码如下：

```java
// org.apache.tomcat.util.net.AbstractEndpoint

protected final void startAcceptorThreads() {
    int count = getAcceptorThreadCount();
    acceptors = new Acceptor[count];

    for (int i = 0; i < count; i++) {
        acceptors[i] = createAcceptor();
        String threadName = getName() + "-Acceptor-" + i;
        acceptors[i].setThreadName(threadName);
        Thread t = new Thread(acceptors[i], threadName);
        t.setPriority(getAcceptorThreadPriority());
        t.setDaemon(getDaemon());
        t.start();
    }
}
```

这里的 getAcceptorThreadCount 方法就是获取的 init 方法中处理过的 acceptorThreadCount 属性，获取到后就会启动相应数量的 Acceptor 线程接收请求。

## 5、处理 HTTP 协议的 Processor

Processor 用于处理应用层协议（如 HTTP），它的继承结构如下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211007170635.png)



在 Processor 的继承体系中，正常处理协议使用的是 AbstractProcessor 及其实现类，而 UpgradeProcessorBase 及其实现类是用于处理 HTTP 的升级协议。

<mark>补充：tomcat 8.5.71 版本中 AbstractProcessor 扩充了 StreamProcessor 提供了对 HTTP2.0 的支持</mark>

当正常的 Processor 处理之后如果 Socket 的状态是 UPGRADING，那么 Endpoint 中的 Handler 就会接着创建并调用 upgrade 包下面的 Processor 进行处理，这里的 HTTP 升级协议指的是 WebSocket 协议。

<br />

AbstractProcessor 及其实现类和前面介绍的 ProtocolHandler 一一对应，这里就不详细解释了，具体应用层协议处理请求的是 AjpProcessor 和 Http11Processor 中的 service 方法（<mark>模板方法模式：公共算法部分是 AbstractProcessorLight 的 process 方法</mark>），这个方法解析了 HTTP 请求头并调用 Adapter 将请求传递到了 Container 中，最后对处理的结果进行了处理，封装到 Response 中返回。



## 6、适配器 Adapter

Adapter 只有一个实现类，就是 `org.apache.catalina.connector.CoyoteAdapter` 类。Processor 会在其 process 方法中调用 Adapter 的 service 方法（实质是在 process 调用模板方法 service，模板方法中调用 Adapter 的 service 方法）。

Adapter 的 service 方法主要是调用了  Container 管道中的 invoke 方法来处理请求，在处理之前对 Request 和 Response 做了处理，将原来创建的 org.apache.coyote 包下的 Request 和 Response 封装成了 org.apache.catalina.connector 的 Request 和 Response，并在处理完成后判断是否启动了 Comet（长连接推模式）和是否启动了异步请求，并作出相应处理。调用 Container 管道的相应代码片段如下：

```java
// org.apache.catalina.connector.CoyoteAdapter#process
connector.getService().getContainer().getPipeline().getFirst().invoke(
                        request, response);
```



这里首先从 Connector 中获取到 Service （Connector 在 initInternal 方法中创建 CoyoteAdapter 的时候已经将自己设置到了 CoyoteAdatper 中），然后从 Service 中获取 Container，接着获取管道，再获取管道的第一个 Value，最后调用 invoke 方法执行请求。

Service 中保存的是最顶层的容器，当调用最顶层容器管道的 invoke 方法时，管道将逐层调用各层容器的管道中 Value 的 invoke 方法，直到最后调用 Wrapper 的管道中的 BaseValue（StandardWrapperValue）来处理 Filter 和 Servlet。
