<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-light.svg">
  <img alt="Recap Studio: una página para enviar por correo, adjuntar a una pull request o leer en el avión. La imagen muestra 40 commits que se convierten en una página, con la línea real Verdict: PASS, 49.8 KB, 0 script tags, 9.7/10." src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg" width="100%">
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
  <b>Español</b> ·
  <a href="fr.md">Français</a>
</p>

**Entiende qué cambió, en una página que puedes enviar.**

Recap Studio hace una página HTML a partir de tu sesión de código o de un tema.

| Entiende lo que se hizo | Una página para enviar | Revisada antes de enviar |
|:--|:--|:--|
| `/recap session` lee tu diff de git y tus commits, y escribe una página. | Un archivo HTML, 0 etiquetas script, todo el CSS dentro. La demo de abajo imprime ambos. | Siete comprobaciones puntúan la página sin modelo; `--fail-under 8` rechaza una página débil. |

**Funciona con:** cualquier agente que lea skills, y cualquier cliente MCP (probado: Claude Code, Codex CLI). El generador de páginas no necesita modelo; la escritura usa el modelo de tu agente.

Pruébalo ahora. Solo necesitas Node 20 o posterior.

```bash
npx -y github:Aboudjem/recap-studio demo
```

Salida real del 2026-11-17, con la ruta acortada:

```text
Verdict: PASS. Wrote /tmp/try/recap-latest-ai-models.html
Page: 49.8 KB, 0 script tags, all CSS inlined. Score: 9.7/10, 0 blocker(s).

Next:
- Open the file with a double-click. It works offline.
- Make your own: `npx -y github:Aboudjem/recap-studio example -o content.json`, edit it, then `npx -y github:Aboudjem/recap-studio render content.json`.
- Score it before you send it: `npx -y github:Aboudjem/recap-studio validate content.json --fail-under 8`.
```

<img alt="Una página hecha por Recap Studio: banda oscura arriba, una respuesta en una frase y un recorrido de lectura de cinco pasos" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/page-preview.png" width="100%">

**Qué es:** una herramienta que convierte tu sesión de código o un tema en una sola página HTML.

**Cuándo usarlo:** alguien pregunta qué cambió esta semana, o qué significa un tema.

**Qué obtienes:** un archivo para enviar por correo o adjuntar a una pull request. Se abre sin conexión, sin JavaScript y sin peticiones de red.

La puntuación revisa la forma, no la verdad: lee las fuentes antes de compartir.

## Instalación

**Elige tu agente.** Cada comando instala para todos tus proyectos.

