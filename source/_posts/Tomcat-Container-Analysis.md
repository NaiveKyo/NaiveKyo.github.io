---
title: Tomcat Container Analysis
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/17.jpg'
coverImg: /medias/featureimages/17.jpg
toc: true
date: 2021-10-06 22:21:09
top: false
cover: false
summary: Tomcat 容器接口 Container 浅析
categories: Tomcat
keywords: Tomcat
tags: Tomcat
---

# Container 分析

## 1、ContainerBase 的结构

Container 是 Tomcat 容器的接口，通常使用的 Servlet 就封装在其子接口 Wrapper 中。

Container 一共有 4 个子接口 Engine、Host、Context、Wrapper 和一个默认实现类 ContainerBase，每个子接口都是一个容器，这 4 个子容器都由一个对应的 StandardXXX 实现类，并且这些实现类都继承 ContainerBase 类。另外 Container 还继承 Lifecycle 接口，而且 ContainerBase 间接继承 LifecycleBase，所以 Engine、Host、Context、Wrapper 4 个子容器都符合前面讲过的 Tomcat 生命周期管理模式，结构图如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211006222315.png)

## 2、Container 的四个子容器

Container 的四个子容器：Engine、Host、Context、Wrapper 是逐层包含的关系，其中 Engine 是最顶层，每个 Service 最多只能有一个 Engine，Engine 里面可以有多个 Host，每个 Host 下可以有多个 Context，每个 Context 下可以有多个 Wrapper，它们的装配关系如下:

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211006222344.png)



四个容器的作用分别是：

- Engine：引擎，用来管理多个站点，一个 Service 最多只能有一个 Engine
- Host：代表一个站点，也可以叫做虚拟主机，通过配置 Host 就可以添加站点
- Context：代表一个应用程序，对应着平时开发的一套程序，或者一个 WEB-INF 目录及下面的 web.xml 文件
- Wrapper：每个 Wrapper 封装着一个 Servlet



Context 和 Host 的区别是 Context 表示一个应用，比如，默认设置下 webapps 下的每一个目录都是一个应用，其中 ROOT 目录中存放着主应用，其他目录存放着别的子应用，而整个 webapps 是一个站点。假如 www.xxx.com 域名对应着 webapps 目录所代表的站点，其中的 ROOT 目录里的应用就是主应用，访问时直接使用域名就可以，而 webapps/test 目录存放的是 test 子应用，访问时需要用 www.xxx.com/test，每一个应用对应一个 Context，所有 webapps 下的应用都属于 www.xxx.com 站点，而 blog.xxx.com 则是另外一个站点，属于另外一个 Host。

## 3、4 种容器的配置方法

> Engine 和 Host 的配置方法

Engine 和 Host 的配置都是在 conf/server.xml 中，server.xml 文件是 Tomcat 中最重要的配置文件，Tomcat 的大部分功能都可以在这个文件中配置，比如下面是简化了的默认配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Server port="8005" shutdown="SHUTDOWN">

  <Service name="Catalina">

    <Connector connectionTimeout="20000" port="8080" protocol="HTTP/1.1" redirectPort="8443"/>
    <Connector protocol="AJP/1.3"
                 address="::1"
                 port="8009"
                 redirectPort="8443" />
      
    <Engine defaultHost="localhost" name="Catalina">
        
      <Host appBase="webapps" autoDeploy="true" name="localhost" unpackWARs="true">
      	<Context docBase="E:\apache-tomcat-9.0.35\webapps\Java_Web_Experiment" path="/Java_Web_Experiment" reloadable="true" source="org.eclipse.jst.jee.server:Java_Web_Experiment"/>
       </Host>
    </Engine>
  </Service>
</Server>
```

这里定义了一个 Server，在 8005 端口监听关闭命令 "SHUTDOWN"；

Server 里定义了一个名为 Catalina 的 Service；

Service 里定义了两个 Connector，一个是 HTTP 协议，一个是 AJP 协议，AJP 主要用于集成（比如和 Apache 集成）；

Service 里还定义了一个名为 Catalina 的 Engine；

Engine 里面定义了一个名为 localhost 的 Host。



Engine 和 Host 直接用 Engine、Host 标签定义到相应位置就可以了。Host 标签中的 name 属性代表域名，所以上面定义的站点可以通过 localhost 访问，appBase 属性指定站点的位置，比如，上面定义的站点就是默认的 webapps 目录，unpackWARS 属性表示是否自动解压 war 文件，autoDeploy 属性表示是否自动部署，如果 autoDeploy 为 true 那么 Tomcat 在运行过程中会在 webapps 目录中加入新的应用会自动部署并启动。另外 Host 还可以有一个 Alias 子标签，可以通过这个标签来定义别名，如果多个域名访问同一个站点就可以这么定义，如 www.aaa.com 和 www.bbb.com 要访问同一个站点，可以这一配置：

```xml
<Host name="www.aaa.com" appBase="/hosts/aaa.com" autoDeploy="true" unpackWARs="true">
	<Alias>www.bbb.com</Alias>
