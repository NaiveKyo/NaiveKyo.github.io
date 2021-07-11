---
title: centos7-install-jdk
date: 2021-07-06 17:46:20
author: NaiveKyo
top: false
hide: false
cover: false
img: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/20.jpg
coverImg: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/20.jpg
toc: true
summary: CentOS7 安装 Java 环境
categories: Linux
keywords: 
  - CentOS7
  - jdk
tags:
  - Linux
  - Java
---



## 一、卸载 Open-JDK

有的 Linux 系统可能已经安装了 open-jdk，它是 jdk 开源之前的版本，已经不在维护了，我们可以卸载它



- 使用命令 `rpm -qa | grep java` 查询系统中和 java 相关的文件，一个个删除

- 例如：

  ```bash
  rpm -e --nodeps java-1.7.0-openjdk-1.7.0.111-2.6.7.8.el7.x86_64
  rpm -e --nodeps java-1.8.0-openjdk-1.8.0.102-4.b14.el7.x86_64
  rpm -e --nodeps java-1.8.0-openjdk-headless-1.8.0.102-4.b14.el7.x86_64
  rpm -e --nodeps java-1.7.0-openjdk-headless-1.7.0.111-2.6.7.8.el7.x86_64
  ```

- 检查是否已经删除成功：输入 **java -version**

- 如果没有删除完，就使用 yum 删除：**yum -y remove**



## 二、安装稳定的 JDK

官网：http://www.oracle.com

下载相应的 Linux 版本后，做好备份，开始解压

可以将 jdk 复制一份放到 `/usr/local/src` 做备份

在 `/usr/java` 中解压 jdk（创建一个 java 目录）

```bash
sudo tar -zxvf jdk-8u281-linux-x64.tar.gz
```

如果没有权限就：

```bash
chmod 755 jdk-8u281-linux-x64.tar.gz
```

如果实在不行，就进入 root 用户进行操作

解压完成后开始设置系统环境变量：

```bash
vim /etc/profile

# 最后面添加下列
# java environment
export JAVA_HOME=/usr/java/jdk1.8.0_281
export CLASSPATH=.:${JAVA_HOME}/jre/lib/rt.jar:${JAVA_HOME}/lib/dt.jar:${JAVA_HOME}/lib/tools.jar
export PATH=$PATH:${JAVA_HOME}/bin
```

设置完成后，重新编译配置文件：`source /etc/profile`

最后检查是否成功安装：`java -version` 如何输出了 java 的版本信息就说明成功了。
