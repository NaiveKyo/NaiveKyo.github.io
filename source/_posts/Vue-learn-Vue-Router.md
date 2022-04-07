---
title: Vue learn Vue-Router
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221005.jpg'
coverImg: /img/20220225221005.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-04 09:57:55
summary: "Vue-Router: Vue.js 的路由管理器"
categories: "Vue"
keywords: 
 - "Vue"
 - "Vue Router"
tags: "Vue"
---

# Vue-Router

## 1、SPA 的理解

- 单页Web应用（single page web application，SPA）。
- 整个应用只有**一个完整的页面**。
  - 点击页面中的链接**不会刷新**页面，只会做页面的**局部更新。**
- 数据都需要通过ajax请求获取, 并在前端异步展现。

## 2、vue-router

组件分类：(只是从文件夹名称上划分)

- 一般组件：`components`	
- 路由组件：`pages`

安装 vue-router

`npm install vue-router`

需要将路由放到 `@/src/router/index.js` 

应用了 vue-router 后， vc 和 vm 身上会出现 `$router 和 $route`

- 一个路由就是一个映射关系（key：value）
- key 为路径，value 可能是 function 或者 component



> 补充：后端路由和前端路由

1. 后端路由
   - 理解： value是function, 用来处理客户端提交的请求。
   - 注册路由： router.get(path, function(req, res))
   - 工作过程：当服务器接收到一个请求时, 根据请求路径找到匹配的路由, 调用路由中的函数来处理请求, 返回响应数据
2. 前端路由
   - 浏览器端路由，value是component，用于展示页面内容
   - 注册路由: `<Route path="/test" component={Test}>`
   - 工作过程：当浏览器的path变为/test时, 当前组件就会变为Test组件



## 3、前端路由

前端路由的核心，就在于——**改变视图的同时不会向后端发出请求**。

> 前端路由的诞生

前端路由的出现要从 ajax 开始，有了 Ajax 后，用户交互就不用每次都刷新页面，体验带来了极大的提升。随着技术的发展，简单的异步已经不能满足需求，所以异步的更高级体验出现了——SPA(单页应用)。 SPA 的出现大大提高了 WEB 应用的交互体验。在与用户的交互过程中，不再需要重新刷新页面，获取数据也是通过 Ajax 异步获取，页面显示变的更加流畅。 但由于 SPA 中用户的交互是通过 JS 改变 HTML 内容来实现的，页面本身的 url 并没有变化，这导致了两个问题：

- SPA 无法记住用户的操作记录，无论是刷新、前进还是后退，都无法展示用户真实的期望内容。
- SPA 中虽然由于业务的不同会有多种页面展示形式，但只有一个 url，对 SEO 不友好，不方便搜索引擎进行收录。

前端路由就是为了解决上述问题而出现的。



> 什么是前端路由

简单的说，就是在保证只有一个 HTML 页面，且与用户交互时不刷新和跳转页面的同时，为 SPA 中的每个视图展示形式匹配一个特殊的 url。在刷新、前进、后退和SEO时均通过这个特殊的 url 来实现。 为实现这一目标，我们需要做到以下二点：

- 改变 url 且不让浏览器像服务器发送请求。
- 可以监听到 url 的变化

接下来要介绍的 hash 模式和 history 模式，就是实现了上面的功能。



### 1、hash 模式

> 原理

- 早期的前端路由的实现就是基于 location.hash 来实现的，location.hash 的值就是URL中#后面的内容 其实现原理就是监听#后面的内容来发起Ajax请求来进行局部更新，而不需要刷新整个页面。

- 使用 hashchange 事件来监听 URL 的变化，以下这几种情况改变 URL 都会触发 hashchange 事件：浏览器前进后退改变 URL、a 标签改变 URL、window.location 改变URL。



```htm
//html
<ul id="menu">
  <li>
    <a href="#index">首页</a>
  </li>
  <li>
    <a href="#news">资讯</a>
  </li>
  <li>
    <a href="#user">个人中心</a>
  </li>
</ul>
<div id="app"></div>

//js
function hashChange(e){
    let app = document.getElementById('app')
    switch (location.hash) {
      case '#index':
        app.innerHTML = '<h1>这是首页内容</h1>'
        break
      case '#news':
        app.innerHTML = '<h1>这是新闻内容</h1>'
        break
      case '#user':
        app.innerHTML = '<h1>这是个人中心内容</h1>'
        break
      default:
        app.innerHTML = '<h1>404</h1>'
    }
}
window.onhashchange = hashChange
hashChange()
```

