---
title: Front-end learn H5 + CSS3
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221114.jpg'
coverImg: /img/20220225221114.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-07 15:30:44
summary: "补充: H5、CSS3 知识"
categories: "Front End"
keywords: "Front End"
tags: "Front End"
---



# 浏览器

```html
谷歌浏览器      Blink
火狐浏览器      Gecko
IE浏览器        Trident
欧鹏浏览        Blink
Safari浏览器    Webkit
```

# Web 标准

```html
Web标准是由W3C组织和齐亚标准化组织制定的一系列标准的集合
```

## Web 标准

```html
结果（struture）
表现（presentation）
行为（behavior）
```

## 基本结构

```html
<!DOCTYPE html>  不是html标签 用来说名文档类型是html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>

</body>
</html>
```

# 常用标签

## 标题标签：

```html
<h1>~<h6>    head
```

## 段落标签

```html
<p>  paragragh
会根据块区域自动换行
段落之间有空隙
```

## 换行标签

```html
<br />   break
```

## 文本格式化标签

```html
<strong>   加粗
<em>       倾斜
<del>      删除线
<ins>      下划线
```

## 自定义域标签

```html
<div>  division
```

## 特殊行标签

```html
<span> 可以跨行
```

## 图像标签

```html
<img> image
<img src="url" />
```

### 图像标签常用属性

```html
src 资源的路径
alt 图片无法显示时的替换文字
title 鼠标放到图片上时的提示文字
width 宽
height 高
border 边框
```

## 相对路径以及绝对路径

```html
相对路径
    同级直接使用
    下一级用 /
    上一级用 ../
绝对路径
    绝对位置，一般从盘符开始 可以是完整的网址
```

## 超链接标签

```html
<a>   anchor
<a href="目标地址"  target="弹出方式">
target的取值
    -self  本窗口打开  默认值
    -blank 新窗口打开
href可以为空连接：#
```

### 下载链接

```html
地址链接的是文件 .exe .zip
```

### 锚点链接

```html
在 href中用 #+名字
```

## 注释标签

```html
<!--注释内容-->
快捷键 CTRL+/
```

## 特殊字符

```html
空格 &nbsp  
大于号 &gt
小于号 &lt
与  &amp
版权 &copy
注册商标 &reg
```

## 表格标签

```html
<table>
    <tr>
        <th> </th>
        <td> </td>
        <td> </td>
    </tr>
</table>
<th>也是列 只不过是表头  内容加粗居中

<thead>
<tbody>
```

### 表格常用属性

```html
align：left/center/right
border：
cellpadding: 单元格与数据之间的距离
cellspacing: 单元格之间的距离
width：宽度
```

### 合并单元格

#### 合并列 colspan

#### 合并行 rowspan

## 列表标签

### 无序列表

```html
<ul>
    <li> </li>
    <li> </li>
    <li> </li>
<ul/>
默认前边的标识为：实心圆
list-style  是前边的标识
```

### 有序列表

```html
<ol>
    <li> </li>
    <li> </li>
    <li> </li>
<ol/>
默认前边的标识为：阿拉伯数字
list-style  是前边的标识    
```

### 自定义列表

```html
常用于对名词的解释
<dl>
    <dt></dt>
    <dd></dd>
    <dd></dd>
    <dd></dd>
    <dd></dd>
</dl>
```
+
## 表单标签

```html
表单域+表单控件+提示信息
<form action="提交的目的地址" >
    用户名：<input type="text" name="name" value="请输入用户名"> <br />
    密码：<input type="password" name="password">
    性别： 男<input type="radio" name="sex"> 女 <input type="radio" name="sex">
    爱好：看电影<input type="checkbox" name="hobby"> 足球<input type="checkbox" name="hobby">  读书<input type="checkbox" name="hobby">
    <input type="submit"  value="免费注册">
</form>

单选框和复选框可以设置checked属性来默认选择 checked="checked"
maxlength限定输入的个数

<label> 为input元素标注。可以通过点击标签的元素来选择这个input框
<label for="sex"> for指定的是input的id的值
```

### 下拉菜单：

```html
<select>
    <option selected="selected"></option>
    <option></option>
    <option></option>
    <option></option>
</select>
```

