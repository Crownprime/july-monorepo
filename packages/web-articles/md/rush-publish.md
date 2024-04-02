---
title: Rush Publish 扫盲
date: Wed Dec 20 2023 17:34:50 GMT+0800 (中国标准时间)
tags: Rush.js
status: published
---
之前也写了不少关于 Rush.js 的基础知识和配置但没有正儿八经的写过 npm publish 相关的内容，所以就单独写一文吧。

能够发版成功的必要条件是 package 的 version 必须有变化，**下文所有做的事情核心目的就是让指定 package 的 version 能够产生变化，然后顺利发版**。

## 能被发布的包之「shouldPublish」

首先我们知道在一个大 monorepo 中并不是所有的 packages 都需要被发布。

因此我们需要明确有哪些包需要被发布，当然我们自己心知肚明还不够还需要告诉 Rush.js。`rush.json` 配置文件的 `projects` 字段中有一个布尔类型的属性 `shouldPublish`，标记该包是否需要被发布：

```json5
// rush.json
{
  "projects": [{
    /**
    * A flag indicating that changes to this project will be published to npm, which affects
    * the Rush change and publish workflows. The default value is false.
    * NOTE: "versionPolicyName" and "shouldPublish" are alternatives; you cannot specify them both.
    */
    // "shouldPublish": false,
    shouldPublish: true
  }]
}
```

需要明确的是某个包的 `shouldPublish` 标记为真代表着该包有被发布的「资格」，并不是每次发布都有它。

通常我们只会发布**改动到的**以及**被改动波及到的**包，而不是每次发布把 monorepo 仓库内能发的包都全量发一次。所以下一个步骤是定位我们所需要发布的包。

## 需要被发布的包之「rush change」

我们对包内的文件做一些略微的修改后执行 `git add . && rush change` 命令

> 文件的改动必须至少提交到 git 的暂存区

我们来看一下 rush change 的用法，这里只摘录我认为非常有用的：

```bash
rush change [-b BRANCH] [--bulk] [--message MESSAGE] [--bump-type {major,minor,patch,none}]

# 一旦指定该参数，会比较当前分支和目标分支的差异。如果没有指定该参数，则默认比较 "main" 分支
-b BRANCH, --target-branch BRANCH

# 一旦指定该参数，那么会将相同的变更信息和变更类型应用到所有项目。一旦使用该参数，同时需要指定 --message 和 --bump-type 参数。
--bulk

# 当指定 --bulk 参数时，该参数会适用于所有变化的项目
--message MESSAGE

# 当指定 --bulk 参数时，变更类型会适用于所有变化的项目
--bump-type {major,minor,patch,none}
```

可以发现 `rush change` 是基于 git diff 的，这也是为什么我们需要先把改动提交到暂存区。通常情况 branch 不是必填参数，我们可以在 `rush.json` 的 `repository` 字段中把 branch 和 remote 都设置好。

bulk 等一系列相关参数也不是必填的，它主要针对的是多包发版的场景，我们放到后文讲，暂且专注到一个包的发布。

因此我们只需要运行 `rush change` 即可在 `common/changes` 文件夹中生成 `<branchname>-<timestamp>.json` 格式的临时文件。

运行命令时还需要人工填写一些数据，主要是 type 和 commit 两项。前者可选 `{major,minor,patch,none}` 四种，后者仅是变更信息后续可以用做 CHANGELOG 或者 git commit message。

而这两要素加上 packageName 共同组成了临时文件的内容。前文提到 rush change 深度依赖 git diff，因此如果我们不使用 git，有理由相信只要按照约定的规则生成这些临时文件依然可以走 rush publish 这一套（只是猜测，没有实践哈～）

![图片](RGmiZCuDi8DLYDO0WYev9w==.PNG)

## 快速发布之「rush publish」

摘录一部分会在本文中用到的参数

```bash
rush publish [-a] [-p] [--set-access-level {public,restricted}] [--include-all] [--version-policy POLICY]

# 一旦指定该参数，则变更请求会被应用到 package.json 文件中。
-a, --apply

# 一旦指定该参数，则会将变更发布到 npm 上。
-p, --publish                          

# 一旦指定该参数，则 rush.json 内所有设定 shouldPublish=true 的项目，和指定了版本策略且其版本比旧版本新的项目都会被发布。
--include-all

# 版本策略名，当使用 --include-all 时，只有存在版本策略的项目会被发布。
--version-policy POLICY
```

