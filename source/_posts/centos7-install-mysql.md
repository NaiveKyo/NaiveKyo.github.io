---
title: centos7-install-mysql
date: 2021-07-06 17:23:33
author: NaiveKyo
top: true
hide: false
cover: true
toc: true
summary: CentOS7 安装 MySQL
categories: Linux
keywords: Linux MySQL8
tags:
  - Linux
  - MySQL
---



## 一、官方推荐

官方文档：https://dev.mysql.com/doc/mysql-installation-excerpt/5.6/en/linux-installation-yum-repo.html	

根据官网推荐安装 `yum 仓库`



注意自己的 Linux 版本，例如我用的 CentOS7 7.x 可以下载对应的 Oracle Linux 7 版本的 yum 仓库配置

下载地址：https://dev.mysql.com/downloads/repo/yum/



然后输入以下命令更新自己的本地 yum 仓库列表：

```bash
sudo yum localinstall mysql57-community-release-el7-{version-number}.noarch.rpm
```



可以输入以下命令检查是否成功更新本地 yum 仓库：

```bash
yum repolist enabled | grep "mysql.*-community.*"
```

更新成功后可以直接安装，官方下载的 yum 仓库配置，默认开启当前 GA 版本的支持，如果想更换版本可以这样：

```bash
# 先查看哪些版本被启用
shell> yum repolist all | grep mysql

# 然后可以更换版本, 这里假如当前GA版本为 5.7，想要更换为 5.6 
shell> sudo yum-config-manager --disable mysql57-community
shell> sudo yum-config-manager --enable mysql56-community

# 一般都不用更换版本
```



除了使用命令更改，还可以直接找到相关文件进行修改：

 `/etc/yum.repos.d/mysql-community.repo` 

如果是 EL8 版本的内核，还需要考虑其他情况，具体参见官方文档



## 二、默认安装（推荐）

安装命令：

两种方式，可以安装到默认的位置，也可以自定义（不推荐，比较麻烦）

```bash
# 默认
sudo yum -y install mysql-community-server

# 自定义
sudo yum -c /etc/yum --releasever=/ --installroot=/usr/local/mysql-8.0 -y install mysql-community-server

# 参数
# -c 是读取 yum 的配置文件路径
# --releasever=/
#	  我们可以在 yum 配置源的文件中找到很多这样的字符 $releasever 和 $basearch
#		$releasever 代表当前系统的发行版本，可以通过 rpm -qi centos-release
#		$basearch 是我们的系统硬件架构（CPU 指令集），可以使用命令 arch 得到
```



yum 虽然很好的解决了 软件依赖 的问题，但是不能查看软件的位置，我们可以使用 rpm 来查看相关信息

```bash
# 查看软件包安装的目录和文件（包括了可执行程序、配置文件和帮助文档）。
rpm -ql mysql-community-server

# 查看已安装软件包的详细信息。 和 yum info 有点类似
rpm -qi mysql-community-server

# 查看已安装软件包的配置
rpm -qc mysql-community-server 
```

可以看到默认安装后，mysql 的相关文件的位置是严格遵守 Linux 目录的 `FHS`。



### 1、开启 MySQL 服务

这里要提一下：

MySQL 官方推荐创建 mysql 用户和用户组来管理 mysql 服务。

我们采用的 yum 方式安装 mysql-community-server ，已经默认给我们创建好了对应的系统账户和组，所以可以不用管这一步。

使用 `cat /etc/passwd | grep mysql` 可以看到 mysql 系统账户



```bash
# 创建组
groupadd mysql
# 创建用户
useradd -r -g mysql -s /bin/false mysql
# 注意，我们只需要创建一个账户用于管理 mysql 服务，所以可以这样做
# -r 创建系统账户，不会给它生成家目录
# -g 属于 mysql 组
# -s 指定该系统账户持有的 shell 为 /bin/false
#    
# 最后还需要给相应的mysql文件设置权限：chmod 750 mysql-files
```



现在可以开启服务了：

分为两种情况：