### 文本域：

```html
<textarea cols="每一行的长度" rows="行数">
</textarea>
```

# CSS 层叠样式表 Cascading Style Sheets

```html
CSS用来美化网页，布局网页
CSS也是标记语言
```

## CSS 选择器

```html
分为基础选择器和复合选择器
```

### 基础选择器

```html
标签选择器 id选择器 类选择器 通配符选择器
```

#### 标签选择器

```html
 <style>
    h1 {
        color: red;
    }
</style>
```

#### 类选择器

```html
<style>
    .class {
        color: red;
    }
</style>

多类名 即一个标签可以同时属于多个类
```

#### id 选择器

```html
<style>
    #id {
        color: red;
    }
</style>

id必须唯一
```

#### 通配符选择器

```html
<style>
    * {
        color: red;
    }
</style>

*给所有标签选中   包括html body
```

### 复合选择器

#### 后代选择器

```html
父标签 子标签
父标签可以是基础选择器
```

#### 子选择器

```html
父标签>子标签
父标签可以是基础选择器
```

#### 并集选择器

```html
标签，标签，标签
每个标签都可以是选择器
```

#### 伪类选择器

##### 链接伪类选择器

```html
按照LVHA顺序写
a:link      未被访问
a:visited   已经被访问
a:hover     鼠标悬停
a:active    鼠标按下未放开
```

##### focus 伪类选择器

```html
用于表单元素
input:focus
```

### 属性选择器
```html
权重和类选择器一样

input[value=“”] {

}

选择某个属性值以什么开头的标签
input[class^=icon] {

}

选择某个属性值以什么结尾的标签
input[class$=icon] {

}

选择某个属性值包括这个值
input[class*=icon] {

}
```


### 结构伪类选择器

```html
a:first-child {

}

 a:last-child {

}

 a:nth-child(n) {

}
n可以是数字，表达式，even（偶数）,odd（奇数）
如果就是n，则是选择了所有孩子，n从0开始
2n 偶数
2n+1 奇数
n+x 从第x个孩子开始，包括第x个
-n+x 前x个

a:nth-of-type(n) {

}

nth-child和nth-of-type 前者所有的子元素都会参与排列，后者只有指定的类型标签才会排列。  或者说前者先去排列再去看类型，后者是先按照类型排列，再选择
```


```html
a :nth-child(n) {

}
和
a:nth-child(n) {

} 
不同。第一个是a的第一个子元素  第二个是叫a的第一个子元素
```


### 伪元素选择器
```html
利用css创建新标签  属于行内元素  在文档树中看不见  权重和标签选择器一样
必须有content属性
::before
::after
```

## 字体样式

```html
font
```

### 字体类型

```html
font-family
可以写多个字体 每个字体之间用英文逗号隔开
由多个单词祖成的字体用引号包裹
```

### 字体大小

```html
font-size: 20px;
谷歌浏览器默认的16px

标题标签需要单独写样式
```

### 字体粗细

```html
font-weight: normal/bold/bolder/lighter/数字     100/400/700
400=normal
```

### 文字样式

```html
font-style: normal/italic     倾斜
```

### 字体样式复合写法

```html
font: font-style font-weight font-size/line-height font-family
顺序不可以改变  可以省略 但必须有大小和类型
```

### 文本对齐

```html
text-align: center/left/right
```

### 文本装饰

```html
text-decoration: line-through/underline/overline
一般用来取消超链接的下划线
```

### 文本缩进

```html
文本的第一行缩进
text-indent: 2em
em为相对大小
```

### 行间距

```html
line-height
分为上间距以及下间距  行间距=文本高度+上间距+下间距
```

## 元素显示模式

```html
块级元素  行内元素
```

### 块级元素

```html
常见的<h> <p> <div> <ul>
1.自己独占一行
2.高度，宽度，内边距，外边距都是可以改变
3.默认宽度等于父元素
4.是一个容器，可以放任何元素
！文字标签不允许放置块元素
```

