"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEscrow, Order } from "@/hooks/useEscrow";
import { useWeb3 } from "@/context/Web3Context";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { DisputeForm } from "@/components/orders/DisputeForm";
import { OrderChat } from "@/components/orders/OrderChat";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ethers } from "ethers";
import { Wallet, Info, ArrowLeft, User, DollarSign, Calendar, Clock, AlertTriangle } from "lucide-react";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const { getOrder, acceptOrder, submitWork, approveAndRelease, cancelOrder, raiseDispute } = useEscrow();
  const { account, provider } = useWeb3();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!provider) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getOrder(orderId);
      setOrder(data);
    } catch (err: any) {
      console.error(err);
      setError("Order not found or an error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [provider, orderId]);

  const handleAction = async (actionFn: () => Promise<any>) => {
    try {
      setError(null);
      setIsActioning(true);
      await actionFn();
      await fetchOrder();
    } catch (err: any) {
      console.error(err);
      setError(err?.reason || err?.message || "Transaction failed");
    } finally {
      setIsActioning(false);
    }
  };

  if (!provider) {
    return (
      <PageContainer maxWidth="lg" className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Wallet className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Wallet Required</h2>
          <p className="text-slate-400 mt-2">Connect your wallet to view order details.</p>
        </div>
      </PageContainer>
    );
  }

  if (isLoading) return <LoadingSpinner fullHeight />;
  if (!order) {
    return (
      <PageContainer maxWidth="lg" className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-white">Order Not Found</h2>
        <p className="text-slate-400 mt-2 mb-6">The order you are looking for does not exist.</p>
        <Button variant="secondary" onClick={() => router.push("/marketplace")} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Marketplace
        </Button>
      </PageContainer>
    );
  }

  const isClient = account?.toLowerCase() === order.client.toLowerCase();
  const isFreelancer = account?.toLowerCase() === order.freelancer.toLowerCase();
  const deadlineDate = new Date(order.deadline * 1000);
  const isPastDeadline = new Date() > deadlineDate;

  return (
    <PageContainer maxWidth="7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Order #{order.orderId}</h1>
            <p className="text-slate-400 mt-1">Escrow Details</p>
          </div>
        </div>
        <StatusBadge state={order.state} />
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start">
          <Info className="w-5 h-5 mr-3 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Timeline */}
      <Card padding="lg" className="mb-8">
        <OrderTimeline currentState={order.state} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Parties */}
        <div className="md:col-span-2 space-y-6">
          <Card padding="md">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-3">Parties Involved</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mr-4 shrink-0">
                  <User className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Client</p>
                  <p className="text-sm font-mono text-slate-200 truncate">{order.client}</p>
                  {isClient && <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500 text-white">You</span>}
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mr-4 shrink-0">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Freelancer</p>
                  <p className="text-sm font-mono text-slate-200 truncate">{order.freelancer}</p>
                  {isFreelancer && <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white">You</span>}
                </div>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-3">Order Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" /> Created
                </p>
                <p className="text-sm text-slate-300">
                  {new Date(order.createdAt * 1000).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" /> Deadline
                </p>
                <p className={`text-sm font-medium ${isPastDeadline && order.state === 1 ? "text-rose-400" : "text-slate-300"}`}>
                  {deadlineDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Chat & Evidence System */}
          <div className="mt-8">
            <OrderChat 
              orderId={orderId.toString()} 
              currentAccount={account} 
              clientAddress={order.client} 
              freelancerAddress={order.freelancer}
              isAdmin={account?.toLowerCase() === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266".toLowerCase()} // Simplified admin check for demo (Hardhat #0)
            />
          </div>
        </div>

        {/* Financials & Actions */}
        <div className="space-y-6">
          <Card padding="md" className="bg-slate-900 border-indigo-500/20">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-3">Financials</h3>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-400 text-sm">Escrowed</span>
              <span className="font-bold text-white">{ethers.formatEther(order.amount)} ERC20</span>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-400 text-sm">Platform Fee</span>
              <span className="text-slate-300 text-sm">{(order.feeBps / 100).toFixed(1)}%</span>
            </div>
            
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center mt-2">
              <span className="text-indigo-400 font-bold text-sm">Net Payout</span>
              <span className="font-bold text-lg text-indigo-300">
                {ethers.formatEther(order.amount - (order.amount * BigInt(order.feeBps)) / BigInt(10000))} ERC20
              </span>
            </div>
          </Card>

          {/* Action Box */}
          <Card padding="md">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-3">Available Actions</h3>
            
            <div className="space-y-3">
              {order.state === 0 && isFreelancer && (
                <Button 
                  className="w-full" 
                  onClick={() => handleAction(() => acceptOrder(orderId))}
                  isLoading={isActioning}
                >
                  Accept Order
                </Button>
              )}
              
              {order.state === 0 && isClient && (
                <Button 
                  variant="danger" 
                  className="w-full" 
                  onClick={() => handleAction(() => cancelOrder(orderId))}
                  isLoading={isActioning}
                >
                  Cancel Order
                </Button>
              )}

              {order.state === 1 && isFreelancer && (
                <Button 
                  className="w-full" 
                  onClick={() => handleAction(() => submitWork(orderId))}
                  isLoading={isActioning}
                >
                  Submit Work
                </Button>
              )}
              
              {order.state === 1 && isClient && isPastDeadline && (
                <Button 
                  variant="danger" 
                  className="w-full" 
                  onClick={() => handleAction(() => cancelOrder(orderId))}
                  isLoading={isActioning}
                >
                  Cancel (Past Deadline)
                </Button>
              )}

              {order.state === 2 && isClient && (
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                  onClick={() => handleAction(() => approveAndRelease(orderId))}
                  isLoading={isActioning}
                >
                  Approve Work & Pay
                </Button>
              )}

              {((order.state === 1 || order.state === 2) && (isClient || isFreelancer)) && !showDisputeForm && (
                <Button 
                  variant="outline" 
                  className="w-full !border-rose-500/50 !text-rose-400 hover:!bg-rose-500/10 hover:!border-rose-500" 
                  onClick={() => setShowDisputeForm(true)}
                  disabled={isActioning}
                >
                  Raise Dispute
                </Button>
              )}

              {(!isClient && !isFreelancer) || [3, 4, 5].includes(order.state) ? (
                <div className="text-center py-4 text-slate-500 text-sm italic">
                  No actions available
                </div>
              ) : null}
            </div>
            
            {showDisputeForm && (
              <DisputeForm
                onSubmit={(reason) => handleAction(() => raiseDispute(orderId, reason))}
                isActioning={isActioning}
                onCancel={() => setShowDisputeForm(false)}
              />
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
