---
layout:     post
title:      "Sublime Text 编译C语言设置"
date:       2016-08-18 13:23:00
tags:
    - Tool
---

### 配置 gcc 环境

下载安装 MinGW。右键点击第三行，选择 Mark for Installation 
左上角 Installation，点击 Apply Change  
安装完成后。计算机属性—高级系统设置—环境变量—找到 path，添加 `;../bin`（`..`为你安装 MinGW 的路径，`;`不要漏掉）  
在 CMD 中运行 `gcc -v`，查看是否成功。
 
### 创建批处理文件

此步骤是为了能够使用快捷键直接打开 CMD  
新建两个批处理文件，一个名为 runp.bat，内容如下：

    @echo off
    %1
    pause
    exit
    
一个为 callrunp.bat，内容如下：

    @echo off
    start runp.bat %1

将这两个文件放在 MinGW 的 bin 目录下。

### 编译系统设置
工具—编译系统—新编译系统，将代码改为如下：
    
    {
    "cmd" : ["gcc", "$file_name", "-o", "${file_base_name}.exe", "-lm", "-Wall"],
    "selector" : "source.c",
    "shell":true,
    "working_dir" : "$file_path",
    "variants":
    [
    {
    "name": "Run",
    "cmd": ["callrunp.bat", "${file_base_name}.exe"],
    "working_dir": "${file_path}"
    }
    ]
    }
    

保存。名字命名为 `C.sublime-build` 
工具—编译系统—选择C  

测试是否成功，END
