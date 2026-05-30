<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/logo-light.svg">
  <img alt="Recap Studio" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/logo-light.svg" width="100%">
</picture>

<p align="center">
  <a href="https://github.com/Aboudjem/recap-studio/releases"><img src="https://img.shields.io/github/v/tag/Aboudjem/recap-studio?color=7C5CFF&label=version&style=flat-square" alt="version"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-7C5CFF?style=flat-square" alt="License"></a>
  <a href="https://github.com/Aboudjem/recap-studio/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Aboudjem/recap-studio/ci.yml?style=flat-square&label=CI" alt="CI"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%E2%89%A520-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node"></a>
  <a href="https://github.com/Aboudjem/10x"><img src="https://img.shields.io/badge/10x-marketplace-7C5CFF?style=flat-square" alt="10x marketplace"></a>
  <a href="https://github.com/Aboudjem/recap-studio/stargazers"><img src="https://img.shields.io/github/stars/Aboudjem/recap-studio?style=flat-square&color=7C5CFF" alt="Stars"></a>
</p>

<p align="center"><b>把任何主题或编码会话变成一份美观、暗色模式、移动优先的讲解页，双击即可打开。无需服务器，无需联网，无需任何依赖。</b></p>

<p align="center">
  <sub>自包含离线 HTML · 无衬线 Inter 字体 · 内联 SVG 图示 · 零 JavaScript</sub>
</p>

<p align="center">
  <a href="../README.md">English</a> ·
  <b>简体中文</b> ·
  <a href="ja.md">日本語</a> ·
  <a href="es.md">Español</a> ·
  <a href="fr.md">Français</a>
</p>

<p align="center">
  <a href="#这是什么">这是什么</a> ·
  <a href="#三步上手">三步上手</a> ·
  <a href="#在-claude-code-中">在 Claude Code 中</a> ·
  <a href="#在任意环境-cli">在任意环境（CLI）</a> ·
  <a href="#常见问题">常见问题</a> ·
  <a href="#对比">对比</a> ·
  <a href="#为何值得信任">为何值得信任</a> ·
  <a href="../docs/architecture.md">文档</a>
</p>

<picture>
  <img alt="A real Recap Studio page: dark-mode hero with a gradient headline 'Latest AI models', a one-sentence answer, and a numbered five-step reading path. Calm, premium, mobile-first." src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/page-preview.png" width="100%">
</picture>

### 实际效果

一次真实的 `/recap "what is creatine"` 运行：实时检索，每条论断都对照权威一手来源（ISSN、NIH）核查，然后渲染成一份自包含的页面：

![recap-studio demo](https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/demo.gif)

<sub>一份关于肌酸的 Recap Studio 生成页的动画演示：暗色模式大标题、一张内联 SVG 能量循环图、图标式要点卡片，以及一份引用 NIH 和 ISSN 的来源清单。</sub>

---

## 这是什么

Recap Studio 接收一个主题（`"Latest AI models"`）或一次编码会话（`git diff` + 提交记录），生成**一个自包含的 HTML 文件**：暗色模式、移动优先，包含一个大标题答案、要点卡片、一张内联 SVG 概念图、一条时间线、一张对比表、常见误区、术语表，以及带引用的来源。

**别的工具都没有的杀手锏：** 产物是一个 `.html` 文件，所有样式内联，零 JavaScript，零外部请求。在访达（Finder）或资源管理器里双击它，就能完美打开，无需 Wi-Fi、无需服务器、无需 `npm install`。

页面上你会得到：

| 区块 | 用途 |
| --- | --- |
| 大标题 | 一句话答案，而不是营销式开场白 |
| 重点所在 | 三条要点，大字号，置于首屏 |
| 概念图 | 内联 SVG 图示，绝非装饰 |
| 核心要点 | 四到七张简短卡片 |
| 时间线 | 仅在真实存在时序时出现 |
| 对比 | 桌面端为表格，移动端为堆叠卡片 |
| 示例 + 类比 | 先具体，后抽象 |
| 常见误区 | 误解在左，真相在右 |
| 术语表 | 通俗易懂的定义，默认折叠 |
| 行动要点 | 今天就能上手去做的事 |
| 来源 | 每条论断都链接到一个 `sourceMap` 条目 |

---

## 三步上手

