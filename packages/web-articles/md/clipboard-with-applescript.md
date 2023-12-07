---
title: 借助 JXA 获取 MacOS 剪切板文件信息
date: Fri Dec 01 2023 11:51:46 GMT+0800 (中国标准时间)
tags: Geek
---

编写 VSCode Extension 时期望从剪切板获取用户所复制的文件信息，但 VSCode 自带的 api `vscode.env.clipboard.readText()` 最多只能获取到被复制文件的名称信息基本上用不了，所以就考虑能否用 node 通过一些手段调起操作系统的 api 来拿到这个信息。把事情放大到操作系统层面就需要考虑不同操作系统的情况，立个小目标先把 MacOS 上的实现了，于是就有了本文。

# 前情提要

VSCode 官方并非没有支持计划，但也只有半个支持计划。其实早在 19 年就有相关 issue：

[Expose Clipboard#read/write with data transfer](https://github.com/microsoft/vscode/issues/77790)

官方的回复是不会像 Electron API 那样去做一些 "custom" 的事情，而是会持续探索 JS 本身的 API。

[Clipboard - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard) 标准是有了，也就是说 Clipboard 对象应该会增加 `read` 和 `write` 两个函数用于处理非常规字符串的场景，但兼容性堪忧 [Clipboard API: read | Can I use... Support tables for HTML5, CSS3, etc](https://caniuse.com/mdn-api_clipboard_read)。

因此四年过去了，这玩意还没有落地，只能另辟蹊径了。

# AppleScript

用过 IOS 上的「快捷指令」，大概知道 Apple 其实给了用户一些“应用编排”的能力。「快捷指令」就是这种能力在 NO CODE 层面的体现，而「AppleScript」是一种 LOW CODE（怎么感觉一下子到了自己的领域）。

他的语法非常简单甚至有些偏向自然语言，这里不对语法做太多展开，我们专注去实现如何用这个工具来为我们的 VSCode Extension 提供剪切板信息。

MacOS 自带一个叫「脚本编辑器」的工具，可以比较方便的帮助我们调试脚本，我们先写下这样一段代码：

```
on run
  return the clipboard
end run
```

`on run` 和 `end run` 表示为一个名为 `run` 函数的闭包，`run()` 是OSA 默认的入口函数，类型 C 语言里面的 `main` 函数。`the clipboard` 关键字表示输出当前剪切板信息。

然后我们拷贝一张图片并且运行一下脚本，大概会得到这样一个结果

![图片](/images/6Wu07olxofW2opQvDrMKjQ==.png)

这个结果和 Web API 是相似的只能得到图片的名称，这时候是不是已经心凉了半截？诶，这事还有救。

为什么呢？因为通过 AppleScript API clipboard 拿到的信息其实远不止如此。至于为什么输出来只有一个文件名我猜内部是有什么隐式类型转换。我们不妨再写一段代码验证一下

![图片](/images/RgV1EK7Tunmkt06QDBWybg==.png)

`clipboard info` 也是获取剪切板信息，打印内容发现是一个较复杂的对象其中还有什么“furl”之类的关键字，即使是我这种才学了 10 分钟的人都知道应该是有戏了。

然后一顿操作得到完全体代码如下：

```
on run
	set clipboardInfo to (the clipboard as «class furl»)
	return (POSIX path of clipboardInfo)
end run
```

![图片](/iamges/3kSWx690FlPaOxyulIPP0w==.png)

运行一下，完美！

## 符号 “«»”

> «» 这个符号叫做 guillemets ，是法语、西班牙语、俄语等欧洲语言中使用的引号，用法相当于中国大陆的弯引号（蝌蚪引号），中文一般称为角引号。现在已经不是中国大陆通用的标点符号了，国家推荐性标准 GBT 15834-2011《标点符号用法》中并没有这个标点符号。

总之它不是书名号也不是双引号，输入的时候不能输错（很明显我就踩了一下坑）。

这里的 `as «class furl»` 表示将剪切板内容实例化为 furl 这种数据结构，所以如果不做这个事情默认可能就是转化为 string 然后就会丢掉很多信息。

## POSIX

> POSIX表示可移植操作系统接口（Portable Operating System Interface of UNIX，缩写为 POSIX ），POSIX标准定义了操作系统应该为应用程序提供的接口标准，是IEEE为要在各种UNIX操作系统上运行的软件而定义的一系列API标准的总称，其正式称呼为IEEE 1003，而国际标准名称为ISO/IEC 9945。

大致可以理解为 POSIX 是现代操作系统的通用标准，是一种公认的概念。比如说我们公认 `/a/b/c.jpg` 可以表示文件路径，这里的「我们」包括 vscode 的运行环境 nodejs。

上文代码中的 `clipboardInfo` 变量的打印值类似为这样子：

```
file "Macintosh HD:clipboardInfo"
```

`«class furl»` 其实就是 OSA 中文件路径的表现形式，由于最终我们需要把数据传回到 vscode 的 node 环境，所以需要转化为 node 能够理解的路径，所以就有了 `POSIX path` 这一步。

## 调用 AppleScript

```bash
osascript [-l language] [-e command] [-s flags] [programfile]
```

我们调起 `osascript` 这个命令行运行我们写好的脚本，然后监听输出即可

```ts
// 最好判断一下操作系统，上述所有的内容都只能基于 MacOS
if (process.platform !== 'darwin') {
  return
}
// 脚本路径
const scriptPath = 'xxxx';
const script = spawn('osascript', [scriptPath]);
script.on('error', () => {/** 错误处理  **/});
script.stdout.on('data', (data: string) => {
  // 吐出来的数据可能包含换行符和首尾空格，需要去掉
  const current = data.toString().replace('\n', '').trim();
})
```

由于脚本比较简单也可以直接字符串输入 `['-e', 'command']`，我这里是保存为文件了。

![图片](/images/xJ9huhvl3NOFz14RxvsYbA==.png)

可以提一嘴的是，「脚本编辑器」在保存是可以选择保存为 `.scpt` 后缀的二进制文件或者普通文本文件，两者都可以被 `osascript` 执行。我猜测前者执行效率会高一些，而后者算是源文件可以修修改改。各有各的好处任君选择。

# JXA

JXA，全称 JavaScript for Automation。简单来说我们除了可以用 AppleScript 这种偏自然语言的脚本外还可以更优雅的、更 professional 的实现这段脚本。

听起来很有意思对不对？一开始我也是这样想的，然后就开始我的坐牢之旅。这里不得不吐槽 Apple 的文档真是垃圾的不行，坐牢百分之九十的原因是查不到文档。

(Introduction to AppleScript Language Guide)[https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptLangGuide/introduction/ASLR_intro.html#//apple_ref/doc/uid/TP40000983-CH208-SW1]

能搜索到的官方文档时效性明显存在一些问题，并且缺少 API 文档。然后根据提起引导我去 Apple 的开发者网站，恕我直言我没能在最新的开发者文档找到任何关于 JXA 的内容（所以这是已经被放弃的部分吗？）。

## Objective C

说实话我只在大学里学过 C 语言，C++ 和 Objective C 是一概不懂的，以下内容都是瞎摸索的。

有一种逃课的方法是通过 Objective C 来写。OSA 中是允许直接写 Objective C 的

![图片](/images/qrdvcdi4lwEwBOhV+syMHg==.png)

要使用剪切板相关的 API 必须引入 `AppKit`，这块的文档倒是挺全的 (NSPasteboard | Apple Developer Documentation)[https://developer.apple.com/documentation/appkit/nspasteboard?language=objc]。需要注意的是在网页右上角需要把 Language 切换成 Objective-C，否则默认是 Swift（两种语言都是我的知识盲区，所以我看了好久才发现问题）。

`stringForType` 函数的接口如下：

```
(NSString *)stringForType:(NSPasteboardType)dataType;
```

接受一个入参表示要转化的类型，这里的 dataType 也是一种引用的枚举并非简单字符串，非常恶心的是这个枚举是直接平摊在 `$` 上的（找了我半天）。

可以发现用 Objective-C 逃课难点并不在语言本身，而是在 JXA 和 Objective-C 交汇的部分如何使用非常模糊，比如我上述的 Objective-C 在 JS 全局变量上的挂载问题，再比如说 Objective-C => JS 的数据转化问题。

[Marrying JXA with ObjC | JavaScript for Automation (JXA)](https://bru6.de/jxa/marrying-jxa-with-objc/#passing-parameters-between-jxa-and-objc) 我在写这篇文章的时候找到了一篇讲解比较通俗易懂的文章。

简单来说 Objective-C 内的数据基本上是以对象的形式存在直接喂给 js 是用不了的，比如说直接把 `stringForType()` 函数的输出 return 得到的是某个对象在内存里的地址，所以需要用 `ObjC.unwrap` 做一下转换。

## JavaScript

好了不卖关子，最后来说用正经的 JS 实现。「脚本编辑器」有一个词典功能可以查看系统中所有应用的 API，但他有一个非常大的弊端是需要先选择一个应用然后才能查看。

![图片](/images/G4WZMsqWcqTuMUL6sbnYOA==.png)

这也是最初我空有 “clipboard”、“pasteboard” 等关键字，但无论如何都找不到相关 API 的原因。

直到我找到了个仓库[JXA/packages/@jxa/types/src/core/StandardAdditions.d.ts at master · JXA-userland/JXA](https://github.com/JXA-userland/JXA/blob/master/packages/%40jxa/types/src/core/StandardAdditions.d.ts)，该仓库是热心网友专门为 JXA 做的 d.ts 类型补全，然后我在 StandardAdditions.d.ts 这个文件里找到了 `theClipboard()` 和 `clipboardInfo()` 两个函数，而 `StandardAdditions` 又是 `Application` 的属性，根据蛛丝马迹可以推测 StandardAdditions 应该属于所有应用的标准 API 的补充，它的使用需要借助一个应用实例对象。

有了这些线索我们很容易就能锁定到文档

![图片](/images/eEwvwG+TXf3RmMMUby9Mog==.png)

找到剪切板相关内容之后也能切换语言找到另外两种语言的 API

![图片](/images/ZVW3S5tXPDHkHNcxoW44yA==.png)


然后我们就能写出这样子的代码

```
function run(){
  const app = Application.currentApplication();
  app.includeStandardAdditions = true
  const clip = app.theClipboard({ as: "file" });
  return clip.toString();
}
```

运行一下可以成功得到结果，需要注意的是在「脚本编辑器」左上需要把运行语言切换成 JavaScript 才可以调试

![图片](/images/e8x0LjmvKn+ybszNU0EYoQ==.png)

## 调用 JXA

调用 OSA 的方法上面已经提到过了，这里不在赘述，只需要额外传入语言参数即可

```ts
const script = spawn('osascript', ['-l', 'JavaScript', scriptPath]);
```

# 写在最后

其实很久以前我也稍微研究过一阵子 AppleScript。从中能看到 Apple 产品在流程编排方面的一些思考，针对不同受众 No-Code、Low-Code、Pro-Code 都有不同方案，只不过呢能看出来在各方面还只能算是试水并没有往深了做。

最后的最后还是要吐槽 Apple 的文档真的垃圾。
