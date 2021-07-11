---
title: Vue_Core_Study
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210710222939.jpg'
toc: true
date: 2021-07-10 22:24:49
top: false
cover: flase
summary: 学习 Vue 的核心知识
categories: 
  - Vue
keywords:
  - Front-End
  - Vue
tags:
  - Front-End
  - Vue
---



# Vue 核心

## 简介

Vue：只关注视图、渐进式的框架

- 借鉴 Angular 的 **结构模板** 和 **数据绑定**
- 借鉴 Recat 的 **组件化** 和 **虚拟 DOM**



## 1、模板语法

- 插值表达式
  - 用于解析**标签体内容**
- 指令
  - 功能：用于解析**标签（包括：标签属性、标签内容、绑定事件等等）**



## 2、指令

- v-bind 简写 `:`
- v-model 双向数据绑定 **数据绑定** 简写 v-model="msg"
  - 对于普通的数据框（输入类DOM），v-model 自动获取 value 值



- 单向数据绑定：数据只能从 data 流向界面
- 双向数据绑定：数据不仅能从 data 流向界面，还可以从页面流向 data
  - 一般针对表单元素
  - v-model **默认收集 value**



## 3、MVVM

在 mvvm 模型中，Vue 本身就是起到 ViewModel 的作用



- M（Model）：对于 data 中的数据
- V（View）：模板代码
- VM（ViewModel）：Vue 实例对象



Vue.js 最重要的部分就是 VM 

ViewModel 两个作用：

- **DOM listeners**
- **Data Bindings**



可以输出 vm 看看，Vue 实例中绑定了我们在 data 中定义的变量：

- Vue 实例中前面带 `$` 表示Vue的属性
- 其他的是我们定义的属性，会通过数据代理绑定到 Vue 实例上



> 补充 data 和 el 的两种写法

我们创建一个 Vue 实例，可以这样：

```vue
<script>
  // 常用写法
   new Vue({
       el: '#app',
       data: {
           msg: 'test'
       },
       methods: {},
       components: {}
   });

  // 不常用写法
  const vm = new Vue({
      data: {
         msg: 'test'
       }
   })

  vm.$mount('#app')
</script>
```

还可以这样：

```vue
<script>
// data 第二种写法（组件中用的多）
  new Vue({
    el: '#app',
    data() {
      return {
        msg: 'test'
      }
    }
  })
</script>
```

1. el 有两种写法
   - new Vue 时传入 el 属性（常用）
   - 先 new Vue，再通过 `vm.$mount('#root')` 指定 el 属性（不常用）
2. data 两种写法
   - 对象式：非组件化编码时可以写对象，也可以写函数
   - 函数式：组件化编码必须使用函数式的 data



## 4、数据代理

**Vue 中在部分地方开启严格模式，使用箭头函数的内部不会开启严格模式，导致 this 指向丢失，所以 Vue 调用的函数禁止使用 箭头函数。**



看 Vue.js 源码中这样编写的：

```javascript
// 构造函数
function Vue (options) {
  
	if (!(this instanceof Vue)) {
 		 warn('Vue is a constructor and should be called with the `new` keyword');
  }
  this._init(options);
}
```

可以看到传入给构造函数的参数只有一个 options，el、data 等等都是它的一个属性

做了这几件事：

- 传入 options （里面包含 data）
- 收集 data 中的数据放到 `vm._data` 中
- 通过 **数据代理的方式** 将 `vm._data`中的数据放到 `vm` 身上
- 实质：vm.attribute 这个引用指向了 vm._data.attribute

底层使用了 `Object.defineProperty`

```vue
<body>
    <script>
        // 演示 Object.defineProperty
        let person = {}

        // set 和 get 的 this 都指向当前对象
        Object.defineProperty(person, 'name', {
            set() {
                // 修改 person.name 时，set 被调用
                // set 会收到：修改后的值
            },
            get() {
                // 当读取 person.name 时，get 被调用
                // get 的返回值就是 name 的值

            }
        })
    </script>
</body>
```

模拟数据代理：

```vue
<body>
    <script>
        // 模拟数据代理
        let _data = { msg: 'test' }
        
        let vm = {}

        Object.defineProperty(vm, 'msg', {
            set(value) {
                _data.msg = value
            },
            get() {
                return _data.msg
            }
        })
    </script>
</body>
```



