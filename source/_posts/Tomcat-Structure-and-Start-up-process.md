---
title: Tomcat Structure and Start-up process
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/4.jpg'
coverImg: /medias/featureimages/4.jpg
toc: true
date: 2021-10-05 10:58:43
top: false
cover: false
summary: Tomcat 顶层架构与启动过程分析
categories: Tomcat
keywords: Tomcat
tags: Tomcat
---

## Tomcat 顶层结构及启动过程

### 1、Tomcat 顶层结构

Tomcat 中最顶层的容器叫做 Server，代表整个服务器，Server 中包含至少一个 Service，用于提供具体服务。Service 主要包含两部分：Connector 和 Container。Connector 用于处理连接相关的事情，并提供 Socket 与 request、response 的转换，Container 用于封装和管理 Servlet，以及具体处理 request 请求。

一个 Tomcat 中只有一个 Server，一个 Server 可以包含多个 Service，一个 Service 只有一个 Container，但可以有多个 Connector（因为一个服务可以有多个连接，如同时提供 http 和 https 连接，也可以提供相同协议不同端口的连接），结构如下：
![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211005110712.png)

关于这一点，我们看看 Tomcat 的 server.xml 文件就可以看出个大概，下面是该文件的部分内容：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- Note:  A "Server" is not itself a "Container", so you may not
     define subcomponents such as "Valves" at this level.
     Documentation at /docs/config/server.html
 -->
<Server port="8005" shutdown="SHUTDOWN">
  <!-- 先加载启动日志服务 -->
  <Listener className="org.apache.catalina.startup.VersionLoggerListener"/>
  <!-- 然后加载安全安全服务和 apr(Apache Portable Runtime) 环境 -->
  <Listener SSLEngine="on" className="org.apache.catalina.core.AprLifecycleListener"/>
  <!-- Prevent memory leaks due to use of particular java/javax APIs-->
  <Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener"/>
  <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener"/>
  <Listener className="org.apache.catalina.core.ThreadLocalLeakPreventionListener"/>

  <GlobalNamingResources>
    <Resource auth="Container" description="User database that can be updated and saved" factory="org.apache.catalina.users.MemoryUserDatabaseFactory" name="UserDatabase" pathname="conf/tomcat-users.xml" type="org.apache.catalina.UserDatabase"/>
  </GlobalNamingResources>

  <Service name="Catalina">

    <Connector connectionTimeout="20000" port="8080" protocol="HTTP/1.1" redirectPort="8443"/>

    <Engine defaultHost="localhost" name="Catalina">
        
      <Realm className="org.apache.catalina.realm.LockOutRealm">
        <Realm className="org.apache.catalina.realm.UserDatabaseRealm" resourceName="UserDatabase"/>
      </Realm>

      <Host appBase="webapps" autoDeploy="true" name="localhost" unpackWARs="true">
        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs" pattern="%h %l %u %t &quot;%r&quot; %s %b" prefix="localhost_access_log" suffix=".txt"/>
      	<Context docBase="E:\apache-tomcat-9.0.35\webapps\Java_Web_Experiment" path="/Java_Web_Experiment" reloadable="true" source="org.eclipse.jst.jee.server:Java_Web_Experiment"/>
       </Host>
    </Engine>
  </Service>
