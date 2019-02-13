---
layout:     post
title:      "记录我树莓派的玄学日期修改"
date:       2017-12-07 12:24:00
tags:
    - Raspberry
---

Raspberry 没有电池，时间总会错，一般用 ntp 联网校准。

安装 ntpdate

    sudo apt-get install ntpdate
    tzselect    // 选择要匹配的时间
    sudo service ntp stop
    sudo ntpdate cn.pool.ntp.org    // 更新时间，cn 那个是国内 ntp 源
    sudo service ntp start
    date    // 检验校准

如果还有问题，可能显示的是 current time 而不是 local time，可以参考下面这贴

http://blog.csdn.net/u010940020/article/details/45420555

反正我是玄学修改成功。。