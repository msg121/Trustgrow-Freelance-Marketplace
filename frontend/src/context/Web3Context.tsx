"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BrowserProvider, JsonRpcSigner, ethers } from "ethers";
import { SEPOLIA_CHAIN_ID } from "../config/contracts";
export interface UserProfile {
  id: string;
  name?: string;
  avatar_url?: string;
  skills?: string[];
  updated_at?: string;
}
import toast from "react-hot-toast";

interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  error: string | null;
  userProfile: UserProfile | null;
  fetchProfile: (address: string) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  error: null,
  userProfile: null,
  fetchProfile: async () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchProfile = async (address: string) => {
    try {
      const localProfile = localStorage.getItem(`profile_${address.toLowerCase()}`);
      if (localProfile) {
        setUserProfile(JSON.parse(localProfile));
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.warn("Failed to fetch profile from local storage.");
      setUserProfile(null);
    }
  };

  const initProvider = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      setProvider(browserProvider);

      try {
        const network = await browserProvider.getNetwork();
        setChainId(Number(network.chainId));

        const accounts = await browserProvider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          const currentSigner = await browserProvider.getSigner();
          setSigner(currentSigner);
        }
      } catch (err) {
        console.error("Failed to initialize provider:", err);
      }
    }
  };

  useEffect(() => {
    initProvider();

    if (account) {
      fetchProfile(account);
    } else {
      setUserProfile(null);
    }

    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          try {
            const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
            const currentSigner = await browserProvider.getSigner();
            
            setProvider(browserProvider);
            setSigner(currentSigner);
            setAccount(accounts[0]);
          } catch (err) {
            console.error("Failed to update account:", err);
            // If getSigner fails but we have an account, at least set the account
            setAccount(accounts[0]);
          }
        } else {
          setAccount(null);
          setSigner(null);
          setUserProfile(null);
          toast("Wallet disconnected", { icon: "🔌" });
        }
      };

      const handleChainChanged = (newChainId: string) => {
        setChainId(Number(newChainId));
        window.location.reload();
      };

      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if ((window as any).ethereum.removeListener) {
          (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
          (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!(window as any).ethereum) {
        // Handle Mobile Browsers
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          const dappUrl = window.location.href.split('//')[1];
          window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
          throw new Error("Redirecting to MetaMask App...");
        }
        throw new Error("MetaMask is not installed. Please install it on desktop or open in MetaMask browser on mobile.");
      }

      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      
      // Check network and switch if necessary
      const network = await browserProvider.getNetwork();
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        try {
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // Sepolia chain ID in hex
          });
        } catch (switchError: any) {
          // If Sepolia is not added to MetaMask, we should add it (omitted for brevity, assume usually present)
          throw new Error("Please switch to the Sepolia testnet in MetaMask.");
        }
      }

      // Force MetaMask to show the account selection prompt
      await (window as any).ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      
      const currentSigner = await browserProvider.getSigner();
      const currentAccount = await currentSigner.getAddress();

      setProvider(browserProvider);
      setSigner(currentSigner);
      setAccount(currentAccount);
      setChainId(SEPOLIA_CHAIN_ID);
      
      toast.success("Wallet connected!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect wallet");
      toast.error(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setUserProfile(null);
    toast("Wallet disconnected", { icon: "🔌" });
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        isConnecting,
        connectWallet,
        disconnectWallet,
        error,
        userProfile,
        fetchProfile,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
