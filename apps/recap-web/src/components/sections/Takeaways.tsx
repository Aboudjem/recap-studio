import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { Section } from "~/components/ui/Section";

interface Props {
  content: RecapPageContent;
}

export function Takeaways({ content }: Props) {
  return (
    <Section id="takeaways" eyebrow="Practical takeaways" title="Things to do today">
      <ul className="space-y-3">
        {content.practicalTakeaways.map((t, i) => (
          <li key={i} className="flex items-start gap-3 text-base">
            <span
              aria-hidden
              className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-bold text-white"
            >
              ✓
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
