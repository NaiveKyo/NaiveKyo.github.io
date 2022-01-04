---
title: Spring Security Authentication Process Analysis
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211115210617.jpg'
coverImg: /img/20211115210617.jpg
cover: false
toc: true
mathjax: false
date: 2021-12-29 19:49:52
summary: "Spring Security 登录认证流程分析"
categories: "Spring Security"
keywords: "Spring Security"
tags: "Spring Security"
---



# 登录流程分析

Spring Security 的认证流程和其三个基本组件：`AuthenticationManager`、`ProviderManager` 以及 `AuthenticationProvider` 有关，同时还有一个接入认证功能的过滤器 `AbstractAuthenticationProcessingFilter` 。



## 1、AuthenticationManager

顾名思义，`AuthenticationManager` 是一个认证管理器，它定义了 Spring Security 过滤器要如何执行认证操作。

`AuthenticationManager`  在认证成功后，会返回一个 `Authentication` 对象，这个对象会被设置到 `SecurityContextHolder` 中。

当然，如果开发者不想使用 Spring Security 提供的一套认证机制，那么也可以自定义认证流程，认证成功后，手动将 `Authentication` 存入 `SecurityContextHolder` 中。



源码如下：

```java
public interface AuthenticationManager {

	Authentication authenticate(Authentication authentication) throws AuthenticationException;

}
```

`AuthenticationManager` 是一个接口，其中只有一个方法，它的主要作用是对传入的 `Authentication` 对象进行身份认证，此时传入的 `Authentication`  参数只有 用户名/密码 等简单的属性，如果认证成功，返回的 `Authentication`  对象的属性就会得到完全填充，包括用户所具备的角色信息。



该接口有诸多实现类，其中使用最多同时也是默认使用的是 `ProviderManager`，当然开发者也可以自定义 `AuthenticationManager` 的实现类。



## 2、AuthenticationProvider

之前提到 Spring Security 支持多种不同的认证方式，不同的认证方式对应不同的身份类型，`AuthenticationProvider` 就是针对不同的身份类型执行具体的身份认证。

例如，常见的 `DaoAuthenticationProvider` 用来支持用户名/密码登录认证，`RememberMeAuthenticationProvider` 用来支持 "记住我" 的认证。

源码如下：

```java
public interface AuthenticationProvider {

	Authentication authenticate(Authentication authentication) throws AuthenticationException;

	boolean supports(Class<?> authentication);

}
```

两个方法含义如下：

（1）authenticate 方法用来执行具体的身份认证；

（2）supports 方法用来判断当前的 AuthenticationProvider 是否支持对应的身份类型。



### (1)  AbstractUserDetailsAuthenticationProvider

当用户以用户名和密码登录时，对应的 `AuthenticationProvider`  实现类是 `DaoAuthenticationProvider` ，而 `DaoAuthenticationProvider`  继承自 `AbstractUserDetailsAuthenticationProvider` 并且没有重写 authenticate 方法，所以具体的认证逻辑是在 `AbstractUserDetailsAuthenticationProvider` 的 authenticate 方法中。



