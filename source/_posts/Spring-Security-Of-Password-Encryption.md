---
title: Spring Security Of Password Encryption
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211130165446.jpg'
coverImg: /img/20211130165446.jpg
password: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
cover: false
toc: true
mathjax: false
date: 2022-01-08 21:21:01
summary: "Spring Security 密码加密"
categories: "Spring Security"
keywords: "Spring Security"
tags: "Spring Security"
---



# 密码加密

## 1、简介

在实际项目中凡是涉及到密码的地方，都需要进行加密，如果采用明文存储会带来很大的安全风险。在企业级应用中，密码不仅需要加密，还需要加 "盐"，最大程度地保证密码安全。



## 2、密码加密方案进化史

最早使用类似 SHA-256 这样的单向 Hash 算法。

用户注册成功后，保存在数据库中的不再是用户的明文密码，而是经过 SHA-256 加密计算后的一个字符串，当用户进行登录时，将用户输入的明文密码用 SHA-256 进行加密，加密完成之后，在和存储在数据库中的密码进行比对，进而确定用户登录信息是否有效。如果系统遭到攻击，最多也只是存储在数据库中的密文被泄露。

但是这样还是存在安全隐患。彩虹表是一个用于加密 Hash 函数逆运算的表，通常用于破解加密过的 Hash 字符串。为了降低彩虹表对系统安全性的影响，人们又发明了密码加 "盐"，之前是直接将密码作为明文进行加密，现在再添加一个随机数（即盐）和密码明文混合在一起进行加密，这样即使密码明文相同，生成的加密字符串也是不同的。当然，这个随机数也需要以明文形式和密码一起存储在数据库中。当用户需要登录时，拿到用户输入的明文密码和存储在数据库中的盐一起进行 Hash 运算，再将运算结果和存储在数据库中的密文进行比较，进而确定用户的登录信息是否有效。

密码加盐之后，彩虹表的作用就大打折扣了，因为唯一的盐和明文密码总会生成唯一的 Hash 字符。

然而，随着计算机硬件的发展，每秒执行数十亿次 Hash 计算已经非常简单，这意味着即使给密码加密加盐也不再安全。

在 Spring Security 中，我们现在是用一种自适应单向函数（Adaptive One-way Functions）来处理密码问题，这种自适应单向函数在进行密码匹配时，会有意占用大量系统资源（例如 CPU、内存等等），这样可以增加恶意用户攻击系统的难度。

在 Spring Security 中，开发者可以通过 `bcrypt`、`PBKDF2`、`scrypt` 以及 `argon2` 来体验这种自适应单向函数加密。

由于自适应单向函数有意占用大量系统资源，因此每个登录认证请求都会大大降低应用程序的性能，但是 Spring Security 不会采取任何措施来提高密码验证速度，因为它正是通过这种方式来增强系统的安全性。

当然，开发者也可以将用户名/密码这种长期凭证兑换为短期凭证，如会话、OAuth2 令牌等等，这样既可以快速验证用户凭证信息，又不会损失系统的安全性。



# PasswordEncoder 详解

Spring Security 中通过 `PasswordEncoder` 接口定义了密码加密和比对的相关操作：

```java
public interface PasswordEncoder {

	String encode(CharSequence rawPassword);

	boolean matches(CharSequence rawPassword, String encodedPassword);

	default boolean upgradeEncoding(String encodedPassword) {
		return false;
	}

}
```

可以看到 `PasswordEncoder` 接口中一共有三个方法：

- `encode`：该方法用来对明文密码进行加密；
- `matches`：该方法用来进行密码比对；
- `upgradeEncoding`：该方法用来判断当前密码是否需要升级，默认返回 false 表示不需要升级。

针对密码的所有操作，`PasswordEncoder` 接口中都已经定义好了，不同的实现类将采用不同的密码加密方案对密码进行处理。



## 1、PasswordEncoder 常见实现类

常见实现类如下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220108214409.png)

### (1) BCryptPasswordEncoder

