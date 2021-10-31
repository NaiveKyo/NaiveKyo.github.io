---
title: Spring MVC Components Overview
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211005110150.jpg'
coverImg: /img/20211005110150.jpg
toc: true
date: 2021-10-31 14:46:16
top: true
cover: false
summary: "Spring MVC 组件概述"
categories: "Spring MVC"
keywords: "Spring MVC"
tags: "Spring MVC"
---

# 组件概览

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031144913.png)

本文对 DispatcherServlet 中初始化的 9 个组件进行介绍。



## 1、HandlerMapping

Handler Mapping 的作用是根据 request 找到相应的处理器 Handler 和  Interceptors，HandlerMapping 接口里面只有一个方法：

```java
// org.springframework.web.servlet.HandlerMapping

@Nullable
HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception;
```

该方法的实现非常灵活，只要使用 Request 返回 HandlerExcetionChain 就可以了，我们也可以自定义一个 HandlerMapping，然后实现 getHandler 方法。

下面来举个例子：

```java
public class TudouHandlerMapping implements HandlerMapping {
    
    @Override
    public HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {

        // 获取请求地址和类型
        String url = request.getRequestURI().toString();
        String method = request.getMethod();
        
        if (url.startsWith("/tudou")) {
            if (method.equalsIgnoreCase("GET"))
                return "maidigua" 对应的 Handler;
            else if (method.equalsIgnoreCase("POST"))
                return "shuodigua" 对应的 Handler;
            else
                return "digua" 对应的 Handler;
        }

        return null;
    }
}
```

上面的伪代码中定义了一个 TudouHandlerMapping，将以 tudou 开头的请求按照不同类型对应到不同的 Handler，比如 GET 类型的对应到 maidigua（卖地瓜），POST 类型的对应到 shuodigua（收地瓜），其他全部交给 digua 处理器。

当然，这只是一个伪代码，并不能带到实际中使用，因为没有创建实际的 Handler，另外返回值除了有 Handler 之外还应该包含 Interceptor。这里的 HandlerMapping 只能查找 "tudou" 相关的 Handler，而更一般的做法是维护一个对应多个请求的 map，其实 `SimpleUrlHandlerMapping` 的基本原理就是这样。

HandlerMapping 编写出来之后需要注册到 Spring MVC 的容器里面才可以使用，注册也非常简单，只需要在配置文件中配置一个 Bean 就可以了，Spring MVC 会按照类型将它注册到 HandlerMapping 中。

<br>

上面其实还是忽略了一个问题，它将所有以 tudou 开头的请求都对应到了 digua 相关的处理器，好像没什么问题，但是如果有一个专门处理 tudoupian（土豆片）的处理器（处理以 tudoupian 开头的 url），而且是在另外的 HandlerMapping 中进行的映射，这就涉及到了先使用哪个 HandlerMapping 来查找处理器的问题了，如果先使用了 TudouHandlerMapping 就会将 tudoupian 的请求也交给 tudou 的处理器，这样就出问题了，这个时候 HandlerMapping 的先后顺序就非常重要了，这里的顺序可以通过 `order` 属性来定义（当然 HandlerMapping 需要实现 Ordered 接口，在 JavaConfig 中给 Bean 加 @Order 注解），order 越小越先使用。

```xml
<bean class="com.naivekyo.handlerMappingConfig.TudouHandlerMapping" 
      p:order="1" />
<bean class="com.naivekyo.handlerMappingConfig.TudoupianHandlerMapping"
      p:order="0" />
```

查找 Handler 是按顺序遍历所有的 HandlerMapping，当找到一个 HandlerMapping 后立即停止查找并返回：

```java
// org.springframework.web.servlet.DispatcherServlet#getHandler()

@Nullable
protected HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {
    if (this.handlerMappings != null) {
        for (HandlerMapping mapping : this.handlerMappings) {
            HandlerExecutionChain handler = mapping.getHandler(request);
            if (handler != null) {
                return handler;
            }
        }
    }
    return null;
}
```



## 2、HandlerAdapter

之前介绍过 HandlerAdapter，可以理解为使用 Handler 干活的人。它里面一共有三个方法：

