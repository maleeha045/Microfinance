import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useEffect, useCallback, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import ButtonBase from '@mui/material/ButtonBase';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { _mock, _roles } from 'src/_mock';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFSelect, RHFUploadBox } from 'src/components/hook-form';
import { MenuItem } from '@mui/material';
import { ethers } from 'ethers';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { alpha } from '@mui/material/styles';
import { SMART_CON_ADDRESS, SMART_CON_URL, WALLET_KEY } from 'src/config-global';
import axios from 'axios';

// ----------------------------------------------------------------------

export default function DealNewEditForm({ currentJob }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const urlSearchParams = new URLSearchParams(window.location.search);

  const id = urlSearchParams.get('id');
  const edit = urlSearchParams.get('edit');

  const NewDealSchema = Yup.object().shape({
    loanAmount: Yup.number().min(1, 'Loan amount is required'),
    apyRate: Yup.number().min(1, 'interest is required'),
    rwa: Yup.number(),
    assetType: Yup.string(),
    settlementCycle: Yup.string(),
    minimumFinancingAmt: Yup.number().min(1, 'Amount not zero'),
    maximumFinancingAmt: Yup.number().min(1, 'Amount not zero'),
    earlyWithdrawFee: Yup.number().min(1, 'Amount not zero'),
    loanTenure: Yup.string().required('Tenure is required'),
    dealExpiresIn: Yup.string(),
    blockchainNetwork: Yup.string(),
    kyiLink: Yup.string().matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      'Enter correct url!'
    ),
    name: Yup.string(),
    summary: Yup.string(),
    websiteLink: Yup.string().matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      'Enter correct url!'
    ),
    linkedinLink: Yup.string().matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      'Enter correct url!'
    ),
    twitterLink: Yup.string().matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      'Enter correct url!'
    ),
    loanSummary: Yup.string(),
    logo: edit === 'true' ? Yup.object() : Yup.string(),
    underWName: Yup.string(),
    underWLink: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      loanAmount: 0,
      apyRate: 0,
      rwa: 1,
      assetType: 'Invoice Financing',
      loanTenure: '',
      dealExpiresIn: '',
      blockchainNetwork: 'Arbitrum Network',
      kyiLink: '',
      loanSummary: '',
      settlementCycle: 'End of loan term',
      minimumFinancingAmt: 0,
      maximumFinancingAmt: 0,
      earlyWithdrawFee: 0,
      name: '',
      summary: '',
      websiteLink: '',
      linkedinLink: '',
      twitterLink: '',
      logo: edit === 'true' ? {} : '',
      underWName: '',
      underWLink: '',
    }),
    [currentJob]
  );

  const methods = useForm({
    resolver: yupResolver(NewDealSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const [logoUpload, setLogoUpload] = useState('');

  // Define loading state for each button
  const [loading, setLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [financialDetail, setFinancialDetail] = useState(null);
  const [invoiceURI, setInvoiceURI] = useState('');

  useEffect(() => {
    if (currentJob) {
      reset(defaultValues);
    }
    if (edit) {
      getDeal();
    } else {
      getFinancialData();
    }
  }, [currentJob, defaultValues, reset]);

  const getDeal = async () => {
    setLoading(false);
    try {
      const response = await axiosInstance.get(`${endpoints.app.getDealById}/${id}`);
      const deal = response[0];
      setFinancialDetail(deal);
      setValue('loanAmount', deal?.overview?.loanAmount);
      setValue('apyRate', deal?.overview?.apyRate);
      setValue('rwa', deal?.overview?.rwa);
      setValue('loanSummary', deal?.overview?.loanSummary);
      setValue('assetType', deal?.overview?.assetType);
      setValue('settlementCycle', deal?.overview?.settlementCycle);
      setValue('minimumFinancingAmt', deal?.overview?.minimumFinancingAmt);
      setValue('maximumFinancingAmt', deal?.overview?.maximumFinancingAmt);
      setValue('earlyWithdrawFee', deal?.overview?.earlyWithdrawFee);
      setValue('loanTenure', deal?.overview?.loanTenure);
      setValue('dealExpiresIn', deal?.overview?.dealExpiresIn);
      setValue('blockchainNetwork', deal?.overview?.blockchainNetwork);
      setValue('name', deal?.borrower?.name);
      setValue('summary', deal?.borrower?.summary);
      setValue('websiteLink', deal?.borrower?.websiteLink);
      setValue('linkedinLink', deal?.borrower?.linkedinLink);
      setValue('twitterLink', deal?.borrower?.twitterLink);
      setValue('underWName', deal?.underwriter?.underWName);
      setValue('underWLink', deal?.underwriter?.underWLink);
      setValue('kyiLink', deal?.riskMitigation?.kyiLink);
      if (deal?.borrower?.logo.length > 0) {
        let file = {
          attachmentTitle: deal?.borrower?.logo[0]?.attachmentTitle,
          base64: deal?.borrower?.logo[0]?.attachmentPath,
          name: deal?.borrower?.logo[0]?.attachmentTitle,
          type: deal?.borrower?.logo[0]?.type,
        };
        setValue('logo', file);
        setLogoUpload(file);
      }
    } catch (error) {
      enqueueSnackbar(error, { variant: 'error' });
      setLoading(false);
    }
  };

  const getFinancialData = async () => {
    setLoading(false);
    try {
      const response = await axiosInstance.get(`${endpoints.app.getBorrowerById}/${id}`);
      setFinancialDetail(response);
      setValue('loanAmount', response?.principal);
      setValue('name', response?.fullName);
      // setValue()
    } catch (error) {
      enqueueSnackbar(error, { variant: 'error' });
      setLoading(false);
    }
  };

  const handleDrop = (acceptedFiles, name) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = () => {
      const dataURL = reader.result; // The base64 encoded image

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
        dataURL, // Add the base64 encoded image to the newFile object
      });

      if (file) {
        setValue(name, newFile, { shouldValidate: true });
        setLogoUpload({
          attachmentTitle: file?.name,
          base64: file?.dataURL,
          name: file?.name,
          type: file?.type,
        });
      }
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (name) => {
    setValue('logo', '', { shouldValidate: true });
    setLogoUpload('');
  };

  const dealStatusChange = async () => {
    const walletPrivateKey = WALLET_KEY;
    const lendingBorrowingAddress = SMART_CON_ADDRESS; // Replace with your contract address
    // Create ethers wallet instance using private key
    const wallet = new ethers.Wallet(walletPrivateKey);

    // Create provider
    const provider = new ethers.providers.JsonRpcProvider(SMART_CON_URL);

    // Use wallet to connect to provider
    const deployer = wallet.connect(provider);
    const borrower = financialDetail?.wallets[0]?.walletAddress;

    const lendingBorrowing = new ethers.Contract(
      lendingBorrowingAddress,
      _mock.lendingBorrowingABI,
      deployer
    );
    await lendingBorrowing.connect(deployer).setBorrowerStatus(borrower, 1);
  };

  const convertDaysToMonths = (daysString) => {
    const daysNumber = parseInt(daysString.split(' ')[0]); // Extracting the number of days from the string
    return Math.floor(daysNumber / 30); // Assuming a month has 30 days
  };

  const getInvoiceURI = async (data) => {
    try {
      let payload = {
        InvoiceId: financialDetail?.invoiceId, // inv,
        MongoId: financialDetail?.invoiceMongoId, // inv mongo id,
        FinanceId: financialDetail?.financeId, // finance id,
        Type: 'invoiceFinance', // string finance,
      };
      const res = await axios.post(`https://betapbc.invoicemate.net/ipfs-api/upload`, payload);
      setInvoiceURI(res?.data?.cid?.IpfsHash);
    } catch (error) {
      enqueueSnackbar(error, {
        variant: 'error',
      });
    }
  };

  // FOR SMART CONTRACT FUNCTION CALLING
  const storeBorrowerDetails = async (data) => {
    await getInvoiceURI(data);
    const walletPrivateKey = WALLET_KEY;
    const lendingBorrowingAddress = SMART_CON_ADDRESS; // Replace with your contract address
    // Create ethers wallet instance using private key
    const wallet = new ethers.Wallet(walletPrivateKey);

    // Create provider
    const provider = new ethers.providers.JsonRpcProvider(SMART_CON_URL);

    // Use wallet to connect to provider
    const deployer = wallet.connect(provider);
    const borrower = financialDetail?.wallets[0]?.walletAddress;

    const lendingBorrowing = new ethers.Contract(
      lendingBorrowingAddress,
      _mock.lendingBorrowingABI,
      deployer
    );
    await lendingBorrowing.connect(deployer).storeBorrowerDetails(
      borrower,
      Number(data?.loanAmount), // principle
      convertDaysToMonths(data?.loanTenure), //loan term months
      invoiceURI
    );
    // const result = await lendingBorrowing.getBorrowerDetails(Number(financialDetail?._id));
    // console.log(result.id.toNumber());
    // console.log(result.principal.toNumber());
  };

  const onSubmit = handleSubmit(async (data, event) => {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Check which button was clicked based on its name or value
    const buttonClicked = event.nativeEvent.submitter;

    // Perform different actions based on the clicked button
    if (buttonClicked && buttonClicked.name === 'saveDraft') {
      try {
        setIsSavingDraft(true);
        let payload = {
          ...data,
          logo: logoUpload ? [logoUpload] : [],
          status: 'draft',
          borrowerID: financialDetail?._id,
        };
        await axiosInstance.post(endpoints.app.createDeal, payload);
        enqueueSnackbar('Deal Save Draft Successfully');
        setIsSavingDraft(false);
        router.push(paths.dashboard.marketPlace.marketPlaceList);
      } catch (error) {
        setIsSavingDraft(false);
        enqueueSnackbar(error, {
          variant: 'error',
        });
      }
    } else if (buttonClicked && buttonClicked.name === 'createPool') {
      try {
        setIsCreatingPool(true);
        let payload = {
          ...data,
          _id: id || '',
          logo: logoUpload ? [logoUpload] : [],
          status: 'tokenized',
          borrowerID: financialDetail?._id,
        };
        if (edit !== 'true') {
          await storeBorrowerDetails(data);
          await dealStatusChange();
        }
        await axiosInstance.post(
          edit !== 'true' ? endpoints.app.createDeal : endpoints.app.updateDeal,
          payload
        );
        setIsCreatingPool(false);
        enqueueSnackbar('Deal Created Successfully');
        router.push(paths.dashboard.marketPlace.marketPlaceList);
      } catch (error) {
        setIsCreatingPool(false);
        enqueueSnackbar(error, {
          variant: 'error',
        });
      }
    }
  });

  const renderOverView = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Overview
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Loan Amount, APY, Tenure...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Overview" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="loanAmount" label="Loan Amount" type="number" />
              <RHFTextField name="apyRate" label="APY Rate %" type="number" />
              <RHFTextField disabled name="rwa" label="RWA" type="number" />
              {/* <RHFTextField name="interest" label="Markup" type="number" /> */}
              {/* <RHFTextField name="total" label="Total" type="number" /> */}
              {/* <RHFTextField name="totalPoolAsset" label="Total Pool Asset" type="number" /> */}
              <RHFSelect name="loanTenure" label="Loan Tenure">
                {['15 Days', '30 Days', '45 Days', '60 Days', '75 Days', '90 Days', '120 Days'].map(
                  (deal) => (
                    <MenuItem value={deal} key={deal}>
                      {deal}
                    </MenuItem>
                  )
                )}
              </RHFSelect>
              <RHFSelect name="settlementCycle" label="Settlement cycle">
                {['End of loan term'].map((deal) => (
                  <MenuItem value={deal} key={deal}>
                    {deal}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect name="dealExpiresIn" label="Deal Expires In">
                {['5 Days', '10 Days', '15 Days', '20 Days', '25 Days', '30 Days'].map((deal) => (
                  <MenuItem value={deal} key={deal}>
                    {deal}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField type="number" name="minimumFinancingAmt" label="Financing Amt. (Min)" />
              <RHFTextField type="number" name="maximumFinancingAmt" label="Financing Amt. (Max)" />
              <RHFTextField type="number" name="earlyWithdrawFee" label="Early Withdraw Fee" />
              <RHFTextField disabled name="assetType" label="Asset Type" />
              <RHFTextField disabled name="blockchainNetwork" label="Blockchain Network" />
            </Box>
            <RHFTextField
              name="loanSummary"
              label="Loan Summary"
              multiline
              rows={4}
              inputProps={{ maxLength: 500 }}
              InputProps={{
                endAdornment: (
                  <div
                    style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.54)', alignSelf: 'end' }}
                  >
                    {values.loanSummary.length}/{500}
                  </div>
                ),
              }}
            />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderHighLights = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            HighLights
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Additional details...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="HighLights" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="highLights" label="HighLights" multiline rows={4} />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderAnalysis = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Analysis
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Credit expert information...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Analysis" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="name" label="Name" />
            <RHFTextField name="summary" label="Summary of credit expert" multiline rows={4} />
            <RHFTextField name="details" label="Review about borrower" multiline rows={4} />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderRepayment = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Repayments
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Loan terms, term start date...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Repayments" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="loanTerms" label="Loan Terms" />
            <RHFTextField
              name="loanStartDate"
              label="Loan Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            {/* <RHFTextField
              name="loanMaturityDate"
              label="Loan Maturity Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            /> */}
            <RHFTextField name="repaymentStructure" label="Payment Frequency" />
            <RHFTextField name="totalPayments" label="Total Payments" />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderBorrower = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Borrower
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Borrower information...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Borrower" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="name" label="Name" />
            <RHFTextField name="summary" label="Summary" multiline rows={4} />
            <RHFTextField name="websiteLink" label="Website Link" />
            <RHFTextField name="linkedinLink" label="LinkedIn Link" />
            <RHFTextField name="twitterLink" label="Twitter Link" />
            <Stack flexDirection="column" spacing={2}>
              <small>Upload Logo</small>
              <Stack flexDirection="row" spacing={2}>
                <RHFUploadBox
                  name="logo"
                  maxSize={3145728}
                  onDrop={(file) => handleDrop(file, 'logo')}
                  onDelete={() => handleRemoveFile('logo')}
                />
                {values.logo && (
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
                    <Typography>{values?.logo?.name?.substring(0, 10)}</Typography>
                    <Typography variant="caption">{values?.logo?.type}</Typography>
                    <Box sx={{ justifyContent: 'space-between' }}>
                      <IconButton>
                        <Iconify
                          sx={{ color: 'error.main' }}
                          icon="solar:trash-bin-trash-bold"
                          onClick={() => handleRemoveFile('logo')}
                          width={18}
                        />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderRiskMitigation = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Risk Mitigation
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            KYI Link...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Risk Mitigation" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField
              name="kyiLink"
              label="KYI Link"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => window.open(`https://${values.KYILink}`)} edge="end">
                      <Iconify icon="bi:browser-edge" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderUnderWriter = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Underwriter
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Name, link...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Underwriter" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="underWName" label="Name" />
            <RHFTextField name="underWLink" label="Website Link" />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
        {/* <FormControlLabel
          control={<Switch defaultChecked />}
          label="Publish"
          sx={{ flexGrow: 1, pl: 3 }}
        /> */}
        <LoadingButton
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          loading={isSavingDraft}
          sx={{ ml: 2 }}
          name="saveDraft"
        >
          Save As Draft
        </LoadingButton>

        <LoadingButton
          type="submit"
          variant="contained"
          color="secondary"
          size="large"
          loading={isCreatingPool}
          sx={{ ml: 2 }}
          name="createPool"
        >
          Create Pool
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderOverView}

        {/* {renderHighLights} */}

        {/* {renderAnalysis} */}

        {/* {renderRepayment} */}

        {renderBorrower}

        {renderUnderWriter}

        {renderRiskMitigation}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}

DealNewEditForm.propTypes = {
  currentJob: PropTypes.object,
};
