---
title: JavaScript Summary (二)
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221059.jpg'
coverImg: /img/20220225221059.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-07 15:02:05
summary: "JavaScript 初步学习(二)"
categories: JavaScript
keywords: JavaScript
tags: JavaScript
---



# Java Script

```javascript
Brendan Eich 布兰登-艾奇 1995年再网景公司用10天发明LiveScript  与Sun合并更名为JavaScript
脚本语言：不需要编译，运行过程中由js解释器/引擎来进行解释并且执行
运行在客户端
可以基于node.js进行服务端编程
```

## 浏览器执行js代码
```javascript
浏览器分为渲染引擎和js引擎
渲染引擎也称为内核 既是浏览器的内核
js引擎：用来读起js代码，编译后运行
js的组成：
ECMAscript DOM BOM
```


## JS的执行机制
```javascript
单线程！同一时间只能干一件事
```

## JS的同步和异步
```javascript
先执行主线程上的同步任务，碰到异步任务，将异步任务放入任务队列，等待主线程执行完毕在将任务队列的异步任务放入栈中执行
```

### 同步任务
```javascript
同步任务在主线程上执行，形成一个栈
```


### 异步任务
```javascript
放在任务队列里面
通过回调函数实现
一般有三种：
    普通事件  click
    资源加载  load
    定时器    setTimeOut
```
# 变量
```javascript
存放数据的容器
1.声明变量
2.赋值
var age=15
只声明，未赋值      结果是undefined 未定义的
未声明，未赋值      结果是报错 not defined
未声明，直接赋值    可以使用，但是变成全局变量
```

## 变量命名规范
```javascript
由字母、数字、下划线、$组成
区分大小写
不能以数字开头
驼峰命名 第一个单词的首字母小写
不要以name命名
```
## 数据类型
```javascript
js是一种弱语言，可以不指定变量类型
js的变量数据类型由js引擎根据运行时等号右边的值来确定
同一个变量的数据类型可以改变，动态语言
Number      默认值 0
String      默认值 ""
Boolean     默认值 false
Undefined   默认值 undefined
Null        默认值 null
```

### Number
```javascript
数字型
八进制 0开头  010  = 8
十六进制 0x开头  0xa = 10
数字的最大值 1.7976931348623157e+308
数字的最小值 5e-324
特殊值
    Infinity        无穷大
    -Infinity       无穷小
    Nan    not a number 非数值
```

#### isNan()
```javascript
isNan(13)   false
```

### 字符串型 String
```html
""/'' 中的任意文本
更推荐用单引号 因为h5里面的属性等等为""
嵌套的话  使用外单内双
js里面使用的是转义符  几乎都是\开头
\n  换行
\\  斜杠
\'  单引号
\b  空格
\t  tab缩进
```
#### 字符串长度
```javascript
str.length
```

####  字符串拼接
```javascript
str+任意类型   =   新的字符串
```

### 布尔类型 boolean
```javascript
true和false可以参与算法计算 1和0
```


### undefined
```javascript
undefined+字符串  等于 字符串
undefined+数字    等于  Nan
```

### 空值  null
```javascript
null+字符串  等于 字符串
nulld+数字    等于  原先的数字
```


### typeof 检测数据类型
```javascript
null返回的是object
prompt取过来的值为字符
```

## 数据类型的转换

### 转换为字符串
```javascript
toString    var num = 1   num.toString()
String      var num = 1   String(num)
拼接字符串                                          隐式转换
```

### 转换为数字
```javascript
parseInt(string)                得到整数
parseFloat(string)              得到浮点数
Number(string)                  
利用运算符                                          隐式转换
```
### 转换为Boolean

```javascript
Boolean()  代表空的否定的转换为false    0  Nan  null  undefined ''
            其他都为true
```

# 运算符

### 算术运算符
```javascript
+
1
*
/
%
++
--
i++ ++i的区别
i++先返回值后加1 
```
### 比较运算符
```javascript
>
<
>=
<=
==      会转型  会默认把字符串转换为数字型
!=      
===     全等 值和数据类型都一样
```

### 逻辑运算符
```javascript
&& 
||
！
```

