# PachA Luz 展会宣传站

基于 Nuxt 4、Vue 3 和 TypeScript 的多语言展会宣传网站。支持静态预渲染 SEO、多组目录轮播、春节/圣诞主题、第三方社交与售票跳转。

## 开发

```sh
npm install
npm run dev
```

本地地址：`http://localhost:3000/zh-CN/`、`/en/`、`/es/`。

## 验证

```sh
npm test
npm run typecheck
npm run generate
```

静态产物位于 `.output/public`。

## 内容维护

```sh
# 扫描所有轮播图片与主题包并更新清单
npm run sync:content

# 测试、检查并生成可发布产物
npm run deploy:static
```

详细操作见 [docs/content-maintenance.md](docs/content-maintenance.md)，GitHub Pages 部署见 [docs/github-pages.md](docs/github-pages.md)，Nginx 示例见 [deploy/nginx/pachaluz.conf](deploy/nginx/pachaluz.conf)。
