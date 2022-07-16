---
title: CentOS7 Install Redis
date: 2021-07-06 16:28:11
author: NaiveKyo
top: false
cover: false
toc: true
summary: CentOS7 安装 Redis 流程记录
img: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/15.jpg
coverImg: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/15.jpg
categories: Linux
keywords: 
  - Linux
  - Redis
tags:
  - Linux
  - Redis
---



## 一、Windows 下安装 Redis

先去官网下载源文件压缩包，解压到自己创建的指定目录下，建议目录绝对路径中不要出现中文。





### 1、安装

使用 cmd，将 Redis 作为服务安装到 Windows 中

```shell
# 进入 redis 解压目录下
redis-server --service-install redis.windows.conf

# 启动服务
redis-server --service-start

# 停止服务
redis-server --service-stop

# 卸载服务
redis-server --service-uninstall
```



### 2、查看版本

```shell
redis-server --version # 或者 redis-server -v

redis-cli --version # 或 redis-cli -v
```

严格上说：通过　redis-cli 得到的结果应该是redis-cli 的版本，但是 redis-cli 和redis-server，一般都是从同一套源码编译出的。所以应该是一样的。



## 二、Linux 中安装 Redis

### 1、两种方式

- 从官网下载源文件压缩包，然后通过工具或协议上传到 Linux 服务器
- 使用 Linux 中的命令工具直接拉取



### 2、前置条件

- 安装 C++ 的编译器：CentOS 中，C 的编译器是 gcc，C++ 的编译器是 g++

  ```shell
  yum -y install gcc-c++
  # 出现错误，可以多看看 redis 的 ReadMe.md 文件
  make MALLOC=libc
  ```

  



### 3、开始安装

在此之前，我们应该了解 Linux 的各个目录代表的含义。

我习惯于将自己下载的软件解压并安装到 `/usr/local/ ` 目录下

```shell
# 进入目录
cd /usr/local
# 先到官网看看长期稳定版本的版本号，
wget https://download.redis.io/releases/redis-6.2.3.tar.gz

# 解压
tar xzf redis-6.2.3.tar.gz

# 解压后，压缩包可以自己备份以下，以便以后使用，也可以删掉

# 进入解压后的目录下，开始编译源文件
cd ./redis-6.2.3
make

# 切换到/usr/local/redis-6.2.3/src目录
cd src/

# 开始安装 Redis
make install

# 安装完成之后，我们可以创建两个文件夹用户存放 配置文件 和 常用的命令
cd ../
mkdir etc
mkdir bin

# 备份配置文件
cp redis.conf ./etc/

# 转移常用命令
mv mkreleasehdr.sh redis-benchmark redis-check-aof redis-cli redis-server redis-sentinel /usr/local/redis-6.2.3/bin/
```



### 4、修改配置文件

```shell
# 修改配置文件
cd ./exc
vim redis.conf

# redis.conf主要修改以下 4 点：

# 1.将 daemonize no 改为 daemonize yes，表示需要在后台运行

# 2. 将 bind 127.0.0.1 这一行注释掉，如果不需要远程连接服务器，这个可以不用注释，它的意思是只允许本机访问

# 3. 将 protect-mode yes 改为 protect-mode no，如果不进行远程连接则采用默认的 yes

# 4. 添加 requirepass 123456 设置密码(默认密码为空)，如果只是在本机测试，也不需要设置密码
```



### 5、启动 Redis 服务并测试



```shell
# 依据指定配置文件启动 Redis
cd /usr/local/redis-6.2.3/bin
redis-server ../etc/redis.conf

# 使用 redis-cli 连接本机 Redis 服务，默认端口 6379
redis-cli

# 认证后测试
auth 123456
set name naivekyo
get name
```

### 6、补充：线上问题

mark 一下：如果第一次在服务器上安装 Redis 后，编写 Java 程序访问可能会出错，大概率是没有修改 Redis 的持久化配置，因为 Redis 默认的策略是缓存命中指定次数后会写入到磁盘中，但是默认写入的位置是 `dir ./`，如果出错可以指定一个目录，例如在配置文件中这样修改：

```
# The working directory.
#
# The DB will be written inside this directory, with the filename specified
# above using the 'dbfilename' configuration directive.
#
# The Append Only File will also be created inside this directory.
#
# Note that you must specify a directory here, not a file name.
# dir ./

dir /usr/local/deploy_software/redis-6.2.3/dbfiles
```



