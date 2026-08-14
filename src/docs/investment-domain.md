/**
 * # FundIt investment domain
 *
 * FundIt's final investment instrument (equity, debt, revenue-share, etc.) and
 * production payment provider have **not** been finalized by the client.
 *
 * Phase 4 implements an extensible architecture:
 *
 * - Project (content) is separate from InvestmentOpportunity (terms)
 * - Investment is separate from PaymentOrder / PaymentTransaction
 * - Payments go through a PaymentProvider abstraction
 * - Development uses MockPaymentProvider only (`PAYMENT_PROVIDER=mock`)
 *
 * Do not invent equity percentages, ROI, interest rates, or legal/KYC flows
 * until the client provides explicit requirements.
 *
 * ## MongoDB transactions
 *
 * Payment confirmation prefers replica-set transactions when available.
 * Standalone local MongoDB falls back to ordered idempotent writes.
 * Production deployments should use a replica set (or Atlas) for multi-document
 * transactional safety.
 */
