import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { Section } from "~/components/ui/Section";

interface Props {
  content: RecapPageContent;
}

/**
 * Questions asked BEFORE the reader has read anything.
 *
 * Prequestions raise recall for the material they actually name, and barely
 * touch the rest of the page (Pan & Carpenter 2023), so they sit above the
 * five-minute path and name what has to stick. Each question is a closed
 * `<details>`: the hint is one click away, the answer is not here at all.
 *
 * No JavaScript. `<details>` is the whole interaction, which is why the
 * standalone HTML build stays script-free.
 */
export function PreQuestions({ content }: Props) {
  const questions = content.learn?.prequestions ?? [];
  if (questions.length === 0) return null;

  return (
    <Section
      id="prequestions"
      eyebrow="Before you read"
      title="Questions you cannot answer yet"
    >
      <ol className="grid gap-3" data-learn="prequestions">
        {questions.map((q, i) => (
          <li key={i}>
            <details className="rounded-md border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
              <summary className="cursor-pointer list-none px-4 py-3 text-base font-semibold leading-relaxed">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent-ink">
                  {i + 1}
                </span>
                {q.question}
              </summary>
              {q.hint ? (
                <p className="border-t border-line px-4 py-3 text-sm text-muted dark:border-line-dark dark:text-muted-dark">
                  {q.hint}
                </p>
              ) : null}
            </details>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted dark:text-muted-dark">
        Guessing wrong here is the point. Read on, then come back.
      </p>
    </Section>
  );
}
