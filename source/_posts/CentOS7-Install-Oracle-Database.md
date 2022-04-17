---
title: CentOS7 Install Oracle Database
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221159.jpg'
coverImg: /img/20220225221159.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-12 23:09:41
summary: "CentOS7 安装 Oracle Database 19C"
categories: "Linux"
keywords: ["Linux", "Oracle"]
tags: "Linux"
---

# CentOS7 安装 Oracle 19c

本文参考：https://oracle-base.com/articles/19c/oracle-db-19c-installation-on-oracle-linux-7

# 一、下载 Oracle 19c

官网下载地址：https://www.oracle.com/database/technologies/oracle-database-software-downloads.html

或者 Oracle Delivery：https://edelivery.oracle.com/osdc/faces/Home.jspx （Oracle 的绝大多数软件都在这里下载）

或者 Oracle MOS：但是这个需要企业或组织购买了 Oracle 的官方服务后才可以开通。

Oracle 19c 目前是 Oracle 的 LST 版本，包含了 Oracle 的所有功能，用来学习和测试是么问题，但是注意如果要用于商务，就需要向 Oracle 公司购买 License。

注意：需要登录 Oracle 账户才可以下载（普通账户即可）。

以官网下载为例，进入下载地址后找到：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220412231131.png)

如果要下载免费版本，可以在最下方的 `Oracle Database Express Edition` 栏下查看相关信息，但是注意免费版本阉割了很多功能。

这里我们下载 ZIP 包，下载完成后点击右侧 `See All` 查看校验用的 MD5 或者 SHA 值进行验证，确保下载的软件和官网提供的完全一致。



# 二、CentOS7 安装 Oracle 19c

参考文章：https://oracle-base.com/articles/19c/oracle-db-19c-installation-on-oracle-linux-7

## 1、配置 Host 

```bash
# 输入 
sudo vim /etc/hosts

127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
# 最后一行加上
192.168.154.128 ol7-19.localdomain ol7-19
```

名称可以随意取，这里只是标识我们是在 Linux 7 上安装 Oracle 19。



## 2、安装方式说明以及更换 yum 源

安装方式有两种：

- 使用 rpm 安装包默认安装
- 使用 zip 包手动安装
- <mark>无论哪一种都需要一些必要的前置依赖，以及一些配置。</mark>
- 剩下的步骤可以切换到 root 账户进行

这里使用清华镜像站的 CentOS 镜像仓库。

```bash
# 进入 yum 的本地仓库文件夹
cd /etc/yum/yum.repos.d
# 备份默认的 yum 仓库
tar -cvf yum_repos.bak ./
# 使用 sed 工具配合正则表达式批量修改 yum 配置文件
# 注意当前版本为 Centos7
sed -e 's|^mirrorlist=|#mirrorlist=|g' \
	-e 's|^#baseurl=http://mirror.centos.org|baseurl=https://mirrors.tuna.tsinghua.edu.cn|g' \
	-i \
	/etc/yum.repos.d/CentOS-*.repo
	
# 最后重新生成软件包缓存
yum makecache
```



## 3、默认安装 Oracle 前置依赖

如果当前系统是 Oracle Linux 平台，可以去下载对应的 rpm 包：

```bash
yum -y install oracle-database-preinstall-19c
```

如果不是，比如我们现在用的是 CentOS 7，可以去下面两个网站找：

- https://oss.oracle.com/ol7/SRPMS-updates/ 搜索 -19c ，下载最新的即可；
- https://yum.oracle.com/repo/OracleLinux/OL7/latest/x86_64/index.html 

也可以使用下面的命令（推荐）：

```bash
curl -o oracle-database-preinstall-19c-1.0-1.el7.x86_64.rpm https://yum.oracle.com/repo/OracleLinux/OL7/latest/x86_64/getPackage/oracle-database-preinstall-19c-1.0-1.el7.x86_64.rpm

yum -y localinstall oracle-database-preinstall-19c-1.0-1.el7.x86_64.rpm
```

接着使用一下命令查看：

```bash
# 查看用户
tail -n 10 /etc/passwd	# 可以看到 oracle 用户已经被创建了

# 查看用户组
tail -n 10 /etc/group

# 可以看到以下几个用户组
oinstall:x:54321:oracle
dba:x:54322:oracle
oper:x:54323:oracle
backupdba:x:54324:oracle
dgdba:x:54325:oracle
kmdba:x:54326:oracle
racdba:x:54330:oracle
```

## 4、手动安装 Oracle 前置依赖

更多信息参考：https://oracle-base.com/articles/19c/oracle-db-19c-installation-on-oracle-linux-7

