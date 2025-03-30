---
title: Deploy Jenkins software on CentOS7
published: 2025-02-18
description: "Deploy Jenkins software on CentOS7."
image: './20220918190943.jpg'
tags: ["Jenkins", "CI/CD"]
category: "Jenkins"
draft: false
lang: 'zh'
---

# Jenkins

# 环境配置

暂不考虑使用 docker 运行 Jenkins 镜像，因为需要做些定制，通过 docker:dind 镜像来运行 Jenkins 镜像，镜像本身使用的源也要改，涉及到的东西比较多。

## Java Environment

从 Oracle 中文官网下载最新的 JDK 8 Linux 压缩包，上传到虚拟机，配置环境变量；

## Git

https://git-scm.com/downloads/linux

https://git-scm.com/book/en/v2/Getting-Started-Installing-Git

由于 CentOS 系统一般使用的是旧版本的 git，因此就不用 yum 安装了，而是采用源码编译安装的方式。

截至 2025-02-14，最新的版本是 2.48.1，考虑到使用的 CentOS7 版本不高，和最新版的 git 管理的依赖不一定能对的上，因此下载之前版本的，比如 2.39.5 tar.gz 压缩包上传到虚拟机：

```shellscript
> pwd
/opt/git
> tar -zxvf git-2.39.5.tar.gz
```

解压缩后就可以得到 git 的源码了，具体的编译安装指令可以参考 gitlab 仓库的 readme 文档：

* https://github.com/git/git
* https://github.com/git/git/blob/master/INSTALL

执行以下命令进行安装：

```shellscript
# 安装所需依赖
> yum install -y make libssl-dev libcurl4-gnutls-dev libexpat1-dev gettext zlib1g-dev autoconf gcc

> cd /opt/git/git-2.48.1
> make configure
# 指定编译结果保存的地方, 默认情况下是 ~/bin/ 目录
# 配置 prefix 后, 后续需要在 profile 中指定 git 命令的位置
> ./configure --prefix=/opt/git/local/git-2.39.5
> make all && make install

# 修改 /etc/profile
export PATH=$PATH:/opt/git/local/2.39.5/bin
> source /etc/profile
> git -v
git version 2.48.1

# 如果遇到 jenkins 执行 git 命令报和 remote-http 相关的错误，也可以把 /opt/git/local/git-2.39.5/libexec/git-core 目录中的 git-remote-http 复制到 /opt/git/local/git-2.39.5/bin 目录下
```

## Apache Maven

参考 Maven 和 Java 版本的对应关系选择版本：https://maven.apache.org/docs/history.html

Java 8 对应最后的版本是 3.9.9，下载 [apache-maven-3.9.9-bin.tar.gz](https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.tar.gz) 文件上传到虚拟机：

```shellscript
> cd /opt/apache-maven
> tar -zxvf apache-maven-3.9.9-bin.tar.gz

# 添加系统变量
> vim /etc/profile
export PATH=$PATH:/opt/apache-maven/apache-maven-3.9.9/bin

# 检查是否成功配置
> mvn -v
Apache Maven 3.9.9 (8e8579a9e76f7d015ee5ec7bfcdc97d260186937)
Maven home: /opt/apache-maven/apache-maven-3.9.9
Java version: 1.8.0_431, vendor: Oracle Corporation, runtime: /opt/oracel-jdk/jdk1.8.0_431/jre
Default locale: zh_CN, platform encoding: UTF-8
OS name: "linux", version: "3.10.0-1160.el7.x86_64", arch: "amd64", family: "unix"
```

还需要修改 maven 使用的远程仓库和本地仓库地址：

/opt/apache-maven/maven-local-repository

```shellscript
> cd /opt/apache-maven/apache-maven-3.9.9/conf
> vim settings.xml

# 打开 localRepository 标签注释
<localRepository>/opt/apache-maven/maven-local-repository</localRepository>
# 在 mirrors 标签下新增 mirror
<mirror>
  <id>aliyunmaven</id>
  <mirrorOf>central</mirrorOf>
  <name>阿里云公共仓库</name>
  <url>https://maven.aliyun.com/repository/public</url>
</mirror>
```

