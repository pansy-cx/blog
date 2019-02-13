---
layout:     post
title:      "自定义 npm 和使用 json-server 进行前端 mock 数据"
date:       2018-05-13 15:23:32
tags:
    - JavaScript
    - npm
---

本文章来源于昨天看了公司的一个 npm 工具，其中一个功能是自定义 mock 数据，于是依葫芦画瓢自己也跟着写了个一个。

### 自定义 npm

##### 可执行脚本

平常我们都知道 JavaScript 是运行在浏览器环境的脚本语言，不过 JS 同时也和 Python 等语言一样可以运行在命令行环境等任意环境。写一个可执行脚本：

```js
// hello.js
#!/usr/bin/env node
console.log('hello world')
```

修改文件权限并执行

    $ chmod 755 hello.js
    $ ./hello
    hello world

如果想把 hello 前面的路径去除，即在环境中添加 hello 的环境变量。在当前目录下新建 package.json ，写入下面的内容。

```json
{
    "name": "hello",
    "bin": {
        "hello": './hello.js'
    }
}
```

`name` 可以是其他名字，但一定要有。然后执行命令：

    $ npm link
    $ hello
    hello world

**注意：执行 npm link 要确保没有安装任何 node_modules，否则可能会报错。**

这就是 npm 库的用法。

##### yargs 模块

有时执行命令要带上参数，此时要用到 yargs 模块

    $ npm install --save yargs

yargs 有一个 argv 属性，可以获取命令行参数

```js
const argv = require('yargs').argv
console.log(argv._)     // _ 返回非连词线开头参数
console.log(argv.p)     // -p 或 --port
```

用法如下

    $ hello dev -p 8888
    ['dev']
    8888

还可以添加一些帮助信息

```js
const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('dev-srv', 'local API server (-p port || 3002)')
    .demand(1)
    .epilog('https://github.com/pansy-cx')
    .argv
```

以下是相关用法：

- usage：用法格式
- command: 子命令
- demand：是否必选
- example：提供例子
- help：显示帮助信息
- epilog：出现在帮助信息的结尾

返回结果

    $ hello
    Usage: hello <command> [options]
    Commands:
      hello dev-srv  local API server (-p port || 3002)
    Options:
      --help     Show help          [boolean]
      --version  Show version number          [boolean]
    https://github.com/pansy-cx
    Not enough non-option arguments: got 0, need at least 1


通过这些，我们就可以 DIY 自己的 npm 工具了。

### json-server

##### 用法简介
```json
// db.json
{
    "author": {
        "img": "http://idmrchan/avator",
        "name": "Virgil"
    }
}
```

    $ json-server --watch db.json

访问 `http://localhost:8080/author` get it

`{"author": {"img": "http://idmrchan/avator", "name": "Virgil"}}`

不过，当请求为 POST DELETE 等方法时，json-server 会根据情况添加或删除数据，而不是和我们理想中的返回 db.json 中的数据。

所以我们可以自己改造一下 json-server，写一个我们自定义的 npm 方法。

##### 自定义 json-server

```js
// virgil-cli.js
#!/usr/bin/env node
const chalk = require('chalk')
const argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .command('dev-srv', 'local API server (-p port || 3002)')
  .demand(1)
  .epilogue('https://github.com/pansy-cx/virgil-cli')
  .argv

let port = 3002

if (argv._ && argv._[0] === 'dev-srv') {
    console.log(chalk.bold('Virgil Local API Server \n'))
    if (argv.p) {
        port = parseInt(argv.p)
    }
    start()
    watch()
}
```

执行 `virgil dev-srv -p 8080`，就可以执行 `start()` 和 `watch()` 两个函数。

`start()` 函数如下

```js
const path = require('path')
const fse = require('fs-extra')
const cors = require('cors')
const jsonServer = require('json-server')
const enableDestroy = require('server-destroy')
// 获取当前目录下 db.json 文件路径
let localDbFile = path.join(process.cwd(), '/db.json')
let server

// 获取本机 IP
const getLocalIP = () => {
    let address,
        os = require('os'),
        ifaces = os.networkInterfaces()

    for (let dev in ifaces) {
        let iface = ifaces[dev].filter(details => details.family === 'IPv4' && details.internal === false)
        if (iface.length > 0) {
          address = iface[0].address
          break
        }
    }
    return address
}

const start = () => {
    let localDb = fse.readJsonSync(localDbFile)
    let app = jsonServer.create()
    app.use(cors())
    let router = jsonServer.router(localDb)
    router.render = (req, res) => {
        let dbData = res.locals.data    // GET 方法返回 db.json 数据，而 POST 等只会返回 {}
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
            // POST 等方法需要自行获取
            dbData = localDb[req.path.replace('/', '')] || {}
        }
         
        let _status = req.query._status || 200
        // 自定义错误状态
        let msgJson = {}, msgCode = 0
        for (let i in dbData) {
            if (i === 'code' || i === 'status') {
                msgCode = dbData[i]
                msgJson[i] = msgCode
            }
            if (i === 'msg' || i === 'error' || i === 'err') {
                msgJson[i] = dbData[i]
            }
        }
        // 发送数据
        if (msgCode && msgCode > 400) {
            res.status(msgCode).jsonp(msgJson)
        } else if (_status * 1 >= 400) {
            res.sendStatus(_status)
        } else {
            res.json(dbData)
        }
    }
    app.use(jsonServer.defaults())
    app.use(router)
    server = app.listen(port, () => {
        console.log(`👏  Running : http://${getLocalIP()}:${port}\n`)
    })
    enableDestroy(server)
} 
```

相关 API 可以参考 <a href="https://github.com/typicode/json-server" target="_blank">json-server</a>

```json
{
    "author": {
        "name": "Virgil",
        "age": 18
    }
}
```

GET && POST 用法都可返回 json 对象，如果要模拟错误返回，可以添加状态

```json
{
    "author": {
        "code": 404,
        "msg": "info is err",
        "name": "Virgil",
        // ...
    }
}
```

返回 `GET /author 404 3.423 ms - 35`

```json
"err": {
    "code": 404,
    "msg": "info is err"
}
```

由于不同项目后台返回的错误信息和数据状态不尽相同，真正构造 npm 工具时可能需要添加可自定义格式的情况，这个我还未想到较合理的解决方式，今后用到的时候可以在考虑添加。

`watch()` 用于监听文件改动

```js
const chokidar = require('chokidar')
const watch = () => {
    console.log('🙈  Watching : Local Data => %s/test/{db,r}.json\n', process.cwd())
    chokidar
    .watch([local_r_file, local_db_file])
    .on('change', () => {
        console.log(chalk.gray('🙏  Restarting...'))
        server.destroy(() => {
            start()
        })
    })
}
```

##### 添加映射

实际项目中，API 的前缀都是很长的，为了更清晰的展示，可以做个映射

```r.json
{
    "/sit/sjfwefj/example/autor": "author"
}
```

```js
const localRFile = path.join(process.cwd(), '/test/r.json')
const start = () => {
    let localR = fse.readJsonSync(localRFile)
    app.use(jsonServer.rewriter(localR))    // 映射
}
```

这样访问数据时 `localhost: 8080/sit/sjfwefj/example/autor`

---

对于前端来说，掌握如何使用和自定义 npm 还是很必要的，一来在公司里很多有公司内部 npm，当你要对项目进行修改或重构时，有时候甚至需要修改原来写在 npm 里的一些数据；再者 npm 用的好，能够很好的提高效率，可以将常用的一些步骤给工具化。

今后如果我的个人 npm 达到一定规模时，会考虑将其开源在 Github 上。
