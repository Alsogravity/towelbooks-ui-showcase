import { useEffect } from 'react';
import { type RouteObject } from 'react-router';

import { GuestAuthGate } from './guest-auth-gate';
import { lazyNamedPage } from './lazy-page';
import { GUEST_AUTH_PATHS } from '../features/auth/authShell';
import { AuthLayout } from '../layouts/AuthLayout';

const LoginPage = lazyNamedPage(
  () => import('../pages/auth/login/LoginPage'),
  'LoginPage',
);
const RegisterPage = lazyNamedPage(
  () => import('../pages/auth/register/RegisterPage'),
  'RegisterPage',
);

function DemoEntry() {
  useEffect(() => {
    window.location.replace('/demo');
  }, []);
  return null;
}

export const guestAuthBranchRoute: RouteObject = {
  element: <GuestAuthGate />,
  children: [
    {
      element: <AuthLayout />,
      children: [
        { path: 'login', element: <LoginPage /> },
        {
          path: 'register',
          element: <RegisterPage />,
          handle: { authShell: 'full' },
        },
      ],
    },
    ...GUEST_AUTH_PATHS.filter(
      (path) => path !== '/login' && path !== '/register',
    ).map((path) => ({
      path: path.replace(/^\//, ''),
      element: <DemoEntry />,
    })),
  ],
};
