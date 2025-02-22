---
title: Deploy k8s cluster on CentOS7
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20221003170443.png'
coverImg: /img/20221003170443.png
cover: false
toc: true
mathjax: false
date: 2025-02-22 14:05:11
summary: "Deploy k8s cluster on CetnOS7 virtual machine."
categories: "k8s"
keywords: "k8s"
tags: "k8s"
---

# K8S Cluster

# 环境

两台虚拟机：

* 192.168.200.102（k8s master）8G 6 core
* 192.168.200.103（k8s node）4G 2 core

系统镜像：CentOS-7-x86\_64-DVD-2009.iso



两台虚拟机提前做好各类配置，安装好 docker 环境。



# 安装

## 组件说明

参考：https://kubernetes.io/docs/concepts/overview/components/

kubernetes cluster 由几个一个 control plane 和多个 worker nodes 构成：

控制面核心组件：

* [kube-apiserver](https://kubernetes.io/docs/concepts/architecture/#kube-apiserver)          k8s 核心组件，对外暴露 http api，也是 control plane 的前端；
* [etcd](https://kubernetes.io/docs/concepts/architecture/#etcd)                            分布式的键值对存储服务，用来保存集群的数据，保证数据一致性和高可用；
* [kube-scheduler](https://kubernetes.io/docs/concepts/architecture/#kube-scheduler)         负责将 Pod 调度到合适的节点上运行；
* [kube-controller-manager](https://kubernetes.io/docs/concepts/architecture/#kube-controller-manager)        运行各种 controller 来实现 kubernetes api 的行为；
* [cloud-controller-manager](https://kubernetes.io/docs/concepts/architecture/#cloud-controller-manager) (optional)       



Worker Node 组件（可以运行在所有的 node 上，可以提供 k8s 运行时环境并且管理 pod）：

* [kubelet](https://kubernetes.io/docs/concepts/architecture/#kubelet)                      保证 pod 能正常运行；
* [kube-proxy](https://kubernetes.io/docs/concepts/architecture/#kube-proxy) (optional)          维护 node 的网络规则，从而实现 service 抽象；
* [Container runtime](https://kubernetes.io/docs/concepts/architecture/#container-runtime)          负责运行容器的软件，比如说 docker；



Your cluster may require additional software on each node; for example, you might also run [systemd](https://systemd.io/) on a Linux node to supervise local components.

> 安装

文档中给出学习环境和生产环境的安装方式：

* Learning environment：https://kubernetes.io/docs/tasks/tools/
* Production environment：[https://kubernetes.io/docs/setup/production-environment](https://kubernetes.io/docs/setup/production-environment/)



由于 k8s 集群内部通信都需要证书，在学习时管理证书的成本较高，因此我们使用 kuberadm 来部署集群，它可以自动生成和管理证书。



## Container Runtimes

首先每台机器上需要安装容器的运行时环境，这样才可以正常运行 Pod，k8s 平台通过 CRI（Container Runtime Interface）同具体的运行时环境交互。

CRI 是一种插件接口，它允许 kuberlet 工具通过统一的接口来使用各种 container runtimes，这种插件化的架构允许切换各种实现且不需要重新编译集群组件。

关于 container runtimes 可以参考：https://kubernetes.io/docs/setup/production-environment/container-runtimes/

一些常用的 container runtimes：

* [containerd](https://kubernetes.io/docs/setup/production-environment/container-runtimes/#containerd)
* [CRI-O](https://kubernetes.io/docs/setup/production-environment/container-runtimes/#cri-o)
* [Docker Engine](https://kubernetes.io/docs/setup/production-environment/container-runtimes/#docker)
* [Mirantis Container Runtime](https://kubernetes.io/docs/setup/production-environment/container-runtimes/#mcr)

有一点值得注意：k8s 在 v1.24 之前通过 dockershim 这个组件直接集成 docker，而不是通过 CRI。从 k8s v1.20 的时候就宣称要在后续移除 dockershim 了。

本文会使用 Docker Engine 作为 Container Runtime。



## Prerequisites

### 1、网络配置

通常情况下 Linux 不允许 IPv4 数据包转发。IPv4 数据包转发是指将从一个网络接口接收到的数据包转发到另一个网络接口的功能。这个功能通常用于路由器或网关设备，但在普通的 Linux 主机上默认是关闭的。

可以通过以下指令检查是否开启此功能：

```shellscript
> sysctl net.ipv4.ip_forward
net.ipv4.ip_forward = 0
```

0 表示 IPv4 转发已被禁用，1 表示启用，因为类似 k8s 的容器化平台需要实现同节点容器之前的通信，所以需要开启这个功能，编辑 `/etc/sysctl.conf` 文件：

```shellscript
[root@localhost ~]# cat <<EOF | tee /etc/sysctl.conf 
> net.ipv4.ip_forward=1
> EOF
net.ipv4.ip_forward=1

# 无需重启使配置生效
[root@localhost ~]# sysctl --system
```





### 2、cgroup drivers

在 Linux 系统上 `control groups` 通常用来限制分配给进程的资源。而 kubelet 工具和底层的 container runtime 都需要使用 control groups 来实现 pods 和 containers 的资源管理功能，比如说 cpu 和内存。

kubelet 和 container runtimes 通过 `cgroup driver` 来使用 control groups，并且两者必须使用相同的 cgroup driver，配置也要一样。

有两种 cgroup driver 可以使用：

* [cgroupfs](https://kubernetes.io/docs/setup/production-environment/container-runtimes/#cgroupfs-cgroup-driver)
* [systemd](https://kubernetes.io/docs/setup/production-environment/container-runtimes/#systemd-cgroup-driver)

默认情况下 kubectl 会使用 cgroupfs 作为 cgroup driver，通过 cgroup filesystem 来配置 cgroups；

如果系统初始化是通过 systemd 来做的，那就不推荐使用 cgroupfs，因为 systemd 要求系统只存在一个 cgroup manager，我们使用 CentOS 7 作为虚拟机系统，默认就是使用 systemd，因此需要修改 k8s 的相关配置，将 systemd 作为 kubelet 和容器运行时的 cgroup driver。

后面再进行配置，官方给的例子是编辑 kubelet 的配置文件，把 cgroupDriver 选项的值改为 systemd：

```
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
...
cgroupDriver: systemd
```

注意：从 k8s v1.22 开始，通过 kubeadm 创建 k8s 集群，如果没有设置 cgroupDriver，那 kubeadm 会默认将其置为 systemd。

将 systemd 作为 kubelet 的 cgroup driver 后，也需要修改 container runtime 的配置，参考使用的 container runtime 的文档来进行配置，比如：

* [containerd](https://kubernetes.io/docs/setup/production-environment/container-runtimes/#containerd-systemd)
* [CRI-O](https://kubernetes.io/docs/setup/production-environment/container-runtimes/#cri-o)

在 Kubernetes 1.32 中，启用 `KubeletCgroupDriverFromCRI` 特性门后，且容器运行时支持 `RuntimeConfig` CRI RPC 时，kubelet 会自动从运行时中检测合适的 cgroup 驱动，并忽略 kubelet 配置中的 `cgroupDriver` 设置。



### 3、Container Runtimes

这里使用 Docker 作为容器运行时环境，cri-dockerd 作为 k8s 和 docker 之间的 adapter，让 k8s 能够使用 CRI 调用 cri-dockerd 进而操作 docker，cgroup driver 使用 systemd。

关于 k8s 对 docker 的支持：

* k8s v1.20 开始不推荐使用 dockershim 组件；
* k8s v1.24 正式移除 dockershim 组件，不再支持直接使用 docker 作为容器运行时；
* 从 k8s v1.24 开始如果要用 docker 作为容器运行时，就需要通过 cri-dockerd 来桥接 docker 和 k8s；

#### Docker 安装

参考：https://naivekyo.github.io/2025/01/29/docker-quick-start/



注意如果使用的是国内云平台服务器，最好还是配置平台提供的镜像下载加速地址，其他的公开的镜像加速平台不知道为啥现在都不提供服务了，其他小的平台不一定可靠。有条件的用梯子直接开 TUN 模式代理流量就完事了。



装好了后看下默认的 cgroups 配置：

```shellscript
> docker info | grep group
 Cgroup Driver: cgroupfs
 Cgroup Version: 1

# 切换为 systemd, 需要修改 daemon.json 文件, 没有这个文件就创建
> vim /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"]
}

# 保存后重新加载
> systemctl daemon-reload
> systemctl restart docker

# 验证
> docker info | grep group
 Cgroup Driver: systemd
 Cgroup Version: 1
```



#### cri-dockerd 安装

参考：

* https://mirantis.github.io/cri-dockerd/usage/install/
* https://github.com/Mirantis/cri-dockerd
* https://github.com/Mirantis/cri-dockerd/releases
* https://mirantis.github.io/cri-dockerd/usage/using-with-kubernetes/



有个注意事项就是从 cri-dockerd 0.2.5 之后，默认的网络插件是 CNI。kubernetes 1.24+ 就已经移除了 kubnet 及其他构成 dockershim 组件的网络插件，为了能让集群正常运行，我们需要安装其他网络插件比如 Calico, Flannel, Weave,  或者其他 CNI。

注：[CNI](https://github.com/containernetworking/cni) （The Container Network Interface），大部分 Container Runtimes 都会使用 CNI 插件来管理它们的网络。



cri-dockerd 和 k8s 版本是具有对应关系的，可以参考 cri-dockerd 的 GitHub release 发布页面说明。

由于使用的虚拟机系统镜像是 CentOS7，因此选择 cri-dockerd v0.3.14，下载 cri-dockerd-0.3.14-3.el7.x86\_64.rpm 文件上传到虚拟机：

（注：不知道为什么这里用 rpm 安装后没有自动注册 service，网上很多用的是 install manual 的方式，直接下载源码编译安装的，但是需要 GO 环境）

```shellscript
# 安装服务
> yum install cri-dockerd-0.3.14-3.el7.x86_64.rpm

> cri-dockerd --version
cri-dockerd 0.3.14 (683f70f)

> cri-dockerd --buildinfo
Program: cri-dockerd
Version: 0.3.14 (683f70f)
GitCommit: 683f70f
Go version: go1.21.9

> find / -name "cri-dockerd" 2>/dev/null 
/usr/bin/cri-dockerd

# 如果没有发现 cri-dockerd 的 service 配置, 可以手动创建
> systemctl status cri-dockerd

# 手动创建
> vim /etc/systemd/system/cri-dockerd.service
[Unit]
Description=CRI-O Runtime Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/cri-dockerd
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# 保存文件后重载 systemd 配置
> systemctl daemon-reload
# 启动服务
> systemctl enable --now cri-docker.socket
> systemctl start cri-dockerd
```

对于 cri-dockerd，默认情况 CRI socket 是 /run/cri-socket.sock。



### 4、Network Plugin

有了 container runtime 后，集群还需要一个网络插件：

* https://kubernetes.io/docs/concepts/cluster-administration/networking/#how-to-implement-the-kubernetes-network-model

安装网络插件：

* https://kubernetes.io/docs/concepts/cluster-administration/addons/#networking-and-network-policy

大规模复杂集群推荐使用 [Calico](https://www.tigera.io/project-calico/)，我们本地部署测试可以用 [Flannel](https://github.com/flannel-io/flannel#deploying-flannel-manually)。

后面创建好集群后，可以通过命令配置网络插件，启动一个单独的 pod 为业务容器提供网络功能。



## Installing Kubernetes with deployment tools

https://kubernetes.io/docs/setup/production-environment/tools/

使用 kubeadm 工具，参考：https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/

目前最新的 k8s 版本是 v1.32；



### 修改 hostname

```shellscript
> hostnamectl set-hostname k8s-master
> init 6

> hostnamectl set-hostname k8s-worker
> init 6
```



### 准备工作

有一些要求：

* k8s 针对 Debain 和 Red Hat Linux 发行版的支持比较好；
* 至少 2GB 的内存；
* 控制面节点需要至少 2 个 CPU 核；
* 集群的所有机器网络环境都是通的；
* 每个节点都有独立的 hostname、mac 地址、product\_uuid ；
* 节点防火墙需放开特定端口；



### 端口开放



端口开放：https://kubernetes.io/docs/reference/networking/ports-and-protocols/

根据文档说明的，分别在控制面 node 和 worker node 上放开对应的端口。



control plane 节点：

```shellscript
[root@localhost system]# firewall-cmd --zone=public --add-port=6443/tcp --permanent
success
[root@localhost system]# firewall-cmd --zone=public --add-port=10250/tcp --permanent
success
[root@localhost system]# firewall-cmd --zone=public --add-port=10259/tcp --permanent
success
[root@localhost system]# firewall-cmd --zone=public --add-port=10257/tcp --permanent
success
[root@localhost system]# firewall-cmd --zone=public --add-port=2379-2380/tcp --permanent
success
[root@localhost system]# firewall-cmd --reload
success
[root@localhost system]# firewall-cmd --list-port
6443/tcp 10250/tcp 10259/tcp 10257/tcp 2379-2380/tcp
```



worker node 节点：

```shellscript
[root@localhost system]# firewall-cmd --zone=public --add-port=10250/tcp --permanent
success
[root@localhost system]# firewall-cmd --zone=public --add-port=10256/tcp --permanent
success
[root@localhost system]# firewall-cmd --zone=public --add-port=30000-32767/tcp --permanent
success
[root@localhost system]# firewall-cmd --reload
success
```

除了这些端口外，集群使用的网络插件可能也需要放开特定端口，这个根据使用的插件的文档来放开就行。



### Swap Configuration

如果机器节点开启了 swap memory 功能，那 kubelet 是没法启动的，要么禁用这个功能要么改 kubelet 的配置允许系统开启内存交换。

* kubelet 允许 swap memory，可以在 kubelet 的配置中添加 `failSwapOn: false` ，或者作为命令行参数。参考：https://kubernetes.io/docs/concepts/architecture/nodes/#swap-memory
* 禁用 swap memory 功能：

```shellscript
# 临时禁用
> sudo swapoff -a

# 永久禁用, 需重启机器
> vim /etc/fstab
# 注释掉类似这样的内容
#/dev/mapper/centos-swap swap                    swap    defaults        0 0
> init 6
```



### Container Runtime

要在 Pods 中运行容器，kubernetes 需要使用 container runtime。

默认情况下，kubernetes 使用 Container Runtime Interface（CRI）同我们选择的 container runtime 交互，如果没有声明 runtime，kubeadm 会通过自动检测一系列已知的 endpoint 来发现安装的 runtime。

如果没有找到 container runtime 或者找到多个，那 kubeadm 会抛出一个 error 并询问用户要使用什么运行时环境。

下表展示了 k8s 支持的操作系统上的已知的 endpoints：

| Runtime                          | Path to Unix domain socket                 |
| -------------------------------- | ------------------------------------------ |
| containerd                       | unix:///var/run/containerd/containerd.sock |
| CRI-O                            | unix:///var/run/crio/crio.sock             |
| Docker-Engine（using cri-dockerd） | unix:///var/run/cri-dockerd.sock           |

### Install kubeadm, kubelet and kubectl

所有机器上都需要安装这三个 package：

* kubeadm：启动集群的命令；
* kubelet：集群所有节点上都需要运行的组件，用来启动 pods 和 containers；
* kubectl：同集群通信的命令行工具；

kubeadm 并不会自动安装和管理 kubelet、kubectl，所以我们需要保证这几个工具的版本要和我们创建的 k8s 集群的版本一一对应。如果版本没法兼容，会出现问题。

For more information on version skews, see:

* Kubernetes [version and version-skew policy](https://kubernetes.io/docs/setup/release/version-skew-policy/)
* Kubeadm-specific [version skew policy](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#version-skew-policy)

由于使用的是 CentOS7，因此可以参考 Red Hat-based distributions 教程：


1、把 SELinux 设置为 permissive 级别：

这段指令适用于 kubernetes 1.32

```shellscript
# Set SELinux in permissive mode (effectively disabling it)
sudo setenforce 0
sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
```

注意：将 SELinux 级别设置为 permissive 是为了允许容器访问宿主机的 filesystem，比如某些网络插件实现就需要这么干。



2、添加 kubernetes 的 yum 仓库

仓库文件中写的 exclude 参数能够在运行 yum updates 命令时不升级和 k8s 相关的包，这是因为升级 k8s 有特殊的流程，yum updates 会影响到 k8s。

注意这段命令只包含 k8s v1.32 版本涉及到的包：

```shellscript
# This overwrites any existing configuration in /etc/yum.repos.d/kubernetes.repo
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.32/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.32/rpm/repodata/repomd.xml.key
exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni
EOF
```



3、安装 kubeadm、kubelet、kubectl

控制面节点：

```shellscript
sudo yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
```



4、（可选）启动 kubeadm 后自动运行 kubelet 服务

```shellscript
sudo systemctl enable --now kubelet
```



### 配置 cgroup driver

container runtime 和 kubelet 都需要 cgroup driver。

参考：https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/configure-cgroup-driver/

为啥用 systemd 作为 cgroup driver 更好一些呢？因为 kubeadm 是作为一个 systemd service 来管理 kubelet 的。

注意：从 v1.22 开始，如果用户没有显式配置 KubeletConfiguration 的 cgroupDriver 属性，kubeadm 默认会使用 systemd，在 Kubernetes v1.28 中，您可以将自动检测 cgroup 驱动程序作为 alpha 特性启用。更多信息请参见 systemd cgroup 驱动程序。

前面装 docker 后已经把 cgroup driver 改成 systemd 了，而 cri-dockerd 也是通过 systemd 启动的服务。 

后面使用 kubeadm init 创建集群时可以传递相关参数指定 kubelet 的 cgroup driver 配置。



## 使用 kubeadm 创建集群

参考：https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/

文档中提到：

* 组件安装；
* 网络配置；
* 如果 kubeadm init 下载 image 失败了，可以提前下载 k8s 组件 image，毕竟默认情况是需要访问外网的；
* 初始化 control plane 节点；
* ......
* 添加 worker node 到 cluster
* ......



参考：https://kubernetes.io/docs/reference/setup-tools/kubeadm/

包含 kubeadm 的使用方法。



使用 kubeadm，我们可以创建最小可运行的 k8s 集群来进行各种学习测试，它能满足这些需求：

* 初学者可以使用 kubeadm 快速创建一个集群，非常简单；
* 如果已经用过 k8s，那也可以用它测试一些自动化配置；
* 其他的软件生态可以接入 k8s，将其作为一个 building block；





TODO



## 安装 Dashboard web 组件



TODO





# 参考

* https://kubernetes.io/docs/home/
* https://kubernetes.io/releases/download/
* https://kubernetes.io/docs/setup/production-environment/container-runtimes/

安装教程：

* https://medium.com/@sagar.fale/install-k8s-1-27-x-cluster-on-cent-os-1562eabb08f
* https://www.cnblogs.com/grey-wolf/p/18268158
