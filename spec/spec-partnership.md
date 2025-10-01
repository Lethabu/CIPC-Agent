# spec: Partnership Platform v1

**Status:** Proposed

**Objective:** To create a self-service platform that enables accounting firms to become resellers, track their client referrals, and monitor their commission earnings, creating a scalable B2B acquisition channel.

## Specification

### Requirement PP-01: Partner Onboarding

There MUST be a new Typebot flow for partner sign-up. This flow will collect the firm's details and require them to agree to the Partner Terms of Service.

### Requirement PP-02: Secure Authentication

Partners MUST log in to their dashboard using a secure method (e.g., passwordless "magic link" sent to their email).

### Requirement PP-03: Unique Referral Link

Upon onboarding, each partner MUST be assigned a unique referral link (e.g., `www.cipcagent.co.za?ref=partner_id`).

### Requirement PP-04: Referral Tracking

When a new SMME signs up using a referral link, they MUST be correctly attributed to the referring partner in the database.

### Requirement PP-05: Commission Calculation

A daily or weekly batch job MUST calculate the commission (e.g., 20% of revenue) earned by each partner from their referred clients' successful PAYG transactions and subscription payments.

### Requirement PP-06: The Dashboard

The v1 Partner Dashboard MUST be a simple, secure web interface that displays:

- Their unique referral link.
- A list of the clients they have referred.
- Their total commission earned (pending and paid).

## Verification Plan

- `verify-PP-03`: A newly onboarded partner MUST be able to see and copy their unique referral link from the dashboard.
- `verify-PP-04`: A test sign-up using a partner's referral link MUST correctly populate the `referred_by_partner_id` column in the new user's database record.
- `verify-PP-06`: A partner logging into the dashboard MUST only be able to see data related to their own referrals.