import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./atlas.css";
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
  title: "ArchLens — GitHub repository maps",
  description:
    "Map a public GitHub repository, follow imports, and review architecture findings.",
  keywords: ["architecture", "repository", "analysis", "AI", "visualization", "dependency graph", "technical debt"],
  openGraph: {
    title: "ArchLens — GitHub repository maps",
    description:
      "Map a public GitHub repository, follow imports, and review architecture findings.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArchLens — GitHub repository maps",
    description:
      "Map a public GitHub repository, follow imports, and review architecture findings.",
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
