export const ESCROW_CONTRACT_ADDRESS = "0xb614f9E89Ef2a7DD28C585ce6aB339ab9Ce96a82";
export const ERC20_CONTRACT_ADDRESS = "0x51A7e477C421DB11CB3E8E26b1253E7707f152f2";
export const SEPOLIA_CHAIN_ID = 11155111;

export const ESCROW_ABI = [
  "function createOrder(address freelancer, uint256 amount, uint256 durationSeconds) external returns (uint256)",
  "function acceptOrder(uint256 orderId) external",
  "function submitWork(uint256 orderId) external",
  "function approveAndRelease(uint256 orderId) external",
  "function cancelOrder(uint256 orderId) external",
  "function raiseDispute(uint256 orderId, string reasonIpfsHash) external",
  "function resolveDispute(uint256 orderId, bool payoutToFreelancer) external",
  "function setPlatformFee(uint16 newFeeBps) external",
  "function withdrawFees(address recipient) external",
  "function pause() external",
  "function unpause() external",
  "function getTotalOrders() external view returns (uint256)",
  "function paymentToken() external view returns (address)",
  "function feeBps() external view returns (uint16)",
  "function accumulatedFees() external view returns (uint256)",
  "function MAX_FEE_BPS() external view returns (uint16)",
  "function BPS_DENOMINATOR() external view returns (uint16)",
  "function owner() external view returns (address)",
  "function orders(uint256) external view returns (uint256 orderId, address client, address freelancer, uint256 amount, uint16 feeBps, uint8 state, uint256 createdAt, uint256 deadline, string disputeReason)"
];

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];
