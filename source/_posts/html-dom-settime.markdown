---
layout:     post
title:      "HTML DOM 计时器"
date:       2016-08-23 13:10:00
tags:
    - JavaScript
---

HTML DOM 计时器有3种，分别是

- setInterval
- setTimeout
- requestAnimationFrame

### setInterval:  

使用方法：`setInterval(function,time)`  

`setInterval()` 方法可按照指定的周期（以毫秒计）来调用函数或计算表达式。  
`setInterval()` 方法会不停地调用函数，直到 `clearInterval()` 被调用或窗口被关闭。由 `setInterval()` 返回的 ID 值可用作 `clearInterval()` 方法的参数。

#### setTimeout:

使用方法：`setInterval(function,time)`

`setTimeout()` 方法用于在指定的毫秒数后调用函数或计算表达式。  
`setTimeout()` 只执行 code 一次。如果要多次调用，请使用 `setInterval()` 或者让 code 自身再次调用 `setTimeout()`
`setTimeout()` 和 `setInterval()` 的区别在于 `setTimeout()` 只执行一次，而且是在设定时间过后执行。而 `setInterval()` 是从一开始开始执行，除非碰到 `clearInterval()` 函数或浏览器关闭才停止。

#### requestAnimationFrame:

使用方法：`requestAnimationFrame(function)`

`requestAnimationFrame` 为浏览器厂家专门为做动画准备的一个属性。简单的讲，`requestAnimationFrame` 可以依据设备性能来确定每次回调的时间，以免时间设定的比 function 的加载时间短而导致掉帧等错误，并且对于同时进行的 n 个动画，浏览器能够进行优化，把原本需要 N 次 reflow 和 repaint 优化成 1 次，这样就实现了高质量的动画。  
`requestAnimationFrame` 的不足之处在于兼容性，添加以下代码来进行简单的兼容：

```javascript
window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame || 
            window.oRequestAnimationFrame || 
            window.msRequestAnimationFrame ||
            function(callback, element) {
                return window.setTimeout(callback, 1000 / 60);
            };
})();
```

