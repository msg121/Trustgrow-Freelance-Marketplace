import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Trust<span className="text-indigo-500">Crow</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm max-w-sm text-center md:text-left">
              Decentralized escrow marketplace on the Sepolia Testnet. Trust is built in the code.
            </p>
          </div>

          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <h4 className="text-white font-semibold mb-2">Platform</h4>
              <Link href="/marketplace" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Marketplace</Link>
              <Link href="/create-order" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Create Order</Link>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-white font-semibold mb-2">Resources</h4>
              <Link href="/about" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">About Us</Link>
              <a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Documentation</a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} TrustCrow. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Sepolia Testnet
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