`BCryptPasswordEncoder` 使用 `bcrypt` 算法对密码进行加密，为了提高密码的安全性，`bcrypt` 算法故意降低运行速度，以增强密码破解的难度。同时 `BCryptPasswordEncoder` "为自己加盐"，开发者不需要额外维护一个 "盐" 字段，使用 `BCryptPasswordEncoder` 加密后的字符串就已经 "带盐" 了，即使相同的明文每次生成的加密字符串都不相同。

`BCryptPasswordEncoder` 的默认强度为 10，开发者可以根据自己的服务器性能进行调整，以确保密码验证时间大约为 1 秒钟（官方建议密码验证时间为 1 秒钟，这样既可以提高系统安全性，又不会过多影响系统性能）。



### (2) Argon2PasswordEncoder

`Argon2PasswordEncoder` 使用 `Argon2` 算法对密码进行加密，`Argon2` 曾在 Password Hashing Competition 竞赛中获胜。为了解决在定制硬件上密码容易被破解的问题，`Argon2` 也是故意降低运算速度，同时需要大量内存，以确保系统的安全性。



### (3) Pbkdf2PasswordEncoder

`Pbkdf2PasswordEncoder` 使用 `PBKDF2` 算法对密码进行加密，和前面几种类似，`PBKDF2` 算法也是一种故意降低运算速度的算法，当需要 FIPS（Federal Information Processing Standard，美国联邦信息处理标准）认证时，`PBKDF2` 算法是一个很好的选择。



### (4) SCryptPasswordEncoder

`SCryptPasswordEncoder` 使用 `scrypt` 算法对密码进行加密，和前面的几种类似，`scrypt` 也是一种故意降低运算速度的算法，而且需要大量内存。



### (5) 总结

上面四种就是自适应单向函数加密，除了这几种，还有一些基于消息摘要算法的加密方案，这些方案都已经不再安全，但是处于兼容性考虑，Spring Security 并未移除相关类，主要有 `LdapShaPasswordEncoder`、`Md4PasswordEncoder`、`StandardPasswordEncoder` 以及 `NoOpPasswordEncoder`（密码明文存储），这五种皆已废弃。

除了上面这几种之外，还有一个非常重要的密码加密工具类，那就是 `DelegatingPasswordEncoder`。



## 2、DelegatingPasswordEncoder

### (1) 简介

在 Spring Security 5.0 之后，默认的密码加密方案是 `DelegatingPasswordEncoder`。

从名字上看，`DelegatingPasswordEncoder` 是一个代理类，而并非一种全新的密码加密方案。`DelegatingPasswordEncoder` 主要用来代理上面介绍的不同的密码加密方案。

为什么采用 `DelegatingPasswordEncoder` 而不是某一个具体加密方式作为默认的密码加密方案呢？主要考虑了以下三方面因素：

- （1）兼容性：使用 `DelegatingPasswordEncoder` 可以帮助许多使用旧密码加密方式的系统顺利迁移到 Spring Security 中，它允许在同一个系统中同时存在多种不同的密码加密方案；
- （2）便捷性：密码存储的最佳方案不可能一直不变，如果使用 `DelegatingPasswordEncoder` 作为默认的密码加密方案，当需要修改加密方案时，只需要修改很小一部分代码就可以实现；
- （3）稳定性：作为一个框架，Spring Security 不能经常进行重大更改，而使用 `DelegatingPasswordEncoder` 可以方便地对密码进行升级（自动从一个加密方案升级到另外一个加密方案）。

至于 `DelegatingPasswordEncoder` 如何代理其他密码加密方案以及如何对密码进行升级，这里就要提到 `PasswordEncoderFactories` 这个类了，因为正是由它里边的静态方法 `createDelegatingPasswordEncoder` 方法提供了默认的 `DelegatingPasswordEncoder` 实例：

