---
title: Vue面试题（一）
---

## 1. v-if 和 v-for 哪个优先级更高？如果两个同时出现，应该怎么优化得到更好的性能？

源码中找答案
https://github.com/vuejs/vue/blob/dev/src/compiler/codegen/index.js#L55

```javascript
<p v-for="item in items" v-if="condition">
```

测试

```html
<!DOCTYPE html>
<html>
	<head>
		<title>Vue事件处理</title>
	</head>
	<body>
		<div id="demo">
			<h1>v-for和v-if谁的优先级高？应该如何正确使用避免性能问题？</h1>
			<p v-for="child in children" v-if="isFolder">{{child.title}}</p> <template v-if="isFolder">
				<p v-for="child in children">{{child.title}}</p>
			</template>
		</div>
		<script src="../../dist/vue.js"></script>
		<script>
			// 创建实例
			const app = new Vue({
				el: '#demo',
				data() {
					return {
						children: [{
							title: 'foo'
						}, {
							title: 'bar'
						}, ]
					}
				},
				computed: {
					isFolder() {
						return this.children && this.children.length > 0
					}
				},
			});
			console.log(app.$options.render);
		</script>
	</body>
</html

```

两者同级时，渲染函数如下：

```javascript
(function anonymous() {
  with (this) {
    return _c(
      "div",
      {
        attrs: {
          id: "demo",
        },
      },
      [
        _c("h1", [
          _v("v-for和v-if谁的优先 级高？应该如何正确使用避免性能问题？"),
        ]),
        _v(" "),
        _l(children, function(child) {
          return isFolder ? _c("p", [_v(_s(child.title))]) : _e();
        }),
      ],
      2
    );
  }
});
```

> \_l 包含了 isFolder 的条件判断

两者不同级时，渲染函数如下

```javascript
(function anonymous() {
  with (this) {
    return _c(
      "div",
      {
        attrs: {
          id: "demo",
        },
      },
      [
        _c("h1", [
          _v("v-for和v-if谁的优先 级高？应该如何正确使用避免性能问题？"),
        ]),
        _v(" "),
        isFolder
          ? _l(children, function(child) {
              return _c("p", [_v(_s(child.title))]);
            })
          : _e(),
      ],
      2
    );
  }
});
```

> 先判断了条件再看是否执行\_l

**结论：**

1. 显然 v-for 优先于 v-if 被解析（把你是怎么知道的告诉面试官）
2. 如果同时出现，每次渲染都会先执行循环再判断条件，无论如何循环都不可避免，浪费了性能
3. 要避免出现这种情况，则在外层嵌套 template，在这一层进行 v-if 判断，然后在内部进行 v-for 循环
4. 如果条件出现在循环内部，可通过计算属性提前过滤掉那些不需要显示的项

## 2. Vue 组件 data 为什么必须是个函数而 Vue 的根实例则没有此限制？

Vue 组件可能存在多个实例，如果使用对象形式定义 data，则会导致它们共用一个 data 对象，那么状态变更将会影响所有组件实例，这是不合理的；采用函数形式定义，在 initData 时会将其作为工厂函数返回全新 data 对象，有效规避多实例之间状态污染问题。而在 Vue 根实例创建过程中则不存在该限制，也是因为根实例只能有一个，不需要担心这种情况

## 3. 你知道 vue 中 key 的作用和工作原理吗？说说你对它的理解。

测试代码如下

