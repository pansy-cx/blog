---
layout:     post
title:      "使用 JS 控制 Mongodb Array 数组"
date:       2017-03-20 21:20:00
tags:
    - JavaScript
    - MongoDB
---

1、博客添加标签功能，可创建多个标签。  

一般用`;`，添加多个标签，为了防止用户使用不同的符号或使用了中文标点，先用正则表达式处理数组，将所有标点转为空格，在分割存入数据库数组。  


```js
//将中文标点和部分英文标点，统一转为空格
var string = string.replace(/[\u3000-\u301e\ufe10-\ufe19\ufe30-\ufe44\ufe50-\ufe6b\uff01-\uffee]/ig,' ').replace(/[,|.|/|\\|;]/ig,' ');

//分割空格转为数组
var strings = string.split(' ');
```


2、添加标签云，将所有标签去重后输出。  
  
由于不懂后台数据库处理数据，将数据全部输出，使用 JS 进行去重  

```js
//distinct 用来找出给定键的所有不同值
//但 _tags 数据是一个字符串，其中会有重复的标签
  db.collection.distinct("_tags",function (err, docs) {
    // 去重函数
    function unique(array){
      var n = [];
      for(var i = 0;i < array.length; i++){
        if(n.indexOf(array[i]) == -1) n.push(array[i]);
      }
      return n;
    }
    var tag = [];
    for(var i=0;i<docs.length;i++){
      for(var j=0;j<docs[i].length;j++){
        tag.push(docs[i][j]);   //将所有标签转存到 tag
      }
    }
    mongodb.close();
    if (err) {
      return callback(err);
    }
    callback(null, unique(tag));  //去重后返回
  });
```

