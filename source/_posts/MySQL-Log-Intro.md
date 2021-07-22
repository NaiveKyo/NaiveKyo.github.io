---
title: MySQL_Log_Intro
date: 2021-07-07 14:59:32
author: NaiveKyo
top: false
hide: false
coverImg: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/13.jpg
cover: false
toc: true
img: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/13.jpg
summary: 简单了解 MySQL 的日志模板。
categories: MySQL
keywords: 
  - MySQL
  - Log
tags:
  - MySQL
  - Log
---



# MySQL 日志学习



## 一、日志分类

**官方文档：**https://dev.mysql.com/doc/refman/8.0/en/binary-log.html

下面简单介绍 MySQL 中 4 种日志文件的作用。

- 二进制日志：该日志文件会以二进制的形式记录数据库的各种操作，但不记录查询语句。
- 错误日志：该日志文件会记录 MySQL 服务器的启动、关闭和运行错误等信息。
- 通用查询日志：该日志记录 MySQL 服务器的启动和关闭信息、客户端的连接信息、更新、查询数据记录的 SQL 语句等。
- 慢查询日志：记录执行事件超过指定时间的操作，通过工具分析慢查询日志可以定位 MySQL 服务器性能瓶颈所在。



## 二、错误日志（Error Log）

MySQL 默认开启错误日志，该日记主要记录 MySQL 服务器启动和停止过程中的信息、服务器在运行过程中发生的故障和异常情况等。

my.cnf  中的 `log_error=dir/{filename}` 配置错误日志的文件位置

在 MySQL 中，通过 SHOW 命令可以查看错误日志文件所在的目录及文件名信息。



```bash
show variables like 'log_error';
```

在 MySQL 中，可以使用 mysqladmin 命令来开启新的错误日志，以保证 MySQL 服务器上的硬盘空间。mysqladmin 命令的语法如下：

```bash
mysqladmin -u root -p flush-logs
```

执行该命令后，MySQL 服务器首先会自动创建一个新的错误日志，然后将旧的错误日志更名为 filename.err-old。

MySQL 服务器发生异常时，管理员可以在错误日志中找到发生异常的时间、原因，然后根据这些信息来解决异常。对于很久之前的错误日志，查看的可能性不大，可以直接将这些错误日志删除。



## 三、二进制日志



### 1、MySQL8.0 二进制日志

二进制日志（Binary Log）也可叫作变更日志（Update Log），是 MySQL 中非常重要的日志。主要用于记录数据库的变化情况，即 SQL 语句的 DDL 和 DML 语句，不包含数据记录查询操作。

如果 MySQL 数据库意外停止，可以通过二进制日志文件来查看用户执行了哪些操作，对数据库服务器文件做了哪些修改，然后根据二进制日志文件中的记录来恢复数据库服务器。

默认情况下，二进制日志功能是关闭的。可以通过以下命令查看二进制日志是否开启，命令如下：

```bash
show variables like 'log_bin';
```



> 启动和关闭二进制日志

在 MySQL 中，可以通过在配置文件中添加 log-bin 选项来开启二进制日志，格式如下：

```bash
[mysqld]
log-bin=dir/[filename]
```

这里注意：现在安装的是 mysql8.0 的 `mysql-community-server` 版本，**默认是开启二进制日志的**，且二进制日志一般放在 mysql 的 data 目录下：

```bash
# 现在是在这个位置
/var/lib/mysql/binlog.xxx
```



1. 查看二进制日志文件列表：`show binary logs;`

2. 查看当前正在写入的二进制日志文件：`show master status;`

3. **查看二进制文件内容：**

   - 二进制日志使用二进制格式存储，不能直接打开查看。如果需要查看二进制日志，必须使用 `mysqlbinlog `命令。
   - mysqlbinlog 命令的语法形式如下：`mysqlbinlog filename.number`
   - mysqlbinlog 命令只在当前文件夹下查找指定的二进制日志，因此需要在二进制日志所在的目录下运行该命令，否则将会找不到指定的二进制日志文件。(使用 mysqlbinlog 命令时，可以指定二进制文件的存储路径)

4. 除了 filename.number 文件，MySQL 还会生成一个名为 filename.index 的文件，这个文件存储着所有二进制日志文件的列表，可以用记事本打开该文件。

5. 删除二进制日志：二进制日志中记录着大量的信息，如果很长时间不清理二进制日志，将会浪费很多的磁盘空间。删除二进制日志的方法很多，下面介绍几种删除二进制日志的方法。

   - 使用 `RESET MASTER` 可以删除所有二进制日志
   - 根据编号删除二进制日志：`PURGE MASTER LOGS TO 'filename.number';`
   - 根据创建时间删除二进制日志：`PURGE MASTER LOGS TO 'yyyy-mm-dd hh:MM:ss';`其中，“hh”为 24 制的小时。该语句将删除在指定时间之前创建的所有二进制日志。

