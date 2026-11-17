<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-light.svg">
  <img alt="Recap Studio: メールで送れて、PR に添付でき、機内でも読める 1 ページ。画像は 40 件のコミットが 1 ページになる様子と、実際の行 Verdict: PASS, 49.8 KB, 0 script tags, 9.7/10 を示します。" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg" width="100%">
</picture>

<p align="center">
  <a href="https://github.com/Aboudjem/recap-studio/releases"><img src="https://img.shields.io/github/v/tag/Aboudjem/recap-studio?color=5B9DFF&label=version&style=flat-square" alt="version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-5B9DFF?style=flat-square" alt="License"></a>
  <a href="https://github.com/Aboudjem/recap-studio/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Aboudjem/recap-studio/ci.yml?style=flat-square&label=CI" alt="CI"></a>
</p>

<p align="center">
  <a href="../README.md">English</a> ·
  <a href="zh-CN.md">简体中文</a> ·
  <b>日本語</b> ·
  <a href="es.md">Español</a> ·
  <a href="fr.md">Français</a>
</p>

**何が変わったかを、送れる 1 ページで理解する。**

Recap Studio は、コーディングセッションやトピックから HTML ページを 1 つ作ります。

| やったことがわかる | 送れる 1 ページ | 送る前にチェック済み |
|:--|:--|:--|
| `/recap session` が git の差分とコミットを読み、1 ページを書きます。 | HTML ファイル 1 つ、script タグ 0、CSS はすべて中に。下のデモが両方を表示します。 | 7 つのチェックがモデルなしで採点します。`--fail-under 8` で弱いページを拒否します。 |

**対応:** skills を読めるすべてのエージェントと、すべての MCP クライアント(テスト済み: Claude Code、Codex CLI)。ページ生成にモデルは不要で、文章はあなたのエージェントのモデルが書きます。

今すぐ試せます。必要なのは Node 20 以降だけです。

```bash
npx -y github:Aboudjem/recap-studio demo
```

2026-11-17 の実際の出力(パスは短縮):

```text
Verdict: PASS. Wrote /tmp/try/recap-latest-ai-models.html
Page: 49.8 KB, 0 script tags, all CSS inlined. Score: 9.7/10, 0 blocker(s).

Next:
- Open the file with a double-click. It works offline.
- Make your own: `npx -y github:Aboudjem/recap-studio example -o content.json`, edit it, then `npx -y github:Aboudjem/recap-studio render content.json`.
- Score it before you send it: `npx -y github:Aboudjem/recap-studio validate content.json --fail-under 8`.
```

<img alt="Recap Studio が作ったページ: 暗い上部バナー、一文の答え、5 ステップの読み進め方" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/page-preview.png" width="100%">

**何か:** コーディングセッションやトピックを 1 つの HTML ページにするツールです。

**いつ使うか:** 今週何が変わったか、あるトピックが何か、と聞かれたとき。

**得られるもの:** メールで送れて、プルリクエストに添付できる 1 ファイル。オフラインで開き、JavaScript もネットワーク通信もありません。

スコアが見るのは形で、正しさではありません。共有する前にソースを読んでください。

## インストール

**エージェントを選ぶ。** どのコマンドも、すべてのプロジェクト向けにインストールします。

