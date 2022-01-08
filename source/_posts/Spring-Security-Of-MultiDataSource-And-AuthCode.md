---
title: Spring Security Of MultiDataSource And AuthCode
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211130165245.jpg'
coverImg: /img/20211130165245.jpg
cover: false
toc: true
mathjax: false
date: 2022-01-04 20:26:33
summary: "Spring Security 多数据源配置及验证码功能"
categories: "Spring Security"
keywords: "Spring Security"
tags: "Spring Security"
---



# Spring Security 多数据源

多个数据源是指同一个系统中，用户数据来自不同的表，在认证时，如果第一张表没有查找到用户，那么就去第二张表中查找，依此类推。



通过之前的分析，我们知道，认证要经过 `AuthenticationProvider`，每一个 `AuthenticationProvider` 中都配置了一个 `UserDetailsService`，而不同的 `UserDetailsService` 则可以代表不同的数据源。

所以我们只需要手动配置多个 `AuthenticationProvider` ，并为不同的 `AuthenticationProvider` 提供不同的 `UserDetailsService` 即可。

## 1、准备工作

就在之前整合 Mybatis-Plus 的基础上改造一下代码：

```java
public class UserDetailsServiceImpl implements UserDetailsService {
    
    private UserMapper userMapper;

    public UserDetailsServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = this.userMapper.loadUserByUsername(username);
        if (user == null)
            throw new UsernameNotFoundException("用户不存在!");
        
        return user;
    }
    
}
```



## 2、配置类

为了方便，这里就直接使用 `InMemoryUserDetailsManager` 来提供 `UserDetailsService` 实例，实际开发中，只需要将 `UserDetailsService` 换成自定义的就可以了：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private UserMapper userMapper;
    
    @Bean
    @Primary
    public UserDetailsService us1() {

        return new UserDetailsServiceImpl(this.userMapper);
    }

    @Bean
    public UserDetailsService us2() {

        return new InMemoryUserDetailsManager(
                User.builder().username("user").password("{noop}123456").roles("admin").build()
        );
    }
    

    @Override
    @Bean
    public AuthenticationManager authenticationManagerBean() throws Exception {

        DaoAuthenticationProvider dao1 = new DaoAuthenticationProvider();
        dao1.setUserDetailsService(us1());

        DaoAuthenticationProvider dao2 = new DaoAuthenticationProvider();
        dao2.setUserDetailsService(us2());

        return new ProviderManager(dao1, dao2);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                    .anyRequest().authenticated()
                .and()
                .formLogin()
                    .loginPage("/myLogin.html")
                    .loginProcessingUrl("/doLogin")
                    .successHandler((request, response, authentication) -> {
                        response.setContentType(MediaType.APPLICATION_JSON_UTF8_VALUE);
                        Map<String, Object> resp = new HashMap<>();
                        resp.put("status", 200);
                        resp.put("msg", "登录成功!");
                        ObjectMapper om = new ObjectMapper();
                        String s = om.writeValueAsString(resp);
                        response.getWriter().write(s);
                    })
                    .failureHandler(((request, response, exception) -> {
                        response.setContentType("application/json;charset=utf-8");
                        Map<String, Object> resp = new HashMap<>();
                        resp.put("status", 500);
                        resp.put("msg", "登录失败! " + exception.getMessage());
                        ObjectMapper om = new ObjectMapper();
                        String s = om.writeValueAsString(resp);
                        response.getWriter().write(s);
                    }))
                    .usernameParameter("uname")
                    .passwordParameter("passwd")
                    .permitAll()
                .and()
                    .logout()
                    .logoutUrl("/logout")
                    .logoutSuccessHandler((request, response, authentication) -> {
                        response.setContentType("application/json;charset=utf-8");
                        Map<String, Object> result = new HashMap<>();
                        result.put("status", 200);
                        result.put("msg", "使用 logout 注销成功!");
                        ObjectMapper om = new ObjectMapper();
                        String s = om.writeValueAsString(result);
                        response.getWriter().write(s);
                    })
                .and()
                .csrf().disable();
    }
}
```

首先定义了两个 `UserDetailsService` 实例，不同实例中存储了不同的用户；

然后重写 `authenticationManagerBean()` 方法，在该方法中，定义了两个 `DaoAuthenticationProvider` 实例并分别设置了不同的 `UserDetailsService`;

最后构建 `ProviderManager` 实例并传入两个 `DaoAuthenticationProvider`。

当系统进行身份认证操作时，就会遍历 `ProviderManager` 中不同的 `DaoAuthenticationProvider`，进而调用不同的数据源。





# Spring Security 集成登录验证码

登录验证码也是项目中一个比较常见的需求，但是 Spring Security 并未对此提供任何自动化的配置方案，需要开发者自定义。

一般来说，有两种实现登录验证码的思路：

- 自定义过滤器
- 自定义认证逻辑

## 1、自定义认证逻辑



### (1) 验证码工具类库：Kaptcha

生成验证码，可以自定义一个生成工具类，也可以使用一些现成的开源库来实现。

比如：`kaptcha`

引入依赖：

```xml
<dependency>
    <groupId>com.github.penggle</groupId>
    <artifactId>kaptcha</artifactId>
    <version>2.3.2</version>
