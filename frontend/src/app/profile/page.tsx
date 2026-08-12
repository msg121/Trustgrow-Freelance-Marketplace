"use client";

import React, { useEffect, useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useERC20 } from "@/hooks/useERC20";
import { Wallet, LogOut, Copy, ExternalLink, ShieldCheck, Activity } from "lucide-react";
import { ethers } from "ethers";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ProfilePage() {
  const { account, disconnectWallet } = useWeb3();
  const { getBalance } = useERC20();
  
  const [balance, setBalance] = useState<string>("0.0");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account) return;
      try {
        const bal = await getBalance(account);
        setBalance(Number(ethers.formatEther(bal)).toFixed(2));
      } catch (err) {
        console.error("Failed to fetch balance", err);
      }
    };
    
    fetchBalance();
  }, [account]);

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!account) {
    return (
      <PageContainer maxWidth="lg">
        <EmptyState 
          icon={Wallet}
          title="Wallet Not Connected"
          description="Please connect your MetaMask wallet to view your profile and balances."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="7xl">
      <SectionHeader 
        title="My Profile" 
        description="Manage your connected wallet and view platform balances."
      />

      <Card padding="none" className="overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 shrink-0 shadow-[0_0_20px_rgba(79,70,229,0.15)]">
              <Wallet className="w-10 h-10 text-indigo-400" />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Connected to Sepolia</p>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
                <span className="font-mono text-xl sm:text-2xl text-white font-bold">{account.slice(0, 6)}...{account.slice(-4)}</span>
                <button 
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-indigo-400 transition-colors p-1.5 bg-slate-950 rounded-md border border-slate-800"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a 
                  href={`https://sepolia.etherscan.io/address/${account}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-indigo-400 transition-colors p-1.5 bg-slate-950 rounded-md border border-slate-800"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              {copied && <span className="text-xs text-indigo-400 font-medium absolute mt-1">Address copied!</span>}
            </div>
          </div>
          
          <Button
            onClick={disconnectWallet}
            variant="danger"
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Disconnect
          </Button>
        </div>
        
        <div className="p-8 bg-slate-950/50">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center">
            <Activity className="w-4 h-4 mr-2" /> Balances
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-400">ERC-20 Payment Token</p>
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-3xl font-extrabold text-white">{balance}</p>
            </div>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
