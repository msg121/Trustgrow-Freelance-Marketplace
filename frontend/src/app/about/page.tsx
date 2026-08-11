import React from "react";
import { ShieldCheck, Lock, Code, Globe, HelpCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <PageContainer maxWidth="7xl">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
          <ShieldCheck className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">About TrustCrow</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Decentralizing trust in the freelance economy through immutable smart contracts.
        </p>
      </div>

      <Card className="mb-12" padding="lg">
        <h2 className="text-2xl font-bold text-white mb-6">Our Mission</h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            TrustCrow was built to solve a fundamental problem in the gig economy: <span className="text-indigo-400 font-semibold">Trust</span>. 
            Freelancers worry about not getting paid for their hard work, and clients worry about paying upfront for incomplete or subpar deliverables.
          </p>
          <p>
            By leveraging smart contracts on the Ethereum blockchain, we have created a system where trust is mathematically guaranteed. 
            The code is law. Funds are securely locked in our audited Escrow contract and only released when both parties fulfill their obligations, with a robust administrative dispute resolution system for edge cases.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card hoverEffect>
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/20">
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Non-Custodial Escrow</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            We never hold your funds. Escrowed tokens are held by an immutable smart contract on the blockchain. Not even platform admins can arbitrarily move funds without a valid dispute.
          </p>
        </Card>
        
        <Card hoverEffect>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Secure & Auditable</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Built using industry-standard OpenZeppelin libraries, including ReentrancyGuards and SafeERC20. The contract code is public and verifiable on the blockchain explorer.
          </p>
        </Card>
        
        <Card hoverEffect>
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 border border-amber-500/20">
            <Globe className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Sepolia Testnet</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Currently deployed on the Ethereum Sepolia Testnet. This allows users to test the platform using test-ETH and test-ERC20 tokens without spending real financial value.
          </p>
        </Card>

        <Card hoverEffect>
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 border border-purple-500/20">
            <Code className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Gas Optimized</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            We store only essential transactional data (IDs, Addresses, Amounts) on-chain. Off-chain metadata (like project descriptions) is omitted to save you expensive gas fees.
          </p>
        </Card>
      </div>

      <div className="text-center pt-8 border-t border-slate-800">
        <p className="text-slate-500 flex items-center justify-center gap-2">
          <HelpCircle className="w-4 h-4" /> Have questions? Check our GitHub repository or contact the admin.
        </p>
      </div>
    </PageContainer>
  );
}
