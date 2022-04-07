---
title: 'JavaScript: learn JS and JQuery'
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221028.jpg'
coverImg: /img/20220225221028.jpg
cover: false
toc: true
mathjax: false
date: 2022-04-06 10:54:02
summary: "JavaScript 之 ECMAScript、对象、原型链及闭包"
categories: "JavaScript"
keywords: "JavaScript"
tags: "JavaScript"
---

# JavaScript

JavaScript 由三部分组成：

- ECMAScript：核心，描述了 js 的语法和基本对象
- DOM：文档对象模型，提供操作页面元素的方法和属性，是 W3C 的标准，所有浏览器公共遵守的标准
- BOM：浏览器对象模型，提供一些属性和方法可以操作浏览器。各个浏览器厂商根据 DOM 在各自浏览器上的实现。（表现为不同的浏览器定义有差别，实现方式不同）



## 一、ECMAScript

### 1、JavaScript 数据类型和数据结构

JavaScript 是一种 **弱类型** 或者说 **动态** 的语言。这意味着我们不用提前声明变量的类型，而是在程序运行过程中，类型会被自动确定。这也意味着使用同一个变量可以保存不同类型的数据。



#### 1.1、数据类型

最新的 ECMAScript 标准定义了 8 种类型：

- 7 种原始类型，使用 `typeof` 运算符检查
  - `undefined`：typeof instance === "undefined"
  - `Boolean`：typeof instance === "boolean"
  - `Number`：typeof instance === "number"
  - `String`：typeof instance === "string"
  - `BigInt`：typeof instance === "bigint"
  - `Symbol`：typeof instance === "symbol"
  - `null`：typeof instance === "object"

- `Object`：<mark>typeof instance === "object"</mark>。任何 constructed 对象实例的特殊非数据结构类型，也用作数据结构：new Object、new Map、new Set、new WeakMap、new WeakSet、new Date，和几乎所有通过 new keyword 创建的东西

**typeof** 运算符的唯一目的就是检查数据类型，如果我们希望检查任何从 Object 派生出来的结构类型，使用 typeof 是不起作用的，因为总是会得到 "object"。检查 Object 种类的合适方式是使用 `instanceof` 关键字。但即使这样也存在误差。



<br/>

> 基本类型值可以被替换，但是不能被改变。

```javascript
// 使用字符串方法不会改变一个字符串
var bar = "baz";
console.log(bar);               // baz
bar.toUpperCase();
console.log(bar);               // baz

// 使用数组方法可以改变一个数组
var foo = [];
console.log(foo);               // []
foo.push("plugh");
console.log(foo);               // ["plugh"]

// 赋值行为可以给基本类型一个新值，而不是改变它
bar = bar.toUpperCase();       // BAZ
```



> JavaScript 函数对基本类型值的处理

```javascript
// 基本类型
let foo = 5;

// 定义一个貌似可以改变基本类型值的函数
function addTwo(num) {
   num += 2;
}
// 和前面的函数一样
function addTwo_v2(foo) {
   foo += 2;
}

// 调用第一个函数，并传入基本类型值作为参数
addTwo(foo);
// Getting the current Primitive value
console.log(foo);   // 5

// 尝试调用第二个函数...
addTwo_v2(foo);
console.log(foo);   // 5
```

为什么说基本类型的值无法被改变

- 将一个基本类型的值作为参数传递给一个函数

- 函数内部会生成一个传入参数的备份副本，函数中所有操作都是对该副本进行操作
- 该副本不会影响到原来的变量



> 基本类型的包装类

除了 null 和 undefined 之外，所有基本类型都有其包装类对象：

- String、Number、BigInt、Boolean、Symbol（字面量基本类型）

举 Number 包装类为例：

```javascript
new Number(value);
var a = new Number('123'); // a === 123 is false
var b = Number('123'); // b === 123 is true
a instanceof Number; // is true
b instanceof Number; // is false
```

Boolean:

```javascript
var x = Boolean(expression);     // 推荐
var x = !!(expression);          // 推荐
var x = new Boolean(expression); // 不太好
```



#### 1.2、原始值（primitive values）

除 Object 以外的所有类型都是不可变的（值本身无法被改变），我们称这些类型的值为 "原始值"。

- 布尔类型：true 和 false
- Null 类型：Null 类型只有一个：null
  - null 在布尔运算中被视为 false

<mark>null 与 undefined 的不同点</mark>

在检测 null 或 undefined 时，注意 == 和 === 的区别，前者会进行类型转换

