import type { ReactElement } from 'react';

import type { IconName } from '../primitives';
import { BuyIllustration } from './BuyIllustration';
import { CatalogIllustration } from './CatalogIllustration';
import { RoomsIllustration } from './RoomsIllustration';
import { LibrariesIllustration } from './LibrariesIllustration';
import { ReflectionsIllustration } from './ReflectionsIllustration';
import { SpoilersIllustration } from './SpoilersIllustration';
import type { IllustrationProps } from './svgBase';

const ILLUSTRATIONS: Partial<
  Record<IconName, (p: IllustrationProps) => ReactElement>
> = {
  library: LibrariesIllustration,
  'users-round': RoomsIllustration,
  feather: ReflectionsIllustration,
  'eye-off': SpoilersIllustration,
  'book-open': CatalogIllustration,
  'external-link': BuyIllustration,
};

/** Decorative corner illustration for a landing feature card, keyed by icon name. */
export function FeatureIllustration({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const Illustration = ILLUSTRATIONS[name];

  if (!Illustration) {
    return null;
  }

  return <Illustration className={className} />;
}
