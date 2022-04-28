---
title: VMware Workstation Build CentOS 7 System
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221652.jpg'
coverImg: /img/20220225221652.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-28 23:15:32
summary: "VMware 创建 CentOS 7 虚拟机"
categories: "Linux"
keywords: "Linux"
tags: "Linux"
---

# 在 VMware 中安装 CentOS 7 系统

资源：

- VMware Workstation 15 +
- CentOS 7 x86_64.iso

网络选择桥接模式，选择最小安装，创建新的虚拟机后：

```bash
# 启用网卡, 不同 Linux 发行版可能有所区别
echo ONBOOT=yes >> /etc/sysconfig/network-scriptes/ifcfg-ens32

# 修改时区
timedatectl -set-timezone Asia/Shanghi

# 更改主机名
hostnamectl set-hostname xxx

# 查看所有网卡
nmcli connection show
# 查看指定网卡的详细信息
nmcli connection show ens32
# 修改 ens32 网卡相关配置
nmcli connection modify ens32 \
> connection.autoconnect yes \
> ipv4.address 192.168.137.201/24 \
> ipv4.method manual \
> ipv4.gateway 192.168.137.254 \
> ipv4.dns 114.114.114.114

# 使配置生效
nmcli connection up ens32
# 如果是修改配置文件的，最后需要重启网络服务才可以生效

# 安装网络工具及 vim
yum install -y vim net-tools

# 修改 ssh 配置
vim /etc/ssh/sshd_confg
# 本地测试环境可以主要修改一下几项
Port 22 # 默认使用 22 端口，生产环境可更换为其他端口
PermitRootLogin yes # 运行 root 用户远程登录
PremitEmptyPasswords no # 不允许空密码登录
GSSAPIAuthentication no
```

## 虚拟机快照和克隆

## 1、快照

虚拟机中的快照就是对 `VMDK` 文件（虚拟机磁盘文件）某个时间点的 "拷贝"，这个 "拷贝" 并不是对 VMDK 文件的复制，而是保持磁盘文件和系统内存在该时间点的状态，并且快照是一个具有只读属性的镜像。

快照的作用类似于一个系统还原点，可以把虚拟机还原到创建快照时的状态



## 2、虚拟机克隆

虚拟机克隆分为 "完整克隆"（Full Clone）和 "链接克隆"（Linked Clone）两种方式。

克隆过程中，VMware会生成和原始虚拟机不同的MAC地址和UUID，这就允许克隆的虚拟机和原始虚拟机在同一网络中出现，并且不会产生任何冲突。

> VMware 完整克隆 Full Clone

完全克隆的虚拟机不依赖源虚拟机，是完全独立的虚拟机，它的性能与被克隆虚拟机相同。

由于完整克隆不与父虚拟机共享虚拟磁盘，所以创建完整克隆所需的时间比链接克隆更长。如果涉及的文件较大，完整克隆可能需要数分钟才能创建完成。完整克隆只复制克隆操作时的虚拟机状态，因此无法访问父虚拟机的快照。

> VMware 链接克隆 Linked Clone

依赖于源虚拟机（称为父虚拟机）。由于链接克隆是通过父虚拟机的快照创建而成，因此节省了磁盘空间，而且克隆速度非常快，但是克隆后的虚拟机性能能会有所下降。

对父虚拟机的虚拟磁盘进行的更改操作不会影响链接克隆，对链接克隆磁盘所做的更改也不会影响父虚拟机。但是如果父虚拟机损坏或快照点删除，链接克隆的虚拟机也不能使用；如果父虚拟机移动位置，需要重新指定父虚拟机的位置，再启动链接克隆虚拟机。

> 总结

如果是处于安全性和性能考虑，推荐使用完整克隆，如果没啥要求可以使用链接克隆。

克隆后可能用到两个命令：

- 完整克隆后自动生成 uuid 和 mac 地址，但是需要从 VMware 中查看配置然后写入到网络配置文件中。
- 也可以使用命令：`uuidgen` 生成，然后手动写入配置文件；
- 修改 ip 配置：`nmcli`