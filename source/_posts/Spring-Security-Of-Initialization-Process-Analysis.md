---
title: Spring Security Of Initialization Process Analysis
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211130165313.jpg'
coverImg: /img/20211130165313.jpg
cover: false
toc: true
mathjax: false
date: 2022-01-05 16:06:52
summary: "Spring Security 初始化流程分析"
categories: "Spring Security"
keywords: "Spring Security"
tags: "Spring Security"
---



# 初始化流程分析

## 1、ObjectPostProcessor

`ObjectPostProcessor` 是 Spring Security 中使用频率最高的组件之一，它是一个对象后置处理器，当一个对象创建成功后，如果还有一些额外的事情需要补充，那么可以通过 `ObjectPostProcessor` 来处理。

该接口中默认只有一个方法 `postProcess`，该方法用来完成对对象的二次处理：

```java
public interface ObjectPostProcessor<T> {

	/**
	 * Initialize the object possibly returning a modified instance that should be used
	 * instead.
	 * @param object the object to initialize
	 * @return the initialized version of the object
	 */
	<O extends T> O postProcess(O object);

}
```



`ObjectPostProcessor`  默认有两个继承类：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220105161357.png)

- `AutowireBeanFactoryObjectPostProcessor`：由于 Spring Security 中大量采用了 Java 配置，许多过滤器都是直接 new 处理的，这些 new 出来的对象并不会自动注入到 Spring 容器中。而 Spring Security 为了让这些 new 出来的对象更方便的被注入到容器中，提供了 `AutowireBeanFactoryObjectPostProcessor` 这个后置处理器。
  - 只需调用 `AutowireBeanFactoryObjectPostProcessor#postProcess` 方法，就可以将 new 出来的对象成功注入到 Spring 容器中，它的实现原理就是调用 Spring 容器中的 `AutowireCapableBeanFactory` 对象将一个 new 出来的对象注入到 Spring 容器中。
- `CompositeObjectPostProcessor` 是一个私有内部类：它实现了 `ObjectPostProcessor` 接口，一个对象可以有一个后置处理器，但是开发者也可以自定义多个对象后置处理器。
  - `CompositeObjectPostProcessor` 是一个组合的对象后置处理器，它里面维护了一个 List 集合，集合中存放了所有 `ObjectPostProcessor` 实例，分别调用实例的 postProcess 方法进行对象后置处理。
- 在 Spring Security 框架中，最终使用的对象后置处理器其实就是 `CompositeObjectPostProcessor`，它里面的集合默认只有一个对象，就是 `AutowireBeanFactoryObjectPostProcessor`。



> 过滤器和配置器

在 Spring Security 中，开发者可以灵活地配置项目中需要哪些 Spring Security 过滤器，一旦选定过滤器后，每一个过滤器都会有一个对应的配置器，叫做 `xxxConfigurer`（例如 `CorsConfigurer`、`CsrfConfigurer` 等等），它会将这些过滤器注入到 Spring 容器中。



## 2、SecurityFilterChain

从名称上看，`SecurityFilterChain` 就是 Spring Security 中的过滤器链对象。

```java
public interface SecurityFilterChain {

	boolean matches(HttpServletRequest request);

	List<Filter> getFilters();

}
```

可以看到，该接口共有两个方法：

（1）`matches`：该方法用于判断 request 请求是否应该被当前过滤器链所处理；

（2）`getFilters`：该方法返回一个 List 集合，集合中存放的就是 Spring Security 中的过滤器；

也就是说，如果 `matches` 方法返回 true，那么 request 请求就会在 `getFilters` 方法所返回的 Filter 集合中被处理。



### DefaultSecurityFilterChain

`SecurityFilterChain` 只有一个默认实现：`DefaultSecurityFilterChain`。其中定义了两个属性，并实现了接口中的两个方法：

```java
public final class DefaultSecurityFilterChain implements SecurityFilterChain {

	private static final Log logger = LogFactory.getLog(DefaultSecurityFilterChain.class);

	private final RequestMatcher requestMatcher;

	private final List<Filter> filters;

	public DefaultSecurityFilterChain(RequestMatcher requestMatcher, Filter... filters) {
		this(requestMatcher, Arrays.asList(filters));
	}

	public DefaultSecurityFilterChain(RequestMatcher requestMatcher, List<Filter> filters) {
		logger.info(LogMessage.format("Will secure %s with %s", requestMatcher, filters));
		this.requestMatcher = requestMatcher;
		this.filters = new ArrayList<>(filters);
	}

	public RequestMatcher getRequestMatcher() {
		return this.requestMatcher;
	}

	@Override
	public List<Filter> getFilters() {
		return this.filters;
	}

	@Override
	public boolean matches(HttpServletRequest request) {
		return this.requestMatcher.matches(request);
	}

	@Override
	public String toString() {
		return this.getClass().getSimpleName() + " [RequestMatcher=" + this.requestMatcher + ", Filters=" + this.filters
				+ "]";
	}

}
```

可以看到，在 `DefaultSecurityFilterChain` 的构造方法中，需要传入两个对象，一个是请求匹配器 `requestMatcher`，一个是过滤器集合或者过滤器数组 filters。

> 注意

在一个 Spring Security 项目中，`SecurityFilterChain` 的实例可能会有多个。



## 3、SecurityBuilder

Spring Security 中所有需要构建的对象都可以通过 `SecurityBuilder` 来实现，默认的过滤器链、代理过滤器、`AuthenticationManager` 等等，都可以通过 `SecurityBuilder` 来构建。

`SecurityBuilder` 的实现类如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220105165118.png)

先看 `SecurityBuilder` 的源码：

```java
public interface SecurityBuilder<O> {

	/**
	 * Builds the object and returns it or null.
	 * @return the Object to be built or null if the implementation allows it.
	 * @throws Exception if an error occurred when building the Object
	 */
	O build() throws Exception;
}
```

很简单，只有一个 build 方法，就是对象构建方法。build 方法的返回值，就是具体构建的对象泛型 O，也就是说不同的 `SecurityBuilder` 将会构建出不同的对象。



### (1) HttpSecurityBuilder

`HttpSecurityBuilder` 是用来构建 `HttpSecurity` 对象的，`HttpSecurityBuilder` 源码如下：

```java
public interface HttpSecurityBuilder<H extends HttpSecurityBuilder<H>>
		extends SecurityBuilder<DefaultSecurityFilterChain> {

	<C extends SecurityConfigurer<DefaultSecurityFilterChain, H>> C getConfigurer(Class<C> clazz);

	<C extends SecurityConfigurer<DefaultSecurityFilterChain, H>> C removeConfigurer(Class<C> clazz);

	<C> void setSharedObject(Class<C> sharedType, C object);

	<C> C getSharedObject(Class<C> sharedType);

	H authenticationProvider(AuthenticationProvider authenticationProvider);

	H userDetailsService(UserDetailsService userDetailsService) throws Exception;

	H addFilterAfter(Filter filter, Class<? extends Filter> afterFilter);

	H addFilterBefore(Filter filter, Class<? extends Filter> beforeFilter);

	H addFilter(Filter filter);
}
```

简单分析一下：

（1）`HttpSecurityBuilder` 对象本身在定义时就有一个泛型，这个泛型是 `HttpSecurityBuilder` 的子类，由于默认情况下 `HttpSecurityBuilder` 的实现类只有一个 `HttpSecurity`，所以可以暂且把接口中的 H 都当作 HttpSecurity 来理解；

（2）`HttpSecurityBuilder` 继承自 `SecurityBuilder` 接口，同时也指定了 `SecurityBuilder` 中的泛型为 `DefaultSecurityFilterChain`，也就是说，最终想要构建的对象是 DefaultSecurityFilterChain；

（3）`getConfigurer` 方法用来获取一个配置器，所谓的配置其就是 xxxConfigurer；

（4）`removeConfigurer` 方法用来移除一个配置器（相当于从 Spring Security 过滤器链中移除一个过滤器；

（5）`setSharedObject/getSharedObject` 这两个方法用来设置获取获取一个可以在多个配置器之间共享的对象；

（6）`authenticationProvider` 方法可以用来配置一个认证器 `AuthenticationProvider`；

（7）`userDetailsService` 方法可以用来配置一个数据源 `UserDetailsService`；

（8）`addFilterAfter/addFilterBefore` 方法表示在某一个过滤器之后或者之前添加一个自定义的过滤器；

（9）`addFilter` 方法可以添加一个过滤器，这个过滤器必须是 Spring Security 框架提供的过滤器的一个实例或者其扩展，添加完成后，回自动进行过滤器的排序。



### (2) AbstractSecurityBuilder

`AbstractSecurityBuilder` 实现了 `SecurityBuilder` 接口，并对 build 做了完善，确保只 build 一次，看一下源码：

```java
public abstract class AbstractSecurityBuilder<O> implements SecurityBuilder<O> {

	private AtomicBoolean building = new AtomicBoolean();

	private O object;

	@Override
	public final O build() throws Exception {
		if (this.building.compareAndSet(false, true)) {
			this.object = doBuild();
			return this.object;
		}
		throw new AlreadyBuiltException("This object has already been built");
	}

	public final O getObject() {
		if (!this.building.get()) {
			throw new IllegalStateException("This object has not been built");
		}
		return this.object;
	}

    // 子类实现（模板方法）
	protected abstract O doBuild() throws Exception;
}
```

可以看到，在 `AbstractSecurityBuilder` 抽象类中：

（1）首先声明了 building 变量，可以确保即使在多线程环境下，配置类也只构建一次；

（2）对 build 方法进行重写，并设置为 final，这样在 `AbstractSecurityBuilder` 的子类中将不能再次重写 build 方法。在 build 方法内部，通过 building 变量来控制配置类只构建一次，具体的构建工作则交给 `doBuild` 方法去完成；

（3）`getObject` 方法用来返回构建的对象；

（4）`doBuild` 方法则是具体的构建方法，具体实现在其子类中。



总而言之，`AbstractSecurityBuilder` 的作用就是保证目标对象只被构建一次。

### (3) AbstractConfiguredSecurityBuilder

`AbstractConfiguredSecurityBuilder` 也是一个抽象类，它继承了 `AbstractSecurityBuilder`。

在该抽象类中声明了一个枚举类，用来描述构建过程中的不同状态：

