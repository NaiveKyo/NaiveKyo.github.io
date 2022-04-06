---
title: NodeJS summary
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225220830.jpg'
coverImg: /img/20220225220830.jpg
cover: false
toc: true
mathjax: false
date: 2022-03-27 20:55:12
summary: "NodeJS 学习"
categories: "NodeJS"
keywords: "NodeJS"
tags: "NodeJS"
---

# Node.js

# 一、模块化编程

## 1.1、思想

模块化设计思想：

- 生产效率高：方便代码复用
- 维护成本低：软件开发周期中，维护阶段采用模块化更容易维护

如果不采用模块化设计：

- 命名冲突
- 文件依赖



## 1.2、全局函数&对象命名空间

这里有一个例子：用 js 实现计算器

需要注意：

- **js 获得的参数是 string，需要使用** parstInt **方法转换成 number**

- 为按钮添加单击事件：

  ```javascript
  oCal.addEventListener('click', function(){
    ……
  })
  ```



> 利用全局函数的形式缺点

- 缺点1：容易造成全局变量污染，因为所有计算方法都写到全局对象身上
- 缺点2：加减乘除方法，没有明显的关联关系

>优化方式

使用自定义命名对象空间：

```javascript
var calculator = {};

calculator.add = funcation() {}
………………
```

这种方式，在一定程度上，缓解了全局对象污染的问题；并没有解决变量污染的问题

解决了成员之间没有太大关联关系的问题。

## 1.3、函数作用域&维护和扩展

前面了解的通过自定义全局对象的方式一定程度上缓解了命名冲突的问题，**但是它不安全，因为我们自定义的全局对象和其内部方法可以被更改。**



> 函数的作用域

为了处理安全问题，我们可以将计算的四个方法封装到 **立即执行匿名函数中，如果不添加返回值，外界是访问不到的，添加返回值后在全局可以通过 **`匿名函数.函数名()` 的方式进行调用。（有点类似 Java 的 setter 和 getter 方法）

```javascript
'use strict'
var calculator = (function () {
    function add(x, y) {
      return parseInt(x) + parseInt(y);
    }

    function subtract(x, y) {
      return parseInt(x) - parseInt(y);
    }

    return {
      add: add,
      subtract: subtract
    }
})();
```

这样有效公开了公有方法，并且可以隐藏一些私有属性和元素，私有空间的函数和变量也不会影响全局作用域，**可见这种方式是最理想的方式。**



- 利用匿名自执行函数形成的封闭的函数作用域空间，达到私有化的目的。
- 如果想拓展方法，只需要在自执行函数中新增方法，然后返回它就可以了。（**不推荐**）



> 推荐拓展方法

## 1.4、扩展对象方法的方式

```javascript
'use strict'

var calculator = (function () {
  function add(x, y) {
    return parseInt(x) + parseInt(y);
  }

  function subtract(x, y) {
    return parseInt(x) - parseInt(y);
  }

  // 追加方法 (该方式不推荐)
  function multiply(x, y) {
    return parseInt(x) * parseInt(y);
  }

  return {
    add: add,
    subtract: subtract,
    multiply: multiply
  }
})();


/*
    看起来下面的 calculator 已经把上面的覆盖了
    注意：在扩展时，优先查找要扩展的对象是否已经存在
    如果已存在，就使用已经存在的
    如果不存在，就创建一个新的
    最大的好处：加载的时候不需要考虑顺序
*/
var calculator = (function(cal) {
  // 取模方法
  cal.mod = function(x, y) {
    return x % y;
  }
  return cal;
})(calculator || {});
```

## 1.5、JavaScript 参数数组 剩余参数语法

```javascript
'use strict'

var test = function(a, b, ...args) {
    console.log(a + " " + b);
    console.log(args[0]);
    console.log(args[1]);
};
```

> arguments 和 剩余参数的主要区别

