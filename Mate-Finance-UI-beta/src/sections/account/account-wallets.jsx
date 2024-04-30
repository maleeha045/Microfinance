import { useForm, Controller } from 'react-hook-form';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import ListItemText from '@mui/material/ListItemText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Avatar from '@mui/material/Avatar';

import FormProvider from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import Label from 'src/components/label';

import { useEffect, useState } from 'react';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { TableNoData } from 'src/components/table';

// ----------------------------------------------------------------------

const NOTIFICATIONS = [
  {
    subheader: 'Activity',
    caption: 'Donec mi odio, faucibus at, scelerisque quis',
    items: [
      {
        id: 'activity_comments',
        label: 'Email me when someone comments onmy article',
      },
      {
        id: 'activity_answers',
        label: 'Email me when someone answers on my form',
      },
      { id: 'activityFollows', label: 'Email me hen someone follows me' },
    ],
  },
  {
    subheader: 'Application',
    caption: 'Donec mi odio, faucibus at, scelerisque quis',
    items: [
      { id: 'application_news', label: 'News and announcements' },
      { id: 'application_product', label: 'Weekly product updates' },
      { id: 'application_blog', label: 'Weekly blog digest' },
    ],
  },
];

// ----------------------------------------------------------------------

export default function AccountWallets() {
  const { enqueueSnackbar } = useSnackbar();

  const { user, logout } = useAuthContext();

  const [lender, setLenderDetails] = useState(null);

  const methods = useForm({
    defaultValues: {
      selected: ['activity_comments', 'application_product'],
    },
  });

  const {
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    getLenderDetails();
  }, []);

  const getLenderDetails = async () => {
    try {
      const response = await axiosInstance.get(`${endpoints.app.getLenderById}?id=${user?.id}`);
      let lender = response?.lender[0];
      setLenderDetails(lender);
    } catch (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      enqueueSnackbar('Update success!');
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const getSelected = (selectedItems, item) =>
    selectedItems.includes(item)
      ? selectedItems.filter((value) => value !== item)
      : [...selectedItems, item];

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Card>
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
                  </TableRow>
                ))}
                {lender?.wallet?.length === 0 && <TableNoData notFound={true} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Card>
    </FormProvider>
  );
}
