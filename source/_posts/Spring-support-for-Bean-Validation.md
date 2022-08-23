---
title: Spring support for Bean Validation
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425110432.jpg'
coverImg: /img/20220425110432.jpg
cover: false
toc: true
mathjax: false
date: 2022-08-23 23:44:27
summary: "Spring 核心之 Bean Validation"
categories: "Spring"
keywords: ["Spring", "Bean Validation"]
tags: "Spring"
---

# 概述

在日常开发中，对参数的校验需要前后端一起协作完成，前端是对用户输入数据进行校验，后端主要针对某些未经过浏览器而直接通过 HTTP 工具发送过来的请求参数的校验。

参数校验的主要目的是为了保证数据的合法与可靠性，确保最终进入数据库的数据是正确的。

# 一、Spring Validation

## 1、简介

官方地址：https://docs.spring.io/spring-framework/docs/5.2.22.RELEASE/spring-framework-reference/core.html#validation

在处理业务逻辑时，做一些参数校验是非常常见的，Spring 在设计时也考虑到了这一方面，并设计了 Validator 功能，它具有如下几个特点：

- 结合数据绑定进行参数校验（DataBinder 和 Validator 为 Spring 的校验框架提供了更加丰富的功能）；
  - `Validator` 结合 `Errors` 和 `BindingResult` 做校验；
  - `DataBinder` 将用户输入和领域模型结合，它里面使用的是 `BeanWrapper` ，这个是 Spring 的一个重要的基础功能，后续再研究。
- 可以在各个层次使用，不仅仅局限于 Web 层， 并且很容易就实现本地化（通过错误提示消息文件）；
- 是一个可拔插的模块（使用 SPI 自动注册可用的校验模块，比如 Hibernate Validator）；
- Spring 校验模块的基础是 Java Bean Validation，同时 Spring 提供了它和 Spring 自身校验框架的适配器。

## 2、Spring Validator 接口

 Spring 官方提供了 `org.springframework.validation.Validator` 接口用于数据校验，而且在注释中特别点出，该接口完全脱离任何基础设置和上下文，意味着它可以在任何层次使用。而在检验的时候，该接口通过使用 `org.springframework.validation.Errors` 对象工作，校验器将相关信息封装到 Errors 对象中。

### -  针对单个实体类做校验

（1）创建实体类；

```java
@Data
public class Person {
    
    private String name;
    
    private Integer age;
    
}
```

（2）针对该 JavaBean 创建一个校验器：

```java
public class PersonValidator implements Validator {

    /**
     * This Validator validates only Person instances
     */
    @Override
    public boolean supports(Class<?> clazz) {
        return Person.class.equals(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        
        ValidationUtils.rejectIfEmpty(errors, "name", "name can't be empty");

        Person p = (Person) target;
        
        // 限制年龄在 0 - 110
        if (p.getAge() < 0) {
            errors.rejectValue("age", "negative value");
        } else if (p.getAge() > 110) {
            errors.rejectValue("age", "too.darn.old");
        }
     }
}
```

可以看到这里使用了一个工具类：`ValidationUtils`

（3）直接使用校验器

直接使用校验器比较繁琐（Validator 结合 ResultBinder、Errors）：

```java
@Test
public void test() {
    PersonValidator validator = new PersonValidator();

    Person person = new Person();
    person.setAge(1000);

    Map<String, Object> map = new HashMap<>();
    // 创建结果对象
    MapBindingResult result = new MapBindingResult(map, "person");

    // 开始校验并将结果信息封装到 result
    validator.validate(person, result);

    result.getFieldErrors().forEach(e -> {
        System.out.println(e.getField() + " " + e.getCode());
    });
}
```

这里面就涉及到了 `ResultBinding` 和 `Errors` 相关知识了，我们先看一下继承图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220808223312.png)

`Errors` 主要用于存储特定模型绑定的数据信息或者验证错误的信息。

`BindingResult` 扩展了 `Errors` 接口，将其和 `DataBinder` 结合起来，这样该接口的实现类就可以存储错误信息或者模型绑定的数据了（通过 `DataBinder.getBindingResult()` 方法获取）。

`AbstractBindingResult` 是前两者的抽象实现类，实现了其中一些接口的同时，还结合了 `ObjectError`、`FieldError`，也就是 Spring 中对象的错误和字段的错误。

`MapBindingResult` 也就是上边我们使用的了，它是上面的继承类，实现比较简单，这里也只是为了方便使用它。

下面的几个实现类就是大头了，具体和 `DataBinder` 有关，后面有机会继续研究。

### - 针对复杂对象的校验

有时候当我们需要对复杂对象进行嵌套校验时，Spring 官方也给出了一个简单的例子：

比如我们有一个定制的类 `Customer`，这个类包含 3 个字段，一个人的姓和名，外加一个地址类对象（`Address`），此时需要针对地址写一个校验类，针对自定义类做一个校验类，可以这样写：

```java
public class CustomerValidator implements Validator {

    // 针对地址类的校验工具
    private final Validator addressValidator;

    public CustomerValidator(Validator addressValidator) {
        if (addressValidator == null) {
            throw new IllegalArgumentException("The supplied [Validator] is " +
                "required and must not be null.");
        }
        if (!addressValidator.supports(Address.class)) {
            throw new IllegalArgumentException("The supplied [Validator] must " +
                "support the validation of [Address] instances.");
        }
        this.addressValidator = addressValidator;
    }

    /**
     * This Validator validates Customer instances, and any subclasses of Customer too
     */
    public boolean supports(Class clazz) {
        // 这里校验的是 Cusomter 及其子类
        return Customer.class.isAssignableFrom(clazz);
    }

    public void validate(Object target, Errors errors) {
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "firstName", "field.required");
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "surname", "field.required");
        Customer customer = (Customer) target;
        try {
            // 注意这里的嵌套校验
            errors.pushNestedPath("address");
            ValidationUtils.invokeValidator(this.addressValidator, customer.getAddress(), errors);
        } finally {
            errors.popNestedPath();
        }
    }
}
```

## 3、将消息源同校验信息结合

前面我们的错误信息都是自己写的，而 Spring 建议我们结合数据绑定和校验器来实现校验功能，可以提前定义好一套错误代码和对应的错误信息，利用 Spring  的 `MessageSource` 去解析它，当出现了特定的错误时，从消息源中提出出错误信息返回给用户。

这里就要提一下 Spring 上下文模块的一个接口 `MessageSource` 了，它是用来解析消息的一种策略，支持参数化和国际化，该接口定义了几种解析消息的方式，其中有一种是使用 `MessageSourceResolvable` 接口去解析，注意该接口也是 Spring 上下文模块的，利用它获取 code，然后提取对应的信息。

在校验模块中也提供了一个 `MessageCodesResolver` 接口，它主要是用于解析 validation error code 的，提取 code 后经过 `DataBinder` 将其转化为 `MessageSourceResolvable` 可以理解的 code，最后走 Spring 上下文的 `MessageSource` 提取对应的信息。

具体的例子可以参考：

- `org.springframework.validation.MessageCodesResolver` 接口；

- `org.springframework.validation.DefaultMessageCodesResolver` 默认实现类。

后续会给出 Bean Validation 结合 MessageSource 的例子。

# 二、Java Bean Validation

## 1、Jakarta Bean Validation 规范

