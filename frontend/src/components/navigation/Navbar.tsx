"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWeb3 } from "@/context/Web3Context";
import { ShieldCheck, LogOut, Wallet, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/jobs", label: "Open Jobs" },
    { href: "/marketplace", label: "Escrows" },
    { href: "/create-order", label: "Create Order" },
    { href: "/my-orders", label: "My Orders" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-500 group-hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white hidden sm:block">
                Trust<span className="text-indigo-500">Crow</span>
              </span>
            </Link>
            
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive 
                        ? "bg-slate-800 text-white" 
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Wallet & Mobile Toggle */}
          <div className="flex items-center gap-4">
            {account ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/profile"
                  className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-full py-1.5 px-4 shadow-inner hover:bg-slate-800 hover:border-slate-600 transition-all"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-sm font-mono font-medium text-slate-200">{shortenAddress(account)}</span>
                </Link>
                <button
                  onClick={disconnectWallet}
                  className="p-2.5 text-slate-400 bg-slate-900 border border-slate-800 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 rounded-full transition-all"
                  title="Disconnect"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                isLoading={isConnecting}
                leftIcon={<Wallet className="w-4 h-4" />}
                className="hidden sm:flex"
              >
                Connect Wallet
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium ${
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          
          {/* Mobile Profile / Connect */}
          <div className="pt-4 mt-4 border-t border-slate-800">
            {account ? (
              <Link 
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-xl"
              >
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="font-mono text-slate-200">{shortenAddress(account)}</span>
              </Link>
            ) : (
              <Button
                onClick={() => {
                  connectWallet();
                  setIsMobileMenuOpen(false);
                }}
                isLoading={isConnecting}
                leftIcon={<Wallet className="w-4 h-4" />}
                className="w-full"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
