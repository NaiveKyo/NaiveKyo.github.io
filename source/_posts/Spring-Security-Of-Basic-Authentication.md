---
title: Spring Security Of Basic Authentication
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031150436.jpg'
coverImg: /img/20211031150436.jpg
cover: false
toc: true
mathjax: false
date: 2021-12-13 20:41:39
summary: "Spring Security 基本认证流程"
categories: "Spring Security"
keywords: "Spring Security"
tags: "Spring Security"
---



# Spring Security 认证

# 一、Spring Security 基本认证

## 1、快速启动

新建一个 Spring Boot 项目，引入 Spring Security 启动器：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```



在项目中编写一个测试用的 Controller：

```java
@Controller
public class HelloController {
    
    @GetMapping("/hello")
    @ResponseBody
    public String test() {
        
        return "hello spring security!";
    }
}
```



启动项目，可以看到控制台输出了一行密码：

`Using generated security password: 92ac4489-2e04-4ae0-8b3f-7916da390e42`

这是因为引入了 Spring Security 依赖后，Spring Boot 自动为我们装配了许多 Bean，现在 "/hello" 接口已经被保护了，在浏览器访问该 url，会自动跳转到 Spring Security 提供的登陆页面，而且默认 Spring Security 采用内存认证策略，默认用户名是 user，默认密码是使用 UUID 自动生成的密码，每次项目启动都不一样。



## 2、流程分析

前面案例的流程如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211213210441.png)

整个流程：

1.  客户端请求 /hello 接口，这个接口默认是需要认证之后才可以访问的
2.  这个请求会走一遍 Spring Security 中的过滤器链，在最后的 `FilterSecurityInterceptor` 过滤器中被拦截下来，因为系统发现用户未认证。请求拦截下来之后，接下来会抛出 `AccessDeniedException` 异常
3.  抛出的 `AccessDeniedException` 异常在 `ExceptionTranslationFilter` 过滤器中被捕获，`ExceptionTranslationFilter` 过滤器通过调用 `LoginUrlAuthenticationEntryPoint#commence` 方法给客户端返回 302，要求客户端重定向到 /login 页面
4.  客户端发送 /login 请求
5.  /login 请求被 `DefaultLoginPageGeneratingFilter` 过滤器拦截下来，并在该过滤器中返回登录页面。所以用户访问 /hello 接口时会首先看到登录页面



## 3、原理分析

我们引入了 Spring Security 的启动器后，Spring Boot 在背后做了很多处理：

- 开启 Spring Security 自动化配置，开启后，会自动创建一个名为 <mark>"springSecurityFilterChain"</mark> 的过滤器（FilterChainProxy），并注入到 Spring 容器中，这个过滤器将负责所有安全管理，包括用户的认证、授权、重定向到登录页面等等（springSecurityFilterChain 实际上代理 Spring Security 中的过滤器链）
- 创建一个 `UserDetailsService` 实例，UserDetailsService 负责提供用户数据，默认的用户数据是基于内存的用户，用户名为 user，密码则是随机生成的 UUID 字符串
- 给用户生成一个默认的登录页面
- 开启 CSRF 攻击防御
- 开启会话固定攻击防御
- 集成 X-XSS-Protection
- 集成 X-Frame-Options 以防止单击劫持

这里面涉及到的细节非常多，这里只简要分析一下默认用户的生成及默认登录页面的生成。



### (1) 默认用户生成

Spring Security 中定义了 `UserDetails` 接口来规范开发者自定义的用户对象

```java
public interface UserDetails extends Serializable {

	Collection<? extends GrantedAuthority> getAuthorities();
    
	String getPassword();

	String getUsername();

	boolean isAccountNonExpired();

	boolean isAccountNonLocked();

	boolean isCredentialsNonExpired();

	boolean isEnabled();
}
```

接口定义了 7 个方法：

- getAuthorities：返回当前账户具备的权限
- getPassword：返回当前账户的密码
- getUsername：返回当前账户的用户名
- isAccountNonExpired：返回当前账户是否过期
- isAccountNonLocked：返回当前账户是否被锁定
- isCredentialsNonExpired：返回当前账户凭证（如密码）是否未过期
- isEnabled：返回当前账户是否可用



**UserDetails** 是用户对象的定义，之后会封装到 `Authentication` 对象中，而负责提供用户数据的接口是 `UserDetailsService`：

```java
public interface UserDetailsService {

	UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;

}
```

loadUserByUsername 方法有一个参数是 username，这是用户在认证时传入的用户名，最常见的是用户在表单中输入的用户名（实际开发可能存在其他情况，比如使用 CAS 单点登录时，username 并非表单输入的用户名，而是 CAS Server 认证成功回调的用户名参数），开发者在这里拿到用户名之后，再去数据库中查询用户，最终返回一个 UserDetails 实例。



实际项目中，一般需要开发者自定义 `UserDetailsService` 的实现，如果开发者没有自定义，Spring Security 也为 UserDetailsService 提供了默认实现，如图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211213213049.png)



