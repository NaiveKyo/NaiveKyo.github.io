---
title: Spring MVC Component (一) HandlerMapping
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211005110206.jpg'
coverImg: /img/20211005110206.jpg
toc: true
date: 2021-10-31 14:52:20
top: false
cover: false
summary: "Spring MVC 组件之 HandlerMapping"
categories: "Spring MVC"
keywords: "Spring MVC"
tags: "Spring MVC"
---

## HandlerMapping

继承结构如图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031145428.png)

可以看到 HandlerMapping 家族可以分为两支（RouteFunctionMapping 可以先放一边），一支继承 `AbstractUrlHandlerMapping`，另一支继承 `AbstractHandlerMethodMapping`，而这两支都继承自 `AbstractHandlerMapping`。



### 1、AbstractHandlerMapping

AbstractHandlerMapping 是 HandlerMapping 的抽象实现，所有的 HandlerMapping 都继承自 AbstractHandlerMapping。AbstractHandlerMapping 采用 <mark>模板模式</mark> 设计了 HandlerMapping 实现的整体结构，子类只需要通过模板方法提供一些初始值或者具体的算法即可。

将 AbstractHandlerMapping 分析透彻对整个 HandlerMapping 实现方式的理解至关重要。在 Spring MVC 中很多组件都是采用了这种模式 —— 首先使用一个抽象实现采用模板模式进行整体设计，然后在子类通过实现模板方法具体完成业务，所以在分析 Spring MVC 源码的过程中尤其要重视对组件接口直接实现的抽象实现类的分析。

HandlerMapping 的作用是根据 request 查找 Handler 和 Interceptors。获取 Handler 的过程通过模板方法 `getHandlerInternal` 交给了子类。AbstractHandlerMapping 中保存了所用配置的 Interceptor，在获取到 Handler 之后会自己根据从 request 提取的 `lookupPath` 将对应的 Interceptors 装配上去，当然子类也可以通过 getHandlerInternal 方法设置自己的 Interceptor，getHandlerInternal 的返回值为 Object 类型。



#### 1.1、创建 AbstractHandlerMapping

AbstractHandlerMapping 继承自 `WebApplicationObjectSupport`，初始化时会自动调用模板方法 `initApplicationContext()` ，AbstractHandlerMapping  的创建是在 initApplicationContext 中的，代码如下：

```java
// org.springframework.web.servlet.handler.AbstractHandlerMapping

@Override
protected void initApplicationContext() throws BeansException {
    extendInterceptors(this.interceptors);
    detectMappedInterceptors(this.adaptedInterceptors);
    initInterceptors();
}
```

initApplicationCotnext 里一共有三个方法，下面分别分析：

（1）`extendnterceptors` 是模板方法，用于给子类提供一个添加（或者修改）Interceptors 的入口，不过现有 Spring MVC 的实现中并没有使用。



（2）`detectMappedInterceptors` 方法用于将 Spring MVC 容器及父容器中的所有 MappedInterceptor 类型的 Bean 添加到 mappedInterceptors 属性（看上面的代码可知实际上给了 adaptedInterceptors 属性），代码如下：

```java
// org.springframework.web.servlet.handler.AbstractHandlerMapping

protected void detectMappedInterceptors(List<HandlerInterceptor> mappedInterceptors) {
    mappedInterceptors.addAll(BeanFactoryUtils.beansOfTypeIncludingAncestors(
        obtainApplicationContext(), MappedInterceptor.class, true, false).values());
}
```



（3）`initInterceptors` 方法的作用是初始化 Interceptor，具体内容其实是将 interceptors 属性里所包含的对象按类型添加到 adaptedInterceptors，代码如下：

```java
// org.springframework.web.servlet.handler.AbstractHandlerMapping

protected void initInterceptors() {
    if (!this.interceptors.isEmpty()) {
        for (int i = 0; i < this.interceptors.size(); i++) {
            Object interceptor = this.interceptors.get(i);
            if (interceptor == null) {
                throw new IllegalArgumentException("Entry number " + i + " in interceptors array is null");
            }
            this.adaptedInterceptors.add(adaptInterceptor(interceptor));
        }
    }
}
```

AbstractHandlerMapping 中的 Interceptors 有两个 List 类型的属性：interceptors、adaptedInterceptors（包含 mappedInterceptors），分别解释：

- interceptors：用于配置 Spring MVC 的拦截器，有两种设置方式：
  1. 注册 HandlerMapping 时通过属性设置
  2. 通过子类的 extendInterceptors 钩子方法进行设置
  3. interceptors 并不会直接使用，而是通过 initIntercepors  方法按类型分配到 adaptedInterceptors 属性中使用，interceptors 只用于配置。
- mappedInterceptors：此类 Interceptor 在使用时需要与请求的 url 进行匹配，只有匹配成功后才会添加到 getHandler 的返回值 HandlerExecutionChain 里。它有两种获取途径：从 interceptors 获取或者注册到 spring 的容器中通过 detectMappedInterceptors 方法获取。
- adaptedInterceptors：这种类型的 Interceptor 不需要进行匹配，在 getHandler 中会全部添加到返回值 HandlerExecutionChain 里面。它只能从 interceptors 中获取。



AbstractHandlerMapping 的创建其实就是初始化这三个 Interceptor。



#### 1.2、使用 AbstractHandlerMapping

HandlerMapping 是通过 getHandler 方法来获取处理器 Handler 和 拦截器 Interceptor 的，下面看一看 AbstractHandlerMapping 中的实现方法：