```java
private enum BuildState {

    UNBUILT(0),

    INITIALIZING(1),

    CONFIGURING(2),

    BUILDING(3),

    BUILT(4);

    private final int order;

    BuildState(int order) {
        this.order = order;
    }

    public boolean isInitializing() {
        return INITIALIZING.order == this.order;
    }

    public boolean isConfigured() {
        return this.order >= CONFIGURING.order;
    }
}
```

可以看到，整个构建过程一共有五种不同的状态：

- **UNBUILT**：配置类构建前
- **INITIALIZING**：初始化中（初始化完成之前是这个状态）
- **CONFIGURING**：配置中（配置完成之前是这个状态）
- **BUILDING**：构建中
- **BUILT**：构建完成

这个枚举类还提供两个方法：`isInitializing` 表示是否正在初始化中，`isConfigured` 表示是否已完成配置。

`AbstractConfiguredSecurityBuilder` 中还声明了 configurers 变量，用来保存所有的配置类。

针对 configurers 变量，我们可以进行添加配置、移除配置等操作，相关方法如下：

```java
public abstract class AbstractConfiguredSecurityBuilder<O, B extends SecurityBuilder<O>>
		extends AbstractSecurityBuilder<O> {
    
    private final LinkedHashMap<Class<? extends SecurityConfigurer<O, B>>, List<SecurityConfigurer<O, B>>> configurers = new LinkedHashMap<>();
    
    public <C extends SecurityConfigurerAdapter<O, B>> C apply(C configurer) throws Exception {
		configurer.addObjectPostProcessor(this.objectPostProcessor);
		configurer.setBuilder((B) this);
		add(configurer);
		return configurer;
	}
    
    public <C extends SecurityConfigurer<O, B>> C apply(C configurer) throws Exception {
		add(configurer);
		return configurer;
	}
    
    private <C extends SecurityConfigurer<O, B>> void add(C configurer) {
		Assert.notNull(configurer, "configurer cannot be null");
		Class<? extends SecurityConfigurer<O, B>> clazz = (Class<? extends SecurityConfigurer<O, B>>) configurer
				.getClass();
		synchronized (this.configurers) {
			if (this.buildState.isConfigured()) {
				throw new IllegalStateException("Cannot apply " + configurer + " to already built object");
			}
			List<SecurityConfigurer<O, B>> configs = null;
			if (this.allowConfigurersOfSameType) {
				configs = this.configurers.get(clazz);
			}
			configs = (configs != null) ? configs : new ArrayList<>(1);
			configs.add(configurer);
			this.configurers.put(clazz, configs);
			if (this.buildState.isInitializing()) {
				this.configurersAddedInInitializing.add(configurer);
			}
		}
	}
    
    public <C extends SecurityConfigurer<O, B>> List<C> getConfigurers(Class<C> clazz) {
		List<C> configs = (List<C>) this.configurers.get(clazz);
		if (configs == null) {
			return new ArrayList<>();
		}
		return new ArrayList<>(configs);
	}
    
    public <C extends SecurityConfigurer<O, B>> List<C> removeConfigurers(Class<C> clazz) {
		List<C> configs = (List<C>) this.configurers.remove(clazz);
		if (configs == null) {
			return new ArrayList<>();
		}
		return new ArrayList<>(configs);
	}
    
    public <C extends SecurityConfigurer<O, B>> C getConfigurer(Class<C> clazz) {
		List<SecurityConfigurer<O, B>> configs = this.configurers.get(clazz);
		if (configs == null) {
			return null;
		}
		Assert.state(configs.size() == 1,
				() -> "Only one configurer expected for type " + clazz + ", but got " + configs);
		return (C) configs.get(0);
	}
    
    public <C extends SecurityConfigurer<O, B>> C removeConfigurer(Class<C> clazz) {
		List<SecurityConfigurer<O, B>> configs = this.configurers.remove(clazz);
		if (configs == null) {
			return null;
		}
		Assert.state(configs.size() == 1,
				() -> "Only one configurer expected for type " + clazz + ", but got " + configs);
		return (C) configs.get(0);
	}
}
```

简单分析一下：

（1）首先声明了一个 `configurers` 变量（map），用来保存所有的配置类，key  是配置类 Class 对象，值是一个存放着配置类的 List 集合；

（2）`apply` 方法有两个，参数类型略有差异，主要功能基本一致，都是向 `configurers` 变量中添加配置类，具体的添加过程则是调用 `add` 方法；

（3）`add` 方法用来将所有的配置类保存到 `configurers` 中，在添加的过程中，如果 `allowConfigurersOfSameType` 的值为 true，则表示允许相同类型的配置类存在，也就是 List 集合中可以存在多个相同类型的配置类。默认情况下，如果是普通配置类，`allowConfigurersOfSameType` 的值为 false，所以 List 集合中的配置类始终只有一个配置类；如果在 `AuthenticationManagerBuilder` 中设置 `allowConfigurersOfSameType` 为 true，此时相同类型的配置类可以有多个；

（4）`getConfigurers(Class<C> clazz)`  方法可以从 `configurers` 中返回某一个配置类对应的所有实例；

（5）`removeConfigurer(Class<C> clazz)` 方法可以从 `configurers` 中移除某一个配置类对应的所有实例，并返回被移除的配置类实例集合；

（6）`getConfigurer(Class<C> clazz)` 方法从 `configurers` 中找到某一个配置类对应的所有实例的集合，最后返回集合的第一个元素；

（7）`removeConfigurer(Class<C> clazz)` 方法从 `configurers` 中移除某一个配置类对应的所有实例，并返回被移除实例集合的第一个元素；

（8）`getConfigurers` 方法是一个私有方法，在其内部构造了一个 ArrayList， 并用它存储所有从 `configurers` 中拿出来的 value，也就是说该 List 存储了所有的配置类实例。在配置类初始化和配置的时候，回调用到该方法。

上面就是 `AbstractConfiguredSecurityBuilder` 中关于 `configurers` 的所有操作了，接下来是该抽象类的核心方法：<strong style="color:red">doBuild</strong> 方法。

> doBuild（）

`doBuild()` 方法是核心的构造方法，看源码：

```java
// org.springframework.security.config.annotation.AbstractConfiguredSecurityBuilder#doBuild

protected final O doBuild() throws Exception {
    synchronized (this.configurers) {
        this.buildState = BuildState.INITIALIZING;
        beforeInit();
        init();
        this.buildState = BuildState.CONFIGURING;
        beforeConfigure();
        configure();
        this.buildState = BuildState.BUILDING;
        O result = performBuild();
        this.buildState = BuildState.BUILT;
        return result;
    }
}

// 初始化之前
protected void beforeInit() throws Exception {
}

// 初始化
private void init() throws Exception {
    Collection<SecurityConfigurer<O, B>> configurers = getConfigurers();
    for (SecurityConfigurer<O, B> configurer : configurers) {
        configurer.init((B) this);
    }
    for (SecurityConfigurer<O, B> configurer : this.configurersAddedInInitializing) {
        configurer.init((B) this);
    }
}

// 配置之前
protected void beforeConfigure() throws Exception {
}

// 配置
private void configure() throws Exception {
    Collection<SecurityConfigurer<O, B>> configurers = getConfigurers();
    for (SecurityConfigurer<O, B> configurer : configurers) {
        configurer.configure((B) this);
    }
}

// 构建
protected abstract O performBuild() throws Exception;
```

这个方法有点类似于 SpringMVC 中 `DispatcherServlet` 的入口方法 `onRefresh` 内部调用的 `initStrategy()` 方法，该方法也是定义了一系列模板方法。

回到正题，看看 `doBuild()` 方法的逻辑：

（1）在 `doBuild()` 方法中，一边更新构建状态，一边执行构建方法。构建方法中，`beforeInit` 是一个空的初始化方法，如果需要在初始化之前做一些准备工作，可以通过重写该方法实现；

（2）`init` 方法是所有配置类的初始化方法，在该方法中，遍历所有的配置类，并调用其 `init` 方法完成初始化操作；

（3）`beforeConfigure` 方法可以在 `configure` 方法执行之前做一些准备工作。该方法默认也是空方法；

（4）`configure` 方法用来完成所有配置类的配置，在该方法中，遍历所有配置类分别调用其 `configure` 方法完成配置；

（5）`performBuild` 方法用来做最终的构建操作，前面的准备工作完成后，最后在 `performBuild` 方法中完成构建，这是一个抽象方法，具体实现则在不同的实现类中。



上面就是 `AbstractConfiguredSecurityBuilder` 中最主要的几个方法。



### (4) ProviderManagerBuilder

`ProviderManagerBuilder` 继承自 `SecurityBuilder` 接口，并指定了构建的对象是 `AuthenticationManager`，代码如下：

```java
public interface ProviderManagerBuilder<B extends ProviderManagerBuilder<B>>
		extends SecurityBuilder<AuthenticationManager> {

	B authenticationProvider(AuthenticationProvider authenticationProvider);
}
```

可以看到 `ProviderManagerBuilder` 中增加了一个 `authenticationProvider` 方法，同时通过泛型指定了构建的对象为 `AuthenticationManager`。



### (5) AuthenticationManagerBuilder

`AuthenticationManagerBuilder` 用来构建 `AuthenticationManager` 对象，它继承自 `AbstractConfiguredSecurityBuilder` 并实现了 `ProviderManagerBuilder` 接口，源码较长，下面看一下常用的部分代码：