```javascript
typeof null        // "object" (因为一些以前的原因而不是'null')
typeof undefined   // "undefined"
null === undefined // false
null  == undefined // true
null === null // true
null == null // true
!null //true
isNaN(1 + null) // false
isNaN(1 + undefined) // true
```

- Undefined 类型：一个没有被赋值的变量会有个默认值 `undefined`

`undefined`是*全局对象*的一个属性。也就是说，它是全局作用域的一个变量。`undefined`的最初值就是原始数据类型`undefined`。

```javascript
// 严格相等
var x;
x === undefined;	// true


// typeof, 使用它是因为 typeof 不会在一个变量没有被声明的时候抛出一个错误, 例如下面 y 没有事先声明
typeof y === 'undefined';	// true
// 检查一个变量是否在全局上下文中存在可以通过检查全局对象上是否存在这个属性
if ('x' in window) {
  // 只有 x 被全局性的定义，才会定义这些语句 
}


// void 操作符和 undefined
var z;
x === void 0  // true
```



#### 1.3、对象

ECMAScript 定义的对象中有两种属性：

- **数据属性**：键值对
- **访问器属性**：一个或两个访问器函数（get 和 set）来存取数值

一个 JavaScript 对象就是键和值之间的映射。键是一个字符串（或者 Symbol），值可以是任意类型的值。



### 2、数据结构

#### 2.1、有序集：属组和类型数组

#### 2.2、键控集：Maps、Sets、WeakMaps、WeakSets

Map 和 WeakMaps 的差别在于：

- Map 对象的键可以枚举



#### 2.3、结构化数据：JSON



### 3、函数

#### 3.1、this 关键字

与其他语言相比，函数的 `this` 关键字在 JavaScript 中的表现略有不同，此外在严格模式和非严格模式下也会有一些区别。



this：当前执行上下文（global、function 或 eval）的一个属性，在非严格模式下，总是指向一个对象，在严格模式下可以是任意值。

- 全局上下文：
  - 无论是否在严格模式下，在全局执行环境中（在任何函数体外部）`this` 都指向全局对象。
- 函数上下文：
  - 在函数内部，`this`的值取决于函数被调用的方式。

```javascript
function f1(){
  return this;
}
//在浏览器中：
f1() === window;   //在浏览器中，全局对象是window

//在Node中：
f1() === globalThis;

// 然而，在严格模式下，如果进入执行环境时没有设置 this 的值，this 会保持为 undefined
function f2(){
  "use strict"; // 这里是严格模式
  return this;
}

f2() === undefined; // true


// 函数上下文中的 this ===========================================================
// 对象可以作为 bind 或 apply 的第一个参数传递，并且该参数将绑定到该对象。
var obj = {a: 'Custom'};

// 声明一个变量，并将该变量作为全局对象 window 的属性。
var a = 'Global';

function whatsThis() {
  return this.a;  // this 的值取决于函数被调用的方式
}

whatsThis();          // 'Global' 因为在这个函数中 this 没有被设定，所以它默认为 全局/ window 对象
whatsThis.call(obj);  // 'Custom' 因为函数中的 this 被设置为obj
whatsThis.apply(obj); // 'Custom' 因为函数中的 this 被设置为obj



// this 和对象转换      ==========================================================
function add(c, d) {
  return this.a + this.b + c + d;
}

var o = {a: 1, b: 3};

// 第一个参数是用作“this”的对象
// 其余参数用作函数的参数
add.call(o, 5, 7); // 16

// 第一个参数是用作“this”的对象
// 第二个参数是一个数组，数组中的两个成员用作函数参数
add.apply(o, [10, 20]); // 34


// ===============================================
/*
在非严格模式下使用 call 和 apply 时，如果用作 this 的值不是对象，则会被尝试转换为对象。null 和 undefined 被转换为全局对象。原始值如 7 或 'foo' 会使用相应构造函数转换为对象。因此 7 会被转换为 new Number(7) 生成的对象，字符串 'foo' 会转换为 new String('foo') 生成的对象。
*/
function bar() {
  console.log(Object.prototype.toString.call(this));
}

bar.call(7);     // [object Number]
bar.call('foo'); // [object String]
bar.call(undefined); // [object global]

// =================================================
// bind 方法 Function.prototype.bind()
// 调用f.bind(someObject)会创建一个与f具有相同函数体和作用域的函数，
// 但是在这个新函数中，this将永久地被绑定到了bind的第一个参数，无论这个函数是如何被调用的。
function f(){
  return this.a;
}

var g = f.bind({a:"azerty"});
console.log(g()); // azerty

var h = g.bind({a:'yoo'}); // bind只生效一次！
console.log(h()); // azerty

var o = {a:37, f:f, g:g, h:h};
console.log(o.a, o.f(), o.g(), o.h()); // 37, 37, azerty, azerty

// ================================================================
// 箭头函数, this与封闭词法环境的this保持一致。在全局代码中，它将被设置为全局对象：
var globalObject = this;
var foo = (() => this);
console.log(foo() === globalObject); // true


// ==========================================================
// 原型链中的 this
/*
对于在对象原型链上某处定义的方法，同样的概念也适用。如果该方法存在于一个对象的原型链上，那么 this 指向的是调用这个方法的对象，就像该方法就在这个对象上一样。
*/
var o = {
  f: function() {
    return this.a + this.b;
  }
};
var p = Object.create(o);
p.a = 1;
p.b = 4;

console.log(p.f()); // 5
```

