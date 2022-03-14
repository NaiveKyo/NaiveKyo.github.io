---
title: CentOS7 Deploy Gitblit Server
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211227215521.jpg'
coverImg: /img/20211227215521.jpg
cover: false
toc: true
mathjax: false
date: 2022-03-11 10:47:28
summary: "CentOS7 部署 Gitblit 服务器"
categories: "Linux"
keywords: {"Linux", "Gitblit"}
tags: "Linux"
---

# CentOS 7 Install Gitblit

官网：http://gitblit.github.io/gitblit/

GItblit 提供两种安装方式：

- `Gitblit GO`：默认使用 Jetty 作为 web 容器；
- `Gitblit WAR`：需要自定义 Servlet 容器（Jetty6/7/8 或者 tomcat 6/7）

<mark>Gitblit 需要 Java 运行环境</mark>

Linux 安装 Java 环境参考：https://naivekyo.github.io/2021/07/06/centos7-install-jdk/



## 下载并配置 gitblit

### 1、下载

这里为了方便直接下载 GO 版本的 Gitblit，内部集成 Servlet 容器 Jetty。

上传到 Linux 服务器，使用命令解压：

```bash
sudo tar -zxvf gitblit-1.9.1.tar.gz -C 指定目录的绝对/相对路径
```



### 2、配置

解压后，通过 `Gitblit根目录/data/giblit.properties` 配置文件对 Gitblit 进行配置，默认配置如下：

```properties
#
# GITBLIT.PROPERTIES
#
# Define your custom settings in this file and/or include settings defined in
# other properties files.
#

# Include Gitblit's 'defaults.properties' within your configuration.
#
# NOTE: Gitblit will not automatically reload "included" properties.  Gitblit
# only watches the 'gitblit.properties' file for modifications.
#
# Paths may be relative to the ${baseFolder} or they may be absolute.
#
# COMMA-DELIMITED
# SINCE 1.7.0
include = defaults.properties

#
# Define your overrides or custom settings below
```

在末尾添加如下配置：

```bash
# 设置服务器访问端口, 默认 8080
server.httpPort = 10100

# https port, 设置为 0 表示关闭
server.httpsPort = 0

# 访问 IP 地址, 暂不设置, 一旦设置了就无法通过外网访问
server.httpBindInterface =
# 关闭服务的端口, 默认 8081
server.shutdownPort = 10101
```

修改 Gitblit 的启动脚本文件，默认启动脚本如下：

```shell
#!/bin/bash
java -cp "gitblit.jar:ext/*" com.gitblit.GitBlitServer --baseFolder data
```

修改为如下配置，表示后台运行 Gitblit 服务，同时将其运行时产生的错误和正确的信息保存到 `log_gitblit.log` 文件：

```shell
#!/bin/bash
java -cp "gitblit.jar:ext/*" com.gitblit.GitBlitServer --baseFolder data > log_gitblit.log 2>&1 &
```



### 3、开放端口

由于我们刚刚设置端口为 `10100` 和 `10101` 现在如果想要访问 Gitblit 就必须开放这两个端口：

```bash
sudo firewall-cmd --zone=public --add-port=10100/tcp --permanent
sudo firewall-cmd --zone=public --add-port=10101/tcp --permanent

# 刷新防火墙
sudo firewall-cmd --reload
```



### 4、启动 Gitblit 服务

建议切换为 root 用户进行开启服务，因为我使用 `sudo  ./gitblit.sh` 执行发现，无法通过该脚本调用 java 命令，日志文件中提示找不到 `java -cp` 命令，切换到 root 再次执行就没问题了：

```bash
# 切换到 root
su -
# 进入 gitblit 的根目录, 执行启动命令
./gitblit.sh

# 查看进程
ps -ef | grep gitblit
# 显示
root       1671      1  6 21:23 pts/0    00:00:10 java -cp gitblit.jar:ext/* com.gitblit.GitBlitServer --baseFolder data
naivekyo   1746   1728  0 21:25 pts/0    00:00:00 grep --color=auto gitblit

# 启动成功
```



### 5、访问

在主机中通过 ip + 端口号访问：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220311102954.png)



### 6、仓库和用户的管理

参考官方文档中关于仓库和用户的管理： http://gitblit.github.io/gitblit/administration.html

有两种方式：

- Web 应用管理；
- 配置文件管理。



### 7、用户名和密码

登录后记得及时通过个人资料界面修改密码：

- 对于用户名：不区分大小写；
- 对于密码：区分大小写，加密方式也可以设置，通过 `gitblit.properties` 配置，参考官方文档。



### 8、关闭服务

调用 Gitblit 根目录中的 `gitblit-stop.sh` 脚本即可。



## 几个问题

## （1）mobaxTerm 连接虚拟机太慢

原因是 ssh 反向解析 dns 及验证用户太费时间

决解方法：修改 ssh 设置

```bash
sudo vim /etc/ssh/sshd_config

# 修改如下配置
useDNS = no
GSSAPIAuthentication no
```



## （2）关于 sudo 的问题

默认只有 root 具有执行 sudo bash 的权限，其他用户是不具有的，需要配置一下：

```bash
# 使用 visudo 修改 /ext/sudoers

# 找到这两行

## Allow root to run any commands anywhere
root    ALL=(ALL)       ALL

# 在后面加上, 这里的用户名就是指定某某用户可以使用 sudo
用户名   ALL=(ALL)	      ALL
```

sudo 的执行流程如下：

- 当使用者使用 sudo 时，系统在 `/etc/sudoers` 文件中搜寻该使用者是否具有执行 sudo 的权限；
- 当使用者具有该权限时，就会让使用者 "输入使用者自己的密码来确定"；
- 若密码输入成功，则开始进行 sudo 后面的命令（但 root 使用 sudo 不需输入密码）；



## （3）vim 显示行号

暂时显示行号可以进入末行模式输入：`:set number`

结合 `nG` n 表示行号，可以跳转到指定行。



## （4）Linux 语言

命令：`echoe "LANG=en_US.utf8" > /etc/locale.conf`

