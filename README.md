# 机械工程辩论队仓库 · hfutdf-site

个人维护的 Astro 静态资料网站。计划使用 GitHub Public 仓库，让后来的队员查看源码、通过 Issues 反馈问题、通过 Fork + PR 贡献改进。当前仅完成本地安全整改，尚未创建远程仓库或公开网站。

## 本地运行

使用 Node.js 24（验证版本 24.21.0）和 npm，在项目目录执行：

```powershell
npm ci
npm run verify
npm run build
npm run dev
```

开发默认地址 `http://127.0.0.1:4321/`，以终端为准，Ctrl+C 停止。静态预览：`npm run preview -- --port 4330`。安装只获取项目依赖，不连接云托管或发布服务。

## 内容与构建

生产内容仅从 `src/content/entries/` 读取，结构保持不变；目前没有获准资料，七大分类正常显示空状态。`tests/fixtures/` 仅含虚构测试示例，不参与网站内容加载，也不复制到 public 或 dist。

`config/publication.json` 是维护者批准的条目和静态文件清单，目前均为空。构建前会拒绝未批准文件、生产测试示例及比赛媒体/压缩包；直接启动 Astro 也执行检查。清单只是发布选择机制，不替代人工版权、隐私或备案审查。

真实资料不得放入 public；`.gitignore` 无法阻止静态复制。真实资料、原始验收日志、内部审计报告与旧截图在私有本地备份中，不是公开仓库的一部分。不要把它们补交来“修复”构建。

比赛记录栏目保留中性介绍，暂不提供播放、预览、下载或下载外链；原播放器源代码处于关闭状态。首页保留“宣言 → 目录 → 传承尾声”，不含比赛专题。不开发登录、评论、后台、数据库或在线投稿。

## 结构

```text
src/                     现有页面、组件、样式和内容 schema
src/content/entries/     经批准的生产内容，当前为空
public/                  经批准的静态文件，当前为空
config/publication.json  维护者批准清单
scripts/                 内容校验、构建和静态产物检查
tests/fixtures/          虚构测试数据，不进入生产
.github/                 Issue / PR 模板，无自动部署工作流
docs/PROJECT_BASELINE.md 可公开的需求摘要
```

设计原则见 [DESIGN.md](DESIGN.md)，贡献流程见 [CONTRIBUTING.md](CONTRIBUTING.md)，当前要求见 [公开需求摘要](docs/PROJECT_BASELINE.md)。详细内部安全证据保留在仓库之外。

## 许可与发布

维护者有权授权的原创代码采用 [MIT](LICENSE)，署名 `HyperDeem`；排除范围见 [LICENSE_SCOPE.md](LICENSE_SCOPE.md)。该许可不覆盖第三方资料、商标和设计规范。`private: true` 防止 npm 误发布，与 GitHub Public 计划无关。

创建 GitHub 仓库、添加 remote、首次 push、CloudBase 购买与连接、域名绑定、自动部署和网站公开均需维护者另行批准。本地默认分支为 `main`，保留已脱敏的提交历史；当前没有任何 remote。