```java
public abstract class AbstractUserDetailsAuthenticationProvider
		implements AuthenticationProvider, InitializingBean, MessageSourceAware {
   
    // ................
    private UserCache userCache = new NullUserCache();
    
    protected boolean hideUserNotFoundExceptions = true;
    
    private boolean forcePrincipalAsString = false;
    
    private UserDetailsChecker preAuthenticationChecks = new DefaultPreAuthenticationChecks();
    
    private UserDetailsChecker postAuthenticationChecks = new DefaultPostAuthenticationChecks();
    
    // 抽象方法，由子类完成
    protected abstract void additionalAuthenticationChecks(UserDetails userDetails,
			UsernamePasswordAuthenticationToken authentication) throws AuthenticationException;
    
    // 执行认证
    @Override
	public Authentication authenticate(Authentication authentication) throws AuthenticationException {
		Assert.isInstanceOf(UsernamePasswordAuthenticationToken.class, authentication,
				() -> this.messages.getMessage("AbstractUserDetailsAuthenticationProvider.onlySupports",
						"Only UsernamePasswordAuthenticationToken is supported"));
		String username = determineUsername(authentication);
		boolean cacheWasUsed = true;
		UserDetails user = this.userCache.getUserFromCache(username);
		if (user == null) {
			cacheWasUsed = false;
			try {
				user = retrieveUser(username, (UsernamePasswordAuthenticationToken) authentication);
			}
			catch (UsernameNotFoundException ex) {
				this.logger.debug("Failed to find user '" + username + "'");
				if (!this.hideUserNotFoundExceptions) {
					throw ex;
				}
				throw new BadCredentialsException(this.messages
						.getMessage("AbstractUserDetailsAuthenticationProvider.badCredentials", "Bad credentials"));
			}
			Assert.notNull(user, "retrieveUser returned null - a violation of the interface contract");
		}
		try {
			this.preAuthenticationChecks.check(user);
			additionalAuthenticationChecks(user, (UsernamePasswordAuthenticationToken) authentication);
		}
		catch (AuthenticationException ex) {
			if (!cacheWasUsed) {
				throw ex;
			}
			// There was a problem, so try again after checking
			// we're using latest data (i.e. not from the cache)
			cacheWasUsed = false;
			user = retrieveUser(username, (UsernamePasswordAuthenticationToken) authentication);
			this.preAuthenticationChecks.check(user);
			additionalAuthenticationChecks(user, (UsernamePasswordAuthenticationToken) authentication);
		}
		this.postAuthenticationChecks.check(user);
		if (!cacheWasUsed) {
			this.userCache.putUserInCache(user);
		}
		Object principalToReturn = user;
		if (this.forcePrincipalAsString) {
			principalToReturn = user.getUsername();
		}
		return createSuccessAuthentication(principalToReturn, authentication, user);
	}
    
    private String determineUsername(Authentication authentication) {
		return (authentication.getPrincipal() == null) ? "NONE_PROVIDED" : authentication.getName();
	}
    
    // 子类实现该方法
    protected Authentication createSuccessAuthentication(Object principal, Authentication authentication,
			UserDetails user) {
		// Ensure we return the original credentials the user supplied,
		// so subsequent attempts are successful even with encoded passwords.
		// Also ensure we return the original getDetails(), so that future
		// authentication events after cache expiry contain the details
		UsernamePasswordAuthenticationToken result = new UsernamePasswordAuthenticationToken(principal,
				authentication.getCredentials(), this.authoritiesMapper.mapAuthorities(user.getAuthorities()));
		result.setDetails(authentication.getDetails());
		this.logger.debug("Authenticated user");
		return result;
	}
    
    // ................
}
```



`AbstractUserDetailsAuthenticationProvider`  是一个抽象类，抽象方法在它的实现类 `DaoAuthenticationProvider` 中完成，该抽象类本身逻辑也很简单：

（1）一开始先声明一个用户缓存对象 `userCache`，默认情况下没有启用缓存对象；

（2）`hideUserNotFoundExceptions` 表示是否隐藏用户名查找失败的异常，默认为 true。为了确保系统安全，用户在登录失败时只会给出一个模糊提示，例如 "用户名或密码输入错误"。在 Spring Security 内部，如果用户名查找失败，则会抛出 `UsernameNotFoundException` 异常，但是默认该异常会被隐藏，转而通过一个 `BadCredentialsException` 异常来代替它；

（3）`forcePrincipalAsString` 表示是否强制将 Principal 对象当作字符串处理，默认是 false。Authentication 中的 principal 属性类型是一个 Object，正常来说，通过 principal 属性可以获取到当前登录用户对象（即 UserDetails），但是如果 `forcePrincipalAsString` 为 true，则 Authentication 中的 principal 属性返回的就是当前用户名，而不是用户对象；

（4）`preAuthenticationChecks` 对象则是用于做用户状态检查，在用户认证过程中，需要检验用户状态是否正常，例如账户是否被锁定、账户是否可用、账户是否过期等等；

（5）`postAuthenticationChecks` 对象主要负责在密码校验成功后，检查密码是否过期；

（6）`additionalAuthenticationChecks` 是一个抽象方法，主要就是校验密码，具体实现在`DaoAuthenticationProvider` 子类中；

（7）`authenticate` 方法就是核心的校验方法了。在方法中，首先从登录数据中获取用户名，然后根据用户名去缓存中查询用户对象，如果查询不到，则根据用户名调用 `retrieveUser` 方法从数据库中加载用户；如果没有加载到用户，则抛出异常。拿到用户对象后，首先调用 `preAuthenticationChecks.check` 方法进行用户状态检查，然后调用 `additionalAuthenticationChecks` 方法进行密码的校验工作，最后调用 `postAuthenticationChecks.check` 方法检查密码是否过期，当所有步骤都顺利完成后，调用 `createSuccessAuthentication` 方法创建一个认证后的 `UsernamePasswordAuthenticationToken` 对象并返回，认证后的对象包含了认证主体、凭证以及角色信息。



