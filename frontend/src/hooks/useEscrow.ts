import { useWeb3 } from "@/context/Web3Context";
import { Contract, ethers } from "ethers";
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from "@/config/contracts";
import toast from "react-hot-toast";

export interface Order {
  orderId: number;
  client: string;
  freelancer: string;
  amount: bigint;
  feeBps: number;
  state: number; // 0: Created, 1: Accepted, 2: Submitted, 3: Completed, 4: Cancelled, 5: Disputed
  createdAt: number;
  deadline: number;
  disputeReason: string;
}

export function useEscrow() {
  const { provider, signer } = useWeb3();

  const getContract = (readOnly = false) => {
    if (!provider) throw new Error("No provider available");
    if (readOnly) return new Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider);
    if (!signer) throw new Error("No signer available");
    return new Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
  };

  const createOrder = async (freelancer: string, amount: bigint, durationSeconds: number) => {
    const contract = getContract(false);
    const txPromise = contract.createOrder(freelancer, amount, durationSeconds).then((tx: any) => tx.wait());
    
    return toast.promise(txPromise, {
      loading: 'Creating Order...',
      success: 'Order created successfully!',
      error: 'Failed to create order.'
    });
  };

  const acceptOrder = async (orderId: number) => {
    const contract = getContract(false);
    const txPromise = contract.acceptOrder(orderId).then((tx: any) => tx.wait());
    
    return toast.promise(txPromise, {
      loading: 'Accepting Order...',
      success: 'Order accepted successfully!',
      error: 'Failed to accept order.'
    });
  };

  const submitWork = async (orderId: number) => {
    const contract = getContract(false);
    const txPromise = contract.submitWork(orderId).then((tx: any) => tx.wait());
    
    return toast.promise(txPromise, {
      loading: 'Submitting Work...',
      success: 'Work submitted successfully!',
      error: 'Failed to submit work.'
    });
  };

  const approveAndRelease = async (orderId: number) => {
    const contract = getContract(false);
    const txPromise = contract.approveAndRelease(orderId).then((tx: any) => tx.wait());
    
    return toast.promise(txPromise, {
      loading: 'Approving Work & Releasing Funds...',
      success: 'Funds released successfully!',
      error: 'Failed to approve work.'
    });
  };

  const cancelOrder = async (orderId: number) => {
    const contract = getContract(false);
    const txPromise = contract.cancelOrder(orderId).then((tx: any) => tx.wait());
    
    return toast.promise(txPromise, {
      loading: 'Cancelling Order...',
      success: 'Order cancelled successfully!',
      error: 'Failed to cancel order.'
    });
  };

  const raiseDispute = async (orderId: number, reason: string) => {
    const contract = getContract(false);
    const txPromise = contract.raiseDispute(orderId, reason).then((tx: any) => tx.wait());
    
    return toast.promise(txPromise, {
      loading: 'Raising Dispute...',
      success: 'Dispute raised successfully!',
      error: 'Failed to raise dispute.'
    });
  };

  const getOrder = async (orderId: number): Promise<Order> => {
    const contract = getContract(true);
    const data = await contract.orders(orderId);
    return {
      orderId: Number(data[0]),
      client: data[1],
      freelancer: data[2],
      amount: data[3],
      feeBps: Number(data[4]),
      state: Number(data[5]),
      createdAt: Number(data[6]),
      deadline: Number(data[7]),
      disputeReason: "", // Not returned by mapping getter
    };
  };

  const getTotalOrders = async (): Promise<number> => {
    const contract = getContract(true);
    const total = await contract.getTotalOrders();
    return Number(total);
  };

  // Helper to fetch all orders (for Marketplace or My Orders)
  const getAllOrders = async (): Promise<Order[]> => {
    const total = await getTotalOrders();
    const orders: Order[] = [];
    for (let i = 1; i <= total; i++) {
      try {
        const order = await getOrder(i);
        orders.push(order);
      } catch (err) {
        console.error(`Failed to fetch order ${i}`, err);
      }
    }
    return orders;
  };

  return {
    createOrder,
    acceptOrder,
    submitWork,
    approveAndRelease,
    cancelOrder,
    raiseDispute,
    getOrder,
    getTotalOrders,
    getAllOrders,
    getContract,
  };
}
