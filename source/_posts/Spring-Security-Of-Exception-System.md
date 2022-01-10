---
title: Spring Security Of Exception System
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211208174408.jpg'
coverImg: /img/20211208174408.jpg
cover: false
toc: true
mathjax: false
date: 2022-01-10 15:07:13
summary: "Spring Security 异常体系"
categories: "Spring Security"
keywords: "Spring Security"
tags: "Spring Security"
---



# Spring Security 异常体系

## 1、简介

Spring Security 中异常主要分类两大类：

- `AuthenticationException`：认证异常；
- `AccessDeniedException`：权限异常。

其中认证异常涉及的异常类型比较多，下表展示了 Spring Security 中所有认证异常：

| 异常类型                                        | 备注                                                         |
| ----------------------------------------------- | ------------------------------------------------------------ |
| `AuthenticationException`                       | 认证异常的父类，抽象类                                       |
| `BadCredentialsException`                       | 登录凭证（密码）异常                                         |
| `InsufficientAuthenticationException`           | 登录凭证不够充分而抛出的异常                                 |
| `SessionAuthenticationException`                | 会话并发管理时抛出的异常，例如会话总数超过最大限制数         |
| `UsernameNotFoundException`                     | 用户名不存在异常                                             |
| `PreAuthenticationCredentialsNotFoundException` | 身份预认证失败异常                                           |
| `ProviderNotFoundException`·                    | 未配置 `AuthenticationProvider` 异常                         |
| `AuthenticationServiceException`                | 由于系统问题而无法处理认证请求异常                           |
| `InternalAuthenticationServiceException`        | 由于系统问题而无法处理认证请求异常。和 `AuthenticationServiceException` 的不同之处在于，如果外部系统出错，则不会抛出异常 |
| `AuthenticationCredentialsNotFoundException`    | `SecurityContext` 中不存在认证主体时抛出的异常               |
| `NonceExpiredException`                         | HTTP 摘要认证时随机数过期异常                                |
| `RememberMeAuthenticationException`             | RememberMe 认证异常                                          |
| `CookieTheftException`                          | RememberMe 认证时 Cookie 被盗窃异常                          |
| `InvalidCookieException`                        | RememberMe 认证时无效的 Cookie 异常                          |
| `AccountStatusException`                        | 账户状态异常                                                 |
| `LockedException`                               | 账户被锁定异常                                               |
| `DisabledException`                             | 账户被禁用异常                                               |
| `CredentialsExpiredException`                   | 登录凭证（密码）过期异常                                     |
| `AccountExpiredException`                       | 账户过期异常                                                 |

相比于认证异常，权限异常类就要少很多，下表展示了 Spring Security 中的权限异常：

| 异常类型                        | 备注                                   |
| ------------------------------- | -------------------------------------- |
| `AccessDeniedException`         | 权限异常的父类                         |
| `AuthorizationServiceException` | 由于系统问题而无法处理权限时抛出的异常 |
| `CsrfException`                 | Csrf 令牌异常                          |
| `MissingCsrfTokenException`     | Csrf 令牌缺失异常                      |
| `InvalidCsrfTokenException`     | Csrf 令牌无效异常                      |

在实际项目中，如果 Spring Security 提供的这些异常类无法满足需求，开发者也可以根据实际需要自定义异常。



## 2、ExceptionTranslationFilter 原理分析

Spring Security 中的异常处理主要是在 `ExceptionTranslationFilter` 过滤器中完成的，该过滤器主要处理 `AuthenticationException` 和 `AccessDeniedException` 类型的异常，其他异常则会继续抛，交给上一层容器处理。

接下来分析 `ExceptionTranslationFilter` 的工作原理。

### (1) 构建 ExceptionTranslationFilter 

在 `WebSecurityConfigurerAdapter#getHttp` 方法中进行 HttpSecurity 初始化的时候，就调用了 `exceptionHandling()` 方法去配置 `ExceptionTranslationFilter` 过滤器：

