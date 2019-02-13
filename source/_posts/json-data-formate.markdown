---
layout:     post
title:      "JS 格式化日期函数"
date:       2017-04-27 09:27:00
tags:
    - JavaScript
---

在获取 JSON 日期格式的时候，有时会得到一串 13 位数的字符串。这是从 1970 年 1 月 1 日至今的毫秒数。用 new Date() 可以返回当前时间，例如：

```js
new Date(1493256702849)
// Thu Apr 27 2017 09:31:42 GMT+0800 (中国标准时间)
```

Date.prototype 方法：

    Date.prototype.getDate()
    根据本地时间返回指定日期对象的月份中的第几天(1-31)
    Date.prototype.getDay()
    根据本地时间返回指定日期对象的星期中的第几天(0-6)  周日-周六
    Date.prototype.getFullYear()
    根据本地时间返回指定日期对象的年份(四位数年份时返回四位数字)
    Date.prototype.getHours()
    根据本地时间返回指定日期对象的小时(0-23)
    Date.prototype.getMilliseconds()
    根据本地时间返回指定日期对象的微秒(0-999)
    Date.prototype.getMinutes()
    根据本地时间返回指定日期对象的分钟(0-59)
    Date.prototype.getMonth()
    根据本地时间返回指定日期对象的月份(0-11)     要 +1
    Date.prototype.getSeconds()
    根据本地时间返回指定日期对象的秒数(0-59)

不过有时获取的时间戳是 10 位数的，比如 PHP，此时就需要做一下转换

```js
function jsonDate(timeStamp, fmt) { 
// timeStamp 为传递的时间戳，fmt 为返回的格式
  if (!timeStamp) {
    return ''
  }
  var _timeStamp = parseInt(timeStamp)
  // 如果是 10 位的数字，*1000
  if (_timeStamp.toString().length === 10) {
    _timeStamp *= 1000
  }
  !fmt && (fmt = 'yyyy-MM-dd')  // 默认返回格式

  var t = new Date(_timeStamp)

  var o = {
    'M+': t.getMonth() + 1, // 月份
    'd+': t.getDate(),      // 日
    'h+': t.getHours(),     // 小时
    'm+': t.getMinutes(),   // 分
    's+': t.getSeconds(),   // 秒
    'q+': Math.floor((t.getMonth() + 3) / 3), // 季度
    'S': t.getMilliseconds() // 毫秒
  }
  // test() 方法用于检测一个字符串是否匹配某个模式，返回 Boolean 值
  if (/(y+)/.test(fmt)) 
    fmt = fmt.replace(RegExp.$1, (t.getFullYear() + '').substr(4 - RegExp.$1.length))
  // 匹配为 fmt 格式
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) 
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
  }
  return fmt
}
```

这是在网上找的代码，我只是添加了下注释。已经不知道原出处了。。。网上还有很多扩展版本，其实都是根据 new Date() 函数获取时间，在进行一些格式化处理。原理也是相同的