```java
// org.springframework.web.servlet.handler.AbstractHandlerMapping

@Override
@Nullable
public final HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {
    Object handler = getHandlerInternal(request);
    if (handler == null) {
        handler = getDefaultHandler();
    }
    if (handler == null) {
        return null;
    }
    // Bean name or resolved handler?
    if (handler instanceof String) {
        String handlerName = (String) handler;
        handler = obtainApplicationContext().getBean(handlerName);
    }

    // Ensure presence of cached lookupPath for interceptors and others
    if (!ServletRequestPathUtils.hasCachedPath(request)) {
        initLookupPath(request);
    }

    HandlerExecutionChain executionChain = getHandlerExecutionChain(handler, request);

    if (logger.isTraceEnabled()) {
        logger.trace("Mapped to " + handler);
    }
    else if (logger.isDebugEnabled() && !DispatcherType.ASYNC.equals(request.getDispatcherType())) {
        logger.debug("Mapped to " + executionChain.getHandler());
    }

    if (hasCorsConfigurationSource(handler) || CorsUtils.isPreFlightRequest(request)) {
        CorsConfiguration config = getCorsConfiguration(handler, request);
        if (getCorsConfigurationSource() != null) {
            CorsConfiguration globalConfig = getCorsConfigurationSource().getCorsConfiguration(request);
            config = (globalConfig != null ? globalConfig.combine(config) : config);
        }
        if (config != null) {
            config.validateAllowCredentials();
        }
        executionChain = getCorsHandlerExecutionChain(request, executionChain, config);
    }

    return executionChain;
}
```

在 `getHandlerExecutionChain` 方法之前是查找 Handler，而 getHandlerExecutionChain 方法本身是添加拦截器，剩余部分就是日志和处理跨域。

找 Handler 的过程大致是这样的：

1. 通过 `getHandlerInternal(request)` 方法获取，这是一个模板方法，留给子类实现（这也是其子类要做的事）
2. 如果没有找到就使用默认的 Handler，默认的 Handler 保存在 AbstractHandlerMapping 的一个 Object 类型的属性 defaultHandler 中，可以在配置 HandlerMapping 时进行配置，也可以在其子类中进行设置
3. 如果找到的 Handler 是 String 类型的，则以它为名到 Spring MVC 的容器中找到相应的 Bean



下面看一看 getHandlerExecutionChain 方法：

```java
// org.springframework.web.servlet.handler.AbstractHandlerMapping

protected HandlerExecutionChain getHandlerExecutionChain(Object handler, HttpServletRequest request) {
    HandlerExecutionChain chain = (handler instanceof HandlerExecutionChain ?
                                   (HandlerExecutionChain) handler : new HandlerExecutionChain(handler));

    for (HandlerInterceptor interceptor : this.adaptedInterceptors) {
        if (interceptor instanceof MappedInterceptor) {
            MappedInterceptor mappedInterceptor = (MappedInterceptor) interceptor;
            if (mappedInterceptor.matches(request)) {
                chain.addInterceptor(mappedInterceptor.getInterceptor());
            }
        }
        else {
            chain.addInterceptor(interceptor);
        }
    }
    return chain;
}
```

这个方法也很简单，首先通过之前找到的 Handler 将其转换为 HandlerExecutionChain 类型的变量，然后遍历之前得到的 adaptedInterceptors 拦截器集合，将 adaptedInterceptors 和符合要求的 mappedInterceptors 添加进去。



### 2、AbstractUrlHandlerMapping 系列

#### 2.1、AbstractUrlHandlerMapping 

AbstractUrlHandlerMapping  系列都继承自 AbstractUrlHandlerMapping，从名字就可以看出它是通过 url 来进行匹配的。此系列大致原理是将 url 与对应的 Handler 保存在一个 Map 中，在 getHandlerInternal 方法中使用 url 从 Map 中获取 Handler，AbstractUrlHandlerMapping 中实现了具体用 url 从 Map 中获取 Handler 的过程，而 Map 的初始化则交给了具体的子类去完成。

这里的 Map 就是定义在 AbstractUrlHanlderMapping 中的 handlerMap，另外还单独定义了处理 "/" 请求的处理器 rootHandler，定义如下：

```java
// org.springframework.web.servlet.handler.AbstractUrlHandlerMapping

@Nullable
private Object rootHandler;

private final Map<String, Object> handlerMap = new LinkedHashMap<>();
```

下面看一下是如何获取 Handler 以及这个 Map 是怎么创建的。

前面在 AbstractHandlerMapping 的 getHandler 方法中我们知道了获取 Handler 的方法是 `getHandlerInternal` 模板方法，它在 AbstractUrlHandlerMapping 中的实现为：

```java
// org.springframework.web.servlet.handler.AbstractUrlHandlerMapping

@Override
@Nullable
protected Object getHandlerInternal(HttpServletRequest request) throws Exception {
    // 从 request 中解析出路径
    String lookupPath = initLookupPath(request);
    Object handler;
    if (usesPathPatterns()) {
        RequestPath path = ServletRequestPathUtils.getParsedRequestPath(request);
        handler = lookupHandler(path, lookupPath, request);
    }
    else {
        handler = lookupHandler(lookupPath, request);
    }
    if (handler == null) {
        // We need to care for the default handler directly, since we need to
        // expose the PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE for it as well.
        // 定义一个临时变量用于保存找到的原始 Handler
        Object rawHandler = null;
        if (StringUtils.matchesCharacter(lookupPath, '/')) {
            rawHandler = getRootHandler();
        }
        if (rawHandler == null) {
            rawHandler = getDefaultHandler();
        }
        if (rawHandler != null) {
            // Bean name or resolved handler?
            // 如果是 String 类型则到容器中查找具体的 Bean
            if (rawHandler instanceof String) {
                String handlerName = (String) rawHandler;
                rawHandler = obtainApplicationContext().getBean(handlerName);
            }
            // 可以用来校验找到的 Handler 和 request 是否匹配，是模板方法，而且子类也没有使用
            validateHandler(rawHandler, request);
            handler = buildPathExposingHandler(rawHandler, lookupPath, lookupPath, null);
        }
    }
    return handler;
}
```

