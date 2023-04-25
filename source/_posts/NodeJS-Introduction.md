---
title: NodeJS Introduction
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425111500.jpg'
coverImg: /img/20220425111500.jpg
cover: false
toc: true
mathjax: false
date: 2023-04-25 22:48:54
summary: "阅读 Node.js 官方文档并了解 CommonJS 和 ESModule"
categories: "NodeJS"
keywords: "NodeJS"
tags: "NodeJS"
---

# Node.js

https://nodejs.org/en/docs/guides

# About

参考：

- https://nodejs.org/en/about
- https://nodejs.org/en/docs/guides/blocking-vs-non-blocking
- https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick
- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Event_loop

作为一个异步事件驱动的 JavaScript 运行时环境，Node.js 主要的设计目的就是为了开发具备良好伸缩性的网络应用程序。

参考下面的 'hello world' 例子：

```javascript
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

每个请求都会被并发的处理，而针对每个 connection，最后都会触发 callback 函数，但是如果没有要处理的工作，node.js 就会处于休眠状态。

和 C、Java 等语言的采用的并发模型不同（它们一般会利用开辟 os 线程来并发处理工作，但是这也提高了编程的复杂性），而 node.js 不同，不必担心类似死锁的问题，因为它没有用到锁，在 node.js 库提供了两类方法，一种是基于事件循环机制（或者称为异步非阻塞），一种是同步的方式（一般以 sync 为后缀的方法），除非使用后一种方法执行 I/O 操作，否则就不会阻塞。

关于事件循环和 node.js 中的阻塞/非阻塞参考：

- https://nodejs.org/en/docs/guides/blocking-vs-non-blocking
- https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick
- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Event_loop

# Getting Started

按照 node.js 环境后，使用 vscode 编写如下 js 代码：

```javascript
const http = require('http')

const hostname = '127.0.0.1'
const port = 3000

const server = http.createServer((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('Hello World.')
})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})
```

进入 terminal 输入 node ./getting-started.js，可以看到控制台输出相应的提示，浏览器访问 http://127.0.0.1:3000 也能看到响应。

> Debugging Guide

参考：

- https://nodejs.org/en/docs/guides/debugging-getting-started#exposing-the-debug-port-publicly-is-unsafe

针对 node.js 应用程序，我们可以在开发阶段使用 debug 模式，使用方法如下：

```javascript
// 控制台启动应用， 加上 --inspect 参数
node --inspect xxx.js
```

可以看到 terminal 输出类似如下提示：

```
Debugger listening on ws://127.0.0.1:9229/eca813fb-2f6a-4c7a-a0b4-40b780dcef2c
For help, see: https://nodejs.org/en/docs/inspector
Server running at http://127.0.0.1:3000/
Debugger attached.
Debugger listening on ws://127.0.0.1:9229/eca813fb-2f6a-4c7a-a0b4-40b780dcef2c
For help, see: https://nodejs.org/en/docs/inspector
```

默认的 debug client 是绑定本地 ip 的，也可以绑定其他 ip。

在浏览器上也可以使用 inspect 工具：

- Chrome：搜索栏输入 `chrome://inspect` 或者打开网页控制台使用 devtool；
- Edge：搜索栏输入 `edge://inspect`；

也可以使用 vscode 的 debug mode 启动；

# Introduction to Node.js

https://nodejs.dev/en/learn/

node.js 中有很多标准模块，前面的例子中使用了 'http' 模块用于构造服务实例，更多 module 可以参考官方文档，根据需要使用。

https://nodejs.org/api/

# Prerequisite: JavaScript

学习 node.js 前至少应该掌握这些 JavaScript 知识：https://nodejs.dev/en/learn/how-much-javascript-do-you-need-to-know-to-use-nodejs/

这里简单罗列一些要点：

