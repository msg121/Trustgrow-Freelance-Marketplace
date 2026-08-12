"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Lock, Zap, ArrowRight, CheckCircle, Search, Layers, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { useEscrow } from "@/hooks/useEscrow";

export default function Home() {
  const { getTotalOrders, getAllOrders } = useEscrow();
  
  const [stats, setStats] = useState({
    totalOrders: "0",
    activeEscrows: "0",
    completedOrders: "0"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const total = await getTotalOrders();
        const allOrders = await getAllOrders();
        
        const active = allOrders.filter(o => o.state === 0 || o.state === 1 || o.state === 2 || o.state === 5).length;
        const completed = allOrders.filter(o => o.state === 3).length;

        setStats({
          totalOrders: total.toString(),
          activeEscrows: active.toString(),
          completedOrders: completed.toString()
        });
      } catch (err) {
        // If not connected or error, keep placeholders
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950"></div>
        
        <PageContainer className="relative z-10 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold tracking-wide uppercase mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
            Live on Sepolia Testnet
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
            Secure Freelance Payments with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Decentralized Escrow
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-xl text-slate-300 mb-12 leading-relaxed font-medium">
            Create, manage and complete freelance agreements with transparent blockchain-powered escrow. No middlemen, just cryptographically guaranteed trust.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/marketplace">
              <Button size="lg" rightIcon={<Search className="w-5 h-5" />}>
                Explore Marketplace
              </Button>
            </Link>
            <Link href="/create-order">
              <Button size="lg" variant="secondary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Create an Order
              </Button>
            </Link>
          </div>
        </PageContainer>
      </div>

      {/* Stats Section */}
      <div className="w-full bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border-y border-indigo-100 shadow-sm relative overflow-hidden">
        {/* Decorative background elements for Web3 feel */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        
        <PageContainer className="py-14 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-indigo-200/60">
            <div className="p-4 transform hover:scale-105 transition-transform duration-300">
              <p className="text-blue-600 text-sm md:text-base uppercase tracking-widest font-bold mb-3">Total Orders</p>
              <p className="text-5xl md:text-6xl font-extrabold text-black drop-shadow-sm">{stats.totalOrders}</p>
            </div>
            <div className="p-4 transform hover:scale-105 transition-transform duration-300">
              <p className="text-blue-600 text-sm md:text-base uppercase tracking-widest font-bold mb-3">Active Escrows</p>
              <p className="text-5xl md:text-6xl font-extrabold text-black drop-shadow-sm">{stats.activeEscrows}</p>
            </div>
            <div className="p-4 transform hover:scale-105 transition-transform duration-300">
              <p className="text-blue-600 text-sm md:text-base uppercase tracking-widest font-bold mb-3">Completed Orders</p>
              <p className="text-5xl md:text-6xl font-extrabold text-black drop-shadow-sm">{stats.completedOrders}</p>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* How it works */}
      <PageContainer className="py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8">How It Works</h2>
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-400 blur-md opacity-30 rounded-full"></div>
            <p className="relative bg-slate-900 border border-slate-700/60 text-indigo-300 px-6 py-3 rounded-full text-lg font-semibold shadow-xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">
                A simple, transparent, and secure workflow for every freelance gig.
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "1", title: "Create Order", desc: "Client initiates an agreement and sets the deadline." },
            { step: "2", title: "Fund Escrow", desc: "Client deposits ERC-20 tokens securely into the smart contract." },
            { step: "3", title: "Complete Work", desc: "Freelancer completes the work and submits it for review." },
            { step: "4", title: "Release Payment", desc: "Client approves the work, instantly transferring funds to the freelancer." },
          ].map((item, i) => (
            <Card key={i} className="relative text-center pt-10" hoverEffect>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] border-4 border-slate-950">
                {item.step}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-slate-300 text-[15px] font-medium leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </PageContainer>

      {/* Why Decentralized Escrow? */}
      <div className="bg-white border-t border-slate-200">
        <PageContainer className="py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-8">Why Decentralized Escrow?</h2>
            
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-blue-200 blur-md opacity-50 rounded-2xl"></div>
              <div className="relative bg-blue-50 border border-blue-200 px-8 py-4 rounded-2xl shadow-sm">
                <p className="text-blue-600 text-lg md:text-xl font-bold tracking-tight">
                  Traditional platforms charge massive fees and hold your funds hostage. 
                  <span className="text-indigo-600 ml-2">Web3 fixes this.</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <div className="flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50/50 p-8 rounded-2xl border border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 border border-blue-100 group-hover:bg-blue-600 transition-colors duration-300">
                <Lock className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Locked & Immutable</h3>
              <p className="text-slate-600 leading-relaxed font-medium text-[15px]">
                Funds are secured by audited smart contracts on the Ethereum blockchain. Neither party can withdraw without fulfilling the programmed conditions.
              </p>
            </div>
            
            <div className="flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50/50 p-8 rounded-2xl border border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 border border-blue-100 group-hover:bg-indigo-600 transition-colors duration-300">
                <Zap className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Instant Settlement</h3>
              <p className="text-slate-600 leading-relaxed font-medium text-[15px]">
                Say goodbye to net-30 payment terms and 5-day bank transfers. When work is approved, ERC-20 tokens are transferred immediately.
              </p>
            </div>

            <div className="flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50/50 p-8 rounded-2xl border border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 border border-blue-100 group-hover:bg-cyan-600 transition-colors duration-300">
                <Shield className="w-8 h-8 text-cyan-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Fair Dispute Resolution</h3>
              <p className="text-slate-600 leading-relaxed font-medium text-[15px]">
                In the rare case of a disagreement, our administrative dispute system ensures funds are returned to the correct party based on cryptographic proof.
              </p>
            </div>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}
