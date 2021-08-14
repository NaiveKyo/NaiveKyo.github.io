---
title: SpringBoot Integrated Cache
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210723091053.jpg'
coverImg: /img/20210723091053.jpg
toc: true
date: 2021-08-12 16:20:38
top: true
cover: true
summary: 浅析 SpringBoot 集成缓存。
categories:
 - SpringBoot
 - [SpringBoot, Cache]
keywords: [SpringBoot, Cache]
tags: [SpringBoot, Cache]
---



# SpringBoot 集成缓存

## 一、开启缓存支持

在 springboot 的官方文档中 https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.caching

点出了:

> The Spring Framework provides support for transparently adding caching to an application. At its core, the abstraction applies caching to methods, thus reducing the number of executions based on the information available in the cache. The caching logic is applied transparently, without any interference to the invoker. Spring Boot auto-configures the cache infrastructure as long as caching support is enabled via the `@EnableCaching` annotation.

 

首先我们需要使用 `@EnableCaching` 这个注解去开启缓存，它可以放在两个地方：

- SpringBoot 的主启动器上，全局开启缓存
- 第三方缓存的配置类上，比如说 RedisConfig 配置类上标注该注解



开启缓存后便可以使用 Spring 中支持缓存的相关注解：

- JSR-107（JCache）
- Spring Cache
- **注意两者不要混合在一起使用**



### @EnableCaching 浅析