```java
public final class PasswordEncoderFactories {

	private PasswordEncoderFactories() {
	}

	@SuppressWarnings("deprecation")
	public static PasswordEncoder createDelegatingPasswordEncoder() {
        
		String encodingId = "bcrypt";
        
		Map<String, PasswordEncoder> encoders = new HashMap<>();
        
		encoders.put(encodingId, new BCryptPasswordEncoder());
		encoders.put("ldap", new org.springframework.security.crypto.password.LdapShaPasswordEncoder());
		encoders.put("MD4", new org.springframework.security.crypto.password.Md4PasswordEncoder());
		encoders.put("MD5", new org.springframework.security.crypto.password.MessageDigestPasswordEncoder("MD5"));
		encoders.put("noop", org.springframework.security.crypto.password.NoOpPasswordEncoder.getInstance());
		encoders.put("pbkdf2", new Pbkdf2PasswordEncoder());
		encoders.put("scrypt", new SCryptPasswordEncoder());
		encoders.put("SHA-1", new org.springframework.security.crypto.password.MessageDigestPasswordEncoder("SHA-1"));
		encoders.put("SHA-256",
				new org.springframework.security.crypto.password.MessageDigestPasswordEncoder("SHA-256"));
		encoders.put("sha256", new org.springframework.security.crypto.password.StandardPasswordEncoder());
		encoders.put("argon2", new Argon2PasswordEncoder());
        
		return new DelegatingPasswordEncoder(encodingId, encoders);
	}

}
```

可以看到，在 `createDelegatingPasswordEncoder` 方法中，首先定义了 encoders 变量，encoders 中存储了每一种密码加密方案的 id 和所对应的加密类，例如 bcrypt 对应着 BCryptPasswordEncoder。

encoders 创建完成后，最终新建一个 `DelegatingPasswordEncoder` 实例，并传入 encodingId 和 encoders 变量，其中 encodingId 的默认值为 bcrypt，相当于代理类中默认使用的加密方案是 `BCryptPasswordEncoder`。

### (2) 属性

我们来分析一下 `DelegatingPasswordEncoder` 的源码，先看看它的属性：

```java
public class DelegatingPasswordEncoder implements PasswordEncoder {
    
    private static final String PREFIX = "{";

    private static final String SUFFIX = "}";

    private final String idForEncode;

    private final PasswordEncoder passwordEncoderForEncode;

    private final Map<String, PasswordEncoder> idToPasswordEncoder;

    private PasswordEncoder defaultPasswordEncoderForMatches = new UnmappedIdPasswordEncoder();
    
}
```

（1）首先定义了前缀 `PREFIX` 和后缀 `SUFFIX`，用来包裹将来生成的加密方案的 id；

（2）`idForEncode` 表示默认的加密方案的 id；

（3）`passwordEncoderForEncode` 表示默认的加密方案（`BCryptPasswordEncoder`），它的值是根据 `idForEncode` 从 `idToPasswordEncoder` 集合中提取处理的；

（4）`idToPasswordEncoder` 用来保存 id 和加密方案之间的映射；

（5）`defaultPasswordEncoderForMatches` 是指默认的密码比对器，当根据密码加密方案的 id 无法找到对应的加密方案时，就会使用默认的密码比对器。`defaultPasswordEncoderForMatches` 的默认类型是 `UnmappedIdPasswordEncoder`，在 `UnmappedIdPasswordEncoder` 的 `matches` 方法中并不会做任何密码比对操作，直接抛出异常。



### (3) 实现方法

既然 `DelegatingPasswordEncoder` 实现了 `PasswordEncoder` 接口，那我们就重点分析 `PasswordEncoder` 接口中三个方法在 `DelegatingPasswordEncoder` 中的实现：

首先看看 encode 方法：

```java
@Override
public String encode(CharSequence rawPassword) {
    return PREFIX + this.idForEncode + SUFFIX + this.passwordEncoderForEncode.encode(rawPassword);
}
```

encode 方法实现逻辑很简单，具体的加密工作还是由加密类去完成，只不过在密码加密完成后，给加密后的字符串加上一个前缀 `{id}`，用来描述所采用的具体加密方案。因此 encode 方法加密出来的字符串格式类似如下形式：

