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

资料从 `src/content/entries/*.md` 读取，使用现有 schema 校验标题、分类、日期和资源地址。`status: published` 的条目出现在对应分类；空目录与有资料的目录均可构建，不需要批准清单或模拟标记。

资源可以引用 `public/` 下的站内文件，或 `https://files.hfutdf.top` 上的 COS 文件。照片通过 images 数组组织，可用 archive_url 下载整册 ZIP。站长在上传中控确认后直接生成 Markdown、验证构建并提交发布。

构建检查只验证资料结构、资源路径和生成页面的链接，不进行内容审批。首页、分类和相册布局沿用现有实现。

## 结构

```text
src/                     现有页面、组件、样式和内容 schema
src/content/entries/     Markdown 资料条目
public/                  站内静态资源
scripts/                 内容校验、构建和静态产物检查
.github/                 Issue / PR 模板与既有自动部署工作流
docs/PROJECT_BASELINE.md 可公开的需求摘要
```

设计原则见 [DESIGN.md](DESIGN.md)，贡献流程见 [CONTRIBUTING.md](CONTRIBUTING.md)，当前要求见 [公开需求摘要](docs/PROJECT_BASELINE.md)。详细内部安全证据保留在仓库之外。

## 许可与发布

维护者有权授权的原创代码采用 [MIT](LICENSE)，署名 `HyperDeem`；排除范围见 [LICENSE_SCOPE.md](LICENSE_SCOPE.md)。该许可不覆盖第三方资料、商标和设计规范。`private: true` 防止 npm 误发布，与 GitHub Public 计划无关。

创建 GitHub 仓库、添加 remote、首次 push、CloudBase 购买与连接、域名绑定、自动部署和网站公开均需维护者另行批准。本地默认分支为 `main`，保留已脱敏的提交历史；当前没有任何 remote。
