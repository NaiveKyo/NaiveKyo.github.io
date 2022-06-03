---
title: Nginx Page Statics
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221313.jpg'
coverImg: /img/20220225221313.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-25 10:23:00
summary: "Nginx 做页面静态化处理"
categories: "Nginx"
keywords: "Nginx"
tags: "Nginx"
---



# 页面静态化

## 1、概念

<mark>页面静态化概念</mark>：将页面内需要用到的数据从数据库中查询出来，然后生成一个静态的 HTML 页面，比如首页，用户来访问直接返回静态页面即可。



## 2、原因

<mark>静态化原因</mark>：

- 随着网站内容的增多和用户访问量增多，无可避免的是网站加载会越来越慢，受限于带宽和服务器同一时间的请求次数的限制，此时往往需要对网站进行代码优化和服务器配置的优化；
- 加快页面打开浏览速度，静态页面无需连接数据库，相对动态页面打开速度有明显提高；
- 有利于搜索引擎优化（SEO），Baidu、Google 都会优先收录静态页面；
- 减轻服务器负担，浏览网页无序调用系统数据库；
- 网站更安全，HTML 页面不会受程序相关漏洞影响；
- 提升用户体验，不会因为程序、数据库出现问题，而直接影响网站的访问，能够提升用户对网站的信任度。



## 3、静态页面实现

- 提前准备一个模板文件，在模板文件中把所有用到的数据以及数据展示的代码都提前写好（模板语言）；
- 定义一个函数，通过执行这个函数来生成静态数据：
  - 从数据库查询出所需数据；
  - 使用对应模板文件，给模板文件传递数据进行模板渲染（将模板中的变量替换，得到替换之后的页面内容）；
  - 将替换后的页面内容保存为一个静态文件。



## 4、静态页面更新

- **定时任务**：对于数据更新比较频繁的页面，可以使用操作系统定时任务（或 web 框架、中间件），让应用每隔一段时间自动调用生成静态页面的函数，来重新生成静态页面，以此来保持页面数据和数据库数据同步；
- **修改时更新**：对于数据更新不频繁的页面，更新页面的策略是：如果 Admin 站点通过后台管理页面修改了对应的数据，就会重新生成对应的静态页面。

比如说，首页数据更新比较频繁，采用定时任务进行首页静态页面的更新；对于详情页面，只有当管理员通过 admin 界面修改了数据才会更新对应商品的详情页面。



## 5、页面静态化原理：全静态化、伪静态化

- 动态生成一个页面的开销往往很大，例如需要多次查询数据库或者外部服务。为了减少服务器端的开销和加快网站的运行效率，服务器端会将一个页面的整体内容保存为一个 HTML 文件，这样每次在服务器端获取客户端请求的时候，只要读取对应的文件即可，而不需要重新查询数据库或外部服务并重新生成页面内容。缺点是数据更新之后无法及时的显示在浏览器面前。
- 伪静态是指通过路由的方法把文件的后缀转换为 HTML，即 **URL 重写**。例如，用户访问商品的详情页面，请求类似这样 `goods?id=3`，表示请求 id 为 3 的商品详情，但是在实际情况中使用这种方式请求路径可能是这样的 `goods?page=3&keywords=xxx&category=1&xxx`，这样的 URL 明显是动态的，因此搜索引擎对它的处理可能会有所负面倾斜，例如将其权值放低。因此，很多程序都会把 URL 规范为特别的形式，例如 `goods/3`，甚至是 `goods_3.html`。使用 html 或者 htm 作为 URL 的结尾，是为了 "欺骗" 搜索引擎，让搜索引擎以为是一个直接从存储设备上直接读取的资源，因此 "它的权值可能会相对提高"。这样更有利于网站优化以及页面的抓取，但实际还是需要走服务器从数据库获取数据。优点是数据更新时，可以立即显示在浏览者面前。
  - 一句话概括：将外部请求的静态地址转化为实际的动态页面地址，而静态页面实际是不存在的。
- 还有一种是把页面划分为子数据块，每个数据块可能是一个 inc 文件，也可以多个数据块包含在一个 inc 文件中，具体的数据块划分要根据页面的业务结构来处理。比如，网站头尾的公共数据可以独立成一个文件。

