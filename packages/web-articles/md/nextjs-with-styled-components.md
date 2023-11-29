---
title: NextJs 与 styled-components
date: Wed Dec 01 2021 15:29:00 GMT+0800 (中国标准时间)
tags: Geek,NextJs
---
在调试页面的时候发现了一个疑似页面样式错乱的 BUG。由于我的站点托管在 Vercel 上，最初我倒是没有细想本能认为是 Vercel 性能拉垮导致样式表传递速度太慢了。

由于心心念念要把项目的包管理工具切到 pnpm，最近搞定了 Vercel 上的 install 指令后马不停蹄就换了，于是乎在本地用 pnpm 测试了一番 script 上的命令。众所周知 next start 其实就是启动 ssr server 主要是在服务器上使用，本地一般用 next dev 做开发调试即可。

然后我惊奇的发现，本文开头的样式错乱问题在本地也能复现。很明显这个锅不能再让 Vercel 背下去了，应该是某种我没有考虑到的渲染 BUG。

明确回顾一下现象特征：

* 初次请求时得到的 html 样式缺失

  ![图片](/images/442db8146af251bc8a78c1a000d10fd0186a425714487cdcba23c0145ae13905.png)

* 在短暂的时间内样式恢复正常

  ![图片](/images/ebffa0d3bc6186dcffedf60a984160289bc6c2404847180b661c8e71ad5d5006.png)

第一反应必然是某个 css 文件加载慢了，所以先检查一下 stylesheet 的 link 是否写的有问题

![图片](/images/64f2f19a6eab5895c80948125f0f72fc7a3f6da1b87ada2feeb894f383bcbe09.png)

可以看到 NextJs 自动生成的 link 非常的标准，先声明 preload 来预加载文件并且再声明一次文件本身来保证样式的加载优先级，所以大概率不是 css 文件加载问题。不过保险起见我们再过一遍 Performance

![图片](/images/631b3f88bb91a9431b4c4598dcedbacd0b552c07177a9a29ccc209b4f32cd497.png)

先查询一下 Performance 中的几个缩写字母的意义

> FP（First Paint）首次绘制
>
> FCP（First Contentful Paint）首次内容绘制
>
> DCL（DomContentloaded）
>
> LCP（Largest Content Paint）最大内容渲染

可以看到在 FP 之后的 150ms 触发了 DCL，期间页面样式处于错乱状态，而在稍后的 LCP 之后页面恢复正常。

如果是一个标准的 CSR 应用，那么 FP 到 LCP 之间的时间页面是以白屏展示，这反而会被访问者归类到网络请求时间，也就是俗称的“网速慢导致页面要打开很久或者打不开”

而对于一个 SSR 应用来说 FP 的页面应当与 LCP 的基本相同！这也是 SSR 被提出来要解决的问题。那么问题锁定：NextJs 的 SSR 渲染出现了某种问题。

# SSR 与 CSS-In-Js

由于之前写过 Vue SSR，看了一眼 NextJs 构建的 dom 结构发现有些类似大致原理应该相同。

在三大框架的加持下 js 驱动型应用在 CSR 应用逐渐流行，由原先的 html 为主 css + js 为辅呈现给访问者 Web 应用逐渐变成 js 为主，html、css 为辅的模式。由于绝大部分提供给浏览器的 js 都可以在 node runtime 运行，由此衍生出的 SSR 可以被认为是两种模式的糅合（当然本质还是 js 为核心）。

Vue 和 React 都有各自的 SSR 手段和服务器渲染库，不过万变不离其宗，其核心流程就是运行 DOM mounted 之前的非 Browser 代码块并把构建出来的虚拟 DOM 树输出成 Html 字符串提供给客户端首屏渲染。当然当 js 到客户端之后除了读取注入到 window 的额外变量之外和普通的 CSR 没有任何区别。不过为了保证双端内容的一致性一般都会对 DOM 和内存进行核对。

由于服务端没有浏览器内核环境，仅仅是使用 node runtime 环境去模拟浏览器环境运行一遍 js 产出可能产生的 dom 结构，从流程上来讲如果再加上页面级缓存，可以认为是为 js 这种解释型语言增加了编译产物（倒开车，笑）。

所以服务端是不关心 css 的表现形式，因为根本不会去渲染它。但当 css-in-js 之后如果是内连样式还好，如果是插入到 document 的样式表服务端是不能无视的。否则可以预见到某一段样式表在服务端返回的 html 中不存在然后在客户端 js 运行一段时间后又出现了，这产生的排版错乱可要比 csr 的白屏可怕多了。

# Next.Js 的 SSR

