"use client";

import React, { useEffect, useState } from "react";
import { useEscrow, Order } from "@/hooks/useEscrow";
import { useWeb3 } from "@/context/Web3Context";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { OrderCard } from "@/components/orders/OrderCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Search, RefreshCw, Layers } from "lucide-react";
import Link from "next/link";

export default function MarketplacePage() {
  const { getAllOrders } = useEscrow();
  const { provider } = useWeb3();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    if (!provider) return;
    try {
      setIsLoading(true);
      const allOrders = await getAllOrders();
      // Sort newest first
      setOrders(allOrders.sort((a, b) => b.orderId - a.orderId));
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [provider]);

  const filteredOrders = orders.filter((o) => {
    // Basic search by address or ID
    const searchMatch = 
      o.orderId.toString().includes(search) || 
      o.client.toLowerCase().includes(search.toLowerCase()) || 
      o.freelancer.toLowerCase().includes(search.toLowerCase());

    if (!searchMatch) return false;

    if (filter === "active") return o.state === 0 || o.state === 1 || o.state === 2;
    if (filter === "completed") return o.state === 3;
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full filter blur-[100px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full filter blur-[100px] pointer-events-none mix-blend-screen"></div>
      <div className="relative z-10 w-full pb-12 pt-8">
      <PageContainer>
        <SectionHeader 
          title="Escrow Marketplace" 
          description="Discover active freelance agreements secured by blockchain escrow."
          action={
            <Button 
              variant="secondary" 
              onClick={fetchOrders} 
              leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
              disabled={isLoading || !provider}
            >
              Refresh
            </Button>
          }
        />

        {!provider ? (
          <EmptyState 
            icon={Layers}
            title="Wallet Not Connected"
            description="Please connect your MetaMask wallet to view and interact with the marketplace."
          />
        ) : isLoading ? (
          <LoadingSpinner fullHeight />
        ) : (
          <div className="space-y-6">
            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-slate-900/50 backdrop-blur-md p-4 border border-slate-700/50 rounded-2xl shadow-lg">
              <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 w-fit">
                {(["all", "active", "completed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
                      filter === f 
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                        : "text-blue-100 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search by ID or Address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Results */}
            {filteredOrders.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.orderId} order={order} />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={Search}
                title="No Active Orders"
                description="There are currently no public escrow orders available matching your criteria."
                action={
                  <Link href="/create-order">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 border-none hover:from-blue-600 hover:to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.4)] text-white font-bold">
                      Create an Order
                    </Button>
                  </Link>
                }
              />
            )}
          </div>
        )}
      </PageContainer>
      </div>
    </div>
  );
}