```
{bcrypt}$2a$10$uQqSvWx7Qt3wJhmPpWkVJ.RumwZ6S79nWbgYpbJLzNDWdqJ80dUjG
{noop}123456
{pbkdf2}e9a5fcf690b95871f7276084fbefb47a2e9047b57ce3a807775b26a1a6737fb5c30599d96191d42e
```

不同的前缀代表了后面的字符串采用了不同的加密方案。



再来看看密码比对方法 matches：

```java
@Override
public boolean matches(CharSequence rawPassword, String prefixEncodedPassword) {
    if (rawPassword == null && prefixEncodedPassword == null) {
        return true;
    }
    String id = extractId(prefixEncodedPassword);
    PasswordEncoder delegate = this.idToPasswordEncoder.get(id);
    if (delegate == null) {
        return this.defaultPasswordEncoderForMatches.matches(rawPassword, prefixEncodedPassword);
    }
    String encodedPassword = extractEncodedPassword(prefixEncodedPassword);
    return delegate.matches(rawPassword, encodedPassword);
}

private String extractId(String prefixEncodedPassword) {
    if (prefixEncodedPassword == null) {
        return null;
    }
    int start = prefixEncodedPassword.indexOf(PREFIX);
    if (start != 0) {
        return null;
    }
    int end = prefixEncodedPassword.indexOf(SUFFIX, start);
    if (end < 0) {
        return null;
    }
    return prefixEncodedPassword.substring(start + 1, end);
}
```

在 matches 方法中，首先调用 `extractId`方法从加密字符中提取出具体的加密方案 id，也就是 `{}` 中的字符，具体的提取方式就是字符串截取。

拿到 id 之后，再去 `this.idToPasswordEncoder` map 中获取对应的加密方案，如果获取到的为 null，说明不存在对应的加密实例，那么就会采用默认的密码匹配器 `this.defaultPasswordEncoderForMatches`；如果根据 id 获取到了对应的加密实例，则调用其 `matches` 方法完成密码校验。

可以看到，这里的 `matches` 方法非常灵活，可以根据加密字符串的前缀，去查找到不同的加密方案，进而完成密码校验。同一个系统中，加密字符串可以使用不同的前缀而互不影响。



最后，看一下密码升级方法 `upgradeEncoding`：

```java
@Override
public boolean upgradeEncoding(String prefixEncodedPassword) {
    String id = extractId(prefixEncodedPassword);
    if (!this.idForEncode.equalsIgnoreCase(id)) {
        return true;
    }
    else {
        String encodedPassword = extractEncodedPassword(prefixEncodedPassword);
        return this.idToPasswordEncoder.get(id).upgradeEncoding(encodedPassword);
    }
}

private String extractEncodedPassword(String prefixEncodedPassword) {
    int start = prefixEncodedPassword.indexOf(SUFFIX);
    return prefixEncodedPassword.substring(start + 1);
}
```

可以看到，如果当前加密字符串所采用的加密方案不是默认的加密方法（`BcryptPasswordEncoder`），就会自动进行密码升级，否则就调用默认密码方案的 `upgradeEncoding` 方法判断密码是否需要升级。



## 3、实战

创建一个测试接口：

```java
@RestController
public class HelloController {
    
    @GetMapping("/hello")
    public String hello() {
        return "hello spring security!";
    }
}
```

在单元测试中执行如下代码，生成一段加密字符串（多次该方法，可以看到相同的明文每次生成的密文都不同）：

```java
@Test
void contextLoads() {

    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    System.out.println(encoder.encode("123456"));
}
```

