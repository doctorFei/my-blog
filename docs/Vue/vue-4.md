---
title: Vue响应式原理
---

## 官网如是说

当你把一个普通的 JavaScript 对象传入 Vue 实例作为 data 选项，Vue 将遍历此对象所有的 property，并使用 Object.defineProperty 把这些 property 全部转为 getter/setter。Object.defineProperty 是 ES5 中一个无法 shim 的特性，这也就是 Vue 不支持 IE8 以及更低版本浏览器的原因。

这些 getter/setter 对用户来说是不可见的，但是在内部它们让 Vue 能够追踪依赖，在 property 被访问和修改时通知变更。这里需要注意的是不同浏览器在控制台打印数据对象时对 getter/setter 的格式化并不同，所以建议安装 vue-devtools 来获取对检查数据更加友好的用户界面。

每个组件实例都对应一个 watcher 实例，它会在组件渲染的过程中把“接触”过的数据 property 记录为依赖。之后当依赖项的 setter 触发时，会通知 watcher，从而使它关联的组件重新渲染。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200613185949627.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMwODY4Mjg5,size_16,color_FFFFFF,t_70)

## 一、理解 vue 中的响应式

vue 中的响应式可以理解为：当你的状态改变时，状态是如何在整个系统的更新中反映出来的，在我们的特定上下文中，变化的状态如何反映到 dom 的变化中。数据模型仅仅是普通的 JavaScript 对象。而当你修改它们时，视图会进行更新。

```html
<body>
  <span class="cell b"></span>
</body>
<script>
  let state = {
    a: 1,
  };
  const onStateChange = () => {
    document.querySelector(".cell").textContent = state.a * 10;
  };
</script>
```

在这个伪代码中，我们设置了一个变量 state，和一个 onStateChange 函数，其作用时在 state 发生变化时能够对视图进行更新。
我们进一步抽象，抽象出这个命令式的 DOM 到一个模板语言里

```html
<body>
  <span class="cell b">
    {{state.a*10}}
  </span>
</body>
<script>
  let update; // we can understand this to Observer update
  const onStateChange = (_update) => {
    update = _update;
  };
  const setState = (newState) => {
    state = newState;
    update();
  };
  onStateChange(() => {
    view = render(state);
  });
  setState({ a: 5 });
</script>
```

如果你用过 react,你会发现它非常熟悉，因为 React 会在 setState 中强制触发状态改变，在 angular 环境中，我们可以直接操作状态，因为 angular 使用了脏检查，他拦截你的事件，比如单击以执行 digest 循环然后检查所有的东西是否改变了。

```html
<body>
  <span class="cell b">
    {{state.a*10}}
  </span>
</body>
<script>
  let update; // we can understand this to Observer update
  let state = {
    a: 1,
  };
  const onStateChange = (_update) => {
    update = _update;
  };

  onStateChange(() => {
    view = render(state);
  });

  state.a = 5;
</script>
```

在视图联系中 Vue 做的更细致，将 State 对象转换为响应式的，通过使用 Object.defineProperty，我们将所有这些属性转换成 getter 和 setter,所以我们对 state.a 来说，把 a 转换成一个 getter 和 setter。当我们对 a 的值进行设置时，去触发 onStateChange。

## 二、实现一个小型数据监听器

### getter、setter

首先我们需要了解[Object.defineProperty()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)语法。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200611185706826.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMwODY4Mjg5,size_16,color_FFFFFF,t_70)

```javascript
function isObject(obj) {
  return (
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    obj !== null &&
    obj !== undefined
  );
}

function convert(obj) {
  if (!isObject(obj)) {
    throw new TypeError();
  }

  Object.keys(obj).forEach((key) => {
    let internalValue = obj[key];
    Object.defineProperty(obj, key, {
      get() {
        console.log(`getting key "${key}": ${internalValue}`);
        return internalValue;
      },
      set(newValue) {
        console.log(`setting key "${key}" to: ${newValue}`);
        internalValue = newValue;
      },
    });
  });
}

const state = { foo: 123 };
convert(state);

state.foo; // should log: 'getting key "foo": 123'
state.foo = 234; // should log: 'setting key "foo" to: 234'
state.foo; // should log: 'getting key "foo": 234'
```

