---
layout:     post
title:      "Raspberry 系统安装及必要配置"
date:       2016-08-18 13:00:00
tags:
    - System
    - Raspberry
---

### 写入系统

安装 `win32diskimager-v0.9-binary` 软件，写入镜像（Img格式）

### 用网线连接电脑

- 打开网络共享中心-更改适配器设置-无线网络连接-共享-允许其他网络用户通过计算机连接-选择本地连接
- cmd 里输入 `arp -a` 看到 192.168.137.1 下有个动态连接 IP
- 打开 putty，输入刚才那个动态 IP，端口选 22，连接类型选 SSH。帐号：pi，密码：raspberry

### 扩展可用空间
输入 `sudo raspi-config` 进入高级系统设置，选择第一项 Expand Filesystem 扩展 SD 卡上可用的空间，不然以后会有很多大软件，不能安装（提示空间不足，例如 mysql）。扩展之后可以通过 `df -h` 命令看到效果

### 设置静态IP

输入 `sudo nano /etc/network/interfaces`  

```vim
auto lo
iface lo inet loopback
iface eth0 inet static
address 192.168.191.2 #我无线网卡连接的 Wifi Ip
netmask 255.255.255.0
gateway 192.168.191.1
auto wlan0
iface wlan0 inet static
address 192.168.191.2
netmask 255.255.255.0
gateway 192.168.191.1
wpa-ssid 要连接的wlan ssid
wpa-psk wlan密码
```

Ctrl+X 保存退出

### 使用VNC远程查看桌面
输入命令

    sudo apt-get update
    sudo apt-get install tightvncserver

运行命令 `tightvncserver`  
设置密码  
之后在电脑上安装 VNC 客户端  
输入 IP+:1 例如：192.168.191.2:1
