---
layout:     post
title:      "JavaScript MVC 简单实现"
date:       2017-06-21 11:32:00
tags:
    - JavaScript
---

原代码地址：<a href="http://www.cnblogs.com/tugenhua0707/p/5156179.html" target="_blank">理解javascript中实现MVC的原理</a>，侵删，我只是用自己的话复述一遍。  

- M(Model) 模型用于封装数据及数据处理方法
- V(View) 视图实时更新数据，包括事件注册
- C(ontroller) 控制器接收用户的操作，最主要是订阅视图层的事件
- Event 发布订阅模式，让多个观察者同时监听，当一个事件发生改变，所有依赖都将得到通知

把原帖 jQuery 部分用 JS 重写了，代码如下：

HMTL：
```hmtl
<select id="list" size="10" style="width: 10rem"></select><br/>
<button id="plusBtn">  +  </button>
<button id="minusBtn">  -  </button>
```

JS:
```js
// 模型：用于封装数据及数据处理方法
function Mode(elems) {
    this._elems = elems;
    this._selectedIndex = -1;

    // 模型监听 Event
    this.itemAdd = new Event(this);
    this.itemRemove = new Event(this);
    this.selectedIndexChange = new Event(this);
};
Mode.prototype = {
    constructor: 'Mode',
    getItem: function() {
        return [].concat(this._elems);
    },
    addItem: function(elem) {
        this._elems.push(elem);
        // 改变时让 Event 得到通知
        this.itemAdd.notify({elem: elem});
    },
    removeItem: function(index) {
        this._elems.splice(index, 1);
        this.itemRemove.notify({elem: index});
    },
    getSelectedItem: function() {
        return this._selectedIndex;
    },
    setSelectedItem: function(index) {
        var previousIndex = this._selectedIndex;
        this._selectedIndex = index;
        this.selectedIndexChange.notify({previous: previousIndex});
    }
};

// 发布订阅模式，让多个观察者同时监听，当一个事件发生改变，所有依赖都将得到通知
function Event(observer) {
    this._observer = observer;
    this._listeners = [];
};
Event.prototype = {
    constructor: 'Event',
    attach: function(listeners) {
        this._listeners.push(listeners);
    },
    notify: function(objs) {
        for(var i = 0, len = this._listeners.length; i < len; i++) {
            this._listeners[i](this._observer, objs);
        }
    }
};

// 视图：实时更新数据，包括事件注册
function View(model, elements) {
    this._model = model;
    this._elements = elements;
    this.listModified = new Event(this);
    this.addButtonClicked = new Event(this);
    this.delButtonClicked = new Event(this);
    var that = this;
    this._model.itemAdd.attach(function() {
        that.rebuildList();
    });
    this._model.itemRemove.attach(function() {
        that.rebuildList();
    });
    this._elements.list.addEventListener('change', function(e) {
        that.listModified.notify({index: e.target.selectedIndex});
    });
    this._elements.addButton.addEventListener('click', function(e) {
        that.addButtonClicked.notify();
    });
    this._elements.delButton.addEventListener('click', function(e) {
        that.delButtonClicked.notify();
    });
};
View.prototype = {
    constructor: 'View',
    show: function() {
        this.rebuildList();
    },
    rebuildList: function() {
        var list = this._elements.list,
            items,
            key,
            value = '';
        items = this._model.getItem();

        for (key in items) {
            if (items.hasOwnProperty(key)) {
                value += '<option value ="' + items[key] + '">' + 
                        items[key] + '</option>';
            }
        }
        list.innerHTML = value;
        this._model.setSelectedItem(-1);
    }
};

// 控制器：控制器接收用户的操作，最主要是订阅视图层的事件
function Controller(model, view) {
    this._model = model;
    this._view = view;
    var that = this;

    this._view.listModified.attach(function(sender, args) {
        that.updateItem(args.index);
    });
    this._view.addButtonClicked.attach(function() {
        that.addItem();
    });
    this._view.delButtonClicked.attach(function() {
        that.delItem();
    })
};
Controller.prototype = {
    constructor: 'Controller',
    addItem: function() {
        var item = window.prompt('Add item', '');

        if (item) {
            this._model.addItem(item);
        }
    },
    delItem: function() {
        var index = this._model.getSelectedItem();

        if (index !== -1) {
            this._model.removeItem(index);
        }
    },
    updateItem: function(index) {
        this._model.setSelectedItem(index);
    }
};
```

调用方式

```js
(function () {
    var model = new Mode(['PHP', 'JavaScript']),
        view = new View(model, {
          'list' : document.getElementById('list'),
          'addButton' : document.getElementById('plusBtn'),
          'delButton' : document.getElementById('minusBtn'),
         }),
        controller = new Controller(model, view);        
    view.show();
})();
```

这里不讲抽象的东西，讲具体的实现。  
MVC 三层都以观察者模式监听 Event() 方法，当有改变时，告诉 Event()，让所有观察 Event() 的方法都得到通知。

```js
function Mode(elems) {
    // ...
    
    // 模型监听 Event
    this.itemAdd = new Event(this);
    this.itemRemove = new Event(this);
    this.selectedIndexChange = new Event(this);
};
Mode.prototype = {
    // ...
    addItem: function(elem) {
        this._elems.push(elem);
        // 改变时让 Event 得到通知
        this.itemAdd.notify({elem: elem});
    },
    // ...
}
```

当 addItem 改变时，通知 Event。  

举个例子：添加按钮  
点击添加按钮时  
```js
this.addButtonClicked = new Event(this);
this._elements.addButton.addEventListener('click', function(e) {
    that.addButtonClicked.notify();
});
```

其中 `this._elements.addButton` 是传入的 Button DOM，调用了 Event 的 notify 方法  

```js
attach: function(listeners) {
    this._listeners.push(listeners);
},
notify: function(objs) {
    for(var i = 0, len = this._listeners.length; i < len; i++) {
        this._listeners[i](this._observer, objs);
    }
}
```

this._listeners 从 attach 这添加，attach 在哪添加的，是在 Controller 层中，因为当某一个主题对象发生改变的时候，所有依赖它的对象都会得到通知。  

```js
this._view.addButtonClicked.attach(function() {
    that.addItem();
});
```

调用 controller 自身的 addITem() 方法

```js
addItem: function() {
    var item = window.prompt('Add item', '');

    if (item) {
        this._model.addItem(item);
    }
}
```
用户输入添加的内容，又调用了视图层的 addItem 方法

```js
addItem: function(elem) {
    this._elems.push(elem);
    // 改变时让 Event 得到通知
    this.itemAdd.notify({elem: elem});
}
```
Event 得到通知后，View 也监听这个消息

```js
this._model.itemAdd.attach(function() {
    that.rebuildList();
});
```

rebuildList 为具体事件
