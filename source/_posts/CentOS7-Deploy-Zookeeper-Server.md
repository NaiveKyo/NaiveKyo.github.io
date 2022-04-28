---
title: CentOS7 Deploy Zookeeper Server
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221639.jpg'
coverImg: /img/20220225221639.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-28 23:13:18
summary: "CentOS7 部署 Zookeeper 注册中心"
categories: "Linux"
keywords: "Linux"
tags: "Linux"
---

# Zookeeper

# 一、概述

## 1、工作机制

Zookeeper 是一个开源的分布式的，为分布式框架提供协调服务的 Apache 项目。

> Zookeeper 工作机制

Zookeeper 从设计模式角度来理解：是一个基于观察者模式设计的分布式服务管理框架，它负责存储和管理大家都关心的数据，然后接受观察者的注册，一旦这些数据发生了变化，Zookeeper 就将负责通知已经在 Zookeeper 上注册的那些观察者做出相应的反应。

Zookeeper = 存储系统 + 通知机制

## 2、特点

> Zookeeper 的特点

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220428143617.png)

（1）Zookeeper ：一个领导者（Leader），多个追随者（Follower）组成的集群；

（2）集群中只要有半数以上的节点存活，Zookeeper 集群就能正常服务。所以 Zookeeper 适合安装奇数台服务器；

（3）全局数据一致：每个 Server 保存一份相同的数据副本，Client 无论连接到哪个 Server，数据都是一致的；

（4）更新请求顺序执行，来自不同 Client 的更新请求按其发送顺序依次执行（先到先执行）；

（5）数据更新原子性：依次数据更新要么成功，要么失败（每次写操作都有事务 id（zxid））；

（6）实时性：在一定时间范围内，Client 能够读到最新数据。

## 3、数据结构

Zookeeper 数据模型与 Unix 文件系统很类似，整体上可以看作是一棵树，每个节点称为一个 ZNode。每一个 ZNode 默认能够存储 1MB 的数据，每个 ZNode 都可以通过其路径唯一标识。

## 4、应用场景

提供的服务包括：统一命名服务、统一配置管理、统一集群管理、服务器节点动态上下线、软负载均衡等等。

### （1）统一命名服务

在分布式环境下，经常需要对应用/服务进行统一命名，便于标识。

例如：IP 不容易记住，但是域名容易记住。

### （2）统一配置管理

分布式环境下，配置文件同步一般很常见。

- 一般要求一个集群中，每个节点的配置信息都是一致的，比如 kafka 集群；
- 对配置文件进行修改后，希望能够尽快同步到各个节点上。

配置管理可交由 Zookeeper 管理：

- 可将配置信息写入 Zookeeper 的一个 ZNode 中；
- 每个客户端服务器监听这个 ZNode；
- 一旦 ZNode 中的数据被修改，Zookeeper 将通知各个客户端服务器。

### （3）统一集群管理

分布式环境中，实时掌握每个节点的状态是必要的：

- 可根据节点实时状态做出一些调整；

Zookeeper 可以实现实时监控节点状态变化：

- 可将节点信息写入 Zookeeper 上的一个 ZNode；
- 监听这个 ZNode 可获取它的实时状态变化。

### （3）服务器动态上下线

客户端能够实时洞察到服务器上下线的变化：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220428145234.png)

### （4）软负载均衡

在 Zookeeper 中记录每台服务器的访问次数，让访问数量小的服务器去解析最新的客户端请求。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220428145922.png)



# 二、Zookeeper 安装

## 1、安装

官网地址：https://zookeeper.apache.org/

下载地址：https://zookeeper.apache.org/releases.html

历史版本：https://archive.apache.org/dist/zookeeper/

一般我们会选择长期稳定版本的 Zookeeper，本文以 3.5.7 为例。

下载 Linux 版本：**apache-zookeeper-3.5.7-bin.tar.gz**

> 安装步骤

- 安装 Java 运行环境：https://naivekyo.github.io/2021/07/06/centos7-install-jdk/
- 将 Zookeeper 压缩包上传到服务器，然后解压到指定目录

```bash
# 注: 相关的目录看个人喜好

# 使用 sftp 服务上传文件到服务器
# 切换目录
cd /usr/local
# 找个地方备份
[naivekyo@ol7-19 local]$ sudo mv ~/apache-zookeeper-3.5.7-bin.tar.gz /usr/local/backup/
# 解压文件
[naivekyo@ol7-19 local]sudo tar -zxvf ./backup/apache-zookeeper-3.5.7-bin.tar.gz -C /usr/local/deploy_software/

# 改名
sudo mv ./apache-zookeeper-3.5.7-bin/ ./zookeeper-3.5.7

# 设置权限
chown root:root -R ./zookeeper-3.5.7/
```

