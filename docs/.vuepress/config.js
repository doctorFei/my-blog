const moment = require('moment');
moment.locale('zh-cn');

module.exports = {
  base: '/my-blog/',
  title: '雨巷的博客',
  description: '雨巷的博客',
  plugins: {
    '@vuepress/last-updated': {
      transformer: timestamp => moment(timestamp).fromNow("LLLL")
    },
    '@vuepress/pwa': {
      serviceWorker: true,
      updatePopup: {
        message: "发现新内容可用",
        buttonText: "Refresh"
      }
    },
    '@vssue/vuepress-plugin-vssue': {
      // 设置 `platform` 而不是 `api`
      platform: 'github-v4',

      // 其他的 Vssue 配置
      owner: 'doctorFei',
      repo: 'my-blog',
      clientId: '43291a5cabcd5f226a33',
      clientSecret: '8cc9fa1b23293b271d3846a43a87d4eb064a3f19',
      autoCreateIssue: true
    },
    '@vuepress/medium-zoom': {
      selector: 'img.zoom-custom',
      // medium-zoom options here
      // See: https://github.com/francoischalifour/medium-zoom#options
      options: {
        margin: 16
      }
    },
    "vuepress-plugin-auto-sidebar": {
      sidebarDepth: 2
    },
    '@vuepress/back-to-top': true
  },
  head: [
    ['link', { rel: 'icon', href: '/assets/img/favicon.ico' }],
    ['meta', { name: 'author', content: '雨巷的博客' }],
    ['meta', { name: 'keywords', content: '雨巷的博客' }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon-152x152.png' }],
    ['link', { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#3eaf7c' }],
    ['meta', { name: 'msapplication-TileImage', content: '/icons/msapplication-icon-144x144.png' }],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }]
  ],
  themeConfig: {
    logo: '/assets/img/logo.png',
    nav: [
      { text: '主页', link: '/' },
      { text: '组件库', link: '/iview-admin-pro/' },
      {
        text: '前端',
        ariaLabel: '前端',
        items: [
          { text: 'Vue', link: '/Vue/' },
          { text: 'Javascript', link: '/javascript/' }
        ]
      },
      {
        text: '工程化',
        items: [
          {
            text: 'Group1', items: [
              { text: 'Chinese', link: '/language/chinese/' },
              { text: 'Japanese', link: '/language/japanese/' }
            ]
          },
          {
            text: 'Group2', items: [
              { text: 'Chinese', link: '/language/chinese/' },
              { text: 'Japanese', link: '/language/japanese/' }
            ]
          }

        ]
      },
      { text: 'GitHub', link: 'https://github.com/doctorFei' }
    ]
  }
}