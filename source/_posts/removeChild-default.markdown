---
layout:     post
title:      "js 关于 removeChild() 移除不完全的问题"
date:       2016-12-19 22:00:00
tags:
    - JavaScript
---

**代码**  

```js
<ul id='oul'>
    <li>1 <span>删除</span></li>
    <li>2 <span>删除</span></li>
    <li>3 <span>删除</span></li>
    <li>4 <span>删除</span></li>
    <li>5 <span>删除</span></li>
</ul>
<script>
    var oUl = document.getElementById('oul');
    var aSpan = oUl.getElementsByTagName('span');
    for(var i=0;i<aSpan.length;i++){
        (function(i){
            var Remove = function () {
                oUl.removeChild(aSpan[i].parentNode);   
            }
            aSpan[i].addEventListener('click',Remove,false);
        })(i);
    }
</script>
```

在点击第一个元素时，删除第一个元素，而点击第二个元素时，删除第三个元素。最后会剩下2和5两个元素无法删除
  
**分析** 

```js 
var aSpan = oUl.getElementsByTagName('span')
```

获取的 NodeList 是一个动态的集合，而非静态的，所以当每添加或删除元素时，oSpan 对象会立马变换。  


**解决方案** 

添加 

```js 
oSpan = Array.prototype.slice.call(oSpan);
// [].slice.call()
```

将元素强制转化为数组。为什么这样可以转换？主要的原因是 slice 方法只需要参数有 length 属性即可。首先，slice 方法得到的结果是一个新的数组，通过 Array.prototype.slice.call 传入的参数，添加数据进去。如果没有 length 属性，或者 length 属性值不是 Number 类型，或者为负，那么直接返回一个空数组。

**问题**

1. IE 兼容
IE 下 Array.prototype.slice.call() 会抛出错误，因为 IE 下 DOM 节点列表不是 JavaScript 对象，兼容写法如下  

```js
function nodeListToArray(list) {
    var arr,len;
    try {
        arr = [].slice.call(list);
        return arr;
    } catch(err) {
        arr = [],len = list.length;
        for(var i=0; i<len; i++) {
            arr.push(list[i]);
        }

        return arr;
    }
}
```

2. 性能优化  

如果是在将 arguments 转为数组时，因为传递 arguments 给任何参数，将导致 Chrome 和 Node 中使用的 V8 引擎跳过对其的优化，这也将使性能相当慢，如果是将 arguments 转为数组，最好单独创建一个数组。<a href="http://www.jstips.co/zh_cn/javascript/avoid-modifying-or-passing-arguments-into-other-functions-it-kills-optimization/" target="_blank">参考文章</a> 

```js
var args = new Array(arguments.length);
for(var i = 0; i < args.length; ++i) {
  args[i] = arguments[i];
}
```