Spring 也提供了对 [Java Bean Validation](https://beanvalidation.org/) （Jakarta Bean Validation 规范）的支持。

通过约束声明和元数据来提供 Bean Validation，具体做法就是在属性字段上标注相应的注解，这样在运行时就会对其进行校验，当然，开发者也可以自定义约束。

大多数校验框架的实现都是依据 Jakarta Bean Validation 规范来的，其中 Spring 推荐我们使用 [Hibernate Validator](https://hibernate.org/validator/) 框架。

对该规范的更详细说明可以参考官方文档，其中有相应的说明和 API 定义：

- https://jakarta.ee/specifications/bean-validation/3.0/apidocs/
- https://jakarta.ee/specifications/bean-validation/3.0/jakarta-bean-validation-spec-3.0.html

## 2、Hibernate Validator

官网：https://hibernate.org/

下面看看 Hibernate Validator 中的常用注解，可以导入如下依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

该 starter 中自动包含了 `Jakarta Bean Validation` 和 `Hibernate Validator` 实现。

使用起来类似下面的例子：

```java
public class PersonForm {

    @NotNull
    @Size(max=64)
    private String name;

    @Min(0)
    private int age;
}
```

既然是 spring boot 的 starter 形式，我们可以研究一下对应的 AutoConfiguration 类：

```java
// org.springframework.boot.autoconfigure.validation.ValidationAutoConfiguration

@Configuration(proxyBeanMethods = false)
@ConditionalOnClass(ExecutableValidator.class)
@ConditionalOnResource(resources = "classpath:META-INF/services/javax.validation.spi.ValidationProvider")
@Import(PrimaryDefaultValidatorPostProcessor.class)
public class ValidationAutoConfiguration {

	@Bean
	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	@ConditionalOnMissingBean(Validator.class)
	public static LocalValidatorFactoryBean defaultValidator() {
		LocalValidatorFactoryBean factoryBean = new LocalValidatorFactoryBean();
		MessageInterpolatorFactory interpolatorFactory = new MessageInterpolatorFactory();
		factoryBean.setMessageInterpolator(interpolatorFactory.getObject());
		return factoryBean;
	}

	@Bean
	@ConditionalOnMissingBean
	public static MethodValidationPostProcessor methodValidationPostProcessor(Environment environment,
			@Lazy Validator validator) {
		MethodValidationPostProcessor processor = new MethodValidationPostProcessor();
		boolean proxyTargetClass = environment.getProperty("spring.aop.proxy-target-class", Boolean.class, true);
		processor.setProxyTargetClass(proxyTargetClass);
		processor.setValidator(validator);
		return processor;
	}

}
```

通过该自动装配类，我们可以知道一下几点：

- 当前类路径下需要有 `ExecutableValidator` 这个类，它是 jakarta validation 规范中提出的，要求实现方具备对参数和返回结果的校验功能；
- `classpath:META-INF/services/javax.validation.spi.ValidationProvider` 利用 SPI 功能自动注册符合 jakarta validation 规范的实现框架，当前就是 Hibernate Validator 框架；
- `org.springframework.validation.beanvalidation.LocalValidatorFactoryBean` 该类是 Spring 实现 JSR-303 校验规范的核心类，同时它也是一个特殊的 Bean（`FactoryBean`），主要用于将校验框架注册到 Spring 上下文中；
  - 这里可以看到 `LocalValidatorFactoryBean` set 了一个 `MessageInterpolatorFactory` 对象，这里就涉及到错误提示信息和错误代码（之前提到的消息源），查看该 set 方法上的注释，

```
Specify a custom Spring MessageSource for resolving validation messages, instead of relying on JSR-303's default "ValidationMessages.properties" bundle in the classpath. This may refer to a Spring context's shared "messageSource" bean, or to some special MessageSource setup for validation purposes only.
```

可知，默认的 `ValidationMessageSource`（校验出错时的提示文件）是 classpath 下的 `ValidationMessages.properties` 文件，开发者可以在 resource 目录下面提供该属性文件，以 key-value 的形式提供错误代码和对应的错误消息，然后通过 Spring EL 去提取错误信息。

- `MethodValidationPostProcessor` 则是 Spring 框架自身的校验实现，因为 Spring 内置了对 Jakarta Bean Validation 的支持，如果开发者想使用 Spring 提供的声明式的校验方式，比如 `@Validated` 注解去校验，则需要注入该 Bean，同时记住它依赖于 AOP 机制（放在类或方法上都可以）。
  - 补充：`@Valid` 注解是 JSR-303（Java Bean Validation）提供的注解，不支持分组校验，但其支持递归校验（类成员变量为其他类的实例时，可以使用该注解标注该成员属性）；
  - `@Validated` 是 Spring 提供的校验注解，支持分组校验，但不支持递归校验。

## 3、常用约束

Java Bean Validation（JSR-303、JSR 349、JSR 380、Jakarta Bean Validation）定义了一系列 JavaBean 校验相关的概念，包含诸多注解，而 Hibernate Validator 则提供了这些注解的处理逻辑（通过 Jakarta Bean Validation 提供的 SPI 接口来提供具体的实现），常见的约束都在 `javax.validation.constraints` 包下面，例如这些：

### 空和非空检查

| 注解        | 说明                                                         |
| ----------- | ------------------------------------------------------------ |
| `@NotBlank` | 只能用于字符串不为 `null` ，并且字符串 `#trim()` 以后 length 要大于 0 |
| `@NotEmpty` | 集合对象的元素不为 0 ，即集合不为空，也可以用于字符串不为 `null` |
| `@NotNull`  | 不能为 `null`                                                |
| `@Null`     | 必须为 `null`                                                |

### 数值检查

| 注解                         | 说明                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| `@DecimalMax(value)`         | 被注释的元素必须是一个数字，其值必须小于等于指定的最大值     |
| `@DecimalMin(value)`         | 被注释的元素必须是一个数字，其值必须大于等于指定的最小值     |
| `@Digits(integer, fraction)` | 被注释的元素必须是一个数字，其值必须在可接受的范围内（整数数位和小数数位在指定范围内） |
| `@Positive`                  | 判断正数                                                     |
| `@PositiveOrZero`            | 判断正数或 0                                                 |
| `@Max(value)`                | 该字段的值只能小于或等于该值                                 |
| `@Min(value)`                | 该字段的值只能大于或等于该值                                 |
| `@Negative`                  | 判断负数                                                     |
| `@NegativeOrZero`            | 判断负数或 0                                                 |

### 布尔值检查

| 注解           | 说明                       |
| -------------- | -------------------------- |
| `@AssertFalse` | 被注释的元素必须为 `false` |
| `@AssertTrue`  | 被注释的元素必须为 `true`  |

### 长度检查

| 注解              | 说明                                                         |
| ----------------- | ------------------------------------------------------------ |
| `@Size(max, min)` | 检查该字段的 `size` 是否在 `min` 和 `max` 之间，可以是字符串、数组、集合、Map 等 |

### 日期检查

| 注解               | 说明                             |
| ------------------ | -------------------------------- |
| `@Future`          | 被注释的元素必须是一个将来的日期 |
| `@FutureOrPresent` | 判断日期是否是将来或现在日期     |
| `@Past`            | 检查该字段的日期是在过去         |
| `@PastOrPresent`   | 判断日期是否是过去或现在日期     |

### 其他检查

| 注解              | 说明                                 |
| ----------------- | ------------------------------------ |
| `@Email`          | 被注释的元素必须是电子邮箱地址       |
| `@Pattern(value)` | 被注释的元素必须符合指定的正则表达式 |

### Hibernate 补充	

`org.hibernate.validator.constraints` 中附加的注解（很多，这里展示几个）：

| 注解                                         | 约束                                     |
| -------------------------------------------- | ---------------------------------------- |
| `@Range(min=, max=)`                         | 被注释的元素必须在合适的范围内           |
| `@Length(min=, max=)`                        | 被注释的字符串的大小必须在指定的范围内   |
| `@URL(protocol=,host=,port=,regexp=,flags=)` | 被注释的字符串必须是一个有效的 URL       |
| `@ScriptAssert(lang=,script=)`               | 类级别的约束，要求类的属性必须满足表达式 |

## 4、Java SE Demo 实战

### 依赖

`Java Bean Validation` 也可以叫做 `Jakarta Bean Validation` 规范经历了以下发展阶段（目前）：

- JSR 303 ：Bean Validation 1.0
- JSR 349 ：Bean Validation 1.1
- JSR 308 ：Bean Validation 2.0
- Jakarta Bean Validation 3.0（截止文章当前时间）

该规范已经非常成熟了，而在该规范的诸多实现中最常用的应当是 `Hibernate Validator` 框架，所以下面就以此为例，创建 Maven 项目，导入如下依赖：

```xml
<dependencies>

    <!-- Jakarta Bean Validation -->
    <dependency>
        <groupId>jakarta.validation</groupId>
        <artifactId>jakarta.validation-api</artifactId>
        <version>3.0.2</version>
    </dependency>

    <!-- Hibernate Validator-->
    <dependency>
        <groupId>org.hibernate.validator</groupId>
        <artifactId>hibernate-validator</artifactId>
        <version>8.0.0.CR3</version>
    </dependency>

    <!-- Provide Support For Jakarta Expression Language In Java SE Environment -->
    <dependency>
        <groupId>org.glassfish</groupId>
        <artifactId>jakarta.el</artifactId>
        <version>4.0.1</version>
    </dependency>

    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.24</version>
        <scope>provided</scope>
    </dependency>

    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter-api</artifactId>
        <version>5.9.0</version>
        <scope>test</scope>
    </dependency>

</dependencies>
```

### 官方文档

相关 API 的使用方法可以参考官方对应版本的 `specification`：

- https://jakarta.ee/specifications/bean-validation/3.0/jakarta-bean-validation-spec-3.0.html
- https://beanvalidation.org/2.0/spec/
- https://docs.jboss.org/hibernate/validator/7.0/reference/en-US/html_single/#validator-gettingstarted
  - 注意 Hibernate Validator 框架传递依赖 Jakarat Bean Validation；
  - 在 Java EE 环境下会提供对 Jakarta Expression Language 的支持，但是在 Java SE 环境下就需要手动导入；

### Java Bean

首先创建 Java Bean：

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@Accessors(chain = true)
public class Person {

    /**
     * 中文名长度 2 - 5 个汉字
     */
    @NotNull(message = "姓名不能为空")
    @Length(min = 2, max = 5)
    private String name;

    /**
     * 年龄数值, 需要符合一定的范围
     * [1, 120]
     */
    @NotNull
    @Min(1)
    @Max(120)
    private Integer age;
    
    @Valid
    @Size(min = 1, max = 10)
    private List<Person> friends;
}
```

纯 Java 项目中如果要校验对象实例，需要使用 `jakarta.validation.Validator` 这个 API 接口，它的实现类必须是线程安全的，官方建议我们通过 `jakarta.validation.ValidatorFactory` 工厂去获取该实例，同时多个 `Validator` 实例会由同一个工厂创建，这意味着工厂实例一般会被缓存并重复使用，所以要记得在应用程序退出时关闭该工厂实例。

### 获取构建工厂的方式

获取方法可以有两种（在 Validation 接口中有相关注释）：

> 方式一：使用 Jakarta 默认的构建工厂的方法

代码如下：

```java
// 获取校验器工厂
ValidatorFactory validatorFactory = Validation.buildDefaultValidatorFactory();
// 使用该工厂获取实例
Validator validator = validatorFactory.getValidator();
// do something...
// 关闭工厂
validatorFactory.close();
```

- 如果当前类路径下存在 `META-INF/validation.xml` 文件，则使用该文件来构建配置类实例 `jakarta.validation.Configuration`，最终生成工厂实例； 

- 如果找不到默认的 XML 配置，则使用 JDK 的服务发现工具类 `java.util.ServiceLoader` 去自动加载我们导入的实现框架，这里就是 `Hibernate Validator`，具体配置是 `META-INF/services/jakarta.validation.spi.ValidationProvider` 文件中定义的实现类全路径。

> 方式二：自定义 ValidationProviderResolver

默认 `jakarta.validation.ValidationProviderResolver`  接口的实现类是在 `Validation` 中的一个私有的静态内部类，里面定义了使用 SPI 去加载服务提供方的方法，如果我们想换其他的方式去加载，可以使用这种方式：

```java
Configuration<?> configuration = Validation
    .byDefaultProvider()
    .providerResolver( new MyResolverStrategy() ) // 这里就是自定义的
    .configure();
ValidatorFactory factory = configuration.buildValidatorFactory();
```

一般不用这种方式二。

> 方式三：显式指定服务提供方

```java
ValidatorFactory validatorFactory = Validation.byProvider(HibernateValidator.class)
    .configure()
    .failFast(false)	// 是否开启 fail fast mode, 这里选择不开启, 开启后出现第一个校验错误时, 后面就不会继续校验了, 而是直接返回, 默认是不开启的, 不开启就会检查所有待检测项
    .buildValidatorFactory();

Validator validator = validatorFactory.getValidator();
```

这里显式指定了 Jakarta 校验规范的实现者是 `HibernateValidator`，然后进行相关配置，当然这里可以选择指定 `ValidationProviderResolver`：

```java
ACMEConfiguration configuration = Validation
    .byProvider(ACMEProvider.class)
    .providerResolver( new MyResolverStrategy() )  // optionally set the provider resolver
    .configure();
ValidatorFactory factory = configuration.buildValidatorFactory();
```

### 测试

测试方法如下：

```java
private static void buildAndShow(Person person) {

    // 获取构建工厂实例
    ValidatorFactory validatorFactory = Validation.byProvider(HibernateValidator.class)
        .configure()
        .failFast(false)
        .buildValidatorFactory();

    // 获取检验器实例
    Validator validator = validatorFactory.getValidator();

    // 对具体的对象实例进行校验, 获取校验违规结果集
    Set<ConstraintViolation<Person>> violationSet = validator.validate(person);

    for (ConstraintViolation<Person> violation : violationSet) {
        System.out.println(violation.getPropertyPath() + " -> " + violation.getMessage());
    }

    // 应用程序生命周期结束时关闭工厂
    validatorFactory.close();
}
```

校验方法有多种，可以全部校验，也可以针对特定属性进行校验，具体参考 `Validator` 中的方法。

### 补充：错误消息来源

这里要补充一个知识点，前面使用注解的时候，有个 `message` 字段：

```java
// 例子
@NotNull(message = "姓名不能为空")

// 源码 jakarta.validation.constraints.NotNull
String message() default "{jakarta.validation.constraints.NotNull.message}";
```

可以看到如果我们不指定错误提示信息，Jakarta 会有一个默认值，这里使用了 EL，当约束被违反了时候就通过 `jakarta.validation.ConstraintViolation#getMessage()` 方法去获取该消息。

当然开发者也可以自己定义消息的来源，通过 EL 去提取，具体定义消息来源是通过 `jakarta.validation.MessageInterpolator` 接口去做的，相关实现可以参考源码和官方文档，后续在 Spring 中可以选择在属性文件中定义错误 code 和 对应的消息，然后通过插值表达式提取消息。

### 补充：@Valid 注解

源码：

```java
@Target({ METHOD, FIELD, CONSTRUCTOR, PARAMETER, TYPE_USE })
@Retention(RUNTIME)
@Documented
public @interface Valid {
}
```

可以发现该注解可以标注的地方有很多，方法、属性、构造器、参数，但是就是不能标注在类或接口上面，这点和后续 Spring 的 `@Validated` 有些不同。

一些用法也可以参考官方文档：https://jakarta.ee/specifications/bean-validation/3.0/jakarta-bean-validation-spec-3.0.html#constraintdeclarationvalidationprocess-requirements-graphvalidation



# 三、Spring MVC Validation

前面写的有些乱，但是大致已经了解了如下几个方面：

-  Java Bean Validation 规范和其实现 Hibernate Validator 相关概念，以及在 Java SE 环境中是如何使用的；
-  Spring 基于 Jakarta Bean Validation 规范实现了自己的校验方式，同时使用 `Errors` 和 `ResultBinding` 增强了校验框架在 Spring 环境下的相关功能；
- Spring Boot 中以 starter 的方式注入了 Jakarta Bean Validation 及其实现 Hibernate Validator：
  - `LocalValidatorFactoryBean`：通过这一 `FactoryBean` 去实例化相关类；
  - `MethodValidationPostProcessor`：通过这一后处理器结合 AOP 机制通过 `@Validated` 注解增强了校验功能。

下面看看在 Spring MVC （Java EE）环境下是如何使用检验框架来完成校验的。

参考：https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-config-validation

## 1、全局校验器

Bean 和对应的校验器：

```java
@Data
public class Person {
    
    private String name;
    
    private Integer age;
    
}

public class PersonValidator implements Validator {
    
    @Override
    public boolean supports(Class<?> clazz) {
        return Person.class.equals(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "name", "姓名不能为空!");
        
        Person person = (Person) target;
        if (person.getAge() < 0)
            errors.rejectValue("age", "年龄不能为负数!");
        else if (person.getAge() > 130)
            errors.rejectValue("age", "年龄不能过大!");
    }
}
```

配置全局校验器，针对添加了 `@Valid` 或者 `@Validated` 注解的地方：

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    // 添加全局校验器
    @Override
    public Validator getValidator() {
        return new PersonValidator();
    }
}
```

（2）Controller 层使用 `@Validated`  或者 `@Valid` 注解，结合全局校验器，如果成员属性有对象且也需要校验的，就需要使用 `@Valid` 进行嵌套校验了：

```java
@GetMapping("/validator/test1")
public String test1(@Valid Person person) {
    return "test1 is ok.";
}

@GetMapping("/validator/test2")
public String test2(@Validated Person person) {
    return "test2 is ok.";
}

@GetMapping("/no-check/test3")
public String test3(Person person) {
    log.info("person: {}", person);
    return "test3 is ok.";
}
```

如果参数错误，会报 `org.springframework.validation.BindException` 异常。

> 全局校验器的问题

可以看到，在 Java Configuration 中，我们定义了全局校验器，但是只能配置一个，不能满足开发者的需求，这个时候可以使用局部校验器。

## 2、局部校验器

测试类如下：

```java
// bean
@Data
public class Computer {
    
    private String cpu;
    
    private Integer cores;  
}

// 校验器
public class ComputerValidator implements Validator {
    @Override
    public boolean supports(Class<?> clazz) {
        return Computer.class.isAssignableFrom(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "cpu", "CPU 型号不能为空");

        Integer cores = ((Computer) target).getCores();
        
        if (cores < 4)
            errors.rejectValue("cores", "CPU 核数不能少于 4");
    }
}
```

在指定的 Controller 中使用 `@InitBinder` 注解绑定局部校验器，该校验器只在当前 Controller 中生效：

```java
@RestController
public class TestController {
    
    @InitBinder
    public void initBinder(WebDataBinder webDataBinder) {
        webDataBinder.addValidators(new PersonValidator(), new ComputerValidator());
    }
    
    @GetMapping("/validator/test4")
    public String test4(@Validated Computer computer) {
        return "test4 is ok.";
    }
}
```

## 3、校验器数量问题

前面了解了两种方式：全局校验器和局部校验器。

- 全局只能绑定一个校验器；
- 局部可以绑定多个校验器；

注意，虽然局部可以绑定多个，但是我们跟一下源码：

```java
// org.springframework.validation.DataBinder

/**
 * Add Validators to apply after each binding step.
 * @see #setValidator(Validator)
 * @see #replaceValidators(Validator...)
 */
public void addValidators(Validator... validators) {
    assertValidators(validators);
    this.validators.addAll(Arrays.asList(validators));
}

// 查看 assertValidators() 这个方法
private void assertValidators(Validator... validators) {
    Object target = getTarget();
    for (Validator validator : validators) {
        if (validator != null && (target != null && !validator.supports(target.getClass()))) {
            throw new IllegalStateException("Invalid target for Validator [" + validator + "]: " + target);
        }
    }
}
```

可以看到如果使用 `addValidators` 绑定多个校验器，一旦某个校验器和当前校验主体类型不一致，就会抛出异常，下面在看看 `InitBinder` 注解源码：

```java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface InitBinder {

	/**
	 * The names of command/form attributes and/or request parameters
	 * that this init-binder method is supposed to apply to.
	 * <p>Default is to apply to all command/form attributes and all request parameters
	 * processed by the annotated handler class. Specifying model attribute names or
	 * request parameter names here restricts the init-binder method to those specific
	 * attributes/parameters, with different init-binder methods typically applying to
	 * different groups of attributes or parameters.
	 */
	String[] value() default {};

}
```

可以看到这个 value 变量如果不指定的话是针对所有的 `command/form` 或者 `request parameters` 进行校验的，也就意味着如果想要在同一个 Controller 中针对多种类型进行校验，可以类似这样（详情参考注释）：

```java
@Slf4j
@RestController
public class TestController {
    
    @InitBinder(value = "person")
    public void initPersonDataBinder(WebDataBinder webDataBinder) {
        webDataBinder.addValidators(new PersonValidator());
    }
    
    @InitBinder(value = "computer")
    public void initComputerDataBinder(WebDataBinder webDataBinder) {
        webDataBinder.addValidators(new ComputerValidator());
    }
    
    // do something...
}
```

但是 `addValidators` 方法究竟有何意义呢？是针对某一个类型绑定多个校验器？还是其他的目的，暂时不太清楚。

- 测试过针对父类做校验，然后针对特定子类做校验，用 `addValidators` 添加所有的校验器，但是结果不太理想。

所以目前只能够有几个校验需求就添加几个 `@initBinder` 注解修饰的方法，当校验的地方越来越多时显然是不合理的。为了解决这个问题，我们可以结合 Spring MVC 和 Spring 提供的声明式校验来解决校验的需求。

## 4、Spring Boot Demo 实战

### 依赖

引入依赖：

```xml
<!-- web environment -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- aop support -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
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

<!-- Spring Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### 主启动类

```java
@SpringBootApplication
@EnableAspectJAutoProxy(exposeProxy = true)
public class SpringBootDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootDemoApplication.class, args);
    }
}
```

`exposeProxy = true` 这样我们就可以通过 `AopContext` 拿到在 `ThreadLocal` 中存放的 Aop 实例了。

前面了解到对应的 validation-starter 注入了两个 bean：

- `LocalValidatorFactoryBean`：主要目的是导入 Jakarta Bean Validation 及其实现框架（这里是 Hibernate Validator）；
- `MethodValidationPostProcessor`：启用了 AOP 功能对 Spring 校验进行增强：

### MethodValidationPostProcessor 分析

前者我们就不过多分析了，主要看后者：

```java
// org.springframework.validation.beanvalidation.MethodValidationPostProcessor

@Override
public void afterPropertiesSet() {
    Pointcut pointcut = new AnnotationMatchingPointcut(this.validatedAnnotationType, true);
    this.advisor = new DefaultPointcutAdvisor(pointcut, createMethodValidationAdvice(this.validator));
}

protected Advice createMethodValidationAdvice(@Nullable Validator validator) {
    return (validator != null ? new MethodValidationInterceptor(validator) : new MethodValidationInterceptor());
}
```

这里以 `Validated.class` 作为注解切点，构造了一个 MethodValidationAdvice 切面，具体的切面实例是 `MethodValidationInterceptor`，该类是 Spring 提供的，它通过实现 Aop 联盟规定的 `MethodInterceptor` 接口来提供针对 JSR 303 在方法级别的校验的切面。

需要注意的是：

- 切点是 `AnnotationMatchingPointcut`，查阅源码可知，该切点是标注在类或方法上的注解；
- 构建的拦截器是 `MethodValidationInterceptor`，它是 Spring 实现 aop 联盟的 `MethodInterceptor` 提供的方法层面的拦截通知，是一种通知的类型；
- 最后构建的是 `DefaultPointcutAdvisor` ，该 Advisor 用于将通知作用于切入点，是 Spring 提供的 `org.springframework.aop.Advisor` 接口的通用实现。

下面看看该类的继承图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220814231845.png)



