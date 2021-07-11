---
title: linux_centos7_study
date: 2021-07-07 10:55:28
author: NaiveKyo
top: false
hide: false
cover: false
toc: true
img: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/0.jpg
coverImg: https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/0.jpg
summary: 记录学习 Linux 过程中的一些常用操作
categories: Linux
keywords: 
  - Linux
  - Study
tags:
  - Linux
---

# 前言：Secure CRT 连接出现过的问题

使用 Secure CRT 连接服务器，遇到的一些问题

> SecureCRT 连接慢的问题

修改SecureCRT配置目录的Sessions子目录下对应的服务器ini配置文件， GSSAPI Method 设置的值为 none，重启SecureCRT。

> 连接出现错误 The Semaphore timeout period has expired

```bash
# vi /etc/ssh/sshd_config

GG到文件末尾，增加下面2行：
ClientAliveInterval 60
ClientAliveCountMax 3

# service sshd reload
然后就解决问题了。
```

> vim 出现 xxx swap already exist 的问题

这是由于使用 vim 时异常退出导致的问题

需要删除相应目录下的 **.xxx.swap** 临时文件就好了。



> 关于有时候重启电脑后主机ping不通虚拟机的问题

这个问题暂时没有明确的解决方法，虽然和虚拟机的相关服务每次开机都会自动启动，但还是无法 ping 虚拟机，可能是在某次开机启动项优化时将相关的服务停止了，现在可行的解决方法如下：

**禁用 VMnet8 然后重启**

# 一、Linux 常用命令（CentOS 7）

1. ifconfig 和 ip addr  —— 查看 ip
2. yum install 	—— 安装
   - 安装 ssh 服务 yum install openssh-server	
   - 检查ssh服务，yum list install | grep openssh-server
3. ps -e | grep	—— 查看进程
4. service network restart	—— 重启网络服务
5. init 0、init 6	—— 关机和重启
6. contOS7 开始默认使用 firewalld，它基于 iptables，有 iptables 的核心，但是 iptables 的服务没安装
   - 停止防火墙，并禁用 firewalld 服务：sudo systemctl stop firewalld.service
   - sudo systemctl disable firewalld.service
   - 改用 iptables 服务：	sudo yum install iptables-services
   - 检查状态	service iptables status
7. 开启sshd服务 **systemctl restart sshd , systemctl status sshd** 检查服务状态，或者输入**netstat -an | grep 22**  检查  **22** 号端口是否开启监听，或者 **ps -e | grep sshd**
8. netstat 常用 ：监听 tcp、udp 端口监听情况 **netstat -tunlp**
9. 复制粘贴（Linux和windows通用） ctrl + insert 和 shift + insert
10. 传文件，右键选择 connect SFTP Session，输入 put + 文件路径

   - pwd：服务器当前目录
   - lpwd：Windows当前目录
   - ls 和 lls 与上面类似
   - cd：改变服务器目录
   - lcd：改变本地目录
   - Windows向服务器传文件：put 目标文件
   - 服务器向Windows传文件：get 目标文件

11. 解压 tar zxvf 压缩包	压缩 tar zcvf 输出目标.tgz 文件，文件。。。
    - Linux中其他类似命令：zip/unzip和gzip/gunzip等等
12. 正则表达式，最常用的 * ：匹配任意字符 ?：匹配一个字符
13. ls	-t 按时间降序排列
14. 创建目录：mkdir
15. mv 目标文件 目录  或者可以改名字 mv 旧文件名 新文件名
16. cp 复制 参数 -r 递归复制
17. windows下 ping -n 包的个数 ip地址或域名	Linux下 ping -c 包的个数 ip地址或域名
18. 显示文本文件内容：cat、more、tail
    - cat 显示整个文件内容
    - more 分页显示文件内容，空格下一页，b 显示上一页，q 退出
    - tail -f 显示文本内容最后几行，对于程序员非常重要，可以动态显示后台服务程序的日志，用于调试和跟踪程序的运行
19. wc 统计文本文件的行数、单词数和大小
20. grep 搜索
21. find 搜索
22. 增加/删除用户组：groupadd 组名	groupdel 组名
23. 添加/删除用户：useradd -n 用户名 -g 组名 -d 用户主目录
    - userdel 用户名
