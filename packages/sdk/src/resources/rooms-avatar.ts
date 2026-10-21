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

export type RoomsAvatarResource = {
  createUploadIntent(
    roomId: string,
    body: CreateAvatarUploadIntentRequest,
  ): Promise<AvatarUploadIntentResponse>;
  putUpload(
    intent: AvatarUploadIntentResponse,
    body: Blob | ArrayBuffer,
  ): Promise<void>;
  completeUpload(
    roomId: string,
    intentToken: string,
  ): Promise<CompleteAvatarUploadResponse>;
  clear(roomId: string): Promise<CompleteAvatarUploadResponse>;
  upload(
    roomId: string,
    file: Blob,
    meta: {
      contentType: AvatarUploadContentType;
      sizeBytes: number;
    },
  ): Promise<CompleteAvatarUploadResponse>;
};

export function createRoomsAvatarResource(
  transport: Transport,
): RoomsAvatarResource {
  return {
    createUploadIntent(roomId, body) {
      return transport.request({
        body: createAvatarUploadIntentRequestSchema.parse(body),
        method: 'POST',
        path: '/rooms/:roomId/avatar/uploads',
        pathParams: { roomId },
        schema: avatarUploadIntentResponseSchema,
      });
    },
    putUpload(intent, body) {
      return putMediaUpload(transport, intent.upload, body);
    },
    completeUpload(roomId, intentToken) {
      return transport.request({
        method: 'POST',
        path: '/rooms/:roomId/avatar/uploads/:intentToken/complete',
        pathParams: { roomId, intentToken },
        schema: completeAvatarUploadResponseSchema,
      });
    },
    clear(roomId) {
      return transport.request({
        method: 'DELETE',
        path: '/rooms/:roomId/avatar',
        pathParams: { roomId },
        schema: completeAvatarUploadResponseSchema,
      });
    },
    async upload(roomId, file, meta) {
      const intent = await this.createUploadIntent(roomId, {
        contentType: meta.contentType,
        sizeBytes: meta.sizeBytes,
      });

      await this.putUpload(intent, file);

      return this.completeUpload(roomId, intent.uploadIntentToken);
    },
  };
}
