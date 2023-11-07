---
title: TypeScript 类型谓语
sub: 如何构造具有断言能力的函数
date: Tue Oct 12 2021 17:23:00 GMT+0800 (中国标准时间)
tags: Geek,TypeScript
---

ts 或许没有我们想象中的那么聪明。

# 背景

被一个问题困扰已久，看下面一段 ts 代码
```ts
const tags = []
if (flagA) {
  tags.push({ text: 'textA', color: 'colorA' })
}
```
这段代码很好理解，我们根据 flagA 真假来填充 tags 数组的内容。

但如果有很多条件判断呢？比如：

```ts
const tags = []
if (flagA) {
  tags.push({ text: 'textA', color: 'colorA' })
}
if (flagB) {
  tags.push({ text: 'textB', color: 'colorB' })
}
if (flagC) {
  tags.push({ text: 'textC', color: 'colorC' })
}
if (flagD) {
  tags.push({ text: 'textD', color: 'colorD' })
}
```

这段代码是不是看着头开始痛起来了，所以我们通常会这么写

```ts
// flagA?: boolean
type Tag = {
  text: string
  color: string
}
const tags = [
  flagA && { text: "textA", color: "colorA" },
  flagB && { text: "textB", color: "colorB" }
].filter(Boolean)
```

其实实质是利用 && 运算符懒惰特性，然后借助 `filter` 函数过滤掉无效值。

# 类型丢失

好了进入正题，问题来了上面这种写法得到的 `tags` 的类型是什么呢？从 js 逻辑层面考虑 `tags` 的类型应该为 `Tag[]`，可是遗憾的是 ts 并没有这样判断

![图片](/images/769397a9bebed0ff52be7b0da8502cc557c7bc2061e7377aefce4ecdbc82d797.png)

一开始我也是百思不解，理论上经过 `filter` 去掉 `false` 和 `undefined` 的情况，那不是只剩下 `Tag` 类型了么？为什么两种假值还存在类型中呢？`filter` 是 `Array` 原型上的函数，所以我们可以研究一下对应的类型文件

![图片](/images/2e96bc4cde032901251a5a2d80165f5470273c51900b2c139f521387060c0992.png)

可以看到接口 `Array` 存在范型 `T`，也就是说我们在 `new Array` 时就会确定 `T` 的类型，我们上述代码中的 `[...]` 其实也是 `new Array` 的一种语法糖

```ts
const tags = new Array([
  flagA && { text: "textA", color: "colorA" },
  flagB && { text: "textB", color: "colorB" }
]).filter(Boolean)
```

也就是说我们可以确定此时的 `T = false | undefined | Tag`

我们再找到 `filter` 函数的类型

![图片](/images/6e5bfc94f67896e31768b3d49e08d15cd4daa51913de86f44affc6d4e20ca641.png)

可以看到 `filter` 有两种形式，如果我们主动声明范型 S，那么最终输出结果就是 `S[]`，如果没有那么 `filter` 就只会返回最初实例化 `Array` 时记录的类型。换句话说 `filter` 返回的类型和传入的回调函数是什么没有半毛线关系，因为 `filter` 无法得知回调函数 predicate 内部到底过滤了啥、留下了啥、返回了啥。

**filter 不会根据 predicate 创造类型，filter 只是类型的搬运工！**

那么就没救了吗？不，我们要充分相信 ts 的设计，再回过头来看第一种声明，我们尝试在开头声明范型

![图片](/images/edc0e5d73aee8eebacfb52ae452b4c5be6066062faa70c35c792ed17fd623f43.png)

似乎返回类型正确了，但我们发现 `Boolean` 函数下出现了刺眼的红色波浪线，铺垫了这么多终于要讲到本文的关键点。

# 类型谓语 is

我们仔细观察一下 `filter` 的第一种声明中范型 `S` 不仅仅出现在 `<S extends T>` 中，似乎还出现在 predicate 中，`(value: T) => value is S`，这是个啥？从来没见过，查阅一下[官方文档](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)的 `is` 关键词，它对 `is` 的使用场景做了描述：

> We’ve worked with existing JavaScript constructs to handle narrowing so far, however sometimes you want more direct control over how types change throughout your code.
>
> To define a user-defined type guard, we simply need to define a function whose return type is a type predicate

看完说明和用例我就恍然大悟了，其实如果经常写库，`is` 是一个非常常见的关键词，我们可以看一下 `lodash` 的声明文件，比如比较常用的 `isNil`，我们可以认为这是一种断言函数

![图片](/images/129748804444323eded5b86f5509c8ebccf16141d43361535f802f8a393384a8.png)

所以借助 `is` 我们可以非常优雅的完成类型范围缩小。

```ts
type Tag = {
  text: string
  color: string
}
const tags = [
  flagA && { text: "textA", color: "colorA" },
  flagB && { text: "textB", color: "colorB" }
].filter((i): i is Tag => Boolean(i))
```

这段代码得到的变量 tags 的类型就是唯一确定的 `Tag[]`

回过头来，我们再思考一下在 filter 中如果我们使用了范型 S，就必须有对应的断言函数呢？其实这就是 ts 的严谨性，我们可以发现范型 S，并不能随便指定它存在两个约束条件：

