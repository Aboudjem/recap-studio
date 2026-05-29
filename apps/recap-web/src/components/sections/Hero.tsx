import type { RecapPageContent } from "@recap-studio/content-pipeline";

interface Props {
  content: RecapPageContent;
}

export function Hero({ content }: Props) {
  return (
    <header
      id="hero"
      data-section-id="hero"
      className="pb-2 pt-4 md:pb-6 md:pt-10"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Recap Studio · {content.audienceLevel}
      </p>
      <h1 className="font-sans text-4xl leading-[1.05] md:text-6xl">
        {content.topic}
      </h1>
      <p className="recap-prose mt-6 max-w-2xl text-lg text-muted md:text-xl dark:text-muted-dark">
        {content.oneSentenceAnswer}
      </p>
    </header>
  );
}