- 类上下文
  - this 在类中的表现与在函数中类似，因为类本质上也是函数，但也有一些区别和注意事项

```javascript
// 在类的构造函数中，this 是一个常规对象。类中所有非静态的方法都会被添加到 this 的原型中:
class Example {
  constructor() {
    const proto = Object.getPrototypeOf(this);
    console.log(Object.getOwnPropertyNames(proto));
  }
  first(){}
  second(){}
  static third(){}
}

new Example(); // ['constructor', 'first', 'second']
```





### 4、对象



#### 4.1、构建函数

JavaScript 用一种称为 **构建函数** 的特殊函数来定义对象和它们的特征。

- **构建函数 **提供了创建您所需对象（实例）的有效方法，将对象的数据和特征函数按需联结至相应对象。
- 不像“经典”的面向对象的语言，从构建函数创建的新实例的特征并非全盘复制，而是通过一个叫做原形链的参考链链接过去的。



> 构建函数

先看看原始的构建一个对象的方法

```javascript
function createNewPeople(name) {
  var person = {};
  person.name = name;
  person.intro = function() {
    alert('Hi! I\'m ' + this.name + '.');
  }

  return person;
}

var person = createNewPeople('Alice');
person.intro();
```



下面看看 JavaScript 版本的类的构建函数：

```javascript
// JavaScript 提供的函数
function Person(name) {
  this.name = name;
  this.intro = function() {
    alert('Hi! I\'m ' + this.name + '.');
  }
}

// 方式一：使用 call 或者 apply
var per = {}
// 或者 Person.apply(per, ['张三']);
// 注意 call 和 apply 非常类似，只不过传递参数一个是参数列表，一个是数组
Person.call(per, '张三')
console.log(per.name)
per.intro()
```

<mark>注意构造函数一般首字母大写，为了与普通函数做区分</mark>

作为一个类的构造函数，上述的例子其实可以这样使用（通过关键字 `new`）：

```java
var person = new Person('李四');
console.log(person.name);
person.intro();
```

> 完整版的构造函数

对前面的代码进行重构：

```javascript
    function Person(name, age, gender) {
      this.name = name;
      this.age = age;
      this.gender = gender;

      this.intro = function() {
        alert('self-introduction: ' + this.name + ' ' + this.age + ' ' + this.gender)
      }
    }

    var person1 = new Person('张三', 21, '男');
    person1.intro();
```

#### 4.2、创建对象的其他形式

（1）`Object()` 构造函数

创建一个 Object 对象，里面什么属性、方法都没有，自己去加上去

```javascript
    var person1 = new Object();

    person1.name = '张三';
    person1.age = 21;
    person1.intro = function() {
      alert(this.name + ' ' + this.age);
    }

    person1.intro();
```

（2）使用 `create()` 方法

JavaScript 内嵌方法 create()，可以基于现有对象创建新的对象

```javascript
var person2 = Object.create(person1);
person2.intro();
// console.log(person2) ==> {}
```

person2 基于 person1 创建，它们具有相同的属性和方法。

这非常有用，因为它允许创建新的对象而无需定义构造函数。缺点是比起构造函数，浏览器更晚才支持 create（）方法

#### 4.3、对象原型

[参考](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Objects/Object_prototypes)

原型机制是 JavaScript 实现单继承的基础。

> 概念

JavaScript 常被描述为一种 **基于原型的语言（prototype-based language）** —— 每个对象拥有一个 **原型对象**，对象以其原型为模板、从原型继承方法和属性。

原型对象也可能拥有原型，并从中继承方法和属性，一层一层，以此类推。这种关系常被称为 <strong style="color:red">原型链（prototype chain）</strong>，它解释了为何一个对象会拥有定义在其他对象中的属性和方法。

<br />

准确来说，这些继承而来的属性和方法都定义在 Object 的构造器函数（constructor functions）之上的 `prototype` 属性上，而非对象实例本身。

<br />

