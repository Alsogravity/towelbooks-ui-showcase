import {
  ROOM_DESCRIPTION_MAX_LENGTH,
  ROOM_NAME_MAX_LENGTH,
  type Library,
} from '@towelbooks/schemas';
import { z } from 'zod';

type Translate = (
  key: string,
  options?: { fallback?: string; values?: Record<string, number | string> },
) => string;

export function createLibraryEditFormSchema(t: Translate) {
  return z.object({
    name: z.string().max(
      ROOM_NAME_MAX_LENGTH,
      t('libraries.form.validation.nameMax', {
        values: { max: ROOM_NAME_MAX_LENGTH },
      }),
    ),
    description: z
      .string()
      .max(
        ROOM_DESCRIPTION_MAX_LENGTH,
        t('libraries.form.validation.descriptionMax', {
          values: { max: ROOM_DESCRIPTION_MAX_LENGTH },
        }),
      )
      .optional(),
  });
}

export type LibraryEditFormValues = z.infer<
  ReturnType<typeof createLibraryEditFormSchema>
>;

export function getLibraryDisplayName(
  library: Pick<Library, 'isDefault' | 'name'> | null | undefined,
  t: Translate,
  fallbackKey = 'myLibrary.header.title',
) {
  if (!library) {
    return t(fallbackKey);
  }

  const normalizedName = library.name.trim().toLowerCase();

  if (library.isDefault && normalizedName === '') {
    return t(fallbackKey);
  }

  return library.name;
}
