---
title: CentOS7 Deploy FTP Server
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425110354.jpg'
coverImg: /img/20220425110354.jpg
cover: false
toc: true
mathjax: false
date: 2022-07-30 17:08:16
summary: "CentOS7 部署 FTP 服务器"
categories: "Linux"
keywords: ["Linux", "FTP"]
tags: "Linux"
---

# 一、简介

FTP（File Transfer Protocol），主要用于传输数据，但是使用 FTP 传输时，数据是明文传输，存在一定的安全风险，为了更安全的使用 FTP，我们可以使用较为安全但是功能较少的 vsftpd 软件。

环境：

- 系统：CentOS 7；
- 软件：Vsftpd；
- 工具：MobaXterm 

# 二、安装

## 1、下载 vsftpd

查看本机是否已经配置了 ftp：

```bash
which vsftpd
# 如果显示了目录表明已经配置了 ftp 服务
```

安装：

```bash
# 安装 vsftpd
yum install vsftpd
# 安装后，查看 ftp 服务
systemctl status vsftpd
```

## 2、配置

参考：

- https://help.aliyun.com/document_detail/60152.html#section-wx4-1bx-kln
- https://docs.openeuler.org/zh/docs/21.03/docs/Administration/%E6%90%AD%E5%BB%BAFTP%E6%9C%8D%E5%8A%A1%E5%99%A8.html

更多信息请参考上述文档。

```bash
# 修改配置文件
vim /etc/vsftpd/vsftpd.conf

# 要修改的配置项
# 1. 禁止匿名用户访问
anonymous_enable=NO
# 禁止匿名用户上传文件
anon_upload_enable=NO
# 2. 允许本地用户登录
local_enable=YES
# 3. 允许使用 FTP 服务向服务器写入数据
write_enable=YES
# 4. 以 standalone 方式启动
listen=YES
# 5. 当开启 listen 后需要注释掉如下配置
# listen_ipv6=YES

# 要增加的配置项, 在文件末尾追加
# 1. 使用本地时间
use_localtime=YES
# 2. 开启被动模式(更安全)
pasv_enable=YES
# 被动模式下 FTP Servier 启用的随机端口(建议设置为较高的范围 >1024)
pasv_min_port=50000
pasv_max_port=50010
# 启用 TCP Warpper
tcp_wrapper=YES

# 设置某些账户不能访问 ftp 服务器
# 下面两个配置需要设置为 YES
userlist_enable=YES
userlist_deny=YES
# 这里指定该文件内定义的用户无法访问 vsftpd 服务器
userlist_file=/etc/vsftpd/user_list
```

接着修改可以使用 ftp 登录系统的用户，有两个文件需要修改：

- `user_list`：vsftpd 软件自身定义的拒绝访问的用户列表，和上面的配置有关；
- `ftpusers`：pam 模块验证 ftp 服务的拒绝用户列表；

```bash
# 注意 user_list 文件中存储的是不能使用 ftp 服务的用户, 如果要取消限制只需要删除对应的用户即可
vim /etc/vsftpd/user_list
# 比如如果要使用 root 用户登录, 删除配置文件的 root 即可
# 另外注意同目录下还有一个文件 ftpusers, 里面定义的也是拒绝访问的用户
vim /etc/vsftpd/ftpusers
# 如果要使用 root 登录, 也从该文件中移除 root 用户
```

最后修改 SELinux 中关于 ftp 的配置：

```bash
# 查看 ftp 配置
getsebool -a | grep ftp	
# 开放权限
# setsebool -P allow_ftpd_anon_write on # 这个是允许匿名用户写入数据
setsebool -P allow_ftpd_full_access on
```

## 3、启动 ftp 服务

```bash
# 切换到 root 用户
# 注意虽然是以 root 用户启动的, 但是 vsftpd 还是针对相关用户权限做了限制
# 开启服务
systemctl start vsftpd
# 设置开机自启
systemctl enable vsftpd
# 检测状态
systemctl status vsftpd
```

## 4、开放服务

```bash
firewall-cmd --zone=public --add-serivice=ftp --permanent
firewall-cmd --reload
firewall-cmd --list-services
```

## 5、测试连接

