import React, { useEffect, useState } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import {
  Card,
  Avatar,
  Grid,
  IconButton,
  Button,
  Typography,
  Box,
  Divider,
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
import { TableNoData } from 'src/components/table';
import axios, { endpoints } from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
import LoadingScreenCustom from 'src/components/loading-screen/loading-screen-custom';
import { useParams } from 'react-router-dom';
import { formatCurrency } from 'src/utils/format-number';
import { ATTACHMENT_TOKEN, ATTACHMENT_URL } from 'src/config-global';

const MarketPlaceDetails = () => {
  const { id } = useParams();

  const urlSearchParams = new URLSearchParams(window.location.search);

  const extendView = urlSearchParams.get('extendview');

  const { enqueueSnackbar } = useSnackbar();

  const settings = useSettingsContext();
  const router = useRouter();
  const theme = useTheme();

  const { user, authenticated } = useAuthContext();

  const [loading, setLoading] = useState(false);

  const [deal, setDeal] = useState(null);

  useEffect(() => {
    handleDealDetails();
  }, []);

  const handleDealDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(endpoints.app.getDealById + id);
      setDeal(response[0]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      enqueueSnackbar(error, {
        variant: 'error',
      });
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Deal Details"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Deals',
            href: paths.dashboard.marketPlace.marketPlaceList,
          },
          { name: 'Deal View' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Grid container>
        <Grid md={user?.role === 2 ? 12 : 8} sx={{ p: 1 }}>
          <Button color="primary" variant="contained" size="small" onClick={() => router.back()}>
            <Iconify icon="mingcute:arrow-left-fill" />
            Back
          </Button>
          {user?.role === 2 && (
            <Button
              sx={{ float: 'right' }}
              color="primary"
              variant="contained"
              onClick={() => router.push(`${paths.dashboard.marketPlace.lendNow}?id=${deal?._id}`)}
            >
              Lend Now
            </Button>
          )}
          <Card sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Stack flexDirection="row" justifyContent="space-between">
              <Stack spacing={1}>
                <Typography>Loan Amount</Typography>
                <Typography variant="subtitle1" gutterBottom>
                  {formatCurrency(deal?.overview?.loanAmount)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {deal?.overview?.loanSummary}
                </Typography>
              </Stack>
              <Avatar
                alt={_mock.fullName(9)}
                src={
                  deal?.borrower?.logo[0]?.attachmentPath
                    ? ATTACHMENT_URL + deal?.borrower?.logo[0]?.attachmentPath + ATTACHMENT_TOKEN
                    : '/logo/mate.finance_verti.png'
                }
                sx={{
                  p: 0,
                  width: 45,
                  height: 45,
                  border: `solid 2px ${theme.palette.background.paper}`,
                }}
              />
            </Stack>
            <Divider />
            <br />
            <Stack spacing={3}>
              <Box
                columnGap={2}
                rowGap={3}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  md: 'repeat(3, 1fr)',
                }}
              >
                <Stack>
                  <Typography>APY Rate</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {deal?.overview?.apyRate} %
                  </Typography>
                </Stack>
                <Stack>
                  <Typography>RWA</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {deal?.overview?.rwa}
                  </Typography>
                </Stack>

                <Stack>
                  <Typography>Asset Type</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {deal?.overview?.assetType}
                  </Typography>
                </Stack>

                <Stack>
                  <Typography>Minimum Financing Amt.</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {formatCurrency(deal?.overview?.minimumFinancingAmt)}
                  </Typography>
                </Stack>

                <Stack>
                  <Typography>Maximum Financing Amt.</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {formatCurrency(deal?.overview?.maximumFinancingAmt)}
                  </Typography>
                </Stack>

                <Stack>
                  <Typography>Early Withdraw Fee</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {formatCurrency(deal?.overview?.earlyWithdrawFee) || 'N.A.'}
                  </Typography>
                </Stack>

                <Stack>
                  <Typography>Deal Expires In</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {deal?.overview?.dealExpiresIn}
                  </Typography>
                </Stack>

                <Stack>
                  <Typography>Loan Tenure</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {deal?.overview?.loanTenure}
                  </Typography>
                </Stack>

                <Stack>
                  <Typography>Settlement Cycle</Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {deal?.overview?.settlementCycle}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Grid>
        {user?.role !== 2 && (
          <Grid md={4}>
            <Card sx={{ mt: 6 }}>
              <FinanceStatusTimeLine invoice={deal} />
            </Card>
          </Grid>
        )}
      </Grid>

      <Card sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Borrower
        </Typography>
        <Stack spacing={1}>
          <Typography variant="subtitle1" gutterBottom>
            Borrower Name: {deal?.borrower?.name}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {deal?.borrower?.summary}
          </Typography>
          <Stack flexDirection="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                const websiteLink = deal?.borrower?.websiteLink;
                if (websiteLink) {
                  const modifiedLink = websiteLink.startsWith('https://')
                    ? websiteLink
                    : `https://${websiteLink}`;
                  window.open(modifiedLink);
                }
              }}
              disabled={!deal?.borrower?.websiteLink}
            >
              Borrower Website <Iconify icon="ion:arrow-redo-outline" />
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() =>
                window.open(
                  `https://beta.invoicemate.net/auth/jwt/invoice_view/${deal?.Borrower?.invoiceMongoId}`
                )
              }
            >
              Invoice <Iconify icon="ion:arrow-redo-outline" />
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() =>
                window.open(
                  'https://sepolia.arbiscan.io/address/0x30C49ACCd99Fb157122e70F7e27B5e4d95B6B658#code'
                )
              }
            >
              Smart Contract <Iconify icon="ion:arrow-redo-outline" />
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                const websiteLink = deal?.borrower?.linkedinLink;
                if (websiteLink) {
                  const modifiedLink = websiteLink.startsWith('https://')
                    ? websiteLink
                    : `https://${websiteLink}`;
                  window.open(modifiedLink);
                }
              }}
              disabled={!deal?.borrower?.linkedinLink}
            >
              LinkedIn <Iconify icon="ion:arrow-redo-outline" />
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                const websiteLink = deal?.borrower?.twitterLink;
                if (websiteLink) {
                  const modifiedLink = websiteLink.startsWith('https://')
                    ? websiteLink
                    : `https://${websiteLink}`;
                  window.open(modifiedLink);
                }
              }}
              disabled={!deal?.borrower?.twitterLink}
            >
              Twitter <Iconify icon="ion:arrow-redo-outline" />
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Card sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Underwriter
        </Typography>
        <Stack flexDirection="row" justifyContent="space-between">
          <Stack spacing={1}>
            <Typography variant="subtitle1" gutterBottom>
              Name: {deal?.underwriter?.underWName}
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            const websiteLink = deal?.underwriter?.underWLink;
            if (websiteLink) {
              const modifiedLink = websiteLink.startsWith('https://')
                ? websiteLink
                : `https://${websiteLink}`;
              window.open(modifiedLink);
            }
          }}
          disabled={!deal?.underwriter?.underWLink}
        >
          Website <Iconify icon="ion:arrow-redo-outline" />
        </Button>
      </Card>

      <Card sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Risk Mitigation
        </Typography>
        <Stack flexDirection="row" justifyContent="space-between">
          <Stack spacing={1}>
            <Typography variant="subtitle1" gutterBottom>
              KYI Report
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            const websiteLink = deal?.riskMitigation?.kyiLink;
            if (websiteLink) {
              const modifiedLink = websiteLink.startsWith('https://')
                ? websiteLink
                : `https://${websiteLink}`;
              window.open(modifiedLink);
            }
          }}
          disabled={!deal?.riskMitigation?.kyiLink}
        >
          Learn More <Iconify icon="ion:arrow-redo-outline" />
        </Button>
      </Card>
      {extendView === 'true' && (
        <Card sx={{ p: 3, mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Lender Name: {deal?.borrower?.name}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {deal?.borrower?.summary}
          </Typography>
        </Card>
      )}
      {user?.role !== 2 && (
        <Card sx={{ mt: 2 }}>
          <CardHeader title="Recent Transaction" />

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
      )}
    </Container>
  );
};

export default MarketPlaceDetails;