> 优点

- 兼容低版本浏览器，Angular1.x和Vue默认使用的就是hash路由

- 只有#符号之前的内容才会包含在请求中被发送到后端，也就是说就算后端没有对路由全覆盖，但是不会返回404错误

- hash值的改变，都会在浏览器的访问历史中增加一个记录，所以可以通过浏览器的回退、前进按钮控制hash的切换 会覆盖锚点定位元素的功能

> 缺点

- 不太美观，#后面传输的数据复杂的话会出现问题



### 2、history 模式

> 原理

- history 提供了 pushState 和 replaceState 两个方法来记录路由状态，这两个方法改变 URL 不会引起页面刷新

- history 提供类似 hashchange 事件的 popstate 事件，但 popstate 事件有些不同：通过浏览器前进后退改变 URL 时会触发 popstate 事件，通过 pushState/replaceState 或a标签改变 URL 不会触发 popstate 事件。好在我们可以拦截 pushState/replaceState的调用和a标签的点击事件来检测 URL 变化，所以监听 URL 变化可以实现，只是没有 hashchange 那么方便。

- pushState(state, title, url) 和 replaceState(state, title, url) 都可以接受三个相同的参数。



```html
//html
<ul id="menu">
  <li>
    <a href="/index">首页</a>
  </li>
  <li>
    <a href="/news">资讯</a>
  </li>
  <li>
    <a href="/user">个人中心</a>
  </li>
</ul>
<div id="app"></div>

//js
document.querySelector('#menu').addEventListener('click',function (e) {
  if(e.target.nodeName ==='A'){
    e.preventDefault()
    let path = e.target.getAttribute('href')  //获取超链接的href，改为pushState跳转，不刷新页面
    window.history.pushState({},'',path)  //修改浏览器中显示的url地址
    render(path)  //根据path，更改页面内容
  }
})

function render(path) {
  let app = document.getElementById('app')
  switch (path) {
    case '/index':
      app.innerHTML = '<h1>这是首页内容</h1>'
      break
    case '/news':
      app.innerHTML = '<h1>这是新闻内容</h1>'
      break
    case '/user':
      app.innerHTML = '<h1>这是个人中心内容</h1>'
      break
    default:
      app.innerHTML = '<h1>404</h1>'
  }
}
window.onpopstate = function (e) {
  render(location.pathname)
}
render('/index')
```

> 优点

- 使用简单，比较美观

- pushState()设置新的URL可以是任意与当前URL同源的URL，而hash只能改变#后面的内容，因此只能设置与当前URL同文档的URL

- pushState()设置的URL与当前URL一模一样时也会被添加到历史记录栈中，而hash#后面的内容必须被修改才会被添加到新的记录栈中

- pushState()可以通过stateObject参数添加任意类型的数据到记录中，而hash只能添加短字符串

- pushState()可额外设置title属性供后续使用




> 缺点

- 前端的URL必须和向发送请求后端URL保持一致，否则会报404错误
- 由于History API的缘故，低版本浏览器有兼容性问题



### 3、两种不同的使用场景

- 从上文可见，hash模式下url会带有#，当你希望url更优雅时，可以使用history模式。

- 当使用 history 模式时，需要注意在服务端增加一个覆盖所有情况的候选资源：如果 URL 匹配不到任何静态资源，则应该返回同一个 index.html 页面，这个页面就是你 app 依赖的页面。

- 当需要兼容低版本的浏览器时，建议使用hash模式。

- 当需要添加任意类型数据到记录时，可以使用 history 模式。



使用 history 模式可以看官网

https://router.vuejs.org/zh/guide/essentials/history-mode.html

MDN 

https://developer.mozilla.org/zh-CN/docs/Web/API/History/pushState



结合自身例子，对于一般的 **Vue + Vue-Router + Webpack + XXX** 形式的 Web 开发场景，用 `history` 模式即可，只需在后端（Apache 或 Nginx）进行简单的路由配置，同时搭配前端路由的 404 页面支持。

## 4、vue-router 使用方式



> 第一步：创建 路由器