- `support(Object handler)`：判断是否可以使用某个 Handler
- `handle(HttpServletRequest request, HttpServletResponse response, Object handler)`：用来使用具体的 Handler 干活
- `getLastModified(HttpServletRequest request, Object handler)`：获取资源的 Last-Modified（<mark>注：这个方法现在已经不推荐使用了，具体参见源码</mark>）

```java
// org.springframework.web.servlet.HandlerAdapter

public interface HandlerAdapter {

	boolean supports(Object handler);

	@Nullable
	ModelAndView handle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception;

    
	@Deprecated
	long getLastModified(HttpServletRequest request, Object handler);
}
```

之所以要是有 HandlerAdapter 是因为 Spring MVC 中没有对处理器做任何限制，处理器可以以任何合理的方式来表现，可以是一个类，也可以是一个方法，还可以是其他什么合理的方式，从 handle 方法的参数中看到它是一个 Object 类型。这种模式就给了开发者极大的自由。

接着前面写的 TudouHandlerMapping，下面写对应的 Handler 和 HandlerAdapter

Handler：

```java
public class MaiDiguaController {
    
    public ModelAndView maidigua(HttpServletRequest request, HttpServletResponse response) {

        // 拣地瓜
        // ...

        // 称重
        // ...

        // 算钱
        // ...
        
    }
}
```

HandlerAdatper：

```java
public class MaiDiguaHandlerAdapter implements HandlerAdapter {
    
    @Override
    public boolean supports(Object handler) {
        
        return handler instanceof MaiDiguaController;
    }

    @Override
    public ModelAndView handle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        
        return ((MaiDiguaController) handler).maidigua(request, response);
    }

    @Override
    public long getLastModified(HttpServletRequest request, Object handler) {
        
        return -1L;
    }
}
```

上面的 Controller 就是具体的处理工具；

下面的 HandlerAdapter 就是工具的使用者；

MaiDiguaHandlerAdapter 使用 MaiDiguaController 完成卖地瓜这件事，当然这里只是简单的调用。

下面再看一个 Spring MVC 自己的 HandlerAdatper —— `SimpleControllerHandlerAdapter`，代码如下：

```java
// org.springframework.web.servlet.mvc.SimpleControllerHandlerAdapter

public class SimpleControllerHandlerAdapter implements HandlerAdapter {

	@Override
	public boolean supports(Object handler) {
		return (handler instanceof Controller);
	}

	@Override
	@Nullable
	public ModelAndView handle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {

		return ((Controller) handler).handleRequest(request, response);
	}

	@Override
	@SuppressWarnings("deprecation")
	public long getLastModified(HttpServletRequest request, Object handler) {
		if (handler instanceof LastModified) {
			return ((LastModified) handler).getLastModified(request);
		}
		return -1L;
	}

}
```

可以看到这个 Adapter 也非常简单，是用来使用实现了 Controller 接口的处理器干活的，干活的方式就是直接调用处理器的 `handleRequest` 方法（<mark>函数式标记接口 Controller 中的方法</mark>）。

选择使用哪个 HandlerAdapter 的过程在 `DispatcherServlet#getHandlerAdapter` 方法中，它的逻辑是遍历所有的 Adapter，然后检查哪个可以处理当前的 Handler，找到第一个可以处理 Handler 的 Adapter 后就停止查找并将其返回。

既然需要挨个检查，那就需要有一个顺序，这里的顺序同样是通过 order 属性来设置的。getHandlerAdatper 方法代码如下：

```java
// org.springframework.web.servlet.DispatcherServlet#getHandlerAdapter

protected HandlerAdapter getHandlerAdapter(Object handler) throws ServletException {
    if (this.handlerAdapters != null) {
        for (HandlerAdapter adapter : this.handlerAdapters) {
            if (adapter.supports(handler)) {
                return adapter;
            }
        }
    }
    throw new ServletException("No adapter for handler [" + handler +
                               "]: The DispatcherServlet configuration needs to include a HandlerAdapter that supports this handler");
}
```

HandlerAdapter 需要注册到 Spring MVC 容器里，注册方法和 HandlerMapping 一样，只要配置一个 Bean 就可以了。Handler 是从 HandlerMapping 里返回的。

## 3、HandlerExceptionResolver

