---
layout:     post
title:      "Express + mongoose 搭建后台简易配置"
date:       2017-02-28 11:38:00
tags:
    - NodeJS
    - MongoDB
---

### 安装工具

- NodeJS
- MongoDB
- RoboMongo

### 使用 Express 框架

命令行下输入：

    npm install -g express-generator

使用 Express 初始化项目，在命令行中输入：  

    express -e blog
    cd blog 

express -e 会在当前目录下建立一个 blog 文件夹，里面有初始化内容, 在命令行中输入：  

    npm install
    npm start

npm install 是用于安装 packages.json 内的框架。  
packages.json 内容：  

```json
{
  "name": "blog",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start": "node ./bin/www"
  },
  "dependencies": {
    "body-parser": "~1.16.0",
    "cookie-parser": "~1.4.3",
    "debug": "~2.6.0",
    "ejs": "~2.5.5",
    "express": "~4.14.1",
    "morgan": "~1.7.0",
    "serve-favicon": "~2.3.2"
  }
}
```

npm start 是开启 nodejs 项目，在浏览器中输入 localhost:3000 ，可以看到工程已建立。

### 工程结构  
 
- app.js：启动文件，或者说入口文件  
- package.json：存储着工程的信息及模块依赖，当在 dependencies 中添加依赖的模块时，运行 npm install，npm 会检查当前目录下的 package.json，并自动安装所有指定的模块  
- node_modules：存放 package.json 中安装的模块，当你在 package.json 添加依赖的模块并安装后，存放在这个文件夹下  
- public：存放 image、css、js 等文件  
- routes：存放路由文件  
- views：存放视图文件或者说模版文件  
- bin：存放可执行文件  

打开 app.js

```js
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var users = require('./routes/users');
var app = express();
```

require 是用于加载文件调用接口，除原生模块外，引用需要 `./` 加相对地址。  
`var app = express()` 用于生成 express 实例。

```js
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
```

设置视图模板引擎 ejs ,接下来所用的 html 文件都要改为 ejs 。

```js
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);
app.use('/users', users);
```

加载中间件。

```js
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
```

错误处理。  

```js
module.exports = app;
```

设置模块公开接口。

### 路由控制

打开 routes/index.js

```js
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
```

前两行是 router 初始化设置，router.get 意思是当访问主页是，调用 ejs 引擎，生成静态页面，`title:'express'` 是把标题设置为 express 。
我们在 index.js 添加代码：

```js
router.get('/hhh', function(req, res, next) {
  res.render('index', { title: 'hahahaha' });
});
```

在浏览器中打开 <a href="localhost:3000/hhh" target="_blank">localhost:3000/hhh</a> 看看效果。  

### 模板引擎

接下来在 views 下添加我们要显示的页面。刚才路由中有一行代码  

```js
res.render('index',{title: 'express'});
```

index 就是 views 目录下的 index.ejs 文件，ejs 标签非常简单，只有三种标签。 

- `<% code %>`：JavaScript 代码。  
- `<%= code %>`：显示替换过 HTML 特殊字符的内容。  
- `<%- code %>`：显示原始 HTML 内容。  

其中模块如何构架与 WordPress 相似。  

### MongoDB 开启

接下来要开启 mongodb，在安装的 mongodb 目录下，新建一个名为 data 的目录，我们的数据就要放在这里。  
打开 mongodb 目录的 bin 文件夹 ，在其目录下使用命令提示符，输入  

    mongod --dbpath ../data

在浏览器中打开 localhost:27017 看看开启是否成功。  

进入 mongodb 后台管理系统。在 bin 目录下在开启一个命令提示符，输入

    mongo
    use data

打开 robomongo ，点击 create ，地址 localhost:27017 ,  
一般默认设置即可，点击后就可进入可视化界面的 mongodb 后台系统。

### mongoose 连接 express

在 blog 目录下新建 model 文件夹，创建名为 db.js 的文件，里面输入  

```js
// mongoose 链接
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/data');

// Schema 结构
var Schema = mongoose.Schema;
var userSchema = new Schema({
    username: String,
    userimg: String,
    userspan: String,
    tag: String,
    tagimg: String,
    title: String,
    article: String,
    like: Number,
    class: String
});

// 现在的 schema 还是没什么用的
// 我们还需要在它的基础上创建一个模型 (model)
var addUser = mongoose.model('addUser', userSchema);
var userPost = mongoose.model('userPost', userSchema);

// 导出我们之前定义好的 user model
module.exports = addUser;
```

其中 userSchema 是要添加的数据内容分类。同目录下，新建 add.js 文件  

```js
var Db = require('./db.js');
var test = new Db({
    username: 'mrchan',
    tag: 'nodejs',
    title: 'express+mongoose',
    article: 'test',
});
test.save(function(err){
    if(err) throw err;
    console.log('User save successful');
});
```

第一行是引用 db.js 的设置,  
重新执行 npm start 命令，这些内容就会被写入数据库。当然现在还不行,我们要在 app.js 内 `var app = express()` 上添加代码  

```js
//mongoose 添加方法
var add = require('./model/add.js');    //把 add.js 方法添加到 app.js
global.post = require('./model/db.js'); //给全局设置一个 post 方法，用于引用数据库内容
```

此时修改 routers/index.js 代码  

```js
router.get('/', function(req, res, next) {
    post.find({}, function(err, docs) {
        if (err) {
            console.error(err);
            return;
        }
        // docs 是包含了符合条件的多个文档的一个数组
        console.log(docs);
        res.render('index', { title: '首页-知乎', content: docs.reverse()});
    });
});
```

然后在 index.view 就可引用数据库数据。用法如下  

```html
<ul>
    <% for(var i=0; i<content.length; i++) { %>
        <li><%- content[i].username %></li>
        <li><%- content[i].tag %></li>
        <li><%- content[i].title %></li>
    <% } %>
</ul>
```

### 小节  

这是我第一次接触后台，对后台的构架与使用还是不太熟悉，尤其是数据库这一块内容，每次添加数据都得执行一次 npm start ，十分麻烦。而且我只会建一张表，接下来还要研究如何建立多张表并合理的引用。所以数据库这块仅做我自己参考，并没有试用性。

-----Update--------  

建立多张表的方法看 <a href="http://idmrchan.com/2017/02/28/mongoose-population/" target="_blank">这篇</a>



