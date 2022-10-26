---
title: 如何正确的下载文档流
date: Thu Nov 04 2021 17:07:25 GMT+0800 (中国标准时间)
tags: Geek
---
有一个「导出」按钮，用户点击之后后端返回文档流，前端自动唤起浏览器下载。如此简单的功能要如何完美的去实现它呢？
比较简单的做法是把请求的 url 直接当作 `a` 标签的 `attr`，类似这样 `<a href={url}>导出</a>`，但由于在设计之初考虑到这个导出接口附带大量的筛选项，所以使用了 post 请求方式，那么只能使用 ajax 去做这件事。然后看起来是一个简单的功能，却触及到了我的知识盲区（逐渐弱智），因此做个简单的记录。

# ajax 侧

能实现这个功能的前提是我们需要能够「正确」的拿到后端传递的数据，所以我们需要在 ajax 请求侧做一些额外的工作

## responseType

前端常用的 ajax 请求库是使用的 axios，而 axios 的浏览器端的核心请求库是 [XMLHttpRequest](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest)。最初我天真的以为 XHR 可以根据响应头智能的识别响应体的内容（事实上从应用层的角度上确实可以）但上升到 js 层面的数据格式化方式则需要手动指定。

从目标上来看，我们希望得到正确的数据，即

```ts
const blob = response.data
```

我们查看 [axios adapters 部分的源码](https://github.com/axios/axios/blob/master/lib/adapters/xhr.js)，来寻找这个 response.data 到底是怎么被得到的

![图片](/images/c3ab5c5a0d07ea4483e96d404170a321f0c3a4ee21b9ea8de9d8a8cc4532ca8d.png)

也就是如果 responseType 没有被指定或者是 `'text'` 或 `'json'` 就会读取 xhr.responseText，否则读取 xhr.response。我们进一步从 xhr 的文档确定我们所需要的应当为 xhr.response

![图片](/images/ebe127d0c6e2c52e6ef78b7ea0bda3eb65191ce04a023d2679fc8f5f3fef2805.png)

当然从文档对 [XMLHttpRequest.responseType](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/responseType) 字段的说明，结合 axios 对 config.responseType 的操作，我们不难判断出，只有当我们手动设置 responseType='blob' 时，xhr 会将 http 请求体格式化为 Blob 对象且 axios 会正确的将 xhr.response 赋值给 responseData

![图片](/images/22de50b289bc03d5228f73b2f4f9b0a300112af76e7340ea74526f8c396b65c3.png)

经过这一系列连锁反应，我们就可以得到正确的数据。因此我们写下第一行代码

```ts
request.post(url, data, { responseType: 'blob' })
```

## middlewares

一般请求库会做一些中间层用于打点或者错误拦截，常见的操作会对 data 中的某些属性进行操作，而当 data 是 Blob 时可以会出现一些意外导致报错，所以我们需要把他排除在外

```ts
await next()
const { response } = ctx
if (!error && response?.data instanceof Blob) {
  return
}
```

# 交互侧

前端在需要下载文件的场景一般通过

* window.assign 直接跳转

* 借助 a 标签模拟点击事件

而这两种方式都需要得到下载文件的 url，因此我们需要通过 URL.createObjectURL() 这个方法[实现 Blob 向 url 的转化](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL)

```ts
const { data } = await exportFile()
if (data instanceof Blob) {
  fileDownload(URL.createObjectURL(data))
}
const fileDownload = (url: string) => {
  const $a = document.createElement('a')
  $a.target = '_blank'
  $a.style.display = 'none'
  $a.href = url
  document.body.appendChild($a)
  $a.click()
  document.body.removeChild($a)
}
```

## 文件名

下载功能是实现了，但还没来得及松口气打开下载文件夹一看，好家伙！文件名显得非常的抽象很明显不符合预期。

![图片](/images/11bef85c43c7e5b2d59748c328131481affa7316cc6074d0ab0246da2e1bb5a4.png)

因此我们还需要增加一个能力，通过后端获得正确的文件名并且重命名到下载文件上。

当 http 请求内容为附件时通常会具备 content-disposition 这个响应头，我们可以在[有关他的说明文档](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Disposition)中找到该头的意义。

> 在常规的 HTTP 应答中，`Content-Disposition` 响应头指示回复的内容该以何种形式展示，是以**内联**的形式（即网页或者页面的一部分），还是以**附件**的形式下载并保存到本地。

而他的语法是这样的：

![图片](/images/d7f40fa09f157bcc94fdc5da81a6e2b971874567b81bd2b726c076faf6739796.png)

因此我们可以写个简单的正则拿到后端指定的文件名

```ts
const { headers } = await exportFile()
const fileName = headers['content-disposition']?.replace(/.+?filename=(.+)/, '$1')
```

需要注意的是 content-disposition 的字符是经过转义的，所以如果文件名出现中文会乱码，因此在下载之前要做一次转义

```
decodeURIComponent(fileName)
```

然后我们可以借助 a 标签的 download 属性来指定下载文件名

![图片](/images/1a99687cde4e6be2ecf111cea0e4772d5bbfbdda0e6936048790a845cfc0fd3d.png)

对 fileDownload 方法做一些优化

```ts
const fileDownload = (url: string, fileName?: string) => {
  // ...
  $a.download = fileName || url
  // ...
}
```

done.