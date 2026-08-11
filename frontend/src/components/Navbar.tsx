"use client";

import Link from "next/link";
import { useWeb3 } from "@/context/Web3Context";
import { Wallet, ShieldCheck, LogOut } from "lucide-react";

export default function Navbar() {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3();

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Trust<span className="text-indigo-500">Crow</span>
              </span>
            </Link>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/marketplace" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Marketplace</Link>
                <Link href="/create-order" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Create Order</Link>
                <Link href="/my-orders" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">My Orders</Link>
                <Link href="/dashboard" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
                <Link href="/about" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">About</Link>
              </div>
            </div>
          </div>
          
          <div>
            {account ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/profile"
                  className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full py-1.5 px-4 shadow-inner hover:bg-slate-800 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-sm font-mono text-slate-300">{shortenAddress(account)}</span>
                </Link>
                <button
                  onClick={disconnectWallet}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                  title="Disconnect"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] disabled:opacity-70"
              >
                <Wallet className="w-4 h-4" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
