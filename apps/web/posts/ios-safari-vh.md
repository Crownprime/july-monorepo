---
title: VH 与 IOS Safari
date: Mon Dec 06 2021 17:10:00 GMT+0800 (中国标准时间)
tags: Geek,CSS
---
vh 全拼 viewport height 意为将可视区域分为 100 份，每一份即为 1vh。

我们通常习惯使用 height: 100vh; 来设定一个一屏高度的容器。然而这个特性在 IOS 移动端存在一些问题。

![图片](/images/83c4de91fe2ecca95af25465332c79c6cacff8a9da93a03fd48f2774efc52b71.png)

可以看到在 Safari 中 100vh 还包括底部的 bar，这会导致一系列问题比如图中的底部按钮被遮挡。在 IOS15 地址栏被合并到了底部的 bar 上使得这种情况变得更加糟糕

![图片](/images/41c06cd650ff92b90b88d89ab7b32cec54f9b3cd9d52a14c185431e830f72c77.png)

要解决这个问题我们只需要判断出是否为 IOS 设备并且特殊处理即可。这个逻辑交给 js 非常简单，但为了更「优雅」我们选择用 css 解决，因此我们需要接触一些不常用的 CSS 属性

# @supports

中文名为[特性查询](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@supports)。其本身用来判定某个 CSS 表达式是否有效（有效可以指是否能被浏览器解析）

![图片](/images/02bfc5e7e54639dd79326a6ecf2648ebf273b8cab4c7b8cda6897642a44df4f4.png)

有意思的是，它还支持和 selector、not、and、or 操作法联用。它常用于判断某个 CSS 属性是否有效，当「某个CSS属性」为某个浏览器特有时我们就可以利用它来确实浏览器环境。

# -webkit-touch-callout

用于禁用默认的 callout 展示，callout 是指当触摸并按住一个元素时出现的提示。这个属性只在 Safari 中被支持。

![图片](/images/8e442e7a7b4335cf24acb18893394281ca81f5c407f578465143839044d52ca7.png)

# -webkit-fill-available

这是一个兼容性非常烂的属性，作用为撑满块级元素包括宽、高。它的本体描述为 stretch，能够比 100vh 更准确的描述 viewport 高度。

![图片](/images/66f0e61a6eb9c58947dada889cf7509976d919486d845c42aabce5222a9e298c.png)

万幸的是我们的目标浏览器 Safari 支持它

# 核心代码

由于我们的项目中使用了 tailwindcss，所以我们可以为已有的 className 增加样式。

```css
@supports (-webkit-touch-callout: none) {
  .h-screen {
    height: -webkit-fill-available;
  }
}
```

这样 100vh 在 IOS Safari 的兼容性就解决了。

原理参考来自于 [postcss-100vh-fix](https://github.com/postcss/postcss-100vh-fix)。所以如果项目中使用了 postcss 处理 css 则可以使用这个插件轻松解决问题。需要注意的是 css-in-js 的组件以及 tailwindcss 并不能被 postcss 覆盖到。