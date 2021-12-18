---
title: Spring Security Get Logged-in User Data
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031150501.jpg'
coverImg: /img/20211031150501.jpg
cover: false
toc: true
mathjax: false
date: 2021-12-16 21:25:06
summary: "Spring Security: 获取已登录用户数据"
categories: "Spring Security"
keywords: "Spring Security"
tags: "Spring Security"
---



# 登录用户数据获取

前置文章：[Spring Security 基本认证简介](https://naivekyo.github.io/2021/12/13/spring-security-of-basic-authentication/)



# 一、简介

## 1、两种方式

登录成功后，在后续的业务逻辑中，开发者可能还需要获取登录成功的用户对象，如果不使用任何安全管理框架，那么可以将用户信息保存在 HttpSession 中，以后需要的时候直接从 HttpSession 中获取数据就可以了。

在 Spring Security 中，用户登录信息本质上还是保存在 HttpSession 中，但是为了方便，Spring Security 对 HttpSession 中的用户信息进行了封装，封装之后，开发者若再想获取用户登录数据就会有两种不同的思路：

- 从 `SecurityContextHolder` 中获取
- 从当前请求对象中获取

上面是两种主流的方式，开发者也可以从 HttpSession 中直接获取，但是无论是哪一种获取方式都离不开一个对象：`Authentication`



## 2、Authentication

在 Spring Security 中，Authentication 主要有两方面的作用：

- 作为 `AuthenticationManager` 的输入参数，提供用户身份认证的凭据，当它作为一个输入参数时，它的 `isAuthenticated` 方法返回 false，表示用户还未认证；
- 代表已经经过身份认证的用户，此时的 Authentication 可以从 `SecurityContext` 中获取



一个 `Authentication` 对象主要包含三个方面的信息：

1. `principal`：定义认证的用户。如果用户使用用户名/密码的方式登录，principal 通常就是一个 `UserDetails` 对象；
2. `credentials`：登录凭据，一般就是指密码。当用户登录成功之后，登录凭据会被自动擦除，防止泄露；
3. `authorities`：用户被授予的权限信息。



Java 的 security 包中提供了 `Principal` 接口用于描述认证主体，Principal 可以代表一个公司、个人或者登录 ID。

Spring Security 定义了 `Authentication` 接口用来规范登录用户信息，它继承自 `java.security.Principal`

```java
public interface Authentication extends Principal, Serializable {

	Collection<? extends GrantedAuthority> getAuthorities();

	Object getCredentials();
    
	Object getDetails();

	Object getPrincipal();

	boolean isAuthenticated();

	void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException;
}
```

接口方法也都很好理解：

- `getAuthorities()`：获取用户权限
- `getCredentials()`：获取用户凭证，一般来说是密码
- `getDetails()`：获取当前用户详细信息，可能是当前的请求之类
- `getPrincipal()`：获取当前用户信息，可能是一个用户名，也可能是一个用户对象
- `isAuthenticated()`：当前用户是否认证成功



## 3、认证方式简介

可以看到，在 Spring Security 中，只要获取到 Authentication 对象，就可以获取到登录用户的详细信息。

不同的认证方式对应着不同的 Authentication 实例，Spring Security 的 Authentication 实现类如下图：



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211216215738.png)

简单介绍一下：

-  `AbstractAuthenticationToken`：该类实现了 `Authentication` 和 `CredentialsContainer` 两个接口，在 `AbstractAuthenticationToken` 中对 `Authentication`  接口定义的各个数据获取方法进行了实现，`CredentialsContainer`  则提供了登录凭证擦除方法。一般在登录成功后，为了防止用户信息泄露，可以将登录凭证（例如密码）擦除；
- `RememberMeAuthenticationToken`：如果用户使用了 RememberMe 的方式登录，登录信息将封装在 `RememberMeAuthenticationToken` 中；
- `TestingAuthenticationToken`：单元测试时封装的用户对象；
- `AnonymousAuthenticationToken`：匿名登录时封装的用户对象；
- `RunAsUserToken`：替换验证身份时封装的用户对象；
- `UsernamePasswordAuthenticationToken`：表单登录时封装的用户对象；
- `JaasAuthenticationToken`：JAAS 认证时封装的用户对象；
- `PreAuthenticatedAuthenticationToken`：Pre-Authentication 场景下封装的用户对象。



# 二、SecurityContextHolder

## 1、测试

之前已经做了 Spring Security 的配置以及登录页面的编写，下面新建一个 Controller：

```java
@RestController
public class UserController {
    
    @RequestMapping("/user")
    public void userInfo() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        String name = authentication.getName();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

        System.out.println("【name = " + name);
        System.out.println("【authorites = " + authorities);
    }
}
```

启动项目，登录后访问 `http://localhost:8080/user` 接口：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211216221331.png)



## 2、存储策略

`SecurityContextHolder` 主要负责 Spring Security 策略的初始化工作，同时它也将当前线程和 `SecurityContext` 关联起来。

这个类中提供了很多静态方法，都委托给了 `SecurityContextHolderStrategy`  的实例去执行，比如上边使用的 `getContext()` 方法：

```java
public static SecurityContext getContext() {
    return strategy.getContext();
}
```

这里面实际的执行者是 `SecurityContextHolderStrategy`  接口的实现类，通过它获取和当前线程关联的 Spring Security 上下文。

在开发中我们可以通过 `SecurityContextHolder`  很方便的获取到登录用户信息。



关系：

`SecurityContextHolder` 中存储的是 `SecurityContext`，`SecurityContext` 中存储的是 `Authentication`。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211216224049.png)



> 存储策略

首先在 `SecurityContextHolder` 中存放的是 `SecurityContext`，`SecurityContextHolder` 中定义了三种不同的数据存储策略，这实际上是一种典型的策略模式：