传统的 OOP 中，先定义类，然后创建对象实例时，类中定义的所有属性和方法都被复制到实例中。

在 JavaScript 中并不是这样复制的，而是在对象实例和它的构造器之间建立一个链接（这个链接就是 `__proto__属性`，是从构造函数的 `prototype` 属性派生的），之后通过上溯原型链，在构造器中找到这些属性和方法。

<br />

要理解下面这两个概念：

- 对象的原型（可以通过 `Object.getPrototypeOf(obj)`或者已经弃用的 `__proto__` 属性获得）
- 构造函数的 `prototype` 属性

它们是有区别的，前者是每个实例上都有的属性，后者是构造函数的属性。

也就是说，`Object.getPrototypeOf(new Foobar())` 和 `Foobar.prototype` 指向同一个对象

举个例子，看下面一段代码：

```javascript
// 一个名为 People 的构造函数
function People(name) {
    this.name = name;
    this.into = function() {
      	console.log('name : ' + this.name);
    }
}

// 利用 People 构造函数，构造出一个对象 people1
var people1 = new People('Alice');
```

那么有如下结论：

- People 是构造函数，它的属性：`People.prototype`  指向了一个对象
- people1 是对象，它的原型即：`people1.__proto__` 
  - 上面两个是相等的，即 ``people1.__proto__ === People.prototype`  结果为 true
  - 这也就是前面说的对象的原型是构造函数的 prototype 属性派生而来
- people1 对象原型的原型就是 Object 构造函数的 prototype 属性：`people1.__proto__.__proto__ == Object.prototype`，结果为 true
- People 构造函数的 prototype 属性指向的对象的原型就是 Object 构造函数的 prototype 属性指向的对象：`People.prototype.__proto__ === Object.prototype`，结果为 true



people1 --\> People --\> Object

如果 people1 要调用 Object 的方法，

- 那么浏览器首先检查，people1 对象上是否具有可用的方法
- 如果没有，浏览器再检查 people1 对象的原型对象（即 People 构造函数的 prototype 属性所指向的对象）是否具有目标方法
- 如果也没有，则浏览器检查 People() 构造函数的 prototype 属性所指向对象的原型对象（即 Object 构造函数的 prototype 属性所指向的对象）是否具有目标方法
- 如果有则调用，如果没有则返回 undefined



> 注意

<mark>原型链中的方法和属性没有被复制到其他对象 —— 如果要访问这些方法或者属性必须通过原型链</mark>



没有官方的方法用于直接访问一个对象的原型对象  —— 原型链的 "连接" 被定义在一个内部属性中，在 JavaScript 语言标准中用 `[[prototype]]` 表示，然而大多数浏览器还是提供了一个名为 `__proto__` 的属性，其包含了对象的原型。

> prototype 属性：继承成员被定义的地方

那么，这些继承的属性和方法在哪里定义呢？

它们被定义在 `prototype` 属性之上（也可以称为子命名空间 sub namespace）—— 那些以 `Object.prototype.` 开头的属性，而非仅仅以 `Object.` 开头的属性。

**prototype** 属性的值是一个对象，我们希望被原型链下游的对象继承的属性和方法，都存储在其中。

<br />

所以 `Object.prototype.watch()` 、`Object.prototype.valueOf()` 等等成员，适用于任何继承自 `Object()` 的对象类型，包括使用构造器创建的新的对象实例。

`Object.is()`、`Object.keys()` ，以及其他不在 `prototype` 对象内的成员，不会被 "对象实例" 或 "继承自 Object() 的对象类型" 所继承。这些方法/属性仅能被 `Object()` 构造器自身使用。 

> 看起来有些奇怪：构造器本身就是个函数，为什么能在函数中定义一个方法呢？其实函数也是一个对象类型。可以看看 Function() 构造器的参考文档

看下面这段代码：

```javascript
function People(name) {
    this.name = name;
    this.intro = function() {
      	console.log('name : ' + this.name);
    }
    this.showProto = function() {
        console.log('当前对象内部的 this : ');
        console.log(this);
        console.log('当前对象内部的 __proto__: ');
        console.log(this.__proto__);
    }
}
```

如果创建对象后调用 `showProto` 会发现，对象内部的 `this` 指向当前对象。

`this.__proto__` 指向当前对象的原型即构造函数的 prototype 属性指向的对象。



#### 4.4、create（）

`Object.create(obj)` 实际做的是从指定原型对象创建一个新的对象。比如依旧是前面的 People 构造函数：

```javascript
var people1 = new People('Alice');

var people2 = Object.create(people1);