接下来自定义 SecurityConfig 类：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        
        auth.inMemoryAuthentication()
                .withUser("naivekyo")
                .password("$2a$10$uQqSvWx7Qt3wJhmPpWkVJ.RumwZ6S79nWbgYpbJLzNDWdqJ80dUjG")
                .roles("admin");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .and()
                .csrf().disable();
        
    }
}
```

（1）首先我们将一个 `BCryptPasswordEncoder` 实例注册到 Spring 容器中，这将代替默认的 `DelegatingPasswordEncoder`；

（2）在定义用户时，设置的密码字符串就是前面单元测试方法执行生成的加密字符串。

配置完成，启动项目，项目启动成功，我们就可以使用 `naivekyo/123456` 登录系统了。

另一方面，由于默认使用的是 `DelegatingPasswordEncoder`，所以也可以不配置 `PasswordEncoder` 实例，只在密码前加上前缀：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        
        auth.inMemoryAuthentication()
                .withUser("naivekyo")
                .password("{bcrypt}$2a$10$uQqSvWx7Qt3wJhmPpWkVJ.RumwZ6S79nWbgYpbJLzNDWdqJ80dUjG")
                .roles("admin")
                .and()
                .withUser("user")
                .password("{noop}123456")
                .roles("user");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .and()
                .csrf().disable();
        
    }
}
```

现在我们可以使用两个账号登录系统：`naivekyo/123456` 和 `user/123456` 。

## 4、加密方案自动升级

使用 `DelegatingPasswordEncoder` 的另一个好处就是会自动进行密码加密方案升级（本质就是换一种加密方案），这个功能在整合一些旧系统时非常有用。



### (1) 数据库

新建一张表 `user_upgrade`，插入一条数据：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220109155449.png)

项目需要引入依赖：

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.2.0</version>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
```

配置数据库连接信息及 Mybatis 配置：

```yml
spring:
  datasource:
    username: root
    password: 123456
    url: jdbc:mysql:///spring_security?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai

mybatis:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    map-underscore-to-camel-case: true
  type-aliases-package: org.naivekyo.springsecurity7passwordencoder.entity
  mapper-locations: classpath:/mapper/*.xml
```

注意 mapper.xml 的存放目录。

创建实体类，为了方便这里只创建三个属性：id、username、password，其他方法默认返回 true：

```java
public class User implements UserDetails {
    
    private Integer id;
    
    private String username;
    
    private String password;
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return null;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
```



### (2) UserService

创建 `UserService`：

```java
@Service
public class UserService implements UserDetailsService, UserDetailsPasswordService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Override
    public UserDetails updatePassword(UserDetails user, String newPassword) {
        
        Integer result = this.userMapper.updatePassword(user.getUsername(), newPassword);
        
        if (result == 1) {
            ((User) user).setPassword(newPassword);
        }
        
        return user;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        return this.userMapper.loadUserByUsername(username);
    }
}
```

和之前定义的 `UserDetailsService` 实现不同，这里的 `UserService` 类还实现了一个接口 `UserDetailsPasswordService`，并实现了该接口中的方法 `updatePassword`。当系统判断密码加密方案需要升级的时候，就会自动调用该方法去修改数据库中的密码。

当数据库中的密码修改成功后，修改 user 对象中的 password 属性，并将 user 对象返回。回顾一下 `DaoAuthenticationProvider` 中是在 `createSuccessAuthentication` 方法中触发了密码加密方案自动升级：

```java
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
```

`this.userDetailsPasswordService` 变量正是 `UserDetailsPasswordService` 类型。



### (3) UserMapper

`UserMapper`：

```java
@Mapper
@Repository
public interface UserMapper {

    /**
     * 根据用户名更新密码
     * 
     * @param username 用户名
     * @param newPassword 新的密码
     * @return 更新成功返回 1，否则返回 null
     */
    Integer updatePassword(@Param("username") String username, @Param("newPassword") String newPassword);

    /**
     * 根据用户名查询用户信息
     * 
     * @param username 用户名
     * @return 用户信息
     */
    User loadUserByUsername(@Param("username") String username);
}
```



### (4) xml 文件

`UserMapper.xml` 定义如下：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.naivekyo.springsecurity7passwordencoder.mapper.UserMapper">
    
    <!-- 根据用户名更新密码 -->
    <update id="updatePassword">
        update user_upgrade set password = #{newPassword} where username = #{username};
    </update>
    
    <!-- 根据用户名查询用户信息 -->
    <select id="loadUserByUsername" resultType="com.naivekyo.springsecurity7passwordencoder.entity.User">
        select * from user_upgrade where username = #{username};
    </select>
    
</mapper>
```



