---
title: JavaScript summary
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225220935.jpg'
coverImg: /img/20220225220935.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-01 21:10:24
summary: "JavaScript 初步学习"
categories: "JavaScript"
keywords: "JavaScript"
tags: "JavaScript"
---

# 一、简介

## 1.1、概述

什么是 JavaScript？

JavaScript 是一门世界上最流行的脚本语言

<mark>一个合格的后端人员，必须要精通 JavaScript</mark>

## 1.2、ECMAScript

ECMAScript 可以理解为是 JavaScript 的一个标准。

最新为 ES6

但是大部分浏览器还停留在支持 es5 标准

所以就会出现一个问题：开发环境 和 线上环境，版本不一致

# 二、快速入门

## 2.1、引入 JavaScript

```html
<!--<script>-->
<!--    alert("hello javascript world!");-->
<!--</script>-->

<!-- 外部引入 注意：不能单闭合 script 标签必须成对出现-->
<script src="JS/javascript.js"></script>
```

可以内部标签引入，也可以通过外部标签引入

## 2.2、基本语法入门

```
JavaScript 严格区分大小写

要学会使用浏览器调试
```

## 2.3、数据类型

数值、文本、图形、音频、视频……

**这些变量都是用 var 表示，ES6 中使用 let 来限定作用域**



<mark>1、number</mark>

 js 不区分小数和整数

```javascript
123 // 整数
123.1 // 浮点数
123.12e19	// 科学计数法
-99		// 负数
NaN		// not a number
Infinity	// 无限大
```



<mark>2、字符串</mark>

‘abc’	“abc”



<mark>3、布尔值</mark>

true ， fasle



<mark>4、逻辑运算</mark>

```
&&
||
|
```



<mark>5、比较运算符（重要）</mark>

```
=
==		等于（类型不一样，值一样，也会判断为 true）
===		绝对等于（类型一样，值一样，结果为 true）
```

要注意这个问题，坚持使用 ===

- NaN === NaN，结果为 false
- 注意: NaN 与所有数值，包括自身都不相等
- 只能通过 isNaN（para）这个方法判断参数是否为  NaN



浮点数问题：

**尽量避免使用浮点数进行运算，存在精度问题！**



Java 里解决浮点数问题，可以使用 BigDecimal 数据类型，而在 JavaScript 中方法如下：

```javascript
Math.abs(1/3 - (1-2/3)) < 0.000000001
结果为 true
```



<mark>6、null 和 undefined</mark>

- null 是空
- undefined 是未定义



<mark>7、数组</mark>

JavaScript 的数组对类型的限制比较少，数组可以存储各种类型的值

```javascript
var arr = [1, 2, 3, 4, "hello", null, true];

也可以直接 new Array(1, 12, "hello", null, true);
```

数组下标如果越界：**会报 undefined，不会报错**



<mark>8、对象</mark>

数组用中括号，对象用大括号。

> 对象的每一个属性之间使用逗号隔开，最后一个不需要添加



## 2.4、严格检查模式

```html
<!--
  前提：IDEA 支持 ES6 语法
  'use strict': 严格检查模式，预防 JavaScript 的随意性产生的一些问题
  必须卸载 js 代码的第一行
  局部变量都建议使用 let
-->
<script type="text/javascript">
  'use strict';
  // 全局变量
  let i = 1;
</script>
```

# 3、数据类型

## 3.1、字符串

1、正常字符串我们使用 单引号 或者 双引号 包裹

2、注意转义字符

```
\'
\n
\t
\u4e2d 		Unicode 编码都是这样的格式 \u####
\x41			ASCII字符
```

3、ES6 支持多行字符串编写

之前我们可以使用 + 拼接字符串

现在可以用 反引号 包裹直接输出多行字符串

```html
let msg = `
            hello
            world
        `;
```

4、模板字符串

ES6 新特性

```html
let name = "kyo";
let age = "21";
console.log(`信息: ${name}  ${age}`);
```

5、字符串长度

```javascript
console.log(str.length);
```

