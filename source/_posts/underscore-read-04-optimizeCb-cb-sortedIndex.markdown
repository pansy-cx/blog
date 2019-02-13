---
layout: 	post
title:		"underscore.js 源码之 optimizeCb cb 和 sortedIndex"
date:       2017-06-09 12:24:00
tags:
    - JavaScript
    - UnderScore
---

数组部分的代码要从哪开始写，我纠结了很久。数组部分用到了大量别的部分的方法，在讲数组部分的核心代码实现时，免不得要写把那些常用的工具代码先弄懂。  
我思前想后，打算先从 optimizeCb 和 cb 这两个函数入手。而 sortedIndex(二分查找) 恰恰用到了 cb 函数的大部分功能，所以感觉放在一起看的话会比较容易理解。  

### optimizeCb

首先先看这段代码的注释：
>Internal function that returns an efficient (for current engines) version of the passed-in callback, to be repeatedly applied in other Underscore functions.

这是个用于优化回调的函数，代码如下  

```js
var optimizeCb = function(func, context, argCount) {
    // 如果没有传入指定函数上下文，直接返回函数本身
    if (context === void 0)
      return func;

    // 提前确定传入函数的数量(argCount)
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    // 被优化的是 apply
    return function() {
      return func.apply(context, arguments);
    };
  };
```

这段函数不难看懂，但不结合具体函数分析，初学者(我)刚看时会有点懵逼，不知道这是在干嘛。  
其实 optimizeCb 就是用来绑定 this，和传入参数，最简单的方法就是使用 `fun.apply(this,arguments);` 但是由于 apply 会对传入的数组(arguments) 进行一系列的检验和拷贝，所以性能上不如 call。  
optimizeCb 方法首先会根据 argCount 个数来确定传入参数的个数，用 switch 循环来来尽量使用指定参数而不用 arguments。当然已现在的环境来看，已经没什么必要手动写这类优化了，了解一下这个函数的作用就好。<a href="https://github.com/jianjiade/javascript-frame-lib-analyse/issues/4" target="_blank">关于underscore.js中optimizeCb函数中是否需要switch的问题的解答</a>   

### sortedIndex

本来是要先看 cb 这个函数的，但我觉得，在不知道这函数的使用场景下，看这函数，想了解他的意图是很困难的，庆幸的是。sortedIndex 就使用了 cb 函数的大部分功能。所以我们先看 sortedIndex。

`_.sortedIndex(array, obj, [iteratee], [context])` 使用二分查找确定 obj 在 array 中的位置序号，obj 按此序号插入能保持 array 原有的排序，例如 `_.sortedIndex([1,2,3,4,5],3.5)` 就在 3 与 4 中插入 3.5 返回 3.5 的位置 3  

```js
_.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    
    // 二分法
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value)
        low = mid + 1;
      else
        high = mid;
    }

    return low;
};
```

代码很简单，根据 iteratee 作为 array 排序的依据，包括传递的 obj。通过对比 `iteratee(array[mid])` 与 `iteratee(obj)` 来查找 obj 所在的位置。  
现在问题来了 `iteratee = cb(iteratee, context, 1);` 这行代码执行了什么功能。

### cb

注释如下：
>A mostly-internal function to generate callbacks that can be applied to each element in a collection, returning the desired result — either identity, an arbitrary callback, a property matcher, or a property accessor.  

大致的意思就是根据传入的参数不同返回不同的函数。我们来看下代码  

```js
var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
};
```

其中 value 传入函数，对象，字符串或不传入都会调用不同的方法。  
我们在回过头来，看看 `_.sortedIndex()`  

##### value == null

当只传入 array 与 obj 时，iteratee 为空， `cb()` 判断 `value == null` 返回了一个 `_.identity` 方法。  

```js
_.identity = function(value) {
    return value;
};
```

代码很简单，就是返回传入的 value 值。  

此时的 iteratee 就返回了一个函数  

```js
iteratee = function(value) {
    return value;
}
```

所以 `iteratee(obj)` 和 `iteartee(array[mid])` 都是返回本身，直接进行比较。  

```js
_.sortedIndex([1,2,3,4,5],3)    // 2
```

###### _.isFunction(value)

如果 value 是函数，则返回 `optimizeCb(value, context, argCount);` 此时的 `argCount = 1`。举个例子  

```js
_.sortedIndex([2,4,6,8,10], 3, function(num) {return num / 2 })  // 1
```

此时 iteratee 就是一个函数，array 就变成了 [1,2,3,4,5], obj 就变成了 1，在对其进行二分查找。  

##### _.property(value);

若 value 不是函数，空值和对象，则返回一个 `_.property(value)` 方法

```js
_.property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    }
};
```

照样拿 sortedIndex 举例  

```js
var stooges = [{name: 'moe', age: 40}, {name: 'curly', age: 60}];
_.sortedIndex(stooges, {name: 'larry', age: 50}, 'age');    // 1
```

iteratee 返回一个函数，这个函数则返回任何传入对象的 key(即'age') 属性  
`value = iteratee(obj) = 50`， `iteratee(stooges(i))` 则分别返回 40 和 60 。然后在进行二分查找

--- 

最后还剩下一个 value 为对象的情况，也是大同小异，由于 sortedIndex 不太适合传入对象，就不在赘述。可以根据源码追查一下 `_.isMatch()` 方法的作用。