</dependency>
```



### (2) 配置类

通过配置类向容器提供一个 `com.google.code.kaptcha.Producer` 实例，主要配置生成的图片验证码的宽度、长度、生成字符、验证码的长度等信息：

```java
@Configuration
public class KaptchaConfig {
    
    @Bean
    Producer kaptcha() {

        Properties properties = new Properties();
        properties.setProperty("kaptcha.image.width", "150");
        properties.setProperty("kaptcha.image.height", "50");
        properties.setProperty("kaptcha.textproducer.char.string", "0123456789");
        properties.setProperty("kaptcha.textproducer.char.length", "4");

        Config config = new Config(properties);
        DefaultKaptcha defaultKaptcha = new DefaultKaptcha();
        defaultKaptcha.setConfig(config);
        
        return defaultKaptcha;
    }
}
```

之后就可以在 Controller 中定义一个验证码接口了：

```java
@Autowired
Producer producer;

@GetMapping("/vc.jpg")
public void getVerifyCode(HttpServletResponse response, HttpSession session) throws IOException {

    response.setContentType("image/jpeg");
    String text = this.producer.createText();
    session.setAttribute("kaptcha", text);

    BufferedImage image = this.producer.createImage(text);

    try (ServletOutputStream out = response.getOutputStream()) {
        ImageIO.write(image, "jpg", out);
    }
}
```

在这个验证码接口中，我们主要做了两件事：

- 生成验证码文本，并将文本存入 HttpSession 中；
- 根据验证码文本生成验证码图片，并通过 IO 流写出到前端。



### (3) 登录页面

接下来修改登录表单，加入验证码：

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
                        <div class="form-group">
                            <label for="kaptcha" class="text-info">验证码</label>
                            <input type="text" name="kaptcha" id="kaptcha" class="form-control">
                            <br />
                            <img src="/vc.jpg" alt="">
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



### (4) 校验

接下来就是验证码的校验。之前我们了解到，身份认证其实就是在 `AuthenticationProvider#authenticate` 方法中完成。

所以，验证码的校验，我们可以在该方法执行之前进行，需要配置如下类：

```java
public class KaptchaAuthenticationProvider extends DaoAuthenticationProvider {

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        
        // 这里可以通过在 Spring MVC 中了解到的 RequestContextHolder 来获取当前请求
        HttpServletRequest request = ((ServletRequestAttributes) (RequestContextHolder.getRequestAttributes())).getRequest();
        
        // 获取我们在表单中定义的验证码
        String kaptcha = request.getParameter("kaptcha");

        // 获取我们存储到 Session 中的验证码
        String sessionKaptcha = (String) request.getSession().getAttribute("kaptcha");
        
        if (kaptcha != null && sessionKaptcha != null && kaptcha.equalsIgnoreCase(sessionKaptcha)) {
            // 如果验证码输入正确，继续走认证流程
            return super.authenticate(authentication);
        }
        
        // 验证码输入错误就抛出异常
        throw new AuthenticationServiceException("验证码输入错误!");
    }
}
```

这里重写 `authenticate` 方法，在该方法中，从 `RequestContextHolder` 中获取当前请求，进而获取到验证码参数和存储在 `HttpSession` 中的验证码文本进行比较，比较通过则继续执行父类的 `authenticate` 方法，比较不通过，就抛出异常。

### (5) Spring Security 配置

最后，在 SecurityConfig 中配置 AuthenticationManager：