- 剩余参数只包含那些没有对应形参的实参，而 arguments 对象包含了传给参数的所有实参
- arguments 对象不是一个真正的数组，而剩余参数则是 Array 的实例，它可以使用数组的所有方法
- arguments 对象还有一些附加的属性



## 1.6、JavaScript 实现重载

js 本质上是不能够实现重载的，因为同时定义多个名字相同的方法，会将前面的方法覆盖。

但是我们可以另辟蹊径：

- 通过判断参数值的数量在一个方法中实现不同参数值不同处理效果

- 利用闭包的特性

  ```javascript
  'use strict'
  
  // 我们期望给 person 绑定一个叫 find 的方法
  function addMethod(object, name, fnc) {
      var old = object[name]; // 把前一次添加的方法存到一个临时变量 old 里面
      object[name] = function() {
          // 重写 object[name] 方法
          // 如果调用 object[name] 方法时，传入的参数和预期的一致，就直接调用
          if (fnc.length === arguments.length) {
              return fnc.apply(this, arguments);
          } else if (typeof old === "function") {
              // 否则判断 old 是不是一个函数，是就调用它
              return old.apply(this, arguments);
          }
      }
  }
  
  var person = {
      values: ["Dean Edwards", "Sam Stephenson", "Alex Russell", "Dean Tom"]
  };
  
  /* 下面开始对 find 进行重载 */
  // 没有参数的时候
  addMethod(person, "find", function() {
      return this.values;
  })
  
  // 1 个参数
  addMethod(person, "find", function(firstName) {
      var result = [];
      for (var i = 0; i < this.values.length; i++) {
          if (this.values[i].indexOf(firstName) === 0) {
              result.push(this.values[i]);
          }
      }
  
      return result;
  })
  
  // 2 个参数
  addMethod(person, "find", function(firstName, lastName) {
      var result = [];
      for (var i = 0; i < this.values.length; i++) {
          if (this.values[i] === firstName + " " + lastName) {
              result.push(this.values[i]);
          }
      }
  
      return result;
  })
  
  // 测试：
  console.log(person.find()); //["Dean Edwards", "Alex Russell", "Dean Tom"]
  console.log(person.find("Dean")); //["Dean Edwards", "Dean Tom"]
  console.log(person.find("Dean Edwards")); //["Dean Edwards"]
  ```

  

# 二、初识 Node.js



## 2.1、处理模型

- 传统的客户端-服务端之间的交互都是通过 **请求 - 响应 模型** 来实现的



> JavaScript 组成部分

- ECMAScript
- DOM
- BOM

上面指的是客户端的 JavaScript

服务端的 JavaScript 应用核心语法 ECMAScript 但是不操作 DOM 和 BOM。

它常常做一些在客户端操作不到的东西，例如：操作数据库、操作文件等等。

此外，客户端的 Ajax 操作只能发送请求，而接受请求和做出响应的操作就需要服务端的 JavaScript 实现。



## 2.2、Node.js 简介

Node.js 专注实现高性能 web 服务器，基于 Chrome 浏览器的 V8 引擎。



> Node.js 特点和优势

- 它是一个 JavaScript 运行环境
- 依赖于 Chrome V8 引擎进行代码解析
- 事件驱动（event-driven）
- 非阻塞 I/O （non-blocking I/O）
- 轻量、可伸缩，适用于实时数据交互应用
- 单进程，单线程



## 2.3、简单使用

node 命令

```javascript
var http = require('http'); // 导入 node 的核心模块，名字叫做 http

// 创建一个 web 服务器
var server = http.createServer(function(req, resp) {
    // res 是一个响应对象，能够向服务器页面返回一个文本
    resp.end('hello world.');
});

// 启动 web 服务器
// 参数一：监听的端口号
// 参数二：监听的 ip 地址
// 参数三：启动成功后的回调函数
server.listen(3000, '127.0.0.1', function() {
    console.log("服务器运行在：http://127.0.0.1:3000");
});
```

