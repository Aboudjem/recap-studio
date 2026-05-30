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

<p align="center"><b>Transformez n'importe quel sujet ou session de code en une superbe page explicative, en mode sombre et mobile-first, que vous ouvrez d'un double-clic. Sans serveur, sans internet, sans dépendances.</b></p>

<p align="center">
  <sub>HTML hors ligne autonome · police sans-serif Inter · diagrammes SVG en ligne · zéro JavaScript</sub>
</p>

<p align="center">
  <a href="../README.md">English</a> ·
  <a href="zh-CN.md">简体中文</a> ·
  <a href="ja.md">日本語</a> ·
  <a href="es.md">Español</a> ·
  <b>Français</b>
</p>

<p align="center">
  <a href="#cest-quoi">C'est quoi</a> ·
  <a href="#démarrer-en-3-étapes">Démarrer</a> ·
  <a href="#dans-claude-code">Dans Claude Code</a> ·
  <a href="#partout-cli">Partout (CLI)</a> ·
  <a href="#faq">FAQ</a> ·
  <a href="#comparaison">Comparaison</a> ·
  <a href="#pourquoi-lui-faire-confiance">Pourquoi lui faire confiance</a> ·
  <a href="../docs/architecture.md">Docs</a>
</p>

<picture>
  <img alt="A real Recap Studio page: dark-mode hero with a gradient headline 'Latest AI models', a one-sentence answer, and a numbered five-step reading path. Calm, premium, mobile-first." src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/page-preview.png" width="100%">
</picture>

### En action

Une vraie exécution de `/recap "what is creatine"`, recherchée en direct, chaque affirmation vérifiée par rapport à des sources primaires (ISSN, NIH), puis rendue en une seule page autonome :

![recap-studio demo](https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/demo.gif)

<sub>Démonstration animée d'une page Recap Studio générée à propos de la créatine : hero en mode sombre, un diagramme SVG en ligne du cycle énergétique, des cartes d'idées clés avec icônes, et une liste de sources citant le NIH et l'ISSN.</sub>

---

## C'est quoi

Recap Studio prend un sujet (`"Latest AI models"`) ou une session de code (`git diff` + commits) et produit **un seul fichier HTML autonome** : en mode sombre, mobile-first, avec une réponse hero, des cartes de points clés, une carte conceptuelle SVG en ligne, une frise chronologique, un tableau comparatif, des idées reçues, un glossaire et des sources citées.

**Le super-pouvoir qu'aucun autre outil n'a :** la sortie est un fichier `.html` avec tous les styles en ligne, zéro JavaScript et zéro requête externe. Double-cliquez dessus dans le Finder ou l'Explorateur et il s'ouvre parfaitement, sans Wi-Fi, sans serveur et sans `npm install`.

Ce que vous obtenez sur la page :

| Section | Objectif |
| --- | --- |
| Hero | Une réponse en une phrase, pas une intro marketing |
| Ce qui compte | Trois points clés, en grand, au-dessus de la ligne de flottaison |
| Carte conceptuelle | Diagramme SVG en ligne, jamais décoratif |
| Idées clés | De quatre à sept cartes courtes |
| Frise chronologique | Uniquement quand une vraie chronologie existe |
| Comparaison | Tableau sur ordinateur, cartes empilées sur mobile |
| Exemples + analogies | Le concret d'abord, les abstractions ensuite |
| Idées reçues | Le mythe à gauche, la vérité à droite |
| Glossaire | Définitions en langage clair, repliées par défaut |
| Points d'action | Des choses applicables dès aujourd'hui |
| Sources | Chaque affirmation renvoie à une entrée `sourceMap` |

---

## Démarrer en 3 étapes