```java
public class AuthenticationManagerBuilder
		extends AbstractConfiguredSecurityBuilder<AuthenticationManager, AuthenticationManagerBuilder>
		implements ProviderManagerBuilder<AuthenticationManagerBuilder> {
    
    // 构造器
    public AuthenticationManagerBuilder(ObjectPostProcessor<Object> objectPostProcessor) {
		super(objectPostProcessor, true);
	}
    
    // 设置 AuthenticationManager 的 parent
    public AuthenticationManagerBuilder parentAuthenticationManager(AuthenticationManager authenticationManager) {
		if (authenticationManager instanceof ProviderManager) {
			eraseCredentials(((ProviderManager) authenticationManager).isEraseCredentialsAfterAuthentication());
		}
		this.parentAuthenticationManager = authenticationManager;
		return this;
	}
   	
    public InMemoryUserDetailsManagerConfigurer<AuthenticationManagerBuilder> inMemoryAuthentication()
			throws Exception {
		return apply(new InMemoryUserDetailsManagerConfigurer<>());
	}
    
    public JdbcUserDetailsManagerConfigurer<AuthenticationManagerBuilder> jdbcAuthentication() throws Exception {
		return apply(new JdbcUserDetailsManagerConfigurer<>());
	}
    
    public <T extends UserDetailsService> DaoAuthenticationConfigurer<AuthenticationManagerBuilder, T> userDetailsService(
			T userDetailsService) throws Exception {
		this.defaultUserDetailsService = userDetailsService;
		return apply(new DaoAuthenticationConfigurer<>(userDetailsService));
	}
    
    public AuthenticationManagerBuilder authenticationProvider(AuthenticationProvider authenticationProvider) {
		this.authenticationProviders.add(authenticationProvider);
		return this;
	}
    
    // 最终构建方法
    @Override
	protected ProviderManager performBuild() throws Exception {
		if (!isConfigured()) {
			this.logger.debug("No authenticationProviders and no parentAuthenticationManager defined. Returning null.");
			return null;
		}
		ProviderManager providerManager = new ProviderManager(this.authenticationProviders,
				this.parentAuthenticationManager);
		if (this.eraseCredentials != null) {
			providerManager.setEraseCredentialsAfterAuthentication(this.eraseCredentials);
		}
		if (this.eventPublisher != null) {
			providerManager.setAuthenticationEventPublisher(this.eventPublisher);
		}
		providerManager = postProcess(providerManager);
		return providerManager;
	}
    
}
```

（1）首先在 `AuthenticationManagerBuilder` 的构造方法中，调用了父类的构造方法，注意第二个参数传递了 true，表示允许相同类型的配置类同时存在（结合 `AbstractConfiguredSecurityBuilder` 源码分析）；

（2）`parentAuthenticationManager` 方法用来给一个 `AuthenticationManager` 设置 parent；

（3）`inMemoryAuthentication` 方法用来配置基于内存的数据源，该方法会自动创建 `InMemoryUserDetailsManagerConfigurer` 配置类，并最终将该配置类添加到父类的 `configurers` 变量中。由于设置了允许相同类型的配置类同时存在，因此 `inMemoryAuthentication` 方法可以反复调用多次；

（4）`jdbcAuthentication` 以及 `userDetailsService` 方法和 `inMemoryAuthentication` 类似，都是用来配置数据源的；

（5）`authenticationProvider` 方法用来向 `authenticationProviders` 集合中添加 `AuthenticationProvider` 对象，之前了解过，一个 `AuthenticationManager` 实例中包含多个 `AuthenticationProvider` 实例，那么多个 `AuthenticationProvider` 实例可以通过 `authenticationProvider` 方法进行添加；

（6）`performBuild` 方法则执行具体的构建工作，常用的 `AuthenticationManager` 实例就是 `ProviderManager`，所以这里创建的是 `ProviderManager` 对象，并且配置 `authenticationProviders` 和 `parentAuthenticationManager` 对象，`ProviderManager` 创建成功后，再去对象后置处理器中处理一遍，最后返回它。

这就是 `AuthenticationManagerBuilder` 的大致逻辑。



### (6) HttpSecurity

`HttpSecurity` 继承了 `AbstractConfiguredSecurityBuilder`，同时实现了 `SecurityBuilder` 接口。



`HttpSecurity` 的主要作用是用来构建一条过滤器链，并反映到代码上，也就是构建一个 `DefaultSecurityFilterChain` 对象。

一个 `DefaultSecurityFilterChain` 对象包含一个路径匹配器和多个 Spring Security 过滤器，`HttpSecurity` 中通过收集各种各样的 xxxConfigurer，将 Spring Security 过滤器对应的配置类收集起来，并保存到父类 `AbstractConfiguredSecurityBuilder` 的 `configurers` 变量中，在后续的构建过程中，再将这些 xxxConfigurers 构建为具体的 Spring Security 过滤器，同时添加到 `HttpSecurity` 的 filters 对象中。

在 `HttpSecurity` 中存在大量功能类似的方法，这里挑选一个作为例子来说明 `HttpSecurity` 的配置原理：

```java
public final class HttpSecurity extends AbstractConfiguredSecurityBuilder<DefaultSecurityFilterChain, HttpSecurity>
		implements SecurityBuilder<DefaultSecurityFilterChain>, HttpSecurityBuilder<HttpSecurity> {
   
    // 无参可重载方法 formLogin()
    public FormLoginConfigurer<HttpSecurity> formLogin()() throws Exception {
		return getOrApply(new FormLoginConfigurer<>());
	}
    
    // 有参可重载方法 formLogin
    public HttpSecurity formLogin(Customizer<FormLoginConfigurer<HttpSecurity>> formLoginCustomizer) throws Exception {
		formLoginCustomizer.customize(getOrApply(new FormLoginConfigurer<>()));
		return HttpSecurity.this;
	}
    
    // 配置执行认证的 AuthenticationProvider 对象
    @Override
	public HttpSecurity authenticationProvider(AuthenticationProvider authenticationProvider) {
		getAuthenticationRegistry().authenticationProvider(authenticationProvider);
		return this;
	}
    
    // 配置 UserDetailsService
    @Override
	public HttpSecurity userDetailsService(UserDetailsService userDetailsService) throws Exception {
		getAuthenticationRegistry().userDetailsService(userDetailsService);
		return this;
	}
    
    private AuthenticationManagerBuilder getAuthenticationRegistry() {
		return getSharedObject(AuthenticationManagerBuilder.class);
	}
    
    // 执行 AuthenticationManager 的构建工作
    @Override
	protected void beforeConfigure() throws Exception {
		if (this.authenticationManager != null) {
			setSharedObject(AuthenticationManager.class, this.authenticationManager);
		}
		else {
			setSharedObject(AuthenticationManager.class, getAuthenticationRegistry().build());
		}
	}
    
    // 进行 DefaultSecurityFilterChain 对象的构建工作
    @Override
	protected DefaultSecurityFilterChain performBuild() {
		this.filters.sort(OrderComparator.INSTANCE);
		List<Filter> sortedFilters = new ArrayList<>(this.filters.size());
		for (Filter filter : this.filters) {
			sortedFilters.add(((OrderedFilter) filter).filter);
		}
		return new DefaultSecurityFilterChain(this.requestMatcher, sortedFilters);
	}
    
    @Override
	public HttpSecurity addFilterAfter(Filter filter, Class<? extends Filter> afterFilter) {
		return addFilterAtOffsetOf(filter, 1, afterFilter);
	}

	@Override
	public HttpSecurity addFilterBefore(Filter filter, Class<? extends Filter> beforeFilter) {
		return addFilterAtOffsetOf(filter, -1, beforeFilter);
	}
	
    @Override
	public HttpSecurity addFilter(Filter filter) {
		Integer order = this.filterOrders.getOrder(filter.getClass());
		if (order == null) {
			throw new IllegalArgumentException("The Filter class " + filter.getClass().getName()
					+ " does not have a registered order and cannot be added without a specified order. Consider using addFilterBefore or addFilterAfter instead.");
		}
		this.filters.add(new OrderedFilter(filter, order));
		return this;
	}
    
    public HttpSecurity addFilterAt(Filter filter, Class<? extends Filter> atFilter) {
		return addFilterAtOffsetOf(filter, 0, atFilter);
	}
    
    private <C extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity>> C getOrApply(C configurer)
			throws Exception {
		C existingConfig = (C) getConfigurer(configurer.getClass());
		if (existingConfig != null) {
			return existingConfig;
		}
		return apply(configurer);
	}
    
}
```

（1）以 form 表单登录配置为例，在 `HttpSecurity` 中有两个重载方法可以进行配置：

- 无参的 `formLogin` 方法，该方法的返回值是一个 `FormLoginConfigurer<HttpSecurity>` 对象，开发者可以在该对象的基础上继续完善对 form 表单的配置，之前我们配置的表单登录都是通过这种方式来进行配置的。
- 有参的 `formLogin` 方法，该方法的参数获取途径是通过 `Customizer` 函数式接口获取的 `FormLoginConfigurer` 对象，返回值则是一个 `HttpSecurity` 对象，也就是说开发者可以提前在外面配置好 `FormLoginConfigurer` 对象，然后直接传进来进行配置即可，返回值说明了可以在该方法返回后直接进行其他过滤器的配置（链式调用）。
- 无论是有参还是无参，最终都会调用到 `getOrApply` 方法，该方法会调用父类的 `apply` 方法添加到父类的 `configurers` 变量中。

`HttpSecurity` 中其他过滤器的配置都和 form 表单登录配置类似。

（2）每一套过滤器链都会有一个 `AuthenticationManager` 对象来进行认证操作（具体执行认证是在 `AuthenticationProvider` 中，如果认证失败，会调用 `AuthenticationManager` 的 parent 再次进行认证），主要是通过 `authenticationProvider` 方法配置执行认证的 `AuthenticationProvider` 对象，通过 `userDetailsService` 方法配置 `UserDetailsService`，最后在 `beforeConfigure` 方法中触发 `AuthenticationManager` 对象的构建；

（3）`performBuild` 方法则色进行 `DefaultSecurityFilterChain` 对象的构建，传入请求匹配器和过滤器集合 filters，在构建之前，会先按照既定的顺序对 filters 进行排序；

（4）通过 `addFilterAfter`、`addFilterBefore` 两个方法，我们可以在某一个过滤器之后或者之前添加一个自定义的过滤器；

（5）`addFilter` 方法可以向过滤器链中添加一个过滤器，这个过滤器必须是 Spring Security 框架提供的过滤器的一个实例或者其扩展。实际上，在每一个 xxxConfigurer 的 configure 方法中，都会调用 addFilter 方法将构建好的过滤器天啊及到 HttpSecurity 中的 filters 集合中；

（6）`addFilterAt` 方法可以在指定位置添加一个过滤器。需要注意的是，在同一个位置添加多个过滤器并不会覆盖现有的过滤器。

这就是 `HttpSecurity` 的基本功能。



### (7) WebSecurity

相比于 `HttpSecurity`，`WebSecurity` 是在一个更大的层面上去构建过滤器。一个 `HttpSecurity` 对象可以构建一个过滤器链，也就是一个 `DefaultSecurityFilterChain` 对象，而一个项目中可以存在多个 `HttpSecurity` 对象，也就可以构建多个 `DefaultSecurityFilterChain` 过滤器链。