## 2.4、REPL 运行环境

REPL（Read-Eval-Print-Loop）可交互运行环境。

在控制台直接输入 `node` 回车，进入命令行

Node.js 为 REPL 运行环境提供了一些常用命令：

| 命令           | 描述                              |
| -------------- | --------------------------------- |
| ctrl + c       | 终止当前命令                      |
| ctrl + c twice | 终止 Node REPL                    |
| ctrl + d       | 终止 Node REPL                    |
| Up/Down Keys   | 查看历史命令                      |
| tab Keys       | 当前指令的列表                    |
| .help          | 显示所有命令的列表                |
| .break         | 退出多行表达式                    |
| .clear         | 从多行表达退出                    |
| .save filename | 当前 Node REPL 会话保存到文件中   |
| .load filename | 加载文件内容在当前 Node REPL 会话 |

了解即可。



## 2.5、global 对象和模块作用域

Node.js 模块化开发，默认声明的变量都属于当前模块（封装、私有化）

但是 Node.js 中除了模块作用域，还有全局作用域（global）

**应用全局对象 global**（类似于浏览器的 Window 对象）

```javascript
// var a = 10;
global.a = 10;
console.log(a);
console.log(global.a);
```

​	

> 使用 global 导入模块（不推荐使用）

```javascript
// 在 Node 中提供了 require('文件模块路径') 引入对应模块
require('./m1.js');
require('./m2.js');

console.log(a);
console.log(b);

// global 暴露成员的缺陷
// 1. 全局变量污染问题
// 2. 不知道 成员 从哪个模块中导出

// 推荐使用 node 提供的模块化机制
// module   : 模块
// require  ： 用来导入模块
// exports
// modul.exports ： 导出模块成员
```



> Node 提供的机制

推荐使用

```javascript
m1.js
exports.a = 10;

m2.js
exports.b = 20;

main.js
var m1 = require('./m1.js');
var m2 = require('./m2.js');

console.log('模块 1 中的 a：' + m1.a);
console.log('模块 2 中的 b：' + m2.b);
```



**比较 `module.exports` 和 `exports` 的区别**：

- 一开始 两者指向的内存区域 是一样的，但是如果同时使用两者进行导出，那么在导出的时候以 `module.exports` 为标准，不考虑 `exports` 导出的值

- 如果使用 `exports` 导出，就会在内存中新开辟一块区域，让 `exports` 指向它

- 参考代码

  ```javascript
  // exports 和 module.exports 的区别
  
  // module.exports = [1, 2, 3, 4];
  
  // exports = [1, 2, 3 ,4]
  
  // 在一个模块中，向外暴露成员的时候，永远以 module.exports 指向的成员为准
  
  console.log(exports === module.exports); // true
  ```




> 总结

最开始 `module.exports` 和 `exports` 指向同一块内存区域

使用 `exports.a = 10` 和 `module.exports = 20` 是等效的，之后 `exports == module.exports` 还是 true，但是在导出的时候只会导出 20。

如果使用 `exports = 10` 就相当于为 `exports` 这个参数开辟了一块新的内存区域，之后 `exports == module.exports` 就是 false 了。

## 2.6、全局可用变量、函数和对象

global 对象定义了全局命名空间

常用全局变量：

- `__dirname`：表示当前文件所在目录
- `__filename`：表示当前正在指向的脚本的文件名（绝对路径）



常用全局函数：