[NextJs 的 SSR](https://nextjs.org/docs/basic-features/pages) 还引入了一个叫 SG 的概念和 SSR 平级，然后在这之上还有个 Pre-rendering 的概念。

> Next.js has two forms of pre-rendering: **Static Generation** and **Server-side Rendering**. The difference is in **when** it generates the HTML for a page.<br />
**Static Generation (Recommended)**: The HTML is generated at build time and will be reused on each request.<br />
**Server-side Rendering**: The HTML is generated on each request.

在 Static Generation 模式下部分部分确定的 js 逻辑和可以被预见的 DOM 会在 build 阶段被执行和输出。这是一个很逾越常识的功能，一般来说生产的线上环境和构建环境是隔离的，在构建环境确定一些线上表现形式是比较危险的举动，出了问题很难排查。不过在一些特定的场合确实可以有效减缓服务器的压力。

![图片](/images/c72df3c1599a4adc4ba202aca0e985555f6b5257ead29dc33b0e766fdd3f4fd7.png)

可以看到生成的 html 不仅仅只有一个 root 节点，内部已经生成了部分确定的 DOM 结构。

# styled-components 原理

基于以上的分析和基本的 NextJs、SSR 知识，我们基本确定问题出在 CSS-In-Js 模式。而本项目中用到这个模式的库只有 styled-components。为了能锁定具体原因我们还需要聊一下 styled-components 的原理。

这里不多赘述 styled-components 的使用方法，仅说明关键原理。

```jsx
const Button = styled.button`
  color: red;
  font-size: 12px;
`
// 等效于
const Button = styled('button')([
  'color: red;' +
  'font-size: 12px;'
])
```

比较明确的是利用 styled 构建附带样式的组件本质上是运行了一个函数。styled 则是构造组件的高阶函数。我们可以写个简单的 demo:

```jsx
const styled = El => style => props => {
  const ref = useRef()
  useEffect(() => {
    ref.current?.setAttribute('style', style)
  }, [style])
  return <El {...props} ref={ref} />
}
```

所以可以确定的是 `styled` 会被 node runtime 执行到，这个没问题。那么样式缺失的问题来自于哪里呢？其实不难发现上面 demo 的样式是依靠 attribute 插入的，而真实的 styled 则是为元素增加了哈希 className，那么这个 className 对应的样式表去了哪里就不言而喻了。

抛开复杂的动态样式不谈，我们可以从 styled-components 的核心源码「ComponentStyle.ts」发现对样式的处理最终落到 `styleSheet.insertRules` 的插入，而该方法依赖三个入参 `componentId`、`name`、`cssStaticFormatted`。

![图片](/images/8faeec9a7ce7df21fd68be20ec8e1f1bfa0a56bf583dda4739efed93973b64eb.png)

styled 内部的基类存在计数器会对每个实例化的 styled 组件添加唯一的标识属性，也就是上述的`componentId`。

![图片](/images/2c67ff4854dc6bf985537dab5631431879be87cc1fe265e37a172793f64f1606.png)

而 `name` 是根据 `cssStaticFormatted` css 样式片段通过哈希算法得到，被用于指定元素的 className。最终这些信息会变成`<style>` 标签插入 `<head>` 中。

为了更好的理解它原理，我们可以写段简单的代码：每次点击“Hello World”字符就会让它字号增大一像素，而这个动态的样式我们通过 styled 来实现

![图片](/images/8f5d8995ed971d8677ff3e49c22af0ec8fb1e5d0395ea3a06f25903de198916e.png)

我们来观察一下得到的 HTML 的 head，发现已经插入了经过哈希的 className 和相应的样式。

![图片](/images/06badafc4d1cd8b818aebcb4c5a77958721a463d1814b488830feb2dcfafc3e4.png)

然后我们点击几次文字元素再次观察 head 发现多了几条样式，而对应的元素的 className 则对应其中一个样式，这完美的解释了 styled 的运行过程。

![图片](/images/d3b6eba3cef32afbcdc9e7e1b3968617dd019f413027ef0034e98d8f35b2f35d.png)

到这里可能有同学会疑惑为什么 styled 更新样式采用的是增量的，而不会删除前面多余的“废弃”样式？[这样做的原因](https://github.com/styled-components/styled-components/issues/1431#issuecomment-358097912)主要是出于性能考虑。针对这一“缺陷”，我们可以掌握一个优化点——尽量不要在 styled 的样式中做频繁变化的数值计算。这可能会导致 html 中被大量的反复的插入废弃样式。（这就是读源码的好处呀！）

# 锁定罪魁祸首

综上所述，我们可以推断出 styled 在 SSR 渲染下的犯罪的关键步骤：styled 会在运行时偷偷的往 html 中插入 `<style>` 样式表，一旦这个动作在整个应用的 mounted 前那么它在服务端也会被执行。而 node runtime 是不具备 document 实例的且它也无法被继承到客户端所以这个“插入”的动作就变成了一个假动作。

通过犯人找证据就变得非常简单，我们可以观察一下 build 产物中的静态页面：

![图片](/images/b4ad54cb545c65ca3b189915804ed7f34adeadaf25f2176d375d64a4ad43b355.png)

发现经过哈希运算的 className 已经被生成并插入到对应的元素上，但在 head 上并没有对应的样式表，这就是首屏出现样式缺失导致排版错乱的最终原因。

# styled-components 支持 SSR

build 产生的静态页面是由 Next.Js 经过计算将虚拟 DOM 树字符串化后和一些配置模版合并而成，所以我们可以[重写 Document 类](https://nextjs.org/docs/advanced-features/custom-document)，往其中添加 styled 需要插入的样式表。根据 Next.Js [官方文档](https://nextjs.org/docs/advanced-features/custom-document#customizing-renderpage)的说明需要重写的部分仅仅是 renderPage 这个函数

```jsx
// pages/_document.tsx
import Document, { DocumentContext } from 'next/document'
export default class SiteDocument extends Document {
  static async getInitalProps(ctx: DocumentContext) {
    ctx.renderPage = () => {
      // ...
    }
    const initialProps = await Document.getInitialProps(ctx)
    return initialProps
  }
}
```

结合 styled-components [文档对 SSR 的说明](https://styled-components.com/docs/advanced#server-side-rendering)我们可以使用 ServerStyleSheet 对象来为我们的应用增加一层上下文存储所有的样式表，方便我们在编译出 html 的时候一次性获取所有的样式表插入到字符串中：

```jsx
// pages/_document.tsx
import { ServerStyleSheet } from 'styled-components'
// ...
const sheet = new ServerStyleSheet()
const originRenderPage = ctx.renderPage
try {
  ctx.renderPage = () =>
    originRenderPage({
      enhanceApp: App => props => sheet.collectStyles(<App {...props} />),
    })
  const initialProps = await Document.getInitialProps(ctx)
  return {
    ...initialProps,
    styles: (
      <>
        {initialProps.styles}
        {sheet.getStyleElement()}
      </>
    ),
  }
} finally {
  sheet.seal()
}
// ...
```

写完代码之后，我们再次 build 项目并且观察产物中的 html 静态文件，可以发现产生了相当多的额外样式表。

![图片](/images/6b85af21801b3c072d9d1271a1647d98dad0573973701929258bfc3ade5cffb0.png)

启动服务使用 Performance 录制一下渲染时间轴，发现样式错乱问题不再出现！

# 总结

事后我又浏览了一遍 styled 和 NextJs 的文档，发现它们对 SSR 的 case 都有比较详细的说明。也就是说如果我们事先知道 styled 在 SSR 下会有坑那么问题就可以被快速解决。所以这件事的难点在于如何把「首屏样式缺失」这个现象关联到「SSR & styled-components」上。

一般来说 SSR 在客户端二次渲染时会校验 DOM 和内存，被校验的 DOM 是以特殊标记的节点作为根节点向下校验，比如在 NextJs 就是 id 为 __next 的元素，如果出现对不上的情况会抛出错误可以快速定位问题。反而是在 `<head>` 上的 `<style>` 标签问题无法被 check 到。

所以我们在使用 CSS-In-Js 的库时需要额外注意它是否有在 runtime 对 document 做一些操作。

而比如说类似 tailwindcss 即使是在 Just-In-Time 模式下其实也是在 compile time 做的动态样式生成和删减，最终都会被打包器打入 css 的 chunk 文件，反而不会对 SSR 产生影响。

# 2022.10.17 更新

Nextjs 升级到 12.1 以上之后，即使增加了上述代码仍然会出现 hydrate 失败的情况，浏览器 console 会报类似错误：

```
Warning: Prop `className` did not match. Server: "sc-gsDKAQ WHHak" Client: "sc-bdvvtL fKlryF"
```

究其原因，是我在 12 之后从 babel 转到了 swc，万幸的是官方在 [12.1 版本](https://nextjs.org/blog/next-12-1)使用 Rust 重写了 `babel-plugin-styled-components` 所以需要在 next.config.js 修改一下编译参数。

```js
module.exports = {
  compiler: {
    styledComponents: true
  }
}

// 除了布尔值以外，该选项还可以接受一个对象作为参数
// https://styled-components.com/docs/tooling#babel-plugin
```
