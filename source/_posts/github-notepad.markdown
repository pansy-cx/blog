---
layout:     post
title:      "Github 笔记"
date:       2017-03-24 22:45:00
tags:
    - Git
---

<a href="http://rogerdudler.github.io/git-guide/index.zh.html" target="_blank">新手指南</a>

### git 配置
  
下载完 git 之后，需要进行一些 SSH，邮箱用户等配置  

##### SSH

什么是 SSH？简单点说，SSH是一种网络协议，用于计算机之间的加密登录。而 Github 就是利用你的 SSH 来对你进行身份验证。所以想在 Github 上提交代码，第一步就是添加 ssh key 配置。  

在 Windows ，安装 Git 后会自动安装 SSH。  
  
- cmd 输入 ssh，看是否安装成功
- `ssh-keygen -t rsa` 指定 rsa 算法生成密匙，然后生成 id_rsa 和 id_rsa.pub  
- 打开 Github 界面，settings —— SSH and GPG keys —— NEW SSH key  
- 把 id_rsa.pub 内容添加进来
- cmd 输入 `ssh -T git@github.com` 进行测试

##### 设置邮箱与用户名  

    git config —global user.name “name”  
    git config —global user.email “name@gmail.com”

### 术语解释  

##### Repository：仓库

一个仓库包括了所有的版本信息、所有的分支和标记信息  

- git init 新建仓库
- git clone 克隆分区到本地

##### 工作流

本地仓库由 git 维护的三棵「树」。第一个是工作目录，第二个是暂存区，最后是 HEAD，指向最后一次提交结果。

##### Workspace：工作区 

- 执行 `git add .` 命令相当于把代码改动提交到暂存区  
- `git pull` 将远程仓库的数据拉到本地仓库并合并    

##### Index：暂存区
- `git commit -m '说明'` 相当于把改动提交到了当前分支(HEAD)  

##### Branches：分支
  
可以从已有的代码中生成一个新的分支，这个分支与剩余的分支完全独立。默认的分支往往是叫master。  

    git checkout -b [baranch-name] 创建新分支
    git checkout master  切换回主分支
    git branch -d [baranch-name]  删除分支
    git push origin [branch-name]  上传分支

##### Tags：标记

- 标记指的是某个分支某个特定时间点的状态。通过标记，可以很方便的切换到标记时的状态。
- `git tag 1.0.0 1b2e1d63ff`  创建一个叫 1.0.0 的标签
- 1b2e1d63ff 是你想要标记的提交 ID 的前 10 位字符，可用 `git log` 获取提交的 ID

### 上传

以 test 项目为例。  
在本地执行 `git clone https://github.com/pansy-cx/test.git` 

这样就把 test 项目 clone 到了本地，这个时候该项目本身就已经是一个git 仓库了，不需要执行 git init 进行初始化，而且甚至都已经关联好了远程仓库，我们只需要在这个 test 目录下任意修改或者添加文件，然后进行 commit 。  
接下来执行代码：  

    git add .     提出更改 添加到暂存区
    git commit -m 'commit'  提交到 HEAD
    git push origin master  将改动提交到远端仓库
    如果你还没有克隆现有仓库，并欲将你的仓库连接到某个远程服务器(test 项目)，你可以使用如下命令添加:
    git remote add origin https://github.com/pansy-cx/test.git

如果执行 git remote 这步出现错误：

    fatal: remote origin already exists

意思是远程仓库已经存在    

执行以下语句  

    git remote rm origin
  
把原来仓库删除  
再重复执行一次  `git remote add origin https://github.com/pansy-cx/test.git` 即可  
如果执行 git push 这步出现错误：  

    error:failed to push som refs to.......

先把远程服务器 github 上面的文件 pull(拉) 下来，再 push(推) 上去。  

执行以下语句  

    git pull origin master

再重复执行 `git push origin master`