| 函数                 | 描述                                                         |
| -------------------- | ------------------------------------------------------------ |
| setTimeout(cb,  ms)  | 全局函数在指定的毫秒数后执行指定函数 cb。该函数只执行一次指定函数，它的返回值可以作为 clearTimeout 函数的参数 |
| clearTimeout(t)      | 全局函数用于停止一个之前通过 setTimeout 创建的定时器。参数 t 是通过 setTimeout 函数创建的计算器 |
| setInterval(cb,  ms) | setInterval 和 setTimeout 类似，不过 setInterval 会在每 ms 毫秒后（不是精确的毫秒）执行一次 cb，它的返回值可以作为 clearInterval 函数的参数 |
| clearInterval（t）   | 用于停止 setInterval 定时器，这样回调函数就不会被执行了      |
| setImmediate（cb）   | 用于延迟调用 cb 函数。cb 将在 I/O 事件回调后，setTimeout 和 setInterval 回调之前被调用。setImmediate 的返回值可以作为 clearImmediate 的参数 |
| clearImmediate（）   | 用于停止触发回调函数                                         |

## 2.7、模块化开发重写计算器

参考代码，理解模块化开发概念



## 2.8、require 加载机制和模块缓存

模块分类：

- 文件模块

  例如计算器代码：require 暴露的就是文件模块

  ```javascript
  module.exports = {
      
      add: require('./add.js'),
      substract: require('./subtract.js'),
      multiply: require('./multiply.js'),
      divide: require('./divide.js')
  }
  
  // require('./add') 如果不加后缀，会按照这样的顺序找：.js .json .node
  ```

  

- 核心模块（官网可以查询）



> 缓存加载机制

- 默认的每一个文件模块只会加载一次

- 第一次加载后，以后每次使用会先到内存中查看是否存在

- 如果向每一次都被加载，可以在被导入文件模块中加入以下代码

  ```javascript
  delete require.cache[__filename];
  
  console.log('文件模块被加载');
  ```

  



# 三、异步编程和包的资源管理

> 前言

我们知道 JavaScript 是单线程的，一次只能执行一个任务，如果任务多了就需要排队等待。



Node.js 加入了异步编程模块，保证了 Node.js 快速响应。



## 3.1、回调函数

概念：回调函数其实就是指函数可以作为参数被传递到另一个函数中，然后被调用的形式。这样的 “回调” 在 Node.js 中被到处使用，典型的就是异步函数的异常处理。



```javascript
// 通过回调函数接受异步代码执行的处理结果

function parseJsonStrToObj(str, callback) {
    setTimeout(function() {
        try {
            var obj = JSON.parse(str);
            // 规定，callback 函数中第一个参数永远是 错误的异常对象，第二个参数才是正确执行的结果
            callback(null, obj);
        } catch (e) {
            callback(e, null);
        }
    }, 0);
}

// 注意区分错误信息和正确的数据信息
parseJsonStrToObj('{"foo":"bar"}', function (err, result){
    if (err) {
        return console.log('转换失败了');
    }
    console.log('数据转换成功：' + result.foo);
});
```



## 3.2、Node 中包的概念

**Node.js 模块化开发是按照一套规范来的：**`CommonJS规范`

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220406205734.png)

Node.js 包下面有一个很重要的包说明文件 `package.json`



## 3.3、NPM

> 什么是 NPM

Node.js 的包管理工具，一个命令行软件，提供了一些命令用于快速安装和管理模块。

| 命令                         | 作用                                                   |
| ---------------------------- | ------------------------------------------------------ |
| npm init[-y]                 | 初始化一个 package.json 文件                           |
| npm install 包名             | 安装一个包                                             |
| npm install -save 包名       | 将安装的包添加到 package.json 的依赖中（dependencies） |
| npm install -g 包名          | 安装一个命令行工具                                     |
| npm docs 包名                | 查看包的文档（非常有用）                               |
| npm root -g                  | 查看全局包安装路径                                     |
| npm config set prefix “路径” | 修改全局包安装路径                                     |
| npm list                     | 查看当前目录下安装的所有包                             |
| npm list -g                  | 查看全局包的安装路径下的所有包                         |
| npm uninstall 包名           | 卸载当前目录下的某个包                                 |
| npm unistall -g 包名         | 卸载全局安装路径下的某个包                             |
| npm update 包名              | 更新当前目录下的某个包                                 |

