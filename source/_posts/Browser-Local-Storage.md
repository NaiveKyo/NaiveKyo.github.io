---
title: Browser Local Storage
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210715103346.jpg'
coverImg: /img/20210715103346.jpg
toc: true
date: 2021-07-15 10:32:23
top: false
cover: false
summary: 关于浏览器本地存储的相关知识
categories: Browser
keywords: [Browser, Storage]
tags: [Browser, Storage]
---



# 浏览器本地存储



## 1、localStorage

只有两种情况会清空 Local Storage 的所有数据：

- 用户主动清空所有缓存数据
- 主动触发按钮清空数据



## 2、sessionStorage

Session Storage 和  Local Storage 不同的地方在于，浏览器关闭后就被清空



## 3、总结

Cookie，SessionStorage、LocalStorage 这三者都可以被用来在浏览器端存储数据，而且都是字符串类型的键值对。



注意：session  和 Session Storage 不是一个概念。在服务端有一种存储方式叫做：session 会话存储，常常被简称 session

SessionStorage 和 LocalStorage 都是浏览器本地存储，统称为 Web Storage，存储内容大小一般支持 5-10MB

浏览器端通过 Window.sessionStorage 和 Window.localStorage 属性来实现本地存储机制。



备注：

- Session Storage 的存储内容会随着浏览器的关闭而清空

- Local Storage 中存储的内容，需要手动清空才会消失
- xxxStroage.getItem('key') 获取不到就返回 null，**JSON.parse(null)** 的结果是 null
