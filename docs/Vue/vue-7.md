# vue 性能优化

## 1、编码优化:

- 不要将所有的数据都放在 data 中, data 中的数据都会增加 getter 和 setter, 收对应的 watcher

- vue 在 v-for 时给每项元素绑定事件需要用事件代理

- SPA 页面采用 keep-alive 缓存组件

- 拆分组件( 提高复用性、增加代码的可维护性减少不必要的渲染 )

  ```html
  <template>
    <div>
      <ChildComp />
    </div>
  </template>
  <script>
    export default {
      components: {
        ChildComp: {
          methods: {
            heavy() {
              /* 耗时任务 */
            },
          },
          render(h) {
            return h("div", this.heavy());
          },
        },
      },
    };
  </script>
  ```

- v-if 当值为 false 时内部指令不会执行,具有阻断功能,很多情况下使用 v-if 替代 v-show

- 使用 v-show 复用 DOM

  ```html
  <template>
    <div class="cell">
      <!--这种情况用v-show复用DOM，比v-if效果好-->
      <div v-show="value" class="on"><Heavy :n="10000" /></div>
      <section v-show="!value" class="off"><Heavy :n="10000" /></section>
    </div>
  </template>
  ```

- key 保证唯一性(默认 vue 采用就地复用策略)

- v-for 遍历避免同时使用 v-if

  ```javascript
  <template>
  	<ul>
  		<liv-for="user in activeUsers" :key="user.id"> {{ user.name }} </li>
  	</ul>
  </template>
  <script>
  	export default {
  		computed: {
  			activeUsers: function() {
  				return this.users.filter(function(user) {
  					return user.isActive
  				})
  			}
  		}
  	}
  </script>
  ```

- object. freeze 冻结数据

- 合理使用路由懒加载、异步组件

  ```javascript
  const router = new VueRouter({
    routes: [{ path: "/foo", component: () => import("./Foo.vue") }],
  });

  components: {
    Addcustome: (resolve) => import(" ../components/Addcustomer");
  }
  ```

- 尽量采用 runtime 运行时版本

- 数据持久化的问题(防抖、节流)

## 2、vue 加载性能优化:

- 第三方模块按需导入(babel-plugin-component )

- 深动到可视区域动态加载(https://tangbc.github.io/vue-virtual-scroll-list)

- 图片馈加载(https://github.com/hilongiw/yue-lazdload.git)A3.

## 3、用户体验:

- app-skeleton 骨架屈

- app-shell app 壳

- pwa serviceworker

## 4、SEO 优化:

- 预渲染插件 prerender-spa-plugin

- 服务端渲染 ssr

## 5、打包优化:

- 使用 cdn 的方式加载第三方模块
- 多线程打包 happypack
- splitChunks 抽离公共组件
- sourceMap 生成

## 6、缓存、压缩

- 客户端缓存、服务端缓存

- 服务端 gzip 压缩
