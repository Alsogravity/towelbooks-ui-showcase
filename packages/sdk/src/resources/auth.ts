import {
  activeLegalDocumentsResponseSchema,
  cancelAccountDeletionResponseSchema,
  confirmAccountDeletionResponseSchema,
  forgotPasswordResponseSchema,
  googleCompleteRegistrationResponseSchema,
  googleOnboardingContextResponseSchema,
  googleLinkChallengeResponseSchema,
  googleLinkStartResponseSchema,
  googleUnlinkResponseSchema,
  loginResponseSchema,
  logoutResponseSchema,
  reactivateAccountResponseSchema,
  refreshResponseSchema,
  registerResponseSchema,
  resendVerificationEmailResponseSchema,
  resetPasswordResponseSchema,
  verifyEmailResponseSchema,
  reactivationContextResponseSchema,
  oauthReactivationConfirmResponseSchema,
  abandonReactivationResponseSchema,
  type ActiveLegalDocumentsResponse,
  type CancelAccountDeletionRequest,
  type CancelAccountDeletionResponse,
  type ConfirmAccountDeletionRequest,
  type ConfirmAccountDeletionResponse,
  type ForgotPasswordRequest,
  type ForgotPasswordResponse,
  type GoogleCompleteRegistrationRequest,
  type GoogleCompleteRegistrationResponse,
  type GoogleOnboardingContextResponse,
  type GoogleLinkChallengeRequest,
  type GoogleLinkChallengeResponse,
  type GoogleLinkStartResponse,
  type GoogleUnlinkResponse,
  type LoginRequest,
  type LoginResponse,
  type LogoutResponse,
  type ReactivateAccountRequest,
  type ReactivateAccountResponse,
  type RefreshResponse,
  type RegisterRequest,
  type RegisterResponse,
  type ResendVerificationEmailRequest,
  type ResendVerificationEmailResponse,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
  type VerifyEmailRequest,
  type VerifyEmailResponse,
  type ReactivationContextResponse,
  type OAuthReactivationConfirmResponse,
  type AbandonReactivationResponse,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type AuthResource = {
  getActiveLegalDocuments(): Promise<ActiveLegalDocumentsResponse>;
  googleCompleteRegistration(
    body: GoogleCompleteRegistrationRequest,
    onboardingToken: string,
  ): Promise<GoogleCompleteRegistrationResponse>;
  googleGetOnboarding(
    onboardingToken: string,
  ): Promise<GoogleOnboardingContextResponse>;
  googleGetOnboardingAvatar(onboardingToken: string): Promise<Blob>;
  googleLinkChallenge(
    body: GoogleLinkChallengeRequest,
  ): Promise<GoogleLinkChallengeResponse>;
  googleLinkStart(): Promise<GoogleLinkStartResponse>;
  googleAccountDeletionReauthStart(): Promise<GoogleLinkStartResponse>;
  googleUnlink(): Promise<GoogleUnlinkResponse>;
  login(body: LoginRequest): Promise<LoginResponse>;
  reactivateAccount(
    body: ReactivateAccountRequest,
  ): Promise<ReactivateAccountResponse>;
  register(body: RegisterRequest): Promise<RegisterResponse>;
  refresh(): Promise<RefreshResponse>;
  logout(): Promise<LogoutResponse>;
  logoutAll(): Promise<LogoutResponse>;
  verifyEmail(body: VerifyEmailRequest): Promise<VerifyEmailResponse>;
  resendVerificationEmail(
    body: ResendVerificationEmailRequest,
  ): Promise<ResendVerificationEmailResponse>;
  forgotPassword(body: ForgotPasswordRequest): Promise<ForgotPasswordResponse>;
  resetPassword(body: ResetPasswordRequest): Promise<ResetPasswordResponse>;
  confirmAccountDeletion(
    body: ConfirmAccountDeletionRequest,
  ): Promise<ConfirmAccountDeletionResponse>;
  cancelAccountDeletion(
    body: CancelAccountDeletionRequest,
  ): Promise<CancelAccountDeletionResponse>;
  getReactivationContext(): Promise<ReactivationContextResponse>;
  confirmReactivationViaOauth(): Promise<OAuthReactivationConfirmResponse>;
  abandonReactivation(): Promise<AbandonReactivationResponse>;
};

export function createAuthResource(transport: Transport): AuthResource {
  return {
    getActiveLegalDocuments() {
      return transport.request({
        method: 'GET',
        path: '/legal/documents/active',
        schema: activeLegalDocumentsResponseSchema,
      });
    },
    googleCompleteRegistration(body, onboardingToken) {
      return transport.request({
        method: 'POST',
        path: '/auth/google/complete-registration',
        body,
        headers: { Authorization: `Bearer ${onboardingToken}` },
        schema: googleCompleteRegistrationResponseSchema,
      });
    },
    googleGetOnboarding(onboardingToken) {
      return transport.request({
        method: 'GET',
        path: '/auth/google/onboarding',
        headers: { Authorization: `Bearer ${onboardingToken}` },
        schema: googleOnboardingContextResponseSchema,
      });
    },
    googleGetOnboardingAvatar(onboardingToken) {
      return transport.requestBinary({
        method: 'GET',
        path: '/auth/google/onboarding/avatar',
        headers: { Authorization: `Bearer ${onboardingToken}` },
      });
    },
    googleLinkChallenge(body) {
      return transport.request({
        method: 'POST',
        path: '/auth/google/link-challenge',
        body,
        schema: googleLinkChallengeResponseSchema,
      });
    },
    googleLinkStart() {
      return transport.request({
        method: 'POST',
        path: '/auth/google/link/start',
        schema: googleLinkStartResponseSchema,
      });
    },
    googleAccountDeletionReauthStart() {
      return transport.request({
        method: 'POST',
        path: '/auth/google/account-deletion/reauth-start',
        schema: googleLinkStartResponseSchema,
      });
    },
    googleUnlink() {
      return transport.request({
        method: 'DELETE',
        path: '/auth/google',
        schema: googleUnlinkResponseSchema,
      });
    },
    login(body) {
      return transport.request({
        method: 'POST',
        path: '/auth/login',
        body,
        schema: loginResponseSchema,
      });
    },
    reactivateAccount(body) {
      return transport.request({
        method: 'POST',
        path: '/auth/reactivate-account',
        body,
        schema: reactivateAccountResponseSchema,
      });
    },
    register(body) {
      return transport.request({
        method: 'POST',
        path: '/auth/register',
        body,
        schema: registerResponseSchema,
      });
    },
    refresh() {
      return transport.request({
        method: 'POST',
        path: '/auth/refresh',
        schema: refreshResponseSchema,
      });
    },
    logout() {
      return transport.request({
        method: 'POST',
        path: '/auth/logout',
        schema: logoutResponseSchema,
      });
    },
    logoutAll() {
      return transport.request({
        method: 'POST',
        path: '/auth/logout-all',
        schema: logoutResponseSchema,
      });
    },
    verifyEmail(body) {
      return transport.request({
        method: 'POST',
        path: '/auth/verify-email',
        body,
        schema: verifyEmailResponseSchema,
      });
    },
    resendVerificationEmail(body) {
      return transport.request({
        method: 'POST',
        path: '/auth/resend-verification-email',
        body,
        schema: resendVerificationEmailResponseSchema,
      });
    },
    forgotPassword(body) {
      return transport.request({
        method: 'POST',
        path: '/auth/forgot-password',
        body,
        schema: forgotPasswordResponseSchema,
      });
    },
    resetPassword(body) {
      return transport.request({
        method: 'POST',
        path: '/auth/reset-password',
        body,
        schema: resetPasswordResponseSchema,
      });
    },
    confirmAccountDeletion(body) {
      return transport.request({
        method: 'POST',
        path: '/me/account-deletion/confirm',
        body,
        schema: confirmAccountDeletionResponseSchema,
      });
    },
    cancelAccountDeletion(body) {
      return transport.request({
        method: 'POST',
        path: '/me/account-deletion/cancel',
        body,
        schema: cancelAccountDeletionResponseSchema,
      });
    },
    getReactivationContext() {
      return transport.request({
        method: 'GET',
        path: '/auth/google/reactivation-context',
        schema: reactivationContextResponseSchema,
      });
    },
    confirmReactivationViaOauth() {
      return transport.request({
        method: 'POST',
        path: '/auth/google/confirm-reactivation',
        schema: oauthReactivationConfirmResponseSchema,
      });
    },
    abandonReactivation() {
      return transport.request({
        method: 'POST',
        path: '/auth/google/abandon-reactivation',
        schema: abandonReactivationResponseSchema,
      });
    },
  };
}