### 行内元素
```html
<span> <u> <a>...
1.一行可以存在多个行内元素
2.宽度高度直接设置没有用
3.默认宽度就是内容的宽度
4.行内元素只可以包含文字以及行内元素
！链接不可以包含链接
！！！<a>可以包含块级元素
```

### 行内块元素
```html
<img />  <input />  <td>
1.一行可以有多个行内块元素   中间有缝隙
2.宽度高度以及内外边距可以设置
3.默认宽度为内容的宽度
```

### 显示模式的转换

```html
比如用照片当作超链接
转换为块级元素：display:block
转化为行内元素：display:inline
转换为行内块元：display:inline-block
```

## 文字垂直居中

```html
让文字行高等于父元素的高度
```

## CSS 背景

### 背景颜色

```html
background-color: transparent/color
默认值为透明
```

### 背景图片

```html
更容易控制位置
background-image: none/url
background-image: url(...)
```

### 背景平铺

```html
background-repeat: repeat/no-repeat/repeat-x/repeat-y
默认值为平铺
```

### 背景图片位置

```html
background-position: x y;
参数都是方位名词：
    1.x和y的顺序为所谓
    2.一个是方位名词，另一个默认居中

参数都是精确单位：
    1.第一个一定是x，第二个一定是y
    2.只写x 垂直居中
```

### 背景图像固定（背景附着）

```html
background-attachment:scroll/fixed
```

### 背景颜色半透明

## CSS 三大特性

```html
层叠性 继承性 优先级

优先级：* < 标签 < 类和伪类 <id < 行内式 < ！important
在一个属性后边加上!important
```

### 行高的继承

```html
body {
    font: 12px/1.5 'Microsoft YaHei'
}
这样写每个行高都是字体的1.5倍
```

## CSS 盒子模型

```html
margin+border+padding+content
```


### CSS盒子


```html
box-sizing:content-box  margin+border+padding+content
box-sizing:border-box   width就是盒子的宽度
```

### 边框

```html
border: border-width/border-style/border-color
border-style:solid（实线）/none /dashed（虚线）/dotted（点线）

可以一起指定不分顺序

表格的边框
合并相邻的边框:border-collapse: collapse
```

### 内边距

```html
padding: 5px; 所有边距都是5
padding: 5px 10px; 上下5  左右10
padding: 5px 10px 5px; 上5 左右10 下5
padding: 5px 10pz 5px 10px; 上 右 下 左
```

### 外边距

```html
与padding一致
使块级元素水平居中
满足两个要求：1.指定宽度2.左右外边距设置为auto
```


```html
行内元素以及行内块元素设置水平居中：
给父元素设置text-align:center
```


```html
外边距合并

外边距塌陷：盒子嵌套
因为父子元素都设置了外边距
解决方法：
    1.为父元素设置边框
    2.为父元素设置内边距
    3.为父元素添加：overflow:hidden
```

### 清除内外边距

```html
很多标签都带有内外边距
行内元素一般只设置左右内外边距
* {
    margin:0;
    padding:0;
}
```

## 圆角边框

```html
border-radius: 像素/百分比
从左上开始顺时针设置
```

## 盒子阴影

```html
box-shadow: h-shadow  v-shadow blur spread color inset
blur 虚实
spread 大小
```

## 文字阴影

```html
text-shadow h-shadow  v-shadow blur color
```

# 浮动

```html
可以改变原本的排列方式
最常见的是让多个块级元素一行显示
纵向排列标准流 横向排列用浮动
```

## 浮动特性

```html
1.浮动元素会脱离标准流
2.浮动的元素一行显示
3.浮动的元素具有行内块的特性

脱离标准流移动到指定位置
浮动的盒子不再保留原来位置
浮动可以添加任何的元素  之后都具有行内块的特性 不指定宽度的时候会根据内容
```

# 清除浮动

```html
为什么清除浮动？
因为子盒子很多的情况无法给定父盒子高度，而子盒子都浮动，父盒子会为0

clear: left/right/both

1.额外标签法
    添加一个空标签设置 clear:both;
    可以是</ br> 和 块级元素
2.父级添加overflow
    overflow=hidden;
    无法显示溢出的部分
3.父级添加after伪元素
    .clear:after {
        content: "";
        display: block;
        height: 0;
        clear: both;
        visibility: hidden;
    }
    .clear:after {
        *zoom = 1;   IE6/7专用
    }
4.父级元素添加双伪元素
    .clear:before,.clear:after {
        content: "";
        display: table;
    }
    .clear:after {
        clear: both;
    }
    .clear {
        *zoom = 1;   IE6/7专用
    }
```

