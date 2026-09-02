<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-light.svg">
  <img alt="Recap Studio: cualquier tema, un solo archivo que abres con doble clic" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg" width="100%">
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
  <b>Español</b> ·
  <a href="fr.md">Français</a>
</p>

<p align="center"><b>Convierte cualquier tema o sesión de código en una página explicativa oscura y pensada para móvil que abres con doble clic.</b><br><sub>Sin servidor, sin internet, sin dependencias.</sub></p>

<p align="center">
  <a href="#qué-hace">Qué hace</a> ·
  <a href="#instalación">Instalación</a> ·
  <a href="#cómo-usarlo">Cómo usarlo</a> ·
  <a href="#en-tu-editor">En tu editor</a> ·
  <a href="#más-información">Más información</a>
</p>

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

## Qué hace

Haces una pregunta, o terminas una tarde desordenada de commits. Quieres una sola cosa que puedas leer después, o enviar a un compañero, sin iniciar sesión, sin un documento alojado y sin un paso de compilación.

Recap Studio toma un tema (`"Latest AI models"`) o una sesión de código (`git diff` más los commits) y escribe **un solo archivo HTML**. Todos los estilos van incrustados, no hay JavaScript y la página no hace ninguna petición externa. Haz doble clic en el Finder o el Explorador y se abre, sin conexión.

- **Una página que se lee en unos cinco minutos**: una respuesta en una frase, los puntos que de verdad importan, un mapa conceptual en SVG incrustado, las ideas principales, los errores comunes, un glosario y las fuentes citadas.
- **Una puntuación que puedes poner en CI**: siete comprobaciones deterministas sobre estructura, citas, recuento de palabras y búsqueda de secretos.
- **Un archivo que puedes enviar por correo**: ningún servidor que mantener, ningún enlace que se rompa.

<img alt="Una página de Recap Studio renderizada: cabecera oscura, una respuesta en una frase y una ruta de lectura numerada de cinco pasos" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/page-preview.png" width="100%">

## Instalación

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

`10x` es un marketplace de plugins, una lista desde la que Claude Code puede instalar. Añadirlo una vez pone a tu disposición `recap-studio` y sus herramientas hermanas.

Para cualquier otro agente, las cuatro skills se instalan con la CLI de skills:

```bash
npx skills add Aboudjem/recap-studio
```

<details>
<summary>Otras formas de instalarlo</summary>

```bash
# Pick the agent explicitly
npx skills add Aboudjem/recap-studio -a codex

# Or use the repo's own installer, which delegates to the same CLI
curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s codex

# --legacy copies the skills by hand, for machines without npx
bash install.sh codex --legacy
```

`install.sh --update` actualiza una instalación e `install.sh --uninstall` la elimina. En Windows se usa `install.ps1 <platform>` desde un clon.
</details>

## Cómo usarlo

**1. Pide una página.** En cualquier sesión de Claude Code:

```
/recap "What is React Server Components"
```

Recap Studio investiga el tema, contrasta cada afirmación con las fuentes que encuentra, genera la página y la abre. `/recap session` hace lo mismo con tu última tanda de commits.

**2. O genera una página desde contenido que ya tienes.** Desde un clon, con la CLI:

```bash
pnpm install && pnpm -w build
node packages/cli/dist/index.js render fixtures/topics/latest-ai-models.json
```

```
recap: wrote latest-ai-models.html (49.8 KB, self-contained, double-click to open)
```

**3. Puntúala antes de enviarla.**

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

Añade `--json` y la misma ejecución escribe un único documento JSON en la salida estándar, que un job de CI puede leer con `jq`.

## Qué obtienes

| Artefacto | Qué es |
|:--|:--|
| `recap-<slug>.html` | Una página autónoma. Todo el CSS incrustado, cero JavaScript, cero peticiones externas. |
| `--format md` o `txt` | La misma página como archivo Markdown o de texto plano, para el cuerpo de una pull request o una nota de commit. |
| `--print` | Un render para papel: fondo blanco, texto negro, saltos de página razonables y las URLs de las fuentes escritas. |
| Un informe de validación | Siete dimensiones puntuadas, una lista de bloqueantes y un código de salida. |
| `--fail-under <score>` | Sale con 1 cuando la puntuación global queda por debajo de tu umbral. Un bloqueante hace fallar la ejecución sea cual sea la puntuación. |

## En tu editor

Funciona en Claude Code, Cursor, Codex, Copilot, Gemini CLI y más de 70 agentes más mediante `npx skills add`.

| Agente | Instalación en una línea |
|:--|:--|
| Claude Code | `claude plugin install recap-studio@10x` |
| Cualquiera de los 70+ agentes | `npx skills add Aboudjem/recap-studio` |
| Codex, Gemini, OpenCode, Pi | `bash install.sh <agent>` |
| VS Code (Copilot) | `bash install.sh copilot` |
| Todo lo demás | ver [docs/editors.md](../docs/editors.md) |

<details>
<summary>Añadirlo como servidor MCP en su lugar</summary>

El servidor MCP es local, así que primero hace falta un clon compilado:

```bash
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
pnpm install && pnpm -w build
claude mcp add recap-studio node -- packages/mcp-server/dist/index.js
```

En este repositorio no hay ningún `.mcp.json`. Cursor, VS Code, Codex, Gemini CLI, Windsurf, Continue, OpenCode y Zed esperan la misma orden en su propio formato; todos los fragmentos están en [docs/editors.md](../docs/editors.md).
</details>

## Conviene saberlo

> [!IMPORTANT]
> Todo efecto secundario está desactivado por defecto. Ninguna llamada de red, ningún despliegue, ningún correo, ninguna escritura de secretos, ningún git destructivo. `RECAP_STUDIO_FIXTURE_ONLY=1` es el estado inicial, así que la demo se ejecuta con fixtures y nada sale al exterior.

- **La página generada no lleva JavaScript.** La CI lo comprueba en cada push: el HTML renderizado no tiene ninguna etiqueta `<script>` ni ninguna referencia `/_next/`.
- **La puntuación es una heurística, no una revisión.** `validate` ejecuta siete comprobaciones deterministas. No descarga fuentes ni llama a ningún modelo. Los 13 agentes especializados solo se ejecutan dentro de Claude Code, mediante `/recap`.
- **73 tests pasan** en seis proyectos del workspace, en Node 20 y 22. En npm solo hay un paquete de redirección, así que la CLI se ejecuta desde un clon.

> [!CAUTION]
> Un "9,7 sobre 10" que quizá veas en documentos antiguos viene de ese verificador heurístico, no de revisores. Léelo como una señal estructural, no como una revisión por pares.

## Más información

- [Configuración de editores](../docs/editors.md), cada agente y cada fragmento MCP
- [Referencia de la CLI](../docs/cli.md), cada comando y cada opción
- [FAQ](../docs/faq.md) y [comparativa](../docs/comparison.md)
- [Arquitectura](../docs/architecture.md), [sistema de agentes](../docs/agent-system.md), [seguridad y privacidad](../docs/security-and-privacy.md)
- [Registro de cambios](../CHANGELOG.md) y [cómo contribuir](../CONTRIBUTING.md)

---

<p align="center">
  <sub>Creado por <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> · Licencia MIT · Sin telemetría</sub>
</p>

---

*Esta traducción se ha generado con ayuda de una máquina. Se agradecen los PR de hablantes nativos de español para corregirla y mejorarla. La fuente de referencia definitiva es el README en inglés ([../README.md](../README.md)).*
