import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { Section } from "~/components/ui/Section";

interface Props {
  content: RecapPageContent;
}

/**
 * The practice section: retrieval checks, cloze lines, and the revision plan.
 *
 * Two rules drive the markup:
 *
 * 1. The reader commits before they see anything. Choosing an option is a
 *    radio input, so the page can style the chosen row (`peer-checked`)
 *    without telling the reader whether it was right. The verdict lives
 *    inside a closed `<details>`, so feedback arrives strictly after the
 *    answer (Roediger & Butler 2011).
 * 2. No JavaScript. Radios and `<details>` are the entire mechanism, which is
 *    what keeps the standalone HTML self-contained and offline-readable.
 *
 * Nothing here is scored or stored. A static page has no memory, and a fake
 * score would be a fluency signal, which is the failure mode this section
 * exists to avoid.
 */
export function CheckBlock({ content }: Props) {
  const learn = content.learn;
  const checks = learn?.checks ?? [];
  const cloze = learn?.cloze ?? [];
  const revision = learn?.revision;
  const revisionRows: Array<[string, string]> = [];
  if (revision?.d1) revisionRows.push(["Day 1", revision.d1]);
  if (revision?.d3) revisionRows.push(["Day 3", revision.d3]);
  if (revision?.d7) revisionRows.push(["Day 7", revision.d7]);

  if (checks.length === 0 && cloze.length === 0 && revisionRows.length === 0) {
    return null;
  }

  return (
    <Section
      id="checks"
      eyebrow="Check yourself"
      title="Answer first, then look"
    >
      {checks.length > 0 ? (
        <ol className="grid gap-4">
          {checks.map((check) => {
            const right = check.options[check.answer];
            return (
              <li key={check.id}>
                <fieldset
                  data-learn="check"
                  data-check-id={check.id}
                  className="rounded-md border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark"
                >
                  <legend className="px-1 text-base font-semibold leading-relaxed">
                    {check.prompt}
                  </legend>
                  <div className="mt-3 grid gap-2">
                    {check.options.map((option, i) => {
                      const inputId = `${check.id}-option-${i}`;
                      return (
                        <label
                          key={inputId}
                          htmlFor={inputId}
                          className="flex cursor-pointer items-start gap-3 rounded-sm border border-line bg-canvas px-3 py-2 text-sm dark:border-line-dark dark:bg-canvas-dark"
                        >
                          <input
                            type="radio"
                            id={inputId}
                            name={`check-${check.id}`}
                            value={i}
                            className="peer mt-1 accent-accent"
                          />
                          <span className="peer-checked:font-semibold peer-checked:text-accent">
                            {option}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <details className="mt-3 rounded-sm border border-line px-3 py-2 dark:border-line-dark">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-accent">
                      Show the answer
                    </summary>
                    {right ? (
                      <p className="mt-2 text-sm">
                        <span className="font-semibold">Answer: </span>
                        {right}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-muted dark:text-muted-dark">
                      {check.why}
                    </p>
                  </details>
                </fieldset>
              </li>
            );
          })}
        </ol>
      ) : null}

      {cloze.length > 0 ? (
        <div className="mt-6 grid gap-3" data-learn="cloze">
          {cloze.map((item, i) => (
            <div
              key={i}
              className="rounded-md border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark"
            >
              <p className="text-base leading-relaxed">{item.text}</p>
              <details className="mt-2">
                <summary className="cursor-pointer list-none text-sm font-semibold text-accent">
                  Show the missing words
                </summary>
                <p className="mt-2 text-sm text-muted dark:text-muted-dark">
                  {item.blanks.join(" · ")}
                </p>
              </details>
            </div>
          ))}
        </div>
      ) : null}

      {revisionRows.length > 0 ? (
        <div className="mt-6" data-learn="revision">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-muted-dark">
            Come back
          </p>
          <ul className="mt-2 grid gap-2">
            {revisionRows.map(([label, prompt]) => (
              <li
                key={label}
                className="rounded-sm border border-line bg-surface px-3 py-2 text-sm dark:border-line-dark dark:bg-surface-dark"
              >
                <span className="font-semibold">{label}: </span>
                {prompt}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted dark:text-muted-dark">
            The page cannot remind you. Spacing works, but the calendar is yours.
          </p>
        </div>
      ) : null}
    </Section>
  );
}
