import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { Section } from "~/components/ui/Section";

interface Props {
  content: RecapPageContent;
}

export function Timeline({ content }: Props) {
  const items = content.timeline ?? [];
  if (items.length === 0) return null;
  return (
    <Section id="timeline" eyebrow="Timeline" title="How we got here">
      <ol className="space-y-4 border-l-2 border-accent/30 pl-5">
        {items.map((t) => (
          <li key={t.date} className="relative">
            <span
              aria-hidden
              className="absolute -left-[27px] top-2 inline-block h-3 w-3 rounded-full border-2 border-accent bg-canvas dark:bg-canvas-dark"
            />
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">{t.date}</p>
            <h3 className="mt-1 font-display text-lg">{t.title}</h3>
            <p className="recap-prose mt-1 text-sm text-muted dark:text-muted-dark">
              {t.body}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