1. `MODE_THREADLOCAL`：这种存放策略是将 `SecurityContext` 存放到 `ThreadLocal` 中，`ThreadLocal`  的一个特点就是在哪个线程中存储就要在哪个线程中读取，这其实非常适合 Web 应用，因为在默认请情况下，一个请求无论经过多少 Filter 到达 Servlet，都是由一个线程来处理的。这也是 SecurityContextHolder 默认的存储策略，这种存储策略意味着如果在具体的业务处理代码中，开启了子线程，在子线程中去获取登录用户数据，就会获取不到（异步任务需要特殊处理）。
2. `MODE_INHERITABLETHREADLOCAL`：这种存储模式适用于多线程环境，如果希望在子线程中也能够获取到登录用户数据，那么可以使用这种存储模式。
3. `MODE_GLOBAL`：这种存储模式实际上是将数据保存在一个静态变量中，在 Java Web 开发中，这种模式很少被用到。



> 规范

`SecurityContextHolderStrategy`  接口是用来规范存储策略中的方法：

```java
public interface SecurityContextHolderStrategy {

	void clearContext();

	SecurityContext getContext();

	void setContext(SecurityContext context);

	SecurityContext createEmptyContext();
}
```

接口一共定义了四个方法：

- `clearContext()`：清除存储的 `SecurityContext` 对象
- `getContext()`：获取存储的 `SecurityContext` 对象
- `setContext()`：设置存储的 `SecurityContext` 对象
- `createEmptyContext()`：创建一个空的 `SecurityContext` 对象

Spring Security 中，该接口中有三个实现类，对应三种不同的存储策略：
![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211216225204.png)

### (1) ThreadLocalSecurityContextHolderStrategy



```java
final class ThreadLocalSecurityContextHolderStrategy implements SecurityContextHolderStrategy {

	private static final ThreadLocal<SecurityContext> contextHolder = new ThreadLocal<>();

	@Override
	public void clearContext() {
		contextHolder.remove();
	}

	@Override
	public SecurityContext getContext() {
		SecurityContext ctx = contextHolder.get();
		if (ctx == null) {
			ctx = createEmptyContext();
			contextHolder.set(ctx);
		}
		return ctx;
	}

	@Override
	public void setContext(SecurityContext context) {
		Assert.notNull(context, "Only non-null SecurityContext instances are permitted");
		contextHolder.set(context);
	}

	@Override
	public SecurityContext createEmptyContext() {
		return new SecurityContextImpl();
	}

}
```

`ThreadLocalSecurityContextHolderStrategy` 实现了 `SecurityContextHolderStrategy`  接口并重写了接口中的方法，存储数据的载体就是一个 `ThreadLocal`，所有针对 SecurityContext 的清空、获取以及存储，都是在 `ThreadLocal` 中进行操作的。

例如清空就是调用 `ThreadLocal` 的 remove 方法。

`SecurityContext` 是一个接口：

```java
public interface SecurityContext extends Serializable {

	Authentication getAuthentication();

	void setAuthentication(Authentication authentication);
}
```

它只有一个实现类：`SecurityContextImpl`，所以在创建 SecurityContext 时只需要创建一个 `SecurityContextImpl` 对象即可。



### (2) InheritableThreadLocalSecurityContextHolderStrategy



```java
final class InheritableThreadLocalSecurityContextHolderStrategy implements SecurityContextHolderStrategy {

	private static final ThreadLocal<SecurityContext> contextHolder = new InheritableThreadLocal<>();

	@Override
	public void clearContext() {
		contextHolder.remove();
	}

	@Override
	public SecurityContext getContext() {
		SecurityContext ctx = contextHolder.get();
		if (ctx == null) {
			ctx = createEmptyContext();
			contextHolder.set(ctx);
		}
		return ctx;
	}

	@Override
	public void setContext(SecurityContext context) {
		Assert.notNull(context, "Only non-null SecurityContext instances are permitted");
		contextHolder.set(context);
	}

	@Override
	public SecurityContext createEmptyContext() {
		return new SecurityContextImpl();
	}

}
```

`InheritableThreadLocalSecurityContextHolderStrategy` 和 `ThreadLocalSecurityContextHolderStrategy`  的实现策略基本一致，不同的是数据载体变量，这里面是 `InheritableThreadLocal`，它继承自 `ThreadLocal`，但是多了一个特性，就是在子线程创建的一瞬间，会自动将父线程中的数据复制到子线程中。

该存储策略正是利用了这一特性，实现了在子线程中获取登录用户信息的功能。



### (3) GlobalSecurityContextHolderStrategy



```java
final class GlobalSecurityContextHolderStrategy implements SecurityContextHolderStrategy {

	private static SecurityContext contextHolder;

	@Override
	public void clearContext() {
		contextHolder = null;
	}

	@Override
	public SecurityContext getContext() {
		if (contextHolder == null) {
			contextHolder = new SecurityContextImpl();
		}
		return contextHolder;
	}

	@Override
	public void setContext(SecurityContext context) {
		Assert.notNull(context, "Only non-null SecurityContext instances are permitted");
		contextHolder = context;
	}

	@Override
	public SecurityContext createEmptyContext() {
		return new SecurityContextImpl();
	}

}
```

`GlobalSecurityContextHolderStrategy` 的实现非常简单，就是用一个静态变量保存 SecurityContext，所以它也可以在多线程中使用。但是一般在 Web 开发中，这种存储策略使用的较少。



## 3、SecurityContextHolder

最后看看 `SecurityContextHolder` 的源码：