</Server>
```

<mark>总结：一个 Server 下有多个 Service 共享服务器上的 JVM 环境，每个 Service 中有多个 Connector 和 一个 Container</mark>

<br />

Tomcat 里的 Server 由 `org.apache.catalina.startup.Catalina` 来管理，Catalina 是整个 Tomcat 的管理类，它里面的三个方法：load、start、stop 分别用来管理整个服务器的生命周期：

- load 方法用于根据 `conf/server.xml` 文件创建 Server 并调用 Server 的 init 方法进行初始化
- start 方法用于启动服务器
- stop 方法用于停止服务器

start 和 stop 方法在内部分别调用了 Server 的 start 和 stop 方法，load 方法内部调用了 Server 的 init 方法，这三个方法都会按容器的结构逐层调用相应的方法，比如 Server 的 start 方法中会调用所有 Service 中的 start 方法，Service 中的 start 方法会调用所有包含的 Connectors 和 Container 中的 start 方法，这样整个服务器就启动了，init 和 stop 也是一样，这就是 Tomcat 生命周期的管理方式。



Catalina 还有个方法也很重要，就是 await 方法，Catalina 中的 await 方法直接调用 Server 的 await 方法，这个方法的作用是进入一个循环，让主线程不会退出。



不过 Tomcat 的入口 main 方法不在 Catalina 类里，而是在 `org.apache.catalina.startup.Bootstrap` 中。Bootstrap 的作用类似于一个 `CatalinaAdaptor`（<mark>适配器模式</mark>），具体处理过程还是使用 Catalina 来完成的，这么做的好处是可以把启动的入口和具体的管理类分开，从而可以很方便的创建出多种启动方式，每种启动方式只需要写一个相应的 CatalinaAdaptor 就可以了。 



### 2、Bootstrap 启动过程

Bootstrap 是 Tomcat 的入口，正常情况下启动 Tomcat 就是调用 Bootstrap 的 main 方法，代码如下：

```java
// org.apache.catalina.startup.Bootstrap

// Daemon object used by main.
private static final Object daemonLock = new Object();
private static volatile Bootstrap daemon = null;

// Daemon reference
private Object catalinaDaemon = null;

public static void main(String args[]) {
	// 先创建一个 Bootstrap 实例
    synchronized (daemonLock) {
        if (daemon == null) {
            // Don't set daemon until init() has completed
            Bootstrap bootstrap = new Bootstrap();
            try {
                // 初始化了 ClassLoader，并用 ClassLoader 创建了 Catalina 实例，赋给 catalinaDaemon 变量
                bootstrap.init();
            } catch (Throwable t) {
                handleThrowable(t);
                t.printStackTrace();
                return;
            }
            daemon = bootstrap;
        } else {
            // When running as a service the call to stop will be on a new
            // thread so make sure the correct class loader is used to
            // prevent a range of class not found exceptions.
            Thread.currentThread().setContextClassLoader(daemon.catalinaLoader);
        }
    }

    try {
        String command = "start";
        if (args.length > 0) {
            command = args[args.length - 1];
        }

        if (command.equals("startd")) {
            args[args.length - 1] = "start";
            daemon.load(args);
            daemon.start();
        } else if (command.equals("stopd")) {
            args[args.length - 1] = "stop";
            daemon.stop();
        } else if (command.equals("start")) {
            daemon.setAwait(true);
            daemon.load(args);
            daemon.start();
            if (null == daemon.getServer()) {
                System.exit(1);
            }
        } else if (command.equals("stop")) {
            daemon.stopServer(args);
        } else if (command.equals("configtest")) {
            daemon.load(args);
            if (null == daemon.getServer()) {
                System.exit(1);
            }
            System.exit(0);
        } else {
            log.warn("Bootstrap: command \"" + command + "\" does not exist.");
        }
    } catch (Throwable t) {
        // Unwrap the Exception for clearer error reporting
        if (t instanceof InvocationTargetException &&
            t.getCause() != null) {
            t = t.getCause();
        }
        handleThrowable(t);
        t.printStackTrace();
        System.exit(1);
    }
}
```

main 方法非常简单，就做了两件事：首先实例化了 Bootstrap，然后执行 init 方法初始化 Catalina 实例；最后处理 main 方法传入的命令，如果 args 参数为空，默认执行 start。

在 init 方法中初始化了 ClassLoader，并用 ClassLoader 创建了 Catalina （`org.apache.catalina.startup.Catalina`）实例，然后赋给 CatalinaDaemon 变量，后面对命令的操作都需要使用 catalinaDaemon 来具体执行。

对 **start** 命令的处理调用了三个方法：

- `setAwait(true)`
- `load(args)`
- `start()`

这三个方法内部都调用了 Catalina 的相应方法进行具体操作，只不过是用反射来调用的。这里以 start 方法为例（其余两个类似）：

```java
// org.apache.catalina.startup.Bootstrap
// Start the Catalina daemon
public void start() throws Exception {
    // 如果在 main 方法中没有成功调用 init() 初始化 CatalinaDaemon，这里再次调用
    if (catalinaDaemon == null) {
        init();
    }
	
    // 使用反射调用目标对象的方法
    Method method = catalinaDaemon.getClass().getMethod("start", (Class [])null);
    method.invoke(catalinaDaemon, (Object [])null);
}
```

[Java 反射和注解](https://naivekyo.github.io/2021/08/28/java-annotation-and-reflection/)

Method 对象代表目标 class 对象的一个方法，这里获取的是没有参数的名为 start 的方法，invoke 是执行该方法的意思。



### 3、Catalina 启动过程

从前面的内容（main 方法）可知，Catatlina 启动主要是调用 setAwait、load、start 方法来完成的，setAwait 方法用于设置 Server 启动完成后是否进入等待状态的标志，如果为 true 则进入，否则不进入；load 方法用于加载配置文件，创建并初始化 Server；start 方法用于启动服务器。

> setAwait 方法

```java
// org.apache.catalina.startup.Bootstrap#main()
} else if (command.equals("start")) {
    // 设置 await 为 true
    daemon.setAwait(true);
    // 创建 server
    daemon.load(args);
    // 启动服务器
    daemon.start();
    if (null == daemon.getServer()) {
        System.exit(1);
    }
}

