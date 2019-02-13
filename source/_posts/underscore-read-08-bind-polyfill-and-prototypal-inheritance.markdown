---
layout:     post
title:      "underscore.js 源码之 bind 方法和原型式继承"
date:       2017-06-11 15:36:00
tags:
    - JavaScript
    - UnderScore
---

### call() and apply()

call() 和 apply() 都是用于改变函数上下文而存在，即修改内部 this 指向

```js
var obj = {
    x: 10
};
var getX = function() {
    return this.x;
}

console.log(getX())     // undefined
console.log(getX.call(obj))     // 10
```

### bind()

bind() 和 call()、apply() 函数一样，也是改变 this 指向。  
bind() 方法创建一个新的函数, 当被调用时，将其 this 关键字设置为提供的值，在调用新函数时，在任何提供之前提供一个给定的参数序列。  
什么意思呢，举个例子  

##### 创建绑定函数

依然是上面那个代码  

```js
console.log(getX.bind(obj)) 
/*
 * function () {
 *   return this.x;
 * }
 * 创建一个函数
 */
console.log(getX.bind(obj)())   // 10
```

bind() 方法返回一个函数，继承 getX 方法和将 this 绑定给了 obj  

##### 给定参数序列  

bind() 的另一个常用方法为给定函数的参数序列，作为 bind() 的第二个参数跟在 this 后面。也称偏函数(Partial Functions)。看看使用方法  

```js
function list() {
  return Array.prototype.slice.call(arguments);
}
var bindList = list.bind(undefined, 5);

console.log(bindList(1,2,3,4))  // [5,1,2,3,4]
```

bind() 的第二个参数开始，会作为预设值传递给返回的函数  

### polyfill

bind() 在 ES5 中才被加入，看看 MDN 给的 polyfill 是怎么写的  

```js
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    // this 为 func.bind() 中的 func
    if (typeof this !== "function") {
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
    // 除了传入的第一个参数用于绑定，其他参数会被预设为返回函数的传入值
    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          /* instanceof 这步不是很理解，fNop 应该是空函数
           * oThis 不存在时，传入的 this 为返回函数当前执行的 this
           * Array.prototype.slice.call(arguments) 是调用返回函数时传入的参数
           * 把 bind 时预设的参数和后面传入的参数 concat 拼接在一起
           * 使用 apply 绑定 this 和参数
           */
          return fToBind.apply(this instanceof fNOP
                                 ? this
                                 : oThis || this,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };
    // 返回函数继承 oThis 的原型链
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}
```

代码的思路大致如下  
- 判断被绑定函数是否为函数
- 将 bind() 第二个及后面参数和返回函数的传入参数添加到一起
- 创建一个新函数，使用 apply 绑定 this 和参数
- 添加新函数原型链，继承自绑定对象

函数实现依赖于 slice() concat() apply() 这些原生方法，并且创建的函数具有 prototype ，bind()没有。所以关于 prototype 这部分不是恨懂为什么要添加。  

### 原型式继承

刚才 polyfil 一段代码  

```js
fNOP = function () {};
fNOP.prototype = this.prototype;
fBound.prototype = new fNOP();
```

这种方式被称为原型式继承(Prototypal Inheritance)，《JavaScript 高级程序设计》里有介绍  
原型式继承借助原型可以基于已有对象创建新对象，同时还不必因此闯将自定义类型，实现函数如下  

```js
function object(o) {
    function F(){};
    F.prototype = o;
    return new F();
}
```

从本质上讲，object() 对传入函数执行了一次浅复制。  

在 ES5 中添加了 Object.create() 方法来规范原型式继承 <a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create" target="_blank">Object.create</a>

在 underscore.js 代码中也出现了类似的方法，看看是如何实现的  

```js
var Ctor = function(){}     // 全局的一个空函数
var baseCreate = function(prototype) {
    
    if(!_.isObject(prototype)) return {};
    // 如果支持原生 Object.create()
    if(nativeCreate) return nativeCreate(prototype);

    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;

    return result;
  };
```

方法也是一样的，通过这方法就可以很方便的创建原型式继承的函数


--- 

其实此篇文章和 underscore.js 源码关系不大，我看源码 1.8.3 的实现方法有问题，在浏览器下会报错，所以这是我根据 polyfill 自己实现的 _.bind() 方法，顺便复习一下 bind() 函数的作用。  

```js
_.bind = function(func, context) {
    // 如果支持原生 bind 方法
    if (nativeBind) 
      return nativeBind.apply(func, slice.call(arguments, 1));

    if(!_.isFunction(func))
      throw new TypeError('bind must be a function');
    var aArgs = slice.call(arguments, 2);
    var fBound = function() {
      return func.apply(context || this, aArgs.concat(slice.call(arguments)));
    };
    // 原型式继承
    fBound.prototype = baseCreate(this.prototype);

    return fBound;
  };
```


参考文章：
- 《JavaScript 高级程序设计》
- <a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Compatibility" target="_blank">MDN - Function.prototype.bind()</a>
- <a href="http://web.jobbole.com/83642/" target="_blank">伯乐在线 - 深入浅出妙用 Javascript 中 apply、call、bind</a>



