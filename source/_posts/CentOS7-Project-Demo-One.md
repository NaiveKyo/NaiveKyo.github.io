---
title: CentOS7 Project Demo One
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/banner/2.jpg'
coverImg: /medias/banner/2.jpg
toc: true
date: 2021-09-08 22:24:07
top: false
cover: false
summary: 鲲鹏实训第一期，lamp 环境搭建
categories: Linux
keywords: [Linux, ROC, Apache, PHP, MariaDB, Discuz]
tags: Linux
---



## 一、CentOS7 安装图形界面

先提一下 yum 提供的两种安装软件的方式：

- yum install：安装单个软件。以及这个软件的依赖关系
- yum groupinstall：安装一个安装包，这个安装包包含了很多单个软件，以及单个软件的依赖关系

比如说安装 mysql：

- yum install mysql
- yum groupinstall "MySQL Database"

上面两个都可以

如果想查看单个软件的安装，yum info 软件名

MySQL Database 这个安装包中包括了 mysql、mysql-server、mysql-bench 等等





> yum 的群组功能

- yum [群组功能] [软件群组]
  - grouplist：列出所有可使用的  "软件群组"，例如 Development Tools 之类的
  - groupinfo：后面接 group_name，则可以了解该 group 内含有的所有软件名
  - groupinstall：安装一整组的软件
  - groupremove：移除某个软件群组



```bash
# 以 root 用户安装 X Window System
yum groupinstall "X Window System"

# 查看已经安装的和可以安装的软件群组
yum grouplist

# 安装 GNOME Desktop
yum groupinstall "GNOME Desktop" "Graphical Administration Tools"

# 进入图形界面
startx
# 或者 init 6 等价于 systemctl isolate graphical.target
init 6 
# 切换回来 init 3 等价于 systemctl isolate multi-user.target

# (可选)：设置开机自动进入图形界面
systemctl set-default graphical.target
```



## 二、服务器支持



```bash
# 安装 httpd
yum install -y httpd
systemctl restart httpd
systemctl enable httpd
```



当我们安装完成 httpd 后，/var/www/html 这个文件夹就会出现，我们可以在里面写一些 html，可以直接通过浏览器访问：

比如 /var/www/html/index.html



## 三、远程访问



### 1、修改主机名和 ip 地址

我们有一台虚拟机后，可以创建它的链接克隆



以 root 用户分别登录两台虚拟机

给克隆的那台主机更改主机名和 ip 地址（推荐使用命令而不是配置文件）

```bash
# 更改主机名
hostnamectl set-hostname cloneB
# 更改系统的网络配置：两种方式
# 直接修改配置文件
vim /etc/sysconfig/network-scripts/ifcfg-ens32


# 通过 nmcli 命令
# 查看所有网卡
nmcli connection show
# 查看指定网卡的详细信息
nmcli connection show ens32
```

详细信息有很多，我们主要改下面几个：

- connecton.autoconnect [yes|no]：开机是否自动启动这个连线，默认通常是 yes
- ipv4.method [auto|manual]：自动还是手动设置网络参数
- ipv4.dns [dns_server_ip]：填写 DNS 的 ip 地址
- ipv4.address [IP/Netmask]：就是 IP 和 netmask 的集合，中间用斜线 / 来隔开
- ipv4.gateway [gw_ip]：就是 gateway 的 IP 地址



查看网关的方式：

```bash
netstat -n
route -n
ip route show
```



查看 dns：

```bash
cat /etc/resolv.conf
# 解析一个网站
nslookup www.baidu.com
dig | grep SERVER
```



开始修改：

```bash
[root@cloneb ~]# nmcli connection modify ens32 \
> connection.autoconnect yes \
> ipv4.address 192.168.137.201/24 \
> ipv4.method manual \
> ipv4.gateway 192.168.137.254 \
> ipv4.dns 114.114.114.114

# 使配置生效
nmcli connection up ens32
# 如果是修改配置文件的，最后需要重启网络服务才可以生效
```



上面是采用 static 配置 IP 的方式，如果我们采用 DHCP，只需要改上面的 ipv4.method ，改成 auto 就行了



现在我们的两台虚拟机配置如下：

| 主机名   | ip              |
| -------- | --------------- |
| naivekyo | 192.168.137.200 |
| cloneb   | 192.168.137.201 |



### 2、ssh 远程访问



在主机以 root 身份远程访问 cloneb

```bash
ssh root@192.168.137.201
```

第一次访问需要输入 yes，并输入 root 的密码，就可以远程控制目标主机了



如果我想打开目标主机的 firefox，就需要以允许图形支持的模式去访问远程主机

```bash
ssh -X root@192.168.137.201

# 然后使用 
firefox

# 就可以在本机使用远程主机的浏览器资源了
```



ssh 默认使用的是 22 端口，如果我们想改变端口，可以这样做

