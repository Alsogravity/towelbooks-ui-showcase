import { useCallback, useEffect, useMemo, useState } from 'react';

import type { BannerImageUrls } from '@towelbooks/schemas';
import type { BannerActiveSource } from '../../../features/banner-presets';
import type { RoomDetail } from '../../../features/rooms/types';

export type BannerSelection =
  | {
      file: File;
      kind: 'pending-upload';
      previewUrl: string;
    }
  | {
      kind: 'pending-remove';
    };

export function useRoomSettingsBannerDraft(room?: RoomDetail) {
  const baseHasBannerImage = Boolean(room?.bannerImage?.imageUrl);

  const [bannerSelection, setBannerSelection] =
    useState<BannerSelection | null>(null);
  const [bannerActiveSource, setBannerActiveSource] =
    useState<BannerActiveSource>(() =>
      baseHasBannerImage ? 'custom' : 'preset',
    );

  useEffect(() => {
    if (bannerSelection?.kind !== 'pending-upload') {
      return;
    }

    const { previewUrl } = bannerSelection;

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [bannerSelection]);

  // Picker keeps a saved/pending custom image available so the user can
  // re-activate it after Remove (before Save) or after choosing a preset.
  const availableBannerImageUrl = useMemo(() => {
    if (!room) {
      return null;
    }

    if (bannerSelection?.kind === 'pending-upload') {
      return bannerSelection.previewUrl;
    }

    return room.bannerImage?.imageUrl ?? null;
  }, [bannerSelection, room]);

  const availableBannerImageUrls: BannerImageUrls | null =
    bannerSelection?.kind === 'pending-upload'
      ? null
      : (room?.bannerImage?.imageUrls ?? null);

  const isCustomBannerActive =
    bannerActiveSource === 'custom' &&
    bannerSelection?.kind !== 'pending-remove' &&
    Boolean(availableBannerImageUrl);

  const previewBannerImageUrl = isCustomBannerActive
    ? availableBannerImageUrl
    : null;

  const previewBannerImageUrls: BannerImageUrls | null = isCustomBannerActive
    ? availableBannerImageUrls
    : null;

  const handleBannerSelect = useCallback((file: File, previewUrl: string) => {
    setBannerSelection({ file, kind: 'pending-upload', previewUrl });
    setBannerActiveSource('custom');
  }, []);

  const handleBannerSelectCustom = useCallback(() => {
    setBannerSelection((current) =>
      current?.kind === 'pending-remove' ? null : current,
    );
    setBannerActiveSource('custom');
  }, []);

  const resetBannerDraft = useCallback(() => {
    setBannerSelection(null);
    setBannerActiveSource(baseHasBannerImage ? 'custom' : 'preset');
  }, [baseHasBannerImage]);

  const handleBannerRemove = useCallback(() => {
    if (bannerSelection?.kind === 'pending-upload') {
      setBannerSelection(
        baseHasBannerImage ? { kind: 'pending-remove' } : null,
      );
      setBannerActiveSource('preset');
      return;
    }

    setBannerSelection(baseHasBannerImage ? { kind: 'pending-remove' } : null);
    setBannerActiveSource('preset');
  }, [bannerSelection, baseHasBannerImage]);

  const handleBannerActivatePreset = useCallback(() => {
    setBannerActiveSource('preset');
  }, []);

  return {
    availableBannerImageUrl,
    availableBannerImageUrls,
    bannerActiveSource,
    bannerSelection,
    handleBannerActivatePreset,
    handleBannerRemove,
    handleBannerSelect,
    handleBannerSelectCustom,
    previewBannerImageUrl,
    previewBannerImageUrls,
    resetBannerDraft,
  };
}
