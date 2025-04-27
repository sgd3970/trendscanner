/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://trend-scanner.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
  exclude: [
    '/admin/*',
    '/api/*',
    '/404',
    '/500',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/404',
          '/500',
        ],
      },
    ],
  },
}
