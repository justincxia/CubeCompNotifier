import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CubeComp Notifier — Never Miss a WCA Competition",
  description:
    "Get instant SMS alerts when new World Cube Association competitions are announced near you. Set your location, choose your radius, and we'll handle the rest.",
  keywords: ["WCA", "Rubik's Cube", "speedcubing", "competition", "notification", "alert"],
  openGraph: {
    title: "CubeComp Notifier",
    description: "Never miss a WCA competition again.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-zinc-950`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