```bash
# 修改 ssh 配置文件
vim /etc/ssh/ssh_config
# 可以看到 Port 22 默认是被注释的，我们可以为其指定端口
Port 8010

# 改变端口后需要设置防火墙 开放端口(两台机器都要)
firewall-cmd --zone=public --add-port=8010/tcp --permanent
# 如果还不行，可以试试开启服务
firewall-cmd --zone=public --add-service=ssh --permanent

# 以指定端口访问
ssh -p 8010 -X root@192.168.137.201
```



### 3、scp 远程复制文件

scp（source copy）用于在 Linux 下进行远程拷贝文件的命令。和它类似的是 cp，只不过 cp 只能在本机进行拷贝而不能跨服务器。



使用方式：

`scp -[pr] [-l 速率] file [账号]@主机:目录名` ：上传

`scp -[pr] [-l 速率] [账号]@主机:file 目录名` ：下载

选项与参数：

- -p：保留原本档案的权限数据
- -r：复制来源为目录时，可以复制整个目录 (含子目录)
- -l：可以限制传输的速度，单位为 Kbits/s ，例如 [-l 800] 代表传输速限 100Kbytes/s



例如：将本机的 /etc/hosts* 全部复制到 127.0.0.1 上面的 student 用户的家目录内

```bash
scp /etc/hosts* student@127.0.0.1:~
```



### 4、免密访问远程主机

现在每次访问远程主机都需要输入密码，有时候不太方便（比如集群环境下），



> ssh-keygen 常用参数

```bash
# 可以使用
man ssh-keygen
# 默认生成 2048 位 RSA 密钥
ssh-keygen
# 生成 4096 位 RSA 密钥
ssh-keygen -t rsa -b 4096
# 生成 521 位的 ECDSA 密钥
ssh-keygen -t ecdsa -b 521
# 私钥生成公钥
ssh-keygen -y -f [private-key-path] > [output-path]
# 例如：我们有一个私钥名为 id_rsa，可以利用它生成对应的公钥
ssh-keygen -y -f id_rsa > id_rsa.pub
```

选项说明：

- `-t` 指定生成密钥的类型，默认 RSA
- `-f` 指定生成密钥的路径，默认 `~/.ssh/id_rsa`（私钥 `id_rsa`，公钥 `id_rsa.pub`）
- `-P` 提供旧密码，空表示不需要密码（`-P ''`）
- `-N` 提供新密码，空表示不需要密码 (`-N ''`)
- `-b` 指定密钥长度（bits），默认是 2048 位
- `-C` 提供一个新注释，比如邮箱
- `-y` 读取 OpenSSH 格式私钥文件并将 OpenSSH 公钥输出到 std­out
- `-q` 安静模式

参考：https://www.ssh.com/academy/ssh/keygen





> 开始

1、生成一对 rsa 类型的公钥和私钥

```bash
# 进入 .ssh 目录
cd ~/.ssh/
# 打印，发现只有一个文件
ls
# 生成公钥和私钥
ssh-keygen -t rsa # 之后全部回车就可以了，不需要输入什么
# 打印可以看到默认的 id_rsa 和 id_rsa.pub
ls
```



2、将公钥拷贝到需要远程免密登录的机器上

```bash
# 使用 ssh-copy-id, 感兴趣可以 man ssh-copy-id
ssh-copy-id root@192.168.137.201
# 第一次使用需要输入目标账户的密码
# 此后以 root 身份远程访问 192.168.137.201 就不需要输入密码了
```



## 四、web 服务器



### 1、挂载

在 Linux 中我们先了解几个概念

- `/dev/sr0`：光驱的设备名
- `/dev/cdrom`：代表光驱
- cdrom 是 sr0 的软链接



我们可以创建一个空目录

```bash
mkdir /ded

[root@NaiveKyo ~]# mount /dev/cdrom /ded
mount: /dev/sr0 写保护，将以只读方式挂载
```



### 2、测试 httpd

在主虚拟机上我们之前安装了 httpd，现在：

```bash
vim /var/www/html/index.html # 顺便写点东西

# 访问
firefox 192.168.137.200
# 获取 index.html 的文本
curl 192.168.137.200
```



## 五、搭建 ftp 服务



>  安装  vsftpd 软件

老规矩安装软件、重启服务、设置开机自启

```bash
yum install -y vsftpd
systemctl restart vsftpd
systemctl enable vsftpd
systemctl status vsftpd

# 测试访问
firefox ftp:localhost
# 结果：浏览器显示 ftp 服务界面
```



## 六、安装 MariaDB

数据库就是用来存放数据的仓库

我们使用 MySQL 的开源分支数据库：Mariadb

yum 安装：

```bash
# 方式一
yum groupinstall "MariaDB"
# 方式二
yum install -y mariadb-server

# 重启服务
systemctl restart mariadb

# 登录数据库
mysql
```





