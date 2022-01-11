---
title: Spring Security Of CORS Treatment Scheme
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211208174324.jpg'
coverImg: /img/20211208174324.jpg
cover: false
toc: true
mathjax: false
date: 2022-01-10 09:42:26
summary: "CORS 处理方案"
categories: "Spring Security"
keywords: "Spring Security"
tags: "Spring Security"
---



# 什么是 CORS

CORS（Cross-Origin Resource Sharing）是由 W3C 制定的一种跨域资源共享技术标准，其目的就是为了解决前端的跨域请求。

在 JavaEE 开发中，最常见的前端跨域请求解决方案就是 JSONP，但是 JSONP 只支持 GET 请求，这是一个很大的缺陷，而 CORS 则支持多种 HTTP 请求方法，也是目前主流的跨域解决方案。

CORS 中新增了一组 HTTP 请求头字段，通过这些字段，服务器告诉浏览器，哪些网站通过浏览器有权限访问哪些资源，同时规定，对那些可能修改服务器数据的 HTTP 请求方法（如 GET 以外的 HTTP 请求等等），浏览器必须首先事宜 OPTIONS 方法发起一个预检请求（preflight request），预检请求的目的是查看服务端是否支持即将发起的跨域请求，如果服务端允许，才能发起实际的 HTTP 请求。在预检请求的返回中，服务器端也可以通知客户端，是否需要携带身份凭证（如 Cookies、HTTP 认证信息等等）。

以 GET 请求为例，如果需要发起一个跨域请求，则请求头如下：

```
Host: localhost:8080
Origin: http://localhost:8081
Referer: http://localhost:8081/index.html
……
```

如果服务端支持该跨域请求，那么返回的响应头中将包含如下字段：

```
Access-Control-Allow-Origin: http://localhost:8081
```

`Access-Control-Allow-Origin` 字段用来告诉浏览器可以访问该资源的域，当浏览器收到这样的响应头信息后，提取出 `Access-Control-Allow-Origin` 字段中的值，发现该值包含当前页面所在的域，就知道这个跨域是允许的，因此就不再队前端的跨域请求进行限制。

这属于简单请求，即不需要进行预检请求的跨域。

对于一些非简单请求，会首先发送一个预检请求。预检请求类似下面这样：

```
OPTIONS /put HTTP/1.1
Host: localhost:8080
Connection: keep-alive
Accept: */*
Access-Control-Request-Method: PUT
Origin: http://localhost:8081
Referer: http://localhost:8081/index.html
……
```

请求方法是 OPTIONS，请求头 Origin 字段告诉服务器当前页面所在的域，请求头 Access-Control-Request-Method 告诉服务端即将发起的跨域请求所使用的方法。服务端对比进行判断，如果允许即将发起的跨域请求，则会给出如下响应：

```
HTTP/1.1 200
Access-Control-Allow-Origin: http://localhost:8081
Access-Control-Allow-Meghotds: PUT
Access-Control-Max-Age: 3600
……
```

`Access-Control-Allow-Meghotds` 字段表示允许的跨域方法；

`Access-Control-Max-Age` 字段表示预检请求的有效期，单位为秒，在有效期内如果发起该跨域请求，则不用再次发起预检请求。

预检请求结束后，接下来就会发起一个真正的跨域请求，跨域请求和前面的 GET 请求步骤类似。

这是关于 CORS 的一个简单介绍。



# Spring 处理方案

## 1、@CrossOrigin

Spring 中的第一种处理跨域的方式就是通过 `@CrossOrigin` 注解来标记支持跨域，该注解可以添加在方法上，也可以添加在 Controller 上。当添加在 Controller 上时，表示 Controller 中所有接口都支持跨域，具体配置如下：

```java
@RestController
public class HelloController {
    
    @GetMapping("/hello")
    @CrossOrigin(origins = "http://localhost:8081")
    public String hello() {
        return "hello spring security!";
    }
}
```

`@CrossOrigin` 注解各个属性含义如下：

- `allowCredentials`：浏览器是否应当发送凭证信息，如 Cookie；
- `allowedHeaders`：请求被允许的请求头字段，* 表示所有字段；
- `exposedHeaders`：哪些响应头可以作为响应的一部分暴露出来。注意，这里只可以一一列举，通配符 * 在这里无效；
- `maxAge`：预检请求的有效期，有效期内不必再次发送预检请求，默认是 1800 秒；
- `methods`：允许的请求方法，* 表示允许所有方法；
- `origins`：允许的域，* 表示允许所有域。