```java
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

private void applyDefaultConfiguration(HttpSecurity http) throws Exception {
    http.csrf();
    http.addFilter(new WebAsyncManagerIntegrationFilter());
    http.exceptionHandling();
    http.headers();
    http.sessionManagement();
    http.securityContext();
    http.requestCache();
    http.anonymous();
    http.servletApi();
    http.apply(new DefaultLoginPageConfigurer<>());
    http.logout();
}
```

`exceptionHandling()` 方法就是调用 `ExceptionHandlingConfigurer` 去配置 `ExceptionTranslationFilter`。

对于 `ExceptionHandlingConfigurer` 配置类而言，最重要的当然是它里面的 configure 方法，看一下源码：

```java
@Override
public void configure(H http) {
    AuthenticationEntryPoint entryPoint = getAuthenticationEntryPoint(http);
    ExceptionTranslationFilter exceptionTranslationFilter = new ExceptionTranslationFilter(entryPoint,
                                                                                           getRequestCache(http));
    AccessDeniedHandler deniedHandler = getAccessDeniedHandler(http);
    exceptionTranslationFilter.setAccessDeniedHandler(deniedHandler);
    exceptionTranslationFilter = postProcess(exceptionTranslationFilter);
    http.addFilter(exceptionTranslationFilter);
}
```

可以看到，这里首先获取了一个 entryPoint 对象，这个就是认证失败时的处理器，然后创建了 `ExceptionTranslationFilter` 过滤器并传入 entryPoint。接下来还会获取一个 `AccessDeniedHandler` 对象设置给 `ExceptionTranslationFilter` 过滤器，这个 deniedHandler 就是权限异常处理器。

最后调用 `postProcess` 方法将 `ExceptionTranslationFilter` 过滤器注册到 Spring 容器中，然后调用 `addFilter` 方法再将其添加到 Spring Security 过滤器中。



### (2) AuthenticationEntryPoint

`AuthenticationEntryPoint` 实例是通过 `getAuthenticationEntryPoint` 方法获取到的，该方法如下：

```java
AuthenticationEntryPoint getAuthenticationEntryPoint(H http) {
    AuthenticationEntryPoint entryPoint = this.authenticationEntryPoint;
    if (entryPoint == null) {
        entryPoint = createDefaultEntryPoint(http);
    }
    return entryPoint;
}

private AuthenticationEntryPoint createDefaultEntryPoint(H http) {
    if (this.defaultEntryPointMappings.isEmpty()) {
        return new Http403ForbiddenEntryPoint();
    }
    if (this.defaultEntryPointMappings.size() == 1) {
        return this.defaultEntryPointMappings.values().iterator().next();
    }
    DelegatingAuthenticationEntryPoint entryPoint = new DelegatingAuthenticationEntryPoint(
        this.defaultEntryPointMappings);
    entryPoint.setDefaultEntryPoint(this.defaultEntryPointMappings.values().iterator().next());
    return entryPoint;
}
```

默认情况下，系统的 authenticationEntryPoint 变量为 null，所以最终还是通过 `createDefaultEntryPoint` 方法去创建 `AuthenticationEntryPoint` 实例。

在 `createDefaultEntryPoint` 方法中有一个 `this.defaultEntryPointMappings` 变量，它是 `LinkedHashMap<RequestMatcher, AuthenticationEntryPoint>`  类型。

可以看到，这个 LinkedHashMap 的 key 是一个 `RequestMatcher`，即一个请求匹配器，而 value 则是一个 `AuthenticationEntryPoint` 认证失败处理器，即一个请求匹配器对应一个认证失败处理器。换句话说，针对不同的请求，可以给出不同的认证失败处理器。

如果 `defaultEntryPointMappings` 变量为空，则返回一个 `Http403ForbiddenEntryPoint` 类型的处理器；

如果 `defaultEntryPointMappings` 变量中只有一项，则将这一项取取出返回即可；

如果 `defaultEntryPointMappings` 变量中有多项，则使用 `DelegatingAuthenticationEntryPoint` 代理类，在代理类中，会遍历  `defaultEntryPointMappings` 变量中的每一项，查看当前请求是否满足其 `RequestMatcher`，如果满足，则使用对应的认证失败处理器来处理。

