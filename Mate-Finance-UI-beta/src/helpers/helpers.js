export const lendingBorrowingAddress = "0x4252b881f3b60E97374712831441AfD497433D4d";
export const lendingBorrowingABI = [
    "function storeBorrowerDetails(address,uint256,uint256,string,uint256)",
    "function getBorrowerDetails(address)view returns(tuple(uint256,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,string,bool))",
    "function depositFunds(address,uint256,address)"
];
export const mainContractAddress = "0x9Aa2Cf1C42f288976dC5590209479Fca5a57715b"
export const usdtAddress = "0xe8d785FddF9b14bbce50e097BD71b0426a475063";
export const identityRegistryAddress = "0xcD5EDDD2A58d418Ab8939905fcd823B6AbE09c0c"
export const identityRegistryABI = ["function registerIdentity(address,address,uint16)"];
export const identityImplementationAuthorityAddress = "0xacC09486C9e34aa1Dff13b2E64d5482A3648D018"
export const claimIssuerContractAddress = "0x538D2755B5Fb9A4f7c5769bdcf5103E569D6E241";
export const tokenAddress = "0xD4A05F9b4A28FA29d70601A6Ac9FF3f2A7724203";
export const tokenABI = ["function burn(address, uint256)",
    "function mint(address, uint256)"]