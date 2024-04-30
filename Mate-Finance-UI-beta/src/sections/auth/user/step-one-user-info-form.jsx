import * as Yup from 'yup';
import { useCallback, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

// routes

// assets
import { PasswordIcon } from 'src/assets/icons';
// components
import Iconify from 'src/components/iconify';
import FormProvider, {
  RHFTextField,
  RHFUpload,
  RHFUploadAvatar,
  RHFUploadBox,
} from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';

// utils
import axios, { endpoints } from 'src/utils/axios';
import { noWhiteSpaces } from 'src/utils/yup-validate';
import { fData } from 'src/utils/format-number';

// third party
import ValidPhoneInput from '../../../components/phone-number-input';
import { IconButton } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import { useAccount } from 'wagmi';
import { useWalletInfo } from '@web3modal/wagmi/react';
// ----------------------------------------------------------------------

const StepOneUserInfoForm = (props) => {
  // props
  const { userInfoData, getUserInfo, router } = props;

  // hook
  const { enqueueSnackbar } = useSnackbar();

  const { user, logout } = useAuthContext();

  const { address, isConnecting, isDisconnected } = useAccount();

  const { walletInfo } = useWalletInfo();

  // state

  // yup validation
  const UpdateUserSchema = Yup.object().shape({
    photoURL: Yup.mixed(),
    identityDoc: Yup.mixed().required('Required'),
    metamaskWallet: Yup.string(),
    additionalDocument: Yup.mixed(),
  });

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues: {
      photoURL: userInfoData.profileImg || '',
      identityDoc: '',
      metamaskWallet: '',
      additionalDocument: '',
    },
  });

  const {
    control,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const { photoURL, identityDoc, metamaskWallet, additionalDocument } = watch();

  useEffect(() => {
    reset({
      photoURL: '',
      identityDoc: '',
      metamaskWallet: '',
      additionalDocument: '',
    });
  }, []);

  const onSubmit = useCallback(
    async (data) => {
      if (!address) {
        enqueueSnackbar('Please Connect Your Wallet', { variant: 'info' });
        return;
      }
      const obj = {
        walletName: walletInfo?.name || '',
        walletIcon: walletInfo?.icon || '',
        walletAddress: address,
        additionalDocument: data?.additionalDocument
          ? [
              {
                attachmentTitle: data?.additionalDocument?.name,
                type: data?.additionalDocument?.type,
                name: data?.additionalDocument?.name,
                base64: data?.additionalDocument?.dataURL,
              },
            ]
          : [],
        identityDoc: [
          {
            attachmentTitle: data?.identityDoc?.name,
            type: data?.identityDoc?.type,
            name: data?.identityDoc?.name,
            base64: data?.identityDoc?.dataURL,
          },
        ],
        profilePicture: data?.photoURL
          ? [
              {
                attachmentTitle: data?.photoURL?.name,
                type: data?.photoURL?.type,
                name: data?.photoURL?.name,
                base64: data?.photoURL?.dataURL,
              },
            ]
          : [],
      };
      try {
        const response = await axios.post(endpoints.app.onBoarding, obj);
        await logout();
        enqueueSnackbar('Details Submit Successfully. Please login to use the system!');
        router.replace('/');
      } catch (error) {
        enqueueSnackbar(error, {
          variant: 'error',
        });
      }
    },
    [reset]
  );

  // Api action || upload user profile onChange image
  const uploadProfileImg = async (image) => {
    const obj = {
      profileImg: image,
    };
    try {
      const response = await axios.post(endpoints.auth.userProfileImg, obj);

      enqueueSnackbar('Image Uploaded Successfully', {
        variant: 'success',
      });
    } catch (error) {
      enqueueSnackbar(error, {
        variant: 'error',
      });
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles, name) => {
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
        }
      };

      reader.readAsDataURL(file);
    },
    [setValue]
  );
  const handleRemoveFile = useCallback(
    (name) => {
      reset({
        name,
      });
    },
    [setValue]
  );

  // form reset from api result
  useEffect(() => {
    // Update default values when userInfoData changes
    if (userInfoData) {
      methods.reset({
        firstName: userInfoData.firstName || '',
        lastName: userInfoData.lastName || '',
        email: userInfoData.email || '',
        phoneNumber: userInfoData?.mobileNumber || '',
        photoURL: userInfoData.profileImg || '',
      });
    }
  }, [userInfoData, methods.reset]);

  // for every time i want updated data for certain changes
  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.0}>
        <Box sx={{ mb: 2, width: { md: 250 } }}>
          <RHFUploadAvatar
            name="photoURL"
            maxSize={3145728}
            onDrop={(file) => handleDrop(file, 'photoURL')}
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
        </Box>
        <Stack direction="column" spacing={2} width="-webkit-fill-available">
          <w3m-button />
          {/* <RHFTextField
            name="metamaskWallet"
            label="Meta Mask Wallet"
            size="small"
            InputLabelProps={{ shrink: true }}
          /> */}
          <Stack direction="column" alignItems="flex-start">
            <Typography variant="subtitle2">National ID/Passport/Driver's License</Typography>
            {identityDoc === '' ||
              (!identityDoc && (
                <RHFUploadBox
                  name="identityDoc"
                  maxSize={3145728}
                  onDrop={(file) => handleDrop(file, 'identityDoc')}
                  onDelete={() => handleRemoveFile('identityDoc')}
                />
              ))}
            {identityDoc?.dataURL && (
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
                <Typography>{identityDoc?.name?.substring(0, 10)}</Typography>
                <Typography variant="caption">{identityDoc?.type}</Typography>
                <Box sx={{ justifyContent: 'space-between' }}>
                  <IconButton>
                    <Iconify
                      sx={{ color: 'error.main' }}
                      icon="solar:trash-bin-trash-bold"
                      onClick={() => handleRemoveFile('identityDoc')}
                      width={18}
                    />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Stack>
          <Stack direction="column" alignItems="flex-start">
            <Typography variant="subtitle2">Additional Document</Typography>
            {additionalDocument === '' ||
              (!additionalDocument && (
                <RHFUploadBox
                  name="additionalDocument"
                  maxSize={3145728}
                  onDrop={(file) => handleDrop(file, 'additionalDocument')}
                  onDelete={() => handleRemoveFile('additionalDocument')}
                />
              ))}
            {additionalDocument?.dataURL && (
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
                <Typography>{identityDoc?.name?.substring(0, 10)}</Typography>
                <Typography variant="caption">{identityDoc?.type}</Typography>
                <Box sx={{ justifyContent: 'space-between' }}>
                  <IconButton>
                    <Iconify
                      sx={{ color: 'error.main' }}
                      icon="solar:trash-bin-trash-bold"
                      onClick={() => handleRemoveFile('identityDoc')}
                      width={18}
                    />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Stack>
          <Stack>
            <LoadingButton
              color="primary"
              size="medium"
              type="submit"
              variant="contained"
              loading={isSubmitting}
              startIcon={<Iconify icon="material-symbols:save-outline" />}
            >
              Submit
            </LoadingButton>
          </Stack>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

export default StepOneUserInfoForm;