// org.apache.catalina.startup.Bootstrap#setAwait(boolean await)
public void setAwait(boolean await)
    throws Exception {

    Class<?> paramTypes[] = new Class[1];
    paramTypes[0] = Boolean.TYPE;
    Object paramValues[] = new Object[1];
    paramValues[0] = Boolean.valueOf(await);
    Method method =
        catalinaDaemon.getClass().getMethod("setAwait", paramTypes);
    method.invoke(catalinaDaemon, paramValues);
}

// org.apache.catalina.startup.Catalina#setAwait(boolean b)
public void setAwait(boolean b) {
    await = b;
}
```

这个方法就是设置 await 属性的值，await 属性会在 start 方法中的服务器启动完之后使用它来判断是否进入等待状态。

> init() 方法

Catalina 的 load 方法根据 conf/server.xml 创建了 Server 对象，并赋值给 server 属性（具体解析 xml 是由开源项目 Digester 完成的），然后调用了 server 的 init 方法，代码如下：

```java
// org.apache.catalina.startup.Catalina
public void load() {

    if (loaded) {
        return;
    }
    loaded = true;

    long t1 = System.nanoTime();

    // 中间省略使用 Degister 解析 xml 创建 server 的代码

    // Start the new server
    try {
        getServer().init();
    } catch (LifecycleException e) {
        if (Boolean.getBoolean("org.apache.catalina.startup.EXIT_ON_INIT_FAILURE")) {
            throw new java.lang.Error(e);
        } else {
            log.error("Catalina.start", e);
        }
    }

    long t2 = System.nanoTime();
    if(log.isInfoEnabled()) {
        // 启动过程中，控制台可以看到
        log.info("Initialization processed in " + ((t2 - t1) / 1000000) + " ms");
    }
}
```

Catalina 的 start 方法主要调用了 server 的 start 方法启动服务器，并根据 await 属性判断是否让程序进入等待状态：

```java
// org.apache.catalina.startup.Catalina
public void start() {

    // 两次检查 server 实例是否被创建
    if (getServer() == null) {
        load();
    }

    if (getServer() == null) {
        log.fatal("Cannot start server. Server instance is not configured.");
        return;
    }

    long t1 = System.nanoTime();

    // Start the new server
    try {
        // 调用 Server 的 start 方法启动服务器
        getServer().start();
    } catch (LifecycleException e) {
        log.fatal(sm.getString("catalina.serverStartFail"), e);
        try {
            getServer().destroy();
        } catch (LifecycleException e1) {
            log.debug("destroy() failed for failed Server ", e1);
        }
        return;
    }

    long t2 = System.nanoTime();
    if(log.isInfoEnabled()) {
        log.info("Server startup in " + ((t2 - t1) / 1000000) + " ms");
    }

    // 省略了注册关闭钩子的代码

    // 进入等待状态
    if (await) {
        await();
        stop();
    }
}
```

这里首先判断 Server 是否已经存在了，如果不存在就调用 load 方法来初始化 Server，然后调用 Server 的 start 方法来启动服务器，最后注册了关闭钩子并根据 await 属性判断是否进入了等待状态，之前我们已经将 await 设置为 true，所以需要进入等待状态。进入等待状态会调用 await 和 stop 方法，await 方法直接调用 Server 的 await 方法，Server 的 await 方法内部会执行一个 while 循环，这样程序就停到了 await 方法，当 await 方法里的 while 循环退出时，将会执行 stop 方法，从而关闭服务器。



### 4、Server 启动过程

- `org.apache.catalina.Server`

```java
public interface Server extends Lifecycle {}
```

Server 是一个接口，代表整个 Catalina Servlet 容器。

Server 接口中提供 `addService(Service service)`、`removeService(Service service)` 来添加和删除 Service，Server 的 init 方法和 start 方法分别循环调用了每个 Service 的 init 方法和 start 方法来启动所有 Service。

Server 的默认实现是 `org.apache.catalina.core.StandardServer`，StandardServer 继承自 LifecycleMBeanBase，LifecycleMBeanBase 又继承自 LifecycleBase，init 和 start 方法就定义在了 LifecycleBase 中，LifecycleBase 里的 init 方法和 start 方法又调用了 initInternal 方法和 startInternal 方法，这两个方法都是模板方法（<mark>模板方法模式</mark>），由子类具体实现，所以调用 StandardServer 的 init 和 start 方法会执行 StandardServer 自己的 initInternal 和 startInternal 方法，这就是 Tomcat 生命周期的管理方式。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211005110909.png)

StandardServer 中的 initInternal 和 startInternal 方法分别循环调用了每一个 Service 的 start 和 init 方法。

```java
// org.apache.catalina.core.StandardServer
@Override
protected void startInternal() throws LifecycleException {
	
    // Start our defined Services
    synchronized (servicesLock) {
        for (Service service : services) {
            service.start();
        }
    }
}

