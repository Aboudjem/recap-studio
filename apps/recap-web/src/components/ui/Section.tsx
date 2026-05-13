import type { PropsWithChildren } from "react";

interface Props {
  id: string;
  title?: string;
  eyebrow?: string;
}

export function Section({
  id,
  title,
  eyebrow,
  children,
}: PropsWithChildren<Props>) {
  return (
    <section
      id={id}
      data-section-id={id}
      aria-labelledby={title ? `${id}-title` : undefined}
      className="mt-16 scroll-mt-24 first:mt-0 md:mt-24"
    >
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2
          id={`${id}-title`}
          className="font-display text-2xl leading-tight md:text-3xl"
        >
          {title}
        </h2>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
