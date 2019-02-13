---
layout:     post
title:      "underscore.js 源码之 整体架构"
date:       2017-06-15 17:16:00
tags:
    - JavaScript
    - UnderScore
---

这应该是源码阅读的最后一篇了，当然源码远不止这些，我只是提取出了在阅读中对我有帮助，值得记忆的地方来写文章。其中还有一些方法，比如 _.template()，这涉及到模板引擎 MVC 等知识，属于我下一个学习目标，在这里就先跳过。  

### 方法调用

underscore 开放一个接口 `_`，和 jQuery 的 `$` 相似  

```js
var _ = {}
_.keys = function() { /* */}

this._ = _;     // 暴露给全局
```

然而源码的 `_` 不只是一个空对象，而是一个方法  

```js
var _ = function(obj) {
  // 如果 obj 是已创建的对象，则直接返回
  if (obj instanceof _)
    return obj;
  // 如果当前调用函数上下文不是 _ 对象（比如 window），new 构造函数
  if (!(this instanceof _))
    return new _(obj);
  
  // 此时 this 必定是 _ , _.wrapped 保存 obj 参数
  this._wrapped = obj;
};
```

这有什么用呢？，这涉及到 OOP 调用

### OOP

```js
_([1,2,3]).each(console.log);
```

这就是无 new  构造， ` _([1,2,3]) ` 先判断 `!(this instanceof _)` 为 true，返回 `new _(obj)` 在执行一次，保存 `_wrapped = [1,2,3]`。然后构造实例要调用 each 方法，each 方法被添加在了 prototype 上，所以可以顺利调用。

### 添加方法到 prototype

要让构造实例也能访问 each 等方法，就需要把方法添加到原型链上，源码通过 `_.mixin()` 实现了这个方法  

```js
_.mixin = function(obj) {
  // _.functions(obj) 判断 obj 上的 funcion 属性
  _.each(_.functions(obj), function(name) {
    var func = _[name] = obj[name];
    // 把方法添加到原型链上
    _.prototype[name] = function() {
      // 保存参数
      var args = [this._wrapped];
      push.apply(args, arguments);

      return result(this, func.apply(_, args));
    }
  })
};

var result = function(instance, obj) {
  return instance._chain ? _(obj).chain() : obj;
};

_.mixin(_);
```

先不看 result 函数，添加到原型链的方法返回一个函数，调用本身 `func.apply(_, args)` 其中 args 为 `_.wrapped` 的值和函数可能传递的值的集合。  
此时的方法就被添加到了原型链上，就可以在构造函数中调用方法。  

### 链式调用

```js
// chain 方法的链式调用
_.chain([1,2,3])
    .map(function(a) {return a * 2;})
    .each(console.log);     // 报错

// OOP 式的链式调用
_([1,2,3])
    .map(function(a) {return a * 2;})
    .each(console.log);
```

如果要使用链式调用，则需要在每个函数最后  `return this` 语句，后一个方法才能继续使用。 

而 _.chain() 调用方式正是用于解决这个问题   

```js
_.chain = function(obj) {
  // 构造函数
  var instance = _(obj);
  instance._chain = true;
  return instance;
}
```

也是把 obj 值给 _，创建构造函数，而赋予 `._chain` 为 true，`return result()` 就会返回不同结果。  

```js
var result = function(instance, obj) {
  return instance._chain ? _(obj).chain() : obj;
};
```

此时 `instance._chain` 为 true，函数继续返回 `_(obj).chain()` 让下一个方法继续添加链式条件





