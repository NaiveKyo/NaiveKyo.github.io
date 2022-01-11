---
title: Spring Security Of Authority Management
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211208174424.jpg'
coverImg: /img/20211208174424.jpg
cover: false
toc: true
mathjax: false
date: 2022-01-11 10:04:53
summary: "Spring Security 权限管理简介"
categories: "Spring Security"
keywords: "Spring Security"
tags: "Spring Security"
---



# 权限管理

认证和授权是 Spring Security 中的两大核心功能，所谓授权也就是我们日常所说的权限管理。Spring Security 中对这两者做了很好的解耦，无论使用哪种认证方式，都不影响权限管理功能的使用。

同时 Spring Security 中对于 RBAC、ACL 等不同权限模型也都有很好的支持。



## 1、什么是权限管理

认证就是确认用户身份，授权则是根据系统提前设置好的规则，给用户分配可以访问某一资源的权限，用户根据自己所具有的权限，去执行相应的操作。



## 2、Spring Security 权限管理策略

从技术上讲，Spring Security 中提供的权限管理功能主要有两种类型：

- 基于过滤器的权限管理（`FilterSecurityInterceptor`）；
- 基于 AOP 的权限管理（`MethodSecurityInterceptor`）。

基于过滤器的权限管理主要用来拦截 HTTP 请求，拦截下来之后，根据 HTTP 请求地址进行权限校验。

基于 AOP 的权限管理则主要用来处理方法级别的权限问题。当需要调用某一个方法时，通过 AOP 将操作拦截下来，然后判断用户是否具备相关的权限，如果具备，则允许方法调用，否则禁止方法调用。



## 3、核心概念



### (1) 角色与权限

在用户登录成功后，会将登录用户的信息保存在 `Authentication` 对象中，`Authentication` 对象中有一个 `getAuthorities` 方法，用来返回当前对象所具备的权限信息，也就是已经授予当前登录用户的权限。

`getAuthorities` 方法返回值是 `Collection<? extends GrantedAuthority>`，即集合中存放的是 `GrantedAuthority` 的子类，当需要进行权限判断时，就会调用该方法获取用户的权限，进而做出判断。

无论用户的认证方式是用户名/密码形式、RememberMe 形式，还是其他如 CAS、OAuth2 等认证方式，最终用户的权限信息都可以通过 `getAuthorities` 方法获取，这就是前面说的无论采用哪种认证方式，都不影响授权。

那么对于 `Authentication#getAuthorities` 方法的返回值，我们应该理解为用户的角色还是用户的权限呢？

- 从设计层面上讲，角色和权限是两个完全不同的东西：权限就是一些具体的操作，例如针对员工数据的读权限（READ_EMPLOYEE）和针对员工数据的写权限（WRITE_EMPLOYEE)；角色则是某些权限的集合，例如管理员角色 ROLE_ADMIN、普通用户角色 ROLE_USER。

- 从代码层面上讲，角色和权限并没有太大的不同，特别是在 Spring Security 中，角色和权限的处理方式基本上是一样的，唯一的区别在于 Spring Security 在多个地方会自动给角色添加一个 ROLE_ 前缀，而权限则不会添加任何前缀。

至于 `Authentication#getAuthorities` 方法的返回值，则要分情况来对待：

（1）如果权限系统设计比较简单，就是 用户 <=> 权限 <=> 资源三者之间的关系，那么 `getAuthorities` 方法的含义就很明确，就是返回用户的权限；

（2）如果权限系统设计比较复杂，同时存在角色和权限的概念，如 用户 <=> 角色 <=> 权限 <=> 资源（用户关联角色、角色关联权限、权限关联资源），此时我们可以讲 `getAuthorities` 方法的返回值当作权限来理解。由于 Spring Security 并未提供任何相关的角色类，因此这个时候就需要我们自定义角色类。

简单介绍一下第二种情况。

如果系统中同时存在角色和权限，我们可以使用 `GrantedAuthority` 的实现类 `SimpleGrantedAuthority` 来表示一个权限，在 `SimpleGrantedAuthority` 类中，我们可以讲权限描述为一个字符串，如 READ_EMPLOYEE、WRITE_EMPLOYEE。据此，我们定义角色类如下：

```java
public class Role implements GrantedAuthority {
    
    private String name;
    
    private List<SimpleGrantedAuthority> allowedOperations = new ArrayList<>();
    
    @Override
    public String getAuthority() {
        return name;
    }
    
    // 省略 getter/setter
}
```

角色继承 `GrantedAuthority` ，一个角色对应多个权限。然后再定义用户类的时候，讲角色转换为权限即可：

```java
public class User implements UserDetails {
    
    private List<Role> roles = new ArrayList<>();
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        for (Role role : this.roles) {
            authorities.addAll(role.getAllowedOperations());
        }
        return authorities.stream().distinct().collect(Collectors.toList());
    }

	// 省略 getter/setter
}
```



整体上来说：

- 设计层面上，角色和权限是两个东西；

- 代码层面上，角色和权限其实差别不大，注意区分即可。



### (2) 角色继承

角色继承就是指角色存在一个上下级的关系，例如 ROLE_ADMIN 继承自 ROLE_USER，那么 ROLE_ADMIN 就自动具备了 ROLE_USER 的所有权限。

Spring Security 中通过 `RoleHierarchy` 类对角色继承提供支持：

```java
public interface RoleHierarchy {

	Collection<? extends GrantedAuthority> getReachableGrantedAuthorities(
			Collection<? extends GrantedAuthority> authorities);

}
```

`RoleHierarchy` 中只有一个 `getReachableGrantedAuthorities` 方法，该方法返回用户真正 "可触达" 的权限。

举个简单例子，假设用户定义了 ROLE_ADMIN 继承自 ROLE_USER，ROLE_USER 继承自 ROLE_GUEST，现在当前用户角色是 ROLE_ADMIN，但是它实际上可以访问的资源也包含 ROLE_USER 和 ROLE_GUEST 能访问的资源。

`getReachableGrantedAuthorities` 方法正是根据当前用户所具有的角色，从角色层级映射中解析出用户真正 "可触达" 的权限。

`RoleHierarchy` 有一个空实现类以及一个常规实现类 `RoleHierarchyImpl`，开发者一般通过 `RoleHierarchyImpl` 类来定义角色的层级关系，如下面的代码表示 ROLE_C 继承自 ROLE_D，ROLE_B 继承自 ROLE_C，ROLE_A 继承自 ROLE_B：

```java
@Configuration
public class RoleHierarchyConfiguration {
    
    @Bean
    RoleHierarchy roleHierarchy() {

        RoleHierarchyImpl hierarchy = new RoleHierarchyImpl();
        
        hierarchy.setHierarchy("ROLE_A > ROLE_B > ROLE_C > ROLE_D");
        
        return hierarchy;
    }
}
```

这样的角色层级，在 `RoleHierarchyImpl` 类中首先通过 `buildRolesReachableInOneStepMap` 私有方法解析成下面这样的 Map 集合：

```
ROLE_A -> ROLE_B
ROLE_B -> ROLE_C
ROLE_C -> ROLE_D
```

然后再通过私有方法 `buildRolesReachableInOneOrMoreStepsMap` 对上面的 Map 再次解析，最终解析结果如下：

```
ROLE_A -> [ROLE_B, ROLE_C, ROLE_D]
ROLE_B -> [ROLE_C, ROLE_D]
ROLE_C -> ROLE_D
```

最后通过 `getReachableGrantedAuthorities` 方法从该 Map 集合中获取用户真正 "可触达" 的权限。



### (3) 两种处理器

Spring Security 中提供的权限管理功能主要有两种类型：基于过滤器的权限管理（FilterSecurityInterceptor）和基于 AOP 的权限管理（MethodSecurityInterceptor）。

无论是哪一种，都涉及到一个前置处理器和后置处理器。

> 下图表示基于过滤器的权限管理中的前置和后置处理器：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220110175211.png)

在基于过滤器的权限管理中，请求首先到达过滤器 `FilterSecurityInterceptor`，在其执行过程中，首先会由前置处理器去判断发起当前请求的用户是否具备相应的权限，如果具备，则请求继续向下走，到达目标方法并执行完毕。在响应时，又会经过 `FilterSecurityInterceptor` 过滤器，此时由后置处理器再去完成其他收尾工作。

在基于过滤器的权限管理中，后置处理器一般是不工作的。因为基于过滤器的权限管理，实际上就是拦截请求 URL 地址，这种权限管理方式粒度较粗，而且过滤器中拿到的是响应的 `HttpServletResponse` 对象，对其所返回的数据做二次处理并不方便。



>  下图表示基于 AOP 的权限管理中的前置后后置处理器：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220110175330.png)

在基于方法的权限管理中，目标方法的调用会被 `MethodSecurityInterceptor` 拦截下来，实现原理就是大家熟知的 AOP 机制。当目标方法的调用被 `MethodSecurityInterceptor` 拦截下之后，在其 invoke 方法中首先会由前置处理器去判断当前用户是否具备调用目标方法所需要的权限，如果具备，则继续执行目标方法。当目标方法执行完毕并给出返回结果后，在 `MethodSecurityInterceptor#invoke` 方法中，由后置处理器再去对目标方法的返回结果进行过滤或者鉴权，然后在 invoke 方法中讲处理后的结果返回。

> 总结

可以看到，无论是基于过滤器的权限管理还是基于方法的权限管理，前置处理器都是重中之重，两种都会用到。而后置处理器则只是在基于方法的权限管理中会用到。 



### (4) 前置处理器

要了解前置处理器，需要先了解投票器。

#### 投票器

投票器是 Spring Security 权限管理功能中的一个组件，顾名思义，投票器的作用就是针对是否允许某一个操作进行投票。当请求的 URL 地址被拦截下来之后，或者当调用的方法被 AOP 拦截下来之后，都会调用投票器对当前操作进行投票，以便决定是否允许当前操作。

在 Spring Security 中，投票器由 `AccessDecisionVoter` 来定义，看一些这个接口：

```java
public interface AccessDecisionVoter<S> {

	int ACCESS_GRANTED = 1;

	int ACCESS_ABSTAIN = 0;

	int ACCESS_DENIED = -1;

	boolean supports(ConfigAttribute attribute);

	boolean supports(Class<?> clazz);

	int vote(Authentication authentication, S object, Collection<ConfigAttribute> attributes);

}
```

- 这个接口首先定义了三个常量：`ACCESS_GRANTED` 表示投票通过、`ACCESS_ABSTAIN` 表示弃权、`ACCESS_DENIED` 表示拒绝；
- `supports(ConfigAttribute attribute)` 方法：用来判断是否支持处理 `ConfigAttribute` 对象；
- `supports(Class<?> clazz)` 方法：用来判断是否支持处理受保护的安全对象；
- `vote` 方法：具体的投票方法，根据用户所具有的权限以及当前请求需要的权限进行投票。
  - 第一个参数 `authentication` 中可以提取出当前用户所具备的权限；
  - 第二个参数 `object` 表示受保护的安全对象，如果受保护的是 URL 地址，则 object 就是一个 `FilterInvocation` 对象；如果受保护的是一个方法，object 就是一个 `MethodInvocation` 对象；
  - 第三个参数 `attributes` 表示访问收保护对象所需要的权限。
  - `vote` 方法的返回值就是前面所定义的三个常量之一。



