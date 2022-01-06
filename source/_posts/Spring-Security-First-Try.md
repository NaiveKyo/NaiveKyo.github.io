---
title: Spring Security First Try
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031150423.jpg'
coverImg: /img/20211031150423.jpg
cover: false
toc: true
mathjax: false
date: 2021-12-09 21:52:58
summary: "认识 Spring Security"
categories: "Spring Security"
keywords: "Spring Security"
tags: "Spring Security"
---



# 前言

## 1、简介

Java 企业级开发生态丰富，无论我们想做哪一方面的功能，都有众多的框架和工具可供选择，但是有一个比较特殊，那就是属于安全领域的框架非常少，一般来说，主要有三种解决方案：

- Shiro
- Spring Security
- 开发者自己实现

Shiro 是一个老牌的安全框架，有着众多的优点，例如轻量、简单、易于集成、可以在 JavaSE 环境中使用等等。

但是，在微服务时代，Shiro 就显得力不从心了，而 Spring Security 作为 Spring 家族的一员，在和 SpringBoot、Spring Cloud 进行整合时具有无可比拟的优势，同时对 OAuth2 有着良好的支持，我们学习 Spring Security 是非常有必要的。



早期 Spring Security 的配置非常繁琐，这也成为诸多开发者不愿意使用它的一个重要原因，但是现在随着 SpringBoot 的推出，自动化配置使我们集成 Spring Security 变得非常简单，只需导入一个 maven 依赖，SpringBoot 就可以为我们自动完成许多配置，而我们只需要几行配置代码就可以做到权限管理，非常方便。



## 2、Spring Security 核心功能

对于一个安全框架而言，无论是 Shiro 还是 Spring Security，最核心的功能，无非就是如下两方面：

- 认证
- 授权

通俗点说，认证就是身份验证（你是谁？），授权就是访问控制（你可以做什么？）。



> 认证

Spring Security 支持多种认证方式，这些认证方式有的是 Spring Security 提供的，有的是第三方标准组织制定的。



Spring Security 集成的主流认证机制如下：

- 表单认证
- OAuth2.0 认证
- SAML2.0 认证
- CAS 认证
- RememberMe 自动认证
- JAAS 认证
- OpenID 去中心化认证
- Pre-Authentication Scenarios 认证
- X509 认证
- HTTP Basic 认证
- HTTP Digest 认证



除了上面这些，我们还可以引入一些第三方依赖来支持更多的认证方式，当然，如果这些方式都不满足我们的需求，我们也可以自定义认证逻辑。





> 授权

无论使用了哪种认证方式，都不影响在 Spring Security 中使用授权功能。

Spring Security 支持基于 URL 的请求授权、支持方法访问授权、支持 SpEL 访问控制、支持域对象安全（ACL），同时也支持动态权限配置、支持 RBAC 权限模型等等。





# Spring Security

新建一个 SpringBoot 项目，引入 Security 开发环境：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```



先从自动装配开始分析：找到 `SecurityAutoConfiguration` 这个类

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

可以看到如果想要自动装配生效：

- 首先类路径下面需要有 `DefaultAuthenticationEventPublisher` 这个类，它是 Spring Security 的消息发布器。
- 配置属性类：`SecurityProperties`
- 默认的配置类：`SpringBootWebSecurityConfiguration`
- 和默认配置类配套的开启 Security 注解：`WebSecurityEnablerConfiguration`
- 和 Spring Data 集成的安全配置类：`SecurityDataConfiguration` 暂时不管
- 没有权限访问时，跳转错误页的配置：`ErrorPageSecurityFilterConfiguration`



## 1、配置属性类

`SecurityProperties`，查看源码可以发现 Spring Security 配置属性的前缀是：`spring.security`。

在 application.properties 可以看到能配置的东西：

- 过滤器的 dispatcher-type
- 过滤器的级别
- oauth2 的配置
- saml2 的配置
- 手动配置 user、password、roles



## 2、默认配置类和配套开启注解

默认的配置类是 `SpringBootWebSecurityConfiguration`，当开发者没有自定义配置类时使用的就是这个配置类。

查看源码注释可知：

- 开发者可以通过继承 `WebSecurityConfigurerAdapter` 这个抽象类来定制自己的安全规则
- 同时也可以实现 `SecurityFilterChain` 接口定制过滤器链（Spring Security 框架的底层实现就是过滤器）



如果我们没有自定义配置类，但是引入了依赖，Spring Security 会通过 `WebSecurityEnablerConfiguration` 注解自动开启 Security 功能，在其源码的注释中提到：

- 如果开发者自定义了配置类，就需要加上 `@EnableWebSecurity`  才可以为我们的项目开启 Security 功能



> 总结

当我们引入了 Spring Security 环境后，如果没有提供配置类，就会使用默认的配置类，并自动开启 Security 功能。

如果开发者定制了配置，就需要让这个类继承 `WebSecurityConfigurerAdapter` 抽象类，并使用 `EnableWebSecurity`   修饰，才可以开启 Security。



## 3、认证和授权

刚刚分析了自动配置类上面的注解信息，知道了启动 Security 需要的前置条件，而这个自动配置类中只写了一个方法：

```java
@Bean
@ConditionalOnMissingBean(AuthenticationEventPublisher.class)
public DefaultAuthenticationEventPublisher authenticationEventPublisher(ApplicationEventPublisher publisher) {
    return new DefaultAuthenticationEventPublisher(publisher);
}
```

向容器中注入了名为 `authenticationEventPublisher` 的 Bean，并且将 Spring 的消息发布器通过构造器传给了它，查看源码：

```java
public class DefaultAuthenticationEventPublisher
		implements AuthenticationEventPublisher, ApplicationEventPublisherAware {}
