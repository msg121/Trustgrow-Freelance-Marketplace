import React from "react";
import Link from "next/link";
import { Order } from "@/hooks/useEscrow";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ethers } from "ethers";
import { Calendar, User, ArrowRight } from "lucide-react";

interface OrderCardProps {
  order: Order;
  userRole?: "client" | "freelancer" | "none";
}

export function OrderCard({ order, userRole = "none" }: OrderCardProps) {
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const deadlineDate = new Date(order.deadline * 1000);
  const isPastDeadline = new Date() > deadlineDate;

  return (
    <Card hoverEffect padding="lg" className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-slate-400 text-sm font-semibold tracking-wider uppercase">Order #{order.orderId}</span>
            {userRole !== "none" && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${userRole === "client" ? "bg-indigo-500/20 text-indigo-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                {userRole}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-white">
            {ethers.formatEther(order.amount)} <span className="text-indigo-400 text-base font-medium">ERC20</span>
          </h3>
        </div>
        <StatusBadge state={order.state} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 flex-1">
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
          <div className="flex items-center text-slate-400 mb-1.5 text-xs uppercase tracking-wider font-semibold">
            <User className="w-3.5 h-3.5 mr-1.5" /> Client
          </div>
          <div className="font-mono text-sm text-slate-200">
            {shortenAddress(order.client)}
          </div>
        </div>
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
          <div className="flex items-center text-slate-400 mb-1.5 text-xs uppercase tracking-wider font-semibold">
            <User className="w-3.5 h-3.5 mr-1.5" /> Freelancer
          </div>
          <div className="font-mono text-sm text-slate-200">
            {shortenAddress(order.freelancer)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Deadline</span>
          <div className="flex items-center text-sm font-medium">
            <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
            <span className={isPastDeadline && order.state === 1 ? "text-rose-400" : "text-slate-300"}>
              {deadlineDate.toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <Link href={`/order/${order.orderId}`}>
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}
