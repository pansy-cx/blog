---
layout:     post
title:      "iOS 浏览器和 WKWebView 跨域 Cookie 的问题"
date:       2019-02-13 21:09:00
tags:
    - iOS
    - WKWebView
---

#### 问题：

今天遇到了一个问题，一个跨域的请求，在 WKWebView 下始终获取不到 Cookie。然后我在浏览器里试了一下， Chrome 能带上 Cookie，而 Safari 拿不到 Cookie。

如图所示，第一个请求，后台种了 Cookie

![safari-first-cookie](https://raw.githubusercontent.com/pansy-cx/pansy-cx.github.io/master/images/ios-wkwebview-cookie/safari-first-cookie.png)

发起第二个请求时，Cookie 丢失

![safari-second-cookie](https://raw.githubusercontent.com/pansy-cx/pansy-cx.github.io/master/images/ios-wkwebview-cookie/safari-second-cookie.png)

#### 原因：

原因是 Safari 开启了 `Prevent corss-site tracking`，在 `Safari - Preferences - Private - Prevent cross-site tracking` 里关闭设置，重启 Safari。

![safari-has-cookie](https://raw.githubusercontent.com/pansy-cx/pansy-cx.github.io/master/images/ios-wkwebview-cookie/safari-has-cookie.png)

好的带上了，若要在 WKWebView 开启这个方法，需要在 webview 里设置：

```objective-c
[self.webView.configuration.processPool performSelector:@selector(_setCookieAcceptPolicy:) withObject:NSHTTPCookieAcceptPolicyAlways afterDelay:0];
```

然而这是个私有方法，意味着苹果是不允许开发者开启 corss-site tracking 的。

当然我们不能要求用户为了兼容你的页面去设置该选项，或者将页面和后台放同一个接口下？明显也不现实。

用 Safari 看了一下淘宝和京东的 Cookie，都是在同一个域名下写入的。

在 Google 下可以看到淘宝在同源域名和非同源域名下都写入了 Cookie

![taobao google1](https://raw.githubusercontent.com/pansy-cx/pansy-cx.github.io/master/images/ios-wkwebview-cookie/taobao google1.png)

![taobao google1](https://raw.githubusercontent.com/pansy-cx/pansy-cx.github.io/master/images/ios-wkwebview-cookie/taobao google2.png)

在 Safari 下只有同源域名下写入了 Cookie

![taobao safari1](https://raw.githubusercontent.com/pansy-cx/pansy-cx.github.io/master/images/ios-wkwebview-cookie/taobao safari1.png)

![taobao safari1](https://raw.githubusercontent.com/pansy-cx/pansy-cx.github.io/master/images/ios-wkwebview-cookie/taobao safari2.png)

#### 解决方案：

1. 使用 Nginx 来解决跨域问题，粘一下这个[帖子](http://chenkuan.cc/2017/08/27/1/)的解决思路。

> **是的，也只能用nginx来解决了，其实我反而觉得这更简单，现在大部分公司的主域名绑定的也的确是nginx。**
>
> 1. 在主域名下，要么以下级域名的形式，要么以path的形式来组织静态页
> 2. 然后以REST的形式组织web api的地址。
> 3. 静态页对接口的访问全部都通过nginx。
>
> 这样一来，因为静态页本身就在nginx下，其对接口的访问也就相当于在同域了，其他接口也不过是通过nginx做了下透传。但完成了同域。
>
> 其实说这么多，提到的也都是一些老的东西，无非也就是对Safari这项设置的不满，因为我记得以前还不是这样的，莫名奇妙就来了这项设置。

2. 后端通过其他方案来保存 Cookie，微信公众平台也给出如下思路，在 [iOS WKWebview 网页开发适配指南](<https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1483682025_enmey>) 中：

> 变化1：跨域存取Cookie
> 问题说明：在访问一个页面A时，如果页面A引用了另一个页面B的资源（页面A和B为不同的域名），这时页面B就被认为是第三方页面。若在页面B中设置Cookie，就会命中WKWebview下阻止第三方跨域设置Cookie的安全策略，导致问题出现。
> 适配建议：
> 在WKWebview中是默认阻止跨域的第三方设置Cookie。所有通过Cookie传递的信息，可通过业务后台存储需要传递的信息，然后给页面一个存储信息相对应的access_token加密码，再通过Url中加入自己业务的access_token进行页面间的信息传递。
>
> 变化2：微信原生层面的网络请求读取不到WKWebview中设置的cookie，即使域名是相同的。
> 问题说明：如果页面的资源或图片存储的服务器依赖校验Cookie来返回数据的情况，在切换到WKWebview后，在微信内长按保存，或者点击预览大图时，原生层面发起的网络请求将不会完整地带上所设置的Cookie，会导致图片保存失败或预览失败。
> 适配建议：
> 建议静态资源cookie free。如果确实有信息需要传递，可通过业务后台存储需要传递的信息，然后给页面一个存储信息相对应的access_token加密码，再通过Url中加入自己业务的access_token进行页面间信息传递。

3. 换回 UIWebView，不建议这么做，因为 iOS12 UIWebView 已经是 Deprecated，很可能 iOS13 之后就被废弃了。
4. Native 自己写一个网络请求供 Web 调用，优点是可以完美解决 Cookie 问题，不会有跨域，缺点是可自定义程度较低，如果后台有变动，可能需要涉及到修改 Native，不能直接通过 Web 实现热更新。