import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DisputeFormProps {
  onSubmit: (reason: string) => Promise<void>;
  isActioning: boolean;
  onCancel: () => void;
}

export function DisputeForm({ onSubmit, isActioning, onCancel }: DisputeFormProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    await onSubmit(reason);
  };

  return (
    <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-6 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <h4 className="text-rose-400 font-bold mb-3 flex items-center text-lg">
        <ShieldAlert className="w-5 h-5 mr-2" /> Raise a Dispute
      </h4>
      <p className="text-sm text-slate-400 mb-4">
        Disputing an order halts the escrow process. Please provide an IPFS hash linking to your evidence, or a brief reason if off-chain.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason or IPFS hash (e.g., Qm...)"
          className="w-full bg-slate-900 border border-rose-500/30 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 mb-4 transition-all"
          disabled={isActioning}
        />
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="danger"
            isLoading={isActioning}
            disabled={!reason.trim()}
          >
            Submit Dispute
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isActioning}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
