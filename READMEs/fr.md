<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-light.svg">
  <img alt="Recap Studio : une page à envoyer par e-mail, à joindre à une pull request ou à lire dans l'avion. L'image montre 40 commits qui deviennent une page, avec la vraie ligne Verdict: PASS, 49.8 KB, 0 script tags, 9.7/10." src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg" width="100%">
</picture>

<p align="center">
  <a href="https://github.com/Aboudjem/recap-studio/releases"><img src="https://img.shields.io/github/v/tag/Aboudjem/recap-studio?color=5B9DFF&label=version&style=flat-square" alt="version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-5B9DFF?style=flat-square" alt="License"></a>
  <a href="https://github.com/Aboudjem/recap-studio/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Aboudjem/recap-studio/ci.yml?style=flat-square&label=CI" alt="CI"></a>
</p>

<p align="center">
  <a href="../README.md">English</a> ·
  <a href="zh-CN.md">简体中文</a> ·
  <a href="ja.md">日本語</a> ·
  <a href="es.md">Español</a> ·
  <b>Français</b>
</p>

**Comprenez ce qui a changé, dans une page à envoyer.**

Recap Studio fait une page HTML à partir de votre session de code ou d'un sujet.

| Comprendre ce qui a été fait | Une page à envoyer | Vérifiée avant l'envoi |
|:--|:--|:--|
| `/recap session` lit votre diff git et vos commits, puis écrit une page. | Un fichier HTML, 0 balise script, tout le CSS dedans. La démo ci-dessous affiche les deux. | Sept contrôles notent la page sans modèle ; `--fail-under 8` refuse une page faible. |

**Compatible avec :** tout agent qui lit des skills, et tout client MCP. Testé : Claude Code, Codex CLI. Le générateur de page n'a besoin d'aucun modèle, et l'écriture utilise le modèle de votre agent.

Essayez maintenant. Il vous faut seulement Node 20 ou plus récent.

```bash
npx -y github:Aboudjem/recap-studio demo
```

Sortie réelle du 2026-11-17, chemin raccourci :

```text
Verdict: PASS. Wrote /tmp/try/recap-latest-ai-models.html
Page: 49.8 KB, 0 script tags, all CSS inlined. Score: 9.7/10, 0 blocker(s).

Next:
- Open the file with a double-click. It works offline.
- Make your own: `npx -y github:Aboudjem/recap-studio example -o content.json`, edit it, then `npx -y github:Aboudjem/recap-studio render content.json`.
- Score it before you send it: `npx -y github:Aboudjem/recap-studio validate content.json --fail-under 8`.
```

<img alt="Une page faite par Recap Studio : bandeau sombre en haut, une réponse en une phrase et un parcours de lecture en cinq étapes" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/page-preview.png" width="100%">

La note vérifie la forme, pas la vérité : lisez les sources avant de partager.

## Quand l'utiliser

Votre lead demande ce qui a changé cette semaine. Vous avez 40 commits et un historique de chat. Vous n'avez aucune page à envoyer.
Ou quelqu'un pose une question sur un sujet, et vous envoyez dix liens.
Recap Studio vous donne un seul fichier à la place. Il n'a pas de JavaScript et ne fait aucune requête réseau.
Envoyez-le par e-mail, joignez-le à une pull request ou ouvrez-le dans l'avion.

## Installation

**Claude Code.** Ajoutez la marketplace 10x une fois, puis installez le plugin :

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

Tapez ensuite `/recap "What is React Server Components"` dans n'importe quel projet.

**Tout autre agent.** Les cinq skills s'installent avec la CLI skills :

```bash
npx skills add Aboudjem/recap-studio
```

**La CLI seule.** Aucun agent requis. Elle tourne depuis GitHub, pas depuis npm :

```bash
npx -y github:Aboudjem/recap-studio render content.json
```

**Un client MCP** (une app qui appelle des outils via le Model Context Protocol). Collez ceci dans sa configuration MCP :

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

Le plugin Claude Code démarre ce serveur pour vous. La configuration de chaque éditeur est dans [docs/editors.md](../docs/editors.md).

