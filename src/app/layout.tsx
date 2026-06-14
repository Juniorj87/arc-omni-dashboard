import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { NotificationCenter } from "@/components/NotificationCenter";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arc Omni | Sovereign Portfolio Terminal",
  description: "Unified portfolio terminal for the Arc Testnet ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased dark bg-[#0b0f17] text-white`}
      >
        <div className="flex min-h-screen">
          <Navbar />
          <main className="flex-1 lg:ml-72 relative">
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-linear-to-b from-blue-600/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
        <NotificationCenter />
      </body>
    </html>
  );
}