### (2)  DaoAuthenticationProvider

上面就是这个抽象类进行用户认证的工作流程，有几个抽象方法是在 `DaoAuthenticationProvider` 中实现的，看一下源码：

```java
public class DaoAuthenticationProvider extends AbstractUserDetailsAuthenticationProvider {
    
    private static final String USER_NOT_FOUND_PASSWORD = "userNotFoundPassword";
    
    private PasswordEncoder passwordEncoder;
    
    private volatile String userNotFoundEncodedPassword;
    
    private UserDetailsService userDetailsService;
    
    private UserDetailsPasswordService userDetailsPasswordService;
    
    @Override
	protected final UserDetails retrieveUser(String username, UsernamePasswordAuthenticationToken authentication)
			throws AuthenticationException {
		prepareTimingAttackProtection();
		try {
			UserDetails loadedUser = this.getUserDetailsService().loadUserByUsername(username);
			if (loadedUser == null) {
				throw new InternalAuthenticationServiceException(
						"UserDetailsService returned null, which is an interface contract violation");
			}
			return loadedUser;
		}
		catch (UsernameNotFoundException ex) {
			mitigateAgainstTimingAttack(authentication);
			throw ex;
		}
		catch (InternalAuthenticationServiceException ex) {
			throw ex;
		}
		catch (Exception ex) {
			throw new InternalAuthenticationServiceException(ex.getMessage(), ex);
		}
	}
    
    @Override
	@SuppressWarnings("deprecation")
	protected void additionalAuthenticationChecks(UserDetails userDetails,
			UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
		if (authentication.getCredentials() == null) {
			this.logger.debug("Failed to authenticate since no credentials provided");
			throw new BadCredentialsException(this.messages
					.getMessage("AbstractUserDetailsAuthenticationProvider.badCredentials", "Bad credentials"));
		}
		String presentedPassword = authentication.getCredentials().toString();
		if (!this.passwordEncoder.matches(presentedPassword, userDetails.getPassword())) {
			this.logger.debug("Failed to authenticate since password does not match stored value");
			throw new BadCredentialsException(this.messages
					.getMessage("AbstractUserDetailsAuthenticationProvider.badCredentials", "Bad credentials"));
		}
	}
    
    @Override
	protected Authentication createSuccessAuthentication(Object principal, Authentication authentication,
			UserDetails user) {
		boolean upgradeEncoding = this.userDetailsPasswordService != null
				&& this.passwordEncoder.upgradeEncoding(user.getPassword());
		if (upgradeEncoding) {
			String presentedPassword = authentication.getCredentials().toString();
			String newPassword = this.passwordEncoder.encode(presentedPassword);
			user = this.userDetailsPasswordService.updatePassword(user, newPassword);
		}
		return super.createSuccessAuthentication(principal, authentication, user);
	}
}
```

在 `DaoAuthenticationProvider` 中：

（1）首先定义了 `USER_NOT_FOUND_PASSWORD` 常量，这个是当用户查找失败时的默认密码；`passwordEncoder` 是一个密码加密和比对工具；`userNotFoundEncodedPassword` 变量则用来保存默认密码加密后的值；`userDetailsService` 是用户查找的工具，之前也提到过；`userDetailsPasswordService` 则用来提供密码的修改服务。

（2）在 `DaoAuthenticationProvider`  的构造方法中，默认就会指定 `PasswordEncoder`，当然开发者也可以通过 set 方法自定义；

（3）`additionalAuthenticationChecks` 方法主要进行密码校验，该方法的第一个参数 userDetails 是从数据库中查询出的用户对象；第二个参数 authentication 则是登录用户输入的参数。从这两个参数中分别提取出用户密码，然后调用 `passwordEncoder.matches` 方法进行密码比对；

（4）`retrieveUser` 方法则是获取用户对象的方法，具体做法就是调用 `UserDetailsService#loadUserByUsername` 方法去数据库中查询；

