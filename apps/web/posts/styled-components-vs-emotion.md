---
title: 从 css-in-js 来看 css 发展历程
date: Wed Nov 02 2022 15:37:10 GMT+0800 (China Standard Time)
tags: React,css-in-js
status: draft
---
前端工程中 css 引入的最佳形式这个命题到目前为止也是争议不断。本文的切入点是在 css-in-js 领域的亮点框架 styled-components 和 Emotion 到底孰优孰劣。不过在表达论点之前我还是说句实在话：和大多数技术一样，使用哪种 css 技术还是要考虑实际项目状况，合适比什么都重要。比如 antd5 为了提升 theme 能力从 less 切换到了 css-in-js；再比如也有团队最终决定舍弃混乱不堪的“样式组件”，转头 css module 的怀抱。所以本文最大的论点不是对两个框架做什么批判，而是要讨论两者背后的设计思路，从中学习前辈们的思想，找到最佳的使用方法。

# css 发展历程

啰嗦了一大堆，但由于定了基调要讨论 css 的设计思想，那我们还是得从头到位提一嘴。

## 刀耕火种

还在前端刀耕火种的时期，css 本身被视为 html 文档的一部分使用 `<style>` 插入在 Dom 节点之前。当然 css 作为 html 额外加载的用于辅助表达页面样式的承载物大多是会被单独放在一个 .css 样式文件中，然后在 html 头部被引入。形如

```html
<link rel="stylesheet" type="text/css" href="https://xxx/xxx.css">
```

有了浏览器的这一步支持，各种 css 库纷纷崛起，比如 Bootstrap、animate 等等经典的库。所以在早间年如何把前端页面做的好，有一个很重要的点在于是否引用合适的样式库，有统一的设计风格和交互标准。

## 打包工具加持下的预处理语言

伴随着前端打包工具（webpack）的发展，less、saas 等预处理语言开始大红大紫，这些预处理语言作为 css 的超集为开发者大幅简化了语法，并引入现代编程思想如：变量、继承、混合、函数等，为大型前端工程的样式赋能。到了这个历史节点，前端逐渐开始模块化、组件化，css 最大的挑战转化为如何在组件化的洪流中跟随组件变迁保证其的独立性、有效性。

在过去的一段时间里 vue2 配合 .vue 内部的 `<style lang="less" scoped>` 几乎是不用过脑子的 css 开发模式。其中的[scoped](https://vue-loader.vuejs.org/guide/scoped-css.html)是 vue-loader 提供的一个额外参数，开启之后会为该 `<template>` 中的 DOM 增加一个哈希属性，借助 css 属性选择器来保证样式不会互相污染，形如：

```html
<style>
.example[data-v-f3f3eg9] {}
</style>
<template>
  <div class="example" data-v-f3f3eg9></div>
</template>
```

而到了 react 这边则引入了 [css module](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/) 的概念。把 css 归类组件化到相应的 `.module.css` 文件中然后再将样式文件引入 js 文件中加持到 className 上。对应的 css loader 识别到 module 文件生成唯一的 className。

# js 驱动框架下的 css-in-js

预处理语言仅能活跃在编译时，到了运行时则和普通 css 无异。而到了 css-in-js 则是让 css 融入到 js 中，让 css 活跃在运行时。

先把一个相较之下的显著缺点抛出：使用 js 在运行时生成 css 样式表会增加开销，存在性能损耗。简单来说如果 css-in-js 放在 5 年之前都会被大部分人否定，就好像如果再倒推十五年恐怕 React 也不得不面对虚拟 DOM 存在性能瓶颈的指责。在浏览器性能过剩的现代开发环境，程序员对应用的性能要求要宽松不少（当然特殊场景需要特殊优化）。所以：性能问题不能阻止 css-in-js 大行其道。

而它具备的优势：

- 与 js 上下文勾连。
- 天然的组件化切片。

足以让前端开发者爱不释手。

## Emotion

Emotion 在 Github 的 Stars 仅有 styled-components 的一半（前者 15.6K，后者）


## styled-components

