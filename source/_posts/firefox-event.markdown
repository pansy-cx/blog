---
layout:     post
title:      "Firefox 下不支持 event 事件的解决方案"
date:       2016-08-23 12:30:00
tags:
    - JavaScript
---

以前写事件兼容代码。从来都是一句话 `var oEvent = ev || event` 就能解决的事情  
可是用面向对象写了个事件对象在 Firefox 下却会报错  
alert 一下 event 发现在 Firefox 下是未定义。兼容代码的写法也不管用了  

解决方案。将兼容性代码改成 `var oEvent = ev || window.event || arguments.callee.caller.arguments[0]` 即可解决问题