24. 修改用户密码：passwd [用户名]
25. 切换用户 su - root
26. 修改目录和文件所有者和组：chwon [-R] 用户名：组名 目录或文件名列表  
    - -R参数表示处理各级子目录
27. 查看系统磁盘空间：df [-h] [-T]
    - 参数 -h 以方便阅读的方式显示， -T 列出文件系统类型
28. 修改主机名 hostname
    - vi /etc/hostname



# 二、Vim 编辑器

Vi 编辑器


```bash
命令行模式：
  i	进入插入模式
  esc	进入命令行模式
  :	进入末行模式
  a	在当前光标之后进入插入模式
  o	在当前光标下一行插入空行
  O	在当前光标上一行插入空行
  I	在当前光标行首进入插入模式
  A	在当前光标行末进入插入模式
		
	Ctrl + u 	向上翻半页
	Ctrl + d 	向下翻半页

	nG	移动到第 n 行

	Ctrl + g	显示当前所在行数

	G	跳到最后一行
	：5	光标跳到第5行
	：n	光标跳到第n行
	
	0	跳到行首
	$	跳到行末
	
	w	光标跳到下个单词的开头
	b	光标跳到上个单词的开头
	e	光标跳到本单词的结尾
	
	x	每按一次，删除光标所在位置的一个字符
	nx	如“3x”表示删除光标所在位置开始的3个字符
	dw	删除光标所在位置到本单词结尾的字符
	D	删除本行光标所在位置后面全部内容
	
	dd	删除光标所在行
	ndd	如“3dd”表示删除光标所在位置开始的3行
	
	yy	将光标所在位置的一行复制到缓冲区
	nyy	将光标所在位置的n行复制到缓冲区
	p	将缓冲区的内容粘贴到光标所在位置
	
	r	替换光标所在位置的一个字符	r = replace
	R	从光标所在位置开始替换，直到按下“Esc”
	cw	从光标所在位置开始替换单词，知道按下“Esc”
	
	u	撤销命令，可多次撤销

	J	将当前行的下一行接到当前行的末尾

	/	输入/和要查找的内容，然后 n 表示下一个，N 表示上一个, 撤销高亮输入 :nohl
	
	.	小数点表示重复执行上一次的vi命令

	~	对当前光标所在的字符进行大小写转换

	列操作：先按 Ctrl + v 然后 按上下键选择列，选中后按 I 输入内容，最后 Esc

	移动光标：h 向左 l 向右  j 向下 k 向上 

	：g/aaa/s//bbb/g	全文替换，把aaa替换为bbb	

	复制 ctrl + insert 粘贴 shift + insert

末行模式：
	:w	存盘
	:w!	强制存盘
	:wq	存盘退出
	:x	存盘退出
	:q	不存盘退出
	:q!	不存盘强制退出
```


# 三、makefile 文件