```java
public class SecurityContextHolder {

	public static final String MODE_THREADLOCAL = "MODE_THREADLOCAL";

	public static final String MODE_INHERITABLETHREADLOCAL = "MODE_INHERITABLETHREADLOCAL";

	public static final String MODE_GLOBAL = "MODE_GLOBAL";

	private static final String MODE_PRE_INITIALIZED = "MODE_PRE_INITIALIZED";

	public static final String SYSTEM_PROPERTY = "spring.security.strategy";

	private static String strategyName = System.getProperty(SYSTEM_PROPERTY);

	private static SecurityContextHolderStrategy strategy;

	private static int initializeCount = 0;

    // 在类加载器加载该类时初始化
	static {
		initialize();
	}

	private static void initialize() {
		initializeStrategy();
		initializeCount++;
	}

	private static void initializeStrategy() {
		if (MODE_PRE_INITIALIZED.equals(strategyName)) {
			Assert.state(strategy != null, "When using " + MODE_PRE_INITIALIZED
					+ ", setContextHolderStrategy must be called with the fully constructed strategy");
			return;
		}
		if (!StringUtils.hasText(strategyName)) {
			// Set default
			strategyName = MODE_THREADLOCAL;
		}
		if (strategyName.equals(MODE_THREADLOCAL)) {
			strategy = new ThreadLocalSecurityContextHolderStrategy();
			return;
		}
		if (strategyName.equals(MODE_INHERITABLETHREADLOCAL)) {
			strategy = new InheritableThreadLocalSecurityContextHolderStrategy();
			return;
		}
		if (strategyName.equals(MODE_GLOBAL)) {
			strategy = new GlobalSecurityContextHolderStrategy();
			return;
		}
		// Try to load a custom strategy
		try {
			Class<?> clazz = Class.forName(strategyName);
			Constructor<?> customStrategy = clazz.getConstructor();
			strategy = (SecurityContextHolderStrategy) customStrategy.newInstance();
		}
		catch (Exception ex) {
			ReflectionUtils.handleReflectionException(ex);
		}
	}

	public static void clearContext() {
		strategy.clearContext();
	}

	public static SecurityContext getContext() {
		return strategy.getContext();
	}

	public static int getInitializeCount() {
		return initializeCount;
	}

	public static void setContext(SecurityContext context) {
		strategy.setContext(context);
	}

	public static void setStrategyName(String strategyName) {
		SecurityContextHolder.strategyName = strategyName;
		initialize();
	}

	public static void setContextHolderStrategy(SecurityContextHolderStrategy strategy) {
		Assert.notNull(strategy, "securityContextHolderStrategy cannot be null");
		SecurityContextHolder.strategyName = MODE_PRE_INITIALIZED;
		SecurityContextHolder.strategy = strategy;
		initialize();
	}

	public static SecurityContextHolderStrategy getContextHolderStrategy() {
		return strategy;
	}

	public static SecurityContext createEmptyContext() {
		return strategy.createEmptyContext();
	}
	
    // ................
}
```



比较重要的是初始化流程，这里允许开发者通过配置系统变量或者调用 `setStrategyName` 方法来修改 `SecurityContextHolder` 的存储策略，后者修改了策略后还会重新初始化。

默认情况下，如果开发者想要在子线程中获取当前登录用户数据，就会获取失败，例如：

```java
@RequestMapping("/user")
public void userInfo() {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    String name = authentication.getName();

    Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

    System.out.println("【name = " + name);
    System.out.println("【authorites = " + authorities);

    new Thread(() -> {
        Authentication subAuth = SecurityContextHolder.getContext().getAuthentication();

        if (subAuth == null) {
            System.out.println("获取用户信息失败!");
            return;
        }

        String subName = subAuth.getName();
        Collection<? extends GrantedAuthority> subAuthorities = subAuth.getAuthorities();

        String threadName = Thread.currentThread().getName();

        System.out.println("【 " + threadName + ": name " + subName);
        System.out.println("【 " + threadName + ": authorities " + subAuthorities);
    }).start();
}
```

此处会显示：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211218193220.png)

因为默认的策略是无法在子线程中获取到 SecurityContext 的，如果希望可以在子线程中获取 SecurityContext，可以修改存储策略，改为：`MODE_INHERITABLETHREADLOCAL` 即可。

默认的存储策略是通过 `System.getProperty(SYSTEM_PROPERTY)` 来加载的，因此我们可以通过配置系统变量来修改默认的存储策略，在 IDEA 中通过修改启动参数即可：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211218193656.png)

重启项目，此时登录后访问 /user 接口，可以看到控制台打印的信息：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211218193742.png)



### (1) SecurityContextPersistenceFilter

通过前面的分析我们知道 Spring Security 是将用户登录的信息存储到 ThreadLocal 中，是以当前线程为 key，登录信息为 value 的，那么在 SpringBoot 中每个请求都是不同的线程去处理，为什么每一个线程都能获取到相同的登录信息呢？

这就和 Spring Security 过滤器链中最重要的一环 —— `SecurityContextPersistenceFilter` 有关了。



默认情况下，在 Spring Security 过滤器链中，`SecurityContextPersistenceFilter` 是第二道防线，位于 `WebAsyncManagerIntegrationFilter` 之后。

从 `SecurityContextPersistenceFilter`  的名字可以看出它是为了持久化存储 SecurityContext 的。

这个过滤器主要做了两件事：

- 当一个请求到来时，从 HttpSession 中获取 SecurityContext 并存入 SecurityContextHolder 中，这样在同一个请求后续的处理过程中，开发者始终可以通过 SecurityContextHolder 获取到当前登录用户信息。
- 当一个请求处理完毕时，从 SecurityContextHolder 中获取 SecurityContext 并存入 HttpSession 中（主要针对异步 Servlet），方便下一个请求到来时，再从 HttpSession 中拿出来使用，同时擦除 SecurityContextHolder 中的登录用户信息。

> 注意

在 `SecurityContextPersistenceFilter`  过滤器中，当一个请求处理完毕时，从 SecurityContextHolder 中获取 SecurityContext 存入到 HttpSession 中，这一步的操作主要针对异步 Servlet。

