import { Contract } from 'ethers';
import OnchainID from '@onchain-id/solidity';
import tokenartifact from '../../artifacts/contracts/token/Token.sol/Token.json';
import identityRegistryArtifact from '../../artifacts/contracts/registry/implementation/IdentityRegistry.sol/IdentityRegistry.json';
import { tokenAddress, identityRegistryContractAddress, claimIssuerContractAddress, identityImplementationAuthorityAddress } from './ContractAddresses';

async function deployIdentityProxy(implementationAuthority, managementKey, signer) {
    const identity = await new ethers.ContractFactory(OnchainID.contracts.IdentityProxy.abi, OnchainID.contracts.IdentityProxy.bytecode, signer).deploy(
        implementationAuthority,
        managementKey,
    );

    return ethers.getContractAt('Identity', identity.address, signer);
}

async function registerIdentity() {
    if (window.ethereum) {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const token = new Contract(tokenAddress, tokenartifact.abi, signer);
        const identityRegistry = new Contract(identityRegistryContractAddress, identityRegistryArtifact.abi, signer);

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const lenderAddress = accounts[0];
        const lender = signer.connect(provider.getSigner(lenderAddress));

        const lenderIdentity = await deployIdentityProxy(identityImplementationAuthorityAddress, lender.address, signer);
        await lenderIdentity.addKey(ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [lender.address])), 2, 1);
        await identityRegistry.registerIdentity(lender.address, lenderIdentity.address, 42);

        // Rest of the code remains the same, adjust UI integration as needed
    } else {
        console.error('Web3 provider not found. Please install MetaMask or another provider.');
    }
}

registerIdentity();
