---
title: centos7-install-git
date: 2021-07-06 17:56:26
author: NaiveKyo
top: false
hide: false
cover: false
toc: true
summary: CentOS7 安装 Git
categories: Linux
keywords: CentOS7、Git
tags:
  - Linux
  - Git
---



## 一、前言

CentOS 版本的 Linux，可能默认就带有 git，但是其 yum 仓库中支持的 Git 版本最高是 1.8.1。

如果直接使用命令 `yum -y install git`，则安装的是其默认的，我们需要安装最新版的。

查看版本 默认支持的版本 `yum info git`



## 二、安装最新版 Git

### 1、卸载旧的 Git、安装新的

- 如果系统中自带的有 Git，先卸载：`yum remove git`

- 想要安装任意版本的 Git，我们可以使用 `wget` 或者 `curl` 工具到对应的仓库中获取 Git

- 推荐网站：`https://mirrors.edge.kernel.org/pub/software/scm/git/`

  ```bash
  # 例如这里安装的 2.18.4 版本的 git
  wget https://mirrors.edge.kernel.org/pub/software/scm/git/git-2.18.4.tar.gz
  ```

- 由于我们没有使用 yum 安装，所以 Git 所需要的依赖只能自己来安装了，感兴趣可以试试查看依赖 

- `yum deplist git`

- 安装依赖及下面的步骤

  ```bash
  # 安装依赖
  yum install -y zlib-devel bzip2-devel openssl-devel ncurses-devel gcc perl-ExtUtils-MakeMaker package
  
  # 解压 Git
  tar -zxvf ./git-2.18.4.tar.gz
  
  # 安装
  cd ./git-2.18.4/
  
  # 这里 /usr/local/git 是我创建的放置 git 的地方 /usr/local/git/git-2.18.4
  ./configure --prefix=/usr/local/git all
  
  # 编译并安装 git 注意这里需要 c++ 的编译器，如果没有就 yum install gcc-c++
  # 这里默认安装到 /usr/local 下，可以指定目录，例如
  # make install /usr/local/mygit
  make && make install
  ```

  

### 2、Git 相关配置

- 配置环境变量

  ```bash
  vim /etc/profile
  
  export PATH=$PATH:${JAVA_HOME}/bin:${MAVEN_HOME}/bin:/usr/local/git/bin
  
  source /etc/profile
  ```

- 如果想要卸载 Git，安装其他的版本，可以这样：`yum remove git`

- 配置

  ```bash
  # 配置基本信息
  git config --global user.name "username"
  git config --global user.email QQ邮箱
  # 查看配置
  
  git config --list
  ```

  





## 三、补充小知识

> Linux 安装软件源码包的流程：

一般会涉及到三个步骤：

一般会涉及到三个步骤：

1. `./configure`

   - 该步骤主要用来检测系统的配置、环境以及相关依赖，如果缺少相关依赖，该脚本会终止执行，软件安装失败

     当该脚本执行完成之后，会生成一个 Makefile 文件，该文件规定了用什么编译器、编译参数等等，描述了文件编译的互相依赖关系

2. `make`

   该步骤主要用来编译源代码，make 命令会从 Makefile 文件中读取相关指令，编译完成后会生成可执行文件

3. `make install`

   该步骤主要用来安装软件，make install 命令会从 Makefile 文件中读取相关指令，然后将软件安装到指定的位置， 默认安装位置是 `/usr/local`

