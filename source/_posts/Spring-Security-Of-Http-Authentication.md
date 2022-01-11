---
title: Spring Security Of Http Authentication
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211208174450.jpg'
coverImg: /img/20211208174450.jpg
cover: false
toc: true
mathjax: false
date: 2022-01-11 18:04:25
summary: "Spring Security HTTP 认证"
categories: "Spring Security"
keywords: "Spring Security"
tags: "Spring Security"
---



# HTTP 认证

HTTP 提供了一个用于权限控制和认证的通用方式，这种认证方式通过 HTTP 请求头来提供认证信息，而不是通过表单登录。最常用的应该是 `HTTP Basic authentiation`，另外还有一种相对更安全的 `HTTP Digest authentication`。

Spring Security 中对这两种认证方式都提供了相应的支持：

- HTTP Basic authentication
- HTTP Digest authentication



# HTTP Basic authentication

## 1、简介

HTTP Basic authentication 中文译作 HTTP 基本认证，在这种认证方式中，将用户的登录用户名/密码经过 Base64 编码之后，放在请求头的 Authorization 字段中，从而完成用户身份的认证。

这是一种在 RFC7235（https://tools.ietf.org/html/rfc7235）规范中定义的认证方式，当客户端发起一个请求之后，服务端可以针对该请求返回一个质询信息，然后客户端再提供用户的凭证信息。具体的质询与应答流程如图所示：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220111182350.png)

从图中可以看到，HTTP 基本认证的流程是下面这样的。

首先客户端（浏览器）发送请求，类似下面这样：

```
GET /hello HTTP/1.1
Host: localhost:8080
```

服务端收到请求后，发现用户还没有认证，于是给出如下响应：

```
HTTP/1.1 401
WWW-Authenticate: Basic realm="Realm"
```

状态码 401 表示用户未认证，WWW-Authenticate 响应头则定义了使用何种验证方式去完成身份认证。最简单、最常见的就是我们使用的 HTTP 基本认证（Basic），除了这种认证方式之外，还有 Bearer（OAuth2.0 认证）、Digest（HTTP 摘要认证）等取值。

客户端收到服务端的响应之后，将用户名/密码使用 Base64 编码之后，放在请求头中，再次发起请求：

```
GET /hello HTTP/1.1
Host: localhost:8080
Authorization: Basic amF2YWJveToxMjM=
```

服务端解析 Authorization 字段，完成用户身份的校验，最后将资源返回给客户端：

```
HTTP/1.1 200
Content-Type: test/html;charset=UTF-8
Content-Length: 16
```

这就是整个 HTTP 基本认证流程。

可以看到，这种认证方式实际上非常简单，基本上所有的浏览器都支持这种认证方式。

但是我们在实际应用中，似乎很少见到这种认证方式，主要还是因为安全问题。

HTTP 基本认证没有对传输的凭证信息进行加密，仅仅只是进行了 Base64 编码，这就造成了很大的安全隐患，所以如果用到了 HTTP 基本认证，一般都是结合 HTTPS 一起使用；同时，一旦使用 HTTP 基本认证成功后，除非用户关闭浏览器或者清空浏览器缓存，否则没有办法退出登录。

## 2、具体用法