</Host>
```

Engine 在定义的时候有一个 defaultHost 属性，它表示接收到请求的域名如果在所有的 Host 的 name 和 Alias 中都找不到时使用默认的 Host，另外这 Host 的名称也是默认和 IP 关联的，比如上面的用 localhost 和 127.0.0.1 都可以访问。

> Context 的配置方法

Context 有三种配置方法：

1. 通过文件配置；
2. 将 WAR 应用直接放到 Host 目录下，Tomcat 会自动查找并添加到 Host 中；
3. 将应用的文件夹放到 Host 目录下，Tomcat 也会自动查找并添加到 Host



文件配置：

一共有 5 个位置可以配置：

- conf/server.xml 文件中的 Context 标签
- conf/[enginename]/[hostname]/ 目录下以应用命名的 xml 文件
- 应用自己的 /META-INF/context.xml 文件
- conf/context.xml 文件
- conf/[enginename]/[hostname]/context.xml.default 文件

其中前三个位置用于配置单独的应用，后两个配置的 Context 是共享的，conf/context.xml 文件中配置的内容在整个 Tomcat 中共享，第 5 种配置的内容在对应的站点（Host）中共享。

另外，因为 conf/server.xml 文件只有在 Tomcat 重启的时候才会重新加载，所以**第一种配置方法不推荐使用。**



> Wrapper 的配置

Wrapper 的配置就是我们在 web.xml 中配置的 Servlet，一个 Servlet 对应一个 Wrapper。另外也可以在 conf/web.xml 中配置全局的 Wrapper，处理 Jsp 的 JspServlet 就配置在这里，所以不需要自己配置 Jsp 就可以处理 Jsp 请求了。



> 注意

同一个 Service 下的所有站点共享 Connector，所以监听的端口都一样。如果想要添加监听不同端口的站点，可以通过不同的 Service 来配置，Service 也是在 conf/server.xml 文件中配置的。

## 4、Container 的启动

Container 的启动是通过 init 和 start 方法来完成的，前面已经分析过这两个方法会在 Tomcat 启动时被 Service 调用。Container 也是按照 Tomcat 的生命周期来管理的，init 和 start 方法也会调用 initInternal 和 startInternal 模板方法来具体处理，不过 Container 和前面讲的 Tomcat 整体结构启动的过程稍微有点不一样，主要有三点区别：

- Container 的 4 个子容器有一个共同的父类 `ContainerBase`，这里定义了 Container 容器的 initInternal 和 startInternal 方法通用处理内容，具体容器还可以添加自己的内容；
- 除了最顶层容器的 init 是被 Service 调用的，子容器的 init 方法并不是在容器中逐层循环调用的，而是在执行 start 方法的时候通过状态判断还没有初始化才会调用；
- start 方法除了在父容器的 startInternal 方法中调用，还会在父容器的添加子容器的 addChild 方法中调用，这主要是因为 Context 和 Wrapper 是动态添加的，我们在站点目录下放一个应用的文件夹或者 war 包就可以添加一个 Context，在 web.xml 文件中配置一个 Servlet 就可以添加一个 Wrapper，所以 Context 和 Wrapper 是在容器启动的过程中才动态查找出来添加到相应的父容器中的。



先分析 Container 的基础实现类 ContainerBase 中的 initInternal 和 startInternal 方法，然后再对具体容器进行分析。

### 4.1、ContainerBase

ContainerBase 的 initInternal 方法主要初始化 ThreadPoolExecutor 类型的 startStopExecutor 属性，用于管理启动和关闭的线程，代码如下：

```java
// org.apache.catalina.core.ContainerBase