- UserDetailsManager 在 UserDetailsService 的基础上，继续定义了添加用户、更新用户、删除用户、修改密码以及判断用户是否存在共 5 种方法
- JdbcDaoImpl 在 UserDetailsService 基础上，通过 spring-jdbc 实现了从数据库中查询用户的方法
- InMemoryUserDetailsManager 实现了 UserDetailsManager 中关于用户的增删改查方法，不过都是基于内存的操作，数据并没有持久化
- JdbcUserDetailsManager 集成自 JdbcDaoImpl 同时又实现了 UserDetailsManager 接口，因此可以通过 JdbcUserDetailsManager 实现对应的增删改查操作，这些操作都会持久化到数据库中。不过 JdbcUserDetailsManager 有一个局限性，就是操作数据库中用户的 SQL 都是提前写好的，不够灵活，因此实际开发中 JdbcUserDetailsManager 使用不多
- CachingUserDetailsService 的特点是会将 UserDetailsService  缓存起来
- UserDetailsServiceDelegator 则是提供了 UserDetailsService 的懒加载功能
- ReactiveUserDetailsServiceAdapter 是 webflux-web-security 模块定义的 UserDetailsService 的实现



当我们使用 Spring Security 时，如果仅仅引入依赖而不做任何自定义配置，则默认使用的用户就是 `InMemoryUserDetailsManager` 提供的。

Spring Boot 加载了 Spring Security 的诸多配置类，其中针对 `UserDetailsService` 的自动化配置类是 `UserDetailsServiceAutoConfiguration`。



```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnClass(AuthenticationManager.class)
@ConditionalOnBean(ObjectPostProcessor.class)
@ConditionalOnMissingBean(
		value = { AuthenticationManager.class, AuthenticationProvider.class, UserDetailsService.class,
				AuthenticationManagerResolver.class },
		type = { "org.springframework.security.oauth2.jwt.JwtDecoder",
				"org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector",
				"org.springframework.security.oauth2.client.registration.ClientRegistrationRepository" })
public class UserDetailsServiceAutoConfiguration {

	private static final String NOOP_PASSWORD_PREFIX = "{noop}";

	private static final Pattern PASSWORD_ALGORITHM_PATTERN = Pattern.compile("^\\{.+}.*$");

	private static final Log logger = LogFactory.getLog(UserDetailsServiceAutoConfiguration.class);

	@Bean
	@Lazy
	public InMemoryUserDetailsManager inMemoryUserDetailsManager(SecurityProperties properties,
			ObjectProvider<PasswordEncoder> passwordEncoder) {
		SecurityProperties.User user = properties.getUser();
		List<String> roles = user.getRoles();
		return new InMemoryUserDetailsManager(
				User.withUsername(user.getName()).password(getOrDeducePassword(user, passwordEncoder.getIfAvailable()))
						.roles(StringUtils.toStringArray(roles)).build());
	}

	private String getOrDeducePassword(SecurityProperties.User user, PasswordEncoder encoder) {
		String password = user.getPassword();
		if (user.isPasswordGenerated()) {
			logger.info(String.format("%n%nUsing generated security password: %s%n", user.getPassword()));
		}
		if (encoder != null || PASSWORD_ALGORITHM_PATTERN.matcher(password).matches()) {
			return password;
		}
		return NOOP_PASSWORD_PREFIX + password;
	}

}
```

可以看到这个自动装配类的加载条件：

- 当前 classpath 下存在 AuthenticationManager 类
- 当前项目，系统没有提供 AuthenticationManager、AuthenticationProvider、UserDetailsService 以及 AuthenticationManagerResolver 的实例



默认情况下这些条件都会满足，然后就加载这个自动配置类从而装配 InMemoryUserDetailsManager。

在生成 InMemoryUserDetailsManager 实例的时候使用了 `SecurityProperties` 配置类中的属性，主要是获取用户名、密码和用户角色。

注意到这里在 `getOrDeducePassword()` 方法中对密码做了二次处理，但是由于 `PasswordEncoder` 默认是 null，所以只是在生成的密码前面拼接了 "{noop}"，表示密码是明文存储的。



```java
// org.springframework.boot.autoconfigure.security.SecurityProperties$User

public static class User {

    private String name = "user";

    private String password = UUID.randomUUID().toString();
    
    private List<String> roles = new ArrayList<>();
    // ...........
}
```



之后将这些信息封装到 Spring Security 提供的 UserDetails 的默认实现 `org.springframework.security.core.userdetails.User` 中，这个类也很特别，私有化构造器，只能通过构建方法去构建一个实例，这里用到是这个方法：

```java
// org.springframework.security.core.userdetails.User#build()

public UserDetails build() {
    String encodedPassword = this.passwordEncoder.apply(this.password);
    return new User(this.username, encodedPassword, !this.disabled, !this.accountExpired,
                    !this.credentialsExpired, !this.accountLocked, this.authorities);
}
```



### (2) 默认页面生成

如果我们没有自定义配置，Spring Security 会为我们提供两个页面：登录和注销

- 登录：localhost:8080/login
- 注销：localhost:8080/logout



