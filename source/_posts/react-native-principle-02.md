---
layout:     post
title:      "Native 与 RN 通信原理"
date:       2019-10-14 16:05:00
tags:
    - iOS
    - React-Native
---

### RN 调用 Native

##### 自定义原生模块

Native 提供了一系列的 API 供 RN 使用。拿个简单的 API 举例：Alert，RN 调用 `Alert.alert()`，弹出原生提示框。看一下 Alert 的源码，在 `react-native/Libraries/Alert/Alert.js`。

```js
// Alert.js
const NativeModules = require('../BatchedBridge/NativeModules');
const RCTAlertManager = NativeModules.AlertManager;
// ...
static prompt() {
	if (Platform.OS === 'ios') {
		RCTAlertManager.alertWithArgs(
      {
        title: title || '',
        type: 'plain-text',
        defaultValue: message,
      },
      (id, value) => {
        callback(value);
      },
    );
	}
}
```

实际调用了 `NativeModules.AlertManager`，这个方法由 Native 实现。

```objc
// RCTAlertManager.m
@implementation RCTAlertManager
RCT_EXPORT_MODULE()
RCT_EXPORT_METHOD(alertWithArgs:(NSDictionary *)args
                  callback:(RCTResponseSenderBlock)callback)
{
  UIAlertController *alertController = [UIAlertController
                                        alertControllerWithTitle:title
                                        message:nil
                                        preferredStyle:UIAlertControllerStyleAlert];
  // ...
}
@end
```

RN 提供了 `RCT_EXPORT_MODULE` 和 `RCT_EXPORT_METHOD` 两个宏，用于暴露模块方法，模块名默认是方法类名。