```



可知 DefaultAuthenticationEventPublisher 实现了两个接口，Aware 接口之前提过，重点是 `AuthenticationEventPublisher`：



```java
public interface AuthenticationEventPublisher {

	void publishAuthenticationSuccess(Authentication authentication);

	void publishAuthenticationFailure(AuthenticationException exception, Authentication authentication);

}
```



> 认证



这个接口两个方法，一个是用来生成 `Authentication`，一个是生成 Authentication 失败后的处理。

这里的 `Authentication` 是一个接口，它的实现类保存着用户的认证信息。



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

- getAuthorities：获取用户的权限
- getCredentials：用来获取用户凭证，一般来说就是密码
- getDetails：用来获取用户携带的详细信息，可能是当前请求之类等等
- getPrincipal：获取当前用户，例如是一个用户名或者一个用户对象
- isAuthenticated：当前用户是否认证成功

当用户使用用户名和密码或者使用 RememberMe 登录时，都会对应一个不同的 Authentication 实例。



而通过查看源码注释可知 Spring Security 通过 `AuthenticationManager.authenticate(Authentication)` 方法来进行认证：

```java
public interface AuthenticationManager {

	Authentication authenticate(Authentication authentication) throws AuthenticationException;

}
```

该方法有三个返回值：

- 返回 Authentication 表示认证成功
- 抛出 AuthenticationException 异常，表示用户输入了无效的凭证
- 返回 null 表示不确定



`AuthenticationManager` 接口的主要实现类是 `ProviderManager`，`ProviderManager` 管理着众多的 `AuthenticationProvider` 实例，`AuthenticationProvider` 实例有些类似 `AuthenticationManager`，但是它多了一个 `supports()` 方法用于判断是否支持给定的 Authentication 类型。



```java
public interface AuthenticationProvider {

	Authentication authenticate(Authentication authentication) throws AuthenticationException;

	boolean supports(Class<?> authentication);

}
```



这是因为 Authentication  有许多不同的实现类，这些不同的实现类又由不同的 AuthenticationProvider 来处理，所以需要一个 supports 方法用于判断是否可以处理。



<mark>在一次完整的认证流程中，可能会存在多个 AuthenticationProvider 实例（例如，项目同时支持 form 表单登录和短信验证码登录），多个 AuthenticationProvider  统一由 ProviderManager 来管理。同时 ProviderManager 具有一个可选的 parent，如果所有的 AuthenticationProvider  都认证失败，那么就会调用 parent 进行认证。</mark>



> 授权



当完成认证后，接下来就是授权了。在 Spring Security 体系中，有两个关键接口：

- AccessDecisionManager
- AccessDecisionVoter



AccessDecisionVoter 是一个投票器，投票器会检查用户是否具备应有的角色，进而投出赞成、返回或者弃权票；

AccessDecisionManager 则是一个决策器，来决定此次访问是否被允许。



AccessDecisionVoter 和 AccessDecisionManager 都有众多的实现类，在 AccessDecisionManager 中会挨个遍历 AccessDecisionVoter，进而决定是否允许用户访问，因而 AccessDecisionVoter 和 AccessDecisionManager 两者的关系类似于 AuthenticationProvider 和 ProviderManager 的关系。



在 Spring Security 中，用户请求一个资源（通常是一个网络接口或者一个 Java 方法）所需要的角色会被封装成一个 `ConfigAttribute` 对象，在 `ConfigAttribute` 中只有一个 `getAttribute()` 方法，该方法返回一个字符串，就是角色的名称。

一般来说，角色名称都带有一个 ROLE_ 前缀，投票器 AccessDecisionVoter 所做的事情，其实就是比较用户所具备的角色和请求某个资源所需要的 `ConfigAttribute` 之间的关系。

```java
public interface ConfigAttribute extends Serializable {

