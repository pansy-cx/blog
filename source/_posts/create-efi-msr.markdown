---
layout:     post
title:      "手工创建 efi,msr 分区"
date:       2017-03-19 12:00:00
tags:
    - System
---

昨天在帮同学装 win10 的时候，不小心（~~不知道那是什么东西~~）把原系统的 efi 和 msr 盘删了，用 WinNTsetup 安装时 EFI PART 总显示红叉，安装后也进不去系统，想想应该是找不到引导。  

网上查了下，应该是用了 UEFI+GPT 方式安装的，他那台华硕电脑主板看着也挺奇葩，没办法只好手动重建 efi msr 盘。  

### 方法如下  

- 进入 pe ，把 C 盘分区删除  
- cmd 进入命令提示符  
- 创建 EFI 分区
    + diskpart
    + list disk (出现两个盘，是硬盘和U盘。其中一个有剩余空间，就是你删除的分区，选择那个盘)  
    + select disk x (0或1)  
    + create partition efi size=100  
    + assign letter=b  (分配盘符)
    + format quick fs=FAT32  
- 创建 msr 分区
    + create partition msr size=16 (win10 默认)
- 创建 Recovery 分区
    + create partition primary size=450
    + format quick fs=ntfs label="Recovery"
    + assign letter="R" (分配盘符)
    + set id="de94bba4-06d1-4d40-a16a-bfd50179d6ac"
    + gpt attributes=0x8000000000000001 ( 8 和 1之间有14个0)
- 用 diskgenius 软件格式化 C 盘
  
打开 WinNTsetup 发现 EFI PART 红叉消失，重装后可进入系统，搞定。
  
  
### 参考文章

- <a href="http://bbs.kafan.cn/thread-1845301-1-1.html" target="_blank">用diskgenius手工创建efi、msr分区问题</a>
- <a href="https://msdn.microsoft.com/windows/hardware/commercialize/manufacture/desktop/configure-uefigpt-based-hard-drive-partitions" target="_blank">UEFI/GPT-based hard drive partitions</a>