- 初始化随机密码

  ```bash
  # 默认安装，环境变量已经配置好了
  mysqld --initialize --user=mysql
  
  # 使用 systemctl 开启服务
  systemctl start mysqld
  
  # 查看初始化后随机生成的密码
  tail /var/log/mysqld.log | grep temporary
  # 可以看到
  [Note] [MY-010454] [Server] A temporary password is generated for root@localhost: <6za-KXb&j#p
  # 后面就是密码
  
  # 登录数据库并修改密码
  mysql -u root -p
  enter password: （注：这里输入密码不显示，输入刚刚的随机密码就好了）
  
  # 登录成功后修改密码才能执行下一步操作, 这里我设置密码为 123456
  ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';
  ```

- 不生成密码

  ```bash
  # 如果想不生成随机密码，可以使用如下命令初始化数据目录
  mysqld --initialize-insecure --user=mysql
  
  # 开启服务后，登录时使用
  mysql -u root --skip-password
  
  # 然后修改密码
  ALTER USER 'root'@'localhost' IDENTIFIED BY 'root-password';
  ```



### 2、修改 MySQL 配置文件

默认安装一般 MySQL 服务启动时加载的配置参数在 `/etc/my.cnf` 文件中，我们可以修改其中的配置：

下面列举最简单的一种情况，以方便我们在 Windows 中使用工具远程连接服务器数据库：

```ini
[client]
port=3306
socket=/tmp/mysql.sock

[mysqld]
port=3306
socket=/tmp/mysql.sock
key_buffer_size=16M
max_allowed_packet=128M

[mysqldump]
quick
```

因为我们要使用 root 账户连接，所以需要了解一下 MySQL 中账户访问的相关知识：



- mysql 中账户名由两部分组成 'user_name'@'host_name'

- 在 MySQL 中，不仅要指定谁可以连接，还要指定可以从什么地方进行连接，这意味着，可以有拥有相同名字、但会从不同位置连接服务器的两个用户

  进入 MySQL 命令行：

  ```bash
  use mysql;
  select user, host from user;
  
  # 可以看到 root 的 host 是 localhost
  # 这意味着 root 用户只能从本机访问 mysql 服务
  # 我们现在想在远程访问就需要做一些修改
  # 为了方便，我这里直接将 访问地址 改为通配符 % ，允许任何地方连接
  # 如果是实际的服务器，可能会带来风险，请视实际情况而定
  update user set host='%' where user='root';
  # 刷新权限
  flush privileges;
  ```

  

### 3、开放端口和服务

由于 centos 7 拥有防火墙，如果我们想要远程访问 MySQL 服务，就需要开放相应的端口和服务：

```bash
# 最简单的情况，关闭防火墙，并禁用它
systemctl stop firewalld
systemctl disable firewalld

# 安全的情况
# 我们在 my.cnf 中指定了MySQL使用的端口
# 开发端口
firewall-cmd --zone=public --add-port=3306/tcp --permanent
# 开放服务
firewall-cmd --zone=public --add-service=mysql --permanent

# 重新加载
firewall-cmd --reload

# 查看结果
firewall-cmd --list-port
firewall-cmd --list-service
```



### 4、测试远程连接

自己使用工具进行远程连接测试



## 三、自定义安装

### 1、命令

```bash
sudo yum -c /etc/yum --releasever=/ --installroot=/usr/local/mysql_8.0 -y install mysql-community-server
```

我在这里安装到 `/usr/local/mysql_8.0` 下面，查看目录后可以发现，在该目录下的所有目录和根路径下面的一样，下面列举出常用目录：

- 可以发现 `mysql_8.0/bin/mysql` 和 `mysql_8.0/usr/bin/mysql`，以及 `mysql_8.0/sbin/mysqld` 和 `mysql_8.0/usr/sbin/mysqld`，都是 **硬链接** 的关系
- 一些常用的命令现在感觉有些冗余，可见虽然使用了 安装路径 后便于管理，但是使用起来感觉不太方便，所以还是推荐默认安装
- 而且现在还需要配置环境变量



### 2、配置环境变量

设置 mysql **系统环境变量**

Linux 推荐我们在 `/etc/profile.d/` 目录下通过编写 mysql.sh 来配置其环境变量，因为 Linux 启动后会读取  `/etc/profile`  文件，然后根据其中的内容又会调用 `/etc/profile.d/` 目录下的脚本文件，但是又要花时间学习 shell 编写脚本。为了方便还是直接在 `/etc/profile` 中编写环境变量。



