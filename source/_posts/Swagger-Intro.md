---
title: Swagger Intro
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210716114139.jpg'
coverImg: /img/20210716114139.jpg
toc: true
date: 2021-07-16 11:41:08
top: false
cover: false
summary: 前后端联调开发文档 Swgger 学习
categories: Swagger
keywords: Swagger
tags: Swagger
---



# Swagger 3.0 使用教程

## 一、Swagger 介绍

`Swagger` 是一套基于 `OpenAPI` 规范（OpenAPI Specification，OAS）构建的开源工具，后来成为了 Open API 标准的主要定义者，现在最新的版本为17年发布的 Swagger3（Open Api3）。 

国内绝大部分人还在用过时的 swagger2（17年停止维护并更名为swagger3）, 对于 Rest API 来说很重要的一部分内容就是文档，Swagger 为我们提供了一套通过代码和注解自动生成文档的方法，这一点对于保证 API 文档的及时性将有很大的帮助。 OAS 本身是一个API规范，它用于描述一整套API接口，包括一个接口是哪种请求方式、哪些参数、哪些 header 等，都会被包括在这个文件中。它在设计的时候通常是 YAML 格式，这种格式书写起来比较方便，而在网络中传输时又会以 json 形式居多，因为 json 的通用性比较强。 `SpringFox` 是 spring 社区维护的一个项目（非官方），帮助使用者将 swagger2 集成到 Spring 中。



## 二、Swagger 主要三部分

- `Swagger Editor`：基于浏览器的编辑器，我们可以使用它编写我们 OpenAPI 规范。
- `Swagger UI`：它会将我们编写的 OpenAPI 规范呈现为交互式的 API 文档，后文我将使用浏览器来查看并且操作我们的 Rest API。
- `Swagger Codegen`：它可以通过为 OpenAPI（以前称为 Swagger）规范定义的任何 API 生成服务器存根和客户端 SDK 来简化构建过程。



## 三、Springfox 介绍

由于 Spring 的流行，Marty Pitt 编写了一个基于 Spring 的组件 `swagger-springmvc`，用于将 swagger 集成到 springmvc 中来，而 `springfox`则是从这个组件发展而来。

通常SpringBoot项目整合swagger需要用到两个依赖：`springfox-swagger2` 和 `springfox-swagger-ui`，用于自动生成swagger文档。

- springfox-swagger2：这个组件的功能用于帮助我们自动生成描述API的json文件
- springfox-swagger-ui：就是将描述API的json文件解析出来，用一种更友好的方式呈现出来。



## 四、SpringFox 3.0.0 发布

> 官方说明

- SpringFox 3.0.0 发布了，SpringFox 的前身是 swagger-springmvc，是一个开源的 API doc 框架，可以将 Controller 的方法以文档的形式展现。
- 首先，非常感谢社区让我有动力参与这个项目。在这个版本中，在代码、注释、bug报告方面有一些非常惊人的贡献，看到人们在问题论坛上跳槽来解决问题，我感到很谦卑。它确实激励我克服“困难”，开始认真地工作。有什么更好的办法来摆脱科维德的忧郁！
- 注意：这是一个突破性的变更版本，我们已经尽可能地保持与 springfox 早期版本的向后兼容性。在 2.9 之前被弃用的 api 已经被积极地删除，并且标记了将在不久的将来消失的新api。所以请注意这些，并报告任何遗漏的内容。



> 此版本的亮点

