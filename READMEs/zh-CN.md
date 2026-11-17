<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-light.svg">
  <img alt="Recap Studio：一个可以发邮件、附到 PR 或在飞机上读的页面。图片展示 40 个提交变成一个页面，并附上真实的一行 Verdict: PASS, 49.8 KB, 0 script tags, 9.7/10。" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg" width="100%">
</picture>

<p align="center">
  <a href="https://github.com/Aboudjem/recap-studio/releases"><img src="https://img.shields.io/github/v/tag/Aboudjem/recap-studio?color=5B9DFF&label=version&style=flat-square" alt="version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-5B9DFF?style=flat-square" alt="License"></a>
  <a href="https://github.com/Aboudjem/recap-studio/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Aboudjem/recap-studio/ci.yml?style=flat-square&label=CI" alt="CI"></a>
</p>

<p align="center">
  <a href="../README.md">English</a> ·
  <b>简体中文</b> ·
  <a href="ja.md">日本語</a> ·
  <a href="es.md">Español</a> ·
  <a href="fr.md">Français</a>
</p>

**用一个可以发送的页面，看懂改了什么。**

Recap Studio 用你的编码会话或一个主题生成一个 HTML 页面。

| 看懂做了什么 | 一个可发送的页面 | 发送前已检查 |
|:--|:--|:--|
| `/recap session` 读取你的 git diff 和提交，然后写出一个页面。 | 一个 HTML 文件，0 个 script 标签，CSS 全在文件里。下面的演示会打印这两项。 | 七项检查不用模型给页面打分；`--fail-under 8` 会拒绝弱页面。 |

**兼容：** 任何能读取 skills 的智能体，以及任何 MCP 客户端（已测试：Claude Code、Codex CLI）。生成页面不需要模型；写作用的是你的智能体的模型。

现在就试试。你只需要 Node 20 或更高版本。

```bash
npx -y github:Aboudjem/recap-studio demo
```

2026-11-17 的真实输出，路径已缩短：

```text
Verdict: PASS. Wrote /tmp/try/recap-latest-ai-models.html
Page: 49.8 KB, 0 script tags, all CSS inlined. Score: 9.7/10, 0 blocker(s).

Next:
- Open the file with a double-click. It works offline.
- Make your own: `npx -y github:Aboudjem/recap-studio example -o content.json`, edit it, then `npx -y github:Aboudjem/recap-studio render content.json`.
- Score it before you send it: `npx -y github:Aboudjem/recap-studio validate content.json --fail-under 8`.
```

<img alt="Recap Studio 生成的页面：深色顶部横幅、一句话答案、五步阅读路径" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/page-preview.png" width="100%">

**它是什么：** 一个把你的编码会话或一个主题变成一个 HTML 页面的工具。

**什么时候用：** 有人问这周改了什么，或者某个主题是什么意思。

**你会得到：** 一个可以发邮件或附到拉取请求的文件。它离线打开，没有 JavaScript，也没有网络请求。

分数检查的是形式，不是真假，所以分享前请先读来源。

## 安装

**选择你的智能体。** 每条命令都会为你的所有项目安装。

