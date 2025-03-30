---
title: Install And Deploy GitLab CE
published: 2025-03-22
description: "Install and deploy GitLab CE on CentOS7"
image: './20220918190852.jpg'
tags: ["Linux"]
category: "Linux"
draft: false
lang: 'zh'
---

# GitLab CE

## 安装软件

虚拟机安装开源社区版本的 gitlab 服务，相关系统支持参考：

* https://docs.gitlab.com/ee/administration/package_information/supported_os.html

虚拟机使用的是 CentOS 7，可以在文档的 "OS versions that are no longer supported" 标题下看到相关信息， CentOS 7 系统最后的 lst 版本是 GitLabCE 17.7，在 2024 年六月就 eof 了。

点击链接跳转到 GitLab CE 的资源地址：

* https://packages.gitlab.com/app/gitlab/gitlab-ce/search?q=17.7&filter=all&filter=all&dist=el%2F7

可以直接下载 rpm 文件上传到虚拟机中安装，也可以参考安装教程：

* https://packages.gitlab.com/gitlab/gitlab-ce/install

下载安装脚本，将 GitLab 的软件仓库添加到系统的 yum 源中。

成功加进来后，执行命令安装：

```shellscript
# 添加软件源
curl -s https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.rpm.sh | sudo bash

# 先搜索看看是否能搜出来
yum search gitlab

# 能搜索到就直接安装
yum install -y gitlable-ce.x86_64
```

安装完成后会有一些提示信息：

```
It looks like GitLab has not been configured yet; skipping the upgrade script.

       *.                  *.
      ***                 ***
     *****               *****
    .******             *******
    ********            ********
   ,,,,,,,,,***********,,,,,,,,,
  ,,,,,,,,,,,*********,,,,,,,,,,,
  .,,,,,,,,,,,*******,,,,,,,,,,,,
      ,,,,,,,,,*****,,,,,,,,,.
         ,,,,,,,****,,,,,,
            .,,,***,,,,
                ,*,.
  


     _______ __  __          __
    / ____(_) /_/ /   ____ _/ /_
   / / __/ / __/ /   / __ `/ __ \
  / /_/ / / /_/ /___/ /_/ / /_/ /
  \____/_/\__/_____/\__,_/_.___/
  

Thank you for installing GitLab!
GitLab was unable to detect a valid hostname for your instance.
Please configure a URL for your GitLab instance by setting `external_url`
configuration in /etc/gitlab/gitlab.rb file.
Then, you can start your GitLab instance by running the following command:
  sudo gitlab-ctl reconfigure

For a comprehensive list of configuration options please see the Omnibus GitLab readme
https://gitlab.com/gitlab-org/omnibus-gitlab/blob/master/README.md

Help us improve the installation experience, let us know how we did with a 1 minute survey:
https://gitlab.fra1.qualtrics.com/jfe/form/SV_6kVqZANThUQ1bZb?installation=omnibus&release=17-7
```

可以看到我们缺少一些必要的配置，需要先配一个有效的 hostname，再修改 `/etc/gitlab/gitlab.rb` 文件中的 external\_url 配置，这样就可以通过特定的 url 访问 gitlab 服务。配置好后需要执行 `sudo gitlab-ctl reconfigure` 命令启动服务。

关于 GitLab 的诸多配置和使用方法可以参考官方文档：https://gitlab.com/gitlab-org/omnibus-gitlab/blob/master/README.md 

```shellscript
# 修改主机名
> hostnamectl set-hostname test.gitlab.com
# 不重启的情况下，执行以下命令使当前会话生效
> exec bash
# 修改 hosts 文件
> vim /etc/hosts
# 添加
127.0.0.1 test.gitlab.com

# 重启网络服务
> systemctl restart network

# 确保 openSSH 服务正常
> systemctl status sshd
```

修改 gitlab.rb 文件，修改 external\_url 为虚拟机 ip：

```shellscript
> vim /etc/gitlab/gitlab.rb
external_url 'http://192.168.200.101'

# 使配置生效并启动服务
gitlab-ctl reconfigure
# 输出很多东西，需要一段时间，最后会提示
[2025-02-11T19:53:13+08:00] INFO: Report handlers complete
Infra Phase complete, 585/1613 resources updated in 03 minutes 50 seconds

Deprecations:
Your OS, centos-7.9.2009, will be deprecated soon.
Starting with GitLab 17.8, packages will not be built for it.
Switch or upgrade to a supported OS, see https://docs.gitlab.com/ee/administration/package_information/supported_os.html for more information.

Update the configuration in your gitlab.rb file or GITLAB_OMNIBUS_CONFIG environment.


Notes:
Default admin account has been configured with following details:
Username: root
Password: You didn't opt-in to print initial root password to STDOUT.
Password stored to /etc/gitlab/initial_root_password. This file will be cleaned up in first reconfigure run after 24 hours.