[springframework @EnableCaching   javadoc](https://docs.spring.io/spring-framework/docs/5.3.9/javadoc-api/org/springframework/cache/annotation/EnableCaching.html)

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(CachingConfigurationSelector.class)
public @interface EnableCaching {
  	// 是否被 CGLIB 代理, 默认为 false， 且生效的前提是 mode 为 AdviceMode.PROXY 
  	boolean proxyTargetClass() default false;
  
  	// 代理的种类：AdviceMode.PROXY JDK 代理
  	// 					AdviceMode.ASPECTJ CGLIB
  	AdviceMode mode() default AdviceMode.PROXY;
  
  	// 当一个连接点采用多个通知的时候，可以指定通知的执行顺序
  	int order() default Ordered.LOWEST_PRECEDENCE;
}	
```



这个注解的作用其实就相当于以前在 XML 中写的 `<cache:annotation-driven/>`



可以看到它还引入了一个类：

- `@Import(CachingConfigurationSelector.class)`

它有几个静态成员：

```java
	private static final String PROXY_JCACHE_CONFIGURATION_CLASS =
			"org.springframework.cache.jcache.config.ProxyJCacheConfiguration";

	private static final String CACHE_ASPECT_CONFIGURATION_CLASS_NAME =
			"org.springframework.cache.aspectj.AspectJCachingConfiguration";

	private static final String JCACHE_ASPECT_CONFIGURATION_CLASS_NAME =
			"org.springframework.cache.aspectj.AspectJJCacheConfiguration";
```



这个类会根据注解 `@EableCaching` 的属性 `AdviceMode mode` 来决定引入哪些配置类：

```java
	public String[] selectImports(AdviceMode adviceMode) {
		switch (adviceMode) {
			case PROXY:
				return getProxyImports();
			case ASPECTJ:
				return getAspectJImports();
			default:
				return null;
		}
	}
```

- **PROXY**：

```java
	/**
	 * Return the imports to use if the {@link AdviceMode} is set to {@link AdviceMode#PROXY}.
	 * <p>Take care of adding the necessary JSR-107 import if it is available.
	 */
	private String[] getProxyImports() {
		List<String> result = new ArrayList<>(3);
		result.add(AutoProxyRegistrar.class.getName());
		result.add(ProxyCachingConfiguration.class.getName());
		if (jsr107Present && jcacheImplPresent) {
			result.add(PROXY_JCACHE_CONFIGURATION_CLASS);
		}
		return StringUtils.toStringArray(result);
	}
```

PROXY 模式会引入：`AutoProxyRegistrar` 和 `ProxyCachingConfiguration`

如果采用了 JCache，还会引入 `org.springframework.cache.jcache.config.ProxyJCacheConfiguration`



- **ASPECTJ**：

```java
	private String[] getAspectJImports() {
		List<String> result = new ArrayList<>(2);
		result.add(CACHE_ASPECT_CONFIGURATION_CLASS_NAME);
		if (jsr107Present && jcacheImplPresent) {
			result.add(JCACHE_ASPECT_CONFIGURATION_CLASS_NAME);
		}
		return StringUtils.toStringArray(result);
	}
```

ASPECTJ 模式会引入：`org.springframework.cache.aspectj.AspectJCachingConfiguration`

如果支持 JCache 还会引入：`org.springframework.cache.aspectj.AspectJJCacheConfiguration`



> 举 PROXY 模式为例

PROXY 模式中 **CachingConfigurationSelector** 导入了:

- `AutoProxyRegistrar`：它的作用就是根据 @EnableXxx 这种注解中的 `mode` 和 `proxyTargetClass` 属性的值来在当前的 `BeanDefinitionRegistry` 上注册一个 **auto proxy creator**（自动代理创建器 APC）
  - 用于确保目标 `Bean` 需要被代理时有可用的代理创建器

- `ProxyCachingConfiguration`：向容器中注入和缓存管理相关的基础 Bean
  - 类型为 `BeanFactoryCacheOperationSourceAdvisor`，名称为 `org.springframework.cache.config.internalCacheAdvisor` 的 Bean
  - 类型为 `CacheOperationSource`，名称为 `AnnotationCacheOperationSource` 的 Bean
    - 获取调用方法时方法上标注的缓存注解的元数据（指 SpringCache 相关 注解：Cacheable、 CachePut 和 CacheEvict 注解）
  - 类型为 `CacheInterceptor` 名称为 `CacheInterceptor` 的 Bean
    - `class CacheInterceptor extends CacheAspectSupport implements MethodInterceptor, Serializable`
    - 它是一个方法拦截器，包裹在目标 Bean 的外卖用于操作 Cache 的 **AOP Advice**



`AutoProxyRegister` 在容器启动阶段对每个 Bean 的创建（通过 `BeanDefinitionRegistry 注册 BeanDefinition `）进行处理，如果该 Bean 中有方法应用了 `Spring Cache` 注解，为器创建相对应的代理对象，包裹上面定义的 `BeanFactoryCacheOperationSourceAdvisor ` Bean。



使用了 **Spring Cache** 注解的 Bean 方法被调用是，调用首先发生在代理对象上，先到达 `cacheInterceptor` 然后才是目标 Bean 方法的调用

**注：cacheInterceptor 既处理调用前缓存操作，也处理调用时缓存操作**



### 1、默认的缓存组件

如果我们不提供第三方缓存库，SpringBoot 就会自动装配自己的缓存机制：`Simple`

它的实现原理其实就是借用了 `ConcurrentHashMap` 在内存中维持一个线程安全的 map，从而提供缓存存储。



```java
package org.springframework.boot.autoconfigure.cache;

@Configuration(proxyBeanMethods = false)
@ConditionalOnMissingBean(CacheManager.class)
@Conditional(CacheCondition.class)
class SimpleCacheConfiguration {

	@Bean
	ConcurrentMapCacheManager cacheManager(CacheProperties cacheProperties,
			CacheManagerCustomizers cacheManagerCustomizers) {
		ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
		List<String> cacheNames = cacheProperties.getCacheNames();
		if (!cacheNames.isEmpty()) {
			cacheManager.setCacheNames(cacheNames);
		}
		return cacheManagerCustomizers.customize(cacheManager);
	}

}
```



```java
package org.springframework.cache.concurrent;

public class ConcurrentMapCacheManager implements CacheManager, BeanClassLoaderAware {

	private final ConcurrentMap<String, Cache> cacheMap = new ConcurrentHashMap<>(16);
 	
  ......
}
```



### 2、定制缓存组件

为了方便开发者组装定制自己的缓存，Spring 框架仅仅提供了对缓存的支持，但不提供具体的实现（除了默认的 **Simple** 缓存） 。

Spring 对缓存的抽象就是这两个接口：

- `org.springframework.cache.Cache`
- `org.springframework.cache.CacheManager`





我们可以为这两个接口提供具体的实现，就可以使用我们定制的缓存了。（例如 Redis 官方根据 CacheManager 接口实现了自己的 `RedisCacheManager` ，当我们引入了 `spring-boot-starter-data-redis` 后，使用的就是这个缓存管理器。）



当开发者需要定制自己的缓存时，就需要定义这样的 **Bean**  ：

- `CacheManager` 类型：缓存管理器
- `CacheResolver` 类型：
  - 要么使用 Spring 默认的缓存解析器
  - 要么自己定制缓存解析器



这样 SpringBoot 在检测到开发者开启了缓存支持同时提供了缓存的具体实现后，就会使用我们定制的缓存。



### CacheManager 继承体系分析：TODO



### CacheResolver 继承体系分析：TODO





### 3、第三方缓存组件

如果开发者需要引入第三方缓存，就不需要去实现自己的 `CacheManager` 或者 `CacheResolver`。

Spring Boot 就会按照下面的顺序去找对应的第三方缓存提供者：

- Generic
- JCache（JSR-107）（EhCache，Hazelcast，Infinispan，and others）
- EhCache 2.x
- Hazelcast
- Infinispan
- Couchbase
- Redis
- Caffeine
- Simple



## 二、SpringBoot 集成缓存

[SpringBoot 对缓存的支持](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.caching.provider)

[Spring 对缓存的抽象](https://docs.spring.io/spring-framework/docs/5.3.9/reference/html/integration.html#cache)

### 1、缓存的配置类

定制缓存的配置类可以这样：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210812111621.png)

除了写配置类，我们还可以在 spring 的配置文件中使用：

- `spring.cache.type` 属性强制指定特定的缓存提供方
- 在特定情况下（例如测试环境）不需要缓存，可以使用该属性禁用缓存
  - `spring.cache.type=none`



### 2、定制缓存

这里只举引入第三方缓存 Redis 的例子：

在使用第三方缓存后，首先编写缓存的配置类，然后我们就可以对缓存的一些细节进行优化：

- 提供 `CacheManager`
- 提供 `CacheResolver`



### 3、进一步优化

当 `CacheManager` 被 SpringBoot 自动装配后，我们可以通过实现 `CacheManagerCustomizer` 接口进一步来优化配置：

官方的例子是对默认的 **Simple** 缓存进行空值优化：

```java
import org.springframework.boot.autoconfigure.cache.CacheManagerCustomizer;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MyCacheManagerConfiguration {

    @Bean
    public CacheManagerCustomizer<ConcurrentMapCacheManager> cacheManagerCustomizer() {
        return (cacheManager) -> cacheManager.setAllowNullValues(false);
    }

}
```

如果遇到了空值，就交给底层映射处理。



 `CacheManagerCustomizer`  只有一个方法：

```java
package org.springframework.boot.autoconfigure.cache;

import org.springframework.cache.CacheManager;

/**
 * Callback interface that can be implemented by beans wishing to customize the cache
 * manager before it is fully initialized, in particular to tune its configuration.
 *
 * @param <T> the type of the {@link CacheManager}
 * @author Stephane Nicoll
 * @since 1.3.3
 */
@FunctionalInterface
public interface CacheManagerCustomizer<T extends CacheManager> {

	/**
	 * Customize the cache manager.
	 * @param cacheManager the {@code CacheManager} to customize
	 */
	void customize(T cacheManager);

}
```



## 三、集成 Redis



导入依赖：

```xml
<!-- 整合 Redis -->
<dependency>
  	<groupId>org.springframework.boot</groupId>
  	<artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- 整合 Redis 所需的缓存池 -->
<dependency>
  	<groupId>org.apache.commons</groupId>
  	<artifactId>commons-pool2</artifactId>
</dependency>
```



### 1、创建缓存配置类

```java
@Configuration
@EnableCaching
public class RedisConfig extends CachingConfigurerSupport {
    
}
```



### 2、提供 CacheManager

```java
@Configuration
@EnableCaching
public class RedisConfig extends CachingConfigurerSupport {

    @Bean
    @SuppressWarnings("all")
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {

        RedisSerializer<String> redisSerializer = new StringRedisSerializer();
        Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);

        // 解决查询缓存转换异常的问题
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL);
        jackson2JsonRedisSerializer.setObjectMapper(objectMapper);

        // 配置序列化（解决乱码问题）同时设置过期时间
        RedisCacheConfiguration configuration = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(600))  // 缓存过期时间 600s
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(redisSerializer))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jackson2JsonRedisSerializer))
                .disableCachingNullValues();    // 这里禁止了缓存为空值的情况

        RedisCacheManager cacheManager = RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(configuration)
                .build();

        return cacheManager;
    }
    
}
```

这里关于 `CacheResolver` 我们使用默认的就好了。



### 3、细节优化

关于 Redis 的学习，可以参考：[Reids Introduction](https://naivekyo.github.io/2021/07/07/redis-intro/)

由于使用默认的 `RedisTemplate` 会出现一些问题（比如中文乱码）所以我们要进行序列化和反序列化处理：

```java
/**
 * @author NaiveKyo
 * @version 1.0
 * @description: 集成 Redis 缓存
 * @since 2021/8/12 16:10
 */
