---
title: Front-end learn CSS3
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225220858.jpg'
coverImg: /img/20220225220858.jpg
cover: false
toc: true
mathjax: false
date: 2022-03-29 21:02:26
summary: "学习 CSS"
categories: "Front End"
keywords: ["Front End", "CSS"]
tags: "Front End"
---



#  一、什么是 CSS

如何学习：

​	1、CSS 是什么

​	2、CSS 怎么用

​	3、**CSS 选择器 （重点 ）**

​	4、美化网页（文字，阴影、超链接、列表、……）

​	5、盒子模型

​	6、浮动

​	7、定位

​	8、网页动画（特效）

## 1.1、什么是 CSS

Cascading Style Sheet 层叠样式表

CSS：表现（美化网页）



字体、颜色、边距、高度、宽度、背景图片、网页定位、网页浮动



## 1.2、发展史

CSS 1.0

CSS 2.0	DIV（块）  +  CSS，HTML 与 CSS 结构分离，网页变得简单，适合 SEO （搜索引擎优化）

CSS 2.1	浮动、定位

CSS 3.0	圆角、阴影、动画…… 浏览器兼容性



## 1.3、快速入门

- style 标签
- link 导入外部 css 文件



**css 优势：**

1、内容和表现分离

2、网页结构表现统一，可以实现复用

3、样式十分丰富

4、建立使用独立于 html 的 css 文件

5、利用 SEO，容易被搜索引擎收录



## 1.4、CSS 的3种导入方式

- 行内样式：在标签中使用 style 属性
- 内部样式：在 head 头中使用 style 标签
- 外部样式：使用 link 标签引入外部样式



优先级：行内 > 内部 > 外部  （**遵循就近原则：哪一个样式离元素近，就使用哪一个样式**）



**拓展：外部样式两种写法**：

- link 标签，链接式 （推荐使用）

  ```html
  <link rel="stylesheet" href="css/style.css">
  ```

  

- 导入式 （了解即可 CSS2.1 特有方式）

  ```html
  <style>
      @import url("css/style.css");
  </style>
  ```

  

# 二、选择器

> 作用：选择页面上的某一个或某一类元素

## 2.1、基本选择器

1、标签选择器：选择一类标签

2、类选择器 class：选择所有 class 属性一致的标签，可以跨标签

3、id 选择器：全局唯一



优先级：不遵循就近原则

​	id选择器 > class选择器 > 标签选择器



## 2.2、层次选择器

1、后代选择器 ：选中某个元素的后面的元素		**空格隔开**

​								例如：body p {} 选中 body 下面的所有 p 元素

```css
body p {
  backgroud: red;
}
```



2、子选择器 ：一代，儿子		**> 连接**

​								例如：body>p{} 选中 body 下面一层的所有 p 元素

```css
body > p {
  backgroud: deepskyblue;
}
```



3、相邻兄弟选择器 ：同辈，但是对下不对上，只选择当前元素的下一个兄弟		**+ 号隔开**

​								例如：需要利用 id 或 class 协助处理

```css
.active + p {
  background: deepskyblue;
}
#test + p {
  background: red;
}
```



4、通用选择器 ：同辈，选择当前元素下面所有的兄弟		**\~ 号隔开**

```css
.active ~ p {
  background: green;
}
```

## 2.3、结构伪类选择器

伪类 就是加一些条件判断

```css
<style>
  /*ul的第一个子元素 */
  ul li:first-child {
    background: deepskyblue;
  }

  /* ul的最后一个子元素 */
  ul li:last-child {
    background: red;
  }
</style>
```

稍微复杂一些

```css
/* 选择 p1 : 定位到父元素, 然后找到其第一个子元素
	ele : nth-child(para) 找到当前元素 ele 的父元素的第 para 个子元素, 要求该元素为 ele
*/
p:nth-child(1) {
  background: yellow;
}

/* 比上面的更精确可以使用下面的方法，按类型匹配 */
p:nth-of-type(1) {
  background: green;
}
```



```css
p:nth-of-type(2):hover {
  background: purple;
}
```

## 2.4、伪元素

参考：https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-elements

伪元素是一个附加至选择器末的关键词，允许你对被选择元素的特定部分修改样式。

一个选择器中只能使用一个伪元素。伪元素必须紧跟在语句中的简单选择器/基础选择器之后。

**注意：**按照规范，应该使用双冒号（`::`）而不是单个冒号（`:`），以便区分伪类和伪元素。但是，由于旧版本的 W3C 规范并未对此进行特别区分，因此目前绝大多数的浏览器都同时支持使用这两种方式来表示伪元素。



## 2.5、属性选择器（常用）

**属性选择器在为不带有 class 或 id 的表单设置样式时特别有用：**



1、[属性] 		这种选择器有些标签不适用

2、[属性=值]		这种属性和值选择器也是有些标签不适用

3、[属性~=值]		选中属性包含值的标签，适用于由空格分隔的属性值：

4、[属性|=值]		选中属性包含值的标签，适用于由连字符分隔的属性值：

扩展（有点像正则表达式）

5、[属性 *= 值] 		包含

