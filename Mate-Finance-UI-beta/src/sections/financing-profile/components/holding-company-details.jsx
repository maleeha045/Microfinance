import {
  Card,
  CardContent,
  Grid,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';
import Iconify from 'src/components/iconify/iconify';

const listItemStyle = {
  display: 'flex',
};

const listItemAvatarStyle = {
  justifyContent: 'center',
};

const iconStyle = {
  color: '#5A2C66',
  fontSize: '42px',
};

function HoldingCompanyDetails({ user }) {
  return (
    <Card sx={{ p: 3, mt: 1 }}>
      <CardContent>
        <Typography
          variant="h5"
          color="secondary"
          component="h3"
          sx={{ fontWeight: 750, textAlign: 'left', width: 'fit-content' }}
        >
          Holding Company Details
        </Typography>
      </CardContent>
      <Grid container spacing={2}>
        {user?.userFinance?.holdingCompanyDetails?.companyName === '' ? (
          ''
        ) : (
          <Grid item sm={12} md={4} lg={4}>
            <ListItem sx={listItemStyle}>
              <ListItemAvatar sx={listItemAvatarStyle}>
                <Iconify icon="mdi:company" sx={iconStyle} width={45} />
              </ListItemAvatar>
              <ListItemText
                primary={<Typography sx={{ fontWeight: 600 }}>Company Name</Typography>}
                secondary={
                  <Typography sx={{ fontWeight: 500 }}>
                    {user?.userFinance?.holdingCompanyDetails?.companyName || ''}
                  </Typography>
                }
              />
            </ListItem>
          </Grid>
        )}
        {user?.userFinance?.holdingCompanyDetails?.businessActivity === '' ? (
          ''
        ) : (
          <Grid item sm={12} md={4} lg={4}>
            <ListItem sx={listItemStyle}>
              <ListItemAvatar sx={listItemAvatarStyle}>
                <Iconify
                  icon="material-symbols:business-center-outline"
                  sx={iconStyle}
                  width={40}
                />
              </ListItemAvatar>
              <ListItemText
                primary={<Typography sx={{ fontWeight: 600 }}>Business Activity</Typography>}
                secondary={
                  <Typography sx={{ fontWeight: 500 }}>
                    {user?.userFinance?.holdingCompanyDetails?.businessActivity || ''}
                  </Typography>
                }
              />
            </ListItem>
          </Grid>
        )}
        {user?.userFinance?.holdingCompanyDetails?.registeredAddress === '' ? (
          ''
        ) : (
          <Grid item sm={12} md={4} lg={4}>
            <ListItem sx={listItemStyle}>
              <ListItemAvatar sx={listItemAvatarStyle}>
                <Iconify icon="healthicons:city" sx={iconStyle} width={50} />
              </ListItemAvatar>
              <ListItemText
                primary={<Typography sx={{ fontWeight: 600 }}>Registered Address</Typography>}
                secondary={
                  <Typography sx={{ fontWeight: 500 }}>
                    {(user?.userFinance?.keyPerson2 &&
                      user?.userFinance?.holdingCompanyDetails?.registeredAddress) ||
                      ''}
                  </Typography>
                }
              />
            </ListItem>
          </Grid>
        )}

        {user?.userFinance?.holdingCompanyDetails?.tradingName === '' ? (
          ''
        ) : (
          <Grid item sm={12} md={4} lg={4}>
            <ListItem sx={listItemStyle}>
              <ListItemAvatar sx={listItemAvatarStyle}>
                <Iconify icon="game-icons:trade" sx={iconStyle} width={43} />
              </ListItemAvatar>
              <ListItemText
                primary={<Typography sx={{ fontWeight: 600 }}>Trading Name</Typography>}
                secondary={
                  <Typography sx={{ fontWeight: 500 }}>
                    {user?.userFinance?.holdingCompanyDetails?.tradingName || ''}
                  </Typography>
                }
              />
            </ListItem>
          </Grid>
        )}
        {user?.userFinance?.holdingCompanyDetails?.website === '' ? (
          ''
        ) : (
          <Grid item sm={12} md={4} lg={4}>
            <ListItem sx={listItemStyle}>
              <ListItemAvatar sx={listItemAvatarStyle}>
                <Iconify icon="fluent-mdl2:website" sx={iconStyle} width={40} />
              </ListItemAvatar>
              <ListItemText
                primary={<Typography sx={{ fontWeight: 600 }}>Website</Typography>}
                secondary={
                  <Typography sx={{ fontWeight: 500 }}>
                    {user?.userFinance?.holdingCompanyDetails?.website || ''}
                  </Typography>
                }
              />
            </ListItem>
          </Grid>
        )}
      </Grid>
    </Card>
  );
}

export default HoldingCompanyDetails;
