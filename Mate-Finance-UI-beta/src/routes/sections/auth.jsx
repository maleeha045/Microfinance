import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { GuestGuard } from 'src/auth/guard';
import AuthClassicLayout from 'src/layouts/auth/classic';
import AuthModernCompactLayout from 'src/layouts/auth/modern-compact';

import { SplashScreen } from 'src/components/loading-screen';
import AuthWideScreenCompactLayout from 'src/layouts/auth/wide-screen-compact';
import CompactLayout from 'src/layouts/compact';

// ----------------------------------------------------------------------

// JWT
const JwtLoginPage = lazy(() => import('src/pages/auth/jwt/login'));
const JwtRegisterPage = lazy(() => import('src/pages/auth/jwt/register'));
const ForgotPasswordClassicPage = lazy(() => import('src/pages/auth-demo/classic/forgot-password'));
const VerifyClassicPage = lazy(() => import('src/pages/auth-demo/classic/verify'));
const NewPasswordClassicPage = lazy(() => import('src/pages/auth-demo/classic/new-password'));

const NewUserInfoPage = lazy(() => import('src/pages/auth/user/NewUserInfo'));
const NewUserWelcomePage = lazy(() => import('src/pages/auth/user/NewUserWelcome'));
// ----------------------------------------------------------------------

const authJwt = {
  path: 'jwt',
  element: (
    <Suspense fallback={<SplashScreen />}>
      <Outlet />
    </Suspense>
  ),
  children: [
    {
      path: 'login',
      element: (
        <GuestGuard>
          <AuthModernCompactLayout>
            <JwtLoginPage />
          </AuthModernCompactLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'register',
      element: (
        <GuestGuard>
          <AuthModernCompactLayout title="Manage the job more effectively with Minimal">
            <JwtRegisterPage />
          </AuthModernCompactLayout>
        </GuestGuard>
      ),
    },
    {
      element: (
        <CompactLayout>
          <Outlet />
        </CompactLayout>
      ),
      children: [
        { path: 'forgot-password', element: <ForgotPasswordClassicPage /> },
        { path: 'new-password', element: <NewPasswordClassicPage /> },
        { path: 'verify', element: <VerifyClassicPage /> },
      ],
    },
  ],
};

const authUser = {
  path: 'user',
  element: (
    <GuestGuard>
      <Outlet />
    </GuestGuard>
  ),
  children: [
    {
      path: 'new-user-info',
      element: (
        <AuthWideScreenCompactLayout>
          <NewUserInfoPage />
        </AuthWideScreenCompactLayout>
      ),
    },
    {
      path: 'new-user-welcome',
      element: (
        <AuthWideScreenCompactLayout cardBgColor="none">
          <NewUserWelcomePage />
        </AuthWideScreenCompactLayout>
      ),
    },
  ],
};

export const authRoutes = [
  {
    path: 'auth',
    children: [authJwt, authUser],
  },
];
