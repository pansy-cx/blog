---
layout:     post
title:      "underscore.js 源码之 Fisher-Yates shuffle 数组乱序"
date:       2017-06-11 15:36:00
tags:
    - JavaScript
    - UnderScore
---

昨天晚上竟然失眠了，早上还是 8 点就醒了。在找不到实习压力是越来越大了......  

### Fisher-Yates shuffle

Fisher–Yates shuffle(洗牌算法) 是一个用来将一个有限集合生成一个随机排列的算法。这个算法生成的随机排列是等概率且高效的，具体步骤如下：

1. 写下从 1 到 N 的数字
2. 取一个从 1 到剩下的数字（包括这个数字）的随机数 k
3. 从低位开始，得到第 k 个数字（这个数字还没有被取出），把它写在独立的一个列表的最后一位
4. 重复第 2 步，直到所有的数字都被取出
5. 第 3 步写出的这个序列，现在就是原始数字的随机排列

这是最原始版的洗牌算法，若是在计算机当中，第 3 步得到第 k 个数字后，还需要将 k 删除，比如在 JS 中代码实现为 `js array.slice(i,1) ` 每执一次，时间复杂度为 O(n)，这样下来，总的时间复杂度就为 O(n^2)。当数据很大时十分浪费时间。  

为了解决这个问题，新的版本将第三步改为：每次迭代时将第 k 个数和原始列表的 开头/结尾 数对换，这就省去了删除元素的步骤，时间复杂度为 O(n)。  

### _.shuffle() 方法  

underscore.js 里是这么写的  

```js
_.shuffle = function(obj) {
    // Object 则取出值进行乱序
    var set = _.isArray(obj) ? obj : _.values(obj) ;
    var length = set.length;
    var results = Array(length);

    for (var i = 0; i < length; i++) {
      var rand = Math.floor(Math.random() * (i+1));

      if (rand != i) 
        results[i] = results[rand];

      results[rand] = set[i];
    } 

    return results;
};
```

使用 Math.random() 随机生成数字，将 随机数 rand 与 i 进行对换  


参考文章：<a href="https://gaohaoyang.github.io/2016/10/16/shuffle-algorithm/" target="_blank">Fisher–Yates shuffle 洗牌算法</a>