```bash
	在软件的工程中的源文件是很多的，其按照类型、功能、模块分别放在若干个目录和文件中，哪些文件需要编译
，那些文件需要后编译，那些文件需要重新编译，甚至进行更复杂的功能操作，这就有了我们的系统编译的工具。

	在linux和unix中，有一个强大的实用程序，叫make，可以用它来管理多模块程序的编译和链接，直至生成可执行文件。

	make程序需要一个编译规则说明文件，称为makefile，makefile文件中描述了整个软件工程的编译规则和
各个文件之间的依赖关系。

	makefile就像是一个shell脚本一样，其中可以执行操作系统的命令，它带来的好处就是我们能够实现“自动化编译”，
一旦写好，只要一个make命令，整个软件功能就完全自动编译，提高了软件开发的效率。

	make是一个命令工具，是一个解释makefile中指令的命令工具，一般来说大多数编译器都有这个命令，
使用make可以是重新编译的次数达到最小化。


一、makefile 的编写

	makefile文件的规则可以非常复杂，比C程序还要复杂，我通过示例来介绍它的简单用法。

文件名：makefile，内容如下：
	all:book1 book2
	book1:book1.c
		gcc -o book1 book1.c
	book2:book2.c  _public.h _public.c
		gcc -o book2 book2.c  _public.c
	clean:
		rm -f book1 book2
第一行：
	all：book1 book2
	all：这是固定的写法，后面跟的是要编译目标程序的清单，中间用空格分开，如果清单很长，可以用 \ 换行
	
第二行：
	book1: book1.c
	book1: 表示需要编译的目标程序
	如果要编译目标程序book1，需要依赖源程序book1.c，当book1.c的内容发生了变化，
	执行make的时候就会重新编译book1。

第三行：
		gcc -o book book1.c
	这是一个编译命令，和在操作系统命令行输入的命令一样，但是要注意一个问题，
	在gcc之前要用tab键，看上去像8个空格，实际不是，一定要用tab，空格不行。

第四行：
	book2: book2.c  _public.h _public.c
	book2表示编译的目标程序。
	如果要编译目标程序book46，需要依赖源程序book46.c、_public.h和_public.c三个文件，
	只要任何一个的内容发生了变化，执行make的时候就会重新编译book46。

第五行：
	gcc -o book46 book46.c _public.c

第六行：
	clean：
	清除目标文件，清除的命令由第十行之后的脚本来执行。

第七行：
		rm  -f  book1 book46
	清除目标文件的脚本命令，注意了，rm之前也是一个tab键，不是空格。

二、make 命令
	
	makefile准备好了，在命令提示符下执行 <b>make</b> 就可以编译makefile中all参数指定的目标文件。
	执行 make 编译目标程序
	执行 make clean 执行清除目标文件的指令

三、makefile 文件中的变量
	
	makefile中，变量就是一个名字，变量的值就是一个文本字符串。
	在makefile中的目标，依赖，命令或其他地方引用变量时，变量会被它的值替代。

CC=gcc
FLAG=-g
 
all:book1 book46
 
book1:book1.c
        $(CC) $(FLAG) -o book1 book1.c
 
book46:book46.c _public.h _public.c
        $(CC) $(FLAG) -o book46 book46.c _public.c
 
clean:
        rm -f book1 book46

第一行：	CC=gcc
	定义变量CC，赋值gcc
第二行：	FLAG=-g
	定义变量，赋值-g
第七行：	$(CC)  $(FLAG) -o book1 book1.c
	$(CC)和$(FLAG)就是使用变量CC和FLAG的值，类似于C语言的宏定义，替换后的结果是：
	gcc -g -o book1 book1.c

在makefile文件中，使用变量的好处有两个：1）如果在很多编译指令采用了变量，
只要修改变量的值，就相当于修改全部的编译指令；2）把比较长的、公共的编译指令采用变量来表示，可以让makefile更简洁。

四、应用经验
	makefile文件的编写可以很复杂，复杂到我不想看，在实际开发中，用不着那么复杂的makefile，我追求简单实用的方法，
	腾出更多的时间和精力去做更重要的事情，那些把makefile文件写得很复杂的程序员在我看来是吃饱了撑的。
	
```



# 四、GDB 常用命令

```bash
命令		命令缩写			命令说明

set args					设置主程序的参数
					例如：两个程序  /test/book1.c	和 ./book1.c
					设置方法：(gdb) set args /test/book1.c和 gdb book1.c

break		b			设置断点，b 20 表示在20行设置断点，可以设置多个断点

run		r			开始运行程序，程序运行到断点处会停止

next		n			执行当前行语句，如果该语句为函数调用，不会进入函数内部

step		s			执行当前行语句，如果该语句为函数调用，则进入函数执行第一天语句
					如果函数为库函数或第三方提供的函数，则无法进入

print		p			显示变量值，例如 p name 表示显示变量name的值

continue		c			继续程序的运行，知道遇到下一个断点

set var name = value			设置变量的值，假设程序有两个变量：int ii 和 char name[21]
					set var ii = 10 set name = ”测试“而不用strcpy

quit		q			退出 gdb 环境
```

# 五、安装 CentOS 7

## 1、安装步骤

首先正常安装，然后执行以下三个步骤：

> 修改 CentOS 7 的字符集

```bash
echo LANG="zh_CN.gbk" > /etc/locale.conf
然后让其立即生效
source /etc/locale.conf
```

> 启用网卡

打开 ens33 网卡的配置文件 `/etc/sysconfig/network-scripts/ifcfg-ens33`，把 **NOBOOT** 参数修改为 yes。

```bash
echo ONBOOT=yes >> /etc/sysconfig/network-scripts/ifcfg-ens33
```

