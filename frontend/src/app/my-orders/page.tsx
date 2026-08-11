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
import { Search, RefreshCw, Layers, FolderOpen } from "lucide-react";
import Link from "next/link";

type TabFilter = "all" | "created" | "accepted" | "submitted" | "completed" | "cancelled" | "disputed";

export default function MyOrdersPage() {
  const { getAllOrders } = useEscrow();
  const { account, provider } = useWeb3();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<TabFilter>("all");

  const fetchOrders = async () => {
    if (!provider || !account) return;
    try {
      setIsLoading(true);
      const allOrders = await getAllOrders();
      // Filter for orders involving the current account
      const userOrders = allOrders.filter(
        o => o.client.toLowerCase() === account.toLowerCase() || 
             o.freelancer.toLowerCase() === account.toLowerCase()
      );
      // Sort newest first
      setOrders(userOrders.sort((a, b) => b.orderId - a.orderId));
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [provider, account]);

  const filteredOrders = orders.filter((o) => {
    if (filter === "created") return o.state === 0;
    if (filter === "accepted") return o.state === 1;
    if (filter === "submitted") return o.state === 2;
    if (filter === "completed") return o.state === 3;
    if (filter === "cancelled") return o.state === 4;
    if (filter === "disputed") return o.state === 5;
    return true; // "all"
  });

  const getRole = (order: Order) => {
    if (!account) return "none";
    if (order.client.toLowerCase() === account.toLowerCase()) return "client";
    if (order.freelancer.toLowerCase() === account.toLowerCase()) return "freelancer";
    return "none";
  };

  const tabs: { value: TabFilter; label: string }[] = [
    { value: "all", label: "All Orders" },
    { value: "created", label: "Created" },
    { value: "accepted", label: "Accepted" },
    { value: "submitted", label: "Submitted" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "disputed", label: "Disputed" },
  ];

  return (
    <PageContainer>
      <SectionHeader 
        title="My Orders" 
        description="Manage the escrows you've created or are working on."
        action={
          <Button 
            variant="secondary" 
            onClick={fetchOrders} 
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
            disabled={isLoading || !provider || !account}
          >
            Refresh
          </Button>
        }
      />

      {!provider || !account ? (
        <EmptyState 
          icon={Layers}
          title="Wallet Not Connected"
          description="Please connect your MetaMask wallet to view your personal orders."
        />
      ) : isLoading ? (
        <LoadingSpinner fullHeight />
      ) : (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar bg-slate-900/50 p-2 border border-slate-800 rounded-2xl gap-2">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilter(t.value)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                  filter === t.value 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Results */}
          {filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard 
                  key={order.orderId} 
                  order={order} 
                  userRole={getRole(order)}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={FolderOpen}
              title="No Orders Found"
              description={`You don't have any orders matching the "${filter}" status.`}
              action={
                <div className="flex gap-4 justify-center">
                  <Link href="/create-order">
                    <Button>Create an Order</Button>
                  </Link>
                  <Link href="/marketplace">
                    <Button variant="outline">Browse Marketplace</Button>
                  </Link>
                </div>
              }
            />
          )}
        </div>
      )}
    </PageContainer>
  );
}
