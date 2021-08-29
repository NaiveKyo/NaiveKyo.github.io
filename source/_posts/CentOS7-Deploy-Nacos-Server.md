---
title: CentOS7 Deploy Nacos Server
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210713111311.jpg'
coverImg: /img/20210713111311.jpg
toc: true
date: 2021-08-13 22:09:48
top: false
cover: false
summary: CentOS7 部署 Nacos 服务器
categories: Linux
keywords: [Linux, Nacos]
tags: Linux
---

## Nacos 服务部署

### 1、前言

Nacos 作为 Spring Cloud Alibaba 的组件之一，主要有以下两个作用：

- 服务注册与发现
- 配置服务器



[官方文档](https://nacos.io/zh-cn/docs/what-is-nacos.html)

### 2、安装 Java 环境



 [CentOS7 Install JDK](https://naivekyo.github.io/2021/07/06/centos7-install-jdk/)



### 3、安装 Maven

[Maven 官方下载渠道](https://maven.apache.org/download.cgi)



- 官网下载 LTS 版本 `apache-maven-x.x.x-bin.tar.gz`

- 上传到 Linux 服务器，解压到 `/usr/local/maven` 目录下

- 配置环境变量

  ```shell
  # maven environment
  export MAVEN_HOME=/usr/local/maven/apache-maven-3.8.1
  
  # PATH
  export PATH=$PATH:${JAVA_HOME}/bin:${MAVEN_HOME}/bin
  ```

- 查看版本：

  ```bash
  mvn -v
  ```




### 4、安装 Nacos

> 步骤：

- [下载](https://github.com/alibaba/nacos/releases)
- [部署](https://nacos.io/zh-cn/docs/deployment.html)
- [启动](https://nacos.io/zh-cn/docs/quick-start.html)



> 概述：

去官网下载 Nacos 的 Linux 发行包上传到服务器，解压后

```bash
unzip nacos-server-$version.zip 
# 或者 
tar -xvf nacos-server-$version.tar.gz

cd nacos/bin
```



Nacos 支持三种部署模式：

- 单机模式
  - 单机模式支持 MySQL
- 集群模式
- 多网卡 IP 选择



> 单机模式

第一步：

- 开放端口：Nacos 默认使用的是 8848 端口，我们可以修改
- **firewall** 和 阿里云安全组

第二步：

- 启动 nacos 服务器

```bash
startup.sh -m standalone
```

第三步：

- 浏览器访问 Nacos 服务器

`http://ip:8848/nacos`