之前提到 Spring Security 的诸多过滤器，其中包含两个和页面有关的过滤器：

- `DefaultLoginPageGeneratingFilter`
- `DefaultLogoutPageGeneratingFilter`



> DefaultLoginPageGeneratingFilter

DefaultLoginPageGeneratingFilter 作为 Spring Security 过滤器的一员，在第一次请求 /hello url 时就会经过该过滤器，但是由于 /hello 接口和登录无关，因此 DefaultLoginPageGeneratingFilter 并未干涉 /hello 接口，但是第二次重定向到 /login 页面的时候，就会在该过滤器中进行处理。



查看源码：

```java
public class DefaultLoginPageGeneratingFilter extends GenericFilterBean { 

    // ...............
    
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
	}

	private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		boolean loginError = isErrorPage(request);
		boolean logoutSuccess = isLogoutSuccess(request);
		if (isLoginUrlRequest(request) || loginError || logoutSuccess) {
			String loginPageHtml = generateLoginPageHtml(request, loginError, logoutSuccess);
			response.setContentType("text/html;charset=UTF-8");
			response.setContentLength(loginPageHtml.getBytes(StandardCharsets.UTF_8).length);
			response.getWriter().write(loginPageHtml);
			return;
		}
		chain.doFilter(request, response);
	}
	
    // ...............
}
```



(1) 在 doFilter 方法中，首先判断当前请求是否为登录出错请求、注销成功请求或者登录请求。如果是这三个请求中的任意一个，就会使用 generateLoginPageHtml 方法生成登录页面并返回，否则请求继续往下走，执行下一个过滤器。

(2) 在 generateLoginPageHtml 方法中，如果有异常信息就把异常信息取出来一同返回给前端，然后根据不同登录场景，生成不同的登录页面。生成过程其实就是字符串拼接。

(3) 登录页面生成后，接下来通过 HttpServletResponse 将登录页面写回给前端，然后调用 return 方法跳出过滤器链 



> DefaultLogoutPageGeneratingFilter

下面看 DefaultLogoutPageGeneratingFilter 的核心源码：



```java
public class DefaultLogoutPageGeneratingFilter extends OncePerRequestFilter {
 	
    // ...............
    
    	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		if (this.matcher.matches(request)) {
			renderLogout(request, response);
		}
		else {
			if (logger.isTraceEnabled()) {
				logger.trace(LogMessage.format("Did not render default logout page since request did not match [%s]",
						this.matcher));
			}
			filterChain.doFilter(request, response);
		}
	}
    
    // ....................
}
```

请求到来回判断是否是注销请求 /logout，如果是就渲染一个注销请求的页面返回给客户端，如果不是请求就会继续往下走，执行下一个过滤器。



# 二、登录表单配置

## 1、前置准备

下面看看 Spring Security 采用表单认证是如何配置的。



先设置自己的用户名和密码：

```properties
spring.security.user.name=naivekyo
spring.security.user.password=123456
```



然后在 resources/static 目录下新建一个 login.html，这个是我们自定义的登录页面：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>登录</title>
    <link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.0.2/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.0.2/js/bootstrap.min.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    
    <style>
        #login .container #login-row #login-column #login-box {
            margin-top: 20px;
            padding: 20px;
            border: 1px solid #9C9C9C;
            background-color: #EAEAEA;
        }
    </style>
</head>
<body>

<div id="login">
    <div class="container">
        <div id="login-row" class="row justify-content-center align-items-center">
            <div id="login-column" class="col-md-6">
                <div id="login-box" class="col-md-12">
                    <form id="login-form" class="form" action="/doLogin" method="post">
                        <h3 class="text-center text-info">登录</h3>
                        
                        <div class="form-group">
                            <label for="username" class="text-info">用户名:</label> <br />
                            <input type="text" name="uname" id="username" class="form-control">
                        </div>
                        
                        <div class="form-group">
                            <label for="password" class="text-info">密码:</label> <br />
                            <input type="text" name="passwd" id="password" class="form-control">
                        </div>
                        <br />
                        <div class="form-group">
                            <input type="submit" name="submit" class="btn btn-info btn-md" value="登录">
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

</body>
</html>
```

这个登录表单中有一个需要注意的地方：form 的 action，这里是 /doLogin，表示表单要提交到 /doLogin 接口上。



下面定义两个测试接口：

```java
@Controller
public class LoginController {

    @GetMapping("/index")
    @ResponseBody
    public String index() {
        return "login success.";
    }
    
    @GetMapping("/hello")
    @ResponseBody
    public String test() {
        
        return "hello spring security!";
    }
}
```

提供一个 Spring Security 的配置类：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                    .loginPage("/login.html")
                    .loginProcessingUrl("/doLogin")
                    .defaultSuccessUrl("/index")
                    .failureUrl("/login.html")
                    .usernameParameter("uname")
                    .passwordParameter("passwd")
                    .permitAll()
                .and()
                .csrf().disable();
    }
}
```

前面提高过如何为 Spring Security 提供配置类，而且继承的 WebSecurityConfigurerAdapter 比较复杂，可以配置很多东西，这里只是简单的配置一下和表单登录有关的。

