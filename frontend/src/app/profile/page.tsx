"use client";

import React, { useEffect, useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useERC20 } from "@/hooks/useERC20";
import { Wallet, LogOut, Copy, ExternalLink, ShieldCheck, Activity, User, Image as ImageIcon, Save, Code } from "lucide-react";
import { ethers } from "ethers";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { account, disconnectWallet, userProfile, fetchProfile } = useWeb3();
  const { getBalance } = useERC20();
  
  const [balance, setBalance] = useState<string>("0.0");
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form State
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [skills, setSkills] = useState("");

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

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setAvatarUrl(userProfile.avatar_url || "");
      setSkills(userProfile.skills ? userProfile.skills.join(", ") : "");
    }
  }, [userProfile]);

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const saveProfile = async () => {
    if (!account) return;
    setIsSaving(true);
    
    const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
    try {
      
      const { error } = await supabase.from('profiles').upsert({
        id: account.toLowerCase(),
        name,
        avatar_url: avatarUrl,
        skills: skillsArray,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      
      toast.success("Profile saved successfully!");
      fetchProfile(account);
    } catch (error: any) {
      console.warn("Supabase fetch failed (dummy keys). Falling back to local storage.");
      const dummyProfile = {
        id: account.toLowerCase(),
        name,
        avatar_url: avatarUrl,
        skills: skillsArray,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(`profile_${account.toLowerCase()}`, JSON.stringify(dummyProfile));
      toast.success("Profile saved locally (Demo Mode)!");
      fetchProfile(account);
    } finally {
      setIsSaving(false);
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
        description="Manage your identity, wallet and view platform balances."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="none" className="overflow-hidden">
            <div className="p-6 sm:p-8 bg-slate-900">
              <h3 className="text-lg font-bold text-white flex items-center mb-6">
                <User className="w-5 h-5 mr-2 text-indigo-400" /> Public Profile
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g. Satoshi Nakamoto"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Avatar Image URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="url"
                      className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="https://example.com/avatar.png"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Skills (comma separated)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Code className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="React, Solidity, UI Design"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={saveProfile} 
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Profile
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="none" className="overflow-hidden h-fit">
            <div className="p-6 border-b border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 mb-4 shadow-[0_0_20px_rgba(79,70,229,0.15)] overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Wallet className="w-12 h-12 text-indigo-400" />
                )}
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Connected</p>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="font-mono text-lg text-white font-bold">{account.slice(0, 6)}...{account.slice(-4)}</span>
                <button 
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-indigo-400 transition-colors p-1 bg-slate-950 rounded-md border border-slate-800"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={disconnectWallet}
                variant="danger"
                className="w-full"
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Disconnect
              </Button>
            </div>
            
            <div className="p-6 bg-slate-950/50">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                <Activity className="w-4 h-4 mr-2" /> Wallet Balances
              </h3>
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                <ShieldCheck className="w-8 h-8 text-indigo-500 mb-2" />
                <p className="text-xs font-semibold text-slate-400 mb-1">ERC-20 TOKEN</p>
                <p className="text-3xl font-extrabold text-white">{balance}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