// 控制台测试，下面的结果都为 true
people2.__proto__ === people1
Object.getPrototypeOf(people2) === people1
```



#### 4.5、constructor 属性

每个实例对象都从原型中继承了一个 `constructor` 属性，该属性指向了用于构造此实例对象的构造函数。

```javascript
// 控制台输入
people1.constructor
people2.constructor
// 它们都会返回 People() 构造器，因为该构造器包含这些实例的原始定义

// 小技巧，可以使用 constructor 属性调用构造器创建一个新的对象
var people3 = new people1.constructor('张三');

// 此外还可以访问 constructor 的一些属性
// 比如获得构造器名称
people1.constructor.name		// "People"
```



#### 4.6、修改原型

可以修改构造器的 `prototype` 属性

比如我们这样：

```javascript
function People(name) {
    this.name = name;
    this.intro = function () {
      	console.log('name : ' + this.name);
    }
}

// 修改原型链上的属性
People.prototype.test = function() {
  	console.log('test...');
}

var people1 = new People('李四');
```

控制台输入：`people1.test()`

此时浏览器实际调用的是`people1.__proto__.test()`

此外如果我们使用 `new People()` 再创建一个对象，或者使用 `Object.create()` 继承一个对象，得到的新的对象的原型上都会有 `test()` 这个方法。整条继承链动态的更新了。

这正是原型链模式下继承体系的一种特性。上游对象的方法不会复制到下游对象的实例中；下游对象本身虽然没有定义这些方法，但是浏览器会通过上溯原型链，从上游对象中找到它们。这种继承模型提供了一种强大而可扩展的功能系统。

<br />

事实上一种极其常见的对象定义模式是，在构造器中定义属性，在 `prototype` 属性上定义方法。这样，构造器只包含属性定义，而方法分装在不同的代码块中，代码更具有可读性：

```javascript
// 构造器
function Test(a, b, c, d) {
  // 属性定义
}

// 定义第一个方法
Test.prototype.x = function() {}

// 定义第二个方法
Test.prototype.y = function() {}

// ...
```

### 5、JavaScript 的继承

#### 5.1、原型式的继承

```javascript
// 构造函数定义属性
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// 原型定义方法
Person.prototype.intro = function() {
  console.log('使用原型定义方法时，方法中的 this 指向');
  console.log(this);
  console.log(this.name + ' ' + this.age);
}


// 创建一个 Teacher 类继承自 Person
function Teacher(name, age, subject) {
  Person.call(this, name, age);
  this.subject = subject;
}
```



完成了上述代码后，我们会发现一个问题，我们定义了一个新的构造函数，它含有对 Teacher 构造函数 prototype 属性的一个引用，但是没有包含对 `Person.prototype` 的引用，我们使用 `Object.getOwnPropertyNames(obj)` 查看两个构造方法的 prototype 属性所拥有的全部属性：



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220407105210.png)

我们会发现 Teacher 是无法访问我们在 Person 的 prototype 属性中定义的方法 intro() 的，也就无法实现继承。

我们可以这么干：

```javascript
Teacher.prototype = Object.create(Person.prototype)

// true
Teacher.prototype.__proto__ === Person.prototype
```

这里给 Teacher() 构造器的 prototype 属性赋了一个新的值，它指向的这个新的对象继承自 Person.prototype，但是现在也出现了一个新的问题，就是：

- `Teacher.prototype.constructor === Person` 结果为 true

我们如何解决这个问题呢？

可以这样操作：

```javascript
// 构造函数定义属性
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// 构造方法的 prototype 属性上(即对象的原型)定义方法
Person.prototype.intro = function() {
  console.log(this.name + ' ' + this.age);
}


// 创建一个 Teacher 类继承自 Person
function Teacher(name, age, subject) {
  Person.call(this, name, age);
  this.subject = subject;
}

// 继承 Person.prototype
Teacher.prototype = Object.create(Person.prototype);