Spring Security 中开启 HTTP 基本认证非常容易，配置如下：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                .anyRequest().authenticated()
                .and()
                .httpBasic()
                .and()
                .csrf().disable();
    }
}
```

通过 `httpBaisc()` 方法即可开启 HTTP 基本认证。配置完成后，启动项目，此时如果需要访问一个受保护的资源，浏览器就会自动弹出认证框：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220111193540.png)

输入用户名/密码完成认证之后，就可以访问受保护的资源了。



## 3、源码分析

实现整体上分为两部分：

（1）对未认证的请求发出质询；

（2）解析携带了认证信息的请求。



### (1) 质询

`httpBasic()` 方法开启了 HTTP 基本认证的配置，具体的配置通过 `HttpBasicConfigurer` 类来完成。

在 `HttpBasicConfigurer` 配置类的 init 方法中调用了 `registerDefaultEntryPoint` 方法，该方法完成了失败请求处理类 `AuthenticationEntryPoint` 的配置，代码如下：

```java
public final class HttpBasicConfigurer<B extends HttpSecurityBuilder<B>>
		extends AbstractHttpConfigurer<HttpBasicConfigurer<B>, B> {
    
    private void registerDefaultEntryPoint(B http, RequestMatcher preferredMatcher) {
		ExceptionHandlingConfigurer<B> exceptionHandling = http.getConfigurer(ExceptionHandlingConfigurer.class);
		if (exceptionHandling == null) {
			return;
		}
		exceptionHandling.defaultAuthenticationEntryPointFor(postProcess(this.authenticationEntryPoint),
				preferredMatcher);
	}
    
}
```

可以看到，这里调用了 `exceptionHandling` 对象的方法进行配置，该对象的最终目的是配置异常过滤器 `ExceptionTranslationFilter`，之前分析过这个过滤器。

这里配置到 `exceptionHandling` 中的 `authenticationEntryPoint` 是一个代理对象，该代理对象是在 `HttpBasicConfigurer` 构造方法中创建的，具体代理的就是 `BasicAuthenticationEntryPoint`。

简而言之，如果一个请求没有携带认证信息，最终将被 `BasicAuthenticationEntryPoint` 的实例处理，看一下该类的实现：

```java
public class BasicAuthenticationEntryPoint implements AuthenticationEntryPoint, InitializingBean {

	// ……
    
	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException {
		response.addHeader("WWW-Authenticate", "Basic realm=\"" + this.realmName + "\"");
		response.sendError(HttpStatus.UNAUTHORIZED.value(), HttpStatus.UNAUTHORIZED.getReasonPhrase());
	}

	// ……
}
```

可以看到，这个类的处理逻辑还是很简单的，响应头中添加 `WWW-Authenticate` 字段，然后发送错误响应，响应码为 401。

这是发除质询的代码。总结一下，就是一个未经认证的请求，在经过 Spring Security 过滤器链时会抛出异常，该异常会在 `ExceptionTranslationFilter` 过滤器中调用 `BasicAuthenticationEntryPoint#commence` 方法进行处理。

### (2) 请求解析

`HttpBasicConfigurer` 类的 configure 方法中，向 Spring Security 过滤器链中添加了一个过滤器 `BasicAuthenticationFilter`，该过滤器专门用来处理 HTTP 基本认证相关的事情，看一下它的核心方法 doFilterInternal 方法：

```java
public class BasicAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		try {
			UsernamePasswordAuthenticationToken authRequest = this.authenticationConverter.convert(request);
			if (authRequest == null) {
				chain.doFilter(request, response);
				return;
			}
			String username = authRequest.getName();
			if (authenticationIsRequired(username)) {
				Authentication authResult = this.authenticationManager.authenticate(authRequest);
				SecurityContext context = SecurityContextHolder.createEmptyContext();
				context.setAuthentication(authResult);
				SecurityContextHolder.setContext(context);
				this.rememberMeServices.loginSuccess(request, response, authResult);
				onSuccessfulAuthentication(request, response, authResult);
			}
		}
		catch (AuthenticationException ex) {
			SecurityContextHolder.clearContext();
			this.rememberMeServices.loginFail(request, response);
			onUnsuccessfulAuthentication(request, response, ex);
			if (this.ignoreFailure) {
				chain.doFilter(request, response);
			}
			else {
				this.authenticationEntryPoint.commence(request, response, ex);
			}
			return;
		}

		chain.doFilter(request, response);
	}
}
```

该方法执行流程如下：

（1）首先调用 `this.authenticationConverter.convert` 方法，对请求头中的 Authorization 字段进行解析，经过 Base64 解码后的用户名/密码是一个用 ":" 隔开的字符串，例如用户使用 `naivekyo/123456` 进行登录，那么经过 Base64 解码后的结果就是 `naivekyo:123456`，然后根据拿到的用户名/密码，构造一个 `UsernamePasswordAuthenticationToken` 对象出来；