6、字符串的可变性：不可变



7、大小写转换

```javascript
// 原字符串不变
console.log(str.toUpperCase());
```

8、str.indexOf("pattern");

9、str.substring();

```javascript
str.substring(1);		// 从第一个字符截取到最后一个字符
str.substring(1,3);	// [1, 3)
```

## 3.2、数组

**Array 可以包含任意的数据类型**

```javascript
var arr = [1, 2, 3, 4, 5, 6];	// 通过下标取值、赋值
```

1、长度

```javascript
arr.length = len
```

数组的长度是可以改变的

注意：**给 arr.length 赋值，数组大小就会改变**

- 扩大数组，新增元素为 undefined
- 缩小数组，丢失多余部分

2、indexOf（），获取元素的下标

字符串的 “1” 和数字 1 的下标不同



3、**slice（） 截取 Array 的一部分，返回一个新的数组**

```javascript
var newArr = arr.slice(); // 参数类似于字符串的 substring() 方法
```



4、push（） 和 pop（）

- push：压入到数组末尾
- pop：弹出数组的尾部第一个元素



5、unshift（），shift（）

- unshift：押入到数组头部
- shift：弹出数组头部第一个元素



6、排序 sort（）



7、元素翻转 reverse（）



8、concat（）：返回一个新的数组，并没有修改原数组



9、将数组变为用连接符拼接的字符串

join()

```javascript
var arr = [1, 2, 3];
arr.join('-');
返回的是 "1-2-3"
```

10、多维数组

和 java 的定义方式一样



数组：存储数据（如何存、如何取，方法都可以自己实现）



## 3.3、对象

若干个键值对

```javascript
var 对象名 = {
		属性名 : 属性值,
  	属性名 : 属性值,
  	属性名 : 属性值
};
```

js 中对象，{……} 表示一个对象，键值对描述属性，多个属性以逗号隔开

**JavaScript 对象中所有的键都是字符串，值是任意对象。**





1、可以直接给对象属性赋值

2、使用一个不存在的对象属性不会报错

3、动态删减对象属性

```javascript
删除属性: delete object.attribute;
添加属性: object.newAttribute = value;
```

4、判断属性值是否在这个对象中

```javascript
'age' in Object;
true;

// 继承
'toString' in person;
true;
```

5、判断一个属性是否是这个对象自身拥有的 hasOwnProperty()

```javascript
Object.hasOwnProperty('property');
true;
```

## 3.4、流程控制

if

while

for （注意变量作用域问题，建议这里用 let）

数组循环：

```javascript
// forEach 循环
'use strict';

var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];

arr.forEach(function (e) {
  console.log(e);
});

// ES6 新特性 for of
for (let number of arr) {
  console.log(number);
}

// 普通遍历，通过下标取值 for in
for (var value in arr) {
  console.log(arr[value]);
}
```



## 3.5、Map 和 Set

> **ES6 的新特性**

```javascript

'use strict';

// ES6
// 学生的成绩，学生的名字
var map = new Map(
  [
    ['a', 100],
    ['b', 90],
    ['c', 80]
  ]
);
let score = map.get(`a`);
console.log(score);
map.set('admin', 110);
map.delete('admin');
```

Set：无序不重复的集合

```javascript
var set = new Set([3, 1, 1, 1, 1]); // 自动去除重复元素
set.add(2);
set.delete(1);
set.has(2);
```



## 3.6、Iterator

> ES6 新特性

普通的 forin 存在 bug

```javascript
var arr = [1, 2, 3];
arr.name = '123';
使用 for in 遍历会打印 name
```



建议使用 for of  和 iterator

```javascript
// ES6 forOf
for (let mapElement of map) {
  console.log(mapElement);
}

for (let number of set) {
  console.log(number);
}

```

# 4、函数

方法：对象（属性、方法）



## 4.1、定义函数

> 定义方式一

绝对值函数：

```javascript
function abs(x) {
  if (x >= 0)
    return x;
  else
    return -x;
}
```