之所以多做了这一层数据代理是为了**更高效的数据监听**，现在只需要监视 `vm._data` 中的数据变动就好了，不需要监听整个 vm



## 5、事件处理

- vue 中给 dom 元素绑定事件使用 `v-on` 缩写为 `@`



### 1、先看看 JavaScript 中事件的含义

详情见：https://developer.mozilla.org/zh-CN/docs/Web/Events

js 中事件有很多种类，我们现在主要关注 键盘事件 和 鼠标事件：

- 键盘事件：
  - keydown ： 按下任意键
  - keypress ：除了 shift、Fn、CapsLock 外的任意键被按住（连续触发）
  - keyup ：释放任意按键
- 鼠标事件：
  - click：在元素上按下并释放任意鼠标按键。
  - contextmenu：右键点击（在右键菜单显示前触发）。
  - dblclick：在元素上双击鼠标按钮。
  - mousedown：在元素上按下任意鼠标按钮。
  - mouseenter：指针移到有事件监听的元素内。
  - mouseleave： 指针移出元素范围外（不冒泡）。
  - mousemove： 指针在元素内移动时持续触发。
  - mouseover：指针移到有事件监听的元素或者它的子元素内。
  - mouseout：指针移出元素，或者移到它的子元素上。
  - mouseup： 在元素上释放任意鼠标按键。
  - select： 有文本被选中。
  - wheel：滚轮向任意方向滚动。



每个可用的事件都会有一个**事件处理器**，也就是事件触发时会运行的代码块。当我们定义了一个用来回应事件被激发的代码块的时候，我们说我们**注册了一个事件处理器**。注意事件处理器有时候被叫做**事件监听器**——从我们的用意来看这两个名字是相同的，尽管严格地来说这块代码既监听也处理事件。监听器留意事件是否发生，然后处理器就是对事件发生做出的回应。



例如：

```javascript
const btn = document.querySelector('button');

function bgChange() {
  const rndCol = 'rgb(' + random(255) + ',' + random(255) + ',' + random(255) + ')';
  document.body.style.backgroundColor = rndCol;
}

btn.onclick = bgChange;
```



### 补充：原生 js 事件冒泡和捕捉

当一个事件发生在具有父元素的元素上，现代浏览器运行两个不同的阶段 - **捕获阶段 **和 **冒泡阶段**。 

在捕获阶段：

- 浏览器检查元素的最外层祖先`<html>`，是否在捕获阶段中注册了一个`onclick`事件处理程序，如果是，则运行它。

- 然后，它移动到`<html>`中单击元素的下一个祖先元素，并执行相同的操作，然后是单击元素再下一个祖先元素，依此类推，直到到达实际点击的元素。



在冒泡阶段，恰恰相反:

- 浏览器检查实际点击的元素是否在冒泡阶段中注册了一个`onclick`事件处理程序，如果是，则运行它
- 然后它移动到下一个直接的祖先元素，并做同样的事情，然后是下一个，等等，直到它到达`<html>`元素。



在现代浏览器中，默认情况下，**所有事件处理程序都在冒泡阶段进行注册。**

> 用 stopPropagation 修复

这是令人讨厌的行为，但有一种方法来解决它！标准事件对象具有可用的名为 `stopPropagation()` 的函数。

当在事件对象上调用该函数时，它只会让当前事件处理程序运行，但事件不会在**冒泡**链上进一步扩大，因此将不会有更多事件处理器被运行(不会向上冒泡)。

```javascript
video.onclick = function(e) {
  e.stopPropagation();
  video.play();
};
```



### event.stopPropagation

阻止捕获和冒泡阶段中当前事件的进一步传播。

但是，它不能防止任何默认行为的发生； 例如，对链接的点击仍会被处理。



### event.preventDefault

这就要提一句关于默认行为。

Event 接口表示在 DOM 中出现的事件。

它的 `preventDefault()` 方法，会告诉浏览器：如果此事件没有被显式处理，它默认的动作也不应该照常执行。此事件还是继续传播，除非碰到事件侦听器调用 `stopPropagation()` 或 `stopImmediatePropagation()`，才停止传播。





