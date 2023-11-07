---
title: 借助 React State Model 理解 React hook 下的状态管理
date: Fri Sep 23 2022 16:13:23 GMT+0800 (中国标准时间)
tags: Geek,React
---

还记得我读大学那段时间学 C、Java 入门的标准就是懂得面向对象的编程思想。在前端方面初次接触 Vue、React 之后最大的感触也就是所谓的“对象”思想，尤其是 React 更纯粹一些，在编写组件是要求开发者高度抽象概括组件的特点，恐怕这是对于常年写 JQuery 的新手前端开发最不能适应的一点。

# 函数式编程与状态管理的碎碎念

然后的然后，React 又回归了 Function 的怀抱。有人说前端就善于把东西整来整去把事情搞复杂来宣扬 js 也是一种有深度的编程语言。我觉得恰恰是因为 js 擅长“整活”才让这门语言真正的实现弯道超车，迈入货真价实的编程语言门槛，否则它可能还停留在辅助 web 页面渲染的脚本这种状态。

React Hook 将 Function 和 State 分离，我认为这是一种跨时代的思想。对于会思考的前端开发来说，他们总是在尝试把 Render View 和 Business Code 分离。然后呢又会发现前端这玩意就是没办法想别的编程场景一样把各个领域划分清楚，总的来说就是在视图、交互、业务逻辑之间反复挣扎，代码写的如何也就是哪一层比较厚哪一层比较薄的问题，或者干脆糅在一起一团糟。当然这涉及到 DDD 的说法，扯远了。

这段时间的学习与思考下来，大致理出来的想法：

- 业务模型描述是产品模型描述的抽象化、代码化。
- 交互模型是对组件形态的概括。
- 业务数据驱动组件实现最终视图的呈现

当然这个课题对于我们本文标题的立意而言有些太大了（也许以后我会单独再聊聊），本文仅从一个小小的切入点聊聊 React hook 的状态管理思想。

承载状态的 hook 也承载了逻辑，阅读了 TT Web 的源码，其中有一条原则我深以为然：复杂独立的逻辑总是封装成 hook。当你关心视图时你只能看到视图，至于调用的方法仅需要知道它是做什么的；当你关心逻辑时也会免去看大段视图交互的逻辑。

# State

碎碎念了一大堆，我们来举个例子吧。我们实现一个计数器组件，并且由父组件做状态管理

![图片](/images/30d57a2fbd9653ccba7707c14375a225b08b9cc6f2aaf2d9d957b658694acd5d.png)

看一下代码实现

```tsx
// 父组件
export const App = () => {
  const [count, setCount] = useState(0)
  const add = useCallback(
    (next: number) => setCount(prev => prev + next),
    [count],
  )
  const minus = useCallback(
    (next: number) => setCount(prev => prev - next),
    [count],
  )
  return (
    <Space direction="vertical">
      counter1: <Counter count={count} add={add} minus={minus} />
      counter2: <Counter count={count} add={add} minus={minus} />
    </Space>
  )
}

// 抽象的计数器组件
const Counter: React.FC<{
  count: number
  add: (count: number) => void
  minus: (count: number) => void
}> = props => {
  const { count, add, minus } = props
  return (
    <Space>
      <Tag>{count}</Tag>
      <Button onClick={() => add(1)}>+ 1</Button>
      <Button onClick={() => minus(1)}>- 1</Button>
    </Space>
  )
}
```

# Context

很显然 Counter 已经抽象完成了，但对于父元素而言还存在一些问题，在真实的生产上视图结构往往十分复杂存在多层嵌套，靠 props 层层传入显然不靠谱。

这是个老生常谈的问题啦，解决方案就是把 State 放到更上层或者干脆放到顶层，这就衍生了许多状态管理工具 Redux、Mobx 等等殊途同归。

那么我们是不是可以更简单一些，仅仅使用 `useContext` 来实现它？首先我们把「逻辑」从「视图」中拿出来封装个单独的 hook

