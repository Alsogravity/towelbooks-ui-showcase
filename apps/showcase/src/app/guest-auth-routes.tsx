import { useEffect } from 'react';
import { type RouteObject } from 'react-router';

import { GuestAuthGate } from './guest-auth-gate';
import { GUEST_AUTH_PATHS } from '../features/auth/authShell';

function DemoEntry() {
  useEffect(() => {
    window.location.replace('/demo');
  }, []);
  return null;
}

// Keep the original landing links, but enter the fictional demo directly.
export const guestAuthBranchRoute: RouteObject = {
  element: <GuestAuthGate />,
  children: GUEST_AUTH_PATHS.map((path) => ({
    path: path.replace(/^\//, ''),
    element: <DemoEntry />,
  })),
};