联想到 `BeanFactory` 中定义的 Bean 生命周期，可知：

- 这里的调用顺序如下：
  - （1）BeanClassLoaderAware's setBeanClassLoader
  - （2）BeanFactoryAware's setBeanFactory
  - （3）postProcessBeforeInitialization methods of BeanPostProcessors
  - （4）InitializingBean's afterPropertiesSet
  - （5）postProcessAfterInitialization methods of BeanPostProcessors

这里重点看 `BeanPostProcessor` 和 `InitializingBean` 中的方法。

（1）首先是 `AbstractAdvisingBeanPostProcessor` 中的 `postProcessBeforeInitialization` 方法：

```java
@Override
public Object postProcessBeforeInitialization(Object bean, String beanName) {
    return bean;
}
```

没有做什么特殊处理。

（2）接着看 `MethodValidationPostProcessor` 中的 `afterPropertiesSet` 方法：

```java
@Override
public void afterPropertiesSet() {
    Pointcut pointcut = new AnnotationMatchingPointcut(this.validatedAnnotationType, true);
    this.advisor = new DefaultPointcutAdvisor(pointcut, createMethodValidationAdvice(this.validator));
}

protected Advice createMethodValidationAdvice(@Nullable Validator validator) {
    return (validator != null ? new MethodValidationInterceptor(validator) : new MethodValidationInterceptor());
}
```