* S 必须继承自 T

* S 必须是 predicate 断言函数为真时的断言类型

仔细想一想如果失去了其中一种约束，这时是不是就等于

```ts
// filter<S>(): S[]
const tags = [...].filter<any>(callback)
```

然后我们再换一种写法

```ts
const tags = [...].filter(callback) as any[]
```

那么 ts 类型约束就会形同虚设。

值得深思的是，ts 被称为 js 的超集。而事实上 ts 仅仅存活在 ts server 或者 tsc 编译时中，所谓的类型约束。当类型与 js 逻辑产生耦合的时候就可能需要使用强制声明来弥补 ts 的不足。

# Based Type Guards: this

我们已经知道了 `is` 具有断言的作用，当然这是针对使用函数判别某个变量时的场景。那么如果是在 `class` 内呢？先举个场景例子

```ts
type Form = AForm | BForm
class Common {
  form: Form
  constructor(f: Form) {
    this.form = f
  }
}
class AForm {
  common: Common
  type: string = 'A'
  constructor() {
    this.common = new Common(this)
  }
  echoA() {}
}
class BForm {
  common: Common
  type: string = 'B'
  constructor() {
    this.common = new Common(this)
  }
  echoB() {}
}
```

我们在不同的业务场景存在不同的表单 A 和表单 B，但作为表单总存在公共的内容，我们使用 Common 数据结构来表达它，当我们需要在一个公共组件中使用实例 form 时，我们需要判断表单是 A 还是 B 来承接不同内容。

例如我们使用一个叫 `echoCommonContext(common: Common)` 显示公共部分，以及两种表单的特殊部分。理所应当的，我们会使用 `common.form.type === 'A'` 来判别传入的 common 的父类到底是 A 还是 B 来决定调用 `echoA()` 还是 `echoB()`，从 js 的角度一切都没有问题，可是遗憾的是 ts 并不能从 `===` 推断出 `common.form` 的类型，因为在他看来这是完全不相关的逻辑：

![图片](/images/24543a7314b5271812bfcdd215ef6032e952af3370ae6b75ab9f9fafaf8adc9d.png)

这种场景和我上述讲的 `filter` 有些相似，但并不是完全没有解决办法，我们可以借助 `enum` 来告诉 ts `common.form.type` 不是仅仅是一个字符串，他还有决定上层类型的作用

```ts
enum FormType {
  A = 'A',
  B = 'B',
}
class AForm {
  type: FormType.A = FormType.A
}
class BForm {
  type: FormType.B = FormType.B
}
function echoCommonContext(common: Common) {
  if (common.form.type === FormType.A) {
    common.form.echoA()
  } else {
    common.form.echoB()
  }
}
```

这会使得 aForm.type 被永久的打上 FormType.A 的烙印，他不能说别的任何值，哪怕是看起来完全相同的值字符串 `"A"`。我们还有更优雅的解决方案，我们可以写一个函数专门用于判断 AForm 类型尝试借助上文讲的 `is` 去断言类型

```ts
const isAForm = (form: Form): form is AForm => form.type === 'A'
```

这种方式非常完美的解决了类型断言问题，还不需要使用枚举这种限制巨大的类型

![图片](/images/519cf1acf9a42670a6daf004443d6db49a770b582b6fdad155f6ec7ecbb3da75.png)

本着程序员的直觉，我们可以发现 isAForm 可能在未来不仅仅被使用在一个地方，他完全有资格成为 Common 的一个属性，所以我们把他放到 Common 内部。并且放到内部还有个好处，`isAForm` 不再需要额外的传参，他完全可以访问到实例内部 `form` 的地址

![图片](/images/9a530523cc9dd17399e7b28561a9fc9d878097e10a0ce23833088d3292245fad.png)

然而问题又来了， `is` 是对传入参数的类型断言，现在我们取消了传参该如何对 `form` 进行类型定义呢？

于是乎 `this is` 闪亮登场，ts 官方的文档很友善的把 `this is` 的[文档链接](https://www.typescriptlang.org/docs/handbook/2/classes.html#this-based-type-guards)贴在 `is` 文档下方，没错哦，他料到了你用了 `is` 这种骚操作之后肯定会遇到这个问题。

> You can use this is Type in the return position for methods in classes and interfaces. When mixed with a type narrowing (e.g. if statements) the type of the target object would be narrowed to the specified Type.

官方的解释很直白，这玩意是专为 `class` 准备的，有了他我们就可以这样写

```ts
class Common {
  form: Form
  constructor(f: Form) {
    this.form = f
  }
  isAForm(): this is Common & { form: AForm } {
    return this.form.type === 'A'
  }
}
```

值得一提的是，即使使用这种方式我们也不能改变最初被赋值声明类型的子属性

![图片](/images/71a7f456d7f56119a77619d56c5a03a855ab7b2218eb11a702a5dfc0ff22fabd.png)

可以看到在 `common.isAForm()` 之前，我们如果已经赋值 `const { form } = common`，那么这个 `form` 仍然无法被 ts 确定类型。
