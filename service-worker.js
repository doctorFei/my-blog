/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "ec0186bd345fd1d09a2c7127e2789fb3"
  },
  {
    "url": "assets/css/0.styles.48b128da.css",
    "revision": "d0e6bf7757a7d800332d242c93919f9f"
  },
  {
    "url": "assets/img/logo.png",
    "revision": "67d34b0decfd4d725d1c1f2eeadc4756"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.a7bc797a.js",
    "revision": "2e4dcb1c40ff0902b59bdfe090545afe"
  },
  {
    "url": "assets/js/11.2310ec6f.js",
    "revision": "30be7a79662827bcbed662ae33ae92ea"
  },
  {
    "url": "assets/js/12.74be65ee.js",
    "revision": "c47de30b5e221f29bd2a41a7eb41357c"
  },
  {
    "url": "assets/js/13.0c0d7a46.js",
    "revision": "db60bb982f66be0ee9ffaef3eca4cec4"
  },
  {
    "url": "assets/js/14.42cd1996.js",
    "revision": "f04c218f9b33f4397f49c6da8dbd42d3"
  },
  {
    "url": "assets/js/15.d9db4829.js",
    "revision": "411910e31444fba31678a8be4c72d1d9"
  },
  {
    "url": "assets/js/16.19fec63c.js",
    "revision": "71f286a29780eb5a71c030fd2767af3e"
  },
  {
    "url": "assets/js/17.e1318802.js",
    "revision": "857685c77724a19a7df9b46b2079e256"
  },
  {
    "url": "assets/js/18.fcf8b9e0.js",
    "revision": "95d5f34d62b90a64a92774fa638f0060"
  },
  {
    "url": "assets/js/19.ba8b7b9d.js",
    "revision": "52d2f31155b52ae20389b3ad16d4c34b"
  },
  {
    "url": "assets/js/2.9a1f826b.js",
    "revision": "e5d7e4e0d5736b6eceb2ea7d25848791"
  },
  {
    "url": "assets/js/3.824b3276.js",
    "revision": "5c035b9f6dba5132e54e7c352c3814ac"
  },
  {
    "url": "assets/js/4.6e387740.js",
    "revision": "a27b522661882fc0eeff49b96a71a00a"
  },
  {
    "url": "assets/js/5.87968e80.js",
    "revision": "3535602a3d7c94f7cd980ccded5ef11a"
  },
  {
    "url": "assets/js/6.72d314ae.js",
    "revision": "d1639673a54eb25819b48be90eb299d5"
  },
  {
    "url": "assets/js/7.ac323565.js",
    "revision": "9c5437d309b324666c78274c6fe9e68c"
  },
  {
    "url": "assets/js/8.4a78cb7e.js",
    "revision": "989cbf08df5a7102eaa5bc611c4cf418"
  },
  {
    "url": "assets/js/9.1d3ae902.js",
    "revision": "9711ce756ebdca028051787771c78bdd"
  },
  {
    "url": "assets/js/app.8b8b2b3a.js",
    "revision": "a100a428cfc08bc2e3d87ac281f3a2f8"
  },
  {
    "url": "icons/android-chrome-192x192.png",
    "revision": "f130a0b70e386170cf6f011c0ca8c4f4"
  },
  {
    "url": "icons/android-chrome-512x512.png",
    "revision": "0ff1bc4d14e5c9abcacba7c600d97814"
  },
  {
    "url": "icons/apple-touch-icon-120x120.png",
    "revision": "936d6e411cabd71f0e627011c3f18fe2"
  },
  {
    "url": "icons/apple-touch-icon-152x152.png",
    "revision": "1a034e64d80905128113e5272a5ab95e"
  },
  {
    "url": "icons/apple-touch-icon-180x180.png",
    "revision": "c43cd371a49ee4ca17ab3a60e72bdd51"
  },
  {
    "url": "icons/apple-touch-icon-60x60.png",
    "revision": "9a2b5c0f19de617685b7b5b42464e7db"
  },
  {
    "url": "icons/apple-touch-icon-76x76.png",
    "revision": "af28d69d59284dd202aa55e57227b11b"
  },
  {
    "url": "icons/apple-touch-icon.png",
    "revision": "66830ea6be8e7e94fb55df9f7b778f2e"
  },
  {
    "url": "icons/favicon-16x16.png",
    "revision": "4bb1a55479d61843b89a2fdafa7849b3"
  },
  {
    "url": "icons/favicon-32x32.png",
    "revision": "98b614336d9a12cb3f7bedb001da6fca"
  },
  {
    "url": "icons/msapplication-icon-144x144.png",
    "revision": "b89032a4a5a1879f30ba05a13947f26f"
  },
  {
    "url": "icons/mstile-150x150.png",
    "revision": "058a3335d15a3eb84e7ae3707ba09620"
  },
  {
    "url": "icons/safari-pinned-tab.svg",
    "revision": "f78c0251d6ddd56ee219a1830ded71b4"
  },
  {
    "url": "index.html",
    "revision": "95f9267cc91fe8889dbd84d5da6b6b20"
  },
  {
    "url": "iview-admin-pro/edit-tree.html",
    "revision": "631223df339b0cf250136103844a05c5"
  },
  {
    "url": "iview-admin-pro/index.html",
    "revision": "2415c00c98d62cdaeabeeb0fc576376b"
  },
  {
    "url": "javascript/index.html",
    "revision": "7bdb7efa802b9eeb32dd233384fa478c"
  },
  {
    "url": "javascript/js-1.html",
    "revision": "d048d38328bc829e1a39399bafed7898"
  },
  {
    "url": "Vue/index.html",
    "revision": "c6aad06ccb7b873c5cdcce5fd5163574"
  },
  {
    "url": "Vue/vue-1.html",
    "revision": "5f8e0be266b28151041e84eeb68ad0d6"
  },
  {
    "url": "Vue/vue-2.html",
    "revision": "1332b2a1ffebc5f283e4fd01a2b42a0e"
  },
  {
    "url": "Vue/vue-3.html",
    "revision": "2737aee519c11243f91b1c1ca4b55fea"
  },
  {
    "url": "Vue/vue-4.html",
    "revision": "cbd6d1f4781ccb35f0b46a93677b4bb8"
  },
  {
    "url": "Vue/vue-5.html",
    "revision": "de19036ce2bd0bd79f7fe740c3ae86e6"
  },
  {
    "url": "Vue/vue-6.html",
    "revision": "4d61b326d06448b63c308d547e756797"
  },
  {
    "url": "Vue/vue-7.html",
    "revision": "5648475ac4e5a928ef7a2a465321fab5"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
