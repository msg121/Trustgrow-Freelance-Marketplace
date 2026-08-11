import { useWeb3 } from "@/context/Web3Context";
import { Contract } from "ethers";
import { ERC20_ABI, ERC20_CONTRACT_ADDRESS } from "@/config/contracts";

export function useERC20() {
  const { provider, signer, account } = useWeb3();

  const getContract = (readOnly = false) => {
    if (!provider) throw new Error("No provider available");
    if (readOnly) return new Contract(ERC20_CONTRACT_ADDRESS, ERC20_ABI, provider);
    if (!signer) throw new Error("No signer available");
    return new Contract(ERC20_CONTRACT_ADDRESS, ERC20_ABI, signer);
  };

  const getBalance = async (address: string): Promise<bigint> => {
    const contract = getContract(true);
    return await contract.balanceOf(address);
  };

  const getAllowance = async (owner: string, spender: string): Promise<bigint> => {
    const contract = getContract(true);
    return await contract.allowance(owner, spender);
  };

  const approve = async (spender: string, amount: bigint) => {
    const contract = getContract(false);
    const tx = await contract.approve(spender, amount);
    return await tx.wait();
  };

  const getSymbol = async (): Promise<string> => {
    const contract = getContract(true);
    return await contract.symbol();
  };

  const getDecimals = async (): Promise<number> => {
    const contract = getContract(true);
    return Number(await contract.decimals());
  };

  return {
    getBalance,
    getAllowance,
    approve,
    getSymbol,
    getDecimals,
    getContract,
  };
}