## 3.4、包加载规则

- 加载的时候，Node.js 默认会把它当作核心模块去加载，如果发现标识名不是核心模块，就会在当前目录下的 node_moudules 目录下面寻找，如果没有找到，Node.js 会从当前目录的父目录的 node_moudules 里搜索，这样递归下去直到找到根目录。
- 如果找到了该标识名的子目录。Node.js 将会找到该子目录下的 `package.json` 文件，获取该文件中 main 属性的值，根据 main 属性指向的路径值进行加载。这样做的好处是用户使用第三方模块时，不用关心入口模块是哪个文件。



# 四、Node.js 文件操作

引入模块 `require('fs')`（文件 IO）。所有方法都有异步和同步的形式。

异步方法的最后一个参数都是回调函数，回调函数的第一个参数通常都会保留给异常，如果操作成功完成，则第一个参数回溯 null 或者 undefined



> 写入文件

-  **同步写入文件**  fs.writeFileSync('写入文件的路径', '数据');

-  **异步写入文件**  fs.writeFile('写入文件路径', '数据', '回调函数') 
- 回调函数的参数为一个 Error 类型的对象，或者为 null

> 追加内容

- 异步语法：fs.appendFile（file，data[，options]，callback）；
- 参数：文件名、追加数据、options 包含{encoding，mode，flag}，默认编码为 utf-8，模式为 0o666，flag为 ‘a'，回调函数，只包含参数 err

> 读取文件

- fs.readFile（path[, options]，callback）
- 回调函数有两个参数 （err，data）
- err 是错误信息
- data 是文件的内容

> 文件复制

- 将文件读取出来，然后写入另外一个文件

- 封装成一个模块

  ```javascript
  var fs = require('fs');
  
  function copy(src, dist, callback) {
      // 读取文件
      fs.readFile(src, function(err, data) {
          if (err) {
              return callback(err);
          }
  
          // 写入文件
          fs.writeFile(dist, data.toString(), function(err) {
              if (err) {
                  return callback(err);
              }
              callback(null);
          });
      });
  }
  
  module.exports = copy;
  ```

- 或者使用方法 fs.copyFile（serc，dest[,flags]，callback）

> 获取文件信息

- fs.stat（path，callback）

> 路径字符串操作（Path模块）

| 函数                          | 描述                         |
| ----------------------------- | ---------------------------- |
| basename（p[，ext]）          | 获取文件名                   |
| dirname（p）                  | 获取文件目录                 |
| extname（p）                  | 获取文件扩展名               |
| isAbsolute（path）            | 判断是否为绝对路径           |
| join（[path1]\[,path2][,……]） | 拼接路径字符串               |
| normalize（p）                | 将非标准路径转换为标准路径   |
| sep                           | 获取操作系统的文件路径分隔符 |

> 目录操作

- fs.mkdir（path[, mode], callback）：回调函数只有一个参数 err
- fs.readdir（path[, options], callback）：回调函数 err，files
- fs.rmdir（path, callback）：和 linux 中的类似，不能删除有文件的目录
- fs.unlink（path，callback）：删除目录下的某个文件

# 五、I/O 操作

> 简介

- Buffer 缓冲区
- 文件流

## 5.1、Buffer 缓冲流

Buffer 类是 node.js 的核心模块，用于支持 I/O 操作中移动的数据处理。

Buffer 库内存中创建一个专门存放二进制数据的缓冲区。

## 5.2、Buffer 的构造函数

```javascript
var buf = new Buffer(size);

var buf = new Buffer([10, 20, 30, 40, 50]);

var buf = new Buffer("hello", "utf-8");

但是为了让 Buffer 的创建更可靠、更不容易出错，各种 new Buffer() 
已经被废弃，推荐使用下面的方法：
```

- Buffer.from()
- Buffer.alloc()
- Buffer.allocUnsafe()  没有初始化，需要配合 fill() 和 write（）使用



