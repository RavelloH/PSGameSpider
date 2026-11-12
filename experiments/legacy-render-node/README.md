# PSGameSpider · 原版 RenderBuild / Node.js 静态站点

GitHub Pages: https://ravelloh.github.io/PSGameSpider/

本项目发布版保留原版 `render-build@0.4.0`、`template/layout.html`、`index.ejs`、`item.ejs`、原有字体、CSS、Virgule 动画和 D3 图表；不使用 React/Shadcn，不压缩或省略游戏详情和价格历史。

## 自动部署

`../../.github/workflows/pages.yml` 在 `main` 更新、手动触发或原有 `update` 数据采集工作流成功结束后，自动生成并部署到 GitHub Pages。

为什么需要 `workflow_run`：旧 `update` 工作流用默认 `GITHUB_TOKEN` 推送数据，这类 Push 不会触发另一个普通 `push` Action。监听 `update` 完成即可覆盖定时数据更新。

流水线运行：

1. `npm ci` 并执行 `node --test model.test.mjs`。
2. `sync-assets.mjs` 取回原来博客中已公开的 UI CSS/JS/字体（不下载游戏封面）。
3. `prepare-data.mjs` 使用 Node.js 从仓库 `data/*-*.json` 生成最新分地区 JSONL。
4. `build.mjs --publish` 调用原始 render-build/EJS，生成全部五个地区的静态页面、地区搜索索引和详情页。
5. `smoke-pages.mjs` 核对所有地区索引、游戏详情页、图片 URL、静态搜索和脚本。
6. `configure-pages` → `upload-pages-artifact` → `deploy-pages`。

GitHub Pages 项目路径是 `/PSGameSpider/`；发布 HTML、资源链接和搜索结果链接均使用此路径。默认的 `serve.mjs` 仍可为原本 4173 本机预览服务。

## CDN 封面

商品封面来自现有不可变 URL：

```text
https://i.ravelloh.com/raw.githubusercontent.com/RavelloH/PSGameSpider/main/origin/images/<filename>.jpg?w=384&q=75
```

- 列表卡片通过 `srcset` 提供 128/256/384/640 宽度，按屏幕/卡片尺寸选择；默认 256。
- 详情页通过 `srcset` 提供 384/640/828/1080/1200 宽度；默认 828。
- 保留原版方形布局和 `psgs-cover-state.css/js` 的加载/失败占位。
- 搜索结果也使用相同图片代理；不再下载或生成本地 `mini` 目录。
- Cloudinary/Cloudflare 缓存由 `i.ravelloh.com` 服务管理，图片 URL 不变。

## 静态搜索

由于 GitHub Pages 不运行 Node.js API，发布模式将原版 `/api/search` 异步请求改为按地区加载 `/<region>/search-index.json`，输入搜索关键词后才加载，最多返回 80 条结果。原版搜索 UI、搜索节流和卡片动画继续使用相同模板。首次下载地区索引后，后续搜索在浏览器内完成。

本地原始预览仍支持 `/api/search`，不受发布模式影响。

## 本地构建

从仓库根目录：

```powershell
cd experiments/legacy-render-node
npm ci
npm test
npm run sync:assets
node prepare-data.mjs --output ../output/pages-data
node build.mjs --data ../output/pages-data --output ../output/pages-site --publish
node smoke-pages.mjs --dir ../output/pages-site
```

每次构建必须使用**不存在**的新输出目录；全部构建产物均位于 `experiments/output/`（gitignored）。

预览 `/PSGameSpider/` 子路径：

```powershell
node serve.mjs --root ../output/pages-site --port 4179 --base-path /PSGameSpider/
```

打开 `http://127.0.0.1:4179/PSGameSpider/en-us`。对照原版仍可使用之前的 `npm run serve`，监听 `127.0.0.1:4173`。

`render-build-layout.html` 是原版 render-build 完成 EJS 组件展开后的固定布局快照，保障 GitHub Actions 环境稳定，不依赖旧版静态布局 URL 在每次构建时都可用。原版字体/样式则通过 `sync-assets.mjs` 下载。

## 提示

- 此仓库公开发布的是原有公开游戏资料；图片服务仅允许 GitHub Raw 仓库指定目录。
- GitHub Actions 不需要 Cloudinary API 密钥，`i.ravelloh.com` 是公开图片转换 URL。
- 原版模板未更改，当前仅把适配逻辑保存在 `experiments/legacy-render-node`。
- 数据源是仓库中最近一次采集的状态，不应误认为实时商店报价。