<details>
<summary>Autres façons de l'installer</summary>

```bash
# Pick the agent explicitly
npx skills add Aboudjem/recap-studio -a codex

# The repo's own installer, which calls the same skills CLI
curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s codex

# From a clone, with no network after the clone
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
node bin/recap.mjs demo
```

Chaque release fournit aussi `recap-studio.mcpb`, un bundle en un fichier pour les clients MCP qui installent des bundles.
</details>

## Comment ça marche

1. Vous demandez. `/recap "<topic>"` étudie un sujet. `/recap session` lit votre diff git et vos commits.
2. Des agents écrivent le contenu. 13 agents spécialisés trouvent des sources, écrivent un parcours de cinq minutes et vérifient chaque affirmation.
3. L'agent enregistre le contenu en JSON dans `artifacts/<slug>/content.json`, dans votre projet.
4. Un vérificateur le note. Sept contrôles fixes donnent la même note à chaque fois : structure, citations, nombre de mots, recherche de secrets. Ni modèle, ni réseau.
5. Le moteur de rendu écrit un seul fichier, `artifacts/<slug>/recap-<slug>.html`. Tout le CSS est intégré.

La CLI et le serveur MCP sont un seul fichier versionné, `bin/recap.mjs`, sans dépendance.

| Ce qui tourne | Effet de bord |
|:--|:--|
| Skills et agents | Écrivent des fichiers sous `artifacts/` dans votre projet. La recherche utilise la recherche web de votre agent, s'il en a une. |
| CLI et serveur MCP | Écrivent la page demandée. Aucun appel réseau. 11 outils MCP, listés dans [docs/mcp-tools.md](../docs/mcp-tools.md). |
| Hooks du plugin | N'agissent que quand la session tourne dans un projet recap-studio (voir la FAQ). Ils y bloquent le git destructif et les déploiements non vérifiés. Ils bloquent aussi l'écriture et la modification de fichiers secrets. Cela couvre `.env` et `.env.*` et tout ce qui se trouve sous `secrets/` ou `private/`. Cela couvre aussi les clés SSH (`id_rsa`, `id_ed25519`, `id_ecdsa`, `id_dsa`, avec ou sans `.pub`) et les fichiers `.pem`, `.p12`, `.pfx`, `.keystore` et `.key`. |
| Déploiement et e-mail | Jamais lancés par le plugin. L'outil MCP de déploiement renvoie une commande ; celui d'e-mail renvoie un brouillon. |

## Ce que vous obtenez

| Sortie | Ce que c'est |
|:--|:--|
| `recap-<slug>.html` | Une page dans un seul fichier. Tout le CSS dedans, zéro JavaScript, zéro requête externe. |
| `--format md` ou `txt` | La même page en Markdown ou en texte brut, pour une pull request ou une note. |
| `--print` | Une version papier : fond blanc, texte noir, URL des sources en clair. |
| `recap validate` | Un rapport qui commence par le verdict, puis jusqu'à trois corrections, puis sept dimensions notées. |
| `--fail-under <score>` | Code de sortie 1 sous votre seuil. Un bloquant fait échouer l'exécution quel que soit le score. |

## Compatible avec

| Agent | Ce qui a été testé | Tested |
|:--|:--|:--|
| Claude Code 2.1.326 | Plugin chargé avec `--plugin-dir` ; son serveur MCP indiquait `Connected` depuis un dossier sans rapport | 2026-11-17 |
| Codex CLI 0.169.0 | `codex exec` a appelé l'outil MCP `validate_content` et renvoyé le verdict | 2026-11-17 |
| Codex, Gemini CLI, OpenCode, Cursor | `npx skills@1.9.0 add` a copié les cinq skills dans `.agents/skills/` | 2026-11-17 |

Documentés, non testés : VS Code (Copilot), Windsurf, Continue, Zed et les autres agents pris en charge par la CLI skills. Les étapes de configuration sont dans [docs/editors.md](../docs/editors.md).

