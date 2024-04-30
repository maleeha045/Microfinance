import * as Yup from 'yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useAuthContext } from 'src/auth/hooks';

import { fData } from 'src/utils/format-number';

import { countries } from 'src/assets/data';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
} from 'src/components/hook-form';
import { ATTACHMENT_TOKEN, ATTACHMENT_URL, IM_HOST_API } from 'src/config-global';
import axiosInstance, { endpoints } from 'src/utils/axios';
import axios from 'axios';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();

  const { user, authenticated } = useAuthContext();

  const UpdateUserSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('First Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    photoURL: Yup.mixed().nullable(),
    phoneNumber: Yup.string().required('Phone number is required'),
    country: Yup.string().required('Country is required'),
    address: Yup.string(),
    state: Yup.string(),
    city: Yup.string().required('City is required'),
    zipCode: Yup.string(),
    about: Yup.string(),
    // not required
    isPublic: Yup.boolean(),
    cityListData: Yup.array(),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    photoURL: null,
    phoneNumber: '',
    country: '',
    address: '',
    state: '',
    city: '',
    zipCode: '',
    about: '',
    isPublic: false,
    //
    cityListData: [],
  };

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    watch,
    setValue,
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
      const country = countries.find((element) => element.label === lender?.country);
      // src={ATTACHMENT_URL + lender?.profilePicture[0]?.attachmentURL + ATTACHMENT_TOKEN}
      getCityList(country?.code);
      setValue('firstName', lender?.firstName);
      setValue('lastName', lender?.lastName);
      setValue('email', lender?.email);
      setValue('phoneNumber', lender?.mobileNumber);
      setValue('country', lender?.country);
      setValue('city', lender?.geoLocation?.city);
      if (lender?.profilePicture?.length > 0) {
        setValue(
          'photoURL',
          ATTACHMENT_URL + lender?.profilePicture[0]?.attachmentURL + ATTACHMENT_TOKEN
        );
      }
    } catch (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  };

  const getCityList = async (params) => {
    const data = {
      country: params,
    };

    try {
      const response = await axios.post(IM_HOST_API + endpoints.auth.getCity, data);
      setValue('cityListData', response?.data || []);
    } catch (error) {
      console.error(error);
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

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photoURL', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
            <RHFUploadAvatar
              name="photoURL"
              maxSize={3145728}
              onDrop={handleDrop}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />

            {/* <RHFSwitch
              name="isPublic"
              labelPlacement="start"
              label="Public Profile"
              sx={{ mt: 5 }}
            />

            <Button variant="soft" color="error" sx={{ mt: 3 }}>
              Delete User
            </Button> */}
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="email" label="Email Address" disabled />
              <RHFTextField name="phoneNumber" label="Phone Number" disabled />
              <RHFTextField name="firstName" label="First Name" />
              <RHFTextField name="lastName" label="Last Name" />
              {/* <RHFTextField name="address" label="Address" /> */}

              <RHFAutocomplete
                name="country"
                type="country"
                label="Country"
                placeholder="Choose a country"
                options={countries.map((option) => option.label)}
                getOptionLabel={(option) => option}
              />

              <RHFAutocomplete
                label="City"
                name="city"
                size="small"
                autoHighlight
                clearable
                options={values.cityListData?.map((option) => option?.name) || []}
                getOptionLabel={(option) => option}
                renderOption={(params, option) => (
                  <li {...params} key={option}>
                    {option}
                  </li>
                )}
              />

              {/* <RHFTextField name="state" label="State/Region" /> */}
              {/* <RHFTextField name="city" label="City" /> */}
              {/* <RHFTextField name="zipCode" label="Zip/Code" /> */}
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              {/* <RHFTextField name="about" multiline rows={4} label="About" /> */}

              <LoadingButton
                color="primary"
                type="submit"
                variant="contained"
                loading={isSubmitting}
                startIcon={<Iconify icon="material-symbols:save-outline" />}
              >
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
