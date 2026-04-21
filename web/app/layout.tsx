import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scalor — Big-O complexity analyzer",
  description:
    "Paste a function, get AI-derived time and space complexity with reasoning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
