---
title: Nginx_Intro
author: NaiveKyo
hide: false
img: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/5.jpg
coverImg: /medias/featureimages/5.jpg
toc: true
date: 2021-07-07 17:22:44
top: false
cover: false
summary: 学习 Nginx 知识，了解其主要作用和常用命令。
categories: Nginx
keywords:
  - Nginx
tags:
  - Nginx
---



# Redis Introduction



## 一、为什么要使用 Nginx

### 1、问题

> 并发量增大带来的问题

- 项目刚上线，并发量小，用户数量少，在低并发的情况下，一个 jar 包启动应用就够了，然后内部 tomcat 返回内容给客户。

- 但是当用户越来越多时，并发量慢慢增大，这时一台服务器已经无法满足需求
- 于是最简单的方法是横向扩展，增加服务器，将几个项目启动在不同的服务器上，用户要访问，就需要增加一个 **代理服务器**（Session 不共享），通过代理服务器帮我们转发和处理请求。

- 同时由于不同的服务器处理能力不同，所以我们希望处理能力强的服务器接收更多的请求，所以要为服务器加权重，也就是 **负载均衡**
- 我们希望这个代理服务器可以帮助我们接收用户的请求，然后将用户的请求按照规则帮我们转发到不同的服务器节点上，这个过程是用户无法感知的，用户并不知道是哪个服务器返回的结果，我们还希望它可以按照服务器的性能提供不同的权重选择，保证效率，所以我们使用 Nginx



### 2、什么是 Nginx

- Nginx（engine x）是一个高性能的 HTTP 和反向代理 web 服务器，同时也提供 IMAP/POP3/SMTP 服务，Nginx 是由俄罗斯的程序设计师 lgor Sysoev 所开发，供俄国大型的入口网站及搜索引擎 Rambler 使用。

- 其特点是占有内存少，并发能力强，事实上 nginx 的并发能力确实在同类型的网页服务器中表现较好。

- Nginx相较于 Apache\lighttpd 具有占有内存少，稳定性高等优势，并且依靠并发能力强，丰富的模块库以及友好灵活的配置而闻名。

- 在 Linux 操作系统下，nginx 使用 epoll 事件模型,得益于此，nginx 在 Linux 操作系统下效率相当高。同时 Nginx 在 OpenBSD 或 FreeBSD 操作系统上采用类似于 Epoll 的高效事件模型 kqueue。
- Nginx 作为负载均衡服务：Nginx 既可以在内部直接支持 Rails 和 PHP 程序对外进行服务，也可以支持作为 HTTP 代理服务对外进行服务。Nginx 采用 C 进行编写，不论是系统资源开销还是 CPU 使用效率都比 Perlbal 要好很多。官方数据测试表明能够支持高达 50000 各并发连接的响应。
- 反向代理，负载均衡。当网站的访问量达到一定程度后，单台服务器不能满足用户的请求时，需要用多台服务器集群可以使用 nginx 做反向代理。并且多台服务器可以平均分担负载，不会因为某台服务器负载高宕机而某台服务器闲置的情况。



### 3、Nginx 的作用

**Http 代理，反向代理：作为 web 服务器最常用的功能之一，尤其是反向代理。**



> 正向代理和反向代理

两者的区别：

- 最主要的区别是 **代理的对象不同**
  - 正向代理，代理的是客户端，最典型的就是 vpn
  - 反向代理，代理的是服务器，我们访问代理服务器，然后代理服务器将我们的请求转发到服务器集群



**Nginx 提供的负载均衡策略有两种：**

- 内置策略和扩展策略
  - 内置策略：轮询（还有加权轮询），Ip hash
  - 扩展策略：fair、通用hash、consistent hash等，默认不编译进nginx内核。

轮询：

加权轮询：

Ip hash：对客户端请求的 ip 进行 hash 操作，然后根据 hash 结果将同一个客户端 ip请求分发给同一台服务器处理，可以解决 session 不共享问题

