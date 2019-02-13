---
layout:     post
title:      "从 Vue 源码学前端（01） —— 找到入口文件"
date:       2017-12-24 19:32:00
tags:
    - Vue
---

### 引言

距之前看 underscore 源码之后，我又开了个坑，这次看 Vue 源码。  

看源码之前，首先要先明确一点，看源码的目的是什么，之前看 underscore 是为了「理解」 JavaScript，学习 JS 的特性、用法，去理解它，发现 JS 不一样的世界。妈蛋真是越说越玄。总之，之前看源码是为了从入门到掌握而打的基本功。

而学习 Vue 呢，一开始是出于好奇，从来没见过 JS 还可以这么用，这么简便，自然就想去知道是怎么实现的。以前也看过一部分源码，比如前端路由的实现，双向绑定之类的，但仍然不过瘾。现在正好有时间，打算从头到尾看一遍，了解大神们是怎么构建工程，优化代码，造轮子的思想，神奇的功能等等等等。

话不多说，万事开头难，先把东西下下来再说，从 GitHub 上 clone 项目下来，现在是 2.5.11 版本，先看看构造，哇一大堆，还好之前用过 vue-cli，入门了点 WebPack 知识，不至于看不懂。先把重点挑出来：

- build：WebPack 及其他一些自动化工具的配置
- dist：工程输出文件
- example：例子，应该会很用用
- src：项目代码全在这里吗
- test：测试用的
- package.json：这就不用说了

### 输出文件

先来瞟一眼 dist 里面的文件，除了 vue.js 和 vue.min.js 以外居然还有其他一堆文件，还好作者贴心的提供了 <a href="https://github.com/vuejs/vue/blob/dev/dist/README.md" target="_blank">README.md</a>。

![](http://p8hsqsg3r.bkt.clouddn.com/dist.readme.png)

很明白，production 是两个 min 文件，用于项目正式使用。

根据功能还分为 Full、Compiler、Runtime：

- Full：包括 Compile 和 Runtime 两部分功能
- Compile：compiling template strings into JavaScript render functions（我发现我能看到不会翻译）就是将 template 解析成 js 代码。
- Runtime：除了 Compile 的其他功能，比如 Virtual DOM 等。

根据使用方式分为 UMD、CommonJS、ES Module：

- UMD：JS 正常的加载方式，源码是长这样，很熟悉。

```js
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Vue = factory());
}(this, (function () { 'use strict';
// ...
})));
```

- CommonJS：Node 的加载方式，就是你用 require() 方法调用加载的是这个文件。最后一行： module.exports = Vue$3;
- ES Module：ES6 的加载方式，import 方式调用的是这个文件。和 CommonJS 源码一样，只有最后一行不同：export default Vue$3;

module.exports 和 export 有什么区别？

我们知道 Node 是根据 CommonJS 引用规范的，每个文件就是一个模块，有着自己的作用域，module 代表的就是模块本身，其中 exports 属性是对外的接口，加载某个模块，就是加载 module.exports。而 Node 还给每个模块提供了一个 exports 变量：var exports = module.exports。所以 exports 或 module.exports 指向了新的对象，exports 和 module.exports 就切断了联系。

ES6 则是用 export 和 import 来导出导入模块，export 不同的是可以按需加载。

### 查找入口文件

看一下 package.json 的 script。

```json
"dev": "rollup -w -c build/config.js --environment TARGET:web-full-dev",
"dev:cjs": "rollup -w -c build/config.js --environment TARGET:web-runtime-cjs",
"dev:esm": "rollup -w -c build/config.js --environment TARGET:web-runtime-esm",
"dev:test": "karma start test/unit/karma.dev.config.js",
"dev:ssr": "rollup -w -c build/config.js --environment TARGET:web-server-renderer",
"dev:compiler": "rollup -w -c build/config.js --environment TARGET:web-compiler ",
"dev:weex": "rollup -w -c build/config.js --environment TARGET:weex-framework",
"dev:weex:factory": "rollup -w -c build/config.js --environment TARGET:weex-factory",
"dev:weex:compiler": "rollup -w -c build/config.js --environment TARGET:weex-compiler "
```

Rollup 是一个 JavaScript 模块打包器，不同的 dist 输出就是根据 Rollup 来控制的，可以看到引用的文件是 build/config.js，在看看 build/config.js。

```js
const builds = {
  // Runtime only (CommonJS). Used by bundlers e.g. Webpack & Browserify
  'web-runtime-cjs': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.common.js'),
    format: 'cjs',
    banner
  },
  // Runtime+compiler CommonJS build (CommonJS)
  'web-full-cjs': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.common.js'),
    format: 'cjs',
    alias: { he: './entity-decoder' },
    banner
  },
  // ...
}
```

resolve 是一个查找文件的函数，不重要，entry-runtime.js 和 entry-runtime-with-compiler 分别是 Runtime 和 Full 版，看一下这两个文件。

entry-runtime.js

```js
/* @flow */
import Vue from './runtime/index'
export default Vue
```

entry-runtime-with-compiler.js

```js
import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'
// ...
export default Vue
```

这些多出来的，就是 template 解析器的函数了，现在重点不是 template，可以看到两个文件都引用了 ./runtime/index，跟着代码查过去。

```js
/* @flow */

import Vue from 'core/index'
import config from 'core/config'
import { extend, noop } from 'shared/util'
import { mountComponent } from 'core/instance/lifecycle'
import { devtools, inBrowser, isChrome } from 'core/util/index'

import {
  query,
  mustUseProp,
  isReservedTag,
  isReservedAttr,
  getTagNamespace,
  isUnknownElement
} from 'web/util/index'

import { patch } from './patch'
import platformDirectives from './directives/index'
import platformComponents from './components/index'

// install platform specific utils
Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
Vue.config.isReservedAttr = isReservedAttr
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknownElement = isUnknownElement

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop

// public mount method
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}

// devtools global hook
/* istanbul ignore next */
Vue.nextTick(() => {
  if (config.devtools) {
    if (devtools) {
      devtools.emit('init', Vue)
    } else if (process.env.NODE_ENV !== 'production' && isChrome) {
      console[console.info ? 'info' : 'log'](
        'Download the Vue Devtools extension for a better development experience:\n' +
        'https://github.com/vuejs/vue-devtools'
      )
    }
  }
  if (process.env.NODE_ENV !== 'production' &&
    config.productionTip !== false &&
    inBrowser && typeof console !== 'undefined'
  ) {
    console[console.info ? 'info' : 'log'](
      `You are running Vue in development mode.\n` +
      `Make sure to turn on production mode when deploying for production.\n` +
      `See more tips at https://vuejs.org/guide/deployment.html`
    )
  }
}, 0)

export default Vue
```

妙呀，我感觉我找到入口了，可以从这个文件和 core/index 文件开始看了。

