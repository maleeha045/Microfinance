import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { Stack, Typography } from '@mui/material';

import { styled, alpha, useTheme } from '@mui/material/styles';

import Header from '../common/header-simple';

import { m, useScroll } from 'framer-motion';

import { textGradient, bgGradient, bgBlur } from 'src/theme/css';
import { useResponsive } from 'src/hooks/use-responsive';
import Logo from 'src/components/logo';
import { varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const StyledTextGradient = styled(m.h1)(({ theme }) => ({
  ...textGradient(
    `300deg, ${theme.palette.primary.darker} 0%, ${theme.palette.primary.lighter} 25%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 75%, ${theme.palette.primary.main} 100%`
  ),
  padding: 0,
  marginTop: 0,
  lineHeight: 1,
  marginBottom: 8,
  letterSpacing: 5,
  textAlign: 'center',
  backgroundSize: '400%',
  fontSize: `${64 / 16}rem`,
  fontFamily: "'Barlow', sans-serif",
  [theme.breakpoints.up('md')]: {
    fontSize: `${96 / 25}rem`,
  },
}));

export default function AuthModernCompactLayout({ children }) {
  const theme = useTheme();

  const upMd = useResponsive('up', 'md');

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: 600,
        px: { xs: 2, md: 10 },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Logo sx={{ width: 250 }} />
      </Box>

      <Card
        sx={{
          py: { xs: 5, md: 0 },
          px: { xs: 3, md: 0 },
          boxShadow: { md: 'none' },
          overflow: { md: 'unset' },
        }}
      >
        {children}
      </Card>
    </Stack>
  );

  const renderSection = (
    <Stack
      flexGrow={1}
      alignItems="center"
      justifyContent="center"
      spacing={5}
      sx={{
        position: 'relative',
        backgroundColor: '#e1d3e3',
        ...bgGradient({
          color: alpha(
            theme.palette.background.default,
            theme.palette.mode === 'light' ? 0.88 : 0.94
          ),
          // imgUrl: '/assets/background/overlay_2.jpg',
        }),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          mt: 2,
        }}
      >
        <Box sx={{ flexGrow: 1, flexDirection: 'column' }}>
          <m.div variants={varFade().in}>
            <StyledTextGradient
              animate={{ backgroundPosition: '200% center' }}
              transition={{
                repeatType: 'reverse',
                ease: 'linear',
                duration: 20,
                repeat: Infinity,
              }}
            >
              Invoice Mate
            </StyledTextGradient>
          </m.div>

          <Typography
            variant="subtitle1"
            sx={{ textAlign: 'center', color: 'primary.dark', opacity: 0.64 }}
          >
            {/* {subTitle} */}
            Unlock the power of financing
          </Typography>
        </Box>
      </Box>

      <video
        style={{ height: '100%', width: '100%', maxWidth: 650 }}
        muted
        autoPlay="autoplay"
        preLoad="auto"
        loop
      >
        <source
          src="https://invoicemate.blob.core.windows.net/im-lite-dev/resources-lite/IM%20Lite%20Ani%201.mp4?st=2023-08-11T12:08:19Z&se=2024-12-30T20:08:19Z&si=ReadOnly&spr=https&sv=2022-11-02&sr=c&sig=reG7agEqCR4DNODW6srj1J9ze%2B6y52BmrvgUkTf04z0%3D"
          type="video/mp4"
        />
      </video>
    </Stack>
  );

  return (
    <>
      <Stack
        component="main"
        direction="row"
        sx={{
          minHeight: '100vh',
          position: 'relative',
          '&:before': {
            width: 1,
            height: 1,
            zIndex: -1,
            content: "''",
            opacity: { xs: 0.24, md: 0 },
            position: 'absolute',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundImage: 'url(/assets/background/overlay_4.jpg)',
          },
        }}
      >
        {renderContent}

        {upMd && renderSection}
      </Stack>
    </>
  );
}

AuthModernCompactLayout.propTypes = {
  children: PropTypes.node,
};
