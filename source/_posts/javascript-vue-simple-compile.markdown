---
layout:     post
title:      "JavaScript 仿 vue 指令解析"
date:       2017-08-02 16:12:00
tags:
    - JavaScript
    - Vue
---

模仿 vue 实现指令解析。

### 效果

```js
var compile = new Compile({
    el: '#compile',
    data: {
        a: 'test model',
        b: 'hello World'
    },
    methods: {
        testToggle: function() {
            alert('successful');
        }
    }
});
```

```html
<div id="compile">
    <h2>{{ b }}</h2>
    {{ a }}
    <p x-html="b"></p>
    <input type="text" x-model="a">
    <button x-on:click="testToggle">test</button>
</div>
```

### 代码实现
首先创建一个名为 Compile 的函数，并在原型链上添加实现方法

```js
export function compile(vm) {
    var el = vm.$el
    // 获取文档碎片
    var fragment = nodeFragment(el)
    // 对指令进行解析
    compileElement(fragment, vm)
    // 添加 DOM
    el.appendChild(fragment)
}

```

##### createDocumentFragment

首先获取文档碎片(片段)  

```js
function nodeFragment(el) {
    var fragment = document.createDocumentFragment()
    var child

    while (child = el.firstChild) {
        fragment.appendChild(child)
    }

    return fragment
}
```

这里创建了一个 DocumentFragment 节点，看看 MDN 对 DocumentFragment 的解释：<a href="https://developer.mozilla.org/en-US/docs/Web/API/Document/createDocumentFragment" target="_blank">Document.createDocumentFragment()</a>

>DocumentFragments are DOM Nodes. They are never part of the main DOM tree. The usual use case is to create the document fragment, append elements to the document fragment and then append the document fragment to the DOM tree. In the DOM tree, the document fragment is replaced by all its children.
>Since the document fragment is in memory and not part of the main DOM tree, appending children to it does not cause page reflow (computation of element's position and geometry). Consequently, using document fragments often results in better performance.

DocumentFragments 是一个文档节点，用于创建文本片段，文档片段保存在内存里，修改后在添加到 DOM Tree 里，这样避免了直接操作文档节点导致页面不断刷新带来的性能下降。

获取到文本节点之后，在对文本节点进行解析  

```js
function compileElement(frag, vm) {
    var childNode = frag.childNodes
    var reg = /\{\{((?:.|\n)+?)\}\}/

    // 对每个节点进行判断
    slice.call(childNode).forEach(function (node) {
        // 如果是元素节点
        if (isElement(node)) {
            compileNode(node, vm)
        } else if (isTextType(node) && reg.test(node.textContent)) {
             // 如果是文本节点
            var exp = RegExp.$1.trim()
            comopileText(node, vm, exp)
        }

        // 对子节点进行递归解析指令
        if (node.childNodes && node.childNodes.length) {
            compileElement(node, vm)
        }
    })
}
```

如果是元素节点

```js
function compileNode(node, vm) {
    // 获取元素属性
    var nodeAttributes = node.attributes
    var name, value
    // 遍历元素属性
    slice.call(nodeAttributes).forEach(function(attr) {
        name = attr.name
        value = attr.value
        
        // 判断是否是 x- 指令
        if (name.indexOf('v-') === 0) {
            name = name.slice(2)

            if (name.indexOf(':') === -1) {
                direct[name] && direct[name](node, vm, value)
            } else if (/(\D+):(\D+)/.test(name)) {
                // v-on:click
                // dir -> on  exp -> click
                var dir = RegExp.$1
                var exp = RegExp.$2
                switch (dir) {
                    case 'on' :
                        direct.eventHandler(node, vm, exp, value)
                        break
                    case 'bind' :
                        direct.bindProp(node, vm, exp, value)
                }
            }
            node.removeAttribute(attr.name)
        }
    })
}
```

如果是文本节点
```js
function comopileText(node, vm, exp) {
    direct.text(node, vm, exp)
}
```

direct 是具体渲染视图步骤的代码，就不贴上来了

其中渲染步骤有个额函数需要注意

```js
function bind(node, vm, prop, dir) {
    var updaterFn = updater[dir + 'Updater']
    var val = vm[prop]
    updaterFn && updaterFn(node, val)

    new Watcher(vm, prop, function(value) {
        updaterFn && updaterFn(node, value)
    })
}
```

实例化了 Watcher 对象，将修改视图的方法添加给了 Watcher，这点接下来会讲到

对指令解析完后，在添加到 DOM Tree里

```js
this.$el.appendChild(this.$fragment);
```

这样就完成了简单地指令解析啦，当然，Vue本身的指令比这复杂的多，我只是实现了最简单的功能