`WebSecurity` 负责将 `HttpSecurity` 所构建的 `DefaultSecurityFilterChain` 对象（可能有多个），以及其他一些需要忽略的请求，再次重新构建为一个 `FilterChainProxy` 对象，同时加上 HTTP 防火墙。

这几个过滤器的关系在之前已经说明过，如下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211212110354.png)

看一下 `WebSecurity` 中的几个关键方法：

```java
public final class WebSecurity extends AbstractConfiguredSecurityBuilder<Filter, WebSecurity>
		implements SecurityBuilder<Filter>, ApplicationContextAware {
    
    private final List<RequestMatcher> ignoredRequests = new ArrayList<>();
    
    private final List<SecurityBuilder<? extends SecurityFilterChain>> securityFilterChainBuilders = new ArrayList<>();
    
    public WebSecurity httpFirewall(HttpFirewall httpFirewall) {
		this.httpFirewall = httpFirewall;
		return this;
	}
    
    public WebSecurity addSecurityFilterChainBuilder(
			SecurityBuilder<? extends SecurityFilterChain> securityFilterChainBuilder) {
		this.securityFilterChainBuilders.add(securityFilterChainBuilder);
		return this;
	}
    
    @Override
	protected Filter performBuild() throws Exception {
        
		int chainSize = this.ignoredRequests.size() + this.securityFilterChainBuilders.size();
		List<SecurityFilterChain> securityFilterChains = new ArrayList<>(chainSize);
		for (RequestMatcher ignoredRequest : this.ignoredRequests) {
			securityFilterChains.add(new DefaultSecurityFilterChain(ignoredRequest));
		}
		for (SecurityBuilder<? extends SecurityFilterChain> securityFilterChainBuilder : this.securityFilterChainBuilders) {
			securityFilterChains.add(securityFilterChainBuilder.build());
		}
		FilterChainProxy filterChainProxy = new FilterChainProxy(securityFilterChains);
		if (this.httpFirewall != null) {
			filterChainProxy.setFirewall(this.httpFirewall);
		}
		if (this.requestRejectedHandler != null) {
			filterChainProxy.setRequestRejectedHandler(this.requestRejectedHandler);
		}
		filterChainProxy.afterPropertiesSet();

		Filter result = filterChainProxy;

		this.postBuildAction.run();
		return result;
	}
}
```

（1）首先在 `WebSecurity` 中声明了 `ignoredRequests` 集合，这个集合中保存了所有被忽略的请求，因为在实际项目中，并非所有请求都需要经过 Spring Security 过滤器链，有一些静态资源可能不需要权限认证，直接返回给客户端接口，那么这些需要忽略的请求可以直接保存在 `ignoredRequests` 变量中；

（2）接下来声明一个 `securityFilterChainBuilders` 集合，该集合用来保存所有的 `HttpSecurity` 对象，每一个 `HttpSecurity` 对象创建成功之后，通过 `addSecurityFilterChainBuilder` 方法将 `HttpSecurity` 对象添加到 `securityFilterChainBuilders` 集合中；

（3）`httpFirewall` 方法可以用来配置请求防火墙；

（4）`performBuild` 方法则是具体的构建方法，在该方法中：

- 首先统计出过滤器链的总个数（被忽略的请求个数 + 通过 HttpSecurity 创建出来的过滤器链个数），然后创建一个集合 `securityFilterChains`；
- 遍历所有被忽略的请求并将其构建成 `DefaultSecurityFilterChain` 对象保存到 `securityFilterChains` 集合中。需要注意的是，对于被忽略的请求，在构建 `DefaultSecurityFilterChain` 对象时，只是传入了请求匹配器，而没有传入对应的过滤器链，这就意味着这些被忽略掉的请求，将来不必经过 Spring Security 过滤器链；
- 接下来再遍历 `securityFilterChainBuilders` 集合，调用每个对象的 build 方法构建 `DefaultSecurityFilterChain` 并存入到 `securityFilterChains` 集合中；
- 然后传入 `securityFilterChains` 集合构建 `FilterChainProxy` 对象；
- 最后再设置 HTTP 防火墙。

所有设置完成之后，最后返回 `filterChainProxy` 对象。



`FilterChainProxy` 就是我们最终构建出来的过滤器链，通过 Spring 提供的 `DelegatingFilterProxy` 将 `FilterChainProxy` 对象嵌入到 Web Filter 中（原生过滤器链中）。



## 4、FilterChainProxy

`FilterChainProxy` 通过 `DelegatingFilterProxy` 代理过滤器被集成到 Web Filter 中，`DelegatingFilterProxy` 作为一个代理对象，它并不承载具体的业务。

所以 Spring Security 中的过滤器链的最终执行，就是在 `FilterChainProxy` 中，分析一下它的源码：

```java
public class FilterChainProxy extends GenericFilterBean {
    
    private List<SecurityFilterChain> filterChains;
    
    private FilterChainValidator filterChainValidator = new NullFilterChainValidator();
    
    private HttpFirewall firewall = new StrictHttpFirewall();
    
    public FilterChainProxy() {
	}
    
    public FilterChainProxy(SecurityFilterChain chain) {
		this(Arrays.asList(chain));
	}

	public FilterChainProxy(List<SecurityFilterChain> filterChains) {
		this.filterChains = filterChains;
	}
}
```

首先声明了三个变量：

- 由于在 Spring Security 中可以同时存在多个过滤器链，`filterChains` 就是用来保存过滤器链的；
- `filterChainValidator` 是一个过滤器链配置完成后的验证器，默认使用 `NullFilterChainValidator`，其实没有做任何验证；
- 创建了一个默认的防火墙对象 `firewall`。

在构造方法中传入过滤器链的集合，并赋值给 `filterChains` 变量。



由于 `FilterChainProxy` 本质上就是一个过滤器，因此它的核心方法就是 `doFilter` 方法，下面看看该方法源码：

```java
@Override
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
    throws IOException, ServletException {
    boolean clearContext = request.getAttribute(FILTER_APPLIED) == null;
    if (!clearContext) {
        doFilterInternal(request, response, chain);
        return;
    }
    try {
        request.setAttribute(FILTER_APPLIED, Boolean.TRUE);
        doFilterInternal(request, response, chain);
    }
    catch (RequestRejectedException ex) {
        this.requestRejectedHandler.handle((HttpServletRequest) request, (HttpServletResponse) response, ex);
    }
    finally {
        SecurityContextHolder.clearContext();
        request.removeAttribute(FILTER_APPLIED);
    }
}
```

`doFilter` 方法相当于是整个 Spring Security 过滤器链的入口，之前我们了解的一下具体的过滤器如 `SecurityContextPersistenceFilter`，都是在该 doFilter 方法之后执行的。

作为整个过滤器链的入口，这里多了一个 `clearContext` 变量，如果是第一次执行该 doFilter 方法，执行完成后，在 finally 代码块中需要从 `SecurityContextHolder` 里清除用户信息，这个主要是为了防止用户没有正确配置 `SecurityContextPersistenceFilter`，从而导致登录用户西悉尼没有被正确清除，进而发生内存泄露。



在 doFilter 方法中，过滤器的具体执行则交给 `doFilterInternal` 方法：

```java
private void doFilterInternal(ServletRequest request, ServletResponse response, FilterChain chain)
    throws IOException, ServletException {
    
    FirewalledRequest firewallRequest = this.firewall.getFirewalledRequest((HttpServletRequest) request);
    
    HttpServletResponse firewallResponse = this.firewall.getFirewalledResponse((HttpServletResponse) response);
    
    List<Filter> filters = getFilters(firewallRequest);
    
    if (filters == null || filters.size() == 0) {
        if (logger.isTraceEnabled()) {
            logger.trace(LogMessage.of(() -> "No security for " + requestLine(firewallRequest)));
        }
        firewallRequest.reset();
        chain.doFilter(firewallRequest, firewallResponse);
        return;
    }
    if (logger.isDebugEnabled()) {
        logger.debug(LogMessage.of(() -> "Securing " + requestLine(firewallRequest)));
    }
    
    VirtualFilterChain virtualFilterChain = new VirtualFilterChain(firewallRequest, chain, filters);
    virtualFilterChain.doFilter(firewallRequest, firewallResponse);
}
```

在 `doFilterInternal` 方法中，首先会将 request 对象转换为一个 `FirewalledRequest` 对象，这个转换过程会进行 Http 防火墙处理，同时将 response 对象也转换为 `HttpServletResponse`。

接下来调用 `getFilters` 方法获取当前请求对应的过滤器链，`getFilters` 会遍历 `filterChains` 集合，进而判断出当前请求和哪一个过滤器链是对应的，如果找到的过滤器链 filters 为 null，或者 filters 中没有元素，说明当前请求并不需要经过 Spring Security 过滤器链，此时执行 `firewallRequest.reset()` 方法对 Http 防火墙中的属性进行重置，再执行 `chain.doFilter` 方法回到 Web Filter 中，Spring Security 过滤器链将被跳过（回顾前面介绍的 WebSecurity 是如何处理被忽略请求的）。

如果 filters 集合是有元素的，也就是说当前请求需要经过 filters 集合中元素所构建的过滤器链，那么构建一个虚拟的过滤器链对象 `VirtualFilterChain`，并执行其 doFilter 方法。



#### VirtualFilterChain

```java
private static final class VirtualFilterChain implements FilterChain {

    private final FilterChain originalChain;

    private final List<Filter> additionalFilters;

    private final FirewalledRequest firewalledRequest;

    private final int size;

    private int currentPosition = 0;

    private VirtualFilterChain(FirewalledRequest firewalledRequest, FilterChain chain,
                               List<Filter> additionalFilters) {
        this.originalChain = chain;
        this.additionalFilters = additionalFilters;
        this.size = additionalFilters.size();
        this.firewalledRequest = firewalledRequest;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response) throws IOException, ServletException {
        if (this.currentPosition == this.size) {
            if (logger.isDebugEnabled()) {
                logger.debug(LogMessage.of(() -> "Secured " + requestLine(this.firewalledRequest)));
            }
            // Deactivate path stripping as we exit the security filter chain
            this.firewalledRequest.reset();
            this.originalChain.doFilter(request, response);
            return;
        }
        this.currentPosition++;
        Filter nextFilter = this.additionalFilters.get(this.currentPosition - 1);
        if (logger.isTraceEnabled()) {
            logger.trace(LogMessage.format("Invoking %s (%d/%d)", nextFilter.getClass().getSimpleName(),
                                           this.currentPosition, this.size));
        }
        nextFilter.doFilter(request, response, this);
    }

}
```

