import type { Metadata } from "next";
import { Geist, Geist_Mono, Bubblegum_Sans, Varela_Round } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bubblegum = Bubblegum_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bubblegum",
});

const varela = Varela_Round({
  weight: "400",
  subsets: ["hebrew", "latin"],
  variable: "--font-varela",
});

export const metadata: Metadata = {
  title: "לימוד חשבון בכיף",
  description: "אפליקציית חשבון לילדות",
};

import { GameProvider } from "@/context/GameContext";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bubblegum.variable} ${varela.variable} antialiased bg-purple-50 font-varela`}
      >
        <GameProvider>
          {children}
          <Analytics />
        </GameProvider>
      </body>
    </html>
  );
}
