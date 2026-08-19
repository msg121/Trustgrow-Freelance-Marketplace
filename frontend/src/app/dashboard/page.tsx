"use client";

import React, { useEffect, useState } from "react";
import { useEscrow, Order } from "@/hooks/useEscrow";
import { useWeb3 } from "@/context/Web3Context";
import { ethers } from "ethers";
import { Activity, AlertTriangle, ShieldCheck, DollarSign, List, ShieldAlert } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import { ERC20_ABI, ERC20_CONTRACT_ADDRESS, ESCROW_CONTRACT_ADDRESS } from "@/config/contracts";

export default function DashboardPage() {
  const { getAllOrders, getContract } = useEscrow();
  const { account, provider } = useWeb3();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  
  // Stats
  const [totalEscrowed, setTotalEscrowed] = useState<bigint>(BigInt(0));
  const [accumulatedFees, setAccumulatedFees] = useState<bigint>(BigInt(0));
  const [platformFeeBps, setPlatformFeeBps] = useState<number>(0);
  
  // Dispute Resolution State
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  
  // Dev Tools State
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTestOrders = async () => {
    if (!provider || !account) return;
    try {
      setIsGenerating(true);
      const signer = await provider.getSigner();
      
      const erc20 = new ethers.Contract(ERC20_CONTRACT_ADDRESS, ERC20_ABI, signer);
      const escrow = getContract(false);

      // Approve 300 tokens
      const totalAmount = ethers.parseEther("300");
      const approveTx = await erc20.approve(ESCROW_CONTRACT_ADDRESS, totalAmount);
      await approveTx.wait();

      // Create 3 orders
      const amounts = ["50", "100", "150"];
      // Random dummy test address (so it doesn't fail the msg.sender != freelancer check)
      const testFreelancer = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
      const durationSeconds = 7 * 24 * 60 * 60; // 7 days

      for (let i = 0; i < 3; i++) {
        const tx = await escrow.createOrder(
          testFreelancer, 
          ethers.parseEther(amounts[i]), 
          durationSeconds
        );
        await tx.wait();
      }

      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate test orders: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!provider) return;
      try {
        setIsLoading(true);
        
        const allOrders = await getAllOrders();
        setOrders(allOrders.sort((a, b) => b.orderId - a.orderId));
        
        let total = BigInt(0);
        allOrders.forEach(o => {
          if (o.state === 0 || o.state === 1 || o.state === 2 || o.state === 5) {
            total += o.amount;
          }
        });
        setTotalEscrowed(total);

        const contract = getContract(true);
        const ownerAddr = await contract.owner();
        setIsOwner(account?.toLowerCase() === ownerAddr.toLowerCase());
        
        const fees = await contract.accumulatedFees();
        setAccumulatedFees(fees);
        
        const feeBps = await contract.feeBps();
        setPlatformFeeBps(Number(feeBps));
        
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [provider, account]);

  const handleResolveDispute = async (orderId: number, payoutToFreelancer: boolean) => {
    try {
      setResolveError(null);
      setIsResolving(true);
      const contract = getContract(false);
      const tx = await contract.resolveDispute(orderId, payoutToFreelancer);
      await tx.wait();
      
      const allOrders = await getAllOrders();
      setOrders(allOrders.sort((a, b) => b.orderId - a.orderId));
    } catch (err: any) {
      console.error(err);
      setResolveError(err?.reason || err?.message || "Failed to resolve dispute");
    } finally {
      setIsResolving(false);
    }
  };

  const activeOrdersCount = orders.filter(o => o.state === 0 || o.state === 1 || o.state === 2).length;
  const completedOrdersCount = orders.filter(o => o.state === 3).length;
  const disputedOrders = orders.filter(o => o.state === 5);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full filter blur-[100px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full filter blur-[100px] pointer-events-none mix-blend-screen"></div>
      <div className="relative z-10 w-full pb-12">
        <PageContainer>
          <SectionHeader 
            title="Platform Dashboard" 
            description="High-level statistics and administrative overview."
          />

          {isLoading ? (
            <LoadingSpinner fullHeight />
          ) : (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Active Orders"
                  value={activeOrdersCount}
                  icon={<Activity className="w-5 h-5" />}
                />
                <StatCard
                  title="Completed Orders"
                  value={completedOrdersCount}
                  icon={<ShieldCheck className="w-5 h-5" />}
                />
                <StatCard
                  title="Value Escrowed"
                  value={`${Number(ethers.formatEther(totalEscrowed)).toFixed(2)}`}
                  subtitle="ERC-20 Tokens"
                  icon={<DollarSign className="w-5 h-5" />}
                />
                <StatCard
                  title="Platform Fees"
                  value={`${Number(ethers.formatEther(accumulatedFees)).toFixed(2)}`}
                  subtitle={`Fee Rate: ${(platformFeeBps / 100).toFixed(1)}%`}
                  icon={<DollarSign className="w-5 h-5" />}
                  variant="highlight"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders List */}
                <Card padding="md" className="lg:col-span-2 !bg-slate-900/50 backdrop-blur-md border-indigo-500/20 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <List className="w-5 h-5 mr-2 text-blue-400" /> Recent Activity
                    </h3>
                    <Link href="/marketplace" className="text-sm text-indigo-400 hover:text-indigo-300">
                      View All
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    {recentOrders.length > 0 ? recentOrders.map((order) => (
                      <Link href={`/order/${order.orderId}`} key={order.orderId}>
                        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-indigo-500/50 hover:bg-slate-900 transition-all shadow-sm">
                          <div>
                            <p className="font-bold text-white text-sm">Order #{order.orderId}</p>
                            <p className="text-xs text-slate-400 mt-1">{ethers.formatEther(order.amount)} ERC20</p>
                          </div>
                          <StatusBadge state={order.state} />
                        </div>
                      </Link>
                    )) : (
                      <p className="text-slate-500 text-sm py-4 text-center">No recent orders found.</p>
                    )}
                  </div>
                </Card>

                {/* Admin Dispute Resolution */}
                <Card padding="md" className={isOwner ? "border-rose-500/30 bg-rose-950/20 backdrop-blur-md shadow-xl" : "!bg-slate-900/50 backdrop-blur-md border-indigo-500/20 shadow-xl"}>
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                    <ShieldAlert className="w-5 h-5 text-rose-500 mr-2" /> 
                    Dispute Resolution
                  </h3>
                  
                  {!isOwner ? (
                    <div className="text-center py-10 text-slate-500 text-sm">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                      <p>Only the contract owner can resolve disputes.</p>
                    </div>
                  ) : (
                    <>
                      {resolveError && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm shadow-inner">
                          {resolveError}
                        </div>
                      )}

                      {disputedOrders.length > 0 ? (
                        <div className="space-y-4">
                          {disputedOrders.map((order) => (
                            <div key={order.orderId} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-sm">
                              <p className="font-bold text-white mb-1">Order #{order.orderId}</p>
                              <div className="text-xs text-rose-400 mb-4 bg-rose-500/10 p-2 rounded border border-rose-500/20 break-all">
                                <span className="font-bold uppercase tracking-wider block mb-1">Dispute Details:</span>
                                {order.disputeReason.startsWith("ipfs://") || order.disputeReason.startsWith("Qm") ? (
                                  <a 
                                    href={order.disputeReason.startsWith("ipfs://") ? order.disputeReason.replace("ipfs://", "https://ipfs.io/ipfs/") : `https://ipfs.io/ipfs/${order.disputeReason}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline flex items-center mt-1"
                                  >
                                    View Evidence on IPFS
                                  </a>
                                ) : (
                                  order.disputeReason
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button
                                  onClick={() => handleResolveDispute(order.orderId, true)}
                                  disabled={isResolving}
                                  variant="outline"
                                  className="!border-emerald-500/50 !text-emerald-400 hover:!bg-emerald-500/10 hover:!border-emerald-500"
                                >
                                  Payout Freelancer
                                </Button>
                                <Button
                                  onClick={() => handleResolveDispute(order.orderId, false)}
                                  disabled={isResolving}
                                  variant="outline"
                                  className="!border-slate-600 !text-slate-300 hover:!bg-slate-800"
                                >
                                  Refund Client
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-sm text-center py-10">No active disputes require resolution.</p>
                      )}
                    </>
                  )}
                </Card>

                {/* Developer Tools */}
                <Card padding="md" className="border-blue-500/30 bg-blue-950/20 backdrop-blur-md shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                    Developer Tools
                  </h3>
                  <p className="text-sm text-slate-300 mb-4">
                    Quickly generate 3 test orders to populate the dashboard. You will need to confirm 4 transactions (1 Approval + 3 Orders).
                  </p>
                  <Button 
                    onClick={generateTestOrders} 
                    disabled={isGenerating || !account}
                    isLoading={isGenerating}
                    className="w-full !bg-blue-600 hover:!bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  >
                    Generate 3 Test Orders
                  </Button>
                </Card>
              </div>
            </div>
          )}
        </PageContainer>
      </div>
    </div>
  );
}