（5）在 `retrieveUser` 方法中，有一个值得关注的地方。该方法一开始会调用 `prepareTimingAttackProtection` 方法，该方法的作用是使用 `PasswordEncoder` 对常量 `USER_NOT_FOUND_PASSWORD` 进行加密，将加密结果保存在 `userNotFoundEncodedPassword` 变量中。当根据用户名查找用户时，如果抛出了 `UsernamePasswordException` 异常，则会调用 `mitigateAgainstTimingAttack` 进行密码比对。但是注意<strong style="color:red">这里使用 userNotFoundEncodedPassword 变量作为默认密码和登录请求传来的用户密码进行比对</strong>，这是一个注定要失败的密码比对，为什么还要比较呢？这主要是为了避免旁道攻击（Side-channel attack）。如果根据用户名查找用户失败，就直接抛出异常而不对密码进行比对，那么黑客经过大量测试，发现有的请求耗费时间明显小于其他请求，那么进而可以得出该请求的用户名是一个不存在的用户名（因为用户名不存在，所以不需要密码比对，进而节省时间），这样可以获取到系统信息，为了避免这一问题，所以当用户查找失败时，也会调用方法进行密码比对。

（6）`createSuccessAuthentication` 方法则是在登录成功后，创建一个全新的 `UsernamePasswordAuthenticationToken` 对象，同时会判断是否需要进行密码升级，如果需要进行密码升级，就会在该方法中进行加密方案升级。



### (3) 总结

通过对 `AbstractUserDetailsAuthenticationProvider` 和 `DaoAuthenticationProvider` 工作流程的分析，就可以很清楚的看到 `AuthenticationProvider` 的认证逻辑了。



## 3、ProviderManager

`ProviderManager` 是 `AuthenticationManager` 的一个重要实现类，我们先看一下 `ProviderManager`  和`AuthenticationProvider` 之间的关系：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211229205634.png)

由于系统可以支持多种不同的认证方式，例如同时支持用户名/密码认证、RememberMe 认证、手机号码动态认证等等，而不同的认证方式也对应不同的 `AuthenticationProvider`，所以一个完整的认证流程可能由多个`AuthenticationProvider` 来提供。

多个 `AuthenticationProvider` 将组成一个列表，这个列表将由 `ProviderManager` 代理。换句话说，在 `ProviderManager`  中存在一个 `AuthenticationProvider` 列表，在 `ProviderManager` 中遍历列表中的每一个 `AuthenticationProvider` 去进行身份认证，最终得到认证结果。

`ProviderManager` 本身也可以在配置一个 `AuthenticationManager` 作为 parent，这样当 `ProviderManager` 认证失败后，就可以进入到 parent 中再次进行认证。

理论上说 `ProviderManager` 的 parent 可以是任意类型的 `AuthenticationManager` ，但是通常都是由 `ProviderManager` 来扮演 parent 的角色，也就是 `ProviderManager` 是 `ProviderManager`  的 parent。

`ProviderManager`  本身也可以有多个，多个 `ProviderManager`  共用一个 parent，当存在多个过滤器链时非常有用，此时不同的路径可能对应不同的认证方式，但是不同路径可能又会同时存在一些共有的认证方式，这些共有的认证方式可以在 parent 中同一处理。

经过分析，可以得出新的 `ProviderManager` 和 `AuthenticationProvider` 的关系：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211229210619.png)

> authenticate 方法

重点看一下 `ProviderManager` 的 `authenticate` 方法：