Spring Security 为 `AccessDecisionVoter` 提供了诸多不同的实现类，如图所示：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220110181359.png)

- `RoleVoter`：`RoleVoter` 是根据登录主体的角色进行投票，即判断当前用户是否具备受保护对象所需要的角色。需要注意的是，默认情况下角色需以 "ROLE_" 开始，否则 supports 方法直接返回 false，不进行后续的投票操作；
- `RoleHierarchyVoter`：`RoleHierarchyVoter` 继承自 `RoleVoter`，投票逻辑和 `RoleVoter` 一致，不同的是 `RoleHierarchyVoter` 支持角色的继承，它通过 `RoleHierarchyImpl` 对象对用户所具有的角色进行解析，获取用户真正 "可触达" 的权限；而 `RoleVoter` 则直接调用 `authentication.getAuthorities()` 方法获取用户的角色；
- `WebExpressionVoter`：基于 URL 地址进行权限控制时的投票器（支持 SpEL）；
- `Jsr250Voter`：处理 SJR-250 权限注解的投票器，如 `@PermitAll`、`@DenyAll` 等等；
- `AuthenticatedVoter`：`AuthenticatedVoter` 用于判断当前用户的认证形式，它有三种取值：
  - `IS_AUTHENTICATED_FULLY`：要求当前用户既不是匿名用户也不是通过 RememberMe 进行认证；
  - `IS_AUTHENTICATED_REMEMBERED`：在前者基础上，允许用户通过 RememberMe 进行认证；
  - `IS_AUTHENTICATED_ANONYMOUSLY`：允许当前用户通过 RememberMe 认证，也允许当前用户是匿名用户。
- `AbstractAclVoter`：基于 ACL 进行权限控制时的投票器。这是一个抽象类，没有绑定到具体的 ACL 系统；
- `PreInvocationAuthorizationAdviceVoter`：处理 `@PreFilter` 和 `@PreAuthorize` 注解的投票器。

这就是 Spring Security 中提供的所有投票器，在具体使用中，可以单独使用一个，也可以多个一起使用。如果上面这些投票器都无法满足需求，也可以自定义投票器。

需要注意的是，投票结果并非最终结果（通过或拒绝），最终结果还要看决策器（`AccessDecisionManager`）。



#### 决策器

决策器由 `AccessDecisionManager` 负责，`AccessDecisionManager` 会同时管理多个投票器，由 `AccessDecisionManager` 调用投票器进行投票，然后根据投票结果做出相应的决策，所以我们将 `AccessDecisionManager` 也称作是一个决策管理器。

源码如下：

```java
public interface AccessDecisionManager {

	void decide(Authentication authentication, Object object, Collection<ConfigAttribute> configAttributes)
			throws AccessDeniedException, InsufficientAuthenticationException;

	boolean supports(ConfigAttribute attribute);

	boolean supports(Class<?> clazz);

}
```

三个方法：

- `decide` 方法：是核心的决策方法，在这个方法中判断是否允许当前 URL 或者方法的调用，如果不允许，则会抛出 `AccessDeniedException` 异常；
- `supports(ConfigAttribute attribute)` 方法：用来判断是否支持处理 `ConfigAttribute` 对象；
- `supports(Class<?> clazz)` 方法：用来判断是否支持当前安全对象。

类图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220110201341.png)

从图中可以看出 `AccessDecisionManager` 有一个实现类 `AbstractAccessDecisionManager`，一个 `AbstractAccessDecisionManager` 对应多个投票器。

多个投票器针对同一个请求可能会给出不同的结果，那么听谁的呢？这就要看决策器了：

- `AffirmativeBased`：一票通过机制，即只要有一个投票器通过就可以访问（默认就是这个）；
- `UnanimousBased`：一票否决机制，即只要有一个投票器返回就不可以访问；
- `ConsensusBased`：少数服从多数机制。如果是平局并且至少有一张赞同票，则根据 `allIfEqualGrantedDeniedDecisions` 参数的取值来决定，如果该参数为 true，则可以访问，否则不可以访问。

这就是 Spring Security 提供的三个决策器，如果这三个决策器无法满足需求，开发者也可以自定义类继承 `AbstractAccessDecisionManager` 实现自己的决策器。

以上就是前置处理器中的大致逻辑，无论是基于 URL 还是基于方法的权限管理，都是在前置处理器中通过 `AccessDecisionManager` 调用 `AccessDecisionVoter` 进行投票，进而做出相应的决策。



### (5) 后置处理器

后置处理器一般只在基于方法的权限控制中会用到，当目标方法执行完毕后，通过后置处理器可以对目标方法的返回值进行权限校验或者过滤。

后置处理器由 `AfterInvocationManager` 负责，看一下它的源码：

```java
public interface AfterInvocationManager {

	Object decide(Authentication authentication, Object object, Collection<ConfigAttribute> attributes,
			Object returnedObject) throws AccessDeniedException;

	boolean supports(ConfigAttribute attribute);

	boolean supports(Class<?> clazz);

}
```

`AfterInvocationManager` 和 `AccessDecisionManager` 的源码高度相似，主要的区别在于 `decide` 方法的参数和返回值。

当后置处理器执行时，被权限保护的方法已经执行完毕，后置处理器主要是对执行的结果进行过滤，所以 decide 方法中有一个 `returnedObject` 参数，这就是目标方法的执行结果，decide 方法的返回值就是对 returnedObject 对象进行过滤/鉴权后的结果。

类图如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220110202611.png)

`AfterInvocationProvider` 有一个默认实现类，即 `PostInvocationAdviceProvider`，该类主要用来处理 `@PostAuthorize` 和 `@PostFilter` 注解配置的过滤器。



这就是 Spring Security 中提供的后置处理器。



### (6) 权限元数据

#### ConfigAttribute

前面介绍投票器的时候，在具体的投票方法 `vote` 中，受保护对象所需要的权限保存在一个 `Collection<ConfigAttribute>` 集合中，集合中的对象是 `ConfigAttribute`，而不是我们所熟知的 `GrantedAuthority`。

`ConfigAttribute` 是用来存储与安全系统相关的配置属性，也就是系统关于权限的配置，通过 `ConfigAttribute` 来存储，看一下接口定义：

```java
public interface ConfigAttribute extends Serializable {

	String getAttribute();

}
```

该接口只有一个 `getAttribute` 方法返回具体的权限字符串，而 `GrantedAuthority` 中则是通过 `getAuthority` 方法返回用户所具有的权限，两者返回值都是字符串。

所有 `ConfigAttribute` 和 `GrantedAuthority` 虽然是不同的对象，但是最终是可以比较的。

`ConfigAttribute` 的所有继承类：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220110203756.png)

主要提一下其中比较重要的五个实现类：

- `WebExpressionConfigAttribute`：如果用户是基于 URL 地址来控制权限并且支持 SpEL，那么默认配置的权限控制表达式最终会被封装为 `WebExpressionConfigAttribute` 对象；
- `SecurityConfig`：如果用户使用了 `@Secured` 注解来控制权限，那么配置的权限就会被封装为 `SecurityConfig` 对象；
- `Jsr250SecurityConfig`：如果用户使用了 JSR-250 相关的注解来控制权限（如 `@PermitAll`、`@DenyAll`），那么配置的权限就会被封装为 `Jsr250SecurityConfig` 对象；
- `PreInvocationExpressionAttribute`：如果用户使用了 `@PreAuthorize`、`@PreFilter` 注解来控制权限，那么相关的配置就会被封装为 `PreInvocationExpressionAttribute` 对象；
- `PostInvocationExpressionAttribute`：如果用户使用了 `@PostAuthorize`、`@PostFilter` 注解来控制权限，那么相关的配置就会被封装为 `PostInvocationExpressionAttribute` 对象。

可以看到，针对不同的配置方式，配置数据会以不同的 `ConfigAttribute` 对象存储。



#### SecurityMetadatSource

当投票器在进行投票时，需要两方面的权限：

- 其一是当前用户具备哪些权限；
- 其二是当前访问的 URL 或者方法需要哪些权限才能访问。

投票器所做的事情就是对这两种权限进行比较。

用户具备的权限保存在 authentication 中，那么当前访问的 URL 或者方法所需要的权限如何获取呢？这就和 `SecurityMetadatSource` 有关了。

从字面上来理解，`SecurityMetadataSource` 就是安全元数据源，`SecurityMetadataSource` 所做的事情，就是提供受保护对象所需要的权限。

例如，用户访问了一个 URL 地址，该 URL 地址需要哪些权限才能访问？这个就由 `SecurityMetadataSource` 来提供。

`SecurityMetadataSource` 是一个接口，看一下它的源码：

```java
public interface SecurityMetadataSource extends AopInfrastructureBean {

	Collection<ConfigAttribute> getAttributes(Object object) throws IllegalArgumentException;

	Collection<ConfigAttribute> getAllConfigAttributes();

	boolean supports(Class<?> clazz);

}
```

这里只有三个方法：

- `getAttributes`：根据传入的安全对象参数返回其所需要的权限。
  - 如果受保护的对象是一个 URL 地址，那么传入的参数 object 就是一个 `FilterInvocation` 对象；
  - 如果受保护的对象是一个方法，那么传入的参数 object 就是一个 `MethodInvocation` 对象；
- `getAllConfigAttributes`：`getAllConfigAttributes` 方法返回所有的角色/权限，以便验证是否支持。不过这个方法并不是必需的，也可以直接返回 null；
- `supports`：返回当前的 `SecurityMetadataSource` 是否支持受保护对象如 `FilterInvocation` 或者 `MethodInvocation` 。



`SecurityMetadataSource` 的继承关系如图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220110205032.png)

> 基于 URL

从图中可以看到，直接继承自 `SecurityMetadataSource` 的接口主要有两个：

`FilterInvocationSecurityMetadataSource` 和 `MethodSecurityMetadataSource`。

- `FilterInvocationSecurityMetadataSource` ：这是一个空接口，起到了标记的作用。如果被保护的对象是一个 URL 地址，那么将由 `FilterInvocationSecurityMetadataSource` 的实现类提供访问该 URL 地址所需要的权限；
- `MethodSecurityMetadataSource` 也是一个接口，起标记作用，如果受保护的对象是一个方法，那么将通过`MethodSecurityMetadataSource` 的实现类来获取受保护对象所需要的权限。

`FilterInvocationSecurityMetadataSource` 只有一个子类 `DefaultFilterInvocationSecurityMetadataSource`，该类中定义了一个如下格式的 Map 集合：

```java
private final Map<RequestMatcher, Collection<ConfigAttribute>> requestMap;
```

可以看到，这个 Map 集合中，key 是一个请求匹配器，value 则是一个权限集合，也就是说 requestMap 中保存了请求 URL 和其所需要权限的映射关系。在 Spring Security 中，如果直接在 `configure(HttpSecurity)` 方法中配置 URL 请求地址拦截，像下面这样：

