import { useCallback, useSyncExternalStore } from 'react';

import {
  browserStorageKeys,
  readStoredSidebarBehaviorPreference,
  writeStoredSidebarBehaviorPreference,
  type SidebarBehaviorStorageValue,
} from '../../lib/browserStorage';

import type { IconName } from '../../components/primitives';

export type SidebarBehaviorPreference = SidebarBehaviorStorageValue;

export type SidebarBehaviorPreferenceOption = {
  iconName: IconName;
  labelKey: string;
  value: SidebarBehaviorPreference;
};

export const sidebarBehaviorPreferenceStorageKey =
  browserStorageKeys.sidebarBehaviorPreference;

export const sidebarBehaviorPreferenceOptions = [
  {
    value: 'expanded',
    iconName: 'list',
    labelKey: 'settings.preferences.sidebar.expanded',
  },
  {
    value: 'collapsed',
    iconName: 'ellipsis-vertical',
    labelKey: 'settings.preferences.sidebar.collapsed',
  },
  {
    value: 'hover',
    iconName: 'logs',
    labelKey: 'settings.preferences.sidebar.hover',
  },
] as const satisfies readonly SidebarBehaviorPreferenceOption[];

const sidebarBehaviorSubscribers = new Set<() => void>();

function emitSidebarBehaviorChange() {
  sidebarBehaviorSubscribers.forEach((callback) => callback());
}

function getCurrentSidebarBehaviorPreference(): SidebarBehaviorPreference {
  return readStoredSidebarBehaviorPreference();
}

function subscribeToSidebarBehaviorPreference(callback: () => void) {
  sidebarBehaviorSubscribers.add(callback);

  if (typeof window === 'undefined') {
    return () => {
      sidebarBehaviorSubscribers.delete(callback);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== sidebarBehaviorPreferenceStorageKey) {
      return;
    }

    callback();
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    sidebarBehaviorSubscribers.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
}

export function setSidebarBehaviorPreference(
  preference: SidebarBehaviorPreference,
) {
  writeStoredSidebarBehaviorPreference(preference);
  emitSidebarBehaviorChange();
}

export function useSidebarBehaviorPreference() {
  const sidebarBehaviorPreference =
    useSyncExternalStore<SidebarBehaviorPreference>(
      subscribeToSidebarBehaviorPreference,
      getCurrentSidebarBehaviorPreference,
      () => 'expanded',
    );

  const setPreference = useCallback((preference: SidebarBehaviorPreference) => {
    setSidebarBehaviorPreference(preference);
  }, []);

  return {
    setSidebarBehaviorPreference: setPreference,
    sidebarBehaviorPreference,
  };
}