如果不是异步 Servlet，在响应（response）提交时，就会直接将 SecurityContext 保存到 HttpSession 中，而不会等到被 `SecurityContextPersistenceFilter`  过滤器捕获时再去存储。



### (2) SecurityContextRepository

在 `SecurityContextPersistenceFilter` 过滤器中使用了一个接口：`SecurityContextRepository`。

将 SecurityContext 存入 HttpSession，或者从 HttpSession 中加载数据并转为 SecurityContext 对象，这些事情都是由 `SecurityContextRepository` 的实现类完成的。

先看一下定义：

```java
public interface SecurityContextRepository {

	SecurityContext loadContext(HttpRequestResponseHolder requestResponseHolder);

	void saveContext(SecurityContext context, HttpServletRequest request, HttpServletResponse response);

	boolean containsContext(HttpServletRequest request);
}
```

三个方法：

- `loadContext`：这个方法用来加载 SecurityContext 对象出来，对于没有登录的用户，这里会返回一个空的 SecurityContext 对象，注意空的 SecurityContext 对象是指 SecurityContext 中不存在 Authentication 对象，而不是该方法返回 null
- `saveContext`：该方法用来保存一个 SecurityContext 对象
- `containsContext`：该方法可以判断 SecurityContext 对象是否存在。

在 Spring Security 框架中，为 `SecurityContextRepository` 提供了三个实现类：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211218201635.png)

这三个实现类中：

- `TestSeucrityContextRepository` 为单元测试提供支持；
- `NullSecurityContextRepository` 实现类中，loadContext 方法总是返回一个空的 SecurityContext 对象，saveContext 方法未作任何实现，containsContext 方法总是返回 false，所以 `NullSecurityContextRepository`  实现类实际上未做 SecurityContext 的存储工作；
- Spring Security 中默认使用的实现类是 `HttpSessionSecurityContextRepository`，通过 `HttpSessionSecurityContextRepository` 是实现了将 SecurityContext 存储到 HttpSession 以及从 HttpSession 中加载 SecurityContext 出来。



## 4、HttpSessionSecurityContextRepository

分析 `HttpSessionSecurityContextRepository` 之前先看一下它封装的两个关于请求和响应的两个内部类：



### (1) 响应：SaveToSessionResponseWrapper

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211218202601.png)

从继承图中可知，它其实是 `HttpServletResponse` 功能的扩展。这里有三个关键的实现类：

- `HttpServletResponseWrapper`：`HttpServletResponseWrapper` 实现了 `HttpServletResponse` 接口，它是 `HttpServletResponse` 的装饰类，利用 `HttpServletResponseWrapper` 可以很方便的操作参数和输出流等等
- `OnCommittedResponseWrapper`：`OnCommittedResponseWrapper` 继承自 `HttpServletResponseWrapper` ，对其功能进行了加强，最重要的加强在于可以获取 `HttpServletResponse` 的提交行为。当 `HttpServletResponse` 的 sendError、sendRedirect、flushBuffer、flush 以及 close 等方法被调用时，onResponseCommitted 方法会被触发，开发者可以在 onResponseCommitted 方法中做一些保存数据的操作，例如保存 SecurityContext。不过 `OnCommittedResponseWrapper` 中的 onResponseCommitted 方法只是一个抽象方法，并没有具体的实现，具体的实现则在它的实现类 `SaveContextOnUpdateOrErrorResponseWrapper` 中。
- `SaveContextOnUpdateOrErrorResponseWrapper` ：该类继承自 `OnCommittedResponseWrapper` 并对 onResponseCommitted 方法做了实现。在 `SaveContextOnUpdateOrErrorResponseWrapper`  类中声明了一个 contextSaved 变量，表示 SecurityContext 是否已经存储成功。当 `HttpServletResponse` 提交时，会调用 onResponseCommitted 方法，在该方法中调用 saveContext 方法，将 SecurityContext 保存到 HttpSession 中，同时将 contextSaved 变量标记为 true。saveContext 方法在这里也是一个抽象方法，具体实现在 `SaveToSessionResponseWrapper` 中。



看 `SaveToSessionResponseWrapper`  的定义：

