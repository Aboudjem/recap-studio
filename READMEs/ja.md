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

<p align="center"><b>あらゆるトピックやコーディングセッションを、美しいダークモード・モバイルファーストの解説ページに変換します。ダブルクリックで開けます。サーバー不要、インターネット不要、依存関係なし。</b></p>

<p align="center">
  <sub>自己完結型のオフライン HTML · サンセリフの Inter フォント · インライン SVG 図 · JavaScript ゼロ</sub>
</p>

<p align="center">
  <a href="../README.md">English</a> ·
  <a href="zh-CN.md">简体中文</a> ·
  <b>日本語</b> ·
  <a href="es.md">Español</a> ·
  <a href="fr.md">Français</a>
</p>

<p align="center">
  <a href="#これは何か">これは何か</a> ·
  <a href="#3-ステップで始める">3 ステップで始める</a> ·
  <a href="#claude-code-で使う">Claude Code で使う</a> ·
  <a href="#どこでも-cli">どこでも（CLI）</a> ·
  <a href="#faq">FAQ</a> ·
  <a href="#比較">比較</a> ·
  <a href="#なぜ信頼できるのか">なぜ信頼できるのか</a> ·
  <a href="../docs/architecture.md">ドキュメント</a>
</p>

<picture>
  <img alt="A real Recap Studio page: dark-mode hero with a gradient headline 'Latest AI models', a one-sentence answer, and a numbered five-step reading path. Calm, premium, mobile-first." src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/page-preview.png" width="100%">
</picture>

### 実際の動作

`/recap "what is creatine"` の実際の実行例です。ライブで調査し、すべての主張を一次情報源（ISSN、NIH）と照合してファクトチェックし、1 つの自己完結型ページにレンダリングします。

![recap-studio demo](https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/demo.gif)

<sub>クレアチンに関する Recap Studio 生成ページのアニメーションによるウォークスルー：ダークモードのヒーロー、インライン SVG のエネルギーサイクル図、アイコン付きの要点カード、NIH と ISSN を引用したソース一覧。</sub>

---

## これは何か

Recap Studio はトピック（`"Latest AI models"`）またはコーディングセッション（`git diff` + コミット）を受け取り、**1 つの自己完結型 HTML ファイル**を生成します。ダークモード、モバイルファーストで、ヒーローとなる答え、要点カード、インライン SVG のコンセプトマップ、タイムライン、比較表、よくある誤解、用語集、そして引用付きのソースを備えています。

**他のどのツールにもない切り札：** 出力はすべてのスタイルがインライン化された 1 つの `.html` ファイルで、JavaScript ゼロ、外部リクエストゼロです。Finder や Explorer でダブルクリックすれば完璧に開きます。Wi-Fi なし、サーバーなし、`npm install` なしで。

ページで得られるもの：

| セクション | 目的 |
| --- | --- |
| ヒーロー | マーケティング的な前置きではなく、一文の答え |
| 重要なこと | 3 つの要点、大きな文字、ファーストビュー内 |
| コンセプトマップ | インライン SVG 図、決して装飾ではない |
| 要点 | 4 〜 7 枚の短いカード |
| タイムライン | 実際の時系列が存在する場合のみ |
| 比較 | デスクトップでは表、モバイルでは積み重ねカード |
| 例 + たとえ | 具体を先に、抽象を後に |
| よくある誤解 | 左に通説、右に真実 |
| 用語集 | 平易な定義、デフォルトで折りたたみ |
| 行動のヒント | 今日から実行できること |
| ソース | すべての主張は `sourceMap` のエントリにリンク |

---

## 3 ステップで始める