6. 暂停二进制日志：在配置文件中设置了 log_bin 选项之后，MySQL 服务器将会一直开启二进制日志功能。删除该选项后就可以停止二进制日志功能，如果需要再次启动这个功能，需要重新添加 log_bin 选项。由于这样比较麻烦，所以 MySQL 提供了暂时停止二进制日志功能的语句。

   如果用户不希望自己执行的某些 SQL 语句记录在二进制日志中，可以在执行这些 SQL 语句之前暂停二进制日志功能。

   使用 SET 语句来暂停/开启二进制日志功能，命令如下：

   ```bash
   SET SQL_LOG_BIN=0/1;
   ```

   以上命令中，0 表示暂停二进制日志功能，1 表示开启二进制功能。



> 扩展

my.ini 中的 [mysqld] 组下面有几个设置参数是关于二进制日志的：

expire_logs_days = 10
max_binlog_size = 1​00M

- expire_logs_day 定义了 MySQL 清除过期日志的时间、二进制日志自动删除的天数。默认值为 0，表示“没有自动删除”。当 MySQL 启动或刷新二进制日志时可能删除。
- max_binlog_size 定义了单个文件的大小限制，如果二进制日志写入的内容大小超出给定值，日志就会发生滚动（关闭当前文件，重新打开一个新的日志文件）。不能将该变量设置为大于 1GB 或小于 4096B（字节），其默认值是 1GB。





>小技巧：实际工作中，二进制日志文件与数据库的数据文件不放在同一块硬盘上，这样即使数据文件所在的硬盘被破坏，也可以使用另一块硬盘上的二进制日志来恢复数据库文件。两块硬盘同时坏了的可能性要小得多，这样可以保证数据库中数据的安全。



### 2、MySQL 5.7 开启二进制日志

```ini
[mysqld]

# 启用二进制日志记录，8.0之前默认禁用，之后默认启用
# 二进制日志文件名称前缀，二进制日志是具有基本名称和数字扩展名的文件序列。
# 二进制日志文件的默认位置是数据目录，可以使用此选项设置
log-bin=mysql-bin

# 在MySQL 5.7中，启用二进制日志记录时必须指定服务器ID，否则服务器将无法启动
# 在MySQL 8.0中，服务器ID默认设置为1
# 默认值未0，如果使用默认值则不能和从节点通信，这个值的区间是：1到(2^32)-1
server-id=1


# 禁用MySQL服务器将二进制日志同步到磁盘的功能，有操作系统控制，性能最佳，安全性最差
# sync_binlog=0
# 在提交事务之前启用二进制日志到磁盘的同步，性能最差，安全性最佳
sync_binlog=1

# 日志在每次事务提交时写入并刷新到磁盘，安全性最佳
innodb_flush_log_at_trx_commit=1
```



### 3、使用二进制日志还原数据库

二进制日志中记录了用户对数据库更改的所有操作，如 INSERT 语句、UPDATE 语句、CREATE 语句等。如果数据库因为操作不当或其它原因丢失了数据，可以通过**二进制日志来查看在一定时间段内用户的操作，结合数据库备份来还原数据库。**



数据库遭到意外损坏时，应该先使用最近的备份文件来还原数据库。另外备份之后，数据库可能进行了一些更新，这时可以使用二进制日志来还原。因为二进制日志中存储了更新数据库的语句，如 UPDATE 语句、INSERT 语句等。



```bash
# 二进制日志还原数据库的命令如下：
mysqlbinlog filename.number | mysql -u root -p
```

以上命令可以理解成，先使用 mysqlbinlog 命令来读取 filename.number 中的内容，再使用 mysql 命令将这些内容还原到数据库中。

技巧：二进制日志虽然可以用来还原 MySQL 数据库，但是其占用的磁盘空间也是非常大的。因此，在备份 MySQL 数据库之后，应该删除备份之前的二进制日志。如果备份之后发生异常，造成数据库的数据损失，可以通过备份之后的二进制日志进行还原。

使用 mysqlbinlog 命令进行还原操作时，必须是编号（number）小的先还原。例如，mylog.000001 必须在 mylog.000002 之前还原。



## 四、MySQL 通用查询日志（General Query Log）

通用查询日志（General Query Log）用来记录用户的所有操作，包括启动和关闭 MySQL 服务、更新语句和查询语句等。



- 查询通用查询日志是否开启

  ```bash
  show variables like '%general%';
  ```

  MySQL 5.7 默认是关闭的，general_log_file 变量指定了通用查询日志文件所在的位置。

- 启动和设置通用查询日志

  在 MySQL 中，可以通过在 MySQL 配置文件添加 log 选项来开启通用查询日志，格式如下：

  ```bash
  [mysqld]
  log=dir/filename
  ```

  其中，dir 参数指定通用查询日志的存储路径；filename 参数指定日志的文件名。如果不指定存储路径，通用查询日志将默认存储到 MySQL 数据库的数据文件夹下。如果不指定文件名，默认文件名为 hostname.log，其中 hostname 表示主机名。