// 解决无法继承 Teacher.prototype.constructor 的问题
Object.defineProperty(Teacher.prototype, 'constructor', {
  value: Teacher,
  enumerable: false, // 这样就不会被 for in 循环枚举出来
  writable: true
});
```

这里使用了 `Object.defineProperty()` 方法。

`Object.defineProperty()` 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。

- 方法：`Object.defineProperty(obj, prop, descriptor)`
- 参数
  - obj：要定义属性的对象。
  - prop：要定义或修改的属性的名称或 Symbol 。
  - descriptor：要定义或修改的属性描述符。

对象里面目前存在的属性描述符有两种主要形式：

- 数据描述符：一个具有值得属性，该值可以是可写的，也可以是不可写的
- 存取描述符：getter 函数和 setter 函数所描述的属性

一个描述符只能是这两者中的一个，不能同时是两者。

这两种描述符都是对象，它们共享一下可选值键：

- `configurable`：true 表示该属性的描述符能够被改变，同时该属性也能从相应对象上删除，默认 false
- `enumerable`：true 表示该属性会出现在对象的枚举属性中，默认为 false



数据描述符具有以下可选键值：

- `value`：属性对应的值，可以是任何有效的 JavaScript 值（数值、对象、函数等等），默认 undefined
- `writable`：ture 表示属性的值，也就是 value 可以被赋值运算符改变，默认 false



存取描述符还具有以下可选键值：

- `get`：属性的 getter 函数，如果没有 getter 默认 undefined。
- `set`：属性的 setter 函数，如果没有 setter，默认 undefined



#### 5.2、ES2015 新特性 class

ES 2015 中提出了 class，其本质还是语法糖，[参考 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)



### 6、JSON

两个方法：

- `JSON.stringify()`
- `JSON.parse()`



## 二、DOM

### 1、简介

DOM 全称 Document Object Model，即 文档对象模型。是 HTML 和 XML 文档的编程接口。它提供了对文档的的结构化的描述，并定义了一种方式可以使程序对该结构进行访问，从而改变文档结构、样式和内容。

利用 DOM 提供的 API，我们就可以以编程的方式操作整个 HTML 的内容（比如添删改某个元素），整个 HTML 就是一颗 DOM 树。

DOM 模型用一颗逻辑树来表示一个文档，树的每个分支的终点都是一个节点（node），每个节点都包含这对象（objects）DOM 的方法（method）。

<br />

开始的时候，JavaScript 和 DOM 是交织在一起的，但它们最终演变成两个独立的个体。Javascript 可以访问和操作存储在 DOM 中的内容，我们可以写一个近似的等式：

API（web 或 XML 页面）= DOM + JS（脚本语言）



### 2、常用数据结构

> 数据结构

| 名称        | 含义                                                         |
| ----------- | ------------------------------------------------------------ |
| document    | Document 接口表示任何在浏览器中载入的网页，并作为网页的入口，也就是 DOM 树，DOM 树包含了大量元素。<br/>（例如，元素的 `ownerDocument` 属性返回它所属于 `document` ) |
| element     | element 指由 DOM API 中成员返回的类型为 element 的一个元素或节点 |
| nodeList    | nodeList 是一个元素的数组，nodeList 可以通过两种方式进行访问：<br/><ul><li>list.item(1)</li><li>list[1]</li></ul> |
| attribute   |                                                              |
| nameNodeMap | nameNodeMap 和数组类似，但是条目是由 name 或 index 访问的    |

> 核心接口

在 DOM 编程时，通常使用最多的是 `Document` 和 `Window` 对象。简单来说，`window` 对象表示浏览器中的内容，而 `document` 对象是文档本身的根节点。`Element` 继承通用的 `Node` 接口，将这两个接口结合后就提供了许多方法和属性可以供单个元素使用。



### 3、常用接口

常用的 API 简要列表：

- `document.getElementById(id)`
- `document.getElementByTagName(name)`
- `document.createElement(name)`
- `parentNode.appendChild(node)`
- `element.innerHTML`
- `element.style`
- `element.setAttribute()`
- `element.getAttribute()`
- `element.addEventListener()`
- `window.content`
- `window.onload`
- `window.dump()`
- `window.scrollTo()`

H5 新增：

- `querySelector`
- `querySelectorAll`



### 4、测试常用接口

测试：

模板 HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  
  <h1 id="hello">Hello 你好</h1>
  <h1>world</h1>

</body>
</html>
```

测试获得 document

```javascript
// 获取一个 element
var hello = document.getElementById("hello")

// 获取该元素所属的 document
console.log(hello.ownerDocument)
```

测试获得 nodeList

```javascript
// 获取 nodeList
var list = document.getElementsByTagName('h1')
console.log(list)

// 打印节点中的 node 即 element
console.log(list.item(0))
console.log(list[0])

// 打印 node 所属的 document
console.log(list[0].ownerDocument)
```

测试创建 element

```javascript
// 创建一个节点
var h2 = document.createElement('h2')

// 为该节点设置属性
h2.setAttribute('id', 'insertH2')
// 为该节点添加文本内容
h2.innerHTML = '我是被创建的 h2'
console.log(h2)
// 添加到文档中
var hello = document.getElementById("hello")
// 先定位到 hello,然后找到它的父节点,这里是 body,然后插入到DOM树 body 节点下面的最后一个节点后面
hello.parentNode.appendChild(h2) 

// 获得我们创建的 h2
var getH2 = document.getElementById('insertH2');
console.log(getH2)
```

