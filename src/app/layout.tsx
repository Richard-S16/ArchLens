import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArchLens: Repository Architecture Intelligence",
  description:
    "AI-powered repository architecture analysis. Visualize dependencies, detect technical debt, and get AI-powered architectural recommendations.",
  keywords: ["architecture", "repository", "analysis", "AI", "visualization", "dependency graph", "technical debt"],
  openGraph: {
    title: "ArchLens: Repository Architecture Intelligence",
    description:
      "Paste a GitHub URL. ArchLens maps your repository structure, visualizes dependencies, and surfaces architectural insights powered by AI.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArchLens: Repository Architecture Intelligence",
    description:
      "Paste a GitHub URL. ArchLens maps your repository structure, visualizes dependencies, and surfaces architectural insights powered by AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

