import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useResponsive } from 'src/hooks/use-responsive';

import { fDate } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';

import Label from 'src/components/label';
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import TextMaxLine from 'src/components/text-max-line';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Divider } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { bgGradient } from 'src/theme/css';
import { ATTACHMENT_TOKEN, ATTACHMENT_URL } from 'src/config-global';

// ----------------------------------------------------------------------

export default function MarketPlaceItemHorizontal({ post, tab }) {
  const theme = useTheme();

  const popover = usePopover();

  const router = useRouter();

  const smUp = useResponsive('up', 'sm');

  const {
    borrower,
    closed,
    createdAt,
    financeRequest,
    lending,
    overview,
    repayment,
    riskMitigation,
    tokenized,
    status,
  } = post;

  return (
    <>
      <Stack
        component={Card}
        direction="row"
        justifyContent="space-between"
        sx={{
          ...bgGradient({
            direction: '135deg',
            startColor: alpha(theme.palette.primary.light, 0.2),
            endColor: alpha(theme.palette.primary.main, 0.2),
          }),
          height: { md: 1 },
          borderRadius: 2,
          position: 'relative',
          color: 'primary.darker',
          backgroundColor: 'common.white',
        }}
      >
        <Stack
          sx={{
            p: (theme) => theme.spacing(3, 3, 2, 3),
            width: '100%',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Label variant="soft" color={'default'}>
              {/* row.workFlowStatus[row.workFlowStatus.status]?.reviewedBy */}
              {status?.toUpperCase()}
            </Label>

            <Box component="span" sx={{ typography: 'caption', color: 'text.disabled' }}>
              {fDate(createdAt)}
            </Box>
          </Stack>

          <Stack spacing={1}>
            <Box
              display="grid"
              alignItems="center"
              justifyContent="space-between"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <Link
                color="inherit"
                component={RouterLink}
                href={paths.dashboard.marketPlace.details(post?._id)}
              >
                <TextMaxLine variant="subtitle2">{borrower?.name}</TextMaxLine>
              </Link>
              <Stack direction="column" alignItems="flex-end">
                <TextMaxLine variant="h6" align="center">
                  {borrower?.apyRate}
                </TextMaxLine>
                <TextMaxLine variant="caption">AYP Rate</TextMaxLine>
              </Stack>
            </Box>
            <Divider />
            <Box
              display="grid"
              alignItems="center"
              justifyContent="space-between"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <Stack direction="column" alignItems="flex-start">
                <TextMaxLine variant="subtitle2" align="center">
                  USD {overview?.loanAmount}
                </TextMaxLine>
                <TextMaxLine variant="caption">Loan Amount</TextMaxLine>
              </Stack>

              <Stack direction="column" alignItems="flex-end">
                <TextMaxLine variant="subtitle2" align="center">
                  {overview?.rwa}
                </TextMaxLine>
                <TextMaxLine variant="caption">RWA</TextMaxLine>
              </Stack>
            </Box>
            {/* <TextMaxLine variant="body2" sx={{ color: 'text.secondary' }}>
              {description}
            </TextMaxLine> */}
          </Stack>
          <Divider sx={{ mt: 3, mb: 2 }} />
          <Stack spacing={1}>
            <Box
              display="grid"
              alignItems="center"
              justifyContent="space-between"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <Stack direction="column">
                <TextMaxLine variant="subtitle2">Expires In</TextMaxLine>
                <TextMaxLine variant="caption">{overview?.dealExpiresIn}</TextMaxLine>
              </Stack>

              <Stack direction="column" alignItems="flex-end">
                <TextMaxLine variant="subtitle2">{overview?.loanTenure}</TextMaxLine>
                <TextMaxLine variant="caption">Tenure</TextMaxLine>
              </Stack>
              {status === 'draft' && (
                <Stack direction="column" alignItems="flex-start">
                  <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
                    <Iconify icon="eva:more-horizontal-fill" />
                  </IconButton>
                </Stack>
              )}
            </Box>
          </Stack>
        </Stack>

        {smUp && (
          <Box
            sx={{
              width: borrower?.logo[0]?.attachmentPath ? 180 : 200,
              height: 240,
              position: 'relative',
              flexShrink: 0,
              p: 1,
            }}
          >
            <Image
              alt={borrower?.name}
              src={
                borrower?.logo[0]?.attachmentPath
                  ? ATTACHMENT_URL + borrower?.logo[0]?.attachmentPath + ATTACHMENT_TOKEN
                  : '/logo/mate.finance_verti.png'
              }
              sx={{ height: 1, borderRadius: 1.5 }}
            />
          </Box>
        )}
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="bottom-center"
        sx={{ width: 140 }}
      >
        {/* <MenuItem
          onClick={() => {
            popover.onClose();
            router.push(paths.dashboard.post.details(title));
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem> */}

        <MenuItem
          onClick={() => {
            popover.onClose();
            router.push(
              `${paths.dashboard.marketPlace.createMarketPlace}?edit=${true}&id=${post?._id}`
            );
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        {/* <MenuItem
          onClick={() => {
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem> */}
      </CustomPopover>
    </>
  );
}

MarketPlaceItemHorizontal.propTypes = {
  post: PropTypes.shape({
    author: PropTypes.object,
    coverUrl: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    description: PropTypes.string,
    publish: PropTypes.string,
    title: PropTypes.string,
    totalComments: PropTypes.number,
    totalShares: PropTypes.number,
    totalViews: PropTypes.number,
  }),
};
