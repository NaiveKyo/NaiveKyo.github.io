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

  