- 这里使用的链式调用
- `authorizeRequests()` 方法表示开启权限配置，`.anyRequest().authenticated()` 表示所有的请求都要认证之后才能访问。
- `and()` 方法返回 `HttpSecurityBuilder` 对象的一个子类（实质就是 HttpSecurity），所以 and 方法相当于又回到了 HttpSecurity 实例，重新开始新一轮的配置，如果不想使用 and 方法，可以结束链式调用，下面接着以 http. 开头配置。
- `formLogin()` 表示开启表单登录配置，后面配置的几个参数比较好理解，需要注意的就是有些参数要和表单中一致
- 最后的 `.csrf().disable()` 表示禁用 CSRF 防御功能，Spring Security 自带了 CSRF 防御机制，这里为了方便测试，先关闭它。



启动项目，访问：localhost:8080/login.html

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211213225837.png)

输入之前配置的用户名和密码，点击登录：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211213225916.png)

## 2、配置细节

### (1) 登录成功后重定向

之前在配置类中关于登录成功后跳转的请求使用的是 `.defaultSuccessUrl("/index")`，其实还有一个 `.successForwardUrl("/index")` 也可以实现登录成功后的跳转。

两者区别如下：

- defaultSuccessUrl 表示当用户登录成功之后，会自动重定向到登录之前的地址上，如果用户本身就是直接访问的登录页面，则登录成功后会重定向到 defaultSuccessUrl 指定的页面中。如果用户一开始访问的是 /hello ，那么登录成功后就会重定向到 /hello
- successForwardUrl 则不会考虑用户之前的访问地址，只要用户登录成功，就会通过服务端跳转到 successForwardUrl  指定的页面。
- defaultSuccessUrl  有一个重载方法，如果重载方法的第二个参数传入 true，则 defaultSuccessUrl  的效果和 successForwardUrl 类似，即不考虑用户之前的访问地址。
- 不同之处在于：defaultSuccessUrl  是通过重定向实现的跳转（客户端跳转），而 successForwardUrl 是通过服务器端实现的跳转



无论 defaultSuccessUrl 还是 successForwardUrl ，最终所配置的都是 `AuthenticationSuccessHandler` 接口的实例：

```java
public interface AuthenticationSuccessHandler {

	default void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
			Authentication authentication) throws IOException, ServletException {
		onAuthenticationSuccess(request, response, authentication);
		chain.doFilter(request, response);
	}

	void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException;

}
```

该接口一共定义了两个方法，一个是 default 方法，该方法是从 5.2 版本后加入的，在处理特定的认证请求 `AuthenticationFilter` 中会用到，另一个非 default 方法，则用来处理登录成功的具体事项，其中 Authentication 类型的参数保存了登录成功的用户信息。



### (2) AuthenticationSuccessHandler



`AutenticationSuccessHandler` 接口共有三个实现类，如图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211214092725.png)



- `SimpleUrlAutenticationSuccessHandler` 继承自 `AbstractAuthenticationTargetUrlRequestHandler`，通过 AbstractAuthenticationTargetUrlRequestHandler 的 handle 方法实现请求重定向
- `SavedRequestAwareAuthenticationSuccessHandler` 在 SimpleUrlAutenticationSuccessHandler 的基础上增加了请求缓存的功能，可以记录之前请求的地址，进而在登录成功后重定向到一开始访问的地址
- `ForwardAuthenticationSuccessHandler` 的实现则比较容易，就是一个服务器跳转



下面重点分析 `SavedRequestAwareAuthenticationSuccessHandler`  和 `ForwardAuthenticationSuccessHandler`  的实现。



当使用 `defaultSuccessUrl()` 来设置登录成功后重定向的地址时，实际上对应的实现类就是 `SavedRequestAwareAuthenticationSuccessHandler` ，看一下该类中的核心代码：

```java
public class SavedRequestAwareAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    @Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws ServletException, IOException {
        
		SavedRequest savedRequest = this.requestCache.getRequest(request, response);
        
		if (savedRequest == null) {
			super.onAuthenticationSuccess(request, response, authentication);
			return;
		}
        
		String targetUrlParameter = getTargetUrlParameter();
		if (isAlwaysUseDefaultTargetUrl()
				|| (targetUrlParameter != null && StringUtils.hasText(request.getParameter(targetUrlParameter)))) {
			this.requestCache.removeRequest(request, response);
			super.onAuthenticationSuccess(request, response, authentication);
			return;
		}
        
		clearAuthenticationAttributes(request);
		// Use the DefaultSavedRequest URL
		String targetUrl = savedRequest.getRedirectUrl();
		getRedirectStrategy().sendRedirect(request, response, targetUrl);
	}
    
    // .............
}
```

逻辑也很简单：

- 首先使用 `SaveRequest` 缓存之前访问的请求，接着判断是不是 null，如果是就调用父类的 `onAuthenticationSuccess` 方法，最终会重定向到 defaultSuccessUrl 指定的地址。

