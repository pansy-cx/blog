---
layout:     post
title:      "vue-router + vue-resource + webpack 配置"
date:       2017-04-09 22:54:00
tags:
    - Vue
    - WebPack
---

# 安装

全局安装 vue-cli  ` npm install vue-cli -g `  

初始化  ` vue init webpack-simple test `  
webpack-simple 是官方 webpack 模板的简化版，已经包含大部分基础功能，故选择简化版。test 是文件夹名字  
接下来就一路回车。

使用 `npm install` 安装， `npm run dev` 使用

### 项目结构

- src 存放工程结构
- .babelrc 是 ES6 配置
- .gitignore 是 github 文件，可以让 git 上传时默认忽视某些文件
- .index.html
- .package.json node 初始化配置文件
- README.md
- webpack.config.js webpack 配置，下面详细讲解

##### package.json

```json
{
    ......
    // 脚本
    "scripts": {
        "dev": "cross-env NODE_ENV=development webpack-dev-server --open --hot",
        "build": "cross-env NODE_ENV=production webpack --progress --hide-modules"
    },
    "dependencies": {
        "vue": "^2.2.1"
    },
        "devDependencies": {
        "babel-core": "^6.0.0",             //babel
        "babel-loader": "^6.0.0",
        "babel-preset-latest": "^6.0.0",
        "cross-env": "^3.0.0",              //跨平台环境配置
        "css-loader": "^0.25.0",            //loader css、file、vue
        "file-loader": "^0.9.0",
        "vue-loader": "^11.1.4",
        "vue-template-compiler": "^2.2.1",  //vue 模板编译器
        "webpack": "^2.2.0",
        "webpack-dev-server": "^2.2.0"      //热配置
    }
}
```

package.json 初始添加了一些模块，包括 babel、文件loader、webpack-dev-server 等功能。 ` npm install ` 就是从这里添加模块

##### webpack.config.js

```js
module.exports = {
  entry: './src/main.js',   //入口文件
  output: {
    path: path.resolve(__dirname, './dist'),    //输出目录
    publicPath: '/dist/',
    filename: 'build.js'                        //输出文件名
  },
  module: {
    rules: [
    //loader 装载
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  //vue2.0 别名设置
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.js'
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}
```

### 添加 vue-resource mock 数据

使用 ` npm install vue-resource --save-dev` 安装至项目

src/main.js 

```js
import Vue from 'vue'
import App from './App.vue'

new Vue({
  el: '#app',
  render: h => h(App)   //vue 2.0
})
```

添加 vue-resource

```js
import VueResource from 'vue-resource';
Vue.use(VueResource);
```

src/App.vue

```js
<script>
import data from './data.json';
export default {
    data() {
        return {
            seller: {}
        }
    },
    created() {
        this.seller = data.seller;
    }
}
</script>
```

### 添加 vue-router 功能  

添加 `npm install --save-dev vue-router`

在 src/components 下新建 test.vue

test.vue

```html
<template>
    <div>
        <p>this is test</p>
    </div>
</template>

<script>
    export default {}
</script>

<style></style>
```

所有 vue 模板都要有 template(html) 、 script 、 style 三部分  

src/main.js  

```js
import VueRouter from 'vue-router';
Vue.use(VueRouter);

let routes = [
    {
        path: '/',
        name: 'index',
        component: App,
        children: [
            {path: '/test',component: test}
        ]
    }
];
let router = new VueRouter({
    'linkActiveClass': 'active',
    routes
});
let app = new Vue({
    router
}).$mount('#app');
    router.push('/test');  //直接打开 localhost://test
export default app;
```

src/App.vue

```html
<template>
  <div>
        <router-view></router-view>
  </div>
</template>
```

打开 `localhost:8080/test` 看看内容是否添加了
