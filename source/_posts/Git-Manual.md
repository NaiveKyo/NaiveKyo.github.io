---
title: Git_Manual
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/18.jpg'
coverImg: /medias/featureimages/18.jpg
toc: true
date: 2021-07-12 19:55:21
top: true
cover: true
summary: 关于使用 Git 过程中遇到的问题
categories: Git
keywords: [Git, Version-Control]
tags: Git
---



## 一、常规流程

考虑到 GitHub 初始化项目时可能会选择生成 Readme.md ，所以可以这样：

**注意：现在 GitHub 仓库默认分支已经切换为 `main`**

> 以前初始化的流程

```bash
// 初始化本地 git 仓库
git init 

// 关联远程仓库
git remote add origin git@github:Xxx/Xxx.git

// 拉取远程仓库 指定分支代码 和本地 git 分支合并
git pull origin master:master

// 将本地新的文件添加到 git 仓库
git add .

// 提交到本地仓库
git commit -m "message"

// 推送到远程仓库指定分支
git push -u origin master
```



## 二、Git 基础知识

> 了解 Git 项目的三个部分

- Git 目录
- 工作目录（或工作树）
- 暂存区



**Git 目录**（位于 `YOUR-PROJECT-PATH/.git/` 中）是 Git 存储准确跟踪项目所需的所有内容的位置。这些内容包括元数据和一个对象数据库，其中包含项目文件的压缩版本。



**工作目录**是用户在本地对项目进行更改的地方。工作目录从 Git 目录的对象数据库中提取项目的文件，并将其放置在用户的本地计算机上。



**暂存区** 是一个文件，用于存储下一次 commit 内容的信息。“commit” 的意思是你告诉 Git 保存暂存区的更改。 Git 照原样拍摄文件快照，并将该快照永久存储在 Git 目录中。



在三个部分中，文件可以在任何给定时间处于三种主要状态：提交，修改或暂存。在工作目录中对文件进行**修改**，然后，将其移至暂存区进行**暂存**，最后，commit 提交文件。





## 三、从 master 分支迁移到 main 分支

由于现在 GitHub 默认分支变为 `main`，但是本机的 git 程序初始化项目时，默认分支依旧是 `master` 分支，这时候推送代码会出现错误，所以采取以下方式：

```bash
// 初始化
git init 

// 关联远程仓库
git remote add origin git@github:Xxx/Xxx.git

// 拉取远程仓库
git pull origin main:master

// 创建并切换到 main 分支
git checkout -b main

// 将本地新的文件添加到 git 仓库
git add .

// 提交到本地仓库
git commit -m "message"

// 推送 main
git push origin main

// 删除本地 master 分支
git branch -d master

// 如果远程有 master 分支，则删除 master 分支
git push origin :master

// 迁移成功
```



## 四、遇到的错误及解决方法

### 1、一次性 push 的文件太大



解决方法（一）：

```bash
# 设置 git config 的 postBuffer 的大小 (设置为 500MB)
git config --local http.postBuffer 524288000
# 注：--local选项指定这个设置只对当前仓库生效。
```



解决方法（二）：

- 一次 add 几个文件夹，然后提价，最后 push
- 多分几次 push 就好了



### 2、一次 add 的文件太多，不能一次性 commit 

解决方法：

- 撤销 add 的所有文件

  ```bash
  git reset HEAD
  ```




## 五、Idea 中管理 gitee 仓库协同开发

### 1、初始化项目

项目组长在本地创建项目将其分享到 gitee 远端并生成仓库，然后邀请开发成员进入项目组。

各个组员在版本控制 `VCS` 中点击 **Get From Version Control**，选择要克隆的远程仓库，将仓库拉取到本地。



### 2、分支管理（重要）

分支有两种实现方式：

- 组长创建分支，小组成员在 idea 中使用组长为每个人创建的分支

- 小组成员自由创建分支，详情见后面



#### （1）组长为组员创建分支

在 gitee 的仓库中创建不同分支并分配给组员

**idea 中刷新分支信息**：点击 Git 的 pull 功能，点击 Remote 右边的刷新按钮，然后 pull 就可以显示最新的分支信息了。



idea 右下角下面可以显示远程仓库的分支信息：

- `New Branch`：新建分支
- `Local Branches`：默认主分支
- `Remote Branches`：项目分支列表