`VirtualFilterChain` 中首先声明了图个变量：

（1）`originalChain`：表示原生的过滤器链，执行它的 doFilter 方法会回到 Web Filter 中；

（2）`additionalFilters`：这个 List 集合中存储的 Filter 就是本次请求的 Filter；

（3）`firewalledRequest`：当前请求对象；

（4）`size`：过滤器链的大小；

（5）`currentPosition`：过滤器链执行的下标。

在 `VirtualFilterChain` 的构造方法中，会给相应的变量赋值。

在 `doFilter` 方法中，会首先判断当前执行的下标是否等于过滤器链的大小：

- 如果相等，则说明整个过滤器链中的所有过滤器都执行过了，此时先对 Http 防火墙中的属性进行重置，然后调用 `this.originalChain.doFilter` 方法跳出 Spring Security Filter，回到 Web Filter；
- 如果不相等，则 `currentPosition` 自增，然后从过滤器链集合中取出一个过滤器链去执行，注意执行的时候第三个参数 this 表示当前对象（即 `VirtualFilterChain`），这样在每一个过滤器执行之后，最后的 `chain.doFilter` 方法又会回到当前 doFilter 方法中，继续下一个过滤器链的调用。

这就是 `FilterChainProxy` 的大致工作原理。



## 5、SecurityConfigurer

`SecurityConfigurer` 中有两个核心方法，一个是 init 方法，用来完成配置类的初始化操作，另外一个是 configure 方法，进行配置类的配置。

前面分析的 `AbstractConfiguredSecurityBuilder` 抽象类，里面的 init 和 configure 方法其实就是在遍历执行不同的配置类的 init 方法和 configure 方法。

`SecurityConfigurer` 的实现类比较多，这里主要梳理一下常见的 `SecurityConfigurer` 实现类。

首先看看 `SecurityConfigurer` 的源码：

```java
public interface SecurityConfigurer<O, B extends SecurityBuilder<O>> {

	void init(B builder) throws Exception;

	void configure(B builder) throws Exception;
}
```

它只有两个方法：init 和 configure，两个方法的参数都是 `SecurityBuilder` 对象，也就是说着两个方法中对 `SecurityBuilder` 进行初始化和配置。

`SecurityConfigurer` 的子类非常多，因为每一个过滤器都有自己对应的 xxxConfigurer，这里着重介绍几个关键的实现类：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220106102608.png)

下面分别看看这几个实现类：

### (1) SecurityConfigurerAdapter

`SecurityConfigurerAdapter` 实现了 `SecurityConfigurer` 接口，它的源码如下：

```java
public abstract class SecurityConfigurerAdapter<O, B extends SecurityBuilder<O>> implements SecurityConfigurer<O, B> {
    
    private B securityBuilder;

	private CompositeObjectPostProcessor objectPostProcessor = new CompositeObjectPostProcessor();
    
    @Override
	public void init(B builder) throws Exception {
	}

	@Override
	public void configure(B builder) throws Exception {
	}
    
    public B and() {
		return getBuilder();
	}
    
    protected final B getBuilder() {
		Assert.state(this.securityBuilder != null, "securityBuilder cannot be null");
		return this.securityBuilder;
	}
    
    protected <T> T postProcess(T object) {
		return (T) this.objectPostProcessor.postProcess(object);
	}
    
    public void addObjectPostProcessor(ObjectPostProcessor<?> objectPostProcessor) {
		this.objectPostProcessor.addObjectPostProcessor(objectPostProcessor);
	}
    
    public void setBuilder(B builder) {
		this.securityBuilder = builder;
	}
    
    private static final class CompositeObjectPostProcessor implements ObjectPostProcessor<Object> {

		private List<ObjectPostProcessor<?>> postProcessors = new ArrayList<>();

		@Override
		@SuppressWarnings({ "rawtypes", "unchecked" })
		public Object postProcess(Object object) {
			for (ObjectPostProcessor opp : this.postProcessors) {
				Class<?> oppClass = opp.getClass();
				Class<?> oppType = GenericTypeResolver.resolveTypeArgument(oppClass, ObjectPostProcessor.class);
				if (oppType == null || oppType.isAssignableFrom(object.getClass())) {
					object = opp.postProcess(object);
				}
			}
			return object;
		}

		/**
		 * Adds an {@link ObjectPostProcessor} to use
		 * @param objectPostProcessor the {@link ObjectPostProcessor} to add
		 * @return true if the {@link ObjectPostProcessor} was added, else false
		 */
		private boolean addObjectPostProcessor(ObjectPostProcessor<?> objectPostProcessor) {
			boolean result = this.postProcessors.add(objectPostProcessor);
			this.postProcessors.sort(AnnotationAwareOrderComparator.INSTANCE);
			return result;
		}

	}
}
```

我们可以分析出 `SecurityConfigurerAdapter` 主要做了如下几件事：

（1）提供了一个 `SecurityBuilder` 对象，为每一个配置类都提供了一个 `SecurityBuilder` 对象，将来通过 `SecurityBuilder` 构建出具体的配置对象；通过 `and` 方法返回 `SecurityBuilder` 对象，这样方便不同的配置类在配置时，可以进行链式配置（在我们自定义的 Spring Security 配置类中使用的 and 方法）；

（2）定义了内部类 `CompositeObjectPostProcessor`，这是一个复合的对象后置处理器；

（3）提供了一个 `addObjectPostProcessor` 方法，通过该方法可以向复合的对象后置处理器中添加新的 `ObjectPostProcessor` 实例。

这就是 `SecurityConfigurerAdapter` 提供的主要功能。



### (2) UserDetailsAwareConfigurer

`UserDetailsAwareConfigurer` 的子类主要负责配置用户认证相关的组件，如 `UserDetailsService` 等等，`UserDetailsAwareConfigurer` 中提供了获取 `UserDetailsService` 的抽象方法，具体实现则在它的子类中，它的子类如下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220106103916.png)

- `DaoAuthenticationConfigurer`：完成对 `DaoAuthenticationProvider` 的配置；
- `UserDetailsServiceConfigurer`：完成对 `UserDetailsService` 的配置；
- `UserDetailsManagerConfigurer`：使用 `UserDetailsManager` 构建用户对象，完成对 `AuthenticationManagerBuilder` 的填充；
- `JdbcUserDetailsManagerConfigurer`：配置 `JdbcUserDetailsManager` 并填充到 `AuthenticationManagerBuilder` 中；
- `InMemoryUserDetailsManagerConfigurer`：配置 `InMemoryUserDetailsManager`；
- `DaoAuthenticationConfigurer`：完成对 `DaoAuthenticationProvider` 的配置。



### (3) AbstractHttpConfigurer

`AbstractHttpConfigurer` 主要是为了给在 `HttpSecurity` 中使用的配置类添加一个方便的父类，提取出共同的操作。

```java
public abstract class AbstractHttpConfigurer<T extends AbstractHttpConfigurer<T, B>, B extends HttpSecurityBuilder<B>>
		extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, B> {

	@SuppressWarnings("unchecked")
	public B disable() {
		getBuilder().removeConfigurer(getClass());
		return getBuilder();
	}

	@SuppressWarnings("unchecked")
	public T withObjectPostProcessor(ObjectPostProcessor<?> objectPostProcessor) {
		addObjectPostProcessor(objectPostProcessor);
		return (T) this;
	}

}
```

可以看到，提取的方法有两个：

- 一个 `disable` 表示禁用某一个配置（例如之前配置过的：`.csrf().disable()`），本质上就是从构建器的 configurers 集合中移除某一个配置类，这样在将来构建的时候就不存在该配置类，那么对应的功能也就不存在（被禁用）；
- 另一个 `withObjectPostProcessor` 表示给某一个对象添加一个对象后置处理器，由于该方法的返回值是当前对象，所以该方法可以用在链式配置中。

`AbstractHttpConfigurer` 的实现类比较多，基本上都是用来配置各种各样的过滤器，如下表：