[![Claude Code](https://img.shields.io/badge/Claude_Code-D97757?style=for-the-badge&logo=claude&logoColor=white)](#claude-code) [![Codex](https://img.shields.io/badge/Codex-000000?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyBmaWxsPSJ3aGl0ZSIgcm9sZT0iaW1nIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI%2BPHRpdGxlPk9wZW5BSTwvdGl0bGU%2BPHBhdGggZD0iTTIyLjI4MTkgOS44MjExYTUuOTg0NyA1Ljk4NDcgMCAwIDAtLjUxNTctNC45MTA4IDYuMDQ2MiA2LjA0NjIgMCAwIDAtNi41MDk4LTIuOUE2LjA2NTEgNi4wNjUxIDAgMCAwIDQuOTgwNyA0LjE4MThhNS45ODQ3IDUuOTg0NyAwIDAgMC0zLjk5NzcgMi45IDYuMDQ2MiA2LjA0NjIgMCAwIDAgLjc0MjcgNy4wOTY2IDUuOTggNS45OCAwIDAgMCAuNTExIDQuOTEwNyA2LjA1MSA2LjA1MSAwIDAgMCA2LjUxNDYgMi45MDAxQTUuOTg0NyA1Ljk4NDcgMCAwIDAgMTMuMjU5OSAyNGE2LjA1NTcgNi4wNTU3IDAgMCAwIDUuNzcxOC00LjIwNTggNS45ODk0IDUuOTg5NCAwIDAgMCAzLjk5NzctMi45MDAxIDYuMDU1NyA2LjA1NTcgMCAwIDAtLjc0NzUtNy4wNzI5em0tOS4wMjIgMTIuNjA4MWE0LjQ3NTUgNC40NzU1IDAgMCAxLTIuODc2NC0xLjA0MDhsLjE0MTktLjA4MDQgNC43NzgzLTIuNzU4MmEuNzk0OC43OTQ4IDAgMCAwIC4zOTI3LS42ODEzdi02LjczNjlsMi4wMiAxLjE2ODZhLjA3MS4wNzEgMCAwIDEgLjAzOC4wNTJ2NS41ODI2YTQuNTA0IDQuNTA0IDAgMCAxLTQuNDk0NSA0LjQ5NDR6bS05LjY2MDctNC4xMjU0YTQuNDcwOCA0LjQ3MDggMCAwIDEtLjUzNDYtMy4wMTM3bC4xNDIuMDg1MiA0Ljc4MyAyLjc1ODJhLjc3MTIuNzcxMiAwIDAgMCAuNzgwNiAwbDUuODQyOC0zLjM2ODV2Mi4zMzI0YS4wODA0LjA4MDQgMCAwIDEtLjAzMzIuMDYxNUw5Ljc0IDE5Ljk1MDJhNC40OTkyIDQuNDk5MiAwIDAgMS02LjE0MDgtMS42NDY0ek0yLjM0MDggNy44OTU2YTQuNDg1IDQuNDg1IDAgMCAxIDIuMzY1NS0xLjk3MjhWMTEuNmEuNzY2NC43NjY0IDAgMCAwIC4zODc5LjY3NjVsNS44MTQ0IDMuMzU0My0yLjAyMDEgMS4xNjg1YS4wNzU3LjA3NTcgMCAwIDEtLjA3MSAwbC00LjgzMDMtMi43ODY1QTQuNTA0IDQuNTA0IDAgMCAxIDIuMzQwOCA3Ljg3MnptMTYuNTk2MyAzLjg1NThMMTMuMTAzOCA4LjM2NCAxNS4xMTkyIDcuMmEuMDc1Ny4wNzU3IDAgMCAxIC4wNzEgMGw0LjgzMDMgMi43OTEzYTQuNDk0NCA0LjQ5NDQgMCAwIDEtLjY3NjUgOC4xMDQydi01LjY3NzJhLjc5Ljc5IDAgMCAwLS40MDctLjY2N3ptMi4wMTA3LTMuMDIzMWwtLjE0Mi0uMDg1Mi00Ljc3MzUtMi43ODE4YS43NzU5Ljc3NTkgMCAwIDAtLjc4NTQgMEw5LjQwOSA5LjIyOTdWNi44OTc0YS4wNjYyLjA2NjIgMCAwIDEgLjAyODQtLjA2MTVsNC44MzAzLTIuNzg2NmE0LjQ5OTIgNC40OTkyIDAgMCAxIDYuNjgwMiA0LjY2ek04LjMwNjUgMTIuODYzbC0yLjAyLTEuMTYzOGEuMDgwNC4wODA0IDAgMCAxLS4wMzgtLjA1NjdWNi4wNzQyYTQuNDk5MiA0LjQ5OTIgMCAwIDEgNy4zNzU3LTMuNDUzN2wtLjE0Mi4wODA1TDguNzA0IDUuNDU5YS43OTQ4Ljc5NDggMCAwIDAtLjM5MjcuNjgxM3ptMS4wOTc2LTIuMzY1NGwyLjYwMi0xLjQ5OTggMi42MDY5IDEuNDk5OHYyLjk5OTRsLTIuNTk3NCAxLjQ5OTctMi42MDY3LTEuNDk5N1oiLz48L3N2Zz4%3D)](#codex) [![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)](#cursor) [![Gemini CLI](https://img.shields.io/badge/Gemini_CLI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](#gemini-cli) [![GitHub Copilot](https://img.shields.io/badge/GitHub_Copilot-24292F?style=for-the-badge&logo=githubcopilot&logoColor=white)](#github-copilot) [![OpenCode](https://img.shields.io/badge/OpenCode-333333?style=for-the-badge&logo=opencode&logoColor=white)](#opencode)

### Claude Code

Probado. Plugin, skills y servidor MCP.

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

Después escribe `/recap "What is React Server Components"` en cualquier proyecto.

### Codex

Probado: llamada MCP. Skills: instalación probada.

```bash
npx skills add Aboudjem/recap-studio -g -a codex -y
```

### Cursor

Instalación probada.

```bash
npx skills add Aboudjem/recap-studio -g -a cursor -y
```

### Gemini CLI

Instalación probada.

```bash
npx skills add Aboudjem/recap-studio -g -a gemini-cli -y
```

### GitHub Copilot

Instalación probada.

```bash
npx skills add Aboudjem/recap-studio -g -a github-copilot -y
```

### OpenCode

Instalación probada.

```bash
npx skills add Aboudjem/recap-studio -g -a opencode -y
```

Solo este proyecto: quita `-g`. Otro agente: pon su nombre después de `-a`.

**Solo la CLI.** No hace falta un agente. Se ejecuta desde GitHub, no desde npm:

```bash
npx -y github:Aboudjem/recap-studio render content.json
```

**Un cliente MCP** (una app que llama a herramientas con el Model Context Protocol). Pega esto en su configuración MCP:

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

El plugin de Claude Code inicia este servidor por ti. La configuración de cada editor está en [docs/editors.md](../docs/editors.md).

<details>
<summary>Otras formas de instalarlo</summary>

```bash
# This project only, for the agents the skills CLI finds
npx skills add Aboudjem/recap-studio

# The repo's own installer, which calls the same skills CLI
curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s codex

# From a clone, with no network after the clone
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
node bin/recap.mjs demo
```

Cada release incluye también `recap-studio.mcpb`, un paquete de un solo archivo para los clientes MCP que instalan paquetes.
</details>

## Cómo funciona

1. Tú preguntas. `/recap "<topic>"` investiga un tema. `/recap session` lee tu diff de git y tus commits.
2. Los agentes escriben el contenido. 13 agentes especializados buscan fuentes, escriben una ruta de cinco minutos y comprueban cada afirmación.
3. El agente guarda el contenido como JSON en `artifacts/<slug>/content.json`, en tu proyecto.
4. Un verificador lo puntúa. Siete comprobaciones fijas dan la misma puntuación cada vez: estructura, citas, número de palabras, búsqueda de secretos. Sin modelo, sin red.
5. El renderizador escribe un solo archivo, `artifacts/<slug>/recap-<slug>.html`. Todo el CSS va incrustado.

La CLI y el servidor MCP son un único archivo versionado, `bin/recap.mjs`, sin dependencias.

| Qué se ejecuta | Efecto secundario |
|:--|:--|
| Skills y agentes | Escriben archivos bajo `artifacts/` en tu proyecto. La investigación usa la búsqueda web de tu agente, si tiene una. |
| CLI y servidor MCP | Escriben la página que pides. Ninguna llamada de red. 11 herramientas MCP, listadas en [docs/mcp-tools.md](../docs/mcp-tools.md). |
| Hooks del plugin | Solo actúan cuando la sesión se ejecuta dentro de un proyecto recap-studio (ver las preguntas frecuentes). Allí bloquean el git destructivo y los despliegues sin revisar. También bloquean la escritura y la edición de archivos secretos. Eso incluye `.env` y `.env.*` y todo lo que esté bajo `secrets/` o `private/`. También incluye las claves SSH (`id_rsa`, `id_ed25519`, `id_ecdsa`, `id_dsa`, con o sin `.pub`) y los archivos `.pem`, `.p12`, `.pfx`, `.keystore` y `.key`. |
| Despliegue y correo | El plugin nunca los ejecuta. La herramienta MCP de despliegue devuelve un comando; la de correo devuelve un borrador. |

## Qué obtienes

| Salida | Qué es |
|:--|:--|
| `recap-<slug>.html` | Una página en un solo archivo. Todo el CSS dentro, cero JavaScript, cero peticiones externas. |
| `--format md` o `txt` | La misma página en Markdown o texto plano, para una pull request o una nota. |
| `--print` | Una versión en papel: fondo blanco, texto negro, URL de las fuentes escritas. |
| `recap validate` | Un informe que empieza por el veredicto, luego hasta tres arreglos, luego siete dimensiones puntuadas. |
| `--fail-under <score>` | Código de salida 1 por debajo de tu umbral. Un bloqueante hace fallar la ejecución sea cual sea la puntuación. |

## Funciona con

| Agente | Qué se probó | Tested |
|:--|:--|:--|
| Claude Code 2.1.326 | Plugin cargado con `--plugin-dir`; su servidor MCP indicó `Connected` desde una carpeta ajena | 2026-11-17 |
| Codex CLI 0.169.0 | `codex exec` llamó a la herramienta MCP `validate_content` y devolvió el veredicto | 2026-11-17 |
| Codex, Gemini CLI, OpenCode, Cursor, GitHub Copilot | `npx skills@1.9.0 add -g` copió las cinco skills en `~/.agents/skills/`, para todos los proyectos | 2026-11-17 |

Documentados, sin probar: Windsurf, Continue, Zed y los demás agentes que admite la CLI skills. Los pasos de configuración están en [docs/editors.md](../docs/editors.md).

## Pruebas

Cada número de abajo sale de un comando que puedes ejecutar en un clon.

| Afirmación | Número | Comando |
|:--|:--|:--|
| Tests que pasan | 115 | `npm run test:count` |
| Etiquetas script en una página renderizada | 0 | `node bin/recap.mjs demo` |
| Tamaño de la página de demo | 49.8 KB | `node bin/recap.mjs demo` |
| Puntuación del contenido de demo | 9.7/10 | `node bin/recap.mjs validate fixtures/topics/latest-ai-models.json` |
| Herramientas MCP | 11 | `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \| node bin/recap.mjs mcp` |

La CI ejecuta la suite en Node 20 y 22 en cada push y pull request. También falla si una página renderizada contiene una etiqueta `<script>`.

## FAQ

**¿Necesito Claude Code para usarlo?**
No. La CLI y el servidor MCP funcionan donde funcione Node 20. Claude Code añade los agentes de investigación detrás de `/recap`.

**¿La página contacta con algún servidor al abrirla?**
No. No tiene JavaScript ni enlaces externos que cargar. La CI revisa cada renderizado en busca de una etiqueta `<script>`.

**¿La puntuación 9.7/10 viene de un modelo?**
No. Es un conjunto de comprobaciones fijas sobre estructura, citas y número de palabras. Dan la misma puntuación cada vez. No leen las fuentes.

**¿Los hooks cambiarán mis otros proyectos?**
No. Miran la carpeta de trabajo de la sesión, no la carpeta del archivo que se edita. Solo actúan si esa carpeta o una superior tiene un archivo `recap-studio.config.*`, una carpeta `.recap-studio/`, o es este repositorio. `RECAP_HOOKS_EVERYWHERE=1` los activa en todas partes.

**¿Por qué no publicar la CLI en npm?**
No hace falta. La CLI es un solo archivo sin dependencias, así que `npx -y github:Aboudjem/recap-studio` la ejecuta directamente.

## Límites

- La puntuación es una comprobación aproximada (una heurística). Comprueba la forma, no la verdad. Lee las fuentes antes de compartir una página.
- La calidad de la investigación depende de tu agente. La CLI renderiza el contenido que le das; no investiga.
- Sin conexión, los diagramas Mermaid (gráficos escritos como texto) se ven como texto. Usa diagramas SVG en su lugar: `kind: "svg"`.
- Cinco herramientas MCP no hacen todo el trabajo (son esbozos). `render_page_screenshot`, `run_accessibility_scan` y `run_lighthouse_summary` responden `skipped`: el servidor no incluye un navegador.
- Las herramientas de despliegue y correo nunca despliegan ni envían. `deploy_vercel_preview` devuelve un comando de shell para ejecutar tú. `send_email_draft` devuelve un borrador para pegar en tu cliente de correo.
- Codex puede bloquear las herramientas de escritura. En una ejecución de `codex exec`, su revisión de aprobación bloqueó `render_recap_html`. Las de lectura funcionaron.

## Más información

- [Configuración de editores](../docs/editors.md), [referencia de la CLI](../docs/cli.md), [herramientas MCP](../docs/mcp-tools.md)
- [FAQ](../docs/faq.md) y [comparación](../docs/comparison.md)
- [Arquitectura](../docs/architecture.md), [sistema de agentes](../docs/agent-system.md), [seguridad y privacidad](../docs/security-and-privacy.md)
- [Changelog](../CHANGELOG.md) y [cómo contribuir](../CONTRIBUTING.md)

---

<p align="center">
  <sub>Creado por <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> · Licencia MIT · Sin telemetría</sub>
</p>

---

*Esta traducción se ha generado con ayuda de una máquina. Se agradecen los PR de hablantes nativos de español para corregirla y mejorarla. La fuente de referencia definitiva es el README en inglés ([../README.md](../README.md)).*
