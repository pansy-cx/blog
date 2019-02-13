---
layout:     post
title:      "水平居中的2种方法"
date:       2016-08-23 12:00:00
tags:
    - CSS
---

> <a href="http://www.w3cplus.com/css/elements-horizontally-center-with-css.html" target="_blank">原帖</a>总结了6种方法，感兴趣的可以去看一下。  

### 常规方法  

大家最熟悉的莫过于给元素定一个宽度，然后加上 margin 的左右值为 auto

```css
div {
    width: 960px;
    margin-left: auto;
    margin-right: auto;
}
```

这种方法给知道了宽度的元素设置居中是最方便不过的了，但有很多情况之下，我们是无法确定元素容器的宽度。  

优点：实现方法简单易懂，浏览器兼容性强；  
缺点：扩展性差，无法自适应未知项情况。

### inline-block 实现水平居中方法  

仅 inline-block 属性是无法让元素水平居中，他的关键之处要在元素的父容器中设置 text-align 的属性为 “center”，这样才能达到效果：

```css
.fu {
    text-align: center;
}
.zi {
    width:75%;
    display: inline-block;
}
```

通过将 width 设为百分比可实现自适应  
优点：简单易懂，扩展性强。  
缺点：需要额外处理 inline-block 的浏览器兼容性。  

这个是我在学习自适应样式布局时发现的问题，若要将 width 设置为百分数，第一种方法是无法实现的，用第二种方法是比较合适的选择。
