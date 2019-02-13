---
layout: 	post
title:		"underscore.js 源码之 闭包与 createAssigner 方法"
date:       2017-06-07 22:24:00
tags:
    - JavaScript
    - UnderScore
---

这篇我们来讲讲 underscore.js 的 `createAssigner()` 这个函数的作用与如何实现，在此之前。先来看看 **闭包** 这个概念  

### 闭包

《JavaScript 高级程序设计》 书中说：「闭包」是指有权访问另一个函数作用域的变量的函数。  
创建闭包的常见方式，是在一个函数内部创建另一个函数，看一下高程的例子。  

```js
function createComparisonFunction(propertyName) {
    return function(obj1, obj2) {
        var value1 = obj1[propertyName];
        var value2 = obj2[propertyName];

        if(value1 < value2) {
            <!--  -->
        }
    }
}
```

此时调用 `var compare = createComparisonFunction('name')` , compare 得到的是 return 的匿名函数。  
而在调用 `compare({name: 'a'}, {name: b});` 匿名函数仍然可以访问到变量 propertyName。之所以能够访问，是因为内部函数的作用域链中包含 `createComparisonFunction()` 的作用域。  
一般来说，在函数中访问一个变量，会优先在局部变量中查找，然后在进入全局域中查找，当函数执行完毕时，局部活动变量被销毁，内存中仅全局变量保留。而闭包又不同。  
在函数内部定义函数会将外部函数的活动对象添加到它的作用域中。如上代码，当 
`createComparisonFunction()` 函数在执行后，执行环境的作用域链会被销毁，而活动对象仍然在内存中，直到匿名函数被销毁。  

说到这，就想起经典的问题，即闭包只能取得函数中任何变量的最终值：

```js
function createFunction() {
    var result = {};

    for(var i = 0; i < 10; i++) {
        result[i] = function() {
            return i
        };
    }
    return result;
}
```

所以内部函数访问的闭包只有最终值 10，而不是 0 - 9。  

之所以写了这么多，是因为之前看的时候浑浑噩噩，不明所以。如今看了源码的 return function 的方法后，在回头看高程，才把这里看懂了，故记下以便将来查阅。 

### arguments  

记录自 《JavaScript 忍者秘籍》：
>当一个参数列表作为函数调用的一部分时，这些参数会按照函数声明里的形参顺序，依次赋值给这些形参。  
>如果传入的参数不一样，不会报错。如果传入的参数小于形参，剩下的形参会赋值为 undefined ，而传入的参数大于形参，则可以通过隐式参数 arguments 获取。

arguments 是传递给函数的所有参数的一个集合，是一个类数组对象，比如 arguments[2] 为传入的第三个参数。利用好这个特性，可以简化我们使用函数的方法 

### _.extend() 与 _.default() 方法  

官方文档是这么写这两个函数的作用的  
`_.extend(destination, *sources)`   复制 source 对象中的所有属性覆盖到 destination 对象上，并且返回 destination 对象. 复制是按顺序的, 所以后面的对象属性会把前面的对象属性覆盖掉(如果有重复)。  
`_.defaults(destination, *defaults)` 类似，不过只填充 destination 中 undefined 的属性。即不会将已有的属性覆盖掉。  
例如：  

```js
var destinate = {a:1, b:2};
var source = {b:3, d:4};

_.extend(a,b)        // {a:1, b:3, d:4};
_.default(a,b)        // {a:1, b:2, d:4};
```

源码中还有一个 `_.extendOwn()` 方法，文档中没有，区别就在与传入的是含继承过来的属性方法。  
这三个功能这么相似，看看 underscore 是怎么抽象出来的。  

```js
_.extend = createAssigner(_.keys);
_.extendOwn = createAssigner(_.allKeys);
_.default = createAssigner(_.keys, true);
```

他们都调用了 `createAssigner` 一个方法，不同的在于传入的参数。`_.keys` 是 underscore 方法，用于储存对象属性值，不含继承过来的属性。返回一个数组，而 `_.allKeys` 则包含继承的属性。  
`_.defult()` 则是传入的第二个参数。来看看 `createAssigner` 是怎么写的。  

```js
var createAssigner = function(keysFun, underfinedObj) {
    // 闭包，返回的函数仍可以获取 KeysFun 和 underfinedObj 两个参数
    return function(obj) {
        var length = arguments.length;
        
        // 传入的参数小于1 或者第一个为 null 直接返回
        if (length <2 && obj == null)  return obj;
        
        // 从 arguments 的第二个参数开始
        for(var index = 1; index < length; index++) {
            var source = arguments[index],
                /* 闭包传入的第一个参数是函数，_.keys 或 _.allKeys
                 * 调用  _.keys 或 _.allkeys 获取对象属性值
                 */
                keys = keysFun(source),
                l = keys.length;

            for(var i = 0; i < l; i++) {
                var key = keys[i];
                
                /*
                 * 不传入 underfinedObj参数 时，!underfinedObj = true，第二个不进行判断
                 * _.default 传入 true，判断第二个条件
                 * obj[key] === void 0 如果 obj[key] 不存在，才执行。就不覆盖已有属性
                 */
                if(!underfinedObj || obj[key] === void 0) {
                    obj[key] = source[key];
                }
            }
        }
        return obj;
    };
};
```

函数返回函数，并且返回的函数引用了外面的一个变量，就是上头讲的闭包。  
传入的变量与定义的形参不一定需要对应上。可以使用 arguments 去获取变量。  
使用 arguments 枚举除去第一个参数外的其他参数，然后将属性拷贝到第一个对象上。  

至此，Object 部分主要几个点都在这里了，类型判断，比较相同，还有闭包的方法。其他的类似 `_.keys`, `_.values` 方法都是很简单的方法，就不赘述了。