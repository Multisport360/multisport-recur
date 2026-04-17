import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multisport Recur | Built for the Versatile. Built for the Grind.",
  description:
    "A community built for multi-sport athletes — get exposure, training resources, and connect with others who share your grind.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0f1e] text-[#f0f4ff]">
        {children}
      </body>
    </html>
  );
}