@Override
protected void initInternal() throws LifecycleException {
    BlockingQueue<Runnable> startStopQueue = new LinkedBlockingQueue<>();
    startStopExecutor = new ThreadPoolExecutor(
        getStartStopThreadsInternal(),
        getStartStopThreadsInternal(), 10, TimeUnit.SECONDS,
        startStopQueue,
        new StartStopThreadFactory(getName() + "-startStop-"));
    startStopExecutor.allowCoreThreadTimeOut(true);
    super.initInternal();
}
```

ThreadPoolExecutor 继承自 Executor 用于管理线程，特别是 Runnable 类型的线程。另外需要注意的是，这里并没有设置生命周期的相应状态，所以如果具体容器也没有设置相应生命周期状态，那么即使已经调用 init 方法进行了初始化，在 start 进行启动前也会再次调用 init 方法。



ContainerBase 的 startInternal 方法主要做了 5 件事：

- 如果有 Cluster 和 Realm 则调用其 start 方法
- 调用所有子容器的 start 方法启动子容器
- 调用管道中 Value 的 start 方法来启动管道
- 启动完成后将生命周期状态设置为 LifecycleState.STARTING 状态
- 启用后台线程定时处理一些事情

代码如下：

```java
// org.apache.catalina.core.ContainerBase

@Override
protected synchronized void startInternal() throws LifecycleException {

    // Start our subordinate components, if any
    logger = null;
    getLogger();
    
    // 如果有 Cluster 和 Realm 则启动
    Cluster cluster = getClusterInternal();
    if (cluster instanceof Lifecycle) {
        ((Lifecycle) cluster).start();
    }
    Realm realm = getRealmInternal();
    if (realm instanceof Lifecycle) {
        ((Lifecycle) realm).start();
    }

    // 获取所有子容器
    Container children[] = findChildren();
    List<Future<Void>> results = new ArrayList<>();
    for (Container child : children) {
        // 这里通过线程调用子容器的 start 方法，相当于 child.start();
        results.add(startStopExecutor.submit(new StartChild(child)));
    }

    MultiThrowable multiThrowable = null;
	// 处理子容器启动线程的 Future
    for (Future<Void> result : results) {
        try {
            result.get();
        } catch (Throwable e) {
            log.error(sm.getString("containerBase.threadedStartFailed"), e);
            if (multiThrowable == null) {
                multiThrowable = new MultiThrowable();
            }
            multiThrowable.add(e);
        }
    }
    if (multiThrowable != null) {
        throw new LifecycleException(sm.getString("containerBase.threadedStartFailed"),
                                     multiThrowable.getThrowable());
    }

    // 启动管道
    if (pipeline instanceof Lifecycle) {
        ((Lifecycle) pipeline).start();
    }

    // 将生命周期状态设置为 LifecycleState.STARTING
    setState(LifecycleState.STARTING);

    // 启动后台线程
    threadStart();
}
```

这里先判断是否需要启动 Cluster 和 Realm，启动方法是调用它们的 start 方法。Cluster 用于配置集群，在 server.xml 中有注释的参考配置，它的作用是同步 Session，Realm 是 Tomcat 的安全域，可以用来管理资源的访问权限。

子容器是使用 startStopExecurtor 调用新线程启动的，这样可以用多个线程来同时启动，效率更高，具体启动过程是通过一个增强 for 循环对每个姿容启动了一个线程，并将返回的 Future 保存到一个 List 中，然后遍历每个 Futrue 并调用其 get 方法。

遍历 Futrue 主要有两个作用：

- 其 get 方法是阻塞的，只有线程处理完之后才会向下走，这就保证了管道 Pipeline 启动之前容器已经启动完成了；
- 可以处理启动过程中遇到的异常。

启动子容器的线程类型 StartChild 是一个实现了 Callable 的内部类，主要作用就是调用子容器的 start 方法：

```java
// org.apache.catalina.core.ContainerBase

private static class StartChild implements Callable<Void> {

    private Container child;

    public StartChild(Container child) {
        this.child = child;
    }

    @Override
    public Void call() throws LifecycleException {
        child.start();
        return null;
    }
}
```

因为这里的 startInternal 方法是定义在所有容器的父类 ContainerBase 中的，所以所有容器启动的过程都会调用子容器的 start 方法来启动子容器（模板方法模式）。

使用多线程在实际运行过程中可以提高效率，但调试起来比较麻烦，在调试分析 Tomcat 代码的过程中可以直接调用子容器的 start 方法，也就是将上面的：

```java
for (Container child : children) {
    // 这里通过线程调用子容器的 start 方法，相当于 child.start();
    results.add(startStopExecutor.submit(new StartChild(child)));
}

