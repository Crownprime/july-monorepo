---
title: 如何编写 Overflow 组件
date: Mon Aug 22 2022 17:42:26 GMT+0800 (中国标准时间)
tags: Geek
---
Overflow 的溢出折叠属于一种很常见的特性，但如果要求用 js 去实现却又是一件头痛的事情，所以不如来封装一个通用的组件。

首先要明确的一个点是 js 实现的「溢出折叠」能力具有较大的性能开销，所以如果要用在循环渲染的地方（表格、列表）需要慎重。

# 基础骨架

本质上是一个循环渲染列表的组件，所以需要一个简单的 map；其次由于在循环中我们需要关注每一个 item 的特征（宽度、显隐），所以对于外部传入的列表最好再「包裹」一层；最后我们还需要一个 rest 作为折叠的表现形式。

```tsx
type OverflowType = {
  keys: React.Key[],
  itemRender: (key: React.Key) => React.ReactNode
  restRender: (keys: React.Key[]) => React.ReactNode
}
// Overflow 组件
<div style={{ display: "flex", flexWrap: "wrap" }} ref={ref}>
  {keys.map((i, idx) => (
    <OverflowItem key={i} itemKey={i} idx={idx}>{itemRender(i)}</OverflowItem>
  ))}
  <OverflowRest visible={omitKeys.length > 0}>{restRender(omitKeys)}</OverflowRest>
</div>
```

# 显隐方案

简单来讲我们需要对不确定宽度的 item 挨个排队，发现排不下的就要把它隐藏掉，同时在末尾插入 rest（当然同时要保证 rest 塞得下）。当container、item、rest 任意一者变化时，我们需要开始重新计算。

这里就存在现实的问题：我们需要把 item 渲染到 dom 上才能测量它的宽度，然后才可以决定隐藏多少元素，然后在重新计算时又需要用到这一点。所以我们不应当使用 display: none 或者直接在 jsx 中 if-else 掉元素，这会极大的增加开销。