- JavaScript 中的各种关键字和运算符；
- JavaScript 的数据类型和数据结构；
- JavaScript 的 [class](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)；
- [各种变量](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/First_steps/Variables)
- [函数（非常重要）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Functions)：闭包特性
- [this 运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
- [箭头函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)，JavaScript 中的箭头函数是匿名函数，比常规函数定义更简短且不绑定 this
- [循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Loops_and_iteration)
- [Scope 作用域](https://developer.mozilla.org/zh-CN/docs/Glossary/Scope)
- [数组](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [模板字符串](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Template_literals)
- [严格模式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode)
- [ES5、ES6 以及后续的规范](https://nodejs.dev/en/learn/ecmascript-2015-es6-and-beyond/)

记住上面这些概念，才可以成为一个熟练的 JavaScript 开发者， 不管是 browser 还是 Node.js 环境都能进行开发。

除此之外，还有一些关于异步编程的知识，它们也是 Node.js 的一部分：

- [异步 JavaScript](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Asynchronous/Introducing)：早期的回调函数、现在的 Promise、async 和 await 关键字、workers
- [Timer](https://developer.mozilla.org/zh-CN/docs/Web/API/setTimeout)：JavaScript 的定时器，以及为了兼容旧版本浏览器的 polyfill
- [Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)
- [async 和 await 关键字](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
- [闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
- [并发模型与事件循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Event_loop)

# Node.js 和 Browser 环境的不同

注意不管是 Node.js 还是 Browser 都使用 JavaScript 作为编程语言。构建在浏览器中运行的应用程序与构建 Node.js 应用程序是完全不同的。

在浏览器中开发时，开发者大部分时间在和 DOM 进行交互，或者使用其他的 Web Platfrom API 例如 Cookies。但是这些东西在 Node.js 中都不存在，你不能使用 document、window 或者其他由浏览器提供的对象。

同样浏览器也不会提供例如 Node.js 中的诸多有用的 API，Node.js 通过 modules 提供这些东西，比如对文件系统的访问。

其他一个巨大的不同之处就在于 Node.js 允许开发者管理环境，包括特定版本的 Node.js、不同的浏览器等等。

其他一个不同之处在于从 Node.js v12 版本之后，Node.js 同时支持 CommonJS 和 ES module。而浏览器才刚刚开始支持标准 ES module。实际上在 Node.js 中，你可以同时使用 `import` 和 `require()`，而在浏览器中只能使用 `import`；

# The V8 JavaScript Engine

（1）简介

V8 指的是由 Google 开发的 JavaScript 引擎，它让 JavaScript 代码能够在浏览器中运行，也就是说 V8 为 JavaScript 提供了一个运行时环境，而浏览器则提供 DOM 和其他的 Web Platform APIs。（注意 JS 引擎和 Web Platform 共同组成运行时环境）。

有一点非常 cool 的就是 JavaScript engine 能够独立于 browser 存在，这也就导致的 Node.js 的出现。早在 2009 年，V8 就被选为支持 Node.js 的引擎，随着 Node.js 的流行，V8 成为了现在支持大量用 JavaScript 编写的服务器端代码的引擎。

Node.js 的生态十分庞大，同时 V8 也支持桌面端应用，比如像 Electron 这样的项目。

（2）其他 JS 引擎

其他的浏览器也有自己的 js 引擎，比如 Firefox 的 SpiderMonkey、Safari 的 Nitro、Edge 最早使用 Chakra，但是最近也开始使用 V8，当然还有其他的游览器有自己的引擎。

所有的 engine 都是 ECMAScript 规范的实现。

（3）性能

V8 由 C++ 编写，且在不断更新优化，它是跨平台可移植的，能够运行在很多操作系统上。

[V8 official site](https://v8.dev/)

（3）编译

以前 JavaScript 通常被认为是一门解释型的语言，但是现代的 JavaScript engines 开始不再局限于解释型，它们也开始允许编译 JavaScript。

这个变化是从 2009 年开始，当 Firefox 3.5 版本引入了 SpiderMonkey JavaScript 编译器后，其他 js 引擎也开始这样做。

V8 引擎在内部通过 `just-in-time(JIT) compilation` 技术对 JavaScript 进行编译，从而提高 JavaScript 的执行效率。

自 2004 年 Google Map 推出以后，浏览器中运行的 JavaScript 代码逐渐变得越来越多，已经不仅仅局限于过去简单的表单验证或简单脚本，JavaScript 开始作为一个完整的长时间运行在浏览器汇总的程序。

在这个新的世界里，编译 JavaScript 是完全有意义的，因为虽然可能需要更多的时间来准备 JavaScript，一旦完成准备工作，它将比纯解释的代码性能更高。

# NPM package manager

下面快速介绍一下 npm，这是一款强大的包管理工具。

如果需要深入了解 npm，可以参考 [NPM documentation](https://docs.npmjs.com/)。

简单介绍一下：

- npm 是 Node.js 标志的包管理工具；
- [Yarn](https://classic.yarnpkg.com/en/) 和 [pnpm](https://pnpm.io/) 是 npm cli 的可选替代；
- npm 管理项目所需的依赖；
- 如果项目根目录下有 `package.json` 则可以使用 `npm install` 命令下载所有依赖，将下载的依赖放入项目根目录的 `node_modules` 目录下；
- 通过 `npm install <package-name>` 下载特定的依赖，此外从 npm 5 以后这段命令会自动将依赖的名称添加到 package.json 中的 file dependencies 中，在 version 5 之前，需要添加 `--save` 选项；

常用的 flag 如下所示：

- `--save-dev`：下载依赖并将依赖名称添加到 package.json 的 `devDependencies` 中；
- `--no-save`：下载依赖但是不会将这个 entry 添加到 package.json 的 `dependencies`；
- `--save-optional`：下载依赖并将 entry 添加到 package.json 的 `optionalDependencies`；
- `--no-optional`：会阻止可选的依赖项被安装；

此外，这些 flag 还有一些缩写：

- `-S`：`--save`；
- `-D`：`--save-dev`；
- `-O`：`--save-optional`；

`devDependencies` 和 `dependencies` 的不同之处在于前者包含了一些开发工具，比如测试相关的 library，而后者将会与 prod 环境中的程序绑在一起；

至于 `optionalDependencies` 的不同之处就是如果 dependency 构建失败了并不会导致 installation 失败。但是处理缺失的依赖是程序的责任，更多信息参考 [optional dependencies](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#optionaldependencies)。

更新 packages：

- `npm update`，npm 会检测所有 packages 的符合版本约束的新版本；

更新指定的 package：

- `npm update <package-name>`

版本管理：

- 处理下载依赖之外，npm 还可以用来管理 versioning，你可以为特定的 package 指定一个版本；
- 很多时候，你会发现一个 library 只会和另一个 library 的 major release version 兼容，或者某个版本中存在bug 还未修复，此时可以选择其他修改该 bug 的版本；
- 指定库的显式版本还有助于使每个人都使用相同的包版本，依赖的版本都在 package.json 中定义

可以以如下格式按照特定库的特定版本：

- `npm install <package-name>@<version>`

Running Tasks：

package.json 文件也支持特定格式的来声明某个特定的命令行 tasks：

- `npm run <task-name`

比如这样：

```json
{
  "scripts": {
    "start-dev": "node lib/server-development",
    "start": "node lib/server-production"
  }
}
```

非常推荐使用这种方式来运行 webpack：

```json
{
  "scripts": {
    "watch": "webpack --watch --progress --colors --config webpack.conf.js",
    "dev": "webpack --progress --colors --config webpack.conf.js",
    "prod": "NODE_ENV=production webpack -p --config webpack.conf.js"
  }
}
```

用这种方式可以将很长的一段命令用简单的几个词语表示：

```bash
$ npm run watch
$ npm run dev
$ npm run prod
```

# ECMAScript 2015(ES6) and beyond

Node.js 是构建在 V8 引擎之上的，并保持使用最新的 V8 引擎，能够保证及时的将最新的 ECMAScript 规范带给开发者，以及持续的性能和稳定性改进。

所有的 ECAMScript 2015（ES 6）的特性都分为三组：

- `shipping` feature：V8 中 stable 的特性，Node.js 中默认开启这些特性不需要额外的 flag；
- `staged` feature：这些功能在 V8 中已经接近完成了，但还不稳定，所以在 Node.js 中需要加上 flag：`--harmony`；
- `in progress` feature：可以被特定的 harmory flag 激活启用，但是非常不推荐使用这些特性，除非是想自己测试看看。注意：这些特性是 V8 暴露出来的，且不能保证该特性最后是否会保留下来。

如果开发者想要知道特定版本的 Node.js 默认支持那些 shipping feature，可以参考网站：[node.green](https://node.green/)

V8 引擎通常会持续增加一些新的特性，通常来讲 Node.js 也希望这些新的特性能够尽快落地，尽管时间是未知的，如果想要列出 Node.js 中支持的 in progress feature，可以通过 `--v8-options` 参数。请注意，这些都是不完整的，可能损坏的V8特性，所以使用它们的风险由你自己承担：

- `node --v8-options | grep "in progress"`

如果使用了 `--harmony` flag 启动项目，Node.js 仅仅启用对 V8 staged feature 的支持，不会有其他操作，新的 Node 版本中它的同义词是 `--es_staging`，就像前面提到的那样，这些特性在 V8 中已经接近完成了，但是还是不稳定的，为了安全起见，在 production 环境下最好还是移除 --harmony flag。

最后如何确定当前版本的 Node.js 中支持那些 V8 ships 特性呢？

Node.js 提供了一个简单的方式用来罗列出支持的 ship 特性，可以通过 `process` 全局对象，在使用 V8 引擎的情况下，在你的终端输入以下命令来检索它的版本：

`node -p process.versions.v8`

# Node.js 中 development 和 production

Node.js 可以为开发环境和生产环境准备两套配置。

默认情况下 Node.js 认为启用开发环境配置比较合适，开发者可以通过设置环境变量来更改这个默认行为，比如想让 Node.js 默认启用生产环境：`NODE_ENV=production`

执行以下命令：

- `export NODE_ENV=production`

但是最好将它放在 shell 配置文件中(例如，在 Bash shell 中使用 .bash_profile )，否则在系统重新启动的情况下，该设置不会持续存在。

你也可以通过在应用程序初始化命令前加上环境变量来应用它：

- `NODE_ENV=production node app.js`

这个环境变量也是在外部库中广泛使用的约定。

将环境设置为生产环境通常可以确保这一点

- 日志记录保持在最低的必要级别
- 使用更多的缓存级别来优化性能

您可以使用条件语句在不同的环境中执行代码：

```javascript
if (process.env.NODE_ENV === 'development') {
  // ...
}

if (process.env.NODE_ENV === 'production') {
  // ...
}

if (['production', 'staging'].includes(process.env.NODE_ENV)) {
  // ...
}
```

例如，在 Express 应用中，你可以使用这个来为每个环境设置不同的错误处理程序：

```javascript
if (process.env.NODE_ENV === 'development') {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

if (process.env.NODE_ENV === 'production') {
  app.use(express.errorHandler());
}
```

# Node.js with TypeScript

## What is TypeScript?

[Typescript](https://www.typescriptlang.org/) 是由微软开发和维护的一个开源语言。

从本质上将，可以将 TypeScript 看作是 JavaScript 的一个超集，它为 JavaScript 添加了很多新的特性。最值得注入的是它增加了 `static type definitions`，这在 plain JavaScript 中是不存在的。这个新的特性让某些操作变得可行，比如说声明我们期望的参数的类型、function 返回的数据类型、创建的 object 的具体 shape。TypeScript 是一个非常强大的工具，它为 JavaScript 项目打开了一个全新的可能性世界。它甚至在代码发布之前就防止了许多错误，从而使我们的代码更加安全和健壮——它在代码开发过程中捕获问题，并与 Visual Studio code 等代码编辑器完美集成。

## Examples

看下面的例子，然后分析一下具体的处理过程：

```typescript
type User = {
  name: string;
  age: number;
};

function isAdult(user: User): boolean {
  return user.age >= 18;
}

const justine: User = {
  name: 'Justine',
  age: 23,
};

const isJustineAnAdult: boolean = isAdult(justine);
```

第一处，使用 `type` 关键字声明我们自定义的表示 User 的对象类型；

第二处，定义了一个方法 isAdult 接受一个 User 类型的参数并且返回 boolean 值变量；

第三处，创建了一个 User 类型的 data：justine，可以用这个变量去调用前面定义的方法；

最后，创建了一个 boolean 类型的变量 isJustineAnAdult 表示 justine 是否是一个 adult。

有一些附加的信息是你需要明白的：

首先，如果我们没有遵循 TypeScript declared types 的语法，TypeScript 就会提示警告信息告诉开发者 something is wrong and prevent misuse；

其次，并不是所有地方都必须显式的声明类型，TypeScript 非常智能并且可以自动推断类型，比如说，`isJustineAnAdult` 是 `boolean` 类型的，即使我们没有显式定义类型；

当我们有了一段 TypeScript，又该如何运行它呢？

首先需要为项目安装 TypeScript：

- `npm i -D typescript`

现在我们可以通过 `tsc` 工具来将 ts 代码编译成 JavaScript 代码，假设 ts 文件名为 `example.ts`：

- `npx tsc example.ts`
- `npx` 是 Node 包执行工具，这个工具允许我们在不用全局安装 TypeScript 的编译器的情况下使用它；
- `tsc` 是 TypeScript 的编译器，可以将 ts 代码编译成 JavaScript 代码，执行上述命令将会在项目下生成一个新的 js 文件 `example.js`，这样我们就可以通过 node 命令去执行该 js 文件了

## More about TypeScript

处了声明 type 外，TypeScript 还提供了其他有用的机制，比如 interfaces、classes、utility types 等等。此外，在更大的项目中，你可以在一个单独的文件中声明 TypeScript 编译器配置，并精细地调整它的工作方式、严格程度以及存储编译文件的位置。更多信息参考 [The Official TypeScript docs](https://www.typescriptlang.org/docs/)



# Node.js with WebAssembly

[WebAssembly](https://webassembly.org/)



# 模块化编程

参考：https://www.freecodecamp.org/news/modules-in-javascript/

A module is just a piece of code in a file that you can call and use from other files. A modular design is the opposite of having all your project's code in one single file.

## CommonJS

[CommonJS](https://en.wikipedia.org/wiki/CommonJS) 是 JavaScript 实现模块化的一组标准规范。The project was started by Mozilla engineer Kevin Dangoor in 2009.

CommonJS 主要在 Node.js 中用于 server-side JS apps。浏览器不支持 CommonJS。

补充：现在的 Node.js 不仅支持 CommonJS，还支持 ESModules（这是一种更 modern 的规范）；

为了分析 CommonJS，我们可以创建一个测试用的 node project：

- vs code 打开 workspace，控制台输入：`npm init -y`，可以看到当前目录中生成了 package.json 文件；
- 接着创建一个测试用的 js，比如：`main.js`；

main.js：

```javascript
const testFunction = () => {
    console.log("I'm the main function");
}
```

然后创建另一个 js 文件：`mod1.js`：

```javascript
const mod1Function = () => console.log("Mod1 is alive!")
const mod1Function2 = () => console.log("Mod1 is rolling!")

module.exports = {
    mod1Function,
    mod1Function2
}
```

改造 main.js：

```javascript
const { mod1Function, mod1Function2 } = require("./mod1");

const testFunction = () => {
    console.log("I'm the main function");
    mod1Function();
    mod1Function2();
}

testFunction();
```

控制台：`node main.js`：

```
I'm the main function
Mod1 is alive!
Mod1 is rolling!
```



## ESModules

现在看一下 ESmodules，ESModules 是从 ES6（2015）版本引入的一个标准，这份提案的主要目的是为了规范 JavaScript modules 是如何工作的以及在浏览器中如何实现这些特性（指以前不支持的 modules）；

ESmodules 是更加现代的方式，由浏览器和服务端 app 共同支持。

下面再次通过 node 创建一个应用：`node init -y`，然后在 package.js 最后面加上 `"type": "module"`，类似这样：

```json
{
  "name": "4-esmodules",
  "version": "1.0.0",
  "description": "",
  "main": "main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module"
}
```

如果我们不这样做，而是直接在 Node 中尝试实现 ESmodules，就会获得一些错误提示，类似这样：

```
(node:29568) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
...
SyntaxError: Cannot use import statement outside a module
```

现在改造前面的例子的文件，mod1.js：

```javascript
const mod1Function = () => console.log('mod1 is here.')
const mod1Function2 = () => console.log('mod1 is rolling.')

export {
    mod1Function,
    mod1Function2
}
```

main.js：

```javascript
import { mod1Function, mod1Function2 } from "./mod1.js";

const testFunction = () => {
    console.log("I's the main function");
    mod1Function();
    mod1Function2();
}

testFunction();
```

控制台输入：`node main.js`，输出内容如下：

```
I's the main function
mod1 is here.
mod1 is rolling.
```

注意，此时我们用 `import` 替换了之前的 `require`，用 `export` 替换 `module.exports`，语法有些不同，但是行为却非常相似。

ESmodules 另一个可用的特性是 import renaming，类似这样：

```javascript
import { mod1Function as f1, mod1Function2 as f2 } from "./mod1.js";

const testFunction = () => {
    console.log("I's the main function");
    f1();
    f2();
}

testFunction();
```

在 import 中使用 as 关键字为导入的每个 function 声明一个别名；

也可以使用 import 直接导入所有的 function：

```javascript
import * as mod1 from "./mod1.js";

const testFunction = () => {
    console.log("I's the main function");
    mod1.mod1Function();
    mod1.mod1Function2();
}

testFunction();
```

最后一点需要注意的是 `default` 关键字，使用它，我们可以为指定的模块设置 default export，就像下面这样：

```javascript
// mod1.js
const mod1Function = () => console.log('Mod1 is alive!')
const mod1Function2 = () => console.log('Mod1 is rolling, baby!')

export default mod1Function
export { mod1Function2 }
```

export default 是什么意思呢？如果使用 export default 就意味着在导入的时候不需要特别的去进行解构（destructure），我们可以像下面这样去使用：

```javascript
// main.js
import mod1Function, { mod1Function2 } from './mod1.js' 

const testFunction = () => {
    console.log('Im the main function')
    mod1Function()
    mod1Function2()
}

testFunction()
```

这个默认导入可以随意命名：

```javascript
// main.js
import lalala, { mod1Function2 } from './mod1.js' 

const testFunction = () => {
    console.log('Im the main function')
    lalala()
    mod1Function2()
}

testFunction()
```

关于 export 和 export default 的区别参考：[Understanding the Difference between `export default` and `export` with Named Exports in JavaScript](https://medium.com/@heshramsis/understanding-the-difference-between-export-default-and-export-with-named-exports-in-javascript-f0569c221a3)



## Using Modules

了解了两种模块化规范后，我们可以尝试去在实际的应用中使用它们，首先使用简单的 html 和 JavaScript 实现一个网页：

项目结构：

```
- common-websize
-- index.html
-- main.js
-- mod1.js
```

mod1.js：

```javascript
const mod1Function = () => console.log("Mod1 is alive!")
const mod1Function2 = () => console.log("Mod1 is rolling!")

export {
    mod1Function, mod1Function2
}
```

main.js：

```javascript
import { mod1Function, mod1Function2 } from "./mod1.js";

const testFunction = () => console.log("I'm the main function.")

document.getElementById('isAlive').addEventListener('click', () => mod1Function())
document.getElementById('isRolling').addEventListener('click', () => mod1Function2())

testFunction();
```

index.html：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>just a test...</h1>
    <button id="isAlive">Is mod1 alive?</button>
    <button id="isRolling">Is mod1 rolling?</button>
    <script src="./main.js" type="module"></script>
</body>
</html>
```

注意这里的 script 标签，我们引入的 js 文件是以 `type="module"` 的形式引入的，这个可以参见 [MDN script label](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/script) ，type 属性为 module，就会被当作 JavaScript 模块。

此时当我们打开页面时会提示：

```
dex.html:10 Access to script at 'file:///.../main.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, isolated-app, chrome-extension, chrome, https, chrome-untrusted.
main.js:1     Failed to load resource: net::ERR_FAILED
```

为了解决这个问题，我们可以使用 VS code 的 `Live Server` extension，或者使用 `npm init y` 结合 `npx serve` 来快速创建一个 Node 应用。

本例使用 Live Server 扩展，在 index.html 编辑页面输入 alt + L alt + O 组合键启用 Live Server。在浏览器页面点击不同的按钮，控制台输出不同的结果：

```
I'm the main function.
Mod1 is alive!
Mod1 is rolling!
Mod1 is alive!
```

但是这里有一点需要注意，如果打开 Chrome devtool，在 network 中可以看到加载的 js 文件一共有两个 main.js 和 mod1.js。

当然，如果我们要在每个文件中使用代码，则需要同时加载这两个文件 —— 但这并不是最好的做法。这是因为浏览器需要执行两个不同的请求来加载所有必需的 JS。

我们应该尽量减少请求，以提高项目的性能。那么，让我们看看如何在 module bundler 的帮助下做到这一点。

Side comment: if you'd like a video explanation, [Kent C Dodds has a great one](https://egghead.io/lessons/javascript-use-javascript-modules-in-the-browser). I really recommend that you follow him, he's one of the best JS teachers out there. And [here's another cool video](https://www.youtube.com/watch?v=qgRUr-YUk1Q) by Fireship. ;)

## Bundling modules

如前所述，将代码划分为模块是很好的，因为我们的代码库将更有组织，并且更容易复用我们的代码。

但这些优势只适用于项目的开发阶段。在生产环境中，模块化并不是最好的选择，因为这会强迫浏览器请求每一个 JS 文件，造成性能的浪费。

这个问题可以通过使用 module bundler 轻松解决。简而言之，module bundler 是这样一种程序：可以将多个 JS modules 作为输入，最后将其合并输出为一个 js 文件（不同的 module bundler 具有不同的特性）。

将 “development code” 转换为 “production code” 的这个步骤通常被认为是 “build”。

这个步骤有很多工具可以选择，比如 [Browserify](https://browserify.org/), [Parcel](https://parceljs.org/), [Rollup.js](https://rollupjs.org/guide/en/), [Snowpack](https://www.snowpack.dev/)... 但是使用最广泛的还是  [Webpack](https://webpack.js.org/)，下面看一下使用 webpack 的简单示例。

- Side comment 1: If you want to dig deeper into module bundlers and how they work, [this awesome video by Fireship](https://www.youtube.com/watch?v=5IG4UmULyoA&t=382s) might be a good place to start.
- Side comment 2: Webpack is a very robust and sophisticated tool that can do many things besides bundling JS files. Check out [their docs](https://webpack.js.org/) if you want to learn more.

> Webpack simple use example

按照以下步骤创建 Node app 并安装 webpack：

- `npm init -y`
- `npm i -D webpack webpack-cli`
- 项目根目录下创建 `webpack.config.js`

```javascript
const path = require('path')

module.exports = {
    mode: 'development',
    entry: './main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    }
}
```

这个特定名称的 js 文件中的配置信息将决定 webpack 在 app 中是如何进行工作的。

完整的配置信息参考（注意：本文使用的 webpack 是 5.0 + 版本）：

- https://webpack.js.org/concepts/configuration/
- https://webpack.js.org/configuration/

简单解释一下上述配置项：

`mode`：app 运行环境，webpack 可以根据不同的环境采取不同的内置优化策略；

`entry`：可以是一个字符串，也可以是一个对象，用来指示 webpack 从哪个地方开始打包应用，针对两种应用：

- SPA：entry 只有一个 point；
- MPA：多个 entry points；

`output`：该 key 包含一组选项用来指示 webpack 将打包后的资源以何种方式输出到什么地方。这些资源包括：bundles、assets 以及其他使用 webpack 打包或加载的东西。

在我们的配置文件中 entry 是 main.js，表示当前应用是 SPA，且所有会使用到的模块都在 main.js 中导入，webpack 会读取该文件并进行分析所有的依赖。

下面改造一下 package.json 文件，类似这样：

```json
{
  "name": "test-app",
  "version": "1.0.0",
  "description": "",
  "main": "main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^5.80.0",
    "webpack-cli": "^5.0.2"
  }
}
```

主要添加了 `build` script，指定构建工具是 webpack。

现在我们的项目结构是这样的：

```
- test-app
-- node_modules
-- index.html
-- main.js
-- mod1.js
```



最后打开 terminal，输入 `npm run build`，根据配置 webpack 将会创建 dist 目录并且在该目录下输出 bundle.js 文件，打开该 js 文件，可以看到这样的格式：

```javascript
(() => { "use strict" ...})();
```

可以在这个文件中找到之前编写的 mod1.js 和 main.js 中的所有代码，只不过都是被压缩了，

现在改造一下 index.html，引入的 js 文件改为 bundle.js

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>just a test...</h1>
    <button id="isAlive">Is mod1 alive?</button>
    <button id="isRolling">Is mod1 rolling?</button>
    <script src="./dist/bundle.js" type="module"></script>
</body>
</html>
```

再次通过 live server 打开，Chrome devtool 的 network 模块可以看到这次只需要加载一个 bundle.js 即可实现和之前案例完全一致的效果。

## Roundup

For a complete guide on JS modules, you can take a look [at this article](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).