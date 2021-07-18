---
title: Vue_Staging_Study
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/10.jpg'
coverImg: /medias/featureimages/10.jpg
toc: true
date: 2021-07-12 10:56:45
top: false
cover: false
summary: 了解 Vue 脚手架相关的知识
categories:
  - Vue
keywords:
  - Front-End
  - Vue
  - Vue-cli
tags:
  - Vue
  - Vue-cli
---



# Vue-cli

## 1、使用脚手架

说明：

- vue-cli 是 vue 官方提供的脚手架工具 command line interface	
- 最新的版本是 4
- 3.x 版本与 4.x 版本变化不大，但 3.x 相对于 2.x 的版本变化特别大
- 官网：https://cli.vuejs.org/zh/guide/



- 全局安装：`npm install -g @vue/cli`
- 创建项目：`vue create vue-demo`
- 暂时选择 vue2
- 进入目录
- `npm run serve` 开启本地服务器



## 2、脚手架文件说明

脚手架的版本和 Vue 的版本没有什么关系

下面介绍各个版本的目录架构：

```bash
Project Name(vue-cli 2.x)
	|-- build : webpack相关的配置文件夹(基本不需要修改)
	|-- config: webpack相关的配置文件夹(基本不需要修改)
		|-- index.js: 指定的后台服务的端口号和静态资源文件夹
	|-- node_modules
	|-- src : 源码文件夹
		|-- main.js: 应用入口js
	|-- static: 静态资源文件夹
	|-- .babelrc: babel的配置文件
	|-- .editorconfig: 通过编辑器的编码/格式进行一定的配置
	|-- .eslintignore: eslint检查忽略的配置
	|-- .eslintrc.js: eslint检查的配置
	|-- .gitignore: git版本管制忽略的配置
	|-- index.html: 主页面文件
	|-- package.json: 应用包配置文件 
	|-- README.md: 应用描述说明的readme文件
```



推荐使用最新版脚手架开发（最新 4.x）3.x 和 4.x 的结构类似

```bash
Project Name(vue-cli 3.x)
	|-- node_modules
	|-- public
       |-- index.html: 主页面文件
	|-- src
	   |-- main.js: 应用入口js
	|-- babel.config.js: babel的配置文件
	|-- vue.config.js: vue的配置文件，需要手动添加
	|-- .gitignore: git 版本管制忽略的配置
	|-- package.json: 应用包配置文件 
	|-- README.md: 应用描述说明的readme文件
```



使用脚手架工具后，它会自动帮我们做了 git 相关的处理：

- `git init`
- `git add`
- `git commit -m ''`

但是没有和远程仓库关联。



## 3、**render: h => h(App)** 详解

脚手架中引入的 `Vue` 比传统的开发环境下的 Vue 少了模板解析的功能，而是选择了 `webpack` 中的 `webpack-loader` 去解析模板



- `vue-template-compiler` 解析 `<template>` 标签，以及 vm 中的 `template` 属性
  - 默认只能解析 .vue 中的模板
  - 解决方法，使用 `render 属性 + h()`
  - `h()` 函数做了三件事
    - `components: { App }`
    - `template: '<App/>'`
    - **调用 loader**
  - `h()` 只写一次



## 4、ref 和 props

state：就是 Vue 的 data 中的属性

ref：

- 可以给 DOM 打标签，实现一些特殊操作
  - 使用 `this.$refs.标签` 得到的是一个真实的 DOM 节点
- 在实际开发中，可以给 组件 打标签
  - 使用 `this.$refs.标签`，拿到的是**组件实例对象**

​		

### (1) props

props：

- 用于父子组件之间的数据传递

```javascript
<template>

  <div>
    <h2 class="name">School Name: {{ name }}</h2>
    <h2 class="address">School Address: {{ address }}</h2>
    <h2>我收到的值: {{ username }}</h2>
  </div>


</template>

<script>
  export default {
    // 配置数据
    data() {
      return {
        name: 'NaiveKyo',
        address: 'Hello School'
      }
    },

    // 声明 props 最完整的写法：限制了类型、控制了必要性、指定了默认值
    // props: {
    //   username: {
    //     type: String,    // 类型
    //     required: true,   // 是否必须
    //     default: '老王 xxx' // 默认值
    //   }
    // },

    // 声明 props 次完整的写法：限制了类型
    // props: {
    //   username: String
    // },

    // 声明 props 精简写法：啥也不限制
    props: ['username']
  }
</script>

<style scoped>
  .name {
    background-color: grey;
  }

  .address {
    background-color: green;
  }
</style>
```



### (2) ref

ref 例子：

```javascript
<template>
  <div>

    <!--
      ref 的使用方式：
        1.标签中直接编写 ref="xxx"
        2.通过 this.$refs.xxx 获取
        3.备注
          1.若给 html 内置标签打 ref，则获取到的是真实 DOM 节点
          2.若给组件标签打 ref，则获取到的是组件实例对象
     -->

    <button @click="showData">点我提示数据</button>

    <!-- 使用 ref 给 DOM 打标签, 可以通过 this.$refs.keyWord 获取到真实 DOM -->
    <input type="text" ref="keyWord">

    <!-- refs 可以做到一些特殊的效果，比如说，点击按钮获得 input 输入框的焦点 -->
    <button @click="getFocus">点我获得焦点</button>

    <!-- 在项目开发中给 组件 打上标签, 可以通过 this.$refs.xuexiao 获取组件实例 -->
    <School ref="xuexiao" v-bind:username="username"/>

    <button @click="getVC">点我获取组件实例对象</button>

  </div>
</template>

<script>
  // 引入 School 组件
  import School from './components/School'

  export default {
    data() {
      return {
        username: '老刘'
      }
    },

    // 局部注册
    components: { School },

    methods: {
      showData() {
        console.log(this)
        alert(this.$refs.keyWord.value)
      },

      getFocus() {
        this.$refs.keyWord.focus()
      },

      getVC() {
        console.log(this.$refs.xuexiao);
      }
    },
  }
</script>

<style scoped>

</style>
```

