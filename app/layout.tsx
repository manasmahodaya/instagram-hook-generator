import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instagram Hook Generator — Scroll-stopping hooks for Indian creators",
  description: "Generate viral Instagram hooks tailored for the Indian audience. Pain hooks, curiosity hooks, contrarian hooks, and authority hooks powered by AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