#### 逻辑与
```javascript
表达式1 && 表达式2 
只看左边 左边为真时返回表达式2
        左边为假返回表达式1
```

#### 逻辑或
```javascript
表达式1 && 表达式2 
只看左边 左边为真时返回表达式1
        左边为假返回表达式2
```

### 赋值运算符
```javascript
=
+=      num += 2     num = num + 2
-=
*=
/=
%=
```
### 运算符的优先级
```javascript
小括号  >  一元运算符（++ -- ） >  算术运算符  >  比较运算符  >  逻辑运算符（与 > 或） >  赋值运算符  >  逗号
```

## js 流程控制 

### 分支结构

#### if else
```javascript
if () {

} else {

}

闰年案列
能被400整除 被4整除却不能被100整除
```

#### switch
```javascript
switch(变量) {
    case value1 :
        代码 
        break;

    default :
        break;
}

必须全等才可以匹配上
直到遇见break才会跳出
```
#### 三元表达式
```javascript
由三元运算符组成的表达式
条件表达式 ? 表达式1 ： 表达式2
真的话表达式1  假的话表达式2
```

### 循环结构

#### for循环
```javascript
for(初始化变量;条件表达式;操作表达式) {

}
```

#### while循环
```javascript
while() {

}
```

#### do...while循环

```javascript
do { 

}  while ()
先执行一次在判断
```

#### continue关键字
```javascript
跳过本次循环，执行下次的
```



# 函数
```javascript
声明函数 调用函数
```

## 声明函数
```javascript
function 函数名(变量) {
    代码块
    return 结果 
}

匿名函数    var 函数名 = function(){
        代码块
        return 结果
    }

没有return 会返回一个undefined
```


## arguements
```javascript
arguements时函数的内置对象，存储了传递过来的所有实参
arguements是一个伪数组
    具有length属性
    按照索引的方式存储
```


## 两种作用域

### js的作用域(es6之前)
```javascript
全局作用域
    整个script标签  或者整个js文件

局部作用域
    在函数里面
```

### 块级作用域(es6)
```javascript
在{}里面的
```

#### 全局变量 局部变量
```javascript
全局变量
    在全局作用域里面的变量

局部变量
    在局部作用域里面的变量

注意!! 在局部作用域未声明而直接赋值使用的变量是全局变量
       函数的形参也可以看作局部变量

       全局变量只有在浏览器关闭才会销毁 占用内存
       局部变量执行后就销毁 
```

### js的预解析
```html
js引擎分为两步
    预解析之后 
    js引擎会把所有的var 和 function 提到作用域的最前面
    按照代码的顺序进行执行执行

js的预解析
   变量预解析 和 函数预解析
   将所有的变量的声明提升到当前作用域的最前面
```


```javascript
f1()
function fi() {
    var a = b = c = 9
    console.log(a)     9
    console.log(b)      9
    console.log(c)      9
}

console.log(a)   
console.log(b)  9
console.log(c)  9

注意  var a = b = c =  9  仅仅对第一个进行了声明
```


# js对象

```javascript
js对象分为 自定义对象  内置对象   浏览器对象
自定义对象  内置对象是ECMAscript的  浏览器对象是js独有的
```
## 创建对象的方法



### 字面量创建

```javascript
var obj = {}
var obj = {
    uname jzh,
    age 21,
    sex '男',
    satHi function(){
        console.log('hi~')
    }
}
    
```

```javascript
调用对象的属性
    obj.uname
    obj['sex']
调用对象的方法
    obj.sayHi()
```
### new Object 
```javascript
var obj = new Object()
```

### 构造函数 关键字创建
```javascript
构造函数的名字首字母大写
不需要return返回值
调用构造函数必须用new
```


### new关键字的执行过程
```javascript
1.new构造函数的时候在内存中创建一个空的对象
2.this指向刚才的空的对象
3.执行构造函数
4.返回对象
```

### 对象属性的遍历
```javascript
for (变量 in 对象) {
    console.log(变量)       打印变量的名字
    console.log(对象[变量]) 打印变量的值
}
```


