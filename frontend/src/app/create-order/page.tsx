"use client";

import React, { useState } from "react";
import { useEscrow } from "@/hooks/useEscrow";
import { useERC20 } from "@/hooks/useERC20";
import { useWeb3 } from "@/context/Web3Context";
import { ESCROW_CONTRACT_ADDRESS } from "@/config/contracts";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ethers } from "ethers";
import { Wallet, Info, CheckCircle2, ArrowRight, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateOrderPage() {
  const { createOrder } = useEscrow();
  const { getContract: getERC20Contract } = useERC20();
  const { account } = useWeb3();
  const router = useRouter();

  const [freelancer, setFreelancer] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("7");
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isApproving, setIsApproving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = amount ? ethers.parseEther(amount) : BigInt(0);
  const durationSeconds = parseInt(duration || "0") * 24 * 60 * 60; // Days to Seconds

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!freelancer || !amount || !duration) {
      setError("Please fill all fields.");
      return;
    }
    if (!ethers.isAddress(freelancer)) {
      setError("Invalid freelancer address.");
      return;
    }
    setStep(2);
  };

  const handleApprove = async () => {
    try {
      setError(null);
      setIsApproving(true);
      const erc20 = getERC20Contract(false);
      const tx = await erc20.approve(ESCROW_CONTRACT_ADDRESS, parsedAmount);
      await tx.wait();
      setStep(3);
    } catch (err: any) {
      console.error(err);
      setError(err?.reason || err?.message || "Approval failed");
    } finally {
      setIsApproving(false);
    }
  };

  const handleCreate = async () => {
    try {
      setError(null);
      setIsCreating(true);
      const tx = await createOrder(freelancer, parsedAmount, durationSeconds);
      await tx.wait();
      router.push("/my-orders");
    } catch (err: any) {
      console.error(err);
      setError(err?.reason || err?.message || "Order creation failed");
    } finally {
      setIsCreating(false);
    }
  };

  if (!account) {
    return (
      <PageContainer maxWidth="lg">
        <EmptyState 
          icon={Wallet}
          title="Wallet Not Connected"
          description="You must connect your MetaMask wallet to act as a client and create an order."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="2xl">
      <SectionHeader 
        title="Create Escrow Order" 
        description="Fund a new smart contract escrow to securely hire a freelancer."
      />

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-10 rounded-full"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 -z-10 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>
        
        {[
          { num: 1, label: "Details" },
          { num: 2, label: "Approve" },
          { num: 3, label: "Create" }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
              step >= s.num 
                ? "bg-indigo-600 border-indigo-600 text-white" 
                : "bg-slate-900 border-slate-700 text-slate-500"
            }`}>
              {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
            </div>
            <span className={`text-xs font-semibold mt-2 ${step >= s.num ? "text-slate-300" : "text-slate-500"}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <Card>
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start">
            <Info className="w-5 h-5 mr-3 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start mb-6">
              <Info className="w-5 h-5 text-indigo-400 mr-3 shrink-0 mt-0.5" />
              <div className="text-sm text-indigo-300">
                <p className="font-semibold mb-1">On-Chain Privacy Notice</p>
                <p>The smart contract does NOT store job descriptions or titles on-chain to save gas and preserve privacy. Share project specifics off-chain.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Freelancer Wallet Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={freelancer}
                onChange={(e) => setFreelancer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Amount (ERC20)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="7"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Review Order Summary
            </Button>
          </form>
        )}

        {(step === 2 || step === 3) && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
            
            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-4">
                <span className="text-slate-400 text-sm">Freelancer</span>
                <span className="font-mono text-sm text-slate-200">{freelancer}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-4">
                <span className="text-slate-400 text-sm">Total Deposit</span>
                <span className="font-bold text-lg text-white">{amount} <span className="text-indigo-400 text-sm">ERC20</span></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Duration</span>
                <span className="font-medium text-slate-200">{duration} Days</span>
              </div>
            </div>

            {step === 2 && (
              <div className="mt-8">
                <p className="text-sm text-slate-400 mb-4 text-center">
                  Step 1 of 2: You must approve the Escrow Contract to spend your ERC20 tokens.
                </p>
                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(1)} disabled={isApproving}>Back</Button>
                  <Button onClick={handleApprove} isLoading={isApproving} className="flex-1">
                    Approve Tokens
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-8">
                <p className="text-sm text-slate-400 mb-4 text-center">
                  Step 2 of 2: Create the Escrow Order and lock funds securely in the smart contract.
                </p>
                <div className="flex gap-4">
                  <Button onClick={handleCreate} isLoading={isCreating} className="flex-1" leftIcon={<Shield className="w-4 h-4" />}>
                    Create Escrow Order
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