上面也分析过了，就是创建切面。

（3）最后看 `AbstractAdvisingBeanPostProcessor` 的 `postProcessAfterInitialization` 方法，重点就在这里：

```java
@Override
public Object postProcessAfterInitialization(Object bean, String beanName) {
    // AopInfrastructureBean 是一个标记接口, 标注 aop 相关的类
    // 此类 bean 就忽略掉了
    if (this.advisor == null || bean instanceof AopInfrastructureBean) {
        // Ignore AOP infrastructure such as scoped proxies.
        return bean;
    }

    // 如果当前 bean 是 AOP 代理类
    if (bean instanceof Advised) {
        Advised advised = (Advised) bean;
        // 该代理类没有冻结且目标 bean 被该代理类所拦截
        if (!advised.isFrozen() && isEligible(AopUtils.getTargetClass(bean))) {
            // Add our local Advisor to the existing proxy's Advisor chain...
            // 这里的 beforeExistingAdvisors 如果为 true, 说明切面实例的优先级最高, 会把该切面放到代理类的切面链的第一位
            if (this.beforeExistingAdvisors) {
                advised.addAdvisor(0, this.advisor);
            }
            else {
                // 否则加到代理类的切面链中
                advised.addAdvisor(this.advisor);
            }
            return bean;
        }
    }
	
    // 如果当前 bean 不是一个代理类, 那么检查该 bean 是否符合当前后处理器的切面拦截范围内
    // 在当前环境下也就是说是不是命中了 @Validated 切入点
    if (isEligible(bean, beanName)) {
        // 创建 AOP 前的准备工作
        ProxyFactory proxyFactory = prepareProxyFactory(bean, beanName);
        // 决定代理的类型, 是 JDK 代理还是 Cglib 代理或者其他的代理
        if (!proxyFactory.isProxyTargetClass()) {
            evaluateProxyInterfaces(bean.getClass(), proxyFactory);
        }
        proxyFactory.addAdvisor(this.advisor);
        // 做一些定制化的操作, 留给子类实现
        customizeProxyFactory(proxyFactory);
        // 返回代理类实例
        return proxyFactory.getProxy(getProxyClassLoader());
    }

    // No proxy needed.
    return bean;
}

// prepareProxyFactory 方法有子类实现
// org.springframework.aop.framework.autoproxy.AbstractBeanFactoryAwareAdvisingPostProcessor#prepareProxyFactory
@Override
protected ProxyFactory prepareProxyFactory(Object bean, String beanName) {
    // 如果 beanFactory 不为 bull, 就将当前 bean 提前暴露出去
    // 考虑到 bean 中可能存在其他 bean, 所以要做这一步
    if (this.beanFactory != null) {
        AutoProxyUtils.exposeTargetClass(this.beanFactory, beanName, bean.getClass());
    }

    // 构建 ProxyFactory
    ProxyFactory proxyFactory = super.prepareProxyFactory(bean, beanName);
    // 判断是不是基于接口的 JDK 代理
    if (!proxyFactory.isProxyTargetClass() && this.beanFactory != null &&
        AutoProxyUtils.shouldProxyTargetClass(this.beanFactory, beanName)) {
        proxyFactory.setProxyTargetClass(true);
    }
    return proxyFactory;
}
```

