---
layout:     post
title:      "鼠标滚轮监听事件"
date:       2016-12-05 14:20:00
tags:
    - JavaScript
---


**代码**

```javascript
function scroll( fn ) {
    var beforeScrollTop = document.body.scrollTop,
        fn = fn || function() {};
    window.addEventListener("scroll", function() {
        var afterScrollTop = document.body.scrollTop,
            delta = afterScrollTop - beforeScrollTop;
        if( delta === 0 ) return false;
        fn( delta > 0 ? false : true );
        beforeScrollTop = afterScrollTop;
    }, false);
}
scroll(
    function(direction){
        <!--  -->
    }
);
```

**分析**  
通过监听滚轮的 beforeScrollTop 和 afterScrollTop ，如果等于或小于 0，return false ，如果大于 0，return true
