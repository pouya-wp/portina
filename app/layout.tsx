import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pouya Sadeghpoor - Software Developer",
  description: "A Software Developer and Front end Programmer.",
  generator: "Pouya Sadeghpoor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased">
        <img className={"fixed h-1/1 w-1/1"} src="/bg.png" alt="Background" />

        {children}
      </body>
    </html>
  );
}
