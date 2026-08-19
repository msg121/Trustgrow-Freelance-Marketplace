const { ethers } = require("hardhat");

async function main() {
  const ESCROW_ADDRESS = "0xb614f9E89Ef2a7DD28C585ce6aB339ab9Ce96a82";
  const ERC20_ADDRESS = "0x51A7e477C421DB11CB3E8E26b1253E7707f152f2";

  console.log("Connecting to local Hardhat node...");
  
  // Get signers
  const signers = await ethers.getSigners();
  const client = signers[0]; // The account you likely have connected in MetaMask
  const freelancer = signers[1]; // A dummy freelancer account

  console.log(`Client address: ${client.address}`);
  console.log(`Freelancer address: ${freelancer.address}`);

  // Get contract instances
  const Escrow = await ethers.getContractAt("TrustGrowEscrow", ESCROW_ADDRESS);
  const Token = await ethers.getContractAt("TrustGrowToken", ERC20_ADDRESS);

  // 1. Approve tokens
  const amount = ethers.parseEther("150");
  console.log(`Approving ${ethers.formatEther(amount)} tokens for Escrow...`);
  const approveTx = await Token.connect(client).approve(ESCROW_ADDRESS, amount);
  await approveTx.wait();

  // 2. Create Order
  const duration = 7 * 24 * 60 * 60; // 7 days
  console.log("Creating Order...");
  const createTx = await Escrow.connect(client).createOrder(freelancer.address, amount, duration);
  const createReceipt = await createTx.wait();
  
  // Find the OrderCreated event to get the orderId
  const event = createReceipt.logs
    .map(log => {
      try { return Escrow.interface.parseLog(log); } 
      catch (e) { return null; }
    })
    .find(e => e && e.name === "OrderCreated");
  
  const orderId = event.args.orderId;
  console.log(`Order created with ID: ${orderId}`);

  // 3. Freelancer Accepts Order
  console.log("Freelancer accepting order...");
  const acceptTx = await Escrow.connect(freelancer).acceptOrder(orderId);
  await acceptTx.wait();

  // 4. Client raises a dispute
  const disputeReason = "The freelancer did not respond for 3 days and missed the first milestone.";
  console.log(`Client raising dispute with reason: "${disputeReason}"...`);
  const disputeTx = await Escrow.connect(client).raiseDispute(orderId, disputeReason);
  await disputeTx.wait();

  console.log("\n=============================================");
  console.log("SUCCESS! A disputed order has been created.");
  console.log("You can now refresh your web browser and go to:");
  console.log("1. 'My Orders' -> 'Disputed' tab");
  console.log("2. Dashboard -> 'Dispute Resolution' section");
  console.log("=============================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
