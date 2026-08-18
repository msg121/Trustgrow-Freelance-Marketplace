import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Web3Provider } from "@/context/Web3Context";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrustGrow - Web3 Freelance Marketplace",
  description: "A professional decentralized freelance marketplace and escrow platform built on Ethereum.",
  openGraph: {
    title: "TrustGrow - Web3 Freelance Marketplace",
    description: "A professional decentralized freelance marketplace and escrow platform built on Ethereum.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustGrow - Web3 Freelance Marketplace",
    description: "A professional decentralized freelance marketplace and escrow platform built on Ethereum.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-50 min-h-screen flex flex-col selection:bg-indigo-500/30`}
      >
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' } }} />
        <Web3Provider>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </Web3Provider>
      </body>
    </html>
  );
}