- 接下来获取 `targetUrlParameter` 这个就是用户显式指定的、希望登录成功后重定向的地址，例如用户访问 localhost:8080/doLogin?target=/hello，那么当用户登录成功后，希望自动重定向到 /hello 接口。targetUrlParamter 拿到的就是地址中的 key 即 target
- 如果 `targetUrlParameter` 存在，或者用户设置了 `alwaysUseDefaultTargetUrl` 为 true，这时缓存的请求就没有意义了，此时会直接调用父类的 `onAuthenticationSuccess` 方法完成重定向
- 如果前面的条件都不满足，那么最终会从 SaveRequest 中获取重定向地址，然后进行重定向操作



当然，开发者也可以配置自己的 `SavedRequestAwareAuthenticationSuccessHandler` :



```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                    .loginPage("/login.html")
                    .loginProcessingUrl("/doLogin")
                    .successHandler(successHandler())   // 自定义登录成功后重定向的 Handler
                    .failureUrl("/login.html")
                    .usernameParameter("uname")
                    .passwordParameter("passwd")
                    .permitAll()
                .and()
                .csrf().disable();
    }
    
    // 自定义登录成功重定向逻辑
    SavedRequestAwareAuthenticationSuccessHandler successHandler() {
        
        SavedRequestAwareAuthenticationSuccessHandler handler = new SavedRequestAwareAuthenticationSuccessHandler();
        
        // 设置默认重定向的地址
        handler.setDefaultTargetUrl("/index");
        
        // 设置目标地址的参数名
        handler.setTargetUrlParameter("target");
        
        return handler;
    }
}
```

然后修改一下之前 html 中的表单的 `action`：

```html
<form id="login-form" class="form" action="/doLogin?target=/hello" method="post">
```

这样用户登录成功后会就始终跳转到	/hello 接口了。



当我们通过 `successForwardUrl` 来设置登录成功后重定向的地址时，实际上对应的实现类就是 `ForwardAuthenticationSuccessHandler`，它的源码比较简单，就是一个服务端转发：

```java
public class ForwardAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

	private final String forwardUrl;

	/**
	 * @param forwardUrl
	 */
	public ForwardAuthenticationSuccessHandler(String forwardUrl) {
		Assert.isTrue(UrlUtils.isValidRedirectUrl(forwardUrl), () -> "'" + forwardUrl + "' is not a valid forward URL");
		this.forwardUrl = forwardUrl;
	}

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		request.getRequestDispatcher(this.forwardUrl).forward(request, response);
	}

}
```

其实就是调用 `getRequestDispatcher` 方法进行服务端转发。



### (3) 自定义登录成功处理逻辑

`AuthenticationSuccessHandler` 默认的三个实现类，无论是哪一个，都是用来处理页面跳转的。有时候页面跳转并不能满足我们的需求，特别是现在流行前后端分离开发，用户登录成功后就不需要页面跳转了，只需要给前端返回一个 JSON 数据即可，告诉前端登录成功还是登录失败，前端收到消息后自行处理。

像这样的需求，我们可以通过自定义 `AuthenticationSuccessHandler` 的实现类来完成：

```java
public class MyAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        
        // response.setContentType("application/json;charset=utf-8");
        // other way
        response.setContentType(MediaType.APPLICATION_JSON_UTF8_VALUE);
        
        Map<String, Object> resp = new HashMap<>();
        
        resp.put("status", 200);
        resp.put("msg", "登录成功!");

        ObjectMapper om = new ObjectMapper();
        String s = om.writeValueAsString(resp);
        
        response.getWriter().write(s);
    }
}
```

注意重写的方法不是接口中的 default 方法。

现在登录成功后就会给前端传一段 JSON 字符串，下面是 SecurityConfig 配置：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {

    http.authorizeRequests()
        .anyRequest().authenticated()
        .and()
        .formLogin()
        .loginPage("/login.html")
        .loginProcessingUrl("/doLogin")
        .successHandler(new MyAuthenticationSuccessHandler())   // 自定义登录成功后重定向的 Handler
        .failureUrl("/login.html")
        .usernameParameter("uname")
        .passwordParameter("passwd")
        .permitAll()
        .and()
        .csrf().disable();
}
```

重启项目，测试一下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211214101624.png)



## 3、登录失败

接下来看登录失败的处理逻辑，为了方便在前端展示登录失败的异常信息，我们在项目中引入 thymeleaf 依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

使用默认的配置即可，然后在 resources/template 目录下新建 myLogin.html

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <title>登录</title>
    <link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.0.2/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.0.2/js/bootstrap.min.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js"></script>

    <style>
        #login .container #login-row #login-column #login-box {
            margin-top: 20px;
            padding: 20px;
            border: 1px solid #9C9C9C;
            background-color: #EAEAEA;
        }
    </style>
</head>
<body>

<div id="login">
    <div class="container">
        <div id="login-row" class="row justify-content-center align-items-center">
            <div id="login-column" class="col-md-6">
                <div id="login-box" class="col-md-12">
                    <form id="login-form" class="form" action="/doLogin" method="post">
                        <h3 class="text-center text-info">登录</h3>
                        
                        <!-- 展示错误信息 -->
                        <div th:text="${SPRING_SECURITY_LAST_EXCEPTION}"></div>
                        
                        <div class="form-group">
                            <label for="username" class="text-info">用户名:</label> <br />
                            <input type="text" name="uname" id="username" class="form-control">
                        </div>

                        <div class="form-group">
                            <label for="password" class="text-info">密码:</label> <br />
                            <input type="text" name="passwd" id="password" class="form-control">
                        </div>
                        <br />
                        <div class="form-group">
                            <input type="submit" name="submit" class="btn btn-info btn-md" value="登录">
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

</body>
</html>
```

