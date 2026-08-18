import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  order_id: string;
  sender_address: string;
  text: string;
  is_evidence: boolean;
  ipfs_hash?: string;
  timestamp: number;
}

interface OrderChatProps {
  orderId: string;
  currentAccount: string | null;
  clientAddress: string;
  freelancerAddress: string;
  isAdmin?: boolean;
}

export function OrderChat({ orderId, currentAccount, clientAddress, freelancerAddress, isAdmin = false }: OrderChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages from local storage
  useEffect(() => {
    const fetchMessages = async () => {
      const localMessages = localStorage.getItem(`chat_${orderId}`);
      if (localMessages) {
        setMessages(JSON.parse(localMessages));
      }
    };

    fetchMessages();
  }, [orderId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentAccount) return;

    const newMessage = {
      order_id: orderId,
      sender_address: currentAccount.toLowerCase(),
      text: inputText.trim(),
      is_evidence: false,
      timestamp: Date.now(),
    };

    setInputText(""); // Optimistic clear

    const finalMsg: ChatMessage = {
      ...newMessage,
      id: Math.random().toString(36).substring(7)
    };
    
    setMessages((prev) => {
      const updated = [...prev, finalMsg];
      localStorage.setItem(`chat_${orderId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleUploadEvidence = async () => {
    if (!currentAccount) return;
    
    // Create an invisible file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    
    fileInput.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      setIsUploading(true);
      const loadingToast = toast.loading("Uploading to IPFS via Pinata...");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
        const pinataSecret = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

        if (!pinataApiKey || !pinataSecret) {
            toast.error("Pinata API Keys not configured!");
            throw new Error("Missing Pinata config");
        }

        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
          method: "POST",
          headers: {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecret,
          },
          body: formData,
        });

        const resData = await res.json();
        
        if (!res.ok) throw new Error(resData.error || "Failed to upload to IPFS");

        const ipfsHash = resData.IpfsHash;

        const newMessage = {
          order_id: orderId,
          sender_address: currentAccount.toLowerCase(),
          text: `Uploaded evidence document: ${file.name}`,
          is_evidence: true,
          ipfs_hash: ipfsHash,
          timestamp: Date.now(),
        };

        const finalMsg: ChatMessage = {
          ...newMessage,
          id: Math.random().toString(36).substring(7)
        };
        
        setMessages((prev) => {
          const updated = [...prev, finalMsg];
          localStorage.setItem(`chat_${orderId}`, JSON.stringify(updated));
          return updated;
        });
        toast.success("Evidence uploaded!", { id: loadingToast });
      } catch (err: any) {
        toast.error("Failed to upload evidence", { id: loadingToast });
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    };

    fileInput.click();
  };

  const getSenderRole = (address: string) => {
    if (address.toLowerCase() === clientAddress.toLowerCase()) return "Client";
    if (address.toLowerCase() === freelancerAddress.toLowerCase()) return "Freelancer";
    return "Admin / Other";
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Prevent Chatting if not involved and not admin
  const isParticipant = currentAccount && (
    currentAccount.toLowerCase() === clientAddress.toLowerCase() || 
    currentAccount.toLowerCase() === freelancerAddress.toLowerCase() ||
    isAdmin
  );

  return (
    <div className="flex flex-col h-[500px] bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700/50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">Project Chat & Evidence</h3>
          <p className="text-xs text-slate-400">Powered by Supabase Realtime & IPFS.</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full text-xs font-bold border border-rose-500/20">
            <ShieldAlert className="w-3 h-3" />
            Admin View
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
            <p>No messages yet.</p>
            <p className="text-xs">Start the conversation or upload evidence!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = currentAccount && msg.sender_address.toLowerCase() === currentAccount.toLowerCase();
            const role = getSenderRole(msg.sender_address);
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-xs font-bold ${role === "Client" ? "text-indigo-400" : role === "Freelancer" ? "text-emerald-400" : "text-amber-400"}`}>
                    {role}
                  </span>
                  <span className="text-[10px] text-slate-500">{formatTime(msg.timestamp)}</span>
                </div>
                
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  isMe 
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-[0_4px_15px_rgba(79,70,229,0.2)]" 
                    : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none"
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  
                  {msg.is_evidence && msg.ipfs_hash && (
                    <div className={`mt-3 p-3 rounded-xl border flex items-start gap-3 ${
                      isMe ? "bg-white/10 border-white/20" : "bg-slate-900/50 border-slate-700"
                    }`}>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
                        <Paperclip className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-emerald-400 mb-1">IPFS Evidence Link</p>
                        <p className="text-[10px] font-mono truncate opacity-70 mb-1">{msg.ipfs_hash}</p>
                        <a 
                          href={`https://ipfs.io/ipfs/${msg.ipfs_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold underline flex items-center gap-1 hover:opacity-80 transition-opacity"
                        >
                          View File <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {isParticipant ? (
        <div className="p-4 bg-slate-800/50 border-t border-slate-700/50">
          <form onSubmit={handleSend} className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="px-3 border-slate-600 hover:bg-slate-700"
              onClick={handleUploadEvidence}
              title="Upload Evidence to IPFS"
              isLoading={isUploading}
            >
              <Paperclip className="w-5 h-5 text-slate-400" />
            </Button>
            
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            
            <Button type="submit" disabled={!inputText.trim()} className="px-4">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      ) : (
        <div className="p-4 bg-slate-800/80 border-t border-slate-700/50 text-center text-sm text-slate-400">
          You are not a participant in this order.
        </div>
      )}
    </div>
  );
}