执行 return 代表函数结束，返回结果

如果没有 return ，函数执行完也会返回结果，结果为 undefined

> 定义方式二

```javascript
var abs = function() {};		等效于上面的方式一
```

function(x) {.......} 这是一个匿名函数，可以把结果赋值给 abs，通过 abs 调用函数

> 参数问题

Javascript 函数可以传递任意个参数，也可以不传递参数

参数传递进来后是否存在？假设不存在该怎么办

```javascript
function f(x) {
  // 手动抛出异常
  if (typeof x !== 'number')
    throw "Not a number!";
  if (x >= 0)
    return x;
  else
    return -x;
}
```

> **arguments（重要）**

`arguments` 是一个 JS 免费赠送的关键字：

代表，传递进来的所有的参数，是一个数组



问题：arguments 会包含所有的参数，我们有时会使用多余的参数来进行附加操作，需要排除已有的参数。

> rest（ES6 新特性）

以前：

```javascript
var aaa = function (a, b) {
    console.log("a = " + a);
    console.log("b = " + b);
    if (arguments.length > 2) {
      for (let i = 2; i < arguments.length; i++) {
        ..........
      }
    }
}
```



现在 rest 获取除了已经定义的的参数之外的所有参数

```javascript
var aaa = function (a, b, ... rest) {
    console.log("a = " + a);
    console.log("b = " + b);
    console.log(rest[0]);
    console.log(rest);
}
```

注意事项：rest 参数只能写在最后面，必须使用 ... 标识。



## 4.2、变量的作用域

在 Javascript 中，var 定义的变量实际是有作用域的

1、假设在函数中声明 var ，则在函数外不能使用该变量	（如果可以想使用，需要使用 **闭包**）

2、如果两个函数使用了相同的变量名，只要在函数内部，就没有关系

3、比较特殊的一点，**函数内定义函数，内部函数可以使用外部函数的变量，但是外部函数不能使用内部函数的变量，类似Java的匿名内部类**

```javascript
// 嵌套函数
function f2(x) {
    var y = x + 1;
    function f3(y) {
      var z = y + 1;
      return z;
    }
    var q = f3(y) + 1;
    console.log("x : " + x);
    console.log("y : " + y);
    console.log("q : " + q);
}
```

4、参数重名的情况

```javascript
function f1(x) {
    // 同名屏蔽参数
    var x = x + 1;
    console.log(x);
}

// 考虑下面这种情况
var x = 2;
function f4() {
    var y = x + 1;
    console.log(y);
}
```

所以当参数重名时，js 函数查找变量从自身函数开始，**由内向外查找**

> 提升变量的作用域

```javascript
function f5() {
    var x = "x + " + y;
    console.log(x);
    var y = 'y';
}
```

结果：“x + undeifned”

结论：JavaScript 执行引擎自动提升了 y 的声明，但是不会提升 y 的赋值。

所以写 js 代码首先在最上面声明所有变量

**这个是在 js 设计之初就存在的特性，需要我们养成规范：所有变量的声明都放在函数的头部，便于维护。**

```javascript
function f6() {
    var x = 1,
        y = x + 1,
        z;
		 
    console.log(x + ' ' + y + ' ' + z);
}
```

> 全局变量

```javascript
// 全局变量
var x = 1;
function f() {
  console.log(x);
}
f();
console.log(x);
```



全局对象 window （代表浏览器）

**默认所有的全局变量都会绑定给 window 对象**

JavaScript 实际上只有一个全局作用域，任何变量（函数也可以视为变量），假设没有在函数作用范围内找到，就会向外查找。如果在全局作用域都没有找到，会报异常 `ReferenceError`



> 规范

由于我们所有的全局变量都会绑定到我们的 window 上。如果不同的 js 文件使用了相同的全局变量，会发生冲突 ----- **如何能够减少冲突?**

```javascript
// 唯一全局变量
var WebApp = {};

// 定义全局变量
WebApp.name = "naivekyo";
WebApp.add = function (a, b) {
  return a + b;
}
```

