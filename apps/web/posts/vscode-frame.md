---
title: 开放 VSCode Extension 前置工作
date: Sat Jan 29 2022 17:01:54 GMT+0800 (中国标准时间)
status: draft
tags: Geek
---
在几个月前我写了一个叫 markdown-helper 的 VSCode 插件，然后顺便还写了一片笔记专门记录过程。当时由于没有准备在线编辑器，所以博客文章的插图几乎都插不进去，所以火急火燎的写了一通。

不过维护至今，之前忽略的以及初学者的错误理解带来的问题日渐放大，所以趁着年前稍稍有些空重构一下。

欲善其事必先利其器，本文记录如何正确的初始化一个 VSCode Extension Project，一条龙解决后续可能造成的隐患。

# 脚手架

最初我参考的是 [VSCode 插件开发全攻略](https://www.cnblogs.com/liuxianan/p/vscode-plugin-overview.html) 这篇教程，写的很详细很棒，不过个人觉得不够成体系，于是我又找到了另一个文档 [VS Code 插件开发文档](https://liiked.github.io/VS-Code-Extension-Doc-ZH/#/get-started/your-first-extension) 帮我解开了很多疑惑。

果然我还是更适合看文档而不是教程。

万事开头难，这句话其实不适用于开发者，因为“我们是站在巨人的肩膀上编程”，任何一个语言分支都能找到相对成熟的脚手架帮助你轻松走出第一步，vscode 也不例外。[vscode-generator-code](https://github.com/Microsoft/vscode-generator-code) 会帮助你解决项目初始化 99% 的问题，我们先全局安装它。

```bash
npm install -g yo generator-code
```

这里有个题外话，我们还顺手安装了 [yeoman](https://yeoman.io/)。它是专门用来脚手架的工具，怎么说还有点抽象，如果我说他有个概念叫做 `generators`，我想大部分朋友都会恍然大悟，我们在安装脚手架的时候总会有多个分支选项，根据我们的选择生成不一样的模版，yeoman 就可以提供这种能力。

然后我们找个合适的文件夹初始化脚手架：

```bash
yo code
```

开始前会有些选项，比较推荐的是使用 Typescript 作为开发语言（别问我为什么，都是 2022 年了），比较重要的是使用 webpack 作为打包工具。

![图片](/images/c6b6bab6842dc88453828c6c336b04ec997a5ac2e525c84ea2cc5789859f6571.png)

webpack 作为 web app 的打包工具用在 node 应用确实有点不合理，毕竟市面上没有特别能打的（能用就行，不计较啦😊）。

如果不使用 webpack bundle，默认使用 tsc 作为编译器，在最后的 publish 阶段我们会被迫把 `node_modules` 文件夹也上传到商店。package 可以大到窒息。别问我为什么这么痛心疾首，对比一下重构前后插件的 package 你就懂了。

![图片](/images/dac16b4cf72beaa2eb9aac5970753eeb622eb6195f8838efe3ad859ff259c391.png)

当然如果开发之初能够确定插件不会引用任何第三方库，那么 tsc 就变成了最好的选择。

至此，我们的 hello world extension 已经可以 run 起来了。

# 调试

当我们写好一波代码时最快速的验证方法就是放到实际环境中跑一跑，这点脚手架也帮你整好了。

**按一下 `F5` 即可启动 VSCode 的调试功能**

一开始用这个功能的时候一脸懵逼，只知道大体的原理：编译源码、启动一个 VSCode 进程、安装插件。但具体每一步在哪里、怎么发生比较迷糊。我上面提到的文档也是语焉不详，所以我们还是看[官方文档](https://vscode-docs.readthedocs.io/en/stable/extensions/debugging-extensions/#:~:text=Once%20the%20Extension%20Host%20is%20launched%2C%20VS%20Code,a%20shell%20command%20to%20npm%20run%20compile.%203.)吧。

这里不多展开
