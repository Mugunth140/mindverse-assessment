import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mindverse Learning Diagnostic",
  description: "Identify foundational math gaps for Grades 5-7.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased bg-brand-ivory`}
    >
      <body className="min-h-full flex flex-col font-sans text-brand-charcoal selection:bg-brand-orange/20 selection:text-brand-indigo">
        {children}
      </body>
    </html>
  );
}
