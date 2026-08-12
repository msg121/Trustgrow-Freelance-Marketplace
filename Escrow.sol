// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Escrow is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    enum OrderState { Created, Accepted, Submitted, Completed, Cancelled, Disputed }

    struct Order {
        uint256 orderId;
        address client;
        address freelancer;
        uint256 amount;
        uint16 feeBps; // 👈 فیس کی ویلیو آرڈر بنتے وقت ہی لاک ہوگی
        OrderState state;
        uint256 createdAt;
        uint256 deadline;
        string disputeReason;
    }

    IERC20 public immutable paymentToken;
    
    uint256 private _orderIdCounter;
    uint16 public feeBps; 
    uint256 public accumulatedFees;

    uint16 public constant MAX_FEE_BPS = 1000; 
    uint16 public constant BPS_DENOMINATOR = 10000;

    mapping(uint256 => Order) public orders;

    error InvalidAmount();
    error InvalidAddress();
    error Unauthorized();
    error InvalidState(OrderState current, OrderState required);
    error OrderDoesNotExist();
    error FeeExceedsMaximum();
    error InvalidDuration();
    error InvalidDisputeReason();
    error DeadlinePassed();
    error NoFeesToWithdraw();

    event OrderCreated(uint256 indexed orderId, address indexed client, address indexed freelancer, uint256 amount, uint256 deadline);
    event OrderAccepted(uint256 indexed orderId, address indexed freelancer);
    event WorkSubmitted(uint256 indexed orderId);
    event OrderCompleted(uint256 indexed orderId, uint256 totalPayout, uint256 totalFee);
    event OrderCancelled(uint256 indexed orderId, address indexed refundTo, uint256 amount);
    event DisputeRaised(uint256 indexed orderId, address indexed raisedBy, string reasonIpfsHash);
    event DisputeResolved(uint256 indexed orderId, address indexed recipient, uint256 payoutAmount, uint256 feeAmount);
    event PlatformFeeUpdated(uint16 newFeeBps);
    event FeesWithdrawn(address indexed owner, uint256 amount);

    constructor(address _paymentToken, uint16 _initialFeeBps) Ownable(msg.sender) {
        if (_paymentToken == address(0)) revert InvalidAddress();
        if (_initialFeeBps > MAX_FEE_BPS) revert FeeExceedsMaximum();

        paymentToken = IERC20(_paymentToken);
        feeBps = _initialFeeBps;
    }

    function createOrder(
        address freelancer,
        uint256 amount,
        uint256 durationSeconds
    ) external whenNotPaused returns (uint256) {
        if (amount == 0) revert InvalidAmount();
        if (freelancer == address(0) || freelancer == msg.sender) revert InvalidAddress();
        if (durationSeconds == 0) revert InvalidDuration();

        _orderIdCounter++;
        uint256 newOrderId = _orderIdCounter;
        uint256 deadlineTimestamp = block.timestamp + durationSeconds;

        orders[newOrderId] = Order({
            orderId: newOrderId,
            client: msg.sender,
            freelancer: freelancer,
            amount: amount,
            feeBps: feeBps, // 👈 موجودہ فیس کی فیصد محفوظ کر لی گئی
            state: OrderState.Created,
            createdAt: block.timestamp,
            deadline: deadlineTimestamp,
            disputeReason: ""
        });

        paymentToken.safeTransferFrom(msg.sender, address(this), amount);

        emit OrderCreated(newOrderId, msg.sender, freelancer, amount, deadlineTimestamp);
        return newOrderId;
    }

    function acceptOrder(uint256 orderId) external whenNotPaused {
        Order storage order = _getValidOrder(orderId);

        if (msg.sender != order.freelancer) revert Unauthorized();
        if (order.state != OrderState.Created) revert InvalidState(order.state, OrderState.Created);

        order.state = OrderState.Accepted;

        emit OrderAccepted(orderId, msg.sender);
    }

    function submitWork(uint256 orderId) external whenNotPaused {
        Order storage order = _getValidOrder(orderId);

        if (msg.sender != order.freelancer) revert Unauthorized();
        if (order.state != OrderState.Accepted) revert InvalidState(order.state, OrderState.Accepted);
        if (block.timestamp > order.deadline) revert DeadlinePassed();

        order.state = OrderState.Submitted;

        emit WorkSubmitted(orderId);
    }

    function approveAndRelease(uint256 orderId) external nonReentrant whenNotPaused {
        Order storage order = _getValidOrder(orderId);

        if (msg.sender != order.client) revert Unauthorized();
        if (order.state != OrderState.Submitted) revert InvalidState(order.state, OrderState.Submitted);

        uint256 payoutAmount = order.amount;
        if (payoutAmount == 0) revert InvalidAmount();

        // 👈 آرڈر کی اپنی محفوظ شدہ فیس استعمال ہوگی
        (uint256 netPayout, uint256 fee) = _calculateFee(payoutAmount, order.feeBps);

        order.amount = 0;
        order.state = OrderState.Completed;
        accumulatedFees += fee;

        paymentToken.safeTransfer(order.freelancer, netPayout);

        emit OrderCompleted(orderId, netPayout, fee);
    }

    function cancelOrder(uint256 orderId) external nonReentrant whenNotPaused {
        Order storage order = _getValidOrder(orderId);

        if (msg.sender != order.client) revert Unauthorized();

        bool isUnaccepted = (order.state == OrderState.Created);
        bool isPastDeadline = (block.timestamp > order.deadline && order.state == OrderState.Accepted);

        if (!isUnaccepted && !isPastDeadline) {
            revert InvalidState(order.state, OrderState.Created);
        }

        uint256 refundAmount = order.amount;
        if (refundAmount == 0) revert InvalidAmount();

        order.amount = 0;
        order.state = OrderState.Cancelled;

        paymentToken.safeTransfer(order.client, refundAmount);

        emit OrderCancelled(orderId, order.client, refundAmount);
    }

    function raiseDispute(uint256 orderId, string calldata reasonIpfsHash) external whenNotPaused {
        Order storage order = _getValidOrder(orderId);

        if (msg.sender != order.client && msg.sender != order.freelancer) revert Unauthorized();
        if (bytes(reasonIpfsHash).length == 0) revert InvalidDisputeReason();
        if (order.state != OrderState.Accepted && order.state != OrderState.Submitted) {
            revert InvalidState(order.state, OrderState.Accepted);
        }

        order.state = OrderState.Disputed;
        order.disputeReason = reasonIpfsHash;

        emit DisputeRaised(orderId, msg.sender, reasonIpfsHash);
    }

    function resolveDispute(uint256 orderId, bool payoutToFreelancer) external onlyOwner nonReentrant {
        Order storage order = _getValidOrder(orderId);

        if (order.state != OrderState.Disputed) revert InvalidState(order.state, OrderState.Disputed);

        uint256 amount = order.amount;
        if (amount == 0) revert InvalidAmount();

        order.amount = 0;

        if (payoutToFreelancer) {
            // 👈 آرڈر کی اپنی محفوظ شدہ فیس استعمال ہوگی
            (uint256 netPayout, uint256 fee) = _calculateFee(amount, order.feeBps);
            order.state = OrderState.Completed;
            accumulatedFees += fee;

            paymentToken.safeTransfer(order.freelancer, netPayout);
            emit DisputeResolved(orderId, order.freelancer, netPayout, fee);
        } else {
            order.state = OrderState.Cancelled;
            paymentToken.safeTransfer(order.client, amount);
            emit DisputeResolved(orderId, order.client, amount, 0);
        }
    }

    function setPlatformFee(uint16 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert FeeExceedsMaximum();
        feeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }

    function withdrawFees(address recipient) external onlyOwner nonReentrant {
        if (recipient == address(0)) revert InvalidAddress();
        uint256 amount = accumulatedFees;
        if (amount == 0) revert NoFeesToWithdraw();

        accumulatedFees = 0;
        paymentToken.safeTransfer(recipient, amount);

        emit FeesWithdrawn(recipient, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function getTotalOrders() external view returns (uint256) {
        return _orderIdCounter;
    }

    function _getValidOrder(uint256 orderId) internal view returns (Order storage) {
        if (orderId == 0 || orderId > _orderIdCounter) revert OrderDoesNotExist();
        return orders[orderId];
    }

    function _calculateFee(uint256 amount, uint16 orderFeeBps) internal pure returns (uint256 netPayout, uint256 fee) {
        fee = (amount * orderFeeBps) / BPS_DENOMINATOR;
        netPayout = amount - fee;
    }
}