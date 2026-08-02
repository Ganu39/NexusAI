import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "NexusAI — AI Knowledge Workspace",
  description:
    "Enterprise-grade AI Knowledge Workspace powered by Retrieval-Augmented Generation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
