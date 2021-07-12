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



## 二、从 master 分支迁移到 main 分支

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