// 改为：
for (Container child : children) {
  	child.start();
}
```

这样调试起来会简单一些，Future 相关的代码可以暂时注释起来。

子容器启动完成后就该启动容器的管道了，管道启动也是直接调用 start 方法来完成的。管道启动之后设置了生命周期的状态，然后调用 threadStart 方法启动了后台线程。



threadStart 方法启动的后台线程是一个实现了 Runnable 接口的内部类，这个线程会执行一个 while 循环，内部定期调用 processChildren 方法做一些事情，间隔时间的长短是通过 ContainerBase 的 backgroundProcessorDelay 属性来设置的，单位是秒，如果小于 0 就不启动后台线程了，processChildren  方法是该内部类的方法，其内部调用了传入的容器的 backgroundProcess 方法。

backgroundProcess 方法是 Container 接口中的一个方法，一共有 4 个实现，其中三个是 ContainerBase、StandardContext、StandardWrapper，还有一个 FailedContext。

- ContainerBase 中提供了所有容器共同的处理过程，StandardContext 和 StandardWrapper 的 backgroundProcess 方法除了处理自己相关的业务，也调用了 ContainerBase 的处理。

- ContainerBase 的 backgroundProcess 方法中调用了 Cluster、Realm 和管道的 backgroundProcess 方法；

- StandardContext 的 backgroundProcess 方法中对 Session 过期和资源变化进行了处理；

- StandardWrapper 的 backgroundProcess 方法回对 Jsp 生成的 Servlet 定期进行检查。



### 4.2、Engine

Service 会调用最顶层容器的 init 和 start 方法，如果使用了 Engine 就会调用 Engine 的。

Engine 的默认实现了 StandardEngine 中的 initInternal 和 startInternal 方法如下：

```java
// org.apache.catalina.core.StandardEngine

@Override
protected void initInternal() throws LifecycleException {
    // Ensure that a Realm is present before any attempt is made to start
    // one. This will create the default NullRealm if necessary.
    getRealm();
    // 调用 ContainerBase 的 initInternal 方法
    super.initInternal();
}

@Override
protected synchronized void startInternal() throws LifecycleException {

    // Log our server identification information
    if (log.isInfoEnabled()) {
        log.info(sm.getString("standardEngine.start", ServerInfo.getServerInfo()));
    }

    // Standard container startup
    super.startInternal();
}
```

它们分别调用了 ContainerBase 中相应的方法，initInternal 还调用了 getRealm 方法，其作用是如果没有配置 Realm，就使用一个默认的 NullRealm。



### 4.3、Host

Host 的默认实现类是 StandardHost 没有重写 initInternal 方法，初始化默认调用 ContainerBase 的 initInternal 方法，startInternal 方法如下：

```java
// org.apache.catalina.core.StandardHost
@Override
protected synchronized void startInternal() throws LifecycleException {

    // 如果管道中没有 ErrorReportValve 就将其加入管道
    String errorValve = getErrorReportValveClass();
    if ((errorValve != null) && (!errorValve.equals(""))) {
        try {
            boolean found = false;
            Valve[] valves = getPipeline().getValves();
            for (Valve valve : valves) {
                if (errorValve.equals(valve.getClass().getName())) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                Valve valve =
                    (Valve) Class.forName(errorValve).getConstructor().newInstance();
                getPipeline().addValve(valve);
            }
        } catch (Throwable t) {
            ExceptionUtils.handleThrowable(t);
            log.error(sm.getString(
                "standardHost.invalidErrorReportValveClass",
                errorValve), t);
        }
    }
    super.startInternal();
}
```

这里代码看起来很多，但功能却非常简单，就是检查 Host 的管道中有没有指定的 Value，如果没有就添进去。检查的方法就是遍历所有 Value 然后通过名字判断，检查的 Value 的类型通过 getErrorReportValueClass 方法获取，它返回 errorReportValueClass 属性，可以配置，默认值是 org.apache.catalina.values.ErrorReportValue：

```java
// org.apache.catalina.core.StandardHost

private String errorReportValveClass = "org.apache.catalina.valves.ErrorReportValve";

