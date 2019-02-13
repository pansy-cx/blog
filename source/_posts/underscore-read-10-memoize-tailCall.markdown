---
layout:     post
title:      "underscore.js 源码之 缓存优化与尾调用"
date:       2017-06-15 10:27:00
tags:
    - JavaScript
    - UnderScore
---

### 斐波纳数列

斐波纳数列就是一串数列，后一项等于前两项之和，比如 1,1,2,3,5,8,11...  
用 JS 计算第 n 个数的数字  

```js
function Fibonacci (n) {
  if ( n <= 1 ) {return 1};
  return Fibonacci(n - 1) + Fibonacci(n - 2);
}
```

这么写有严重的性能问题，每次调用递归非常耗费内存，每次递归都会保存上一次执行帧，所以当 Fibonacci(100) 时，就会发生堆栈溢出  

优化方案有几种  

### 1. 记忆缓存

memoize 方案在《JavaScript 忍者秘籍》里有提到，将昂贵的计算通过变量缓存起来，看看 underscore 是怎么写的  


```js
_.memoize = function(func, hasher) {
    var memoize = function(key) {
      // 如果有 hasher 函数，根据 hasher 函数进行求值
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      // 如果缓存不存在，添加缓存
      if(!_.has(memoize.cache, address)) {
        memoize.cache[address] = func.apply(this, arguments);
      }
      
      return memoize.cache[address];
    };

    memoize.cache = {};
    return memoize;
};
```

函数将已有变量缓存在 memoize.cache 内，减少计算

### 迭代

这是另一种方法了，即不使用递归，而使用 for 循环，毕竟循环比递归所需要的性能小的多  

### 尾调用

尾调用的意思是指在函数最后一步是调用另一个函数  

```js
function f(x) {
    return g(x);
}
```

下面这情况则不是尾调用

```js
function f(x) {
    return g(x) + 1;
}
```

尾调用的特殊之处在于他的调用  

函数调用会在内存中生成一个调用帧，里面储存的是函数调用的变量等信息，在 f(x) 内调用了 g(x)，会在 g(x) 运算结束后返回给 f(x), g(x) 才会消失，若 g(x) 又调用了 h(x).... 以此类推，会形成一个调用栈，当调用次数太多，像 Fibonacci(100) ，会使调用栈溢出。  

而尾调用则不一样，尾调用时函数最后一步操作，不需要保存外层函数的调用帧，比如 `return g(x) + 1` 最后一步是 `g(x) + 1`，就不符合。  
因为尾调用最后一步操作是另一个函数，与外层函数无关，所以用内层函数取代外层函数调用帧即可。此时调用帧只有一层，大大的优化了性能，比如一个阶层函数

```js
function factorial(n, total) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}
factorial(100, 1);      // 9.332621544394418e+157
```

### 参考
- 《JavaScript 忍者秘籍》
- <a href="http://es6.ruanyifeng.com/#docs/function#尾调用优化" target="_blank">ES6 尾递归</a>