当我们新建一个 Spring Security 项目时，不做任何配置，在 `WebSecurityConfigurerAdapter#configure(HttpSecurity)` 方法中会默认配置表单登录和 HTTP 基本认证，表单登录和 HTTP 基本认证在配置的过程中，会分别向  `defaultEntryPointMappings` 变量中添加认证失败处理器：

- 表单登录在 `AbstractAuthenticationFilterConfigurer#registerAuthenticationEntryPoint` 方法中向 `defaultEntryPointMappings` 变量添加的处理器，对应的 `AuthenticationEntryPoint` 实例就是 `LoginUrlAuthenticationEntroyPoint`，默认情况下访问需要认证才能访问的页面时，会自动跳转到登录页面，就是通过 `LoginUrlAuthenticationEntroyPoint` 实现的；
- HTTP 基本认证在 `HttpBasicConfigurer#registerDefaultEntryPoint` 方法中向 `defaultEntryPointMappings` 变量添加的处理器，对应的 `AuthenticationEntryPoint` 则是 `BasicAuthenticationEntryPoint`，当访问一个需要认证的页面时，会像响应头中添加 WWW-Authenticate 字段，然后发送错误响应，响应码为 401。

所以默认情况下，`defaultEntryPointMappings` 变量中将存在两个认证失败处理器。



### (3) AccessDeniedHandler

我们在来看 `AccessDeniedHandler` 实例的获取，`AccessDeniedHandler` 实例是通过 `getAccessDeniedHandler` 方法获取到的：

```java
AccessDeniedHandler getAccessDeniedHandler(H http) {
    AccessDeniedHandler deniedHandler = this.accessDeniedHandler;
    if (deniedHandler == null) {
        deniedHandler = createDefaultDeniedHandler(http);
    }
    return deniedHandler;
}

private AccessDeniedHandler createDefaultDeniedHandler(H http) {
    if (this.defaultDeniedHandlerMappings.isEmpty()) {
        return new AccessDeniedHandlerImpl();
    }
    if (this.defaultDeniedHandlerMappings.size() == 1) {
        return this.defaultDeniedHandlerMappings.values().iterator().next();
    }
    return new RequestMatcherDelegatingAccessDeniedHandler(this.defaultDeniedHandlerMappings,
                                                           new AccessDeniedHandlerImpl());
}
```

可以看到，`AccessDeniedHandler` 实例的获取流程和 `AuthenticationEntryPoint` 的获取流程基本一致，这里也有一个类似的 `this.defaultDeniedHandlerMappings` 变量，也可以为不同的路径配置不同的鉴权失败处理器；如果存在多个鉴权失败处理器，则可以通过代理类同一处理。

不同的是，默认情况下这里的 `this.defaultDeniedHandlerMappings` 变量是空的，所以最终获取到的实例是 `AccessDeniedHandlerImpl`。在 `AccessDeniedHandlerImpl#handle` 方法中处理鉴权失败的情况，如果存在错误页面，就跳转到错误页面，并设置响应码为 403；如果没有错误页面，则直接给出错误响应即可。

`AuthenticationEntryPoint` 和 `AccessDeniedHandler` 都有了之后，接下来就是 `ExceptionTranslationFilter` 中处理逻辑了。

### (4) ExceptionTranslationFilter

默认情况下，`ExceptionTranslationFilter` 过滤器在整个 Spring Security 过滤器链中排名倒数第二，倒数第一是 `FilterSecurityInterceptor`。在 `FilterSecurityInterceptor` 中将会对用户的身份进行校验，如果用户身份不合法，就会抛出异常，抛出来的异常，刚好就在 `ExceptionTranslationFilter` 过滤器中进行处理了。

看一下 `ExceptionTranslationFilter` 的 doFilter 方法：

