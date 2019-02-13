---
layout:     post
title:      "JS 模块化笔记"
date:       2017-03-07 17:13:00
tags:
    - JavaScript
---

### 什么是 JS 模块化

模块化设计是指在对一定范围内的不同功能或相同功能不同性能、不同规格的产品进行功能分析的基础上，划分并设计出一系列功能模块，通过模块的选择和组合可以构成不同的产品，以满足市场的不同需求的设计方法。  

随着网页变复杂，JS模块化成了必不可少的迫切需求，然而 JS 不是一种模块化的语言，他不支持「类」(class)，更不支持「模块」(module)。（ES6 正在支持）。在 ES6 正式发布之前，Javascript 社区做了很多努力，在现有的运行环境中，实现「模块」的效果。  

##### 最简单的 JS 代码  
  
```js
function a(){/* code */};
function b(){/* code */};
```

全局命名，容易起冲突。  

##### 使用方法来命名函数 (namespace) 
   
```js
var obj1 = {
  a: function(){};
  b: funciton(){};
}
obj1.a();
```

稍微减少全局数量，但本质是对象，不安全  

##### 立即执行函数(IIFE) 写法  
  
```js
var Module = (function(){
    var _count = 0;
    var a = function(){
      console.log(_count);
    };

    return {
      a: a
    };
  })()
```

使用闭包，可使外部无法直接读取内部 _count 变量_

##### 引入依赖  

如果一个模块过大，或需要继承另一个模块，则需要引入模块。  

```js
var module = (function($){
    var _$body = $('body');   //jQuery 方法
    var a = function(){}
  })(jQuery)
```

这就是所谓的模块模式。
  
### 加载 `<script>`

```html
<script src="module1.js"></script>
<script src="module2.js"></script>
<script src="libraryA.js"></script>
<script src="module3.js"></script>
```

这是最原始的 JavaScript 文件加载方式，如果把每一个文件看做是一个模块，那么他们的接口通常是暴露在全局作用域下，也就是定义在 window 对象中，不同模块的接口调用都是在一个作用域中。

这种原始的加载方式暴露了一些显而易见的弊端：

- 全局作用域下容易造成变量冲突  
- 文件只能按照 `<script>` 的书写顺序进行加载  
- 开发人员必须主观解决模块和代码库的依赖关系  
- 在大型项目中各种资源难以管理，长期积累的问题导致代码库混乱不堪  

一些复杂的框架，会使用命名空间的概念来组织这些模块的接口，典型的例子如 YUI 库。  
因为 YUI 以不再维护，我就不看了。。。

### 模块化使用  

##### CommonJS 

CommonJS 是一套规范，为了解决 JavaScript 的作用域问题而定义的模块形式，可以使每个模块它自身的命名空间中执行。该规范的主要内容是，模块必须通过 module.exports 导出对外的变量或接口，通过 require() 来导入其他模块的输出到当前模块作用域中。  

NodeJs 就采用了这么一种规范，他是这么在加载模块的。  
  
```js
//module1.js
module.exports = function(){
  return 'hello world';
}
```

```js
//module2.js
var mod = require('./module1');
console.log(mod);
```

这种写法适合服务端，因为在服务器读取模块都是在本地磁盘，加载速度很快。但是如果在客户端，加载模块的时候有可能出现「假死」状况。必须的等一个加载完毕后才能执行下一个。如何异步加载？ 

##### AMD  

「Asynchronous Module Definition」，这种规范是异步的加载模块， requireJs 应用了这一规范。先定义所有依赖，然后在加载完成后的回调函数中执行：  
  
```js
// AMD 默认推荐的是
define(['./a', './b'], function(a, b) {  // 依赖必须一开始就写好    
  a.doSomething()  
  b.doSomething()    
  //...
})
```

优点：  
- 适合在浏览器异步加载  

缺点：
- 代码阅读顺序困难，需提前加载所有模块  
- 不符合通用模块化思维方式，使一种妥协的实现  

实现：
- require.js  
- curl  

##### CMD 
  
「Common Module Definition」，CMD 也是异步加载，依赖就近，需要时在进行 require 
  
```js
define(function(require, exports, module) {   
  var a = require('./a')   // 依赖可以就近书写
  a.doSomething()   
  var b = require('./b')    
  b.doSomething()  
  // ...
}
```

优点：  
- 依赖就近，延迟执行   

缺点：
- 依赖 SPM 打包，模块的加载逻辑偏重  

实现：
- sea.js  
- coolie  

##### CommonJS、AMD、CMD 区别：
  
- AMD/CMD 都是异步模块定义  
- AMD是提前加载，CMD是按需加载  
- 二者都是 CommonJS 的一种规范实现定义

##### ES6 module  
  
EcmaScript6 标准增加了 JavaScript 语言层面的模块体系定义。ES6 模块的设计思想，是尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量。CommonJS 和 AMD 模块，都只能在运行时确定这些东西。  
  
```js
import "jquery";
export function doStuff() {}
module "localModule" {}
```

实现：
- Babel

### webpack  
在上面的分析过程中，我们提到的模块仅仅是指 JavaScript 模块文件。然而，在前端开发过程中还涉及到样式、图片、字体、HTML 模板等等众多的资源。这些资源还会以各种方言的形式存在，比如 coffeescript、 less、 sass、众多的模板库、多语言系统（i18n）等等。  
webpack 就是将他们都视作模块并通过 require 方式加载。  
在编译的时候，要对整个代码进行静态分析，分析出各个模块的类型和它们依赖关系，然后将不同类型的模块提交给适配的加载器来处理。比如一个用 LESS 写的样式模块，可以先用 LESS 加载器将它转成一个CSS 模块，在通过 CSS 模块把他插入到页面的 `<style>` 标签中执行。  

### webpack、AMD/CMD、Gulp/Grunp 关系  

- Gulp/Grunt 是一种工具，能够优化前端工作流程。使用 Gulp/Grunt，然后配置需要的插件，就可以实现如自动刷新页面、combo、压缩 css、js、编译 less 等等。  
- AMD/CMD 则是一种模块化的概念，他的具体实现使 requirejs/seajs 。通过在页面上加载一个 CMD/AMD 解释器，让浏览器识别 define、Module 等东西，属于在线「编译」模块的方案  
- 而 webpack 同类还有 browserify，则是预编译模块，现在本地编写 JS，不管是 AMD/CMD 都可以，并编译成浏览器认识的 JS  

### 参考文章  

- <a href="http://huangxuan.me/js-module-7day/#/" target="_blank">黄玄-JavaScript 模块化七日谈</a>
- <a href="http://zhaoda.net/webpack-handbook/module-system.html" target="_blank">WebPack中文指南</a>
- <a href="https://www.zhihu.com/question/37020798" target="_blank">知乎问题</a>



