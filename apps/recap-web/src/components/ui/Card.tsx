import type { PropsWithChildren } from "react";

interface Props {
  className?: string;
}

export function Card({ className = "", children }: PropsWithChildren<Props>) {
  return (
    <div
      className={
        "rounded-lg border border-line bg-surface p-5 shadow-soft transition-shadow " +
        "hover:shadow-card dark:border-line-dark dark:bg-surface-dark " +
        className
      }
    >
      {children}
    </div>
  );
}