# CSS 书写顺序

```html
1.定位信息  display 浮动  定位
2.自身信息  盒子的宽高等等
3.文本信息  大小 颜色
4.其他属性   圆角矩形等等
```

# 定位

```html
定位=定位模式+边偏移
position：static 静态定位
          relative 相对定位
          absolute 绝对定位
          fixed    固定定位
          sticky   粘性定位
```

## 静态定位

```html
static 静态定位
属于标准流 无边偏移
```

## 相对定位

```html
relative
相对于自己原来的位置定位
不脱标  保留原来位置
```

## 绝对定位

```html
absolute
1.如果没有父元素或者父元素没有定位，以浏览器文档为参照移动
2.父元素有定位，则以父元素为标准移动
3.脱标 不保留原先位置
```

## 子绝父相

```html
子元素使用绝对定位，父元素使用相对定位
```

## 固定定位

```html
fixed
1.以浏览器的可视窗口为参照移动
2.脱标
```

## 粘性定位

```html
sticky
1.相对可视窗口
2.不脱标
3.必须添加至少一个边偏移
```

## 定位层叠次序

```html
z-index
数值越大越靠上
如果z-index相同。则后来居上
```

## 注意

```html
行内元素添加绝对定位或者固定定位之后可以设置高度和宽度
浮动不会盖住文字，而定位会
当左右同时存在则会执行左
上下同时存在则会执行上
```

# 显示与隐藏

```html
display  none:隐藏  block:显示
none:隐藏 脱标 不保留原来位置
block:显示

visibility 可见性
inherit 继承
visible 可见
hidden  隐藏  保留原来位置 不脱标

overflow 溢出显示
visible  默认 显示溢出并且不加滚动条
auto     需要的时候添加滚动条
hidden   隐藏溢出的内容
scroll   总是添加滚动条显示  没有溢出也会显示滚动条
```

# 精灵图

```html
减少请求次数，
将小图片放在一个大图片上
坐标轴移动 左上为负值
```

# 字体图标

```html
font-face 引用
font-family 设置字体类型
```

# 用户界面

## 鼠标样式

```html
cursor :
    default 默认箭头
    pointer 小手
    move 移动
    text 文本
    no-allowed 禁止
```

## 轮廓线

```html
表单默认有蓝色边框
取消表单
outline:0/none
```

## 防止拖拽文本域

```html
resize:none
```

## 图片文字垂直居中

```html
不适应于块级元素
vertical-align: baseline|top|middle|bottom
```

## 图片底部空白空隙

```html
1.  vertical-align: top|middle|bottom
2.  将图片设置为块级元素
```

## 单行文字溢出显示省略号

```html
1.强制一行内显示            white-space:nowrap
2.超出部分隐藏              overflow:hidden
3.文字用省略号代替溢出部分   text-overflow:ellipsis
```

## 多行文字溢出显示省略号

```html
适用于webkit浏览器以及移动端
超出部分隐藏              overflow:hidden
文字用省略号代替溢出部分   text-overflow:ellipsis
弹性伸缩盒子显示           display:-webkit-box
限制在一个块级盒子里面显示的行数    -webkit-line-clamp: 2
设置伸缩盒子的子元素的排列方式      -webkit-box-orient: vertical
```

# margin 负值的应用

```html
1.边框重叠
2.hover属性 加定位
```

# 文字围绕浮动元素

```html
默认围绕
```

# 行内块的巧妙运用

```html
页面底部的选择第几页的设置
```

# CSS 初始化

```html
记住！！
```

# 新特性

```html
<header>  头部
<nav>     导航
<article>   文档
<section>   定义文档某个区域
<aside>     侧边栏
<footer>    尾部
<audio>     音频
<video>     视频
```

## `<video>` 视频

