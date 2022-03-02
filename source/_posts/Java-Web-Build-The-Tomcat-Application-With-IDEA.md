---
title: Java Web Build The Tomcat Application With IDEA
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211227205236.jpg'
coverImg: /img/20211227205236.jpg
cover: false
toc: true
mathjax: false
date: 2022-03-02 22:21:21
summary: "回顾 JavaWeb: 通过 IDEA 构建 Tomcat 应用"
categories: "Java Web"
keywords: "Java Web"
tags: "Java Web"
---



# IDEA 配置 Tomcat

## 1、下载 tomcat

官网：https://tomcat.apache.org/

左侧 Download 栏下选择要下载的 Tomcat 版本，选择 Tomcat 8 即可，然后根据使用平台选择下载：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220302191209.png)

例如下载 `64-bit Windows.zip` 下载到 Windows，解压到指定位置。



## 2、IDEA 配置 Tomcat

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220302191459.png)

打开 IDEA 后，点击右上角的 `Add Configuration` 选项，在弹出的对话框中点击 "加号"，点击 `Tomcat Server` 下的 `Local` 选项，这是因为我们使用的是本地 Tomcat 服务器。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220302191709.png)

下一步：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220302191927.png)

在弹出的对话框中做如下配置：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220302192020.png)

（1）设置名字；

（2）选择 Tomcat 的目录，即一开始解压的目标目录；

（3）和第二步一样；

（4）最后注意需要导入运行 Tomcat 必须的 jar 包：

- `jsp-api.jar`
- `servlet-api.jar`

这两个 jar 包的位置就在解压的 Tomcat 目录的 lib 目录下面。



## 3、新建项目并配置到 Tomcat 中运行

新建一个普通的 Maven 项目，不需要使用 Maven 提供的模板，然后有两种方式为项目添加 Web 环境。



### （1）方式一

第一种方式比较简单，直接为选中的项目添加 Web 环境：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220302194934.png)

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220302195004.png)

选中图中所示的选项，注意我当前的版本默认就是 Web 4.0，最后点击 ok，可以发现项目根目录下面出现了新的 web 目录：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220302195157.png)

最后再次打开 Tomcat 的 Configuration，切换到 `Deployment` 视图，然后点击下图所示的 `Artifact`：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220302213845.png)

最后点击 `Apply` 应用配置，我们的项目将会运行在 Tomcat 中。



### （2）方式二

有时候，我们不想使用 IDEA 提供的默认配置，此时可以使用自定义 web 应用的方式。

首先创建一个普通的 Maven 项目，在 resources 目录下创建如下结构的相关文件：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220302215531.png)



第二步：打开项目结构，在 `Modules` 视图中选中我们创建的普通 Maven 项目，点击上方的加号：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220302215737.png)

在出现的选项中点击 Web：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220302215912.png)



第三步：添加 Web 模块后，编辑下图中的两个路径，上面代表的是 `web.xml` 文件的位置，下面代表的是创建的项目部署到 Tomcat 后，用于访问项目的根路径，注意：

- 第一个路径需要在我们之前创建的 `/web/WEB-INFO/web.xml`的绝对路径，后面加上 web.xml；
- 第二路径就是创建的 `/web` 目录的绝对路径。

最后点击确认，这样就会自动生成 `web.xml` 文件。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220302220155.png)



剩下的步骤和方式一一样，先创建 `Artifact`，然后将其添加到 Tomcat 中。



## 4、补充: 查看端口号

Windows 查看端口占用及应用名：

```bash
# 查看端口占用情况
natstat -ano | findstr "xxxx"

# 根据 pid 查询指定进程的名称
tasklist | findstr "xxx"
```