**这样有好处也有坏处，好处就是解决了 session 不共享问题，坏处就是一旦服务器出问题了，保存的信息就丢失了，所以更多的时候，我们还是选择使用 Redis。**



ip hash 存在缺陷，当前端服务器再多一层时，将获取不到用户的正确 IP，获取的将是前一个前端服务器的 IP，因此，nginx 1.7.2 版本推出了 url_hash.



> 动静分离

在我们的软件开发中，有些请求是需要后台处理的，有些请求是不需要经过后台处理的（例如：css、html、jpg、js 等等文件），这些不需要经过后台处理的文件称为静态文件，让动态网站里的动态网页根据一定规则把不变的资源和经常变的资源区分开来，动静资源做好了拆分之后，我们就可以根据静态资源的特点将其做**缓存操作**。提高资源的响应速度。

### 4、作用总结

- 反向代理
- 负载均衡
- 动静分离





## 二、Windows 下安装

http://nginx.org/en/download.html

下载稳定版本



### 1、启动 Nginx

有很多种方法启动 Nginx

1. 直接打开 nginx.exe
2. 打开 cmd，切换到 nginx 解压目录下，运行 nginx.exe 或者使用命令 `start nginx`
3. 然后查看系统服务中 nginx 是否启动
4. cmd 下运行 `tasklist /fi "imagename eq nginx.exe"` 可以看到相应的进程
5. Nginx 监听的端口是 80，可以直接浏览器回车 localhost/ 就能看到相应信息
6. 或者任务管理器详细信息也可以看到 nginx.exe
7. 如果出错，可以查看日志  E:\tools\nginx-1.18.0\logs 下面的 error.log 是日志



> 常见错误

- 端口号被占用
- nginx 文件夹路径存在中文

可以修改配置文件，保存后检查配置文件是否出错

```bash
nginx -t -c /nginx-1.18.0/conf/nginx.conf
```

如果程序没启动就直接 start nginx 启动，如果已经启动了就使用以下命令重新加载配置文件并重启

```bash
nginx -s reload
```



关闭 nginx 服务：

- 快速停止：nginx -s stop

- 完整有序的关闭：nginx -s quit



### 2、优化配置