```javascript
/* 该文件是 Vue 中的路由器文件，路由器管理所有路由 */
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './pages/Home.vue'
import About from './pages/About.vue'


Vue.use(VueRouter)

// 创建一个路由器管理所有路由
const router = new VueRouter({
  // model: '', 可以选择路由模式
  // 路由数组
  routes: [
    {
      path: '/home',
      component: Home
    },
    {
      path: '/about',
      component: About
    }
  ]
})

// 暴露路由器
export default router
```

> 第二步：main.js 中引入

```javascript
import Vue from 'vue'
import App from './App.vue'
import router from './router/index'

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
```



> 第三步：页面使用

需要的标签：

- `<router-link/>` ：对 html 原生 a 标签做了封装
  - Vue 特有属性：`active-class` 解决激活链接后的样式问题
- `<router-view/>`：展示路由的显示视图



小提示：

- CSS 样式的优先级问题
- 什么时候使用 `!important`

- https://developer.mozilla.org/zh-CN/docs/Web/CSS/Specificity



## 5、一个路径匹配多个组件

例如 `/home` 中显示两个组件 `Home 和 Home2`

使用 `components`

```javascript
// 创建一个路由器管理所有路由
const router = new VueRouter({
  // model: '', 可以选择路由模式
  // 路由数组
  routes: [
    {
      path: '/home',
      components: {
        h1: Home,
        h2: Home2
      }
    },
    {
      path: '/about',
      component: About
    }
  ]
})
```

`<router-view/>` 需要做特殊处理

```vue
<!-- 路由视图 -->
<!-- 默认占位 -->
<router-view></router-view>

<!-- 一个路径使用多个组件 -->
<router-view name="h1"></router-view>
<router-view name="h2"></router-view>
```



## 6、二级和三级路由

> 二级路由

```javascript
// 创建一个路由器管理所有路由
const router = new VueRouter({
  // model: '', 可以选择路由模式
  // 路由数组
  routes: [
    {
      path: '/home',
      component: Home,
      children: [
        {
          path: 'message',
          component: Message
        },
        {
          path: 'news',
          component: News
        }
      ]
    },
    {
      path: '/about',
      component: About
    }
  ]
})
```



> 三级路由

和二级路由的原理一样，加 `children`



## 7、路由传参

- params
- query



`TODO`：**学习 Vue 的路由传参方式**



### 1、params 传参

- 第一步：路由表中声明接收传入的参数

  ```javascript
  children: [
      {
          path: 'message',
          component: Message,
          children: [
              {
                  // 声明接收 params 参数
                  path: 'detail/:id/:title/:content',
                  component: Detail
              }
          ]
      },
      {
          path: 'news',
          component: News
      }
  ]
  },
  ```

- 第二步：跳转路由时携带参数

  ```vue
  <li v-for="msg in messageArr" :key="msg.id">
      <!-- 切换路径时，携带 params 参数 -->
      <router-link
                   :to="`/home/message/detail/${msg.id}/${msg.title}/${msg.content}`"
                   >{{ msg.title }}</router-link>
  </li>
  ```

- 第三步：接收参数

  ```vue
  <ul>
      <!-- 获取 params 参数 -->
      <li>ID: {{ $route.params.id }}</li>
      <li>TITLE:{{ $route.params.title }}</li>
      <li>CONTENT:{{ $route.params.content }}</li>
  </ul>
  ```

  

### 2、query 传参

- 第一步：路由表不需要声明接收的参数

- 第二步：路由跳转时，携带 query 参数

  ```vue
  <!-- 路由切换时，携带 query 参数 -->
  <router-link
               :to="`/home/message/detail/?id=${msg.id}&title=${msg.title}&content=${msg.content}`"
               >{{ msg.title }}</router-link>&nbsp;&nbsp;
  ```

- 第三步：接收 query 参数

  ```vue
  computed: {
      id() {
      	return this.$route.query.id
      },
      title() {
      	return this.$route.query.title
      },
      content() {
      	return this.$route.query.content
      }
  }
  ```



### 3、同时接收 params 和 query 参数



同时使用的时候，路由表中必须声明 params 的占位符，同时以 params 传递的参数一定会第一个被接收



### 4、参数相关的其他知识点

在很多情况下，我们都需要用户的请求地址携带一些参数，然后通过这个参数再进行查询。

