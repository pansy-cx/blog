---
layout:     post
title:      "Vue 父子组件通信"
date:       2017-04-27 09:27:00
tags:
    - Vue
---

### prop 

在组件中，子组件需要获取父组件数据，父组件使用 v-bind 动态绑定数据，子组件使用 prop 获取：  

##### 父：
```html
<child v-bind:date="date"></child>
```

##### 子：
```js
props: {
    date: {
        type: String,
        defalut: '',    //可以指定默认值
    }
}
```

### 单向数据流

prop 是单向绑定的：当父组件的属性变化时，将传导给子组件，但是不会反过来。这是为了防止子组件无意修改了父组件的状态。每次父组件更新时，子组件的所有 prop 都会更新为最新值。所以当子组件修改 prop 时，Vue 会给出警告。  

所以我们应该  

- 定义一个局部变量，传递 prop 的值
- 使用计算属性，处理 prop

### 子组件传递数据  

使用 v-on 绑定事件  

- $on 监听
- $emit 触发事件

例子：  

##### 父：

```html
<template>
    <child v-on:change="changeBoo"></child>
</template>
<script>
    data() {
        return {
            booLean: false
        }
    }
    methods: {
        changeBoo() {
            this.booLean = true;
        }
    }
</script>
```

##### 子：

```html
<template>
    <div v-on:click="change"></div>
</template>
<script>
    data() {
        return {
            booLean: false
        }
    },
    methods: {
        change() {
            this.booLean = true;
            this.$emit('change');   //触发
        }
    }
</script>
```

在本例中，子组件已经和它外部完全解耦了。它所做的只是报告自己的内部事件  

<a href="https://cn.vuejs.org/v2/guide/components.html" target="_blank">组件</a>


