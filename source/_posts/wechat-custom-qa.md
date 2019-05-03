---
layout: 	post
title:		"微信开发过程常见问题总结"
date:       2019-03-09 19:42:00
tags:
    - JavaScript
    - 微信
---

#### Q：小程序鉴权机制？

1. `wx.getSetting ` 获取当前用户授权状态。

2. `wx.authorize ` 提前向用户获取授权权限。

3. `wx.login ` 获取登陆信息（`code`），后台通过 `code` 请求微信登陆凭证校验接口，拿到 `openId` 和 `sessionkey`(用于校验)。

4. `wx.getUserInfo` 获取用户信息

   - 此接口必须在用户同意登陆授权后才可使用（调用 `wx.getSetting` 和 `wx.authorize`），否则会直接进入 fail 回调。

   - 参数 withCredentials 为 true 时，要求此前有登陆过（调用过 `wx.login`，且登陆态未过期），此时返回由 `encryptedData` 和 `iv` 等敏感信息，解密后能拿到 `unionId` 等。

   - 接口调用必须让用户手动点击登陆按钮

     ```html
     <button
       wx:if="{{canIUse}}"
       open-type="getUserInfo"
       bindgetuserinfo="bindGetUserInfo"
     >
       授权登录
     </button>
     <button wx:else>
       升级微信版本 && 使用旧接口
     </button>
     ```

     

#### Q：微信开发各种 Id 区别？

1. appId： 开发者账号信息，一个 Appid 对应一个公众号 or 小程序。

2. openId：不同用户在不同小程序下都有一个唯一的 openId。

3. unionId：同一个用户在企业绑定的公众号和小程序上是 unionId 是一致的。

   unionId 获取方式（摘自微信公众平台）：

   > 1. 调用接口[wx.getUserInfo](https://developers.weixin.qq.com/miniprogram/dev/api/open.html)，从解密数据中获取UnionID。注意本接口需要用户授权，请开发者妥善处理用户拒绝授权后的情况。
   > 2. 如果开发者帐号下存在**同主体的**公众号，并且该用户已经关注了该公众号。开发者可以直接通过[wx.login](https://developers.weixin.qq.com/miniprogram/dev/api/api-login.html)获取到该用户UnionID，无须用户再次授权。
   > 3. 如果开发者帐号下存在**同主体的**公众号或移动应用，并且该用户已经授权登录过该公众号或移动应用。开发者也可以直接通过[wx.login](https://developers.weixin.qq.com/miniprogram/dev/api/api-login.html)获取到该用户UnionID，无须用户再次授权。

#### Q：微信授权登陆（OAuth2.0）

⚠️获取授权用户基本信息的条件是「服务号」，「订阅号」是无法拿到微信用户信息。在获取用户授权时会返回错误码 10005。

1. 用户同意授权，获取 code

   打开此链接

   ```
   https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect
   ```

   - APPID：应用ID。
   - REDIRECT_URI：授权后重定向URL，会带上授权 code，注意需要使用 `UrlEncode`编码。
   - SCOPE：授权作用域，
     - `snsapi_base`：不弹出授权页面，直接跳转，只能获取用户 `openid`
     - `snsapi_userinfo`：弹出授权页，可通过 `openid` 拿到昵称、性别、所在地以及 `unionId` 
   - STATE: 重定向参数

2. 通过 `code` 换取 `access_token`，此步骤必须在服务端进行，返回 `access_token`。

3. 如果是 `snsapi_userinfo` ，可以根据 `access_token` 和 `openId` 获取用户信息， `unionId`以及用户昵称地址等信息。