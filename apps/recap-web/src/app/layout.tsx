import type { Metadata, Viewport } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://recap.studio"),
  title: {
    default: "Recap Studio",
    template: "%s — Recap Studio",
  },
  description:
    "A visual, mobile-first one-page explainer for any topic or coding session.",
  openGraph: {
    type: "website",
    title: "Recap Studio",
    description:
      "A visual, mobile-first one-page explainer for any topic or coding session.",
    images: ["/og.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recap Studio",
    description:
      "A visual, mobile-first one-page explainer for any topic or coding session.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0F" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <body className="bg-canvas text-ink antialiased dark:bg-canvas-dark dark:text-ink-dark">
        <a className="recap-skip-link" href="#summary">
          Skip to summary
        </a>
        {children}
      </body>
    </html>
  );
}
