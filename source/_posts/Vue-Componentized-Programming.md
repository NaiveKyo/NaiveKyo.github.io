---
title: Vue_Componentized_Programming
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/11.jpg'
coverImg: '/medias/featureimages/11.jpg'
toc: true
date: 2021-07-12 10:15:31
top: false
cover: false
summary: 了解 Vue 组件化编程
categories:
  - Vue
keywords:
  - Front-End
  - Vue
tags:
  - Front-End
  - Vue
---

# Vue 组件化编程

Vue 中的组件是分为两种的：单文件组件和非单文件组件。



- 单文件组件：一个 .vue 文件就是一个组件，而且文件后缀是 .vue
- 非单文件组件：所有组件，都定义在一个文件中，文件的后缀不是 .vue
- 开发中一定使用的是 **单文件组件**



​    组件使用流程：

​      1. 定义组件

​      2. 注册组件

​        全局注册  `Vue.component('组件名', 组件)`

​        局部注册  配置 `components` 属性，`components: {组件名:组件}`

## 1、非单文件组件

### (1) 例子

先看一个例子：

```javascript
// 定义一个名为 School 的非单文件组件
// 采用继承机制
const School = Vue.extend({
  // data 是一个函数
  data() {
    return {
      name: 'naivekyo',
      address: '123'
    }
  },
  template: `
		<div>
			<h2>学校名: {{ name }}</h2>
			<h2>学校地址: {{ address }}</h2>
			</div>
		`
})

// 定义一个名为 App 的组件，它管理 School 组件
const App = Vue.extend({
  // app 一般来说没有 data
  components: {
    School
  },
  template: `
		<div>
		<School></School>
		</div>
	`
})

// 最后注册 Vm 实例，管理 App 组件
const vm = new Vue({
  el: '#app',
  data: {},
  methods: {},
  // 局部注册组件：用的多
  components: {
    App
  }
});
```



### (2) 解释

定义一个 School 组件：

​        1. 如何定义一个组件

​           使用 Vue.extend(options) 去创建

​        2. School 的本质是一个构造函数, 以后写` <School/>`, Vue 帮我们去 `new School()`

​        3.` Vue.extend(options)`, options 是配置对象, 这个配置对象几乎和 new Vue(options) 时

​          使用的 options 一样，但是也有区别，区别如下：

​          (1) 不能写 el 指定容器

​            因为所有组件实例最终要被一个 vm 所管理, vm 中会指定好 el

​          (2) data 必须定义为函数

​            **原因:data 定义为对象,那么堆中只会存在一个实例, 复用组件时改变的就是同一个实例**

​            **定义为函数, 每次返回 new 一个新的对象实例, 多个组件实例互不影响**

​          (3) 组件的模板结构配置在 template 属性中

​            (3.1) 值为 html 字符串, 而且要用模板字符串

​            (3.2) 模板结构必须只有一个根标签

​        4. 所有组件定义后，必须注册使用，注册分为：**全局注册和局部注册**

​        5. 特别注意：

​          (1) School 确实是构造函数，但不是我们亲手写的 School。而是 Vue.extend() 生成的

​          (2) Vue.extend 的返回值是 `VueComponent` 构造函数，所以 new School 就是 `new VueComponent`

​          (3) 所谓组件实例, 都是 VueComponent 的实例, 简称 vc

​            所谓 Vue实例, 都是 Vue 创建的实例，简称 vm

​        6. 最重要的关系：

​          **VueComponent 继承了 Vue, 所以 Vue.prototype 上的属性和方法, vc 都能看得见**





### (3) 问题

非单文件组件存在一些问题：

- 模板编写没有提示
- 没有构建过程，无法将 ES6 转换成 ES5
- 不支持组件的 CSS
- 真正开发几乎不用



实际开发中，vm 只会管理一个组件 App，然后 App 管理众多子组件

组件名称可以小写，正规的写法是首字母大写，不管如何，最终反应到 vm 实例上都会是首字母大写

如果标签没有内容，可以写成自闭和的形式



## 2、单文件组件

### (1) 简介

单文件组件：一个文件就是一个组件，而且文件的后缀是 `.vue`

非单文件组件：所有组件都定义在一个文件中，文件的后缀不是 .vue



开发中一定使用的是单文件组件



单文件组件开发的模板：

- `index.html` ： 应用的主界面
- `App.vue` ：外壳组件
- 文件夹 `components` ：所有子组件放在这里，它们被 App.vue 管理



**安装插件后，快速生成模板 : vueInit**



单文件组件的组成：

- 模板对象
- JS 模块对象
- 样式



使用单文件组件需要 Vue 的脚手架：

- 项目只需要一个 vm 实例
- vm 实例管理着众多子组件



### (2) 例子

看一个例子：

index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  <!-- 准备好一个容器 -->
  <div id="root">
    <App/>
  </div>
</body>
</html>
```

App.vue

```javascript
/* 配置组件的结构 */
<template>
<!-- 只需要一个根标签 -->
  <div>
    <h2>This is App</h2>
    <School/>
  </div>
</template>

/* 配置组件的数据、交互、事件等等 */
<script>
// 引入其他子组件
import School from "./components/School.vue";

export default {
  components: {
    School
  },
};
</script>
```

School.vue

```javascript
/*
    实质：当前这个 .vue 文件，并不是一个组件，而是一个组件的所有配置
 */

/* 配置模板结构 */
<template>
  <div>
    <h2 class="title">名称: {{ name }}</h2>
    <h2 class="info" @click="showAddress">地址: {{ address }}</h2>
  </div>
</template>

/* 配置组件数据、交互、事件等等 */
<script>
// 此处只是暴露了一个组件的配置，并没有创建组件，因为没有调用 Vue.extend()
export default {
  //  data 中存放组件需要的数据
  data() {
    return {
      name: "NaiveKyo",
      address: "TestAddress",
    };
  },

  methods: {
    showAddress() {
      // 这个 this 是 VueComponent
      alert(this.address);
    },
  },
};
</script>

/* 
    配置组件样式，默认 css
    lang 可以指定编写 css 的工具：sacc、less、stylus    
*/
<style lang="css">
    .title {
        background-color: orange;
    }
    
    .info {
        background-color: pink;
    }
</style>
```