6、[属性 ^= 值]		以某值为开头

7、[属性 $= 值]		以某值为结尾



# 三、美化网页元素

## 3.0、通用 css

```css
/*以下为网页的通用设置*/
/*将所有浏览默认的内外边距重置为0*/
*, div, p, h1, h2, h3, h4, h5, h6, span, table, tr, td, th, ul, ol, li, form, input, button, img,
iframe, a {
    padding: 0;
    margin: 0;
}

/*清除浮动,兼容谷歌与火狐等*/
.cf:after {
    content: "";
    display: block;
    clear: both;
}

/*清除浮动,兼容ie写法*/
.cf {
    zoom: 1;
}

/*去除ul,ol,li列表标签的默认项目*/
ul, ol, li {
    list-style: none;
}

/*版心的设置*/
.main {
    width: 1200px;
    /*水平居中*/
    margin: 0 auto;
}

/*修改超链接标签的样式*/
/*务必按照超链接标签的四种状态的顺序修改,否则无效*/
/*记住:符合"爱-恨","lv-ha"原则*/
/*鼠标未点的样式*/
a {
    font-size: 20px;
}

/*以下为四种状态的样式*/
a:link {
    /*文本的上中下线设置overline/line-through/underline*/
    text-decoration: none;
    /*灰色*/
    color: grey;
}

/*访问过后的样式*/
a:visited {
    /*文本的上中下线设置overline/line-through/underline*/
    text-decoration: none;
    color: black;
    /*也可以设置文本大小等其它属性*/
}

/*鼠标覆盖的样式*/
a:hover {
    text-decoration: underline;
    color: red;
}

/*鼠标按住不放的样式*/
a:active {
    text-decoration: underline;
    color: red;
}
```



## 3.1、为什么要美化网页

1、有效传递页面信息

2、美化网页，吸引用户

3、凸显页面的主题

4、提高用户的体验



span 标签：重点要突出的字，使用该标签



## 3.2、字体样式



自己看看就行了



## 3.3、文本样式

1、颜色			color

2、**文本对齐方式**	text-align	

3、**首行缩进**		text-indent : 2em;  单位 em

4、**行高**		line-height  一般想要居中，就设置为和块的高度一致

5、装饰		text-decoration

补充

6、垂直对齐，需要参照

```css
img, scan {
  vertical-align: middle;
}
```



## 3.4、超链接与伪类

 

先了解一下三种不跳转的超链接

```html
<a href="#">
    <img src="../../../Resources/image/test.png" alt="">
</a>
<p>
    <a href="#">bookName: xxxx</a>
</p>
<p>
    <a href="javascript:void(0)">author: xxxx</a>
</p>
<p>
    <a href="1212" onclick="javascript:return false;">time: xxx</a>
</p>
```



然后记住这几个伪类选择器：

1、：hover		鼠标悬停的状态

2、：active		鼠标按住未释放的状态

3、：link			未访问的超链接

4、：visited		已经访问过的超链接



## 3.5、文本阴影

**文本阴影（不常用）**

```css
/*参数
    text-shadow  坐标系参考屏幕坐标系
    第一个参数： 水平偏移
    第二个参数： 垂直偏移
    第三个参数： 阴影半径
    第四个参数： 阴影颜色
*/
p[id=price] {
  text-shadow: 10px 0px 2px deepskyblue;
}
```



## 3.6、列表

```css
/* 处理列表 */

/*
    list-style
        none: 无装饰
        circle: 空心圆
        decimal: 数字
        square: 正方形
        …………
*/
ul {
    background: #faf6e5;
    padding-left: 86px
}

ul li {
    height: 30px;
    list-style: none;
    /*text-indent: 2em;*/
}
```

## 3.7、背景

背景颜色



背景图片

```css
div {
  width: 1000px;
  height: 700px;
  border: 1px solid red;
  background-image: url("images/1.gif");      /* 默认是平铺的 */
}

.div1 {
  /*水平平铺*/
  background-repeat: repeat-x;
}

.div2 {
  /*垂直平铺*/
  background-repeat: repeat-y;
}

.div3 {
  /*不平铺*/
  background-repeat: no-repeat;
}
```



## 3.8、渐变

```css
background-color: #0093E9;
background-image: linear-gradient(187deg, #0093E9 0%, #80D0C7 100%);
```

了解即可



# 四、盒子模型

## 4.1、什么是盒子模型

由内至外：content、padding、border、margin



margin：外边距

padding：内边距

border：边框



## 4.2、边框

1、边框的粗细

2、边框的样式

3、边框的颜色



**注意：所有网页的 body 都有一个默认的外边距，可以置为 0**

其他的一些标签也有自己默认的值，都可以初始化为 0



## 4.3、内外边距

margin： 上 右 下 左

外边距的妙用：居中元素		

- **margin:0 auto 使块级元素居中，块元素有固定的宽度 **
- **text-align ： center 使块级元素中的内容居中**

内边距 padding



**补充：盒子模型的计算标准：计算该元素到底多大**

元素最终大小：margin + border + padding + 内容宽度



## 4.4、圆角边框

4个角