测试设置 element 的样式

```javascript
// 获得我们创建的 h2
var getH2 = document.getElementById('insertH2');
// 获得 h2 的样式
console.log(getH2.style)
var h2Style = getH2.style
// 设置样式
h2Style.setProperty('color', 'red')
h2Style.setProperty('background', 'green')

// 获得指定样式
var color = h2Style.getPropertyValue('color')
console.log(color)
```

测试绑定事件监听器

<mark>事件种类：[参考](https://developer.mozilla.org/zh-CN/docs/Web/Events)、事件冒泡和捕获、事件回调</mark>

```javascript
// 为 h2 注册监听器
h2.addEventListener('click', function(e) {
  console.log(e)
  console.log(this)
  getH2.style.setProperty('background', 'yellow')
})
```

测试 window.content

```javascript
// window 相关
// 返回主内容窗口的 Window 对象
var windowObj = window.content
console.log(windowObj)  // 具有浏览器兼容性
```

测试 window.onload

```javascript
// window 相关
// 在文档装载完成后会触发 load 事件
window.onload = function() {
  alert('Window 资源已完成加载')
}
```



```javascript
// window 相关
// 将信息打印到 (本地) 控制台（console）firefox 用
window.dump('111')
```

测试 window.scrollTo()

```javascript
// window 相关
// 滚动到文档中的某个坐标。
function move() {
  window.scrollTo(300, 200) // (x, y) 横坐标 纵坐标
}
```



## 三、BOM

BOM 是 Browser Object Model，浏览器对象模型。DOM 是为了操作文档出现的接口，那么 BOM 顾名思义其实就是为了控制浏览器的行为而出现的接口。



## 四、重要特性

### 1、自执行匿名函数

```javascript
// js 为了实现模块化提出了如下方式
// 自执行匿名函数
// 形式 (function() {})()
// 前面的 (function(){}) 是匿名函数, 最右边的 () 表示立即执行函数表达式，JavaScript 引擎到此会直接执行函数
var calculate = (function() {
  function add(x, y) {
    return parseInt(x) + parseInt(y);
  }

  function sub(x, y) {
    return parseInt(x) - parseInt(y);
  }

  return {
    add,
    sub
  }
})();

// 外部的立即执行函数表达式可以传递参数给内部的匿名函数
function test() {
  for(var i = 1; i < 5; i++) {

    (function(e) {
      console.log(e);
    })(i)
  }
}

// 对于上边的 calculate 模块，我们如果想要扩展方法，可以这样干
var calculate = (function(cal) {

  cal.mul = function(x, y) {
    return parseInt(x) * parseInt(y);
  }

  return cal;
})(calculate || {}) // 这里的意思是如果前面没有 calculate 就传一个空对象，相当于创建新的模块
```

自执行匿名函数是 js 闭包特性的一种应用

### 2、闭包

```javascript
// js 的闭包有些类似 Java 中向匿名内部类传递参数
// 如果自执行匿名函数想要访问外部变量，可以在外部的 () 中传递参数
// 闭包让你可以在一个内层函数中访问到其外层函数的作用域
// 下面的函数非常有意思, makeAdder 相当于一个函数工厂，用于生成多个函数
function makeAdder(x) {
  return function (y) {
    return x + y;
  };
}

var add5 = makeAdder(5);  // 这里其实是获得了一个新的函数
var add10 = makeAdder(10); 

console.log(add5(2));  // 7
console.log(add10(2)); // 12
// add5 和 add10 其实都是闭包。它们共享相同的函数定义，但是保存了不同的词法环境

// 通常你使用只有一个方法的对象的地方，都可以使用闭包。（和 Java 的函数式编程 + Lambda 非常相似）
// 闭包也可以用来模拟私有方法

// 这里提一下循环闭包中使用 var 作用域提升导致的问题
// 解决思路：函数工厂、匿名闭包(自执行匿名函数)、let
// 注意：闭包在处理速度和内存消耗方面对脚本性能具有负面影响。
```







# JQuery

JQuery 是一个注重简化 DOM 操作、AJAX 调用和 事件处理的 JavaScript 库。

<br />

JQuery 使用 `$(selector).action()` 的格式给一个（或多个）元素绑定事件。

具体来说，`$(selector)` 让 JQuery 选择匹配 CSS 选择器 `selector` 的元素，并将它/它们传递给叫做 `.action()` 的事件 API。

<br />

比如：

```javascript
$(document).ready(function(){
  alert("Hello World!");
  $("#blackBox").hide();
});

// 等价于

window.onload = function() {
  alert( "Hello World!" );
  document.getElementById("blackBox").style.display = "none";
};
```



CND:

```html
<script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.js"></script>
```





几个特性：

- 链式调用
- 读写合一：`.action()` 不传参数就是读，传参就是写
- 隐式遍历





> 不同版本

- 1.x：兼容老版本 IE、但是文件更大
- 2.x：部分 IE8 及一下不支持、文件小，执行效率更高
- 3.x：完全不再支持 IE8 及以下版本，提供了一些新的 API、提供不包含 ajax/动画API的版本



> 两个重要的概念

- jQuery 核心函数

简介

```javascript
(function(window) {
  var jQuery = function() {
    return new jQuery.fn.init()
  }
  
  window.$ = window.jQuery = jQuery
})(window);
```

作为一般的函数调用：`$(param)`

- 参数为函数：当 DOM 加载完成后，执行此回调函数
- 参数为选择器字符串：查找所匹配的标签，并将它们封装为 jQuery 对象
- 参数为 DOM 对象：将 dom 对象封装成 jQuery 对象
- 参数为 html 标签字符串（要求是完整的标签，有闭合的那种，但是这种形式用得少）：创建标签对象并封装成 jQuery 对象







- jQuery 核心对象

作为对象使用：`$.xxx()`

例如：`$.each()`：隐式遍历对象



## 一、常用方法

### 1、入口函数

```javascript
$(function() {
  // 此处是页面 DOM 加载完成的入口
});

$(document).ready(function() {
  // 此处是页面 DOM 加载完成的入口
});
```





### 2、顶级对象 $

$ 相当于原生 JavaScript 中的 Window。把元素利用 \$ 包装为 JQuery 对象，就可以调用 JQuery 方法。



### 3、原生 js 对象和 JQuery 对象

Jquery 对象是对原生 js 对象包装后产生的结果（**伪数组形式**）



## 二、案例

案例一：表格奇数行变色

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
  <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.js"></script>

  <style>
    #container {
      width: 500px;
      height: 700px;
      margin: 0 auto;
    }

    table {
      width: 100%;
      border: 1px solid;
      border-collapse: collapse;
    }

    td {
      text-align: center;
      height: 65px;
      width: 100%;
      border: 1px solid;
    }

    tr {
      padding: 0;
      margin: 0;
    }
  </style>

