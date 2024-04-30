import { Contract, Signer, } from 'ethers';
import { ethers } from 'hardhat';

// import { ethers } from 'hardhat';
import OnchainID from '@onchain-id/solidity';
import tokenartifact from '../../artifacts/contracts/token/Token.sol/Token.json';
import identityRegistryArtifact from '../../artifacts/contracts/registry/implementation/IdentityRegistry.sol/IdentityRegistry.json';
import { tokenAddress, identityRegistryContractAddress, claimIssuerContractAddress, identityImplementationAuthorityAddress } from './ContractAddresses';


const deployerPrivateKey = 'e8a78114b7d9d2f95d5af3d95068be38781e4c8707cb52c5c7a352a49c2f4c7b'; //4
const tokenAgentPrivateKey = '83d384a362c4a80b06abcd995b1c1c8207f8a9c38a5056a8936078391e780615';//1
const claimIssuerPrivateKey = 'a9c987111f513e6f63f29ee82ea56a36f46e042e4637fd1e32facaa28a408489';//3

const provider = new ethers.providers.JsonRpcProvider('https://arb-sepolia.g.alchemy.com/v2/a4Jk6Pp4C5ncBtBUF6PTN6KHm4oYxfku');
const deployer = new ethers.Wallet(deployerPrivateKey, provider);
const tokenAgent = new ethers.Wallet(tokenAgentPrivateKey, provider);
const claimIssuer = new ethers.Wallet(claimIssuerPrivateKey, provider);

async function deployIdentityProxy(implementationAuthority: Contract['address'], managementKey: string, signer: Signer) {
    const identity = await new ethers.ContractFactory(OnchainID.contracts.IdentityProxy.abi, OnchainID.contracts.IdentityProxy.bytecode, signer).deploy(
        implementationAuthority,
        managementKey,
    );

    return ethers.getContractAt('Identity', identity.address, signer);
}

async function registerIdentity() {


    const token = new ethers.Contract(tokenAddress, tokenartifact.abi, deployer);
    const identityRegistry = new ethers.Contract(identityRegistryContractAddress, identityRegistryArtifact.abi, deployer);

    const lender = new ethers.Wallet("dd2c5a7e4d6a9b0c8898c3990851c7639f6f5505034ece53ae5b23e3f9e83905", provider);

    const lenderIdentity = await deployIdentityProxy(identityImplementationAuthorityAddress, lender.address, deployer);
    await lenderIdentity
        .connect(lender)
        .addKey(ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [lender.address])), 2, 1);
    await identityRegistry
        .connect(tokenAgent)
        .registerIdentity(lender.address, lenderIdentity.address, 42);
    const claimTopics = [ethers.utils.id('CLAIM_TOPIC')];
    const claimForSigner = {
        data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Some claim public data.')),
        issuer: claimIssuerContractAddress,
        topic: claimTopics[0],
        scheme: 1,
        identity: lenderIdentity.address,
        signature: '',
    };
    claimForSigner.signature = await claimIssuer.signMessage(
        ethers.utils.arrayify(
            ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(['address', 'uint256', 'bytes'], [claimForSigner.identity, claimForSigner.topic, claimForSigner.data]),
            ),
        ),
    );

    await lenderIdentity
        .connect(lender)
        .addClaim(claimForSigner.topic, claimForSigner.scheme, claimForSigner.issuer, claimForSigner.signature, claimForSigner.data, '');
    await token.connect(tokenAgent).mint(lender.address, 1000);
    console.log("done");

}
registerIdentity();

