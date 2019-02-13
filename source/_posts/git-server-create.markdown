---
layout:     post
title:      "搭建 Git 服务器及配置 Hook"
date:       2018-02-02 23:25:00
tags:
    - Git
---

首先在服务器上配置 Git，这里用的是 Ubuntu

    sudo apt-get install git     安装 Git
    sudo adduser git         添加一个 git 用户

将 `id_rsa.pub` 公钥添加到到服务器 `/home/git/.ssh/authorized_keys`

选择一个文件夹作为 Git 仓库，假定在 `/home/git` 里

    sudo git init --bare sample.git
    sudo chown -R git:git sample.git    修改为 Git 的权限，否则会禁止访问

bare 是裸仓库，<a href="https://segmentfault.com/a/1190000007686496" target="_blank">裸仓库与普通仓库的区别</a>简单的理解，裸仓库用于远程服务器的上传，保存历史记录等各种信息，但不能操作 Git，不能保存文件，纯粹是为了共享。

然后客户端

    git clone git@server:/home/git/sample.git
    // 往里面添加内容
    git add .
    git commit -m '修改内容'
    git push origin master
    // 跟 GitHub 更新没什么差别

那么问题来了，裸仓库只用于共享，并没有保存文件，我要在服务器上获取文件，假定要 `/home/virgil/blog` 放本地上传的代码

    cd /home/virgil/blog
    git clone /home/git/blog.git
    // 之后在修改代码
    cd blog
    git pull

但是每次本地 push 完后还要在到服务器 pull 一次，很麻烦，幸好 Git 提供了 Hook 操作。

Hook 就是钩子的意思，比如说提交前触发，更新时触发，提交后触发之类。

在远程服务器，及裸仓库中，可以看到有一个 hooks 文件夹，里面放着各种各样钩子用法的例子，文件名去掉 .sample 就可以用，这里我用的是 post-receive，当我们在本地执行 push 命令到 git 服务器的时候，服务器会自动触发 post-receive 钩子。

    vim /home/git/sample.git/hooks/post-receive

里面内容

```vim
#!/bin/sh
cd /home/virgil/blog || exit
unset GIT_DIR # 还原环境变量，不加会报错
git pull origin master
```

保存后修改权限

    chmod +x /home/git/sample.git/hooks/post-receive

这里需要注意， `/home/virgil/blog` 也需要修改权限，修改为 git 权限，否则 `git pull` 时会访问不到权限

    chown -R git:git /home/virgil/blog

这样就 Ok 了，可以测试一下，在本地 push 之后服务器是否会自动 pull 代码下来。


