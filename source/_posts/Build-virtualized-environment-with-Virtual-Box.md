---
title: Build virtualized environment with Virtual-Box
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425111634.jpg'
coverImg: /img/20220425111634.jpg
cover: false
toc: true
mathjax: false
date: 2025-01-29 16:23:36
summary: "build virtualized environment with Virtual-Box."
categories: "Virtual Box"
keywords: "Virtual Box"
tags: "Virtual Box"

---

# 虚拟化环境

## 环境

软件：VirtualBox 7.1.4

镜像：CentOS-7-x86\_64-DVD-2009.iso

网络环境：Host-only mode + NAT 双网卡



## 关于虚拟机网络

Vitrual Box 用户手册中提到不同网络模式支持的功能：


![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/2025/01/20250129162937.png)

Vitrual Box 和宿主机使用 Host-only 模式时，只支持虚拟机和宿主机、虚拟机和虚拟机之间的双向通信，并不支持访问外部网络，如果需要虚拟机连接网络，可以另外配置一块 NAT 网卡，双网卡（Host-Only + NAT）可以支持所有功能；



在 Vitrual Box 工具 -> 网络模块下配置双网卡

> Host-Only 网络

点击新建创建网卡，选择手动配置网卡（根据需要也可以选择自动分配）：

网卡 ip：192.168.200.100，掩码：255.255.0.0

启用 DHCP 功能：

DHCP 地址：192.168.200.1

设置各虚拟机自动分配 ip 地址范围：192.168.200.100 - 192.168.200.200



> NAT 网络

创建一个 NAT 网卡即可，无需额外配置，如果要实现宿主机同网络内的其他机器需要访问宿主机内的虚拟机，则可以选择配置端口转发。



## 虚拟机配置

### 安装系统

新建虚拟机，挂载系统光驱，修改网络配置，网卡 1 选择刚刚配置的 Host-Only 网络，网卡 2 选择刚刚配置的 NAT 网络，移除无用的硬件配置，比如 usb，为虚拟机分配系统资源，如内存、CPU 核、硬盘资源，最后启动虚拟机进入安装页面安装光驱对应的系统，按照步骤安装即可；

（Note：安装 CentOS7 系统时，可以选择安装特定模板安装系统及相关依赖，这里选择使用最小安装，后面需要什么工具再装什么工具）

安装系统时会配置 root 用户密码，也可以选择创建新的用户，这里启动系统后使用 root 账户登录：

```shellscript
# 输入命令查看网卡
ip addr
```

可以看到 lo、enp0s3、enp0s8 （或其他标识符，不一定是 s3、s8）三块网卡，分别对应本地回环网络、Host-Only、NAT。



### 配置网络

现在网络功能还是不可用的，根据需要可以选择使用 DHCP 自动分配网址，也可以静态配置，因为前面我们使用的是手动配置的 Host-Only 网络，这里也选择配置静态 ip，方便后续使用 ssh 工具连接虚拟机；

根据系统类型找到网络配置文件，以 CentOS7 为例：

```shellscript
# 进入网卡文件目录
cd /etc/systemconfig/network-scripts/
# 编辑相关网卡
vi ifcfg-enp0s3
vi ifcfg-enp0s8
```

enp0s3 配置如下：

```shellscript
# 修改部分配置，新增 ip 配置
# 由 dhcp 切换为 static
BOOTPROTO=static
# 系统启动时自动启用网络服务
ONBOOT=yes

# 新增 ip 配置，记得和 virtual box 的host-only 网络手动配置的网段一致
IPADDR=192.168.200.101
# 掩码使用 18 位, 方便同网段虚拟机通信
NETMASK=255.255.255.0 
```

如果没有发现其他网卡文件，比如 enp0s8，则可以创建一个文件，使用 nmcli 命令管理网络：

```shellscript
# 生成新的网卡文件, 名字要和我们在 ip addr 中看到的网卡名一致, 比如这里应该写 enp0s8
nmcli connection add type ethernet ifname enp0s8 con-name enp0s8

# 查看所有网络
nmcli connection show

# 修改新的网卡配置, 由于我们的 enp0s8 对应 NAT 网络, 所以改为 dhcp 就行
vim ifcfg-enp0s8

# 修改内容
BOOTPROTO=dhcp

# 最后重启网络服务
systemctl restart network
# 查看网络状态
systemctl status network
```

测试虚拟机和宿主机能否双向通信，虚拟机能否连接互联网。

```shellscript
# 使用 ping 命令测试
# 虚拟机中
ping ${宿主机 id: 例如 windows 中使用 ipconfig 看 ip}
```

如果无法实现虚拟机、宿主机双向通信，则可以先关机，检查 Virtual Box 中目标虚拟机的网络配置中是否使用了双网卡，比如网卡 1 使用 Host-Only 网络，网卡 2 使用 NAT 网络，相关的网络名称和 Virtual Box 网络配置下的一致。



### 下载软件

默认的 yum 的 repo 使用的是官网的，可能会无法解析域名或无法访问，可以选择使用国内的镜像：

```shellscript
# 进入 yum 配置目录
cd /etc/yum.repos.d

# 备份默认的配置, 下载阿里云提供的配置文件
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo

# 清除 yum 缓存
yum clean all
yum makecache
```

下载软件，比如 vim，net-tools

```shellscript
yum install -y vim
yum install -y net-tools
```



### SSH 连接

在宿主机上可以使用相关工具通过 ssh 连接虚拟机，比如使用 Tabby；

虚拟机中需开启 ssh 配置：

```shellscript
# 查看系统是否安装有 ssh 服务
systemctl status sshd

# 如果没有可以下载
yum install openssh-server
systemctl start sshd

# 如果已经安装了，则进入配置目录
cd /etc/ssh/
# 备份原始配置文件，修改相关配置
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
vim /etc/ssh/sshd_config
# 打开注释, 允许 root 用户登录
PermitRootLogin yes

# ssh 默认占用端口 22, 如果要改可以加配置
Port 22
```

如果宿主机使用 ssh 连接虚拟机非常慢，则可以禁用 ssh 服务的特定功能，修改 sshd\_config 配置文件：

```shellscript
# 禁用反向解析宿主机主机名
UseDNS no
# 不禁用 dns 的话可以配置国内常用的 dns, 比如阿里云的
vim /etc/resolv.conf
# 注释掉其中两个, 换成
nameserver 223.5.5.5
nameserver 223.6.6.6

# 禁用 GSSAPI 认证
GSSAPIAuthentication no
```

最后注意：之前配置网卡时没有配 DNS 地址，可以考虑在 /etc/resolve.conf 中加入常用的 DNS 服务器地址，根据需要调整 SELinux 配置。ssh 连接也可以使用密钥认证。如果需要暴露端口可以通过防火墙命令处理。