简单看一下解压后的目录：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220428171647.png)

- bin：ZK 常用命令；
- conf：配置文件；
- docs：文档；
- lib：依赖的 jar 包

## 2、配置

重点在于配置 Zookeeper，进入 conf 目录，可以看到三个配置文件：

- `configuration.xsl`
- `log4j.properties`
- `zoo_sample.cfg`

重点看最后一个 `zoo_sample.cfg`  文件，它是一个简单的配置样例，做个备份后，重命名该文件，然后对其进行修改：

```properties
# The number of milliseconds of each tick
tickTime=2000

# The number of ticks that the initial
# synchronization phase can take
initLimit=10

# The number of ticks that can pass between
# sending a request and getting an acknowledgement
syncLimit=5

# the directory where the snapshot is stored.
# do not use /tmp for storage, /tmp here is just
# example sakes.
dataDir=/tmp/zookeeper

# the port at which the clients will connect
clientPort=2181

# the maximum number of client connections.
# increase this if you need to handle more clients
#maxClientCnxns=60
#
# Be sure to read the maintenance section of the
# administrator guide before turning on autopurge.
#
# http://zookeeper.apache.org/doc/current/zookeeperAdmin.html#sc_maintenance
#
# The number of snapshots to retain in dataDir
#autopurge.snapRetainCount=3
# Purge task interval in hours
# Set to "0" to disable auto purge feature
#autopurge.purgeInterval=1
```

重点看 `dataDir` 配置，注释说明这个属性对应的目录存放的是 ZK 的节点快照数据，建议不要存放在 Linux 的 tmp 目录下（因为这个目录定期会被清除），我们可以在 zookeeper 的目录中新建一个 `zkData` 目录用于存放数据：

```bash
[root@localhost zookeeper-3.5.7]# pwd
/usr/local/deploy_software/zookeeper-3.5.7
[root@localhost zookeeper-3.5.7]# mkdir ./zkData
```

我们暂时先修改 zk 配置文件中的 dataDir 属性：

```properties
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/usr/local/deploy_software/zookeeper-3.5.7/zkData
clientPort=2181
```

## 3、启动 Zookeeper 服务端

```bash
# 进入 bin 目录，然后启动 zk server 端

[root@localhost bin]# ./zkServer.sh start
ZooKeeper JMX enabled by default
Using config: /usr/local/deploy_software/zookeeper-3.5.7/bin/../conf/zoo.cfg
Starting zookeeper ... STARTED

[root@localhost bin]# jps
11977 QuorumPeerMain
12009 Jps

[root@localhost bin]# jps -l
12019 sun.tools.jps.Jps
11977 org.apache.zookeeper.server.quorum.QuorumPeerMain

# 查看 zk 状态
[root@localhost bin]# ./zkServer.sh status
ZooKeeper JMX enabled by default
Using config: /usr/local/deploy_software/zookeeper-3.5.7/bin/../conf/zoo.cfg
Client port found: 2181. Client address: localhost.
Mode: standalone
```



## 4、启动 Zookeeper 客户端

依旧是 zk 的 bin 目录：

```bash
[root@localhost bin]# ./zkCli.sh
Connecting to localhost:2181

# 省略中间日志输出

WATCHER::

WatchedEvent state:SyncConnected type:None path:null
[zk: localhost:2181(CONNECTED) 0]
[zk: localhost:2181(CONNECTED) 2] ls /
[zookeeper]
[zk: localhost:2181(CONNECTED) 3] quit
```

结束服务端：`zkServer.sh stop`



## 5、配置参数

Zookeeper 的配置文件 zoo.cfg 中参数含义如下：

（1）`tickTime=2000`：通信心跳时间（客户端-服务端、服务端-服务端），Zookeeper 服务器与客户端心跳时间，单位毫秒；

（2）`initLimit=10`：LF 初始通信时限（Leader - Follower），指的是心跳次数，总时限就是 `initLimit * tickTime`；

（3）`syncLimit=5`：LF 同步通信时限：

Leader 和 Follower 之间通信时间如果超过 `syncLimit * tickTime`，Leader 认为 Follower 死掉，从服务器列表中删除该 Follower；

（4）`dataDir`：保存 Zookeeper 中的数据；注意一般不使用默认的 tmp 目录。

（5）`clientPort=2181`：客户端连接端口，通常不做修改



进度：集群配置及操作 https://www.bilibili.com/video/BV1to4y1C7gw?p=9&spm_id_from=pageDriver

## 6、开放端口

集群环境客户端或服务端访问需要开启 2181 端口：

```bash
[root@localhost ~]# firewall-cmd --zone=public --add-port=2181/tcp --permanent
success
[root@localhost ~]# firewall-cmd --reload
success
[root@localhost ~]# firewall-cmd --list-port
2181/tcp
```

