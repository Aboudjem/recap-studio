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

<p align="center"><b>Convierte cualquier tema o sesión de programación en un explicador precioso, en modo oscuro y mobile-first, que puedes abrir con doble clic. Sin servidor, sin internet, sin dependencias.</b></p>

<p align="center">
  <sub>HTML offline autocontenido · fuente sans-serif Inter · diagramas SVG en línea · cero JavaScript</sub>
</p>

<p align="center">
  <a href="../README.md">English</a> ·
  <a href="zh-CN.md">简体中文</a> ·
  <a href="ja.md">日本語</a> ·
  <b>Español</b> ·
  <a href="fr.md">Français</a>
</p>

<p align="center">
  <a href="#qué-es-esto">Qué es esto</a> ·
  <a href="#empieza-en-3-pasos">Empieza</a> ·
  <a href="#en-claude-code">En Claude Code</a> ·
  <a href="#en-cualquier-parte-cli">En cualquier parte (CLI)</a> ·
  <a href="#preguntas-frecuentes">FAQ</a> ·
  <a href="#comparación">Comparación</a> ·
  <a href="#por-qué-confiar">Por qué confiar</a> ·
  <a href="../docs/architecture.md">Docs</a>
</p>

<picture>
  <img alt="A real Recap Studio page: dark-mode hero with a gradient headline 'Latest AI models', a one-sentence answer, and a numbered five-step reading path. Calm, premium, mobile-first." src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/page-preview.png" width="100%">
</picture>

### Míralo en acción

Una ejecución real de `/recap "what is creatine"`, investigada en vivo, con cada afirmación verificada contra fuentes primarias (ISSN, NIH), y luego renderizada en una sola página autocontenida:

![recap-studio demo](https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/demo.gif)

<sub>Recorrido animado de una página generada por Recap Studio sobre la creatina: hero en modo oscuro, un diagrama SVG en línea del ciclo de energía, tarjetas de ideas clave con iconos y una lista de fuentes que cita a NIH e ISSN.</sub>

---

## Qué es esto

Recap Studio toma un tema (`"Latest AI models"`) o una sesión de programación (`git diff` + commits) y produce **un único archivo HTML autocontenido**: en modo oscuro, mobile-first, con una respuesta hero, tarjetas de conclusiones, un mapa conceptual SVG en línea, una línea de tiempo, una tabla comparativa, malentendidos, un glosario y fuentes citadas.

**El superpoder que ninguna otra herramienta tiene:** la salida es un archivo `.html` con todos los estilos en línea, cero JavaScript y cero peticiones externas. Haz doble clic en él en Finder o el Explorador y se abre perfectamente, sin Wi-Fi, sin servidor y sin `npm install`.

Lo que obtienes en la página:

| Sección | Propósito |
| --- | --- |
| Hero | Una respuesta de una frase, no una introducción de marketing |
| Lo que importa | Tres conclusiones, en tipografía grande, por encima del pliegue |
| Mapa conceptual | Diagrama SVG en línea, nunca decoración |
| Ideas clave | De cuatro a siete tarjetas breves |
| Línea de tiempo | Solo cuando existe una cronología real |
| Comparación | Tabla en escritorio, tarjetas apiladas en móvil |
| Ejemplos + analogías | Lo concreto primero, las abstracciones después |
| Malentendidos | El mito a la izquierda, la verdad a la derecha |
| Glosario | Definiciones en lenguaje sencillo, plegadas por defecto |
| Conclusiones | Cosas que puedes poner en práctica hoy |
| Fuentes | Cada afirmación enlaza a una entrada de `sourceMap` |

---

## Empieza en 3 pasos

