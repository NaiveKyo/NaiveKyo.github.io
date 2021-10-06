---
title: Tomcat Pipeline-Value Analysis
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/19.jpg'
coverImg: /medias/featureimages/19.jpg
toc: true
date: 2021-10-06 22:35:19
top: true
cover: false
summary: Tomcat 处理请求的组件 Pipeline-Value 浅析
categories: Tomcat
keywords: Tomcat
tags: Tomcat
---

# Pipeline-Value 管道

前面介绍了 Container 自身的创建过程，Container 处理请求是使用 Pipeline-Value 管道来处理的，现在分析它的处理模式和实现方法。



## 1、Pipeline-Value 处理模式

Pipeline-Value 是责任链模式，责任链模式是指在一个请求处理的过程中有多个处理者依次对请求进行处理，每个处理者负责做自己相应的处理，处理完成后将处理后的请求返回，再让下一个处理者继续处理，每一个处理者的职责各不一样，这就是<mark>责任链模式</mark>。

Pipeline 就相当于这条链，Value 就相当于处理者。

不过 Pipeline-Value 的管道模型和普通的责任链模式稍微有些不同，区别主要有两点：

- 每个 Pipeline 都有特定的 Value，而且是在管道的最后一个执行，这个 Value 叫做 BaseValue，BaseValue 是不可删除的；
- 在上层容器的管道的 BaseValue 中会调用下层容器的管道。

4 个容器的 BaseValue 分别是 StandardEngineValue、StandardHostValue、StandardContextValue 和 StandardWrapperValue，

处理流程如下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211006223742.png)

在 Engine 的管道中依次执行 Engine 的各个 Vaule，最后执行 StandardEngineValue，用于调用 Host 的管道，然后执行 Host 的 Value，这样依此类推最后执行 Wrapper 管道中的 StandardWrapperValue。

在 Filter 中用到的 FilterChain 其实就是这种模式，FilterChain 相当于 Pipeline，每个 Filter 都相当于一个 Value，Servlet 相当于最后的 BaseValue。





## 2、Pipeline-Value 的实现方法

Pipeline 管道的实现分为生命周期管理和处理请求两部分，下面分别分析。

### 2.1、Pipeline 管道生命周期的实现方法

Container 中的 Pipeline 在抽象实现类 ContainerBase 中定义，并在生命周期的 startInternal、stopInternal、destroyInternal 方法中调用管道的相应生命周期方法（因为管道不需要初始化，所以 initInternal 方法中没有调用），代码如下：

```java
// org.apache.catalina.core.ContainerBase

// The Pipeline object with which this Container is associated.
// 这就是为什么管道不需要初始化
protected final Pipeline pipeline = new StandardPipeline(this);

@Override
protected synchronized void startInternal() throws LifecycleException {

    ......
    // Start the Valves in our pipeline (including the basic), if any
    if (pipeline instanceof Lifecycle) {
        ((Lifecycle) pipeline).start();
    }
    ......
}

@Override
protected synchronized void stopInternal() throws LifecycleException {

    ......
    // Stop the Valves in our pipeline (including the basic), if any
    if (pipeline instanceof Lifecycle &&
        ((Lifecycle) pipeline).getState().isAvailable()) {
        ((Lifecycle) pipeline).stop();
    }
    ......
}

@Override
protected void destroyInternal() throws LifecycleException {

    ......
    // Stop the Valves in our pipeline (including the basic), if any
    if (pipeline instanceof Lifecycle) {
        ((Lifecycle) pipeline).destroy();
    }
	......
}
```

Container 的 4 个子容器都继承自 ContainerBase，所以 4 个子容器在执行生命周期方法时都会调用管道对应的生命周期方法。

Pipeline 使用的是 `StandardPipeline` 类型，它里面的 Value 保存在 first 属性中，Value 是链式结构，可以通过 getNext 方法依次获取每个 Value，BaseValue  单独保存在 basic 属性中（basic 不可以为空，在调用 addValue 方法添加 Value 时 basic 会同时保存到 first 的最后一个，如果没有调用 addValue 方法则 first 可能为空）。StandardPipeline 继承自 LifecycleBase，所以实际处理生命周期的方法是 startInternal、stopInternal 和 destroyInternal，代码如下：

