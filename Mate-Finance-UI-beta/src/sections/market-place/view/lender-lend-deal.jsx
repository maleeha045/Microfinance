import React, { useEffect, useState } from 'react';
import OnchainID from '@onchain-id/solidity';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import erc20Abi from "../../../../../smart-contracts/ERC-3643-main/artifacts/contracts/lendingBorrowing/USDT.sol/USDT.json";
import lendingBorrowingABI from "../../../../../smart-contracts/ERC-3643-main/artifacts/contracts/lendingBorrowing/LendingBorrowing.sol/LendingBorrowing.json";
import identityRegistryABI from "../../../../../smart-contracts/ERC-3643-main/artifacts/contracts/registry/implementation/IdentityRegistry.sol/IdentityRegistry.json";
import tokenABI from "../../../../../smart-contracts/ERC-3643-main/artifacts/contracts/token/Token.sol/Token.json";
import mainContractABI from "../../../../../smart-contracts/ERC-3643-main/artifacts/contracts/lendingBorrowing/MainContract.sol/MainContract.json";
import web3 from "web3";
import { Number } from "Number";

import {
  Card,
  Avatar,
  Grid,
  IconButton,
  Button,
  Typography,
  Box,
  Divider,
  TextField,
  CardHeader,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Container from '@mui/material/Container';

import FinanceStatusTimeLine from 'src/sections/financing-profile/finance-status-timeline';
import { _mock } from 'src/_mock';
import { useTheme } from '@mui/material/styles';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { Stack } from '@mui/system';
import { useAuthContext } from 'src/auth/hooks';
import { useNavigate } from 'react-router-dom';
import { TableNoData } from 'src/components/table';
import axios, { endpoints } from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
import LoadingScreenCustom from 'src/components/loading-screen/loading-screen-custom';
import { formatCurrency } from 'src/utils/format-number';
import { ethers } from 'ethers';
import { SMART_CON_URL, WALLET_KEY } from 'src/config-global';
// import { usdtAddress, mainContractAddress, lendingBorrowingAddress } from "../../../helpers/helpers";

const LenderLendDeal = () => {
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();
  const settings = useSettingsContext();
  const router = useRouter();
  const theme = useTheme();

  const { user, authenticated } = useAuthContext();

  const urlSearchParams = new URLSearchParams(window.location.search);

  const id = urlSearchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [financialDetail, setFinancialDetail] = useState(null);
  const [lendingAmt, setLendingAmt] = useState(0);
  const [lenderWallet, setLenderWallet] = useState('');

  useEffect(() => {
    if (id) {
      getDeal();
    }
  }, []);

  const getDeal = async () => {
    setLoading(false);
    try {
      const response = await axios.get(`${endpoints.app.getDealById}/${id}`);
      const deal = response[0];
      setFinancialDetail(deal);
    } catch (error) {
      enqueueSnackbar(error, { variant: 'error' });
      setLoading(false);
    }
  };

  // Lender depositing USDT
  async function _depositFunds() {
    const walletPrivateKey = '0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0';
    const wallet = new ethers.Wallet(walletPrivateKey);
    // Create ethers wallet instance using private key
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
    const deployer = wallet.connect(provider);

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x7A69' }], // chainId must be in hexadecimal numbers
    });

    // Request account access if needed
    const account = new ethers.providers.Web3Provider(window.ethereum);
    await account.send('eth_requestAccounts', []);

    const lender = account.getSigner();
    const lenderAddress = await lender.getAddress();
    const borrower = "0xe95E9Ee4D616D574A92869575ca5c0D85141bB47";

    const lendingBorrowingAddress = "0x91C8a12a268326e4A52aD3904F25e310dd89c798";

    const lendingBorrowing = new ethers.Contract(
      lendingBorrowingAddress,
      lendingBorrowingABI.abi,
      deployer
    );
    const amountInWei = web3.utils.toWei("20", 'ether');

    const usdtAddress = "0xD573b58F36E02784Fd69C01d48b3341bb43b32BA";

    const USDT = new ethers.Contract(usdtAddress, erc20Abi.abi, deployer);
    const mainContractAddress = "0x8533248640f2d2D86D4A5661A9A4B2F3ad2b75A6";
    const mainContract = new ethers.Contract(mainContractAddress, mainContractABI.abi, deployer);


    await lendingBorrowing.connect(lender).depositFunds(amount, borrower);
    // await lendingBorrowing.connect(deployer).approveloan(borrower);
  };
  async function storeBorrowerDetails() {
    const walletPrivateKey = '0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0';

    // Create ethers wallet instance using private key
    const wallet = new ethers.Wallet(walletPrivateKey);

    // Create provider
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
    // Use wallet to connect to provider
    const deployer = wallet.connect(provider);


    const borrower = "0xe95E9Ee4D616D574A92869575ca5c0D85141bB47";
    const lendingBorrowingAddress = "0x91C8a12a268326e4A52aD3904F25e310dd89c798";

    const lendingBorrowing = new ethers.Contract(lendingBorrowingAddress, lendingBorrowingABI.abi, deployer);
    const amountInWei = web3.utils.toWei("20", 'ether');
    await lendingBorrowing.connect(deployer).storeBorrowerDetails(borrower, amountInWei, 24, "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol", 2)
    const result = await lendingBorrowing.getBorrowerDetails(borrower);
    console.log(result);
    // console.log(result.principal.toNumber());

  }


  const deployIdentityProxy = async (implementationAuthority, managementKey, signer) => {
    const identity = await new ethers.ContractFactory(OnchainID.contracts.IdentityProxy.abi, OnchainID.contracts.IdentityProxy.bytecode, signer).deploy(
      implementationAuthority,
      managementKey,
    );
    const identityContract = new ethers.Contract(
      identity.address,
      OnchainID.contracts.Identity.abi,
      signer
    );

    return identityContract;

    // return ethers.getContract('Identity', identity.address, signer);
  }

  async function addKey() {

    const tokenAgentPrivateKey = "df57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";
    const TokenAgent = new ethers.Wallet(tokenAgentPrivateKey);
    const claimIssuerPrivateKey = "0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd";
    const ClaimIssuer = new ethers.Wallet(claimIssuerPrivateKey);
    const walletPrivateKey = '0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0';

    // Create ethers wallet instance using private key
    const wallet = new ethers.Wallet(walletPrivateKey);

    // Create provider
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
    // Use wallet to connect to provider
    const deployer = wallet.connect(provider);
    const tokenAgent = TokenAgent.connect(provider);
    const claimIssuer = ClaimIssuer.connect(provider);
    // // Request access to the user's Ethereum account
    const account = new ethers.providers.Web3Provider(window.ethereum);
    await account.send('eth_requestAccounts', []);
    const lender = account.getSigner();
    const lenderAddress = await lender.getAddress();
    const identityRegistryAddress = "0x943c78A4106A80CaC8325F234155c1d4D6D5C90C"
    // const identityRegistryABI = ["function registerIdentity(address,address,uint16)"];
    const identityRegistry = new ethers.Contract(identityRegistryAddress, identityRegistryABI.abi, deployer);
    const identityImplementationAuthorityAddress = "0xd4e736FA276fC3A95768EDb7987f4dec25d67BB2";
    const lenderIdentity = await deployIdentityProxy(identityImplementationAuthorityAddress, lenderAddress, deployer);
    const claimIssuerContractAddress = "0x198c46853A9050A236bD0990bCeb99FD72D69F39";
    await lenderIdentity.connect(lender).addKey(ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [lenderAddress])), 2, 1);

    await identityRegistry
      .connect(tokenAgent)
      .registerIdentity(lenderAddress, lenderIdentity.address, 42);
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
    const tokenAddress = "0x40eca60822BfdCF0B536B19F0B51e4BBA25A97AB";
    await lenderIdentity
      .connect(lender)
      .addClaim(claimForSigner.topic, claimForSigner.scheme, claimForSigner.issuer, claimForSigner.signature, claimForSigner.data, '');
    const token = new ethers.Contract(tokenAddress, tokenABI.abi, deployer);
    await token.connect(tokenAgent).mint(lenderAddress, 100);
    console.log("done");
  }

  // Store lender details and mint token
  const _storeLenderDetails = async () => {

    const walletPrivateKey = '0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0';

    // Create ethers wallet instance using private key
    const wallet = new ethers.Wallet(walletPrivateKey);

    // Create provider
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
    // Use wallet to connect to provider
    const deployer = wallet.connect(provider);
    const lendingBorrowingAddress = "0xDA4De69034Dc411fdf7d2CcDb3C7294E6e33346e";

    const lendingBorrowing = new ethers.Contract(
      lendingBorrowingAddress,
      lendingBorrowingABI.abi,
      deployer
    );
    const borrower = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
    const usdtAmount = ethers.utils.parseUnits("20", 18);
    const lender = "0xcd3B766CCDd6AE721141F452C550Ca635964ce71";
    await lendingBorrowing.connect(deployer).storeLenderDetailsAndMintTokens(lender, usdtAmount, borrower);

  };

  const handleLendingReq = async () => {
    // if (Number(lendingAmt) < financialDetail?.overview?.minimumFinancingAmt) {
    //   enqueueSnackbar('Amount not less than minimum financing Amount', { variant: 'error' });
    //   return;
    // }
    // if (Number(lendingAmt) > financialDetail?.overview?.maximumFinancingAmt) {
    //   enqueueSnackbar('Amount not greater than maximum financing Amount', { variant: 'error' });
    //   return;
    // }
    setLoading(false);

    try {
      await _depositFunds();
      await addKey();
      await _storeLenderDetails();
      console.log('hello');
      const response = await axios.post(`${endpoints.app.lendNow}`, {
        lenderId: user?.id,
        lendingAmount: lendingAmt,
        dealId: id,
        status: false,
        walletAddress: '0x8Beed1e9497D197FdFf13836ed08AD04F0e74E89',
      });
      enqueueSnackbar('Success!');
    } catch (error) {
      enqueueSnackbar(error, { variant: 'error' });
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingScreenCustom />}
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Lending Details"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Deals',
              href: paths.dashboard.marketPlace.marketPlaceList,
            },
            { name: 'Lending Details' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Grid container>
          <Grid sm={12} md={8} sx={{ p: 1 }}>
            <Button color="primary" variant="contained" size="small" onClick={() => navigate(-1)}>
              <Iconify icon="mingcute:arrow-left-fill" />
              Back
            </Button>
            <Card sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                New Lending
              </Typography>
              <br />
              <Stack flexDirection="column" justifyContent="space-between" spacing={2}>
                <TextField
                  label="Lending Amount"
                  type="number"
                  onChange={(event) => setLendingAmt(event.target.value)}
                />
                <Stack>
                  <Typography>FINANCING PERIOD</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {financialDetail?.overview?.loanTenure}
                  </Typography>
                </Stack>

                <Stack>
                  <Typography>APY Rate</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {financialDetail?.overview?.apyRate} %
                  </Typography>
                </Stack>

                <Stack flexDirection="row" spacing={1}>
                  <Typography>Minimum Financing:</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {formatCurrency(financialDetail?.overview?.minimumFinancingAmt)}
                  </Typography>
                </Stack>

                <Stack flexDirection="row" spacing={1}>
                  <Typography>Maximum Financing:</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {formatCurrency(financialDetail?.overview?.maximumFinancingAmt)}
                  </Typography>
                </Stack>

                <Stack flexDirection="row" spacing={1}>
                  <Typography>Early withdraw fee:</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {formatCurrency(financialDetail?.overview?.earlyWithdrawFee)}
                  </Typography>
                </Stack>
                <Button variant="contained" color="primary" onClick={handleLendingReq}>
                  Approve
                </Button>
                <button onClick={storeBorrowerDetails}>storeBorrower</button>
                <button onClick={_depositFunds}>deposit</button>
                <button onClick={addKey}>addKey</button>
                <button onClick={_storeLenderDetails}>storelender</button>

              </Stack>
            </Card>
          </Grid>

          <Grid sm={12} md={4}>
            <Card sx={{ p: 3, mt: 7 }}>
              <Typography variant="h6" gutterBottom>
                Network Stats
              </Typography>
              <br />
              <Stack flexDirection="column" justifyContent="space-between" spacing={2}>
                <Stack flexDirection="row" gap={1}>
                  <Iconify icon="solar:dollar-line-duotone" width={35} />
                  <Stack>
                    <Typography variant="subtitle1">
                      {formatCurrency(financialDetail?.overview?.loanAmount)}
                    </Typography>
                    <Typography variant="overline" display="block" gutterBottom>
                      Loan Amount
                    </Typography>
                  </Stack>
                </Stack>

                {/* <Stack flexDirection="row" gap={1}>
                  <Iconify icon="fa6-solid:hand-holding-dollar" width={35} />
                  <Stack>
                    <Typography variant="subtitle1">0 USD</Typography>
                    <Typography variant="overline" display="block" gutterBottom>
                      Available Pool Value
                    </Typography>
                  </Stack>
                </Stack>

                <Stack flexDirection="row" gap={1}>
                  <Iconify icon="ic:round-lock" width={35} />
                  <Stack>
                    <Typography variant="subtitle1">5000 USD</Typography>
                    <Typography variant="overline" display="block" gutterBottom>
                      Total Value Locked
                    </Typography>
                  </Stack>
                </Stack> */}

                <Stack flexDirection="row" gap={1}>
                  <Iconify icon="ic:twotone-percentage" width={35} />
                  <Stack>
                    <Typography variant="subtitle1">
                      {financialDetail?.overview?.apyRate} %
                    </Typography>
                    <Typography variant="overline" display="block" gutterBottom>
                      APY
                    </Typography>
                  </Stack>
                </Stack>

                <Stack flexDirection="row" gap={1}>
                  <Iconify icon="ph:stack-bold" width={35} />
                  <Stack>
                    <Typography variant="subtitle1">{financialDetail?.overview?.rwa}</Typography>
                    <Typography variant="overline" display="block" gutterBottom>
                      Number of Lenders
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Grid>

          <Grid sm={12} md={12}>
            <Card>
              <CardHeader title="Your Statement" />

              <Stack
                sx={{
                  px: 3,
                }}
              >
                <br />
                <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                  <Table size={'medium'}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Transaction Hash</TableCell>
                        <TableCell>FXD Balance Before</TableCell>
                        <TableCell>Amount (FXD)</TableCell>
                        <TableCell>FXD Balance After</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableNoData notFound={true} />
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default LenderLendDeal;