### 观察者模式

观察者模式是我们要了解的第二个知识点

> 当对象间存在一对多关系时，则使用观察者模式（Observer
> Pattern）。比如，当一个对象被修改时，则会自动通知依赖它的对象。观察者模式属于行为型模式。

- **意图**：定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新。

- **主要解决**：一个对象状态改变给其他对象通知的问题，而且要考虑到易用和低耦合，保证高度的协作。
- **何时使用**：一个对象（目标对象）的状态发生改变，所有的依赖对象（观察者对象）都将得到通知，进行广播通知。
- **如何解决**：使用面向对象技术，可以将这种依赖关系弱化。
- **关键代码**：在抽象类里有一个 ArrayList 存放观察者们。
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/2020061117320092.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMwODY4Mjg5,size_16,color_FFFFFF,t_70)我们来简单实现一个观察者模式

```html
<script>
  class Dep {
    constructor() {
      this.state = 0;
      this.observers = [];
    }
    getState() {
      return this.state;
    }
    setState(state) {
      this.state = state;
      this.notify();
    }
    notify() {
      this.observers.forEach((observer) => observer.update());
    }
    addDep(observer) {
      this.observers.push(observer);
    }
  }
  class Watcher {
    constructor(name, dep) {
      this.name = name;
      this.dep = dep;
      this.dep.addDep(this);
    }
    update() {
      console.log(`${this.name}update,state:${this.dep.getState()}`);
    }
  }
  let dep = new Dep();
  let watch = new Watcher("dep", dep);
  dep.setState(2312);
</script>
```

有了以上的铺垫，我们就可以实现一个简单的数据监听器

```html
<script>
  class Vue {
    constructor(options) {
      this.$options = options;
      // 数据响应式处理
      this.$data = options.data;
      this.observe(this.$data);

      // 测试: 没有编译器，写伪码
      new Watcher(this, "test");
      this.test;

      new Watcher(this, "foo.bar");
      this.foo.bar;

      if (options.created) {
        options.created.call(this);
      }
    }

    observe(value) {
      // 希望传进来的是对象
      if (!value || typeof value !== "object") {
        return;
      }

      // 遍历data属性
      Object.keys(value).forEach((key) => {
        this.defineReactive(value, key, value[key]);
        // 代理，可以通过vm.xx访问data中的属性
        this.proxyData(key);
      });
    }

    // 每一个属性都有一个Dep搜集观察者
    defineReactive(obj, key, val) {
      // 制造闭包
      // 递归
      this.observe(val);

      // 创建一个对应的Dep
      const dep = new Dep(); // 监听的属性

      // 给obj定义属性
      Object.defineProperty(obj, key, {
        get() {
          // 将Dep.target（wather）收集起来，每当有一个新watcher立即搜集
          Dep.target && dep.addDep(Dep.target);

          return val;
        },
        set(newVal) {
          if (newVal === val) {
            return;
          }
          val = newVal;
          // console.log(`${key}属性更新了`);
          // 更新视图操作
          dep.notify();
        },
      });
    }

    proxyData(key) {
      // 给KVue实例指定属性
      Object.defineProperty(this, key, {
        get() {
          return this.$data[key];
        },
        set(newVal) {
          this.$data[key] = newVal;
        },
      });
    }
  }

  // 管理若干Watcher实例，它和data中的属性1:1关系
  class Dep {
    constructor() {
      this.watchers = [];
    }

    // 新增watcher
    addDep(watcher) {
      this.watchers.push(watcher);
    }

    // 通知变更
    notify() {
      this.watchers.forEach((watcher) => watcher.update());
    }
  }

  // 监听器: 负责更新页面中的具体绑定
  // 观察谁
  // 怎么更新，callback

  class Watcher {
    // vm是KVue实例
    // key是data中的一个属性
    constructor(vm, key, cb) {
      this.vm = vm;
      this.key = key;
      this.cb = cb;

      // autoRun
      Dep.target = this;
      this.vm[this.key]; // 读取触发依赖收集
      Dep.target = null;
    }

    update() {
      //  console.log(this.key+'更新了');
      this.cb.call(this.vm, this.vm[this.key]);
    }
  }
</script>
```

## 三、Vue 是如何实现响应式的