@Override
protected void initInternal() throws LifecycleException {
	
    // ......
    // Initialize our defined Services
    for (Service service : services) {
        service.init();
    }
}
```

除了 startInternal 和 initInternal 方法，StandardServer 中还实现了 await 方法，Catalina 中就是调用它让服务器进入等待状态的，其核心代码如下： 

```java
@Override
public void await() {
    // 如果端口为 -2 表示不进入循环，Tomcat 为嵌入式的或者不需要使用端口
    if (port == -2) {
        // undocumented yet - for embedding apps that are around, alive.
        return;
    }
    // 如果端口为 -1 则进入循环，而且无法通过网络退出
    if (port==-1) {
        try {
            awaitThread = Thread.currentThread();
            while(!stopAwait) {
                try {
                    Thread.sleep( 10000 );
                } catch( InterruptedException ex ) {
                    // continue and check the flag
                }
            }
        } finally {
            awaitThread = null;
        }
        return;
    }

    // 如果端口不是 -1 或 -2（应该大于0），则会新建一个监听关闭命令的 ServerSocket	
    try {
        awaitSocket = new ServerSocket(port, 1,
                                       InetAddress.getByName(address));
    } 

    try {
        awaitThread = Thread.currentThread();

        // Loop waiting for a connection and a valid command
        while (!stopAwait) {
            ServerSocket serverSocket = awaitSocket;
            if (serverSocket == null) {
                break;
            }

            // Wait for the next connection
            Socket socket = null;
            StringBuilder command = new StringBuilder();
            try {
                InputStream stream;
                long acceptStartTime = System.currentTimeMillis();
                try {
                    socket = serverSocket.accept();
                    socket.setSoTimeout(10 * 1000);  // Ten seconds
                    stream = socket.getInputStream();
                } // ......
                
            }
            // 检查在指定端口接收到的命令是否和 shutdown 命令匹配
            boolean match = command.toString().equals(shutdown);
            if (match) {
                // 如果匹配就跳出循环
                log.info(sm.getString("standardServer.shutdownViaPort"));
                break;
            } else {
                log.warn(sm.getString("standardServer.invalidShutdownCommand", command.toString()));
            }
        }
    }
}
```

由于该方法比较长，所以省略了一些处理异常、关闭 Socket 以及对接收到数据处理的代码。

处理的逻辑大概是首先判断端口号 port，然后根据 port 的值分为三种处理方法：

- port 为 -2，直接退出，不进入循环
- port 为 -1，进入一个 while（!stopAwait）的循环，并且在内部没有 break 跳出的语句，stopAwait 标志只有调用了 stop 方法才会设置为 true，所以 port 为 -1 时只有外部调用 stop 方法才会退出循环
- port 为其他值，也会进入一个 while（!stopAwait）的循环，不过同时会在 port 所在端口启动一个 ServerSocket 监听关闭命令，如果接收到则会使用 break 跳出循环。

这里的端口 port 和关闭命令 shutdown 是在 conf/server.xml 文件中配置 Server 时设置的，默认配置如下：

```xml
<Server port="8005" shutdown="SHUTDOWN">
```

这时会在 8005 端口监听 "SHUTDOWN" 命令，如果接收到了就会关闭 Tomcat，如果不想使用网络命令来关闭服务器可以将端口设置为 -1，另外 await 方法中从端口接收到数据后还会进行简单处理，如果接收到的数据中有 ASCII 码小于 32 的（ASCII 中 32 以下的为控制符）则会从小于 32 的那个字符截断并丢弃后面的数据。

### 5、Service 启动过程

Service 是一个接口，主要用于处理请求，内部包含一个或一组 Connectors 和一个 Conatiner。

它的标准实现是：`org.apache.catalina.core.StandardService`，StandardService 也继承自 LifecycleMBeanBase 类，所以 init 和 start 方法最终也会调用 initInternal 和 startInternal 方法。

```java
@Override
protected void initInternal() throws LifecycleException {

    super.initInternal();

    if (engine != null) {
        engine.init();
    }

    // Initialize any Executors
    for (Executor executor : findExecutors()) {
        if (executor instanceof JmxEnabled) {
            ((JmxEnabled) executor).setDomain(getDomain());
        }
        executor.init();
    }

    // Initialize mapper listener
    mapperListener.init();

    // Initialize our defined Connectors
    synchronized (connectorsLock) {
        for (Connector connector : connectors) {
            try {
                connector.init();
            }
        }
    }
}