手动安装主要做的事情就是手动为 Oracle 做一些配置，这些事在前面的 preinstall 中自动做了。



## 5、配置 Oracle 用户

无论是默认安装还是手动安装，都需要进行这一步。

```bash
# 为 oracle 用户配置密码
passwd oracle

# 设置 Linux 的 SELINUX 运行模式改为宽容模式
vim /etc/selinux/config
# 修改 SELINUX=permissive

# 重启服务器或者使用下面的命令刷新 SELINUX
setenforce Permissive

# 创建 Oracle 软件安装目录，可以自定义
mkdir -p /u01/app/oracle/product/19.0.0/dbhome_1
mkdir -p /u02/oradata
chown -R oracle:oinstall /u01 /u02
chmod -R 775 /u01 /u02
```

解释一下，线上环境我们不会直接将 Oracle 的挂载点放在根目录下，应该给它安装单独的磁盘，这里是在学习环境下安装的，所以直接放在 `/` 下面，对于真正的安装，应该为操作系统保留 `/` 存储空间。

> 为 oracle 用户配置用户环境变量

```bash
# 在 oralce 的家目录中创建一个存放脚本的目录
mkdir /home/oracle/scripts

# 在该目录下创建一个名为 setEnv.sh 的脚本，这里使用 cat，注意需要对 $ 进行转义
cat > /home/oracle/scripts/setEnv.sh <<EOF
# Oracle Settings
export TMP=/tmp
export TMPDIR=\$TMP

export ORACLE_HOSTNAME=ol7-19.localdomain
export ORACLE_UNQNAME=cdb1
export ORACLE_BASE=/u01/app/oracle
export ORACLE_HOME=\$ORACLE_BASE/product/19.0.0/dbhome_1
export ORA_INVENTORY=/u01/app/oraInventory
export ORACLE_SID=cdb1
export PDB_NAME=pdb1
export DATA_DIR=/u02/oradata

export PATH=/usr/sbin:/usr/local/bin:\$PATH
export PATH=\$ORACLE_HOME/bin:\$PATH

export LD_LIBRARY_PATH=\$ORACLE_HOME/lib:/lib:/usr/lib
export CLASSPATH=\$ORACLE_HOME/jlib:\$ORACLE_HOME/rdbms/jlib
EOF
```

注意这里的 ORACLE_HOSTNAME 是我们之前在 hosts 文件中配置的。

```bash
# 由于我们现在是在 root 用户下创建的脚本，但是实际执行的是 oracle 用户，所以需要设置一下权限
chown oracle:oinstall /home/oracle/scripts/setEnv.sh
chown 744 /home/oracle/scripts/setEnv.sh

# 最后将这个脚本文件的引用追加到 oracle 用户环境变量配置文件中
echo '. /home/oracle/scripts/setEnv.sh' >> /home/oracle/.bash_profile
```

## 6、创建 oracle 数据库启动和停止脚本

```bash
# 创建 start_all.sh 和 stop_all.sh 用来开启和关闭所有的 oralce 数据库实例
cat > /home/oracle/scripts/start_all.sh <<EOF
#!/bin/bash
. /home/oracle/scripts/setEnv.sh

export ORAENV_ASK=NO
. oraenv
export ORAENV_ASK=YES

dbstart \$ORACLE_HOME
EOF


cat > /home/oracle/scripts/stop_all.sh <<EOF
#!/bin/bash
. /home/oracle/scripts/setEnv.sh

export ORAENV_ASK=NO
. oraenv
export ORAENV_ASK=YES

dbshut \$ORACLE_HOME
EOF

chown -R oracle:oinstall /home/oracle/scripts
chmod u+x /home/oracle/scripts/*.sh
```

这样，我们之后切换到 oracle 用户就可以用下面的命令启动或结束 oracle 进程：

```bash
~/scripts/start_all.sh
~/scripts/stop_all.sh
```

## 7、扩展: 创建 Oracle 服务

参考：https://oracle-base.com/articles/linux/linux-services-systemd#creating-linux-services



# 三、安装 Oracle

## 1、静默安装

首先将我们最开始下载的 zip 压缩包上传到服务器并解压：

```bash
# 重新以 oracle 用户登录服务器
# 进入 ORACLE_HOME 目录
cd $ORACLE_HOME
# 解压之前上传到服务器的 zip 文件
unzip -oq /usr/local/backup/LINUX.X64_193000_db_home.zip
```

接下来分为两种安装模式：图形界面安装、命令行静默安装

> 图形界面

该安装方式需要 Linux 图形化，这里不做过多说明（笔者用的是命令行）