Event 接口的 `**stopImmediatePropagation()**` 方法阻止监听同一事件的其他事件监听器被调用。

如果多个事件监听器被附加到相同元素的相同事件类型上，当此事件触发时，它们会按其被添加的顺序被调用。如果在其中一个事件监听器中执行 `stopImmediatePropagation()` ，那么剩下的事件监听器都不会被调用。



### 事件委托

冒泡还允许我们利用事件委托——这个概念依赖于这样一个事实,如果你想要在大量子元素中单击任何一个都可以运行一段代码，您可以将事件监听器设置在其父节点上，并让子节点上发生的事件冒泡到父节点上，而不是每个子节点单独设置事件监听器。



一个很好的例子是一系列列表项，如果你想让每个列表项被点击时弹出一条信息，您可以将`click`单击事件监听器设置在父元素`<ul>`上，这样事件就会从列表项冒泡到其父元素`<ul>`上。



### 2、JavaScript 提供了另一种事件触发机制

`addEventListener()` 和`removeEventListener()`

`在addEventListener()` 函数中, 我们具体化了两个参数——我们想要将处理器应用上去的事件名称，和包含我们用来回应事件的函数的代码。注意将这些代码全部放到一个匿名函数中是可行的:

```javascript
btn.addEventListener('click', function() {
  var rndCol = 'rgb(' + random(255) + ',' + random(255) + ',' + random(255) + ')';
  document.body.style.backgroundColor = rndCol;
});
```

这个机制带来了一些相较于旧方式的优点。有一个相对应的方法，`removeEventListener()，`这个方法移除事件监听器。例如，下面的代码将会移除上个代码块中的事件监听器：

```javascript
btn.removeEventListener('click', bgChange);
```

在这个简单的、小型的项目中可能不是很有用，但是在大型的、复杂的项目中就非常有用了，可以非常高效地清除不用的事件处理器，另外在其他的一些场景中也非常有效——比如您需要在不同环境下运行不同的事件处理器，您只需要恰当地删除或者添加事件处理器即可。



### 3、简单对比 v-on 实现 点击事件 和 原生的 onclick

先看 vue 如何实现的

```vue
<body>
    <div id="app">
        <button v-on:click="show">点我打印信息</button> <br />
    </div>
    <script>
        new Vue({
            el: '#app',
            data: {
                msg: '111'
            },
            methods: {
                // show: function() {
                //     console.log(this.msg)
                // }
              	// 推荐这样写
                show() {
                  	// 在这里可以看看该方法属于谁，有什么参数
                  	// this 是 vm，不能写成箭头函数形式，会发生this指向丢失
                  	console.log(this)
                    console.log(arguments.length)
                    console.log(arguments)
                },
            }
        });
    </script>
</body>
```

再看原生 JavaScript 如何实现：

```html
<body>
    <input type="text" id="feedIn">
    <script>
        const feedIn = document.getElementById("feedIn")
        // 原生的 onchange 事件不是实时监听数据的变化，而是实去焦点后才去处理
        feedIn.addEventListener('change', () => {
            console.log('@')
        })
    </script>
</body>
```



其实 vue 中 v-on: 属性，这个属性就是原生 JavaScript 的各种事件



> methods 中定义方法传入的参数

vue 中 methods 属性下面的方法都是绑定到 vue 实例上面的，而且这些方法默认都带有参数。

如果不确定可以使用如下方法判断：

```vue
methods: {
	show() {
		consolg.log(arguments.length)
		consolg.log(arguments)
		consolg.log(this)
	}
}
```

可以看到默认传入一个参数 `event` 即 `MouseEvent`，通过这个参数我们可以获取与 v-on 绑定的 DOM 的信息，举个例子，得到绑定事件的按钮的信息

```javascript
console.log(event.target.innerText)
```



**方法传参:**

```vue
<button @click="show1($event, 111)">点我提示信息 + 参数</button> <br />

show1(event, num) {
    console.log(event)
    console.log(num)
}
```

`$event` 给默认的鼠标事件占位，方法接收的时候可以使用自己定义的变量名接收

如果传入参数的时候使用了变量名，那么方法会首先到 `data` 中取数据



> 事件修饰符



