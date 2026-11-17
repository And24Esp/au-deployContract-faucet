import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { network } from "hardhat";

const defaultFaucetAddress = "0x4B6A7A871B0674E59283395E997795E150F96001";
const { ethers } = await network.create();
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
  const amountInput = await prompt.question("Amount of Sepolia ETH to send: ");
  const amount = ethers.parseEther(amountInput.trim());

  if (amount <= 0n) {
    throw new Error("Amount must be greater than zero.");
  }

  // This snippet calculates the estimated gas fee for the transaction and prompts the user for confirmation before sending the transaction.
  const [signer] = await ethers.getSigners();
  const senderAddress = await signer.getAddress();
  const gasLimit = await ethers.provider.estimateGas({
    from: senderAddress,
    to: faucetAddress,
    value: amount,
  });
  const feeData = await ethers.provider.getFeeData();
  const feeRate = feeData.maxFeePerGas ?? feeData.gasPrice;

  if (feeRate === null) {
    throw new Error("Could not retrieve the current gas fee.");
  }

  const estimatedFee = gasLimit * feeRate;
  const feeLabel = feeData.maxFeePerGas === null
    ? "Estimated gas fee at current gas price"
    : "Estimated maximum gas fee";

  console.log(`\nFrom:   ${senderAddress}`);
  console.log(`To:     ${faucetAddress}`);
  console.log(`Amount: ${ethers.formatEther(amount)} ETH`);
  console.log(`Estimated gas: ${gasLimit} units`);
  console.log(`${feeLabel}: ${ethers.formatEther(estimatedFee)} Sepolia ETH`);

  const confirmation = await prompt.question(
    `Send this transaction with an estimated fee of ${ethers.formatEther(estimatedFee)} Sepolia ETH? (yes/no): `,
  );
  if (confirmation.trim().toLowerCase() !== "yes") {
    console.log("Funding cancelled.");
  } else {
    const transaction = await signer.sendTransaction({
      to: faucetAddress,
      value: amount,
    });

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