我们关注的是 `isEligible` 这个方法，它用来判断当前的 bean 是不是可以被后处理器中的切面实例所拦截：

```java
protected boolean isEligible(Object bean, String beanName) {
    return isEligible(bean.getClass());
}

// 当前有一个子类实现
// org.springframework.aop.framework.autoproxy.AbstractBeanFactoryAwareAdvisingPostProcessor#isEligible
@Override
protected boolean isEligible(Object bean, String beanName) {
    // 这里判断了当前 bean 是不是不是原始对象实例，原始 bean 不需要代理
    // 接着又走父类的判断逻辑
    return (!AutoProxyUtils.isOriginalInstance(beanName, bean.getClass()) &&
            super.isEligible(bean, beanName));
}

protected boolean isEligible(Class<?> targetClass) {
    // 看看被当前切面所拦截的 bean 中有没有当前 bean 类型
    Boolean eligible = this.eligibleBeans.get(targetClass);
    if (eligible != null) {
        // 如果有直接返回 true
        return eligible;
    }
    if (this.advisor == null) {
        // 如果切面为null则目标 bean 不需要生成代理对象
        return false;
    }
    // 真正的判断逻辑
    // 判断当前 bean 是否命中切入点
    eligible = AopUtils.canApply(this.advisor, targetClass);
    this.eligibleBeans.put(targetClass, eligible);
    return eligible;
}

// org.springframework.aop.support.AopUtils#canApply(org.springframework.aop.Advisor, java.lang.Class<?>)
public static boolean canApply(Advisor advisor, Class<?> targetClass) {
    return canApply(advisor, targetClass, false);
}

public static boolean canApply(Advisor advisor, Class<?> targetClass, boolean hasIntroductions) {
    // 根据切面的具体类型做不同的判断
    if (advisor instanceof IntroductionAdvisor) {
        // 如果是 IntroductionAdvisor
        return ((IntroductionAdvisor) advisor).getClassFilter().matches(targetClass);
    }
    else if (advisor instanceof PointcutAdvisor) {
        // 如果是 PointcutAdvisor, 即带切点的切面, 也就是当前我们关注的校验切面
        PointcutAdvisor pca = (PointcutAdvisor) advisor;
        return canApply(pca.getPointcut(), targetClass, hasIntroductions);
    }
    else {
        // It doesn't have a pointcut so we assume it applies.
        return true;
    }
}

public static boolean canApply(Pointcut pc, Class<?> targetClass, boolean hasIntroductions) {
    Assert.notNull(pc, "Pointcut must not be null");
    // 获得具体的切点类型进行匹配, 这里就是 @Validated 注解切点
    if (!pc.getClassFilter().matches(targetClass)) {
        return false;
    }

    MethodMatcher methodMatcher = pc.getMethodMatcher();
    // 看看当前的切点是不是匹配任意方法, 如果是那就匹配成功
    // 注：注解切点默认匹配所有方法
    if (methodMatcher == MethodMatcher.TRUE) {
        // No need to iterate the methods if we're matching any method anyway...
        return true;
    }

    IntroductionAwareMethodMatcher introductionAwareMethodMatcher = null;
    if (methodMatcher instanceof IntroductionAwareMethodMatcher) {
        introductionAwareMethodMatcher = (IntroductionAwareMethodMatcher) methodMatcher;
    }

    Set<Class<?>> classes = new LinkedHashSet<>();
    if (!Proxy.isProxyClass(targetClass)) {
        classes.add(ClassUtils.getUserClass(targetClass));
    }
    classes.addAll(ClassUtils.getAllInterfacesForClassAsSet(targetClass));

    for (Class<?> clazz : classes) {
        Method[] methods = ReflectionUtils.getAllDeclaredMethods(clazz);
        for (Method method : methods) {
            if (introductionAwareMethodMatcher != null ?
                introductionAwareMethodMatcher.matches(method, targetClass, hasIntroductions) :
                methodMatcher.matches(method, targetClass)) {
                return true;
            }
        }
    }

    return false;
}
```

