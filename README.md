# Sepolia Faucet

An Ethereum faucet smart contract built with Solidity and Hardhat 3. The
`Faucet` contract accepts ETH and lets any caller withdraw up to `0.1 ETH` per
transaction.

## Contract

[`contracts/Faucet.sol`](./contracts/Faucet.sol) exposes:

- `receive()`: accepts ETH sent directly to the contract.
- `withdraw(uint amount)`: transfers the requested amount to the caller, provided
  it is no more than `0.1 ETH`. The transfer reverts if the faucet does not have
  enough ETH.

Anyone can call `withdraw`; the limit applies to each call, not to an individual
address over time. Fund the deployed contract with ETH before withdrawals can
succeed.

## Requirements

- Node.js and npm
- Dependencies installed with `npm install`

## Build

Compile the contract with the configured Solidity compiler:

```shell
npx hardhat build
```

## Deploy locally

Deploy to Hardhat's local simulated network:

```shell
npx hardhat run scripts/deploy.js
```

The script prints the deployed Faucet address. The local network is temporary;
the deployment will not persist after the command exits.

## Deploy to Sepolia

The Sepolia network in [`hardhat.config.ts`](./hardhat.config.ts) reads
`TEST_API_KEY` (the RPC URL) and `TEST_PRIVATE_KEY` (the funded deployer
account's private key) from a `.env` file in the project root. For example:

```shell
TEST_API_KEY=https://your-sepolia-rpc-url
TEST_PRIVATE_KEY=0xyour-private-key
```

Keep `.env` out of version control and never share or commit your private key.
Make sure the account has Sepolia ETH for gas. Then deploy:

```shell
npx hardhat run scripts/deploy.js --network sepolia
```

### PD: Actual deployment event to Sepolia Network
The contract in this project was already deployed to the Sepolia Network on Nov 16th.

Faucet address: 0x4B6A7A871B0674E59283395E997795E150F96001

URL: https://sepolia.etherscan.io/address/0x4B6A7A871B0674E59283395E997795E150F96001 

After deployment, use the funding script to send ETH from the configured
`TEST_PRIVATE_KEY` account to the faucet:

```shell
npx hardhat run scripts/fund-faucet.js --network sepolia
```

The script prompts for the destination address (defaulting to this project's
deployed Faucet address), the amount in ETH, and confirmation before sending. It
also estimates the gas units and fee and includes the fee estimate in the
confirmation prompt. When the RPC provides `maxFeePerGas`, this is a maximum
fee estimate; the actual fee can be lower and may vary with network conditions.
The funding account needs enough Sepolia ETH to cover both the transfer and gas.
The confirmed transaction hash links to Sepolia Etherscan, where you can check
the actual gas used and fee.

## About curent state of Tests

The repository currently has a `Counter` example test in `test/Counter.ts`;
it does not test the Faucet contract. Faucet-specific automated tests have not
yet been added.