## js的内置对象
```javascript
查阅MDN
```
### Math数学对象
```javascript
Math对象不是一个函数对象，里面都是静态方法
Math.PI 
Math.max( ) 如果参数里面由非数字，则会返回Nan 
Math.ceil() 向上取整
Math.floor() 向下取整
Math.abs()  绝对值
Math.round()  四舍五入   n.5  往大了取
Math.random()  随机数生成
```

### Date日期对象
```javascript
是一个构造函数 必须使用new来实例化
Date 对象是从1970年1月1日开始计算
var date = new Date()           没有参数就会返回当前的系统时间
var date = new Date('2021-10-26 ')
获取直到现在为止的毫秒数
    date.valueOf()  获取直到现在为止的毫秒数
    date.getTime()  获取直到现在为止的毫秒数
    var date  =  +new Date() 获取直到现在为止的毫秒数
    h5新增的方法
        Date.now()
```


### Array数组对象

####    检测是否是一个数组
```javascript
    instanceof
    var arr = []
    console.log(arr instanceif Array)

    isArray(arr)  h5新的语法 ie9以上的版本
```

#### 添加元素
```javascript
push()  在数组的末尾添加一个元素，可以同时添加多个 返回的值是数组长度
unshift() 在数组的开头添加元素，可以同时添加多个 返回的值是数组长度
```

#### 删除元素
```javascript
pop() 删除最后一个元素，一次只能删除一个，返回值是删除的元素
shift()  删除第一个元素，一次删除一个，返回删除的元素
```

#### 数组排序

##### 反转数组
```javascript
reverse()
```

##### 冒泡排序
```javascript
sort()
var arr = [1,55,7,66,12]
arr.sort(function(a,b){
    return a - b    升序
    return b - a    降序
})
```



#### 数组的索引获取
```javascript
indexOf()
lastindexOf()
```


#### 数组转换为字符串
```javascript
toString()
join('分隔符')
```

#### 其他方法
```javascript
concat()  链接数组，返回连接后的数组
slice()   截取数组，返回被截取的新数组
splice()  删除多个元素，从第几个开始，删除几个
```

### 基本包装类型
```javascript
String Number Boolean

var str = 'Andy'
他的过程是
    temp = new String('Andy')
    str = temp
    temp = null
字符串的不可变
    不会覆盖原来的值，而是新建一个
```

### 简单数据类型和复杂数据类型
```javascript
简单类型又叫做值类型，复杂数据类型又叫做引用类型
值类型 string number boolean undefined  null 
引用数据类型 通过new关键字创建的对象  比如Object，Array Date0
简单数据类型在栈   复杂数据类型在堆存放
```



# webAPI
```javascript
API:Application Programming Interface 应用程序编程接口
```


# DOM
```javascript
Document  Object Model 文档对象模型
```

## DOM 树
```javascript
根：document
元素：element
```

## 获取元素

### getElementById
```javascript
document.getElementById();
参数是字符串
返回值是一个对象
```

### 根据便签名 getElementsByTagName()
```javascript
返回的是对象集合  以伪数组呈现
document.getElementsByTagName() 获得所有该标签
element.getElementsByTagName() 获得父元素下面的所有该标签
```

### h5新增的根据类名获得标签
```javascript
getElementsByClassName()
querySelector()  
querySelectorAll()
```


#### 选择器 document.queryselector()
```javascript
切记里面的选择器要加符号
但是只能得到第一个符合条件的元素0
```

####  选择器 document.queryselectorAll()
```javascript
切记里面的选择器要加符号
获得所有复合的元素集合
```

### 获取特殊元素  body html
```javascript
document.body;
document.html;  会返回undefined
document.documentElement;  才可以获得html
```



## 创建元素
```javascript
document.write 如果页面文档流加载完毕之后调用，会导致页面重绘
element.innerHTML           
    拼接字符串  因为需要开发内存  效率较慢
    数组之后jion方法转化为字符串  速率最快
element.creatElement()      效率较快
```




## 修改元素属性

### 更改或者获取元素文字内容
```javascript
不识别html的标签   去除空格和换行  innerText();
识别html标签  不去除空格和换行  innerHtml();
```

### 更改元素的属性
```javascript
获取之后可以直接改，和属性赋值一样
```