最终我们会发现这里是根据由于之前使用的是 `AnnotationMatchingPointcut` 注解切点，它会匹配所有的方法，所以说只有类上面标注了 `@Validated` 注解才会被 `MethodValidationInterceptor` 所拦截，在一个方法上或者参数上标注该注解是不会被切面拦截的。

我们知道 AOP 的本质就是动态代理模式，我们看看 `MethodValidationInterceptor` 的 invoke 方法：

```java
// org.springframework.validation.beanvalidation.MethodValidationInterceptor

@Override
public Object invoke(MethodInvocation invocation) throws Throwable {
    // Avoid Validator invocation on FactoryBean.getObjectType/isSingleton
    if (isFactoryBeanMetadataMethod(invocation.getMethod())) {
        return invocation.proceed();
    }

    // 确定分组
    Class<?>[] groups = determineValidationGroups(invocation);

    // Standard Bean Validation 1.1 API
    ExecutableValidator execVal = this.validator.forExecutables();
    Method methodToValidate = invocation.getMethod();
    // Jakarta Bean Validation 规范中定义了获取校验结果集
    Set<ConstraintViolation<Object>> result;

    try {
        // 进行校验
        result = execVal.validateParameters(
            invocation.getThis(), methodToValidate, invocation.getArguments(), groups);
    }
    catch (IllegalArgumentException ex) {
        // Probably a generic type mismatch between interface and impl as reported in SPR-12237 / HV-1011
        // Let's try to find the bridged method on the implementation class...
        methodToValidate = BridgeMethodResolver.findBridgedMethod(
            ClassUtils.getMostSpecificMethod(invocation.getMethod(), invocation.getThis().getClass()));
        result = execVal.validateParameters(
            invocation.getThis(), methodToValidate, invocation.getArguments(), groups);
    }
    // 如果校验失败，报 ConstraintViolationException 异常
    if (!result.isEmpty()) {
        throw new ConstraintViolationException(result);
    }
	
    // 继续走下一个拦截器(切面)
    Object returnValue = invocation.proceed();

    result = execVal.validateReturnValue(invocation.getThis(), methodToValidate, returnValue, groups);
    if (!result.isEmpty()) {
        throw new ConstraintViolationException(result);
    }

    return returnValue;
}
```

逻辑也很简单，但是有几点需要注意：

- 基于 AOP 切面校验失败会报 Jakarta Bean Validation 规范中定义的 `ConstraintViolationException` 异常，最后会被处理为 500 服务端异常；
- 回顾前面 Spring MVC 使用 DataBinder 机制进行校验报的异常是 Spring 校验框架提供的 `BindException` 异常，最后会被处理为 400 Bad Request；

### 测试用例

```java
// java bean
@Data
public class UserAddDTO implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @NotEmpty(message = "登录账户不能为空")
    @Length(min = 5, max = 16, message = "账号长度 5-16 位")
    @Pattern(regexp = "^[a-zA-Z1-9]+$", message = "账号只能包含数字和字母")
    private String name;
    
    @NotEmpty(message = "密码不能为空")
    @Length(min = 4, max = 16, message = "密码长度为 4-16 位")
    private String password;
    
}

// Controller
@Slf4j
@RestController
@RequestMapping("user")
@Validated
public class UserController {

    @GetMapping("/get")
    public void get(@Min(value = 1, message = "编号必须大于 0") Integer id) {
        System.out.println("---> " + id);
    }

    @PostMapping("/add")
    public void save(@Valid UserAddDTO addDTO) {
        log.info("---> " + addDTO);
    }
}
```

需要注意的是这里将 `@Validated` 标注在类上，表示该类被校验切面所拦截，对其中的所有标注了 Jakarta Bean Validation 规范及其实现框架中定义的注解的方法进行校验，同时第二个方法是对对象属性进行校验，此时只能够使用 `@Valid` 注解标注，因为它可以标注在属性上面，支持嵌套校验。

### 异常捕获

总结一下 Spring 对 Bean Validation 的支持：

- 编程式校验：使用 `@InitBinder` 注解注入校验器；
- 声明式校验：使用 `@Validated` 注解标注到类上，切面会拦截类中被切入点切入的方法。

同时如果校验失败：

- 编程式校验只会报 `BindException` 异常；
- 声明式校验则会报两种异常，对应的处理逻辑如下：
  - `BindException`：适用于使用 `@Valid` 注解校验报的异常，在 Spring MVC 中处理异常的组件是 `HandlerExceptionResolver`，而解析 `BindException` 的是其实现类 `DefaultHandlerExceptionResolver`，在该类源码的注释上标明了：
    - BindException 400 (SC_BAD_REQUEST)；
    - 将该异常解析为 HTTP 状态码 400，意为 Bad Request；
  - `ConstraintViolationException`：在 `MethodValidationInterceptor` 中调用 Jakarta Bean Validation 中定义的校验执行器，如果校验失败，则抛出该异常，由于 Sping MVC 的异常解析组件没有针对该异常进行解析，所以最终会被包装为 `NestedServletException`，最终表现为 HTTP 状态码 500，意为服务端错误。

知道了这两个异常后，我们可以利用 Spring MVC 的全局异常捕获机制做特定的拦截处理：

```java
// 定义返回结果
ivate static final long serialVersionUID = 1L;

    /**
     * 错误码
     */
    private Integer code;

    /**
     * 错误提示信息
     */
    private String message;

    /**
     * 返回数据
     */
    private T data;

    private CommonResult() {
    }

    private CommonResult(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
    
    public static <T> CommonResult<T> error() {
        return new CommonResult<>(ResponseEnum.ERROR.getCode(), ResponseEnum.ERROR.getMessage());
    }
    
    public static <T> CommonResult<T> success() {
        return new CommonResult<>(ResponseEnum.SUCCESS.getCode(), ResponseEnum.SUCCESS.getMessage());
    }
    
    public enum ResponseEnum {
        
        SUCCESS(0, "执行成功"),
        ERROR(1, "执行失败"),
        INVALID_REQUEST_PARAM_ERROR(100, "请求参数不合法")
        ;
        
        @Getter
        private final Integer code;
        
        @Getter
        private final String message;

        ResponseEnum(Integer code, String message) {
            this.code = code;
            this.message = message;
        }
    }
}
```

