import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
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
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-white`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