```bash
# Interactive mode.
./runInstaller
```

> 静默安装

图形化的安装界面本质上是更方便的引导用户输入一些参数对数据库进行配置，而静默安装则是通过一个 response file 来提供这些配置参数，两者的区别就是配置参数的来源是用户输入还是文件。

当然如果开发者想要自定义参数可以通过提供 response file 或者说在命令行覆盖 resopnse file 中的参数，直接输入，下面以此为例：

```bash
# Silent mode.
./runInstaller -ignorePrereq -waitforcompletion -silent                        \
    -responseFile ${ORACLE_HOME}/install/response/db_install.rsp               \
    oracle.install.option=INSTALL_DB_SWONLY                                    \
    ORACLE_HOSTNAME=${ORACLE_HOSTNAME}                                         \
    UNIX_GROUP_NAME=oinstall                                                   \
    INVENTORY_LOCATION=${ORA_INVENTORY}                                        \
    SELECTED_LANGUAGES=en,zh_CN                                                \
    ORACLE_HOME=${ORACLE_HOME}                                                 \
    ORACLE_BASE=${ORACLE_BASE}                                                 \
    oracle.install.db.InstallEdition=EE                                        \
    oracle.install.db.OSDBA_GROUP=dba                                          \
    oracle.install.db.OSBACKUPDBA_GROUP=dba                                    \
    oracle.install.db.OSDGDBA_GROUP=dba                                        \
    oracle.install.db.OSKMDBA_GROUP=dba                                        \
    oracle.install.db.OSRACDBA_GROUP=dba                                       \
    SECURITY_UPDATES_VIA_MYORACLESUPPORT=false                                 \
    DECLINE_SECURITY_UPDATES=true
```

```bash
# 提示 Successfully Setup ... 后切换到 root 用户执行下面两个脚本,注意此时我么还没有将 oracle 加入 visudo

su -
/u01/app/oraInventory/orainstRoot.sh
/u01/app/oracle/product/19.0.0/dbhome_1/root.sh
# 不用管输出的有关权限的信息，使用 root 账户一定会执行成功
```

## 2、创建数据库实例

> 说明

<font style="color:green">说明：不管是在本地虚拟机还是云端服务器，创建数据库实例的过程均出现卡在某个进度的情况，此时建议查看 `/u01/app/oracle/cfgtoollogs/dbca/cdb1/` 目录下的对应日志文件，也可结合云服务上平台提供的实时监控功能，如果没有出现明显的错误信息，可以耐心等待，笔者在云端服务器创建容器数据库卡在 36% 最终没有等到执行完毕，创建非容器数据库卡在 46%，经过了十几分钟后才结束卡顿，最终成功创建非容器数据库。</font>

<font style="color:red">大概原因可能是和机器性能有关。。。</font>

### （1）容器数据库

<strong style="color:red">目前虚拟机中创建容器数据库会卡进度，所以先创建非容器数据库。TODO</strong>

我们可以通过 Database Configuration Assistant (DBCA) 去创建数据库，也是分为两种方式：GUI 和 命令行，此处我们使用命令行：

```bash
# 切换回 oracle 用户
# 使用 oracle 的命令监听，如果无法执行说明环境变量没有配置好
lsnrctl start # 最后会提示 successfully

# 图形交互界面
dbca

# 命令行静默模式
dbca -silent -createDatabase                                                   \
     -templateName General_Purpose.dbc                                         \
     -gdbname ${ORACLE_SID} -sid  ${ORACLE_SID} -responseFile NO_VALUE         \
     -characterSet AL32UTF8                                                    \
     -sysPassword 123456                                                 \
     -systemPassword 123456                                              \
     -createAsContainerDatabase true                                           \
     -numberOfPDBs 1                                                           \
     -pdbName ${PDB_NAME}                                                      \
     -pdbAdminPassword 123456                                            \
     -databaseType MULTIPURPOSE                                                \
     -memoryMgmtType auto_sga                                                  \
     -totalMemory 2000                                                         \
     -storageType FS                                                           \
     -datafileDestination "${DATA_DIR}"                                        \
     -redoLogFileSize 50                                                       \
     -emConfiguration NONE                                                     \
     -ignorePreReqs
```

```bash
dbca -silent -createDatabase -templateName General_Purpose.dbc -gdbname ${ORACLE_SID} -sid  ${ORACLE_SID} -responseFile NO_VALUE -characterSet AL32UTF8 -sysPassword 123456 -systemPassword 123456 -createAsContainerDatabase true -numberOfPDBs 1 -pdbName ${PDB_NAME} -pdbAdminPassword 123456 -databaseType MULTIPURPOSE -memoryMgmtType auto_sga -totalMemory 2000 -storageType FS -datafileDestination "${DATA_DIR}" -redoLogFileSize 50 -emConfiguration NONE -ignorePreReqs
```

