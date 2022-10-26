---
title: 读 Dan Abramov 的博客的小想法们
sub: 膜拜大佬～
date: Wed Oct 20 2021 17:17:32 GMT+0800 (中国标准时间)
tags: Geek,Mind
---
前段时间（是几个月前），web infra 团队请到了 Dan Abramov 做访谈。作为刚从 vue 转到 react 的初学者，我对 Dan 的大名有所耳闻也预约了日程。不过由于没有特别放在心上，加上工作内容繁重所以就错过了（现在想来略感遗憾）。

之后每每有破碎的空闲时间，我就翻出同事记录的访谈实录阅读，之后又有了中文字幕版的录屏（再次感谢 web infra 的同事们，他们真的太棒了）。不得不说从程序员的角度来看 Dan 非常的具有魅力，我至今不是很清楚他从那里吸引到我，但我能感受到的是他表达他对 react 和编程的理解时给了我一种降维打击的感觉，总结一句话就是：

**他给出了解决方法，并且说服了我。**

当我们处于某个领域初中级阶段时，其实我们不尽然能理解金字塔顶尖的大佬们的思维。或者是听不明白，又或者是不以为然（可能是大佬们对于某些场景的妥协或者权衡，但很明显我们没有足够的经验支撑我们理解这些）。但 Dan 可以，所以我又去翻找他的其他文字，很幸运的是我找到了 [Dan 的博客](https://overreacted.io/)，更幸运的是他至今仍在更新。

Dan 的博客很杂，从编程技术到人生总结都有，我读了不少获益匪浅。

关于人生经验的比较有名的一篇是 [Dan 的十年总结](https://overreacted.io/zh-hans/my-decade-in-review/)，从头到尾的讲了这个俄罗斯小伙如何成为一位世界前沿的前端工程师。也许是有年代差又或者国家内外国情不同，我对他的人生经历并没有太多的共情，比如我不能理解他为什么在失业之后进行了莫名其妙的旅行，然后被人拿刀子威胁，然后游泳差点淹死等等。从这个角度看像是在看鲁滨逊漂流记。

但始终不变的是他对编程的执着，我不清楚是什么造就了他的这一特质，但这绝对是支持他到现在的巨大助力之一。比较羞愧的是，我承认计算机编程确实是我比较喜爱且擅长的领域，但当他成为我的谋生手段时这种情感就会逐渐变质。对新技术的追求是程序员的普遍特质，我同样渴望在项目中使用最前沿的技术最好还支持我反复调试，而这和业务稳定有不可调和的矛盾，这可能也是我不断的更新我博客的构建技术栈的原因。

这篇文章可能会比较长，随着我不断阅读 Dan 的文章也许我会持续更新一些感触。不过我的本意是把一些读文章中发现的小知识记录总结下来，所以这会写在最前面。

# React 渲染优化

我们通常会使用 `memo()` 去包裹一些高开销的组件来提升渲染性能。 Dan 在 [before you memo](https://overreacted.io/zh-hans/before-you-memo/) 中描述了更基础的一个小技巧。

React 的重新渲染都是以组件为单位的，也就是说组件层面的 state 被更新时就会触发组件的视图重新渲染。那么当确定一个组件会被更新时我们能不能尽量减小重新渲染的范围呢？

```tsx
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
function ExpensiveTree() {
  let now = performance.now();
  while (performance.now() - now < 100) {}
  return <p>I am a very slow component tree.</p>;
}
```

`<ExpensiveTree />` 是一个渲染开销很大的组件，他被放在 `<App />` 中，当我们每次 `setColor` 之后都会重新渲染视图，而且我们发现尽管 `<ExpensiveTree />` 不关心 `color` 的变化但他仍然被重新渲染且极大的拖慢了 `<App />` 的渲染速度。

## 向下移动 state

我们把用到 `color` 的 dom 单独提取为组件，上文提到 react 更新是以组件为单位的，把会更新的内容单独提取就相当于把无关的内容排除在重新渲染之外，可以提高渲染效率。

```tsx
export default function App() {
  return (
    <>
      <Form />
      <ExpensiveTree />
    </>
  );
}

function Form() {
  let [color, setColor] = useState('red');
  return (
    <>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
    </>
  );
}
```

## 提升内容

如果组件的根节点 `<div></div>` 依赖 state 变化那应该怎么做呢？

```tsx
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

我们没办法像上文中的那样单独分离兄弟组件，但我们可以分离父子组件

```tsx
export default function App() {
  return (
    <ColorPicker>
      <p>Hello, world!</p>
      <ExpensiveTree />
    </ColorPicker>
  );
}
function ColorPicker({ children }) {
  let [color, setColor] = useState("red");
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      {children}
    </div>
  );
}
```

尽管父组件 `<ColorPicker />` 在被更新时会被丢弃并且重新构建，但由于他的 `children` 并没有发生变化所以仍然会把他挂到新的 `<ColorPicker />` 上而不是重构。

## 意义

上述的两种思路殊途同归，都是尽可能的分离有状态和无状态内容，让有状态的组件尽量的原子化自己维护自己的 state。这样的另一个好处时可以减少 props 的贯穿路径，这可能和 vuex 或者 redux 等集中管理状态的理念相违背。不过他们本身就是不同场景的应用。

看完这段例子是不是有一种“这个好像是 react 常识，但确实没认真考虑过”的感觉，引用 Dan 的原话：

> This is not a new idea. It’s a natural consequence of React composition model. It’s simple enough that it’s underappreciated, and deserves a bit more love.