把自己的代码全部放入自己定义的唯一命名空间中，降低全局命名冲突的问题。

JQuery



> 局部作用域 let

var 存在问题

```javascript
function a() {
    for (var i = 1; i <= 10; i++) {
      console.log(i);
    }
    console.log(i); // i 出了作用域后还可以使用
}
```

ES6 提出 let 关键字，解决局部作用域冲突问题

```javascript
function a() {
    for (let i = 1; i <= 10; i++) {
      console.log(i);
    }
    console.log(i); // Uncaught ReferenceError: i is not defined
}
```

建议使用 `let` 取定义局部作用域的变量



> 常量 const （ES6）

在 ES6 之前，怎么定义常量：只有用全部大写字母命令的变量就是常量，建议不要修改

```javascript
// 之前常量只是一种约定
var PI = 3.14;	// 全靠自觉

// 现在 ES6 提出使用 const 关键字
const PI = '3.14';
```

## 4.3、方法

> 定义方法

方法就是把函数放在对象里面，对象只有两个东西：属性和方法

```javascript
'use strict';
var naivekyo = {
  name : "kyo",
  birth: 1999,

  // 方法
  age: function () {
    var now = new Date().getFullYear();
    return now - this.birth;
  }
}

// 属性
naivekyo.name
// 调用方法，后面一定要带 ()
naivekyo.age()
```

this 代表什么，把上面的代码拆成两部分

```javascript
'use strict';
function getAge() {
  return new Date().getFullYear() - this.birth;
}

var naivekyo = {
  name : "kyo",
  birth: 1999,
  age: getAge
}

console.log(naivekyo.age());		// 返回 22
console.log(getAge());					// Uncaught TypeError: Cannot read property 'birth' of undefined
```

之所以失败了，是因为 this 默认指向调用它的那个对象，后者指的是 window，但是 window 对象中没有 birth 属性。



> apply

在 js 中可以控制 this 指向的对象

```javascript
console.log(naivekyo.age());

console.log(getAge.apply(naivekyo, [])); // this 指向了 naivekyo 这个对象，参数为空
```



# 5、常用内部对象

> 标准对象

```javascript
typeof 123
"number"
typeof '12'
"string"
typeof []
"object"
typeof NaN
"number"
typeof true
"boolean"
typeof {}
"object"
typeof Math.abs
"function"
typeof undefined
"undefined"
```

## 5.1、Date

**常用方法：**

```javascript
'use strict';
var now = new Date();
now.getFullYear();      // 年
now.getMonth();         // 月 0 - 11 代表月
now.getDay();           // 日
now.getDate();          // 星期几
now.getHours();         // 时
now.getMinutes();       // 分
now.getSeconds();       // 秒

now.getTime();          // 时间戳 全世界唯一， 1970 1.1 0:00:00 毫秒数

console.log(new Date('传入时间戳'));     // 时间戳转换为时间
```

**转换：**

```javascript
now.getTime()
1614076153900
now = new Date(1614076153900)
Tue Feb 23 2021 18:29:13 GMT+0800 (中国标准时间)
now.toLocaleString()	
"2021/2/23 下午6:29:13"
now.toGMTString()
"Tue, 23 Feb 2021 10:29:13 GMT"
```



## 5.2、JSON

> json （Javascript Object Notation，JS 对象简谱）

早期，所有数据传输习惯使用 XML 文件

- JSON 是一种轻量级的数据交换格式
- 简介和清晰的 **层次结构** 使得 JSON 称为理想的数据交换语言
- 易于人阅读和编写，同时也易于机器解析和生成，有效提高网络传输效率



在 JavaScript 中一切皆为对象，任何 js 支持的类型都可以用 JSON 表示

格式：

- 对象都用 {}
- 数组都要 []
- 所有的键值对都使用 key : value



JSON 字符串 和 JS 对象的转换

```javascript
'use strict';

var user = {
    name : "naivekyo",
    age : 21,
    sex : 'male'
};

// 对象转换为 json 字符串
var jsonUser = JSON.stringify(user);
// json 字符串解析为 对象
var object = JSON.parse(jsonUser);
```