> 修改 CentOS 7 的时间

```bash
date -s "2021/03/12 21:22:00"
```



## 2、Linux 常用命令

- 重启： `init 6 或者 reboot`
- 关机：`init 0 或者 halt`

> 时间操作：

- 查看时间 `date`

- 设置时间为中国上海时间  

  ```bash
  cp /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime
  ```

- 设置时间格式

  ```bash
  date -s "yyyy-mm-dd hh:mi:ss"
  ```

> 目录操作：

- 删除目录和文件：`rm [-rf] 目录或文件列表`

- 移动目录或文件：`mv 旧目录或文件名 新目录或文件名` 也可以重命名
- 复制目录或文件：`cp [-r] 旧目录或文件名 新目录或文件名`

打包压缩与解压缩：

- 打包压缩的语法：`tar zcvf 压缩包文件名 目录或文件名列表`
- 解包解压的语法：`tar zxvf 压缩包文件名`

> 判断网络是否连通：

- Windows系统：`ping -n 包的个数 ip地址或域名`
- Linux系统：`ping -c 包的个数 ip地址或域名`

> 搜索文件中的内容

`grep "内容" 文件名`

注意，如果内容中没有空格等特殊字符，可以不用双引号括起来。

可以使用通配符

> 搜索文件

`find 目录名 -name 文件名 -print`

参数说明：

目录名：待搜索的目录，搜索文件的时候，除了这个目录名，还包括它的各级子目录。

文件名：待搜索的文件名匹配的规则。

示例：

1）从/tmp目录开始搜索，把全部的*.c文件显示出来。

find /tmp -name *.c -print

2）从当前工作目录开始搜索，把全部的*.c文件显示出来。

find . -name *.c -print

> 增加/删除用户组

- 增加用户组：`groupadd 组名`
- 删除用户组：`groupdel 组名`

> 增加/删除用户&修改用户密码

- 增加用户：`useradd -n 用户名 -g 组名 -d 用户的主目录`

- 删除用户：`userdel 用户名`

- 修改用户密码：`passwd [用户名]`

  修改用户的密码，按提示两次输入新密码，如果两次输入的密码相同就修改成功。

  普通用户只能修改自己的密码，只输入passwd就可以了，不能指定用户名。

  系统管理员可以修改任何用户的密码，passwd后需要指定用户名。

> 修改目录和文件的所有者和组

`chown [-R] 用户名:组名 目录或文件名列表`

chown将目录或文件的拥有者修改为参数指定的用户名和组，目录或文件名列表用空格分隔。

-R 选项表示处理各及子目录。

> 查看系统磁盘空间

`df [-h] [-T]`

选项-h 以方便阅读的方式显示信息。

选项-T 列出文件系统类型。



# 六、CentOS 7 设置环境变量

## 1、环境变量的含义

程序（操作系统命令和应用程序）的执行都需要运行环境，这个环境是由多个环境变量组成的。



## 2、环境变量的分类

- 按生效的范围分类
  - **系统环境变量**：公共的，对全部的用户都生效。
  - **用户环境变量**：用户私有的、自定义的个性化设置，只对该用户生效。
- 按生存周期分类
  - **永久环境变量**：在环境变量脚本文件中配置，用户每次登录时会自动执行这些脚本，相当于永久生效。
  - **临时环境变量**：使用时在Shell中临时定义，退出Shell后失效。



## 3、Linux 环境变量

Linux环境变量也称之为Shell环境变量，以下划线和字母打头，由下划线、字母（区分大小写）和数字组成，习惯上使用大写字母，例如 PATH、HOSTNAME、LANG 等。



## 4、常用的环境变量

> 查看环境变量

`env 命令`：

在 Shell 下，用 env 命令查看当前用户全部的环境变量。

用 env 命令的时候，满屏显示了很多环境变量，不方便查看，可以用 grep 筛选。



`env | grep 环境变量名`:

例如查看环境变量名中包含PATH的环境变量。

```bash
env | grep PATH
```



`echo 命令`:

echo $环境变量名

```bash
echo $LANG
```

> 常用的环境变量

- PATH

  可执行程序的搜索目录，可执行程序包括 Linux 系统命令和用户的应用程序

- LANG

  Linux系统的语言、地区、字符集