### (5) Security 配置

最后，在 SecurityConfig 中配置 UserService 实例：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    protected UserService userService;
    
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        
        auth.userDetailsService(this.userService);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .and()
                .csrf().disable();
        
    }
}
```



### (6) 测试

配置完成后，启动项目，在登录之前，数据库中用户信息应该是 `naivekyo/{noop}123456`，启动项目后，访问 `localhost:8080/login` 进行登录，登录成功后，再次查看数据库，此时用户密码已经自动更新了：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220109181013.png)

这里我们没有定制密码加密器，而是使用默认的 `DelegatingPasswordEncoder`，只要数据库中存储的密码加密方案不是 `DelegatingPasswordEncoder` 中默认的 `BCryptPasswordEncoder`，在登录成功之后，都会自动升级为 `BCryptPasswordEncoder` 加密。



### (7) 同种加密方案升级

上面演示的是不同的加密方案升级，有时候也会存在同种加密方法需要升级的情况。

例如，开发者在创建 `BCryptPasswordEncoder` 实例时有一个强度参数 strength，该参数取值在 4 ~ 31 之间，默认值为 10。

我们可以来修改 strength 参数，配置如下：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    protected UserService userService;
    
    @Bean
    PasswordEncoder passwordEncoder() {
        
        String encodingId = "bcrypt";
        Map<String, PasswordEncoder> encoders = new HashMap<>();
        
        encoders.put(encodingId, new BCryptPasswordEncoder(31));    // 设置强度为 31
        encoders.put("ldap", new org.springframework.security.crypto.password.LdapShaPasswordEncoder());
        encoders.put("MD4", new org.springframework.security.crypto.password.Md4PasswordEncoder());
        encoders.put("MD5", new org.springframework.security.crypto.password.MessageDigestPasswordEncoder("MD5"));
        encoders.put("noop", org.springframework.security.crypto.password.NoOpPasswordEncoder.getInstance());
        encoders.put("pbkdf2", new Pbkdf2PasswordEncoder());
        encoders.put("scrypt", new SCryptPasswordEncoder());
        encoders.put("SHA-1", new org.springframework.security.crypto.password.MessageDigestPasswordEncoder("SHA-1"));
        encoders.put("SHA-256",
                new org.springframework.security.crypto.password.MessageDigestPasswordEncoder("SHA-256"));
        encoders.put("sha256", new org.springframework.security.crypto.password.StandardPasswordEncoder());
        encoders.put("argon2", new Argon2PasswordEncoder());

        return new DelegatingPasswordEncoder(encodingId, encoders);
    }
    
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        
        auth.userDetailsService(this.userService);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .and()
                .csrf().disable();
        
    }
}
```



这里我们自己来提供一个 `DelegatingPasswordEncoder` 实例，同时在构建 `BCryptPasswordEncoder` 实例时，传入了一个 strength 参数为 31，配置完成后，重启项目，再次登录，登录成功后，数据库保存的用户密码再次改变，完成了升级操作：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220109182756.png)





## 5、是谁的 PasswordEncoder

之前分析过，`PasswordEncoder` 做密码校验主要是在 `DaoAuthenticationProvider` 中完成的；`DaoAuthenticationProvider` 是被某一个 `ProviderManager` 管理的；`AuthenticationManager`（即 `ProviderManager` 有全局和局部之分，那么如果开发者配置了 `PasswordEncoder` 实例，是在全局的 `AuthenticationManager` 中使用，还是在局部的 `AuthenticationManager` 中使用呢？



### (1) DaoAuthenticationProvider

先看 `DaoAuthenticationProvider` 的构造方法：

```java
public DaoAuthenticationProvider() {
    setPasswordEncoder(PasswordEncoderFactories.createDelegatingPasswordEncoder());
}

public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
    Assert.notNull(passwordEncoder, "passwordEncoder cannot be null");
    this.passwordEncoder = passwordEncoder;
    this.userNotFoundEncodedPassword = null;
}
```

