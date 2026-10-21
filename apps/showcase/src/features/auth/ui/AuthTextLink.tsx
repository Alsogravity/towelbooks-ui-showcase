import { Link, type LinkProps } from 'react-router';

import { GUEST_LOGIN_PATH } from '../../../lib/origins';

export function AuthTextLink({ className = '', ...props }: LinkProps) {
  return (
    <Link
      className={`supporting-copy text-ink-3 underline underline-offset-2 hover:text-ink ${className}`}
      {...props}
    />
  );
}

type AuthSignInLinkProps = Omit<LinkProps, 'to'> & {
  to?: LinkProps['to'];
};

/** Guest sign-in link; defaults to the canonical login route (`/login`). */
export function AuthSignInLink({
  to = GUEST_LOGIN_PATH,
  className = '',
  ...props
}: AuthSignInLinkProps) {
  return <AuthTextLink className={className} to={to} {...props} />;
}
