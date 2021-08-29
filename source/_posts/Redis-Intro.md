---
title: Redis_Intro
author: NaiveKyo
hide: false
img: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/2.jpg
coverImg: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/2.jpg
toc: true
date: 2021-07-07 16:29:51
top: false
cover: false
summary: 学习 Redis 数据类型和常用操作。
categories: Redis
keywords:
  - Redis
  - Database
  - Cache
tags:
  - Redis
---



# Redis Introduction



## 一、NoSQL 概述

### 1、为什么要用 NoSQL

大数据时代：

一般的数据库无法处理大数据，2006 年 Hadoop 发布



- 单机 Mysql 
  - App ==》DAL ==》Mysql
  - 这种情况下，网站的瓶颈：
    - 数据量如果太大，一个机器不能满足需求
    - 数据量查过 300w 就需要使用索引了（B+ Tree），一个机器内存也放不下
    - 访问量（读写混合）一个服务器无法承担



- Memcached（缓存）+ MySQL + 垂直拆分（读写分离）
  - 读写分离：将数据库按照功能进行分类，不同 MySQL 数据库的功能不一样
  - 问题：如何保证数据库一致性，以及数据库查询效率
  - 使用缓存，同时不同的 MySQL 数据库需要同步
  - App ==> DAL ==> Cache ==> MySQL 1 2 3
  - 发展过程：优化数据结构和索引（底层）==> 文件缓存（IO）--> Memcached



- 分库分表 + 水平拆分 + MySQL 集群
  - App --> DAL --> 集群1 集群 2 3 4
  - 本质：数据库（读、写），缓存解决大部分读的问题，分库分表解决大部分写的问题
  - 早些年 MyISAM：表锁，十分影响效率，高并发会产生严重问题
  - 现在 Innodb：行锁
  - 慢慢的开始使用`分库分表`解决写的压力
  - MySQL 提出表分区（基本不使用了）、MySQL 的集群（很好满足了那个年代的大部分需求）





- 最近的年代
  - MySQL 等关系型数据库不够用了，数据量很多，变化很快
  - 图数据库、json（BSON）
  - 使用 MySQL 的时候使用它存一些比较大的文件、图、博客文章等等，数据库很大，效率会变低，我们应该使用特定的数据库来处理这些数据，MySQL 的压力就会变小



**目前基本的互联网项目：**

