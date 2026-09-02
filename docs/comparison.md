# How it compares

Recap Studio sits between a slide generator and a documentation site. The comparison below is
about output shape, not about which tool is better; Marp, Slidev and Quarto are mature projects
with far wider scope.

| Capability | Recap Studio | Marp | Slidev | Quarto | Gamma |
|:--|:--|:--|:--|:--|:--|
| One self-contained offline HTML file | yes | partial | no | partial | no |
| Zero JavaScript in the output | yes | no | no | no | no |
| Input is a topic or a git session | yes | no | no | no | partial |
| Input is Markdown you already wrote | no | yes | yes | yes | no |
| Cited sources tied to each claim | yes | no | no | yes | no |
| PDF, PPTX, docx export | no | yes | yes | yes | yes |
| Shareable hosted link | no | no | no | no | yes |

The one row that is the whole point: **a page you can email as an attachment, that opens with a
double-click, with no server and no network.** Every style is inlined and there is no script tag,
so the file behaves the same in five years as it does today.

What the others do better, honestly:

- **Marp** and **Slidev** take plain Markdown, which is the format everyone already has, and both
  export PDF. Slidev has a large theme ecosystem and live coding blocks.
- **Quarto** turns one source into HTML, PDF, docx and reveal.js, with cross-references and
  citations from a `.bib` file. If you need multi-format publishing, use Quarto.
- **Gamma** and similar hosted tools give you a link that updates live. Distribution is their
  product; a file on disk is not.
- **SingleFile** is the reference implementation for saving an arbitrary page as one HTML file,
  with a much more thorough asset walker than anything here.

Recap Studio does not try to be any of those. It does one narrow thing: it turns a question or a
diff into a page that reads in about five minutes and survives being emailed.

Prices are deliberately not compared here. They change, and a table in a README goes stale
without anyone noticing.
