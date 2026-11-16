import { network } from "hardhat";

const { ethers } = await network.create();

const faucet = await ethers.deployContract("Faucet");
await faucet.waitForDeployment();

console.log("Faucet address:", await faucet.getAddress());