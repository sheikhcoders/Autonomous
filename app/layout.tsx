import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vercel AI Elements Chatbot",
  description:
    "A full-featured, hackable Next.js AI chatbot starter powered by Vercel AI Elements-style primitives."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
