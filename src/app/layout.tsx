import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TEK Rush",
  description: "TEK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Analytics />
      <html
        lang="en"
        className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col font-body">{children}</body>
      </html>
    </>
  );
}