## 5.3、写入缓冲区

- buf.write（string，[, offset[, length]]，[, encoding]）
- string：写入缓冲区的数据
- offset：缓冲区开始写入的索引值，默认 0
- length：写入的字节数，默认 buffer.length
- encoding：使用编码，默认 utf-8



- buffer.write()
- 参数1：写入的字符串
- 参数2：从哪个位置开始
- 参数3：写入数据的长度
- 参数4：表示写入数据内容的编码格式



## 5.4、从缓冲区读取数据

- buf.toString（[encoding[, start[, end]]]）；



## 5.5、拼接缓冲区

- buf.concat（list[, total.length]）；
- list 用于合并的 Buffer 对象数组列表，total.length 用于指定合并后 Buffer 对象的总长度



## 5.6、Stream 文件流

Buffer 缓冲区限制在 1GB，超过 1GB 的文件无法直接完成读写，并且，如果有些读写资源一直持续不停止，Node.js 将无法完成其他工作。



Node.js 提供了 Stream 文件流模块，解决大数据文件操作的问题。



> 什么是文件流

Buffer 复制文件的流程是：

- 将文件读到缓冲区
- 从缓冲区拿出数据写入文件

如果文件过大就不行了。



对于大文件的操作，理想的方式：读一部分，写一部分：这也是文件流的工作原理

Node.js 中，文件流操作由 Stream 模块提供，Stream 有四种流类型：

- Readable：可读操作
- Writable：可写操作
- Duplex：可读可写操作
- Transform：操作被写入数据，然后读出结果



所有的 Stream 对象都是 EventEmitter（事件触发器）的实例。常用事件如下：

- data：有数据可读时触发
- end：没有更多的数据可读时触发
- error：在接收和写入过程中发生错误时触发
- finish：所有数据已被写入到底层系统时触发

## 5.7、可读流

- fs.creatReadStream（path[, options]）；
- path 是文件路径，options 是一组 key-value

## 5.8、可写流

- fs.createWriteStream（paht[, options]）；

## 5.9、使用 pipe 处理大文件

可读流中还有一个函数叫做 pipe()，这是一个很高效的文件处理方式，可以简化复制文件的操作。



# 六、Node.js 网络编程



网络编程就是在两个或两个以上的设备之间进行数据传输，也叫做网络通信。

IP 地址对应一台网络设备，端口号对应一个软件



## 6.1、套接字 Socket 简单模型

Socket 是构建在 TCP/IP 协议，用于找到对应的网络设备并进行数据传输（调用底层的 TCP/IP 协议）

点对点



**一个完整的 Socket 包含了进行网络通信必须的五种信息：**

- 连接使用的协议
- 客户端设备的 IP 地址
- 客户端的端口
- 服务器的 IP 地址
- 服务器端口



简单理解：socket 并不是协议，而是对 TCP/IP 协议的封装，相当于一个高层 API



## 6.2、Node.js 实现套接字服务

Node.js 的套接字服务由 Net 模块提供

`var net = require('net')`



> Net.Server 对象

使用 net 模块创建一个 TCP 或本地服务器

`var server = net.createServer([options][, connectionListener])`



> Net.Socket 对象

调用底层 Socket 接口，实现数据传输功能。

该对象在客户端和服务器端同时被创建，创建成功后便可以触发相关事件。

Net.Socket 是一个可读可写流



## 6.3、Net.Socket 对象-客户端服务器双向通信

- 创建客户端：net.createConnection（options[, connectListener]）;

**Node 为我们提供 **`Process` **模块用来管理进程**，这是一个全局对象

- process.stdin.on(data, callback)



# 七、Node.js 进程管理

> 多人广播消息

多人广播消息就是一个客户端发送消息，其他的客户端也可以看到



# 八、Node.js 实现 HTTP 服务

Node.js 提供了 HTTP 核心模块

```javascript
var http = require('http');
```



