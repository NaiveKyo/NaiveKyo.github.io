---
title: Spring MVC First Try
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210919150925.jpg'
coverImg: /img/20210919150925.jpg
toc: true
date: 2021-10-23 19:37:02
top: false
cover: false
summary: "初试 Spring MVC"
categories: "Spring MVC"
keywords: "Spring MVC"
tags: "Spring MVC"
---

# 初试 SpringMVC

## 1、环境搭建

环境：maven 项目 + Servlet4.0 + SpringMVC + Tomcat9.0

pom.xml

```xml
<!-- spring webmvc: core、aop、context、web、beans、expression -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>5.3.9</version>
</dependency>

<!-- Servlet4.0 Support -->
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>4.0.1</version>
    <scope>provided</scope>
</dependency>
```



## 2、SpringMVC 简单配置

配置一个 SpringMVC 只需要三步：

- 在 web.xml 中配置 Servlet
- 创建 SpringMVC 的 xml 配置文件
- 创建 Controller 和 view



### （1）web.xml 中配置 Servlet

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">
    
    <servlet>
        <servlet-name>springmvc</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>springmvc</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
    
    <welcome-flie-list>
    	<welcome-file>index</welcome-file>
    </welcome-flie-list>
</web-app>
```

这里配置了一个叫 springmvc 的 Servlet，自动启动，然后 mapping 到所有的请求。所配置的 Servlet 是 `DispatcherServlet`  类型，它就是 SpringMVC 的入口，SpringMVC 本质就是一个 Servlet。

在配置 `DispatcherServlet`  的时候可以设置 **contextConfigLocation** 参数来指定 SpringMVC 配置文件的位置，如果不指定就默认使用 <mark>WEB-INF/[ServletName]-servlet.xml</mark> 文件，这里使用了默认值，也就是 WEB-INF/springmvc-servlet.xml 文件。



### （2）创建 SpringMVC 的 xml 配置文件

首先在 WEB-INF 目录下新建 springmvc-servlet.xml 文件，然后使用 SpringMVC 最简单的配置方式来进行配置。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:p="http://www.springframework.org/schema/p"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
            http://www.springframework.org/schema/beans/spring-beans.xsd
            http://www.springframework.org/schema/context
            https://www.springframework.org/schema/context/spring-context.xsd
            http://www.springframework.org/schema/mvc
            https://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <mvc:annotation-driven/>
    <context:component-scan base-package="com.naivekyo"/>

</beans>
```

`<mvc:annotation-driven/>` 是 SpringMVC 提供的一键式的配置方法，配置此标签后 Spring MVC 会帮我们自动做一些注册组件之类的事情，这种配置方法非常简单。

`<context:component-scan/>` 标签来扫描通过注解配置的类（如 @Controller、@Service、@Repository），如果项目集成了 Spring，也可以通过 context:include-filter 子标签来设置只扫描 @Controller 就可以了，别的 Bean 交给 Spring 容器去管理，不过我们现在只配置了 Spring MVC，所以就全部放到 Spring MVC 里的，只扫描 @Controller 的配置如下：

```xml
<context:component-scan base-package="com.naivekyo">
    <context:include-filter type="annotation" expression="org.springframework.stereotype.Controller"/>
</context:component-scan>
```



### （3）创建 Controller 和 View

到现在 SpringMVC 的环境已经搭建完成了。我们写一个 Controller 和 View 来测试一下：

```java
package com.naivekyo.controller;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class HelloController {
    
    private final Log logger = LogFactory.getLog(HelloController.class);
    
    // 处理 Head 类型的 "/" 请求
    @RequestMapping(value = {"/"}, method = {RequestMethod.HEAD})
    public String head() {
        return "hello.jsp";
    }
    
    // 处理 GET 类型的 "/index" 和 "/" 请求
    @RequestMapping(value = {"index", "/"}, method = {RequestMethod.GET})
    public String index(Model model) throws Exception {
        
        logger.info("================= processed by index ===================");
        // 返回 msg 参数
        model.addAttribute("msg", "Go Go Go");
        
        return "hello.jsp";
    }
}
```

这里单独写了处理 HEAD 请求的方法，此方法可以用来检测服务器状态，同时因为它不返回带 body 的 Response 所以比 GET 请求更节省网络资源。GET 请求在处理过程中可能会处理一些别的内容，比如初始化一些首页需要显示的内容，还可能会连接数据库，而这些都比较浪费资源，并且对于 HEAD 请求来说也是不需要的，所以用 Head 请求检测服务器状态比较合适。



如果没有配置指定的 ViewResolver，Spring MVC 默认使用 `org.springframework.web.servlet.view.InternalResourceViewResolver` 作为视图解析器，而且 prefix 和 suffix 都是空。所以 hello.jsp 返回值对应的就是根目录下面的 hello.jsp 文件。

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Hello MVC</title>
</head>
<body>

${msg}

</body>
</html>
```