### 更改表单元素的属性
```javascript
表单里面是修改value
```


### 修改元素的样式属性
```javascript
element.style.属性 = "新的属性值"
```


## 事件.

### 事件三要素
```javascript
机制：触发---响应机制
三要素：事件源（出发对象）  事件类型（什么事件）  事件处理程序（干什么）
```


### 执行事件的步骤
```javascript
1.获取事件源
2.注册事件
3.添加事件处理程序
```



### 常用的添加事件
```javascript
给元素添加事件，称为绑定事件或者注册事件
注册事件有两种方式：传统的方法和 方法监听注册方式
```

#### 传统方法
```javascript
一般以on开头，onClick onMouseOver 
特点：注册事件的唯一性 ， 同一个元素的同一个事件只能设置一个处理函数
```

#### 方法监听注册方式
```javascript
addEventListner 可以有多个处理函数 ，按注册顺序执行
eventTarget.addEventListner(type,listner,[useCapture])
type就是监听的类型  比如click  mouse over等等
listener 事件的处理函数  事件发生时 会调用该函数
useCapture  可选参数 是一个布尔值 默认为false
同一个元素可以添加多个监听器
```

### 删除事件的方法

#### 传统方法
```javascript
element.function = null;
element.removeEventListener(type,listener[,useCapture]);
```



### DOM事件流
```javascript
事件发生时，页面节点按照特定的顺序传播称为事件流  简单来说 事件处理的顺序
捕获：从document找到相应的标签   冒泡
捕获——>当前目标——>冒泡
事件捕获阶段:网景 
事件冒泡阶段:微软
```


```javascript
注意：传统方式只能得到冒泡阶段
addEventListener的最后一个可选参数useCapture 为true时为捕获阶段  为false为冒泡阶段
```


```javascript
注意！！！：onblur onfocus  onmouseenter  onmouseleave   没有冒泡
```






### 事件对象
```javascript
event 只有存在事件才能成为事件对象  系统自动对象
事件对象存储的时和对应事件相关的内容
可以命名为event evt e 
ie678为  window.event
```

#### 事件对象的常用方法
```javascript
e.target 返回触发事件的对象   注意：e.target 返回的是触发的元素  this返回的是绑定元素
e.type 返回触发事件的类型
e.currentTarget 返回绑定的元素 和this一样
```


#### 阻止默认的行为
```javascript
e.preventDefault(); 组织默认行为，比如跳转  提交
```


#### 阻止冒泡
```javascript
stopPropagation()方法
停止传播
兼容性：cancelBubble  取消冒泡
window.event.cancelBubble = true;
```



### 事件委托/代理
```javascript
比如一个列表里的元素都需要点击事件  则只给他的父元素就是ul添加事件即可
```










## h5自定义属性的规范
```javascript
自定义属性统一用  data-  开头
```

###    自定义属性的获取方法
```javascript
1. element.getAttribute('属性名')
2. element.dataset.属性名
    如果属性名是多单词，那么使用驼峰命名获取： element.dataset.userName
```


​        



# BOM 浏览器对象模型
```javascript
BOM包含DOM
BOM包括 docement location navigation screen  history
window作用域为全局  全局变量会变成window的属性  函数会变成一个window的方法
window的name 是window的一个特殊属性 所以变量不要名为name
```

## 常见事件


### 界面加载事件 onload事件
```javascript
window.onload
等文档内容全部加载完毕后触发该事件
```


### 文档加载事件  DOMContentLoaded
```javascript
当DOM文档加载完毕后就会触发  不包含css，flash等等
```


## 定时器

### setTimeOut()
```javascript
单位为毫秒 事件到了之后调用对应的函数方法  这个函数称为回调函数
```


### clearTimeOut()
```javascript
停止定时器
```

### setInterval()
```javascript
这个是会调用很多很多次
```

### clearInterval()

```javascript
清空 interval 定时器
```



## location对象
```javascript
获取或者设置窗体的URL 并且可以解析URL  返回的是一个对象称为location对象
```

### URL 统一资源定位符
```javascript
protocol://host[:port]/path/[?query]#fragment
```