![](https://naivekyo.oss-cn-hangzhou.aliyuncs.com/blog%27image/test.png)



> 为什么要用 NoSQL

用户个人信息，社交网络，地理位置，用户产生的数据，用户日志爆发式增长

NoSQL 数据库，可以很好的处理上述情况



### 2、什么是 NoSQL

> NoSQL

NoSQL = Not Only SQL

泛指非关系型数据库

很多数据类型的存储不需要固定格式（关系型格式固定），不需要多余的操作就可以横向扩展（Map<String, Object>）, Redis 使用 键值对 存储



> NoSQL 特点

1、方便扩展（数据之间没有关系）

2、大数据量，高性能（Redis 一秒写 8 万次，读取 11 万次，NoSQL 的缓存记录级，是一种细粒度的缓存，性能会比较高）

3、数据类型是多样的 （`不需要事先设计数据库` 随取随用，如果是数据量非常大的数据库，很难设计）

4、传统 RDBMS 和 NoSQL

```yaml
传统的 RDBMS
- 结构化阻止
- SQL
- 数据和关系都存在单独的表中
- 操作语言，数据定义
- 严格的一致性（ACID）
- 基础的事务
- .........
```



```yaml
NoSQL
- 不仅仅是数据
- 没有固定的查询语言
- 键值对，列存储、文档存储、图形数据库（社交关系等等）
- 最终一致性
- CAP 定义 和 BASE （异地多活）
- 高性能，高可用，高扩展性
- ........
```

> 了解 ：3V + 3高

大数据时代的 3 V：主要是描述问题

1. 海量 Volume
2. 多样 Variety
3. 实时 Velocity

大数据时代的 3 高：主要是对程序的要求

1. 高并发
2. 高可拓 
3. 高性能



真正在公司中的实践：NoSQL + RDBMS 结合使用



### 3、阿里巴巴架构演进

敏捷开发、极限编程



```yaml
1、商品基本信息
	名称、价格、商品信息
	关系型数据库就可以解决了
	
2、商品的描述、评论（文字比较多）
	文档型数据库：MongoDB
	
3、图片
	分布式文件系统 FastDFS
	- 淘宝自己的 TFS
	- Google 的 GFS
	- Hadoop HDFS
	- 阿里云的 OSS
	
4、商品关键字（搜索）
	- 搜索引擎 solr elasticsearch
	- 淘宝 ISerach
	
	
5、商品热门波段信息
	- 内存数据库
	- redis、tair、memcache。。。。
	
6、商品交易，外部的支付接口
	- 三方应用
```



大型互联网应用的问题：

- 数据类型太多
- 数据源繁多，经常重构
- 数据要改造，大面积改造

解决问题：

- 加一层



### 4、NoSQL 的四大分类

KV 键值对：

- **Redis**
- Redis + Tair
- Redis + memechae



文档型数据库（bson 格式 和 json 类似）：

- **MongoDB**（一般必须要掌握）
  - MongoDB 是一个基于分布式文件存储的数据库，基于 C++ 编写，主要用于处理大量的文档
  - MongoDB 是一个介于关系型数据库和非关系型数据库中间的产品。它属于 NoSQL，但是它在非关系型数据库中功能最丰富，最接近关系型数据库
- ConthDB



列存储数据库：

- **HBase**
- 分布式文件系统



图关系型数据库：

- 用于存储关系，比如：朋友圈社交网络
- **Neo4j**，InfoGrid



## 二、Redis 入门

Redis（Remote Dictionary Server），远程字典服务

也称为结构化数据库



**作用：**

1. 内存存储、持久化（**rdb、aof**）
2. 效率高，可以用于高速缓存
3. 发布订阅系统
4. 地图信息分析
5. 计时器、计数器
6. ………………



**特定：**

1. 多样的数据类型
2. 持久化
3. 集群
4. 事物
5. ……



**需要用到的配置**

- 官网：http://www.redis.cn/documentation.html

- 端口：6379
- Linux 下安装



### 1、Linux 中安装 Redis

见另一篇博文：

[Linux 安装 Redis](https://naivekyo.github.io/2021/07/06/centos7-install-redis/)



### 2、测试性能

redis-benchmark 是一个压力测试工具

官方自带的性能测试工具

![](https://naivekyo.oss-cn-hangzhou.aliyuncs.com/blog%27image/benchmark.png)

简单测试

```bash
# 测试：100 个并发连接 100000 请求
# 如果 redis 设置有密码，则需要加上 -a 密码
redis-benchmark -h 127.0.0.1 -p 6379 -c 100 -n 1
```



### 3、基础知识

redis 默认有 16 个数据库，默认使用的是第 0 个数据库

```sh
# Set the number of databases. The default database is DB 0, you can select
# a different one on a per-connection basis using SELECT <dbid> where
# dbid is a number between 0 and 'databases'-1
databases 16
```

可以使用 `select `进行切换数据库

```shell
127.0.0.1:6379> select 2
127.0.0.1:6379[2]> dbsize 	# 查看数据库大小

# 查看当前数据库所有的 key
keys *

# 清空所有数据	
flushall 	# 清空所有数据库
flushdb	# 清除当前数据库
```



> **Redis 是单线程的**

Redis 非常快，是基于内存操作，所以 CPU 不是 Redis 的性能瓶颈，Redis 受机器的内存和网络带宽影响，既然可以使用单线程，就使用单线程。

Redis 使用 C 语言编写，官方提供的数据是 100000+ 的 QPS，不比 Memecache 差。

**Redis 为什么单线程还是这么快？**

1. 误区1：高性能的服务器一定是多线程的？
2. 误区2：多线程（上下文切换也会消耗资源）一定比单线程效率高

先去了解 CPU > 内存 > 硬盘 （速度）

核心：**Redis 将所有的数据全部放在内存中，所以说使用单线程效率就是最高的**，多线程上下文切换是需要消耗时间的，对于内存系统，没有上下文切换效率就是最高的。多次读写都是在一个 CPU，在内存情况就是最佳方案。



## 三、五大数据类型

Redis 是一个开源的，内存中的数据结构存储系统，它可以用作**数据库**、**缓存**和**消息中间件MQ**。它支持多种类型的数据结构，如 字符串（Strings），散列（hashs）、列表（lists）、集合（sets）、有序集合（sorted sets）与范围查询，bitmaps，hyperloglogs和地理空间（geospatial）索引半径查询。Redis 内置了 复制（replication），LUA 脚本（lua scripting），LRU 驱动事件（LRU eviction），事物（transactions）和不同级别的 磁盘持久化（persistence），并通过 Redis 哨兵（Sentinel）和自动分区（Cluster）提供高可用性（high availablity）（其实就是搭建集群）



### 1、Redis-Key

```bash
# 判断某个 key 是否存在
exists 键名

# 将当前数据库下的某个 key 移动到其他的数据库
move 键名 其他数据库编号

# 给某个 key 设置过期时间
expire 键名 秒数

# 查看某个 key 的剩余有效期
ttl 键名

# 查看某个 key 的类型
type 键名

# 删除 key
del 键名
```

- **Java 中可以使用 `Jedis` 连接 Redis 服务器，进行相关的操作**

- **单点登录** 可以给用户数据设置过期时间
- http://www.redis.cn/commands.html



### 2、String（字符串）

```bash
# 向字符串类型的 key 追加字符
# 如果要追加的 key 不存在就相当于 set key
append 键名 追加字符

# 查看字符串类型 key 的长度
strlen 键名

# value 加 1
incr 键名

# value 减 1
decr 键名

# 加减操作的步长
incrby 键名 步长
decrby 键名 步长

# 字符串范围，默认从 0 开始计数
getrange 键名 开始 结束
# 查看完整的字符串
getrange 键名 0 -1

# 替换字符串，从某个下标开始替换
setrange 键名 offset value

# 如果当前键存在 setex (set with expire) 设置过期时间
setex 键名 过期时间 新的值
# 如果当前键不存在 setnx (set if not exist) 就设置这个 key
setnx 键名 新的值

# 批量设置key
mset key1 value1 key2 value2 ...
# 批量获取
mget key1 key2 key3 ...

# 批量设置，如果遇到不存在的值则不会生效（原子性）
msetnx key1 newValue key4 value4... # key4 不存在，则该行不生效

# 先 get 再 set
# 先 get 如果不存在，则返回 nil，同时再 set，创建该 key
# 先 get 如果存在，再 set，会覆盖原来的值
getset
```

- 例如网站浏览量的 views 的值是通过缓存实现的，创建 `set views 0`，每次浏览使用 `incr views` 让其自动 +1

- **setnx**：**在分布式锁中会很常用，它可以保证当前值存在**

- **msetnx：**

  ```bash
  # 对象
  set user:1 {name:zhangsan,age:3} # 设置 user:1 对象，值为 json 字符串
  
  # 另一种方式，批量设置和获取
  # 这里的 key 设计的很巧妙: user:{id}:{filed}
  
  127.0.0.1:6379> mset user:1:name zhangsan user:1:age 21
  OK
  127.0.0.1:6379> mget user:1:name user:1:age
  1) "zhangsan"
  2) "21"
  127.0.0.1:6379> 
  ```

- String 类型的使用场景：value 除了是字符串还可以是数字

  - 计数器
  - 统计多单位数量
  - 粉丝数
  - 对象缓存存储





### 3、List

基本的数据类型，列表

给 List 添加一些规则就可以实现一些特殊的操作（栈、队列）

在 redis 中，可以将 list 做成 栈、队列

**所有的 List 命令都是以 l 开头的**

```bash
lpush list one	# 将一个值或多个值插入列表的头部(左)
rpush list four # 将一个值或多个值插入列表的尾部(右)

lpush list two

lpush list three

lrange list 0 -1  # 取一定范围的列表中的值
1) "three"
2) "two"
3) "one"
lrange list 0 1
1) "three"
2) "two"


# 移除值
lpop list # 默认只移除一个
lpop list 2 # 移除头部两个值
rpop list # 一样的，只不过从尾部开始


# 下标操作
lindex list [index] # 下标从 0 开始

# 长度
llen 列表名

# 移除指定的值
lrem list 数量 值 # 从列表头开始移除指定数量的某一个值(精确匹配)

# 保留一部分元素（截断操作）
ltrim list start end # 保留该下标范围内的元素

# 移除列表的最后一个元素并且将它添加到一个新的列表的头部
rpoplpush source destination # 如果 destination 不存在则新建列表

# 判断列表是否存在
exists 列表名

# 更新某个列表指定索引处的值，前提该列表必须存在
lset 列表名 索引 值

# 在列表中指定值的前面或后面插入新的值
linsert key BEFORE|AFTER pivot element # pivot 指具体的值
linsert mylist before "v1" "v4"
```



> 小结

- list 实际上是一个**链表**
- 如果 key 不存在，就会创建新的链表
- 如果 key 存在，则新增内容
- 如果移除了所有值，得到空链表，也代表不存在
- 在两边插入或者改动值，效率最高，但是如果对中间元素进行操作，效率会变低



消息排队、消息队列、栈



### 4、Set（集合）

set 中的值不能重复

Redis 中涉及到 set 的命令都是 s 开头

```bash
# 创建 set 并添加元素
sadd myset "hello"...

# 获取 set 的所有元素
smembers myset

# 判断某个值是不是 set 的成员
sismember myset "hello"

# 移除 set 中的指定元素
srem myset "hello"

# 查看 set 的长度
scard myset

# redis set 封装了获取随机元素的 api
srandmember myset [count] # 随机获取指定数量的元素

# 随机删除指定数量的 key
spop myset [count]

# 从一个set中将指定的值移动到另外的一个set中
smove source destination member
smove set1 set2 "v1"
```

- set 是无序不重复集合，可以做到抽取随机元素

- 共同关注（并集）

  - 差集、交集、并集

  ```bash
  # 差集
  sdiff key [key...]
  # 交集
  sinter key [key...]
  # 并集
  sunion key [key...]
  ```

  



### 5、Hash（散列）

可以理解为 key-map

原本的 k-v 中 value 变成了 map

Redis 中所有与 hash 相关的命令都是以 h 开头

hash 本质和 String 类型没有太大区别，还是一个简单的 key-value

```bash
# 设置 hash
hset myhash field value

# 获取 hash
hget myhash field

# 设置或者获取多个 hash
hmset myhash field1 hello field2 world
hmget myhash field1 field2

# 获取一个 hash 中所有 key-value
hgetall myhash

# 删除至少一个 field
hdel myhash field1 ...

# 获取一个 hash 的 key 的数量
hlen myhash

# 判断 hash 中某个 key 是否存在
hexists myhash field1

# 只获得所有的 field 
hkeys myhash
# 只获取所有的 value
hvals myhash

# 让某个 field 对应的 value 自增或自减 incr decr
# 指定增量
hincrby myhash field3 3
hincrby myhash field3 -1

# 如果存在
127.0.0.1:6379> hsetnx myhash field4 test # 如果不存在就可以使用
(integer) 1
127.0.0.1:6379> hsetnx myhash field4 tes # 如果存在就不可以使用
(integer) 0
```

hash 可以存放一些变更的数据：`hmset user:1 name kyo age 11`

尤其是用户信息的保存或者经常变动的信息。

**hash 更适合 对象 的存储**

**String 更加适合字符串存储**

 



### 6、Zset（有序集合）

在 set 的基础上增加了一个值，zset k1 score1 v1，中间加上一个标志用于声明优先级

zset 相关的命令都是以 z 开头

```bash
# 添加至少一个值
zadd myset 1 one
zadd myset 2 two 3 three

# 获取值
zrange myset 0 -1

# 实现排序
127.0.0.1:6379> zadd salary 2500 userOne
(integer) 1
127.0.0.1:6379> zadd salary 1000 userTwo
(integer) 1
127.0.0.1:6379> zadd salary 500 userThree
# 根据 score 排序，升序排列，显示所有数据，负无穷到正无穷
zrangebyscore salary -inf +inf
# min 和 max 默认是 大于等于和小于等于，如果是半闭合，可以这样
zrangebyscore salary (100 500
# 根据 score 排序，降序排列
zrevrangebyscore salary +inf -inf withscores

# 移除指定元素
zrem salary userOne

# 查看 Zset 中元素的个数
zcard salary

# 查看符合指定区间的元素个数
zcount salary 100 700
```



多看官方文档：https://redis.io/commands



案例思路：zset 排序 存储班级成绩表、工资表排序

普通消息：1、重要消息：2，带权重进行判断

排行榜应用实现，取 TopN



## 四、三种特殊数据类型

### 1、geospatial（地理位置）

朋友的定位、附近的人、打车距离计算

Redis 的 Geo 在 Redis3.2 版本就已经推出了，这个功能可以推算地理位置的信息，两地之间的距离，周围的人

可以查询一些测试数据 ：http://www.jsons.cn/lngcode/



Redis 中所有和 geospatial 相关的命令都是以 geo 开头



> geoadd

```bash
# 添加地理位置
# 规则：两极无法直接添加，我们一般会下载城市数据，通过 Java 程序一次性导入
# 参数 key (纬度、经度、名称)
# 有效经度从-180到180度
# 有效纬度从 -85.05112878 到 85.05112878 度

127.0.0.1:6379> geoadd china:city 30.24 120.16 hangzhou 34.26 108.96 xian
(integer) 2

# 官网例子
GEOADD Sicily 13.361389 38.115556 "Palermo" 15.087269 37.502669 "Catania"
```



> geopos



```bash
# 获取指定城市的维度和经度
127.0.0.1:6379> geopos Sicily Palermo Catania
1) 1) "13.36138933897018433"
   2) "38.11555639549629859"
2) 1) "15.08726745843887329"
   2) "37.50266842333162032"
```



> geodist

两者之间的距离

单位

- m 米
- km 千米
- mi 英里
- ft 英尺

```bash
# 查看的是直线距离
127.0.0.1:6379> geodist Sicily Palermo Catania m
"166274.1516"
127.0.0.1:6379> geodist Sicily Palermo Catania km
"166.2742"
127.0.0.1:6379> geodist Sicily Palermo Catania ft
"545518.8700"
127.0.0.1:6379> geodist Sicily Palermo Catania mi
"103.3182"
```



> georadius 以给定的经纬度为中心，找出某一半径内的元素

附近的人（获取所有附近的人的地址：定位）通过半径来查询



```bash
127.0.0.1:6379>  GEORADIUS Sicily 15 37 200 km WITHDIST
1) 1) "Palermo"
   2) "190.4424"
2) 1) "Catania"
   2) "56.4413"
127.0.0.1:6379>  GEORADIUS Sicily 15 37 200 km
1) "Palermo"
2) "Catania"
```



> georadiusbymember

找出位于指定范围内的元素，中心点是由给定的位置元素决定的



> geohash

返回一个或多个位置元素的 Geohash 表示

目前用不到

```bash
# 将二维的经纬度转换为一维的字符串，如果两个字符串越接近，那么距离就越近
```



> GEO 底层实现原理：Zset，可以使用 Zset 命令操作 geo



```bash
# 查看 geospatial 中所有数据
# zset 的所有命令都适用于 geospatial
zrange Sicily 0 -1 

# 移除指定元素
zrem Sicily Palermo
```







### 2、hyperloglog

> 什么是基数？

A{1, 3,  5, 7, 8, 7}

B{1, 3, 5, 7, 8}

基数：集合的个数（要求没有重复）



**简介：**

Redis 2.8.9 就更新了 Hyperloglog 数据结构

Redsi Hyperloglog 基数统计的算法

网页的 UV（一个人访问一个网站，但是还是算作一个人）



传统的方式：set 保存用户的 Id，就可以统计 set 中的元素数量作为标准判断（可能存在误差）

这种方式如果保存大量用户 id ，会比较麻烦。我们的目的是为了计数，而不是保存用户 id。



Hyperloglog：**优点**

- 占用的内存是固定的
- 例如，2^64 个不同的基数，只需要 12KB 内存





Redis 中所有和 hyperloglog 相关的命令都是以 pf 开头

```bash
# 创建第一组元素
127.0.0.1:6379> pfadd mykey a b c d e f g h i j
(integer) 1

# 统计 mykey 中的基数
127.0.0.1:6379> pfcount mykey
(integer) 10

127.0.0.1:6379> pfadd mykey2 a a b c d
(integer) 1
127.0.0.1:6379> pfcount mykey2
(integer) 4

# 合并 mykey 和 mykey2 生成 mykey3，mykey3 中无重复元素
127.0.0.1:6379> pfmerge mykey3 mykey mykey2
OK
127.0.0.1:6379> keys *
1) "mykey"
2) "mykey3"
3) "mykey2"
127.0.0.1:6379> pfcount mykey3
(integer) 10
```

如果匀速容错，一定可以使用 hyperloglog

如果不允许容错，可以使用 set 或者自定义一种数据类型





### 3、bitmaps

> 位存储

每一位用户用 0 或 1 表示

统计用户信息：活跃、不活跃，登录、未登录

打卡，一年365天，每一天都有两个状态



bitmaps：位图，也是一种数据结构，操作二进制位来进行记录，0 和 1 两种状态

> 测试

例如：使用 bitmaps 记录一星期的打卡

周一：1 周二：0

统计的时候只需要统计有多少个 1

```bash
127.0.0.1:6379> setbit sign 0 0
(integer) 0
127.0.0.1:6379> setbit sign 1 0
(integer) 0
127.0.0.1:6379> setbit sign 2 0
(integer) 0
127.0.0.1:6379> setbit sign 3 0
(integer) 0
127.0.0.1:6379> setbit sign 4 0
(integer) 0
127.0.0.1:6379> setbit sign 5 0
(integer) 0
127.0.0.1:6379> setbit sign 6 0
(integer) 0
```

查看某一天是否有打卡

```bash
127.0.0.1:6379> getbit sign 3
(integer) 0
127.0.0.1:6379> getbit sign 6
(integer) 0
```



统计打卡天数

```bash
bitcount key start end
# 默认的 bitcount key 统计所有值为 1 的数量
```





## 五、事务

MySQL：ACID

要么同时成功，要么同时失败：原子性



Redis 事务的本质：一组命令的集合！一个事务所有命令都会被序列化，在事务执行过程中，会按照顺序执行

- 一次性
- 顺序性
- 排他性（不允许被其他命令干扰）

Redis **单条命令可以保证原子性**，但是 **Redis 中事务不保证原子性**

- Redis 事务没有隔离级别的概念（多条事务对同一资源进行操作的时候）
- 所有命令在事务并没有直接被执行，只有发起执行命令才会执行：Exec



Redis 的事务：

- 开启事务（**multi**）
- 命令入队（...）
- 执行事务（**exec**）

锁：Redis 可以实现乐观锁



### 1、正常执行事务

```bash
# 开启事务
127.0.0.1:6379> multi
OK
# 命令入队
127.0.0.1:6379(TX)> set k1 v1
QUEUED
127.0.0.1:6379(TX)> set k2 v2
QUEUED
127.0.0.1:6379(TX)> get k2
QUEUED
127.0.0.1:6379(TX)> set k3 v3
QUEUED
# 执行事务
127.0.0.1:6379(TX)> exec
1) OK
2) OK
3) "v2"
4) OK
```



### 2、放弃事务

```bash
# 开启事务
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> set k1 v1
QUEUED
127.0.0.1:6379(TX)> set k2 v2
QUEUED
127.0.0.1:6379(TX)> set k4 v4
QUEUED
# 取消事务
127.0.0.1:6379(TX)> discard
OK
# 事务队列中的命令都不会被执行
```



### 3、事务中的异常

> 编译型异常（代码问题，命令有错），事务中所有的命令都不会被执行

```bash
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> set k1 v1
QUEUED
127.0.0.1:6379(TX)> set k2 v2
QUEUED
127.0.0.1:6379(TX)> set k3 v3
QUEUED
127.0.0.1:6379(TX)> getset k3
(error) ERR wrong number of arguments for 'getset' command
127.0.0.1:6379(TX)> set k4 v4
QUEUED
127.0.0.1:6379(TX)> set k5 v5
QUEUED
127.0.0.1:6379(TX)> exec
(error) EXECABORT Transaction discarded because of previous errors.
127.0.0.1:6379> get k5
(nil)
127.0.0.1:6379> get k1
(nil)
```





> 运行时异常，如果事务队列中存在语法错误，那么执行的时候，其他命令可以正常执行

单条命令是原子性的，但是事务中的命令队列不保证原子性和隔离性

```bash
127.0.0.1:6379> set k1 "v1"
OK
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> incr k1
QUEUED
127.0.0.1:6379(TX)> set k2 v2
QUEUED
127.0.0.1:6379(TX)> set k3 v3
QUEUED
127.0.0.1:6379(TX)> get k3
QUEUED
127.0.0.1:6379(TX)> exec
1) (error) ERR value is not an integer or out of range # 虽然第一条命令错误，但是其他命令依旧执行成功了
2) OK
3) OK
4) "v3"
127.0.0.1:6379> get k2
"v2"
127.0.0.1:6379> get k3
"v3"
```



### 4、**监控 Watch 实现乐观锁**

**悲观锁：**

- 很悲观，认为什么时候都会出问题，无论做什么都会加锁！



**乐观锁：**

- 很乐观，认为什么时候都不会出现问题，所以不会加锁！在更新数据时才会加锁判断，在此期间是否有人修改过这个数据（相当于 MySQL 中使用 version 字段）
- 获取 version
- 更新的时候比较 version



Redis 中实现乐观锁使用 Watch



> Redis 监控测试

正常执行成功

```bash
127.0.0.1:6379> set money 100
OK
127.0.0.1:6379> set out 0
OK
127.0.0.1:6379> watch money  # 监视 money
OK
127.0.0.1:6379> multi  # 事务正常结束，此期间数据没有发生变动，这个时候正常执行
OK
127.0.0.1:6379(TX)> decrby money 20
QUEUED
127.0.0.1:6379(TX)> incrby out 20
QUEUED
127.0.0.1:6379(TX)> exec
1) (integer) 80
2) (integer) 20
```



两个线程对同一资源进行操作：

```bash
# 一条线程开启监控，同时启动事务
127.0.0.1:6379> watch money
OK
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> decrby money 10
QUEUED
127.0.0.1:6379(TX)> incrby out 10
QUEUED
# 由于监控到 money 变化，所以该事务不会成功
127.0.0.1:6379(TX)> exec
(nil)

# 在 exec 之前另一条线程改变了被监视的资源
127.0.0.1:6379> get money
"80"
127.0.0.1:6379> set money 1000
OK
127.0.0.1:6379> 
```



**测试多线程修改值，使用 watch 可以当作 redis 的乐观锁操作。**



执行事务失败后如果想重新进行事务操作，就需要接触监视后重新监视新的数据

```bash
127.0.0.1:6379> unwatch
OK
127.0.0.1:6379> watch money
OK
```



## 六、Jedis

使用 Java 操作 Redis

> 什么是 Jedis

Jedis 是 Redis 官方推荐的 Java 连接开发工具，相当于 Redis 的中间件



导入 jedis 的依赖包，可以去找最新版本

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>3.6.1</version>
</dependency>

<!-- 使用 fastjson 存储一些数据 -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.76</version>
</dependency>
```



## 七、SpringBoot 整合

SpringBoot 操作数据：spring-data jpa jdbc mongodb redis

**SpringData** 也是一个和 SpringBoot 齐名的项目



**说明：在 SpringBoot 2.x 后，原来使用的 Jedis 被替换为 `lettuce`**

jedis: 采用的是直连，如果多个线程操作，是不安全的，如果想要避免不安全的操作，需要使用 jedis pool 连接池。更像 **BIO 模式**



lettuce:  底层采用 netty，实例可以在多个线程中共享，不存在线程不安全的情况，可以减少线程数量，更像 **NIO 模式**



### 1、回顾 springboot 配置

- springboot 所有的配置类，都有一个自动配置类
- 自动配置类都会绑定一个 properties 配置文件
- 查看的方法：
  - 第一步：找到 springboot 的配置 jar `org.springframework.boot:spring-boot-autoconfigure`
  - 第二步：找到 META-INFO 下面的 `spring.factories`
  - 第三步：搜索 Redis，找到 对应的自动配置类 `RedisAutoConfiguration`
  - 第四步：找到绑定的配置文件类：`@EnableConfigurationProperties(RedisProperties.class)`
  - 第五步：找到配置类绑定的前缀：`@ConfigurationProperties(prefix = "spring.redis")`



### 2、分析 RedisAutoConfiguration

分析 **RedisAutoConfiguration** 类

其中注册了两个 Bean：

- `RedisTemplate`
- `StringRedisTemplate`



```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnClass(RedisOperations.class)
// 绑定配置属性类
@EnableConfigurationProperties(RedisProperties.class)
@Import({ LettuceConnectionConfiguration.class, JedisConnectionConfiguration.class })
public class RedisAutoConfiguration {

	@Bean
  // 当名为 redisTemplate 的 bean 不存在时，RedisTemplate 生效
  // 意思就是如果我们自己写了一个 redisTemplate，就使用我们的
	@ConditionalOnMissingBean(name = "redisTemplate")
	@ConditionalOnSingleCandidate(RedisConnectionFactory.class)
	public RedisTemplate<Object, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
    // 默认的 RedisTemplate, 没有过多的设置，redis 对象都是需要序列化的 (涉及到 NIO)
    // 两个泛型都是 Object，所以后面使用的时候都需要强制类型转换
		RedisTemplate<Object, Object> template = new RedisTemplate<>();
		template.setConnectionFactory(redisConnectionFactory);
		return template;
	}

  // 多加一个 StringRedisTemplate 是为了方便
  // 上面那个适用于多种数据类型
  // 下面这个只适用 String 类型
	@Bean
	@ConditionalOnMissingBean
	@ConditionalOnSingleCandidate(RedisConnectionFactory.class)
	public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory redisConnectionFactory) {
		StringRedisTemplate template = new StringRedisTemplate();
		template.setConnectionFactory(redisConnectionFactory);
		return template;
	}
}
```



### 3、自定义 RedisTemplate

- 导入依赖

- 配置连接

  ```yaml
  # redis 配置
  spring:
    redis:
      host: {服务器 IP}
      port: 6379
      password: {如果有密码需要填写}
  ```

- 测试



> 总结

由于使用 RedisTemplate 执行各种命令时必须进行序列化和反序列化的操作，所以我们会发现，在 Java 程序中可以直接根据自定义的 key 拿到值，但是在服务器端 Redis 数据库中存储的却是一些无法识别的字符，两种方法解决这个问题：

- 使用 `StringRedisTemplate`，但是它只能针对 String 做一些处理，非常不方便

- 更改 RedisTemplate 默认的序列化方式（默认使用的是）

  > By default, it uses Java serialization for its objects (through {@link JdkSerializationRedisSerializer}.For String intensive operations consider the dedicated {@link StringRedisTemplate}
  
  也就是说默认序列化方式是 jdk 的序列化，针对 String 类型可以使用特定的 StringRedisTemplate

  ```java
  // RedisTemplate 序列化要求
  private @Nullable RedisSerializer keySerializer = null;
  private @Nullable RedisSerializer valueSerializer = null;
  private @Nullable RedisSerializer hashKeySerializer = null;
  private @Nullable RedisSerializer hashValueSerializer = null;
  
  // 默认的序列化方式
  // JDK 序列化会让字符转义
  // 我们需要使用 json 序列化
  defaultSerializer = new JdkSerializationRedisSerializer(...)
    
  
  // 解决思路
  // 自己定义一个 RedisTemplate
  ```
  
- 自定义 `RedisTemplate`

  ```java
  package com.naivekyo.config;
  
  import com.fasterxml.jackson.annotation.JsonAutoDetect;
  import com.fasterxml.jackson.annotation.PropertyAccessor;
  import com.fasterxml.jackson.databind.ObjectMapper;
  import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;
  import org.springframework.data.redis.connection.RedisConnectionFactory;
  import org.springframework.data.redis.core.RedisTemplate;
  import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
  import org.springframework.data.redis.serializer.StringRedisSerializer;
  
  /**
   * @author naivekyo
   * @date 2021/6/27
   * 
   * Redis 配置类
   */
  @Configuration
  public class RedisConfig {
      
      @Bean
      @SuppressWarnings("all")
      public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
          RedisTemplate<String, Object> template = new RedisTemplate<>();
          template.setConnectionFactory(redisConnectionFactory);
          
          // 序列化配置
          Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
          ObjectMapper objectMapper = new ObjectMapper();
          objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
          objectMapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL);
          jackson2JsonRedisSerializer.setObjectMapper(objectMapper);
          // String 的序列化
          StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();
          
          // 配置具体的序列化方式
          // key 采用 String 的序列化方式
          template.setKeySerializer(stringRedisSerializer);
          // hash 的 key 也采用 String 的序列化方式
          template.setHashKeySerializer(stringRedisSerializer);
          // value 序列化方式采用 jackson
          template.setValueSerializer(jackson2JsonRedisSerializer);
          // hash 的 value 序列化方式采用 jackson
          template.setHashValueSerializer(jackson2JsonRedisSerializer);
          
          return template;
      }
    
      /* TODO 缓存配置 */
  }
  
  ```

- 使用自定义的 `RedisTemplate` 由于有多个 RedisTemplate 所以引入的时候可以指定 bean 名称

  ```java
  @Autowired
  @Qualifier("redisTemplate")
  private RedisTemplate redisTemplate;
  ```



### 4、Redis 工具类

使用封装好的 RedisUtils

```java
package com.naivekyo.util;