| 配置类名称                               | 作用                                                         |
| ---------------------------------------- | ------------------------------------------------------------ |
| `HttpBasicConfigurer`                    | 配置基于 Http Basic 认证的过滤器 `BasicAuthenticationFilter` |
| `LogoutConfigurer`                       | 配置注销登录过滤器 `LogoutFilter`                            |
| `RequestCacheConfigurer`                 | 配置请求缓存过滤器 `RequestCacheAwareFilter`                 |
| `RememberMeConfigurer`                   | 配置记住我登录过滤器 `RememberMeAuthenticationFilter`        |
| `ServletApiConfigurer`                   | 配置包装原始请求过滤器 `SecurityContextHolderAwareRequestFilter` |
| `DefaultLoginPageConfigurer`             | 配置提供默认登录页面的过滤器 `DefaultLoginPageGeneratingFilter` 和默认注销页面的过滤器 `DefaultLogoutPageGeneratingFilter` |
| `SessionManagementConfigurer`            | 配置 Session 管理过滤器 `SessionManagementFilter` 和 `ConcurrentSessionFilter` |
| `PortMapperConfigurer`                   | 配置一个共享的 `PortMapper` 实例，以便在 HTTP 和 HTTPS 之间重定向时确定端口 |
| `ExceptionHandlingConfigurer`            | 配置异常处理过滤器 `ExceptionTranslatinFilter`               |
| `HeadersConfigurer`                      | 配置安全相关的响应头信息                                     |
| `CsrfConfigurer`                         | 配置方法 CSRF 攻击过滤器 `CsrfFilter``                       |
| `OAuth2ClientConfigurer`                 | 配置 OAuth2 相关的过滤器 `OAuth2AuthorizationRequestRedirectFilter` 和 `OAuth2AuthorizationCodeGrantFilter` |
| `ImplicitGrantConfigurer`                | 配置 OAuth2 认证请求重定向的过滤器 `OAuth2AuthorizationRequestRedirectFilter` |
| `AnonymousConfigurer`                    | 配置匿名过滤器 `AnonymousAuthenticationFilter`               |
| `JeeConfigurer`                          | 配置 J2EE 身份预校验过滤器 `J2eePreAuthenticatedProcessingFilter` |
| `ChannelSecurityConfigurer`              | 配置请求协议处理过滤器 `ChannelProcessingFilter`             |
| `CorsConfigurer`                         | 配置处理跨域过滤器 `CorsFilter`                              |
| `SecurityContextConfigurer`              | 配置登录信息存储和恢复的过滤器 `SecurityContextPersistenceFilter` |
| `OAuth2ResourceServerConfigurer`         | 配置 OAuth2 身份请求认证过滤器 `BearerTokenAuthenticationFilter` |
| `AbstractAuthenticationFilterConfigurer` | 身份认证配置类的父类                                         |
| `FormLoginConfigurer`                    | 配置身份认证过滤器 `UsernamePasswordAuthenticationFilter` 和默认登录页面的过滤器 `DefaultLoginPageGeneratingFilter` |
| `OAuth2LoginConfigurer`                  | 配置 OAuth2 认证请求重定向的过滤器 `OAuth2AuthorizationRequestRedirectFilter` 和处理第三方回调过滤器 `OAuth2LoginAuthenticationFilter` |
| `OpenIDLoginConfigurer`                  | 配置 OpenID 身份认证过滤器 `OpenIDAuthenticationFilter`      |
| `Saml2LoginConfigurer`                   | 配置 SAML2.0 身份认证过滤器 `Saml2WebSsoAuthenticationFilter` 和 `Saml2WebSsoAuthenticationRequestFilter` |
| `X509Configurer`                         | 配置 X509 身份认证过滤器 `X509AuthenticationFilter`          |
| `AbstractInterceptUrlConfigurer`         | 配置拦截器的父类                                             |
| `UrlAuthenticationConfigurer`            | 配置基于 URL 的权限认证拦截器 `FilterSecurityInterceptor`    |
| `ExpressionUrlAuthorizationConfigurer`   | 配置基于 SpEL 表达式的 URL 权限认证拦截器 `FilterSecurityInterceptor` |



### (4) GlobalAuthenticationConfigurerAdapter

`GlobalAuthenticationConfigurerAdapter` 主要用于配置全局 `AuthenticationManagerBuilder`，在 `AuthenticationConfiguration` 类中会自动使用 `GlobalAuthenticationConfigurerAdapter` 提供的 Bean 来配置全局 `AuthenticationManagerBuilder`。

之前分析 `ProviderManager` 的时候提到，默认情况下 `ProviderManager` 有一个 parent，这个 parent 就是通过这里的全局 `AuthenticationManagerBuilder` 来构建的。



`GlobalAuthenticationConfigurerAdapter` 有四个不同的子类：



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220106201232.png)



- `InitializeAuthenticationProviderBeanManagerConfigurer`：初始化全局 `AuthenticationProvider` 对象；
- `InitializeAuthenticationProviderManagerConfigurer`：配置全局的 `AuthenticationProvider` 对象，配置过程就是从 Spring 容器中查找 `AuthenticationProvider` 并设置给全局的 `AuthenticationManagerBuilder` 对象；
- 内部类 `InitializeUserDetailsBeanManagerConfigurer`：初始化全局的 `UserDetailsService` 对象；
- 内部类 `InitializeUserDetailsManagerConfigurer`：配置全局的 `UserDetailsService` 对象，配置过程就是从 Spring 容器中查找 `UserDetailsService` ，并设置给全局的 `AuthenticationManagerBuilder` 对象；
- 私有静态内部类 `EnableGlobalAuthenticationAutowiredConfigurer`：从 Spring 容器中加载被 `@EnableGlobalAuthentication` 注解标记的 Bean；



### (5) WebSecurityConfigurer

`WebSecurityConfigurer` 是一个空接口，我们可以通过它来自定义 `WebSecurity`。

`WebSecurityConfigurer` 直接一个实现类就是 `WebSecurityConfigurerAdapter`，在大多数情况下，开发者通过继承 `WebSecurityConfigurerAdapter` 来实现对 `WebSecurity` 的自定义配置。



### (6) WebSecurityConfigurerAdapter

`WebSecurityConfigurerAdapter` 是一个可以方便创建 `WebSecurityConfigurer` 实例的基类，开发者可以通过覆盖 `WebSecurityConfigurerAdapter` 中的方法完成对 `HttpSecurity` 和 `WebSecurity` 的定制。

在 `WebSecurityConfigurerAdapter` 中声明了两个 `AuthenticationManagerBuilder` 对象用来构建 `AuthenticationManager`：

```java
private AuthenticationManagerBuilder authenticationBuilder;

private AuthenticationManagerBuilder localConfigureAuthenticationBldr;
```

其中 `localConfigureAuthenticationBldr` 对象负责构建全局的 `AuthenticationManager`，而 `authenticationBuilder` 则负责构建局部的 `AuthenticationManager`。

局部的 `AuthenticationManager` 是和每一个 `HttpSecurity` 对象绑定的，而全局的 `AuthenticationManager` 则是和所有局部 `AuthenticationManager` 的 parent。

需要注意的是 `localConfigureAuthenticationBldr` 并非总是有用，开发者没有重写 `configure(AuthenticationManagerBuilder)` 方法的情况下，全局的 `AuthenticationManager` 对象是由 `AuthenticationConfiguration` 类中的 `getAuthenticationManager` 方法提供的，如果开发者重写了 `configure(AuthenticationManagerBuilder)` 方法，则全局的 `AuthenticationManager` 就由 `localConfigureAuthenticationBldr` 负责构建。



`WebSecurityConfigurerAdapter` 类的初始化方法如下：

```java
@Override
public void init(WebSecurity web) throws Exception {
    HttpSecurity http = getHttp();
    web.addSecurityFilterChainBuilder(http).postBuildAction(() -> {
        FilterSecurityInterceptor securityInterceptor = http.getSharedObject(FilterSecurityInterceptor.class);
        web.securityInterceptor(securityInterceptor);
    });
}

protected final HttpSecurity getHttp() throws Exception {
    if (this.http != null) {
        return this.http;
    }
    AuthenticationEventPublisher eventPublisher = getAuthenticationEventPublisher();
    this.localConfigureAuthenticationBldr.authenticationEventPublisher(eventPublisher);
    AuthenticationManager authenticationManager = authenticationManager();
    this.authenticationBuilder.parentAuthenticationManager(authenticationManager);
    Map<Class<?>, Object> sharedObjects = createSharedObjects();
    this.http = new HttpSecurity(this.objectPostProcessor, this.authenticationBuilder, sharedObjects);
    if (!this.disableDefaults) {
        applyDefaultConfiguration(this.http);
        ClassLoader classLoader = this.context.getClassLoader();
        List<AbstractHttpConfigurer> defaultHttpConfigurers = SpringFactoriesLoader
            .loadFactories(AbstractHttpConfigurer.class, classLoader);
        for (AbstractHttpConfigurer configurer : defaultHttpConfigurers) {
            this.http.apply(configurer);
        }
    }
    configure(this.http);
    return this.http;
}

protected void configure(HttpSecurity http) throws Exception {

    http.authorizeRequests((requests) -> requests.anyRequest().authenticated());
    http.formLogin();
    http.httpBasic();
}

protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    this.disableLocalConfigureAuthenticationBldr = true;
}

protected AuthenticationManager authenticationManager() throws Exception {
    if (!this.authenticationManagerInitialized) {
        configure(this.localConfigureAuthenticationBldr);
        if (this.disableLocalConfigureAuthenticationBldr) {
            this.authenticationManager = this.authenticationConfiguration.getAuthenticationManager();
        }
        else {
            this.authenticationManager = this.localConfigureAuthenticationBldr.build();
        }
        this.authenticationManagerInitialized = true;
    }
    return this.authenticationManager;
}
```



（1）在 `init` 方法中，首先调用 `getHttp` 方法获取一个 `HttpSecurity` 实例，并将获取到的实例添加到 `WebSecurity` 对象中，再由 `WebSecurity` 进行构建；

（2）在 `getHttp` 方法中，如果 http 对象已经初始化，就直接返回，否则进行初始化操作。在初始化的过程中，给 `localConfigureAuthenticationBldr` 设置事件发布器，并调用 `authenticationManager` 方法获取全局的 `AuthenticationManager` 对象；

（3）在 `authenticationManager` 方法中，如果全局的 `AuthenticationManager` 对象还没有初始化，则先调用 `configure(AuthenticationManagerBuilder auth)` 方法，该方法逻辑也比较简单，就是将 `disableLocalConfigureAuthenticationBldr` 变量由 false 设置为 true 从而进入下面的 if 分支，接下来就会调用 `this.authenticationConfiguration.getAuthenticationManager()` 方法获取全局的 `AuthenticationManager` 对象并返回它。

如果开发者自己重写了 `configure(AuthenticationManagerBuilder auth)` 方法，则 `disableLocalConfigureAuthenticationBldr` 变量一直就是 false 了，没有机会变为 true，这样就会进入到 else 分支，通过 `this.localConfigureAuthenticationBldr.build()` 方法来构建 `AuthenticationManager` 对象；

（4）再次回到 `getHttp` 方法中，获取到全局的 `AuthenticationManager` 对象之后，作为 parent 设置给 `authenticationBuilder` 局部 `AuthenticationManagerBuilder`，然后创建一个 `HttpSecurity` 实例出来，并为其配置上默认的过滤器。默认的配置完成之后，调用 `configure(HttpSecurity http)` 方法进行扩展配置，`WebSecurityConfigurerAdapter` ，`WebSecurityConfigurerAdapter` 中对 `configure(HttpSecurity http)` 提供了默认的实现，开发者也可以自定义该方法。



这就是 `WebSecurityConfigurerAdapter` 的初始化方法，起始就是创建并配置一个 `HttpSecurity` 实例，之后添加到 `WebSecurity` 中。

`WebSecurityConfigurerAdapter` 中的 `configure(WebSecurity web)` 方法是一个空方法，可以用来配置 `WebSecurity`：

```java
@Override
public void configure(WebSecurity web) throws Exception {
}
```

一般来说，如果我们有一些静态资源不需要经过 Spring Security 过滤器，就可以通过重写该方法实现。



## 6、初始化流程



### (1) SecurityAutoConfiguration

在 Spring Boot 中使用 Spring Security，初始化就从 Spring Security 的自动化配置类中开始：

```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnClass(DefaultAuthenticationEventPublisher.class)
@EnableConfigurationProperties(SecurityProperties.class)
@Import({ SpringBootWebSecurityConfiguration.class, WebSecurityEnablerConfiguration.class,
		SecurityDataConfiguration.class, ErrorPageSecurityFilterConfiguration.class })
