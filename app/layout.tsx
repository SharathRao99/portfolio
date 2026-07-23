import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "./provider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackgroundAnimation from "../components/BackgroundAnimation";
import ScrollProgress from "../components/motion/ScrollProgress";
import SmoothScroll from "../components/motion/SmoothScroll";
import BackToTop from "../components/motion/BackToTop";
import CommandPalette from "../components/CommandPalette";
import WebMCPTools from "../components/WebMCPTools";
import { personalInfo } from "../lib/data";

const SITE_URL = "https://sharath-portfolio.vercel.app";

// woff2 subsets of the same variable fonts (wght 100–900 intact), trimmed to
// the latin + punctuation/arrow ranges this site actually renders. 132KB of
// .woff became 60KB, and fonts were ~40% of all bytes on the page.
const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  // used above the fold by .eyebrow and the hero code panel, so it has to be
  // preloaded — swapping it in late reflows the hero and shifts the page
  preload: true,
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sharath B C | Full Stack Developer",
    template: "%s | Sharath B C",
  },
  description: "Full-Stack Developer with 3+ years of hands-on experience in frontend, backend, and mobile app development. Specialist in React.js, Next.js, and Node.js.",
  keywords: [
    "Sharath B C",
    "Full Stack Developer",
    "Web Developer",
    "React Developer",
    "Next.js Developer",
    "Mobile App Developer",
    "Portfolio",
    "Software Engineer",
  ],
  authors: [{ name: "Sharath B C" }],
  creator: "Sharath B C",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "Sharath B C | Full Stack Developer",
    description: "Full-Stack Developer skilled in building scalable web and mobile applications using modern technologies.",
    siteName: "Sharath B C Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sharath B C | Full Stack Developer",
    description: "Full-Stack Developer skilled in building scalable web and mobile applications.",
  },
  // No `icons` block: app/icon.png and app/apple-icon.png are picked up by
  // Next's file convention and emitted once each, with content hashes. Listing
  // the same PNG under icon/shortcut/apple made the browser fetch it three
  // times at high priority — 147KB competing with the hero for bandwidth.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Sharath B C",
      jobTitle: "Full Stack Developer",
      email: personalInfo.email,
      url: SITE_URL,
      sameAs: ["https://www.linkedin.com/in/sharath-b-c-45ba01203"],
      knowsAbout: [
        "React.js",
        "Next.js",
        "Node.js",
        "TypeScript",
        "React Native",
        "MySQL",
        "MongoDB",
        "AWS",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Sharath B C Portfolio",
      description:
        "Portfolio of Sharath B C, a Full-Stack Developer building scalable web and mobile applications.",
      publisher: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // next-themes sets the theme class on <html> before hydration
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiase`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <Providers>
          <BackgroundAnimation />
          <SmoothScroll />
          <CommandPalette />
          <WebMCPTools />
          <ScrollProgress />
          <Header />
          <main id="content" className="flex-1 overflow-x-clip pt-28 md:pt-32">{children}</main>
          <Footer />
          <BackToTop />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
