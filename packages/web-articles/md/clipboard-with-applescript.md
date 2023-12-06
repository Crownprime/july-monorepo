---
title: 借助 JXA 获取 MacOS 剪切板文件信息
date: Fri Dec 01 2023 11:51:46 GMT+0800 (中国标准时间)
tags: Geek
status: draft
---

编写 VSCode Extension 时期望从剪切板获取用户所复制的文件信息，但 VSCode 自带的 api `vscode.env.clipboard.readText()` 最多只能获取到被复制文件的名称信息基本上用不了，所以就考虑能否用 node 通过一些手段调起操作系统的 api 来拿到这个信息。把事情放大到操作系统层面就需要考虑不同操作系统的情况，立个小目标先把 MacOS 上的实现了，于是就有了本文。

# 前情提要

VSCode 官方并非没有支持计划，但也只有半个支持计划。其实早在 19 年就有相关 issue：

[Expose Clipboard#read/write with data transfer](https://github.com/microsoft/vscode/issues/77790)

官方的回复是不会像 Electron API 那样去做一些 "custom" 的事情，而是会持续探索 JS 本身的 API。

[Clipboard - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard) 标准是有了，也就是说 Clipboard 对象应该会增加 `read` 和 `write` 两个函数用于处理非常规字符串的场景，但兼容性堪忧 [Clipboard API: read | Can I use... Support tables for HTML5, CSS3, etc](https://caniuse.com/mdn-api_clipboard_read)。

因此四年过去了，这玩意还没有落地，只能另辟蹊径了。

# AppleScript

用过 IOS 上的「快捷指令」，大概知道 apple 其实给了用户一些“应用编排”的能力。「快捷指令」就是这种能力在 NO CODE 层面的体现，而「AppleScrip」是一种 LOW CODE（怎么感觉一下子到了自己的领域）。

他的语法非常简单甚至有些偏向自然语言，这里不对语法做太多展开，我们专注去实现如何用这个工具来为我们的 VSCode Extension 提供剪切板信息