该注解的实现原理属于 Spring 范畴，现在只简单梳理一下 `@CrossOrigin` 注解执行过程：

（1）`@CrossOrigin` 注解在 `AbstractHandlerMethodMappering` 的内部类 `MappingRegistry` 的 register 方法中完成解析的。`@CrosOrigin` 注解中的内容会被解析成一个配置对象：`CorsConfiguration`；

（2）将 `@CrossOrigin` 所标记的请求方法对象 `HandlerMethod` 和 `CorsConfiguration` 一一对应存入一个名为 `corsLookup` 的 Map 集合中；

（3）当请求到达 `DispatcherServlet#doDispatch` 方法之后，调用 `AbstractHandlerMapping#getHandler` 方法获取执行链 `HandlerExecutionChain` 时，会从 corsLookup 集合中获取到 `CorsConfiguration` 对象；

（4）根据获取到 `CorsConfiguration` 对象构建一个 `CrosInterceptor` 拦截器；

（5）在 `CrosInterceptor` 拦截器中触发对 `DefaultCorsProcessor#processRequest` 的调用，跨域请求的校验工作将在该方法中完成。



## 2、addCorsMappings

`@CrossOrigin` 注解需要添加在不同的 Controller 上，所以还有一种全局的配置方法，就是通过重写 `WebMvcConfigurerComposite#addCorsMappings` 方法实现，具体配置如下：

官方文档：https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.servlet.spring-mvc.cors

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        
        registry.addMapping("/**")
                .allowedMethods("*")
                .allowedOrigins("*")
                .allowedHeaders("*")
                .exposedHeaders("")
                .maxAge(3600);
    }
}
```

addMapping 表示要处理的请求地址，接下来的方法含义和 `@CrossOrigin` 注解中属性的含义都一一对应。

这种配置方式最终的处理方式和 `@CrossOrigin` 注解相同，都是在 `CorsInterceptor` 拦截器中触发对 `DefaultCorsProcessor#processRequest` 的调用，最终在该方法中完成对跨域请求的校验工作，不过源码的执行略有差异：

（1）`registry.addMapping("/**")` 方法配置了一个 `CorsRegistration` 对象，该对象中包含了一个路径拦截规则，拦截规则的值就是 `addMapping` 方法的参数，同时 `CorsRegistration` 中还包含了一个 `CorsConfiguration` 配置对象，该对象用来保存这里跨域相关的配置；

（2）在 `WebMvcConfigurationSupport#requestMappingHandlerMapping` 方法中出发了 `addCorsMappings` 方法执行，将获取到的 `CorsRegistration` 对象重新组装为一个 `UrlBasedCorsConfigurationSource` 对象，该对象中定义了一个 `corsConfigurations` 变量（`Map<String, CorsConfiguration>`），该变量中保存了拦截规则和 `CorsConfiguration` 对象的映射关系；

（3）将新建的 `UrlBasedCorsConfigurationSource` 对象赋值给 `AbstractHandlerMapping#corsConfigurationSource` 属性；

（4）当请求到达时的处理方法和 `@CrossOrigin` 注解处理流程的第三步一样，都是在 `AbstractHandlerMapping#getHandler` 方法中处理，不同的是，这里是从 `corsConfigurationSource` 中获取 `CorsConfiguration` 对象，而 `@CrossOrigin` 注解则从 `corsLookup` 集合中获取到 `CorsConfiguration` 配置对象。如果两处都可以获取到 `CorsConfiguration` 对象，则对获取到的对象属性值进行合并；

（5）根据获取到的 `CorsConfiguration` 对象构建一个 `CorsInterceptor` 拦截器；

（6）在 `CorsInterceptor` 拦截器中触发对 `DefaultCorsProcessor#processRequest` 的调用，跨域请求的校验工作将在该方法中完成。

这两种跨域配置方式殊途同归，最终目的都是配置了一个 `CorsConfiguration` 对象，并根据该对象创建 `CorsInterceptor` 拦截器，然后在该拦截器中触发 `DefaultCorsProcessor#processRequest` 方法的执行，完成跨域的校验。另外需要注意的是，这里的跨域校验是由 `DispatcherServlet` 中的方法触发的，而 `DispatcherServlet` 的执行是在 `Filter` 之后，这一点需要牢记，后面会用到。



