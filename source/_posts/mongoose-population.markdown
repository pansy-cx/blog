---
layout:     post
title:      "mongoose 建立多个数据表"
date:       2017-03-01 22:38:00
tags:
    - NodeJS
    - MongoDB
---

<a href="http://idmrchan.com/2017/03/01/express-mongoose-test/" target="_blank">上一节内容</a>

在 blog 目录下新建 model 文件夹，创建名为 db.js 的文件，里面输入

```js
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var personSchema = new Schema({
  name: String,
  age: Number,
  _stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
});

var Person = mongoose.model('Person',personSchema);

var stroySchema = new Schema({
  title: String,
  _author: [{ type: Schema.Types.ObjectId, ref: 'Person' }]
})

var Story = mongoose.model('Story',stroySchema);

module.exports = {
  Person: Person,
  Story: Story
}
```

建立多个表，用 module.exports 开放接口数组。personSchema 处代码

```js
_stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
```

用于使 Person 连接 Story 。

新建 add.js 文件

```js
var Db = require('./db.js');

var user = new Db.Person({
  name: 'MrChan',
  age: 20
});
user.save(function(err){
  if(err) throw err;
  console.log('successful');
})
var story = new Db.Story({
  title: 'this is a test',
  _author: user._id
});
story.save(function(err){
  if(err) throw err;
  console.log('successful');
})

```

通过 _author: user._id 使 Person 可以获取 Story 数据。

将 route/index.js 修改为如下：

```js
var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var db = require('../model/db.js');
var connect = mongoose.connect('mongodb://localhost:test');

var data;
db.Story.find().populate('_author','name').exec(function(err,docs){
  data = docs[0]._author[0].name;
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', content: data});
});

module.exports = router;
```

populate用法参考<a href="http://mongoosejs.com/docs/populate.html" target="_blank">这里</a>
通过这样就可以把数据传入到网页上， ejs 下代码可以用 `<%- content %>` 查看效果  
  
至于如何使用这个方法在真正的构建博客或是网站中使用，我还不能很好的写出来，有机会的话会更新的......

  
