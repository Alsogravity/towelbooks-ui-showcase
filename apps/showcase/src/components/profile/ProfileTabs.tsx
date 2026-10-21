import { Tabs, type Tab, type TabsProps } from '../primitives/Tabs';

export type ProfileTab<TKey extends string = string> = Tab<TKey>;

export interface ProfileTabsProps<TKey extends string = string> extends Omit<
  TabsProps<TKey>,
  'ariaLabel' | 'className'
> {
  tabs: ProfileTab<TKey>[];
}

export function ProfileTabs<TKey extends string = string>({
  tabs,
  activeKey,
  onChange,
  idPrefix = 'profile-tab',
}: ProfileTabsProps<TKey>) {
  return (
    <Tabs
      tabs={tabs}
      activeKey={activeKey}
      onChange={onChange}
      idPrefix={idPrefix}
      ariaLabel="Profile sections"
      className="profile-tabs-scrollbar-hidden"
    />
  );
}