和之前的 login.html 差不多，只不过现在是模板页面，并且多了一个 div 展示错误信息。

myLogin.html 是动态页面，我们需要给它提供一个访问控制器：

```java
@Controller
public class LoginController {

    @RequestMapping("/myLogin.html")
    public String myLogin() {
        return "myLogin";
    }
}
```

修改 SecurityConfig：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {

    http.authorizeRequests()
        .anyRequest().authenticated()
        .and()
        .formLogin()
        .loginPage("/myLogin.html")
        .loginProcessingUrl("/doLogin")
        .defaultSuccessUrl("/index.html")
        //.failureUrl("/myLogin.html")
        .failureForwardUrl("/myLogin.html")
        .usernameParameter("uname")
        .passwordParameter("passwd")
        .permitAll()
        .and()
        .csrf().disable();
}
```

failureUrl 表示登录失败后重定向到 myLogin.html 页面。重定向是一种客户端跳转，重定向不方便携带请求失败的信息（只能放在 URL 里），如果希望能够在前端展示请求失败的信息，就需要使用 `failureForwardUrl()`，顾名思义，其实就是转发，这是一种服务端跳转。

重启项目，输入错误用户名、密码：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211214105221.png)

无论是 failureUrl 还是 failureForwardUrl，最终配置的都是 `AuthenticationFailureHandler` 接口的实现。Spring Security 中提供了 `AuthenticationFailureHandler` 接口，用来规范登录失败的实现：

```java
public interface AuthenticationFailureHandler {

	void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException exception) throws IOException, ServletException;

}
```

该接口只有一个 `onAuthenticationFailure()` 方法，用来处理登录失败请求，request 和 response 参数很好理解，最后的 exception 表示登录失败的异常信息。Spring Security 一共为它提供了 5 个实现类：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211214105727.png)



(1) `SimpleUrlAuthenticationFailureHandler` 默认的处理逻辑就是通过重定向跳转到登录页面，当然也可以通过配置 `forwardToDestination` 属性将重定向改为服务器端跳转（转发），`failureUrl()` 方法的底层实现逻辑就是 SimpleUrlAuthenticationFailureHandler。

(2) `ExceptionMappingAuthenticationFailureHandler` 可以根据不同的异常类型，映射到不同的路径

(3) `ForwardAuthenticationFailureHandler` 表示通过服务器端跳转来重新回到登录页面，`failureForwardUrl()` 方法的底层实现逻辑就是它。

(4) `AuthenticationEntryPointFailureHandler` 是 Spring Security 5.2 新引进的处理类，可以通过 `AuthenticationEntryPoint` 来处理登录异常。

(5) `DelegatingAuthenticationFailureHandler` 可以实现为不同的异常类型配置不同的登录处理失败回调。

举个简单的例子，假如不使用 failureForwardUrl 方法，同时又想登录失败后通过转发回到登录页面，那么可以自定义 `SimpleUrlAuthenticationFailureHandler`  配置，只需要将 forwardToDestition 属性置为 true。



```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                    .loginPage("/myLogin.html")
                    .loginProcessingUrl("/doLogin")
                    .defaultSuccessUrl("/index.html")
                    .failureHandler(failureHandler())
                    .usernameParameter("uname")
                    .passwordParameter("passwd")
                    .permitAll()
                .and()
                .csrf().disable();
    }
    
    // 自定义配置
    SimpleUrlAuthenticationFailureHandler failureHandler() {

        SimpleUrlAuthenticationFailureHandler handler = new SimpleUrlAuthenticationFailureHandler("/myLogin.html");

        handler.setUseForward(true);

        return handler;
    }
}
```

这样配置之后，如果用户再次登录失败，就会通过转发的方式重新回到登录页面，一样可以展示异常信息，效果和 `failureForwardUrl` 一致。



### (1) SimpleUrlAuthenticationFailureHandler

```java
public class SimpleUrlAuthenticationFailureHandler implements AuthenticationFailureHandler {

	protected final Log logger = LogFactory.getLog(getClass());

	private String defaultFailureUrl;

	private boolean forwardToDestination = false;

	private boolean allowSessionCreation = true;

	private RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

	public SimpleUrlAuthenticationFailureHandler() {
	}

	public SimpleUrlAuthenticationFailureHandler(String defaultFailureUrl) {
		setDefaultFailureUrl(defaultFailureUrl);
	}

