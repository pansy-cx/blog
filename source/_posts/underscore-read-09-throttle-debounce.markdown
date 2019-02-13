---
layout:     post
title:      "underscore.js 源码之 函数节流与去抖"
date:       2017-06-14 17:36:00
tags:
    - JavaScript
    - UnderScore
---

这周专业开始实习了，一个学测控的专业(电子信息)，实习居然学两周安卓开发 -.- ，所以我决定继续在课上看 JS 了......  

在 JS 中，有时候需要监听某些事件，比如滚动条滚动时间，滚动一次就会大量触发滚动事件，此时如果为这些时间绑定一些 DOM 操作，浏览器需要在短时间内大量计算，造成卡顿甚至崩溃。此时就需要为函数进行 throttle(节流) 或 debounce(去抖) 处理。  

- throttle 让一定时间段连续调用的函数在 x 秒内执行一次
- debounce 让一定时间段连续调用的函数只执行一次

<a href="https://blog.coding.net/blog/the-difference-between-throttle-and-debounce-in-underscorejs" target="_blank">浅谈 Underscore.js 中 _.throttle 和 _.debounce 的差异</a> 这篇文章形象的说明了两个函数的区别  

>- throttle 策略的电梯。保证如果电梯第一个人进来后，15秒后准时运送一次，不等待。如果没有人，则待机
>- debounce 策略的电梯。如果电梯里有人进来，等待15秒。如果又人进来，15秒等待重新计时，直到15秒超时，开始运送

### throttle

函数节流是对一段连续执行的函数设置定时器，判断事件间隔大于定时器设置事件，在重新执行

`_.throttle(func, wait, [options])`  

- func 需要控制节流的函数
- wait 函数执行一次的时间
- [可选项] {leading: false} 禁用第一次函数执行，{trailing: false} 禁用最后一次函数执行

看看函数是怎么写的  

```js
/* options 为可选项
 * {leading: false} 禁用第一次函数执行
 * {trailing: false} 禁用最后一次函数执行
 */
_.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    // 函数上次执行时间
    var previous = 0;
    
    if (!options) {
      options = {};
    }

    // 延迟执行函数
    var later = function() {
      // 如果禁用第一次函数执行，上一次执行时间置 0，否则置为当前时间
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      // 返回绑定函数
      result = func.apply(context, args);

      if (!timeout) {
        context = args = null;
      }
    };

    return function() {
      var now = _.now();
      // 如果设置禁止第一次执行，later 函数会将 previous 置零，符合进入循环
      if (!previous && options.leading === false) {
        previous = now;
      }
      // 执行的时间
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;

      /*
       * 到了时间间隔后触发，remaining < 0
       * 没设置禁止第一次执行，第一次触发 remaining < 0
       * remaining > wait 表示系统时间被调过？
       * 进入此循环则立即执行函数
       */
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }

        previous = now;
        result = func.apply(context, args);

        if (!timeout) {
          context = args = null;
        }

        // 如果设置禁止最后一次出发，不进入循环
        // 循环延迟时间由 remaining 决定，执行 later 函数
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }

      return result;
    }
};
```

_.throttle() 返回一个函数，根据 _.throttle() 传入参数不同设置不同的延迟函数，限制函数执行频率  

- `remaining = wait - (now - preview)`;
- 如果不传入第三个参数，第一次 `remaining < 0` 进入 `if(remaining < 0)` 这个循环，立刻执行函数，然后接下来执行 `else if()` 这个循环，根据 remaining 时间间隔执行 later 函数
- 如果传入 `{leading: false}` 第一次 `if (!previous && options.leading === false)` 成立，`preview = now` ，`remaining > 0` ,不执行 `if(remaining < 0)` 循环，执行 `else if()` 循环，延迟执行 later 函数，然后 later 函数会为传入 `{leading: false}` 的函数设置 `previous = 0`，所以 `if (!previous && options.leading === false)` 始终成立
- 如果传入 `{trailing: false}` ，前面执行和不传入参数一样，但始终不执行 `else if()`。当 `wait < (now - previous)` 时，立刻执行一次函数

再来看看相对简单的 _.debounce() 函数  

### debounce

去抖是给一段连续执行的函数设置定时器，在第二次调用该函数，会清除前一次的定时器，在重新设置，如果上一个定时器还没执行，则意味着上一个定时器被取消了

```js
// immediate = true 立即执行函数
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timeStamp, result;
    // 延迟函数
    var later = function() {
      var last = _.now() - timeStamp;
      // last < wait 继续触发 later 函数，延迟执行
      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;

        // immediate = true 也会进入这个循环，但已经执行过函数了，所以这里不能重复执行
        if (!immediate) {
          result = func.apply(context, args);

          if (!timeout) {
            context = args = null;
          }
        }
      }
    }

    return function() {
      timeStamp = _.now();
      context = this;
      args = arguments;

      var callNow = immediate && !timeout;

      if (!timeout) {
        timeout = setTimeout(later, wait);
      }

      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
    return result;
};
```

判断相对简单
- immediate = true，虽然会执行 `timeout = setTimeout(later, wait);`，但不处理，直接执行`if (callNow) {result = func.apply(context, args);}`
- 不立即执行，则执行 `timeout = setTimeout(later, wait);`，`last < wait` 时，重复执行 `timeout = setTimeout(later, wait - last);`。直至 `last > wait`，执行函数。

### 使用

```js
var scroll = _.throttle(function(e){
  console.log(e); 
}, 500);
window.addEventListener('scroll', scroll, false);
```

```js
var scroll = _.debounce(function(e){
  console.log(e); 
}, 500);
window.addEventListener('scroll', scroll, false);
```

当然，如果至是要简单的给函数设置去抖，可以这么写

```js
function debounce(method, context) {
    clearTimeout(method,tID);
    method.tId = setTimeout(function() {
        method.call(context);
    }, 100);
}
```

### 参考

- 《JavaScript 高级程序设计》
- <a href="http://www.cnblogs.com/zichi/p/5331426.html" target="_blank">一次发现underscore源码bug的经历以及对学术界『拿来主义』的思考</a>
- <a href="https://blog.coding.net/blog/the-difference-between-throttle-and-debounce-in-underscorejs" target="_blank">浅谈 Underscore.js 中 _.throttle 和 _.debounce 的差异</a>