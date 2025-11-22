---
title: React Step0
description: React学习
template: doc
lastUpdated: 2025-11-22 15:33:17
tableOfContents: false
sidebar:
  badge:
    text: Start
    variant: default
banner:
  content: 已经学习
---

### 学习React的原因
因为一直想系统地学习一下前端

### 为什么选择React
其实,我自己之前学习过Vue,Vue学习和使用很简单,但是对于Vue的语法,让我很难受。

也学习过Angular，Angular对于Java程序员比较友好,因为里面的一些思想和Spring很类似,所以这也是我上手最快的一个框架。但是不够自由，社区也不是很活跃,感觉随时会落寞,就没有投入太多的时间。所以,并不是Angular不好,只是出现问题解决问题的成本太高了。

后来我接触到Facebook,被Facebook的页面所震撼,了解了一下是React构建的。随后,简单看了一下React官网,就已经有答案了——React就是我一直想要找的,和我的想法很契合。所以最终决定学习React


### 学习资源
- [中文网站](https://zh-hans.react.dev/learn)
- [React 开发者工具](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en&pli=1)

### 学习笔记
#### 基础知识
- **组件**: 在 React 中，组件是一段可重用代码

#### 基础规则
- React 组件必须以大写字母开头，而 HTML 标签则必须是小写字母。
- `export default` 关键字指定了文件中的**主要**组件，JavaScript 的 `export` 关键字使此函数可以在此文件之外访问。`default` 关键字表明它是文件中的主要函数。类似于Java里面的`public class`。
- JSX 比 HTML 更加严格,标签必须闭合
- 组件也不能返回多个 JSX 标签，必须将它们包裹到一个共享的父级中。比如 `<div>...</div> `或使用空的 `<>...</>` 包裹.`<></>`被称作为Fragment
- 使用 className 来指定一个 CSS 的 class。React 并没有规定你如何添加 CSS 文件。最简单的方式是使用 HTML 的 <link> 标签
- `{moatkon}` 大括号会读取JavaScript中`moatkon`中的值。大括号内支持表达式,例如 `{'Hello' + moatkon}`,Hello字符串拼接上moatkon的值
- `style={{}}` 并不是一个特殊的语法，而是 `style={ }` JSX 大括号内的一个普通 `{}` 对象。故,可见,灵活度很高

#### 逻辑规则
- React 没有特殊的语法来编写条件语句，因此你使用的就是普通的 JavaScript 代码。即: 基本逻辑语法 + JSX
- 渲染列表。依赖 JavaScript 的特性，例如 `for` 循环 和 `array` 的 `map()` 函数 来渲染组件列表

#### 响应
在组件中声明 事件处理 函数来响应事件

```js ins={'注意onClick={handleClick}的结尾没有小括':7}
function MyButton() {
  function handleClick() {
    alert('You clicked me!');
  }

  return (

    <button onClick={handleClick}>
      点我
    </button>
  );
}
```

#### "记忆" state
- 从 React 引入 useState: `import { useState } from 'react';`
- 声明一个 state 变量: `const [count, setCount] = useState(0);` 你将从 useState 中获得两样东西：当前的 state（count），以及用于更新它的函数（setCount）。你可以给它们起任何名字，但按照惯例会像 [something, setSomething] 这样为它们命名
- Hook: 以 use 开头的函数被称为 Hook. Hook 比普通函数更为严格。你只能在你的组件（或其他 Hook）的 顶层 调用 Hook。如果你想在一个条件或循环中使用 useState，请提取一个新的组件并在组件内部使用它。useState 是 React 提供的一个内置 Hook。你可以在 [React API 参考](https://zh-hans.react.dev/reference/react) 中找到其他内置的 Hook。你也可以通过组合现有的 Hook 来编写属于你自己的 Hook。

#### 组件间共享数据
- “状态提升”。通过向上移动 state，我们实现了在组件间共享它
- prop: 传递的信息被称作 prop
- state 对于定义它的组件是私有的。所以从其他组件直接私有的state是不行的。但是可以从定义state的组件中传递一个函数下来。即类似于我给你一个入口,你通过这个入口来更新我的值

#### () =>
- `() =>`  语法.`() => handleClick(0)` 是一个箭头函数，它是定义函数的一种较短的方式。单击方块时，`=>`“箭头”之后的代码将运行，调用 `handleClick(0)`

### 不变性
- 不变性使复杂的功能更容易实现。
- 不变性还有另一个好处。默认情况下，当父组件的 state 发生变化时，所有子组件都会自动重新渲染。这甚至包括未受变化影响的子组件。尽管重新渲染本身不会引起用户注意（你不应该主动尝试避免它！），但出于性能原因，你可能希望跳过重新渲染显然不受其影响的树的一部分。不变性使得组件比较其数据是否已更改的成本非常低。

### TODO
- [X] nextStage: https://zh-hans.react.dev/learn/thinking-in-react
---
:::tip[突然冒出来的]
react的哲学: 拆解。大问题拆解成一个一个小问题
:::
