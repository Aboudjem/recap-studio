<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-light.svg">
  <img alt="Recap Studio: どんなテーマでも、ダブルクリックで開ける1つのファイルに" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg" width="100%">
</picture>

<p align="center">
  <a href="https://github.com/Aboudjem/recap-studio/releases"><img src="https://img.shields.io/github/v/tag/Aboudjem/recap-studio?color=5B9DFF&label=version&style=flat-square" alt="version"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-5B9DFF?style=flat-square" alt="License"></a>
  <a href="https://github.com/Aboudjem/recap-studio/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Aboudjem/recap-studio/ci.yml?style=flat-square&label=CI" alt="CI"></a>
  <a href="https://github.com/Aboudjem/recap-studio/stargazers"><img src="https://img.shields.io/github/stars/Aboudjem/recap-studio?style=flat-square&color=5B9DFF" alt="Stars"></a>
</p>

<p align="center">
  <a href="../README.md">English</a> ·
  <a href="zh-CN.md">简体中文</a> ·
  <b>日本語</b> ·
  <a href="es.md">Español</a> ·
  <a href="fr.md">Français</a>
</p>

<p align="center"><b>どんなテーマでも、コーディングセッションでも、ダブルクリックで開けるダークモードでモバイルファーストの解説ページに変えます。</b><br><sub>サーバー不要、インターネット不要、依存関係なし。</sub></p>

<p align="center">
  <a href="#何をするツールか">何をするツールか</a> ·
  <a href="#インストール">インストール</a> ·
  <a href="#使い方">使い方</a> ·
  <a href="#お使いのエディタで">お使いのエディタで</a> ·
  <a href="#さらに詳しく">さらに詳しく</a>
</p>

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

## 何をするツールか

疑問が浮かんだとき、あるいは雑然としたコミットの午後を終えたとき。あとで読み返せる、あるいは同僚に送れるものが1つだけ欲しくなります。ログインも、ホスティングされたドキュメントも、ビルド手順も抜きで。

Recap Studio はテーマ (`"Latest AI models"`) またはコーディングセッション (`git diff` とコミット) を受け取り、**HTML ファイルを1つ**書き出します。すべてのスタイルは埋め込まれ、JavaScript は一切なく、ページは外部リクエストを行いません。Finder やエクスプローラーでダブルクリックすれば、オフラインで開きます。

- **約5分で読めるページ**: 1文の答え、本当に大事な要点、埋め込み SVG のコンセプトマップ、主要なアイデア、よくある誤解、用語集、引用元の一覧。
- **CI に組み込めるスコア**: 構造、引用、語数、シークレット検出にわたる7つの決定的なチェック。
- **メールで送れるファイル**: 維持するサーバーも、切れるリンクもありません。

<img alt="レンダリングされた Recap Studio のページ: ダークなヒーロー、1文の答え、番号付きの5ステップの読み進めガイド" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/page-preview.png" width="100%">

## インストール

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

`10x` はプラグインのマーケットプレイス、つまり Claude Code がインストール元にできる一覧です。一度追加すれば `recap-studio` と姉妹ツールが使えるようになります。

他のエージェントでは、4つのスキルを skills CLI からインストールします。

```bash
npx skills add Aboudjem/recap-studio
```

<details>
<summary>そのほかのインストール方法</summary>

```bash
# Pick the agent explicitly
npx skills add Aboudjem/recap-studio -a codex

# Or use the repo's own installer, which delegates to the same CLI
curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s codex

# --legacy copies the skills by hand, for machines without npx
bash install.sh codex --legacy
```

`install.sh --update` は既存のインストールを更新し、`install.sh --uninstall` は削除します。Windows ではクローンから `install.ps1 <platform>` を実行します。
</details>

## 使い方

**1. ページを依頼する。** 任意の Claude Code セッションで:

```
/recap "What is React Server Components"
```

Recap Studio はテーマを調べ、見つけた出典と照らして各主張を検証し、ページを生成して開きます。`/recap session` は直近のコミット群に対して同じことを行います。

**2. すでにある内容からページを作る。** クローンから CLI を使う場合:

```bash
pnpm install && pnpm -w build
node packages/cli/dist/index.js render fixtures/topics/latest-ai-models.json
```

