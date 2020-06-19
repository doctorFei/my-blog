---
title: 五、组件通信
---

## 组件化常用技术

### 组件传值、通信

#### **父组件** **=>** 子组件

**属性props**

```html
props: { msg: String } // parent 
<HelloWorld msg="Welcome to Your Vue.js App"/>
```

**引用refs**

```html
// parent 
<HelloWorld ref="hw"/> 
this.$refs.hw.xx = 'xxx'
```

#### 子组件 **=>** 父组件

**自定义事件**

```html
// child 
this.$emit('add', good) 
// parent 
<Cart @add="cartAdd($event)"></Cart>
```

#### 兄弟组件：通过共同祖辈组件

通过共同的祖辈组件搭桥，$parent或$root。

```javascript
// brother1 
this.$parent.$on('foo', handle) 
// brother2 
this.$parent.$emit('foo')
```

**祖先和后代之间**

provide/inject：能够实现祖先给后代传值

```javascript
// ancestor
provide() { return {foo: 'foo'} }
// descendant 
inject: ['foo']
```

**任意两个组件之间：**

**事件总线 或** **vuex**

```javascript
// Bus：事件派发、监听和回调管理 
class Bus {
	constructor() {
		this.callbacks = {}
	}
	$on(name, fn) {
		this.callbacks[name] = this.callbacks[name] || [] this.callbacks[name].push(fn)
	}
	$emit(name, args) {
		if (this.callbacks[name]) {
			this.callbacks[name].forEach(cb => cb(args))
		}
	}
}
// main.js 
Vue.prototype.$bus = new Bus()
// child1 
this.$bus.$on('foo', handle)
// child2 
this.$bus.$emit('foo')
```

在 Vue.js 1.x 中，提供了两个方法：`$dispatch` 和 `$broadcast` ，前者用于向上级派发事件，只要是它的父级（一级或多级以上），都可以在组件内通过 `$on` （或 events，2.x 已废弃）监听到，后者相反，是由上级向下级广播事件的。

这两种方法一旦发出事件后，任何组件都是可以接收到的，就近原则，而且会在第一次接收到后停止冒泡，除非返回 true。

**dispatch&broadcast**

```javascript
function broadcast(componentName, eventName, params) {
  this.$children.forEach(child => {
    var name = child.$options.componentName;

    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      broadcast.apply(child, [componentName, eventName].concat([params]));
    }
  });
}
export default {
  methods: {
     // 向上级派发事件
    dispatch(componentName, eventName, params) {
      var parent = this.$parent || this.$root;
      var name = parent.$options.componentName;

      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.componentName;
        }
      }
      if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    // 向下级派发事件
    broadcast(componentName, eventName, params) {
      broadcast.call(this, componentName, eventName, params);
    }
  }
};
```

#### 插槽

> Vue 2.6.0之后采用全新v-slot语法取代之前的slot、slot-scope

**匿名插槽**

```javascript
// comp1
<div><slot></slot> </div>
// parent
<comp>hello</comp>
```

**具名插槽**

```html
// comp2 
<div>
    <slot></slot>
	<slot name="content"></slot> 
</div> 
// parent 
<Comp2>
        <!-- 默认插槽用default做参数 --> 
        <template v-slot:default>具名插槽</template> 
		<!-- 具名插槽用插槽名做参数 -->
		<template v-slot:content>内容...</template> 
</Comp2>
```

**作用域插槽**

```html
// comp3 
<div><slot :foo="foo"></slot> </div> 
// parent
<Comp3> 
    <!-- 把v-slot的值指定为作用域上下文对象 --> 
    <template v-slot:default="ctx"> 来自子组件数据：{{ctx.foo}} </template>
</Comp3>
```



### 表单组件实现 

**Input**

- 双向绑定：@input、:value
- 派发校验事件

```vue
<template>
	<div> <input :value="value" @input="onInput" v-bind="$attrs"> </div>
</template>
<script>
	export default {
		inheritAttrs: false,
		props: {
			value: {
				type: String,
				default: ""
			}
		},
		methods: {
			onInput(e) {
				this.$emit("input", e.target.value);
				this.$parent.$emit('validate');
			}
		}
	};
</script>
```

**FormItem**

- 给Input预留插槽 - slot
- 能够展示label和校验信息
- 能够进行校验

```vue
<template>
	<div> <label v-if="label">{{label}}</label>
		<slot></slot>
		<p v-if="errorMessage">{{errorMessage}}</p>
	</div>
</template>
<script>
	import Schema from 'async-validator'
	export default {
		inject: ["form"],
		props: {
			label: {
				type: String,
				default: ""
			},
			prop: {
				type: String
			}
		},
		data() {
			return {
				errorMessage: ""
			};
		},
		mounted() {
			this.$on('validate', () => {
				this.validate()
			})
		},
		methods: {
			validate() {
				// 做校验 
				const value = this.form.model[this.prop]
				const rules = this.form.rules[this.prop]
				// npm i async-validator -S 
				const desc = {
					[this.prop]: rules
				};
				const schema = new Schema(desc);
				// return的是校验结果的Promise 
				return schema.validate({
					[this.prop]: value
				}, errors => {
					if (errors) {
						this.errorMessage = errors[0].message;
					} else {
						this.errorMessage = ''
					}
				})
			}
		},
	};
</script>
```

**Form**

给FormItem留插槽

设置数据和校验规则

全局校验

```vue
<template>
	<div>
		<slot></slot>
	</div>
</template>
<script>
	export default {
		provide() {
			return {
				form: this
			};
		},
		props: {
			model: {
				type: Object,
				required: true
			},
			rules: {
				type: Object
			}
		},
		methods: {
			validate(cb) {
				const tasks = this.$children.filter(item => item.prop).map(item => item.validate());
				// 所有任务都通过才算校验通过
				Promise.all(tasks).then(() => cb(true)).catch(() => cb(false));
			}
		}
	};
</script>
```