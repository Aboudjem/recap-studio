<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-light.svg">
  <img alt="Recap Studio : n'importe quel sujet, un seul fichier ouvrable d'un double-clic" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg" width="100%">
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
  <a href="ja.md">日本語</a> ·
  <a href="es.md">Español</a> ·
  <b>Français</b>
</p>

<p align="center"><b>Transformez n'importe quel sujet ou session de code en une page explicative sombre et pensée pour mobile, que vous ouvrez d'un double-clic.</b><br><sub>Sans serveur, sans internet, sans dépendances.</sub></p>

<p align="center">
  <a href="#ce-que-ça-fait">Ce que ça fait</a> ·
  <a href="#installation">Installation</a> ·
  <a href="#utilisation">Utilisation</a> ·
  <a href="#dans-votre-éditeur">Dans votre éditeur</a> ·
  <a href="#pour-aller-plus-loin">Pour aller plus loin</a>
</p>

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

## Ce que ça fait

Vous posez une question, ou vous terminez un après-midi de commits en désordre. Vous voulez une seule chose à relire plus tard, ou à envoyer à un collègue, sans connexion, sans document hébergé, sans étape de build.

Recap Studio prend un sujet (`"Latest AI models"`) ou une session de code (`git diff` plus les commits) et écrit **un seul fichier HTML**. Tous les styles sont intégrés, il n'y a aucun JavaScript, et la page ne fait aucune requête externe. Double-cliquez dessus dans le Finder ou l'Explorateur et elle s'ouvre, hors ligne.

- **Une page qui se lit en cinq minutes environ** : une réponse en une phrase, les points qui comptent vraiment, une carte conceptuelle en SVG intégré, les idées principales, les idées reçues, un glossaire et les sources citées.
- **Un score que vous pouvez mettre en CI** : sept vérifications déterministes sur la structure, les citations, le nombre de mots et la recherche de secrets.
- **Un fichier que vous pouvez envoyer par mail** : aucun serveur à maintenir, aucun lien qui pourrit.

<img alt="Une page Recap Studio rendue : en-tête sombre, une réponse en une phrase et un parcours de lecture numéroté en cinq étapes" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/page-preview.png" width="100%">

## Installation

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

`10x` est une place de marché de plugins, une liste depuis laquelle Claude Code peut installer. L'ajouter une fois rend `recap-studio` et ses outils voisins disponibles.

Pour tout autre agent, les quatre skills s'installent via la CLI skills :

```bash
npx skills add Aboudjem/recap-studio
```

<details>
<summary>Autres façons d'installer</summary>

```bash
# Pick the agent explicitly
npx skills add Aboudjem/recap-studio -a codex

# Or use the repo's own installer, which delegates to the same CLI
curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s codex

# --legacy copies the skills by hand, for machines without npx
bash install.sh codex --legacy
```

`install.sh --update` met à jour une installation, `install.sh --uninstall` la retire. Sous Windows, utilisez `install.ps1 <platform>` depuis un clone.
</details>

## Utilisation

**1. Demandez une page.** Dans n'importe quelle session Claude Code :

```
/recap "What is React Server Components"
```

Recap Studio fait la recherche, vérifie chaque affirmation face aux sources trouvées, produit la page et l'ouvre. `/recap session` fait la même chose pour votre dernière série de commits.

**2. Ou produisez une page depuis un contenu existant.** Depuis un clone, avec la CLI :

```bash
pnpm install && pnpm -w build
node packages/cli/dist/index.js render fixtures/topics/latest-ai-models.json
```

```
recap: wrote latest-ai-models.html (49.8 KB, self-contained, double-click to open)
```

**3. Notez-la avant de l'envoyer.**

```bash
node packages/cli/dist/index.js validate fixtures/topics/latest-ai-models.json --fail-under 8
```

```
| Dimension          | Score  | Target | Status   | Top finding |
| facts              | 10/10 |  9 | PASS    | none |
| beginner           | 10/10 |  9 | PASS    | none |
| accessibility      | 10/10 |  9 | PASS    | none |
... four more rows ...

Overall: 9.7/10, thresholds PASSED
Gate: --fail-under 8, overall 9.7/10, blockers 0. Result: PASS
```