别的组件都是在正常情况下来干活的，不过干活的过程中难免出现问题，出现问题后该怎么办？这就需要有一个专门的角色对异常情况进行处理，在 Spring MVC 中就是 HandlerExceptionResolver。

具体来说，此组件的作用是根据异常设置 ModelAndView，之后交给 render 方法进行渲染。

render 只负责将 ModelAndView 渲染成页面，具体 ModelAndView 是怎么来的 render 并不关心。这也是 Spring MVC 设计优秀的一个表现 —— 分工明确互不干扰。

通过前面的 doDispatch 的分析可以知道 HandlerExceptionResolver 只是用于解析对请求做处理的过程中产生的异常，而渲染环节的产生的异常并不归它管，现在我们就知道原因了 ：它是在 render 之前工作的，先解析出 ModelAndView 之后 render 才去渲染，当然它就不能处理 render 过程中的异常了。

知道了这一点可以为我们分析一些问题提供方便。

HandlerExceptionResolver 接口定义如下：

```java
//org.springframework.web.servlet.HandlerExceptionResolver

public interface HandlerExceptionResolver {

	@Nullable
	ModelAndView resolveException(
			HttpServletRequest request, HttpServletResponse response, @Nullable Object handler, Exception ex);

}
```

结构非常简单，只有一个方法，只需要从异常解析出 ModelAndView 就可以了。具体实现可以维护一个异常为 key、View 为 value 的 Map，解析时直接从 Map 里获取 View，如果在 Map 里面没有相应的异常可以返回默认的 View。

另外建议如果开发内网的系统则可以在出错页面显示一些细节，这样方便调试，但如果是做互联网的系统最好不要将异常的太多细节显示给用户，因为那样很容易被黑客利用。当然，无论给不给异常显示细节，日志都要做的尽可能详细。



## 4、ViewResolver

ViewResolver 用来将 String 类型的视图名（有的地方叫做逻辑视图，都指同一个东西）和 Locale 解析为 View 类型的视图，ViewResolver 接口也非常简单，只有一个方法，定义如下：

```java
// org.springframework.web.servlet.ViewResolver

public interface ViewResolver {

	@Nullable
	View resolveViewName(String viewName, Locale locale) throws Exception;

}
```

从该接口方法可以看出想解析视图需要 视图名 和 Locale，不过一般情况下我们只需要根据视图名找到对应的视图，并不需要对不同的区域使用不同的视图进行显示，如果需要国际化支持也只要将显示的内容或者主体使用国际化支持，不过 Spring MVC 确实具有这个功能，可以让不同的区域的使用不同的视图进行显示。

`ResourceBundleViewResolver` 需要将每一个视图名和对应的视图类型配置到相应的 properties 文件中，默认使用 classpath 下面的 views 为 baseName 的配置文件，如 views.properties、views_zh_CN.properties 等等，bashName 和文件位置都可以设置。

<mark>如果了解 ResourceBundle 就会明白，不同的 Locale 会使用不同的配置文件，而且它们之间没有任何关系，这样就可以让不同的区域使用不同的 View 进行渲染了。</mark>



View 是用来渲染页面的，通俗点来说就是将程序返回的参数填入模板中，生成 html（也可能是其他类型）文件。这里有两个关键问题：

- 使用哪个模板？
- 用什么技术（或者规则）填入参数？

这其实就是 ViewResolver 主要要做的工作，ViewResolver 需要找到渲染所用的模板和所用的技术（也就是视图的类型）进行渲染，具体的渲染过程则交给不同的视图自己完成。

我们最常使用的 `UrlBasedViewResolver` 系列的解析器都是针对单一视图类型进行解析的，只需要找到使用的模板就可以了，比如：`InternalResourceViewResolver` 只针对 jsp 类型视图，`FreeMarkerViewResolver` 只针对 FreeMarker，`VelocityViewResolver` 只针对 Velocity。而 `ResourceBundleViewResolver`、`XmlViewResolver`、`BeanNameViewResolver` 等解析器可以同时解析多种类型的视图。

如前面说的 ResourceBundleViewResolver，它是根据 properties 配置文件来解析的，配置文件里就需要同时配置 class 和 url 两项内容：

```properties
hello.(class) = org.springframework.web.servlet.view.InternalResourceView
hello.url = /WEB-INF/go.jsp
```