```javascript
// 阻止默认行为，例如超链接跳转行为
// 原始写法
event.preventDefault();
// vue 中的写法
@click.prevent

// 阻止 js 事件冒泡
// 原生写法
event.stopPropagation()
// vue 中的写法
@click.stop

// prevent 和 stop 是最常用的两种事件修饰符, 可以串联使用
@click.prevent.stop
```

```javascript
<!-- 阻止单击事件继续传播 -->
<a v-on:click.stop="doThis"></a>

<!-- 提交事件不再重载页面 -->
<form v-on:submit.prevent="onSubmit"></form>

<!-- 修饰符可以串联 -->
<a v-on:click.stop.prevent="doThat"></a>

<!-- 只有修饰符 -->
<form v-on:submit.prevent></form>

<!-- 添加事件监听器时使用事件捕获模式 -->
<!-- 即内部元素触发的事件先在此处理，然后才交由内部元素进行处理 -->
<div v-on:click.capture="doThis">...</div>

<!-- 只当在 event.target 是当前元素自身时触发处理函数 -->
<!-- 即事件不是从内部元素触发的 -->
<div v-on:click.self="doThat">...</div>
```

使用修饰符时，顺序很重要；相应的代码会以同样的顺序产生。因此，用 `v-on:click.prevent.self` 会阻止**所有的点击**，而 `v-on:click.self.prevent` 只会阻止对元素自身的点击。

https://cn.vuejs.org/v2/guide/events.html



> 按键修饰符

```javascript
<!-- 只有在 `key` 是 `Enter` 时调用 `vm.submit()` -->
<input v-on:keyup.enter="submit">

// 常用 enter 和 esc
// 原生形式判断按键
// if (event.keyCode !== 13) return

// 输出捕获的键盘按键输入的码
console.log(event.keyCode)
// 输出捕捉到的键盘输入的按键名称
console.log(event.key)

console.log(event.target.value)

// vue 中可以这样使用
@keyup.13
@keyup.arrow-left
```

## 6、计算属性

data 中发生变化，整个模板中与`变化的数据相关的地方` 和 `调用方法的地方`全部重新解析

因为不知道方法中是不是涉及到变化的数据，所以不管变不变都重新解析



> 原生方法实现

使用 `Object.defineProperty()` 模拟 vue 计算属性的效果

不使用框架进行编码的时候，要追加的属性来自于其他值的加工，可以使用 `Object.defineProperty()`

```javascript
let person = {
    firstName: '张',
    lastName: '三'
}

Object.defineProperty(person, fullName, {
    set(value) { // fullName 被修改时，set 被调用，且 set 方法中的 this 是person，set 会收到修改的值
      // fullName 改变，firstName 和 lastName 也改变
      const arr = value.split('-')
      this.firstName = arr[0]
      this.lastName = arr[1]
    },
    get() { // fullName 被读取时，get 方法被调用，且 get 方法中的 this 是 person
      return this.firstName + '-' + this.lastName
    }
})
```

> 计算属性 computed 总结

**computed 底层就是使用了 Object.defineProperty()**

实现某些效果使用 方法 或者 计算属性 都可以实现，为什么有些时候需要使用计算属性？

- 两者都会在页面初次渲染后执行
- data 中数据发生变化，页面模板中涉及到变化的属性的地方都会重新解析
  - 由于不确定方法中是否依赖了变化的属性，所以不管如何方法都会重新解析
  - computed 中定义的属性对象，只有其依赖的 data 发生了变化才会重新解析
- **computed 优势：**与 methods 实现相比，内部有**缓存机制，效率更高**
  - 多个地方使用 methods 中定义的方法，会执行多次，没有缓存
  - 多个地方使用计算属性，只会调用一次
- 备注：计算属性是用于直接读取使用的，不用加小括号



computed 和 Object.defineProperty() 的相似之处：

- 默认写的 computed 只提供 get 方法
- 完整的写法，计算属性应该是一个对象，内部提供 set 和 get 方法的具体实现



什么时候使用 computed：

- 需要使用的数据是由其他数据加工得到



```javascript
// 完整写法
fullName: {
    set(value) { // fullName 被修改时调用 set, this 是 vm，set 会收到修改的值
      const arr = value.split('-')
      this.firstName = arr[0]
      this.lastName = arr[1]
    },
      
    get() { // fullName 被读取时，get 被调用，this 是 vm
      return this.firstName + '-' + this.lastName
    }
}

// 简写, 只相当于提供 get
fullName() {
  
}
```