```java
public class ProviderManager implements AuthenticationManager, MessageSourceAware, InitializingBean {
    
    @Override
	public Authentication authenticate(Authentication authentication) throws AuthenticationException {
		Class<? extends Authentication> toTest = authentication.getClass();
		AuthenticationException lastException = null;
		AuthenticationException parentException = null;
		Authentication result = null;
		Authentication parentResult = null;
		int currentPosition = 0;
		int size = this.providers.size();
		for (AuthenticationProvider provider : getProviders()) {
			if (!provider.supports(toTest)) {
				continue;
			}
			if (logger.isTraceEnabled()) {
				logger.trace(LogMessage.format("Authenticating request with %s (%d/%d)",
						provider.getClass().getSimpleName(), ++currentPosition, size));
			}
			try {
				result = provider.authenticate(authentication);
				if (result != null) {
					copyDetails(authentication, result);
					break;
				}
			}
			catch (AccountStatusException | InternalAuthenticationServiceException ex) {
				prepareException(ex, authentication);
				// SEC-546: Avoid polling additional providers if auth failure is due to
				// invalid account status
				throw ex;
			}
			catch (AuthenticationException ex) {
				lastException = ex;
			}
		}
		if (result == null && this.parent != null) {
			// Allow the parent to try.
			try {
				parentResult = this.parent.authenticate(authentication);
				result = parentResult;
			}
			catch (ProviderNotFoundException ex) {
				// ignore as we will throw below if no other exception occurred prior to
				// calling parent and the parent
				// may throw ProviderNotFound even though a provider in the child already
				// handled the request
			}
			catch (AuthenticationException ex) {
				parentException = ex;
				lastException = ex;
			}
		}
		if (result != null) {
			if (this.eraseCredentialsAfterAuthentication && (result instanceof CredentialsContainer)) {
				// Authentication is complete. Remove credentials and other secret data
				// from authentication
				((CredentialsContainer) result).eraseCredentials();
			}
			// If the parent AuthenticationManager was attempted and successful then it
			// will publish an AuthenticationSuccessEvent
			// This check prevents a duplicate AuthenticationSuccessEvent if the parent
			// AuthenticationManager already published it
			if (parentResult == null) {
				this.eventPublisher.publishAuthenticationSuccess(result);
			}

			return result;
		}

		// Parent was null, or didn't authenticate (or throw an exception).
		if (lastException == null) {
			lastException = new ProviderNotFoundException(this.messages.getMessage("ProviderManager.providerNotFound",
					new Object[] { toTest.getName() }, "No AuthenticationProvider found for {0}"));
		}
		// If the parent AuthenticationManager was attempted and failed then it will
		// publish an AbstractAuthenticationFailureEvent
		// This check prevents a duplicate AbstractAuthenticationFailureEvent if the
		// parent AuthenticationManager already published it
		if (parentException == null) {
			prepareException(lastException, authentication);
		}
		throw lastException;
	}
}
```

具体执行逻辑如下：

（1）首先获取 authentication 对象的类型

（2）分别定义当前认证过程抛出的异常、parent 中认证时抛出的异常、当前认证结果以及 parent 中认证结果对应的值；

（3）`getProviders` 方法用来获取当前 `ProviderManager` 所代理的所有 `AuthenticationProvider` 对象，遍历这些对象进行身份认证；

（4）判断当 `AuthenticationProvider` 是否支持当前的 `Authentication` 对象，如果不支持，则继续处理列表中下一个 `AuthenticationProvider`  对象；

（5）调用 `provider.authenticate` 方法进行身份认证，如果认证成功，返回认证后的 `Authentication`  对象，同时调用 `copyDetails` 方法给 `Authentication`  对象的 details 属性复制。由于可能是多个 `AuthenticationProvider`  执行认证操作，所以如果抛出异常，则通过 lastException 变量来记录；

（6）for 循环结束后，如果 result 还是没有值，说明所有的 `AuthenticationProvider`  都认证失败，此时如果 parent 不为 null，就调用 parent 的 authenticate 方法进行认证；

（7）接下来，如果 result 不为空，就将 result 中的凭证擦除，防止泄露。如果使用了用户名/密码的方式登录，那么所谓的擦除实际上就是将密码字段设置为 null，同时将登录成功的事件发布出去（发布登录成功事件需要 parentResult 为 null，如果 parentResult 不为 null，表示在 parent 中认证成功了，认证成功的事件也已经在 parent 中发布出去了，这样会导致发布重复的事件）。如果用户认证成功，此时就将 result 返回，后面的代码也就不需要执行了。

（8）如果前面没能返回 result，说明认证失败。如果 lastException 为 null，说明 parent 为 null 或者没有认真亦或者认真失败了但是没有抛出异常，此时构造 `ProviderNotFoundException` 异常赋值给 lastException。

（9）如果 parentException 为 null，发布认证失败事件（如果 parentException 不为 null，说明认证失败事件已经发布过了）；

（10）最后抛出 last Exception 异常。



## 4、AbstractAuthenticationProcessingFilter

前面讲了 `Authentication`、`AuthenticationManager`、`AuthenticationProvider` 以及 `ProviderManager` 的工作原理，而接下来这个过滤器就是将它们关联起来的关键。



作为 Spring Security 过滤器链中的一环，`AbstractAuthenticationProcessingFilter` 可以用来处理任何提交给它的身份认证，工作流程如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211229212952.png)

