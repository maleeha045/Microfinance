/* eslint-disable no-unused-vars */
import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

// routes
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

//
import StepOneUserInfoForm from './step-one-user-info-form';

const NewUserInfoStepper = (props) => {
  // ----------------------------------------------------------------------

  const steps = ['Please complete following required information to complete the profile'];

  // ----------------------------------------------------------------------

  // props
  const { userInfoData, getUserInfo } = props;

  // hooks
  const router = useRouter();

  // state
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState();

  // actions || store

  const isStepSkipped = (step) => skipped?.has(step);

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    if (activeStep === steps.length - 1) {
      console.log('finish');
      localStorage.setItem('register', 'welcome');
      router.push(paths.auth.user.newUserWelcome);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }

    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderComponent = (
    <>
      {activeStep === 0 ? (
        <StepOneUserInfoForm
          userInfoData={userInfoData}
          getUserInfo={getUserInfo}
          router={router}
        />
      ) : (
        ''
      )}
    </>
  );

  return (
    <Stack spacing={2.0}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};

          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <>
          <Paper
            sx={{
              p: 3,
              my: 3,
              minHeight: 120,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
            }}
          >
            <Typography sx={{ my: 1 }}>All steps completed - you&apos;re finished</Typography>

            <Button
              variant="soft"
              color="primary"
              onClick={() => {
                localStorage.setItem('register', 'welcome');
                router.push(paths.auth.user.newUserWelcome);
              }}
            >
              Continue
            </Button>
          </Paper>

          {/* <Box sx={{ display: 'flex' }}>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={handleReset}>Reset</Button>
        </Box> */}
        </>
      ) : (
        <>
          <Paper
            sx={{
              p: 3,
              my: 3,
              minHeight: 120,
              bgcolor: (theme) => alpha(theme.palette.grey[300], 0.12),
            }}
          >
            {renderComponent}
          </Paper>
          <Box sx={{ display: 'flex' }}>
            {/* <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button> */}
            <Box sx={{ flexGrow: 1 }} />
            {/* {isStepOptional(activeStep) && (
            <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
              Skip
            </Button>
          )} */}
            {/* <Button variant="contained" color="primary" onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
            </Button> */}
          </Box>
        </>
      )}
    </Stack>
  );
};

export default NewUserInfoStepper;
