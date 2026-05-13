import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { Section } from "~/components/ui/Section";
import { Mermaid } from "~/components/diagrams/Mermaid";

interface Props {
  content: RecapPageContent;
}

export function ConceptMap({ content }: Props) {
  const diagrams = content.diagrams;
  if (diagrams.length === 0) return null;
  return (
    <Section id="concept" eyebrow="Concept map" title="How the pieces fit together">
      <div className="grid gap-4">
        {diagrams.map((d) => (
          <Mermaid key={d.id} id={d.id} code={d.code} alt={d.alt} />
        ))}
      </div>
    </Section>
  );
}
