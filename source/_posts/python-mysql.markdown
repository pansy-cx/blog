---
layout:     post
title:      "Mac 下安装和配置 Mysql"
date:       2017-12-05 12:12:00
tags:
    - Mysql
---

### 安装和配置 Mysql

##### 使用 brew 安装

    brew install mysql

##### 配置 Mysql

    mysql.server start   开启
    /usr/local/opt/mysql/bin/mysql_secure_installation  mysql 配置向导

>VALIDATE PASSWORD PLUGIN can be used to test passwordsand improve security. It     checks the strength of password and allows the users to set only those passwords which are secure enough. Would you like to setup VALIDATE PASSWORD plugin?
>Press y|Y for Yes, any other key for No: k //是否采用mysql密码安全检测插件

这里选择否，个人使用不需要开启 `valid_password` 插件，密码需要设置的很复杂，我就折腾了半天。。。

然后就是输入密码，其他的一路选 `y` 就行

##### 开启 Mysql

- mysql.server start       开启
- mysql.server stop        关闭
- mysql.server restart     重启

##### 登陆

    mysql -u root -p

##### 关闭 valid-password 前密码检测

如果不小心开了 valid-password，可以在配置里关了，在重设密码

先把 Mysql 关了

    mysql.server stop

    mysqld --help --verbose | more   查看帮助

输出
>Default options are read from the following files in the given order:
/etc/my.cnf /etc/mysql/my.cnf /usr/local/etc/my.cnf ~/.my.cnf

Mysql 读取配置顺序如上，我们在 /etc 下创建 my.cnf

添加

```vim
[mysqld]
validate_password=off
```

重设密码

    mysqladmin -u root -p password newpassword

### Python-Mysql 库安装

    brew install mysql-connector-c
    pip install mysql-python

一定要先安装 Mysql 在安装 mysql-python