### 常用属性和方法
```javascript
location.href   获取或者设置URL
location.host   返回域名或者地址
location.search 返回参数
location.pathname  返回路径
location.hash    返回片段 

location.assign()  网页重定向  记录浏览历史 可以后退
location.replace() 替换当前页面  不记录历史 不可以后退
location.reload()  重新加载     刷新  参数为true强制刷新，不从缓存获取，ctrl+f5
```

## navigator对象
```javascript
包含浏览器的相关信息
一般用来判断使用的是否为手机
```


## history对象
```javascript
back()      后退
forward()   前进
go()        前进/后退   正数前进  负数后退
```





# 网页特效

## offset偏移量
```javascript
动态获得元素的位置、大小等等   返回值不带单位
offset 可以以带定位的父元素为基准 如果父元素不带，则以body为准
offsetWidth   offsetHeight  带有padding和border和width
offsetParent  返回带定位的父亲

offset和style的区别   
    offset返回值没有单位  并且是只读属性 不可赋值
    style只能获得行内样式表的属性    
    offset获取的宽高带有内边距和边框  style没有
```

## client可视区
```javascript
和offset差不多  返回值没有单位  并且宽高不带边框
```


## scroll滚动
```javascript
和offset差不多  返回值没有单位  并且宽高不带边框   如果内容溢出 则加上溢出内容
```



# 立即执行函数
```javascript
创建一个独立的作用域
不需要调用直接执行
(function() {})()             (function(){}())
```


# mouseover和mouseenter的区别
```javascript
mouseover如果在父盒子加特效 在经过子盒子时也会触发
mouseenter/leave只触发自身 原理是他不冒泡
```


# 节流阀
```javascript
防止轮播图的连续点击导致图片移动过快
就是设置一个变量为布尔值  当动画开始时，将变量设置为flase  等待动画结束之后回调将变量设为true
```



# 本地存储

## session
```javascript
生命周期为浏览器窗口
单界面可以共享
以键值对存放

sessionStorage.setItem
sessionStorage.getItem
sessionStorage.removeItem
sessionStorage.clear
```

## local
```javascript
生命周期永远生效
多窗口共享
方法同于session
```


# this指向

```javascript
1.在全局作用域下指向window
2.定时器里面指向window
3.谁调用方法就指向谁
4.构造函数中指向构造的实例
```







# Ajax 
```javascript
当用户点击了某个超链接或者其他的事件，请求发送回服务器，服务器会根据用户的请求返回一个新的页面，即使用户看到的页面只改变了一小部分。
Ajax的优点就是只更新页面的一小部分，不会再更新整个页面。 Ajax依赖js，所以会有浏览器不支持，而搜索引擎的蜘蛛程序也看不见。
```

原理：对页面的请求以异步的方式发送到服务器，服务器不会用整个页面来回应请求，会在后台处理请求，同时用户可以继续浏览页面。
     Ajax的核心就是 XMLHTTPRequest 对象。它充当这服务器与客户端的中间人角色。以往的请求都由浏览器发出，而js通过这个对象可以自己发送请求，同时
     自己处理响应。


在使用Ajax的时候，要注意同源策略。只可以访问和html文档同一个域的资源



```javascript
获取对应浏览器的XMLHTTPRequest 对象
function getHTTPObject() {
    if (typeof XMLHttpRequest == "undefined") {
        XMLHttpRequest = function () {
            try {
            return new ActiveXObject("Msxml2.XMLHTTP.6.0");
        } catch (e) {}
        try {
            return new ActiveXObject("Msxml2.XMLHTTP.3.0");
        } catch (e) {}
        try {
            return new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {}
        return false;
        }
    }
    return new XMLHttpRequest();
}
```


```javascript
获取更新内容
function getContent() {
    var request = getHTTPObject();
    if (request) {
        request.open("GET","text.txt",true);
        request.onreadystatechang = function () {
            if (request.readyState == 4) {
                var para = document.createElement("p");
                var txt = document.createTextNode(request.responseText);
                para.appendChild(txt);
                document.getElementById("new").appendChild(para);
            }
        }
        request.send(null);
    } else {
        alert('Sorry,your browser doesn\'t support XMLHTTPRequest')
    }
}
addLoadEvent(getContent);   

readyState 的类型
    0  未初始化
    1  正在加载
    2  加载完毕
    3  正在交互
    4  完成
```