**1. Instala el plugin desde el [10x marketplace](https://github.com/Aboudjem/10x):**

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

**2. Abre cualquier sesión de Claude Code y ejecuta:**

```
/recap "What is React Server Components"
```

**3. Un `recap-<slug>.html` autocontenido se abre en tu navegador. Listo.**

> [!NOTE]
> Nada se comunica con el exterior. No hace falta una clave de API de pago para probarlo. `RECAP_STUDIO_FIXTURE_ONLY=1` es el valor por defecto, así que la demo se ejecuta enteramente desde fixtures.

---

## En Claude Code

Instala una vez a través del 10x marketplace (ver arriba). Luego usa estos comandos en cualquier sesión de Claude Code:

| Comando | Qué hace |
| --- | --- |
| `/recap "<topic>"` | Construir una página explicadora completa a partir de cualquier tema |
| `/recap session` | Recapitular una sesión de programación desde `git diff` + commits |
| `/recap session --deep` | Lo mismo, con un acordeón de análisis por archivo |
| `/recap setup` | Crear `recap-studio.config.ts` con valores seguros por defecto |
| `/recap validate` | Volver a puntuar la página activa (comprobación heurística, ver abajo) |

Tras cada ejecución, la skill renderiza el HTML autocontenido, lo abre y pregunta «Deploy to Vercel?» **solo si Vercel está configurado y solo con tu sí explícito.**

> [!TIP]
> `10x` es el marketplace de plugins en [github.com/Aboudjem/10x](https://github.com/Aboudjem/10x). Te permite instalar Recap Studio (y otras herramientas) sin clonar este repositorio.

---

## Instala las skills en cualquier CLI de IA

Claude Code es el host de primera clase (a través del 10x marketplace de arriba). Para cargar las cuatro skills de `/recap` directamente en otro CLI, ejecuta el instalador de una sola línea. Crea enlaces simbólicos de `recap-topic`, `recap-session`, `recap-setup` y `recap-validate` en el directorio de skills de ese CLI; `--update` trae lo último y vuelve a enlazar, `--uninstall` los elimina.

```bash
curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s codex
```

En Windows, ejecuta `install.ps1 <platform>` desde un checkout (se necesita el Modo Desarrollador o una shell elevada para los enlaces simbólicos).

| Plataforma | Directorio de skills | Una línea |
|:--|:--|:--|
| Claude Code | (plugin) | `claude plugin install recap-studio@10x` |
| Codex / Gemini / OpenCode / Pi | `~/.agents/skills` | `install.sh codex` |
| VS Code (Copilot) | `~/.copilot/skills` | `install.sh copilot` |
| Trae | `~/.trae/skills` | `install.sh trae` |
| Vibe | `~/.vibe/skills` | `install.sh vibe` |
| OpenClaw | `~/.openclaw/skills` | `install.sh openclaw` |
| Antigravity | `~/.gemini/antigravity/skills` | `install.sh antigravity` |
| Hermes / Cline / Kimi | `~/.<cli>/skills` | `install.sh hermes` |

Las convenciones del directorio de skills cambian entre versiones de los CLI. Si un enlace no se resuelve, recurre al servidor MCP local opcional (funciona en cualquier cliente compatible con MCP). Ejecuta `install.sh all` para enlazar todas las plataformas a la vez. Compila el servidor MCP una vez con `pnpm -w build` antes de añadirlo.

<details>
<summary><b>Claude Code</b></summary>

Instalación del plugin con un solo comando desde el [10x marketplace](https://github.com/Aboudjem/10x):

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

O añade solo el servidor MCP local (después de `pnpm -w build`):

```bash
claude mcp add recap-studio node -- packages/mcp-server/dist/index.js
```
</details>

<details>
<summary><b>Cursor</b></summary>

Añade a `~/.cursor/mcp.json` (después de `pnpm -w build`):

```json
{ "mcpServers": { "recap-studio": { "command": "node", "args": ["packages/mcp-server/dist/index.js"] } } }
```
</details>

<details>
<summary><b>VS Code (Copilot)</b></summary>

Añade a `.vscode/mcp.json` (después de `pnpm -w build`):

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

Añade a `~/.gemini/mcp_config.json` (después de `pnpm -w build`):

```json
{ "mcpServers": { "recap-studio": { "command": "node", "args": ["packages/mcp-server/dist/index.js"] } } }
```
</details>

<details>
<summary><b>Windsurf</b></summary>

Añade a `~/.codeium/windsurf/mcp_config.json` (después de `pnpm -w build`):

```json
{ "mcpServers": { "recap-studio": { "command": "node", "args": ["packages/mcp-server/dist/index.js"] } } }
```
</details>

<details>
<summary><b>Continue.dev</b></summary>

Añade a `.continue/mcpServers/recap-studio.yaml` (después de `pnpm -w build`):

```yaml
mcpServers:
  recap-studio: { command: node, args: ["packages/mcp-server/dist/index.js"], type: stdio }
```
</details>

La configuración de copiar y pegar, más una prueba de humo para cada editor, está en [`docs/multi-editor.md`](../docs/multi-editor.md).

---

## En cualquier parte (CLI)

Usa el CLI cuando estés fuera de Claude Code: en cualquier terminal, cualquier editor, CI o un cron job.

**Instalación:**

```bash
# Funciona hoy, desde un clon de este repositorio:
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
pnpm install && pnpm -w build
node packages/cli/dist/index.js render content.json

# Planeado: una vez que @recap-studio/cli se publique en npm, esto será una sola línea.
# AÚN NO está en npm, así que usa la ruta del clon de arriba por ahora:
# npx @recap-studio/cli render content.json
```

**Comandos:**

| Comando | Qué hace |
| --- | --- |
| `recap render <content.json>` | Renderizar un archivo HTML autocontenido desde un JSON de contenido |
| `recap render <content.json> -o out.html` | Escribir en una ruta de salida específica |
| `recap render <content.json> --theme dark\|light\|auto` | Elegir el tema de color (por defecto: dark) |
| `recap validate <content.json>` | Validar la estructura del contenido y salir con código 0/2 |

**Desde la raíz del workspace (si clonaste el repositorio):**

```bash
pnpm -w render              # render the demo content
pnpm -w render:demo         # write artifacts/<slug>/recap-<slug>.html
pnpm -w demo:latest-ai-models && pnpm --filter recap-web dev
```

> [!NOTE]
> `pnpm -w` significa «ejecutar desde la raíz del workspace»; así se invocan los scripts del monorepo. Solo lo necesitas si clonaste este repositorio. `@recap-studio/cli` aún no está publicado en npm, así que la ruta del clon de arriba es la forma de ejecutarlo hoy. Una vez publicado, `npx @recap-studio/cli` lo ejecutará sin clonar nada.

**Otros scripts del workspace:**

| Comando | Qué hace |
| --- | --- |
| `pnpm -w validate:demo` | Puntuar la página activa (comprobación heurística) |
| `pnpm -w history` | Listar cada recap en `artifacts/` con sus puntuaciones |
| `pnpm -w auto-refresh -- <slug>` | Volver a validar un recap almacenado bajo demanda |
| `pnpm --filter recap-web dev` | Vista previa en localhost:3000 (track de Next.js alojado) |
| `pnpm --filter recap-web build` | Compilar el sitio estático alojado |
| `pnpm deploy:preview` | Despliegue de vista previa en Vercel (controlado por config + env) |
| `pnpm deploy:prod` | Despliegue de producción en Vercel (con doble control) |

---

## Preguntas frecuentes

**¿El HTML es realmente autocontenido?**
Sí. Todo el CSS está en línea. Hay cero JavaScript y cero referencias a `/_next/` o a CDN. Verificado: 0 referencias externas, se abre con `file://` en un avión.

**¿Funciona sin conexión a internet?**
Para renderizar: sí, completamente offline. Para la canalización completa de investigación con LLM agents (dentro de Claude Code), sí, usa tu sesión local de Claude Code, no una API externa que tú gestiones.

**¿Qué es la «puntuación»?**
`recap validate` ejecuta una comprobación heurística rápida y determinista que analiza la estructura, la presencia de citas, el recuento de palabras y señales de calidad conocidas. NO obtiene fuentes ni ejecuta LLMs. La revisión completa con LLM agents (13 agents, 7 dimensiones) solo se ejecuta cuando usas `/recap` dentro de Claude Code. Esto se indica claramente en la salida.

**¿Puedo usarlo en VS Code, Cursor o Codex?**
Sí. El servidor MCP (`@recap-studio/mcp-server`) expone una herramienta `render_recap_html`, y el CLI `recap` funciona en cualquier terminal. El transporte MCP cumple la especificación (tipo de `content` `"text"`, con `notifications/initialized` + `ping`) y está cubierto por pruebas unitarias. La configuración de copiar y pegar para Claude Code, Cursor, VS Code, Codex, Gemini, Windsurf y Continue, más una prueba de humo para cada uno, está en [`docs/multi-editor.md`](../docs/multi-editor.md).

**¿Se despliega en algún sitio automáticamente?**
No. El despliegue está `disabled` por defecto. Solo se despliega si configuras Vercel y das tu consentimiento explícito cuando se te pregunta.

**¿Hay una versión web alojada?**
Sí, a través del track de Next.js (`pnpm --filter recap-web dev`). El track alojado y el track offline de archivo único producen el mismo contenido en distintas superficies de renderizado.

---

## Comparación

| Característica | Recap Studio | Notion AI | Gamma | Mintlify | Markdown plano |
| --- | :---: | :---: | :---: | :---: | :---: |
| HTML offline autocontenido | **YES** | No | No | No | No |
| Modo oscuro, mobile-first | **YES** | Partial | Partial | Yes | No |
| Mapas conceptuales SVG en línea | **YES** | No | No | No | No |
| Salida con cero JavaScript | **YES** | No | No | No | Yes |
| Funciona sin un servidor | **YES** | No | No | No | Yes |
| Fuentes citadas en cada afirmación | **YES** | No | No | No | No |
| Recap de sesión desde git diff | **YES** | No | No | No | No |
| CLI (`npx`) fuera de Claude Code | **YES** | No | No | No | n/a |
| Gratis para ejecutar en local | **YES** | Freemium | Freemium | Freemium | Yes |

La fila que importa: **HTML offline autocontenido**. Ninguna otra herramienta de explicadores o changelogs produce un archivo de doble clic con todos los estilos en línea y sin dependencias externas.

---

## Por qué confiar

- **43 pruebas pasan** en 5 paquetes con pruebas. La compilación está en verde. El CI se ejecuta en cada push.
- **Dos casos de uso E2E probados**: explicador de tema (`fixtures/topics/latest-ai-models.json`) y recap de sesión (`session.json`, un recap de la reconstrucción de este código). Ambos se renderizan a HTML autocontenido validado.
- **Puntuación honesta**: la puntuación heurística de `validate` es determinista, así que la misma entrada siempre da la misma puntuación. No es la opinión de un LLM. No se obtiene ninguna fuente. La revisión con LLM solo se ejecuta dentro de Claude Code a través de `/recap`.
- **Valores seguros por defecto**: sin llamadas de red, sin despliegues, sin correos, sin escritura de secretos, sin git destructivo, todo apagado hasta que optes explícitamente por activarlo. Ver [`docs/security-and-privacy.md`](../docs/security-and-privacy.md).
- **Open source, MIT**: lee cada línea. Sin telemetría, sin recolección de datos.
- **La arquitectura es estable**: híbrido de plugin + skills + MCP opcional. Revisado y documentado en [`docs/architecture.md`](../docs/architecture.md).

> [!CAUTION]
> La cifra «9.7 de 10» que puedes ver en documentos antiguos venía del comprobador heurístico, no de 7 revisores LLM ejecutándose en paralelo. El comprobador es rápido y determinista; confía en él como señal estructural, no como una revisión por pares.

---

## Valores seguros por defecto

> [!WARNING]
> Cada efecto secundario está apagado por defecto.

- Sin red. `RECAP_STUDIO_FIXTURE_ONLY=1` es el estado inicial.
- Sin despliegues. `deploymentMode: "disabled"`.
- Sin correos. `emailMode: "disabled"`.
- Sin escritura de secretos. Los hooks rechazan `.env*`, PEMs y rutas con forma de clave.
- Sin git destructivo. Los hooks rechazan `push --force`, `reset --hard`, `rebase`, `clean -fdx`.

Ver [`hooks/README.md`](../hooks/README.md) y [`docs/security-and-privacy.md`](../docs/security-and-privacy.md).

---

## Docs

- [Arquitectura](../docs/architecture.md)
- [Sistema de agents](../docs/agent-system.md)
- [Flujos de trabajo](../docs/workflows.md)
- [Despliegue en Vercel](../docs/vercel-deployment.md)
- [Seguridad y privacidad](../docs/security-and-privacy.md)
- [Configuración](../docs/configuration.md)
- [Contribuir](../CONTRIBUTING.md)
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
  Si Recap Studio te ayudó a publicar un mejor explicador, dale una estrella.<br/>
  Ayuda a que otros desarrolladores encuentren herramientas que respetan su atención.
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

*Esta traducción se generó con asistencia automática. Se agradecen los PR de hablantes nativos de español para corregirla y mejorarla. La fuente de referencia definitiva es el README en inglés ([../README.md](../README.md)).*
