---
layout:     post
title:      "仿 jQuery slideUp/slideOut 效果"
date:       2017-03-22 22:45:00
tags:
    - JavaScript
---

只是一个简单的实现，使用 setInterval 控制元素高度，以后可能会在添加 opacity 效果  
  
首先是较简单的 slideOut()   

```js
function slideOut(elem ,speed){
    speed = speed || 1000;  //默认速度
    var height = elem.clientHeight; //获取元素高度
    elem.style.overflow = 'hidden';
    var val;
    var timer = setInterval(function(){
        if(!val){
            val = height;   //防止重复把高度传给 val 
        }
        height>100 ? val -= (height/100) : val -= (height/10);  //高度较小时效果不是太好
        elem.style.height = val + 'px';
        if(val <= 1) {  
            elem.style.height = '0';
            elem.style.display = 'none';
            clearInterval(timer);   //取消掉用
        }
    },speed/height);
}
```
  
`slideUp()`  
  
```js
function slideUp(elem,speed){
    speed = speed || 1000;
    elem.style.overflow = 'hidden';
    elem.style.height = 'auto';
    elem.style.display = 'block';
    var height = elem.clientHeight; //获取原本高度
    elem.style.display = 'none';    //防止元素闪现
    var val = 0;
    var timer = setInterval(function(){
        elem.style.display = 'block';
        height>100 ? val += (height/100) : val += (height/10);
        elem.style.height = val + 'px';
        if(val >= height){
            elem.style.height = 'auto';
            elem.style.display = 'block';
            clearInterval(timer);
        }
    },speed/height);
}
```
  
写的不是很好，对 JS 动画这一块的调试还是不太懂，希望以后能在进一步优化