这样九江 hello 配置到 /WEB-INF/go.jsp 模板的 jsp 类型视图了，当 Controller 返回 hello 时会使用这个视图来进行渲染。视图的类型是根据 .class 的配置项来确定的。

XmlViewResolver 和 ResourceBundleViewResolver 类似，只不过它是从 xml 文件中解析配置，现在已经不推荐使用了。

BeanNameViewResolver 是根据 ViewName 从 ApplicationContext 容器中查找相应的 bean 做 View 的，这个实现比较简单，源码如下：

```java
// org.springframework.web.servlet.view.BeanNameViewResolver

public class BeanNameViewResolver extends WebApplicationObjectSupport implements ViewResolver, Ordered {

	private int order = Ordered.LOWEST_PRECEDENCE;  // default: same as non-Ordered


	/**
	 * Specify the order value for this ViewResolver bean.
	 * <p>The default value is {@code Ordered.LOWEST_PRECEDENCE}, meaning non-ordered.
	 * @see org.springframework.core.Ordered#getOrder()
	 */
	public void setOrder(int order) {
		this.order = order;
	}

	@Override
	public int getOrder() {
		return this.order;
	}


	@Override
	@Nullable
	public View resolveViewName(String viewName, Locale locale) throws BeansException {
		ApplicationContext context = obtainApplicationContext();
		if (!context.containsBean(viewName)) {
			// Allow for ViewResolver chaining...
			return null;
		}
		if (!context.isTypeMatch(viewName, View.class)) {
			if (logger.isDebugEnabled()) {
				logger.debug("Found bean named '" + viewName + "' but it does not implement View");
			}
			// Since we're looking into the general ApplicationContext here,
			// let's accept this as a non-match and allow for chaining as well...
			return null;
		}
		return context.getBean(viewName, View.class);
	}

}
```

可以看到其原理就是根据 viewName 从 spring 容器中查找 Bean，如果查找不到或者查找后不是 View 类型则返回 null，否则返回容器中的 Bean。



ViewResolver 的使用需要注册到 Spring MVC 容器里面，默认使用的是 `org.springframework.web.servlet.view.InternalResourceViewResolver` 。



## 5、RequestToViewNameTranslator

ViewResolver 是根据 ViewName 查找 View，但有的 Handler 处理完后并不会设置 View 也没有设置 viewName，这时就需要从 request 中获取 viewName 了，而如何从 request 获取 viewName 就是 ReqeustToViewNameTranslator 要做的事情。

`ReqeustToViewNameTranslator ` 接口定义如下：

```java
// org.springframework.web.servlet.RequestToViewNameTranslator

public interface RequestToViewNameTranslator {

	/**
	 * Translate the given {@link HttpServletRequest} into a view name.
	 * @param request the incoming {@link HttpServletRequest} providing
	 * the context from which a view name is to be resolved
	 * @return the view name, or {@code null} if no default found
	 * @throws Exception if view name translation fails
	 */
	@Nullable
	String getViewName(HttpServletRequest request) throws Exception;

}
```

其中只有一个方法 getViewName，只要通过 request 获取到 viewName 就可以了。

实际使用的时候应该设置一套规则作为 request 和 viewName 的映射关系。

`RequestToViewNameTranslator` 在 Spring MVC 容器中只可以配置一个，所以所有 request 到 ViewName 的转换规则都要在一个 Translator 里面全部实现。



## 6、LocaleResolver

从 ViewAndModel 中解析视图需要两个参数，一个是视图名，另一个是 Locale。

视图名是从处理器返回的（或者使用 RequestToViewNameTranslator 从 request 中解析的默认视图名），Locale 是从哪里来的呢？

这就是 LocaleResolver 要做的事情。

LocaleResolver 用于从 request 中解析出 Locale。Locale 前面已经介绍过，就是如 zh_CN 之类，表示一个区域。有了这个就可以根据不同区域的用户显示不同的结果，这就是 i18n（国际化）的基本原理，LocaleResolver 是 i18n 的基础。

LocaleResolver 接口如下：

