import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { Section } from "~/components/ui/Section";

interface Props {
  content: RecapPageContent;
}

export function Sources({ content }: Props) {
  return (
    <Section id="sources" eyebrow="Sources" title="Where this comes from">
      <ul className="space-y-3">
        {content.sourceMap.map((s) => (
          <li
            key={s.id}
            className="rounded-md border border-line bg-surface p-4 text-sm dark:border-line-dark dark:bg-surface-dark"
          >
            <a
              href={s.url}
              className="font-medium text-accent underline-offset-4 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              {s.title}
            </a>
            <p className="mt-1 text-xs text-muted dark:text-muted-dark">
              {[s.publisher, s.publishedAt, `score ${s.composite}/10`, s.provenance]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {s.summary ? (
              <p className="recap-prose mt-2 text-sm">{s.summary}</p>
            ) : null}
          </li>
        ))}
      </ul>
      {content.uncertaintyNotes.length > 0 ? (
        <div className="mt-6 rounded-md border border-warn/40 bg-warn/10 p-4 text-sm">
          <p className="mb-1 font-semibold">Uncertainty notes</p>
          <ul className="list-disc space-y-1 pl-5">
            {content.uncertaintyNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}
