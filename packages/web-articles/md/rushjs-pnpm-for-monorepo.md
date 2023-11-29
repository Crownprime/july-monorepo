---
title: rush.js + pnpm —— monorepo 终极解决方案
date: Sun Sep 26 2021 18:01:07 GMT+0800 (中国标准时间)
sub: 还在为理不清的依赖版本而头痛吗？在？看看 rushjs
---
前段时间在团队内部分享了关于 monorepo 的解决方案，觉得还算有意义就略作复盘改进发到博客上来。其实字节内部已经有很多团队开始转型探索 rush + pnpm，得益于我们团队的项目比较年轻所以有比较大的改造空间。

我们项目目前是采用 monorepo 的方式去管理其下多端的应用，不过随着项目逐渐庞大，许多问题开始暴露出来。这推动我们去思考和改造目前的项目结构。[5000 万行以上大型代码仓库工程实践](https://mp.weixin.qq.com/s/opCnSlnKYhrNkjP8xN-EGA)

在此之前，我们采用的是时下比较常见的 yarn workspace + lerna 的方式管理 monorepo。yarn 主要还是解决各个 package 之间的 link 关系，达到代码复用的目的[Yarn link 是如何工作的](https://classic.yarnpkg.com/en/docs/workspaces#search)。lerna 主要处理 publish 问题。所以可以总结为：

* Yarn 作为项目 package 管理工具，并且负责 workspace 中 package 的 link

* Lerna 按照依赖关系构建业务 app 所依赖的 package

这种模式在给予我们开发上的便利同时也逐渐暴露出一些问题。有些问题可能无关痛痒，有些问题则可能给项目埋下高风险隐患。

# Yarn workspace 存在的问题

Yarn 存在的问题，主要体现在它对 node_modules 的处理方式上。

![图片](/images/08bfc6663e3cfd4d0be2b8e0dc97b3f76dea11f346876e4cdbcf6555256a3fd7.png)

和 npm@3 相同的是 yarn 会摊平依赖。

不过为了解决 NPM doppelgnger（相同版本的 package 可能安装多份）的问题，我们通常在 root 目录会有一份 node_modules，相当于我们将 monorepo root 视为一个大的 package，当我们在为每个 app 安装依赖时，依赖会被提到 root 下的 node_modules 安装，只有当出现 root 已存在不同版本的依赖且按照规则无法兼容时依赖才会被安装到自己的目录下，这也被称为依赖提升。

* 依赖包作用域扩大

* 依赖相互之间的树状结构从文件存储层面被破坏

## 幻影依赖 Phantom dependencies

> 一个库使用了不属于其 dependencies 里的 Package 称之为 Phantom dependencies（幻影依赖、幽灵依赖、隐式依赖），在现有架构中该问题被放大（依赖提升）。

由于 js 会依次向上查找 node_modules，未被列入 package.json 的依赖如果存在 root/node_modules 中那么项目仍然可以顺利 work。但依赖未被纳入 package.json 的管理是一件非常危险的事情，该项目的依赖的版本完全取决于 root 中依赖的版本。

## PeerDependencies 风险

同样是依赖提升的锅，假设以下场景

* app1 依赖 A@1.0.0 且 app2 依赖 B@2.0.0

* B@2.0.0 将 A@2.0.0 作为 peerDependency，所以 app2 需要安装 A@2.0.0

若 app2 忘记安装则会错误的引用到上层的 A@1.0.0

## 依赖包远程/本地版本不确定

yarn 在匹配依赖包时是以本地优先，若本地不存在则去远程仓库拉取符合版本号的依赖包。这种匹配机制也会存在一定风险，假设以下场景：

* 存在 packageA@1.0.0 且以发布到远程，此时远程和本地代码相同。app1 引用本地代码。

* packageA 做了一些 monorepo 内部使用的变动，没有修改版本号。app1 引用本地代码，使用了新功能。

之后 packageA 做了 break change

* packageA 升级到 2.0.0 并发版

* 由于 break change， app1 并没有打算使用 2.0.0 版本所以没有升级。Yarn 判断本地依赖版本已经不符合，故取远程拉取 packageA@1.0.0。由于远程的包已经落后太多版本了可能出现无法预料的结果。

## 命令很多

“yarn + yarn workspace + lerna”，三种命令，三倍折磨。

## Publish 慢

我们自动化构建的时候往往需要在容器中重新拉取 node_modules，然后再进行构建。Yarn 的 “root node_modules” 决定了我们需要全量的安装整个 monorepo 的依赖，不要说全公司了仅仅包含一个部门代码仓库的 monorepo 都难以接受这种构建速度。

构建存在同样问题，因为不确定我们的应用到底使用了哪些 monorepo 中的 lib，通常的做法是在 install 之后统一 build，这放在大型仓库中同样是一种灾难。

# Pnpm 做了哪些

在 npm@3 之前，node_modules 的结构是树状递归的。

![图片](/images/c920a320630d12820746b4515575725b8a04d0581efcadf4eebbfc8e1bd25ab2.png)

这样做的好处是：**结构一目了然，且每个包的依赖唯一可被确定**

带来的问题是：

* 文件夹层级太深在 window 平台下会有问题

* 存在相同的 package 分散在各个节点被拷贝很多次，造成时间和储存空间浪费

为此，npm@3 摊平了 node_modules 的结构，这种结构在解决了上述的两个问题的同时，在 monorepo 下会引发一系列问题。

pnpm 对 node_modules 的 store 的设计要精妙的多，运行 `pnpm add foo`之后会发生什么呢？画了张图表示 pnpm 因此创建的目录结构

![图片](/images/2f4f0bda1b830d815ccf6542a70c8b52e15dba5635aa59ff41a8c4e0f997dfe2.png)

pnpm 的作者为此写了一片博客讲解具体内容[扁平的 node_modules 不是唯一的方法](https://pnpm.io/zh/blog/2020/05/27/flat-node-modules-is-not-the-only-way)

**核心思路是既要保证包在逻辑上的树状结构又要在物理存储上实现平行存储**

这个命题是不是有点熟悉？化繁为简就是如何在一维数组中存储一颗树，这我可太熟悉了。文件存储与一维数组结构类似，剩下的“指针”就是借助软链来实现，值得一提的跨平台实现“软链”这个功能并不容易，这个暂且不提，总之一通操作之后 pnpm 解决了 yarn 和 npm 存在的两大痛点问题：

* 非完全扁平化的目录结构可以保证依赖的指向具有准确性，解决虚拟依赖的问题。

* 通过软链复用相同版本的依赖，解决依赖重复的问题。

# rushjs 做了哪些

pnpm 被定义为包管理工具，而 rushjs 被定位为项目管理工具，所以他的层级还在 pnpm 之上。
## 统一命令

![图片](/images/da50b7ceb036524f52c1e99e3a27ec6a6d8f802326e3e841ba1f34093a69ccb4.png)

使用 rushjs，不再需要去记住三种东西的命令，所有的功能都在 rush 层面进行了补齐。可以认为过去传统的 yarn workspace + lerna 的模式是建立在两者相互补充能力的基础上；而 rush 则处于更上层的位置全面接管 monorepo 的方方面面，让 (p)npm、yarn 回归包管理工具本身。

rush 在文档中指出，应该避免在仓库里使用 npm 相关指令，比如 `npm install`，`npm update`，`npm link` 等（类似的 yarn 和 pnpm 也应该不被使用）。

```
rush add -p [packageName] [--dev]
// 1. 将依赖添加至 package.json
// 2. 运行 rush update
```

## 强大的依赖分析

### rush update

`rush update` 类似于 `yarn install`，主要用于安装 monorepo 的依赖。不过为了构建更合理的 node_modules 结构，rush 做了更多。

![图片](/images/b752c5e6804f2edc5e9a5cf0558183db8f76cb7971c05546ce9b0cc7c0cbaac7.png)

rush update 做了四件事：

* 分析 monorepo 中各个project的直接依赖关系总结出一份“common-package.json”放到临时目录，里面包含的依赖版本可以满足项目中所有需求。

    - 存在依赖 libA，projectA 依赖 libA: ^1.0.1，projectB 依赖 libA: ^1.0.2，认为libA@1.0.2 可以满足所有需求，列入package.json。
  
    - 此package.json中还包含所有本地 project 的“副本”

![图片](/images/9b7f6e8d7cd6d9920f44558387aaabfcf6d4e902c1f053def4316e263174abf6.png)

* 把各个本地 project 中的 package.json 拷贝一份副本到临时目录

    - 将所有 devDependencies 放到 dependencies 中，（这一步的目的是保证本地project的 devDep 能够被安装）

    - 包含本地依赖的放到 rushDependencies 中

    - 该副本被视为依赖包添加到步骤一中的 package.json 中

* 在临时目录运行 pnpm install。如果不是初次接入 rush 的项目，lockfile 会在这之前被 rush 保存起来，此时会把 lockfile 拷贝到临时目录

* 把在临时目录安装的 node_modules 软链到各个项目中。

### rush build/install --to

rush 借助 pnpm filter 的功能可以针对目标应用安装、构建依赖。举个简单的例子：
```
rush build --to B
```

这行命令在构建应用 B 的同时会自动构建被 B 依赖的本地库。很强大！很好用！

![图片](/images/c612360603b8dcdd71ab034aacffef7d1b0608b601c3d11642da3e89d83a73f0.png)

### lerna + pnpm?

TODO

# 目前遇到的问题

## peerDependencies 版本冲突

当我们在开发组件的时候希望一部分库能够依赖调用的业务应用的依赖包版本，比如 React、ud 版本，所以我们会在 peerDependencies 字段说明必要的依赖包。同时为了能在本地调试，我们会在 devDependencies 添加依赖包。

但在 pnpm 下，如果组件 devDependencies 的版本与业务应用版本不同会出现引用不同版本的包的情况，对于 React 等单例依赖可能会直接报错。

![图片](/images/7a2cbe3593052737a88612c2eb7c1e493d06107c26dcfbcba773a0fbb77af747.png)

正常的远程依赖包：devDependencies 不会被下载，所以会向上检索到 app 的 node_modules，一切正常。

pnpm 下的本地依赖包：通过软链连接到 app 的 node_modules，按照 node_modules 检索规则，调用的 components 会优先检查自己 node_modules 下的依赖，与远程依赖不同的是本地的 components 下存在 devDependencies 下载的 R16。得益于 pnpm 的特性同版本的依赖包会被软链到 pnpm store 中的同一个包，所以 appA 中的 R16 和 components 中的 R16 是同一个包不会报错，但 appB 会跑不起来。

[有个 issues 有具体的说明](https://github.com/pnpm/pnpm/issues/3558)，zkochan 答复给出了非常暴力的临时解决方案：

![图片](/images/5bb5b274752ea4540ec133e14a33a82ceaef7a28022d7caeb86ca112e893874c.png)

## eslint & prettier

### rush-script

顾名思义，rush-script 可以部署一些业务无关的脚本，我们可以把 eslint / prettier 等都塞到 `rush-scripts/package.json` 中；配合 rush 的自定义命令 `rush/command-line.json` 来达到在项目任意目录使用 eslint / prettier。

### .eslintrc.js

同样的不建议将 .eslintrc.js，然后在项目 ROOT 目录通过相对路径，类似 ../../../.eslintrc.js 的方式引用。[rush 文档是这样说的](https://rushstack.io/pages/heft_tasks/eslint/)

比较优雅的做法是新增一个 project 专门用来存放公共 eslint 配置，名字叫为 `@monorepo/eslint-config` ,这是市面上叫为常见的做法，然后各自的 project 在自己的目录下的 .eslintrc.js 通过 extends 字段引用

```
module.exports = {
  // eslint 会自动给去查找 @monorepo 下 eslint-config 包
  // 或者也可以直接使用 extends: ['@monorepo/eslint-config']
  extends: ['@monorepo']
}
```

### 第三方包存在幻影依赖

有些第三方 npm 包的仓库是通过 lerna + yarn workspace 的方式设计的，所以仍然可能存在幻影依赖。这种情况在同样是 yarn workspace 设计的仓库可能问题不明显，但在设计更为严格的 pnpm 就容易出现包找不到，或者 peerDep 被引用到不同版本依赖的情况。

### yarn 到 pnpm 的 lockfile 迁移

切换包管理工具会导致依赖的 lock 丢失，这也是大部分仓库在做迁移的时候各种无法 work 的原因。目前没有比较好的做法，只能根据报错人工去去比对 lockfile。

也包括在补充一些幻影依赖的时候无法确定需要安装的版本的问题。[pnpm 的一个 PR](https://github.com/pnpm/pnpm/pull/2836)

### rush build:watch 代替 reference

为什么要使用 ts 的 project reference 可以查看这篇文档，概括一下主要的目的是为了隔离 common package 和业务 project 的 ts 编译环境，有效防止一个 common package 被引用到不同的业务 app 中打包代码不一致的情况。

reference 仅发生在 ts-loader build 的过程中，如果我们使用 jupiter 的 unbundle 模式或者该依赖包不仅仅只有一个 ts complie 时 reference 就会失效。

rush build:watch 可以根据分析的依赖链路来有效的 watch 依赖和依赖的依赖的变动。