```java
// rg.springframework.web.servlet.LocaleResolver

public interface LocaleResolver {

	/**
	 * Resolve the current locale via the given request.
	 * Can return a default locale as fallback in any case.
	 * @param request the request to resolve the locale for
	 * @return the current locale (never {@code null})
	 */
	Locale resolveLocale(HttpServletRequest request);

	/**
	 * Set the current locale to the given one.
	 * @param request the request to be used for locale modification
	 * @param response the response to be used for locale modification
	 * @param locale the new locale, or {@code null} to clear the locale
	 * @throws UnsupportedOperationException if the LocaleResolver
	 * implementation does not support dynamic changing of the locale
	 */
	void setLocale(HttpServletRequest request, @Nullable HttpServletResponse response, @Nullable Locale locale);

}
```

接口定义也很简单，主要两个方法，分别表示：

- 从 request 中解析出 Locale
- 将特定的 Locale 设置给某个 request

之前介绍 doService 方法时，容器会将 localeResolver 设置到 request 的 attribute，代码如下：

```java
// DispatcherServlet
request.setAttribute(LOCALE_RESOLVER_ATTRIBUTE, this.localeResolver);
```

这样就让我们在需要使用 Locale 的时候可以直接从 request 中拿到 localeResolver，然后解析出 Locale。

Spring MVC 中主要在两个地方用到了 Locale：

- ViewResolver 解析视图的时候
- 使用到国际化资源或者主题的时候

ViewResolver 之前已经介绍过，国际化资源和主题主要使用 RequestContext 的 getMessage 和 getThemeMessage 方法。

`<spring:message="......"/>` 标签内部其实就是使用的 RequestContext，只不过没有直接调用 getMessage 而是先调用了 getMessageSource 然后再内部调用了 getMessage，详细代码见 `org.springframework.tags.MessageTag`。



LocaleResovler 的作用我们已经清楚了，不过有时候需要提供人为设置区域的功能，比如很多网站可以选择显示什么语言，这就需要提供人为修改 Locale 的机制。

在 Spring MVC 中非常简单，只需要调用 LocaleResovler 的 setLocale 方法即可。可是在哪里调用呢？我们可以写一个 Controller 来专门修改 Locale，不过那样使用比较麻烦，返回的视图不容易确定。那么如何解决呢？其实使用 Interceptor 就可以做到，而且 Spring MVC 已经写好了，我们只需要配置进去就可以了，这就是 `org.springframework.web.servlet.i18n.LocaleChangeInterceptor`，配置方法如下：

```xml
<mvc:interceptors>
    <mvc:interceptor>
        <mvc:mapping path="/*"/>
        <bean class="org.springframework.web.servlet.i18n.LocaleChangeInterceptor" />
    </mvc:interceptor>
</mvc:interceptors>
```

这样就可以通过 locale 参数来修改 Locale 了，比如：

`http://localehost:8080?locale=zh_CN`

`http://localehost:8080?locale=en`

这里的 "locale" 也可以通过 paramName 设置为别的名字，如设置为 "lang"

```java
<mvc:interceptors>
    <mvc:interceptor>
        <mvc:mapping path="/*"/>
        <bean class="org.springframework.web.servlet.i18n.LocaleChangeInterceptor" p:paramName="lang"/>
    </mvc:interceptor>
</mvc:interceptors>
```

## 7、ThemeResolver

ThemeResolver 从名字上看就可以知道是解析主题用的。接口定义如下：

```java
// org.springframework.web.servlet.ThemeResolver

public interface ThemeResolver {

	/**
	 * Resolve the current theme name via the given request.
	 * Should return a default theme as fallback in any case.
	 * @param request the request to be used for resolution
	 * @return the current theme name
	 */
	String resolveThemeName(HttpServletRequest request);

	/**
	 * Set the current theme name to the given one.
	 * @param request the request to be used for theme name modification
	 * @param response the response to be used for theme name modification
	 * @param themeName the new theme name ({@code null} or empty to reset it)
	 * @throws UnsupportedOperationException if the ThemeResolver implementation
	 * does not support dynamic changing of the theme
	 */
	void setThemeName(HttpServletRequest request, @Nullable HttpServletResponse response, @Nullable String themeName);

}
```

不同的主题其实就是换了一套图片、显示效果以及样式等。