- 查看通用查询日志

  如果希望了解用户最近的操作，可以查看通用查询日志。通用查询日志以文本文件的形式存储，可以使用普通文本文件查看该类型日志内容。

- 停止通用查询日志

  通用查询日志启动后，可以通过两种方法停止该日志。一种是将 MySQL 配置文件中的相关配置注释掉，然后重启服务器，来停止通用查询日志。

  上述方法需要重启 MySQL 服务器，这在某些场景，比如有业务量访问的情况下是不允许的，这时可以通过另一种方法来动态地控制通用查询日志的开启和关闭。

  设置 MySQL 的环境变量 general_log 为关闭状态可以停止该日志，示例如下：

  ```bash
  mysql> set global general_log = off;
  ```

- 删除通用查询日志

  在 MySQL 中，可以使用 mysqladmin 命令来开启新的通用查询日志。新的通用查询日志会直接覆盖旧的查询日志，不需要再手动删除了。

  mysqladmin 命令的语法如下：

  ```bash
  mysqladmin -u root -p flush-logs;
  ```

  需要注意的是，如果希望备份旧的通用查询日志，必须先将旧的日志文件拷贝出来或者改名。然后，再执行 mysqladmin 命令。

  除了上述方法之外，还可以手工删除通用查询日志。删除之后需要重新启动 MySQL 服务。重启之后就会生成新的通用查询日志。如果希望备份旧的日志文件，可以将旧的日志文件改名，然后重启 MySQL 服务。

  由于通用查询日志会记录用户的所有操作，如果数据库的使用非常频繁，通用查询日志将会占用非常大的磁盘空间，对系统性能影响较大。一般情况下，数据管理员可以删除很长时间之前的通用查询日志或关闭此日志，以保证 MySQL 服务器上的硬盘空间。



## 五、MySQL 慢查询日志（Slow Query Log）

慢查询日志用来记录在 MySQL 中执行时间超过指定时间的查询语句。通过慢查询日志，可以查找出哪些查询语句的执行效率低，以便进行优化。



通俗的说，MySQL 慢查询日志是排查问题的 SQL 语句，以及检查当前 MySQL 性能的一个重要功能。如果不是调优需要，一般不建议启动该参数，因为开启慢查询日志会或多或少带来一定的性能影响。



默认情况下，慢查询日志功能是关闭的。可以通过以下命令查看是否开启慢查询日志功能。

```bash
show variables like 'slow_query%';
show variables like 'long_query_time';
```

参数说明如下：

- slow_query_log：慢查询开启状态
- slow_query_log_file：慢查询日志存放的位置（一般设置为 MySQL 的数据存放目录）
- long_query_time：查询超过多少秒才记录



> 启动和设置慢查询日志

可以通过 log-slow-queries 选项开启慢查询日志。通过 long_query_time 选项来设置时间值，时间以秒为单位。如果查询时间超过了这个时间值，这个查询语句将被记录到慢查询日志。



将 log_slow_queries 选项和 long_query_time 选项加入到配置文件的 [mysqld] 组中。格式如下：

```bash
[mysqld]
log-slow-queries=dir\filename
long_query_time=n
```

其中：

- dir 参数指定慢查询日志的存储路径，如果不指定存储路径，慢查询日志将默认存储到 MySQL 数据库的数据文件夹下。
- filename 参数指定日志的文件名，生成日志文件的完整名称为 filename-slow.log。 如果不指定文件名，默认文件名为 hostname-slow.log，hostname 是 MySQL 服务器的主机名。
- “n”参数是设定的时间值，该值的单位是秒。如果不设置 long_query_time 选项，默认时间为 10 秒。



> 查看慢查询日志

如果你想查看哪些查询语句的执行效率低，可以从慢查询日志中获得信息。和错误日志、查询日志一样，慢查询日志也是以文本文件的形式存储的，可以使用普通的文本文件查看工具来查看。

```bash
#开启 MySQL 慢查询日志功能，并设置时间，命令和执行过程如下：
set global slow_query_log = ON;

set global long_query_time = 0.001;
```

由于需要演示这里我们将时间设置为了 0.001 秒，执行时间超过 0.001 秒的 SQL 语句将被记录到日志中。



> 删除慢查询日志

慢查询日志的删除方法与通用日志的删除方法是一样的。可以使用 mysqladmin 命令来删除。也可以使用手工方式来删除。mysqladmin 命令的语法如下：

```bash
mysqladmin -u root -p flush-logs;
```

执行该命令后，命令行会提示输入密码。输入正确密码后，将执行删除操作。新的慢查询日志会直接覆盖旧的查询日志，不需要再手动删除。

数据库管理员也可以手工删除慢查询日志，删除之后需要重新启动 MySQL 服务。