---
layout:     post
title:      "JS 事件委托"
date:       2017-05-10 11:27:00
tags:
    - JavaScript
---

### 事件派发

页面的哪一部分拥有特定的事件？在此问题是，浏览器开发厂家还是一致的，如果你单击某个按钮，他们都认为单击事件不仅仅发生在按钮上。换句话说，在单击按钮的同时，你也单击了按钮的容器元素，甚至单击了整个页面。  
事件流描述的是页面中的接收事件顺序，在此上有两种不同的方案，事件冒泡（event bubbling）和事件捕获（event capturing）

##### 事件冒泡

事件开始时由最具体的元素（文档嵌套层次最深的那个节点）接收，然后逐级向上传播到较为不具体的节点（文档）  
简单的说就是从 child -> parent

##### 事件捕获

事件捕获的思想是不太具体的节点应该更早接收到事件，而具体的节点应该最后接收到事件。事件捕获的用意在于在事件到达预定目标之前捕获它。  
从 parent -> child

选择哪种？  
由于老版本的原因，很少有人用捕获，建议使用事件冒泡。 addEventListener (事件监听) 也提供了选择的方法。false（执行冒泡）或者true（执行捕获），默认 false

### 事件监听

```js
var id = document.getElementById('id');

var fn = function(e) {
    e = e || window.event;
    // ...
}
if(id.addEventListener) {
    id.addEventListener('click', fn, false);
}else if(id.attachEvent){               // IE8
    id.attachEvent('onclick', fn);
}
```

### 事件委托

举个例子  

```html
<ul id="list">
    <li>1</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
</ul>
```

```js
var list = document.querySelector('#list')
list.addEventListener('click',function (e){
    e = e || window.event;
    var t = e.target || e.srcElement;   // IE8
    if(t.tagName === 'LI'){
        console.log('当前元素事件触发成功')
    }
},false)
```

通过事件委托，我们可以  

- 减少监听器
- 监听动态内容


