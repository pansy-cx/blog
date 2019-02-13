---
layout:     post
title:      "vue-cli webpack 配置笔记"
date:       2017-04-11 21:52:00
tags:
    - Vue
    - WebPack
---

<a href="http://idmrchan.com/2017/04/09/VueRouter-VueResource-webpack/" target="_blank">上一篇</a>

### 初始化

控制台输入：`vue init webpack test`   
前几下直接回车，到 `Install vue-router? (Y/n)` y，后面的什么 ` Use ESLint to lint your code ` 之类的，建议选择否。  
除了第一个问你是否安装 vue-router ，其他的是用来检查你的代码是否符合规范，缩进，空格，分号之类的。我觉得可烦。初学的时候总是报一大堆错误，导致我一直对 vue 官方的 webpack 模板有阴影，所以建议不要添加这些测试代码。

初始化成功后  

- cd test
- npm install     //安装依赖
- npm run dev     //启动服务
- npm run build   //发布代码

### 项目结构

原来的 webpack-config-js 拆分到 build 项目里面了，里面还有一些 express 配置。  
打开 webpack.base.conf.js 文件，可以看到。entry 还是 src/main.js , output 封装起来了

npm run build 可以看到，生成 dist 文件夹，并且包括 index.html 都配置好了，不需要在手动添加。  

接下来是一些 babel，vue，图片和 css 文件配置。详情可以看<a href="https://github.com/DDFE/DDFE-blog/issues/10" target="_blank">这里</a>  

直接用 vue-cli 创建，主要是因为配置好了 webpack 和 express 之间的热加载问题，使用同一个端口，可以实时查看编写的代码。如果不需要，其他的 vue 文件加载和 vue-router 等配置都挺简单的，可以直接用 webpack-simple。  

### 修改代码

##### 添加sass

控制台 ` npm install node-sass sass-loader --save-dev ` 添加到项目里  

打开 build/webpack.base.conf.js 

```js
...
var vueLoaderConfig = require('./vue-loader.conf')
...
module.exports = {
  ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig    //这里添加 sass
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      },
      ...
    ]
  }
}
```

图示代码处 vueLoaderConfig 似乎是将 vue 里面 css 文件处理成 map 还是单独的文件，反正看不懂，webpack-simple 内也没有，估计是扩展的功能，我感觉用不到，就替换为：

```js
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    loaders: {
      'scss': 'vue-style-loader!css-loader!sass-loader',
      'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
    }
  }
```

然后在 vue 模板里的  `<style></style>` 改成 `<style lang="scss"></style>`  
就可以使用 sass 了

##### vue-router

webpack 模板已经添加了 vue-router 功能  
打开 src/main.js 看到 ```import router from './router'``` 
打开 router/index.js

```js
import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
Vue.use(Router)               //vue2.0 语法
export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    }
  ]
})
```

webpack 模板已经都添加好了，我们可以在添加一个 /test 路径试试

components 里添加 test.vue  

```html
<template>
  <div class="test">
    <p>this is a test</p>
  </div>
</template>

<script>
export default {}     //一定得有
</script>

<style lang="scss">
.test {
  p {
    color: red;
  }
}
</style>
```

在刚才的 route 文件 index.js 里修改

```js
routes: [
  {
    path: '/',
    name: 'Hello',
    component: Hello
  },
  {
    path: '/test',
    name: 'test',
    component: test
  }
```

回到项目 localhost:8080/test 看看是否添加进来了，应该是没有。因为我们没有把 `<router-view></router-view>` 挂载到首页。这时候问题来了，添加到首页的内容应该放 App.vue 还是 Hello.vue 内好。我个人倾向于认为 App.vue 为首页，那就不需要 Hello.vue 

我们重新构造下逻辑结构
把 route 文件夹和模板给的 components/Hello.vue 文件删了  
修改 src/main.js 文件  

```js
import Vue from 'vue'
import App from './App'
import Router from 'vue-router'
import test from '@/components/test'

Vue.use(Router)

let routes = [
  {
    path: '/',
    name: 'index',
    component: App,     //把原来首页内容 Hello.vue 改为在 App.vue 内
    children: [
      {
        path: '/test', 
        name: 'test',
        component: test
      }
    ]
  }
];

let router = new Router({
  'linkActiveClass': 'active',
   routes // （缩写）相当于 routes: routes
});

let app = new Vue({
  router
}).$mount('#app');
  router.push('/test');     //默认打开的是 test路径

export default app;
```

我们把 main.js 和 router/index.js 整合到了一起，这个代码是 vue-router 官方下给的代码，我们就按照这样修改 ` router.push('/test') ` 可以让打开首页时自动进入 /test 路径。  

在 App.vue 下添加

```html
<template>
  <div>
    <img src="./assets/logo.png">
    <router-view></router-view>
  </div>
</template>
```

这样就清晰多了

##### mock 数据

首先添加一个 data.json 文件

```json
{
  "dataOne": {
    "name": "dataOne name",
    "content": [
      {
        "type": 0,
        "description": "hhhhhh"
      },
      {
        "type": 1,
        "description": "hhhhhh"
      }
    ]
  },
  "dataTwo": {
    "name": "dataTwo name",
    "content": [
      {
        "type": 0,
        "description": "hhhhhh"
      },
      {
        "type": 1,
        "description": "hhhhhh"
      }
    ]
  }
}
```

我随便写了一个数据，然后在首页 App.vue 内获取数据

```js
<script>
  import data from './data.json';

  export default {
    data() {
      return {
        dataOne: {}
      }
    },
    created() {
      this.dataOne = data.dataOne;
    }
  }
</script>
```

这样就获取了 data.json 内的 dataOne 数据，那接下来怎么添加到文件里面呢？  

我们在 components 下建一个 content.vue 文件，用来演示数据的传递

```html
<template>
  <div>
    <p>{{ dataOne.name }}</p>
  </div>
</template>

<script>
  export default {
    props: {
      dataOne: {
        type: Object
      }
    }
  }
</script>

<style lang="scss">
</style>
```

并在 App.vue 内注册 content.vue 并传递内容  

```html
<template>
  ...
  <v-content :dataOne='dataOne'></v-content>
  ...
</template>

<script>
  import content from './components/content.vue';
  import data from './data.json';
  export default {
    data() {
      return {
        dataOne: {}
      }
    },
    created() {
      this.dataOne = data.dataOne;
    },
    components: {
      'v-content' : content   // 不能使用 content 名字注册，这样可能会出现注册不成功，因为 vue 不允许使用 html 同名标签
    }
  }
</script>
```

此时就把内容添加到 content.vue 了，这是就可以查看下内容是否被添加进去。

##### 手机端查看

首先需要你的手机和电脑连接的是同一个网关，比如电脑开个 wifi 让手机连上。  
cmd 内 ipconfig ，查看自己的 ip 地址，将 localhost:8080 改成 [ip] + :8080 看看是不是还是原来的页面  
此时打开手机，输入 [ip] + :8080 ，就可以在手机上查看  
这也是我使用 vue-cli webpack 模板的一个原因，他可以实时在手机端修改代码，因为使用了 webpack-dev-middleware 和 webpack-hot-middleware 绑定了 webpack 内存和 express，实现了手机端的热加载

