---
layout: 	post
title:		"underscore.js 源码之 数组展开和数组去重"
date:       2017-06-10 22:36:00
tags:
    - JavaScript
    - UnderScore
---

### 数组展开

数组展开，就是把嵌套的数组解开，分为深展开和浅展开  

    [[[1,2,3],[4,5]],[6,7],8] => [1,2,3,4,5,6,7,8]        深展开
    [[[1,2,3],[4,5]],[6,7],8] => [[1,2,3],[4,5],6,7,8]    浅展开

```js
_.flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    // startIndex 规定从哪开始展开
    for (var i = startIndex || 0; i < input.length; i++) {
      var value = input[i];
      // 如果数组内还是数组，则需要考虑深遍历或浅遍历
      if (_.isArrayLike(input[i])) {

        // shallow 为 false 或不填为深拷贝，递归
        if (!shallow) {
          // 将 flatten函数返回值赋予 value
          value = _.flatten(value, shallow, strict);
        }

        // 浅遍历只执行一层
        var j = 0, len = value.length;

        while(j < len) {
          output[idx++] = value[j++];
        }
      } else if(!strict) {
        // strict 为 true 时，不进入循环，意味着 最外层数组内若是数字则舍去
        output[idx++] = value;
      }
    }
    return output;
};
```

先来看看四个参数各自的用处  

- input         展开的数组
- shallow       等于 true 时代表浅拷贝
- strict        为 true 时，最外层的数组元素若为数字，则被舍去。当 `shallow = false`, `strict = true` 时，数组递归到最后都是数字，而数字被舍去，输出 `[]`
- startIndex    从第几个元素开始展开

代码首先循环判断数组值是否为数组  

- 如果是数组，判断 shallow 值
    + 若深拷贝，进入递归继续展开判断直至不为数组，进入 `else if(!strict)` 的判断内，把值存入 output，在返回给 value ，接下来执行和浅拷贝一样的步骤  
    + 若浅拷贝，只展开一层，把 value 内的值赋给 output
- 如果不是数组，判断 strict 不为 true 时，把值存入 output  

总的来说，就是循环每个数组，在根据数组值的情况和传入的参数不同，分别返回不同的方法，最后把值传给 output

### 数组去重

据说这是到笔试经常出的题目  
如果支持 ES5 ，可以用 indexOf 和 unique 方法

```js
function unique(arr) {
  var results = arr.filter(function(item, index, array) {
    return array.indexOf(item) === index;
  });

  return results;
}
```

ES6，就更简单了

```
function unique(arr){
    return Array.from(new Set(arr));
}
```

如果都不支持，代码就比较难看了  

```js
function unique(arr) {
  var results = [];

  for (var i = 0; i < arr.length; i++) {
    var item = a[i];

    for (var j = 0, jLen = res.length; j < jLen; j++) {
      if (res[j] === item) break;
    }

    if (j === jLen)
      res.push(item);
  }

  return res;
}
```

这里用到了两重循环  

可以这么修改下
```js
function unique(arr) {
  var res = []
  var hash = {}

  for (var i = 0; i < arr.length; i++) {
    var item = arr[i]
    var key = typeof(item) + item
    if (hash[key] !== 1) {
      res.push(item)
      hash[key] = 1
    }
  }

  return ret
}
```

这里创建了一个对象来代替 indexOf，把「数组值的属性 + 数组值」作为对象属性传入，只需要查找对象属性是否已经存在，就可以判断这个值存不存在  

这样就完美了吗？[new String(1), new Number(1)] 的 typeof 可都是 object 呢，当然这情况很少，可根据实际情况取舍。  

看看 underscore.js 的方法  

```js
_.unique = function(array, isSorted, iteratee, context) {
    // 如果 isSorted 不是 boolean，变成 (array, false, isSorted, iteratee)
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }

    if (iteratee != null) {
      iteratee = cb(iteratee, context,);
    }

    var results = [],
        seen = [];

    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i],
          // 有传入函数就计算函数返回值，否则直接返回数组值
          computed = iteratee ? iteratee(value, i, array) : value;

      // isSorted 为 true 时，代表 array 有序，直接对比两个相邻元素
      if (isSorted) {

        if (!i || seen != computed) results.push(value);
        seen = computed;
      } else if (iteratee) {
        // 如果有传入函数，需要保存对比函数执行后的结果
        // _.contains(array, item) 如果 item 存在与 array，返回 true
        if (!_.contains(seen, computed)) {
          results.push(value);
          seen.push(computed);
        }
      } else if (!_.contains(results, value)) {
        // 不计算函数，就不需要存入 seen 变量
        results.push(value);
      }
    }
    return results;
}
```

注意这段  

```js
if (!_.isBoolean(isSorted)) {
  context = iteratee;
  iteratee = isSorted;
  isSorted = false;
}
```

根据传入参数的不同，对传入参数的顺序进行调整，这倒是很令我惊奇，居然还能这么用，虽然我感觉在这里用处不大。  

然后分两种情况，一种传入了函数则先执行函数，对比返回值是否重复，若没传入函数，则直接对比数组是否重复。都是将第一次出现的数传入了 results 数组，然后通过 `_.contains(results, value)` 方法判断有没有重复， 而 `_.contains()` 用到了 `_.indexOf()`
 的方法，在 underscore 里，实际上也是执行了两重循环。  
不过 underscore 对这两个方法都进行了优化。indexOf() 的优化上一篇已经讲过，`_.contains()` 则是当数组有序时，isSorted 传入 true，代码就会只判断前后两个数是否相同。  

看了这么多篇，我感觉到 underscore 除了对各种方法进行了封装以外，更令我惊喜的是对参数不同而执行不同的代码，让相似的功能只需要通过传入参数的不一样而有不同的方法。我自认做不到如此，就算是有意模仿也是相形见挫，不知什么时候才能做到想原作者这般随心所欲。  