public String getErrorReportValveClass() {
    return this.errorReportValveClass;
}
```

这就是 StandardHost 的 startInternal 方法处理的过程。Host 的启动除了 startInternal 方法，还有 HostConfig 中相应的方法，HostConfig 继承自 LifecycleListener 的监听器（Engine 也有对应的 EngineConfig 监听器，只不过里面只是简单的做了日志记录），在接收到 Lifecycle.START_EVENT 事件时会调用 start 方法来启动，HostConfig 的 start 方法会检查配置的 Host 站点配置的位置是否存在以及是不是目录，最后调用 deployApps 方法部署应用，deployApps 方法代码如下:

```java
// org.apache.catalina.startup.HostConfig
protected void deployApps() {
    File appBase = host.getAppBaseFile();
    File configBase = host.getConfigBaseFile();
    String[] filteredAppPaths = filterAppPaths(appBase.list());
    // 部署 XML 描述文件
    deployDescriptors(configBase, configBase.list());
    // 部署 WAR 文件
    deployWARs(appBase, filteredAppPaths);
    // 部署文件夹
    deployDirectories(appBase, filteredAppPaths);
}
```

一共三种部署方式：通过 XML 描述文件、通过 WAR 文件和通过文件夹部署。

XML 文件指 conf/[enginename]/[hostname]/*.xml 文件，WAR 文件和文件夹是指 Host 站点目录下的 WAR 文件和文件夹，这里会自动找出来并部署上，所以我们如果要添加应用只需要直接放在 Host 站点的目录下就可以了。

部署完成后，会将部署的 Context 通过 StandardHost 的 addChild 方法添加到 Host 里面。StandHost 的 addChild 方法会调用父类 ContainerBase 的 addChild 方法，其中会调用子类（这里指 Context）的 start 方法来启动子容器。



### 4.4、Context

Context 的默认实现类 StandardContext 在 startInternal 方法中调用了 web.xml 中定义的 Listener，另外还初始化了其中的 Filter 和 load-on-startup 的 Servlet，代码如下：

```java
// org.apache.catalina.core.StandardContext
@Override
protected synchronized void startInternal() throws LifecycleException {

    ......
    // 触发 listener
    if (ok) {
       if (!listenerStart()) {
           log.error(sm.getString("standardContext.listenerFail"));
           ok = false;
       }
    }
    
	// 初始化 filter
    if (ok) {
        if (!filterStart()) {
            log.error(sm.getString("standardContext.filterFail"));
            ok = false;
        }
    }
    
    // 初始化 Servlets
    // Load and initialize all "load on startup" servlets
    if (ok) {
        if (!loadOnStartup(findChildren())){
            log.error(sm.getString("standardContext.servletFail"));
            ok = false;
        }
    }
}
```

listenerStart、filterStart 和 loadStartup 方法分别调用配置在 Listener 的 contextInitialized 方法以及 Filter 和配置了 load-on-startup 的 Servelt 的 init 方法。

<br />

Context 和 Host 一样也有一个 LifecycleListener 类型的监听器 ContextConfig，其中 configureStart 方法用来处理 CONFIGURE_START_EVENT 事件，这个方法里面调用了 webConfig 方法，webConfig 方法中解析了 web.xml 文件，相应的创建了 Wrapper 并使用 addChild 添加到 Context 里面。

### 4.5、Wrapper

Wrapper 的默认实现 StandardWrapper 没有重写 initInternal 方法，初始化时会默认调用 ContainerBase 的  initinternal 方法，startInternal 方法代码如下：

```java
// org.apache.catalina.core.StandardWrapper

@Override
protected synchronized void startInternal() throws LifecycleException {

    // Send j2ee.state.starting notification
    if (this.getObjectName() != null) {
        Notification notification = new Notification("j2ee.state.starting",
                                                     this.getObjectName(),
                                                     sequenceNumber++);
        broadcaster.sendNotification(notification);
    }

    // Start up this component
    super.startInternal();

    setAvailable(0L);

    // Send j2ee.state.running notification
    if (this.getObjectName() != null) {
        Notification notification =
            new Notification("j2ee.state.running", this.getObjectName(),
                             sequenceNumber++);
        broadcaster.sendNotification(notification);
    }

}
```

这里主要做了三件事：

- 用 broadcaster 发送通知，主要用于 JMX；
- 调用了父类 ContainerBase 的 startInternal 方法；
- 调用 setAvailable 方法让 Servlet 有效。

这里的 setAvailable 方法是 Wrapper 接口的方法，其作用是设置 Wrapper 所包含的 Servlet 有效的起始时间，如果设置的时间为将来的时间，那么调用所对应的 Servlet 就会产生错误，指导过了所设置的时间之后才可以正常调用，它的类型是 long，如果设置为 Long.MAX_VALUE 就一直不可以调用了。



Wrapper 没有别的容器那种 XXXConfig 样式的 LifecycleListener 监听器。
