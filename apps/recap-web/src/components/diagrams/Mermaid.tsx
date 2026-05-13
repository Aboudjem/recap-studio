/**
 * Mermaid — SSR-safe placeholder.
 *
 * We render the diagram source as a labeled <pre> block plus a screen-reader
 * description. This keeps the page static-first and dependency-free. A
 * later phase can plug a real client renderer; the surface stays the same.
 */
interface Props {
  id: string;
  code: string;
  alt: string;
}

export function Mermaid({ id, code, alt }: Props) {
  return (
    <figure
      aria-labelledby={`${id}-caption`}
      className="overflow-hidden rounded-lg border border-line bg-surface dark:border-line-dark dark:bg-surface-dark"
    >
      <pre
        className="m-0 max-h-[420px] overflow-auto px-4 py-4 text-xs leading-relaxed text-ink/80 dark:text-ink-dark/80"
        aria-hidden
      >
        <code className="font-mono">{code}</code>
      </pre>
      <figcaption
        id={`${id}-caption`}
        className="border-t border-line bg-canvas px-4 py-2 text-xs text-muted dark:border-line-dark dark:bg-canvas-dark dark:text-muted-dark"
      >
        {alt}
      </figcaption>
    </figure>
  );
}
