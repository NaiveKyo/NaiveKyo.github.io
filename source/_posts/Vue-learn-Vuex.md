---
title: Vue learn Vuex
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221016.jpg'
coverImg: /img/20220225221016.jpg
password: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
cover: false
toc: true
mathjax: false
date: 2022-04-05 10:10:12
summary: "Vuex: Vue.js 应用程序的状态管理模式"
categories: "Vue"
keywords: 
 - "Vue"
 - "Vuex"
tags: "Vue"
---



# Vuex

## 1、简介

**集中式状态管理**

 专门在Vue中实现集中式状态管理的一个插件，对 vue 应用中多个组件的共享状态进行集中式的管理(读/写)，也可以认为是一种组件间通信的方式，且适用于任意组件间通信。



什么时候使用：

- 多个组件依赖于同一状态
- 来自不同组件的行为需要变更同一状态
- 多个组件要共享状态

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220407101505.png)

- Actions 是一个对象
  - 里面存放键值对：{ 名称：函数 }
- State ：初始化状态
  - 是一个对象
- Mutations 是一个对象
  - 存放键值对

## 2、创建 store.js

> 创建 store

**Vuex 创造出一个 store 在管理上面三个对象**

两种方式创建 store：

1. 项目根路径下新建 `/src/vuex/store.js`
2. 或者这样 `/src/store/index.js`

```javascript
import Vue from 'vue'
import Vuex from 'vuex'

// 注册插件
Vue.use(Vuex)

// 初始化状态, 该 state 管理多个组件的状态
const state = {
  sum: 0
}

// 创建一个 actions, 包含多个响应组件 "动作" 的函数
const actions = {
  // 第一个参数是 mini$store, 参数名一般使用 context, 它是一个迷你版的 $store
  // 我们需要使用 context.commit() 去通知 Mutations 加工状态
  // 异步任务可以在 action 中开启
  add(context, value) {
    // context.commit('ADD', value)

    setTimeout(() => {
      context.commit('ADD', value)
    }, 500);
  }
}

// 创建一个 mutations, 包含多个真正用于加工状态的函数(函数名一般都是大写)
const mutations = {
  // 在 mutations 中可以加工 state
  ADD(state, value) {
    state.sum += value
  }
}

// 创建 store 管理 state对象、actions对象、mutations对象
const store = new Vuex.Store({
  state,
  actions,
  mutations
})

export default store
```

main.js 引入 

```javascript
import Vue from 'vue'
import App from './App.vue'
import store from './vuex/store'

Vue.config.productionTip = false

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
```



**$store 可以被所有 vm、vc 访问到**



流程简介：

1. VC 分发任务

   ```
   methods: {
     increment() {
       // 使用分发
       this.$store.dispatch('add', this.n)
     },
   }
   ```

2. Actions 接收任务并解析任务，将其转发给 Mutations

   ```
   // 创建一个 actions, 包含多个响应组件 "动作" 的函数
   const actions = {
     // 第一个参数是 mini$store, 一般使用 context, 它是一个迷你版的 $store
     // 我们需要使用 context.commit() 去通知 Mutations 加工状态
     // 异步任务可以在 action 中开启
     add(context, value) {
       // context.commit('ADD', value)
   
       setTimeout(() => {
         context.commit('ADD', value)
       }, 500);
     }
   }
   ```

3. Mutations 也会解析任务，同时执行任务

   ```
   // 创建一个 mutations, 包含多个真正用于加工状态的函数(函数名一般都是大写)
   const mutations = {
     // 在 mutations 中可以加工 state
     ADD(state, value) {
       state.sum += value
     }
   }
   ```

4. 执行任务后状态 State 会改变

5. 改变后的状态驱动着页面重新渲染



DevTools 直接和 Mutations 交接



注意：`v-model.number="n"`

## 3、Vuex 中的 getters

> Vuex 的 getters

```
// 创建一个 getters, getters 中配置的是 state 中的数据加工后的值
// 和 Vue 中的计算属性 类似
const getters = {
  // 两个参数 state 和 携带过来的值(几乎不用)
  bigSum(state) {
    return state.sum * 100
  }
}

// 创建 store 管理 state对象、actions对象、mutations对象
const store = new Vuex.Store({
  state,
  actions,
  mutations,
  getters
})
```

访问 getters 可以这样 `this.$store.getter.xxx`

## 4、使用 mapState 和 mapGetters

https://vuex.vuejs.org/api/#component-binding-helpers

**在 `computed` 中使用 mapState 和 mapGetters**

## 5、使用 mapActions

https://vuex.vuejs.org/zh/guide/actions.html

**在 `methods` 中使用 mapActions**

**注意 mapActions 支持载荷**

```javascript
export default {
  // ...
  methods: {
    ...mapActions([
      'increment', // 将 `this.increment()` 映射为 `this.$store.dispatch('increment')`

      // `mapActions` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
    ]),
    ...mapActions({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.dispatch('increment')`
    })
  }
}
```

## 6、使用 mapMutations

https://vuex.vuejs.org/zh/guide/mutations.html



如果在 `actions` 中没有复杂的业务逻辑，可以让 VueComponent 跳过分发给 `actions` ，直接和 `mutations` 进行交互

```javascript
methods: {
      increment() {
        // 简单业务逻辑直接交给 mutations
        this.$store.commit('ADD', this.n)
      },
      decrement() {
        // 简单业务逻辑直接交给 mutations
        this.$store.commit('SUB', this.n)
      },
}
```



**注意 mapMutations 支持载荷**



```javascript
import { mapMutations } from 'vuex'

export default {
  // ...
  methods: {
    ...mapMutations([
      'increment', // 将 `this.increment()` 映射为 `this.$store.commit('increment')`

      // `mapMutations` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
    ]),
    ...mapMutations({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.commit('increment')`
    })
  }
}
```



## 7、总结

虽然 Vuex 官方给出了执行流程图，常规的流程是这样的

- vc 给 actions 分发任务
- actions 中可以做一些复杂业务，然后将具体的执行交给 mutations
- mutations 是同步的，它才可以改变 state 的值
- state 中存储的是组件的状态



但是当我们想直接与 `state、actions、mutations` 交互的时候，Vuex 也提供了相应的 `mapXxx` 工具

- 直接获取 state 中的值
  - 使用 `mapState`
- 直接对 state 中的值做一些加工
  - 类似于 Vue 的 computed，Vuex 中使用了 `Getters`
  - 直接拿到 `Getters` 中的值可以使用 `mapGetters`
- VC 给 actions 分发任务的简写
  - 使用 `mapActions` 
  - 但是注意，mapAction 中定义的方法支持载荷，会默认收集传入的参数，所以需要参数时，我们自己定义的回调函数就可以这样写 `f(...arguments)`
- 简单的业务 VC 直接与 mutations 通话
  - 使用 `mapMutations`
  - 注意：mapMutations 中定义的方法也支持载荷



## 8、Vuex 中的 Modules

由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，store 对象就有可能变得相当臃肿。

为了解决以上问题，Vuex 允许我们将 store 分割成**模块（module）**。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块——从上至下进行同样方式的分割：

https://vuex.vuejs.org/zh/guide/modules.html



```javascript
const moduleA = {
  state: () => ({ ... }),
  mutations: { ... },
  actions: { ... },
  getters: { ... }
}

const moduleB = {
  state: () => ({ ... }),
  mutations: { ... },
  actions: { ... }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  }
})

store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态
```



**看官网文档**