# TrustCrow: Decentralized Web3 Escrow Marketplace

TrustCrow is a decentralized, blockchain-powered freelance escrow marketplace. It solves a fundamental problem in the gig economy—**Trust**—by utilizing immutable Ethereum smart contracts to secure funds until both the client and the freelancer fulfill their obligations. 

The project consists of a highly secure **Solidity Smart Contract** deployed on the Sepolia Testnet and a beautiful, modern **Next.js** frontend application.

## 🚀 Key Features

* **Non-Custodial Escrow**: Funds are locked inside the smart contract. Neither the platform nor the client can withdraw them arbitrarily.
* **Instant Payouts**: When a client approves submitted work, the ERC-20 payment is transferred instantly to the freelancer.
* **Fair Dispute Resolution**: An integrated dispute mechanism allows the platform administrator to resolve conflicts and refund the client or pay the freelancer based on evidence.
* **Gas Optimized**: Only critical data is stored on-chain. Job titles and descriptions are kept off-chain for privacy and gas efficiency.
* **Modern UI/UX**: Built with Next.js App Router, Tailwind CSS, and Ethers.js, featuring a responsive, dynamic, and glassmorphic user interface.

## 🛠️ Technology Stack

**Frontend:**
* [Next.js 15](https://nextjs.org/) (App Router, React 19)
* [Tailwind CSS](https://tailwindcss.com/) (Styling)
* [Ethers.js v6](https://docs.ethers.org/v6/) (Blockchain Interaction)
* [Lucide React](https://lucide.dev/) (Iconography)

**Smart Contracts:**
* Solidity `^0.8.20`
* OpenZeppelin (ReentrancyGuard, SafeERC20, Ownable)
* Sepolia Ethereum Testnet

## 📁 Project Structure

```text
/
├── smart contract       # The Solidity Escrow Contract source code
├── ABI                  # ABI definitions for the Escrow and ERC-20 token
└── frontend/            # The Next.js frontend application
    ├── src/
    │   ├── app/         # Next.js App Router pages (Home, Dashboard, Orders, etc.)
    │   ├── components/  # Modular UI, Layout, and functional React components
    │   ├── context/     # React Context for MetaMask connection and state
    │   ├── hooks/       # Custom React hooks (useEscrow, useERC20)
    │   └── config/      # Smart Contract addresses and ABIs configuration
```

## ⚙️ Local Development Setup

To run this project locally, you will need Node.js and a MetaMask wallet extension installed in your browser.

### 1. Clone the repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd "Ferelanser Market"
```

### 2. Install dependencies
```bash
cd frontend
npm install
```

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🦊 How to Test on Sepolia

1. Open MetaMask and switch your network to the **Sepolia Testnet**.
2. Connect your wallet to the TrustCrow platform.
3. Make sure you have some **Sepolia ETH** (for gas fees) and the required **ERC-20 Test Tokens**.
4. Go to **Create Order**, enter a freelancer's wallet address, the amount, and duration. 
5. Approve the ERC-20 spending limit, then create the Escrow!

## 📜 Smart Contract Actions

* **`createOrder`**: Client deposits ERC-20 tokens to fund the escrow.
* **`acceptOrder`**: Freelancer accepts the terms and begins work.
* **`submitWork`**: Freelancer submits the work for review.
* **`approveAndRelease`**: Client approves the work; funds are released to the freelancer.
* **`cancelOrder`**: Client can cancel before acceptance, or if the deadline passes without submission.
* **`raiseDispute`**: Either party can dispute an active order to freeze the funds.
* **`resolveDispute`**: Contract owner resolves the dispute, deciding who receives the funds.

## 📄 License

This project is open-source and available under the MIT License.
