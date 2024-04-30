import { ethers } from 'ethers';
export const approve = async () => {
    // debugger;
    const lenderProvider = new ethers.providers.Web3Provider(window.ethereum);
    // console.log(lenderProvider);
    // const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    // const lenderAddress = accounts[0];
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
    // Request access to the user's Ethereum account
    await lenderProvider.send('eth_requestAccounts', []);
    const lender = lenderProvider.getSigner();
    // setLenderWallet(lender?.provider?.provider?.address);
    const walletPrivateKey = '0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0';
    // Create ethers wallet instance using private key
    const wallet = new ethers.Wallet(walletPrivateKey);
    const deployer = wallet.connect(provider);
    console.log(deployer.address);
    const usdtAddress = "0xB9dfCb4d6A8ff7be25C082380DE931A1f7F9c01c";
    const erc20Abi = ["function approve(address,uint256)",
        "function transferFrom(address,address,uint256)"];
    const usdtToken = new ethers.Contract(usdtAddress, erc20Abi, deployer);
    const mainContractAddress = "0xaaF158923aDD9763a4eF5fDFB55992E5a3aEEC8d";
    const amountToApprove = 100;
    await usdtToken.connect(lender).approve(mainContractAddress, amountToApprove);
    console.log("appro")
};