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
  const { getAllOrders, getContract } = useEscrow();
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

    if (provider && account) {
      try {
        const contract = getContract(true);
        const onOrderCreated = (orderId: any, client: string, freelancer: string) => {
          if (client.toLowerCase() === account.toLowerCase() || freelancer.toLowerCase() === account.toLowerCase()) {
            fetchOrders();
          }
        };
        contract.on("OrderCreated", onOrderCreated);
        return () => {
          contract.off("OrderCreated", onOrderCreated);
        };
      } catch (err) {
        console.error("Failed to setup event listener", err);
      }
    }
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
    { value: "created", label: "Pending" },
    { value: "accepted", label: "In Progress" },
    { value: "submitted", label: "In Review" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "disputed", label: "Disputed" },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full filter blur-[100px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full filter blur-[100px] pointer-events-none mix-blend-screen"></div>
      <div className="relative z-10 w-full pb-12 pt-8">
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
          <div className="flex overflow-x-auto hide-scrollbar bg-slate-900/50 backdrop-blur-md p-2 border border-slate-700/50 rounded-2xl gap-2 shadow-lg">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilter(t.value)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                  filter === t.value 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    : "text-blue-100 hover:text-white hover:bg-white/10"
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
                filter === "disputed" ? undefined : (
                  <div className="flex gap-4 justify-center">
                    {(filter === "all" || filter === "created") && (
                      <Link href="/create-order">
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 border-none hover:from-blue-600 hover:to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.4)] text-white font-bold">
                          Create an Order
                        </Button>
                      </Link>
                    )}
                    <Link href="/marketplace">
                      <Button className="bg-gradient-to-r from-fuchsia-500 to-pink-500 border-none hover:from-fuchsia-600 hover:to-pink-600 shadow-[0_0_15px_rgba(217,70,239,0.4)] text-white font-bold">
                        Browse Marketplace
                      </Button>
                    </Link>
                  </div>
                )
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
