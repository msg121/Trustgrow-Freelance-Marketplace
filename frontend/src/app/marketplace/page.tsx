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
          <div className="flex flex-col sm:flex-row justify-between gap-4 bg-slate-900/50 p-4 border border-slate-800 rounded-2xl">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit">
              {(["all", "active", "completed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                    filter === f 
                      ? "bg-indigo-600 text-white shadow-md" 
                      : "text-slate-400 hover:text-white"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
                  <Button variant="outline">Create an Order</Button>
                </Link>
              }
            />
          )}
        </div>
      )}
    </PageContainer>
  );
}
