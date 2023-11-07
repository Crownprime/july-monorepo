---
title: React-Spring 编程体验
date: Tue Dec 07 2021 19:46:00 GMT+0800 (中国标准时间)
tags: Geek,React,React-Spring
---
说到 react 的动画库必然会提及 react-spring。顾名思义该库的动画类似弹簧形变产生的伸缩曲线，总之就是看起来非常流畅舒服啦，不过它的学习曲线也异常陡峭。

从 hooks 入手，react-spring 提供的 hooks 屈指可数：useChain、useSpring、useSprings、useTrail、useTransition，总共五个函数。但对于初学者来说看着官网好看的动画 demo 却不容易琢磨明白到底该怎么使用。

我们这次准备做一个 words-writer 的动画，这个动画可以单纯使用 css 实现 [CodePen](https://codepen.io/crownprime/details/MWoBRjj) 上就有例子，但兼容性非常的差而且有 hard code 的嫌疑几乎无法写成灵活的 react 组件。

![图片](/images/2ddf3b8dedde6d078c2b074098b7b41b43ec3c51e57a5d790035f0c9f9e75baa.gif)

但万变不离其宗，其核心原理就是利用变化的 `width` 和 `overflow: hidden` 隐藏还未被“打”出的文字，因此我们可以把骨架代码完成

```tsx
const WriteTextWrap = styled.div`
  overflow: hidden;
  white-space: nowrap;
  width: 0;
`
const WriteText = () => {
  return <WriteTextWrap>Hello, World!</WriteTextWrap>
}
```

# CSS 单位之 ch

在上面的代码之上，我们希望 width 可以每次增加「一个字母宽度」来实现单词中的字母是逐个被打出来的效果，那么问题来了一个字母宽度是多少宽度呢？这里我们引入一个新的单位「ch」，[说明文档](https://www.w3.org/TR/css3-values/#ch)是这样解释这个单位的

> Equal to the used advance measure of the "0" (ZERO, U+0030) glyph found in the font used to render it.

当我们可以保证每个字符都与「0」等宽时，我们就可以让 width 循环增加 1ch 来解决问题。所以我们需要使用等宽字体，比如 `fontFamily: monospace`

# useSpring

useSpring 的[使用方法](https://react-spring.io/hooks/use-spring)这里不多赘述，我们需要确定的是我们可以指定前数值「from」和后数值「to」，由 useSpring 可以创建一组从「from」过渡到「to」的离散的数值，当这些数值足够密集且在较短的时间内变化就可以得到连续的动画效果了。这其实和电影、动画的原理完全相同。

```tsx
const WriteText = () => {
  const TEXT = 'Hello, World!'
  const [style, api] = useSpring(() => ({
    width: 0,
  }))
  useEffect(() => {
    api.start({ width: TEXT.length })
  }, [])
  return (
    <animated.div
      style={{ width: style.width.to(w => `${w}ch`) }}
    >
      {TEXT}
    </animated.div>
  )
}
```

为了方便观察我加上了红色的背景色，可以发现整个受控的 DOM 的 width 从肉眼识别上是连续递增的且速度递减这就是上述的「弹簧形变」的特性。

![图片](/images/92038d3ae316f9daf0d8c7546be3bd174ba053e66b07f8bb3cd7e2e61d126d48.gif)

很显然这样并没有给人一种“打字”感，我们需要对这个过程做些前置知识准备和分析。

# 关键帧

有幸在高中时期学过会声会影有些基础的剪辑知识。

> 关键帧指的是角色或者物体运动变化中关键动作所处的那一帧，相当于二维动画中的原画。

百度百科的解释还是比较抽象，我们结合下图做理解。当某段动画的变化具有连续且可预测性，那我们只需要指定首位（或者几个中间关键）状态剩下的交给软件去做过渡，我们指定的状态就被称为关键帧。

![图片](/images/f161f4a73910f6a10a0ed5ef9219b45087593224230c9fcbed3b318c47989ea8.png)

看到「Keyframe」是不是觉得很熟悉？当我们使用 css 的 `animation` 属性时不可避免的会使用 `@keyframes` 属性去指定元素的某些变化状态，这个也就是关键帧。

![图片](/images/d1c76effa3f726b1741057116b01d60ed15f24c7a0082c5a81c2ee6d052dee70.png)

浏览器根据这些被确定的帧可以“推测”出中间的变化内容做离散切片渲染

## 模拟 writer 的帧

如果我们能编排出打印一个字母的动作，就能类推出任何英文或半角字符串。思考一下如何才能给人一种打字的感觉：

1. 按下键盘按键的同时字母已经出现在屏幕上，几乎没有延时
2. 手指移动到下一个按键上重复动作1，时间间隔取决于键盘打字熟练度

假定我们的 writer 是一个打字没那么熟练的选手，它打印一个字母所需时间为 t，将 t 按照上述步骤分解为 t1 = a、t2 = t - a

![图片](/images/11b73d06c44042d9a0177641ad8ed4744d4f39496b6da9d6a29bc223cb5a009b.png)

系数 a 越小，说明光标停顿的时间越长，说明 writer 是一个越加不熟练的打字员。无关其他我们可以先得到一些代码思路：

```tsx
// write word 动作在一帧中所占比例（剩余时间即为停顿时间）
const WRITE_TIMING = 0.1
// 根据帧头、帧尾，得到本帧 write action 完成的时间
const getWriteTime = (prev: number, next: number) => {
  return prev + (next - prev) * WRITE_TIMING
}
```

一段动画的编排其实就是对连续的时间轴上的元素属性的安排，因此我们对其中某一帧内部进行编排时我们需要知道该帧在整个时间轴上的位置，所以 `getWriteTime` 方法需要接受 prev 和 next 两个参数。

# 时间轴

我们把这段动画的持续时间定义为时间轴，而 useSpring 创建的离散切片非常密集完全可以看成连续的轴。不过为了保证切片等距我们还需要手动设定动画的 duration。

![图片](/images/474de86db80bf4e0fac08e98800e84f11fe29b856d4151ffcc84464d19a6c3f0.png)

然后我们需要把他均匀的切分，每一份就是一帧。为了简化逻辑我们不妨设定打印一个字母为一帧，而帧落实到元素物理长度的转化需要借助 [Interpolations](https://react-spring.io/common/interpolation) 特性，官方文档没有提供明确的 demo，不过两行 tips 已经足够解决我们的问题。

![图片](/images/d9a628bf7a6a8f0b8ade2bd42b647cae3f9adf39058a12686fa88dd8c1b2b854.png)

然后我们把思路转化为代码，首先我们要实现时间轴中插入关键帧的方法

```tsx
// 帧长度
const FRAME_LEN = 1
// 元素宽度长度
const FRAME_ECHO_LEN = 1
const getWriteTimeLine = (prev: number, next: number, last = 0) => {
  const range: number[] = []
  const echo: number[] = []
  let nLast = last
  for (let k = prev; k < next; k++) {
    range.push(k, getWriteTime(k, k + FRAME_LEN))
    echo.push(nLast, nLast = nLast + FRAME_ECHO_LEN)
  }
  return {
    range,
    echo,
    last: nLast,
  }
}
```

需要注意的是，由于我们这里恰好 1 帧增加 1ch 所以容易把 prev 当作 echo 轴的初始值。所以在入参中我们还需要加入 last 作为元素轴的初始值，同时需要在最后返回以便在加工下一段时间轴时定位到元素当前形态。

```tsx
const t = getWriteTimeLine(0, TEXT.length)
const range = [...t.range, TEXT.length]
const output = [...t.echo, TEXT.length]
```

于是我们可以根据定义的 TEXT 长度来快速得到时间轴和对应的元素轴，然后我们在 style 再做一层映射

```tsx
return (
  <animated.div
    style={{ width: style.width.to({ range, output }).to(w => `${w}ch`) }}
  >
    {TEXT}
  </animated.div>
)
```

观察一下这一通操作的成果，是不是瞬间打字感就来了。

![图片](/images/86af07a9805f5d1c130c100dc30aaf3e2bc40ead376ab8594a6227bfbdefcbc9.gif)

## 时间轴与物料轴分离

其实最初代码写到这里的时候我的思路还没有特别清晰，我们还需要进一步研究。在上述代码中我们在 `getWriteTimeLine` 函数中返回了两个数组：range 和 echo。range 的定位非常清晰就是插入了关键帧的时间轴，它是离散的、每帧间隔均匀的、递增的数组。

那么 echo 呢？它在初步诞生时有着和 range 一样的特质。但我们得明白时间是永远向前的但物质的心态却不一定，所以我称之为物料轴。

我们尝试实现删除字母的功能，可以预料的是 getWriteTimeLine 的接口定义需要新增字段，同时需要在构建物料轴的位置区别模式。

```tsx
type GetWriteTimeLine = (prev: number, next: number, mode: 'w' | 'd', last: number) => {
  range: number[],
  echo: number[],
  last: number,
}

echo.push(
  nLast,
  (nLast = mode === 'w' ? nLast + FRAME_ECHO_LEN : nLast - FRAME_ECHO_LEN),
)
```

# 封装组件

基本概念和方法已经具备，我们开始着手把它封装成通用组件。

该组件接收两个字符串，首先打印出第一个字符串然后逐渐删除 diff 的部分，最后打印出后续内容。

```tsx
type IWriteText = React.FC<{ prime: string; final: string }>
```

## 字符串 diff

首先我们还需要一个分析 prime 和 final 字符串的 diff 方法，需要注意我们需要后续构建时间轴的依赖来设计返回值

```tsx
const diff = (words1: string, words2 = '') => {
  const arr1 = words1.split('')
  const arr2 = words2.split('')
  const minLen = Math.min(arr1.length, arr2.length)
  let i = 0
  while (i < minLen) {
    if (arr1[i] !== arr2[i]) { break }
    i++
  }
  return {
    // 第一次打印结束所需帧数
    start: arr1.length,
    // 删除 diff 之后总计帧数
    del: arr1.length * 2 - i,
    // everything finished 总计帧数
    add: arr2.length + arr1.length * 2 - i * 2,
  }
}
```

## 构建时间轴

根据 diff 函数我们得到了几个关键时间点，借助它们我们可以构建出时间轴

```tsx
const diffs = diff(prime, final)
const t1 = getWriteTimeLine(0, diffs.start)
const t2 = getWriteTimeLine(diffs.start, diffs.del, 'd', t1.last)
const t3 = getWriteTimeLine(diffs.del, diffs.add, 'w', t2.last)

const range = [...t1.range, ...t2.range, ...t3.range, diffs.add]
const output = [...t1.echo, ...t2.echo, ...t3.echo, t3.last]
```

## 回显内容变更

动画的对象为元素的 width，所以对于元素的 text 我们还需要通过额外的手段去控制。其中的关键点是我们需要得知 text 从 prime 切换到 final 的时机，这里我们借助 react-spring [events](https://react-spring.io/common/props#events) 暴露出来的 onChange 钩子。

```tsx
const [words, setWords] = useState(prime)
const [style, api] = useSpring(() => ({
  ......
  onChange({ value }) {
    if (Math.floor(value.width) === diffs.del) {
      setWords(final)
    }
  },
}))
return (
  <animated.div
   style={{ width: style.width.to({ range, output }).to(w => `${w}ch`) }}
  >
    {words}
  </animated.div>
)
```

然后我们再看一波 storybook，发现一切都遵从我们的导演非常的 nice！

![图片](/images/2115943cfdcf1798d9c312463c42517758d1cce48c665d3be69fdbde479993d0.gif)

# 组件进阶

其实现有的组件自由度还是不够大而且代码不够优雅，尤其是构建时间轴时写了很多 t1、t2、t3 的中间变量。另一方面组件表现形式也过于生硬如果在一些地方做适当的「sleep」似乎更符合实际。

## 时间轴 sleep

我们为 Mode 增加第三个种类用于模拟“停顿感”，要模拟这种感觉非常简单只需要静止元素变化并让时间轴持续。

```tsx
type Mode = 'w' | 'd' | 's'
// 对物料轴的变化做一个简单的抽象
const getLast = (i: number, mode: Mode) => {
  switch (mode) {
    case 'w':
      return i + FRAME_ECHO_LEN
    case 'd':
      return i - FRAME_ECHO_LEN
    case 's':
      return i
  }
}
```

## 时间轴迭代器

我们希望可以随意设置每一段动画演出的模式和时长，但我们不想关心如何计算 prev、next、last 的数值。比如我们需要在已有的步骤里插入几段 sleep 动画，我们必须被迫重新计算 diffs 对象中的内容。

![图片](/images/e7cbe9e5dc242e23eb3ff0161f5de317bf5cdb53dbe8ee041519a414aa2f4a26.png)

而且其实 diffs 的内容并没有明确的定义很容易出现计算错误的情况。

![图片](/images/e9e539b4df053f3f530cd1dcebc0309f9eb029acfc54ed5edfac75aac79569c4.png)

所以我们需要设计一种迭代器接收我们所导演的动画片段返回最终的时间轴。

乍听会觉得比较抽象（迭代本身就是比较抽象的概念），我们不妨从需求入手。我们导演一段动画的输出和输入是什么：

* 输入：帧头
* 输出：帧尾、模式

为此我们可以定义一段动画的操作接口

```tsx
type Action = (prev: number) => { end: number; mode: Mode }
```

回想到之前的步骤，我们发现在定义 Action 的时候我们又不再关心「物料轴」的概念。因为我们对元素的属性变动又做了归纳就是我们前面提到的 Mode。不过虽然我们不关心过程中的元素变化，但我们仍然关心最后的结果，于是我们顺利定义了迭代器的接口

```tsx
type TimeGenerator = (actions: Action[]) => {
  range: number[],
  echo: number[],
  last: number,
  history: number[],
}
```

好啦一切框架定义结束，我们开始往里面填充代码，首先我们先实现迭代器。值得注意的是我们还声明了一个 history 数组用于记录时间轴转折点的变化，主要是用于结合 react-spring 的钩子方便判断动画进行到了哪个片段。

```tsx
const timeGenerator = (actions: Action[]) => {
  let prev = 0,
    step = null
  const range = [],
    echo = [],
    history = [prev]
  actions.forEach(action => {
    const { end, mode } = action(prev)
    step = getWriteTimeLine(prev, end, mode, step?.last || 0)
    range.push(...step.range)
    echo.push(...step.echo)
    history.push(end)
    prev = end
  })
  range.push(prev)
  echo.push(step.last)
  return {
    range,
    echo,
    history,
    last: prev,
  }
}
```

随之我们开始重新编排动画，动手之前我突然想到 WriteText 组件只能编排这种「写-删-写」固定模式的动画吗，可不可能将 final 参数设定为可选参数仅仅实现「写」模式呢？有了迭代器插入动画变得简单很多，我们只需要根据条件 push 一组 action 即可。

```tsx
const actions: Action[] = [
  prev => ({ end: prev + FRAME_SLEEP, mode: 's' }),
  prev => ({ end: prev + prime.length, mode: 'w' }),
]
if (final) {
  actions.push(
    ...([
      prev => ({ end: prev + FRAME_SLEEP, mode: 's' }),
      prev => ({ end: prev + del, mode: 'd' }),
      prev => ({ end: prev + FRAME_SLEEP, mode: 's' }),
      prev => ({ end: prev + add, mode: 'w' }),
      prev => ({ end: prev + FRAME_SLEEP, mode: 's' }),
    ] as Action[]),
  )
}
```

看起来是不是优雅多了。

## 动画联动之 useChain

进一步我还想到如果不仅仅只打印一段话呢，能不能实现光标换行继续打印第二段话？
当然是可以的，要实现这个功能我们可以借助 [useChain](https://react-spring.io/hooks/use-chain) 这个 hook。使用它的前提有两个：

* 得到动画元素的 ref
* 动画触发时机是自动的

这些条件都不苛刻，我们对组件做一些改造

```tsx
// 不手动触发
// useEffect(() => {
//   api.start({ width: last })
// }, [])
// 使用 from、to 的模式改为自动触发
const { width } = useSpring({
  from: { width: 0 },
  to: { width: last },
  ref: aRef
})
```

然后我们只要在使用的地方绑定一下执行顺序即可

```tsx
// write-text.stories.tsx
import { useSpringRef, useChain } from 'react-spring'

const fstRef = useSpringRef()
const secRef = useSpringRef()
useChain([fstRef, secRef])
```

## 光标

我们还需要构建一个光标组件。这个就要简单的多只要能实现持续闪烁即可

```tsx
const Cursor = () => {
  const style = useSpring({
    loop: true,
    config: { duration: 800 },
    from: { opacity: 1 },
    to: { opacity: 0 },
  })
  return <CursorWrap style={style} />
}
```

有一个小细节就是如果我们要实现光标换行效果，那么就需要在上一段动画结束前隐藏光标，所以我们还可以给 WriteText 组件提供一个可选的 prop，用于控制结束后光标的显隐。

最终形态效果：

![图片](/images/9b130bfc24e9fe10384392f7dc6fcf6a1ec5feec46fc46efc06df6ad3170c54c.gif)
