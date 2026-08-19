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
      await createOrder(freelancer, parsedAmount, durationSeconds);
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
    <div className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-br from-blue-900 via-indigo-950 to-blue-950 relative overflow-hidden flex items-center justify-center py-12">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/30 rounded-full filter blur-[100px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/30 rounded-full filter blur-[100px] pointer-events-none mix-blend-screen"></div>

      <PageContainer maxWidth="2xl" className="relative z-10 w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-sm">
            Create Escrow Order
          </h1>
          <p className="text-blue-200 text-lg">
            Fund a new smart contract escrow to securely hire a freelancer.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 relative px-4">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-white/10 -z-10 rounded-full"></div>
          <div 
            className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-blue-400 -z-10 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
            style={{ width: `calc(${((step - 1) / 2) * 100}% - 32px)` }}
          ></div>
          
          {[
            { num: 1, label: "Details" },
            { num: 2, label: "Approve" },
            { num: 3, label: "Create" }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base border-2 transition-all duration-300 ${
                step >= s.num 
                  ? "bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
                  : "bg-indigo-950/80 border-indigo-800 text-indigo-400 backdrop-blur-md"
              }`}>
                {step > s.num ? <CheckCircle2 className="w-6 h-6 text-white" /> : s.num}
              </div>
              <span className={`text-sm font-bold mt-3 tracking-wide ${step >= s.num ? "text-white" : "text-indigo-300/70"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <Card className="!bg-white/10 !backdrop-blur-xl !border-white/20 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm flex items-start shadow-inner">
              <Info className="w-5 h-5 mr-3 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-6">
              <div className="bg-blue-900/40 border border-blue-400/30 rounded-xl p-4 flex items-start mb-6">
                <Info className="w-5 h-5 text-blue-300 mr-3 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-100">
                  <p className="font-bold mb-1 tracking-wide">On-Chain Privacy Notice</p>
                  <p className="opacity-90">The smart contract does NOT store job descriptions or titles on-chain to save gas and preserve privacy. Share project specifics off-chain.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-100 mb-2">Freelancer Wallet Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={freelancer}
                  onChange={(e) => setFreelancer(e.target.value)}
                  className="w-full bg-indigo-950/50 border border-indigo-400/30 rounded-xl px-4 py-3 text-white placeholder-indigo-300/40 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all font-mono shadow-inner"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-blue-100 mb-2">Amount (ERC20)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-indigo-950/50 border border-indigo-400/30 rounded-xl px-4 py-3 text-white placeholder-indigo-300/40 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all shadow-inner"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-100 mb-2">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="7"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-indigo-950/50 border border-indigo-400/30 rounded-xl px-4 py-3 text-white placeholder-indigo-300/40 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-6 !bg-blue-600 hover:!bg-blue-500 text-white font-bold py-4 text-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Review Order Summary
              </Button>
            </form>
          )}

          {(step === 2 || step === 3) && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6 text-center border-b border-white/10 pb-4">Order Summary</h3>
              
              <div className="bg-indigo-950/40 rounded-xl p-6 border border-white/10 space-y-5 shadow-inner">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-blue-200 text-sm font-medium">Freelancer</span>
                  <span className="font-mono text-sm text-white bg-white/10 px-3 py-1 rounded-md border border-white/5">{freelancer}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-blue-200 text-sm font-medium">Total Deposit</span>
                  <span className="font-bold text-2xl text-white">{amount} <span className="text-blue-400 text-sm">ERC20</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200 text-sm font-medium">Duration</span>
                  <span className="font-bold text-white bg-blue-500/20 text-blue-200 px-3 py-1 rounded-md border border-blue-400/30">{duration} Days</span>
                </div>
              </div>

              {step === 2 && (
                <div className="mt-8">
                  <p className="text-sm text-blue-200 mb-6 text-center font-medium">
                    Step 1 of 2: You must approve the Escrow Contract to spend your ERC20 tokens.
                  </p>
                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(1)} disabled={isApproving} className="!text-white hover:!bg-white/10 border border-white/20">Back</Button>
                    <Button onClick={handleApprove} isLoading={isApproving} className="flex-1 !bg-blue-600 hover:!bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] font-bold text-lg">
                      Approve Tokens
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="mt-8">
                  <p className="text-sm text-blue-200 mb-6 text-center font-medium">
                    Step 2 of 2: Create the Escrow Order and lock funds securely in the smart contract.
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={handleCreate} isLoading={isCreating} className="flex-1 !bg-emerald-600 hover:!bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] font-bold text-lg transition-all" leftIcon={<Shield className="w-5 h-5" />}>
                      Create Escrow Order
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </PageContainer>
    </div>
  );
}
