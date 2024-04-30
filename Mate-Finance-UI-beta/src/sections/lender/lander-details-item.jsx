import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fCurrency } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import Label from 'src/components/label';
import { ATTACHMENT_TOKEN, ATTACHMENT_URL } from 'src/config-global';
import { Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { TableNoData } from 'src/components/table';
import axios, { endpoints } from 'src/utils/axios';
import { useState } from 'react';
import LoadingScreenCustom from 'src/components/loading-screen/loading-screen-custom';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export default function LenderDetailsItems({ status, statusOptions, lender, getLenderDetails }) {
  // const renderTotal = (
  //   <Stack
  //     spacing={2}
  //     alignItems="flex-end"
  //     sx={{ my: 3, textAlign: 'right', typography: 'body2' }}
  //   >
  //     <Stack direction="row">
  //       <Box sx={{ color: 'text.secondary' }}>Subtotal</Box>
  //       <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(subTotal) || '-'}</Box>
  //     </Stack>

  //     <Stack direction="row">
  //       <Box sx={{ color: 'text.secondary' }}>Shipping</Box>
  //       <Box
  //         sx={{
  //           width: 160,
  //           ...(shipping && { color: 'error.main' }),
  //         }}
  //       >
  //         {shipping ? `- ${fCurrency(shipping)}` : '-'}
  //       </Box>
  //     </Stack>

  //     <Stack direction="row">
  //       <Box sx={{ color: 'text.secondary' }}>Discount</Box>
  //       <Box
  //         sx={{
  //           width: 160,
  //           ...(discount && { color: 'error.main' }),
  //         }}
  //       >
  //         {discount ? `- ${fCurrency(discount)}` : '-'}
  //       </Box>
  //     </Stack>

  //     <Stack direction="row">
  //       <Box sx={{ color: 'text.secondary' }}>Taxes</Box>
  //       <Box sx={{ width: 160 }}>{taxes ? fCurrency(taxes) : '-'}</Box>
  //     </Stack>

  //     <Stack direction="row" sx={{ typography: 'subtitle1' }}>
  //       <Box>Total</Box>
  //       <Box sx={{ width: 160 }}>{fCurrency(totalAmount) || '-'}</Box>
  //     </Stack>
  //   </Stack>
  // );

  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (walletId, status) => {
    setLoading(true);
    try {
      const response = await axios.post(`${endpoints.app.updateRejectWallet}`, {
        lenderId: lender._id,
        walletId: walletId,
        walletStatus: status,
      });
      setLoading(false);
      enqueueSnackbar(`Wallet ${status} successfully`);
      getLenderDetails();
    } catch (error) {
      setLoading(false);
      enqueueSnackbar(error, { variant: 'error' });
    }
  };

  return (
    <>
      {loading && <LoadingScreenCustom />}
      <Card>
        <CardHeader
          title="Personal Info"
          action={
            <Label
              variant="soft"
              color={
                (status === 'approve' && 'success') ||
                (status === 'needMoreDetails' && 'warning') ||
                (status === 'rejected' && 'error') ||
                'info'
              }
            >
              {statusOptions.find((x) => x.value === status)?.label || ''}
            </Label>
          }
        />

        <Stack
          sx={{
            px: 3,
          }}
        >
          <Scrollbar>
            <Stack
              key={1}
              direction="row"
              alignItems="center"
              sx={{
                py: 3,
                minWidth: 640,
                borderBottom: (theme) => `dashed 2px ${theme.palette.background.neutral}`,
              }}
            >
              <Avatar
                src={ATTACHMENT_URL + lender?.profilePicture[0]?.attachmentURL + ATTACHMENT_TOKEN}
                variant="rounded"
                sx={{ width: 48, height: 48, mr: 2 }}
              />

              <ListItemText
                primary={lender?.firstName + ' ' + lender?.lastName}
                secondary={lender?.email}
                primaryTypographyProps={{
                  typography: 'body2',
                }}
                secondaryTypographyProps={{
                  component: 'span',
                  color: 'text.disabled',
                  mt: 0.5,
                }}
              />
            </Stack>
            <Box
              // rowGap={5}
              p={2}
              display="grid"
              alignItems="center"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              <Stack sx={{ typography: 'body2' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Mobile Number
                </Typography>
                {lender?.mobileNumber}
              </Stack>

              <Stack sx={{ typography: 'body2' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Country
                </Typography>
                {lender?.country}
              </Stack>

              <Stack sx={{ typography: 'body2' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  City
                </Typography>
                {lender?.geoLocation?.city}
              </Stack>
            </Box>
          </Scrollbar>

          {/* {renderTotal} */}
        </Stack>
      </Card>

      <Card>
        <CardHeader title="On-Boarding Details" />

        <Stack
          sx={{
            px: 3,
          }}
        >
          <Scrollbar>
            <Box
              rowGap={5}
              p={2}
              display="grid"
              alignItems="center"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
            >
              {/* <Stack sx={{ typography: 'body2' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Wallet Address
                </Typography>
                {lender?.walletAddress}
              </Stack> */}

              <Stack sx={{ typography: 'body2' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Identity Document
                </Typography>
                {lender?.identityDoc?.length > 0 ? (
                  <Box
                    sx={{
                      m: 0.5,
                      width: 100,
                      height: 107,
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 1,
                      cursor: 'pointer',
                      alignItems: 'center',
                      color: 'text.disabled',
                      justifyContent: 'center',
                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                      border: (theme) => `dashed 1px ${alpha(theme.palette.grey[500], 0.16)}`,
                    }}
                  >
                    <Iconify icon="iconamoon:attachment-duotone" width={28} />
                    <Typography>
                      {lender?.identityDoc[0]?.attachmentTitle?.substring(0, 10)}
                    </Typography>
                    <Typography variant="caption">{lender?.identityDoc[0]?.type}</Typography>
                    <Box sx={{ justifyContent: 'space-between' }}>
                      <IconButton>
                        <Iconify
                          icon="solar:eye-bold"
                          onClick={() =>
                            window.open(
                              ATTACHMENT_URL +
                                lender?.identityDoc[0]?.attachmentURL +
                                ATTACHMENT_TOKEN
                            )
                          }
                          width={18}
                        />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  '-'
                )}
              </Stack>

              <Stack sx={{ typography: 'body2' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Additional Document
                </Typography>
                {lender?.additionalDocument?.length > 0 ? (
                  <Box
                    sx={{
                      m: 0.5,
                      width: 100,
                      height: 107,
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 1,
                      cursor: 'pointer',
                      alignItems: 'center',
                      color: 'text.disabled',
                      justifyContent: 'center',
                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                      border: (theme) => `dashed 1px ${alpha(theme.palette.grey[500], 0.16)}`,
                    }}
                  >
                    <Iconify icon="iconamoon:attachment-duotone" width={28} />
                    <Typography>
                      {lender?.additionalDocument[0]?.attachmentTitle?.substring(0, 10)}
                    </Typography>
                    <Typography variant="caption">{lender?.additionalDocument[0]?.type}</Typography>
                    <Box sx={{ justifyContent: 'space-between' }}>
                      <IconButton>
                        <Iconify
                          icon="solar:eye-bold"
                          onClick={() =>
                            window.open(
                              ATTACHMENT_URL +
                                lender?.additionalDocument[0]?.attachmentURL +
                                ATTACHMENT_TOKEN
                            )
                          }
                          width={18}
                        />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  '-'
                )}
              </Stack>
            </Box>
          </Scrollbar>

          {/* {renderTotal} */}
        </Stack>
      </Card>

      <Card>
        <CardHeader title="Connected Wallets" />

        <Stack
          sx={{
            px: 3,
          }}
        >
          <br />
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Table size={'medium'} sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Wallet Name</TableCell>
                  <TableCell>Wallet Address</TableCell>
                  <TableCell>Wallet Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lender?.wallet?.map((item, index) => (
                  <TableRow>
                    <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar alt={item?.walletName} src={item?.walletIcon} sx={{ mr: 2 }} />

                      <ListItemText
                        primary={item.walletName}
                        // secondary={email}
                        primaryTypographyProps={{ typography: 'body2' }}
                        secondaryTypographyProps={{
                          component: 'span',
                          color: 'text.disabled',
                        }}
                      />
                    </TableCell>
                    {/* <TableCell>{item?.walletName}</TableCell> */}
                    <TableCell>{item?.walletAddress}</TableCell>
                    <TableCell>
                      <Label color="primary">{item?.walletStatus.toUpperCase()}</Label>
                    </TableCell>
                    <TableCell>
                      {' '}
                      <Tooltip title="WhiteList Wallet">
                        <IconButton
                          onClick={() => handleUpdateStatus(item?._id, 'whiteList')}
                          disabled={item?.walletStatus !== 'pending'}
                        >
                          <Iconify icon="quill:paper" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="BlackList Wallet">
                        <IconButton
                          onClick={() => handleUpdateStatus(item?._id, 'blackList')}
                          disabled={item?.walletStatus !== 'pending'}
                        >
                          <Iconify icon="material-symbols:block" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Card>

      <Card>
        <CardHeader title="Transactions" />

        <Stack
          sx={{
            px: 3,
          }}
        >
          <br />
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Table size={'medium'} sx={{ minWidth: 960 }}>
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
    </>
  );
}

LenderDetailsItems.propTypes = {
  status: PropTypes.string,
  statusOptions: PropTypes.array,
};