```java
final class SaveToSessionResponseWrapper extends SaveContextOnUpdateOrErrorResponseWrapper {

    private final Log logger = HttpSessionSecurityContextRepository.this.logger;

    private final HttpServletRequest request;

    private final boolean httpSessionExistedAtStartOfRequest;

    private final SecurityContext contextBeforeExecution;

    private final Authentication authBeforeExecution;

    private boolean isSaveContextInvoked;

    SaveToSessionResponseWrapper(HttpServletResponse response, HttpServletRequest request,
                                 boolean httpSessionExistedAtStartOfRequest, SecurityContext context) {
        super(response, HttpSessionSecurityContextRepository.this.disableUrlRewriting);
        this.request = request;
        this.httpSessionExistedAtStartOfRequest = httpSessionExistedAtStartOfRequest;
        this.contextBeforeExecution = context;
        this.authBeforeExecution = context.getAuthentication();
    }

    @Override
    protected void saveContext(SecurityContext context) {
        final Authentication authentication = context.getAuthentication();
        HttpSession httpSession = this.request.getSession(false);
        String springSecurityContextKey = HttpSessionSecurityContextRepository.this.springSecurityContextKey;
        // See SEC-776
        if (authentication == null
            || HttpSessionSecurityContextRepository.this.trustResolver.isAnonymous(authentication)) {
            if (httpSession != null && this.authBeforeExecution != null) {
                // SEC-1587 A non-anonymous context may still be in the session
                // SEC-1735 remove if the contextBeforeExecution was not anonymous
                httpSession.removeAttribute(springSecurityContextKey);
                this.isSaveContextInvoked = true;
            }
            if (this.logger.isDebugEnabled()) {
                if (authentication == null) {
                    this.logger.debug("Did not store empty SecurityContext");
                }
                else {
                    this.logger.debug("Did not store anonymous SecurityContext");
                }
            }
            return;
        }
        httpSession = (httpSession != null) ? httpSession : createNewSessionIfAllowed(context, authentication);
        // If HttpSession exists, store current SecurityContext but only if it has
        // actually changed in this thread (see SEC-37, SEC-1307, SEC-1528)
        if (httpSession != null) {
            // We may have a new session, so check also whether the context attribute
            // is set SEC-1561
            if (contextChanged(context) || httpSession.getAttribute(springSecurityContextKey) == null) {
                httpSession.setAttribute(springSecurityContextKey, context);
                this.isSaveContextInvoked = true;
                if (this.logger.isDebugEnabled()) {
                    this.logger.debug(LogMessage.format("Stored %s to HttpSession [%s]", context, httpSession));
                }
            }
        }
    }

    private boolean contextChanged(SecurityContext context) {
        return this.isSaveContextInvoked || context != this.contextBeforeExecution
            || context.getAuthentication() != this.authBeforeExecution;
    }

    private HttpSession createNewSessionIfAllowed(SecurityContext context, Authentication authentication) {
        if (isTransientAuthentication(authentication)) {
            return null;
        }
        if (this.httpSessionExistedAtStartOfRequest) {
			// log......
            return null;
        }
        if (!HttpSessionSecurityContextRepository.this.allowSessionCreation) {
            // log......
            return null;
        }
        // Generate a HttpSession only if we need to
        if (HttpSessionSecurityContextRepository.this.contextObject.equals(context)) {
            // log......
            return null;
        }
        try {
            HttpSession session = this.request.getSession(true);
            this.logger.debug("Created HttpSession as SecurityContext is non-default");
            return session;
        }
        catch (IllegalStateException ex) {
            // Response must already be committed, therefore can't create a new
            // session
           // log......
        }
        return null;
    }
}
```

`SaveToSessionResponseWrapper` 中主要定义了三个方法：

- `saveContext`：该方法主要是用来保存 SecurityContext，
  - 如果 authentication 对象为 null 或者它是一个匿名对象，则不需要保存 SecurityContext；
  - 同时如果 httpSession 不为 null 并且 authBeforeExecution 也不为 null，就从 httpSession 中将保存的登录用户数据移除，这个主要是为了防止开发者在注销成功的回调中继续调用 chain.doFilter 方法，进而导致原始的登录消息无法清除的问题；
  - 如果 httpSession 为 null，则去创建一个 HttpSession 对象；
  - 最后，如果 SecurityContext 发生了变化，或者 httpSession 中没有保存 SecurityContext，则调用 httpSession 中的 setAttribute 方法将 SecurityContext 保存起来。
- `contextChanged`：该方法主要用来判断 SecurityContext 是否发生变化，因为在程序运行过程中，开发者可能修改了 SecurityContext 中的 Authentication 对象。
- `createNewSessionIfAllowed`：该方法用来创建一个 HttpSession 对象。



这就是 `HttpSessionSecurityContextRepository` 中对 `SaveToSessionResponseWrapper` 的定义，一个核心功能就是在 `HttpServletResponse` 提交的时候，将 SecurityContext 保存到 HttpSession 中。



### (2) 请求 SaveToSessionRequestWrapper



继承图如下；

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211218204726.png)

`SaveToSessionRequestWrapper` 相对而言就简单多了

```java
private static class SaveToSessionRequestWrapper extends HttpServletRequestWrapper {

    private final SaveContextOnUpdateOrErrorResponseWrapper response;

    SaveToSessionRequestWrapper(HttpServletRequest request, SaveContextOnUpdateOrErrorResponseWrapper response) {
        super(request);
        this.response = response;
    }

    @Override
    public AsyncContext startAsync() {
        this.response.disableSaveOnResponseCommitted();
        return super.startAsync();
    }

    @Override
    public AsyncContext startAsync(ServletRequest servletRequest, ServletResponse servletResponse)
        throws IllegalStateException {
        this.response.disableSaveOnResponseCommitted();
        return super.startAsync(servletRequest, servletResponse);
    }

}
```

`SaveToSessionRequestWrapper`  类实际上是在 Spring Security 3.2 之后出现的封装类，在 Spring Security 3.2 之前并不存在 `SaveToSessionRequestWrapper`  类，封装 `SaveToSessionRequestWrapper`  类的主要目的是禁止在异步 Servlet 提交时，自动保存 SecurityContext。



为什么要禁止，我们看一段示例代码：

```java
@RequestMapping(value = "/user2", method = RequestMethod.GET)
public void userInfo2(HttpServletRequest request, HttpServletResponse response) {

    // 异步 Servlet
    AsyncContext asyncContext = request.startAsync();

    // JUC 异步任务执行器
    CompletableFuture.runAsync(() -> {
        try {

            PrintWriter out = asyncContext.getResponse().getWriter();
            out.write("test asyncContext...");
            asyncContext.complete();

        } catch (IOException e) {
            e.printStackTrace();
        }
    });
}
```

可以看到，在异步 Servlet 中，当任务执行完毕之后，`HttpServletResponse` 也会自动提交，在提交的过程中触发了 onResponseCommitted 方法自动保存 SecurityContext 到 HttpSession 中，但是由于是在子线程中，因此无法获取到 SecurityContext 对象，所以会保存失败。

如果开发者使用了异步 Servlet，则默认情况下会禁用 `HttpServletResponse`  提交时自动保存 SecurityContext 这一功能，改为在 `SecurityContextPersistenceFilter` 过滤器中完成 SecurityContext 的保存操作。



