import { Box, Button, Drawer, IconButton, Typography } from '@mui/material';
// @mui
// components
import Iconify from 'src/components/iconify/iconify';
import Scrollbar from 'src/components/scrollbar';
import ViewAttachments from 'src/components/view-attachment/index';

import { LoadingButton } from '@mui/lab';
import { Stack, alpha } from '@mui/system';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { UploadBox } from 'src/components/upload';
import axios, { endpoints } from 'src/utils/axios';

export default function Filer({ filer }) {
  const {
    auth: { userAttachments },
    user: {
      userFinance: { filerDetial, creditScore },
    },
  } = useSelector((state) => state);
  const [File, setFile] = useState();
  // ------------------------------------

  const handleDropSingleFile = useCallback(async (acceptedFiles) => {
    console.log('🚀 ~ Filer ~ userAttachments:', userAttachments);
    const filerDetail = await getBase64(acceptedFiles[0]);

    if (filerDetail) {
      setFile(filerDetail);
    }
  }, []);

  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  const [viewFile, setviewFile] = useState('');
  const viewAttachment = (file) => {
    setviewFile(true);
  };

  const closeAttViewModal = () => {
    setviewFile(false);
  };

  const handleUpload = async () => {
    try {
      const filerDetail = File;
      const res = await axios.post(endpoints.finance.filer, { filerDetial: filerDetail });
      filer.onFalse();
      setFile(null);
      enqueueSnackbar('Filer Uploaded');
    } catch (error) {
      enqueueSnackbar(error.toString(), { variant: 'error' });
    }
  };

  //
  return (
    <div>
      <Drawer
        open={filer.value}
        onClose={filer.onFalse}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: { xs: 400, sm: 500 } },
        }}
      >
        <Scrollbar>
          <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 10 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Filer
              </Typography>
              <IconButton onClick={filer.onFalse}>
                <Iconify icon="mingcute:close-line" />
              </IconButton>
            </Box>
          </Stack>
          <UploadBox
            accept={{
              'application/pdf': ['.pdf'],
              'image/*': [],
            }}
            sx={{
              mt: 1,
              py: 2.5,
              height: '150px',
              borderRadius: 1.5,
            }}
            placeholder={
              <Stack spacing={0.5} alignItems="center" sx={{ color: 'text.disabled' }}>
                <Iconify icon="eva:cloud-upload-fill" width={40} />
                <Typography variant="body2">Upload Attachments</Typography>
              </Stack>
            }
            onDrop={handleDropSingleFile}
          />

          {(File || filerDetial) && (
            <Box
              sx={{
                m: 0.5,
                width: 1,
                height: 100,
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

              <Box sx={{ justifyContent: 'space-between' }}>
                <IconButton onClick={() => viewAttachment()}>
                  <Iconify icon="carbon:view-filled" width={18} />
                </IconButton>
              </Box>
            </Box>
          )}
        </Scrollbar>
        <ViewAttachments
          open={viewFile}
          setOpen={closeAttViewModal}
          attachment={{
            data: File || `${userAttachments.url}${filerDetial}${userAttachments.token}`,
          }}
        />
        <Box
          className="drawer_bottom_glow_box"
          sx={{
            py: 1,
            px: 3,
          }}
        >
          <LoadingButton
            sx={{ mx: 1 }}
            size="medium"
            color="primary"
            variant="contained"
            type="submit"
            // loading={requestLoding.value}
            disabled={filerDetial && creditScore?.filer?.action !== 'Correction'}
            onClick={handleUpload}
          >
            Save
          </LoadingButton>
          <Button variant="outlined" size="medium" color="error" onClick={filer.onFalse}>
            Cancel
          </Button>
        </Box>
      </Drawer>
    </div>
  );
}