## 7、数据监视 watch

```vue
<body>

    <div id="app">
        姓：<input type="text" v-model="firstName"> <br />
        名：<input type="text" v-model="lastName"> <br />
        <span>姓名: {{ fullName }}</span></span>
    </div>

    <script>
        const vm = new Vue({
            el: '#app',

            data: {
                firstName: '张',
                lastName: '三',
                fullName: ''
            },

            watch: {
                // 精简写法
                // firstName(newValue, oldValue) {   // watch中firstName() 什么时候调用：data中的firstName 改变的时候调用
                //     // console.log(arguments) // 接收两个参数，新的值和旧的值
                //     // console.log('firstName 被改变了')
                //     // console.log('新的值：' + newValue + '  旧的值: ' + oldValue)
                //     // console.log(this) // this 就是 Vue 实例
                //     this.fullName = newValue + '-' + this.lastName
                // },

                // 完整写法 可以完成一些重要的操作
                // firstName: {
                //     immediate: true,    // 若 immediate 值为 true，则 handler 在初始化时调用一次，以后就看 firstName 发生改变时调用

                //     // handler 固定函数名
                //     handler(newValue, oldValue) {
                //         this.fullName = newValue + '-' + this.lastName
                //     }
                // },

                lastName(newValue, oldValue) {
                    this.fullName = this.firstName + '-' + newValue
                },
            }
        });

        vm.$watch('firstName', {
            immediate: true,
            handler(newValue, oldValue) {
                // 异步执行
                // setTimeout 被 window 管理，所以可以使用箭头函数
                //  定时器的回调函数
                // 这里还不能写成正常的函数 function ,一旦这样写 this 就绑定到 window 对象了
                setTimeout(() => {
                    this.fullName = newValue + '-' + this.lastName

                }, 1000)
    
            }
        })
    </script>

</body>
```

> 总结

监视属性：

1. 当被监视的属性发生变化时，回调函数自动调用，执行相关操作
2. 监视的属性必须存在
3. 监视的两种写法：
   - new Vue 时传入 watch 配置
   - 通过 vm.$watch() 监视



computed 和 watch 之间的区别：

1. 只要是 computed 能完成的功能，watch 都可以完成
2. watch 能完成的功能，computed 不一定能完成，例如：watch 可以异步操作



备注：

1. 所有被 vue 所管理的函数都不要写箭头函数， 例如：watch 中的函数，computed 中的函数
2. 所有不被 vue 所管理的函数都要写成箭头函数 例如：定时器的回调、ajax的回调



## 补充：组件中的深度监视

```javascript
watch: {
		// watch 默认是浅层次的监听，加上 deep 属性才可以进行深度监视
		todos: {
		deep: true,   // 开启深度监视
		handler(value) {
			localStorage.setItem('todos', JSON.stringify(value))
		}
	} 
}
```

在组件中使用 watch，data 是通过函数返回的，每次改动数据，就会重新返回一个 data，所以监视时拿到的新值和旧值是一样的



注意：

- Vue 自身的监视就是可以深层次的监视数据
  - 对象可以通过 set 和 get 一层层监视
  - 数组通过 Vue 封装的常用数组操作函数也可以实现监视
- watch 是我们自己加的对单独某一层做与业务相关的监视操作
  - watch 默认是浅层次的监视
  - 加上 deep 属性后才会开启深层次监视



## 8、绑定样式

```vue
    <div id="app">
        <!-- class 字符串写法，适用于：类名不确定，要动态获取 -->
        <h2 class="naivekyo" :class="myStyle">{{ title }}</h2>

        <!-- class 的对象写法(key-value形式,逗号分隔)，适用于：类名确定，但不确定用不用 -->
        <h2 class="naivekyo" :class="{classB:hasB, classC:hasC}">{{ title }}</h2>

        <!-- 三元运算符 -->
        <h2 class="naivekyo" :class="hasC ? 'classC' : ''">{{ title }}</h2>

        <!-- 数组形式 适用于：同时应用多个 class-->
        <!-- <h2 class="naivekyo" :class="['classA', 'classB', 'classC']">{{ title }}</h2> -->
        <h2 class="naivekyo" :class="[a, b, c]">{{ title }}</h2>

        <!-- 绑定 style -->
        <!-- <h2 class="naivekyo" :class="[a, b, c]" :style='size'>{{ title }}</h2> -->
        <h2 class="naivekyo" :class="[a, b, c]" :style="{fontSize:size + 'px'}">{{ title }}</h2>

    </div>
```