border-radius : 

​	两个参数就是 左上右下 右上左下

​	四个参数就是 左上 右上 右下 左下 

​	按照顺时针来，和 margin 一样



**可以利用圆角边框绘制各种各样的图形：扇形、半圆……**



## 4.5、盒子阴影

box-shadow  		(CSS3)

参数：x轴偏移量 y轴偏移量 阴影半径 颜色



# 5、浮动

## 5.1、标准文档流



块级元素：独占一行

```
h1~h6 p div ul ol ……
```



行内元素：不独占一行

```
span a img strong ……
```



行内元素可以放在块级元素中，但是反过来就不行



## 5.2、display

```css
/*
  black 块元素
  inline 行内元素
  inline-black 同时具有两者特性，可以内联在一行
  none
*/

div {
  width: 100px;
  height: 100px;
  border: 1px dashed red;
  display: inline-block;
}

span {
  width: 100px;
  height: 100px;
  border: 1px solid red;
  display: inline-block;
}
```

1、使用 display 是一种实现行内元素排列的方式，但是很多情况下我们都使用的是 float



## 5.3、float

1、左右浮动	float

```html
.layer01 {
  border: 1px dashed red;
  display: inline-block;
  float: left;
}

.layer02 {
  border: 1px dashed red;
  display: inline-block;
  float: left;
}

.layer03 {
  border: 1px dashed red;
  display: inline-block;
  float: left;
}

.layer04 {
  border: 1px dashed red;
  font-size: 12px;
  line-height: 23px;
  display: inline-block;
  float: left;
  clear: both;
}
```

我们一般使用 float 属性来对齐块级元素，但是有时候需要清除一些浮动才能达到想要的结果。

float:left;

clear:both;



## 5.4、父级边框塌陷的问题（重要）

clear

```
clear 属性有四个值
    right 右侧不允许有浮动元素
    left  左侧不允许有浮动元素
    both  两侧不允许有浮动元素
    none  没有浮动
```



解决方法：

1、增加父级元素的高度（不建议使用）

2、标准解法：增加一个空的 div 标签，清除浮动

```css
.clear {
  clear: both;
  margin: 0;
  padding: 0;
}
```

3、overflow（新特性）

```
在父级元素中增加一个属性 overflow:hidden;
```

4、在父类添加一个伪类：after （建议使用）

- :after 选择器向选定的元素之后插入内容。

- 使用 content 属性来指定要插入的内容。

```css
#father:after {
  content: '';
  display: block;
  clear: both;
}
```



小结：

1、浮动元素后面增加空的 div

​	简单但是空的 div 是不好的，代码中应该避免使用空的 div

2、设置父元素的高度

​	简单，但是假设某些元素超过了父元素高度，就需要不断更改

3、使用 overflow

​	简单，但是某些情况使用了 hidden，会消除一部分内容，尽量少使用

4、使用伪类选择器 :after （推荐使用）

​	写法稍微复杂一些，但是没有副作用



## 5.5、对比

- display 

  方向不能控制，但是不必考虑父级边框塌陷问题

- float

  可以控制方向，但是浮动后会脱离标准文档流，要解决父级边框塌陷问题





# 6、定位（重要）

```
position 属性
参数： relative 相对定位
			absolute 绝对定位
			fixed    固定定位
			
			
使用该属性让该块级元素可以移动
然后使用
	top
	bottom
	left
	right
四个参数进行移动
```



## 6.1、相对定位

```
position: relative;     /* 相对定位 */
top: -20px;			向上移动
left: 20px;			向右移动
bottom: -20px;	向下移动
right: 20px;		向左移动
```

相对定位：position:relative;

相对于原来的位置，进行指定的偏移。**相对定位，该元素仍然在标准文档流中，原来的位置会被保留**



## 6.2、绝对定位

```
绝对定位
一般会先对其父级元素设置 position:relative;

然后对该元素设置：
position:absolute;
right
left
top
bottom
```

定位：基于 xxx 定位，上下左右

1、没有父级元素定位的，就相对浏览器定位

2、假设父级元素存在定位（一般给予父级元素相对定位的属性），我们通常会相对于父级元素进行偏移

3、在父级元素范围内移动

相对于父级元素或浏览器的位置，进行指定的偏移，**绝对定位，它不在标准文档流中，不保留原来的位置**



## 6.3、固定定位 fixed

```
div:nth-of-type(2) {
  width: 50px;
  height: 50px;
  background: yellow;
  position: fixed;
  right: 0;
  bottom: 0;
}
```

顾名思义，将某个块级元素固定到浏览器的某个位置



## 6.4、z-index

```css
.tipText {
    color: red;
    z-index: 999;
}

.tipBg {
    background-color: #000;
    opacity: 0.1;   /* 背景透明度 (CSS3) */
/*
    早期浏览器可以使用过滤器，代替 opacity 属性 0-100
    filter: alpha(opacity=50);
*/
}
```

z-index 从 0 开始到无限，类似于图层

可以使用 opacity 属性进行背景透明度处理



# 7、动画

css 动画

JavaScript 动画

canvas 动画（高级）