**1. [10x marketplace](https://github.com/Aboudjem/10x) からプラグインをインストールします：**

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

**2. 任意の Claude Code セッションを開いて実行します：**

```
/recap "What is React Server Components"
```

**3. 自己完結型の `recap-<slug>.html` がブラウザで開きます。完了です。**

> [!NOTE]
> 外部にデータを送信するものは一切ありません。試すのに有料の API キーは不要です。`RECAP_STUDIO_FIXTURE_ONLY=1` がデフォルトなので、デモは完全に fixture から実行されます。

---

## Claude Code で使う

10x marketplace から一度インストールします（上記参照）。その後、任意の Claude Code セッションでこれらのコマンドを使えます：

| コマンド | 何をするか |
| --- | --- |
| `/recap "<topic>"` | 任意のトピックから完全な解説ページを作成 |
| `/recap session` | `git diff` + コミットからコーディングセッションを振り返る |
| `/recap session --deep` | 同上、ファイルごとの詳細アコーディオン付き |
| `/recap setup` | 安全なデフォルト値で `recap-studio.config.ts` を作成 |
| `/recap validate` | アクティブなページを再採点（ヒューリスティックチェック、下記参照） |

各実行後、スキルは自己完結型 HTML をレンダリングして開き、「Deploy to Vercel?」と尋ねます。**Vercel が設定されている場合のみ、かつあなたが明示的に yes と答えた場合のみです。**

> [!TIP]
> `10x` は [github.com/Aboudjem/10x](https://github.com/Aboudjem/10x) にあるプラグインマーケットプレイスです。このリポジトリをクローンせずに Recap Studio（や他のツール）をインストールできます。

---

## スキルを任意の AI CLI にインストールする

Claude Code が第一級のホストです（上記の 10x marketplace 経由）。4 つの `/recap` スキルを別の CLI に直接読み込ませるには、このワンライナーのインストーラーを実行します。`recap-topic`、`recap-session`、`recap-setup`、`recap-validate` をその CLI の skills ディレクトリにシンボリックリンクします。`--update` は最新版を取得して再リンクし、`--uninstall` はそれらを削除します。

```bash
curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s codex
```

Windows では、チェックアウトから `install.ps1 <platform>` を実行します（シンボリックリンク作成には開発者モードまたは昇格したシェルが必要です）。

| プラットフォーム | Skills ディレクトリ | ワンライナー |
|:--|:--|:--|
| Claude Code | （プラグイン） | `claude plugin install recap-studio@10x` |
| Codex / Gemini / OpenCode / Pi | `~/.agents/skills` | `install.sh codex` |
| VS Code (Copilot) | `~/.copilot/skills` | `install.sh copilot` |
| Trae | `~/.trae/skills` | `install.sh trae` |
| Vibe | `~/.vibe/skills` | `install.sh vibe` |
| OpenClaw | `~/.openclaw/skills` | `install.sh openclaw` |
| Antigravity | `~/.gemini/antigravity/skills` | `install.sh antigravity` |
| Hermes / Cline / Kimi | `~/.<cli>/skills` | `install.sh hermes` |

skills ディレクトリの規約は CLI のリリースごとに変わります。リンクが解決できない場合は、オプションのローカル MCP サーバー（MCP 対応のあらゆるクライアントで動作します）にフォールバックしてください。`install.sh all` を実行すると、すべてのプラットフォームを一度にリンクできます。MCP サーバーを追加する前に、`pnpm -w build` で一度ビルドしてください。

<details>
<summary><b>Claude Code</b></summary>

[10x marketplace](https://github.com/Aboudjem/10x) から一発でプラグインをインストール：

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

または、ローカル MCP サーバーだけを追加（`pnpm -w build` の後）：

```bash
claude mcp add recap-studio node -- packages/mcp-server/dist/index.js
```
</details>

<details>
<summary><b>Cursor</b></summary>

`~/.cursor/mcp.json` に追加（`pnpm -w build` の後）：

```json
{ "mcpServers": { "recap-studio": { "command": "node", "args": ["packages/mcp-server/dist/index.js"] } } }
```
</details>

<details>
<summary><b>VS Code (Copilot)</b></summary>

`.vscode/mcp.json` に追加（`pnpm -w build` の後）：

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

`~/.gemini/mcp_config.json` に追加（`pnpm -w build` の後）：

```json
{ "mcpServers": { "recap-studio": { "command": "node", "args": ["packages/mcp-server/dist/index.js"] } } }
```
</details>

<details>
<summary><b>Windsurf</b></summary>

`~/.codeium/windsurf/mcp_config.json` に追加（`pnpm -w build` の後）：

```json
{ "mcpServers": { "recap-studio": { "command": "node", "args": ["packages/mcp-server/dist/index.js"] } } }
```
</details>

<details>
<summary><b>Continue.dev</b></summary>

`.continue/mcpServers/recap-studio.yaml` に追加（`pnpm -w build` の後）：

```yaml
mcpServers:
  recap-studio: { command: node, args: ["packages/mcp-server/dist/index.js"], type: stdio }
```
</details>

各エディタのコピペ用設定と、それぞれのスモークテストは [`docs/multi-editor.md`](../docs/multi-editor.md) にあります。

---

## どこでも（CLI）

Claude Code の外にいるときに CLI を使います。任意のターミナル、任意のエディタ、CI、cron ジョブなどで。

**インストール：**

```bash
# 今日から使えます、このリポジトリのクローンから：
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
pnpm install && pnpm -w build
node packages/cli/dist/index.js render content.json

# 予定：@recap-studio/cli が npm に公開されれば、これがワンライナーになります。
# まだ npm 上にないので、今は上のクローン方式を使ってください：
# npx @recap-studio/cli render content.json
```

**コマンド：**

| コマンド | 何をするか |
| --- | --- |
| `recap render <content.json>` | コンテンツ JSON から自己完結型 HTML ファイルをレンダリング |
| `recap render <content.json> -o out.html` | 指定した出力パスに書き出す |
| `recap render <content.json> --theme dark\|light\|auto` | カラーテーマを選択（デフォルト：dark） |
| `recap validate <content.json>` | コンテンツ構造を検証し、終了コード 0/2 で終了 |

**ワークスペースのルートから（リポジトリをクローンした場合）：**

```bash
pnpm -w render              # render the demo content
pnpm -w render:demo         # write artifacts/<slug>/recap-<slug>.html
pnpm -w demo:latest-ai-models && pnpm --filter recap-web dev
```

> [!NOTE]
> `pnpm -w` は「ワークスペースのルートから実行する」という意味で、モノレポのスクリプトの呼び出し方です。このリポジトリをクローンした場合にのみ必要です。`@recap-studio/cli` はまだ npm に公開されていないため、上記のクローン方式が今のところの実行方法です。公開されれば、`npx @recap-studio/cli` で何もクローンせずに実行できます。

**その他のワークスペーススクリプト：**

| コマンド | 何をするか |
| --- | --- |
| `pnpm -w validate:demo` | アクティブなページを採点（ヒューリスティックチェック） |
| `pnpm -w history` | `artifacts/` 内のすべての recap をスコア付きで一覧表示 |
| `pnpm -w auto-refresh -- <slug>` | 保存済みの recap をオンデマンドで再検証 |
| `pnpm --filter recap-web dev` | localhost:3000 でプレビュー（ホスト型 Next.js トラック） |
| `pnpm --filter recap-web build` | ホスト型の静的サイトをビルド |
| `pnpm deploy:preview` | Vercel プレビューデプロイ（設定 + 環境変数でゲート） |
| `pnpm deploy:prod` | Vercel 本番デプロイ（二重ゲート） |

---

## FAQ

**この HTML は本当に自己完結型ですか？**
はい。すべての CSS がインライン化されています。JavaScript はゼロ、`/_next/` や CDN への参照もゼロです。検証済み：外部参照 0、機内でも `file://` で開けます。

**インターネット接続なしで動きますか？**
レンダリングについては、はい、完全にオフラインです。完全な LLM agent による調査パイプライン（Claude Code 内）についても、はい、それはあなたが管理する外部 API ではなく、ローカルの Claude Code セッションを使います。

**この「スコア」とは何ですか？**
`recap validate` は、構造、引用の有無、語数、既知の品質シグナルをスキャンする、高速で決定論的なヒューリスティックチェックを実行します。ソースを取得したり LLM を実行したりは**しません**。完全な LLM agent レビュー（13 の agent、7 つの次元）は、Claude Code 内で `/recap` を使ったときにのみ実行されます。これは出力に明記されます。

**VS Code、Cursor、Codex で使えますか？**
はい。MCP サーバー（`@recap-studio/mcp-server`）は `render_recap_html` ツールを公開し、`recap` CLI は任意のターミナルで動作します。MCP トランスポートは仕様準拠（`content` の type が `"text"`、`notifications/initialized` + `ping` を処理）で、ユニットテスト済みです。Claude Code、Cursor、VS Code、Codex、Gemini、Windsurf、Continue 向けのコピペ用設定と、それぞれのスモークテストは [`docs/multi-editor.md`](../docs/multi-editor.md) にあります。

**どこかに自動でデプロイされますか？**
いいえ。デプロイはデフォルトで `disabled` です。Vercel を設定し、プロンプトで明示的に同意した場合にのみデプロイされます。

**ホスト型のウェブ版はありますか？**
はい、Next.js トラック（`pnpm --filter recap-web dev`）経由で。ホスト型トラックとオフラインの単一ファイルトラックは、異なるレンダリング面で同じコンテンツを生成します。

---

## 比較

| 機能 | Recap Studio | Notion AI | Gamma | Mintlify | プレーンな markdown |
| --- | :---: | :---: | :---: | :---: | :---: |
| 自己完結型オフライン HTML | **YES** | No | No | No | No |
| ダークモード、モバイルファースト | **YES** | Partial | Partial | Yes | No |
| インライン SVG コンセプトマップ | **YES** | No | No | No | No |
| JavaScript ゼロの出力 | **YES** | No | No | No | Yes |
| サーバーなしで動作 | **YES** | No | No | No | Yes |
| すべての主張に引用ソース | **YES** | No | No | No | No |
| git diff からのセッション振り返り | **YES** | No | No | No | No |
| Claude Code 外の CLI（`npx`） | **YES** | No | No | No | n/a |
| ローカルでの実行が無料 | **YES** | Freemium | Freemium | Freemium | Yes |

本当に重要な 1 行：**自己完結型オフライン HTML**。すべてのスタイルがインライン化され、外部依存のない、ダブルクリックで開けるファイルを生成する解説ツールや変更ログツールは、他にありません。

---

## なぜ信頼できるのか

- **43 のテストがパス**、5 つのテストを持つパッケージにわたって。ビルドはグリーン。CI はプッシュごとに実行されます。
- **2 つのエンドツーエンドのユースケースが実証済み**：トピック解説（`fixtures/topics/latest-ai-models.json`）とセッション振り返り（`session.json`、このコードベース再構築の振り返り）。どちらも検証済みの自己完結型 HTML にレンダリングされます。
- **誠実な採点**：`validate` のヒューリスティックスコアは決定論的なので、同じ入力は常に同じスコアを返します。LLM の意見ではありません。ソースは取得されません。LLM レビューは Claude Code 内で `/recap` 経由でのみ実行されます。
- **安全なデフォルト**：ネットワーク呼び出しなし、デプロイなし、メールなし、シークレット書き込みなし、破壊的 git なし、あなたが明示的にオプトインするまですべてオフ。[`docs/security-and-privacy.md`](../docs/security-and-privacy.md) を参照。
- **オープンソース、MIT**：すべての行を読めます。テレメトリなし、データ収集なし。
- **アーキテクチャは安定**：プラグイン + スキル + オプションの MCP のハイブリッド。[`docs/architecture.md`](../docs/architecture.md) でレビュー・文書化済み。

> [!CAUTION]
> 古いドキュメントで見かけるかもしれない「9.7 of 10」という数字は、並列で動作する 7 つの LLM レビュアーではなく、ヒューリスティックチェッカーから来たものです。このチェッカーは高速で決定論的です。ピアレビューではなく、構造的なシグナルとして信頼してください。

---

## 安全なデフォルト

> [!WARNING]
> すべての副作用はデフォルトでオフです。

- ネットワークなし。`RECAP_STUDIO_FIXTURE_ONLY=1` が初期状態です。
- デプロイなし。`deploymentMode: "disabled"`。
- メールなし。`emailMode: "disabled"`。
- シークレット書き込みなし。Hook は `.env*`、PEM、鍵の形をしたパスを拒否します。
- 破壊的 git なし。Hook は `push --force`、`reset --hard`、`rebase`、`clean -fdx` を拒否します。

[`hooks/README.md`](../hooks/README.md) と [`docs/security-and-privacy.md`](../docs/security-and-privacy.md) を参照してください。

---

## ドキュメント

- [アーキテクチャ](../docs/architecture.md)
- [Agent システム](../docs/agent-system.md)
- [ワークフロー](../docs/workflows.md)
- [Vercel デプロイ](../docs/vercel-deployment.md)
- [セキュリティとプライバシー](../docs/security-and-privacy.md)
- [設定](../docs/configuration.md)
- [コントリビューション](../CONTRIBUTING.md)
- [変更ログ](../CHANGELOG.md)

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
  Recap Studio がより良い解説を出荷する助けになったなら、star をお願いします。<br/>
  それは、注意力を尊重するツールを他の開発者が見つける助けになります。
</p>

<p align="center">
  <a href="https://www.linkedin.com/in/adam-boudjemaa/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="https://x.com/AdamBoudj"><img src="https://img.shields.io/badge/X-000000?style=flat-square&logo=x&logoColor=white" alt="X"></a>
  <a href="https://adam-boudjemaa.com/"><img src="https://img.shields.io/badge/Website-7C5CFF?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
</p>

<p align="center">
  <sub>Built by <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> · MIT License · No telemetry · No data collection</sub>
</p>

---

*この翻訳は機械支援によって作成されました。日本語を母語とする方からの修正・改善の PR を歓迎します。最終的な参照元は英語版 README（[../README.md](../README.md)）です。*
