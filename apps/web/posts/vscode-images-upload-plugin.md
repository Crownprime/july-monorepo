---
title: VSCode 图片上传插件的轮子
date: Fri Oct 08 2021 16:37:16 GMT+0800 (中国标准时间)
status: draft
tags: Geek
---
之前一直在用托管的 CMS 系统做内容来源，这会儿用上了 next.js 之后已经不想用复杂的 CMS 和复杂的 api 了。纠结了好几天决定还是用 markdown 作为内容载体吧（虽然 wordpress5 的古腾堡编辑器真的很好用，嘤嘤嘤），就算以后再做迁移内容也不会丢失，这块有空我再开个文整理一下。现在失去 CMS 之后最迫切的就是需要一个图床。

整理了一下思路，图床本身并不是什么难的问题，重要的还是要能“方便的”写文章，而不是大部分时间都在思考如何命名图片名称以及在网页上批量上传图片，所以这个流程应该具备以下几个功能：

* 能够自动上传到 SSO

* 能够在本地备份

* 能够处理图片的名称（强迫症接受不了 01.png、未命名.png 这种乱七八糟的名称）

* 能够合理的插入到 markdown 中

要符合上述要求，一个 vscode extension 呼之欲出。于是乎我翻了一圈扩展商店并没有特别合适功能的扩展（要么就是要做一些反人类的设定），还是自己手撸一个吧！

# 搭个架子