Spring MVC 中一套主题对应一个 properties 文件，里面存放着跟当前主题相关的所有资源，如图片、css 样式等等，例如：

```properties
# theme.properties
logo.pic = /images/default/logo.jpg
logo.word = naivekyo
style = /css/default/style.css
```

将上面的文件命名为 theme.properties 放到 classpath 下面就可以在页面中使用了，如果是在 jsp 页面中，使用 `<spring:theme code="logo.word"/>` 就可以得到 naivekyo 了（当然需要引入 spring 的标签库 `<%@ taglibprefix="spring" uri="http://www.springframework.org/tags" %>`。

现在所用的主题就叫做 theme，主题名也就是文件名，所以创建主题非常简单，只需要准备好资源，然后新建一个以主题名为文件名的 properties 文件并将资源设置进去就可以了。

另外，Spring MVC 的主题也支持国际化，也就是说同一个主题不同的区域也可以显示不同的风格，比如，可以定义如下主题文件：

```properties
# theme.properties
theme_zh_CN.properties
theme_en_US.properties
......
```

这样即使同样使用 theme 主题，不同的区域也会调用不同的主题文件里的资源进行显示。

Spring MVC 中跟主题有关的类主要有 ThemeResovler、ThemeSource 和 Theme。

从上面的接口可以看出：

- ThemeResolver 主要是从 request 中解析出主题名；
- ThemeSource 则是根据主题名找到具体的主题；
- Theme 是 ThemeSource 找出的一个具体的主题，可以通过它获取主题里具体的资源。

获取主题的资源依然是在 RequestContext 中，代码如下：

```java
// org.springframework.web.servlet.support.RequestContext

public String getThemeMessage(String code, @Nullable Object[] args, String defaultMessage) {
    String msg = getTheme().getMessageSource().getMessage(code, args, defaultMessage, getLocale());
    return (msg != null ? msg : "");
}


public Theme getTheme() {
    if (this.theme == null) {
        // Lazily determine theme to use for this RequestContext.
        this.theme = RequestContextUtils.getTheme(this.request);
        if (this.theme == null) {
            // No ThemeResolver and ThemeSource available -> try fallback.
            this.theme = getFallbackTheme();
        }
    }
    return this.theme;
}
```

可以看出这里首先从 RequestContextUtils 获取到 Theme，然后获取对应的资源，在看看 RequestContextUtils 是如何获取 Theme 的：

```java
// org.springframework.web.servlet.support.RequestContextUtils

@Nullable
public static Theme getTheme(HttpServletRequest request) {
    ThemeResolver themeResolver = getThemeResolver(request);
    ThemeSource themeSource = getThemeSource(request);
    if (themeResolver != null && themeSource != null) {
        String themeName = themeResolver.resolveThemeName(request);
        return themeSource.getTheme(themeName);
    }
    else {
        return null;
    }
}
```

这里就可以清楚地看到 ThemeResolver 和 ThemeSource 的作用。

ThemeResolver 的默认实现是 `org.springframework.web.servlet.theme.FixedThemeResolver` ，这里面使用的默认主题名就叫 "theme" ，这也就是前面使用 theme 主题时不用配置也可以使用的原因。

从 DispatcherServlet 中可以看到 ThemeResolver 默认使用的是 WebApplicationContext。

在 Spring MVC 容器创建时介绍过 `WebApplicationContext` 是在 FrameworkServlet 中创建的，默认使用的是 `XmlWebApplicationContext`，其父类是 `AbstractRefreshableWebApplicationContext`，这个类实现了 ThemeSource 接口，其实现方式是内部封装了一个 ThemeSource 属性，然后将具体工作丢给它去干。



现在我们就把整个原理弄明白了：主题是通过一系列资源来具体实现的，要得到一个主题的资源，首先要得到资源的名称，这个是 ThemeResolver 的工作，然后用资源名称找到对应的主题（可以理解为一个配置文件），这是 ThemeSource 的工作，最后使用主题获取到里面具体的资源就可以了。

ThemeResolver 默认使用的是 `FixedThemeResolver`，ThemeSource 默认使用的是 `WebApplicationContext`（其实是 `AbstractRefreshableWebApplicationContext` 里的 ThemeSource），不过我们也可以自己来配置，例如：