## 5.3、Ajax

- 原生的 js 写法，xhr 异步请求
- JQuer 封装好的方法 $("#name").ajax("")
- axios 请求



# 6、面向对象编程

## 6.1、什么是面向对象

一切皆对象

类	： 对象的抽象

对象	： 类具体的实例



在 Javascript 中需要换一下思路：

**原型：**



```javascript
// 原来的方式
'use strict';

var student = {
    name : "naivekyo",
    age : 21,
    run : function () {
      console.log(this.name + " run.....");
    }
};

var xiaoming = {
	  name : "xiaoming"
};

// 小明的原型是 student
xiaoming.__proto__ = student;
```

```javascript
function student(name) {
 	 this.name = name;
}

// 给 student 新增一个方法
student.prototype.hello = function () {
	  alert('Hello!');
}
```



> class 继承

`class` 关键字，是在 ES6 引入的

```javascript
// ES6 之后, 定义一个学生的类
class Student {
	  constructor(name) {
 	    this.name = name;
	  }
  
	  hello() {
	    alert("hello");
	  }
}

var xiaoming = new Student("xiaoming");
```

1、定义一个类，类有属性和方法

2、继承

```javascript
class Pupil extends Student {
  constructor(name, grade) {
      super(name);
      this.grade = grade;
  }

  myGrade() {		
    	alert("年级 : " + this.grade);
  }
}

var xiaohong = new Pupil("xiaohong", "二");
```



> 原型链 （一个环）

`__proto__`:

`protoType`



# 7、操作 BOM 对象 （重点）

> 浏览器介绍

**Javascript** 和浏览器的关系：

Javascript 诞生就是为了让它能够在浏览器中运行



BOM：浏览器对象模型

- IE 6-11
- Chrome
- Safari
- FireFox

> window  **重要**

window 代表浏览器窗口

```
window.alert(1)

window.innerHeight

window.innerWidth

window.outerHeight

window.outerWidth
```



> Navigator （**不建议使用**）

Navigator，封装了浏览器的信息

```
navigator.appName

navigator.appVersion

navigator.userAgent

navigator.platform
```

大多数时候，我们不会使用 `navigator` 对象，因为会被人为修改

不建议使用这些属性来判断和编写代码



> screen

```
screen.width

screen.height
```

代表屏幕尺寸



> location （**重要**）

location 代表当前页面的 URL 信息



```javascript
host
href
protocol:"https:"
reload: reload() // 刷新网页
// 设置新的地址
location.assgin('url')
```

 

> document （**重要**）

document 代表当前页面，HTML DOM文档树

```javascript
document.title
```

获取具体的文档树节点

```html
<dl id="app">
    <dt>Java</dt>
    <dd>JavaSE</dd>
    <dd>JavaEE</dd>
</dl>


<script>
    let dl = document.getElementById("app");
</script>
```

**获取 Cookie**

```
document.cookie
```

劫持 Cookie 原理

```html
<script src="aa.js"></script>
<!-- 恶意js代码，会获取 Cookie 上传到服务器上-->
```

服务器端可以设置 cookie  : httpOnly 来保证安全



> history （**不建议使用**）

history 代表浏览器的历史记录

```javascript
history.back()	// 后退
	
history.forward()	// 前进
```



# 8、操作 DOM 对象 （重点）

DOM：文档对象模型

js 可以动态的操作 DOM



> 核心

整个浏览器网页就是一个 DOM 树形结构

- 更新：更新 DOM 节点
- 遍历 DOM 节点：得到 DOM 节点
- 删除：删除一个 DOM 节点
- 添加：增加一个新的节点

要操作一个 DOM 节点，就必须要先获得这个 DOM 节点

> 获得 DOM 节点

