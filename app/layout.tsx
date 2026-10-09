import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Learn AI Visually",
    template: "%s · Learn AI Visually",
  },
  description:
    "Visual essays on machine learning. One shared theme, interactive demonstrations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen antialiased`}>
        <SiteHeader />
        <main className="mx-auto w-full max-w-sheet px-5 pb-20 pt-8 sm:px-8">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
