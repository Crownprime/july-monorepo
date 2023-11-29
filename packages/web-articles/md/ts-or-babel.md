---
title: ts-loader 还是 babel-loader？
sub: run dev 可不可以快点呢？
date: Tue Aug 31 2021 09:00:00 GMT+0800 (中国标准时间)
tags: Geek
status: draft
---
在使用 ts + react + webpack 工具链开发应用的时候，必不可少需要使用特定的 loader 将 ts 或者 tsx 转化为浏览器可以识别的 js。这一步最初是交给 ts-loader 来处理，ts-loader 内部是调用 typescript 的 tsc 命令来编译 ts 文件。在 babel@7 之后，babel 直接就支持了对 ts 的编译。饱受编译速度折磨的人明显的感觉到这里似乎有捣鼓的空间......

# 前置思路

动手之前我们再次把可能的路线捋一下：

**最初的方案**

TS -> tsc -> 类型检查(可选) -> JS(ESNEXT) -> babel -> JS(ES5)

**可能的方案**

* TS -> tsc -> 类型检查(可选) -> JS(ES5) ---> polyfill(Runtime)

* TS -> babel -> JS(ES5)

可以发现，两种方案殊途同归都想从两种编译器中干掉一种来达到“显著”提升编译速度的目的。

## 类型检查

可以发现 tsc 有一项额外的功能就是对 ts 代码进行类型检查，将错误暴露在编译阶段，但可以预见的是类型检查步骤会极大的拖慢项目编译速度。如果我们把这个步骤从编译时干掉，也能够极大的提升速度。

ts-loader 的 `transpileOnly` 可以用于标志忽略类型检查

[传送门](https://github.com/TypeStrong/ts-loader#transpileonly)

```
{
  test: /.tsx?$/,
  use: [
    { loader: 'ts-loader', options: { transpileOnly: true } }
  ],
}
```

从 ts-loader 中干掉类型检查并不意味着不做类型检查，否则 ts 将失去意义。

比较推荐的做法是：

* dev 环境依靠 vscode & ESlint 的语法提示

* 代码仓库设置 CI 准入通过类型检测的代码，保证主干代码准确性

* build 时使用 ForkTsCheckerWebpackPlugin 作为类型检查插件

### ForkTsCheckerWebpackPlugin

> Speeds up TypeScript type checking and ESLint linting (by moving each to a separate process)

这玩意使用额外的线程去做类型检查，可以降低主进程的压力。

ts-loader 仓库也提供了简单的例子，[传送门](https://github.com/TypeStrong/ts-loader/tree/main/examples/fork-ts-checker-webpack-plugin)。

```
// dev
new ForkTsCheckerWebpackPlugin({
    eslint: true
})
new ForkTsCheckerNotifierWebpackPlugin({ title: 'TypeScript', excludeWarnings: false })

// prod
new ForkTsCheckerWebpackPlugin({
  async: false,
  useTypescriptIncrementalApi: true,
  memoryLimit: 4096
})
```