## 9、条件渲染

- v-show
- v-if、v-else-if、v-else

​    条件渲染：

​      v-if：

​        适用于：切换频率很低的场景

​        特点：不展示的 DOM 节点直接删除



​      v-show：

​        适用于：切换频率很高的场景

​        特点：不展示的 DOM 节点没有被删除，仅仅是使用样式隐藏掉



​      **注意**：使用 v-if 时，DOM 节点可能无法获取到，而使用 v-show 一定可以获取到 DOM 节点

## 10、列表渲染

> 基本列表遍历

   v-for ：

​      1、用于展示列表数据

​      2、语法，v-for="(value, index) in arr" :key="value.id"

​      3、可遍历：数组、对象、字符串、数字



> 列表过滤



  想要对数据进行加工后再展示，且不想破坏原数据，最好使用 computed

```vue
// 使用 computed 过滤，优势：不影响原数据
computed: {
	fmtPersons() {
      const { persons, keyWord } = this
      return persons.filter( p => p.name.indexOf(keyWord) !== -1)
  }
}
```

> 列表过滤 + 排序



```vue
computed: {
	fmtPersons() {
		const { persons, keyWord, sortType } = this
		// 根据关键词过滤
		let arr = persons.filter( p => p.name.indexOf(keyWord) !== -1)
		// 排序
		if(sortType) {
			arr.sort((a, b) => {
				if(sortType == 1) return a.age - b.age
				else return b.age - a.age
			})
		}

		return arr
	}
}
```

> 列表更新

Vue 中为监测到的每一个属性都设置了 set 和 get 方法

set 做了两件事：修改数据和重新更新页面



监测原理：为 vm._data 中每个属性设置 set 和 get

- 对象不管层级有多深，每个属性都有 set 和 get
- 但是 vue 没办法给数组中每个元素设置 set 和 get，那么该如何解决数组数据检测问题？
  - Vue 将被侦听的数组的变更方法进行了包裹，所以它们也将会触发视图更新。
    - push、pop、shift、unshift、splice、sort、reverse



​     Vue 中数据绑定的原理：

​      1、Vue 会监视 data 中所有层次对象的属性

​      2、对象中的属性数据通过添加 set 方法来实现监视

​      3、数组中也实现了监视：重写数组一系列更改元素的方法,做了两件事

​        （1）调用原生对应的方法对元素进行处理

​        （2）更新界面

## 11、收集表单数据

input type=text 则 v-model 收集的是 value

input type=radio 则 v-model 收集的是 value, 需要配置 value 属性

input type=checkbox

 1、没有配置 input 的 value 属性，那么收集的就是 checked 的 true 或 false 布尔值

 2、配置了 input 的 value 属性：

   (1) v-model 的初始值是非数组，那么收集的还是 checked 的值

   (2) v-model 的初始值是数组，那么收集到的就是 value 组成的数组

select 使用 v-model 绑定的是 option 的 value 值

textarea v-model 绑定的是 value



form 提交不用给 submit 绑定事件，直接给表单绑定事件

@submit.prevent="submit"



## 12、Vue 的生命周期

![img](https://cn.vuejs.org/images/lifecycle.png)



解释：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210711110811.png)

## 13、分析 Lifecycle

**注意：在实际项目开发中需要修改 Vue 的全局配置**

https://cn.vuejs.org/v2/api/#productionTip



三个插件：

- Vetur	----  脚手架中的提示
- vue
- Vue 3 Snippets    ----------  vue3 的代码片段，包含 vue2 的代码片段



用的多的：

- created
- mounted
- beforeDestroy



中间有一个 vm.$el 属性的挂载需要注意一些东西：

- 要么在 Vue 构造函数中传入 el 属性
- 要么在后面写：`Vue.$mount(el)`