## 6、如何选择

- 网站实时性要求比较高，不要使用页面静态化；
- 如果网站访问量较小，没有必要使用静态化技术；
- 如果数据项目不多，但是访问频率极大，建议使用真静态；
- 如果数据海量使用真静态就会生成大量的 HTML 静态页面，建议使用伪静态。



## 6、静态化和缓存的主要区别

- <font style="color:red">页面静态化</font>是将数据库数据静态化到页面，客户端访问不需要查询数据库，主要存放形式是静态化文件资源，存储于硬盘；
- <font style="color:red">缓存</font>是将数据存储于服务器内存，二者存放位置和形式不一样。

二者的使用主要看业务场景以及网站优化的点：比如说秒杀的时候，肯定会将页面进行静态化放到 CDN 上面，这样在前端就可以抗住大量的并发请求；但是在广告页面的广告数据我们就可以使用页面缓存来实现，同样不用对数据库进行查询，只要访问内存就可以。



# SpringBoot + Thymeleaf 实现页面静态化

思路：通过 Thymeleaf 模板引擎生成静态化 HTML 页面，然后保存到 nginx 服务器上。



## 1、概念介绍

Thymeleaf 模板引擎实现页面静态化涉及到几个概念：

- `Context`：运行上下文；
- `TemplateResolver` 模板解析器；
- `TemplateEngine`：模板引擎。

> Context

Thymeleaf 模板中的上下文，用来保存模型数据，当模板引擎渲染时，可以从 `Context` 上下文中获取数据用于渲染。

使用 Spring Boot 集成 Thymeleaf 时，放入 Model 的数据就会被放入 Context，作为模板渲染的数据使用。

> TemplateResolver

Thymeleaf 模板中的模板解析器，用来读取模板相关的配置，例如：模板存放的位置信息，模板文件名称，模板文件的类型等等。

Spring Boot 集成 Thymeleaf 时，TemplateResolver 已经被自动创建，相关配置可以在 yml 或者 properties 中配置。

> TemplateEngine

Thymeleaf 模板中的模板引擎，用来解析模板的引擎，需要使用到上下文、模板解析器。分别从两者中获取模板所需数据和模板文件。然后利用内置的语法规则解析，从而输出解析后的文件。

下面是模板引擎结合上下文和模板文件进行渲染的函数：

```java
templateEngine.procee('模板名称', context, writer);
```

三个参数：

- 模板名称；
- 上下文：包含模型所需数据；
- writer：数据的输出流。

在输出时，我们可以指定输出的目的地，如果目的地是 `Response`，说明处理的是 web 请求，如果目的地是本地文件，则是页面静态化。

## 2、代码实现

测试用例：对网站首页进行静态化处理。



### （1）线程池配置

> 页面静态化线程池

```java
@Configuration
@EnableAsync
public class AsyncConfiguration implements AsyncConfigurer {

    private static final int CPU_COUNT = Runtime.getRuntime().availableProcessors();

    private static final int CORE_POOL_SIZE = Math.max(2, Math.min(CPU_COUNT - 1, 4));

    private static final int MAX_POOL_SIZE = CPU_COUNT * 2 + 1;

    private static final int WORK_QUEUE = 100;

    private static final int KEEP_ALIVE_TIME = 30;

    @Override
    @Bean("PageStaticizePool")
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor pool = new ThreadPoolTaskExecutor();
        
        pool.setCorePoolSize(CORE_POOL_SIZE);
        pool.setMaxPoolSize(MAX_POOL_SIZE);
        pool.setQueueCapacity(WORK_QUEUE);
        pool.setKeepAliveSeconds(KEEP_ALIVE_TIME);
        pool.setThreadNamePrefix("--PageStaticizeThread--");
        pool.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        pool.initialize();
        
        return pool;
    }
}
```

为什么需要线程池呢？这是因为我们没有采用定时任务的方式，而是选择在处理用户请求时异步生成静态页面。

> 静态化异步任务

