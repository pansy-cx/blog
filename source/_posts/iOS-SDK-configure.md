---
layout:     post
title:      "iOS SDK 新手搭建指南"
date:       2019-07-11 23:33:00
tags:
    - iOS
---

虽然之前没学过 iOS，但项目需要也做了近半年，总结一下这半年踩过的坑。本篇主要记录开发 SDK 所需要的一些设置，比较基础琐碎。

### 开发前准备

##### 1. 开发工具

开发工具自然是 Xcode，JetBrains 也推出了一款代替品 AppCode，但我建议新手还是先熟悉了 Xcode 在选择 AppCode。[Xcode官方文档](https://help.apple.com/xcode/mac/current/) 里面写的挺详细的，可以稍微翻翻。

App 一般使用 Cocoapods 管理依赖和打包，但我个人觉得用在 SDK 项目内不合适，会经常出现修改了 SDK，但不生效的情况，不知道是不是我接入姿势不对 orz，而且项目不大也用不着 Cocoapods。

##### 2. 语言选择

语言自然是 objc，swift 虽然在 19 年宣布 ABI 已经趋于稳定，但还是建议公司项目在观望一两年，毕竟大环境团队都是使用 objc。而且习惯了 objc 后写起来真的很爽。个人项目随意，搞个 swift UI 玩玩也不错。

##### 3. 项目命名

objc 没有命名空间，所以最终 SDK 和合作方的代码是打到一起的，要保证命名不冲突，苹果推荐使用 3个字母作为前缀来标识空间。

### 项目搭建

##### 1. 工程搭建

开发 SDK 都是为了将功能封装好输出给合作方/第三方，所以我们需要2个工程，一个是 SDK 工程，一个是 Demo 工程，用于自测和测试使用。

`Xcode -> File -> New -> WorkSpace`，新建 xcworkspace，很明显，这是个管理项目的工作空间。

`Xcode -> File -> New -> Project -> Cocoa Touch Framework`，创建 SDK 工程，记得在创建时添加到 workspace。

![](http://ww3.sinaimg.cn/large/006tNc79gy1g4fjb40nzdj30k404yt91.jpg)

`Xcode -> File -> New -> Project -> Single View App`，新建测试 App，步骤同上。

建完之后，就可以在 Xcode 看到两个项目，我们需要让他们在开发编译时能够关联起来，选中 App 工程 `Target -> Build Phases -> Link Binary With Libraries`，把我们的 SDK 添加进去，这样就不需要单独编译 SDK 了。

![](http://ww4.sinaimg.cn/large/006tNc79gy1g4fjhhwqwyj31600sqn2f.jpg)

##### 2. 配置

选择 SDK，`Target -> Build Setting -> Other Linker Flags`，添加 `-Objc`。加了这个参数后，链接器就会把静态库中所有的`Objective-C`类和分类都加载到最后的可执行文件中。所以我们的测试 App 和合作方也需要加上这个参数。

`Target -> Build Setting-> Mach-O Type` 将 `Dynamic Library` 改为 `Static Library` ，我们给合作方的是静态库。

`Target -> Build Setting -> Generate Debug Symbols` 将 `Release` 选项设为 `NO`，这是用来调试断点的配置，如果生产包不去掉，合作方接入会有一些找不到文件的警告。

`Project -> Info -> iOS Deployment Target` 这里选择 SDK 支持的最低版本。

##### 3. 编译配置

新建 pch 文件，`File -> New -> File -> iOS -> Other -> PCH File`，在 `Target -> Build Setting -> Prefix Header ` 把 pch 文件添加上，比如放项目根目录下 `$(SRCROOT)/PrefixHeader.pch`

pch 是一个预编译头文件，一般用来存放一些全局的宏(整个项目中都用得上的宏)，或者包含整个项目都需要用到的头文件，我们 SDK 只用来关闭生产日志，比如这样。

```shell
#ifdef DEBUG
#define NSLog(FORMAT, ...) fprintf(stderr,"[%s:%d]\t%s\n",[[[NSString stringWithUTF8String:__FILE__] lastPathComponent] UTF8String], __LINE__, [[NSString stringWithFormat:FORMAT, ##__VA_ARGS__] UTF8String]);
#else
#define NSLog(...)
#endif
```

##### 4. 打包

输出给合作方的 SDK 需要把真机和模拟机都打在一起，我们可以使用 `lipo -create` 命令去合并，但这样太麻烦，一般会写一个简单的命令去执行，

新建 Target `File -> New -> Target -> Cross-platform -> Aggregate`，我们取名为 BuildScript，选中 BuildScript，`Build Phases -> + -> New Run Script`，在框内添加脚本路径。

这样打包时就可以选择 BuildScript，`Edit Sheme -> Build Configuration -> Release`

![](http://ww3.sinaimg.cn/large/006tNc79gy1g4fqs08g3sj31600tfwki.jpg)

##### 5. 注意事项

Xcode 的文件管理做的稀烂，其他 IDE 项目内的目录结构和磁盘上是对应的，而 Xcode 不是，你在磁盘上新增移动文件，并不会影响 Xcode 内的结构，所以建议在 Xcode 内操作文件。

当然 Xcode 也是可以导入文本的，直接把文件拖到 Xcode 内对应的位置就行。如果不打算打入到 SDK 的文件，记得吧对应的 Target 勾掉。

### SDK 引入

我们的 SDK 需要引用其他 SDK，但第三方的 framework SDK 是不能直接打包到我们自己的 SDK，最终需要把自己的 SDK 和依赖的 SDK 都提供给使用者。

所以 SDK 打包时不能把依赖的 SDK 打包进去，但又要让编译器能定位到头文件，我们导入时记得选择 `create folder references` ，然后再 Target 内勾掉选项。而合作方/测试 App 需要把所有静态库和依赖导入到 `Link Binary With Libraries` 内，把资源 bundle 导入到 `Copy Bundle Resources`。

SDK 导入包需要在 `Builde Setting -> Framework Search Paths` 内添加上路径，否则会出现找不到 .h 文件的问题。

### 分发配置

##### 1. 配置证书

iOS 测试和发布的证书创建可以参考此文章，我就不在赘述了 [iOS之从创建（Development、Distribution）证书到发布](https://www.jianshu.com/p/304ec98842e1)。记得将生成的钥匙串和证书保存到 Git 项目，以便多人协作。

##### 2. 使用

现在讲一下如何维护和发布 ipa，打开 [苹果开发者网站]([https://developer.apple.com](https://developer.apple.com/))，在 `Certificates, Identifiers & Profiles -> Profiles` 可以看到两个 Profiles。

![](http://ww2.sinaimg.cn/large/006tNc79gy1g4w0cwh1llj30t909fdgp.jpg)

Development 用于本地 App 打包，Distribution 用于打包分发 ipa。

我们在 Git 项目中拿到对应的 p12 证书和 Profiles 文件，http://git.weoa.com/optimus/epss-sdk/tree/master/cer，此文件适用于 Bundle Id 为 `com.webank.epssdemo` 的测试 App。

分别双击两个 `.p12` 和 两个 `.mobileprovision` 文件，此时证书就自动安装到你电脑上了。

在项目配置里将 signing 改为手动，配置如下所示。

![](http://ww2.sinaimg.cn/large/006tNc79gy1g4w0e1v3hzj30p30dpjsj.jpg)

##### 3. 分发

`Xcode -> Product -> Archive`记得要选择 Release

![](http://ww1.sinaimg.cn/large/006tNc79gy1g4w0fiq0u0j30uw0fwabo.jpg)

选择 `Distribute App -> Ad Hoc -> Next -> Example App -> epss_demo_distribution`，打包完 Export，我们会在文件夹内找到 ipa，解包 ipa，我们能在 app 内看到 `embedded.mobileprovision` 这个文件。

![](http://ww2.sinaimg.cn/large/006tNc79gy1g4w0gkxcjhj31860nijw5.jpg)

