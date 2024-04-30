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
    const deployerPrivateKey = 'e8a78114b7d9d2f95d5af3d95068be38781e4c8707cb52c5c7a352a49c2f4c7b'; //4
    const tokenIssuerPrivateKey = 'e8a78114b7d9d2f95d5af3d95068be38781e4c8707cb52c5c7a352a49c2f4c7b';//4
    const tokenAgentPrivateKey = '83d384a362c4a80b06abcd995b1c1c8207f8a9c38a5056a8936078391e780615';//1
    const tokenAdminPrivateKey = '7df9b52d7233ae4977ee885c866804c936147bfc30655beaa6756fc9ae1f187c'; //2
    const claimIssuerPrivateKey = 'a9c987111f513e6f63f29ee82ea56a36f46e042e4637fd1e32facaa28a408489';//3
    const aliceWalletPrivateKey = 'dd2c5a7e4d6a9b0c8898c3990851c7639f6f5505034ece53ae5b23e3f9e83905'; //6
    const bobWalletPrivateKey = 'f62a21a0c252fc9ba91b9a60b016cf3caa6c9424a03ea3147aefd3e3013b3d1f'; //5

    const provider = new ethers.providers.JsonRpcProvider('https://arb-sepolia.g.alchemy.com/v2/a4Jk6Pp4C5ncBtBUF6PTN6KHm4oYxfku');
    const deployer = new ethers.Wallet(deployerPrivateKey, provider);
    const tokenIssuer = new ethers.Wallet(tokenIssuerPrivateKey, provider);
    const tokenAgent = new ethers.Wallet(tokenAgentPrivateKey, provider);
    const tokenAdmin = new ethers.Wallet(tokenAdminPrivateKey, provider);
    const claimIssuer = new ethers.Wallet(claimIssuerPrivateKey, provider);
    const aliceWallet = new ethers.Wallet(aliceWalletPrivateKey, provider);
    const bobWallet = new ethers.Wallet(bobWalletPrivateKey, provider);

    // const [deployer, tokenIssuer, tokenAgent, tokenAdmin, claimIssuer, aliceWallet, bobWallet, charlieWallet, davidWallet, anotherWallet] =
    //     await ethers.getSigners();
    // const claimIssuerSigningKey = ethers.Wallet.createRandom();
    const aliceActionKey = ethers.Wallet.createRandom();

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
    const tokenDecimals = BigNumber.from('0');
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

    // const aliceIdentity = await deployIdentityProxy(identityImplementationAuthority.address, aliceWallet.address, deployer);
    // await aliceIdentity
    //     .connect(aliceWallet)
    //     .addKey(ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [aliceActionKey.address])), 2, 1);
    // const bobIdentity = await deployIdentityProxy(identityImplementationAuthority.address, bobWallet.address, deployer);
    // const charlieIdentity = await deployIdentityProxy(identityImplementationAuthority.address, charlieWallet.address, deployer);

    await identityRegistry.connect(deployer).addAgent(tokenAgent.address);
    await identityRegistry.connect(deployer).addAgent(token.address);

    // await identityRegistry
    //     .connect(tokenAgent)
    //     .batchRegisterIdentity([aliceWallet.address, bobWallet.address], [aliceIdentity.address, bobIdentity.address], [42, 666]);

    // const claimForAlice = {
    //     data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Some claim public data.')),
    //     issuer: claimIssuerContract.address,
    //     topic: claimTopics[0],
    //     scheme: 1,
    //     identity: aliceIdentity.address,
    //     signature: '',
    // };
    // claimForAlice.signature = await claimIssuerSigningKey.signMessage(
    //     ethers.utils.arrayify(
    //         ethers.utils.keccak256(
    //             ethers.utils.defaultAbiCoder.encode(['address', 'uint256', 'bytes'], [claimForAlice.identity, claimForAlice.topic, claimForAlice.data]),
    //         ),
    //     ),
    // );

    // await aliceIdentity
    //     .connect(aliceWallet)
    //     .addClaim(claimForAlice.topic, claimForAlice.scheme, claimForAlice.issuer, claimForAlice.signature, claimForAlice.data, '');

    // const claimForBob = {
    //     data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Some claim public data.')),
    //     issuer: claimIssuerContract.address,
    //     topic: claimTopics[0],
    //     scheme: 1,
    //     identity: bobIdentity.address,
    //     signature: '',
    // };
    // claimForBob.signature = await claimIssuerSigningKey.signMessage(
    //     ethers.utils.arrayify(
    //         ethers.utils.keccak256(
    //             ethers.utils.defaultAbiCoder.encode(['address', 'uint256', 'bytes'], [claimForBob.identity, claimForBob.topic, claimForBob.data]),
    //         ),
    //     ),
    // );

    // await bobIdentity
    //     .connect(bobWallet)
    //     .addClaim(claimForBob.topic, claimForBob.scheme, claimForBob.issuer, claimForBob.signature, claimForBob.data, '');

    // await token.connect(tokenAgent).mint(aliceWallet.address, 1000);
    // await token.connect(tokenAgent).mint(bobWallet.address, 500);

    await agentManager.connect(tokenAgent).addAgentAdmin(tokenAdmin.address);
    await token.connect(deployer).addAgent(agentManager.address);
    await identityRegistry.connect(deployer).addAgent(agentManager.address);

    await token.connect(tokenAgent).unpause();

    console.log(token.address);
}
main();