```html
<!DOCTYPE html>
<html>
  <head>
    <title>03-key的作用及原理?</title>
  </head>
  <body>
    <div id="demo">
      <p v-for="item in items" :key="item">{{item}}</p>
    </div>
    <script src="../../dist/vue.js"></script>
    <script>
      const app = new Vue({
        el: "#demo",
        data: {
          items: ["a", "b", "c", "d", "e"],
        },
        mounted() {
          setTimeout(() => {
            this.items.splice(2, 0, "f");
          }, 2000);
        },
      });
    </script>
  </body>
</html>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/202006222133305.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMwODY4Mjg5,size_16,color_FFFFFF,t_70)
不适用 key
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200622213413879.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMwODY4Mjg5,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200622213508551.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMwODY4Mjg5,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200622213523870.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMwODY4Mjg5,size_16,color_FFFFFF,t_70)
源码：
https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js#L404

```javascript
function sameVnode(a, b) {
  return (
    a.key === b.key &&
    ((a.tag === b.tag &&
      a.isComment === b.isComment &&
      isDef(a.data) === isDef(b.data) &&
      sameInputType(a, b)) ||
      (isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)))
  );
}
```

**结论**

1. key 的作用主要是为了高效的更新虚拟 DOM，其原理是 vue 在 patch 过程中通过 key 可以精准判断两个节点是否是同一个，从而避免频繁更新不同元素，使得整个 patch 过程更加高效，减少 DOM 操作量，提高性能。
2. 另外，若不设置 key 还可能在列表更新时引发一些隐蔽的 bug
3. vue 中在使用相同标签名元素的过渡切换时，也会使用到 key 属性，其目的也是为了让 vue 可以区分它们，否则 vue 只会替换其内部属性而不会触发过渡效果。

## 4. 你怎么理解 vue 中的 diff 算法？

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200622220802907.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMwODY4Mjg5,size_16,color_FFFFFF,t_70)

源码分析 1：必要性，lifecycle.js - mountComponent()
https://github.com/vuejs/vue/blob/dev/src/core/instance/lifecycle.js#L141
组件中可能存在很多个 data 中的 key 使用

源码分析 2：执行方式，patch.js - patchVnode()
https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js#L501
patchVnode 是 diff 发生的地方，整体策略：深度优先，同层比较

源码分析 3：高效性，patch.js - updateChildren()
https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js#L404

**总结**

1.  diff 算法是虚拟 DOM 技术的必然产物：通过新旧虚拟 DOM 作对比（即 diff），将变化的地方更新在真实 DOM 上；另外，也需要 diff 高效的执行对比过程，从而降低时间复杂度为 O(n)。
2.  vue 2.x 中为了降低 Watcher 粒度，每个组件只有一个 Watcher 与之对应，只有引入 diff 才能精确找到发生变化的地方。
3.  vue 中 diff 执行的时刻是组件实例执行其更新函数时，它会比对上一次渲染结 oldVnode 和新的渲染结果 newVnode，此过程称为 patch。
4.  diff 过程整体遵循深度优先、同层比较的策略；两个节点之间比较会根据它们是否拥有子节点或者文本节点做不同操作；比较两组子节点是算法的重点，首先假设头尾节点可能相同做 4 次比对尝试，如果没有找到相同节点才按照通用方式遍历查找，查找结束再按情况处理剩下的节点；借助 key 通常可以非常精确找到相同节点，因此整个 patch 过程非常高效。

## 5. 谈一谈对 vue 组件化的理解？

组件化定义、优点、使用场景和注意事项等方面展开陈述，同时要强调 vue 中组件化的一些特点。

**源码分析 1：组件定义**

```html
// 组件定义 Vue.component('comp', { template: '
<div>this is a component</div>
' })
```

> 组件定义
> https://github.com/vuejs/vue/blob/dev/src/core/global-api/extend.js#L33 > https://github.com/vuejs/vue/blob/dev/src/core/global-api/assets.js

```html
<template> <div>this is a component</div> </template>
```

> vue-loader 会编译 template 为 render 函数，最终导出的依然是组件配置对象

**源码分析 2：组件化优点**
lifecycle.js - mountComponent()

```javascript
updateComponent = () => {
  vm._update(vm._render(), hydrating);
};

// we set this to vm._watcher inside the watcher's constructor
// since the watcher's initial patch may call $forceUpdate (e.g. inside child
// component's mounted hook), which relies on vm._watcher being already defined
new Watcher(
  vm,
  updateComponent,
  noop,
  {
    before() {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, "beforeUpdate");
      }
    },
  },
  true /* isRenderWatcher */
);
```

> 组件、Watcher、渲染函数和更新函数之间的关系
> const vnode = vm.\_render()
> https://github.com/vuejs/vue/blob/dev/src/core/instance/lifecycle.js#L141
>
> Vue 的 Watcher 是建立在组件上的，针对频繁更新的部分，将其拆分成组件，将会提升性能

**源码分析 3：组件化实现**
构造函数，src\core\global-api\extend.js
实例化及挂载，src\core\vdom\patch.js - createElm()

## 6. 谈一谈对 vue 设计原则的理解？

在 vue 的官网上写着大大的定义和特点：

- 渐进式 JavaScript 框架
- 易用、灵活和高效

所以阐述此题的整体思路按照这个展开即可。

### 渐进式 JavaScript 框架：

与其它大型框架不同的是，Vue 被设计为可以自底向上逐层应用。Vue 的核心库只关注视图层，不仅易
于上手，还便于与第三方库或既有项目整合。另一方面，当与现代化的工具链以及各种支持类库结合使
用时，Vue 也完全能够为复杂的单页应用提供驱动。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200625141727902.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMwODY4Mjg5,size_16,color_FFFFFF,t_70)

### 易用性

vue 提供数据响应式、声明式模板语法和基于配置的组件系统等核心特性。这些使我们只需要关注应用
的核心业务即可，只要会写 js、html 和 css 就能轻松编写 vue 应用。

### 灵活性

渐进式框架的最大优点就是灵活性，如果应用足够小，我们可能仅需要 vue 核心特性即可完成功能；随
着应用规模不断扩大，我们才可能逐渐引入路由、状态管理、vue-cli 等库和工具，不管是应用体积还是
学习难度都是一个逐渐增加的平和曲线。

### 高效性

超快的虚拟 DOM 和 diff 算法使我们的应用拥有最佳的性能表现。追求高效的过程还在继续，vue3 中引入 Proxy 对数据响应式改进以及编译器中对于静态内容编译的改进都会让 vue 更加高效。