这里除了 lookupHandler 和 buildPathExposingHandler 方法外都非常容易理解，其他就不解释了，主要看这两个方法：

> lookupHandler 方法

`lookupHandler` 方法用于使用 lookupPath 从 Map 中查找 Handler，不过很多时候并不能直接从 Map 中 get 到，因为很多 Handler 都是用了 Pattern 的匹配模式，如 "/show/article/*" ，这里的星号 * 可以代表任意内容而不是真正匹配 url 中的星号，如果 Pattern 中包含 PathVariable 也不能直接从 Map 中获取到。

另外，一个 url 还可能跟多个 Pattern 相匹配，这时还需要选择其中最优的，所以查找过程其实并不是直接简单地从 Map 里获取，单独写一个方法来做也是应该的。

lookupHandler 方法代码如下：

```java
// org.springframework.web.servlet.handler.AbstractUrlHandlerMapping

@Nullable
protected Object lookupHandler(
    RequestPath path, String lookupPath, HttpServletRequest request) throws Exception {

    // 直接从 Map 中获取
    Object handler = getDirectMatch(lookupPath, request);
    if (handler != null) {
        // 获取到了直接返回
        return handler;
    }

    // Pattern match?
    // Pattern 匹配，比如使用带 * 号的模式与 url 进行匹配
    List<PathPattern> matches = null;
    for (PathPattern pattern : this.pathPatternHandlerMap.keySet()) {
        if (pattern.matches(path.pathWithinApplication())) {
            matches = (matches != null ? matches : new ArrayList<>());
            matches.add(pattern);
        }
    }
    if (matches == null) {
        return null;
    }
    
    // 如果按照模式匹配到多个，则传入比较器进行比较
    if (matches.size() > 1) {
        matches.sort(PathPattern.SPECIFICITY_COMPARATOR);
        if (logger.isTraceEnabled()) {
            logger.trace("Matching patterns " + matches);
        }
    }
    // 获取优先级最高的那个
    PathPattern pattern = matches.get(0);
    handler = this.pathPatternHandlerMap.get(pattern);
    if (handler instanceof String) {
        // 如果是 String 类型则从容器中获取
        String handlerName = (String) handler;
        handler = obtainApplicationContext().getBean(handlerName);
    }
    validateHandler(handler, request);
    PathContainer pathWithinMapping = pattern.extractPathWithinPattern(path.pathWithinApplication());
    return buildPathExposingHandler(handler, pattern.getPatternString(), pathWithinMapping.value(), null);
}
```

可以看到查找 Handler 的关键还是保存 url 和 Handler 的那个 Map。



> buildPathExposingHandler 方法

buildPathExposingHandler 方法用于给查找到的 Handler 注册两个拦截器 `PathExpoingHandlerInterceptor` 和 `UriTemplateVariableshandlerInterceptor`，这是两个内部拦截器，主要作用是将当前 url 实际匹配的 Pattern、匹配条件和 url 模板参数等设置到 request 的属性里，这样在后面的处理过程中就可以直接从 request 属性中获取，而不需要再重新查找一遍，代码如下：

```java
// org.springframework.web.servlet.handler.AbstractUrlHandlerMapping

// 方法
protected Object buildPathExposingHandler(Object rawHandler, String bestMatchingPattern,
                                          String pathWithinMapping, @Nullable Map<String, String> uriTemplateVariables) {

    HandlerExecutionChain chain = new HandlerExecutionChain(rawHandler);
    chain.addInterceptor(new PathExposingHandlerInterceptor(bestMatchingPattern, pathWithinMapping));
    if (!CollectionUtils.isEmpty(uriTemplateVariables)) {
        chain.addInterceptor(new UriTemplateVariablesHandlerInterceptor(uriTemplateVariables));
    }
    return chain;
}

// 内部拦截器：PathExposingHandlerInterceptor
private class PathExposingHandlerInterceptor implements HandlerInterceptor {

    private final String bestMatchingPattern;

    private final String pathWithinMapping;

    public PathExposingHandlerInterceptor(String bestMatchingPattern, String pathWithinMapping) {
        this.bestMatchingPattern = bestMatchingPattern;
        this.pathWithinMapping = pathWithinMapping;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        exposePathWithinMapping(this.bestMatchingPattern, this.pathWithinMapping, request);
        request.setAttribute(BEST_MATCHING_HANDLER_ATTRIBUTE, handler);
        request.setAttribute(INTROSPECT_TYPE_LEVEL_MAPPING, supportsTypeLevelMappings());
        return true;
    }

}

// 内部拦截器：UriTemplateVariablesHandlerInterceptor
private class UriTemplateVariablesHandlerInterceptor implements HandlerInterceptor {

    private final Map<String, String> uriTemplateVariables;

    public UriTemplateVariablesHandlerInterceptor(Map<String, String> uriTemplateVariables) {
        this.uriTemplateVariables = uriTemplateVariables;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        exposeUriTemplateVariables(this.uriTemplateVariables, request);
        return true;
    }
}
```

