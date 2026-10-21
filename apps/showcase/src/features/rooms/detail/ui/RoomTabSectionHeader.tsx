import type { ReactNode } from 'react';

import { SectionHeaderWithIcon } from '../../../../components/layout';

import type { IconName } from '@towelbooks/ui';

type RoomTabSectionHeaderProps = {
  actions?: ReactNode;
  className?: string;
  icon: IconName;
  title: string;
};

export function RoomTabSectionHeader({
  actions,
  className = '',
  icon,
  title,
}: RoomTabSectionHeaderProps) {
  return (
    <SectionHeaderWithIcon
      actions={actions}
      className={className}
      icon={icon}
      title={title}
    />
  );
}
