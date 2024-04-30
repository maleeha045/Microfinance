import { Avatar, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';
// import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import Label from 'src/components/label';

import { useLocales } from 'src/locales';
// import { lang } from 'src/locales/multiLang';
import { fCurrency, fNumber } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';

export default function RequestOverview({ invoiceData }) {
  // const { userAttachments } = useSelector((state) => state.auth);
  const Currency = (amount, currency) => {
    return `${currency} ${fCurrency(amount)} `;
  };
  const { t } = useLocales();
  const navigate = useNavigate();
  return (
    <Grid container>
      <Grid item xs={6}>
        <List>
          <ListItem>
            <ListItemText
              // onClick={() => navigate(`/admin/subscribers/invoices/${invoiceData?._id}`)}
              primary="Invoice Id"
              secondary={
                <Typography sx={{ cursor: 'pointer', color: 'purple' }}>
                  {invoiceData?.invoiceId || 'BIL-1'}
                </Typography>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={'Invoice Amount'}
              secondary={Currency(
                invoiceData?.netAmt || 10000,
                invoiceData?.currency?.code || 'USD'
              )}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={'Finance Amount'}
              //
              secondary={Currency(
                invoiceData?.invoiceFinanceObj?.requestAmount || 5000,
                invoiceData?.currency?.code || 'USD'
              )}
            />
          </ListItem>
        </List>
      </Grid>

      {/* @  Second Grid */}
      <Grid item xs={6}>
        <List>
          <ListItem>
            <ListItemText
              primary={'Status'}
              secondary={<Label color="primary">{'Inprogress'}</Label>}
            />
          </ListItem>
        </List>
      </Grid>
    </Grid>
  );
}
