const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow Contract", function () {
  let escrow;
  let token;
  let owner;
  let client;
  let freelancer;
  let otherAccount;

  const INITIAL_FEE = 100; // 1%

  beforeEach(async function () {
    [owner, client, freelancer, otherAccount] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("MockERC20");
    token = await TokenFactory.deploy();

    const EscrowFactory = await ethers.getContractFactory("Escrow");
    escrow = await EscrowFactory.deploy(await token.getAddress(), INITIAL_FEE);

    // Mint tokens to client and approve escrow contract
    await token.mint(client.address, ethers.parseEther("1000"));
    await token.connect(client).approve(await escrow.getAddress(), ethers.MaxUint256);
  });

  describe("Order Creation", function () {
    it("Should create an order successfully", async function () {
      const amount = ethers.parseEther("100");
      const duration = 86400; // 1 day

      await expect(escrow.connect(client).createOrder(freelancer.address, amount, duration))
        .to.emit(escrow, "OrderCreated");

      const order = await escrow.orders(1);
      expect(order.client).to.equal(client.address);
      expect(order.freelancer).to.equal(freelancer.address);
      expect(order.amount).to.equal(amount);
      expect(order.state).to.equal(0); // Created
    });
  });

  describe("Order Full Flow", function () {
    it("Should complete the full flow and distribute funds correctly", async function () {
      const amount = ethers.parseEther("100");
      const duration = 86400; // 1 day
      
      // 1. Create
      await escrow.connect(client).createOrder(freelancer.address, amount, duration);
      
      // 2. Accept
      await escrow.connect(freelancer).acceptOrder(1);
      expect((await escrow.orders(1)).state).to.equal(1); // Accepted

      // 3. Submit
      await escrow.connect(freelancer).submitWork(1);
      expect((await escrow.orders(1)).state).to.equal(2); // Submitted

      // 4. Approve and Release
      await expect(escrow.connect(client).approveAndRelease(1))
        .to.emit(escrow, "OrderCompleted");
      
      expect((await escrow.orders(1)).state).to.equal(3); // Completed

      const freelancerBal = await token.balanceOf(freelancer.address);
      expect(freelancerBal).to.equal(ethers.parseEther("99")); // 100 - 1% fee

      const accumulatedFees = await escrow.accumulatedFees();
      expect(accumulatedFees).to.equal(ethers.parseEther("1"));
    });
  });

  describe("Dispute Flow", function () {
    it("Should resolve dispute to freelancer", async function () {
      const amount = ethers.parseEther("100");
      await escrow.connect(client).createOrder(freelancer.address, amount, 86400);
      await escrow.connect(freelancer).acceptOrder(1);
      
      await escrow.connect(client).raiseDispute(1, "QmReasonHash");
      expect((await escrow.orders(1)).state).to.equal(5); // Disputed

      await escrow.connect(owner).resolveDispute(1, true);
      const freelancerBal = await token.balanceOf(freelancer.address);
      expect(freelancerBal).to.equal(ethers.parseEther("99"));
    });

    it("Should resolve dispute to client", async function () {
      const amount = ethers.parseEther("100");
      await escrow.connect(client).createOrder(freelancer.address, amount, 86400);
      await escrow.connect(freelancer).acceptOrder(1);
      
      const clientBalBefore = await token.balanceOf(client.address);
      await escrow.connect(client).raiseDispute(1, "QmReasonHash");
      await escrow.connect(owner).resolveDispute(1, false);

      const clientBalAfter = await token.balanceOf(client.address);
      expect(clientBalAfter - clientBalBefore).to.equal(amount);
    });
  });
});