### (3) HttpSessionSecurityContextRepository

看完了封装的两个关于请求和响应的包装器后，在整体看一下 `HttpSessionSecurityContextRepository`：

1. 首先通过 `SPRING_SECURITY_CONTEXT_KEY` 变量定义了 SecurityContext 在 HttpSession 中存储的 key，如果开发者需要手动操作 HttpSession 中存储的 SecurityContext，可以通过该 key 进行操作；
2. `trustResolver` 是一个用户身份评估器，用来判断当前用户是匿名用户还是通过 RememberMe 登录的用户；
3. 在 loadContext 方法中，通过调用 readSecurityContextFromSession 方法来获取 SecurityContext 对象。如果获取到的对象为 null，则调用 generateNewContext 方法去生成一个空的 SecurityContext 对象，最后构造请求和响应的装饰类并存入到 requestResponseHolder 对象中；
4. saveContext 方法用来保存 SecurityContext，在保存之前，会先调用 isContextSaved 方法判断是否已经保存了，如果已经保存了就不再保存。正常情况下，在 `HttpServletResponse` 提交时 SecurityContext 就已经保存到了 HttpSession 中了；如果是异步 Servlet，则提交时不会自动将 SecurityContext 保存到 HttpSession，此时会在这里进行保存操作；
5. containsContext 方法用来判断请求中是否存在 SecurityContext 对象
6. readSecurityContextFromSession 方法执行具体的 SecurityContext 读取逻辑，从 HttpSession 中获取 SecurityContext 并返回
7. generateNewContext 方法用来生成一个不包含 Authentication 的空的 SecurityContext 对象
8. setAllowSessionCreation 方法用来设置是否允许创建 HttpSession，默认是 true
9. setDisableUrlRewriting 方法表示是否禁用 URL 重写，默认是 false
10. setSpringSecurityContextKey 方法可以配置 HttpSession 中存储的 SecurityContext 的 key
11. isTransientAuthentication 方法判断 Authentication 是否免于存储
12. setTrustResolver 方法用来配置身份评估器



上面都是 `HttpSessionSecurityContextRepository` 提供的所有功能，这些功能都将在 `SecurityContextPersistenceFilter` 过滤器中进行调用，下面看一下 

`SecurityContextPersistenceFilter`  中的调用逻辑：

```java
public class SecurityContextPersistenceFilter extends GenericFilterBean {

	static final String FILTER_APPLIED = "__spring_security_scpf_applied";

	private SecurityContextRepository repo;

	private boolean forceEagerSessionCreation = false;

	public SecurityContextPersistenceFilter() {
		this(new HttpSessionSecurityContextRepository());
	}

	public SecurityContextPersistenceFilter(SecurityContextRepository repo) {
		this.repo = repo;
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
	}

	private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		// ensure that filter is only applied once per request
		if (request.getAttribute(FILTER_APPLIED) != null) {
			chain.doFilter(request, response);
			return;
		}
		request.setAttribute(FILTER_APPLIED, Boolean.TRUE);
		if (this.forceEagerSessionCreation) {
			HttpSession session = request.getSession();
			if (this.logger.isDebugEnabled() && session.isNew()) {
				this.logger.debug(LogMessage.format("Created session %s eagerly", session.getId()));
			}
		}
		HttpRequestResponseHolder holder = new HttpRequestResponseHolder(request, response);
		SecurityContext contextBeforeChainExecution = this.repo.loadContext(holder);
		try {
			SecurityContextHolder.setContext(contextBeforeChainExecution);
			if (contextBeforeChainExecution.getAuthentication() == null) {
				logger.debug("Set SecurityContextHolder to empty SecurityContext");
			}
			else {
				if (this.logger.isDebugEnabled()) {
					this.logger
							.debug(LogMessage.format("Set SecurityContextHolder to %s", contextBeforeChainExecution));
				}
			}
			chain.doFilter(holder.getRequest(), holder.getResponse());
		}
		finally {
			SecurityContext contextAfterChainExecution = SecurityContextHolder.getContext();
			// Crucial removal of SecurityContextHolder contents before anything else.
			SecurityContextHolder.clearContext();
			this.repo.saveContext(contextAfterChainExecution, holder.getRequest(), holder.getResponse());
			request.removeAttribute(FILTER_APPLIED);
			this.logger.debug("Cleared SecurityContextHolder to complete request");
		}
	}

	public void setForceEagerSessionCreation(boolean forceEagerSessionCreation) {
		this.forceEagerSessionCreation = forceEagerSessionCreation;
	}

}
```

过滤器的核心方法是 `doFilter`，先从它开始：

1. 首先从 request 中获取 FILTER_APPLIED 属性，如果该属性不为 null，则直接执行 chain.doFilter 方法，当前过滤器到此为止，这个判断主要是确保该请求只执行一次该过滤器。如果确实是该 request 第一次经过该过滤器，则给其设置 FILTER_APPLIED 属性。
2. forceEagerSessionCreation 变量表示是否要在过滤器链执行之前确保会话有效，由于这是一个比较耗费资源的操作，因此默认为 false。
3. 构造 `HttpRequestResponseHolder` 对象，将 `HttpServletRequest` 和 `HttpServletResponse` 都存储进去。
4. 调用 repo.loadContext 方法去加载 SecurityContext，repo 实际上就是前面分析的 `HttpSessionSecurityContextRepository` 的实例，调用它的 loadContext 方法。
5. 将读取到的 SecurityContext 存入 SecurityContextHolder 中，这样，在接下来的处理逻辑中，开发者就可以直接通过 SecurityContextHolder 获取当前登录对象了。
6. 调用 chain.doFilter 方法使请求继续走下去，但是要注意，此时传递的 request 和 response 对象是在 `HttpSessionSecurityContextRepository` 中封装后的对象，即 `SaveToSessionResponseWrapper` 和 `SaveToSessionRequestWrapper` 的实例。
7. 当请求处理完毕之后，在 finally 模块中，获取最新的 SecurityContext 对象（开发者可能在后续的处理中修改了 SecurityContext 中的 Authentication 对象），然后清空 SecurityContextHolder 中的数据；再调用 repo.saveContext 方法保存 SecurityContext，具体保存逻辑之前已经说明。
8. 最后，从 request 中移除 FILTER_APPLIED 属性。



