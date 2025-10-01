# spec: PAYG Payment Workflow (Ozow & Stripe)

## Status
Proposed

## Objective
To create a secure, reliable, and seamless payment workflow that allows users to pay for a single filing and triggers the automated compliance process upon successful payment.

## Specification

### Requirement PAYG-01: Initiation
The payment process MUST be initiated from the Typebot funnel. After a user agrees to a filing (e.g., "File Annual Return for R199"), Typebot MUST call a backend endpoint `/api/v1/payments/initiate`.

### Requirement PAYG-02: Payment Link Generation
The backend MUST generate a unique, one-time payment link using the **Ozow or Stripe API**. The transaction amount MUST be calculated based on the service type and any dynamic pricing rules (e.g., urgency fees).

### Requirement PAYG-03: User Redirect
Typebot MUST receive the payment link from the backend and redirect the user to the secure payment page.

### Requirement PAYG-04: Webhook Confirmation
The backend MUST expose a secure webhook endpoint (`/api/v1/payments/webhook`) to receive success or failure notifications from Ozow/Stripe. This webhook MUST be idempotent (i.e., processing the same notification multiple times has no unintended side effects).

### Requirement PAYG-05: Workflow Trigger
Upon receiving a successful payment notification, the webhook handler MUST trigger the appropriate **Temporal Workflow** (e.g., `AnnualReturnWorkflow`) with the client's data.

## Verification Plan

- `verify-PAYG-01`: A test that simulates a Typebot call to `/api/v1/payments/initiate` MUST return a valid Ozow/Stripe payment URL.
- `verify-PAYG-04`: Sending a test webhook from the Ozow/Stripe developer dashboard MUST be successfully received and logged by the backend.
- `verify-PAYG-05`: A successful payment webhook MUST result in a new workflow execution being visible in the Temporal UI with the correct parameters.