Ajoutez `--json` et la même exécution écrit un seul document JSON sur la sortie standard, qu'un job de CI peut lire avec `jq`.

## Ce que vous obtenez

| Artefact | De quoi il s'agit |
|:--|:--|
| `recap-<slug>.html` | Une page autonome. Tout le CSS intégré, zéro JavaScript, zéro requête externe. |
| `--format md` ou `txt` | La même page en fichier Markdown ou texte brut, pour un corps de pull request ou une note de commit. |
| `--print` | Un rendu papier : fond blanc, texte noir, sauts de page maîtrisés, URLs des sources écrites en clair. |
| Un rapport de validation | Sept dimensions notées, une liste de bloquants et un code de sortie. |
| `--fail-under <score>` | Sortie 1 quand le score global passe sous votre seuil. Un bloquant fait échouer l'exécution quel que soit le score. |

## Dans votre éditeur

Fonctionne dans Claude Code, Cursor, Codex, Copilot, Gemini CLI et plus de 70 autres agents via `npx skills add`.

| Agent | Installation en une ligne |
|:--|:--|
| Claude Code | `claude plugin install recap-studio@10x` |
| N'importe lequel des 70+ agents | `npx skills add Aboudjem/recap-studio` |
| Codex, Gemini, OpenCode, Pi | `bash install.sh <agent>` |
| VS Code (Copilot) | `bash install.sh copilot` |
| Tout le reste | voir [docs/editors.md](../docs/editors.md) |

<details>
<summary>L'ajouter comme serveur MCP à la place</summary>

Le serveur MCP est local, il faut donc d'abord un clone compilé :

```bash
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
pnpm install && pnpm -w build
claude mcp add recap-studio node -- packages/mcp-server/dist/index.js
```

Il n'y a pas de `.mcp.json` dans ce dépôt. Cursor, VS Code, Codex, Gemini CLI, Windsurf, Continue, OpenCode et Zed attendent chacun la même commande dans leur propre format ; tous les extraits sont dans [docs/editors.md](../docs/editors.md).
</details>

## Bon à savoir

> [!IMPORTANT]
> Tout effet de bord est désactivé par défaut. Aucun appel réseau, aucun déploiement, aucun e-mail, aucune écriture de secret, aucune commande git destructrice. `RECAP_STUDIO_FIXTURE_ONLY=1` est l'état de départ, donc la démo tourne sur des fixtures et rien ne part vers l'extérieur.

- **La page produite ne contient aucun JavaScript.** La CI le vérifie à chaque push : le HTML rendu n'a aucune balise `<script>` ni aucune référence `/_next/`.
- **Le score est une heuristique, pas une relecture.** `validate` lance sept vérifications déterministes. Il ne va pas chercher les sources et n'appelle aucun modèle. Les 13 agents spécialisés ne tournent que dans Claude Code, via `/recap`.
- **73 tests passent** sur six projets du workspace, sous Node 20 et 22. Seul un paquet de redirection est publié sur npm, donc la CLI s'exécute depuis un clone.

> [!CAUTION]
> Un « 9,7 sur 10 » que vous pourriez voir dans d'anciens documents vient de ce vérificateur heuristique, pas de relecteurs. Lisez-le comme un signal de structure, pas comme une relecture par les pairs.

## Pour aller plus loin

- [Configuration des éditeurs](../docs/editors.md), chaque agent et chaque extrait MCP
- [Référence CLI](../docs/cli.md), chaque commande et chaque option
- [FAQ](../docs/faq.md) et [comparaison](../docs/comparison.md)
- [Architecture](../docs/architecture.md), [système d'agents](../docs/agent-system.md), [sécurité et vie privée](../docs/security-and-privacy.md)
- [Journal des changements](../CHANGELOG.md) et [contribuer](../CONTRIBUTING.md)

---

<p align="center">
  <sub>Créé par <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> · Licence MIT · Aucune télémétrie</sub>
</p>

---

*Cette traduction a été générée avec l'aide d'une machine. Les PR de locuteurs natifs français pour la corriger et l'améliorer sont les bienvenus. La source de référence définitive est le README en anglais ([../README.md](../README.md)).*