[![Claude Code](https://img.shields.io/badge/Claude_Code-D97757?style=for-the-badge&logo=claude&logoColor=white)](#claude-code) [![Codex](https://img.shields.io/badge/Codex-000000?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyBmaWxsPSJ3aGl0ZSIgcm9sZT0iaW1nIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI%2BPHRpdGxlPk9wZW5BSTwvdGl0bGU%2BPHBhdGggZD0iTTIyLjI4MTkgOS44MjExYTUuOTg0NyA1Ljk4NDcgMCAwIDAtLjUxNTctNC45MTA4IDYuMDQ2MiA2LjA0NjIgMCAwIDAtNi41MDk4LTIuOUE2LjA2NTEgNi4wNjUxIDAgMCAwIDQuOTgwNyA0LjE4MThhNS45ODQ3IDUuOTg0NyAwIDAgMC0zLjk5NzcgMi45IDYuMDQ2MiA2LjA0NjIgMCAwIDAgLjc0MjcgNy4wOTY2IDUuOTggNS45OCAwIDAgMCAuNTExIDQuOTEwNyA2LjA1MSA2LjA1MSAwIDAgMCA2LjUxNDYgMi45MDAxQTUuOTg0NyA1Ljk4NDcgMCAwIDAgMTMuMjU5OSAyNGE2LjA1NTcgNi4wNTU3IDAgMCAwIDUuNzcxOC00LjIwNTggNS45ODk0IDUuOTg5NCAwIDAgMCAzLjk5NzctMi45MDAxIDYuMDU1NyA2LjA1NTcgMCAwIDAtLjc0NzUtNy4wNzI5em0tOS4wMjIgMTIuNjA4MWE0LjQ3NTUgNC40NzU1IDAgMCAxLTIuODc2NC0xLjA0MDhsLjE0MTktLjA4MDQgNC43NzgzLTIuNzU4MmEuNzk0OC43OTQ4IDAgMCAwIC4zOTI3LS42ODEzdi02LjczNjlsMi4wMiAxLjE2ODZhLjA3MS4wNzEgMCAwIDEgLjAzOC4wNTJ2NS41ODI2YTQuNTA0IDQuNTA0IDAgMCAxLTQuNDk0NSA0LjQ5NDR6bS05LjY2MDctNC4xMjU0YTQuNDcwOCA0LjQ3MDggMCAwIDEtLjUzNDYtMy4wMTM3bC4xNDIuMDg1MiA0Ljc4MyAyLjc1ODJhLjc3MTIuNzcxMiAwIDAgMCAuNzgwNiAwbDUuODQyOC0zLjM2ODV2Mi4zMzI0YS4wODA0LjA4MDQgMCAwIDEtLjAzMzIuMDYxNUw5Ljc0IDE5Ljk1MDJhNC40OTkyIDQuNDk5MiAwIDAgMS02LjE0MDgtMS42NDY0ek0yLjM0MDggNy44OTU2YTQuNDg1IDQuNDg1IDAgMCAxIDIuMzY1NS0xLjk3MjhWMTEuNmEuNzY2NC43NjY0IDAgMCAwIC4zODc5LjY3NjVsNS44MTQ0IDMuMzU0My0yLjAyMDEgMS4xNjg1YS4wNzU3LjA3NTcgMCAwIDEtLjA3MSAwbC00LjgzMDMtMi43ODY1QTQuNTA0IDQuNTA0IDAgMCAxIDIuMzQwOCA3Ljg3MnptMTYuNTk2MyAzLjg1NThMMTMuMTAzOCA4LjM2NCAxNS4xMTkyIDcuMmEuMDc1Ny4wNzU3IDAgMCAxIC4wNzEgMGw0LjgzMDMgMi43OTEzYTQuNDk0NCA0LjQ5NDQgMCAwIDEtLjY3NjUgOC4xMDQydi01LjY3NzJhLjc5Ljc5IDAgMCAwLS40MDctLjY2N3ptMi4wMTA3LTMuMDIzMWwtLjE0Mi0uMDg1Mi00Ljc3MzUtMi43ODE4YS43NzU5Ljc3NTkgMCAwIDAtLjc4NTQgMEw5LjQwOSA5LjIyOTdWNi44OTc0YS4wNjYyLjA2NjIgMCAwIDEgLjAyODQtLjA2MTVsNC44MzAzLTIuNzg2NmE0LjQ5OTIgNC40OTkyIDAgMCAxIDYuNjgwMiA0LjY2ek04LjMwNjUgMTIuODYzbC0yLjAyLTEuMTYzOGEuMDgwNC4wODA0IDAgMCAxLS4wMzgtLjA1NjdWNi4wNzQyYTQuNDk5MiA0LjQ5OTIgMCAwIDEgNy4zNzU3LTMuNDUzN2wtLjE0Mi4wODA1TDguNzA0IDUuNDU5YS43OTQ4Ljc5NDggMCAwIDAtLjM5MjcuNjgxM3ptMS4wOTc2LTIuMzY1NGwyLjYwMi0xLjQ5OTggMi42MDY5IDEuNDk5OHYyLjk5OTRsLTIuNTk3NCAxLjQ5OTctMi42MDY3LTEuNDk5N1oiLz48L3N2Zz4%3D)](#codex) [![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)](#cursor) [![Gemini CLI](https://img.shields.io/badge/Gemini_CLI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](#gemini-cli) [![GitHub Copilot](https://img.shields.io/badge/GitHub_Copilot-24292F?style=for-the-badge&logo=githubcopilot&logoColor=white)](#github-copilot) [![OpenCode](https://img.shields.io/badge/OpenCode-333333?style=for-the-badge&logo=opencode&logoColor=white)](#opencode)

### Claude Code

テスト済み。プラグイン、スキル、MCP サーバー。

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

その後、任意のプロジェクトで `/recap "What is React Server Components"` と入力します。

### Codex

テスト済み: MCP 呼び出し。スキル: インストール確認済み。

```bash
npx skills add Aboudjem/recap-studio -g -a codex -y
```

### Cursor

インストール確認済み。

```bash
npx skills add Aboudjem/recap-studio -g -a cursor -y
```

### Gemini CLI

インストール確認済み。

```bash
npx skills add Aboudjem/recap-studio -g -a gemini-cli -y
```

### GitHub Copilot

インストール確認済み。

```bash
npx skills add Aboudjem/recap-studio -g -a github-copilot -y
```

### OpenCode

インストール確認済み。

```bash
npx skills add Aboudjem/recap-studio -g -a opencode -y
```

このプロジェクトだけ: `-g` を外します。別のエージェント: `-a` の後にその名前を入れます。

**CLI のみ。** エージェントは不要です。npm ではなく GitHub から実行します:

```bash
npx -y github:Aboudjem/recap-studio render content.json
```

**MCP クライアント**(Model Context Protocol でツールを呼べるアプリ)。その MCP 設定に次を貼り付けます:

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

Claude Code プラグインはこのサーバーを自動で起動します。エディタごとの設定は [docs/editors.md](../docs/editors.md) にあります。

<details>
<summary>その他のインストール方法</summary>

```bash
# This project only, for the agents the skills CLI finds
npx skills add Aboudjem/recap-studio

# The repo's own installer, which calls the same skills CLI
curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s codex

# From a clone, with no network after the clone
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
node bin/recap.mjs demo
```

各リリースには `recap-studio.mcpb` も含まれます。バンドルをインストールできる MCP クライアント向けの 1 ファイル形式です。
</details>

## 仕組み

1. 依頼する。`/recap "<topic>"` はトピックを調べます。`/recap session` は git の差分とコミットを読みます。
2. エージェントが内容を書く。13 の専門エージェントが情報源を探し、5 分で読める構成を書き、各主張を確認します。
3. エージェントが内容を JSON としてプロジェクト内の `artifacts/<slug>/content.json` に保存します。
4. チェッカーが採点する。構造、引用、語数、シークレット検出の 7 つの固定チェックで、毎回同じスコアになります。モデルもネットワークも使いません。
5. レンダラーが 1 つのファイル `artifacts/<slug>/recap-<slug>.html` を書き出します。CSS はすべて埋め込みです。

CLI と MCP サーバーは、依存関係のない 1 つのコミット済みファイル `bin/recap.mjs` です。

| 動くもの | 副作用 |
|:--|:--|
| スキルとエージェント | プロジェクト内の `artifacts/` にファイルを書きます。調査にはエージェント自身の Web 検索を使います（ある場合）。 |
| CLI と MCP サーバー | 依頼されたページを書きます。ネットワーク通信なし。MCP ツールは 11 個で、[docs/mcp-tools.md](../docs/mcp-tools.md) に一覧があります。 |
| プラグインのフック | セッションが recap-studio プロジェクト内で動いているときだけ動作します (FAQ を参照)。そこでは破壊的な git と未確認のデプロイを止めます。シークレットファイルへの書き込みと編集も止めます。対象は `.env` と `.env.*`、`secrets/` または `private/` の下にあるものすべてです。SSH 鍵 (`id_rsa`、`id_ed25519`、`id_ecdsa`、`id_dsa`、`.pub` の有無を問わず) と `.pem`、`.p12`、`.pfx`、`.keystore`、`.key` ファイルも対象です。 |
| デプロイとメール | プラグインは実行しません。MCP のデプロイツールはコマンドを返し、メールツールは下書きを返します。 |

## 得られるもの

| 出力 | 内容 |
|:--|:--|
| `recap-<slug>.html` | 1 ファイルで完結する 1 ページ。CSS はすべて中に、JavaScript ゼロ、外部リクエストゼロ。 |
| `--format md` または `txt` | 同じページを Markdown またはプレーンテキストで。プルリクエストやメモ用です。 |
| `--print` | 印刷用: 白い背景、黒い文字、情報源の URL を明記。 |
| `recap validate` | 判定から始まり、最大 3 つの修正点、7 つの採点項目が続くレポート。 |
| `--fail-under <score>` | しきい値を下回ると終了コード 1。ブロッカーがあればスコアに関係なく失敗します。 |

## 対応エージェント

| Agent | テスト内容 | Tested |
|:--|:--|:--|
| Claude Code 2.1.326 | `--plugin-dir` でプラグインを読み込み、無関係なフォルダから MCP サーバーが `Connected` と表示 | 2026-11-17 |
| Codex CLI 0.169.0 | `codex exec` が MCP ツール `validate_content` を呼び、判定を返した | 2026-11-17 |
| Codex, Gemini CLI, OpenCode, Cursor, GitHub Copilot | `npx skills@1.9.0 add -g` が 5 つのスキルを `~/.agents/skills/` にコピーした(全プロジェクト向け) | 2026-11-17 |

ドキュメントのみ、未テスト: Windsurf、Continue、Zed、その他 skills CLI が対応するエージェント。設定例は [docs/editors.md](../docs/editors.md) にあります。

## Proof

以下の数値はすべて、クローン内で実行できるコマンドの出力です。

| 主張 | 数値 | コマンド |
|:--|:--|:--|
| 成功するテスト | 115 | `npm run test:count` |
| 生成ページ内の script タグ | 0 | `node bin/recap.mjs demo` |
| デモページのサイズ | 49.8 KB | `node bin/recap.mjs demo` |
| デモ内容のスコア | 9.7/10 | `node bin/recap.mjs validate fixtures/topics/latest-ai-models.json` |
| MCP ツール | 11 | `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \| node bin/recap.mjs mcp` |

CI は push とプルリクエストのたびに Node 20 と 22 でテストを実行します。生成ページに `<script>` タグがあっても失敗します。

## FAQ

**使うのに Claude Code は必要ですか?**
いいえ。CLI と MCP サーバーは Node 20 が動く環境ならどこでも動きます。Claude Code は `/recap` の調査エージェントを追加します。

**ページを開くと外部と通信しますか?**
いいえ。JavaScript も読み込む外部リンクもありません。CI は毎回の出力で `<script>` タグがないことを確認します。

**9.7/10 のスコアはモデルの評価ですか?**
いいえ。構造、引用、語数に対する固定チェックの集まりです。毎回同じスコアになります。情報源は読みません。

**フックは他のプロジェクトに影響しますか?**
いいえ。フックが見るのはセッションの作業フォルダで、編集中のファイルのフォルダではありません。そのフォルダか親フォルダに `recap-studio.config.*` ファイルか `.recap-studio/` フォルダがあるとき、またはこのリポジトリのときだけ動きます。`RECAP_HOOKS_EVERYWHERE=1` で全体に有効化できます。

**なぜ CLI を npm に公開しないのですか?**
その必要がないからです。CLI は依存関係のない 1 ファイルなので、`npx -y github:Aboudjem/recap-studio` で直接実行できます。

## Limits

- スコアはおおまかなチェック(ヒューリスティック)です。形式を確認するだけで、真偽は確認しません。共有前に情報源を読んでください。
- 調査の質はエージェント次第です。CLI は渡された内容を描画するだけで、調査はしません。
- オフラインでは、Mermaid 図(テキストで書くグラフ)はテキストのまま表示されます。代わりに SVG 図を使ってください: `kind: "svg"`。
- 5 つの MCP ツールは全部の仕事はしません(スタブです)。`render_page_screenshot`、`run_accessibility_scan`、`run_lighthouse_summary` は、サーバーにブラウザが含まれないため `skipped` を返します。
- デプロイとメールのツールは、デプロイも送信もしません。`deploy_vercel_preview` は自分で実行するシェルコマンドを返します。`send_email_draft` はメールに貼る下書きを返します。
- Codex は書き込みツールをブロックすることがあります。`codex exec` の実行では承認レビューが `render_recap_html` をブロックしました。読み取りツールは動きました。

## 詳しく

- [エディタ設定](../docs/editors.md)、[CLI リファレンス](../docs/cli.md)、[MCP ツール](../docs/mcp-tools.md)
- [FAQ](../docs/faq.md) と [比較](../docs/comparison.md)
- [アーキテクチャ](../docs/architecture.md)、[エージェント構成](../docs/agent-system.md)、[セキュリティとプライバシー](../docs/security-and-privacy.md)
- [Changelog](../CHANGELOG.md) と [コントリビュート](../CONTRIBUTING.md)

---

<p align="center">
  <sub>作者 <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> · MIT ライセンス · テレメトリなし</sub>
</p>

---

*この翻訳は機械の支援により作成されました。日本語ネイティブの方による修正や改善の PR を歓迎します。決定版の参照元は英語版 README ([../README.md](../README.md)) です。*
