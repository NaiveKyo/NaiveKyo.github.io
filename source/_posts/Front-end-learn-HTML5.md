---
title: Front-end learn HTML5
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225220918.jpg'
coverImg: /img/20220225220918.jpg
cover: false
toc: true
mathjax: false
date: 2022-03-28 21:06:54
summary: "学习 HTML"
categories: "Front End"
keywords: ["Front End", "HTML"]
tags: "Front End"
---

# 一、概念

HTML

​	Hyper Text Markup Language（超文本标记语言）



W3C

- World Wide Web Consortium （万维网联盟）



W3C 标准包括（重要）：

- **结构化标准语言**（HTML、XML）
- **表现标准语言**（CSS）
- **行为标准**（DOM、ECMAScript）



# 二、网页基本信息

- DOCTYPE 声明
  - 网页规范
- \<title> 标签
  - 网页标题
- \<meta> 标签
  - 网页的相关信息，例如 关键字、描述、字符集等等



# 三、网页基本标签

- 标题标签
- 段落标签
- 换行标签
- 水平线标签
- 字体样式标签
- 注释和特殊符号
  - 空格： &amp;nbsp;
  - 版权：&copy;    &amp;copy;



# 四、图像标签

常见的图像格式：

- JPG
- GIF
- PNG
- BMP
- ……



# 五、链接标签

- 文本超链接
  - target 属性：_blank 和 _self 常用
  - **锚链接**：通过使用 a 标签的 name 属性，然后在另一个超链接处使用 # 选择跳跃到指定的 name 处
- 图像超链接
- 功能性链接
  - **邮件链接**：例如<a href="mailto:2086589645@qq.com">点击联系我</a>
  - QQ 推广，网上搜索 QQ 推广



# 六、行内元素和块元素

- 块元素
  - 无论内容多少，该元素独占一行
  - （p、h1-h6……）
- 行内元素
  - 内容撑开宽度，左右都是行内元素的可以排在一行
  - （a、strong、em……）



# 七、列表

- 有序列表：ol
- 无序列表：ul
- 自定义列表：dl、dt、dd



# 八、表格

- 为什么使用表格
  - 简单通用
  - 结构稳定
- 基本结构
  - 单元格
  - 行
  - 列
  - 跨行
  - 跨列



# 九、视频和音频

- 视频元素
  - video
- 音频元素
  - audio
- 两个重要属性：controls 和 autoplay



# 十、页面结构分析

| 元素名  |                        描述                        |
| :-----: | :------------------------------------------------: |
| header  |  标题头部取余的内容（用于页面或页面中的一块区域）  |
| footer  | 标记脚部区域的内容（用于整个页面或页面的一块区域） |
| section |              Web 页面中的一块独立区域              |
| article |                   独立的文章内容                   |
|  aside  |           相关内容或应用（常用于侧边栏）           |
|   nav   |                   导航类辅助内容                   |



# 十一、iframe 内联框架

```html
<iframe src="path" name="mianFrame"></iframe>
```



# 十二、表单语法

- input 标签
  - text
  - password
  - submit
  - reset
- get 和 post
  - get 只能传输小文件且不安全
  - post 可以传输大文件而且安全
- select 标签
  - option 子选项
  - selected 默认选中
- 文本域：textarea
- 文件域：file（**重点**）
- 邮件验证：input 的 type = email
- URL：input 的 type = url
- 数字验证：type = number 可以确定开始、结束、步长
- 滑块：type = range 可以设置最小、最大、步长
- 搜索框：type = search



|   属性    |                             说明                             |
| :-------: | :----------------------------------------------------------: |
|   type    | 指定元素的类型。text、password、checkbox、radio、submit、reset、file、hidden、image 和 button，默认为 text |
|   name    |                      指定表单元素的名称                      |
|   value   |                         元素的初始值                         |
|   size    | 指定表单元素的初始宽度。当type为 text 或 password 时，表单元素的大小以字符为单位。对于其他类型，宽度以像素为单位 |
| maxlength |        type 为 text 或 password 时，输入的最大字符数         |
|  checked  |       type 为 radio 或 checkbox 时，指定按钮是否被选中       |

# 十三、表单的应用

- 隐藏域	hidden
- 只读        readonly
- 禁用        disable

# 十四、表单初级验证



常用方式：

- placeholder：占位符，提示信息
- required：非空判断
- pattern：正则表达式判断