关于 dbca 静默模式的使用，参考：https://oracle-base.com/articles/misc/database-configuration-assistant-dbca-silent-mode

官方文档：

- https://docs.oracle.com/en/
- 19C：https://docs.oracle.com/en/database/oracle/oracle-database/index.html
- 19C 创建数据库实例：https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/creating-and-configuring-an-oracle-database.html#GUID-807DE711-C82C-4BB2-8C31-5EE89CA71349
- 19C DBCA Silent Model Commands：https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/creating-and-configuring-an-oracle-database.html#GUID-0A94814D-032B-4F6A-8B54-A35223A1E3EF



这里的参数说明：（注意所有的 `${}` 拿到的环境变量都是 oracle 用户的用户环境变量）

- `temploateName`：General_Purpose 表示通用的数据库；

- `gdbname`：全局数据库名称，这里的数据库的 sid 是  `${ORACLE_SID}` 我们配置为 `cdb1`；

- `characterSet`：字符编码，这里用的是 Unicode 编码；

- `sysPassword`：SYS 用户密码；

- `systemPassword`：SYSTEM 用户密码；

- `createAsContainerDatabase`：是否作为容器数据库（CDB，一个 CDB 可以拥有多个可拔插数据库（PDB，Pluggable Database））；

- `numberOfPDBs`：CDB 最多拥有的 PDB 数量，默认是 0；

  <mark>注：ORACLE 12C 之前，实例与数据库是一对一或多对一的关系（RAC），即一个实例只能与一个数据库关联，或者一个数据库可以被多个实例所加载。但是在 ORACLE 12C 之后，实例和数据库可以是一对多的关系。</mark>

- `pdbName`：每个 PDB 的基础名称（前缀），如果 `numbersOfPDBs` 参数大于 1，就会为 `pdbName`  添加一个数字编号后缀（递增），如果 `numbersOfPDBs`  大于 0，该参数必须声明；
- `pdbAdminPassword`：PDB 管理员的密码；
- `databaseType`：
  - 声明为  `MULTIPURPOSE`，表示数据库同时用于 OLAP（On-Line Analytical Processing）和数据仓库；
  - 声明为 `DATA_WAREHOUSING` 表明数据库主要用于数据仓库；
  - 声明为 `OLTP`，表明数据库主要用于在线联机事务处理（OLTP）；
- ......
- `storageType`：数据库存储类型，有两种：
  - `FS`，取决于操作系统；
  - `ASM`：Oracle 提供的数据库文件管理机制。
- `datafileDestination`：数据库文件存放位置，这里是之前定义的 /u02/oradata；
- ......

如果容器化安装成功，可以编辑 `/etc/oratab` 文件，将最后一行的 `cdb1:/u01/app/oracle/product/19.0.0/dbhome_1:N` 最后的 N 改成 Y。 

然后开启 Oracle Managed Files（OMF）确保实例启动后 PDB 也会一同启动：

```bash
sqlplus / as sysdba << EOF
alter system set db_create_file_dest='${DATA_DIR}';
alter pluggable database ${PDB_NAME} save state;
exit;
EOF
```



### （2）非容器数据库

如果创建容器数据库卡在某个进度无法继续，可以调小 `totalMemory` 的值，可能是服务器内存资源不够，也可能是其他原因，所以现在删除数据库实例（如何删除见后文），转而创建非容器数据库。

```bash
# 首先开启监听
lsnrctl start

# 然后执行以下命令创建非容器数据库
dbca -silent -createDatabase -templateName General_Purpose.dbc -gdbname ${ORACLE_SID} -sid  ${ORACLE_SID} -responseFile NO_VALUE -characterSet AL32UTF8 -sysPassword 123456 -systemPassword 123456 -databaseType MULTIPURPOSE -memoryMgmtType auto_sga -totalMemory 2000 -storageType FS -datafileDestination "${DATA_DIR}" -redoLogFileSize 50 -emConfiguration NONE -ignorePreReqs
```

根据实际情况调整 `totalMemory`，最后创建成功后提示：

```bash
Executing Post Configuration Actions
100% complete
Database creation complete. For details check the logfiles at:
 /u01/app/oracle/cfgtoollogs/dbca/cdb1.
Database Information:
Global Database Name:cdb1
System Identifier(SID):cdb1
Look at the log file "/u01/app/oracle/cfgtoollogs/dbca/cdb1/cdb14.log" for further details.
```

