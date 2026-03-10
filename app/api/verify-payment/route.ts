import { NextRequest, NextResponse } from "next/server";

const USDC_CONTRACT = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC on Ethereum mainnet
const RECEIVER_ADDRESS = "0x6b55152939088C088fbE931Ae8809D6fe42d5E10";
const USDC_DECIMALS = 6;

interface EtherscanTxResponse {
  status: string;
  result: {
    hash: string;
    blockNumber: string;
    timeStamp: string;
    from: string;
    to: string;
    value: string;
    contractAddress: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: string;
    isError?: string;
  }[];
}

async function notifyCommander(payload: {
  productName: string;
  productId: string;
  plan: string;
  amount: number;
  txHash: string;
  from: string;
}) {
  const botToken = process.env.PAYMENT_BOT_TOKEN;
  const chatId = process.env.COMMANDER_CHAT_ID;

  if (!botToken || !chatId) return;

  const message = [
    `\u{1F4B0} *PAYMENT RECEIVED*`,
    ``,
    `Product: *${payload.productName}*`,
    `Plan: ${payload.plan}`,
    `Amount: *$${payload.amount} USDC*`,
    `From: \`${payload.from}\``,
    ``,
    `[View on Etherscan](https://etherscan.io/tx/${payload.txHash})`,
    ``,
    `\u{26A0}\u{FE0F} Deliver product to buyer.`,
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });
  } catch {
    console.error("Failed to notify commander");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { txHash, expectedAmount, productId, productName, plan } = body;

    if (!txHash || typeof txHash !== "string") {
      return NextResponse.json({ status: "error", message: "Transaction hash is required." }, { status: 400 });
    }

    // Validate tx hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json({ status: "error", message: "Invalid transaction hash format. Must be 0x followed by 64 hex characters." }, { status: 400 });
    }

    const apiKey = process.env.ETHERSCAN_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ status: "error", message: "Payment verification is temporarily unavailable. Please contact support." }, { status: 500 });
    }

    // Check ERC20 token transfers for this tx hash
    // We query the receiver's token transfer history and filter by tx hash
    const url = `https://api.etherscan.io/api?module=account&action=tokentx&address=${RECEIVER_ADDRESS}&contractaddress=${USDC_CONTRACT}&sort=desc&page=1&offset=50&apikey=${apiKey}`;

    const etherscanRes = await fetch(url);
    const etherscanData: EtherscanTxResponse = await etherscanRes.json();

    if (etherscanData.status !== "1" || !etherscanData.result?.length) {
      // No recent transactions — could be pending or not yet indexed
      // Also try direct tx receipt check
      const txUrl = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${apiKey}`;
      const txRes = await fetch(txUrl);
      const txData = await txRes.json();

      if (!txData.result) {
        return NextResponse.json({
          status: "pending",
          message: "Transaction not found yet. It may still be processing. Please wait a few minutes and try again.",
        });
      }

      // Transaction exists but no token transfer matched
      if (txData.result.status === "0x0") {
        return NextResponse.json({
          status: "error",
          message: "Transaction failed on the blockchain. Please check and try again with a new transaction.",
        });
      }

      // Parse logs to check for USDC transfer
      const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"; // Transfer event
      const logs = txData.result.logs || [];
      const usdcTransfer = logs.find(
        (log: { address: string; topics: string[] }) =>
          log.address.toLowerCase() === USDC_CONTRACT.toLowerCase() &&
          log.topics[0] === transferTopic &&
          log.topics[2] && log.topics[2].toLowerCase().includes(RECEIVER_ADDRESS.slice(2).toLowerCase())
      );

      if (usdcTransfer) {
        const rawAmount = parseInt(usdcTransfer.data, 16);
        const amount = rawAmount / Math.pow(10, USDC_DECIMALS);

        if (amount >= expectedAmount) {
          const from = "0x" + usdcTransfer.topics[1].slice(26);
          await notifyCommander({ productName, productId, plan, amount: expectedAmount, txHash, from });
          return NextResponse.json({
            status: "success",
            message: `Payment of $${amount} USDC verified successfully! You will receive your product shortly.`,
          });
        } else {
          return NextResponse.json({
            status: "error",
            message: `Payment amount $${amount} USDC is less than required $${expectedAmount}. Please send the remaining amount.`,
          });
        }
      }

      return NextResponse.json({
        status: "pending",
        message: "Transaction found but USDC transfer not confirmed yet. Please wait a few minutes and try again.",
      });
    }

    // Search in recent token transfers
    const matchingTx = etherscanData.result.find(
      (tx) => tx.hash?.toLowerCase() === txHash.toLowerCase()
    );

    if (!matchingTx) {
      return NextResponse.json({
        status: "pending",
        message: "Transaction not found in recent transfers. It may still be processing. Wait a few minutes and try again.",
      });
    }

    // Verify it's the right token and amount
    const receivedAmount = parseInt(matchingTx.value) / Math.pow(10, USDC_DECIMALS);

    if (receivedAmount < expectedAmount) {
      return NextResponse.json({
        status: "error",
        message: `Payment amount $${receivedAmount} USDC is less than required $${expectedAmount}. Please send the remaining amount.`,
      });
    }

    // Payment verified!
    await notifyCommander({
      productName,
      productId,
      plan,
      amount: expectedAmount,
      txHash,
      from: matchingTx.from,
    });

    return NextResponse.json({
      status: "success",
      message: `Payment of $${receivedAmount} USDC verified successfully! You will receive your product shortly.`,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ status: "error", message: "Verification failed. Please try again or contact support." }, { status: 500 });
  }
}
