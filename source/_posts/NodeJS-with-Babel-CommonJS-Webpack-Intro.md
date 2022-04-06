---
title: NodeJS with Babel CommonJS Webpack Intro
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225220953.jpg'
coverImg: /img/20220225220953.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-03 21:15:38
summary: "NodeJS 模块化开发以及 Babel、Webpack 简介"
categories: "NodeJS"
keywords: "NodeJS"
tags: "NodeJS"
---



# 一、Node.js

## 1.1、简介

### 1、什么是 Node.js

简单来说，Node.js 就是运行在服务器的 JavaScript

Node.js 是一个事件驱动 I/O 服务端 JavaScript 环境，基于 Google 的 V8 引擎，V8 引擎执行 JavaScript 的速度非常快，性能非常好。



### 2、Node.js 有什么用

如果你是一个前端程序员，你不懂得像 PHP、Python 或 Ruby 等动态编程语言，然后你想创建自己的服务，那么 Node.js 是一个非常好的选择。

Node.js 是运行在服务器端的 JavaScript，如果你熟悉 JavaScript，那么你将会很容易学会 Node.js。

当然，如果你是后端程序员，想部署一些高性能的服务，那么学习 Node.js 也是一个非常好的选择。



## 1.2、安装

官网下载：http://nodejs.cn/download/

LTS：长期支持版本

Current：最新版

建议最好默认安装到 c 盘，其他盘可能会出现问题。



浏览器的内核包括两部分核心：

- DOM 渲染引擎
- js 解析器（js 殷勤）
- js 运行在浏览器内核中的 js 引擎内部

Node.js 是脱离浏览器环境运行的 JavaScript 程序，基于 V8 引擎（Chrome 的 Javascript 引擎）



vicode 工具中打开命令行窗口



## 1.3、npm

### 命令的使用

- npm -v

- npm install -g

- npm list -g 所有全局安装的模块

- npm list 模块 ：查看安装的模块的版本号

- npm lsit -g 模块 : 查看全局安装的模块的版本号

- npm uninstall

- npm update 模块

- npm search 模块

- npm init -y   ： 初始化

- npm list --depth=0

  ```bash
  –depth 表示深度，我们使用的模块会有依赖，深度为零的时候，不会显示依赖模块
  
  当然我们可以在加参数 npm list --depth=0 [--dev | --production]
  ```

- npm list --depth --global 这个指令用来查看全局安装了哪些工具





### 1、简介

> 什么是 NPM

NPM 全称 Node Package Manager，是 Node.js 包管理工具，是全球最大的模块生态系统，里面所有的模块都是开源免费的，也是 Node.js 的包管理工具，相当于后端中的 Maven。

- npm 类似于 maven，用在前端中，管理前端 js 依赖，联网下载 js 依赖，比如 jquery



> NPM 工具的安装位置

我们通过 npm 可以很方便的下载 js 库，管理前端工程。

Node.js 默认安装的 npm 包和工具的位置：Node.js 目录\node_modules



> 演示 npm 具体操作

（1）npm 项目初始化操作

- 使用 `npm init`
- 或者使用 `npm init -y` 一键生成，就是默认全是确定

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220406211323.png)

会生成一个文件：`package.json`，类似于 maven 的 pom.xml

（2）npm 下载 js 依赖

- `npm install 依赖名称`
- 根据 package.json 文件下载依赖 : `npm install`



### 2、修改 npm 镜像

NPM 官方管理的包都是从 http://npmjs.com 下载的，但是这个网站在国内比较慢

我们推荐使用淘宝的 NPM 镜像 http://npm.taobao.org/，淘宝 NPM 是一个完整的 npmjs.com 镜像，同步频率为 10 分钟一次，以保证和官方服务同步

**设置镜像地址：**

```shell
# 经过下面的配置，以后所有的 npm install 都会经过淘宝的镜像
npm config set registry https://registry.npm.taobao.org

# 查看 npm 配置信息
npm config list
```



### 3、npm install 命令使用

例如下载 jquery

```
npm install jquery
```

之后项目下多出一个文件夹和一个文件

