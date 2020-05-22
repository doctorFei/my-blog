module.exports = {
  title: '雨巷的博客',
  description: '雨巷的博客',
  head: [
    ['link', { rel: 'icon', href: '/assets/img/favicon.ico' }],
    ['meta', { name: 'author', content: '雨巷的博客' }],
    ['meta', { name: 'keywords', content: '雨巷的博客' }]
  ],
  themeConfig: {
    logo: '/assets/img/logo.png',

    nav: [
      { text: '主页', link: '/' },
      { text: 'deeplearn-admin', link: '/deeplearn-admin/' },
      { text: 'External', link: 'https://google.com' },
      {
        text: 'Languages',
        ariaLabel: 'Language Menu',
        items: [
          { text: 'Chinese', link: '/language/chinese/' },
          { text: 'Japanese', link: '/language/japanese/' }
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
      }
    ],
    sidebar: {
      '/deeplearn-admin/': [
        '',
        'common-tree',
        'edit-tree'
      ]
    }
  }
}