```java
@Override
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
    throws IOException, ServletException {
    doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
}

private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
    throws IOException, ServletException {
    
    try {
        chain.doFilter(request, response);
    }
    catch (IOException ex) {
        throw ex;
    }
    catch (Exception ex) {
        // Try to extract a SpringSecurityException from the stacktrace
        Throwable[] causeChain = this.throwableAnalyzer.determineCauseChain(ex);
        RuntimeException securityException = (AuthenticationException) this.throwableAnalyzer
            .getFirstThrowableOfType(AuthenticationException.class, causeChain);
        if (securityException == null) {
            securityException = (AccessDeniedException) this.throwableAnalyzer
                .getFirstThrowableOfType(AccessDeniedException.class, causeChain);
        }
        if (securityException == null) {
            rethrow(ex);
        }
        if (response.isCommitted()) {
            throw new ServletException("Unable to handle the Spring Security Exception "
                                       + "because the response is already committed.", ex);
        }
        handleSpringSecurityException(request, response, chain, securityException);
    }
}
```

可以看到，在该过滤器中，直接执行了 `chain.doFilter` 方法，让当前请求继续执行剩下的过滤器（即 `FilterSecurityInterceptor`，然后用一个 `try{……}cache{……}` 代码块将 `chain.doFilter` 包裹起来，如果后面有异常抛出，就直接在这里捕获到了。

`this.throwableAnalyzer` 对象是一个异常分析器，由于异常在抛出的过程中可能被 "层层转包"，我们需要还原最初的异常，通过 `throwableAnalyzer.determineCauseChain(ex)` 方法可以获得整个异常链。

举个例子：

```java
NullPointerException aaa = new NullPointerException("aaa");
ServletException bbb = new ServletException("bbb");
IOException ccc = new IOException("ccc");

ThrowableAnalyzer throwableAnalyzer = new ThrowableAnalyzer();
Throwable[] causeChain = throwableAnalyzer.determineCauseChain(ccc);

for (int i = 0; i < causeChain.length; i++) {
    System.out.println("causeChain[i].getClass() = " + causeChain[i].getClass());
}
```

打印信息如下：

```
causeChain[i].getClass() = class java.io.IOEception
causeChain[i].getClass() = class javax.servlet.ServletException
causeChain[i].getClass() = class java.lang.NullPointerException
```

`throwableAnalyzer.determineCauseChain(ex)` 方法的功能就很清楚了：把 "层层转包" 的异常再解析出来形成一个数组。

所以在 catch 块中捕获到异常后，首先获取异常链，然后调用 `getFirstThrowableOfType` 方法查看异常链中是否有认证失败类型的异常 `AuthenticationException`，如果不存在，再去查看是否有鉴权失败类型的异常 `AccessDeniedException`。

注意这个查找顺序，先找认证异常，再找鉴权异常。

如果两种异常都存在，则调用 `handleSpringSecurityException` 方法进行异常处理，否则将异常抛出交给上层容器去处理。

看看 handleSpringSecurityException 方法：

```java
private void handleSpringSecurityException(HttpServletRequest request, HttpServletResponse response,
                                           FilterChain chain, RuntimeException exception) throws IOException, ServletException {
    
    if (exception instanceof AuthenticationException) {
        handleAuthenticationException(request, response, chain, (AuthenticationException) exception);
    }
    else if (exception instanceof AccessDeniedException) {
        handleAccessDeniedException(request, response, chain, (AccessDeniedException) exception);
    }
}

private void handleAuthenticationException(HttpServletRequest request, HttpServletResponse response,
                                           FilterChain chain, AuthenticationException exception) throws ServletException, IOException {
    
    sendStartAuthentication(request, response, chain, exception);
}

private void handleAccessDeniedException(HttpServletRequest request, HttpServletResponse response,
                                         FilterChain chain, AccessDeniedException exception) throws ServletException, IOException {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    boolean isAnonymous = this.authenticationTrustResolver.isAnonymous(authentication);
    if (isAnonymous || this.authenticationTrustResolver.isRememberMe(authentication)) {
        if (logger.isTraceEnabled()) {}
        sendStartAuthentication(request, response, chain,
					new InsufficientAuthenticationException(
							this.messages.getMessage("ExceptionTranslationFilter.insufficientAuthentication",
									"Full authentication is required to access this resource")));
    }
    else {
        if (logger.isTraceEnabled()) {}
        this.accessDeniedHandler.handle(request, response, exception);
    }
}
```