**1. Installez le plugin depuis le [10x marketplace](https://github.com/Aboudjem/10x) :**

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

**2. Ouvrez n'importe quelle session Claude Code et lancez :**

```
/recap "What is React Server Components"
```

**3. Un `recap-<slug>.html` autonome s'ouvre dans votre navigateur. Terminé.**

> [!NOTE]
> Rien ne communique vers l'extérieur. Aucune clé d'API payante n'est nécessaire pour l'essayer. `RECAP_STUDIO_FIXTURE_ONLY=1` est la valeur par défaut, donc la démo s'exécute entièrement à partir des fixtures.

---

## Dans Claude Code

Installez une fois via le 10x marketplace (voir ci-dessus). Utilisez ensuite ces commandes dans n'importe quelle session Claude Code :

| Commande | Ce qu'elle fait |
| --- | --- |
| `/recap "<topic>"` | Construire une page explicative complète à partir de n'importe quel sujet |
| `/recap session` | Récapituler une session de code depuis `git diff` + commits |
| `/recap session --deep` | Pareil, avec un accordéon d'analyse fichier par fichier |
| `/recap setup` | Créer `recap-studio.config.ts` avec des valeurs par défaut sûres |
| `/recap validate` | Re-noter la page active (vérification heuristique, voir ci-dessous) |

Après chaque exécution, la skill rend le HTML autonome, l'ouvre, puis demande « Deploy to Vercel? » **uniquement si Vercel est configuré et uniquement avec votre oui explicite.**

> [!TIP]
> `10x` est le marketplace de plugins sur [github.com/Aboudjem/10x](https://github.com/Aboudjem/10x). Il vous permet d'installer Recap Studio (et d'autres outils) sans cloner ce dépôt.

---

## Installer les skills dans n'importe quel CLI d'IA

Claude Code est l'hôte de premier plan (via le 10x marketplace ci-dessus). Pour charger les quatre skills `/recap` directement dans un autre CLI, lancez l'installateur en une ligne. Il crée des liens symboliques de `recap-topic`, `recap-session`, `recap-setup` et `recap-validate` dans le répertoire skills de ce CLI ; `--update` récupère la dernière version et relie, `--uninstall` les supprime.

```bash
curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s codex
```

Sous Windows, lancez `install.ps1 <platform>` depuis un checkout (le Mode Développeur ou un shell élevé est nécessaire pour les liens symboliques).

| Plateforme | Répertoire skills | Une ligne |
|:--|:--|:--|
| Claude Code | (plugin) | `claude plugin install recap-studio@10x` |
| Codex / Gemini / OpenCode / Pi | `~/.agents/skills` | `install.sh codex` |
| VS Code (Copilot) | `~/.copilot/skills` | `install.sh copilot` |
| Trae | `~/.trae/skills` | `install.sh trae` |
| Vibe | `~/.vibe/skills` | `install.sh vibe` |
| OpenClaw | `~/.openclaw/skills` | `install.sh openclaw` |
| Antigravity | `~/.gemini/antigravity/skills` | `install.sh antigravity` |
| Hermes / Cline / Kimi | `~/.<cli>/skills` | `install.sh hermes` |

Les conventions de répertoire skills changent d'une version de CLI à l'autre. Si un lien ne se résout pas, repliez-vous sur le serveur MCP local optionnel (il fonctionne dans tout client compatible MCP). Lancez `install.sh all` pour relier toutes les plateformes d'un coup. Compilez le serveur MCP une fois avec `pnpm -w build` avant de l'ajouter.

<details>
<summary><b>Claude Code</b></summary>

Installation du plugin en une commande depuis le [10x marketplace](https://github.com/Aboudjem/10x) :

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

Ou ajoutez seulement le serveur MCP local (après `pnpm -w build`) :

```bash
claude mcp add recap-studio node -- packages/mcp-server/dist/index.js
```
</details>

<details>
<summary><b>Cursor</b></summary>

Ajoutez à `~/.cursor/mcp.json` (après `pnpm -w build`) :

```json
{ "mcpServers": { "recap-studio": { "command": "node", "args": ["packages/mcp-server/dist/index.js"] } } }
```
</details>

<details>
<summary><b>VS Code (Copilot)</b></summary>

Ajoutez à `.vscode/mcp.json` (après `pnpm -w build`) :

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

Ajoutez à `~/.gemini/mcp_config.json` (après `pnpm -w build`) :

```json
{ "mcpServers": { "recap-studio": { "command": "node", "args": ["packages/mcp-server/dist/index.js"] } } }
```
</details>

<details>
<summary><b>Windsurf</b></summary>

Ajoutez à `~/.codeium/windsurf/mcp_config.json` (après `pnpm -w build`) :

```json
{ "mcpServers": { "recap-studio": { "command": "node", "args": ["packages/mcp-server/dist/index.js"] } } }
```
</details>

<details>
<summary><b>Continue.dev</b></summary>

Ajoutez à `.continue/mcpServers/recap-studio.yaml` (après `pnpm -w build`) :

```yaml
mcpServers:
  recap-studio: { command: node, args: ["packages/mcp-server/dist/index.js"], type: stdio }
```
</details>

La configuration prête à copier-coller, ainsi qu'un test de fumée pour chaque éditeur, se trouve dans [`docs/multi-editor.md`](../docs/multi-editor.md).

---

## Partout (CLI)

Utilisez le CLI quand vous êtes hors de Claude Code : dans n'importe quel terminal, n'importe quel éditeur, en CI ou dans un cron.

**Installation :**

```bash
# Fonctionne dès aujourd'hui, depuis un clone de ce dépôt :
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
pnpm install && pnpm -w build
node packages/cli/dist/index.js render content.json

# Prévu : une fois @recap-studio/cli publié sur npm, ceci deviendra une seule ligne.
# Ce n'est PAS encore sur npm, donc utilisez la voie du clone ci-dessus pour l'instant :
# npx @recap-studio/cli render content.json
```

**Commandes :**

| Commande | Ce qu'elle fait |
| --- | --- |
| `recap render <content.json>` | Rendre un fichier HTML autonome à partir d'un JSON de contenu |
| `recap render <content.json> -o out.html` | Écrire vers un chemin de sortie spécifique |
| `recap render <content.json> --theme dark\|light\|auto` | Choisir le thème de couleur (par défaut : dark) |
| `recap validate <content.json>` | Valider la structure du contenu et sortir avec le code 0/2 |

**Depuis la racine du workspace (si vous avez cloné le dépôt) :**

```bash
pnpm -w render              # render the demo content
pnpm -w render:demo         # write artifacts/<slug>/recap-<slug>.html
pnpm -w demo:latest-ai-models && pnpm --filter recap-web dev
```

> [!NOTE]
> `pnpm -w` signifie « exécuter depuis la racine du workspace » ; c'est la façon d'invoquer les scripts du monorepo. Vous n'en avez besoin que si vous avez cloné ce dépôt. `@recap-studio/cli` n'est pas encore publié sur npm, donc la voie du clone ci-dessus est la façon de l'exécuter aujourd'hui. Une fois publié, `npx @recap-studio/cli` l'exécutera sans rien cloner.

**Autres scripts du workspace :**

| Commande | Ce qu'elle fait |
| --- | --- |
| `pnpm -w validate:demo` | Noter la page active (vérification heuristique) |
| `pnpm -w history` | Lister chaque recap dans `artifacts/` avec ses scores |
| `pnpm -w auto-refresh -- <slug>` | Re-valider un recap stocké à la demande |
| `pnpm --filter recap-web dev` | Aperçu sur localhost:3000 (track Next.js hébergé) |
| `pnpm --filter recap-web build` | Compiler le site statique hébergé |
| `pnpm deploy:preview` | Déploiement d'aperçu Vercel (contrôlé par config + env) |
| `pnpm deploy:prod` | Déploiement de production Vercel (double contrôle) |

---

## FAQ

**Le HTML est-il vraiment autonome ?**
Oui. Tout le CSS est en ligne. Il n'y a zéro JavaScript et zéro référence à `/_next/` ou à un CDN. Vérifié : 0 référence externe, s'ouvre via `file://` dans un avion.

**Fonctionne-t-il sans connexion internet ?**
Pour le rendu : oui, totalement hors ligne. Pour le pipeline complet de recherche par LLM agents (dans Claude Code), oui, il utilise votre session Claude Code locale, pas une API externe que vous gérez.

**C'est quoi le « score » ?**
`recap validate` exécute une vérification heuristique rapide et déterministe qui analyse la structure, la présence de citations, le nombre de mots et des signaux de qualité connus. Il ne récupère PAS de sources et n'exécute PAS de LLM. La revue complète par LLM agents (13 agents, 7 dimensions) ne s'exécute que lorsque vous utilisez `/recap` dans Claude Code. C'est indiqué clairement dans la sortie.

**Puis-je l'utiliser dans VS Code, Cursor ou Codex ?**
Oui. Le serveur MCP (`@recap-studio/mcp-server`) expose un outil `render_recap_html`, et le CLI `recap` fonctionne dans n'importe quel terminal. Le transport MCP est conforme à la spécification (type de `content` `"text"`, avec `notifications/initialized` + `ping`) et couvert par des tests unitaires. La configuration prête à copier-coller pour Claude Code, Cursor, VS Code, Codex, Gemini, Windsurf et Continue, plus un test de fumée pour chacun, se trouve dans [`docs/multi-editor.md`](../docs/multi-editor.md).

**Se déploie-t-il quelque part automatiquement ?**
Non. Le déploiement est `disabled` par défaut. Il ne se déploie que si vous configurez Vercel et donnez votre consentement explicite quand on vous le demande.

**Existe-t-il une version web hébergée ?**
Oui, via le track Next.js (`pnpm --filter recap-web dev`). Le track hébergé et le track hors ligne en fichier unique produisent le même contenu sur des surfaces de rendu différentes.

---

## Comparaison

| Fonctionnalité | Recap Studio | Notion AI | Gamma | Mintlify | Markdown brut |
| --- | :---: | :---: | :---: | :---: | :---: |
| HTML hors ligne autonome | **YES** | No | No | No | No |
| Mode sombre, mobile-first | **YES** | Partial | Partial | Yes | No |
| Cartes conceptuelles SVG en ligne | **YES** | No | No | No | No |
| Sortie zéro JavaScript | **YES** | No | No | No | Yes |
| Fonctionne sans serveur | **YES** | No | No | No | Yes |
| Sources citées dans chaque affirmation | **YES** | No | No | No | No |
| Recap de session depuis git diff | **YES** | No | No | No | No |
| CLI (`npx`) hors de Claude Code | **YES** | No | No | No | n/a |
| Gratuit en exécution locale | **YES** | Freemium | Freemium | Freemium | Yes |

La ligne qui compte : **HTML hors ligne autonome**. Aucun autre outil d'explication ou de changelog ne produit un fichier ouvrable d'un double-clic, avec tous les styles en ligne et sans dépendances externes.

---

## Pourquoi lui faire confiance

- **43 tests passent** sur 5 paquets porteurs de tests. La compilation est au vert. La CI s'exécute à chaque push.
- **Deux cas d'usage E2E prouvés** : explicateur de sujet (`fixtures/topics/latest-ai-models.json`) et recap de session (`session.json`, un recap de la reconstruction de ce code). Les deux se rendent en HTML autonome validé.
- **Notation honnête** : le score heuristique de `validate` est déterministe, donc la même entrée donne toujours le même score. Ce n'est pas l'avis d'un LLM. Aucune source n'est récupérée. La revue par LLM ne s'exécute que dans Claude Code via `/recap`.
- **Valeurs par défaut sûres** : aucun appel réseau, aucun déploiement, aucun e-mail, aucune écriture de secret, aucun git destructif, tout est coupé jusqu'à ce que vous l'activiez explicitement. Voir [`docs/security-and-privacy.md`](../docs/security-and-privacy.md).
- **Open source, MIT** : lisez chaque ligne. Aucune télémétrie, aucune collecte de données.
- **L'architecture est stable** : hybride plugin + skills + MCP optionnel. Revue et documentée dans [`docs/architecture.md`](../docs/architecture.md).

> [!CAUTION]
> Le chiffre « 9.7 de 10 » que vous pouvez voir dans d'anciens documents venait du vérificateur heuristique, pas de 7 relecteurs LLM exécutés en parallèle. Le vérificateur est rapide et déterministe ; faites-lui confiance comme signal structurel, pas comme une revue par les pairs.

---

## Valeurs par défaut sûres

> [!WARNING]
> Chaque effet de bord est coupé par défaut.

- Aucun réseau. `RECAP_STUDIO_FIXTURE_ONLY=1` est l'état de départ.
- Aucun déploiement. `deploymentMode: "disabled"`.
- Aucun e-mail. `emailMode: "disabled"`.
- Aucune écriture de secret. Les hooks refusent `.env*`, les PEM et les chemins ressemblant à des clés.
- Aucun git destructif. Les hooks refusent `push --force`, `reset --hard`, `rebase`, `clean -fdx`.

Voir [`hooks/README.md`](../hooks/README.md) et [`docs/security-and-privacy.md`](../docs/security-and-privacy.md).

---

## Docs

- [Architecture](../docs/architecture.md)
- [Système d'agents](../docs/agent-system.md)
- [Flux de travail](../docs/workflows.md)
- [Déploiement Vercel](../docs/vercel-deployment.md)
- [Sécurité et confidentialité](../docs/security-and-privacy.md)
- [Configuration](../docs/configuration.md)
- [Contribuer](../CONTRIBUTING.md)
- [Changelog](../CHANGELOG.md)

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
  Si Recap Studio vous a aidé à livrer un meilleur explicateur, mettez-lui une étoile.<br/>
  Cela aide d'autres développeurs à trouver des outils qui respectent leur attention.
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

*Cette traduction a été générée avec l'aide d'une machine. Les PR de locuteurs natifs français pour la corriger et l'améliorer sont les bienvenus. La source de référence définitive est le README en anglais ([../README.md](../README.md)).*
