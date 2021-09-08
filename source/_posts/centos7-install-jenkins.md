---
title: CentOS7 Install Jenkins
date: 2021-07-07 09:48:00
author: NaiveKyo
top: false
hide: false
cover: false
img: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/23.jpg
coverImg: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/23.jpg
toc: true
summary: CentOS7 安装 Jenkins 并测试项目自动部署。
categories: Linux
keywords: 
  - CentOS7
  - Jenkins
tags:
  - Linux
---



# 一、前言

## 1、Jenkins 是什么

Jenkins是一个开源的、提供友好操作界面的持续集成(CI)工具，起源于Hudson（Hudson是商用的），主要用于持续、自动的构建/测试软件项目、监控外部任务的运行。Jenkins用Java语言编写，可在Tomcat等流行的servlet容器中运行，也可独立运行。通常与版本管理工具(SCM)、构建工具结合使用。常用的版本控制工具有SVN、GIT，构建工具有Maven、Ant、Gradle。



## 2、CI/CD 是什么

 `CI(Continuous integration)`，中文意思是持续集成。它强调开发人员提交了新代码之后，立刻进行构建、（单元）测试。根据测试结果，我们可以确定新代码和原有代码能否正确地集成在一起。借用网络图片对 CI 加以理解。



![](https://naivekyo.oss-cn-hangzhou.aliyuncs.com/blog%27image/ci.png)



`CD(Continuous Delivery)`， 中文意思持续交付。它是在持续集成的基础上，将集成后的代码部署到更贴近真实运行环境(类生产环境)中。比如，我们完成单元测试后，可以把代码部署到连接数据库的 Staging 环境中更多的测试。如果代码没有问题，可以继续手动部署到生产环境。下图反应的是 CI/CD 的大概工作模式。



![](https://naivekyo.oss-cn-hangzhou.aliyuncs.com/blog%27image/cd.png)



# 二、安装 Jenkins

环境：CentOS7



## 1、前置

- 官网下载 LTS 版本的 war 包：https://www.jenkins.io/

- 上传到服务器	

- 运行 war 包，将其作为后台进程挂起，输出日志为 `jenkins.out`

  ```bash
  nohup java -jar /usr/local/jenkins/jenkins.jar > /usr/local/jenkins/jenkins.out &
  ```

- 访问 Jenkins 的管理页面：Linux IP + 8080 端口（**需要开放端口**）

- 登录密码位置：`/root/.jenkins/secrets/initialAdminPassword`

- 获取密码后输入点击继续，会进入下载插件的界面，由于需要从外网下载，速度较慢，我们需要修改为国内的镜像：（先关掉浏览器界面 并 杀死 Linux 中的 jenkins 进程）

  ```bash
  # 配置国内镜像
  # 进入 jenkins 工作目录
  cd /root/.jenkins/updates
  
  # 杀死进程: 先查 PID 然后 kill
  ps -ef | grep jenkins
  kill -s TERM <PID>
  
  # 直接修改配置文件 default.json
  # 由于该文件内容太多，直接编辑不好修改，我们可以运行脚本进行修改
  sed -i 's/http:Wupdates.jenkins-ci.orgVdownload/https:Wmirrors.tuna.tsinghua.edu.cnVjenkins/g' default.json && sed -i 's/http:Wwww.google.com/https:Wwww.baidu.com/g' default.json
  ```

- 重启 jenkins 下载插件：**选择安装推荐的插件**

- 安装完成之后，创建管理员用户：

- 登录

- 进入管理页面后，开始配置 Jenkins

  Manager Jenkins -> Global Tool Configuration

  分别配置 <mark>JDK、Maven、Git</mark>



## 2、Jenkins 自动化配置

准备工作：

- 服务器需安装  <mark>Docker</mark>

- 需要在工程中添加 **Dockerfile** （和 pom 文件在同一级）



> 前置工作：Dockerfile

Dockerfile：

```bash
# 拉取 JDK 环境
FROM openjdk:8-jdk-alpine
# 缓存处理
VOLUME /tmp
# 重命名 jar 包
COPY ./target/jenkinsdemo-0.0.1-SNAPSHOT.jar demojenkins.jar
# 执行 jar 包
ENTRYPOINT ["java","-jar","/demojenkins.jar", "&"]
```



修改 pom.xml 

- 更改打包类型为 pom
- 添加 maven 插件

```xml
<groupId>com.naivekyo</groupId>
<artifactId>jenkinsdemo</artifactId>
<packaging>jar</packaging>
<version>0.0.1-SNAPSHOT</version>
<name>jenkinsdemo</name>
<description>Demo project for Spring Boot</description>

<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
  </plugins>
</build>
```



## 3、Jenkins 管理界面创建自动化任务



- Jenkins dashboard -> 新建 Item
- 填写任务名称：可随意
- 一般选择 **Freestyle project** 即可
- 下一步：源代码管理，这里我们将没有编译的代码（mvn：clean）上传到远程仓库中，Jenkins 支持两种仓库 GitHub 和 gitee，但是我只找到了 GitHub 一种



------



> 使用 Git 将 springboot 项目上传到 GitHub

1. 在 GitHub 上新建仓库
2. 记录下仓库的地址，例如 https://github.com/NaiveKyo/JenkinsTest.git
3. 本机打开 git 的客户端，进入自己要提交的工程的目录

```bash
# 举个例子
# 工程目录下右键 打开 git bash here
# 第一步，初始化
git init
# 第二步，上传，这里直接是将所有文件添加到仓库中，如果只想添加指定的文件，可以把 . 换成特定的文件名称
git add .
# 第三步，提交到本地仓库
git commit -m "description" # 表示提交的注释
# 可能需要输入 GitHub 账户名和密码
# 可以使用以下方式配置全局信息，以后比较方便
git config --global user.email "Your Email"
git config --global user.name "Your Name"

# 第四步，和远程仓库相关联
git remote add origin https://仓库url

# 最后，上传到远程仓库，指定分支 master
git push -u origin master
```



---





- 将本地代码上传到远程仓库 https://github.com/NaiveKyo/JenkinsTest.git
- Jenkins Dashboard 新建 Item，设置好配置信息
- **注意：开始构建之前，必须开启 Docker**
- 开始构建项目
- Build Success



## 4、Jenkins 执行任务时遇到的错误

git 一直无法拉取远程仓库地址：



> 推荐方案一，剩下两种没测试

- 尝试过配置 ssh，但是无效

- **最终解决方案**：

  - **缺少插件**：curl-devel ：Jenkins 通过 git 发起 http 请求需要使用工具 `curl-devel`（我只安装了 wget）
  - 重新编译 git

  ```bash
  cd /usr/local/git/git_x.x.x
  ./configuration --prefix=/usr/local/git
  make && make install
  ```

- 方式二：`yum install git-http`
- 方式三：git 代替 https `git clone --recursive git://github.com/用户名/仓库地址`





# 三、补充知识

## 1、Linux 知识

### （1）nohup



nohup 命令全程 no hang up，用于在系统后台不挂断的运行命令，退出终端不会影响程序的运行。



nohup 命令，在默认情况下（非重定向时），会输出一个名叫 `nohup.out` 的文件到当前目录下，如果当前目录的 nohup.out 不可写，输出重定向到 `$HOME/nohup.out` 文件中。



### （2）标准输入、输出

- 标准输入：stdin  代码 0  用 < 或 << 表示
- 标准输出：stdout 代码 1 用 > 或 >> 表示
- 标准错误输出：stderr 代码 2 用 2> 或 2>> 表示



将命令执行的正确信息和错误信息做处理：

```bash
# 分别存放到不同的文件
find /home -name .bashrc > /right.txt 2> /error.ext

# 丢弃错误信息，只保存正确信息
find /home -name .bashrc 2> /dev/null

# 将正确和错误的信息输出到同一个文件
find /home -name .bashrc > /right.txt 2>&1
# 或者
find /home -name .bashrc &> /right.txt
```



标准输入：

```bash
# 使用 cat 命令简单的创建一个文件
cat > text.txt
# 然后输入消息，退出使用 ctrl + d

# 使用 cat 和 < 创建文件，可以实现类似复制文件的作用
cat > text.txt < ./message.txt

# 测试 << 该符号代表 `结束的输入字符`
cat > text.txt << "eof"
# 输入消息，最后一行是 eof 表示退出
```



### （3）Linux 中的 &

**幕后工作：**在命令结尾加上 & 表示将这个任务放到后台执行

```bash
# 递归的复制文件目录，假如目录很大，需要很久，可以放到后台执行
cp -R original/dir/ backup/dir/ &
# 回车执行后，会显示一个 进程 ID 号
```

任务被放到后台执行之后，就可以立即继续在同一个终端上工作了，甚至关闭终端也不影响这个任务的正常执行。需要注意的是，如果要求这个任务输出内容到标准输出中（例如 `echo` 或 `ls`），即使使用了 `&`，也会等待这些输出任务在前台运行完毕。



当使用 `&` 将一个进程放置到后台运行的时候，Bash 会提示这个进程的进程 ID。在 Linux 系统中运行的每一个进程都有一个唯一的进程 ID，你可以使用进程 ID 来暂停、恢复或者终止对应的进程，因此进程 ID 是非常重要的。



当使用该命令启动一个后台进程时，我们可以在当前终端下使用如下几个命令管理后台进程：

- `jobs` 命令可以显示当前终端正在运行的进程，包括前台和后台运行的进程。它对每一个正在执行的进程任务分配一个序号（这个序号不是进程 ID），可以使用这些序号来引用各个进程任务：

- `fg` 命令可以将后台运行的进程任务放到前台运行，这样可以比较方便地进行交互。根据 `jobs` 命令提供的进程任务序号，再在前面加上 `%` 符号，就可以把相应的进程任务放到前台运行。

  ```bash
  # 将 jobs 显示的标号为 1 的进程放到前台运行
  fg % 1
  ```

  如果这个进程任务是暂停状态，fg 命令可以将它启动起来

- `ctrl + z` 可以将前台运行的任务暂停，仅仅是暂停而不是终止。当使用 `fg` 或者 `bg` 命令将任务重新启动起来的时候，任务会从暂停的地方继续执行。但 `sleep` 命令是一个特例，`sleep` 任务被暂停的时间会计算在 `sleep` 时间之内。因为 `sleep` 命令依据的是系统时钟的时间，而不是实际运行的时间。也就是说，如果运行了 `sleep 30` ，然后将任务暂停 30 秒以上，那么任务恢复执行的时候会立即终止并退出。
- `bg` 命令会将任务放置到后台运行，如果任务是暂停的，也会被启动起来



### （4）Linux 的 kill 命令

前面介绍的几个命令适合在同一个终端中使用，如果启动进程任务的终端关闭了，就无法使用了。

如果要在另一个终端管理后台进程，就需要使用其他工具，例如 `kill`

- 暂停后台进程：

  ```bash
  # 先查进程号
  ps | grep 进程名
  # 暂停进程 等同于 ctrl + z
  kill -s STOP <PID>
  ```

- 把暂停的进程启动：`kill -s CONT <PID>`

- 终止进程：`kill -s TERM <PID>`

- 如果进程不相应 TERM 信号并拒绝退出，可以发送 KILL 信号强制终止进程：

  ```bash
  kill -s KILL <PID>
  ```

  强制终止进程可能会有一定的风险，但如果遇到进程无节制消耗资源的情况，这样的信号还是有用的

- 如果不确定进程 ID 是否存在，可以这样 `ps x | grep jenkins`

- 将 `ps` 和 `grep` 结合起来的命令：`pgrep 字符串`，它可以把包含指定字符的进程 ID 列出来

- 加一些参数 ：`pgrep -lx 字符串`，这样就可以把名称也显示出来，如果想了解更多的细节，可以这样：`pgrep -ax`，更多请 --help
