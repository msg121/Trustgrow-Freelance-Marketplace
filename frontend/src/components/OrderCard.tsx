import React from "react";
import Link from "next/link";
import { Order } from "@/hooks/useEscrow";
import StatusBadge from "./StatusBadge";
import { ethers } from "ethers";
import { Calendar, User, ArrowRight } from "lucide-react";

interface OrderCardProps {
  order: Order;
  userRole?: "client" | "freelancer" | "none";
}

export default function OrderCard({ order, userRole = "none" }: OrderCardProps) {
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const deadlineDate = new Date(order.deadline * 1000);
  const isPastDeadline = new Date() > deadlineDate;

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-slate-400 text-sm font-medium">Order #{order.orderId}</span>
            {userRole !== "none" && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                {userRole}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {ethers.formatEther(order.amount)} <span className="text-indigo-400 text-sm">ERC20</span>
          </h3>
        </div>
        <StatusBadge state={order.state} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
          <div className="flex items-center text-slate-400 mb-1 text-xs uppercase tracking-wider font-semibold">
            <User className="w-3.5 h-3.5 mr-1.5" />
            Client
          </div>
          <div className="font-mono text-sm text-slate-200">
            {shortenAddress(order.client)}
          </div>
        </div>
        <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
          <div className="flex items-center text-slate-400 mb-1 text-xs uppercase tracking-wider font-semibold">
            <User className="w-3.5 h-3.5 mr-1.5" />
            Freelancer
          </div>
          <div className="font-mono text-sm text-slate-200">
            {shortenAddress(order.freelancer)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-slate-400">
          <Calendar className="w-4 h-4 mr-1.5" />
          <span className={isPastDeadline && order.state === 1 ? "text-rose-400" : ""}>
            Due: {deadlineDate.toLocaleDateString()}
          </span>
        </div>
        
        <Link 
          href={`/order/${order.orderId}`}
          className="flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors group-hover:translate-x-1 duration-200"
        >
          View Details
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
