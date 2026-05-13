import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { Section } from "~/components/ui/Section";

interface Props {
  content: RecapPageContent;
}

export function Misconceptions({ content }: Props) {
  return (
    <Section id="myths" eyebrow="Common myths" title="What people get wrong">
      <ul className="grid gap-4 md:grid-cols-2">
        {content.misconceptions.map((m) => (
          <li
            key={m.id}
            className="overflow-hidden rounded-md border border-line dark:border-line-dark"
          >
            <div className="bg-canvas px-4 py-3 dark:bg-canvas-dark">
              <p className="text-xs font-semibold uppercase tracking-wider text-err">Myth</p>
              <p className="mt-1 text-sm">{m.myth}</p>
            </div>
            <div className="border-t border-line bg-surface px-4 py-3 dark:border-line-dark dark:bg-surface-dark">
              <p className="text-xs font-semibold uppercase tracking-wider text-ok">Truth</p>
              <p className="mt-1 text-sm">{m.truth}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
