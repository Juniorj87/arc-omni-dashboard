import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { NotificationCenter } from "@/components/NotificationCenter";

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ARC TERMINAL // Omni Dashboard",
  description: "Sovereign portfolio terminal for the Arc Testnet ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrains.variable} ${spaceGrotesk.variable} antialiased bg-[#0a0a0a] text-[#e0e0e0] scanlines noise-overlay matrix-bg`}>
        <div className="flex min-h-screen">
          <Navbar />
          <main className="flex-1 lg:ml-64 relative">
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