如果我们不从“物理层面”去干掉元素，但我们要实现把 rest 插入到 item 队列的任意位置，也就是会涉及到 dom 元素的删除与插入，对于 react 也是极大的开销。换个思路，可以用 css 排序的方式去代替插队的动作，这里我们可以用到 css 属性 [flex-order](https://developer.mozilla.org/zh-CN/docs/Web/CSS/order) 实现。

```tsx
type OverflowCommonItemProps = PropsWithChildren<{
  visible?: boolean
  order: number
}>
// 显示隐藏通过 overflowY 来控制
const visibleStyle: React.CSSProperties = useMemo(
  () => ({
    height: visible ? undefined : 0,
    overflowY: visible ? undefined : 'hidden',
    pointerEvents: visible ? undefined : 'none',
  }),
  [visible],
)
```

由于组件的外层需要关心到 dom 的物理尺寸（主要指宽度），所以我们需要用 forwardRef 包一层：

```tsx
const OverflowCommonItem: ForwardRefRenderFunction<
  HTMLDivElement,
  OverflowCommonItemProps
> = ({ visible, order, children }, ref) => {
  return (
    <div style={{ order, ...visibleStyle }} ref={ref}>
      {children}
    </div>
  )
}
const OverflowCommonItemRef = React.forwardRef(OverflowCommonItem)
```

# 核心算法

确定了显隐的实现逻辑后，计算逻辑就变得水到渠成了。

首先我们需要定义控制显隐的 state 模型：

```tsx
type Action =
  | { type: 'SET_ITEM_WIDTH'; payload: { key: React.Key; width: number } }
  | { type: 'SET_REST_WIDTH'; payload: number }
  | { type: 'SET_DISPLAY_IDX'; payload: number }
type State = {
  itemWidths: Record<React.Key, number>
  restWidth: number
  displayIdx: number
}
```

按照上述的思路我们需要在每次相干 dom 变化时重新计算，因此我们需要借助 useLayoutEffect 这个 hook，同时把我们的 deps 罗列清楚：

```tsx
useLayoutEffect(() => {
  // 计算
}, [itemWidths, containerWidth, keys, restWidth])
```

简单的写下以下逻辑

```tsx
// 当可以排下所有 items 时，就全部显示
if (totalWidth <= containerWidth) {
  dispatch({ type: 'SET_DISPLAY_IDX', payload: keys.length - 1 })
  return
}
// 当确定无法排下时，就先为 rest 预留空间
let displayWith = restWidth
let last = -1
for (let idx = 0; idx < keys.length; idx++) {
  const key = keys[idx]
  const width = itemWidths[key] || 0
  if (displayWith + width > containerWidth) {
    break
  }
  last = idx
  displayWith += width
}
dispatch({ type: 'SET_DISPLAY_IDX', payload: last })
```

然后我们把 Item 和 Rest 的逻辑抽象出来和 state 连接。主要是实现两个功能：

* 统计元素 width
* 控制显隐

```tsx
// Item
const useOverflowItem = (key: React.Key, idx: number) => {
  const [ref, { width }] = useSize<HTMLDivElement>()
  const dispatch = useContextSelector(OverflowContext, o => o.dispatch)
  const displayIdx = useContextSelector(OverflowContext, o => o.displayIdx)
  const visible = idx <= displayIdx
  const order = visible ? idx : Number.MAX_SAFE_INTEGER
  useLayoutEffect(() => {
    dispatch({
      type: 'SET_ITEM_WIDTH',
      payload: { key, width },
    })
  }, [width, dispatch, key])
  return { ref, order, visible }
}
// Rest
const useOverflowRest = (visible: boolean) => {
  const [ref, { width }] = useSize<HTMLDivElement>()
  const displayIdx = useContextSelector(OverflowContext, o => o.displayIdx)
  const dispatch = useContextSelector(OverflowContext, o => o.dispatch)
  const order = visible ? displayIdx + 1 : Number.MAX_SAFE_INTEGER
  useLayoutEffect(() => {
    dispatch({
      type: 'SET_REST_WIDTH',
      payload: width,
    })
  }, [dispatch, width])
  return { ref, order }
}
```

做完这些，一个基本的 Overflow 就大功告成了！

![图片](/images/99c8cfd26632c7b5a910d46e641920c53b559ab87264ddc582de5d24aec19f5c.png)

# 额外优化

到目前为止我们做了一些基本的代码，还有许多细节可以优化（bug or feature）。

## 渲染时闪烁

当存在折叠元素之后，页面初次加载会有短暂的闪烁现象。

![图片](/images/b4040c739f8eadfc24f8aaf37b2911aeaa849d414c7b734aded196d1e4dfc56d.gif)

出现这个现象的原因其实在本文最开始就提到了，元素显隐的控制计算依赖元素渲染完成之后的 width 测量以及上报，所以元素的渲染必然发生在计算之前，等到计算结束之后才会折叠。所以就会出现短暂的显示出全部元素的现象。

最简单的办法就是默认隐藏未渲染的元素，即「width === undefined」

```tsx
// 由于 dom 元素总是从上至下渲染
// 如果顺序计算时发现某个元素没有上报 width，表示其还没有渲染完成，
// 则隐藏其以及其后的元素
if (width === undefined) {
  break
}
```

## 关心 rest 动态变化

在上述计算时，其实大多数情况我们只把 rest 当作一个特殊的 item，但当 rest 存在一些特殊渲染逻辑时，可能会存在 bug。

比如以下这段代码，rest 的宽度受到隐藏 keys 的数量影响，这是很常见的需求。

![图片](/images/7b5e115804c1906d63b27a1026460da9c8f1bdfaa4676229150aeb358e5c3c3a.png)

当显示的元素变少时，rest 会变短；当显示的元素变多时，rest 会变长。

逻辑敏感的同学是不是察觉到里面似乎蕴含着某种死循环，没错！

![图片](/images/c1b7c75ebc540bef82827e0674d9d514d9829c49a7f0727bb03dd89bc09f0a4d.gif)

所以我们需要对 rest 的宽度做一个简单的缓存，并且取最大值

```tsx
const useFirst = () => {
  const isFirst = useRef(true)
  if (isFirst.current) {
    isFirst.current = false
    return true
  }
  return isFirst.current
}
const usePreviousDistinct = <T,>(value: T) => {
  const prevRef = useRef<T>()
  const curRef = useRef<T>(value)
  const isFirst = useFirst()
  if (!isFirst && curRef.current !== value) {
    prevRef.current = curRef.current
    curRef.current = value
  }
  return prevRef.current
}

const prevRestWidth = usePreviousDistinct(restWidth)
const maxRestWidth = Math.max(prevRestWidth || 0, restWidth)
useLayoutEffect(() => {
  let totalItemWidth = 0
  let last = -1
  for (let idx = 0; idx < keys.length; idx++) {
    const key = keys[idx]
    const width = itemWidths[key]
    if (
      width === undefined ||
      (totalItemWidth + width + maxRestWidth > containerWidth &&
        idx !== keys.length - 1) ||
      totalItemWidth + width > containerWidth
    ) {
      break
    }
    last = idx
    totalItemWidth += width
  }
  dispatch({ type: 'SET_DISPLAY_IDX', payload: last })
}, [itemWidths, containerWidth, keys, maxRestWidth, dispatch])
```