import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { Section } from "~/components/ui/Section";

interface Props {
  content: RecapPageContent;
}

/**
 * Mobile-first comparison: a table on md+, stacked cards on small screens.
 */
export function Comparison({ content }: Props) {
  const blocks = content.comparisons ?? [];
  if (blocks.length === 0) return null;
  return (
    <Section id="compare" eyebrow="Side by side" title="Compare the options">
      {blocks.map((c) => (
        <div key={c.id} className="space-y-6">
          <h3 className="font-display text-lg">{c.title}</h3>

          {/* Cards on small screens */}
          <div className="grid gap-3 md:hidden">
            {c.rows.map((row) => (
              <div
                key={row.name}
                className="rounded-md border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark"
              >
                <p className="text-sm font-semibold text-accent">{row.name}</p>
                <dl className="mt-2 space-y-1.5">
                  {c.columns.map((col) => (
                    <div key={col}>
                      <dt className="text-xs uppercase tracking-wide text-muted dark:text-muted-dark">
                        {col}
                      </dt>
                      <dd className="text-sm">{row.cells[col] ?? "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          {/* Table on md+ */}
          <div className="hidden overflow-hidden rounded-md border border-line md:block dark:border-line-dark">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-canvas dark:bg-canvas-dark">
                <tr>
                  {c.columns.map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="border-b border-line px-4 py-3 text-left font-semibold dark:border-line-dark"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.rows.map((row) => (
                  <tr key={row.name} className="odd:bg-surface even:bg-canvas dark:odd:bg-surface-dark dark:even:bg-canvas-dark">
                    {c.columns.map((col) => (
                      <td key={col} className="px-4 py-3 align-top">
                        {row.cells[col] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </Section>
  );
}