（2）如果 authRequest 变量为 null，说明请求头中并没有包含认证信息，那么直接执行接下来的过滤器即可，该方法也到此为止。在执行接下来的过滤器时，最终就会通过 `ExceptionTranslationFilter` 过滤器进入到 `BasicAuthenticationEntryPoint#commence` 方法中；如果 authRequest 变量不为 null，说明请求是携带了认证信息的，那么就对请求携带的认证信息进行校验；

（3）从 authRequest 对象中提取出用户名，然后调用 `authenticationIsRequired` 方法判断是否有必要进行认证，如果没有必要，则直接执行剩下的过滤器即可；如果有必要进行认证，则进行用户认证。`authenticationIsRequired` 方法的具体逻辑就是：从 `SecurityContextHolder` 中取出当前登录对象，判断是否已经登录过了，同时判断是否是当前用户；

（4）如果有必要进行认证，则调用 `this.authenticationManager.authenticate` 方法完成用户认证，同时将用户信息存入 `SecurityContextHolder`；如果配置了 `rememberMeServices`，也进行相应的处理，最后还有一个登录成功的回调方法 `onSuccessfulAuthentication`，不过该方法并未做任何实现；

（5）如果认证过程抛出异常，则进行相应处理即可，这里逻辑比较简单；

（6）最后继续执行接下来的过滤器。在后续过滤器执行过程中，由于 `SecurityContextHolder` 中已经保存了登录用户信息了，相当于用户已经完成登录了，因此就和普通的请求一致，不会被 "半路拦截"。

这就是 HTTP 基本认证的实现逻辑，可以看到实现还是比较简单的。



# HTTP Digest authentication

HTTP 基本认证虽然简单易用，但是在安全方面问题突出，于是又推出了 HTTP 摘要认证。

HTTP 摘要认证最早在 RFC2069 中被定义，随后又被 RFC2617（https://tools.ietf.org/html/rfc2617）所取代，在 RFC2617 中引入了一系列增强安全性的参数，以防止各种可能出现的网络攻击。

相比于 HTTP 基本认证，HTTP 摘要认证的安全性有了很大提高，但是依然存在问题，例如不支持 bCrypt、PBKDF2、sCrypt 等加密方式。

下图描述了 HTTP 摘要认证的具体流程，从图中可以看出，这个认证流程和 HTTP 基本认证流程一致，不同的是每次传递的参数有所差异：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220111200443.png)



## 1、具体用法

