---
layout:     post
title:      "Vue 数据绑定与视图更新"
date:       2017-08-02 22:32:00
tags:
    - Vue
---

### 监听数据

众所周知，监听数据是通过 Object.defineProperty 这个属性，为其设置特殊的 getter / setter，并在 setter 中触发监听

```js
function observe(value, vm) {
    if (!value || typeof value !== 'object') {
        return
    }
    var ob = new Observer(value)
    return ob
}
function defineReactive(obj, key, val) {
    var dep = new Dep()
    // 对子元素也进行绑定
    var childOb = observe(val)
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function() {
            if (Dep.target) {
                dep.depend()
                if (childOb) {
                    childOb.dep.depend()
                }
            }
            return val
        },
        set: function(newVal) {
            if (newVal === val) {
                return
            }
            val = newVal
            childOb = observe(newVal)
            // 更新数据
            dep.notify()
        }
    })
}
```

其中用到了 getter 和 setter 都用到了 dep 的方法，dep 是用来和 Watcher 进行双向绑定的  

### 添加 Watcher

```js
// dep.js
let uid = 0
function Dep() {
    this.id = uid++
    this.subs = []
}
Dep.target = null
// Dep.target 指向 Watcher 时触发，调用 Watcher addDep 方法
Dep.prototype.depend = function() {
    Dep.target.addDep(this)
}
```

```js
// Watcher.js
function Watcher(vm, exportFn, cb) {
    this.vm = vm
    this.cb = cb
    this.depIds = {}
    // ...
}
Watcher.prototype.addDep = function(dep) {
    if (!this.depIds.hasOwnProperty(dep.id)) {
        dep.addSub(this)
        this.depIds[dep.id] = dep
    }
}
Watcher.prototype.get = function() {
    Dep.target = this
    // Dep.target 指向 Watcher 时，get value 触发 dep.depend()    
    var value = this.getter.call(this.vm, this.vm)
    Dep.target = null
    return value
}
```

事情是这样的，先看 ` Watcher.prototype.get `，这是 `Watcher` 用来获取数据的方法，获取时，会将 `Dep.target` 指向自身，然后执行 ` this.getter.call(this.vm, this.vm) ` 时获取数据  
而 `defineProperty` 定义的 `getter` 有这么行代码  

```js
if (Dep.target) {
    dep.depend()
}
```

当 `Dep.target` 有指向时，调用 `dep.depend()` 方法， `depend()` 方法则是又调用了 `Watcher.addDep()` 方法，如果还没有添加 watch，则添加到 depIds 同时 调用 `dep.addSub()` 方法，addSub() 也将当前 Watcher 添加上去  

画个流程图  
 ![](http://p8hsqsg3r.bkt.clouddn.com/watcher-dep-bind.png)

简单地说，就是当 Watcher 获取元素时，把自己挂载到 dep 上，至于为什么要这样做，看看 setter

### 更新视图

```js
set: function(newVal) {
    // 更新数据
    dep.notify()
}
```

```js
Dep.prototype.notify = function() {
    this.subs.forEach(function(sub) {
        sub.update()
    })
}
```

this.subs 是一个数组，放的就是 addSub 时的 Watcher 对象，执行 ` Watcher.update() `

```js
Watcher.prototype.update = function() {
    var value = this.value
    var newVal = this.get()

    this.value = newVal
    this.cb.call(this.vm, newVal)
}
```


this.cb 是什么？这得看 compile 这个函数，在上一篇<a href="http://localhost:4000/2017/08/02/javascript-vue-simple-compile/" target="_blank">JavaScript 仿 Vue 指令</a>有讲到  

```js
// compile.js
function bind(node, vm, prop, dir) {
    var updaterFn = updater[dir + 'Updater']
    var val = vm[prop]
    updaterFn && updaterFn(node, val)

    new Watcher(vm, prop, function(value) {
        updaterFn && updaterFn(node, value)
    })
}
```

new Watcher 里的函数就是 this.cb，updaterFn 是更新视图的函数，比如说 `node.innerHTML = value` 这样的

所以说，当执行 `Watcher.update()` 就将更新后的数据渲染到屏幕是，就达到了实时更新的效果

### 数组
如果更新的数据是个数组，我们要怎么监听到数组的改变呢？Vue 采取的是对每个可能改变数据的方法进行 prototype 更改

```js
// observer/array.js
[
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]
.forEach(function(method) {
    var original = arrayMethods[method]
    def(arrayMethods, method, function() {
        var i = arguments.length
        var args = new Array(i)
        while (i--) {
            args[i] = arguments[i]
        }
        var result = original.apply(this, args)
        var ob = this.__ob__
        var inserted
        switch (method) {
            case 'push' :
                inserted = args
                break
            case 'unshift' :
                inserted = args
                break
            case splice :
                inserted = args.slice(2)
                break
        }
        // 如果数据改变了，就触发 dep.notify 方法
        if (inserted) ob.observeArray(inserted)
        ob.dep.notify()

        return result
    })
})
```

这个方法有两个问题：
- 无法监听数组 length 的改变
- 通过下标法改变的数据无法实时监听，如 `a[2] = 2`

为此 Vue.js 在文档中明确提示不建议直接角标修改数据（其实我看文档时根本没注意到）  
<a href="http://jiongks.name/blog/vue-code-review/" target="_blank">Vue.js 源码学习笔记</a>  原文在这