```html
autoplay:autoplay  自动播放
controls:controls  允许用户控制
muted:muted  谷歌的自动播放要有这个属性
loop: loop  循环播放
poster：imgurl 视频加载时的等待画面
muted:muted 静音播放
```

## `<audio>` 音频

```html
autoplay:autoplay  自动播放
controls=controls  允许用户控制
muted:muted  谷歌的自动播放要有这个属性
loop: loop  循环播放
poster：imgurl 视频加载时的等待画面
muted:muted 静音播放    autoplay:autoplay  自动播放
controls=controls  允许用户控制
muted:muted  谷歌的自动播放要有这个属性
loop: loop  循环播放
poster：imgurl 视频加载时的等待画面
muted:muted 静音播放
```

## 新增的表单类型

```html
email
url
date
time
week
number
tel
search
color
month
```

## 表单新增属性

```html
required:required 不能为空
placeholder ： 提示信息
autofocus： 自动聚焦
autocomplete  纪录
multiple：多文件提交

修改提示信息的字体颜色
input::placeholder {
    color: black;
}
```


# CSS新特性

## 模糊处理
```html
img {
    filter: blur(5px) 数值越大越模糊
}
```

## 计算盒子大小
```html
calc（）函数  可以用加减乘除  
比如说孩子永远比父亲小30像素
width: calc(100% - 30px);
```

## 过渡
```html
transition：属性  花费时间  运动曲线 何时开始
！！  花费时间一定加单位 s 
```

## transform转换 2D转换
```html
这几个可以同时出现，但是位移必须在最前面！
```
###     translate 移动
```html
transform: translate(x,y)
对其他元素没有影响
对行内元素没效果
参数写% 是移动自身的宽度高度的百分比
```

###    rotate    旋转
```html
    rotate(45deg) 正数顺时针旋转  负数逆时针旋转  默认以元素中心旋转
    设置旋转中心点：transform-origin   默认的是 50% 50% 也就是 center center
```

###   scale     缩放
```html
    scale(x,y) 参数为数字  只写一个参数时等比例缩放
```

## 3D转换
```html
先写移动 后写旋转
```
### 3D移动 translate 3d
```html
transform:translate3d(x.y.z);
transform:translateX(x),translateY(y),translateZ(z);
单位一般为像素；
```

### 3D旋转 rotate
```html
单位是deg 度
transform:rotateX(deg), rotateY(deg), rotateZ(deg)
transform:rotate3d(x,y,z,deg)
```

### transform-style 
```html
1.控制子元素是否开启3d空间
transform-style:flat /不开启  preserve-3d /开启
写在父元素上
保留子元素的3d效果
```

### perspective
```html
单位是像素
透视的属性写在别透视的父元素上面
```
# 网站图标
```html
facicon.ico
png转化网站:比特虫
```

# 网站TDK三大标签SEO优化
```html
SEO: search enhine optimization 搜索引擎优化

三大标签：
    title
    description
    keyword
```


##    logo seo 优化
```html
1.logo里面放一个h1
2.h1里面放一个链接 将图片返回首页
3.链接里面放网站名字，但不显示出来
    text-indent:-9999px  overflow:hidden
    font-size=0
4.最后给链接一个title
```


# 浏览器私有前缀
```html
伪类兼容老版本的浏览器
-moz- 火狐
-ms-   IE浏览器
-webkit- 苹果 谷歌
-o-     欧鹏
```

# 动画
```html
1.先定义动画
2.在使用动画
@Keyframes
0%~100%
@Keyframes move{
    0% {
        transform: translate(0px);
    }
    100% {
        transform: translate(1000px);
       
    }
}

div {
    animation-name:move;
    animation-duration: 2s;  /持续时间
}

动画的属性
    animation-name: 动画名词
    animation-duration: 动画持续时长
    animation-timing-function: 动画曲线  和过度差不多
    animation-delay:  规定动画何时开始
    animation-iteration-count:  规定动画播放次数  infinite/无限
    animation-direction: 下一圈是否逆时针播放  alternate/反向
    animation-play-state: 规定动画是否运行  可以设置鼠标放上去停止
    animation-fill-mode: 结束是否返回起始状态  forwards/否  backwards/是 
可以简写：
```