Spring Security 中为 HTTP 摘要认证提供了相应的 `AuthenticationEntryPoint` 和 Filter，但是没有自动化配置，需要我们手动配置，配置方式如下：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {


    @Override
    @Bean
    public UserDetailsService userDetailsServiceBean() throws Exception {

        InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
        manager.createUser(User.withUsername("naivekyo").password("123456").roles("admin").build());
        
        return manager;
    }
    
    @Bean
    PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                .anyRequest().authenticated()
                .and()
                .csrf().disable()
                .exceptionHandling()
                .authenticationEntryPoint(this.digestAuthenticationEntryPoint())
                .and()
                .addFilter(this.digestAuthenticationFilter());
    }
    
    DigestAuthenticationEntryPoint digestAuthenticationEntryPoint() {

        DigestAuthenticationEntryPoint entryPoint = new DigestAuthenticationEntryPoint();
        
        entryPoint.setNonceValiditySeconds(3600);
        entryPoint.setRealmName("myrealm");
        entryPoint.setKey("naivekyo");
        
        return entryPoint;
    }
    
    DigestAuthenticationFilter digestAuthenticationFilter() throws Exception {

        DigestAuthenticationFilter filter = new DigestAuthenticationFilter();
        
        filter.setAuthenticationEntryPoint(this.digestAuthenticationEntryPoint());
        filter.setUserDetailsService(this.userDetailsServiceBean());
        
        return filter;
    }
}
```

（1）首先配置了一个 `UserDetailsService` 实例；

（2）然后配置一个 `PasswordEncoder` 实例；

（3）开发者提供一个 `DigestAuthenticationEntryPoint` 实例（相当于 HTTP 基本认证中的 `BasicAuthenticationEntryPoint`），当用户发起一个没有经过认证的请求时，由该实例进行处理，配置该实例时，我们需要提供一个随机数的有效期，`RealmName` 以及一个 `Key`；

（4）创建一个 `DigestAuthenticationFilter` 实例，并添加到 Spring Security 过滤器链中，`DigestAuthenticationFilter` 的作用类似于 HTTP 基本认证中的 `BasicAuthenticationFilter` 过滤器的作用。

需要注意的是，由于客户端是对明文密码进行 Hash 运算，所以服务端也需要保存用户的明文密码，因此这里提供的 `PasswordEncoder` 实例是 `NoOpPasswordEncoder` 的实例。

在 `DigestAuthenticationFilter` 过滤器中有一个 `passwordAlreadyEncoded` 属性，表示用户密码是否已经编码，该属性默认为 false，表示密码未经过编码。开发者可以对密码进行编码，只需要先将这个属性设置为 true，然后将 `username + ":" + realm + ":" + password` 使用 MD5 算法计算其信息摘要，将计算结果作为用户密码即可，例如用户名是 naivekyo，realm 是 myrealm，用户密码是 123456，则计算其信息摘要代码如下：

```java
String rawPassword = "naivekyo:myrealm:123456";
MessageDigest digest = MessageDigest.getInstance("MD5");
String s = new String(Hex.encode(digest.digest(rawPassword.getBytes*())));
System.out.println(s);
```

然后修改配置类：

```java
DigestAuthenticationFilter digestAuthenticationFilter() throws Exception {

    DigestAuthenticationFilter filter = new DigestAuthenticationFilter();

    filter.setAuthenticationEntryPoint(this.digestAuthenticationEntryPoint());
    filter.setUserDetailsService(this.userDetailsServiceBean());
    filter.setPasswordAlreadyEncoded(true);

    return filter;
}

@Override
@Bean
public UserDetailsService userDetailsServiceBean() throws Exception {

    InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
    manager.createUser(User.withUsername("naivekyo").password("ejogyh3241978jagghjio12975joagg").roles("admin").build());

    return manager;
}
```

通过 `DigestAuthenticationFilter` 的 `setPasswordAlreadyEncoded` 方法将 passwordAlreadyEncoded 属性设置为 true，然后设置用户密码为编码后的密码即可。

注意，这样配置完成后，`PasswordEncoder` 的实例依然是 `NoOpPasswordEncoder`。

配置完成后，启动项目，访问页面时，浏览器就会弹出输入框要求输入用户名/密码，具体流程和 HTTP 基本认证一致。



## 2、源码分析

接下来对 HTTP 摘要认证的源码进行简单分析，从质询客户端处理以及请求解析三个方面入手。

需要说明的是，Spring Security 源码中关于 HTTP 摘要认证并未严格遵守 RFC2617，下面的分析以 Spring Security 为准。

### (1) 质询

HTTP 摘要认证的质询是由 `DigestAuthenticationEntryPoint#commence` 方法负责处理的，源码如下：

```java
public class DigestAuthenticationEntryPoint implements AuthenticationEntryPoint, InitializingBean, Ordered {
    
    @Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException {
		// compute a nonce (do not use remote IP address due to proxy farms) format of
		// nonce is: base64(expirationTime + ":" + md5Hex(expirationTime + ":" + key))
		long expiryTime = System.currentTimeMillis() + (this.nonceValiditySeconds * 1000);
		String signatureValue = DigestAuthUtils.md5Hex(expiryTime + ":" + this.key);
		String nonceValue = expiryTime + ":" + signatureValue;
		String nonceValueBase64 = new String(Base64.getEncoder().encode(nonceValue.getBytes()));
		// qop is quality of protection, as defined by RFC 2617. We do not use opaque due
		// to IE violation of RFC 2617 in not representing opaque on subsequent requests
		// in same session.
		String authenticateHeader = "Digest realm=\"" + this.realmName + "\", " + "qop=\"auth\", nonce=\""
				+ nonceValueBase64 + "\"";
		if (authException instanceof NonceExpiredException) {
			authenticateHeader = authenticateHeader + ", stale=\"true\"";
		}
		logger.debug(LogMessage.format("WWW-Authenticate header sent to user agent: %s", authenticateHeader));
		response.addHeader("WWW-Authenticate", authenticateHeader);
		response.sendError(HttpStatus.UNAUTHORIZED.value(), HttpStatus.UNAUTHORIZED.getReasonPhrase());
	}
}
```

