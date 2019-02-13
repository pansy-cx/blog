---
layout:     post
title:      "树莓派开机启动和后台运行 Python 程序"
date:       2017-12-09 12:02:00
tags:
    - Raspberry
---

### 后台运行 Python

使用 nohup

    nohup ~/Desktop/pi/python test.py &

### 修改 rc.local

在 `/etc/rc.local` 添加执行程序，确保最后一句是 void 0

![](http://p8hsqsg3r.bkt.clouddn.com/raspberry-rc-local.png)

但我的程序不能通过这种方式启动，不知道为什么，我用的是第二种方法

### 制作开机启动脚本

在 `/etc/init.d` 文件夹内新建一个文件，如:

    sudo vim /etc/init.d/test

添加内容

```vim
#!/bin/sh
### BEGIN INIT INFO
# Provides:          test
# Required-Start:    $remote_fs
# Required-Stop:     $remote_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Start or stop the HTTP Proxy.
### END INIT INFO
case $1 in
    start)
        nohup python ~/Desktop/pi/test.py
        ;;
    stop)
        ;;
*)
echo "Usage: $0 (start|stop)"
;;
esac
```

注释里的内容要记得加上

让脚本可执行

    sudo chmod +x /etc/init.d/test

启动脚本

    sudo /etc/init.d/test start

开机启动

    sudo update-rc.d test defaults
    sudo update-rc.d -f test remove  取消开机启动