	String getAttribute();
}
```



## 4、过滤器

### (1) SecurityFilterAutoConfiguration

在 Spring Security 中，认证和授权都是基于过滤器来做的。

而且 Spring Security Starter中有一个自动装配过滤器的类：`SecurityFilterAutoConfiguration`

```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnWebApplication(type = Type.SERVLET)
@EnableConfigurationProperties(SecurityProperties.class)
@ConditionalOnClass({ AbstractSecurityWebApplicationInitializer.class, SessionCreationPolicy.class })
@AutoConfigureAfter(SecurityAutoConfiguration.class)
public class SecurityFilterAutoConfiguration {

	private static final String DEFAULT_FILTER_NAME = AbstractSecurityWebApplicationInitializer.DEFAULT_FILTER_NAME;

	@Bean
	@ConditionalOnBean(name = DEFAULT_FILTER_NAME)
	public DelegatingFilterProxyRegistrationBean securityFilterChainRegistration(
			SecurityProperties securityProperties) {
		DelegatingFilterProxyRegistrationBean registration = new DelegatingFilterProxyRegistrationBean(
				DEFAULT_FILTER_NAME);
		registration.setOrder(securityProperties.getFilter().getOrder());
		registration.setDispatcherTypes(getDispatcherTypes(securityProperties));
		return registration;
	}

