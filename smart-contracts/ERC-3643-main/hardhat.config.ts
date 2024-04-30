import '@xyrusworx/hardhat-solidity-json';
import '@nomicfoundation/hardhat-toolbox';
// import "@nomicfoundation/hardhat-verify";
import { HardhatUserConfig } from 'hardhat/config';
import 'solidity-coverage';
import '@nomiclabs/hardhat-solhint';
import '@primitivefi/hardhat-dodoc';
import '@nomiclabs/hardhat-etherscan';
// import '@nomicfoundation/hardhat-verify';
require('dotenv').config();
// import * as tdly from "@tenderly/hardhat-tenderly";
// tdly.setup({ automaticVerifications: true });



const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    arbitrum: {
      url: "https://arb-sepolia.g.alchemy.com/v2/a4Jk6Pp4C5ncBtBUF6PTN6KHm4oYxfku",
      chainId: 421614,
      accounts: ['e8a78114b7d9d2f95d5af3d95068be38781e4c8707cb52c5c7a352a49c2f4c7b']
    },
    hardhat: {

      chainId: 0x7A69
    }
  },
  etherscan: {
    apiKey: "Z85AYNXQMN5XQ7H81XCP7PPE6XMQG1W4ZB",
    customChains: [
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/",
        },
      },
    ],
  },

  dodoc: {
    runOnCompile: false,
    debugMode: true,
    outputDir: "./docgen",
    freshOutput: true,
  },
};

export default config;
//npx hardhat verify --network arbitrum 0x27CCC3F1441b9232270b119e7eB30EcEC4772F4e "0xBa5a5AE8bd278EFC00159570f0ECcC094aB75477" "0x7CfE50f9Cb4344afB146eA119934A5Ab00652efA" "0x84B71C59720e3B1230207511076AA30B889dA548" "TREXDINO" "TREX" "18" "0xE3118695Ee17a3497Ec0e30c01577ed184C64684"

