import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import DealNewEditForm from '../market-palce-new-edit-form';

// ----------------------------------------------------------------------

export default function MarketPlaceCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Deal"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Deals',
            href: paths.dashboard.marketPlace.marketPlaceList,
          },
          { name: 'New Deal' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <DealNewEditForm />
    </Container>
  );
}