```xml
<bean id="themeSource" class="org.springframework.ui.context.support.ResourceBundleThemeSource"
      p:basenamePrefix="com.naivekyo.themes." />

<bean id="themeResolver" class="org.springframework.web.servlet.theme.CookieThemeResolver"
      p:defaultThemeName="default" />
```

这里不仅配置了 themeResolver 和 themeSource，而且还配置了默认主题名为 "default"，以及配置文件的位置在 com.naivekyo.themes 包下面（注意配置时最后有个 "."）。

主题是怎么回事就分析完了，下面看如何切换主题，如果主题不切换就失去了主题的意义，所以主题的切换非常重要，也就是使用 Interceptor。配置如下：

```xml
<mvc:interceptors>
    <mvc:interceptor>
        <mvc:mapping path="/*"/>
        <bean class="org.springframework.web.servlet.theme.ThemeChangeInterceptor" 
              p:paramName="theme"/>
    </mvc:interceptor>
</mvc:interceptors>
```

可以通过 paramName 设置修改主题的参数名，默认使用 "theme"，下面的请求可以换成 summer 主题：

`http://localhost:8080?theme=summer`

## 8、MultipartResolver

MultipartResolver 用于处理上传请求，处理方法是将普通的 request 包装成 MultipartHttpServletRequest，后者可以直接调用 getFile 方法获取到 File，如果上传多个文件，还可以调用 getFileMap 得到 FileName ---》 File 结构的 Map，这样就使得上传请求的处理变得非常简单。

当然，这里做的其实是锦上添花的事情，如果上传的请求不用 MultipartResolver 封装成 MultipartHttpServletRequest，直接使用原来的 request 也是可以的，所以在 Spring MVC 中此组件没有提供默认值。

MultipartResolver 定义如下：

```java
// org.springframework.web.multipart.MultipartResolver

public interface MultipartResolver {

	boolean isMultipart(HttpServletRequest request);

	MultipartHttpServletRequest resolveMultipart(HttpServletRequest request) throws MultipartException;

	void cleanupMultipart(MultipartHttpServletRequest request);

}
```

这里一共三个方法，作用分别是判断是不是上传请求、将 request 包装成 MultipartHttpServletReques、处理完后清理上传过程中产生的临时资源。对上传请求可以简单地判断是不是 multipart/form-data 类型。

## 9、FlashMapManager

FlashMap 之前已经介绍过了，主要用于在 redirect 中传递参数。而 FlashMapManager 是用来管理 FlashMap 的，定义如下：

```java
// org.springframework.web.servlet.FlashMapManager

public interface FlashMapManager {

	@Nullable
	FlashMap retrieveAndUpdate(HttpServletRequest request, HttpServletResponse response);

	void saveOutputFlashMap(FlashMap flashMap, HttpServletRequest request, HttpServletResponse response);

}
```

`retrieveAndUpdate()` 方法用于恢复参数 ，并将恢复过的和超时的参数从保存介质中删除；

`saveOutputFlashMap()` 用于将参数保存起来。

默认实现是：`org.springframework.web.servlet.support.SessionFlashMapManager`，它是将参数保存到 session 中。

整个 redirect 的参数通过 FlashMap 传递的过程分为三步：

1. 在处理器中将需要传递的参数设置到 outputFlashMap 中，设置方法在分析 DispatcherServlet 的时候已经分析过了，可以直接使用 `request.getAttribute(DispatcherServlet.OUTPUT_FLASH_MAP_ATTRIBUTE)` 拿到 outputFlashMap，然后将参数 put 进去，也可以将需要传递的参数设置到处理器的 `RedirectAttributes` 类型的参数中，当处理器处理完请求时，如果是 redirect 类型的返回值 RequestMappingHandlerAdapter 会将其设置到 outputFlashMap 中。
2. 在 RedirectView 的 renderMergedOutputModel 方法中调用 FlashMapManager 的 saveOutputFlashMap 方法，将 outputFlashMap 中的参数设置到 Session 中。
3. 请求 redirect 后 DispatchServlet 的 doService 会调用 FlashMapManager 的 retrieveAndUpdate 方法从 Session 中获取 inputFlashMap 并设置到 Request 的属性中备用，同时从 Session 中删除。