此处使用 Mobaxterm 测试，新建 ftp 连接，指定主机名、用户名、端口。

如果连接不上可以在 `Advanced Ftp settings` 中取消勾选 `Passive mode`。

# 三、分析

## 1、三种用户

FTP 服务中默认设置的有三种类型的用户：

- 实体账户（real user）；
- 访客（guest）；
- 匿名用户（anonymous）。

不同类型的用户所具有的权限也不一样，比如实体账户取得的权限较完整，可以进行更多的命令；对于匿名用户一般只提供下载资源的服务。

## 2、日志

FTP 会利用系统的 `syslogd` 来进行数据的记录，记录的数据包括用户曾经下达的命令和用户传输的数据（传输时间、传输大小等等），具体的日志文件在 `/var/log/` 下可以找到。

## 3、限制用户活动目录

FTP 提供了 `chroot()` 函数，意思是 `change root`，这里的 root 指的是家目录，为了避免使用 FTP 登录服务器的用户随意访问服务器资源，所以需要限制用户的活动范围，将其限制在家目录中，这样用户登录 FTP 服务器默认所在的位置就是家目录。



## 4、FTP 主动式连接

FTP 服务使用的是 TCP 协议，而且客户端和服务端连接的端口有两个，这是因为 FTP 要求一个端口用于传输命令，一个端口用于传输数据，具体的端口号又分为两种情况：

> 主动式（active）连接：

- 命令通道：
  - 客户端随机取一个大于 1024 以上的端口来与 FTP 服务端的 `port 21` 进行 TCP 连接，这个过程需要三次握手，形成连接后客户端就可以通过这个连接来对 FTP 服务端下达指令，包括文档查询、下载、上传等等命令。
- 数据通道：
  - 客户端在需要数据的情况下会告知服务器端要用什么方式来连接，如果是主动式（active），客户端会先随机启用一个端口，且透过命令通道告知 FTP 服务器这两个消息（主动式、端口号），并等待 FTP 服务端进行连接；
  - FTP 服务器收到两个消息后，"主动" 从 `port 20` 端口向客户端的指定端口进行 TCP 连接。

因此最终客户端和服务端建立了两条 TCP 通道，一条用于命令传输，一条用于数据传输，需要注意的是在主动式中，是 FTP 服务端主动向客户端请求数据通道连接的建立。

主动模式的两个注意点：

（1）客户端主动从随机端口向服务器端的 `port 21` 端口发起连接请求，建立命令传输连接通道；

（2）服务端主动从 `port 20` 端口向客户端的随机端口发送连接请求，建立数据传输连接通道。

当客户端和服务端都是使用公网 IP 时，是没有问题的，但是当客户端在内网中，位于防火墙后面，此时使用主动式 FTP 连接可能就会存在问题，通常来说，局域网一般都会使用防火墙的 NAT（网络地址转换）功能：

- 用户与服务端命令信道的建立：因为 NAT 会主动记录由内部向外部的联机信息，且命令通道的建立是由客户端向服务端联机的，因此这一联机可以顺利的建立起来；
- 用户与服务器间数据信道的建立，需要客户端首先将端口号信息通过命令通道发送给 FTP 服务器，且等待服务器端主动联机；
- 但是由于经过 NAT 的转换后，FTP 服务器只能够得知 NAT 的 IP 而不是客户端的 IP，因此 FTP 服务器会从 `port 20` 主动向 NAT 的端口发送主动联机的请求，但是客户端的 NAT 并没有启动相应的端口来监听 FTP 服务器的连接请求。

这就是问题的所在，在 FTP 的主动式联机当中，NAT 将会被视为客户端，这就造成了问题。如果我们在内网连接某些 FTP 服务器时，可能偶尔会发现明明连接上 FTP 服务器了（命令通道已经建立），但是就是无法取得文件名列表，那可能就是这个原因了。

> 两种解决方案

在主动式连接中可能会存在问题，此时有两种解决方案：

（1）防火墙开启 FTP 模块（防火墙开启 FTP 模块的本质还是通过内核的 `netfilter`实现）；