```ts
const useCount = () => {
  const [count, setCount] = useState(0)
  const add = useCallback(
    (next: number) => setCount(prev => prev + next),
    [count],
  )
  const minus = useCallback(
    (next: number) => setCount(prev => prev - next),
    [count],
  )
  return { count, add, minus }
}
```

利用 `createContext` 圈定一片内存，把我们抽象的东西塞进去方便需要的组件使用

```tsx
const ops = (count: number) => {}
const CountContext = createContext({ count: 0, add: ops, minus: ops})

export const App = () => {
  const {count, add, minus } = useCount()
  return (
    <CountContext.Provider value={{ count, add, minus }}>
      <Space direction="vertical">
        counter1: <Counter />
        counter2: <Counter />
      </Space>
    </CountContext.Provider>
  )
}

const Counter: React.FC = () => {
  const { count, add, minus } = useContext(CountContext)
  return (
    <Space>
      <Tag>{count}</Tag>
      <Button onClick={() => add(1)}>+ 1</Button>
      <Button onClick={() => minus(1)}>- 1</Button>
    </Space>
  )
}
```

写完这段代码，是不是豁然发现我们在逐步沿用上述的思想，将抽象视图并由业务数据驱动，做到业务逻辑和视图分离。Context 本身不关心 hook 的逻辑，所以 hook 是完全 free 的，同时 hook 把 State 和 Action 返回给会关心它的组件调用，那么可以认为我们完成了一定程度的抽象。

而且这么做的好处不止如此，我们的 Counter 作为数据消费端可以千奇百怪，甚至可以跨端，但我们的数据模型是独一份的、确定的。

当然我们还可以认为 `App` 组件其实不关心 `useCount` 的逻辑，再做抽象

```tsx
const CountContextRender: React.FC<PropsWithChildren> = ({ children }) => {
  const { count, add, minus } = useCount()
  return (
    <CountContext.Provider value={{ count, add, minus }}>
      {children}
    </CountContext.Provider>
  )
}

export const App = () => {
  return (
    <CountContextRender>
      <Space direction="vertical">
        counter1: <Counter />
        counter2: <Counter />
      </Space>
    </CountContextRender>
  )
}
```

# createModel

进一步的，我们可以发现 Context 可以承载各种自定义 hook 逻辑，我们可以尝试把这层逻辑做抽象，从而仅专注于写逻辑本身而不再关注它是怎么存储和调用的。

```tsx
const EMPTY = Symbol()
const createModel = <Value, InitParams = void>(
  useHook: (initParams?: InitParams) => Value,
) => {
  const HookContext = React.createContext<Value | typeof EMPTY>(EMPTY)
  const Provider: React.FC<PropsWithChildren<{ initParams?: InitParams }>> = ({
    initParams,
    children,
  }) => {
    const value = useHook(initParams)
    return <HookContext.Provider value={value}>{children}</HookContext.Provider>
  }
  const useContext = () => {
    const value = React.useContext(HookContext)
    if (value === EMPTY) {
      throw new Error('Component must be wrapped with <Provider>')
    }
    return value
  }

  return {
    Provider,
    useContext,
  }
}
```

有了它，我们要完成一个 Counter 或许就不需要上述如此复杂的心路历程了：

```tsx
const useCount = () => {
  const [count, setCount] = useState(0)
  const add = useCallback(
    (next: number) => setCount(prev => prev + next),
    [count],
  )
  const minus = useCallback(
    (next: number) => setCount(prev => prev - next),
    [count],
  )
  return { count, add, minus }
}
const { Provider, useContext } =
  createModel<ReturnType<typeof useCount>>(useCount)
```

第一次看到这个封装是在我同事的一个通用 hooks 库里，进一步了解之后发现他的想法也来自于开源社区 [jamiebuilds/unstated-next](https://github.com/jamiebuilds/unstated-next)，惊异于其简单的同时也让我有了不少感悟。