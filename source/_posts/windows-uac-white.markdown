---
layout:     post
title:      "Windows 下对某个程序使用白名单"
date:       2016-08-18 13:55:00
tags:
    - System
---

- 开始—》右击“计算机”—》管理—》任务计划程序—》任务计划程序库，点击右边的“创建任务”

- 输入要创建的任务的名称 'youexeName'，以及勾选“使用最高权限运行”

- 点击“操作”标签，点击“新建”—》浏览—》选择需要设置的程序，打开后点确定。

- 
在桌面或某个文件夹内的空白处右击新建快捷方式：  
在方框内键入：`schtasks.exe /run /tn "youexeName"`  
完成

- 双击快捷方式启动，可实现 uac 白名单

>   来源：知乎
    作者：jake lin
    链接：https://www.zhihu.com/question/26629026/answer/73701164




