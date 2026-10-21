import type { AvatarUploadDescriptor } from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

/**
 * PUT/POST raw bytes to a signed upload target from an avatar or banner intent.
 * Avatar and banner intents share the same upload descriptor shape.
 */
export function putMediaUpload(
  transport: Transport,
  upload: AvatarUploadDescriptor,
  body: Blob | ArrayBuffer,
): Promise<void> {
  if (upload.kind === 'put-url') {
    return transport.putExternal({
      body,
      headers: upload.headers,
      method: 'PUT',
      url: upload.url,
    });
  }

  return transport.postExternalForm({
    body,
    fields: upload.formFields,
    fileFieldName: 'file',
    url: upload.url,
  });
}
