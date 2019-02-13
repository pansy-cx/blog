---
layout: 	post
title:		"underscore.js 源码之 数组查找"
date:       2017-06-10 15:22:00
tags:
    - JavaScript
    - UnderScore
---

在 ES5 中， Array.prototype 内置了 indexOf() 方法。方法返回在数组中可以找到一个给定元素的第一个索引，如果不存在，则返回 -1  
而在 ES6 中，Array.prototype 添加了 findIndex() 方法。方法返回数组中满足提供的测试函数的第一个元素的索引，否则返回-1。 

使用方法和 Polyfill 可以参考 MDN，<a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf" target="_blank">indexOf</a> 和 <a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex" target="_blank">findIndex</a>

在 underscore 中都实现了这些方法，例如 findIndex() 和 lastFindIndex() 这两个相似的方法，看看 underscore 是怎么写的。

### createPredicateIndexFinder() 

```js
function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      var length = array.length;
      var index = dir > 0 ? 0 : length - 1;

      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }

      return -1;
    }
}
_.findIndex = createPredicateIndexFinder(1);
_.findLastIndex = createPredicateIndexFinder(-1);
```

实现很简单，和前面讲的一样，这里也是使用闭包的方法，通过判断 dir 来确定是正向查找还是反向查找。  

然后是 indexOf() 和 lastIndexOf() 方法。  

### createIndexFinder

```js
function createIndexFinder(dir, predicate, sortedIndex) {
    return function(array, item, idx) {
      var i = 0,
          length = array.length;

      // 如果 idx 为数字，则从 idx 指定处开始查找
      if (_.isNumber(idx)) {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if(sortedIndex && idx && length) {
        // 如果 idx 为 true，则说明使用二分查找法
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }

      // NaN 的情况
      if(item !== item) {
        idx = predicate(slice.call(array, i, length), _.isNaN);
        return idx > 0 ? idx + i : -1;
      }

      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }

      return -1;
    }
  }

_.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
_.lastIndexOf = createIndexFinder(-1, _.findLastIndex);
```

看 idx 这个参数，当 idx 为 number 类时，表示从指定位置开始查找。当 idx 为 true 时，表示数组已排序，可使用 `_.sortedIndex` 方法，即二分查找法。然后当 item 为 NaN 时，使用 findIndex 特判一下有没有 NaN  

这几个方法不是太难懂，但设计的挺巧妙地，这篇比较水，主要是源码写得好。 