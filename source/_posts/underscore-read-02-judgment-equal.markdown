---
layout: 	post
title:		"underscore.js 源码之 比较两个数相等"
date:       2017-06-07 13:24:00
tags:
    - JavaScript
    - UnderScore
---

继续上一篇讲的 underscore.js 判断工具，还剩下 `_.isEqual()` 方法没讲。  
`_.isEqual()` 方法是用来判断两个数「相同」。此时问题来了，相同的定义是什么？是 === 吗，如果仅是这样，那就没有必要写这个函数了。  
举个例子，`1 === new Number(1)` 返回的是 false ，而 `isEqual()` 方法判定位相等，因为他们都是 `[object Number]` 类型。  
在比如 `[1] === [1]`，在 JS 中也返回 false，这就很没道理不是，在 `isEqual()` 函数中会对数组进行遍历，比较数组每个数是否相同。 
在看代码之前，先来复习一下 JS 比较的一些概念。  

### JS 的 相等与全等  

相等(==) —> 先转换后比较，全等(===) —> 不转换直接和比较。  
在进行转换类型中，有如下规则：

1. true -> 1, false -> 0
2. 如果是字符串和数值比较，先将字符串转为数组
3. 如果操作数是对象，则使用 valueOf() 方法转为基本类型在进行判断
4. null == undefined
5. NaN != NaN

而全等则不进行比较，比如 1 与 new Number(1)。`typeof 1 = Number` ，`typeof new Number(1) = object`。所以二者是不相等的。

`isEqual()` 方法则是在「全等」的基础上，在添加了一些规则，比如数组和对象的判断，类型相等根据 `toString()` 方法来判断等。  

### +0，+a 和 ''+a

##### +0 === -0

在 JS 中 `+0 === -0 -> true`。而在 isEqual 中则判定为 false  
至于原因，我想应该是 `1/0 = Infinity, 1/-0 = -Infinity` 吧。  

##### +a 与 ''+a

`+a` 意思是将变量转为数字，`''+a` 则是转为字符串

知道了这些 isEqual() 前半部分的代码就很清晰了      

```js
// a 与 b 是否全等，若 a === 0 则需要判断 +0 -0;
if (a === b) return a !== 0 || 1 / a === 1 / b;
// 如果其中有一个是 null，全等判断
if (a === null || b === null) return a === b;

var type = toString.call(a);
// 如果 toString() 类型不相等判定为 false
if (type !== toString.call(b)) return false;
  
switch (type) {
  // 如果是 RegExp 和 String 属性，都可以比较字符串是否相等
  case '[object RegExp]' :
  case '[object String]' :
    return '' + a === '' + b;

  // number 类型要考虑 +0 === -0 这种情况
  case '[object number]' :
    
    if (+a !== +a) return +b !== +b;
    
    return +a === 0 ? 1 / +a === 1 / +b : +a === +b;

  // Date 和 Boolean 类型转为数字判断
  case '[object Date]' :
  case '[object Boolean]' :
    return +a === +b;

}
```

接下来，就是函数数组的判断

### 函数判断  

```js
var isArray = toString.call(a);

if (!isArray) {
    
    if (typeof a !== 'object' || typeof b !== 'object')
        return false;
    // 到这部之前排除非 object 对象

    var aCtor = a.constructor, bCtor = b.constructor;
    // 判断是否是同一个 constructor
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
            _.isFunction(bCtor) && bCtor instanceof bCtor)
            && ('constructor' in a && 'constructor' in b)) {
        return false;
    }
}
```


### 数组与对象的判断  

数组和对象由于存在多重嵌套，最好的方法就是使用回调函数  

我们在调用函数时，`_.isEqual(a,b)` 传入两个要比较的函数。而函数实际上定义了 4 个形参 `function(a, b, aStack, bStack)`; 后两个函数在回调时会被添加，用于线性搜索？这里我也不是恨懂  

```js
aStack = aStack || [];
bStack = bStack || [];
var length = aStack.length;
while (length--) {
  // Linear search. Performance is inversely proportional to the number of
  // unique nested structures.
  if (aStack[length] === a) return bStack[length] === b;
}

// Add the first object to the stack of traversed objects.
aStack.push(a);
bStack.push(b);
```

这里不是看得恨懂，不清楚什么结构会调用 while 里面的语句，aStack 储存的是所有的数组元素。先继续往下看  

```js
// 数组
if (isArray) {
    length = a.length;

    if (length !== b.length) return false;

    while (length--) {
        // 回调，深遍历。同时也传入 aStack 与 bStack
        if(!_.isEqual(a[length], b[length], aStack, bStack))
            return false;
    }
} else {
    // 对象，同上面数组
    // _.keys 是 underscore 方法，用于储存对象 key 值，返回一个数组
    var keys = _.keys(a), key;
    length = keys.length;

    if (length !== _.keys(b).length) return false;

    while (length--) {
        key = keys.length;

        if (!(_.has(b, key) && _.isEqual(a[key], b[key], aStack, bStack)))
            return false;
    }
}

return true;
```

整个代码思想也很好理解，如果是数组，则采用回调传入 a[length] 和 b[length] 进行遍历比较，如果都符合则一路通过，最后输出 true。  
唯一难理解的是 传入的 aStack ` if (aStack[length] === a) return bStack[length] === b; ` 不知道什么样的数组结构才会进行此判断。

That's all ，underscore源码 <a href="https://github.com/hanzichi/underscore-analysis/blob/master/underscore-1.8.3.js/src/underscore-1.8.3.js#L1094-L1190" target="_blank">这里</a>