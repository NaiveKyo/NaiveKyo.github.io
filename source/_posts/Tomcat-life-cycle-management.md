---
title: Tomcat life cycle management
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/7.jpg'
coverImg: /medias/featureimages/7.jpg
toc: true
date: 2021-10-06 21:56:36
top: false
cover: false
summary: Tomcat 生命周期管理机制浅析
categories: Tomcat
keywords: Tomcat
tags: Tomcat
---

# Tomcat 的生命周期管理

## 1、LifeCycle 接口

Tomcat 通过 `org.apache.catalina.Lifecycle` 接口统一管理生命周期，所有有生命周期的组件都要实现这个接口。

Lifecycle 接口一共做了四件事：

- 定义了 13 个 String 类型的常量，用于 `LifecycleEvent` 事件的 type 属性，作用是区分组件发出的 LifecycleEvent 事件时的状态（如初始化前、启动前、启动中等等）。这种设计方式可以让多种状态都发送同一种类型的事件（LifecycleEvent），然后用其中一个属性来区分状态而不用定义多种事件，**这种方式值得学习。**
- 定义了三个管理监听器的方法：`addLifecycleListener`、`findLifecycleListeners` 和 `removeLifecycleListener`，分别用来添加、查找和删除 LifecycleListener 类型的监听器。
- 定义了四个生命周期的方法：init、start、stop 和 destroy，用于执行生命周期的各个阶段的操作。
- 定义了获取当前状态的两个方法 `getState` 和 `getStateName`，用来获取当前的状态，getState 的返回值 `LifecycleState` 是枚举类型，里面列举了生命周期的各个节点，getStateName 方法返回 String 类型的状态的名字，主要用于 <strong style="color:red"> JMX（Java Management Extensions）</strong>中。

```java
public interface Lifecycle {

    // 13 种 LifecycleEvent 事件的类型
    public static final String BEFORE_INIT_EVENT = "before_init";
    public static final String AFTER_INIT_EVENT = "after_init";
    public static final String START_EVENT = "start";
    public static final String BEFORE_START_EVENT = "before_start";
    public static final String AFTER_START_EVENT = "after_start";
    public static final String STOP_EVENT = "stop";    
    public static final String BEFORE_STOP_EVENT = "before_stop";
    public static final String AFTER_STOP_EVENT = "after_stop";
    public static final String AFTER_DESTROY_EVENT = "after_destroy";
    public static final String BEFORE_DESTROY_EVENT = "before_destroy";
    public static final String PERIODIC_EVENT = "periodic";
    public static final String CONFIGURE_START_EVENT = "configure_start";
    public static final String CONFIGURE_STOP_EVENT = "configure_stop";

    // 3 个管理监听器的方法
    public void addLifecycleListener(LifecycleListener listener);
    public LifecycleListener[] findLifecycleListeners();
    public void removeLifecycleListener(LifecycleListener listener);

    // 4 个生命周期方法
    public void init() throws LifecycleException;
    public void start() throws LifecycleException;
    public void stop() throws LifecycleException;
    public void destroy() throws LifecycleException;

    // 2 个获取当前状态的方法
    public LifecycleState getState();
    public String getStateName();
}
```

## 2、LifecycleBase

Lifecycle 的默认实现是 `org.apache.catalina.util.LifecycleBase`，所有实现了生命周期的组件都直接或间接地继承自 `LifecycleBase`，LifecycleBase 为 Lifecycle 里的接口方法提供了默认实现：

- 监听器管理：LifecycleBase 中专门定义了 `LifecycleListener` 类型的线程安全的 List，并提供了添加、删除、查找和执行监听器的方法
- 生命周期方法中设置了相应的状态并调用了相应的模板方法
  - 生命周期方法：init 、start、stop、destroy
  - 对应的模板方法：initInternal、startInternal、stopInternal、destroyInternal
  - 这四个方法由子类实现，对于子类来说，执行生命周期处理的方法就是 initInternal、startInternal、stopInternal、destroyInternal 方法
- 组件当前的状态在生命周期的四个方法中已经设置好了，所以调用获取当前状态的方法，内部直接放回状态变量就好了

### 2.1、监听器方法

```java
// org.apache.catalina.util.LifecycleBase

// The list of registered LifecycleListeners for event notifications.
private final List<LifecycleListener> lifecycleListeners = new CopyOnWriteArrayList<>();

// Add a LifecycleEvent listener to this component.
@Override
public void addLifecycleListener(LifecycleListener listener) {
    lifecycleListeners.add(listener);
}

// Get the life cycle listeners associated with this life cycle.
@Override
public LifecycleListener[] findLifecycleListeners() {
    return lifecycleListeners.toArray(new LifecycleListener[0]);
}

// Remove a LifecycleEvent listener from this component.
@Override
public void removeLifecycleListener(LifecycleListener listener) {
    lifecycleListeners.remove(listener);
}

/**
 * Allow sub classes to fire {@link Lifecycle} events.
 *
 * @param type  Event type
 * @param data  Data associated with event.
*/
protected void fireLifecycleEvent(String type, Object data) {
    LifecycleEvent event = new LifecycleEvent(this, type, data);
    for (LifecycleListener listener : lifecycleListeners) {
        listener.lifecycleEvent(event);
    }
}
```

添加、查找、删除监听器的方法很简单，最后处理事件的监听器是按照事件的类型（组件的状态）创建了一个 `LifecycleEvent` 事件，然后遍历所有监听器进行处理。



### 2.2、生命周期方法

四个生命周期方法的实现中首先要判断当前的状态和要处理的方法是否匹配，如果不匹配就会执行相应方法使其匹配（比如在 init 之前调用 start，这时会先执行 init），或者不处理甚至抛出异常，如果匹配或者处理后匹配了，则会调用相应的模板方法并设置相应的状态。

