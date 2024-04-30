import { Button, Container } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import FinanceDetailsList from '../finance-details-list';
import { useRouter } from 'src/routes/hooks';

const FinanceDetailsView = () => {
  const router = useRouter();

  return (
    <Container maxWidth="xxl">
      <CustomBreadcrumbs
        heading="Finance Details"
        subHeading=""
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          // {
          //   name: 'Borrowers',
          //   href: paths.dashboard.borrower.borrowerList,
          // },
          {
            name: 'Finance Details',
            // href: paths.dashboard.invoice.root,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
        action={
          <Button variant="contained" color="primary" onClick={() => router.back(-1)}>
            Back
          </Button>
        }
      />
      <FinanceDetailsList />
    </Container>
  );
};

export default FinanceDetailsView;