在 buildPathExposingHandler 方法中给 Handler 注册两个内部拦截器：`PathExposingHandlerInterceptor` 和 `UriTemplateVariablesHandlerInterceptor`，这两个拦截器分别在 `preHandle` 中调用了 `exposePathWithinMapping` 和 `exposeUriTemplateVariables` 方法将相应的内容设置到了 request 的属性中。



下面分析 Map 的初始化，它通过 registerHandler 方法进行，这个方法承担 AbstractUrlHandlerMapping 的创建工作，不过和之前的创建不同的是这里的 registerHandler 方法并不是自己调用的，也不是父类调用，而是子类调用。这样不同的子类就可以通过注册不同的 Handler 将组件创建出来。

**这种思路也值得我们学习和借鉴。**



AbstractUrlHandlerMapping 中有两个 registerHandler 方法：

第一个方法可以注册多个 url 到一个处理器，处理器用的是 String 类型的 beanName，这种用法在前面已经多次见到过，它可以使用 beanName 到 spring 容器中找到真实的 bean 做处理器。在这个方法里只是遍历了所有的 url，然后调用第二个 registerHandler 方法具体将 Handler 注册到 Map 中。

第二个 registerHandler 方法的具体注册过程也非常简单，首先看 Map 里原来有没有传入的 url，如果没有就 put 进去，如果有就看一下原来保存的和现在要注册的 Handler 是不是同一个，如果不是同一个就有问题了，总不能相同的 url 有两个不同的 Handler 吧（该 Handler Mapping 系列只根据 url 找到 Handler ！）这时就要抛出异常。

往 Map 里放的时候还需要看一下 url 是不是处理 "/" 或者 "/*"，如果是就不往 Map 里面放了，而是分别设置到 rootHandler 和 defaultHandler，具体代码如下：

```java
// org.springframework.web.servlet.handler.AbstractUrlHandlerMapping

protected void registerHandler(String[] urlPaths, String beanName) throws BeansException, IllegalStateException {
    Assert.notNull(urlPaths, "URL path array must not be null");
    for (String urlPath : urlPaths) {
        registerHandler(urlPath, beanName);
    }
}

protected void registerHandler(String urlPath, Object handler) throws BeansException, IllegalStateException {
    Assert.notNull(urlPath, "URL path must not be null");
    Assert.notNull(handler, "Handler object must not be null");
    Object resolvedHandler = handler;

    // Eagerly resolve handler if referencing singleton via name.’
    // 如果 Handler 是 String 类型而且没有设置 lazyInitHandlers 则从 Spring MVC 容器中获取 Handler
    if (!this.lazyInitHandlers && handler instanceof String) {
        String handlerName = (String) handler;
        ApplicationContext applicationContext = obtainApplicationContext();
        if (applicationContext.isSingleton(handlerName)) {
            resolvedHandler = applicationContext.getBean(handlerName);
        }
    }

    Object mappedHandler = this.handlerMap.get(urlPath);
    if (mappedHandler != null) {
        if (mappedHandler != resolvedHandler) {
            throw new IllegalStateException(
                "Cannot map " + getHandlerDescription(handler) + " to URL path [" + urlPath +
                "]: There is already " + getHandlerDescription(mappedHandler) + " mapped.");
        }
    }
    else {
        if (urlPath.equals("/")) {
            if (logger.isTraceEnabled()) {
                logger.trace("Root mapping to " + getHandlerDescription(handler));
            }
            setRootHandler(resolvedHandler);
        }
        else if (urlPath.equals("/*")) {
            if (logger.isTraceEnabled()) {
                logger.trace("Default mapping to " + getHandlerDescription(handler));
            }
            setDefaultHandler(resolvedHandler);
        }
        else {
            this.handlerMap.put(urlPath, resolvedHandler);
            if (getPatternParser() != null) {
                this.pathPatternHandlerMap.put(getPatternParser().parse(urlPath), resolvedHandler);
            }
            if (logger.isTraceEnabled()) {
                logger.trace("Mapped [" + urlPath + "] onto " + getHandlerDescription(handler));
            }
        }
    }
}
```

现在就已经把整个 AbstractUrlHandlerMapping 系列的原理分析完了，AbstractUrlHandlerMapping 里面定义了整体架构，子类只需要将 Map 初始化就可以了。



下面看子类是如何做的。有两个类直接继承 AbstractUrlHandlerMapping，分别是 `SimpleUrlHandlerMapping` 和 `AbstractDetectingUrlHandlerMapping`。

#### 2.2、SimpleUrlHandlerMapping

SimpleUrlHandlerMapping 定义了一个 Map 变量（自己定义一个 Map 主要有两个作用，第一是方便配置，第二是可以在注册前做一些预处理，如确保所有 url 都以 "/" 开头），将所有的 url 和 Handler 的对应关系放在里面，最后注册到父类的 Map 中；

而 AbstractDetectingUrlHandlerMapping 则是将容器中的所有 bean 都拿出来，按一定规则注册到父类的 Map 中。下面分别看一下。