拦截 Controller 层异常：

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final String LOG_PREFIX = "GlobalExceptionHandler :";
    
    @ExceptionHandler(value = BindException.class)
    public CommonResult bindExceptionHandler(HttpServletRequest request, BindException ex) {
        log.error("{}{}", LOG_PREFIX, ex);
        // 拼接校验错误信息
        StringBuilder sb = new StringBuilder();
        for (ObjectError error : ex.getAllErrors()) {
            if (sb.length() > 0)
                sb.append(";");
            sb.append(error.getDefaultMessage());
        }
        
        return CommonResult.error()
                .setCode(CommonResult.ResponseEnum.INVALID_REQUEST_PARAM_ERROR.getCode())
                .setMessage(CommonResult.ResponseEnum.INVALID_REQUEST_PARAM_ERROR.getMessage());
    }
    
    @ExceptionHandler(value = ConstraintViolationException.class)
    public CommonResult constraintViolationExceptionHandler(HttpServletRequest request, ConstraintViolationException ex) {
        log.error("{}{}", LOG_PREFIX, ex);
        // 拼接校验错误信息
        StringBuilder sb = new StringBuilder();
        for (ConstraintViolation<?> constraintViolation : ex.getConstraintViolations()) {
            if (sb.length() > 0)
                sb.append(";");
            sb.append(constraintViolation.getMessage());
        }

        return CommonResult.error()
                .setCode(CommonResult.ResponseEnum.INVALID_REQUEST_PARAM_ERROR.getCode())
                .setMessage(CommonResult.ResponseEnum.INVALID_REQUEST_PARAM_ERROR.getMessage());
    }
}
```

拦截返回结果：

```java
@RestControllerAdvice
public class GlobalResponseBodyHandler implements ResponseBodyAdvice<Object> {
    
    @Override
    public boolean supports(MethodParameter returnType, Class converterType) {
        return true;
    }

    // 将任何返回结果包装为自定义的返回对象
    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType, Class selectedConverterType, ServerHttpRequest request, ServerHttpResponse response) {
        
        if (body instanceof CommonResult)
            return body;
        
        return CommonResult.success().setData(body);
    }
}

```

提示：如果有的时候想要在 `HttpMessageConverter` 工作之前改变 HTTP 响应体，可以实现 `ResponseBodyAdvice` 接口：比如说使用了 `ResponseEntity` 作为返回结果，此时可以通过 `ResponseBodyAdvice` 对响应体做处理。

# 四、例子

## 1、对比 @Valid 和 @Validated

> （1）来源和作用范围：

`@Valid` 是 Bean Validation 规范定义的，可以添加在普通方法、构造方法、方法参数、方法返回值、成员属性上，对目标进行约束校验；

`@Validated` 是 Spring Framework 定义的，可以添加在类、接口、枚举声明、普通方法、方法返回值上，对目标进行约束校验；



> （2）特点：

1、嵌套校验

由于 `@Valid` 注解可以标注在属性上，因此一旦涉及到嵌套校验，即被校验的是一个对象且该对象有对象成员属性，此时只能使用 `@Valid` 注解；

```java
public class One {
    
    @Length(min = 6, max = 10)
    private String property;
    
    @Valid
    private Two two;
}
```

2、分组校验

虽然 Bean Validation 规范提出了分组校验的概念，但是 `@Valid` 注解并没有提供相关支持，反观 `@Validated` 注解有一个属性：

```java
Class<?>[] value() default {};
```

分组校验适用于某个实体类定义了多种校验规则，但是在某些业务场景中要指定其中一种校验规则，此时可以使用分组校验。

3、声明式校验

由于 Spring 将 `@Validated` 作为切面的切点使用，因此它可以实现声明式校验。

4、使用场景

由于单独使用 `@Valid` 注解需要结合 Spring MVC 的 `WebDataBinder` 和 `BindingResult`，其只能用于 Controller 层；

而 `@Validated` 利用了 Spring 提供的声明式校验，因此它可以在 Spring 的多个层次使用，比如 Controller、Service 等等；

## 2、分组校验

首先创建两个接口：

```java
public interface ValidationGroup1 {
}

public interface ValidationGroup2 {
}
```

然后定义实体类：

```java
@Data
public class User {

    private Integer id;

    @Size(min = 5, max = 10, message = "用户姓名长度为 5 到 10 个字符", groups = ValidationGroup1.class)
    private String name;
    
    @NotNull(message = "用户住址不能为空", groups = ValidationGroup2.class)
    private String address;
    
    @DecimalMin(value = "1", message = "用户年龄最小为 1 岁")
    @DecimalMax(value = "200", message = "用户年龄最大为 200 岁")
    private Integer age;
    
    @Email(message = "用户邮箱必须符合规则")
    @NotNull(message = "用户邮箱不能为空", groups = { ValidationGroup1.class, ValidationGroup2.class })
    private String email;
    
}
```

在部分注解中使用了 `groups` 属性，表示该校验规则所属的分组，接下来在 `@Validated` 注解中指定分组：

```java
@Slf4j
@RestController
public class UserController {

    @PostMapping("/user")
    public List<String> addUser(@Validated(ValidationGroup2.class) User user, BindingResult result) {
        
        List<String> errors = new ArrayList<>();
        if (result.hasErrors()) {
            List<ObjectError> allErrors = result.getAllErrors();
            for (ObjectError error : allErrors) {
                errors.add(error.getDefaultMessage());
            }
        }
        
        return errors;
    }
}
```

测试：

```json
// 接口地址:
localhost:8080/user?name=张三&email=123

// 响应结果
{
	"code": 0,
	"message": "执行成功",
	"data": [
		"用户住址不能为空"
	]
}
```

最后发现生效的仅仅是校验注解中 groups 属性指定为 ValidationGroup2.class 的属性。

## 3、手动校验

之前在 Java SE 实战模块中通过校验器工厂结合配置获取校验器实例（Jakarta Bean Validation），而在 Spring 中我们的校验器实例默认就已经注入到容器中了，因此可以直接拿到校验器实例进行校验（注意这里是 `javax.validation.Validator;`）：

```java
@Autowired
private Validator validator;

@PostMapping("/add")
public void save(UserAddDTO addDTO) {
    // 打印 validator 实例类型
    log.info("validator instance: {}", this.validator);
    Set<ConstraintViolation<UserAddDTO>> constraintViolations = this.validator.validate(addDTO);
    for (ConstraintViolation<UserAddDTO> violation : constraintViolations) {
        System.out.println(violation.getPropertyPath() + " -> " + violation.getMessage());
    }
}
```

这里会发现，Validator 实例是：`org.springframework.validation.beanvalidation.LocalValidatorFactoryBean@64780da4`

Spring 正式通过 FactoryBean 的形式将 Bean Validation 提出的校验器实例注入到 Spring 容器中的；

而在 SpringBoot 中，是通过 `ValidationAutoConfiguration` 自动化配置类，默认创建 `LocalValidatorFactoryBean` 作为 Validator Bean。

补充：当然如果你想使用 Spring 提供的校验 api，也可以注入 `org.springframework.validation.Validator`。

## 4、自定义约束

每一个约束都包含两部分：

- `@Constraint` 注解声明约束；
- `javax.validation.ConstraintValidator` 的实现类，用于校验约束；

要将声明与实现相关联，需要使用 `@Constraint` 注解的属性：

```java
@Documented
@Target({ ANNOTATION_TYPE })
@Retention(RUNTIME)
public @interface Constraint {

	Class<? extends ConstraintValidator<?, ?>>[] validatedBy();
}
```

在运行时，当使用定制的约束注解标注在某个域上，`ConstraintValidatorFacotry` 就会实例化约束相关的实现去进行校验。更多用法具体参见 `LocalValidatorFactoryBean`。

举个例子，校验参数必须在枚举类中定义的整数范围内，由于枚举不具备返回所有值组成的数组的功能，因此需要我们自定义一个接口：

```java
public interface IntArrayValuable {
    
    int[] array();
}
```

该接口的实现方必须提供一个整形数组，下面让枚举类实现该接口：

```java
public enum GenderEnum implements IntArrayValuable {
    
    MALE(1, "男"),
    FEMALE(2, "女");

    private final Integer value;
    
