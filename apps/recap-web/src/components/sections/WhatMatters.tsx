import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { Section } from "~/components/ui/Section";

interface Props {
  content: RecapPageContent;
}

export function WhatMatters({ content }: Props) {
  return (
    <Section
      id="summary"
      eyebrow="What actually matters"
      title="Three things to remember"
    >
      <ul className="grid gap-3 md:grid-cols-3">
        {content.whyItMatters.map((point, i) => (
          <li
            key={i}
            className="rounded-md border border-line bg-surface p-4 text-base leading-relaxed dark:border-line-dark dark:bg-surface-dark"
          >
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent-ink">
              {i + 1}
            </span>
            {point}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted dark:text-muted-dark">
        Five-minute path: {content.fiveMinutePath.join(" → ")}
      </p>
    </Section>
  );
}