@Configuration
@EnableCaching
public class RedisConfig extends CachingConfigurerSupport {

    @Bean
    @SuppressWarnings("all")
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {

        RedisSerializer<String> redisSerializer = new StringRedisSerializer();
        Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);

        // 解决查询缓存转换异常的问题
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL);
        jackson2JsonRedisSerializer.setObjectMapper(objectMapper);

        // 配置序列化（解决乱码问题）同时设置过期时间
        RedisCacheConfiguration configuration = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(600))  // 缓存过期时间 600s
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(redisSerializer))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jackson2JsonRedisSerializer))
                .disableCachingNullValues();    // 这里禁止了缓存为空值的情况

        RedisCacheManager cacheManager = RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(configuration)
                .build();

        return cacheManager;
    }

    /**
     * 定制 RedisTemplate 配置
     * @param redisConnectionFactory
     * @return
     */
    @Bean
    @SuppressWarnings("all")
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {

        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);

        // 序列化配置
        Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL);
        jackson2JsonRedisSerializer.setObjectMapper(objectMapper);

        // String 的序列化
        StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();

        // 配置具体的序列化方式
        // key 采用 String 的序列化方式
        template.setKeySerializer(stringRedisSerializer);
        // hash 的 key 也采用 String 的序列化方式
        template.setHashKeySerializer(stringRedisSerializer);
        // value 序列化方式采用 jackson
        template.setValueSerializer(jackson2JsonRedisSerializer);
        // hash 的 value 序列化方式采用 jackson
        template.setHashValueSerializer(jackson2JsonRedisSerializer);

        return template;
    }
}
```

