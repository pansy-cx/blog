---
layout:     post
title:      "Ubuntu wubi 安装时检测磁盘时出现严重错误修复方法"
date:       2016-08-18 13:40:00
tags:
    - Linux
    - System
---

- 进入 Ubuntu 启动菜单时，光标选中 *Ubuntu 后，按键盘上的 e 键，即可进入启动项编辑模式。
- 使用光标定位到倒数第三行，将 ro 改成 rw 后，按 F10 键，即可按照修改后的参数引导进入系统。
- 使用快捷键 ctrl+ alt + t 打开终端输入 `sudo gedit /etc/grub.d/10_lupin`

- 然后输入用户密码并回车，即可调用文本编辑器打开启动项配置文件。在打开的编辑中搜索 `ro ${args}` 并定位到该文字项。
- 将定位位置的 ro 修改为 rw ,然后保存并退出文本编辑器。
- 最后在终端中输入 `sudo update-grub` 并回车,开始更新启动项配置。
这样就解决该问题了。