SimpleUrlHandlerMapping 在创建时通过重写父类的 initApplicationContext 方法调用了 registerHandlers 方法完成 Handler 的注册，registerHandlers 内部又调用了 AbstractUrlHandlerMapping 的 registerHandler 方法将我们配置的 urlMap 注册到 AbstractUrlHandlerMapping  的 Map 中（如果要使用 SimpleUrlHandlerMapping 就需要在注册时给它配置 urlMap），代码如下：

```java
// org.springframework.web.servlet.handler.SimpleUrlHandlerMapping

private final Map<String, Object> urlMap = new LinkedHashMap<>();

@Override
public void initApplicationContext() throws BeansException {
    super.initApplicationContext();
    registerHandlers(this.urlMap);
}

protected void registerHandlers(Map<String, Object> urlMap) throws BeansException {
    if (urlMap.isEmpty()) {
        logger.trace("No patterns in " + formatMappingName());
    }
    else {
        urlMap.forEach((url, handler) -> {
            // Prepend with slash if not already present.
            if (!url.startsWith("/")) {
                url = "/" + url;
            }
            // Remove whitespace from handler bean name.
            if (handler instanceof String) {
                handler = ((String) handler).trim();
            }
            registerHandler(url, handler);
        });
        logMappings();
    }
}
```

SimpleUrlHandlerMapping 类也非常简单，就是直接将配置的 Map 中的内容配置到 AbstractUrlHandlerMapping 中。

#### 2.3、AbstractDetectingUrlHandlerMapping

AbstractDetectingUrlHandlerMapping 也是通过重写 initApplicationContext 来注册 Handler 的，里面调用了 detectHandlers 方法，在 detectHandlers 中根据配置的 detectHandlersInAncestorContexts 参数从 Spring MVC 容器或者 Spring MVC 及其父容器中找到所有 bean 的 beanName，然后用 determineUrlsForHandler 方法对每个 beanName 解析出对应的 urls，如果解析结果不为空则将解析出的 urls 和 beanName（作为 Handler）注册到父类的 Map，注册方法依然是调用 AbstractUrlHandlerMapping 的 registerHandler 方法。使用 beanName 解析 urls 的 determineUrlsForHandler 方法是模板方法，交给具体子类实现。

AbstractDetectingUrlHandlerMapping 代码如下：

```java
// org.springframework.web.servlet.handler.AbstractDetectingUrlHandlerMapping

@Override
public void initApplicationContext() throws ApplicationContextException {
    super.initApplicationContext();
    detectHandlers();
}

protected void detectHandlers() throws BeansException {
    ApplicationContext applicationContext = obtainApplicationContext();
    
    // 获取所有 bean 的名字
    String[] beanNames = (this.detectHandlersInAncestorContexts ?
                          BeanFactoryUtils.beanNamesForTypeIncludingAncestors(applicationContext, Object.class) :
                          applicationContext.getBeanNamesForType(Object.class));

    // Take any bean name that we can determine URLs for.
    // 解析每个 beanName，如果能解析就注册到父类的 Map 中
    for (String beanName : beanNames) {
        // 使用 beanName 解析 url，是模板方法，子类具体实现
        String[] urls = determineUrlsForHandler(beanName);
        // 如果能够解析，就注册到父类的 Map z
        if (!ObjectUtils.isEmpty(urls)) {
            // URL paths found: Let's consider it a handler.
            // 父类的 registerHandler 方法
            registerHandler(urls, beanName);
        }
    }

    if (mappingsLogger.isDebugEnabled()) {
        mappingsLogger.debug(formatMappingName() + " " + getHandlerMap());
    }
    else if ((logger.isDebugEnabled() && !getHandlerMap().isEmpty()) || logger.isTraceEnabled()) {
        logger.debug("Detected " + getHandlerMap().size() + " mappings in " + formatMappingName());
    }
}

protected abstract String[] determineUrlsForHandler(String beanName);
```

AbstractDetectingUrlHandlerMapping 有一个子类：BeanNameUrlHandlerMapping。

BeanNameUrlHandlerMapping 是检查 beanName 和 alias 是不是以 "/" 开头，如果是则将其作为 url，里面只有一个 determineUrlsForHandler 方法，非常简单，代码如下：

```java
// org.springframework.web.servlet.handler.BeanNameUrlHandlerMapping

@Override
protected String[] determineUrlsForHandler(String beanName) {
    List<String> urls = new ArrayList<>();
    if (beanName.startsWith("/")) {
        urls.add(beanName);
    }
    String[] aliases = obtainApplicationContext().getAliases(beanName);
    for (String alias : aliases) {
        if (alias.startsWith("/")) {
            urls.add(alias);
        }
    }
    return StringUtils.toStringArray(urls);
}
```

AbstractUrlHandlerMapping 系列就分析完了，层次非常清晰，先来回顾一下：

- 首先在 AbstractUrlHandlerMapping 中设计了整体的结构，并完成了查找 Handler 的具体逻辑，其中需要用到一个保存 url 和 Handler 对应关系的 Map，这个 Map 的内容是留给子类初始化的，这里提供了注册（也就是初始化 Map）的工具方法 `registerHandler`。
- 初始化 Map 时提供了两种实现方式，一种是通过手工在配置文件里注册，另一种是在 spring 的容器里面找，第二种方式需要将容器的 bean 按照特定的需求筛选出来，并解析出一个 url，所以又根据需求增加了一层子类。



### 3、AbstractHandlerMethodMapping 系列

从前面 HandlerMapping 的结构图可以看出，AbstractHandlerMethodMapping 系列的结构非常简单，只有三个类：AbstractHandlerMethodMapping、RequestMappingInfoHandlerMapping 和 RequestMappingHandlerMapping，这三个类依次继承。

