# 展会内容维护手册

本项目使用 Nuxt 预渲染（SSG）。线上服务器只需托管 `.output/public`，不需要 Node.js 常驻进程。页面 HTML 在发布时生成，因此内容变更后应重新执行生成并发布，但不需要修改 Vue/TypeScript 业务代码。

## 一次性配置

编辑 `public/content/site.json`：

- `siteUrl`：正式域名，必须以 `https://` 开头；canonical、hreflang、sitemap 都依赖此值。
- `event`：展会日期、地点与坐标，用于页面和搜索引擎结构化数据。
- `socialLinks` / `ticketLinks`：第三方社交与售票地址。设置 `enabled: false` 可暂时隐藏。
- `defaultLocale` / `defaultTheme`：默认语言和主题。

发布前必须把示例域名 `https://pachaluz.example/` 替换为正式域名。

## 修改三语文案

每种语言独立维护：

- `public/content/locales/zh-CN.json`
- `public/content/locales/en.json`
- `public/content/locales/es.json`

三个文件应保持相同结构。`seo` 控制搜索标题与摘要，`carouselAlts` 为图片提供无障碍替代文本。

## 增删轮播图片

每个轮播组是 `public/content/carousels` 下的一个目录：

```text
carousels/
  hero/
    images/
      hero-01.webp
      hero-02.webp
  gallery/
    images/
      gallery-01.avif
```

支持 AVIF、WebP、PNG、JPG、GIF 和 SVG。文件按自然顺序轮播，推荐使用 `01`、`02` 等编号。新增或删除文件后执行：

```bash
npm run sync:content
```

脚本会自动生成 `public/content/carousels/manifest.json`，无需手动维护图片数量。新增图片后，请在三个语言文件的 `carouselAlts` 中添加 `<轮播组>.<文件名>` 文案。

## 新增或切换主题

主题包目录结构：

```text
themes/
  my-theme/
    theme.json
    theme.css
```

`theme.json` 示例：

```json
{
  "id": "my-theme",
  "label": "My Theme",
  "stylesheet": "/content/themes/my-theme/theme.css"
}
```

主题样式应以 `:root[data-theme="my-theme"]` 为作用域并覆盖 CSS 变量。随后：

1. 将主题 ID 加入 `site.json` 的 `themes`。
2. 在三个语言文件的 `themeNames` 中加入显示名称。
3. 执行 `npm run sync:content`。

## 验证与发布

推荐使用统一命令：

```bash
npm ci
npm run deploy:static
```

该命令依次运行测试、类型检查、资源扫描与静态生成。将 `.output/public/` 的全部内容同步到静态服务器。

若只替换了同名图片，可以直接覆盖线上文件；但为保证缓存、HTML 中的图片信息和社交分享内容一致，仍建议执行完整生成发布。

## 缓存建议

- HTML、JSON、XML：短缓存或 `no-cache`，允许浏览器使用 ETag。
- `/_nuxt/`：文件名带内容哈希，可设置一年 `immutable`。
- 图片与主题 CSS：建议通过发布流程刷新；若长期缓存，应改文件名而不是覆盖同名文件。
- 每次发布后检查 `/robots.txt`、`/sitemap.xml` 和三个语言首页。
