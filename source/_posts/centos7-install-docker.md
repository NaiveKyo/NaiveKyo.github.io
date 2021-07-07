---
title: centos7_install_docker
date: 2021-07-07 09:04:18
author: NaiveKyo
top: false
hide: false
cover: false
toc: true
summary: CentOS7 安装 Docker 容器
categories: Linux
keywords: CentOS7、Docker
tags:
  - Linux
  - Docker
---



# 一、前言

容器的概念在 Linux 中早就有了，并不是 Docker 提出了容器的概念，它是一种轻量级的虚拟化技术，现在常用于打包项目环境，方便我们部署。



# 二、安装

## 1、安装前准备

LInux 内核版本，官方建议 3.10 以上。

- 查看当前内核版本：`uname -r`



**如果不满足条件，可以更新系统：**

- `yum -y update`（**谨慎使用**）：升级所有包的同时也升级软件和系统内核
- `yum -y upgrade`：只升级所有包，不升级软件和系统内核





如果之前安装过 Docker，卸载旧版本：

`yum remove docker docker-common docker-selinux docker-engine`





## 2、安装 Docker

- 安装相关依赖

  yum-utils 提供 yum-config-manager 功能，另外两个是 devicemapper 驱动依赖

  `yum install -y yum-tuils device-mapper-persistent-data lvm2`

- 查看已经安装的包 `yum list installed`

- 设置 yum 源，两个都可以使用

  ```bash
  yum-config-manager --add-repo http://download.docker.com/linux/centos/docker-ce.repo（中央仓库）
  
  yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo（阿里仓库）
  ```

- 选择 Docker 版本并安装

  ```bash
  # 查看可用版本
  yum list docker-ce --showduplicates | sort -r
  
  # 选择一个版本安装。当然也可以默认安装，就是最新版
  yum install docker-ce
  
  # 启动 Docker 并设置开机自启
  systemctl start docker
  systemctl enable docker
  ```

  
