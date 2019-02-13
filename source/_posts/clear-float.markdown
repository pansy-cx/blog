---
layout:     post
title:      "关于清除浮动"
date:       2016-08-24 09:00:00
tags:
    - CSS
---

>参考资料：http://www.cnblogs.com/mofish/archive/2012/05/14/2499400.html 

### 为什么要清除浮动

一般来说，使用浮动流会使元素脱离普通流，当浮动高度超出包含框（父级高度）时，就会出现包含框无法撑开闭合浮动元素（即：高度坍塌现象）。这往往不是合格的布局，所以需要闭合浮动元素，使其包含框表现出正常的高度。也有些文章指出，清除浮动应该称为闭合浮动，这样命名更准确，其实都是一样的。


### 如何清除浮动

#### 在浮动元素末尾添加一个空的标签

```html
<div>
　　<div style="float: left"></div>
　　<div style="float: right"></div>
　　<div style="clear:both"></div>
</div>
```

这是最简单易懂的方法，但是这种做法会产生无意义的空标签。

#### 使用:after 伪元素

由于 IE6-7 不支持 :after，使用 zoom:1 触发 hasLayout  

```html
<style type=”text/css”>
.clearfix:after {
    content: ".";
    display: block;
    height: 0;
    clear: both;
    visibility: hidden;
}
.clearfix {display: inline-block;} /* for IE/Mac */
</style>
<!-[if IE]> 
<style type="text/css">
.clearfix {
    zoom: 1;/* triggers hasLayout */
    display: block;/* resets display for IE/Win */
}
</style>
<![endif]->
```

鉴于现在老版本的浏览器基本上可以淘汰了，精简代码如下  

```css
.clearfix:after {content:"."; display:block; height:0; visibility:hidden; clear:both; }
.clearfix { *zoom:1; }
```

代码详解  
1. display:block 使生成的元素以块级元素显示,占满剩余空间
2. height:0 避免生成内容破坏原有布局的高度
3. visibility:hidden 使生成的内容不可见，并允许可能被生成内容盖住的内容可以进行点击和交互
4. 通过 content:"." 生成内容作为最后一个元素，至于 content 里面是点还是其他都是可以的，例如 oocss 里面就有经典的 `content:"XXXXXXXXXXXXXXXXXXXXX"` 有些版本可能 content 里面内容为空,不推荐这样做的,firefox 直到 7.0 content:"" 仍然会产生额外的空隙
5. zoom：1 触发 IE hasLayout
