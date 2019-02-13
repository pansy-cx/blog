---
layout: 	post
title:		"Ajax + pushState 无刷新加载内容"
date:       2017-05-24 10:24:00
tags:
    - JavaScript
---

```js
var loadAjax = function(url, pop) {
	var xmlhttp;
	if(window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	}else {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange = function() {
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var text = xmlhttp.responseText;
			console.log(text)
			if(!pop) { // 如果是后退或前进刷新,则不需要手动修改url
      			// 改变 url
      			window.history.pushState(null, null, url);
      		}
		}
	}
	xmlhttp.open("GET",url,true);
	xmlhttp.send();
};
window.onload = function() {
	// 事件委托,绑定所有 a 标签
	window.addEventListener('click',function(e) {
		e = e || window.event;
		var t = e.target || e.srcElement;   // IE8
		if(t.tagName === 'A'){
      		if(t.target === '_blank') return;
      		e.preventDefault();
			var url = t.href;	// 跳转的 url
		  	// Ajax 加载页面
			loadAjax(url);
  		}
	}, false);
	// 后退前进刷新
	window.addEventListener("popstate", function(e) {
	  var url = window.location.href;
	  loadAjax(url,'pop');		// 如果是后退或前进刷新,则不需要手动修改url

	},false);
}
```

##### 跨域问题

Ajax 获取内容不难，只要是内部链接没有跨域问题就行。如果是外部链接，有两种方法判断：
1. 给外部链接加上 `target = "_blank"` ，在给 a 标签绑定事件时判断一下 target 的值
2. 用正则判断一下所给的 url 是不是内部链接，如果不是，直接返回。

这里我用的是第一种方法

##### 事件绑定

我们先假设一种情况，我们从 A 页面获取了 B页面内容，然后将 A 无刷新修改成 B 页面，此时的 JS 已经执行过了，如果是写了个 for 循环遍历所有 a 标签，则修改后的页面 a 标签并没有绑定事件，或是直接将事件绑定在 HTML 里面，显然也是不好。这时我们就得用<a href="http://localhost:4000/2017/05/10/javascript-event/" target="_blank">事件委托</a> ,在 document 上挂载事件

##### 修改地址栏链接与浏览器历史记录

HTML5 新增的历史记录 API 可以实现无刷新更改地址栏链接  

简单来说：假设当前页面为 idmrchan.com，那么执行下面的 JavaScript 语句：

```js
window.history.pushState(null, null, "/blog/");
```

之后，地址栏的地址就会变成 idmrchan.com/blog ,但同时浏览器不会刷新页面，甚至不会检测目标页面是否存在。

执行 pushState 函数之后，会往浏览器的历史记录中添加一条新记录，同时改变地址栏的地址内容。它可以接收三个参数，按顺序分别为：  

1. 一个对象或者字符串，用于描述新记录的一些特性。这个参数会被一并添加到历史记录中，以供以后使用。比如跳转前的所有内容，这样后退时就可以直接调用这些信息
2. 一个字符串，代表新页面的标题
3. 一个字符串，代表新页面的相对地址

修改链接后，点击「前进」、「后退」按钮时，就会触发 popstate 事件。通过监听这一事件，从而作出反应。

```js
window.addEventListener("popstate", function() {/* */},false);
```

