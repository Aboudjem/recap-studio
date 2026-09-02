<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-light.svg">
  <img alt="Recap Studio：任何主题，一个可以双击打开的文件" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg" width="100%">
</picture>

<p align="center">
  <a href="https://github.com/Aboudjem/recap-studio/releases"><img src="https://img.shields.io/github/v/tag/Aboudjem/recap-studio?color=5B9DFF&label=version&style=flat-square" alt="version"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-5B9DFF?style=flat-square" alt="License"></a>
  <a href="https://github.com/Aboudjem/recap-studio/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Aboudjem/recap-studio/ci.yml?style=flat-square&label=CI" alt="CI"></a>
  <a href="https://github.com/Aboudjem/recap-studio/stargazers"><img src="https://img.shields.io/github/stars/Aboudjem/recap-studio?style=flat-square&color=5B9DFF" alt="Stars"></a>
</p>

<p align="center">
  <a href="../README.md">English</a> ·
  <b>简体中文</b> ·
  <a href="ja.md">日本語</a> ·
  <a href="es.md">Español</a> ·
  <a href="fr.md">Français</a>
</p>

<p align="center"><b>把任何主题或一次编码会话变成一个深色、移动优先的讲解页面，双击即可打开。</b><br><sub>无需服务器，无需联网，没有依赖。</sub></p>

<p align="center">
  <a href="#它做什么">它做什么</a> ·
  <a href="#安装">安装</a> ·
  <a href="#开始使用">开始使用</a> ·
  <a href="#在你的编辑器里">在你的编辑器里</a> ·
  <a href="#了解更多">了解更多</a>
</p>

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

## 它做什么

你提出一个问题，或者刚结束一个提交零散的下午。你想要的只是一份稍后能读、也能发给同事的东西，不用登录，不用托管文档，也不用构建步骤。

Recap Studio 接收一个主题（`"Latest AI models"`）或一次编码会话（`git diff` 加提交记录），写出**一个 HTML 文件**。所有样式都内联，没有任何 JavaScript，页面也不发出任何外部请求。在访达或资源管理器里双击它，离线也能打开。

- **一个约五分钟读完的页面**：一句话的答案、真正重要的几点、内联 SVG 概念图、核心观点、常见误解、术语表和引用来源。
- **一个可以放进 CI 的评分**：围绕结构、引用、字数和密钥扫描的七项确定性检查。
- **一个可以直接发邮件的文件**：没有需要维护的服务器，也没有会失效的链接。

<img alt="渲染后的 Recap Studio 页面：深色头图、一句话答案，以及编号的五步阅读路径" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/page-preview.png" width="100%">

## 安装

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

`10x` 是一个插件市场，也就是 Claude Code 可以从中安装的一份清单。添加一次，`recap-studio` 和它的同类工具就都可用了。

对于其他任何智能体，四个技能通过 skills CLI 安装：

```bash
npx skills add Aboudjem/recap-studio
```

<details>
<summary>其他安装方式</summary>

```bash
# Pick the agent explicitly
npx skills add Aboudjem/recap-studio -a codex

# Or use the repo's own installer, which delegates to the same CLI
curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s codex

# --legacy copies the skills by hand, for machines without npx
bash install.sh codex --legacy
```

`install.sh --update` 更新已有安装，`install.sh --uninstall` 移除它。Windows 上从克隆目录运行 `install.ps1 <platform>`。
</details>

## 开始使用

**1. 请求一个页面。** 在任意 Claude Code 会话中：

```
/recap "What is React Server Components"
```

Recap Studio 会检索该主题，把每条论断与找到的来源核对，渲染页面并打开它。`/recap session` 对你最近一批提交做同样的事。

**2. 或者用已有内容渲染。** 从克隆目录使用 CLI：

```bash
pnpm install && pnpm -w build
node packages/cli/dist/index.js render fixtures/topics/latest-ai-models.json
```

```
recap: wrote latest-ai-models.html (49.8 KB, self-contained, double-click to open)
```

**3. 发出去之前先打个分。**

```bash
node packages/cli/dist/index.js validate fixtures/topics/latest-ai-models.json --fail-under 8
```

