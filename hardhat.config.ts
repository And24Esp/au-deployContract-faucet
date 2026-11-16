import { existsSync } from "node:fs";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";

if (existsSync(".env")) {
  process.loadEnvFile();
}

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    profiles: {
      default: {
        version: "0.8.4",
      },
    },
  },
  networks: {
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("TEST_API_KEY"),
      accounts: [configVariable("TEST_PRIVATE_KEY")],
    },
  }
});