vue1 响应式, Objec.t.defineProperty 每个数据修改,都能通知 dom 去改变
vue2x 中响应式的级别修改了, watcher 只到组件级,组件内部使用虚拟 dom

接下来我们详细的说说 Vue 是如何实现响应式的

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020061319072934.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMwODY4Mjg5,size_16,color_FFFFFF,t_70)

### 3.1、API 介绍

#### initState

Vue 初始化的时候，会调用 initState.，它会初始化 data，props 等，这里我们重点看 data 初始化

```javascript
// src/core/instance/state
export function initState(vm: Component) {
  vm._watchers = [];
  const opts = vm.$options;
  if (opts.props) initProps(vm, opts.props);
  if (opts.methods) initMethods(vm, opts.methods);
  if (opts.data) {
    initData(vm);
  } else {
    observe((vm._data = {}), true /* asRootData */);
  }
  if (opts.computed) initComputed(vm, opts.computed);
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}
```

#### initData

initData 核心代码是 data 数据响应化

```javascript
function initData(vm: Component) {
  let data = vm.$options.data;
  data = vm._data = typeof data === "function" ? getData(data, vm) : data || {};
  // 把data代理到实例上
  const keys = Object.keys(data);
  const props = vm.$options.props;
  const methods = vm.$options.methods;
  let i = keys.length;
  while (i--) {
    const key = keys[i];
    proxy(vm, `_data`, key);
  }
  // observe data
  observe(data, true /* asRootData */);
}
```

#### observe

observe 方法返回一个 Observer 实例

```javascript
/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe(value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return;
  }
  let ob: Observer | void;
  if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob;
}
```

#### Observer

Observer 对象根据数据类型执行对应的响应化操作

```javascript
/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
export class Observer {
  value: any;
  dep: Dep; // 保存数组类型数据的依赖
  vmCount: number; // number of vms that have this object as root $data

  constructor(value: any) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    def(value, "__ob__", this);
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods);
      } else {
        copyAugment(value, arrayMethods, arrayKeys);
      }
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   * 如果是对象，则执行该函数
   */
  walk(obj: Object) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray(items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  }
}
```

#### defineReactive

defineReactive 定义对象的 getter/setter

```javascript
**
 * Define a reactive property on an Object.
 */
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal) // 递归子对象
      dep.notify()
    }
  })
}


```

#### Dep

Dep 负责管理一组 Watcher,包括 watcher 实例的增删及通知更新

```javascript
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  addSub(sub: Watcher) {
    this.subs.push(sub);
  }

  removeSub(sub: Watcher) {
    remove(this.subs, sub);
  }
  // 调用watcher的adddep方法实现watcher和dep相互引用
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }

  notify() {
    // stabilize the subscriber list first
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null;
```

Watcher 的构造函数
解析一个表达式并搜集依赖，当数值发生变化出发回调函数，常用于\$watch API 和指令中。每个组件也会有对应的 Watcher，数值变化会触发其 update 函数导致重新渲染
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200613184429335.png)

```javascript
export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before: ?Function;
  getter: Function;
  value: any;

  constructor(
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm;
    // 组件保存render watcher
    if (isRenderWatcher) {
      vm._watcher = this;
    }
    // 组件保存非render watcher
    vm._watchers.push(this);
    // parse expression for getter
    // 将表达式解析为getter函数
    // 如果是函数则直接指定为getter,什么时候是函数？
    // 答案是那些和组件实例对应的Watcher创建时会传递组件更新函数updateComponent
    if (typeof expOrFn === "function") {
      this.getter = expOrFn;
    } else {
      // 这种是$watch传递进来的表达式，需要被解析为函数
      this.getter = parsePath(expOrFn);
      if (!this.getter) {
        this.getter = noop;
      }
    }
    this.value = this.lazy ? undefined : this.get();
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   * 模拟getter。重新搜集依赖
   */
  get() {
    // Dep.target = this
    pushTarget(this);
    let value;
    const vm = this.vm;
    try {
      // 从组件中获取到value同时触发依赖搜集
      value = this.getter.call(vm, vm);
    } catch (e) {
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value);
      }
      popTarget();
      this.cleanupDeps();
    }
    return value;
  }

  /**
   * Add a dependency to this directive.
   */
  addDep(dep: Dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
  cleanupDeps() {
    let i = this.deps.length;
    while (i--) {
      const dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    let tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update() {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run() {
    if (this.active) {
      const value = this.get();
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value;
        this.value = value;
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue);
          } catch (e) {}
        } else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }
}
```

