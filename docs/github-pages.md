# GitHub Pages 部署

项目在推送到 `main` 分支时，由 `.github/workflows/deploy-pages.yml` 自动执行：

1. 使用 `npm ci` 安装锁定依赖。
2. 运行测试、类型检查、内容清单同步和 Nuxt 静态生成。
3. 上传 `.output/public`。
4. 部署到 GitHub Pages。

也可以在仓库的 **Actions → Deploy to GitHub Pages → Run workflow** 手动发布。

## GitHub 仓库设置

打开 **Settings → Pages**：

- Source 选择 **GitHub Actions**。
- Custom domain 填写 `pachaluz.com`。
- DNS 生效且证书签发后启用 **Enforce HTTPS**。

## DNS

根域名 `pachaluz.com` 添加以下 A 记录：

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

如需同时支持 `www.pachaluz.com`，添加：

```text
类型: CNAME
主机: www
目标: <GitHub用户名>.github.io
```

DNS 记录应以 GitHub 官方 Pages 文档的最新值为准。仓库已包含 `public/CNAME` 和 `public/.nojekyll`，生成后会自动进入部署产物。

## 发布前检查

- `public/content/site.json` 中的 `siteUrl` 为 `https://pachaluz.com/`。
- GitHub 仓库默认分支为 `main`；若不是，请同步修改工作流触发分支。
- `package-lock.json` 已提交，否则 `npm ci` 会失败。
- 仓库 Actions 权限允许 GitHub Pages 创建部署。