> 总结

整个 `SecurityContextPersistenceFilter` 过滤器的工作逻辑：

请求在到达 `SecurityContextPersistenceFilter` 过滤器之后，先从 `HttpSession` 中读取 `SecurityContext` 出来，并存入 `SecurityContextHolder` 之中以备后续使用；

当请求离开 `SecurityContextPersistenceFilter` 过滤器的时候，获取最新的 `SecurityContext`  并存入 `HttpSession` 中，同时清空 `SecurityContextHolder` 中的登录用户信息。



这就是第一种获取方式，即从 SecurityContextHolder 中获取当前登录用户信息。



# 三、当前请求中获取

第二种获取当前登录用户信息的方式是从当前请求中获取，代码如下：

```java
@RequestMapping(value = "/authentication", method = RequestMethod.GET)
public void authentication(Authentication authentication) {

    System.out.println("【 authentication = " + authentication);
}

@RequestMapping(value = "/principal")
public void principal(Principal principal) {

    System.out.println("【 principal = " + principal);
}
```

重启项目，登录后访问这两个接口：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211218224704.png)

开发者可以直接在 Controller 的请求参数中放入 `Authentication` 对象来获取登录用户信息。我们知道它是 `Principal` 的子类，所以也可以直接在请求参数中放入 Principal 来接收当前登录用户信息。

需要注意的是，即使参数是 Principal，真正的实例依然是 Authentication 的实例。

我们知道 Controller 中方法的参数都是当前请求 `HttpServletRequest` 带来的，毫无疑问，前面的  `Authentication` 和 `Principal` 参数也都是 `HttpServletRequest`  带来的，那么这些数据到底是何时放入 `HttpServletRequest`  的呢？又是以何种形式存在的呢？



## 1、Servlet 安全规范

在 Servlet 规范中，最早有三个和安全管理相关的方法：

```java
public String getRemoteUser();
public boolean isUserInRole(String role);
public java.security.Principal getUserPrincipal();
```

- `getRemoteUser()`：获取登录用户名
- `isUserInRole(String role)`：判断当前登录用户是否具备某一个指定的角色
- `getUserPrincipal()`：获取当前认证主体

从 Servlet 3.0 开始，在这三个方法的基础上，又增加了三个和安全管理有关的方法：

```java
public boolean authenticate(HttpServletResponse response) throw IOException, ServletException;

public void login(String username, String password) throw ServletException;

public void logout() throw ServletException;
```

- `authenticate`：判断当前用户是否认证成功
- `login`：执行登录操作
- `logout`：执行注销操作

不过 `HttpServletRequest` 只是一个接口，在不同的情况下又不同的实现。



如果是一个普通的 Web 项目，不使用任何框架，`HttpServletRequest` 的默认实现类是 Tomcat 中的 `RequestFacade`，这是一个使用了 Facade 模式（外观模式）的类，真正提供底层服务的是 Tomcat 中的 Request 对象，只不过这个 Request 对象在实现 Servlet 规范的同时，还定义了很多 Tomcat 内部的方法，为了避免开发者直接调用到这些内部的方法，所以这里使用了外观模式。



在 Tomcat 的 Request 类中，对上面的方法都做了实现，基本上都是基于 Tomcat 提供的 `Realm` 来实现的，这种认证方式非常冷门，项目中很少使用。



如果使用了 Spring Security 框架，那么我们在 Controller 参数中拿到的 HttpServletRequest 实例将是 `Servlet3SecurityContextHolderAwareRequestWrapper`，这是被 Spring Security 封装过的请求。



看一下 `Servlet3SecurityContextHolderAwareRequestWrapper` 的继承关系：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211218230407.png)



`HttpServletRequestWrapper` 是 Servlet 提供的包装器，`SecurityContextHolderAwareRequestWrapper` 类主要实现了 Servlet 3.0 之前和安全管理有关的三个方法。

Servlet 3.0 新增的三个和安全管理相关的方法则在 `Servlet3SecurityContextHolderAwareRequestWrapper`  类中实现。

获取当前登录信息主要和前面三个方法有关，下面看一下 

`SecurityContextHolderAwareRequestWrapper` 。



## 2、SecurityContextHolderAwareRequestWrapper



```java
public class SecurityContextHolderAwareRequestWrapper extends HttpServletRequestWrapper {

	private final AuthenticationTrustResolver trustResolver;

	private final String rolePrefix;

	public SecurityContextHolderAwareRequestWrapper(HttpServletRequest request, String rolePrefix) {
		this(request, new AuthenticationTrustResolverImpl(), rolePrefix);
	}

	public SecurityContextHolderAwareRequestWrapper(HttpServletRequest request,
			AuthenticationTrustResolver trustResolver, String rolePrefix) {
		super(request);
		Assert.notNull(trustResolver, "trustResolver cannot be null");
		this.rolePrefix = rolePrefix;
		this.trustResolver = trustResolver;
	}

	private Authentication getAuthentication() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		return (!this.trustResolver.isAnonymous(auth)) ? auth : null;
	}

	@Override
	public String getRemoteUser() {
		Authentication auth = getAuthentication();
		if ((auth == null) || (auth.getPrincipal() == null)) {
			return null;
		}
		if (auth.getPrincipal() instanceof UserDetails) {
			return ((UserDetails) auth.getPrincipal()).getUsername();
		}
		if (auth instanceof AbstractAuthenticationToken) {
			return auth.getName();
		}
		return auth.getPrincipal().toString();
	}
    
	@Override
	public Principal getUserPrincipal() {
		Authentication auth = getAuthentication();
		if ((auth == null) || (auth.getPrincipal() == null)) {
			return null;
		}
		return auth;
	}

	private boolean isGranted(String role) {
		Authentication auth = getAuthentication();
		if (this.rolePrefix != null && role != null && !role.startsWith(this.rolePrefix)) {
			role = this.rolePrefix + role;
		}
		if ((auth == null) || (auth.getPrincipal() == null)) {
			return false;
		}
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
		if (authorities == null) {
			return false;
		}
		for (GrantedAuthority grantedAuthority : authorities) {
			if (role.equals(grantedAuthority.getAuthority())) {
				return true;
			}
		}
		return false;
	}

	@Override
	public boolean isUserInRole(String role) {
		return isGranted(role);
	}

	//..............
}
```