我们可以运行 `rush publish -a` 浅浅的尝试一下发布，请大胆敲命令这一步并不会真正的发版，然后观察文件变化会发现 rush 会消费上一步产生的临时文件生成 CHANGELOG 以及修改 package.json 中的版本号。

版本号变更意味着我们已经可以进行基础的发版了，让我们带上 `-p` 命令进行一次真正意义上的发版。

```bash
rush publish -a -p
```

### 配置 .npmrc

如果是第一次发包过程应该不会太顺利，因为我们还需要对 npm 做一些配置，找到 `common/config/rush/.npmrc-publish` 文件

```bash
# 发版的源
//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}
# 当我们尝试往 npm 发布带 scope 的 pravite 的包是要收费滴，所以通常是设置为 public
access=public
```

这里的 NPM_AUTH_TOKEN 令牌取决于你发布的源，如果是发到 npm 上则需要到其官网登录账号之后找到 account token 界面新建一个 token 即可（记得勾选 publish 的权限）。

### 推荐的做法

通常不推荐直接把 token 字符串写在 `config/rush/.npmrc-publish` 文件上，因为该文件很有可能是会提交到远程 token 有泄露的风险。

推荐把它写成环境变量：

```bash
# ~/.zshrc
export NPM_AUTH_TOKEN="npm_xxxxxxx"
```

保存之后重启一下终端，输入 `echo ${NPM_AUTH_TOKEN}` 能正确的输出 token 就表示成功了～

> 如果在调试的过程中发现无论怎么修改 `.npmrc-publish` 文件好像不生效，请查看一下 `common/temp/publish-home/.npmrc` 文件，发布成功之后 rush 通常会存一下缓存文件到这里

**至此我们已经掌握了用 Rushjs 进行单包发布～**

然而经验告诉我们在 monorepo 中任何功能都需要「乘以」包的数量，不止是 dev、watch、build，我们的 publish 有时候也要按照依赖树顺序执行一遍。

## 版本策略「version policies」

Rush.js 给了一个叫版本策略(version policies)的概念，到目前支持两种类型：

- lockStepVersion：使用该策略的项目使用一致的版本号
- individualVersion：根据变更文件和版本限制自增版本

找到 `common/config/rush/version-policies.json` 文件，它的内容是一个数组允许你设定多种策略。

```json5
// common/config/rush/version-policies.json
[
  {
    "policyName": "customName",
    "definitionName": "lockStepVersion or individualVersion"
  }
]
```

设定完成之后在 `rush.json` 中为指定的 projects 增加 `versionPolicyName` 字段即可：

```json5
// rush.json
{
  "projects": [{
    "packageName": "your-package",
    "versionPolicyName": "customName"
  }]
}
```

### individualVersion

我们先来说 `individualVersion` 策略，因为它非常简单。上文我们提到 `rush change` 通过 diff 罗列出有代码修改的包然后在 `rush publish` 前完成版本的变更，一句话解释就是：

**谁的代码变化了，谁的版本号就会被提升，最后就发布谁。**

这个规则适用于单包，也适用于多个相互之间没有关联的包。但如果是存在一定依赖关系的包则适用于 `individualVersion` 策略。

我们以业界都比较熟悉的 `antd` 举例子，一般的组件库都会分化出一个专门的 icons 包，`antd` 有一个名为 `@ant-design/icons` 专门用于存储 icons，如果我们需要使用 icon 则需要专门安装使用这个包。

> 方便起见下文我用 `icons` 来代指 `@ant-design/icons`

