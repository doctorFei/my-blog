---
title: 三、Vue 的生命周期之间到底做了什么事清
---

# Vue 的生命周期之间到底做了什么事清？（源码详解，带你从头梳理组件化流程）

## 前言

相信大家对 Vue 有哪些生命周期早就已经烂熟于心，但是对于这些生命周期的前后分别做了哪些事情，可能还有些不熟悉。

本篇文章就从一个完整的流程开始，详细讲解各个生命周期之间发生了什么事情。

注意本文不涉及 `keep-alive` 的场景和错误处理的场景。

![vue生命周期](https://cn.vuejs.org/images/lifecycle.png)

## 初始化流程

### new Vue

从 `new Vue(options)` 开始作为入口，`Vue` 只是一个简单的构造函数，内部是这样的：

```javascript
function Vue (options) {
  this._init(options)
}
```

进入了 `_init` 函数之后，先初始化了一些属性。

1. `initLifecycle`：初始化一些属性如`$parent`，`$children`。根实例没有 `$parent`，`$children` 开始是空数组，直到它的 `子组件` 实例进入到 `initLifecycle` 时，才会往父组件的 `$children` 里把自身放进去。所以 `$children` 里的一定是组件的实例。
2. `initEvents`：初始化事件相关的属性，如 `_events` 等。
3. `initRender`：初始化渲染相关如 `$createElement`，并且定义了 `$attrs` 和 `$listeners` 为`浅层`响应式属性。具体可以查看`细节`章节。并且还定义了`$slots`、`$scopedSlots`，其中 `$slots` 是立刻赋值的，但是 `$scopedSlots` 初始化的时候是一个 `emptyObject`，直到组件的 `vm._render` 过程中才会通过 `normalizeScopedSlots` 去把真正的 `$scopedSlots` 整合后挂到 `vm` 上。

然后开始第一个生命周期：

```
callHook(vm, 'beforeCreate')
```

### beforeCreate被调用完成

`beforeCreate` 之后

1. 初始化 `inject`

2. 初始化

    

   ```
   state
   ```

   - 初始化 `props`
   - 初始化 `methods`
   - 初始化 `data`
   - 初始化 `computed`
   - 初始化 `watch`

3. 初始化 `provide`

所以在 `data` 中可以使用 `props` 上的值，反过来则不行。

然后进入 `created` 阶段：

```
callHook(vm, 'created')
```

### created被调用完成

调用 `$mount` 方法，开始挂载组件到 `dom` 上。

如果使用了 `runtime-with-compile` 版本，则会把你传入的 `template` 选项，或者 `html` 文本，通过一系列的编译生成 `render` 函数。

- 编译这个 `template`，生成 `ast` 抽象语法树。
- 优化这个 `ast`，标记静态节点。（渲染过程中不会变的那些节点，优化性能）。
- 根据 `ast`，生成 `render` 函数。

对应具体的代码就是：

```javascript
const ast = parse(template.trim(), options)
if (options.optimize !== false) {
  optimize(ast, options)
}
const code = generate(ast, options)
```

如果是脚手架搭建的项目的话，这一步 `vue-cli` 已经帮你做好了，所以就直接进入 `mountComponent` 函数。

那么，确保有了 `render` 函数后，我们就可以往`渲染`的步骤继续进行了

### beforeMount被调用完成

把 `渲染组件的函数` 定义好，具体代码是：

```javascript
updateComponent = () => {
  vm._update(vm._render(), hydrating)
}
```

拆解来看，`vm._render` 其实就是调用我们上一步拿到的 `render` 函数生成一个 `vnode`，而 `vm._update` 方法则会对这个 `vnode` 进行 `patch` 操作，帮我们把 `vnode` 通过 `createElm`函数创建新节点并且渲染到 `dom节点` 中。

接下来就是执行这段代码了，是由 `响应式原理` 的一个核心类 `Watcher` 负责执行这个函数，为什么要它来代理执行呢？因为我们需要在这段过程中去 `观察` 这个函数读取了哪些响应式数据，将来这些响应式数据更新的时候，我们需要重新执行 `updateComponent` 函数。

```javascript
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        )
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        )
      }
    }
  }
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`vue ${name} render`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
```

如果是更新后调用 `updateComponent` 函数的话，`updateComponent` 内部的 `patch` 就不再是初始化时候的创建节点，而是对新旧 `vnode` 进行 `diff`，最小化的更新到 `dom节点` 上去。具体过程可以看我的上一篇文章：

[为什么 Vue 中不要用 index 作为 key？（diff 算法详解）](https://juejin.im/post/5e8694b75188257372503722)

这一切交给 `Watcher` 完成：

```javascript
new Watcher(vm, updateComponent, noop, {
  before () {
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate')
    }
  }
}, true /* isRenderWatcher */)
```

注意这里在`before` 属性上定义了`beforeUpdate` 函数，也就是说在 `Watcher` 被响应式属性的更新触发之后，重新渲染新视图之前，会先调用 `beforeUpdate` 生命周期。

关于 `Watcher` 和响应式的概念，如果你还不清楚的话，可以阅读我之前的文章：

[手把手带你实现一个最精简的响应式系统来学习Vue的data、computed、watch源码](https://juejin.im/post/5db6433b51882564912fc30f)

注意，在 `render` 的过程中，如果遇到了 `子组件`，则会调用 `createComponent` 函数。

`createComponent` 函数内部，会为子组件生成一个属于自己的`构造函数`，可以理解为子组件自己的 `Vue` 函数：

```
Ctor = baseCtor.extend(Ctor)
```

在普通的场景下，其实这就是 `Vue.extend` 生成的构造函数，它继承自 `Vue` 函数，拥有它的很多全局属性。

这里插播一个知识点，除了组件有自己的`生命周期`外，其实 `vnode` 也是有自己的 `生命周期的`，只不过我们平常开发的时候是接触不到的。

那么`子组件的 vnode` 会有自己的 `init` 周期，这个周期内部会做这样的事情：

```javascript
// 创建子组件
const child = createComponentInstanceForVnode(vnode)
// 挂载到 dom 上
child.$mount(vnode.elm)
```

而 `createComponentInstanceForVnode` 内部又做了什么事呢？它会去调用 `子组件` 的构造函数。

```
new vnode.componentOptions.Ctor(options)
```

构造函数的内部是这样的：

```javascript
const Sub = function VueComponent (options) {
  this._init(options)
}
```

这个 `_init` 其实就是我们文章开头的那个函数，也就是说，如果遇到 `子组件`，那么就会优先开始`子组件`的构建过程，也就是说，从 `beforeCreated` 重新开始。这是一个递归的构建过程。

也就是说，如果我们有 `父 -> 子 -> 孙` 这三个组件，那么它们的初始化生命周期顺序是这样的：

```javascript
父 beforeCreate 
父 create 
父 beforeMount 
子 beforeCreate 
子 create 
子 beforeMount 
孙 beforeCreate 
孙 create 
孙 beforeMount 
孙 mounted 
子 mounted 
父 mounted 
```

然后，`mounted` 生命周期被触发。

### mounted被调用完成

到此为止，组件的挂载就完成了，初始化的生命周期结束。

## 更新流程

当一个响应式属性被更新后，触发了 `Watcher` 的回调函数，也就是 `vm._update(vm._render())`，在更新之前，会先调用刚才在 `before` 属性上定义的函数，也就是

```
callHook(vm, 'beforeUpdate')
```

注意，由于 Vue 的异步更新机制，`beforeUpdate` 的调用已经是在 `nextTick` 中了。 具体代码如下：

```javascript
nextTick(flushSchedulerQueue)

function flushSchedulerQueue {
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
     // callHook(vm, 'beforeUpdate')
      watcher.before()
    }
 }
}
```

### beforeUpdate被调用完成

然后经历了一系列的 `patch`、`diff` 流程后，组件重新渲染完毕，调用 `updated` 钩子。

注意，这里是对 `watcher` 倒序 `updated` 调用的。

也就是说，假如同一个属性通过 `props` 分别流向 `父 -> 子 -> 孙` 这个路径，那么收集到依赖的先后也是这个顺序，但是触发 `updated` 钩子确是 `孙 -> 子 -> 父` 这个顺序去触发的。

```
function callUpdatedHooks (queue) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted) {
      callHook(vm, 'updated')
    }
  }
}
```

### updated被调用完成

至此，渲染更新流程完毕。

## 销毁流程

在刚刚所说的更新后的 `patch` 过程中，如果发现有组件在下一轮渲染中消失了，比如 `v-for` 对应的数组中少了一个数据。那么就会调用 `removeVnodes` 进入组件的销毁流程。

`removeVnodes` 会调用 `vnode` 的 `destroy` 生命周期，而 `destroy` 内部则会调用我们相对比较熟悉的 `vm.$destroy()`。（keep-alive 包裹的子组件除外）

这时，就会调用 `callHook(vm, 'beforeDestroy')`

### beforeDestroy被调用完成

之后就会经历一系列的`清理`逻辑，清除父子关系、`watcher` 关闭等逻辑。但是注意，`$destroy` 并不会把组件从视图上移除，如果想要手动销毁一个组件，则需要我们自己去完成这个逻辑。

然后，调用最后的 `callHook(vm, 'destroyed')`

### destroyed被调用完成

## 细节

### $attrs 和 $listener 的一些处理。

这里额外提一下 `$attrs` 之所以只有第一层被定义为响应式，是因为一般来说深层次的响应式定义已经在父组件中定义做好了，只要保证 `vm.$attrs = newAttrs` 这样的操作能触发子组件的响应式更新即可。（在子组件的模板中使用了 `$attrs` 的情况下）

在更新子组件 `updateChildComponent` 操作中，会去取收集到的 `vnode` 上的 `attrs` 和 `listeners` 去更新 `$attrs` 属性，这样就算子组件的模板上用了 `$attrs` 的属性也可触发响应式的更新。

```javascript
import { emptyObject } from '../util/index'

vm.$attrs = parentVnode.data.attrs || emptyObject
vm.$listeners = listeners || emptyObject
```

有一个比较细节的操作是这样的：

这里的 `emptyObject` 永远是同样的引用，也就能保证在没有 `attrs` 或 `listeners` 传递的时候，能够永远用同一个引用而不去触发响应式更新。

因为 `defineReactive` 的 `set` 函数中会做这样的判断：

```javascript
set: function reactiveSetter (newVal) {
  const value = getter ? getter.call(obj) : val
  // 这里引用相等 直接返回了
  if (newVal === value || (newVal !== newVal && value !== value)) {
    return
  }
}
```

### 子组件的初始化

上文中提到，子组件的初始化也一样会走 `_init` 方法，但是和根 `Vue` 实例不同的是，在 `_init` 中会有一个分支逻辑。

```javascript
if (options && options._isComponent) {
  // 如果是组件的话 走这个逻辑
  initInternalComponent(vm, options)
} else {
  vm.$options = mergeOptions(
    resolveConstructorOptions(vm.constructor),
    options || {},
    vm
  )
}
```

根级别 Vue 实例，也就是 `new Vue(options)` 生成是实例，它的 `$options` 对象大概是这种格式的，我们定义在 `new Vue(options)` 中的 `options` 对象直接合并到了 `$options` 上。

```
beforeCreate: [ƒ]
beforeMount: [ƒ]
components: {test: {…}}
created: [ƒ]
data: ƒ mergedInstanceDataFn()
directives: {}
el: "#app"
filters: {}
methods: {change: ƒ}
mixins: [{…}]
mounted: [ƒ]
name: "App"
render: ƒ anonymous( )
```

而子组件实例上的 `$options` 则是这样的：

```
parent: Vue {_uid: 0, _isVue: true, $options: {…}, _renderProxy: Proxy, _self: Vue, …}
propsData: {msg: "hello"}
render: ƒ anonymous( )
staticRenderFns: []
_componentTag: "test"
_parentListeners: undefined
_parentVnode: VNode {tag: "vue-component-1-test", data: {…}, children: undefined, text: undefined, elm: li, …}
_propKeys: ["msg"]
_renderChildren: [VNode]
__proto__: Object
```

那有人会问了，为啥我在子组件里通过 `this.$options` 也能访问到定义在 `options` 里的属性啊？

我们展开 `__proto__` 属性看一下：

```
beforeCreate: [ƒ]
beforeMount: [ƒ]
created: [ƒ]
directives: {}
filters: {}
mixins: [{…}]
mounted: [ƒ]
props: {msg: {…}}
_Ctor: {0: ƒ}
_base: ƒ Vue(options)
```

原来是被挂在原型上了，具体是 `initInternalComponent` 中的这段话做的：

```
const opts = vm.$options = Object.create(vm.constructor.options)
```

### $vnode 和 _vnode 的区别

实例上有两个属性总是让人摸不着头脑，就是 `$vnode` 和 `_vnode`，

举个例子来说，我们写了个这样的组件 `App`：

```html
<div class="class-app">
  <test />
</div>
```

`test` 组件

```html
<li class="class-test">
  Hi, I'm test
</li>
```

接下来我们都以 `test` 组件举例，请仔细看清楚它们的父子关系以及使用的标签和类名。

#### $vnode

在渲染 `App` 组件的时候，遇到了 `test` 标签，会把 `test` 组件包裹成一个 `vnode`：

```html
<div class="class-app">
  // 渲染到这里 
  <test />
</div>
```

形如此：

```javascript
tag: "vue-component-1-test"
elm: li.class-test
componentInstance: VueComponent {_uid: 1, _isVue: true, $options: {…},
componentOptions: {propsData: {…}, listeners: undefined, tag: "test", children: Array(1), Ctor: ƒ}
context: Vue {_uid: 0, _isVue: true, $options: {…}, _renderProxy: Proxy, _self: Vue, …}
data: {attrs: {…}, on: undefined, hook: {…}, pendingInsert: null}
child: (...)
```

这个 `tag` 为 `vue-component-1-test` 的 `vnode`，其实可以说是把整个组件给包装了起来，通过 `componentInstance` 属性可以访问到实例 `this`，

在 `test` 组件（比如说 `test.vue` 文件）的视角来看，它应该算是 **外部** 的 `vnode`。（父组件在模板中读取到 `test.vue` 组件后才生成）

它的 `elm` 属性指向组件内部的 `根元素`，也就是 `li.class-test`。

此时，它在 `test` 组件的实例 `this` 上就保存为 `this.$vnode`。

#### _vnode

在 `test` 组件实例上，通过 `this._vnode` 访问到的 `vnode` 形如这样：

```javascript
tag: "li"
elm: li.class-test
children: (2) [VNode, VNode]
context: VueComponent {_uid: 1, _isVue: true, $options: {…}, _renderProxy: Proxy, _self: VueComponent, …}
data: {staticClass: "class-test"}
parent: VNode {tag: "vue-component-1-test", data: {…}, children: undefined, text: undefined, elm: li.test, …}
```

可以看到，它的 `tag` 是 `li`，也就是 `test` 组件的 `template` 上声明的 `最外层的节点`，

它的 `elm` 属性也指向组件内部的 `根元素`，也就是 `li.class-test`。

它其实就是 `test` 组件的 `render` 函数返回的 `vnode`，

在 `_update` 方法中也找到了来源：

```javascript
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  const vm: Component = this
  vm._vnode = vnode
}  
```

回忆一下组件是怎么初始化挂载和更新的，是不是 `vm._update(vm._render())`？

所谓的 `diff` 算法，`diff` 的其实就是 `this` 上保存的`_vnode`，和新调用 `_render` 去生成的 `vnode` 进行 `patch`。

而根 `Vue` 实例，也就是 `new Vue()` 的那层实例， `this.$vnode` 就是 `null`，因为并没有外层组件去渲染它。

#### 总结关系

`$vnode` 外层组件渲染到当前组件标签时，生成的 `vnode` 实例。

`_vnode` 是组件内部调用 `render` 函数返回的 `vnode` 实例。

```
_vnode.parent === $vnode
```

他们的 `elm`，也就是实际 `dom元素`，都指向组件内部的`根元素`。

### this.$children 和 _vnode.children

`$children` 只保存当前实例的**直接子组件** 实例，所以你访问不到 `button`，`li` 这些 `原生html标签`。注意是实例而不是 `vnode`，也就是通过 `this` 访问到的那玩意。

`_vnode.children`，则会把当前组件的 `vnode` 树全部保存起来，不管是`组件vnode`还是原生 html 标签生成的`vnode`，并且 原生 html生成的 `vnode` 内部还可以通过`children`进一步访问子`vnode`。