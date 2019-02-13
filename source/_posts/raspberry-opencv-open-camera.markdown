---
layout:     post
title:      "Raspberry 使用 opencv 调用树莓派摄像头模块"
date:       2017-11-14 17:32:00
tags:
    - Raspberry
    - OpenCV
---

### 硬件

摄像头用的是排线摄像头，500树莓派摄像头 # MK702

### 连接

![](http://p8hsqsg3r.bkt.clouddn.com/raspberry-camera.jpg)

树莓派排线有两个，一个是显示屏一个是摄像头，看清楚了。

### 开启

    sudo raspi-config

选择 Camera -> Enable，Finsh -> 确定重启

### 测试

截一张图片：

    raspistill -o image.jpg

录一段5秒钟的h264格式的视频：

    raspivid -o video.h264

录一段10秒钟的视频：

    raspivid -o video.h264 -t 10000

在演示模式下录一段10秒钟的视频：

    raspivid -o video.h264 -t 10000 -d

### opencv 调用

raspicam 不是 v4l 驱动，要使用 opencv 调用树莓派摄像头需要添加 v4l 驱动。

首先先更新，国内建议换<a href="https://mirror.tuna.tsinghua.edu.cn/help/raspbian/" target="_blank">清华源</a>

##### 更新 raspberry firmware

    sudo rpi-update

##### 重启后更新系统

    sudo apt-get update
    sudo apt-get upgrade

##### 增加 source.list

    sudo vim /etc/sources.list

添加以下资讯

    deb http://www.linux-projects.org/listing/uv4l_repo/raspbian/ jessie main

##### 加入 GPG key

    sudo wget http://www.linux-projects.org/listing/uv4l_repo/lrkey.asc ~/
    sudo apt-key add ./lrkey.asc

再次更新系统

    sudo apt-get update
    sudo apt-get upgrade

##### 安装 v4l 套件

    sudo apt-get install uv4l uv4l-raspicam

让系统开机自动组入模块

    sudo vim /etc/modules

于 modules 文件末尾添加 `bcm2835-v4l2`  

也可安裝以下套件，開機後自動載入模組

    sudo apt-get install uv4l-raspicam-extras

写一段代码测试一下

```python
import cv2
import numpy as np

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()

    cv2.imshow('frame',frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```
