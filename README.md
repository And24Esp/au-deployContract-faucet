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

### Withdraw from the Faucet

Run the withdrawal script:

```shell
npx hardhat run scripts/withdraw-faucet.js --network sepolia
```

Enter an amount in ETH (up to `0.1` per call). The script checks the faucet
balance, estimates the gas fee, and asks for confirmation before submitting the
withdrawal. The ETH is sent to the account configured by `TEST_PRIVATE_KEY`,
which also pays the gas fee. Make sure this is the wallet you want to receive
the funds; the contract sends withdrawals to the caller and does not accept a
separate recipient address.

  NOTE: In Etherscan, the transaction perse will not reflect the withdrawal/retrieval ammounts (displays a zero for both faucet and receiver), even if the operation was succesful and the address balance did update accordingly.

  The script will call withdraw(amount) with zero ETH attached; the amount is an argument to the function, and the contract then transfers that ETH to the caller during execution. So Etherscan’s main transaction “Value” can show 0 ETH, even though the wallet balance increases.

  The transfer may appear under Internal Transactions if Etherscan has a trace for it. This contract doesn’t emit a withdrawal event, so there may not be a clear withdrawal entry on the transaction page. If the transaction succeeded and your wallet balance updated, the withdrawal went through.

## About curent state of Tests

The repository currently has a `Counter` example test in `test/Counter.ts`;
it does not test the Faucet contract. Faucet-specific automated tests have not
yet been added.