# Jenkins

## 部署服务

直接在虚拟机上部署 Jenkins 服务，参考：

* [https://www.jenkins.io/doc/book/installing/linux/](https://www.jenkins.io/doc/book/installing/linux/)
* https://www.jenkins.io/doc/book/platform-information/support-policy-java/



下载 JDK 8 对应的 LTS 版本的 Jenkins war 包（这里没使用和系统相关的软件安装包）；

上传到虚拟机的特定目录下：

```shellscript
> cd /opt
> mkdir jenkins
> cd ./jenkins

# 将 war 包上传到当前目录下
# 执行命令启动 war 包, 默认的 8080 端口已被 gitlab 服务占用, 需要替换端口
> nohup java -jar jenkins.war --httpPort=8081 > jenkins-nohup.log 2>&1 &

# 防火墙放开 8081 端口
> firewall-cmd --zone=public --add-port=8081/tcp --permanent
> firewall-cmd --reload
> firewall-cmd --list-port
```

启动 war 包后通过在宿主机浏览器通过虚拟机 ip + 8081 端口访问 jenkins 解锁页面；

由于 Jenkins 插件会自动下载最新的，和当前安装的 Jenkins 版本对不上，会导致下载失败，我们等所有插件全部下载失败后，点击继续按钮，最后进入到 Jenkins 的管理页面中，Manage Jenkins -> Manage Plugin -> Advanced 最后的 url 配置上使用国内的镜像源地址：

比如这个：https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/dynamic-stable-2.346.1/update-center.json

配置上这个 url 后，还需要停掉证书校验的配置才可以正常下载插件：

```shellscript
nohup java -jar -Dhudson.model.DownloadService.noSignatureCheck=true -Duser.timezone=Asia/Shanghai jenkins-2.346.1.war --httpPort=8081 > jenkins-nohup.log 2>&1 &
```

这个配置有一定的安全隐患，在本地测试 Jenkins 时可以用，生产环境建议使用最新的 Jenkins 版本。

## 配置

### Plugins

顺利启动 Jenkins 后，进行管理页面，如果需要实现 CI/CD 诸多功能，需要安装对应的插件，点击 Manage Jenkins 后页面有很多红色提示，这些是刚刚安装失败的 plugin 导致的，可以在配置镜像 update-center 后到插件市场上搜索标红的插件，逐一重新下载，最后重启 Jenkins 服务。

注意：涉及到 git、pipeline 的插件是必要的，否则没法拉代码和触发 Jenkinsfile pipeline。

由于我们使用的代码托管平台是 GitLab，因此还需要下载 GitLab 相关的插件。



了解常用插件在 pipeline 中的使用方式：

* Git 插件：https://plugins.jenkins.io/git/#plugin-content-branch-variables
* Jenkins Credentials 插件：https://plugins.jenkins.io/credentials/
* Credentials Binding 插件（在 Jenkinsfile 中使用）：https://plugins.jenkins.io/credentials-binding/





### Global Tools

在 Manage Jenkins -> Global Tool Configuration 界面上配置 JDK、Git、Maven。



## 测试



### 普通 pipeline





### 多分支 pipeline



### GitLab WebHook 触发

需要 Jenkins 安装插件：

* Generic Webhook Trigger
* Multibranch Scan Webhook Trigger

注：为了测试没有考虑 GitLab 和 Jenkins 通过 webhook 通信的安全问题；

由于 GitLab 和 Jenkins 服务所在的虚拟机使用本地网络，因此需要在 GitLab 管理界面 Network 配置下的 Outbound requests 中勾选允许从 local network 发过来的 webhooks。





## 参考

* https://www.jenkins-zh.cn/
* https://www.jenkins-zh.cn/tutorial/get-started/install/
* https://www.jenkins-zh.cn/tutorial/management/plugin/