```java
// org.apache.catalina.core.StandardPipeline

@Override
protected synchronized void startInternal() throws LifecycleException {

    // 使用临时变量 current 来遍历 Value 链里的所有 Value，如果 first 为空则使用 basic
    Valve current = first;
    if (current == null) {
        current = basic;
    }
    // 遍历所有 Value 并调用 start 方法
    while (current != null) {
        if (current instanceof Lifecycle) {
            ((Lifecycle) current).start();
        }
        current = current.getNext();
    }
	// 设置 LifecycleState.STARTING 状态
    setState(LifecycleState.STARTING);
}

@Override
protected synchronized void stopInternal() throws LifecycleException {

    setState(LifecycleState.STOPPING);

    // Stop the Valves in our pipeline (including the basic), if any
    Valve current = first;
    if (current == null) {
        current = basic;
    }
    while (current != null) {
        if (current instanceof Lifecycle) {
            ((Lifecycle) current).stop();
        }
        current = current.getNext();
    }
}

@Override
protected void destroyInternal() {
    Valve[] valves = getValves();
    for (Valve valve : valves) {
        removeValve(valve);
    }
}
```

startInternal 和 stopInternal 方法处理的过程非常相似，都是使用临时变量 current 来遍历 Value 链里的所有 Value，如果 first 为空就使用 basic，然后遍历所有 Value 并调用相应的 start 和 stop 方法，最后设置相应的声明周期状态。destroyInternal 方法是删除所有 Value。

getValues 方法可以得到包括 basic 在内的所有 Value 的集合，代码如下：

```java
// org.apache.catalina.core.StandardPipeline

@Override
public Valve[] getValves() {

    List<Valve> valveList = new ArrayList<>();
    Valve current = first;
    if (current == null) {
        current = basic;
    }
    while (current != null) {
        valveList.add(current);
        current = current.getNext();
    }

    return valveList.toArray(new Valve[0]);

}
```

### 2.2、Pipeline 管道生命周期结构图

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211006223842.png)



### 2.3、Pipeline 管道处理请求的实现方法

Pipeline 调用所包含 Value 的 invoke 方法来处理请求，并且在 BaseValue 里又调用了子容器 Pipeline 所包含 Value 的 invoke 方法，直到最后调用了 Wrapper 的 Pipeline 所包含的 BaseValue —— StandardWrapperValue。

Connector 在接收到请求后会调用最顶层容器的 Pipeline 来处理，顶层容器的 Pipeline 处理完之后就会在其 BaseValue 里调用下一层容器的 Pipeline 进行处理，这样就可以逐层调用所有容器的 Pipeline 来处理了。

Engine 的 BaseValue 是 StandardEngineValue，它的 invoke 代码如下：

```java
// org.apache.catalina.core.StandardEngineValve
@Override
public final void invoke(Request request, Response response)
    throws IOException, ServletException {

    // Host 已经事先设置到 request 中了，其他各层容器也一样都会事先设置到 request 中
    Host host = request.getHost();
    if (host == null) {
        // HTTP 0.9 or HTTP 1.0 request without a host when no default host
        // is defined.
        // Don't overwrite an existing error
        if (!response.isError()) {
            response.sendError(404);
        }
        return;
    }
    if (request.isAsyncSupported()) {
        request.setAsyncSupported(host.getPipeline().isAsyncSupported());
    }

    // 将请求传递给 Host 的管道
    host.getPipeline().getFirst().invoke(request, response);
}
```

这里的实现非常简单，首先从 request 中获取到 Host，然后调用其管道的第一个 Value 的 invoke 方法进行处理。Host 的 BaseValue 也同样会调用 Context 的 Pipeline，Context 的 BaseValue 会调用 Wrapper 的 Pipeline，Wrapper 的 Pipeline 最后会在其 BaseValue（StandardWrapperValue）中创建 FilterChain 并调用其 doFilter 方法来处理请求，FilterChain 包含着我们配置的与请求相匹配的 Filter 和 Servlet，其 doFilter 方法会依次调用所有 Filter 的 doFilter 方法和 Servlet 的 service 方法，这样请求就得到处理了。

Filter 和 Servlet 实际处理请求的方法在 Wrapper 的管道 Pipeline 的 BaseValue —— StandardWrapperValue 中调用，生命周期相关的方法是在 Wrapper 的实现类 StandardWrapper 中调用。