    // 。。。。。。
}
```

这里面有两个重点：

- `AbstractSecurityWebApplicationInitializer` 这个类可以加载 Spring Security 的上下文，在 web 容器启动时先于其他过滤器注册 `DelegatingFilterProxy`
- 该配置类的主要作用是通过 `DelegatingFilterProxyRegistrationBean`（其实就是 DelegatingFilterProxy） 去注册名为 "springSecurityFilterChain" 的过滤器（它其实就是 `FilterChainProxy`，管理着众多 `SecurityFilterChain`）
  - 可以全局搜索这个变量，发现在 `WebSecurityConfiguration` 中多次使用它。而 WebSecurityConfiguration 这个配置类也很重要，在这里注册了名为 "springSecurityFilterChain" 的 过滤器，而且是通过名为 `WebSecurity` 的 final 类去构建 FilterChainProxy 的



> WebSecurity

查看 WebSecurity 的源码注释可知，WebSecurityConfiguration 配置类创建了 WebSecurity 的实例，并且通过它去创建名为 "springSecurityFilterChain" 的 FilterChainProxy，最终 springSecurityFilterChain 又被 DelegatingFilterProxy 所代理，而且 DelegatingFilterProxyRegistrationBean 是 DelegatingFilterProxy  的实现类。

 

### (2) 常用 Filter

下表列出 Spring Security 中常见的过滤器，是否默认加载指引入 Spring Security 后，如果开发者没有做任何配置，会自动加载的过滤器：

| 过滤器                                   | 过滤器作用                                                   | 是否默认加载 |
| ---------------------------------------- | ------------------------------------------------------------ | ------------ |
| ChannelProcessingFilter                  | 过滤请求协议，如 HTTPS 和 HTTP                               | NO           |
| WebAsyncManagerIntegrationFilter         | 将 WebAsyncManager 与 Spring Security 上下文进行集成         | YES          |
| SecurityContextPersistenceFilter         | 在处理请求之前，将安全信息加载到 SecurityContextHolder 中以方便后续使用。请求结束后，再擦除 SecurityContextHolder 中的信息 | YES          |
| HeaderWriterFilter                       | 头信息加入到响应中                                           | YES          |
| CorsFilter                               | 处理跨域问题                                                 | NO           |
| CsrfFilter                               | 处理 CSRF 攻击                                               | YES          |
| LogoutFilter                             | 处理注销登录                                                 | YES          |
| OAuth2AuthorizationRequestRedirectFilter | 处理 OAuth2 认证重定向                                       | NO           |
| Saml2WebSsoAuthenticationRequestFilter   | 处理 SAML 认证                                               | NO           |
| AbstractPreAuthenticatedProcessingFilter | 处理预认证问题                                               | NO           |
| CasAuthenticationFilter                  | 处理 CAS 单点登录                                            | NO           |
| OAuth2LoginAuthenticationFilter          | 处理 OAuth2 认证                                             | NO           |
| Saml2WebSsoAuthenticationFilter          | 处理 SAML 认证                                               | NO           |
| UsernamePasswordAuthenticationFilter     | 处理表单登录                                                 | YES          |
| OpenIDAuthenticationFilter               | 处理 OpenID 认证                                             | NO           |
| DefaultLoginPageGeneratingFilter         | 配置默认登录页面                                             | YES          |
| DefaultLogoutPageGeneratingFilter        | 配置默认注销页面                                             | YES          |
| ConcurrentSessionFilter                  | 处理 Session 有效期                                          | NO           |
| DigestAuthenticationFilter               | 处理 HTTP 摘要认证                                           | NO           |
| BearerTokenAuthenticationFilter          | 处理 OAuth2 认证时的 Access Token                            | NO           |
| BasicAuthenticationFilter                | 处理 HttpBasic 登录                                          | YES          |
| RequestCacheAwareFilter                  | 处理请求缓存                                                 | YES          |
| SecurityContextHolderAwareRequestFilter  | 包装原始请求                                                 | YES          |
| JaasApiIntegrationFilter                 | 处理 JAAS 认证                                               | NO           |
| RememberMeAuthenticationFilter           | 处理 RememberMe 登录                                         | NO           |
| AnonymousAuthenticationFilter            | 配置匿名认证                                                 | YES          |
| OAuth2AuthorizationCodeGrantFilter       | 处理 OAuth2 认证中的授权码                                   | NO           |
| SessionManagementFilter                  | 处理 Session 并发问题                                        | YES          |
| ExceptionTranslationFilter               | 处理异常认证/授权中的情况                                    | YES          |
| FilterSecurityInterceptor                | 处理授权                                                     | YES          |
| SwitchUserFilter                         | 处理账户切换                                                 | NO           |

开发者见到的 Spring Security 提供的功能，都是由这些过滤器实现的，这些过滤器按照既定的优先级进行排序，最终形成一个过滤器链。

开发者也可以自定义过滤器，并通过 `@Order` 注解去调整自定义过滤器在过滤器链中的位置。



### (3) Spring Security 过滤器链和原生 web 过滤器链

需要注意的是：默认的过滤器并不是直接放在 Web 项目的原生过滤器链中，而是通过一个 `FilterChainProxy` 来统一管理。Spring Security  中的过滤器链通过 `FilterChainProxy` 嵌入到 Web 项目的原生过滤器链中：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211212105544.png)



在 Spring Security 中，这样的过滤器链不仅仅只有一个，可能会有多个，当存在多个多滤器链时，多个过滤器链需要指定优先级，当请求到达后，会从 `FilterChainProxy` 进行分发，先和哪个过滤器链匹配上，就用哪个过滤器链进行处理，当系统中存在多个不同的认证体系时，那么使用多个过滤器链就非常有效。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211212110044.png)



`FilterChainProxy` 作为一个顶层管理者，将统一管理 Security Filter。

FilterChainProxy 本身将通过 Spring 框架提供的 `DelegatingFilterProxy` 整合到原生过滤器链中，所以上图还可以做进一步优化：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211212110354.png)



## 5、保存登录数据

如果不使用 Spring Security 这一类的安全管理框架，大部分开发者可能会将登录用户数据保存在 Session 中，事实上，Spring Security 也是这么做的。但是，为了使用方便，Spring Security 在此基础上还做了一些改进，其中最主要的一个变化就是线程绑定。



当用户登录成功后，Spring Security 会将登录成功的用户信息保存到 `SecurityContextHolder` 中。

`SecurityContextHolder` 中的数据保存默认是通过 `ThreadLocal` 来实现的（<mark>注: Spring MVC 的处理流程中也用到了这个</mark>），使用 `ThreadLocal` 创建的变量只能被当前线程访问（以当前线程为 key，从 ThreadLocalMap 中取值），不能被其他线程访问和修改，也就是将用户数据和请求线程绑定在一起。



当登录请求处理完毕后，Spring Security 会将 SecurityContextHolder 中的数据拿出来保存到 Session 中，同时将 SecurityContextHolder 中的数据清空。以后每当由请求到来时，Spring Security 就会先从 Session 中取出用户登录数据，保存到 SecurityContextHolder 中，方便在该请求后续处理过程中使用，同时在请求结束后将 SecurityContextHolder 中的数据拿出来保存到 Session 中，然后将 SecurityContextHolder 中数据清空。



这一策略非常方便用户在 Controller 或者 Service 中获取当前用户登录的数据，但是也带来的另外一个问题：在子线程中想要获取用户登录数据就比较麻烦。

Spring Security 对此也提供了相应的解决方案，如果开发者使用 `@Sync` 注解来开启异步任务的话，那么只需要添加如下配置，使用 Spring Security 提供的异步任务代理，就可以在异步任务中获取当前登录用户的信息：



```java
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurerSupport;
import org.springframework.security.concurrent.DelegatingSecurityContextExecutorService;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * @author NaiveKyo
 * @version 1.0
 * @description: 使用 Spring Security 代理异步任务
 * @since 2021/12/12 11:15
 */
@Configuration
public class ApplicationConfiguration extends AsyncConfigurerSupport {

    @Override
    public Executor getAsyncExecutor() {
        return new DelegatingSecurityContextExecutorService(Executors.newFixedThreadPool(5));
    }
}
```