- Spring5，Webflux 支持（仅支持请求映射，尚不支持功能端点）。
- Spring Integration支持。
- SpringBoot 支持 springfox Boot starter 依赖性（零配置、自动配置支持）。
- 具有自动完成功能的文档化配置属性。
- 更好的规范兼容性与2.0。
- 支持OpenApi 3.0.3。
- 零依赖。几乎只需要 spring-plugin，swagger-core(https://github.com/swagger-api/swagger-core) ，现有的swagger2注释将继续工作并丰富openapi3.0规范。



> 兼容性说明

- 需要 Java 8
- 需要 Spring5.x（未在早期版本中测试）
- 需要 SpringBoot 2.2+（未在早期版本中测试）



## 五、测试项目



### 1、引入 jar 包

以前引入 Swagger 需要两个 jar 包：

```xml
<!-- Swagger 3.0 -->
<dependency>
  <groupId>io.springfox</groupId>
  <artifactId>springfox-swagger2</artifactId>
  <version>3.0.0</version>
</dependency>

<!-- Swagger-ui -->
<dependency>
  <groupId>io.springfox</groupId>
  <artifactId>springfox-swagger-ui</artifactId>
  <version>3.0.0</version>
</dependency>
```

现在 springboot 整合了 springfox，只需要这样：

```xml
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-boot-starter</artifactId>
    <version>3.0.0</version>
</dependency>

<!-- swagger 中要使用 -->
<dependency>
  <groupId>org.apache.commons</groupId>
  <artifactId>commons-lang3</artifactId>
  <version>3.12.0</version>
</dependency>
```

**然后就可以直接使用 springboot 的自动装配了**



### 2、配置属性类

```java
package com.naivekyo.swaggerstudy.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @author naivekyo
 * @date 2021/7/16
 */
@Component
@ConfigurationProperties("swagger")
public class SwaggerProperties {

    /**
     * 是否开启swagger，生产环境一般关闭，所以这里定义一个变量
     */
    private Boolean enable;

    /**
     * 项目应用名
     */
    private String applicationName;

    /**
     * 项目版本信息
     */
    private String applicationVersion;

    /**
     * 项目描述信息
     */
    private String applicationDescription;

    /**
     * 接口调试地址
     */
    private String tryHost;

    public Boolean getEnable() {
        return enable;
    }

    public void setEnable(Boolean enable) {
        this.enable = enable;
    }

    public String getApplicationName() {
        return applicationName;
    }

    public void setApplicationName(String applicationName) {
        this.applicationName = applicationName;
    }

    public String getApplicationVersion() {
        return applicationVersion;
    }

    public void setApplicationVersion(String applicationVersion) {
        this.applicationVersion = applicationVersion;
    }

    public String getApplicationDescription() {
        return applicationDescription;
    }

    public void setApplicationDescription(String applicationDescription) {
        this.applicationDescription = applicationDescription;
    }

    public String getTryHost() {
        return tryHost;
    }

    public void setTryHost(String tryHost) {
        this.tryHost = tryHost;
    }
}

```



### 3、yml 文件

```yml
spring:
  application:
    name: springfox-swagger
    
server:
  port: 8080
  
#  定义 swagger 配置
swagger:
  enable: true
  application-name: ${spring.application.name}
  application-version: 1.0
  application-description: springfox swagger 3.0 整合Demo
  try-host: http://localhost:${server.port}
```



### 4、配置类

```java
package com.naivekyo.swaggerstudy.config;

import com.naivekyo.swaggerstudy.properties.SwaggerProperties;
import io.swagger.models.auth.In;
import org.apache.commons.lang3.reflect.FieldUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.servlet.config.annotation.InterceptorRegistration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.oas.annotations.EnableOpenApi;
import springfox.documentation.service.*;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.service.contexts.SecurityContext;
import springfox.documentation.spring.web.plugins.Docket;

import java.lang.reflect.Field;
import java.util.*;

/**
 * @author naivekyo
 * @date 2021/7/16
 */
@EnableOpenApi
@Configuration
public class SwaggerConfiguration implements WebMvcConfigurer {

    private final SwaggerProperties swaggerProperties;

    public SwaggerConfiguration(SwaggerProperties swaggerProperties) {
        this.swaggerProperties = swaggerProperties;
    }

    @Bean
    public Docket createRestApi() {
        return new Docket(DocumentationType.OAS_30).pathMapping("/")
                // 定义是否开启 swagger，false 为关闭，可以通过变量控制
                .enable(swaggerProperties.getEnable())
                // 将 api 的元信息设置为包含在 json ResourceListing 响应中
                .apiInfo(apiInfo())
                // 接口调试地址
                .host(swaggerProperties.getTryHost())
                // 选择哪些接口作为 swagger 的 doc 发布
                .select()
                .apis(RequestHandlerSelectors.any())
                .paths(PathSelectors.any())
                .build()
                // 支持的通讯协议集合
                .protocols(newHashSet("https", "http"))
                // 授权信息设置，必要的 header token 等认证信息
                .securitySchemes(securitySchemes())
                // 授权信息全局应用
                .securityContexts(securityContexts());
    }

    /**
     * API 页面上半部分展示的信息
     *
     * @return
     */
    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title(swaggerProperties.getApplicationName() + " Api Doc")
                .description(swaggerProperties.getApplicationDescription())
                .contact(new Contact("lighter", null, "123456@gmail.com"))
                .version("Application Version: " + swaggerProperties.getApplicationVersion())
                .build();
    }

    /**
     * 设置授权信息
     *
     * @return
     */
    private List<SecurityScheme> securitySchemes() {
        ApiKey apiKey = new ApiKey("BASE_TOKEN", "token", In.HEADER.toValue());
        return Collections.singletonList(apiKey);
    }

    /**
     * 授权信息全局应用
     *
     * @return
     */
    private List<SecurityContext> securityContexts() {
        return Collections.singletonList(
                SecurityContext.builder()
                        .securityReferences(
                                Collections.singletonList(
                                        new SecurityReference("BASE_TOKEN", new AuthorizationScope[]{
                                                new AuthorizationScope("global", "")
                                        })
                                )
                        ).build()
        );
    }

    @SafeVarargs
    private final <T> Set<T> newHashSet(T... ts) {
        if (ts.length > 0) {
            return new LinkedHashSet<>(Arrays.asList(ts));
        }
        return null;
    }

    /**
     * 调用通用拦截器排除 swagger 设置，所有拦截器都会自动将 swagger 相关的资源排除
     * @param registry
     */
    @SuppressWarnings("unchecked")
    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        try {
            Field registrationsField = FieldUtils.getField(InterceptorRegistry.class, "registrations", true);
            List<InterceptorRegistration> registrations = (List<InterceptorRegistration>) ReflectionUtils.getField(registrationsField, registry);
            if (registrations != null) {
                for (InterceptorRegistration registration : registrations) {
                    registration
                            .excludePathPatterns("/swagger**/**")
                            .excludePathPatterns("/webjars/**")
                            .excludePathPatterns("/v3/**")
                            .excludePathPatterns("/doc.html");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
```



### 5、常用注解说明

- `@Api`：用在controller类，描述API接口 
- `@ApiOperation`：描述接口方法 
- `@ApiModel`：描述对象 
- `@ApiModelProperty`：描述对象属性
-  `@ApiImplicitParams`：描述接口参数
-  `@ApiResponses`：描述接口响应 
- `@ApiIgnore`：忽略接口方法

### 6、访问地址

现在 swagger 访问的界面为： `http:/hostname/swagger-ui/index.html` 或者 `http:/hostname/swagger-ui/ `