```java
@Component
public class StaticAsyncTask {
    
    private Executor executor;

    @Autowired
    public void setExecutor(@Qualifier("PageStaticizePool") Executor executor) {
        this.executor = executor;
    }

    /**
     * 用于执行静态化页面任务
     * 
     * @param runnable 异步任务
     */
    public void pageStaticize(Runnable runnable) {
        executor.execute(runnable);
    }
    
}
```

### （2）跨域配置

由于我们之后要使用 Nginx 反向代理，所以真正的后台服务需要做跨域处理：

```java
@Configuration
public class WebMvcConfiguration implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        
        registry.addMapping("/**")
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowedOrigins("*")
                .maxAge(3600L);
    }
}
```



### （3）处理用户请求

> 处理用户请求

```java
@Controller
public class IndexController {
    
    private final TemplateEngine templateEngine;
    
    private final StaticAsyncTask staticAsyncTask;

    @Autowired
    public IndexController(TemplateEngine templateEngine, StaticAsyncTask staticAsyncTask) {
        this.templateEngine = templateEngine;
        this.staticAsyncTask = staticAsyncTask;
    }

    @RequestMapping(value = {"/", "/index", "index.html"}, method = RequestMethod.GET)
    public String index(Model model) {
        // 正常请求
        String key = "msg";
        String value = "测试 Thymeleaf 静态化页面";
        model.addAttribute(key, value);

        // 异步任务生成静态页面
        // 模板的名称要和生成的 html 文件名一致 
        this.staticAsyncTask.pageStaticize(() -> generateStaticTemplate(key, value, "index"));
        
        return "index";
    }
    
    /**
     * 静态化页面
     * 
     * @param key
     * @param value
     */
    private void generateStaticTemplate(String key, String value, String template) {
        // 页面静态化
        // 初始化 Thymeleaf 上下文
        Context context = new Context();
        // 向上下文中填充数据
        context.setVariable(key, value);
        
        // 注意我这里的路径是在 windows 上部署的 nginx 服务器的目录
        // 如果是线上 Linux 则使用相应的路径, 且注意操作系统文件分割符
        String parentDirectory = "E:\\tools\\nginx-1.18.0\\html\\static";
        File directory = new File(parentDirectory);
        if (!directory.exists()) {
            directory.mkdir();
        }
        String targetFile = template + ".html";
        File file = new File(parentDirectory + "\\" + targetFile);
        if (!file.exists()) {
            try {
                file.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        
        try (PrintWriter pw = new PrintWriter(file)) {
            // 使用模板引擎生成静态 html 页面
            // 从上下文中获取数据填充到模板文件中, 最终输出到目标文件
            this.templateEngine.process(template, context, pw);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
    }
}
```

### （4）Nginx 访问控制

当我们第一次成功对页面进行静态化处理后，将会在 nginx 服务器上生成对应的静态 html 文件，那么下次用户再次请求相同的接口，我们就不能让它直接访问对应的后端服务了，此时要用 Nginx 反向代理服务器，所有请求先走 Nginx，Nginx 对指定的请求 url 进行判断，如果是被静态化处理的请求则先查看 Nginx 服务器上是否存在对应的静态文件，如果存在直接返回静态 html 文件，如果不存在 Nginx 就将请求转发到后台对应的服务接口。 

```conf
server {
    listen			9001;
    server_name		localhost; # 这里是我们使用本机环境, 所以域名是 localhost
    charset			utf-8;

    # location 用来匹配指定统一域名(server_name)下多个 url 的访问规则
    # 注意前面在 Controller 中我们定义的 URL 路径
    location /index {
    # 先到本地 nginx 的 html/static 文件夹下找页面文件，如果存在则直接返回该页面文件
    root html/static;
    if (!-f $request_filename) {
        # 如果请求的文件不存在，就反向代理，利用请求去访问后台服务
        proxy_pass http://localhost:8080;
        break;
    }
    }

}
```

进入 Nginx 目录下通过 cmd 启动 Nginx： `start nginx`

### （5）测试

开启 Nginx 和 Spring Boot 项目后，在浏览器访问 `localhost:9001/index`，此时访问的是后台服务，会触发页面静态化且比较费时，此后访问需要使用这种 `localhost:9001/index.html` 请求格式，此时 Nginx 才会去查找文件，如果还是 `localhost:9001/index` 则仍旧是访问后台服务。