LifecycleBase 中的状态是通过 LifecycleState 类型的 state 属性来保存的，最开始初始化值为 LifecycleState.NEW。

#### init() 方法

看看 init 方法：

```java
// org.apache.catalina.util.LifecycleBase

@Override
public final synchronized void init() throws LifecycleException {
    // 最开始的状态必须是 LifecycleState.NEW 否则会抛出异常
    if (!state.equals(LifecycleState.NEW)) {
        invalidTransition(Lifecycle.BEFORE_INIT_EVENT);
    }

    try {	
        // 初始化之前将状态设置为 LifecycleState.INITIALIZING
        setStateInternal( LifecycleState.INITIALIZING, null, false);
        // 通过模板方法具体执行初始化
        initInternal();
        // 初始化之后将状态设置为 LifecycleState.INITIALIZED
        setStateInternal(LifecycleState.INITIALIZED, null, false);
    } catch (Throwable t) {
        handleSubClassException(t, "lifecycleBase.initFail", toString());
    }
}
```

具体过程如上，其中 `invalidTransition` 方法专门用于处理不符合要求的状态，如果状态不合适并且不能进行其他处理，就会调用该方法。

```java
private void invalidTransition(String type) throws LifecycleException {
    String msg = sm.getString("lifecycleBase.invalidTransition", type, toString(), state);
    throw new LifecycleException(msg);
}
```

其内部就是抛出一个 LifecycleException 类型的异常。



#### start() 方法

start（）方法要稍微复杂一些：

```java
// org.apache.catalina.util.LifecycleBase
@Override
public final synchronized void start() throws LifecycleException {
	
    // 通过检查状态看看是否已经启动，如果已经启动就打印日志并直接返回
    if (LifecycleState.STARTING_PREP.equals(state) || LifecycleState.STARTING.equals(state) ||
        LifecycleState.STARTED.equals(state)) {

        if (log.isDebugEnabled()) {
            Exception e = new LifecycleException();
            log.debug(sm.getString("lifecycleBase.alreadyStarted", toString()), e);
        } else if (log.isInfoEnabled()) {
            log.info(sm.getString("lifecycleBase.alreadyStarted", toString()));
        }

        return;
    }

    // 如果没有初始化就先进行初始化，如果启动失败则关闭，如果状态无法处理就抛异常
    if (state.equals(LifecycleState.NEW)) {
        init();
    } else if (state.equals(LifecycleState.FAILED)) {
        stop();
    } else if (!state.equals(LifecycleState.INITIALIZED) &&
               !state.equals(LifecycleState.STOPPED)) {
        invalidTransition(Lifecycle.BEFORE_START_EVENT);
    }

    try {
        // 启动之前将状态设置为 LifecycleState.STARTING_PREP
        setStateInternal(LifecycleState.STARTING_PREP, null, false);
        // 调用模板方法具体启动组件
        startInternal();
        // 再次判断是否启动成功
        if (state.equals(LifecycleState.FAILED)) {
            // 启动失败就调用 stop() 方法停止
            stop();
        } else if (!state.equals(LifecycleState.STARTING)) {
            // 如果启动后状态不是 LifecycleState.STARTING 就抛出异常
            invalidTransition(Lifecycle.AFTER_START_EVENT);
        } else {
            // 启动成功后把状态设置为 LifecycleState.STARTED
            setStateInternal(LifecycleState.STARTED, null, false);
        }
    } catch (Throwable t) {
        // This is an 'uncontrolled' failure so put the component into the
        // FAILED state and throw an exception.
        handleSubClassException(t, "lifecycleBase.startFail", toString());
    }
}
```



#### stop 和 destroy

stop 和 destroy 方法的实现过程差不多就不具体分析了。



设置状态的 `setStateInternal` 方法中除了设置状态还可以检查设置的状态合不合逻辑，并且会在最后发布相应的事件：

```java
// org.apache.catalina.util.LifecycleBase
private synchronized void setStateInternal(LifecycleState state, Object data, boolean check)
    throws LifecycleException {

    if (log.isDebugEnabled()) {
        log.debug(sm.getString("lifecycleBase.setState", this, state));
    }

    if (check) {
		// 如果状态为空直接抛出异常并退出，正常情况下状态不可能为空
        if (state == null) {
            invalidTransition("null");
            return;
        }
		// 如果状态不符合逻辑就抛异常
        if (!(state == LifecycleState.FAILED ||
              (this.state == LifecycleState.STARTING_PREP &&
               state == LifecycleState.STARTING) ||
              (this.state == LifecycleState.STOPPING_PREP &&
               state == LifecycleState.STOPPING) ||
              (this.state == LifecycleState.FAILED &&
               state == LifecycleState.STOPPING))) {
            // No other transition permitted
            invalidTransition(state.name());
        }
    }

    // 设置新状态
    this.state = state;
    // 发布事件
    String lifecycleEvent = state.getLifecycleEvent();
    if (lifecycleEvent != null) {
        fireLifecycleEvent(lifecycleEvent, data);
    }
}
```

该方法就是通过 check 参数判断是否需要检查传入的状态，如果需要检查则会检查传入的状态是否为空以及是否符合逻辑，最后将传入的状态设置到 state 属性，并调用 fireLifecycleEvent 方法处理事件。



### 2.3、获取当前状态的方法

在生命周期的相应方法中已经将状态设置到了 state 属性，所以获取状态的两个方法的实现就非常简单了，直接返回 state 就可以了:

```java
// org.apache.catalina.util.LifecycleBase
@Override
public LifecycleState getState() {
    return state;
}

@Override
public String getStateName() {
    return getState().toString();
}
```

