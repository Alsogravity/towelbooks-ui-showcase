import { Link } from 'react-router';

import { Icon } from '../primitives';

export type BackLinkProps = {
  label: string;
  to: string;
};

export function BackLink({ label, to }: BackLinkProps) {
  return (
    <div className="mb-10 hidden lg:block">
      <Link
        to={to}
        className="group inline-flex items-center gap-2 text-sm font-medium text-ink-3 transition-colors hover:text-brick"
      >
        <Icon
          name="chevron-left"
          className="h-4 w-4 transition-transform group-hover:-translate-x-1"
        />
        {label}
      </Link>
    </div>
  );
}