- node_modules 文件夹：存放的是前端项目导入的模块（一个个 js 库）
- package-lock.json ：锁定当前项目使用的外部 js 模块的版本，类似于 后端 模块化开发中 父工程 的 dependencymanager

```shell
# 直接使用 npm install 下载的模块是最新版的
npm install jquery

# npm 管理的项目在备份和传输时一般不携带 node_modules 文件夹
npm insatll # 根据 package.json 中的配置下载依赖，初始化项目

# 如果安装时想指定特定的版本
npm install jquery@2.1.x

# devDependencies 节点：开发时的依赖包，项目打包到生产环境的时候不包含的依赖
# 使用 -D 参数将依赖添加到 devDependencies 节点
npm install --save-dev eslint
# 或者
npm install -D eslint

# 全局安装
# Node.js 全局安装的 npm 包和工具的位置：用户目录\AppData\Roaming\npm\node_modules
# 一些命令行工具使用全局安装的方式
npm install -g webpack
```



### 4、其他命令

```shell
# 更新包（更新到最新版本）
npm update 包名
# 全局更新
npm update -g 包名
# 卸载包
npm uninstall 包名
# 全局卸载
npm uninstall -g 包名
```



## 1.4、**npm 常用命令**

- npm install
- npm install --save
- npm install --save-dev
- npm install -g
- npm uninstall -g
- npm cache clean --force  下载失败的时候可以清除缓存

# 二、Babel

babel 是转码器，把 ES6 代码转换成 ES5 代码

ES6 浏览器兼容性很差



## 2.1、简介

Babel 是一个广泛使用的转码器，可以将 ES6 代码转换成 ES5 代码，从而在现有环境执行。



## 2.2、安装

> 安装命令行转码工具

Babel 提供 babel-cli 工具，用于命令行转码：

```shell
npm install --global babel-cli

# 查看是否安装成功
babel --version
```



## 2.3、Babel 的使用

### 1、初始化项目

```shell
npm init -y
```

### 2、创建文件

下面是一段 ES 6 代码：

创建 js 文件

```html
// 转码前
// 定义数据
let input = [1, 2, 3];
// 将数组每个元素 +1
input = input.map(item => item + 1);
console.log(input);
```

### 3、创建 babel 配置文件 **.babelrc**

Babel 的配置文件是 .babelrc，存放在项目的根目录下，该文件用来设置转码规则，基本格式如下：

```json
{
  "presets": [],
  "plugins": []
}

// 例如当前项目可以这样写
{
    "presets": ["es2015"],
    "plugins": []
}
```

- presets：设置转码规则

### 4、安装转码器

在项目中安装

```shell
npm install --save-dev babel-preset-es2015
```



### 5、转码

```shell
# 转码结果写入一个文件
mkdir dist1
# --out-file 或 -o 参数指定输出文件
babel src/example.js --out-file dist1/compiled.js
# 或者
babel src/example.js -o dist1/compiled.js

# 整个目录转码
mkdir dist2
# --out-dir 或 -d 参数指定输出目录 
babel src --out-dir dist2
# 或者
babel src -d dist2
```



# 三、模块化开发

## 3.1、模块化产生的背景

随着互联网规模的不断增大，嵌入网页的 JavaScript 代码越来越庞大，越来越复杂。



（1）开发后端接口时，controller、service、mapper，通过注入解耦

在后端，类于类之间的调用称为模块化操作

（2）**前端模块化：在前端中，js 与 js 之间的调用称为前端模块化操作**



## 3.2、什么是模块化开发

传统非模块化开发的缺点：

- 命名冲突
- 文件依赖

模块化规范：

- CommonJS 模块化规范
- ES6 模块化规范



## 3.3、CommonJS 模块规范 （ES5 的方式）

每个文件就是一个模块，有自己的作用域，在一个文件里面定义的变量、函数、类都是私有的，对其他文件不可见。



### （1）创建 "module" 文件夹

### （2）导出模块

创建 common-js 模块化/四则运算.js



01.js

```javascript
// 创建 js 方法

// 定义成员
const sum = function(a, b) {
    return parseInt(a) + parseInt(b);
}

const subtract = function(a, b) {
    return parseInt(a) - parseInt(b);
}

// 设置哪些方法可以被其他模块调用
module.exports = {
    sum: sum,
    substract: subtract
};

// 简写
module.exports = {
  sum,
  substract
}
```

