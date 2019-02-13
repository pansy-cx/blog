---
layout: 	post
title:		"underscore.js 源码之 JavaScript 常见类型判断"
date:       2017-06-06 15:38:00
tags:
    - JavaScript
    - UnderScore
---

underscore.js 封装了一些常用类型判断的方法，归类于 Objects 方法内。由于源码很多方法都用到了类型判断，所以打算先从类型判断讲起。  

### void 0 代替 undefined

undefined 并不是 JS 保留字，在低版本 IE 下可被重写，在 ES5 中为全局对象的一个只读属性，但在局部作用域中仍然可被重写。  
而 void 运算符为对给定表达式进行求值，然后返回 undefined 。所以 underscore.js 内采用 void 0 代替 undefined。  

### Object.prototype.toString()

在 JavaScript 里使用 typeof 来判断数据类型，只能区分基本类型，即 'number'，'string'，'undefined'，'boolean'，'object' 五种。对于数组、函数、对象来说，其关系错综复杂，使用 typeof 都会统一返回 'object' 字符串。这时我们就得用到 Object.prototype.toString() 方法  

Object.prototype.toString() 在 ECMA 中的解释：  

>When the toString method is called, the following steps are taken:  
>1、Get the [[Class]] property of this object.  
>2、Compute a string value by concatenating the three strings “[object “,Result (1), and “]”.  

代码实现如下  

```js
var toString = Object.prototype.toString;

console.log(toString.call([]));             //[object Array]
console.log(toString.call(''));             //[object String]
console.log(toString.call({a: '1'}));       //[object Object]
console.log(toString.call(arguments);       //[object Arguments]
console.log(toString.call(/./));            //[object RegExp]
console.log(toString.call(new Date()));     //[object Date]
console.log(toString.call(1));              //[object Number]
console.log(toString.call(true));           //[object Boolean]
console.log(toString.call(new Error()));    //[object Error]
console.log(toString.call(new Function())); //[object Function]

console.log(toString.call(undefined));      //[object Undefined]
console.log(toString.call(null));           //[object Null]

```

在 IE8 下 'Arguments','undefined','null' 这三个有 Bug，返回的是 Object

```js
// IE8 下
console.log(toString.call(arguments));      //[object Object]
console.log(toString.call(undefined));      //[object Object]
console.log(toString.call(null));           //[object Object]
```

null 和 undefined 判断不需要太复杂，分别用 ` obj === null ` 、和 ` obj === void 0 ` 判断即可。  
如果要同时判断 null 和 undefined ，使用 ` obj == null `。因为 `undefined == null`。  

arguments 则在 IE8 下通过特性检测是否含有 callee 属性值来判断 arguments  

```js
_.isArguments = function(obj) {   
    // null 时 hasOwnProperty 会抛出错误，要排除 null 的情况
    return Object.prototype.toString.call(obj) === '[object Arguments]' ||
             obj != null &&
             Object.prototype.hasOwnProperty.call(obj, 'callee');
};
```

Array 类型除了以上方法，ES5 还新增了 Array.isArray 方法  

```js
_.isArray = function(obj) {
    return Array.isArray ? Array.isArray(obj) : 
            Object.prototype.toString.call(obj) === '[object Array]';
  };
```

underscore.js 认为 function 也应属于 object  

```js
_.isObject = function(obj) {
    // !!obj 排除 null 的情况
    return typeof obj === 'function' || typeof obj === 'object' && !!obj;
};
```

其他的都直接使用 toString() 方法判断  

```js
// underscore 使用了自建的 _.each() 方法，我原生写了一个以防看不懂
(function(){
    var obj = ['Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 
            'Boolean'];

    for(var i in obj) {
      (function(i){
        var name = obj[i];
        
        _['is' + name] = function(obj) {
          return toString.call(obj) === '[object ' + name + ']';
        }
      })(i)
    }
})();
```

### 其他实用工具判断  

_.isEmpty 如果 object 不包含任何值(没有可枚举的属性)，返回 true。  
对于字符串和类数组 「array-like」 对象，如果 length 属性为 0，那么 _.isEmpty 检查返回 true。

```js
// 我写的也和源码不一样，我觉得这样好懂

_.isEmpty = function(obj) {

    // 排除 null 和 undefined
    if(obj == null)  return true;
    
    // 对象单独判断，判断 keys 的个数
    if(_.isObject(obj)) {
      var keys = [];

      for(var i in obj) 
        keys.push(i);

      return !keys.length;
    } 

    // 数组及类数组都含有 length 方法，统一判断
    return !(obj.length);
  };
```

判读是否是 DOM 元素

```js
_.isElement = function(obj) {
    // 排除 obj 为 null 或 undefined 时报错
    return !!(obj && obj.nodeType === 1);
}
```

isFinite 和 isNaN 都使用原生方法

```js
_.isFinite = function(obj) {
    // isFinite(null) 返回 true
    return obj != null && isFinite(obj);
};

_.isNaN = function(obj) {
    return _.isNumber(obj) && isNaN(obj);
};
```

--- 

这些几乎就是所有 undescore.js 判断方式，我把他重写了一遍，和源码还是有区别，可以去 GitHub 看看 这部分 <a href="https://github.com/hanzichi/underscore-analysis/blob/master/underscore-1.8.3.js/src/underscore-1.8.3.js#L1192-L1263" target="_blank">代码</a>  

当然，还少了一个 `_.isEqual()` 方法，比较复杂，打算单独留出一个篇幅，下一篇在写。