可以看到，当系统创建了一个 `DaoAuthenticationProvider` 实例的时候，会自动调用 `setPasswordEncoder` 方法来指定一个默认的 `PasswordEncoder`，默认的 `PasswordEncoder` 实例就是 `DelegatingPasswordEncoder`。

在全局的 `AuthenticationManager` 创建过程中，在 `InitializeUserDetailsManagerConfigure#configure` 方法中，有如下一段代码：

```java
PasswordEncoder passwordEncoder = getBeanOrNull(PasswordEncoder.class);
UserDetailsPasswordService passwordManager = getBeanOrNull(UserDetailsPasswordService.class);

DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
provider.setUserDetailsService(userDetailsService);
if (passwordEncoder != null) {
    provider.setPasswordEncoder(passwordEncoder);
}
```

首先调用 `getBeanOrNull` 方法，从 Spring 容器中获取一个 `PasswordEncoder` 实例；然后创建一个 `DaoAuthenticationProvider` 实例，如果 passwordEncoder 不为 null，就设置给 provider 实例。

在这段代码中可以看出，之前我们注册到 Spring 容器的 `PasswordEncoder` 实例，可以在这里获取并设置给 provider。如果我们没有向 Spring 容器中注入 `PasswordEncoder` 实例，则 provider 中使用默认的 `DelegatingPasswordEncoder`。



### (2) 全局和局部 AuthenticationManager

之前分析，全局 `AuthenticationManager` 也有可能是通过 `WebSecurityConfigurerAdapter` 中的 `localConfigureAuthenticationBldr` 变量来构建的，`localConfigureAuthenticationBldr` 变量在构建 `AuthenticationManager` 实例时，使用的是 `LazyPasswordEncoder`，就是一个懒加载的 `PasswordEncoder` 实例，代码如下：

```java
static class LazyPasswordEncoder implements PasswordEncoder {

    private ApplicationContext applicationContext;

    private PasswordEncoder passwordEncoder;

    LazyPasswordEncoder(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @Override
    public String encode(CharSequence rawPassword) {
        return getPasswordEncoder().encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        return getPasswordEncoder().matches(rawPassword, encodedPassword);
    }

    @Override
    public boolean upgradeEncoding(String encodedPassword) {
        return getPasswordEncoder().upgradeEncoding(encodedPassword);
    }

    private PasswordEncoder getPasswordEncoder() {
        if (this.passwordEncoder != null) {
            return this.passwordEncoder;
        }
        PasswordEncoder passwordEncoder = getBeanOrNull(PasswordEncoder.class);
        if (passwordEncoder == null) {
            passwordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
        }
        this.passwordEncoder = passwordEncoder;
        return passwordEncoder;
    }

    private <T> T getBeanOrNull(Class<T> type) {
        try {
            return this.applicationContext.getBean(type);
        }
        catch (NoSuchBeanDefinitionException ex) {
            return null;
        }
    }

    @Override
    public String toString() {
        return getPasswordEncoder().toString();
    }

}
```

可以看到，在 `LazyPasswordEncoder` 中，使用 `getPasswordEncoder` 方法获取到一个 `PasswordEncoder` 实例，具体的获取过程就是去 Spring 容器中找，找到了就直接使用，没找到就调用 `PasswordEncoderFactories.createDelegatingPasswordEncoder()` 方法生成默认的 `DelegatingPasswordEncoder`。

在 `WebSecurityConfigurerAdapter` 中，用来构建局部 `AuthenticationManager` 实例的 `authenticationBuilder` 变量也用到是 `LazyPasswordEncoder` 。

### (3) 结论

经过以上分析可知，如果开发者向 Spring 容器中注册了一个 `PasswordEncoder` 实例，那么无论是全局的 `AuthenticationManager` 还是局部的 `AuthenticationManager`，都将使用该 `PasswordEncoder` 实例；

如果开发者没有提供任何 `PasswordEncoder` 实例，那么无论是全局还是局部的 `AuthenticationManager`，都将使用默认的 `DelegatingPasswordEncoder`。