`SecurityContextHolderAwareRequestWrapper`  很好理解：

- `getAuthentication`：获取当前登录对象 Authentication，获取方式是通过 `SecurityContextHolder`，如果不是匿名对象就返回，否则返回 null；
- `getRemoteUser`：返回当前登录的用户名，如果是 Authentication 对象中存储的 Principal 是当前登录用户对象，则返回用户名；如果 Authentication 对象中存储的 Principal 是当前登录用户名（字符串），则直接返回
- `getUserPrincipal`：返回当前登录用户对象，其实就是 Authentication 的实例
- `isGranted`：该方法是一个私有方法，作用是判断当前登录用户是否具备某一个指定的角色，判断逻辑也很简单，先对传入的角色进行预处理，有的情况下可能需要添加 ROLE_ 前缀，然后调用 `Authentication#getAuthorities` 方法，获取当前登录用户所具备的所有角色，最后再和传入进来的参数进行比较
- `isUserInRole`：该方法调用 `isGranted` 方法，进而实现判断当前用户是否具备某一个指定角色的功能。



这里我们就知道了，使用了 Spring Security 后，就可以通过 `HttpServletRequest` 获取到很多当前登录用户信息了：

```java
@RequestMapping(value = "info", method = RequestMethod.GET)
public void info(HttpServletRequest request) {

    // 用户名
    String remoteUser = request.getRemoteUser();

    Authentication authentication = (Authentication) request.getUserPrincipal();

    boolean isAdmin = request.isUserInRole("admin");

    System.out.println("[ remote user = " + remoteUser + " ]");
    System.out.println("[ auth.getName() = " + authentication.getName() + " ]");
    System.out.println("[ is admin? = " + isAdmin + " ]");
}
```



结果：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211218231808.png)

前面我们直接将 `Authentication` 或者 `Principal` 参数写在 Controller 方法参数中，其实就是 Spring Security 通过过滤器从 `Servlet3SecurityContextHolderAwareRequestWrapper` 中取出来的。



## 3、SecurityContextHolderAwareRequestFilter

Spring Security 正是通过 `SecurityContextHolderAwareRequestFilter` 这个过滤器将默认的请求对象转换为 `Servlet3SecurityContextHolderAwareRequestWrapper`  的。

该过滤器的主要作用就是对 `HttpServletRequest` 请求进行再包装，重写 `HttpServletRequest`  关于安全管理的方法，`HttpServletRequest`  在整个请求过程中会被多次包装，每一次都会增加一些新的功能，例如在经过 `SecurityContextPersistenceFilter` 请求时会对它进行包装。



先看看在 `SecurityContextHolderAwareRequestFilter` 中对 `HttpServletRequest` 的处理：

```java
public class SecurityContextHolderAwareRequestFilter extends GenericFilterBean {
    
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
        throws IOException, ServletException {
        chain.doFilter(this.requestFactory.create((HttpServletRequest) req, (HttpServletResponse) res), res);
    }
    
    private HttpServletRequestFactory createServlet3Factory(String rolePrefix) {
        HttpServlet3RequestFactory factory = new HttpServlet3RequestFactory(rolePrefix);
        factory.setTrustResolver(this.trustResolver);
        factory.setAuthenticationEntryPoint(this.authenticationEntryPoint);
        factory.setAuthenticationManager(this.authenticationManager);
        factory.setLogoutHandlers(this.logoutHandlers);
        return factory;
    }
    
}


final class HttpServlet3RequestFactory implements HttpServletRequestFactory {
    
    @Override
    public HttpServletRequest create(HttpServletRequest request, HttpServletResponse response) {
        return new Servlet3SecurityContextHolderAwareRequestWrapper(request, this.rolePrefix, response);
    }   
    
}
```

从这段源码中可以看出，在 `SecurityContextHolderAwareRequestFilter#doFilter` 方法中，会调用 `requestFactory.create()` 方法对请求进行包装。

requestFactory 就是 `HttpServletRequestFactory` 类的实例，它的 create 方法里面就直接创建了一个 `Servlet3SecurityContextHolderAwareRequestWrapper` 实例。



对请求的 `HttpServletRequest` 包装之后，接下来在过滤器链中传递的 `HttpServletRequest`  对象，它的 `getRemoteUser()`、`isUserInRole(String role)` 以及 `getUserPrincipal()` 方法就可以直接使用了。



`HttpServletRequest`  中 `getUserPrincipal()` 方法有了返回值之后，最终在 Spring MVC 的 `ServletRequestMethodArgumentResolver#resolveArgument(Class<?> , HttpServletRequest)` 方法中进行默认参数解析，自动解析出 Principal 对象。开发者在 Controller 中既可以通过 Principal 来接收参数，也可以通过 Authentication 对象来接收。