AbstractHandlerMethodMapping 直接继承自 AbstractHandlerMapping。虽然看起来这里的结构要比 UrlHandlerMapping 简单很多，但是并没有因为类结构简单而降低复杂度。

AbstractHandlerMethodMapping 系列是将 Method 作为 Handler 来使用的，这也是我们现在用的最多的一种 Handler，比如经常使用的 `@RequestMapping` 所注释的方法就是这种 Handler，它有一个专门的类型 —— `HandlerMethod`，也就是 Method 类型的 Handler。



#### 3.1、创建 AbstractHandlerMethodMapping

要想弄明白 AbstractHandlerMethodMapping 系列，最关键的就是先弄明白 AbstractHandlerMethodMapping 里三个 Map 的含义，它们定义如下：

```java
// org.springframework.web.servlet.handler.AbstractHandlerMethodMapping

public Map<T, HandlerMethod> getHandlerMethods() {
    this.mappingRegistry.acquireReadLock();
    try {
        return Collections.unmodifiableMap(
            this.mappingRegistry.getRegistrations().entrySet().stream()
            .collect(Collectors.toMap(Map.Entry::getKey, entry -> entry.getValue().handlerMethod)));
    }
    finally {
        this.mappingRegistry.releaseReadLock();
    }
}

// org.springframework.web.servlet.handler.AbstractHandlerMethodMapping&MappingRegistry
private final MultiValueMap<String, T> pathLookup = new LinkedMultiValueMap<>();

private final Map<String, List<HandlerMethod>> nameLookup = new ConcurrentHashMap<>();
```

这里的泛型 T 来自于 AbstractHandlerMethodMapping 类的定义，代码如下：

```java
public abstract class AbstractHandlerMethodMapping<T> extends AbstractHandlerMapping implements InitializingBean {
    ......
}
```

这个泛型 T 官方的解释是：

> the mapping for a [`HandlerMethod`](https://docs.spring.io/spring-framework/docs/5.3.7/javadoc-api/org/springframework/web/method/HandlerMethod.html) containing the conditions needed to match the handler method to an incoming request.

也就是用来匹配 Handler 的条件专门使用的一种类，这里的条件就不只是 url 了，还可以又很多其他条件，如 request 的类型（Get、Post 等等）、请求的参数、Header 等都可以作为匹配 HandlerMethod 的条件。默认使用的是 RequestMappingInfo，从 RequestMappingInfoHandlerMapping 的定义就可以看出：

```java
public abstract class RequestMappingInfoHandlerMapping extends AbstractHandlerMethodMapping<RequestMappingInfo> {
    ......
}
```

RequestMappingInfo 实现了 RequestCondition 接口，此接口专门用于保存从 request 提取出的用于匹配 Handler 的条件，结构如图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031145450.png)

抽象实现 AbstractRquestCondition 共有 9 个子类，这里就不画出来了。而它本身重写了 equals、hashCode 和 toString 三个方法。

它的 9 个子类中，除了 `CompositeRequestCondition` 外每个子类都代表一种匹配条件，比如，`PatternsRequestCondition`  和 `PathPatternsRequestCondition` 使用 url 做匹配，但是它们两者又有不同之处。

`RequestMethodsRequestCondition` 使用 Requestmethod 做匹配等等。

CompositeRequestCondition 本身并不做匹配，而是可以将多个别的 RequestCondition 封装到自己的一个变量数组中，在用的时候遍历这个数组进行匹配，这就是大家熟悉的 <mark>责任链模式</mark>，这种模式在 Spring MVC 中非常常见，类名一般是 **CompositeXXX** 或者 **XXXComposite** 的形式，它们主要的作用就是为了方便调用。

<br/>

RequestCondition 的另一个实现就是这里要用的 RequestMappingInfo，它里面用了八个变量保存八个 RequestCondition，在匹配时使用这八个变量进行匹配，这也就是可以在 @RequestMapping 中给处理器指定多种匹配方式的原因。

> 三个 Map

- handlerMethods：保存着匹配条件（也就是 RequestCondition）和 HandlerMethod 的对应关系
- pathLookup：保存着 url 与匹配条件（也就是 RequestCondition）的对应关系，当然这里的 url 是 Pattern 式的，可以使用通配符。此外这里使用的 Map 也不是普通的 Map，而是 LinkedMultiValueMap，这种 Map 实质是 MultiValueMap，是一种一个 key 对应多个值的 Map，其实它的 value 是一个 List 类型的值。由于 RequestCondition 可以同时使用多种不同的匹配方式而不只是 url 一种，所以反过来说同一个 url 就可能有多个 RequestCondition 与之对应。这里的 RequestCondition 其实就是在 @RequestMapping 中注释的内容。

```java
public interface MultiValueMap<K, V> extends Map<K, List<V>>
```

- nameLookup：保存着 name 与 HandlerMethod 的对应关系，它使用的线程安全的 HashMap，即 ConcurrentHashMap，而且也是一个 key 对应多个 value，也就是说一个 name 可以有多个 HandlerMethod。这里的 name 是使用 HandlerMethodMappingNamingStrategy 策略的实现类从 HandlerMethod 中解析出来的，默认使用 RequestMappingInfoHandlerMethodMappingNamingStrategy 实现类，解析规则是：类名里的大写字母组合 + "#" + 方法名。这个 Map 在正常的匹配过程并不需要使用，它主要用字啊 MvcUriComponentsBilder 里面，可以用来根据 name 获取相应的 url，比如：

