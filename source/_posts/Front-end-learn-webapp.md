---
title: Front-end learn webapp
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221126.jpg'
coverImg: /img/20220225221126.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-07 15:34:07
summary: "学习移动端相关知识"
categories: "Front End"
keywords: "Front End"
tags: "Front End"
---

# 视口

## 布局视口 layout viewport

```html
早期的pc端的网页在手机显示 分辨率为980px 但是元素显示比较小，需要手动缩放
```

## 视觉视口 visual viewport

## 理想视口 ideal viewport

```html
手动添加meta视口标签
使得布局视口和手机尺寸一样
乔布斯提出
```

## meta 标签

```html
<meta name="viewport" content="width=device-width,user-scalable=no,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0">
width=device-width 视口大小等于设备
user-scalable=no   用户是否可以缩放
```

## 二倍图

### 物理像素

```html
物理像素点就是屏幕的分辨率
在pc端，一个px就是一个像素点
但是在手机端一个px包含n个物理像素点  叫做物理像素比
```

### 图片模糊问题

```html
使用的图片比实际用的大，然后手动缩放
```

### 背景图片缩放

```html
background-size
可以是像素 也可以是百分比 ，百分比是父元素的百分之多少
cover 覆盖整个区域，会显示不全
contain 拉伸到宽度或者高度达到最大值
```

# 移动端开发解决方案

```html
独立开发移动端的界面
响应式页面兼容移动端
```

## 移动端清除超链接高亮

```html
-webkit-tap-highlight-color = transparent
```

## 在 ios 给按钮和输入框添加样式的前提

```html
-webkit-appearance-none
```

## 禁用长按页面时的弹出菜单

```html
img,a {-webkit-touch-callout  none}
```

# 移动端布局

## 单独制作

```html
1.流式布局
2.flex弹性布局  **！
3.less rem 媒体查询布局
4.混合布局
```

## 响应式页面

```html
媒体查询  bootstrap
```

# 流式布局

```html
根据屏幕百分比
```

# flex 布局 flexible box

```html
任何一个容器都可以设置flex
为父盒子设置flex之后，子元素的float clear vertical-align 属性都将失效
采用flex布局的元素，成为flex容器，简称“容器”，他的所有子元素自动为容器成员，成为flex项目
当主轴上放不下的时候，会更改项目的宽度，这时候要设置换行
主轴:行 x   侧轴：列  y   元素跟着主轴排列
```

## 父元素的属性

```html
flex-direction: 设置主轴的方向  或者说来设置什么是主轴
justify-content: 设置子元素的排列方式
flex-wrap: 设置子元素是否换行
align-content: 设置侧轴上的子元素的排列方式  多行
align-items: 设置侧轴上的子元素的排列方式  单行
flex-flow: 复合属性 flex-wrap flex-direction:
```

### flex-direction:

```html
row 默认的值，从左到右
row-reverse  从右到左
column: 从上到下
column-reverse 从下到上
```

### justify-content

```html
flex-start: 默认值 从头排列
flex-end： 从后往前
center： 居中对齐
space-around: 平分剩余空间
space-between: 先两边贴边，再平分剩余空间
```

### flex-wrap

```html
nowrap：默认  不换行
wrap： 换行
```

### align-items

```html
flex-start: 默认值 从头排列
flex-end： 从后往前
center： 居中对齐
stretch  拉伸           拉伸的时候不要给子元素侧轴的宽度或者高度
```

### align-content

```html
flex-start: 默认值 从头排列
flex-end： 从后往前
center： 居中对齐
stretch  拉伸
space-around: 平分剩余空间
space-between: 先两边贴边，再平分剩余空间
```

### flex-flow

```html
flex-flow：row  wrap;
```

## 子元素的属性

```html
flex：表示所占的份数
align-self: 子元素的侧轴排列方式
order： 排列顺序，默认0 越小越靠前
```

# rem 适配布局

```html
文字随着屏幕变化，宽高等比例缩放
```

## rem 单位 （root em）

```html
em是父元素的字体大小
rem是html元素的字体大小
```

## 媒体查询 Media Query

```html
@media mediatype and|not|only (media feature) {
    css-code
}
```

### mediatype

```html
all     全部
print  打印或者打印预览
scree   有显示屏的
```

### 关键字

```html
and 链接多个媒体类型
not 排除某个媒体类型
only    指定特定的媒体类型
```

### media feature 媒体特性

```html
width   可见区域的宽度
min-width   可见区域的最小宽度
max-width   可见区域的最大宽度.
```

# Less Leaner Style Sheets

```html
css扩展语言 css预处理器，常见的有Sass、Less、Stylus
```

## less 变量

```html
@变量名：值;  //大小写敏感 ，必须@前缀  不能包含特殊字符  不能以数字开头
```

## less 编译 easy less 插件

```html
直接保存就会生成对应的css文件
```

## less 嵌套

```html
body {
background-color: #000;
a {
    color: @pink;
}
```

}


```html
伪类选择器：
  body {
background-color: #000;
    a {
        color: @pink;
        &:hover {
            color: blue;
        }
    }
```

}


## less运算
```html
数字、颜色、变量都可以加减乘除
运算符的左右各有一个空格隔开
如果运算符两侧有两个不同的单位，以第一个为准
```


# 响应式布局
```html
利用媒体查询针对不同的设备进行布局和样式的更改
超小屏幕：手机      <768px                  100%
小屏幕：平板        ≥768 <992 px            750px
中等屏幕：电脑      ≥992 <1200 px           970px
超大屏幕；          ≥1200 px                1170px

需要一个父元素作为容器元素.
```




# 移动端动画

## 触屏事件
```html
touch对象   即触摸点
touchstart          触摸到一个元素触发
touchmove           手指拖动或者滑动    
touchend            手指从一个元素离开
```