最后编辑 `/etc/oratab` 文件，将最后一行的 `cdb1:/u01/app/oracle/product/19.0.0/dbhome_1:N` 最后的 N 改成 Y。 



### （3）静默删除数据库实例

```bash
dbca -silent -deleteDatabase -sourcedb cdb1 -sid cdb1 -sysDBAUserName sys -sysDBAPassword 123456
```

注意这里的 cdb1 是数据库 sid，使用 sysDBA 用户，密码是 123456



# 四、补充

## 1、文档

多看官网文档

- 19C：https://docs.oracle.com/en/database/oracle/oracle-database/19/administration.html

- Oracle SQL 参考：https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/index.html



## 2、开放端口

```bash
# 使用 Oracle 的 lsnrctl 命令
[oracle@ol7-19 dbhome_1]$ lsnrctl status

LSNRCTL for Linux: Version 19.0.0.0.0 - Production on 12-APR-2022 09:41:00

Copyright (c) 1991, 2019, Oracle.  All rights reserved.

Connecting to (ADDRESS=(PROTOCOL=tcp)(HOST=)(PORT=1521))
STATUS of the LISTENER
------------------------
Alias                     LISTENER
Version                   TNSLSNR for Linux: Version 19.0.0.0.0 - Production
Start Date                12-APR-2022 09:36:16
Uptime                    0 days 0 hr. 4 min. 44 sec
Trace Level               off
Security                  ON: Local OS Authentication
SNMP                      OFF
Listener Log File         /u01/app/oracle/diag/tnslsnr/ol7-19/listener/alert/log.xml
Listening Endpoints Summary...
  (DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=ol7-19.localdomain)(PORT=1521)))
Services Summary...
Service "cdb1" has 1 instance(s).
  Instance "cdb1", status READY, has 1 handler(s) for this service...
Service "cdb1XDB" has 1 instance(s).
  Instance "cdb1", status READY, has 1 handler(s) for this service...
The command completed successfully
```

可以看到 Oracle 进程的端口是 1521：

```bash
# 切换到 root
su -
# 开放端口
firewall-cmd --zone=public --add-port=1521/tcp --permanent
firewall-cmd --reload
firewall-cmd --list-port
```

## 3、使用 Navicat 远程连接 Oracle 数据库

在服务器上可以使用 `sqlplus` 连接 Oracle，使用方式和 `mysqld` 类似。

但是有一点需要注意，如果我们要以 SYS 或者 SYSTEM 账户远程连接 Oracle 数据库，则必须设置登录角色（普通用户不用设置这个），在高级选项中设置相应的角色，例如这里我们要以 SYS 账户连接，则需要这样设置：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220412220735.png)

然后常规选项中输入相关信息，点击测试连接：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220412220829.png)

连接类型选择 Basic，TNS 方式需要在服务器端 `$ORACLE_HOME/network/admin` 目录下新建一个 `tnsnames.ora` 配置本地网络连接配置，比较麻烦，Basic 连接就不需要这个了。

服务名或者 SID 在服务端使用 `lsnrctl status` 中可以看到，此处为 cdb1。

用户名为 sys，密码为前面使用 dbca 静默安装时设置的。

## 4、OCI 和 SQLPlus 配置

如果出现了 OCI 导致的连接问题可以去官网下载对应数据库版本的 instant-client。

由于连接 Oracle 数据库要求本地也拥有 Oracle 环境，但是完整的 Oracle 数据库配置太大，此时可以选择一个轻量级的 Oracle 客户端，也就是 `instant-client`。

Navicat 自带的有，但是不能保证和开发者配置的 Oracle 版本匹配，如果不匹配就会出现连接失败的问题，此时可以下载对应版本的 OCI 并修改 Navicat 配置，注意配置后需要重启 Navicat。

下载地址：https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html

在这个下载页面中找到和 Oracle 数据库版本对应的 `instant-client` 的 Basic 包，以及 `SQL*Plus` 包

解压到某个目录，然后在 Navicat 的菜单中工具 -> 选项 -> 环境中进行配置：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220412224453.png)

注意配置成功后需要重启 Navicat。

重启后再次连接 Oracle 数据库，按下键盘 `F6` 弹出 sqlplus 界面：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220412224735.png)



## 5、MobaXterm SSH 长连接

菜单栏 Settings，打开里面的 Configuration，在弹出的对话框中找到 SSH 配置栏中的 SSH settings，勾选其中的 `SSH keepalive` 选项，这样就可以保持长连接了。