public class SecurityAutoConfiguration {

	@Bean
	@ConditionalOnMissingBean(AuthenticationEventPublisher.class)
	public DefaultAuthenticationEventPublisher authenticationEventPublisher(ApplicationEventPublisher publisher) {
		return new DefaultAuthenticationEventPublisher(publisher);
	}

}
```

可以看到，在自动化配置类中，最重要的就是导入了四个配置类，并且定义了一个默认的事件发布器。

导入的四个配置类中：

> SpringBootWebSecurityConfiguration

`SpringBootWebSecurityConfiguration` 的主要作用是在开发者没有提供 `WebSecurityConfigurerAdapter` 实例的情况下，由其负责提供一个默认的 `WebSecurityConfigurerAdapter` 实例，代码如下：

```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnDefaultWebSecurity
@ConditionalOnWebApplication(type = Type.SERVLET)
class SpringBootWebSecurityConfiguration {

	@Bean
	@Order(SecurityProperties.BASIC_AUTH_ORDER)
	SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
		http.authorizeRequests().anyRequest().authenticated().and().formLogin().and().httpBasic();
		return http.build();
	}
}
```



> SecurityDataConfiguration

另一个导入的配置类 `SecurityDataConfiguration` 主要提供了一个 `SecurityEvaluationContextExtension` 实例，以便通过 SpEL 为经过身份验证的用户提供数据查询：

```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnClass(SecurityEvaluationContextExtension.class)
public class SecurityDataConfiguration {

	@Bean
	@ConditionalOnMissingBean
	public SecurityEvaluationContextExtension securityEvaluationContextExtension() {
		return new SecurityEvaluationContextExtension();
	}
}
```



> ErrorPageSecurityFilterConfiguration

`ErrorPageSecurityFilterConfiguration` 配置类主要是为了配置登录失败时的过滤器，当找不到指定的请求时，跳转到错误信息提示页面。

```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnClass(WebInvocationPrivilegeEvaluator.class)
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
class ErrorPageSecurityFilterConfiguration {

	@Bean
	@ConditionalOnBean(WebInvocationPrivilegeEvaluator.class)
	FilterRegistrationBean<ErrorPageSecurityFilter> errorPageSecurityInterceptor(ApplicationContext context) {
		FilterRegistrationBean<ErrorPageSecurityFilter> registration = new FilterRegistrationBean<>(
				new ErrorPageSecurityFilter(context));
		registration.setDispatcherTypes(EnumSet.of(DispatcherType.ERROR));
		return registration;
	}
}
```



> WebSecurityEnablerConfiguration

最后一个导入的配置类 `WebSecurityEnablerConfiguration` 是我们分析的重点。

```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnMissingBean(name = BeanIds.SPRING_SECURITY_FILTER_CHAIN)
@ConditionalOnClass(EnableWebSecurity.class)
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@EnableWebSecurity
class WebSecurityEnablerConfiguration {

}
```

`WebSecurityEnablerConfiguration` 配置类中添加了 `@EnableWebSecurity` 注解，而该注解的定义，引入了关键的配置类 `WebSecurityConfiguration`。

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import({ WebSecurityConfiguration.class, SpringWebMvcImportSelector.class, OAuth2ImportSelector.class,
		HttpSecurityConfiguration.class })
@EnableGlobalAuthentication
@Configuration
public @interface EnableWebSecurity {

	boolean debug() default false;
}
```

可以看到 `EnableWebSecurity` 是一个组合注解，首先导入了四个配置类：

- `WebSecurityConfiguration`：用来配置 `WebSecurity` （重点）;
- `SpringWebMvcImportSelector`：判断当前环境是否存在 Spring MVC，如果存在，则引入相关配置；
- `OAuth2ImportSelector`：判断当前环境是否存在 OAuth2，如果存在，则引入相关配置；
- `HttpSecurityConfiguration`：用来提供一个默认的 `HttpSecurity`，从而构建默认的过滤器链。



另外还有一个 `@EnableGlobalAuthentication` 注解，用来开启全局配置。

它的主要功能是导入了配置类 `AuthenticationConfiguration`。

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import(AuthenticationConfiguration.class)
@Configuration
public @interface EnableGlobalAuthentication {

}
```



从上面的分析可知，Spring Security 的自动化配置类主要导入了两个类：`WebSecurityConfiguration` 和 `AuthenticationConfiguration`。



### (2) WebSecurityConfiguration

`WebSecurityConfiguration` 配置类的功能，主要就是为了构建 Spring Security 过滤器链代理对象 `FilterChainProxy`。根据之前分析，`FilterChainProxy` 是由 `WebSecurity` 来构建的，所以在 `WebSecurityConfiguration` 中会首先构建出 `WebSecurity` 对象，在利用 `WebSecurity` 对象构建出 `FilterChainProxy`。

先看一下 `WebSecurityConfiguration` 中定义的属性：

```java
@Configuration(proxyBeanMethods = false)
public class WebSecurityConfiguration implements ImportAware, BeanClassLoaderAware {
    
    private WebSecurity webSecurity;
    
    private List<SecurityConfigurer<Filter, WebSecurity>> webSecurityConfigurers;

	private List<SecurityFilterChain> securityFilterChains = Collections.emptyList();

	private List<WebSecurityCustomizer> webSecurityCustomizers = Collections.emptyList();

	private ClassLoader beanClassLoader;
    
    @Autowired(required = false)
	private ObjectPostProcessor<Object> objectObjectPostProcessor;
}
```

（1）`WebSecurityConfiguration` 类实现了 `ImportAware` 接口。`ImportAware` 接口一般是和 `@Import` 注解一起使用，实现了 `ImportAware` 接口的配置类可以方便地通过 `setImportMetadata` 方法获取到导入类中的数据配置。换句话说，`WebSecurityConfiguration` 实现了 `ImportAware` 接口，那么前面查看 `@EnableWebSecurity` 注解的源码可以看到，其中使用了 `@import` 导入了 `WebSecurityConfiguration` ，则在 `WebSecurityConfiguration` 类中可以通过 `setImportMetadata` 方法获取到 `@EnableWebSecurity` 注解中的属性值，这里主要是 debug 属性。

另一方面， `WebSecurityConfiguration` 类通过实现 `BeanClassLoaderAware` 接口可以方便地获取到 `ClassLoader` 对象。

（2）`webSecurity` 对象是 `WebSecurityConfiguration` 中需要构建的 `WebSecurity` 对象；

（3）`webSecurityConfigurers` 集合中保存了所有的配置类，也就是 `WebSecurityConfigurerAdapter` 对象，一个 `WebSecurityConfigurerAdapter` 对象可以创建一个 `HttpSecurity`，进而构建出一条过滤器链，而多个 `WebSecurityConfigurerAdapter` 对象就可以构建出多条过滤器链；

（4）`securityFilterChains` 集合保存构建处理的过滤器链；

（5）`webSecurityCustomizers` 集合保存了开发者对 `WebSecurity` 的一些自定义配置，`WebSecurityConfiguration` 在构建 `WebSecurity` 时会自动应用这些配置；

（6）`beanClassLoader` 是一个 `ClassLoader`；

（7）`objectObjectPostProcessor` 是一个对象后置处理器，注意这个对象是直接从 Spring 容器中注入的。



这是 `WebSecurityConfiguration` 类中定义的属性，下面看看  `setFilterChainProxySecurityConfigurer` 方法，该方法主要用来构建一个 `WebSecurity` 对象，并且加载所有的配置类对象：

```java
@Autowired(required = false)
public void setFilterChainProxySecurityConfigurer(ObjectPostProcessor<Object> objectPostProcessor,
                                                  @Value("#{@autowiredWebSecurityConfigurersIgnoreParents.getWebSecurityConfigurers()}") List<SecurityConfigurer<Filter, WebSecurity>> webSecurityConfigurers)
    throws Exception {
    this.webSecurity = objectPostProcessor.postProcess(new WebSecurity(objectPostProcessor));
    if (this.debugEnabled != null) {
        this.webSecurity.debug(this.debugEnabled);
    }
    webSecurityConfigurers.sort(AnnotationAwareOrderComparator.INSTANCE);
    Integer previousOrder = null;
    Object previousConfig = null;
    for (SecurityConfigurer<Filter, WebSecurity> config : webSecurityConfigurers) {
        Integer order = AnnotationAwareOrderComparator.lookupOrder(config);
        if (previousOrder != null && previousOrder.equals(order)) {
            throw new IllegalStateException("@Order on WebSecurityConfigurers must be unique. Order of " + order
                                            + " was already used on " + previousConfig + ", so it cannot be used on " + config + " too.");
        }
        previousOrder = order;
        previousConfig = config;
    }
    for (SecurityConfigurer<Filter, WebSecurity> webSecurityConfigurer : webSecurityConfigurers) {
        this.webSecurity.apply(webSecurityConfigurer);
    }
    this.webSecurityConfigurers = webSecurityConfigurers;
}

@Bean
public static AutowiredWebSecurityConfigurersIgnoreParents autowiredWebSecurityConfigurersIgnoreParents(
    ConfigurableListableBeanFactory beanFactory) {
    return new AutowiredWebSecurityConfigurersIgnoreParents(beanFactory);
}
```

`setFilterChainProxySecurityConfigurer` 方法有两个参数，第一个参数 objectPostProcessor 是一个对象后置处理器，由于该方法有一个 `@AutoWired` 注解，会自动查找需要注入的参数，所有 objectPostProcessor 会自动注入进来。

需要注意的是，`AutoWired` 注解的 required 属性为 false，所以在方法参数注入的时候，有就注入，没有则忽略。required 属性设置 false，主要是针对第二个参数 webSecurityConfigurers，因为该参数的值是通过调用 `autowiredWebSecurityConfigurersIgnoreParents` 对象的 `getWebSecurityConfigurers` 方法获取的。

`autowiredWebSecurityConfigurersIgnoreParents` 对象也是在当前类中注入到 Spring 容器的，我们看一下这个方法：

```java
public final class AutowiredWebSecurityConfigurersIgnoreParents {