```
| Dimension          | Score  | Target | Status   | Top finding |
| facts              | 10/10 |  9 | PASS    | none |
| beginner           | 10/10 |  9 | PASS    | none |
| accessibility      | 10/10 |  9 | PASS    | none |

Overall: 9.7/10, thresholds PASSED
```

加上 `--json`，同一次运行会在标准输出上打印一个 JSON 文档，CI 任务可以用 `jq` 读取。

## 你会得到什么

| 产物 | 是什么 |
|:--|:--|
| `recap-<slug>.html` | 一个自包含页面。所有 CSS 内联，零 JavaScript，零外部请求。 |
| `--format md` 或 `txt` | 同一个页面的 Markdown 或纯文本文件，适合放进 PR 正文或提交说明。 |
| `--print` | 面向纸张的渲染：白底黑字，分页合理，来源 URL 完整写出。 |
| 一份验证报告 | 七个打分维度、一份阻断项清单和一个退出码。 |
| `--fail-under <score>` | 总分低于你设定的门槛时退出码为 1。无论分数多高，出现阻断项都会判定失败。 |

## 在你的编辑器里

可在 Claude Code、Cursor、Codex、Copilot、Gemini CLI 以及通过 `npx skills add` 接入的 70 多个其他智能体中使用。

| 智能体 | 一行安装 |
|:--|:--|
| Claude Code | `claude plugin install recap-studio@10x` |
| 70 多个智能体中的任意一个 | `npx skills add Aboudjem/recap-studio` |
| Codex、Gemini、OpenCode、Pi | `bash install.sh <agent>` |
| VS Code (Copilot) | `bash install.sh copilot` |
| 其他所有 | 见 [docs/editors.md](../docs/editors.md) |

<details>
<summary>改为作为 MCP 服务器添加</summary>

MCP 服务器在本地运行，因此需要先有一个构建过的克隆：

```bash
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
pnpm install && pnpm -w build
claude mcp add recap-studio node -- packages/mcp-server/dist/index.js
```

本仓库里没有 `.mcp.json`。Cursor、VS Code、Codex、Gemini CLI、Windsurf、Continue、OpenCode 和 Zed 各自需要同一条命令的不同写法；所有片段都在 [docs/editors.md](../docs/editors.md) 里。
</details>

## 需要知道的

> [!IMPORTANT]
> 所有副作用默认关闭。不发网络请求，不部署，不发邮件，不写入密钥，不执行破坏性 git 操作。`RECAP_STUDIO_FIXTURE_ONLY=1` 是初始状态，因此演示完全跑在固定数据上，没有任何东西外传。

- **生成的页面不含 JavaScript。** CI 每次推送都会核验：渲染出的 HTML 没有 `<script>` 标签，也没有 `/_next/` 引用。
- **评分是启发式检查，不是评审。** `validate` 运行七项确定性检查。它不抓取来源，也不调用模型。13 个专职智能体只在 Claude Code 中通过 `/recap` 运行。
- **73 个测试通过**，覆盖工作区的六个项目，在 Node 20 和 22 上运行。npm 上只有一个占位重定向包，所以 CLI 从克隆目录运行。

> [!CAUTION]
> 你可能在旧文档里看到的“9.7 分（满分 10 分）”来自那个启发式检查器，不是来自评审者。把它当作结构信号来读，而不是同行评审。

## 了解更多

- [编辑器配置](../docs/editors.md)，每个智能体和每段 MCP 配置
- [CLI 参考](../docs/cli.md)，每条命令和每个参数
- [常见问题](../docs/faq.md) 和 [对比](../docs/comparison.md)
- [架构](../docs/architecture.md)、[智能体系统](../docs/agent-system.md)、[安全与隐私](../docs/security-and-privacy.md)
- [更新日志](../CHANGELOG.md) 和 [参与贡献](../CONTRIBUTING.md)

---

<p align="center">
  <sub>由 <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> 构建 · MIT 许可证 · 无遥测</sub>
</p>

---

*本翻译由机器辅助生成。欢迎中文母语者提交 PR 修正和改进。最终以英文 README（[../README.md](../README.md)）为准。*