	@Override
	public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException exception) throws IOException, ServletException {
		if (this.defaultFailureUrl == null) {
			if (this.logger.isTraceEnabled()) {
				this.logger.trace("Sending 401 Unauthorized error since no failure URL is set");
			}
			else {
				this.logger.debug("Sending 401 Unauthorized error");
			}
			response.sendError(HttpStatus.UNAUTHORIZED.value(), HttpStatus.UNAUTHORIZED.getReasonPhrase());
			return;
		}
		saveException(request, exception);
		if (this.forwardToDestination) {
			this.logger.debug("Forwarding to " + this.defaultFailureUrl);
			request.getRequestDispatcher(this.defaultFailureUrl).forward(request, response);
		}
		else {
			this.redirectStrategy.sendRedirect(request, response, this.defaultFailureUrl);
		}
	}

	protected final void saveException(HttpServletRequest request, AuthenticationException exception) {
		if (this.forwardToDestination) {
			request.setAttribute(WebAttributes.AUTHENTICATION_EXCEPTION, exception);
			return;
		}
		HttpSession session = request.getSession(false);
		if (session != null || this.allowSessionCreation) {
			request.getSession().setAttribute(WebAttributes.AUTHENTICATION_EXCEPTION, exception);
		}
	}
	public void setDefaultFailureUrl(String defaultFailureUrl) {
		Assert.isTrue(UrlUtils.isValidRedirectUrl(defaultFailureUrl),
				() -> "'" + defaultFailureUrl + "' is not a valid redirect URL");
		this.defaultFailureUrl = defaultFailureUrl;
	}

	protected boolean isUseForward() {
		return this.forwardToDestination;
	}

	/**
	 * If set to <tt>true</tt>, performs a forward to the failure destination URL instead
	 * of a redirect. Defaults to <tt>false</tt>.
	 */
	public void setUseForward(boolean forwardToDestination) {
		this.forwardToDestination = forwardToDestination;
	}

	/**
	 * Allows overriding of the behaviour when redirecting to a target URL.
	 */
	public void setRedirectStrategy(RedirectStrategy redirectStrategy) {
		this.redirectStrategy = redirectStrategy;
	}

	protected RedirectStrategy getRedirectStrategy() {
		return this.redirectStrategy;
	}

	protected boolean isAllowSessionCreation() {
		return this.allowSessionCreation;
	}

	public void setAllowSessionCreation(boolean allowSessionCreation) {
		this.allowSessionCreation = allowSessionCreation;
	}

}
```

可以看出，当用户构造 `SimpleUrlAuthenticationFailureHandler` 对象的时候，就传入了 `defaultFaliureUrl`，也就是登录失败时要跳转的地址。

在 `onAuthenticationFailure` 方法中，如果发现 `defaultFaliureUrl` 为 null，就直接通过 response 返回异常信息，否则调用 `saveException` 方法。

在 `saveException` 方法中，如果 `forwardToDestination` 属性设置为 true，表示通过转发跳转回登录页面，此时就把异常信息放到 request 中。再回到 `onAuthenticationFailure`  方法中，再次判断 `forwardToDestination` 是否为 true，是就通过服务器端跳转到登录页面，否就通过重定向回到登录页面。

### (2) 自定义 AuthenticationFailureHandler

如果是前后端分离，自然是不会这样做了，只需要返回 JSON 字符串就可以了，此时可以通过自定义 `AuthenticationFailureHandler` 实现自己的处理逻辑：

```java
public class MyAuthenticationFailureHandler implements AuthenticationFailureHandler {
    
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        
        response.setContentType("application/json;charset=utf-8");
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", 500);
        resp.put("msg", "登录失败! " + exception.getMessage());

        ObjectMapper om = new ObjectMapper();
        String s = om.writeValueAsString(resp);
        
        response.getWriter().write(s);
    }
}
```



修改配置：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {

    http.authorizeRequests()
        .anyRequest().authenticated()
        .and()
        .formLogin()
        .loginPage("/myLogin.html")
        .loginProcessingUrl("/doLogin")
        .defaultSuccessUrl("/index.html")
        .failureHandler(new MyAuthenticationFailureHandler())
        .usernameParameter("uname")
        .passwordParameter("passwd")
        .permitAll()
        .and()
        .csrf().disable();
}
```



重启项目测试：



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211214111959.png)



## 4、注销登录

Spring Security 提供了默认的注销页面，当然开发者也可以根据自己的需求对注销登录进行定制：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {

    http.authorizeRequests()
        .anyRequest().authenticated()
        .and()
        .formLogin()
            .loginPage("/myLogin.html")
            .loginProcessingUrl("/doLogin")
            .successHandler(new MyAuthenticationSuccessHandler())
            .failureHandler(new MyAuthenticationFailureHandler())
            .usernameParameter("uname")
            .passwordParameter("passwd")
            .permitAll()
        .and()
            .logout()
            .logoutUrl("/logout")
            .invalidateHttpSession(true)
        	.clearAuthentication(true)
            .logoutSuccessUrl("/myLogin.html")
        .and()
        .csrf().disable();
}
```



- 通过 `.logout()` 方法开启注销登录设置
- `logoutUrl` 指定了注销登录请求地址，默认是 GET 请求，路径为 /logout
- `invalidateHttpSession` 表示是否使 Session 失效，默认为 true
- `clearAuthentication` 表示是否清除认证信息，默认为 true
- `logoutSuccessUrl` 表示注销登录后的跳转地址

重启项目，登录后访问 `http://localhost:8080/logout` 就可以发起注销请求，注销成功后，会自动跳转到 myLogin 页面。