```ini
#user  nobody;

#==工作进程数，一般设置为cpu核心数
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {

    #==最大连接数，一般设置为cpu*2048
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    
    #==客户端链接超时时间
    keepalive_timeout  65;

    #gzip  on;

    #当配置多个server节点时，默认server names的缓存区大小就不够了，需要手动设置大一点
    server_names_hash_bucket_size 512;

    #server表示虚拟主机可以理解为一个站点，可以配置多个server节点搭建多个站点
    #每一个请求进来确定使用哪个server由server_name确定
    server {
        #站点监听端口
        listen       8800;
        #站点访问域名
        server_name  localhost;
        
        #编码格式，避免url参数乱码
        charset utf-8;

        #access_log  logs/host.access.log  main;

        #location用来匹配同一域名下多个URI的访问规则
        #比如动态资源如何跳转，静态资源如何跳转等
        #location后面跟着的/代表匹配规则
        location / {
            #站点根目录，可以是相对路径，也可以使绝对路径
            root   html;
            #默认主页
            index  index.html index.htm;
            
            #转发后端站点地址，一般用于做软负载，轮询后端服务器
            #proxy_pass http://10.11.12.237:8080;

            #拒绝请求，返回403，一般用于某些目录禁止访问
            #deny all;
            
            #允许请求
            #allow all;
            
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Credentials' 'true';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
            #重新定义或者添加发往后端服务器的请求头
            #给请求头中添加客户请求主机名
            proxy_set_header Host $host;
            #给请求头中添加客户端IP
            proxy_set_header X-Real-IP $remote_addr;
            #将$remote_addr变量值添加在客户端“X-Forwarded-For”请求头的后面，并以逗号分隔。 如果客户端请求未携带“X-Forwarded-For”请求头，$proxy_add_x_forwarded_for变量值将与$remote_addr变量相同  
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            #给请求头中添加客户端的Cookie
            proxy_set_header Cookie $http_cookie;
            #将使用代理服务器的主域名和端口号来替换。如果端口是80，可以不加。
            proxy_redirect off;
            
            #浏览器对 Cookie 有很多限制，如果 Cookie 的 Domain 部分与当前页面的 Domain 不匹配就无法写入。
            #所以如果请求 A 域名，服务器 proxy_pass 到 B 域名，然后 B 服务器输出 Domian=B 的 Cookie，
            #前端的页面依然停留在 A 域名上，于是浏览器就无法将 Cookie 写入。
            
　　         #不仅是域名，浏览器对 Path 也有限制。我们经常会 proxy_pass 到目标服务器的某个 Path 下，
            #不把这个 Path 暴露给浏览器。这时候如果目标服务器的 Cookie 写死了 Path 也会出现 Cookie 无法写入的问题。
            
            #设置“Set-Cookie”响应头中的domain属性的替换文本，其值可以为一个字符串、正则表达式的模式或一个引用的变量
            #转发后端服务器如果需要Cookie则需要将cookie domain也进行转换，否则前端域名与后端域名不一致cookie就会无法存取
　　　　　　  #配置规则：proxy_cookie_domain serverDomain(后端服务器域) nginxDomain(nginx服务器域)
            proxy_cookie_domain localhost .testcaigou800.com;
            
            #取消当前配置级别的所有proxy_cookie_domain指令
            #proxy_cookie_domain off;
            #与后端服务器建立连接的超时时间。一般不可能大于75秒；
            proxy_connect_timeout 30;
        }

        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

    }
    
　　#当需要对同一端口监听多个域名时，使用如下配置，端口相同域名不同，server_name也可以使用正则进行配置
　　#但要注意server过多需要手动扩大server_names_hash_bucket_size缓存区大小
　　server {
　　　　listen 80;
　　　　server_name www.abc.com;
　　　　charset utf-8;
　　　　location / {
　　　　　　proxy_pass http://localhost:10001;
　　　　}
　　}
　　server {
　　　　listen 80;
　　　　server_name aaa.abc.com;
　　　　charset utf-8;
　　　　location / {
　　　　　　proxy_pass http://localhost:20002;
　　　　}
　　}
}
```



## 三、总结

主要还是通过修改 nginx 的配置文件对请求做一些处理。

- 反向代理
- 负载均衡



### 1、常用命令

- 查看 80 端口被占用：`netstat -ano | findstr 0.0.0.0:80` 或 `netstat -ano | findstr "80"`
  - 当我们设置为其他端口时也有可能被占用，可以查看被哪个进程占用了，然后释放资源就好了，解决方法自行百度
- 当我们修改了nginx的配置文件 nginx.conf 时，不需要关闭nginx后重新启动nginx，只需要执行命令 `nginx -s reload` 即可让改动生效
- 输入 nginx 命令  `nginx -s stop`(快速停止nginx)  或  `nginx -s quit`(完整有序的停止nginx)



### 2、大文件传输拦截问题

nginx 默认允许传输文件大小为 1M，可以通过修改配置文件设置大小

```ini
http {
    client_max_body_size      1024M;
    client_body_buffer_size   10M;
}
```



### 3、补充一些 cmd 命令

- `netstat -ano`
  - -a  显示所有连接和侦听端口。
  - -n  以数字形式显示地址和端口号。
  - -o  显示拥有的与每个连接关联的进程 ID。
- 查看进程列表 `tasklist | findstr “java”`
- 杀掉进程:  `taskkill /PID 进程号 -F -T`
  - /PID processid  指定要终止的进程的 PID。
  - /F        指定强制终止进程。
  - /T       终止指定的进程和由它启用的子进程
