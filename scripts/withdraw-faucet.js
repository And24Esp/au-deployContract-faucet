import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { network } from "hardhat";

const defaultFaucetAddress = "0x4B6A7A871B0674E59283395E997795E150F96001";
const { ethers } = await network.create();
const maxWithdrawal = ethers.parseEther("0.1");
const { chainId } = await ethers.provider.getNetwork();

if (chainId !== 11155111n) {
  throw new Error(`Expected Sepolia (chain ID 11155111), connected to ${chainId}.`);
}

const prompt = createInterface({ input: stdin, output: stdout });

try {
  const addressInput = await prompt.question(
    `Faucet address [${defaultFaucetAddress}]: `,
  );
  const faucetAddress = ethers.getAddress(addressInput.trim() || defaultFaucetAddress);
  const amountInput = await prompt.question("Amount of Sepolia ETH to withdraw: ");
  const amount = ethers.parseEther(amountInput.trim());

  if (amount <= 0n || amount > maxWithdrawal) {
    throw new Error("Withdrawal amount must be greater than zero and at most 0.1 ETH.");
  }

  const [signer] = await ethers.getSigners();
  const walletAddress = await signer.getAddress();
  const faucetBalance = await ethers.provider.getBalance(faucetAddress);

  if (amount > faucetBalance) {
    throw new Error(
      `Faucet balance (${ethers.formatEther(faucetBalance)} ETH) is less than the requested withdrawal.`,
    );
  }

  const faucet = new ethers.Contract(
    faucetAddress,
    ["function withdraw(uint256 amount)"],
    signer,
  );
  const gasLimit = await faucet.withdraw.estimateGas(amount);
  const feeData = await ethers.provider.getFeeData();
  const feeRate = feeData.maxFeePerGas ?? feeData.gasPrice;

  if (feeRate === null) {
    throw new Error("Could not retrieve the current gas fee.");
  }

  const estimatedFee = gasLimit * feeRate;
  const feeLabel = feeData.maxFeePerGas === null
    ? "Estimated gas fee at current gas price"
    : "Estimated maximum gas fee";

  console.log(`\nFaucet: ${faucetAddress}`);
  console.log(`Receive in: ${walletAddress}`);
  console.log(`Faucet balance: ${ethers.formatEther(faucetBalance)} ETH`);
  console.log(`Withdrawal: ${ethers.formatEther(amount)} ETH`);
  console.log(`Estimated gas: ${gasLimit} units`);
  console.log(`${feeLabel}: ${ethers.formatEther(estimatedFee)} Sepolia ETH`);

  const confirmation = await prompt.question(
    `Withdraw ${ethers.formatEther(amount)} ETH to ${walletAddress}? (yes/no): `,
  );

  if (confirmation.trim().toLowerCase() !== "yes") {
    console.log("Withdrawal cancelled.");
  } else {
    const transaction = await faucet.withdraw(amount);
    console.log("Transaction hash:", transaction.hash);

    const receipt = await transaction.wait();
    if (receipt === null) {
      throw new Error("Transaction was not confirmed.");
    }

    console.log(
      `Confirmed in block ${receipt.blockNumber}: https://sepolia.etherscan.io/tx/${receipt.hash}`,
    );
  }
} finally {
  prompt.close();
}