如果项目有需要，开发者还可以配置多个注销登录的请求，同时还可以指定请求的方法：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {

    http.authorizeRequests()
        .anyRequest().authenticated()
        .and()
        .formLogin()
            .loginPage("/myLogin.html")
            .loginProcessingUrl("/doLogin")
            .successHandler(new MyAuthenticationSuccessHandler())
            .failureHandler(new MyAuthenticationFailureHandler())
            .usernameParameter("uname")
            .passwordParameter("passwd")
            .permitAll()
        .and()
        .logout()
            .logoutRequestMatcher(new OrRequestMatcher(
                new AntPathRequestMatcher("/logout1", "GET"),
                new AntPathRequestMatcher("/logout2", "POST")
            ))
            .invalidateHttpSession(true)
            .clearAuthentication(true)
            .logoutSuccessUrl("/myLogin.html")
        .and()
        .csrf().disable();
}
```



如果项目是前后端分离的架构，注销登录就不需要跳转页面了，只需要返回 JSON 数据就可以了，我们可以将注销成功的信息返回给前端即可，此时可以自定义注销处理器：

默认的处理器是接口  `LogoutSuccessHandler` 的具体实现

```java
public interface LogoutSuccessHandler {

	void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
			throws IOException, ServletException;

}
```

这里我们为了方便，直接使用 lambda 表达式：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {

    http.authorizeRequests()
        .anyRequest().authenticated()
        .and()
        .formLogin()
            .loginPage("/myLogin.html")
            .loginProcessingUrl("/doLogin")
            .successHandler(new MyAuthenticationSuccessHandler())
            .failureHandler(new MyAuthenticationFailureHandler())
            .usernameParameter("uname")
            .passwordParameter("passwd")
            .permitAll()
        .and()
        .logout()
            .logoutRequestMatcher(new OrRequestMatcher(
                new AntPathRequestMatcher("/logout1", "GET"),
                new AntPathRequestMatcher("/logout2", "POST")
            ))
            .invalidateHttpSession(true)
            .clearAuthentication(true)
            .logoutSuccessHandler((req, resp, auth) -> {

                resp.setContentType("application/json;charset=utf-8");

                Map<String, Object> result = new HashMap<>();
                result.put("status", 200);
                result.put("msg", "注销成功!");
                ObjectMapper om = new ObjectMapper();
                String s = om.writeValueAsString(result);

                resp.getWriter().write(s);
            })
        .and()
        .csrf().disable();
}
```



当然如果开发者希望为不同的注销地址返回不同的结果，也是可以的：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {

    http.authorizeRequests()
        .anyRequest().authenticated()
        .and()
            .formLogin()
            .loginPage("/myLogin.html")
            .loginProcessingUrl("/doLogin")
            .successHandler(new MyAuthenticationSuccessHandler())
            .failureHandler(new MyAuthenticationFailureHandler())
            .usernameParameter("uname")
            .passwordParameter("passwd")
            .permitAll()
        .and()
        .logout()
            .logoutRequestMatcher(new OrRequestMatcher(
                new AntPathRequestMatcher("/logout1", "GET"),
                new AntPathRequestMatcher("/logout2", "POST")
            ))
            .invalidateHttpSession(true)
            .clearAuthentication(true)
            .defaultLogoutSuccessHandlerFor((request, response, authentication) -> {

                response.setContentType("application/json;charset=utf-8");
                Map<String, Object> result = new HashMap<>();
                result.put("status", 200);
                result.put("msg", "使用 logout1 注销成功!");
                ObjectMapper om = new ObjectMapper();
                String s = om.writeValueAsString(result);

                response.getWriter().write(s);
            }, new AntPathRequestMatcher("/logout1", "GET"))
            .defaultLogoutSuccessHandlerFor((request, response, authentication) -> {

                response.setContentType("application/json;charset=utf-8");
                Map<String, Object> result = new HashMap<>();
                result.put("status", 200);
                result.put("msg", "使用 logout2 注销成功!");
                ObjectMapper om = new ObjectMapper();
                String s = om.writeValueAsString(result);

                response.getWriter().write(s);
            }, new AntPathRequestMatcher("/logout2", "POST"))
        .and()
        .csrf().disable();
}
```

通过 `defaultLogoutSuccessHandlerFor` 方法可以注册多个不同的注销成功回调函数，该方法第一个参数是注销成功回调，第二个参数则是具体的注销请求。当用户注销成功后，使用了哪个注销请求，就给出对应的响应信息。