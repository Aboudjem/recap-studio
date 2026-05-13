/**
 * FixtureBanner — marks pages rendered from offline fixture data so readers
 * never confuse demo content with live, research-backed output.
 */
export function FixtureBanner() {
  return (
    <div
      role="note"
      aria-label="Fixture data notice"
      className="mb-8 rounded-md border border-accent/40 bg-accent-soft px-4 py-3 text-sm text-accent-ink"
    >
      <span className="font-semibold">Fixture data.</span>{" "}
      This page was generated from an offline-safe fixture. Re-run{" "}
      <code className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-xs">
        pnpm demo:latest-ai-models
      </code>{" "}
      after wiring research keys to see live sources.
    </div>
  );
}
