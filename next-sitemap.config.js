/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://trend-scanner.com',
  generateRobotsTxt: false, // robots.txt는 이미 생성했으므로 false로 설정
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
  exclude: ['/admin/*'], // 관리자 페이지 제외
} 