作为组长，仓库权限最大，组长上传可以选择默认的主分支，也可以选择新建一个分支，上传后再合并。

当代码写完后，选中新增的文件、修改的代码文件，点击 idea 右下角的分支信息。

- 选中自己的分支，点击 `check out`，表示将该分支设置为自己的主分支，如果点击分支只显示 `rename 和 push` 两个选择，则表示你已经选中了该分支，不需要做任何操作
- 切换成自己的分支之后，可以编写代码进行 commit，idea 的 VCS 下面的 commit 功能集成了 git 命令行的 add、commit、push 命令，但是还是需要注意：
  - master 分支直接 commit 会列出很多文件，建议全部提交
  - 其他分支 commit 的时候建议只选择自己修改的或者新增的代码文件提交，未选中的一般都是 XML 格式文件，这是本地项目配置和修改记录的文件，可提交可不提交，最重要的还是列表里自己修改或新增的代码文件



#### 合并分支

> gitee 合并

**合并方法1：**

1. 组长上传代码到 master 分支，**master** 是整个项目的核心，也是代码的全部，小组成员的代码提交到其他分支，组长需要把小组成员的代码合并到主分支上来
2. 合并方法如下
   - 进入项目仓库，选择 `pull requests`
   - 点击新建 pull requests
   - 选择刚刚提交了代码的分支，同时选择目标分支（一般是 master）
   - 输入标题、说明
   - 最后点击创建
   - 创建完成后组长需要审核和测试，最终确认无误后合并到主分支
3. 组长选择合并分支的时候可能会出问题，顺利的话就是审核、测试通过后直接合并，不顺利的话，需要手动选择分支提交的代码，页面会有相应的返回数据，每个文件审查选择引入即可，引入选择结束后需要点击左侧文件后面的小圆圈，进行 add 操作，代码切换到顶部区域表示正确，全部完成后点击下面的提交，再继续 “审核通过” 这些操作。
4. 项目合并后代码丢失的问题就出现在这个阶段，小组成员上传的代码包含大量 .xml 文件，不同之处太多，手动选择合并时 **两者都接收** 才算是合并代码，选择前面两个会引起代码丢失，所以，**建议小组成员 commit 时只选择自己新增或者修改的相关文件**，会减少很多麻烦







**合并方法2：**

注意：方法2 需要组长将项目的主分支（一般是 master）改为常规分支，而不能是保护分支或只读分支，这样组员才有权力 push 到 主分支。



1. 成员在自己的分支提交代码后，切换到主分支
2. 选中 `local branches` 下自己的分支，点击 `Merge into Current`，这个 Current 就是指项目的默认主分支 master
3. 最终分支代码会合并到主分支代码中，**最后不要忘了将主分支 push 到远端**

![img](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210715171147.png)



#### （2）组员自己创建分支

1. 严禁小组成员提交代码到 **master** 分支，提交后会覆盖项目，所有人努力付之一炬，必须提交到分支，交给组长统一管理将代码合并到项目中

2. 组员检查分支，在 idea 右下角点击 git 的标识，会出现两种情况：

   - 如果组长有给你分配的分支，那么在刷新分支信息（见初始化项目部分）后， `Remote Branches` 会显示你的分支，点击该分支，点击 checkout（就是检查并选择此分支），提示成功后，再点击该分支，出现的选项就只有 rename 和 push 两个。
   - 如果组长没有给组员分配分支，那么该组员就需要自己新建一个，点击 **New Branch**，输入自定义的分支名，点击确认，建议使用英文并具有辨识度
   - 创建新分支后，默认选择该分支

3. 创建新分支后，我们需要将新分支提交到远程仓库中：

   - 在新分支中修改代码或者添加文件

   - 将项目 add：`VCS  -> Git -> Add`，add 操作完成
   - 右键项目 `Git -> Commit Directory` ，编辑提交信息，最后点击 `commit and push`，将新的分支提交到远端

4. 提交后：

   - 要么组长使用 pull request 功能合并提交的新分支
   - 要么组长将 master 分支设置为常规分支，组员自己切换到主分支然后合并新分支并提交



### 3、将远端代码更新到本地

要么 pull

要么直接 VCS 下面的 `Update Project`

需要注意，小组成员分支提交的代码一定要及时合并，若没有及时合并，更新下去的代码会覆盖本地。