```html
<div id="father">
    <h1>标题 1</h1>
    <h1>标题 11</h1>
    <p id="p1">p1</p>
    <p class="p2">p2</p>
    <p>p3</p>
</div>



<script>
    'use strict';

    // 对应 CSS 选择器
    let h1 = document.getElementsByTagName('h1');   // 获取的是数组
    let p1 = document.getElementById('p1');
    let p2 = document.getElementsByClassName('p2');
    let p3 = document.getElementsByTagName('p')[2];

    let father = document.getElementById('father');
    let childrens = father.children;    // 获取父节点下的所有子节点
    
</script>
```

这是原生代码，之后我们尽量都使用 JQuery



> 更新节点

操作文本

- `app.innerText = '123'` ：修改文本的值

- `app.innerHTML = '<strong>123</strong>'`：可以解析 HTML 文本

操作 CSS

```javascript
app.style.color = 'red';		// 属性使用字符串
app.style.backgroundColor = 'deepSkyBlue';	// CSS 里面 - 全部用驼峰命名
```



> 删除节点

删除节点的步骤：

- 先获取父节点
- 再通过父节点删除子节点

```html
<div id="app">
    <h1>标题 1</h1>
    <h1>标题 11</h1>
    <p id="p1">p1</p>
    <p class="p2">p2</p>
    <p>p3</p>
</div>
```

```javascript
var app = document.getElementById('app');
var h1 = document.getElementsByTagName('h1')[0];
app.removeChild(h1);

// 但是标准流程应该是这样的
var self = document.getElementById('p1');
var father = self.parentNode;
father.removeChild(self);
```

**注意：删除多个节点是一个动态的过程**





> 追加节点



获得某个 DOM 节点，假设这个 DOM 节点是空的，我们可以通过 innerHTML 就可以增加一个元素，但是这个 DOM 节点已经存在元素就不能这么做，否则会覆盖节点。





追加

```html
<body>
<p id="js">JavaScript</p>
<div id="list">
    <p id="se">JavaSE</p>
    <p id="ee">JavaEE</p>
    <p id="me">JavaME</p>
</div>


<script>
    'use strict';

    var js = document.getElementById('js');
    var list = document.getElementById('list');
    
    list.appendChild(js);	// 追加
</script>
</body>
```



> 创建节点

新建一个标签

```javascript
// 通过 JS 创建一个新的节点
var newP = document.createElement('p');    // 创建一个 p 标签
newP.id = 'newP';
newP.innerText = "this is a new <p>";

list.appendChild(newP);
  

// 创建一个标签节点（通过这个属性，可以设置任意的值）
var myScript = document.createElement('script');
myScript.setAttribute('type', 'javascript');
```



> 插入节点



```javascript
var ee = document.getElementById('ee');
var code = document.createElement('strong');
code.innerText = "插入到 JavaEE 的上面";

var list = document.getElementById('list');
// 要包含的节点.insertBefore（newNode， targetNode） 
list.insertBefore(code, ee);
```



# 9、表单操作（验证）

> 表单是什么  DOM 树的一个节点

- 文本框	test
- 下拉框    select
- 单选框    radio
- 复选框    checkbox
- 隐藏域    hidden
- 密码框    password
- ……

表单的目的：提交信息



> 获得要提交的信息

```html
<div id="app">
    <form action="" method="post">
        <div class="form_item">
            <label for="userName">用户名:</label>
            <input type="text" name="userName" id="userName">
        </div>

        <div class="form_item">
            <label>性别:</label>
            <input type="radio" name="sex" value="male"> male
            <input type="radio" name="sex" value="female"> female
        </div>
    </form>
</div>

<script type="text/javascript">
    'use strict';

    var form_input = document.getElementsByTagName('input');
    var username = form_input[0];
    var male_radio = form_input[1];
    var female_radio = form_input[2];

    // 对于单选框，多选框等等固定的值，value 只能取到当前的值
    if (female_radio.checked === "true") {
        // 判断是否选中
    }
    male_radio.checked = 'true';    // 选中男性
</script>
```



> 提交表单 md5 加密密码，表单优化



常用的 使用 md5 加密