```java
http.authorizeRequests()
    .antMatchers("/admin/**").hasRole("admin")
    .antMatchers("/user/**").access("hasRole('user')")
    .anyRequest().access("isAuthenticated")
```

这段配置表示访问 `/admin/**` 格式的 URL 地址需要 admin 角色，访问 `/user/**` 格式的 URL 地址需要 user 角色，其余地址认证后即可访问。这段请求和权限之间的映射关系，会经过 `DefaultFilterInvocationSecurityMetadataSource` 的子类 `ExpressionBasedFilterInvocationSecurityMetadataSource` 进行处理，并最终将映射关系保存到 requestMap 变量中，以备后续使用。

在实际开发中，URL 地址以及访问它所需要的权限可能保存在数据库中，此时我们可以自定义类实现 `FilterInvocationSecurityMetadataSource` 接口，然后重写 `getAttributes` 方法，根据当前请求的 URL 地址去数据库中查询其所需要的权限，然后将查询结果封装为对应的 `ConfigAttribute` 集合返回即可。



> 基于方法

如果是基于方法的权限管理，那么对应的 `MethodSecurityMetadataSource` 实现类就比较多了：

- `PrePostAnnotationSecurityMetadataSource`：`@PreAuthorize`、`@ProFilter`、`@PostAuthorize`、`@PostFilter` 四个注解所标记的权限规则，将由它负责提供；
- `SecuredAnnotationSecurityMetadataSource`：`@Secured` 注解所标记的权限规则，将由它负责提供；
- `MapBasedMethodSecurityMetadataSource`：基于 XML 文件配置的方法权限拦截规则（基于 `sec:protect` 节点），将由它负责提供；
- `Jsr250MethodSecurityMetadataSource`：JSR-250 相关的注解（如 `@PermitAll`、`@DenyAll`）所标记的权限规则，将由它负责提供。

这就是 `SecurityMetadataSource` 的作用，总之，不同的权限拦截方式都对应了一个 `SecurityMetadataSource` 实现类，请求的 URL 或者方法需要什么权限，调用 `SecurityMetadataSource#getAttributes` 方法就可以获取到。 



### (7) 权限表达式

Spring Security 3.0 引入了 SpEL 表达式进行权限配置，我们可以在请求的 URL 或者访问的方法上，通过 SpEL 来配置所需要的权限。

内置的权限表达式如下表：

| 表达式                                                       | 备注                                                       |
| ------------------------------------------------------------ | ---------------------------------------------------------- |
| `hasRole(String role)`                                       | 当前用户是否具备指定角色                                   |
| `hasAnyRole(String...roles)`                                 | 当前用户是否具备指定角色中的任意一个                       |
| `hasAuthority(String authority)`                             | 当前用户是否具备指定的权限                                 |
| `hasAnyAuthority(String...authorities)`                      | 当前用户是否具备指定权限中的任意一个                       |
| `principal`                                                  | 代表当前登录主体 Principal                                 |
| `authentication`                                             | 这个是从 SecurityContext 中获取到的 Authentication 对象    |
| `permitAll`                                                  | 允许所有的请求/调用                                        |
| `denyAll`                                                    | 拒绝所有的请求/调用                                        |
| `isAnonymous()`                                              | 当前用户是否是一个匿名用户                                 |
| `isRememberMe()`                                             | 当前用户是否是通过 RememberMe 自动登录                     |
| `isAuthenticated()`                                          | 当前用户是否已经认证成功                                   |
| `isFullyAuthenticated()`                                     | 当前用户是否既不是匿名用户也不是通过 RememberMe 自动登录的 |
| `hasPermission(Object target, Object permission)`            | 当前用户是否具有指定目标的指定权限                         |
| `hasPermission(Object target, String targetType, Object permission)` | 当前用户是否具备指定目标的指定权限                         |
| `hasIpAddress(String ipAddress)`                             | 当前请求 IP 地址是否为指定 IP                              |

这是 Spring Security 内置的表达式，一般来说足够使用了。如果这些内置的表达式无法满足项目需求，开发者也可以自定义表达式。

Spring Security 中通过 `SecurityExpressionOperations` 接口定义了基本的权限表达式：

```java
public interface SecurityExpressionOperations {

	Authentication getAuthentication();

	boolean hasAuthority(String authority);

	boolean hasAnyAuthority(String... authorities);

	boolean hasRole(String role);

	boolean hasAnyRole(String... roles);

	boolean permitAll();

	boolean denyAll();

	boolean isAnonymous();

	boolean isAuthenticated();

	boolean isRememberMe();

	boolean isFullyAuthenticated();

	boolean hasPermission(Object target, Object permission);

	boolean hasPermission(Object targetId, String targetType, Object permission);

}
```

返回值为 boolean 类型的就是权限表达式，如果返回 true，则表示权限校验通过，否则表示权限校验失败。

`SecurityExpressionOperations` 的实现类如下图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220110211454.png)

> SecurityExpressionRoot

`SecurityExpressionRoot` 对 `SecurityExpressionOperations` 接口做了基本的实现，并在此基础上增加了 principal。

`hasAuthority`、`hasAnyAuthority`、`hasRole` 以及 `hasAnyRole` 四个方法主要是将传入的参数和 `authentication` 对象中保存的用户权限进行比对，如果用户具备相应权限就返回 true，否则返回 false。

`permitAll` 方法总是返回 true，而 `denyAll` 方法总是返回 false。

`isAnonymous`、`isAuthenticated`、`isRememberMe` 以及 `isFullyAuthenticated` 四个方法则是根据对 `authentication` 对象的分析，然后返回 true 或者 false。

最后的 `hasPermission` 则需要调用 `PermissionEvaluator` 中对应的方法进行计算，然后返回 true 或者 false。

`SecurityExpressionRoot` 中定义的表达式既可以在基于 URL 地址的权限管理中使用，也可以在基于方法的权限管理中使用。

> WebSecurityExpressionRoot

`WebSecurityExpressionRoot` 继承自 `SecurityExpressionRoot` ，并增加了 `hasIpAddress` 方法，用来判断请求的 IP 地址是否满足要求。

在 Spring Security 中，如果我们的权限管理是基于 URL 地址的，那么使用的就是 `WebSecurityExpressionRoot` 。



> MethodSecurityExpressionOperations

`MethodSecurityExpressionOperations` 定义了基于方法的权限管理时一些必须实现的接口，主要是参数对象的 get/set、返回对象的 get/set 以及返回受保护的对象。



> MethodSecurityExpressionRoot

`MethodSecurityExpressionRoot` 实现了 `MethodSecurityExpressionOperations` 接口，并对其定义的方法进行了实现。

`MethodSecurityExpressionRoot` 虽然也继承了 `SecurityExpressionRoot`，但是并未扩展新的表达式。换句话说，`SecurityExpressionRoot`中定义的权限表达式在方法上也可以使用，但是 `hasIpAddress` 不可以在方法上使用。



## 4、基于 URL 地址的权限管理

基于 URL 地址的权限管理主要是通过过滤器 `FilterSecurityInterceptor` 来实现的。如果开发者配置了基于 URL 地址的权限管理，那么 `FilterSecurityInterceptor` 就会被自动添加到 Spring Security 过滤器链中，在过滤器链中拦截下请求，然后分析当前用户是否具备请求所需要的权限，如果不具备，就抛出异常。

`FilterSecurityInterceptor` 将请求拦截下来之后，会交给 `AccessDecisionManager` 进行处理，`AccessDecisionManager` 则会调用投票器进行投票，然后对投票结果进行决策，最终决定请求是否通过。



### (1) 基本用法

创建一个 Spring Boot 项目，引入 web 和 spring security 依赖，项目中添加如下配置：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        
        auth.inMemoryAuthentication()
                .withUser("naivekyo")
                .password("{noop}123456")
                .roles("ADMIN")
                .and()
                .withUser("user")
                .roles("USER")
                .password("{noop}123456")
                .and()
                .withUser("guest")
                .password("{noop}123456")
                .authorities("READ_INFO");
    }
    
}
```

定义三个用户。

对于复杂的权限管理系统，用户和角色关联，角色和权限关联，权限和资源关联；

对于简单的权限管理系统，用户和权限关联、权限和资源关联。

无论是哪一种，用户都不会和角色以及权限同时关联。反映到代码上就是 roles 方法和 authorities 方法不能同时调用，如果同时调用，后者会覆盖掉前者。

看一下源码：

```java
// org.springframework.security.core.userdetails.User$UserBuilder

public UserBuilder roles(String... roles) {
    List<GrantedAuthority> authorities = new ArrayList<>(roles.length);
    for (String role : roles) {
        
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
    }
    return authorities(authorities);
}

public UserBuilder authorities(GrantedAuthority... authorities) {
    return authorities(Arrays.asList(authorities));
}

public UserBuilder authorities(Collection<? extends GrantedAuthority> authorities) {
    this.authorities = new ArrayList<>(authorities);
    return this;
}
```

可以看到，无论是给用户设置角色还是权限，最终都会来到 `authorities(Collection<? extends GrantedAuthority> authorities)` 方法，在该方法中直接给用户的 authorities 属性重新赋值，所以如果同时调用了 roles 方法和 authorities 方法，那么后者就会覆盖前者。

同时也需要注意，Spring Security 会自动给用户角色添加 ROLE_ 前缀。

接下来配置权限拦截规则，重写 `configure(HttpSecurity http)` 方法：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {

    http.authorizeRequests()
        .antMatchers("/admin/**").hasRole("ADMIN")
        .antMatchers("/user/**").access("hasAnyRole('USER', 'ADMIN')")
        .antMatchers("/getInfo").hasAuthority("READ_INFO")
        .anyRequest().access("isAuthenticated()")
        .and()
        .formLogin()
        .and()
        .csrf().disable();
}
```

这里有一些需要注意的：

（1）大部分表达式都有对应的方法可以直接调用，例如上面的 hasRole 方法对应的就是 hasRole 表达式，也可以直接调用 access ，将表达式作为参数；

（2）Spring Security 会为 hasRole 表达式自动添加 ROLE_ 前缀，所以用户的角色也必须有 ROLE_ 前缀，上面的案例都是直接在内存中创建的，而在用户定义时设置的用户权限不会添加任何前缀。<strong style="color:red">如果用户信息是从数据库中读取出来的，就需要注意 ROLE_ 前缀的问题</strong>；

（3）可以通过 access 方法来使用权限表达式；

（4）代码的顺序很关键，当请求到来后，按照从上往下的顺序依次进行匹配。

提供四个测试接口：

```java
@RestController
public class HelloController {
    
    @GetMapping("/hello")
    public String hello() {
        return "hello";
    }
    
    @GetMapping("/admin/hello")
    public String admin() {
        return "hello admin";
    }
    
    @GetMapping("/user/hello")
    public String user() {
        return "hello user";
    }
    
    @GetMapping("/getInfo")
    public String getInfo() {
        return "getInfo";
    }
}
```

