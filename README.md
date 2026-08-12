# TrustGrow - Web3 Freelance Escrow Marketplace

TrustGrow is a decentralized Web3 Escrow Marketplace that ensures secure, trustless payments between Clients and Freelancers. By utilizing smart contracts, TrustGrow holds the client's funds in a secure escrow and only releases them when the work is approved, protecting both parties.

## Features

- **Secure Payments (Escrow):** Funds are locked in the smart contract until work is approved.
- **ERC20 Token Support:** Payments are made using a standard ERC20 token.
- **Dispute Resolution:** In case of disagreements, the platform Admin can step in and resolve disputes using IPFS-backed evidence.
- **Modern UI:** Built with Next.js, Tailwind CSS, and ethers.js for a seamless Web3 experience.
- **Smart Contract Security:** Secured using OpenZeppelin's `ReentrancyGuard`, `Pausable`, and `SafeERC20`.

## Tech Stack

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS, ethers.js v6
- **Smart Contracts:** Solidity, Hardhat, OpenZeppelin
- **Icons:** Lucide React

## Getting Started

### Prerequisites
- Node.js (v18+)
- MetaMask extension installed in your browser

### 1. Smart Contract Setup (Hardhat)
```bash
cd "smart contract"
npm install
npx hardhat compile
npx hardhat node
```

### 2. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## How It Works
1. **Client creates an order:** Client specifies the Freelancer's address, amount, and deadline. Funds are locked.
2. **Freelancer accepts & submits:** Freelancer accepts the job, completes the work, and clicks "Submit Work".
3. **Client approves:** Client reviews the work. If satisfied, they click "Approve Work & Pay", and the smart contract instantly transfers the funds to the Freelancer.

## License
MIT License
