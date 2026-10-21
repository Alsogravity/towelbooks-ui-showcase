import {
  avatarUploadIntentResponseSchema,
  completeAvatarUploadResponseSchema,
  createAvatarUploadIntentRequestSchema,
  type AvatarUploadContentType,
  type AvatarUploadIntentResponse,
  type CompleteAvatarUploadResponse,
  type CreateAvatarUploadIntentRequest,
} from '@towelbooks/schemas';

import { putMediaUpload } from './put-media-upload.js';

import type { Transport } from '../transport.js';

export type UsersMeAvatarResource = {
  createUploadIntent(
    body: CreateAvatarUploadIntentRequest,
  ): Promise<AvatarUploadIntentResponse>;
  putUpload(
    intent: AvatarUploadIntentResponse,
    body: Blob | ArrayBuffer,
  ): Promise<void>;
  completeUpload(intentToken: string): Promise<CompleteAvatarUploadResponse>;
  clear(): Promise<CompleteAvatarUploadResponse>;
  upload(
    file: Blob,
    meta: {
      contentType: AvatarUploadContentType;
      sizeBytes: number;
    },
  ): Promise<CompleteAvatarUploadResponse>;
};

export function createUsersMeAvatarResource(
  transport: Transport,
): UsersMeAvatarResource {
  return {
    createUploadIntent(body) {
      return transport.request({
        body: createAvatarUploadIntentRequestSchema.parse(body),
        method: 'POST',
        path: '/me/avatar/uploads',
        schema: avatarUploadIntentResponseSchema,
      });
    },
    putUpload(intent, body) {
      return putMediaUpload(transport, intent.upload, body);
    },
    completeUpload(intentToken) {
      return transport.request({
        method: 'POST',
        path: `/me/avatar/uploads/${encodeURIComponent(intentToken)}/complete`,
        schema: completeAvatarUploadResponseSchema,
      });
    },
    clear() {
      return transport.request({
        method: 'DELETE',
        path: '/me/avatar',
        schema: completeAvatarUploadResponseSchema,
      });
    },
    async upload(file, meta) {
      const intent = await this.createUploadIntent({
        contentType: meta.contentType,
        sizeBytes: meta.sizeBytes,
      });

      await this.putUpload(intent, file);

      return this.completeUpload(intent.uploadIntentToken);
    },
  };
}