而且很有可能在今后的`<router-link>`以及`methods`中都要使用这个参数，如何操作？

```javascript
{path: "/book/:id(\\d+)", component: book},  // 转义 \d+
{path: "/book/:id?", component: book},  // ?代表可以有也可以没有  
```

## 8、命名路由

可以使用命名路由简化路由跳转和路由传参



- 第一步：路由表中为路由起一个名字

  ```javascript
  children: [
      {
          path: 'message',
          component: Message,
          children: [
              {
                  // 声明接收 params 参数
                  // path: 'detail/:id/:title/:content',
                  // 声明接收 query 参数
                  // path: 'detail', // query 参数无需声明即可接收
  
                  // 同时使用 params 和 query
                  // 要先声明 params, 一定先接收 params
                  path: 'detail/:id',
                  name: 'xiangqing', 
                  component: Detail
              }
          ]
      },
  ```

- 第二步：跳转路由时传入对象

  ```vue
  <!-- 命名路由 -->
  <router-link 
               :to="{
                    name:'xiangqing', 
                    params: {id: msg.id}, 
                    query: {title: msg.title, content: msg.content}
                    }">
      {{ msg.title }}
  </router-link>
  ```

- 第三步：接收参数和之前一样



## 9、路由的 props 配置（常用）

为了继续简化路由传参和接收参数，可以使用 **路由的 props 属性**

共有三种写法：

- 第一步：声明 props 属性

  ```javascript
  children: [
      {
          // 声明接收 params 参数
          // path: 'detail/:id/:title/:content',
          // 声明接收 query 参数
          // path: 'detail', // query 参数无需声明即可接收
  
          // 同时使用 params 和 query
          // 要先声明 params, 一定先接收 params
          path: 'detail/:id/:title/',
          name: 'xiangqing', 
          // props: { title: '123naivekyo'},    // 通过 props 映射自定义的静态数据给当前路由
          // props: true,  // 只映射 params 参数为 props 传给路由组件
          // 函数形式, 参数为 route
          props(route) {  // 此处的 route 是 vc 或 vm 身上的 $route
  
              const { id, title } = route.params
              const { content } = route.query
              // 返回对象
              return { id, title, content }
          },
          component: Detail
      }
  ]
  ```

- 三种方式：

  - 映射自定义静态数据
  - `props:true`：注意该方式只能传递 params 中的参数，不用传递 query 参数
  - `props(route) {}`，注意最后函数方式最常用，该函数传入的参数是 `vm.$route` 属性，可以拿到很多有用的数据，而它的返回值就是 key-value 的 props

- 第二步：路由跳转，和之前一样

- 第三步：接收参数，使用组件的 props 接收路由参数，展示就比较方便了

  ```vue
  <script>
    export default {
      name:'Detail',
      props: ['id', 'title', 'content']
    }
  </script>
  ```

  

## 10、编程式路由导航

`<router-link/>` 的两个属性 ：**replace  和  push**

这也是两种路由的方式：

- **replace**：不会在 window.history 中留下痕迹
- **push** ：会留下痕迹，可以回退



> 补充

React 传参：

- params
- search（相当于 Vue 的 query）
- location.state（URL 不显示路由参数）



Vue 传参：

- params

- query

- 如果想要不显示 url 中携带的参数信息，可以使用一个 Vue 路由的插件 

  - **补充：js 库 `qs`**

    若后端使用@RequestParam 来接收前端传过来的参数的，Content-Type要设置为application/x-www-form-urlencoded，并且需要对data使用qs.stringify来进行转换；

    若后端使用@RequestBody 来接收前端传过来的参数的，Content-Type要设置为application/json;

  - 传参方式在 axios 中有 get、post、body



编程式路由导航：

```javascript
    methods: {
      pushShow(msg) {
        this.$router.push({ name: 'xiangqing', params: {
          id: msg.id,
          title: msg.title,
          content: msg.content
        }})
      },
      replaceShow(msg) {
        this.$router.replace({
          name: 'xiangqing',
          params: {
            id: msg.id,
            title: msg.title,
            content: msg.content         
          }
        })
      }
    },
```

## 11、缓存路由组件

使用 `<keep-alive>` 

https://cn.vuejs.org/v2/api/#keep-alive



## 12、导航守卫

参考官网：https://v3.router.vuejs.org/zh/guide/advanced/navigation-guards.html