    private final String name;
    
    public static final int[] GENDERS = Arrays.stream(values()).mapToInt(GenderEnum::getValue).toArray();

    GenderEnum(Integer value, String name) {
        this.value = value;
        this.name = name;
    }

    public Integer getValue() {
        return value;
    }

    public String getName() {
        return name;
    }

    @Override
    public int[] array() {
        return GENDERS;
    }
    
}
```

下面自定义约束（参考其他的 Jakarta Bean Validation 注解）：

```java
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.CONSTRUCTOR, ElementType.PARAMETER, ElementType.TYPE_USE})
@Retention(value = RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = IntEnumRangeValidator.class)
public @interface IntEnumRange {

    /**
     * 指定的范围, 实现 IntArrayValuable 表示可以返回一组整数
     */
    Class<? extends IntArrayValuable> value();

    /**
     * 错误提示信息, 这里的占位符用于在校验器中替换为目标校验对象所有可用的值
     */
    String message() default "当前整形参数必须在指定范围内: {value}";

    /**
     * 载荷
     */
    Class<? extends Payload>[] payload() default {};

    /**
     * 分组
     */
    Class<?>[] groups() default {};

    @Target({ElementType.METHOD, ElementType.FIELD, ElementType.CONSTRUCTOR, ElementType.PARAMETER, ElementType.TYPE_USE})
    @Retention(value = RetentionPolicy.RUNTIME)
    @Documented
    public @interface List {
        IntEnumRange[] value();
    }
}
```

约束的校验器：

```java
public class IntEnumRangeValidator implements ConstraintValidator<IntEnumRange, Integer> {

    // 注意该校验器内可以注入当前 Spring 容器的其他 Bean
    
    /**
     * 值数组
     */
    private Set<Integer> values;

    /**
     * 初始化方法, 一般用于做准备工作
     */
    @Override
    public void initialize(IntEnumRange constraintAnnotation) {
        // 如果 Class 对象为枚举类, 则通过下面的方法获取枚举类的所有值
        IntArrayValuable[] array = constraintAnnotation.value().getEnumConstants();
        if (array.length == 0)
            this.values = Collections.emptySet();
        else 
            this.values = Arrays.stream(array[0].array()).boxed().collect(Collectors.toSet());
    }

    /**
     * 校验逻辑
     * @param value     待校验的目标
     * @param context   校验上下文
     */
    @Override
    public boolean isValid(Integer value, ConstraintValidatorContext context) {
        
        // 校验通过
        if (this.values.contains(value))
            return true;
        
        // 校验不通过, 提示信息
        // 首先禁用默认的消息
        context.disableDefaultConstraintViolation();
        // 然后替换为指定的信息
        context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate()
                .replaceAll("\\{value}", this.values.toString())).addConstraintViolation();
        
        return false;
    }
}
```

测试 Controller：

```java
@RestController
@Validated
public class CustomTestController {
    
    @GetMapping("/test")
    public void testCustomConstraint(@IntEnumRange(GenderEnum.class) @RequestParam("gender") Integer gender) {

        System.out.println("---> " + gender);
    }
}
```

json：

```json
// 接口
localhost:8080/test?gender=0

// 响应:
{
	"code": 500,
	"message": "当前整形参数必须在指定范围内: [1, 2]",
	"data": null
}
```



## 5、消息源

阅读 `ValidationAutoConfiguration` 自动化配置类中关于 `LocalValidatorFactoryBean` 的配置方法：

```java
@Bean
@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
@ConditionalOnMissingBean(Validator.class)
public static LocalValidatorFactoryBean defaultValidator() {
    LocalValidatorFactoryBean factoryBean = new LocalValidatorFactoryBean();
    MessageInterpolatorFactory interpolatorFactory = new MessageInterpolatorFactory();
    factoryBean.setMessageInterpolator(interpolatorFactory.getObject());
    return factoryBean;
}
```

可以发现这里通过 ObjectFactory 为 LocalValidatorFactoryBean 注入了一个 MessageInterpolator，即消息插值器。这里可以回顾 Spring 的 Message Source：https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#context-functionality-messagesource

进入 `LocalValidatorFactoryBean` 的源码可以看到有两个地方能修改默认的 `javax.validation.MessageInterpolator`：

```java
/**
 * Specify a custom MessageInterpolator to use for this ValidatorFactory
 * and its exposed default Validator.
 */
public void setMessageInterpolator(MessageInterpolator messageInterpolator) {
    this.messageInterpolator = messageInterpolator;
}

/**
	 * Specify a custom Spring MessageSource for resolving validation messages,
	 * instead of relying on JSR-303's default "ValidationMessages.properties" bundle
	 * in the classpath. This may refer to a Spring context's shared "messageSource" bean,
	 * or to some special MessageSource setup for validation purposes only.
	 * <p><b>NOTE:</b> This feature requires Hibernate Validator 4.3 or higher on the classpath.
	 * You may nevertheless use a different validation provider but Hibernate Validator's
	 * {@link ResourceBundleMessageInterpolator} class must be accessible during configuration.
	 * <p>Specify either this property or {@link #setMessageInterpolator "messageInterpolator"},
	 * not both. If you would like to build a custom MessageInterpolator, consider deriving from
	 * Hibernate Validator's {@link ResourceBundleMessageInterpolator} and passing in a
	 * Spring-based {@code ResourceBundleLocator} when constructing your interpolator.
	 * <p>In order for Hibernate's default validation messages to be resolved still, your
	 * {@link MessageSource} must be configured for optional resolution (usually the default).
	 * In particular, the {@code MessageSource} instance specified here should not apply
	 * {@link org.springframework.context.support.AbstractMessageSource#setUseCodeAsDefaultMessage
	 * "useCodeAsDefaultMessage"} behavior. Please double-check your setup accordingly.
	 * @see ResourceBundleMessageInterpolator
	 */
public void setValidationMessageSource(MessageSource messageSource) {
    this.messageInterpolator = HibernateValidatorDelegate.buildMessageInterpolator(messageSource);
}
```

在 `setValidationMessageSource` 方法的注释中，我们可以看到它允许结合 Spring 的消息源为校验器提供错误提示信息，如果需要做国际化处理，可以使用这个方法，自定义 `LocalValidatorFactoryBean`；

同时也得知 JSR-303 默认的消息提示文件是 `ValidationMessages.properties`，下面来感受一下使用属性文件做错误提示。

在 Hibernate Validator 框架中我们可以看到它已经做了消息资源的处理：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220823232932.png)

包含了国际化处理（Spring MVC 中的国际化是依据 HTTP 请求头中的 `Accept-language` 属性），而在注解中，默认的提示信息就是从这些文件中取出的。

```java
public @interface Size {

	String message() default "{javax.validation.constraints.Size.message}";

	// ......
}
```

下面我们在 Maven 的 resources 目录下创建 ValidationMessages.properties 文件，内容如下：

```properties
user.name.size = 用户名长度介于 5 到 10 个字符之间
user.address.notnull = 用户地址不能为空
user.age.size = 年龄输入不正确
user.email.pattern = 邮箱格式不正确
```

修改前面的 User 类：

```java
@Data
public class User {

    private Integer id;

    @Size(min = 5, max = 10, message = "{user.name.size}")
    private String name;
    
    @NotNull(message = "{user.address.notnull}")
    private String address;
    
    @DecimalMin(value = "1", message = "{user.age.size}")
    @DecimalMax(value = "200", message = "{user.age.size}")
    private Integer age;
    
    @Email(message = "{user.email.pattern}")
    @NotNull(message = "{user.email.pattern}")
    private String email;
    
}
```

测试 Controller：

```java
@RestController
@Validated
public class UserTestController {
    
    @PostMapping("/user")
    public void addUser(@Valid @RequestBody User user) {
        System.out.println("---> " + user);
    }
}
```

