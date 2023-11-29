---
title: ESLint 搭配 Prettier 的食用方法
date: Thu Oct 27 2022 15:47:44 GMT+0800 (中国标准时间)
tags: Geek, Development
---

「ESLint Auto Format」 是一个懒人前端必备能力。尤其是作为写几个字符就要 command + s 一万次的封建保守派程序员来说，如果 VSCode 不能把“=>”、“{}”各种间距给我弄好了，我可能代码都要写不下去了。原本我整了个 eslint-config 的包专门用来存放个人风格习惯的规则，奈何本人记忆里不佳，每次新开项目包是有了但怎么使用给忘了，然后开始花一下午整蛊。

所以趁我现在思路清晰，赶紧把方案以及正确的使用方法记录下来。

# ESLint configuration

市面上可能还会有很多名词，如 Prettier、TSLint 等等，咱先不讨论某些包是不是已经寄了，首先明确的一点是我们就要使用 ESLint 这个东西。

ESLint 是一个调用既定规则的静态语法检查器，所以它给了一个地方专门给我们写[自定义配置](https://eslint.org/docs/latest/user-guide/configuring/configuration-files)，它的名字叫 `.eslintrc.*`，意思就是 `.eslintrc.js` 也行，`.eslintrc.json` 也行，当然写在 `package.json` 里也行。同一目录下如果存在多份配置文件 eslint 仅会读取其中一个，优先级是：

```
.eslintrc.js > .eslintrc.cjs > .eslintrc.yaml > .eslintrc.yml > .eslintrc.json > package.json
```

而如果配置文件中没有 `root: true` 这个属性，那么 ESLint 还会逐级向外寻找配置文件，存在重复的规则则距离文件更近的配置优先级更高，将这些配置叠加之后就是最终的配置规则，所以一般的项目根目录底下最好加一个配置文件且注明是根目录，可以让 eslint 少费些功夫。

ESLint 的配置文件允许用户配置 `extends` 字段，顾名思义可以做继承，所以市面上就开始充斥各种各样的自定义规则包，不过这里填写规则非常整蛊我在此记录一下

```json
// 数组中的每个配置项继承它前面的配置
"extends": [
  // eslint-config-standard
  "standard",
  // @standard/eslint-config
  "@standard",
  // eslint-plugin-react 中的 recommended 配置
  "plugin:react/recommended",
  // @typescript-eslint/eslint-plugin 中的 recommended 配置
  "plugin:@typescript-eslint/recommended",
  // 直接写路径也行
  "./node_modules/coding-standard/.eslintrc-es6"
]
```

浏览官网发现 ESLint 开启了一个[实验性质的 feature](https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new)，允许使用 `eslint.config.js` 作为配置文件，目前还没有过多研究下次再说。

# Prettier

[Prettier](https://prettier.io/) 的话大家应该也不陌生，官方对他的定义是这样的：

> Prettier · Opinionated Code Formatter

有了 ESLint 为啥我们还需要 Prettier 呢？可以理解为对代码的格式化分为两个方面：

**代码质量问题 and 代码风格问题**

ESLint 主要处理的还是代码质量问题，比如 `no-unused-vars`、`prefer-promise-reject-errors` 等等。其实把这些搞定了基本上 cover 了程序的潜在风险，奈何程序员都是强迫症，对于换不换行这样一个小问题都可以讨论半天。所以 Prettier 就站出来了说：“你们别吵了，都听我的”。大家听了纷纷点头。

但 ESLint 和 Prettier 的标准并非完全对齐的，所以很容易出现冲突导致程序员左右为难。所以我们依然以 ESLint 作为主体，而 Prettier 以 ESLint 插件的形式入场。

我们使用 `eslint-config-prettier` 这个配置 ban 掉 ESLint 所有和 Prettier 有冲突的配置，也就是说 ESLint 的一部分职责被 Prettier 接管了。

```json
{
  "extends": ["prettier"] // 放在最后保证全覆盖
}
```

然后其实到此为止已经能用了，但我们还可以继续做些事情。我们可以引入 `eslint-plugin-prettier` 这个插件，它的主要作用是把 Prettier 推荐的格式问题的配置以 ESLint rules 的方式写入，这样可以统一报错来源，我们不再需要关系 Prettier 只需要知道 ESLint 有规则在报错即可。

```json
{
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

如果觉得没问题，那我们还可以把上述两个步骤合起来，这也是官方推荐的配置

```json
{
  "extends": ["plugin:prettier/recommended"]
}
```

当然别忘了我们需要安装相关的内容

```bash
pnpm i eslint-config-prettier eslint-plugin-prettier prettier -D
```

如果此时你是在制作一个公用配置包，前往别忘记为 ESLint 增加 peerDependencies 以符合整体规范。

# VSCode Extension

如果我们希望 IDE（指 vscode）能够有 auto format 的能力，我们还需要安装 [ESLint VSCode 插件](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)。

然后在恰当的地方如工作区配置或者文件夹配置写入配置

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

大功告成。

# 总结

之前由于搞不清楚 ESLint、Prettier、插件在这一整条链路的扮演什么角色，所以总是浑浑噩噩的胡乱配一通然后发现各种不能 format，这一次性梳理清楚之后神清气爽。