# Hijax : 渐进增强的Ajax


# 共享onload 事件
```javascript
有很多事件需要在页面加载成功之后就立即加载
我们将函数绑定到onload事件
```
## 第一种方法
```javascript
 window.onload  = function() {
    firstFunction();
    secondFunction();
}
```

## 第二种方法
```javascript
需要在自定义的函数最后将自定义函数加载到这个队列 addLoadEvent
function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            oldonload();
            func();
        }
    }
}
```



# js的性能优化

## 平稳退化
```javascript
让浏览者用户在不支持js的情况下也可以访问你的网页
应该只在绝对必要的情况下才需要弹出窗口
由于绝大多数的浏览器引擎的搜索机器人都不支持js
比如a的超链接标签    <a href="www.baidu.com" onclick="popUp(this.href);return false"></a>
要保证不支持js的情况下仍然可以跳转页面
```

## 渐进增强
```javascript
标记良好的内容就是一切
```

### js的分离
```javascript
我们可以把js事件绑定给一个元素，而不用在文档里编写
```

### 绑定事件
```javascript
 window.onload  = function() {
    if (!document.getElementById) return false;
    var links = document.getElementsByTagName("a");
    for (var i = 0; i<links.length;i++){
        if (links[i].getAttribute == "pop") {
            links[i].onclick = function {
                popUp(this.getAttribute("href"));
                return false;
            }
        }
    }
}
```


## 向后兼容
```javascript
要检测该浏览器的版本是否支持当前调用的方法
```

## 尽量减少访问DOM和尽量减少标记

## 合并和放置脚本

## 压缩脚本
```javascript
好的程序员总会备份一份js文件，里面有更好的脚本结构以及注释，方便后期的修改和调试。
添加到程序里面的脚本基本使用压缩版本，即  min.js
```





# 表单
```javascript
数据采集功能  <form>标签
```

## 表单的属性 
```javascript
action: URL地址  默认为当前地址 提交之后会立即跳到目的页面
method: get/post  提交方式
enctype: application/x-www-form-urlencoded    multipart/form-data    text/plain   提交之前如何编码
     multipart/form-data   当表单控件有上传文件时必须要这个
     text/plain            空格转化为+
target: _blank/_self/_parent/_top/framename  规定在何处打开action的url
```


## 表单的同步提交
```javascript
整个页面会发生跳转，跳转到action指定的url
页面提交之后，原来的页面的状态和数据会丢失

解决办法：
    利用Ajax来异步提交  表单采集数据，Ajax提交数据，来和服务器打交道
```

## 阻止表单的默认提交行为
```javascript
监听到提交事件之后，调用事件对象的event.preventDefault()函数阻止表单的提交和页面跳转
 $(function(){
        $("#form").submit(function(e){
            alert("asdsadsa")
            e.preventDefault();
        })
    })
```

## 获取表单中的数据
```javascript
serialize()函数  这个函数要求所有的控件必须有name属性
```


# 模板引擎
```javascript
渲染UI结构
根据指定的模板结构和数据自动生成一个html页面
```

## art-template 

```javascript
1.导入引擎
2.设置模板
3.设置数据
4.调用引擎
5.渲染页面
```


### 过滤器函数
```javascript
使用语法 {{value | filtername}}
定义语法
template.defaults.imports.filtername = function(value)
过滤器一定返回一个值
```





# 同源策略和跨域
```javascript
同源：协议、域名、端口号都相同的称之为同源
同源策略：Same origin policy
    浏览器规定，A网站的js，不允许和C网站之间进行资源的交互
    1.无法读取非同源网站的cookies  LocalStorage IndexedDB
    2.无法接触非同源网站的DOM
    3.无法向非同源网站发送ajax请求

跨域：概念与同源相反
    跨域请求可以正常发起，浏览器会正常接受到跨域响应的数据但不交给ajax而是交给同源策略处理
```




