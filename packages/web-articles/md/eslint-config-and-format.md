---
title: ESLint 的主流配置手段
date: Wed Nov 08 2023 15:16:26 GMT+0800 (中国标准时间)
tags: Geek, Development
---

关于 ESlint 的配置我在之前写过一片文章[ESLint 搭配 Prettier 的食用方法]()。不过前文跟偏向于梳理 ESLint 和 Prettier 的关系，我比较倾向以 ESLint 作为主要手段（包括 formatter）、Prettier 打助攻的做法。

本文主要内容为阐述现在比较主流的 ESlint 配置方案。当然本文也有一定倾向性，主要是针对 TS 和 React 的生态。

# 独立的 eslint-config 包

无论是怎么样的项目统一风格是非常必要的；对于个人而言，名下所有的项目有统一的代码风格意义也类似。所以我们通常需要将 ESLint 配置文件抽象成单独的包，可以作为 monorepo 的本地包使用或者发布到远程给到各个独立的工程使用，相对都很灵活。

由于我的项目都塞在一个由 rushjs 管理的大 monorepo 中，所以下文所有内容的都是在 monorepo 下进行的。

我们新建一个名为 eslint-config 的包，当然为了便于区分 monorepo 中的包名都会有一个 scope，比如我的包就会带上我的艺名叫 `@july_cm/eslint-config`。由于 ESLint 配置文件支持多种语言，且可以通过 `extends` 字段继承，所以可以创建一个名为 `.eslintrc.base.js` 作为基础配置包方便后续共享衍生出多种适用于不同场景的包，js 要比 json 等纯配置文件灵活太多，所以用 js。

# 梭哈的艺术之 @babel/eslint-parser

市面上有众多 ESLint 解析器，我们首选 babel 作为通用且默认的解析器（没错就是一把梭哈）。

我们希望 babel 能把一些js、jsx等通常的文件解决掉。当然 Prettier 是不可或缺的，前文聊过如何让 Prettier 搭配 ESLint 使用且不出现互相干扰的问题这里不再做太多的重复，直接上配置吧

```js
module.exports = {
  parser: '@babel/eslint-parser',
  extends: ['plugin:prettier/recommended'],
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      babelrc: false,
      configFile: false,
      cwd: __dirname,
      presets: ['@babel/preset-env', '@babel/preset-react'],
    },
  },
  ignorePatterns: ['**/node_modules', '**/dist'],
  rules: {
    'prettier/prettier': [
      'warn',
      {
        // 这里写 prettier 的配置
        // 不读取 prettier 配置文件，统一走 eslint 配置
        usePrettierrc: false,
      },
    ],
  },
};
```

做到这步已经完成了百分之八十的工作，整个 eslint-config 已经可以 work 了。

# 高贵的 TS 之 @typescript-eslint/parser

简单来讲就是 babel 搞定不了 ts，咱们 typescript 有自己的解析器。我们需要借助 ESLint config 中的 `overrides` 字段对 .ts 和 .tsx 文件做一些额外的解析

```js
{
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
    },
  ],
}
```

上面的代码只是一个简单的实例，想要把 ESLint 规则配置的“称心如意”还得细致的看看每个插件的 rules 配置项。

# 强迫症必备之 jsonc-eslint-parser

json 从来都不是 ESLint 的目标客户，因为 json 文件在项目中往往有多种作用。它可能是某种 schema 或者是 i18n 文件甚至可能是数据文件，不方便一把去校验格式，一句话就是 json 的水很深 ESLint 把握不住。

但有一种 json 文件它非常规范，没错就是 package.json。乱七八糟的字段顺序和 dependencies 顺序足以逼死每一位强迫症。

所以福音来了，我们在 `overrides` 数组末尾增加一项，专门检查和格式化 `package.json`。

```js
{
  overrides: [
    {
      files: ['package.json'],
      parser: 'jsonc-eslint-parser',
      extends: ['plugin:jsonc/base', 'plugin:jsonc/prettier'],
      rules: {
        'jsonc/sort-keys': [
          'warn',
          {
            pathPattern: '^$',
            order: ['name', 'version', 'author', 'scripts', 'dependencies', 'devDependencies'],
          },
          {
            pathPattern: '^(?:dev|peer|optional|bundled)?[Dd]ependencies$',
            order: { type: 'asc' },
          },
        ],
      },
    },
  ],
}
```

`jsonc-eslint-parser` 的 `jsonc/sort-keys` 可以对 json 的字段属性做排序，上面的代码只是个简单的例子，不是完全体，可以按照 [npmjs docs](https://docs.npmjs.com/cli/v9/configuring-npm/package-json) 的顺序把规则补充完整，然后你就会得到一个十分有序的 package.json。

# vscode 配置

要让 validate 和 format 能力生效，还需要配置 vscode（其他 IDE 没用过不了解，非常卑鄙的无视）

```json
{
  // 指定 eslint 路径，这样其他 package 就不需要再安装 eslint 了
  "eslint.nodePath": "packages/eslint-config/node_modules/eslint",
  "eslint.probe": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.validate": [
    "json"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

有一个要注意的坑，ESLint 插件的文档上说明了 `eslint.probe` 基本上是代替了 `eslint.validate`。但实际测试下来 `json` 配置在 `probe` 字段上是无效的，请配置在 `validate` 字段上，否则 `jsonc-eslint-parser` 什么都做不了。

需要注意如果对其他的 json 没有解析需求，最好在 eslintrc 的 ignorePatterns 字段增加一条规则 `'**/!(package).json'`，否则所有的 json 文件都会被拎去跑 ESLint，但由于除开 package.json 以外的 json 我们并没有配置解析器所以可能会报错。

# 配置使用

把写完的配置共享给其他包使用有多种方式，我个人比较推荐的方式是写成一个 defineConfig 函数，比较符合前端的直觉。代价就是其他引用包也只能使用 js 作为配置文件语言，但这点代价相对于 js 灵活性带来的好处只不过是沧海一粟完全可以接受。

