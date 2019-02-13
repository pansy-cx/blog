---
layout:     post
title:      "JavaScript this(闭包) 问题"
date:       2016-08-23 13:30:00
tags:
    - JavaScript
---

HTML

```html
<p>一</p>
<p>二</p>
<p>三</p>
<p>四</p>
<p>五</p>
```

JavaScript

```js
function bindFn() {
    var pAry = document.getElementsByTagName('p')
    for ( var i = 0; i < pAry.length; i++ ) {
        pAry[i].onclick = function() {
            alert(i)
        }
    }
}
bindFn()
```

此导航栏，不管点哪，每次输出都是 5，而不是点击每个 p，就 alert 出对应的 0, 1，2，3，4 

### 原因

JavaScript 引擎执行到这一段时，for 循环将函数绑定到了 DOM 上，当用户点击 DOM 事件时，执行 `alert(i)`，此时运行环境为全局，`bindFn()` 函数已执行完毕，理应找不到 i 才对。

所以为解决这个问题，JavaScript 引入了闭包这个功能，若函数返回的函数语句里带有该函数的变量，变量不会被销毁，而是存在于内存里，而此时内存里的 i 已经经过循环，所以返回的都是 5

### 解决

#### 立即执行函数

```js
function bindFn() {
    var pAry = document.getElementsByTagName('p')
    for (var i = 0; i < pAry.length; i++) {
        pAry[i].onclick = (function(i) {
            return function() {
                alert(i)
            }
        })(i)
    }
}
bindFn()
```

绑定时，立即执行一个函数，返回一个函数绑在 DOM 上，此时这个绑定的函数内 存的 i 是各不相同的，这样就可以解决。

#### let

> 更新

ES6 发布后，添加了新的变量，let 的意思是只在当前大括号内生效。使用 let 变量不仅可以解决闭包问题，还可以防止内存泄漏，故如今已不推荐使用 var。

在浏览器还未完全支持 ES6 语法的情况下，新功能需要通过 babel 转为 ES5 语法，ES5 对于 let 的转换也是使用闭包来解决。

![](http://p8hsqsg3r.bkt.clouddn.com/babel-let-change.png)