如果使用的是 `firewalld` 可以直接开放 FTP 服务，如果是之前的 `iptables` 则可以使用 `modprobe` 这个命令来加载 `ipconntrack_ftp` 以及 `ip_nat_ftp` 等模块，这几个模块会主动的解析 `目标是 port 21 的连接` 的信息，所以就可以得到客户端开启的随机端口号，此时如果接受到 FTP 服务器的主动连接，就可以将此连接转到内网正确的客户端。但是当我们要连接的 FTP 服务器的命令通道默认并非标准的 21 端口时，这两个模块就无法被顺利解析了。

（2）客户端被动式（`Passive`）联机方式。

## 5、FTP 被动式连接

- 用户和服务器建立命令通道：和主动式一样，客户端请求连接服务端 21 端口，经过三次握手后建立连接；
- 接着客户端发出 `PASV` 的联机要求：当有使用数据通道的时候，客户端可通过命令通道发出 `PASV` 的被动式联机要求（Passive 的缩写），并等待服务器响应；
- FTP 服务器启动数据端口，并通知客户端联机：如果你的 FTP 服务器是能够处理被动式联机的，此时 FTP 服务器会先启动一个端口监听（`port PASV`）。这个端口号可能是随机的，也可以自定义某一范围的端口，这个由 FTP 服务器软件决定。然后 FTP 服务器会通过命令通道告诉客户端已经启动的端口，并等待客户端的联机；
- 客户端随机取大于 1024 的端口进行连接：然后客户端收到服务端的端口信息后，会随机取用一个大于 1024 的端口号来对主机的 `port PASV` 进行联机。如果一切顺利，FTP 数据就会通过 `port PASV` 来传输。

不同之处：被动式 FTP 数据通道的联机方向是由客户端向服务端发起数据通道联机请求。这样，在 NAT 内的客户端主机就可以顺利连接上 FTP Server 了。但是，如果 FTP 主机也是在 NAT 后该怎么办？这里就牵涉到更深入的 `DMZ` 技巧了。

在 PASV 模式下，服务器在没有特别设定的情况下，会随机选取大于 1024 的端口来提供客户端连接，如果该端口被黑客攻击，我们很难追踪，这个时候可以通过 `passive ports` 配置来限定服务器启动 `port number`。

## 6、对比两种模式

经过前面的分析，可以简单总结两种模式的异同：
（1）相同之处：命令通道的建立是一样的，FTP Server 选取 `port 21` 端口，客户端选取大于 1024 的随机端口；

（2）不同之处：数据通道的建立不一样：

- 主动式：客户端通过命令通道向 FTP Server 发起数据通道连接请求，传输的数据包括两部分，包括主动式连接请求命令及端口信息，然后 FTP Server 通过 `port 20` 端口向客户端的指定端口发起连接请求，
- 此过程中，当客户端在 NAT 后面时可能会存在问题，可以通过配置防火墙，使其放行 FTP 相关的端口连接请求；
- 被动式：客户端通过命令通道向 FTP Server 发送 PASV 命令（被动式连接）， FTP Server 收到该命令后会监听一个随机端口，并将端口号通过命令通道响应给客户端，然后客户端也会启用一个随机端口同服务端开启的端口建立连接，这样数据通道就成功建立了。
- 此过程中，当 FTP Server 在 NAT 后面的时候也可能会出现问题，解决思路是配置 Linux 的 DMZ 功能（防火墙配置相关功能）。

## 7、FTP 服务器注意事项

除了 vsftpd 以外，SSH 也提供了较为安全的 FTP，就是 ssh 提供的 vsftp-server，它的最大优点就是，在上面传输的数据是经过加密的，但是比较可惜的是它只有命令行界面。

如果真的要架设 FTP 服务器需要注意：

- 及时更新 FTP 软件版本，确保无漏洞；
- 善用 iptables 来规范可以使用 FTP 的网域；
- 善用 TCP_Wrappers 来规范可以登录的网域；
- 善用 FTP 软件的相关配置来限制使用 FTP 服务器的使用者的不同权限；
- 使用 Super daemon 来进阶管理 FTP 服务器（前面默认使用的是 CentOS 7 的 standalone mode）；
- 注意用户的家目录，以及匿名用户登录的目录的权限；
- 若不对外公开，可以考虑修改 FTP 的 port；
- 也可以使用 FTPS 这种加密的 FTP；