- HOSTNAME

  服务器的主机名。

- SHELL

  用户当前使用的Shell解析器。

- HISTSIZE

  保存历史命令的数目。

- USER

  当前登录用户的用户名。

- HOME

  当前登录用户的主目录。

- PWD

  当前工作目录。

- LD_LIBRARY_PATH

  C/C++语言动态链接库文件搜索的目录，它不是 Linux 缺省的环境变量，但对C/C++程序员来说非常重要

- CLASSPATH

  **JAVA 语言库文件搜索的目录，它也不是 Linux 缺省的环境变量，但对JAVA程序员来说非常重要**



## 5、设置环境变量

```bash
变量名='值'
export 变量名

或者

export 变量名='值'
```

如果环境变量的值没有空格等特殊符号，可以不用单引号包含。

示例：

```shell
export ORACLE_HOME=/oracle/homeexport ORACLE_BASE=/oracle/baseexport ORACLE_SID=snorcl11gexport NLS_LANG='Simplified Chinese_China.ZHS16GBK'export PATH=$PATH:$HOME/bin:$ORACLE_HOME/bin:.export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ORACLE_HOME/lib:.
```

采用export设置的环境变量，在退出 Shell 后就会失效，下次登录时需要重新设置。如果希望环境变量永久生效，需要在登录脚本文件中配置。

> 系统环境变量

系统环境变量对全部的用户生效，设置系统环境变量有三种方法。

- 在 `/etc/profile` 文件中设置。

  用户登录时执行 /etc/profile 文件中设置系统的环境变量。但是，Linux不建议在/etc/profile文件中设置系统环境变量。

- 在 `/etc/profile.d` 目录中增加环境变量脚本文件，这是Linux推荐的方法。（推荐使用）

  /etc/profile在每次启动时会执行 /etc/profile.d下全部的脚本文件。/etc/profile.d 比 /etc/profile 好维护，不想要什么变量直接删除 /etc/profile.d下对应的 **shell 脚本**即可。

- 在 `/etc/bashrc` 文件中设置环境变量。

  该文件配置的环境变量将会影响全部用户使用的bash shell。但是，Linux也不建议在/etc/bashrc文件中设置系统环境变量。

> 用户环境变量

用户环境变量只对当前用户生效，设置用户环境变量也有多种方法。

在用户的主目录，有几个特别的文件，用 ls 是看不见的，用 **ls .bash_*** 可以看见。

例如：

```bash
ls /root/.bash_*ls /home/naivekyo/.bash_*可以查出来几个特别的文件
```



- `.bash_profile`（推荐首选）

  当用户登录时执行，每个用户都可以使用该文件来配置专属于自己的环境变量。

- `.bashrc`

  当用户登录时以及每次打开新的 Shell 时该文件都将被读取，不推荐在里面配置用户专用的环境变量，因为每开一个Shell，该文件都会被读取一次，效率肯定受影响。

- `.bash_logout`

  当每次退出系统（退出bash shell）时执行该文件。

- `.bash_history`

  保存了当前用户使用过的历史命令。



> 环境变量脚本执行的顺序

环境变量脚本文件的执行顺序如下：

```bash
/etc/profile -> /etc/profile.d -> /etc/bashrc -> 用户的.bash_profile -> 用户的.bashrc
```

同名的环境变量，如果在多个脚本中有配置，以最后执行的脚本中的配置为准。

还有一个问题需要注意，在/etc/profile中执行了/etc/profile.d的脚本，代码如下：

```bash
for i in /etc/profile.d/*.sh ; do    if [ -r "$i" ]; then        if [ "${-#*i}" != "$-" ]; then            . "$i"        else            . "$i" >/dev/null        fi    fidone
```

所以，/etc/profile.d 和 /etc/profile 的执行顺序还要看代码怎么写。

## 6、重要环境变量详解	

> 1、PATH 环境变量

可执行程序的搜索目录，可执行程序包括 Linux 系统命令和用户的应用程序。如果可执行程序的目录不在 PATH 指定的目录中，执行时需要指定目录。

- PATH环境变量存放的是目录列表，目录之间用冒号 : 分隔，最后的圆点 . 表示当前目录。

  ```bash
  export PATH=目录1:目录2:目录3:......目录n:.
  ```