但是这样还是会存在一些问题，比如方法名命名冲突的问题，想要解决，最好的方法就是自己定义一个命名空间，然后给改空间定义一些方法。

最后导出这个命名空间。

```javascript
// 定义命名空间
var test = {};

// 定义成员
test.sum = function (a, b) {
    return parseInt(a) + parseInt(b);
}

test.subtract = function (a, b) {
    return parseInt(a) - parseInt(b);
}

// 设置哪些方法可以被其他模块调用
module.exports = test;
```

02.js

```javascript
// 导入 01.js 的命名空间
var test = require('./01.js');

console.log(test.sum(1, 2));
console.log(test.subtract(1, 2));
```

## 3.4、ES6 的模块化代码写法

注意：这时程序无法运行，因为 ES6 的模块化无法在 Node.js 中运行，需要用 Babel 转换成 ES5 代码。

两种写法：

> 写法一

01.js

```javascript
export function getList() {
    console.log(1);
}

export function save() {
    console.log(2);
}
```

02.js

```javascript
import { getList, save } from "./01.js";
getList();
save();
```

> 写法二

01.js

```javascript
export default {

    getList() {
        console.log('getList....');
    },

    update() {
        console.log('update....');
    }
}
```

02.js

```javascript
import m from "./01.js";
m.getList();
m.save();
```

**方式二更好一些**



# 四、Webpack

## 4.1、什么是 Webpack

Webpack 是一个前端资源加载/打包工具。它将根据模块的依赖关系进行静态分析，然后将这些模块按照指定的规则生成对应的静态资源。



例如，可以将多种静态资源：js、css、less，**转换成一个静态文件，减少了页面的请求。**



**打包工具**



## 4.2、安装 Webpack 插件

> （1）全局安装

```shell
npm install -g webpack wepack-cli
```

> （2）查看版本号

```shell
webpack -v
```



## 4.3、webpack 打包 js 文件

（1）创建新工程

（2）初始化

（3）安装 webpack 和 webpack-cli

（4）在项目根目录下创建 webpack 的配置文件，配置打包信息

`webpack.config.js`

```javascript
const path = require("path");   // node.js 的核心模块

module.exports = {
    entry: './src/main.js',     // 配置文件入口
    output: {
        path: path.resolve(__dirname, './dist'),    // 输出目录，__dirname: 当前文件所在路径
        filename: 'bundle.js'   // 输出文件
    }
}
```

上面是一个简易的配置。

（5）命令行执行编译命令

```shell
webpack	# 黄色警告  这时是 production 模式，所有代码经过压缩显示在一行

webpack --mode=development # 无警告，此时是 development 模式
# 执行后查看 bundle.js 里面包含了上面两个 js 文件的内容并进行了代码压缩
```

也可以配置项目的 npm 命令，修改 package.json 文件

```json
{
  "name": "Webpack_demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  
  // 在这里面加上
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
    "dev": "webpack --mode=development"
  },
  
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

然后运行 npm 命令执行打包：

```shell
npm run dev
```



（6）最终测试

写一个 html 文件，将 bundle.js 引入该 html，然后在浏览器页面中打开



## 4.4、webpack 打包 css 文件

（1）创建 css 文件

（2）在 main.js 引入 css 文件

```javascript
const style = require('./style.css')
```

（3）安装 css 加载工具

```shell
npm install --save-dev style-loader css-loader
```

（4）修改 webpack 配置文件

```javascript
const path = require("path");   // node.js 的核心模块

module.exports = {
    entry: './src/main.js',     // 配置文件入口

    output: {
        path: path.resolve(__dirname, './dist'),    // 输出目录，__dirname: 当前文件所在路径
        filename: 'bundle.js'   // 输出文件
    },

    module: {
        rules: [
            {
                test: /\.css$/,     // 打包规则应用到以 css 结尾的文件上
                use: ['style-loader', 'css-loader']
            }
        ]
    }
}
```

（5）重新执行 webpack 编译命令