```java
/**
 * @author NaiveKyo
 * @version 1.0
 * @since 2021/12/25 23:12
 */
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private UserMapper userMapper;
    
    @Bean
    @Primary
    public UserDetailsService us1() {

        return new UserDetailsServiceImpl(this.userMapper);
    }

    @Bean
    public UserDetailsService us2() {

        return new InMemoryUserDetailsManager(
                User.builder().username("user").password("{noop}123456").roles("admin").build()
        );
    }

    @Override
    @Bean
    public AuthenticationManager authenticationManagerBean() throws Exception {

        DaoAuthenticationProvider dao1 = new KaptchaAuthenticationProvider();
        dao1.setUserDetailsService(us1());

        DaoAuthenticationProvider dao2 = new KaptchaAuthenticationProvider();
        dao2.setUserDetailsService(us2());

        return new ProviderManager(dao1, dao2);
    }
    
@Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                    .antMatchers("/vc.jpg").permitAll()
                    .anyRequest().authenticated()
                .and()
                .formLogin()
                    .loginPage("/myLogin.html")
                    .loginProcessingUrl("/doLogin")
                    .successHandler((request, response, authentication) -> {
                        response.setContentType(MediaType.APPLICATION_JSON_UTF8_VALUE);
                        Map<String, Object> resp = new HashMap<>();
                        resp.put("status", 200);
                        resp.put("msg", "登录成功!");
                        ObjectMapper om = new ObjectMapper();
                        String s = om.writeValueAsString(resp);
                        response.getWriter().write(s);
                    })
                    .failureHandler(((request, response, exception) -> {
                        response.setContentType("application/json;charset=utf-8");
                        Map<String, Object> resp = new HashMap<>();
                        resp.put("status", 500);
                        resp.put("msg", "登录失败! " + exception.getMessage());
                        ObjectMapper om = new ObjectMapper();
                        String s = om.writeValueAsString(resp);
                        response.getWriter().write(s);
                    }))
                    .usernameParameter("uname")
                    .passwordParameter("passwd")
                    .permitAll()
                .and()
                .logout()
                    .logoutUrl("/logout")
                    .logoutSuccessHandler((request, response, authentication) -> {
                        response.setContentType("application/json;charset=utf-8");
                        Map<String, Object> result = new HashMap<>();
                        result.put("status", 200);
                        result.put("msg", "使用 logout 注销成功!");
                        ObjectMapper om = new ObjectMapper();
                        String s = om.writeValueAsString(result);
                        response.getWriter().write(s);
                    })
                .and()
                .csrf().disable();
    }
}

```



这里的配置分三步：

- 首先沿用前面多数据源的配置，提供不同的 `UserDetailsService`；
- 然后重写 `authenticationManagerBean` 方法，提供一个自己创建的 `ProviderManager` 并设置自己自定义的 `AuthenticationProvider` 实例，不同的 `AuthenticationProvider`  实例采用不同的 `UserDetailsService`；
- 最后不要忘了将验证码的接口放行。



### (6) 测试

重启项目：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220104224107.png)

此时，输入用户名、密码以及验证码就可以成功登录，如果验证码输入错误，则会提示错误信息。



## 2、自定义过滤器

使用过滤器链实现登录验证码是非常容易的。

验证码生成方案依旧是使用 `Kaptcha`。



### (1) LoginFilter

首先需要自定义登录过滤器以替换表单登录的默认过滤器：`UsernamePasswordAuthenticationFilter`：

```java
public class LoginFilter extends UsernamePasswordAuthenticationFilter {

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        
        if (!request.getMethod().equals("POST")) {
            throw new AuthenticationServiceException("Authentication method not supported: " + request.getMethod());
        }
        
        String kaptcha = request.getParameter("kaptcha");
        String sessionKaptcha = (String) request.getSession().getAttribute("kaptcha");
        
        if (StringUtils.hasText(kaptcha) && StringUtils.hasText(kaptcha) && kaptcha.equalsIgnoreCase(sessionKaptcha)) {
            return super.attemptAuthentication(request, response);
        }
        
        throw new AuthenticationServiceException("验证码输入错误!");
    }
}
```

在 LoginFilter 中首先判断验证码是否正确，如果验证码输入错误，则直接抛出异常；

如果验证码输入正确，则调用父类的 `attemptAuthentication` 方法进行登录校验。

### (2) SecurityConfig 配置

在 SecurityConfig 中配置 LoginFilter：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        
        auth.inMemoryAuthentication()
                .withUser("naivekyo")
                .password("{noop}123456")
                .roles("admin");
    }

    @Override
    @Bean
    public AuthenticationManager authenticationManagerBean() throws Exception {
        
        return super.authenticationManagerBean();
    }
    
    @Bean
    LoginFilter loginFilter() throws Exception {

        LoginFilter loginFilter = new LoginFilter();
        
        loginFilter.setFilterProcessesUrl("/doLogin");
        loginFilter.setAuthenticationManager(this.authenticationManagerBean());
        loginFilter.setAuthenticationSuccessHandler(
                new SimpleUrlAuthenticationSuccessHandler("/hello")
        );
        loginFilter.setAuthenticationFailureHandler(
                new SimpleUrlAuthenticationFailureHandler("/myLogin.html")
        );
        loginFilter.setUsernameParameter("uname");
        loginFilter.setPasswordParameter("passwd");
        
        return loginFilter;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                .antMatchers("/vc.jpg").permitAll()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .loginPage("/myLogin.html")
                .permitAll()
                .and()
                .csrf().disable();
        
        http.addFilterAt(this.loginFilter(), UsernamePasswordAuthenticationFilter.class);
    }
}
```

这上一小节不同，这里修改了登录请求的处理地址，注意这个地址以及表单中自定义的用户名/密码参数名要在 LoginFilter 实例中配置。

相比于上一种方式，这种通过过滤器来添加验证码验证要更为简单也便于理解。