## Preuves

Chaque nombre ci-dessous sort d'une commande que vous pouvez lancer dans un clone.

| Affirmation | Nombre | Commande |
|:--|:--|:--|
| Tests qui passent | 113 | `npm run test:count` |
| Balises script dans une page rendue | 0 | `node bin/recap.mjs demo` |
| Taille de la page de démo | 49.8 KB | `node bin/recap.mjs demo` |
| Score du contenu de démo | 9.7/10 | `node bin/recap.mjs validate fixtures/topics/latest-ai-models.json` |
| Outils MCP | 11 | `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \| node bin/recap.mjs mcp` |

La CI lance la suite sous Node 20 et 22 à chaque push et pull request. Elle échoue aussi si une page rendue contient une balise `<script>`.

## FAQ

**Faut-il Claude Code pour l'utiliser ?**
Non. La CLI et le serveur MCP tournent partout où Node 20 tourne. Claude Code ajoute les agents de recherche derrière `/recap`.

**La page contacte-t-elle un serveur à l'ouverture ?**
Non. Elle n'a ni JavaScript ni lien externe à charger. La CI vérifie chaque rendu pour une balise `<script>`.

**Le score 9.7/10 vient-il d'un modèle ?**
Non. C'est un ensemble de contrôles fixes sur la structure, les citations et le nombre de mots. Ils donnent la même note à chaque fois. Ils ne lisent pas les sources.

**Les hooks vont-ils modifier mes autres projets ?**
Non. Ils regardent le dossier de travail de la session, pas le dossier du fichier modifié. Ils n'agissent que si ce dossier ou un parent contient un fichier `recap-studio.config.*`, un dossier `.recap-studio/`, ou est ce dépôt. `RECAP_HOOKS_EVERYWHERE=1` les active partout.

**Pourquoi ne pas publier la CLI sur npm ?**
Ce n'est pas nécessaire. La CLI est un seul fichier sans dépendance, donc `npx -y github:Aboudjem/recap-studio` la lance directement.

## Limites

- Le score est un contrôle approximatif (une heuristique). Il vérifie la forme, pas la vérité. Lisez les sources avant de partager une page.
- La qualité de la recherche dépend de votre agent. La CLI rend le contenu fourni ; elle ne fait pas de recherche.
- Hors ligne, les diagrammes Mermaid (des graphiques écrits en texte) s'affichent en texte. Utilisez plutôt des diagrammes SVG : `kind: "svg"`.
- Cinq outils MCP ne font pas tout le travail (ce sont des ébauches). `render_page_screenshot`, `run_accessibility_scan` et `run_lighthouse_summary` répondent `skipped` : aucun navigateur n'est livré avec le serveur. `deploy_vercel_preview` renvoie une commande à lancer vous-même. `send_email_draft` renvoie un brouillon.
- Les outils de déploiement et d'e-mail ne déploient ni n'envoient rien. Le premier renvoie une commande à lancer vous-même, le second renvoie le brouillon.
- Codex peut bloquer les outils d'écriture. Lors d'une exécution `codex exec`, sa revue d'approbation a bloqué `render_recap_html`. Les outils de lecture ont fonctionné.

## En savoir plus

- [Configuration des éditeurs](../docs/editors.md), [référence de la CLI](../docs/cli.md), [outils MCP](../docs/mcp-tools.md)
- [FAQ](../docs/faq.md) et [comparaison](../docs/comparison.md)
- [Architecture](../docs/architecture.md), [système d'agents](../docs/agent-system.md), [sécurité et confidentialité](../docs/security-and-privacy.md)
- [Changelog](../CHANGELOG.md) et [contribuer](../CONTRIBUTING.md)

---

<p align="center">
  <sub>Créé par <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> · Licence MIT · Aucune télémétrie</sub>
</p>

---

*Cette traduction a été générée avec l'aide d'une machine. Les PR de locuteurs natifs français pour la corriger et l'améliorer sont les bienvenus. La source de référence définitive est le README en anglais ([../README.md](../README.md)).*
