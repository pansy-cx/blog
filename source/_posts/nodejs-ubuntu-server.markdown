---
layout:     post
title:      "Ubuntu 服务器上使用 NodeJs"
date:       2017-08-27 17:32:00
tags:
    - NodeJS
    - Linux
---

### 安装 nodejs

进官网下载源码（source code），可以看到下载路径如下 ` https://nodejs.org/dist/v6.11.2/node-v6.11.2.tar.gz `
在服务器上下载源码

    wget https://nodejs.org/dist/v6.11.2/node-v6.11.2.tar.gz
    tar zxvf node-v6.11.2.tar.gz    解压缩
    cd node-v6.11.2

下载安装 node 所需要的包

    apt-get update
    apt-get install python gcc make g++

然后运行 .configure 文件

    .\configure
    make install
    node -v     测试安装成功与否

### 在普通用户下而非 root 用户运行 Node

新建一个 virgil 的用户

    useradd -m -s /bin/bash virgil
    passwd virgil
    su virgil   登陆到新用户

此用户文件存放位置在 `/home/virgil` 下
然后就可以把写好的 NodeJs 程序通过 FTP 上传到该目录下 

### pm2 管理 node
pm2 可以防止 node 程序崩溃后中断

再次登陆 root 用户，执行 `exit`

    npm install pm2 -g

在进入 virgil 用户 `su virgil`

使用 pm2 启动 node 程序如下

- pm2 start app.js    启动程序
- pm2 list            查看启动的程序
- pm2 stop *id        结束程序
- pm2 startup         开机启动

### 设置代理和跨域请求

这个是属于 NodeJs，或者是 Http 的知识了，刚好做项目遇到，就顺便记下来( ╯□╰ )

当遇到跨域问题时，用 NodeJs 转发数据时在头文件处添加如下代码即可：

```js
res.header("Access-Control-Allow-Origin", "*")
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
```

我的服务器在国外，爬去网易云歌曲路径时，因为是在国外，会获取不到，这时在头文件添加一行代理就可以解决，将 IP 指向国内

```js
res.header("X-Real-IP", IP)
```