```bash
# 如果 /etc/profile 不可以编写，先更改权限 chmod u+w /etc/profile
# 最后一行加上
export PATH=$PATH:/usr/local/mysql_8.0/bin:/usr/local/mysql_8.0/sbin
# 使其生效
source /etc/profile
```



### 3、关于配置文件

Linux 中的 MySQL 配置文件的名称为 `my.cnf`，采用自定义安装，可以在 `/etc/my.cnf` 和 `/usr/local/mysql_8.0/etc/my.cnf` 找到，我们只需关注 mysql 安装路径下的配置文件就好了。

感兴趣可以到官网看看：https://dev.mysql.com/doc/refman/8.0/en/server-configuration-defaults.html



### 4、自定义路径的坑

可能会遇到这个错误：

`Cannot find a valid baseurl for repo: base/$releasever/x86_64`

- **这里是由于我指定了安装路径但是没有指定内核版本导致的问题，加上 --releasever=/ 就好了，当然了解一下怎么换源也不错**
- **在虚拟机中测试的时候，由于我设置静态 ip 的时候配置 dns 没有正确配置，也报了这个错，正确配置应该是这样的 ** `DNS1=114.114.114.114`，第二个 DNS2 可加可不加，记住要加 DNS1， OvO



现在尝试配置其他源：

```bash
# 可以先查看默认的源
cat /etc/yum.repos.d/CentOS-Base.repo 
```

```bash
[base]
name=CentOS-$releasever - Base
mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=os&infra=$infra
#baseurl=http://mirror.centos.org/centos/$releasever/os/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7

#released updates 
[updates]
name=CentOS-$releasever - Updates
mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=updates&infra=$infra
#baseurl=http://mirror.centos.org/centos/$releasever/updates/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7

#additional packages that may be useful
[extras]
name=CentOS-$releasever - Extras
mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=extras&infra=$infra
#baseurl=http://mirror.centos.org/centos/$releasever/extras/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7

#additional packages that extend functionality of existing packages
[centosplus]
name=CentOS-$releasever - Plus
mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=centosplus&infra=$infra
#baseurl=http://mirror.centos.org/centos/$releasever/centosplus/$basearch/
gpgcheck=1
enabled=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7
```

简单分析以下每个源（源都以 [] 括住）中主要的配置信息：以 [base] 为例

- [base] 源
- name：说明当前软件源的意义，不重要
- mirrorlist：列出这个软件源可以使用的镜像站，如果不想使用，可以注释掉
- **baseurl**：这个最重要，后面接的是这个软件源的实际地址，mirrorlist 是 YUM 程序自动识别镜像站，baseurl 则是指定固定的软件源网址
- enable=1：让该软件源被启用，不想启用就设置为 0
- gpgcheck=1：指定要查看 RPM 的数字签名
- gpgkey=xxx：就是数字签名的公钥文件所在位置，使用默认值即可



例如改为阿里云源：

官网：http://mirrors.aliyun.com/repo/

我们可以下载官方的 yum 源配置，windows 下直接下载文件，或者在 Linux 的图形界面访问官网。

我习惯于使用 命令行 ，所以使用如下命令：

```bash
# 有个插件 fastestmirror 是用于测试当有多个源时选择速度最快的那个，可禁可不禁
# 我们对 yum 的源配置文件做备份就好了
cp /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup

# 获取 阿里云 的 repo，直接覆盖就好了，注意内核版本
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo

# Tip：我没有用这种方法，而是在原来的文件中直接将所有源禁用，设置 enable=0
# 然后再去阿里云对应的 repo 文件中复制所有配置源信息到目标文件中
# 最后启用 阿里云 的源，设置 enable=1
```



然后清除缓存再生成缓存：

```bash
# 清除缓存
yum clean all
rm -rf /var/cache/yum

# 重新生成缓存
yum makecache
```



### 5、自定义安装配置

参考官网：https://dev.mysql.com/doc/refman/8.0/en/data-directory-initialization.html



官方推荐创建 mysql 组 和 用户 来管理 mysql，允许该用户连接数据库服务器，远程安全连接可以使用 `mysql_ssl-rsa_setup` 程序创建默认的 SSL 和 RSA 文件。不过我们是学习就算了



