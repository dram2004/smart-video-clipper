// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // <--- Import Inter
import "./globals.css";

// Configure the font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Texas A&M Note Taker",
  description: "AI-Powered Lecture Summaries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the font here */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}