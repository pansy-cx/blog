---
layout:     post
title:      "前端模块化构建及单元测试入门"
date:       2017-08-06 13:12:00
tags:
    - WebPack
---

最近在看 Vue 源码，对模块化构建印象很深，现在做个什么项目都习惯性把功能拆分出来。拆分之后，对每个模块进行测试也成了必不可少的步骤，所以又花了点时间学习前端单元测试。  
### 工具选择

首选自然是 WebPack，配置比 grunt 什么的方便多了，测试用的是 Karma  

### 模块化构建

首先安装 WebPack 和 babel，ES6 转 ES5 是必不可少的

    npm install --save-dev webpack babel-core babel-loader babel-preset-es2015

创建 .babelrc  

```json
{
    "presets": ['es2015']
}
```

创建 webpack.config.js

```js
var path = require('path')
module.exports = {
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loaders: 'babel-loader',
            query: {
                presets: ['es2015']
            },
            exclude: /node_modules/
        }]
    }
}
```

- entry：文件入口
- output：输出文件

创建 src/main.js 和 test.js

src/test.js

```js
export default function(a, b) {
    return a + b
}
```

src/main.js

```js
import test from './test'
console.log(test(1,2)) // 3
```

执行 `webpack -w` 就可以监听文件改变，实时生成 `bundle.js`
关于 import 语法可以看这篇 <a href="http://es6.ruanyifeng.com/#docs/module-loader" target="_blank">Module 的加载实现</a>

### 添加单元测试

单元测试使用 karma  
全局安装 karma-cli  

    npm install -g karma-cli

使用

    npm install -save-dev karma
    karma init

- 选 jasmine
- no 不使用 Require.js
- 选 PhantomJs 不在浏览器下查看
- test/\*\*/\*.spec.js
- no 不全局检查

自动生成 karma.conf.js 文件
package.json 会添加 3 个依赖 ` jasmine-core karma-jasmine  karma-phantomjs-launcher ` 有时候不会 -.-! 需要你自己添加  

创建 test/test.spec.js

```js
import assert from 'assert'
import test from '../src/test.js'

descript('test', function() {
    it('test(1, 2) => 3', function() {
        assert.equal(test(1,2), 3)
    })
})
```

执行程序 `karma start` ，因为我们没有开自动检查 (autoWatch: false) 所以在重新打开一个程序， 执行 `karma run`  
报错：
>SyntaxError: Use of reserved word 'import'  

PhantomJS 不支持 ES6 语法，需要安装 karma-babel-preprocessor 和 karma-webpack

    npm install --save-dev karma-babel-preprocessor karma-webpack

karma.conf.js 添加以下代码

```js
module.exports = function(config) {
  config.set({
    ...
    preprocessors: {
        'test/**/*.spec.js': ['webpack', 'babel']
    },

    babelPreprocessor: {
        options: {
            presets: ['es2015']
        }
    },
    ...
    })
}
```

在执行一次，OK。输出

    PhantomJS 2.1.1 (Windows 8 0.0.0): Executed 1 of 1 SUCCESS (0.004 secs / 0.002 secs)

-------- 跑来更新 -------------

### 如何比较对象

assert.eqaul 断言才用的是 == 符号，碰上对象就 GG 了，所以我们添加一个叫 chai 的东西

```js
$ npm install --save-dev chai
```

在 test/test.spec.js 中修改

```js
import chai from 'chai'
chai.should()

var a = 1
var b = {}
a.should.be.equal(1)
b.should.be.deep.equal({})
```