</head>
<body>
  
  <div id="container">
    <table>
      <tr><td>1111111</td></tr>
      <tr><td>1111111</td></tr>
      <tr><td>1111111</td></tr>
      <tr><td>1111111</td></tr>
      <tr><td>1111111</td></tr>
      <tr><td>1111111</td></tr>
      <tr><td>1111111</td></tr>
      <tr><td>1111111</td></tr>
    </table>
  </div>

  <script>

    $(function() {
      $('#container table:first tr:odd').css('background', 'deepskyblue')
    });
  </script>

</body>
</html>
```



案例二，tab 切换

```javas
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
  <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.js"></script>
  <style>
    ul {
      width: 200px;
      list-style: none;
      border: 1px solid;
      width: 573px;
    }

    ul li {
      display: inline-block;
      border: 1px solid;
      margin: 0px 65px;
      padding: 0px 17px 
    }

    #container > div {
      border: 1px solid;
      display: inline-block;
      width: 200px;
      height: 200px;
      text-align: center;
    }
  </style>
</head>
<body>
  
  <h2>多 Tab 点击切换</h2>
  <ul id="tab">
    <li id="tab1" value="1">1</li>
    <li id="tab2" value="2">2</li>
    <li id="tab3" value="3">3</li>
  </ul>

  <div id="container">
    <div id="content1" style="background-color: antiquewhite;">xxxx1111</div>
    <div id="content2" style="background-color: rgb(228, 133, 9);">xxxx2222</div>
    <div id="content3" style="background-color: rgb(37, 117, 223);">xxxx3333</div>
  </div>
  <script>

    // 获取所有 div 块
    var $contents = $('#container > div')
    $contents.css('display', 'none')

    // 方式一
    // 给 3 个 li 加监听
    // $('#tab > li').click(function() {  // 隐式遍历
      
    //   $contents.css('display', 'none')

    //   // 得到当前点击的 li 在兄弟中的下标
    //   var index = $(this).index()
    //   $contents[index].style.display = 'inline-block'
    // })

    // 方式二
    var curIndex = 0
    $('#tab > li').click(function() {  // 隐式遍历
      
      $contents[curIndex].style.display = 'none'

      var index = $(this).index()
      $contents[index].style.display = 'inline-block'

      curIndex = index
    })
  </script>
</body>
</html>
```

