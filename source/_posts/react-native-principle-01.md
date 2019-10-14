---
layout:     post
title:      "ReactNative 运行原理"
date:       2019-10-12 16:14:00
tags:
    - iOS
    - React-Native
---

之前在研究 RN -> Web 的时候，发现我对 RN 的理解还不够清晰，所以拿源码翻了一下，记录一下心得。

RN 版本：0.60.5

### 原理

我们前端写的 React 会被转换成 JS 语法，打成一个 JSBundle 包，在 App 内被加载和执行，通过 Bridge 将指令发送给 Native 执行。Bridge 将消息转为 JSON，通过异步的方式在两端传递消息。

![](https://formidable.com/uploads/old-diagram-full.png)

之前 RN 的架构确实如此，网上很多19年之前的文章也都是这么说的，导致我一开始看代码就搞错了思路。实际上 RN 在 0.58 之后的版本使用 JSI 取代了先前的 Bridge。

![](https://formidable.com/uploads/new-5.png)

这个 JSI 是由 C++ 实现的，可以认为 JSI 是一个简单版的 JS 引擎接口，同时连接 JS 和 Native，可以让 JS 保存对 c++ Host Object 的引用，也就是说不用将传递的消息序列化到 JSON，实现 JS 和 Native 的同步通信。

>摘自 RN 开发人员写的一篇解释 RN 新架构的上层设计方案 https://formidable.com/blog/2019/jsi-jsc-part-2/
>
>The second improvement—arguably the cornerstone of the whole re-architecture—is that “by using JSI, JavaScript can hold reference to C++ Host Objects and invoke methods on them.” This means that, finally, we are tackling the core issue explained in the previous article: the two realms of JavaScript and Native will be **really** aware of each other, and there won’t be any need to serialize to JSON the messages to pass across, removing all congestion on the bridge (we’ll explore this more in the next article).

所以整个 RN 的执行流程就是：

1. 初始化：View/Bridge -> 加载/执行 JSBundle -> Bridge(JSI) -> Native
2. 运行时：(e.g) 触摸屏幕 -> Native EventListen -> Bridge(JSI) -> JS xxxx -> Bridge(JSI) ......

### 初始化

```objc
// AppDelegate.m
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"demo"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}
```

1. RCTRootView

   RN 的根页面，所有在 RN 端写的 component 都将转为 Native View 挂载到 RCTRootView 之上。

   在 RN 初始化创建的项目，RCTRootView 直接挂在 `window.rootViewController` 上，可以想象成 html 的 `<body>`。

2. RCTBridge

   RCTBridge 实例化一个 bridge，作为 OC 与 JS 交互的桥梁，它还有另一个实例化的方法：

   ```objc
   - (instancetype)initWithBundleURL:(NSURL *)bundleURL
                      moduleProvider:(RCTBridgeModuleListProvider)block
                       launchOptions:(NSDictionary *)launchOptions
   ```

#### RCTBridge

![RN 启动流程](https://tva1.sinaimg.cn/large/006y8mN6gy1g7vh5z731jj30q80ggaah.jpg)

##### #1. setUp

```objc
- (void)setUp
{
  ...
  self.batchedBridge = [[[RCTCxxBridge class] alloc] initWithParentBridge:self];
  [self.batchedBridge start];
	...
}
```

略过 Logger，RCTBridge 实际上没做什么事，只实例化了 RCTCxxBridge 并持有了它，大部分的初始化逻辑都在  `[batchedBridge start]` 完成。

##### #2. start

`.mm` 后缀表示除了 Objc 还可以运行 C++。`RCTCxxBridge.mm` 混合了 Objc 和 C++。

对代码做了简化处理：

```objc
// RCTCxxBridge.mm
- (void)start
{
  // 通知
  [[NSNotificationCenter defaultCenter]
    postNotificationName:RCTJavaScriptWillStartLoadingNotification
    object:_parentBridge userInfo:@{@"bridge": self}];

  // Set up the JS thread early
  // 开一个线程给 JS 使用
  _jsThread = [[NSThread alloc] initWithTarget:[self class]
                                      selector:@selector(runRunLoop)
                                        object:nil];
  _jsThread.name = @"com.facebook.react.JavaScript";
  // 线程最高优先级，用于用户交互事件
  _jsThread.qualityOfService = NSQualityOfServiceUserInteractive;
  [_jsThread start];

  dispatch_group_t prepareBridge = dispatch_group_create();

  [_performanceLogger markStartForTag:RCTPLNativeModuleInit];

  [self registerExtraModules];
  // Initialize all native modules that cannot be loaded lazily
  // 加载 JS 调用 Native 模块
  (void)[self _initializeModules:RCTGetModuleClasses() withDispatchGroup:prepareBridge lazilyDiscovered:NO];
  [self registerExtraLazyModules];

  __weak RCTCxxBridge *weakSelf = self;

  // Dispatch the instance initialization as soon as the initial module metadata has
  // been collected (see initModules)
  // 确定是否在 JS 线程，如果不是，指定在 JS 线程操作
  dispatch_group_enter(prepareBridge);
  [self ensureOnJavaScriptThread:^{
    [weakSelf _initializeBridge:executorFactory];
    dispatch_group_leave(prepareBridge);
  }];

  // Load the source asynchronously, then store it for later execution.
  // 加载资源
  dispatch_group_enter(prepareBridge);
  __block NSData *sourceCode;
  [self loadSource:^(NSError *error, RCTSource *source) {
    if (error) {
      [weakSelf handleError:error];
    }
    sourceCode = source.data;
    dispatch_group_leave(prepareBridge);
  } onProgress:^(RCTLoadingProgress *progressData) {}];

  // Wait for both the modules and source code to have finished loading
  // 加载完线程和 JS 模块，执行 JS
  dispatch_group_notify(prepareBridge, dispatch_get_global_queue(QOS_CLASS_USER_INTERACTIVE, 0), ^{
    RCTCxxBridge *strongSelf = weakSelf;
    if (sourceCode && strongSelf.loading) {
      [strongSelf executeSourceCode:sourceCode sync:NO];
    }
  });
}
```

该函数主要做了 4 件事：

1. jsThread：用于执行 JS 线程，iOS 的 UI 操作必须在主线程操作，如果在 JS 线程执行了一次开销很大的步骤，此时任何由 JS 控制的动画都会卡住，详见官方文档：[JS帧率](https://reactnative.cn/docs/performance/#%E5%85%B3%E4%BA%8E-%E5%B8%A7-%E4%BD%A0%E6%89%80%E9%9C%80%E8%A6%81%E7%9F%A5%E9%81%93%E7%9A%84)。
2. 加载模块：加载 ReactNative 封装的原生模块，比如 Alert、keyboard 模块以及 SafeArea、Text 等组件模块，支持自定义原生模块（详见 Native 与 RN 通信）。
3. 加载 Bundle 资源：这步没什么好说的，会读取本地的 JSBundle，如果是开发环境，则会从 `react-native start` 起的静态资源服务器取 Bundle。`http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false` 可以看到编译后的 JS 代码。
4. 解析 Bundle 资源：2,3 步是异步加载，加载完后执行 4。（详见执行 JS）。

> `dispatch_group_enter` 和 `dispatch_group_leave` 是用于异步执行 GCD 的任务组，当所有任务执行完后执行 `dispatch_group_notify` 。
>
> 用 JS 实现就是 const a = new Promise(); const b = new Promise(); Promise.All(a, b).then()...

#### 执行 JS

沿着 `[strongSelf executeSourceCode:sourceCode sync:NO]` 这个方法看下去，都是一些嵌套函数，中间做了一次分包。

```objc
# RCTCxxBridge.mm
- (void)executeApplicationScript:(NSData *)script
                             url:(NSURL *)url
                           async:(BOOL)async
{
	// try catch 模块，如果 script 不是 JS 则抛出异常。
  [self _tryAndHandleError:^{
    NSString *sourceUrlStr = deriveSourceURL(url);
    if (isRAMBundle(script)) {
      # ... 
    } else if (self->_reactInstance) {
      self->_reactInstance->loadScriptFromString(std::make_unique<NSDataBigString>(script),
                                                 sourceUrlStr.UTF8String, !async);
    }
  }];
}
```

初略看了一下 RN 文档，[启动RAM格式](https://reactnative.cn/docs/performance/#%E5%90%AF%E7%94%A8-ram-%E6%A0%BC%E5%BC%8F) 应该是类似于分模块加载的优化功能，暂时不去研究。`self->_reactInstance->loadScriptFromString` 这个方法才是真正执行 JS 的函数。

接下来基本上都是 C++ 代码，不用太在意语法，能看懂做什么就行。

```objc
// JSIExecutor.cpp
void JSIExecutor::loadApplicationScript(
    std::unique_ptr<const JSBigString> script,
    std::string sourceURL) {
  SystraceSection s("JSIExecutor::loadApplicationScript");

  runtime_->global().setProperty(
      *runtime_,
      "nativeModuleProxy",
      Object::createFromHostObject(
          *runtime_, std::make_shared<NativeModuleProxy>(*this)));

  runtime_->global().setProperty(
      *runtime_,
      "nativeFlushQueueImmediate",
      Function::createFromHostFunction(
          *runtime_,
          PropNameID::forAscii(*runtime_, "nativeFlushQueueImmediate"),
          1,
          [this](
              jsi::Runtime &,
              const jsi::Value &,
              const jsi::Value *args,
              size_t count) {
            if (count != 1) {
              throw std::invalid_argument(
                  "nativeFlushQueueImmediate arg count must be 1");
            }
            callNativeModules(args[0], false);
            return Value::undefined();
          }));

  runtime_->global().setProperty(
      *runtime_,
      "nativeCallSyncHook",
      Function::createFromHostFunction(
          *runtime_,
          PropNameID::forAscii(*runtime_, "nativeCallSyncHook"),
          1,
          [this](
              jsi::Runtime &,
              const jsi::Value &,
              const jsi::Value *args,
              size_t count) { return nativeCallSyncHook(args, count); }));

  if (runtimeInstaller_) {
    runtimeInstaller_(*runtime_);
  }
  runtime_->evaluateJavaScript(
      std::make_unique<BigStringBuffer>(std::move(script)), sourceURL);
  flush();
}
```

`runtime_->global().setProperty` 是在 JS 全局对象 `global` 上注册 Function 或 Object。

`runtime_->evaluateJavaScript` 则是调用了 iOS 内置的 JavaScript 引擎，解释执行 JS 代码。

而 `runtime_` 是 JSI 的一个方法(?)，这里就和之前说的 `执行 JS -> Bridge(JSI)` 连上了。

将来在项目中如果想具体看某个 RN Api 是怎么实现的，就可以顺着这里查下去。



### RN 系列文章

- [Native 与 RN 通信](https://idmrchan.com/2019/10/14/react-native-principle-02/)