```java
MvcUriComponentsBuilder.MethodArgumentBuilder uriComponents = MvcUriComponentsBuilder.fromMappingName("HC#index");
        String uri = uriComponents.build();
```

这样就可以构造出 url —— http://localhost:8080/index，也就是在 HelloController 中定义的 `@RequestMapping(value = {"index", "/"}, method = {RequestMethod.GET})`。

可以在 jsp 中通过 spring 的标签来使用，如 `<a href="${s:mvcUrl('HC#index')}">Go</a>`

这三个 Map 如何使用呢？

nameLookup 刚刚已经介绍过了，下面看看 pathLookup 和 handlerMethods。

前者保存着 url 和 匹配条件的对应关系，可以通过 url 拿到匹配条件，后者保存着匹配条件与 HandlerMethod 之间的关系，可以通过前者拿到的匹配条件得到具体的 HandleMethod。需要注意的是前者返回的可能是多个匹配条件而不是一个，这时候还需要选出一个最优的，然后才可以获得 HandlerMethod。



理解了这三个 Map 再来看 AbstractHandlerMethodMapping 系列的创建就容易多了，AbstractHandlerMethodMapping 实现了 `InitializingBean` 接口，所以 spring 容器会自动调用其 `afterPropertiesSet` 方法，afterPropertiesSet 又交给 `initHandlerMethods` 方法完成具体的初始化，代码如下：

```java
// org.springframework.web.servlet.handler.AbstractHandlerMethodMapping

@Override
public void afterPropertiesSet() {
    initHandlerMethods();
}

protected void initHandlerMethods() {
    for (String beanName : getCandidateBeanNames()) {
        if (!beanName.startsWith(SCOPED_TARGET_NAME_PREFIX)) {
            processCandidateBean(beanName);
        }
    }
    // 可以对 Handler 进行一些初始化，是一个模板方法，但是子类并没有实现
    handlerMethodsInitialized(getHandlerMethods());
}

// 筛选方法
protected void processCandidateBean(String beanName) {
    Class<?> beanType = null;
    try {
        beanType = obtainApplicationContext().getType(beanName);
    }
    catch (Throwable ex) {
        // An unresolvable bean type, probably from a lazy bean - let's ignore it.
        if (logger.isTraceEnabled()) {
            logger.trace("Could not resolve type for bean '" + beanName + "'", ex);
        }
    }
    if (beanType != null && isHandler(beanType)) {
        // 将 Handler 保存到 Map 中的方法
        detectHandlerMethods(beanName);
    }
}
```

这里和 AbstractDetectingUrlHandlerMapping 类似，都是首先从容器中拿到所有的 bean，然后根据一定规则筛选出 Handler，最后保存到 Map 里。

实际的筛选方法是 processCandidateBean 中的 isHandler 方法，这是一个模板方法，具体实现在 RequestMappingHandlerMapping 里面，筛选的逻辑是检查类前是否又 @Controller 或者 @RequestMapping 注解，代码如下：

```java
// org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping

@Override
protected boolean isHandler(Class<?> beanType) {
    return (AnnotatedElementUtils.hasAnnotation(beanType, Controller.class) ||
            AnnotatedElementUtils.hasAnnotation(beanType, RequestMapping.class));
}
```

接着看 detectHandlerMethods 方法，它的主要作用是从 Handler Bean 中找到 handler method，最后将其保存到 Map 里。

```java
// org.springframework.web.servlet.handler.AbstractHandlerMethodMapping

protected void detectHandlerMethods(Object handler) {
    // 获取 Handler 的类型
    Class<?> handlerType = (handler instanceof String ?
                            obtainApplicationContext().getType((String) handler) : handler.getClass());

    if (handlerType != null) {
        // 如果是 cglib 代理的子对象类型，则返回父类型，否则直接返回传入的类型
        Class<?> userType = ClassUtils.getUserClass(handlerType);
        // 获取当前 bean 里所有符合 Handler 要求的 Method
        Map<Method, T> methods = MethodIntrospector.selectMethods(userType,
                                                                  (MethodIntrospector.MetadataLookup<T>) method -> {
                                                                      try {
                                                                          return getMappingForMethod(method, userType);
                                                                      }
                                                                      catch (Throwable ex) {
                                                                          throw new IllegalStateException("Invalid mapping on handler class [" +
                                                                                                          userType.getName() + "]: " + method, ex);
                                                                      }
                                                                  });
        if (logger.isTraceEnabled()) {
            logger.trace(formatMappings(userType, methods));
        }
        else if (mappingsLogger.isDebugEnabled()) {
            mappingsLogger.debug(formatMappings(userType, methods));
        }
        // 将符合要求的 Method 注册，也就是保存到三个 Map 中
        methods.forEach((method, mapping) -> {
            Method invocableMethod = AopUtils.selectInvocableMethod(method, userType);
            registerHandlerMethod(handler, invocableMethod, mapping);
        });
    }
}
```

detectHandlerMethods 方法分为两步：

首先从传入的处理器中找到符合要求的方法，然后使用 `registerHandlerMethod` 进行注册（也就是保存到 Map 中）。从这里可以看出 spring 其实是将处理请求的方法所在的类当作处理器了，而不是处理请求的方法，不过很多地方需要使用处理请求的方法作为处理器来理解才容易理解，而且 spring 本身在有些场景中也将处理请求的方法 HandlerMethod 当作处理器了，比如 AbstractHandlerMethodMapping 的 getHandlerInternal 方法返回的处理器就是 HandlerMethod 类型，在 RequestMappingHandlerAdapter 中判断是不是支持的 Handler 时也是通过检查是不是 HandlerMethod 类型来判断的。

 