启动项目，进行测试:

- 使用 `naviekyuo/123456` 登录，只能访问 `/hello` 和 `/admin/hello`；

- 使用 `user/123456` 登录，只能访问 `/hello`  和 `/user/hello`；
- 使用 `guest/123456` 登录，只能访问 `/hello` 和 `/getInfo`。 



### (2) 角色继承

如果需要配置角色继承，则只需要提供一个 `RoleHierarchy` 实例即可：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Bean
    RoleHierarchy roleHierarchy() {

        RoleHierarchyImpl hierarchy = new RoleHierarchyImpl();
        
        hierarchy.setHierarchy("ROLE_ADMIN > ROLE_USER");
        
        return hierarchy;
    }
    
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        
        auth.inMemoryAuthentication()
                .withUser("naivekyo")
                .password("{noop}123456")
                .roles("ADMIN")
                .and()
                .withUser("user")
                .roles("USER")
                .password("{noop}123456")
                .and()
                .withUser("guest")
                .password("{noop}123456")
                .authorities("READ_INFO");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                .antMatchers("/admin/**").hasRole("ADMIN")
                .antMatchers("/user/**").access("hasAnyRole('USER', 'ADMIN')")
                .antMatchers("/getInfo").hasAuthority("READ_INFO")
                .anyRequest().access("isAuthenticated()")
                .and()
                .formLogin()
                .and()
                .csrf().disable();
    }
}
```



`/user/**` 需要 USER 角色才可以访问，但是由于 ROLE_ADMIN 继承自 ROLE_USER，所以自动具备 ROLE_USER 的权限，因此如果用户具备 ROLE_ADMIN 角色，那就也可以访问 `/user/**` 格式的地址。

### (3) 自定义表达式

如果内置的表达式无法满足需求，开发者也可以自定义表达式：

假设现在有两个接口：

```java
@GetMapping("/hello/{userId}")
public String hello(@PathVariable Integer userId) {

    return "hello " + userId;
}

@GetMapping("/hi")
public String hello(String username) {
    return "hello " + username;
}
```

第一个接口，参数 userId 必须是偶数方可请求成功；

第二个接口，参数 username 必须是 naivekyo 方可请求成功；

同时两个接口都必须认证后才可以访问。

如果我们想通过自定义表达式实现这一功能，只需要按照如下方式定义：

```java
@Component
public class PermissionExpression {
    
    public boolean checkId(Authentication authentication, Integer userId) {
        if (authentication.isAuthenticated()) {
            return userId % 2 == 0;
        }
        
        return false;
    }
    
    public boolean check(HttpServletRequest request) {
        return "naivekyo".equals(request.getParameter("username"));
    }
}
```

自定义 `PermissionExpression` 类并注册到 Spring 容器中，然后在里面定义相应的方法。

最后在 Security 配置中添加如下路径匹配规则：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {

    http.authorizeRequests()
        .antMatchers("/hello/{userId}")
        .access("@permissionExpression.checkId(authentication, #userId)")
        .antMatchers("/hi")
        .access("isAuthenticated() and @permissionExpression.check(request)")
        .anyRequest()
        .and()
        .formLogin()
        .and()
        .csrf().disable();
}
```

在 access 方法中，我们可以通过 `@` 符号引用一个 Bean 并调用其中的方法。

在 checkId 方法中，`#userId` 就表示前面的 userId 参数；

在 check 方法中，我们用了两个表达式，需要同时满足 `isAuthenticated()` 和 `check()` 方法都为 true，该请求才会通过。



### (4) 原理剖析

简单梳理一下 Spring Security 中基于 URL 地址进行权限管理的一个大致原理：



#### AbstractSecurityInterceptor

`AbstractSecurityInterceptor` 类统筹者关于权限处理的一切。

该类中方法很多，这里只需要关注其中三个方法：`beforeInvocation`、`afterInvocation` 和 `finallyInvocation`。

这三个方法中，`beforeInvocation` 中会调用前置处理器完成权限校验，`afterInvocation` 中调用后置处理器完成权限校验，`finallyInvocation` 则主要做一些校验后的清理工作

先看 `beforeInvocation`：

```java
protected InterceptorStatusToken beforeInvocation(Object object) {
  
    if (!getSecureObjectClass().isAssignableFrom(object.getClass())) {
        throw new IllegalArgumentException("");
    }
    
    Collection<ConfigAttribute> attributes = this.obtainSecurityMetadataSource().getAttributes(object);
    
    if (CollectionUtils.isEmpty(attributes)) {
   
        publishEvent(new PublicInvocationEvent(object));
        return null; // no further work post-invocation
    }
    
    if (SecurityContextHolder.getContext().getAuthentication() == null) {
        credentialsNotFound(this.messages.getMessage(""), object, attributes);
    }
    
    Authentication authenticated = authenticateIfRequired();
     
    // Attempt authorization
    attemptAuthorization(object, attributes, authenticated);

    if (this.publishAuthorizationSuccess) {
        publishEvent(new AuthorizedEvent(object, attributes, authenticated));
    }

    // Attempt to run as a different user
    Authentication runAs = this.runAsManager.buildRunAs(authenticated, object, attributes);
    if (runAs != null) {
        SecurityContext origCtx = SecurityContextHolder.getContext();
        SecurityContext newCtx = SecurityContextHolder.createEmptyContext();
        newCtx.setAuthentication(runAs);
        SecurityContextHolder.setContext(newCtx);
        
        // need to revert to token.Authenticated post-invocation
        return new InterceptorStatusToken(origCtx, true, attributes, object);
    }

    // no further work post-invocation
    return new InterceptorStatusToken(SecurityContextHolder.getContext(), false, attributes, object);

}

private void attemptAuthorization(Object object, Collection<ConfigAttribute> attributes,
                                  Authentication authenticated) {
    try {
        this.accessDecisionManager.decide(authenticated, object, attributes);
    }
    catch (AccessDeniedException ex) {
        if (this.logger.isTraceEnabled()) {
            this.logger.trace(LogMessage.format("", object,
                                                attributes, this.accessDecisionManager));
        }
        else if (this.logger.isDebugEnabled()) {
            this.logger.debug(LogMessage.format("", object, attributes));
        }
        publishEvent(new AuthorizationFailureEvent(object, attributes, authenticated, ex));
        throw ex;
    }
}
```

方法比较长，大概梳理一下：

（1）首先调用 `obtainSecurityMetadataSource()` 方法获取到 `SecurityMetadataSource` 对象，然后调用其 `getAttributes` 方法获取受保护对象所需要的权限。如果获取到的值为空，此时：

- 如果 `rejectPublicInvocations` 变量值为 true，表示受保护的对象拒绝公开调用，则直接抛出异常；
- 如果 `rejectPublicInvocations` 变量为 false，表示受保护的对象允许公开访问，此时直接返回 null 即可。

（2）接下来到 `SecurityContextHolder` 中查看用户的凭证信息是否存在；

（3）调用 `authenticateIfRequired` 方法检查当前用户是否已经登录；

（4）调用 `attemptAuthorization` 方法，该方法内部调用 `accessDecisionManager.decide` 方法进行决策，该方法中会调用投票器进行投票，如果该方法执行抛出异常，则说明权限不足；

（5）接下来调用 `runAsManager.buildRunAs` 方法去临时替换用户身份，不过默认情况下，`runAsManager` 的实例是 `NullRunAsManager`，即不做任何替换，所以返回的 runAs 对象为 null。

- 如果 runAs 为 null，直接创建一个 `InterceptorStatusToken` 对象返回即可；
- 否则将 `SecurityContextHolder` 中保存的用户信息修改为替换的用户对象，然后返回一个 `InterceptorStatusToken` 对象。`InterceptorStatusToken` 对象中保存了当前用户的 `SecurityContext` 对象，加入进行了临时用户替换，在替换完成后，最终还是哟啊恢复成当前用户身份的，恢复的依据就是 `InterceptorStatusToken` 中保存的原始 `SecurityContext` 对象。



这就是 `beforeInvocation` 的大致工作流程，其实一个核心功能就是调用 `accessDecisionManager.decide` 方法进行权限验证。

在看看 `finallyInvocation` 方法：

```java
protected void finallyInvocation(InterceptorStatusToken token) {
    if (token != null && token.isContextHolderRefreshRequired()) {
        SecurityContextHolder.setContext(token.getSecurityContext());
    }
}
```

如果临时替换了用户身份，那么最终要将用户身份恢复，`finallyInvocation` 方法所做的事情就是恢复用户身份。这里的参数 token 就是 `beforeInvocation` 方法的返回值，用户原始的身份信息都保存在 token 中，从 token 中取出用户身份信息，并设置到 `SecurityContextHolder` 中即可。

最后看看 `afterInvocation`：

```java
protected Object afterInvocation(InterceptorStatusToken token, Object returnedObject) {
    if (token == null) {
        // public object
        return returnedObject;
    }
    finallyInvocation(token); // continue to clean in this method for passivity
    if (this.afterInvocationManager != null) {
        // Attempt after invocation handling
        try {
            returnedObject = this.afterInvocationManager.decide(token.getSecurityContext().getAuthentication(),
                                                                token.getSecureObject(), token.getAttributes(), returnedObject);
        }
        catch (AccessDeniedException ex) {
            publishEvent(new AuthorizationFailureEvent(token.getSecureObject(), token.getAttributes(),
                                                       token.getSecurityContext().getAuthentication(), ex));
            throw ex;
        }
    }
    return returnedObject;
}
```

`afterInvocation` 方法接收两个参数，第一个参数 token 就是 `beforeInvocation` 方法的返回值，第二个参数 returnObject 则是受保护对象的返回值。

`afterInvocation` 方法的核心工作就是调用 `afterInvocationManager.decide` 方法对 returnObject 进行过滤，然后将过滤的结果返回。

这就是 `AbstractSecurityInterceptor` 类中三大方法的作用。



#### FilterSecurityInterceptor

当我们使用了基于 URL 地址的权限管理，此时最终使用的是 `AbstractSecurityInterceptor` 的子类 `FilterSecurityInterceptor`，这是一个过滤器。

当我们在 `configure(HttpSecurity)` 方法中调用 `http.authorizeRequests()` 开启 URL 路径拦截规则配置时，就会通过 `AbstractInterceptorUrlConfigurer#configure` 方法将 `FilterSecurityInterceptor` 添加到  Spring Security 过滤器链中。

对于过滤器而言，最重要的当然是 `doFitler` 方法了：

```java
@Override
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
    throws IOException, ServletException {
    invoke(new FilterInvocation(request, response, chain));
}

public void invoke(FilterInvocation filterInvocation) throws IOException, ServletException {
    if (isApplied(filterInvocation) && this.observeOncePerRequest) {
        // filter already applied to this request and user wants us to observe
        // once-per-request handling, so don't re-do security checking
        filterInvocation.getChain().doFilter(filterInvocation.getRequest(), filterInvocation.getResponse());
        return;
    }
    // first time this request being called, so perform security checking
    if (filterInvocation.getRequest() != null && this.observeOncePerRequest) {
        filterInvocation.getRequest().setAttribute(FILTER_APPLIED, Boolean.TRUE);
    }
    InterceptorStatusToken token = super.beforeInvocation(filterInvocation);
    try {
        filterInvocation.getChain().doFilter(filterInvocation.getRequest(), filterInvocation.getResponse());
    }
    finally {
        super.finallyInvocation(token);
    }
    super.afterInvocation(token, null);
}
```

在 doFilter 方法中，首先构建了受保护对象 `FilterInvocation`，然后调用 invoke 方法。

在 invoke 方法中，如果当前过滤器都已经执行过了，则继续执行剩余的过滤器，然后在 finally 代码块中调用父类的 `beforeInvocation` 方法进行权限校验，检验通过后继续执行剩余的过滤器，然后在 finally 代码块中调用父类的 `finallyInvocation` 方法，最后调用父类的 `afterInvocation` 方法，可以看到，前置处理器和后置处理器都是在 invoke 方法中触发的。



#### AbstractInterceptUrlConfigurer

`AbstractInterceptUrlConfigurer` 主要负责创建 `FilterSecurityInterceptor` 对象，`AbstractInterceptUrlConfigurer` 有两个不同的子类，两个子类创建出来的 `FilterSecurityInterceptor` 对象略有差异：

- `ExpressionUrlAuthorizationConfigurer`
- `UrlAuthorizationConfigurer`

通过 `ExpressionUrlAuthorizationConfigurer` 构建出来的 `FilterSecurityInterceptor`，使用的投票器是 `WebExpressionVoter`，使用的权限元数据对象是 `ExpressionBasedFilterInvocationSecurityMetadataSource`，所以它支持权限表达式。

通过 `UrlAuthorizationConfigurer` 构建出来的 `FilterSecurityInterceptor`，使用的投票器是 `RoleVoter` 和 `AuthenticationVoter`，使用的权限元数据对象是 `DefaultFilterInvocationSecurityMetadataSrouce`，所以它不支持权限表达式。

这是两者最主要的区别。

我们在 `configure(HttpSecurity http)` 方法中配置权限，一般是这样的：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {

    http.authorizeRequests()
        .antMatchers("/admin/**").hasRole("ADMIN")
        .antMatchers("/user/**").access("hasAnyRole('USER', 'ADMIN')")
        .antMatchers("/getInfo").hasAuthority("READ_INFO")
        .anyRequest().access("isAuthenticated()")
        .and()
        .formLogin()
        .and()
        .csrf().disable();
}
```

`http.authorizeRequests()` 方法实际上就是通过 `ExpressionUrlAuthorizationConfigurer` 来配置基于 URL 地址的权限管理，所以在配置时可以使用权限表达式。使用 `ExpressionUrlAuthorizationConfigurer` 进行配置，有一个硬性要求，就是至少配置一对 URL 地址和权限之间的映射关系。

如果写成下面这种，就会报错：

```java
http.authorizeRequests()
    .and()
    .formLogin()
    .and()
    .csrf().disable();
```

这个配置中不存在 URL 地址和权限之间的映射关系，在项目启动时会抛出异常。

```
Caused by: java.lang.IllegalStateException: At least one mapping is required (i.e. authorizeRequests().anyRequest().authenticated())
```



如果使用 `UrlAuthorizationConfigurer` 去配置 `FilterSecurityInterceptor`，则不存在此要求，即代码中可以一条映射关系都不用配置，只需要 URL 路径和权限之间的映射关系完整即可，这在动态权限配置中非常有用。

不过在 Spring Security 中，使用 `UrlAuthorizationConfigurer` 去配置 `FilterSecurityInterceptor` 并不像使用 `ExpressionUrlAuthorizationConfigurer` 去配置那么容易，没有现成的方法，需要我们去手动创建：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {

    ApplicationContext applicationContext = http.getSharedObject(ApplicationContext.class);
    http.apply(new UrlAuthorizationConfigurer<>(applicationContext))
        .getRegistry()
        .mvcMatchers("/admin/**").access("ROLE_ADMIN")
        .mvcMatchers("/user/**").access("ROLE_USER");

    http
        .formLogin()
        .and()
        .csrf().disable();
}
```

开发者需要自己创建一个 `UrlAuthorizationConfigurer` 对象出来，并调用其 `getRegistry()` 方法去开启 URL 路径和权限之间的映射关系的配置。由于 `UrlAuthorizationConfigurer` 中使用的投票器是 `RoleVoter` 和 `AuthenticatedVoter`，所以这里的角色需要自带 ROLE_前缀。

使用 `UrlAuthorizationConfigurer` 去配置 `FilterSecurityInterceptor` 时，需要确保映射关系完整，如果像下面这样，就会出错：

```java
@Override
    protected void configure(HttpSecurity http) throws Exception {

        ApplicationContext applicationContext = http.getSharedObject(ApplicationContext.class);
        http.apply(new UrlAuthorizationConfigurer<>(applicationContext))
                        .getRegistry()
                        .mvcMatchers("/admin/**").access("ROLE_ADMIN")
                        .mvcMatchers("/user/**");
        
        http
                .formLogin()
                .and()
                .csrf().disable();
    }
```

没有 /user/** 所需要的权限，此时启动项目就会出错。

另外需要注意，无论是 `ExpressionUrlAuthorizationConfigurer` 还是 `UrlAuthorizationConfigurer` ，对于 `FilterSecurityInterceptor` 的配置来说都在其父类 `AbstractInterceptUrlConfigurer#configure` 方法中，该方法中并未配置后置处理器 `afterInvocationManage`，所以在基于 URL 地址的权限管理中，主要是前置处理器工作。





### (5) 动态管理权限规则

之前的例子中配置的 URL 拦截规则和请求 URL 所需要的权限都是通过代码配置的，这样就比较死板，如果想要调整某一个 URL 所需要的权限，就需要修改代码。

动态管理权限规则就是我们将 URL 拦截规则和访问 URL 所需要的权限都保存在数据库中，这样，在不修改源代码的情况下，只需要修改数据库中的数据，就可以进行权限调整。

#### 数据库设计

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220111113243.png)



menu 表相当于我们的资源表，里面保存了访问规则：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220111113428.png)

role 是角色表，里边定义了系统中的角色，如图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220111113545.png)

user 是用户表，如图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220111113713.png)

user_role 是用户角色关联表，用户具有哪些角色，可以通过该表表现出来：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220111113840.png)

menu_role 是资源角色关联表，访问某一个资源，需要哪些角色，可以通过该表体现出来：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220111114342.png)

至此，一个简易的权限数据库就设计好了。

#### 实战

创建 Spring Boot 项目，由于涉及数据库操作，所以选用常用的 Mybatis 作为 ORM 框架，同时引入 web、security 开发环境。

##### pom.xml：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>

<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>

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

##### application.yml：

```yml
spring:
  datasource:
    username: root
    password: 123456
    url: jdbc:mysql:///spring_security_url?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai

mybatis:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    map-underscore-to-camel-case: true
  type-aliases-package: com.naivekyo.springsecurity10urlauthoritymanagement.entity
  mapper-locations: classpath:/mapper/*.xml
```

注意 mapper 位置。

##### 实体类

创建角色类：

```java
@Getter
@Setter
@Accessors(chain = true)
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    
    private Integer id;
    
    private String name;
    
    private String nameZh;
    
}
```

创建菜单类：

```java
@Getter
@Setter
@Accessors(chain = true)
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class Menu {
    
    private Integer id;
    
    private String pattern;
    
    private List<Role> roles;
    
}
```

菜单类中包含一个 roles 属性，表示访问该项资源所需要的角色。

最后创建用户类：

```java
@Getter
@Setter
@Accessors(chain = true)
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    
    private Integer id;
    
    private String username;
    
    private String password;
    
    private boolean enabled;
    
    private boolean locked;
    
    private List<Role> roles;
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        
        return roles.stream()
                .map(r -> new SimpleGrantedAuthority(r.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !this.locked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.enabled;
    }
}
```

注意数据库有 enabled 和 locked 字段，而其他几个账户状态默认返回 true 即可。

在 `getAuthorities()` 方法中，我们对 roles 属性进行遍历，组装成新的集合对象返回即可。

##### Service

创建 UserDetailsServiceImpl 和 MenuService，并提供相应的查询方法：

先看看 `UserDetailsServiceImpl`

```java
@Service("userDetailsService")
public class UserDetailsServiceImpl implements UserDetailsService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = this.userMapper.loadUserByUsername(username);
        
        if (user == null)
            throw new UsernameNotFoundException("用户名或密码输入错误!");
        
        user.setRoles(this.userMapper.getUserRoleByUid(user.getId()));
        
        return user;
    }
    
}
```

对应的 UserMapper 如下：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.naivekyo.springsecurity10urlauthoritymanagement.mapper.UserMapper">


    <select id="loadUserByUsername"
            resultType="com.naivekyo.springsecurity10urlauthoritymanagement.entity.User">
        select id, username, password, enabled, locked from `user` where username = #{username};
    </select>
    
    <select id="getUserRoleByUid" resultType="com.naivekyo.springsecurity10urlauthoritymanagement.entity.Role">
        select `r`.id, `r`.name, `r`.nameZh
        from user as `u`
        inner join user_role as `ur` on `u`.id = `ur`.uid
        inner join `role` as `r` on `ur`.rid = `r`.id
        where `u`.id = #{uid};
    </select>
    
</mapper>
```



在看看 `MenuService` ，该类只需要提供一个方法，就是查询出所有的 Menu 数据：

```java
public interface MenuService {
    
    List<Menu> getAllMenu();
}

@Service
public class MenuServiceImpl implements MenuService {
    
    @Autowired
    private MenuMapper mapper;
    
    @Override
    public List<Menu> getAllMenu() {
        return this.mapper.getAllMenu();
    }
    
}
```

`MenuMapper.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.naivekyo.springsecurity10urlauthoritymanagement.mapper.MenuMapper">

    <resultMap id="MenuResultMap" type="Menu">
        <id property="id" column="id" />
        <result property="pattern" column="pattern" />
        <collection property="roles" ofType="Role">
            <id property="id" column="rid" />
            <result property="name" column="rname" />
            <result property="nameZh" column="rnameZh" />
        </collection>
    </resultMap>
    
    <select id="getAllMenu" resultMap="MenuResultMap">
        select `m`.id, `m`.pattern, `r`.id as rid, `r`.name as rname, `r`.nameZh as rnameZh
        from menu as `m`
        left join menu_role as `mr` on `m`.id = `mr`.mid
        left join `role` as `r` on `r`.id = `mr`.rid
    </select>
    
</mapper>
```

需要注意的是，每一个 Menu 对象都包含了一个 Role 集合，所以这个查询是一对多，这里通过 resultMap 来进行查询结果映射。

##### 配置 Spring Security

之前分析过，`SecurityMetadataSource` 接口负责提供受保护对象所需要的权限，在本案例中，受保护对象所需要的权限存储在数据库中，所以我们可以通过自定义类继承自 `FilterInvocationSecurityMetadataSource` 并重写 `getAttributes` 方法来提供受保护对象所需要的权限：

```java
@Component
public class CustomSecurityMetadataSource implements FilterInvocationSecurityMetadataSource {
    
    @Autowired
    private MenuService menuService;
    
    AntPathMatcher antPathMatcher = new AntPathMatcher();
    
    @Override
    public Collection<ConfigAttribute> getAttributes(Object object) throws IllegalArgumentException {
        
        String requestURI = ((FilterInvocation) object).getRequest().getRequestURI();

        List<Menu> allMenu = this.menuService.getAllMenu();

        for (Menu menu : allMenu) {
            
            if (antPathMatcher.match(menu.getPattern(), requestURI)) {
                
                String[] roles = menu.getRoles().stream()
                        .map(Role::getName).toArray(String[]::new);
                return SecurityConfig.createList(roles);
            }
        }
        
        return null;
    }

    @Override
    public Collection<ConfigAttribute> getAllConfigAttributes() {
        return null;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return FilterInvocation.class.isAssignableFrom(clazz);
    }
}
```

自定义 `CustomSecurityMetadataSource` 类并实现 `FilterInvocationSecurityMetadataSource` 接口，然后重写里面的三个方法：

- `getAttributes`：该方法的参数是受保护对象，在基于 URL 地址的权限控制中，受保护对象就是 `FitlerInvocation`，该方法的返回值则是访问受保护对象所需要的权限。在该方法中，我们首先从受保护对象 `FitlerInvocation` 中提取出当前请求的 URL 地址，例如 `/admin/hello`，然后通过 menuService 对象查询出所有的菜单数据（每条数据中都包含访问该条记录所需要的权限），遍历查询出来的菜单数据，如果当前请求的 URL 地址和菜单中某一条记录的 pattern 属性匹配上了（例如 `/admin/hello` 匹配上 `/admin/**`），那么我们就可以获取当前请求所需要的权限。从 menu 对象中获取 roles 属性，将其转换为一个数组，然后通过 `SecurityConfig.createList` 方法创建一个 `Collection<ConfigAttribute>` 对象并返回。如果当前请求的 URL 地址和数据库中 menu 表的所有项都匹配不上，那么最终返回 null。如果返回 null，那么受保护对象究竟能不能访问呢？这就要看 `AbstractSecurityInterceptor` 对象中的 `rejectPublicInvocations` 属性了，该属性默认 false，表示当 `getAttributes` 方法返回 null 时，允许访问受保护对象。
- `getAllConfigAttributes`：该方法可以用来返回所有的权限属性，以便在项目启动阶段做校验，如果不需要校验，则直接返回 null 即可。
- `supports`：该方法表示当前对象支持处理的受保护对象是 `FilterInvocation`。

`CustomSecurityMetadataSource` 类配置完成后，接下来我们要用它代替默认的 `SecurityMetadataSource` 对象，具体配置如下：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Autowired
    private CustomSecurityMetadataSource customSecurityMetadataSource;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        
        auth.userDetailsService(this.userDetailsService);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        ApplicationContext applicationContext = http.getSharedObject(ApplicationContext.class);
        http.apply(new UrlAuthorizationConfigurer<>(applicationContext))
                        .withObjectPostProcessor(new ObjectPostProcessor<FilterSecurityInterceptor>() {
                            @Override
                            public <O extends FilterSecurityInterceptor> O postProcess(O object) {
                                object.setSecurityMetadataSource(customSecurityMetadataSource);
                                return object;
                            }
                        });
        
        http.formLogin()
                .and()
                .csrf().disable();
    }
}
```

关于用户配置无需多言，我们重点看 `configure(HttpSecurity http)` 方法。

由于访问路径规则和所需要的权限之间的映射关系已经保存到数据库中，所以我们就没有必要再 Java 代码中配置映射关系了，同时这里的权限对比也不会用到权限表达式，所以我们通过 `UrlAuthorizationConfigurer` 来进行配置。

在配置过程中，通过 `withObjectPostProcessor` 方法调用 `ObjectPostProcessor` 对象后置处理器，将 `FilterSecurityInterceptor` 中的 `SecurityMetadataSource` 对象替换为我们自定义的 `customSecurityMetadataSource` 对象即可。

##### 测试

创建 `HelloController`，代码如下：

```java
@RestController
public class HelloController {
    
    @GetMapping("/admin/hello")
    public String admin() {
        return "hello admin";
    }
    
    @GetMapping("/user/hello")
    public String user() {
        return "hello user";
    }

    @GetMapping("/guest/hello")
    public String guest() {
        return "hello guest";
    }
    
    @GetMapping("/hello")
    public String hello() {
        return "hello";
    }
}
```

启动项目进行测试：

- 首先使用 `admin/123456` 进行登录，该账户具有 `ROLE_ADMIN` 角色，可以访问 `/admin/hello`、`/user/hello` 以及 `/guest/hello`；
- 接下来使用 `user/123456` 进行登录，该账户具有 `ROLE_USER` 角色，可以访问 `/user/hello` 以及 `/guest/hello` 两个接口；
- 最后使用 `naivekyo/123456` 进行登录，该账户具有 `ROLE_GUEST` 角色，可以访问 `/guest/hello` 接口。

由于 `/hello` 接口不包含在 URL-权限映射关系中，所以任何用户都可以访问 `/hello` 接口，包括匿名用户。

如果希望所有的 URL 地址都必须在数据库中配置 URL-权限映射关系后才能访问，那么可以通过如下配置实现：

```java
http.apply(new UrlAuthorizationConfigurer<>(applicationContext))
    .withObjectPostProcessor(new ObjectPostProcessor<FilterSecurityInterceptor>() {
        @Override
        public <O extends FilterSecurityInterceptor> O postProcess(O object) {
            object.setSecurityMetadataSource(customSecurityMetadataSource);
            // 设置如下
            object.setRejectPublicInvocations(true);
            return object;
        }
    });
```

通过设置 `FilterSecurityInterceptor` 的 `rejectPublicInvocations` 属性为 true，就可以关闭 URL 的公开访问，所有 URL 必须具备相应的权限才可以访问。



## 5、基于方法的权限管理

基于方法的权限管理主要是通过 AOP 来实现的，Spring Security 中通过 `MethodSecurityInterceptor` 来提供相关的实现。不同在于 `FilterSecurityInterceptor` 只是在请求之前进行前置处理，`MethodSecurityInterceptor` 除了前置处理之外还可以进行后置处理。前置处理就是在请求之前判断是否具备相应的权限，后置处理则是对方法的执行结果进行二次过滤。前置处理和后置处理分别对应了不同的实现类。



### (1) 注解介绍

目前在 Spring Boot 中基于方法的权限管理主要是通过注解来实现的，我们需要通过 `@EnableGlobalMethodSecurity` 注解来开启权限注解的使用，用法如下：

```java
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {
}
```

这个注解中我们设置了三个属性：

- `prePostEnabled`：开启 Spring Security 提供的四个权限注解：`@PostAuthorize`、`@PostFilter`、`@PreAuthorize` 以及 `@PreFilter`，这四个注解支持权限表达式，功能比较丰富；
- `securedEnabled`：开启 Spring Security 提供的 `@Secured` 注解，该注解不支持权限表达式；
- `jsr250Enabled`：开启 JSR-250 提供的注解，主要包括 `@DenyAll`、`@PermitAll` 以及 `@RolesAllowed` 三个注解，这些注解也不支持权限表达式。

注解含义如下：

- `PostAuthorize`：在目标方法执行之后进行权限校验；
- `@PostFilter`：在目标方法执行之后对方法的返回结果进行过滤；
- `@PreAuthorize`：在目标方法执行之前进行权限校验；
-  `@PreFilter`：在目标方法执行之前对方法参数进行过滤；
- `@Secured`：访问目标方法必须具备相应的角色；
- `@DenyAll`：拒绝所有访问；
- `@PermitAll`：允许所有访问；
- `@RolesAllowed` ：访问目标方法必须具备相应的角色；

这些基于方法的权限管理相关的注解，一般来说只需要配置 `prePostEnabled = true` 就够用了。

另外还有一种比较 "古老" 的方法配置基于方法的权限管理，那就是通过 XML 文件配置方法拦截规则，目前已经很少使用 XML 文件来配置 Spring Security 了，官网文档：https://docs.spring.io/spring-security/site/docs/5.4.0/reference/html5/#aop-alliance



### (2) 基本用法

创建一个 Spring Boot 项目，引入 Web 和 Spring Security 依赖，添加以下配置文件：

```java
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {
}
```

这里直接使用单元测试进行验证，不再进行额外的配置，通过 `@EnableGlobalMethodSecurity` 注解开启其他权限注解的使用即可。

创建一个 User 类以备后续使用：

```java
public class User {
    
    private Integer id;
    
    private String username;
    
	public User() {
    }

    public User(Integer id, String username) {
        this.id = id;
        this.username = username;
    }
    
    // 省略 getter 和 setter
    
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                '}';
    }
}
```

#### @PreAuthorize

`@PreAuthorize` 可以在目标方法执行之前对其进行安全校验，在安全校验时，可以直接使用权限表达式，例如可以定义如下方法：

```java
@Service
public class HelloService {
    
    @PreAuthorize("hasRole('ADMIN')")
    public String hello() {
        return "hello";
    }
}
```

这里使用权限表达式 `hasRole()`，表示执行方法必须具备 ADMIN 角色才可以访问，否则不可以访问。

测试：

导入 junit 中的断言：`import static org.junit.jupiter.api.Assertions.*;`

```java
@Test
@WithMockUser(roles = "ADMIN")
void preauthorizeTest01() {

    String hello = this.helloService.hello();

    assertNotNull(hello);
    assertEquals("hello", hello);
}
```

通过 `@WithMockUser(roles = "ADMIN")` 注解设定当前执行的用户角色是 ADMIN，然后调用 `helloService` 中的方法进行测试即可。如果将用户角色设置为其他字符，那么单元测试就不会通过。

当然，这里除了 `hasRole` 表达式外，还可以使用其他权限表达式，包括我们自定义的表达式，也可以同时使用多个表达式：

```java
@PreAuthorize("hasRole('ADMIN') and authentication.name == 'naivekyo'")
public String hello() {
    return "hello";
}
```

测试代码：

```java
@Test
@WithMockUser(roles = "ADMIN", username = "naivekyo")
void preauthorizeTest02() {

    String hello = this.helloService.hello();

    assertNotNull(hello);
    assertEquals("hello", hello);
}
```

在 `@PreAuthorize` 注解中，还可以通过 # 引用方法的参数，并对其进行校验，例如如下方法表示请求者的用户名必须等于方法的参数 name 的值，方法才可以被执行：

```java
@PreAuthorize("authentication.name == #name")
public String hello1(String name) {
    return "hello: " + name;
}
```

测试方法：

```java
@Test
@WithMockUser(username = "naivekyo")
void preauthorizeTest03() {

    String hello = this.helloService.hello1("naivekyo");

    assertNotNull(hello);
    assertEquals("hello: naivekyo", hello);
}
```



#### @PreFilter

`@PreFilter` 主要是对方法的请求参数进行过滤，它里边包含了一个内置对象 `filterObject` 表示要过滤的参数，如果方法只有一个参数，则内置的 `filterObject` 对象就代表该参数，如果方法有多个参数，则需要通过 `filterTarget` 来指定 `filterObject` 到底代表哪个对象：

```java
@PreFilter(value = "filterObject.id % 2 != 0", filterTarget = "users")
public void addUsers(List<User> users, Integer other) {
    System.out.println("users = " + users);
}
```

上面的代码表示对方法参数 users 进行过滤，将 id 为 奇数的 user 保留。

测试：

```java
@Test
@WithMockUser(username = "naivekyo")
void preFilterTest01() {

    ArrayList<User> users = new ArrayList<>();
    for (int i = 0; i < 10; i++) {
        users.add(new User(i, "naivekyo:" + i));
    }

    this.helloService.addUsers(users, 99);
}
```

执行单元测试，可以看到控制台打印了 id 为奇数的 user 对象。



#### @PostAuthorize

`@PostAuthorize` 是在目标方法执行之后进行权限校验。

这个主要是在 ACL 权限模型中会用到，目标方法执行完毕后，通过 `@PostAuthorize` 注解去校验目标方法的返回值是否满足相应的权限要求。

从技术角度上将，`@PostAuthorize` 注解中也可以使用权限表达式，但是在实际开发中权限表达式一般都是结合 `@PreAuthorize` 注解一起使用的。

`@PostAuthorize` 包含一个内置对象 `returnObject`，表示方法的返回值，开发者可以对返回值进行校验：

```java
@PostAuthorize("returnObject.id == 1")
public User getUserById(Integer id) {
    return new User(id, "naivekyo");
}
```

测试：

```java
@Test
@WithMockUser(username = "naivekyo")
void postAuthorizeTest01 () {

    User user = this.helloService.getUserById(1);

    assertNotNull(user);
    assertEquals(1, user.getId());
    assertEquals("naivekyo", user.getUsername());
}
```



#### @PostFilter

`@PostFilter` 注解在目标方法执行之后，对目标方法的返回结果进行过滤，该注解中包含了一个内置对象 `filterObject`，表示目标方法返回的集合/数组中的具体元素：

```java
@PostFilter("filterObject.id % 2 == 0")
public List<User> getAll() {
    ArrayList<User> users = new ArrayList<>();
    for (int i = 0; i < 10; i++) {
        users.add(new User(i, "naivekyo:" + i));
    }

    return users;
}
```

测试：

```java
@Test
@WithMockUser(username = "naivekyo")
void postFilterTest01 () {

    List<User> users = this.helloService.getAll();

    assertNotNull(users);
    assertEquals(5, users.size());
    assertEquals(2, users.get(1).getId());
}
```



#### @Secured

`@Secured` 注解也是 Spring Security 提供的权限注解，不同于前面四个注解，该注解不支持权限表达式，只能做一些简单的权限描述：

```java
@Secured({"ROLE_ADMIN", "RULE_USER"})
public User getUserByUsername(String username) {
    return new User(99, username);
}
```

该段代码表示用户需要具备 ROLE_ADMIN 和 ROLE_USER 角色，才能访问该方法。

测试：

```java
@Test
@WithMockUser(roles = "ADMIN")
void securedTest01 () {

    User user = this.helloService.getUserByUsername("naivekyo");

    assertNotNull(user);
    assertEquals(99, user.getId());
    assertEquals("naivekyo", user.getUsername());
}
```

注意这里不需要添加 ROLE_ 前缀，系统会自动添加



#### @DenyAll 和 @PermitAll

`@DenyAll` 和 `@PermitAll` 是 JSR-250 提供的方法注解，表示拒绝所有访问和允许所有访问。

比较简单，就不测试了。



#### @RolesAllowed

`@RolesAllowed` 也是 JSR-250 提供的注解，可以添加在方法或者类上，当添加在类上时，表示该注解对类中所有方法都生效；

如果类和方法上都有该注解，并且起冲突，则以方法上的注解为准。

```java
@RolesAllowed({"ADMIN", "USER"})
public String rolesAllowed() {
    return "RolesAllowed";
}
```

访问该方法需要 ADMIN 或者 USER 角色

测试：

```java
@Test
@WithMockUser(roles = "ADMIN")
void rolesAllowedTest01 () {

    String s = this.helloService.rolesAllowed();

    assertNotNull(s);
    assertEquals("RolesAllowed", s);
}
```



### (3) 原理剖析

#### MethodSecurityInterceptor

之前分析过 `AbstractSecurityInterceptor` 的三大方法，当我们基于 URL 请求地址进行权限控制时，使用的 `AbstractSecurityInterceptor` 实现类是 `FilterSecurityInterceptor`，而当我们基于方法进行权限控制时，使用的 `AbstractSecurityInterceptor` 的实现类是 `MethodSecurityInterceptor`。

`MethodSecurityInterceptor` 提供了基于 AOP Alliance 的方法拦截，该拦截器中所使用的 `SecurityMetadataSource` 类型为 `MethodSecurityMetadataSource`。

`MethodSecurityInterceptor` 中最重要的是 invoke 方法：

```java
@Override
public Object invoke(MethodInvocation mi) throws Throwable {
    InterceptorStatusToken token = super.beforeInvocation(mi);
    Object result;
    try {
        result = mi.proceed();
    }
    finally {
        super.finallyInvocation(token);
    }
    return super.afterInvocation(token, result);
}
```

invoke 方法的逻辑非常清晰。首先调用父类的 `beforeInvocation` 方法进行权限校验，校验通过后，调用 `mi.proceed()` 方法继续执行目标方法，然后在 finally 块中调用 `finallyInvocation` 方法完成一些清理工作，最后调用父类的 `afterInvocation` 方法进行请求结果过滤。

之前介绍过 `FilterSecurityInterceptor` 是通过 `ExpressionUrlAuthorizationConfigurer` 或者 `UrlAuthorizationConfigurer` 进行配置的，那么 `MethodSecurityInterceptor` 又是通过谁配置的呢？

在前面的配置中，我们使用到了 `EnableGlobalMethodSecurity` 注解，所以以该注解为线索展开分析：

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import({ GlobalMethodSecuritySelector.class })
@EnableGlobalAuthentication
@Configuration
public @interface EnableGlobalMethodSecurity {
    // 省略
}
```

从该类的定义中可以看到它引入了一个配置类 `GlobalMethodSecuritySelector`，该类的作用主要是用来导入外部配置类：

```java
final class GlobalMethodSecuritySelector implements ImportSelector {

	@Override
	public String[] selectImports(AnnotationMetadata importingClassMetadata) {
		Class<EnableGlobalMethodSecurity> annoType = EnableGlobalMethodSecurity.class;
		Map<String, Object> annotationAttributes = importingClassMetadata.getAnnotationAttributes(annoType.getName(),
				false);
		AnnotationAttributes attributes = AnnotationAttributes.fromMap(annotationAttributes);
		Class<?> importingClass = ClassUtils.resolveClassName(importingClassMetadata.getClassName(),
				ClassUtils.getDefaultClassLoader());
		boolean skipMethodSecurityConfiguration = GlobalMethodSecurityConfiguration.class
				.isAssignableFrom(importingClass);
		AdviceMode mode = attributes.getEnum("mode");
		boolean isProxy = AdviceMode.PROXY == mode;
		String autoProxyClassName = isProxy ? AutoProxyRegistrar.class.getName()
				: GlobalMethodSecurityAspectJAutoProxyRegistrar.class.getName();
		boolean jsr250Enabled = attributes.getBoolean("jsr250Enabled");
        
		List<String> classNames = new ArrayList<>(4);
		if (isProxy) {
			classNames.add(MethodSecurityMetadataSourceAdvisorRegistrar.class.getName());
		}
		classNames.add(autoProxyClassName);
		if (!skipMethodSecurityConfiguration) {
			classNames.add(GlobalMethodSecurityConfiguration.class.getName());
		}
		if (jsr250Enabled) {
			classNames.add(Jsr250MetadataSourceConfiguration.class.getName());
		}
		return classNames.toArray(new String[0]);
	}

}
```

这里只有一个 `selectImports` 方法，该方法的参数 `importingClassMetadata` 中保存了 `@EnableGlobalMethodSecurity` 注解的元数据，包括各个属性的值、注解是加在哪个配置类上等等。

`selectImports` 逻辑比较简单，要导入的外部配置类主要有如下几种：

- `MethodSecurityMetadataSourceAdvisorRegistrar`：如果使用的是 Spring 自带的 AOP，则该配置类会被导入。该类主要用来向 Spring 容器中注册一个 `MethodSecurityMetadataSourceAdvisor` 对象，这个对象中定义了 AOP 中的 pointcut 和 advice；
- `autoProxyClassName`：注册自动代理创建者，根据不同的代理模式而定；
- `GlobalMethodSecurityConfiguration`：这个配置类用来提供 `MethodSecurityMetadataSource` 和 `MethodInterceptor` 两个关键对象。如果开发者自定义配置类继承自 `GlobalMethodSecurityConfiguration`，则这里不会导入这个外部配置类；
- `Jsr250MetadataSourceConfiguration`：如果开启了 JSR-250 注解，则会导入该配置类。该配置类主要用来提供 JSR-250 注解所需的 `Jsr250MethodSecurityMetadataSource` 对象。

这四个导入的外部配置类中，`MethodSecurityMetadataSourceAdvisorRegistrar` 是用来配置 `MethodSecurityMetadataSourceAdvisor` 的，而 `MethodSecurityMetadataSourceAdvisor` 则提供了 AOP 所需的 pointcut 和 advice。先来看看 `MethodSecurityMetadataSourceAdvisorRegistrar` :

```java
class MethodSecurityMetadataSourceAdvisorRegistrar implements ImportBeanDefinitionRegistrar {
	@Override
	public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
		BeanDefinitionBuilder advisor = BeanDefinitionBuilder
				.rootBeanDefinition(MethodSecurityMetadataSourceAdvisor.class);
		advisor.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
		advisor.addConstructorArgValue("methodSecurityInterceptor");
		advisor.addConstructorArgReference("methodSecurityMetadataSource");
		advisor.addConstructorArgValue("methodSecurityMetadataSource");
		MultiValueMap<String, Object> attributes = importingClassMetadata
				.getAllAnnotationAttributes(EnableGlobalMethodSecurity.class.getName());
		Integer order = (Integer) attributes.getFirst("order");
		if (order != null) {
			advisor.addPropertyValue("order", order);
		}
		registry.registerBeanDefinition("metaDataSourceAdvisor", advisor.getBeanDefinition());
	}

}
```

在 `registerBeanDefinitions` 方法中，首先定义了 `BeanDefinitionBuilder`，然后给目标对象 

`MethodSecurityMetadataSourceAdvisor` 的构造方法设置参数，参数一共有三个：

- 第一个是要引用的 `MethodInterceptor` 对象名；
- 第二个是要引用的 `MethodSecurityMetadataSource` 对象名；
- 第三个参数和第二个参数一样，只不过一个是引用，一个是字符串。

所有属性都配置好之后，将其注册到 Spring 容器中。

再看看 `MethodSecurityMetadataSourceAdvisor`：

```java
public class MethodSecurityMetadataSourceAdvisor extends AbstractPointcutAdvisor implements BeanFactoryAware {

	private transient MethodSecurityMetadataSource attributeSource;

	private transient MethodInterceptor interceptor;

	private final Pointcut pointcut = new MethodSecurityMetadataSourcePointcut();

	private BeanFactory beanFactory;

	private final String adviceBeanName;

	private final String metadataSourceBeanName;

	private transient volatile Object adviceMonitor = new Object();

	public MethodSecurityMetadataSourceAdvisor(String adviceBeanName, MethodSecurityMetadataSource attributeSource,
			String attributeSourceBeanName) {
        
		this.adviceBeanName = adviceBeanName;
		this.attributeSource = attributeSource;
		this.metadataSourceBeanName = attributeSourceBeanName;
	}

	@Override
	public Pointcut getPointcut() {
		return this.pointcut;
	}

	@Override
	public Advice getAdvice() {
		synchronized (this.adviceMonitor) {
				this.interceptor = this.beanFactory.getBean(this.adviceBeanName, MethodInterceptor.class);
			}
			return this.interceptor;
		}
	}

	@Override
	public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
		this.beanFactory = beanFactory;
	}

	private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
		ois.defaultReadObject();
		this.adviceMonitor = new Object();
		this.attributeSource = this.beanFactory.getBean(this.metadataSourceBeanName,
				MethodSecurityMetadataSource.class);
	}

	class MethodSecurityMetadataSourcePointcut extends StaticMethodMatcherPointcut implements Serializable {

		@Override
		public boolean matches(Method m, Class<?> targetClass) {
			MethodSecurityMetadataSource source = MethodSecurityMetadataSourceAdvisor.this.attributeSource;
			return !CollectionUtils.isEmpty(source.getAttributes(m, targetClass));
		}

	}

}
```

`MethodSecurityMetadataSourceAdvisor` 继承自 `AbstractPointcutAdvisor`，主要定义了 AOP 的 pointcut 和 advice。`MethodSecurityMetadataSourceAdvisor` 构造方法所需的三个参数就是前面说的注入的那三个参数。

pointcut 也就是切点，可以简单理解为方法的拦截规则，即哪些方法需要拦截，哪些方法不需要拦截。不用看代码也知道，加了权限注解的方法需要拦截下来，每加权限注解的方法则不需要拦截。

这里的 pointcut 对象就是内部类 `MethodSecurityMetadataSourcePointcut`，在它的 matches 方法中，定义了具体的拦截规则。通过 `attributeSource.getAttributes` 方法去查看目标方法上有没有相应的权限注解，如果有，则返回 true，目标方法就被拦截下来；如果没有，就返回 false，目标方法就不会被拦截。

这里的 `attributeSource` 实际上就是 `MethodSecurityMetadataSource` 对象，也就是之前分析的提供权限元数据的类。

advice 也就是增强/通知，就是将方法拦截下来之后要增强的功能。advice 由 `getAdvice()` 方法返回，在该方法内部，就是去 Spring 容器中查找一个名为 `methodSecurityInterceptor` 的 `MethodInterceptor` 对象，这就是 advice。

现在搞清楚了 AOP 的增强/通知是如何定义的了，这里涉及到两个关键对象：

- 一个名为 `methodSecurityInterceptor` 的 `MethodInterceptor` 对象；
- 一个名为 `methodSecurityMetadataSource` 的 `MethodSecurityMetadataSource` 对象。

这两个关键对象在 `GlobalMethodSecurityConfiguration` 类中定义，相关方法比较长，先看看 `methodSecurityMetadataSource` 对象的定义：

```java
@Bean
@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
public MethodSecurityMetadataSource methodSecurityMetadataSource() {
    List<MethodSecurityMetadataSource> sources = new ArrayList<>();
    ExpressionBasedAnnotationAttributeFactory attributeFactory = new ExpressionBasedAnnotationAttributeFactory(
        getExpressionHandler());
    MethodSecurityMetadataSource customMethodSecurityMetadataSource = customMethodSecurityMetadataSource();
    if (customMethodSecurityMetadataSource != null) {
        sources.add(customMethodSecurityMetadataSource);
    }
    boolean hasCustom = customMethodSecurityMetadataSource != null;
    boolean isPrePostEnabled = prePostEnabled();
    boolean isSecuredEnabled = securedEnabled();
    boolean isJsr250Enabled = jsr250Enabled();
    Assert.state(isPrePostEnabled || isSecuredEnabled || isJsr250Enabled || hasCustom,
                 "In the composition of all global method configuration, "
                 + "no annotation support was actually activated");
    if (isPrePostEnabled) {
        sources.add(new PrePostAnnotationSecurityMetadataSource(attributeFactory));
    }
    if (isSecuredEnabled) {
        sources.add(new SecuredAnnotationSecurityMetadataSource());
    }
    if (isJsr250Enabled) {
        GrantedAuthorityDefaults grantedAuthorityDefaults = getSingleBeanOrNull(GrantedAuthorityDefaults.class);
        Jsr250MethodSecurityMetadataSource jsr250MethodSecurityMetadataSource = this.context
            .getBean(Jsr250MethodSecurityMetadataSource.class);
        if (grantedAuthorityDefaults != null) {
            jsr250MethodSecurityMetadataSource.setDefaultRolePrefix(grantedAuthorityDefaults.getRolePrefix());
        }
        sources.add(jsr250MethodSecurityMetadataSource);
    }
    return new DelegatingMethodSecurityMetadataSource(sources);
}
```

可以看到，这里首先创建了一个 List 集合，用来保存所有的 `MethodSecurityMetadataSource` 对象，然后调用 `customMethodSecurityMetadataSource()` 方法去获取自定义的 `MethodSecurityMetadataSource`，默认情况下返回 null，如果项目有需要，开发者可以重写 ``customMethodSecurityMetadataSource()` 方法来提供自定义的 `MethodSecurityMetadataSource`对象。

接下来就是根据注解中配置的属性值，来向 sources 集合中添加相应的 `MethodSecurityMetadataSource`对象：

- 如果 `@EnableGlobalMethodSecurity` 注解配置了 `prePostEnabled=true`，则加入 `PrePostAnnotationSecurityMetadataSource` 对象来解析相应的注解；
- 如果 `@EnableGlobalMethodSecurity` 注解配置了 `securedEnabled=true`，则加入 `SecuredAnnotationSecurityMetadataSource` 对象来解析相应的注解；
- 如果 `@EnableGlobalMethodSecurity` 注解配置了 `jsr250Enabled=true`，则加入 `Jsr250MethodSecurityMetadataSource` 对象来解析相应的注解；
- 最后构建一个代理对象 `DelegatingMethodSecurityMetadataSource` 返回即可。

可以看到，默认提供的 `MethodSecurityMetadataSource` 其实是一个代理对象，它包含多个不同的 `MethodSecurityMetadataSource` 实例。

回顾前面切点定义，在判断一个方法是否需要被拦截下来时，由这些被代理的对象逐个去解析目标方法是否含有相应注解，如果有，请求就会被拦截下来。



再看看 `MethodInterceptor` 的定义：

```java
@Bean
public MethodInterceptor methodSecurityInterceptor(MethodSecurityMetadataSource methodSecurityMetadataSource) {
    this.methodSecurityInterceptor = isAspectJ() ? new AspectJMethodSecurityInterceptor()
        : new MethodSecurityInterceptor();
    this.methodSecurityInterceptor.setAccessDecisionManager(accessDecisionManager());
    this.methodSecurityInterceptor.setAfterInvocationManager(afterInvocationManager());
    this.methodSecurityInterceptor.setSecurityMetadataSource(methodSecurityMetadataSource);
    RunAsManager runAsManager = runAsManager();
    if (runAsManager != null) {
        this.methodSecurityInterceptor.setRunAsManager(runAsManager);
    }
    return this.methodSecurityInterceptor;
}

protected AccessDecisionManager accessDecisionManager() {
    List<AccessDecisionVoter<?>> decisionVoters = new ArrayList<>();
    if (prePostEnabled()) {
        ExpressionBasedPreInvocationAdvice expressionAdvice = new ExpressionBasedPreInvocationAdvice();
        expressionAdvice.setExpressionHandler(getExpressionHandler());
        decisionVoters.add(new PreInvocationAuthorizationAdviceVoter(expressionAdvice));
    }
    if (jsr250Enabled()) {
        decisionVoters.add(new Jsr250Voter());
    }
    RoleVoter roleVoter = new RoleVoter();
    GrantedAuthorityDefaults grantedAuthorityDefaults = getSingleBeanOrNull(GrantedAuthorityDefaults.class);
    if (grantedAuthorityDefaults != null) {
        roleVoter.setRolePrefix(grantedAuthorityDefaults.getRolePrefix());
    }
    decisionVoters.add(roleVoter);
    decisionVoters.add(new AuthenticatedVoter());
    return new AffirmativeBased(decisionVoters);
}

protected AfterInvocationManager afterInvocationManager() {
    if (prePostEnabled()) {
        AfterInvocationProviderManager invocationProviderManager = new AfterInvocationProviderManager();
        ExpressionBasedPostInvocationAdvice postAdvice = new ExpressionBasedPostInvocationAdvice(
            getExpressionHandler());
        PostInvocationAdviceProvider postInvocationAdviceProvider = new PostInvocationAdviceProvider(postAdvice);
        List<AfterInvocationProvider> afterInvocationProviders = new ArrayList<>();
        afterInvocationProviders.add(postInvocationAdviceProvider);
        invocationProviderManager.setProviders(afterInvocationProviders);
        return invocationProviderManager;
    }
    return null;
}
```

`MethodInterceptor` 的创建，首先看代理方式，默认使用 Spring 自带的 AOP，所以使用 `MethodSecurityInterceptor` 来创建对应的 `MethodInterceptor` 实例。

然后给 `methodSecurityInterceptor` 对象设置 `AccessDecisionManager` 决策管理器，默认的决策管理器是 `AffirmativeBased`，根据 `@EnabledGlobalMethodSecurity` 注解的配置，再角色管理器中配置不同的投票器；

接下来给 `methodSecurityInterceptor` 配置后置处理器，如果 `@EnabledGlobalMethodSecurity` 注解配置了 `prePostEnabled=true`，则添加一个后置处理器 `PostInvocationAdviceProvider`，该类用来处理 `@PostAuthorize` 和 `@PostFilter` 两个注解；

最后再把前面创建好的 `MethodSecurityMetadataSource` 对象配置给 `methodSecurityInterceptor`。

至于 `methodSecurityInterceptor` 的工作逻辑，之前已经分析过了。