和 HTTP 基本认证一样，这里的响应码也是 401，响应头中也包含 WWW-Authentication 字段，不同的是 WWW-Authentication 字段的值有所区别：

- `Digest`：表示这里使用的是 HTTP 摘要认证；
- `Realm`：服务端返回的标识访问资源的安全域；
- `qop`：服务端返回的保护级别，客户端据此选择合适的摘要算法，如果值为 auth，则表示只进行身份认证；如果取值为 auth-int，则除了身份认证外，还要校验内容完整性；
- `nonce`：服务端生成的一个随机字符串，在客户端生成摘要信息时会用到该随机字符串；
- `stale`：一个标记，当随机字符串 nonce 过期时，会包含该标记。`stale=true` 表示客户端不必再次弹出输入框，只需要带上已有的认证信息，重新发起认证请求即可。

随机字符串 nonce 的生成过程是，先对过期时间和 Key 组成的字符串 `expiryTime + ":" + key` 计算出消息摘要 `signatureValue`，然后再对 `expiryTime + ":" + signatureValue` 进行 Base64 编码，进而获取 nonce。

经过上面的分析，我们可以得出，响应头内容如下：

```
HTTP/1.1 401
WWW-Authenticate: Digest realm="myrealm", qop="auth",
nonce="MTU5OTIyNDE4NDg1NDowZGGIzOWU0NGM2MTA4Z=="
```

### (2) 客户端处理

当客户端（浏览器）收到质询请求的后，会弹出输入框，用户输入用户名/密码，然后客户端会对用户名/密码进行 Hash 运算。根据响应头中 qop 值的不同，运算过程略有差异。

如果服务端响应头不包含 qop 参数，则运算过程如下：

- 对 `username + ":" + realm + ":" + password` 计算其消息摘要得到 digest1；
- 对 `HttpMethod + ":" + uri` 计算其消息摘要得到 digest2；
- 对 `digest1 + ":" + nonce + ":" + diges2` 计算其消息摘要得到 response

如果服务端响应头中 `qop="auth"`，则前两步计算步骤一致，第三步不同，第三步计算方式如下：

对 `digest1 + ":" + nonce + ":" + nc + ":" + cnonce + ":" + qop + ":" + digest2` 计算其消息摘要，得到 response。

这里几个参数含义如下：

- `nonce` 和 `qop`：就是服务端返回的数据；
- `nc`：表示请求次数，该参数在防止重放攻击时有用；
- `cnonce`：表示客户端生成的随机数。

这里计算出来的 response 就是客户端提交给服务端的重要认证信息，服务端主要据此判断用户身份是否合法。

最终客户端提交的请求头如下：

```
GET /hello HTTP/1.1
Host: localhost:8080
Authorization: Digest username="naivekyo" realm="myrealm",
nonce="MTU5OTIyNDE4NDg1NDowZGGIzOWU0NGM2MTA4Z==",
uri="/hello", response="f14cbc00cc4127852279eihgiaojo12", qop=auth,
nc=00000002, cnonce="124u89aghk19075289"
```

用户名放在请求头中，用户密码经过各种 MD5 运算之后，现在包含在 response 中，生成 response 时所需要的 cnonce、nonce、nc、qop、realm 以及 uri 也都包含在请求头中一并发送给服务端，服务端拿到这些参数之后，在根据用户名去数据库中查询到用户密码，然后进行 MD5 运算，将运算结果和 response 进行比对，就知道请求是否合法。