```
recap: wrote latest-ai-models.html (49.8 KB, self-contained, double-click to open)
```

**3. 送る前に採点する。**

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

`--json` を付けると同じ実行が JSON ドキュメントを1つ標準出力に書き出すので、CI ジョブが `jq` で読み取れます。

## 手に入るもの

| 成果物 | 内容 |
|:--|:--|
| `recap-<slug>.html` | 自己完結したページ。CSS はすべて埋め込み、JavaScript ゼロ、外部リクエストゼロ。 |
| `--format md` または `txt` | 同じページを Markdown またはプレーンテキストのファイルとして。プルリクエストの本文やコミットメモ向け。 |
| `--print` | 紙向けのレンダリング: 白地に黒文字、改ページを整え、出典 URL を書き出します。 |
| 検証レポート | 7つの採点済みディメンション、ブロッカーの一覧、終了コード。 |
| `--fail-under <score>` | 総合スコアがしきい値を下回ると終了コード 1。ブロッカーはスコアにかかわらず実行を失敗させます。 |

## お使いのエディタで

Claude Code、Cursor、Codex、Copilot、Gemini CLI、そして `npx skills add` を通じて70を超える他のエージェントで動作します。

| エージェント | 1行インストール |
|:--|:--|
| Claude Code | `claude plugin install recap-studio@10x` |
| 70以上のエージェントのいずれか | `npx skills add Aboudjem/recap-studio` |
| Codex, Gemini, OpenCode, Pi | `bash install.sh <agent>` |
| VS Code (Copilot) | `bash install.sh copilot` |
| それ以外すべて | [docs/editors.md](../docs/editors.md) を参照 |

<details>
<summary>代わりに MCP サーバーとして追加する</summary>

MCP サーバーはローカルで動くため、先にビルド済みのクローンが必要です。

```bash
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
pnpm install && pnpm -w build
claude mcp add recap-studio node -- packages/mcp-server/dist/index.js
```

このリポジトリに `.mcp.json` はありません。Cursor、VS Code、Codex、Gemini CLI、Windsurf、Continue、OpenCode、Zed はいずれも同じコマンドをそれぞれの形式で求めます。すべてのスニペットは [docs/editors.md](../docs/editors.md) にあります。
</details>

## 知っておきたいこと

> [!IMPORTANT]
> 副作用はすべて既定で無効です。ネットワーク呼び出しなし、デプロイなし、メール送信なし、シークレットの書き込みなし、破壊的な git 操作なし。`RECAP_STUDIO_FIXTURE_ONLY=1` が初期状態なので、デモはフィクスチャで動き、外部には何も送られません。

- **生成されたページに JavaScript は含まれません。** CI が push のたびに確認します。レンダリングされた HTML に `<script>` タグも `/_next/` 参照もありません。
- **スコアはヒューリスティックであって、レビューではありません。** `validate` は7つの決定的なチェックを実行します。出典を取得することも、モデルを呼ぶこともありません。13の専門エージェントは Claude Code の `/recap` 経由でのみ動きます。
- **73件のテストが通ります**。ワークスペースの6プロジェクト、Node 20 と 22 で。npm にはリダイレクト用のプレースホルダーしかないため、CLI はクローンから実行します。

> [!CAUTION]
> 古いドキュメントで見かけるかもしれない「10点満点で9.7」は、レビュアーではなくこのヒューリスティックなチェッカーが出した数値です。査読ではなく構造上のシグナルとして読んでください。

## さらに詳しく

- [エディタ設定](../docs/editors.md)、各エージェントと各 MCP スニペット
- [CLI リファレンス](../docs/cli.md)、全コマンドと全オプション
- [FAQ](../docs/faq.md) と [比較](../docs/comparison.md)
- [アーキテクチャ](../docs/architecture.md)、[エージェントシステム](../docs/agent-system.md)、[セキュリティとプライバシー](../docs/security-and-privacy.md)
- [変更履歴](../CHANGELOG.md) と [コントリビュート](../CONTRIBUTING.md)

---

<p align="center">
  <sub>作者 <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> · MIT ライセンス · テレメトリなし</sub>
</p>

---

*この翻訳は機械の支援により作成されました。日本語ネイティブの方による修正や改善の PR を歓迎します。決定版の参照元は英語版 README ([../README.md](../README.md)) です。*