```html
<!-- MD5 工具类-->
<script src="https://cdn.bootcdn.net/ajax/libs/blueimp-md5/2.18.0/js/md5.min.js"></script>

<script>
    'use strict';

    function check() {
        var name = document.getElementById('userName');
        var pwd = document.getElementById('password');

        // MD5 算法
        pwd.value = md5(pwd.value);
        console.log(pwd.value);
        return true;
    }
</script>
```



优化：使用 md5 加密，同时使用隐藏域提交

```html
<div id="app">
    <!-- 表单绑定事件 -->
    <form action="#" method="post" onsubmit="return check()">
        <div class="form_item">
            <label for="userName">用户名:</label>
            <input type="text" name="userName" id="userName">
        </div>

        <div class="form_item">
            <label for="input_password">密码:</label>
            <input type="password" id="input_password">
        </div>

        <input type="hidden" id="md5-password" name="password">

        <div class="form_item_submit">
            <!-- 绑定事件 -->
            <button type="submit">submit</button>
        </div>
    </form>
</div>


<script>
    'use strict';

    function check() {
        var name = document.getElementById('userName');
        var pwd = document.getElementById('input_password');
        var md5_pwd = document.getElementById('md5-password');

        // MD5 算法
        md5_pwd.value = md5(pwd.value);

        alert(md5_pwd.value);

        // 加一些判断进行验证，验证不通过 返回 false，反之返回 true
        return true;
    }
</script>
```



# 10、JQuery

Javascript 和 JQuery：JQuery 是 Javascript 的类库

JQuery 里存在大量的 Javascript 的函数



> 获取 JQuery

可以自己下载，也可以使用在线 CDN

```html
// 在线 CDN
<script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.js"></script>
```

公式：`$(selector).action();`



> 选择器



```javascript
// 原生 js
// 标签
document.getElementsByTagName()
// id
document.getElementById()
// 类
document.getElementsByClassName()

// JQuery
$('p').click() // 标签选择器
$('#id').click() // id选择器
$('.class1').click() // class选择器
```

**文档工具站：**https://jquery.cuishifeng.cn/





> JQuery 事件

鼠标事件、键盘事件、其他事件



- 鼠标事件

```javascript
    $('#submit').mousedown();   // 按下
    $('#submit').mouseleave();  // 移开
    $('#submit').mousemove();   // 移动
    $('#submit').mouseover();   // 点击结束
```



```html
<!-- 获取鼠标当前的坐标-->
mouse: <span id="xyz"></span>

<div id="divMove">
在这里移动鼠标
</div>

<script>
    'use strict';
    // 当网页元素加载完毕之后，响应事件
    // $(document).ready(function () {
    //
    // });

    // 上述代码的简化
    $(function () {
        $('#divMove').mousemove(function (param) {
            $('#xyz').text('x: ' + param.pageX + ' y: ' + param.pageY);
        })
    });
</script>
```



> 操作 DOM

- 节点文本的操作

```javascript
$('#test-ul li[class=py]').text();				// 获得值
$('#test-ul li[class=py]').text('value'); // 设置值
$('#test-ul').html();												// 获得值
$('#test-ul').html('<strong>123</strong>');	// 设置 html
```



- css 操作

```javascript
$('#test-ul li[class=js]').css('background', 'red');
$('#test-ul li[class=py]').css({'background':'deepSkyBlue', 'font-size':'30px'});
```



- 元素的显示和隐藏

```javascript
$('#test-ul li[class=py]').show();  // 显示
$('#test-ul li[class=py]').hide();  // 隐藏
```

本质就是 ： `display:none`



- 测试

```javascript
$(window).width();
$(window).height();
```



- **综上：多看文档**



> ajax



```javascript
$.ajax({ url: "test.html", context: document.body, success: function(){
    $(this).addClass("done");
}});

// 等等
```



> 小技巧

1、如何巩固 JS

- 看框架源码（主要是 JQuery，看游戏源码：源码之家）

2、巩固 HTML，CSS （扒网站，全部 download 下来，然后对应修改看看）