vscode 本身是用 `Electron` 开发的，所以随便来点 node 代码就能作为一个插件使用，只是需要注意 vscode 本身约定的格式。[微软官方有专门的脚手架](https://github.com/Microsoft/vscode-generator-code)，非常好用，不过对于我来说有点问题，这个之后会讲到，所以这里放弃使用它，改为裸建了一个纯净的项目。

[VSCode 插件开发全攻略](https://www.cnblogs.com/liuxianan/p/vscode-plugin-overview.html) 这个作者写的很详细，之前 chrome 插件开发也是看的这个作者的入门教程，很赞。

## package.json

我这边不多展开讲如何开发 vscode 插件，还是以实现功能为主，首先我们需要一个 package.json，对比我们常接触的会多一些额外的字段：

```
// package.json
{
  // 插件名称
  "name": "image-uploader-plugin",
  // 发布到插件商店之后的名称
  "displayName": "图片上传工具",
  // 简介
  "description": "image uploader plugin for VSCode",
  // 一些关键词
  "keywords": [],
  // 作者
  "publisher": "July",
  // 入口文件
  "main": "./dist/extension.js",
}
```

其中最重要的当然是 `main` 字段啦，这个字段是告诉 vscode 从哪里开始读取插件代码，可以发现我定义的入口有关键词 `dist`。上面说明其实一段 js 代码就可以作为插件，而很明显简单我是没有 ts 就会死，所以会用 tsc 简单编译一波。官方的脚手架默认使用 webpack 作为打包工具兼顾热更新调试很方便，不过离谱的是我打算用的七牛云的官方 SDK 没法在 webpack5 里面给我乖乖的跑，所以不得不放弃。所幸我们要做的东西功能并不复杂，tsc 足够了。

## 总体结构

一波操作之后，总体结构如下：

```
|- .vscode
  |- launch.json      # 运行脚本
|- assets             # 静态资源
|- dist
  |- extension.js     # 插件入口文件
|- src
  |- extension.ts     # 源码入口
|- package.json
|- tsconfig.json
```

需要对 `tsconfig.json` 填充一点编译选项（每次配这个最头痛）

```
// tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "lib": [
      "ES2020"
    ],
    "rootDir": "src",
    "outDir": "dist",
    "strict": true
  }
}
```

做为编译配置，我们可以为 package.json 加上 script

```
// package.json
"scripts": {
  "vscode:prepublish": "npm run compile",
  "compile": "tsc -p ./",
  "watch": "tsc -watch -p ./"
},
```

vscode 右侧有个“运行与调试”功能，按快捷键 F5 就能运行我们制定的脚本，我们在开发插件时一般会用他作为快捷调试按键，为此我们需要在 .vscode 文件夹下新建文件 `launch.json`

```
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Extension",
      "type": "extensionHost",
      "request": "launch",
      "runtimeExecutable": "${execPath}",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
    },
  ]
}
```

结合 `tsc -watch` 理论上可以做到比较好的“热更新”操作，不过实际操作的时候遇到了点问题，所以这里先不多说，之后有时间会做更新。

# 核心原理

按照设想，首先我们本地有张截图需要需要被插入到 markdown 中，因此我们会先在 Finder/资源管理器中先 ctrl + c 复制这个图片，我们假定它叫 `/Users/July/Download/img1.png`。

然后按照操作习惯我们切回 vscode 正在编写的 markdown 中按下 `ctrl + v`，此时我们需要读取剪切板中的图片内容，将其上传到 SSO，并且备份在本地指定路径，并且得到一个新的 cdn 地址，如

```
http://images.cdn.cn/images/hashname.png
```

然后将其格式化为 markdown 语法，插入到编辑器光标处。
```
![](http://images.cdn.cn/images/hashname.png)
```

这一切对于使用者来说是无感知的，似乎就是将一张图片“copy”到了 markdown 中。

## 触发时机

现在需要契合 vscode 的机制，我们可以创建一个新的快捷键来代替 `ctrl + v`，仅在需要拷贝图片的使用它，在这之前我们需要先创立一个新的命令，然后将我们设想的快捷键去关联这个新命令，这一切都在 package.json 中完成：

```
// package.json
{
  "contributes": {
    "commands": [{
      "command": "image-uploader.paste",
      "title": "Paste Image"
    }],
    "keybindings":[{
      "command": "image-uploader.paste",
      "key": "alt+shift+v",
      "mac": "alt+shift+v",
      "when": "editorLangId == markdown"
    }],
    "menus": {
      "editor/context": [
        {
          "command": "image-uploader.paste",
          "when": "editorLangId == markdown"
        }
      ]
    }
  }
}
```

可以看到除了快捷键，我还在右键菜单增加了一个选项，满足各种习惯的使用者。为了排除干扰，快捷键和右键菜单仅会在 vscode 活跃的窗口为 markdown 文件时才会生效。

# 核心代码

为了方便后续增加功能，我们可以把我们已经设计好的“拷贝”功能写的更聚合一点，因此我们在源码文件夹里增加两个文件。

```
|- src
  |- features       # 新增，承载核心功能
    |- paste.ts
  |- lib            # 新增，工具类
    |- utils.ts
  |- extension.ts
```

因此，我们在 extension.ts 中，只需要在每次调用命令时初始化 paste.ts 的实例，不关心他的功能，看起来代码可以清晰一点。

```
// src/extension.ts
import PasteAction from './features/paste'

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('image-uploader.paste', async () => {
    new PasteAction()
  })
  context.subscriptions.push(disposable)
}
```

## 剪切板内容

获取系统剪切板内容核心难点是「跨平台」问题，这点光靠 js 是搞不定的。所以我们需要借助 node 去运行不同平台特有的环境脚本来获取系统剪切板内容。

由于目前仅在 mbp 上使用，所以非常鸡贼的只讨论 macOS 的 case。

在 macOS 上我们可以借助「applescript」脚本实现我们想要的功能。[applescript](https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptLangGuide/introduction/ASLR_intro.html) 据说非常容易上手，然后我非常折磨的才写完了大概内容

比较核心的代码就两行，该代码会返回被复制的图片在磁盘中的路径
```
try
    (item 1 of (clipboard info for «class furl»))
  return POSIX path of (the clipboard as «class furl»)
on error
  ...
end try
```

然后我们还需要处理流文件的情况，比如是通过软件的截图而到剪切板的内容，那么它可能不存在磁盘中或者不是确定的格式。因此面对这种情况我们需要把它写入临时文件夹中再返回路径。

```
set imagePath to (item 1 of argv)
set theType to getType()

if theType is not missing value then		
  set myFile to (open for access imagePath with write permission)
  set eof myFile to 0
  write (the clipboard as (first item of theType)) to myFile
  close access myFile
  return (POSIX path of imagePath)
else
  return "no image"
end if
```

最后我们通过 spawn 执行脚本，顺便传入自定义的临时文件夹路径。

```
const ascript = spawn('osascript', [scriptPath, imagePath])
ascript.on('error', (e: any) => {
  vscode.window.showErrorMessage(e)
})
ascript.stdout.on('data', (data) => {
  resolve(data.toString().trim().split('\n'))
})
```

说句题外话，其实 github 上有很多库具有获取剪切板内容的能力，但对于「图片」来说能做到的仅仅是获得被 copy 的图片名甚至没有详细的文件 path，所以对我们来说是不可用的。

## 配置常量

对于插件来说说不得需要给用户一些自定义常量的空间，比如类似 cdn 的 host 等。其实这本身是一件相对简单的事情，站在插件开发者的角度上来说自然而然会想到把配置文件放到 .vscode 的 setting.json 中。

但对于工程项目而言这可能是存在问题的。比如 setting.json 还包含一些需要被共享（上传到 git）的内容。而 cdn 的 host、密钥等显然不适合上传到仓库尤其是开源仓库，而且面对不同的环境可能需要使用不同的变量所以使用`.env.dev`、`.env.prd`显然更加合适。

## 图片上传

从设计上来讲上传分为两步走，一步是复制文件到本地，一步是上传 SSO。从代码上来说都不难，贴一些核心代码

```
// class Local
const rootPath = utils.getCurrentRoot()
const localUrl = path.resolve(rootPath, this.config.localPath, image.hashName)
const localFolder = path.dirname(localUrl)
if (!fs.existsSync(localFolder)) {
  fs.mkdirSync(localFolder)
}
fs.copyFileSync(image.path, localUrl)

// class QiniuSSo
const mac = new qiniu.auth.digest.Mac(this.config.qiniuAccessKey, this.config.qiniuSecretKey)
const key = this.config.qiniuScope + image.hashName
const putPolicy = new qiniu.rs.PutPolicy({
  scope: this.config.qiniuBucket + ":" + key
})
const config: qiniu.conf.ConfigOptions = new qiniu.conf.Config
config.zone = zone
const formUploader = new qiniu.form_up.FormUploader(config)
formUploader.putFile(token, key, image.path, new qiniu.form_up.PutExtra(), (err, body, info) => {
  if (err) {
    reject(err)
  }
  if (info.statusCode === 200) {
    resolve({
      ...image,
      ssoUrl: utils.urlJoin(this.config.host, key)
    })
  } else {
    reject(new Error(body.error))
  }
})
```

# 总结

总的来说对于有 js 基础的开发来说写 vscode 插件并不难，堆代码就完事了。

也会又些比较坑的点，比如使用 tsc 编译 ts 并不会包含 node_modules 的代码，所以需要在 `.vscodeignore` 文件中去掉 node_modules 的忽略，不过因此打出来的包巨大（还是推荐使用打包工具）。

再比如说最后我又一次放弃了七牛云，国内的云约束还是太大。目前就还是打包丢在 vercel 上，不过说实话 vercel cdn 的速度确实不敢恭维，即使在网络质量比较好的情况下也会出现短暂的 css 未加载完成导致的样式错乱问题。
