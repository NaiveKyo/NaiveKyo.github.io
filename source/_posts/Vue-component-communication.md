---
title: Vue component communication
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210715104529.jpg'
coverImg: /img/20210715104529.jpg
toc: true
date: 2021-07-15 10:39:39
top: false
cover: true
summary: 了解 Vue 组件通信的几种方式
categories: Vue
keywords: [Vue, Component]
tags: Vue
---



# Vue 组件通信



### Vscode 小知识

补充：vs 单击文件是预览模式，点开一个文件在点开其他文件会覆盖当前文件浏览窗口，可以双击文件进入编辑模式就可以解决问题



## 一、常规父子组件通信

### 1、Props

> props 实现父向子传递消息

常用的方式：

- 使用 `props` 在父子组件之间传递消息
- `props` 可以绑定函数或者数据

- 子组件需要接收消息，然后使用





### 2、自定义事件

> 自定义事件实现子向父传递消息



自定义事件

- 适用于子组件给父组件传递数据
- 父组件中给组件绑定自定义事件（实际上子组件回调的时候是在 vc 的原型上找到这个事件方法的）
- 子组件使用 `this.$emit(对应的方法, 参数)`



自定义事件两种方式：

- 使用 `this.$emit` （推荐）

  ```javascript
  <Header @add-todo="addTodo"/>
  // 注意自定义事件的命名方式
    
  // 子组件中使用，需要定义一个新的方法接收这个自定义事件，点击这个新方法就会执行父组件的回调，从而实现子组件向父组件传递消息
    methods: {
        add() {
          if (!this.name.trim()) return alert('输入不能为空')
          // 根据用户的输入生成一个 todo 对象
          const todoObj = {
            id: Date.now(),
            name: this.name,
            done: false
          }
          // 使用自定义事件通知 App 在 data 中添加一个 todo
          this.$emit('add-todo', todoObj)
          // 清空输入
          this.name = ''
        }
      },
      // props: [ 'addTodo' ]
    }
  ```

  

- 父组件使用 `ref` 标记子组件，然后在 `mounted` 中使用 `this.$refs.demo.$on('test', this.test)` 为子组件绑定自定义事件，子组件调用的方法和第一种方式一样

- 自定义事件的命名，使用 **kebab-case** 模式 例如：`get-data`



## 二、任意组件通信

### 全局事件总线

全局事件总线可以实现任意组件之间的通信

它的原理就是当一个事物可以被所有组件都看到，并且我们可以为它绑定自定义事件，那么借助这个工具就可以实现任意组件相互通信。



> Q：什么东西可以被所有组件看到呢？

A：Vue 的原型：Vue.prototype 可以被所有组件看到

所以：**将自定义事件绑定到 Vue 的原型上**



`main.js` 中注册：



- 安装全局事件总线：

  ```javascript
  import Vue from 'vue'
  import App from './App.vue'
  
  Vue.config.productionTip = false
  
  // 定义全局事件总线
  new Vue({
    beforeCreate() {
      // 注意这一步比较巧妙
      Vue.prototype.$bus = this   // 安装事件总线
    },
    el: '#app',
    render: h => h(App)
  })
  ```

- 在 Demo1 中给 $bus 绑定自定义事件

  ```javascript
  methods: {
    test1(x) {
   		 console.log('Demo1 收到了数据', x)
   		 this.name = x
    },
  },
  
  mounted() {
      // 给 $bus 绑定一个自定义事件
      this.$bus.$on('test1', this.test1)
  		// 这里要注意自定义函数时，this 的指向问题，test1 如果使用 function 定义，则 this 指向 $bus
  },
  
  beforeDestroy() {
      // 关闭自定义事件
  		this.$bus.$off('test1')
  },
  ```

- 在 Demo2 中调用 $bus 上绑定的事件，实现与 Demo1 通信

  ```javascript
  methods: {
  	sendData() {
  		this.$bus.$emit('test1', 'NaiveKyo')
  	}
  }
  ```



## 三、插槽

此方式用于父组件向子组件传递带数据的标签，当一个组件有不确定的结构时，就需要使用 `slot` 技术了，注意：插槽内容是在父组件中编译后，再传递给子组件的。



## 1、分类

- 默认插槽
- 命令插槽
- **作用域插槽**
  - **父级模板里的所有内容都是在父级作用域中编译的；子模板里的所有内容都是在子作用域中编译的。**