- PATH 缺省包含了 Linux 系统命令所在的目录（/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin），如果不包含这些目录，Linux的常用命令也无法执行（要输入绝对路径才能执行）。

- 在用户的 .bash_profile 文件中，会对PATH进行扩充，如下：

  ```bash
  export PATH=$PATH:$HOME/bin
  ```

- 如果PATH变量中没有包含**圆点**.，执行当前目录下的程序需要加./或使用绝对路径。

  ```bash
  # 没有圆点
  export PATH=/usr/bin
  # 执行该目录下的命令时需要使用 ./ 或者 绝对路径
  
  # 加上圆点
  export PATH=/usr/bin:.
  # 可以在任何地方执行
  ```

  



> 2、LANG 环境变量

LANG环境变量存放的是Linux系统的语言、地区、字符集，它不需要系统管理员手工设置，/etc/profile 会调用 /etc/profile.d/lang.sh 脚本完成对LANG的设置。

- CentOS6.x 字符集配置文件在/etc/syscconfig/i18n文件中。

- CentOS7.x 字符集配置文件在/etc/locale.conf文件中，内容如下：

```bash
LANG=en_US.UTF-8
#LANG=zh_CN.UTF-8
#LANG=zh_CN.gbk
#LANG=zh_CH.gb18030
```

> 3、LD_LIBRARY_PATH环境变量

C/C++语言动态链接库文件搜索的目录，它不是Linux缺省的环境变量，但对C/C++程序员来说非常重要。LD_LIBRARY_PATH环境变量存放的也是目录列表，目录之间用冒号:分隔，最后的圆点.表示当前目录，与PATH的格式相同。

```bash
export LD_LIBRARY_PATH=目录1:目录2:目录3:......目录n:.
```

> 4、CLASSPATH

JAVA语言库文件搜索的目录，它也不是Linux缺省的环境变量，但对JAVA程序员来说非常重要。

CLASSPATH环境变量存放的也是目录列表，目录之间用冒号:分隔，最后的圆点.表示当前目录，与PATH的格式相同。

## 7、环境变量的生效

- 在 Shell 下，用 **export** 设置的环境变量对当前 Shell 立即生效，Shell 退出后失效。

- 在脚本文件中设置的环境变量不会立即生效，退出 Shell 后重新登录时才生效，或者用 **source** 命令让它立即生效，例如：

  ```bash
  source /etc/profile
  ```

  

## 8、建议

虽然设置环境变量的方法有多种，但是建议系统环境变量建议在 **/etc/profile.d** 目录中配置，用户环境变量在用户的 **.bash_profile** 中配置，不建议在其它脚本文件中配置环境变，会增加运维的麻烦，容易出错。



# 七、CentOS7 设置中文字符集



# 八、CentOS7 安装软件包的方法

Linux有多种发行版本，各种发行版本之间安装软件包的方法和命令不一样，同发行版本之间安装软件包的方法也有不同。Linux主要有三大派系：红帽子派系（Redhat、Centos、Oracle Linux）、Debian派系（Ubuntu、Kali），SUSE派系（SuSe、OpenSUSE）等。

红帽子派是Linux服务器操作系统的主流，本文重点介绍红帽子派系中rpm和yum安装软件包的方法。



## 1、rpm 安装

RPM是RedHat Package Manager的缩写，由RedHat推出的软件包管理管理工具，在Fedora 、Redhat、CentOS、Mandriva、SuSE、YellowDog等主流发行版本，以及在这些版本基础上二次开发出来的发行版采用。

RPM包里面包含可执行的二进制程序，自身所带的附加文件，版本文件（软件包的依赖关系）。



- 查看系统中已经安装的软件包

- rpm -q 软件包名  例如 ftp 查看已经安装的软件包
- rpm -ql 软件包名 查看软件包安装的目录和文件（包括了可执行程序、配置文件和帮助文档）。
- rpm -qi 软件包名 查看已安装软件包的详细信息。
- rpm -qc 软件包名 查看已安装软件包的配置文件所在的位置。
- rpm -qR 软件包名 查看已安装软件包所依赖的软件包及文件。



- 查看软件包的安装文件，安装包文件的后缀是.rpm

