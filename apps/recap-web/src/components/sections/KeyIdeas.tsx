import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { Section } from "~/components/ui/Section";
import { Card } from "~/components/ui/Card";

interface Props {
  content: RecapPageContent;
}

export function KeyIdeas({ content }: Props) {
  return (
    <Section id="ideas" eyebrow="Key ideas" title="The mental model in five cards">
      <div className="grid gap-4 sm:grid-cols-2">
        {content.keyIdeas.map((k) => (
          <Card key={k.id}>
            <h3 className="font-display text-lg leading-snug">{k.title}</h3>
            <p className="recap-prose mt-2 text-sm leading-relaxed text-muted dark:text-muted-dark">
              {k.body}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
