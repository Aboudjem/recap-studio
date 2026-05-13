import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { Section } from "~/components/ui/Section";
import { Card } from "~/components/ui/Card";

interface Props {
  content: RecapPageContent;
}

export function ExamplesAndAnalogies({ content }: Props) {
  return (
    <Section id="examples" eyebrow="Examples & analogies" title="Make it concrete">
      <div className="grid gap-4 md:grid-cols-2">
        {content.examples.map((e) => (
          <Card key={e.id}>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Example</p>
            <h3 className="mt-1 font-display text-lg">{e.title}</h3>
            <p className="recap-prose mt-2 text-sm text-muted dark:text-muted-dark">{e.body}</p>
          </Card>
        ))}
        {content.analogies.map((a) => (
          <Card key={a.id}>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Analogy</p>
            <p className="recap-prose mt-1 text-base font-medium">{a.setup}</p>
            <p className="recap-prose mt-2 text-sm text-muted dark:text-muted-dark">{a.takeaway}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
