"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  sections: string[];
}

const LABELS: Record<string, string> = {
  hero: "Start",
  matters: "What matters",
  "concept-map": "Map",
  ideas: "Ideas",
  timeline: "Timeline",
  comparison: "Compare",
  examples: "Examples",
  analogies: "Analogies",
  misconceptions: "Myths",
  glossary: "Glossary",
  takeaways: "Takeaways",
  sources: "Sources",
  "deep-dive": "Deep dive",
};

/**
 * ProgressRail — a persistent visual cue showing where the reader is on the
 * page. Hidden on mobile to keep the layout calm; appears as a vertical rail
 * on md+. Reduced-motion users see a static rail.
 */
export function ProgressRail({ sections }: Props) {
  const [active, setActive] = useState<string>(sections[0] ?? "");
  const refs = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    refs.current?.disconnect();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const id = e.target.getAttribute("data-section-id");
            if (id) setActive(id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    for (const id of sections) {
      const el = document.querySelector(`[data-section-id="${id}"]`);
      if (el) io.observe(el);
    }
    refs.current = io;
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Section progress"
      className="pointer-events-none fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 md:block"
    >
      <ol className="pointer-events-auto flex flex-col gap-3">
        {sections.map((id) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={
                "block text-xs font-medium transition-colors " +
                (active === id
                  ? "text-accent"
                  : "text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark")
              }
            >
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className={
                    "inline-block h-1.5 w-1.5 rounded-full " +
                    (active === id
                      ? "bg-accent"
                      : "bg-line dark:bg-line-dark")
                  }
                />
                {LABELS[id] ?? id}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