- rpm -qpi 软件包的安装文件名 查看一个软件包的安装文件的详细信息。
- rpm -qpl 软件安装包文件名 查看软件包的安装文件所包含的文件。
- rpm -qpR 软件包的安装文件名 查看软件包的依赖关系。



软件包的安装文件： 安装包文件的后缀是.rpm，以CentOS7为例，系统安装的光盘映像文件是CentOS-7-x86_64-DVD-1908.iso，解开后在Packages目录中有软件包的安装文件



**安装/升级软件包**

如果待安装/升级的软件与其它的软件有依赖关系，请解决依赖关系，即先安装/升级依赖关系的软件包。如果没有解决好依赖关系，可以强制安装/升级，不推荐采用强制的方法，因为有可能导致软件不可用。

- 安装软件包：rpm -ivh 软件包的安装文件名
- 升级软件包：rpm -Uvh 软件包的安装文件名
- 强制安装软件包：rpm -ivh 软件包的安装文件名 --nodeps --force
- 强制升级软件包：rpv -Uvh 软件包的安装文件名 --nodeps --force
- 删除软件包：rpm -e 软件包名



## 2、yum 安装

rpm安装软件包的虽然方便，但是需要手工解决软件包的依赖关系。很多时候安装一个软件包需要安装多个其他软件包，还有不同版本的兼容性问题，很复杂。yum（Yellow dog Updater, Modified）解决了这些问题，yum是rpm的前端程序，设计的主要目的就是为了自动解决rpm的依赖关系，有以下优点：

1) 自动解决依赖关系；

2) 可以对rpm进行分组，基于组进行安装操作；

3) 引入仓库概念，支持多个仓库；

4) 配置简单。



> yum 的语法

`yum [options] [command] [package ...]`

options：可选参数：

1）-h帮助；

2）-y，当安装过程提示选择全部为yes，不需要再次确认；

3）-q，不显示安装的过程。

command：待操作的命令。

package：待操作的软件包名，多个软件包之间用空格分开，支持用星号*匹配。



> yum 的常用命令

- **安装/升级软件包**：yum install 软件包名/软件包文件名
- **升级软件包**：yum update 软件包名
- **删除软件包**：yum remove 软件包名
- **查找软件包**：yum search 软件包名
- 列出所有可更新的软件包清单：yum check-update
- 更新所有软件包：yum update
- 列出所有可安装软件包的清单：yum list
- 清除缓存：yum clean [headers|packages|metadata|dbcache|plugins|expire-cache|all]
  - rm -rf /var/cache/yum
  - 生成缓存 ： yum makecache



> 示例

1）安装/升级ftp客户端软件包。

yum -y install ftp

或

yum -y install ftp-0.17-67.el7.x86_64.rpm

2）升级ftp客户端软件包

yum -y update ftp

3）删除ftp客户端软件包。

yum -y remove ftp

## 3、应用经验

1）rpm安装/升级软件包需要手工的解决包的依赖关系，这一点让人确实很烦，所以，软件包的安装/升级一般采用yum命令。

2）rpm的某些功能，例如查看软件包的详细信息、软件包的安装目录、软件包的配置文件等还是有实用价值的。



# 九、CentOS7 系统服务管理

## 1、systemctl介绍

CentOS7启用了新的系统和服务管理器，采用systemctl命令代替了老版本的service和chkconfig。为了保持兼容性，在CentOS7中，老版本的service和chkconfig命令仍然可以使用。

systemctl命令是system（系统）和control（控制）两个单词的简写，它是一个功能强大的命令，本文只介绍与服务管理相关的用法。

systemctl命令有一点不足，就是很多命令执行后没有提示信息



## 2、systemctl常用命令

- start：.service 可以省略

- stop

- restart

- 查看服务是否已启动：systemctl is-active name.service

- status

  - Loaded：关于服务是否已经加载的信息，文件的绝对路径以及是否被启用的注释。

    Active：服务是否正在运行,然后是启动时间信息。

    Process：进程额外信息。

    Main PID：服务主进程pid。

    CGroup:Control Groups额外信息。

- 开机自启动：systemctl enable name.service

- 停用开机自启：systemctl disable name.service

- 查看服务是否开机自启：systemctl is-enabled name.service

- 只重启正在运行的服务：systemctl try-restart name.service

