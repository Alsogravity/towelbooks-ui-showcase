import { z } from 'zod';

/**
 * Payments & billing shared contracts.
 *
 * Security note: these request schemas intentionally carry NO price, currency,
 * amount, plan-amount, or entitlement-target authorization. The backend resolves
 * every chargeable product from server-side records (the payment catalog) and
 * derives the entitlement target from the authenticated caller. The client only
 * names a `productKey` and a coarse target; the server decides everything that
 * costs money or grants access.
 */

/** Entitlement kinds the ledger can grant. Mirrors the Prisma enum. */
export const entitlementTypeSchema = z.enum([
  'room_paid_access',
  'platform_subscription',
]);
export type EntitlementType = z.infer<typeof entitlementTypeSchema>;

/** Billing cadence for a catalog product. `one_time` is a single charge. */
export const billingIntervalSchema = z.enum(['one_time', 'month', 'year']);
export type BillingInterval = z.infer<typeof billingIntervalSchema>;

/**
 * Stable product identifiers resolved server-side to an authoritative price and
 * entitlement effect. Kept as a closed union so the catalog, checkout resolver,
 * and frontend share one source of truth and an unknown key is rejected before
 * any provider call. Per-room custom pricing is a planned follow-up that will
 * resolve a `room_access_*` key against a room price record instead of a static
 * catalog entry — the request contract does not change when that lands.
 */
export const paymentProductKeySchema = z.enum([
  // Platform owner subscription tiers (raise room quotas).
  'platform_pro_monthly',
  'platform_pro_yearly',
  // Default paid room access (one membership period).
  'room_access_monthly',
]);
export type PaymentProductKey = z.infer<typeof paymentProductKeySchema>;

/** ISO-4217 alpha-3, uppercased. */
export const currencyCodeSchema = z
  .string()
  .trim()
  .length(3)
  .regex(/^[A-Z]{3}$/u, 'Currency must be an ISO-4217 alpha-3 code.');
export type CurrencyCode = z.infer<typeof currencyCodeSchema>;

/**
 * A catalog product as resolved by the backend. Amounts are integer minor units
 * (e.g. cents) to avoid floating point. This is never accepted from the client;
 * it is the server's answer to "what does this product cost and grant".
 */
export const paymentCatalogProductSchema = z
  .object({
    productKey: paymentProductKeySchema,
    entitlementType: entitlementTypeSchema,
    interval: billingIntervalSchema,
    amountMinor: z.number().int().nonnegative(),
    currency: currencyCodeSchema,
  })
  .strict();
export type PaymentCatalogProduct = z.infer<typeof paymentCatalogProductSchema>;

/**
 * Checkout target. For `room_paid_access` the caller names the room; for
 * `platform_subscription` the target is the caller themselves (`self`). The
 * server still authorizes that the caller may purchase for this target.
 */
export const checkoutTargetSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('room'),
      roomId: z.string().uuid(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('self'),
    })
    .strict(),
]);
export type CheckoutTarget = z.infer<typeof checkoutTargetSchema>;

/**
 * Create-checkout-session request. Note the deliberate absence of price,
 * currency, customer id, or success-grant fields.
 */
export const createCheckoutSessionRequestSchema = z
  .object({
    productKey: paymentProductKeySchema,
    target: checkoutTargetSchema,
  })
  .strict();
export type CreateCheckoutSessionRequest = z.infer<
  typeof createCheckoutSessionRequestSchema
>;

/** Response: an opaque provider-hosted URL the client redirects to. */
export const createCheckoutSessionResponseSchema = z
  .object({
    checkoutUrl: z.string().url(),
  })
  .strict();
export type CreateCheckoutSessionResponse = z.infer<
  typeof createCheckoutSessionResponseSchema
>;

/** Billing portal request carries no body fields the client can abuse. */
export const createBillingPortalSessionRequestSchema = z.object({}).strict();
export type CreateBillingPortalSessionRequest = z.infer<
  typeof createBillingPortalSessionRequestSchema
>;

export const createBillingPortalSessionResponseSchema = z
  .object({
    portalUrl: z.string().url(),
  })
  .strict();
export type CreateBillingPortalSessionResponse = z.infer<
  typeof createBillingPortalSessionResponseSchema
>;