## 3、CorsFilter

`CorsFilter` 是 Spring Web 中提供的一个处理跨域的过滤器，开发者也可以通过该过滤器处理跨域：

```java
@Configuration
public class WebMvcConfig {

    @Bean
    FilterRegistrationBean<CorsFilter> corsFilter() {

        FilterRegistrationBean<CorsFilter> registrationBean = new FilterRegistrationBean<>();

        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.setAllowedHeaders(Arrays.asList("*"));
        corsConfiguration.setAllowedMethods(Arrays.asList("*"));
        corsConfiguration.setAllowedOrigins(Arrays.asList("*"));
        corsConfiguration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        
        registrationBean.setFilter(new CorsFilter(source));
        registrationBean.setOrder(-1);
        
        return registrationBean;
    }
}
```

`CorsFilter` 的配置也比较简单：

- 由于是在 Spring Boot 项目中，这里通过 `FilterRegistrationBean` 来配置一个过滤器，这种配置方式既可以设置拦截规则，也可以为配置的过滤器设置优先级；
- 在这里依然离不开 `CorsConfiguration` 对象，不同的是我们手动创建该对象，并逐个设置跨域的各项处理规则；
- 我们还需要创建一个 `UrlBasedCorsConfigurationSource` 对象，将过滤器的拦截规则和 `CorsConfiguration` 对象之间的映射关系由 `UrlBasedCorsConfigurationSource` 中的 `corsConfigurations` 变量保存起来；
- 最后创建一个 `CorsFilter`，并为其配置一个优先级。

在 `CorsFilter` 过滤器的 `doFilterInternal` 方法中，触发对 `DefaultCorsProcessor#processRequest` 的调用，进而完成跨域请求的校验。

和前面两种方式不同的是，`CorsFilter` 是在过滤器中处理跨域的，而前面两种方案则是在 `DispatcherServlet` 中触发跨域处理，从处理时间上来说，`CorsFilter` 对于跨域的处理时机要早于前面两种。

这就是 Spring 中为我们提供的三种不同的跨域解决方案，三种方式都能解决跨域问题，选择其中任意一种即可。需要说明的是：

- `@CrossOrigin` 注解 + 重写 `addCorsMappings` 方法同时配置，这两种方式中关于跨域的配置会自动合并，跨域在 `CorsInterceptor` 中只处理了一次；
- `@CrossOrigin` 注解 + `CorsFilter` 同时配置，或者重写 `addCorsMappings`  方法 + `CorsFilter` 同时配置，都会导致跨域在 `CorsInterceptor` 和 `CorsFilter` 中各处理一次，降低程序允许效率，这种组合不可取。

> Spring MVC 项目

