import { BigNumber, Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';
import OnchainID from '@onchain-id/solidity';
// import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

export async function deployIdentityProxy(implementationAuthority: Contract['address'], managementKey: string, signer: Signer) {
    const identity = await new ethers.ContractFactory(OnchainID.contracts.IdentityProxy.abi, OnchainID.contracts.IdentityProxy.bytecode, signer).deploy(
        implementationAuthority,
        managementKey,
    );

    return ethers.getContractAt('Identity', identity.address, signer);
}

const main = async function deployFullSuiteFixture() {
    const deployerPrivateKey = '0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0'; //4
    const tokenIssuerPrivateKey = '0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0';//4
    const tokenAgentPrivateKey = 'df57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e';//1
    const tokenAdminPrivateKey = '0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0'; //2
    const claimIssuerPrivateKey = '0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd';//3
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");

    const deployer = new ethers.Wallet(deployerPrivateKey, provider);
    const tokenIssuer = new ethers.Wallet(tokenIssuerPrivateKey, provider);
    const tokenAgent = new ethers.Wallet(tokenAgentPrivateKey, provider);
    const tokenAdmin = new ethers.Wallet(tokenAdminPrivateKey, provider);
    const claimIssuer = new ethers.Wallet(claimIssuerPrivateKey, provider);

    // const USDT = "0x54660053d4BEdf07C39B5aa35a3cB8A359ffbAFc";

    // const [deployer, tokenIssuer, tokenAgent, tokenAdmin, claimIssuer, aliceWallet, bobWallet, charlieWallet, davidWallet, anotherWallet] =
    //     await ethers.getSigners();
    // const claimIssuerSigningKey = ethers.Wallet.createRandom();
    // const aliceActionKey = ethers.Wallet.createRandom();

    // Deploy implementations
    const claimTopicsRegistryImplementation = await ethers.deployContract('ClaimTopicsRegistry', deployer);
    const trustedIssuersRegistryImplementation = await ethers.deployContract('TrustedIssuersRegistry', deployer);
    const identityRegistryStorageImplementation = await ethers.deployContract('IdentityRegistryStorage', deployer);
    const identityRegistryImplementation = await ethers.deployContract('IdentityRegistry', deployer);
    const modularComplianceImplementation = await ethers.deployContract('ModularCompliance', deployer);
    const tokenImplementation = await ethers.deployContract('Token', deployer);

    const identityImplementation = await new ethers.ContractFactory(
        OnchainID.contracts.Identity.abi,
        OnchainID.contracts.Identity.bytecode,
        deployer,
    ).deploy(deployer.address, true);


    const identityImplementationAuthority = await new ethers.ContractFactory(
        OnchainID.contracts.ImplementationAuthority.abi,
        OnchainID.contracts.ImplementationAuthority.bytecode,
        deployer,
    ).deploy(identityImplementation.address);

    const identityFactory = await new ethers.ContractFactory(OnchainID.contracts.Factory.abi, OnchainID.contracts.Factory.bytecode, deployer).deploy(
        identityImplementationAuthority.address,
    );

    const trexImplementationAuthority = await ethers.deployContract(
        'TREXImplementationAuthority',
        [true, ethers.constants.AddressZero, ethers.constants.AddressZero],
        deployer,
    );

    const versionStruct = {
        major: 4,
        minor: 0,
        patch: 0,
    };
    const contractsStruct = {
        tokenImplementation: tokenImplementation.address,
        ctrImplementation: claimTopicsRegistryImplementation.address,
        irImplementation: identityRegistryImplementation.address,
        irsImplementation: identityRegistryStorageImplementation.address,
        tirImplementation: trustedIssuersRegistryImplementation.address,
        mcImplementation: modularComplianceImplementation.address,
    };
    await trexImplementationAuthority.connect(deployer).addAndUseTREXVersion(versionStruct, contractsStruct);


    const trexFactory = await ethers.deployContract('TREXFactory', [trexImplementationAuthority.address, identityFactory.address], deployer);

    await identityFactory.connect(deployer).addTokenFactory(trexFactory.address);

    const claimTopicsRegistry = await ethers
        .deployContract('ClaimTopicsRegistryProxy', [trexImplementationAuthority.address], deployer)
        .then(async (proxy) => ethers.getContractAt('ClaimTopicsRegistry', proxy.address));

    const trustedIssuersRegistry = await ethers
        .deployContract('TrustedIssuersRegistryProxy', [trexImplementationAuthority.address], deployer)
        .then(async (proxy) => ethers.getContractAt('TrustedIssuersRegistry', proxy.address));

    const identityRegistryStorage = await ethers
        .deployContract('IdentityRegistryStorageProxy', [trexImplementationAuthority.address], deployer)
        .then(async (proxy) => ethers.getContractAt('IdentityRegistryStorage', proxy.address));

    const defaultCompliance = await ethers.deployContract('DefaultCompliance', deployer);

    const identityRegistry = await ethers
        .deployContract(
            'IdentityRegistryProxy',
            [trexImplementationAuthority.address, trustedIssuersRegistry.address, claimTopicsRegistry.address, identityRegistryStorage.address],
            deployer,
        )
        .then(async (proxy) => ethers.getContractAt('IdentityRegistry', proxy.address));


    const tokenOID = await deployIdentityProxy(identityImplementationAuthority.address, tokenIssuer.address, deployer);
    const tokenName = 'TREXDINO';
    const tokenSymbol = 'TREX';
    const tokenDecimals = 18;
    const token = await ethers
        .deployContract(
            'TokenProxy',
            [
                trexImplementationAuthority.address,
                identityRegistry.address,
                defaultCompliance.address,
                tokenName,
                tokenSymbol,
                tokenDecimals,
                tokenOID.address,
            ],
            deployer,
        )
        .then(async (proxy) => ethers.getContractAt('Token', proxy.address));

    const agentManager = await ethers.deployContract('AgentManager', [token.address], tokenAgent);

    await identityRegistryStorage.connect(deployer).bindIdentityRegistry(identityRegistry.address);

    await token.connect(deployer).addAgent(tokenAgent.address);

    const claimTopics = [ethers.utils.id('CLAIM_TOPIC')];
    await claimTopicsRegistry.connect(deployer).addClaimTopic(claimTopics[0]);

    const claimIssuerContract = await ethers.deployContract('ClaimIssuer', [claimIssuer.address], claimIssuer);
    await claimIssuerContract
        .connect(claimIssuer)
        .addKey(ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [claimIssuer.address])), 3, 1);

    await trustedIssuersRegistry.connect(deployer).addTrustedIssuer(claimIssuerContract.address, claimTopics);


    await identityRegistry.connect(deployer).addAgent(tokenAgent.address);
    await identityRegistry.connect(deployer).addAgent(token.address);

    await agentManager.connect(tokenAgent).addAgentAdmin(tokenAdmin.address);
    await token.connect(deployer).addAgent(agentManager.address);
    await identityRegistry.connect(deployer).addAgent(agentManager.address);

    await token.connect(tokenAgent).unpause();
    const USDT = await ethers.deployContract('USDT', deployer);
    const lenderAddress = "0xcd3B766CCDd6AE721141F452C550Ca635964ce71";
    const amount = ethers.utils.parseUnits("100", 18);
    await USDT.connect(deployer).mint(lenderAddress, amount);
    const mainContract = await ethers.deployContract("MainContract", [token.address, USDT.address], deployer);
    const lendingBorrowingContract = await ethers.deployContract("LendingBorrowing", [mainContract.address], deployer);
    console.log(identityImplementationAuthority.address);
    console.log(token.address);
    console.log(identityRegistry.address);
    console.log(claimIssuerContract.address);
    console.log(trexImplementationAuthority.address);
    console.log(defaultCompliance.address);
    console.log(tokenOID.address);
    console.log(USDT.address);
    console.log(mainContract.address);
    console.log(lendingBorrowingContract.address);





    return {
        accounts: {
            deployer,
            tokenIssuer,
            tokenAgent,
            tokenAdmin,
            claimIssuer,

        },

        suite: {
            claimIssuerContract,
            claimTopicsRegistry,
            trustedIssuersRegistry,
            identityRegistryStorage,
            defaultCompliance,
            identityRegistry,
            tokenOID,
            token,
            agentManager,
            // lendingBorrowing,
        },
        authorities: {
            trexImplementationAuthority,
            identityImplementationAuthority,
        },
        factories: {
            trexFactory,
            identityFactory,
        },
        implementations: {
            identityImplementation,
            claimTopicsRegistryImplementation,
            trustedIssuersRegistryImplementation,
            identityRegistryStorageImplementation,
            identityRegistryImplementation,
            modularComplianceImplementation,
            tokenImplementation,
        },
    };
}
main();
// 0xfC9161afB405F398ed3214015db8B93674FC1b43
// 0x72018B88D34B98eC3F8fA7f9145a9d305C727221
// 0x8F3A4dB9c74CC18E730d0eB393524A0da30f8DB6
// 0x72018B88D34B98eC3F8fA7f9145a9d305C727221 tokenAddress
// 0xfC9161afB405F398ed3214015db8B93674FC1b43
// 0x3AFf00D43C1561Cb73a3F850B3d02332A6025682
// 0x5222b75583BeF6952eC516CBB7F0C46E9dc24d98
// 0x8F0b9833875de68C6EA8bD83E5300B36eDC61D08
// 0xA54b95d4807FB7bADBD21C0c165458b92F6e8F82
// 0x5B3bdF8CA0Ee7AC56eE89d47ea3D138c50E23F28
// 0x0ED58e494B4AF7F154d62cC386938717f64E72c1
// 0x8bE44d6B32D9b0457fA7B46cA176388332BC8c8B