## 14、Vue 过渡和动画

vue 过滤需要使用 `v-show` + 标签 `<transition>`

https://cn.vuejs.org/v2/guide/transitions.html

- transform：变换
- transition：过渡



> 过渡

​    1、基本编码

​      (1).在目标元素外包裹 <transition name="xxx">

​      (2).编写样式：

​        进入：

​          进入起始点(xxx-enter)

​          进入过程中(xxx-enter-active)

​          进入结束点(xxx-enter-enter-to)

​        离开:

​          离开起始点(xxx-leave)

​          离开过程中(xxx-enter-active)

​          离开结束点(xxx-leave-to)



> 动画

关键字 `animation` 配合 `@keyframes`

1. 基本编码

​      (1).在目标元素外包裹 \<transition name="xxx">\</transition>

​      (2).编写：进入动画、离开动画的样式

2. 类名规范

​      进入动画样式：xxx-enter-active

​      离开动画样式：xxx-leave-active

## 15、vue 过滤器

vue2.1+ 只能使用全局过滤器，vue3.0+ 可以使用局部过滤器

```vue
// 全局注册的过滤器, 所有 Vue 实例都可以使用
Vue.filter('dateFormater', function(value, str = 'YYYY-MM-DD') {

	return moment(value).format(str)
})

<!-- 在双花括号中 -->
{{ message | capitalize }}

<!-- 在 `v-bind` 中 -->
<div v-bind:id="rawId | formatId"></div>
```

## 16、常用的内置指令

​    常用的内置指令：

​      v-text :  更新元素的 innerText

​      v-html :  更新元素的 innerHtml

​      v-if  :  条件渲染(动态控制节点是否存在)

​      v-else :  条件渲染(动态控制节点是否存在)

​      v-show :  条件渲染(动态控制 display)

​      v-for  :  遍历数组/对象

​      v-on  :  绑定事件监听

​      v-bind:xxx :  强制绑定解析表达式

​      v-model :  双向数据绑定

​      ref   :  为某个元素注册一个唯一标识，vue 对象通过 $refs 属性访问这个元素对象

## 17、自定义指令

全局指令和局部指令

通过获取真实 DOM，和要绑定的数据，我们可以进行很多操作，例如填充文本数据或者html，还可以发送 axios 请求

```javascript
Vue.config.productionTip = false

// 指令的本质就是函数
// 指令分为全局指令、局部指令
// 定义一个全局指令
// 回调函数接受参数：1. 真实DOM节点 2. 给指令传入的参数 3.虚拟DOM节点 4.虚拟DOM节点
// 一般只用前两个参数，不用后面两个 Vue 使用的虚拟DOM
// binding 是一个对象，可以输出看看
Vue.directive('upper-text', function(el, binding) {
  console.log(el)
  console.log(binding)

  // el.innerText = binding.value.toUpperCase()
  el.innerText = el.innerText + ' : ' + binding.value.toUpperCase()

})

new Vue({
  el: '#app',
  data: {
    name: 'NaiveKyo'
  },
  // 局部指令
  directives: {
    'lower-text': function(el, binding) {
      el.innerText = binding.value.toLowerCase()
    }
  }
});
```

## 18、自定义插件



定义插件的模板:

```javascript
const naivekyo = {}

// install 方法第一个参数是 Vue 实例，第二个参数是传入的可选参数
naivekyo.install = function(Vue, options) {
  	// 里面都是一些小功能
    // 添加两个全局指令
    Vue.directive('upper-text', function(el, binding) {
        el.innerText = binding.value.toUpperCase()
    })

    Vue.directive('lower-text', function(el, binding) {
        el.innerText = binding.value.toLowerCase()
    })

    // 给 Vue 自身添加属性
    Vue.projectName = '管理信息系统'
    Vue.version = 'v1.0.0'

    Vue.showInfo = function() {
        console.log('this is some message.');
    }

    // 给 Vue 原型上添加数据，供 vm 使用
    Vue.prototype.$random = function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min // [min, max)
    }
}
```

引入插件：工程中应该使用 ES6 的语法引入

现在可以这样做：

```javascript
<script src="./naivekyo.js"></script>
// 这里 Vue 会去调用这个插件中的 install 方法
Vue.use(naivekyo)
```