在该方法中，首先判断异常类型是不是 `AuthenticationException`，如果是，就进入 `handleAuthenticationException` 方法中处理认证失败，处理方法是 `sendStartAuthentication`；

如果异常类型是 `AccessDeniedException`，那么进入 `handleAccessDeniedException` 方法中处理鉴权失败，处理时先获取当前认证主体；如果当前认证主体是一个匿名用户，或者当前认证是通过 RememberMe 完成的，那么就认为这是认证异常，需要重新创建一个 `InsufficientAuthenticationException` 类型的异常对象，然后进入 `sendStartAuthentication` 方法进行处理，否则就认为是鉴权异常，调用 `accessDeniedHandler.handle` 方法进行处理。

最后看看 `sendStartAuthentication` 方法：

```java
protected void sendStartAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
                                       AuthenticationException reason) throws ServletException, IOException {
    
    // SEC-112: Clear the SecurityContextHolder's Authentication, as the
    // existing Authentication is no longer considered valid
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    SecurityContextHolder.setContext(context);
    this.requestCache.saveRequest(request, response);
    this.authenticationEntryPoint.commence(request, response, reason);
}
```

这里做了三件事：

（1）清除 `SecurityContextHolder` 中保存的认证主体；

（2）保存当前请求；

（3）调用 `this.authenticationEntryPoint.commence` 方法完成认证失败处理。

至此，我们前面说的 `AuthenticationEntryPoint` 和 `AccessDeniedHandler` 在这里就派上用场了。



## 3、自定义异常配置

Spring Security 中默认提供的异常处理器不一定满足我们的需求，如果开发者需要自定义异常，也是可以的，定义方式如下：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                .antMatchers("/admin").hasRole("admin")
                .anyRequest().authenticated()
                .and()
                .exceptionHandling()
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.getWriter().write("please login");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.getWriter().write("forbidden");
                })
                .and()
                .formLogin()
                .and()
                .csrf().disable();
    }
}
```

这里我们设置了访问 /admin 接口必须具备 admin 角色，其他接口只需要认证就可以访问。然后我们对 exceptionHandling 分别配置了 authenticationEntryPoint 和 accessDeniedHandler。

这里完成配置之后，defaultEntryPointMappings 和 defaultDeniedHandlerMappings 就会生效。

接下来启动项目，如果用户未经登录就访问 /hello 接口，结果如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220110161702.png)

当用户登录成功后，但是不具备 admin 角色，此时如果访问 /admin 接口，结果如下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220110162333.png)

当然，开发者也可以为不同的接口配置不同的异常处理器，配置方式如下：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        AntPathRequestMatcher matcher1 = new AntPathRequestMatcher("/qq/**");
        AntPathRequestMatcher matcher2 = new AntPathRequestMatcher("/wx/**");

        http.authorizeRequests()
                .antMatchers("/qq/**").hasRole("qq")
                .antMatchers("/wx/**").hasRole("wx")
                .anyRequest().authenticated()
                .and()
                .exceptionHandling()
                .defaultAuthenticationEntryPointFor((request, response, authException) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.getWriter().write("请使用 QQ 登录");
                }, matcher1)
                .defaultAuthenticationEntryPointFor((request, response, authException) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.getWriter().write("请使用 微信 登录");
                }, matcher2)
                .defaultAccessDeniedHandlerFor((request, response, accessDeniedException) -> {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.getWriter().write("权限不足，QQ 用户");
                }, matcher1)
                .defaultAccessDeniedHandlerFor((request, response, accessDeniedException) -> {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.getWriter().write("权限不足，微信 用户");
                }, matcher2)
                .and()
                .formLogin()
                .and()
                .csrf().disable();
    }
}
```

