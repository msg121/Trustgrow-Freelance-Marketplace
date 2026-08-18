"use client";

import React, { useEffect, useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Briefcase, Plus, Search } from "lucide-react";

import toast from "react-hot-toast";

interface Job {
  id: string;
  client_address: string;
  title: string;
  description: string;
  budget: string;
  created_at: string;
}

export default function JobsPage() {
  const { account } = useWeb3();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");

  const fetchJobs = async () => {
    const localJobs = localStorage.getItem('dummy_jobs');
    if (localJobs) {
      setJobs(JSON.parse(localJobs));
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return toast.error("Please connect your wallet");

    setIsPosting(true);
    const dummyJob: Job = {
      id: Math.random().toString(36).substring(7),
      client_address: account.toLowerCase(),
      title,
      description,
      budget,
      created_at: new Date().toISOString()
    };
    
    setJobs(prev => {
      const newJobs = [dummyJob, ...prev];
      localStorage.setItem('dummy_jobs', JSON.stringify(newJobs));
      return newJobs;
    });
    
    setIsPosting(false);
    toast.success("Job posted successfully!");
    setShowModal(false);
    setTitle("");
    setDescription("");
    setBudget("");
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) || 
    j.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#020617] overflow-hidden">
      {/* Premium Deep Space Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/30 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50rem] h-[50rem] bg-fuchsia-600/20 rounded-full blur-[150px] mix-blend-screen"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
        {/* subtle noise texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
      </div>

      <PageContainer className="relative z-10 pt-12 pb-24">
        <SectionHeader 
        title="Open Jobs Marketplace" 
        description="Browse open freelance opportunities or post a new job for freelancers to apply."
        action={
          <Button 
            onClick={() => {
              if (!account) toast.error("Connect wallet to post a job");
              else setShowModal(true);
            }} 
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Post a Job
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search jobs by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-lg"
          />
        </div>
      </div>

    {/* Job Postings */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.map(job => (
            <div key={job.id} className="relative group rounded-3xl p-[1px] overflow-hidden bg-gradient-to-b from-white/10 to-transparent hover:from-indigo-500/50 hover:to-purple-500/50 transition-all duration-500 shadow-2xl">
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl z-0 rounded-3xl transition-colors group-hover:bg-slate-900/60"></div>
              
              <div className="relative z-10 p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors tracking-tight leading-tight">{job.title}</h3>
                  <div className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-indigo-500/30">
                    {job.budget} TKN
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm leading-relaxed mb-8 flex-1">
                  {job.description}
                </p>
                
                <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
                    <span className="text-xs text-slate-400 font-medium">
                      {job.client_address.slice(0,6)}...{job.client_address.slice(-4)}
                    </span>
                  </div>
                  <Button className="bg-white text-slate-900 hover:bg-indigo-50 font-bold px-6 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all">
                    Apply Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Briefcase}
          title="No Jobs Found"
          description="There are currently no open jobs available. Be the first to post one!"
        />
      )}

      {/* Post Job Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Post a New Job</h2>
            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Job Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Build a Web3 React App" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="Describe the project requirements..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Budget (Tokens)</label>
                <input required type="text" value={budget} onChange={e => setBudget(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. 500" />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={isPosting}>Post Job</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
    </div>
  );
}