同时我们也不难猜出 `antd` 本身也会引用这个包，比如一些 Button、Input 可能就带有 icon，也会从此包获取物料。打开 antd 主包的 [package.json](https://github.com/ant-design/ant-design/blob/master/package.json) 观察 dependencies 也能证实我们的猜测。

因此我们可以得到一个简单的依赖引用图：

![图片](DRr3pCNhTfZGxi2yNzWspQ==.png)

假设我们修改了 `icons` 中某个图标的样式，一方面我们需要提升 `icons` 的版本同时发布，另一方面我们希望改动能在 `antd` 生效，**即修改 `antd` dependencies 中 `icons` 的版本到最新版本，提升 `antd` 版本，然后发布**。

如果想要一口气把上述的事情做完，那么恭喜 `individualVersion` 策略非常合适。

需要关注的是在上面的流程中 `antd` 和 `icons` 版本号并不一致，两者的版本号联动关系完全取决于他们的依赖关系。换句话说 `antd` 的改动和版本提升不会影响到 `icons`；如果有朝一日 `icons` 从 `antd` 的 dependencies 移除那么 `icons` 的改动和版本提升也不会影响到 `antd`。

> 明确的是 dependencies 和 devDependencies 都属于依赖关系，peerDependencies 不属于

### lockStepVersion

`lockStepVersion` 策略比较容易描述，使用同一策略的包锁定相同版本号。这种场景非常多比如 `react` 与 `react-dom`、`vue` 与 `@vue/runtime-dom` 等，我们在使用时尽量会使用相同版本的包，这里不做太多使用场景的解释。

如果我们设置策略为 `lockStepVersion` 那么还有个必填字段为 `version`，它表示所有应用本策略的包的当前版本。这玩意需要手动设置一次否则运行会报错。原因可能是初次设定策略的时候多个包的版本可能是不一致的，所以需要人工来强制设置一个统一版本（但我认为是 rush 偷懒了）。这里的 `version` 在 `rush publish -a` 时会和 package.json 中 version 一起被自动修改，所以后续就不用再关心了。

```json5
{
  "policyName": "syncVersion",
  "definitionName": "lockStepVersion",
  // required
  "version": "0.0.1"
}
```

#### nextBump

`lockStepVersion` 策略还有一个选填字段 `nextBump`，他用于设置下一次版本提升的级别。

```
"nextBump": {
  "description": "Type of next version bump",
  "enum": ["none", "prerelease", "preminor", "minor", "patch", "major"]
},
```

这个字段原先是必填的，截止到我写本文的时间 version-policies.json 的注释中仍然标注着 Required。不过早在 22 年就有 pr 将其改为 Optional，并且补充了 rush publish 在 nextBump 在缺省情况下的 bump 能力。

> 有兴趣可以看看[这个pr](https://github.com/microsoft/rushstack/pull/3059)

因此如果你需要用到 `nextBump` 字段，那么你必须用到 `rush version` 命令。

## 修改版本的能力来自于「rush version」

放到最后讲的原因是它并非是一个必须的命令，简化笔记、推荐用到再看。

`rush version` 作用和 `rush publish` 中的 `-a, --apply` 作用非常类似，都是消费 rush change 产生的临时文件并修改包的版本号。它的本意是细化发布的步骤，方便观察和调试。

```bash
rush version [--bump]

# 基于版本策略进行版本变更。
--bump        

# 版本策略的名称
--version-policy      
```

其他的参数我都略过，唯独需要提 `--bump` 参数。

当我们设置 version policies 策略为 `lockStepVersion` 且指定了 nextBump 之后，`rush change` 时将不会再询问 type 且在临时文件中的 change type 会被默认设置为 "none"，此时去运行 `rush publish -a` 会发现版本号没有任何变化。我们可以理解为 apply 只消费 change 产生的文件，不关心版本策略。

当我们运行 `rush version --bump` 时 rush 会去遍历所有 version policies 的包并按照设定的策略更新版本，**无论是否有变更、无论是否依赖**。

由于版本号已经变更且没有临时文件，所以我们在发布时要使用 `rush publish --include-all` 意思为发布所有版本号更新的包。

> 听起来非常简单粗暴，所以在 CI 中使用该功能是一个非常好的选择。

## 总结

最后做一个总结吧。单纯的利用 Rush.js 单包发布是非常简单的，但当需要「自动化」的完成多包联合发布我们就需要了解 publish 的高阶用法，包括版本策略、bump 等概念。

一张图概括所有步骤，上半部分属于步骤拆解、适合人工的操作；下半部分非常适合 CI 自动化发布。

![图片](eoR5SFcINnXh6xfyh/QrUQ==.png)