import com.sun.istack.internal.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * @author naivekyo
 * @date 2021/6/27
 * 
 * Redis 工具类
 */
@Component
public final class RedisUtils {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    // ================================= common ===============================

    /**
     * 指定缓存失效时间
     * @param key 键
     * @param time 时间(秒)
     * @return
     */
    public boolean expire(String key, long time) {
        try {
            if (time > 0) {
                redisTemplate.expire(key, time, TimeUnit.SECONDS);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 根据 key 获取过期时间
     * @param key 键 不能为 null
     * @return 时间(秒), 返回 0 代表永久有效
     */
    public long getExpire(@NotNull String key) {
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }

    /**
     * 判断 key 是否存在
     * @param key 键
     * @return true 存在; false 不存在
     */
    public boolean hasKey(String key) {
        try {
            return redisTemplate.hasKey(key);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 根据 key 删除缓存
     * @param key 可以传入一个或多个 
     */
    @SuppressWarnings("unchecked")
    public void del(String... key) {
        if (key != null && key.length > 0) {
            if (key.length == 1) {
                redisTemplate.delete(key[0]);
            } else {
                redisTemplate.delete((Collection<String>) CollectionUtils.arrayToList(key));
            }
        }
    }
    
    // ================================ String ====================================

    /**
     * 普通缓存获取
     * @param key 键
     * @return 值
     */
    public Object get(String key) {
        return key == null ? null : redisTemplate.opsForValue().get(key);
    }
    
    /**
     * 普通缓存放入
     * @param key 键
     * @param value 值
     * @return true 成功; false 失败
     */
    public boolean set(String key, Object value) {
        try {
            redisTemplate.opsForValue().set(key, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 普通缓存放入并设置时间
     * @param key 键
     * @param value 值
     * @param time 时间(秒) time 要大于 0，如果 time 小于 0，将设置无限期
     * @return
     */
    public boolean set(String key, Object value, long time) {
        try {
            if (time > 0) {
                redisTemplate.opsForValue().set(key, value, time, TimeUnit.SECONDS);
            } else {
                set(key, value);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 递增
     * @param key   键
     * @param delta 要增加几(大于0)
     */
    public long incr(String key, long delta) {
        if (delta < 0) {
            throw new RuntimeException("递增因子必须大于0");
        }
        return redisTemplate.opsForValue().increment(key, delta);
    }

    /**
     * 递减
     * @param key   键
     * @param delta 要减少几(小于0)
     */
    public long decr(String key, long delta) {
        if (delta < 0) {
            throw new RuntimeException("递减因子必须大于0");
        }
        return redisTemplate.opsForValue().increment(key, -delta);
    }
    
    // ============================= Map =================================

    /**
     * HashGet
     * @param key  键 不能为null
     * @param item 项 不能为null
     */
    public Object hget(String key, String item) {
        return redisTemplate.opsForHash().get(key, item);
    }

    /**
     * 获取 hashKey 对应的所有键值
     * @param key 键
     * @return 对应的多个键值
     */
    public Map<Object, Object> hmget(String key) {
        return redisTemplate.opsForHash().entries(key);
    }

    /**
     * HashSet
     * @param key 键
     * @param map 对应多个键值
     */
    public boolean hmset(String key, Map<String, Object> map) {
        try {
            redisTemplate.opsForHash().putAll(key, map);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * HashSet 并设置时间
     * @param key  键
     * @param map  对应多个键值
     * @param time 时间(秒)
     * @return true成功 false失败
     */
    public boolean hmset(String key, Map<String, Object> map, long time) {
        try {
            redisTemplate.opsForHash().putAll(key, map);
            if (time > 0) {
                expire(key, time);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 向一张 hash 表中放入数据,如果不存在将创建
     *
     * @param key   键
     * @param item  项
     * @param value 值
     * @return true 成功 false失败
     */
    public boolean hset(String key, String item, Object value) {
        try {
            redisTemplate.opsForHash().put(key, item, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 向一张 hash 表中放入数据,如果不存在将创建, 并设置过期时间
     *
     * @param key   键
     * @param item  项
     * @param value 值
     * @param time  时间(秒) 注意:如果已存在的hash表有时间,这里将会替换原有的时间
     * @return true 成功 false失败
     */
    public boolean hset(String key, String item, Object value, long time) {
        try {
            redisTemplate.opsForHash().put(key, item, value);
            if (time > 0) {
                expire(key, time);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 删除 hash 表中的值
     *
     * @param key  键 不能为null
     * @param item 项 可以使多个 不能为null
     */
    public void hdel(String key, Object... item) {
        redisTemplate.opsForHash().delete(key, item);
    }

    /**
     * 判断 hash 表中是否有该项的值
     *
     * @param key  键 不能为null
     * @param item 项 不能为null
     * @return true 存在 false不存在
     */
    public boolean hHasKey(String key, String item) {
        return redisTemplate.opsForHash().hasKey(key, item);
    }

    /**
     * hash 递增 如果不存在,就会创建一个 并把新增后的值返回
     *
     * @param key  键
     * @param item 项
     * @param by   要增加几(大于0)
     */
    public double hincr(String key, String item, double by) {
        return redisTemplate.opsForHash().increment(key, item, by);
    }

    /**
     * hash 递减
     *
     * @param key  键
     * @param item 项
     * @param by   要减少记(小于0)
     */
    public double hdecr(String key, String item, double by) {
        return redisTemplate.opsForHash().increment(key, item, -by);
    }
    
    // ==================================== Set =========================================

    /**
     * 根据 key 获取 Set 中的所有值
     * @param key 键
     */
    public Set<Object> sGet(String key) {
        try {
            return redisTemplate.opsForSet().members(key);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 根据 value 从一个 set 中查询,是否存在
     *
     * @param key   键
     * @param value 值
     * @return true 存在 false不存在
     */
    public boolean sHasKey(String key, Object value) {
        try {
            return redisTemplate.opsForSet().isMember(key, value);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将数据放入 set 缓存
     *
     * @param key    键
     * @param values 值 可以是多个
     * @return 成功个数
     */
    public long sSet(String key, Object... values) {
        try {
            return redisTemplate.opsForSet().add(key, values);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * 将 set 数据放入缓存, 并设置过期时间
     *
     * @param key    键
     * @param time   时间(秒)
     * @param values 值 可以是多个
     * @return 成功个数
     */
    public long sSetAndTime(String key, long time, Object... values) {
        try {
            Long count = redisTemplate.opsForSet().add(key, values);
            if (time > 0)
                expire(key, time);
            return count;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * 获取 set 缓存的长度
     *
     * @param key 键
     */
    public long sGetSetSize(String key) {
        try {
            return redisTemplate.opsForSet().size(key);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * 移除值为 value 的缓存
     *
     * @param key    键
     * @param values 值 可以是多个
     * @return 移除的个数
     */

    public long setRemove(String key, Object... values) {
        try {
            Long count = redisTemplate.opsForSet().remove(key, values);
            return count;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
    
    // ============================== List ==========================================

    /**
     * 获取 list 缓存的内容
     *
     * @param key   键
     * @param start 开始
     * @param end   结束 0 到 -1 代表所有值
     */
    public List<Object> lGet(String key, long start, long end) {
        try {
            return redisTemplate.opsForList().range(key, start, end);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 获取 list 缓存的长度
     *
     * @param key 键
     */
    public long lGetListSize(String key) {
        try {
            return redisTemplate.opsForList().size(key);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * 通过索引 获取 list 中的值
     *
     * @param key   键
     * @param index 索引 index>=0时， 0 表头，1 第二个元素，依次类推；index<0时，-1，表尾，-2倒数第二个元素，依次类推
     */
    public Object lGetIndex(String key, long index) {
        try {
            return redisTemplate.opsForList().index(key, index);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 将 list 放入缓存
     *
     * @param key   键
     * @param value 值
     */
    public boolean lSet(String key, Object value) {
        try {
            redisTemplate.opsForList().rightPush(key, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将 list 放入缓存，并设置过期时间
     * @param key   键
     * @param value 值
     * @param time  时间(秒)
     */
    public boolean lSet(String key, Object value, long time) {
        try {
            redisTemplate.opsForList().rightPush(key, value);
            if (time > 0)
                expire(key, time);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将 list 放入缓存
     *
     * @param key   键
     * @param value 值
     * @return
     */
    public boolean lSet(String key, List<Object> value) {
        try {
            redisTemplate.opsForList().rightPushAll(key, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将 list 放入缓存, 并设置过期时间
     *
     * @param key   键
     * @param value 值
     * @param time  时间(秒)
     * @return
     */
    public boolean lSet(String key, List<Object> value, long time) {
        try {
            redisTemplate.opsForList().rightPushAll(key, value);
            if (time > 0)
                expire(key, time);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 根据索引修改 list 中的某条数据
     *
     * @param key   键
     * @param index 索引
     * @param value 值
     * @return
     */

    public boolean lUpdateIndex(String key, long index, Object value) {
        try {
            redisTemplate.opsForList().set(key, index, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 移除 N 个值为 value 的缓存
     *
     * @param key   键
     * @param count 移除多少个
     * @param value 值
     * @return 移除的个数
     */

    public long lRemove(String key, long count, Object value) {
        try {
            Long remove = redisTemplate.opsForList().remove(key, count, value);
            return remove;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
}

```

### 5、总结

**通过 Java 操作 Redis 十分简单，更重要的是要去理解 Redis 的思想以及每一种数据结构的用处场景。**



关于对象的保存：

企业开发中所有的 pojo 类都必须实现 `Serializable` 接口，定义 `serialVersionUID`

> objectMapper.enableDefaultTyping()  **过时问题**

查看 `ObjectMapper` 源码，推荐使用 `activateDefaultTyping()`

博客：https://blog.csdn.net/zzhongcy/article/details/105813105

```java
    /**
     * Base settings contain defaults used for all {@link ObjectMapper}
     * instances.
     */
    protected final static BaseSettings DEFAULT_BASE = new BaseSettings(
            null, // cannot share global ClassIntrospector any more (2.5+)
            DEFAULT_ANNOTATION_INTROSPECTOR,
             null, TypeFactory.defaultInstance(),
            null, StdDateFormat.instance, null,
            Locale.getDefault(),
            null, // to indicate "use Jackson default TimeZone" (UTC since Jackson 2.7)
            Base64Variants.getDefaultVariant(),
            // Only for 2.x; 3.x will use more restrictive default
            LaissezFaireSubTypeValidator.instance,
            // Since 2.12:
            new DefaultAccessorNamingStrategy.Provider()
    );
```



## 八、Redis.conf 详解

服务器端启动 Redis 服务需要指定它的配置文件

可以利用更改一些配置细节来优化速度



### 1、单位

```bash
# Redis configuration file example.
#
# Note that in order to read the configuration file, Redis must be
# started with the file path as first argument:
#
# ./redis-server /path/to/redis.conf

# Note on units: when memory size is needed, it is possible to specify
# it in the usual form of 1k 5GB 4M and so forth:
#
# 1k => 1000 bytes
# 1kb => 1024 bytes
# 1m => 1000000 bytes
# 1mb => 1024*1024 bytes
# 1g => 1000000000 bytes
# 1gb => 1024*1024*1024 bytes
#
# units are case insensitive so 1GB 1Gb 1gB are all the same.
```

1、配置文件 unit 单位对大小写不敏感



### 2、包含

```bash
################################## INCLUDES ###################################

# Include one or more other config files here.  This is useful if you
# have a standard template that goes to all Redis servers but also need
# to customize a few per-server settings.  Include files can include
# other files, so use this wisely.
#
# Note that option "include" won't be rewritten by command "CONFIG REWRITE"
# from admin or Redis Sentinel. Since Redis always uses the last processed
# line as value of a configuration directive, you'd better put includes
# at the beginning of this file to avoid overwriting config change at runtime.
#
# If instead you are interested in using includes to override configuration
# options, it is better to use include as the last line.
#
# include /path/to/local.conf
# include /path/to/other.conf
```

Redis 的配置文件可以不止一个，但是有一个主要的配置文件，它可以引入其他配置文件。



### 3、模块

```bash
################################## MODULES #####################################

# Load modules at startup. If the server is not able to load modules
# it will abort. It is possible to use multiple loadmodule directives.
#
# loadmodule /path/to/my_module.so
# loadmodule /path/to/other_module.so
```



### 4、网络

```bash
# Redis 绑定监听端口, 不要开放允许所有 IP 连接 Redis 服务器
# 默认监听本地 IP, 只允许本机连接
bind 127.0.0.1 -::1

# Redis 的保护模式
# 如果开启了保护模式, 但是没有指定监听一组 IP, 且开启密码, 那么 Redis 只允许本机客户端连接
# 保护模式默认是开启的, 想关闭它时, 必须确认要从其他客户端连接 Redis 服务器且使用 bind 命令监听指定 IP 的访问请求。
protected-mode no

# Redis 默认监听端口 6379, 如果指定监听端口 0, 那么 Redis 将不会监听 TCP 连接
port 6379

# 剩下的就是一些超市配置和 ssl 认证, 暂时只做了解
```



### 5、通用

```bash
# 是否以守护进程方式开启 Redis 服务
# yes 则会在 /var/run/redis.pid 创建一个 pid 文件, Redis 会在后台运行(推荐使用)
# 默认是 no
daemonize yes

# 如果 Redis 进程被 upstart 或者 systemd 命令监控, 则 daemonize 配置无效
# 默认不开启
supervised no

# pid 文件位置
pidfile /var/run/redis_6379.pid

# 日志级别
# Specify the server verbosity level.
# This can be one of:
# debug (a lot of information, useful for development/testing)
# verbose (many rarely useful info, but not a mess like the debug level)
# notice (moderately verbose, what you want in production probably)
# warning (only very important / critical messages are logged)
loglevel notice


# 日志文件
# Specify the log file name. Also the empty string can be used to force
# Redis to log on the standard output. Note that if you use standard
# output for logging but daemonize, logs will be sent to /dev/null
logfile "" # 日志的文件位置名，为空代表标准输出

# 默认数据库数量
# Set the number of databases. The default database is DB 0, you can select
# a different one on a per-connection basis using SELECT <dbid> where
# dbid is a number between 0 and 'databases'-1
databases 16

# 是否显示 Redis 的启动 logo
always-show-logo no

# 修改进程的标题, no 表示修改
# By default, Redis modifies the process title (as seen in 'top' and 'ps') to
# provide some runtime information. It is possible to disable this and leave
# the process name as executed by setting the following to no.
set-proc-title yes

# 如果要修改进程标题
# When changing the process title, Redis uses the following template to construct
# the modified title.
#
# Template variables are specified in curly brackets. The following variables are
# supported:
#
# {title}           Name of process as executed if parent, or type of child process.
# {listen-addr}     Bind address or '*' followed by TCP or TLS port listening on, or
#                   Unix socket if only that's available.
# {server-mode}     Special mode, i.e. "[sentinel]" or "[cluster]".
# {port}            TCP port listening on, or 0.
# {tls-port}        TLS port listening on, or 0.
# {unixsocket}      Unix domain socket listening on, or "".
# {config-file}     Name of configuration file used.
#
proc-title-template "{title} {listen-addr} {server-mode}"
```



### 6、快照

**涉及到持久化**

在规定的时间内，执行了多少操作，就会持久化到一个文件 `.rbd、.aof`

Redis 是内存数据库，如果没有持久化，存储的数据就会断电即失

```bash
# You can set these explicitly by uncommenting the three following lines.
#
# save 3600 1 # 如果一小时内，有一个 key 被修改，就进行持久化操作
# save 300 100 # 300 秒内，100 个 key 被修改，就进行持久化操作
# save 60 10000 # 60 秒内，。。。。。
# 之后会设置自定义持久化机制

# 如果持久化出现错误后，是否继续执行持久化操作，默认继续
stop-writes-on-bgsave-error yes

# 是否压缩 rdb 文件，默认开启，需要消耗 CPU 资源
rdbcompression yes

# 保存 rdb 文件时是否校验 rbd 文件，如果出错可以通过校验修复
rdbchecksum yes

# rdb 文件生成目录，默认当前目录
dir ./
```



### 7、复制

```bash
涉及到主从复制
```





### 8、安全

```bash
# 获取密码
config get requirepass
# 设置密码：两种方式，配置文件和运行时配置
config get requirepass "password"
```

还有很多自己看



### 9、客户端

```bash
# 设置能连接上 Redis 的最大客户端的数量
maxclients 10000
```



### 10、内存管理

```bash
# redis 配置最大的内存容量
maxmemory <bytes>

# 内存达到上限后的处理策略
maxmemory-policy noeviction

# MAXMEMORY POLICY: how Redis will select what to remove when maxmemory
# is reached. You can select one from the following behaviors:
#
# volatile-lru -> 只对设置了过期时间的 key 进行 LRU (默认值)
# allkeys-lru -> Evict any key using approximated LRU.
# volatile-lfu -> Evict using approximated LFU, only ke	ys with an expire set.
# allkeys-lfu -> Evict any key using approximated LFU.
# volatile-random -> Remove a random key having an expire set.
# allkeys-random -> Remove a random key, any key.
# volatile-ttl -> Remove the key with the nearest expire time (minor TTL)
# noeviction -> Don't evict anything, just return an error on write operations.
```



### 11、APPEND ONLY MODE（aof 配置）



```bash
# 默认不开启，因为默认使用 rdb 方式持久化，在大部分情况下，rdb 完全够用
appendonly no

# 持久化文件名
appendfilename "appendonly.aof"

# 同步机制
# appendfsync always	每次修改都会 sync，速度慢
appendfsync everysec # 每秒执行一次 sync，可能会丢失这一秒的数据
# appendfsync no	不执行 sync，这个时候操作系统自己同步数据，速度较快
```



具体配置看 持久化



## 九、Redis 持久化

aof rdb 两种持久化方式

Redis 是缓存数据库，如果不能及时将内存中的数据保存到磁盘上面，一旦服务器进程退出，Redis 数据库中的所有状态都会消失，所以 Redis 提供了持久化功能



### 1、RDB

Redis DataBase



指定时间间隔内将内存中的**数据集快照**写入磁盘，即 Snapshot 快照，它恢复时直接将快照文件读入到内存中。

Redis 会单独创建（fork）一个子进程来进行持久化，会先将数据写入到一个临时文件中，等待持久化过程都结束了，再用这个临时文件替换上次持久化好的文件。整个过程中，主进程是不进行任何 IO 操作的，这就确保的极高的性能。如果需要进行大规模数据的恢复，且对于数据恢复的完整性不是非常敏感，那么 RDB 方式要比 AOF 方式更加高效。RDB 的缺点是最后一次持久化后的数据可能丢失（情况：最后一次持久化的时候，服务器宕机了）。

一般情况下默认就是 RDB。



rdb 保存的文件：`dump.rdb`，该文件名是在配置文件中配置的

配置文件，设置 `save 60 5`

测试：删除 dump.rdb，清空数据，进入命令行：

```bash
# 先 save 生成 dump.rdb
save
# 一分钟内设置 5 个 key，触发持久化机制
# 关闭 redis 服务
shutdown
```



> 触发机制

1、客户端向 Redis 服务器发送 save 或者 bgsave 命令就会让服务器生成 rdb 文件

- save 命令是一个同步操作

  - 当客户端向服务器发送 save 命令请求进行持久化时，服务器会阻塞 save 命令之后的其他客户端的请求，直到数据同步完成。如果数据量太大，同步数据会执行很久，而这期间 Redis 服务器也无法接收其他请求，所以，最好不要在生产环境使用 save 命令。

- bgsave 是一个异步操作

  - 当客户端发服务发出 bgsave 命令时，Redis 服务器主进程会 forks 一个子进程来数据同步问题，在将数据保存到 rdb 文件之后，子进程会退出。
  - 所以，与 save 命令相比，Redis 服务器在处理 bgsave 采用子线程进行 IO 写入，而主进程仍然可以接收其他请求，但 forks 子进程是同步的，所以 forks 子进程时，一样不能接收其他请求，这意味着，如果forks一个子进程花费的时间太久(一般是很快的)，bgsave 命令仍然有阻塞其他客户的请求的情况发生。

  

2、Redis 配置文件中定义了触发机制

- 这种通过服务器配置文件触发RDB的方式，与 bgsave 命令类似，达到触发条件时，会 forks 一个子进程进行数据同步，不过最好不要通过这方式来触发RDB持久化，因为设置触发的时间太短，则容易频繁写入rdb文件，影响服务器性能，时间设置太长则会造成数据丢失。



3、执行了 flushall 命令，也会触发 rdb 规则



4、退出 redis，也会产生 rdb 文件



触发了以上机制后，Redis 先生成临时 rdb 文件，并写入数据，完成数据写入后，就会用临时文件替代正式的 rdb 文件，最后删除原来的 rdb 文件。



> 如何恢复 rdb 文件

1、只需要将 rdb 文件放到 redis 启动目录下，redis 启动时会自动检查 dump.rdb ，然后恢复其中的数据

2、查看 rdb 文件存放的位置

  ```bash
127.0.0.1:6379> config get dir
1) "dir"
2) "/opt/redis-6.2.4/bin"
  ```



> 优缺点

优点：

1. 适合大规模的数据恢复
2. 与AOF方式相比，通过rdb文件恢复数据比较快。
3. rdb文件非常紧凑，适合于数据备份。
4. 通过RDB进行数据备份，由于使用子进程生成，所以对Redis服务器性能影响较小。
5. 对数据的完整性要求不高



缺点：

1. 不能完全保证数据完整性：如果服务器宕机的话，采用RDB的方式会造成某个时段内数据的丢失，比如我们设置10分钟同步一次或5分钟达到1000次写入就同步一次，那么如果还没达到触发条件服务器就死机了，那么这个时间段的数据会丢失。
2. 使用 save 命令会造成服务器阻塞，直接数据同步完成才能接收后续请求。
3. 使用 bgsave 命令在 forks 子进程时，如果数据量太大，forks 的过程也会发生阻塞，另外，forks 子进程会耗费内存。



### 2、AOF

Append Only File



与 RDB 存储某个时刻的快照不同，AOF 持久化方式会记录客户端对**服务器的每一次写操作命令**，并将这些写操作以 Redis 协议追加保存到以后缀为 aof 文件末尾，在 Redis 服务器重启时，会加载并运行 aof 文件的命令，以达到恢复数据的目的。

 

- 以日志形式记录每一个写操作，将 Redis 执行过的所有指令记录下来（读操作不记录）
- 只许追加文件但不可以改写文件，redis 启动之初会读取该文件重构数据



Aof 保存的文件是：`appendonly.aof`  文件

aof 功能默认不开启，需要改配置文件，而且开启后默认每一秒中都同步一次

```bash
# 手动开启
appendonly yes
# 默认命名
appendfilename "appendonly.aof"

# 执行策略
# appendfsync always
appendfsync everysec
# appendfsync no

# 默认不重写aof文件
no-appendfsync-on-rewrite no

# 保存目录
dir ~/redis/

# 其余配置暂时默认即可 
```

1. always

客户端的每一个写操作都保存到aof文件当，这种策略很安全，但是每个写请注都有IO操作，所以也很慢。

2. everysec

appendfsync的默认写入策略，每秒写入一次aof文件，因此，最多可能会丢失1s的数据。

3. no

Redis服务器不负责写入aof，而是交由操作系统来处理什么时候写入aof文件。更快，但也是最不安全的选择，不推荐使用。



两种重写方式：

通过在redis.conf配置文件中的选项no-appendfsync-on-rewrite可以设置是否开启重写，这种方式会在每次fsync时都重写，影响服务器性以，因此默认值为no，不推荐使用。



客户端向服务器发送bgrewriteaof命令，也可以让服务器进行AOF重写。



AOF重写方式也是异步操作，即如果要写入aof文件，则Redis主进程会forks一个子进程来处理



重写aof文件的好处

- 压缩 aof 文件，减少磁盘占用量。
- 将 aof 的命令压缩为最小命令集，加快了数据恢复的速度。





重启 redis 自动生成 appendonly.aof

会发现在启动目录下存在这两个文件：

- appendonly.aof
- redis-check-aof

当 aof 文件出错时，可以利用后者去校验恢复数据

```bash
# 如果 appendonly.aof 出错，那么就无法启动 Redis
# 利用 redis-check-aof 修复 appendonly.aof
redis-check-aof --fix appendonly.aof
```



> 优缺点

优点：

1. 每一次修改都同步，很好的保证了数据的完整性
2. 每秒同步一次，可能会丢失一秒的数据
3. 从不同步时，效率最高
4. AOF 只是追加日志文件，因此对服务器性能影响较小，速度比RDB要快，消耗的内存较少。



缺点：

1. 相对于数据文件的大小，aof 远远大于 rdb，修复的速度比 rdb 慢
2. aof 运行效率比 rdb 慢，所以 redis 默认配置是 rdb



如果 aof 文件大于 64MB，就会 forks 一个新的进程，将文件进行重写



### 3、总结

在主从复制中，rdb 就是备用的，放在从机上面，aof 几乎不使用



|    方式    |   RDB    |    AOF     |
| :--------: | :------: | :--------: |
| 启动优先级 |    低    |     高     |
|    体积    |    小    |     大     |
|  恢复速度  |    快    |     慢     |
| 数据安全性 | 会丢数据 | 由策略决定 |
|    轻重    |    重    |     轻     |

当RDB与AOF两种方式都开启时，Redis会优先使用AOF日志来恢复数据，因为AOF保存的文件比RDB文件更完整。



> 扩展

1. RDB 持久化方式是在指定时间间隔内对数据进行快照存储
2. AOF 持久化记录每次对数据库写的操作，当服务器重启的时候来重新执行这些命令恢复原始数据，AOF 命令以 Redis 协议追加保存每次写的操作到文件末尾，Redis 还能对 AOF 文件进行后台重写，使得 AOF 文件的体积不至于过大
3. **只做缓存，可以不使用任何持久化**
4. 同时开启两种持久化：
   - 这种情况下，Redis 重启优先载入 AOF 文件恢复数据，因为通常情况下 AOF 文件保存的数据要比 RDB 更加完整
   - RDB 保存数据不实时，同时使用两者时服务器重启也只会找 AOF 文件，那么要不要使用 AOF 呢？建议不要，因为 RDB 更适合用于备份数据库（AOF 在不断变化不好备份），快速重启，而且不会有 AOF 潜在的 bug
5. 性能建议
   - RDB 文件只做备份，建议只在 Slave 上持久化 RDB 文件，而且只要 15 分钟备份一次就好了，只保留 `save 900 1` 这条规则
   - 如果 Enable AOF，好处在于最恶劣情况下也只会丢失不超过 2 秒的数据，启动脚本只需要 load 自己的 AOF 文件就可以了，代价：一是带来了持续的 IO，二是 AOF rewrite 的最后将 rewrite 过程中产生的新数据写到新文件造成的阻塞几乎是不可避免的。只要硬盘许可，应该尽量减少 AOF rewrite 的频率，AOF 重写的基础大小默认值 64M 太小了，可以设到 5G 以上，默认超过原大小 100% 大小重写可以改到适当的数值
   - 如果不 Enable AOF，仅靠 Master-Slave Replication 实现高可用性也可以，能省掉一大笔 IO，也减少了 rewrite 时带来的系统波动。代价是如果 Master/Slave 同时宕机（最恶劣情况：断电），会丢失十几分钟的数据，启动脚本也需要比较两个 Maseter/Slave 中的 RDB 文件，载入较新的那个，微博就是这种架构



## 十、Redis 发布订阅

Redsi 发布订阅（pub/sub）是一种**消息通信模式**：发送者（pub）发送消息，订阅者（sub）接收消息。

Redis 客户端可以订阅任意数量的频道。



### 1、简单模型

![](https://naivekyo.oss-cn-hangzhou.aliyuncs.com/blog%27image/redis-pub-sub.png)

重点：

- 消息发送者
- 频道
- 消息订阅者



### 2、相关命令

> 命令

这些命令被广泛用于构建即时通信应用，比如网络聊天室（chatroom）和实时广播、实时提醒

- psubscribe pattern [pattern...]   
  - 订阅一个或多个符合给定模式的频道
- pubsub subcommand [argument [argument ...]]
  - 查看订阅与发布系统状态
- publish channel message
  - 将消息发送到指定的频道
- punsubscribe [pattern [pattern ...]]
  - 退订所有给定模式的频道
- subscribe channle [channel ...]
  - 订阅给定的一个或多个频道的信息
- ubsubscribe [channel [channel ...]]
  - 退订给定的频道



### 3、测试

```bash
# 订阅一个频道
127.0.0.1:6379> PSUBSCRIBE naivekyichannel
Reading messages... (press Ctrl-C to quit)
1) "psubscribe"
2) "naivekyichannel"
3) (integer) 1

# 消息发送者发布消息
127.0.0.1:6379> PUBLISH naivekyichannel "hello naivekyo"
(integer) 1
127.0.0.1:6379> PUBLISH naivekyichannel "hello redis"
(integer) 1

# 频道将消息发布给所有订阅者
Reading messages... (press Ctrl-C to quit)
1) "pmessage"
2) "naivekyichannel"
3) "naivekyichannel"
4) "hello naivekyo"
1) "pmessage"
2) "naivekyichannel"
3) "naivekyichannel"
4) "hello redis"
```



### 4、原理

Redis 是用 C 编写的，可以分析源码（pubsub.c），了解发布和订阅机制的底层实现，加深对 Redis 的理解

Redis 通过 PUBLISH、SUBSCRIBE 和 PSUBSCRIBE 等命令实现发布和订阅功能



通过 SUBSCRIBE 命令订阅某个频道后，redis-server 里维护了一个字典，字典的键就是一个个 channel，而字典的值则是一个个链表，链表中保存了所有订阅这个 channel 的客户端。SUBSCRIBE 命令的关键，就是将客户端添加到给定 channel 的订阅链表中。



通过 PUBLIC 命令向订阅者发送消息，redis-server 会使用给定的频道作为键，在它所维护的 channel 字典中查找记录了订阅这个频道的所有客户端的链表，遍历这个链表，将消息发布给所有订阅者。



Pub/Sub 从字面上理解就是发布（Publish）与订阅（Subscribe），在 Redis 中，你可以设定一个 key 值进行消息发布及消息订阅，当一个 key 值上进行了消息发布后，所有订阅它的客户端都会收到相应的消息。这一功能最明显的用法就是用作实时消息系统，比如普通的及时聊天，群聊等功能。



使用场景：

1. 实时消息系统
2. 实时聊天（频道当作聊天室， 将信息回显给所有人）
3. 订阅、关注系统



复杂的场景：会使用 消息中间件（MQ，Kafka）



## 十一、Redis 主从复制

服务器高可用：主从复制、哨兵模式



### 1、概念

主从复制，指将一台 Redis 服务器的数据，复制到其他的 Redis 服务器上。前者称为 主节点（master/leader），后者称为从节点（slave/follower）；**数据的复制是单向的**。Master 以写为主，Slave 以读为主。



**默认情况下，每台 Redis 服务器都是主节点**；

且一个主节点可以有多个从节点（或没有从节点），但一个从节点只能有一个主节点。



主从复制的作用主要包括：

1. **数据冗余**：主从复制实现了数据的热备份，是持久化之外的一种数据备份方式
2. **故障恢复**：当主节点出现问题时，可以由从节点提供服务，实现快速的故障恢复；实际上是一种服务的冗余
3. **负载均衡**：在主从复制的基础上，配合读写分离，可以由主节点提供写服务，由从节点提供读服务（即写 Redis 数据时应该连接主节点，读 Redis 数据时应该连接从节点），分担服务器负载；尤其是在写少读多的场景下，通过多个从节点分担读负载，可以大大提高 Redis 服务器的并发量。
4. **高可用（集群）基石**：除了上述作用外，主从复制还是哨兵和集群能够实施的基础，因此说主从复制是 Redis 高可用的基础



一般来说，要将 Redis 用于工程项目中，只是用一台 Redis 是万万不能的（可能会宕机，一般配三台），原因如下：

1. 从结构上，单个 Redis 服务器会发生单点故障，并且一台服务器需要处理所有的请求负载，压力过大。
2. 从容量上，单个 Redis 服务器内存容量有限，就算一台 Redis 服务器内存容量为 256G，也不能将所有内存用作 Redis 存储内存，一般来说，单台 Redis 最大使用内存不应该超过 20G



电商网站上的商品，一般都是一次存储，无数次浏览的，说专业点就是 ”多读少写“

对于这样的场景，我们使用如下架构：

![](https://naivekyo.oss-cn-hangzhou.aliyuncs.com/blog%27image/write%26read.png)



主从复制、读写分离 解决大量读操作的场景，减缓服务器压力，架构中经常使用。一般：**一主二从**（后续哨兵模式会选举，所以最低需要三台）



### 2、环境配置

只配置从库，不用配置主库！（Redis 默认启动就是主库）

因为现在只有一台服务器，所以要配置的是单机多集群

```bash
# 查看当前库的信息
127.0.0.1:6379> info replication
# Replication
role:master               # 角色为主机
connected_slaves:0				# 没有附属从机
master_failover_state:no-failover
master_replid:e53a0801b50a28ab552c9e8575b8ead398c0a650
master_replid2:0000000000000000000000000000000000000000
master_repl_offset:0
second_repl_offset:-1
repl_backlog_active:0
repl_backlog_size:1048576
repl_backlog_first_byte_offset:0
repl_backlog_histlen:0
```



准备工作：

- 一台服务器开四个连接 session

- 一主二从 + 一个测试

- 配置文件需要准备四个

- 先关闭 Redis 服务

- 修改配置文件（因为在一台服务器上开多个 Redis 进程，所以需要修改诸多配置）

  - 端口
  - pid 文件
  - 生成日志的文件名 
  - dump 的文件名

  

### 3、启动服务

分别开启 一主二从 及测试 Redis 服务

```bash
[root@naivekyo bin]# ps aux | grep redis
root     31183  0.1  0.5 162508  9956 ?        Rsl  14:29   0:00 redis-server *:6379
root     31238  0.0  0.5 162504  9884 ?        Rsl  14:29   0:00 redis-server *:6380
root     31280  0.0  0.5 162504  9884 ?        Rsl  14:30   0:00 redis-server *:6381
root     31314  0.0  0.5 162504  9872 ?        Ssl  14:30   0:00 redis-server *:6382
root     31326  0.0  0.0 112812   964 pts/3    R+   14:30   0:00 grep --color=auto redis
```



### 4、一主二从

**默认情况下，每一台 Redis 服务器都是主节点**；

一般情况下，只需要配置从机就可以了。

- 主要方法是为从机指定要给 主机

- 例如我们现在测试用的 一主（6379）二从（6380、6381）

  ```bash
  # 主机不用管
  
  # 从机使用
  slaveof host port # 指定主机为 host.port 的 Redis 进程
  
  # 主机检测状态
  127.0.0.1:6379> info replication
  # Replication
  role:master
  connected_slaves:2
  slave0:ip=127.0.0.1,port=6380,state=online,offset=84,lag=0
  slave1:ip=127.0.0.1,port=6381,state=online,offset=84,lag=0
  master_failover_state:no-failover
  master_replid:76474c9a04098ec797bb5fe681943e15f0923f5d
  master_replid2:0000000000000000000000000000000000000000
  master_repl_offset:84
  second_repl_offset:-1
  repl_backlog_active:1
  repl_backlog_size:1048576
  repl_backlog_first_byte_offset:1
  repl_backlog_histlen:84
  ```

- 如果出现 master 机 使用 info replication 显示连接状态为 down，可能是因为设置了 **requirepassword** 但是没有设置 **masterauth**，为了方便，建议两个密码设置一样



真实的主从配置应该在配置文件中配置，这样才是永久的，如果使用命令配置就是暂时的。

### 5、配置文件

```bash
# 配置主机 ip
replicaof <masterip> <masterport>
# 。。。。。。。。
```





> 细节

**主机可以写，从机不能写只能读**

主机中所有信息和数据都会自动被从机保存



- 在没有配置哨兵的情况下，如果主机宕机了，从机就找不到主机了，但是它依旧保留着主机的信息，如果主机恢复了，从机依旧可以获取到主机写入的数据。
- 而当从机宕机了，主机依旧在写入数据，当从机恢复上线后，依旧会获取到主机这段时间写入的数据



### 6、复制原理

Slave 启动成功连接到 master 后会发送一个 sync 同步命令

Master 接收到命令，会启动后台的存盘进程，同时收集所有接收到的用于修改数据集的命令，master 将传送这个文件给 slave，并完成一次完全同步。

- 全量复制：slave 服务接收到数据库文件数据后，将其存盘并加载到内存中
- 增量复制：master 继续将新的所有收集到的修改命令依次传给 slave，完成同步

但是只要是重新连接到 master，一次完全同步（全量复制）就会被自动执行。



考虑这种情况：

- 原有模式  S - M - S
- 改变模式 M - S M - S

- 后一种情况，将从机设置为主机，但是查看信息它依旧是 从机，所以它还是只能读不能写，这时候情况发生了变化，主机写入的信息被从机读取，从机作为另一台从机的主机，又会将数据传递给另一台从机

这**一种模型**：

- 可以完成主从复制
- 当真正的 Master 宕机后，同时兼具 Master 和 Salve 身份的从机可以使用命令 `SLAVEOF no one`，将自己的身份变为 master，这样它的下面还是有从机的，如果真正的主机恢复上线了，就没有从机了，除非再次使用命令配置



**SLAVEOF no one** 适合任何模型



### 7、**哨兵模式**（自动选举）

当主机宕机后，从机中自动选举出新的主机

> 概述

主从切换技术的方法是：当主服务器宕机后，需要手动把一台从服务器切换为主服务器，这就需要人工干预，费事费力，还会造成一段时间服务不可用。这不是一种推荐的方式，更多时候，推荐优先使用哨兵模式。

Redis 从 2.8 开始正式提供了 Sentinel（哨兵）架构来解决这个问题。



能够在后台监控主机是否故障，如果故障了就**根据投票数自动将从库转换为主库。**



哨兵模式是一种特殊的模式，首先 Redis 提供了哨兵的命令，哨兵是一个独立的进程，作为进程，他会独立运行。其原理是 **哨兵通过发送命令，等待 Redis 服务器响应，从而监控运行的多个 Redis 实例**



![](https://naivekyo.oss-cn-hangzhou.aliyuncs.com/blog%27image/Sentinel.png)

这里的哨兵有两个作用：

- 通过发送命令，让 Redis 服务器返回监控其运行状态，包括主服务器和从服务器
- 当哨兵检测到 master 宕机，会自动将 slave 切换为 master，然后通过 **发布订阅模式** 通知其他的从服务器，修改配置文件，让它们切换主机



然后一个哨兵进程对 Redis 服务器进行监控，可能会出现问题，为此，我们可以使用多个哨兵进行监控。各个哨兵之间还会进行监控，这样就形成了**多哨兵模式**。

### 8、多哨兵模式

哨兵除了监控各个 Redis 服务器，各个哨兵之间也进行相互监控。



假设主服务器宕机，哨兵 1 先检测到这个结果，系统并不会马上进行 failover 过程，仅仅是 哨兵1 主观的认为主服务器不可用，这个现象称为 **主观下线**。当后面的哨兵也检测到主服务器不可用，并且数量达到一定值时，那么哨兵之间就会进行一次投票，投票的结果由一个哨兵（随机）发起，进行 failover[故障转移] 操作。切换成功后，就会通过发布订阅模式，让各个哨兵把自己监控的从服务器实现切换主机，这个过程称为 **客观下线**。



> 测试

目前的状态是一主二从。



**修改哨兵配置文件：**

```bash
# 指定监控对象
# sentinel monitor <master-name> <ip> <redis-port> <quorum>
sentinel monitor myredis 127.0.0.1 6379 1 # 数字 1，代表只有当 1 个以上的哨兵认为主机出现了故障，那么就可以判定主机客观下线，开始从从机中选举主机

sentinel down-after-milliseconds mymaster 60000
sentinel failover-timeout mymaster 180000
sentinel parallel-syncs mymaster 1

sentinel monitor resque 192.168.1.3 6380 4
sentinel down-after-milliseconds resque 10000
sentinel failover-timeout resque 180000
sentinel parallel-syncs resque 5
```

启动哨兵：

```bash
redis-sentinel ../etc/sentinel.conf
```



如果 Master 节点断开了，Sentinel 会根据投票算法选出新的主机

而主机如果恢复上线，它会成为新的主机的从机



### 9、哨兵模式优点和缺点

优点：

1. 哨兵集群，基于主从复制模式，所有主从配置优点，它都有
2. 主从可以切换，故障可以转移，系统的可用性会更好
3. 哨兵模式就是主从模式的升级，更加健壮



缺点：

1. Redis 不好在线扩容，集群容量一旦达到上线，在线扩容就非常麻烦
2. 实现哨兵模式的配置其实是非常麻烦的，里面有很多选择



> 哨兵模式的配置文件



```bash
# 哨兵实例运行端口，默认 26379
port 26379

# 哨兵 sentinel 的工作目录
dir /tmp

# 哨兵 sentinel 监控的 redis 主节点 
# quorum 配置多少个 sentinel 哨兵同一认为 master 主节点失联，那么这时就客观认为主节点失联了
# sentinel mointer <master-name> <ip> <redis-port> <quorum>
sentinel monitor mymaster 127.0.0.1 6379 2

# 当在 Redis 实例中开启了 requirepass foobared 授权密码，这样所有连接 Redis 实例的客户端都要提供密码
# 设置哨兵 sentinel 连接主从的密码，注意必须为主从设置一样的密码
# sentinel auth-pass <master-name> <password>
sentinel auth-pass mymaster 123456

# 指定多少毫秒之后，主节点没有应答哨兵 sentinel，此时，哨兵主观认为主节点下线，默认 30 秒
# sentinel down-after-milliseconds <master-name> <milliseconds>
sentinel down-after-milliseconds 30000

# 这个配置项指定了在发生 failover 主备切换时最多可以有多少个 slave 同时对新的 master 进行同步
# 这个数字越小，完成 failover 所需的时间最长
# 但是这个数字越大，意味着越多的 slave 因为 replication 而不可用
# 可以通过将这个值设置为 1 来保证每次只有一个 slave 处于不能处理命令请求的状态
# sentinel parallel-syncs <master-name> <numslaves>
sentinel parallel-syncs mymaster 1

# 故障转移的超时时间 failover-timeout 可以用在以下方面
# 1. 同一个 sentinel 对同一个 master 两次 failover 之间的时间间隔
# 2. 当一个 slave 从一个错误的 master 那里同步数据开始计算时间。直到 slave 被纠正为向正确的 master 那里同步数据时。
# 3. 当想要取消一个正在进行的 failover 所需要的时间
# 4. 当进行 failover 时，配置所有 slaves 指向新的 master 所需的最大时间。不过，即使查过了这个时间，slaves 依然会被正确配置为指向 master，但是就不按 parallel-syncs 所配置的规则来了
# 默认三分钟
# sentinel failover-timeout <master-name> <milliseconds>
sentinel failover-timeout mymaster 180000

# SCRIPTS EXECUTIOn

# 配置当某一事件发生时所需要指向的脚本，可以通过脚本来通知管理员，例如当系统运行不正常时可以发邮件通知相关人员
# 对于脚本的执行结果有以下预测
# 若脚本执行后返回 1，那么该脚本稍后将会被再次执行，重复次数目前默认为 0
# 若脚本执行后返回 2，或者比 2 更高的一个返回值，脚本将不会重复执行
# 如果脚本在执行过程中由于收到系统中断信号被终止了，则同返回值 1 时的行为相同
# 一个脚本的最大执行时间为 60s，如果超过这个时间，脚本将会被一个 SIGKILL 信号终止，之后重新执行

# 通知型脚本：当 sentinel 有任何警告级别的时间发生时（比如说 redis 实例的主观失效和客观失效等等），将会去调用这个脚本，这时一个脚本应该通过邮件，SMS 等方式通知系统管理员关于系统不正常运行的信息，调用该脚本时，传给脚本两个参数，一个是事件的类型，一个是事件的描述。如果 sentinel.conf 配置文件配置了这个脚本路径，那么必须保证这个脚本存在于这个路径中，并且是可执行的，否则 sentinel 无法正常启动
# 通知脚本
# sentinel notification-script <master-name> <script-path>
sentinel notification-script mymaster /var/redis/notify.sh

# 客户端重新配置主节点参数脚本
# 当一个 master 由于 failover 而发生改变时，这个脚本将会调用，通知相关的客户端关于 master 地址已经发生改变的信息
# 以下参数将会在调用脚本时传给脚本：
# <master-name> <role> <state> <from-ip> <from-port> <to-ip> <to-port>
# 目前 <state> 总是 "failover"
# <role> 是 "leader" 或者 "observer" 中的一个
# 参数 from-ip from-port to-ip to-port 是用来和旧的 master 和 新的 master(及旧的 slave) 通信的
# 这个脚本应该是通用的，能够被多次调用，不是针对性的
# sentinel client-reconfig-script <master-name> <script-path>
sentinel client-reconfig-script mymaster /var/redis/reconfig.sh
```



## 十二、Redis **缓存穿透和雪崩**（面试高频，工作常用）

服务的高可用问题



Redis 缓存的使用，极大提升了应用程序的性能和效率，特别是数据查询方面，但同时，它也带来了一些问题，其中，最要害的问题，就是数据的一致性问题，从严格意义上讲，这个问题无解，如果对数据的一致性要求很高，那么就不要使用缓存。



另外一些典型的问题就是：缓存穿透、缓存雪崩和缓存击穿。目前，业界也有比较流行的解决方案。



### 1、缓存穿透

> 概念

缓存穿透的概念比较简单，用户想要查询一个数据，发现 redis 内存数据库没有，也就是缓存没有命中，于是向持久层数据库查询，发现也没有，于是本次查询失败。当用户很多的时候，缓存都没有命中（比如说：秒杀场景），于是都去请求持久层数据库。这会给持久层数据库造成很大的压力，这时候就相当于出现了缓存穿透。



流程：

- 先到 Redis 查询数据：没有查到
- 再去 持久层数据库中查询：也没有查到
- 最终返回结果：没有查询到
- 可能用户会反复请求查询，结果每次都查不到，这就对数据库造成了很大的压力
- **缓存穿透**



> 解决方案

**布隆过滤器**

布隆过滤器是一种数据结构，对所有可能查询的参数以 hash 形式存储，在控制层先进行校验，不符合就丢弃，从而避免了对底层存储系统的查询压力：

![](https://naivekyo.oss-cn-hangzhou.aliyuncs.com/blog%27image/bloomFilter.png)

**缓存空对象**

当存储层不命中后，即使返回的空对象也将其缓存起来，同时会设置一个过期时间，之后再访问这个数据库将会直接从缓存中获取，保护了后端数据源；



但是这个方法会存在两个问题：

1. 如果空值能够被缓存起来，这就意味着缓存需要更多的空间存储更多的键，因为这当中可能会有很多的空指的键
2. 即使对空值设置了过期时间，还是会存在缓存层和存储层的数据会有一段时间窗口的不一致（如果这个值存储层有了，但是缓存层还是存的空值），这对于需要保持一致性的业务会有影响



### 2、缓存击穿

微博热点

> 概述

注意和缓存击穿的区别，缓存击穿，是指一个 key 非常热门，客户端不停的请求这个 key，并发量非常高，大并发集中对这个点进行访问，当这个 key 在失效的瞬间，持续的大并发就穿破缓存，直接请求数据库，就像在一个屏障上凿开了一个洞。



当某个 key 在过期的瞬间，有大量的请求并发访问，这类数据一般都是热点数据，由于缓存过期，会同时访问数据库来查询最新的数据，并且回写缓存，会导致数据库瞬间压力过大



> 解决方法

**设置热点数据永不过期**

从缓存层来看，没有设置过期时间，所以不会出现热点 key 过期后产生的问题



**加互斥锁**

分布式锁：可以使用分布式锁，保证对每个 key 同时只有一个线程去查询后台服务，其他线程没有获得分布式锁的权限，因此只需等待即可。这种方式讲高并发的压力转移到了分布式锁，因此对分布式锁的考验很大。



### 3、缓存雪崩

> 概念

缓存雪崩，是指在某一个时间段，缓存集中过期失效。Redis 宕机





产生雪崩的原因之一，比如说双十一 11 点的时候将一批商品的信息写入缓存，设置过期时间为 1 小时，到了 12 点正好过期，这时候大量对这批商品信息的查询访问请求都落到了数据库头上，对于数据库而言，会产生周期性的压力波峰。于是所有请求都会到达存储层，存储层的调用量会暴增，造成存储层也会挂掉的情况。



其中过期，并不是非常致命，比较致命的缓存雪崩，是缓存服务器某个节点宕机或断网。因为自然形成的缓存雪崩，一定是在某个时间段集中创建缓存，这个时候，数据库也是可以顶住压力的。无非是对数据库产生周期性的压力而已。而缓存服务器节点的宕机，对数据库服务器造成的压力是不可预知的，很有可能瞬间把数据库压垮。



例子：双十一时，淘宝可以停掉一部分服务，保证主要服务可用

> 解决方案

**Redis 高可能**

这个思想的含义是，既然 redis 有可能挂掉，那我多设置几台 Redis，一台挂掉后其他的还可以继续工作，其实就是采用 Redis 集群。（异地多活）



**限流降级**

这个解决方案的思路是：在缓存失效后，通过加锁或者队列来控制读数据库写缓存的线程数量。比如对某个 key 只允许一个线程查询数据和写缓存，其他线程等待。



**数据预热**

数据加热的含义就是在正式部署之前，我先把可能的数据先预先访问一遍，这样部分可能大量访问的数据就会加载到缓存中。在即将发生大并发访问前手动触发加载缓存不同的 key，设置不同的过期时间，让缓存失效的时间点尽量均匀。