#### 3.2、使用 AbstractHandlerMethodMapping

通过前面的分析，可知这里的主要功能是通过 `getHandlerInternl` 方法获取处理器，代码如下:

```java
// org.springframework.web.servlet.handler.AbstractHandlerMethodMapping

@Override
@Nullable
protected HandlerMethod getHandlerInternal(HttpServletRequest request) throws Exception {
    String lookupPath = initLookupPath(request);
    this.mappingRegistry.acquireReadLock();
    try {
        HandlerMethod handlerMethod = lookupHandlerMethod(lookupPath, request);
        return (handlerMethod != null ? handlerMethod.createWithResolvedBean() : null);
    }
    finally {
        this.mappingRegistry.releaseReadLock();
    }
}
```

这里主要就做了三件事：

1. 根据 request 获取 lookupPath，可以简单的理解为 url
2. 使用 lookupHandlerMethod 方法通过 lookupPath 和 request 找到 handlerMethod
3. 如果可以找到 handlerMethod 则调用它的 createWithResolvedBean 方法创建新的 HandlerMethod 返回，createWithResolvedBean 的作用是判断 handlerMethod 里的 handler 是不是 String 类型，如果是则改为将其作为 beanName 从容器中获取 bean，不过 HandlerMethod 中的属性都是 final 类型的，不可以修改，所以在 createWithResolvedBean 方法中又用原来的属性和修改后的 handler 新建了一个 HandlerMethod

先看看具体查找 HandlerMethod 的 `lookupHandlerMethod ` 方法：

```java
// org.springframework.web.servlet.handler.AbstractHandlerMethodMapping

@Nullable
protected HandlerMethod lookupHandlerMethod(String lookupPath, HttpServletRequest request) throws Exception {
    // Match 是内部类，保存匹配条件和 Handler
    List<Match> matches = new ArrayList<>();
    // 首先根据 lookupPath 找到匹配条件
    List<T> directPathMatches = this.mappingRegistry.getMappingsByDirectPath(lookupPath);
    if (directPathMatches != null) {
        // 将匹配条件添加到 matches
        addMatchingMappings(directPathMatches, matches, request);
    }
    // 如果不能直接使用 lookupPath 得到匹配条件，则将所有匹配条件加入 matches
    if (matches.isEmpty()) {
        addMatchingMappings(this.mappingRegistry.getRegistrations().keySet(), matches, request);
    }
    // 将包含匹配条件和 Handler 的 matches 排序，并获取第一个作为 bestMatch，如果前面两个排序相同则抛出异常
    if (!matches.isEmpty()) {
        Match bestMatch = matches.get(0);
        if (matches.size() > 1) {
            Comparator<Match> comparator = new MatchComparator(getMappingComparator(request));
            matches.sort(comparator);
            bestMatch = matches.get(0);
            if (logger.isTraceEnabled()) {
                logger.trace(matches.size() + " matching mappings: " + matches);
            }
            if (CorsUtils.isPreFlightRequest(request)) {
                for (Match match : matches) {
                    if (match.hasCorsConfig()) {
                        return PREFLIGHT_AMBIGUOUS_MATCH;
                    }
                }
            }
            else {
                Match secondBestMatch = matches.get(1);
                if (comparator.compare(bestMatch, secondBestMatch) == 0) {
                    Method m1 = bestMatch.getHandlerMethod().getMethod();
                    Method m2 = secondBestMatch.getHandlerMethod().getMethod();
                    String uri = request.getRequestURI();
                    throw new IllegalStateException(
                        "Ambiguous handler methods mapped for '" + uri + "': {" + m1 + ", " + m2 + "}");
                }
            }
        }
        request.setAttribute(BEST_MATCHING_HANDLER_ATTRIBUTE, bestMatch.getHandlerMethod());
        handleMatch(bestMatch.mapping, lookupPath, request);
        return bestMatch.getHandlerMethod();
    }
    else {
        return handleNoMatch(this.mappingRegistry.getRegistrations().keySet(), lookupPath, request);
    }
}
```

整个过程中是以 Match 作为载体的，Match 是个内部类，封装了匹配条件和 HandlerMethod 两个属性，子类 RequestMappingInfoHandlerMapping 中进行了重写，将更多的参数设置到了 request，主要是为了以后使用时方便，跟 Mapping 没有关系。

### 4、小结

前面分析了 Spring MVC 中的 HandlerMapping 的各种具体实现方式。

HandlerMapping 的整体结构在 AbstractHandlerMapping 中涉及，简单来说其功能就是根据 request 找到 Handler 和 Interceptors，组合成 HandlerExecutionChain 类型并返回。

找 Handler 的过程通过模板方法 getHandlerInternal 留给子类实现，查找 Interceptors 则是 AbstractHandlerMapping 自己完成的，查找的具体方法是通过几个与 Interceptor 相关的 Map 完成的，在初始化过程中对那些 Map 进行了初始化。

AbstractHandlerMapping 的子类分为两个系类：AbstractUrlHandlerMapping 和 AbstractHandlerMethodMapping 系列，前者通过 url 匹配的，后者匹配的内容更多，而且是直接匹配到 Method，这也是使用最多的一种方式。
