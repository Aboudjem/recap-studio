import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { Section } from "~/components/ui/Section";

interface Props {
  content: RecapPageContent;
}

export function Glossary({ content }: Props) {
  return (
    <Section id="glossary" eyebrow="Glossary" title="Plain-English definitions">
      <details className="group rounded-md border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold">
          {content.glossary.length} terms — tap to expand
          <span
            aria-hidden
            className="float-right text-muted transition-transform group-open:rotate-180 dark:text-muted-dark"
          >
            ⌄
          </span>
        </summary>
        <dl className="grid gap-x-6 gap-y-3 border-t border-line px-4 py-4 text-sm md:grid-cols-2 dark:border-line-dark">
          {content.glossary.map((g) => (
            <div key={g.term} className="break-inside-avoid">
              <dt className="font-semibold">{g.term}</dt>
              <dd className="text-muted dark:text-muted-dark">{g.definition}</dd>
            </div>
          ))}
        </dl>
      </details>
    </Section>
  );
}