## 实现跨域请求
```javascript
JSONP  CORS
jsonp: 前端程序员想出来的临时解决方案  只支持get请求
CORS： 根本解决方案，支持两种请求方法  不兼容比较低的版本浏览器
```

## JSONP
```javascript
JSON with Padding  json的一种使用模式
原理：<script>标签不受同源策略的影响 通过src属性请求跨域的请求接口，并且通过函数调用的形式接收接口返回的数据
如何向不同域的js告诉调用什么函数：在查询字符串添加函数名
```

## jQuery发起jsonp
```javascript
动态创建和移除<script>标签
使用jQuery发起jsonp请求，对自动携带一个callback=jQueryxxx 的参数  jQueryxxx随机生成
$.ajax({
    url: 'http://ajax.frontend.net:3006/api/jsonp?name=zs&age=20'，
    dataType:'jsonp'，  //发起jsonp必选！
    jsonp: 'callback',  //发送到服务器的参数名称  默认为callback
    jsonpCallback: '回调函数名称',  //自定义回调函数名称
    success: function(res) {
        console.log(res);
    }
})
```


# 防抖和节流
```javascript
防抖：当事件被触发后，延迟n秒在执行回调函数，如果在这期间函数又被调用，则重新计时
节流：throttle 减少一段时间内事件的触发频率
节流阀：节流阀为空，则可以执行操作  不为空则不可以，每次操作前必须判断节流阀是否为空，执行完成之后将节流阀置为空值
```
## 防抖的应用场景
```javascript
1.在搜索框输入时，等待输入完成才执行回调函数
```


## 节流的应用场景
```javascript
1.多次点击按钮
2.懒加载时计算滚动条的位置，可以降低计算频率
```


# HTTP
```javascript
请求响应
```

## http请求
```javascript
客户端发起的请求  客户端发送的消息称为请求消息/请求报文
由四部分组成
    请求行  请求头部   空行  请求体
    请求行：请求方式 url  协议版本 用空格分隔
    请求头部： 头部字段名称和值  描述客户端的基本信息  User-Agent:浏览器类型 Content-Type:发送到服务器的数据格式  Accept:描述客户端接受什么类型的数据  Accept-Language:告诉服务器客户端要接收的网页语言 Host:要请求的服务器域名 
    空行：用来告诉服务器请求头部结束了
    请求体：  post请求包含的数据

    ！！只有post请求有请求体
```

## http响应
```javascript
响应消息时服务器响应客户端请求的消息报文
四部分组成：
    状态行  协议版本 状态码  状态码描述
    响应头部
        Content-Type: 响应数据的格式  Content-length:响应长度  Date:相应日期  X-Power-By:服务器使用的
    空行
    响应体  
```

## http请求方法
```javascript
get             查询 获取服务器资源  请求体中不会包含数据 数据在协议头中
post            新增 向服务器提交资源  数据在请求体中
put             修改 提交资源 使用新的资源替换旧的资源
delete          删除 请求服务器删除指定的资源
head            与get一样 但是没有响应体
options         获取http服务器支持的请求方法 允许客户端查看服务器性能 比如Ajax跨域时的预检
connect         建立一个到服务器资源的隧道
trace           沿着目标资源路径进行一个环回测试
patch           对已知的资源进行局部更新
```

## http响应状态码
```javascript
Status Code
1**  信息类的  需要继续操作
2**  成功   操作成功并且处理
    200   OK  请求成功  用于get/post请求
    201   CREATED  已经创建  成功请求并且创建了新的资源 用于post/put
3**  重定向 需要进一步的操作完成请求
    301     永久重定向  请求的资源已经被永久转移  使用新的URI
    302     临时移动       和301类似 但是使用原来的URI
    304     未修改  不会返回任何资源 通常客户端从缓存获得资源
4**  客户端错误
    400     语义有误/参数有误
    401     当前请求需要用户验证
    403     服务器理解请求 但是拒绝执行
    404     服务器无法格局客户端的请求找到资源
    408     请求超时
5**  服务器端错误
    500  服务器内部错误
    501  服务器不支持这个请求方法
    503  由于服务器超载或者维护  服务器暂时无法处理请求
```