官方安装说明：https://mariadb.com/kb/en/rpm/



数据库初始化：

```bash
mysql_secure_installation
```





## 七、安装 Discuz 社区

### 1、LAMP 环境搭建

LAMP 是Linux Apache MySQL PHP的简写，其实就是把Apache, MySQL以及PHP安装在Linux系统上，组成一个环境来运行php的脚本语言。



### 2、前置需求

- 安装 Apache 服务所需软件
- 安装 MariaDB 数据库
- 安装 PHP 运行环境
- 安装 Discuz



### 3、Apache 服务

```bash
# Apache 服务的主要提供者是 httpd
yum install -y httpd httpd-devel
# 启动设置开机自启

# 安装 APR(Apache Portable Runtime)
yum install -y apr apr-devel apr-util apr-util-devel
```

补充：Apr 的官方源码：https://apr.apache.org/



安装完之后 Linux 系统会注册一个系统用户和系统用户组都叫做 `apache`，该用户用于启动 httpd 服务（就和在安装 MySQL 时一样，MySQL 进程也是由名为 mysql 的系统用户管理的）



- Apache的主配置文件：/etc/httpd/conf/httpd.conf
- 默认站点主目录：/var/www/html/



`httpd.conf` 主要包含三部分：

- Global Environment---全局环境配置，决定Apache服务器的全局参数
- Main server configuration---主服务配置，相当于是Apache中的默认Web站点，如果我们的服务器中只有一个站点，那么就只需在这里配置就可以了。
- Virtual Hosts---虚拟主机，虚拟主机不能与Main Server主服务器共存，当启用了虚拟主机之后，Main Server就不能使用了

感兴趣可以自行搜索，我们现在只需要添加对 php 文件的支持就好了



在该文件中找到：`AddType application/x-gzip .gz .tgz`

在下面一行添加：`AddType application/x-httpd-php .php`



找到：

```xml
<IfModule dir_module>
    DirectoryIndex index.html
</IfModule>
```

改为：

```xml
<IfModule dir_module>
    DirectoryIndex index.html index.htm index.php
</IfModule>
```



最后重启服务



### 4、MariaDB 服务

```bash
yum install -y mariadb-server
# 设置启动和开启自启
```

给数据库 root 用户设置密码

```bash
mysqladmin -u root password '123456'

# 登录测试
mysql -u root -p123456
```





### 5、PHP 环境

```bash
# 查看所有 PHP 支持
yum groupinfo "PHP Support" 
# 安装基本的 PHP 支持
yum groupinstall "PHP Support"

# 将可选的安装包也装上
yum install -y php-ldap.x86_64
yum install -y php-mysql
yum install -y php-odbc.x86_64
yum install -y php-pecl-memcache.x86_64
yum install -y php-pgsql.x86_64 
yum install -y php-recode.x86_64
yum install -y php-soap.x86_64 
yum install -y php-xmlrpc.x86_64

# 安装管理PHP 进程池的软件
yum install -y php-fpm
# 重启服务设置开机自启
systemctl restart php-fpm.service
systemctl enable php-fpm.service
```



测试 php 环境是否可用：

```bash
vim /var/www/html/index.php
```



index.php:

```php
<?php
  phpinfo();
?>
```



保存文件，命令行输入：

```bash
firefox localhost
```

如果成功会自动跳出 php 的信息网页。



### 6、安装 Discuz

去官网下载安装包：https://gitee.com/Discuz/DiscuzX

将其上传到服务器：

```bash
unzip ./DiscuzX-master.zip
```

解压后将 DiscuzX-master 中的 upload 复制到 apache 根目录

```bash
cp -af ./DiscuzX-master/upload /var/www/html/
# 改个名
mv /var/www/html/upload /var/www/html/bbs
```



现在我们要做几件事：

- 由于我们要将该论坛发布到 apache 服务器上，所以需要将 bbs 的拥有者和群组交给 apache
  - `chown -R apache:apache /var/www/html/bbs`
- 关闭 Linux 的 selinux，由于 httpd 进程需要访问服务器资源，所以需要关闭 linux 的安全系统
  - `vvim /etc/selinux/config`
    - 将 SELINUX 改为 `SELINUX=disabled`
  - **重启服务器**

- 由于我们想在 windows 本机浏览器访问虚拟机，所以需要开放 80 端口
  - `firewall-cmd --zone=public --add-port=80/tcp --permanent`
  - `firewall-cmd --reload`
  - `firewall-cmd --list-port`



最后：浏览器输入：**虚拟机地址/bbs**

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210908220206.png)

选择全新安装；

数据库参数设置页面只需要填写数据库密码和管理员密码就可以了；

点击访问论坛；

登录管理员账户;

最终结果：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210908222033.png)