`AbstractAuthenticationProcessingFilter`  作为一个抽象类，如果使用用户名/密码登录，那么它对应的实现类就是 `UsernamePasswordAuthenticationFilter`，构造出来的 `Authentication` 对象就是 `UsernamePasswordAuthenticationToken`。至于 `AuthenticationManager`，前面说过，一般情况下它就是 `ProviderManager`，这里在 `ProviderManager` 中进行认证，认证成功就会进入认证回调，否则进入认证失败的回调。

现在可以对上面的流程图做进一步的细化：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211229214017.png)

大致的认证流程如下：

（1）当用户提交了登录请求时，`UsernamePasswordAuthenticationFilter` 会从当前请求 `HttpServletRequest` 中提取出用户名/密码，然后创建一个 `UsernamePasswordAuthenticationToken` 对象；

（2）`UsernamePasswordAuthenticationToken` 对象将被传入 `ProviderManager` 中进行具体的认证操作；

（3）如果认证失败，则 `SecurityContextHolder` 中相关信息将被清除，登录失败回调也会被调用；

（4）如果认证成功，则会进行登录信息存储、Session 并发处理、登录成功事件发布以及登录成功方法回调等操作。

这是一个大致的流程。接下来看一下 `AbstractAuthenticationProcessingFilter` 和 `UsernamePasswordAuthentication` 的源码看一下。



### (1) AbstractAuthenticationProcessingFilter

AbstractAuthenticationProcessingFilter：

```java
public abstract class AbstractAuthenticationProcessingFilter extends GenericFilterBean
		implements ApplicationEventPublisherAware, MessageSourceAware {
 
    // ................
    
    @Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
	}
    
    private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		if (!requiresAuthentication(request, response)) {
			chain.doFilter(request, response);
			return;
		}
		try {
			Authentication authenticationResult = attemptAuthentication(request, response);
			if (authenticationResult == null) {
				// return immediately as subclass has indicated that it hasn't completed
				return;
			}
			this.sessionStrategy.onAuthentication(authenticationResult, request, response);
			// Authentication success
			if (this.continueChainBeforeSuccessfulAuthentication) {
				chain.doFilter(request, response);
			}
			successfulAuthentication(request, response, chain, authenticationResult);
		}
		catch (InternalAuthenticationServiceException failed) {
			this.logger.error("An internal error occurred while trying to authenticate the user.", failed);
			unsuccessfulAuthentication(request, response, failed);
		}
		catch (AuthenticationException ex) {
			// Authentication failed
			unsuccessfulAuthentication(request, response, ex);
		}
	}
    
    protected boolean requiresAuthentication(HttpServletRequest request, HttpServletResponse response) {
		if (this.requiresAuthenticationRequestMatcher.matches(request)) {
			return true;
		}
		if (this.logger.isTraceEnabled()) {
			this.logger
					.trace(LogMessage.format("Did not match request to %s", this.requiresAuthenticationRequestMatcher));
		}
		return false;
	}
    
    public abstract Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
			throws AuthenticationException, IOException, ServletException;
    
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
			Authentication authResult) throws IOException, ServletException {
		SecurityContext context = SecurityContextHolder.createEmptyContext();
		context.setAuthentication(authResult);
		SecurityContextHolder.setContext(context);
		if (this.logger.isDebugEnabled()) {
			this.logger.debug(LogMessage.format("Set SecurityContextHolder to %s", authResult));
		}
		this.rememberMeServices.loginSuccess(request, response, authResult);
		if (this.eventPublisher != null) {
			this.eventPublisher.publishEvent(new InteractiveAuthenticationSuccessEvent(authResult, this.getClass()));
		}
		this.successHandler.onAuthenticationSuccess(request, response, authResult);
	}
    
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException failed) throws IOException, ServletException {
		SecurityContextHolder.clearContext();
		this.logger.trace("Failed to process authentication request", failed);
		this.logger.trace("Cleared SecurityContextHolder");
		this.logger.trace("Handling authentication failure");
		this.rememberMeServices.loginFail(request, response);
		this.failureHandler.onAuthenticationFailure(request, response, failed);
	}
    
    // ................
}
```

（1）首先通过 `requiresAuthentication` 方法来判断当前请求是不是登录认证请求，如果是认证请求，就执行接下来的认证代码；如果不是认证请求，则直接继续走剩余的过滤器即可；