[![Claude Code](https://img.shields.io/badge/Claude_Code-D97757?style=for-the-badge&logo=claude&logoColor=white)](#claude-code) [![Codex](https://img.shields.io/badge/Codex-000000?style=for-the-badge)](#codex) [![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)](#cursor) [![Gemini CLI](https://img.shields.io/badge/Gemini_CLI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](#gemini-cli) [![GitHub Copilot](https://img.shields.io/badge/GitHub_Copilot-24292F?style=for-the-badge&logo=githubcopilot&logoColor=white)](#github-copilot) [![OpenCode](https://img.shields.io/badge/OpenCode-333333?style=for-the-badge&logo=opencode&logoColor=white)](#opencode)

### Claude Code

已测试。插件、技能和 MCP 服务器。

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

然后在任意项目中输入 `/recap "What is React Server Components"`。

### Codex

已测试：MCP 调用。技能：已测试安装。

```bash
npx skills add Aboudjem/recap-studio -g -a codex -y
```

### Cursor

已测试安装。

```bash
npx skills add Aboudjem/recap-studio -g -a cursor -y
```

### Gemini CLI

已测试安装。

```bash
npx skills add Aboudjem/recap-studio -g -a gemini-cli -y
```

### GitHub Copilot

已测试安装。

```bash
npx skills add Aboudjem/recap-studio -g -a github-copilot -y
```

### OpenCode

已测试安装。

```bash
npx skills add Aboudjem/recap-studio -g -a opencode -y
```

只装到当前项目：去掉 `-g`。其他智能体：把它的名字放在 `-a` 后面。

**只用 CLI。** 不需要智能体。它从 GitHub 运行，而不是 npm：

```bash
npx -y github:Aboudjem/recap-studio render content.json
```

**MCP 客户端**（通过 Model Context Protocol 调用工具的应用）。把下面内容粘贴到它的 MCP 配置中：

```json
{
  "mcpServers": {
    "recap-studio": {
      "command": "npx",
      "args": ["-y", "github:Aboudjem/recap-studio", "mcp"]
    }
  }
}
```

Claude Code 插件会自动启动这个服务器。每个编辑器的配置见 [docs/editors.md](../docs/editors.md)。

<details>
<summary>其他安装方式</summary>

```bash
# This project only, for the agents the skills CLI finds
npx skills add Aboudjem/recap-studio

# The repo's own installer, which calls the same skills CLI
curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s codex

# From a clone, with no network after the clone
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
node bin/recap.mjs demo
```

每个版本还附带 `recap-studio.mcpb`，这是给支持安装 bundle 的 MCP 客户端准备的单文件包。
</details>

## 工作原理

1. 你提出请求。`/recap "<topic>"` 研究一个主题。`/recap session` 读取你的 git diff 和提交。
2. 智能体撰写内容。13 个专职智能体查找来源，写出五分钟阅读路径，并核对每条论断。
3. 智能体把内容以 JSON 保存到你项目中的 `artifacts/<slug>/content.json`。
4. 检查器打分。七项固定检查，每次给出相同分数：结构、引用、字数、密钥扫描。不用模型，不联网。
5. 渲染器写出一个文件 `artifacts/<slug>/recap-<slug>.html`。所有 CSS 都内联。

CLI 和 MCP 服务器是同一个已提交的文件 `bin/recap.mjs`，没有任何依赖。

| 运行的部分 | 副作用 |
|:--|:--|
| 技能和智能体 | 在你项目的 `artifacts/` 下写文件。研究使用你的智能体自带的网页搜索（如果有）。 |
| CLI 和 MCP 服务器 | 写出你要求的页面。不联网。共 11 个 MCP 工具，列在 [docs/mcp-tools.md](../docs/mcp-tools.md)。 |
| 插件钩子 | 只在会话运行于 recap-studio 项目中时生效（见常见问题）。在那里它们阻止破坏性 git 操作和未经检查的部署。它们还阻止写入和编辑密钥文件。范围包括 `.env` 和 `.env.*`，以及 `secrets/` 或 `private/` 下的一切。还包括 SSH 密钥（`id_rsa`、`id_ed25519`、`id_ecdsa`、`id_dsa`，带或不带 `.pub`）以及 `.pem`、`.p12`、`.pfx`、`.keystore` 和 `.key` 文件。 |
| 部署和邮件 | 插件从不执行。MCP 部署工具返回一条命令，邮件工具返回草稿。 |

## 你会得到什么

| 输出 | 说明 |
|:--|:--|
| `recap-<slug>.html` | 一个文件里的一个页面。CSS 全在文件里，零 JavaScript，零外部请求。 |
| `--format md` 或 `txt` | 同一页面的 Markdown 或纯文本版本，可用于 pull request 或笔记。 |
| `--print` | 打印版：白底黑字，写出来源 URL。 |
| `recap validate` | 报告先给结论，再列最多三条修改建议，然后是七个评分维度。 |
| `--fail-under <score>` | 低于你的阈值时退出码为 1。只要有阻断项，无论分数多少都会失败。 |

## 兼容的智能体

| Agent | 测试内容 | Tested |
|:--|:--|:--|
| Claude Code 2.1.326 | 用 `--plugin-dir` 加载插件；在无关文件夹中其 MCP 服务器显示 `Connected` | 2026-11-17 |
| Codex CLI 0.169.0 | `codex exec` 调用了 MCP 工具 `validate_content` 并返回结论 | 2026-11-17 |
| Codex, Gemini CLI, OpenCode, Cursor, GitHub Copilot | `npx skills@1.9.0 add -g` 把五个技能复制到 `~/.agents/skills/`，对所有项目生效 | 2026-11-17 |

有文档但未测试：Windsurf、Continue、Zed，以及 skills CLI 支持的其他智能体。配置示例见 [docs/editors.md](../docs/editors.md)。

## Proof

下面每个数字都来自你可以在克隆中运行的命令。

| 论断 | 数字 | 命令 |
|:--|:--|:--|
| 通过的测试 | 115 | `npm run test:count` |
| 渲染页面中的 script 标签 | 0 | `node bin/recap.mjs demo` |
| 演示页面大小 | 49.8 KB | `node bin/recap.mjs demo` |
| 演示内容的分数 | 9.7/10 | `node bin/recap.mjs validate fixtures/topics/latest-ai-models.json` |
| MCP 工具 | 11 | `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \| node bin/recap.mjs mcp` |

CI 在每次 push 和 pull request 时于 Node 20 和 22 上运行测试。渲染页面中出现 `<script>` 标签也会导致失败。

## FAQ

**使用它需要 Claude Code 吗？**
不需要。CLI 和 MCP 服务器在任何能运行 Node 20 的地方都能用。Claude Code 额外提供 `/recap` 背后的研究智能体。

**打开页面时它会联网吗？**
不会。页面没有 JavaScript，也没有需要加载的外部链接。CI 会检查每次渲染中是否有 `<script>` 标签。

**9.7/10 的分数是模型给的吗？**
不是。它是针对结构、引用和字数的一组固定检查，每次给出相同分数。它不会读取来源。

**钩子会影响我的其他项目吗？**
不会。它们看的是会话的工作文件夹，而不是被编辑文件所在的文件夹。只有当该文件夹或其上级含有 `recap-studio.config.*` 文件或 `.recap-studio/` 文件夹，或者就是本仓库时，它们才生效。设置 `RECAP_HOOKS_EVERYWHERE=1` 可在所有地方启用。

**为什么不把 CLI 发布到 npm？**
没有必要。CLI 是一个没有依赖的单文件，所以 `npx -y github:Aboudjem/recap-studio` 可以直接运行它。

## Limits

- 分数是粗略检查（启发式）。它检查形式，不检查真伪。分享页面前请阅读来源。
- 研究质量取决于你的智能体。CLI 只渲染你提供的内容，不做研究。
- 离线时，Mermaid 图（用文字写的图表）只显示为文字。请改用 SVG 图：`kind: "svg"`。
- 五个 MCP 工具不做完整的工作（只是占位）。`render_page_screenshot`、`run_accessibility_scan` 和 `run_lighthouse_summary` 返回 `skipped`：服务器不附带浏览器。
- 部署和邮件工具从不部署或发送。`deploy_vercel_preview` 返回一条由你自己运行的 shell 命令。`send_email_draft` 返回一份可粘贴到邮件客户端的草稿。
- Codex 可能会阻止写入类工具。在一次 `codex exec` 运行中，它的审批检查阻止了 `render_recap_html`。读取类工具正常。

## 了解更多

- [编辑器设置](../docs/editors.md)、[CLI 参考](../docs/cli.md)、[MCP 工具](../docs/mcp-tools.md)
- [FAQ](../docs/faq.md) 和 [对比](../docs/comparison.md)
- [架构](../docs/architecture.md)、[智能体系统](../docs/agent-system.md)、[安全与隐私](../docs/security-and-privacy.md)
- [Changelog](../CHANGELOG.md) 和 [贡献指南](../CONTRIBUTING.md)

---

<p align="center">
  <sub>作者 <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> · MIT 许可证 · 无遥测</sub>
</p>

---

*本翻译由机器辅助生成。欢迎中文母语者提交 PR 修正和改进。最终以英文 README（[../README.md](../README.md)）为准。*
