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

The Sepolia network in [`hardhat.config.ts`](./hardhat.config.ts) uses the
Hardhat configuration variables `TEST_API_KEY` (the RPC URL) and
`TEST_PRIVATE_KEY` (the funded deployer account's private key). Set them using
the Hardhat keystore:

```shell
npx hardhat keystore set TEST_API_KEY
npx hardhat keystore set TEST_PRIVATE_KEY
```

Then deploy:

```shell
npx hardhat run scripts/deploy.js --network sepolia
```

Keep the private key secret, and make sure the account has Sepolia ETH for gas.
After deployment, send ETH to the printed contract address to fund the faucet.

## Tests

The repository currently has a `Counter` example test in `test/Counter.ts`;
it does not test the Faucet contract. Faucet-specific automated tests have not
yet been added.
