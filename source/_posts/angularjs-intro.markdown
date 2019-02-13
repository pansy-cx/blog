---
layout:     post
title:      "AngularJS 使用介绍"
date:       2018-05-11 15:20:00
tags:
    - AngularJS
---

### 入口

一个页面只能有一个 AngularJS 应用

```html
<div ng-app="app"></div>
```

```js
var app = angular.module('app', [])
```

### 控制器

用于连接页面与数据，定义数据和数据变化，添加页面交互逻辑等

```html
<div>{{name}}</div>
<button ng-click="goUrl">goUrl</button>
```

```js
app.controller('mainCtrl', ($scope, $http, $location) => {
    $scope.name = 'Virgil'  // $scope 为当前作用域，页面需要的数据都要在这里添加
    // 一般获取数据也都放控制器里
    $http.get('url', (res) => {
        $scope.data = res.data
    })
    $scope.goUrl = () => {
        $location.path('url')
    }
})
```

### 数据绑定

AngularJS 采用的是脏检测方式，当数据更新时，会隐式的调用 `$watch()` 方法，该方法会遍历当前作用域所有绑定的数据，即 $scope 上的数据。这就是为什么 AngularJS 要重写 $http 等方法，这些方法源码都是调用了 `$watch()`。

所以在使用 directive 时，需要显示的调用 `$watch()` 和 `$apply()` ，apply 作用全局， watch 作用当前。

以及对于一些不更新的数据进行绑定时，采用 `::val` 的绑定方式，只进行一次绑定，性能上会略微提高。

### 服务

服务（$provider）逻辑代码，用于存放公共代码或某个页面比较重的逻辑，以及公用变量，以便 controller 层尽可能的薄。

AngularJS 自带了 30 多个自建服务，如 $scope $http 等。通过注入机制（$inject）可以在任何页面中直接调用。

创建服务有 3 种方法和 2 个定义变量方法

- factory
- provider
- service
- value（定义变量）
- constant（定义常量）

factory、provider、service 其实在源码里是一个函数的三种不同调用方式，区别不大。

##### service

service 是用 new 关键字实例化的

```js
app.service('hexafy', () => {
    this.myFunc = function(x) {
        return x.toString(16)
    }
})
app.controller('myCtrl', ($scope, hexafy) => {
    $scope.hex = hexafy.myFunc(255)
})
```

##### provider

如果要在使用服务之前，先对服务进行一些配置操作，该怎么做？这时候就可以用上 provider ，provider 可以返回 $get 方法的内容。

```js
app.provider('getMsg', () => {
    let name = ''
    this.setName = function(val) {
        name = val
    }
    this.$get = function(val) {
        return name + 'is ' + val + ' age'
    }
})

app.config('getMsgProvider', () => {
    getMsgProvider.setName = 'Virgil'
})

app.controller('myCtrl', ($scope, getMsg) {
    getMsg.setName()   // Error
    $scope.msg = getMsg(18) // Virgil is 18 age
})
```

这里需要提一下 config，AngularJS 执行分为 config 和 run 两个阶段，服务里只有 provider 可以在 config 阶段中进行配置，通过 xx + Provider 调用 provider 里的方法，而到了 run 步骤，注入器只返回 $get 内的函数内容。

用过 AngularJS 路由的话应该就很好理解了。

```js
<script src="angular-route"></script>
var app = angular.module('app', ['ngRoute'])    // 添加 route 方法
app.config('routeProvider', () => {
    $routeProvider
        .when('/user', {
            templateUrl: 'user.html',
            controller: 'userCtrl'
        })
        .when('/about', {
            template: '<p>about</p>',
            controller: 'aboutCtrl'
        })
})
```

ngRoute 定义了 provider 方法，让用户可以在 config 阶段进行配置。

##### factory

factory 为 provider 的简写方式，源码里会把 factory return 的函数添加到 provider 的 $get 方法内。如果只是某个页面的复杂逻辑，不需要其他额外配置，建议使用 factory。

```js
app.factory('hexafy', () => {
    return function(x) {
        return x.toString(16)
    }
})
app.controller('myCtrl', ($scope, hexafy) => {
    $scope.hex = hexafy(255)
})
```

### 过滤器

```html
<div>{{name | uppercase}}</div> // 变大写字母
```

自定义过滤器，可直接在全局使用

```js
app.filter('format', () => {
    return function(val) {
        // ...
    }
})
```

### directive

太复杂，不讲了...

反正就是提供了类似组件的功能，还可以通过 directive 实现操作 DOM 等共用方法。

### 项目架构

首页一个总的 `angular.module('app', [...])` `[]` 里放导入的外部 js。

路由使用自带的 ngRoute，比较复杂的建议用 ui-route。

页面一个 html 对应一个 controller。

复杂逻辑或公共代码写在 factory，需要针对不同情况在 config 阶段进行配置的用 provider，在一个组件里在使用多个方法的用 service。

filter，constant，value 分 3 个文件，写在一块即可。

弹窗、密码框等组件用 factory 而不用 directive，用 directive 需要在对应 html 添加配置，不灵活。使用 factory 可以 `_tmpl = '<div></div>'`，然后 `angular.element()` 动态添加和销毁。这样可以摆脱页面的限制，在任何页面都可以直接调用方法。

directive 则更多用于监听 DOM 以及需要父子组件双向传值的情况，举个栗子🌰：

```js
app.directive('scrollLoading', () => {
  return {
    restrict: 'A',
    scope: {
      isBottom: '=bind'
    },
    link: function($scope, element, attrs) {
      element[0].addEventListener('scroll', function(e) {
        let target = e.target
        if (target.scrollTop + target.clientHeight === target.scrollHeight) {
          $scope.isBottom = true
          $scope.$apply()
        }
      })
    }
  }
})
```

一个简单的监听页面滚动底部的 directive，可以直接添加在某个 DOM 的属性上面

```html
<div scroll-loading></div>
```

然后在对应页面的 controller 里添加监听

```js
$scope.$watch('isBottom', (val) => {
    if (val) {
      getData()
      // ...
    }
})
```

That‘s all