	private final ConfigurableListableBeanFactory beanFactory;

	AutowiredWebSecurityConfigurersIgnoreParents(ConfigurableListableBeanFactory beanFactory) {
		Assert.notNull(beanFactory, "beanFactory cannot be null");
		this.beanFactory = beanFactory;
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public List<SecurityConfigurer<Filter, WebSecurity>> getWebSecurityConfigurers() {
		List<SecurityConfigurer<Filter, WebSecurity>> webSecurityConfigurers = new ArrayList<>();
		Map<String, WebSecurityConfigurer> beansOfType = this.beanFactory.getBeansOfType(WebSecurityConfigurer.class);
		for (Entry<String, WebSecurityConfigurer> entry : beansOfType.entrySet()) {
			webSecurityConfigurers.add(entry.getValue());
		}
		return webSecurityConfigurers;
	}
}
```

可以看到，在 `getWebSecurityConfigurers()` 方法中主要是通过调用 `this.beanFactory.getBeansOfType` 方法来获取到 Spring 容器中所有的 `WebSecurityConfigurer` 实例，也就是开发者自定义的各种各样继承自 `WebSecurityConfigurerAdapter` 的配置类。如果开发者没有自定义任何配置列，那么这里获取到的就是前面分析 `SpringBootWebSecurityConfiguration` 类中提供的默认配置类，将获取到的所有配置类实例放入 `webSecurityConfigurers` 集合中并返回。



回到 `setFilterChainProxySecurityConfigurer` 方法中，现在第二个参数的来源已经明白了，在该方法中先创建了一个 `WebSecurity` 实例，创建出来之后去对象后置处理器中走一圈，这样就将 webSecurity 对象注册到 Spring 容器中了。

接下来，根据每一个配置类的 `@Order` 注解对 `webSecurityConfigurers` 集合中的所有配置类进行排序，因为一个配置类对应一条过滤器链，当请求到来后，需要显和哪个过滤器链进行匹配，这里必然存在一个优先级问题，所以开发者自定义了多个配置类，则需要通过 `@Order` 注解标记多个配置类的优先级。

排序完成后，进入到 for 循环中，检查是否存在优先级相等的配置类，如果存在，则直接抛出异常。最后再去遍历所有的配置类，调用 `this.webSecurity.apply(webSecurityConfigurer);` 方法将其添加到 webSecurity 父类中的 configurers 集合中（将来遍历该集合并分别调用配置类的 init 和 configure 方法完成配置类的初始化操作）。

这是 `setFilterChainProxySecurityConfigurer` 方法的执行逻辑，该方法主要用来初始化 `WebSecurity` 对象，同时收集所有的自定义配置类。



有了 `WebSecurity` 对象和配置类，接下来就可以构建过滤器 `FilterChainProxy` 了。看一下 `springSecurityFilterChain` 方法：

```java
@Bean(name = AbstractSecurityWebApplicationInitializer.DEFAULT_FILTER_NAME)
public Filter springSecurityFilterChain() throws Exception {
    
    boolean hasConfigurers = this.webSecurityConfigurers != null && !this.webSecurityConfigurers.isEmpty();
    boolean hasFilterChain = !this.securityFilterChains.isEmpty();

    if (!hasConfigurers && !hasFilterChain) {
        WebSecurityConfigurerAdapter adapter = this.objectObjectPostProcessor
            .postProcess(new WebSecurityConfigurerAdapter() {
            });
        this.webSecurity.apply(adapter);
    }
    
    for (SecurityFilterChain securityFilterChain : this.securityFilterChains) {
        this.webSecurity.addSecurityFilterChainBuilder(() -> securityFilterChain);
        for (Filter filter : securityFilterChain.getFilters()) {
            if (filter instanceof FilterSecurityInterceptor) {
                this.webSecurity.securityInterceptor((FilterSecurityInterceptor) filter);
                break;
            }
        }
    }
    
    for (WebSecurityCustomizer customizer : this.webSecurityCustomizers) {
        customizer.customize(this.webSecurity);
    }
    return this.webSecurity.build();
}
```

这里先判断有没有配置类和SPring Security 默认的过滤器链存在，如果两个都没有，就提供一个匿名的 `WebSecurityConfigurerAdapter` 对象并注册到 Spring 容器中。

如果存在过滤器链，那么就遍历过滤器链找到 `FilterSecurityInterceptor` 拦截器，并将其装配给 `WebSecurity`。

接着如果开发者提供的有 `webSecurityCustomizers`，就会自动为 `WebSecurity` 应用这些配置。

最后调用 build 方法，前面分析过 `WebSecurity` 对象的 build 方法执行后，首先会对所有的配置类即 `WebSecurityConfigurerAdapter` 实例进行构建，在 `WebSecurityConfigurerAdapter` 的 init 方法中，又会完成 `HttpSecurity` 的构建，而 `HttpSecurity` 的构建过程中，则会完成局部 `AuthenticationManager` 对象以及每一个具体的过滤器的构建。

这就是整个过滤器链的构建流程。



### (3) AuthenticationConfiguration

在 Spring Security 自动化配置类中导入的另外一个配置类是 `AuthenticationConfiguration`，该类的功能主要是做全局的配置，同时提供一个全局的 `AuthenticationManager` 实例。

首先我们看看 `AuthenticationConfiguration` 类的定义：

```java
@Configuration(proxyBeanMethods = false)
@Import(ObjectPostProcessorConfiguration.class)
public class AuthenticationConfiguration {}
```

可以看到，导入了 `ObjectPostProcessorConfiguration` 配置，而 `ObjectPostProcessorConfiguration` 配置则提供了一个基本的对象后置处理器：

```java
@Configuration(proxyBeanMethods = false)
@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
public class ObjectPostProcessorConfiguration {

	@Bean
	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	public ObjectPostProcessor<Object> objectPostProcessor(AutowireCapableBeanFactory beanFactory) {
		return new AutowireBeanFactoryObjectPostProcessor(beanFactory);
	}

}
```

`ObjectPostProcessorConfiguration` 类主要提供了一个 `ObjectPostProcessor` 实例，具体的实现类是 `AutowireBeanFactoryObjectPostProcessor`，该实现类主要用来将一个对象注册到 Spring 容器中去，我们在其他配置类中见到的 `ObjectPostProcessor` 实例其实都是这里提供的。

这是 `AuthenticationConfiguration` 类的定义部分，`AuthenticationConfiguration` 类中的方法比较多，看一下关键的方法：

```java
@Bean
public AuthenticationManagerBuilder authenticationManagerBuilder(ObjectPostProcessor<Object> objectPostProcessor,
                                                                 ApplicationContext context) {
    LazyPasswordEncoder defaultPasswordEncoder = new LazyPasswordEncoder(context);
    AuthenticationEventPublisher authenticationEventPublisher = getBeanOrNull(context,
                                                                              AuthenticationEventPublisher.class);
    DefaultPasswordEncoderAuthenticationManagerBuilder result = new DefaultPasswordEncoderAuthenticationManagerBuilder(
        objectPostProcessor, defaultPasswordEncoder);
    if (authenticationEventPublisher != null) {
        result.authenticationEventPublisher(authenticationEventPublisher);
    }
    return result;
}

@Bean
public static GlobalAuthenticationConfigurerAdapter enableGlobalAuthenticationAutowiredConfigurer(
    ApplicationContext context) {
    return new EnableGlobalAuthenticationAutowiredConfigurer(context);
}

@Bean
public static InitializeUserDetailsBeanManagerConfigurer initializeUserDetailsBeanManagerConfigurer(
    ApplicationContext context) {
    return new InitializeUserDetailsBeanManagerConfigurer(context);
}

@Bean
public static InitializeAuthenticationProviderBeanManagerConfigurer initializeAuthenticationProviderBeanManagerConfigurer(
    ApplicationContext context) {
    return new InitializeAuthenticationProviderBeanManagerConfigurer(context);
}

public AuthenticationManager getAuthenticationManager() throws Exception {
    if (this.authenticationManagerInitialized) {
        return this.authenticationManager;
    }
    AuthenticationManagerBuilder authBuilder = this.applicationContext.getBean(AuthenticationManagerBuilder.class);
    if (this.buildingAuthenticationManager.getAndSet(true)) {
        return new AuthenticationManagerDelegator(authBuilder);
    }
    for (GlobalAuthenticationConfigurerAdapter config : this.globalAuthConfigurers) {
        authBuilder.apply(config);
    }
    this.authenticationManager = authBuilder.build();
    if (this.authenticationManager == null) {
        this.authenticationManager = getAuthenticationManagerBean();
    }
    this.authenticationManagerInitialized = true;
    return this.authenticationManager;
}
```

（1）首先定义了一个 `AuthenticationManagerBuilder` 实例，目的是为了构建全局的 `AuthenticationManager` 对象，这个过程会从 Spring 容器中查找 `AuthenticationEventPublisher` 实例设置给 `AuthenticationManagerBuilder` 对象；

（2）接下来构建了三个 Bean，之前都分析过；

（3）`getAuthenticationManager` 方法则用来构建具体的 `AuthenticationManager` 对象，在该方法内部，会首先判断 `AuthenticationManager` 对象是否已经初始化，如果已经初始化，则直接返回 `AuthenticationManager` 对象，否则就先从 Spring 容器中获取到 `AuthenticationManagerBuilder` 对象。

注意这里还多了一个 `AuthenticationManagerDelegator` 对象，这个主要是为了防止在初始化 `AuthenticationManager` 是进行无限递归。拿到 `authBuilder` 对象之后 ，接下来遍历 `globalAuthConfigurers` 配置类集合（就是之前提到的 `GlobalAuthenticationConfigurerAdapter` 的几个实现类），将配置类分别添加到 `authBuilder` 对象中，然后进行构建，最终将构建结果返回。



这是全局 `AuthenticationManager` 的构建过程。

整体来说，`AuthenticationConfiguration` 的作用主要体现在两方面：

- 第一就是导入了 `ObjectPostProcessorConfiguration` 配置类；
- 第二则是提供了一个全局的 `AuthenticationManager` 对象。

如果开发者在自定义配置类中重写了 `configure(AuthenticationManagerBuilder)` 方法，这里的全局 `AuthenticationManager` 对象将不会生效，而大部分情况下，开发者都会重写 `configure(AuthenticationManagerBuilder)` 方法。