`NativeModules` RN 也暴露了出来，以提供调用自定义模块的功能。[官方文档](https://facebook.github.io/react-native/docs/native-modules-ios)

举个🌰：

```objc
// Test.h
#import <React/RCTBridgeModule.h>
@interface Test : NSObject<RCTBridgeModule, RCTBridgeMethod>
@end
  
// Test.m
#import "Test.h"
  
@implementation Test
@synthesize bridge = _bridge;
RCT_EXPORT_MODULE();
RCT_EXPORT_METHOD(greet:(NSString *)name callback:(RCTResponseSenderBlock)block)
{
  NSLog(@"Hello %@!", name);
  block(@[@{@"status": @"success"}]);
}
@end
```

```js
import { NativeModules } from 'react-native'
const moduleName = NativeModules.Test;
moduleName.greet('World', res => {
	console.log('res: ', res);
});
```

执行结果：

```
Native: Hello World!
RN: res: {status: success}
```

总之，RN 调用 Native 的流程很简单，Native 通过 `RCT_EXPORT_MODULE` 注册模块方法，暴露给 JS 调用。

##### 实现原理

整个流程入下图所示：

![](https://tva1.sinaimg.cn/large/006y8mN6gy1g7xskerihoj30sx0moq3n.jpg)

先从我们熟悉的 JS 看起，可以打开 Debug JS Remote 模式配合断点一起食用（Chrome 控制台里可以直接调试源码，但 Debug JS Remote 运行的 JSCRuntime 和平常时不一样，这点后面会解释）。

之前说到 JS 调用 Native，实际调用的是 `NativeModules`。

```js
// index.bundle.js
var NativeModules = _$$_REQUIRE(_dependencyMap[0], "../../BatchedBridge/NativeModules");

// BatchedBridge/NativeModules.js
let NativeModules: {[moduleName: string]: Object} = {};
if (global.nativeModuleProxy) {
  NativeModules = global.nativeModuleProxy;
} else if (!global.nativeExtensions) {
  // ...从其他人写的文章来看，之前的版本和 Debug JS Remote 走这里
}
```

这个 `global.nativeModuleProxy` 是 Native 注册的方法，可以翻回 [ReactNative 运行原理](https://idmrchan.com/2019/10/12/react-native-principle-01/) 执行 JS 这段。

```cpp
runtime_->global().setProperty(
  *runtime_,
  "nativeModuleProxy",
  Object::createFromHostObject(
      *runtime_, std::make_shared<NativeModuleProxy>(*this)));
```

沿着 `NativeModuleProxy` 看下去，一直到 `JSINativeModules::createModule`

```cpp
// JSINativeModules.cpp
folly::Optional<Object> JSINativeModules::createModule(
    Runtime& rt,
    const std::string& name) {
  if (!m_genNativeModuleJS) {
    // 调用 global.__fbGenNativeModule，该方法在 NativeModule.js 实现
    m_genNativeModuleJS =
        rt.global().getPropertyAsFunction(rt, "__fbGenNativeModule");
  }
  auto result = m_moduleRegistry->getConfig(name);
  if (!result.hasValue()) {
    return folly::none;
  }
  Value moduleInfo = m_genNativeModuleJS->call(
      rt,
      valueFromDynamic(rt, result->config),
      static_cast<double>(result->index));
  CHECK(!moduleInfo.isNull()) << "Module returned from genNativeModule is null";
  folly::Optional<Object> module(
      moduleInfo.asObject(rt).getPropertyAsObject(rt, "module"));
  return module;
}
```

`rt.global().getPropertyAsFunction(rt, "__fbGenNativeModule")` 这里 c++ 调用的 `global.__fbGenNativeModule` 由 JS 实现。

```js
// NativeModule.js

// export this method as a global so we can call it from native
global.__fbGenNativeModule = genModule;	

function genModule(config, moduleID) {
  const [moduleName, constants, methods, promiseMethods, syncMethods] = config;
  const module = {};
  methods &&
    methods.forEach((methodName, methodID) => {
     	// ...
      module[methodName] = genMethod(moduleID, methodID, methodType);
    });
  Object.assign(module, constants);
	
  // ...
  return {name: moduleName, module};
}

```

`genMethod()` 内部调用的 `BatchedBridge.enqueueNativeCall()` 方法就是实现 JS 调用 Native 的实际方法。

```js
function genMethod(moduleID: number, methodID: number, type: MethodType) {
  fn = function(...args: Array<any>) {
    return new Promise((resolve, reject) => {
      BatchedBridge.enqueueNativeCall(
        moduleID,
        methodID,
        args,
        data => resolve(data),
        errorData => reject(createErrorFromErrorData(errorData)),
      );
    });
  };
  fn.type = type;
  return fn;
}

function enqueueNativeCall(moduleID, methodID, params, onFail, onSucc) {
  this.processCallbacks(moduleID, methodID, params, onFail, onSucc);

  this._queue[MODULE_IDS].push(moduleID);
  this._queue[METHOD_IDS].push(methodID);
  this._queue[PARAMS].push(params);
	// ...
  const now = Date.now();
  if (
    global.nativeFlushQueueImmediate &&
    now - this._lastFlush >= MIN_TIME_BETWEEN_FLUSHES_MS	// MIN_TIME_BETWEEN_FLUSHES_MS = 5
  ) {
    const queue = this._queue;
    this._queue = [[], [], [], this._callID];
    this._lastFlush = now;
    global.nativeFlushQueueImmediate(queue);
  }
  // ...
}

```

如果时间间隔大于 5ms，就执行 `global.nativeFlushQueueImmediate(queue)` 通知 Native 执行。

 `global.nativeFlushQueueImmediate` 由 C++ 实现（反复横跳）。

```cpp
// JSIExecutor.cpp
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

// NativeToJsBridge.cpp
void callNativeModules( __unused JSExecutor& executor, folly::dynamic&& calls, bool isEndOfBatch) override {
  for (auto& call : parseMethodCalls(std::move(calls))) {
    m_registry->callNativeMethod(call.moduleId, call.methodId, std::move(call.arguments), call.callId);
  }
}

// ModuleRegistry.cpp
void ModuleRegistry::callNativeMethod(unsigned int moduleId, unsigned int methodId, folly::dynamic&& params, int callId) {
  if (moduleId >= modules_.size()) {
    throw std::runtime_error(
      folly::to<std::string>("moduleId ", moduleId, " out of range [0..", modules_.size(), ")"));
  }
  modules_[moduleId]->invoke(methodId, std::move(params), callId);
}

```

`modules_` 是 `RCTBridge` 初始化时注册的方法列表。

![](https://tva1.sinaimg.cn/large/006y8mN6gy1g7xsliizo4j31g00u0179.jpg)

额，进到 C++ 只能打印出指针地址了，回到 RCTCxxBridge 初始化模块打印一下模块列表：

![](https://tva1.sinaimg.cn/large/006y8mN6gy1g7xsls0tanj31p50u0niu.jpg)

可以验证思路是正确的，在调一下我们之前写的例子，在断点里看到打印出了 RN 传过来的参数：

![](https://tva1.sinaimg.cn/large/006y8mN6gy1g7xsm0v17tj31fc0u0av1.jpg)

还有一个问题，这些模块是怎么注册进来的？记得之前说的 `RCT_EXPORT_MODULE` 宏

```objc
#define RCT_EXPORT_MODULE(js_name) \
RCT_EXTERN void RCTRegisterModule(Class); \
+ (NSString *)moduleName { return @#js_name; } \
+ (void)load { RCTRegisterModule(self); }

void RCTRegisterModule(Class moduleClass)
{
  // 只执行一次
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    RCTModuleClasses = [NSMutableArray new];
    RCTModuleClassesSyncQueue = dispatch_queue_create("com.facebook.react.ModuleClassesSyncQueue", DISPATCH_QUEUE_CONCURRENT);
  });
  // Register module
  dispatch_barrier_async(RCTModuleClassesSyncQueue, ^{
    [RCTModuleClasses addObject:moduleClass];
  });
}

```

以上，就是 RN 调用 Native 的整个过程。

### Native 调用 RN

```js
componentDidLoad(() => {
  console.log('effect');
  const nativeEvt = new NativeEventEmitter(NativeModules.EventEmitter);
	this.listenner = nativeEvt.addListener('Greet', remider => {
    console.log('Native 通知 RN： ', remider.name);
  });
  console.log(global.TestModule(''));
});
componentUnLoad(() => {
	this.listenner.remove()
})

```

```objc
@implementation EventEmitter
RCT_EXPORT_MODULE();
- (NSArray<NSString *> *)supportedEvents {
  return @[@"Greet"];
}
- (void)tellJS {
  [self sendEventWithName:@"Greet" body:@{@"name": @"hello"}];
}
@end
  
- (IBAction)selector {
  [[EventEmitter allocWithZone:nil] tellJS];
}

```

虽说是 Native 调用 RN，但依然是先由 Native 注册一个模块，RN 在该模块之上添加监听者，内部原理和 RN 调用 Native 差不多，不再赘述。

### 坑

前面说到，「Chrome 控制台里可以直接调试源码，但 Debug JS Remote 运行的 JSCRuntime 和平常时不一样」。

```js
// BatchedBridge/NativeModules.js
let NativeModules: {[moduleName: string]: Object} = {};
if (global.nativeModuleProxy) {
  NativeModules = global.nativeModuleProxy;
} else if (!global.nativeExtensions) {
  // ...从其他人写的文章来看，之前的版本和 Debug JS Remote 走这里
}

```

打开 Debug JS Remote，在上面代码处打断点，会发现 `global.nativeModuleProxy` 是 undefined

![](https://tva1.sinaimg.cn/large/006y8mN6gy1g7xsmcc4nlj30u00rsk27.jpg)

然后关闭 Debug 模式，在 Safari 里打断点

![](https://tva1.sinaimg.cn/large/006y8mN6gy1g7xsmlvfa4j30lu0fkn14.jpg)

`global.nativeModuleProxy` 又有值了。

我在 Native 也打了断点，打开 Debug JS Remote 无法走入到 C++ 的 JSI 那一层。我估计 Debug 模式使用浏览器解析的 JS，所以才能够在 Chrome 中调试，而其他情况走的是 App 内实现的 JSI。

### 参考

- [React Native JSI Challenge](https://medium.com/@christian.falch/https-medium-com-christian-falch-react-native-jsi-challenge-1201a69c8fbf)
- [Native Module iOS](https://facebook.github.io/react-native/docs/native-modules-ios)
- [ReactNative源码篇：通信机制](https://github.com/sucese/react-native/blob/master/doc/ReactNative%E6%BA%90%E7%A0%81%E7%AF%87/6ReactNative%E6%BA%90%E7%A0%81%E7%AF%87%EF%BC%9A%E9%80%9A%E4%BF%A1%E6%9C%BA%E5%88%B6.md#%E4%B8%89-js%E5%B1%82%E8%B0%83%E7%94%A8java%E5%B1%82)