tip：在MySQL 8.0中，默认的身份验证插件已从更改 `mysql_native_password`为 `caching_sha2_password`，并且 默认情况下`'root'@'localhost'`使用管理帐户`caching_sha2_password`。



## 四、配置文件

my.conf 需要慢慢调试找到最优配置：

```ini
[client]    
port = 3306
socket = /tmp/mysql.sock

[mysqld]
user = mysql    --- 表示MySQL的管理用户
port = 3306    --- 端口
socket = /tmp/mysql.sock    -- 启动的sock文件
log-bin = /data/mysql-bin
basedir = /usr/local/mysql
datadir = /data/
pid-file = /data/mysql.pid
user = mysql
bind-address = 0.0.0.0
server-id = 1 #表示是本机的序号为1,一般来讲就是master的意思

skip-name-resolve
# 禁止MySQL对外部连接进行DNS解析，使用这一选项可以消除MySQL进行DNS解析的时间。但需要注意，如果开启该选项，
# 则所有远程主机连接授权都要使用IP地址方式，否则MySQL将无法正常处理连接请求

#skip-networking

back_log = 600
# MySQL能有的连接数量。当主要MySQL线程在一个很短时间内得到非常多的连接请求，这就起作用，
# 然后主线程花些时间(尽管很短)检查连接并且启动一个新线程。back_log值指出在MySQL暂时停止回答新请求之前的短时间内多少个请求可以被存在堆栈中。
# 如果期望在一个短时间内有很多连接，你需要增加它。也就是说，如果MySQL的连接数据达到max_connections时，新来的请求将会被存在堆栈中，
# 以等待某一连接释放资源，该堆栈的数量即back_log，如果等待连接的数量超过back_log，将不被授予连接资源。
# 另外，这值（back_log）限于您的操作系统对到来的TCP/IP连接的侦听队列的大小。
# 你的操作系统在这个队列大小上有它自己的限制（可以检查你的OS文档找出这个变量的最大值），试图设定back_log高于你的操作系统的限制将是无效的。

max_connections = 1000
# MySQL的最大连接数，如果服务器的并发连接请求量比较大，建议调高此值，以增加并行连接数量，当然这建立在机器能支撑的情况下，因为如果连接数越多，介于MySQL会为每个连接提供连接缓冲区，就会开销越多的内存，所以要适当调整该值，不能盲目提高设值。可以过'conn%'通配符查看当前状态的连接数量，以定夺该值的大小。

max_connect_errors = 6000
# 对于同一主机，如果有超出该参数值个数的中断错误连接，则该主机将被禁止连接。如需对该主机进行解禁，执行：FLUSH HOST。

open_files_limit = 65535
# MySQL打开的文件描述符限制，默认最小1024;当open_files_limit没有被配置的时候，比较max_connections*5和ulimit -n的值，哪个大用哪个，
# 当open_file_limit被配置的时候，比较open_files_limit和max_connections*5的值，哪个大用哪个。

table_open_cache = 128
# MySQL每打开一个表，都会读入一些数据到table_open_cache缓存中，当MySQL在这个缓存中找不到相应信息时，才会去磁盘上读取。默认值64
# 假定系统有200个并发连接，则需将此参数设置为200*N(N为每个连接所需的文件描述符数目)；
# 当把table_open_cache设置为很大时，如果系统处理不了那么多文件描述符，那么就会出现客户端失效，连接不上

max_allowed_packet = 4M
# 接受的数据包大小；增加该变量的值十分安全，这是因为仅当需要时才会分配额外内存。例如，仅当你发出长查询或MySQLd必须返回大的结果行时MySQLd才会分配更多内存。
# 该变量之所以取较小默认值是一种预防措施，以捕获客户端和服务器之间的错误信息包，并确保不会因偶然使用大的信息包而导致内存溢出。

binlog_cache_size = 1M
# 一个事务，在没有提交的时候，产生的日志，记录到Cache中；等到事务提交需要提交的时候，则把日志持久化到磁盘。默认binlog_cache_size大小32K

max_heap_table_size = 8M
# 定义了用户可以创建的内存表(memory table)的大小。这个值用来计算内存表的最大行数值。这个变量支持动态改变

tmp_table_size = 16M
# MySQL的heap（堆积）表缓冲大小。所有联合在一个DML指令内完成，并且大多数联合甚至可以不用临时表即可以完成。
# 大多数临时表是基于内存的(HEAP)表。具有大的记录长度的临时表 (所有列的长度的和)或包含BLOB列的表存储在硬盘上。
# 如果某个内部heap（堆积）表大小超过tmp_table_size，MySQL可以根据需要自动将内存中的heap表改为基于硬盘的MyISAM表。还可以通过设置tmp_table_size选项来增加临时表的大小。也就是说，如果调高该值，MySQL同时将增加heap表的大小，可达到提高联接查询速度的效果

read_buffer_size = 2M
# MySQL读入缓冲区大小。对表进行顺序扫描的请求将分配一个读入缓冲区，MySQL会为它分配一段内存缓冲区。read_buffer_size变量控制这一缓冲区的大小。
# 如果对表的顺序扫描请求非常频繁，并且你认为频繁扫描进行得太慢，可以通过增加该变量值以及内存缓冲区大小提高其性能

read_rnd_buffer_size = 8M
# MySQL的随机读缓冲区大小。当按任意顺序读取行时(例如，按照排序顺序)，将分配一个随机读缓存区。进行排序查询时，
# MySQL会首先扫描一遍该缓冲，以避免磁盘搜索，提高查询速度，如果需要排序大量数据，可适当调高该值。但MySQL会为每个客户连接发放该缓冲空间，所以应尽量适当设置该值，以避免内存开销过大

sort_buffer_size = 8M
# MySQL执行排序使用的缓冲大小。如果想要增加ORDER BY的速度，首先看是否可以让MySQL使用索引而不是额外的排序阶段。
# 如果不能，可以尝试增加sort_buffer_size变量的大小

join_buffer_size = 8M
# 联合查询操作所能使用的缓冲区大小，和sort_buffer_size一样，该参数对应的分配内存也是每连接独享

thread_cache_size = 8
# 这个值（默认8）表示可以重新利用保存在缓存中线程的数量，当断开连接时如果缓存中还有空间，那么客户端的线程将被放到缓存中，
# 如果线程重新被请求，那么请求将从缓存中读取,如果缓存中是空的或者是新的请求，那么这个线程将被重新创建,如果有很多新的线程，
# 增加这个值可以改善系统性能.通过比较Connections和Threads_created状态的变量，可以看到这个变量的作用。(–>表示要调整的值)
# 根据物理内存设置规则如下：
# 1G  —> 8
# 2G  —> 16
# 3G  —> 32
# 大于3G  —> 64

query_cache_size = 8M
#MySQL的查询缓冲大小（从4.0.1开始，MySQL提供了查询缓冲机制）使用查询缓冲，MySQL将SELECT语句和查询结果存放在缓冲区中，
# 今后对于同样的SELECT语句（区分大小写），将直接从缓冲区中读取结果。根据MySQL用户手册，使用查询缓冲最多可以达到238%的效率。
# 通过检查状态值'Qcache_%'，可以知道query_cache_size设置是否合理：如果Qcache_lowmem_prunes的值非常大，则表明经常出现缓冲不够的情况，
# 如果Qcache_hits的值也非常大，则表明查询缓冲使用非常频繁，此时需要增加缓冲大小；如果Qcache_hits的值不大，则表明你的查询重复率很低，
# 这种情况下使用查询缓冲反而会影响效率，那么可以考虑不用查询缓冲。此外，在SELECT语句中加入SQL_NO_CACHE可以明确表示不使用查询缓冲

query_cache_limit = 2M
#指定单个查询能够使用的缓冲区大小，默认1M

key_buffer_size = 4M
#指定用于索引的缓冲区大小，增加它可得到更好处理的索引(对所有读和多重写)，到你能负担得起那样多。如果你使它太大，
# 系统将开始换页并且真的变慢了。对于内存在4GB左右的服务器该参数可设置为384M或512M。通过检查状态值Key_read_requests和Key_reads，
# 可以知道key_buffer_size设置是否合理。比例key_reads/key_read_requests应该尽可能的低，
# 至少是1:100，1:1000更好(上述状态值可以使用SHOW STATUS LIKE 'key_read%'获得)。注意：该参数值设置的过大反而会是服务器整体效率降低

ft_min_word_len = 4
# 分词词汇最小长度，默认4

transaction_isolation = REPEATABLE-READ
# MySQL支持4种事务隔离级别，他们分别是：
# READ-UNCOMMITTED, READ-COMMITTED, REPEATABLE-READ, SERIALIZABLE.
# 如没有指定，MySQL默认采用的是REPEATABLE-READ，ORACLE默认的是READ-COMMITTED

log_bin = mysql-bin
binlog_format = mixed
expire_logs_days = 30 #超过30天的binlog删除

log_error = /data/mysql/mysql-error.log #错误日志路径
slow_query_log = 1
long_query_time = 1 #慢查询时间 超过1秒则为慢查询
slow_query_log_file = /data/mysql/mysql-slow.log

performance_schema = 0
explicit_defaults_for_timestamp

#lower_case_table_names = 1 #不区分大小写

skip-external-locking #MySQL选项以避免外部锁定。该选项默认开启

default-storage-engine = InnoDB #默认存储引擎

innodb_file_per_table = 1
# InnoDB为独立表空间模式，每个数据库的每个表都会生成一个数据空间
# 独立表空间优点：
# 1．每个表都有自已独立的表空间。
# 2．每个表的数据和索引都会存在自已的表空间中。
# 3．可以实现单表在不同的数据库中移动。
# 4．空间可以回收（除drop table操作处，表空不能自已回收）
# 缺点：
# 单表增加过大，如超过100G
# 结论：
# 共享表空间在Insert操作上少有优势。其它都没独立表空间表现好。当启用独立表空间时，请合理调整：innodb_open_files

innodb_open_files = 500
# 限制Innodb能打开的表的数据，如果库里的表特别多的情况，请增加这个。这个值默认是300

innodb_buffer_pool_size = 64M
# InnoDB使用一个缓冲池来保存索引和原始数据, 不像MyISAM.
# 这里你设置越大,你在存取表里面数据时所需要的磁盘I/O越少.
# 在一个独立使用的数据库服务器上,你可以设置这个变量到服务器物理内存大小的80%
# 不要设置过大,否则,由于物理内存的竞争可能导致操作系统的换页颠簸.
# 注意在32位系统上你每个进程可能被限制在 2-3.5G 用户层面内存限制,
# 所以不要设置的太高.

innodb_write_io_threads = 4
innodb_read_io_threads = 4
# innodb使用后台线程处理数据页上的读写 I/O(输入输出)请求,根据你的 CPU 核数来更改,默认是4
# 注:这两个参数不支持动态改变,需要把该参数加入到my.cnf里，修改完后重启MySQL服务,允许值的范围从 1-64

innodb_thread_concurrency = 0
# 默认设置为 0,表示不限制并发数，这里推荐设置为0，更好去发挥CPU多核处理能力，提高并发量

innodb_purge_threads = 1
# InnoDB中的清除操作是一类定期回收无用数据的操作。在之前的几个版本中，清除操作是主线程的一部分，这意味着运行时它可能会堵塞其它的数据库操作。
# 从MySQL5.5.X版本开始，该操作运行于独立的线程中,并支持更多的并发数。用户可通过设置innodb_purge_threads配置参数来选择清除操作是否使用单
# 独线程,默认情况下参数设置为0(不使用单独线程),设置为 1 时表示使用单独的清除线程。建议为1

innodb_flush_log_at_trx_commit = 2
# 0：如果innodb_flush_log_at_trx_commit的值为0,log buffer每秒就会被刷写日志文件到磁盘，提交事务的时候不做任何操作（执行是由mysql的master thread线程来执行的。
# 主线程中每秒会将重做日志缓冲写入磁盘的重做日志文件(REDO LOG)中。不论事务是否已经提交）默认的日志文件是ib_logfile0,ib_logfile1
# 1：当设为默认值1的时候，每次提交事务的时候，都会将log buffer刷写到日志。
# 2：如果设为2,每次提交事务都会写日志，但并不会执行刷的操作。每秒定时会刷到日志文件。要注意的是，并不能保证100%每秒一定都会刷到磁盘，这要取决于进程的调度。
# 每次事务提交的时候将数据写入事务日志，而这里的写入仅是调用了文件系统的写入操作，而文件系统是有 缓存的，所以这个写入并不能保证数据已经写入到物理磁盘
# 默认值1是为了保证完整的ACID。当然，你可以将这个配置项设为1以外的值来换取更高的性能，但是在系统崩溃的时候，你将会丢失1秒的数据。
# 设为0的话，mysqld进程崩溃的时候，就会丢失最后1秒的事务。设为2,只有在操作系统崩溃或者断电的时候才会丢失最后1秒的数据。InnoDB在做恢复的时候会忽略这个值。
# 总结
# 设为1当然是最安全的，但性能页是最差的（相对其他两个参数而言，但不是不能接受）。如果对数据一致性和完整性要求不高，完全可以设为2，如果只最求性能，例如高并发写的日志服务器，设为0来获得更高性能

innodb_log_buffer_size = 2M
# 此参数确定些日志文件所用的内存大小，以M为单位。缓冲区更大能提高性能，但意外的故障将会丢失数据。MySQL开发人员建议设置为1－8M之间

innodb_log_file_size = 32M
# 此参数确定数据日志文件的大小，更大的设置可以提高性能，但也会增加恢复故障数据库所需的时间

innodb_log_files_in_group = 3
# 为提高性能，MySQL可以以循环方式将日志文件写到多个文件。推荐设置为3

innodb_max_dirty_pages_pct = 90
# innodb主线程刷新缓存池中的数据，使脏数据比例小于90%

innodb_lock_wait_timeout = 120 
# InnoDB事务在被回滚之前可以等待一个锁定的超时秒数。InnoDB在它自己的锁定表中自动检测事务死锁并且回滚事务。InnoDB用LOCK TABLES语句注意到锁定设置。默认值是50秒

bulk_insert_buffer_size = 8M
# 批量插入缓存大小， 这个参数是针对MyISAM存储引擎来说的。适用于在一次性插入100-1000+条记录时， 提高效率。默认值是8M。可以针对数据量的大小，翻倍增加。

myisam_sort_buffer_size = 8M
# MyISAM设置恢复表之时使用的缓冲区的尺寸，当在REPAIR TABLE或用CREATE INDEX创建索引或ALTER TABLE过程中排序 MyISAM索引分配的缓冲区

myisam_max_sort_file_size = 10G
# 如果临时文件会变得超过索引，不要使用快速排序索引方法来创建一个索引。注释：这个参数以字节的形式给出

myisam_repair_threads = 1
# 如果该值大于1，在Repair by sorting过程中并行创建MyISAM表索引(每个索引在自己的线程内) 

interactive_timeout = 28800
# 服务器关闭交互式连接前等待活动的秒数。交互式客户端定义为在mysql_real_connect()中使用CLIENT_INTERACTIVE选项的客户端。默认值：28800秒（8小时）

wait_timeout = 28800
# 服务器关闭非交互连接之前等待活动的秒数。在线程启动时，根据全局wait_timeout值或全局interactive_timeout值初始化会话wait_timeout值，
# 取决于客户端类型(由mysql_real_connect()的连接选项CLIENT_INTERACTIVE定义)。参数默认值：28800秒（8小时）
# MySQL服务器所支持的最大连接数是有上限的，因为每个连接的建立都会消耗内存，因此我们希望客户端在连接到MySQL Server处理完相应的操作后，
# 应该断开连接并释放占用的内存。如果你的MySQL Server有大量的闲置连接，他们不仅会白白消耗内存，而且如果连接一直在累加而不断开，
# 最终肯定会达到MySQL Server的连接上限数，这会报'too many connections'的错误。对于wait_timeout的值设定，应该根据系统的运行情况来判断。
# 在系统运行一段时间后，可以通过show processlist命令查看当前系统的连接状态，如果发现有大量的sleep状态的连接进程，则说明该参数设置的过大，
# 可以进行适当的调整小些。要同时设置interactive_timeout和wait_timeout才会生效。

[mysqldump]
quick
max_allowed_packet = 16M #服务器发送和接受的最大包长度

[myisamchk]
key_buffer_size = 8M
sort_buffer_size = 8M
read_buffer = 4M
write_buffer = 4M 
```