- 显示所有服务状态：systemctl list-units --type service --all

- 查看启动成功的服务：systemctl list-unit-files|grep enabled

- 查看启动失败的服务：systemctl --failed

- 查看所有服务状态：systemctl list-unit-files --type service

- 列出在指定服务之前启动的服务（依赖）：systemctl list-dependencies --after name.service

- 列出在指定服务之后启动的服务（被依赖）：systemctl list-dependencies --before name.service

# 十、CentOS7 配置防火墙

防火墙技术是用于安全管理的软件和硬件设备，在计算机内/外网之间构建一道相对隔绝的保护屏障，以保护数据和信息安全性的一种技术。

防火墙分为网络防火墙和主机防火墙。

网络防火墙由软件和硬件组成，可以保护整个网络，价格也很贵，从几万到几十万的都有，功能非常强大，主要包括入侵检测、网络地址转换、网络操作的审计监控、强化网络安全服务等功能。

主机防火墙只有软件部分（操作系统和杀毒软件自带），用于保护本操作系统，功能比较简单，只能防范简单的攻击。

本文将介绍主机防火墙（CentOS7以上版本）的使用和配置。

> 防火墙配置

CentOS7的防火墙比CentOS6的功能更强大，配置方法和操作命令也完全不同。

CentOS7的防火墙规则既可以是端口，也可以是服务。

防火墙查看和配置以下介绍的命令，如果没有特别说明就表示需要管理员权限执行。



## 1、查看防火墙的命令

- 查看防火墙的版本。firewall-cmd --version
- 查看firewall的状态。firewall-cmd --state
- 查看firewall服务状态（普通用户可执行）。systemctl status firewalld
- 查看防火墙全部的信息。firewall-cmd --list-all
- 查看防火墙已开通的端口。firewall-cmd --list-port
- 查看防火墙已开通的服务。firewall-cmd --list-service
- 查看全部的服务列表（普通用户可执行）。firewall-cmd --get-services
- 查看防火墙服务是否开机启动。systemctl is-enabled firewalld



## 2、配置防火墙的命令

- 启动、重启、关闭防火墙服务。
  - systemctl start firewalld 
  - systemctl restart firewalld
  - systemctl stop firewalld
- 开放、移去某个端口。
  - 开放80端口：firewall-cmd --zone=public --add-port=80/tcp --permanent
  - 移去80端口：firewall-cmd --zone=public --remove-port=80/tcp --permanent
- 开放、移去范围端口。
  - 开放5000-5500之间的端口：firewall-cmd --zone=public --add-port=5000-5500/tcp --permanent
  - 移去5000-5500之间的端口：firewall-cmd --zone=public --remove-port=5000-5500/tcp --permanent
- 开放、移去服务。
  - 开放ftp服务：firewall-cmd --zone=public --add-service=ftp --permanent
  - 移去http服务：firewall-cmd --zone=public --remove-service=ftp --permanent
- 重新加载防火墙配置（修改配置后要重新加载防火墙配置或重启防火墙服务）。
  - firewall-cmd --reload
- 设置开机时启用、禁用防火墙服务。
  -  启用服务：systemctl enable firewalld
  -  禁用服务：systemctl disable firewalld



## 3、centos7 之前的版本

1）开放80，22，8080 端口。

/sbin/iptables -I INPUT -p tcp --dport 80 -j ACCEPT

/sbin/iptables -I INPUT -p tcp --dport 22 -j ACCEPT

/sbin/iptables -I INPUT -p tcp --dport 8080 -j ACCEPT



2）保存。

/etc/rc.d/init.d/iptables save

3）查看打开的端口。

/etc/init.d/iptables status

4）启动、关闭防火墙服务。

\# 启动服务

service iptables start

\# 关闭服务

service iptables stop

5）设置开机时启用、禁用防火墙服务。

\# 启用服务

chkconfig iptables on

\# 禁用服务

chkconfig iptables off



## 4、云平台访问策略配置

如果您购买的是云服务器，除了配置云服务器的防火墙，还需要登录云服务器提供商的管理平台配置访问策略（或安全组）。

不同云服务器提供商的管理平台操作方法不同，具体方法请查阅云服务器提供商的操作手册、或者百度，或者咨询云服务器提供商的客服。

# 十一、SSH 学习