（2）调用 `attemptAuthentication` 方法获取一个经过认证后的 `Authentication` 对象，attemptAuthentication 是一个抽象方法，具体实现在它的子类 `UsernamePasswordAuthenticationFilter` 中；

（3）认证成功后，通过 `sessionStrategy.onAuthentication` 方法来处理 session 并发问题；

（4）`continueChainBeforeSuccessfulAuthentication` 变量用来判断请求是否还需要继续向下走。默认情况下该参数的值为 false，即认证成功后，后续的过滤器将不再执行了；

（5）`unsuccessfulAuthentication` 方法用来处理认证失败事宜，主要做了三件事：1、从 `SecurityContextHolder` 中清除数据；2、清除 cookie 信息；3、调用认证失败的回调方法；

（6）`successfulAuthentication` 方法主要用来处理认证成功事宜，主要做了四件事：1、向 `SecurityContextHolder` 中存入用户信息；2、处理 cookie；3、发布认证成功事件，这个事件类型是 `InteractiveAuthenticationSuccessEvent`，表示通过一些自动交互的方式认证成功，例如通过 RememberMe 的方式登录；4、调用认证成功的回调方法。



这就是 `AbstractAuthenticationProcessingFilter` 大致做的使，还有一个抽象方法 `attemptAuthentication` 是在它的继承类 `UsernamePasswordAuthenticationFilter` 中实现的。



### (2) UsernamePasswordAuthenticationFilter

UsernamePasswordAuthenticationFilter：

```java
public class UsernamePasswordAuthenticationFilter extends AbstractAuthenticationProcessingFilter {
 
    	public static final String SPRING_SECURITY_FORM_USERNAME_KEY = "username";

	public static final String SPRING_SECURITY_FORM_PASSWORD_KEY = "password";

	private static final AntPathRequestMatcher DEFAULT_ANT_PATH_REQUEST_MATCHER = new AntPathRequestMatcher("/login",
			"POST");

	private String usernameParameter = SPRING_SECURITY_FORM_USERNAME_KEY;

	private String passwordParameter = SPRING_SECURITY_FORM_PASSWORD_KEY;

	private boolean postOnly = true;
    
	public UsernamePasswordAuthenticationFilter() {
		super(DEFAULT_ANT_PATH_REQUEST_MATCHER);
	}

	public UsernamePasswordAuthenticationFilter(AuthenticationManager authenticationManager) {
		super(DEFAULT_ANT_PATH_REQUEST_MATCHER, authenticationManager);
	}
    
	@Override
	public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
			throws AuthenticationException {
		if (this.postOnly && !request.getMethod().equals("POST")) {
			throw new AuthenticationServiceException("Authentication method not supported: " + request.getMethod());
		}
		String username = obtainUsername(request);
		username = (username != null) ? username : "";
		username = username.trim();
		String password = obtainPassword(request);
		password = (password != null) ? password : "";
		UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken(username, password);
		// Allow subclasses to set the "details" property
		setDetails(request, authRequest);
		return this.getAuthenticationManager().authenticate(authRequest);
	}
    
  	@Nullable
	protected String obtainUsername(HttpServletRequest request) {
		return request.getParameter(this.usernameParameter);
	}
    
    @Nullable
	protected String obtainPassword(HttpServletRequest request) {
		return request.getParameter(this.passwordParameter);
	}
    
    // ......
}
```

（1）首先声明了默认情况下登录表单的用户名字段和密码字段，用户名字段的 key 默认是 username，密码字段的 key 是 password。当然，这两个字段都可以在 Spring Security 的配置类中自定义；

（2）在 `UsernamePasswordAuthenticationFilter` 过滤器构建时，指定了当前过滤器只用来处理登录请求，默认的请求名是 `/login`，类型是 `POST`，开发者也可以自定义；

（3）接下来就是重要的 `attemptAuthentication` 方法了，在该方法中，首先确认请求是 POST 类型；然后通过 `obtainUsername` 和 `obtainPassword` 分别从请求中获取用户名和密码；拿到登录请求传过来的用户名/密码后，构造出一个 `authRequest` ，最后调用 `getAuthenticationManager().authenticate` 方法进行认证，这就是之前提到的 `ProviderManager`  认证流程了。



### (3) 总结

以上就是整个认证流程，搞懂了它，接下来如果想自定义一些认证方式，就会非常容易了，比如定义多个数据源、添加登录校验码等等。