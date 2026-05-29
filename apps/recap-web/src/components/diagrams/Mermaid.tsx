"use client";

/**
 * Mermaid — real client renderer.
 *
 * Renders the diagram with mermaid.js on the client. SSR markup keeps a
 * <pre> fallback for no-JS readers and the figcaption for screen readers.
 * Dark theme + Inter font baked in to match the site shell.
 */
import { useEffect, useId, useRef, useState } from "react";

interface Props {
  id: string;
  code: string;
  alt: string;
}

export function Mermaid({ id, code, alt }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const localId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily:
            'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          themeVariables: {
            background: "#15151B",
            primaryColor: "#1F1647",
            primaryTextColor: "#F2F1EE",
            primaryBorderColor: "#7C5CFF",
            lineColor: "#A4A4B0",
            textColor: "#F2F1EE",
            mainBkg: "#1F1647",
            secondaryColor: "#23232B",
            tertiaryColor: "#0B0B0F",
            nodeBorder: "#7C5CFF",
            clusterBkg: "#15151B",
            clusterBorder: "#23232B",
            edgeLabelBackground: "#15151B",
          },
        });
        const renderId = `m-${id}-${localId}`;
        const { svg } = await mermaid.render(renderId, code);
        if (!cancelled) setSvg(svg);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "mermaid error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, id, localId]);

  return (
    <figure
      aria-labelledby={`${id}-caption`}
      className="overflow-hidden rounded-lg border border-line bg-surface dark:border-line-dark dark:bg-surface-dark"
    >
      {svg ? (
        <div
          ref={containerRef}
          className="overflow-x-auto px-4 py-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : err ? (
        <pre className="m-0 max-h-[420px] overflow-auto px-4 py-4 text-xs leading-relaxed text-err">
          <code className="font-mono">Diagram failed to render: {err}</code>
        </pre>
      ) : (
        <div
          className="flex min-h-[140px] items-center justify-center px-4 py-6 text-xs text-muted dark:text-muted-dark"
          aria-hidden
        >
          Rendering diagram…
        </div>
      )}
      <figcaption
        id={`${id}-caption`}
        className="border-t border-line bg-canvas px-4 py-2 text-xs text-muted dark:border-line-dark dark:bg-canvas-dark dark:text-muted-dark"
      >
        {alt}
      </figcaption>
    </figure>
  );
}