> vue 中的数据响应化使用了观察者模式：
>
> - defineReactive 中的 getter 和 setter 对应着订阅和发布行为
> - **Dep 的角色相当于主题 Subject,维护订阅者、通知观察者更新**
> - **Watcher 的角色相当于观察者 Observer,执行更新但是 vue 里面的**
> - Observer 不是上面说的观察者,它和 data 中对象-对应,有内嵌的对象就会有 childObserver 与之对应

#### \$watch

\$watch 是一个和数据响应式息息相关的 API，它指一个监控表达式，当数值发生变化的时候执行回调函数

```javascript
Vue.prototype.$watch = function(
  expOrFn: string | Function,
  cb: any,
  options?: Object
): Function {
  const vm: Component = this;
  if (isPlainObject(cb)) {
    return createWatcher(vm, expOrFn, cb, options);
  }
  options = options || {};
  options.user = true;
  const watcher = new Watcher(vm, expOrFn, cb, options);
  if (options.immediate) {
    try {
      cb.call(vm, watcher.value);
    } catch (error) {
      handleError(
        error,
        vm,
        `callback for immediate watcher "${watcher.expression}"`
      );
    }
  }
  return function unwatchFn() {
    watcher.teardown();
  };
};
```

#### 数组响应化

数组⽐较特别，它的操作⽅法不会触发 setter，需要特别处理。修改数组 7 个变更⽅法使其可以发送更新通知

```javascript
methodsToPatch.forEach(function(method) {
  // cache original method
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
    //该⽅法默认⾏为
    const result = original.apply(this, args);
    //得到observer
    const ob = this.__ob__;
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    // 额外的事情是通知更新
    ob.dep.notify();
    return result;
  });
});
```

### 3.2、响应式流程

#### \$mount—— src\platforms\web\runtime\index.js

挂载时执⾏ mountComponent，将 dom 内容追加⾄ el

```javascript
Vue.prototype.$mount = function(
  el?: string | Element, // 可选参数
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating);
};
```

#### mountComponent ——core/instance/lifecycle

创建组件更新函数，创建组件 watcher 实例

```javascript
updateComponent = () => {
  // ⾸先执⾏vm._render() 返回VNode，在这一环节进行依赖搜集
  // 然后VNode作为参数执⾏update做dom更新
  vm._update(vm._render(), hydrating);
};
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

#### \_render() ——src\core\instance\render.js

获取组件 vnode。依赖搜集
每个属性都要有一个 dep,每个 dep 中存放着 watcher,同一个 watcher 会被多个 dep 所记录。这个 watcher 对应着我们在 mountComponent 函数创建的 watcher

```javascript
const { render, _parentVnode } = vm.$options;
vnode = render.call(vm._renderProxy, vm.$createElement);
```

#### \_update src\core\instance\lifecycle.js

执⾏ patching 算法，初始化或更新 vnode ⾄\$el

```javascript
if (!prevVnode) {
  // initial render
  // 如果没有⽼vnode，说明在初始化
  vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
} else {
  // updates
  // 更新周期直接diff，返回新的dom
  vm.$el = vm.__patch__(prevVnode, vnode);
}
```

#### **patch** ——src\platforms\web\runtime\patch.js

定义组件实例补丁⽅法

```javascript
Vue.prototype.__patch__ = inBrowser ? patch : noop;
```

#### createPatchFunction ——src\core\vdom\patch.js

创建浏览器平台特有 patch 函数，主要负责 dom 更新操作

```javascript
// 扩展操作：把通⽤模块和浏览器中特有模块合并
const modules = platformModules.concat(baseModules);
// ⼯⼚函数：创建浏览器特有的patch函数，这⾥主要解决跨平台问题
export const patch: Function = createPatchFunction({ nodeOps, modules });
```

## 最后

如果你有不清楚的地方或者认为我有写错的地方，欢迎评论区交流。