@Override
protected void startInternal() throws LifecycleException {

    setState(LifecycleState.STARTING);

    // Start our defined Container first
    if (engine != null) {
        synchronized (engine) {
            engine.start();
        }
    }

    synchronized (executors) {
        for (Executor executor: executors) {
            executor.start();
        }
    }

    mapperListener.start();

    // Start our defined Connectors second
    synchronized (connectorsLock) {
        for (Connector connector: connectors) {
            try {
                // If it has already failed, don't try and start it
                if (connector.getState() != LifecycleState.FAILED) {
                    connector.start();
                }
            }
        }
    }
}
```

可以看出 StandardService 中的 initInternal 和 startInternal 方法主要调用 container、executors、mapperListener、connectors 的 init 和 start 方法。

这里的 connectors 和 container 之前已经介绍过：

- mapperListener：是 Mapper 的监听器，可以监听 container 容器的变化
- executors：是用在 connectors 中管理线程的线程池，在 server.xml 配置文件中有参考用法，不过默认是注释起来的，打开注释就可以看到其使用方法

```xml
<Service name="Catalina">

    <!--The connectors can use a shared executor, you can define one or more named thread pools-->
    <Executor name="tomcatThreadPool" namePrefix="catalina-exec-"
        maxThreads="150" minSpareThreads="4"/>
    
    <!-- A "Connector" represents an endpoint by which requests are received
         and responses are returned. Documentation at :
         Java HTTP Connector: /docs/config/http.html
         Java AJP  Connector: /docs/config/ajp.html
         APR (HTTP/AJP) Connector: /docs/apr.html
         Define a non-SSL/TLS HTTP/1.1 Connector on port 8080
    -->
    <Connector connectionTimeout="20000" port="8080" protocol="HTTP/1.1" redirectPort="8443"/>
    
    <!-- A "Connector" using the shared thread pool-->
    <Connector executor="tomcatThreadPool"
               port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />
</Service>
```

这样 Connector 就配置了一个叫做 tomcatThreadPool 的线程池，最多可以同时启动 150 个线程，最少要有 4 个可用线程，现在整个 Tomcat 就启动了，整个启动流程如下：

### 6、Tomcat 启动流程时序图



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211005110943.png)