**1. 从 [10x marketplace](https://github.com/Aboudjem/10x) 安装插件：**

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

**2. 打开任意 Claude Code 会话并运行：**

```
/recap "What is React Server Components"
```

**3. 一份自包含的 `recap-<slug>.html` 会在你的浏览器中打开。完成。**

> [!NOTE]
> 任何东西都不会向外发送数据。试用无需任何付费 API key。`RECAP_STUDIO_FIXTURE_ONLY=1` 是默认值，因此演示完全基于内置 fixture 运行。

---

## 在 Claude Code 中

通过 10x marketplace 安装一次（见上文）。然后在任意 Claude Code 会话中使用这些命令：

| 命令 | 作用 |
| --- | --- |
| `/recap "<topic>"` | 从任意主题构建一份完整的讲解页 |
| `/recap session` | 从 `git diff` + 提交记录复盘一次编码会话 |
| `/recap session --deep` | 同上，附带逐文件深入的折叠面板 |
| `/recap setup` | 创建带安全默认值的 `recap-studio.config.ts` |
| `/recap validate` | 重新为当前页面打分（启发式检查，见下文） |

每次运行后，技能会渲染自包含的 HTML、打开它，然后询问「Deploy to Vercel?」**仅当你已配置 Vercel，且仅在你明确回答 yes 时。**

> [!TIP]
> `10x` 是位于 [github.com/Aboudjem/10x](https://github.com/Aboudjem/10x) 的插件市场。它让你无需克隆本仓库即可安装 Recap Studio（以及其他工具）。

---

## 将技能安装到任意 AI CLI

Claude Code 是头等宿主（通过上文的 10x marketplace）。若要把四个 `/recap` 技能直接加载到另一个 CLI 中，运行这行安装脚本。它会把 `recap-topic`、`recap-session`、`recap-setup` 和 `recap-validate` 软链到该 CLI 的 skills 目录；`--update` 拉取最新版并重新链接，`--uninstall` 移除它们。

```bash
curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s codex
```

在 Windows 上，从一个检出（checkout）中运行 `install.ps1 <platform>`（创建软链需要开发者模式或管理员 shell）。

| 平台 | Skills 目录 | 一行命令 |
|:--|:--|:--|
| Claude Code | （插件） | `claude plugin install recap-studio@10x` |
| Codex / Gemini / OpenCode / Pi | `~/.agents/skills` | `install.sh codex` |
| VS Code (Copilot) | `~/.copilot/skills` | `install.sh copilot` |
| Trae | `~/.trae/skills` | `install.sh trae` |
| Vibe | `~/.vibe/skills` | `install.sh vibe` |
| OpenClaw | `~/.openclaw/skills` | `install.sh openclaw` |
| Antigravity | `~/.gemini/antigravity/skills` | `install.sh antigravity` |
| Hermes / Cline / Kimi | `~/.<cli>/skills` | `install.sh hermes` |

各 CLI 的 skills 目录约定会随版本变化。如果链接无法解析，回退到可选的本地 MCP 服务器（它在任何支持 MCP 的客户端中都可用）。运行 `install.sh all` 可一次链接所有平台。添加 MCP 服务器前，先用 `pnpm -w build` 构建一次。

<details>
<summary><b>Claude Code</b></summary>

通过 [10x marketplace](https://github.com/Aboudjem/10x) 一条命令安装插件：

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

或仅添加本地 MCP 服务器（在 `pnpm -w build` 之后）：

```bash
claude mcp add recap-studio node -- packages/mcp-server/dist/index.js
```
</details>

<details>
<summary><b>Cursor</b></summary>

添加到 `~/.cursor/mcp.json`（在 `pnpm -w build` 之后）：

```json
{ "mcpServers": { "recap-studio": { "command": "node", "args": ["packages/mcp-server/dist/index.js"] } } }
```
</details>

<details>
<summary><b>VS Code (Copilot)</b></summary>

添加到 `.vscode/mcp.json`（在 `pnpm -w build` 之后）：

```json
{ "servers": { "recap-studio": { "type": "stdio", "command": "node", "args": ["packages/mcp-server/dist/index.js"] } } }
```
</details>

<details>
<summary><b>Codex CLI</b></summary>

```bash
codex mcp add recap-studio -- node packages/mcp-server/dist/index.js
```
</details>

<details>
<summary><b>Gemini CLI</b></summary>

添加到 `~/.gemini/mcp_config.json`（在 `pnpm -w build` 之后）：

```json
{ "mcpServers": { "recap-studio": { "command": "node", "args": ["packages/mcp-server/dist/index.js"] } } }
```
</details>

<details>
<summary><b>Windsurf</b></summary>

添加到 `~/.codeium/windsurf/mcp_config.json`（在 `pnpm -w build` 之后）：

```json
{ "mcpServers": { "recap-studio": { "command": "node", "args": ["packages/mcp-server/dist/index.js"] } } }
```
</details>

<details>
<summary><b>Continue.dev</b></summary>

添加到 `.continue/mcpServers/recap-studio.yaml`（在 `pnpm -w build` 之后）：

```yaml
mcpServers:
  recap-studio: { command: node, args: ["packages/mcp-server/dist/index.js"], type: stdio }
```
</details>

每个编辑器的复制粘贴配置以及对应的冒烟测试，详见 [`docs/multi-editor.md`](../docs/multi-editor.md)。

---

## 在任意环境（CLI）

当你在 Claude Code 之外时使用 CLI：在任意终端、任意编辑器、CI 或定时任务中。

**安装：**

```bash
# 今天就能用，从本仓库的克隆开始：
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
pnpm install && pnpm -w build
node packages/cli/dist/index.js render content.json

# 计划中：一旦 @recap-studio/cli 发布到 npm，下面这行就能一步到位。
# 目前它还没在 npm 上，所以请先用上面的克隆方式：
# npx @recap-studio/cli render content.json
```

**命令：**

| 命令 | 作用 |
| --- | --- |
| `recap render <content.json>` | 从一个内容 JSON 渲染出自包含的 HTML 文件 |
| `recap render <content.json> -o out.html` | 写入指定的输出路径 |
| `recap render <content.json> --theme dark\|light\|auto` | 选择配色主题（默认：dark） |
| `recap validate <content.json>` | 校验内容结构，并以状态码 0/2 退出 |

**从工作区根目录运行（如果你克隆了仓库）：**

```bash
pnpm -w render              # render the demo content
pnpm -w render:demo         # write artifacts/<slug>/recap-<slug>.html
pnpm -w demo:latest-ai-models && pnpm --filter recap-web dev
```

> [!NOTE]
> `pnpm -w` 意为「从工作区根目录运行」；这是 monorepo 脚本的调用方式。只有在你克隆了本仓库时才需要它。`@recap-studio/cli` 还没发布到 npm，所以上面的克隆方式是目前运行它的途径。一旦发布，`npx @recap-studio/cli` 就能无需克隆直接运行。

**其他工作区脚本：**

| 命令 | 作用 |
| --- | --- |
| `pnpm -w validate:demo` | 为当前页面打分（启发式检查） |
| `pnpm -w history` | 列出 `artifacts/` 中每一份带分数的 recap |
| `pnpm -w auto-refresh -- <slug>` | 按需重新校验一份已存储的 recap |
| `pnpm --filter recap-web dev` | 在 localhost:3000 预览（托管的 Next.js 轨道） |
| `pnpm --filter recap-web build` | 构建托管的静态站点 |
| `pnpm deploy:preview` | Vercel 预览部署（受配置 + 环境变量门控） |
| `pnpm deploy:prod` | Vercel 生产部署（双重门控） |

---

## 常见问题

**这个 HTML 真的是自包含的吗？**
是的。所有 CSS 都内联了。零 JavaScript，零 `/_next/` 或 CDN 引用。已验证：0 个外部引用，在飞机上也能通过 `file://` 打开。

**没有网络连接也能用吗？**
渲染方面：可以，完全离线。至于完整的 LLM agent 检索流水线（在 Claude Code 内部），可以，它使用你本地的 Claude Code 会话，而不是某个由你管理的外部 API。

**这个「分数」是什么？**
`recap validate` 运行一项快速、确定性的启发式检查，扫描结构、引用是否齐备、字数，以及已知的质量信号。它**不会**抓取来源或运行 LLM。完整的 LLM agent 评审（13 个 agent，7 个维度）只在你于 Claude Code 内使用 `/recap` 时运行。这一点在输出中会明确说明。

**我能在 VS Code、Cursor 或 Codex 中用它吗？**
可以。MCP 服务器（`@recap-studio/mcp-server`）暴露了一个 `render_recap_html` 工具，而 `recap` CLI 在任意终端都可用。MCP 传输符合规范（`content` 类型为 `"text"`，并处理 `notifications/initialized` + `ping`），且有单元测试。面向 Claude Code、Cursor、VS Code、Codex、Gemini、Windsurf 和 Continue 的复制粘贴配置，以及各自的冒烟测试，详见 [`docs/multi-editor.md`](../docs/multi-editor.md)。

**它会自动部署到任何地方吗？**
不会。部署默认为 `disabled`。只有当你配置了 Vercel 并在提示时给出明确同意，它才会部署。

**有托管的网页版吗？**
有，通过 Next.js 轨道（`pnpm --filter recap-web dev`）。托管轨道与离线单文件轨道，在不同的渲染表面上产出相同的内容。

---

## 对比

| 特性 | Recap Studio | Notion AI | Gamma | Mintlify | 纯 markdown |
| --- | :---: | :---: | :---: | :---: | :---: |
| 自包含离线 HTML | **YES** | No | No | No | No |
| 暗色模式、移动优先 | **YES** | Partial | Partial | Yes | No |
| 内联 SVG 概念图 | **YES** | No | No | No | No |
| 零 JavaScript 产物 | **YES** | No | No | No | Yes |
| 无需服务器即可运行 | **YES** | No | No | No | Yes |
| 每条论断都有引用来源 | **YES** | No | No | No | No |
| 从 git diff 复盘会话 | **YES** | No | No | No | No |
| Claude Code 之外的 CLI（`npx`） | **YES** | No | No | No | n/a |
| 本地运行免费 | **YES** | Freemium | Freemium | Freemium | Yes |

真正关键的一行：**自包含离线 HTML**。没有任何其他讲解或变更日志工具，能产出一个所有样式内联、无外部依赖、可双击打开的文件。

---

## 为何值得信任

- **43 项测试通过**，覆盖 5 个含测试的包。构建为绿色。CI 在每次推送时运行。
- **两个端到端用例已验证**：主题讲解页（`fixtures/topics/latest-ai-models.json`）与会话复盘（`session.json`，对本代码库重建的一次复盘）。两者都能渲染成经校验的自包含 HTML。
- **诚实的打分**：来自 `validate` 的启发式分数是确定性的，因此相同输入总是给出相同分数。它不是 LLM 的意见。不抓取任何来源。LLM 评审只在 Claude Code 内通过 `/recap` 运行。
- **安全的默认值**：不发起网络调用、不部署、不发邮件、不写入密钥、不执行破坏性 git，在你明确选择启用之前全部关闭。见 [`docs/security-and-privacy.md`](../docs/security-and-privacy.md)。
- **开源，MIT**：每一行都可阅读。无遥测，无数据采集。
- **架构稳定**：插件 + 技能 + 可选 MCP 的混合架构。已在 [`docs/architecture.md`](../docs/architecture.md) 中评审并记录。

> [!CAUTION]
> 你可能在旧文档里看到的「9.7 of 10」数字来自启发式检查器，而非 7 个并行运行的 LLM 评审者。该检查器快速且确定性；请把它当作结构信号来信任，而不是同行评审。

---

## 安全默认值

> [!WARNING]
> 每一项副作用都默认关闭。

- 无网络。`RECAP_STUDIO_FIXTURE_ONLY=1` 是起始状态。
- 无部署。`deploymentMode: "disabled"`。
- 无邮件。`emailMode: "disabled"`。
- 不写入密钥。Hook 拒绝 `.env*`、PEM 以及形似密钥的路径。
- 无破坏性 git。Hook 拒绝 `push --force`、`reset --hard`、`rebase`、`clean -fdx`。

见 [`hooks/README.md`](../hooks/README.md) 和 [`docs/security-and-privacy.md`](../docs/security-and-privacy.md)。

---

## 文档

- [架构](../docs/architecture.md)
- [Agent 系统](../docs/agent-system.md)
- [工作流](../docs/workflows.md)
- [Vercel 部署](../docs/vercel-deployment.md)
- [安全与隐私](../docs/security-and-privacy.md)
- [配置](../docs/configuration.md)
- [贡献指南](../CONTRIBUTING.md)
- [变更日志](../CHANGELOG.md)

---

## Star History

<a href="https://star-history.com/#Aboudjem/recap-studio&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Aboudjem/recap-studio&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Aboudjem/recap-studio&type=Date" />
    <img alt="Star history chart for Aboudjem/recap-studio" src="https://api.star-history.com/svg?repos=Aboudjem/recap-studio&type=Date" width="70%" />
  </picture>
</a>

---

<p align="center">
  如果 Recap Studio 帮你做出了更好的讲解，给它点个 star。<br/>
  这能帮助其他开发者发现尊重他们注意力的工具。
</p>

<p align="center">
  <a href="https://www.linkedin.com/in/adam-boudjemaa/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="https://x.com/AdamBoudj"><img src="https://img.shields.io/badge/X-000000?style=flat-square&logo=x&logoColor=white" alt="X"></a>
  <a href="https://adam-boudjemaa.com/"><img src="https://img.shields.io/badge/Website-7C5CFF?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
</p>

<p align="center">
  <sub>由 <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> 构建 · MIT License · 无遥测 · 无数据采集</sub>
</p>

---

*本译文由机器辅助生成。欢迎母语为中文的贡献者提交 PR 进行修正和改进。英文版 README（[../README.md](../README.md)）为最终参考来源。*