上面是在 Spring Boot 中可以使用 `FilterRegistrationBean` 配置过滤器，如果是在 Spring MVC 项目中，直接这样做就可以了：

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        config.addAllowedOrigin("*");
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setMaxAge(3628800L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource(new PathPatternParser());
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
```



# Spring Security 处理方案

## 1、问题发现

当我们为项目中添加了 Spring Security 依赖后，发现上面三种跨域方式有的失效了，有的则可以继续使用，这是为什么呢？

- 通过 `@CrossOrigin` 注解或者重写 `addCorsMappings` 方法配置跨域，统统失效了；
- 通过 `CorsFilter` 配置的跨域，有没有失效则要看过滤器的优先级：
  - 如果过滤器的优先级高于 Spring Security 过滤器，即先于 Spring Security 过滤器执行，则 `CorsFilter` 所配置的跨域处理依然有效；
  - 如果过滤器优先级低于 Spring Security 过滤器，则 `CorsFilter` 所配置的跨域处理失效。



为了理清楚这个问题，我们先简略了解一下 `Filter`、`DispatcherServlet` 以及 `Interceptor` 的执行顺序，如下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220110134735.png)

上图描述了请求从浏览器到达 Controller 的过程，Filter、Servlet 以及 Interceptor 的执行顺序一目了然。

理清楚了执行顺序，再来看看跨域请求过程。

由于非简单请求都需要发送一个预检请求（preflight request），而预检请求并不会携带认证信息，所以预检请求就有被 Spring Security 拦截的可能。如果通过 `@CrossOrigin` 注解或者重写 `addCorsMappings` 方法配置跨域，最终都是在 `CorsInterceptor` 中对跨域请求进行校验的。要进入 `CorsInterceptor` 拦截器，首先要经过 Spring Security 过滤器链，而在经过 Spring Security 过滤器链时，由于预检请求没有携带认证信息，就会被拦截下来。

如果使用了 `CorsFilter` 配置跨域，只要过滤器的优先级高于 Spring Security 过滤器，即在 Spring Security 过滤器之前执行了跨域请求校验，那么就不会有问题。

如果 `CorsFilter` 的优先级低于 Spring Security 过滤器，则预检请求一样需要先经过 Spring Security 过滤器，由于没有携带认证信息，在经过 Spring Security 过滤器时就会被拦截下来。

## 2、处理方法

### (1) 放行 OPTIONS 请求

在引入 Spring Security 后，如果还想继续通过 `@CrossOrigin` 注解或者重写 `addCorsMappings` 方法配置跨域，那么可以通过给 OPTIONS 请求单独放行，来解决预检请求被拦截的问题，具体配置如下：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                .antMatchers(HttpMethod.OPTIONS).permitAll()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .and()
                .csrf().disable();
        
    }
}

```

在 `configure(HttpSecurity http)` 方法中直接指定所有的 OPTIONS 请求直接通过。

这种方案既不安全，也不优雅，所以并不推荐在实际开发中使用，仅作了解。





### (2) 继续使用 CorsFilter

第二种方案则是使用 `CorsFilter` 来处理跨域，只需要将 `CorsFilter` 的优先级设置高于 Spring Security 过滤器优先级，配置如下：

```java
@Bean
FilterRegistrationBean<CorsFilter> corsFilter() {

    FilterRegistrationBean<CorsFilter> registrationBean = new FilterRegistrationBean<>();

    CorsConfiguration corsConfiguration = new CorsConfiguration();
    corsConfiguration.setAllowedHeaders(Arrays.asList("*"));
    corsConfiguration.setAllowedMethods(Arrays.asList("*"));
    corsConfiguration.setAllowedOrigins(Arrays.asList("http://localhost:8081"));
    corsConfiguration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", corsConfiguration);

    registrationBean.setFilter(new CorsFilter(source));
    // 设置最高优先级
    registrationBean.setOrder(Ordered.HIGHEST_PRECEDENCE);

    return registrationBean;
}
```

过滤器的优先级，数字越小，优先级越高，这里我们配置 `CorsFilter` 的优先级为最高。

当然这里也可以不设置最高优先级，我们只需要事先知道 Spring Security 的 `FilterChainProxy` 过滤器的优先级，然后将 `CorsFilter` 的优先级设置的比它高就可以了。

Spring Security 中关于 `FilterChainProxy` 优先级的配置在 `SecurityFilterAutoConfiguration` 类中，部分源码如下：

```java
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
```

可以看到，过滤器的优先级是从 `SecurityProperties` 对象中读取的，该对象中默认的过滤器的优先级是 `-100`，即开发者配置的 `CorsFilter` 过滤器优先级只需要小于 -100 即可（开发者也可以在 application.properties 文件中，通过 `spring.security.filter.order` 配置去修改 `FilterChainProxy` 过滤器的默认优先级）。



## 3、专业解决方案

### (1) 具体配置

Spring Security 中也提供了更加专业的方式去解决预检请求所面临的问题，具体配置如下：



```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .and()
                .cors()
                .configurationSource(this.corsConfigurationSource())
                .and()
                .csrf().disable();
    }
    
    CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration corsConfiguration = new CorsConfiguration();
        
        corsConfiguration.setAllowedHeaders(Arrays.asList("*"));
        corsConfiguration.setAllowedMethods(Arrays.asList("*"));
        corsConfiguration.setAllowedOrigins(Arrays.asList("*"));
        corsConfiguration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        
        return source;
    }
}
```

首先需要提供一个 `CorsConfigurationSource` 实例，将跨域的各项配置都填充进去，然后在 `configure(HttpSecurity http)` 方法中，通过 `cors()` 开启跨域配置，并将一开始配置好的 `CorsConfigurationSource` 实例设置进去。这样我们就完成了 Spring Security 中的跨域配置。



### (2) 原理分析

`cors()` 方法开启了对 `CorsConfigurer` 的配置，对 `CorsConfigurer` 而言最重要的就是 `configure` 方法：

```java
public class CorsConfigurer<H extends HttpSecurityBuilder<H>> extends AbstractHttpConfigurer<CorsConfigurer<H>, H> {
    
    @Override
	public void configure(H http) {
		ApplicationContext context = http.getSharedObject(ApplicationContext.class);
		CorsFilter corsFilter = getCorsFilter(context);
		
		http.addFilter(corsFilter);
	}
    
}
```

可以看到，configure 方法就是获取了一个 `CorsFilter` 并添加到 Spring Security 过滤器链中。先看看 `CorsFilter` 是如何获取的：

```java
private CorsFilter getCorsFilter(ApplicationContext context) {
    
    if (this.configurationSource != null) {
        return new CorsFilter(this.configurationSource);
    }
    
    boolean containsCorsFilter = context.containsBeanDefinition(CORS_FILTER_BEAN_NAME);
    
    if (containsCorsFilter) {
        return context.getBean(CORS_FILTER_BEAN_NAME, CorsFilter.class);
    }
   
    boolean containsCorsSource = context.containsBean(CORS_CONFIGURATION_SOURCE_BEAN_NAME);
    
    if (containsCorsSource) {
        CorsConfigurationSource configurationSource = context.getBean(CORS_CONFIGURATION_SOURCE_BEAN_NAME,
                                                                      CorsConfigurationSource.class);
        return new CorsFilter(configurationSource);
    }
    
    boolean mvcPresent = ClassUtils.isPresent(HANDLER_MAPPING_INTROSPECTOR, context.getClassLoader());
    
    if (mvcPresent) {
        return MvcCorsFilter.getMvcCorsFilter(context);
    }
    
    return null;
}
```

可以看到这里一共有四种不同的方式获取 `CorsFilter` ：

（1）如果 `configurationSource` 不为 null，则直接根据 `configurationSource` 创建一个 `CorsFilter`。我们前面的配置最终就是通过这种方式获取到 `CorsFilter` 实例的；

（2）Spring 容器中是否包含一个名为 `corsFilter` 的实例，如果包含，则从 Spring 容器中获取该实例并返回，这意味着我们也可以直接向 Spring 容器中注入一个 `CorsFitler` 实例；

（3）Spring 容器包含一个名为 `corsConfigurationSource` 的实例，如果包含，则根据该实例创建一个 `CorsFilter` 并返回。这意味着在前面的配置中，我们可以将自己创建的 `CorsConfigurationSource` 实例直接注入到 Spring 容器中（添加 `@Bean` 注解即可），然后在 `configure(HttpSecuriry)` 方法通过 `cors()` 方法开启跨域配置即可，不再用手动指定 `CorsConfigurationSource` 实例；

（4）`HandlerMappingIntrospector` 是 Spring Web 中提供的一个类，该类实现了 `CorsConfigurationSource` 接口，所以也可以根据这个创建一个 `CorsFilter`。

这是四种获取 `CorsFilter` 实例的方式。

拿到 `CorsFilter` 之后，调用 `http.addFilter` 方法将其添加到 Spring Security 过滤器链中，在过滤器链构建之前，会先对所有过滤器进行排序（之前在 `HttpSecurity` 中分析过），构建方法如下：

```java
// org.springframework.security.config.annotation.web.builders.HttpSecurity

@Override
protected DefaultSecurityFilterChain performBuild() {
    this.filters.sort(OrderComparator.INSTANCE);
    List<Filter> sortedFilters = new ArrayList<>(this.filters.size());
    for (Filter filter : this.filters) {
        sortedFilters.add(((OrderedFilter) filter).filter);
    }
    return new DefaultSecurityFilterChain(this.requestMatcher, sortedFilters);
}
```

debug 一下看看排序后的位置：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220110142728.png)

可以看到 `CorsFilter` 在 `HeaderWriterFilter` 之后，在认证过滤器之前，即进行跨域请求校验的时候还没有到认证那一步。



### (3) 总结

至此，Spring Security 中关于跨域问题的处理就清晰了，Spring Security 根据开发者提供的 `CorsConfigurationSource` 对象构建出一个 `CorsFilter`，并将该过滤器置于认证过滤器之前。

Spring Security 中关于跨域的三种处理方案，推荐最后一种。