NOTE: Because these credentials might be present in your log files in plain text, it is highly recommended to reset the password following https://docs.gitlab.com/ee/security/reset_user_password.html#reset-your-root-password.

gitlab Reconfigured!
```

查看 GitLab 所有 Component 运行状态：

```shellscript
> gitlab-ctl status

run: alertmanager: (pid 1828) 1594s; run: log: (pid 1821) 1594s
run: gitaly: (pid 1804) 1594s; run: log: (pid 1803) 1594s
run: gitlab-exporter: (pid 1818) 1594s; run: log: (pid 1817) 1594s
run: gitlab-kas: (pid 1834) 1594s; run: log: (pid 1830) 1594s
run: gitlab-workhorse: (pid 1842) 1594s; run: log: (pid 1841) 1594s
run: logrotate: (pid 1815) 1594s; run: log: (pid 1813) 1594s
run: nginx: (pid 1819) 1594s; run: log: (pid 1808) 1594s
run: node-exporter: (pid 1825) 1594s; run: log: (pid 1823) 1594s
run: postgres-exporter: (pid 1829) 1594s; run: log: (pid 1822) 1594s
run: postgresql: (pid 1831) 1594s; run: log: (pid 1824) 1594s
run: prometheus: (pid 1838) 1594s; run: log: (pid 1837) 1594s
run: puma: (pid 1833) 1594s; run: log: (pid 1832) 1594s
run: redis: (pid 1816) 1594s; run: log: (pid 1814) 1594s
run: redis-exporter: (pid 1827) 1594s; run: log: (pid 1826) 1594s
run: sidekiq: (pid 1836) 1594s; run: log: (pid 1835) 1594s
```

GitLab 内嵌了很多服务，比如 nginx、redis、postgresql 等，官方文档中也有关于使用非内嵌组件的方式，进行相关配置后可以使用其他服务部署的 nginx 等软件。



防火墙放开 80 端口，用于访问 gitlab 服务：

```shellscript
> firewall-cmd --zone=public --add-port=80/tcp --permanent
> firewall-cmd --reload
> firewall-cmd --list-port
```

GitLab 服务安装完成后会自动注册到 systemd 单元服务，可以通过命令找到对应服务：

```shellscript
$ systemctl -a | grep gitlab
gitlab-runsvdir.service

# 查看服务运行状态
$ systemctl status gitlab-runsvdir.service

# 通过 
```

在宿主机浏览器上通过虚拟机 ip 访问虚拟机中的 GitLab 服务，默认情况下 GitLab 占用 80 端口；

在安装完 gitlab 后，输出的提示中有 root 账户的初始密码会存在 `/etc/gitlab/initial_root_password` 文件中，但是会在初次执行 gitlab-ctl reconfigure 命令 20h 后清除，我们可以通过 Rake task 执行：

```shellscript
# 如果是使用 linux package(omnibus) 安装的，可以使用 gitlab-rake 命令
# 输入以下命令进行交互式修改密码逻辑
sudo gitlab-rake "gitlab:password:reset"
Enter username: root
Enter password: 
Confirm password: 
Password successfully updated for user with username root.
```

参考：https://docs.gitlab.com/ee/security/reset_user_password.html



## GitLab 软件目录结构

参考：https://gitlab.com/gitlab-org/omnibus-gitlab/blob/master/README.md

Omnibus-gitlab 使用四个不同的目录：

* `/opt/gitlab` ：保存 GitLab 的源代码及其依赖；
* `/var/opt/gitlab` ：保存 GitLab 的程序数据以及通过 gitlab-ctl reconfigure 写入的配置文件；
* `/etc/gitlab` ：保存 omnibus-gitlab 的配置文件，通过手动修改这些配置文件来调整程序；
* `/var/log/gitlab` ：保存 omnibus-gitlab 所有组件产生的运行时日志；



补充：omnibus-gitlab 和 SELinux，虽然它运行在启用了 SELinux 的系统上，但是它并不受 SELinux 的限制规则，比如：

* omnibus-gitlab 会创建一些不受限制的系统用户；
* omnibus-gitlab 程序会运行在一个不受限制的上下文中；

如果 monibus-gitlab 因为 SELinux 的限制导致安装失败，也可以通过调整 SELinux 限制级别来解决问题。



## 常用命令

参考：https://gitlab.com/gitlab-org/omnibus-gitlab/-/blob/master/doc/maintenance/_index.md



## 安全问题

这里只是简单的在虚拟机中部署 GitLab 服务，如果是真实的环境需要考虑安全问题，比如防火墙、用户登录限制等等。



## 参考

* https://medium.com/@srghimire061/how-to-install-and-configure-gitlab-ce-on-centos-8-7-dcc5da807e0f
* https://docs.gitlab.com/
* https://docs.gitlab.com/ee/install/requirements.html
* https://gitlab.com/gitlab-org/omnibus-gitlab/-/blob/master/doc/settings/configuration.md

如果要考虑使用源码编译安装，可以参考：https://docs.gitlab.com/ee/install/installation.html