> 重放攻击

重放攻击（Replay attack）也成为回放攻击，这是一种通过重复或者延迟有效数据的网络攻击形式，是一种低级别的 "中间人攻击"。举个简单例子，当用户和服务端进行数据交互时，为了向服务端证明身份，传递了一个经过 MD5 运算的字符串，该字符串被黑客窃取到。黑客就可以通过该字符串冒充受害者。

### (3) 请求解析

请求解析主要是在 `DigestAuthenticationFilter` 过滤器中完成的，看一下其 doFilter 方法：

```java
public class DigestAuthenticationFilter extends GenericFilterBean implements MessageSourceAware {
    
    @Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
	}

	private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		String header = request.getHeader("Authorization");
		if (header == null || !header.startsWith("Digest ")) {
			chain.doFilter(request, response);
			return;
		}
		
		DigestData digestAuth = new DigestData(header);
		try {
			digestAuth.validateAndDecode(this.authenticationEntryPoint.getKey(),
					this.authenticationEntryPoint.getRealmName());
		}
		catch (BadCredentialsException ex) {
			fail(request, response, ex);
			return;
		}
		
		boolean cacheWasUsed = true;
		UserDetails user = this.userCache.getUserFromCache(digestAuth.getUsername());
		String serverDigestMd5;
		try {
			if (user == null) {
				cacheWasUsed = false;
				user = this.userDetailsService.loadUserByUsername(digestAuth.getUsername());
				if (user == null) {
					throw new AuthenticationServiceException(
							"AuthenticationDao returned null, which is an interface contract violation");
				}
				this.userCache.putUserInCache(user);
			}
			serverDigestMd5 = digestAuth.calculateServerDigest(user.getPassword(), request.getMethod());
			// If digest is incorrect, try refreshing from backend and recomputing
			if (!serverDigestMd5.equals(digestAuth.getResponse()) && cacheWasUsed) {
			
				user = this.userDetailsService.loadUserByUsername(digestAuth.getUsername());
				this.userCache.putUserInCache(user);
				serverDigestMd5 = digestAuth.calculateServerDigest(user.getPassword(), request.getMethod());
			}
		}
		catch (UsernameNotFoundException ex) {
			String message = this.messages.getMessage("DigestAuthenticationFilter.usernameNotFound",
					new Object[] { digestAuth.getUsername() }, "Username {0} not found");
			fail(request, response, new BadCredentialsException(message));
			return;
		}
		// If digest is still incorrect, definitely reject authentication attempt
		if (!serverDigestMd5.equals(digestAuth.getResponse())) {
			
			String message = this.messages.getMessage("DigestAuthenticationFilter.incorrectResponse",
					"Incorrect response");
			fail(request, response, new BadCredentialsException(message));
			return;
		}
		// To get this far, the digest must have been valid
		// Check the nonce has not expired
		// We do this last so we can direct the user agent its nonce is stale
		// but the request was otherwise appearing to be valid
		if (digestAuth.isNonceExpired()) {
			String message = this.messages.getMessage("DigestAuthenticationFilter.nonceExpired",
					"Nonce has expired/timed out");
			fail(request, response, new NonceExpiredException(message));
			return;
		}
		
		Authentication authentication = createSuccessfulAuthentication(request, user);
		SecurityContext context = SecurityContextHolder.createEmptyContext();
		context.setAuthentication(authentication);
		SecurityContextHolder.setContext(context);
		chain.doFilter(request, response);
	}
}
```

doFilter 方法较长：

（1）首先从请求头中获取到 `Authorization` 字段，如果该字段不存在，或者该字段的值不是 `Digest` 开头，就直接直接剩下的过滤器。在执行剩下的过滤器的时候，最终会进入到质询环节；

