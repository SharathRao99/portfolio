import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "./provider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackgroundAnimation from "../components/BackgroundAnimation";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sharath-portfolio.vercel.app"),
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sharath-portfolio.vercel.app",
    title: "Sharath B C | Full Stack Developer",
    description: "Full-Stack Developer skilled in building scalable web and mobile applications using modern technologies.",
    siteName: "Sharath B C Portfolio",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Sharath B C - Full Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sharath B C | Full Stack Developer",
    description: "Full-Stack Developer skilled in building scalable web and mobile applications.",
    images: ["/opengraph-image.png"],
    creator: "@sharath_bc", // Replace with actual handle if available
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiase`}
      >
        <BackgroundAnimation />
        <Providers>
          <Header />
          {children}
          <Footer />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