（2）根据获取到的 `Authorization` 字段信息，构建出一个 `DigestData` 对象。这个过程就是将请求头中的 username、realm、nonce、uri、response、qop、nc、cnonce 等字段解析出来，设置给 `DigestData` 对象中相应的属性，方便后续处理；

（3）接下来调用 `validateAndDecode` 方法，对刚刚解析出的数据进行初步的验证。主要执行逻辑如下：

- 首先判断 username、realm、nonce、uri 以及 response 是否为 null，如果存在 null 的数据，则直接抛出异常；
- 判断 qop 的值是否为 auth，如果为 auth，则 nc 和 cnonce 都不能为 null，否则抛出异常；
- 检验请求传来的 realm 和 authenticationEntryPoint 中的 realm 是否相等，如果不相等，则直接抛出异常；
- 尝试对 nonce 进行 Base64 解码，如果解码失败，则抛出异常；
- 对 nonce 进行 Base64 解码，将解码的结果拆分为一个名为 nonceTokens 的数组，如果数组长度不为 2，则抛出异常；
- 取出 nonceTokens 数组中的第 0 项，就是 nonce 的过期时间，将其赋值给 nonceExpiryTime 属性；
- 根据 nonceExpiryTime  以及 authenticationEntryPoint 中的 key，进行 MD5 运算，并将运算结果和 nonceTokens 数组中的第 1 项进行比较，如果不相等，则抛出异常。
- 至此，完成了对请求参数的初步校验。

（4）根据请求传来的用户名去加载用户对象，先去缓存中加载，缓存中没有，则调用 `userDetailsService` 实例去加载（这也就是为什么在配置 `DigestAuthenticationFilter` 过滤器时，需要指定 `userDetailsService` 实例的原因）；

（5）接下来调用 `calculateServerDigest` 方法去计算服务端的摘要信息，该方法内部又调用了 `DigestAuthUtils.generateDigest` 方法。主要计算流程如下：

- 首先是 a1Md5 计算，如果设置了 passwordAlreadyEncoded ，则直接将用户密码赋值给 a1Md5，否则根据 username、realm 以及 password 计算出 a1Md5；
- a2Md5 计算方式是固定的，通过 httpMethod 以及请求 uri 计算出 a2Md5；
- 如果 qop 为 null，则 `digest=a1Md5 + ":"  + nonce + ":" + a2Md5`；如果 qop 的值为 auth，则 `digest=a1Md5+":"+nonce+":" +nc+":" +cnonce+":"+qop+":"+a2Md5`；
- 对 digest 进行 MD5 运算，并将计算结果返回。

（6）如果服务端基于缓存用户计算出来的摘要信息不等于请求传来的 response 字段的值，则重新从 `userDetailsService` 中加载用户信息，并重新完成第五步的运算；

（7）如果服务端计算出来的摘要信息不等于请求传来的 response 字段的值，则抛出异常；

（8）如果随机字符串 nonce 过期，则抛出异常；

（9）如果前面的步骤都没有抛出异常，则认证成功。将登录成功的用户信息存入 `SecurityContext` 中，同时继续执行下面的过滤器。存入 `SecurityContext` 中的 `Authentication` 实例里面的用户密码，就是从  `userDetailsService` 中查询出来的用户密码，在以后的过滤器中，如果还需要进行密码校验，由于 `SecurityContext` 的 `Authentication` 实例中用户密码和 `userDetailsService` 对象提供的用户密码一模一样，所以之前配置 `PasswordEncoder` 实例只能是 `NoOpPasswordEncoder`，否则就会校验失败。

这就是整个 HTTP 摘要认证的工作流程。

和 HTTP 基本认证相比，这里最大的亮点就是不明文传输用户密码，由客户端对密码进行 MD5 运算，并将运算所需的参数以及运算结果发送到服务端，服务端再去校验数据是否正确，这样可以避免密码泄露。

但是 HTTP 摘要也存在问题，例如，密码最多只能进行 MD5 运算后存储，或者就只能存储明文密码，无论哪种方式，都存在一定的隐患。同时，由于使用的复杂性，HTTP 摘要认证在实际项目中使用的并不多。